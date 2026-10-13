import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  Search,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';

export const CertificateVerificationPage: React.FC = () => {
  const { certificateId: routeId } = useParams<{ certificateId?: string }>();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');

  const [certInput, setCertInput] = useState(routeId || queryId || 'ALY-2026-948123');
  const [certificateData, setCertificateData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const fetchVerification = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setIsLoading(true);
    setErrorStatus(null);
    setCertificateData(null);

    try {
      const res = await api.get(`/certificates/verify/${idToVerify.trim().toUpperCase()}`);
      if (res.success && res.data) {
        setCertificateData(res.data);
      } else {
        setErrorStatus('Certificate credential record not found.');
      }
    } catch (err: any) {
      setErrorStatus(err.message || 'No official ALYSTRO certificate found with this ID.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (routeId || queryId) {
      fetchVerification(routeId || queryId || '');
    }
  }, [routeId, queryId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVerification(certInput);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar & Header (Hidden when printing) */}
        <div className="print:hidden text-center mb-10">
          <Badge variant="primary" className="mb-2">Digital Verification Engine</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display">
            Verify Certificate Credential
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Instantly authenticate official credentials issued to students of the ALYSTRO Future Skills programs.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-6 max-w-lg mx-auto flex gap-2">
            <Input
              placeholder="e.g. ALY-2026-948123"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              className="text-center font-mono font-bold uppercase tracking-wider"
            />
            <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Search className="w-4 h-4" />}>
              Verify
            </Button>
          </form>
        </div>

        {/* Verification Status Feedback */}
        {errorStatus && (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-center mb-8">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-rose-900">Verification Failed</h3>
            <p className="text-xs text-rose-600 mt-1">{errorStatus}</p>
          </div>
        )}

        {/* Certificate Display Card */}
        {certificateData && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className="print:hidden p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    Official Authenticated Credential
                  </h4>
                  <p className="text-xs text-emerald-700">
                    This certificate is cryptographically valid and recorded in the ALYSTRO registry.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                leftIcon={<Printer className="w-4 h-4" />}
                className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50"
              >
                Print Certificate
              </Button>
            </div>

            {/* Certificate Paper Sheet (High-Resolution Graphic Layout) */}
            <div className="bg-white rounded-3xl border-8 border-slate-900/5 shadow-2xl p-8 sm:p-14 relative overflow-hidden text-center print:border-none print:shadow-none print:p-8">
              {/* Decorative Corner Ornaments */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-brand-500/10 to-transparent pointer-events-none rounded-br-full" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-brand-cyan/10 to-transparent pointer-events-none rounded-tl-full" />

              {/* Certificate Inner Border */}
              <div className="border-2 border-slate-200 rounded-2xl p-6 sm:p-10 relative">
                {/* Header Crest */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-navy-950 text-white flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-brand-400" />
                  </div>
                  <span className="text-2xl font-black text-navy-950 tracking-wider font-display">
                    ALYSTRO
                  </span>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6">
                  Certificate of Achievement & Excellence
                </p>

                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                  This is proudly presented to
                </p>

                {/* Student Name */}
                <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display mb-3 py-1 text-gradient">
                  {certificateData.studentName}
                </h2>

                <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed mb-6">
                  for successfully completing the 3-month intensive hands-on curriculum and practical capstone project in
                </p>

                {/* Program Name */}
                <div className="inline-block bg-brand-50/80 border border-brand-200/80 rounded-xl px-6 py-2.5 mb-6">
                  <span className="text-base sm:text-lg font-bold text-brand-700">
                    {certificateData.programName}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-8">
                  conducted in institutional partnership with{' '}
                  <span className="font-bold text-slate-900">{certificateData.schoolName}</span>.
                </p>

                {/* Bottom Signature & QR Verification Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end pt-8 border-t border-slate-200/80 text-left">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Credential ID</p>
                    <p className="font-mono text-xs font-bold text-navy-950">{certificateData.certificateId}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Issue Date: {new Date(certificateData.issueDate).toLocaleDateString()}
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="text-center">
                    {certificateData.verificationQrCode && (
                      <div className="inline-block p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <img
                          src={certificateData.verificationQrCode}
                          alt="QR Verification"
                          className="w-20 h-20 object-contain mx-auto"
                        />
                      </div>
                    )}
                    <span className="block text-[9px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                      Scan to Verify
                    </span>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Grade Awarded</p>
                    <p className="text-xs font-bold text-emerald-600">{certificateData.grade}</p>
                    <div className="mt-2 pt-2 border-t border-slate-200 inline-block sm:float-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Academic Director</span>
                      <span className="text-xs font-serif italic text-slate-700">A. K. Singhania</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
