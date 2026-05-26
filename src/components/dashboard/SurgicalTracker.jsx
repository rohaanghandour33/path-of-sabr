import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const METRICS = [
  { key: 'prayer',  label: 'Prayers',    color: '#1D9E75', activeBg: 'rgba(29,158,117,0.15)',  activeBorder: 'rgba(29,158,117,0.3)'   },
  { key: 'dhikr',   label: 'Dhikr',      color: '#C9952A', activeBg: 'rgba(201,149,42,0.13)',  activeBorder: 'rgba(201,149,42,0.28)'  },
  { key: 'checkin', label: 'Check-ins',  color: '#9B7EFF', activeBg: 'rgba(155,126,255,0.13)', activeBorder: 'rgba(155,126,255,0.28)' },
  { key: 'tasks',   label: 'Tasks',      color: '#60A5E0', activeBg: 'rgba(96,165,224,0.13)',  activeBorder: 'rgba(96,165,224,0.28)'  },
];

// SVG canvas dimensions
const VW = 600, VH = 130, PX = 8, PY = 10;
const chartW = VW - PX * 2;
const chartH = VH - PY * 2;

function smoothPath(pts) {
  if (!pts.length) return '';
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const mx = ((px + cx) / 2).toFixed(1);
    d += ` C${mx},${py.toFixed(1)} ${mx},${cy.toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)}`;
  }
  return d;
}

function toSvgPts(dayData, key, n) {
  return dayData.reduce((acc, d, i) => {
    if (d[key] === null) return acc;
    acc.push([
      PX + (i / Math.max(n - 1, 1)) * chartW,
      PY + (1 - d[key]) * chartH,
    ]);
    return acc;
  }, []);
}

function areaPath(pts) {
  if (!pts.length) return '';
  const line = smoothPath(pts);
  const bottom = (PY + chartH).toFixed(1);
  return `${line} L${pts[pts.length - 1][0].toFixed(1)},${bottom} L${pts[0][0].toFixed(1)},${bottom} Z`;
}

// ── Day-column heatmap strip ──────────────────────────────────────────────────
function DayStrip({ dayData }) {
  return (
    <div className="flex gap-px mb-3">
      {dayData.map((d, i) => {
        const score = d.prayer !== null ? d.prayer
          : d.checkin > 0 ? 0.4
          : null;
        const bg = score === null ? 'rgba(255,255,255,0.04)'
          : score >= 0.8 ? 'rgba(29,158,117,0.55)'
          : score >= 0.5 ? 'rgba(201,149,42,0.45)'
          : score > 0    ? 'rgba(201,149,42,0.22)'
          : 'rgba(229,115,104,0.3)';
        return (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{ height: 8, background: bg }}
            title={d.date}
          />
        );
      })}
    </div>
  );
}

