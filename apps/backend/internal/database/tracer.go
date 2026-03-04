package database

import (
	"context"

	"github.com/jackc/pgx/v5"
)

type multiQueryTracer struct {
	tracers []pgx.QueryTracer
}

// TraceQueryStart implements pgx tracer interface
func (m *multiQueryTracer) TraceQueryStart(ctx context.Context, conn *pgx.Conn, data pgx.TraceQueryStartData) context.Context {
	for _, t := range m.tracers {
		ctx = t.TraceQueryStart(ctx, conn, data)
	}
	return ctx
}

// TraceQueryEnd implements pgx tracer interface
func (m *multiQueryTracer) TraceQueryEnd(ctx context.Context, conn *pgx.Conn, data pgx.TraceQueryEndData) {
	for _, t := range m.tracers {
		t.TraceQueryEnd(ctx, conn, data)
	}
}
