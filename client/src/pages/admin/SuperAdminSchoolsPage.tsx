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

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/schools', {
        name: formData.name,
        address: { city: formData.city, state: formData.state, country: 'India' },
        contactPerson: {
          name: formData.contactPersonName,
          phone: formData.contactPersonPhone,
          email: formData.contactPersonEmail,
        },
        adminEmail: formData.adminEmail || formData.contactPersonEmail,
        adminPassword: formData.adminPassword,
        studentCapacity: formData.studentCapacity,
      });
      setModalOpen(false);
      loadSchools();
    } catch (err: any) {
      alert(err.message || 'Error creating school');
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
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Partner School Tenant" maxWidth="xl">
        <form onSubmit={handleCreateSchool} className="space-y-4">
          <Input
            label="School Name"
            required
            placeholder="e.g. Cambridge Modern School"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="State"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Person Name"
              required
              placeholder="Dr. S. K. Jain"
              value={formData.contactPersonName}
              onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
            />
            <Input
              label="Contact Phone"
              required
              placeholder="+91 98290 12345"
              value={formData.contactPersonPhone}
              onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Auto-Provision School Admin Account
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Admin Email"
                type="email"
                required
                placeholder="principal@school.edu"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              />
              <Input
                label="Initial Password"
                required
                value={formData.adminPassword}
                onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Provision School Tenant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
