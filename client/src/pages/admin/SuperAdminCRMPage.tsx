import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Plus,
  MessageSquare,
  Building2,
  Clock,
  ExternalLink,
  ChevronRight,
  Download,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { api } from '../../services/api';
import { Lead } from '../../types';
import { exportToCsv } from '../../utils/exportCsv';

export const SuperAdminCRMPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [noteText, setNoteText] = useState('');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>('CONTACTED');

  const stages = [
    { key: 'NEW', label: 'New Leads', color: 'border-slate-300 bg-slate-50' },
    { key: 'CONTACTED', label: 'Contacted', color: 'border-blue-300 bg-blue-50/40' },
    { key: 'DEMO_SCHEDULED', label: 'Demo Scheduled', color: 'border-amber-300 bg-amber-50/40' },
    { key: 'DEMO_DONE', label: 'Demo Completed', color: 'border-purple-300 bg-purple-50/40' },
    { key: 'CONVERTED', label: 'Converted Partner', color: 'border-emerald-300 bg-emerald-50/40' },
    { key: 'CLOSED', label: 'Closed / Inactive', color: 'border-rose-300 bg-rose-50/40' },
  ];

  const loadLeads = async () => {
    try {
      const res = await api.get('/crm');
      if (res.success && res.data) {
        setLeads(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleUpdateStatus = async (leadId: string, newStatus: string, note?: string) => {
    try {
      await api.put(`/crm/${leadId}/status`, { status: newStatus, note });
      loadLeads();
      setStatusModalOpen(false);
      if (selectedLead && selectedLead._id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus as any });
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleConvertLead = async (leadId: string) => {
    if (!window.confirm('Convert this lead into an active School Tenant with administrative credentials?')) return;
    try {
      const res = await api.post(`/crm/${leadId}/convert`);
      if (res.success) {
        alert(res.message);
        loadLeads();
        if (selectedLead) setSelectedLead(null);
      }
    } catch (err: any) {
      alert(err.message || 'Error converting lead');
    }
  };

  const handleExportCsv = () => {
    const dataToExport = leads.map((l) => ({
      'School Name': l.schoolName,
      'Contact Person': l.contactPerson,
      Designation: l.designation || '',
      Email: l.email,
      Phone: l.phone,
      City: l.city,
      Status: l.status,
      'Estimated Students': l.estimatedStudents,
      'Created Date': new Date(l.createdAt).toLocaleDateString(),
    }));
    exportToCsv('ALYSTRO_CRM_Leads', dataToExport);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-950 font-display">School CRM Pipeline</h2>
          <p className="text-xs text-slate-500">
            Track inquiries, demo sessions, and institution conversions from initial contact to contract.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export Leads CSV
        </Button>
      </div>

      {/* 6-Stage Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-6">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.key);
          return (
            <div
              key={stage.key}
              className={`rounded-2xl border p-3 flex flex-col h-[75vh] ${stage.color}`}
            >
              <div className="flex items-center justify-between px-2 py-1.5 mb-2 border-b border-black/5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{stage.label}</span>
                <span className="text-xs font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full shadow-xs">
                  {stageLeads.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {stageLeads.map((lead) => (
                  <div
                    key={lead._id}
                    onClick={() => setSelectedLead(lead)}
                    className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                        {lead.city}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-navy-950 leading-tight mb-1">{lead.schoolName}</h4>
                    <p className="text-[11px] text-slate-500">{lead.contactPerson}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">{lead.phone}</p>

                    {lead.status === 'DEMO_DONE' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConvertLead(lead._id);
                        }}
                        className="mt-3 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                      >
                        <Building2 className="w-3 h-3" /> Convert to School
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lead Detail & Pipeline Action Modal */}
      {selectedLead && (
        <Modal
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title={selectedLead.schoolName}
          subtitle={`Lead Stage: ${selectedLead.status}`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-medium block">Contact Person</span>
                <span className="font-bold text-slate-800">{selectedLead.contactPerson} ({selectedLead.designation || 'Principal'})</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Phone & Email</span>
                <span className="font-bold text-slate-800">{selectedLead.phone}</span>
                <span className="text-slate-500 block text-[11px]">{selectedLead.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Estimated Students</span>
                <span className="font-bold text-slate-800">{selectedLead.estimatedStudents || 250} Students</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">City & State</span>
                <span className="font-bold text-slate-800">{selectedLead.city}, {selectedLead.state || 'Rajasthan'}</span>
              </div>
            </div>

            {/* Pipeline Stage Transitions */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Advance Stage</h4>
              <div className="flex flex-wrap gap-2">
                {stages.map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => handleUpdateStatus(selectedLead._id, st.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      selectedLead.status === st.key
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Activity Timeline</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedLead.timeline?.map((t, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100 flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">{t.action}: {t.details}</p>
                      <span className="text-[10px] text-slate-400">{new Date(t.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Conversion Action */}
            {selectedLead.status !== 'CONVERTED' && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleConvertLead(selectedLead._id)}
                  leftIcon={<Building2 className="w-4 h-4" />}
                >
                  Convert Lead & Provision School Tenant Now
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
