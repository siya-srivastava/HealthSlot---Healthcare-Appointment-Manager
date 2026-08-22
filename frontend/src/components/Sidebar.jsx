import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Calendar,
  CalendarDays,
  Bell,
  Activity,
  Bot,
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AskHealthAIModal from './AskHealthAIModal';

export const Sidebar = ({ activeTab, onTabChange, isMobileOpen, setIsMobileOpen }) => {
  const { user } = useAuth();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const getNavItems = () => {
    if (user?.role === 'doctor') {
      return [
        { id: 'queue', label: 'Patient Queue', icon: LayoutDashboard },
        { id: 'completed', label: 'Completed Consults', icon: Calendar },
        { id: 'profile', label: 'Practice Schedule', icon: Stethoscope },
      ];
    }

    if (user?.role === 'admin') {
      return [
        { id: 'doctors', label: 'Doctor Directory & Leaves', icon: Stethoscope },
        { id: 'appointments', label: 'Clinic Appointments', icon: CalendarDays },
      ];
    }

    // Default: Patient
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'book', label: 'Find Doctors', icon: Search },
      { id: 'appointments', label: 'My Appointments', icon: Calendar },
      { id: 'medications', label: 'Medication Reminders', icon: Bell },
    ];
  };

  const navItems = getNavItems();

  const handleItemClick = (id) => {
    if (onTabChange) {
      onTabChange(id);
    }
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo and Brand */}
        <div>
          <div className="h-20 flex items-center px-6 border-b border-[#E2E8F0]">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#0F766E] flex items-center justify-center text-white shadow-md shadow-[#0F766E]/25 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-[#0F172A]">
                Health<span className="text-[#0F766E]">Slot</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-[#0F766E] text-white shadow-md shadow-[#0F766E]/20'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom AI Widget */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-[#0F766E] to-[#115E59] rounded-2xl p-4 text-white shadow-lg shadow-teal-900/10 relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 opacity-20 pointer-events-none">
              <Bot className="w-20 h-20" />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                </div>
                <h4 className="text-xs font-extrabold tracking-tight">Need Help?</h4>
              </div>

              <p className="text-[11px] text-teal-100/90 leading-snug">
                Our AI Assistant is here to help you 24/7
              </p>

              <button
                onClick={() => setIsAIModalOpen(true)}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-white text-[#0F766E] hover:bg-teal-50 text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all hover:scale-102"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask Health AI</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* AI Assistant Modal */}
      <AskHealthAIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
