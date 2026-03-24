package cron

import (
	"crypto/tls"
	"fmt"

	"github.com/DevanshBhavsar3/tareas/internal/config"
	"github.com/DevanshBhavsar3/tareas/internal/database"
	"github.com/DevanshBhavsar3/tareas/internal/logger"
	"github.com/DevanshBhavsar3/tareas/internal/repository"
	"github.com/DevanshBhavsar3/tareas/internal/server"
	"github.com/hibiken/asynq"
	"github.com/redis/go-redis/v9"
)

type JobContext struct {
	Server       *server.Server
	JobClient    *asynq.Client
	Repositories *repository.Repositories
}

func NewJobContext() (*JobContext, error) {
	cfg := config.Load()

	loggerService := logger.NewLoggerService(cfg.Observability)
	logger := logger.New(cfg.Observability, loggerService)

	db, err := database.New(cfg, &logger, loggerService)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize database: %w", err)
	}

	redisOptions := &redis.Options{
		Addr:     cfg.Redis.Address,
		Password: cfg.Redis.Password,
		DB:       0,
	}
	if cfg.Redis.TLSEnabled {
		redisOptions.TLSConfig = &tls.Config{}
	}

	redisClient := redis.NewClient(redisOptions)

	srv := &server.Server{
		Config:        cfg,
		Logger:        &logger,
		LoggerService: loggerService,
		DB:            db,
		Redis:         redisClient,
	}

	jobClientOptions := &asynq.RedisClientOpt{
		Addr:     cfg.Redis.Address,
		Password: cfg.Redis.Password,
		DB:       0,
	}
	if cfg.Redis.TLSEnabled {
		jobClientOptions.TLSConfig = &tls.Config{}
	}

	jobClient := asynq.NewClient(jobClientOptions)

	repositories := repository.NewRepositories(srv)

	return &JobContext{
		Server:       srv,
		JobClient:    jobClient,
		Repositories: repositories,
	}, nil
}

func (c *JobContext) Close() {
	if c.JobClient != nil {
		c.JobClient.Close()
	}

	if c.Server == nil {
		return
	}

	if c.Server.LoggerService != nil {
		c.Server.LoggerService.Shutdown()
	}
	if c.Server.DB != nil {
		c.Server.DB.Pool.Close()
	}
	if c.Server.Redis != nil {
		c.Server.Redis.Close()
	}
}
