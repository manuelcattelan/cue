package storage

import (
	"database/sql"
	"time"

	_ "modernc.org/sqlite"
)

type DB struct {
	conn *sql.DB
}

func NewDB(path string) (*DB, error) {
	conn, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}

	db := &DB{conn: conn}
	if err := db.createTables(); err != nil {
		return nil, err
	}

	return db, nil
}

func (db *DB) createTables() error {
	_, err := db.conn.Exec(`
		CREATE TABLE IF NOT EXISTS conversations (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			provider TEXT NOT NULL,
			model TEXT NOT NULL,
			created_at DATETIME NOT NULL
		);

		CREATE TABLE IF NOT EXISTS messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			conversation_id INTEGER NOT NULL,
			role TEXT NOT NULL,
			content TEXT NOT NULL,
			created_at DATETIME NOT NULL,
			FOREIGN KEY (conversation_id) REFERENCES conversations(id)
		);
	`)
	return err
}

func (db *DB) CreateConversation(provider, model string) (*Conversation, error) {
	result, err := db.conn.Exec(
		"INSERT INTO conversations (provider, model, created_at) VALUES (?, ?, ?)",
		provider, model, time.Now(),
	)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return &Conversation{
		ID:        id,
		Provider:  provider,
		Model:     model,
		CreatedAt: time.Now(),
	}, nil
}

func (db *DB) SaveMessage(conversationID int64, role, content string) error {
	_, err := db.conn.Exec(
		"INSERT INTO messages (conversation_id, role, content, created_at) VALUES (?, ?, ?, ?)",
		conversationID, role, content, time.Now(),
	)
	return err
}

func (db *DB) GetConversation(id int64) ([]Message, error) {
	rows, err := db.conn.Query(
		"SELECT id, conversation_id, role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
		id,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var msg Message
		if err := rows.Scan(&msg.ID, &msg.ConversationID, &msg.Role, &msg.Content, &msg.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}

	return messages, rows.Err()
}

func (db *DB) ListConversations() ([]Conversation, error) {
	rows, err := db.conn.Query(
		"SELECT id, provider, model, created_at FROM conversations ORDER BY created_at DESC",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var conversations []Conversation
	for rows.Next() {
		var conv Conversation
		if err := rows.Scan(&conv.ID, &conv.Provider, &conv.Model, &conv.CreatedAt); err != nil {
			return nil, err
		}
		conversations = append(conversations, conv)
	}

	return conversations, rows.Err()
}

func (db *DB) Close() error {
	return db.conn.Close()
}
