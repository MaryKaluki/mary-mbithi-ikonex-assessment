# 🎨 Skullu 2.0: The Frontend Blueprint

## 🌟 Overview
Skullu 2.0 is a modern, responsive, and aesthetically premium School Management System Frontend built with **React** and **Tailwind CSS**. This blueprint outlines the architectural decisions, design system, and component standards that power the user interface.

---

## 🛠 Technology Stack
- **Framework**: React 18
- **Styling**: Tailwind CSS 3.x
- **Routing**: React Router DOM (HashRouter)
- **Build Tool**: Vite / Laravel Mix
- **Icons**: Heroicons (SVG)

---

## 🎨 Design System

### 1. Color Palette
We utilize a vibrant yet professional palette anchored by Purple and deep Grays.

| Variable | Tailwind Class | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | `bg-purple-600` | `#9333ea` | Buttons, Active States, Highlights |
| **Secondary** | `bg-teal-500` | `#14b8a6` | Success states, Accents |
| **Danger** | `bg-red-500` | `#ef4444` | Delete actions, Errors |
| **Background (Light)** | `bg-gray-50` | `#f9fafb` | Main page background |
| **Container (Light)** | `bg-white` | `#ffffff` | Cards, Sidebar, Header |
| **Background (Dark)** | `bg-gray-900` | `#111827` | Main page background |
| **Container (Dark)** | `bg-gray-800` | `#1f2937` | Cards, Sidebar, Header |

### 2. Typography
- **Font Family**: `Inter`, sans-serif.
- **Headings**: `text-gray-800` (Dark Mode: `text-gray-100`), Bold (`font-bold`).
- **Body**: `text-gray-600` (Dark Mode: `text-gray-400`), Medium/Regular.

### 3. Visual Effects
- **Shadows**: Soft, diffused shadows (`shadow-sm`, `shadow-lg` on hover) to create depth.
- **Rounded Corners**: Generous radii (`rounded-xl`, `rounded-2xl`, `rounded-3xl` for modals) for a modern, friendly feel.
- **Micro-Interactions**: Smooth `transition-all duration-300` on interactive elements.
- **Page Transitions**: Global `animate-page-fade` (Soft Reveal) using `cubic-bezier` for premium feel across navigations.

---

## 🎭 Animation & Feedback System

Skullu 2.0 uses a layered animation strategy to provide a professional, fluid user experience.

### 1. Loading States
- **Splash Loader**: Full-screen brand initialization with a custom progress flow and bouncing brand assets.
- **Skeleton Loaders**: Reusable components (`type="table"`, `type="card"`) that provide "ghost" pulsing states during data fetching to reduce perceived latency.

### 2. Page Transitions (Soft Reveal)
Every route change triggers a global animation:
- **Opacity**: 0 to 1
- **Scale**: 0.98 to 1.0
- **Blur**: 8px to 0
- **Duration**: 0.6s with a professional ease-out curve.

### 3. Feedback Mechanism
- **Notification Toast**: Top-right slide-in alerts for general system updates.
- **Center Feedback Modal**: High-impact, centered full-screen modal with large animated icons (Pops/Bounces for success, Shakes for errors). Used for critical actions like Record Payment.

---

## 🎨 Dynamic Theme System
The UI is not statically colored but dynamically generated based on administrative settings.

### Logic
- **Primary Color Injection**: Custom hex colors are Darkened/Lightened via JS and injected into the `:root` variables.
- **Accent Styles**: Supports `normal` (plain) and `accented` (colored border) themes for containers in Dark Mode.
- **Style Injection**: The `Main.js` dynamically updates a `<style id="dynamic-theme">` tag to maintain theme consistency across components.

## 🌗 Dark Mode Architecture
Dark mode is implemented using the `class` strategy in Tailwind.

### Logic
- **Persistence**: The user's preference is saved in `localStorage` key `darkMode`.
- **Initialization**: `Main.js` reads this key on mount.
- **Toggle**: The `darkMode` state adds or removes the `dark` class from the `<html>` root element.

### Styling Rules
Every component adheres to strict dual-mode styling:

1.  **Containers**:
    ```jsx
    <div className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
    ```
2.  **Text**:
    ```jsx
    <h1 className="text-gray-800 dark:text-gray-100">
    <p className="text-gray-500 dark:text-gray-400">
    ```
3.  **Inputs**:
    ```jsx
    <input className="bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600">
    ```

---

## 🎮 Interactive Features

Skullu 2.0 includes advanced interactive components that make the system feel alive and responsive.

### 1. Live Notification Center
- **Location**: Header (Bell Icon)
- **Behavior**: Clicking the bell icon opens a dropdown panel with recent system notifications
- **Design**: 
  - Each notification has a colored circular icon (SVG-based, not emojis)
  - Pulsing "New" badge on unread notifications
  - Hover effects with subtle elevation
  - "Mark all as read" action button
