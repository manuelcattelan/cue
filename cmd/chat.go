package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"cue/internal/providers"
	"cue/internal/storage"
	"cue/internal/tui"
)

var chatCmd = &cobra.Command{
	Use:   "chat",
	Short: "Start an interactive chat session",
	Long:  "Launch the TUI to chat with your configured LLM provider",
	RunE: func(cmd *cobra.Command, args []string) error {
		providerName := viper.GetString("provider")
		model := viper.GetString("model")
		apiKey := viper.GetString("api_key")

		if apiKey == "" {
			apiKey = os.Getenv("CUE_PROVIDER_API_KEY")
		}

		if providerName == "" || model == "" || apiKey == "" {
			return fmt.Errorf("configuration not found. Please run 'cue init' first")
		}

		var provider providers.Provider
		switch providerName {
		case "anthropic":
			provider = providers.NewAnthropicProvider(apiKey, model)
		case "openai":
			provider = providers.NewOpenAIProvider(apiKey, model)
		case "google":
			var err error
			provider, err = providers.NewGoogleProvider(apiKey, model)
			if err != nil {
				return fmt.Errorf("failed to create Google provider: %w", err)
			}
		default:
			return fmt.Errorf("unknown provider: %s", providerName)
		}

		configDir, err := os.UserConfigDir()
		if err != nil {
			return err
		}

		dbPath := configDir + "/cue/conversations.db"
		db, err := storage.NewDB(dbPath)
		if err != nil {
			return fmt.Errorf("failed to initialize database: %w", err)
		}
		defer db.Close()

		conversation, err := db.CreateConversation(providerName, model)
		if err != nil {
			return fmt.Errorf("failed to create conversation: %w", err)
		}

		return tui.RunChat(provider, providerName, model, db, conversation.ID)
	},
}

func init() {
	rootCommand.AddCommand(chatCmd)
}
