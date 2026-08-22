import React, { useState, useEffect } from 'react';
import { Stethoscope, Clock, Calendar, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { doctorAPI } from '../../services/api';

export const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await doctorAPI.getMyProfile();
      setProfile(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctor profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading your practicing profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h4 className="text-base font-bold text-slate-800">Doctor Profile Not Found</h4>
        <p className="text-xs text-slate-500 mt-1">Please ask the clinic administrator to verify your doctor profile record.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-2xl shadow-inner">
          {profile.user?.name ? profile.user.name.charAt(0) : 'D'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-900">Dr. {profile.user?.name}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              {profile.specialisation}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{profile.user?.email}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Practice Hours */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>Consultation Timings</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600">
            <p>
              <strong>Daily Working Hours:</strong> {profile.workingHours?.start} - {profile.workingHours?.end}
            </p>
            <p>
              <strong>Slot Duration:</strong> {profile.slotDurationMins} minutes per consultation
            </p>
            <p>
              <strong>Practicing Days:</strong> {profile.workingDays?.join(', ')}
            </p>
          </div>
        </div>

        {/* Leave Schedule */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>Scheduled Leaves ({profile.leaveDays?.length || 0})</span>
          </div>
          {profile.leaveDays && profile.leaveDays.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {profile.leaveDays.map((leave, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                >
                  {new Date(leave).toLocaleDateString()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No upcoming leave days registered with clinic administration.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
