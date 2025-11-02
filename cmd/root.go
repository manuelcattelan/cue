package cmd

import (
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var rootCommand = &cobra.Command{
	Use: "cue",

	PersistentPreRunE: func(command *cobra.Command, arguments []string) error {
		// Environment variables must start with the `CUE_` prefix and they will be
		// accessible through Viper without said prefix.
		// For example:
		//   - CUE_ENV_VAR is correctly recognized and loaded;
		//   - CUE_ENV_VAR is made accessible through viper with key `ENV_VAR`.
		viper.SetEnvPrefix("CUE")
		// Tells Viper to automatically collect and load environment variables at
		// runtime based on the rules above.
		viper.AutomaticEnv()

		return nil
	},

	RunE: func(command *cobra.Command, arguments []string) error {
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
