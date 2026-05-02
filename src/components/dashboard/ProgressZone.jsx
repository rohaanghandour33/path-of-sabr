import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function fmt(d) { return d.toISOString().split('T')[0]; }

function onTimeRate(records) {
  let total = 0, onTime = 0;
  records.forEach(r => {
    PRAYER_KEYS.forEach(p => {
      if (r[p]) { total++; if (r[p] === 'on_time') onTime++; }
    });
  });
  return total > 0 ? Math.round((onTime / total) * 100) : null;
}

function avgScore(moods) {
  const scores = moods.map(m => m.mood_score).filter(Boolean);
  return scores.length > 0 ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
}

function calcCheckInStreak(moods, referenceDate) {
  const moodDates = new Set(moods.map(m => m.date));
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(referenceDate);
    d.setDate(referenceDate.getDate() - i);
    if (moodDates.has(fmt(d))) streak++;
    else break;
  }
  return streak;
}

function calcEngagement(prayers, moods) {
  return prayers.length + moods.length;
}

function MetricCard({ title, value, unit, trend, trendLabel, message }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? '#1D9E75' : 'rgba(255,255,255,0.3)';

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2 flex-1 min-w-0"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(201,149,42,0.15)',
      }}
    >
      <p className="text-white/50 text-xs font-medium leading-snug">{title}</p>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-bold" style={{ color: '#C9952A' }}>{value}</span>
        {unit && <span className="text-white/40 text-xs mb-0.5">{unit}</span>}
      </div>
      <div className="flex items-center gap-1">
        <TrendIcon size={12} style={{ color: trendColor }} strokeWidth={2.5} />
        <span className="text-xs" style={{ color: trendColor }}>{trendLabel}</span>
      </div>
      <p className="text-white/30 text-xs leading-snug mt-0.5">{message}</p>
    </div>
  );
}

