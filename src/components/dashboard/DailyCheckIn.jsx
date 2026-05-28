import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// ── Iman level config ──────────────────────────────────────────────────────────
const IMAN_LEVELS = [
  { n: 1, label: 'Distant',    emoji: '🌑', glow: 'rgba(255,255,255,0.06)' },
  { n: 2, label: 'Low',        emoji: '🌒', glow: 'rgba(201,149,42,0.18)' },
  { n: 3, label: 'Neutral',    emoji: '🌓', glow: 'rgba(201,149,42,0.28)' },
  { n: 4, label: 'Close',      emoji: '🌔', glow: 'rgba(29,158,117,0.28)' },
  { n: 5, label: 'Very close', emoji: '🌕', glow: 'rgba(29,158,117,0.5)' },
];

// ── Question bank ─────────────────────────────────────────────────────────────
const QUESTION_BANK = {
  connection: [
    'How connected do you feel to Allah right now?',
    'How close does your heart feel to Allah today?',
    'How present does Allah feel in your life at this moment?',
    'How alive does your iman feel right now?',
    'Does your heart feel near to Allah or far today?',
  ],
  struggles: [
    { question: 'What is your biggest deen struggle today?',       options: ['Prayer consistency','FOMO','Family pressure','Feeling lost','Lack of knowledge'] },
    { question: 'What is weighing on your deen most right now?',   options: ['Missing prayers','Distractions','Negative company','Doubt','Low motivation'] },
    { question: 'What has been hardest spiritually this week?',    options: ['Staying consistent','Social media','Loneliness','Overthinking','Repeated sins'] },
    { question: 'What is pulling you away from deen most?',        options: ['Work / studies','Phone habits','Friends / environment','Mental health','Laziness'] },
    { question: 'Which area of your deen needs most attention?',   options: ['Salah','Quran','Dhikr','Character','Knowledge'] },
  ],
  heartStates: [
    { question: 'How would you describe your heart right now?',    options: ['🕊️ At peace','😟 Anxious','😔 Guilty','🌱 Hopeful','😶 Empty','🤲 Grateful'] },
    { question: 'What best describes your heart today?',            options: ['😌 Calm','🪨 Heavy','😤 Restless','😊 Content','🥀 Numb','💭 Yearning'] },
    { question: 'How does your inner self feel right now?',         options: ['✨ Light','⛓️ Burdened','😵 Confused','💪 Determined','💔 Broken','🫶 Loved'] },
    { question: 'What emotion sits in your chest right now?',       options: ['🙏 Gratitude','😨 Fear','😞 Regret','💫 Longing','😄 Happiness','😢 Sadness'] },
    { question: 'What captures your spiritual mood today?',         options: ['🎯 Focused','🌀 Distracted','🌟 Inspired','😴 Tired','🔄 Repentant','🌸 Joyful'] },
  ],
  pulledAway: [
    'Did anything pull you away from your deen today?',
    'Were there moments today where you felt distant from Allah?',
    'Did anything make it harder to remember Allah today?',
    'Did you notice anything cutting your connection to Allah?',
    'Was there a moment where your focus on deen slipped?',
  ],
  needs: [
    { question: 'What do you need most right now?',                 options: ['Motivation','Guidance','Accountability','Just to be heard',"Allah's mercy"] },
    { question: 'What would help your heart the most today?',       options: ["Du'a",'Someone to talk to','A reminder','Quiet time','Direction'] },
    { question: 'What would strengthen your iman most right now?',  options: ['Quran','Dhikr','Good company','Knowledge','Tawbah'] },
    { question: 'What does your soul need at this moment?',         options: ['Peace','Clarity','Courage','Comfort','A fresh start'] },
    { question: 'What would make the biggest difference today?',    options: ['Consistency','Forgiveness','Support','A sign','More time'] },
  ],
};

function getDayOfYear() {
  const now = new Date();
  return Math.floor((now - new Date(now.getFullYear(), 0, 1)) / 86400000);
}

function getDailyQuestions() {
  const d = getDayOfYear();
  const pick = (arr) => arr[d % arr.length];
  const sV = pick(QUESTION_BANK.struggles);
  const hV = pick(QUESTION_BANK.heartStates);
  const nV = pick(QUESTION_BANK.needs);
  return [
    { id: 0, type: 'scale',  field: 'connection',  question: pick(QUESTION_BANK.connection) },
    { id: 1, type: 'multi',  field: 'struggles',   question: sV.question, options: sV.options },
    { id: 2, type: 'multi',  field: 'heartStates', question: hV.question, options: hV.options },
    { id: 3, type: 'yesno',  field: 'pulledAway',  question: pick(QUESTION_BANK.pulledAway) },
    { id: 4, type: 'multi',  field: 'needs',       question: nV.question, options: nV.options },
  ];
}

const QUESTIONS = getDailyQuestions();

const CARD_STYLE = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.28)',
};

