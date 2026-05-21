package services

import (
	"errors"
	"time"

	"rt-finance/internal/models"
	"rt-finance/internal/repositories"
	"rt-finance/pkg/utils"
)

// TransactionRequest is used for create/update operations
type TransactionRequest struct {
	Date        string  `json:"date" binding:"required"`
	Description string  `json:"description" binding:"required,min=3"`
	Type        string  `json:"type" binding:"required,oneof=income expense"`
	CategoryID  uint    `json:"category_id" binding:"required"`
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	Method      string  `json:"method" binding:"required,oneof=cash transfer"`
	ReferenceNo string  `json:"reference_no"`
	Attachment  string  `json:"attachment"`
}

// TransactionService handles business logic for transactions
type TransactionService struct {
	repo        *repositories.TransactionRepository
	categoryRepo *repositories.CategoryRepository
}

// NewTransactionService creates a new TransactionService
func NewTransactionService(
	repo *repositories.TransactionRepository,
	categoryRepo *repositories.CategoryRepository,
) *TransactionService {
	return &TransactionService{repo: repo, categoryRepo: categoryRepo}
}

// GetAll retrieves paginated + filtered transactions
func (s *TransactionService) GetAll(
	filter repositories.TransactionFilter,
	p utils.PaginationParams,
) ([]models.Transaction, int64, error) {
	return s.repo.FindAll(filter, p)
}

// GetByID retrieves a single transaction
func (s *TransactionService) GetByID(id uint) (*models.Transaction, error) {
	tx, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("transaksi tidak ditemukan")
	}
	return tx, nil
}

// Create creates a new transaction
func (s *TransactionService) Create(req *TransactionRequest, createdBy uint) (*models.Transaction, error) {
	// Validate category exists
	if _, err := s.categoryRepo.FindByID(req.CategoryID); err != nil {
		return nil, errors.New("kategori tidak ditemukan")
	}

	// Parse date
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return nil, errors.New("format tanggal tidak valid, gunakan YYYY-MM-DD")
	}

	tx := &models.Transaction{
		Date:        date,
		Description: req.Description,
		Type:        models.TransactionType(req.Type),
		CategoryID:  req.CategoryID,
		Amount:      req.Amount,
		Method:      models.PaymentMethod(req.Method),
		ReferenceNo: req.ReferenceNo,
		Attachment:  req.Attachment,
		CreatedBy:   createdBy,
	}

	if err := s.repo.Create(tx); err != nil {
		return nil, errors.New("gagal membuat transaksi")
	}

	// Reload with relations
	return s.repo.FindByID(tx.ID)
}

// Update updates an existing transaction
func (s *TransactionService) Update(id uint, req *TransactionRequest) (*models.Transaction, error) {
	tx, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("transaksi tidak ditemukan")
	}

	// Validate category
	if _, err := s.categoryRepo.FindByID(req.CategoryID); err != nil {
		return nil, errors.New("kategori tidak ditemukan")
	}

	// Parse date
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return nil, errors.New("format tanggal tidak valid, gunakan YYYY-MM-DD")
	}

	tx.Date        = date
	tx.Description = req.Description
	tx.Type        = models.TransactionType(req.Type)
	tx.CategoryID  = req.CategoryID
	tx.Amount      = req.Amount
	tx.Method      = models.PaymentMethod(req.Method)
	tx.ReferenceNo = req.ReferenceNo
	if req.Attachment != "" {
		tx.Attachment = req.Attachment
	}

	if err := s.repo.Update(tx); err != nil {
		return nil, errors.New("gagal mengupdate transaksi")
	}

	return s.repo.FindByID(tx.ID)
}

// Delete soft-deletes a transaction
func (s *TransactionService) Delete(id uint) error {
	if _, err := s.repo.FindByID(id); err != nil {
		return errors.New("transaksi tidak ditemukan")
	}
	if err := s.repo.Delete(id); err != nil {
		return errors.New("gagal menghapus transaksi")
	}
	return nil
}

// UpdateAttachment sets the attachment path on an existing transaction
func (s *TransactionService) UpdateAttachment(id uint, attachmentPath string) error {
	tx, err := s.repo.FindByID(id)
	if err != nil {
		return errors.New("transaksi tidak ditemukan")
	}
	tx.Attachment = attachmentPath
	return s.repo.Update(tx)
}
