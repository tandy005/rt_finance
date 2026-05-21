package handlers

import (
	"rt-finance/internal/services"
	"rt-finance/pkg/utils"

	"github.com/gin-gonic/gin"
)

// DashboardHandler handles dashboard HTTP requests
type DashboardHandler struct {
	service *services.DashboardService
}

// NewDashboardHandler creates a new DashboardHandler
func NewDashboardHandler(service *services.DashboardService) *DashboardHandler {
	return &DashboardHandler{service: service}
}

// GetSummary godoc
// GET /api/dashboard/summary
func (h *DashboardHandler) GetSummary(c *gin.Context) {
	summary, err := h.service.GetSummary()
	if err != nil {
		utils.InternalServerError(c, "Gagal mengambil data dashboard: "+err.Error())
		return
	}
	utils.OK(c, "Data dashboard berhasil diambil", summary)
}
