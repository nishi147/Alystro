import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  FileText,
  CheckCircle2,
  Users,
  Video,
  Plus,
  Clock,
  Award,
  Layers,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import { Batch, Student, Assignment } from '../../types';

export const TeacherDashboard: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
  const [topicCovered, setTopicCovered] = useState('Hands-on Video Editing & Timeline Layering');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeTab, setActiveTab] = useState<'attendance' | 'assignments'>('attendance');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Assignment Modal
  const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalMarks: 50,
  });

  // Submissions & Grading Modal State
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [gradingSub, setGradingSub] = useState<any | null>(null);
  const [gradeMarks, setGradeMarks] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [isGrading, setIsGrading] = useState(false);

  const handleOpenSubmissions = async (asg: Assignment) => {
    setSelectedAssignment(asg);
    setGradingSub(null);
    setSubmissionsModalOpen(true);
    setIsLoadingSubmissions(true);
    try {
      const res = await api.get(`/assignments/${asg._id}/submissions`);
      if (res.success && res.data) {
        setSubmissions(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to load submissions');
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleStartGrading = (sub: any) => {
    setGradingSub(sub);
    setGradeMarks(sub.marksObtained ?? selectedAssignment?.totalMarks ?? 50);
    setGradeFeedback(sub.feedback || '');
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
            s._id === gradingSub._id
              ? { ...s, marksObtained: Number(gradeMarks), feedback: gradeFeedback, status: 'GRADED' }
              : s
          )
        );
        setGradingSub(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save grade');
    } finally {
      setIsGrading(false);
    }
  };

  const loadData = async () => {
    try {
      const [batchesRes, assignmentsRes] = await Promise.all([
        api.get('/batches'),
        api.get('/assignments'),
      ]);

      if (batchesRes.success && batchesRes.data) {
        setBatches(batchesRes.data);
        if (batchesRes.data[0]) {
          setSelectedBatch(batchesRes.data[0]._id);
        }
      }
      if (assignmentsRes.success) setAssignments(assignmentsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    async function loadBatchStudents() {
      if (!selectedBatch) return;
      try {
        const res = await api.get(`/students?batchId=${selectedBatch}`);
        if (res.success && res.data) {
          setStudents(res.data);
          const initialMap: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
          res.data.forEach((s: Student) => {
            initialMap[s._id] = 'PRESENT';
          });
          setAttendanceRecords(initialMap);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadBatchStudents();
  }, [selectedBatch]);

  const handleAttendanceChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendanceRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedBatch) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const formattedRecords = Object.keys(attendanceRecords).map((stId) => ({
        student: stId,
        status: attendanceRecords[stId],
        remark: attendanceRecords[stId] === 'LATE' ? 'Late arrival' : '',
      }));

      const res = await api.post('/attendance/mark', {
        batchId: selectedBatch,
        date: new Date(),
        topicCovered,
        records: formattedRecords,
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Error recording attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    try {
      const batchObj = batches.find((b) => b._id === selectedBatch);
      const programId = typeof batchObj?.program === 'object' ? batchObj?.program._id : batchObj?.program;

      await api.post('/assignments', {
        ...newAssignment,
        batchId: selectedBatch,
        programId,
      });
      setCreateAssignmentOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error publishing assignment');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-950 font-display">
            Mentor Classroom Dashboard
          </h2>
          <p className="text-xs text-slate-500">
            Conduct live sessions, take digital attendance, publish assignments, and review submissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateAssignmentOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Assignment
          </Button>
        </div>
      </div>

      {/* Assigned Batches Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {batches.map((b) => (
          <div
            key={b._id}
            onClick={() => setSelectedBatch(b._id)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              selectedBatch === b._id
                ? 'bg-brand-50/50 border-brand-500 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
                {b.grade} • Sec {b.section}
              </span>
              <a
                href={b.meetingLink || 'https://meet.google.com'}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl shadow-xs transition"
              >
                <Video className="w-3.5 h-3.5" /> Launch Live Session
              </a>
            </div>
            <h3 className="text-base font-bold text-navy-950">{b.name}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Schedule: Mon, Wed, Fri (4:00 PM – 4:45 PM) • Lab 1
            </p>
          </div>
        ))}
      </div>

      {/* Tabs: Attendance vs Assignments */}
      <div className="border-b border-slate-200 flex space-x-6">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'attendance' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500'
          }`}
        >
          Take Live Attendance
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'assignments' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500'
          }`}
        >
          Assignments & Submissions ({assignments.length})
        </button>
      </div>

      {/* Tab 1: Attendance Marking Module */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-navy-950">Daily Session Attendance</h3>
              <p className="text-xs text-slate-400">Mark student presence for today's 45-minute interactive class.</p>
            </div>
            <div className="max-w-xs w-full">
              <Input
                label="Topic Covered Today"
                value={topicCovered}
                onChange={(e) => setTopicCovered(e.target.value)}
              />
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Attendance successfully recorded in school database! Student engagement metrics updated.
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4 text-center">Status Selection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => {
                  const currentStatus = attendanceRecords[st._id] || 'PRESENT';
                  return (
                    <tr key={st._id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 text-sm block">{st.name}</span>
                        <span className="text-[11px] text-slate-400">{st.grade} • Sec {st.section}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{st.rollNumber}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1">
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(st._id, 'PRESENT')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              currentStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(st._id, 'LATE')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              currentStatus === 'LATE'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(st._id, 'ABSENT')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              currentStatus === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-4 flex justify-end">
            <Button variant="primary" onClick={handleSaveAttendance} isLoading={isSaving} className="px-8">
              Save & Submit Attendance
            </Button>
          </div>
        </div>
      )}

      {/* Tab 2: Assignments List */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {assignments.map((asg) => (
            <div key={asg._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded">
                  Max Marks: {asg.totalMarks}
                </span>
                <h4 className="text-base font-bold text-navy-950 mt-1">{asg.title}</h4>
                <p className="text-xs text-slate-500 max-w-xl mt-0.5">{asg.description}</p>
                <p className="text-[11px] text-slate-400 mt-2 font-mono">
                  Due: {new Date(asg.dueDate).toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleOpenSubmissions(asg)}>
                View Submissions
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Publish Assignment */}
      <Modal isOpen={createAssignmentOpen} onClose={() => setCreateAssignmentOpen(false)} title="Publish New Assignment" maxWidth="lg">
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <Input
            label="Assignment Title"
            required
            placeholder="e.g. 60-Second Short Form Reel Editing"
            value={newAssignment.title}
            onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Description & Rubric Instructions
            </label>
            <textarea
              rows={3}
              required
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="Outline project submission guidelines and required format."
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              required
              value={newAssignment.dueDate}
              onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
            />
            <Input
              label="Total Marks"
              type="number"
              required
              value={newAssignment.totalMarks}
              onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setCreateAssignmentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View & Grade Submissions */}
      <Modal
        isOpen={submissionsModalOpen}
        onClose={() => setSubmissionsModalOpen(false)}
        title={`Submissions: ${selectedAssignment?.title || 'Assignment'}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span>Total Marks: <strong className="text-slate-800">{selectedAssignment?.totalMarks}</strong></span>
            <span>Submissions received: <strong className="text-brand-600">{submissions.length}</strong></span>
          </div>

          {isLoadingSubmissions ? (
            <div className="py-12 text-center text-slate-400">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="py-12 text-center text-slate-400">No submissions uploaded for this assignment yet.</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {submissions.map((sub: any) => {
                const studentName = sub.student?.user?.name || sub.student?.name || 'Student';
                const isGraded = sub.status === 'GRADED';
                const isCurrentlyGrading = gradingSub?._id === sub._id;

                return (
                  <div key={sub._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-navy-950">{studentName}</p>
                        <p className="text-[11px] text-slate-400">
                          Submitted: {new Date(sub.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isGraded ? 'success' : 'neutral'} size="sm">
                          {isGraded ? `Graded: ${sub.marksObtained}/${selectedAssignment?.totalMarks}` : 'Pending Review'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartGrading(sub)}
                        >
                          {isGraded ? 'Update Grade' : 'Grade'}
                        </Button>
                      </div>
                    </div>

                    {sub.notes && (
                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 italic">
                        "{sub.notes}"
                      </p>
                    )}

                    {sub.fileUrl && (
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Submitted Project File / Link
                      </a>
                    )}

                    {sub.feedback && !isCurrentlyGrading && (
                      <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                        <strong>Mentor Feedback:</strong> {sub.feedback}
                      </p>
                    )}

                    {isCurrentlyGrading && (
                      <form onSubmit={handleSaveGrade} className="pt-2 border-t border-slate-200 space-y-3 bg-white p-3 rounded-lg">
                        <p className="text-xs font-bold text-slate-700">Enter Evaluation & Feedback</p>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label={`Score (out of ${selectedAssignment?.totalMarks})`}
                            type="number"
                            required
                            min={0}
                            max={selectedAssignment?.totalMarks || 100}
                            value={gradeMarks}
                            onChange={(e) => setGradeMarks(Number(e.target.value))}
                          />
                          <Input
                            label="Mentor Feedback"
                            placeholder="e.g. Excellent storytelling, tighten transitions"
                            value={gradeFeedback}
                            onChange={(e) => setGradeFeedback(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" type="button" onClick={() => setGradingSub(null)}>
                            Cancel
                          </Button>
                          <Button size="sm" variant="primary" type="submit" isLoading={isGrading}>
                            Save Grade
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setSubmissionsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
