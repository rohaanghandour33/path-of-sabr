import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const MILESTONES = [
  { at: 10,   emoji: '🌱', label: 'First 10',    msg: 'A seed of change planted in your deen.' },
  { at: 25,   emoji: '🌿', label: '25 Deeds',    msg: 'Roots growing deeper. SubhanAllah.' },
  { at: 50,   emoji: '⭐', label: '50 Complete', msg: 'Fifty acts of worship. Allah sees them all.' },
  { at: 100,  emoji: '🌟', label: 'Century',     msg: '100 deeds completed. Extraordinary commitment.' },
  { at: 500,  emoji: '🏆', label: '500 Strong',  msg: 'MashaAllah. A true servant of the deen.' },
  { at: 1000, emoji: '👑', label: '1000 Deeds',  msg: 'May Allah accept every single one. Ameen.' },
];

function TrophyCard({ trophy, number }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: 'linear-gradient(145deg, rgba(201,149,42,0.1) 0%, rgba(201,149,42,0.04) 100%)',
        border: '1px solid rgba(201,149,42,0.22)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">🏆</span>
        <span
          className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(201,149,42,0.1)', color: 'rgba(201,149,42,0.6)' }}
        >
          #{number}
        </span>
      </div>
      <p className="text-xs leading-relaxed font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
        {trophy.trophy_message}
      </p>
      {trophy.task_title && (
        <p className="text-[10px] leading-snug" style={{ color: 'rgba(255,255,255,0.22)' }}>
          {trophy.task_title}
        </p>
      )}
      <p className="text-[9px]" style={{ color: 'rgba(201,149,42,0.35)' }}>
        {new Date(trophy.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  );
}

export default function TrophyShelf({ userId, onBack }) {
  const [trophies, setTrophies] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('user_trophies')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })
      .then(({ data }) => { setTrophies(data || []); setLoading(false); });
  }, [userId]);

  const total = trophies.length;
  const earnedMilestones = MILESTONES.filter(m => total >= m.at);
  const nextMilestone    = MILESTONES.find(m => total < m.at);

  return (
    <div className="max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="text-sm transition-colors"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          ← Back
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Trophy Shelf</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
            {total} task{total !== 1 ? 's' : ''} completed — every one is recorded with Allah
          </p>
        </div>
        <span className="text-3xl">🏆</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 rounded-full animate-spin"
            style={{ borderColor: 'rgba(201,149,42,0.2)', borderTopColor: '#C9952A' }} />
        </div>
      ) : total === 0 ? (
        <div
          className="text-center py-16 px-8 rounded-3xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-white font-bold text-lg mb-2">Your shelf is empty</p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Complete your first task to earn a trophy. Every effort with Allah counts, no matter how small.
          </p>
        </div>
      ) : (
        <>
          {/* Milestone badges */}
          {earnedMilestones.length > 0 && (
            <div className="mb-8">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-4"
                style={{ color: 'rgba(255,255,255,0.18)' }}>
                Milestone Badges — Path of Sabr Exclusive
              </p>
              <div className="flex flex-wrap gap-3">
                {earnedMilestones.map(m => (
                  <div
                    key={m.at}
                    className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(201,149,42,0.15), rgba(201,149,42,0.06))',
                      border: '1px solid rgba(201,149,42,0.3)',
                    }}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] font-extrabold" style={{ color: '#C9952A' }}>{m.label}</span>
                    <span className="text-[9px] text-center max-w-[80px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {m.msg}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress to next milestone */}
          {nextMilestone && (
            <div
              className="mb-8 rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Next milestone: {nextMilestone.label} {nextMilestone.emoji}
                </span>
                <span className="text-xs font-bold" style={{ color: '#C9952A' }}>
                  {total} / {nextMilestone.at}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, (total / nextMilestone.at) * 100)}%`,
                    background: 'linear-gradient(90deg, #C9952A, #e8b84b)',
                  }}
                />
              </div>
              <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.18)' }}>
                {nextMilestone.at - total} more task{nextMilestone.at - total !== 1 ? 's' : ''} until your next badge
              </p>
            </div>
          )}

          {/* Trophy grid */}
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-4"
            style={{ color: 'rgba(255,255,255,0.18)' }}>
            Your Trophies
          </p>
          <div className="grid grid-cols-2 gap-3">
            {trophies.map((t, i) => (
              <TrophyCard key={t.id} trophy={t} number={total - i} />
            ))}
          </div>

          {/* Footer */}
          <p
            className="text-center text-[11px] mt-8 arabic-text"
            style={{ color: 'rgba(201,149,42,0.3)' }}
          >
            إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ
          </p>
          <p className="text-center text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.12)' }}>
            Indeed, Allah does not allow the reward of the good-doers to be lost.
          </p>
        </>
      )}
    </div>
  );
}
