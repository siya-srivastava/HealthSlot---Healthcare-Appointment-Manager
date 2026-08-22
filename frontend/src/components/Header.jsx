import React, { useState } from 'react';
import { Search, Bell, Calendar, ChevronDown, LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CalendarConnectModal from './CalendarConnectModal';

export const Header = ({ onSearch, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <>
      <header className="h-20 bg-white border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
        {/* Mobile menu trigger + Search input */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <button
            onClick={() => setIsMobileOpen && setIsMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-[#64748B] hover:bg-slate-100"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search doctors, specialties, clinics..."
              className="block w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] bg-slate-50/50 text-[#0F172A]"
            />
          </div>
        </div>

        {/* Right action icons & User Profile */}
        <div className="flex items-center gap-3 sm:gap-4 pl-4">
          {/* Calendar sync badge */}
          <button
            onClick={() => setIsCalendarModalOpen(true)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              user?.isCalendarConnected
                ? 'bg-emerald-50 text-[#16A34A] border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-[#64748B] border-[#E2E8F0] hover:bg-slate-100'
            }`}
            title="Google Calendar Integration"
          >
            <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>{user?.isCalendarConnected ? 'Synced' : 'Sync Calendar'}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                user?.isCalendarConnected ? 'bg-[#16A34A]' : 'bg-slate-300'
              }`}
            />
          </button>

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="p-2.5 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#DC2626] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0F766E] to-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-extrabold text-[#0F172A] leading-tight">
                  Hi, {user?.name?.split(' ')[0] || 'User'}
                </span>
                <span className="text-[10px] font-semibold text-[#64748B] capitalize leading-tight">
                  {user?.role || 'Patient'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B] hidden sm:block" />
            </button>

            {/* User Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-1.5 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-[#E2E8F0]">
                  <p className="text-xs font-bold text-[#0F172A]">{user?.name}</p>
                  <p className="text-[10px] text-[#64748B] truncate">{user?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setIsCalendarModalOpen(true);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#0F172A] hover:bg-slate-50 rounded-xl"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Google Calendar Sync</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-rose-50 rounded-xl"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <CalendarConnectModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
      />
    </>
  );
};

export default Header;
