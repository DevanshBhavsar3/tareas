package middleware

import (
	"net/http"

	"github.com/DevanshBhavsar3/tareas/internal/server"
	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
	"golang.org/x/time/rate"
)

type RateLimitMiddleware struct {
	server *server.Server
}

func NewRateLimitMiddleware(s *server.Server) *RateLimitMiddleware {
	return &RateLimitMiddleware{
		server: s,
	}
}

func (r *RateLimitMiddleware) RateLimiter() echo.MiddlewareFunc {
	return echoMiddleware.RateLimiterWithConfig(echoMiddleware.RateLimiterConfig{
		Store: echoMiddleware.NewRateLimiterMemoryStore(rate.Limit(20)),
		DenyHandler: func(c echo.Context, identifier string, err error) error {
			// Record rate limit hit metrics
			if r.server.LoggerService != nil && r.server.LoggerService.NewRelicApp != nil {
				r.server.LoggerService.NewRelicApp.RecordCustomEvent("RateLimitHit", map[string]interface{}{
					"endpoint": c.Path(),
				})
			}

			r.server.Logger.Warn().
				Str("request_id", GetRequestID(c)).
				Str("identifier", identifier).
				Str("path", c.Path()).
				Str("method", c.Request().Method).
				Str("ip", c.RealIP()).
				Msg("rate limit exceeded")

			return echo.NewHTTPError(http.StatusTooManyRequests, "Rate limit exceeded")
		},
	})
}
