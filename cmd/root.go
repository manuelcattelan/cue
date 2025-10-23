package cmd

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var configFile string
var rootCommand = &cobra.Command{
	Use:   "cue",
	Short: "CLI-first tool that generates LLM-ready prompts optimized to get the most out of your agentic buddy.",
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		return initializeConfig(cmd)
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		anthropicAPIKey := viper.GetString("ANTHROPIC_API_KEY")
		fmt.Printf("cue is running with key: %s\n", anthropicAPIKey)
		return nil
	},
}

func Execute() {
	err := rootCommand.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	rootCommand.PersistentFlags().StringVar(&configFile, "config", "", "configuration file")
}

func initializeConfig(cmd *cobra.Command) error {
	viper.SetEnvPrefix("CUE")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "*", "-", "*"))
	viper.AutomaticEnv()

	if configFile != "" {
		viper.SetConfigFile(configFile)
	} else {
		configPath, configPathError := os.UserConfigDir()
		cobra.CheckErr(configPathError)

		viper.AddConfigPath(".")
		viper.AddConfigPath(configPath + "/cue")
		viper.SetConfigName("config")
		viper.SetConfigType("yaml")
	}

	if readConfigFileError := viper.ReadInConfig(); readConfigFileError != nil {
		var configFileNotFoundError viper.ConfigFileNotFoundError
		if !errors.As(readConfigFileError, &configFileNotFoundError) {
			return readConfigFileError
		}
	}

	bindFlagsError := viper.BindPFlags(cmd.Flags())
	if bindFlagsError != nil {
		return bindFlagsError
	}

	return nil
}
