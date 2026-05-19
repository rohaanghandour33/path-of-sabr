import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const TOTAL_POSSIBLE = 35; // 7 days × 5 prayers

const CARD = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.28)',
};

// SVG ring maths
const CX = 50, CY = 50, R = 38, SW = 7;
const CIRC = 2 * Math.PI * R; // ≈ 238.76

export default function WeeklyPrayerRing({ userId }) {
  const [onTime, setOnTime] = useState(0);
  const [late, setLate]     = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const today = new Date();
    const start = new Date(today); start.setDate(today.getDate() - 6);
    supabase
      .from('prayers')
      .select('*')
      .eq('user_id', userId)
      .gte('date', start.toISOString().split('T')[0])
      .lte('date', today.toISOString().split('T')[0])
      .then(({ data }) => {
        let ot = 0, lt = 0;
        (data || []).forEach((r) => {
          PRAYER_KEYS.forEach((p) => {
            if (r[p] === 'on_time') ot++;
            else if (r[p] === 'late') lt++;
          });
        });
        setOnTime(ot);
        setLate(lt);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return null;

  const pct    = Math.round((onTime / TOTAL_POSSIBLE) * 100);
  const offset = CIRC * (1 - pct / 100);

  // Day‑of‑week labels for a mini 7‑dot legend
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="rounded-3xl p-6 h-full flex flex-col" style={CARD}>
      {/* Label */}
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
        Weekly Prayers
      </p>
      <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.18)' }}>prayers on time this week</p>

      {/* Ring */}
      <div className="flex flex-col items-center flex-1 justify-center gap-5">
        <div className="relative" style={{ width: 150, height: 150 }}>
          <svg width="150" height="150" viewBox="0 0 100 100">
            {/* Subtle glow behind the fill */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="rgba(29,158,117,0.08)"
              strokeWidth={SW + 4}
            />
            {/* Track */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={SW}
            />
            {/* Fill */}
            {pct > 0 && (
              <circle
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke="#1D9E75"
                strokeWidth={SW}
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${CX} ${CY})`}
                style={{
                  transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: 'drop-shadow(0 0 5px rgba(29,158,117,0.55))',
                }}
              />
            )}
          </svg>

          {/* Centre text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-extrabold leading-none"
              style={{ fontSize: '2rem', color: pct > 0 ? '#1D9E75' : 'rgba(255,255,255,0.18)' }}
            >
              {pct}%
            </span>
            <span className="text-[10px] font-semibold mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
              on time
            </span>
          </div>
        </div>

        {/* Stat row */}
        <div className="w-full grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'On time', value: onTime,                  color: '#1D9E75', bg: 'rgba(29,158,117,0.08)',  border: 'rgba(29,158,117,0.15)' },
            { label: 'Late',    value: late,                    color: '#C9952A', bg: 'rgba(201,149,42,0.08)', border: 'rgba(201,149,42,0.15)' },
            { label: 'Total',   value: TOTAL_POSSIBLE - onTime - late, color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)' },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} className="rounded-2xl py-3" style={{ background: bg, border: `1px solid ${border}` }}>
              <p className="text-lg font-extrabold leading-none" style={{ color }}>{value}</p>
              <p className="text-[9px] mt-1.5 font-semibold tracking-wide uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
