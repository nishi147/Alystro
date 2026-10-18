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

export const SchoolAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'batches' | 'notices' | 'affiliations'>('students');
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [affiliationLoading, setAffiliationLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [bulkResult, setBulkResult] = useState<any | null>(null);

  // Add Teacher Modal
  const [addTeacherModalOpen, setAddTeacherModalOpen] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'Artificial Intelligence & Robotics',
    qualification: 'B.Tech in Computer Science',
  });
  const [isSubmittingTeacher, setIsSubmittingTeacher] = useState(false);

  // Post Notice Modal
  const [postNoticeModalOpen, setPostNoticeModalOpen] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'ACADEMIC',
    targetRole: 'ALL',
    pinned: false,
  });
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);

  // Add Student Form State
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    grade: 'Class 7',
    section: 'A',
    parentName: '',
    parentPhone: '',
    batchId: '',
  });

  const loadData = async () => {
    try {
      const [statsRes, studentsRes, batchesRes, teachersRes, noticesRes, affilRes] = await Promise.all([
        api.get('/stats/school'),
        api.get(`/students?search=${encodeURIComponent(search)}`),
        api.get('/batches'),
        api.get('/teachers'),
        api.get('/notices'),
        api.get('/schools/affiliations/requests').catch(() => ({ success: false })),
      ]);

      if (statsRes.success) setStats(statsRes.data?.summary);
      if (studentsRes.success) setStudents(studentsRes.data || []);
      if (batchesRes.success) {
        setBatches(batchesRes.data || []);
        if (batchesRes.data?.[0]) {
          setStudentForm((prev) => ({ ...prev, batchId: batchesRes.data[0]._id }));
        }
      }
      if (teachersRes.success) setTeachers(teachersRes.data || []);
      if (noticesRes.success) setNotices(noticesRes.data || []);
      if (affilRes?.success && Array.isArray(affilRes.data)) setAffiliations(affilRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveAffiliation = async (id: string) => {
    setAffiliationLoading(true);
    try {
      const res = await api.post(`/schools/affiliations/${id}/approve`);
      if (res.success) {
        loadData();
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
    const reason = window.prompt('Specify a rejection reason:');
    if (!reason) return;
    setAffiliationLoading(true);
    try {
      const res = await api.post(`/schools/affiliations/${id}/reject`, { reason });
      if (res.success) {
        loadData();
      } else {
        alert(res.message || 'Failed to reject affiliation.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reject affiliation.');
    } finally {
      setAffiliationLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/students', studentForm);
      setAddStudentModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error creating student');
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTeacher(true);
    try {
      await api.post('/teachers', teacherForm);
      setAddTeacherModalOpen(false);
      setTeacherForm({
        name: '',
        email: '',
        phone: '',
        specialization: 'Artificial Intelligence & Robotics',
        qualification: 'B.Tech in Computer Science',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error creating teacher');
    } finally {
      setIsSubmittingTeacher(false);
    }
  };

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingNotice(true);
    try {
      await api.post('/notices', noticeForm);
      setPostNoticeModalOpen(false);
      setNoticeForm({
        title: '',
        content: '',
        category: 'ACADEMIC',
        targetRole: 'ALL',
        pinned: false,
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error posting notice');
    } finally {
      setIsSubmittingNotice(false);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
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
            parentPhone: parts[5] || '',
            batchId: batches[0]?._id,
          };
        });

      const res = await api.post('/students/bulk-import', { students: parsedRows });
      if (res.success) {
        setBulkResult(res.data);
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Error executing bulk import');
    }
  };

  const fillSampleCsv = () => {
    setCsvText(
      `Name, Email, RollNumber, Grade, Section, ParentPhone\n` +
        `Manish Gupta, manish.gupta@student.alystro.com, ABC-701, Class 7, A, +91 98290 12001\n` +
        `Sneha Sharma, sneha.sharma@student.alystro.com, ABC-702, Class 7, A, +91 98290 12002\n` +
        `Kunal Rawat, kunal.rawat@student.alystro.com, ABC-703, Class 8, B, +91 98290 12003`
    );
  };

  const filteredStudents = students.filter((s) => {
    if (selectedGrade === 'ALL') return true;
    return s.grade === selectedGrade;
  });

  const handleExportStudentsCsv = () => {
    const dataToExport = filteredStudents.map((s) => ({
      'Roll Number': s.rollNumber,
      Name: s.name,
      Email: s.email,
      Grade: s.grade,
      Section: s.section,
      'Parent Contact': s.parentPhone || '',
      Status: s.status,
    }));
    exportToCsv('School_Student_Roster', dataToExport);
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-950 font-display">
            {typeof user?.school === 'object' ? user.school?.name : 'School Administration Portal'}
          </h2>
          <p className="text-xs text-slate-500">
            Isolated tenant management for enrolled students, mentors, batches, and institution notices.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportStudentsCsv}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
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
            {stats?.studentsCount ?? students.length}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Active Students in Lab</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Teachers & Mentors</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display mt-2">
            {teachers.length || 0}
          </p>
          <p className="text-[11px] text-brand-600 font-semibold mt-1">Certified ALYSTRO Trainers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Batches & Sections</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display mt-2">
            {batches.length}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">Active Timetables</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Attendance</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display mt-2">
            {stats?.averageAttendance ?? 0}%
          </p>
          <p className="text-[11px] text-brand-600 font-semibold mt-1">Engagement Metric</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'students'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Students Roster ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'teachers'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Teachers & Mentors ({teachers.length})
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'batches'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Batches & Timetable ({batches.length})
          </button>
          <button
            onClick={() => setActiveTab('notices')}
            className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'notices'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notice Board ({notices.length})
          </button>
          <button
            onClick={() => setActiveTab('affiliations')}
            className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'affiliations'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Affiliation Requests</span>
            {affiliations.filter((a) => a.status === 'PENDING').length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
                {affiliations.filter((a) => a.status === 'PENDING').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: STUDENTS */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="max-w-md w-full">
              <Input
                placeholder="Search student by name or roll number..."
                leftIcon={<Search className="w-4 h-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Classes' },
                  { value: 'Class 6', label: 'Class 6' },
                  { value: 'Class 7', label: 'Class 7' },
                  { value: 'Class 8', label: 'Class 8' },
                  { value: 'Class 9', label: 'Class 9' },
                  { value: 'Class 10', label: 'Class 10' },
                  { value: 'Class 11', label: 'Class 11' },
                  { value: 'Class 12', label: 'Class 12' },
                ]}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">Student Details</th>
                    <th className="py-3.5 px-6">Roll & Class</th>
                    <th className="py-3.5 px-6">Batch Assigned</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStudents.map((st) => (
                    <tr key={st._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center shrink-0">
                            {st.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{st.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{st.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-slate-800">{st.rollNumber}</span>
                        <p className="text-[11px] text-slate-500">{st.grade} • Sec {st.section}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-slate-700">
                          {typeof st.batch === 'object' ? st.batch?.name : 'Assigned Batch'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={st.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
                          {st.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link to="/verify" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                          View Records
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEACHERS */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">Mentors assigned to conduct classes and evaluate assignments.</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddTeacherModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add New Mentor
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t) => (
              <div key={t._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0">
                    {t.name?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-950 text-sm">{t.name}</h4>
                    <p className="text-xs text-slate-400">{t.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <p>
                    <strong className="text-slate-800">Specialization:</strong> {t.specialization || 'AI & Coding'}
                  </p>
                  <p>
                    <strong className="text-slate-800">Qualification:</strong> {t.qualification || 'Certified Trainer'}
                  </p>
                  {t.phone && (
                    <p className="flex items-center gap-1.5 text-slate-500">
                      <Phone className="w-3.5 h-3.5" /> {t.phone}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BATCHES */}
      {activeTab === 'batches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((b) => (
            <div key={b._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-navy-950 text-base">{b.name}</h4>
                <Badge variant="primary">{b.grade}</Badge>
              </div>
              <p className="text-xs text-slate-500 mb-4">Section {b.section} • Capacity {b.maxStudents} Students</p>
              <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Monday to Friday • 45 Mins
                </p>
                {b.meetingLink && (
                  <p className="text-brand-600 font-mono text-[11px] truncate">
                    {b.meetingLink}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: NOTICES */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">Official campus broadcasts visible to teachers and students.</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPostNoticeModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
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
                  <Badge variant="neutral">{n.category}</Badge>
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

      {/* TAB 5: AFFILIATION REQUESTS */}
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
                  {affiliations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No pending affiliation requests for this campus.
                      </td>
                    </tr>
                  )}
                  {affiliations.map((req) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Enroll Single Student */}
      <Modal isOpen={addStudentModalOpen} onClose={() => setAddStudentModalOpen(false)} title="Enroll Student to School Tenant" maxWidth="lg">
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="Aarav Sharma"
            value={studentForm.name}
            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
          />
          <Input
            label="Student Email Address"
            type="email"
            required
            placeholder="aarav@student.alystro.com"
            value={studentForm.email}
            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Roll Number"
              required
              placeholder="ABC-701"
              value={studentForm.rollNumber}
              onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
            />
            <Select
              label="Grade / Class"
              value={studentForm.grade}
              onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })}
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
          </div>

          <Select
            label="Assign to Batch"
            value={studentForm.batchId}
            onChange={(e) => setStudentForm({ ...studentForm, batchId: e.target.value })}
            options={batches.map((b) => ({ value: b._id, label: `${b.name} (${b.grade})` }))}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setAddStudentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Enroll Student
            </Button>
          </div>
        </form>
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
            placeholder="e.g. AI Prompting, Video Editing, Coding"
            value={teacherForm.specialization}
            onChange={(e) => setTeacherForm({ ...teacherForm, specialization: e.target.value })}
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

      {/* Modal: Post Notice */}
      <Modal isOpen={postNoticeModalOpen} onClose={() => setPostNoticeModalOpen(false)} title="Post Official Campus Notice" maxWidth="lg">
        <form onSubmit={handlePostNotice} className="space-y-4">
          <Input
            label="Notice Title *"
            required
            placeholder="e.g. Capstone Video Editing Showcase Next Week"
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
              Pin notice to top of the notice board
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

      {/* Modal: Bulk CSV Import */}
      <Modal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} title="Bulk Import Students via CSV" maxWidth="xl">
        <form onSubmit={handleBulkImport} className="space-y-4">
          <p className="text-xs text-slate-500">
            Paste comma-separated rows. Columns: <code className="font-mono text-slate-800">Name, Email, RollNumber, Grade, Section, ParentPhone</code>
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
            placeholder="Name, Email, RollNumber, Grade, Section, ParentPhone"
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
            <Button type="submit" variant="primary">
              Run Bulk Import
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
