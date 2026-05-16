import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const SECTIONS = [
  { label: 'Your Deen' },
  { label: 'Your Struggles' },
  { label: 'Your Lifestyle' },
  { label: 'Your Goals' },
];

const QUESTIONS = [
  // ── Section 1 — Your Deen ────────────────────────────────────────────────────
  {
    id: 'q1', type: 'single',
    question: 'Which best describes you right now?',
    options: [
      'I used to practise but drifted away',
      'I practise sometimes but struggle with consistency',
      "I'm new to Islam and building from scratch",
      "I've never really practised but I want to start",
    ],
  },
  {
    id: 'q2', type: 'single',
    question: 'How consistent are you with your 5 daily prayers right now?',
    options: [
      'I pray all 5 every day',
      'I pray most of them',
      'I pray sometimes',
      'I rarely or never pray',
    ],
  },
  {
    id: 'q3', type: 'single',
    question: 'How is your relationship with Quran right now?',
    options: [
      'I read regularly',
      'I read occasionally',
      "I haven't read in a long time",
      'I never really read it',
    ],
  },
  {
    id: 'q4', type: 'single',
    question: 'How often do you attend the masjid?',
    options: [
      'Multiple times a week',
      'Jummah only',
      'Occasionally',
      'Rarely or never',
    ],
  },
  {
    id: 'q5', type: 'single',
    question: 'How would you describe your connection with Allah right now?',
    options: [
      'Close and growing',
      'Distant but I want to return',
      'I feel completely disconnected',
      "I'm not sure yet",
    ],
  },

  // ── Section 2 — Your Struggles ───────────────────────────────────────────────
  {
    id: 'q6', type: 'multi',
    question: 'What has stopped you from being consistent with your deen before?',
    hint: 'Select all that apply',
    options: [
      'Laziness',
      'Bad company',
      'My environment',
      'Mental health',
      'Not knowing where to start',
      "Feeling like Allah won't forgive me",
      'Life got too busy',
      'I lost motivation after a setback',
    ],
  },
  {
    id: 'q7', type: 'multi',
    question: 'Which prayers do you find hardest to pray consistently?',
    hint: 'Select all that apply',
    options: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
  },
  {
    id: 'q8', type: 'single',
    question: 'Do the people around you help your deen or pull you away from it?',
    options: [
      'They help me',
      "Mixed, some help and some don't",
      'Most pull me away',
      "I don't have anyone who cares about deen",
    ],
  },
  {
    id: 'q9', type: 'single',
    question: 'How do you feel after missing a prayer or falling short?',
    options: [
      'Extreme guilt that paralyses me',
      'Mild guilt but I move on',
      "I've become numb to it",
      "I'm not sure how I feel",
    ],
  },
  {
    id: 'q10', type: 'single',
    question: 'Have you tried to get consistent before and stopped?',
    options: [
      'Yes, many times',
      'Yes, once or twice',
      'No, this is my first real attempt',
    ],
  },

  // ── Section 3 — Your Lifestyle ───────────────────────────────────────────────
  {
    id: 'q11', type: 'single',
    question: 'How many hours of free time do you have on a typical day?',
    options: ['Less than 1 hour', '1–2 hours', '3–4 hours', 'More than 4 hours'],
  },
  {
    id: 'q12', type: 'multi',
    question: 'Which days are you most free?',
    options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  {
    id: 'q13', type: 'text',
    question: 'What are your top 3–5 favourite places or things you do in your free time?',
    placeholder: 'e.g. gym, mall, café, gaming, football',
  },
  {
    id: 'q14', type: 'single',
    question: 'How would you describe your social life right now?',
    options: [
      'I mostly stay home',
      'I go out occasionally',
      'I go out regularly',
      'I have a very active social life',
    ],
  },
  {
    id: 'q15', type: 'single',
    question: 'Do the places you spend time in make it harder to stay close to Allah?',
    options: ['Yes, often', 'Sometimes', 'Not really', "I'm not sure"],
  },

  // ── Section 4 — Your Goals ───────────────────────────────────────────────────
  {
    id: 'q16', type: 'text',
    question: 'What is the one thing you most want to change about your deen right now?',
    placeholder: 'Be honest. There are no wrong answers here.',
  },
  {
    id: 'q17', type: 'single',
    question: 'How hard do you want to be pushed with your weekly tasks?',
    options: [
      "Gentle, small steps. I'm fragile right now",
      "Moderate, I'm ready to be challenged",
      'Challenging, push me hard. I need accountability',
    ],
  },
  {
    id: 'q18', type: 'multi',
    question: 'Which of these would you most like to build as a habit?',
    hint: 'Select all that apply',
    options: [
      'Consistent prayer',
      'Daily Quran',
      'Regular dhikr',
      'Masjid attendance',
      'Lowering my gaze',
      'Cutting bad habits',
      'Better company',
      'Morning and evening adhkar',
    ],
  },
  {
    id: 'q19', type: 'text',
    question: 'What does success look like for you in 90 days?',
    placeholder: 'Describe it freely. How would you feel, what would be different...',
  },
  {
    id: 'q20', type: 'text',
    question: 'What is your intention for joining Path of Sabr?',
    placeholder: 'e.g. get closer to Allah, fix my prayers, prepare for Ramadan, change my life',
  },
];

// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step, onBack }) {
  const pct = Math.round(((step + 1) / 20) * 100);
  const sectionIdx = Math.floor(step / 5);
  const questionInSection = (step % 5) + 1;
  return (
    <div className="px-5 pt-12 pb-4">
      {/* Back button row */}
      <div className="mb-3 h-6 flex items-center">
        {step > 0 && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70 active:opacity-50"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <ChevronLeft size={14} strokeWidth={2} />
            Back
          </button>
        )}
      </div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-0.5" style={{ color: 'rgba(201,149,42,0.75)' }}>
            Section {sectionIdx + 1} of 4 — {SECTIONS[sectionIdx].label}
          </p>
          <p className="text-[11px] text-white/30">Question {questionInSection} of 5</p>
        </div>
        <span className="text-xs font-semibold" style={{ color: '#C9952A' }}>{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: '#C9952A' }}
        />
      </div>
    </div>
  );
}

