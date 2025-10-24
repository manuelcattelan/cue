package providers

import (
	"context"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
)

type OpenAIProvider struct {
	client *openai.Client
	model  string
}

func NewOpenAIProvider(apiKey, model string) *OpenAIProvider {
	client := openai.NewClient(option.WithAPIKey(apiKey))
	return &OpenAIProvider{
		client: &client,
		model:  model,
	}
}

func (p *OpenAIProvider) StreamMessage(ctx context.Context, messages []Message) (<-chan string, <-chan error) {
	textChan := make(chan string)
	errChan := make(chan error, 1)

	go func() {
		defer close(textChan)
		defer close(errChan)

		openaiMessages := make([]openai.ChatCompletionMessageParamUnion, len(messages))
		for i, msg := range messages {
			if msg.Role == "user" {
				openaiMessages[i] = openai.UserMessage(msg.Content)
			} else {
				openaiMessages[i] = openai.AssistantMessage(msg.Content)
			}
		}

		stream := p.client.Chat.Completions.NewStreaming(ctx, openai.ChatCompletionNewParams{
			Model:    p.model,
			Messages: openaiMessages,
		})

		for stream.Next() {
			chunk := stream.Current()
			if len(chunk.Choices) > 0 && chunk.Choices[0].Delta.Content != "" {
				select {
				case textChan <- chunk.Choices[0].Delta.Content:
				case <-ctx.Done():
					errChan <- ctx.Err()
					return
				}
			}
		}

		if err := stream.Err(); err != nil {
			errChan <- err
		}
	}()

	return textChan, errChan
}
