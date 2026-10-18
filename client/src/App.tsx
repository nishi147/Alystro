import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PublicNavbar } from './components/layout/PublicNavbar';
import { PublicFooter } from './components/layout/PublicFooter';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { BookDemoModal } from './components/modals/BookDemoModal';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ProgramsPage } from './pages/public/ProgramsPage';
import { ProgramDetailPage } from './pages/public/ProgramDetailPage';
import { ForSchoolsPage } from './pages/public/ForSchoolsPage';
import { SchoolMicrositePage } from './pages/public/SchoolMicrositePage';
import { StudentProjectsPage } from './pages/public/StudentProjectsPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { CertificateVerificationPage } from './pages/public/CertificateVerificationPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ApplicationStatusPage } from './pages/public/ApplicationStatusPage';

import { SuperAdminDashboard } from './pages/admin/SuperAdminDashboard';
import { SuperAdminSchoolsPage } from './pages/admin/SuperAdminSchoolsPage';
import { SuperAdminCRMPage } from './pages/admin/SuperAdminCRMPage';
import { SuperAdminStudentsPage } from './pages/admin/SuperAdminStudentsPage';
import { SuperAdminCMSPage } from './pages/admin/SuperAdminCMSPage';
import { SuperAdminPricingPage } from './pages/admin/SuperAdminPricingPage';
import { AdminCertificatesPage } from './pages/admin/AdminCertificatesPage';
import { SchoolAdminDashboard } from './pages/school/SchoolAdminDashboard';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Critical Access Control: Pending or rejected applicants are routed to status page
  if (user && (user.status === 'PENDING_APPROVAL' || user.status === 'REJECTED')) {
    return <Navigate to="/application-status" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    const redirectMap: Record<string, string> = {
      SUPER_ADMIN: '/admin',
      ADMIN: '/admin',
      SCHOOL_ADMIN: '/school',
      TEACHER: '/teacher',
      STUDENT: '/student',
    };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const AppContent: React.FC = () => {
  const [globalDemoOpen, setGlobalDemoOpen] = useState(false);
  const location = useLocation();
  const isDashboardRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/school') ||
    location.pathname.startsWith('/teacher') ||
    location.pathname.startsWith('/student') ||
    location.pathname === '/application-status' ||
    location.pathname === '/register' ||
    location.pathname === '/login';

  return (
    <>
      {!isDashboardRoute && <PublicNavbar onOpenDemoModal={() => setGlobalDemoOpen(true)} />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/programs/:slug" element={<ProgramDetailPage />} />
        <Route path="/for-schools" element={<ForSchoolsPage />} />
        <Route path="/schools/:slug" element={<SchoolMicrositePage />} />
        <Route path="/projects" element={<StudentProjectsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/verify" element={<CertificateVerificationPage />} />
        <Route path="/verify/:certificateId" element={<CertificateVerificationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/application-status" element={<ApplicationStatusPage />} />
        <Route path="/forgot-password" element={<LoginPage />} />

        {/* Super Admin / Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schools"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <SuperAdminSchoolsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/crm"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <SuperAdminCRMPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <SuperAdminStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cms"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <SuperAdminCMSPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/certificates"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminCertificatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pricing"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <SuperAdminPricingPage />
            </ProtectedRoute>
          }
        />

        {/* School Admin Routes */}
        <Route
          path="/school"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard defaultTab="students" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/students"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard defaultTab="students" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/bulk-import"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard defaultTab="bulk-import" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/classes"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard defaultTab="classes" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/batches"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard defaultTab="batches" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/teachers"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard defaultTab="teachers" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/attendance"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard defaultTab="attendance" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/assignments"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard defaultTab="assignments" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/tests"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard defaultTab="tests" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/progress"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard defaultTab="progress" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/certificates"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard defaultTab="certificates" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/reports"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard defaultTab="reports" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/notices"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard defaultTab="notices" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/affiliations"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard defaultTab="affiliations" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/billing"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard defaultTab="billing" />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard defaultTab="overview" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/batches"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard defaultTab="batches" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/students"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard defaultTab="students" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/classes"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard defaultTab="classes" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard defaultTab="attendance" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/materials"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard defaultTab="materials" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard defaultTab="assignments" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/quizzes"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard defaultTab="quizzes" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/marks"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard defaultTab="marks" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/progress"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard defaultTab="progress" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/remarks"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard defaultTab="remarks" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/reports"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard defaultTab="reports" />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard defaultTab="overview" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/course"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard defaultTab="course" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/batch"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard defaultTab="batch" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/live-classes"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard defaultTab="live-classes" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/schedule"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard defaultTab="schedule" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/recordings"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard defaultTab="recordings" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/materials"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard defaultTab="materials" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard defaultTab="assignments" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quizzes"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard defaultTab="quizzes" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/marks"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard defaultTab="marks" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard defaultTab="attendance" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/progress"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard defaultTab="progress" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/projects"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard defaultTab="projects" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/certificates"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard defaultTab="certificates" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard defaultTab="profile" />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isDashboardRoute && <PublicFooter />}
      <BookDemoModal isOpen={globalDemoOpen} onClose={() => setGlobalDemoOpen(false)} />
    </>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
