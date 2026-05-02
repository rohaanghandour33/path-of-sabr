import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const QUESTIONS = [
  {
    step: 0, id: 'q1', type: 'single',
    question: 'Why did you join Path of Sabr?',
    options: [
      'I fell away from my deen and want to come back',
      "I'm a revert building my practice from scratch",
      'I want to get closer to Allah for the first time',
      "I'm already practicing but want to go deeper",
    ],
  },
  {
    step: 1, id: 'q2', type: 'single',
    question: 'Do you struggle with your prayers?',
    options: ['Yes', 'No'],
    subQuestion: {
      id: 'q2b', condition: 'Yes', type: 'multi',
      label: 'Which prayers do you struggle with?',
      options: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'All of them'],
    },
  },
  {
    step: 2, id: 'q3', type: 'multi',
    question: 'What pulls you away from your deen most?',
    options: [
      'FOMO and social pressure',
      "Family environment doesn't support my deen",
      "Bad habits I can't break",
      'Lack of motivation and consistency',
      "I don't know where to start",
      'Screens and social media',
      'Relationships',
    ],
  },
  {
    step: 3, id: 'q4', type: 'multi',
    question: 'How would you describe yourself as a person?',
    options: [
      'I care deeply but struggle to act on it',
      "I'm easily influenced by my environment",
      "I'm disciplined when I have a system",
      'I tend to go all in or nothing',
      'I struggle with guilt and shame cycles',
      "I've tried to change before but keep falling back",
    ],
  },
  {
    step: 4, id: 'q5', type: 'text', optional: true,
    question: 'Is there a specific situation making your deen harder right now?',
    placeholder: "e.g. my friends don't understand why I'm changing, my family isn't Muslim, I'm dealing with something I'm ashamed of...",
    footnote: 'This is private. Only your AI companion can see this.',
  },
  {
    step: 5, id: 'q6', type: 'text',
    question: 'If you were fully on your deen, what would your life look like?',
    placeholder: 'Describe it freely — how would you feel, what would be different, what would your relationship with Allah look like...',
  },
  {
    step: 6, id: 'q7', type: 'text',
    question: 'What is one thing you want Path of Sabr to help you with most?',
    placeholder: 'Be honest — there are no wrong answers here.',
  },
  {
    step: 7, id: 'q8', type: 'single',
    question: 'How would you describe yourself right now?',
    options: [
      'A struggling Muslim trying to find my way back',
      'A revert who needs guidance from the beginning',
      "A Muslim who knows the deen but can't make it stick",
      'Someone who is genuinely lost but wants to find Allah',
    ],
  },
];

function ProgressBar({ step }) {
  const pct = Math.round(((step + 1) / 8) * 100);
  return (
    <div className="px-5 pt-12 pb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white/40">Question {step + 1} of 8</span>
        <span className="text-xs font-semibold" style={{ color: '#C9952A' }}>{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: '#C9952A' }} />
      </div>
    </div>
  );
}

function SingleSelect({ options, value, onChange }) {
  return (
    <div className="space-y-3">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="w-full text-left px-5 py-4 rounded-2xl border transition-colors text-sm leading-snug"
          style={value === opt
            ? { background: 'rgba(201,149,42,0.12)', borderColor: '#C9952A', color: '#C9952A' }
            : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function MultiSelect({ options, value = [], onChange }) {
  const toggle = (opt) =>
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const selected = value.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className="w-full text-left px-5 py-4 rounded-2xl border transition-colors text-sm leading-snug flex items-start gap-3"
            style={selected
              ? { background: 'rgba(201,149,42,0.12)', borderColor: '#C9952A', color: '#C9952A' }
              : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
          >
            <div
              className="mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors"
              style={selected
                ? { background: '#C9952A', borderColor: '#C9952A' }
                : { borderColor: 'rgba(255,255,255,0.25)' }}
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

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({
    q1: '', q2: '', q2b: [], q3: [], q4: [], q5: '', q6: '', q7: '', q8: '',
  });
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);

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
    if (q.type === 'single') {
      if (!val) return false;
      if (q.subQuestion && val === q.subQuestion.condition) return (responses[q.subQuestion.id] || []).length > 0;
      return true;
    }
    if (q.type === 'multi') return (val || []).length > 0;
    return true;
  };

  const handleNext = async () => {
    if (step < 7) { setStep((s) => s + 1); return; }
    setSaving(true);
    localStorage.setItem(`onboarding_done_${user.id}`, 'true');
    await supabase.from('onboarding_responses').upsert(
      { user_id: user.id, ...responses, completed_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    setSaving(false);
    setStep(8);
  };

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#020c07' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C9952A', borderTopColor: 'transparent' }} />
    </div>
  );

  if (step === 8) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#020c07' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(201,149,42,0.15)' }}>
        <Check size={28} style={{ color: '#C9952A' }} />
      </div>
      <p className="text-white/50 text-xs font-bold tracking-widest uppercase mb-3">All done</p>
      <h1 className="text-2xl font-bold text-white mb-2">Jazakallah khayrun.</h1>
      <p className="text-white/50 text-base mb-10">Your companion is ready for you.</p>
      <button onClick={() => navigate('/dashboard')} className="btn-primary text-white font-semibold px-10 py-4 rounded-2xl">
        Enter Path of Sabr
      </button>
    </div>
  );

  const q = QUESTIONS[step];
  const q2onChange = (v) => setResponses((r) => ({ ...r, q2: v, q2b: v === 'No' ? [] : r.q2b }));

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#020c07' }}>
      {/* Fixed progress bar */}
      <div className="flex-shrink-0">
        <ProgressBar step={step} />
      </div>

      {/* Scrollable content — no layout shift */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32">
        <h2 className="text-xl font-bold text-white mb-6 leading-snug">{q.question}</h2>

        {q.type === 'single' && (
          <>
            <SingleSelect
              options={q.options}
              value={responses[q.id]}
              onChange={q.id === 'q2' ? q2onChange : (v) => update(q.id, v)}
            />
            {q.subQuestion && responses[q.id] === q.subQuestion.condition && (
              <div className="mt-6">
                <div className="h-px bg-white/5 mb-6" />
                <p className="text-sm font-medium text-white/50 mb-3">{q.subQuestion.label}</p>
                <MultiSelect
                  options={q.subQuestion.options}
                  value={responses[q.subQuestion.id]}
                  onChange={(v) => update(q.subQuestion.id, v)}
                />
              </div>
            )}
          </>
        )}

        {q.type === 'multi' && (
          <MultiSelect options={q.options} value={responses[q.id] || []} onChange={(v) => update(q.id, v)} />
        )}

        {q.type === 'text' && (
          <div>
            <textarea
              value={responses[q.id]}
              onChange={(e) => update(q.id, e.target.value)}
              placeholder={q.placeholder}
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder-white/25 text-sm resize-none focus:outline-none transition-colors"
              onFocus={e => e.target.style.borderColor = 'rgba(201,149,42,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            {q.footnote && (
              <p className="mt-3 text-xs text-white/30 flex items-center gap-1.5">
                <span>🔒</span>{q.footnote}
              </p>
            )}
            {q.optional && <p className="mt-2 text-xs text-white/20">Optional — tap Continue to skip</p>}
          </div>
        )}
      </div>

      {/* Fixed bottom button — never moves */}
      <div className="flex-shrink-0 px-5 pb-10 pt-4" style={{ background: 'linear-gradient(to top, #020c07 70%, transparent)' }}>
        <button
          onClick={handleNext}
          disabled={!canContinue() || saving}
          className="btn-primary w-full py-4 rounded-2xl text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : step === 7 ? 'Complete' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
