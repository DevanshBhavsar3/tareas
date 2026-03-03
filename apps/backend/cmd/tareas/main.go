package main

import (
	"fmt"

	"github.com/DevanshBhavsar3/tareas/internal/config"
	"github.com/DevanshBhavsar3/tareas/internal/logger"
)

func main() {
	cfg := config.Load()

	loggerService := logger.NewLoggerService(cfg.Observability)
	defer loggerService.Shutdown()

	log := logger.New(cfg.Observability, loggerService)

	log.Info().Msg("Works fine")

	fmt.Println("Hello, World!")
}
