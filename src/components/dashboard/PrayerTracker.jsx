import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const PRAYERS = [
  { key: 'fajr',    label: 'Fajr',    fallback: 'Dawn',      aladhanKey: 'Fajr' },
  { key: 'dhuhr',   label: 'Dhuhr',   fallback: 'Midday',    aladhanKey: 'Dhuhr' },
  { key: 'asr',     label: 'Asr',     fallback: 'Afternoon', aladhanKey: 'Asr' },
  { key: 'maghrib', label: 'Maghrib', fallback: 'Sunset',    aladhanKey: 'Maghrib' },
  { key: 'isha',    label: 'Isha',    fallback: 'Night',     aladhanKey: 'Isha' },
];
const PRAYER_KEYS = PRAYERS.map((p) => p.key);

// ── Sunnah options per prayer ─────────────────────────────────────────────────
// opts: available rakat choices  |  emp: highlighted as mu'akkadah (emphasized)
const SUNNAH = {
  fajr:    { before: { opts: [2],    emp: [2] }, after: null },
  dhuhr:   { before: { opts: [4, 6], emp: [4] }, after: { opts: [2, 4], emp: [2] } },
  asr:     { before: { opts: [2, 4], emp: [] },  after: null },
  maghrib: { before: { opts: [2],    emp: [] },  after: { opts: [2, 4], emp: [2] } },
  isha:    { before: { opts: [2, 4], emp: [] },  after: { opts: [2, 4], emp: [2] } },
};

// Tooltip text shown on hover for each specific rakat count
const TIPS = {
  fajr_before_2:    "Sunnah Mu'akkadah · \"Better than the world and all it contains\"",
  dhuhr_before_4:   "Sunnah Mu'akkadah · Part of 12 daily Rawatib",
  dhuhr_before_6:   "4 confirmed Sunnah + 2 extra Nafl · 4+4 total → protected from the Hellfire (Tirmidhi)",
  dhuhr_after_2:    "Sunnah Mu'akkadah · Part of the 12 daily Rawatib",
  dhuhr_after_4:    '4 before + 4 after → protected from the Hellfire',
  asr_before_2:     'Optional Sunnah',
  asr_before_4:     '"May Allah have mercy on the one who prays 4 before Asr" — Prophet ﷺ',
  maghrib_before_2: 'General Sunnah · Prayed between Adhan and Iqamah',
  maghrib_after_2:  "Sunnah Mu'akkadah · Part of the 12 daily Rawatib",
  maghrib_after_4:  '2 Sunnah + 2 Nafl after Maghrib',
  isha_before_2:    'General Sunnah · Prayed between Adhan and Iqamah',
  isha_before_4:    'Non-emphasized Sunnah before Isha',
  isha_after_2:     "Sunnah Mu'akkadah · Part of the 12 daily Rawatib",
  isha_after_4:     'Reward equivalent to Laylat al-Qadr (Night of Decree)',
};

// The 12 confirmed Rawatib the Prophet ﷺ never left
// Fajr 2 before · Dhuhr 4 before + 2 after · Maghrib 2 after · Isha 2 after = 12
function calcRawatib(p) {
  return (
    ((p.fajr_sunnah_before    || 0) >= 2 ? 2 : 0) +
    ((p.dhuhr_sunnah_before   || 0) >= 4 ? 4 : 0) +
    ((p.dhuhr_sunnah_after    || 0) >= 2 ? 2 : 0) +
    ((p.maghrib_sunnah_after  || 0) >= 2 ? 2 : 0) +
    ((p.isha_sunnah_after     || 0) >= 2 ? 2 : 0)
  );
}
function totalSunnahRakat(p) {
  return ['fajr_sunnah_before','dhuhr_sunnah_before','dhuhr_sunnah_after',
          'asr_sunnah_before','maghrib_sunnah_before','maghrib_sunnah_after',
          'isha_sunnah_before','isha_sunnah_after']
    .reduce((s, f) => s + (p[f] || 0), 0);
}

const STATUSES = [
  { key: 'on_time', label: 'On Time', color: '#1D9E75', activeBg: 'rgba(29,158,117,0.18)', activeBorder: 'rgba(29,158,117,0.4)' },
  { key: 'late',    label: 'Late',    color: '#C9952A', activeBg: 'rgba(201,149,42,0.18)', activeBorder: 'rgba(201,149,42,0.4)' },
  { key: 'missed',  label: 'Missed',  color: '#e57368', activeBg: 'rgba(192,57,43,0.18)',  activeBorder: 'rgba(192,57,43,0.4)' },
];

