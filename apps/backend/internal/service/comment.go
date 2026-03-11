package service

import (
	"github.com/DevanshBhavsar3/tareas/internal/middleware"
	"github.com/DevanshBhavsar3/tareas/internal/model/comment"
	"github.com/DevanshBhavsar3/tareas/internal/repository"
	"github.com/labstack/echo/v4"
)

type CommentService struct {
	commentRepo *repository.CommentRepository
	todoRepo    *repository.TodoRepository
}

func NewCommentService(commentRepo *repository.CommentRepository, todoRepo *repository.TodoRepository) *CommentService {
	return &CommentService{
		commentRepo: commentRepo,
		todoRepo:    todoRepo,
	}
}

func (s *CommentService) AddComment(ctx echo.Context, userID string, payload *comment.AddCommentPayload) (*comment.Comment, error) {
	logger := middleware.GetLogger(ctx)

	_, err := s.todoRepo.CheckTodoExists(ctx.Request().Context(), userID, payload.TodoID)
	if err != nil {
		logger.Error().Err(err).Msg("todo validation failed")
		return nil, err
	}

	commentItem, err := s.commentRepo.AddComment(ctx.Request().Context(), userID, payload)
	if err != nil {
		logger.Error().Err(err).Msg("failed to add comment")
		return nil, err
	}

	logger.Info().
		Str("event", "comment_added").
		Str("comment_id", commentItem.ID.String()).
		Str("todo_id", commentItem.TodoID.String()).
		Msg("Comment added successfully")

	return commentItem, nil
}

func (s *CommentService) GetCommentsByTodoID(ctx echo.Context, userID string, payload *comment.GetCommentsByTodoIDPayload) ([]comment.Comment, error) {
	logger := middleware.GetLogger(ctx)

	// Validate todo exists and belongs to user
	_, err := s.todoRepo.CheckTodoExists(ctx.Request().Context(), userID, payload.TodoID)
	if err != nil {
		logger.Error().Err(err).Msg("todo validation failed")
		return nil, err
	}

	comments, err := s.commentRepo.GetCommentsByTodoID(ctx.Request().Context(), userID, payload)
	if err != nil {
		logger.Error().Err(err).Msg("failed to fetch comments by todo ID")
		return nil, err
	}

	return comments, nil
}

func (s *CommentService) UpdateComment(ctx echo.Context, userID string, payload *comment.UpdateCommentPayload) (*comment.Comment, error) {
	logger := middleware.GetLogger(ctx)

	// Validate comment exists and belongs to user
	_, err := s.commentRepo.GetCommentByID(ctx.Request().Context(), userID, &comment.GetCommentByIDPayload{
		ID: payload.ID,
	})
	if err != nil {
		logger.Error().Err(err).Msg("comment validation failed")
		return nil, err
	}

	commentItem, err := s.commentRepo.UpdateComment(ctx.Request().Context(), userID, payload)
	if err != nil {
		logger.Error().Err(err).Msg("failed to update comment")
		return nil, err
	}

	logger.Info().
		Str("event", "comment_updated").
		Str("comment_id", commentItem.ID.String()).
		Msg("Comment updated successfully")

	return commentItem, nil
}

func (s *CommentService) DeleteComment(ctx echo.Context, userID string, payload *comment.DeleteCommentPayload) error {
	logger := middleware.GetLogger(ctx)

	// Validate comment exists and belongs to user
	_, err := s.commentRepo.GetCommentByID(ctx.Request().Context(), userID, &comment.GetCommentByIDPayload{
		ID: payload.ID,
	})
	if err != nil {
		logger.Error().Err(err).Msg("comment validation failed")
		return err
	}

	err = s.commentRepo.DeleteComment(ctx.Request().Context(), userID, payload)
	if err != nil {
		logger.Error().Err(err).Msg("failed to delete comment")
		return err
	}

	logger.Info().
		Str("event", "comment_deleted").
		Str("comment_id", payload.ID.String()).
		Msg("Comment deleted successfully")

	return nil
}
