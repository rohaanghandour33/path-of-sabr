import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const PRAYERS = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'dhuhr', label: 'Dhuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
];

const STATUSES = [
  { key: 'on_time', label: 'On Time' },
  { key: 'late', label: 'Late' },
  { key: 'missed', label: 'Missed' },
];

function buttonStyle(statusKey, isActive) {
  if (!isActive) return {
    background: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.3)',
  };
  // All active states use gold
  return {
    background: 'rgba(201,149,42,0.18)',
    borderColor: 'rgba(201,149,42,0.6)',
    color: '#C9952A',
  };
}

function calculateStreak(records) {
  const prayerOrder = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  let streak = 0;
  const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
  for (const record of sorted) {
    let missedInDay = false;
    for (const p of [...prayerOrder].reverse()) {
      const s = record[p];
      if (s === 'on_time' || s === 'late') streak++;
      else if (s === 'missed') { missedInDay = true; break; }
    }
    if (missedInDay) break;
  }
  return streak;
}

export default function PrayerTracker({ userId }) {
  const [prayers, setPrayers] = useState({});
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    const { data: todayData } = await supabase
      .from('prayers').select('*').eq('user_id', userId).eq('date', today).maybeSingle();

    if (todayData) {
      const { id: _id, user_id: _uid, date: _d, created_at: _c, ...statuses } = todayData;
      setPrayers(statuses);
    }

    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data: history } = await supabase
      .from('prayers').select('*').eq('user_id', userId)
      .gte('date', since.toISOString().split('T')[0]).order('date', { ascending: false });

    if (history) setStreak(calculateStreak(history));
    setLoading(false);
  };

  const updatePrayer = async (prayer, status) => {
    const newStatus = prayers[prayer] === status ? null : status;
    setPrayers((prev) => ({ ...prev, [prayer]: newStatus }));
    await supabase
      .from('prayers')
      .upsert({ user_id: userId, date: today, [prayer]: newStatus }, { onConflict: 'user_id,date' });
  };

  if (loading) return null;

  return (
    <div
      className="rounded-3xl p-6 mb-4"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(201,149,42,0.25)',
        boxShadow: '0 0 30px rgba(201,149,42,0.06)',
      }}
    >
      <h2 className="font-semibold text-sm mb-5" style={{ color: '#C9952A' }}>Today's Prayers</h2>

      <div className="space-y-3.5">
        {PRAYERS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <span className="text-white/60 text-sm w-16 flex-shrink-0">{label}</span>
            <div className="flex gap-1.5 flex-1 justify-end">
              {STATUSES.map((s) => {
                const isActive = prayers[key] === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => updatePrayer(key, s.key)}
                    className="px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all duration-150"
                    style={buttonStyle(s.key, isActive)}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {streak > 0 && (
        <p className="mt-5 text-xs font-medium" style={{ color: '#C9952A' }}>
          {streak} prayers in a row
        </p>
      )}
    </div>
  );
}
