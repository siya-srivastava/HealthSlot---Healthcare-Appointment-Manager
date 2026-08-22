import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  HeartPulse,
  Pill,
  Search,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Plus,
  ClipboardList,
  FileText,
  Star,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Bot,
  Heart,
  Brain,
  Bone,
  Baby,
  Smile,
  Activity,
  Droplets
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import DoctorSearch from './DoctorSearch';
import AppointmentList from './AppointmentList';
import MedicationList from './MedicationList';
import SlotBookingModal from './SlotBookingModal';
import AskHealthAIModal from '../../components/AskHealthAIModal';

const SPECIALTY_ITEMS = [
  { name: 'Cardiology', icon: Heart, color: 'bg-rose-50 text-rose-600' },
  { name: 'Dermatology', icon: Smile, color: 'bg-amber-50 text-amber-600' },
  { name: 'Neurology', icon: Brain, color: 'bg-purple-50 text-purple-600' },
  { name: 'Orthopedics', icon: Bone, color: 'bg-blue-50 text-blue-600' },
  { name: 'Pediatrics', icon: Baby, color: 'bg-emerald-50 text-emerald-600' },
  { name: 'General Medicine', icon: Activity, color: 'bg-teal-50 text-teal-600' },
];

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'book', 'appointments', 'bookings', 'medications', 'records'
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [successBanner, setSuccessBanner] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
    fetchReminders();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const res = await patientAPI.searchDoctors();
      setDoctors(res.data || []);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const res = await patientAPI.getMyAppointments();
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchReminders = async () => {
    try {
      setLoadingReminders(true);
      const res = await patientAPI.getMyReminders();
      setReminders(res.data || []);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoadingReminders(false);
    }
  };

  const handleBookingSuccess = (newAppointment) => {
    setSuccessBanner('Appointment booked successfully! AI pre-visit briefing generated and confirmation email dispatched.');
    fetchAppointments();
    setActiveTab('appointments');
    setTimeout(() => setSuccessBanner(''), 6000);
  };

  const handleAppointmentCancelled = (cancelledId) => {
    setAppointments((prev) =>
      prev.map((a) => (a._id === cancelledId ? { ...a, status: 'cancelled' } : a))
    );
    setSuccessBanner('Appointment successfully cancelled. Notification email sent.');
    setTimeout(() => setSuccessBanner(''), 5000);
  };

  const upcomingAppointments = appointments.filter((a) => a.status === 'booked');
  const completedAppointments = appointments.filter((a) => a.status === 'completed');
  const activeMedCount = reminders.filter((r) => r.active).length;
  const nextAppointment = upcomingAppointments[0] || null;

  // Filter doctors based on global header search
  const filteredDoctors = doctors.filter((doc) => {
    if (!searchFilter) return true;
    const name = doc.user?.name?.toLowerCase() || '';
    const spec = doc.specialisation?.toLowerCase() || '';
    return name.includes(searchFilter.toLowerCase()) || spec.includes(searchFilter.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main App Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onSearch={(query) => {
            setSearchFilter(query);
            if (query && activeTab === 'dashboard') setActiveTab('book');
          }}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Dynamic Content Area */}
        <main className="p-4 sm:p-8 flex-1 max-w-7xl mx-auto w-full space-y-6">
          {/* Success Banner */}
          {successBanner && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>{successBanner}</span>
              </div>
              <button onClick={() => setSuccessBanner('')} className="text-emerald-600 hover:text-emerald-800 font-bold text-base">
                &times;
              </button>
            </div>
          )}

          {/* TAB 1: MAIN DASHBOARD VIEW (Matching Reference Screenshot) */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Center 2 Columns: Main Feed */}
              <div className="xl:col-span-2 space-y-8">
                {/* Welcome Heading */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                    Welcome back, {user?.name?.split(' ')[0] || 'Patient'} 👋
                  </h1>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
                    Book appointments, manage your health, and get reminders.
                  </p>
                </div>

                {/* 4 Metric Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Card 1: Upcoming Appointments */}
                  <div
                    onClick={() => setActiveTab('appointments')}
                    className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] font-bold text-[#64748B]">Upcoming Appointments</p>
                    <h3 className="text-2xl font-black text-[#0F172A] mt-1">
                      {upcomingAppointments.length}
                    </h3>
                  </div>

                  {/* Card 2: Completed Appointments */}
                  <div
                    onClick={() => setActiveTab('appointments')}
                    className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] font-bold text-[#64748B]">Completed Appointments</p>
                    <h3 className="text-2xl font-black text-[#0F172A] mt-1">
                      {completedAppointments.length}
                    </h3>
                  </div>

                  {/* Card 3: Health Reminders */}
                  <div
                    onClick={() => setActiveTab('medications')}
                    className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] font-bold text-[#64748B]">Health Reminders</p>
                    <h3 className="text-2xl font-black text-[#0F172A] mt-1">
                      {activeMedCount}
                    </h3>
                  </div>

                  {/* Card 4: Medical Records */}
                  <div
                    onClick={() => setActiveTab('appointments')}
                    className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] font-bold text-[#64748B]">Medical Records</p>
                    <h3 className="text-2xl font-black text-[#0F172A] mt-1">
                      {appointments.length}
                    </h3>
                  </div>
                </div>

                {/* Section: Find Top Doctors */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-[#0F172A]">Find Top Doctors</h2>
                    <button
                      onClick={() => setActiveTab('book')}
                      className="text-xs font-bold text-[#0F766E] hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  {/* Doctors Carousel/Grid */}
                  {loadingDoctors ? (
                    <div className="py-12 text-center bg-white rounded-2xl border border-[#E2E8F0]">
                      <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <span className="text-xs text-[#64748B]">Loading certified doctors...</span>
                    </div>
                  ) : doctors.length === 0 ? (
                    <div className="py-10 text-center bg-white rounded-2xl border border-[#E2E8F0] p-6 text-xs text-[#64748B]">
                      No doctor profiles active yet. Check back shortly.
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {doctors.slice(0, 4).map((doc, idx) => {
                        const ratings = ['4.8 (120)', '4.7 (98)', '4.9 (150)', '4.7 (110)'];
                        const clinics = ['City Hospital, Delhi', 'Skin Care Clinic, Delhi', 'Brain & Neuro Center', 'Women\'s Care Clinic'];
                        const ratingStr = ratings[idx % ratings.length];
                        const clinicStr = clinics[idx % clinics.length];

                        return (
                          <div
                            key={doc._id}
                            className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-center group"
                          >
                            <div>
                              {/* Avatar with active green dot */}
                              <div className="relative mx-auto w-20 h-20 mb-3">
                                <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center font-bold text-xl text-[#0F766E] shadow-inner group-hover:scale-105 transition-transform">
                                  {doc.user?.name ? doc.user.name.charAt(0) : 'D'}
                                </div>
                                <span className="absolute bottom-0 right-1 w-3.5 h-3.5 bg-[#16A34A] rounded-full border-2 border-white" />
                              </div>

                              <h4 className="text-sm font-extrabold text-[#0F172A] truncate">
                                Dr. {doc.user?.name || 'Specialist'}
                              </h4>
                              <p className="text-[11px] font-semibold text-[#0F766E] mt-0.5">
                                {doc.specialisation}
                              </p>

                              {/* Rating */}
                              <div className="flex items-center justify-center gap-1 mt-1.5 text-[11px] text-[#0F172A] font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{ratingStr}</span>
                              </div>

                              {/* Location */}
                              <p className="text-[10px] text-[#64748B] mt-1 truncate">
                                {clinicStr}
                              </p>
                            </div>

                            {/* Book Button */}
                            <button
                              onClick={() => setSelectedDoctorForBooking(doc)}
                              className="mt-4 w-full py-2 px-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-md shadow-[#0F766E]/20 transition-all hover:scale-102"
                            >
                              Book Appointment
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section: Specialties */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-[#0F172A]">Specialties</h2>
                    <button
                      onClick={() => setActiveTab('book')}
                      className="text-xs font-bold text-[#0F766E] hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {SPECIALTY_ITEMS.map((spec, i) => {
                      const Icon = spec.icon;
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            setSearchFilter(spec.name);
                            setActiveTab('book');
                          }}
                          className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#0F766E]/30 transition-all text-center cursor-pointer group"
                        >
                          <div className={`w-12 h-12 rounded-full ${spec.color} mx-auto flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <h4 className="text-xs font-extrabold text-[#0F172A] truncate">
                            {spec.name}
                          </h4>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Widgets */}
              <div className="space-y-6">
                {/* Widget 1: Upcoming Appointment */}
                <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-[#0F172A]">Upcoming Appointment</h3>
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="text-xs font-bold text-[#0F766E] hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  {nextAppointment ? (
                    <div className="space-y-4">
                      {/* Date + status badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                          <Calendar className="w-4 h-4 text-[#0F766E]" />
                          <span>
                            {new Date(nextAppointment.slotStart).toLocaleDateString('en-US', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                          Confirmed
                        </span>
                      </div>

                      <div className="text-xs font-black text-[#0F172A]">
                        {new Date(nextAppointment.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(nextAppointment.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      {/* Doctor card */}
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-[#E2E8F0]">
                        <div className="w-11 h-11 rounded-full bg-teal-50 text-[#0F766E] font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                          {nextAppointment.doctor?.user?.name ? nextAppointment.doctor.user.name.charAt(0) : 'D'}
                        </div>
                        <div className="overflow-hidden text-left">
                          <h5 className="text-xs font-bold text-[#0F172A] truncate">
                            Dr. {nextAppointment.doctor?.user?.name || 'Specialist'}
                          </h5>
                          <p className="text-[10px] font-semibold text-[#0F766E] truncate">
                            {nextAppointment.doctor?.specialisation || 'General Medicine'}
                          </p>
                          <p className="text-[10px] text-[#64748B] truncate">HealthSlot Medical Center</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('appointments')}
                        className="w-full py-2.5 px-4 rounded-xl border border-[#0F766E] text-[#0F766E] hover:bg-teal-50 text-xs font-bold transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-[#64748B]">
                      <p>No upcoming visits scheduled.</p>
                      <button
                        onClick={() => setActiveTab('book')}
                        className="mt-3 px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-bold shadow-sm"
                      >
                        Book a Doctor
                      </button>
                    </div>
                  )}
                </div>

                {/* Widget 2: Quick Actions */}
                <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-[#0F172A]">Quick Actions</h3>

                  <div className="space-y-2.5">
                    {/* Action 1: Book New Appointment */}
                    <button
                      onClick={() => setActiveTab('book')}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-[#E2E8F0] hover:border-teal-200 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-[#0F172A] group-hover:text-[#0F766E]">
                            Book New Appointment
                          </h4>
                          <p className="text-[10px] text-[#64748B]">Find and book doctors</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F766E]" />
                    </button>

                    {/* Action 2: Upload Medical Record / Symptoms */}
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-[#E2E8F0] hover:border-teal-200 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-[#0F172A] group-hover:text-[#0F766E]">
                            Medical Records & History
                          </h4>
                          <p className="text-[10px] text-[#64748B]">Review doctor visit summaries</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F766E]" />
                    </button>

                    {/* Action 3: Set Medication Reminder */}
                    <button
                      onClick={() => setActiveTab('medications')}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-[#E2E8F0] hover:border-teal-200 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <Pill className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-[#0F172A] group-hover:text-[#0F766E]">
                            Set Medication Reminder
                          </h4>
                          <p className="text-[10px] text-[#64748B]">Never miss your medicines</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F766E]" />
                    </button>

                    {/* Action 4: AI Health Assistant */}
                    <button
                      onClick={() => setIsAIModalOpen(true)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-[#E2E8F0] hover:border-teal-200 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-[#0F172A] group-hover:text-[#0F766E]">
                            AI Health Assistant
                          </h4>
                          <p className="text-[10px] text-[#64748B]">Get health insights instantly</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F766E]" />
                    </button>
                  </div>
                </div>

                {/* Widget 3: Health Tip for You */}
                <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm space-y-2 relative overflow-hidden">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#0F766E]">
                    <span>Health Tip for You 🩵</span>
                  </div>
                  <p className="text-xs text-[#0F172A] font-semibold leading-relaxed">
                    Drink plenty of water and get 7–8 hours of sleep daily.
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-[10px] text-[#64748B]">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    <span>Daily wellness recommendation</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FIND DOCTORS */}
          {(activeTab === 'book' || activeTab === 'bookings') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Find Top Doctors</h1>
                  <p className="text-xs text-[#64748B]">Search practicing specialists and book instant slots</p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="text-xs font-bold text-[#0F766E] hover:underline"
                >
                  &larr; Back to Dashboard
                </button>
              </div>

              <DoctorSearch
                doctors={filteredDoctors}
                loading={loadingDoctors}
                onSelectDoctor={(doc) => setSelectedDoctorForBooking(doc)}
              />
            </div>
          )}

          {/* TAB 3: APPOINTMENTS */}
          {(activeTab === 'appointments' || activeTab === 'records') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">My Appointments & Records</h1>
                  <p className="text-xs text-[#64748B]">Track consultations, AI pre-visit assessments, and doctor notes</p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="text-xs font-bold text-[#0F766E] hover:underline"
                >
                  &larr; Back to Dashboard
                </button>
              </div>

              <AppointmentList
                appointments={appointments}
                loading={loadingAppointments}
                onAppointmentCancelled={handleAppointmentCancelled}
              />
            </div>
          )}

          {/* TAB 4: MEDICATIONS */}
          {activeTab === 'medications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Prescriptions & Reminders</h1>
                  <p className="text-xs text-[#64748B]">Automated daily dosage notifications and active courses</p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="text-xs font-bold text-[#0F766E] hover:underline"
                >
                  &larr; Back to Dashboard
                </button>
              </div>

              <MedicationList
                reminders={reminders}
                loading={loadingReminders}
              />
            </div>
          )}
        </main>
      </div>

      {/* Booking Modal */}
      <SlotBookingModal
        doctor={selectedDoctorForBooking}
        isOpen={Boolean(selectedDoctorForBooking)}
        onClose={() => setSelectedDoctorForBooking(null)}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* AI Assistant Modal */}
      <AskHealthAIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
};

export default PatientDashboard;
