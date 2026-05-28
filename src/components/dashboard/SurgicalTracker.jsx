import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function calcRawatib(p) {
  return (
    ((p.fajr_sunnah_before   || 0) >= 2 ? 2 : 0) +
    ((p.dhuhr_sunnah_before  || 0) >= 4 ? 4 : 0) +
    ((p.dhuhr_sunnah_after   || 0) >= 2 ? 2 : 0) +
    ((p.maghrib_sunnah_after || 0) >= 2 ? 2 : 0) +
    ((p.isha_sunnah_after    || 0) >= 2 ? 2 : 0)
  );
}

// ── What a week's actual practice looks like (0–100) ─────────────────────────
// Not a score. A measure of what someone is consistently doing.
// Each component reflects a real observable behaviour, not a reward.
function measureWeek(weekDates, pMap) {
  let prayers = 0, onTime = 0, loggedDays = 0;
  let rawatibTotal = 0, masjid = 0, adhkarBoth = 0, tahajjud = 0;

  weekDates.forEach(date => {
    const p = pMap[date];
    if (!p) return;
    loggedDays++;
    PRAYER_KEYS.forEach(k => {
      if      (p[k] === 'on_time') { prayers++; onTime++; }
      else if (p[k] === 'late')    { prayers++; }
      if (p[`${k}_masjid`])          masjid++;
    });
    rawatibTotal += calcRawatib(p);
    if (p.morning_adhkar && p.evening_adhkar) adhkarBoth++;
    if (p.tahajjud) tahajjud++;
  });

  if (loggedDays === 0) return null;

  // Each number reflects a percentage of ideal behaviour in that area.
  // Unlogged days count as missed (penalises prayer frequency for absent days).
  const prayerFreq   = prayers    / (weekDates.length * 5);   // 0–1 how often you pray
  const punctuality  = prayers > 0 ? onTime / prayers : 0;    // 0–1 how on-time you are
  const adhkarRate   = adhkarBoth  / loggedDays;               // 0–1 adhkar consistency
  const rawatibRate  = (rawatibTotal / loggedDays) / 12;       // 0–1 sunnah consistency
  const masjidRate   = prayers > 0 ? masjid / prayers : 0;    // 0–1 congregation
  const tahajjudRate = tahajjud    / loggedDays;               // 0–1 night prayer

  // Combined: prayer frequency is foundational (50%), quality of practice is the rest (50%)
  return Math.min(
    prayerFreq   * 50 +
    punctuality  * 15 +
    adhkarRate   * 12 +
    rawatibRate  * 12 +
    masjidRate   *  7 +
    tahajjudRate *  4,
    100
  );
}

// ── Level is derived from sustained behaviour across 4 weeks ─────────────────
// One good week barely moves you. Four consistent good weeks move you up.
// One bad week barely drops you. Four bad weeks in a row drop you.
// This reflects real consistency — not a single performance.
//
// Weights: oldest week 15% · 20% · 30% · most recent 35%
// Skipped weeks are excluded from the weighted average so occasional gaps
// don't unfairly punish someone who has been consistent for years.
const WINDOW_WEIGHTS = [0.15, 0.20, 0.30, 0.35];

function deriveLevelAt(weekIdx, allRawPerfs) {
  const start = Math.max(0, weekIdx - 3);
  const window = allRawPerfs.slice(start, weekIdx + 1); // up to 4 weeks
  const baseWeights = WINDOW_WEIGHTS.slice(WINDOW_WEIGHTS.length - window.length);

  let weightedSum = 0, totalWeight = 0;
  window.forEach((raw, i) => {
    if (raw === null) return; // skip weeks with no data
    weightedSum += raw * baseWeights[i];
    totalWeight += baseWeights[i];
  });

  if (totalWeight === 0) return null;

  const avg = weightedSum / totalWeight;

  // Difficulty curve — progress slows as levels rise.
  // This mirrors reality: going from praying 0→1x/day is a huge behavioural leap.
  // Going from praying 4×/day to 5×/day + masjid + tahajjud is also hard, but
  // the level gap is small because you're already at the top of the spectrum.
  return Math.round(100 * Math.pow(avg / 100, 0.7));
}

