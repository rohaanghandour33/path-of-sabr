import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const PRAYERS = [
  { key: 'fajr',    label: 'Fajr',    fallback: 'Pre-dawn',  aladhanKey: 'Fajr' },
  { key: 'dhuhr',   label: 'Dhuhr',   fallback: 'Midday',    aladhanKey: 'Dhuhr' },
  { key: 'asr',     label: 'Asr',     fallback: 'Afternoon', aladhanKey: 'Asr' },
  { key: 'maghrib', label: 'Maghrib', fallback: 'Sunset',    aladhanKey: 'Maghrib' },
  { key: 'isha',    label: 'Isha',    fallback: 'Night',     aladhanKey: 'Isha' },
];
const PRAYER_KEYS = PRAYERS.map((p) => p.key);

// Icon + accent colour per prayer
const PRAYER_META = {
  fajr:    { icon: '🌙', bg: 'rgba(120,80,220,0.14)',  border: 'rgba(120,80,220,0.28)'  },
  dhuhr:   { icon: '☀️', bg: 'rgba(201,149,42,0.14)',  border: 'rgba(201,149,42,0.28)'  },
  asr:     { icon: '🌤️', bg: 'rgba(255,175,50,0.13)',  border: 'rgba(255,175,50,0.24)'  },
  maghrib: { icon: '🌇', bg: 'rgba(220,100,65,0.13)',  border: 'rgba(220,100,65,0.24)'  },
  isha:    { icon: '✨', bg: 'rgba(60,130,220,0.14)',   border: 'rgba(60,130,220,0.26)'  },
};

// Row background driven by fard status
function rowStyle(status) {
  if (status === 'on_time') return { background: 'rgba(29,158,117,0.08)',   border: '1px solid rgba(29,158,117,0.22)' };
  if (status === 'late')    return { background: 'rgba(201,149,42,0.08)',   border: '1px solid rgba(201,149,42,0.22)' };
  if (status === 'missed')  return { background: 'rgba(229,115,104,0.06)',  border: '1px solid rgba(229,115,104,0.18)' };
  return { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' };
}

// Small badge in the top-right of each row showing current state
function statusBadgeStyle(status) {
  if (status === 'on_time') return { background: 'rgba(29,158,117,0.18)',  border: '1px solid rgba(29,158,117,0.38)',  color: '#1D9E75' };
  if (status === 'late')    return { background: 'rgba(201,149,42,0.18)',  border: '1px solid rgba(201,149,42,0.38)',  color: '#C9952A' };
  if (status === 'missed')  return { background: 'rgba(229,115,104,0.16)', border: '1px solid rgba(229,115,104,0.32)', color: '#e57368' };
  return {};
}
const STATUS_BADGE_LABEL = { on_time: '✓ On time', late: '~ Late', missed: '✕ Missed' };

// ── Sunnah options per prayer ─────────────────────────────────────────────────
const SUNNAH = {
  fajr:    { before: { opts: [2],    emp: [2] }, after: null },
  dhuhr:   { before: { opts: [4, 6], emp: [4] }, after: { opts: [2, 4], emp: [2] } },
  asr:     { before: { opts: [2, 4], emp: [] },  after: null },
  maghrib: { before: { opts: [2],    emp: [] },  after: { opts: [2, 4], emp: [2] } },
  isha:    { before: { opts: [2, 4], emp: [] },  after: { opts: [2, 4], emp: [2] } },
};

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

// Rawatib: the 12 rakat the Prophet ﷺ never left
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
  { key: 'on_time', label: 'On Time', color: '#1D9E75', activeBg: 'rgba(29,158,117,0.2)',   activeBorder: 'rgba(29,158,117,0.45)' },
  { key: 'late',    label: 'Late',    color: '#C9952A', activeBg: 'rgba(201,149,42,0.2)',   activeBorder: 'rgba(201,149,42,0.45)' },
  { key: 'missed',  label: 'Missed',  color: '#e57368', activeBg: 'rgba(192,57,43,0.18)',   activeBorder: 'rgba(192,57,43,0.4)'  },
];

