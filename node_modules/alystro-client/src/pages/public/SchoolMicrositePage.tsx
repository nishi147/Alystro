import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Clock,
  Monitor,
  CheckCircle2,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  Layers,
  Award,
  Send,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import { School, Batch } from '../../types';

export const SchoolMicrositePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [activeStudents, setActiveStudents] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'gallery' | 'work' | 'inquiry'>('overview');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  useEffect(() => {
    async function loadSchool() {
      try {
        const res = await api.get(`/schools/public/${slug}`);
        if (res.success && res.data) {
          setSchool(res.data.school);
          setBatches(res.data.batches || []);
          setActiveStudents(res.data.activeStudents || 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSchool();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-slate-50 py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-800">School Page Not Found</h2>
        <Link to="/" className="text-brand-600 font-semibold mt-4 inline-block">
          ← Back to ALYSTRO Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* School Header Banner (Matching Screen 5) */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft mb-10">
          <div className="relative h-48 sm:h-64 bg-navy-950 overflow-hidden">
            <img
              src={school.coverImage || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1200'}
              alt={school.name}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                  {school.logo ? (
                    <img src={school.logo} alt="School Logo" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Building2 className="w-10 h-10 text-brand-600" />
                  )}
                </div>
                <div className="text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-300">
                      Partner School
                    </span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                      Active Campus
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
                    {school.name} <span className="text-brand-300 font-normal">× ALYSTRO</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{school.tagline || 'Future Skills Program for Students'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="primary" size="sm" className="bg-brand-500 hover:bg-brand-400">
                    School Portal Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Program Highlights Ribbon (Screen 5) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 p-4 sm:p-6 bg-slate-50/70 text-center text-xs">
            <div className="p-2">
              <span className="text-slate-400 block font-medium">Classes Served</span>
              <span className="font-bold text-slate-800 text-sm">{school.classesServed?.join(', ') || 'Class 6–10'}</span>
            </div>
            <div className="p-2">
              <span className="text-slate-400 block font-medium">Standard Duration</span>
              <span className="font-bold text-slate-800 text-sm">3 Months</span>
            </div>
            <div className="p-2">
              <span className="text-slate-400 block font-medium">Session Length</span>
              <span className="font-bold text-slate-800 text-sm">45 Minutes</span>
            </div>
            <div className="p-2">
              <span className="text-slate-400 block font-medium">Delivery Mode</span>
              <span className="font-bold text-slate-800 text-sm">Hybrid / In-Lab</span>
            </div>
            <div className="p-2">
              <span className="text-slate-400 block font-medium">Active Batches</span>
              <span className="font-bold text-brand-600 text-sm">{batches.length} Batches</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 mb-8 flex space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'overview' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`pb-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'curriculum' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500'
            }`}
          >
            Enrolled Programs
          </button>
          <button
            onClick={() => setActiveTab('inquiry')}
            className={`pb-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'inquiry' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500'
            }`}
          >
            Parent Inquiry Form
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft">
                <h3 className="text-xl font-bold text-navy-950 mb-3">About the Program at {school.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {school.description ||
                    `A specially designed AI & Digital Skills program for ${school.name} students to help them build practical AI, digital and creative skills through live hands-on projects.`}
                </p>
                <div className="flex gap-4">
                  <Link to="/programs">
                    <Button variant="primary" size="sm">
                      View Full Curriculum
                    </Button>
                  </Link>
                  <Link to="/projects">
                    <Button variant="outline" size="sm">
                      View Student Projects
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Active Batches */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft">
                <h3 className="text-lg font-bold text-navy-950 mb-4">Active Program Batches</h3>
                {batches.length === 0 ? (
                  <p className="text-xs text-slate-400">Batches currently being scheduled.</p>
                ) : (
                  <div className="space-y-3">
                    {batches.map((b) => (
                      <div key={b._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{b.name}</h4>
                          <p className="text-xs text-slate-500">
                            {b.grade} • Section {b.section}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200/60">
                          Live Active
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft">
                <h3 className="text-base font-bold text-navy-950 mb-4">School Details</h3>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                    <span>
                      {school.address.street ? `${school.address.street}, ` : ''}
                      {school.address.city}, {school.address.state}
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                    <span>{school.contactPerson?.phone || '+91 98290 11223'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-brand-500 shrink-0" />
                    <span>{school.contactPerson?.email || 'admin@school.edu'}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-navy-950 text-white rounded-2xl p-6 border border-navy-850">
                <Sparkles className="w-6 h-6 text-brand-400 mb-2" />
                <h4 className="text-base font-bold mb-1">Are you a Student or Parent?</h4>
                <p className="text-xs text-slate-300 mb-4">
                  Log in to access your course materials, session links, marks, and verifiable certificate.
                </p>
                <Link to="/login">
                  <Button variant="primary" size="sm" className="w-full">
                    Go to Portal Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Curriculum */}
        {activeTab === 'curriculum' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {school.programsEnrolled?.map((prog) => (
              <div key={prog._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft">
                <Badge variant="primary" className="mb-2">Enrolled Program</Badge>
                <h4 className="text-lg font-bold text-navy-950 mb-1">{prog.name}</h4>
                <p className="text-xs text-slate-500 mb-4">{prog.description}</p>
                <Link to={`/programs/${prog.slug}`}>
                  <Button variant="outline" size="sm">
                    View Complete Syllabus
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Parent Inquiry Form */}
        {activeTab === 'inquiry' && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-soft mb-16">
            <h3 className="text-xl font-bold text-navy-950 mb-2">Inquire About Future Skills at {school.name}</h3>
            <p className="text-xs text-slate-500 mb-6">Parents and students may submit questions directly to the coordinator.</p>
            {inquirySubmitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold text-center">
                ✓ Thank you! Your inquiry has been forwarded to the school coordinator.
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setInquirySubmitted(true); }} className="space-y-4">
                <Input label="Student Name" required placeholder="Aarav Sharma" />
                <Input label="Class & Section" required placeholder="Class 8-A" />
                <Input label="Parent Contact Number" required placeholder="+91 98290 88776" />
                <Button type="submit" variant="primary" className="w-full">
                  Submit Inquiry
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
