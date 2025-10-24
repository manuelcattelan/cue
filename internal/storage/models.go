package storage

import "time"

type Conversation struct {
	ID        int64
	Provider  string
	Model     string
	CreatedAt time.Time
}

type Message struct {
	ID             int64
	ConversationID int64
	Role           string
	Content        string
	CreatedAt      time.Time
}
