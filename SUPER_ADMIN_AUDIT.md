# Skullu 2.0 - Super Admin Pages Audit

## System Overview

**Skullu 2.0** is a multi-tenant School Management System (SMS) targeting Kenyan schools. It is built on:
- **Backend:** Laravel 10+, PHP 8.2, Sanctum auth, multi-tenant per-school isolation
- **Frontend:** React 17 (SPA via HashRouter), Tailwind CSS, Axios
- **Curriculum:** Supports both legacy 8-4-4 and the new CBC/CBE (2-6-3-3-3) frameworks
- **Roles:** `platform_admin`, `super_admin`, `admin`, `teacher`, `accountant`, `hr_manager`, `librarian`, `student`, `parent`, `driver`

---

## Super Admin Menu Structure (from Sidebar.js)

| Section | Menu Item | Route | Component |
|---|---|---|---|
| Main Menu | Dashboard | `/` | `SuperAdminDashboard.js` |
| | Notice Board | `/notices` | `NoticeBoard.js` |
| Administration | Administrators | `/admin/users/admins` | `AdminList.js` |
| | Staff & Teachers | `/admin/users/staff` | `StaffList.js` |
| | Students | `/admin/users/students` | `StudentList.js` |
| | Parents | `/admin/users/parents` | `ParentList.js` |
| | Admit Student | `/students/admit` | `StudentAdmit.js` |
| | Classes & Sections | `/admin/classes` | `ClassManager.js` |
| | Subjects | `/admin/subjects` | `SubjectManager.js` |
| | Timetables | `/admin/timetables` | `TimetableManager.js` |
| | Promotions | `/students/promotion` | `StudentOps.js` |
| | Alumni Registry | `/students/alumni` | `StudentOps.js` |
| | Examination Mgmt | `/admin/exams` | `ExamManager.js` |
| Operations | Transport | `/admin/transport` | `TransportDashboard.js` |
| | Dormitories | `/admin/dorms` | `DormManager.js` |
| | Event Calendar | `/admin/events` | `EventCalendar.js` |
| | Documents | `/admin/documents` | `DocumentRepository.js` |
| Finance & Reports | Budget Planning | `/finance/budget` | `BudgetPlanner.js` |
| | SPC Reports | `/reports/spc` | `SPCReport.js` |
| | End of Term | `/reports/term` | `EndOfTermReports.js` |
| God Mode | Global Settings | `/settings` | `SystemSettings.js` |
| | Role & Permissions | `/settings/roles` | `RoleManager.js` |
| | System Audit Logs | `/settings/audit` | `AuditLog.js` |
| | Data Center | `/settings/data` | `DataCenter.js` |
| | API Integrations | `/settings/integrations` | `Integrations.js` |

---

## Status: REAL DATA vs MOCK DATA

### PAGES WITH REAL API DATA (Wired, backend controller exists)

| Page | Component | API Endpoint | Notes |
|---|---|---|---|
| Super Admin Dashboard | `SuperAdminDashboard.js` | `GET /api/admin/stats` | Works. Notices/fee_chart may return empty - check DashboardController |
| Student Directory | `StudentList.js` | `GET /api/admin/students` | Full CRUD wired |
| Admit Student | `StudentAdmit.js` | `POST /api/admin/students/admit` | Multi-step form wired |
| Examination Mgmt (list) | `ExamManager.js` | `GET/POST /api/admin/exams` | Exam list wired, marks entry has mock students |
| Budget Planning | `BudgetPlanner.js` | `GET /api/admin/budgets` | Wired to BudgetController |
| Administrators | `AdminList.js` | `GET /api/admin/users?type=admins` | Wired to UserController |
| Parents | `ParentList.js` | `GET /api/admin/users?type=parents` | Wired to UserController |
| System Audit Logs | `AuditLog.js` | `GET /api/platform/audit-logs` | Wired to AuditController |
| Data Center | `DataCenter.js` | `POST /api/admin/datacenter/*` | Export/backup/cache wired |

---

### PAGES WITH MOCK/HARDCODED DATA (Need backend wiring)

