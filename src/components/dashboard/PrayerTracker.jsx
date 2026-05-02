import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const PRAYERS = [
  { key: 'fajr',    label: 'Fajr' },
  { key: 'dhuhr',   label: 'Dhuhr' },
  { key: 'asr',     label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha',    label: 'Isha' },
];

const STATUSES = [
  {
    key: 'on_time',
    label: 'On Time',
    activeStyle: { background: 'rgba(29,158,117,0.2)', borderColor: 'rgba(29,158,117,0.6)', color: '#1D9E75' },
  },
  {
    key: 'late',
    label: 'Late',
    activeStyle: { background: 'rgba(201,149,42,0.2)', borderColor: 'rgba(201,149,42,0.6)', color: '#C9952A' },
  },
  {
    key: 'missed',
    label: 'Missed',
    activeStyle: { background: 'rgba(192,57,43,0.2)', borderColor: 'rgba(192,57,43,0.5)', color: '#e57368' },
  },
];

const INACTIVE_STYLE = {
  background: 'rgba(255,255,255,0.04)',
  borderColor: 'rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.3)',
};

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
        border: '1px solid rgba(201,149,42,0.18)',
      }}
    >
      <h2 className="font-semibold text-sm mb-5 text-white">Today's Prayers</h2>

      <div className="space-y-3.5">
        {PRAYERS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <span className="text-white/55 text-sm w-16 flex-shrink-0">{label}</span>
            <div className="flex gap-1.5 flex-1 justify-end">
              {STATUSES.map((s) => {
                const isActive = prayers[key] === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => updatePrayer(key, s.key)}
                    className="px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all duration-150"
                    style={isActive ? s.activeStyle : INACTIVE_STYLE}
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
        <p className="mt-5 text-xs text-white/40">
          <span style={{ color: '#C9952A' }} className="font-semibold">{streak}</span> prayers in a row
        </p>
      )}
    </div>
  );
}
