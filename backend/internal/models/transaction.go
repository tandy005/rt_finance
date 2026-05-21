package models

import (
	"time"

	"gorm.io/gorm"
)

// TransactionType defines the type of transaction
type TransactionType string

// PaymentMethod defines accepted payment methods
type PaymentMethod string

const (
	TransactionIncome  TransactionType = "income"
	TransactionExpense TransactionType = "expense"

	MethodCash     PaymentMethod = "cash"
	MethodTransfer PaymentMethod = "transfer"
)

// Transaction represents a financial transaction record
type Transaction struct {
	ID          uint            `gorm:"primaryKey;autoIncrement" json:"id"`
	Date        time.Time       `gorm:"type:date;not null" json:"date"`
	Description string          `gorm:"type:text;not null" json:"description"`
	Type        TransactionType `gorm:"type:varchar(10);not null" json:"type"`
	CategoryID  uint            `gorm:"not null" json:"category_id"`
	Amount      float64         `gorm:"type:decimal(15,2);not null" json:"amount"`
	Method      PaymentMethod   `gorm:"type:varchar(20);not null" json:"method"`
	ReferenceNo string          `gorm:"type:varchar(100)" json:"reference_no"`
	Attachment  string          `gorm:"type:varchar(255)" json:"attachment"`
	CreatedBy   uint            `gorm:"not null" json:"created_by"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	DeletedAt   gorm.DeletedAt  `gorm:"index" json:"-"`

	// Relations (preloaded)
	Category *Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Creator  *User     `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
}

// TableName overrides the table name
func (Transaction) TableName() string {
	return "transactions"
}
