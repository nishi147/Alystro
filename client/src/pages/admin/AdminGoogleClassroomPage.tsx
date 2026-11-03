import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Search,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Users,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Building2,
  BookOpen,
  Layers,
  Sparkles,
  Link2,
  Info,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Card, CardBody } from '../../components/ui/Card';
import { api } from '../../services/api';
import { GoogleClassroom } from '../../types';

export const AdminGoogleClassroomPage: React.FC = () => {
  const [classrooms, setClassrooms] = useState<GoogleClassroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [schoolFilter, setSchoolFilter] = useState<string>('ALL');

  // Form / modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview modal state
  const [previewClassroom, setPreviewClassroom] = useState<any | null>(null);

  // Roster modal state
  const [rosterClassroom, setRosterClassroom] = useState<GoogleClassroom | null>(null);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<GoogleClassroom | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dropdown reference data
  const [schools, setSchools] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);        // ALL batches (fallback)
  const [filteredBatches, setFilteredBatches] = useState<any[]>([]);  // batches for current school+course
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);

  // Form fields
  const [formData, setFormData] = useState({
    schoolId: '',
    courseId: '',
    batchId: '',
    classroomName: '',
    classroomUrl: '',
    teacherId: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    instructions: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load classrooms list
  const loadClassrooms = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/google-classrooms');
      if (res.success && res.data) {
        setClassrooms(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load Google Classrooms:', err);
      showFeedback('error', err.message || 'Failed to load Google Classrooms.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load dropdown data (Schools, Courses, Batches, Teachers)
  const loadDependencies = async () => {
    try {
      const [schoolsRes, coursesRes, batchesRes, teachersRes] = await Promise.all([
        api.get('/schools').catch(() => ({ data: [] })),
        api.get('/programs').catch(() => ({ data: [] })),
        api.get('/batches').catch(() => ({ data: [] })),
        api.get('/teachers').catch(() => ({ data: [] })),
      ]);

      if (schoolsRes.data) setSchools(schoolsRes.data);
      if (coursesRes.data) setCourses(coursesRes.data);
      if (batchesRes.data) setBatches(batchesRes.data);
      if (teachersRes.data) setTeachers(teachersRes.data);
    } catch (err) {
      console.error('Error loading dropdown dependencies:', err);
    }
  };

  useEffect(() => {
    loadClassrooms();
    loadDependencies();
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Fetch batches from the server scoped to a specific school (and optionally course)
  const fetchBatchesForSelection = async (schoolId: string, courseId?: string) => {
    if (!schoolId) { setFilteredBatches([]); return; }
    setIsBatchLoading(true);
    try {
      // The /batches endpoint supports ?schoolId= for SUPER_ADMIN / ADMIN roles
      const res = await api.get(`/batches?schoolId=${schoolId}`);
      const all: any[] = res.data || [];
      // Further filter client-side by program if courseId is provided
      if (courseId) {
        setFilteredBatches(
          all.filter((b) => {
            const bProgramId = (b.program?._id ?? b.program)?.toString() ?? '';
            return bProgramId === courseId;
          })
        );
      } else {
        setFilteredBatches(all);
      }
    } catch {
      // Fallback: use the already-loaded full batches list and filter client-side
      const fallback = batches.filter((b) => {
        const bSchoolId  = (b.school?._id  ?? b.school )?.toString()  ?? '';
        const bProgramId = (b.program?._id ?? b.program)?.toString() ?? '';
        const okSchool  = bSchoolId  === schoolId;
        const okCourse  = !courseId  || bProgramId === courseId;
        return okSchool && okCourse;
      });
      setFilteredBatches(fallback);
    } finally {
      setIsBatchLoading(false);
    }
  };

  // Handlers for school / course select changes — reset batch and re-fetch
  const handleSchoolChange = (schoolId: string) => {
    setFormData((prev) => ({ ...prev, schoolId, courseId: '', batchId: '', classroomName: '', teacherId: '' }));
    setFilteredBatches([]);
    if (schoolId) fetchBatchesForSelection(schoolId, '');
  };

  const handleCourseChange = (courseId: string) => {
    setFormData((prev) => ({ ...prev, courseId, batchId: '', classroomName: '', teacherId: '' }));
    fetchBatchesForSelection(formData.schoolId, courseId);
  };

  // The list used by the batch <select> — always the server-filtered set
  const availableBatches = filteredBatches;

  // URL Validation helper
  const isGoogleClassroomUrlValid = (url: string): { isValid: boolean; error?: string } => {
    if (!url || !url.trim()) return { isValid: false, error: 'URL is required.' };
    const clean = url.trim();
    if (!clean.startsWith('https://')) {
      return { isValid: false, error: 'URL must use HTTPS protocol (https://...)' };
    }
    try {
      const parsed = new URL(clean);
      const host = parsed.hostname.toLowerCase();
      if (host !== 'classroom.google.com' && !host.endsWith('.classroom.google.com')) {
        return { isValid: false, error: 'URL must belong to domain classroom.google.com' };
      }
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL format.' };
    }
  };

  const urlCheck = isGoogleClassroomUrlValid(formData.classroomUrl);

  // Auto-fill classroom name & teacher when batch changes
  const handleBatchChange = (batchId: string) => {
    const selectedBatch = batches.find((b) => b._id === batchId);
    let updatedName = formData.classroomName;
    let updatedTeacher = formData.teacherId;

    if (selectedBatch) {
      if (!isEditing || !formData.classroomName) {
        const courseName =
          courses.find((c) => c._id === formData.courseId || c._id === selectedBatch.program?._id || c._id === selectedBatch.program)?.name ||
          'Classroom';
        updatedName = `${courseName} - ${selectedBatch.name}`;
      }
      if (selectedBatch.teacher?._id || selectedBatch.teacher) {
        updatedTeacher = selectedBatch.teacher?._id || selectedBatch.teacher;
      }
    }

    setFormData((prev) => ({
      ...prev,
      batchId,
      classroomName: updatedName,
      teacherId: updatedTeacher,
    }));
  };

  // Reset & Open Create Modal
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormErrors({});
    setFilteredBatches([]);
    setFormData({
      schoolId: '',
      courseId: '',
      batchId: '',
      classroomName: '',
      classroomUrl: '',
      teacherId: '',
      status: 'ACTIVE',
      instructions: '',
    });
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (c: GoogleClassroom) => {
    setIsEditing(true);
    setEditingId(c._id);
    setFormErrors({});
    const sId = c.school?._id || (c.school as any) || '';
    const cId = c.course?._id || (c.course as any) || '';
    setFormData({
      schoolId: sId,
      courseId: cId,
      batchId: c.batch?._id || (c.batch as any) || '',
      classroomName: c.classroomName,
      classroomUrl: c.classroomUrl,
      teacherId: c.teacher?._id || (c.teacher as any) || '',
      status: c.status,
      instructions: c.instructions || '',
    });
    // Pre-populate the filtered batches so the locked batch field still shows correctly
    if (sId) fetchBatchesForSelection(sId, cId);
    setIsFormOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.schoolId) errors.schoolId = 'Please select a school.';
    if (!formData.courseId) errors.courseId = 'Please select a course.';
    if (!formData.batchId) errors.batchId = 'Please select a batch.';
    if (!formData.classroomName.trim()) errors.classroomName = 'Classroom name is required.';

    const urlRes = isGoogleClassroomUrlValid(formData.classroomUrl);
    if (!urlRes.isValid) {
      errors.classroomUrl = urlRes.error || 'A valid Google Classroom HTTPS URL is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit create or edit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEditing && editingId) {
        const res = await api.put(`/google-classrooms/${editingId}`, {
          classroomName: formData.classroomName,
          classroomUrl: formData.classroomUrl,
          teacherId: formData.teacherId || null,
          status: formData.status,
          instructions: formData.instructions,
          resolveUpdateRequest: true,
        });
        if (res.success) {
          showFeedback('success', 'Google Classroom link updated successfully.');
          setIsFormOpen(false);
          loadClassrooms();
        }
      } else {
        const res = await api.post('/google-classrooms', {
          schoolId: formData.schoolId,
          courseId: formData.courseId,
          batchId: formData.batchId,
          classroomName: formData.classroomName,
          classroomUrl: formData.classroomUrl,
          teacherId: formData.teacherId || undefined,
          status: formData.status,
          instructions: formData.instructions,
        });
        if (res.success) {
          showFeedback('success', 'Google Classroom linked to course successfully.');
          setIsFormOpen(false);
          loadClassrooms();
        }
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      showFeedback('error', err.message || 'Operation failed. Please verify fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (c: GoogleClassroom) => {
    const nextStatus = c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await api.patch(`/google-classrooms/${c._id}/status`, { status: nextStatus });
      if (res.success) {
        setClassrooms((prev) =>
          prev.map((item) => (item._id === c._id ? { ...item, status: nextStatus } : item))
        );
        showFeedback('success', `Classroom marked as ${nextStatus.toLowerCase()}.`);
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update status.');
    }
  };

  // Delete Classroom
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/google-classrooms/${deleteTarget._id}`);
      if (res.success) {
        setClassrooms((prev) => prev.filter((item) => item._id !== deleteTarget._id));
        showFeedback('success', 'Google Classroom link removed.');
        setDeleteTarget(null);
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete classroom.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Roster modal
  const handleViewRoster = async (c: GoogleClassroom) => {
    setRosterClassroom(c);
    setIsLoadingRoster(true);
    try {
      const res = await api.get(`/google-classrooms/${c._id}`);
      if (res.success && res.data) {
        setRosterClassroom(res.data);
      }
    } catch (err) {
      console.error('Failed to load roster:', err);
    } finally {
      setIsLoadingRoster(false);
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered list
  const filteredClassrooms = useMemo(() => {
    return classrooms.filter((c) => {
      const matchesSearch =
        search === '' ||
        c.classroomName.toLowerCase().includes(search.toLowerCase()) ||
        c.course?.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.batch?.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.school?.name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || c.status === statusFilter;

      const matchesSchool =
        schoolFilter === 'ALL' || c.school?._id === schoolFilter;

      return matchesSearch && matchesStatus && matchesSchool;
    });
  }, [classrooms, search, statusFilter, schoolFilter]);

  // Total metrics
  const activeCount = classrooms.filter((c) => c.status === 'ACTIVE').length;
  const pendingRequestsCount = classrooms.filter((c) => c.updateRequest && !c.updateRequest.resolved).length;
  const totalStudentsLinked = classrooms.reduce((sum, c) => sum + (c.studentCount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Google Classroom Management</h1>
              <p className="text-sm text-slate-500">
                Link and manage Google Classroom coursework for ALYSTRO courses, schools, and batches.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={loadClassrooms} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" onClick={openCreateModal} className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            Add Classroom Link
          </Button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium transition shadow-sm ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Teacher Update Request Alert Banner */}
      {pendingRequestsCount > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                {pendingRequestsCount} Pending Link Update Request{pendingRequestsCount > 1 ? 's' : ''} from Teachers
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Mentors have requested updates for one or more classroom links. Review their requests in the list below.
              </p>
            </div>
          </div>
          <Badge variant="warning" className="shrink-0">Action Required</Badge>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Classrooms</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{classrooms.length}</h3>
            </div>
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
              <Link2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
            Across {new Set(classrooms.map((c) => c.school?._id)).size} schools
          </p>
        </Card>

        <Card className="p-5 border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Links</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Visible to enrolled students</p>
        </Card>

        <Card className="p-5 border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inactive / Draft</p>
              <h3 className="text-2xl font-bold text-slate-600 mt-1">{classrooms.length - activeCount}</h3>
            </div>
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Hidden from student portal</p>
        </Card>

        <Card className="p-5 border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Enrolled Students</p>
              <h3 className="text-2xl font-bold text-brand-600 mt-1">{totalStudentsLinked}</h3>
            </div>
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Assigned to linked batches</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200/80 shadow-soft">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by classroom name, course, batch or school..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            >
              <option value="ALL">All Partner Schools</option>
              {schools.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code || 'SCH'})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mb-3" />
          <p className="text-sm">Loading Google Classrooms...</p>
        </div>
      ) : filteredClassrooms.length === 0 ? (
        <Card className="p-12 text-center border-slate-200/80 shadow-soft">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Google Classrooms Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            {search || statusFilter !== 'ALL' || schoolFilter !== 'ALL'
              ? 'No classroom records matched your current filters. Try resetting search criteria.'
              : 'No courses have been linked to Google Classroom yet. Add your first link to get started.'}
          </p>
          <Button variant="primary" onClick={openCreateModal} className="gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Connect Google Classroom
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClassrooms.map((c) => {
            const hasPendingRequest = c.updateRequest && !c.updateRequest.resolved;

            return (
              <Card
                key={c._id}
                className="flex flex-col justify-between border-slate-200/80 shadow-soft hover:shadow-card transition duration-200 rounded-2xl overflow-hidden bg-white"
              >
                <div>
                  {/* Card Header Banner */}
                  <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Badge variant={c.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                            {c.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-100">
                            {c.course?.category || 'Curriculum'}
                          </span>
                        </div>
                        <h2 className="text-base font-bold text-slate-900 truncate" title={c.classroomName}>
                          {c.classroomName}
                        </h2>
                      </div>

                      <button
                        onClick={() => handleToggleStatus(c)}
                        title={c.status === 'ACTIVE' ? 'Deactivate link' : 'Activate link'}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition ${
                          c.status === 'ACTIVE'
                            ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>

                  {/* Teacher Update Request Alert if pending */}
                  {hasPendingRequest && (
                    <div className="bg-amber-50 px-4 py-3 border-b border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Update Requested: </span>
                          <span>{c.updateRequest?.reason}</span>
                          {c.updateRequest?.suggestedUrl && (
                            <p className="text-[11px] font-mono text-amber-800 mt-0.5 truncate">
                              Suggested: {c.updateRequest.suggestedUrl}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => openEditModal(c)}
                        className="text-amber-800 font-bold underline hover:text-amber-900 shrink-0 ml-1"
                      >
                        Review
                      </button>
                    </div>
                  )}

                  {/* Card Body Details */}
                  <div className="p-5 space-y-3.5">
                    <div className="flex items-center gap-2.5 text-xs text-slate-600">
                      <BookOpen className="w-4 h-4 text-brand-600 shrink-0" />
                      <span className="font-medium text-slate-900">{c.course?.name || 'ALYSTRO Course'}</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-600">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{c.school?.name || 'Partner School'}</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-600">
                      <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        Batch: <strong className="text-slate-800">{c.batch?.name}</strong> (Grade {c.batch?.grade} - Sec {c.batch?.section})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
                      <span>Assigned Mentor:</span>
                      <span className="font-semibold text-slate-800">
                        {c.teacher?.name || 'Unassigned'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Enrolled Students:</span>
                      <button
                        onClick={() => handleViewRoster(c)}
                        className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {c.studentCount ?? c.batch?.currentStudentCount ?? 0} Students (View)
                      </button>
                    </div>

                    {/* URL Pill */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <div className="flex items-center gap-2 min-w-0 text-slate-700">
                          <Link2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-mono truncate select-all">{c.classroomUrl}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => copyToClipboard(c.classroomUrl, c._id)}
                            title="Copy Google Classroom URL"
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition"
                          >
                            {copiedId === c._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <a
                            href={c.classroomUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open Google Classroom"
                            className="p-1 text-brand-600 hover:text-brand-800 rounded-lg hover:bg-brand-50 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {c.instructions && (
                      <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 text-[11px] text-slate-600 line-clamp-2">
                        <strong className="text-slate-700 font-semibold">Instructions: </strong>
                        {c.instructions}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewClassroom(c)}
                      className="text-xs gap-1.5 text-slate-600 hover:text-brand-600"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewRoster(c)}
                      className="text-xs gap-1.5 text-slate-600 hover:text-brand-600"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Roster
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                      title="Edit Classroom Link"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Remove Classroom Link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT GOOGLE CLASSROOM LINK                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={isEditing ? 'Edit Google Classroom Link' : 'Connect Google Classroom Link'}
        subtitle="Associate an official HTTPS Google Classroom link with an ALYSTRO course and batch."
        maxWidth="xl"
        isSubmitting={isSubmitting}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Row 1: School & Course */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select School <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.schoolId}
                disabled={isEditing}
                onChange={(e) => handleSchoolChange(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition ${
                  formErrors.schoolId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                } ${isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <option value="">-- Choose Partner School --</option>
                {schools.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code || 'SCH'})
                  </option>
                ))}
              </select>
              {formErrors.schoolId && <p className="text-xs text-rose-600 mt-1">{formErrors.schoolId}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Course (Curriculum) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.courseId}
                disabled={isEditing}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, courseId: e.target.value, batchId: '' }));
                }}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition ${
                  formErrors.courseId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                } ${isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <option value="">-- Choose Course --</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.category || 'STEM'})
                  </option>
                ))}
              </select>
              {formErrors.courseId && <p className="text-xs text-rose-600 mt-1">{formErrors.courseId}</p>}
            </div>
          </div>

          {/* Row 2: Batch & Assigned Teacher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Batch <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.batchId}
                disabled={isEditing}
                onChange={(e) => handleBatchChange(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition ${
                  formErrors.batchId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                } ${isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <option value="">-- Choose Target Batch --</option>
                {availableBatches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} (Grade {b.grade} - Section {b.section})
                  </option>
                ))}
              </select>
              {formErrors.batchId && <p className="text-xs text-rose-600 mt-1">{formErrors.batchId}</p>}
              {!isEditing && availableBatches.length === 0 && formData.schoolId && (
                <p className="text-[11px] text-amber-600 mt-1">
                  No batches found for this school and course combination.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Assigned Mentor / Teacher
              </label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData((prev) => ({ ...prev, teacherId: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              >
                <option value="">-- Auto (Batch Lead Instructor) --</option>
                {teachers.map((t) => (
                  <option key={t.user?._id || t._id} value={t.user?._id || t._id}>
                    {t.name || t.user?.name} ({t.user?.email || t.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Classroom Name & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Classroom Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. AI & Robotics 101 - Batch Alpha"
                value={formData.classroomName}
                onChange={(e) => setFormData((prev) => ({ ...prev, classroomName: e.target.value }))}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition ${
                  formErrors.classroomName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
              {formErrors.classroomName && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.classroomName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              >
                <option value="ACTIVE">Active (Live for Students)</option>
                <option value="INACTIVE">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Row 4: Google Classroom URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Google Classroom URL <span className="text-rose-500">*</span>
              </label>
              {formData.classroomUrl && (
                <span
                  className={`text-[11px] font-semibold flex items-center gap-1 ${
                    urlCheck.isValid ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {urlCheck.isValid ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Valid Google Classroom Link
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" /> {urlCheck.error}
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="url"
                placeholder="https://classroom.google.com/c/NjAyOTc1Mzg3MDgw"
                value={formData.classroomUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, classroomUrl: e.target.value }))}
                className={`w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition ${
                  formErrors.classroomUrl ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Must be an official HTTPS link starting with <code>https://classroom.google.com/</code>.
            </p>
            {formErrors.classroomUrl && (
              <p className="text-xs text-rose-600 mt-1">{formErrors.classroomUrl}</p>
            )}
          </div>

          {/* Row 5: Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Instructions for Students <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Please sign in with your student school email. Check the Classwork tab every Monday for updated weekly problem sets and assignments."
              value={formData.instructions}
              onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (urlCheck.isValid) {
                  setPreviewClassroom({
                    classroomName: formData.classroomName || 'Sample Classroom',
                    classroomUrl: formData.classroomUrl,
                    instructions: formData.instructions,
                    status: formData.status,
                    course: courses.find((c) => c._id === formData.courseId),
                    batch: batches.find((b) => b._id === formData.batchId),
                    school: schools.find((s) => s._id === formData.schoolId),
                    teacher: teachers.find((t) => (t.user?._id || t._id) === formData.teacherId),
                  });
                } else {
                  alert('Please enter a valid Google Classroom URL before previewing.');
                }
              }}
              className="gap-2 text-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview Card
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting} className="min-w-28">
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Link' : 'Save & Publish'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: PREVIEW CLASSROOM BEFORE PUBLISHING                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {previewClassroom && (
        <Modal
          isOpen={Boolean(previewClassroom)}
          onClose={() => setPreviewClassroom(null)}
          title="Student & Teacher Link Preview"
          subtitle="This is how the connected Google Classroom card will appear on the dashboard."
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                  Google Classroom
                </span>
                <Badge variant={previewClassroom.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                  {previewClassroom.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{previewClassroom.classroomName}</h3>
              <p className="text-xs text-slate-600 mt-1">
                Course: <strong>{previewClassroom.course?.name || 'ALYSTRO Course'}</strong>
              </p>
              <p className="text-xs text-slate-600">
                Batch: <strong>{previewClassroom.batch?.name || 'Target Batch'}</strong>
              </p>
              <p className="text-xs text-slate-600">
                Instructor:{' '}
                <strong>{previewClassroom.teacher?.name || previewClassroom.teacher?.user?.name || 'Assigned Mentor'}</strong>
              </p>

              {previewClassroom.instructions && (
                <div className="mt-4 p-3 bg-white/80 rounded-xl border border-emerald-100 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                    <Info className="w-3.5 h-3.5 text-emerald-600" /> Instructions:
                  </div>
                  <p>{previewClassroom.instructions}</p>
                </div>
              )}

              <div className="mt-5 flex items-center gap-2">
                <a
                  href={previewClassroom.classroomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Google Classroom
                </a>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(previewClassroom.classroomUrl, 'preview')}
                  className="gap-1.5 text-xs py-2.5"
                >
                  {copiedId === 'preview' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copiedId === 'preview' ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="primary" onClick={() => setPreviewClassroom(null)}>
                Looks Good
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: ASSIGNED ROSTER (TEACHER & STUDENTS)                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {rosterClassroom && (
        <Modal
          isOpen={Boolean(rosterClassroom)}
          onClose={() => setRosterClassroom(null)}
          title={`Assigned Roster · ${rosterClassroom.classroomName}`}
          subtitle={`School: ${rosterClassroom.school?.name || ''} · Batch: ${rosterClassroom.batch?.name || ''}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 pt-1">
            {/* Mentor Banner */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                  {rosterClassroom.teacher?.name ? rosterClassroom.teacher.name.charAt(0) : 'M'}
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Assigned Mentor</p>
                  <h4 className="text-sm font-bold text-slate-900">
                    {rosterClassroom.teacher?.name || 'No mentor explicitly assigned'}
                  </h4>
                  <p className="text-xs text-slate-500">{rosterClassroom.teacher?.email || 'N/A'}</p>
                </div>
              </div>
              <Badge variant="primary">Teacher</Badge>
            </div>

            {/* Students List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Enrolled Students ({rosterClassroom.enrolledStudents?.length || 0})
                </h4>
              </div>

              {isLoadingRoster ? (
                <div className="py-8 text-center text-xs text-slate-500">Loading student roster...</div>
              ) : !rosterClassroom.enrolledStudents || rosterClassroom.enrolledStudents.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No active students found in this batch yet.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {rosterClassroom.enrolledStudents.map((s) => (
                    <div key={s._id} className="p-3 hover:bg-slate-50/70 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{s.name}</p>
                          <p className="text-slate-500 text-[11px]">
                            Roll: <strong className="text-slate-700">{s.rollNumber}</strong> · Grade {s.grade}
                            {s.section ? `-${s.section}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-700 font-mono text-[11px]">{s.email}</p>
                        {s.attendanceRate !== undefined && (
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            {s.attendanceRate}% Attendance
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setRosterClassroom(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: CONFIRM DELETE                                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Remove Google Classroom Link?"
          subtitle="Are you sure you want to remove this connection?"
          maxWidth="sm"
          isSubmitting={isDeleting}
        >
          <div className="space-y-4 pt-1">
            <p className="text-xs text-slate-600">
              This will remove the Google Classroom link for{' '}
              <strong className="text-slate-900">{deleteTarget.classroomName}</strong>. Students and teachers will no
              longer see this link on their dashboards.
            </p>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              Note: This action only disconnects the link in ALYSTRO. Your Google Classroom data inside Google will
              remain completely untouched.
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isDeleting ? 'Removing...' : 'Confirm Remove'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
