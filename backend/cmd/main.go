package main

import (
	"fmt"
	"log"

	"rt-finance/internal/config"
	"rt-finance/internal/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file (ignore error if not present — rely on real env vars in production)
	if err := godotenv.Load(); err != nil {
		log.Println("[INFO] No .env file found, using environment variables")
	}

	// Load configuration
	cfg := config.Load()

	// Set Gin mode
	gin.SetMode(cfg.GinMode)

	// Connect to database
	config.ConnectDatabase(cfg)

	// Ensure upload directory exists
	config.EnsureUploadDir(cfg.UploadDir)

	// Setup Gin router
	router := gin.New()
	router.Use(gin.Logger())

	// Setup all routes
	routes.SetupRoutes(router)

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("[INFO] RT Finance Hub API starting on http://localhost%s", addr)
	log.Printf("[INFO] Mode: %s", cfg.GinMode)

	if err := router.Run(addr); err != nil {
		log.Fatalf("[ERROR] Failed to start server: %v", err)
	}
}
