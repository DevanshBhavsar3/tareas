package service

import (
	"github.com/DevanshBhavsar3/tareas/internal/errs"
	"github.com/DevanshBhavsar3/tareas/internal/middleware"
	"github.com/DevanshBhavsar3/tareas/internal/model/category"
	"github.com/DevanshBhavsar3/tareas/internal/model/todo"
	"github.com/DevanshBhavsar3/tareas/internal/repository"
	"github.com/labstack/echo/v4"
)

type TodoService struct {
	todoRepo     *repository.TodoRepository
	categoryRepo *repository.CategoryRepository
}

func NewTodoService(todoRepo *repository.TodoRepository, categoryRepo *repository.CategoryRepository) *TodoService {
	return &TodoService{
		todoRepo:     todoRepo,
		categoryRepo: categoryRepo,
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
