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
	Primary       PrimaryConfig       `koanf:"primary" validate:"required"`
	Server        ServerConfig        `koanf:"server" validate:"required"`
	Database      DatabaseConfig      `koanf:"database" validate:"required"`
	Auth          AuthConfig          `koanf:"auth" validate:"required"`
	Redis         RedisConfig         `koanf:"redis" validate:"required"`
	Integration   IntegrationConfig   `koanf:"integration" validate:"required"`
	AWS           AWSConfig           `koanf:"aws" validate:"required"`
	Observability ObservabilityConfig `koanf:"observability" validate:"required"`
}

type PrimaryConfig struct {
	Env string `koanf:"env" validate:"required"`
}

type ServerConfig struct {
	Port               string   `koanf:"port" validate:"required"`
	ReadTimeout        int      `koanf:"read_timeout" validate:"required"`
	WriteTimeout       int      `koanf:"write_timeout" validate:"required"`
	IdleTimeout        int      `koanf:"idle_timeout" validate:"required"`
	CORSAllowedOrigins []string `koanf:"cors_allowed_origins" validate:"required"`
}

type DatabaseConfig struct {
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

type RedisConfig struct {
	Address    string `koanf:"address" validate:"required"`
	Password   string `koanf:"password" validate:"required"`
	TLSEnabled bool   `koanf:"tls_enabled"`
}

type IntegrationConfig struct {
	ResendAPIKey string `koanf:"resend_api_key" validate:"required"`
}

type AuthConfig struct {
	SecretKey string `koanf:"secret_key" validate:"required"`
}

type AWSConfig struct {
	Region          string `koanf:"region" validate:"required"`
	AccessKeyId     string `koanf:"access_key_id" validate:"required"`
	SecretAccessKey string `koanf:"secret_access_key" validate:"required"`
	UploadBucket    string `koanf:"upload_bucket" validate:"required"`
	EndpointUrl     string `koanf:"endpoint_url" validate:"required"`
}

type ObservabilityConfig struct {
	ServiceName string         `koanf:"service_name" validate:"required"`
	Environment string         `koanf:"environment" validate:"required"`
	Logging     LoggingConfig  `koanf:"logging" validate:"required"`
	NewRelic    NewRelicConfig `koanf:"new_relic"`
}

type LoggingConfig struct {
	Level  string `koanf:"level" validate:"required,oneof=debug info warn error"`
	Format string `koanf:"format" validate:"required"`
}

type NewRelicConfig struct {
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
