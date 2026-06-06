# Assessor Practical Guide — Developer: Mary Mbithi

This document outlines the core functional requirements implemented for the practical assessment, details of the testing sandbox environment, and instructions on how to verify each feature.

> [!NOTE]
> **Project Context**: This system was originally developed as a comprehensive, multi-tenant School ERP containing payroll, leave workflows, fee invoicing, library issue registries, transport routing dashboards, etc.
> To align strictly with the practical assessment instructions and respect your time, all non-required features and dashboards have been hidden from the menus. The active modules represent the exact practical assessment items: Class Streams, Students, Subjects, Assessments, and duplicate score submissions validation.

---

## Candidate Information
- **Name**: Mary Mbithi
- **Submission Target**: info@ikonexsystems.com
- **Submission Date**: June 6, 2026
- **Assessed School**: Ikonex Academy (Tenant ID: `KAS-ACADEMY`)

---

## Sandbox Quick-Logins
For rapid testing, the login screen includes a **Quick Access Portal** with single-click role-switching buttons. No credentials are required.
- **School Admin**: Logs in as `admin@kasee.sc.ke`
- **Teacher**: Logs in as `teacher@kasee.com`
*(Password for manual logins is `password`)*

---

## 1. Implemented Features & Verification Steps

### 1.1 Class Streams
- **Requirements**: Creation and retrieval (all streams & single stream details). Examples: Form 1A, Form 1B, Form 1C.
- **How to verify (UI)**:
  1. Log in as **School Admin**.
  2. Click **Class Streams** in the sidebar.
  3. You will see the pre-seeded streams: `Form 1A`, `Form 1B`, and `Form 1C`.
  4. Click **+ Add Class** to create a new class stream (e.g. Form 1D).
  5. Click **Edit** to update details or see single details.
