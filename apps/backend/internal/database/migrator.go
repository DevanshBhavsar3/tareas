package database

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/url"
	"strconv"

	"github.com/DevanshBhavsar3/tareas/internal/config"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/rs/zerolog"
)

func Migrate(ctx context.Context, log *zerolog.Logger, cfg *config.Config) error {
	hostPort := net.JoinHostPort(cfg.Database.Host, strconv.Itoa(cfg.Database.Port))

	// URL-encode the password
	encodedPassword := url.QueryEscape(cfg.Database.Password)
	dsn := fmt.Sprintf("postgres://%s:%s@%s/%s?sslmode=%s",
		cfg.Database.User,
		encodedPassword,
		hostPort,
		cfg.Database.Name,
		cfg.Database.SSLMode,
	)

	m, err := migrate.New("file://./internal/database/migrations", dsn)
	if err != nil {
		return fmt.Errorf("failed creating database migrations: %w", err)
	}

	from, _, _ := m.Version()

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("failed applying up database migration: %w", err)
	}

	to, _, _ := m.Version()

	if from == to {
		log.Info().Msgf("database schema up to date, version %d", to)
	} else {
		log.Info().Msgf("migrated database schema, from %d to %d", from, to)
	}

	return nil
}
