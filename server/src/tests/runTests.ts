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

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  server.close();
  await disconnectDatabase();

  if (failed > 0) process.exit(1);
}

runTests();
