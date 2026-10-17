import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Search, ExternalLink, ShieldAlert, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { School } from '../../types';

export const SuperAdminSchoolsPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

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

  useEffect(() => {
    loadSchools();
  }, [search]);

  const handleOpenModal = () => {
    setFormError('');
    setFormSuccess('');
    setModalOpen(true);
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Pre-flight validation
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-950 font-display">School Tenants Directory</h2>
          <p className="text-xs text-slate-500">Manage all partnered institutions and isolated multi-tenant workspaces.</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Partner School
        </Button>
      </div>

      {/* Filter Bar */}
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

      {/* Schools Table */}
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
              {schools.map((school) => (
                <tr key={school._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                        {school.code.slice(0, 3)}
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

      {/* Modal: Create School */}
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
    </div>
  );
};