export default function SurgicalTracker({ userId, refreshKey = 0 }) {
  const [dayData,  setDayData]  = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [active,   setActive]   = useState(['prayer', 'dhikr', 'checkin']);

  useEffect(() => {
    if (!userId) return;
    load();
  }, [userId, refreshKey]);

  async function load() {
    const today = new Date().toISOString().split('T')[0];

    // Find earliest prayer record so chart starts from day 1
    const { data: firstRow } = await supabase
      .from('prayers').select('date').eq('user_id', userId)
      .order('date', { ascending: true }).limit(1).maybeSingle();

    const earliest = firstRow?.date
      ? new Date(firstRow.date + 'T12:00:00')
      : (() => { const d = new Date(); d.setDate(d.getDate() - 29); return d; })();

    const startDate = earliest;
    const startStr  = startDate.toISOString().split('T')[0];

    const [{ data: prayers }, { data: moods }, { data: tasks }] = await Promise.all([
      supabase.from('prayers').select('*').eq('user_id', userId).gte('date', startStr).lte('date', today),
      supabase.from('moods').select('date').eq('user_id', userId).gte('date', startStr).lte('date', today),
      supabase.from('user_tasks').select('due_date,completed').eq('user_id', userId).gte('due_date', startStr).lte('due_date', today),
    ]);

    // Build date array
    const dates = [];
    for (let d = new Date(startDate); d <= new Date(today + 'T12:00:00'); d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    const pMap  = {}; (prayers || []).forEach(r => { pMap[r.date] = r; });
    const mSet  = new Set((moods  || []).map(m => m.date));
    const tMap  = {};
    (tasks || []).forEach(t => {
      if (!tMap[t.due_date]) tMap[t.due_date] = { total: 0, done: 0 };
      tMap[t.due_date].total++;
      if (t.completed) tMap[t.due_date].done++;
    });

    const rows = dates.map(date => {
      const p = pMap[date];
      let prayer = null, dhikr = null;
      if (p) {
        const logged = PRAYER_KEYS.filter(k => p[k]).length;
        if (logged > 0) prayer = PRAYER_KEYS.filter(k => p[k] === 'on_time').length / 5;
        dhikr = ((p.morning_adhkar ? 1 : 0) + (p.evening_adhkar ? 1 : 0)) / 2;
      }
      const t = tMap[date];
      const taskScore = t ? t.done / t.total : null;
      const checkin   = mSet.has(date) ? 1 : 0;
      return { date, prayer, dhikr, checkin, tasks: taskScore };
    });

    // Summary
    const loggedPrayers = rows.filter(r => r.prayer !== null);
    const avgPrayer   = loggedPrayers.length
      ? Math.round(loggedPrayers.reduce((s, r) => s + r.prayer, 0) / loggedPrayers.length * 100) : 0;
    const dhikrDays   = rows.filter(r => r.dhikr !== null && r.dhikr > 0).length;
    const checkinDays = rows.filter(r => r.checkin > 0).length;
    const loggedTasks = rows.filter(r => r.tasks !== null);
    const avgTasks    = loggedTasks.length
      ? Math.round(loggedTasks.reduce((s, r) => s + r.tasks, 0) / loggedTasks.length * 100) : null;

    setDayData(rows);
    setSummary({ avgPrayer, dhikrDays, checkinDays, avgTasks, totalDays: dates.length, loggedPrayer: loggedPrayers.length });
    setLoading(false);
  }

  const toggle = (key) =>
    setActive(a => a.includes(key) ? a.filter(k => k !== key) : [...a, key]);

  if (loading || !summary) return null;

  const n = dayData.length;
  const startLabel = dayData[0]
    ? new Date(dayData[0].date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  return (
    <div className="rounded-3xl p-5" style={{
      background: 'linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
      border: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.28)',
    }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Your Journey
          </p>
          <p className="text-[11px] mt-0.5 font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {summary.totalDays} day{summary.totalDays !== 1 ? 's' : ''} tracked · from {startLabel}
          </p>
        </div>

        {/* Metric toggles */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {METRICS.map(m => {
            const on = active.includes(m.key);
            return (
              <button key={m.key} onClick={() => toggle(m.key)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-150"
                style={on
                  ? { background: m.activeBg, border: `1px solid ${m.activeBorder}`, color: m.color }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.2)' }
                }>
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Heatmap strip (daily snapshot) ── */}
      <DayStrip dayData={dayData} />

      {/* ── SVG line chart ── */}
      <div className="rounded-2xl overflow-hidden mb-1" style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="w-full" style={{ height: 130, display: 'block' }}>
          <defs>
            {METRICS.map(m => (
              <linearGradient key={m.key} id={`sg-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={m.color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={m.color} stopOpacity="0"    />
              </linearGradient>
            ))}
          </defs>

          {/* Subtle grid lines at 25 / 50 / 75 % */}
          {[0.25, 0.5, 0.75].map(frac => {
            const y = (PY + (1 - frac) * chartH).toFixed(1);
            return (
              <line key={frac}
                x1={PX} y1={y} x2={VW - PX} y2={y}
                stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
            );
          })}

          {/* Render each active metric */}
          {METRICS.filter(m => active.includes(m.key)).map(m => {
            const pts = toSvgPts(dayData, m.key, n);
            if (pts.length < 2) return null;
            return (
              <g key={m.key}>
                <path d={areaPath(pts)} fill={`url(#sg-${m.key})`} />
                <path
                  d={smoothPath(pts)}
                  fill="none"
                  stroke={m.color}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 4px ${m.color}80)` }}
                />
                {/* Endpoint dot */}
                {(() => {
                  const last = pts[pts.length - 1];
                  return (
                    <circle cx={last[0].toFixed(1)} cy={last[1].toFixed(1)} r="3"
                      fill={m.color} style={{ filter: `drop-shadow(0 0 5px ${m.color})` }} />
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Date axis ── */}
      <div className="flex justify-between mb-4 px-1">
        <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.15)' }}>{startLabel}</span>
        <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.15)' }}>Today</span>
      </div>

      {/* ── Summary stat chips ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="text-center rounded-2xl py-3 px-2"
          style={{ background: 'rgba(29,158,117,0.07)', border: '1px solid rgba(29,158,117,0.15)' }}>
          <p className="text-lg font-extrabold leading-none mb-1" style={{ color: '#1D9E75' }}>{summary.avgPrayer}%</p>
          <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>On-time avg</p>
        </div>
        <div className="text-center rounded-2xl py-3 px-2"
          style={{ background: 'rgba(201,149,42,0.07)', border: '1px solid rgba(201,149,42,0.15)' }}>
          <p className="text-lg font-extrabold leading-none mb-1" style={{ color: '#C9952A' }}>{summary.dhikrDays}</p>
          <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>Dhikr days</p>
        </div>
        <div className="text-center rounded-2xl py-3 px-2"
          style={{ background: 'rgba(155,126,255,0.07)', border: '1px solid rgba(155,126,255,0.15)' }}>
          <p className="text-lg font-extrabold leading-none mb-1" style={{ color: '#9B7EFF' }}>{summary.checkinDays}</p>
          <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>Check-ins</p>
        </div>
        <div className="text-center rounded-2xl py-3 px-2"
          style={{ background: 'rgba(96,165,224,0.07)', border: '1px solid rgba(96,165,224,0.15)' }}>
          <p className="text-lg font-extrabold leading-none mb-1" style={{ color: '#60A5E0' }}>
            {summary.avgTasks !== null ? `${summary.avgTasks}%` : '—'}
          </p>
          <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>Task rate</p>
        </div>
      </div>
    </div>
  );
}
