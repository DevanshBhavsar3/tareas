package handler

import (
	"net/http"

	"github.com/DevanshBhavsar3/tareas/internal/middleware"
	"github.com/DevanshBhavsar3/tareas/internal/model/category"
	"github.com/DevanshBhavsar3/tareas/internal/service"
	"github.com/DevanshBhavsar3/tareas/internal/validator"
	"github.com/labstack/echo/v4"
)

type CategoryHandler struct {
	categoryService *service.CategoryService
}

func NewCategoryHandler(categoryService *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{
		categoryService: categoryService,
	}
}

func (h *CategoryHandler) CreateCategory(c echo.Context) error {
	payload := &category.CreateCategoryPayload{}
	if err := validator.BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	result, err := h.categoryService.CreateCategory(c, userID, payload)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, result)
}

func (h *CategoryHandler) GetCategories(c echo.Context) error {
	payload := &category.GetCategoriesPayload{}
	if err := validator.BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	result, err := h.categoryService.GetCategories(c, userID, payload)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, result)
}

func (h *CategoryHandler) GetCategoryById(c echo.Context) error {
	payload := &category.GetCategoryByIDPayload{}
	if err := validator.BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	result, err := h.categoryService.GetCategoryByID(c, userID, payload)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, result)
}

func (h *CategoryHandler) UpdateCategory(c echo.Context) error {
	payload := &category.UpdateCategoryPayload{}
	if err := validator.BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	result, err := h.categoryService.UpdateCategory(c, userID, payload)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, result)
}

func (h *CategoryHandler) DeleteCategory(c echo.Context) error {
	payload := &category.DeleteCategoryPayload{}
	if err := validator.BindAndValidate(c, payload); err != nil {
		return err
	}

	userID := middleware.GetUserID(c)

	if err := h.categoryService.DeleteCategory(c, userID, payload); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}
