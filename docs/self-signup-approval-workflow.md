# ALYSTRO Self-Signup, School Approval & Role-Based Access Architecture

## 1. Overview
The ALYSTRO platform provides self-registration for schools, educators, and students while enforcing a multi-tenant role-based security perimeter. No applicant receives access to protected learning resources or student data upon mere registration. Access requires verification and approval.

---

## 2. Status Models & Lifecycle Transitions

### A. User Account Status
* **`PENDING_APPROVAL`**: Initial state upon registration. Applicant can authenticate to access the restricted `/application-status` page but is blocked from all role dashboards and learning APIs with `403 Forbidden`.
* **`ACTIVE`**: Full role-based access granted after Super Admin or School Admin approval.
* **`REJECTED`**: Application was reviewed and declined. The applicant can view the specific rejection reason on their status page.
* **`SUSPENDED`**: Account locked by administration due to security or contract termination.
* **`INACTIVE`**: Dormant or unverified account.

### B. School Application Status
* **`PENDING_APPROVAL`**: Application received via public registration, awaiting Super Admin review.
* **`APPROVED`**: Institutional tenant created (`School` record with unique code/slug), associated School Admin account activated.
* **`REJECTED`**: Application declined with recorded rationale and audit log.

### C. Affiliation & Enrollment Status
* **`PENDING`**: Teacher or Student submitted affiliation request.
* **`APPROVED`**: School Admin verified affiliation. `Teacher` or `Student` record provisioned.
* **`REJECTED`**: School Admin declined request.

---

## 3. Endpoints Matrix

### Public Registration & Status
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/register/school` | `POST` | Public | Submits school partnership application and provisions pending School Admin account. |
| `/api/v1/auth/register/teacher` | `POST` | Public | Submits educator registration and creates pending affiliation request. |
| `/api/v1/auth/register/student` | `POST` | Public | Submits student enrollment and creates pending affiliation request. |
| `/api/v1/auth/my-status` | `GET` | Authenticated | Fetches live tracking status, application details, and rejection reasons. |
| `/api/v1/schools/public-list` | `GET` | Public | Returns list of approved, active schools for signup dropdowns. |

### Super Admin School Approvals
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/schools/applications` | `GET` | `SUPER_ADMIN`, `ADMIN` | Lists school registration applications with status filtering. |
| `/api/v1/schools/applications/:id` | `GET` | `SUPER_ADMIN`, `ADMIN` | Fetches complete submitted application payload. |
| `/api/v1/schools/applications/:id/approve` | `POST` | `SUPER_ADMIN` | Approves application, provisions `School` tenant, and activates `School Admin`. |
| `/api/v1/schools/applications/:id/reject` | `POST` | `SUPER_ADMIN` | Rejects application and records rejection reason. |
| `/api/v1/schools/applications/:id/request-info`| `POST` | `SUPER_ADMIN` | Records clarification notes on the application. |

### School Admin Campus Affiliations
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/schools/affiliations/requests` | `GET` | `SCHOOL_ADMIN`, `SUPER_ADMIN` | Lists teacher and student affiliation requests. |
| `/api/v1/schools/affiliations/:id/approve` | `POST` | `SCHOOL_ADMIN`, `SUPER_ADMIN` | Approves affiliation, provisions role record, and activates user. |
| `/api/v1/schools/affiliations/:id/reject` | `POST` | `SCHOOL_ADMIN`, `SUPER_ADMIN` | Rejects affiliation and records rationale. |

---

## 4. Frontend Route Mapping
* `/login`: Supports standard login with quick demo credentials and a "Create Account / Sign Up" option.
* `/register`: Multi-role registration with tabs for **School Partner**, **Educator / Mentor**, and **Student**.
* `/application-status`: Dedicated status tracking page showing 3-step progress, review banners, rejection reasons, and support contacts.
* Protected Dashboards:
  * `/admin`: Super Admin workspace (includes School Applications review queue).
  * `/school`: School Admin dashboard (includes Affiliation Requests review queue).
  * `/teacher`: Mentor dashboard (active batches and student submissions).
  * `/student`: Student portal (enrolled courses, attendance, assignments, and certificates).
