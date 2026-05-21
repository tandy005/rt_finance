# deploy.ps1 — Script deploy RT Finance Hub ke Oracle Cloud VPS
# Cara pakai: .\deploy.ps1 -ServerIP "150.230.xxx.xxx"
#
# Prasyarat:
#   - SSH key sudah dikonfigurasi (ssh ubuntu@IP bisa tanpa password)
#   - Go terinstall di lokal
#   - Node.js & npm terinstall di lokal

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    [string]$User = "ubuntu",
    [switch]$FrontendOnly,
    [switch]$BackendOnly
)

$Server   = "$User@$ServerIP"
$Root     = $PSScriptRoot
$Frontend = Join-Path $Root "frontend"
$Backend  = Join-Path $Root "backend"

function Write-Step($msg) {
    Write-Host "`n$msg" -ForegroundColor Cyan
}
function Write-OK($msg) {
    Write-Host "  ✅ $msg" -ForegroundColor Green
}
function Write-Fail($msg) {
    Write-Host "  ❌ $msg" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 RT Finance Hub — Deploy ke $ServerIP" -ForegroundColor Magenta
Write-Host "=" * 50

# ── Frontend ─────────────────────────────────────────
if (-not $BackendOnly) {
    Write-Step "📦 Building frontend (React)..."

    Set-Location $Frontend
    npm run build
    if ($LASTEXITCODE -ne 0) { Write-Fail "npm build gagal" }
    Write-OK "Build selesai → dist/"

    Write-Step "📤 Upload frontend ke server..."
    scp -r "dist/*" "${Server}:/var/www/rtfinance/"
    if ($LASTEXITCODE -ne 0) { Write-Fail "Upload frontend gagal" }
    Write-OK "Frontend ter-upload ke /var/www/rtfinance/"
}

# ── Backend ───────────────────────────────────────────
if (-not $FrontendOnly) {
    Write-Step "🏗️  Building backend (Go — Linux ARM64)..."

    Set-Location $Backend
    $env:GOOS       = "linux"
    $env:GOARCH     = "arm64"
    $env:CGO_ENABLED = "0"

    go build -ldflags="-s -w" -o rtfinance-server ./cmd/main.go
    if ($LASTEXITCODE -ne 0) {
        Remove-Item Env:GOOS, Env:GOARCH, Env:CGO_ENABLED -ErrorAction SilentlyContinue
        Write-Fail "go build gagal"
    }

    Remove-Item Env:GOOS, Env:GOARCH, Env:CGO_ENABLED -ErrorAction SilentlyContinue
    Write-OK "Binary rtfinance-server siap"

    Write-Step "📤 Upload backend ke server..."
    scp rtfinance-server "${Server}:/opt/rtfinance/backend/"
    if ($LASTEXITCODE -ne 0) { Write-Fail "Upload backend gagal" }
    Write-OK "Binary ter-upload ke /opt/rtfinance/backend/"

    Write-Step "🔄 Restart backend service..."
    ssh $Server "sudo systemctl restart rtfinance"
    if ($LASTEXITCODE -ne 0) { Write-Fail "Restart service gagal" }
    Start-Sleep -Seconds 2
    ssh $Server "sudo systemctl is-active rtfinance"
    Write-OK "Service rtfinance berjalan"
}

# ── Verifikasi ───────────────────────────────────────
Write-Step "🧪 Verifikasi deployment..."
$health = ssh $Server "curl -s http://localhost:8080/api/health"
if ($health -match "ok") {
    Write-OK "API health check: OK"
} else {
    Write-Host "  ⚠️  Health check tidak memberikan response 'ok' — cek manual" -ForegroundColor Yellow
}

Write-Host "`n🎉 Deploy selesai!" -ForegroundColor Magenta
Write-Host "   Buka: http://$ServerIP`n" -ForegroundColor White

Set-Location $Root

