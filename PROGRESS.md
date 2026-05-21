# RT Finance Hub — Progress & Work History

> Dokumen ini mencatat semua pekerjaan yang telah diselesaikan beserta hasilnya.
>
> **Project Start**: 2026-05-20
> **Last Updated**: 2026-05-20

---

## Status Keseluruhan

| Phase | Status | Tanggal |
|-------|--------|---------|
| Phase 1: Backend Foundation | ✅ SELESAI | 2026-05-20 |
| Phase 2: Backend CRUD API | ✅ SELESAI | 2026-05-20 |
| Phase 3: Frontend Foundation & Auth | ✅ SELESAI | 2026-05-20 |
| Phase 4: Frontend Dashboard & Transactions | ✅ SELESAI | 2026-05-21 |
| Phase 5: Frontend Categories, Reports & Polish | ✅ SELESAI | 2026-05-21 |

> 🎉 **PROJECT SELESAI!** Semua 5 phase telah berhasil diselesaikan.

---

## ⏭️ Lanjut Besok — Mulai dari Phase 3

Ketik: **"Lanjut Phase 3"**

Backend sudah 100% selesai. Phase 3 akan mulai membangun **Frontend** dengan:
- React + Vite + Tailwind CSS setup
- Layout dashboard (Sidebar + Navbar)
- Halaman Login (JWT auth)
- Zustand store + Axios interceptor
- Protected Routes

---

## Phase 1: Backend Foundation ✅

**Tanggal**: 2026-05-20
**Durasi**: ~1 sesi

### Pekerjaan yang Diselesaikan

#### 1. Struktur Folder Backend
Dibuat struktur clean architecture:
```
backend/
├── cmd/main.go
├── internal/
│   ├── config/
│   ├── models/
│   ├── middlewares/
│   ├── repositories/
│   ├── services/
│   ├── handlers/
│   └── routes/
├── pkg/utils/
├── seeder/
├── .env
├── .env.example
├── go.mod
├── go.sum
└── Makefile
```

#### 2. Go Module & Dependencies
- **Module**: `rt-finance`
- **Dependencies yang diinstall**:
  - `github.com/gin-gonic/gin v1.10.0` — HTTP framework
  - `gorm.io/gorm v1.25.10` — ORM
  - `gorm.io/driver/postgres v1.5.9` — PostgreSQL driver
  - `github.com/golang-jwt/jwt/v5 v5.2.1` — JWT auth
  - `github.com/joho/godotenv v1.5.1` — .env loader
  - `golang.org/x/crypto v0.23.0` — bcrypt password hashing
- **Command**: `go mod tidy` ✅ sukses

#### 3. Database Models (GORM)

| Model | File | Field Penting |
|-------|------|--------------|
| User | `models/user.go` | id, name, email, password, role (admin/viewer), soft delete |
| Category | `models/category.go` | id, name, soft delete |
| Transaction | `models/transaction.go` | id, date, description, type (income/expense), category_id, amount, method (cash/transfer), reference_no, attachment, created_by, soft delete |

#### 4. Middlewares
- **JWT Auth** (`middlewares/auth.go`): Validasi Bearer token, set user context (user_id, role)
- **AdminOnly** (`middlewares/auth.go`): Guard untuk endpoint yang hanya bisa diakses admin
- **CORS** (`middlewares/cors.go`): Allow origin dari `http://localhost:5173`

#### 5. Auth Service & Handler
- Login endpoint: `POST /api/auth/login`
- Profile endpoint: `GET /api/auth/profile` (protected)
- Password hashing menggunakan bcrypt
- JWT token expire 24 jam

#### 6. Database Setup
- PostgreSQL dijalankan via **Docker Compose**
- Container: `rt_finance_db` (postgres:16-alpine)
- Port: `5432`
- Auto migration GORM berjalan saat server start

#### 7. Seeder
- **3 Users**: Admin Bendahara, Warga Viewer, Budi Santoso
- **8 Kategori**: IPL, Kebersihan, Keamanan, Sosial, Operasional, Administrasi, Perbaikan Fasilitas, Lain-lain
- **12 Transaksi**: Income dan expense selama Jan–Mar 2025

### Hasil Verifikasi Phase 1

| Test | Status | Detail |
|------|--------|--------|
| `go build ./...` | ✅ Pass | Tidak ada error kompilasi |
| `go vet ./...` | ✅ Pass | Tidak ada warning |
| `GET /api/health` | ✅ Pass | Response: `{"status":"ok"}` |
| `POST /api/auth/login` (admin) | ✅ Pass | JWT token diterima |
| Database connection | ✅ Pass | Connected ke PostgreSQL Docker |
| Auto migration | ✅ Pass | Tabel users, categories, transactions dibuat |
| Seeder | ✅ Pass | 3 users + 8 kategori + 12 transaksi |

### Login Credentials (dari Seeder)

| Role | Email | Password |
|------|-------|----------|
| Admin/Bendahara | `admin@rtfinance.com` | `admin123` |
| Viewer/Warga | `warga@rtfinance.com` | `warga123` |
| Viewer | `budi@rtfinance.com` | `budi123` |

---

## Troubleshooting yang Dialami

### 1. PostgreSQL Connection Refused
**Error**: `dial error (dial tcp 127.0.0.1:5432: connectex: No Connection could be made)`
**Penyebab**: PostgreSQL tidak terinstall / tidak jalan
**Solusi**: Menggunakan Docker Compose (`docker compose up -d`)

### 2. Docker Desktop Belum Jalan
**Error**: `unable to get image: check if the daemon is running`
**Penyebab**: Docker Desktop process belum ready
**Solusi**: Buka Docker Desktop dari Start Menu, tunggu sampai ready, lalu jalankan ulang

---

## Cara Menjalankan Ulang (Quick Reference)

```powershell
# 1. Start PostgreSQL
docker compose up -d

# 2. Start Backend
cd backend
go run ./cmd/main.go

# 3. Test API
curl http://localhost:8080/api/health
```

---

## Catatan Teknis Penting

- **Saldo tidak disimpan di database** — dihitung dinamis: `total income - total expense`
- **Soft delete** aktif di semua model (data tidak benar-benar dihapus)
- **GORM Auto Migration** akan menambah kolom baru jika model diupdate (tidak drop/recreate tabel)
- **JWT Secret** harus diganti di production — jangan gunakan nilai default
- **Upload file** akan disimpan di folder `backend/uploads/` (dibuat otomatis)

---

## Next Steps

Ketik perintah berikut untuk melanjutkan pengembangan:

- **"Lanjut Phase 2"** → Backend CRUD API (categories, transactions, dashboard, reports)
- **"Lanjut Phase 3"** → Frontend foundation (Vite, layout, auth UI)
- **"Lanjut Phase 4"** → Frontend dashboard & manajemen transaksi
- **"Lanjut Phase 5"** → Frontend kategori, laporan, dark mode & finishing
