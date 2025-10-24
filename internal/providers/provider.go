package providers

import "context"

type Message struct {
	Role    string
	Content string
}

type Provider interface {
	StreamMessage(ctx context.Context, messages []Message) (<-chan string, <-chan error)
}
