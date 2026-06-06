# Ikonex 2.o - System Documentation

## Change Log

### [2026-03-28] - Super Admin Full Build: 9 Tables, 9 Controllers, 9 Frontend Rewrites

**Scope:** Replaced all hardcoded mock data across the super_admin module with real database-backed API endpoints. Every new table and model follows the strict `school_id` multi-tenancy rule with `BelongsToTenant` trait.

**Database Migrations Added (incremental, no migrate:fresh):**
- `create_classes_table` - school classes with level, section, curriculum_type (CBC/844/Hybrid), class_teacher_id, capacity
- `create_subjects_table` - learning areas / subjects with code, department, curriculum_type, grade_levels (JSON)
- `create_timetable_slots_table` - weekly schedule slots per class (day, time_slot, subject_id, teacher_id, is_break)
- `create_vehicles_table` - school transport vehicles with plate, make, capacity, status
- `create_transport_routes_table` - routes with vehicle_id, driver_id, status
- `create_dormitories_table` - boarding houses with type, capacity, warden_id, status
- `create_dorm_allocations_table` - student-to-dorm assignments (unique per student)
- `create_school_events_table` - calendar events with type, start_date, end_date (used as notice board source)
- `create_documents_table` - file metadata for document repository (file_path, mime_type, size_bytes, category)
- `create_school_settings_table` - key/value store for per-school configuration (unique school_id + key)

**Models Created (all use `BelongsToTenant` trait):**
- `SchoolClass`, `Subject`, `TimetableSlot`, `Vehicle`, `TransportRoute`, `Dormitory`, `DormAllocation`, `SchoolEvent`, `Document`, `SchoolSetting`

**Controllers Created (`app/Http/Controllers/Admin/`):**
- `ClassController` - full CRUD, student_count via withCount
- `SubjectController` - full CRUD
- `TimetableController` - show (GET ?class_id) + update (PUT replaces slots)
- `TransportController` - stats endpoint + routes CRUD
- `DormController` - index, store, allocate student
- `EventController` - full CRUD, filtered by month+year
- `DocumentController` - index (by category), store (multipart upload to local storage), destroy
- `RoleController` - index with live user_count per role from users table; system roles locked
- `SettingsController` - index (key/value map) + update (upsert per key)

**Controller Modified:**
- `DashboardController` - replaced hardcoded notices array and rand() fee chart with real queries: SchoolEvent (latest 5), Invoice (monthly grouped), Vehicle (active count), calculated goal_status

**API Routes Added (`routes/api.php` admin group):**
- `apiResource classes`, `apiResource subjects`
- `GET/PUT timetables`
- `GET transport/stats`, `GET/POST/PUT transport/routes`
- `GET/POST dorms`, `POST dorms/{id}/allocate`
- `apiResource events`
- `GET/POST/DELETE documents`
- `GET/POST/DELETE roles`
- `GET/POST settings`

**Frontend Components Rewritten (mock data removed, API wired):**
- `ClassManager.js` - list + add/edit modal via `/api/admin/classes`
- `SubjectManager.js` - list + add/edit modal via `/api/admin/subjects`
- `TimetableManager.js` - class dropdown from API, live schedule grid, save timetable
- `TransportDashboard.js` - real stat cards + routes table from API
- `DormManager.js` - list view with occupancy bar, add modal
- `EventCalendar.js` - live month navigation, real event highlights, add/delete events
- `DocumentRepository.js` - file upload (multipart), category tabs, download/delete
- `RoleManager.js` - live role list with real user counts
- `SystemSettings.js` - loads settings from DB on mount, Save POSTs to API

**Storage:** `php artisan storage:link` run - document uploads stored in `storage/app/public/documents/`, accessible via `/storage/` URL prefix.

**Rule Compliance:**
- All 10 new tables include `school_id STRING FK -> schools CASCADE DELETE`
- All 10 new models use `use BelongsToTenant;`
- Zero use of `migrate:fresh` or `migrate:refresh` - incremental migrations only
- No emojis in any code, comments, or this log
- Simple list UI enforced across all new components (no card grids for list data)

---

