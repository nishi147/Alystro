# ALYSTRO Database Schema & Model Design

## 1. Overview
The database uses MongoDB with Mongoose ODM schemas, enforcing validation rules, indexes, cascading relations, and multi-tenant scoping.

## 2. Core Entities & Schemas

### 2.1 Users (`users`)
- `_id`: ObjectId
- `name`: String (Required, trimmed)
- `email`: String (Required, unique, lowercase, indexed)
- `password`: String (Hashed with bcrypt, hidden by default)
- `role`: Enum (`'SUPER_ADMIN'`, `'ADMIN'`, `'SCHOOL_ADMIN'`, `'TEACHER'`, `'STUDENT'`)
- `school`: ObjectId (Ref: `School`, optional for Super Admin, mandatory for School users)
- `phone`: String
- `avatar`: String (URL)
- `status`: Enum (`'ACTIVE'`, `'INACTIVE'`, `'SUSPENDED'`)
- `lastLogin`: Date
- `createdAt`, `updatedAt`: Timestamps

### 2.2 Schools (`schools`)
- `_id`: ObjectId
- `name`: String (Required, e.g. "ABC International School")
- `slug`: String (Required, unique, lowercase, URL-friendly, indexed)
- `code`: String (Unique school code e.g. "ABC-001")
- `logo`: String (URL)
- `coverImage`: String (URL)
- `tagline`: String (e.g. "Empowering Future Innovators")
- `description`: String
- `address`: { street, city, state, pincode, country }
- `contactPerson`: { name, designation, phone, email }
- `classesServed`: [String] (e.g. ["Class 6", "Class 7", ...])
- `studentCapacity`: Number
- `activeStudentCount`: Number (Cached counter)
- `programsEnrolled`: [ObjectId] (Ref: `Program`)
- `startDate`: Date
- `endDate`: Date
- `paymentStatus`: Enum (`'PAID'`, `'PENDING'`, `'PARTIAL'`, `'OVERDUE'`)
- `status`: Enum (`'ACTIVE'`, `'INACTIVE'`, `'TRIAL'`, `'ARCHIVED'`)
- `features`: { enableLMS: Boolean, enableCertificates: Boolean, enableCRM: Boolean }
- `createdAt`, `updatedAt`: Timestamps

### 2.3 Programs & Courses (`programs`, `courses`)
- `Program`:
  - `name`: String (e.g. "Foundation Program", "Skill Builder Program", "Future Ready Program")
  - `slug`: String (Unique)
  - `gradeLevel`: Enum (`'CLASS_6_8'`, `'CLASS_9_10'`, `'CLASS_11_12'`)
  - `category`: String ("AI & Smart Tools", "Video Editing", "Future Skills")
  - `description`: String
  - `durationMonths`: Number (Default: 3)
  - `sessionDurationMinutes`: Number (Default: 45)
  - `mode`: Enum (`'ONLINE'`, `'OFFLINE'`, `'HYBRID'`)
  - `learningOutcomes`: [String]
  - `syllabus`: [{ month: Number, title: String, topics: [String] }]
  - `banner`: String
  - `featured`: Boolean
  - `published`: Boolean
- `Course`:
  - `program`: ObjectId (Ref: `Program`)
  - `title`: String
  - `code`: String
  - `modules`: [{ title: String, description: String, lessons: [{ title: String, durationMinutes: Number, content: String, videoUrl: String, resources: [{ name: String, url: String }] }] }]

### 2.4 Batches (`batches`)
- `name`: String (e.g. "Class 6 AI Explorers - Batch A")
- `school`: ObjectId (Ref: `School`, indexed)
- `program`: ObjectId (Ref: `Program`)
- `teacher`: ObjectId (Ref: `User`, Ref to Teacher)
- `schedule`: [{ dayOfWeek: String, startTime: String, endTime: String }]
- `meetingLink`: String (e.g. Google Meet or Zoom URL)
- `classroomNumber`: String (for offline mode)
- `status`: Enum (`'UPCOMING'`, `'ACTIVE'`, `'COMPLETED'`, `'CANCELLED'`)
- `startDate`: Date
- `endDate`: Date
- `maxStudents`: Number

### 2.5 Students (`students`)
- `user`: ObjectId (Ref: `User`, unique)
- `school`: ObjectId (Ref: `School`, indexed)
- `batch`: ObjectId (Ref: `Batch`, indexed)
- `rollNumber`: String
- `grade`: String (e.g. "Class 8")
- `section`: String (e.g. "B")
- `parentName`: String
- `parentPhone`: String
- `parentEmail`: String
- `enrolledAt`: Date
- `attendanceRate`: Number (Percentage, calculated)
- `status`: Enum (`'ACTIVE'`, `'INACTIVE'`, `'GRADUATED'`)

### 2.6 Teachers (`teachers`)
- `user`: ObjectId (Ref: `User`, unique)
- `school`: ObjectId (Ref: `School`, indexed)
- `specialization`: [String]
- `qualification`: String
- `assignedBatches`: [ObjectId] (Ref: `Batch`)
- `status`: Enum (`'ACTIVE'`, `'INACTIVE'`)

