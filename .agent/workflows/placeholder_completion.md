# 📋 Skullu 2.0: Full System Development Plan

This plan outlines the systematic creation of the remaining 24 placeholder screens in the Skullu 2.0 system. The objective is to move from static mockups to fully interactive React components, ensuring high aesthetics, dark mode support, and mobile optimization.

---

## 📅 Phase 1: HR & Personnel Operations
**Focus**: Completing the administrative workflow for school staff.

- **1.1 Attendance Marking (`hr/AttendanceMark.js`)**
  - Interactive grid of staff members.
  - Quick action toggles: `Present`, `Late`, `Absent-Excused`, `Absent`.
  - Responsive search and department filters.
- **1.2 Attendance History (`hr/AttendanceHistory.js`)**
  - Monthly/Weekly view with status color coding.
  - Export functionality (PDF/Excel simulation).
  - Search by staff ID or name.
- **1.3 Leave Management (`hr/LeaveRequests.js`)**
  - Unified table for `Pending`, `Approved`, and `Rejected` requests.
  - Detail view for reason of leave.
  - Quick actions: Approve/Reject with optional comment field.
- **1.4 Payroll Dashboard (`hr/PayrollDashboard.js`)**
  - Financial stats cards (Total Payout, Tax, Deductions).
  - List of recent payouts and upcoming anniversaries.
- **1.5 Payroll Generation (`hr/PayrollGenerate.js`)**
  - Form to select Month/Year and Department.
  - Bulk processing checklist for staff salaries.

---

## 📅 Phase 2: Library & Resource Management
**Focus**: Digitalizing the library checkout and inventory process.

- **2.1 Issue & Return Counter (`library/IssueReturn.js`)**
  - Split interface for "Check-out" and "Check-in".
  - Quick scan simulation (Input student ID + ISBN).
  - Recent transaction history feed.
- **2.2 Advanced Inventory Creator (`library/BookCreate.js`)**
  - Detailed multi-field form (Title, ISBN, Author, Genre, Edition).
  - Cover image upload preview.
- **2.3 Category Manager (`library/BookCategories.js`)**
  - CRUD interface for shelf and genre organization.
  - Counts of books per category.
- **2.4 Membership Directory (`library/MembersList.js`)**
  - View of all students/staff with active library accounts.
  - Showing borrowing limits and current "Books Out" count.
- **2.5 Fine & Overdue Center (`library/OverdueReports.js`)**
  - High-priority list of late returns.
  - Automated fine calculation based on days overdue.

---

## 📅 Phase 3: Financials & Transport Ops
**Focus**: Tracking outgoing costs and school logistics.

- **3.1 Expense Management (`accountant/ExpenseManager.js`)**
  - Categorized expense logging (Utilities, Maintenance, Salaries).
  - Receipt upload simulation.
- **3.2 Financial Reporting (`accountant/FinancialReports.js`)**
  - P&L and Balance Sheet summary views.
  - Visual charts for cash flow (Revenue vs Expenses).
- **3.3 Student Pickup Checklist (`driver/PickupList.js`)**
  - Highly optimized mobile view with large checkboxes.
  - Toggle between Morning and Evening routes.
- **3.4 Fleet & Maintenance (`driver/VehicleMaintenance.js`)**
  - Logs for fuel, mileage, and service history.
  - Alert system for expiring insurance or upcoming service dates.

---

## 📅 Phase 4: Teacher & Student Academic Core
**Focus**: The classroom-level tools for daily academic work.

- **4.1 Classroom Attendance (`teacher/ClassRegister.js`)**
  - Student photo grid for quick attendance marking.
  - Comment box for daily behavioral notes.
- **4.2 Weekly Timetable (`teacher/TeacherTimetable.js`)**
  - Personal teaching schedule (subject/room/class).
  - "Next Class" countdown indicator.
- **4.3 Homework & Assignments (`student/StudentHomework.js`)**
  - Task board for students.
  - Filters for `Due Soon`, `Completed`, and `Overdue`.
- **4.4 Subject Portfolio (`student/StudentSubjects.js`)**
  - List of enrolled subjects with teacher contact info.
  - Links to digital resources/handouts.

---

## 📅 Phase 5: Parent & Student Portals (Transparency)
**Focus**: Providing a high-end interface for parents to monitor progress.

- **5.1 Fee Statement (`parent/FeePayments.js`)**
  - Clear breakdown of Term fees, balances, and payments made.
  - Mock "Online Payment" integration portal.
- **5.2 Children’s Academic Record (`parent/ChildrenAcademic.js`)**
  - Unified view for multiple children.
  - Progressive charts showing SPC (Progress) over the year.
- **5.3 Attendance Monitoring (`parent/ChildrenAttendance.js`)**
  - Calendar view for parents to see their child's daily presence.
- **5.4 Live Transport Tracker (`parent/TransportStatus.js`)**
  - Simulation of the school bus location.
  - Estimated arrival time (ETA) for student pick/drop.

---

## 🛠️ Global Standards per Screen:
- **Responsive**: All tables must collapse into cards or scroll horizontally on mobile.
- **Dark Mode**: High contrast and readability in both themes.
- **Interactivity**: Use subtle animations for transitions and hover effects.
- **Branding**: Dynamic primary color and school logo integration.
