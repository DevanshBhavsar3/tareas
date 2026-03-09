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
		middlewares.Global.Recover(),
		middlewares.RequestId.RequestID(),
		middlewares.Global.Secure(),
		middlewares.Global.CORS(),
		middlewares.RateLimit.RateLimiter(),
		middlewares.Observability.NewRelicMiddleware(),
		middlewares.ContextEnhancer.EnhanceContext(),
		middlewares.Global.RequestLogger(),
		middlewares.Observability.RequestObservability(),
	)

	// register system routes
	router.GET("/status", h.Health.CheckHealth)
	router.GET("/docs", handler.ServeOpenAPIUI)

	router.Static("/static", "static")

	// register versioned routes
	router.Group("/api/v1")

	return router
}
