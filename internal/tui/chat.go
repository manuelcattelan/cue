package tui

import (
	"context"
	"fmt"
	"strings"

	"github.com/charmbracelet/bubbles/textarea"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"cue/internal/providers"
	"cue/internal/storage"
)

type streamChunkMsg string
type streamDoneMsg struct{}
type streamErrorMsg error

type Model struct {
	viewport       viewport.Model
	textarea       textarea.Model
	messages       []providers.Message
	provider       providers.Provider
	providerName   string
	modelName      string
	db             *storage.DB
	conversationID int64
	streaming      bool
	currentReply   string
	err            error
}

func NewModel(provider providers.Provider, providerName, modelName string, db *storage.DB, conversationID int64) Model {
	ta := textarea.New()
	ta.Placeholder = "Type your message..."
	ta.Focus()
	ta.CharLimit = 0
	ta.SetWidth(80)
	ta.SetHeight(3)

	vp := viewport.New(80, 20)

	return Model{
		viewport:       vp,
		textarea:       ta,
		provider:       provider,
		providerName:   providerName,
		modelName:      modelName,
		db:             db,
		conversationID: conversationID,
		messages:       []providers.Message{},
	}
}

func (m Model) Init() tea.Cmd {
	return textarea.Blink
}

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmds []tea.Cmd
	var cmd tea.Cmd

	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyCtrlC:
			return m, tea.Quit
		case tea.KeyEnter:
			if !m.streaming && m.textarea.Value() != "" {
				userMsg := m.textarea.Value()
				m.messages = append(m.messages, providers.Message{
					Role:    "user",
					Content: userMsg,
				})

				if err := m.db.SaveMessage(m.conversationID, "user", userMsg); err != nil {
					m.err = err
				}

				m.textarea.Reset()
				m.streaming = true
				m.currentReply = ""

				return m, m.streamResponse()
			}
		}

	case streamChunkMsg:
		m.currentReply += string(msg)
		m.viewport.SetContent(m.renderMessages())
		m.viewport.GotoBottom()
		return m, nil

	case streamDoneMsg:
		m.streaming = false
		m.messages = append(m.messages, providers.Message{
			Role:    "assistant",
			Content: m.currentReply,
		})

		if err := m.db.SaveMessage(m.conversationID, "assistant", m.currentReply); err != nil {
			m.err = err
		}

		m.currentReply = ""
		m.viewport.SetContent(m.renderMessages())
		return m, nil

	case streamErrorMsg:
		m.streaming = false
		m.err = msg
		return m, nil

	case tea.WindowSizeMsg:
		m.viewport.Width = msg.Width
		m.viewport.Height = msg.Height - m.textarea.Height() - 3
		m.textarea.SetWidth(msg.Width)
		m.viewport.SetContent(m.renderMessages())
	}

	if !m.streaming {
		m.textarea, cmd = m.textarea.Update(msg)
		cmds = append(cmds, cmd)
	}

	m.viewport, cmd = m.viewport.Update(msg)
	cmds = append(cmds, cmd)

	return m, tea.Batch(cmds...)
}

func (m Model) View() string {
	var b strings.Builder

	b.WriteString(fmt.Sprintf("Provider: %s | Model: %s\n", m.providerName, m.modelName))
	b.WriteString(strings.Repeat("─", 80) + "\n")
	b.WriteString(m.viewport.View() + "\n")
	b.WriteString(strings.Repeat("─", 80) + "\n")

	if m.streaming {
		b.WriteString("Streaming response...\n")
	} else {
		b.WriteString(m.textarea.View() + "\n")
	}

	if m.err != nil {
		b.WriteString(fmt.Sprintf("\nError: %v\n", m.err))
	}

	b.WriteString("\n(Ctrl+C to quit)")

	return b.String()
}

func (m Model) renderMessages() string {
	var b strings.Builder

	for _, msg := range m.messages {
		b.WriteString(fmt.Sprintf("%s: %s\n\n", msg.Role, msg.Content))
	}

	if m.streaming && m.currentReply != "" {
		b.WriteString(fmt.Sprintf("assistant: %s", m.currentReply))
	}

	return b.String()
}

func (m Model) streamResponse() tea.Cmd {
	return func() tea.Msg {
		ctx := context.Background()
		textChan, errChan := m.provider.StreamMessage(ctx, m.messages)

		for {
			select {
			case chunk, ok := <-textChan:
				if !ok {
					return streamDoneMsg{}
				}
				return streamChunkMsg(chunk)
			case err := <-errChan:
				if err != nil {
					return streamErrorMsg(err)
				}
			}
		}
	}
}

func RunChat(provider providers.Provider, providerName, modelName string, db *storage.DB, conversationID int64) error {
	p := tea.NewProgram(NewModel(provider, providerName, modelName, db, conversationID))
	_, err := p.Run()
	return err
}
