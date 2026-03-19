package v1

import (
	"github.com/DevanshBhavsar3/tareas/internal/handler"
	"github.com/DevanshBhavsar3/tareas/internal/middleware"
	"github.com/labstack/echo/v4"
)

func registerCommentRoutes(r *echo.Group, m *middleware.Middlewares, h *handler.Handlers) {
	comments := r.Group("/comments", m.Auth.RequireAuth)

	comments.PATCH("/:id", h.Comment.UpdateComment)
	comments.DELETE("/:id", h.Comment.DeleteComment)
}
