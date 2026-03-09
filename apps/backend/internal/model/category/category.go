package category

import (
	"time"

	"github.com/google/uuid"
)

type Category struct {
	ID          uuid.UUID `json:"id" db:"id"`
	UserID      string    `json:"userId" db:"user_id"`
	Name        string    `json:"name" db:"name"`
	Color       string    `json:"color" db:"color"`
	Description *string   `json:"description" db:"description"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}
