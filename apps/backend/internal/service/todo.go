package service

import (
	"net/http"

	"github.com/DevanshBhavsar3/tareas/internal/errs"
	"github.com/DevanshBhavsar3/tareas/internal/lib/aws"
	"github.com/DevanshBhavsar3/tareas/internal/middleware"
	"github.com/DevanshBhavsar3/tareas/internal/model/category"
	"github.com/DevanshBhavsar3/tareas/internal/model/todo"
	"github.com/DevanshBhavsar3/tareas/internal/repository"
	"github.com/DevanshBhavsar3/tareas/internal/server"
	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"
)

type TodoService struct {
	server       *server.Server
	todoRepo     *repository.TodoRepository
	categoryRepo *repository.CategoryRepository
	awsClient    *aws.AWS
}

func NewTodoService(server *server.Server, todoRepo *repository.TodoRepository, categoryRepo *repository.CategoryRepository, awsClient *aws.AWS) *TodoService {
	return &TodoService{
		server:       server,
		todoRepo:     todoRepo,
		categoryRepo: categoryRepo,
		awsClient:    awsClient,
	}
}

func (s *TodoService) CreateTodo(ctx echo.Context, userID string, payload *todo.CreateTodoPayload) (*todo.Todo, error) {
	logger := middleware.GetLogger(ctx)

	if payload.ParentTodoID != nil {
		parentTodo, err := s.todoRepo.CheckTodoExists(ctx.Request().Context(), userID, *payload.ParentTodoID)
		if err != nil {
			logger.Error().Err(err).Msg("parent todo does not exists")
			return nil, err
		}

		if !parentTodo.CanHaveChild() {
			err := errs.NewBadRequestError("Provided parent todo cannot have child todos.", false, nil, nil, nil)
			logger.Warn().Msg("provided parent todo cannot have child")
			return nil, err
		}
	}

	if payload.CategoryID != nil {
		_, err := s.categoryRepo.GetCategoryByID(ctx.Request().Context(), userID, &category.GetCategoryByIDPayload{
			ID: *payload.CategoryID,
		})
		if err != nil {
			logger.Error().Err(err).Msg("provided category not found")
			return nil, err
		}
	}

	todoItem, err := s.todoRepo.CreateTodo(ctx.Request().Context(), userID, payload)
	if err != nil {
		logger.Error().Err(err).Msg("failed to create todo")
		return nil, err
	}

	logger.Info().
		Str("event", "todo_created").
		Str("todo_id", todoItem.ID.String()).
		Str("title", todoItem.Title).
		Str("category_id", func() string {
			if todoItem.CategoryID != nil {
				return todoItem.CategoryID.String()
			}
			return ""
		}()).
		Str("priority", string(todoItem.Priority)).
		Msg("Todo created successfully")

	return todoItem, nil
}

func (s *TodoService) GetTodoByID(ctx echo.Context, userID string, payload *todo.GetTodoByIDPayload) (*todo.PopulatedTodo, error) {
	logger := middleware.GetLogger(ctx)

	todoItem, err := s.todoRepo.GetTodoByID(ctx.Request().Context(), userID, payload)
	if err != nil {
		logger.Error().Err(err).Msg("failed to fetch todo by ID")
		return nil, err
	}

	return todoItem, nil
}

func (s *TodoService) GetTodos(ctx echo.Context, userID string, payload *todo.GetTodosPayload) (*todo.PaginatedPopulatedTodoResponse, error) {
	logger := middleware.GetLogger(ctx)

	todos, err := s.todoRepo.GetTodos(ctx.Request().Context(), userID, payload)
	if err != nil {
		logger.Error().Err(err).Msg("failed to fetch todos")
		return nil, err
	}

	return todos, nil
}

func (s *TodoService) UpdateTodo(ctx echo.Context, userID string, payload *todo.UpdateTodoPayload) (*todo.Todo, error) {
	logger := middleware.GetLogger(ctx)

	// Validate parent todo exists and belongs to user (if provided)
	if payload.ParentTodoID != nil {
		parentTodo, err := s.todoRepo.CheckTodoExists(ctx.Request().Context(), userID, payload.ID)
		if err != nil {
			logger.Error().Err(err).Msg("parent todo does not exists")
			return nil, err
		}

		if parentTodo.ID == payload.ID {
			err := errs.NewBadRequestError("Todo cannot be its own parent", false, nil, nil, nil)
			logger.Warn().Msg("todo cannot be its own parent")
			return nil, err
		}

		if !parentTodo.CanHaveChild() {
			err := errs.NewBadRequestError("Provided parent todo cannot have child todos.", false, nil, nil, nil)
			logger.Warn().Msg("provided parent todo cannot have child")
			return nil, err
		}

		logger.Debug().Msg("parent todo validation passed")
	}

	// Validate category exists and belongs to user (if provided)
	if payload.CategoryID != nil {
		_, err := s.categoryRepo.GetCategoryByID(ctx.Request().Context(), userID, &category.GetCategoryByIDPayload{
			ID: *payload.CategoryID,
		})
		if err != nil {
			logger.Error().Err(err).Msg("category validation failed")
			return nil, err
		}

		logger.Debug().Msg("category validation passed")
	}

	updatedTodo, err := s.todoRepo.UpdateTodo(ctx.Request().Context(), userID, payload)
	if err != nil {
		logger.Error().Err(err).Msg("failed to update todo")
		return nil, err
	}

	logger.Info().
		Str("event", "todo_updated").
		Str("todo_id", updatedTodo.ID.String()).
		Str("title", updatedTodo.Title).
		Str("category_id", func() string {
			if updatedTodo.CategoryID != nil {
				return updatedTodo.CategoryID.String()
			}
			return ""
		}()).
		Str("priority", string(updatedTodo.Priority)).
		Str("status", string(updatedTodo.Status)).
		Msg("Todo updated successfully")

	return updatedTodo, nil
}

