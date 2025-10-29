package cmd

import (
	"cue/internal/config"
	"fmt"

	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbletea"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

const (
	ConfigKey = "key"
)

type Model struct {
	textInput      textinput.Model
	valueSubmitted bool
	value          string
}

func initialModel() Model {
	textInput := textinput.New()
	textInput.Focus()

	return Model{
		textInput: textInput,
	}
}

func (model Model) Init() tea.Cmd {
	return nil
}

func (model Model) Update(message tea.Msg) (tea.Model, tea.Cmd) {
	var command tea.Cmd

	switch messageType := message.(type) {
	case tea.KeyMsg:
		switch messageType.Type {
		case tea.KeyEnter:
			model.valueSubmitted = true
			model.value = model.textInput.Value()
			return model, tea.Quit
		case tea.KeyCtrlC, tea.KeyEsc:
			return model, tea.Quit
		}
	}

	model.textInput, command = model.textInput.Update(message)
	return model, command
}

func (model Model) View() string {
	inputTextLabel := ConfigKey + "\n\n%s\n\n%s\n"
	inputTextHelp := "(esc to quit)"

	return fmt.Sprintf(inputTextLabel, model.textInput.View(), inputTextHelp)
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
		if programRunOK && programRunModel.valueSubmitted {
			viper.Set(ConfigKey, programRunModel.value)
			_, writeConfigError := config.WriteConfig([]string{ConfigKey})
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
