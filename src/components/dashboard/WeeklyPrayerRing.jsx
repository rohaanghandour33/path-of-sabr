import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const TOTAL_POSSIBLE = 35; // 7 days × 5 prayers

const CARD = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.28)',
};

const CX = 50, CY = 50, R = 38, SW = 7;
const CIRC = 2 * Math.PI * R;

export default function WeeklyPrayerRing({ userId, refreshKey = 0 }) {
  const [onTime, setOnTime] = useState(0);
  const [late, setLate]     = useState(0);
  const [missed, setMissed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const today = new Date();
    const start = new Date(today); start.setDate(today.getDate() - 6);
    supabase
      .from('prayers').select('*').eq('user_id', userId)
      .gte('date', start.toISOString().split('T')[0])
      .lte('date', today.toISOString().split('T')[0])
      .then(({ data }) => {
        let ot = 0, lt = 0, ms = 0;
        (data || []).forEach((r) => {
          PRAYER_KEYS.forEach((p) => {
            if (r[p] === 'on_time') ot++;
            else if (r[p] === 'late') lt++;
            else if (r[p] === 'missed') ms++;
          });
        });
        setOnTime(ot); setLate(lt); setMissed(ms);
        setLoading(false);
      });
  }, [userId, refreshKey]);

  if (loading) return null;

  const pct    = Math.round((onTime / TOTAL_POSSIBLE) * 100);
  const offset = CIRC * (1 - pct / 100);
  const logged = onTime + late + missed;

  const STATS = [
    { label: 'On time', value: onTime, color: '#1D9E75', glow: 'rgba(29,158,117,0.4)' },
    { label: 'Late',    value: late,   color: '#C9952A', glow: 'rgba(201,149,42,0.4)' },
    { label: 'Missed',  value: missed, color: '#e57368', glow: 'rgba(229,115,104,0.4)' },
  ];

  return (
    <div className="rounded-3xl p-5 flex flex-col" style={CARD}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Weekly Prayers
        </p>
        {logged > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.15)', color: 'rgba(29,158,117,0.7)' }}>
            {logged} logged
          </span>
        )}
      </div>

      {/* Ring + bar stats — horizontal */}
      <div className="flex items-center gap-5">

        {/* Compact ring */}
        <div className="relative flex-shrink-0" style={{ width: 88, height: 88 }}>
          <svg width="88" height="88" viewBox="0 0 100 100">
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(29,158,117,0.07)" strokeWidth={SW + 4} />
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={SW} />
            {pct > 0 && (
              <circle
                cx={CX} cy={CY} r={R}
                fill="none" stroke="#1D9E75" strokeWidth={SW} strokeLinecap="round"
                strokeDasharray={CIRC} strokeDashoffset={offset}
                transform={`rotate(-90 ${CX} ${CY})`}
                style={{
                  transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)',
                  filter: 'drop-shadow(0 0 5px rgba(29,158,117,0.55))',
                }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-extrabold leading-none"
              style={{ fontSize: '1.25rem', color: pct > 0 ? '#1D9E75' : 'rgba(255,255,255,0.18)' }}>
              {pct}%
            </span>
            <span className="text-[8px] font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
              on time
            </span>
          </div>
        </div>

        {/* Bar stats */}
        <div className="flex-1 space-y-3">
          {STATS.map(({ label, value, color, glow }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
                <span className="text-sm font-extrabold" style={{ color }}>{value}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${TOTAL_POSSIBLE > 0 ? (value / TOTAL_POSSIBLE) * 100 : 0}%`,
                    background: color,
                    boxShadow: `0 0 6px ${glow}`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-[9px] mt-4" style={{ color: 'rgba(255,255,255,0.12)' }}>
        35 prayers possible this week
      </p>
    </div>
  );
}
