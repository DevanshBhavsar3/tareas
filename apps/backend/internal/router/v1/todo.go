package v1

import (
	"github.com/DevanshBhavsar3/tareas/internal/handler"
	"github.com/DevanshBhavsar3/tareas/internal/middleware"
	"github.com/labstack/echo/v4"
)

func registerTodoRoutes(r *echo.Group, m *middleware.Middlewares, h *handler.Handlers) {
	todos := r.Group("/todos", m.Auth.RequireAuth)

	todos.POST("", h.Todo.CreateTodo)
	todos.GET("", h.Todo.GetTodos)
	todos.GET("/stats", h.Todo.GetTodoStats)

	todos.GET("/:id", h.Todo.GetTodoByID)
	todos.PATCH("/:id", h.Todo.UpdateTodo)
	todos.DELETE("/:id", h.Todo.DeleteTodo)

	todos.POST("/:id/comments", h.Comment.AddComment)
	todos.GET("/:id/comments", h.Comment.GetCommentsByTodoID)
}
