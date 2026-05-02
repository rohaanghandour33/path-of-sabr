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
    segmentActive: { background: 'rgba(29,158,117,0.28)', color: '#1D9E75' },
  },
  {
    key: 'late',
    label: 'Late',
    segmentActive: { background: 'rgba(201,149,42,0.28)', color: '#C9952A' },
  },
  {
    key: 'missed',
    label: 'Missed',
    segmentActive: { background: 'rgba(192,57,43,0.28)', color: '#e57368' },
  },
];

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

const CARD_STYLE = {
  background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.025) 100%)',
  border: '1px solid rgba(201,149,42,0.15)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
};

function PrayerSummaryCard({ records, title, subtitle }) {
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
    <div className="dash-card rounded-3xl p-6 h-full flex flex-col" style={CARD_STYLE}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {title}
          </p>
          {subtitle && <p className="text-white/25 text-xs">{subtitle}</p>}
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}>
          View only
        </span>
      </div>

      {records.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/25 text-sm">No prayers logged</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: 'On time', value: onTime, color: '#1D9E75', bg: 'rgba(29,158,117,0.08)' },
              { label: 'Late',    value: late,   color: '#C9952A', bg: 'rgba(201,149,42,0.08)' },
              { label: 'Missed',  value: missed,  color: '#e57368', bg: 'rgba(192,57,43,0.08)' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className="text-center rounded-2xl py-4" style={{ background: bg }}>
                <p className="text-2xl font-bold leading-none" style={{ color }}>{value}</p>
                <p className="text-[10px] mt-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
              </div>
            ))}
          </div>
          <div className="h-1 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #1D9E75, #26c48e)' }} />
          </div>
          <div className="flex items-center justify-between mt-auto">
            <p className="text-xs font-semibold" style={{ color: '#1D9E75' }}>{pct}% on time</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{total} logged</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function PrayerTracker({ userId, weekOffset = 0, customRange = null }) {
  const [prayers, setPrayers] = useState({});
  const [readOnlyRecords, setReadOnlyRecords] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!userId) return;
    setPrayers({});
    setReadOnlyRecords([]);
    setLoading(true);
    fetchData();
  }, [userId, weekOffset, customRange?.start, customRange?.end]);

  const fetchData = async () => {
    if (customRange) {
      const { data } = await supabase.from('prayers').select('*').eq('user_id', userId)
        .gte('date', customRange.start).lte('date', customRange.end);
      setReadOnlyRecords(data || []);
      setLoading(false);
      return;
    }
    if (weekOffset > 0) {
      const end = new Date(); end.setHours(0, 0, 0, 0); end.setDate(end.getDate() - weekOffset * 7);
      const start = new Date(end); start.setDate(end.getDate() - 6);
      const { data } = await supabase.from('prayers').select('*').eq('user_id', userId)
        .gte('date', start.toISOString().split('T')[0]).lte('date', end.toISOString().split('T')[0]);
      setReadOnlyRecords(data || []);
      setLoading(false);
      return;
    }
    const { data: todayData } = await supabase.from('prayers').select('*').eq('user_id', userId).eq('date', today).maybeSingle();
    if (todayData) {
      const { id: _id, user_id: _uid, date: _d, created_at: _c, ...statuses } = todayData;
      setPrayers(statuses);
    }
    const since = new Date(); since.setDate(since.getDate() - 30);
    const { data: history } = await supabase.from('prayers').select('*').eq('user_id', userId)
      .gte('date', since.toISOString().split('T')[0]).order('date', { ascending: false });
    if (history) setStreak(calculateStreak(history));
    setLoading(false);
  };

  const updatePrayer = async (prayer, status) => {
    const newStatus = prayers[prayer] === status ? null : status;
    setPrayers((prev) => ({ ...prev, [prayer]: newStatus }));
    await supabase.from('prayers').upsert({ user_id: userId, date: today, [prayer]: newStatus }, { onConflict: 'user_id,date' });
  };

  if (loading) return null;

  if (customRange) {
    const days = Math.round((new Date(customRange.end + 'T12:00:00') - new Date(customRange.start + 'T12:00:00')) / 86400000) + 1;
    return <PrayerSummaryCard records={readOnlyRecords} title="Period Summary" subtitle={`${days} day period`} />;
  }
  if (weekOffset > 0) {
    return <PrayerSummaryCard records={readOnlyRecords} title="Week's Prayers" subtitle={null} />;
  }

  return (
    <div className="dash-card rounded-3xl p-6 h-full flex flex-col" style={CARD_STYLE}>
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Today's Prayers
      </p>

      <div className="space-y-3 flex-1">
        {PRAYERS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-white/60 text-sm font-medium w-16 flex-shrink-0">{label}</span>
            {/* Segmented control */}
            <div className="flex flex-1 rounded-xl p-0.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
              {STATUSES.map((s) => {
                const isActive = prayers[key] === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => updatePrayer(key, s.key)}
                    className="flex-1 py-2 rounded-[10px] text-[11px] font-semibold transition-all duration-150"
                    style={isActive
                      ? { ...s.segmentActive, boxShadow: '0 1px 6px rgba(0,0,0,0.25)' }
                      : { color: 'rgba(255,255,255,0.22)', background: 'transparent' }
                    }
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
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/5">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#C9952A' }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <span className="font-bold" style={{ color: '#C9952A' }}>{streak}</span> prayers in a row
          </p>
        </div>
      )}
    </div>
  );
}
