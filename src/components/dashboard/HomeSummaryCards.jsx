import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function calcPrayerDayStreak(prayerHistory) {
  const dateMap = {};
  prayerHistory.forEach((r) => {
    dateMap[r.date] = PRAYER_KEYS.filter((k) => r[k]).length;
  });
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 31; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = dateMap[dateStr] || 0;
    if (i === 0 && count < 3) continue;
    if (count >= 3) streak++;
    else break;
  }
  return streak;
}

function calcCheckInStreak(moods) {
  const dateSet = new Set(moods.map((m) => m.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 31; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (dateSet.has(d.toISOString().split('T')[0])) streak++;
    else break;
  }
  return streak;
}

// ── Animated ring ─────────────────────────────────────────────────────────────
function Ring({ pct, color, size = 72, stroke = 6 }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 80); return () => clearTimeout(t); }, []);
  const cx = size / 2, cy = size / 2, r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - (drawn ? pct / 100 : 0));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      {pct > 0 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{
            transition: 'stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)',
            filter: `drop-shadow(0 0 4px ${color})`,
          }}
        />
      )}
    </svg>
  );
}

export default function HomeSummaryCards({ userId, onViewTasks, refreshKey = 0 }) {
  const [stats, setStats] = useState(null);
  const [barReady, setBarReady] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setBarReady(false); // re-animate bars on every refresh
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(); monthStart.setDate(monthStart.getDate() - 30);

    Promise.all([
      supabase.from('prayers').select('*').eq('user_id', userId)
        .gte('date', weekStart.toISOString().split('T')[0]).lte('date', today),
      supabase.from('moods').select('date').eq('user_id', userId)
        .gte('date', monthStart.toISOString().split('T')[0]).lte('date', today),
      supabase.from('user_tasks').select('id, completed').eq('user_id', userId)
        .gte('due_date', today),
    ]).then(([{ data: prayers }, { data: moods }, { data: tasks }]) => {
      let onTime = 0, totalLogged = 0;
      (prayers || []).forEach((r) => {
        PRAYER_KEYS.forEach((p) => {
          if (r[p]) { totalLogged++; if (r[p] === 'on_time') onTime++; }
        });
      });
      const prayerScore    = totalLogged > 0 ? (onTime / totalLogged) * 50 : 0;
      const checkInStreak  = calcCheckInStreak(moods || []);
      const streakScore    = Math.min(checkInStreak / 7, 1) * 25;
      const totalTasks     = (tasks || []).length;
      const doneTasks      = (tasks || []).filter((t) => t.completed).length;
      const taskScore      = totalTasks > 0 ? (doneTasks / totalTasks) * 25 : 0;
      const prayerDayStreak = calcPrayerDayStreak(prayers || []);

      setStats({
        imanScore: Math.round(prayerScore + streakScore + taskScore),
        prayerDayStreak,
        checkInStreak,
        totalTasks,
        doneTasks,
        totalLogged,
        onTime,
      });
    });
  }, [userId, refreshKey]);

  // Trigger animated bars after stats load
  useEffect(() => {
    if (stats) { const t = setTimeout(() => setBarReady(true), 120); return () => clearTimeout(t); }
  }, [stats]);

  if (!stats) return null;

  const { imanScore, prayerDayStreak, checkInStreak, totalTasks, doneTasks, totalLogged, onTime } = stats;
  const taskPct     = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const prayerPct   = totalLogged > 0 ? Math.round((onTime / totalLogged) * 100) : 0;

  const streakMsg =
    prayerDayStreak === 0 ? 'Log 3+ prayers daily to start your streak'
    : prayerDayStreak < 7 ? 'Keep going — your streak is building'
    : 'Alhamdulillah. Beautiful consistency';

  return (
    <div className="mt-10 mb-4">

      {/* Section label */}
      <div className="flex items-center gap-3 mb-6">
        <span style={{ color: 'rgba(201,149,42,0.45)', fontSize: '9px' }}>✦</span>
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Your Progress
        </p>
        <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(201,149,42,0.18), transparent)' }} />
      </div>

      {/* ── 3 stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Card 1 — Action Score */}
        <div
          className="rounded-3xl p-6 flex flex-col relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(201,149,42,0.1) 0%, rgba(201,149,42,0.03) 100%)',
            border: '1px solid rgba(201,149,42,0.18)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
          }}
        >
          {/* Decorative glow blob */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(201,149,42,0.18) 0%, transparent 70%)' }} />

          <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Action Score
          </p>

          {/* Ring + number */}
          <div className="flex items-center gap-5 mb-5">
            <div className="relative flex-shrink-0">
              <Ring pct={imanScore} color="#C9952A" size={80} stroke={7} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-extrabold" style={{ color: '#C9952A' }}>{imanScore}</span>
              </div>
            </div>
            <div>
              <p className="text-4xl font-extrabold leading-none mb-1" style={{ color: '#C9952A' }}>
                {imanScore}
                <span className="text-base font-semibold ml-1" style={{ color: 'rgba(201,149,42,0.4)' }}>/100</span>
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>this week</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: barReady ? `${imanScore}%` : '0%',
                background: 'linear-gradient(90deg, #C9952A, #e8b84b)',
                boxShadow: '0 0 8px rgba(201,149,42,0.6)',
                transition: 'width 1.1s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>

          <p className="text-[10px] leading-relaxed mt-auto" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Based on your actions this week. Only Allah knows what's in the heart.
          </p>
        </div>

        {/* Card 2 — Prayer Streak */}
        <div
          className="rounded-3xl p-6 flex flex-col relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(29,158,117,0.1) 0%, rgba(29,158,117,0.03) 100%)',
            border: '1px solid rgba(29,158,117,0.18)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
          }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(29,158,117,0.18) 0%, transparent 70%)' }} />

          <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Prayer Streak
          </p>

          <div className="flex items-center gap-5 mb-5">
            <div className="relative flex-shrink-0">
              <Ring pct={Math.min(prayerDayStreak * 10, 100)} color="#1D9E75" size={80} stroke={7} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-extrabold" style={{ color: '#1D9E75' }}>
                  {prayerDayStreak > 9 ? '🔥' : prayerDayStreak}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-extrabold leading-none" style={{ color: '#1D9E75' }}>
                  {prayerDayStreak}
                </span>
                {prayerDayStreak > 0 && <span className="text-lg">⭐</span>}
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>consecutive days</p>
            </div>
          </div>

          {/* Prayer accuracy bar */}
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: barReady ? `${prayerPct}%` : '0%',
                background: 'linear-gradient(90deg, #1D9E75, #23c68f)',
                boxShadow: '0 0 8px rgba(29,158,117,0.6)',
                transition: 'width 1.1s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>

          <p className="text-[10px] leading-relaxed mt-auto" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {streakMsg}
          </p>
        </div>

        {/* Card 3 — Tasks + Check-in */}
        <div
          className="rounded-3xl p-6 flex flex-col relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(29,158,117,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(29,158,117,0.15)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
          }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(29,158,117,0.12) 0%, transparent 70%)' }} />

          <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.22)' }}>
            This Week
          </p>

          {/* Check-in streak mini stat */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Check-ins</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold leading-none" style={{ color: '#1D9E75' }}>{checkInStreak}</span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>day streak</span>
              </div>
            </div>
            <div className="w-px self-stretch mx-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Tasks</p>
              {totalTasks === 0 ? (
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>None yet</span>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold leading-none" style={{ color: '#1D9E75' }}>{doneTasks}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>of {totalTasks}</span>
                </div>
              )}
            </div>
          </div>

          {/* Task progress bar */}
          {totalTasks > 0 && (
            <>
              <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: barReady ? `${taskPct}%` : '0%',
                    background: 'linear-gradient(90deg, #1D9E75, #23c68f)',
                    boxShadow: '0 0 8px rgba(29,158,117,0.6)',
                    transition: 'width 1.1s cubic-bezier(0.4,0,0.2,1)',
                  }}
                />
              </div>
              <p className="text-[10px] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {taskPct}% complete
              </p>
            </>
          )}

          <button
            onClick={onViewTasks}
            className="mt-auto w-full py-3 rounded-2xl text-xs font-bold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'rgba(29,158,117,0.12)',
              border: '1px solid rgba(29,158,117,0.28)',
              color: '#1D9E75',
            }}
          >
            View Tasks →
          </button>
        </div>

      </div>

      {/* Arabic footer */}
      <div className="mt-8 text-center">
        <p className="arabic-text text-lg mb-1" style={{ color: 'rgba(201,149,42,0.2)' }}>
          وَاللَّهُ يُحِبُّ الصَّابِرِينَ
        </p>
        <p className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.08)' }}>
          And Allah loves the patient — Al-Imran 3:146
        </p>
      </div>
    </div>
  );
}
