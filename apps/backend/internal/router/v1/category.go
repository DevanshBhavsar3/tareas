package v1

import (
	"github.com/DevanshBhavsar3/tareas/internal/handler"
	"github.com/DevanshBhavsar3/tareas/internal/middleware"
	"github.com/labstack/echo/v4"
)

func registerCategoryRoutes(r *echo.Group, m *middleware.Middlewares, h *handler.Handlers) {
	categories := r.Group("/categories", m.Auth.RequireAuth)

	categories.POST("", h.Category.CreateCategory)
	categories.GET("", h.Category.GetCategories)

	dynamicCategory := categories.Group("/:id")
	dynamicCategory.GET("", h.Category.GetCategoryById)
	dynamicCategory.PATCH("", h.Category.UpdateCategory)
	dynamicCategory.DELETE("", h.Category.DeleteCategory)
}
