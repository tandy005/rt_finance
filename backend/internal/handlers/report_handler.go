package handlers

import (
	"strconv"
	"time"

	"rt-finance/internal/services"
	"rt-finance/pkg/utils"

	"github.com/gin-gonic/gin"
)

// ReportHandler handles report HTTP requests
type ReportHandler struct {
	service *services.ReportService
}

// NewReportHandler creates a new ReportHandler
func NewReportHandler(service *services.ReportService) *ReportHandler {
	return &ReportHandler{service: service}
}

// parseMonthYear extracts and validates month/year from query params
func parseMonthYear(c *gin.Context) (int, int, bool) {
	now := time.Now()

	month, err := strconv.Atoi(c.DefaultQuery("month", strconv.Itoa(int(now.Month()))))
	if err != nil || month < 1 || month > 12 {
		utils.BadRequest(c, "Bulan tidak valid (1-12)")
		return 0, 0, false
	}

	year, err := strconv.Atoi(c.DefaultQuery("year", strconv.Itoa(now.Year())))
	if err != nil || year < 2000 || year > 2100 {
		utils.BadRequest(c, "Tahun tidak valid")
		return 0, 0, false
	}

	return month, year, true
}

// GetMonthly godoc
// GET /api/reports/monthly?month=1&year=2025
func (h *ReportHandler) GetMonthly(c *gin.Context) {
	month, year, ok := parseMonthYear(c)
	if !ok {
		return
	}

	summary, err := h.service.GetMonthly(month, year)
	if err != nil {
		utils.InternalServerError(c, "Gagal mengambil laporan bulanan")
		return
	}
	utils.OK(c, "Laporan bulanan berhasil diambil", summary)
}

// ExportExcel godoc
// GET /api/reports/export/excel?month=1&year=2025
func (h *ReportHandler) ExportExcel(c *gin.Context) {
	month, year, ok := parseMonthYear(c)
	if !ok {
		return
	}

	buf, filename, err := h.service.ExportExcel(month, year)
	if err != nil {
		utils.InternalServerError(c, "Gagal generate laporan Excel: "+err.Error())
		return
	}

	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Length", strconv.Itoa(buf.Len()))
	c.Data(200, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buf.Bytes())
}

// ExportPDF godoc
// GET /api/reports/export/pdf?month=1&year=2025
func (h *ReportHandler) ExportPDF(c *gin.Context) {
	month, year, ok := parseMonthYear(c)
	if !ok {
		return
	}

	buf, filename, err := h.service.ExportPDF(month, year)
	if err != nil {
		utils.InternalServerError(c, "Gagal generate laporan: "+err.Error())
		return
	}

	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Header("Content-Type", "text/html; charset=utf-8")
	c.Data(200, "text/html; charset=utf-8", buf.Bytes())
}