- **Categories**: Payments (Green), Alerts (Orange), System Updates (Blue)

### 2. Bulk Selection & Actions
- **Location**: Student List, Staff List, and other data tables
- **Behavior**: 
  - Checkboxes appear in the first column of tables
  - "Select All" checkbox in the header row
  - Selected rows are highlighted with a subtle background tint
- **Floating Action Bar**:
  - Appears at the bottom center when items are selected
  - Shows count of selected items
  - Provides quick actions: Message, Report, Delete
  - Dismissible with an X button
- **Animation**: Slides up from bottom with `animate-modal-pop`

### 3. Confirmation Modals
- **Purpose**: Prevent accidental destructive actions (Delete, Reset, etc.)
- **Design**:
  - Large centered modal with backdrop blur
  - Warning emoji (⚠️) or question mark (❓) based on severity
  - Clear title and description
  - Two-button layout: Cancel (Gray) and Confirm (Red for danger, Primary for info)
- **Usage**: Triggered before bulk delete, data wipes, or irreversible operations

### 4. Interactive Charts
- **Location**: Super Admin Dashboard (Fee Collection widget)
- **Type**: Animated Bar Chart
- **Features**:
  - Bars animate upward on page load (0% to actual height)
  - Hover reveals exact value in a tooltip
  - Background changes on hover for visual feedback
  - Goal progress indicator at the bottom
- **Technology**: Pure CSS animations with dynamic inline styles

---

## 🌍 Multi-School SaaS Architecture

Skullu 2.0 has evolved into a Multi-Tenant SaaS Platform.

### 1. Platform Administration
- **Role**: `platform_admin` (The SaaS Owner).
- **Distinction**: Uses a `slate-800` theme to visibly separate it from the School Admin's `purple-600` theme.
- **Capabilities**:
  - View global metrics (MRR, Total Schools).
  - Manage Tenants (Add, Suspend, Edit Schools).
  - Manage Global Subscriptions/Plans.

### 2. God Mode Controls ⚡
The Platform Admin possesses elevated privileges to intervene in any tenant:
- **Impersonation**: Ability to "Login as Admin" for any specific school without knowing their password.
- **Nuclear Option**: "Nuke Tenant" ability to completely wipe a school's database/existence.
- **Force Maintenance**: Ability to lock a tenant out of their system for maintenance or non-payment.
- **Global Logs**: View audit trails across the entire platform.

---

## 📂 Directory Structure & Component Map

### `/resources/js/components`

#### **Core (Global)**
- **`Main.js`**: Application entry point, Router configuration, Global State (Dark Mode, Role).
- **`Sidebar.js`**: Dynamic navigation bar that renders links based on the active User Role.
- **`Header.js`**: Top bar containing Search, User Profile, and Theme Toggle.
- **`StatsCard.js`**: Reusable widget for displaying key metrics with trend indicators.
- **`Dashboard.js`**: The central landing page that dynamically renders views for `admin`, `teacher`, `student`, etc.

#### **Role-Specific Modules**
Organized by functional area for modularity.

- **`/admin`**: The powerhouse.
    - `StudentOps.js`, `TeacherOps.js`: User management.
    - `TimetableManager.js`, `EventCalendar.js`: Scheduling.
    - `TransportDashboard.js`, `DormManager.js`: Logistics.
    - `PinManager.js`: Access control.
- **`/teacher`**:
    - `TeacherStudents.js`: Class lists & attendance.
- **`/student`**:
    - `StudentGrades.js`: Academic progress & charts.
- **`/parent`**:
    - `ParentChildren.js`: Linked student overview.
- **`/accountant`**:
    - **Fee Operations**: `FeeInvoices.js`, `FeeInstallments.js`, `Refunds.js`, `TransportBilling.js`.
    - **Banking**: `TransactionSync.js`, `TransactionAuth.js`, `ChequeClearance.js`, `FundTransfers.js`.
    - **Setup**: `StudentGroups.js`, `Discounts.js`, `Surcharges.js`, `Sponsorships.js`.
    - **Integrations**: `FinanceTemplates.js`, `QuickBooks.js`.
- **`/library`**:
    - `BookInventory.js`: Catalog & stock.
- **`/driver`**:
    - `DriverRoutes.js`: Route maps & manifests.
- **`/dashboards`**:
    - `PlatformDashboard.js`: SaaS High-level overview.
    - `SchoolManager.js`: Multi-tenant management & God Mode controls.

---

## 🚀 Future Roadmap
1.  **API Integration**: Connect `axios` calls to Laravel backend endpoints.
2.  **State Management**: Introduce Redux or Context API for complex data flows.
3.  **Mobile Polish**: Enhance the mobile drawer experience for smaller screens.
4.  **Real-time Notifications**: Integrate WebSockets (Laravel Echo) for instant feedback.

---
*Document generated by Skullu AI Agent - FEB 2026*
