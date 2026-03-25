package testing

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/DevanshBhavsar3/tareas/internal/config"
	"github.com/DevanshBhavsar3/tareas/internal/database"
	"github.com/rs/zerolog"
	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
)

type TestDB struct {
	DB        *database.Database
	Container testcontainers.Container
}

func NewTestDB(t *testing.T, cfg *config.Config, logger *zerolog.Logger) *TestDB {
	t.Helper()

	ctx := context.Background()

	pgContainer, err := postgres.Run(
		ctx,
		"postgres:15-alpine",
		postgres.WithDatabase(cfg.Database.Name),
		postgres.WithUsername(cfg.Database.User),
		postgres.WithPassword(cfg.Database.Password),
		postgres.BasicWaitStrategies(),
	)
	require.NoError(t, err, "failed to start postgres container")

	host, err := pgContainer.Host(ctx)
	require.NoError(t, err, "failed to get container host")

	cfg.Database.Host = host

	mappedPort, err := pgContainer.MappedPort(ctx, "5432")
	require.NoError(t, err, "failed to get mapped port")
	port := mappedPort.Int()

	cfg.Database.Port = port

	var db *database.Database
	var lastErr error

	for i := range 5 {
		time.Sleep(2 * time.Second)

		db, lastErr = database.New(cfg, logger, nil)
		if lastErr != nil {
			logger.Warn().Err(err).Msgf("Failed to connect to database (attempt %d/5)", i+1)
		} else {
			break
		}
	}
	require.NoError(t, lastErr, "failed to connect to database after multiple attempts")

	err = database.Migrate(ctx, logger, cfg)
	require.NoError(t, err, "failed to apply database migrations")

	return &TestDB{
		DB:        db,
		Container: pgContainer,
	}

}

func (db *TestDB) Close(ctx context.Context) error {
	db.DB.Close()

	if err := db.Container.Terminate(ctx); err != nil {
		return fmt.Errorf("failed to terminate postgres container: %w", err)
	}

	return nil
}
