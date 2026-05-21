package repositories

import (
	"rt-finance/internal/models"

	"gorm.io/gorm"
)

// CategoryRepository handles database operations for categories
type CategoryRepository struct {
	db *gorm.DB
}

// NewCategoryRepository creates a new CategoryRepository
func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

// FindAll retrieves all categories ordered by name
func (r *CategoryRepository) FindAll() ([]models.Category, error) {
	var categories []models.Category
	result := r.db.Order("name ASC").Find(&categories)
	return categories, result.Error
}

// FindByID retrieves a category by ID
func (r *CategoryRepository) FindByID(id uint) (*models.Category, error) {
	var category models.Category
	result := r.db.First(&category, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &category, nil
}

// FindByName retrieves a category by name (for uniqueness check)
func (r *CategoryRepository) FindByName(name string) (*models.Category, error) {
	var category models.Category
	result := r.db.Where("LOWER(name) = LOWER(?)", name).First(&category)
	if result.Error != nil {
		return nil, result.Error
	}
	return &category, nil
}

// Create creates a new category
func (r *CategoryRepository) Create(category *models.Category) error {
	return r.db.Create(category).Error
}

// Update updates an existing category
func (r *CategoryRepository) Update(category *models.Category) error {
	return r.db.Save(category).Error
}

// Delete soft-deletes a category by ID
func (r *CategoryRepository) Delete(id uint) error {
	return r.db.Delete(&models.Category{}, id).Error
}

// HasTransactions checks if a category has any associated transactions
func (r *CategoryRepository) HasTransactions(id uint) (bool, error) {
	var count int64
	result := r.db.Model(&models.Transaction{}).Where("category_id = ?", id).Count(&count)
	return count > 0, result.Error
}
