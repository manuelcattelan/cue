package cmd

import (
	"errors"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var rootConfig string
var rootCommand = &cobra.Command{
	Use: "cue",
	Short: "CLI-first tool that generates LLM-ready prompts " +
		"optimized to get most out of your agentic buddy.",

	PersistentPreRunE: func(command *cobra.Command, arguments []string) error {
		viper.SetEnvPrefix("CUE")
		viper.AutomaticEnv()

		if rootConfig != "" {
			viper.SetConfigFile(rootConfig)
		} else {
			userConfigDirectory, userConfigDirectoryError := os.UserConfigDir()
			cobra.CheckErr(userConfigDirectoryError)

			viper.AddConfigPath(".")
			viper.AddConfigPath(userConfigDirectory + "/cue")

			viper.SetConfigName("config")
			viper.SetConfigType("yaml")
		}

		if readInConfigError := viper.ReadInConfig(); readInConfigError != nil {
			var configFileNotFoundError viper.ConfigFileNotFoundError
			if !errors.As(readInConfigError, &configFileNotFoundError) {
				return readInConfigError
			}
		}

		bindFlagsError := viper.BindPFlags(command.Flags())
		if bindFlagsError != nil {
			return bindFlagsError
		}

		return nil
	},

	Run: func(command *cobra.Command, arguments []string) {},
}

func Execute() {
	executeError := rootCommand.Execute()
	if executeError != nil {
		os.Exit(1)
	}
}

func init() {
	rootCommand.PersistentFlags().StringVar(&rootConfig, "config", "",
		"configuration file")
}