export default function ProgressZone({ userId, weekOffset = 0 }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setMetrics(null);
    setLoading(true);
    fetchData();
  }, [userId, weekOffset]);

  const fetchData = async () => {
    // Anchor = last day of the selected week
    const anchor = new Date();
    anchor.setHours(0, 0, 0, 0);
    anchor.setDate(anchor.getDate() - weekOffset * 7);

    const thisWeekEnd   = new Date(anchor);
    const thisWeekStart = new Date(anchor);
    thisWeekStart.setDate(anchor.getDate() - 6);

    const lastWeekStart = new Date(anchor);
    lastWeekStart.setDate(anchor.getDate() - 13);

    // For streak we need ~30 days before the anchor
    const streakStart = new Date(anchor);
    streakStart.setDate(anchor.getDate() - 30);

    const [{ data: prayers }, { data: moods }] = await Promise.all([
      supabase.from('prayers').select('*').eq('user_id', userId)
        .gte('date', fmt(lastWeekStart))
        .lte('date', fmt(thisWeekEnd))
        .order('date', { ascending: true }),
      supabase.from('moods').select('*').eq('user_id', userId)
        .gte('date', fmt(streakStart))
        .lte('date', fmt(thisWeekEnd))
        .order('date', { ascending: true }),
    ]);

    const thisWeekP = (prayers || []).filter(r => r.date >= fmt(thisWeekStart) && r.date <= fmt(thisWeekEnd));
    const lastWeekP = (prayers || []).filter(r => r.date < fmt(thisWeekStart));
    const thisWeekM = (moods || []).filter(r => r.date >= fmt(thisWeekStart) && r.date <= fmt(thisWeekEnd));
    const lastWeekM = (moods || []).filter(r => r.date < fmt(thisWeekStart) && r.date >= fmt(lastWeekStart));

    // 1. Prayer consistency
    const thisRate = onTimeRate(thisWeekP);
    const lastRate = onTimeRate(lastWeekP);
    let consistencyValue, consistencyTrend, consistencyTrendLabel, consistencyMsg;
    if (thisRate === null) {
      consistencyValue = '—'; consistencyTrend = 'flat';
      consistencyTrendLabel = 'No data yet';
      consistencyMsg = 'Start logging prayers to track consistency';
    } else if (thisRate === 100) {
      consistencyValue = '100'; consistencyTrend = 'up';
      consistencyTrendLabel = 'Perfect week';
      consistencyMsg = 'Alhamdulillah — every prayer on time this week';
    } else {
      const diff = lastRate !== null ? thisRate - lastRate : 0;
      consistencyValue = String(thisRate);
      consistencyTrend = diff >= 0 ? 'up' : 'flat';
      consistencyTrendLabel = diff > 0 ? `+${diff}% vs prev week` : diff < 0 ? `${diff}% vs prev week` : 'Same as prev week';
      consistencyMsg = diff > 0 ? 'Alhamdulillah — on-time prayers improving' : diff < 0 ? 'Keep going — every prayer counts' : 'Steady — aim to push higher this week';
    }

    // 2. Check-in streak (as of the anchor date)
    const streak = calcCheckInStreak(moods || [], anchor);
    let streakMsg;
    if (streak === 0) streakMsg = weekOffset === 0 ? 'Complete your first check-in today' : 'No streak at this point';
    else if (streak === 1) streakMsg = 'Good start — keep it going tomorrow';
    else if (streak < 5) streakMsg = 'Building momentum, keep showing up';
    else streakMsg = 'Alhamdulillah — your consistency is beautiful';

    // 3. Connection score
    const thisConn = avgScore(thisWeekM);
    const lastConn = avgScore(lastWeekM);
    let connValue, connTrend, connTrendLabel, connMsg;
    if (thisConn === null) {
      connValue = '—'; connTrend = 'flat';
      connTrendLabel = 'No check-ins yet';
      connMsg = 'Complete a daily check-in to track your connection';
    } else {
      const diff = lastConn !== null ? +(thisConn - lastConn).toFixed(1) : 0;
      connValue = String(thisConn);
      connTrend = diff >= 0 ? 'up' : 'flat';
      connTrendLabel = diff > 0 ? `+${diff} vs prev week` : diff < 0 ? `${diff} vs prev week` : 'Stable';
      connMsg = diff > 0 ? 'Feeling more connected to Allah — keep nurturing this' : diff < 0 ? 'Your heart is still reaching — Allah sees your effort' : 'Your connection is holding steady this week';
    }

    // 4. Recovery speed
    const calcRecovery = (recs) => {
      let missed = 0, recovered = 0;
      recs.forEach(r => {
        const hasMiss = PRAYER_KEYS.some(p => r[p] === 'missed');
        const hasLogged = PRAYER_KEYS.some(p => r[p] === 'on_time' || r[p] === 'late');
        if (hasMiss) { missed++; if (hasLogged) recovered++; }
      });
      return missed > 0 ? Math.round((recovered / missed) * 100) : null;
    };
    const thisRec = calcRecovery(thisWeekP);
    const lastRec = calcRecovery(lastWeekP);
    let recValue, recTrend, recTrendLabel, recMsg;
    if (thisRec === null) {
      recValue = '—'; recTrend = 'flat';
      recTrendLabel = 'No misses this week';
      recMsg = thisWeekP.length > 0 ? 'Alhamdulillah — no missed prayers logged' : 'Log your prayers to track recovery';
    } else {
      const diff = lastRec !== null ? thisRec - lastRec : 0;
      recValue = String(thisRec);
      recTrend = diff >= 0 ? 'up' : 'flat';
      recTrendLabel = diff > 0 ? `+${diff}% faster` : diff < 0 ? 'Keep bouncing back' : 'Consistent recovery';
      recMsg = thisRec >= 80 ? 'You get back on track quickly — that\'s real sabr' : 'After every miss, come back stronger';
    }

    // 5. Overall engagement
    const thisEng = calcEngagement(thisWeekP, thisWeekM);
    const lastEng = calcEngagement(lastWeekP, lastWeekM);
    let engValue, engTrend, engTrendLabel, engMsg;
    if (thisEng === 0) {
      engValue = '0'; engTrend = 'flat';
      engTrendLabel = 'No activity yet';
      engMsg = 'Open the app daily — small steps lead to big change';
    } else {
      const diff = thisEng - lastEng;
      engValue = String(thisEng);
      engTrend = diff >= 0 ? 'up' : 'flat';
      engTrendLabel = diff > 0 ? `+${diff} more than prev week` : diff < 0 ? 'Keep coming back' : 'Same as prev week';
      engMsg = diff > 0 ? 'More active this week than last — keep going' : diff < 0 ? 'Come back a little more this week' : 'Steady engagement — push a little harder';
    }

    setMetrics({
      consistency: { value: consistencyValue, unit: '%', trend: consistencyTrend, trendLabel: consistencyTrendLabel, msg: consistencyMsg },
      streak:      { value: String(streak),    unit: streak === 1 ? 'day' : 'days', trend: streak > 0 ? 'up' : 'flat', trendLabel: streak > 0 ? `${streak} day streak` : 'No streak yet', msg: streakMsg },
      connection:  { value: connValue,          unit: connValue !== '—' ? '/ 5' : '', trend: connTrend, trendLabel: connTrendLabel, msg: connMsg },
      recovery:    { value: recValue,           unit: recValue !== '—' ? '%' : '', trend: recTrend, trendLabel: recTrendLabel, msg: recMsg },
      engagement:  { value: engValue,           unit: 'actions', trend: engTrend, trendLabel: engTrendLabel, msg: engMsg },
    });
    setLoading(false);
  };

  if (loading) return null;
  if (!metrics) return null;

  const CARDS = [
    { title: 'Prayer Consistency', ...metrics.consistency },
    { title: 'Check-in Streak',    ...metrics.streak },
    { title: 'Connection Score',   ...metrics.connection },
    { title: 'Recovery Speed',     ...metrics.recovery },
    { title: 'Engagement',         ...metrics.engagement },
  ];

  return (
    <div className="mt-6 mb-4">
      <h2 className="text-white font-semibold text-sm mb-3">Your Progress</h2>
      {/* 5-column grid on desktop */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-3">
        {CARDS.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            unit={card.unit}
            trend={card.trend}
            trendLabel={card.trendLabel}
            message={card.msg}
          />
        ))}
      </div>
      {/* Horizontal scroll on mobile */}
      <div className="flex lg:hidden gap-2.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {CARDS.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            unit={card.unit}
            trend={card.trend}
            trendLabel={card.trendLabel}
            message={card.msg}
          />
        ))}
      </div>
    </div>
  );
}
