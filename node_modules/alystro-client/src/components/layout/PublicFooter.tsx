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
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering students of Classes 6–12 with future-ready skills in Artificial Intelligence,
              Video Editing, Creative Content, and Digital Technologies in partnership with leading schools.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5 bg-navy-900 px-3 py-1.5 rounded-lg border border-navy-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> ISO Compliant Pedagogy
              </span>
              <span className="flex items-center gap-1.5 bg-navy-900 px-3 py-1.5 rounded-lg border border-navy-800">
                <Award className="w-4 h-4 text-brand-400" /> Verifiable Certs
              </span>
            </div>
          </div>

          {/* Programs Column */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Programs</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/programs#class-6-8" className="hover:text-white transition">
                  Class 6–8: Foundation Program
                </Link>
              </li>
              <li>
                <Link to="/programs#class-9-10" className="hover:text-white transition">
                  Class 9–10: Skill Builder Program
                </Link>
              </li>
              <li>
                <Link to="/programs#class-11-12" className="hover:text-white transition">
                  Class 11–12: Future Ready Program
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
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/for-schools" className="hover:text-white transition">
                  For Schools & Principals
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
                  About Our Pedagogy
                </Link>
              </li>
              <li>
                <Link to="/schools/abc-international" className="hover:text-white transition">
                  Demo Partner Microsite
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Contact ALYSTRO</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <span>ALYSTRO SOFTWARE, Jaipur, Rajasthan, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white transition">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="mailto:info@alystro.com" className="hover:text-white transition">
                  info@alystro.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ALYSTRO Technologies Pvt Ltd. All rights reserved.</p>
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
