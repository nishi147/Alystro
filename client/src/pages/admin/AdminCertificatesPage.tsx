import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Search,
  Plus,
  ExternalLink,
  Printer,
  ShieldCheck,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { exportToCsv } from '../../utils/exportCsv';

interface CertificateItem {
  _id: string;
  certificateId: string;
  studentName: string;
  schoolName: string;
  programName: string;
  grade: string;
  issueDate: string;
  completionDate?: string;
  status: 'VALID' | 'REVOKED' | 'EXPIRED';
  verificationQrCode?: string;
}

export const AdminCertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available students & programs for issuance modal
  const [students, setStudents] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);

  // Issue Form State
  const [issueForm, setIssueForm] = useState({
    studentId: '',
    programId: '',
    grade: 'Distinction',
    completionDate: new Date().toISOString().slice(0, 10),
  });

  const loadCertificates = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/certificates');
      if (res.success && res.data) {
        setCertificates(res.data);
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [stuRes, progRes] = await Promise.all([
        api.get('/students'),
        api.get('/programs'),
      ]);
      if (stuRes.success && stuRes.data) {
        setStudents(stuRes.data);
        if (stuRes.data[0]) {
          setIssueForm((prev) => ({ ...prev, studentId: stuRes.data[0]._id }));
        }
      }
      if (progRes.success && progRes.data) {
        setPrograms(progRes.data);
        if (progRes.data[0]) {
          setIssueForm((prev) => ({ ...prev, programId: progRes.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCertificates();
    loadDependencies();
  }, []);

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.studentId || !issueForm.programId) {
      alert('Please select both a student and a program.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/certificates/generate', issueForm);
      if (res.success) {
        setModalOpen(false);
        loadCertificates();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to issue certificate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCerts = certificates.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.certificateId.toLowerCase().includes(q) ||
      c.studentName.toLowerCase().includes(q) ||
      c.schoolName.toLowerCase().includes(q) ||
      c.programName.toLowerCase().includes(q)
    );
  });

  const handleExportCsv = () => {
    const dataToExport = filteredCerts.map((c) => ({
      'Certificate ID': c.certificateId,
      'Student Name': c.studentName,
      'School Name': c.schoolName,
      Program: c.programName,
      Grade: c.grade,
      Status: c.status,
      'Issue Date': new Date(c.issueDate).toLocaleDateString(),
    }));
    exportToCsv('ALYSTRO_Certificates_Registry', dataToExport);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-navy-950 font-display">
              Certificates Issuance & Registry
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Issue, authenticate, and manage verifiable digital credentials across partner schools.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Issue New Certificate
          </Button>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="max-w-md w-full">
          <Input
            placeholder="Search by ID, student, school, or program..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span>
            Total Issued: <strong className="text-slate-900">{certificates.length}</strong>
          </span>
          <span>
            Showing: <strong className="text-brand-600">{filteredCerts.length}</strong>
          </span>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Credential ID</th>
                <th className="py-3.5 px-6">Student Name</th>
                <th className="py-3.5 px-6">School Institution</th>
                <th className="py-3.5 px-6">Program</th>
                <th className="py-3.5 px-6">Grade Awarded</th>
                <th className="py-3.5 px-6">Issue Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-2" />
                    Loading certificate registry...
                  </td>
                </tr>
              ) : filteredCerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No certificates found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCerts.map((cert) => (
                  <tr key={cert._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-mono font-bold text-xs text-brand-600">
                      {cert.certificateId}
                    </td>
                    <td className="py-4 px-6 font-semibold text-navy-950">
                      {cert.studentName}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{cert.schoolName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {cert.programName}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="success" dot>
                        {cert.grade || 'Distinction'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/verify/${cert.certificateId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Verify & Print
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Issue New Certificate */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Issue Official ALYSTRO Certificate"
        maxWidth="lg"
      >
        <form onSubmit={handleIssueCertificate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Student *
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={issueForm.studentId}
              onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.rollNumber}) — {s.school?.name || 'Partner School'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Completed Program *
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={issueForm.programId}
              onChange={(e) => setIssueForm({ ...issueForm, programId: e.target.value })}
              required
            >
              <option value="">-- Choose Program --</option>
              {programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.gradeLevel})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Grade / Distinction Level
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={issueForm.grade}
                onChange={(e) => setIssueForm({ ...issueForm, grade: e.target.value })}
              >
                <option value="Distinction">Distinction (A+)</option>
                <option value="First Class with Merit">First Class with Merit (A)</option>
                <option value="Merit">Merit (B+)</option>
                <option value="Pass">Pass</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Completion Date
              </label>
              <Input
                type="date"
                value={issueForm.completionDate}
                onChange={(e) => setIssueForm({ ...issueForm, completionDate: e.target.value })}
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Issuing this credential will automatically generate a unique verification code (`ALY-2026-XXXXXX`) and a dynamic QR code readable by anyone globally.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Issue Certificate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
