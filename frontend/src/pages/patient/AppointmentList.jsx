import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Ban,
  HelpCircle
} from 'lucide-react';
import UrgencyBadge from '../../components/UrgencyBadge';
import { patientAPI } from '../../services/api';

export const AppointmentList = ({ appointments, loading, onAppointmentCancelled }) => {
  const [filter, setFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState('');

  const filteredAppointments = appointments.filter((appt) => {
    if (filter === 'upcoming') return appt.status === 'booked';
    if (filter === 'completed') return appt.status === 'completed';
    if (filter === 'cancelled') return appt.status === 'cancelled';
    return true;
  });

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? An email notification will be sent and any Google Calendar event will be removed.')) {
      return;
    }

    try {
      setCancellingId(appointmentId);
      setError('');
      await patientAPI.cancelAppointment(appointmentId);
      onAppointmentCancelled(appointmentId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case 'booked':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading your appointment records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab} ({appointments.filter(a => tab === 'all' || (tab === 'upcoming' ? a.status === 'booked' : a.status === tab)).length})
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {filteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No appointments found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {filter === 'all'
              ? 'You have not booked any appointments yet. Use the "Find Doctors & Book" tab to schedule your first consultation.'
              : `You have no ${filter} appointments.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appt) => {
            const isExpanded = expandedId === appt._id;
            const docUser = appt.doctor?.user || {};
            const startDate = new Date(appt.slotStart);
            const endDate = new Date(appt.slotEnd);

            return (
              <div
                key={appt._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main Card Header & Summary */}
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="text-base font-bold text-slate-900">
                          Dr. {docUser.name || 'Healthcare Specialist'}
                        </h4>
                        {getStatusBadge(appt.status)}
                        {appt.preVisitSummary?.urgency && (
                          <UrgencyBadge urgency={appt.preVisitSummary.urgency} size="sm" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-teal-700">
                        {appt.doctor?.specialisation || 'General Medicine'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-medium flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {startDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {appt.status === 'booked' && (
                      <button
                        onClick={() => handleCancel(appt._id)}
                        disabled={cancellingId === appt._id}
                        className="py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors disabled:opacity-60 flex items-center gap-1"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{cancellingId === appt._id ? 'Cancelling...' : 'Cancel'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => toggleExpand(appt._id)}
                      className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View AI Notes'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 sm:px-6 bg-slate-50/70 border-t border-slate-100 space-y-4 text-xs">
                    {/* Symptoms Entered */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200/80">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        <span>Symptoms Reported by You</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{appt.symptomsText}</p>
                    </div>

                    {/* Pre-Visit AI Triage & Suggested Doctor Questions */}
                    {appt.preVisitSummary && (
                      <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200/80">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 font-bold text-teal-900">
                            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                            <span>AI Pre-Visit Assessment & Doctor Briefing</span>
                          </div>
                          <UrgencyBadge urgency={appt.preVisitSummary.urgency} size="sm" />
                        </div>
                        <p className="text-slate-700 mb-3">
                          <strong className="text-teal-900">Chief Complaint:</strong>{' '}
                          {appt.preVisitSummary.chiefComplaint}
                        </p>

                        {appt.preVisitSummary.questions && appt.preVisitSummary.questions.length > 0 && (
                          <div>
                            <p className="font-bold text-teal-900 mb-1.5 flex items-center gap-1">
                              <HelpCircle className="w-3 h-3" /> 3 AI-Suggested Diagnostic Questions for Dr. {docUser.name}:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-slate-700">
                              {appt.preVisitSummary.questions.map((q, qIdx) => (
                                <li key={qIdx}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Post-Visit Clinical Summary if Completed */}
                    {appt.status === 'completed' && (
                      <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-3">
                        <div className="flex items-center gap-1.5 font-bold text-blue-900">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          <span>Post-Consultation Summary & Medication Schedule</span>
                        </div>

                        {appt.postVisitSummary && (
                          <div className="p-3 bg-white rounded-lg border border-blue-100 text-slate-800 whitespace-pre-line leading-relaxed">
                            {appt.postVisitSummary}
                          </div>
                        )}

                        {appt.postVisitNotes && (
                          <div className="text-[11px] text-slate-500">
                            <strong>Physician Clinical Notes:</strong> {appt.postVisitNotes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