### 2.7 Attendance Records (`attendance`)
- `school`: ObjectId (Ref: `School`, indexed)
- `batch`: ObjectId (Ref: `Batch`, indexed)
- `date`: Date (Indexed)
- `teacher`: ObjectId (Ref: `User`)
- `topicCovered`: String
- `records`: [{ student: ObjectId (Ref: `Student`), status: Enum(`'PRESENT'`, `'ABSENT'`, `'LATE'`, `'EXCUSED'`), remark: String }]

### 2.8 Assignments & Submissions (`assignments`, `submissions`)
- `Assignment`:
  - `school`: ObjectId (Ref: `School`, indexed)
  - `batch`: ObjectId (Ref: `Batch`, indexed)
  - `program`: ObjectId (Ref: `Program`)
  - `teacher`: ObjectId (Ref: `User`)
  - `title`: String
  - `description`: String
  - `dueDate`: Date
  - `totalMarks`: Number
  - `attachments`: [{ name: String, url: String }]
- `Submission`:
  - `assignment`: ObjectId (Ref: `Assignment`, indexed)
  - `student`: ObjectId (Ref: `Student`, indexed)
  - `submittedAt`: Date
  - `fileUrl`: String
  - `notes`: String
  - `marksObtained`: Number
  - `feedback`: String
  - `gradedBy`: ObjectId (Ref: `User`)
  - `status`: Enum (`'SUBMITTED'`, `'GRADED'`, `'LATE'`, `'RESUBMIT'`)

### 2.9 Assessments, Quizzes & Results (`quizzes`, `results`)
- `Quiz`:
  - `school`: ObjectId (Ref: `School`, indexed)
  - `batch`: ObjectId (Ref: `Batch`, indexed)
  - `title`: String
  - `questions`: [{ questionText: String, options: [String], correctOptionIndex: Number, marks: Number }]
  - `durationMinutes`: Number
- `Result`:
  - `quiz`: ObjectId (Ref: `Quiz`, indexed)
  - `student`: ObjectId (Ref: `Student`, indexed)
  - `score`: Number
  - `totalMarks`: Number
  - `percentage`: Number
  - `completedAt`: Date

### 2.10 Certificates (`certificates`)
- `certificateId`: String (Unique, Indexed, e.g. "ALY-2026-948123")
- `student`: ObjectId (Ref: `Student`)
- `studentName`: String (Preserved for immutability)
- `school`: ObjectId (Ref: `School`)
- `schoolName`: String
- `program`: ObjectId (Ref: `Program`)
- `programName`: String
- `issueDate`: Date
- `completionDate`: Date
- `grade`: String (e.g. "Distinction", "Grade A")
- `verificationQrCode`: String (Data URL or verification link)
- `pdfUrl`: String
- `status`: Enum (`'VALID'`, `'REVOKED'`, `'EXPIRED'`)
- `issuedBy`: ObjectId (Ref: `User`)

### 2.11 School CRM & Leads (`leads`)
- `schoolName`: String (Required, indexed)
- `contactPerson`: String
- `designation`: String
- `email`: String
- `phone`: String
- `city`: String
- `state`: String
- `estimatedStudents`: Number
- `interestedProgram`: String
- `leadSource`: Enum (`'WEBSITE_DEMO'`, `'REFERRAL'`, `'INBOUND'`, `'WORKSHOP'`, `'OUTREACH'`)
- `status`: Enum (`'NEW'`, `'CONTACTED'`, `'DEMO_SCHEDULED'`, `'DEMO_DONE'`, `'CONVERTED'`, `'CLOSED'`)
- `assignedTo`: ObjectId (Ref: `User`)
- `demoDate`: Date
- `notes`: [{ author: String, text: String, date: Date }]
- `activityTimeline`: [{ action: String, details: String, timestamp: Date }]

### 2.12 CMS Content (`cms_content`)
- `key`: String (Unique, e.g. `'home_hero'`, `'testimonials'`, `'faqs'`, `'projects'`)
- `category`: String
- `data`: Mixed (Flexible structured JSON)
- `isPublished`: Boolean
- `updatedBy`: ObjectId (Ref: `User`)

### 2.13 Notifications & Notices (`notifications`, `notices`)
- `Notification`:
  - `recipient`: ObjectId (Ref: `User`, indexed)
  - `title`: String
  - `message`: String
  - `type`: Enum (`'INFO'`, `'SUCCESS'`, `'WARNING'`, `'ALERT'`)
  - `link`: String
  - `isRead`: Boolean
- `Notice`:
  - `school`: ObjectId (Ref: `School`, indexed)
  - `title`: String
  - `content`: String
  - `targetRole`: Enum (`'ALL'`, `'TEACHER'`, `'STUDENT'`)
  - `postedBy`: ObjectId (Ref: `User`)

### 2.14 Audit Logs (`audit_logs`)
- `user`: ObjectId (Ref: `User`)
- `action`: String (e.g. "CREATE_SCHOOL", "ISSUE_CERTIFICATE", "UPDATE_LEAD_STATUS")
- `entity`: String ("School", "Certificate", "Lead", "Payment")
- `entityId`: String
- `changes`: Mixed
- `ipAddress`: String
- `createdAt`: Date
