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
  Globe,
  Smartphone,
  TrendingUp,
  Gift,
  Star,
  Zap,
  Target,
  BarChart3,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BookDemoModal } from '../../components/modals/BookDemoModal';

export const ForSchoolsPage: React.FC = () => {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const partnershipBenefits = [
    { title: 'Structured Curriculum', desc: 'Pre-planned 3-month lesson plans, assignments, and rubrics tailored to school calendars.' },
    { title: 'Live Mentors', desc: 'Expert educators conduct interactive workshops, handling all technical training.' },
    { title: 'Practical Activities', desc: '80% hands-on learning with tangible student outputs in every single session.' },
    { title: 'Student Projects', desc: 'Every student builds an authentic digital portfolio to showcase to parents and peers.' },
    { title: 'Verifiable Certificates', desc: 'Official ALYSTRO digital credentials for every student who completes the program.' },
    { title: 'Dedicated Coordination', desc: 'A personal academic manager liaises with your computer faculty and administration.' },
  ];

  const whyPartner = [
    'Practical, engaging learning — AI + Coding + Editing + Freelancing',
    'Live expert-led classes with recordings & weekly tests',
    'Certificates for every student & parent visibility',
    'Comprehensive School Technology Package & Infrastructure Support',
    'Long-term digital partnership — not just a course',
  ];

  const steps = [
    { number: '01', title: 'School Connect', desc: 'Quick 15-minute introductory call with your leadership team.' },
    { number: '02', title: 'Free Demo', desc: '3-day interactive workshop conducted with your students and teachers.' },
    { number: '03', title: 'Program Setup', desc: 'Schedule batches, map timetable, and provision school portal access.' },
    { number: '04', title: 'Training Starts', desc: 'Live sessions begin in your school computer lab or smart rooms.' },
  ];

  const partnershipPrograms = [
    {
      level: 'Classes 6–7',
      name: 'Foundation Level',
      desc: 'AI basics, creative video making, digital safety, and curiosity building in young learners.',
      session: '45 Min Sessions • Flexible Lab Timetable',
      features: ['Introduction to AI & Prompting', 'Basic Video Editing', 'Safe Internet Habits', 'Mini Creative Projects'],
    },
    {
      level: 'Classes 8–10',
      name: 'Skill Development Level',
      desc: 'Practical coding, content creation, research productivity, and digital portfolio foundations.',
      session: '45 Min Sessions • Weekly Hands-on Lab',
      features: ['Generative AI Workflows', 'Multi-Track Video Editing', 'Coding Fundamentals', 'Freelance & Career Concepts'],
    },
    {
      level: 'Classes 11–12',
      name: 'Advanced & Career Ready',
      desc: 'Applied AI, commercial media production, tech entrepreneurship, and career-focused portfolios.',
      session: '45 Min Sessions • Capstone Project Lab',
      features: ['Applied AI Architecture', 'Professional Media Production', 'College Ready Portfolio', 'Industry Mentor Review'],
    },
  ];

  const additionalSupport = [
    'Projector & Classroom Technology Support',
    'School onboarding & staff orientation',
    'Student & teacher access management',
    'Progress reporting & digital promotion guidance',
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
      a: 'Parents receive project links, milestone completion alerts, and digital certificates via our school portal. Regular progress reports are shared with parents and school management.',
    },
    {
      q: 'Can our school get a customized timetable?',
      a: 'Yes, batches are scheduled around your zero-period, SUPW/hobby clubs, or regular computer period slots. Sessions run Monday to Friday, 45 minutes daily.',
    },
    {
      q: 'What if the school does not reach the 300-student enrollment milestone?',
      a: 'No problem at all. The school still receives institutional revenue sharing on eligible enrollments, plus continued technical support, student enrollment guidance, promotion support, and full partnership assistance.',
    },
    {
      q: 'What is the value of technology benefits under the partnership?',
      a: 'Upon achieving the 300-student enrollment milestone, ALYSTRO provides a free Professional School Website and a free School Mobile App — complete digital technology benefits provided under school partnership terms at no additional cost.',
    },
  ];

  const handleDownloadBrochure = () => {
    alert('ALYSTRO School Partnership Curriculum Brochure (2026-27 Edition) has started downloading.');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sm:p-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <Badge variant="primary" className="mb-3">Institutional Partnership</Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 font-display tracking-tight mb-4">
                Bring Future Skills Into Your School
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
                Partner with ALYSTRO to give your students practical AI, Coding, Video Editing and Freelancing skills for a brighter future. Transform your computer lab with zero infrastructure overhead.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 italic">
                "WE GROW TOGETHER — Your students learn future skills. Your school gets technology support. Your institution gains a powerful new digital opportunity."
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
                  src="/images/indian_school_campus.jpg"
                  alt="Modern Indian school campus partnering with ALYSTRO"
                  className="w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Why Partner With ALYSTRO? */}
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
            {partnershipBenefits.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display">How It Works</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">A frictionless 4-step onboarding journey designed around school administrators.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st) => (
              <div key={st.number} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft text-left relative overflow-hidden">
                <span className="text-4xl font-extrabold text-brand-100 font-display block mb-2">{st.number}</span>
                <h4 className="text-base font-bold text-navy-950 mb-1.5">{st.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* School Partnership Curriculum & Delivery Structure */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sm:p-10 mb-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <Badge variant="primary" className="mb-2">Curriculum & Delivery Structure</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display">
              Partnership Program Framework
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Curriculum segmented into 3 progressive tiers tailored to your school's computer lab schedule.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partnershipPrograms.map((prog) => (
              <div key={prog.level} className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200">
                      {prog.level}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">{prog.session}</span>
                  </div>
                  <h3 className="text-base font-bold text-navy-950 mb-2">{prog.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{prog.desc}</p>
                  <ul className="space-y-2 mb-6">
                    {prog.features.map((feat) => (
                      <li key={feat} className="text-xs text-slate-700 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setDemoModalOpen(true)}>
                  Request Syllabus & Demo
                </Button>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Commercial terms and partnership proposals are mutually customized during the institutional onboarding stage.
            </p>
          </div>
        </div>

        {/* 300-Student Partnership Milestone */}
        <div className="bg-navy-950 rounded-3xl overflow-hidden border border-navy-850 shadow-2xl mb-16">
          <div className="p-8 sm:p-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full px-4 py-1.5 mb-4">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Partnership Milestone</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-3">
                300-Student Partnership Milestone
              </h2>
              <p className="text-slate-300 text-sm max-w-2xl mx-auto">
                Complete the agreed enrollment milestone and unlock <span className="text-amber-300 font-bold">full school technology infrastructure benefits</span> — provided at no additional cost under partnership terms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Website Benefit */}
              <div className="bg-navy-900/70 rounded-2xl p-6 border border-navy-800 hover:border-brand-500/40 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">INCLUDED</span>
                    <h3 className="text-base font-bold text-white">Professional School Website</h3>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-3 leading-relaxed">
                  Modern professional website with admissions, gallery, announcements & online systems.
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-navy-700">
                  <span className="text-xs text-slate-500">Partnership Inclusion</span>
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Included for School</span>
                </div>
              </div>

              {/* App Benefit */}
              <div className="bg-navy-900/70 rounded-2xl p-6 border border-navy-800 hover:border-brand-500/40 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">INCLUDED</span>
                    <h3 className="text-base font-bold text-white">School Mobile App</h3>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-3 leading-relaxed">
                  Student, teacher & parent access. Attendance, progress tracking, school dashboard & reporting.
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-navy-700">
                  <span className="text-xs text-slate-500">Partnership Inclusion</span>
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Included for School</span>
                </div>
              </div>
            </div>

            {/* Combined Value Banner */}
            <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/30 rounded-2xl p-6 text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">Integrated Technology Package</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-display">School Website + Mobile App + LMS</p>
              <p className="text-sm text-slate-300 mt-1">Provided at no additional cost under approved partnership milestone terms</p>
            </div>

            {/* Additional Support */}
            <div className="mb-8">
              <h3 className="text-base font-bold text-white mb-4 text-center">Additional Support From ALYSTRO</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {additionalSupport.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Button variant="primary" size="lg" onClick={() => setDemoModalOpen(true)} className="px-10">
                Partner With ALYSTRO Today
              </Button>
            </div>
          </div>
        </div>

        {/* School Partnership Growth & Institutional Commercials */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sm:p-10 mb-16">
          <div className="text-center mb-8 max-w-xl mx-auto">
            <Badge variant="primary" className="mb-2">Institutional Commercials</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display">
              Mutual Growth & Partnership Value
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              Transparent institutional commercials structured to modernize school education with zero capital investment.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-950 mb-2">Institutional Revenue Share</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Schools receive attractive institutional margins on enrolled students, agreed mutually during the formal proposal and onboarding stage.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-950 mb-2">Zero Infrastructure Burden</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All ALYSTRO software and AI platforms run on standard web browsers. No expensive server hardware or GPU computers required.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-950 mb-2">Dedicated Academic Support</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Includes co-hosting credentials for your computer faculty, classroom orientation, parent progress portals, and student certifications.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              * Official partner fees, applicable GST, student enrollment terms, and technology packages are detailed in your private institution agreement.
            </p>
            <Button variant="primary" size="sm" onClick={() => setDemoModalOpen(true)}>
              Request Commercial Proposal
            </Button>
          </div>
        </div>

        {/* Why Partner Summary */}
        <div className="bg-brand-500 rounded-3xl p-8 sm:p-12 mb-16 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display mb-6">Why Partner With ALYSTRO?</h2>
          <div className="flex flex-col gap-3 max-w-xl mx-auto mb-8">
            {whyPartner.map((item) => (
              <div key={item} className="flex items-center gap-3 text-left">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                <span className="text-sm text-brand-50">{item}</span>
              </div>
            ))}
          </div>
          <Button
            variant="dark"
            size="lg"
            onClick={() => setDemoModalOpen(true)}
            className="bg-navy-950 hover:bg-navy-900 px-10"
          >
            Book a Free School Demo
          </Button>
        </div>

        {/* Free 3-Day Demo Banner */}
        <div className="bg-navy-950 rounded-3xl overflow-hidden border border-navy-850 shadow-2xl mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 h-64 lg:h-80 overflow-hidden">
              <img
                src="/images/indian_classroom_workshop.jpg"
                alt="Indian teacher conducting live ALYSTRO workshop"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-6 p-8 sm:p-12 text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Zero Risk Experience</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-display mt-1 mb-3">
                🎁 Free 3-Day Demo Session
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Let your students and teachers experience our live program with no commitment. See their enthusiasm and creative output firsthand. All interested students are invited at absolutely no cost.
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
