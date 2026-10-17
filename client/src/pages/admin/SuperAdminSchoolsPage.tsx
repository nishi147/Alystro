import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  MapPin,
  Clock,
  Check,
  X,
  FileText,
  Mail,
  Phone,
  HelpCircle,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { School, SchoolApplication } from '../../types';

export const SuperAdminSchoolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tenants' | 'applications'>('tenants');
  const [schools, setSchools] = useState<School[]>([]);
  const [applications, setApplications] = useState<SchoolApplication[]>([]);
  const [search, setSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Tenant Creation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Application Actions Modal State
  const [selectedApp, setSelectedApp] = useState<SchoolApplication | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    city: 'Jaipur',
    state: 'Rajasthan',
    contactPersonName: '',
    contactPersonPhone: '',
    contactPersonEmail: '',
    adminEmail: '',
    adminPassword: 'School@123',
    studentCapacity: 500,
  });

  const loadSchools = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/schools?search=${encodeURIComponent(search)}`);
      if (res.success && res.data) {
        setSchools(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const res = await api.get(`/schools/applications?status=${appStatusFilter}`);
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'tenants') {
      loadSchools();
    } else {
      loadApplications();
    }
  }, [activeTab, search, appStatusFilter]);

  // Initial load of both to display badge count
  useEffect(() => {
    loadApplications();
  }, []);

  const pendingAppsCount = applications.filter((a) => a.status === 'PENDING_APPROVAL').length;

  const handleOpenModal = () => {
    setFormError('');
    setFormSuccess('');
    setModalOpen(true);
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name.trim()) {
      setFormError('School name is required.');
      return;
    }
    if (!formData.city.trim() || !formData.state.trim()) {
      setFormError('City and State are required.');
      return;
    }
    if (!formData.contactPersonName.trim() || !formData.contactPersonPhone.trim()) {
      setFormError('Contact person name and phone are required.');
      return;
    }

    const effectiveAdminEmail = (formData.adminEmail || formData.contactPersonEmail || '').trim();
    if (!effectiveAdminEmail) {
      setFormError('Please provide an admin email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/schools', {
        name: formData.name.trim(),
        address: {
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: 'India',
        },
        contactPerson: {
          name: formData.contactPersonName.trim(),
          phone: formData.contactPersonPhone.trim(),
          email: (formData.contactPersonEmail || effectiveAdminEmail).trim(),
        },
        adminEmail: effectiveAdminEmail,
        adminPassword: formData.adminPassword.trim() || 'School@123',
        studentCapacity: Number(formData.studentCapacity) || 500,
      });

      if (res.success) {
        setFormSuccess(`School "${formData.name}" provisioned successfully!`);
        setTimeout(() => {
          setModalOpen(false);
          setFormSuccess('');
          setFormData({
            name: '',
            city: 'Jaipur',
            state: 'Rajasthan',
            contactPersonName: '',
            contactPersonPhone: '',
            contactPersonEmail: '',
            adminEmail: '',
            adminPassword: 'School@123',
            studentCapacity: 500,
          });
          loadSchools();
        }, 1200);
      } else {
        setFormError(res.message || 'Failed to create school.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error creating school. Please verify inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approval Handlers
  const handleApprove = async (app: SchoolApplication) => {
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.post(`/schools/applications/${app._id}/approve`);
      if (res.success) {
        setActionSuccess(`Application for "${app.schoolName}" approved! Tenant provisioned.`);
        loadApplications();
        loadSchools();
      } else {
        setActionError(res.message || 'Failed to approve application.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to approve application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (app: SchoolApplication) => {
    setSelectedApp(app);
    setRejectionReason('');
    setActionError('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.post(`/schools/applications/${selectedApp._id}/reject`, {
        reason: rejectionReason,
      });
      if (res.success) {
        setRejectModalOpen(false);
        loadApplications();
      } else {
        setActionError(res.message || 'Failed to reject application.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (app: SchoolApplication) => {
    setSelectedApp(app);
    setDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-950 font-display">School Tenants & Onboarding</h2>
          <p className="text-xs text-slate-500">
            Manage active institutional workspaces, review public partnership applications, and provision school admins.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Partner School
        </Button>
      </div>

      {/* Primary Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('tenants')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'tenants'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Active Partner Schools ({schools.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('applications')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'applications'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>School Registration Requests</span>
          {pendingAppsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
              {pendingAppsCount}
            </span>
          )}
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* TAB 1: ACTIVE SCHOOL TENANTS */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex items-center justify-between gap-4">
            <div className="max-w-md w-full">
              <Input
                placeholder="Search school name, city, or code..."
                leftIcon={<Search className="w-4 h-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total Schools: <strong className="text-slate-900">{schools.length}</strong>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">School Name & Code</th>
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">Contact Person</th>
                    <th className="py-3.5 px-6">Capacity</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {schools.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No school tenants found.
                      </td>
                    </tr>
                  )}
                  {schools.map((school) => (
                    <tr key={school._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                            {school.code ? school.code.slice(0, 3) : 'SCH'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{school.name}</p>
                            <span className="font-mono text-[10px] text-slate-400 font-semibold">{school.code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{school.address.city}, {school.address.state}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900">{school.contactPerson?.name}</p>
                        <p className="text-[11px] text-slate-400">{school.contactPerson?.phone}</p>
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        {school.activeStudentCount || 0} / {school.studentCapacity}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={school.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
                          {school.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          to={`/schools/${school.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg"
                        >
                          Public Page <ExternalLink className="w-3 h-3" />
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

      {/* TAB 2: SCHOOL REGISTRATION REQUESTS & APPROVALS */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Filter Status:</span>
              <div className="flex gap-1.5 text-xs">
                {(['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setAppStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                      appStatusFilter === st
                        ? 'bg-navy-950 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'ALL' ? 'All Requests' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Showing <strong className="text-slate-900">{applications.length}</strong> application(s)
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">School Name</th>
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">Contact Person</th>
                    <th className="py-3.5 px-6">Classes & Capacity</th>
                    <th className="py-3.5 px-6">Registration Date</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No school registration applications matching criteria.
                      </td>
                    </tr>
                  )}
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{app.schoolName}</p>
                            <p className="text-[11px] text-slate-400">{app.schoolEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-slate-800">{app.city}, {app.state}</span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900">{app.contactPersonName}</p>
                        <p className="text-[11px] text-slate-400">{app.contactPersonDesignation || 'Principal'} • {app.schoolPhone}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-800">
                          {app.classesOffered && app.classesOffered.length > 0
                            ? app.classesOffered.join(', ')
                            : 'All Classes'}
                        </p>
                        <p className="text-[11px] text-slate-400">Est. {app.studentCount || 0} students</p>
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6">
                        {app.status === 'APPROVED' && (
                          <Badge variant="success" dot>APPROVED</Badge>
                        )}
                        {app.status === 'PENDING_APPROVAL' && (
                          <Badge variant="warning" dot>PENDING</Badge>
                        )}
                        {app.status === 'REJECTED' && (
                          <Badge variant="danger" dot>REJECTED</Badge>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(app)}
                            title="View Full Application Details"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {app.status === 'PENDING_APPROVAL' && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleApprove(app)}
                                title="Approve School Application"
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleOpenReject(app)}
                                title="Reject School Application"
                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition disabled:opacity-50"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Create School Tenant Directly (Super Admin Manual Provisioning) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          if (!isSubmitting) setModalOpen(false);
        }}
        title="Create New Partner School Tenant"
        subtitle="Provision an isolated multi-tenant academic database and administrator credentials"
        maxWidth="xl"
        isSubmitting={isSubmitting}
      >
        <form onSubmit={handleCreateSchool} className="space-y-4">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{formSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <Input
                label="School Name"
                required
                placeholder="e.g. Cambridge Modern School"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Input
                label="Student Capacity"
                type="number"
                min={10}
                max={50000}
                required
                value={formData.studentCapacity}
                onChange={(e) => setFormData({ ...formData, studentCapacity: parseInt(e.target.value, 10) || 500 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="City"
              required
              placeholder="e.g. Jaipur"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="State"
              required
              placeholder="e.g. Rajasthan"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <Input
                label="Contact Person Name"
                required
                placeholder="Dr. S. K. Jain"
                value={formData.contactPersonName}
                onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
              />
            </div>
            <div>
              <Input
                label="Contact Phone"
                required
                placeholder="+91 98290 12345"
                value={formData.contactPersonPhone}
                onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
              />
            </div>
            <div>
              <Input
                label="Contact Email"
                type="email"
                placeholder="defaults to admin email"
                value={formData.contactPersonEmail}
                onChange={(e) => setFormData({ ...formData, contactPersonEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Auto-Provision School Admin Account
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="Admin Login Email"
                type="email"
                required
                placeholder="principal@school.edu"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              />
              <Input
                label="Initial Password"
                required
                placeholder="School@123"
                value={formData.adminPassword}
                onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Provision School Tenant
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: View Application Details */}
      {selectedApp && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`Application Details: ${selectedApp.schoolName}`}
          subtitle="Full registration payload submitted by applicant"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Status</span>
                <span className="font-bold text-slate-900">{selectedApp.status}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Submitted At</span>
                <span className="font-medium text-slate-700">{new Date(selectedApp.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">School Email</span>
                <span className="font-medium text-slate-700">{selectedApp.schoolEmail}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">School Phone</span>
                <span className="font-medium text-slate-700">{selectedApp.schoolPhone}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Location</span>
                <span className="font-medium text-slate-700">{selectedApp.city}, {selectedApp.state}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Student Strength</span>
                <span className="font-medium text-slate-700">{selectedApp.studentCount || 'Not specified'}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Full Address</span>
              <p className="text-slate-800 font-medium">{selectedApp.address}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Contact Person</span>
              <p className="font-bold text-slate-900">{selectedApp.contactPersonName} ({selectedApp.contactPersonDesignation || 'Principal'})</p>
            </div>

            {selectedApp.rejectionReason && (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-1">
                <span className="text-[10px] uppercase text-rose-500 font-bold block">Rejection Reason</span>
                <p className="font-medium text-rose-800">{selectedApp.rejectionReason}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: Reject Application Reason Modal */}
      {selectedApp && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Application: ${selectedApp.schoolName}`}
          subtitle="Specify a reason that will be displayed to the applicant on their status page"
          maxWidth="md"
        >
          <form onSubmit={handleConfirmReject} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Unable to verify institutional accreditation. Please provide valid affiliation documents."
                className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 font-bold"
                isLoading={actionLoading}
              >
                Confirm Rejection
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
