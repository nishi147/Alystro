"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("../app.js");
const database_js_1 = require("../config/database.js");
const http_1 = __importDefault(require("http"));
async function runTests() {
    console.log('--- RUNNING AUTOMATED BACKEND INTEGRATION TESTS ---');
    await (0, database_js_1.connectDatabase)();
    const server = http_1.default.createServer(app_js_1.app);
    await new Promise((resolve) => server.listen(5099, resolve));
    const baseUrl = 'http://localhost:5099/api/v1';
    let passed = 0;
    let failed = 0;
    async function assertTest(name, fn) {
        try {
            await fn();
            console.log(`✅ [PASS] ${name}`);
            passed++;
        }
        catch (err) {
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
    console.log(`\n========================================`);
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);
    server.close();
    await (0, database_js_1.disconnectDatabase)();
    if (failed > 0)
        process.exit(1);
}
runTests();
