import React, { useState } from 'react';
import {
  FileText,
  Pill,
  Sparkles,
  CheckCircle2,
  X,
  AlertCircle,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { doctorAPI } from '../../services/api';

export const VisitNotesModal = ({ appointment, isOpen, onClose, onCompleteSuccess }) => {
  const [postVisitNotes, setPostVisitNotes] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [durationDays, setDurationDays] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !appointment) return null;

  const patientName = appointment.patient?.name || 'Patient';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postVisitNotes.trim()) {
      setError('Please write clinical notes for the patient consultation');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        postVisitNotes: postVisitNotes.trim(),
        medicationName: medicationName.trim() || undefined,
        timesPerDay: medicationName.trim() ? Number(timesPerDay) : undefined,
        durationDays: medicationName.trim() ? Number(durationDays) : undefined,
      };

      const res = await doctorAPI.completeAppointment(appointment._id, payload);
      onCompleteSuccess(res.data.appointment);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit clinical notes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-100 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Complete Consultation for {patientName}
            </h3>
            <p className="text-xs text-slate-500">
              Submit clinical findings, prescriptions, and auto-generate AI patient summary
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Clinical notes textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Doctor Clinical Notes & Observations
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                <Sparkles className="w-3 h-3 text-teal-600" />
                AI Summary Converter
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={postVisitNotes}
              onChange={(e) => setPostVisitNotes(e.target.value)}
              placeholder="e.g. Diagnosed with acute upper respiratory tract infection. Lungs clear to auscultation. Advised rest, hydration, and prescribed Amoxicillin 500mg. Follow up in 5 days if fever persists."
              className="block w-full p-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50/50"
            />
            <p className="mt-1.5 text-[11px] text-slate-500">
              The AI will translate these clinical notes into clear, reassuring, patient-friendly instructions with a medication schedule.
            </p>
          </div>

          {/* Prescription section (Optional but triggers reminders) */}
          <div className="p-5 bg-teal-50/40 rounded-2xl border border-teal-100 space-y-4">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                2. Digital Prescription & Daily Reminder Schedule
              </h4>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  placeholder="e.g. Amoxicillin 500mg"
                  className="block w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Times per Day
                </label>
                <select
                  value={timesPerDay}
                  onChange={(e) => setTimesPerDay(Number(e.target.value))}
                  className="block w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
                >
                  <option value={1}>1x daily (Once a day)</option>
                  <option value={2}>2x daily (Morning & Night)</option>
                  <option value={3}>3x daily (Every 8 hours)</option>
                  <option value={4}>4x daily (Every 6 hours)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="block w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
                />
              </div>
            </div>
            <p className="text-[11px] text-teal-800/80">
              Adding a prescription creates a background reminder job sending daily automated dosage notifications to the patient.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !postVisitNotes.trim()}
              className="py-3 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all hover:shadow-lg disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Patient Summary...</span>
                </>
              ) : (
                <>
                  <span>Save Notes & Complete Visit</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitNotesModal;
