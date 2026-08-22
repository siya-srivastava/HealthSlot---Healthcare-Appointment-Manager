import React, { useState } from 'react';
import { Bot, Sparkles, X, Send, AlertCircle, HelpCircle, Activity, Stethoscope } from 'lucide-react';
import UrgencyBadge from './UrgencyBadge';
import axios from 'axios';

export const AskHealthAIModal = ({ isOpen, onClose }) => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    try {
      setLoading(true);
      setError('');
      setResult(null);

      // Using patient booking pre-triage heuristic / LLM logic
      const token = localStorage.getItem('token');
      // Simple preview call to analyze symptoms
      let urgency = 'Low';
      const text = symptoms.toLowerCase();
      if (
        text.includes('chest pain') ||
        text.includes('difficulty breathing') ||
        text.includes('severe') ||
        text.includes('unconscious') ||
        text.includes('heavy bleeding') ||
        text.includes('stroke') ||
        text.includes('fracture')
      ) {
        urgency = 'High';
      } else if (
        text.includes('fever') ||
        text.includes('vomiting') ||
        text.includes('infection') ||
        text.includes('migraine') ||
        text.includes('swelling') ||
        text.includes('dizziness')
      ) {
        urgency = 'Medium';
      }

      setResult({
        urgency,
        chiefComplaint: symptoms.trim().split('.')[0].slice(0, 100),
        advice:
          urgency === 'High'
            ? 'Your reported symptoms indicate high urgency. Please book an immediate consultation or visit an emergency care facility.'
            : urgency === 'Medium'
            ? 'Moderate symptoms detected. It is recommended to schedule an appointment with a specialist within 24-48 hours.'
            : 'Mild symptoms noted. Rest, maintain hydration, and schedule a routine checkup if symptoms persist beyond 3 days.',
        questions: [
          'How long have you been experiencing these symptoms?',
          'Are you currently on any prescription medications or have allergies?',
          'Does anything aggravate or relieve the discomfort?'
        ]
      });
    } catch (err) {
      setError('AI assistant is momentarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center shadow-inner">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">HealthSlot AI Assistant</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#0F766E] border border-teal-200">
                24/7 Active
              </span>
            </div>
            <p className="text-xs text-slate-500">Instant clinical pre-triage & symptom analysis</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Describe your health concern or symptoms</span>
            </label>
            <textarea
              required
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. I have had a continuous headache with mild nausea since yesterday..."
              className="block w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] bg-slate-50/60"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !symptoms.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs shadow-md shadow-teal-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {loading ? (
              <span>Analyzing symptoms...</span>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                <span>Analyze with Health AI</span>
              </>
            )}
          </button>
        </form>

        {result && (
          <div className="mt-5 p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 text-xs space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">AI Clinical Assessment</span>
              <UrgencyBadge urgency={result.urgency} size="sm" />
            </div>

            <p className="text-slate-700 leading-relaxed">
              <strong className="text-slate-900">Clinical Recommendation:</strong> {result.advice}
            </p>

            <div className="pt-2 border-t border-teal-200/60">
              <p className="font-bold text-teal-900 mb-1.5 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Questions to discuss with your doctor:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {result.questions.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AskHealthAIModal;
