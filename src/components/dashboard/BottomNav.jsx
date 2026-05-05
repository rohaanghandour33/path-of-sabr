import { Home, MoonStar, Bot, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { id: 'home',    label: 'Home',         Icon: Home },
  { id: 'prayers', label: 'Prayers',      Icon: MoonStar },
  { id: 'ai',      label: 'AI Companion', Icon: Bot },
  { id: 'profile', label: 'Profile',      Icon: User },
];

export default function BottomNav({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which tab is truly active, taking the route into account
  const isActive = (id) => {
    if (id === 'ai') return location.pathname === '/companion';
    if (location.pathname === '/companion') return false; // on companion page, only 'ai' is active
    return activeTab === id;
  };

  const handleClick = (id) => {
    if (id === 'ai') {
      navigate('/companion');
      return;
    }
    // If we're currently on the /companion route, go back to dashboard first
    if (location.pathname === '/companion') {
      navigate('/dashboard', { state: { tab: id } });
      return;
    }
    setActiveTab(id);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10" style={{ background: '#020c07' }}>
      <div className="max-w-md mx-auto flex relative">
        {TABS.map(({ id, label, Icon }) => {
          const active = isActive(id);
          return (
            <button
              key={id}
              onClick={() => handleClick(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 pb-4 transition-colors relative"
              style={{
                color: active ? '#1D9E75' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
              }}
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
