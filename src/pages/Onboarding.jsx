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

// ── Question emoji map ────────────────────────────────────────────────────────
const Q_EMOJI = {
  q1: '🪞', q2: '🕌', q3: '📖', q4: '🤲', q5: '💚',
  q6: '🧱', q7: '🌙', q8: '👥', q9: '💭', q10: '🔄',
  q11: '⏱️', q12: '📅', q13: '🌍', q14: '👋', q15: '🏙️',
  q16: '✨', q17: '💪', q18: '🌱', q19: '🎯', q20: '🤲',
};

// ── Card style helper ─────────────────────────────────────────────────────────
function getCardStyle(selected, hovered) {
  if (selected) return {
    background: '#0a2e22',
    borderTop: '1px solid rgba(29,158,117,0.3)',
    borderRight: '1px solid rgba(29,158,117,0.3)',
    borderBottom: '1px solid rgba(29,158,117,0.3)',
    borderLeft: '3px solid #1D9E75',
    borderRadius: '14px',
    boxShadow: '-3px 0 18px rgba(29,158,117,0.18)',
  };
  if (hovered) return {
    background: 'rgba(29,158,117,0.06)',
    borderTop: '1px solid rgba(255,255,255,0.09)',
    borderRight: '1px solid rgba(255,255,255,0.09)',
    borderBottom: '1px solid rgba(255,255,255,0.09)',
    borderLeft: '3px solid rgba(29,158,117,0.65)',
    borderRadius: '14px',
    boxShadow: '-2px 0 12px rgba(29,158,117,0.12)',
  };
  return {
    background: 'rgba(255,255,255,0.03)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    borderLeft: '3px solid rgba(29,158,117,0.28)',
    borderRadius: '14px',
  };
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step, onBack }) {
  const pct = Math.round(((step + 1) / 20) * 100);
  const sectionIdx = Math.floor(step / 5);
  const questionInSection = (step % 5) + 1;

  return (
    <div className="px-5 pt-10 pb-5">
      {/* Back button */}
      <div className="mb-5 h-6 flex items-center">
        {step > 0 && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70 active:opacity-50"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            <ChevronLeft size={14} strokeWidth={2} />
            Back
          </button>
        )}
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span style={{ color: 'rgba(201,149,42,0.55)', fontSize: '11px' }}>✦</span>
          <div className="h-px w-5 rounded-full" style={{ background: 'rgba(201,149,42,0.3)' }} />
          <div>
            <p
              className="text-sm font-bold tracking-wider uppercase leading-tight"
              style={{ color: '#C9952A' }}
            >
              Section {sectionIdx + 1} of 4 — {SECTIONS[sectionIdx].label}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Question {questionInSection} of 5
            </p>
          </div>
        </div>
        <span className="text-sm font-bold tabular-nums" style={{ color: '#C9952A' }}>{pct}%</span>
      </div>

      {/* Progress bar — 6px, teal fill with glow */}
      <div
        className="rounded-full overflow-hidden"
        style={{ height: '6px', background: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: '#1D9E75',
            boxShadow: '0 0 10px rgba(29,158,117,0.75)',
          }}
        />
      </div>
    </div>
  );
}

