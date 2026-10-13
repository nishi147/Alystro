import React, { useState } from 'react';
import {
  Building2,
  CalendarCheck,
  Award,
  Users,
  CheckCircle2,
  Download,
  ArrowRight,
  BookOpen,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BookDemoModal } from '../../components/modals/BookDemoModal';

export const ForSchoolsPage: React.FC = () => {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const reasons = [
    { title: 'Structured Curriculum', desc: 'Pre-planned 3-month lesson plans, assignments, and rubrics tailored to school calendars.' },
    { title: 'Live Mentors', desc: 'Expert educators conduct interactive workshops, handling all technical training.' },
    { title: 'Practical Activities', desc: '80% hands-on learning with tangible student outputs in every single session.' },
    { title: 'Student Projects', desc: 'Every student builds an authentic digital portfolio to showcase to parents and peers.' },
    { title: 'Verifiable Certificates', desc: 'Official ALYSTRO digital credentials equipped with real-time QR verification.' },
    { title: 'Dedicated Coordination', desc: 'A personal academic manager liaises with your computer faculty and administration.' },
  ];

  const steps = [
    { number: '01', title: 'School Connect', desc: 'Quick 15-minute introductory call with your leadership team.' },
    { number: '02', title: 'Free Demo', desc: '3-day interactive workshop conducted with your students and teachers.' },
    { number: '03', title: 'Program Setup', desc: 'Schedule batches, map timetable, and provision school portal access.' },
    { number: '04', title: 'Training Starts', desc: 'Live sessions begin in your school computer lab or smart rooms.' },
  ];

  const faqs = [
    {
      q: 'Does the school need to invest in new computers or expensive software?',
      a: 'No. All ALYSTRO tools are cloud-based and run smoothly on your existing school computers and modern web browsers. No costly GPU workstations are necessary.',
    },
    {
      q: 'How does ALYSTRO coordinate with our existing computer teachers?',
      a: 'We work alongside your faculty! Your computer teachers receive free observer credentials, teaching materials, and co-host live sessions.',
    },
    {
      q: 'How are parents informed about student progress?',
      a: 'Parents receive project links, milestone completion alerts, and digital certificates via our school portal.',
    },
    {
      q: 'Can our school get a customized timetable?',
      a: 'Yes, batches are scheduled around your zero-period, SUPW/hobby clubs, or regular computer period slots.',
    },
  ];

  const handleDownloadBrochure = () => {
    // Direct brochure download trigger
    alert('ALYSTRO School Partnership Curriculum Brochure (2026-27 Edition) has started downloading.');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section (Matching Screen 4) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sm:p-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <Badge variant="primary" className="mb-3">
                Institutional Partnership
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 font-display tracking-tight mb-4">
                Bring Future Skills Into Your School
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                Partner with ALYSTRO to give your students practical AI, digital and creative skills for a
                brighter future. Transform your computer lab with zero infrastructure overhead.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setDemoModalOpen(true)}
                  className="px-8 shadow-lg shadow-brand-500/25"
                >
                  Book a School Demo
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDownloadBrochure}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download Brochure
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-elevated">
                <img
                  src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=900"
                  alt="Modern school campus"
                  className="w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Why Partner with ALYSTRO? */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display">
              Why Partner With ALYSTRO?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Trusted by 25+ schools across the nation for turnkey EdTech excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works (4 Steps) */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              A frictionless 4-step onboarding journey designed around school administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st) => (
              <div
                key={st.number}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft text-left relative overflow-hidden"
              >
                <span className="text-4xl font-extrabold text-brand-100 font-display block mb-2">
                  {st.number}
                </span>
                <h4 className="text-base font-bold text-navy-950 mb-1.5">{st.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Free 3-Day Demo Session Banner (Matching Screen 4) */}
        <div className="bg-navy-950 rounded-3xl overflow-hidden border border-navy-850 shadow-2xl mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 h-64 lg:h-80 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800"
                alt="Teacher with students"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-6 p-8 sm:p-12 text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Zero Risk Experience
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-display mt-1 mb-3">
                Free 3-Day Demo Session
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Let your students and teachers experience our live program with no commitment. See their
                enthusiasm and creative output firsthand.
              </p>
              <Button variant="primary" size="lg" onClick={() => setDemoModalOpen(true)}>
                Book a Demo
              </Button>
            </div>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-extrabold text-navy-950 font-display">Frequently Asked Questions</h3>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between hover:bg-slate-50"
                  >
                    <span className="text-sm">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-brand-500' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BookDemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
};
