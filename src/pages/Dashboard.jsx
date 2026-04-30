import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';

  return (
    <div className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Path of Sabr" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-bold text-white text-lg">Path of Sabr</span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Greeting */}
      <div className="mb-10">
        <p className="text-[#1D9E75] text-sm font-medium section-label mb-1">Dashboard</p>
        <h1 className="text-3xl font-bold text-white">
          Assalamu Alaikum, {displayName}
        </h1>
        <p className="text-white/50 mt-1 text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Prayer tracker card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-5">Today's Prayers</h2>
        <div className="grid grid-cols-5 gap-3">
          {PRAYERS.map((prayer) => (
            <div key={prayer} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white/20" />
              </div>
              <span className="text-xs text-white/50">{prayer}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mood card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-2">Today's Mood</h2>
        <p className="text-white/40 text-sm">Log how you're feeling today</p>
        <div className="flex gap-2 mt-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((n) => (
            <button
              key={n}
              className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-[#1D9E75]/20 hover:border-[#1D9E75]/40 hover:text-white transition-colors"
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Coming soon */}
      <div className="bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-2xl p-6 text-center">
        <p className="text-[#1D9E75] font-semibold mb-1">More features coming soon</p>
        <p className="text-white/40 text-sm">Habit streaks, Quran tracking, and AI insights are on the way.</p>
      </div>
    </div>
  );
}