- **Technical Details**:
  - Model: `SchoolClass` scoped to the active tenant.
  - Controller: [ClassController.php](file:///c:/xampp/htdocs/skullu%202.o/app/Http/Controllers/Admin/ClassController.php) (implements `index`, `store`, `show`, `update`, `destroy`).

### 1.2 Students Directory & Management
- **Requirements**: Registration, assignment to a class stream, editing, deletion, and retrieval (single student, all students, and filtered by specific class stream).
- **How to verify (UI)**:
  1. Log in as **School Admin**.
  2. Click **Student Directory** to view all registered students.
  3. Click **Admit Student** in the sidebar to register a new student and assign them to a class stream (e.g. Form 1A).
  4. In the Student Directory list, click **Edit** (pencil icon) to modify details or **Delete** (trash icon) to delete them.
  5. Use the filter bar to filter by class stream (Form 1A, Form 1B, or Form 1C) to retrieve students matching only that stream.
- **Technical Details**:
  - Model: `Student` scoped to school tenant.
  - Controller: [StudentController.php](file:///c:/xampp/htdocs/skullu%202.o/app/Http/Controllers/Admin/StudentController.php) (implements `index` with `grade_level` filtering, `store`, `show`, `update`, and `destroy`).

### 1.3 Subjects & Learning Areas
- **Requirements**: Creation, management, assignment to class streams, editing, deletion, and retrieval.
- **How to verify (UI)**:
  1. Log in as **School Admin**.
  2. Click **Subjects & Learning Areas** in the sidebar.
  3. You will see seeded subjects (Mathematics, English, Kiswahili, etc.) assigned to `Form 1`.
  4. Click **+ Add Subject** to create a new subject and assign it to a stream (e.g., Grade Level: Form 1).
  5. Click **Edit** to modify details, or **Del** to remove the subject.
- **Technical Details**:
  - Model: `Subject` scoped to school tenant.
  - Controller: [SubjectController.php](file:///c:/xampp/htdocs/skullu%202.o/app/Http/Controllers/Admin/SubjectController.php) (implements `index`, `store`, `show`, `update`, and `destroy`).

### 1.4 Assessments & Grades Entry
- **Requirements**: Recording and updating examination and continuous assessment scores per student, per subject. Read views for individual student performance by subject and class performance for a selected subject.
- **How to verify (UI)**:
  1. Log in as **Teacher**.
  2. Click **Enter Grades** in the sidebar.
  3. Select an Examination (e.g. `Term 1 Continuous Assessment` or `Term 1 Examination`), Class (`Form 1A`), and Subject (`Mathematics`). Click **Load Students**.
  4. Enter or edit grades. Click **Save Draft** or **Submit & Release**.
  5. Click **Report Cards** in the sidebar. Select Class (`Form 1A`) and Exam (`Term 1 Examination`).
  6. Click a student (e.g. `Wycliffe Omondi`) to load the **Individual Student Performance** view (displays scores, overall rank e.g. `1 of 5`, and subject-specific positions/ranks in the Pos column).
  7. Click **Class Performance Summary** to download the **Class Performance** pdf view for the selected subject and exam.
- **Technical Details**:
  - Model: `ExamMark` with auto letter grade conversions matching Kenyan scales.
  - Controller: [GradeController.php](file:///c:/xampp/htdocs/skullu%202.o/app/Http/Controllers/Teacher/GradeController.php) and [ReportCardController.php](file:///c:/xampp/htdocs/skullu%202.o/app/Http/Controllers/Teacher/ReportCardController.php).

### 1.5 Strict Data Validation
- **Requirements**: Enforce strict validation to prevent duplicate score submissions for the same student and subject.
- **Verification**:
  - The database contains a unique key constraint `unique_mark` on `['student_id', 'exam_id', 'subject_name']`.
  - The backend [GradeController.php](file:///c:/xampp/htdocs/skullu%202.o/app/Http/Controllers/Teacher/GradeController.php#L115-L123) performs a check on the request payload array to enforce that the same student is not submitted multiple times in the same transaction, returning a standard `422 Unprocessable Entity` validation error with description: `"Duplicate student score submissions are not allowed."`

---

## 2. Detailed Setup & Installation Guide

Follow these steps to run the project locally on your machine (supports Windows/XAMPP, Linux, and macOS environments).

### 2.1 Prerequisites
Ensure you have the following installed globally on your machine:
- **PHP**: 8.1 or higher
- **MySQL** / **MariaDB**: 5.7+ / 10.3+
- **Composer** (PHP Package Manager)
- **Node.js** & **NPM** (Javascript Package Manager)

### 2.2 Local Terminal Setup Steps

1. **Install Composer backend dependencies**:
   ```bash
   composer install
   ```

2. **Install NPM frontend packages**:
   ```bash
   npm install
   ```

3. **Configure Environment File**:
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```
   Generate the application encryption key:
   ```bash
   php artisan key:generate
   ```

4. **Database Configuration**:
   Create a blank MySQL database named `skullu_db` (using phpMyAdmin or MySQL CLI: `CREATE DATABASE skullu_db;`). Update the `.env` file with your connection parameters:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=skullu_db
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

5. **Run migrations**:
   Run the following artisan command to create the database schema:
   ```bash
   php artisan migrate
   ```

6. **Seed assessment sandbox data**:
   Execute the re-seed script to automatically configure Form 1A/B/C streams, students, subjects, and sample grades under school `Ikonex Academy`:
   ```bash
   php scratch/reseed_interview_data.php
   ```

7. **Compile Assets**:
   Compile the CSS and React components for testing:
   ```bash
   npm run prod
   ```

8. **Start development server**:
   Start the Laravel dev server:
   ```bash
   php artisan serve
   ```
   The site will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## 3. Production Deployment Guidelines

Here is the operational playbook to deploy the application on a live production web server (VPS, Cloud Instances like AWS/DigitalOcean, or Managed Apache/Nginx Linux servers).

### 3.1 Web Server Configuration (Nginx / Apache)

Ensure your web server document root points to the `/public` directory of the application:

#### Option A: Nginx Server Block
```nginx
server {
    listen 80;
    server_name portal.ikonexacademy.com;
    root /var/www/skullu/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### Option B: Apache Virtual Host
```apache
<VirtualHost *:80>
    ServerName portal.ikonexacademy.com
    DocumentRoot /var/www/skullu/public

    <Directory /var/www/skullu/public>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/skullu_error.log
    CustomLog ${APACHE_LOG_DIR}/skullu_access.log combined
</VirtualHost>
```

### 3.2 Folder Permissions
Set directory ownership and grant write permissions to standard Laravel directories:
```bash
# Change ownership to web server user (e.g. www-data)
sudo chown -R www-data:www-data /var/www/skullu

# Set directories permissions
find /var/www/skullu -type d -exec chmod 755 {} \;
find /var/www/skullu -type f -exec chmod 644 {} \;

# Set write permissions for storage and bootstrap cache
sudo chmod -R 775 /var/www/skullu/storage
sudo chmod -R 775 /var/www/skullu/bootstrap/cache
```

### 3.3 SSL installation (Certbot HTTPS)
Generate an SSL certificate via Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d portal.ikonexacademy.com
```

### 3.4 Production Cache Optimization
Run these optimizations on your server to cache configurations, routes, and views to improve response times:
```bash
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 4. Running Automated Tests

To verify all core API controllers, routing, data validation, and operations programmatically, execute the integration test suite via the command line:

```bash
# Run the integration test suite
php scratch/e2e_integration_test.php
```

This script will run tests scoped to the school admin and teacher users, verify all API status codes, perform full CRUD operations on Classes, Students, and Subjects, test score entries, inspect calculations/ranks, and test validation triggers.
