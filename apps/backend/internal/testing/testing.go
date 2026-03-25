package testing

import (
	"context"
	"os"
	"testing"

	"github.com/DevanshBhavsar3/tareas/internal/config"
	"github.com/DevanshBhavsar3/tareas/internal/database"
	"github.com/DevanshBhavsar3/tareas/internal/server"
	"github.com/rs/zerolog"
)

type Test struct {
	Config *config.Config
	DB     *TestDB
	Server *server.Server
}

func NewTest(t *testing.T) *Test {
	t.Helper()

	cfg := &config.Config{
		Primary: config.PrimaryConfig{
			Env: "test",
		},
		Server: config.ServerConfig{
			Port:               "3001",
			ReadTimeout:        30,
			WriteTimeout:       30,
			IdleTimeout:        30,
			CORSAllowedOrigins: []string{"*"},
		},
		Database: config.DatabaseConfig{
			User:            "test_user",
			Password:        "test_password",
			Name:            "test_db",
			SSLMode:         "disable",
			Port:            5432,
			MaxOpenConns:    25,
			MaxIdleConns:    25,
			ConnMaxLifetime: 300,
			ConnMaxIdleTime: 300,
		},
		Integration: config.IntegrationConfig{
			ResendAPIKey: "test-key",
		},
		Redis: config.RedisConfig{
			Address: "localhost:6379",
		},
		Auth: config.AuthConfig{
			SecretKey: "test-secret",
		},
		Observability: config.ObservabilityConfig{
			ServiceName: "tareas-test",
			Environment: "test",
			Logging: config.LoggingConfig{
				Level:  "info",
				Format: "json",
			},
			NewRelic: config.NewRelicConfig{
				LicenseKey:                "",
				AppLogForwardingEnabled:   false,
				DistributedTracingEnabled: false,
				DebugLogging:              false,
			},
		},
	}

	logger := zerolog.New(zerolog.ConsoleWriter{Out: os.Stdout}).
		Level(zerolog.InfoLevel).
		With().
		Timestamp().
		Logger()

	db := NewTestDB(t, cfg, &logger)

	srv := &server.Server{
		Logger: &logger,
		DB: &database.Database{
			Pool: db.DB.Pool,
		},
		Config: cfg,
	}

	return &Test{
		Config: cfg,
		DB:     db,
		Server: srv,
	}
}

func (tt *Test) Cleanup(ctx context.Context) {
	tt.DB.Close(ctx)
}
