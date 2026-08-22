import React, { useState } from 'react';
import { Calendar, Clock, User, Stethoscope, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import UrgencyBadge from '../../components/UrgencyBadge';

export const ClinicAppointments = ({ appointments, loading }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = appointments.filter((appt) => {
    const statusMatch = filter === 'all' || appt.status === filter;
    const patientName = appt.patient?.name?.toLowerCase() || '';
    const docName = appt.doctor?.user?.name?.toLowerCase() || '';
    const spec = appt.doctor?.specialisation?.toLowerCase() || '';
    const query = search.toLowerCase();

    const searchMatch = !search || patientName.includes(query) || docName.includes(query) || spec.includes(query);
    return statusMatch && searchMatch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
      case 'booked':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Confirmed
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, doctor, or specialty..."
            className="block w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'booked', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Loading clinic appointment records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No appointments found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or switching filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Assigned Doctor</th>
                  <th className="px-5 py-3.5">Appointment Schedule</th>
                  <th className="px-5 py-3.5">AI Triage Urgency</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((appt) => {
                  const startDate = new Date(appt.slotStart);
                  const patient = appt.patient || {};
                  const docUser = appt.doctor?.user || {};

                  return (
                    <tr key={appt._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{patient.name || 'Patient'}</div>
                        <div className="text-[11px] text-slate-400">{patient.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">Dr. {docUser.name || 'Doctor'}</div>
                        <div className="text-[11px] text-indigo-600 font-semibold">{appt.doctor?.specialisation}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-slate-800 font-semibold">{startDate.toLocaleDateString()}</div>
                        <div className="text-[11px] text-slate-500">
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {appt.preVisitSummary?.urgency ? (
                          <UrgencyBadge urgency={appt.preVisitSummary.urgency} size="sm" />
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {getStatusBadge(appt.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicAppointments;
