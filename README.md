# Interlink — University Internship Management Portal
---

## 👥 Project Team (Group)
* **E. Tharinda Gimhana** — TG/2023/1704
* **K. K. D. H. Somarathna** — TG/2023/1713
* **R. A. S. Bandara** — TG/2023/1741
* **N. V. T. J. Gunasekara** — TG/2023/1742
* **S. M. H. Lankathilaka** — TG/2023/1746

---

## 🚀 System Overview & Architecture
**Interlink** is a centralized, role-based internship management web platform built on **MySQL, Express.js, React, and Node.js** (utilizing **Sequelize ORM**), designed to connect universities, academic supervisors, students, and industry employers.

The platform provides complete role-based access control (RBAC) and tailored workflows across five stakeholder roles:
1. **Admin**: System oversight, approval/rejection of university and employer registrations, read-only access to all profiles.
2. **University Head (Dean/HOD)**: Approves faculty supervisor join requests, monitors enrolled students of the university and inspects their daily progress logs in real-time.
3. **Supervisor**: Monitors interns enrolled under their university department and reviews daily work logs and hours.
4. **Student**: Self-registration with immediate activation, profile management, CV upload, daily progress logging (date, hours, tasks, learnings), job board browsing, and application tracking.
5. **Employer / Recruiter**: Self-registration with admin verification, job posting, applicant management grouped by vacancy, and an automated category-matching engine that suggests suitable student candidates.

---

## ✨ Recent Major Enhancements & Updates

### 1. 🎨 Apple-Grade Liquid Glassmorphism (`.glass-form`)
* **Frosted Translucent Form Architecture**: Engineered liquid glassmorphic styling across all form containers (`.glass-form`, `.glass-primary`, `.glass-secondary`, `.glass-floating`, `.glass-input`).
* **Optical Diffusion & Depth**: High blur diffusion (`backdrop-filter: blur(28px) saturate(190%)`), luminous specular rims (`1px solid rgba(255, 255, 255, 0.85)` / `0.14`), and layered inset bevels (`box-shadow: inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 2px 0 rgba(255, 255, 255, 0.35)`).
* **Vibrant Backing Accents**: Added luminous refractive backing elements on Login and Register forms to create dynamic color refraction through the frosted glass.
* **Scroll-Blended Translucency**: Forms dynamically blend with background wallpapers, circuit motifs, and ambient color blooms as users scroll.
* **Universal Application**: Implemented across Login, Register (all 4 roles), Student Profile & CV Form, Daily Progress Log Modal, Job Vacancy Post Modal, Supervisor Access Request Card, and Student Progress Modal.

### 2. ☀️ Day Mode Contrast & Color Calibration
* **Cool Slate Base Canvas**: Replaced chalky, washed-out flat white with a soothing, dimensional slate-gray canvas (`#eef2f7`).
* **Recalibrated Scrims**: Replaced heavy 75–90% opaque white scrims with a calibrated translucent overlay (`bg-slate-200/30 backdrop-blur-[2px]`) and soft directional vignette (`from-[#eef2f7]/40 via-transparent to-[#e2e8f0]/70`), allowing wallpapers and ambient graphics to remain visible.
* **Atmospheric Color Blooms**: Boosted Day Mode ambient color orbs to 25–28% opacity, adding depth and visual warmth.
* **Night Mode Preserved**: All dark obsidian glass styling, deep contrast, and neon accents remain completely intact.

### 3. 🖼️ Direct Profile Image File Upload System
* **No External Image Links**: Replaced external image URL text inputs with direct image file upload pickers (`<input type="file">`).
* **Registration Image Uploader**: Added an optional profile picture uploader with instant local avatar preview and background upload to `/api/auth/upload-image`.
* **Profile Photo Studio (Student Dashboard)**: Interactive photo studio in Tab 4 ("Profile & CV") with squircle avatar preview, "Change Photo", and "Remove Photo" actions.
* **Real-Time Avatar Sync**: Uploading or changing a photo immediately updates the studio preview, the dashboard top profile header badge, and the global Navbar avatar via `refreshUser()`.
* **Backend Upload Security Engine**: Multer configuration storing to `uploads/profiles/` with strict MIME/extension filtering (`.jpg, .jpeg, .png, .webp, .gif`), 5MB size limit, and cryptographically random filenames (`profile-${hex}${ext}`).
* **Endpoints**: Added `POST /api/auth/upload-image` (public for registration), `POST /api/auth/profile-picture` (authenticated), and `POST /api/students/profile-picture`.
* **Database**: Added `profilePic: DataTypes.STRING(500)` to the `User` model.

### 4. 🔐 Multi-Identifier Login & Password Sanitization Fix
* **Flexible Multi-Identifier Login**: Users can now log in using **any** of the following identifiers:
  - **Institutional Email** (e.g., `student@gmail.com`, `tharinda.g@fot.ruh.ac.lk`)
  - **Personal Email** (e.g., `anjanasbr2003@gmail.com`)
  - **Student Registration Number** (e.g., `TG/2023/1704`)
  - **Academic Staff Registration Number** (e.g., `STAFF/RUH/FOT/042`)
