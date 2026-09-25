# Interlink — University Internship Management Portal

## 🚀 System Overview & Architecture
**Interlink** is an enterprise-grade, role-based internship management web platform built on **MySQL, Express.js, React, and Node.js** (utilizing **Sequelize ORM**). It seamlessly bridges higher education institutions, academic faculty supervisors, undergraduate students, and industry employers into a unified digital workspace.

The platform enforces strict role-based access control (RBAC) and tailored workflows across five distinct stakeholder roles:
1. **Admin**: Platform oversight, review and approval/rejection of university and employer registrations, user management, and read-only administrative auditing.
2. **University Head (Dean / HOD)**: Approves faculty supervisor join requests, manages academic rosters, and inspects enrolled students' daily progress logs in real time.
3. **Supervisor**: Monitors interns enrolled under their university faculty, tracks attendance/hours, and reviews daily work logs.
4. **Student**: Self-registration with immediate activation, comprehensive profile & CV management, interactive daily progress logging (hours, tasks, learnings), job board browsing, and real-time application tracking.
5. **Employer / Recruiter**: Self-registration with admin verification, internship vacancy publication, applicant review pipeline divided by job, and automated category matching.

---

## ✨ Major System Enhancements & Architecture Updates

### 1. 🎨 Professional Enterprise UI Design & Responsive Sidebar Architecture
* **Two-Column Dashboard Layout**: Replaced cramped horizontal tab bars with modern, responsive two-column layouts featuring sticky navigation sidebars across all primary dashboards (**Student**, **Employer**, **Admin**, and **Head**).
* **Responsive Mobile Adaptation**: Sidebars smoothly fold into horizontal touch-scrollable bars on smaller devices while providing full vertical column navigation on desktops.
* **Streamlined Metric Cards**: Standardized top-level KPI overview cards with tabular numeral styling (`tabular-nums`) to prevent layout shifts.

### 2. 🌓 Comprehensive Semantic Color System (Light & Dark Mode)
* **Unified CSS Token Architecture**: Replaced hardcoded Tailwind utility colors with semantic CSS custom properties (`--background`, `--surface`, `--surface-elevated`, `--primary`, `--text-primary`, `--border`, etc.) exposed through `tailwind.config.js`.
* **Zero Pure-Black Policy**: Dark Mode utilizes elevated dark grays (`#111315` canvas, `#181B1F` surfaces, `#20242A` elevated cards) with reduced color saturation to prevent ocular fatigue.
* **Soft Light Mode Canvas**: Light Mode operates on a soothing `#F8F9FA` background with clean `#FFFFFF` surface cards, eliminating harsh glaring white.
* **Consistent Status Indicators**: Semantic status tokens (`badge-success`, `badge-warning`, `badge-error`, `badge-info`) across all data tables and alert banners.

### 3. 📖 High-Contrast Light Mode Typography & Font Hierarchy
* **Accessible Contrast Ratios**: Full compliance with WCAG AAA / AA standards across all light surfaces:
  * **Primary Headings & Content (`--text-primary`)**: Deep Carbon (`#111827`) achieving a **17.5:1** contrast ratio.
  * **Secondary Labels & Details (`--text-secondary`)**: Graphite Charcoal (`#374151`) with **9.4:1** contrast.
  * **Supporting & Muted Metadata (`--text-muted`)**: Steel Slate (`#4B5563`) with **7.2:1** contrast.
  * **Input Placeholders (`--text-disabled`)**: Crisp Slate (`#6B7280`) ensuring form hints remain readable under bright lighting.
* **Refined Sidebar Navigation States**: Active sidebar links render with a soft primary tint (`rgba(29, 78, 216, 0.08)`), subtle sapphire blue border, and bold primary text (`#1D4ED8`), while inactive items maintain clean contrast with smooth hover feedback.

### 4. 🖼️ Calibrated Dual-Mode Atmospheric Backgrounds
* **Day Mode Contrast Preservation**: High-resolution workflow wallpapers and video backgrounds in Light Mode are treated with an automated light scrim (`--background/85`), soft desaturation, and backdrop frosting (`backdrop-blur-md`), presenting them as elegant watermarks without obstructing dark text.
* **Night Mode Richness**: Full obsidian glass styling, deep contrast, and luminous background depth remain preserved in Dark Mode.
* **Architectural Grid Texture**: Underlying precision SVG grid pattern enhances modern enterprise aesthetic across both themes.

### 5. ⚡ Spacing, Layout Stability & Global Smooth Scrolling
* **Action Decision Button Wrapping**: Replaced rigid horizontal margins with modern flexbox wrapping (`flex flex-wrap items-center justify-end gap-2`), preventing vertical collisions on dense data tables.
* **Global Smooth Scrolling**: Added `scroll-smooth` to the root HTML document for fluid transitions when navigating hash links or scrolling long tables.

### 6. 🔒 Backend Security Hardening & Robustness
* **Privilege Escalation Defense**: Implemented strict role whitelisting on public registration (`POST /api/auth/register`), completely blocking unauthorized self-registration as platform `admin`.
* **Broken Object-Level Authorization (BOLA) Remediation**: Enforced `requireApproved` guards across student log inspection (`GET /api/students/:id/logs`), employer applicant feeds (`GET /api/employer/applicants`), and candidate suggestions (`GET /api/employer/suggested-students`), preventing unvetted accounts from harvesting student data.
* **Student PII Redaction**: Protected student personal phone numbers and private personal emails from unconsented discovery feeds, exposing them only when a student actively applies to an employer vacancy.
* **Database Null-Safety & Fallbacks**: Resolved potential `notNull` Sequelize crashes on daily progress log creation by implementing fallback resolution for student `universityId`.
* **Atomic Database Transactions**: Wrapped multi-table state updates in `sequelize.transaction()` across university approvals and supervisor join requests.
* **Upload Rate Limiting**: Added a dedicated `uploadLimiter` for avatars and documents (30 requests / 15 minutes) to prevent avatar previews from consuming authentication attempt quotas.

