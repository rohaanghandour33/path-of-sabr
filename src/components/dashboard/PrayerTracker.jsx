import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const PRAYERS = [
  { key: 'fajr',    label: 'Fajr',    fallback: 'Dawn',      aladhanKey: 'Fajr',    sunnahLabel: '2 Sunnah',  sunnahDetail: '2 rakat before' },
  { key: 'dhuhr',   label: 'Dhuhr',   fallback: 'Midday',    aladhanKey: 'Dhuhr',   sunnahLabel: '6 Sunnah',  sunnahDetail: '4 before · 2 after' },
  { key: 'asr',     label: 'Asr',     fallback: 'Afternoon', aladhanKey: 'Asr',     sunnahLabel: '4 Sunnah',  sunnahDetail: '4 rakat before' },
  { key: 'maghrib', label: 'Maghrib', fallback: 'Sunset',    aladhanKey: 'Maghrib', sunnahLabel: '2 Sunnah',  sunnahDetail: '2 rakat after' },
  { key: 'isha',    label: 'Isha',    fallback: 'Night',     aladhanKey: 'Isha',    sunnahLabel: '2 Sunnah',  sunnahDetail: '2 rakat after' },
];

const PRAYER_KEYS = PRAYERS.map((p) => p.key);

const STATUSES = [
  { key: 'on_time', label: 'On Time', color: '#1D9E75', activeBg: 'rgba(29,158,117,0.18)',  activeBorder: 'rgba(29,158,117,0.4)' },
  { key: 'late',    label: 'Late',    color: '#C9952A', activeBg: 'rgba(201,149,42,0.18)', activeBorder: 'rgba(201,149,42,0.4)' },
  { key: 'missed',  label: 'Missed',  color: '#e57368', activeBg: 'rgba(192,57,43,0.18)',  activeBorder: 'rgba(192,57,43,0.4)' },
];

// Dhikr buttons (2-column)
const DHIKR_ITEMS = [
  { field: 'morning_adhkar', label: 'Morning Adhkar', sub: 'After Fajr',         icon: '📿' },
  { field: 'evening_adhkar', label: 'Evening Adhkar', sub: 'After Asr/Maghrib',  icon: '🌅' },
];

// Extra prayers (3-column)
const EXTRA_PRAYERS = [
  { field: 'witr',     label: 'Witr',     sub: '3 rakat',      icon: '🌙' },
  { field: 'tahajjud', label: 'Tahajjud', sub: 'Night prayer',  icon: '⭐' },
  { field: 'duha',     label: 'Duha',     sub: '2–12 rakat',    icon: '☀️' },
];

function to12h(time24) {
  if (!time24) return null;
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

const CARD = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.28)',
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

// ── Read-only summary card (week / custom range views) ────────────────────────
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
    <div className="rounded-3xl p-6 h-full flex flex-col" style={CARD}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{title}</p>
          {subtitle && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{subtitle}</p>}
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)' }}>View only</span>
      </div>

      {records.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/20 text-sm">No prayers logged</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            {[
              { label: 'On time', value: onTime, color: '#1D9E75', bg: 'rgba(29,158,117,0.08)', border: 'rgba(29,158,117,0.15)' },
              { label: 'Late',    value: late,   color: '#C9952A', bg: 'rgba(201,149,42,0.08)', border: 'rgba(201,149,42,0.15)' },
              { label: 'Missed',  value: missed,  color: '#e57368', bg: 'rgba(192,57,43,0.07)',  border: 'rgba(192,57,43,0.12)' },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} className="text-center rounded-2xl py-4" style={{ background: bg, border: `1px solid ${border}` }}>
                <p className="text-2xl font-extrabold leading-none" style={{ color }}>{value}</p>
                <p className="text-[10px] mt-2 font-semibold tracking-wide uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</p>
              </div>
            ))}
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #1D9E75, #26c48e)', boxShadow: '0 0 8px rgba(29,158,117,0.4)' }} />
          </div>
          <div className="flex items-center justify-between mt-auto">
            <p className="text-sm font-bold" style={{ color: '#1D9E75' }}>{pct}% on time</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{total} logged</p>
          </div>
        </>
      )}
    </div>
  );
}