// ── Single select ─────────────────────────────────────────────────────────────
function SingleSelect({ options, value, onChange }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            onMouseEnter={() => setHovered(opt)}
            onMouseLeave={() => setHovered(null)}
            className="w-full text-left px-5 py-4 transition-all duration-150 flex items-center justify-between gap-4"
            style={getCardStyle(selected, hovered === opt)}
          >
            <span
              className="text-sm leading-snug font-medium"
              style={{ color: selected ? '#f0ede6' : '#c4d4cc' }}
            >
              {opt}
            </span>
            {selected && (
              <div
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: '#1D9E75', boxShadow: '0 0 8px rgba(29,158,117,0.5)' }}
              >
                <Check size={11} strokeWidth={3} style={{ color: '#020c07' }} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Multi select ──────────────────────────────────────────────────────────────
function MultiSelect({ options, value = [], onChange, maxSelect }) {
  const [hovered, setHovered] = useState(null);

  const toggle = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      if (maxSelect && value.length >= maxSelect) return;
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
            onMouseEnter={() => !atCap && setHovered(opt)}
            onMouseLeave={() => setHovered(null)}
            disabled={atCap}
            className="w-full text-left px-5 py-4 transition-all duration-150 flex items-center gap-3 disabled:opacity-30 disabled:cursor-default"
            style={getCardStyle(selected, hovered === opt)}
          >
            {/* Checkbox */}
            <div
              className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all"
              style={
                selected
                  ? { background: '#1D9E75', border: '1.5px solid #1D9E75', boxShadow: '0 0 8px rgba(29,158,117,0.4)' }
                  : { border: '1.5px solid rgba(255,255,255,0.2)', background: 'transparent' }
              }
            >
              {selected && <Check size={11} strokeWidth={3} style={{ color: '#020c07' }} />}
            </div>
            <span
              className="text-sm leading-snug font-medium"
              style={{ color: selected ? '#f0ede6' : '#c4d4cc' }}
            >
              {opt}
            </span>
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
          style={{ borderColor: 'rgba(29,158,117,0.3)', borderTopColor: '#1D9E75' }}
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
          className="fixed inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(8,80,65,0.2) 0%, transparent 70%)' }}
        />
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6 relative"
          style={{ background: 'rgba(29,158,117,0.15)', boxShadow: '0 0 40px rgba(29,158,117,0.2)' }}
        >
          <Check size={28} style={{ color: '#1D9E75' }} />
        </div>
        <p className="text-white/50 text-xs font-bold tracking-widest uppercase mb-3">All done</p>
        <h1 className="text-2xl font-bold text-white mb-2">Jazakallah khayrun.</h1>
        <p className="text-white/50 text-base mb-10">Your companion is ready for you.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="font-bold px-10 py-4 rounded-2xl text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{
            background: '#1D9E75',
            color: '#020c07',
            boxShadow: '0 4px 24px rgba(29,158,117,0.4)',
          }}
        >
          Enter Path of Sabr →
        </button>
      </div>
    );
  }

  // ── Survey ────────────────────────────────────────────────────────────────
  const q = QUESTIONS[step];
  const ready = canContinue();

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#020c07' }}>

      {/* Ambient background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 85% 55% at 50% 58%, rgba(8,80,65,0.22) 0%, transparent 70%)',
        }}
      />

      {/* Fixed progress bar */}
      <div className="flex-shrink-0 relative">
        <div className="max-w-[600px] mx-auto w-full">
          <ProgressBar step={step} onBack={handleBack} />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-36">
        <div className="max-w-[600px] mx-auto w-full px-5 pt-6">

          {/* Question */}
          <div className="flex items-start gap-3 mb-7">
            <span className="text-2xl flex-shrink-0 mt-0.5 leading-none">{Q_EMOJI[q.id]}</span>
            <h2
              className="text-[1.5rem] font-bold leading-snug tracking-tight"
              style={{ color: '#f0ede6', marginBottom: q.hint ? '0' : undefined }}
            >
              {q.question}
            </h2>
          </div>

          {q.hint && (
            <p className="text-xs mb-5 ml-9" style={{ color: 'rgba(255,255,255,0.3)' }}>{q.hint}</p>
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
              className="w-full rounded-2xl px-5 py-4 text-sm resize-none focus:outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                borderRight: '1px solid rgba(255,255,255,0.07)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                borderLeft: '3px solid rgba(29,158,117,0.3)',
                borderRadius: '14px',
                color: '#f0ede6',
              }}
              onFocus={(e) => {
                e.target.style.borderLeftColor = '#1D9E75';
                e.target.style.background = 'rgba(29,158,117,0.04)';
                e.target.style.boxShadow = '-3px 0 16px rgba(29,158,117,0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderLeftColor = 'rgba(29,158,117,0.3)';
                e.target.style.background = 'rgba(255,255,255,0.03)';
                e.target.style.boxShadow = 'none';
              }}
            />
          )}
        </div>
      </div>

      {/* Fixed bottom button */}
      <div
        className="flex-shrink-0 pt-4 pb-10 relative"
        style={{ background: 'linear-gradient(to top, #020c07 65%, transparent)' }}
      >
        <div className="max-w-[600px] mx-auto w-full px-5">
          <button
            onClick={handleNext}
            disabled={!ready || saving}
            className="w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200 disabled:cursor-not-allowed active:scale-[0.99]"
            style={
              ready && !saving
                ? {
                    background: '#1D9E75',
                    color: '#020c07',
                    boxShadow: '0 4px 24px rgba(29,158,117,0.4)',
                    opacity: 1,
                  }
                : {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.2)',
                    opacity: 1,
                  }
            }
          >
            {saving ? 'Saving...' : step === 19 ? 'Complete →' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}
