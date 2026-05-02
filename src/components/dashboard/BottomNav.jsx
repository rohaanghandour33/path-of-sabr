import { Home, MoonStar, Bot, User } from 'lucide-react';

const TABS = [
  { id: 'home',    label: 'Home',         Icon: Home },
  { id: 'prayers', label: 'Prayers',      Icon: MoonStar },
  { id: 'ai',      label: 'AI Companion', Icon: Bot, disabled: true },
  { id: 'profile', label: 'Profile',      Icon: User },
];

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10" style={{ background: '#051a10' }}>
      <div className="max-w-md mx-auto flex relative">
        {TABS.map(({ id, label, Icon, disabled }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => !disabled && setActiveTab(id)}
              disabled={disabled}
              className="flex-1 flex flex-col items-center gap-1 py-3 pb-4 transition-colors relative"
              style={{
                color: disabled ? 'rgba(255,255,255,0.18)' : isActive ? '#1D9E75' : 'rgba(255,255,255,0.35)',
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
              {isActive && !disabled && (
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
