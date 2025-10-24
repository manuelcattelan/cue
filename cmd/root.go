package cmd

import (
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var rootCommand = &cobra.Command{
	Use: "cue",
	Short: "CLI-first tool that generates LLM-ready prompts" +
		"optimized to get most out of your agentic buddy.",
	PersistentPreRunE: func(command *cobra.Command, arguments []string) error {
		viper.SetEnvPrefix("CUE")
		viper.AutomaticEnv()

		bindFlagsError := viper.BindPFlags(command.Flags())
		if bindFlagsError != nil {
			return bindFlagsError
		}

		return nil
	},
}

func Execute() {
	executeError := rootCommand.Execute()
	if executeError != nil {
		os.Exit(1)
	}
}

func init() {}
