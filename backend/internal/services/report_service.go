package services

import (
	"bytes"
	"fmt"
	"time"

	"rt-finance/internal/models"
	"rt-finance/internal/repositories"

	"github.com/xuri/excelize/v2"
)

// ReportSummary holds monthly report data
type ReportSummary struct {
	Month        int                    `json:"month"`
	Year         int                    `json:"year"`
	Transactions []models.Transaction   `json:"transactions"`
	TotalIncome  float64                `json:"total_income"`
	TotalExpense float64                `json:"total_expense"`
	Balance      float64                `json:"balance"`
}

// ReportService handles report generation
type ReportService struct {
	txRepo *repositories.TransactionRepository
}

// NewReportService creates a new ReportService
func NewReportService(txRepo *repositories.TransactionRepository) *ReportService {
	return &ReportService{txRepo: txRepo}
}

// GetMonthly retrieves and summarizes transactions for a given month/year
func (s *ReportService) GetMonthly(month, year int) (*ReportSummary, error) {
	transactions, err := s.txRepo.GetByMonthYear(month, year)
	if err != nil {
		return nil, err
	}

	var totalIncome, totalExpense float64
	for _, tx := range transactions {
		if tx.Type == models.TransactionIncome {
			totalIncome += tx.Amount
		} else {
			totalExpense += tx.Amount
		}
	}

	return &ReportSummary{
		Month:        month,
		Year:         year,
		Transactions: transactions,
		TotalIncome:  totalIncome,
		TotalExpense: totalExpense,
		Balance:      totalIncome - totalExpense,
	}, nil
}

