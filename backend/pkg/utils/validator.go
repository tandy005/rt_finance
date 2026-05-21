package utils

import (
	"path/filepath"
	"strings"
)

// AllowedImageExtensions defines accepted file extensions for attachments
var AllowedAttachmentExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".pdf":  true,
}

// IsValidAttachment checks if the file extension is allowed
func IsValidAttachment(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	return AllowedAttachmentExtensions[ext]
}

// GetFileExtension returns the lowercase extension of a filename
func GetFileExtension(filename string) string {
	return strings.ToLower(filepath.Ext(filename))
}

// SanitizeFilename removes potentially dangerous characters from filename
func SanitizeFilename(filename string) string {
	// Remove directory traversal attempts
	filename = filepath.Base(filename)
	// Replace spaces with underscores
	filename = strings.ReplaceAll(filename, " ", "_")
	return filename
}
