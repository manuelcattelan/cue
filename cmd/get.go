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
	layoutGap         = "\n\n"
	layoutPromptWidth = 2

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

	client   anthropic.Client
	messages []anthropic.MessageParam

	termWidth  int
	termHeight int
}

func initialModel() model {
	textarea := textarea.New()
	textarea.ShowLineNumbers = false
	textarea.SetHeight(1)
	textarea.SetPromptFunc(layoutPromptWidth, func(lineIdx int) string {
		if lineIdx == 0 {
			return "> "
		}
		return "  "
	})
	textarea.Placeholder = "Describe your task..."
	textarea.Focus()
	textarea.FocusedStyle.CursorLine = lipgloss.NewStyle()

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

func (m *model) updateViewportContent() {
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
}

func (m *model) updateViewportHeight() {
	if len(m.messages) == 0 || m.termHeight == 0 {
		return
	}

	// WARN: you should update this value whenever changes to how the divider is
	// rendered are made.
	// Dividers that outline the `textarea` component add a total of
	// `layoutDividerHeight` lines between separator strings and newline
	// characters.
	layoutDividerHeight := 5

	viewportContentHeight := m.viewport.TotalLineCount()
	viewportMaxHeight := m.termHeight - m.textarea.Height() -
		lipgloss.Height(layoutGap) - layoutDividerHeight

	m.viewport.Height = min(viewportMaxHeight, viewportContentHeight)
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
		m.textarea.SetWidth(msg.Width)

		m.termWidth = msg.Width
		m.termHeight = msg.Height

		if len(m.messages) > 0 {
			m.updateViewportContent()
			m.updateViewportHeight()
		}

	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyCtrlC, tea.KeyEsc:
			return m, tea.Quit

		case tea.KeyEnter:
			textareaValue := strings.TrimSpace(m.textarea.Value())
			if textareaValue == "" {
				return m, tea.Batch(viewportCmd, textareaCmd)
			}

			m.messages = append(m.messages, anthropic.NewUserMessage(
				anthropic.NewTextBlock(textareaValue),
			))

			m.textarea.Reset()
			m.updateViewportContent()
			m.updateViewportHeight()

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

		m.updateViewportContent()
		m.updateViewportHeight()

		return m, tea.Batch(viewportCmd, textareaCmd)
	}

	return m, tea.Batch(viewportCmd, textareaCmd)
}

func (m model) View() string {
	// WARN: you should update the divider's height value inside the
	// `updateViewportHeight` function whenever changes to how the divider is
	// rendered are made.
	divider := lipgloss.NewStyle().Foreground(lipgloss.Color("241")).
		Render(strings.Repeat("─", m.termWidth))

	if len(m.messages) == 0 {
		return divider + "\n" + m.textarea.View() + "\n" + divider + "\n"
	}

	return m.viewport.View() + layoutGap +
		divider + "\n" + m.textarea.View() + "\n" +
		divider + "\n"
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
