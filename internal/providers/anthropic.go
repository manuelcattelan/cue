package providers

import (
	"context"
	"io"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
)

type AnthropicProvider struct {
	client *anthropic.Client
	model  string
}

func NewAnthropicProvider(apiKey, model string) *AnthropicProvider {
	client := anthropic.NewClient(option.WithAPIKey(apiKey))
	return &AnthropicProvider{
		client: &client,
		model:  model,
	}
}

func (p *AnthropicProvider) StreamMessage(ctx context.Context, messages []Message) (<-chan string, <-chan error) {
	textChan := make(chan string)
	errChan := make(chan error, 1)

	go func() {
		defer close(textChan)
		defer close(errChan)

		anthropicMessages := make([]anthropic.MessageParam, len(messages))
		for i, msg := range messages {
			if msg.Role == "user" {
				anthropicMessages[i] = anthropic.NewUserMessage(anthropic.NewTextBlock(msg.Content))
			} else {
				anthropicMessages[i] = anthropic.NewAssistantMessage(anthropic.NewTextBlock(msg.Content))
			}
		}

		stream := p.client.Messages.NewStreaming(ctx, anthropic.MessageNewParams{
			Model:     anthropic.Model(p.model),
			MaxTokens: 4096,
			Messages:  anthropicMessages,
		})

		for stream.Next() {
			event := stream.Current()
			if event.Type == "content_block_delta" && event.Delta.Type == "text_delta" {
				select {
				case textChan <- event.Delta.Text:
				case <-ctx.Done():
					errChan <- ctx.Err()
					return
				}
			}
		}

		if err := stream.Err(); err != nil && err != io.EOF {
			errChan <- err
		}
	}()

	return textChan, errChan
}