const DHIKR_ITEMS = [
  { field: 'morning_adhkar', label: 'Morning Adhkar', sub: 'After Fajr',        icon: '📿' },
  { field: 'evening_adhkar', label: 'Evening Adhkar', sub: 'After Asr/Maghrib', icon: '🌅' },
];
const WITR_OPTIONS = [1, 3, 5, 7, 9]; // odd rakat only

const EXTRA_PRAYERS = [
  { field: 'tahajjud', label: 'Tahajjud', sub: 'Night prayer', icon: '⭐' },
  { field: 'duha',     label: 'Duha',     sub: '2–12 rakat',   icon: '☀️' },
];

const CARD = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.28)',
};

function to12h(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

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

// ── Sunnah button styles (4 states) ──────────────────────────────────────────
function sunBtnStyle(active, emp) {
  if (active && emp)  return { background: 'rgba(201,149,42,0.2)',   border: '1px solid rgba(201,149,42,0.5)',   color: '#C9952A',              boxShadow: '0 0 10px rgba(201,149,42,0.18)' };
  if (active && !emp) return { background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.26)', color: 'rgba(255,255,255,0.78)' };
  if (!active && emp) return { background: 'rgba(201,149,42,0.05)',  border: '1px solid rgba(201,149,42,0.18)', color: 'rgba(201,149,42,0.5)'  };
  return               { background: 'rgba(255,255,255,0.03)',  border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)'  };
}
function noneStyle(active) {
  return active
    ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.45)' }
    : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.15)' };
}

