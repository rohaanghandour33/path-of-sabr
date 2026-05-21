import { Home, MoonStar, ListChecks, Bot, User } from 'lucide-react';

const TABS = [
  { id: 'home',    label: 'Home',    Icon: Home },
  { id: 'prayers', label: 'Prayers', Icon: MoonStar },
  { id: 'tasks',   label: 'Tasks',   Icon: ListChecks },
  { id: 'ai',      label: 'AI',      Icon: Bot },
  { id: 'profile', label: 'Profile', Icon: User },
];

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav
      className="border-t border-white/10"
      style={{ background: '#020c07', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-md mx-auto flex relative">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 pb-4 transition-colors relative"
              style={{ color: active ? '#1D9E75' : 'rgba(255,255,255,0.35)' }}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: '#1D9E75' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
