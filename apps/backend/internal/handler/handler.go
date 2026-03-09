package handler

import (
	"github.com/DevanshBhavsar3/tareas/internal/server"
	"github.com/DevanshBhavsar3/tareas/internal/service"
)

type Handlers struct {
	Health *HealthHandler
}

func NewHandlers(s *server.Server, services *service.Services) *Handlers {
	return &Handlers{
		Health: NewHealthHandler(s),
	}
}
