const axios = require('axios');

/**
 * Intelligent Fallback Pre-visit Triage Analyzer
 */
function fallbackPreVisitSummary(symptomsText) {
  const text = (symptomsText || '').toLowerCase();

  let urgency = 'Low';
  if (
    text.includes('chest pain') ||
    text.includes('difficulty breathing') ||
    text.includes('shortness of breath') ||
    text.includes('severe') ||
    text.includes('unconscious') ||
    text.includes('stroke') ||
    text.includes('heavy bleeding') ||
    text.includes('high fever') ||
    text.includes('fracture')
  ) {
    urgency = 'High';
  } else if (
    text.includes('fever') ||
    text.includes('vomiting') ||
    text.includes('infection') ||
    text.includes('migraine') ||
    text.includes('persistent') ||
    text.includes('swelling') ||
    text.includes('acute') ||
    text.includes('dizziness')
  ) {
    urgency = 'Medium';
  }

  const cleanComplaint = symptomsText.trim().split('.')[0].slice(0, 120);

  const questions = [
    `How many days have you been experiencing "${cleanComplaint}"?`,
    'Are there any known allergies, chronic conditions, or medications currently being taken?',
    'Has the intensity of the discomfort changed with physical activity or rest?'
  ];

  return {
    urgency,
    chiefComplaint: cleanComplaint || 'General health consultation',
    questions
  };
}

/**
 * Intelligent Fallback Post-visit Patient Summary
 */
function fallbackPostVisitSummary(clinicalNotes) {
  if (!clinicalNotes || !clinicalNotes.trim()) {
    return 'Summary unavailable. Please consult your physician if you have any questions regarding your visit.';
  }

  return `### Patient-Friendly Visit Summary\n\n**Key Findings & Discussion:**\n${clinicalNotes}\n\n**Next Steps:**\n- Take all prescribed medications consistently as directed.\n- Stay well-hydrated, get adequate rest, and monitor your symptoms daily.\n- Seek immediate medical attention if symptoms worsen or if new severe symptoms arise.\n- Follow up with the clinic as recommended.`;
}

/**
 * Generate Pre-Visit Summary using Gemini, Ollama, or Heuristic Fallback
 */
const generatePreVisitSummary = async (symptomsText) => {
  if (!symptomsText || !symptomsText.trim()) {
    return fallbackPreVisitSummary('General consultation');
  }

  const prompt = `You are a clinical AI triage assistant. Analyse these patient symptoms and return ONLY a valid JSON object in this exact format with no extra text or markdown formatting:
{
  "urgency": "Low" or "Medium" or "High",
  "chiefComplaint": "Concise summary of main complaint (1 sentence)",
  "questions": ["Doctor diagnostic question 1", "Doctor diagnostic question 2", "Doctor diagnostic question 3"]
}

Symptoms: ${symptomsText}`;

  // 1. Try Google Gemini API if GEMINI_API_KEY is set
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        },
        { timeout: 8000 }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.urgency && parsed.chiefComplaint && Array.isArray(parsed.questions)) {
          return parsed;
        }
      }
    } catch (err) {
      console.log('Gemini API pre-visit call failed, trying next provider:', err.message);
    }
  }

  // 2. Try Ollama if OLLAMA_URL is configured
  if (process.env.OLLAMA_URL) {
    try {
      const response = await axios.post(
        process.env.OLLAMA_URL,
        {
          model: process.env.OLLAMA_MODEL || 'llama3',
          messages: [{ role: 'user', content: prompt }],
          stream: false
        },
        { timeout: 10000 }
      );

      const rawText = response.data?.message?.content;
      if (rawText) {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed;
        }
      }
    } catch (err) {
      console.log('Ollama pre-visit call failed, using intelligent fallback:', err.message);
    }
  }

  // 3. Fallback to resilient heuristic triage
  return fallbackPreVisitSummary(symptomsText);
};

/**
 * Generate Post-Visit Patient Summary
 */
const generatePostVisitSummary = async (clinicalNotes) => {
  if (!clinicalNotes || !clinicalNotes.trim()) {
    return fallbackPostVisitSummary('');
  }

  const prompt = `Convert these clinical doctor notes into a simple, patient-friendly summary.
Include a clear medication schedule and follow-up steps if mentioned. Write in plain, reassuring, easy-to-understand language.

Clinical notes: ${clinicalNotes}`;

  // 1. Try Gemini API
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        { timeout: 8000 }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) {
        return text.trim();
      }
    } catch (err) {
      console.log('Gemini post-visit summary failed, trying next provider:', err.message);
    }
  }

  // 2. Try Ollama
  if (process.env.OLLAMA_URL) {
    try {
      const response = await axios.post(
        process.env.OLLAMA_URL,
        {
          model: process.env.OLLAMA_MODEL || 'llama3',
          messages: [{ role: 'user', content: prompt }],
          stream: false
        },
        { timeout: 10000 }
      );

      const content = response.data?.message?.content;
      if (content && content.trim()) {
        return content.trim();
      }
    } catch (err) {
      console.log('Ollama post-visit summary failed, using intelligent fallback:', err.message);
    }
  }

  // 3. Fallback
  return fallbackPostVisitSummary(clinicalNotes);
};

module.exports = { generatePreVisitSummary, generatePostVisitSummary };