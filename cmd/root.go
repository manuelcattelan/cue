package cmd

import (
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var rootCmd = &cobra.Command{
	Use: "cue",

	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		// Environment variables must start with the `CUE_` prefix and they
		// will be accessible from Viper without the `CUE_` prefix.
		// For example:
		//   - CUE_ENV_VAR is correctly recognized and loaded;
		//   - CUE_ENV_VAR is made accessible by Viper with key `ENV_VAR`.
		viper.SetEnvPrefix("CUE")
		// Tells Viper to automatically collect and load environment variables at
		// runtime based on the rules above.
		viper.AutomaticEnv()
	},

	Run: func(cmd *cobra.Command, args []string) {},
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}
