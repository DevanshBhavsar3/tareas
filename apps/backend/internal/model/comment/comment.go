package comment

import (
	"time"

	"github.com/google/uuid"
)

type Comment struct {
	ID        uuid.UUID `json:"id" db:"id"`
	UserID    string    `json:"userId" db:"user_id"`
	TodoID    uuid.UUID `json:"todoId" db:"todo_id"`
	Content   string    `json:"content" db:"content"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}
