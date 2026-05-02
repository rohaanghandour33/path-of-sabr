import { useState, useEffect } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CONNECTION_LABELS = { 1: 'Distant', 2: 'Low', 3: 'Neutral', 4: 'Close', 5: 'Very close' };

const QUESTIONS = [
  {
    id: 0,
    type: 'scale',
    field: 'connection',
    question: 'How connected do you feel to Allah right now?',
  },
  {
    id: 1,
    type: 'multi',
    field: 'struggles',
    question: 'What is your biggest struggle with your deen today?',
    options: ['Prayer consistency', 'FOMO', 'Family pressure', 'Feeling lost', 'Lack of knowledge'],
  },
  {
    id: 2,
    type: 'multi',
    field: 'heartStates',
    question: 'How would you describe your heart right now?',
    options: ['At peace', 'Anxious', 'Guilty', 'Hopeful', 'Empty', 'Grateful'],
  },
  {
    id: 3,
    type: 'yesno',
    field: 'pulledAway',
    question: 'Did anything pull you away from your deen today?',
  },
  {
    id: 4,
    type: 'multi',
    field: 'needs',
    question: 'What do you need most right now?',
    options: ['Motivation', 'Guidance', 'Accountability', 'Just to be heard', "A reminder of Allah's mercy"],
  },
];

export default function DailyCheckIn({ userId, weekOffset = 0 }) {
  const [qStep, setQStep] = useState(0);
  const [data, setData] = useState({
    connection: 0,
    struggles: [],
    heartStates: [],
    pulledAway: null,
    pulledAwayText: '',
    needs: [],
  });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Past week state
  const [pastCheckIns, setPastCheckIns] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setPastCheckIns(null);
    setDone(false);

    if (weekOffset === 0) {
      supabase
        .from('moods')
        .select('id')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()
        .then(({ data: existing }) => {
          if (existing) setDone(true);
          setLoading(false);
        });
    } else {
      // Fetch past week's check-ins
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - weekOffset * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      const fmt = (d) => d.toISOString().split('T')[0];

      supabase
        .from('moods')
        .select('*')
        .eq('user_id', userId)
        .gte('date', fmt(start))
        .lte('date', fmt(end))
        .then(({ data: rows }) => {
          setPastCheckIns(rows || []);
          setLoading(false);
        });
    }
  }, [userId, weekOffset]);

  const update = (field, val) => setData((d) => ({ ...d, [field]: val }));

  const toggleMulti = (field, val) =>
    setData((d) => ({
      ...d,
      [field]: d[field].includes(val) ? d[field].filter((v) => v !== val) : [...d[field], val],
    }));

  const canNext = () => {
    const q = QUESTIONS[qStep];
    if (q.type === 'scale') return data.connection > 0;
    if (q.type === 'multi') return data[q.field].length > 0;
    if (q.type === 'yesno') return data.pulledAway !== null;
    return true;
  };

  const handleNext = async () => {
    if (qStep < QUESTIONS.length - 1) {
      setQStep((s) => s + 1);
      return;
    }
    setSaving(true);
    await supabase.from('moods').upsert(
      {
        user_id: userId,
        date: today,
        mood_score: data.connection,
        mood_label: JSON.stringify({ heartStates: data.heartStates, needs: data.needs }),
        notes: JSON.stringify({
          struggles: data.struggles,
          pulledAway: data.pulledAway,
          pulledAwayText: data.pulledAwayText,
        }),
      },
      { onConflict: 'user_id,date' }
    );
    setSaving(false);
    setDone(true);
  };

  if (loading) return null;

  // ── Past week: read-only summary ──────────────────────────────────────────
  if (weekOffset > 0) {
    const count = pastCheckIns?.length ?? 0;
    const avgConn = count > 0
      ? (pastCheckIns.reduce((a, b) => a + (b.mood_score || 0), 0) / count).toFixed(1)
      : null;

    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm">Daily Check-in</h2>
          <span
            className="text-[10px] px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            View only
          </span>
        </div>

        {count === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">No check-ins this week</p>
        ) : (
          <div className="space-y-2.5">
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <p className="text-white/50 text-sm">Check-ins</p>
              <p className="text-white font-semibold">
                {count}
                <span className="text-white/30 text-xs font-normal"> / 7 days</span>
              </p>
            </div>

            {avgConn && (
              <div
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <p className="text-white/50 text-sm">Avg connection</p>
                <p className="font-semibold" style={{ color: '#1D9E75' }}>
                  {avgConn}
                  <span className="text-white/30 text-xs font-normal"> / 5</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Current week: check-in complete ──────────────────────────────────────
  if (done) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1D9E75]/20 flex items-center justify-center flex-shrink-0">
            <Check size={15} className="text-[#1D9E75]" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Daily check-in complete</p>
            <p className="text-white/35 text-xs mt-0.5">Come back tomorrow</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Current week: interactive check-in ───────────────────────────────────
  const q = QUESTIONS[qStep];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-white font-semibold text-sm">Daily Check-in</h2>
        <span className="text-white/25 text-xs">{qStep + 1} / {QUESTIONS.length}</span>
      </div>

      {/* Progress line */}
      <div className="flex gap-1 mb-5">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
              i <= qStep ? 'bg-[#1D9E75]' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      <p className="text-white/80 text-sm mb-4 leading-snug">{q.question}</p>

      {/* Scale 1–5 */}
      {q.type === 'scale' && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => update('connection', n)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors flex items-center justify-between ${
                data.connection === n
                  ? 'bg-[#1D9E75]/15 border-[#1D9E75]/50 text-white'
                  : 'bg-white/4 border-white/8 text-white/45'
              }`}
            >
              <span className="font-medium">{n}</span>
              <span className="text-xs">{CONNECTION_LABELS[n]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Multi-select chips */}
      {q.type === 'multi' && (
        <div className="flex flex-wrap gap-2">
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => toggleMulti(q.field, opt)}
              className={`px-3 py-2 rounded-xl border text-xs transition-colors ${
                data[q.field].includes(opt)
                  ? 'bg-[#1D9E75]/15 border-[#1D9E75]/50 text-white'
                  : 'bg-white/4 border-white/8 text-white/45'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Yes / No */}
      {q.type === 'yesno' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            {['Yes', 'No'].map((opt) => (
              <button
                key={opt}
                onClick={() => update('pulledAway', opt === 'Yes')}
                className={`flex-1 py-3 rounded-xl border text-sm transition-colors ${
                  data.pulledAway === (opt === 'Yes')
                    ? 'bg-[#1D9E75]/15 border-[#1D9E75]/50 text-white'
                    : 'bg-white/4 border-white/8 text-white/45'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {data.pulledAway === true && (
            <textarea
              value={data.pulledAwayText}
              onChange={(e) => update('pulledAwayText', e.target.value)}
              placeholder="What pulled you away?"
              rows={3}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/20 text-xs resize-none focus:outline-none focus:border-[#1D9E75]/40 transition-colors"
            />
          )}
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={!canNext() || saving}
        className="mt-4 w-full btn-primary py-3 rounded-xl text-white text-sm font-medium disabled:opacity-30 flex items-center justify-center gap-1"
      >
        {saving ? (
          'Saving...'
        ) : qStep === QUESTIONS.length - 1 ? (
          'Save check-in'
        ) : (
          <>
            Next <ChevronRight size={15} />
          </>
        )}
      </button>
    </div>
  );
}
