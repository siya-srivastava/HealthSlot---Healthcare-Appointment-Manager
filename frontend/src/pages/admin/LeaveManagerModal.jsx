import React, { useState } from 'react';
import { Calendar, AlertTriangle, CheckCircle2, X, AlertCircle, User, ChevronRight } from 'lucide-react';
import { adminAPI } from '../../services/api';

export const LeaveManagerModal = ({ doctor, isOpen, onClose, onLeaveAdded }) => {
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (!isOpen || !doctor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      setError('Please select a date for the leave day');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const res = await adminAPI.addLeaveDay(doctor._id, date);
      setResult(res.data);
      onLeaveAdded(res.data.doctor);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign doctor leave day');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Assign Doctor Leave</h3>
            <p className="text-xs text-slate-500">Dr. {doctor.user?.name} &bull; {doctor.specialisation}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {result ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Leave Day Registered</span>
              </div>
              <p>{result.message}</p>
              {result.affectedCount > 0 ? (
                <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-200 font-semibold text-emerald-800">
                  ⚠️ {result.affectedCount} conflicting patient appointment(s) were automatically cancelled and patients were emailed.
                </div>
              ) : (
                <p className="text-emerald-700">No existing patient appointments conflicted with this date.</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Automated Conflict Resolution:</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                Marking this date will instantly block all slots on the doctor's calendar. Any patient with an existing booked slot on this date will have their appointment safely cancelled and will receive an immediate email notification.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Leave Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 bg-slate-50/50"
              />
            </div>

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
                disabled={loading || !date}
                className="py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all hover:shadow-lg disabled:opacity-60"
              >
                {loading ? (
                  <span>Processing Leaves...</span>
                ) : (
                  <>
                    <span>Confirm Leave Day</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LeaveManagerModal;
