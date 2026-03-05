package middleware

import (
	"context"

	"github.com/DevanshBhavsar3/tareas/internal/logger"
	"github.com/DevanshBhavsar3/tareas/internal/server"
	"github.com/labstack/echo/v4"
	"github.com/newrelic/go-agent/v3/newrelic"
	"github.com/rs/zerolog"
)

const (
	UserIDKey   = "user_id"
	UserRoleKey = "user_role"
	LoggerKey   = "logger"
)

type ContextEnhancer struct {
	server *server.Server
}

func NewContextEnhancer(s *server.Server) *ContextEnhancer {
	return &ContextEnhancer{
		server: s,
	}
}

func (ce *ContextEnhancer) EnhanceContext() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Extract request ID
			requestID := GetRequestID(c)

			// Create enhanced logger with request context
			contextLogger := ce.server.Logger.With().
				Str("request_id", requestID).
				Str("method", c.Request().Method).
				Str("path", c.Path()).
				Str("ip", c.RealIP()).
				Logger()

			// Add trace context if available
			if txn := newrelic.FromContext(c.Request().Context()); txn != nil {
				contextLogger = logger.WithTraceContext(contextLogger, txn)
			}

			// Extract user information from JWT token or session
			if userID := GetUserID(c); userID != "" {
				contextLogger = contextLogger.With().Str("user_id", userID).Logger()
			}

			if userRole := GetUserRole(c); userRole != "" {
				contextLogger = contextLogger.With().Str("user_role", userRole).Logger()
			}

			// Store the enhanced logger in context
			c.Set(LoggerKey, &contextLogger)

			// Create a new context with the logger
			ctx := context.WithValue(c.Request().Context(), LoggerKey, &contextLogger)
			c.SetRequest(c.Request().WithContext(ctx))

			return next(c)
		}
	}
}

func GetUserID(c echo.Context) string {
	if userID := c.Get(UserIDKey); userID != nil {
		return userID.(string)
	}

	return ""
}

func GetUserRole(c echo.Context) string {
	if userRole := c.Get(UserRoleKey); userRole != nil {
		return userRole.(string)
	}

	return ""
}

func GetLogger(c echo.Context) *zerolog.Logger {
	noOpLogger := zerolog.Nop()

	if logger := c.Get(LoggerKey); logger != nil {
		if log, ok := logger.(*zerolog.Logger); ok {
			return log
		}

		return &noOpLogger
	}

	// Fallback to a basic logger if not found
	return &noOpLogger
}