// ── Single select ─────────────────────────────────────────────────────────────
function SingleSelect({ options, value, onChange }) {
  return (
    <div className="space-y-3">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="w-full text-left px-5 py-4 rounded-2xl border transition-colors text-sm leading-snug"
          style={
            value === opt
              ? { background: 'rgba(201,149,42,0.12)', borderColor: '#C9952A', color: '#C9952A' }
              : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }
          }
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Multi select ──────────────────────────────────────────────────────────────
function MultiSelect({ options, value = [], onChange, maxSelect }) {
  const toggle = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      if (maxSelect && value.length >= maxSelect) return; // at cap — ignore tap
      onChange([...value, opt]);
    }
  };

  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const selected = value.includes(opt);
        const atCap = maxSelect && value.length >= maxSelect && !selected;
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            disabled={atCap}
            className="w-full text-left px-5 py-4 rounded-2xl border transition-colors text-sm leading-snug flex items-start gap-3 disabled:opacity-35 disabled:cursor-default"
            style={
              selected
                ? { background: 'rgba(201,149,42,0.12)', borderColor: '#C9952A', color: '#C9952A' }
                : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }
            }
          >
            <div
              className="mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors"
              style={
                selected
                  ? { background: '#C9952A', borderColor: '#C9952A' }
                  : { borderColor: 'rgba(255,255,255,0.25)' }
              }
            >
              {selected && <Check size={11} strokeWidth={3} className="text-white" />}
            </div>
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({
    q1: '',  q2: '',  q3: '',  q4: '',  q5: '',
    q6: [],  q7: [],  q8: '',  q9: '',  q10: '',
    q11: '', q12: [], q13: '', q14: '', q15: '',
    q16: '', q17: '', q18: [], q19: '', q20: '',
  });
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);

  // Skip onboarding if already completed
  useEffect(() => {
    if (!user) return;
    supabase
      .from('onboarding_responses')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) navigate('/dashboard', { replace: true });
        else setChecking(false);
      });
  }, [user]);

  const update = (key, val) => setResponses((r) => ({ ...r, [key]: val }));

  const canContinue = () => {
    const q = QUESTIONS[step];
    if (!q) return false;
    const val = responses[q.id];
    if (q.type === 'single') return !!val;
    if (q.type === 'multi') return Array.isArray(val) && val.length > 0;
    if (q.type === 'text') return typeof val === 'string' && val.trim().length > 0;
    return false;
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleNext = async () => {
    if (step < 19) {
      setStep((s) => s + 1);
      return;
    }
    // Final question — save everything
    setSaving(true);
    localStorage.setItem(`onboarding_done_${user.id}`, 'true');
    await supabase.from('onboarding_responses').upsert(
      { user_id: user.id, ...responses, completed_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    setSaving(false);
    setStep(20);
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020c07' }}>
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: '#C9952A', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  // ── Completion screen ──────────────────────────────────────────────────────
  if (step === 20) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: '#020c07' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(201,149,42,0.15)' }}
        >
          <Check size={28} style={{ color: '#C9952A' }} />
        </div>
        <p className="text-white/50 text-xs font-bold tracking-widest uppercase mb-3">All done</p>
        <h1 className="text-2xl font-bold text-white mb-2">Jazakallah khayrun.</h1>
        <p className="text-white/50 text-base mb-10">Your companion is ready for you.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary text-white font-semibold px-10 py-4 rounded-2xl"
        >
          Enter Path of Sabr
        </button>
      </div>
    );
  }

  // ── Survey ────────────────────────────────────────────────────────────────
  const q = QUESTIONS[step];

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#020c07' }}>

      {/* Fixed progress bar */}
      <div className="flex-shrink-0">
        <ProgressBar step={step} onBack={handleBack} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32">
        <h2 className="text-xl font-bold text-white leading-snug" style={{ marginBottom: q.hint ? '8px' : '24px' }}>
          {q.question}
        </h2>

        {q.hint && (
          <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>{q.hint}</p>
        )}

        {q.type === 'single' && (
          <SingleSelect
            options={q.options}
            value={responses[q.id]}
            onChange={(v) => update(q.id, v)}
          />
        )}

        {q.type === 'multi' && (
          <MultiSelect
            options={q.options}
            value={responses[q.id] || []}
            onChange={(v) => update(q.id, v)}
            maxSelect={q.maxSelect}
          />
        )}

        {q.type === 'text' && (
          <textarea
            value={responses[q.id]}
            onChange={(e) => update(q.id, e.target.value)}
            placeholder={q.placeholder}
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder-white/25 text-sm resize-none focus:outline-none transition-colors"
            onFocus={(e) => (e.target.style.borderColor = 'rgba(201,149,42,0.5)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        )}
      </div>

      {/* Fixed bottom button */}
      <div
        className="flex-shrink-0 px-5 pb-10 pt-4"
        style={{ background: 'linear-gradient(to top, #020c07 70%, transparent)' }}
      >
        <button
          onClick={handleNext}
          disabled={!canContinue() || saving}
          className="btn-primary w-full py-4 rounded-2xl text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : step === 19 ? 'Complete' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
