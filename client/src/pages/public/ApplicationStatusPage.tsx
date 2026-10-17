import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Building2,
  GraduationCap,
  UserCheck,
  RefreshCw,
  LogOut,
  Mail,
  Phone,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CONTACT_INFO } from '../../config/contact';

export const ApplicationStatusPage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [details, setDetails] = useState<any>(null);

  const loadStatusDetails = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
      const res = await api.get('/auth/my-status');
      if (res.success && res.data) {
        setDetails(res.data);
      }
    } catch (e) {
      // User might be logged out or network error
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStatusDetails();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'SCHOOL_ADMIN':
        return 'School Partner / Institutional Tenant';
      case 'TEACHER':
        return 'Educator / Mentor Affiliation';
      case 'STUDENT':
        return 'Student Learning Enrollment';
      default:
        return 'User Account';
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'SCHOOL_ADMIN':
        return <Building2 className="w-5 h-5 text-brand-600" />;
      case 'TEACHER':
        return <UserCheck className="w-5 h-5 text-emerald-600" />;
      case 'STUDENT':
        return <GraduationCap className="w-5 h-5 text-purple-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-brand-600" />;
    }
  };

  const isApproved = user?.status === 'ACTIVE';
  const isRejected = user?.status === 'REJECTED';
  const isPending = user?.status === 'PENDING_APPROVAL' || (!isApproved && !isRejected);

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return '/admin';
    if (user.role === 'SCHOOL_ADMIN') return '/school';
    if (user.role === 'TEACHER') return '/teacher';
    return '/student';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-cyan flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-lg font-black text-navy-950 font-display">ALYSTRO</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-slate-800">{user?.name || 'Applicant'}</p>
            <p className="text-[11px] text-slate-400">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-3.5 h-3.5 text-slate-500" />}
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Status Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                  {getRoleIcon(user?.role)}
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-1 bg-slate-100 text-slate-600">
                    {getRoleLabel(user?.role)}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-navy-950 font-display">
                    Application Tracking & Status
                  </h1>
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-center">
                {isApproved && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Approved & Active
                  </span>
                )}
                {isPending && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs animate-pulse">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Pending Verification
                  </span>
                )}
                {isRejected && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Not Approved
                  </span>
                )}
              </div>
            </div>

            {/* Stepper / Timeline */}
            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs mb-1.5 shadow-xs">
                  ✓
                </div>
                <span className="font-bold text-slate-800">1. Submitted</span>
                <span className="text-[10px] text-slate-400">Details Received</span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 shadow-xs ${
                    isApproved
                      ? 'bg-emerald-500 text-white'
                      : isRejected
                      ? 'bg-rose-500 text-white'
                      : 'bg-brand-600 text-white ring-4 ring-brand-100 animate-pulse'
                  }`}
                >
                  {isApproved ? '✓' : isRejected ? '✕' : '2'}
                </div>
                <span className="font-bold text-slate-800">2. Academic Review</span>
                <span className="text-[10px] text-slate-400">
                  {isApproved ? 'Verified' : isRejected ? 'Reviewed' : 'Under Assessment'}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 shadow-xs ${
                    isApproved
                      ? 'bg-emerald-500 text-white'
                      : isRejected
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isApproved ? '✓' : isRejected ? '✕' : '3'}
                </div>
                <span className="font-bold text-slate-800">3. Workspace Access</span>
                <span className="text-[10px] text-slate-400">
                  {isApproved ? 'Ready' : isRejected ? 'Restricted' : 'Awaiting Approval'}
                </span>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Approved State Banner */}
            {isApproved && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm">Congratulations! Your account is verified.</h3>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Your credentials have been validated. You now have full access to your role-based academic tools and courses.
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="w-full sm:w-auto font-bold bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => navigate(getDashboardPath())}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Enter Your Dashboard
                </Button>
              </div>
            )}

            {/* Pending State Banner */}
            {isPending && (
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 space-y-2">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm">Under Review by Administrator</h3>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      To protect school data privacy and maintain academic integrity, new registrations require manual authorization by ALYSTRO Super Administrators or your designated Partner School Authority before learning materials, batches, and student records can be unlocked.
                    </p>
                    <p className="text-[11px] text-amber-700 mt-2 font-semibold">
                      ⏱ Typical review turnaround: 24 to 48 hours.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rejected State Banner */}
            {isRejected && (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm">Application Not Approved</h3>
                    <p className="text-xs text-rose-800 mt-1">
                      Reason: <strong className="font-bold">{user?.rejectionReason || 'Application details could not be validated.'}</strong>
                    </p>
                    <p className="text-[11px] text-rose-700 mt-2">
                      If you believe this decision was made in error or wish to provide updated documentation, please contact our academic onboarding desk at{' '}
                      <a href={CONTACT_INFO.mailtoEmail} className="font-bold underline hover:text-rose-900">
                        {CONTACT_INFO.officialEmail}
                      </a>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Registration Summary Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Submitted Registration Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-slate-600">
                <div>
                  <span className="block text-[10px] uppercase text-slate-400 font-semibold">Applicant Name</span>
                  <span className="font-bold text-slate-900">{user?.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-400 font-semibold">Registered Email</span>
                  <span className="font-bold text-slate-900">{user?.email}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-400 font-semibold">Role Applied</span>
                  <span className="font-bold text-slate-900">{getRoleLabel(user?.role)}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-400 font-semibold">Associated School</span>
                  <span className="font-bold text-slate-900">
                    {user?.school?.name ||
                      details?.application?.schoolName ||
                      user?.proposedSchoolName ||
                      'Independent / Unlisted'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={loadStatusDetails}
                isLoading={isRefreshing}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto"
              >
                Refresh Approval Status
              </Button>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>Need assistance?</span>
                <a
                  href={CONTACT_INFO.mailtoEmail}
                  className="font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {CONTACT_INFO.officialEmail}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} ALYSTRO. Multi-Tenant Role-Based Access Protection.
      </footer>
    </div>
  );
};
