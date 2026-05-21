# ========================================
# RT Finance Hub — Makefile
# ========================================

.PHONY: run build tidy seed migrate help

# Default target
help:
	@echo "RT Finance Hub — Available Commands:"
	@echo ""
	@echo "  make run      - Run the API server"
	@echo "  make build    - Build the binary"
	@echo "  make tidy     - Download and tidy Go modules"
	@echo "  make seed     - Run the database seeder"
	@echo "  make migrate  - Run database auto-migration only"
	@echo "  make help     - Show this help message"

# Run the development server
run:
	go run ./cmd/main.go

# Build the binary
build:
	go build -o bin/rt-finance ./cmd/main.go
	@echo "Binary built: ./bin/rt-finance"

# Tidy Go modules
tidy:
	go mod tidy
	@echo "Go modules tidied"

# Run database seeder
seed:
	go run ./seeder/seeder.go

# Run migration only (starts server then exits — use for CI)
migrate:
	@echo "Running migrations via server start..."
	go run ./cmd/main.go &
	sleep 3
	kill %1
