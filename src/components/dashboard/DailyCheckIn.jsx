import { useState, useEffect } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CONNECTION_LABELS = { 1: 'Distant', 2: 'Low', 3: 'Neutral', 4: 'Close', 5: 'Very close' };

const QUESTIONS = [
  { id: 0, type: 'scale',  field: 'connection',  question: 'How connected do you feel to Allah right now?' },
  { id: 1, type: 'multi',  field: 'struggles',   question: 'What is your biggest struggle with your deen today?', options: ['Prayer consistency', 'FOMO', 'Family pressure', 'Feeling lost', 'Lack of knowledge'] },
  { id: 2, type: 'multi',  field: 'heartStates', question: 'How would you describe your heart right now?',       options: ['At peace', 'Anxious', 'Guilty', 'Hopeful', 'Empty', 'Grateful'] },
  { id: 3, type: 'yesno',  field: 'pulledAway',  question: 'Did anything pull you away from your deen today?' },
  { id: 4, type: 'multi',  field: 'needs',       question: 'What do you need most right now?',                  options: ['Motivation', 'Guidance', 'Accountability', 'Just to be heard', "A reminder of Allah's mercy"] },
];

const CARD_STYLE = {
  background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.025) 100%)',
  border: '1px solid rgba(201,149,42,0.15)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
};

const OPT_ACTIVE   = { background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.35)', color: '#1D9E75' };
const OPT_INACTIVE = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' };

export default function DailyCheckIn({ userId, weekOffset = 0, customRange = null }) {
  const [qStep, setQStep] = useState(0);
  const [data, setData] = useState({ connection: 0, struggles: [], heartStates: [], pulledAway: null, pulledAwayText: '', needs: [] });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pastSummary, setPastSummary] = useState(null);
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

  const update = (field, val) => setData((d) => ({ ...d, [field]: val }));
  const toggleMulti = (field, val) => setData((d) => ({ ...d, [field]: d[field].includes(val) ? d[field].filter(v => v !== val) : [...d[field], val] }));
  const canNext = () => {
    const q = QUESTIONS[qStep];
    if (q.type === 'scale') return data.connection > 0;
    if (q.type === 'multi') return data[q.field].length > 0;
    if (q.type === 'yesno') return data.pulledAway !== null;
    return true;
  };
  const handleNext = async () => {
    if (qStep < QUESTIONS.length - 1) { setQStep(s => s + 1); return; }
    setSaving(true);
    await supabase.from('moods').upsert(
      { user_id: userId, date: today, mood_score: data.connection, mood_label: JSON.stringify({ heartStates: data.heartStates, needs: data.needs }), notes: JSON.stringify({ struggles: data.struggles, pulledAway: data.pulledAway, pulledAwayText: data.pulledAwayText }) },
      { onConflict: 'user_id,date' }
    );
    setSaving(false); setDone(true);
  };

  if (loading) return null;

  // ── Read-only past / range ─────────────────────────────────────────────────
  if (customRange || weekOffset > 0) {
    const { count, avgConn } = pastSummary || { count: 0, avgConn: null };
    const subtitle = customRange
      ? `${Math.round((new Date(customRange.end + 'T12:00:00') - new Date(customRange.start + 'T12:00:00')) / 86400000) + 1} day period`
      : '7 day week';

    return (
      <div className="rounded-3xl p-6 h-full flex flex-col" style={CARD_STYLE}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Daily Check-in</p>
            <p className="text-white/25 text-xs">{subtitle}</p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}>View only</span>
        </div>

        {count === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/25 text-sm">No check-ins this period</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-2xl px-4 py-3.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-white/45 text-sm">Check-ins logged</p>
              <p className="text-white font-bold text-lg">{count}</p>
            </div>
            {avgConn && (
              <div className="flex items-center justify-between rounded-2xl px-4 py-3.5" style={{ background: 'rgba(29,158,117,0.06)' }}>
                <p className="text-white/45 text-sm">Avg connection</p>
                <p className="font-bold text-lg" style={{ color: '#1D9E75' }}>{avgConn}<span className="text-sm font-normal text-white/30"> / 5</span></p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Check-in done ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="rounded-3xl p-6 h-full flex flex-col justify-center" style={CARD_STYLE}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(29,158,117,0.15)' }}>
            <Check size={18} style={{ color: '#1D9E75' }} />
          </div>
          <div>
            <p className="text-white font-semibold">Check-in complete</p>
            <p className="text-white/35 text-sm mt-0.5">Come back tomorrow</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Interactive ────────────────────────────────────────────────────────────
  const q = QUESTIONS[qStep];

  return (
    <div className="rounded-3xl p-6 h-full flex flex-col" style={CARD_STYLE}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Daily Check-in</p>
        <span className="text-white/25 text-xs tabular-nums">{qStep + 1} / {QUESTIONS.length}</span>
      </div>

      {/* Step bar */}
      <div className="flex gap-1 mb-5 mt-2">
        {QUESTIONS.map((_, i) => (
          <div key={i} className="h-[3px] flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= qStep ? '#1D9E75' : 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>

      <p className="text-white/85 text-sm leading-relaxed mb-5 flex-shrink-0">{q.question}</p>

      <div className="flex-1 overflow-y-auto">
        {/* Scale */}
        {q.type === 'scale' && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => update('connection', n)}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between"
                style={data.connection === n ? OPT_ACTIVE : OPT_INACTIVE}
              >
                <span className="font-semibold">{n}</span>
                <span className="text-xs opacity-80">{CONNECTION_LABELS[n]}</span>
              </button>
            ))}
          </div>
        )}

        {/* Multi */}
        {q.type === 'multi' && (
          <div className="flex flex-wrap gap-2">
            {q.options.map((opt) => (
              <button key={opt} onClick={() => toggleMulti(q.field, opt)}
                className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
                style={data[q.field].includes(opt) ? OPT_ACTIVE : OPT_INACTIVE}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Yes/No */}
        {q.type === 'yesno' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              {['Yes', 'No'].map((opt) => (
                <button key={opt} onClick={() => update('pulledAway', opt === 'Yes')}
                  className="flex-1 py-3 rounded-xl text-sm transition-all font-medium"
                  style={data.pulledAway === (opt === 'Yes') ? OPT_ACTIVE : OPT_INACTIVE}
                >
                  {opt}
                </button>
              ))}
            </div>
            {data.pulledAway === true && (
              <textarea value={data.pulledAwayText} onChange={(e) => update('pulledAwayText', e.target.value)}
                placeholder="What pulled you away?" rows={3}
                className="w-full mt-1 rounded-xl px-3 py-2.5 text-white placeholder-white/20 text-xs resize-none focus:outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              />
            )}
          </div>
        )}
      </div>

      <button onClick={handleNext} disabled={!canNext() || saving}
        className="mt-4 w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-30 flex items-center justify-center gap-1.5 transition-all flex-shrink-0"
        style={{ background: canNext() && !saving ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75' }}
      >
        {saving ? 'Saving…' : qStep === QUESTIONS.length - 1 ? 'Save check-in' : <> Next <ChevronRight size={14} /> </>}
      </button>
    </div>
  );
}
