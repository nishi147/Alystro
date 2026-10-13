import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, LogIn, ChevronDown, Award, School, BookOpen, Layers } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface PublicNavbarProps {
  onOpenDemoModal?: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ onOpenDemoModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Programs', path: '/programs' },
    { name: 'For Schools', path: '/for-schools' },
    { name: 'Student Work', path: '/projects' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return '/admin';
      case 'SCHOOL_ADMIN':
        return '/school';
      case 'TEACHER':
        return '/teacher';
      case 'STUDENT':
        return '/student';
      default:
        return '/';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-navy-950/90 backdrop-blur-md border-b border-navy-850/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight text-white font-display">
                ALYSTRO
              </span>
              <span className="text-[10px] uppercase tracking-widest text-brand-300 font-semibold -mt-1">
                Future-Ready Skills
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-brand-300 bg-white/5 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              to="/verify"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 inline-flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-brand-400" />
              Verify Cert
            </Link>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to={getDashboardPath()}>
                  <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                    Dashboard ({user?.role})
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logout()} className="text-slate-300 hover:text-white">
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-200 hover:text-white hover:bg-white/10 font-semibold"
                    leftIcon={<LogIn className="w-4 h-4" />}
                  >
                    Portal Login
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onOpenDemoModal ? onOpenDemoModal : () => (window.location.href = '/contact')}
                  className="bg-brand-500 hover:bg-brand-400 font-semibold shadow-lg shadow-brand-500/30"
                >
                  Book Free Demo
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-950 border-b border-navy-800 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-white/5"
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/verify"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-white/5"
          >
            <Award className="w-4 h-4 text-brand-400" />
            Verify Certificate
          </Link>

          <div className="pt-4 border-t border-navy-800 space-y-2.5">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Go to Dashboard ({user?.role})
                  </Button>
                </Link>
                <Button variant="outline" className="w-full text-white border-white/20" onClick={() => logout()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10">
                    Portal Login
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenDemoModal) onOpenDemoModal();
                    else window.location.href = '/contact';
                  }}
                >
                  Book Free Demo
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
