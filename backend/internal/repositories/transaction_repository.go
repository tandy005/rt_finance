package repositories

import (
	"fmt"
	"rt-finance/internal/models"
	"rt-finance/pkg/utils"
	"time"

	"gorm.io/gorm"
)

// TransactionFilter holds all available filter parameters
type TransactionFilter struct {
	Search     string
	Type       string
	CategoryID uint
	Month      int
	Year       int
	SortBy     string
	SortOrder  string
}

// TransactionRepository handles database operations for transactions
type TransactionRepository struct {
	db *gorm.DB
}

// NewTransactionRepository creates a new TransactionRepository
func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{db: db}
}

// buildBaseQuery constructs the base filtered query
func (r *TransactionRepository) buildBaseQuery(filter TransactionFilter) *gorm.DB {
	query := r.db.Model(&models.Transaction{}).
		Preload("Category").
		Preload("Creator")

	if filter.Search != "" {
		query = query.Where("description ILIKE ?", "%"+filter.Search+"%")
	}
	if filter.Type != "" {
		query = query.Where("type = ?", filter.Type)
	}
	if filter.CategoryID > 0 {
		query = query.Where("category_id = ?", filter.CategoryID)
	}
	if filter.Month > 0 {
		query = query.Where("EXTRACT(MONTH FROM date) = ?", filter.Month)
	}
	if filter.Year > 0 {
		query = query.Where("EXTRACT(YEAR FROM date) = ?", filter.Year)
	}

	// Sorting
	sortBy := "date"
	if filter.SortBy == "amount" || filter.SortBy == "created_at" {
		sortBy = filter.SortBy
	}
	sortOrder := "DESC"
	if filter.SortOrder == "asc" {
		sortOrder = "ASC"
	}
	query = query.Order(sortBy + " " + sortOrder + ", id DESC")

	return query
}

// FindAll retrieves paginated and filtered transactions
func (r *TransactionRepository) FindAll(filter TransactionFilter, p utils.PaginationParams) ([]models.Transaction, int64, error) {
	var transactions []models.Transaction
	var total int64

	baseQuery := r.buildBaseQuery(filter)

	// Count total
	if err := baseQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Fetch with pagination
	result := baseQuery.Limit(p.PerPage).Offset(p.Offset).Find(&transactions)
	return transactions, total, result.Error
}

// FindByID retrieves a transaction by ID with preloaded relations
func (r *TransactionRepository) FindByID(id uint) (*models.Transaction, error) {
	var transaction models.Transaction
	result := r.db.Preload("Category").Preload("Creator").First(&transaction, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &transaction, nil
}

// Create creates a new transaction
func (r *TransactionRepository) Create(transaction *models.Transaction) error {
	return r.db.Create(transaction).Error
}

// Update updates an existing transaction
func (r *TransactionRepository) Update(transaction *models.Transaction) error {
	return r.db.Save(transaction).Error
}

// Delete soft-deletes a transaction by ID
func (r *TransactionRepository) Delete(id uint) error {
	return r.db.Delete(&models.Transaction{}, id).Error
}

// GetTotalByType returns the sum of all transactions by type (income or expense)
func (r *TransactionRepository) GetTotalByType(transType string) (float64, error) {
	var total float64
	result := r.db.Model(&models.Transaction{}).
		Where("type = ?", transType).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total)
	return total, result.Error
}

// GetMonthlyTotalByType returns the sum for current month by type
func (r *TransactionRepository) GetMonthlyTotalByType(transType string, month, year int) (float64, error) {
	var total float64
	result := r.db.Model(&models.Transaction{}).
		Where("type = ? AND EXTRACT(MONTH FROM date) = ? AND EXTRACT(YEAR FROM date) = ?",
			transType, month, year).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total)
	return total, result.Error
}

// MonthlyStatRow represents one month of income/expense data
type MonthlyStatRow struct {
	Month   int     `json:"month"`
	Year    int     `json:"year"`
	Income  float64 `json:"income"`
	Expense float64 `json:"expense"`
}

