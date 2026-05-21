package models

import (
	"time"

	"gorm.io/gorm"
)

// Category represents a transaction category
type Category struct {
	ID        uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string         `gorm:"type:varchar(100);not null;uniqueIndex" json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Transactions []Transaction `gorm:"foreignKey:CategoryID" json:"-"`
}

// TableName overrides the table name
func (Category) TableName() string {
	return "categories"
}
