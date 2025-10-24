package cmd

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize cue configuration",
	Long:  "Set up your LLM provider, model, and API key",
	RunE: func(cmd *cobra.Command, args []string) error {
		reader := bufio.NewReader(os.Stdin)

		fmt.Println("Welcome to cue setup!")
		fmt.Println()

		fmt.Println("Select your LLM provider:")
		fmt.Println("1. Anthropic (Claude)")
		fmt.Println("2. OpenAI (GPT)")
		fmt.Println("3. Google (Gemini)")
		fmt.Print("Choice (1-3): ")

		choice, _ := reader.ReadString('\n')
		choice = strings.TrimSpace(choice)

		var provider, defaultModel string
		switch choice {
		case "1":
			provider = "anthropic"
			defaultModel = "claude-3-5-sonnet-20241022"
		case "2":
			provider = "openai"
			defaultModel = "gpt-4"
		case "3":
			provider = "google"
			defaultModel = "gemini-2.0-flash-exp"
		default:
			return fmt.Errorf("invalid choice")
		}

		fmt.Printf("Model (default: %s): ", defaultModel)
		model, _ := reader.ReadString('\n')
		model = strings.TrimSpace(model)
		if model == "" {
			model = defaultModel
		}

		fmt.Print("API Key: ")
		apiKey, _ := reader.ReadString('\n')
		apiKey = strings.TrimSpace(apiKey)

		viper.Set("provider", provider)
		viper.Set("model", model)
		viper.Set("api_key", apiKey)

		configFile := viper.ConfigFileUsed()
		if configFile == "" {
			configDir, err := os.UserConfigDir()
			if err != nil {
				return err
			}
			configDir = configDir + "/cue"
			if err := os.MkdirAll(configDir, 0755); err != nil {
				return err
			}
			configFile = configDir + "/config.yaml"
		}

		if err := viper.WriteConfigAs(configFile); err != nil {
			return err
		}

		fmt.Printf("\nConfiguration saved to %s\n", configFile)
		fmt.Println("You can now run 'cue chat' to start chatting!")

		return nil
	},
}

func init() {
	rootCommand.AddCommand(initCmd)
}
