package todo

import (
	"time"

	"github.com/google/uuid"
)

type TodoAttachment struct {
	ID          uuid.UUID `json:"id" db:"id"`
	TodoID      uuid.UUID `json:"todoId" db:"todo_id"`
	Name        string    `json:"name" db:"name"`
	UploadedBy  string    `json:"uploadedBy" db:"uploaded_by"`
	DownloadKey string    `json:"downloadKey" db:"download_key"`
	FileSize    *int64    `json:"fileSize" db:"file_size"`
	MimeType    *string   `json:"mimeType" db:"mime_type"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}
