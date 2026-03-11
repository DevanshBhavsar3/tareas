package v1

import (
	"github.com/DevanshBhavsar3/tareas/internal/handler"
	"github.com/DevanshBhavsar3/tareas/internal/middleware"
	"github.com/labstack/echo/v4"
)

func RegisterV1Routes(r *echo.Echo, m *middleware.Middlewares, h *handler.Handlers) {
	v1Router := r.Group("/api/v1")

	// Todo operations
	registerTodoRoutes(v1Router, m, h)

	// Category operations
	registerCategoryRoutes(v1Router, m, h)

	// Comment operations
	registerCommentRoutes(v1Router, m, h)
}
