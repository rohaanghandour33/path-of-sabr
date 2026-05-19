import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// Consecutive days (going back from today) where user logged at least 3 prayers
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

    // Skip today if they haven't logged enough yet — don't break the streak
    if (i === 0 && count < 3) continue;
    if (count >= 3) streak++;
    else break;
  }
  return streak;
}

// Consecutive days (going back from today) with a mood/check-in entry
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

export default function HomeSummaryCards({ userId, onViewTasks }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    Promise.all([
      supabase.from('prayers').select('*').eq('user_id', userId).gte('date', weekStartStr).lte('date', today),
      supabase.from('moods').select('date').eq('user_id', userId).gte('date', monthStartStr).lte('date', today),
      supabase.from('user_tasks').select('id, completed').eq('user_id', userId).gte('due_date', today),
    ]).then(([{ data: prayers }, { data: moods }, { data: tasks }]) => {
      // ── Prayer consistency score (50 pts) ─────────────────────────────────
      let onTime = 0, totalLogged = 0;
      (prayers || []).forEach((r) => {
        PRAYER_KEYS.forEach((p) => {
          if (r[p]) { totalLogged++; if (r[p] === 'on_time') onTime++; }
        });
      });
      const prayerScore = totalLogged > 0 ? (onTime / totalLogged) * 50 : 0;

      // ── Check-in streak score (25 pts) ───────────────────────────────────
      const checkInStreak = calcCheckInStreak(moods || []);
      const streakScore   = Math.min(checkInStreak / 7, 1) * 25;

      // ── Task completion score (25 pts) ───────────────────────────────────
      const totalTasks = (tasks || []).length;
      const doneTasks  = (tasks || []).filter((t) => t.completed).length;
      const taskScore  = totalTasks > 0 ? (doneTasks / totalTasks) * 25 : 0;

      // ── Prayer day streak ────────────────────────────────────────────────
      const prayerDayStreak = calcPrayerDayStreak(prayers || []);

      setStats({
        imanScore: Math.round(prayerScore + streakScore + taskScore),
        prayerDayStreak,
        totalTasks,
        doneTasks,
      });
    });
  }, [userId]);

  if (!stats) return null;

  const { imanScore, prayerDayStreak, totalTasks, doneTasks } = stats;
  const taskPct  = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const streakMsg =
    prayerDayStreak === 0 ? 'Log 3 or more prayers daily to start your streak.'
    : prayerDayStreak < 7 ? 'Keep going. Your streak is building.'
    : 'Alhamdulillah. Beautiful consistency.';

  return (
    <div className="mt-8 mb-4">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-4">
        <p className="text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: 'rgba(255,255,255,0.22)' }}>
          Your Progress
        </p>
        <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(201,149,42,0.2), transparent)' }} />
      </div>

      {/* Cards — 3-col on md+, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        {/* ── Card 1: Iman Score ──────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 flex flex-col"
          style={{
            background: 'linear-gradient(145deg, rgba(201,149,42,0.09) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(201,149,42,0.16)',
            boxShadow: '0 1px 0 rgba(201,149,42,0.05) inset, 0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Iman Score
          </p>

          <span
            className="font-extrabold leading-none mb-3"
            style={{ fontSize: '3.2rem', color: '#C9952A', lineHeight: 1 }}
          >
            {imanScore}
          </span>

          {/* Gold progress bar */}
          <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${imanScore}%`, background: 'linear-gradient(90deg, #C9952A, #e8b84b)' }}
            />
          </div>

          <p className="text-[11px] leading-relaxed mt-auto" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Based on your prayers, check-ins and tasks.
          </p>
        </div>

        {/* ── Card 2: Prayer Streak ───────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 flex flex-col"
          style={{
            background: 'linear-gradient(145deg, rgba(29,158,117,0.09) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(29,158,117,0.16)',
            boxShadow: '0 1px 0 rgba(29,158,117,0.05) inset, 0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Prayer Streak
          </p>

          <div className="flex items-baseline gap-2.5 mb-1">
            <span
              className="font-extrabold leading-none"
              style={{ fontSize: '3.2rem', color: '#1D9E75', lineHeight: 1 }}
            >
              {prayerDayStreak}
            </span>
            <span className="text-2xl leading-none" style={{ marginBottom: '2px' }}>⭐</span>
          </div>

          <p className="text-xs font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.28)' }}>
            consecutive days
          </p>

          <p className="text-[11px] leading-relaxed mt-auto" style={{ color: 'rgba(255,255,255,0.22)' }}>
            {streakMsg}
          </p>
        </div>

        {/* ── Card 3: Tasks This Week ─────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 flex flex-col"
          style={{
            background: 'linear-gradient(145deg, rgba(29,158,117,0.09) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(29,158,117,0.16)',
            boxShadow: '0 1px 0 rgba(29,158,117,0.05) inset, 0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Tasks This Week
          </p>

          {totalTasks === 0 ? (
            <p className="text-sm flex-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
              No tasks generated yet.
            </p>
          ) : (
            <>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span
                  className="font-extrabold leading-none"
                  style={{ fontSize: '3.2rem', color: '#1D9E75', lineHeight: 1 }}
                >
                  {doneTasks}
                </span>
                <span className="text-xl font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  of {totalTasks}
                </span>
              </div>

              {/* Task progress bar */}
              <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${taskPct}%`, background: 'linear-gradient(90deg, #1D9E75, #23c68f)' }}
                />
              </div>
            </>
          )}

          {/* View Tasks button — always shown */}
          <button
            onClick={onViewTasks}
            className="mt-auto w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
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
    </div>
  );
}
