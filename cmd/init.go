package cmd

import (
	"cue/internal/config"

	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbletea"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
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
	return Model{
		providerID:          0,
		providerIDSubmitted: false,

		providerModel:          0,
		providerModelSubmitted: false,

		providerAPIKeyTextInput: textinput.New(),
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
	switch typeMessage := message.(type) {
	case tea.KeyMsg:
		switch typeMessage.Type {
		case tea.KeyDown:
			if model.providerID < 3 {
				model.providerID++
			}
		case tea.KeyUp:
			if model.providerID > 1 {
				model.providerID--
			}
		case tea.KeyEnter:
			model.providerIDSubmitted = true
			return model, nil
		}
	}
	return model, nil
}

func updateProviderModel(message tea.Msg, model Model) (tea.Model, tea.Cmd) {
	switch typeMessage := message.(type) {
	case tea.KeyMsg:
		switch typeMessage.Type {
		case tea.KeyDown:
			if model.providerModel < 3 {
				model.providerModel++
			}
		case tea.KeyUp:
			if model.providerModel > 1 {
				model.providerModel--
			}
		case tea.KeyEnter:
			model.providerModelSubmitted = true
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

	model.providerAPIKeyTextInput, command = model.providerAPIKeyTextInput.Update(message)
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
	return "provider_id"
}

func providerModelView(model Model) string {
	return "provider_model"
}

func providerAPIKeyView(model Model) string {
	return "provider_api_key"
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
		if programRunOK && programRunModel.providerAPIKeySubmitted {
			viper.Set("provider_id", programRunModel.providerID)
			viper.Set("provider_model", programRunModel.providerModel)
			viper.Set("provider_api_key", programRunModel.providerAPIKey)

			_, writeConfigError := config.WriteConfig([]string{
				"provider_id",
				"provider_model",
				"provider_api_key",
			})
			if writeConfigError != nil {
				return writeConfigError
			}
		}

		return nil
	},
}

func init() {
	rootCommand.AddCommand(initCommand)
}
