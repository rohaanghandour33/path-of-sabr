import { useState } from 'react';
import { supabase } from '../../lib/supabase';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function getMondayOfWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export default function ScheduleSurvey({ userId, onSave }) {
  const [selected, setSelected] = useState(new Set());
  const [dontKnow, setDontKnow] = useState(false);
  const [saving, setSaving]     = useState(false);

  const toggle = (day) => {
    setDontKnow(false);
    setSelected(prev => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  };

  const toggleAll = () => {
    setDontKnow(false);
    setSelected(prev => prev.size === 7 ? new Set() : new Set(DAYS));
  };

  const handleDontKnow = () => {
    setDontKnow(true);
    setSelected(new Set());
  };

  const save = async () => {
    setSaving(true);
    const freeDays = dontKnow ? [] : [...selected];
    await supabase.from('user_schedule').upsert(
      { user_id: userId, free_days: freeDays, week_of: getMondayOfWeek() },
      { onConflict: 'user_id,week_of' }
    );
    onSave(freeDays);
    setSaving(false);
  };

  const allSelected = selected.size === 7;
  const canSave = dontKnow || selected.size > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(2,12,7,0.88)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-7"
        style={{
          background: 'linear-gradient(145deg, #0d3320, #0a2318)',
          border: '1px solid rgba(201,149,42,0.3)',
          boxShadow: '0 0 60px rgba(201,149,42,0.1)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-7">
          <div className="text-4xl mb-3">📅</div>
          <h2 className="text-white font-extrabold text-xl mb-2 tracking-tight">
            When are you free this week?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
            We'll give you your task the day before — so you have time to prepare.
          </p>
        </div>

        {/* Day grid — 4 + 3 layout */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          {DAYS.slice(0, 4).map(day => {
            const on = selected.has(day);
            return (
              <button
                key={day}
                onClick={() => toggle(day)}
                className="py-3.5 rounded-2xl text-xs font-bold transition-all duration-150"
                style={on ? {
                  background: 'rgba(29,158,117,0.2)',
                  border: '1px solid rgba(29,158,117,0.5)',
                  color: '#1D9E75',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.35)',
                }}
              >
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {DAYS.slice(4).map(day => {
            const on = selected.has(day);
            return (
              <button
                key={day}
                onClick={() => toggle(day)}
                className="py-3.5 rounded-2xl text-xs font-bold transition-all duration-150"
                style={on ? {
                  background: 'rgba(29,158,117,0.2)',
                  border: '1px solid rgba(29,158,117,0.5)',
                  color: '#1D9E75',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.35)',
                }}
              >
                {day.slice(0, 3)}
              </button>
            );
          })}
          {/* All of the above */}
          <button
            onClick={toggleAll}
            className="py-3.5 rounded-2xl text-xs font-bold transition-all duration-150"
            style={allSelected ? {
              background: 'rgba(29,158,117,0.2)',
              border: '1px solid rgba(29,158,117,0.5)',
              color: '#1D9E75',
            } : {
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            All
          </button>
        </div>

        {/* Don't know yet */}
        <button
          onClick={handleDontKnow}
          className="w-full py-3 rounded-2xl text-sm font-semibold mb-6 transition-all duration-150"
          style={dontKnow ? {
            background: 'rgba(201,149,42,0.15)',
            border: '1px solid rgba(201,149,42,0.35)',
            color: '#C9952A',
          } : {
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.22)',
          }}
        >
          I don't know yet
        </button>

        <button
          onClick={save}
          disabled={!canSave || saving}
          className="w-full btn-primary text-white font-bold py-4 rounded-2xl text-sm transition-all disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Set my task days →'}
        </button>
      </div>
    </div>
  );
}
