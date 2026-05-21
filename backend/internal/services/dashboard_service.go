package services

import (
	"time"

	"rt-finance/internal/repositories"
)

// DashboardSummary holds all data needed for the dashboard
type DashboardSummary struct {
	CurrentBalance   float64                          `json:"current_balance"`
	MonthlyIncome    float64                          `json:"monthly_income"`
	MonthlyExpense   float64                          `json:"monthly_expense"`
	TotalIncome      float64                          `json:"total_income"`
	TotalExpense     float64                          `json:"total_expense"`
	MonthlyStats     []repositories.MonthlyStatRow   `json:"monthly_stats"`
	CategoryStats    []repositories.CategoryStatRow  `json:"category_stats"`
	RecentTransactions interface{}                   `json:"recent_transactions"`
}

// DashboardService calculates dashboard statistics dynamically
type DashboardService struct {
	txRepo *repositories.TransactionRepository
}

// NewDashboardService creates a new DashboardService
func NewDashboardService(txRepo *repositories.TransactionRepository) *DashboardService {
	return &DashboardService{txRepo: txRepo}
}

// GetSummary computes all dashboard data dynamically (no stored balances)
func (s *DashboardService) GetSummary() (*DashboardSummary, error) {
	now := time.Now()
	currentMonth := int(now.Month())
	currentYear := now.Year()

	// 1. Total income & expense (all time) → balance
	totalIncome, err := s.txRepo.GetTotalByType("income")
	if err != nil {
		return nil, err
	}
	totalExpense, err := s.txRepo.GetTotalByType("expense")
	if err != nil {
		return nil, err
	}

	// 2. This month income & expense
	monthlyIncome, err := s.txRepo.GetMonthlyTotalByType("income", currentMonth, currentYear)
	if err != nil {
		return nil, err
	}
	monthlyExpense, err := s.txRepo.GetMonthlyTotalByType("expense", currentMonth, currentYear)
	if err != nil {
		return nil, err
	}

	// 3. Monthly stats for chart (last 6 months)
	monthlyStats, err := s.txRepo.GetMonthlyStats(6)
	if err != nil {
		return nil, err
	}

	// 4. Category expense breakdown (top 5)
	categoryStats, err := s.txRepo.GetCategoryExpenseStats(5)
	if err != nil {
		return nil, err
	}

	// 5. Recent 5 transactions
	recentTx, err := s.txRepo.GetRecent(5)
	if err != nil {
		return nil, err
	}

	return &DashboardSummary{
		CurrentBalance:     totalIncome - totalExpense,
		MonthlyIncome:      monthlyIncome,
		MonthlyExpense:     monthlyExpense,
		TotalIncome:        totalIncome,
		TotalExpense:       totalExpense,
		MonthlyStats:       monthlyStats,
		CategoryStats:      categoryStats,
		RecentTransactions: recentTx,
	}, nil
}
