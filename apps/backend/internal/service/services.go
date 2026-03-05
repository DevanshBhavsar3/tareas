package service

import (
	"github.com/DevanshBhavsar3/tareas/internal/lib/job"
	"github.com/DevanshBhavsar3/tareas/internal/repository"
	"github.com/DevanshBhavsar3/tareas/internal/server"
)

type Services struct {
	Auth *AuthService
	Job  *job.JobService
}

func NewServices(s *server.Server, repos *repository.Repositories) *Services {
	return &Services{
		Auth: NewAuthService(s),
		Job:  s.Job,
	}
}
