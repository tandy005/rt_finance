# 🏦 RT Finance Hub — Panduan Menjalankan Aplikasi

> Panduan lengkap untuk menjalankan aplikasi RT Finance Hub di lingkungan development.

---

## 📋 Prasyarat (Install Sekali)

Pastikan semua tools berikut sudah terinstall di komputer Anda:

| Tools | Versi Minimum | Link Download | Cara Cek |
|-------|--------------|---------------|----------|
| **Docker Desktop** | 24+ | [docker.com](https://www.docker.com/products/docker-desktop/) | `docker --version` |
| **Go** | 1.21+ | [go.dev](https://go.dev/dl/) | `go version` |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) | `node --version` |
| **npm** | 9+ | (ikut Node.js) | `npm --version` |

---

## 🚀 Cara Menjalankan (Setiap Kali Kerja)

Butuh **3 terminal** yang berjalan bersamaan.

### Terminal 1 — Database PostgreSQL

```powershell
# Masuk ke folder project
cd C:\Users\mriza\Documents\Latihan\website\rt_finance

# Pastikan Docker Desktop sudah terbuka di system tray!
# Jalankan database
docker compose up -d
```

**Output yang diharapkan:**
```
Container rt_finance_db  Running
```

> ⚠️ **Jika error**: Buka Docker Desktop dari Start Menu, tunggu sampai icon di system tray berhenti loading, lalu coba lagi.

---

### Terminal 2 — Backend API (Go)

```powershell
# Masuk ke folder backend
cd C:\Users\mriza\Documents\Latihan\website\rt_finance\backend

# Jalankan server
go run ./cmd/main.go
```

**Output yang diharapkan:**
```
[INFO] Database connected successfully
[INFO] Database migration completed
[INFO] Upload directory ready: ./uploads
[GIN-debug] GET    /api/health
[GIN-debug] POST   /api/auth/login
... (daftar routes)
[INFO] RT Finance Hub API starting on http://localhost:8080
```

> ✅ **Cek**: Buka browser → http://localhost:8080/api/health
> Harus muncul: `{"message":"RT Finance Hub API is running","status":"ok"}`

---

### Terminal 3 — Frontend (React + Vite)

```powershell
# Masuk ke folder frontend
cd C:\Users\mriza\Documents\Latihan\website\rt_finance\frontend

# Jalankan dev server
npm run dev
```

**Output yang diharapkan:**
```
VITE v8.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

> ✅ **Cek**: Buka browser → http://localhost:5173
> Harus muncul halaman login RT Finance Hub.

---

### 🌍 Alternatif: Menjalankan untuk Akses Online (Vercel + Ngrok)

Jika Anda ingin website Vercel Anda yang sudah online bisa menarik data dari laptop Anda (agar bisa dibuka oleh orang lain), jalankan **3 Terminal** berikut setiap kali komputer dinyalakan:

1. **Terminal 1 — Database (Docker)**
   ```powershell
   cd C:\Users\mriza\Documents\Latihan\website\rt_finance
   docker compose up -d
   ```

2. **Terminal 2 — Backend API (Go)**
   ```powershell
   cd C:\Users\mriza\Documents\Latihan\website\rt_finance\backend
   go run ./cmd/main.go
   ```

3. **Terminal 3 — Ngrok Tunnel**
   ```powershell
   ngrok http 8080
   ```
   *(Lalu copy link HTTPS yang didapat, dan update `VITE_API_URL` di dashboard Vercel jika link-nya berubah).*

> **💡 Catatan Penting:**
> - Saat menggunakan alur ini, Anda **tidak perlu** menjalankan `npm run dev` karena frontend-nya sudah dilayani oleh Vercel.
> - Web Vercel hanya akan berfungsi selama laptop Anda menyala dan ketiga terminal di atas tidak ditutup.

---

## 🔑 Akun Login

| Role | Email | Password | Akses |
|------|-------|----------|-------|
| **Admin / Bendahara** | `admin@rtfinance.com` | `admin123` | Full akses (CRUD, upload, export) |
| **Viewer / Warga** | `warga@rtfinance.com` | `warga123` | Hanya lihat dashboard & laporan |
| **Viewer** | `budi@rtfinance.com` | `budi123` | Hanya lihat dashboard & laporan |

---

## 🌐 URL & Port

| Service | URL | Keterangan |
|---------|-----|-----------|
| **Frontend** | http://localhost:5173 | Aplikasi web utama |
| **Backend API** | http://localhost:8080 | REST API |
| **Health Check** | http://localhost:8080/api/health | Cek status backend |
| **PostgreSQL** | localhost:5432 | Database (akses via DBeaver) |

---

## 🗄️ Koneksi Database di DBeaver

Buka DBeaver dan buat koneksi baru dengan setting berikut:

| Field | Value |
|-------|-------|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `rt_finance` |
| **Username** | `postgres` |
| **Password** | `postgres` |

---

## 🔄 Menjalankan Seeder (Data Dummy)

Jika database kosong atau ingin reset data dummy:

```powershell
# Di folder backend (terminal terpisah dari server)
cd C:\Users\mriza\Documents\Latihan\website\rt_finance\backend
go run ./seeder/seeder.go
```

Data yang dibuat:
- 3 user (admin + 2 viewer)
- 8 kategori
- 12 transaksi (Jan–Mar 2025)

> ⚠️ **Peringatan**: Seeder menghapus data yang ada lalu membuat ulang. Backup dulu jika ada data penting.

---

## 🛑 Cara Menghentikan Aplikasi

| Yang Dihentikan | Cara |
|----------------|------|
| Frontend | Tekan `Ctrl + C` di Terminal 3 |
| Backend | Tekan `Ctrl + C` di Terminal 2 |
| Database | `docker compose down` (di folder root) |

```powershell
# Hentikan database
cd C:\Users\mriza\Documents\Latihan\website\rt_finance
docker compose down
```

> 💡 **Tips**: Data tetap tersimpan meski container dihentikan (menggunakan Docker volume `rt_finance_data`).

---

## 🐛 Troubleshooting

### ❌ Login gagal / tidak bisa akses aplikasi

**Cek checklist ini berurutan:**

1. **Docker Desktop berjalan?**
   - Lihat system tray, cari icon Docker (ikon paus 🐳)
   - Jika belum: buka Docker Desktop dari Start Menu, tunggu ready

2. **Database jalan?**
   ```powershell
   docker ps
   # Harus ada: rt_finance_db
   ```

3. **Backend jalan?**
   - Buka browser: http://localhost:8080/api/health
   - Harus ada response JSON

4. **Frontend jalan?**
   - Buka browser: http://localhost:5173
   - Harus muncul halaman login

---

### ❌ Error: `dial error (dial tcp 127.0.0.1:5432: connectex: No connection could be made)`

**Penyebab**: PostgreSQL belum berjalan.

```powershell
# Solusi:
docker compose up -d
# Tunggu 5 detik, lalu jalankan ulang backend
```

---

### ❌ Error: `port 8080 already in use`

**Penyebab**: Ada proses lain yang menggunakan port 8080.

```powershell
# Cari proses yang menggunakan port 8080
netstat -ano | findstr :8080

# Hentikan proses (ganti PID dengan angka yang ditemukan)
taskkill /PID <PID> /F
```

---

### ❌ Error: `port 5173 already in use`

```powershell
# Cari proses yang menggunakan port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

### ❌ Backend build error setelah update kode

```powershell
cd C:\Users\mriza\Documents\Latihan\website\rt_finance\backend

# Download dependency baru
go mod tidy

# Test build
go build ./...

# Jalankan ulang
go run ./cmd/main.go
```

---

### ❌ Frontend tidak muncul atau blank page

```powershell
cd C:\Users\mriza\Documents\Latihan\website\rt_finance\frontend

# Reinstall dependencies
npm install

# Jalankan ulang
npm run dev
```

---

## 📁 Struktur Folder Project

```
rt_finance/
├── backend/                    # Go API Server
│   ├── cmd/main.go             # Entry point server
│   ├── internal/
│   │   ├── config/             # Konfigurasi DB & env
│   │   ├── models/             # GORM models
│   │   ├── middlewares/        # JWT auth, CORS
│   │   ├── repositories/       # Query database
│   │   ├── services/           # Business logic
│   │   ├── handlers/           # HTTP handlers
│   │   └── routes/             # Route definitions
│   ├── pkg/utils/              # Helper functions
│   ├── seeder/seeder.go        # Data dummy seeder
│   ├── uploads/                # File upload (auto-created)
│   ├── .env                    # Konfigurasi environment
│   └── go.mod                  # Go dependencies
│
├── frontend/                   # React App
│   ├── src/
│   │   ├── api/                # Axios API calls
│   │   ├── components/         # Reusable components
│   │   ├── layouts/            # Layout pages
│   │   ├── pages/              # Halaman aplikasi
│   │   ├── routes/             # Router & route guards
│   │   └── store/              # Zustand state management
│   ├── .env                    # Vite environment
│   └── vite.config.js          # Vite + proxy config
│
├── docker-compose.yml          # PostgreSQL container
├── README.md                   # Dokumentasi singkat
├── RUNNING_GUIDE.md            # Panduan ini
├── IMPLEMENTATION_PLAN.md      # Rencana implementasi
└── PROGRESS.md                 # History pengerjaan
```

---

## ⚙️ Konfigurasi Environment

### Backend (`backend/.env`)

```env
PORT=8080
GIN_MODE=debug
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=rt_finance
DB_SSLMODE=disable
JWT_SECRET=rt_finance_super_secret_jwt_key_2024_change_this
JWT_EXPIRE_HOURS=24
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=5242880
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=/api
```

> 💡 `VITE_API_URL=/api` menggunakan Vite proxy sehingga request dari browser diteruskan ke backend secara otomatis tanpa CORS issue.

---

## 📊 Status Pengembangan

| Phase | Status | Keterangan |
|-------|--------|-----------|
| Phase 1 — Backend Foundation | ✅ Selesai | Setup project, models, auth |
| Phase 2 — Backend CRUD API | ✅ Selesai | Semua endpoint REST API |
| Phase 3 — Frontend Foundation | ✅ Selesai | Layout, login, routing |
| Phase 4 — Frontend Dashboard & Transaksi | 🔄 In Progress | Charts, tabel, form CRUD |
| Phase 5 — Frontend Kategori, Laporan & Polish | ⏳ Belum | Export, dark mode, finishing |

---

## 💡 Tips Development

```powershell
# Lihat log database real-time
docker logs -f rt_finance_db

# Cek semua container yang berjalan
docker ps

# Reset total database (HATI-HATI: data hilang semua!)
docker compose down -v
docker compose up -d
# Lalu jalankan seeder ulang

# Build backend untuk cek error kompilasi
cd backend
go build ./...
go vet ./...
```

---

*Dokumen ini diperbarui terakhir: 2026-05-21*