// ExportExcel generates an Excel report for the given month/year
func (s *ReportService) ExportExcel(month, year int) (*bytes.Buffer, string, error) {
	summary, err := s.GetMonthly(month, year)
	if err != nil {
		return nil, "", err
	}

	f := excelize.NewFile()
	sheetName := "Laporan Keuangan"
	f.SetSheetName("Sheet1", sheetName)

	// ── Styles ──────────────────────────────────────────────────
	titleStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Size: 14, Color: "FFFFFF"},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"1e40af"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})
	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "FFFFFF"},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"3b82f6"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center"},
		Border: []excelize.Border{
			{Type: "thin", Color: "FFFFFF", Style: 1},
		},
	})
	incomeStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Color: "16a34a"},
	})
	expenseStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Color: "dc2626"},
	})
	numberStyle, _ := f.NewStyle(&excelize.Style{
		NumFmt: 4, // #,##0.00
	})
	totalStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"f1f5f9"}, Pattern: 1},
		Border: []excelize.Border{
			{Type: "thin", Color: "94a3b8", Style: 1},
		},
		NumFmt: 4,
	})

	// ── Title ────────────────────────────────────────────────────
	monthName := time.Month(month).String()
	title := fmt.Sprintf("LAPORAN KEUANGAN RT — %s %d", monthName, year)
	f.MergeCell(sheetName, "A1", "I1")
	f.SetCellValue(sheetName, "A1", title)
	f.SetCellStyle(sheetName, "A1", "I1", titleStyle)
	f.SetRowHeight(sheetName, 1, 30)

	// Generated info
	f.MergeCell(sheetName, "A2", "I2")
	f.SetCellValue(sheetName, "A2", fmt.Sprintf("Digenerate pada: %s", time.Now().Format("02 January 2006 15:04")))
	f.SetRowHeight(sheetName, 2, 18)

	// ── Headers ──────────────────────────────────────────────────
	headers := []string{"No", "Tanggal", "Jenis", "Kategori", "Uraian", "Nominal", "Metode", "No. Referensi", "Lampiran"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 4)
		f.SetCellValue(sheetName, cell, h)
		f.SetCellStyle(sheetName, cell, cell, headerStyle)
	}
	f.SetRowHeight(sheetName, 4, 22)

	// ── Column Widths ─────────────────────────────────────────
	colWidths := map[string]float64{
		"A": 5, "B": 14, "C": 12, "D": 18, "E": 35,
		"F": 18, "G": 12, "H": 18, "I": 20,
	}
	for col, width := range colWidths {
		f.SetColWidth(sheetName, col, col, width)
	}

	// ── Data Rows ─────────────────────────────────────────────
	rowNum := 5
	for i, tx := range summary.Transactions {
		categoryName := ""
		if tx.Category != nil {
			categoryName = tx.Category.Name
		}
		attachmentVal := ""
		if tx.Attachment != "" {
			attachmentVal = "Ada"
		}

		rowData := []interface{}{
			i + 1,
			tx.Date.Format("02-01-2006"),
			string(tx.Type),
			categoryName,
			tx.Description,
			tx.Amount,
			string(tx.Method),
			tx.ReferenceNo,
			attachmentVal,
		}

		for col, val := range rowData {
			cell, _ := excelize.CoordinatesToCellName(col+1, rowNum)
			f.SetCellValue(sheetName, cell, val)
		}

		// Amount column styling
		amountCell, _ := excelize.CoordinatesToCellName(6, rowNum)
		f.SetCellStyle(sheetName, amountCell, amountCell, numberStyle)

		// Color income/expense
		typeCell, _ := excelize.CoordinatesToCellName(3, rowNum)
		if tx.Type == models.TransactionIncome {
			f.SetCellStyle(sheetName, typeCell, typeCell, incomeStyle)
		} else {
			f.SetCellStyle(sheetName, typeCell, typeCell, expenseStyle)
		}

		rowNum++
	}

	// ── Summary Rows ─────────────────────────────────────────
	rowNum++
	f.MergeCell(sheetName, fmt.Sprintf("A%d", rowNum), fmt.Sprintf("E%d", rowNum))
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", rowNum), "TOTAL PEMASUKAN")
	f.SetCellValue(sheetName, fmt.Sprintf("F%d", rowNum), summary.TotalIncome)
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", rowNum), fmt.Sprintf("I%d", rowNum), totalStyle)
	f.SetCellStyle(sheetName, fmt.Sprintf("F%d", rowNum), fmt.Sprintf("F%d", rowNum), totalStyle)
	rowNum++

	f.MergeCell(sheetName, fmt.Sprintf("A%d", rowNum), fmt.Sprintf("E%d", rowNum))
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", rowNum), "TOTAL PENGELUARAN")
	f.SetCellValue(sheetName, fmt.Sprintf("F%d", rowNum), summary.TotalExpense)
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", rowNum), fmt.Sprintf("I%d", rowNum), totalStyle)
	f.SetCellStyle(sheetName, fmt.Sprintf("F%d", rowNum), fmt.Sprintf("F%d", rowNum), totalStyle)
	rowNum++

	f.MergeCell(sheetName, fmt.Sprintf("A%d", rowNum), fmt.Sprintf("E%d", rowNum))
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", rowNum), "SALDO BULAN INI")
	f.SetCellValue(sheetName, fmt.Sprintf("F%d", rowNum), summary.Balance)
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", rowNum), fmt.Sprintf("I%d", rowNum), totalStyle)
	f.SetCellStyle(sheetName, fmt.Sprintf("F%d", rowNum), fmt.Sprintf("F%d", rowNum), totalStyle)

	// Write to buffer
	buf, err := f.WriteToBuffer()
	if err != nil {
		return nil, "", err
	}

	filename := fmt.Sprintf("laporan-keuangan-%s-%d.xlsx", monthName, year)
	return buf, filename, nil
}

// ExportPDF generates a simple text-based PDF report
func (s *ReportService) ExportPDF(month, year int) (*bytes.Buffer, string, error) {
	summary, err := s.GetMonthly(month, year)
	if err != nil {
		return nil, "", err
	}

	monthName := time.Month(month).String()

	// Generate HTML content that can be used as PDF via browser print
	// This is returned as HTML with print-optimized CSS
	html := s.generateHTMLReport(summary, monthName, year)

	buf := bytes.NewBufferString(html)
	filename := fmt.Sprintf("laporan-keuangan-%s-%d.html", monthName, year)
	return buf, filename, nil
}

