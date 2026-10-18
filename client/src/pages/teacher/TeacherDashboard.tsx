import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  GraduationCap,
  Video,
  CalendarCheck,
  Upload,
  FileText,
  CheckSquare,
  Award,
  TrendingUp,
  MessageSquare,
  BarChart2,
  Plus,
  Search,
  X,
  ExternalLink,
  Check,
  ChevronDown,
  Users,
  Clock,
  AlertCircle,
  Loader2,
  BookOpen,
  Star,
  RefreshCw,
  Edit2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Batch {
  _id: string;
  name: string;
  grade: string;
  section: string;
  status: string;
  studentCount: number;
  meetingLink?: string;
  googleClassroomUrl?: string;
  googleClassroomCode?: string;
  classroomNumber?: string;
  schedule: { dayOfWeek: string; startTime: string; endTime: string }[];
  program?: { _id?: string; name: string; category: string; durationMonths: number };
}

interface StudentRow {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  rollNumber: string;
  grade: string;
  section: string;
  batch?: { _id: string; name: string };
  attendanceRate: number;
  completedAssignments: number;
  status: string;
  parentName?: string;
  parentPhone?: string;
}

interface AttendanceSession {
  _id: string;
  date: string;
  batch: { _id: string; name: string; grade: string };
  topicCovered?: string;
  records: { student: any; status: string; remark?: string }[];
}

interface AssignmentRow {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  status: string;
  batch?: { _id: string; name: string; grade: string };
  submittedCount: number;
  gradedCount: number;
  totalStudents: number;
}

interface QuizRow {
  _id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  passingScore: number;
  status: string;
  batch?: { _id: string; name: string };
  questions: any[];
  attemptCount: number;
  passCount: number;
}

interface ProgressRow {
  studentId: string;
  name: string;
  avatar?: string;
  rollNumber: string;
  grade: string;
  batch?: { name: string };
  attendanceRate: number;
  assignmentRate: number;
  avgQuiz: number;
  overall: number;
}

