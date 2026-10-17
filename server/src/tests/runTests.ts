import { app } from '../app.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import http from 'http';

async function runTests() {
  console.log('--- RUNNING AUTOMATED BACKEND INTEGRATION TESTS ---');
  await connectDatabase();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099/api/v1';

  let passed = 0;
  let failed = 0;

  async function assertTest(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  let superAdminToken = '';
  let schoolAdminToken = '';
  let studentToken = '';

  // Test 1: Super Admin Login
  await assertTest('Super Admin Authentication', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@alystro.com', password: 'Admin@123' }),
    });
    const json = await res.json();
    if (!res.ok || !json.data?.token || json.data.user.role !== 'SUPER_ADMIN') {
      throw new Error(`Failed to log in as Super Admin: ${JSON.stringify(json)}`);
    }
    superAdminToken = json.data.token;
  });

  // Test 2: Invalid Login Prevention
  await assertTest('Invalid Login Rejection', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@alystro.com', password: 'WrongPassword' }),
    });
    if (res.status !== 401) {
      throw new Error(`Expected 401 Unauthorized but got ${res.status}`);
    }
  });

  // Test 3: School Admin Login
  await assertTest('School Admin Authentication', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'principal@abcschool.edu', password: 'School@123' }),
    });
    const json = await res.json();
    if (!res.ok || !json.data?.token || json.data.user.role !== 'SCHOOL_ADMIN') {
      throw new Error(`Failed to log in as School Admin: ${JSON.stringify(json)}`);
    }
    schoolAdminToken = json.data.token;
  });

  // Test 4: Student Login
  await assertTest('Student Authentication', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aarav.sharma@student.alystro.com', password: 'Student@123' }),
    });
    const json = await res.json();
    if (!res.ok || !json.data?.token || json.data.user.role !== 'STUDENT') {
      throw new Error(`Failed to log in as Student: ${JSON.stringify(json)}`);
    }
    studentToken = json.data.token;
  });

  // Test 5: Super Admin Aggregated Statistics
  await assertTest('Database-backed Super Admin Stats', async () => {
    const res = await fetch(`${baseUrl}/stats/super-admin`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    const json = await res.json();
    if (!res.ok || json.data?.summary?.totalSchools < 1) {
      throw new Error(`Stats endpoint failed: ${JSON.stringify(json)}`);
    }
  });

  // Test 6: Cross-Tenant Access Prevention
  await assertTest('Cross-Tenant Data Tampering Prevention', async () => {
    // School Admin for ABC International attempting to access another school ID
    const fakeOtherSchoolId = '666666666666666666666666';
    const res = await fetch(`${baseUrl}/schools/${fakeOtherSchoolId}`, {
      headers: { Authorization: `Bearer ${schoolAdminToken}` },
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden for cross-tenant tampering, got ${res.status}`);
    }
  });

  // Test 7: Public Certificate Verification
  await assertTest('Public Certificate Verification (Valid ID)', async () => {
    const res = await fetch(`${baseUrl}/certificates/verify/ALY-2026-948123`);
    const json = await res.json();
    if (!res.ok || !json.valid || json.data?.studentName !== 'Aarav Sharma') {
      throw new Error(`Certificate verification failed: ${JSON.stringify(json)}`);
    }
  });

  // Test 8: Public Certificate Verification (Invalid ID)
  await assertTest('Public Certificate Verification (Invalid ID Handled)', async () => {
    const res = await fetch(`${baseUrl}/certificates/verify/NON-EXISTENT-ID`);
    if (res.status !== 404) {
      throw new Error(`Expected 404 for non-existent certificate, got ${res.status}`);
    }
  });

  // Test 9: Public Lead Generation (Book Free Demo)
  await assertTest('Public Lead Generation Form Submission', async () => {
    const res = await fetch(`${baseUrl}/crm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schoolName: 'Silver Oaks High School',
        contactPerson: 'Kavita Joshi',
        email: 'kavita@silveroaks.edu',
        phone: '9876543299',
        city: 'Jaipur',
        estimatedStudents: 300,
        interestedProgram: 'Foundation Program',
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.data?._id) {
      throw new Error(`Lead submission failed: ${JSON.stringify(json)}`);
    }
  });

  // Test 10: Super Admin School Creation & Admin Provisioning
  const testSchoolName = `Reg Test Academy ${Date.now()}`;
  const testAdminEmail = `admin_${Date.now()}@regtest.edu`;
  await assertTest('Super Admin School Creation & Admin Provisioning', async () => {
    const res = await fetch(`${baseUrl}/schools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        name: testSchoolName,
        address: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
        contactPerson: { name: 'Principal Sharma', phone: '9829012399', email: testAdminEmail },
        adminEmail: testAdminEmail,
        adminPassword: 'School@123',
        studentCapacity: 600,
      }),
    });
    const json = await res.json();
    if (res.status !== 201 || !json.data?._id) {
      throw new Error(`School creation failed: status ${res.status}, ${JSON.stringify(json)}`);
    }

    // Verify created School Admin can log in
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testAdminEmail, password: 'School@123' }),
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok || loginJson.data?.user?.role !== 'SCHOOL_ADMIN') {
      throw new Error(`Newly provisioned School Admin failed to authenticate: ${JSON.stringify(loginJson)}`);
    }
  });

  // Test 11: School Creation Validation & Duplicate Rejection
  await assertTest('Duplicate School & Email Rejection (409 Conflict)', async () => {
    // Attempt to create duplicate school with identical name
    const res = await fetch(`${baseUrl}/schools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        name: testSchoolName,
        address: { city: 'Jaipur', state: 'Rajasthan' },
        contactPerson: { name: 'Principal Sharma', phone: '9829012399', email: 'another@test.edu' },
      }),
    });
    if (res.status !== 409) {
      throw new Error(`Expected 409 Conflict for duplicate school, got status ${res.status}`);
    }
  });

  // Test 12: Public School Self-Registration (Pending Status)
  let pendingAppSchoolEmail = `applicant_${Date.now()}@newinstitution.edu`;
  let pendingAppSchoolName = `Global Valley School ${Date.now()}`;
  let pendingApplicantToken = '';
  let pendingAppId = '';

  await assertTest('Public School Self-Registration (Pending Status)', async () => {
    const res = await fetch(`${baseUrl}/auth/register/school`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schoolName: pendingAppSchoolName,
        schoolEmail: pendingAppSchoolEmail,
        schoolPhone: '+91 98290 88776',
        city: 'Jaipur',
        state: 'Rajasthan',
        address: 'Plot 10, Knowledge City, Vidhyadhar Nagar',
        contactPersonName: 'Prof. Anirudh Mehta',
        contactPersonDesignation: 'School Director',
        studentCount: 750,
        classesOffered: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
        interestedPrograms: ['Artificial Intelligence', 'Robotics'],
        password: 'Password@123',
        confirmPassword: 'Password@123',
        termsAccepted: true,
      }),
    });
    const json = await res.json();
    if (res.status !== 201 || !json.data?.token || json.data?.user?.status !== 'PENDING_APPROVAL') {
      throw new Error(`School registration failed: ${JSON.stringify(json)}`);
    }
    pendingApplicantToken = json.data.token;
    pendingAppId = json.data.applicationId;
  });

  // Test 13: Strict Access Denial for Pending Users on Protected APIs
  await assertTest('Strict Access Denial: Pending User Blocked from Protected APIs', async () => {
    const res = await fetch(`${baseUrl}/stats/super-admin`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${pendingApplicantToken}` },
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden for pending user on protected route, got ${res.status}`);
    }
  });

  // Test 14: Pending User Application Status Tracking (/auth/my-status)
  await assertTest('Application Status Endpoint Accessible to Pending User', async () => {
    const res = await fetch(`${baseUrl}/auth/my-status`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${pendingApplicantToken}` },
    });
    const json = await res.json();
    if (!res.ok || json.data?.user?.status !== 'PENDING_APPROVAL' || !json.data?.application) {
      throw new Error(`Failed to fetch status: ${JSON.stringify(json)}`);
    }
  });

  // Test 15: Super Admin School Approval & Account Activation Workflow
  await assertTest('Super Admin School Approval & Activation Workflow', async () => {
    const approveRes = await fetch(`${baseUrl}/schools/applications/${pendingAppId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
    });
    const approveJson = await approveRes.json();
    if (!approveRes.ok || approveJson.data?.application?.status !== 'APPROVED') {
      throw new Error(`Application approval failed: ${JSON.stringify(approveJson)}`);
    }

    // Authenticate with the newly approved school admin credentials
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingAppSchoolEmail, password: 'Password@123' }),
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok || loginJson.data?.user?.status !== 'ACTIVE' || loginJson.data?.dashboardPath !== '/school') {
      throw new Error(`Approved school admin login check failed: ${JSON.stringify(loginJson)}`);
    }
  });

  // Test 16: Public Teacher Self-Registration
  const testTeacherEmail = `mentor_${Date.now()}@educonnect.in`;
  await assertTest('Public Teacher Self-Registration (Pending Affiliation)', async () => {
    const res = await fetch(`${baseUrl}/auth/register/teacher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Vikas Sen',
        email: testTeacherEmail,
        phone: '+91 98290 55443',
        isUnlistedSchool: true,
        unlistedSchoolName: 'Pioneer International Academy',
        unlistedSchoolCity: 'Jaipur',
        unlistedSchoolState: 'Rajasthan',
        qualification: 'M.Tech Computer Science',
        experienceYears: 4,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        termsAccepted: true,
      }),
    });
    const json = await res.json();
    if (res.status !== 201 || json.data?.user?.status !== 'PENDING_APPROVAL') {
      throw new Error(`Teacher registration failed: ${JSON.stringify(json)}`);
    }
  });

  // Test 17: Public Student Self-Registration
  const testStudentEmail = `learner_${Date.now()}@edumail.com`;
  await assertTest('Public Student Self-Registration (Pending Enrollment)', async () => {
    const res = await fetch(`${baseUrl}/auth/register/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Devansh Khandelwal',
        email: testStudentEmail,
        phone: '+91 98290 11223',
        isUnlistedSchool: true,
        unlistedSchoolName: 'Pioneer International Academy',
        unlistedSchoolCity: 'Jaipur',
        unlistedSchoolState: 'Rajasthan',
        grade: 'Class 9',
        programInterest: 'AI & Machine Learning',
        parentName: 'Sunil Khandelwal',
        parentPhone: '+91 98290 11220',
        password: 'Password@123',
        confirmPassword: 'Password@123',
        termsAccepted: true,
      }),
    });
    const json = await res.json();
    if (res.status !== 201 || json.data?.user?.status !== 'PENDING_APPROVAL') {
      throw new Error(`Student registration failed: ${JSON.stringify(json)}`);
    }
  });

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  server.close();
  await disconnectDatabase();

  if (failed > 0) process.exit(1);
}

runTests();