### [2026-03-27] - School Manager and Dashboard Database Connectivity (React/Axios API Hooks)
- **Action:** Fixed `routes/api.php` trailing `prefix()->middleware()->group()` Laravel syntax error dropping all API requests.
- **Action:** Hooked `PlatformDashboard.js` to `/api/platform/stats` executing real-time DB counts for active schools, students, MRR, recent logs, and recent registrations.
- **Action:** Migrated `SchoolManager.js` to fetch directly from `/api/platform/schools`.
- **Action:** Enabled real database functionality (Deploy New Tenant POST and Delete Nuke DELETES via Axios).
- **Rule Verification:** Simple Lists retained. Emojis completely omitted. "Engineer-in-the-Loop" executed via manual tests solving the API bugs.

### [2026-03-27] - System Admin (super_admin) Complete Functional Audit
- **Added Missing Components:** Created `SaaSInvoices.js` and `SupportTickets.js` using strict simple list designs without cards.
- **Enhanced Stub Components:** 
  - `ExamManager.js`: Added scheduling modal, marks entry grid, and explicit side-by-side display of 8-4-4 and CBC Junior School grading scales.
  - `StudentAdmit.js`: Built out missing Steps 3 (NEMIS/Academic/Fees) and 4 (Review/Submit) with functional completion triggers.
  - `BudgetPlanner.js`: Replaced visual graph placeholder with a functional departmental cost vs allocation list.
  - `AuditLog.js`: Implemented client-side filtering by user, date, and event type. Rebuilt layout down to a clean simple-list grid.
  - `DataCenter.js`: Activated Interactive mockups for database Backup, System Export, and Cache Clearing operations with toast notifications.
- **Route Sync:** Fixed `Main.js` and `Sidebar.js` mismatches such as missing `/admin/exams`, broken `/transport` vs `/admin/transport`, and missing platform monitoring endpoints.

### [2026-03-27] - Design Refactoring (Cards to Lists)

### [2026-03-27] - Design Preference Update
- **Action:** Added UX/UI design rule: Prioritize simple lists over card lists to save vertical space and maintain a cleaner interface.

### [2026-03-27] - System Rules and Curriculum Alignment Update
- **Action:** Updated `SYSTEM_DOCUMENTATION.md` to incorporate the 12 explicit AI Development Rules and the comprehensive integration of the "Comprehensive Architectural and Curricular Framework for Integrated School Management Systems in the Kenyan Education Ecosystem" research document.
- **Action:** Defined grading scales (12-point 8-4-4, 4-point Lower Primary CBC, and 8-point KJSEA) based on research.
- **Action:** Added NEMIS (National Education Management Information System) and UPI (Unique Personal Identifier) requirements.

### [2026-03-27] - Initial System Documentation & Rules Setup
- **Action:** Created `SYSTEM_DOCUMENTATION.md` as the master system specification and change log.
- **Action:** Established Kenyan Curriculum compliance rules (CBC focus for Primary, Hybrid for High School).
- **Action:** Implemented strict "No Emoji" policy across all documentation and development.

---

## 1. System Overview
Ikonex 2.o is a professional, multi-tenant School Management System (SMS) built for Kenyan educational institutions to handle the transition from the legacy 8-4-4 system to the Competency-Based Curriculum (CBC / CBE).

It provides a dual-logic engine capable of managing legacy academic structures alongside a highly granular, skill-focused competency framework.

## 2. Curriculum Implementation Data (Based on Research)

### 2.1 The Two Systems
- **8-4-4 System Phase-out:** Content-based, teacher-centered, moving to full retirement. Currently applies to legacy classes like Form 2, 3, 4. Grading is on a 12-point scale (A=12 to E=1).
- **CBC/CBE Framework (2-6-3-3-3):** Learner-centered, competency-focused. 
  - **Early Years Education (PP1 to Grade 3):** Uses a **4-Point CBC Scale**: Exceeding Expectation (4), Meeting Expectation (3), Approaching Expectation (2), Below Expectation (1). Focus on descriptive reports.
  - **Middle School (Grades 4-9):** Grade 6 concludes with KPSEA. Junior School concludes with KJSEA.
  - **Junior School Grading (8-Level Point System):** Uses an 8-level scale for precise Senior School placement: EE1 (8), EE2 (7), ME1 (6), ME2 (5), AE1 (4), AE2 (3), BE1 (2), BE2 (1).
  - **Senior School (Grades 10-12):** Divided into pathways: STEM (~60%), Social Sciences, and Arts & Sports Science. System must track Triple, Double, or Single Pathway categorizations for schools.

