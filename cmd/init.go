package cmd

import (
	"os"
	"path/filepath"

	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

type provider struct {
	ID     int
	Label  string
	Value  string
	Models []providerModel
}

type providerModel struct {
	ID    int
	Label string
	Value string
}

var providers = []provider{
	{
		ID:    1,
		Label: "Anthropic",
		Value: "anthropic",
		Models: []providerModel{
			{ID: 1, Label: "Claude Opus 4.1", Value: "claude-opus-4-1"},
			{ID: 2, Label: "Claude Sonnet 4.5", Value: "claude-sonnet-4-5"},
			{ID: 3, Label: "Claude Haiku 4.5", Value: "claude-haiku-4-5"},
		},
	},
	{
		ID:    2,
		Label: "Google",
		Value: "google",
		Models: []providerModel{
			{ID: 1, Label: "Gemini 2.5 Pro", Value: "gemini-2.5-pro"},
			{ID: 2, Label: "Gemini 2.5 Flash", Value: "gemini-2.5-flash"},
			{ID: 3, Label: "Gemini 2.5 Flash-Lite", Value: "gemini-2.5-flash-lite"},
		},
	},
	{
		ID:    3,
		Label: "OpenAI",
		Value: "openai",
		Models: []providerModel{
			{ID: 1, Label: "GPT-5", Value: "gpt-5"},
			{ID: 2, Label: "GPT-5 mini", Value: "gpt-5-mini"},
			{ID: 3, Label: "GPT-5 nano", Value: "gpt-5-nano"},
			{ID: 4, Label: "GPT-5 pro", Value: "gpt-5-pro"},
			{ID: 5, Label: "GPT-4.1", Value: "gpt-4-1"},
		},
	},
}

var (
	selectedOptionStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("212"))
)

type Model struct {
	providerID          int
	providerIDSubmitted bool

	providerModel          int
	providerModelSubmitted bool

	providerAPIKeyTextInput textinput.Model
	providerAPIKey          string
	providerAPIKeySubmitted bool
}

func (model Model) Init() tea.Cmd {
	return nil
}

func initialModel() Model {
	providerAPIKeyTextInput := textinput.New()
	providerAPIKeyTextInput.Placeholder = "Enter your provider's API key"
	providerAPIKeyTextInput.EchoMode = textinput.EchoPassword
	providerAPIKeyTextInput.EchoCharacter = '*'
	providerAPIKeyTextInput.Width = 32

	return Model{
		providerID:          1,
		providerIDSubmitted: false,

		providerModel:          1,
		providerModelSubmitted: false,

		providerAPIKeyTextInput: providerAPIKeyTextInput,
		providerAPIKey:          "",
		providerAPIKeySubmitted: false,
	}
}

func (model Model) Update(message tea.Msg) (tea.Model, tea.Cmd) {
	switch typeMessage := message.(type) {
	case tea.KeyMsg:
		switch typeMessage.Type {
		case tea.KeyCtrlC, tea.KeyEsc:
			return model, tea.Quit
		case tea.KeyShiftTab:
			if model.providerModelSubmitted {
				model.providerModelSubmitted = false
				model.providerAPIKeyTextInput.Blur()
			} else if model.providerIDSubmitted {
				model.providerIDSubmitted = false
			}
			return model, nil
		}
	}

	if !model.providerIDSubmitted {
		return updateProviderID(message, model)
	} else if !model.providerModelSubmitted {
		return updateProviderModel(message, model)
	} else {
		return updateProviderAPIKey(message, model)
	}
}

func updateProviderID(message tea.Msg, model Model) (tea.Model, tea.Cmd) {
	nextProviderID := func() {
		if model.providerID < len(providers) {
			model.providerID++
		} else {
			model.providerID = 1
		}
	}
	previousProviderID := func() {
		if model.providerID > 1 {
			model.providerID--
		} else {
			model.providerID = len(providers)
		}
	}

	switch typeMessage := message.(type) {
	case tea.KeyMsg:
		switch typeMessage.Type {
		case tea.KeyDown:
			nextProviderID()
		case tea.KeyUp:
			previousProviderID()
		case tea.KeyRunes:
			switch typeMessage.String() {
			case "j":
				nextProviderID()
			case "k":
				previousProviderID()
			}
		case tea.KeyEnter:
			model.providerIDSubmitted = true
			model.providerModel = 1
			return model, nil
		}
	}

	return model, nil
}

