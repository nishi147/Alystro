# ALYSTRO — EdTech & School Management Platform: Requirements Specification

## 1. Executive Summary & Vision
**ALYSTRO** is a modern, enterprise-grade EdTech and School Management SaaS platform designed to bring 21st-century future-ready skills (AI & Digital Tools, Video Editing, Coding & Creative Technology) directly into schools for Class 6–12 students. It combines a high-converting public portal, full-fledged school management system (SMS), learning management system (LMS), school CRM, certificate issuance & public verification, and administrative CMS.

## 2. Target Personas & Stakeholders
1. **Super Admin / Platform Owner**: Full visibility across all tenant schools, aggregate financials, CRM pipeline, course library, and global CMS.
2. **Admin / Operations Staff**: Operational staff managing support, CRM leads, and course schedules.
3. **School Admin / Principal**: Single-school tenant isolated administrator managing students, teachers, batches, timetables, fees, attendance, notices, and progress reports for their school.
4. **Teacher / Mentor**: Instructor conducting live sessions, marking daily attendance, uploading study materials, reviewing assignments, and publishing test marks.
5. **Student**: Young learners (Class 6–12) accessing their assigned program, live class links, recorded sessions, quizzes, projects, certificates, and academic portfolio.
6. **Prospective Partner Schools & Parents**: Public visitors seeking program information, demo bookings, brochures, and certificate verification.

## 3. Visual & Design Standards (Reference Mockup Alignment)
- **Palette**: Deep Navy (`#0A192F` / `#0B1B3D`), Vivid Cyan/Blue (`#0284C7` / `#2563EB` / `#38BDF8`), Crisp White (`#FFFFFF`), Light Slate Gray backgrounds (`#F8FAFC`).
- **Typography**: Inter & Outfit, high-contrast crisp text hierarchy, readable metrics, glassmorphic accents, rounded cards (`rounded-2xl` / `rounded-xl`), soft elevation shadows.
- **Components**: Reusable responsive Navbar, Footer, Metric Stat Cards, Filter Bars, Data Tables with pagination, Modal dialogs, Status Badges, Charts (Recharts), and Toast notifications.
- **Mobile First**: Fluid responsiveness on smartphones, tablets, and wide desktop displays.

## 4. Functional Requirements

### 4.1 Public Website (22 Functional Pages/Views)
1. **Home**: Hero with live session badges, dual CTAs ("Book Free Demo" & "Partner With Your School"), key platform stats (5,000+ Students, 25+ Schools, 150+ Workshops, 1,200+ Projects), "What We Teach" grid, 3-tier programs preview, "Why Schools Choose ALYSTRO", Student Project showcase carousel/grid, School testimonials, FAQ accordions, Demo CTA banner, Footer.
2. **About Us**: Mission, Vision, pedagogy, leadership, why future-skills matter.
3. **Programs**: Comprehensive directory with filter tabs (All, Class 6–8, Class 9–10, Class 11–12), feature comparison matrix.
4. **Program Detail**: Deep dive into Foundation / Skill Builder / Future Ready programs with syllabus modules, sample projects, prerequisites, learning outcomes, and demo booking action.
5. **AI & Digital Skills**: Domain-specific curriculum for generative AI, smart tools, digital productivity, ethical AI.
6. **Coding & Future Skills**: Domain-specific curriculum for computational thinking, web foundations, python/automation, logic building.
7. **Video Editing & Content Creation**: Timeline editing, storytelling, reel production, visual graphics.
8. **For Schools (Partnership)**: Value proposition for school principals/directors, 4-step implementation model (Connect -> Free Demo -> Setup -> Training), downloadable brochure trigger.
9. **For Students**: Student journey, project portfolios, certificates, community guidelines.
10. **How It Works**: Visual step-by-step methodology for live hybrid workshops, mentor support, and project reviews.
11. **Student Projects & Results**: Filterable gallery of student work (AI Art, Video Editing, Posters, Reel Projects, Presentations).
12. **Certificates & Verification**: Search & verification landing page with instant cryptographic/ID verification.
13. **Gallery**: Photos and videos of school workshops, bootcamps, and award ceremonies.
14. **Testimonials**: Testimonials from principals, computer teachers, parents, and students.
15. **FAQ**: Categorized questions regarding duration (3 months), session length (45 mins), online/offline delivery, hardware requirements, and certification.
16. **Contact Us**: Contact cards, head office details (Jaipur, Rajasthan), phone/email/WhatsApp links, interactive inquiry form.
17. **School Partnership / Registration**: Detailed onboarding inquiry form for institutions.
18. **Book a Free Demo**: Dedicated modal/page capturing School Name, Contact Person, Designation, Phone, Email, Classes, Preferred Demo Date.
19. **Login**: Unified secure portal login with role-based routing (Super Admin -> `/admin`, School Admin -> `/school`, Teacher -> `/teacher`, Student -> `/student`).
20. **Password Reset**: Self-service recovery workflow with secure tokens.
21. **Blog & News**: Educational articles, EdTech trends, and platform announcements.
22. **School-Specific Public Pages (`/schools/:slug`)**: Custom branded microsite displaying the school's banner, partner badge, enrolled programs, active batches, and top student showcase.

