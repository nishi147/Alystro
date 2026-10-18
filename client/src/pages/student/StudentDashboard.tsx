import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Upload,
  Sparkles,
  CheckSquare,
  HelpCircle,
  Video,
  PlayCircle,
  FolderDown,
  User,
  Users,
  Layers,
  CalendarCheck,
  PieChart,
  UserCheck,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Edit2,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  ChevronRight,
  Filter,
  Search,
  Check,
  X,
  Play,
  Share2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { api } from '../../services/api';
import { Assignment, Quiz, Certificate } from '../../types';
import { useAuth } from '../../context/AuthContext';

export type StudentTab =
  | 'overview'
  | 'course'
  | 'batch'
  | 'live-classes'
  | 'schedule'
  | 'recordings'
  | 'materials'
  | 'assignments'
  | 'quizzes'
  | 'marks'
  | 'attendance'
  | 'progress'
  | 'projects'
  | 'certificates'
  | 'profile';

interface StudentDashboardProps {
  defaultTab?: StudentTab;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ defaultTab = 'overview' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<StudentTab>(defaultTab);

  // Core Data States
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [batchData, setBatchData] = useState<any>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync tab with props
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Modals
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quiz Taking Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizTimer, setQuizTimer] = useState<number>(0);
  const [quizResult, setQuizResult] = useState<any | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Video Player Modal
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeRecording, setActiveRecording] = useState<any | null>(null);

  // Edit Profile Modal
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    avatar: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Google Classroom launch handler
  const [classroomModalOpen, setClassroomModalOpen] = useState(false);
  const [classroomInfo, setClassroomInfo] = useState<any | null>(null);
  const [isCheckingClassroom, setIsCheckingClassroom] = useState(false);

  const handleJoinClassroom = async () => {
    setIsCheckingClassroom(true);
    try {
      const res = await api.get('/students/me/classroom');
      if (res.success && res.configured && res.data?.googleClassroomUrl) {
        window.open(res.data.googleClassroomUrl, '_blank', 'noopener,noreferrer');
      } else {
        setClassroomInfo(res.data || { message: res.message });
        setClassroomModalOpen(true);
      }
    } catch (err: any) {
      setClassroomInfo({ message: err.message || 'Google Classroom link has not been added yet.' });
      setClassroomModalOpen(true);
    } finally {
      setIsCheckingClassroom(false);
    }
  };

  // Filters & Search
  const [materialCategory, setMaterialCategory] = useState('ALL');
  const [materialSearch, setMaterialSearch] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('ALL');
  const [scheduleDay, setScheduleDay] = useState('ALL');

  // Load all student data
  const loadData = async () => {
    try {
      const [
        profRes,
        batchRes,
        courseRes,
        liveRes,
        recRes,
        matRes,
        asgRes,
        quizRes,
        certRes,
        attRes,
        progRes,
      ] = await Promise.all([
        api.get('/students/me/profile').catch(() => ({ success: false })),
        api.get('/students/me/batch').catch(() => ({ success: false })),
        api.get('/students/me/course').catch(() => ({ success: false })),
        api.get('/students/me/live-classes').catch(() => ({ success: false })),
        api.get('/students/me/recordings').catch(() => ({ success: false })),
        api.get('/students/me/materials').catch(() => ({ success: false })),
        api.get('/assignments').catch(() => ({ success: false })),
        api.get('/quizzes').catch(() => ({ success: false })),
        api.get('/certificates').catch(() => ({ success: false })),
        api.get('/attendance/student/self').catch(() => ({ success: false })),
        api.get('/students/me/progress').catch(() => ({ success: false })),
      ]);

      if (profRes.success && profRes.data) {
        setStudentProfile(profRes.data);
        setProfileForm({
          avatar: profRes.data.user?.avatar || '',
          phone: profRes.data.user?.phone || '',
          parentName: profRes.data.parentName || '',
          parentPhone: profRes.data.parentPhone || '',
          parentEmail: profRes.data.parentEmail || '',
        });
      }
      if (batchRes.success) setBatchData(batchRes.data);
      if (courseRes.success) setCourseData(courseRes.data);
      if (liveRes.success) setLiveSessions(liveRes.data || []);
      if (recRes.success) setRecordings(recRes.data || []);
      if (matRes.success) setMaterials(matRes.data || []);
      if (asgRes.success) setAssignments(asgRes.data || []);
      if (quizRes.success) setQuizzes(quizRes.data || []);
      if (certRes.success) setCertificates(certRes.data || []);
      if (attRes.success) setAttendanceData(attRes.data);
      if (progRes.success) setProgressData(progRes.data);
    } catch (err) {
      console.error('Error loading student dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quiz Timer Countdown
  useEffect(() => {
    if (!quizModalOpen || quizResult || quizTimer <= 0) return;
    const interval = setInterval(() => {
      setQuizTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quizModalOpen, quizResult, quizTimer]);

  // ==================== HANDLERS ====================

  const handleOpenSubmit = (asg: Assignment) => {
    setSelectedAssignment(asg);
    setSubmissionUrl(asg.userSubmission?.fileUrl || '');
    setSubmissionNotes(asg.userSubmission?.notes || '');
    setSubmitModalOpen(true);
  };

  const handleSendSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/assignments/${selectedAssignment._id}/submit`, {
        fileUrl: submissionUrl,
        notes: submissionNotes,
      });
      if (res.success) {
        setSubmitModalOpen(false);
        await loadData();
        alert('Work submitted successfully! Your mentor will evaluate it.');
      } else {
        alert(res.message || 'Failed to submit assignment.');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartQuiz = (q: Quiz) => {
    setActiveQuiz(q);
    setSelectedAnswers(new Array(q.questions?.length || 0).fill(-1));
    setQuizResult(null);
    setQuizTimer((q.durationMinutes || 20) * 60);
    setQuizModalOpen(true);
  };

  const handleAnswerSelect = (qIdx: number, optIdx: number) => {
    const updated = [...selectedAnswers];
    updated[qIdx] = optIdx;
    setSelectedAnswers(updated);
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsSubmittingQuiz(true);
    try {
      const res = await api.post(`/quizzes/${activeQuiz._id}/attempt`, {
        answers: selectedAnswers,
      });
      if (res.success) {
        setQuizResult(res.data);
        await loadData();
      } else {
        alert(res.message || 'Error scoring quiz.');
      }
    } catch (err: any) {
      alert(err.message || 'Error scoring quiz.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await api.put('/students/me/profile', profileForm);
      if (res.success) {
        setEditProfileModalOpen(false);
        await loadData();
        alert('Profile updated successfully.');
      } else {
        alert(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Filtered Study Materials
  const filteredMaterials = materials.filter((m) => {
    if (materialCategory !== 'ALL' && m.category !== materialCategory) return false;
    if (
      materialSearch &&
      !m.title.toLowerCase().includes(materialSearch.toLowerCase()) &&
      !m.description.toLowerCase().includes(materialSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Filtered Assignments
  const filteredAssignments = assignments.filter((a) => {
    if (assignmentFilter === 'PENDING') return !a.userSubmission;
    if (assignmentFilter === 'SUBMITTED') return a.userSubmission?.status === 'SUBMITTED';
    if (assignmentFilter === 'GRADED') return a.userSubmission?.status === 'GRADED';
    return true;
  });

  // Projects (Assignments marked as Project / Capstone or high totalMarks)
  const projectAssignments = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes('project') ||
      a.title.toLowerCase().includes('capstone') ||
      (a.totalMarks && a.totalMarks >= 100)
  );

  return (
    <div className="space-y-8">
      {/* Top Banner & Student Identity */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-brand-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-glow opacity-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-500/20 text-brand-300 border border-brand-400/30">
                {studentProfile?.grade || 'STEM Scholar'} • Sec {studentProfile?.section || 'A'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Roll: {studentProfile?.rollNumber || 'N/A'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
              {studentProfile?.school?.name || 'Partner School'} • {studentProfile?.program?.name || 'STEM & AI Program'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('profile')}
              leftIcon={<User className="w-4 h-4 text-brand-300" />}
              className="text-white border-white/20 hover:bg-white/10"
            >
              My Profile
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveTab('live-classes')}
              leftIcon={<Video className="w-4 h-4" />}
            >
              Join Live Class
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-b border-slate-200 overflow-x-auto scrollbar-thin">
        <div className="flex space-x-1 sm:space-x-2 min-w-max pb-1">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'course', label: 'My Course', icon: BookOpen },
            { id: 'batch', label: 'My Batch', icon: Layers },
            { id: 'live-classes', label: 'Live Classes', icon: Video },
            { id: 'schedule', label: 'Schedule', icon: CalendarCheck },
            { id: 'recordings', label: 'Recorded Classes', icon: PlayCircle },
            { id: 'materials', label: 'Study Materials', icon: FolderDown },
            { id: 'assignments', label: `Assignments (${assignments.length})`, icon: FileText },
            { id: 'quizzes', label: `Tests & Quizzes (${quizzes.length})`, icon: CheckSquare },
            { id: 'marks', label: 'Marks & Results', icon: Award },
            { id: 'attendance', label: 'Attendance', icon: UserCheck },
            { id: 'progress', label: 'Academic Progress', icon: PieChart },
            { id: 'projects', label: `Projects (${projectAssignments.length})`, icon: Sparkles },
            { id: 'certificates', label: `Certificates (${certificates.length})`, icon: Award },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as StudentTab)}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 rounded-t-lg ${
                  isActive
                    ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 0: OVERVIEW                                           */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Class Attendance</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display mt-2">
                {attendanceData?.hasSessions ? `${attendanceData.attendanceRate}%` : 'N/A'}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                {attendanceData?.hasSessions
                  ? `${attendanceData.presentSessions} of ${attendanceData.totalSessions} sessions`
                  : 'No recorded sessions yet'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assignments Completed</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display mt-2">
                {assignments.filter((a) => a.userSubmission).length} / {assignments.length}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Homework & Practical Labs</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quizzes Attempted</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display mt-2">
                {quizzes.filter((q) => q.userResult).length} / {quizzes.length}
              </p>
              <p className="text-[11px] text-brand-600 font-semibold mt-1">Knowledge Checkpoints</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Issued Certificates</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display mt-2">
                {certificates.length}
              </p>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">Verified Credentials</p>
            </div>
          </div>

          {/* Next Live Session & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
                    Next Live STEM Session
                  </span>
                  <Badge variant="primary">Batch Alpha</Badge>
                </div>
                <h3 className="text-lg font-bold text-navy-950 mb-1">
                  {studentProfile?.program?.name || 'Interactive Live STEM Lab'}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Conducted by {typeof studentProfile?.batch === 'object' && studentProfile?.batch?.teacher?.name ? studentProfile.batch.teacher.name : 'Certified Faculty Mentor'}.
                  Check curriculum resources and join 5 minutes before scheduled start.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Monday to Friday • 45 Mins
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  isLoading={isCheckingClassroom}
                  onClick={handleJoinClassroom}
                >
                  Join Live Class
                </Button>
              </div>
            </div>

            {/* Quick Curriculum Snapshot */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-navy-950 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  Academic Milestone
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Attend at least 75% of interactive lab sessions and complete the capstone project to receive an official Distinction certificate.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Attendance Standing:</span>
                    <strong className="text-slate-900">
                      {attendanceData?.hasSessions ? `${attendanceData.attendanceRate}%` : 'Pending'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Overall Rating:</span>
                    <strong className="text-brand-600">{progressData?.standing || 'On Track'}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab('progress')}>
                  View Academic Progress Matrix
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: MY COURSE                                          */}
      {/* ========================================================= */}
      {activeTab === 'course' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
                  {courseData?.program?.category || 'STEM Curriculum'}
                </span>
                <h3 className="text-xl font-bold text-navy-950 font-display mt-2">
                  {courseData?.program?.name || 'Enrolled Program'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{courseData?.program?.tagline}</p>
              </div>
              <Badge variant="success">Authorized Access</Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              {courseData?.program?.description || 'Curriculum delivery tailored for school students.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Duration</span>
                <p className="font-bold text-slate-900 mt-1">{courseData?.program?.durationMonths || 3} Months</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Session Length</span>
                <p className="font-bold text-slate-900 mt-1">{courseData?.program?.sessionDurationMinutes || 45} Mins / Class</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Delivery Mode</span>
                <p className="font-bold text-slate-900 mt-1">{courseData?.program?.mode || 'Hybrid'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Assigned Teacher</span>
                <p className="font-bold text-slate-900 mt-1 truncate">
                  {courseData?.batch?.teacher?.name || 'Faculty Lead'}
                </p>
              </div>
            </div>

            {/* Syllabus Breakdown */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-navy-950">Curriculum Syllabus & Learning Milestones</h4>
              <div className="space-y-3">
                {courseData?.program?.syllabus?.length > 0 ? (
                  courseData.program.syllabus.map((mod: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-brand-700">Month {mod.month}: {mod.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-brand-100 text-brand-800 font-extrabold">
                          Module {idx + 1}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {mod.topics?.map((topic: string, tIdx: number) => (
                          <span key={tIdx} className="text-[11px] bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 font-medium">
                            • {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-500">
                    Comprehensive syllabus modules are actively scheduled by your school mentor.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MY BATCH                                           */}
      {/* ========================================================= */}
      {activeTab === 'batch' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-navy-950 font-display">
                  {batchData?.batch?.name || 'Assigned STEM Batch'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Grade {batchData?.batch?.grade || studentProfile?.grade} • Section {batchData?.batch?.section || studentProfile?.section}
                </p>
              </div>
              <Badge variant="primary">{batchData?.batch?.status || 'ACTIVE'}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Mentor Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Faculty Mentor</span>
                <div className="flex items-center gap-3.5 mt-3">
                  <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0 text-base">
                    {batchData?.batch?.teacher?.name?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-950 text-sm">{batchData?.batch?.teacher?.name || 'Lead STEM Mentor'}</h4>
                    <p className="text-xs text-slate-500">{batchData?.batch?.teacher?.email || 'mentor@alystro.com'}</p>
                    <p className="text-[11px] text-brand-600 font-semibold mt-1">
                      {batchData?.batch?.teacher?.specialization || 'AI & Robotics Specialist'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Timetable & Schedule</span>
                <div className="mt-3 space-y-1.5 text-xs text-slate-700">
                  {batchData?.batch?.schedule?.length > 0 ? (
                    batchData.batch.schedule.map((s: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200/50">
                        <span className="font-semibold">{s.dayOfWeek}</span>
                        <span className="font-mono text-slate-500">{s.startTime} - {s.endTime}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500">Monday to Friday • 10:00 AM - 10:45 AM</p>
                  )}
                </div>
              </div>
            </div>

            {/* Batchmates Roster */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-navy-950">
                  Batchmates in your Lab ({batchData?.classmates?.length || 0})
                </h4>
                <span className="text-xs text-slate-400">Permitted Student Directory</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {batchData?.classmates?.length > 0 ? (
                  batchData.classmates.map((c: any) => (
                    <div key={c._id} className="p-3 rounded-xl border border-slate-100 bg-white flex items-center gap-3 shadow-xs">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs shrink-0">
                        {c.name?.charAt(0) || 'S'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{c.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{c.rollNumber} • Sec {c.section}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 col-span-3 py-4 text-center">
                    You are currently the first enrolled scholar in this batch.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: LIVE CLASSES                                       */}
      {/* ========================================================= */}
      {activeTab === 'live-classes' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-navy-950 font-display">Live Interactive Classroom</h3>
            <p className="text-xs text-slate-500">
              Join real-time sessions with your STEM mentor. Authorized access is restricted strictly to enrolled students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveSessions.map((session) => (
              <div key={session.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{session.dayOfWeek}</span>
                    <Badge variant={session.isToday ? 'success' : 'primary'} dot={session.isToday}>
                      {session.isToday ? 'TODAY' : 'UPCOMING'}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-navy-950 text-base">{session.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">Instructor: {session.teacherName}</p>
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Time:</span>
                    <strong className="text-slate-900">{session.startTime} - {session.endTime}</strong>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Platform: Google Classroom</span>
                    {session.googleClassroomCode && (
                      <span className="ml-2 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                        Code: {session.googleClassroomCode}
                      </span>
                    )}
                  </div>
                  {session.hasLink && session.googleClassroomUrl ? (
                    <a href={session.googleClassroomUrl} target="_blank" rel="noreferrer">
                      <Button variant="primary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        Join Classroom
                      </Button>
                    </a>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setClassroomInfo({
                          batchName: session.title,
                          teacherName: session.teacherName,
                          classroomCode: session.googleClassroomCode,
                        });
                        setClassroomModalOpen(true);
                      }}
                      className="text-amber-700 border-amber-200 bg-amber-50"
                    >
                      Classroom Link Pending
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: CLASS SCHEDULE (TIMETABLE)                         */}
      {/* ========================================================= */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-navy-950">Weekly Class Timetable</h3>
              <p className="text-xs text-slate-500">Live lab schedule coordinated with school administration.</p>
            </div>
            <div className="w-48">
              <Select
                value={scheduleDay}
                onChange={(e) => setScheduleDay(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Days' },
                  { value: 'Monday', label: 'Monday' },
                  { value: 'Tuesday', label: 'Tuesday' },
                  { value: 'Wednesday', label: 'Wednesday' },
                  { value: 'Thursday', label: 'Thursday' },
                  { value: 'Friday', label: 'Friday' },
                ]}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">Day</th>
                    <th className="py-3.5 px-6">Session Timing</th>
                    <th className="py-3.5 px-6">Course / Subject</th>
                    <th className="py-3.5 px-6">Assigned Mentor</th>
                    <th className="py-3.5 px-6 text-right">Classroom Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
                    .filter((day) => scheduleDay === 'ALL' || scheduleDay === day)
                    .map((day, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-4 px-6 font-bold text-slate-900">{day}</td>
                        <td className="py-4 px-6 font-mono text-slate-600">10:00 AM - 10:45 AM</td>
                        <td className="py-4 px-6 font-semibold text-brand-700">
                          {studentProfile?.program?.name || 'Artificial Intelligence Lab'}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {batchData?.batch?.teacher?.name || 'Faculty Lead'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {batchData?.batch?.googleClassroomUrl || batchData?.batch?.meetingLink ? (
                            <a
                              href={batchData?.batch?.googleClassroomUrl || batchData?.batch?.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                            >
                              Launch Classroom <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <button
                              onClick={() => {
                                setClassroomInfo({
                                  batchName: batchData?.batch?.name,
                                  programName: studentProfile?.program?.name,
                                  teacherName: batchData?.batch?.teacher?.name,
                                  classroomCode: batchData?.batch?.googleClassroomCode,
                                });
                                setClassroomModalOpen(true);
                              }}
                              className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline"
                            >
                              Link Pending
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: RECORDED CLASSES                                   */}
      {/* ========================================================= */}
      {activeTab === 'recordings' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-navy-950 font-display">Archived Lecture Masterclasses</h3>
            <p className="text-xs text-slate-500">Rewatch completed sessions and review core programming concepts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordings.map((rec) => (
              <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft flex flex-col justify-between">
                <div>
                  <div className="relative aspect-video bg-navy-950 flex items-center justify-center group cursor-pointer" onClick={() => { setActiveRecording(rec); setVideoModalOpen(true); }}>
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition group-hover:scale-110 shadow-lg">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/70 text-white">
                      {rec.durationMinutes} mins
                    </span>
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      Month {rec.month} • {rec.module}
                    </span>
                    <h4 className="font-bold text-navy-950 text-sm mt-2">{rec.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">Recorded: {new Date(rec.recordedDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { setActiveRecording(rec); setVideoModalOpen(true); }}>
                    Play Recording
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: STUDY MATERIALS                                    */}
      {/* ========================================================= */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search resources, cheatsheets, slides..."
                leftIcon={<Search className="w-4 h-4" />}
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={materialCategory}
                onChange={(e) => setMaterialCategory(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Categories' },
                  { value: 'DOCUMENT', label: 'Documents & Handbooks' },
                  { value: 'CHEATSHEET', label: 'Quick Cheatsheets' },
                  { value: 'PROJECT', label: 'Project Briefs' },
                  { value: 'SLIDES', label: 'Presentation Slides' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMaterials.map((mat) => (
              <div key={mat.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {mat.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {mat.fileType} • {mat.fileSize}
                    </span>
                  </div>
                  <h4 className="font-bold text-navy-950 text-base">{mat.title}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{mat.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={() => alert(`Downloading "${mat.title}" (${mat.fileSize})...`)}
                  >
                    Download Resource
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: ASSIGNMENTS                                        */}
      {/* ========================================================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-navy-950">Coursework Assignments</h3>
              <p className="text-xs text-slate-500">Submit homework, practical code repositories, and project deliverables.</p>
            </div>
            <div className="w-48">
              <Select
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Assignments' },
                  { value: 'PENDING', label: 'Pending Submission' },
                  { value: 'SUBMITTED', label: 'Submitted (In Review)' },
                  { value: 'GRADED', label: 'Graded' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAssignments.map((asg) => {
              const isGraded = asg.userSubmission?.status === 'GRADED';
              const isSubmitted = asg.userSubmission?.status === 'SUBMITTED';

              return (
                <div key={asg._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-slate-400">Due: {new Date(asg.dueDate).toLocaleDateString()}</span>
                      {isGraded ? (
                        <Badge variant="success">Graded: {asg.userSubmission.marksObtained}/{asg.totalMarks}</Badge>
                      ) : isSubmitted ? (
                        <Badge variant="warning">Submitted</Badge>
                      ) : (
                        <Badge variant="neutral">Pending</Badge>
                      )}
                    </div>
                    <h4 className="font-bold text-navy-950 text-base">{asg.title}</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{asg.description}</p>

                    {isGraded && asg.userSubmission?.feedback && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs">
                        <span className="font-bold text-emerald-800">Faculty Feedback:</span>
                        <p className="text-emerald-700 mt-0.5">{asg.userSubmission.feedback}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 font-mono">Max: {asg.totalMarks} Marks</span>
                    <Button variant="primary" size="sm" onClick={() => handleOpenSubmit(asg)}>
                      {isSubmitted ? 'Resubmit Work' : 'Submit Work'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: TESTS & QUIZZES                                    */}
      {/* ========================================================= */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-navy-950 font-display">Academic Tests & Checkpoints</h3>
            <p className="text-xs text-slate-500">Automated quizzes with randomized answer validation and instant results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400">{quiz.durationMinutes} Mins Duration</span>
                    <Badge variant={quiz.userResult ? (quiz.userResult.passed ? 'success' : 'danger') : 'primary'}>
                      {quiz.userResult ? (quiz.userResult.passed ? 'PASSED' : 'RETAKE') : 'AVAILABLE'}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-navy-950 text-base">{quiz.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{quiz.questions?.length || 0} Questions • Pass: {quiz.passingScore}%</p>

                  {quiz.userResult && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Your Score:</span>
                        <strong className="text-slate-900 font-mono">
                          {quiz.userResult.score} / {quiz.userResult.totalMarks} ({quiz.userResult.percentage}%)
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Result:</span>
                        <span className={`font-bold ${quiz.userResult.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {quiz.userResult.passed ? 'Qualified' : 'Below Passing'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <Button variant="primary" size="sm" className="w-full" onClick={() => handleStartQuiz(quiz)}>
                    {quiz.userResult ? 'Retake Assessment' : 'Start Test'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 9: MARKS & RESULTS                                    */}
      {/* ========================================================= */}
      {activeTab === 'marks' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
            <h3 className="text-sm font-bold text-navy-950">Official Academic Gradebook</h3>
            <p className="text-xs text-slate-500">Consolidated published scores across assessments, homework, and projects.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">Assessment Title</th>
                    <th className="py-3.5 px-6">Type</th>
                    <th className="py-3.5 px-6">Score / Total</th>
                    <th className="py-3.5 px-6">Percentage</th>
                    <th className="py-3.5 px-6">Grade</th>
                    <th className="py-3.5 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {/* Quizzes Marks */}
                  {quizzes.map((q) => (
                    <tr key={q._id} className="hover:bg-slate-50/70">
                      <td className="py-4 px-6 font-bold text-slate-900">{q.title}</td>
                      <td className="py-4 px-6"><Badge variant="primary">Quiz Test</Badge></td>
                      <td className="py-4 px-6 font-mono font-bold">
                        {q.userResult ? `${q.userResult.score} / ${q.userResult.totalMarks}` : '—'}
                      </td>
                      <td className="py-4 px-6 font-mono">
                        {q.userResult ? `${q.userResult.percentage}%` : '—'}
                      </td>
                      <td className="py-4 px-6 font-bold">
                        {q.userResult
                          ? q.userResult.percentage >= 90 ? 'A+' : q.userResult.percentage >= 75 ? 'A' : q.userResult.percentage >= 60 ? 'B' : 'C'
                          : 'Pending Attempt'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Badge variant={q.userResult ? (q.userResult.passed ? 'success' : 'danger') : 'neutral'}>
                          {q.userResult ? (q.userResult.passed ? 'PUBLISHED' : 'FAILED') : 'NOT TAKEN'}
                        </Badge>
                      </td>
                    </tr>
                  ))}

                  {/* Assignments Marks */}
                  {assignments.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50/70">
                      <td className="py-4 px-6 font-bold text-slate-900">{a.title}</td>
                      <td className="py-4 px-6"><Badge variant="neutral">Coursework</Badge></td>
                      <td className="py-4 px-6 font-mono font-bold">
                        {a.userSubmission?.marksObtained !== undefined
                          ? `${a.userSubmission.marksObtained} / ${a.totalMarks}`
                          : '—'}
                      </td>
                      <td className="py-4 px-6 font-mono">
                        {a.userSubmission?.marksObtained !== undefined
                          ? `${Math.round((a.userSubmission.marksObtained / a.totalMarks) * 100)}%`
                          : '—'}
                      </td>
                      <td className="py-4 px-6 font-bold">
                        {a.userSubmission?.marksObtained !== undefined ? 'Graded' : 'Awaiting Review'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Badge variant={a.userSubmission?.status === 'GRADED' ? 'success' : 'warning'}>
                          {a.userSubmission?.status === 'GRADED' ? 'PUBLISHED' : 'PENDING'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 10: ATTENDANCE                                        */}
      {/* ========================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Attendance Rate</span>
              <p className="text-3xl font-extrabold text-navy-950 font-display mt-2">
                {attendanceData?.hasSessions ? `${attendanceData.attendanceRate}%` : 'N/A'}
              </p>
              <p className="text-xs font-semibold mt-1 text-slate-500">
                {attendanceData?.hasSessions
                  ? `${attendanceData.presentSessions} Attended / ${attendanceData.totalSessions} Total`
                  : 'No sessions recorded yet'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Present Sessions</span>
              <p className="text-3xl font-extrabold text-emerald-600 font-display mt-2">
                {attendanceData?.presentSessions || 0}
              </p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Verified In-Lab Sessions</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Absent / Leave</span>
              <p className="text-3xl font-extrabold text-rose-600 font-display mt-2">
                {attendanceData?.absentSessions || 0}
              </p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Unattended Sessions</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-navy-950">Daily Attendance History</h4>
              <span className="text-xs text-slate-400">Authorized Campus Register</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Batch</th>
                    <th className="py-3.5 px-6">Topic / Curriculum Covered</th>
                    <th className="py-3.5 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {attendanceData?.history?.length > 0 ? (
                    attendanceData.history.map((rec: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-6 font-mono text-slate-900">{new Date(rec.date).toLocaleDateString()}</td>
                        <td className="py-3.5 px-6 font-semibold">{rec.batchName || 'Batch Alpha'}</td>
                        <td className="py-3.5 px-6 text-slate-600">{rec.topicCovered || 'Core Lab Session'}</td>
                        <td className="py-3.5 px-6 text-right">
                          <Badge variant={rec.status === 'PRESENT' ? 'success' : rec.status === 'LATE' ? 'warning' : 'danger'}>
                            {rec.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        No attendance records logged yet for your student profile.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 11: ACADEMIC PROGRESS                                 */}
      {/* ========================================================= */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-navy-950 font-display">Academic Standing & Progress</h3>
                <p className="text-xs text-slate-500 mt-1">Real-time composite metric based on database records.</p>
              </div>
              <Badge variant="success" size="md">
                Overall: {progressData?.standing || 'Distinction'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance</span>
                <p className="text-3xl font-extrabold text-navy-950 mt-2">
                  {progressData?.attendance?.rate !== null ? `${progressData?.attendance?.rate}%` : 'N/A'}
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${progressData?.attendance?.rate || 0}%` }}
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assignments Completed</span>
                <p className="text-3xl font-extrabold text-navy-950 mt-2">
                  {progressData?.assignments?.submitted || 0} / {progressData?.assignments?.total || 0}
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="h-full bg-brand-500"
                    style={{
                      width: `${
                        progressData?.assignments?.total > 0
                          ? Math.round((progressData.assignments.submitted / progressData.assignments.total) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quizzes Attempted</span>
                <p className="text-3xl font-extrabold text-navy-950 mt-2">
                  {progressData?.quizzes?.attempted || 0} / {progressData?.quizzes?.total || 0}
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{
                      width: `${
                        progressData?.quizzes?.total > 0
                          ? Math.round((progressData.quizzes.attempted / progressData.quizzes.total) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 12: PRACTICAL PROJECTS                                */}
      {/* ========================================================= */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
            <h3 className="text-sm font-bold text-navy-950">Capstone STEM & AI Projects</h3>
            <p className="text-xs text-slate-500">
              Submit your project prototype URL, GitHub repository, and live demonstration files for faculty evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectAssignments.map((proj) => {
              const isSubmitted = proj.userSubmission?.status === 'SUBMITTED' || proj.userSubmission?.status === 'GRADED';
              return (
                <div key={proj._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-brand-600 uppercase">Capstone Project</span>
                      <Badge variant={isSubmitted ? 'success' : 'warning'}>
                        {isSubmitted ? 'SUBMITTED' : 'IN PROGRESS'}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-navy-950 text-base">{proj.title}</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{proj.description}</p>
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Deliverables:</span>
                      <p className="text-slate-700 mt-0.5">Project Demo Link + Architecture Notes + Source Code</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 font-mono">100 Marks</span>
                    <Button variant="primary" size="sm" onClick={() => handleOpenSubmit(proj)}>
                      {isSubmitted ? 'Update Submission' : 'Submit Project Work'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 13: MY CERTIFICATES                                   */}
      {/* ========================================================= */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-navy-950">Earned & Issued Certificates</h3>
              <p className="text-xs text-slate-500">Official verified credentials issued exclusively upon verified curriculum completion.</p>
            </div>
            <Link to="/verify" target="_blank">
              <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                Public Verification Portal
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.length === 0 ? (
              <div className="col-span-2 p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No Certificates Issued Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Complete your interactive lab sessions and capstone project evaluation to unlock your verified ALYSTRO credential.
                </p>
              </div>
            ) : (
              certificates.map((cert) => (
                <div key={cert._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded">
                        {cert.certificateId}
                      </span>
                      <Badge variant="success">{cert.grade}</Badge>
                    </div>
                    <h4 className="font-bold text-navy-950 text-base mt-2">{cert.programName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Awarded to {cert.studentName}</p>
                    <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                      Issue Date: {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/verify/${cert.certificateId}`}
                      target="_blank"
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      View & Print Credential <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 14: STUDENT PROFILE                                   */}
      {/* ========================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-4">
                {studentProfile?.user?.avatar ? (
                  <img
                    src={studentProfile.user.avatar}
                    alt={studentProfile.user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-brand-500 text-white font-extrabold text-xl flex items-center justify-center">
                    {user?.name?.charAt(0) || 'S'}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-navy-950 font-display">{user?.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
                  <Badge variant="success" size="sm" className="mt-1" dot>
                    Active Scholar
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditProfileModalOpen(true)} leftIcon={<Edit2 className="w-4 h-4" />}>
                Edit Contact Details
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Student Roll Number</span>
                <p className="font-mono font-bold text-slate-900 mt-1">{studentProfile?.rollNumber || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Grade & Section</span>
                <p className="font-bold text-slate-900 mt-1">{studentProfile?.grade || 'Class 7'} • Sec {studentProfile?.section || 'A'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Partner School</span>
                <p className="font-bold text-slate-900 mt-1">{studentProfile?.school?.name || 'Partner School'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Parent / Guardian</span>
                <p className="font-bold text-slate-900 mt-1">{studentProfile?.parentName || 'Parent Contact'}</p>
                <p className="text-slate-500">{studentProfile?.parentPhone || 'No phone'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Parent Email</span>
                <p className="font-bold text-slate-900 mt-1">{studentProfile?.parentEmail || 'Not specified'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Enrollment Date</span>
                <p className="font-bold text-slate-900 mt-1">
                  {studentProfile?.enrolledAt ? new Date(studentProfile.enrolledAt).toLocaleDateString() : 'Active Term'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS                                                    */}
      {/* ========================================================= */}

      {/* Modal: Assignment / Project Submission */}
      {selectedAssignment && (
        <Modal
          isOpen={submitModalOpen}
          onClose={() => setSubmitModalOpen(false)}
          title={`Submit Deliverable: ${selectedAssignment.title}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSendSubmission} className="space-y-4">
            <Input
              label="Deliverable Link / Cloud URL (Google Drive, GitHub, Canva, YouTube) *"
              required
              placeholder="https://drive.google.com/..."
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Notes for Mentor & Technical Explanation
              </label>
              <textarea
                rows={4}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Explain the algorithms, creative approach, and tools implemented..."
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setSubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save & Submit Work
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Interactive Quiz Taker */}
      {activeQuiz && (
        <Modal
          isOpen={quizModalOpen}
          onClose={() => setQuizModalOpen(false)}
          title={activeQuiz.title}
          subtitle={`Time Remaining: ${Math.floor(quizTimer / 60)}:${(quizTimer % 60).toString().padStart(2, '0')} • Pass: ${activeQuiz.passingScore}%`}
          maxWidth="xl"
        >
          {quizResult ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-navy-950 mb-1">
                {quizResult.passed ? 'Quiz Passed Successfully!' : 'Quiz Completed'}
              </h3>
              <p className="text-sm font-semibold text-slate-600">
                Score: {quizResult.score} / {quizResult.totalMarks} ({quizResult.percentage}%)
              </p>
              <Button variant="primary" size="sm" onClick={() => setQuizModalOpen(false)} className="mt-6 px-8">
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {activeQuiz.questions?.map((q, qIdx) => (
                <div key={qIdx} className="space-y-2 text-left">
                  <p className="text-xs font-bold text-slate-900">
                    {qIdx + 1}. {q.questionText}
                  </p>
                  <div className="space-y-1.5">
                    {q.options?.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleAnswerSelect(qIdx, optIdx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition ${
                          selectedAnswers[qIdx] === optIdx
                            ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setQuizModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="primary" size="sm" isLoading={isSubmittingQuiz} onClick={handleSubmitQuiz}>
                  Submit Answers & Calculate Score
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Modal: Watch Recording */}
      {activeRecording && (
        <Modal
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          title={activeRecording.title}
          subtitle={`Duration: ${activeRecording.durationMinutes} mins • ${activeRecording.module}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="aspect-video bg-navy-950 rounded-xl overflow-hidden flex items-center justify-center">
              <iframe
                src={activeRecording.videoUrl}
                title={activeRecording.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Instructor: {activeRecording.instructor}</span>
              <Button variant="outline" size="sm" onClick={() => setVideoModalOpen(false)}>
                Close Player
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Edit Profile */}
      <Modal
        isOpen={editProfileModalOpen}
        onClose={() => setEditProfileModalOpen(false)}
        title="Edit Permitted Profile Details"
        maxWidth="md"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            label="Avatar / Photo URL"
            placeholder="https://..."
            value={profileForm.avatar}
            onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
          />
          <Input
            label="Phone Number"
            placeholder="+91 98765 43210"
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
          />
          <Input
            label="Parent / Guardian Name"
            value={profileForm.parentName}
            onChange={(e) => setProfileForm({ ...profileForm, parentName: e.target.value })}
          />
          <Input
            label="Parent Contact Phone"
            value={profileForm.parentPhone}
            onChange={(e) => setProfileForm({ ...profileForm, parentPhone: e.target.value })}
          />
          <Input
            label="Parent Contact Email"
            type="email"
            value={profileForm.parentEmail}
            onChange={(e) => setProfileForm({ ...profileForm, parentEmail: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isUpdatingProfile}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Google Classroom Information */}
      <Modal
        isOpen={classroomModalOpen}
        onClose={() => setClassroomModalOpen(false)}
        title="Google Classroom Access"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm">Google Classroom Link Pending</h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Google Classroom link has not been added yet for your enrolled course and batch.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Course / Program:</span>
              <strong className="text-slate-800">{studentProfile?.program?.name || classroomInfo?.programName || 'Enrolled Program'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Batch:</span>
              <strong className="text-slate-800">{studentProfile?.batch?.name || classroomInfo?.batchName || 'Your Batch'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Instructor:</span>
              <strong className="text-slate-800">
                {studentProfile?.batch?.teacher?.name || classroomInfo?.teacherName || 'Assigned Instructor'}
              </strong>
            </div>
            {classroomInfo?.classroomCode && (
              <div className="flex justify-between">
                <span className="text-slate-500">Google Class Code:</span>
                <strong className="font-mono bg-white px-2 py-0.5 border border-slate-200 rounded text-brand-700 font-bold">
                  {classroomInfo.classroomCode}
                </strong>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 leading-relaxed">
            <p className="font-semibold mb-1">Notice regarding Google authentication:</p>
            Google Classroom requires you to be signed in with your authorized Google or school account. Once your teacher or school administrator configures the link, you will be able to join with a single click.
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={() => setClassroomModalOpen(false)}>
              Understood
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