### 2.2 NEMIS and UPI Compatibility
- Every learner and staff member has a 6-character Unique Personal Identifier (UPI) via NEMIS. 
- The system must capture: UPI, Assessment Number, Birth Certificate Entry Number, Parent/Guardian ID, and Special Medical/Educational Needs.

## 3. Development & AI Engagement Rules

> **CRITICAL RULE**: NO EMOJIS allowed in any code, markdown, comments, or documentation.

**1. Act as a Specialized Assistant, Not a Replacement**
- **The "Engineer-in-the-Loop" Imperative:** LLMs should be used to accelerate development, not to operate autonomously. Human developers must validate all code for logic, security, and architectural fit.
- **Divide and Conquer:** Break complex tasks into small, manageable chunks. LLMs are best at solving tiny, discrete tasks, whereas large-scale generation often results in chaotic, unmaintainable code.
- **Supervised Execution:** While agents can generate and run code, the developer should review every step, specifically for security-critical or high-performance parts of the app.

**2. Context is King (Provide Rules-Based Input)**
- **Include Project Context:** Provide detailed instructions, including the technical stack (Laravel 10+, React 17+, PHP 8.2), project context, and coding standards.
- **Use "Rules Files":** Utilize `.cursorrules` (or similar) to guide the model to follow company-specific patterns.
- **System Prompting:** Use XML tags to label context, such as `<example>`, `<standards>`, or `<project_spec>` to provide structured guidance to the model.

**3. Rigorous Validation and Security**
- **Never Blindly Trust Outputs:** Treat every snippet as if it came from a "confidently wrong" junior developer.
- **Sanity Checks:** Perform manual checks on AI-generated code, especially for edge cases, error handling, and library compatibility.
- **Secure Sensitive Data:** Never expose API keys, sensitive business logic, or personal information in prompts.
- **Test-Driven Development (TDD) with AI:** Use the LLM to write tests first, then generate code to pass those tests, ensuring safety in the results.

**4. Proactive Workflow Integration (2026 Trends)**
- **Agentic Workflows:** Move beyond chat interfaces to IDE-integrated agents that can analyze, refactor, and test within your codebase.
- **Automate Documentation:** Utilize LLMs to generate docstrings, README files, and API documentation automatically, reducing technical debt.
- **AI-Driven Refactoring:** Use AI to detect legacy code and suggest structural improvements or modernizations.

**7. Version Control & Change Management**
- Commit before applying AI-generated changes — use AI as a branch, not a direct push.
- Write meaningful commit messages describing what problem the AI solved, not just AI fix.
- Use `.gitignore` to exclude any AI context files containing sensitive project structure.

**8. Prompt Versioning**
- Store your best-performing prompts in a `/prompts` folder under version control, just like code.
- Track which prompt versions produced good vs. bad outputs — this is your "prompt changelog".

**9. Failure Mode Awareness**
- Define a "stop condition": if the AI fails to solve something in 3 iterations, escalate to manual — avoid the "AI rabbit hole" trap where you spend 2 hours prompting instead of 20 minutes coding.
- Recognize context window drift: in long sessions, the AI forgets early rules. Periodically re-inject your `.rules` file mid-conversation.

**10. Output Ownership & IP Hygiene**
- Know your jurisdiction's stance on AI-generated code copyright (still evolving in 2026).
- If your SaaS has enterprise clients, clarify in contracts whether AI tooling was used in delivery.

**11. Performance Budgeting**
- Ask the AI to benchmark its own output: "What is the Big-O complexity of this function?"
- For SaaS, add latency requirements to your prompt rules: "This must respond in under 200ms".

**12. Accessibility & Internationalisation as Defaults**
- Add `<a11y>` and `<i18n>` tags to your XML prompt structure — AI skips these entirely unless explicitly told not to.

**13. UI/UX Design Preferences**
- **Prioritize Simple Lists:** Prefer simple, clean list structures over card-based layouts to maximize screen real estate and ensure a minimalist, professional aesthetic.

