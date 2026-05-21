package utils

import (
	"math"
	"strconv"

	"github.com/gin-gonic/gin"
)

// PaginationParams holds pagination query parameters
type PaginationParams struct {
	Page    int
	PerPage int
	Offset  int
}

// ParsePagination extracts and validates pagination params from query string
func ParsePagination(c *gin.Context) PaginationParams {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	perPage, err := strconv.Atoi(c.DefaultQuery("per_page", "10"))
	if err != nil || perPage < 1 {
		perPage = 10
	}
	if perPage > 100 {
		perPage = 100
	}

	offset := (page - 1) * perPage

	return PaginationParams{
		Page:    page,
		PerPage: perPage,
		Offset:  offset,
	}
}

// BuildPagination creates a Pagination response object
func BuildPagination(p PaginationParams, total int64) Pagination {
	totalPages := int(math.Ceil(float64(total) / float64(p.PerPage)))
	if totalPages < 1 {
		totalPages = 1
	}
	return Pagination{
		CurrentPage: p.Page,
		PerPage:     p.PerPage,
		Total:       total,
		TotalPages:  totalPages,
	}
}
