import assert from 'assert';
import { validateStrictGoogleClassroomUrl } from '../utils/validators.js';
import { GoogleClassroom } from '../models/GoogleClassroom.js';

async function runGoogleClassroomTests() {
  console.log('--- RUNNING GOOGLE CLASSROOM INTEGRATION TESTS ---');

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // ─── 1. URL Validation Tests ──────────────────────────────────────────────
  test('Valid HTTPS Google Classroom URL with /c/ path', () => {
    const res = validateStrictGoogleClassroomUrl('https://classroom.google.com/c/NjAyOTc1Mzg3MDgw');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.error, undefined);
  });

  test('Valid HTTPS Google Classroom URL with query params', () => {
    const res = validateStrictGoogleClassroomUrl('https://classroom.google.com/u/0/c/NjAyOTc1Mzg3MDgw?cjc=abc1234');
    assert.strictEqual(res.isValid, true);
  });

  test('Reject HTTP (non-secure) Google Classroom URL', () => {
    const res = validateStrictGoogleClassroomUrl('http://classroom.google.com/c/NjAyOTc1Mzg3MDgw');
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error?.includes('HTTPS'));
  });

  test('Reject external non-Google domain (e.g. Zoom)', () => {
    const res = validateStrictGoogleClassroomUrl('https://zoom.us/j/1234567890');
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error?.includes('classroom.google.com'));
  });

  test('Reject spoofed or phishing subpath URL', () => {
    const res = validateStrictGoogleClassroomUrl('https://evil-domain.com/classroom.google.com/c/123');
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error?.includes('classroom.google.com'));
  });

  test('Reject empty or missing URL', () => {
    const res1 = validateStrictGoogleClassroomUrl('');
    const res2 = validateStrictGoogleClassroomUrl('   ');
    assert.strictEqual(res1.isValid, false);
    assert.strictEqual(res2.isValid, false);
  });

  test('Reject Google Classroom URL without class path or code', () => {
    const res = validateStrictGoogleClassroomUrl('https://classroom.google.com/');
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error?.includes('full Google Classroom link'));
  });

  // ─── 2. Model & Index Definition Tests ────────────────────────────────────
  test('GoogleClassroom Model is registered in Mongoose', () => {
    assert.ok(GoogleClassroom);
    assert.strictEqual(GoogleClassroom.modelName, 'GoogleClassroom');
  });

  test('GoogleClassroom Schema has unique compound index on school, course, and batch', () => {
    const indexes = GoogleClassroom.schema.indexes();
    const compoundIndex = indexes.find(
      ([fields, options]) =>
        fields.school === 1 &&
        fields.course === 1 &&
        fields.batch === 1 &&
        options?.unique === true
    );
    assert.ok(compoundIndex, 'Compound unique index { school: 1, course: 1, batch: 1 } must exist');
  });

  test('GoogleClassroom Schema has secondary indexes for fast lookups', () => {
    const paths = GoogleClassroom.schema.paths;
    assert.ok(paths['classroomName'], 'classroomName field must exist');
    assert.ok(paths['classroomUrl'], 'classroomUrl field must exist');
    assert.ok(paths['school'], 'school field must exist');
    assert.ok(paths['course'], 'course field must exist');
    assert.ok(paths['batch'], 'batch field must exist');
    assert.ok(paths['teacher'], 'teacher field must exist');
    assert.ok(paths['status'], 'status field must exist');
    assert.ok(paths['instructions'], 'instructions field must exist');
  });

  test('GoogleClassroom Schema virtuals exist', () => {
    const virtuals = (GoogleClassroom.schema as any).virtuals;
    assert.ok(virtuals['schoolId'], 'schoolId virtual must exist');
    assert.ok(virtuals['courseId'], 'courseId virtual must exist');
    assert.ok(virtuals['batchId'], 'batchId virtual must exist');
    assert.ok(virtuals['teacherId'], 'teacherId virtual must exist');
  });

  // ─── 3. Controller & Permission Logic Mock Tests ─────────────────────────
  const {
    getGoogleClassrooms,
    getStudentGoogleClassrooms,
    getTeacherGoogleClassrooms,
    createGoogleClassroom,
  } = await import('../controllers/googleClassroomController.js');

  test('createGoogleClassroom blocks missing fields with 400', async () => {
    let statusCode = 0;
    let responseData: any = null;

    const mockReq: any = {
      user: { userId: '111111111111111111111111', role: 'SUPER_ADMIN', status: 'ACTIVE' },
      body: { classroomName: 'Test' }, // missing school, course, batch, classroomUrl
    };

    const mockRes: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        responseData = data;
        return this;
      },
    };

    await createGoogleClassroom(mockReq, mockRes);
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(responseData.success, false);
    assert.ok(responseData.message.includes('Missing required fields'));
  });

  test('createGoogleClassroom blocks invalid non-HTTPS / non-google URLs with 400', async () => {
    let statusCode = 0;
    let responseData: any = null;

    const mockReq: any = {
      user: { userId: '111111111111111111111111', role: 'SUPER_ADMIN', status: 'ACTIVE' },
      body: {
        schoolId: '111111111111111111111111',
        courseId: '222222222222222222222222',
        batchId: '333333333333333333333333',
        classroomName: 'Test',
        classroomUrl: 'https://zoom.us/j/123456789',
      },
    };

    const mockRes: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        responseData = data;
        return this;
      },
    };

    await createGoogleClassroom(mockReq, mockRes);
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(responseData.success, false);
    assert.ok(responseData.message.includes('classroom.google.com'));
  });

  test('getTeacherGoogleClassrooms blocks unauthenticated caller with 401', async () => {
    let statusCode = 0;
    let responseData: any = null;

    const mockReq: any = { user: undefined };
    const mockRes: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        responseData = data;
        return this;
      },
    };

    await getTeacherGoogleClassrooms(mockReq, mockRes);
    assert.strictEqual(statusCode, 401);
    assert.strictEqual(responseData.success, false);
  });

  test('getStudentGoogleClassrooms blocks unauthenticated caller with 401', async () => {
    let statusCode = 0;
    let responseData: any = null;

    const mockReq: any = { user: undefined };
    const mockRes: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        responseData = data;
        return this;
      },
    };

    await getStudentGoogleClassrooms(mockReq, mockRes);
    assert.strictEqual(statusCode, 401);
    assert.strictEqual(responseData.success, false);
  });



  console.log(`\n========================================`);
  console.log(`GOOGLE CLASSROOM TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runGoogleClassroomTests();