### 4.2 Core Programs & Curriculum Structure
- **Class 6–8: Foundation Program**: AI & Smart Tools, Video Editing Basics, Digital Skills, Creative Projects.
- **Class 9–10: Skill Builder Program**: Advanced AI Tools, Video Editing & Motion, Content Creation, Future Skills & Automation.
- **Class 11–12: Future Ready Program**: Advanced AI & Applied LLMs, Career-Oriented Skills, Real-world Capstone Projects, Portfolio Preparation.
- **Common Structure**: 3-Month configurable duration, 45-minute live interactive sessions, session recordings, module study materials (PDF/links), assignments with deadlines, automated/manual grading quizzes, and capstone project submission.

### 4.3 Multi-Tenant Role-Based Access Control (RBAC)
- **Tenant Isolation**: Every School entity acts as an isolated organizational tenant. School Admins, Teachers, and Students are strictly scoped to their assigned `schoolId`.
- **Backend Authorization**: All controllers validate token claims and enforce resource ownership checks at the database query level (e.g. `query.school = req.user.schoolId`).
- **Roles**:
  - `SUPER_ADMIN`: Global tenant-agnostic administrative privileges.
  - `ADMIN`: Platform staff with selected operational capabilities.
  - `SCHOOL_ADMIN`: Management of students, teachers, batches, timetables, and reports within their assigned school.
  - `TEACHER`: Management of assigned batches, attendance marking, grading assignments, and sharing learning resources.
  - `STUDENT`: Access to enrolled courses, live meeting links, recordings, assignments, quizzes, attendance records, and verified certificates.

### 4.4 School CRM & Sales Pipeline
- **Lead Pipeline Stages**: `New` -> `Contacted` -> `Demo Scheduled` -> `Demo Done` -> `Converted` -> `Closed`.
- **Kanban Board & List View**: Drag-and-drop / select status transition with audit logging.
- **Demo Scheduling**: Link demo date/time, assigned sales mentor, and automatic transition to "Demo Scheduled".
- **Lead Conversion**: Convert lead into an active School tenant with auto-provisioned School Admin credentials.

### 4.5 Academic Management & LMS
- **Batches**: Linked to School and Program, with specific class timings (e.g., Mon, Wed, Fri 4:00 PM - 4:45 PM), assigned teacher, and meeting URL.
- **Attendance**: Date-wise session attendance tracking (`Present`, `Absent`, `Late`, `Excused`) with batch percentage calculation.
- **Assignments & Submissions**: Teachers publish assignments with deadline; students submit URLs/files/notes; teachers grade with marks and qualitative feedback.
- **Assessments / Quizzes**: Multiple-choice questions and coding/practical tasks with instant scoring and performance metrics.
- **Student Progress**: Tracking module completion, attendance threshold (e.g. >= 75%), assignment completion, and certificate eligibility.

### 4.6 Certificate Issuance & Verification System
- **Unique Certificate ID**: Format `ALY-YYYY-XXXXXX` with cryptographic hash.
- **Verification Page**: `/verify/:certificateId` or `/verify?id=...` rendering real-time validity, student name, school, program, completion date, and issuing authority.
- **QR Code Generation**: Embedded QR code on the certificate directly resolving to the verification URL.
- **Print & PDF Export**: High-resolution certificate rendering with official ALYSTRO seals and authorized signatures.

### 4.7 Reports, Analytics & Exports
- Real-time aggregate statistics for Super Admin and School Admins.
- Interactive Recharts for enrollment trends, attendance distribution, revenue, and CRM conversion.
- Export to CSV format for student rosters, attendance sheets, and marksheets.

### 4.8 Headless CMS for Dynamic Public Content
- Content management endpoints and UI for Programs, Courses, Testimonials, Student Projects, Gallery, FAQs, Notices, and Blogs.
- Instant public site updates without code redeployment.