* **Candidate Password Resolution**: Resolves all accounts matching any of the user's identifiers, checks passwords against active accounts, and logs in seamlessly without confusion between personal and university emails.
* **Password Sanitization Bypass**: Added `SENSITIVE_KEYS` check in `sanitize.js` (`password`, `newPassword`, `currentPassword`, `confirmPassword`) to exempt passwords from XSS HTML entity encoding, preventing hash corruption.
* **Password Reset Flexibility**: `/api/auth/forgot-password` supports looking up accounts by either institutional or personal email.
* **Login Form UX**: Changed input type to `type="text"` with `autoComplete="username"` to support non-email registration numbers without HTML5 regex blocking.

### 5. 🏷️ Official Site Logo Update
* **New Emblem**: Replaced previous generic SVG vector with the official circular partnership emblem (two hands reaching together within circular blue and teal arcs).
* **Apple Squircle Badge**: Rendered inside an Apple-style frosted squircle container (`rounded-2xl bg-white shadow-glass-sm border border-slate-200/90 dark:border-white/20`) for optimal contrast in both Day and Night modes.
* **Universal Deployment**: Integrated into the Navbar, Login hero header, Register hero header, and browser tab favicon (`<link rel="icon" type="image/jpeg" href="/logo.jpg" />`).

---

## 🔑 Pre-Seeded Test Credentials

| Role | Email / Identifier | Password | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@interlink.lk` | `admin123` | Active | System owner, approves universities & employers |
| **University Head** | `head@ruhuna.ac.lk` | `head123` | Approved | Dean, Faculty of Technology, University of Ruhuna |
| **University Head** | `head@mrt.ac.lk` | `head123` | Pending | University of Moratuwa (Admin test demo) |
| **Supervisor** | `kasun.w@fot.ruh.ac.lk`<br>or `STAFF/RUH/FOT/042` | `sup123` | Approved | Senior Lecturer, University of Ruhuna |
| **Supervisor** | `nuwan.p@fot.ruh.ac.lk`<br>or `STAFF/RUH/FOT/089` | `sup123` | Pending | Lecturer (Probationary), Pending Head approval |
| **Student** | `tharinda.g@fot.ruh.ac.lk`<br>or `TG/2023/1704` | `student123` | Active | BICT, Software Engineering (Has 3 daily logs) |
| **Student** | `daham.s@fot.ruh.ac.lk`<br>or `TG/2023/1713` | `student123` | Active | BICT, Backend & Cloud Infrastructure |
| **Student** | `sandun.b@fot.ruh.ac.lk`<br>or `TG/2023/1741` | `student123` | Active | BICT, Data Analysis & Bioinformatics |
| **Employer** | `kasun.w@virtusa.com` | `employer123` | Approved | Virtusa Sri Lanka (IT Sector, 2 open vacancies) |
| **Employer** | `nilmini@hayleysbio.lk` | `employer123` | Approved | Hayleys Agriculture & Biotechnology (1 vacancy) |
| **Employer** | `malik@wso2.com` | `employer123` | Pending | WSO2 Sri Lanka (Pending Admin review demo) |

*(Note: You can log in using either your institutional email, personal email, or registration number!)*

---

## 🛠️ Project Structure
```
interlink/
├── backend/
│   ├── logs/                # Audit & security event logs
│   ├── src/
│   │   ├── config/          # MySQL Sequelize connection & database initialization
│   │   ├── controllers/     # Auth, Admin, University, Supervisor, Student, Job, Employer
│   │   ├── middleware/      # JWT Protect, RBAC Guard, Rate Limiter, CSRF, Sanitize, Upload
│   │   ├── models/          # User, University, JoinRequest, StudentProfile, DailyProgressLog, JobPosting, Application
│   │   ├── routes/          # Express API route declarations
│   │   ├── seed/            # Seeder script populating realistic universities, students, jobs, logs in MySQL
│   │   ├── utils/           # Security logger & utilities
│   │   └── server.js        # Hardened Express server entry point
│   ├── uploads/
│   │   ├── cvs/             # Uploaded student CV PDF storage
│   │   └── profiles/        # Uploaded profile photos storage
│   ├── .env                 # Database credentials and JWT secrets
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── backgrounds/     # High-definition video & photography wallpapers
│   │   └── logo.jpg         # Official site logo & favicon
│   ├── src/
│   │   ├── api/             # Axios client with JWT interceptor & CSRF handling
│   │   ├── assets/          # Static assets and logo
│   │   ├── components/      # InterlinkLogo, Navbar, PageBackground, Toast, Modals
│   │   ├── context/         # AuthContext & ThemeContext
│   │   ├── pages/
│   │   │   ├── admin/       # Admin Dashboard
│   │   │   ├── auth/        # Login & Multi-Role Register
│   │   │   ├── employer/    # Employer Dashboard & Job Postings
│   │   │   ├── head/        # University Head Dashboard
│   │   │   ├── student/     # Student Portal & Progress Logger
│   │   │   └── supervisor/  # Supervisor Dashboard
│   │   ├── App.jsx          # Route guards & paths
│   │   ├── index.css        # Apple liquid glassmorphism utility classes
│   │   └── main.jsx
│   ├── index.html           # Meta tags, fonts, and favicon configuration
│   ├── package.json
│   ├── tailwind.config.js
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
npm run dev
```

*(To re-seed the test database at any time, run: `npm run seed`)*

#### 2. Frontend:
```bash
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** in your browser.
"# Intership-Management-System" 
