package repository

import "github.com/DevanshBhavsar3/tareas/internal/server"

type Repositories struct{}

func NewRepositories(s *server.Server) *Repositories {
	return &Repositories{}
}
