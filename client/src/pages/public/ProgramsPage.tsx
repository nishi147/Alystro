import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, Calendar, Award, ArrowRight, Sparkles, Code2, Video, Briefcase, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { Program } from '../../types';
import { BookDemoModal } from '../../components/modals/BookDemoModal';

const staticPrograms = [
  {
    grade: 'Classes 6–7',
    level: 'Foundation Level',
    icon: '🌱',
    color: 'bg-blue-50 border-blue-200',
    photo: '/images/indian_students_learning.jpg',
    tagline: 'Build curiosity, creativity and strong digital basics from an early age.',
    goal: 'Build curiosity, creativity and strong digital basics from an early age.',
    highlights: [
      'What is AI and how AI tools work',
      'Basic & safe use of AI tools',
      'Coding fundamentals through fun activities',
      'Basic video editing & creative content making',
      'Digital safety and responsible internet use',
      'Small practical projects & intro to freelancing',
    ],
  },
  {
    grade: 'Classes 8–10',
    level: 'Skill Development Level',
    icon: '⚡',
    color: 'bg-indigo-50 border-indigo-200',
    photo: '/images/indian_classroom_workshop.jpg',
    tagline: 'Help students turn technology into practical skills and creative opportunities.',
    goal: 'Help students turn technology into practical skills and creative opportunities.',
    highlights: [
      'AI tools and smart prompting techniques',
      'Practical coding and small projects',
      'Video editing and content creation',
      'Research & productivity using digital tools',
      'Freelancing basics & portfolio concepts',
      'Weekly practical assignments',
    ],
  },
  {
    grade: 'Classes 11–12',
    level: 'Advanced & Career Ready',
    icon: '🚀',
    color: 'bg-sky-50 border-sky-200',
    photo: '/images/indian_tech_trainer.jpg',
    tagline: 'Prepare students for higher studies, digital careers, freelancing and future opportunities.',
    goal: 'Prepare students for higher studies, digital careers, freelancing and future opportunities.',
    highlights: [
      'Advanced AI tools and productivity techniques',
      'Coding with real-world projects',
      'Professional video editing & content creation',
      'Portfolio building for digital careers',
      'Freelancing, client communication & project management',
      'Career-focused digital skills',
    ],
  },
];

const coreSubjects = [
  {
    title: 'Artificial Intelligence',
    desc: 'Real AI tools, smart prompting, and responsible use — skills the world is demanding now.',
    icon: <Sparkles className="w-5 h-5 text-brand-400" />,
    bg: 'bg-brand-50',
  },
  {
    title: 'Video Editing',
    desc: 'Creative content production skills that open doors in the modern digital economy.',
    icon: <Video className="w-5 h-5 text-rose-400" />,
    bg: 'bg-rose-50',
  },
  {
    title: 'Coding',
    desc: 'From fundamentals to real projects — students learn to think like builders, not just users.',
    icon: <Code2 className="w-5 h-5 text-emerald-500" />,
    bg: 'bg-emerald-50',
  },
  {
    title: 'Freelancing',
    desc: 'Portfolio building, client communication and real-world digital work awareness for every student.',
    icon: <Briefcase className="w-5 h-5 text-amber-500" />,
    bg: 'bg-amber-50',
  },
];

