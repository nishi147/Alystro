import React from 'react';
import { Target, Eye, Sparkles, Award, Users, CheckCircle2, MapPin, Code2, Video, Briefcase, Lightbulb } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  const pillars = [
    { title: 'Practical Learning', desc: 'Not only theory — hands-on project creation in every class with real, usable outputs.' },
    { title: 'AI-First Education', desc: 'Teaching students to harness AI as an intellect multiplier, safely and responsibly.' },
    { title: 'Industry-Relevant Tools', desc: 'No toy software. Real timeline editors, design platforms, and prompt frameworks.' },
    { title: 'Live Mentors', desc: 'Warm, engaging experienced trainers who spark curiosity and answer doubts in real time.' },
    { title: 'Student-Friendly', desc: 'Step-by-step guidance designed specifically for young minds in Classes 6–12.' },
    { title: 'School-Friendly', desc: 'Turn-key online deployment with complete school partnership support.' },
  ];

  const whatStudentsGain = [
    { label: 'AI Knowledge', icon: <Sparkles className="w-5 h-5 text-brand-400" /> },
    { label: 'Video Editing', icon: <Video className="w-5 h-5 text-rose-400" /> },
    { label: 'Digital Confidence', icon: <Lightbulb className="w-5 h-5 text-amber-400" /> },
    { label: 'Freelancing Awareness', icon: <Briefcase className="w-5 h-5 text-emerald-500" /> },
    { label: 'Coding Skills', icon: <Code2 className="w-5 h-5 text-indigo-400" /> },
    { label: 'Critical Thinking', icon: <Target className="w-5 h-5 text-purple-400" /> },
    { label: 'Real Projects', icon: <Award className="w-5 h-5 text-orange-400" /> },
    { label: 'Certificate', icon: <CheckCircle2 className="w-5 h-5 text-teal-400" /> },
  ];

  const whyImportant = [
    'What technology can do and how to use it responsibly',
    'How AI works and its real-world applications',
    'How coding and digital creation work',
    'How skills can become real opportunities',
    'How freelancing and digital work function',
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sm:p-12 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="primary" className="mb-2">Our Story</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 font-display tracking-tight mb-2">
              About ALYSTRO
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              A technology and digital solutions company helping businesses, institutions and students move toward a smarter digital future — combining technology, education and practical skill development.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Photo */}
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
              <img
                src="/images/indian_classroom_workshop.jpg"
                alt="ALYSTRO Mentors and Indian Students in Computer Lab"
                className="w-full h-80 object-cover"
              />
            </div>

            {/* Right: Mission & Vision */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-950">Our Mission</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  To make future-ready skills accessible to every student and school across the nation through
                  hands-on, project-based education in Artificial Intelligence, Video Editing, Coding, and Freelancing — giving students real, usable skills alongside their regular education.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Eye className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-950">Our Vision</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <span className="font-semibold text-navy-800">"To help schools prepare students not only for exams, but also for the digital world of tomorrow."</span>
                  {' '}A generation of confident, creative, and technologically skilled learners who do not merely
                  consume digital content, but innovate, create, and solve meaningful real-world problems.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What Students Will Gain */}
        <div className="mb-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display">
              What Students Will Gain
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              A complete set of future-ready skills from one program.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {whatStudentsGain.map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft text-center hover:shadow-card hover:-translate-y-0.5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">
                  {item.icon}
                </div>
                <p className="text-sm font-bold text-slate-800">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why This Program Is Important for Schools */}
        <div className="bg-navy-950 rounded-3xl p-8 sm:p-12 mb-20">
          <div className="text-center mb-10">
            <Badge variant="navy" className="mb-2">For Schools</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Why This Program Is Important for Schools
            </h2>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl mx-auto">
              The world is changing quickly. Students are already using technology every day. ALYSTRO helps schools guide that usage — productively, safely and creatively.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {whyImportant.map((item) => (
              <div key={item} className="bg-navy-900/70 rounded-xl p-4 border border-navy-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-400 text-sm italic">
            Our aim is to give students useful, practical skills alongside their regular education — not instead of it.
          </p>
        </div>

        {/* Why ALYSTRO? 6 Pillars */}
        <div className="mb-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display">Why ALYSTRO?</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Our pedagogical foundation — what makes ALYSTRO different.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pil) => (
              <div
                key={pil.title}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">{pil.title}</h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{pil.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Parent & School Updates */}
        <div className="bg-brand-50 rounded-3xl border border-brand-100 p-8 sm:p-10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge variant="primary" className="mb-3">Parent & School Updates</Badge>
              <h2 className="text-2xl font-extrabold text-navy-950 font-display mb-3">
                Stay Informed Every Step of the Way
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Parents and school management can stay updated with student learning, progress and performance through regular reports. Every student earns an ALYSTRO Certificate of Completion.
              </p>
              <div className="space-y-2">
                {['Live class recordings for revision anytime', 'Weekly tests & practical assignments', 'Progress reports for parents & schools', 'Certificates for every student'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-brand-200 shadow-md">
              <img
                src="/images/indian_students_learning.jpg"
                alt="Indian school students collaborating during ALYSTRO sessions"
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Founder Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-8 sm:p-10 mb-16">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-extrabold text-navy-950 font-display">Leadership</h2>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-3xl font-extrabold mb-4 shadow-lg">
              YS
            </div>
            <h3 className="text-xl font-extrabold text-navy-950 mb-1">Yash Singhal</h3>
            <p className="text-sm font-semibold text-brand-600 mb-3">Founder & CEO — ALYSTRO</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4" />
              <span>Pratap Nagar, Sector 10, Jaipur, Rajasthan</span>
            </div>
          </div>
        </div>

        {/* Tagline & CTA */}
        <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center">
          <div className="text-4xl font-extrabold font-display text-brand-400 mb-2">ALYSTRO</div>
          <p className="text-lg font-bold text-slate-200 mb-1">LEARN • CREATE • GROW</p>
          <p className="text-slate-400 text-sm mb-6 max-w-md">
            "LET'S PREPARE TODAY'S STUDENTS FOR TOMORROW'S WORLD."
          </p>
          <Link to="/contact">
            <Button variant="primary" size="lg">
              Get in Touch With Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