func (s *TodoService) DeleteTodo(ctx echo.Context, userID string, payload *todo.DeleteTodoPayload) error {
	logger := middleware.GetLogger(ctx)

	err := s.todoRepo.DeleteTodo(ctx.Request().Context(), userID, payload)
	if err != nil {
		logger.Error().Err(err).Msg("failed to delete todo")
		return err
	}

	logger.Info().
		Str("event", "todo_deleted").
		Str("todo_id", payload.ID.String()).
		Msg("Todo deleted successfully")

	return nil
}

func (s *TodoService) GetTodoStats(ctx echo.Context, userID string) (*todo.TodoStats, error) {
	logger := middleware.GetLogger(ctx)

	stats, err := s.todoRepo.GetTodoStats(ctx.Request().Context(), userID)
	if err != nil {
		logger.Error().Err(err).Msg("failed to fetch todo statistics")
		return nil, err
	}

	return stats, nil
}

func (s *TodoService) UploadTodoAttachment(ctx echo.Context, userID string, payload *todo.UploadTodoAttachmentPayload) (*todo.TodoAttachment, error) {
	logger := middleware.GetLogger(ctx)

	_, err := s.todoRepo.CheckTodoExists(ctx.Request().Context(), userID, payload.TodoID)
	if err != nil {
		logger.Error().Err(err).Msg("todo validation failed")
		return nil, err
	}

	src, err := payload.File.Open()
	if err != nil {
		logger.Error().Err(err).Msg("failed to open uploaded file")
		return nil, errs.NewBadRequestError("failed to open uploaded file", false, nil, nil, nil)
	}
	defer src.Close()

	s3Key, err := s.awsClient.S3.UploadFile(
		ctx.Request().Context(),
		s.server.Config.AWS.UploadBucket,
		"todos/attachments/"+payload.File.Filename,
		src,
	)
	if err != nil {
		logger.Error().Err(err).Msg("failed to upload file to S3")
		return nil, errors.Wrap(err, "failed to upload file")
	}

	src, err = payload.File.Open()
	if err != nil {
		logger.Error().Err(err).Msg("failed to reopen file for MIME detection")
		return nil, errs.NewBadRequestError("failed to process file", false, nil, nil, nil)
	}
	defer src.Close()

	buffer := make([]byte, 512)
	_, err = src.Read(buffer)
	if err != nil {
		logger.Error().Err(err).Msg("failed to read file for MIME detection")
		return nil, errs.NewBadRequestError("failed to process file", false, nil, nil, nil)
	}

	mimeType := http.DetectContentType(buffer)

	attachment, err := s.todoRepo.UploadTodoAttachment(
		ctx.Request().Context(),
		payload.TodoID,
		payload.File.Filename,
		userID,
		s3Key,
		payload.File.Size,
		mimeType,
	)
	if err != nil {
		logger.Error().Err(err).Msg("failed to create attachment record")
		return nil, err
	}

	logger.Info().
		Str("attachment_id", attachment.ID.String()).
		Str("s3_key", s3Key).
		Msg("uploaded todo attachment")

	return attachment, nil
}

func (s *TodoService) DeleteTodoAttachment(ctx echo.Context, userID string, payload *todo.DeleteTodoAttachmentPayload) error {
	logger := middleware.GetLogger(ctx)

	_, err := s.todoRepo.CheckTodoExists(ctx.Request().Context(), userID, payload.TodoID)
	if err != nil {
		logger.Error().Err(err).Msg("todo validation failed")
		return err
	}

	attachment, err := s.todoRepo.GetTodoAttachment(
		ctx.Request().Context(),
		payload.TodoID,
		payload.AttachmentId,
	)
	if err != nil {
		logger.Error().Err(err).Msg("failed to get attachment details")
		return err
	}

	err = s.todoRepo.DeleteTodoAttachment(ctx.Request().Context(), payload)
	if err != nil {
		logger.Error().Err(err).Msg("failed to delete attachment record")
		return err
	}

	go func() {
		err := s.awsClient.S3.DeleteObject(
			ctx.Request().Context(),
			s.server.Config.AWS.UploadBucket,
			attachment.DownloadKey,
		)
		if err != nil {
			s.server.Logger.Error().
				Err(err).
				Str("s3_key", attachment.DownloadKey).
				Msg("failed to delete attachment from S3")
		}
	}()

	logger.Info().Msg("deleted todo attachment")

	return nil
}

func (s *TodoService) GetTodoAttachmentURL(ctx echo.Context, userID string, payload *todo.GetAttachmentURLPayload) (string, error) {
	logger := middleware.GetLogger(ctx)

	_, err := s.todoRepo.CheckTodoExists(ctx.Request().Context(), userID, payload.TodoID)
	if err != nil {
		logger.Error().Err(err).Msg("todo validation failed")
		return "", err
	}

	attachment, err := s.todoRepo.GetTodoAttachment(
		ctx.Request().Context(),
		payload.TodoID,
		payload.AttachmentId,
	)
	if err != nil {
		logger.Error().Err(err).Msg("failed to get attachment details")
		return "", err
	}

	url, err := s.awsClient.S3.CreatePresignedURL(
		ctx.Request().Context(),
		s.server.Config.AWS.UploadBucket,
		attachment.DownloadKey,
	)
	if err != nil {
		logger.Error().Err(err).Msg("failed to generate presigned URL")
		return "", err
	}

	return url, nil
}
