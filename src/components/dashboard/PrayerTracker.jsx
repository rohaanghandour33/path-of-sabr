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
  {
    key: 'on_time',
    label: 'On Time',
    active: 'bg-[#1D9E75]/20 text-[#1D9E75] border-[#1D9E75]/50',
    inactive: 'bg-white/4 text-white/30 border-white/8',
  },
  {
    key: 'late',
    label: 'Late',
    active: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    inactive: 'bg-white/4 text-white/30 border-white/8',
  },
  {
    key: 'missed',
    label: 'Missed',
    active: 'bg-red-500/12 text-red-400 border-red-500/30',
    inactive: 'bg-white/4 text-white/30 border-white/8',
  },
];

function calculateStreak(records) {
  const prayerOrder = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  let streak = 0;

  const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));

  for (const record of sorted) {
    let missedInDay = false;
    for (const p of [...prayerOrder].reverse()) {
      const s = record[p];
      if (s === 'on_time' || s === 'late') {
        streak++;
      } else if (s === 'missed') {
        missedInDay = true;
        break;
      }
      // null = not yet logged, skip without breaking streak
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
      .from('prayers')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (todayData) {
      const { id: _id, user_id: _uid, date: _d, created_at: _c, ...statuses } = todayData;
      setPrayers(statuses);
    }

    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data: history } = await supabase
      .from('prayers')
      .select('*')
      .eq('user_id', userId)
      .gte('date', since.toISOString().split('T')[0])
      .order('date', { ascending: false });

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
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
      <h2 className="text-white font-semibold text-sm mb-4">Today's Prayers</h2>

      <div className="space-y-3">
        {PRAYERS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <span className="text-white/60 text-sm w-14 flex-shrink-0">{label}</span>
            <div className="flex gap-1.5 flex-1 justify-end">
              {STATUSES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => updatePrayer(key, s.key)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    prayers[key] === s.key ? s.active : s.inactive
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {streak > 0 && (
        <p className="mt-4 text-white/20 text-xs">Prayers in a row: {streak}</p>
      )}
    </div>
  );
}