// ── Toggle pill shared style ───────────────────────────────────────────────────
function pillStyle(on, color = 'teal') {
  if (color === 'gold') {
    return on
      ? { background: 'rgba(201,149,42,0.14)', border: '1px solid rgba(201,149,42,0.38)', color: '#C9952A' }
      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.22)' };
  }
  return on
    ? { background: 'rgba(29,158,117,0.14)', border: '1px solid rgba(29,158,117,0.38)', color: '#1D9E75' }
    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.22)' };
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PrayerTracker({ userId, weekOffset = 0, customRange = null, onUpdate }) {
  const [prayers, setPrayers] = useState({});
  const [readOnlyRecords, setReadOnlyRecords] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState({});
  const today = new Date().toISOString().split('T')[0];
  const isJummah = new Date().getDay() === 5; // Friday

  // Aladhan prayer times
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://api.aladhan.com/v1/timings?latitude=${coords.latitude}&longitude=${coords.longitude}&method=2`
          );
          if (!res.ok) return;
          const json = await res.json();
          const t = json?.data?.timings;
          if (!t) return;
          const mapped = {};
          PRAYERS.forEach(({ key, aladhanKey }) => {
            if (t[aladhanKey]) mapped[key] = to12h(t[aladhanKey]);
          });
          setPrayerTimes(mapped);
        } catch { /* silent */ }
      },
      () => {}
    );
  }, []);

  useEffect(() => {
    if (!userId) return;
    setPrayers({}); setReadOnlyRecords([]); setLoading(true);
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
    const { data: todayData } = await supabase.from('prayers').select('*')
      .eq('user_id', userId).eq('date', today).maybeSingle();
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

  // Toggle a fard prayer status (on_time / late / missed — or clear)
  const updatePrayer = async (prayer, status) => {
    const newStatus = prayers[prayer] === status ? null : status;
    setPrayers((prev) => ({ ...prev, [prayer]: newStatus }));
    await supabase.from('prayers').upsert(
      { user_id: userId, date: today, [prayer]: newStatus },
      { onConflict: 'user_id,date' }
    );
    onUpdate?.();
  };

  // Toggle a boolean field (sunnah / masjid / dhikr / extra prayers)
  const toggleField = async (field) => {
    const newVal = !prayers[field];
    setPrayers((prev) => ({ ...prev, [field]: newVal }));
    await supabase.from('prayers').upsert(
      { user_id: userId, date: today, [field]: newVal },
      { onConflict: 'user_id,date' }
    );
    onUpdate?.();
  };

  if (loading) return null;

  // ── Read-only views ──
  if (customRange) {
    const days = Math.round((new Date(customRange.end + 'T12:00:00') - new Date(customRange.start + 'T12:00:00')) / 86400000) + 1;
    return <PrayerSummaryCard records={readOnlyRecords} title="Period Summary" subtitle={`${days} day period`} />;
  }
  if (weekOffset > 0) {
    return <PrayerSummaryCard records={readOnlyRecords} title="Week's Prayers" subtitle={null} />;
  }

  const loggedCount  = PRAYER_KEYS.filter((k) => prayers[k]).length;
  const sunnahCount  = PRAYER_KEYS.filter((k) => prayers[`${k}_sunnah`]).length;
  const masjidCount  = PRAYER_KEYS.filter((k) => prayers[`${k}_masjid`]).length;
  const extraCount   = [...DHIKR_ITEMS, ...EXTRA_PRAYERS].filter((e) => prayers[e.field]).length
                     + (prayers['jummah'] ? 1 : 0);

  return (
    <div className="rounded-3xl p-6 flex flex-col" style={CARD}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Today's Prayers
        </p>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {masjidCount > 0 && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
              style={{ background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.2)', color: '#1D9E75' }}>
              🕌 {masjidCount} masjid
            </span>
          )}
          {sunnahCount > 0 && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
              style={{ background: 'rgba(201,149,42,0.1)', border: '1px solid rgba(201,149,42,0.2)', color: '#C9952A' }}>
              📿 {sunnahCount} sunnah
            </span>
          )}
          {loggedCount > 0 && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
              style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.18)', color: '#1D9E75' }}>
              {loggedCount}/5
            </span>
          )}
        </div>
      </div>

      {/* ── Fard prayer rows ── */}
      <div className="space-y-2">
        {PRAYERS.map(({ key, label, fallback, sunnahLabel, sunnahDetail }) => {
          const current   = prayers[key];
          const calcTime  = prayerTimes[key];
          const masjidOn  = !!prayers[`${key}_masjid`];
          const sunnahOn  = !!prayers[`${key}_sunnah`];

          return (
            <div
              key={key}
              className="rounded-2xl px-4 pt-3 pb-2.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              {/* Main row — name + status buttons */}
              <div className="flex items-center gap-3">
                <div className="w-24 flex-shrink-0">
                  <p className="text-sm font-bold text-white/85 leading-tight">{label}</p>
                  {calcTime ? (
                    <p className="text-[12px] font-semibold mt-0.5 leading-tight"
                      style={{ color: '#1D9E75', textShadow: '0 0 8px rgba(29,158,117,0.4)' }}>
                      {calcTime}
                    </p>
                  ) : (
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{fallback}</p>
                  )}
                </div>
                <div className="flex flex-1 gap-1">
                  {STATUSES.map((s) => {
                    const isActive = current === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => updatePrayer(key, s.key)}
                        className="flex-1 py-2 rounded-xl text-[10px] font-bold transition-all duration-150"
                        style={isActive
                          ? { background: s.activeBg, border: `1px solid ${s.activeBorder}`, color: s.color, boxShadow: `0 0 10px ${s.activeBg}` }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)' }
                        }
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-row — Masjid + Sunnah toggles */}
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => toggleField(`${key}_masjid`)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-150"
                  style={pillStyle(masjidOn, 'teal')}
                >
                  <span>🕌</span>
                  <span>Masjid</span>
                </button>
                <button
                  onClick={() => toggleField(`${key}_sunnah`)}
                  title={sunnahDetail}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-150"
                  style={pillStyle(sunnahOn, 'gold')}
                >
                  <span>📿</span>
                  <span>{sunnahLabel}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── More Ibadah ── */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.14)' }}>
          More Ibadah
        </p>

        {/* Dhikr — 2 columns */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          {DHIKR_ITEMS.map(({ field, label, sub, icon }) => {
            const on = !!prayers[field];
            return (
              <button
                key={field}
                onClick={() => toggleField(field)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
                style={on
                  ? { background: 'rgba(201,149,42,0.12)', border: '1px solid rgba(201,149,42,0.3)', color: '#C9952A' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }
                }
              >
                <span className="text-base leading-none flex-shrink-0">{icon}</span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold leading-tight truncate">{label}</p>
                  <p className="text-[9px] opacity-55 mt-0.5">{sub}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Extra prayers — 3 columns */}
        <div className="grid grid-cols-3 gap-2">
          {EXTRA_PRAYERS.map(({ field, label, sub, icon }) => {
            const on = !!prayers[field];
            return (
              <button
                key={field}
                onClick={() => toggleField(field)}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-150"
                style={on
                  ? { background: 'rgba(201,149,42,0.12)', border: '1px solid rgba(201,149,42,0.3)', color: '#C9952A' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }
                }
              >
                <span className="text-lg leading-none">{icon}</span>
                <p className="text-[10px] font-bold leading-tight">{label}</p>
                <p className="text-[9px] opacity-50">{sub}</p>
              </button>
            );
          })}
        </div>

        {/* Jumu'ah — Fridays only */}
        {isJummah && (
          <button
            onClick={() => toggleField('jummah')}
            className="w-full mt-2 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-150"
            style={prayers['jummah']
              ? { background: 'rgba(29,158,117,0.18)', border: '1px solid rgba(29,158,117,0.4)', color: '#1D9E75', boxShadow: '0 0 18px rgba(29,158,117,0.12)', fontSize: '13px' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }
            }
          >
            <span>🕌</span>
            <span>Attended Jumu'ah</span>
            {prayers['jummah'] && <span style={{ color: '#1D9E75' }}>✓</span>}
          </button>
        )}
      </div>

      {/* ── Streak footer ── */}
      {streak > 0 && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl leading-none">⭐</span>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-extrabold" style={{ fontSize: '1.6rem', color: '#C9952A', lineHeight: 1 }}>{streak}</span>
                  <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>prayers in a row</span>
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(201,149,42,0.45)' }}>Keep going. Don't break it.</p>
              </div>
            </div>
            <span
              className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: 'rgba(201,149,42,0.1)', border: '1px solid rgba(201,149,42,0.22)', color: 'rgba(201,149,42,0.7)' }}
            >
              Streak
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
