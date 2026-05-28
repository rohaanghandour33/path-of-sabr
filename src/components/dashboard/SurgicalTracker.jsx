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

// Scale runs 1–100
const SCALE_MIN = 1, SCALE_MAX = 100;
function toSvgY(s) { return PY + (1 - (s - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * chartH; }
function toTopPct(s) { return (toSvgY(s) / VH) * 100; }

// Y-axis shows only milestone levels — no grid lines, no "1"
const Y_AXIS_LABELS = [100, 90, 70, 50, 30, 20, 10];

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
  // Gold for up, red for down — no purple
  const trendColor = summary.trend === 'up' ? '#C9952A'
    : summary.trend === 'down' ? '#e57368'
    : 'rgba(255,255,255,0.3)';

  // Find which benchmark band the user is currently in
  const currentBenchmark = cl !== null
    ? [...LEVEL_BENCHMARKS].reverse().find(b => cl >= b.lvl)
    : null;

  // First milestone the user hasn't yet reached — highlighted in gold
  const nextMilestoneLvl = cl !== null
    ? (LEVEL_BENCHMARKS.find(b => b.lvl > cl)?.lvl ?? null)
    : LEVEL_BENCHMARKS[0].lvl;

  return (
    <div className="rounded-3xl p-5" style={CARD_STYLE}>

      {/* Pulse animation for the live dot */}
      <style>{`
        @keyframes sc-pulse {
          0%, 100% { opacity: 0.7; r: 6; }
          50%       { opacity: 0;   r: 12; }
        }
        .sc-pulse-ring { animation: sc-pulse 2.2s ease-out infinite; }
      `}</style>

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

      {/* ── Chart — height +20% (160 → 192px), no grid lines ── */}
      <div className="flex rounded-2xl overflow-hidden mb-1"
        style={{ height: 192, background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.04)' }}>

        {/* Y-axis — milestone levels only, small muted grey */}
        <div className="relative flex-shrink-0" style={{ width: 30 }}>
          {Y_AXIS_LABELS.map(lvl => (
            <span key={lvl}
              className="absolute w-full text-right tabular-nums leading-none select-none"
              style={{
                top: `${toTopPct(lvl)}%`,
                transform: 'translateY(-50%)',
                paddingRight: 4,
                fontSize: 8,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.17)',
              }}>
              {lvl}
            </span>
          ))}
        </div>

        {/* SVG — no grid lines at all */}
        <div className="flex-1">
          <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
            style={{ width: '100%', height: '100%', display: 'block' }}>
            <defs>
              <linearGradient id="sc-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={lineColor} stopOpacity="0.18" />
                <stop offset="55%"  stopColor={lineColor} stopOpacity="0.03" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0"    />
              </linearGradient>
            </defs>

            {/* No grid lines */}

            {pts.length >= 2 && (
              <g>
                <path d={areaPath(pts)} fill="url(#sc-fill)" />
                <path d={smoothPath(pts)} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 5px ${lineColor}80)` }} />
                {/* Pulsing glow ring + solid dot at end */}
                {(() => {
                  const [lx, ly] = pts[pts.length - 1];
                  return (
                    <g>
                      <circle className="sc-pulse-ring" cx={lx.toFixed(1)} cy={ly.toFixed(1)} r="6"
                        fill={lineColor} />
                      <circle cx={lx.toFixed(1)} cy={ly.toFixed(1)} r="3.5" fill={lineColor}
                        style={{ filter: `drop-shadow(0 0 6px ${lineColor})` }} />
                    </g>
                  );
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
      <div className="flex justify-between mb-7 pr-1" style={{ paddingLeft: 30 }}>
        <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.13)' }}>
          {summary.startLabel}
        </span>
        <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.13)' }}>
          This week
        </span>
      </div>

      {/* ── What the numbers reflect — milestone cards ── */}
      <div className="mb-5">
        <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-3"
          style={{ color: 'rgba(255,255,255,0.15)' }}>
          What the numbers reflect
        </p>

        {/* Mobile: horizontal scroll · Desktop: 2-column grid */}
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
        >
          {LEVEL_BENCHMARKS.map(({ lvl, desc }) => {
            const achieved = cl !== null && cl >= lvl;
            const isNext   = lvl === nextMilestoneLvl;

            let cardBg, cardBorder, numColor, descColor, glow = 'none';
            if (achieved) {
              cardBg = 'rgba(29,158,117,0.09)';
              cardBorder = '1px solid rgba(29,158,117,0.2)';
              numColor = '#1D9E75';
              descColor = 'rgba(255,255,255,0.28)';
            } else if (isNext) {
              cardBg = 'rgba(201,149,42,0.1)';
              cardBorder = '1px solid rgba(201,149,42,0.35)';
              numColor = '#C9952A';
              descColor = 'rgba(255,255,255,0.45)';
              glow = '0 0 18px rgba(201,149,42,0.13)';
            } else {
              cardBg = 'rgba(255,255,255,0.02)';
              cardBorder = '1px solid rgba(255,255,255,0.05)';
              numColor = 'rgba(255,255,255,0.14)';
              descColor = 'rgba(255,255,255,0.11)';
            }

            return (
              <div key={lvl} className="rounded-2xl px-3 py-3"
                style={{ background: cardBg, border: cardBorder, boxShadow: glow }}>
                <p className="text-xl font-extrabold tabular-nums leading-none mb-1.5"
                  style={{ color: numColor }}>
                  {lvl}
                </p>
                <p className="text-[9px] leading-snug"
                  style={{ color: descColor }}>
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

      {/* ── Bottom cards — Now · Best · Trend ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: 'Now',
            value: cl ?? '—',
            color: lineColor,
            bg:    'rgba(29,158,117,0.07)',
            border:'rgba(29,158,117,0.15)',
            sub:   null,
          },
          {
            label: 'Best',
            value: summary.best || '—',
            color: '#C9952A',
            bg:    'rgba(201,149,42,0.07)',
            border:'rgba(201,149,42,0.15)',
            sub:   null,
          },
          {
            label: 'Trend',
            value: summary.trend ? trendArrow : '—',
            color: trendColor,
            bg:    'rgba(255,255,255,0.03)',
            border:'rgba(255,255,255,0.07)',
            sub:   'vs last week',
          },
        ].map(({ label, value, color, bg, border, sub }) => (
          <div key={label} className="text-center rounded-2xl py-4 px-1"
            style={{
              background: bg,
              border: `1px solid ${border}`,
              borderTop: '2px solid rgba(29,158,117,0.35)',
            }}>
            <p className="text-2xl font-extrabold leading-none mb-1" style={{ color }}>{value}</p>
            <p className="text-[9px] uppercase tracking-widest font-semibold"
              style={{ color: 'rgba(255,255,255,0.2)' }}>{label}</p>
            {sub && (
              <p className="text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.13)' }}>{sub}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
