# ALYSTRO Phased Implementation Plan

## Phase 1: Foundation, Monorepo Setup & Architecture
- [x] Workspace inspection and technology availability validation.
- [x] Requirements, Architecture, Database Design, and Roles & Permissions specifications.
- [ ] Initialize monorepo root structure (`/client`, `/server`, `/shared`, `.env.example`, `package.json`).
- [ ] Backend foundation: Express, TypeScript, Mongoose, Zod, JWT, CORS, Helmet, rate limiter, error handler.
- [ ] Frontend foundation: Vite + React 18, TypeScript, Tailwind CSS, Lucide icons, TanStack Query, React Router v6.
- [ ] Connect backend to MongoDB at `127.0.0.1:27017/alystro`.

## Phase 2: Core Data Models & Database Seeding
- [ ] Define Mongoose models:
  - User, School, Program, Course, Batch, Student, Teacher, Attendance, Assignment, Submission, Quiz, Result, Certificate, Lead, CMSContent, Notification, Notice, AuditLog.
- [ ] Implement database seeder (`server/src/seed/seedData.ts`) generating:
  - Super Admin (`superadmin@alystro.com`)
  - 3 Partner Schools (e.g., "ABC International School", "Delhi Public Modern School", "St. Xavier Tech Academy")
  - School Admins for each school
  - Teachers, Batches, Students with realistic attendance, assignments, and test scores
  - 3 Flagship Programs (Foundation Class 6-8, Skill Builder Class 9-10, Future Ready Class 11-12)
  - Verified Certificates with valid QR codes
  - CRM Leads across all 6 pipeline stages
  - CMS content (Testimonials, FAQs, Student Projects, Gallery items).

## Phase 3: Vertical Slice 1 — Authentication, Multi-Tenant Isolation & Super Admin Dashboard
- [ ] Auth endpoints (`/api/v1/auth/login`, `/me`, `/logout`, `/forgot-password`).
- [ ] RBAC & Tenant isolation middleware.
- [ ] Super Admin API metrics: real aggregations for Schools, Students, Teachers, Batches, CRM Leads, and Revenue.
- [ ] Super Admin Dashboard UI:
  - Stat cards (Total Schools, Students, Teachers, Batches, Issued Certs, Revenue, Demos).
  - Charts (Monthly Enrollment, School Breakdown, Program Distribution, CRM Conversion).
  - Quick action buttons and recent activities list.

## Phase 4: Public Website (All 22 Views & Matching Reference UI)
- [ ] Reusable UI design system (Navy `#0A192F` + Cyan/Blue `#0284C7` / `#2563EB`, cards, buttons, badges, modals).
- [ ] Global public layout: Header with navigation dropdowns, CTAs, and mobile responsive menu; Footer with quick links, contacts, and newsletter.
- [ ] Page 1: Home (Hero with live session badges, stats, what we teach, 3 programs, why choose ALYSTRO, student work gallery, testimonials, FAQ, CTA).
- [ ] Page 2: About ALYSTRO (Mission, vision, leadership, pedagogy).
- [ ] Page 3: Programs (Filterable catalog with comparison table).
- [ ] Page 4: Program Details (AI Class 6-8, Skill Builder 9-10, Future Ready 11-12 syllabus & project breakdown).
- [ ] Pages 5-7: Domain Deep-Dives (AI & Digital Skills, Coding & Future Skills, Video Editing).
- [ ] Page 8: For Schools (Partnership overview, 4-step adoption roadmap, brochure download modal).
- [ ] Page 9: For Students (Learning journey, portfolios, showcase).
- [ ] Page 10: How It Works (Step-by-step methodology).
- [ ] Page 11: Student Projects Gallery (Categorized filterable cards with modals).
- [ ] Page 12: Certificate Verification (`/verify/:id` public page with real DB lookup & status badge).
- [ ] Page 13: Gallery (Workshop photos & moments).
- [ ] Page 14: Testimonials (Quotes, ratings, photos).
- [ ] Page 15: FAQ (Categorized accordions).
- [ ] Page 16: Contact Us (Office info in Jaipur, direct inquiry form).
- [ ] Page 17: School Partnership (Partnership onboarding form).
- [ ] Page 18: Book a Free Demo (Dedicated interactive modal & page writing to CRM leads).
- [ ] Page 19: Login (Unified login with credentials quick-picker for demo testing).
- [ ] Page 20: Password Reset.
- [ ] Page 21: Blog & News.
- [ ] Page 22: School-Specific Microsites (`/schools/:slug` rendering tenant school branding, enrolled programs, top students).

## Phase 5: School Management & School Admin Dashboard
- [ ] School CRUD endpoints (Create, View, Edit, Deactivate, Archive).
- [ ] Automatic slug generation and public URL allocation (`/schools/:slug`).
- [ ] School Admin Dashboard (`/school`):
  - Overview of school metrics.
  - Student roster with search, filter, and CSV bulk import.
  - Teacher roster with batch assignments.
  - Batch management & timetable scheduler.
  - School attendance and marks reports.
  - School notices board.

## Phase 6: Teacher Dashboard & Student Learning Portal
- [ ] Teacher Dashboard (`/teacher`):
  - Assigned batches and schedule.
  - Attendance marking tool.
  - Assignment creator and submission grading.
  - Quiz creation & result viewer.
- [ ] Student Learning Portal (`/student`):
  - Enrolled courses & upcoming live class links (Google Meet/Zoom links).
  - Recorded session player and module study materials.
  - Assignment submission with status tracking.
  - Interactive quizzes with instant scoring.
  - Attendance log and digital certificates with instant print/download.

## Phase 7: School CRM, Certificate Verification & CMS
- [ ] School CRM Kanban Board (`/admin/crm`):
  - Pipeline stages (New -> Contacted -> Demo Scheduled -> Demo Done -> Converted -> Closed).
  - Drag-and-drop or status selector with notes and demo scheduler.
  - Direct lead conversion into a School tenant.
- [ ] Certificate generation engine:
  - Unique ID (`ALY-2026-XXXXXX`) and dynamic QR code generation.
  - Downloadable and printable certificate view.
  - Public verification route (`/verify/:certificateId`).
- [ ] Admin CMS module:
  - Manage programs, testimonials, FAQs, student projects, and banner content.

## Phase 8: Reports, Exports, Polish & Automated Verification
- [ ] CSV export utilities for student rosters, attendance, and marksheets.
- [ ] Automated end-to-end integration and API tests.
- [ ] Responsive design check across mobile, tablet, and desktop views.
- [ ] Final documentation, README.md, and launch summary.
