package router

import (
	"github.com/DevanshBhavsar3/tareas/internal/handler"
	"github.com/DevanshBhavsar3/tareas/internal/middleware"
	"github.com/DevanshBhavsar3/tareas/internal/server"
	"github.com/labstack/echo/v4"
)

func NewRouter(s *server.Server, h *handler.Handlers) *echo.Echo {
	middlewares := middleware.NewMiddlewares(s)

	router := echo.New()

	router.HTTPErrorHandler = middlewares.Global.GlobalErrorHandler

	// global middlewares
	router.Use(
		middlewares.RateLimit.RateLimiter(),
		middlewares.Global.CORS(),
		middlewares.Global.Secure(),
		middlewares.RequestId.RequestID(),
		middlewares.Tracing.NewRelicMiddleware(),
		middlewares.Tracing.EnhanceTracing(),
		middlewares.ContextEnhancer.EnhanceContext(),
		middlewares.Global.RequestLogger(),
		middlewares.Global.Recover(),
	)

	// register system routes
	router.GET("/status", h.Health.CheckHealth)
	router.GET("/docs", h.OpenAPI.ServeOpenAPIUI)

	router.Static("/static", "static")

	// register versioned routes
	router.Group("/api/v1")

	return router
}
