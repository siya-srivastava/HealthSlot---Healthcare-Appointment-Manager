import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Calendar,
  LogOut,
  User,
  Shield,
  Stethoscope,
  HeartPulse,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CalendarConnectModal from './CalendarConnectModal';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-[#0284C7] border border-sky-200">
            <Shield className="w-3 h-3" /> Admin Portal
          </span>
        );
      case 'doctor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-[#0F766E] border border-teal-200">
            <Stethoscope className="w-3 h-3" /> Doctor Portal
          </span>
        );
      case 'patient':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
            <HeartPulse className="w-3 h-3" /> Patient Portal
          </span>
        );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-md shadow-[#0F766E]/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-[#0F172A]">
                  Health<span className="text-[#0F766E]">Slot</span>
                </span>
                <span className="text-[10px] text-[#64748B] font-medium tracking-wide uppercase">
                  Healthcare & Triage
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-4">
                {/* Role Badge */}
                {getRoleBadge(user?.role)}

                {/* Google Calendar Sync Button */}
                <button
                  onClick={() => setIsCalendarModalOpen(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    user?.isCalendarConnected
                      ? 'bg-emerald-50 text-[#16A34A] border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-50 text-[#64748B] border-[#E2E8F0] hover:bg-slate-100'
                  }`}
                  title="Google Calendar Integration"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>
                    {user?.isCalendarConnected ? 'Calendar Synced' : 'Sync Calendar'}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      user?.isCalendarConnected ? 'bg-[#16A34A]' : 'bg-slate-300'
                    }`}
                  />
                </button>

                {/* User Info */}
                <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-[#E2E8F0] flex items-center justify-center text-[#0F172A]">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#0F172A] leading-tight">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-[#64748B] leading-tight">{user?.email}</p>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-[#64748B] hover:text-[#DC2626] hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#0F172A] hover:text-[#0F766E] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-sm hover:shadow transition-all"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#64748B] hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E2E8F0] px-4 pt-2 pb-4 space-y-3">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#64748B] font-medium">{user?.name}</span>
                  {getRoleBadge(user?.role)}
                </div>
                <button
                  onClick={() => {
                    setIsCalendarModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 rounded-lg text-xs font-medium text-[#0F172A] border border-[#E2E8F0]"
                >
                  <Calendar className="w-4 h-4 text-[#0F766E]" />
                  <span>Google Calendar Sync ({user?.isCalendarConnected ? 'Connected' : 'Not Connected'})</span>
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-[#DC2626] bg-rose-50 rounded-lg text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center text-sm font-semibold text-[#0F172A] bg-slate-100 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center text-sm font-semibold text-white bg-[#0F766E] rounded-lg"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Calendar Connect Modal */}
      <CalendarConnectModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
