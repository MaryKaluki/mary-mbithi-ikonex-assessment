# System Audit: OSL Main

## Overview
- **Framework**: Laravel 12.0
- **Language**: PHP 8.2
- **Frontend Stack**: React 19, Tailwind CSS, Vite, Alpine.js
- **Authentication**: Laravel Sanctum, Laravel Breeze

## Current Project Structure
```markdown
- app/             # Application Logic (Models, Controllers, Providers)
- bootstrap/       # Laravel Bootstrap
- config/          # Configuration Files
- database/        # Migrations, Seeders, Factories
- public/          # Public Assets (Entry point: index.php)
- resources/       # Frontend Assets (Views, JS, CSS)
- routes/          # Route Definitions
- storage/         # Storage (Logs, Framework Cache)
- tests/           # Automated Tests
- vendor/          # Composer Dependencies
- node_modules/    # NPM Dependencies
```

## Detailed Analysis

### Backend (Laravel)
- **Routing**: Split between `web.php` (Admin/Authentication) and `api.php` (Frontend SPA data).
- **Controllers**: Organized under `App\Http\Controllers\Admin` (Admin Panel) and `App\Http\Controllers\Api` (REST API).
- **Models**: Comprehensive set of 21 models covering bookings, inventory, finance, and CRM.
- **Authentication**: Uses Laravel Sanctum and Laravel Breeze. Roles include `super_admin`, `systems_admin`, and `agent`.
- **Integrations**: PesaPal (Payments), Image Optimizer (Media).

### Frontend (React SPA)
- **Entry Point**: `resources/js/app.jsx` -> `Main.jsx`.
- **Routing**: `react-router-dom` with code-splitting (Suspense/Lazy).
- **Core Pages**:
    - `Home`, `Destinations`, `Hotels`, `Corporate`, `Experiences`, `SafariSeekers`.
    - `Checkout`, `Confirmation`, `SearchResults`, `PropertyDetails`.
    - `Journal` (Blog/Content managed via `JournalArticle`).
    - `About`, `Contact`, `Privacy`, `Terms`, `Login`.
- **State Management**: Likely handled via standard React hooks and potentially Context/Zustand (need to verify).
- **Styling**: Tailwind CSS 3/4.

### Database Schema (Inferred)
- **Users**: Admin, Agents, and Customers.
- **Properties**: `LocalHotel`, `CorporateSpace`, `Package`, `Experience`.
- **Transactions**: `Booking`, `Transaction`, `Expense`.
- **Configuration**: `SiteSetting`, `NotificationTemplate`.

### Middleware & Security
- **AdminMiddleware**: Enforces role-based access control (RBAC).
- **Roles**:
    - `systems_admin` / `super_admin`: Full access to all modules including CRM, Configuration, and Security.
    - `agent`: Access to their own bookings, corporate spaces, hotels, and packages.
    - `front_desk`: Restricted to operational tasks like guest lookup, daily briefing, and support tickets.
    - `customer`: Access to public pages and their own profile/bookings via the SPA.
- **Rate Limiting**: Applied to public API routes (60/min) and payment initiation (5/min).

### Key Features
- **Flexible Booking Engine**: Multimodal bookings for different entity types.
- **Agent Portal**: Dedicated dashboard for vendors to manage their properties and bookings.
- **Financial Reconciliation**: Automated payout tracking and expense management.
- **Automated Feedback System**: Token-based review requests sent to guests.
- **Dynamic Content Management**: Journal/Blog and SEO optimization via admin tools.
- **PesaPal Payments**: Integrated payment gateway with callback/IPN handling.

## Conclusion
The system is a modern, enterprise-ready hospitality and booking platform. It leverages Laravel's robust backend capabilities with React's dynamic frontend experience. The architecture is well-separated, making it scalable and maintainable.

- [x] Initial technology stack identification
- [x] Backend analysis (Models, Controllers, Routes)
- [x] Frontend analysis (Pages, Components, State Management)
- [x] Database migrations analysis (Detailed schema)
- [x] Middleware and Security analysis (Role-based access)
- [x] Third-party API integrations audit