// ── Group date array into Mon–Sun weeks ───────────────────────────────────────
function groupIntoWeeks(dates) {
  const weeks = [];
  let week = [];
  dates.forEach(date => {
    const dow = new Date(date + 'T12:00:00').getDay();
    if (dow === 1 && week.length > 0) { weeks.push(week); week = []; }
    week.push(date);
  });
  if (week.length > 0) weeks.push(week);
  return weeks;
}

// ── SVG helpers ───────────────────────────────────────────────────────────────
const VW = 600, VH = 160, PX = 6, PXR = 6, PY = 8, PYB = 8;
const chartW = VW - PX - PXR;
const chartH = VH - PY - PYB;

// Scale runs 1–100 so the bottom label is "1" not "0"
const SCALE_MIN = 1, SCALE_MAX = 100;
function toSvgY(s) { return PY + (1 - (s - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * chartH; }
function toTopPct(s) { return (toSvgY(s) / VH) * 100; }

function smoothPath(pts) {
  if (!pts.length) return '';
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1], [cx, cy] = pts[i];
    const mx = ((px + cx) / 2).toFixed(1);
    d += ` C${mx},${py.toFixed(1)} ${mx},${cy.toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)}`;
  }
  return d;
}

function areaPath(pts) {
  if (!pts.length) return '';
  const base = (PY + chartH).toFixed(1);
  return `${smoothPath(pts)} L${pts[pts.length-1][0].toFixed(1)},${base} L${pts[0][0].toFixed(1)},${base} Z`;
}

const Y_LEVELS = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 1];

const CARD_STYLE = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.28)',
};

// ── What each level roughly reflects in practice ─────────────────────────────
const LEVEL_BENCHMARKS = [
  { lvl: 10,  desc: 'Praying a couple of times a week — early steps'                         },
  { lvl: 20,  desc: 'About one prayer a day on average — daily habit starting to form'       },
  { lvl: 30,  desc: 'Two or more prayers a day with some dhikr on the side'                  },
  { lvl: 50,  desc: 'All five fard prayers most days — foundation solid'                     },
  { lvl: 70,  desc: 'All five on time, adhkar consistent, sunnah rawatib regular'            },
  { lvl: 90,  desc: 'Masjid regularly, tahajjud, full rawatib, consistent across everything' },
  { lvl: 100, desc: 'Every fard in masjid on time, full rawatib, both adhkar, tahajjud — sustained for months. Nearly no one reaches this.' },
];

