import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  Monitor,
  Award,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  Users,
  Layers,
  BookOpen,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { Program } from '../../types';
import { BookDemoModal } from '../../components/modals/BookDemoModal';

export const ProgramDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'learn' | 'curriculum' | 'faq'>('overview');
  const [openMonth, setOpenMonth] = useState<number | null>(1);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProgram() {
      try {
        const res = await api.get(`/programs/${slug}`);
        if (res.success && res.data) {
          setProgram(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadProgram();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Program Not Found</h2>
        <Link to="/programs" className="text-brand-600 font-semibold mt-4 inline-block">
          ← Back to Programs Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/programs" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-brand-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to All Programs
        </Link>

        {/* Program Hero (Matching Screen 3) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sm:p-10 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <Badge variant="primary" className="mb-3">
                {program.gradeLevel.replace('_', ' ')}
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display mb-2">
                {program.name}
              </h1>
              <p className="text-sm sm:text-base font-semibold text-brand-600 mb-4">{program.tagline}</p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-8">
                {program.description}
              </p>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-center">
                  <Clock className="w-5 h-5 text-brand-500 mx-auto mb-1" />
                  <p className="text-[11px] text-slate-400 font-medium">Duration</p>
                  <p className="text-xs font-bold text-slate-800">{program.durationMonths} Months</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-center">
                  <Calendar className="w-5 h-5 text-brand-500 mx-auto mb-1" />
                  <p className="text-[11px] text-slate-400 font-medium">Session</p>
                  <p className="text-xs font-bold text-slate-800">{program.sessionDurationMinutes} Minutes</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-center">
                  <Monitor className="w-5 h-5 text-brand-500 mx-auto mb-1" />
                  <p className="text-[11px] text-slate-400 font-medium">Mode</p>
                  <p className="text-xs font-bold text-slate-800">{program.mode}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-center">
                  <Award className="w-5 h-5 text-brand-500 mx-auto mb-1" />
                  <p className="text-[11px] text-slate-400 font-medium">Certificate</p>
                  <p className="text-xs font-bold text-slate-800">On Completion</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800"
                  alt={program.name}
                  className="w-full h-72 object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 mb-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 text-sm font-bold border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className={`pb-4 text-sm font-bold border-b-2 transition ${
                activeTab === 'learn'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              What You'll Learn
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`pb-4 text-sm font-bold border-b-2 transition ${
                activeTab === 'curriculum'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Curriculum Modules
            </button>
          </div>
        </div>

        {/* Tab Content 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft">
              <h3 className="text-xl font-bold text-navy-950 mb-3">Program Overview</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {program.description}
              </p>
              <h4 className="text-base font-bold text-navy-950 mb-2">Who Is It For?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Students of {program.gradeLevel.replace('CLASS_', 'Class ').replace('_', '–')} eager to
                build real digital skills and creative confidence.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft">
              <h3 className="text-xl font-bold text-navy-950 mb-4">Key Learning Outcomes</h3>
              <ul className="space-y-3">
                {program.learningOutcomes?.map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab Content 2: What You'll Learn */}
        {activeTab === 'learn' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {program.features?.map((feat, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 font-bold">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">{feat}</h4>
                  <p className="text-xs text-slate-500">Mastered through hands-on guided mentor workshops and practical student submissions.</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content 3: Curriculum Modules */}
        {activeTab === 'curriculum' && (
          <div className="space-y-4 max-w-4xl mb-16">
            {program.syllabus?.map((syl) => {
              const isOpen = openMonth === syl.month;
              return (
                <div key={syl.month} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
                  <button
                    type="button"
                    onClick={() => setOpenMonth(isOpen ? null : syl.month)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition"
                  >
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                        Month {syl.month}
                      </span>
                      <h4 className="text-lg font-bold text-navy-950 mt-0.5">{syl.title}</h4>
                      {syl.description && <p className="text-xs text-slate-500 mt-1">{syl.description}</p>}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-brand-500' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-6 pt-0 border-t border-slate-100 bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Topics Covered:</p>
                      <ul className="space-y-2">
                        {syl.topics.map((t, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Booking Banner (Screen 3) */}
        <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-12 text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold font-display mb-3">
            Ready to bring this program to your school?
          </h3>
          <p className="text-slate-300 max-w-lg mx-auto text-xs sm:text-sm mb-6">
            Book a free demo session and let your students experience the future skills.
          </p>
          <Button variant="primary" size="lg" onClick={() => setDemoModalOpen(true)}>
            Book Free Demo
          </Button>
        </div>
      </div>

      <BookDemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
};
