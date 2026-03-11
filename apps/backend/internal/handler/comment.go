package handler

import (
	"net/http"

	"github.com/DevanshBhavsar3/tareas/internal/middleware"
	"github.com/DevanshBhavsar3/tareas/internal/model/comment"
	"github.com/DevanshBhavsar3/tareas/internal/service"
	"github.com/labstack/echo/v4"
)

type CommentHandler struct {
	commentService *service.CommentService
}

func NewCommentHandler(commentService *service.CommentService) *CommentHandler {
	return &CommentHandler{
		commentService: commentService,
	}
}

func (h *CommentHandler) AddComment(c echo.Context) error {
	payload := &comment.AddCommentPayload{}
	if err := BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	result, err := h.commentService.AddComment(c, userID, payload)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, result)
}

func (h *CommentHandler) GetCommentsByTodoID(c echo.Context) error {
	payload := &comment.GetCommentsByTodoIDPayload{}
	if err := BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	result, err := h.commentService.GetCommentsByTodoID(c, userID, payload)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, result)
}

func (h *CommentHandler) UpdateComment(c echo.Context) error {
	payload := &comment.UpdateCommentPayload{}
	if err := BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	result, err := h.commentService.UpdateComment(c, userID, payload)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, result)
}

func (h *CommentHandler) DeleteComment(c echo.Context) error {
	payload := &comment.DeleteCommentPayload{}
	if err := BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	if err := h.commentService.DeleteComment(c, userID, payload); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}