export default function DailyCheckIn({ userId, weekOffset = 0, customRange = null, onUpdate }) {
  const [qStep, setQStep]   = useState(0);
  const [data, setData]     = useState({ connection: 0, struggles: [], heartStates: [], pulledAway: null, pulledAwayText: '', needs: [] });
  const [done, setDone]     = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pastSummary, setPastSummary] = useState(null);
  const [fade, setFade]     = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!userId) return;
    setLoading(true); setPastSummary(null); setDone(false);
    const isReadOnly = customRange || weekOffset > 0;
    if (!isReadOnly) {
      supabase.from('moods').select('id').eq('user_id', userId).eq('date', today).maybeSingle()
        .then(({ data: e }) => { if (e) setDone(true); setLoading(false); });
      return;
    }
    let startStr, endStr;
    if (customRange) { startStr = customRange.start; endStr = customRange.end; }
    else {
      const end = new Date(); end.setHours(0,0,0,0); end.setDate(end.getDate() - weekOffset * 7);
      const start = new Date(end); start.setDate(end.getDate() - 6);
      startStr = start.toISOString().split('T')[0]; endStr = end.toISOString().split('T')[0];
    }
    supabase.from('moods').select('mood_score').eq('user_id', userId).gte('date', startStr).lte('date', endStr)
      .then(({ data: rows }) => {
        const r = rows || [];
        const count = r.length;
        const avgConn = count > 0 ? +(r.reduce((a, b) => a + (b.mood_score || 0), 0) / count).toFixed(1) : null;
        setPastSummary({ count, avgConn }); setLoading(false);
      });
  }, [userId, weekOffset, customRange?.start, customRange?.end]);

  const update      = (field, val) => setData(d => ({ ...d, [field]: val }));
  const toggleMulti = (field, val) => setData(d => ({ ...d, [field]: d[field].includes(val) ? d[field].filter(v => v !== val) : [...d[field], val] }));

  const canNext = () => {
    const q = QUESTIONS[qStep];
    if (q.type === 'scale') return data.connection > 0;
    if (q.type === 'multi') return data[q.field].length > 0;
    if (q.type === 'yesno') return data.pulledAway !== null;
    return true;
  };

  const advance = () => {
    setFade(false);
    setTimeout(() => { setQStep(s => s + 1); setFade(true); }, 150);
  };

  const handleNext = async () => {
    if (qStep < QUESTIONS.length - 1) { advance(); return; }
    setSaving(true);
    const { error } = await supabase.from('moods').upsert(
      {
        user_id:    userId,
        date:       today,
        mood_score: data.connection,
        notes:      JSON.stringify({
          heartStates:     data.heartStates,
          needs:           data.needs,
          struggles:       data.struggles,
          pulledAway:      data.pulledAway,
          pulledAwayText:  data.pulledAwayText,
        }),
      },
      { onConflict: 'user_id,date' }
    );
    setSaving(false);
    if (error) { console.error('[DailyCheckIn] upsert failed:', error.message); return; }
    setDone(true); onUpdate?.();
  };

  if (loading) return null;

  // ── Read-only past view ────────────────────────────────────────────────────
  if (customRange || weekOffset > 0) {
    const { count, avgConn } = pastSummary || { count: 0, avgConn: null };
    const subtitle = customRange
      ? `${Math.round((new Date(customRange.end + 'T12:00:00') - new Date(customRange.start + 'T12:00:00')) / 86400000) + 1} day period`
      : '7 day week';
    const level = avgConn ? IMAN_LEVELS[Math.round(avgConn) - 1] : null;

    return (
      <div className="rounded-3xl p-6 h-full flex flex-col" style={CARD_STYLE}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Daily Check-in</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{subtitle}</p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}>View only</span>
        </div>
        {count === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>No check-ins this period</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl px-4 py-3.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Check-ins logged</p>
              <p className="text-white font-bold text-lg">{count}</p>
            </div>
            {level && (
              <div className="flex items-center justify-between rounded-2xl px-4 py-3.5" style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.1)' }}>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Avg iman level</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{level.emoji}</span>
                  <p className="font-bold" style={{ color: '#1D9E75' }}>{avgConn}<span className="text-xs font-normal" style={{ color: 'rgba(255,255,255,0.25)' }}>/5</span></p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Done state ─────────────────────────────────────────────────────────────
  if (done) {
    const level = data.connection > 0 ? IMAN_LEVELS[data.connection - 1] : IMAN_LEVELS[2];
    return (
      <div className="rounded-3xl p-6 h-full flex flex-col" style={CARD_STYLE}>
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.25)' }}>Daily Check-in</p>

        <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
          {/* Moon orb */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{ background: level.glow, boxShadow: `0 0 40px ${level.glow}` }}
          >
            {level.emoji}
          </div>

          <div>
            <p className="text-white font-extrabold text-lg mb-1">Jazakallah khayran</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Check-in complete · Come back tomorrow</p>
          </div>

          {/* Connection badge */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.15)' }}>
            <span className="text-sm">{level.emoji}</span>
            <span className="text-sm font-semibold" style={{ color: '#1D9E75' }}>{level.label}</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>connection today</span>
          </div>

          {/* Heart state tags */}
          {data.heartStates.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {data.heartStates.map(h => (
                <span key={h} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-[10px] mt-4 arabic-text" style={{ color: 'rgba(201,149,42,0.3)' }}>
          وَلَذِكْرُ اللَّهِ أَكْبَرُ
        </p>
        <p className="text-center text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.1)' }}>
          The remembrance of Allah is greatest
        </p>
      </div>
    );
  }

  // ── Interactive check-in ───────────────────────────────────────────────────
  const q = QUESTIONS[qStep];

  return (
    <div className="rounded-3xl p-6 h-full flex flex-col" style={CARD_STYLE}>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Daily Check-in</p>
        <span className="text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.2)' }}>{qStep + 1} of {QUESTIONS.length}</span>
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-1.5 mb-5">
        {QUESTIONS.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-300"
            style={{
              width: i === qStep ? '20px' : '6px',
              height: '6px',
              background: i < qStep ? '#1D9E75' : i === qStep ? '#1D9E75' : 'rgba(255,255,255,0.1)',
              opacity: i < qStep ? 0.5 : 1,
            }}
          />
        ))}
      </div>

      {/* Question */}
      <p
        className="text-white text-sm font-semibold leading-snug mb-5 flex-shrink-0 transition-opacity duration-150"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {q.question}
      </p>

      {/* Answer area */}
      <div className="flex-1 overflow-y-auto transition-opacity duration-150" style={{ opacity: fade ? 1 : 0 }}>

        {/* ── Scale: iman meter ── */}
        {q.type === 'scale' && (
          <div className="flex justify-between gap-2">
            {IMAN_LEVELS.map(({ n, label, emoji, glow }) => {
              const active = data.connection === n;
              return (
                <button
                  key={n}
                  onClick={() => update('connection', n)}
                  className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-200"
                  style={active ? {
                    background: glow,
                    border: `1px solid ${glow}`,
                    boxShadow: `0 0 20px ${glow}`,
                    transform: 'scale(1.05)',
                  } : {
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <span className="text-2xl" style={{ filter: active ? 'none' : 'grayscale(0.6) opacity(0.5)' }}>{emoji}</span>
                  <span className="text-[9px] font-bold text-center leading-tight" style={{ color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)' }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Multi-select chips ── */}
        {q.type === 'multi' && (
          <div className="flex flex-wrap gap-2">
            {q.options.map((opt) => {
              const active = data[q.field].includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleMulti(q.field, opt)}
                  className="px-3.5 py-2 rounded-2xl text-xs font-medium transition-all duration-150"
                  style={active ? {
                    background: 'rgba(29,158,117,0.15)',
                    border: '1px solid rgba(29,158,117,0.4)',
                    color: '#1D9E75',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.45)',
                  }}
                >
                  {opt}
                </button>
              );
            })}
            <p className="w-full text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Select all that apply</p>
          </div>
        )}

        {/* ── Yes / No ── */}
        {q.type === 'yesno' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Yes', val: true,  emoji: '😔' },
                { label: 'No',  val: false, emoji: '✨' },
              ].map(({ label, val, emoji }) => {
                const active = data.pulledAway === val;
                return (
                  <button
                    key={label}
                    onClick={() => update('pulledAway', val)}
                    className="flex flex-col items-center gap-2 py-5 rounded-2xl text-sm font-bold transition-all duration-150"
                    style={active ? {
                      background: val ? 'rgba(229,115,104,0.12)' : 'rgba(29,158,117,0.12)',
                      border: `1px solid ${val ? 'rgba(229,115,104,0.35)' : 'rgba(29,158,117,0.35)'}`,
                      color: val ? '#e57368' : '#1D9E75',
                    } : {
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <span className="text-2xl" style={{ filter: active ? 'none' : 'grayscale(1) opacity(0.4)' }}>{emoji}</span>
                    {label}
                  </button>
                );
              })}
            </div>
            {data.pulledAway === true && (
              <textarea
                value={data.pulledAwayText}
                onChange={e => update('pulledAwayText', e.target.value)}
                placeholder="What pulled you away? (optional)"
                rows={2}
                className="w-full rounded-2xl px-4 py-3 text-white text-xs resize-none focus:outline-none transition-colors placeholder-white/20"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            )}
          </div>
        )}
      </div>

      {/* Next / Save button */}
      <button
        onClick={handleNext}
        disabled={!canNext() || saving}
        className="mt-4 w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 flex-shrink-0"
        style={canNext() && !saving ? {
          background: 'linear-gradient(135deg, rgba(29,158,117,0.25), rgba(29,158,117,0.12))',
          border: '1px solid rgba(29,158,117,0.4)',
          color: '#1D9E75',
        } : {
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.2)',
        }}
      >
        {saving ? 'Saving…' : qStep === QUESTIONS.length - 1 ? 'Complete check-in ✓' : 'Next →'}
      </button>
    </div>
  );
}
