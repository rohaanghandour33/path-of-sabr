import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { generateTasks } from '../../lib/taskUtils';
import TrophyShelf from './TrophyShelf';

const TYPE_ICONS  = { prayer: '🕌', quran: '📖', dhikr: '📿', character: '⭐', relationship: '❤️' };
const TYPE_LABELS = { prayer: 'Prayer', quran: 'Quran', dhikr: 'Dhikr', character: 'Character', relationship: 'Relationships' };
const TYPE_COLOR  = {
  prayer:       { accent: '#1D9E75', bg: 'rgba(29,158,117,0.13)',  border: 'rgba(29,158,117,0.28)' },
  quran:        { accent: '#1D9E75', bg: 'rgba(29,158,117,0.13)',  border: 'rgba(29,158,117,0.28)' },
  dhikr:        { accent: '#C9952A', bg: 'rgba(201,149,42,0.13)', border: 'rgba(201,149,42,0.28)' },
  character:    { accent: '#C9952A', bg: 'rgba(201,149,42,0.13)', border: 'rgba(201,149,42,0.28)' },
  relationship: { accent: '#C9952A', bg: 'rgba(201,149,42,0.13)', border: 'rgba(201,149,42,0.28)' },
};

const TROPHY_MESSAGES = [
  "Allah sees every effort, no matter how small.",
  "The Prophet ﷺ said the most beloved deeds are those done consistently.",
  "You took one step toward Allah. He will run to meet you.",
  "Every good deed is recorded. Nothing is wasted.",
  "Sabr and action — you are on the path.",
  "إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ",
  "Allah is Al-Shakur — He appreciates every sincere effort.",
  "The angels witnessed this deed.",
  "Consistency is the mark of the sincere believer.",
  "One step closer to who you want to be for Allah.",
  "This effort has been written in your book of deeds.",
  "Allah loves those who keep trying, even when it is hard.",
  "Small actions done with sincerity are immense with Allah.",
];