interface ReportRow {
  batchId: string;
  batchName: string;
  grade: string;
  section: string;
  program?: string;
  totalStudents: number;
  totalSessions: number;
  batchAttRate: number;
  totalAssignments: number;
  totalSubmissions: number;
  gradedSubmissions: number;
  avgQuizScore: number;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface TeacherDashboardProps {
  defaultTab?: string;
}

// ─── Helper components ────────────────────────────────────────────────────────
const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }> = ({
  icon, title, description, action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 max-w-xs mb-4">{description}</p>
    {action}
  </div>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
  </div>
);

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string }> = ({
  label, value, icon, color,
}) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Component ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ defaultTab = 'overview' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync tab when route changes (when user navigates via sidebar)
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // ─── Shared state ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<any>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);

  // ─── Students state ────────────────────────────────────────────────────────
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentBatchFilter, setStudentBatchFilter] = useState('');

  // ─── Attendance state ──────────────────────────────────────────────────────
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [isLoadingAtt, setIsLoadingAtt] = useState(false);
  const [attBatchStudents, setAttBatchStudents] = useState<StudentRow[]>([]);
  const [attBatch, setAttBatch] = useState<string>('');
  const [attDate, setAttDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attTopic, setAttTopic] = useState('');
  const [attRecords, setAttRecords] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
  const [isSavingAtt, setIsSavingAtt] = useState(false);
  const [attSaveSuccess, setAttSaveSuccess] = useState(false);

  // ─── Assignments state ─────────────────────────────────────────────────────
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', batchId: '', programId: '', dueDate: '', totalMarks: 100 });
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [submissionsOpen, setSubmissionsOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRow | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [gradingSub, setGradingSub] = useState<any | null>(null);
  const [gradeMarks, setGradeMarks] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  // ─── Quizzes state ─────────────────────────────────────────────────────────
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [createQuizOpen, setCreateQuizOpen] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '', batchId: '', programId: '', durationMinutes: 20, passingScore: 60 });
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [quizResultsOpen, setQuizResultsOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizRow | null>(null);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [isLoadingQuizResults, setIsLoadingQuizResults] = useState(false);

  // ─── Progress state ────────────────────────────────────────────────────────
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [progressBatch, setProgressBatch] = useState('');

  // ─── Remarks state ─────────────────────────────────────────────────────────
  const [remarkStudents, setRemarkStudents] = useState<StudentRow[]>([]);
  const [isLoadingRemarks, setIsLoadingRemarks] = useState(false);
  const [addRemarkOpen, setAddRemarkOpen] = useState(false);
  const [remarkTarget, setRemarkTarget] = useState<StudentRow | null>(null);
  const [remarkText, setRemarkText] = useState('');
  const [remarkType, setRemarkType] = useState<'ACADEMIC' | 'BEHAVIOUR' | 'ACHIEVEMENT' | 'CONCERN'>('ACADEMIC');
  const [isSavingRemark, setIsSavingRemark] = useState(false);
  const [savedRemarks, setSavedRemarks] = useState<any[]>([]);

  // ─── Reports state ─────────────────────────────────────────────────────────
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [reportBatch, setReportBatch] = useState('');

  // ─── Google Classroom modal state ──────────────────────────────────────────
  const [editClassroomOpen, setEditClassroomOpen] = useState(false);
  const [selectedBatchForClassroom, setSelectedBatchForClassroom] = useState<Batch | null>(null);
  const [classroomUrlInput, setClassroomUrlInput] = useState('');
  const [classroomCodeInput, setClassroomCodeInput] = useState('');
  const [classroomSaving, setClassroomSaving] = useState(false);
  const [classroomError, setClassroomError] = useState('');

  const openClassroomModal = (batch: Batch) => {
    setSelectedBatchForClassroom(batch);
    setClassroomUrlInput(batch.googleClassroomUrl || batch.meetingLink || '');
    setClassroomCodeInput(batch.googleClassroomCode || '');
    setClassroomError('');
    setEditClassroomOpen(true);
  };

  const handleSaveClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForClassroom) return;
    if (classroomUrlInput.trim() && !classroomUrlInput.startsWith('http://') && !classroomUrlInput.startsWith('https://')) {
      setClassroomError('URL must start with http:// or https:// (e.g. https://classroom.google.com/...)');
      return;
    }
    setClassroomSaving(true);
    setClassroomError('');
    try {
      const res = await api.put(`/teachers/me/batches/${selectedBatchForClassroom._id}/classroom`, {
        googleClassroomUrl: classroomUrlInput.trim(),
        googleClassroomCode: classroomCodeInput.trim(),
        meetingLink: classroomUrlInput.trim(),
      });
      if (res.success && res.data) {
        setBatches((prev) =>
          prev.map((b) => (b._id === selectedBatchForClassroom._id ? { ...b, ...res.data } : b))
        );
        setEditClassroomOpen(false);
      } else {
        setClassroomError(res.message || 'Failed to update Google Classroom.');
      }
    } catch (err: any) {
      setClassroomError(err.message || 'Error updating Google Classroom link.');
    } finally {
      setClassroomSaving(false);
    }
  };

  // ─── Load profile & batches ────────────────────────────────────────────────
  useEffect(() => {
    async function loadCore() {
      try {
        const [pRes, bRes] = await Promise.all([
          api.get('/teachers/me/profile'),
          api.get('/teachers/me/batches'),
        ]);
        if (pRes.success) setProfile(pRes.data);
        if (bRes.success && bRes.data?.length) {
          setBatches(bRes.data);
          setSelectedBatch(bRes.data[0]._id);
          setAttBatch(bRes.data[0]._id);
          setNewAssignment((p) => ({ ...p, batchId: bRes.data[0]._id, programId: bRes.data[0].program?._id || '' }));
          setNewQuiz((p) => ({ ...p, batchId: bRes.data[0]._id, programId: bRes.data[0].program?._id || '' }));
        }
      } finally {
        setIsLoadingProfile(false);
        setIsLoadingBatches(false);
      }
    }
    loadCore();
  }, []);

  // ─── Load students when tab active ────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'students' && activeTab !== 'attendance' && activeTab !== 'remarks') return;
    async function loadStudents() {
      setIsLoadingStudents(true);
      try {
        const res = await api.get('/teachers/me/students');
        if (res.success) setStudents(res.data || []);
      } finally {
        setIsLoadingStudents(false);
      }
    }
    loadStudents();
  }, [activeTab]);

  // ─── Load attendance sessions ──────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'attendance') return;
    async function loadAtt() {
      setIsLoadingAtt(true);
      try {
        const res = await api.get('/teachers/me/attendance');
        if (res.success) setAttendanceSessions(res.data || []);
      } finally {
        setIsLoadingAtt(false);
      }
    }
    loadAtt();
  }, [activeTab]);

  // ─── Load batch students for attendance marking ────────────────────────────
  useEffect(() => {
    if (!attBatch || activeTab !== 'attendance') return;
    async function loadBatchStudents() {
      const res = await api.get(`/teachers/me/students?batchId=${attBatch}`);
      if (res.success) {
        setAttBatchStudents(res.data || []);
        const init: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
        (res.data || []).forEach((s: StudentRow) => { init[s._id] = 'PRESENT'; });
        setAttRecords(init);
      }
    }
    loadBatchStudents();
  }, [attBatch, activeTab]);

  // ─── Load assignments ──────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'assignments' && activeTab !== 'marks') return;
    async function loadAssignments() {
      setIsLoadingAssignments(true);
      try {
        const res = await api.get('/teachers/me/assignments');
        if (res.success) setAssignments(res.data || []);
      } finally {
        setIsLoadingAssignments(false);
      }
    }
    loadAssignments();
  }, [activeTab]);

  // ─── Load quizzes ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'quizzes' && activeTab !== 'marks') return;
    async function loadQuizzes() {
      setIsLoadingQuizzes(true);
      try {
        const res = await api.get('/teachers/me/quizzes');
        if (res.success) setQuizzes(res.data || []);
      } finally {
        setIsLoadingQuizzes(false);
      }
    }
    loadQuizzes();
  }, [activeTab]);

  // ─── Load progress ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'progress') return;
    async function loadProgress() {
      setIsLoadingProgress(true);
      try {
        const url = progressBatch ? `/teachers/me/progress?batchId=${progressBatch}` : '/teachers/me/progress';
        const res = await api.get(url);
        if (res.success) setProgress(res.data || []);
      } finally {
        setIsLoadingProgress(false);
      }
    }
    loadProgress();
  }, [activeTab, progressBatch]);

  // ─── Load reports ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'reports') return;
    async function loadReports() {
      setIsLoadingReports(true);
      try {
        const url = reportBatch ? `/teachers/me/reports?batchId=${reportBatch}` : '/teachers/me/reports';
        const res = await api.get(url);
        if (res.success) setReports(res.data || []);
      } finally {
        setIsLoadingReports(false);
      }
    }
    loadReports();
  }, [activeTab, reportBatch]);

  // ─── Remarks tab: load students ────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'remarks') return;
    setRemarkStudents(students);
  }, [activeTab, students]);

  // ─── Save attendance ───────────────────────────────────────────────────────
  const handleSaveAttendance = async () => {
    if (!attBatch || attBatchStudents.length === 0) return;
    setIsSavingAtt(true);
    try {
      const records = attBatchStudents.map((s) => ({
        student: s._id,
        status: attRecords[s._id] || 'ABSENT',
      }));
      const res = await api.post('/attendance', {
        batchId: attBatch,
        date: attDate,
        topicCovered: attTopic,
        records,
      });
      if (res.success) {
        setAttSaveSuccess(true);
        setTimeout(() => setAttSaveSuccess(false), 3000);
        const attRes = await api.get('/teachers/me/attendance');
        if (attRes.success) setAttendanceSessions(attRes.data || []);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance');
    } finally {
      setIsSavingAtt(false);
    }
  };

  // ─── Create assignment ─────────────────────────────────────────────────────
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.batchId || !newAssignment.title || !newAssignment.dueDate) return;
    const batch = batches.find((b) => b._id === newAssignment.batchId);
    setIsCreatingAssignment(true);
    try {
      const res = await api.post('/assignments', {
        title: newAssignment.title,
        description: newAssignment.description,
        batchId: newAssignment.batchId,
        programId: batch?.program?._id || newAssignment.programId,
        dueDate: newAssignment.dueDate,
        totalMarks: newAssignment.totalMarks,
      });
      if (res.success) {
        setCreateAssignmentOpen(false);
        setNewAssignment({ title: '', description: '', batchId: batches[0]?._id || '', programId: '', dueDate: '', totalMarks: 100 });
        const r = await api.get('/teachers/me/assignments');
        if (r.success) setAssignments(r.data || []);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create assignment');
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  // ─── Open submissions ──────────────────────────────────────────────────────
  const handleOpenSubmissions = async (asg: AssignmentRow) => {
    setSelectedAssignment(asg);
    setGradingSub(null);
    setSubmissionsOpen(true);
    setIsLoadingSubmissions(true);
    try {
      const res = await api.get(`/assignments/${asg._id}/submissions`);
      if (res.success) setSubmissions(res.data || []);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSub) return;
    setIsGrading(true);
    try {
      const res = await api.put(`/assignments/submissions/${gradingSub._id}/grade`, {
        marksObtained: Number(gradeMarks),
        feedback: gradeFeedback,
      });
      if (res.success) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s._id === gradingSub._id ? { ...s, marksObtained: Number(gradeMarks), feedback: gradeFeedback, status: 'GRADED' } : s
          )
        );
        setGradingSub(null);
        // Update assignment list counts
        const r = await api.get('/teachers/me/assignments');
        if (r.success) setAssignments(r.data || []);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save grade');
    } finally {
      setIsGrading(false);
    }
  };

  // ─── Create quiz ───────────────────────────────────────────────────────────
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuiz.batchId || !newQuiz.title) return;
    const batch = batches.find((b) => b._id === newQuiz.batchId);
    setIsCreatingQuiz(true);
    try {
      const res = await api.post('/quizzes', {
        title: newQuiz.title,
        description: newQuiz.description,
        batchId: newQuiz.batchId,
        programId: batch?.program?._id || newQuiz.programId,
        durationMinutes: newQuiz.durationMinutes,
        passingScore: newQuiz.passingScore,
      });
      if (res.success) {
        setCreateQuizOpen(false);
        setNewQuiz({ title: '', description: '', batchId: batches[0]?._id || '', programId: '', durationMinutes: 20, passingScore: 60 });
        const r = await api.get('/teachers/me/quizzes');
        if (r.success) setQuizzes(r.data || []);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create quiz');
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  // ─── Open quiz results ─────────────────────────────────────────────────────
  const handleOpenQuizResults = async (quiz: QuizRow) => {
    setSelectedQuiz(quiz);
    setQuizResultsOpen(true);
    setIsLoadingQuizResults(true);
    try {
      const res = await api.get(`/quizzes/${quiz._id}/results`);
      if (res.success) setQuizResults(res.data || []);
    } finally {
      setIsLoadingQuizResults(false);
    }
  };

  // ─── Save remark ───────────────────────────────────────────────────────────
  const handleSaveRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarkTarget || !remarkText.trim()) return;
    setIsSavingRemark(true);
    setTimeout(() => {
      setSavedRemarks((prev) => [
        ...prev,
        {
          id: Date.now(),
          studentId: remarkTarget._id,
          studentName: remarkTarget.name,
          type: remarkType,
          text: remarkText,
          date: new Date().toISOString(),
        },
      ]);
      setIsSavingRemark(false);
      setAddRemarkOpen(false);
      setRemarkText('');
      setRemarkTarget(null);
    }, 800);
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const getPerformanceBadge = (rate: number) => {
    if (rate >= 80) return <Badge variant="success" size="sm">Excellent</Badge>;
    if (rate >= 60) return <Badge variant="warning" size="sm">Good</Badge>;
    return <Badge variant="danger" size="sm">Needs Help</Badge>;
  };

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
      PRESENT: 'success', ACTIVE: 'success', PUBLISHED: 'success', GRADED: 'success',
      ABSENT: 'danger', LATE: 'warning', SUBMITTED: 'info', DRAFT: 'neutral',
    };
    return map[status] || 'neutral';
  };

  const todayDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const todayClasses = batches.flatMap((b) =>
    b.schedule
      .filter((s) => s.dayOfWeek === todayDay)
      .map((s) => ({ ...s, batchName: b.name, grade: b.grade, meetingLink: b.meetingLink, classroomNumber: b.classroomNumber }))
  );

  // ─── Filter students ───────────────────────────────────────────────────────
  const filteredStudents = students.filter((s) => {
    const matchSearch = !studentSearch || s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase());
    const matchBatch = !studentBatchFilter || s.batch?._id === studentBatchFilter;
    return matchSearch && matchBatch;
  });

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ─── Page Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {activeTab === 'overview' && '📊 Mentor Dashboard'}
              {activeTab === 'batches' && '🗂️ Assigned Batches'}
              {activeTab === 'students' && '🎓 My Students'}
              {activeTab === 'classes' && "📅 Today's Classes"}
              {activeTab === 'attendance' && '✅ Attendance Management'}
              {activeTab === 'materials' && '📁 Study Materials'}
              {activeTab === 'assignments' && '📝 Assignments'}
              {activeTab === 'quizzes' && '🧪 Tests & Quizzes'}
              {activeTab === 'marks' && '🏆 Marks & Results'}
              {activeTab === 'progress' && '📈 Student Progress'}
              {activeTab === 'remarks' && '💬 Remarks & Feedback'}
              {activeTab === 'reports' && '📊 Reports'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isLoadingProfile ? 'Loading…' : `Welcome, ${profile?.name || user?.name} · ${batches.length} Batch${batches.length !== 1 ? 'es' : ''} Assigned`}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* OVERVIEW */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Assigned Batches" value={batches.length} icon={<Layers className="w-6 h-6 text-indigo-600" />} color="bg-indigo-50" />
              <StatCard label="Total Students" value={batches.reduce((s, b) => s + (b.studentCount || 0), 0)} icon={<GraduationCap className="w-6 h-6 text-emerald-600" />} color="bg-emerald-50" />
              <StatCard label="Today's Classes" value={todayClasses.length} icon={<Video className="w-6 h-6 text-blue-600" />} color="bg-blue-50" />
              <StatCard label="Pending Grading" value={assignments.reduce((s, a) => s + (a.submittedCount - a.gradedCount), 0) || '—'} icon={<FileText className="w-6 h-6 text-amber-600" />} color="bg-amber-50" />
            </div>

            {/* Today's schedule */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-brand-500" /> Today's Schedule ({todayDay})
              </h2>
              {isLoadingBatches ? <LoadingSpinner /> : todayClasses.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">No classes scheduled for today.</p>
              ) : (
                <div className="space-y-3">
                  {todayClasses.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-brand-50 rounded-lg border border-brand-100">
                      <div>
                        <p className="font-semibold text-slate-800">{c.batchName}</p>
                        <p className="text-sm text-slate-500">{c.grade} · {c.classroomNumber || 'Room TBD'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-700">{c.startTime} – {c.endTime}</p>
                        </div>
                        {c.meetingLink && (
                          <a href={c.meetingLink} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="primary" className="flex items-center gap-1">
                              <Video className="w-3 h-3" /> Join
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assigned batches quick view */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-500" /> My Batches
              </h2>
              {batches.length === 0 ? (
                <EmptyState icon={<Layers className="w-8 h-8" />} title="No Batches Assigned" description="You have not been assigned to any batch yet. Contact your school admin." />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {batches.map((b) => (
                    <div key={b._id} className="border border-slate-200 rounded-lg p-4 hover:border-brand-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-800">{b.name}</p>
                          <p className="text-sm text-slate-500">{b.grade} · Section {b.section}</p>
                        </div>
                        <Badge variant={b.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">{b.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{b.studentCount} students</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{b.program?.name || 'Program TBD'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* BATCHES */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'batches' && (
          <div className="space-y-4">
            {isLoadingBatches ? <LoadingSpinner /> : batches.length === 0 ? (
              <EmptyState icon={<Layers className="w-8 h-8" />} title="No Batches Assigned" description="Contact your school administrator to be assigned to batches." />
            ) : (
              batches.map((batch) => (
                <div key={batch._id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{batch.name}</h3>
                      <p className="text-sm text-slate-500">{batch.grade} · Section {batch.section} · {batch.program?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={batch.status === 'ACTIVE' ? 'success' : 'neutral'}>{batch.status}</Badge>
                      {batch.meetingLink && (
                        <a href={batch.meetingLink} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Live Link
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-brand-600">{batch.studentCount}</p>
                      <p className="text-xs text-slate-500">Students</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-indigo-600">{batch.schedule.length}</p>
                      <p className="text-xs text-slate-500">Days/Week</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-emerald-600">{batch.classroomNumber || 'TBD'}</p>
                      <p className="text-xs text-slate-500">Room</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-amber-600">{batch.program?.durationMonths || '—'}m</p>
                      <p className="text-xs text-slate-500">Duration</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Weekly Schedule</p>
                    <div className="flex flex-wrap gap-2">
                      {batch.schedule.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium border border-brand-100">
                          {s.dayOfWeek} · {s.startTime}–{s.endTime}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Google Classroom Integration Card */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">Google Classroom</span>
                          {batch.googleClassroomUrl ? (
                            <Badge variant="success" size="sm">Configured</Badge>
                          ) : (
                            <Badge variant="warning" size="sm">Not Added</Badge>
                          )}
                        </div>
                        {batch.googleClassroomUrl ? (
                          <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2">
                            <span className="truncate max-w-xs text-emerald-700 font-mono font-medium">{batch.googleClassroomUrl}</span>
                            {batch.googleClassroomCode && (
                              <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 font-mono text-[11px] font-semibold">
                                Code: {batch.googleClassroomCode}
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Add a Google Classroom or Meet URL so students can join their live classes seamlessly.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {batch.googleClassroomUrl && (
                        <a href={batch.googleClassroomUrl} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5" /> Launch
                          </Button>
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant={batch.googleClassroomUrl ? 'outline' : 'primary'}
                        onClick={() => openClassroomModal(batch)}
                        className="flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        {batch.googleClassroomUrl ? 'Edit Link' : 'Add Link'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STUDENTS */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search name or roll number…"
                  className="pl-9 pr-4 py-2 w-full text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>
              <select
                value={studentBatchFilter}
                onChange={(e) => setStudentBatchFilter(e.target.value)}
                className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="">All Batches</option>
                {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <span className="text-sm text-slate-500">{filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}</span>
            </div>

            {isLoadingStudents ? <LoadingSpinner /> : filteredStudents.length === 0 ? (
              <EmptyState icon={<GraduationCap className="w-8 h-8" />} title="No Students Found" description="No students match the current filters." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="text-left px-5 py-3">Student</th>
                      <th className="text-left px-5 py-3">Roll No.</th>
                      <th className="text-left px-5 py-3">Batch</th>
                      <th className="text-left px-5 py-3">Grade</th>
                      <th className="text-left px-5 py-3">Attendance</th>
                      <th className="text-left px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm overflow-hidden">
                              {s.avatar ? <img src={s.avatar} alt="" className="w-full h-full object-cover" /> : s.name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{s.name}</p>
                              <p className="text-xs text-slate-400">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-slate-600">{s.rollNumber}</td>
                        <td className="px-5 py-3 text-slate-600">{s.batch?.name || '—'}</td>
                        <td className="px-5 py-3 text-slate-600">{s.grade} · {s.section}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${s.attendanceRate}%` }} />
                            </div>
                            <span className="text-xs text-slate-600">{s.attendanceRate}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={s.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">{s.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TODAY'S CLASSES */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'classes' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-700 mb-1">Today: {todayDay}, {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</h2>
              <p className="text-sm text-slate-500 mb-5">All scheduled classes for today across your assigned batches.</p>
              {isLoadingBatches ? <LoadingSpinner /> : todayClasses.length === 0 ? (
                <EmptyState icon={<Video className="w-8 h-8" />} title="No Classes Today" description="No sessions are scheduled for today. Enjoy your free time!" />
              ) : (
                <div className="space-y-3">
                  {todayClasses.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-xl border border-slate-200 bg-gradient-to-r from-brand-50 to-indigo-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{c.batchName}</p>
                          <p className="text-sm text-slate-500">{c.grade} · {c.classroomNumber || 'Room TBD'}</p>
                          <p className="text-sm font-semibold text-brand-600 mt-0.5">{c.startTime} – {c.endTime}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setActiveTab('attendance'); navigate('/teacher/attendance'); }}>
                          Mark Attendance
                        </Button>
                        {c.meetingLink && (
                          <a href={c.meetingLink} target="_blank" rel="noreferrer">
                            <Button variant="primary" size="sm" className="flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> Join Live
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All batch schedules */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-700 mb-4">Full Weekly Schedule</h2>
              {batches.map((batch) => (
                <div key={batch._id} className="mb-5 last:mb-0">
                  <h3 className="text-sm font-semibold text-slate-600 mb-2">{batch.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {batch.schedule.map((s, i) => (
                      <div key={i} className={`px-4 py-2 rounded-lg text-sm font-medium border ${s.dayOfWeek === todayDay ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {s.dayOfWeek} · {s.startTime}–{s.endTime}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ATTENDANCE */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'attendance' && (
          <div className="space-y-5">
            {/* Mark attendance card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-700 mb-4">Mark Attendance</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Batch</label>
                  <select
                    value={attBatch}
                    onChange={(e) => setAttBatch(e.target.value)}
                    className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                    className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Topic Covered</label>
                  <input
                    value={attTopic}
                    onChange={(e) => setAttTopic(e.target.value)}
                    placeholder="e.g. AI Fundamentals - Module 3"
                    className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              {attBatchStudents.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">Select a batch to load students.</p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-slate-600 font-medium">{attBatchStudents.length} students · Mark each status</p>
                    <div className="flex gap-2">
                      <button className="text-xs text-emerald-600 hover:underline font-medium" onClick={() => {
                        const all: Record<string, 'PRESENT'> = {};
                        attBatchStudents.forEach((s) => { all[s._id] = 'PRESENT'; });
                        setAttRecords(all);
                      }}>Mark All Present</button>
                      <button className="text-xs text-red-500 hover:underline font-medium ml-3" onClick={() => {
                        const all: Record<string, 'ABSENT'> = {};
                        attBatchStudents.forEach((s) => { all[s._id] = 'ABSENT'; });
                        setAttRecords(all);
                      }}>Mark All Absent</button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {attBatchStudents.map((s) => (
                      <div key={s._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
                            {s.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{s.name}</p>
                            <p className="text-xs text-slate-400">{s.rollNumber}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {(['PRESENT', 'ABSENT', 'LATE'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => setAttRecords((p) => ({ ...p, [s._id]: status }))}
                              className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                                attRecords[s._id] === status
                                  ? status === 'PRESENT' ? 'bg-emerald-500 text-white border-emerald-500'
                                    : status === 'ABSENT' ? 'bg-red-500 text-white border-red-500'
                                    : 'bg-amber-400 text-white border-amber-400'
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <Button variant="primary" onClick={handleSaveAttendance} disabled={isSavingAtt} className="flex items-center gap-2">
                      {isSavingAtt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {isSavingAtt ? 'Saving…' : 'Save Attendance'}
                    </Button>
                    {attSaveSuccess && <span className="text-emerald-600 text-sm font-medium flex items-center gap-1"><Check className="w-4 h-4" /> Saved successfully</span>}
                  </div>
                </>
              )}
            </div>

            {/* History */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-700 mb-4">Recent Sessions</h2>
              {isLoadingAtt ? <LoadingSpinner /> : attendanceSessions.length === 0 ? (
                <EmptyState icon={<CalendarCheck className="w-8 h-8" />} title="No Sessions Yet" description="Attendance records will appear here once saved." />
              ) : (
                <div className="space-y-3">
                  {attendanceSessions.slice(0, 10).map((session) => {
                    const present = session.records.filter((r) => r.status === 'PRESENT').length;
                    const total = session.records.length;
                    return (
                      <div key={session._id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50">
                        <div>
                          <p className="font-medium text-slate-800">{new Date(session.date).toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
                          <p className="text-xs text-slate-500">{session.batch?.name} · {session.topicCovered || 'No topic recorded'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-600">{present}/{total} Present</p>
                          <p className="text-xs text-slate-400">{total > 0 ? Math.round((present / total) * 100) : 0}% rate</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MATERIALS */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'materials' && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-slate-700">Study Materials</h2>
                <p className="text-sm text-slate-500">Upload and manage learning resources for your batches</p>
              </div>
              <Button variant="primary" className="flex items-center gap-2" onClick={() => alert('File upload via cloud storage (S3/Cloudinary) integration required. Backend endpoint: POST /api/materials — Ask admin to configure storage credentials.')}>
                <Upload className="w-4 h-4" /> Upload Material
              </Button>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center bg-slate-50 mb-6">
              <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium mb-1">Upload learning resources</p>
              <p className="text-sm text-slate-400 mb-4">PDFs, presentations, Word documents, videos (up to 50MB)</p>
              <div className="flex items-center justify-center gap-3">
                <select className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">Select Batch</option>
                  {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
                <select className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option>Document</option>
                  <option>Slides</option>
                  <option>Cheatsheet</option>
                  <option>Video</option>
                </select>
                <Button variant="outline" size="sm">Choose File</Button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Storage Configuration Required:</strong> To enable file uploads, the school admin must configure a cloud storage provider (AWS S3 or Cloudinary) in the platform settings. Currently materials are managed centrally by your school admin.</span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ASSIGNMENTS */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setCreateAssignmentOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Assignment
              </Button>
            </div>

            {isLoadingAssignments ? <LoadingSpinner /> : assignments.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-8 h-8" />}
                title="No Assignments Yet"
                description="Create an assignment to get started."
                action={<Button variant="primary" onClick={() => setCreateAssignmentOpen(true)}>Create First Assignment</Button>}
              />
            ) : (
              <div className="space-y-3">
                {assignments.map((asg) => (
                  <div key={asg._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">{asg.title}</h3>
                        <p className="text-sm text-slate-500">{asg.batch?.name} · Due: {new Date(asg.dueDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                      </div>
                      <Badge variant={new Date(asg.dueDate) < new Date() ? 'danger' : 'success'} size="sm">
                        {new Date(asg.dueDate) < new Date() ? 'Overdue' : 'Active'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{asg.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{asg.submittedCount}/{asg.totalStudents} submitted</span>
                        <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" />{asg.gradedCount} graded</span>
                        <span className="flex items-center gap-1"><Award className="w-3 h-3 text-amber-500" />Max: {asg.totalMarks} marks</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleOpenSubmissions(asg)}>
                        View Submissions
                      </Button>
                    </div>
                    {asg.submittedCount > asg.gradedCount && (
                      <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 font-medium">
                        ⚠ {asg.submittedCount - asg.gradedCount} submission{asg.submittedCount - asg.gradedCount !== 1 ? 's' : ''} pending grading
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* QUIZZES */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'quizzes' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setCreateQuizOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Quiz/Test
              </Button>
            </div>

            {isLoadingQuizzes ? <LoadingSpinner /> : quizzes.length === 0 ? (
              <EmptyState
                icon={<CheckSquare className="w-8 h-8" />}
                title="No Quizzes Yet"
                description="Create a quiz or test for your students."
                action={<Button variant="primary" onClick={() => setCreateQuizOpen(true)}>Create First Quiz</Button>}
              />
            ) : (
              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <div key={quiz._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">{quiz.title}</h3>
                        <p className="text-sm text-slate-500">{quiz.batch?.name} · {quiz.durationMinutes} min · Pass: {quiz.passingScore}%</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(quiz.status)} size="sm">{quiz.status}</Badge>
                    </div>
                    {quiz.description && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{quiz.description}</p>}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span><strong>{quiz.questions.length}</strong> questions</span>
                        <span><strong>{quiz.attemptCount}</strong> attempts</span>
                        <span className="text-emerald-600"><strong>{quiz.passCount}</strong> passed</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleOpenQuizResults(quiz)}>
                        View Results
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MARKS & RESULTS */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'marks' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-700 mb-4">Assignment Marks</h2>
              {isLoadingAssignments ? <LoadingSpinner /> : assignments.length === 0 ? (
                <EmptyState icon={<FileText className="w-8 h-8" />} title="No Assignments" description="Create assignments first to track marks." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-3">Assignment</th>
                        <th className="text-left px-4 py-3">Batch</th>
                        <th className="text-left px-4 py-3">Max Marks</th>
                        <th className="text-left px-4 py-3">Submitted</th>
                        <th className="text-left px-4 py-3">Graded</th>
                        <th className="text-left px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assignments.map((a) => (
                        <tr key={a._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{a.title}</td>
                          <td className="px-4 py-3 text-slate-600">{a.batch?.name}</td>
                          <td className="px-4 py-3 text-slate-700">{a.totalMarks}</td>
                          <td className="px-4 py-3"><Badge variant="info" size="sm">{a.submittedCount}</Badge></td>
                          <td className="px-4 py-3"><Badge variant={a.gradedCount === a.submittedCount && a.submittedCount > 0 ? 'success' : 'warning'} size="sm">{a.gradedCount}</Badge></td>
                          <td className="px-4 py-3">
                            <Button variant="outline" size="sm" onClick={() => handleOpenSubmissions(a)}>Grade</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-700 mb-4">Quiz Results Summary</h2>
              {isLoadingQuizzes ? <LoadingSpinner /> : quizzes.length === 0 ? (
                <EmptyState icon={<CheckSquare className="w-8 h-8" />} title="No Tests Yet" description="Create tests to see marks summary." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-3">Quiz</th>
                        <th className="text-left px-4 py-3">Batch</th>
                        <th className="text-left px-4 py-3">Attempts</th>
                        <th className="text-left px-4 py-3">Passed</th>
                        <th className="text-left px-4 py-3">Pass Rate</th>
                        <th className="text-left px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {quizzes.map((q) => (
                        <tr key={q._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{q.title}</td>
                          <td className="px-4 py-3 text-slate-600">{q.batch?.name}</td>
                          <td className="px-4 py-3">{q.attemptCount}</td>
                          <td className="px-4 py-3 text-emerald-600">{q.passCount}</td>
                          <td className="px-4 py-3">
                            {q.attemptCount > 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((q.passCount / q.attemptCount) * 100)}%` }} />
                                </div>
                                <span className="text-xs text-slate-600">{Math.round((q.passCount / q.attemptCount) * 100)}%</span>
                              </div>
                            ) : <span className="text-slate-400 text-xs">No data</span>}
                          </td>
                          <td className="px-4 py-3">
                            <Button variant="outline" size="sm" onClick={() => handleOpenQuizResults(q)}>View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* PROGRESS */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'progress' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <select
                value={progressBatch}
                onChange={(e) => setProgressBatch(e.target.value)}
                className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="">All Batches</option>
                {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <span className="text-sm text-slate-500">{progress.length} student{progress.length !== 1 ? 's' : ''}</span>
            </div>

            {isLoadingProgress ? <LoadingSpinner /> : progress.length === 0 ? (
              <EmptyState icon={<TrendingUp className="w-8 h-8" />} title="No Progress Data" description="Progress data will appear once students have attendance, assignments, and quiz records." />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="text-left px-5 py-3">Student</th>
                      <th className="text-left px-5 py-3">Batch</th>
                      <th className="text-left px-5 py-3">Attendance</th>
                      <th className="text-left px-5 py-3">Assignments</th>
                      <th className="text-left px-5 py-3">Avg Quiz</th>
                      <th className="text-left px-5 py-3">Overall</th>
                      <th className="text-left px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {progress.map((p) => (
                      <tr key={p.studentId} className="hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold overflow-hidden">
                              {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : p.name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{p.name}</p>
                              <p className="text-xs text-slate-400">{p.rollNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-600 text-xs">{p.batch?.name || '—'}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${p.attendanceRate}%`, background: p.attendanceRate >= 80 ? '#10b981' : p.attendanceRate >= 60 ? '#f59e0b' : '#ef4444' }} />
                            </div>
                            <span className="text-xs text-slate-600">{p.attendanceRate}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${p.assignmentRate}%`, background: '#6366f1' }} />
                            </div>
                            <span className="text-xs text-slate-600">{p.assignmentRate}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-700 font-medium">{p.avgQuiz > 0 ? `${p.avgQuiz}%` : '—'}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${p.overall}%`, background: p.overall >= 80 ? '#10b981' : p.overall >= 60 ? '#f59e0b' : '#ef4444' }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{p.overall}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">{getPerformanceBadge(p.overall)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* REMARKS */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'remarks' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setAddRemarkOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Remark
              </Button>
            </div>

            {savedRemarks.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="w-8 h-8" />}
                title="No Remarks Yet"
                description="Add academic feedback, behavioural notes, or achievement remarks for your students."
                action={<Button variant="primary" onClick={() => setAddRemarkOpen(true)}>Add First Remark</Button>}
              />
            ) : (
              <div className="space-y-3">
                {savedRemarks.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">{r.studentName}</p>
                        <p className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
                      </div>
                      <Badge variant={r.type === 'ACHIEVEMENT' ? 'success' : r.type === 'CONCERN' ? 'danger' : r.type === 'BEHAVIOUR' ? 'warning' : 'info'} size="sm">
                        {r.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-3">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* REPORTS */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'reports' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <select
                value={reportBatch}
                onChange={(e) => setReportBatch(e.target.value)}
                className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="">All Batches</option>
                {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={async () => {
                setIsLoadingReports(true);
                const url = reportBatch ? `/teachers/me/reports?batchId=${reportBatch}` : '/teachers/me/reports';
                const res = await api.get(url);
                if (res.success) setReports(res.data || []);
                setIsLoadingReports(false);
              }}>
                <RefreshCw className="w-3 h-3" /> Refresh
              </Button>
            </div>

            {isLoadingReports ? <LoadingSpinner /> : reports.length === 0 ? (
              <EmptyState icon={<BarChart2 className="w-8 h-8" />} title="No Report Data" description="Reports are generated from real attendance, assignment, and quiz records." />
            ) : (
              reports.map((r) => (
                <div key={r.batchId} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{r.batchName}</h3>
                      <p className="text-sm text-slate-500">{r.grade} · Section {r.section} · {r.program}</p>
                    </div>
                    <Badge variant="info" size="sm">{r.totalStudents} students</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                    <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-100">
                      <p className="text-2xl font-bold text-emerald-600">{r.batchAttRate}%</p>
                      <p className="text-xs text-emerald-700 font-medium mt-1">Attendance Rate</p>
                      <p className="text-xs text-emerald-500">{r.totalSessions} sessions</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4 text-center border border-indigo-100">
                      <p className="text-2xl font-bold text-indigo-600">{r.totalSubmissions}</p>
                      <p className="text-xs text-indigo-700 font-medium mt-1">Submissions</p>
                      <p className="text-xs text-indigo-500">{r.totalAssignments} assignments</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-100">
                      <p className="text-2xl font-bold text-amber-600">{r.gradedSubmissions}</p>
                      <p className="text-xs text-amber-700 font-medium mt-1">Graded</p>
                      <p className="text-xs text-amber-500">{r.totalSubmissions > 0 ? Math.round((r.gradedSubmissions / r.totalSubmissions) * 100) : 0}% graded</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-100">
                      <p className="text-2xl font-bold text-purple-600">{r.avgQuizScore > 0 ? `${r.avgQuizScore}%` : '—'}</p>
                      <p className="text-xs text-purple-700 font-medium mt-1">Avg Quiz Score</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Overall Performance</p>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.round((r.batchAttRate * 0.35 + (r.totalAssignments > 0 ? (r.totalSubmissions / (r.totalAssignments * r.totalStudents)) * 100 : 0) * 0.35 + r.avgQuizScore * 0.3))}%`,
                          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODALS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}

      {/* Create Assignment Modal */}
      <Modal isOpen={createAssignmentOpen} onClose={() => setCreateAssignmentOpen(false)} title="Create Assignment">
        <form onSubmit={handleCreateAssignment} className="space-y-4 p-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Batch *</label>
            <select
              required
              value={newAssignment.batchId}
              onChange={(e) => setNewAssignment((p) => ({ ...p, batchId: e.target.value }))}
              className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <Input
            label="Title *"
            value={newAssignment.title}
            onChange={(e) => setNewAssignment((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Module 3 – AI Project Research"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Instructions *</label>
            <textarea
              required
              rows={3}
              value={newAssignment.description}
              onChange={(e) => setNewAssignment((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe what students need to do…"
              className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Due Date *</label>
              <input
                type="date"
                required
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment((p) => ({ ...p, dueDate: e.target.value }))}
                className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <Input
              label="Max Marks"
              type="number"
              value={String(newAssignment.totalMarks)}
              onChange={(e) => setNewAssignment((p) => ({ ...p, totalMarks: Number(e.target.value) }))}
              min="1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateAssignmentOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isCreatingAssignment}>
              {isCreatingAssignment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Assignment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submissions / Grading Modal */}
      <Modal isOpen={submissionsOpen} onClose={() => { setSubmissionsOpen(false); setGradingSub(null); }} title={`Submissions — ${selectedAssignment?.title || ''}`}>
        <div className="space-y-4 p-1 max-h-[60vh] overflow-y-auto">
          {isLoadingSubmissions ? <LoadingSpinner /> : submissions.length === 0 ? (
            <EmptyState icon={<FileText className="w-8 h-8" />} title="No Submissions Yet" description="Students have not submitted this assignment yet." />
          ) : submissions.map((sub) => (
            <div key={sub._id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-sm font-bold">
                    {sub.student?.user?.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-800">{sub.student?.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{new Date(sub.submittedAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(sub.status)} size="sm">{sub.status}</Badge>
              </div>
              {sub.notes && <p className="text-sm text-slate-600 mb-2">{sub.notes}</p>}
              {sub.fileUrl && <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline flex items-center gap-1 mb-2"><ExternalLink className="w-3 h-3" /> View Submission</a>}
              {sub.marksObtained !== undefined && (
                <div className="bg-emerald-50 px-3 py-2 rounded-lg text-sm">
                  <span className="font-semibold text-emerald-700">Marks: {sub.marksObtained}/{selectedAssignment?.totalMarks}</span>
                  {sub.feedback && <p className="text-emerald-600 text-xs mt-0.5">{sub.feedback}</p>}
                </div>
              )}
              {gradingSub?._id === sub._id ? (
                <form onSubmit={handleSaveGrade} className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  <Input
                    label={`Marks (max ${selectedAssignment?.totalMarks})`}
                    type="number"
                    min="0"
                    max={String(selectedAssignment?.totalMarks)}
                    value={String(gradeMarks)}
                    onChange={(e) => setGradeMarks(Number(e.target.value))}
                    required
                  />
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Feedback</label>
                    <textarea
                      rows={2}
                      value={gradeFeedback}
                      onChange={(e) => setGradeFeedback(e.target.value)}
                      className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" size="sm" disabled={isGrading}>
                      {isGrading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Grade'}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setGradingSub(null)}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <button
                  className="mt-2 text-xs text-brand-600 hover:underline font-medium"
                  onClick={() => { setGradingSub(sub); setGradeMarks(sub.marksObtained ?? 0); setGradeFeedback(sub.feedback || ''); }}
                >
                  {sub.status === 'GRADED' ? 'Edit Grade' : 'Grade Submission'}
                </button>
              )}
            </div>
          ))}
        </div>
      </Modal>

      {/* Create Quiz Modal */}
      <Modal isOpen={createQuizOpen} onClose={() => setCreateQuizOpen(false)} title="Create Quiz / Test">
        <form onSubmit={handleCreateQuiz} className="space-y-4 p-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Batch *</label>
            <select
              required
              value={newQuiz.batchId}
              onChange={(e) => setNewQuiz((p) => ({ ...p, batchId: e.target.value }))}
              className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <Input
            label="Quiz Title *"
            value={newQuiz.title}
            onChange={(e) => setNewQuiz((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Module 3 Mid-Term Assessment"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
            <textarea
              rows={2}
              value={newQuiz.description}
              onChange={(e) => setNewQuiz((p) => ({ ...p, description: e.target.value }))}
              className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (minutes)"
              type="number"
              value={String(newQuiz.durationMinutes)}
              onChange={(e) => setNewQuiz((p) => ({ ...p, durationMinutes: Number(e.target.value) }))}
              min="5"
            />
            <Input
              label="Passing Score (%)"
              type="number"
              value={String(newQuiz.passingScore)}
              onChange={(e) => setNewQuiz((p) => ({ ...p, passingScore: Number(e.target.value) }))}
              min="1"
              max="100"
            />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <strong>Note:</strong> Default quiz questions are pre-populated. To customize questions, use the quiz editor after creation (coming soon) or contact your school admin.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateQuizOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isCreatingQuiz}>
              {isCreatingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Quiz'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quiz Results Modal */}
      <Modal isOpen={quizResultsOpen} onClose={() => setQuizResultsOpen(false)} title={`Results — ${selectedQuiz?.title || ''}`}>
        <div className="space-y-3 p-1 max-h-[60vh] overflow-y-auto">
          {isLoadingQuizResults ? <LoadingSpinner /> : quizResults.length === 0 ? (
            <EmptyState icon={<CheckSquare className="w-8 h-8" />} title="No Attempts Yet" description="No students have attempted this quiz yet." />
          ) : quizResults.map((r) => (
            <div key={r._id} className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-sm font-bold">
                  {r.student?.user?.name?.[0] || '?'}
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-800">{r.student?.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-400">{new Date(r.completedAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">{r.score}/{r.totalMarks}</p>
                <p className="text-xs">{r.percentage}% · <span className={r.passed ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>{r.passed ? 'Passed' : 'Failed'}</span></p>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Add Remark Modal */}
      <Modal isOpen={addRemarkOpen} onClose={() => setAddRemarkOpen(false)} title="Add Student Remark">
        <form onSubmit={handleSaveRemark} className="space-y-4 p-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Student *</label>
            <select
              required
              value={remarkTarget?._id || ''}
              onChange={(e) => {
                const s = remarkStudents.find((x) => x._id === e.target.value);
                setRemarkTarget(s || null);
              }}
              className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="">Select a student…</option>
              {remarkStudents.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Remark Type *</label>
            <select
              value={remarkType}
              onChange={(e) => setRemarkType(e.target.value as any)}
              className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="ACADEMIC">Academic</option>
              <option value="BEHAVIOUR">Behaviour</option>
              <option value="ACHIEVEMENT">Achievement</option>
              <option value="CONCERN">Concern</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Remark *</label>
            <textarea
              required
              rows={4}
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="Write your feedback or observation…"
              className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddRemarkOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSavingRemark}>
              {isSavingRemark ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Remark'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Google Classroom Configuration Modal */}
      <Modal
        isOpen={editClassroomOpen}
        onClose={() => setEditClassroomOpen(false)}
        title={`Configure Google Classroom — ${selectedBatchForClassroom?.name || 'Batch'}`}
      >
        <form onSubmit={handleSaveClassroom} className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 leading-relaxed">
            <p className="font-semibold flex items-center gap-1.5 mb-1">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              Live Class Routing
            </p>
            When students of <strong>{selectedBatchForClassroom?.name}</strong> click &quot;Join Live Class&quot; or &quot;Join Classroom&quot;, they will be securely directed to this Classroom link.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Classroom / Live Class URL *
            </label>
            <Input
              required
              placeholder="https://classroom.google.com/c/... or https://meet.google.com/..."
              value={classroomUrlInput}
              onChange={(e) => setClassroomUrlInput(e.target.value)}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Must be a valid web link (e.g. Google Classroom course page or Google Meet link).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Class Code (Optional)
            </label>
            <Input
              placeholder="e.g. abc1234"
              value={classroomCodeInput}
              onChange={(e) => setClassroomCodeInput(e.target.value)}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Provide the Google Classroom join code if students need to enter it on their Google account.
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <strong>Note:</strong> Google Classroom requires students to sign in with their authorized Google or school account. ALYSTRO authentication grants access to this link, but student Google membership is verified by Google.
          </div>

          {classroomError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
              {classroomError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditClassroomOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={classroomSaving}>
              {classroomSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Classroom Link'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
