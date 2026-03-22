package handler

import (
	"net/http"

	"github.com/DevanshBhavsar3/tareas/internal/errs"
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

func (h *TodoHandler) UploadTodoAttachment(c echo.Context) error {
	payload := &todo.UploadTodoAttachmentPayload{}
	if err := BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	form, err := c.MultipartForm()
	if err != nil {
		return errs.NewBadRequestError("multipart form not found", false, nil, nil, nil)
	}

	files := form.File["file"]
	if len(files) == 0 {
		return errs.NewBadRequestError("no file found", false, nil, nil, nil)
	}

	if len(files) > 1 {
		return errs.NewBadRequestError("only one file allowed per upload", false, nil, nil, nil)
	}

	payload.File = files[0]

	result, err := h.todoService.UploadTodoAttachment(c, userID, payload)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, result)
}

func (h *TodoHandler) DeleteTodoAttachment(c echo.Context) error {
	payload := &todo.DeleteTodoAttachmentPayload{}
	if err := BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	if err := h.todoService.DeleteTodoAttachment(c, userID, payload); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *TodoHandler) GetTodoAttachmentURL(c echo.Context) error {
	payload := &todo.GetAttachmentURLPayload{}
	if err := BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	url, err := h.todoService.GetTodoAttachmentURL(c, userID, payload)
	if err != nil {
		return err
	}

	result := &struct {
		URL string `json:"url"`
	}{
		URL: url,
	}

	return c.JSON(http.StatusOK, result)
}
