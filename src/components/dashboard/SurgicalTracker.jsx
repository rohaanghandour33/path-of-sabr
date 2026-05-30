import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// ── Scoring helpers ───────────────────────────────────────────────────────────
// Daily performance score (0–100)
//   prayer component  : prayers logged that day / 5 × 50
//   task component    : tasks completed in week / total tasks in week × 30
//   mood component    : mood check-in done today × 20
function calcDailyPerf(prayerRow, weekTasksCompleted, weekTasksTotal, moodLogged) {
  const pCount = prayerRow
    ? PRAYER_KEYS.filter(k => prayerRow[k] === 'on_time' || prayerRow[k] === 'late').length
    : 0;
  const pComp = (pCount / 5) * 50;
  const tComp = weekTasksTotal > 0 ? (weekTasksCompleted / weekTasksTotal) * 30 : 0;
  const mComp = moodLogged ? 20 : 0;
  return pComp + tComp + mComp;
}

// Score delta: max +2 per day, max −1 per day. Never below 5, never above 100.
function applyDelta(score, perf) {
  if (perf >= 60) return Math.min(100, score + 2);
  if (perf >= 30) return Math.min(100, score + 1);
  return Math.max(5, score - 1);
}

// Monday of the week containing dateStr
function weekStartOf(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const dow = d.getDay(); // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return mon.toISOString().split('T')[0];
}

// ── SVG helpers ───────────────────────────────────────────────────────────────
const VW = 600, VH = 160, PX = 6, PXR = 6, PY = 8, PYB = 8;
const chartW = VW - PX - PXR;
const chartH = VH - PY - PYB;
const SCALE_MIN = 1, SCALE_MAX = 100;

function toSvgY(s) { return PY + (1 - (s - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * chartH; }
function toTopPct(s) { return (toSvgY(s) / VH) * 100; }

// All 10 milestone levels on the Y-axis
const Y_AXIS_LABELS = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];

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

const CARD_STYLE = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.28)',
};

// ── Milestone definitions — 5 left, 5 right ───────────────────────────────────
const MILESTONES_LEFT = [
  { lvl: 10, desc: 'Showing up. Praying occasionally, opening the app, taking the first step.' },
  { lvl: 20, desc: 'Building awareness. Praying 1–2 times a day, starting to track consistently.' },
  { lvl: 30, desc: 'Forming habits. 2–3 prayers a day becoming more regular.' },
  { lvl: 40, desc: 'Growing consistency. Most prayers being logged, dhikr starting to form.' },
  { lvl: 50, desc: 'Foundation solid. All 5 fard prayers most days, mood check-ins regular.' },
];
const MILESTONES_RIGHT = [
  { lvl: 60, desc: 'Strengthening. All 5 prayers consistently, tasks being completed weekly.' },
  { lvl: 70, desc: 'Thriving. All 5 on time most days, adhkar regular, sunnah rawatib starting.' },
  { lvl: 80, desc: 'Deeply consistent. All 5 on time daily, full tasks, masjid attendance regular.' },
  { lvl: 90, desc: 'Masjid regularly, tahajjud, full rawatib, consistent across everything.' },
  { lvl: 100, desc: 'Every Fajr in masjid on time, full rawatib, both adhkar, tahajjud sustained for months. Almost nobody reaches this.' },
];
const ALL_MILESTONES = [...MILESTONES_LEFT, ...MILESTONES_RIGHT];

