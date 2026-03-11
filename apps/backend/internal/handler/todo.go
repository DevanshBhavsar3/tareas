package handler

import (
	"net/http"

	"github.com/DevanshBhavsar3/tareas/internal/middleware"
	"github.com/DevanshBhavsar3/tareas/internal/model/todo"
	"github.com/DevanshBhavsar3/tareas/internal/service"
	"github.com/labstack/echo/v4"
)

type TodoHandler struct {
	todoService *service.TodoService
}

func NewTodoHandler(todoService *service.TodoService) *TodoHandler {
	return &TodoHandler{
		todoService: todoService,
	}
}

func (h *TodoHandler) CreateTodo(c echo.Context) error {
	payload := &todo.CreateTodoPayload{}
	if err := BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	result, err := h.todoService.CreateTodo(c, userID, payload)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, result)
}

func (h *TodoHandler) GetTodoByID(c echo.Context) error {
	payload := &todo.GetTodoByIDPayload{}
	if err := BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	result, err := h.todoService.GetTodoByID(c, userID, payload)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, result)
}

func (h *TodoHandler) GetTodos(c echo.Context) error {
	payload := &todo.GetTodosPayload{}
	if err := BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	result, err := h.todoService.GetTodos(c, userID, payload)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, result)
}

func (h *TodoHandler) UpdateTodo(c echo.Context) error {
	payload := &todo.UpdateTodoPayload{}
	if err := BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	result, err := h.todoService.UpdateTodo(c, userID, payload)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, result)
}

func (h *TodoHandler) DeleteTodo(c echo.Context) error {
	payload := &todo.DeleteTodoPayload{}
	if err := BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	if err := h.todoService.DeleteTodo(c, userID, payload); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *TodoHandler) GetTodoStats(c echo.Context) error {
	userID := middleware.GetUserID(c)

	result, err := h.todoService.GetTodoStats(c, userID)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, result)
}
