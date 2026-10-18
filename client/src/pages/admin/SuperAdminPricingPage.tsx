import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Edit,
  Building2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  CreditCard,
  Plus,
  Save,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';

export const SuperAdminPricingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'programs' | 'benefits' | 'schools'>('programs');
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<any[]>([]);
  const [partnershipConfig, setPartnershipConfig] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit Program Pricing Modal State
  const [editProgramModalOpen, setEditProgramModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [programForm, setProgramForm] = useState({
    partnerFee: 5000,
    standardValue: 10000,
    gstRate: 18,
    discountPercent: 50,
  });
  const [isSavingProgram, setIsSavingProgram] = useState(false);

  // Edit Benefits Modal State
  const [editBenefitsModalOpen, setEditBenefitsModalOpen] = useState(false);
  const [benefitsForm, setBenefitsForm] = useState({
    combinedValuation: 200000,
    milestoneStudents: 300,
    websiteValuation: 50000,
    appValuation: 150000,
  });
  const [isSavingBenefits, setIsSavingBenefits] = useState(false);

  // Edit School Commercials Modal State
  const [editSchoolModalOpen, setEditSchoolModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [schoolCommercialForm, setSchoolCommercialForm] = useState<any>({
    planName: '',
    paymentStatus: 'PAID',
    agreedProgramFees: [],
    billedAmount: 0,
    paidAmount: 0,
  });
  const [isSavingSchool, setIsSavingSchool] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pricingRes, schoolsRes] = await Promise.all([
        api.get('/pricing/admin/programs'),
        api.get('/pricing/admin/schools'),
      ]);

      if (pricingRes.success && pricingRes.data) {
        setPrograms(pricingRes.data.programs || []);
        setPartnershipConfig(pricingRes.data.partnershipConfig || null);
      }

      if (schoolsRes.success && schoolsRes.data) {
        setSchools(schoolsRes.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load admin pricing:', err);
      setErrorMsg(err.message || 'Failed to load pricing data from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEditProgram = (prog: any) => {
    setSelectedProgram(prog);
    setProgramForm({
      partnerFee: prog.pricing?.partnerFee || 5000,
      standardValue: prog.pricing?.standardValue || 10000,
      gstRate: prog.pricing?.gstRate ?? 18,
      discountPercent: prog.pricing?.discountPercent ?? 50,
    });
    setEditProgramModalOpen(true);
  };

  const handleSaveProgramPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    setIsSavingProgram(true);
    try {
      const res = await api.put(`/pricing/admin/programs/${selectedProgram._id}`, programForm);
      if (res.success) {
        setSuccessMsg(`Pricing for ${selectedProgram.name} updated successfully!`);
        setTimeout(() => setSuccessMsg(''), 4000);
        setEditProgramModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save program pricing.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setIsSavingProgram(false);
    }
  };

  const handleOpenEditBenefits = () => {
    if (!partnershipConfig) return;
    const website = partnershipConfig.benefits?.find((b: any) => b.id === 'website')?.valuation || 50000;
    const app = partnershipConfig.benefits?.find((b: any) => b.id === 'mobile_app')?.valuation || 150000;
    setBenefitsForm({
      combinedValuation: partnershipConfig.combinedValuation || 200000,
      milestoneStudents: partnershipConfig.milestoneStudents || 300,
      websiteValuation: website,
      appValuation: app,
    });
    setEditBenefitsModalOpen(true);
  };

  const handleSaveBenefits = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBenefits(true);
    try {
      const updatedBenefits = [
        {
          id: 'website',
          title: 'Professional School Website',
          valuation: Number(benefitsForm.websiteValuation),
          description: 'Modern mobile-responsive school portal with admissions, announcements, and management system.',
          milestoneStudents: Number(benefitsForm.milestoneStudents),
          isUnlocked: true,
        },
        {
          id: 'mobile_app',
          title: 'School Mobile App',
          valuation: Number(benefitsForm.appValuation),
          description: 'Custom school-branded mobile application with real-time academic tracking.',
          milestoneStudents: Number(benefitsForm.milestoneStudents),
          isUnlocked: true,
        },
      ];

      const res = await api.put('/pricing/admin/benefits', {
        combinedValuation: Number(benefitsForm.combinedValuation),
        milestoneStudents: Number(benefitsForm.milestoneStudents),
        benefits: updatedBenefits,
      });

      if (res.success) {
        setSuccessMsg('Partnership technology valuations updated in database successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
        setEditBenefitsModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update benefits.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setIsSavingBenefits(false);
    }
  };

  const handleOpenEditSchool = (school: any) => {
    setSelectedSchool(school);
    const ct = school.commercialTerms || {};
    setSchoolCommercialForm({
      planName: ct.planName || 'ALYSTRO School Partnership Agreement (Standard)',
      paymentStatus: school.paymentStatus || 'PENDING',
      agreedProgramFees: ct.agreedProgramFees ? [...ct.agreedProgramFees] : [],
      billedAmount: ct.billing?.totalBilledAmount || 0,
      paidAmount: ct.billing?.paidAmount || 0,
    });
    setEditSchoolModalOpen(true);
  };

  const handleUpdateSchoolFee = (idx: number, fee: number) => {
    const updated = [...schoolCommercialForm.agreedProgramFees];
    updated[idx].negotiatedFee = fee;
    setSchoolCommercialForm({ ...schoolCommercialForm, agreedProgramFees: updated });
  };

  const handleSaveSchoolCommercials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;
    setIsSavingSchool(true);
    try {
      const billed = Number(schoolCommercialForm.billedAmount);
      const paid = Number(schoolCommercialForm.paidAmount);
      const outstanding = Math.max(0, billed - paid);

      const payload = {
        paymentStatus: schoolCommercialForm.paymentStatus,
        commercialTerms: {
          ...selectedSchool.commercialTerms,
          planName: schoolCommercialForm.planName,
          agreedProgramFees: schoolCommercialForm.agreedProgramFees,
          billing: {
            ...selectedSchool.commercialTerms?.billing,
            totalBilledAmount: billed,
            paidAmount: paid,
            outstandingBalance: outstanding,
            paymentStatus: schoolCommercialForm.paymentStatus,
          },
        },
      };

      const res = await api.put(`/pricing/admin/schools/${selectedSchool._id}`, payload);
      if (res.success) {
        setSuccessMsg(`Agreement & billing updated for ${selectedSchool.name}!`);
        setTimeout(() => setSuccessMsg(''), 4000);
        setEditSchoolModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update school commercial terms.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setIsSavingSchool(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success" dot>Fully Paid</Badge>;
      case 'PARTIAL':
        return <Badge variant="warning" dot>Partial Payment</Badge>;
      case 'OVERDUE':
        return <Badge variant="danger" dot>Overdue</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="neutral" dot>Pending Payment</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-950 font-display flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-brand-600" />
            Pricing, Commercials & Billing Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Authorized administrative panel. Program fees, GST rates, valuations, and school commercial agreements are fetched live from the database.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh DB
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('programs')}
            className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'programs'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Standard Program Pricing ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab('benefits')}
            className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'benefits'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Partnership Benefits & Valuations
          </button>
          <button
            onClick={() => setActiveTab('schools')}
            className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'schools'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            School Agreements & Invoices ({schools.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading secure pricing from database...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: STANDARD PROGRAM PRICING */}
          {activeTab === 'programs' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {programs.map((prog) => {
                  const partnerFee = prog.pricing?.partnerFee || 5000;
                  const standardVal = prog.pricing?.standardValue || 10000;
                  const gst = prog.pricing?.gstRate ?? 18;
                  const totalWithGst = Math.round(partnerFee + (partnerFee * gst) / 100);

                  return (
                    <div
                      key={prog._id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200">
                            {prog.gradeLevel.replace('CLASS_', 'Classes ').replace('_', '–')}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ● Database Active
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-navy-950 mb-1">{prog.name}</h3>
                        <p className="text-xs text-slate-500 mb-4">{prog.category}</p>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3 mb-6">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Standard Retail Value:</span>
                            <span className="text-slate-500 line-through font-mono font-medium">
                              ₹{standardVal.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-700">Approved Partner Fee:</span>
                            <span className="text-xl font-extrabold text-brand-600 font-mono">
                              ₹{partnerFee.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                            <span className="text-slate-500">Applicable GST:</span>
                            <span className="font-semibold text-slate-700 font-mono">+{gst}% GST</span>
                          </div>
                          <div className="flex justify-between items-center text-xs pt-1">
                            <span className="font-bold text-navy-950">Net Effective / Student:</span>
                            <span className="font-bold text-navy-950 font-mono">
                              ₹{totalWithGst.toLocaleString('en-IN')} (incl. GST)
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => handleOpenEditProgram(prog)}
                        leftIcon={<Edit className="w-3.5 h-3.5" />}
                      >
                        Edit Program Pricing
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Security Banner */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  <strong>Public Price Shield:</strong> The figures above are strictly confidential and restricted to authenticated Administrators. All public catalog and brochure pages display only curriculum descriptions, without exposing fees or monetary numbers.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: PARTNERSHIP BENEFITS & VALUATIONS */}
          {activeTab === 'benefits' && (
            <div className="space-y-6">
              {partnershipConfig ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-soft">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                        Institutional Milestone Package
                      </span>
                      <h3 className="text-xl font-extrabold text-navy-950 mt-1">
                        {partnershipConfig.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Unlocks upon achieving the {partnershipConfig.milestoneStudents}-student enrollment milestone.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleOpenEditBenefits}
                      leftIcon={<Edit className="w-4 h-4" />}
                    >
                      Update Package Valuations
                    </Button>
                  </div>

                  {/* Benefit Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    {partnershipConfig.benefits?.map((b: any) => (
                      <div key={b.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                            Approved Valuation
                          </span>
                          <span className="text-xl font-extrabold text-navy-950 font-mono">
                            ₹{Number(b.valuation).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-navy-950 mb-2">{b.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">{b.description}</p>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Milestone Required: {b.milestoneStudents} enrolled students
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Combined Package Total */}
                  <div className="bg-navy-950 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        Combined Technology Infrastructure Valuation
                      </p>
                      <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1">
                        ₹{Number(partnershipConfig.combinedValuation).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-slate-300 mt-1">
                        Provided to approved institutions at zero additional licensing charge upon milestone completion.
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
                        10% Commission on Pre-Milestone
                      </span>
                    </div>
                  </div>

                  {/* Additional Support Points */}
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Contractual Support Terms Included
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {partnershipConfig.additionalSupport?.map((sup: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{sup}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-sm">No partnership configuration found.</div>
              )}
            </div>
          )}

          {/* TAB 3: SCHOOL COMMERCIAL AGREEMENTS & BILLING */}
          {activeTab === 'schools' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-navy-950">Partner Schools Commercial Register</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      School-specific negotiated fees, billed totals, paid amounts, and live payment status.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-5">School Tenant</th>
                        <th className="py-3.5 px-5">Commercial Plan</th>
                        <th className="py-3.5 px-5">Agreed Fees</th>
                        <th className="py-3.5 px-5">Billed Total</th>
                        <th className="py-3.5 px-5">Paid Amount</th>
                        <th className="py-3.5 px-5">Balance</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schools.map((school) => {
                        const ct = school.commercialTerms || {};
                        const billing = ct.billing || {};
                        const fees = ct.agreedProgramFees || [];
                        const billed = billing.totalBilledAmount || 0;
                        const paid = billing.paidAmount || 0;
                        const balance = billing.outstandingBalance || Math.max(0, billed - paid);

                        return (
                          <tr key={school._id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-4 px-5">
                              <p className="font-bold text-navy-950">{school.name}</p>
                              <p className="text-[11px] font-mono text-slate-400">{school.code}</p>
                            </td>
                            <td className="py-4 px-5">
                              <span className="text-xs font-medium text-slate-700">
                                {ct.planName || 'Standard Agreement'}
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              <div className="space-y-1">
                                {fees.length > 0 ? (
                                  fees.map((f: any, idx: number) => {
                                    const isNegotiated = f.negotiatedFee !== f.standardFee;
                                    return (
                                      <div key={idx} className="text-xs flex items-center gap-1.5">
                                        <span className="text-slate-500 font-mono">{f.gradeLevel}:</span>
                                        <span className="font-bold text-navy-950 font-mono">
                                          ₹{Number(f.negotiatedFee).toLocaleString('en-IN')}
                                        </span>
                                        {isNegotiated && (
                                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                            Negotiated
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })
                                ) : (
                                  <span className="text-xs text-slate-400 italic">Standard rate applied</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-5 font-mono text-xs font-bold text-slate-800">
                              ₹{billed.toLocaleString('en-IN')}
                            </td>
                            <td className="py-4 px-5 font-mono text-xs font-bold text-emerald-600">
                              ₹{paid.toLocaleString('en-IN')}
                            </td>
                            <td className="py-4 px-5 font-mono text-xs font-bold text-rose-600">
                              ₹{balance.toLocaleString('en-IN')}
                            </td>
                            <td className="py-4 px-5">
                              {getStatusBadge(school.paymentStatus || billing.paymentStatus || 'PENDING')}
                            </td>
                            <td className="py-4 px-5 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => handleOpenEditSchool(school)}
                                leftIcon={<Edit className="w-3.5 h-3.5" />}
                              >
                                Manage Terms
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
        </>
      )}

      {/* MODAL 1: EDIT PROGRAM PRICING */}
      <Modal
        isOpen={editProgramModalOpen}
        onClose={() => setEditProgramModalOpen(false)}
        title={`Edit Pricing: ${selectedProgram?.name || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveProgramPricing} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Approved School Partner Fee (₹) *
            </label>
            <Input
              type="number"
              value={programForm.partnerFee}
              onChange={(e) => setProgramForm({ ...programForm, partnerFee: Number(e.target.value) })}
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              The baseline fee charged per student under the school partnership contract.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Standard Retail Value (₹) *
            </label>
            <Input
              type="number"
              value={programForm.standardValue}
              onChange={(e) => setProgramForm({ ...programForm, standardValue: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                GST Rate (%)
              </label>
              <Input
                type="number"
                value={programForm.gstRate}
                onChange={(e) => setProgramForm({ ...programForm, gstRate: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Partner Discount (%)
              </label>
              <Input
                type="number"
                value={programForm.discountPercent}
                onChange={(e) => setProgramForm({ ...programForm, discountPercent: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center font-mono">
            <span className="text-slate-500">Effective Total with GST:</span>
            <span className="font-extrabold text-brand-600 text-sm">
              ₹{(
                programForm.partnerFee +
                (programForm.partnerFee * programForm.gstRate) / 100
              ).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setEditProgramModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSavingProgram} leftIcon={<Save className="w-4 h-4" />}>
              Save to Database
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT BENEFITS & VALUATIONS */}
      <Modal
        isOpen={editBenefitsModalOpen}
        onClose={() => setEditBenefitsModalOpen(false)}
        title="Update Technology Valuations & Milestone"
        maxWidth="md"
      >
        <form onSubmit={handleSaveBenefits} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Combined Technology Valuation (₹) *
            </label>
            <Input
              type="number"
              value={benefitsForm.combinedValuation}
              onChange={(e) => setBenefitsForm({ ...benefitsForm, combinedValuation: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                School Website Valuation (₹)
              </label>
              <Input
                type="number"
                value={benefitsForm.websiteValuation}
                onChange={(e) => setBenefitsForm({ ...benefitsForm, websiteValuation: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                School Mobile App Valuation (₹)
              </label>
              <Input
                type="number"
                value={benefitsForm.appValuation}
                onChange={(e) => setBenefitsForm({ ...benefitsForm, appValuation: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Enrollment Milestone (Number of Students)
            </label>
            <Input
              type="number"
              value={benefitsForm.milestoneStudents}
              onChange={(e) => setBenefitsForm({ ...benefitsForm, milestoneStudents: Number(e.target.value) })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setEditBenefitsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSavingBenefits} leftIcon={<Save className="w-4 h-4" />}>
              Save Valuations
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: EDIT SCHOOL COMMERCIALS & BILLING */}
      <Modal
        isOpen={editSchoolModalOpen}
        onClose={() => setEditSchoolModalOpen(false)}
        title={`Commercial Agreement: ${selectedSchool?.name || ''}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSchoolCommercials} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Partnership Plan Title *
            </label>
            <Input
              value={schoolCommercialForm.planName}
              onChange={(e) => setSchoolCommercialForm({ ...schoolCommercialForm, planName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Institution Payment Status *
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              value={schoolCommercialForm.paymentStatus}
              onChange={(e) => setSchoolCommercialForm({ ...schoolCommercialForm, paymentStatus: e.target.value })}
            >
              <option value="PAID">PAID — Account in Good Standing</option>
              <option value="PARTIAL">PARTIAL — Partial Advance Received</option>
              <option value="PENDING">PENDING — Payment Awaited</option>
              <option value="OVERDUE">OVERDUE — Payment Overdue</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Total Billed Amount (₹)
              </label>
              <Input
                type="number"
                value={schoolCommercialForm.billedAmount}
                onChange={(e) => setSchoolCommercialForm({ ...schoolCommercialForm, billedAmount: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Paid Amount (₹)
              </label>
              <Input
                type="number"
                value={schoolCommercialForm.paidAmount}
                onChange={(e) => setSchoolCommercialForm({ ...schoolCommercialForm, paidAmount: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Negotiated Program Fees Section */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Agreed Program Fees (Negotiated Rate Overrides)
            </label>
            <div className="space-y-2.5">
              {schoolCommercialForm.agreedProgramFees?.map((item: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-navy-950">{item.programName}</p>
                    <p className="text-[11px] text-slate-500">
                      Level: {item.gradeLevel} · Standard Fee: ₹{item.standardFee}
                    </p>
                  </div>
                  <div className="w-36">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Agreed Fee (₹)</label>
                    <Input
                      type="number"
                      value={item.negotiatedFee}
                      onChange={(e) => handleUpdateSchoolFee(idx, Number(e.target.value))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setEditSchoolModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSavingSchool} leftIcon={<Save className="w-4 h-4" />}>
              Save Agreement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
