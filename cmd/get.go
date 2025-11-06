package cmd

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
	"github.com/atotto/clipboard"
	"github.com/charmbracelet/bubbles/spinner"
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

	convMaxTokens = 8192
	convModel     = anthropic.ModelClaudeSonnet4_5
)

var (
	layoutMarginLeft = 2

	colorMuted       = lipgloss.Color("241")
	colorMutedMid    = lipgloss.Color("236")
	colorMutedAccent = lipgloss.Color("247")

	styleTextareaCursorline = lipgloss.NewStyle()
	styleRenderedContent    = lipgloss.NewStyle()
	styleLayoutDivider      = lipgloss.NewStyle().Foreground(colorMuted)
	styleHelpTextKey        = lipgloss.NewStyle().Foreground(colorMuted)
	styleHelpTextAction     = lipgloss.NewStyle().Foreground(colorMutedAccent)
	styleHelpText           = lipgloss.NewStyle().MarginLeft(layoutMarginLeft)
	styleHelpDot            = lipgloss.NewStyle().Foreground(colorMutedMid).SetString(" • ")
)

var convSysPrompt = []anthropic.TextBlockParam{
	{
		Text: `You're an experienced prompt engineer and today you will be writing
		instructions to an LLM who needs clear and detailed guidance on how to
		perform a specific task that I will explain to you.

		Below is the list of rules that you must always adhere to when generating
		the output prompt:

		<rules-list>
		<rule>
		The prompt you generate must be extremely clear and use simple, direct
		language.

		Strive for the minimal set of information that fully outlines the expected
		LLM output: specific enough to guide its behavior effectively yet flexible
		enough to provide the LLM with strong heuristics to guide behavior by itself.

		Achieve this by:
		1. Providing the LLM contextual information: with more context, the LLM can
			perform better;
		2. Providing instructions as sequential steps: this can dramatically improve
			performance, especially for more complex tasks;
		3. Being detailed about how you want the LLM to behave: if the output has to
			be in a specific format, for example, just say so inside the prompt.
		</rule>

		<rule>
		When the task requires structured output or adheres to specific formats,
		include 3 to 5 well-crafted, practical examples (a technique known as
		few-shot or multishot prompting).

		Examples boost accuracy by reducing misinterpretation of instructions and
		improve overall output consistency by enforcing uniformity. They show the
		LLM exactly what you want done.

		Craft effective examples by ensuring they are:
		1. Relevant: examples must mirror the real use case;
		2. Diverse: examples must cover edge cases and vary enough so the LLM
			doesn't inadvertently pick up on unintended patterns;
		3. Clear: wrap examples in <example> tags and, if multiple, nest them within
			<examples> tags for improved prompt structure.
		</rule>

		<rule>
		For complex tasks, give the LLM space to think using chain of thought
		prompting, which can dramatically improve performance.

		This technique encourages the LLM to break down problems step-by-step,
		leading to more accurate, coherent and nuanced outputs by stepping through
		problems and rewarding structured thinking.

		Trigger chain of thought prompting using one of these approaches, ordered
		from least to most complex. Less complex techniques use less context window
		space but provide less powerful performance:
		1. Include the words "think step-by-step" inside the generated prompt: this
			is the simplest approach but provides minimal guidance on structuring
			thinking;
		2. Include a structured outline for specific stages of the LLM's thinking
			process: lacks semantic structure that makes it easy to separate the actual
			answer from the thinking process;
		3. Use XML tags like <thinking>, <inner-monologue> and <answer> to separate
			reasoning from the final answer.
		</rule>

		<rule>
		You must take advantage of XML tags, which help LLMs parse the prompt you
		generate more accurately, leading to higher-quality outputs because they
		allow clear separation of different parts of the prompt itself.

		XML tagging improves clarity (by separating different parts of your prompt,
		you ensure that it is well structured) and accuracy (the LLM is less prone to
		misinterpretation of your prompts, which leads to errors).

		While there are no canonical "best" or preferred XML tags, it's crucial to
		strictly adhere to the following principles:
		1. Use tag names that reflect the kind of information that they surround;
		2. XML tagging must always be consistent: the same tag names must be used
			throughout the prompt you generate and the prompt itself should reference
			those tag names (between angular brackets) when discussing their content.
		3. When dealing with hierarchical content, correctly apply XML tag nesting.
		</rule>

		<rule>
		Use role prompting (also known as system prompting) to give the target LLM a
		specific role or expertise to embody, particularly for tasks requiring domain
		knowledge or specific perspectives.

		Role prompting improves accuracy (especially in complex domains like legal or
		financial analysis) and focus (by setting context, the LLM respects the task's
		boundaries more effectively).

		Craft effective roles by:
		1. Being specific: "You are an experienced [role] specializing in [domain]"
			instead of just "You are helpful".
		2. Including relevant domain expertise in the role definition at the start
			of the prompt you generate.
		</rule>

		<rule>
		Whenever there's dynamic content inside the prompt that the user should fill
		in, apply prompt templating using {{VARIABLE}} placeholders.		

		Prompt templating ensures consistency (maintains prompt structure across uses)
		and efficiency (users can reuse the prompt by swapping variable values without
		rewriting it).

		Apply prompt templating by following these rules:
		1. Use descriptive, uppercase variable names like {{CUSTOMER_NAME}} or
			{{FEEDBACK_DATA}};
		2. Clearly indicate what content belongs in each placeholder;
		3. Place variables within the fixed prompt structure where dynamic content
			is needed.
		</rule>
		</rules-list>

		<output-format>
		Whenever you generate a prompt in your response, you MUST wrap the entire
		prompt content inside <cue-generated-prompt> and </cue-generated-prompt> tags.
		This is critical for proper extraction of the prompt text.

		You may include additional text before or after these boundary tags (such as
		clarifying questions, explanations, or follow-up suggestions), but the actual
		prompt must always be contained within these tags.

		NEVER use the <cue-generated-prompt> and </cue-generated-prompt> tags
		anywhere else in your response or within the prompt content itself - this
		tag is reserved exclusively as a boundary marker for the generated prompt.
		</output-format>

		NOTE: it might be obvious to you at this point, but you are not actually
		completing the task here. You are writing instructions for another AI to
		complete it.
		NOTE: this is an iterative process and it might take multiple exchanges
		before the end user provides you with the full picture of what task has to
		be implemented.
		NOTE: you MUST ALWAYS generate a prompt wrapped in the required tags, even
		if the task description is high-level or incomplete. When the task seems
		broad or you're unsure about specific aspects, generate the best possible
		prompt based on the available information, then follow it with clarifying
		questions that would help you refine the prompt in subsequent iterations.
		Your response should always include both: the generated prompt first, then
		any questions for additional context.
		`,
	},
}

