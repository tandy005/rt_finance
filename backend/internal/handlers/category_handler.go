package handlers

import (
	"strconv"

	"rt-finance/internal/services"
	"rt-finance/pkg/utils"

	"github.com/gin-gonic/gin"
)

// CategoryHandler handles category HTTP requests
type CategoryHandler struct {
	service *services.CategoryService
}

// NewCategoryHandler creates a new CategoryHandler
func NewCategoryHandler(service *services.CategoryService) *CategoryHandler {
	return &CategoryHandler{service: service}
}

// GetAll godoc
// GET /api/categories
func (h *CategoryHandler) GetAll(c *gin.Context) {
	categories, err := h.service.GetAll()
	if err != nil {
		utils.InternalServerError(c, "Gagal mengambil data kategori")
		return
	}
	utils.OK(c, "Data kategori berhasil diambil", categories)
}

// GetByID godoc
// GET /api/categories/:id
func (h *CategoryHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "ID tidak valid")
		return
	}

	category, err := h.service.GetByID(uint(id))
	if err != nil {
		utils.NotFound(c, err.Error())
		return
	}
	utils.OK(c, "Kategori berhasil diambil", category)
}

// Create godoc
// POST /api/categories
func (h *CategoryHandler) Create(c *gin.Context) {
	var req services.CategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Format request tidak valid: "+err.Error())
		return
	}

	category, err := h.service.Create(&req)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}
	utils.Created(c, "Kategori berhasil dibuat", category)
}

// Update godoc
// PUT /api/categories/:id
func (h *CategoryHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "ID tidak valid")
		return
	}

	var req services.CategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Format request tidak valid: "+err.Error())
		return
	}

	category, err := h.service.Update(uint(id), &req)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}
	utils.OK(c, "Kategori berhasil diupdate", category)
}

// Delete godoc
// DELETE /api/categories/:id
func (h *CategoryHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "ID tidak valid")
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}
	utils.OK(c, "Kategori berhasil dihapus", nil)
}
