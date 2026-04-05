# Skullu 2.0 — School ERP Management System

> A powerful, multi-tenant School Enterprise Resource Planning (ERP) platform built for Kenyan schools, supporting the CBC curriculum and 8-4-4 hybrid models.

---

## Overview

**Skullu 2.0** is a full-featured, role-based school management system designed to streamline every aspect of school administration — from student admissions and fee collection to transport logistics, HR management, and secure document sharing.

Built on **Laravel 10+** (backend) and **React 17+** (frontend), the system supports multiple schools (multi-tenancy) from a single platform, with each school operating in complete data isolation.

---

## Key Features

### Platform Administration (God Mode)
- Multi-tenant school provisioning and management
- Per-school subscription and billing management
- Global audit logs and system terminal access
- Per-tenant storage quota configuration

### School Administration
- Student admissions, promotions, and alumni registry
- Class, subject, and timetable management
- Examination and report card management
- Event calendar with school-wide visibility
- Role & permissions management

### Document Hub (Secure File Sharing)
- Upload documents with role-based visibility
  - **All Teachers** — visible to all staff
  - **Specific Teacher** — targeted document sharing
- School Admins can view **all documents** regardless of visibility setting
- Storage quota enforcement per school (configurable by System Admin)
- File type security: only safe formats accepted (`pdf`, `doc`, `xls`, `csv`, images)
- Single file limit: **20MB**

### Finance & Accountant Module
- Fee structures, invoicing, and payment recording
- Installment plans, refunds, discounts, and surcharges
- Bank reconciliation and fund transfers
- QuickBooks integration support
- Financial reports and daily collection summaries

### HR & Staff Management
- Staff onboarding and document management
- Attendance marking and history
- Leave request workflows
- Payroll generation and payslip management

### Teacher Module
- Class register and student attendance
- Grade entry and SPC (Student Progress Card) reporting
- Homework assignment management
- Report card generation
- Secure Document Hub access (upload & share files)
- Mini School Calendar on dashboard with direct event navigation

### Student & Parent Portals
- Student timetable, assessments, learner portfolio
- Homework tracking and library book management
- Parent fee payment overview, attendance, and transport info
- Parental engagement tracking

### Transport Module
- Route and vehicle management
- Driver dashboard with student pickup manifest
- Transport billing integration

### Library Module
- Book inventory, issue/return tracking
- Member accounts and overdue reporting

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 10 + PHP 8.1+ |
| Frontend | React 17 + React Router |
| Styling | Vanilla CSS + Tailwind CSS utilities |
| Asset Pipeline | Laravel Mix (Webpack) |
| Database | MySQL (via XAMPP locally) |
| Auth | Laravel Sanctum (Token-based) |
| Storage | Laravel `public` disk (local) |

---

## User Roles

| Role | Access Level |
|---|---|
| `platform_admin` | Full platform god-mode access |
| `super_admin` / `school_admin` | Full school-level control |
| `admin` | School management (limited god-mode) |
| `teacher` | Academic and class management |
| `hr_manager` | Staff, leave, payroll management |
| `accountant` | Finance and fee management |
| `librarian` | Library operations |
| `student` | Personal academic portal |
| `parent` | Children overview and fee portal |
| `driver` | Route and pickup management |

---

## Local Development Setup

### Prerequisites
- PHP 8.1+
- Composer
- Node.js 16+ & npm
- XAMPP (MySQL + Apache)

### Installation

```bash
# Clone the repository
git clone git@github.com:Spraybery/skullu.2.o.git
cd skullu.2.o

# Install PHP dependencies
composer install

# Install JS dependencies
npm install

# Copy environment file and configure
cp .env.example .env
php artisan key:generate

# Set your database credentials in .env
# DB_DATABASE, DB_USERNAME, DB_PASSWORD

# Run migrations
php artisan migrate

# Link storage
php artisan storage:link

# Build frontend assets
npm run development

# Start the development server
php artisan serve
```

Visit `http://127.0.0.1:8000` in your browser.

### Build for Production

```bash
npm run production
```

---

## Environment Notes

- **Default storage limit**: 5,000 MB per school (configurable by Platform Admin)
- **Max single file upload**: 20 MB
- **Supported file types**: PDF, Word, Excel, CSV, PNG, JPG, JPEG

---

## Project Structure

```
skullu-2.0/
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/          # Admin-level controllers
│   │   ├── Teacher/        # Teacher-specific controllers
│   │   ├── Platform/       # Platform/SaaS admin controllers
│   │   └── ...
│   └── Models/             # Eloquent models with tenant scoping
├── database/
│   └── migrations/         # All schema migrations
├── resources/
│   └── js/components/
│       ├── admin/          # Admin React components
│       ├── teacher/        # Teacher React components
│       ├── dashboards/     # Role-based dashboard views
│       ├── common/         # Shared components (Calendar, Loader, etc.)
│       └── ...
├── routes/
│   └── api.php             # All API route definitions
└── public/                 # Compiled assets
```

---

## License

This project is proprietary software developed for Skullu ERP. All rights reserved.

---

## Contact

For support or inquiries, reach out via the platform's built-in support ticket system.
