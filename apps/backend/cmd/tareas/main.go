package main

import (
	"context"
	"fmt"

	"github.com/DevanshBhavsar3/tareas/internal/config"
	"github.com/DevanshBhavsar3/tareas/internal/database"
	"github.com/DevanshBhavsar3/tareas/internal/logger"
	"github.com/DevanshBhavsar3/tareas/internal/server"
)

func main() {
	cfg := config.Load()

	loggerService := logger.NewLoggerService(cfg.Observability)
	defer loggerService.Shutdown()

	log := logger.New(cfg.Observability, loggerService)

	if cfg.Primary.Env != "local" {
		if err := database.Migrate(context.Background(), &log, cfg); err != nil {
			log.Fatal().Err(err).Msg("failed to migrate database")
		}
	}

	// Initialize server
	srv, err := server.New(cfg, &log, loggerService)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to initialize server")
	}

	_ = srv

	log.Info().Msg("Works fine")

	fmt.Println("Hello, World!")
}
