import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const PRAYERS = [
  { key: 'fajr',    label: 'Fajr' },
  { key: 'dhuhr',   label: 'Dhuhr' },
  { key: 'asr',     label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha',    label: 'Isha' },
];

const PRAYER_KEYS = PRAYERS.map((p) => p.key);

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
  let streak = 0;
  const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
  for (const record of sorted) {
    let missedInDay = false;
    for (const p of [...PRAYER_KEYS].reverse()) {
      const s = record[p];
      if (s === 'on_time' || s === 'late') streak++;
      else if (s === 'missed') { missedInDay = true; break; }
    }
    if (missedInDay) break;
  }
  return streak;
}

function StatBox({ value, label, color }) {
  return (
    <div className="text-center rounded-2xl py-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
    </div>
  );
}

function WeekSummaryView({ records }) {
  let total = 0, onTime = 0, late = 0, missed = 0;
  records.forEach((r) => {
    PRAYER_KEYS.forEach((p) => {
      if (r[p]) {
        total++;
        if (r[p] === 'on_time') onTime++;
        else if (r[p] === 'late') late++;
        else if (r[p] === 'missed') missed++;
      }
    });
  });
  const pct = total > 0 ? Math.round((onTime / total) * 100) : 0;

  return (
    <div
      className="rounded-3xl p-6 mb-4"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,149,42,0.18)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-sm text-white">Week's Prayers</h2>
        <span
          className="text-[10px] px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          View only
        </span>
      </div>

      {records.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-4">No prayers logged this week</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <StatBox value={onTime} label="On time" color="#1D9E75" />
            <StatBox value={late}   label="Late"    color="#C9952A" />
            <StatBox value={missed} label="Missed"  color="#e57368" />
          </div>

          {/* On-time progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: '#1D9E75' }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{pct}% on time</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>{total} of 35 logged</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function PrayerTracker({ userId, weekOffset = 0 }) {
  const [prayers, setPrayers] = useState({});
  const [weekRecords, setWeekRecords] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!userId) return;
    setPrayers({});
    setWeekRecords([]);
    setLoading(true);
    fetchData();
  }, [userId, weekOffset]);

  const fetchData = async () => {
    if (weekOffset === 0) {
      // Today's prayers — editable
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
    } else {
      // Past week — read-only summary
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - weekOffset * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);

      const { data } = await supabase
        .from('prayers').select('*').eq('user_id', userId)
        .gte('date', start.toISOString().split('T')[0])
        .lte('date', end.toISOString().split('T')[0]);

      setWeekRecords(data || []);
    }
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

  // Past week — show read-only summary
  if (weekOffset > 0) {
    return <WeekSummaryView records={weekRecords} />;
  }

  // Current week — interactive tracker
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
