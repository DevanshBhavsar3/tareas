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

	dynamicTodo := todos.Group("/:id")
	dynamicTodo.GET("", h.Todo.GetTodoByID)
	dynamicTodo.PATCH("", h.Todo.UpdateTodo)
	dynamicTodo.DELETE("", h.Todo.DeleteTodo)

	todoComments := dynamicTodo.Group("/comments")
	todoComments.POST("", h.Comment.AddComment)
	todoComments.GET("", h.Comment.GetCommentsByTodoID)

	todoAttachments := dynamicTodo.Group("/attachments")
	todoAttachments.POST("", h.Todo.UploadTodoAttachment)
	todoAttachments.GET("/:attachmentId/download", h.Todo.GetTodoAttachmentURL)
	todoAttachments.DELETE("/:attachmentId", h.Todo.DeleteTodoAttachment)
}