// GetMonthlyStats returns income and expense totals for the last N months
func (r *TransactionRepository) GetMonthlyStats(months int) ([]MonthlyStatRow, error) {
	type rawRow struct {
		Month   int     `gorm:"column:month"`
		Year    int     `gorm:"column:year"`
		Type    string  `gorm:"column:type"`
		Total   float64 `gorm:"column:total"`
	}

	var rows []rawRow
	sql := fmt.Sprintf(`
		SELECT 
			EXTRACT(MONTH FROM date)::int AS month,
			EXTRACT(YEAR FROM date)::int AS year,
			type,
			COALESCE(SUM(amount), 0) AS total
		FROM transactions
		WHERE deleted_at IS NULL
			AND date >= NOW() - INTERVAL '%d months'
		GROUP BY year, month, type
		ORDER BY year ASC, month ASC
	`, months)
	if err := r.db.Raw(sql).Scan(&rows).Error; err != nil {
		return nil, err
	}

	// Build a map for easy lookup
	statsMap := make(map[string]*MonthlyStatRow)
	for _, row := range rows {
		key := formatMonthKey(row.Month, row.Year)
		if _, ok := statsMap[key]; !ok {
			statsMap[key] = &MonthlyStatRow{Month: row.Month, Year: row.Year}
		}
		if row.Type == string(models.TransactionIncome) {
			statsMap[key].Income = row.Total
		} else {
			statsMap[key].Expense = row.Total
		}
	}

	// Convert map to sorted slice (last N months)
	now := time.Now()
	result2 := make([]MonthlyStatRow, 0, months)
	for i := months - 1; i >= 0; i-- {
		t := now.AddDate(0, -i, 0)
		key := formatMonthKey(int(t.Month()), t.Year())
		if stat, ok := statsMap[key]; ok {
			result2 = append(result2, *stat)
		} else {
			result2 = append(result2, MonthlyStatRow{
				Month: int(t.Month()),
				Year:  t.Year(),
			})
		}
	}
	return result2, nil
}

// CategoryStatRow represents spending by category
type CategoryStatRow struct {
	CategoryID   uint    `json:"category_id"`
	CategoryName string  `json:"category_name"`
	Total        float64 `json:"total"`
}

// GetCategoryExpenseStats returns top expense categories
func (r *TransactionRepository) GetCategoryExpenseStats(limit int) ([]CategoryStatRow, error) {
	var stats []CategoryStatRow
	result := r.db.Raw(`
		SELECT 
			t.category_id,
			c.name AS category_name,
			COALESCE(SUM(t.amount), 0) AS total
		FROM transactions t
		JOIN categories c ON c.id = t.category_id AND c.deleted_at IS NULL
		WHERE t.deleted_at IS NULL AND t.type = 'expense'
		GROUP BY t.category_id, c.name
		ORDER BY total DESC
		LIMIT ?
	`, limit).Scan(&stats)
	return stats, result.Error
}

// GetRecent retrieves the N most recent transactions
func (r *TransactionRepository) GetRecent(limit int) ([]models.Transaction, error) {
	var transactions []models.Transaction
	result := r.db.Preload("Category").
		Order("date DESC, id DESC").
		Limit(limit).
		Find(&transactions)
	return transactions, result.Error
}

// GetByMonthYear retrieves all transactions for a specific month/year (for reports)
func (r *TransactionRepository) GetByMonthYear(month, year int) ([]models.Transaction, error) {
	var transactions []models.Transaction
	result := r.db.Preload("Category").Preload("Creator").
		Where("EXTRACT(MONTH FROM date) = ? AND EXTRACT(YEAR FROM date) = ?", month, year).
		Order("date ASC").
		Find(&transactions)
	return transactions, result.Error
}

// formatMonthKey creates a consistent key for month/year
func formatMonthKey(month, year int) string {
	return time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC).Format("2006-01")
}
