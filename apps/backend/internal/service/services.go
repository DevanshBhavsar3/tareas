package service

import (
	"github.com/DevanshBhavsar3/tareas/internal/lib/job"
	"github.com/DevanshBhavsar3/tareas/internal/repository"
	"github.com/DevanshBhavsar3/tareas/internal/server"
)

type Services struct {
	Todo     *TodoService
	Comment  *CommentService
	Category *CategoryService
	Auth     *AuthService
	Job      *job.JobService
}

func NewServices(s *server.Server, repos *repository.Repositories) *Services {
	return &Services{
		Todo:     NewTodoService(repos.Todo, repos.Category),
		Comment:  NewCommentService(repos.Comment, repos.Todo),
		Category: NewCategoryService(repos.Category),
		Auth:     NewAuthService(s),
		Job:      s.Job,
	}
}