// ── Component ─────────────────────────────────────────────────────────────────
export default function SurgicalTracker({ userId, refreshKey = 0 }) {
  const [chartData, setChartData] = useState([]);
  const [summary,   setSummary]   = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!userId) return;
    load();
  }, [userId, refreshKey]);

  async function load() {
    const today = new Date().toISOString().split('T')[0];

    // ── Fetch all needed data in parallel ─────────────────────────────────────
    const [
      { data: prayerRows },
      { data: taskRows },
      { data: moodRows },
      { data: profileRow },
    ] = await Promise.all([
      supabase.from('prayers').select('*').eq('user_id', userId).order('date', { ascending: true }),
      supabase.from('user_tasks').select('id, due_date, completed').eq('user_id', userId),
      supabase.from('moods').select('date').eq('user_id', userId),
      supabase.from('profiles').select('iman_score, iman_score_date').eq('user_id', userId).maybeSingle(),
    ]);

    // ── Build lookup structures ───────────────────────────────────────────────
    const prayerByDate = {};
    (prayerRows || []).forEach(p => { prayerByDate[p.date] = p; });

    const moodDates = new Set((moodRows || []).map(m => m.date));

    // Group tasks by their Mon-Sun week start
    const tasksByWeek = {};
    (taskRows || []).forEach(t => {
      const ws = weekStartOf(t.due_date);
      if (!tasksByWeek[ws]) tasksByWeek[ws] = { total: 0, completed: 0 };
      tasksByWeek[ws].total++;
      if (t.completed) tasksByWeek[ws].completed++;
    });

    // ── Find first active date ────────────────────────────────────────────────
    const allActiveDates = [
      ...Object.keys(prayerByDate),
      ...[...moodDates],
    ].sort();

    if (!allActiveDates.length) {
      // Brand-new user — no data yet. Show score of 5.
      setChartData([]);
      setSummary({ current: 5, best: 5, trend: null, weekCount: 0, startLabel: '' });
      setLoading(false);
      return;
    }

    const firstDate = allActiveDates[0];

    // ── Simulate Iman Score day by day from first active date ─────────────────
    // Always start at 5. The delta (+2/+1/−1) is applied for every day.
    // This naturally resets inflated old scores: recomputing from scratch
    // means existing accounts are recalculated correctly on first load.
    let score = 5;
    const dailyHistory = []; // { date, score }

    const startD = new Date(firstDate + 'T12:00:00');
    const endD   = new Date(today    + 'T12:00:00');

    for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const ws = weekStartOf(dateStr);
      const wt = tasksByWeek[ws] || { total: 0, completed: 0 };
      const perf = calcDailyPerf(prayerByDate[dateStr], wt.completed, wt.total, moodDates.has(dateStr));
      score = applyDelta(score, perf);
      dailyHistory.push({ date: dateStr, score });
    }

    // ── Persist to profiles once per day ──────────────────────────────────────
    // Also acts as the "reset" for accounts with inflated old scores because
    // the new simulation always starts from 5 and overwrites the stored value.
    if (profileRow?.iman_score_date !== today) {
      try {
        await supabase.from('profiles').upsert(
          { user_id: userId, iman_score: score, iman_score_date: today },
          { onConflict: 'user_id' }
        );
      } catch (_) { /* fail silently if columns don't exist yet */ }
    }

    // ── Aggregate daily history into weekly chart points ──────────────────────
    // Each week's representative score = the last recorded score in that week.
    const weekMap = {};
    dailyHistory.forEach(({ date, score: s }) => {
      weekMap[weekStartOf(date)] = s;
    });

    const chartWeeks = Object.entries(weekMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([ws, lvl]) => ({
        label: new Date(ws + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        level: lvl,
      }));

    // ── Summary stats ─────────────────────────────────────────────────────────
    const best = Math.max(...dailyHistory.map(d => d.score), 5);
    const trend = chartWeeks.length >= 2
      ? chartWeeks[chartWeeks.length-1].level > chartWeeks[chartWeeks.length-2].level + 1 ? 'up'
      : chartWeeks[chartWeeks.length-1].level < chartWeeks[chartWeeks.length-2].level - 1 ? 'down'
      : 'flat'
      : null;

    setChartData(chartWeeks);
    setSummary({
      current: score,
      best,
      trend,
      weekCount: chartWeeks.length,
      startLabel: chartWeeks[0]?.label || '',
    });
    setLoading(false);
  }

  if (loading || !summary) return null;

  const n   = chartData.length;
  const pts = chartData.reduce((acc, d, i) => {
    acc.push([PX + (i / Math.max(n - 1, 1)) * chartW, toSvgY(d.level)]);
    return acc;
  }, []);

  const cl = summary.current;

  const lineColor = cl >= 75 ? '#1D9E75'
    : cl >= 50 ? '#C9952A'
    : cl >= 30 ? '#e8b84b'
    : '#e57368';

  const trendArrow = summary.trend === 'up' ? '↑' : summary.trend === 'down' ? '↓' : '→';
  const trendColor = summary.trend === 'up'   ? '#C9952A'
    : summary.trend === 'down' ? '#e57368'
    : 'rgba(255,255,255,0.3)';

  // Current benchmark description (the band the user is in)
  const currentBenchmark = [...ALL_MILESTONES].reverse().find(b => cl >= b.lvl);

  // Next milestone the user hasn't yet reached — highlighted gold
  const nextMilestoneLvl = ALL_MILESTONES.find(b => b.lvl > cl)?.lvl ?? null;

  // Shared milestone card renderer
  function MilestoneCard({ lvl, desc }) {
    const achieved = cl >= lvl;
    const isNext   = lvl === nextMilestoneLvl;

    let cardBg, cardBorder, numColor, descColor, glow = 'none';
    if (achieved) {
      cardBg = 'rgba(29,158,117,0.09)';   cardBorder = '1px solid rgba(29,158,117,0.2)';
      numColor = '#1D9E75';               descColor = 'rgba(255,255,255,0.28)';
    } else if (isNext) {
      cardBg = 'rgba(201,149,42,0.10)';   cardBorder = '1px solid rgba(201,149,42,0.35)';
      numColor = '#C9952A';               descColor = 'rgba(255,255,255,0.45)';
      glow = '0 0 18px rgba(201,149,42,0.13)';
    } else {
      cardBg = 'rgba(255,255,255,0.02)';  cardBorder = '1px solid rgba(255,255,255,0.05)';
      numColor = 'rgba(255,255,255,0.14)'; descColor = 'rgba(255,255,255,0.11)';
    }

    return (
      <div className="rounded-2xl px-3 py-3" style={{ background: cardBg, border: cardBorder, boxShadow: glow }}>
        <p className="text-xl font-extrabold tabular-nums leading-none mb-1.5" style={{ color: numColor }}>
          {lvl}
        </p>
        <p className="text-[9px] leading-snug" style={{ color: descColor }}>{desc}</p>
      </div>
    );
  }

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
            {summary.weekCount > 0
              ? `${summary.weekCount} week${summary.weekCount !== 1 ? 's' : ''} · from ${summary.startLabel}`
              : 'Start logging to build your score'}
          </p>
        </div>

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
      </div>

      {/* ── Chart ── */}
      <div className="flex rounded-2xl overflow-hidden mb-1"
        style={{ height: 192, background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.04)' }}>

        {/* Y-axis — all 10 milestone levels */}
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

        {/* SVG line chart */}
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

            {pts.length >= 2 && (
              <g>
                <path d={areaPath(pts)} fill="url(#sc-fill)" />
                <path d={smoothPath(pts)} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 5px ${lineColor}80)` }} />
                {(() => {
                  const [lx, ly] = pts[pts.length - 1];
                  return (
                    <g>
                      <circle className="sc-pulse-ring" cx={lx.toFixed(1)} cy={ly.toFixed(1)} r="6" fill={lineColor} />
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
        <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.13)' }}>{summary.startLabel}</span>
        <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.13)' }}>This week</span>
      </div>

      {/* ── What the numbers reflect — two columns of 5 ── */}
      <div className="mb-5">
        <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-3"
          style={{ color: 'rgba(255,255,255,0.15)' }}>
          What the numbers reflect
        </p>

        <div className="flex gap-2">
          {/* Left: 10 – 50 */}
          <div className="flex-1 flex flex-col gap-2">
            {MILESTONES_LEFT.map(({ lvl, desc }) => (
              <MilestoneCard key={lvl} lvl={lvl} desc={desc} />
            ))}
          </div>
          {/* Right: 60 – 100 */}
          <div className="flex-1 flex flex-col gap-2">
            {MILESTONES_RIGHT.map(({ lvl, desc }) => (
              <MilestoneCard key={lvl} lvl={lvl} desc={desc} />
            ))}
          </div>
        </div>

        <p className="text-[8px] mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.1)' }}>
          Score moves max +2 per day on great days, −1 per day on poor ones. Reaching 50 takes weeks of consistency. Reaching 100 takes months.
        </p>
      </div>

      {/* ── Bottom cards — Now · Best · Trend ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Now',   value: cl,                            color: lineColor,  bg: 'rgba(29,158,117,0.07)',  border: 'rgba(29,158,117,0.15)',  sub: null },
          { label: 'Best',  value: summary.best || 5,             color: '#C9952A',  bg: 'rgba(201,149,42,0.07)', border: 'rgba(201,149,42,0.15)', sub: null },
          { label: 'Trend', value: summary.trend ? trendArrow : '—', color: trendColor, bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)', sub: 'vs last week' },
        ].map(({ label, value, color, bg, border, sub }) => (
          <div key={label} className="text-center rounded-2xl py-4 px-1"
            style={{ background: bg, border: `1px solid ${border}`, borderTop: '2px solid rgba(29,158,117,0.35)' }}>
            <p className="text-2xl font-extrabold leading-none mb-1" style={{ color }}>{value}</p>
            <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>{label}</p>
            {sub && <p className="text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.13)' }}>{sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
