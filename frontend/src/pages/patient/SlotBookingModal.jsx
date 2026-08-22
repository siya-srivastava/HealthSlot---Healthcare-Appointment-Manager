import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { patientAPI } from '../../services/api';

export const SlotBookingModal = ({ doctor, isOpen, onClose, onBookingSuccess }) => {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptomsText, setSymptomsText] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [slotMessage, setSlotMessage] = useState('');

  useEffect(() => {
    if (isOpen && doctor) {
      fetchSlots(date);
    }
  }, [isOpen, doctor, date]);

  const fetchSlots = async (selectedDate) => {
    if (!doctor || !selectedDate) return;
    try {
      setLoadingSlots(true);
      setError('');
      setSlotMessage('');
      setSelectedSlot(null);

      const res = await patientAPI.getAvailableSlots(doctor._id, selectedDate);
      setSlots(res.data.slots || []);
      if (res.data.message) {
        setSlotMessage(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctor availability');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select a time slot first');
      return;
    }
    if (!symptomsText.trim()) {
      setError('Please describe your symptoms for AI pre-visit assessment');
      return;
    }

    try {
      setBookingLoading(true);
      setError('');

      const payload = {
        doctorId: doctor._id,
        slotStart: selectedSlot.slotStart,
        slotEnd: selectedSlot.slotEnd,
        symptomsText: symptomsText.trim(),
      };

      const res = await patientAPI.bookAppointment(payload);
      onBookingSuccess(res.data.appointment);
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        setError('This slot was just booked by another patient. Please pick another slot.');
        fetchSlots(date);
      } else {
        setError(err.response?.data?.message || 'Failed to book appointment');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-100 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Book Appointment with Dr. {doctor.user?.name}
            </h3>
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
              {doctor.specialisation} &bull; {doctor.slotDurationMins} min slots
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleBook} className="space-y-5">
          {/* Step 1: Select Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>1. Choose Consultation Date</span>
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full sm:w-64 px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50/50"
            />
          </div>

          {/* Step 2: Select Slot */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>2. Available Time Slots</span>
            </label>

            {loadingSlots ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-medium text-slate-500">Checking doctor's real-time schedule...</span>
              </div>
            ) : slotMessage ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-medium text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{slotMessage}</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500">
                No open slots available for this date. Please try another day.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                {slots.map((slot, idx) => {
                  const startTime = new Date(slot.slotStart).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const isSelected = selectedSlot?.slotStart === slot.slotStart;

                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20 ring-2 ring-teal-500/30'
                          : 'bg-white hover:bg-teal-50/60 text-slate-700 border-slate-200 hover:border-teal-200'
                      }`}
                    >
                      <span>{startTime}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Symptom Form & AI Pre-Visit Notice */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span>3. Describe Your Symptoms & Concerns</span>
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                <Sparkles className="w-3 h-3 text-teal-600" />
                AI Triage Enabled
              </span>
            </div>

            <textarea
              required
              rows={3}
              value={symptomsText}
              onChange={(e) => setSymptomsText(e.target.value)}
              placeholder="e.g. Mild chest tightness for 2 days, accompanied by slight dizziness after climbing stairs..."
              className="block w-full p-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50/50"
            />
            <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
              Our clinical AI will evaluate the urgency level (Low/Medium/High), summarize your chief complaint, and draft 3 suggested questions for Dr. {doctor.user?.name} before your visit.
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
              disabled={bookingLoading || !selectedSlot || !symptomsText.trim()}
              className="py-3 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all hover:shadow-lg disabled:opacity-60"
            >
              {bookingLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing AI Triage & Booking...</span>
                </>
              ) : (
                <>
                  <span>Confirm Appointment</span>
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

export default SlotBookingModal;
