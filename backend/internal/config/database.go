package config

import (
	"log"
	"os"

	"rt-finance/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the global database instance
var DB *gorm.DB

// ConnectDatabase initializes and connects to PostgreSQL database
func ConnectDatabase(cfg *Config) {
	var err error

	gormLogger := logger.Default.LogMode(logger.Info)
	if cfg.GinMode == "release" {
		gormLogger = logger.Default.LogMode(logger.Error)
	}

	DB, err = gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		log.Fatalf("[ERROR] Failed to connect to database: %v", err)
	}

	log.Println("[INFO] Database connected successfully")

	// Auto migrate models
	AutoMigrate()
}

// AutoMigrate runs GORM auto migration for all models
func AutoMigrate() {
	log.Println("[INFO] Running database migrations...")

	err := DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Transaction{},
	)
	if err != nil {
		log.Fatalf("[ERROR] Auto migration failed: %v", err)
	}

	log.Println("[INFO] Database migration completed")
}

// EnsureUploadDir creates upload directory if it doesn't exist
func EnsureUploadDir(uploadDir string) {
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		log.Fatalf("[ERROR] Failed to create upload directory: %v", err)
	}
	log.Printf("[INFO] Upload directory ready: %s", uploadDir)
}
