package service

import (
	"fmt"

	"github.com/DevanshBhavsar3/tareas/internal/lib/aws"
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

func NewServices(s *server.Server, repos *repository.Repositories) (*Services, error) {
	awsClient, err := aws.New(s)
	if err != nil {
		return nil, fmt.Errorf("failed to create AWS client: %w", err)
	}

	authService := NewAuthService(s)

	s.Job.SetAuthService(authService)

	return &Services{
		Todo:     NewTodoService(s, repos.Todo, repos.Category, awsClient),
		Comment:  NewCommentService(repos.Comment, repos.Todo),
		Category: NewCategoryService(repos.Category),
		Auth:     authService,
		Job:      s.Job,
	}, nil
}
