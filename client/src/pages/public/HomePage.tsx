import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Video,
  Code2,
  CheckCircle2,
  Award,
  ChevronDown,
  Gift,
  Clock,
  Calendar,
  Monitor,
  Briefcase,
  Users,
  Layers,
  TrendingUp,
  School,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { BookDemoModal } from '../../components/modals/BookDemoModal';

// ── Hero classroom photo — replace this path to swap the image easily ──────────
const HERO_CLASSROOM_IMAGE = '/images/indian_classroom_workshop.jpg';

export const HomePage: React.FC = () => {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const stats = [
    { number: '5,000+', label: 'Students Trained' },
    { number: '25+', label: 'Schools Connected' },
    { number: '150+', label: 'Workshops Conducted' },
    { number: '1,200+', label: 'Projects Created' },
  ];

  const whatWeTeach = [
    {
      title: 'Artificial Intelligence',
      desc: 'Real AI tools, smart prompting, and responsible use — skills the world is demanding now.',
      icon: <Sparkles className="w-6 h-6 text-brand-400" />,
    },
    {
      title: 'Video Editing',
      desc: 'Creative content production skills that open doors in the modern digital economy.',
      icon: <Video className="w-6 h-6 text-rose-400" />,
    },
    {
      title: 'Coding',
      desc: 'From fundamentals to real projects — students learn to think like builders, not just users.',
      icon: <Code2 className="w-6 h-6 text-emerald-400" />,
    },
    {
      title: 'Freelancing',
      desc: 'Portfolio building, client communication and real-world digital work awareness for every student.',
      icon: <Briefcase className="w-6 h-6 text-amber-400" />,
    },
  ];

  const programs = [
    {
      grade: 'Classes 6–7',
      title: 'Foundation Level',
      tagline: 'Build curiosity, creativity and strong digital basics from an early age.',
      icon: '🌱',
      highlights: [
        'What is AI and how AI tools work',
        'Basic & safe use of AI tools',
        'Coding fundamentals through fun activities',
        'Basic video editing & creative content making',
        'Digital safety and responsible internet use',
        'Small practical projects & intro to freelancing',
      ],
      link: '/programs',
      color: 'border-blue-200 hover:border-brand-400',
    },
    {
      grade: 'Classes 8–10',
      title: 'Skill Development Level',
      tagline: 'Help students turn technology into practical skills and creative opportunities.',
      icon: '⚡',
      highlights: [
        'AI tools and smart prompting techniques',
        'Practical coding and small projects',
        'Video editing and content creation',
        'Research & productivity using digital tools',
        'Freelancing basics & portfolio concepts',
        'Weekly practical assignments',
      ],
      link: '/programs',
      color: 'border-indigo-200 hover:border-indigo-400',
    },
    {
      grade: 'Classes 11–12',
      title: 'Advanced & Career Ready',
      tagline: 'Prepare students for higher studies, digital careers, freelancing and future opportunities.',
      icon: '🚀',
      highlights: [
        'Advanced AI tools and productivity techniques',
        'Coding with real-world projects',
        'Professional video editing & content creation',
        'Portfolio building for digital careers',
        'Freelancing, client communication & project management',
        'Career-focused digital skills',
      ],
      link: '/programs',
      color: 'border-sky-200 hover:border-sky-400',
    },
  ];

  const programStructure = [
    { icon: <Clock className="w-5 h-5 text-brand-500" />, label: 'Duration', value: '3 Months' },
    { icon: <Calendar className="w-5 h-5 text-brand-500" />, label: 'Classes', value: 'Monday to Friday' },
    { icon: <Monitor className="w-5 h-5 text-brand-500" />, label: 'Session', value: '45 Minutes Daily' },
    { icon: <Sparkles className="w-5 h-5 text-brand-500" />, label: 'Mode', value: '100% Online via ALYSTRO App' },
  ];

  const whyAlystro = [
    { name: 'Practical Learning', desc: 'Not only theory — hands-on project creation in every class.' },
    { name: 'Live Interactive Classes', desc: 'Live sessions with experienced & supportive trainers who engage students directly.' },
    { name: 'Class Recordings', desc: 'Every class is recorded and available for revision anytime during the program.' },
    { name: 'Weekly Tests & Assignments', desc: 'Regular assessments and practical assignments where students learn by doing.' },
    { name: 'Real-World Projects', desc: 'Freelancing guidance and actual project experience for every student.' },
    { name: 'Certificates & Reports', desc: 'Certificates for every student plus regular progress reports for parents & schools.' },
  ];

  const studentWorks = [
    {
      title: 'AI Art Project',
      grade: 'Class 7',
      category: 'AI Tools',
      img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Video Editing Project',
      grade: 'Class 8',
      category: 'Video Editing',
      img: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Coding Project',
      grade: 'Class 10',
      category: 'Coding',
      img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Freelancing Portfolio',
      grade: 'Class 11',
      category: 'Freelancing',
      img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
    },
  ];

  const faqs = [
    {
      q: 'Which classes is the ALYSTRO program designed for?',
      a: 'Our programs are specially tailored for three groups: Classes 6–7 (Foundation Level), Classes 8–10 (Skill Development Level), and Classes 11–12 (Advanced & Career Ready).',
    },
    {
      q: 'How long is the program and what are the session timings?',
      a: 'Standard programs run for 3 months with 45-minute sessions, Monday to Friday. Weekends (Saturday & Sunday) are off. The timetable is scheduled flexibly around your school hours.',
    },
    {
      q: 'Is it delivered online or offline?',
      a: '100% Online via the ALYSTRO App with live interactive classes, instant doubt support, and class recordings available for revision anytime.',
    },
    {
      q: 'Will students receive certificates?',
      a: 'Yes! Every student receives an official ALYSTRO Certificate of Completion. Parents and school management also receive regular progress reports.',
    },
    {
      q: 'What subjects does ALYSTRO teach?',
      a: 'ALYSTRO covers four core subjects: Artificial Intelligence (real AI tools and smart prompting), Video Editing (creative content production), Coding (from fundamentals to real projects), and Freelancing (portfolio building and digital work).',
    },
    {
      q: 'Is there a free demo available?',
      a: 'Yes! ALYSTRO offers a 3-Day FREE Demo Program. All interested students are invited to attend the complete 3-day free demo at absolutely no cost, to experience the ALYSTRO learning system before enrollment.',
    },
  ];

  // Hero feature highlights
  const heroFeatures = [
    { icon: <Users className="w-6 h-6 text-white" />, label: 'Live Classes' },
    { icon: <Layers className="w-6 h-6 text-white" />, label: 'Hands-on Projects' },
    { icon: <Award className="w-6 h-6 text-white" />, label: 'Recognized Certificates' },
    { icon: <TrendingUp className="w-6 h-6 text-white" />, label: 'Future-Ready Career Skills' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ═══════════════════════════════════════════════════════════
          1. HERO SECTION — Premium dark navy EdTech redesign
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-hero-dark text-white overflow-hidden" style={{ minHeight: '100svh' }}>
        {/* Background radial glows */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Centre-left subtle glow */}
          <div className="absolute top-0 left-0 w-[55%] h-full bg-[radial-gradient(ellipse_at_30%_40%,rgba(22,139,255,0.10),transparent_65%)]" />
          {/* Right-side blue glow near classroom image */}
          <div className="absolute top-0 right-0 w-[60%] h-full bg-[radial-gradient(ellipse_at_75%_45%,rgba(69,182,255,0.14),transparent_60%)]" />
        </div>

        {/* Main hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-0 lg:pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center">

            {/* ── LEFT COLUMN ── */}
            <div className="space-y-6 text-center lg:text-left lg:pr-8">

              {/* Badge pill */}
              <div className="anim-fade-up inline-flex justify-center lg:justify-start">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/40 bg-brand-500/10 text-sm font-semibold text-brand-200 backdrop-blur-sm">
                  🎓 Future-Ready Skills for Classes 6–12
                </span>
              </div>

              {/* Main headline */}
              <div className="anim-fade-up-d1">
                <h1 className="font-extrabold font-display tracking-tight leading-[1.08]">
                  <span className="block text-4xl sm:text-5xl lg:text-6xl text-white">
                    Learn • Create • Build
                  </span>
                  <span className="block text-4xl sm:text-5xl lg:text-6xl text-hero-gradient mt-1">
                    Real Digital Skills
                  </span>
                </h1>
                {/* Blue underline accent */}
                <div className="mt-4 flex justify-center lg:justify-start">
                  <div className="h-1 w-20 rounded-full bg-gradient-to-r from-brand-500 to-brand-accent opacity-80" />
                </div>
              </div>

              {/* Skills bar */}
              <p className="anim-fade-up-d2 text-base sm:text-lg font-semibold text-slate-200 tracking-wide">
                Coding&nbsp;
                <span className="text-brand-400 mx-1">|</span>
                &nbsp;Video Editing&nbsp;
                <span className="text-brand-400 mx-1">|</span>
                &nbsp;Digital Creativity&nbsp;
                <span className="text-brand-400 mx-1">|</span>
                &nbsp;Freelancing
              </p>

              {/* Description */}
              <p className="anim-fade-up-d3 text-sm sm:text-base text-slate-300 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                A practical 3-month skills program that helps students explore technology, build real projects and grow with confidence.
              </p>

              {/* CTA Buttons */}
              <div className="anim-fade-up-d4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={() => setDemoModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-sm sm:text-base shadow-lg shadow-brand-500/40 hover:shadow-brand-400/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  Book Free 3-Day Demo
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                {/* Secondary CTA */}
                <Link to="/for-schools" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl border border-white/25 bg-white/8 hover:bg-white/14 hover:border-white/40 text-white font-bold text-sm sm:text-base backdrop-blur-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  >
                    <School className="w-4 h-4 shrink-0" />
                    Partner With Your School
                  </button>
                </Link>
              </div>
            </div>

            {/* ── RIGHT COLUMN – Classroom photograph ── */}
            <div className="anim-fade-right relative flex items-center justify-center lg:justify-end">
              {/* Soft blue shadow blob behind image */}
              <div
                className="absolute inset-0 rounded-[2.5rem] blur-3xl opacity-30 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, #168BFF 0%, #45B6FF 50%, transparent 80%)' }}
                aria-hidden="true"
              />
              {/* Image container */}
              <div className="relative w-full max-w-[560px] rounded-[2rem] overflow-hidden border-2 border-white/15 shadow-2xl shadow-brand-900/60 group">
                <img
                  src={HERO_CLASSROOM_IMAGE}
                  alt="Indian school students collaborating on laptops during an ALYSTRO live class"
                  className="w-full h-72 sm:h-[400px] lg:h-[460px] object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  loading="eager"
                  decoding="async"
                />
                {/* Subtle bottom fade to blend into navy background */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#06152F]/80 to-transparent pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

        {/* ── FEATURE HIGHLIGHTS BAR ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 lg:mt-14 pb-10">
          <div className="anim-fade-in-d5 grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
            {heroFeatures.map((feat, idx) => (
              <div
                key={feat.label}
                className={`flex flex-col items-center gap-3 py-7 px-5 bg-white/5 hover:bg-white/10 transition-colors ${
                  idx < heroFeatures.length - 1 ? 'lg:border-r lg:border-white/10' : ''
                } ${idx < 2 ? 'border-b border-white/10 lg:border-b-0' : ''}`}
              >
                <div className="w-11 h-11 rounded-xl bg-brand-500/25 border border-brand-400/20 flex items-center justify-center shrink-0">
                  {feat.icon}
                </div>
                <span className="text-xs sm:text-sm font-bold text-white text-center leading-snug">
                  {feat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom wave SVG */}
        <div className="hero-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" height="56">
            <path d="M0,32 C240,56 480,8 720,32 C960,56 1200,8 1440,32 L1440,56 L0,56 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* 2. Platform Statistics Banner */}
      <section className="bg-white border-b border-slate-200 py-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {stats.map((stat) => (
              <div key={stat.label} className="pt-4 sm:pt-0">
                <p className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display">{stat.number}</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 3-Day FREE Demo Banner */}
      <section className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),_transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-3">
                <Gift className="w-4 h-4 text-white" />
                <span className="text-xs font-bold uppercase tracking-wider">Zero Cost Experience</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display mb-2">
                🎁 3-Day FREE Demo Program
              </h2>
              <p className="text-emerald-50 text-sm max-w-2xl">
                Experience the ALYSTRO learning system before enrollment — at absolutely no cost. All interested students are invited to attend the complete 3-day free demo.
              </p>
            </div>
            <div className="shrink-0">
              <Button
                variant="white"
                size="lg"
                onClick={() => setDemoModalOpen(true)}
                className="text-emerald-800 hover:text-emerald-900 font-extrabold px-8 shadow-xl hover:scale-105 transition-all"
              >
                Register for Free Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. What We Teach */}
      <section className="py-12 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="primary" className="mb-2 sm:mb-3">Core Curriculum</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy-950 font-display tracking-tight mb-2 sm:mb-4">
            What We Teach
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-xs sm:text-base mb-6 sm:mb-14">
            A comprehensive, grade-appropriate curriculum blending AI, Coding, Video Editing and Freelancing — real skills the world is demanding now.
          </p>

          {/* Swipeable slider on mobile, Grid on desktop */}
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-3 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar text-left">
            {whatWeTeach.map((item) => (
              <div
                key={item.title}
                className="w-[72vw] max-w-[270px] sm:w-auto sm:max-w-none shrink-0 snap-center bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-brand-50 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 sm:mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Mobile swipe indicator */}
          <div className="flex sm:hidden items-center justify-center gap-1.5 mt-2.5 text-[11px] text-slate-400 font-medium">
            <span>← Swipe to explore 4 subjects →</span>
          </div>
        </div>
      </section>

      {/* 5. Program Structure */}
      <section className="py-10 sm:py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-10">
            <Badge variant="primary" className="mb-2">Program Structure</Badge>
            <h2 className="text-xl sm:text-3xl font-extrabold text-navy-950 font-display">How the Program Runs</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {programStructure.map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  {item.icon}
                </div>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">{item.label}</p>
                <p className="text-xs sm:text-sm font-bold text-navy-950">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] sm:text-xs text-slate-400 mt-3 sm:mt-4">Saturday & Sunday Off — Balanced learning alongside regular education</p>
        </div>
        
      </section>

      {/* 6. Our Programs */}  
      <section className="py-12 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="primary" className="mb-2 sm:mb-3">For Classes 6 to 12</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy-950 font-display tracking-tight mb-2 sm:mb-4">
            Our Programs
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-xs sm:text-base mb-6 sm:mb-14">
            A complete 3-month practical learning journey structured by class level so every student gets exactly what they need.
          </p>

          {/* Swipeable slider on mobile, Grid on desktop */}
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-3 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar text-left">
            {programs.map((prog) => (
              <div
                key={prog.title}
                className={`w-[85vw] max-w-[320px] md:w-auto md:max-w-none shrink-0 snap-center rounded-2xl border bg-white p-5 sm:p-8 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all flex flex-col justify-between ${prog.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-brand-200/60">
                      {prog.grade}
                    </span>
                    <span className="text-2xl">{prog.icon}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">{prog.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4 leading-relaxed italic line-clamp-2 md:line-clamp-none">
                    Goal: {prog.tagline}
                  </p>
                  <ul className="space-y-1 sm:space-y-1.5 mb-5 sm:mb-6">
                    {prog.highlights.slice(0, 5).map((h) => (
                      <li key={h} className="text-xs text-slate-600 flex items-start gap-1.5 sm:gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1 sm:line-clamp-none">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to={prog.link} className="inline-flex items-center text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 group mt-2 pt-3 border-t border-slate-100">
                  Explore Full Curriculum <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
          {/* Mobile swipe indicator */}
          <div className="flex md:hidden items-center justify-center gap-1.5 mt-2.5 text-[11px] text-slate-400 font-medium">
            <span>← Swipe to explore 3 class levels →</span>
          </div>
        </div>
      </section>

      {/* 7. Why ALYSTRO */}
      <section className="py-12 sm:py-20 bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="navy" className="mb-2 sm:mb-3">Why ALYSTRO?</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight mb-2 sm:mb-4">
            ALYSTRO is Not Just Another Course
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-xs sm:text-base mb-6 sm:mb-14">
            It is a complete digital skills journey built for Indian schools, giving students real, usable skills alongside their regular education.
          </p>

          {/* Swipeable slider on mobile, Grid on desktop */}
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-3 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar text-left">
            {whyAlystro.map((feat) => (
              <div
                key={feat.name}
                className="w-[74vw] max-w-[260px] sm:w-auto sm:max-w-none shrink-0 snap-center bg-navy-900/70 rounded-2xl p-5 sm:p-6 border border-navy-800 hover:border-brand-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold mb-3 sm:mb-4">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mb-1">{feat.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Mobile swipe indicator */}
          <div className="flex sm:hidden items-center justify-center gap-1.5 mt-2.5 text-[11px] text-slate-400 font-medium">
            <span>← Swipe to view all 6 pillars →</span>
          </div>
        </div>
      </section>

      {/* 8. Vision Quote */}
      <section className="py-12 sm:py-16 bg-brand-50 border-y border-brand-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-3xl sm:text-5xl text-brand-200 font-serif mb-2 sm:mb-4">"</div>
          <blockquote className="text-lg sm:text-2xl font-bold text-navy-950 font-display leading-snug mb-4 sm:mb-6">
            To help schools prepare students not only for exams,<br className="hidden sm:inline" />
            {" "}but also for the digital world of tomorrow.
          </blockquote>
          <p className="text-xs sm:text-sm font-semibold text-brand-600 uppercase tracking-wider">— Our Vision</p>
        </div>
      </section>

      {/* 9. Student Work Gallery */}
      <section className="py-12 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6 sm:mb-12">
            <div>
              <Badge variant="primary" className="mb-1.5 sm:mb-2">Project Gallery</Badge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-navy-950 font-display">Our Student Work</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Real projects created by real students during our live sessions.</p>
            </div>
            <Link to="/projects" className="shrink-0 ml-3">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All
              </Button>
            </Link>
          </div>

          {/* Swipeable slider on mobile, Grid on desktop */}
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-3 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            {studentWorks.map((work) => (
              <div
                key={work.title}
                className="w-[70vw] max-w-[250px] sm:w-auto sm:max-w-none shrink-0 snap-center bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-soft group hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 sm:h-44 overflow-hidden">
                    <img src={work.img} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute top-2.5 left-2.5 bg-navy-950/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {work.grade}
                    </span>
                  </div>
                  <div className="p-3.5 sm:p-4">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-brand-600 uppercase tracking-wider">{work.category}</span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">{work.title}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Mobile swipe indicator */}
          <div className="flex sm:hidden items-center justify-center gap-1.5 mt-2.5 text-[11px] text-slate-400 font-medium">
            <span>← Swipe to see student projects →</span>
          </div>
        </div>
      </section>

      {/* 10. FAQs */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="primary" className="mb-2">Have Questions?</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={faq.q} className="rounded-2xl border border-slate-200 overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-slate-900 bg-slate-50/50 hover:bg-slate-100/60 flex items-center justify-between transition-colors"
                  >
                    <span className="text-sm sm:text-base">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-brand-500' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 text-sm text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. CTA Banner */}
      <section className="bg-brand-500 text-white py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display mb-4">
            Ready to Bring Future Skills to Your School?
          </h2>
          <p className="text-brand-100 max-w-xl mx-auto text-sm sm:text-base mb-8">
            Schedule a free 3-day demo session and let your teachers and students experience the difference. No cost, no commitment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="dark"
              size="lg"
              onClick={() => setDemoModalOpen(true)}
              className="bg-navy-950 hover:bg-navy-900 px-8 py-3.5 shadow-xl"
            >
              Book a Free Demo Today
            </Button>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="bg-transparent text-white border-white/40 hover:bg-white/10">
                Contact Our Academic Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <BookDemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
};
