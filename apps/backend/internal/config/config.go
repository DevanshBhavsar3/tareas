package config

import (
	"os"

	"github.com/go-playground/validator/v10"
	_ "github.com/joho/godotenv/autoload"
	"github.com/knadh/koanf/providers/env"
	"github.com/knadh/koanf/v2"
	"github.com/rs/zerolog"

	"strings"
)

type Config struct {
	Primary       `koanf:"primary" validate:"required"`
	Server        `koanf:"server" validate:"required"`
	Database      `koanf:"database" validate:"required"`
	Observability `koanf:"observability" validate:"required"`
}

type Primary struct {
	Env string `koanf:"env" validate:"required"`
}

type Server struct {
	Port               string   `koanf:"port" validate:"required"`
	ReadTimeout        int      `koanf:"read_timeout" validate:"required"`
	WriteTimeout       int      `koanf:"write_timeout" validate:"required"`
	IdleTimeout        int      `koanf:"idle_timeout" validate:"required"`
	CORSAllowedOrigins []string `koanf:"cors_allowed_origins" validate:"required"`
}

type Database struct {
	Host            string `koanf:"host" validate:"required"`
	Port            int    `koanf:"port" validate:"required"`
	User            string `koanf:"user" validate:"required"`
	Password        string `koanf:"password"`
	Name            string `koanf:"name" validate:"required"`
	SSLMode         string `koanf:"ssl_mode" validate:"required"`
	MaxOpenConns    int    `koanf:"max_open_conns" validate:"required"`
	MaxIdleConns    int    `koanf:"max_idle_conns" validate:"required"`
	ConnMaxLifetime int    `koanf:"conn_max_lifetime" validate:"required"`
	ConnMaxIdleTime int    `koanf:"conn_max_idle_time" validate:"required"`
}

type Observability struct {
	ServiceName string   `koanf:"service_name" validate:"required"`
	Environment string   `koanf:"environment" validate:"required"`
	Logging     Logging  `koanf:"logging" validate:"required"`
	NewRelic    NewRelic `koanf:"new_relic" validate:"required"`
}

type Logging struct {
	Level  string `koanf:"level" validate:"required,oneof=debug info warn error"`
	Format string `koanf:"format" validate:"required"`
}

type NewRelic struct {
	LicenseKey                string `koanf:"license_key"`
	AppLogForwardingEnabled   bool   `koanf:"app_log_forwarding_enabled"`
	DistributedTracingEnabled bool   `koanf:"distributed_tracing_enabled"`
	DebugLogging              bool   `koanf:"debug_logging"`
}

func Load() *Config {
	logger := zerolog.New(zerolog.ConsoleWriter{Out: os.Stderr}).With().Timestamp().Logger()

	k := koanf.New(".")

	err := k.Load(env.Provider("TAREAS_", ".", func(s string) string {
		return strings.ToLower(strings.TrimPrefix(s, "TAREAS_"))
	}), nil)
	if err != nil {
		logger.Fatal().Err(err).Msg("could not load initial env variables")
	}

	cfg := &Config{}

	err = k.Unmarshal("", cfg)
	if err != nil {
		logger.Fatal().Err(err).Msg("could not unmarshal config")
	}

	validate := validator.New()

	err = validate.Struct(cfg)
	if err != nil {
		logger.Fatal().Err(err).Msg("config validation failed")
	}

	cfg.Observability.Environment = cfg.Primary.Env

	return cfg
}
