import React from 'react';
import { Pill, Calendar, Clock, Bell, CheckCircle2, AlertCircle } from 'lucide-react';

export const MedicationList = ({ reminders, loading }) => {
  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading your prescription reminders...</p>
      </div>
    );
  }

  const activeReminders = reminders.filter((r) => r.active);
  const pastReminders = reminders.filter((r) => !r.active);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl p-6 text-white shadow-lg shadow-teal-600/15">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold">Automated Medication Reminders</h3>
            <p className="text-xs text-teal-100 mt-1 max-w-md">
              Prescriptions issued by your doctor trigger automated daily reminders. Background jobs dispatch notifications directly to your email.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur px-4 py-2.5 rounded-2xl text-center border border-white/20">
              <span className="text-2xl font-black">{activeReminders.length}</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-100">Active Meds</p>
            </div>
          </div>
        </div>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Prescriptions on File</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            When your doctor completes a consultation with prescribed medications, your daily reminder schedule will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Prescriptions */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Active Schedules ({activeReminders.length})</span>
            </h4>

            <div className="grid sm:grid-cols-2 gap-4">
              {activeReminders.map((rem) => {
                const startDate = new Date(rem.startDate);
                const daysPassed = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                const daysRemaining = Math.max(0, rem.durationDays - daysPassed);
                const progressPct = Math.min(100, Math.round((daysPassed / rem.durationDays) * 100));

                return (
                  <div
                    key={rem._id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                            <Pill className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-base font-bold text-slate-900">{rem.medicationName}</h5>
                            <span className="text-xs font-semibold text-teal-700">
                              {rem.timesPerDay} time{rem.timesPerDay > 1 ? 's' : ''} daily &bull; {rem.durationDays} days total
                            </span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </div>

                      {/* Timeline progress */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-600 font-medium">
                          <span>Progress ({daysPassed} / {rem.durationDays} days)</span>
                          <span className="font-bold text-slate-800">{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-teal-600 h-2 rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Started {startDate.toLocaleDateString()}
                      </span>
                      {rem.lastSentAt && (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Bell className="w-3.5 h-3.5" />
                          Last reminder: {new Date(rem.lastSentAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completed / Past Prescriptions */}
          {pastReminders.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Past Completed Prescriptions ({pastReminders.length})</span>
              </h4>

              <div className="grid sm:grid-cols-2 gap-4">
                {pastReminders.map((rem) => (
                  <div
                    key={rem._id}
                    className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 opacity-75 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-700">{rem.medicationName}</h5>
                        <p className="text-xs text-slate-500">
                          Course finished &bull; {rem.durationDays} days completed
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">Completed</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicationList;
