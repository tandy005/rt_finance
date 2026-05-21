# RT Finance Hub — Implementation Plan

> Dokumen ini berisi rencana implementasi lengkap aplikasi RT Finance Hub.
> Diperbarui setiap kali ada perubahan atau penyelesaian phase.
>
> **Last Updated**: 2026-05-20

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React JS, Vite, Tailwind CSS, React Router, Axios, React Hook Form, TanStack Table, Recharts, Zustand |
| **Backend** | Golang, Gin Framework, GORM |
| **Database** | PostgreSQL 16 |
| **Auth** | JWT (JSON Web Token) |
| **Storage** | Local file storage |
| **DevOps** | Docker Compose (PostgreSQL) |

---

## Konsep Aplikasi

Aplikasi manajemen kas RT agar transparan dan mudah diakses oleh warga dan bendahara.

### Role User

| Role | Akses |
|------|-------|
| **Admin / Bendahara** | Login, CRUD transaksi, CRUD kategori, Upload bukti, Download laporan PDF/Excel, Dashboard |
| **Viewer / Warga** | Login, Lihat laporan dan dashboard (read-only) |

---

## Strategi Pengerjaan — 5 Phase

Proyek dibagi menjadi **5 Phase** agar dapat dikerjakan bertahap tanpa kehabisan token AI.

---

## Phase 1 ✅ — Project Setup & Backend Foundation

> **Status**: SELESAI (2026-05-20)
> **Scope**: Inisialisasi project, struktur folder, database schema, koneksi DB, auth endpoint

### File yang Dibuat

| File | Keterangan |
|------|-----------|
| `backend/cmd/main.go` | Entry point aplikasi |
| `backend/internal/config/config.go` | Load environment variables |
| `backend/internal/config/database.go` | Koneksi PostgreSQL + GORM auto migration |
| `backend/internal/models/user.go` | Model User (role: admin/viewer) |
| `backend/internal/models/category.go` | Model Category |
| `backend/internal/models/transaction.go` | Model Transaction (type: income/expense) |
| `backend/internal/middlewares/auth.go` | JWT middleware + AdminOnly guard |
| `backend/internal/middlewares/cors.go` | CORS middleware |
| `backend/internal/repositories/user_repository.go` | User query layer |
| `backend/internal/services/auth_service.go` | Login + bcrypt + JWT generation |
| `backend/internal/handlers/auth_handler.go` | POST /auth/login, GET /auth/profile |
| `backend/internal/routes/routes.go` | Router setup + Dependency Injection |
| `backend/pkg/utils/response.go` | Standard JSON response helpers |
| `backend/seeder/seeder.go` | Dummy data (3 users, 8 kategori, 12 transaksi) |
| `backend/Makefile` | Helper commands |
| `backend/go.mod` + `go.sum` | Go module & dependencies |
| `backend/.env` | Development environment config |
| `backend/.env.example` | Template environment |
| `docker-compose.yml` | PostgreSQL 16 via Docker |

---

## Phase 2 — Backend CRUD & API Endpoints

> **Status**: BELUM DIMULAI
> **Scope**: Semua CRUD endpoint untuk transactions, categories, dashboard, reports

### File yang Akan Dibuat

| File | Keterangan |
|------|-----------|
| `backend/internal/repositories/category_repository.go` | CRUD query kategori |
| `backend/internal/repositories/transaction_repository.go` | CRUD query transaksi + filter + pagination |
| `backend/internal/services/category_service.go` | Business logic kategori |
| `backend/internal/services/transaction_service.go` | Business logic transaksi + kalkulasi saldo |
| `backend/internal/services/dashboard_service.go` | Kalkulasi summary dashboard dinamis |
| `backend/internal/services/report_service.go` | Generate laporan |
| `backend/internal/handlers/category_handler.go` | REST handler kategori |
| `backend/internal/handlers/transaction_handler.go` | REST handler transaksi + upload file |
| `backend/internal/handlers/dashboard_handler.go` | REST handler dashboard summary |
| `backend/internal/handlers/report_handler.go` | REST handler export laporan |
| `backend/pkg/utils/validator.go` | Custom validation helper |
| `backend/pkg/utils/pagination.go` | Pagination helper |

### API Endpoints yang Akan Dibuat

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
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

## Phase 3 — Frontend Foundation & Auth

> **Status**: BELUM DIMULAI
> **Scope**: Setup Vite + Tailwind, layout utama, auth flow, routing, store

### File yang Akan Dibuat