func updateProviderModel(message tea.Msg, model Model) (tea.Model, tea.Cmd) {
	nextProviderModel := func() {
		if model.providerID <= 0 || model.providerID > len(providers) {
			return
		}
		if model.providerModel < len(providers[model.providerID-1].Models) {
			model.providerModel++
		} else {
			model.providerModel = 1
		}
	}
	previousProviderModel := func() {
		if model.providerID <= 0 || model.providerID > len(providers) {
			return
		}
		if model.providerModel > 1 {
			model.providerModel--
		} else {
			model.providerModel = len(providers[model.providerID-1].Models)
		}
	}

	switch typeMessage := message.(type) {
	case tea.KeyMsg:
		switch typeMessage.Type {
		case tea.KeyDown:
			nextProviderModel()
		case tea.KeyUp:
			previousProviderModel()
		case tea.KeyRunes:
			switch typeMessage.String() {
			case "j":
				nextProviderModel()
			case "k":
				previousProviderModel()
			}
		case tea.KeyEnter:
			model.providerModelSubmitted = true
			model.providerAPIKeyTextInput.Focus()
			return model, nil
		}
	}

	return model, nil
}

func updateProviderAPIKey(message tea.Msg, model Model) (tea.Model, tea.Cmd) {
	var command tea.Cmd

	switch typeMessage := message.(type) {
	case tea.KeyMsg:
		switch typeMessage.Type {
		case tea.KeyEnter:
			model.providerAPIKeySubmitted = true
			model.providerAPIKey = model.providerAPIKeyTextInput.Value()
			return model, tea.Quit
		}
	}

	model.providerAPIKeyTextInput, command =
		model.providerAPIKeyTextInput.Update(message)
	return model, command
}

func (model Model) View() string {
	if !model.providerIDSubmitted {
		return providerIDView(model)
	} else if !model.providerModelSubmitted {
		return providerModelView(model)
	} else {
		return providerAPIKeyView(model)
	}
}

func providerIDView(model Model) string {
	providerIDView := "Select your provider:\n\n"

	for _, provider := range providers {
		var providerCursor string
		if model.providerID == provider.ID {
			providerCursor = selectedOptionStyle.Render("[x] " + provider.Label)
		} else {
			providerCursor = "[ ] " + provider.Label
		}
		providerIDView += providerCursor + "\n"
	}

	return providerIDView
}

func providerModelView(model Model) string {
	providerModelView := "Select your provider's model:\n\n"

	if model.providerID > 0 && model.providerID <= len(providers) {
		for _, providerModel := range providers[model.providerID-1].Models {
			var providerModelCursor string
			if model.providerModel == providerModel.ID {
				providerModelCursor = selectedOptionStyle.Render("[x] " +
					providerModel.Label)
			} else {
				providerModelCursor = "[ ] " + providerModel.Label
			}
			providerModelView += providerModelCursor + "\n"
		}
	}

	return providerModelView
}

func providerAPIKeyView(model Model) string {
	return "Provide your provider's API key:\n\n" +
		model.providerAPIKeyTextInput.View() + "\n\n"
}

var initCommand = &cobra.Command{
	Use:   "init",
	Short: "Provide required information for usage",

	RunE: func(cmd *cobra.Command, args []string) error {
		program := tea.NewProgram(initialModel())
		programRun, programRunError := program.Run()
		if programRunError != nil {
			return programRunError
		}

		programRunModel, programRunOK := programRun.(Model)
		if !programRunOK || !programRunModel.providerAPIKeySubmitted {
			return nil
		}

		if programRunModel.providerID < 0 ||
			programRunModel.providerID > len(providers) {
			return nil
		}

		provider := providers[programRunModel.providerID-1]
		if programRunModel.providerModel < 0 ||
			programRunModel.providerModel > len(provider.Models) {
			return nil
		}

		providerModel := provider.Models[programRunModel.providerModel-1]

		viper.Set("provider_id", provider.Value)
		viper.Set("provider_model", providerModel.Value)
		viper.Set("provider_api_key", programRunModel.providerAPIKey)

		configFilePath := viper.ConfigFileUsed()
		if configFilePath == "" {
			userConfigDirectory, userConfigDirectoryError := os.UserConfigDir()
			if userConfigDirectoryError != nil {
				return userConfigDirectoryError
			}
			configFilePath = filepath.Join(userConfigDirectory,
				configDirectoryName,
				configFileName+"."+configFileType,
			)
		}

		mkdirError := os.MkdirAll(filepath.Dir(configFilePath), 0755)
		if mkdirError != nil {
			return mkdirError
		}

		configWriter := viper.New()
		configWriter.SetConfigFile(configFilePath)
		configWriter.SetConfigType(configFileType)

		_ = configWriter.ReadInConfig()
		configWriter.Set("provider_id", viper.Get("provider_id"))
		configWriter.Set("provider_model", viper.Get("provider_model"))
		configWriter.Set("provider_api_key", viper.Get("provider_api_key"))

		writeConfigError := configWriter.WriteConfigAs(configFilePath)
		if writeConfigError != nil {
			return writeConfigError
		}

		return nil
	},
}

func init() {
	rootCommand.AddCommand(initCommand)
}
