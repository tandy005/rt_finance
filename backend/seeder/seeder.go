package main

import (
	"log"
	"time"

	"rt-finance/internal/config"
	"rt-finance/internal/models"
	"rt-finance/internal/repositories"
	"rt-finance/internal/services"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("[INFO] No .env file found, using environment variables")
	}

	// Load config
	cfg := config.Load()

	// Connect database
	config.ConnectDatabase(cfg)

	db := config.DB

	log.Println("[SEEDER] Starting database seeding...")

	// Initialize repositories and services
	userRepo := repositories.NewUserRepository(db)
	authService := services.NewAuthService(userRepo)

	// ============================================================
	// Seed Categories
	// ============================================================
	categories := []string{
		"IPL",
		"Kebersihan",
		"Keamanan",
		"Sosial",
		"Operasional",
		"Administrasi",
		"Perbaikan Fasilitas",
		"Lain-lain",
	}

	var categoryIDs []uint
	for _, name := range categories {
		cat := models.Category{Name: name}
		result := db.Where(models.Category{Name: name}).FirstOrCreate(&cat)
		if result.Error != nil {
			log.Printf("[SEEDER] Error creating category %s: %v", name, result.Error)
			continue
		}
		categoryIDs = append(categoryIDs, cat.ID)
		log.Printf("[SEEDER] ✓ Category: %s (ID: %d)", cat.Name, cat.ID)
	}

	// ============================================================
	// Seed Users
	// ============================================================
	users := []struct {
		Name     string
		Email    string
		Password string
		Role     models.UserRole
	}{
		{
			Name:     "Admin Bendahara",
			Email:    "admin@rtfinance.com",
			Password: "admin123",
			Role:     models.RoleAdmin,
		},
		{
			Name:     "Warga Viewer",
			Email:    "warga@rtfinance.com",
			Password: "warga123",
			Role:     models.RoleViewer,
		},
		{
			Name:     "Budi Santoso",
			Email:    "budi@rtfinance.com",
			Password: "budi123",
			Role:     models.RoleViewer,
		},
	}

	var adminUserID uint
	for _, u := range users {
		// Check if user already exists
		existingUser, err := userRepo.FindByEmail(u.Email)
		if err == nil {
			log.Printf("[SEEDER] User already exists: %s", u.Email)
			if existingUser.Role == models.RoleAdmin {
				adminUserID = existingUser.ID
			}
			continue
		}

		if err := authService.CreateUser(u.Name, u.Email, u.Password, u.Role); err != nil {
			log.Printf("[SEEDER] Error creating user %s: %v", u.Email, err)
			continue
		}

		// Get the created user to obtain ID
		createdUser, _ := userRepo.FindByEmail(u.Email)
		if createdUser != nil && createdUser.Role == models.RoleAdmin {
			adminUserID = createdUser.ID
		}
		log.Printf("[SEEDER] ✓ User: %s (%s) - Role: %s", u.Name, u.Email, u.Role)
	}

	if adminUserID == 0 {
		log.Println("[SEEDER] Admin user ID not found, using ID 1")
		adminUserID = 1
	}

	// ============================================================
	// Seed Transactions
	// ============================================================
	if len(categoryIDs) > 0 {
		transactions := []models.Transaction{
			// Income transactions
			{
				Date:        parseDate("2025-01-05"),
				Description: "Iuran IPL Bulan Januari - Blok A",
				Type:        models.TransactionIncome,
				CategoryID:  categoryIDs[0], // IPL
				Amount:      2500000,
				Method:      models.MethodTransfer,
				ReferenceNo: "TRF-2025-001",
				CreatedBy:   adminUserID,
			},
			{
				Date:        parseDate("2025-01-10"),
				Description: "Iuran IPL Bulan Januari - Blok B",
				Type:        models.TransactionIncome,
				CategoryID:  categoryIDs[0], // IPL
				Amount:      2000000,
				Method:      models.MethodCash,
				ReferenceNo: "",
				CreatedBy:   adminUserID,
			},
			{
				Date:        parseDate("2025-01-15"),
				Description: "Sumbangan Sosial dari Pak RW",
				Type:        models.TransactionIncome,
				CategoryID:  categoryIDs[3], // Sosial
				Amount:      500000,
				Method:      models.MethodCash,
				ReferenceNo: "",
				CreatedBy:   adminUserID,
			},
			// Expense transactions
			{
				Date:        parseDate("2025-01-08"),
				Description: "Biaya Cleaning Service Bulan Januari",
				Type:        models.TransactionExpense,
				CategoryID:  categoryIDs[1], // Kebersihan
				Amount:      800000,
				Method:      models.MethodCash,
				ReferenceNo: "",
				CreatedBy:   adminUserID,
			},
			{
				Date:        parseDate("2025-01-12"),
				Description: "Gaji Satpam Bulan Januari",
				Type:        models.TransactionExpense,
				CategoryID:  categoryIDs[2], // Keamanan
				Amount:      1500000,
				Method:      models.MethodTransfer,
				ReferenceNo: "TRF-2025-002",
				CreatedBy:   adminUserID,
			},
			{
				Date:        parseDate("2025-01-20"),
				Description: "Perbaikan Pipa Air Blok C",
				Type:        models.TransactionExpense,
				CategoryID:  categoryIDs[6], // Perbaikan Fasilitas
				Amount:      350000,
				Method:      models.MethodCash,
				ReferenceNo: "",
				CreatedBy:   adminUserID,
			},
			{
				Date:        parseDate("2025-02-05"),
				Description: "Iuran IPL Bulan Februari",
				Type:        models.TransactionIncome,
				CategoryID:  categoryIDs[0], // IPL
				Amount:      4500000,
				Method:      models.MethodTransfer,
				ReferenceNo: "TRF-2025-010",
				CreatedBy:   adminUserID,
			},
			{
				Date:        parseDate("2025-02-08"),
				Description: "Biaya Administrasi RT",
				Type:        models.TransactionExpense,
				CategoryID:  categoryIDs[5], // Administrasi
				Amount:      200000,
				Method:      models.MethodCash,
				ReferenceNo: "",
				CreatedBy:   adminUserID,
			},
			{
				Date:        parseDate("2025-02-15"),
				Description: "Biaya Operasional Pos Keamanan",
				Type:        models.TransactionExpense,
				CategoryID:  categoryIDs[4], // Operasional
				Amount:      450000,
				Method:      models.MethodCash,
				ReferenceNo: "",
				CreatedBy:   adminUserID,
			},
			{
				Date:        parseDate("2025-03-05"),
				Description: "Iuran IPL Bulan Maret",
				Type:        models.TransactionIncome,
				CategoryID:  categoryIDs[0], // IPL
				Amount:      4800000,
				Method:      models.MethodTransfer,
				ReferenceNo: "TRF-2025-020",
				CreatedBy:   adminUserID,
			},
			{
				Date:        parseDate("2025-03-10"),
				Description: "Pengecatan Pagar Lingkungan",
				Type:        models.TransactionExpense,
				CategoryID:  categoryIDs[6], // Perbaikan Fasilitas
				Amount:      1200000,
				Method:      models.MethodCash,
				ReferenceNo: "",
				CreatedBy:   adminUserID,
			},
			{
				Date:        parseDate("2025-03-20"),
				Description: "Acara 17 Agustus - Dana Sosial",
				Type:        models.TransactionExpense,
				CategoryID:  categoryIDs[3], // Sosial
				Amount:      750000,
				Method:      models.MethodCash,
				ReferenceNo: "",
				CreatedBy:   adminUserID,
			},
		}

		for _, tx := range transactions {
			result := db.Create(&tx)
			if result.Error != nil {
				log.Printf("[SEEDER] Error creating transaction: %v", result.Error)
				continue
			}
			log.Printf("[SEEDER] ✓ Transaction: %s (Rp %.0f)", tx.Description, tx.Amount)
		}
	}

	log.Println("\n[SEEDER] ===================================")
	log.Println("[SEEDER] Database seeding completed!")
	log.Println("[SEEDER] ===================================")
	log.Println("[SEEDER] Login credentials:")
	log.Println("[SEEDER]   Admin  : admin@rtfinance.com / admin123")
	log.Println("[SEEDER]   Viewer : warga@rtfinance.com / warga123")
	log.Println("[SEEDER] ===================================")
}

// parseDate is a helper to parse date strings for seeder
func parseDate(dateStr string) time.Time {
	t, _ := time.Parse("2006-01-02", dateStr)
	return t
}
