import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CalendarRange, X,
  LogOut, Home, Moon, User, MessageCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PrayerTracker from '../components/dashboard/PrayerTracker';
import DailyCheckIn from '../components/dashboard/DailyCheckIn';
import BottomNav from '../components/dashboard/BottomNav';
import ProgressZone from '../components/dashboard/ProgressZone';

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const TODAY = new Date().toISOString().split('T')[0];

// ── Shared card styles ────────────────────────────────────────────────────────
const CARD = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 40px rgba(0,0,0,0.3)',
};
const GOLD_CARD = {
  background: 'linear-gradient(145deg, rgba(201,149,42,0.12) 0%, rgba(201,149,42,0.04) 100%)',
  border: '1px solid rgba(201,149,42,0.22)',
  boxShadow: '0 1px 0 rgba(201,149,42,0.08) inset, 0 12px 40px rgba(0,0,0,0.3)',
};

function fmtDate(d) { return d.toISOString().split('T')[0]; }
function getWeekBounds(offset) {
  const end = new Date(); end.setHours(0, 0, 0, 0); end.setDate(end.getDate() - offset * 7);
  const start = new Date(end); start.setDate(end.getDate() - 6);
  return { start, end };
}
function getWeekLabel(offset) {
  if (offset === 0) return 'This Week';
  const { start, end } = getWeekBounds(offset);
  const f = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${f(start)} – ${f(end)}`;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, onTabChange, user, onSignOut }) {
  const navigate = useNavigate();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';
  const initials = displayName.slice(0, 2).toUpperCase();

  const navItems = [
    { id: 'home',    label: 'Home',    icon: Home },
    { id: 'prayers', label: 'Prayers', icon: Moon },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[224px] flex-col z-30"
      style={{ background: 'rgba(1,10,5,0.96)', borderRight: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-7 pb-6">
        <img src="/logo.png" alt="Path of Sabr" className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
        <span className="font-extrabold text-sm tracking-tight" style={{ color: '#1D9E75' }}>Path of Sabr</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onTabChange(id)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
            style={activeTab === id
              ? { background: 'rgba(29,158,117,0.12)', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.2)' }
              : { color: 'rgba(255,255,255,0.3)', border: '1px solid transparent', background: 'transparent' }}>
            <Icon size={15} strokeWidth={activeTab === id ? 2.5 : 2} />
            {label}
          </button>
        ))}

        {/* Divider */}
        <div className="my-4 mx-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

        {/* AI Companion CTA */}
        <button onClick={() => navigate('/companion')}
          className="w-full rounded-2xl p-4 text-left transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          style={GOLD_CARD}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">☽</span>
            <span className="text-xs font-extrabold tracking-wide" style={{ color: '#C9952A' }}>AI Companion</span>
          </div>
          <p className="text-[10px] leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Your personal deen mentor. Ask anything.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(201,149,42,0.6)' }}>Talk now</span>
            <ChevronRight size={9} style={{ color: 'rgba(201,149,42,0.6)' }} />
          </div>
        </button>
      </nav>

      {/* Profile footer */}
      <div className="px-3 pb-5">
        <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar */}
            <div className="relative w-9 h-9 flex-shrink-0">
              <div className="absolute inset-0 rounded-full"
                style={{ background: 'conic-gradient(from 0deg, #C9952A, #e8b84b, #C9952A)', padding: '1.5px' }}>
                <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: '#010a05' }}>
                  <span className="text-[11px] font-bold" style={{ color: '#C9952A' }}>{initials}</span>
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white leading-tight truncate">{displayName}</p>
              <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.22)' }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={onSignOut}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/5"
            style={{ color: 'rgba(239,100,100,0.55)' }}>
            <LogOut size={11} /> Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── Week nav bar ──────────────────────────────────────────────────────────────
function WeekNav({ weekOffset, setWeekOffset, showRangePicker, setShowRangePicker, rangeInput, setRangeInput, appliedRange, setAppliedRange }) {
  const canApply = rangeInput.start && rangeInput.end && rangeInput.start <= rangeInput.end;

  const apply = () => {
    if (canApply) { setAppliedRange({ start: rangeInput.start, end: rangeInput.end }); setShowRangePicker(false); }
  };
  const clearRange = () => {
    setAppliedRange(null); setRangeInput({ start: '', end: '' }); setShowRangePicker(false); setWeekOffset(0);
  };
  const displayDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (appliedRange) return (
    <div className="flex items-center justify-between mb-5 px-4 py-2.5 rounded-2xl" style={{ background: 'rgba(201,149,42,0.05)', border: '1px solid rgba(201,149,42,0.14)' }}>
      <div className="flex items-center gap-2 min-w-0">
        <CalendarRange size={12} style={{ color: '#C9952A', flexShrink: 0 }} />
        <span className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {displayDate(appliedRange.start)} – {displayDate(appliedRange.end)}
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}>View only</span>
      </div>
      <button onClick={clearRange} className="flex items-center gap-1 ml-3 px-2.5 py-1 rounded-xl text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)' }}>
        <X size={10} /> Clear
      </button>
    </div>
  );

  if (showRangePicker) return (
    <div className="mb-5 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Custom Date Range</p>
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        {['start', 'end'].map((k) => (
          <div key={k} className="flex-1">
            <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{k === 'start' ? 'From' : 'To'}</p>
            <input type="date" value={rangeInput[k]}
              max={k === 'start' ? (rangeInput.end || TODAY) : TODAY}
              min={k === 'end' ? rangeInput.start : undefined}
              onChange={(e) => setRangeInput(r => ({ ...r, [k]: e.target.value }))}
              className="w-full rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={apply} disabled={!canApply}
          className="flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-30"
          style={{ background: 'rgba(29,158,117,0.15)', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.3)' }}>
          Apply
        </button>
        <button onClick={() => setShowRangePicker(false)} className="px-4 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }}>
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-between mb-5">
      <button onClick={() => setWeekOffset(w => w + 1)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-colors"
        style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <ChevronLeft size={13} /> Prev
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ color: weekOffset === 0 ? '#1D9E75' : 'rgba(255,255,255,0.5)' }}>
          {getWeekLabel(weekOffset)}
        </span>
        {weekOffset > 0 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)' }}>View only</span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button onClick={() => setShowRangePicker(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-colors"
          style={{ color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <CalendarRange size={12} /><span className="hidden sm:inline">Range</span>
        </button>
        <button onClick={() => setWeekOffset(w => Math.max(0, w - 1))} disabled={weekOffset === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-colors"
          style={{ color: weekOffset === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', cursor: weekOffset === 0 ? 'not-allowed' : 'pointer' }}>
          Next <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Prayer calendar (week grid) ───────────────────────────────────────────────
function PrayerCalendar({ userId, weekOffset, customRange }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!userId) return;
    let startStr, endStr;
    if (customRange) { startStr = customRange.start; endStr = customRange.end; }
    else { const { start, end } = getWeekBounds(weekOffset); startStr = fmtDate(start); endStr = fmtDate(end); }
    supabase.from('prayers').select('*').eq('user_id', userId).gte('date', startStr).lte('date', endStr)
      .order('date', { ascending: true }).then(({ data }) => setRecords(data || []));
  }, [userId, weekOffset, customRange?.start, customRange?.end]);

  const dotColor = (s) => {
    if (s === 'on_time') return '#1D9E75';
    if (s === 'late')    return '#C9952A';
    if (s === 'missed')  return '#e57368';
    return 'rgba(255,255,255,0.08)';
  };

  const prayerInitials = ['F', 'D', 'A', 'M', 'I'];

  return (
    <div className="rounded-3xl p-6" style={CARD}>
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: 'rgba(255,255,255,0.22)' }}>Prayer Log</p>
        {records.length > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)' }}>
            {records.length} day{records.length !== 1 ? 's' : ''} logged
          </span>
        )}
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '28px' }}>☽</span>
          <p className="text-white/20 text-sm">No prayers logged this period</p>
        </div>
      ) : (
        <>
          {/* Prayer name headers */}
          <div className="flex items-center mb-3">
            <div className="w-24 flex-shrink-0" />
            <div className="flex flex-1 justify-around">
              {prayerInitials.map((l) => (
                <span key={l} className="text-[10px] font-bold w-7 text-center" style={{ color: 'rgba(255,255,255,0.18)' }}>{l}</span>
              ))}
            </div>
          </div>

          {/* Day rows */}
          <div className="space-y-1.5">
            {records.map((r) => {
              const dayLabel = new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              const isToday = r.date === TODAY;
              return (
                <div key={r.id} className="flex items-center rounded-xl px-3 py-2.5 transition-colors"
                  style={{ background: isToday ? 'rgba(29,158,117,0.05)' : 'rgba(255,255,255,0.02)', border: isToday ? '1px solid rgba(29,158,117,0.12)' : '1px solid transparent' }}>
                  <p className="text-[11px] w-24 flex-shrink-0 font-medium" style={{ color: isToday ? 'rgba(29,158,117,0.8)' : 'rgba(255,255,255,0.28)' }}>
                    {isToday ? 'Today' : dayLabel}
                  </p>
                  <div className="flex flex-1 justify-around">
                    {PRAYER_KEYS.map((p) => (
                      <div key={p} className="w-7 flex justify-center">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: dotColor(r[p]), boxShadow: r[p] && r[p] !== null ? `0 0 6px ${dotColor(r[p])}55` : 'none' }} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            {[['#1D9E75', 'On time'], ['#C9952A', 'Late'], ['#e57368', 'Missed']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Profile view ──────────────────────────────────────────────────────────────
function ProfileView({ user, onSignOut }) {
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';
  const initials = displayName.slice(0, 2).toUpperCase();
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="max-w-lg mx-auto space-y-3">
      <div className="rounded-3xl p-8 text-center" style={GOLD_CARD}>
        <div className="relative w-20 h-20 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg, #C9952A, #e8b84b, #C9952A)', padding: '2px' }}>
            <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: '#010a05' }}>
              <span className="font-bold text-2xl" style={{ color: '#C9952A' }}>{initials}</span>
            </div>
          </div>
        </div>
        <p className="text-white font-bold text-xl tracking-tight">{displayName}</p>
        <p className="text-xs mt-1.5 mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>{user?.email}</p>
        {joinedDate && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.2)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#1D9E75' }} />
            <span className="text-[11px] font-medium" style={{ color: 'rgba(29,158,117,0.9)' }}>Member since {joinedDate}</span>
          </div>
        )}
      </div>

      <div className="rounded-3xl overflow-hidden" style={CARD}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Account</p>
        </div>
        <button onClick={onSignOut}
          className="w-full px-5 py-4 text-left text-sm flex items-center gap-3 hover:bg-white/5 transition-colors"
          style={{ color: 'rgba(239,100,100,0.7)' }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <div className="pt-4 pb-2 text-center">
        <p className="arabic-text text-xl mb-1" style={{ color: 'rgba(201,149,42,0.2)' }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <p className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.08)' }}>In the name of Allah</p>
      </div>
    </div>
  );
}

// ── Quick stat chip ───────────────────────────────────────────────────────────
function StatChip({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}88` }} />
      <span className="text-xs font-semibold" style={{ color }}>{value}</span>
      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</span>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [weekOffset, setWeekOffset] = useState(0);
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [rangeInput, setRangeInput] = useState({ start: '', end: '' });
  const [appliedRange, setAppliedRange] = useState(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [todayStats, setTodayStats] = useState({ prayers: 0, checkedIn: false });

  // Onboarding check
  useEffect(() => {
    if (!user) return;
    const cached = localStorage.getItem(`onboarding_done_${user.id}`);
    if (cached) { setCheckingOnboarding(false); return; }
    supabase.from('onboarding_responses').select('id').eq('user_id', user.id).maybeSingle()
      .then(({ data, error }) => {
        if (error) { setCheckingOnboarding(false); return; }
        if (data) { localStorage.setItem(`onboarding_done_${user.id}`, 'true'); setCheckingOnboarding(false); }
        else navigate('/onboarding', { replace: true });
      });
  }, [user]);

  // Today's quick stats
  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('prayers').select('*').eq('user_id', user.id).eq('date', TODAY).maybeSingle(),
      supabase.from('moods').select('id').eq('user_id', user.id).eq('date', TODAY).maybeSingle(),
    ]).then(([{ data: p }, { data: m }]) => {
      const prayerCount = p ? PRAYER_KEYS.filter(k => p[k]).length : 0;
      setTodayStats({ prayers: prayerCount, checkedIn: !!m });
    });
  }, [user]);

  const resetNav = () => { setWeekOffset(0); setShowRangePicker(false); setRangeInput({ start: '', end: '' }); setAppliedRange(null); };
  const handleTabChange = (tab) => { setActiveTab(tab); resetNav(); };
  const handleSignOut = async () => { await signOut(); navigate('/'); };

  if (checkingOnboarding) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#010a05' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(29,158,117,0.15)', borderTopColor: '#1D9E75' }} />
    </div>
  );

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';
  const firstName = displayName.split(' ')[0];
  const navProps = { weekOffset, setWeekOffset, showRangePicker, setShowRangePicker, rangeInput, setRangeInput, appliedRange, setAppliedRange };

  const dayGreeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="min-h-screen" style={{ background: '#010a05' }}>

      {/* Atmospheric glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 35% at 60% 0%, rgba(29,158,117,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 40% 40% at 100% 50%, rgba(201,149,42,0.03) 0%, transparent 65%)' }} />
      </div>

      {/* Sidebar (desktop) */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} user={user} onSignOut={handleSignOut} />

      {/* Page content — offset by sidebar on desktop */}
      <div className="relative lg:pl-[224px] min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-28 lg:pt-8 lg:pb-12">

          {/* ── HOME ── */}
          {activeTab === 'home' && (
            <>
              {/* Page header strip */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(29,158,117,0.55)' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                {/* Mobile companion button */}
                <button
                  onClick={() => navigate('/companion')}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, rgba(201,149,42,0.18), rgba(201,149,42,0.08))', border: '1px solid rgba(201,149,42,0.25)', color: '#C9952A' }}>
                  ☽ AI Companion
                </button>
              </div>

              {/* Greeting banner */}
              <div className="rounded-3xl p-6 mb-5 relative overflow-hidden" style={CARD}>
                {/* Subtle inner glow */}
                <div className="absolute top-0 right-0 w-48 h-32 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(201,149,42,0.06), transparent 70%)' }} />

                <div className="relative flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{dayGreeting}</p>
                    <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
                      <span className="text-white">Assalamu Alaykum, </span>
                      <span style={{ color: '#C9952A' }}>{firstName}.</span>
                    </h1>
                    <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.18)' }}>
                      May your deeds be accepted today
                    </p>
                  </div>

                  {/* Quick stats */}
                  <div className="hidden sm:flex flex-col gap-2 flex-shrink-0">
                    <StatChip
                      label="prayers logged"
                      value={`${todayStats.prayers}/5`}
                      color={todayStats.prayers >= 5 ? '#1D9E75' : todayStats.prayers > 0 ? '#C9952A' : 'rgba(255,255,255,0.25)'}
                    />
                    <StatChip
                      label="check-in"
                      value={todayStats.checkedIn ? 'Done ✓' : 'Pending'}
                      color={todayStats.checkedIn ? '#1D9E75' : 'rgba(255,255,255,0.25)'}
                    />
                  </div>
                </div>
              </div>

              {/* Week nav */}
              <WeekNav {...navProps} />

              {/* Main 2-col grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <PrayerTracker userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
                <DailyCheckIn  userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
              </div>

              {/* Prayer calendar — full width */}
              <div className="mb-1">
                <PrayerCalendar userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
              </div>

              {/* Progress metrics */}
              <ProgressZone userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
            </>
          )}

          {/* ── PRAYERS ── */}
          {activeTab === 'prayers' && (
            <>
              <div className="mb-6">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.18)' }}>Track</p>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Prayers</h1>
              </div>
              <WeekNav {...navProps} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <PrayerTracker userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
                <PrayerCalendar userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
              </div>
              <ProgressZone userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
            </>
          )}

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <>
              <div className="mb-6">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.18)' }}>Account</p>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Profile</h1>
              </div>
              <ProfileView user={user} onSignOut={handleSignOut} />
            </>
          )}

        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>
    </div>
  );
}
