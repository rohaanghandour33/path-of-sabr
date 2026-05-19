import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function TaskWidget({ userId, onNavigateToTasks }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    supabase
      .from('user_tasks')
      .select('id, task_title, completed, task_type')
      .eq('user_id', userId)
      .gte('due_date', today)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setTasks(data || []);
        setLoading(false);
      });
  }, [userId]);

  if (loading || tasks.length === 0) return null;

  const done = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = done === total;

  return (
    <button
      onClick={onNavigateToTasks}
      className="w-full text-left rounded-3xl p-5 mt-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
      style={{
        background: 'linear-gradient(145deg, rgba(29,158,117,0.09) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(29,158,117,0.18)',
        boxShadow: '0 1px 0 rgba(29,158,117,0.06) inset, 0 8px 32px rgba(0,0,0,0.2)',
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: 'rgba(29,158,117,0.65)' }}>
          Weekly Tasks
        </p>
        <div className="flex items-center gap-1">
          <span className="text-lg font-extrabold leading-none" style={{ color: '#1D9E75' }}>{done}</span>
          <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.18)' }}>/{total}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #1D9E75, #23c68f)' }}
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
          {allDone
            ? 'All done. Alhamdulillah.'
            : `${total - done} task${total - done !== 1 ? 's' : ''} remaining`}
        </p>
        <span className="text-xs font-semibold" style={{ color: 'rgba(29,158,117,0.7)' }}>View all →</span>
      </div>
    </button>
  );
}
