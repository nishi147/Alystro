import React from 'react';
import { Target, Eye, Sparkles, Award, ShieldCheck, Heart, Users, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  const pillars = [
    { title: 'Practical Learning', desc: 'Real tools, real creative outputs, zero passive rote memorization.' },
    { title: 'AI-First Education', desc: 'Teaching students to harness AI as an intellect multiplier safely and responsibly.' },
    { title: 'Industry-Relevant Tools', desc: 'No toy software. Real timeline editors, design platforms, and prompt frameworks.' },
    { title: 'Live Mentors', desc: 'Warm, engaging certified instructors who spark curiosity and answer doubts in real time.' },
    { title: 'Student-Friendly', desc: 'Step-by-step guidance designed specifically for young minds in Classes 6–12.' },
    { title: 'School-Friendly', desc: 'Turn-key lab deployment with complete institutional dashboard integration.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section (Matching Screen 7) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sm:p-12 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="primary" className="mb-2">Our Story</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 font-display tracking-tight mb-2">
              About ALYSTRO
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              Building a Smarter, More Creative Generation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Photo */}
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800"
                alt="ALYSTRO Mentors and Students"
                className="w-full h-80 object-cover"
              />
            </div>

            {/* Right: Mission & Vision (Screen 7) */}
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
                  hands-on, project-based education in Artificial Intelligence, digital storytelling, and creative technology.
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
                  A generation of confident, creative, and technologically skilled learners who do not merely
                  consume digital content, but innovate, create, and solve meaningful real-world problems.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why ALYSTRO? 6 Pillars (Screen 7) */}
        <div className="mb-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-display">
              Why ALYSTRO?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Our pedagogical foundation.</p>
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

        {/* Ready to collaborate? */}
        <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold font-display mb-3">
            Join Our Mission
          </h3>
          <p className="text-slate-300 max-w-lg text-xs sm:text-sm mb-6">
            Partner with ALYSTRO to bring cutting-edge future skill workshops directly into your school campus.
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