#### 1. Classes & Sections - ClassManager.js - PRIORITY HIGH
**Problem:** 14 rows of fully hardcoded data (PP1 to Grade 12). No useEffect, no API call.
```
{ grade: 'PP1', sections: ['Red','Blue'], students: 40, teacher: 'Mrs. Kihara' }
... (all fake)
```
**Fix:**
- API: `GET /api/admin/classes` -> new `ClassController@index`
- API: `POST /api/admin/classes` -> `ClassController@store`
- DB: `classes` table exists; add endpoint that joins with student counts
- Wire component: add `useEffect` + `axios.get('/api/admin/classes')`

---

#### 2. Subjects / Learning Areas - SubjectManager.js - PRIORITY HIGH
**Problem:** 10 hardcoded CBC subjects. No API call. Edit button does nothing.
**Fix:**
- API: `GET /api/admin/subjects` -> new `SubjectController@index`
- API: `POST/PUT/DELETE /api/admin/subjects` -> `SubjectController`
- DB: needs `subjects` table (name, code, department, curriculum_type, grade_levels)
- Wire component with `useEffect` + axios

---

#### 3. Timetable Manager - TimetableManager.js - PRIORITY HIGH
**Problem:** Explicitly labeled `// Mock Data`. Hardcoded 5-slot schedule for "Grade 5A". Grade dropdown has no real classes. Edit Timetable button does nothing.
**Fix:**
- API: `GET /api/admin/timetables?class_id={id}` -> `TimetableController@show`
- API: `PUT /api/admin/timetables/{class_id}` -> `TimetableController@update`
- DB: needs `timetable_slots` table (class_id, day, time_slot, subject_id, teacher_id)
- Load grade dropdown from classes API; load schedule on class change

---

#### 4. ExamManager - Marks Entry Modal - PRIORITY HIGH
**Problem:** Exam list is real, but marks entry modal shows 4 fake students:
`['Alice Walker', 'Bob Smith', 'Charlie Brown', 'Diana Prince']`
Save Marks shows toast only - does NOT call `POST /api/admin/exams/{exam}/marks`.
**Fix:**
- Load real students per class from `GET /api/admin/exams/{id}/students`
- Wire Save button to existing `POST /api/admin/exams/{exam}/marks` endpoint

---

#### 5. Transport Dashboard - TransportDashboard.js - PRIORITY MEDIUM
**Problem:** All stats hardcoded (12 buses, 8 routes, 15 drivers, 2 maintenance). Route table rows (Route A North, Route B East, Route C South) are hardcoded arrays.
**Fix:**
- API: `GET /api/admin/transport/stats` -> `TransportController@stats`
- API: `GET /api/admin/transport/routes` -> `TransportController@routes`
- API: `POST /api/admin/transport/routes` -> `TransportController@store`
- DB: needs `vehicles`, `routes`, `driver_assignments` tables

---

#### 6. Dormitory Manager - DormManager.js - PRIORITY MEDIUM
**Problem:** 3 dorms hardcoded (Sunrise Hall, Moonlight Wing, Starlight Block). Capacity/warden data is fake. Quick Allocation search is non-functional.
**Fix:**
- API: `GET /api/admin/dorms` -> `DormController@index`
- API: `POST /api/admin/dorms` -> `DormController@store`
- API: `POST /api/admin/dorms/{id}/allocate` -> `DormController@allocate`
- DB: needs `dormitories` (name, type, capacity, warden_id) + `dorm_allocations` (student_id, dorm_id, room)

---

#### 7. Event Calendar - EventCalendar.js - PRIORITY MEDIUM
**Problem:** Static October 2024. Events list hardcoded (Term 1 Exams, Public Holiday, Sports Day). Navigation arrows do nothing. Add Event button non-functional.
**Fix:**
- API: `GET /api/admin/events?month={}&year={}` -> `EventController@index`
- API: `POST /api/admin/events` -> `EventController@store`
- DB: needs `school_events` table (title, date, end_date, type, description)
- React: manage current month/year in state; fetch events and highlight calendar days

---

