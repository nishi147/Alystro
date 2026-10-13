import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, Calendar, Award, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { api } from '../../services/api';
import { Program } from '../../types';
import { BookDemoModal } from '../../components/modals/BookDemoModal';

export const ProgramsPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const res = await api.get('/programs');
        if (res.success && res.data) {
          setPrograms(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadPrograms();
  }, []);

  const filteredPrograms = programs.filter((p) => {
    if (selectedFilter === 'ALL') return true;
    return p.gradeLevel === selectedFilter;
  });

  const comparisonFeatures = [
    { name: 'AI & Smart Tools', c6: true, c9: true, c11: true },
    { name: 'Video Editing Basics', c6: true, c9: true, c11: true },
    { name: 'Content Creation & Storyboards', c6: false, c9: true, c11: true },
    { name: 'Future Automation Skills', c6: false, c9: true, c11: true },
    { name: 'Applied LLMs & Multi-Modal AI', c6: false, c9: false, c11: true },
    { name: 'Career Guidance & Portfolios', c6: false, c9: false, c11: true },
    { name: 'Verifiable Certificate', c6: true, c9: true, c11: true },
    { name: 'Duration', c6: '3 Months', c9: '3 Months', c11: '3 Months' },
    { name: 'Session Length', c6: '45 Mins', c9: '45 Mins', c11: '45 Mins' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="primary" className="mb-2">
            Grade-Specific Curriculum
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 font-display tracking-tight mb-4">
            Our Programs
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Designed for Every Learning Stage. From fundamental AI discovery to career-ready digital portfolios.
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedFilter === 'ALL'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Programs
            </button>
            <button
              onClick={() => setSelectedFilter('CLASS_6_8')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedFilter === 'CLASS_6_8'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Class 6–8
            </button>
            <button
              onClick={() => setSelectedFilter('CLASS_9_10')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedFilter === 'CLASS_9_10'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Class 9–10
            </button>
            <button
              onClick={() => setSelectedFilter('CLASS_11_12')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedFilter === 'CLASS_11_12'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Class 11–12
            </button>
          </div>
        </div>

        {/* Programs Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {filteredPrograms.map((prog) => {
            const gradeLabel =
              prog.gradeLevel === 'CLASS_6_8'
                ? 'Class 6–8'
                : prog.gradeLevel === 'CLASS_9_10'
                ? 'Class 9–10'
                : 'Class 11–12';

            const photo =
              prog.gradeLevel === 'CLASS_6_8'
                ? 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600'
                : prog.gradeLevel === 'CLASS_9_10'
                ? 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600'
                : 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600';

            return (
              <div
                key={prog._id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 relative overflow-hidden">
                    <img src={photo} alt={prog.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-navy-950/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-lg">
                        {gradeLabel}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-extrabold text-navy-950 mb-1">{prog.name}</h3>
                    <p className="text-xs font-semibold text-brand-600 mb-4">{prog.tagline}</p>

                    <ul className="space-y-2 mb-6">
                      {prog.features?.slice(0, 4).map((f, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-brand-500" /> 3 Months
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-500" /> 45 Min Sessions
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link to={`/programs/${prog.slug}`}>
                    <Button variant="primary" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Compare Programs Table (Matching Screen 2 of Reference Mockup) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sm:p-10 mb-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display">
              Compare Programs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Find the perfect curriculum for your school's grade levels.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="py-4 px-6 font-bold text-slate-900 rounded-l-xl">Features</th>
                  <th className="py-4 px-6 font-bold text-slate-900 text-center">Class 6–8</th>
                  <th className="py-4 px-6 font-bold text-slate-900 text-center">Class 9–10</th>
                  <th className="py-4 px-6 font-bold text-slate-900 text-center rounded-r-xl">Class 11–12</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40">
                    <td className="py-4 px-6 font-medium text-slate-700">{row.name}</td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.c6 === 'boolean' ? (
                        row.c6 ? (
                          <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )
                      ) : (
                        <span className="font-semibold text-slate-700">{row.c6}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.c9 === 'boolean' ? (
                        row.c9 ? (
                          <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )
                      ) : (
                        <span className="font-semibold text-slate-700">{row.c9}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.c11 === 'boolean' ? (
                        row.c11 ? (
                          <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )
                      ) : (
                        <span className="font-semibold text-slate-700">{row.c11}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold font-display mb-3">
            Want to Customize a Program for Your School?
          </h3>
          <p className="text-slate-300 max-w-xl text-sm mb-6">
            We adapt modules to match your school’s computer lab timing and existing syllabus requirements.
          </p>
          <Button variant="primary" size="lg" onClick={() => setDemoModalOpen(true)}>
            Book a Free School Demo
          </Button>
        </div>
      </div>

      <BookDemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
};
