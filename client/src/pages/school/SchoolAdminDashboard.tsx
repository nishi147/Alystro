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
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { api } from '../../services/api';
import { Student, Batch } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const SchoolAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [bulkResult, setBulkResult] = useState<any | null>(null);

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
      const [statsRes, studentsRes, batchesRes] = await Promise.all([
        api.get('/stats/school'),
        api.get(`/students?search=${encodeURIComponent(search)}`),
        api.get('/batches'),
      ]);

      if (statsRes.success) setStats(statsRes.data?.summary);
      if (studentsRes.success) setStudents(studentsRes.data || []);
      if (batchesRes.success) {
        setBatches(batchesRes.data || []);
        if (batchesRes.data?.[0]) {
          setStudentForm((prev) => ({ ...prev, batchId: batchesRes.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
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

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Parse CSV rows: Name, Email, RollNumber, Grade, Section, ParentPhone
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

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-950 font-display">
            {typeof user?.school === 'object' ? user.school?.name : 'School Administration Portal'}
          </h2>
          <p className="text-xs text-slate-500">
            Isolated tenant management for enrolled students, batches, attendance, and credentials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBulkResult(null);
              setBulkModalOpen(true);
            }}
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Bulk CSV Import
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
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Batches & Sections</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display mt-2">
            {batches.length}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">Live Timetables</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Attendance</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display mt-2">
            {stats?.averageAttendance ?? 92}%
          </p>
          <p className="text-[11px] text-brand-600 font-semibold mt-1">Consistent Engagement</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Certificates Issued</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display mt-2">
            {stats?.certificatesCount ?? 2}
          </p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Verifiable Credentials</p>
        </div>
      </div>

      {/* Filter and Student Roster */}
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
              ]}
            />
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Student Details</th>
                  <th className="py-3.5 px-6">Roll & Class</th>
                  <th className="py-3.5 px-6">Batch Assigned</th>
                  <th className="py-3.5 px-6">Attendance Rate</th>
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
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-brand-500 h-2 rounded-full"
                            style={{ width: `${st.attendanceRate || 85}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700">{st.attendanceRate || 85}%</span>
                      </div>
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
