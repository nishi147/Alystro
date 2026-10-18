import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail, Award, ShieldCheck, Heart } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-850 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-navy-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-white font-display">ALYSTRO</span>
            </Link>
            <p className="text-xs font-semibold text-brand-400 tracking-wider uppercase">
              AI • CODING • VIDEO EDITING • FREELANCING
            </p>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              "Helping Students Learn Today, Create Tomorrow & Grow with Confidence." A practical 3-month Future Skills Program designed for students of Classes 6 to 12.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5 bg-navy-900 px-3 py-1.5 rounded-lg border border-navy-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Live Online via App
              </span>
              <span className="flex items-center gap-1.5 bg-navy-900 px-3 py-1.5 rounded-lg border border-navy-800">
                <Award className="w-4 h-4 text-brand-400" /> Verifiable Certificate
              </span>
            </div>
          </div>

          {/* Programs Column */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Our Programs</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/programs" className="hover:text-white transition">
                  Classes 6–7 | Foundation Level
                </Link>
              </li>
              <li>
                <Link to="/programs" className="hover:text-white transition">
                  Classes 8–10 | Skill Development
                </Link>
              </li>
              <li>
                <Link to="/programs" className="hover:text-white transition">
                  Classes 11–12 | Advanced & Career
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-brand-400 hover:text-brand-300 font-medium">
                  Compare All Programs →
                </Link>
              </li>
            </ul>
          </div>

          {/* For Schools & Resources */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">School Partnership</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/for-schools" className="hover:text-white transition">
                  300-Student Milestone
                </Link>
              </li>
              <li>
                <Link to="/for-schools" className="hover:text-white transition">
                  School Tech Package
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-white transition">
                  Student Project Showcase
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-white transition">
                  Certificate Verification
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About ALYSTRO & Vision
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Contact ALYSTRO</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="text-xs text-brand-300 font-semibold">
                Founder & CEO: Yash Singhal
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <span>Pratap Nagar, Sector 10, Jaipur, Rajasthan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white transition">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="mailto:Alystro64@gmail.com" className="hover:text-white transition">
                  Alystro64@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            <p className="font-semibold text-slate-400">"LET'S PREPARE TODAY'S STUDENTS FOR TOMORROW'S WORLD."</p>
            <p className="text-slate-500 mt-0.5">© {new Date().getFullYear()} ALYSTRO — LEARN • CREATE • GROW. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-slate-400 transition">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-slate-400 transition">Privacy Policy</Link>
            <Link to="/login" className="hover:text-slate-400 transition">Portal Access</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
