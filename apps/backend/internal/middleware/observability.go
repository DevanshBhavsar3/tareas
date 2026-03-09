package middleware

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/newrelic/go-agent/v3/integrations/nrecho-v4"
	"github.com/newrelic/go-agent/v3/integrations/nrpkgerrors"
	"github.com/newrelic/go-agent/v3/newrelic"
)

type ObservabilityMiddleware struct {
	nrApp *newrelic.Application
}

func NewObservabilityMiddleware(nrApp *newrelic.Application) *ObservabilityMiddleware {
	return &ObservabilityMiddleware{
		nrApp: nrApp,
	}
}

// NewRelicMiddleware returns the New Relic middleware for Echo
func (om *ObservabilityMiddleware) NewRelicMiddleware() echo.MiddlewareFunc {
	if om.nrApp == nil {
		// Return a no-op middleware if New Relic is not initialized
		return func(next echo.HandlerFunc) echo.HandlerFunc {
			return next
		}
	}
	return nrecho.Middleware(om.nrApp)
}

// TraceRequests adds custom attributes to New Relic transactions and add observability to all the http handlers
func (tm *ObservabilityMiddleware) RequestObservability() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()

			req := c.Request()
			res := c.Response()

			method := req.Method
			route := c.Path()

			// Get New Relic transaction from context
			txn := newrelic.FromContext(req.Context())
			if txn != nil {
				txn.AddAttribute("http.real_ip", c.RealIP())
				txn.AddAttribute("http.user_agent", req.UserAgent())
				txn.AddAttribute("http.method", method)
				txn.AddAttribute("http.route", route)

				// Add request ID if available
				if requestID := GetRequestID(c); requestID != "" {
					txn.AddAttribute("request.id", requestID)
				}

				// Add user context if available
				if userID := GetUserID(c); userID != "" {
					txn.AddAttribute("user.id", userID)
				}
			}

			// Execute handler with observability
			err := next(c)

			duration := time.Since(start)
			status := res.Status

			// Record success metrics and tracing
			if txn != nil {
				if err != nil {
					// Record error if any with enhanced stack traces
					txn.NoticeError(nrpkgerrors.Wrap(err))
				}
				txn.AddAttribute("duration_ms", duration.Milliseconds())
				txn.AddAttribute("http.status_code", status)
			}

			return err
		}
	}
}
