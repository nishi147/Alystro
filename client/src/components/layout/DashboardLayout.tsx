import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  CalendarCheck,
  FileText,
  HelpCircle,
  Award,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  BookOpen,
  PieChart,
  Layers,
  Settings,
  UserCheck,
  CheckSquare,
  Shield,
  ArrowRightLeft,
  DollarSign,
  CreditCard,
  FileSpreadsheet,
  Download,
  Video,
  PlayCircle,
  FolderDown,
  User,
  Clock,
  MessageSquare,
  BarChart2,
  Upload,
  ClipboardList,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic Navigation Items based on Role
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
          { name: 'Schools Directory', path: '/admin/schools', icon: <Building2 className="w-5 h-5" /> },
          { name: 'CRM & Demos', path: '/admin/crm', icon: <Users className="w-5 h-5" /> },
          { name: 'Pricing & Billing', path: '/admin/pricing', icon: <DollarSign className="w-5 h-5" /> },
          { name: 'All Students', path: '/admin/students', icon: <GraduationCap className="w-5 h-5" /> },
          { name: 'Programs & CMS', path: '/admin/cms', icon: <BookOpen className="w-5 h-5" /> },
          { name: 'Certificates', path: '/admin/certificates', icon: <Award className="w-5 h-5" /> },
        ];
      case 'SCHOOL_ADMIN':
        return [
          { name: 'School Overview', path: '/school', icon: <LayoutDashboard className="w-5 h-5" /> },
          { name: 'Students & Roster', path: '/school/students', icon: <GraduationCap className="w-5 h-5" /> },
          { name: 'Bulk Import', path: '/school/bulk-import', icon: <FileSpreadsheet className="w-5 h-5" /> },
          { name: 'Classes Management', path: '/school/classes', icon: <BookOpen className="w-5 h-5" /> },
          { name: 'Batches & Timetable', path: '/school/batches', icon: <Layers className="w-5 h-5" /> },
          { name: 'Teachers & Mentors', path: '/school/teachers', icon: <UserCheck className="w-5 h-5" /> },
          { name: 'Attendance Register', path: '/school/attendance', icon: <CalendarCheck className="w-5 h-5" /> },
          { name: 'Assignments & Projects', path: '/school/assignments', icon: <FileText className="w-5 h-5" /> },
          { name: 'Tests & Results', path: '/school/tests', icon: <CheckSquare className="w-5 h-5" /> },
          { name: 'Student Progress', path: '/school/progress', icon: <PieChart className="w-5 h-5" /> },
          { name: 'Certificates', path: '/school/certificates', icon: <Award className="w-5 h-5" /> },
          { name: 'Reports Hub', path: '/school/reports', icon: <Download className="w-5 h-5" /> },
          { name: 'Notice Board', path: '/school/notices', icon: <Bell className="w-5 h-5" /> },
          { name: 'Commercials & Billing', path: '/school/billing', icon: <CreditCard className="w-5 h-5" /> },
        ];
      case 'TEACHER':
        return [
          { name: 'Mentor Dashboard', path: '/teacher', icon: <LayoutDashboard className="w-5 h-5" /> },
          { name: 'Assigned Batches', path: '/teacher/batches', icon: <Layers className="w-5 h-5" /> },
          { name: 'My Students', path: '/teacher/students', icon: <GraduationCap className="w-5 h-5" /> },
          { name: "Today's Classes", path: '/teacher/classes', icon: <Video className="w-5 h-5" /> },
          { name: 'Attendance', path: '/teacher/attendance', icon: <CalendarCheck className="w-5 h-5" /> },
          { name: 'Study Materials', path: '/teacher/materials', icon: <Upload className="w-5 h-5" /> },
          { name: 'Assignments', path: '/teacher/assignments', icon: <FileText className="w-5 h-5" /> },
          { name: 'Tests & Quizzes', path: '/teacher/quizzes', icon: <CheckSquare className="w-5 h-5" /> },
          { name: 'Marks & Results', path: '/teacher/marks', icon: <Award className="w-5 h-5" /> },
          { name: 'Student Progress', path: '/teacher/progress', icon: <TrendingUp className="w-5 h-5" /> },
          { name: 'Remarks', path: '/teacher/remarks', icon: <MessageSquare className="w-5 h-5" /> },
          { name: 'Reports', path: '/teacher/reports', icon: <BarChart2 className="w-5 h-5" /> },
        ];
      case 'STUDENT':
        return [
          { name: 'My Learning Portal', path: '/student', icon: <LayoutDashboard className="w-5 h-5" /> },
          { name: 'My Course', path: '/student/course', icon: <BookOpen className="w-5 h-5" /> },
          { name: 'My Batch', path: '/student/batch', icon: <Layers className="w-5 h-5" /> },
          { name: 'Live Classes', path: '/student/live-classes', icon: <Video className="w-5 h-5" /> },
          { name: 'Class Schedule', path: '/student/schedule', icon: <CalendarCheck className="w-5 h-5" /> },
          { name: 'Recorded Classes', path: '/student/recordings', icon: <PlayCircle className="w-5 h-5" /> },
          { name: 'Study Materials', path: '/student/materials', icon: <FolderDown className="w-5 h-5" /> },
          { name: 'Assignments', path: '/student/assignments', icon: <FileText className="w-5 h-5" /> },
          { name: 'Tests / Quizzes', path: '/student/quizzes', icon: <CheckSquare className="w-5 h-5" /> },
          { name: 'Marks & Results', path: '/student/marks', icon: <Award className="w-5 h-5" /> },
          { name: 'Attendance Register', path: '/student/attendance', icon: <UserCheck className="w-5 h-5" /> },
          { name: 'Academic Progress', path: '/student/progress', icon: <PieChart className="w-5 h-5" /> },
          { name: 'Capstone Projects', path: '/student/projects', icon: <Sparkles className="w-5 h-5" /> },
          { name: 'My Certificates', path: '/student/certificates', icon: <Award className="w-5 h-5" /> },
          { name: 'Student Profile', path: '/student/profile', icon: <User className="w-5 h-5" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();


  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    ADMIN: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    SCHOOL_ADMIN: 'bg-blue-100 text-blue-800 border-blue-200',
    TEACHER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    STUDENT: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-navy-950 text-slate-200 flex flex-col justify-between border-r border-navy-850 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Logo & Platform Info */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-navy-850">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-500/25">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white font-display">ALYSTRO</span>
                <span className="text-[10px] uppercase tracking-wider text-brand-300 font-medium -mt-1">
                  Management SaaS
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User School Identity Badge if attached */}
          {user?.school && (
            <div className="mx-4 mt-4 p-3 bg-navy-900/80 rounded-xl border border-navy-800 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-brand-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {typeof user.school === 'object' ? user.school.name : 'Partner School'}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Active Tenant</p>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 mt-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                      : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile & Sign out */}
        <div className="p-4 border-t border-navy-850 bg-navy-950/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-sm shrink-0 border border-brand-500/30">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <Link
            to="/"
            className="text-[11px] text-brand-300 hover:text-brand-200 block text-center font-medium py-1"
          >
            ← Back to Public Website
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 font-display capitalize">
                {location.pathname.split('/')[2] || 'Dashboard'}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                ALYSTRO Unified EdTech & School Management Platform
              </p>
            </div>
          </div>

          {/* Authenticated User Role Badge */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition shadow-sm ${
                role ? roleColors[role] || 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Role: {role ? role.replace('_', ' ') : 'Guest'}</span>
            </span>

            <Link to="/verify">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs">
                <Award className="w-3.5 h-3.5 text-brand-500 mr-1.5" />
                Verify Cert
              </Button>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
