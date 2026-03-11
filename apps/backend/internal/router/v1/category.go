package v1

import (
	"github.com/DevanshBhavsar3/tareas/internal/handler"
	"github.com/DevanshBhavsar3/tareas/internal/middleware"
	"github.com/labstack/echo/v4"
)

func registerCategoryRoutes(r *echo.Group, m *middleware.Middlewares, h *handler.Handlers) {
	categories := r.Group("/category", m.Auth.RequireAuth)

	categories.POST("/", h.Category.CreateCategory)
	categories.GET("/", h.Category.GetCategories)

	categories.PATCH("/:id", h.Category.UpdateCategory)
	categories.DELETE("/:id", h.Category.DeleteCategory)
}
