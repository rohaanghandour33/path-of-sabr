import { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { generateTasks } from '../../lib/taskUtils';

const TYPE_ICONS  = { prayer: '🕌', quran: '📖', dhikr: '📿', character: '⭐', relationship: '❤️' };
const TYPE_LABELS = { prayer: 'Prayer', quran: 'Quran', dhikr: 'Dhikr', character: 'Character', relationship: 'Relationships' };

function daysUntil(dateStr) {
  const due = new Date(dateStr + 'T23:59:59');
  return Math.max(0, Math.ceil((due - new Date()) / 86400000));
}

export default function TasksView({ userId, onGenerated }) {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (userId) fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('due_date', today)
      .order('is_personalised', { ascending: false }) // personalised tasks last (at bottom)
      .order('created_at',      { ascending: true });
    setTasks(data || []);
    setLoading(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    const { generated } = await generateTasks(userId);
    if (generated) {
      await fetchTasks();
      onGenerated?.();
    } else {
      setError('Could not generate tasks. Please try again.');
    }
    setGenerating(false);
  };

  const toggleTask = async (taskId, current) => {
    const completed = !current;
    await supabase
      .from('user_tasks')
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq('id', taskId);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t
      )
    );
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(29,158,117,0.2)', borderTopColor: '#1D9E75' }} />
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (tasks.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div
          className="text-center py-16 px-8 rounded-3xl"
          style={{
            background: 'linear-gradient(145deg, rgba(29,158,117,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(29,158,117,0.12)',
          }}
        >
          <div className="text-5xl mb-5">🌱</div>
          <h2 className="text-white font-bold text-xl mb-3">No tasks this week</h2>
          <p className="text-sm mb-8 max-w-sm mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Let your companion build a personalised plan to help your deen grow, one step at a time.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary text-white font-semibold px-8 py-3.5 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Building your plan...' : 'Generate my tasks →'}
          </button>
          {error && <p className="text-red-400/60 text-xs mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  const done    = tasks.filter((t) => t.completed).length;
  const total   = tasks.length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
  const daysLeft = daysUntil(tasks[0].due_date);
  const allDone  = done === total;

  // ── Task list ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Your Weekly Tasks</h2>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
            {daysLeft === 0
              ? 'Expires today'
              : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-3xl font-extrabold leading-none" style={{ color: '#1D9E75' }}>{done}</span>
          <span className="text-xl font-semibold" style={{ color: 'rgba(255,255,255,0.18)' }}>/{total}</span>
          <p className="text-[10px] font-bold tracking-widest uppercase mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>done</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #1D9E75, #23c68f)' }}
          />
        </div>
        <p
          className="text-[10px] font-semibold mt-2"
          style={{ color: pct === 100 ? '#1D9E75' : 'rgba(255,255,255,0.2)' }}
        >
          {pct}% complete
        </p>
      </div>

      {/* Completion celebration */}
      {allDone && (
        <div
          className="mb-6 rounded-2xl p-5 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(29,158,117,0.1) 0%, rgba(29,158,117,0.04) 100%)',
            border: '1px solid rgba(29,158,117,0.22)',
          }}
        >
          <div className="text-3xl mb-2">🌟</div>
          <p className="text-white font-bold text-base mb-1">Alhamdulillah.</p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            May Allah accept your efforts and make it easy for you to continue. Ameen.
          </p>
          <p className="text-sm font-semibold tracking-wider mt-3 arabic-text" style={{ color: 'rgba(29,158,117,0.7)' }}>
            رَبَّنَا تَقَبَّلْ مِنَّا
          </p>
          <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Our Lord, accept from us.</p>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id, task.completed)}
            className="w-full text-left rounded-2xl p-4 transition-all duration-200 hover:scale-[1.005] active:scale-[0.998]"
            style={{
              background: task.completed
                ? 'linear-gradient(145deg, rgba(29,158,117,0.08) 0%, rgba(29,158,117,0.03) 100%)'
                : 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: task.completed
                ? '1px solid rgba(29,158,117,0.2)'
                : '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-start gap-3.5">
              {/* Checkbox */}
              <div className="mt-0.5 flex-shrink-0">
                {task.completed ? (
                  <CheckCircle2 size={20} style={{ color: '#1D9E75' }} />
                ) : (
                  <Circle size={20} style={{ color: 'rgba(255,255,255,0.2)' }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm leading-none">{TYPE_ICONS[task.task_type] || '⭐'}</span>
                  <span
                    className="text-[9px] font-bold tracking-widest uppercase"
                    style={{
                      color: task.task_type === 'prayer' || task.task_type === 'quran'
                        ? 'rgba(29,158,117,0.6)'
                        : 'rgba(201,149,42,0.6)',
                    }}
                  >
                    {TYPE_LABELS[task.task_type] || task.task_type}
                    {task.is_personalised && ' · For you'}
                  </span>
                </div>

                <p
                  className="font-semibold text-sm leading-snug mb-1"
                  style={{
                    color: task.completed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.88)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                  }}
                >
                  {task.task_title}
                </p>

                <p
                  className="text-xs leading-relaxed"
                  style={{ color: task.completed ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.35)' }}
                >
                  {task.task_description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs mt-8 pb-2" style={{ color: 'rgba(255,255,255,0.1)' }}>
        New tasks are generated automatically when this week expires.
      </p>
    </div>
  );
}
