import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight, AlertCircle, Sparkles, User, Stethoscope, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      redirectByRole(loggedInUser.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'admin') navigate('/admin');
    else if (role === 'doctor') navigate('/doctor');
    else navigate('/patient');
  };

  // Helper for 1-click demo login
  const handleQuickDemo = async (demoRole, demoEmail, demoPass, demoName) => {
    setError('');
    setDemoLoading(true);
    setEmail(demoEmail);
    setPassword(demoPass);

    try {
      try {
        const loggedInUser = await login(demoEmail, demoPass);
        redirectByRole(loggedInUser.role);
        return;
      } catch (loginErr) {
        try {
          await authAPI.seedDemo();
        } catch (sErr) {
          await authAPI.register({
            name: demoName,
            email: demoEmail,
            password: demoPass,
            role: demoRole
          });
        }
        const user = await login(demoEmail, demoPass);
        redirectByRole(user.role);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Demo authentication failed. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-[#0F766E] flex items-center justify-center text-white shadow-lg shadow-[#0F766E]/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#0F172A]">
              Health<span className="text-[#0F766E]">Slot</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Sign In to HealthSlot
          </h2>
          <p className="mt-1 text-xs text-[#64748B]">
            Access your appointments, clinical triage, and medical records
          </p>
        </div>

        {/* 1-Click Demo Buttons Box */}
        <div className="bg-white p-5 rounded-3xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#0F766E] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#0F766E]" />
            <span>Quick 1-Click Demo Logins</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={demoLoading || loading}
              onClick={() => handleQuickDemo('patient', 'patient@demo.com', 'patient123', 'John Doe (Patient)')}
              className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] text-xs font-bold flex flex-col items-center gap-1 transition-all disabled:opacity-60"
            >
              <User className="w-4 h-4 text-[#16A34A]" />
              <span>Patient</span>
            </button>

            <button
              type="button"
              disabled={demoLoading || loading}
              onClick={() => handleQuickDemo('doctor', 'doctor@demo.com', 'doctor123', 'Dr. Sarah Connor')}
              className="p-3 rounded-2xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-[#0F766E] text-xs font-bold flex flex-col items-center gap-1 transition-all disabled:opacity-60"
            >
              <Stethoscope className="w-4 h-4 text-[#0F766E]" />
              <span>Doctor</span>
            </button>

            <button
              type="button"
              disabled={demoLoading || loading}
              onClick={() => handleQuickDemo('admin', 'admin@demo.com', 'admin123', 'Clinic Administrator')}
              className="p-3 rounded-2xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-[#0284C7] text-xs font-bold flex flex-col items-center gap-1 transition-all disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-7 rounded-3xl border border-[#E2E8F0] shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs shadow-md shadow-[#0F766E]/20 flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-60"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#64748B]">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#0F766E] hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
