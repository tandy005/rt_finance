# RT Finance Hub 🏘️

Aplikasi manajemen kas RT (Rukun Tetangga) yang transparan dan mudah diakses oleh warga dan bendahara. Dibangun dengan **React + Vite + Tailwind CSS** (frontend) dan **Go + Gin + GORM** (backend).

---

## ✨ Fitur Utama

| Fitur | Admin/Bendahara | Viewer/Warga |
|-------|:-:|:-:|
| Login & autentikasi JWT | ✅ | ✅ |
| Dashboard (saldo, charts, recent tx) | ✅ | ✅ |
| Lihat transaksi + filter + pagination | ✅ | ✅ |
| Tambah / edit / hapus transaksi | ✅ | ❌ |
| Manajemen kategori | ✅ | ❌ |
| Laporan bulanan | ✅ | ✅ |
| Export Excel (.xlsx) | ✅ | ✅ |
| Export PDF / Print | ✅ | ✅ |
| Dark mode | ✅ | ✅ |
| Upload bukti transaksi | ✅ | ❌ |

---

## 🚀 Cara Menjalankan

### Prasyarat
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (untuk PostgreSQL)
- [Go 1.21+](https://go.dev/)
- [Node.js 18+](https://nodejs.org/)

### 1. Clone & setup

```powershell
# Clone atau buka folder project
cd rt_finance
```

### 2. Start Database (PostgreSQL via Docker)

```powershell
# Di root folder project
docker compose up -d
```

### 3. Start Backend

```powershell
cd backend
go run ./cmd/main.go
# Backend berjalan di http://localhost:8080
```

> **Pertama kali?** Jalankan seeder untuk data dummy:
> ```powershell
> go run ./seeder/seeder.go
> ```

### 4. Start Frontend

```powershell
cd frontend
npm install   # hanya pertama kali
npm run dev
# Frontend berjalan di http://localhost:5173
```

Buka **http://localhost:5173** di browser.

---

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin / Bendahara | `admin@rtfinance.com` | `admin123` |
| Viewer / Warga | `warga@rtfinance.com` | `warga123` |
| Viewer | `budi@rtfinance.com` | `budi123` |

---

## 🗂️ Struktur Project

```
rt_finance/
├── backend/                  # Go backend (Gin + GORM)
│   ├── cmd/main.go           # Entry point
│   ├── internal/
│   │   ├── config/           # Database & env config
│   │   ├── models/           # GORM models
│   │   ├── middlewares/      # JWT auth, CORS
│   │   ├── repositories/     # Database query layer
│   │   ├── services/         # Business logic
│   │   ├── handlers/         # HTTP handlers
│   │   └── routes/           # Router setup
│   ├── pkg/utils/            # Helpers (pagination, response, validator)
│   ├── seeder/               # Dummy data seeder
│   ├── uploads/              # File upload storage
│   ├── .env                  # Environment variables
│   └── Makefile
│
├── frontend/                 # React + Vite + Tailwind
│   └── src/
│       ├── api/              # Axios API calls
│       ├── components/       # Reusable components
│       │   ├── dashboard/    # StatCard, Charts, RecentTx
│       │   ├── transactions/ # Table, Filters, Form
│       │   └── ui/           # Button, Modal, Toast, Skeleton
│       ├── layouts/          # DashboardLayout, AuthLayout
│       ├── pages/            # Login, Dashboard, Transactions, Categories, Reports
│       ├── routes/           # React Router + guards
│       ├── store/            # Zustand (auth, ui)
│       └── utils/            # formatters.js
│
├── docker-compose.yml        # PostgreSQL 16
├── IMPLEMENTATION_PLAN.md
└── PROGRESS.md
```

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 3, React Router 7, Axios, React Hook Form + Zod, TanStack Table, Recharts, Zustand |
| **Backend** | Go 1.22, Gin Framework, GORM |
| **Database** | PostgreSQL 16 (Docker) |
| **Auth** | JWT (JSON Web Token, 24 jam) |
| **Export** | excelize (Excel), HTML print (PDF) |

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Role |
|--------|----------|:----:|:----:|
| POST | `/api/auth/login` | ❌ | Public |
| GET | `/api/auth/profile` | ✅ | All |
| GET | `/api/categories` | ✅ | All |
| POST | `/api/categories` | ✅ | Admin |
| PUT | `/api/categories/:id` | ✅ | Admin |
| DELETE | `/api/categories/:id` | ✅ | Admin |
| GET | `/api/transactions` | ✅ | All |
| POST | `/api/transactions` | ✅ | Admin |
| PUT | `/api/transactions/:id` | ✅ | Admin |
| DELETE | `/api/transactions/:id` | ✅ | Admin |
| POST | `/api/transactions/upload` | ✅ | Admin |
| GET | `/api/dashboard/summary` | ✅ | All |
| GET | `/api/reports/monthly` | ✅ | All |
| GET | `/api/reports/export/excel` | ✅ | All |
| GET | `/api/reports/export/pdf` | ✅ | All |

---

## 📊 Database Schema

```sql
-- users: id, name, email, password, role (admin/viewer), timestamps, deleted_at
-- categories: id, name, timestamps, deleted_at
-- transactions: id, date, description, type (income/expense), category_id,
--               amount, method (cash/transfer), reference_no, attachment,
--               created_by, timestamps, deleted_at
```

> Semua tabel dibuat otomatis oleh **GORM Auto Migration** saat server start.
> **Soft delete** aktif — data tidak benar-benar dihapus dari database.

---

## ⚙️ Environment Variables

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
VITE_API_URL=http://localhost:8080/api
```

---

## 📝 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| PostgreSQL connection refused | Pastikan Docker Desktop running, lalu `docker compose up -d` |
| Frontend tidak bisa connect ke backend | Pastikan backend jalan di port 8080 dan `VITE_API_URL` benar |
| Login gagal | Jalankan seeder terlebih dahulu |
| Export Excel error | Pastikan ada transaksi di bulan yang dipilih |
