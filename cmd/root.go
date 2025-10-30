package cmd

import (
	"errors"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

const (
	configDirectoryName = "cue"
	configFileName      = "config"
	configFileType      = "yaml"
)

var rootConfig string
var rootCommand = &cobra.Command{
	Use:   "cue",
	Short: "Generate LLM-ready, effective prompts directly from your CLI.",

	PersistentPreRunE: func(command *cobra.Command, arguments []string) error {
		viper.SetEnvPrefix("CUE")
		viper.AutomaticEnv()

		if rootConfig != "" {
			viper.SetConfigFile(rootConfig)
		} else {
			userConfigDirectory, userConfigDirectoryError := os.UserConfigDir()
			if userConfigDirectoryError != nil {
				return userConfigDirectoryError
			}

			viper.AddConfigPath(".")
			viper.AddConfigPath(filepath.Join(
				userConfigDirectory,
				configDirectoryName,
			))

			viper.SetConfigName(configFileName)
			viper.SetConfigType(configFileType)
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
