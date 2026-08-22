import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, ExternalLink, RefreshCw, X, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { calendarAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CalendarConnectModal = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen, user]);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const res = await calendarAPI.getStatus();
      setIsConnected(res.data.isConnected);
      setIsGoogleConfigured(res.data.isGoogleConfigured);
    } catch (err) {
      console.error('Failed to get calendar status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const res = await calendarAPI.getConnectUrl();

      if (!res.data.isConfigured || !res.data.authUrl) {
        setError('Google OAuth is not configured in backend .env (missing GOOGLE_CLIENT_ID). Please use the 1-Click Demo Sync below or add your Google Cloud credentials.');
        return;
      }

      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const authWindow = window.open(
        res.data.authUrl,
        'GoogleCalendarOAuth',
        `width=${width},height=${height},top=${top},left=${left}`
      );

      const handleMessage = async (event) => {
        if (event.data?.type === 'CALENDAR_CONNECTED') {
          window.removeEventListener('message', handleMessage);
          await refreshUser();
          await checkStatus();
        }
      };

      window.addEventListener('message', handleMessage);

      const timer = setInterval(async () => {
        if (authWindow && authWindow.closed) {
          clearInterval(timer);
          window.removeEventListener('message', handleMessage);
          await refreshUser();
          await checkStatus();
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate Google OAuth');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectDemo = async () => {
    try {
      setDemoLoading(true);
      setError('');
      await calendarAPI.connectDemo();
      await refreshUser();
      setIsConnected(true);
      setSuccess('Calendar sync successfully enabled in demo mode!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enable demo sync');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      setError('');
      setSuccess('');
      await calendarAPI.disconnect();
      await refreshUser();
      setIsConnected(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disconnect calendar');
    } finally {
      setDisconnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center shadow-inner">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Google Calendar Sync</h3>
            <p className="text-xs text-slate-500">2-Way Appointment Synchronization</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${isConnected ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'}`} />
            <div>
              <p className="text-sm font-bold text-slate-800">
                {isConnected ? 'Calendar Synced Active' : 'Not Connected'}
              </p>
              <p className="text-xs text-slate-500">
                {isConnected
                  ? 'Bookings and cancellations automatically synchronize with your calendar.'
                  : 'Enable calendar sync to receive native reminders and calendar invites.'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {isConnected ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>2-way sync enabled for booked, updated, and cancelled visits.</span>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="w-full mt-2 py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors disabled:opacity-60"
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect Calendar Sync'}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Option 1: 1-Click Demo Sync */}
              <button
                onClick={handleConnectDemo}
                disabled={demoLoading || loading}
                className="w-full py-3 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-md shadow-teal-900/10 flex items-center justify-center gap-2 transition-all hover:scale-102 disabled:opacity-60"
              >
                {demoLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting Demo Sync...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Enable 1-Click Calendar Sync (Instant Demo)</span>
                  </>
                )}
              </button>

              {/* Option 2: Real Google OAuth */}
              <button
                onClick={handleConnectGoogle}
                disabled={loading || demoLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Opening Google Login...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>Connect with Google OAuth 2.0</span>
                  </>
                )}
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarConnectModal;
