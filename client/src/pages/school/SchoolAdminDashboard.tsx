import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Layers,
  CalendarCheck,
  Plus,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Award,
  Download,
  UserCheck,
  Bell,
  Mail,
  Phone,
  Clock,
  Pin,
  CreditCard,
  DollarSign,
  FileText,
  Sparkles,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  ChevronRight,
  Filter,
  BarChart2,
  QrCode,
  ExternalLink,
  FileCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { api } from '../../services/api';
import { Student, Batch } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { exportToCsv } from '../../utils/exportCsv';

export type SchoolTab =
  | 'students'
  | 'bulk-import'
  | 'classes'
  | 'batches'
  | 'teachers'
  | 'attendance'
  | 'assignments'
  | 'tests'
  | 'progress'
  | 'certificates'
  | 'reports'
  | 'notices'
  | 'affiliations'
  | 'billing';

interface SchoolAdminDashboardProps {
  defaultTab?: SchoolTab;
}

export const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ defaultTab = 'students' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SchoolTab>(defaultTab);

  // Core Data States
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<any>(null);
  const [commercialData, setCommercialData] = useState<any>(null);
  const [commercialError, setCommercialError] = useState<string>('');
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [affiliationLoading, setAffiliationLoading] = useState(false);

  // Modules Data States
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Sync tab with props
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Modals visibility
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [editStudentModalOpen, setEditStudentModalOpen] = useState(false);
  const [viewStudentModalOpen, setViewStudentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [bulkResult, setBulkResult] = useState<any | null>(null);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  const [addClassModalOpen, setAddClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const [addBatchModalOpen, setAddBatchModalOpen] = useState(false);
  const [batchForm, setBatchForm] = useState({
    name: '',
    programId: '',
    teacherId: '',
    grade: 'Class 7',
    section: 'A',
    maxCapacity: 40,
    schedule: 'Monday to Friday, 10:00 AM - 11:00 AM',
    googleClassroomUrl: '',
    googleClassroomCode: '',
  });

  const [editAdminClassroomOpen, setEditAdminClassroomOpen] = useState(false);
  const [adminBatchForClassroom, setAdminBatchForClassroom] = useState<any | null>(null);
  const [adminClassroomUrl, setAdminClassroomUrl] = useState('');
  const [adminClassroomCode, setAdminClassroomCode] = useState('');
  const [adminClassroomSaving, setAdminClassroomSaving] = useState(false);

  const [assignStudentsModalOpen, setAssignStudentsModalOpen] = useState(false);
  const [assignBatchTarget, setAssignBatchTarget] = useState<any | null>(null);
  const [selectedStudentIdsForBatch, setSelectedStudentIdsForBatch] = useState<string[]>([]);
  const [isAssigningStudents, setIsAssigningStudents] = useState(false);

  const [addTeacherModalOpen, setAddTeacherModalOpen] = useState(false);
  const [editTeacherModalOpen, setEditTeacherModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'Artificial Intelligence & Robotics',
    qualification: 'B.Tech in Computer Science',
  });
  const [isSubmittingTeacher, setIsSubmittingTeacher] = useState(false);

  // Attendance Register State
  const [attendanceBatchId, setAttendanceBatchId] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceTopic, setAttendanceTopic] = useState('');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // Assignment Modal
  const [addAssignmentModalOpen, setAddAssignmentModalOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    batchId: '',
    programId: '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    maxMarks: 100,
  });
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedAssignmentSubmissions, setSelectedAssignmentSubmissions] = useState<any[]>([]);
  const [selectedAssignmentTitle, setSelectedAssignmentTitle] = useState('');
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [gradeFeedback, setGradeFeedback] = useState<string>('Good effort!');

  // Test / Quiz State
  const [addQuizModalOpen, setAddQuizModalOpen] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    programId: '',
    batchId: '',
    duration: 30,
    passingScore: 60,
    questions: [
      {
        questionText: 'What is the primary role of Machine Learning?',
        options: [
          'To write HTML code',
          'To learn patterns from data and make predictions',
          'To design graphics',
          'To store database files',
        ],
        correctAnswer: 1,
        marks: 10,
      },
    ],
  });
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizResultsModalOpen, setQuizResultsModalOpen] = useState(false);
  const [selectedQuizResults, setSelectedQuizResults] = useState<any[]>([]);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState('');

  // Certificates State
  const [issueCertModalOpen, setIssueCertModalOpen] = useState(false);
  const [certForm, setCertForm] = useState({
    studentId: '',
    programId: '',
    grade: 'Distinction',
    completionDate: new Date().toISOString().split('T')[0],
  });
  const [isIssuingCert, setIsIssuingCert] = useState(false);

  // Notice Board State
  const [postNoticeModalOpen, setPostNoticeModalOpen] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'ACADEMIC',
    targetRole: 'ALL',
    pinned: false,
  });
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);

  // Student Form State (Add / Edit)
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    grade: 'Class 7',
    section: 'A',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    batchId: '',
    programId: '',
    avatar: '',
    status: 'ACTIVE',
    enrolledAt: new Date().toISOString().split('T')[0],
  });
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

  // Load all data
  const loadData = async () => {
    try {
      const [
        statsRes,
        studentsRes,
        batchesRes,
        teachersRes,
        noticesRes,
        programsRes,
        schoolRes,
        affilRes,
        termsRes,
        attRes,
        assignRes,
        quizzesRes,
        quizResultsRes,
        certsRes,
      ] = await Promise.all([
        api.get('/stats/school').catch(() => ({ success: false })),
        api.get(`/students?search=${encodeURIComponent(search)}`).catch(() => ({ success: false })),
        api.get('/batches').catch(() => ({ success: false })),
        api.get('/teachers').catch(() => ({ success: false })),
        api.get('/notices').catch(() => ({ success: false })),
        api.get('/programs').catch(() => ({ success: false })),
        api.get('/schools/profile/me').catch(() => ({ success: false })),
        api.get('/schools/affiliations/requests').catch(() => ({ success: false })),
        api.get('/pricing/school/my-terms').catch((err: any) => ({ success: false, message: err.message })),
        api.get('/attendance').catch(() => ({ success: false })),
        api.get('/assignments').catch(() => ({ success: false })),
        api.get('/quizzes').catch(() => ({ success: false })),
        api.get('/quizzes/all/results').catch(() => ({ success: false })),
        api.get('/certificates').catch(() => ({ success: false })),
      ]);

      if (statsRes.success) setStats(statsRes.data?.summary);
      if (studentsRes.success) setStudents(studentsRes.data || []);
      if (batchesRes.success) {
        setBatches(batchesRes.data || []);
        if (batchesRes.data?.[0] && !attendanceBatchId) {
          setAttendanceBatchId(batchesRes.data[0]._id);
        }
      }
      if (teachersRes.success) setTeachers(teachersRes.data || []);
      if (noticesRes.success) setNotices(noticesRes.data || []);
      if (programsRes.success) setPrograms(programsRes.data || []);
      if (schoolRes.success) setSchoolProfile(schoolRes.data || null);
      if (affilRes?.success && Array.isArray(affilRes.data)) setAffiliations(affilRes.data);
      if (attRes.success) setAttendanceRecords(attRes.data || []);
      if (assignRes.success) setAssignments(assignRes.data || []);
      if (quizzesRes.success) setQuizzes(quizzesRes.data || []);
      if (quizResultsRes.success) setQuizResults(quizResultsRes.data || []);
      if (certsRes.success) setCertificates(certsRes.data || []);

      if (termsRes?.success && termsRes.data) {
        setCommercialData(termsRes.data);
        setCommercialError('');
      } else if (termsRes?.message) {
        setCommercialError(termsRes.message);
      }
    } catch (err: any) {
      console.error('Error loading school dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  // Sync attendance table when batch changes
  useEffect(() => {
    if (!attendanceBatchId) return;
    const batchStudents = students.filter(
      (s) => (typeof s.batch === 'object' ? s.batch?._id : s.batch) === attendanceBatchId
    );

    // Check if there is already an existing attendance document for this batch & date
    const existing = attendanceRecords.find((rec) => {
      const bId = typeof rec.batch === 'object' ? rec.batch?._id : rec.batch;
      if (bId !== attendanceBatchId) return false;
      const recDate = new Date(rec.date).toISOString().split('T')[0];
      return recDate === attendanceDate;
    });

    const initialMap: Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'> = {};
    if (existing && Array.isArray(existing.records)) {
      setAttendanceTopic(existing.topicCovered || '');
      existing.records.forEach((r: any) => {
        const stId = typeof r.student === 'object' ? r.student?._id : r.student;
        if (stId) initialMap[stId] = r.status || 'PRESENT';
      });
    } else {
      setAttendanceTopic('');
      batchStudents.forEach((st) => {
        initialMap[st._id] = 'PRESENT';
      });
    }
    setAttendanceMap(initialMap);
  }, [attendanceBatchId, attendanceDate, attendanceRecords, students]);

  // ==================== HANDLERS ====================

  // Student: Create
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingStudent(true);
    try {
      const payload: any = {
        name: studentForm.name,
        email: studentForm.email,
        password: studentForm.password || 'Alystro@123',
        rollNumber: studentForm.rollNumber,
        grade: studentForm.grade,
        section: studentForm.section,
        parentName: studentForm.parentName,
        parentPhone: studentForm.parentPhone,
        parentEmail: studentForm.parentEmail,
        batchId: studentForm.batchId || undefined,
        programId: studentForm.programId || undefined,
        avatar: studentForm.avatar || undefined,
      };

      const res = await api.post('/students', payload);
      if (res.success) {
        setAddStudentModalOpen(false);
        setStudentForm({
          name: '',
          email: '',
          password: '',
          rollNumber: '',
          grade: 'Class 7',
          section: 'A',
          parentName: '',
          parentPhone: '',
          parentEmail: '',
          batchId: batches[0]?._id || '',
          programId: programs[0]?._id || '',
          avatar: '',
          status: 'ACTIVE',
          enrolledAt: new Date().toISOString().split('T')[0],
        });
        await loadData();
        alert('Student successfully enrolled into the school tenant.');
      } else {
        alert(res.message || 'Failed to enroll student.');
      }
    } catch (err: any) {
      alert(err.message || 'Error enrolling student.');
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  // Student: Edit Open
  const handleOpenEditStudent = (st: any) => {
    setSelectedStudent(st);
    setStudentForm({
      name: st.name || '',
      email: st.email || '',
      password: '',
      rollNumber: st.rollNumber || '',
      grade: st.grade || 'Class 7',
      section: st.section || 'A',
      parentName: st.parentName || '',
      parentPhone: st.parentPhone || '',
      parentEmail: st.parentEmail || '',
      batchId: (typeof st.batch === 'object' ? st.batch?._id : st.batch) || '',
      programId: (typeof st.program === 'object' ? st.program?._id : st.program) || '',
      avatar: st.avatar || '',
      status: st.status || 'ACTIVE',
      enrolledAt: st.enrolledAt ? new Date(st.enrolledAt).toISOString().split('T')[0] : '',
    });
    setEditStudentModalOpen(true);
  };

  // Student: Save Edit
  const handleSaveEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsSubmittingStudent(true);
    try {
      const payload: any = {
        name: studentForm.name,
        rollNumber: studentForm.rollNumber,
        grade: studentForm.grade,
        section: studentForm.section,
        parentName: studentForm.parentName,
        parentPhone: studentForm.parentPhone,
        parentEmail: studentForm.parentEmail,
        batchId: studentForm.batchId || null,
        programId: studentForm.programId || null,
        avatar: studentForm.avatar,
        status: studentForm.status,
      };

      const res = await api.put(`/students/${selectedStudent._id}`, payload);
      if (res.success) {
        setEditStudentModalOpen(false);
        await loadData();
        alert('Student records updated successfully.');
      } else {
        alert(res.message || 'Failed to update student.');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating student.');
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  // Student: Delete
  const handleDeleteStudent = async (st: any) => {
    if (!window.confirm(`Are you sure you want to remove student "${st.name}" (${st.rollNumber})? This will revoke login and batch assignment.`)) {
      return;
    }
    try {
      const res = await api.delete(`/students/${st._id}`);
      if (res.success) {
        await loadData();
        alert('Student successfully removed from the institution.');
      } else {
        alert(res.message || 'Failed to remove student.');
      }
    } catch (err: any) {
      alert(err.message || 'Error removing student.');
    }
  };

  // Bulk Import
  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;
    setIsSubmittingBulk(true);
    setBulkResult(null);

    try {
      const lines = csvText.trim().split('\n');
      const parsedRows = lines
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.toLowerCase().startsWith('name'))
        .map((line) => {
          const parts = line.split(',').map((p) => p.trim());
          return {
            name: parts[0] || '',
            email: parts[1] || '',
            rollNumber: parts[2] || '',
            grade: parts[3] || 'Class 7',
            section: parts[4] || 'A',
            parentName: parts[5] || '',
            parentPhone: parts[6] || '',
            parentEmail: parts[7] || '',
            batchId: batches[0]?._id,
          };
        });

      const res = await api.post('/students/bulk-import', { students: parsedRows });
      if (res.success) {
        setBulkResult(res.data);
        await loadData();
      } else {
        alert(res.message || 'Bulk import failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Error executing bulk import');
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  const fillSampleCsv = () => {
    setCsvText(
      `Name, Email, RollNumber, Grade, Section, ParentName, ParentPhone, ParentEmail\n` +
        `Manish Gupta, manish.gupta@student.alystro.com, ABC-701, Class 7, A, Rajiv Gupta, +91 98290 12001, rajiv.gupta@example.com\n` +
        `Sneha Sharma, sneha.sharma@student.alystro.com, ABC-702, Class 7, A, Ramesh Sharma, +91 98290 12002, ramesh.sharma@example.com\n` +
        `Kunal Rawat, kunal.rawat@student.alystro.com, ABC-703, Class 8, B, Sunita Rawat, +91 98290 12003, sunita.rawat@example.com`
    );
  };

  // Classes: Add & Remove
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      const res = await api.post('/schools/classes/add', { className: newClassName.trim() });
      if (res.success) {
        setNewClassName('');
        setAddClassModalOpen(false);
        await loadData();
        alert('Class added to school curriculum.');
      } else {
        alert(res.message || 'Failed to add class.');
      }
    } catch (err: any) {
      alert(err.message || 'Error adding class.');
    }
  };

  const handleRemoveClass = async (className: string) => {
    if (!window.confirm(`Are you sure you want to remove ${className} from the school classes list?`)) return;
    try {
      const res = await api.post('/schools/classes/remove', { className });
      if (res.success) {
        await loadData();
        alert(`Class "${className}" removed.`);
      } else {
        alert(res.message || 'Failed to remove class.');
      }
    } catch (err: any) {
      alert(err.message || 'Error removing class.');
    }
  };

  // Batches: Create
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: batchForm.name,
        grade: batchForm.grade,
        section: batchForm.section,
        programId: batchForm.programId || (programs[0]?._id ?? undefined),
        teacherId: batchForm.teacherId || (teachers[0]?._id ?? undefined),
        maxStudents: Number(batchForm.maxCapacity) || 40,
        schedule: batchForm.schedule,
        googleClassroomUrl: batchForm.googleClassroomUrl.trim() || undefined,
        googleClassroomCode: batchForm.googleClassroomCode.trim() || undefined,
        meetingLink: batchForm.googleClassroomUrl.trim() || undefined,
      };

      const res = await api.post('/batches', payload);
      if (res.success) {
        setAddBatchModalOpen(false);
        setBatchForm({
          name: '',
          programId: '',
          teacherId: '',
          grade: 'Class 7',
          section: 'A',
          maxCapacity: 40,
          schedule: 'Monday to Friday, 10:00 AM - 11:00 AM',
          googleClassroomUrl: '',
          googleClassroomCode: '',
        });
        await loadData();
        alert('New batch created successfully with Google Classroom configuration.');
      } else {
        alert(res.message || 'Failed to create batch.');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating batch.');
    }
  };

  // Batches: Update Google Classroom
  const handleSaveAdminClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminBatchForClassroom) return;
    setAdminClassroomSaving(true);
    try {
      const res = await api.put(`/batches/${adminBatchForClassroom._id}`, {
        googleClassroomUrl: adminClassroomUrl.trim(),
        googleClassroomCode: adminClassroomCode.trim(),
        meetingLink: adminClassroomUrl.trim(),
      });
      if (res.success) {
        setEditAdminClassroomOpen(false);
        await loadData();
        alert('Google Classroom link updated for batch.');
      } else {
        alert(res.message || 'Failed to update Classroom link.');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating Classroom link.');
    } finally {
      setAdminClassroomSaving(false);
    }
  };

  // Batches: Delete
  const handleDeleteBatch = async (batchId: string, batchName: string) => {
    if (!window.confirm(`Are you sure you want to delete batch "${batchName}"? Students will be unlinked.`)) return;
    try {
      const res = await api.delete(`/batches/${batchId}`);
      if (res.success) {
        await loadData();
        alert('Batch deleted successfully.');
      } else {
        alert(res.message || 'Failed to delete batch.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting batch.');
    }
  };

  // Batches: Open Assign Students
  const handleOpenAssignStudents = (b: Batch) => {
    setAssignBatchTarget(b);
    // Find all students currently in this batch
    const currentlyInBatch = students
      .filter((s) => (typeof s.batch === 'object' ? s.batch?._id : s.batch) === b._id)
      .map((s) => s._id);
    setSelectedStudentIdsForBatch(currentlyInBatch);
    setAssignStudentsModalOpen(true);
  };

  // Batches: Save Assign Students
  const handleSaveAssignStudents = async () => {
    if (!assignBatchTarget) return;
    setIsAssigningStudents(true);
    try {
      const res = await api.post(`/batches/${assignBatchTarget._id}/assign-students`, {
        studentIds: selectedStudentIdsForBatch,
      });
      if (res.success) {
        setAssignStudentsModalOpen(false);
        await loadData();
        alert(`Successfully assigned ${selectedStudentIdsForBatch.length} students to ${assignBatchTarget.name}.`);
      } else {
        alert(res.message || 'Failed to assign students.');
      }
    } catch (err: any) {
      alert(err.message || 'Error assigning students.');
    } finally {
      setIsAssigningStudents(false);
    }
  };

  // Teachers: Add
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTeacher(true);
    try {
      const res = await api.post('/teachers', {
        name: teacherForm.name,
        email: teacherForm.email,
        phone: teacherForm.phone,
        specialization: teacherForm.specialization,
        qualification: teacherForm.qualification,
        password: 'Alystro@123',
      });
      if (res.success) {
        setAddTeacherModalOpen(false);
        setTeacherForm({
          name: '',
          email: '',
          phone: '',
          specialization: 'Artificial Intelligence & Robotics',
          qualification: 'B.Tech in Computer Science',
        });
        await loadData();
        alert('Teacher successfully registered and linked to school tenant.');
      } else {
        alert(res.message || 'Failed to add teacher.');
      }
    } catch (err: any) {
      alert(err.message || 'Error adding teacher.');
    } finally {
      setIsSubmittingTeacher(false);
    }
  };

  // Teachers: Edit Open
  const handleOpenEditTeacher = (t: any) => {
    setSelectedTeacher(t);
    setTeacherForm({
      name: t.name || '',
      email: t.email || '',
      phone: t.phone || '',
      specialization: t.specialization || '',
      qualification: t.qualification || '',
    });
    setEditTeacherModalOpen(true);
  };

  // Teachers: Save Edit
  const handleSaveEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    setIsSubmittingTeacher(true);
    try {
      const res = await api.put(`/teachers/${selectedTeacher._id}`, {
        name: teacherForm.name,
        phone: teacherForm.phone,
        specialization: teacherForm.specialization,
        qualification: teacherForm.qualification,
      });
      if (res.success) {
        setEditTeacherModalOpen(false);
        await loadData();
        alert('Teacher records updated successfully.');
      } else {
        alert(res.message || 'Failed to update teacher.');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating teacher.');
    } finally {
      setIsSubmittingTeacher(false);
    }
  };

  // Teachers: Delete
  const handleDeleteTeacher = async (t: any) => {
    if (!window.confirm(`Are you sure you want to deactivate teacher "${t.name}"?`)) return;
    try {
      const res = await api.delete(`/teachers/${t._id}`);
      if (res.success) {
        await loadData();
        alert('Teacher deactivated.');
      } else {
        alert(res.message || 'Failed to deactivate teacher.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deactivating teacher.');
    }
  };

  // Attendance: Save Daily
  const handleSaveAttendance = async () => {
    if (!attendanceBatchId) {
      alert('Please select a batch.');
      return;
    }
    setIsSavingAttendance(true);
    try {
      const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
        student: studentId,
        status,
      }));

      const res = await api.post('/attendance/mark', {
        batchId: attendanceBatchId,
        date: attendanceDate,
        topicCovered: attendanceTopic,
        records,
      });

      if (res.success) {
        await loadData();
        alert('Daily attendance submitted and recorded successfully.');
      } else {
        alert(res.message || 'Failed to save attendance.');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving attendance.');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // Assignments: Create
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAssignment(true);
    try {
      const res = await api.post('/assignments', {
        title: assignmentForm.title,
        description: assignmentForm.description,
        batchId: assignmentForm.batchId || (batches[0]?._id ?? undefined),
        programId: assignmentForm.programId || (programs[0]?._id ?? undefined),
        dueDate: assignmentForm.dueDate,
        maxMarks: Number(assignmentForm.maxMarks) || 100,
      });

      if (res.success) {
        setAddAssignmentModalOpen(false);
        setAssignmentForm({
          title: '',
          description: '',
          batchId: '',
          programId: '',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          maxMarks: 100,
        });
        await loadData();
        alert('New assignment created and assigned to batch students.');
      } else {
        alert(res.message || 'Failed to create assignment.');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating assignment.');
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  // Assignments: View Submissions
  const handleViewSubmissions = async (assignment: any) => {
    setSelectedAssignmentTitle(assignment.title);
    try {
      const res = await api.get(`/assignments/${assignment._id}/submissions`);
      if (res.success) {
        setSelectedAssignmentSubmissions(res.data || []);
        setSubmissionsModalOpen(true);
      } else {
        alert(res.message || 'Failed to fetch submissions.');
      }
    } catch (err: any) {
      alert(err.message || 'Error fetching submissions.');
    }
  };

  // Assignments: Grade Submission
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    try {
      const res = await api.put(`/assignments/submissions/${gradingSubmission._id}/grade`, {
        marksObtained: gradeScore,
        feedback: gradeFeedback,
      });

      if (res.success) {
        setGradingSubmission(null);
        await loadData();
        alert('Submission graded successfully.');
        setSubmissionsModalOpen(false);
      } else {
        alert(res.message || 'Failed to grade submission.');
      }
    } catch (err: any) {
      alert(err.message || 'Error grading submission.');
    }
  };

  // Quizzes / Tests: Create
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingQuiz(true);
    try {
      const res = await api.post('/quizzes', {
        title: quizForm.title,
        description: quizForm.description,
        programId: quizForm.programId || (programs[0]?._id ?? undefined),
        batchId: quizForm.batchId || (batches[0]?._id ?? undefined),
        duration: Number(quizForm.duration) || 30,
        passingScore: Number(quizForm.passingScore) || 60,
        questions: quizForm.questions,
      });

      if (res.success) {
        setAddQuizModalOpen(false);
        await loadData();
        alert('Quiz / Assessment test published.');
      } else {
        alert(res.message || 'Failed to create quiz.');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating quiz.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Quizzes / Tests: View Results
  const handleViewQuizResults = async (quiz: any) => {
    setSelectedQuizTitle(quiz.title);
    try {
      const res = await api.get(`/quizzes/${quiz._id}/results`);
      if (res.success) {
        setSelectedQuizResults(res.data || []);
        setQuizResultsModalOpen(true);
      } else {
        alert(res.message || 'Failed to load test results.');
      }
    } catch (err: any) {
      alert(err.message || 'Error loading test results.');
    }
  };

  // Quizzes / Tests: Delete
  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this test and its submission results?')) return;
    try {
      const res = await api.delete(`/quizzes/${quizId}`);
      if (res.success) {
        await loadData();
        alert('Quiz deleted.');
      } else {
        alert(res.message || 'Failed to delete quiz.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting quiz.');
    }
  };

  // Certificates: Issue
  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.studentId) {
      alert('Please select a student.');
      return;
    }
    setIsIssuingCert(true);
    try {
      const res = await api.post('/certificates/issue', {
        studentId: certForm.studentId,
        programId: certForm.programId || (programs[0]?._id ?? undefined),
        grade: certForm.grade,
        completionDate: certForm.completionDate,
      });

      if (res.success) {
        setIssueCertModalOpen(false);
        await loadData();
        alert(`Certificate issued successfully! ID: ${res.data?.certificateId}`);
      } else {
        alert(res.message || 'Failed to issue certificate.');
      }
    } catch (err: any) {
      alert(err.message || 'Error issuing certificate.');
    } finally {
      setIsIssuingCert(false);
    }
  };

  // Notices: Post
  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingNotice(true);
    try {
      const res = await api.post('/notices', noticeForm);
      if (res.success) {
        setPostNoticeModalOpen(false);
        setNoticeForm({
          title: '',
          content: '',
          category: 'ACADEMIC',
          targetRole: 'ALL',
          pinned: false,
        });
        await loadData();
        alert('Notice published on school bulletin.');
      } else {
        alert(res.message || 'Failed to publish notice.');
      }
    } catch (err: any) {
      alert(err.message || 'Error publishing notice.');
    } finally {
      setIsSubmittingNotice(false);
    }
  };

  // Notices: Delete
  const handleDeleteNotice = async (noticeId: string) => {
    if (!window.confirm('Are you sure you want to remove this notice?')) return;
    try {
      const res = await api.delete(`/notices/${noticeId}`);
      if (res.success) {
        await loadData();
        alert('Notice removed.');
      } else {
        alert(res.message || 'Failed to remove notice.');
      }
    } catch (err: any) {
      alert(err.message || 'Error removing notice.');
    }
  };

  // Affiliations: Approve / Reject
  const handleApproveAffiliation = async (id: string) => {
    setAffiliationLoading(true);
    try {
      const res = await api.post(`/schools/affiliations/${id}/approve`);
      if (res.success) {
        await loadData();
      } else {
        alert(res.message || 'Failed to approve affiliation.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to approve affiliation.');
    } finally {
      setAffiliationLoading(false);
    }
  };

  const handleRejectAffiliation = async (id: string) => {
    if (!window.confirm('Reject this affiliation request?')) return;
    setAffiliationLoading(true);
    try {
      const res = await api.post(`/schools/affiliations/${id}/reject`);
      if (res.success) {
        await loadData();
      } else {
        alert(res.message || 'Failed to reject affiliation.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reject affiliation.');
    } finally {
      setAffiliationLoading(false);
    }
  };

  // ==================== CSV EXPORTS ====================

  const handleExportStudentsCsv = () => {
    const dataToExport = filteredStudents.map((s) => ({
      'Roll Number': s.rollNumber,
      Name: s.name,
      Email: s.email,
      Grade: s.grade,
      Section: s.section,
      'Batch Name': typeof s.batch === 'object' ? s.batch?.name : 'Unassigned',
      'Parent Name': s.parentName || '',
      'Parent Phone': s.parentPhone || '',
      'Parent Email': s.parentEmail || '',
      'Enrolled Date': s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : '',
      Status: s.status,
    }));
    exportToCsv('School_Student_Roster', dataToExport);
  };

  const handleExportAttendanceCsv = () => {
    const dataToExport = attendanceRecords.flatMap((rec) => {
      const batchName = typeof rec.batch === 'object' ? rec.batch?.name : 'Batch';
      const dateStr = new Date(rec.date).toLocaleDateString();
      return (rec.records || []).map((r: any) => ({
        Date: dateStr,
        Batch: batchName,
        'Student Name': typeof r.student === 'object' ? r.student?.name : 'Student',
        'Roll Number': typeof r.student === 'object' ? r.student?.rollNumber : '',
        Status: r.status,
        'Topic Covered': rec.topicCovered || '',
      }));
    });
    exportToCsv('School_Attendance_Report', dataToExport);
  };

  const handleExportAcademicReportCsv = () => {
    const dataToExport = quizResults.map((r) => ({
      'Quiz / Test Title': typeof r.quiz === 'object' ? r.quiz?.title : 'Assessment',
      'Student Name': typeof r.student === 'object' ? r.student?.name : 'Student',
      'Roll Number': typeof r.student === 'object' ? r.student?.rollNumber : '',
      Score: r.score,
      'Total Marks': r.totalMarks,
      'Percentage (%)': r.percentage,
      Grade: r.percentage >= 90 ? 'A+' : r.percentage >= 75 ? 'A' : r.percentage >= 60 ? 'B' : r.percentage >= 50 ? 'C' : 'F',
      Result: r.passed ? 'PASSED' : 'FAILED',
      'Completed Date': new Date(r.completedAt || r.createdAt).toLocaleDateString(),
    }));
    exportToCsv('School_Academic_Results_Report', dataToExport);
  };

  const handleExportBillingReportCsv = () => {
    const dataToExport = [
      {
        'School Name': commercialData?.school?.name || 'School',
        'School Code': commercialData?.school?.code || '',
        'Partnership Plan': commercialData?.commercialTerms?.planName || 'Institutional Plan',
        'Total Billed (with GST)': commercialData?.commercialTerms?.billing?.totalBilledAmount || 0,
        'Total Paid': commercialData?.commercialTerms?.billing?.paidAmount || 0,
        'Outstanding Balance': commercialData?.commercialTerms?.billing?.outstandingBalance || 0,
        'Payment Status': commercialData?.commercialTerms?.billing?.paymentStatus || 'PENDING',
        'Total Enrolled Students': students.length,
      },
    ];
    exportToCsv('School_Commercial_Ledger', dataToExport);
  };

  // ==================== FILTERED DATA ====================

  const filteredStudents = students.filter((s) => {
    if (selectedGrade !== 'ALL' && s.grade !== selectedGrade) return false;
    if (selectedBatchFilter !== 'ALL') {
      const bId = typeof s.batch === 'object' ? s.batch?._id : s.batch;
      if (bId !== selectedBatchFilter) return false;
    }
    if (selectedStatusFilter !== 'ALL' && s.status !== selectedStatusFilter) return false;
    return true;
  });

  const schoolClassesList: string[] = schoolProfile?.classesServed || [
    'Class 6',
    'Class 7',
    'Class 8',
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12',
  ];

  // Calculate Student Attendance rate map
  const studentAttendanceRateMap: Record<string, { total: number; present: number; pct: number }> = {};
  attendanceRecords.forEach((att) => {
    (att.records || []).forEach((r: any) => {
      const stId = typeof r.student === 'object' ? r.student?._id : r.student;
      if (!stId) return;
      if (!studentAttendanceRateMap[stId]) {
        studentAttendanceRateMap[stId] = { total: 0, present: 0, pct: 100 };
      }
      studentAttendanceRateMap[stId].total += 1;
      if (r.status === 'PRESENT' || r.status === 'LATE') {
        studentAttendanceRateMap[stId].present += 1;
      }
    });
  });
  Object.keys(studentAttendanceRateMap).forEach((stId) => {
    const item = studentAttendanceRateMap[stId];
    item.pct = item.total > 0 ? Math.round((item.present / item.total) * 100) : 100;
  });

  // Calculate Average Student Test Scores
  const studentQuizAvgMap: Record<string, { totalScore: number; count: number; avgPct: number }> = {};
  quizResults.forEach((q) => {
    const stId = typeof q.student === 'object' ? q.student?._id : q.student;
    if (!stId) return;
    if (!studentQuizAvgMap[stId]) {
      studentQuizAvgMap[stId] = { totalScore: 0, count: 0, avgPct: 0 };
    }
    studentQuizAvgMap[stId].totalScore += q.percentage || 0;
    studentQuizAvgMap[stId].count += 1;
  });
  Object.keys(studentQuizAvgMap).forEach((stId) => {
    const item = studentQuizAvgMap[stId];
    item.avgPct = item.count > 0 ? Math.round(item.totalScore / item.count) : 0;
  });

  return (
    <div className="space-y-8">
      {/* Top Welcome & Navigation Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
              Authorized Campus Portal
            </span>
            <span className="text-xs text-slate-400">• Tenant ID: {schoolProfile?.code || 'ALY-TENANT'}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-navy-950 font-display">
            {schoolProfile?.name || (typeof user?.school === 'object' ? user.school?.name : 'School Administration Portal')}
          </h2>
          <p className="text-xs text-slate-500">
            Real-time management for enrolled students, mentors, batches, attendance, tests, certifications, and institutional commercials.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportStudentsCsv}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Roster
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBulkResult(null);
              setBulkModalOpen(true);
            }}
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Bulk Import
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddStudentModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Enroll Student
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display mt-2">
            {students.length}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Verified Active Students</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mentors & Teachers</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display mt-2">
            {teachers.length}
          </p>
          <p className="text-[11px] text-brand-600 font-semibold mt-1">ALYSTRO Certified Faculty</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Batches & Sections</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display mt-2">
            {batches.length}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">Active STEM Labs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Attendance</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display mt-2">
            {stats?.averageAttendance ?? 88}%
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Campus Engagement</p>
        </div>
      </div>

      {/* Modern Responsive Tab Navigation Bar */}
      <div className="border-b border-slate-200 overflow-x-auto scrollbar-thin">
        <div className="flex space-x-1 sm:space-x-2 min-w-max pb-1">
          {[
            { id: 'students', label: `Students (${students.length})`, icon: GraduationCap },
            { id: 'bulk-import', label: 'Bulk Import', icon: FileSpreadsheet },
            { id: 'classes', label: `Classes (${schoolClassesList.length})`, icon: BookOpen },
            { id: 'batches', label: `Batches (${batches.length})`, icon: Layers },
            { id: 'teachers', label: `Teachers (${teachers.length})`, icon: UserCheck },
            { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
            { id: 'assignments', label: `Assignments (${assignments.length})`, icon: FileCheck },
            { id: 'tests', label: `Tests & Quizzes (${quizzes.length})`, icon: HelpCircle },
            { id: 'progress', label: 'Student Progress', icon: BarChart2 },
            { id: 'certificates', label: `Certificates (${certificates.length})`, icon: Award },
            { id: 'reports', label: 'Reports Hub', icon: Download },
            { id: 'notices', label: `Notices (${notices.length})`, icon: Bell },
            { id: 'affiliations', label: `Affiliations (${affiliations.length})`, icon: Users },
            { id: 'billing', label: 'Commercials & Billing', icon: CreditCard },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SchoolTab)}
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
      {/* TAB 1: STUDENT MANAGEMENT                                 */}
      {/* ========================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="max-w-md w-full">
              <Input
                placeholder="Search student by name, roll number, or email..."
                leftIcon={<Search className="w-4 h-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <Select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                options={[{ value: 'ALL', label: 'All Classes' }, ...schoolClassesList.map((c) => ({ value: c, label: c }))]}
              />
              <Select
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                options={[{ value: 'ALL', label: 'All Batches' }, ...batches.map((b) => ({ value: b._id, label: b.name }))]}
              />
              <Select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' },
                  { value: 'TRANSFERRED', label: 'Transferred' },
                ]}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">Student Info & Photo</th>
                    <th className="py-3.5 px-4">Roll & Class</th>
                    <th className="py-3.5 px-4">Assigned Batch</th>
                    <th className="py-3.5 px-4">Parent Details</th>
                    <th className="py-3.5 px-4">Enrollment Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No students found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => (
                      <tr key={st._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {st.avatar ? (
                              <img src={st.avatar} alt={st.name} className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center shrink-0 border border-brand-100">
                                {st.name?.charAt(0) || 'S'}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{st.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{st.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono font-bold text-slate-800">{st.rollNumber}</span>
                          <p className="text-[11px] text-slate-500">{st.grade} • Sec {st.section}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-slate-700">
                            {typeof st.batch === 'object' ? st.batch?.name : 'Assigned Batch'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-slate-800">{st.parentName || 'Parent / Guardian'}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            {st.parentPhone || 'No contact'}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-slate-500">
                          {st.enrolledAt ? new Date(st.enrolledAt).toLocaleDateString() : 'Active'}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={st.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
                            {st.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedStudent(st);
                                setViewStudentModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100"
                              title="View Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditStudent(st)}
                              className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100"
                              title="Edit Student"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(st)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                              title="Remove Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: BULK IMPORT                                        */}
      {/* ========================================================= */}
      {activeTab === 'bulk-import' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-navy-950 font-display flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-brand-600" />
                  Excel / CSV Student Bulk Importer
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Import multiple student accounts simultaneously with automatic duplicate email & roll verification.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={fillSampleCsv} leftIcon={<Sparkles className="w-4 h-4" />}>
                Load Sample Template
              </Button>
            </div>

            <form onSubmit={handleBulkImport} className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1 font-mono">
                <span className="font-bold text-slate-800">Expected CSV Header:</span>
                <p>Name, Email, RollNumber, Grade, Section, ParentName, ParentPhone, ParentEmail</p>
              </div>

              <textarea
                rows={8}
                required
                className="w-full font-mono text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Paste CSV rows here..."
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
              />

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setCsvText('')}>
                  Clear
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmittingBulk} leftIcon={<Upload className="w-4 h-4" />}>
                  Run Validation & Import
                </Button>
              </div>
            </form>

            {bulkResult && (
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-navy-950">Bulk Execution Report</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-800 uppercase">Successfully Imported</span>
                    <p className="text-2xl font-extrabold text-emerald-700 mt-1">{bulkResult.successCount}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                    <span className="text-xs font-bold text-rose-800 uppercase">Failed / Rejected</span>
                    <p className="text-2xl font-extrabold text-rose-700 mt-1">{bulkResult.failedCount}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 uppercase">Total Rows Evaluated</span>
                    <p className="text-2xl font-extrabold text-slate-800 mt-1">
                      {bulkResult.successCount + bulkResult.failedCount}
                    </p>
                  </div>
                </div>

                {bulkResult.errors?.length > 0 && (
                  <div className="rounded-xl border border-rose-200 overflow-hidden text-xs">
                    <div className="bg-rose-100/60 p-3 font-bold text-rose-900">Import Errors Breakdown</div>
                    <table className="w-full text-left">
                      <thead className="bg-rose-50 border-b border-rose-100 text-rose-700 font-semibold">
                        <tr>
                          <th className="py-2 px-4">Row #</th>
                          <th className="py-2 px-4">Student Email / Roll</th>
                          <th className="py-2 px-4">Error Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100 bg-white">
                        {bulkResult.errors.map((errItem: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-4 font-mono">{errItem.row}</td>
                            <td className="py-2.5 px-4 font-mono font-medium">{errItem.email || errItem.rollNumber || 'Row'}</td>
                            <td className="py-2.5 px-4 text-rose-600 font-semibold">{errItem.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CLASS MANAGEMENT                                   */}
      {/* ========================================================= */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-navy-950">Active Institutional Classes & Grades</h3>
              <p className="text-xs text-slate-500">
                Manage grades served by your campus. Classes dynamically link to student rosters and batch schedules.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setAddClassModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Add Class
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {schoolClassesList.map((clsName) => {
              const countInClass = students.filter((s) => s.grade === clsName).length;
              const batchesInClass = batches.filter((b) => b.grade === clsName).length;

              return (
                <div key={clsName} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft relative group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-extrabold text-navy-950 text-base font-display">{clsName}</span>
                    <button
                      onClick={() => handleRemoveClass(clsName)}
                      className="text-slate-300 hover:text-rose-600 transition p-1"
                      title="Remove Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Enrolled Students:</span>
                      <strong className="text-slate-900">{countInClass}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Batches:</span>
                      <strong className="text-slate-900">{batchesInClass}</strong>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Curriculum Active
                    </span>
                    <button
                      onClick={() => {
                        setSelectedGrade(clsName);
                        setActiveTab('students');
                      }}
                      className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      View Students <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: BATCH MANAGEMENT                                   */}
      {/* ========================================================= */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-navy-950">Campus Batches & Timetables</h3>
              <p className="text-xs text-slate-500">Group students into lab sessions and assign certified mentors.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setAddBatchModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Create New Batch
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((b) => {
              const studentsInBatch = students.filter(
                (s) => (typeof s.batch === 'object' ? s.batch?._id : s.batch) === b._id
              );

              return (
                <div key={b._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-navy-950 text-base">{b.name}</h4>
                        <p className="text-xs text-slate-500">Section {b.section} • {b.grade}</p>
                      </div>
                      <Badge variant="primary">{b.grade}</Badge>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 my-4 pt-3 border-t border-slate-100">
                      <p className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Enrolled Students:</span>
                        <strong className="text-slate-800">
                          {studentsInBatch.length} / {b.maxStudents || 40}
                        </strong>
                      </p>
                      <p className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Assigned Mentor:</span>
                        <strong className="text-slate-800">
                          {typeof b.teacher === 'object' ? b.teacher?.name : 'Lead Educator'}
                        </strong>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Schedule:</span>
                        <span className="text-slate-700">
                          {Array.isArray(b.schedule)
                            ? b.schedule.map((s: any) => `${s.dayOfWeek}: ${s.startTime}-${s.endTime}`).join(', ') || 'Mon-Fri 10:00 AM'
                            : (b.schedule as any) || 'Mon-Fri 10:00 AM'}
                        </span>
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Classroom:</span>
                        </span>
                        {b.googleClassroomUrl ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={b.googleClassroomUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-emerald-700 font-mono font-semibold hover:underline flex items-center gap-0.5"
                            >
                              Launch <ExternalLink className="w-3 h-3" />
                            </a>
                            {b.googleClassroomCode && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                                {b.googleClassroomCode}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-600 font-medium">Not Configured</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenAssignStudents(b)}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700"
                    >
                      Assign ({studentsInBatch.length})
                    </button>
                    <button
                      onClick={() => {
                        setAdminBatchForClassroom(b);
                        setAdminClassroomUrl(b.googleClassroomUrl || b.meetingLink || '');
                        setAdminClassroomCode(b.googleClassroomCode || '');
                        setEditAdminClassroomOpen(true);
                      }}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Classroom Link
                    </button>
                    <button
                      onClick={() => handleDeleteBatch(b._id, b.name)}
                      className="text-slate-400 hover:text-rose-600 transition p-1"
                      title="Delete Batch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: TEACHER MANAGEMENT                                 */}
      {/* ========================================================= */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-navy-950">Faculty & Lab Mentors</h3>
              <p className="text-xs text-slate-500">Certified STEM teachers conducting curriculum delivery and assessments.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setAddTeacherModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Add New Mentor
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t) => (
              <div key={t._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0 border border-emerald-100">
                        {t.name?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <h4 className="font-bold text-navy-950 text-sm">{t.name}</h4>
                        <p className="text-xs text-slate-400">{t.email}</p>
                      </div>
                    </div>
                    <Badge variant={t.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
                      {t.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <p>
                      <strong className="text-slate-800">Specialization:</strong> {t.specialization || 'AI & Robotics'}
                    </p>
                    <p>
                      <strong className="text-slate-800">Qualification:</strong> {t.qualification || 'Certified Trainer'}
                    </p>
                    {t.phone && (
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="w-3.5 h-3.5" /> {t.phone}
                      </p>
                    )}
                    <p className="text-slate-500">
                      <strong>Assigned Batches:</strong> {t.assignedBatches?.length || 0} batches
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEditTeacher(t)}>
                    Edit Profile
                  </Button>
                  <button
                    onClick={() => handleDeleteTeacher(t)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50"
                    title="Deactivate Mentor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: ATTENDANCE REGISTER                                */}
      {/* ========================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-48">
                <Select
                  label="Select Batch"
                  value={attendanceBatchId}
                  onChange={(e) => setAttendanceBatchId(e.target.value)}
                  options={batches.map((b) => ({ value: b._id, label: `${b.name} (${b.grade})` }))}
                />
              </div>
              <div className="w-40">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveAttendance}
                isLoading={isSavingAttendance}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Save Attendance Register
              </Button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
            <Input
              label="Topic Covered / Session Curriculum Notes"
              placeholder="e.g. Session 4: Computer Vision Models & Convolutional Neural Networks"
              value={attendanceTopic}
              onChange={(e) => setAttendanceTopic(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">Roll #</th>
                    <th className="py-3.5 px-6">Student Name</th>
                    <th className="py-3.5 px-6">Grade & Section</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {students
                    .filter((s) => (typeof s.batch === 'object' ? s.batch?._id : s.batch) === attendanceBatchId)
                    .map((st) => {
                      const currentStatus = attendanceMap[st._id] || 'PRESENT';
                      return (
                        <tr key={st._id} className="hover:bg-slate-50/70">
                          <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{st.rollNumber}</td>
                          <td className="py-3.5 px-6 font-semibold text-slate-900">{st.name}</td>
                          <td className="py-3.5 px-6 text-slate-500">{st.grade} • Sec {st.section}</td>
                          <td className="py-3.5 px-6 text-center">
                            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 gap-1">
                              {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((stat) => (
                                <button
                                  key={stat}
                                  type="button"
                                  onClick={() => setAttendanceMap({ ...attendanceMap, [st._id]: stat })}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition ${
                                    currentStatus === stat
                                      ? stat === 'PRESENT'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : stat === 'ABSENT'
                                        ? 'bg-rose-600 text-white shadow-sm'
                                        : stat === 'LATE'
                                        ? 'bg-amber-600 text-white shadow-sm'
                                        : 'bg-sky-600 text-white shadow-sm'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  {stat}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: ASSIGNMENTS & PROJECTS                             */}
      {/* ========================================================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-navy-950">Curriculum Assignments & Practical Labs</h3>
              <p className="text-xs text-slate-500">Distribute programming tasks and evaluate student submissions.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setAddAssignmentModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Create Assignment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.length === 0 ? (
              <div className="col-span-3 p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                No assignments created yet. Click "Create Assignment" to post coursework.
              </div>
            ) : (
              assignments.map((asg) => (
                <div key={asg._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-navy-950 text-base">{asg.title}</h4>
                      <Badge variant="primary">{asg.maxMarks} Marks</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mb-4 line-clamp-3">{asg.description}</p>
                    <div className="space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100">
                      <p>
                        <strong>Batch:</strong> {typeof asg.batch === 'object' ? asg.batch?.name : 'Target Batch'}
                      </p>
                      <p>
                        <strong>Due Date:</strong> {new Date(asg.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleViewSubmissions(asg)}>
                      View Submissions
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: TESTS & RESULTS (QUIZZES)                          */}
      {/* ========================================================= */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-navy-950">Academic Tests & STEM Knowledge Checks</h3>
              <p className="text-xs text-slate-500">Automated quizzes with question banks, marks, and instant grade evaluation.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setAddQuizModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Create New Test
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.length === 0 ? (
              <div className="col-span-3 p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                No tests published yet. Click "Create New Test" to set up an assessment.
              </div>
            ) : (
              quizzes.map((qz) => (
                <div key={qz._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-navy-950 text-base">{qz.title}</h4>
                      <Badge variant="success">Passing: {qz.passingScore}%</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mb-4 line-clamp-2">{qz.description}</p>
                    <div className="space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100">
                      <p>
                        <strong>Duration:</strong> {qz.duration} mins
                      </p>
                      <p>
                        <strong>Questions:</strong> {qz.questions?.length || 0} MCQs
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleViewQuizResults(qz)}>
                      View Results
                    </Button>
                    <button
                      onClick={() => handleDeleteQuiz(qz._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                      title="Delete Test"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 9: STUDENT PROGRESS MATRIX                            */}
      {/* ========================================================= */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-950">Academic Progress & Attendance Performance Matrix</h3>
              <p className="text-xs text-slate-500">Live evaluation of student course completion, test marks, and attendance.</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportAcademicReportCsv} leftIcon={<Download className="w-4 h-4" />}>
              Export Performance CSV
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">Roll & Name</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4">Attendance Rate</th>
                    <th className="py-3.5 px-4">Test Avg Score</th>
                    <th className="py-3.5 px-4">Course Standing</th>
                    <th className="py-3.5 px-6 text-right">Certificate Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {students.map((st) => {
                    const attRate = studentAttendanceRateMap[st._id]?.pct ?? 92;
                    const testAvg = studentQuizAvgMap[st._id]?.avgPct ?? 85;
                    const isDistinction = testAvg >= 85 && attRate >= 80;

                    return (
                      <tr key={st._id} className="hover:bg-slate-50/70">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900 text-sm">{st.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">{st.rollNumber}</p>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          {st.grade} • Sec {st.section}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full ${
                                  attRate >= 80 ? 'bg-emerald-500' : attRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${attRate}%` }}
                              />
                            </div>
                            <span className="font-bold font-mono text-slate-800">{attRate}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-slate-800">
                          {testAvg}%
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={isDistinction ? 'success' : 'primary'} dot>
                            {isDistinction ? 'Distinction' : 'On Track'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCertForm({
                                studentId: st._id,
                                programId: (typeof st.program === 'object' ? st.program?._id : st.program) || programs[0]?._id,
                                grade: isDistinction ? 'Distinction' : 'Merit',
                                completionDate: new Date().toISOString().split('T')[0],
                              });
                              setIssueCertModalOpen(true);
                            }}
                          >
                            Issue Certificate
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 10: CERTIFICATES                                      */}
      {/* ========================================================= */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-navy-950">Credential & Certificate Hub</h3>
              <p className="text-xs text-slate-500">Official tamper-proof ALYSTRO certificates with verifiable QR codes.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setIssueCertModalOpen(true)} leftIcon={<Award className="w-4 h-4" />}>
              Issue Certificate
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.length === 0 ? (
              <div className="col-span-3 p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                No certificates issued yet for this campus. Click "Issue Certificate" to award credentials.
              </div>
            ) : (
              certificates.map((cert) => (
                <div key={cert._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-bold text-brand-600">{cert.certificateId}</span>
                      <Badge variant="success">{cert.grade}</Badge>
                    </div>
                    <h4 className="font-bold text-navy-950 text-base mt-2">{cert.studentName}</h4>
                    <p className="text-xs text-slate-500">{cert.programName}</p>
                    <div className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                      Issue Date: {new Date(cert.issueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/verify/${cert.certificateId}`}
                      target="_blank"
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      Verify Credential <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 11: REPORTS HUB                                       */}
      {/* ========================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-navy-950">Campus Analytics & Compliance Reports</h3>
            <p className="text-xs text-slate-500">Download authorized CSV ledgers for administration and audits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-navy-950 text-base">Student Master Roster</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Complete listing of all enrolled students with roll numbers, sections, parent contact information, and enrollment status.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">{students.length} Records</span>
                <Button variant="primary" size="sm" onClick={handleExportStudentsCsv} leftIcon={<Download className="w-4 h-4" />}>
                  Download CSV
                </Button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-navy-950 text-base">Attendance Ledger Report</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Daily presence records categorized by batch, session dates, curriculum topics covered, and student status.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">{attendanceRecords.length} Session Logs</span>
                <Button variant="primary" size="sm" onClick={handleExportAttendanceCsv} leftIcon={<Download className="w-4 h-4" />}>
                  Download CSV
                </Button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-navy-950 text-base">Academic Assessment & Test Report</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Detailed grade ledger showing scores, percentages, passing statuses, and question attempts across all STEM quizzes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">{quizResults.length} Submissions</span>
                <Button variant="primary" size="sm" onClick={handleExportAcademicReportCsv} leftIcon={<Download className="w-4 h-4" />}>
                  Download CSV
                </Button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-950 flex items-center justify-center mb-3">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-navy-950 text-base">School Commercials & Billing Ledger</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Confidential institutional invoice history, verified remittances, outstanding balances, and agreed contract values.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">Institutional Billing</span>
                <Button variant="primary" size="sm" onClick={handleExportBillingReportCsv} leftIcon={<Download className="w-4 h-4" />}>
                  Download CSV
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 12: NOTICE BOARD                                      */}
      {/* ========================================================= */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-navy-950">Campus Bulletin & Notices</h3>
              <p className="text-xs text-slate-500">Official campus broadcasts visible to teachers and students.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setPostNoticeModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Post Notice
            </Button>
          </div>

          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    {n.pinned && <Pin className="w-4 h-4 text-brand-500 fill-brand-500" />}
                    <h4 className="font-bold text-navy-950 text-sm">{n.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">{n.category}</Badge>
                    <button
                      onClick={() => handleDeleteNotice(n._id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Remove Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{n.content}</p>
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                  <span>Audience: {n.targetRole}</span>
                  <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 13: AFFILIATION REQUESTS                              */}
      {/* ========================================================= */}
      {activeTab === 'affiliations' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-950">Campus Affiliation & Enrollment Queue</h3>
              <p className="text-xs text-slate-500">
                Authorize teachers and students requesting to link with your school tenant.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total Requests: <strong className="text-slate-900">{affiliations.length}</strong>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">Applicant Name</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Submitted Details</th>
                    <th className="py-3.5 px-6">Requested On</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Decision Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {affiliations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No pending affiliation requests for this campus.
                      </td>
                    </tr>
                  ) : (
                    affiliations.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900 text-sm">{req.user?.name}</p>
                          <p className="text-[11px] text-slate-400">{req.user?.email} • {req.user?.phone || 'No phone'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={req.role === 'TEACHER' ? 'primary' : 'success'}>
                            {req.role}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          {req.role === 'TEACHER' ? (
                            <div>
                              <p className="font-semibold text-slate-800">{req.details?.qualification || 'Educator'}</p>
                              <p className="text-[11px] text-slate-400">{req.details?.experienceYears || 0} yrs experience</p>
                            </div>
                          ) : (
                            <div>
                              <p className="font-semibold text-slate-800">{req.details?.grade || 'Student'}</p>
                              <p className="text-[11px] text-slate-400">Parent: {req.details?.parentName || 'N/A'} ({req.details?.parentPhone || 'N/A'})</p>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            variant={
                              req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'danger' : 'warning'
                            }
                            dot
                          >
                            {req.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {req.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={affiliationLoading}
                                onClick={() => handleApproveAffiliation(req._id)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={affiliationLoading}
                                className="text-rose-600 hover:bg-rose-50 border-rose-200"
                                onClick={() => handleRejectAffiliation(req._id)}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 14: COMMERCIALS & BILLING (PAYMENT STATUS)            */}
      {/* ========================================================= */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {commercialError ? (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900">Commercial Records Restricted</h3>
                <p className="text-sm text-amber-800 mt-1">{commercialError}</p>
                <p className="text-xs text-amber-700 mt-2">
                  Official commercial agreements and invoices are accessible exclusively to approved and active partner school tenants.
                </p>
              </div>
            </div>
          ) : !commercialData?.commercialTerms ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-soft text-center">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Commercial Agreement Pending Finalization</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                Your institutional partnership commercial terms and billing records are currently being drafted by the ALYSTRO academic administration team.
              </p>
            </div>
          ) : (
            <>
              {/* Top Banner / Plan Summary */}
              <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-brand-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-glow opacity-20 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-500/20 text-brand-300 border border-brand-400/30">
                        {commercialData.commercialTerms?.planName || 'Institutional Partnership'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Approved Partner Tenant
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
                      {commercialData.school?.name} Commercial Terms
                    </h2>
                    <p className="text-slate-300 text-sm mt-1">
                      School Code: <span className="font-mono text-brand-300">{commercialData.school?.code}</span> • Board: {commercialData.school?.board || 'CBSE'} • Confidential Commercial Terms
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-right">
                      <div className="text-xs text-slate-300 uppercase font-bold tracking-wider">Account Billing Status</div>
                      <div className="text-xl font-extrabold font-display mt-0.5 flex items-center justify-end gap-2">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            commercialData.commercialTerms?.billing?.paymentStatus === 'PAID'
                              ? 'bg-emerald-400'
                              : commercialData.commercialTerms?.billing?.paymentStatus === 'PARTIAL'
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                        />
                        {commercialData.commercialTerms?.billing?.paymentStatus || 'PENDING'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Commercial Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Invoiced</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display mt-2">
                    ₹{commercialData.commercialTerms?.billing?.totalBilledAmount?.toLocaleString('en-IN') || 0}
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">Inclusive of 18% GST</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Paid</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-display mt-2">
                    ₹{commercialData.commercialTerms?.billing?.paidAmount?.toLocaleString('en-IN') || 0}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Verified Remittances</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding Balance</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-display mt-2">
                    ₹{commercialData.commercialTerms?.billing?.outstandingBalance?.toLocaleString('en-IN') || 0}
                  </p>
                  <p className="text-[11px] text-amber-600 font-semibold mt-1">
                    {commercialData.commercialTerms?.billing?.outstandingBalance > 0 ? 'Pending Settlement' : 'Account Cleared'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Enrolled Milestone</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-brand-600 font-display mt-2">
                    {students.length} / {commercialData.commercialTerms?.enrollmentMilestone || 300}
                  </p>
                  <p className="text-[11px] text-brand-600 font-semibold mt-1">Active Lab Students</p>
                </div>
              </div>

              {/* Agreed Program Fees */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-navy-950 font-display flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-brand-600" />
                      Agreed Program Commercial Terms
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Program-wise fees applicable specifically to your institution as agreed under your partnership contract.
                    </p>
                  </div>
                  <Badge variant="primary" className="border-brand-300 text-brand-700 bg-brand-50">
                    Confidential School Pricing
                  </Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                        <th className="py-3 px-6">Program & Classes</th>
                        <th className="py-3 px-4">Standard Valuation</th>
                        <th className="py-3 px-4">Agreed School Fee</th>
                        <th className="py-3 px-4">Applicable GST</th>
                        <th className="py-3 px-4">Effective Total / Student</th>
                        <th className="py-3 px-6 text-right">Agreement Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {commercialData.commercialTerms?.agreedProgramFees?.map((fee: any, idx: number) => {
                        const gstRate = fee.gstRate || 18;
                        const effectiveGst = Math.round((fee.agreedFee * gstRate) / 100);
                        const effectiveTotal = fee.agreedFee + effectiveGst;

                        return (
                          <tr key={idx} className="hover:bg-slate-50/70 transition">
                            <td className="py-4 px-6">
                              <div className="font-bold text-navy-950">{fee.programName}</div>
                              <div className="text-xs text-slate-500">{fee.gradeRange}</div>
                            </td>
                            <td className="py-4 px-4 text-slate-400 line-through font-mono">
                              ₹{fee.standardFee?.toLocaleString('en-IN')}
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-navy-950 font-mono text-base">
                                ₹{fee.agreedFee?.toLocaleString('en-IN')}
                              </div>
                              {fee.isNegotiated && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                                  Negotiated Rate ({fee.discountPercent || Math.round(((fee.standardFee - fee.agreedFee) / fee.standardFee) * 100)}% off)
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-slate-600 font-mono">
                              {gstRate}% (₹{effectiveGst.toLocaleString('en-IN')})
                            </td>
                            <td className="py-4 px-4 font-bold text-brand-700 font-mono text-base">
                              ₹{effectiveTotal.toLocaleString('en-IN')}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Technology Benefits */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-navy-950 font-display flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Approved School Technology Package
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Institutional digital infrastructure provided at zero cost as part of the ALYSTRO STEM partnership.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-bold uppercase">Total Package Valuation</span>
                    <p className="text-xl font-extrabold text-navy-950 font-display">
                      ₹{commercialData.commercialTerms?.totalValuation?.toLocaleString('en-IN') || '2,00,000'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {commercialData.commercialTerms?.technologyBenefits?.map((benefit: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-bold text-navy-950">{benefit.benefitName}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Standard Commercial Value: <span className="font-mono font-bold text-slate-700">₹{benefit.standardValuation?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-xs text-brand-600 font-semibold mt-2">
                          Condition: {benefit.milestoneRequirement || 'Upon 300 Enrolled Students'}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {benefit.status || 'ACTIVATED'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium mt-1">Cost to School: ₹0</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoices & Payment History */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-navy-950 font-display flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-600" />
                      Invoices & Payment Schedules
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">
                      {commercialData.commercialTerms?.billing?.invoices?.length || 0} Invoices
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-4">Invoice #</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Due Date</th>
                          <th className="py-2.5 px-3">Total Amount</th>
                          <th className="py-2.5 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {commercialData.commercialTerms?.billing?.invoices?.length > 0 ? (
                          commercialData.commercialTerms.billing.invoices.map((inv: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/70">
                              <td className="py-3 px-4 font-bold text-navy-950 font-mono">{inv.invoiceNumber}</td>
                              <td className="py-3 px-3 text-slate-600">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                              <td className="py-3 px-3 text-slate-600">{new Date(inv.dueDate).toLocaleDateString()}</td>
                              <td className="py-3 px-3 font-bold text-navy-950 font-mono">
                                ₹{inv.totalAmount?.toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                    inv.status === 'PAID'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : inv.status === 'PARTIAL'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-400">
                              No invoices generated yet for this billing cycle.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
                  <div className="p-5 border-b border-slate-100">
                    <h3 className="font-bold text-navy-950 font-display flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      Payment History
                    </h3>
                  </div>

                  <div className="p-4 space-y-3">
                    {commercialData.commercialTerms?.billing?.paymentHistory?.length > 0 ? (
                      commercialData.commercialTerms.billing.paymentHistory.map((pmt: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs">
                          <div className="flex items-center justify-between font-bold text-navy-950">
                            <span>₹{pmt.amount?.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold">
                              {pmt.status || 'CONFIRMED'}
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px] mt-1">
                            Txn: <span className="font-mono">{pmt.transactionId}</span>
                          </div>
                          <div className="text-slate-400 text-[10px] mt-0.5">
                            {new Date(pmt.paymentDate).toLocaleDateString()} • {pmt.paymentMethod}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No payment records registered yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS                                                    */}
      {/* ========================================================= */}

      {/* Modal: Enroll Single Student */}
      <Modal isOpen={addStudentModalOpen} onClose={() => setAddStudentModalOpen(false)} title="Enroll Student to School Tenant" maxWidth="lg">
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <Input
            label="Full Name *"
            required
            placeholder="Aarav Sharma"
            value={studentForm.name}
            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Student Email Address *"
              type="email"
              required
              placeholder="aarav@student.alystro.com"
              value={studentForm.email}
              onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
            />
            <Input
              label="Student Password (Default)"
              placeholder="Alystro@123"
              value={studentForm.password}
              onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Roll Number *"
              required
              placeholder="ABC-701"
              value={studentForm.rollNumber}
              onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
            />
            <Select
              label="Grade / Class *"
              value={studentForm.grade}
              onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })}
              options={schoolClassesList.map((c) => ({ value: c, label: c }))}
            />
            <Input
              label="Section *"
              required
              placeholder="A"
              value={studentForm.section}
              onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Parent / Guardian Name"
              placeholder="Rajesh Sharma"
              value={studentForm.parentName}
              onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
            />
            <Input
              label="Parent Contact Phone"
              placeholder="+91 98765 43210"
              value={studentForm.parentPhone}
              onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Parent Email Address"
              type="email"
              placeholder="rajesh.sharma@example.com"
              value={studentForm.parentEmail}
              onChange={(e) => setStudentForm({ ...studentForm, parentEmail: e.target.value })}
            />
            <Input
              label="Student Photo URL (Optional)"
              placeholder="https://..."
              value={studentForm.avatar}
              onChange={(e) => setStudentForm({ ...studentForm, avatar: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assign to Batch"
              value={studentForm.batchId}
              onChange={(e) => setStudentForm({ ...studentForm, batchId: e.target.value })}
              options={batches.map((b) => ({ value: b._id, label: `${b.name} (${b.grade})` }))}
            />
            <Select
              label="Enrolled Program / Course"
              value={studentForm.programId}
              onChange={(e) => setStudentForm({ ...studentForm, programId: e.target.value })}
              options={programs.map((p) => ({ value: p._id, label: p.name }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setAddStudentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingStudent}>
              Enroll Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Student */}
      <Modal isOpen={editStudentModalOpen} onClose={() => setEditStudentModalOpen(false)} title="Edit Student Record" maxWidth="lg">
        <form onSubmit={handleSaveEditStudent} className="space-y-4">
          <Input
            label="Full Name *"
            required
            value={studentForm.name}
            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Roll Number *"
              required
              value={studentForm.rollNumber}
              onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
            />
            <Select
              label="Grade / Class *"
              value={studentForm.grade}
              onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })}
              options={schoolClassesList.map((c) => ({ value: c, label: c }))}
            />
            <Input
              label="Section *"
              required
              value={studentForm.section}
              onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Parent / Guardian Name"
              value={studentForm.parentName}
              onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
            />
            <Input
              label="Parent Contact Phone"
              value={studentForm.parentPhone}
              onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Parent Email Address"
              type="email"
              value={studentForm.parentEmail}
              onChange={(e) => setStudentForm({ ...studentForm, parentEmail: e.target.value })}
            />
            <Input
              label="Photo URL"
              value={studentForm.avatar}
              onChange={(e) => setStudentForm({ ...studentForm, avatar: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assign to Batch"
              value={studentForm.batchId}
              onChange={(e) => setStudentForm({ ...studentForm, batchId: e.target.value })}
              options={[{ value: '', label: 'No Batch' }, ...batches.map((b) => ({ value: b._id, label: `${b.name} (${b.grade})` }))]}
            />
            <Select
              label="Student Status"
              value={studentForm.status}
              onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'TRANSFERRED', label: 'Transferred' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setEditStudentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingStudent}>
              Save Student Records
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Student Details */}
      <Modal isOpen={viewStudentModalOpen} onClose={() => setViewStudentModalOpen(false)} title="Student Academic Profile" maxWidth="md">
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              {selectedStudent.avatar ? (
                <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-500 text-white font-extrabold text-xl flex items-center justify-center">
                  {selectedStudent.name?.charAt(0) || 'S'}
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-navy-950 text-base">{selectedStudent.name}</h3>
                <p className="text-xs font-mono text-slate-500">{selectedStudent.email}</p>
                <Badge variant={selectedStudent.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm" className="mt-1" dot>
                  {selectedStudent.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Roll Number</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedStudent.rollNumber}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Class & Section</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedStudent.grade} • Sec {selectedStudent.section}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Assigned Batch</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {typeof selectedStudent.batch === 'object' ? selectedStudent.batch?.name : 'Unassigned'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Enrolled Course</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {typeof selectedStudent.program === 'object' ? selectedStudent.program?.name : 'STEM Foundation'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-slate-700">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Parent / Guardian Contact</span>
              <p className="font-bold text-slate-900">{selectedStudent.parentName || 'Guardian'}</p>
              <p className="text-slate-500">{selectedStudent.parentPhone || 'No Phone'}</p>
              {selectedStudent.parentEmail && <p className="text-slate-500">{selectedStudent.parentEmail}</p>}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setViewStudentModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Bulk Import (Quick Trigger) */}
      <Modal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} title="Bulk Import Students via CSV" maxWidth="xl">
        <form onSubmit={handleBulkImport} className="space-y-4">
          <p className="text-xs text-slate-500">
            Paste comma-separated rows. Columns: <code className="font-mono text-slate-800">Name, Email, RollNumber, Grade, Section, ParentName, ParentPhone, ParentEmail</code>
          </p>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={fillSampleCsv}
              className="text-xs text-brand-600 font-semibold hover:underline"
            >
              Fill Sample CSV Format
            </button>
          </div>

          <textarea
            rows={6}
            required
            className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            placeholder="Name, Email, RollNumber, Grade, Section, ParentName, ParentPhone, ParentEmail"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
          />

          {bulkResult && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold">
              ✓ {bulkResult.successCount} students imported successfully. {bulkResult.failedCount} failed.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setBulkModalOpen(false)}>
              Close
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingBulk}>
              Run Bulk Import
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Class */}
      <Modal isOpen={addClassModalOpen} onClose={() => setAddClassModalOpen(false)} title="Add School Grade / Class" maxWidth="sm">
        <form onSubmit={handleAddClass} className="space-y-4">
          <Input
            label="Class / Grade Name *"
            required
            placeholder="e.g. Class 11 (Robotics Lab)"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddClassModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Class
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Batch */}
      <Modal isOpen={addBatchModalOpen} onClose={() => setAddBatchModalOpen(false)} title="Create New Batch" maxWidth="lg">
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <Input
            label="Batch Name *"
            required
            placeholder="e.g. AI Champions - Batch Alpha"
            value={batchForm.name}
            onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Grade / Class *"
              value={batchForm.grade}
              onChange={(e) => setBatchForm({ ...batchForm, grade: e.target.value })}
              options={schoolClassesList.map((c) => ({ value: c, label: c }))}
            />
            <Input
              label="Section *"
              required
              placeholder="A"
              value={batchForm.section}
              onChange={(e) => setBatchForm({ ...batchForm, section: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="STEM Program / Course"
              value={batchForm.programId}
              onChange={(e) => setBatchForm({ ...batchForm, programId: e.target.value })}
              options={programs.map((p) => ({ value: p._id, label: p.name }))}
            />
            <Select
              label="Assigned Lead Teacher"
              value={batchForm.teacherId}
              onChange={(e) => setBatchForm({ ...batchForm, teacherId: e.target.value })}
              options={teachers.map((t) => ({ value: t._id, label: t.name }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Student Capacity"
              type="number"
              value={batchForm.maxCapacity}
              onChange={(e) => setBatchForm({ ...batchForm, maxCapacity: Number(e.target.value) })}
            />
            <Input
              label="Schedule Timings"
              placeholder="Mon-Fri, 10:00 AM - 11:00 AM"
              value={batchForm.schedule}
              onChange={(e) => setBatchForm({ ...batchForm, schedule: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Google Classroom / Live Class URL (Optional)"
              placeholder="https://classroom.google.com/c/... or https://meet.google.com/..."
              value={batchForm.googleClassroomUrl}
              onChange={(e) => setBatchForm({ ...batchForm, googleClassroomUrl: e.target.value })}
            />
            <Input
              label="Google Class Code (Optional)"
              placeholder="e.g. abc1234"
              value={batchForm.googleClassroomCode}
              onChange={(e) => setBatchForm({ ...batchForm, googleClassroomCode: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setAddBatchModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Batch
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Configure Google Classroom for School Admin */}
      <Modal
        isOpen={editAdminClassroomOpen}
        onClose={() => setEditAdminClassroomOpen(false)}
        title={`Configure Google Classroom — ${adminBatchForClassroom?.name || 'Batch'}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdminClassroom} className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 leading-relaxed">
            <p className="font-semibold flex items-center gap-1.5 mb-1">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              Batch Classroom Mapping
            </p>
            When students of <strong>{adminBatchForClassroom?.name}</strong> click &quot;Join Live Class&quot;, they will be redirected to this Google Classroom URL.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Classroom URL *
            </label>
            <Input
              required
              placeholder="https://classroom.google.com/c/..."
              value={adminClassroomUrl}
              onChange={(e) => setAdminClassroomUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Class Code (Optional)
            </label>
            <Input
              placeholder="e.g. abc1234"
              value={adminClassroomCode}
              onChange={(e) => setAdminClassroomCode(e.target.value)}
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <strong>Note:</strong> Google may require students to authenticate with their Google Workspace or personal Google account to access class materials and meets.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditAdminClassroomOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={adminClassroomSaving}>
              Save Classroom Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Students to Batch */}
      <Modal isOpen={assignStudentsModalOpen} onClose={() => setAssignStudentsModalOpen(false)} title={`Assign Students to ${assignBatchTarget?.name}`} maxWidth="xl">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Select or uncheck students to enroll them into this batch. Capacity: {assignBatchTarget?.maxStudents || 40}.
          </p>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {students.map((st) => {
              const isChecked = selectedStudentIdsForBatch.includes(st._id);
              return (
                <label key={st._id} className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer text-xs">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIdsForBatch([...selectedStudentIdsForBatch, st._id]);
                        } else {
                          setSelectedStudentIdsForBatch(selectedStudentIdsForBatch.filter((id) => id !== st._id));
                        }
                      }}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900">{st.name}</span>
                      <span className="text-slate-400 font-mono ml-2">({st.rollNumber})</span>
                      <p className="text-[11px] text-slate-500">{st.grade} • Sec {st.section}</p>
                    </div>
                  </div>
                  <span className="text-slate-400 font-medium">
                    {typeof st.batch === 'object' ? st.batch?.name : 'Unassigned'}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs font-semibold text-slate-600">
              Selected: <strong className="text-slate-900">{selectedStudentIdsForBatch.length}</strong> students
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setAssignStudentsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" isLoading={isAssigningStudents} onClick={handleSaveAssignStudents}>
                Save Assignments
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal: Add Teacher */}
      <Modal isOpen={addTeacherModalOpen} onClose={() => setAddTeacherModalOpen(false)} title="Register Mentor / Teacher" maxWidth="lg">
        <form onSubmit={handleCreateTeacher} className="space-y-4">
          <Input
            label="Full Name *"
            required
            placeholder="Pooja Sharma"
            value={teacherForm.name}
            onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
          />
          <Input
            label="Email Address *"
            type="email"
            required
            placeholder="pooja.sharma@alystro.com"
            value={teacherForm.email}
            onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
          />
          <Input
            label="Phone Number"
            placeholder="+91 98765 43210"
            value={teacherForm.phone}
            onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
          />
          <Input
            label="Specialization Domain"
            placeholder="e.g. AI Prompting, Robotics, Python"
            value={teacherForm.specialization}
            onChange={(e) => setTeacherForm({ ...teacherForm, specialization: e.target.value })}
          />
          <Input
            label="Qualification / Degrees"
            placeholder="e.g. M.Sc Computer Science"
            value={teacherForm.qualification}
            onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setAddTeacherModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingTeacher}>
              Register Mentor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Teacher */}
      <Modal isOpen={editTeacherModalOpen} onClose={() => setEditTeacherModalOpen(false)} title="Edit Mentor Profile" maxWidth="lg">
        <form onSubmit={handleSaveEditTeacher} className="space-y-4">
          <Input
            label="Full Name *"
            required
            value={teacherForm.name}
            onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
          />
          <Input
            label="Phone Number"
            value={teacherForm.phone}
            onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
          />
          <Input
            label="Specialization Domain"
            value={teacherForm.specialization}
            onChange={(e) => setTeacherForm({ ...teacherForm, specialization: e.target.value })}
          />
          <Input
            label="Qualification"
            value={teacherForm.qualification}
            onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setEditTeacherModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingTeacher}>
              Save Mentor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Assignment */}
      <Modal isOpen={addAssignmentModalOpen} onClose={() => setAddAssignmentModalOpen(false)} title="Create Coursework Assignment" maxWidth="lg">
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <Input
            label="Assignment Title *"
            required
            placeholder="e.g. Mini Project: Build an Image Classifier with Python"
            value={assignmentForm.title}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
          />
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Assignment Description & Instructions *
            </label>
            <textarea
              rows={4}
              required
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Provide prompt, deliverables, and submission guidelines..."
              value={assignmentForm.description}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Target Batch *"
              value={assignmentForm.batchId}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, batchId: e.target.value })}
              options={batches.map((b) => ({ value: b._id, label: `${b.name} (${b.grade})` }))}
            />
            <Select
              label="Program / Subject"
              value={assignmentForm.programId}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, programId: e.target.value })}
              options={programs.map((p) => ({ value: p._id, label: p.name }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date *"
              type="date"
              required
              value={assignmentForm.dueDate}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
            />
            <Input
              label="Maximum Marks *"
              type="number"
              required
              value={assignmentForm.maxMarks}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, maxMarks: Number(e.target.value) })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setAddAssignmentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingAssignment}>
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Submissions */}
      <Modal isOpen={submissionsModalOpen} onClose={() => setSubmissionsModalOpen(false)} title={`Submissions: ${selectedAssignmentTitle}`} maxWidth="xl">
        <div className="space-y-4">
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {selectedAssignmentSubmissions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No students have submitted solutions for this assignment yet.
              </div>
            ) : (
              selectedAssignmentSubmissions.map((sub) => (
                <div key={sub._id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-slate-900">{sub.student?.name || 'Student'}</h5>
                    <p className="text-[11px] text-slate-400">
                      Submitted on: {new Date(sub.submittedAt).toLocaleDateString()} • {sub.content || 'Code uploaded'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-mono text-slate-800">
                      {sub.status === 'GRADED' ? `${sub.marksObtained} Marks` : 'Pending Review'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setGradingSubmission(sub);
                        setGradeScore(sub.marksObtained || 90);
                        setGradeFeedback(sub.feedback || 'Well done!');
                      }}
                    >
                      {sub.status === 'GRADED' ? 'Edit Grade' : 'Grade Submission'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {gradingSubmission && (
            <form onSubmit={handleGradeSubmission} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h5 className="text-xs font-bold text-navy-950 uppercase">
                Grading for {gradingSubmission.student?.name}
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Marks Obtained"
                  type="number"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                />
                <Input
                  label="Faculty Feedback"
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setGradingSubmission(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Grade
                </Button>
              </div>
            </form>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setSubmissionsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create Quiz / Test */}
      <Modal isOpen={addQuizModalOpen} onClose={() => setAddQuizModalOpen(false)} title="Create Quiz / Test Assessment" maxWidth="lg">
        <form onSubmit={handleCreateQuiz} className="space-y-4">
          <Input
            label="Test Title *"
            required
            placeholder="e.g. AI & Python Mid-Term Assessment"
            value={quizForm.title}
            onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
          />
          <Input
            label="Description"
            placeholder="Assessment coverage and instructions..."
            value={quizForm.description}
            onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Target Batch"
              value={quizForm.batchId}
              onChange={(e) => setQuizForm({ ...quizForm, batchId: e.target.value })}
              options={batches.map((b) => ({ value: b._id, label: `${b.name} (${b.grade})` }))}
            />
            <Select
              label="STEM Program"
              value={quizForm.programId}
              onChange={(e) => setQuizForm({ ...quizForm, programId: e.target.value })}
              options={programs.map((p) => ({ value: p._id, label: p.name }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (Minutes)"
              type="number"
              value={quizForm.duration}
              onChange={(e) => setQuizForm({ ...quizForm, duration: Number(e.target.value) })}
            />
            <Input
              label="Passing Score (%)"
              type="number"
              value={quizForm.passingScore}
              onChange={(e) => setQuizForm({ ...quizForm, passingScore: Number(e.target.value) })}
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-slate-800">Sample Question (Automated Evaluation):</span>
            <Input
              label="Question Text"
              value={quizForm.questions[0]?.questionText || ''}
              onChange={(e) => {
                const updated = [...quizForm.questions];
                updated[0].questionText = e.target.value;
                setQuizForm({ ...quizForm, questions: updated });
              }}
            />
            <div className="grid grid-cols-2 gap-2 mt-2">
              {quizForm.questions[0]?.options.map((opt, i) => (
                <input
                  key={i}
                  className="p-2 border border-slate-200 rounded-lg text-xs"
                  value={opt}
                  onChange={(e) => {
                    const updated = [...quizForm.questions];
                    updated[0].options[i] = e.target.value;
                    setQuizForm({ ...quizForm, questions: updated });
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setAddQuizModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingQuiz}>
              Publish Assessment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Test Results */}
      <Modal isOpen={quizResultsModalOpen} onClose={() => setQuizResultsModalOpen(false)} title={`Assessment Results: ${selectedQuizTitle}`} maxWidth="xl">
        <div className="space-y-4">
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {selectedQuizResults.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No student attempts recorded for this test yet.
              </div>
            ) : (
              selectedQuizResults.map((res) => (
                <div key={res._id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-slate-900">{res.student?.name || 'Student'}</h5>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Roll: {res.student?.rollNumber || 'N/A'} • Submitted on: {new Date(res.completedAt || res.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {res.score} / {res.totalMarks} ({res.percentage}%)
                    </span>
                    <Badge variant={res.passed ? 'success' : 'danger'}>
                      {res.passed ? 'PASSED' : 'FAILED'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setQuizResultsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Issue Certificate */}
      <Modal isOpen={issueCertModalOpen} onClose={() => setIssueCertModalOpen(false)} title="Issue Official ALYSTRO Certificate" maxWidth="lg">
        <form onSubmit={handleIssueCertificate} className="space-y-4">
          <Select
            label="Eligible Student *"
            required
            value={certForm.studentId}
            onChange={(e) => setCertForm({ ...certForm, studentId: e.target.value })}
            options={[{ value: '', label: 'Select student...' }, ...students.map((s) => ({ value: s._id, label: `${s.name} (${s.rollNumber}) - ${s.grade}` }))]}
          />
          <Select
            label="STEM Course / Program *"
            required
            value={certForm.programId}
            onChange={(e) => setCertForm({ ...certForm, programId: e.target.value })}
            options={programs.map((p) => ({ value: p._id, label: p.name }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Evaluation Grade"
              value={certForm.grade}
              onChange={(e) => setCertForm({ ...certForm, grade: e.target.value })}
              options={[
                { value: 'Distinction', label: 'Distinction (A+)' },
                { value: 'Merit', label: 'Merit (A)' },
                { value: 'Pass', label: 'Pass (B)' },
                { value: 'Completed', label: 'Completed' },
              ]}
            />
            <Input
              label="Completion Date"
              type="date"
              required
              value={certForm.completionDate}
              onChange={(e) => setCertForm({ ...certForm, completionDate: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIssueCertModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isIssuingCert}>
              Issue & Sign Certificate
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Post Notice */}
      <Modal isOpen={postNoticeModalOpen} onClose={() => setPostNoticeModalOpen(false)} title="Post Official Campus Notice" maxWidth="lg">
        <form onSubmit={handlePostNotice} className="space-y-4">
          <Input
            label="Notice Title *"
            required
            placeholder="e.g. Capstone Video Showcase Next Week"
            value={noticeForm.title}
            onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
          />
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Notice Content *
            </label>
            <textarea
              rows={4}
              required
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Write announcement body..."
              value={noticeForm.content}
              onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={noticeForm.category}
              onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
              options={[
                { value: 'ACADEMIC', label: 'Academic' },
                { value: 'EVENT', label: 'Event' },
                { value: 'EXAM', label: 'Exam / Quiz' },
                { value: 'URGENT', label: 'Urgent' },
              ]}
            />
            <Select
              label="Audience"
              value={noticeForm.targetRole}
              onChange={(e) => setNoticeForm({ ...noticeForm, targetRole: e.target.value })}
              options={[
                { value: 'ALL', label: 'Everyone (Students & Teachers)' },
                { value: 'STUDENT', label: 'Students Only' },
                { value: 'TEACHER', label: 'Teachers Only' },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinNotice"
              checked={noticeForm.pinned}
              onChange={(e) => setNoticeForm({ ...noticeForm, pinned: e.target.checked })}
              className="rounded text-brand-600"
            />
            <label htmlFor="pinNotice" className="text-xs font-semibold text-slate-700">
              Pin notice to top of bulletin
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setPostNoticeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingNotice}>
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