export default function TasksView({ userId, isFirstWeek, freeDays, onNeedSchedule }) {
  const [task,         setTask]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [generating,   setGenerating]   = useState(false);
  const [trophyCount,  setTrophyCount]  = useState(0);
  const [justDone,     setJustDone]     = useState(false);
  const [trophyMsg,    setTrophyMsg]    = useState('');
  const [showShelf,    setShowShelf]    = useState(false);

  useEffect(() => {
    if (userId) { fetchTask(); fetchTrophyCount(); }
  }, [userId]);

  const today = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  const fetchTask = async () => {
    setLoading(true);
    // Only show tasks due today or tomorrow
    const { data } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .gte('due_date', today)
      .lte('due_date', tomorrow)
      .order('due_date', { ascending: true })
      .limit(1)
      .maybeSingle();
    setTask(data || null);
    setLoading(false);
  };

  const fetchTrophyCount = async () => {
    const { data } = await supabase
      .from('user_trophies')
      .select('id')
      .eq('user_id', userId);
    setTrophyCount(data?.length || 0);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await generateTasks(userId, freeDays);
    await fetchTask();
    setGenerating(false);
  };

  const completeTask = async () => {
    if (!task) return;
    const msg = TROPHY_MESSAGES[Math.floor(Math.random() * TROPHY_MESSAGES.length)];

    // Fetch accurate live count from DB to avoid stale local counter
    const { data: existingTrophies } = await supabase
      .from('user_trophies')
      .select('id')
      .eq('user_id', userId);
    const newCount = (existingTrophies?.length || 0) + 1;

    const [{ error: taskErr }, { error: trophyErr }] = await Promise.all([
      supabase.from('user_tasks')
        .update({ completed: true })
        .eq('id', task.id),
      supabase.from('user_trophies').insert({
        user_id:        userId,
        task_title:     task.task_title,
        trophy_message: msg,
        trophy_number:  newCount,
      }),
    ]);

    if (taskErr)   console.error('[TasksView] task update error:', taskErr.message);
    if (trophyErr) console.error('[TasksView] trophy insert error:', trophyErr.message);
    if (taskErr || trophyErr) return;

    setTrophyCount(newCount);
    setTrophyMsg(msg);
    setJustDone(true);
    setTask(null);
  };

  // ── Trophy shelf ──────────────────────────────────────────────────────────
  if (showShelf) {
    return <TrophyShelf userId={userId} onBack={() => setShowShelf(false)} />;
  }

  // ── First week ────────────────────────────────────────────────────────────
  if (isFirstWeek) {
    return (
      <div className="max-w-lg mx-auto">
        <div
          className="text-center py-14 px-8 rounded-3xl"
          style={{
            background: 'linear-gradient(145deg, rgba(201,149,42,0.07) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(201,149,42,0.2)',
          }}
        >
          <div className="text-5xl mb-5">🤲</div>
          <h2 className="text-white font-extrabold text-xl mb-3">No tasks yet</h2>
          <p className="text-sm leading-relaxed max-w-xs mx-auto mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            This week we're getting to know you. Your personalised tasks begin next week, matched to your real struggles and your schedule.
          </p>
          <div className="h-px mb-5" style={{ background: 'rgba(201,149,42,0.15)' }} />
          <p className="text-[11px]" style={{ color: 'rgba(201,149,42,0.55)' }}>
            ✦ The more you use the AI companion this week, the better your tasks will be
          </p>
        </div>
      </div>
    );
  }

  // ── No schedule set ───────────────────────────────────────────────────────
  if (!freeDays || freeDays.length === 0) {
    return (
      <div className="max-w-lg mx-auto">
        <div
          className="text-center py-14 px-8 rounded-3xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="text-5xl mb-5">📅</div>
          <h2 className="text-white font-bold text-xl mb-3">When are you free?</h2>
          <p className="text-sm leading-relaxed mb-6 max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Tell us which days you have time and we'll schedule your task for exactly the right moment.
          </p>
          <button
            onClick={onNeedSchedule}
            className="btn-primary text-white font-bold px-8 py-3.5 rounded-xl text-sm"
          >
            Set my days →
          </button>
        </div>
      </div>
    );
  }

  // ── Trophy earned celebration ─────────────────────────────────────────────
  if (justDone) {
    return (
      <div className="max-w-lg mx-auto">
        <div
          className="text-center py-14 px-8 rounded-3xl"
          style={{
            background: 'linear-gradient(145deg, rgba(201,149,42,0.12) 0%, rgba(201,149,42,0.04) 100%)',
            border: '1px solid rgba(201,149,42,0.3)',
          }}
        >
          <div className="text-6xl mb-4" style={{ animation: 'none' }}>🏆</div>
          <p
            className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2"
            style={{ color: 'rgba(201,149,42,0.6)' }}
          >
            Trophy #{trophyCount} Earned
          </p>
          <h2 className="text-white font-extrabold text-2xl mb-4">Alhamdulillah!</h2>
          <p
            className="text-sm leading-relaxed max-w-xs mx-auto mb-6"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {trophyMsg}
          </p>
          <button
            onClick={() => { setJustDone(false); setShowShelf(true); }}
            className="text-sm font-semibold px-6 py-3 rounded-xl transition-all"
            style={{ background: 'rgba(201,149,42,0.12)', border: '1px solid rgba(201,149,42,0.28)', color: '#C9952A' }}
          >
            View Trophy Shelf →
          </button>
          <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.18)' }}>
            or wait — your next task will arrive before your next free day
          </p>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(29,158,117,0.2)', borderTopColor: '#1D9E75' }} />
      </div>
    );
  }

  // ── No task right now ─────────────────────────────────────────────────────
  if (!task) {
    return (
      <div className="max-w-lg mx-auto">
        <div
          className="text-center py-14 px-8 rounded-3xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-5xl mb-5">✨</div>
          <h2 className="text-white font-bold text-xl mb-2">No task right now</h2>
          <p className="text-sm leading-relaxed mb-6 max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Your task will appear here the day before your next free day. Keep making du'a and using the companion in the meantime.
          </p>

          {trophyCount > 0 && (
            <button
              onClick={() => setShowShelf(true)}
              className="flex items-center gap-2 mx-auto text-sm font-semibold px-5 py-2.5 rounded-xl transition-all mb-4"
              style={{ background: 'rgba(201,149,42,0.1)', border: '1px solid rgba(201,149,42,0.22)', color: '#C9952A' }}
            >
              🏆 {trophyCount} {trophyCount === 1 ? 'trophy' : 'trophies'} collected · View shelf
            </button>
          )}

          {/* Generate fallback if schedule is set but no task generated yet */}
          {freeDays && freeDays.length > 0 && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="text-xs font-semibold transition-all disabled:opacity-40"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              {generating ? 'Checking...' : 'Generate task now →'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Active task ───────────────────────────────────────────────────────────
  const c = TYPE_COLOR[task.task_type] || TYPE_COLOR.character;
  const isToday    = task.due_date === today;
  const isTomorrow = task.due_date === tomorrow;

  return (
    <div className="max-w-lg mx-auto">

      {/* Trophy count pill */}
      {trophyCount > 0 && (
        <button
          onClick={() => setShowShelf(true)}
          className="flex items-center gap-2 mb-5 text-xs font-semibold px-4 py-2 rounded-full transition-all"
          style={{ background: 'rgba(201,149,42,0.08)', border: '1px solid rgba(201,149,42,0.18)', color: 'rgba(201,149,42,0.7)' }}
        >
          🏆 {trophyCount} {trophyCount === 1 ? 'trophy' : 'trophies'} · View shelf →
        </button>
      )}

      {/* Task card */}
      <div
        className="rounded-3xl p-7"
        style={{
          background: `linear-gradient(145deg, ${c.bg} 0%, rgba(255,255,255,0.02) 100%)`,
          border: `1px solid ${c.border}`,
          boxShadow: `0 8px 40px ${c.bg}`,
        }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">{TYPE_ICONS[task.task_type] || '⭐'}</span>
            <span
              className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.accent }}
            >
              {TYPE_LABELS[task.task_type] || task.task_type}
              {task.is_personalised && ' · For you'}
            </span>
          </div>
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={isToday
              ? { background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)', color: '#1D9E75' }
              : { background: 'rgba(201,149,42,0.1)',  border: '1px solid rgba(201,149,42,0.22)', color: '#C9952A' }}
          >
            {isToday ? 'Complete today' : "Tomorrow's task"}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-white leading-tight mb-3">
          {task.task_title}
        </h2>

        {/* Description */}
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {task.task_description}
        </p>

        {/* Action */}
        {isToday ? (
          <button
            onClick={completeTask}
            className="w-full py-4 rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: `linear-gradient(135deg, ${c.accent}25, ${c.accent}12)`,
              border: `1px solid ${c.border}`,
              color: c.accent,
            }}
          >
            I did it — tick it off ✓
          </button>
        ) : (
          <div
            className="w-full py-4 rounded-2xl text-center text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)' }}
          >
            Ready to complete tomorrow
          </div>
        )}
      </div>

      {/* Trophy shelf link for zero-trophy state */}
      {trophyCount === 0 && (
        <button
          onClick={() => setShowShelf(true)}
          className="w-full mt-4 py-3 text-center text-xs font-semibold rounded-2xl transition-all"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.18)' }}
        >
          🏆 Trophy Shelf — earn your first one by completing this task
        </button>
      )}
    </div>
  );
}
