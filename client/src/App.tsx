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

// Dashboard Pages
import { SuperAdminDashboard } from './pages/admin/SuperAdminDashboard';
import { SuperAdminSchoolsPage } from './pages/admin/SuperAdminSchoolsPage';
import { SuperAdminCRMPage } from './pages/admin/SuperAdminCRMPage';
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
    location.pathname.startsWith('/student');

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
              <SchoolAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cms"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/certificates"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <CertificateVerificationPage />
            </ProtectedRoute>
          }
        />

        {/* School Admin Routes */}
        <Route
          path="/school"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/students"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/teachers"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/batches"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/attendance"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/certificates"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <CertificateVerificationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/notices"
          element={
            <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
              <SchoolAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/quizzes"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/schedule"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quizzes"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/certificates"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
              <StudentDashboard />
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