// generateHTMLReport creates a print-ready HTML report
func (s *ReportService) generateHTMLReport(summary *ReportSummary, monthName string, year int) string {
	rows := ""
	for i, tx := range summary.Transactions {
		categoryName := ""
		if tx.Category != nil {
			categoryName = tx.Category.Name
		}
		typeLabel := "Pemasukan"
		typeColor := "#16a34a"
		if tx.Type == models.TransactionExpense {
			typeLabel = "Pengeluaran"
			typeColor = "#dc2626"
		}
		rows += fmt.Sprintf(`
		<tr>
			<td>%d</td>
			<td>%s</td>
			<td style="color:%s;font-weight:600">%s</td>
			<td>%s</td>
			<td>%s</td>
			<td style="text-align:right">Rp %s</td>
			<td>%s</td>
			<td>%s</td>
		</tr>`,
			i+1,
			tx.Date.Format("02/01/2006"),
			typeColor, typeLabel,
			categoryName,
			tx.Description,
			formatRupiah(tx.Amount),
			string(tx.Method),
			tx.ReferenceNo,
		)
	}

	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Laporan Keuangan RT — %s %d</title>
<style>
  @media print { body { margin: 0; } }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; padding: 20px; }
  h1 { text-align:center; color:#1e40af; margin-bottom:4px; }
  h2 { text-align:center; color:#64748b; font-weight:normal; margin-top:0; }
  .meta { text-align:center; color:#94a3b8; font-size:11px; margin-bottom:20px; }
  table { width:100%%; border-collapse:collapse; margin-bottom:20px; }
  th { background:#1e40af; color:#fff; padding:8px; text-align:left; font-size:11px; }
  td { padding:6px 8px; border-bottom:1px solid #e2e8f0; }
  tr:nth-child(even) { background:#f8fafc; }
  .summary-table td { font-weight:bold; font-size:13px; }
  .balance { color:#1e40af; font-size:14px; }
  .total-row { background:#f1f5f9; }
  @media print { button { display:none; } }
</style>
</head>
<body>
<h1>LAPORAN KEUANGAN RT</h1>
<h2>Periode: %s %d</h2>
<p class="meta">Digenerate pada: %s &nbsp;|&nbsp; Total Transaksi: %d</p>

<table>
  <thead>
    <tr>
      <th>No</th><th>Tanggal</th><th>Jenis</th><th>Kategori</th>
      <th>Uraian</th><th style="text-align:right">Nominal</th><th>Metode</th><th>No. Ref</th>
    </tr>
  </thead>
  <tbody>%s</tbody>
</table>

<table class="summary-table" style="width:400px;margin-left:auto">
  <tr class="total-row"><td>Total Pemasukan</td><td style="text-align:right;color:#16a34a">Rp %s</td></tr>
  <tr class="total-row"><td>Total Pengeluaran</td><td style="text-align:right;color:#dc2626">Rp %s</td></tr>
  <tr class="total-row balance"><td>Saldo Bulan Ini</td><td style="text-align:right">Rp %s</td></tr>
</table>

<script>window.onload = function(){ window.print(); }</script>
</body>
</html>`,
		monthName, year,
		monthName, year,
		time.Now().Format("02 January 2006 15:04"),
		len(summary.Transactions),
		rows,
		formatRupiah(summary.TotalIncome),
		formatRupiah(summary.TotalExpense),
		formatRupiah(summary.Balance),
	)
}

// formatRupiah formats a float64 as Indonesian Rupiah string
func formatRupiah(amount float64) string {
	// Simple integer formatting with dot separator
	intPart := int64(amount)
	result := ""
	str := fmt.Sprintf("%d", intPart)
	n := len(str)
	for i, c := range str {
		if i > 0 && (n-i)%3 == 0 {
			result += "."
		}
		result += string(c)
	}
	return result
}
