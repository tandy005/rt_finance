package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
)

// Config holds all application configuration
type Config struct {
	// Server
	Port    string
	GinMode string

	// Database
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	// JWT
	JWTSecret      string
	JWTExpireHours int

	// File Upload
	UploadDir     string
	MaxUploadSize int64

	// CORS
	CORSOrigin string
}

// AppConfig is the global config instance
var AppConfig *Config

// Load reads configuration from environment variables
func Load() *Config {
	expireHours, err := strconv.Atoi(getEnv("JWT_EXPIRE_HOURS", "24"))
	if err != nil {
		expireHours = 24
	}

	maxUploadSize, err := strconv.ParseInt(getEnv("MAX_UPLOAD_SIZE", "5242880"), 10, 64)
	if err != nil {
		maxUploadSize = 5 * 1024 * 1024 // 5MB default
	}

	AppConfig = &Config{
		// Server
		Port:    getEnv("PORT", "8080"),
		GinMode: getEnv("GIN_MODE", "debug"),

		// Database
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "postgres"),
		DBName:     getEnv("DB_NAME", "rt_finance"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),

		// JWT
		JWTSecret:      getEnv("JWT_SECRET", "default_secret_change_me"),
		JWTExpireHours: expireHours,

		// File Upload
		UploadDir:     getEnv("UPLOAD_DIR", "./uploads"),
		MaxUploadSize: maxUploadSize,

		// CORS
		CORSOrigin: getEnv("CORS_ORIGIN", "http://localhost:5173"),
	}

	// Validate critical config
	if AppConfig.JWTSecret == "default_secret_change_me" {
		log.Println("[WARNING] JWT_SECRET is using default value. Please set a secure secret in production!")
	}

	return AppConfig
}

// DSN returns the PostgreSQL Data Source Name
func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
		c.DBHost, c.DBUser, c.DBPassword, c.DBName, c.DBPort, c.DBSSLMode,
	)
}

// getEnv returns environment variable value or fallback
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	return fallback
}
