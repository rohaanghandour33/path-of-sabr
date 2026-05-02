import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PrayerTracker from '../components/dashboard/PrayerTracker';
import DailyCheckIn from '../components/dashboard/DailyCheckIn';
import BottomNav from '../components/dashboard/BottomNav';
import ProgressZone from '../components/dashboard/ProgressZone';

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function fmtDate(d) {
  return d.toISOString().split('T')[0];
}

function getWeekBounds(offset) {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() - offset * 7);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return { start, end };
}

function getWeekLabel(offset) {
  if (offset === 0) return 'This Week';
  const { start, end } = getWeekBounds(offset);
  const f = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${f(start)} – ${f(end)}`;
}

function statusDot(s) {
  if (s === 'on_time') return { background: '#1D9E75' };
  if (s === 'late')    return { background: '#C9952A' };
  if (s === 'missed')  return { background: '#C0392B' };
  return { background: 'rgba(255,255,255,0.1)' };
}

function WeekNav({ weekOffset, setWeekOffset }) {
  return (
    <div className="flex items-center justify-between mb-5 px-0.5">
      <button
        onClick={() => setWeekOffset((w) => w + 1)}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm transition-colors"
        style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)' }}
      >
        <ChevronLeft size={14} strokeWidth={2.5} />
        Prev
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium" style={{ color: weekOffset === 0 ? '#1D9E75' : 'rgba(255,255,255,0.65)' }}>
          {getWeekLabel(weekOffset)}
        </span>
        {weekOffset > 0 && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            View only
          </span>
        )}
      </div>

      <button
        onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
        disabled={weekOffset === 0}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm transition-colors"
        style={{
          color: weekOffset === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.5)',
          background: 'rgba(255,255,255,0.05)',
          cursor: weekOffset === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        Next
        <ChevronRight size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function PrayerHistory({ userId, weekOffset }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const { start, end } = getWeekBounds(weekOffset);
    supabase
      .from('prayers')
      .select('*')
      .eq('user_id', userId)
      .gte('date', fmtDate(start))
      .lte('date', fmtDate(end))
      .order('date', { ascending: false })
      .then(({ data }) => setRecords(data || []));
  }, [userId, weekOffset]);

  const { start, end } = getWeekBounds(weekOffset);
  const label = weekOffset === 0
    ? 'This Week'
    : `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  if (records.length === 0) {
    return (
      <div
        className="rounded-3xl p-6 text-center h-full flex flex-col items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,149,42,0.18)' }}
      >
        <p className="text-white/35 text-sm">No prayer records yet.</p>
        <p className="text-white/20 text-xs mt-1">Log today's prayers to get started.</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl p-6 h-full overflow-y-auto"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,149,42,0.18)' }}
    >
      <p className="text-white font-semibold text-sm mb-4">{label}</p>
      <div className="space-y-2">
        {records.map((r) => (
          <div
            key={r.id}
            className="border border-white/8 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <p className="text-white/50 text-xs mb-2">
              {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
              })}
            </p>
            <div className="flex gap-3">
              {PRAYER_KEYS.map((p) => (
                <div key={p} className="flex flex-col items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={statusDot(r[p])} />
                  <span className="text-[10px] text-white/25">{p[0].toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileView({ user, onSignOut }) {
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';
  return (
    <div className="max-w-lg mx-auto">
      <div className="border border-white/10 rounded-3xl p-8 mb-4 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(29,158,117,0.15)' }}>
          <span className="font-bold text-2xl" style={{ color: '#1D9E75' }}>{displayName[0].toUpperCase()}</span>
        </div>
        <p className="text-white font-semibold text-lg">{displayName}</p>
        <p className="text-white/35 text-sm mt-1">{user?.email}</p>
      </div>
      <div className="border border-white/10 rounded-3xl overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="px-5 py-3 border-b border-white/5">
          <p className="text-white/30 text-xs font-semibold tracking-widest">ACCOUNT</p>
        </div>
        <button onClick={onSignOut} className="w-full px-5 py-4 text-left text-sm text-red-400/80 hover:bg-white/5 transition-colors">
          Sign out
        </button>
      </div>
      <p className="text-center text-white/15 arabic-text text-lg mt-8">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
    </div>
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [weekOffset, setWeekOffset] = useState(0);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (!user) return;
    const cached = localStorage.getItem(`onboarding_done_${user.id}`);
    if (cached) { setCheckingOnboarding(false); return; }
    supabase
      .from('onboarding_responses').select('id').eq('user_id', user.id).maybeSingle()
      .then(({ data, error }) => {
        if (error) { setCheckingOnboarding(false); return; }
        if (data) { localStorage.setItem(`onboarding_done_${user.id}`, 'true'); setCheckingOnboarding(false); }
        else navigate('/onboarding', { replace: true });
      });
  }, [user]);

  // Reset week offset when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setWeekOffset(0);
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  if (checkingOnboarding) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#051a10' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1D9E75', borderTopColor: 'transparent' }} />
    </div>
  );

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen" style={{ background: '#051a10' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 lg:pb-8">

        {/* Header */}
        <div className="flex items-center justify-between pt-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Path of Sabr" className="h-9 w-9 rounded-full object-cover shrink-0" />
            <span className="font-bold text-base tracking-tight" style={{ color: '#1D9E75' }}>Path of Sabr</span>
          </div>
          {/* Desktop tab switcher */}
          <div className="hidden lg:flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {['home', 'prayers', 'profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-150"
                style={activeTab === tab
                  ? { background: 'rgba(29,158,117,0.2)', color: '#1D9E75' }
                  : { color: 'rgba(255,255,255,0.4)' }}
              >
                {tab === 'home' ? 'Home' : tab === 'prayers' ? 'Prayers' : 'Profile'}
              </button>
            ))}
          </div>
        </div>

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <>
            <div className="mt-6 mb-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                Assalamu Alaykum, {displayName}
              </h1>
              <p className="text-white/45 text-sm mt-1">{todayStr}</p>
            </div>

            {/* Week navigator */}
            <WeekNav weekOffset={weekOffset} setWeekOffset={setWeekOffset} />

            {/* 3-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
              <PrayerTracker userId={user?.id} weekOffset={weekOffset} />
              <DailyCheckIn userId={user?.id} weekOffset={weekOffset} />
              <PrayerHistory userId={user?.id} weekOffset={weekOffset} />
            </div>

            {/* Progress Zone */}
            <ProgressZone userId={user?.id} weekOffset={weekOffset} />
          </>
        )}

        {/* PRAYERS TAB */}
        {activeTab === 'prayers' && (
          <>
            <div className="mt-6 mb-4">
              <h1 className="text-2xl font-bold text-white">Prayers</h1>
            </div>

            {/* Week navigator */}
            <WeekNav weekOffset={weekOffset} setWeekOffset={setWeekOffset} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
              <PrayerTracker userId={user?.id} weekOffset={weekOffset} />
              <PrayerHistory userId={user?.id} weekOffset={weekOffset} />
            </div>
          </>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <>
            <div className="mt-6 mb-6">
              <h1 className="text-2xl font-bold text-white">Profile</h1>
            </div>
            <ProfileView user={user} onSignOut={handleSignOut} />
          </>
        )}
      </div>

      {/* Bottom nav — mobile only */}
      <div className="lg:hidden">
        <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>
    </div>
  );
}
