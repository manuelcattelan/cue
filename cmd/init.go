package cmd

import (
	"cue/internal/config"
	"cue/internal/providers"

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
		providerID:          1,
		providerIDSubmitted: false,

		providerModel:          1,
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
			if model.providerID < providers.GetProvidersCount() {
				model.providerID++
			}
		case tea.KeyUp:
			if model.providerID > 1 {
				model.providerID--
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
	switch typeMessage := message.(type) {
	case tea.KeyMsg:
		switch typeMessage.Type {
		case tea.KeyDown:
			if model.providerModel < providers.GetProviderModelsCount(model.providerID) {
				model.providerModel++
			}
		case tea.KeyUp:
			if model.providerModel > 1 {
				model.providerModel--
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
	providerIDView := "Select your provider:\n\n"

	providers := providers.GetProviders()
	for _, provider := range providers {
		cursor := "  "
		if model.providerID == provider.ID {
			cursor = "> "
		}
		providerIDView += cursor + provider.Label + "\n"
	}

	return providerIDView
}

func providerModelView(model Model) string {
	providerModelView := "Select your provider's model:\n\n"

	provider := providers.GetProvider(model.providerID)
	if provider != nil {
		for _, providerModel := range provider.Models {
			cursor := "  "
			if model.providerModel == providerModel.ID {
				cursor = "> "
			}
			providerModelView += cursor + providerModel.Label + "\n"
		}
	}

	return providerModelView
}

func providerAPIKeyView(model Model) string {
	return "Provide your provider's API key:\n\n" + model.providerAPIKeyTextInput.View()
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
			provider := providers.GetProvider(programRunModel.providerID)
			providerModel := providers.GetProviderModel(programRunModel.providerID, programRunModel.providerModel)

			if provider != nil && providerModel != nil {
				viper.Set("provider_id", provider.Value)
				viper.Set("provider_model", providerModel.Value)
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
		}

		return nil
	},
}

func init() {
	rootCommand.AddCommand(initCommand)
}
