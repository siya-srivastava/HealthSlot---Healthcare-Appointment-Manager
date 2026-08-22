import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  User,
  Filter,
  Activity,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import AppointmentCard from './AppointmentCard';
import VisitNotesModal from './VisitNotesModal';
import DoctorProfile from './DoctorProfile';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'completed', 'profile'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointmentForNotes, setSelectedAppointmentForNotes] = useState(null);
  const [banner, setBanner] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await doctorAPI.getMyAppointments();
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Failed to fetch doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSuccess = (updatedAppointment) => {
    setAppointments((prev) =>
      prev.map((a) => (a._id === updatedAppointment._id ? updatedAppointment : a))
    );
    setBanner('Consultation completed! AI patient-friendly summary created and prescription reminders scheduled.');
    setTimeout(() => setBanner(''), 6000);
  };

  const highUrgencyCount = appointments.filter(
    (a) => a.preVisitSummary?.urgency === 'High' && a.status === 'booked'
  ).length;
  const activeQueue = appointments.filter((a) => a.status === 'booked');
  const completedAppointments = appointments.filter((a) => a.status === 'completed');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header setIsMobileOpen={setIsMobileOpen} />

        <main className="p-4 sm:p-8 flex-1 max-w-7xl mx-auto w-full space-y-6">
          {/* Welcome Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                Dr. {user?.name || 'Physician'} 👋
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
                Clinical consultation schedule & AI triage briefings
              </p>
            </div>

            {/* Quick Stat Badges */}
            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-2xl border border-[#E2E8F0] shadow-sm text-center">
                <span className="text-xl font-black text-[#0F766E]">{activeQueue.length}</span>
                <p className="text-[10px] font-bold text-[#64748B] uppercase">Active Queue</p>
              </div>
              <div className="bg-rose-50 px-4 py-2 rounded-2xl border border-rose-200 shadow-sm text-center">
                <span className="text-xl font-black text-[#DC2626]">{highUrgencyCount}</span>
                <p className="text-[10px] font-bold text-rose-700 uppercase">High Urgency</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-2xl border border-[#E2E8F0] shadow-sm text-center">
                <span className="text-xl font-black text-[#0284C7]">{completedAppointments.length}</span>
                <p className="text-[10px] font-bold text-[#64748B] uppercase">Completed</p>
              </div>
            </div>
          </div>

          {/* Banner */}
          {banner && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>{banner}</span>
              </div>
              <button onClick={() => setBanner('')} className="text-emerald-600 hover:text-emerald-800 font-bold">
                &times;
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'queue'
                  ? 'bg-[#0F766E] text-white shadow-sm'
                  : 'bg-white text-[#64748B] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              Active Queue ({activeQueue.length})
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'completed'
                  ? 'bg-[#0F766E] text-white shadow-sm'
                  : 'bg-white text-[#64748B] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              Completed ({completedAppointments.length})
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#0F766E] text-white shadow-sm'
                  : 'bg-white text-[#64748B] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              My Practicing Schedule
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'queue' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="py-16 text-center">
                    <div className="w-8 h-8 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm font-medium text-[#64748B]">Loading patient schedule...</p>
                  </div>
                ) : activeQueue.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-[#E2E8F0] p-8">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#0F172A]">No appointments in your queue</h3>
                    <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                      New patient bookings with AI pre-visit assessments will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {activeQueue.map((appt) => (
                      <AppointmentCard
                        key={appt._id}
                        appointment={appt}
                        onCompleteClick={(a) => setSelectedAppointmentForNotes(a)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'completed' && (
              <div className="space-y-4">
                {completedAppointments.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-[#E2E8F0] p-8">
                    <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#0F172A]">No completed consultations yet</h3>
                    <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                      Completed visits with clinical notes and AI summaries will be logged here.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {completedAppointments.map((appt) => (
                      <AppointmentCard
                        key={appt._id}
                        appointment={appt}
                        onCompleteClick={() => {}}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && <DoctorProfile />}
          </div>
        </main>
      </div>

      {/* Complete Notes Modal */}
      <VisitNotesModal
        appointment={selectedAppointmentForNotes}
        isOpen={Boolean(selectedAppointmentForNotes)}
        onClose={() => setSelectedAppointmentForNotes(null)}
        onCompleteSuccess={handleCompleteSuccess}
      />
    </div>
  );
};

export default DoctorDashboard;
