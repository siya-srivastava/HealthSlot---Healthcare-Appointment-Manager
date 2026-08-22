import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Calendar,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Clock,
  Bell,
  ArrowRight,
  BrainCircuit,
  Lock,
  CheckCircle2,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  const getPortalLink = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'doctor') return '/doctor';
    if (user?.role === 'admin') return '/admin';
    return '/patient';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* Top Simple Nav */}
      <header className="h-20 bg-white border-b border-[#E2E8F0] px-6 sm:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0F766E] flex items-center justify-center text-white shadow-md shadow-[#0F766E]/20">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-[#0F172A]">
            Health<span className="text-[#0F766E]">Slot</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to={getPortalLink()}
              className="px-5 py-2.5 rounded-xl bg-[#0F766E] text-white text-xs font-bold shadow-md shadow-[#0F766E]/20"
            >
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-[#0F172A] hover:text-[#0F766E]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-md shadow-[#0F766E]/20 transition-all"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-[#0F766E] text-xs font-bold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Healthcare Booking & Follow-Up System</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Book Doctor Slots in Seconds. <br className="hidden sm:block" />
            <span className="text-[#0F766E]">
              Powered by Clinical AI.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-5 text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto font-normal leading-relaxed">
            HealthSlot connects patients with certified doctors, analyzes symptoms with pre-visit AI triage, prevents double bookings atomically, and syncs automatically with Google Calendar.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={getPortalLink()}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-sm shadow-lg shadow-[#0F766E]/25 transition-all hover:scale-102"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-[#0F172A] font-bold text-sm border border-[#E2E8F0] shadow-sm transition-all"
            >
              <span>1-Click Demo Login</span>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
              <div className="text-xl font-black text-[#0F766E]">0%</div>
              <div className="text-[11px] font-bold text-[#64748B] mt-0.5">Double Booking Conflict</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
              <div className="text-xl font-black text-[#0284C7]">100%</div>
              <div className="text-[11px] font-bold text-[#64748B] mt-0.5">Google Calendar 2-Way Sync</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
              <div className="text-xl font-black text-[#16A34A]">AI Triage</div>
              <div className="text-[11px] font-bold text-[#64748B] mt-0.5">Urgency & Clinical Questions</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
              <div className="text-xl font-black text-purple-600">Daily Cron</div>
              <div className="text-[11px] font-bold text-[#64748B] mt-0.5">Medication Reminders</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-6 text-center text-xs text-[#64748B]">
        <p>HealthSlot &copy; 2026 — Smart Healthcare Appointment & Follow-Up Manager</p>
      </footer>
    </div>
  );
};

export default LandingPage;