export const ProgramsPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [dynamicPrograms, setDynamicPrograms] = useState<Program[]>([]);
  const [isDynamicLoading, setIsDynamicLoading] = useState(true);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const res = await api.get('/programs');
        if (res.success && res.data) {
          setDynamicPrograms(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsDynamicLoading(false);
      }
    }
    loadPrograms();
  }, []);

  const filteredStaticPrograms = staticPrograms.filter((p) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'CLASS_6_7') return p.grade.includes('6–7');
    if (selectedFilter === 'CLASS_8_10') return p.grade.includes('8–10');
    if (selectedFilter === 'CLASS_11_12') return p.grade.includes('11–12');
    return true;
  });

  const comparisonFeatures = [
    { name: 'Artificial Intelligence', c67: true, c810: true, c1112: true },
    { name: 'Video Editing', c67: true, c810: true, c1112: true },
    { name: 'Coding', c67: true, c810: true, c1112: true },
    { name: 'Freelancing Awareness', c67: true, c810: true, c1112: true },
    { name: 'Smart Prompting Techniques', c67: false, c810: true, c1112: true },
    { name: 'Real-World Project Work', c67: false, c810: true, c1112: true },
    { name: 'Portfolio Building', c67: false, c810: false, c1112: true },
    { name: 'Professional Video Editing', c67: false, c810: false, c1112: true },
    { name: 'Client Communication & PM', c67: false, c810: false, c1112: true },
    { name: 'Career-Focused Digital Skills', c67: false, c810: false, c1112: true },
    { name: 'Certificate of Completion', c67: true, c810: true, c1112: true },
    { name: 'Duration', c67: '3 Months', c810: '3 Months', c1112: '3 Months' },
    { name: 'Session Length', c67: '45 Mins', c810: '45 Mins', c1112: '45 Mins' },
    { name: 'Schedule', c67: 'Mon–Fri', c810: 'Mon–Fri', c1112: 'Mon–Fri' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="primary" className="mb-2">Grade-Specific Curriculum</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 font-display tracking-tight mb-4">
            Our Programs
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mb-2">
            A complete 3-month practical learning journey with AI, Coding, Video Editing and Freelancing — structured by class level so every student gets exactly what they need.
          </p>
          <p className="text-xs text-slate-400">Classes 6 to 12 • Monday to Friday • 45 Minutes Daily • 100% Online via ALYSTRO App</p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {[
              { key: 'ALL', label: 'All Programs' },
              { key: 'CLASS_6_7', label: 'Classes 6–7' },
              { key: 'CLASS_8_10', label: 'Classes 8–10' },
              { key: 'CLASS_11_12', label: 'Classes 11–12' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedFilter === tab.key
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Core Subjects Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-4">Core Subjects — Taught Across All Levels</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {coreSubjects.map((sub) => (
              <div key={sub.title} className={`${sub.bg} rounded-xl p-4 flex items-center gap-3`}>
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm border border-white/80">
                  {sub.icon}
                </div>
                <span className="text-sm font-bold text-slate-800">{sub.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Programs Cards Grid (Swipeable on mobile, Grid on desktop) */}
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar mb-8 md:mb-24">
          {filteredStaticPrograms.map((prog) => (
            <div
              key={prog.grade}
              className={`w-[85vw] max-w-[330px] md:w-auto md:max-w-none shrink-0 snap-center bg-white rounded-2xl overflow-hidden border shadow-soft hover:shadow-card hover:-translate-y-1 transition-all flex flex-col justify-between ${prog.color}`}
            >
              <div>
                <div className="h-48 relative overflow-hidden">
                  <img src={prog.photo} alt={prog.grade} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-navy-950/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-lg">
                      {prog.grade}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 text-2xl">{prog.icon}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-extrabold text-navy-950 mb-1">{prog.level}</h3>
                  <p className="text-xs font-semibold text-brand-600 mb-4 italic">Goal: {prog.goal}</p>

                  <ul className="space-y-2 mb-5">
                    {prog.highlights.map((f) => (
                      <li key={f} className="text-xs text-slate-600 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
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

                {/* Program Delivery Info */}
                <div className="px-6 pb-4">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5 text-brand-700 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Hybrid Lab Delivery
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        Certificate Included
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Adaptive school curriculum with live project mentoring & weekly evaluations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Button variant="primary" className="w-full" onClick={() => setDemoModalOpen(true)}>
                  Book Free Demo
                </Button>
              </div>
            </div>
          ))}
        </div>
        {/* Mobile Swipe Hint */}
        <div className="flex md:hidden items-center justify-center gap-1.5 -mt-4 mb-10 text-[11px] text-slate-400 font-medium">
          <span>← Swipe to explore 3 class levels →</span>
        </div>

        {/* Compare Programs Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sm:p-10 mb-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display">Compare Programs</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Find the perfect curriculum for your school's grade levels.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="py-4 px-6 font-bold text-slate-900 rounded-l-xl">Features</th>
                  <th className="py-4 px-6 font-bold text-slate-900 text-center">Classes 6–7<br /><span className="text-xs font-normal text-slate-400">Foundation</span></th>
                  <th className="py-4 px-6 font-bold text-slate-900 text-center">Classes 8–10<br /><span className="text-xs font-normal text-slate-400">Skill Development</span></th>
                  <th className="py-4 px-6 font-bold text-slate-900 text-center rounded-r-xl">Classes 11–12<br /><span className="text-xs font-normal text-slate-400">Advanced & Career Ready</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40">
                    <td className="py-4 px-6 font-medium text-slate-700">{row.name}</td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.c67 === 'boolean' ? (
                        row.c67 ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300 font-bold">—</span>
                      ) : (
                        <span className="font-semibold text-slate-700">{row.c67}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.c810 === 'boolean' ? (
                        row.c810 ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300 font-bold">—</span>
                      ) : (
                        <span className="font-semibold text-slate-700">{row.c810}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.c1112 === 'boolean' ? (
                        row.c1112 ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300 font-bold">—</span>
                      ) : (
                        <span className="font-semibold text-slate-700">{row.c1112}</span>
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
            We adapt modules to match your school's computer lab timing and existing syllabus requirements. Every student gets exactly what they need.
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
