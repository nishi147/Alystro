import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Building2,
  GraduationCap,
  UserCheck,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type RegistrationRole = 'school' | 'teacher' | 'student';

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<RegistrationRole>('school');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [approvedSchools, setApprovedSchools] = useState<any[]>([]);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  // Load public approved schools for teacher/student dropdowns
  useEffect(() => {
    const loadSchools = async () => {
      try {
        const res = await api.get('/schools/public-list');
        if (res.success && Array.isArray(res.data)) {
          setApprovedSchools(res.data);
        }
      } catch (e) {
        // Fallback gracefully
      }
    };
    loadSchools();
  }, []);

  // School Form State
  const [schoolData, setSchoolData] = useState({
    schoolName: '',
    schoolEmail: '',
    schoolPhone: '',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: '',
    contactPersonName: '',
    contactPersonDesignation: 'Principal',
    studentCount: 500,
    classesOffered: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    interestedPrograms: ['Artificial Intelligence & Python', 'Robotics & IoT'],
    website: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  // Teacher Form State
  const [teacherData, setTeacherData] = useState({
    name: '',
    email: '',
    phone: '',
    schoolId: '',
    isUnlistedSchool: false,
    unlistedSchoolName: '',
    unlistedSchoolCity: '',
    unlistedSchoolState: '',
    qualification: 'M.Sc. / B.Ed. Computer Science',
    experienceYears: 3,
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  // Student Form State
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    schoolId: '',
    isUnlistedSchool: false,
    unlistedSchoolName: '',
    unlistedSchoolCity: '',
    unlistedSchoolState: '',
    grade: 'Class 8',
    programInterest: 'Foundations of AI & Practical Coding',
    parentName: '',
    parentPhone: '',
    enrollmentCode: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (schoolData.password !== schoolData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!schoolData.termsAccepted) {
      setErrorMessage('Please accept the Terms of Service & Privacy Policy to register.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/register/school', schoolData);
      if (res.success && res.data?.token) {
        localStorage.setItem('alystro_token', res.data.token);
        await refreshUser();
        setSuccessMessage('School application submitted! Redirecting to application tracking...');
        setTimeout(() => {
          navigate('/application-status');
        }, 1000);
      } else {
        setErrorMessage(res.message || 'School registration failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (teacherData.password !== teacherData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!teacherData.termsAccepted) {
      setErrorMessage('Please accept the Terms of Service & Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/register/teacher', teacherData);
      if (res.success && res.data?.token) {
        localStorage.setItem('alystro_token', res.data.token);
        await refreshUser();
        setSuccessMessage('Teacher registration submitted! Redirecting to application tracking...');
        setTimeout(() => {
          navigate('/application-status');
        }, 1000);
      } else {
        setErrorMessage(res.message || 'Teacher registration failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (studentData.password !== studentData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!studentData.termsAccepted) {
      setErrorMessage('Please accept the Terms of Service & Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/register/student', studentData);
      if (res.success && res.data?.token) {
        localStorage.setItem('alystro_token', res.data.token);
        await refreshUser();
        setSuccessMessage('Student registration successful! Redirecting to student dashboard...');
        setTimeout(() => {
          navigate(res.data?.dashboardPath || '/student');
        }, 1000);
      } else {
        setErrorMessage(res.message || 'Student registration failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const schoolOptions = approvedSchools.map((s) => ({
    value: s._id,
    label: `${s.name} (${s.code || s.city})`,
  }));

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-cyan flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-navy-950 font-display">ALYSTRO</span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display">
          Create Your ALYSTRO Account
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Join our future-skills academic network. Select your registration type below to get started.
        </p>

        {/* Role Selector Tabs */}
        <div className="mt-6 flex p-1.5 bg-slate-200/80 rounded-2xl max-w-lg mx-auto border border-slate-300/60 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setRole('school');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              role === 'school'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>School Partner</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('teacher');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              role === 'teacher'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Educator / Mentor</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('student');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              role === 'student'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student</span>
          </button>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-soft">
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. School Registration Form */}
          {role === 'school' && (
            <form onSubmit={handleSchoolSubmit} className="space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h3 className="text-base font-bold text-navy-950">School & Institutional Details</h3>
                <p className="text-xs text-slate-500">Provide verified details for multi-tenant campus provisioning.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="School Name"
                  required
                  placeholder="e.g. St. Xavier's International"
                  leftIcon={<Building2 className="w-4 h-4" />}
                  value={schoolData.schoolName}
                  onChange={(e) => setSchoolData({ ...schoolData, schoolName: e.target.value })}
                />
                <Input
                  label="Official School Email"
                  type="email"
                  required
                  placeholder="admin@school.edu"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={schoolData.schoolEmail}
                  onChange={(e) => setSchoolData({ ...schoolData, schoolEmail: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="School Phone / Landline"
                  required
                  placeholder="+91 98290 12345"
                  leftIcon={<Phone className="w-4 h-4" />}
                  value={schoolData.schoolPhone}
                  onChange={(e) => setSchoolData({ ...schoolData, schoolPhone: e.target.value })}
                />
                <Input
                  label="Estimated Student Strength"
                  type="number"
                  min={10}
                  placeholder="500"
                  value={schoolData.studentCount}
                  onChange={(e) => setSchoolData({ ...schoolData, studentCount: parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  required
                  placeholder="Jaipur"
                  value={schoolData.city}
                  onChange={(e) => setSchoolData({ ...schoolData, city: e.target.value })}
                />
                <Input
                  label="State"
                  required
                  placeholder="Rajasthan"
                  value={schoolData.state}
                  onChange={(e) => setSchoolData({ ...schoolData, state: e.target.value })}
                />
              </div>

              <Input
                label="Full Campus Address"
                required
                placeholder="Plot 42, Knowledge Park, Sector 12"
                leftIcon={<MapPin className="w-4 h-4" />}
                value={schoolData.address}
                onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
              />

              <div className="border-b border-slate-100 pb-3 pt-2">
                <h3 className="text-base font-bold text-navy-950">Primary Contact Person & Login Credentials</h3>
                <p className="text-xs text-slate-500">This individual will be provisioned as the initial School Admin.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Person Name"
                  required
                  placeholder="Dr. S. K. Jain"
                  value={schoolData.contactPersonName}
                  onChange={(e) => setSchoolData({ ...schoolData, contactPersonName: e.target.value })}
                />
                <Input
                  label="Designation"
                  required
                  placeholder="Principal / Director"
                  value={schoolData.contactPersonDesignation}
                  onChange={(e) => setSchoolData({ ...schoolData, contactPersonDesignation: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Admin Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    leftIcon={<Lock className="w-4 h-4" />}
                    value={schoolData.password}
                    onChange={(e) => setSchoolData({ ...schoolData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-8 right-3 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={schoolData.confirmPassword}
                  onChange={(e) => setSchoolData({ ...schoolData, confirmPassword: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start text-xs text-slate-600 gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schoolData.termsAccepted}
                    onChange={(e) => setSchoolData({ ...schoolData, termsAccepted: e.target.checked })}
                    className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                    required
                  />
                  <span>
                    I confirm that I am authorized to represent this institution and agree to ALYSTRO's{' '}
                    <Link to="/about" className="text-brand-600 font-semibold underline">Terms of Service</Link>{' '}
                    and Privacy Standards.
                  </span>
                </label>
              </div>

              <Button type="submit" variant="primary" className="w-full py-3 font-bold mt-3" isLoading={isLoading}>
                Submit School Partnership Application
              </Button>
            </form>
          )}

          {/* 2. Teacher Registration Form */}
          {role === 'teacher' && (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h3 className="text-base font-bold text-navy-950">Educator & Mentor Registration</h3>
                <p className="text-xs text-slate-500">Register to lead hands-on AI & future skill cohorts.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  placeholder="e.g. Rohit Verma"
                  value={teacherData.name}
                  onChange={(e) => setTeacherData({ ...teacherData, name: e.target.value })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="mentor@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={teacherData.email}
                  onChange={(e) => setTeacherData({ ...teacherData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  placeholder="+91 98290 12001"
                  leftIcon={<Phone className="w-4 h-4" />}
                  value={teacherData.phone}
                  onChange={(e) => setTeacherData({ ...teacherData, phone: e.target.value })}
                />
                <Input
                  label="Qualification / Specialization"
                  placeholder="e.g. B.Tech / MCA in Computer Science"
                  value={teacherData.qualification}
                  onChange={(e) => setTeacherData({ ...teacherData, qualification: e.target.value })}
                />
              </div>

              {/* School Affiliation Selector */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Partner School Affiliation
                </h4>
                {!teacherData.isUnlistedSchool ? (
                  <div>
                    <Select
                      label="Select Approved Partner School"
                      value={teacherData.schoolId}
                      onChange={(e) => setTeacherData({ ...teacherData, schoolId: e.target.value })}
                      options={[
                        { value: '', label: '-- Select from Partner Schools List --' },
                        ...schoolOptions,
                      ]}
                    />
                    <button
                      type="button"
                      onClick={() => setTeacherData({ ...teacherData, isUnlistedSchool: true, schoolId: '' })}
                      className="text-xs text-brand-600 hover:underline font-semibold mt-2 inline-block"
                    >
                      + My school is not listed (Enter school manually)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      label="School Name"
                      required
                      placeholder="e.g. Modern Public School"
                      value={teacherData.unlistedSchoolName}
                      onChange={(e) => setTeacherData({ ...teacherData, unlistedSchoolName: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="City"
                        required
                        placeholder="e.g. Jaipur"
                        value={teacherData.unlistedSchoolCity}
                        onChange={(e) => setTeacherData({ ...teacherData, unlistedSchoolCity: e.target.value })}
                      />
                      <Input
                        label="State"
                        required
                        placeholder="e.g. Rajasthan"
                        value={teacherData.unlistedSchoolState}
                        onChange={(e) => setTeacherData({ ...teacherData, unlistedSchoolState: e.target.value })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setTeacherData({ ...teacherData, isUnlistedSchool: false })}
                      className="text-xs text-slate-500 hover:underline mt-1 inline-block"
                    >
                      ← Return to select from registered schools
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    leftIcon={<Lock className="w-4 h-4" />}
                    value={teacherData.password}
                    onChange={(e) => setTeacherData({ ...teacherData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-8 right-3 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={teacherData.confirmPassword}
                  onChange={(e) => setTeacherData({ ...teacherData, confirmPassword: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start text-xs text-slate-600 gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teacherData.termsAccepted}
                    onChange={(e) => setTeacherData({ ...teacherData, termsAccepted: e.target.checked })}
                    className="mt-0.5 rounded text-brand-600"
                    required
                  />
                  <span>
                    I agree to the Instructor Honor Code, student privacy policies, and institutional affiliation terms.
                  </span>
                </label>
              </div>

              <Button type="submit" variant="primary" className="w-full py-3 font-bold mt-3" isLoading={isLoading}>
                Submit Mentor Registration
              </Button>
            </form>
          )}

          {/* 3. Student Registration Form */}
          {role === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h3 className="text-base font-bold text-navy-950">Student Learning Enrollment</h3>
                <p className="text-xs text-slate-500">Sign up for hands-on future skill courses and verified certification.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Student Full Name"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={studentData.name}
                  onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                />
                <Input
                  label="Student Email Address"
                  type="email"
                  required
                  placeholder="student@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={studentData.email}
                  onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                />
              </div>

              {/* School Affiliation */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Select Your School
                </h4>
                {!studentData.isUnlistedSchool ? (
                  <div>
                    <Select
                      label="Select Partner School"
                      value={studentData.schoolId}
                      onChange={(e) => setStudentData({ ...studentData, schoolId: e.target.value })}
                      options={[
                        { value: '', label: '-- Select from Partner Schools List --' },
                        ...schoolOptions,
                      ]}
                    />
                    <button
                      type="button"
                      onClick={() => setStudentData({ ...studentData, isUnlistedSchool: true, schoolId: '' })}
                      className="text-xs text-brand-600 hover:underline font-semibold mt-2 inline-block"
                    >
                      + My school is not listed (Enter school manually)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      label="School Name"
                      required
                      placeholder="e.g. Delhi Public School"
                      value={studentData.unlistedSchoolName}
                      onChange={(e) => setStudentData({ ...studentData, unlistedSchoolName: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="City"
                        required
                        placeholder="e.g. Jaipur"
                        value={studentData.unlistedSchoolCity}
                        onChange={(e) => setStudentData({ ...studentData, unlistedSchoolCity: e.target.value })}
                      />
                      <Input
                        label="State"
                        required
                        placeholder="e.g. Rajasthan"
                        value={studentData.unlistedSchoolState}
                        onChange={(e) => setStudentData({ ...studentData, unlistedSchoolState: e.target.value })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setStudentData({ ...studentData, isUnlistedSchool: false })}
                      className="text-xs text-slate-500 hover:underline mt-1 inline-block"
                    >
                      ← Return to select from registered schools
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Grade / Class"
                  value={studentData.grade}
                  onChange={(e) => setStudentData({ ...studentData, grade: e.target.value })}
                  options={[
                    { value: 'Class 6', label: 'Class 6' },
                    { value: 'Class 7', label: 'Class 7' },
                    { value: 'Class 8', label: 'Class 8' },
                    { value: 'Class 9', label: 'Class 9' },
                    { value: 'Class 10', label: 'Class 10' },
                    { value: 'Class 11', label: 'Class 11' },
                    { value: 'Class 12', label: 'Class 12' },
                  ]}
                />
                <Input
                  label="Optional Enrollment Code"
                  placeholder="e.g. ENR-904 (if provided by teacher)"
                  value={studentData.enrollmentCode}
                  onChange={(e) => setStudentData({ ...studentData, enrollmentCode: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Parent / Guardian Name"
                  placeholder="Mr. Sharma"
                  value={studentData.parentName}
                  onChange={(e) => setStudentData({ ...studentData, parentName: e.target.value })}
                />
                <Input
                  label="Parent Phone"
                  placeholder="+91 98290 12002"
                  value={studentData.parentPhone}
                  onChange={(e) => setStudentData({ ...studentData, parentPhone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    leftIcon={<Lock className="w-4 h-4" />}
                    value={studentData.password}
                    onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-8 right-3 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={studentData.confirmPassword}
                  onChange={(e) => setStudentData({ ...studentData, confirmPassword: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start text-xs text-slate-600 gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={studentData.termsAccepted}
                    onChange={(e) => setStudentData({ ...studentData, termsAccepted: e.target.checked })}
                    className="mt-0.5 rounded text-brand-600"
                    required
                  />
                  <span>
                    I confirm parent/guardian knowledge and consent to ALYSTRO terms of learning and student data safety.
                  </span>
                </label>
              </div>

              <Button type="submit" variant="primary" className="w-full py-3 font-bold mt-3" isLoading={isLoading}>
                Submit Student Registration
              </Button>
            </form>
          )}

          {/* Bottom helper */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Already registered with an active or pending account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold underline">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
