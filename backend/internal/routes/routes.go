package routes

import (
	"rt-finance/internal/config"
	"rt-finance/internal/handlers"
	"rt-finance/internal/middlewares"
	"rt-finance/internal/repositories"
	"rt-finance/internal/services"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all application routes
func SetupRoutes(router *gin.Engine) {
	// Apply global middlewares
	router.Use(middlewares.CORSMiddleware(config.AppConfig.CORSOrigin))
	router.Use(gin.Recovery())

	// Serve uploaded files statically
	router.Static("/uploads", config.AppConfig.UploadDir)

	// Initialize dependencies (Dependency Injection)
	db := config.DB

	// ── Repositories ──────────────────────────────────────────
	userRepo        := repositories.NewUserRepository(db)
	categoryRepo    := repositories.NewCategoryRepository(db)
	transactionRepo := repositories.NewTransactionRepository(db)

	// ── Services ──────────────────────────────────────────────
	authService        := services.NewAuthService(userRepo)
	categoryService    := services.NewCategoryService(categoryRepo)
	transactionService := services.NewTransactionService(transactionRepo, categoryRepo)
	dashboardService   := services.NewDashboardService(transactionRepo)
	reportService      := services.NewReportService(transactionRepo)

	// ── Handlers ──────────────────────────────────────────────
	authHandler        := handlers.NewAuthHandler(authService)
	categoryHandler    := handlers.NewCategoryHandler(categoryService)
	transactionHandler := handlers.NewTransactionHandler(transactionService)
	dashboardHandler   := handlers.NewDashboardHandler(dashboardService)
	reportHandler      := handlers.NewReportHandler(reportService)

	// ============================================================
	// API v1 Routes
	// ============================================================
	api := router.Group("/api")
	{
		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":  "ok",
				"message": "RT Finance Hub API is running",
				"version": "1.0.0",
			})
		})

		// ── Auth Routes (Public) ────────────────────────────────
		auth := api.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
		}

		// ── Protected Routes (JWT Required) ────────────────────
		protected := api.Group("/")
		protected.Use(middlewares.AuthMiddleware())
		{
			// Auth
			protected.GET("/auth/profile", authHandler.GetProfile)

			// ── Categories ────────────────────────────────────
			categories := protected.Group("/categories")
			{
				categories.GET("", categoryHandler.GetAll)
				categories.GET("/:id", categoryHandler.GetByID)
				categories.POST("", middlewares.AdminOnly(), categoryHandler.Create)
				categories.PUT("/:id", middlewares.AdminOnly(), categoryHandler.Update)
				categories.DELETE("/:id", middlewares.AdminOnly(), categoryHandler.Delete)
			}

			// ── Transactions ──────────────────────────────────
			transactions := protected.Group("/transactions")
			{
				transactions.GET("", transactionHandler.GetAll)
				transactions.GET("/:id", transactionHandler.GetByID)
				transactions.POST("", middlewares.AdminOnly(), transactionHandler.Create)
				transactions.PUT("/:id", middlewares.AdminOnly(), transactionHandler.Update)
				transactions.DELETE("/:id", middlewares.AdminOnly(), transactionHandler.Delete)
				transactions.POST("/upload", middlewares.AdminOnly(), transactionHandler.UploadAttachment)
			}

			// ── Dashboard ─────────────────────────────────────
			dashboard := protected.Group("/dashboard")
			{
				dashboard.GET("/summary", dashboardHandler.GetSummary)
			}

			// ── Reports ───────────────────────────────────────
			reports := protected.Group("/reports")
			{
				reports.GET("/monthly", reportHandler.GetMonthly)
				reports.GET("/export/excel", reportHandler.ExportExcel)
				reports.GET("/export/pdf", reportHandler.ExportPDF)
			}
		}
	}
}
