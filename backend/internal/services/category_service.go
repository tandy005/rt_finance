package services

import (
	"errors"
	"rt-finance/internal/models"
	"rt-finance/internal/repositories"
)

// CategoryRequest is used for create/update operations
type CategoryRequest struct {
	Name string `json:"name" binding:"required,min=2,max=100"`
}

// CategoryService handles business logic for categories
type CategoryService struct {
	repo *repositories.CategoryRepository
}

// NewCategoryService creates a new CategoryService
func NewCategoryService(repo *repositories.CategoryRepository) *CategoryService {
	return &CategoryService{repo: repo}
}

// GetAll retrieves all categories
func (s *CategoryService) GetAll() ([]models.Category, error) {
	return s.repo.FindAll()
}

// GetByID retrieves a single category
func (s *CategoryService) GetByID(id uint) (*models.Category, error) {
	category, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("kategori tidak ditemukan")
	}
	return category, nil
}

// Create creates a new category, checking for duplicate names
func (s *CategoryService) Create(req *CategoryRequest) (*models.Category, error) {
	// Check for duplicate name
	existing, _ := s.repo.FindByName(req.Name)
	if existing != nil {
		return nil, errors.New("nama kategori sudah digunakan")
	}

	category := &models.Category{Name: req.Name}
	if err := s.repo.Create(category); err != nil {
		return nil, errors.New("gagal membuat kategori")
	}
	return category, nil
}

// Update updates an existing category
func (s *CategoryService) Update(id uint, req *CategoryRequest) (*models.Category, error) {
	category, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("kategori tidak ditemukan")
	}

	// Check for duplicate name (exclude current)
	existing, _ := s.repo.FindByName(req.Name)
	if existing != nil && existing.ID != id {
		return nil, errors.New("nama kategori sudah digunakan")
	}

	category.Name = req.Name
	if err := s.repo.Update(category); err != nil {
		return nil, errors.New("gagal mengupdate kategori")
	}
	return category, nil
}

// Delete removes a category, preventing deletion if it has transactions
func (s *CategoryService) Delete(id uint) error {
	if _, err := s.repo.FindByID(id); err != nil {
		return errors.New("kategori tidak ditemukan")
	}

	hasTransactions, err := s.repo.HasTransactions(id)
	if err != nil {
		return errors.New("gagal memeriksa kategori")
	}
	if hasTransactions {
		return errors.New("kategori tidak dapat dihapus karena masih memiliki transaksi")
	}

	if err := s.repo.Delete(id); err != nil {
		return errors.New("gagal menghapus kategori")
	}
	return nil
}