export default function SurgicalTracker({ userId, refreshKey = 0 }) {
  const [chartData, setChartData] = useState([]); // [{ label, level }]
  const [summary,   setSummary]   = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!userId) return;
    load();
  }, [userId, refreshKey]);

  async function load() {
    const today = new Date().toISOString().split('T')[0];

    const { data: firstRow } = await supabase
      .from('prayers').select('date').eq('user_id', userId)
      .order('date', { ascending: true }).limit(1).maybeSingle();

    const startDate = firstRow?.date
      ? new Date(firstRow.date + 'T12:00:00')
      : (() => { const d = new Date(); d.setDate(d.getDate() - 27); return d; })();

    const startStr  = startDate.toISOString().split('T')[0];

    const { data: prayers } = await supabase
      .from('prayers').select('*').eq('user_id', userId)
      .gte('date', startStr).lte('date', today);

    const allDates = [];
    for (let d = new Date(startDate); d <= new Date(today + 'T12:00:00'); d.setDate(d.getDate() + 1)) {
      allDates.push(d.toISOString().split('T')[0]);
    }

    const pMap = {};
    (prayers || []).forEach(r => { pMap[r.date] = r; });

    const weekGroups = groupIntoWeeks(allDates);

    // First pass: raw measurement per week
    const rawPerfs = weekGroups.map(wDates => measureWeek(wDates, pMap));

    // Second pass: derive level from sustained 4-week window
    const data = weekGroups.map((wDates, i) => ({
      label: new Date(wDates[0] + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      level: deriveLevelAt(i, rawPerfs),
    }));

    const scored = data.filter(d => d.level !== null);
    const current = scored.length ? scored[scored.length - 1].level : null;
    const best    = scored.length ? Math.max(...scored.map(d => d.level)) : 0;

    const trend = scored.length >= 2
      ? scored[scored.length-1].level > scored[scored.length-2].level + 1 ? 'up'
      : scored[scored.length-1].level < scored[scored.length-2].level - 1 ? 'down'
      : 'flat'
      : null;

    setChartData(data);
    setSummary({ current, best, trend, weekCount: data.length, startLabel: data[0]?.label || '' });
    setLoading(false);
  }

  if (loading || !summary) return null;

  const n   = chartData.length;
  const pts = chartData.reduce((acc, d, i) => {
    if (d.level === null) return acc;
    acc.push([PX + (i / Math.max(n - 1, 1)) * chartW, toSvgY(d.level)]);
    return acc;
  }, []);

  const cl = summary.current;
  const lineColor = cl === null ? 'rgba(255,255,255,0.25)'
    : cl >= 75 ? '#1D9E75'
    : cl >= 50 ? '#C9952A'
    : cl >= 30 ? '#e8b84b'
    : '#e57368';

  const trendArrow = summary.trend === 'up' ? '↑' : summary.trend === 'down' ? '↓' : '→';
  const trendColor = summary.trend === 'up' ? '#1D9E75'
    : summary.trend === 'down' ? '#e57368'
    : 'rgba(255,255,255,0.3)';

  // Find which benchmark band the user is currently in
  const currentBenchmark = cl !== null
    ? [...LEVEL_BENCHMARKS].reverse().find(b => cl >= b.lvl)
    : null;

  return (
    <div className="rounded-3xl p-5" style={CARD_STYLE}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Your Level
          </p>
          <p className="text-[11px] mt-0.5 font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {summary.weekCount} week{summary.weekCount !== 1 ? 's' : ''} · from {summary.startLabel}
          </p>
        </div>

        {cl !== null && (
          <div className="text-right flex-shrink-0 ml-4">
            <div className="flex items-end gap-2 justify-end">
              <p className="text-4xl font-extrabold leading-none tabular-nums"
                style={{ color: lineColor, textShadow: `0 0 28px ${lineColor}55` }}>
                {cl}
              </p>
              {summary.trend && (
                <span className="text-xl font-bold mb-0.5" style={{ color: trendColor }}>{trendArrow}</span>
              )}
            </div>
            {currentBenchmark && (
              <p className="text-[9px] mt-1 max-w-[180px] leading-snug text-right"
                style={{ color: 'rgba(255,255,255,0.2)' }}>
                {currentBenchmark.desc}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Chart ── */}
      <div className="flex rounded-2xl overflow-hidden mb-1"
        style={{ height: 160, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)' }}>

        {/* Y-axis labels — aligned with SVG gridlines via toTopPct */}
        <div className="relative flex-shrink-0" style={{ width: 34 }}>
          {Y_LEVELS.map(lvl => (
            <span key={lvl} className="absolute w-full text-right tabular-nums leading-none select-none"
              style={{
                top: `${toTopPct(lvl)}%`, transform: 'translateY(-50%)',
                paddingRight: 5, fontSize: 9,
                fontWeight: lvl === 1 || lvl === 50 || lvl === 100 ? 700 : 400,
                color: lvl === 1 || lvl === 50 || lvl === 100
                  ? 'rgba(255,255,255,0.38)'
                  : 'rgba(255,255,255,0.15)',
              }}>
              {lvl}
            </span>
          ))}
        </div>

        {/* SVG */}
        <div className="flex-1">
          <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
            style={{ width: '100%', height: '100%', display: 'block' }}>
            <defs>
              <linearGradient id="sc-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={lineColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0"    />
              </linearGradient>
            </defs>

            {Y_LEVELS.map(lvl => {
              const y = toSvgY(lvl).toFixed(1);
              const bold = lvl === 50 || lvl === 100;
              return (
                <line key={lvl} x1="0" y1={y} x2={VW} y2={y}
                  stroke={bold ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.04)'}
                  strokeWidth="1" strokeDasharray={bold ? '0' : '3 6'} />
              );
            })}

            {pts.length >= 2 && (
              <g>
                <path d={areaPath(pts)} fill="url(#sc-fill)" />
                <path d={smoothPath(pts)} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 5px ${lineColor}80)` }} />
                {(() => {
                  const [lx, ly] = pts[pts.length - 1];
                  return <circle cx={lx.toFixed(1)} cy={ly.toFixed(1)} r="3.5" fill={lineColor}
                    style={{ filter: `drop-shadow(0 0 7px ${lineColor})` }} />;
                })()}
              </g>
            )}
            {pts.length === 1 && (
              <circle cx={pts[0][0].toFixed(1)} cy={pts[0][1].toFixed(1)} r="4" fill={lineColor}
                style={{ filter: `drop-shadow(0 0 7px ${lineColor})` }} />
            )}
          </svg>
        </div>
      </div>

      {/* Week axis */}
      <div className="flex justify-between mb-4 pr-1" style={{ paddingLeft: 34 }}>
        <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.13)' }}>
          {summary.startLabel}
        </span>
        <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.13)' }}>
          This week
        </span>
      </div>

      {/* ── What the numbers reflect ── */}
      <div className="mb-4 rounded-2xl px-3 py-3"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-2.5"
          style={{ color: 'rgba(255,255,255,0.15)' }}>
          What the numbers reflect
        </p>
        <div className="space-y-1.5">
          {LEVEL_BENCHMARKS.map(({ lvl, desc }) => {
            const reached = cl !== null && lvl <= cl;
            const isCurrent = currentBenchmark?.lvl === lvl;
            return (
              <div key={lvl} className="flex items-start gap-3">
                <span className="text-[9px] tabular-nums font-extrabold w-6 flex-shrink-0 text-right mt-px"
                  style={{ color: isCurrent ? lineColor : reached ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)' }}>
                  {lvl}
                </span>
                <p className="text-[9px] leading-snug"
                  style={{ color: isCurrent ? 'rgba(255,255,255,0.55)' : reached ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.13)' }}>
                  {desc}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-[8px] mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.1)' }}>
          The number moves slowly — one good week barely shifts it, one bad week barely drops it.
          Only sustained change over several weeks moves you up or down.
        </p>
      </div>

      {/* ── Chips ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Now',        value: cl ?? '—',                           color: lineColor,  bg: 'rgba(29,158,117,0.07)',  border: 'rgba(29,158,117,0.15)'  },
          { label: 'Best',       value: summary.best || '—',                 color: '#9B7EFF',  bg: 'rgba(155,126,255,0.07)', border: 'rgba(155,126,255,0.15)' },
          { label: 'Trend',      value: summary.trend ? trendArrow : '—',    color: trendColor, bg: 'rgba(96,165,224,0.07)',  border: 'rgba(96,165,224,0.15)'  },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className="text-center rounded-2xl py-3 px-1"
            style={{ background: bg, border: `1px solid ${border}` }}>
            <p className="text-lg font-extrabold leading-none mb-1" style={{ color }}>{value}</p>
            <p className="text-[9px] uppercase tracking-widest font-semibold"
              style={{ color: 'rgba(255,255,255,0.2)' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
