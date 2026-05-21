package handlers

import (
	"fmt"
	"path/filepath"
	"strconv"
	"time"

	"rt-finance/internal/config"
	"rt-finance/internal/repositories"
	"rt-finance/internal/services"
	"rt-finance/pkg/utils"

	"github.com/gin-gonic/gin"
)

// TransactionHandler handles transaction HTTP requests
type TransactionHandler struct {
	service *services.TransactionService
}

// NewTransactionHandler creates a new TransactionHandler
func NewTransactionHandler(service *services.TransactionService) *TransactionHandler {
	return &TransactionHandler{service: service}
}

// GetAll godoc
// GET /api/transactions?page=1&per_page=10&search=&type=&category_id=&month=&year=&sort_by=date&sort_order=desc
func (h *TransactionHandler) GetAll(c *gin.Context) {
	p := utils.ParsePagination(c)

	// Parse filters
	categoryID, _ := strconv.ParseUint(c.Query("category_id"), 10, 32)
	month, _ := strconv.Atoi(c.Query("month"))
	year, _ := strconv.Atoi(c.Query("year"))

	filter := repositories.TransactionFilter{
		Search:     c.Query("search"),
		Type:       c.Query("type"),
		CategoryID: uint(categoryID),
		Month:      month,
		Year:       year,
		SortBy:     c.DefaultQuery("sort_by", "date"),
		SortOrder:  c.DefaultQuery("sort_order", "desc"),
	}

	transactions, total, err := h.service.GetAll(filter, p)
	if err != nil {
		utils.InternalServerError(c, "Gagal mengambil data transaksi")
		return
	}

	pagination := utils.BuildPagination(p, total)
	utils.OKPaginated(c, "Data transaksi berhasil diambil", transactions, pagination)
}

// GetByID godoc
// GET /api/transactions/:id
func (h *TransactionHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "ID tidak valid")
		return
	}

	tx, err := h.service.GetByID(uint(id))
	if err != nil {
		utils.NotFound(c, err.Error())
		return
	}
	utils.OK(c, "Transaksi berhasil diambil", tx)
}

// Create godoc
// POST /api/transactions
func (h *TransactionHandler) Create(c *gin.Context) {
	var req services.TransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Format request tidak valid: "+err.Error())
		return
	}

	userID := c.GetUint("user_id")
	tx, err := h.service.Create(&req, userID)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}
	utils.Created(c, "Transaksi berhasil dibuat", tx)
}

// Update godoc
// PUT /api/transactions/:id
func (h *TransactionHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "ID tidak valid")
		return
	}

	var req services.TransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Format request tidak valid: "+err.Error())
		return
	}

	tx, err := h.service.Update(uint(id), &req)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}
	utils.OK(c, "Transaksi berhasil diupdate", tx)
}

// Delete godoc
// DELETE /api/transactions/:id
func (h *TransactionHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "ID tidak valid")
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}
	utils.OK(c, "Transaksi berhasil dihapus", nil)
}

// UploadAttachment godoc
// POST /api/transactions/upload
func (h *TransactionHandler) UploadAttachment(c *gin.Context) {
	// Get transaction ID from form
	txIDStr := c.PostForm("transaction_id")
	txID, err := strconv.ParseUint(txIDStr, 10, 32)
	if err != nil {
		utils.BadRequest(c, "transaction_id tidak valid")
		return
	}

	// Get file from request
	file, err := c.FormFile("file")
	if err != nil {
		utils.BadRequest(c, "File tidak ditemukan dalam request")
		return
	}

	// Validate file extension
	if !utils.IsValidAttachment(file.Filename) {
		utils.BadRequest(c, "Format file tidak didukung. Gunakan JPG, PNG, atau PDF")
		return
	}

	// Validate file size
	if file.Size > config.AppConfig.MaxUploadSize {
		utils.BadRequest(c, fmt.Sprintf("Ukuran file terlalu besar. Maksimal %d MB", config.AppConfig.MaxUploadSize/1024/1024))
		return
	}

	// Generate unique filename
	ext := utils.GetFileExtension(file.Filename)
	newFilename := fmt.Sprintf("tx_%d_%d%s", txID, time.Now().UnixNano(), ext)
	savePath := filepath.Join(config.AppConfig.UploadDir, newFilename)

	// Save file
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		utils.InternalServerError(c, "Gagal menyimpan file")
		return
	}

	// Update transaction attachment path
	attachmentURL := "/uploads/" + newFilename
	if err := h.service.UpdateAttachment(uint(txID), attachmentURL); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.OK(c, "File berhasil diupload", gin.H{
		"attachment_url": attachmentURL,
		"filename":       newFilename,
	})
}
