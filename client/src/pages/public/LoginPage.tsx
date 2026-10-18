import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, LogIn, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await login(email, password);
      navigate(result.dashboardPath);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black text-navy-950 font-display">ALYSTRO</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-navy-950 font-display">
          Portal Sign In
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Access your school management, teaching or student learning workspace.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-soft">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="you@school.edu"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-slate-600">
                <input type="checkbox" defaultChecked className="rounded text-brand-600 mr-2" />
                Remember session
              </label>
              <Link to="/forgot-password" className="text-brand-600 hover:text-brand-700 font-semibold">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3 font-bold mt-2" isLoading={isLoading}>
              Sign In to ALYSTRO
            </Button>

            {/* Create Account / Sign Up Link */}
            <div className="pt-3 text-center">
              <span className="text-xs text-slate-500">Don't have an ALYSTRO account yet? </span>
              <Link
                to="/register"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Create Account / Sign Up
              </Link>
            </div>
          </form>

        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Are you an institution or partner?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            Register your School Tenant
          </Link>
        </p>
      </div>
    </div>
  );
};
