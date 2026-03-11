package router

import (
	"github.com/DevanshBhavsar3/tareas/internal/handler"
	"github.com/DevanshBhavsar3/tareas/internal/middleware"
	v1 "github.com/DevanshBhavsar3/tareas/internal/router/v1"
	"github.com/DevanshBhavsar3/tareas/internal/server"
	"github.com/labstack/echo/v4"
)

func NewRouter(s *server.Server, handlers *handler.Handlers) *echo.Echo {
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
	router.GET("/status", handlers.Health.CheckHealth)
	router.GET("/docs", handler.ServeOpenAPIUI)

	router.Static("/static", "static")

	// register versioned routes
	v1.RegisterV1Routes(router, middlewares, handlers)

	return router
}
