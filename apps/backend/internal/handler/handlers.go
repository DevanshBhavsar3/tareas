package handler

import (
	"github.com/DevanshBhavsar3/tareas/internal/server"
	"github.com/DevanshBhavsar3/tareas/internal/service"
)

type Handlers struct {
	Todo     *TodoHandler
	Comment  *CommentHandler
	Category *CategoryHandler
	Health   *HealthHandler
}

func NewHandlers(s *server.Server, services *service.Services) *Handlers {
	return &Handlers{
		Todo:     NewTodoHandler(services.Todo),
		Comment:  NewCommentHandler(services.Comment),
		Category: NewCategoryHandler(services.Category),
		Health:   NewHealthHandler(s),
	}
}
