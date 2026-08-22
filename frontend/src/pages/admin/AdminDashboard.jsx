import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Stethoscope,
  Users,
  Calendar,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Pill,
  Ban,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import DoctorManagement from './DoctorManagement';
import LeaveManagerModal from './LeaveManagerModal';
import ClinicAppointments from './ClinicAppointments';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors', 'appointments'
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [selectedDoctorForLeave, setSelectedDoctorForLeave] = useState(null);
  const [banner, setBanner] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
    fetchStats();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const res = await adminAPI.getAllDoctors();
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
      const res = await adminAPI.getAllAppointments();
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await adminAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleDoctorCreated = (newDoctor) => {
    setDoctors((prev) => [newDoctor, ...prev]);
    setBanner(`Dr. ${newDoctor.user?.name} onboarded successfully!`);
    fetchStats();
    setTimeout(() => setBanner(''), 5000);
  };

  const handleLeaveAdded = (updatedDoctor) => {
    setDoctors((prev) =>
      prev.map((d) => (d._id === updatedDoctor._id ? updatedDoctor : d))
    );
    fetchAppointments();
    fetchStats();
  };

  const handleDeleteDoctor = async (doctorId, doctorName) => {
    if (!window.confirm(`Are you sure you want to remove Dr. ${doctorName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(doctorId);
      await adminAPI.deleteDoctor(doctorId);
      setDoctors((prev) => prev.filter((d) => d._id !== doctorId));
      setBanner(`Dr. ${doctorName} removed from clinic directory.`);
      fetchStats();
      setTimeout(() => setBanner(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete doctor');
    } finally {
      setDeletingId(null);
    }
  };

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
          {/* Admin Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                Clinic Administration 🏥
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
                Manage doctor profiles, practice hours, leave conflict alerts, and audit logs
              </p>
            </div>

            <button
              onClick={() => setIsDoctorModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-md shadow-[#0F766E]/20 flex items-center gap-2 transition-all hover:scale-102 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New Doctor</span>
            </button>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Doctors</span>
              <div className="text-2xl font-black text-[#0F766E] mt-1">{stats?.totalDoctors ?? doctors.length}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Patients</span>
              <div className="text-2xl font-black text-[#0284C7] mt-1">{stats?.totalPatients ?? '—'}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Confirmed</span>
              <div className="text-2xl font-black text-[#16A34A] mt-1">{stats?.bookedAppointments ?? '—'}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Completed</span>
              <div className="text-2xl font-black text-[#0284C7] mt-1">{stats?.completedAppointments ?? '—'}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Cancelled</span>
              <div className="text-2xl font-black text-[#DC2626] mt-1">{stats?.cancelledAppointments ?? '—'}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Active Meds</span>
              <div className="text-2xl font-black text-purple-600 mt-1">{stats?.activeMedications ?? '—'}</div>
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
              onClick={() => setActiveTab('doctors')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'doctors'
                  ? 'bg-[#0F766E] text-white shadow-sm'
                  : 'bg-white text-[#64748B] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              Doctor Directory & Leave Management ({doctors.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('appointments');
                fetchAppointments();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'appointments'
                  ? 'bg-[#0F766E] text-white shadow-sm'
                  : 'bg-white text-[#64748B] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              Global Clinic Ledger ({appointments.length})
            </button>
          </div>

          {/* Tab Contents */}
          <div>
            {activeTab === 'doctors' && (
              <div className="space-y-4">
                {loadingDoctors ? (
                  <div className="py-16 text-center">
                    <div className="w-8 h-8 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm font-medium text-[#64748B]">Loading doctor profiles...</p>
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-[#E2E8F0] p-8">
                    <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#0F172A]">No doctors onboarded yet</h3>
                    <button
                      onClick={() => setIsDoctorModalOpen(true)}
                      className="mt-4 py-2 px-4 rounded-xl bg-[#0F766E] text-white text-xs font-bold"
                    >
                      Onboard First Doctor
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {doctors.map((doc) => {
                      const docUser = doc.user || {};
                      const leaveCount = doc.leaveDays?.length || 0;

                      return (
                        <div
                          key={doc._id}
                          className="bg-white rounded-3xl border border-[#E2E8F0] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold text-lg shadow-inner">
                                  {docUser.name ? docUser.name.charAt(0) : 'D'}
                                </div>
                                <div>
                                  <h4 className="text-base font-bold text-[#0F172A]">Dr. {docUser.name}</h4>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-[#0F766E] border border-teal-200">
                                    {doc.specialisation}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleDeleteDoctor(doc._id, docUser.name)}
                                disabled={deletingId === doc._id}
                                className="text-slate-400 hover:text-[#DC2626] p-1.5 rounded-xl hover:bg-rose-50 transition-colors"
                                title="Remove Doctor"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-2 py-3 border-y border-[#E2E8F0] text-xs text-[#64748B]">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
                                  <span>Hours: {doc.workingHours?.start} - {doc.workingHours?.end}</span>
                                </span>
                                <span className="font-semibold text-[#0F172A] bg-slate-100 px-2 py-0.5 rounded-md">
                                  {doc.slotDurationMins} min slots
                                </span>
                              </div>

                              <div className="flex items-start gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                                <span className="text-[#0F172A]">
                                  <strong>Days:</strong> {doc.workingDays?.join(', ') || 'Mon-Fri'}
                                </span>
                              </div>

                              {leaveCount > 0 && (
                                <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200 flex items-center gap-1.5 font-medium">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#DC2626]" />
                                  <span>{leaveCount} leave day(s) registered on schedule.</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-2 flex items-center justify-end">
                            <button
                              onClick={() => setSelectedDoctorForLeave(doc)}
                              className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-[#DC2626] hover:bg-rose-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Assign Leave Day</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'appointments' && (
              <ClinicAppointments
                appointments={appointments}
                loading={loadingAppointments}
              />
            )}
          </div>
        </main>
      </div>

      <DoctorManagement
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        onDoctorCreated={handleDoctorCreated}
      />

      <LeaveManagerModal
        doctor={selectedDoctorForLeave}
        isOpen={Boolean(selectedDoctorForLeave)}
        onClose={() => setSelectedDoctorForLeave(null)}
        onLeaveAdded={handleLeaveAdded}
      />
    </div>
  );
};

export default AdminDashboard;