#### 8. Document Repository - DocumentRepository.js - PRIORITY MEDIUM
**Problem:** 5 fake files hardcoded (School Policy 2024.pdf, Term 1 Exam Schedule.xlsx, etc.). Category tabs (Policies, Exams, Finance, HR) are static. Upload/New Folder do nothing.
**Fix:**
- API: `GET /api/admin/documents?category={}` -> `DocumentController@index`
- API: `POST /api/admin/documents` -> `DocumentController@store` (multipart)
- API: `DELETE /api/admin/documents/{id}` -> `DocumentController@destroy`
- DB: needs `documents` table (name, file_path, category, size, owner_id, mime_type)

---

#### 9. Role & Permissions - RoleManager.js - PRIORITY MEDIUM
**Problem:** All roles hardcoded as static array (Super Admin, Principal, Teacher, Accountant, etc.). User counts are fake ("45 Users"). Create Custom Role does nothing.
**Fix:**
- API: `GET /api/admin/roles` -> `RoleController@index` (with user_count)
- API: `POST /api/admin/roles` -> `RoleController@store`
- API: `DELETE /api/admin/roles/{id}` -> `RoleController@destroy`
- Use existing Spatie Permission `roles` / `model_has_roles` tables

---

#### 10. System Settings - SystemSettings.js - PRIORITY MEDIUM
**Problem:** Save Changes only shows toast (no API). Defaults `admin@skullu.com` and fake phone. Academic year dropdown is static. Settings only saved to localStorage - not the DB.
**Fix:**
- API: `GET /api/admin/settings` -> `SettingsController@index`
- API: `POST /api/admin/settings` -> `SettingsController@update`
- DB: needs `school_settings` table (key, value, school_id)
- On mount, fetch real settings; on Save, POST to API

---

#### 11. Promotions & Alumni - StudentOps.js - PRIORITY LOW
**Problem:** Both `/students/promotion` and `/students/alumni` render the same stub component.
**Fix:** Build out proper bulk promotion and alumni registry APIs and views.

---

## Missing Backend Controllers

| Controller | File to Create | Methods |
|---|---|---|
| `ClassController` | `app/Http/Controllers/Admin/ClassController.php` | index, store, update, destroy |
| `SubjectController` | `app/Http/Controllers/Admin/SubjectController.php` | index, store, update, destroy |
| `TimetableController` | `app/Http/Controllers/Admin/TimetableController.php` | show, update |
| `TransportController` | `app/Http/Controllers/Admin/TransportController.php` | stats, routes, store |
| `DormController` | `app/Http/Controllers/Admin/DormController.php` | index, store, allocate |
| `EventController` | `app/Http/Controllers/Admin/EventController.php` | index, store, update, destroy |
| `DocumentController` | `app/Http/Controllers/Admin/DocumentController.php` | index, store, destroy |
| `RoleController` | `app/Http/Controllers/Admin/RoleController.php` | index, store, destroy |
| `SettingsController` | `app/Http/Controllers/Admin/SettingsController.php` | index, update |

---

## Prioritized Build Plan

### SPRINT 1 - Core Academic (Highest Impact)
1. ClassManager -> API wiring (classes are a dependency for everything else)
2. SubjectManager -> API wiring
3. TimetableManager -> API wiring (load classes from #1)
4. ExamManager marks entry -> load real students + save marks to API

### SPRINT 2 - Operations
5. TransportDashboard -> real buses/routes from DB
6. DormManager -> real dormitories and allocations
7. EventCalendar -> real events with navigation

### SPRINT 3 - Settings & Admin
8. DocumentRepository -> file upload and storage
9. RoleManager -> real role counts from Spatie
10. SystemSettings -> persist to DB

### SPRINT 4 - Reports
11. SPC Reports -> competency data
12. End of Term Reports -> PDF generation
13. Student Promotions / Alumni -> bulk operations

---

## Known Issue: SuperAdminDashboard
The dashboard calls `GET /api/admin/stats` which exists, but may return empty `notices` and `fee_chart` arrays because `DashboardController@stats` may not be populating those keys. Review this controller to ensure it returns:
- `notices` - latest notice board entries
- `fee_chart` - monthly fee collection data for the bar chart
- `goal_status` - percentage of fee collection target reached