const DHIKR_ITEMS = [
  { field: 'morning_adhkar', label: 'Morning Adhkar', sub: 'After Fajr',        icon: '📿' },
  { field: 'evening_adhkar', label: 'Evening Adhkar', sub: 'After Asr/Maghrib', icon: '🌅' },
];
const EXTRA_PRAYERS = [
  { field: 'duha', label: 'Duha', sub: '2–12 rakat · mid-morning', icon: '☀️' },
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
    for (const p of PRAYER_KEYS) {
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
      <span className="text-[9px] font-bold tracking-[0.12em] uppercase w-9 flex-shrink-0"
        style={{ color: 'rgba(255,255,255,0.18)' }}>
        {label}
      </span>
      <button onClick={() => onSet(0)}
        className="px-2 py-1 rounded-lg text-[10px] font-bold transition-all duration-150"
        style={noneStyle(cur === 0)} title="Not prayed">
        —
      </button>
      {config.opts.map((n) => {
        const emp = config.emp.includes(n);
        const active = cur === n;
        return (
          <button key={n} onClick={() => onSet(active ? 0 : n)}
            className="w-8 py-1 rounded-lg text-[10px] font-bold transition-all duration-150"
            style={sunBtnStyle(active, emp)}
            title={TIPS[`${prayerKey}_${type}_${n}`] || `${n} rakat`}>
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

// ── Location setup prompt (for existing users with no city/country stored) ──────
function LocationSetup({ onSave }) {
  const COUNTRIES = [
    'Afghanistan','Albania','Algeria','Azerbaijan','Bahrain','Bangladesh','Bosnia and Herzegovina',
    'Brunei','Chad','Comoros','Djibouti','Egypt','Gambia','Guinea','Indonesia','Iran','Iraq',
    'Jordan','Kazakhstan','Kosovo','Kuwait','Kyrgyzstan','Lebanon','Libya','Malaysia','Maldives',
    'Mali','Mauritania','Morocco','Niger','Nigeria','Oman','Pakistan','Palestine','Qatar',
    'Saudi Arabia','Senegal','Sierra Leone','Somalia','Sudan','Syria','Tajikistan','Tunisia',
    'Turkey','Turkmenistan','United Arab Emirates','Uzbekistan','Western Sahara','Yemen',
    'Argentina','Australia','Austria','Belgium','Brazil','Canada','China','Denmark','Ethiopia',
    'Finland','France','Germany','Ghana','Greece','Hungary','India','Ireland','Israel','Italy',
    'Japan','Kenya','Mexico','Netherlands','New Zealand','Norway','Philippines','Poland',
    'Portugal','Russia','South Africa','South Korea','Spain','Sri Lanka','Sweden','Switzerland',
    'Tanzania','Thailand','Uganda','Ukraine','United Kingdom','United States','Vietnam','Zimbabwe',
  ].sort();

  const [city,    setCity]    = useState('');
  const [country, setCountry] = useState('');
  const [saving,  setSaving]  = useState(false);

  const save = async () => {
    if (!city.trim() || !country) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { city: city.trim(), country },
    });
    if (!error) onSave(city.trim(), country);
    setSaving(false);
  };

  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.18)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span>🕌</span>
        <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Add your city for accurate prayer times
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          className="w-full rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
        >
          <option value="">Country</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="City"
          className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          onKeyDown={e => e.key === 'Enter' && save()}
        />
      </div>
      <button
        onClick={save}
        disabled={!city.trim() || !country || saving}
        className="w-full py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
        style={{ background: 'rgba(29,158,117,0.18)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75' }}
      >
        {saving ? 'Saving…' : 'Save & show prayer times →'}
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PrayerTracker({ userId, weekOffset = 0, customRange = null, onUpdate, compact = false }) {
  const { user } = useAuth();
  const [prayers, setPrayers] = useState({});
  const [readOnlyRecords, setReadOnlyRecords] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState({});
  const [locationLabel, setLocationLabel] = useState('');
  const [showLocationSetup, setShowLocationSetup] = useState(false);
  const [showSunnah, setShowSunnah] = useState(false);

  const tz    = user?.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
  const isJummah = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(new Date()) === 'Friday';

  // ── Fetch prayer times: city+country first, geolocation fallback ─────────────
  useEffect(() => {
    fetchPrayerTimes();
  }, [user]);

  async function fetchPrayerTimes() {
    const city    = user?.user_metadata?.city?.trim();
    const country = user?.user_metadata?.country?.trim();

    // No location stored — show the inline setup prompt
    if (!city || !country) {
      setShowLocationSetup(true);
    }

    // ── Primary: use stored city + country (no permission needed) ────────────
    if (city && country) {
      try {
        // No date in URL — Aladhan defaults to today server-side (avoids date-format issues)
        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=3`
        );
        if (res.ok) {
          const t = (await res.json())?.data?.timings;
          if (t) {
            const mapped = {};
            PRAYERS.forEach(({ key, aladhanKey }) => { if (t[aladhanKey]) mapped[key] = to12h(t[aladhanKey]); });
            setPrayerTimes(mapped);
            setLocationLabel(`${city}, ${country}`);
            return;
          }
        }
      } catch { /* fall through to geolocation */ }
    }

    // ── Fallback: browser geolocation (if no city/country stored) ────────────
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://api.aladhan.com/v1/timings/${Math.floor(Date.now()/1000)}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=3`
          );
          if (!res.ok) return;
          const t = (await res.json())?.data?.timings;
          if (!t) return;
          const mapped = {};
          PRAYERS.forEach(({ key, aladhanKey }) => { if (t[aladhanKey]) mapped[key] = to12h(t[aladhanKey]); });
          setPrayerTimes(mapped);
          setLocationLabel('Your location');
        } catch { /* silent */ }
      },
      () => {}
    );
  }

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
    const prev = prayers[prayer];
    const nv = prev === status ? null : status;
    setPrayers((p) => ({ ...p, [prayer]: nv }));
    const { error } = await supabase.from('prayers').upsert({ user_id: userId, date: today, [prayer]: nv }, { onConflict: 'user_id,date' });
    if (error) { console.error('[PrayerTracker] updatePrayer error:', error.message); setPrayers((p) => ({ ...p, [prayer]: prev })); return; }
    onUpdate?.();
  };

  const setSunnah = async (prayerKey, type, value) => {
    const field = `${prayerKey}_sunnah_${type}`;
    const prev = prayers[field];
    setPrayers((p) => ({ ...p, [field]: value }));
    const { error } = await supabase.from('prayers').upsert({ user_id: userId, date: today, [field]: value }, { onConflict: 'user_id,date' });
    if (error) { console.error('[PrayerTracker] setSunnah error:', error.message); setPrayers((p) => ({ ...p, [field]: prev })); return; }
    onUpdate?.();
  };

  const toggleField = async (field) => {
    const prev = prayers[field];
    const nv = !prev;
    setPrayers((p) => ({ ...p, [field]: nv }));
    const { error } = await supabase.from('prayers').upsert({ user_id: userId, date: today, [field]: nv }, { onConflict: 'user_id,date' });
    if (error) { console.error('[PrayerTracker] toggleField error:', error.message); setPrayers((p) => ({ ...p, [field]: prev })); return; }
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
  const totalSunnah  = totalSunnahRakat(prayers);

  return (
    <div className="rounded-3xl p-5 flex flex-col" style={CARD}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Today's Prayers
          </p>
          {locationLabel ? (
            <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'rgba(29,158,117,0.65)' }}>
              🕌 {locationLabel}
            </p>
          ) : loggedCount > 0 ? (
            <p className="text-[11px] mt-0.5 font-semibold" style={{ color: 'rgba(255,255,255,0.28)' }}>
              {loggedCount} of 5 logged
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {!compact && rawatib > 0 && (
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
              title="Sunnah Rawatib — 12 daily rakat the Prophet ﷺ never left"
              style={rawatib === 12
                ? { background: 'rgba(201,149,42,0.15)', border: '1px solid rgba(201,149,42,0.32)', color: '#C9952A' }
                : { background: 'rgba(201,149,42,0.07)', border: '1px solid rgba(201,149,42,0.16)', color: 'rgba(201,149,42,0.65)' }
              }>
              {rawatib === 12 ? '🌟' : '📿'} {rawatib}/12
            </span>
          )}
          {masjidCount > 0 && (
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', color: '#1D9E75' }}>
              🕌 {masjidCount}
            </span>
          )}
        </div>
      </div>

      {/* ── Location setup for existing users with no city/country ── */}
      {showLocationSetup && Object.keys(prayerTimes).length === 0 && (
        <LocationSetup onSave={(city, country) => {
          setShowLocationSetup(false);
          setLocationLabel(`${city}, ${country}`);
          fetchPrayerTimes();
        }} />
      )}

      {/* ── Fard prayer rows ── */}
      <div className="space-y-2.5">
        {PRAYERS.map(({ key, label, fallback }) => {
          const current   = prayers[key];
          const calcTime  = prayerTimes[key];
          const masjidOn  = !!prayers[`${key}_masjid`];
          const cfg       = SUNNAH[key];
          const valBefore = prayers[`${key}_sunnah_before`] || 0;
          const valAfter  = prayers[`${key}_sunnah_after`]  || 0;
          const meta      = PRAYER_META[key];

          return (
            <div key={key} className="rounded-2xl overflow-hidden transition-all duration-300" style={rowStyle(current)}>

              {/* Top section: icon · name · time · status badge */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                {/* Prayer icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: meta.bg, border: `1px solid ${meta.border}`, fontSize: '1.15rem' }}>
                  {meta.icon}
                </div>

                {/* Name + time */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-extrabold leading-none mb-0.5" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {label}
                  </p>
                  {calcTime
                    ? <p className="text-[11px] font-semibold" style={{ color: '#1D9E75', textShadow: '0 0 8px rgba(29,158,117,0.35)' }}>{calcTime}</p>
                    : <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{fallback}</p>
                  }
                </div>

                {/* Status badge + masjid indicator */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {masjidOn && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-lg"
                      style={{ background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.28)', color: '#1D9E75' }}>
                      🕌
                    </span>
                  )}
                  {current && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={statusBadgeStyle(current)}>
                      {STATUS_BADGE_LABEL[current]}
                    </span>
                  )}
                </div>
              </div>

              {/* Status buttons */}
              <div className="flex gap-1.5 px-4 pb-3">
                {STATUSES.map((s) => {
                  const isActive = current === s.key;
                  return (
                    <button key={s.key} onClick={() => updatePrayer(key, s.key)}
                      className="flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-150 hover:scale-[1.02] active:scale-[0.97]"
                      style={isActive
                        ? { background: s.activeBg, border: `1px solid ${s.activeBorder}`, color: s.color, boxShadow: `0 0 12px ${s.activeBg}` }
                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.22)' }
                      }>
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {/* Masjid toggle — always visible */}
              <div className="px-4 pb-3.5">
                <button onClick={() => toggleField(`${key}_masjid`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all duration-150"
                  style={masjidOn
                    ? { background: 'rgba(29,158,117,0.14)', border: '1px solid rgba(29,158,117,0.35)', color: '#1D9E75' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.2)' }
                  }>
                  🕌 Prayed at Masjid
                </button>
              </div>

              {/* Sunnah sub-section (non-compact mode only, when expanded) */}
              {!compact && showSunnah && (
                <div className="px-4 pb-4 pt-2.5 space-y-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <SunnahRow label="Bef" prayerKey={key} type="before" config={cfg.before} value={valBefore} onSet={(n) => setSunnah(key, 'before', n)} />
                  {cfg.after && (
                    <SunnahRow label="Aft" prayerKey={key} type="after" config={cfg.after} value={valAfter} onSet={(n) => setSunnah(key, 'after', n)} />
                  )}
                  {(key === 'fajr' || key === 'asr') && (
                    <p className="text-[9px] pt-0.5" style={{ color: 'rgba(255,255,255,0.12)' }}>
                      {key === 'fajr' ? '⚠ No nafl after Fajr until sun rises' : '⚠ No nafl after Asr until sunset'}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Sunnah toggle (Prayers tab only) ── */}
      {!compact && <button
        onClick={() => setShowSunnah((s) => !s)}
        className="mt-3.5 w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-[11px] font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        style={showSunnah
          ? { background: 'rgba(201,149,42,0.1)',   border: '1px solid rgba(201,149,42,0.28)', color: 'rgba(201,149,42,0.9)' }
          : totalSunnah > 0
            ? { background: 'rgba(201,149,42,0.06)', border: '1px solid rgba(201,149,42,0.18)', color: 'rgba(201,149,42,0.7)' }
            : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)' }
        }>
        <span>📿</span>
        <span>
          {showSunnah
            ? 'Hide Sunnah & More'
            : totalSunnah > 0
              ? `Sunnah & More  ·  ${totalSunnah} rakat logged`
              : 'Log Sunnah & More'
          }
        </span>
        <span style={{ fontSize: '10px', opacity: 0.5 }}>{showSunnah ? '↑' : '↓'}</span>
      </button>}

      {/* ── More Ibadah (expanded, Prayers tab only) ── */}
      {!compact && showSunnah && (
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
                  className="flex items-center gap-2.5 px-3 py-3 rounded-2xl text-left transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                  style={on
                    ? { background: 'rgba(201,149,42,0.12)', border: '1px solid rgba(201,149,42,0.3)', color: '#C9952A' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }
                  }>
                  <span className="text-lg leading-none flex-shrink-0">{icon}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold leading-tight truncate">{label}</p>
                    <p className="text-[9px] mt-0.5 opacity-55">{sub}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tahajjud — dedicated card with hadith */}
          <button onClick={() => toggleField('tahajjud')}
            className="w-full rounded-2xl px-4 py-3.5 text-left transition-all duration-150 mb-2 hover:scale-[1.005] active:scale-[0.995]"
            style={prayers['tahajjud']
              ? { background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.28)' }
              : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
            }>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">⭐</span>
                <span className="text-[13px] font-bold" style={{ color: prayers['tahajjud'] ? '#1D9E75' : 'rgba(255,255,255,0.55)' }}>
                  Tahajjud
                </span>
                {prayers['tahajjud'] && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(29,158,117,0.2)', color: '#1D9E75' }}>
                    ✓ Prayed
                  </span>
                )}
              </div>
              <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.18)' }}>Night prayer</span>
            </div>
            <p className="text-[9px] leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.22)' }}>
              "In the last third of every night, Allah descends to the lowest heaven and asks:
              'Who is calling upon Me that I may answer? Who is asking of Me that I may give?
              Who is seeking forgiveness that I may forgive?'" — Bukhari & Muslim
            </p>
          </button>

          {/* Duha */}
          <div className="grid grid-cols-1 gap-2">
            {EXTRA_PRAYERS.map(({ field, label, sub, icon }) => {
              const on = !!prayers[field];
              return (
                <button key={field} onClick={() => toggleField(field)}
                  className="flex items-center gap-2.5 px-3 py-3 rounded-2xl transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                  style={on
                    ? { background: 'rgba(201,149,42,0.12)', border: '1px solid rgba(201,149,42,0.3)', color: '#C9952A' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }
                  }>
                  <span className="text-lg leading-none flex-shrink-0">{icon}</span>
                  <div>
                    <p className="text-[11px] font-bold leading-tight">{label}</p>
                    <p className="text-[9px] mt-0.5 opacity-55">{sub}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Jumu'ah — Fridays only */}
          {isJummah && (
            <button onClick={() => toggleField('jummah')}
              className="w-full mt-2 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
              style={prayers['jummah']
                ? { background: 'rgba(29,158,117,0.18)', border: '1px solid rgba(29,158,117,0.4)',   color: '#1D9E75', boxShadow: '0 0 18px rgba(29,158,117,0.12)', fontSize: '13px' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }
              }>
              <span>🕌</span>
              <span>Attended Jumu'ah</span>
              {prayers['jummah'] && <span>✓</span>}
            </button>
          )}

          {/* Rawatib summary banner */}
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
                    {rawatib === 12 ? 'A house in Jannah — Prophet ﷺ' : `${totalSunnah} total sunnah rakat today`}
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
