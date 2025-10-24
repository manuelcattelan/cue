package providers

import (
	"context"

	"google.golang.org/genai"
)

type GoogleProvider struct {
	client *genai.Client
	model  string
}

func NewGoogleProvider(apiKey, model string) (*GoogleProvider, error) {
	client, err := genai.NewClient(context.Background(), &genai.ClientConfig{
		APIKey: apiKey,
	})
	if err != nil {
		return nil, err
	}

	return &GoogleProvider{
		client: client,
		model:  model,
	}, nil
}

func (p *GoogleProvider) StreamMessage(ctx context.Context, messages []Message) (<-chan string, <-chan error) {
	textChan := make(chan string)
	errChan := make(chan error, 1)

	go func() {
		defer close(textChan)
		defer close(errChan)

		var contents []*genai.Content
		for _, msg := range messages {
			role := "user"
			if msg.Role == "assistant" {
				role = "model"
			}
			contents = append(contents, &genai.Content{
				Parts: []*genai.Part{{Text: msg.Content}},
				Role:  role,
			})
		}

		iter := p.client.Models.GenerateContentStream(ctx, p.model, contents, nil)

		for chunk, err := range iter {
			if err != nil {
				errChan <- err
				return
			}

			for _, candidate := range chunk.Candidates {
				if candidate.Content != nil {
					for _, part := range candidate.Content.Parts {
						if part.Text != "" {
							select {
							case textChan <- part.Text:
							case <-ctx.Done():
								errChan <- ctx.Err()
								return
							}
						}
					}
				}
			}
		}
	}()

	return textChan, errChan
}