| File | Keterangan |
|------|-----------|
| `frontend/` (Vite project) | Init dengan React + Tailwind CSS |
| `frontend/src/store/authStore.js` | Zustand store auth state |
| `frontend/src/store/uiStore.js` | Zustand store dark mode, sidebar toggle |
| `frontend/src/api/axios.js` | Axios instance + interceptor |
| `frontend/src/api/auth.js` | API calls auth |
| `frontend/src/routes/index.jsx` | React Router + protected routes |
| `frontend/src/layouts/DashboardLayout.jsx` | Layout utama sidebar + navbar |
| `frontend/src/layouts/AuthLayout.jsx` | Layout halaman login |
| `frontend/src/components/Sidebar.jsx` | Sidebar navigasi modern |
| `frontend/src/components/Navbar.jsx` | Top navbar |
| `frontend/src/components/ui/Button.jsx` | Reusable button |
| `frontend/src/components/ui/Modal.jsx` | Reusable modal |
| `frontend/src/components/ui/Toast.jsx` | Toast notification |
| `frontend/src/components/ui/Skeleton.jsx` | Loading skeleton |
| `frontend/src/pages/Login.jsx` | Halaman login modern |

---

## Phase 4 — Frontend Pages: Dashboard & Transactions

> **Status**: BELUM DIMULAI
> **Scope**: Halaman dashboard dengan charts, manajemen transaksi

### File yang Akan Dibuat

| File | Keterangan |
|------|-----------|
| `frontend/src/pages/Dashboard.jsx` | Dashboard stat cards + charts |
| `frontend/src/components/dashboard/StatCard.jsx` | Card statistik |
| `frontend/src/components/dashboard/IncomeExpenseChart.jsx` | Recharts bar chart |
| `frontend/src/components/dashboard/CategoryPieChart.jsx` | Recharts pie chart |
| `frontend/src/components/dashboard/RecentTransactions.jsx` | 5 transaksi terbaru |
| `frontend/src/pages/Transactions.jsx` | Halaman tabel transaksi |
| `frontend/src/components/transactions/TransactionTable.jsx` | TanStack Table |
| `frontend/src/components/transactions/TransactionFilters.jsx` | Filter bar |
| `frontend/src/components/transactions/TransactionForm.jsx` | Form React Hook Form |
| `frontend/src/api/transactions.js` | API calls transaksi |
| `frontend/src/api/dashboard.js` | API calls dashboard |

---

## Phase 5 — Frontend: Categories, Reports & Polish

> **Status**: BELUM DIMULAI
> **Scope**: CRUD kategori, laporan, dark mode, responsive, finishing

### File yang Akan Dibuat

| File | Keterangan |
|------|-----------|
| `frontend/src/pages/Categories.jsx` | Halaman manajemen kategori |
| `frontend/src/pages/Reports.jsx` | Halaman laporan + export |
| `frontend/src/api/categories.js` | API calls kategori |
| `frontend/src/api/reports.js` | API calls report |
| `frontend/src/components/categories/CategoryForm.jsx` | Form kategori |
| `frontend/src/components/reports/ReportFilters.jsx` | Filter laporan |
| `frontend/src/utils/formatters.js` | Currency + date formatter |
| `frontend/src/utils/exportHelpers.js` | Helper export |
| `frontend/src/components/ui/EmptyState.jsx` | Empty state UI |
| `frontend/src/components/ui/ConfirmDialog.jsx` | Confirm dialog hapus |
| `frontend/tailwind.config.js` | Tailwind + dark mode config |
| `README.md` | Dokumentasi lengkap |

---

## Database Schema

```sql
-- users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- transactions
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(10) NOT NULL,       -- 'income' | 'expense'
  category_id INT REFERENCES categories(id),
  amount DECIMAL(15,2) NOT NULL,
  method VARCHAR(20) NOT NULL,     -- 'cash' | 'transfer'
  reference_no VARCHAR(100),
  attachment VARCHAR(255),
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
```

> **Catatan**: Tabel dibuat otomatis oleh GORM Auto Migration saat server pertama kali dijalankan.

---

## Environment Variables

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

## Cara Menjalankan Project

### 1. Start Database

```powershell
# Di root folder project
docker compose up -d
```

### 2. Start Backend

```powershell
cd backend
go run ./cmd/main.go
# Server berjalan di http://localhost:8080
```

### 3. Seed Data (pertama kali)

```powershell
# Terminal baru
cd backend
go run ./seeder/seeder.go
```

### 4. Start Frontend (Phase 3+)

```powershell
cd frontend
npm install
npm run dev
# App berjalan di http://localhost:5173
```

---

## Urutan Eksekusi Phase

```
Phase 1 ✅ → Phase 2 → Phase 3 → Phase 4 → Phase 5
```

Ketik untuk melanjutkan:
- **"Lanjut Phase 2"** — Backend CRUD API
- **"Lanjut Phase 3"** — Frontend foundation & auth
- **"Lanjut Phase 4"** — Frontend dashboard & transaksi
- **"Lanjut Phase 5"** — Frontend kategori, laporan & finishing