---

## 🔑 Pre-Seeded Test Credentials

| Role | Email / Identifier | Password | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@interlink.lk` | `admin123` | Active | Platform administrator; oversees universities & employers |
| **University Head** | `head@ruhuna.ac.lk` | `head123` | Approved | Dean, Faculty of Technology, University of Ruhuna |
| **University Head** | `head@mrt.ac.lk` | `head123` | Pending | University of Moratuwa (Admin approval demo) |
| **Supervisor** | `kasun.w@fot.ruh.ac.lk`<br>or `STAFF/RUH/FOT/042` | `sup123` | Approved | Senior Lecturer, University of Ruhuna |
| **Supervisor** | `nuwan.p@fot.ruh.ac.lk`<br>or `STAFF/RUH/FOT/089` | `sup123` | Pending | Lecturer (Probationary); Pending Head approval |
| **Student** | `tharinda.g@fot.ruh.ac.lk`<br>or `TG/2023/1704` | `student123` | Active | BICT, Software Engineering (Has daily logs) |
| **Student** | `daham.s@fot.ruh.ac.lk`<br>or `TG/2023/1713` | `student123` | Active | BICT, Backend & Cloud Infrastructure |
| **Student** | `sandun.b@fot.ruh.ac.lk`<br>or `TG/2023/1741` | `student123` | Active | BICT, Data Analysis & Bioinformatics |
| **Employer** | `kasun.w@virtusa.com` | `employer123` | Approved | Virtusa Sri Lanka (IT Sector, 2 open vacancies) |
| **Employer** | `nilmini@hayleysbio.lk` | `employer123` | Approved | Hayleys Agriculture & Biotechnology (1 vacancy) |
| **Employer** | `malik@wso2.com` | `employer123` | Pending | WSO2 Sri Lanka (Pending Admin review demo) |

> [!NOTE]
> Authentication supports multi-identifier resolution: you can sign in using an **Institutional Email**, **Personal Email**, **Student Registration Number**, or **Staff Registration Number**!

---

## 🛠️ Project Structure
```
interlink/
├── backend/
│   ├── logs/                # Audit & security event logs (security.log)
│   ├── src/
│   │   ├── config/          # MySQL Sequelize connection (db.js) & pricing catalog
│   │   ├── controllers/     # Auth, Admin, University, Supervisor, Student, Job, Employer
│   │   ├── middleware/      # JWT Protect, RBAC Guard, Rate Limiter, CSRF, Sanitize, Upload
│   │   ├── models/          # User, University, JoinRequest, StudentProfile, DailyProgressLog, JobPosting, Application
│   │   ├── routes/          # Express API route declarations
│   │   ├── seed/            # Seeder script populating realistic universities, students, jobs, logs in MySQL
│   │   ├── utils/           # Security logger & cookie utilities
│   │   └── server.js        # Hardened Express server entry point
│   ├── uploads/
│   │   ├── cvs/             # Uploaded student CV PDF storage
│   │   └── profiles/        # Uploaded profile photos storage
│   ├── .env                 # Database credentials and JWT secrets
│   └── package.json
├── database/
│   └── interlink_db.sql     # Full MySQL relational database schema & dump
├── frontend/
│   ├── public/
│   │   ├── backgrounds/     # High-definition video & photography wallpapers
│   │   └── logo.jpg         # Official site logo & favicon
│   ├── src/
│   │   ├── api/             # Axios client with JWT interceptor & CSRF handling
│   │   ├── assets/          # Static assets and logo
│   │   ├── components/      # InterlinkLogo, Navbar, PageBackground, StatusBadge, Toast, Modals
│   │   ├── context/         # AuthContext & ThemeContext
│   │   ├── pages/
│   │   │   ├── admin/       # Admin Dashboard with Sidebar
│   │   │   ├── auth/        # Login & Multi-Role Register
│   │   │   ├── employer/    # Employer Dashboard & Job Postings
│   │   │   ├── head/        # University Head Dashboard
│   │   │   ├── student/     # Student Portal & Progress Logger
│   │   │   └── supervisor/  # Supervisor Dashboard
│   │   ├── App.jsx          # Route guards & paths
│   │   ├── index.css        # Semantic design tokens & core styling
│   │   └── main.jsx
│   ├── index.html           # Meta tags, Plus Jakarta Sans, and smooth scrolling
│   ├── package.json
│   ├── tailwind.config.js   # Tailwind theme mapping to CSS custom properties
│   └── vite.config.js
└── start-interlink.bat      # One-click Windows startup script
```

---

## 🏃 Quick Start Guide

### Prerequisites
- **Node.js** (v18+)
- **MySQL Server** (v8.0+) running on `localhost:3306`

### Option 1: Double-Click Startup
Double-click `start-interlink.bat` to automatically launch both the Backend API server on `http://localhost:5000` and Vite Frontend on `http://localhost:5173`.

### Option 2: Manual Terminal Commands

#### 1. Backend:
```bash
cd backend
npm install
npm run dev
```

*(To re-seed the test database at any time, run: `npm run seed`)*

#### 2. Frontend:
```bash
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:5173`** in your browser.
