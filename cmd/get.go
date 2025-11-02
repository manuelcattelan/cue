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

const chatGap = "\n\n"
const chatMaxTokens = 1024

type MessageSender string
type Message struct {
	sender MessageSender
	param  anthropic.MessageParam
}

const (
	MessageSenderYou    MessageSender = "You"
	MessageSenderSystem MessageSender = "System"
)

type assistantResponseMsg struct {
	content string
}

func toMessageParamContent(param anthropic.MessageParam) string {
	var messageParamContent strings.Builder
	for _, messageParamBlock := range param.Content {
		if messageParamBlock.OfText != nil {
			messageParamContent.WriteString(messageParamBlock.OfText.Text)
		}
	}
	return messageParamContent.String()
}

func toMessagesFormatted(messages []Message) string {
	messagesFormatted := make([]string, len(messages))
	for messageIndex, message := range messages {
		messagesFormatted[messageIndex] = fmt.Sprintf(
			"%s: %s",
			message.sender, toMessageParamContent(message.param),
		)
	}
	return strings.Join(messagesFormatted, "\n")
}

func toMessagesParams(messages []Message) []anthropic.MessageParam {
	messagesParams := make([]anthropic.MessageParam, len(messages))
	for messageIndex, message := range messages {
		messagesParams[messageIndex] = message.param
	}
	return messagesParams
}

func addMessage(model *Model, messageContent string, messageSender MessageSender) {
	var messageParam anthropic.MessageParam
	if messageSender == MessageSenderYou {
		messageParam = anthropic.NewUserMessage(
			anthropic.NewTextBlock(messageContent),
		)
	} else {
		messageParam = anthropic.NewAssistantMessage(
			anthropic.NewTextBlock(messageContent),
		)
	}

	model.messages = append(model.messages, Message{
		sender: messageSender,
		param:  messageParam,
	})
	model.chatViewport.SetContent(toMessagesFormatted(model.messages))
	model.chatViewport.GotoBottom()

	if messageSender == MessageSenderYou {
		model.chatTextarea.Reset()
	}
}

func getAssistantResponseCommand(client anthropic.Client, messages []Message) tea.Cmd {
	return func() tea.Msg {
		assistantMessage, _ := client.Messages.New(
			context.TODO(),
			anthropic.MessageNewParams{
				MaxTokens: chatMaxTokens,
				Messages:  toMessagesParams(messages),
				Model:     anthropic.ModelClaudeSonnet4_5,
			})

		assistantMessageParam := assistantMessage.ToParam()
		assistantMessageParamContent := toMessageParamContent(assistantMessageParam)

		return assistantResponseMsg{
			content: assistantMessageParamContent,
		}
	}
}

type Model struct {
	chatViewport   viewport.Model
	chatTextarea   textarea.Model
	messages       []Message
	providerClient anthropic.Client
}

func initialModel() Model {
	chatTextarea := textarea.New()
	chatViewport := viewport.New(30, 5)

	chatTextarea.SetHeight(1)
	chatTextarea.ShowLineNumbers = false
	chatTextarea.Focus()

	providerAPIKey := viper.GetString("PROVIDER_API_KEY")
	providerClient := anthropic.NewClient(option.WithAPIKey(providerAPIKey))

	return Model{
		chatViewport:   chatViewport,
		chatTextarea:   chatTextarea,
		messages:       []Message{},
		providerClient: providerClient,
	}
}

func (model Model) Init() tea.Cmd {
	return nil
}

func (model Model) Update(message tea.Msg) (tea.Model, tea.Cmd) {
	var (
		chatViewportCommand tea.Cmd
		chatTextareaCommand tea.Cmd
	)

	model.chatViewport, chatViewportCommand = model.chatViewport.Update(message)
	model.chatTextarea, chatTextareaCommand = model.chatTextarea.Update(message)

	switch message := message.(type) {
	case tea.WindowSizeMsg:
		model.chatViewport.Width = message.Width
		model.chatViewport.Height = message.Height - model.chatTextarea.Height() -
			lipgloss.Height(chatGap)
		model.chatTextarea.SetWidth(message.Width)

		if len(model.messages) > 0 {
			model.chatViewport.SetContent(toMessagesFormatted(model.messages))
		}

		model.chatViewport.GotoBottom()
	case tea.KeyMsg:
		switch message.Type {
		case tea.KeyCtrlC, tea.KeyEsc:
			return model, tea.Quit
		case tea.KeyEnter:
			addMessage(&model, model.chatTextarea.Value(), MessageSenderYou)

			return model, tea.Batch(
				chatViewportCommand,
				chatTextareaCommand,
				getAssistantResponseCommand(model.providerClient, model.messages),
			)
		}
	case assistantResponseMsg:
		addMessage(&model, message.content, MessageSenderSystem)

		return model, tea.Batch(chatViewportCommand, chatTextareaCommand)
	}

	return model, tea.Batch(chatViewportCommand, chatTextareaCommand)
}

func (model Model) View() string {
	return model.chatViewport.View() +
		chatGap +
		model.chatTextarea.View()
}

var getCommand = &cobra.Command{
	Use: "get",

	RunE: func(command *cobra.Command, arguments []string) error {
		program := tea.NewProgram(initialModel())
		_, programRunError := program.Run()

		if programRunError != nil {
			os.Exit(1)
		}

		return nil
	},
}

func init() {
	rootCommand.AddCommand(getCommand)
}
