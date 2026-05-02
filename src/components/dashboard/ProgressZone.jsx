import { useState, useEffect } from 'react';
import { TrendingUp, Minus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function fmt(d) { return d.toISOString().split('T')[0]; }

function onTimeRate(records) {
  let total = 0, onTime = 0;
  records.forEach(r => { PRAYER_KEYS.forEach(p => { if (r[p]) { total++; if (r[p] === 'on_time') onTime++; } }); });
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
    const d = new Date(referenceDate); d.setDate(referenceDate.getDate() - i);
    if (moodDates.has(fmt(d))) streak++; else break;
  }
  return streak;
}

function calcLongestStreak(moods, startStr, endStr) {
  const moodDates = new Set(moods.map(m => m.date));
  let max = 0, cur = 0;
  const d = new Date(startStr + 'T12:00:00');
  const end = new Date(endStr + 'T12:00:00');
  while (d <= end) {
    if (moodDates.has(fmt(d))) { cur++; if (cur > max) max = cur; } else cur = 0;
    d.setDate(d.getDate() + 1);
  }
  return max;
}

function calcEngagement(prayers, moods) { return prayers.length + moods.length; }

function calcRecovery(recs) {
  let missed = 0, recovered = 0;
  recs.forEach(r => {
    const hasMiss   = PRAYER_KEYS.some(p => r[p] === 'missed');
    const hasLogged = PRAYER_KEYS.some(p => r[p] === 'on_time' || r[p] === 'late');
    if (hasMiss) { missed++; if (hasLogged) recovered++; }
  });
  return missed > 0 ? Math.round((recovered / missed) * 100) : null;
}

