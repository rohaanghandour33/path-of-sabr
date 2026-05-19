import { useState } from 'react';
import { X } from 'lucide-react';

const MESSAGES = [
  'Your new weekly tasks are ready. Time to grow.',
  'Fresh start. Your companion built a plan just for you.',
  'New week, new goals. Allah is watching your effort.',
  'Your personalised tasks are waiting. Small steps matter.',
  'Alhamdulillah. Your week begins now. Make it count.',
];

export default function TaskBanner({ onNavigateToTasks, onDismiss }) {
  const [msgIdx] = useState(() => Math.floor(Math.random() * MESSAGES.length));

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl mb-5"
      style={{
        background: 'linear-gradient(135deg, rgba(29,158,117,0.12) 0%, rgba(29,158,117,0.04) 100%)',
        border: '1px solid rgba(29,158,117,0.25)',
        boxShadow: '0 4px 20px rgba(29,158,117,0.08)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-lg flex-shrink-0">✅</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white leading-snug">{MESSAGES[msgIdx]}</p>
          <button
            onClick={onNavigateToTasks}
            className="text-xs font-semibold mt-0.5 transition-opacity hover:opacity-80"
            style={{ color: '#1D9E75' }}
          >
            See your tasks →
          </button>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/8"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
