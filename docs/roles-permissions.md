# ALYSTRO Roles and Permissions Matrix

## 1. Role Definitions
The platform enforces hierarchical and tenant-isolated Role-Based Access Control (RBAC).

| Role | Scope | Primary Purpose |
|---|---|---|
| **SUPER_ADMIN** | Global (All Tenants) | Full administrative access, global metrics, tenant provisioning, CRM oversight, CMS publishing, system configurations. |
| **ADMIN** | Global / Delegated | Platform operations, lead management, course curriculum editing, customer support. |
| **SCHOOL_ADMIN** | Single Tenant (`schoolId`) | Management of students, teachers, batches, timetables, internal fee status, notices, and progress reports for their designated school. |
| **TEACHER** | Single Tenant + Assigned Batches | Taking attendance for assigned batches, uploading lesson resources, assignments, grading, marking student feedback. |
| **STUDENT** | Single Tenant + Self Enrolled | Accessing class schedules, live sessions, video recordings, study materials, taking quizzes, submitting assignments, tracking attendance, downloading verified certificates. |

## 2. Permission Matrix by Module

| Module / Operation | SUPER_ADMIN | ADMIN | SCHOOL_ADMIN | TEACHER | STUDENT |
|---|:---:|:---:|:---:|:---:|:---:|
| **Platform Analytics (Global)** | Full | Read-Only | Denied | Denied | Denied |
| **School Analytics (Tenant)** | Full | Full | Full | Denied | Denied |
| **School Creation & Config** | Full | Read/Update | Denied | Denied | Denied |
| **School Settings (Own School)** | Full | Full | Full | Denied | Denied |
| **Teacher Management** | Full | Read | Full (Own School) | Denied | Denied |
| **Student Management** | Full | Read | Full (Own School) | Read (Assigned) | Denied |
| **Bulk CSV Student Import** | Full | Denied | Full (Own School) | Denied | Denied |
| **Batch Management** | Full | Read | Full (Own School) | Read (Assigned) | Read (Enrolled) |
| **Attendance Marking** | Full | Read | Full (Own School) | Full (Assigned) | Denied |
| **Attendance Viewing** | Full | Full | Full (Own School) | Full (Assigned) | Self Only |
| **Assignment Management** | Full | Full | Full (Own School) | Full (Assigned) | Denied |
| **Assignment Submission** | Denied | Denied | Denied | Denied | Self Only |
| **Assignment Grading** | Full | Full | Full (Own School) | Full (Assigned) | Denied |
| **Quiz Creation** | Full | Full | Full (Own School) | Full (Assigned) | Denied |
| **Quiz Taking** | Denied | Denied | Denied | Denied | Self Only |
| **Certificate Issuance** | Full | Full | Full (Own School) | Denied | Denied |
| **Certificate Verification** | Public | Public | Public | Public | Public |
| **CRM Leads & Pipeline** | Full | Full | Denied | Denied | Denied |
| **CMS Pages & Testimonials** | Full | Full | Denied | Denied | Denied |
| **Audit Logs** | Full | Read-Only | Denied | Denied | Denied |
| **In-App Notifications** | Full | Full | Own School Users | Assigned Batch | Self |

## 3. Enforcement Strategy
1. **Route Level (`authorizeRoles(['SUPER_ADMIN', 'ADMIN'])`)**: Guards high-level API routes.
2. **Tenant Level (`enforceSchoolIsolation`)**: Intercepts requests for `SCHOOL_ADMIN`, `TEACHER`, and `STUDENT` to ensure `req.params.schoolId` or `req.query.schoolId` strictly matches `req.user.schoolId`.
3. **Resource Ownership Level**: Checks whether a student is requesting their own submissions/results or if a teacher is assigned to the specific batch.
