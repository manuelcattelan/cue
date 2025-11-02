package cmd

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
	"github.com/charmbracelet/bubbles/textarea"
	"github.com/charmbracelet/bubbles/viewport"
	"github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

const (
	gap = "\n\n"

	convMaxTokens = 1024
	convModel     = anthropic.ModelClaudeSonnet4_5
)

type assistantMsg struct {
	param anthropic.MessageParam
	err   error
}

type model struct {
	viewport viewport.Model
	textarea textarea.Model
	messages []anthropic.MessageParam
	client   anthropic.Client
}

func initialModel() model {
	textarea := textarea.New()
	textarea.ShowLineNumbers = false
	textarea.Focus()

	// Using zero values as default since the actual viewport's width and height
	// will be overridden by `WindowSizeMsg` anyway.
	viewport := viewport.New(0, 0)

	clientAPIKey := viper.GetString("PROVIDER_API_KEY")
	client := anthropic.NewClient(option.WithAPIKey(clientAPIKey))

	return model{
		viewport: viewport,
		textarea: textarea,
		client:   client,
	}
}

func (m model) Init() tea.Cmd {
	return nil
}

func (m *model) updateViewport() {
	formatted := make([]string, len(m.messages))
	for i, msg := range m.messages {
		var content strings.Builder
		for _, block := range msg.Content {
			if block.OfText != nil {
				content.WriteString(block.OfText.Text)
			}
		}
		formatted[i] = content.String()
	}

	m.viewport.SetContent(strings.Join(formatted, "\n"))
	m.viewport.GotoBottom()
}

func getAssistantMsg(client anthropic.Client, messages []anthropic.MessageParam) tea.Cmd {
	return func() tea.Msg {
		response, err := client.Messages.New(context.TODO(), anthropic.MessageNewParams{
			MaxTokens: convMaxTokens,
			Messages:  messages,
			Model:     convModel,
		})

		if err != nil {
			return assistantMsg{err: err}
		}

		return assistantMsg{param: response.ToParam()}
	}
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var (
		viewportCmd tea.Cmd
		textareaCmd tea.Cmd
	)

	m.viewport, viewportCmd = m.viewport.Update(msg)
	m.textarea, textareaCmd = m.textarea.Update(msg)

	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.viewport.Width = msg.Width
		m.viewport.Height = msg.Height - m.textarea.Height() - lipgloss.Height(gap)
		m.textarea.SetWidth(msg.Width)

		if len(m.messages) > 0 {
			m.updateViewport()
		}

	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyCtrlC, tea.KeyEsc:
			return m, tea.Quit

		case tea.KeyEnter:
			textareaValue := m.textarea.Value()
			if textareaValue == "" {
				return m, tea.Batch(viewportCmd, textareaCmd)
			}

			m.messages = append(m.messages, anthropic.NewUserMessage(
				anthropic.NewTextBlock(m.textarea.Value()),
			))

			m.textarea.Reset()
			m.updateViewport()

			return m, tea.Batch(
				viewportCmd,
				textareaCmd,
				getAssistantMsg(m.client, m.messages),
			)
		}

	case assistantMsg:
		if msg.err != nil {
			m.messages = append(m.messages, anthropic.NewAssistantMessage(
				anthropic.NewTextBlock(fmt.Sprintf("Error: %v", msg.err)),
			))
		} else {
			m.messages = append(m.messages, msg.param)
		}

		m.updateViewport()

		return m, tea.Batch(viewportCmd, textareaCmd)
	}

	return m, tea.Batch(viewportCmd, textareaCmd)
}

func (m model) View() string {
	return m.viewport.View() + gap + m.textarea.View()
}

var getCmd = &cobra.Command{
	Use: "get",

	Run: func(cmd *cobra.Command, args []string) {
		p := tea.NewProgram(initialModel())
		if _, err := p.Run(); err != nil {
			os.Exit(1)
		}
	},
}

func init() {
	rootCmd.AddCommand(getCmd)
}
