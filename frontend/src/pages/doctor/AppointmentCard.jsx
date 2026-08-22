import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Pill
} from 'lucide-react';
import UrgencyBadge from '../../components/UrgencyBadge';

export const AppointmentCard = ({ appointment, onCompleteClick }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const patient = appointment.patient || {};
  const startDate = new Date(appointment.slotStart);
  const endDate = new Date(appointment.slotEnd);
  const preVisit = appointment.preVisitSummary || {};

  const isCompleted = appointment.status === 'completed';
  const isCancelled = appointment.status === 'cancelled';

  return (
    <div
      className={`bg-white rounded-3xl border transition-all overflow-hidden ${
        preVisit.urgency === 'High' && !isCompleted && !isCancelled
          ? 'border-rose-300 ring-2 ring-rose-100 shadow-md'
          : 'border-slate-200 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Top Patient Header */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg shrink-0 shadow-inner">
            {patient.name ? patient.name.charAt(0) : 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="text-base font-bold text-slate-900">{patient.name || 'Patient'}</h4>
              {preVisit.urgency && <UrgencyBadge urgency={preVisit.urgency} size="sm" />}
              {isCompleted && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Completed
                </span>
              )}
              {isCancelled && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  Cancelled
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 font-medium flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {patient.email || 'No email'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                {startDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {!isCompleted && !isCancelled && (
            <button
              onClick={() => onCompleteClick(appointment)}
              className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-all hover:shadow-lg"
            >
              <FileText className="w-4 h-4" />
              <span>Complete Consultation</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body Details */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-4 bg-slate-50/50">
          {/* Patient Symptoms */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Reported Symptoms</span>
            </h5>
            <p className="text-xs text-slate-700 leading-relaxed">
              {appointment.symptomsText || 'No initial symptoms described.'}
            </p>
          </div>

          {/* AI Pre-Visit Briefing */}
          {preVisit.chiefComplaint && (
            <div className="p-5 bg-teal-50/70 rounded-2xl border border-teal-200/90 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 font-bold text-xs text-teal-900 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>AI Pre-Visit Briefing & Triage</span>
                </div>
                <UrgencyBadge urgency={preVisit.urgency} size="sm" />
              </div>

              <div>
                <span className="text-xs font-bold text-teal-950">Chief Complaint: </span>
                <span className="text-xs text-slate-800 font-medium">{preVisit.chiefComplaint}</span>
              </div>

              {preVisit.questions && preVisit.questions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-teal-200/60">
                  <p className="text-xs font-bold text-teal-900 mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
                    <span>3 Suggested Diagnostic Questions for Patient:</span>
                  </p>
                  <div className="space-y-1.5">
                    {preVisit.questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-white/90 rounded-xl border border-teal-100 text-xs text-slate-800 font-medium flex items-start gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Post-Visit Clinical Notes & Summary (if completed) */}
          {isCompleted && (
            <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-blue-900 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Physician Notes & AI Patient Summary</span>
              </div>

              <div className="text-xs text-slate-700">
                <strong className="text-slate-900">Your Clinical Notes:</strong> {appointment.postVisitNotes}
              </div>

              {appointment.postVisitSummary && (
                <div className="p-3.5 bg-white rounded-xl border border-blue-100 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                  <strong className="text-blue-900 block mb-1">Generated Patient-Friendly Summary:</strong>
                  {appointment.postVisitSummary}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
