package providers

type Provider struct {
	ID     int
	Label  string
	Value  string
	Models []ProviderModel
}

type ProviderModel struct {
	ID    int
	Label string
	Value string
}

var providers = []Provider{
	{
		ID:    1,
		Label: "Anthropic",
		Value: "anthropic",
		Models: []ProviderModel{
			{ID: 1, Label: "Claude Opus 4.1", Value: "claude-opus-4-1"},
			{ID: 2, Label: "Claude Sonnet 4.5", Value: "claude-sonnet-4-5"},
			{ID: 3, Label: "Claude Haiku 4.5", Value: "claude-haiku-4-5"},
		},
	},
	{
		ID:    2,
		Label: "Google",
		Value: "google",
		Models: []ProviderModel{
			{ID: 1, Label: "Gemini 2.5 Pro", Value: "gemini-2.5-pro"},
			{ID: 2, Label: "Gemini 2.5 Flash", Value: "gemini-2.5-flash"},
			{ID: 3, Label: "Gemini 2.5 Flash-Lite", Value: "gemini-2.5-flash-lite"},
		},
	},
	{
		ID:    3,
		Label: "OpenAI",
		Value: "openai",
		Models: []ProviderModel{
			{ID: 1, Label: "GPT-5", Value: "gpt-5"},
			{ID: 2, Label: "GPT-5 mini", Value: "gpt-5-mini"},
			{ID: 3, Label: "GPT-5 nano", Value: "gpt-5-nano"},
			{ID: 4, Label: "GPT-5 pro", Value: "gpt-5-pro"},
			{ID: 5, Label: "GPT-4.1", Value: "gpt-4-1"},
		},
	},
}

func GetProvidersCount() int {
	return len(providers)
}

func GetProviders() []Provider {
	return providers
}

func GetProvider(id int) *Provider {
	for i := range providers {
		if providers[i].ID == id {
			return &providers[i]
		}
	}

	return nil
}

func GetProviderModelsCount(providerID int) int {
	provider := GetProvider(providerID)
	if provider == nil {
		return 0
	}

	return len(provider.Models)
}

func GetProviderModel(providerID, modelID int) *ProviderModel {
	provider := GetProvider(providerID)
	if provider == nil {
		return nil
	}

	for i := range provider.Models {
		if provider.Models[i].ID == modelID {
			return &provider.Models[i]
		}
	}

	return nil
}