type assistantMsg struct {
	param anthropic.MessageParam
	err   error
}

type model struct {
	viewport viewport.Model
	textarea textarea.Model
	loader   spinner.Model

	client   anthropic.Client
	messages []anthropic.MessageParam

	termWidth  int
	termHeight int

	waitingForResponse bool
}

func promptFunc(lineIdx int) string {
	if lineIdx == 0 {
		return "> "
	}
	return "  "
}

func initialModel() model {
	textarea := textarea.New()
	textarea.ShowLineNumbers = false
	textarea.SetHeight(1)
	textarea.SetPromptFunc(layoutPromptWidth, promptFunc)
	textarea.FocusedStyle.CursorLine = styleTextareaCursorline
	textarea.Focus()

	// Using zero values as default since the actual viewport's width and height
	// will be overridden by `WindowSizeMsg` anyway.
	viewport := viewport.New(0, 0)

	loader := spinner.New()
	loader.Spinner = spinner.Ellipsis

	clientAPIKey := viper.GetString("PROVIDER_API_KEY")
	client := anthropic.NewClient(option.WithAPIKey(clientAPIKey))

	return model{
		viewport: viewport,
		textarea: textarea,
		loader:   loader,
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

	formattedContent := strings.Join(formatted, "\n\n")
	if m.viewport.Width > 0 {
		wrappedContent := styleRenderedContent.Width(m.viewport.Width).
			Render(formattedContent)
		m.viewport.SetContent(wrappedContent)
	} else {
		m.viewport.SetContent(formattedContent)
	}
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

func (m *model) getLastGeneratedPrompt() tea.Cmd {
	return func() tea.Msg {
		var lastAssistantMsg *anthropic.MessageParam
		for i := len(m.messages) - 1; i >= 0; i-- {
			if m.messages[i].Role == anthropic.MessageParamRoleAssistant {
				lastAssistantMsg = &m.messages[i]
				break
			}
		}

		if lastAssistantMsg == nil {
			return nil
		}

		var content strings.Builder
		for _, block := range lastAssistantMsg.Content {
			if block.OfText != nil {
				content.WriteString(block.OfText.Text)
			}
		}
		contentString := content.String()

		// WARN: update the value of these XML tags whenever the system prompt gets
		// updated, if the prompt wrappers are specified differently.
		promptStartTag := "<cue-generated-prompt>"
		promptStartIdx := strings.Index(contentString, promptStartTag)

		promptEndTag := "</cue-generated-prompt>"
		promptEndIdx := strings.Index(contentString, promptEndTag)

		var textToCopy string
		if promptStartIdx != -1 && promptEndIdx != -1 && promptEndIdx > promptStartIdx {
			textToCopy = contentString[promptStartIdx+len(promptStartTag) : promptEndIdx]
			textToCopy = strings.TrimSpace(textToCopy)
		} else {
			textToCopy = contentString
		}

		return clipboard.WriteAll(textToCopy)
	}
}

func getAssistantMsg(client anthropic.Client, messages []anthropic.MessageParam) tea.Cmd {
	return func() tea.Msg {
		response, err := client.Messages.New(context.TODO(), anthropic.MessageNewParams{
			Model:     convModel,
			MaxTokens: convMaxTokens,
			System:    convSysPrompt,
			Messages:  messages,
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
		loaderCmd   tea.Cmd
	)

	m.viewport, viewportCmd = m.viewport.Update(msg)
	m.textarea, textareaCmd = m.textarea.Update(msg)

	if m.waitingForResponse {
		m.loader, loaderCmd = m.loader.Update(msg)
	}

	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.viewport.Width = msg.Width
		m.textarea.SetWidth(msg.Width - layoutPromptWidth)

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

		case tea.KeyCtrlD:
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

			m.waitingForResponse = true
			loaderCmd = m.loader.Tick

			return m, tea.Batch(
				viewportCmd,
				textareaCmd,
				loaderCmd,
				getAssistantMsg(m.client, m.messages),
			)

		case tea.KeyCtrlY:
			if len(m.messages) > 0 {
				return m, m.getLastGeneratedPrompt()
			}

			return m, tea.Batch(viewportCmd, textareaCmd)
		}

	case assistantMsg:
		m.waitingForResponse = false

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

	return m, tea.Batch(viewportCmd, textareaCmd, loaderCmd)
}

func (m model) View() string {
	// WARN: you should update the divider's height value inside the
	// `updateViewportHeight` function whenever changes to how the divider is
	// rendered are made.
	divider := styleLayoutDivider.Render(strings.Repeat("─", m.termWidth))

	helpText := styleHelpText.Render(
		styleHelpTextKey.Render("enter: ") + styleHelpTextAction.Render("new line") +
			styleHelpDot.Render() +
			styleHelpTextKey.Render("ctrl+d: ") + styleHelpTextAction.Render("send") +
			styleHelpDot.Render() +
			styleHelpTextKey.Render("ctrl+y: ") + styleHelpTextAction.Render("copy prompt") +
			styleHelpDot.Render() +
			styleHelpTextKey.Render("ctrl+c/esc: ") + styleHelpTextAction.Render("quit"),
	)

	if len(m.messages) == 0 {
		return divider + "\n" + m.textarea.View() + "\n" + divider + "\n" + helpText
	}

	viewportContent := m.viewport.View()
	if m.waitingForResponse {
		viewportContent += "\n\n" + "Cueing" + m.loader.View()
	}

	return viewportContent + layoutGap +
		divider + "\n" + m.textarea.View() + "\n" +
		divider + "\n" + helpText
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