// ── Sunnah row sub-component ──────────────────────────────────────────────────
function SunnahRow({ label, prayerKey, type, config, value, onSet }) {
  if (!config) return null;
  const cur = value || 0;
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="text-[9px] font-bold tracking-[0.12em] uppercase w-9 flex-shrink-0"
        style={{ color: 'rgba(255,255,255,0.18)' }}
      >
        {label}
      </span>
      {/* None */}
      <button
        onClick={() => onSet(0)}
        className="px-2 py-1 rounded-lg text-[10px] font-bold transition-all duration-150"
        style={noneStyle(cur === 0)}
        title="Not prayed"
      >
        —
      </button>
      {/* Rakat options */}
      {config.opts.map((n) => {
        const emp = config.emp.includes(n);
        const active = cur === n;
        return (
          <button
            key={n}
            onClick={() => onSet(active ? 0 : n)}
            className="w-8 py-1 rounded-lg text-[10px] font-bold transition-all duration-150"
            style={sunBtnStyle(active, emp)}
            title={TIPS[`${prayerKey}_${type}_${n}`] || `${n} rakat`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

// ── PrayerSummaryCard (read-only for week/custom views) ───────────────────────
function PrayerSummaryCard({ records, title, subtitle }) {
  let total = 0, onTime = 0, late = 0, missed = 0;
  records.forEach((r) => {
    PRAYER_KEYS.forEach((p) => {
      if (r[p]) { total++; if (r[p] === 'on_time') onTime++; else if (r[p] === 'late') late++; else missed++; }
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
        <div className="flex-1 flex items-center justify-center"><p className="text-white/20 text-sm">No prayers logged</p></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            {[
              { label: 'On time', value: onTime, color: '#1D9E75', bg: 'rgba(29,158,117,0.08)', border: 'rgba(29,158,117,0.15)' },
              { label: 'Late',    value: late,   color: '#C9952A', bg: 'rgba(201,149,42,0.08)', border: 'rgba(201,149,42,0.15)' },
              { label: 'Missed',  value: missed, color: '#e57368', bg: 'rgba(192,57,43,0.07)',  border: 'rgba(192,57,43,0.12)' },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} className="text-center rounded-2xl py-4" style={{ background: bg, border: `1px solid ${border}` }}>
                <p className="text-2xl font-extrabold leading-none" style={{ color }}>{value}</p>
                <p className="text-[10px] mt-2 font-semibold tracking-wide uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</p>
              </div>
            ))}
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#1D9E75,#26c48e)', boxShadow: '0 0 8px rgba(29,158,117,0.4)', transition: 'width 0.7s' }} />
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

// ── Main component ─────────────────────────────────────────────────────────────
export default function PrayerTracker({ userId, weekOffset = 0, customRange = null, onUpdate }) {
  const [prayers, setPrayers] = useState({});
  const [readOnlyRecords, setReadOnlyRecords] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState({});
  const today = new Date().toISOString().split('T')[0];
  const isJummah = new Date().getDay() === 5;

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${coords.latitude}&longitude=${coords.longitude}&method=2`);
          if (!res.ok) return;
          const t = (await res.json())?.data?.timings;
          if (!t) return;
          const mapped = {};
          PRAYERS.forEach(({ key, aladhanKey }) => { if (t[aladhanKey]) mapped[key] = to12h(t[aladhanKey]); });
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
      setReadOnlyRecords(data || []); setLoading(false); return;
    }
    if (weekOffset > 0) {
      const end = new Date(); end.setHours(0,0,0,0); end.setDate(end.getDate() - weekOffset * 7);
      const start = new Date(end); start.setDate(end.getDate() - 6);
      const { data } = await supabase.from('prayers').select('*').eq('user_id', userId)
        .gte('date', start.toISOString().split('T')[0]).lte('date', end.toISOString().split('T')[0]);
      setReadOnlyRecords(data || []); setLoading(false); return;
    }
    const { data: todayData } = await supabase.from('prayers').select('*').eq('user_id', userId).eq('date', today).maybeSingle();
    if (todayData) {
      const { id: _a, user_id: _b, date: _c, created_at: _d, ...rest } = todayData;
      setPrayers(rest);
    }
    const since = new Date(); since.setDate(since.getDate() - 30);
    const { data: history } = await supabase.from('prayers').select('*').eq('user_id', userId)
      .gte('date', since.toISOString().split('T')[0]).order('date', { ascending: false });
    if (history) setStreak(calculateStreak(history));
    setLoading(false);
  };

  const updatePrayer = async (prayer, status) => {
    const nv = prayers[prayer] === status ? null : status;
    setPrayers((p) => ({ ...p, [prayer]: nv }));
    await supabase.from('prayers').upsert({ user_id: userId, date: today, [prayer]: nv }, { onConflict: 'user_id,date' });
    onUpdate?.();
  };

  const setSunnah = async (prayerKey, type, value) => {
    const field = `${prayerKey}_sunnah_${type}`;
    setPrayers((p) => ({ ...p, [field]: value }));
    await supabase.from('prayers').upsert({ user_id: userId, date: today, [field]: value }, { onConflict: 'user_id,date' });
    onUpdate?.();
  };

  const toggleField = async (field) => {
    const nv = !prayers[field];
    setPrayers((p) => ({ ...p, [field]: nv }));
    await supabase.from('prayers').upsert({ user_id: userId, date: today, [field]: nv }, { onConflict: 'user_id,date' });
    onUpdate?.();
  };

  if (loading) return null;
  if (customRange) {
    const days = Math.round((new Date(customRange.end + 'T12:00:00') - new Date(customRange.start + 'T12:00:00')) / 86400000) + 1;
    return <PrayerSummaryCard records={readOnlyRecords} title="Period Summary" subtitle={`${days} day period`} />;
  }
  if (weekOffset > 0) return <PrayerSummaryCard records={readOnlyRecords} title="Week's Prayers" />;

  const loggedCount  = PRAYER_KEYS.filter((k) => prayers[k]).length;
  const masjidCount  = PRAYER_KEYS.filter((k) => prayers[`${k}_masjid`]).length;
  const rawatib      = calcRawatib(prayers);
  const witrRakat    = prayers.witr_rakat || 0;
  const totalSunnah  = totalSunnahRakat(prayers) + witrRakat;

  return (
    <div className="rounded-3xl p-6 flex flex-col" style={CARD}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-4">
        <p className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Today's Prayers
        </p>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {rawatib > 0 && (
            <span
              className="text-[10px] font-semibold px-2 py-1 rounded-full"
              style={rawatib === 12
                ? { background: 'rgba(201,149,42,0.18)', border: '1px solid rgba(201,149,42,0.4)', color: '#C9952A' }
                : { background: 'rgba(201,149,42,0.08)', border: '1px solid rgba(201,149,42,0.18)', color: 'rgba(201,149,42,0.7)' }
              }
              title="Sunnah Rawatib — the 12 daily rakat the Prophet ﷺ never left"
            >
              {rawatib === 12 ? '🌟' : '📿'} {rawatib}/12 Rawatib
            </span>
          )}
          {masjidCount > 0 && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
              style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.18)', color: '#1D9E75' }}>
              🕌 {masjidCount}
            </span>
          )}
          {loggedCount > 0 && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
              style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.14)', color: '#1D9E75' }}>
              {loggedCount}/5
            </span>
          )}
        </div>
      </div>

      {/* ── Rawatib legend ── */}
      <div className="mb-3 px-1">
        <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.15)' }}>
          Gold options are Sunnah Mu'akkadah (highly confirmed). Hover for reward details.
        </p>
      </div>

      {/* ── Fard prayer rows ── */}
      <div className="space-y-2">
        {PRAYERS.map(({ key, label, fallback }) => {
          const current   = prayers[key];
          const calcTime  = prayerTimes[key];
          const masjidOn  = !!prayers[`${key}_masjid`];
          const cfg       = SUNNAH[key];
          const valBefore = prayers[`${key}_sunnah_before`] || 0;
          const valAfter  = prayers[`${key}_sunnah_after`]  || 0;

          return (
            <div key={key} className="rounded-2xl px-4 pt-3 pb-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>

              {/* Main row */}
              <div className="flex items-center gap-3">
                <div className="w-24 flex-shrink-0">
                  <p className="text-sm font-bold text-white/85 leading-tight">{label}</p>
                  {calcTime
                    ? <p className="text-[12px] font-semibold mt-0.5" style={{ color: '#1D9E75', textShadow: '0 0 8px rgba(29,158,117,0.4)' }}>{calcTime}</p>
                    : <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{fallback}</p>
                  }
                </div>
                <div className="flex flex-1 gap-1">
                  {STATUSES.map((s) => {
                    const isActive = current === s.key;
                    return (
                      <button key={s.key} onClick={() => updatePrayer(key, s.key)}
                        className="flex-1 py-2 rounded-xl text-[10px] font-bold transition-all duration-150"
                        style={isActive
                          ? { background: s.activeBg, border: `1px solid ${s.activeBorder}`, color: s.color, boxShadow: `0 0 10px ${s.activeBg}` }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)' }
                        }
                      >{s.label}</button>
                    );
                  })}
                </div>
              </div>

              {/* Sunnah + Masjid sub-row */}
              <div className="mt-2.5 space-y-1.5">
                {/* Before sunnah */}
                <div className="flex items-center gap-2 flex-wrap">
                  <SunnahRow
                    label="Bef"
                    prayerKey={key}
                    type="before"
                    config={cfg.before}
                    value={valBefore}
                    onSet={(n) => setSunnah(key, 'before', n)}
                  />
                  {/* Masjid toggle — on same row as "before" when no "after" row */}
                  {!cfg.after && (
                    <button
                      onClick={() => toggleField(`${key}_masjid`)}
                      className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-150"
                      style={masjidOn
                        ? { background: 'rgba(29,158,117,0.14)', border: '1px solid rgba(29,158,117,0.38)', color: '#1D9E75' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.22)' }
                      }
                    >
                      🕌 Masjid
                    </button>
                  )}
                </div>

                {/* After sunnah */}
                {cfg.after && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <SunnahRow
                      label="Aft"
                      prayerKey={key}
                      type="after"
                      config={cfg.after}
                      value={valAfter}
                      onSet={(n) => setSunnah(key, 'after', n)}
                    />
                    {/* Masjid toggle — on "after" row for prayers that have both */}
                    <button
                      onClick={() => toggleField(`${key}_masjid`)}
                      className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-150"
                      style={masjidOn
                        ? { background: 'rgba(29,158,117,0.14)', border: '1px solid rgba(29,158,117,0.38)', color: '#1D9E75' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.22)' }
                      }
                    >
                      🕌 Masjid
                    </button>
                  </div>
                )}

                {/* Forbidden time notice */}
                {!cfg.after && key !== 'fajr' && key !== 'asr' ? null : (
                  !cfg.after && (key === 'fajr' || key === 'asr') && (
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.12)' }}>
                      {key === 'fajr' ? '⚠ No nafl after Fajr until sun rises' : '⚠ No nafl after Asr until sunset'}
                    </p>
                  )
                )}
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
              <button key={field} onClick={() => toggleField(field)}
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

        {/* Witr — rakat selector */}
        <div className="rounded-xl px-3 py-2.5 mb-2"
          style={(prayers.witr_rakat || 0) > 0
            ? { background: 'rgba(201,149,42,0.1)', border: '1px solid rgba(201,149,42,0.25)' }
            : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
          }
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm leading-none">🌙</span>
              <span className="text-[11px] font-bold" style={{ color: (prayers.witr_rakat || 0) > 0 ? '#C9952A' : 'rgba(255,255,255,0.4)' }}>
                Witr
              </span>
            </div>
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Best final prayer of the night</span>
          </div>
          <div className="flex gap-1.5">
            {/* None */}
            <button
              onClick={async () => { setPrayers(p => ({...p, witr_rakat: 0})); await supabase.from('prayers').upsert({ user_id: userId, date: today, witr_rakat: 0 }, { onConflict: 'user_id,date' }); onUpdate?.(); }}
              className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150"
              style={noneStyle((prayers.witr_rakat || 0) === 0)}
            >—</button>
            {WITR_OPTIONS.map((n) => {
              const active = (prayers.witr_rakat || 0) === n;
              return (
                <button
                  key={n}
                  onClick={async () => {
                    const nv = active ? 0 : n;
                    setPrayers(p => ({...p, witr_rakat: nv}));
                    await supabase.from('prayers').upsert({ user_id: userId, date: today, witr_rakat: nv }, { onConflict: 'user_id,date' });
                    onUpdate?.();
                  }}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150"
                  style={active
                    ? { background: 'rgba(201,149,42,0.2)', border: '1px solid rgba(201,149,42,0.5)', color: '#C9952A', boxShadow: '0 0 10px rgba(201,149,42,0.18)' }
                    : { background: 'rgba(201,149,42,0.04)', border: '1px solid rgba(201,149,42,0.14)', color: 'rgba(201,149,42,0.45)' }
                  }
                  title={n === 1 ? 'Minimum Witr' : n === 3 ? 'Most common — Prophet ﷺ often prayed 3' : `${n} rakat Witr`}
                >{n}</button>
              );
            })}
          </div>
        </div>

        {/* Extra prayers — 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          {EXTRA_PRAYERS.map(({ field, label, sub, icon }) => {
            const on = !!prayers[field];
            return (
              <button key={field} onClick={() => toggleField(field)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-150"
                style={on
                  ? { background: 'rgba(201,149,42,0.12)', border: '1px solid rgba(201,149,42,0.3)', color: '#C9952A' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }
                }
              >
                <span className="text-base leading-none flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-[11px] font-bold leading-tight">{label}</p>
                  <p className="text-[9px] opacity-55 mt-0.5">{sub}</p>
                </div>
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
              ? { background: 'rgba(29,158,117,0.18)', border: '1px solid rgba(29,158,117,0.4)',   color: '#1D9E75', boxShadow: '0 0 18px rgba(29,158,117,0.12)', fontSize: '13px' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }
            }
          >
            <span>🕌</span>
            <span>Attended Jumu'ah</span>
            {prayers['jummah'] && <span>✓</span>}
          </button>
        )}
      </div>

      {/* ── Rawatib summary banner ── */}
      {totalSunnah > 0 && (
        <div className="mt-3 px-4 py-3 rounded-2xl"
          style={rawatib === 12
            ? { background: 'rgba(201,149,42,0.1)', border: '1px solid rgba(201,149,42,0.25)' }
            : { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }
          }>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold" style={{ color: rawatib === 12 ? '#C9952A' : 'rgba(255,255,255,0.35)' }}>
                {rawatib === 12 ? '🌟 All 12 Rawatib complete' : `${rawatib}/12 Rawatib prayed`}
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.18)' }}>
                {rawatib === 12
                  ? 'A house in Jannah — Prophet ﷺ'
                  : `${totalSunnah} total sunnah rakat today`
                }
              </p>
            </div>
            {rawatib < 12 && (
              <div className="text-right">
                <p className="text-xs font-extrabold" style={{ color: 'rgba(201,149,42,0.5)' }}>{totalSunnah}</p>
                <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.15)' }}>rakat</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Streak footer ── */}
      {streak > 0 && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⭐</span>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-extrabold" style={{ fontSize: '1.6rem', color: '#C9952A', lineHeight: 1 }}>{streak}</span>
                  <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>prayers in a row</span>
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(201,149,42,0.45)' }}>Keep going. Don't break it.</p>
              </div>
            </div>
            <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: 'rgba(201,149,42,0.1)', border: '1px solid rgba(201,149,42,0.22)', color: 'rgba(201,149,42,0.7)' }}>
              Streak
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
