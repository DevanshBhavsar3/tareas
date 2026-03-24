package job

import (
	"context"
	"crypto/tls"

	"github.com/DevanshBhavsar3/tareas/internal/config"
	"github.com/DevanshBhavsar3/tareas/internal/lib/email"
	"github.com/hibiken/asynq"
	"github.com/rs/zerolog"
)

// Generic interface for all auth services
type AuthServiceInterface interface {
	GetUserEmail(ctx context.Context, userID string) (string, error)
}

type JobService struct {
	Client      *asynq.Client
	server      *asynq.Server
	logger      *zerolog.Logger
	authService AuthServiceInterface
	emailClient *email.Client
}

func (j *JobService) SetAuthService(authService AuthServiceInterface) {
	j.authService = authService
}

func NewJobService(cfg *config.Config, logger *zerolog.Logger) *JobService {
	redisClientOpt := &asynq.RedisClientOpt{
		Addr:     cfg.Redis.Address,
		Password: cfg.Redis.Password,
		DB:       0,
	}
	if cfg.Redis.TLSEnabled {
		redisClientOpt.TLSConfig = &tls.Config{}
	}

	client := asynq.NewClient(redisClientOpt)

	server := asynq.NewServer(
		redisClientOpt,
		asynq.Config{
			Concurrency: 10,
			Queues: map[string]int{
				"critical": 6, // Higher priority queue for important emails
				"default":  3, // Default priority for most emails
				"low":      1, // Lower priority for non-urgent emails
			},
		},
	)

	return &JobService{
		Client:      client,
		server:      server,
		logger:      logger,
		emailClient: email.NewClient(cfg, logger),
	}
}

func (j *JobService) Start() error {
	// Register task handlers
	mux := asynq.NewServeMux()

	mux.HandleFunc(TaskReminderEmail, j.handleReminderEmailTask)
	mux.HandleFunc(TaskWeeklyReportEmail, j.handleWeeklyReportEmailTask)

	j.logger.Info().Msg("Starting background job server")

	if err := j.server.Start(mux); err != nil {
		return err
	}

	return nil
}

func (j *JobService) Stop() {
	j.logger.Info().Msg("Stopping background job server")

	j.server.Shutdown()
	j.Client.Close()
}
