import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PrayerTracker from '../components/dashboard/PrayerTracker';
import DailyCheckIn from '../components/dashboard/DailyCheckIn';
import BottomNav from '../components/dashboard/BottomNav';

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function statusDot(s) {
  if (s === 'on_time') return 'bg-[#1D9E75]';
  if (s === 'late') return 'bg-amber-500';
  if (s === 'missed') return 'bg-red-500/60';
  return 'bg-white/12';
}

function PrayerHistory({ userId }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    supabase
      .from('prayers')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(14)
      .then(({ data }) => setRecords(data || []));
  }, [userId]);

  if (records.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <p className="text-white/35 text-sm">No prayer records yet.</p>
        <p className="text-white/20 text-xs mt-1">Log today's prayers above to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-white/40 text-xs font-medium px-1 mb-3">Last 14 days</p>
      {records.map((r) => (
        <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <p className="text-white/50 text-xs mb-2.5">
            {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <div className="flex gap-3">
            {PRAYER_KEYS.map((p) => (
              <div key={p} className="flex flex-col items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${statusDot(r[p])}`} />
                <span className="text-[10px] text-white/25">{p[0].toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileView({ user, onSignOut }) {
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';

  return (
    <div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 text-center">
        <div className="w-14 h-14 rounded-full bg-[#1D9E75]/20 flex items-center justify-center mx-auto mb-3">
          <span className="text-[#1D9E75] font-bold text-xl">{displayName[0].toUpperCase()}</span>
        </div>
        <p className="text-white font-semibold">{displayName}</p>
        <p className="text-white/35 text-sm mt-1">{user?.email}</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-white/5">
          <p className="text-white/30 text-xs font-semibold tracking-widest">ACCOUNT</p>
        </div>
        <button
          onClick={onSignOut}
          className="w-full px-5 py-4 text-left text-sm text-red-400/80 hover:bg-white/5 transition-colors"
        >
          Sign out
        </button>
      </div>

      <p className="text-center text-white/15 arabic-text text-lg mt-8">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (!user) return;

    const cached = localStorage.getItem(`onboarding_done_${user.id}`);
    if (cached) {
      setCheckingOnboarding(false);
      return;
    }

    supabase
      .from('onboarding_responses')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          localStorage.setItem(`onboarding_done_${user.id}`, 'true');
          setCheckingOnboarding(false);
        } else {
          navigate('/onboarding', { replace: true });
        }
      });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen" style={{ background: '#051a10' }}>
      <div className="max-w-md mx-auto px-4 pt-12 pb-28">

        {activeTab === 'home' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white leading-tight">
                Assalamu Alaykum, {displayName}
              </h1>
              <p className="text-white/35 text-sm mt-1">{todayStr}</p>
            </div>
            <PrayerTracker userId={user?.id} />
            <DailyCheckIn userId={user?.id} />
          </>
        )}

        {activeTab === 'prayers' && (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white">Prayers</h1>
            </div>
            <PrayerTracker userId={user?.id} />
            <PrayerHistory userId={user?.id} />
          </>
        )}

        {activeTab === 'profile' && (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white">Profile</h1>
            </div>
            <ProfileView user={user} onSignOut={handleSignOut} />
          </>
        )}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
