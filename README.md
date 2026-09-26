# University Library Management System (LMS)

A complete, production-ready, full-stack digital **Library Management System** built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **PostgreSQL (via Prisma ORM)** for a university Software Engineering semester project.

---

## 🚀 Key Features & Functional Modules

### 1. Role-Based Access Control (RBAC)
- **ADMIN**: System configuration, account provisioning, policy management, audit trail inspection, system-wide analytics, and backup overview.
- **LIBRARIAN**: Catalog CRUD management, physical copy barcode tracking, member management, loan issuing/returns, fine collection, and report generation.
- **MEMBER (Student & Faculty)**: Self-service catalog search, real-time availability checking, active borrowing management, due date tracking, accrued fine history, and in-app notifications.

### 2. Book & Copy Management
- Full catalog CRUD with support for multiple physical copies per title.
- Unique barcode asset tracking (`copyCode`) and physical shelf location (`shelfLocation`).
- Real-time status lifecycle (`AVAILABLE`, `ISSUED`, `RESERVED`, `LOST`, `DAMAGED`, `MAINTENANCE`).

### 3. Circulation & Loan Workflows
- **Issue Book**: Atomic transaction verifying member status, active loan limits (Student: 3, Faculty: 5), copy availability, and computing due dates (default 14 days).
- **Return Book**: Automatic overdue day calculation, fine rate calculation (₹5/day), status updating, and copy availability restoration.
- **Renew Loan**: Renewal limit enforcement (max 2 renewals) for non-overdue active loans.

### 4. Fine & Payment Engine
- Automated overdue fine generation upon book return.
- Fine collection processing with multiple payment modes (`CASH`, `UPI`, `CARD`, `ONLINE`).
- Receipt tracking and member fine statement history.

### 5. Analytics & CSV Export
- Multi-perspective dashboard metrics (Total books, copies, active loans, overdue books, outstanding fines).
- Date-range filtered reporting for borrowing activity, fine collection summaries, and top-borrowed books with 1-click **CSV Export**.

### 6. Security & Audit Logging
- PBKDF2 / bcrypt secure password hashing.
- HTTP-Only secure session cookies & HMAC JWT tokens.
- Complete audit logging (`AuditLog`) for all administrative actions and circulation transactions.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router), React 19, Tailwind CSS, Lucide Icons |
| **Backend** | Next.js Server Route Handlers, Zod Validation, Policy Service |
| **Database & ORM** | PostgreSQL / SQLite, Prisma ORM v6 |
| **Authentication** | HTTP-Only Cookies, HMAC JWT Session, PBKDF2 Password Hashing |
| **Containerization** | Dockerfile, docker-compose.yml |

---

## 🔑 Evaluation Demo Credentials

The database comes pre-seeded with realistic records for immediate testing:

| Role | Email | Password | Access / Capabilities |
|---|---|---|---|
| **ADMIN** | `admin@library.local` | `Password123!` | Full System Administration, Policy Settings, Audit Logs |
| **LIBRARIAN** | `librarian@library.local` | `Password123!` | Book Issue/Return, Member Reg, Fine Collection, Reports |
| **STUDENT MEMBER** | `student@library.local` | `Password123!` | Student Portal, Active Loans, Due Reminders, Fines |
| **FACULTY MEMBER** | `faculty@library.local` | `Password123!` | Faculty Portal, Increased Borrowing Limit (5 Books) |

---

## ⚙️ Quick Start & Setup Instructions

### Prerequisites
- Node.js `v20.x` or higher
- npm `v10.x` or higher
- PostgreSQL (or zero-config local file database)

### 1. Installation
```bash
# Clone the repository
cd "library managemnet system"

# Configure environment variables
cp .env.example .env
```

### 2. Database Migration & Seeding
```bash
# Push schema to database
npx prisma db push

# Seed sample data (Books, Copies, Members, Loans, Fines)
npm run db:seed
```

### 3. Run Development Server
```bash
npm run dev
# Open http://localhost:3000 in your browser
```

---

## 🧪 Verification & Test Suite

Run the automated business logic verification suite (verifying password security, policy engine defaults, fine calculations, and CSV export):

```bash
node scripts/test-runner.js
```

---

## 🐳 Docker Deployment

To spin up local PostgreSQL and application container using Docker:

```bash
# Start PostgreSQL database container
docker compose up -d

# Build production Docker image
docker build -t library-system .

# Run application container
docker run -p 3000:3000 --env-file .env library-system
```

---

## 📄 License
Developed for University Software Engineering Semester Project.
