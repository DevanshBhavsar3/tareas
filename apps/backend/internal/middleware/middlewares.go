package middleware

import (
	"github.com/DevanshBhavsar3/tareas/internal/server"
)

type Middlewares struct {
	Global          *GlobalMiddlewares
	Auth            *AuthMiddleware
	ContextEnhancer *ContextEnhancer
	Observability   *ObservabilityMiddleware
	RateLimit       *RateLimitMiddleware
	RequestId       *RequestIDMiddleware
}

func NewMiddlewares(s *server.Server) *Middlewares {
	return &Middlewares{
		Global:          NewGlobalMiddlewares(s),
		Auth:            NewAuthMiddleware(s),
		ContextEnhancer: NewContextEnhancer(s),
		Observability:   NewObservabilityMiddleware(s.LoggerService.NewRelicApp),
		RateLimit:       NewRateLimitMiddleware(s),
		RequestId:       NewRequestIDMiddleware(),
	}
}