function MetricCard({ title, value, unit, trend, trendLabel, message }) {
  const TrendIcon = trend === 'up' ? TrendingUp : Minus;
  const trendColor = trend === 'up' ? '#1D9E75' : 'rgba(255,255,255,0.25)';

  return (
    <div
      className="rounded-2xl p-5 flex flex-col flex-1 min-w-[160px]"
      style={{
        background: 'linear-gradient(145deg, rgba(201,149,42,0.07) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(201,149,42,0.12)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      }}
    >
      <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.28)' }}>
        {title}
      </p>
      <div className="flex items-baseline gap-1.5 mb-auto">
        <span className="font-bold leading-none tracking-tight" style={{ fontSize: '2rem', color: '#C9952A' }}>{value}</span>
        {unit && <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.28)' }}>{unit}</span>}
      </div>
      <div className="flex items-center gap-1.5 mt-4 mb-2">
        <TrendIcon size={11} style={{ color: trendColor }} strokeWidth={2.5} />
        <span className="text-[10px] font-medium" style={{ color: trendColor }}>{trendLabel}</span>
      </div>
      <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>{message}</p>
    </div>
  );
}

export default function ProgressZone({ userId, weekOffset = 0, customRange = null }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setMetrics(null); setLoading(true); fetchData();
  }, [userId, weekOffset, customRange?.start, customRange?.end]);

  const fetchData = async () => {
    if (customRange) {
      const [{ data: prayers }, { data: moods }] = await Promise.all([
        supabase.from('prayers').select('*').eq('user_id', userId).gte('date', customRange.start).lte('date', customRange.end).order('date', { ascending: true }),
        supabase.from('moods').select('*').eq('user_id', userId).gte('date', customRange.start).lte('date', customRange.end).order('date', { ascending: true }),
      ]);
      const days = Math.round((new Date(customRange.end + 'T12:00:00') - new Date(customRange.start + 'T12:00:00')) / 86400000) + 1;
      const across = `across ${days} days`;
      const rate = onTimeRate(prayers || []);
      const streak = calcLongestStreak(moods || [], customRange.start, customRange.end);
      const conn = avgScore(moods || []);
      const rec = calcRecovery(prayers || []);
      const eng = calcEngagement(prayers || [], moods || []);
      setMetrics({
        consistency: { value: rate !== null ? String(rate) : '—', unit: rate !== null ? '%' : '', trend: rate !== null ? 'up' : 'flat', trendLabel: rate !== null ? across : 'No prayer data', msg: rate === null ? 'Log prayers to see consistency' : rate >= 70 ? `${rate}% of logged prayers on time` : 'Keep showing up — every prayer counts' },
        streak:      { value: String(streak), unit: streak === 1 ? 'day' : 'days', trend: streak > 0 ? 'up' : 'flat', trendLabel: 'longest streak', msg: streak === 0 ? 'No check-in streak this period' : streak < 7 ? 'Building consistency' : 'Alhamdulillah — strong consistency' },
        connection:  { value: conn !== null ? String(conn) : '—', unit: conn !== null ? '/ 5' : '', trend: conn !== null ? 'up' : 'flat', trendLabel: conn !== null ? across : 'No check-ins', msg: conn === null ? 'Complete check-ins to track connection' : conn >= 4 ? 'Feeling close to Allah' : 'Your heart is reaching — keep going' },
        recovery:    { value: rec !== null ? String(rec) : '—', unit: rec !== null ? '%' : '', trend: rec !== null ? 'up' : 'flat', trendLabel: rec !== null ? across : (prayers || []).length > 0 ? 'No misses logged' : 'No data', msg: rec === null ? ((prayers || []).length > 0 ? 'Alhamdulillah — no missed prayers' : 'Log prayers to track recovery') : rec >= 80 ? 'You bounce back quickly — real sabr' : 'After every miss, come back stronger' },
        engagement:  { value: String(eng), unit: 'actions', trend: eng > 0 ? 'up' : 'flat', trendLabel: across, msg: eng === 0 ? 'No activity logged this period' : `${eng} total actions over ${days} days` },
      });
      setLoading(false);
      return;
    }

    const anchor = new Date(); anchor.setHours(0, 0, 0, 0); anchor.setDate(anchor.getDate() - weekOffset * 7);
    const thisWeekEnd = new Date(anchor);
    const thisWeekStart = new Date(anchor); thisWeekStart.setDate(anchor.getDate() - 6);
    const lastWeekStart = new Date(anchor); lastWeekStart.setDate(anchor.getDate() - 13);
    const streakStart = new Date(anchor); streakStart.setDate(anchor.getDate() - 30);

    const [{ data: prayers }, { data: moods }] = await Promise.all([
      supabase.from('prayers').select('*').eq('user_id', userId).gte('date', fmt(lastWeekStart)).lte('date', fmt(thisWeekEnd)).order('date', { ascending: true }),
      supabase.from('moods').select('*').eq('user_id', userId).gte('date', fmt(streakStart)).lte('date', fmt(thisWeekEnd)).order('date', { ascending: true }),
    ]);

    const thisWeekP = (prayers || []).filter(r => r.date >= fmt(thisWeekStart) && r.date <= fmt(thisWeekEnd));
    const lastWeekP = (prayers || []).filter(r => r.date < fmt(thisWeekStart));
    const thisWeekM = (moods || []).filter(r => r.date >= fmt(thisWeekStart) && r.date <= fmt(thisWeekEnd));
    const lastWeekM = (moods || []).filter(r => r.date < fmt(thisWeekStart) && r.date >= fmt(lastWeekStart));

    const thisRate = onTimeRate(thisWeekP), lastRate = onTimeRate(lastWeekP);
    let cV, cT, cL, cM;
    if (thisRate === null) { cV = '—'; cT = 'flat'; cL = 'No data yet'; cM = 'Start logging prayers'; }
    else if (thisRate === 100) { cV = '100'; cT = 'up'; cL = 'Perfect week'; cM = 'Alhamdulillah — every prayer on time'; }
    else { const d = lastRate !== null ? thisRate - lastRate : 0; cV = String(thisRate); cT = d >= 0 ? 'up' : 'flat'; cL = d > 0 ? `+${d}% vs prev week` : d < 0 ? `${d}% vs prev week` : 'Same as prev week'; cM = d > 0 ? 'On-time prayers improving' : d < 0 ? 'Keep going — every prayer counts' : 'Steady — push a little higher'; }

    const streak = calcCheckInStreak(moods || [], anchor);
    const streakMsg = streak === 0 ? (weekOffset === 0 ? 'Complete your first check-in today' : 'No streak at this point') : streak < 5 ? 'Building momentum' : 'Alhamdulillah — beautiful consistency';

    const thisConn = avgScore(thisWeekM), lastConn = avgScore(lastWeekM);
    let connV, connT, connL, connM;
    if (thisConn === null) { connV = '—'; connT = 'flat'; connL = 'No check-ins'; connM = 'Complete a check-in to track connection'; }
    else { const d = lastConn !== null ? +(thisConn - lastConn).toFixed(1) : 0; connV = String(thisConn); connT = d >= 0 ? 'up' : 'flat'; connL = d > 0 ? `+${d} vs prev week` : d < 0 ? `${d} vs prev week` : 'Stable'; connM = d > 0 ? 'Feeling more connected — keep going' : d < 0 ? 'Your heart is still reaching' : 'Holding steady this week'; }

    const thisRec = calcRecovery(thisWeekP), lastRec = calcRecovery(lastWeekP);
    let rV, rT, rL, rM;
    if (thisRec === null) { rV = '—'; rT = 'flat'; rL = 'No misses this week'; rM = thisWeekP.length > 0 ? 'Alhamdulillah — no missed prayers' : 'Log prayers to track recovery'; }
    else { const d = lastRec !== null ? thisRec - lastRec : 0; rV = String(thisRec); rT = d >= 0 ? 'up' : 'flat'; rL = d > 0 ? `+${d}% faster` : d < 0 ? 'Keep bouncing back' : 'Consistent recovery'; rM = thisRec >= 80 ? 'You recover quickly — real sabr' : 'After every miss, come back stronger'; }

    const thisEng = calcEngagement(thisWeekP, thisWeekM), lastEng = calcEngagement(lastWeekP, lastWeekM);
    let eV, eT, eL, eM;
    if (thisEng === 0) { eV = '0'; eT = 'flat'; eL = 'No activity yet'; eM = 'Open the app daily — small steps matter'; }
    else { const d = thisEng - lastEng; eV = String(thisEng); eT = d >= 0 ? 'up' : 'flat'; eL = d > 0 ? `+${d} vs prev week` : d < 0 ? 'Keep coming back' : 'Same as prev week'; eM = d > 0 ? 'More active this week — keep going' : d < 0 ? 'Come back a little more' : 'Steady — push a little harder'; }

    setMetrics({
      consistency: { value: cV, unit: cV !== '—' ? '%' : '', trend: cT, trendLabel: cL, msg: cM },
      streak:      { value: String(streak), unit: streak === 1 ? 'day' : 'days', trend: streak > 0 ? 'up' : 'flat', trendLabel: streak > 0 ? `${streak} day streak` : 'No streak yet', msg: streakMsg },
      connection:  { value: connV, unit: connV !== '—' ? '/ 5' : '', trend: connT, trendLabel: connL, msg: connM },
      recovery:    { value: rV, unit: rV !== '—' ? '%' : '', trend: rT, trendLabel: rL, msg: rM },
      engagement:  { value: eV, unit: 'actions', trend: eT, trendLabel: eL, msg: eM },
    });
    setLoading(false);
  };

  if (loading) return null;
  if (!metrics) return null;

  const CARDS = [
    { title: 'Prayer Consistency', ...metrics.consistency },
    { title: customRange ? 'Longest Streak' : 'Check-in Streak', ...metrics.streak },
    { title: 'Connection Score',   ...metrics.connection },
    { title: 'Recovery Speed',     ...metrics.recovery },
    { title: 'Engagement',         ...metrics.engagement },
  ];

  return (
    <div className="mt-6 mb-4">
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
        Your Progress
      </p>
      <div className="hidden lg:grid lg:grid-cols-5 gap-3">
        {CARDS.map((c) => <MetricCard key={c.title} title={c.title} value={c.value} unit={c.unit} trend={c.trend} trendLabel={c.trendLabel} message={c.msg} />)}
      </div>
      <div className="flex lg:hidden gap-2.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {CARDS.map((c) => <MetricCard key={c.title} title={c.title} value={c.value} unit={c.unit} trend={c.trend} trendLabel={c.trendLabel} message={c.msg} />)}
      </div>
    </div>
  );
}
