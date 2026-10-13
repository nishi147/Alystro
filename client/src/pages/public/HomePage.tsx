import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Play,
  ArrowRight,
  Video,
  Code2,
  Palette,
  Lightbulb,
  CheckCircle2,
  Users,
  Award,
  Building2,
  CalendarCheck,
  ChevronRight,
  Star,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { BookDemoModal } from '../../components/modals/BookDemoModal';

export const HomePage: React.FC = () => {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const stats = [
    { number: '5,000+', label: 'Students Trained' },
    { number: '25+', label: 'Schools Connected' },
    { number: '150+', label: 'Workshops Conducted' },
    { number: '1,200+', label: 'Projects Created' },
  ];

  const whatWeTeach = [
    {
      title: 'AI & Smart Tools',
      desc: 'Learn & create with modern AI tools responsibly and productively.',
      icon: <Sparkles className="w-6 h-6 text-brand-400" />,
      color: 'from-blue-500/10 to-brand-500/10 border-blue-200/40',
    },
    {
      title: 'Video Editing',
      desc: 'Turn ideas into amazing videos with timeline editing, audio & reels.',
      icon: <Video className="w-6 h-6 text-rose-400" />,
      color: 'from-rose-500/10 to-orange-500/10 border-rose-200/40',
    },
    {
      title: 'Digital Skills',
      desc: 'Essential skills for the digital world: research, infographics & safety.',
      icon: <Palette className="w-6 h-6 text-emerald-400" />,
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200/40',
    },
    {
      title: 'Future Skills',
      desc: 'Creativity, logic building, critical problem-solving & presentation.',
      icon: <Lightbulb className="w-6 h-6 text-amber-400" />,
      color: 'from-amber-500/10 to-yellow-500/10 border-amber-200/40',
    },
  ];

  const programs = [
    {
      grade: 'Class 6–8',
      title: 'Foundation Program',
      tagline: 'Fun and practical introduction to AI, editing and digital skills.',
      icon: '🌱',
      link: '/programs#class-6-8',
      slug: 'foundation-program-class-6-8',
      color: 'border-blue-200 hover:border-brand-400',
    },
    {
      grade: 'Class 9–10',
      title: 'Skill Builder Program',
      tagline: 'Build real skills with projects, creative media, and future tech.',
      icon: '⚡',
      link: '/programs#class-9-10',
      slug: 'skill-builder-program-class-9-10',
      color: 'border-indigo-200 hover:border-indigo-400',
    },
    {
      grade: 'Class 11–12',
      title: 'Future Ready Program',
      tagline: 'Advanced tools and career-oriented creative technology skills.',
      icon: '🚀',
      link: '/programs#class-11-12',
      slug: 'future-ready-program-class-11-12',
      color: 'border-sky-200 hover:border-sky-400',
    },
  ];

  const whySchoolsChoose = [
    { name: 'Practical Learning', desc: 'No boring lectures; 80% hands-on project creation in every class.' },
    { name: 'Live Mentors', desc: 'Industry experts interact live with students, answering queries instantly.' },
    { name: 'Custom Curriculum', desc: 'Mapped seamlessly to your school schedule and academic calendar.' },
    { name: 'Verifiable Certificates', desc: 'Cryptographically registered certificates with instant QR verification.' },
    { name: 'School Friendly', desc: 'Operates in your existing computer labs with zero infrastructure burden.' },
    { name: 'High Student Engagement', desc: 'Fun challenges, student hackathons, and creative digital portfolios.' },
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
      title: 'Poster Design',
      grade: 'Class 6',
      category: 'Digital Design',
      img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'AI Story Video',
      grade: 'Class 9',
      category: 'Storytelling',
      img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
    },
  ];

  const faqs = [
    {
      q: 'Which classes is the ALYSTRO program designed for?',
      a: 'Our programs are specially tailored for three groups: Class 6–8 (Foundation), Class 9–10 (Skill Builder), and Class 11–12 (Future Ready).',
    },
    {
      q: 'How long is the program and what are the session timings?',
      a: 'Standard programs run for 3 months with 45-minute sessions. The timetable is scheduled flexibly around your school hours.',
    },
    {
      q: 'Is it delivered online or offline?',
      a: 'We offer flexible hybrid delivery: live interactive mentors conduct sessions on your smart screens or lab computers, supported by your school staff.',
    },
    {
      q: 'Will students receive certificates?',
      a: 'Yes, students who complete their projects receive official ALYSTRO certificates with verifiable digital IDs and QR codes.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. Hero Section (Matching Screen 1 of Reference Mockup) */}
      <section className="relative bg-navy-gradient text-white pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden border-b border-navy-800">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Feature Pill Tags */}
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-semibold text-brand-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sessions
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-semibold text-brand-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                  Practical Projects
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-semibold text-brand-200">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Certificates
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-display">
                Empowering Students With{' '}
                <span className="text-gradient">Future-Ready Skills</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                AI, Video Editing, Digital Skills & Creative Technology Programs for Classes 6–12.
                Partner with ALYSTRO to transform your school’s computer lab into an innovation hub.
              </p>

              {/* Dual Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setDemoModalOpen(true)}
                  className="w-full sm:w-auto px-8 shadow-xl shadow-brand-500/30"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Book Free Demo
                </Button>
                <Link to="/for-schools" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-7 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
                  >
                    Partner With Your School
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Video / Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-navy-900 group">
                <img
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=900"
                  alt="Indian students collaborating in computer lab"
                  className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

                {/* Floating Play Button */}
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(true)}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-brand-500/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm group-hover:scale-110 hover:bg-brand-400 transition-all focus:outline-none ring-4 ring-white/30"
                  aria-label="Play Overview Video"
                >
                  <Play className="w-7 h-7 fill-white ml-1" />
                </button>

                <div className="absolute bottom-5 left-5 right-5 text-left">
                  <span className="text-[11px] uppercase tracking-widest text-brand-300 font-bold">
                    Classroom Workshop in Action
                  </span>
                  <p className="text-sm font-semibold text-white">
                    Watch how students build real AI stories and video reels
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Statistics Banner */}
      <section className="bg-white border-b border-slate-200 py-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {stats.map((stat) => (
              <div key={stat.label} className="pt-4 sm:pt-0">
                <p className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display">
                  {stat.number}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. What We Teach (4 Cards Grid) */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="primary" className="mb-3">
            Core Curriculum
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display tracking-tight mb-4">
            What We Teach
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base mb-14">
            A comprehensive, grade-appropriate curriculum blending creative media and intelligent digital tools.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {whatWeTeach.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 group-hover:bg-brand-50 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Our Programs (3 Programs Cards) */}
      <section className="py-20 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="primary" className="mb-3">
            Tailored For Every Stage
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display tracking-tight mb-4">
            Our Programs
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base mb-14">
            Structured 3-month courses with 45-minute live interactive sessions for classes 6 to 12.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {programs.map((prog) => (
              <div
                key={prog.title}
                className={`rounded-2xl border bg-slate-50/50 p-8 shadow-soft hover:shadow-card hover:bg-white transition-all flex flex-col justify-between ${prog.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200/60">
                      {prog.grade}
                    </span>
                    <span className="text-2xl">{prog.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{prog.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                    {prog.tagline}
                  </p>
                </div>
                <Link
                  to={prog.link}
                  className="inline-flex items-center text-sm font-bold text-brand-600 hover:text-brand-700 group mt-4"
                >
                  Learn More <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Schools Choose ALYSTRO */}
      <section className="py-20 bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="navy" className="mb-3">
            Institutional Excellence
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight mb-4">
            Why Schools Choose ALYSTRO
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base mb-14">
            Designed specifically for school computer labs with turn-key support for principals and teachers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {whySchoolsChoose.map((feat) => (
              <div
                key={feat.name}
                className="bg-navy-900/70 rounded-2xl p-6 border border-navy-800 hover:border-brand-500/50 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">{feat.name}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Our Student Work (Showcase Gallery Preview) */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <Badge variant="primary" className="mb-2">
                Project Gallery
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display">
                Our Student Work
              </h2>
              <p className="text-sm text-slate-500 mt-1">Real projects created by real students during our live sessions.</p>
            </div>
            <Link to="/projects" className="mt-4 sm:mt-0">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All Projects
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentWorks.map((work) => (
              <div
                key={work.title}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-soft group hover:shadow-card transition-all"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={work.img}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-navy-950/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {work.grade}
                  </span>
                </div>
                <div className="p-4">
                  <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
                    {work.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{work.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQs Accordion */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="primary" className="mb-2">
              Have Questions?
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 font-display">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-slate-900 bg-slate-50/50 hover:bg-slate-100/60 flex items-center justify-between transition-colors"
                  >
                    <span className="text-sm sm:text-base">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-brand-500' : ''}`}
                    />
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

      {/* 8. Demo Booking Call-To-Action Banner */}
      <section className="bg-brand-500 text-white py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display mb-4">
            Ready to Bring Future Skills to Your School?
          </h2>
          <p className="text-brand-100 max-w-xl mx-auto text-sm sm:text-base mb-8">
            Schedule a free 3-day demo session and let your teachers and students experience the difference.
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
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent text-white border-white/40 hover:bg-white/10"
              >
                Contact Our Academic Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Booking Modal */}
      <BookDemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
};
