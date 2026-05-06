import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarRange, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PrayerTracker from '../components/dashboard/PrayerTracker';
import DailyCheckIn from '../components/dashboard/DailyCheckIn';
import BottomNav from '../components/dashboard/BottomNav';
import ProgressZone from '../components/dashboard/ProgressZone';

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const TODAY = new Date().toISOString().split('T')[0];

const CARD = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.28)',
};

const GOLD_CARD = {
  background: 'linear-gradient(145deg, rgba(201,149,42,0.1) 0%, rgba(201,149,42,0.03) 100%)',
  border: '1px solid rgba(201,149,42,0.2)',
  boxShadow: '0 1px 0 rgba(201,149,42,0.06) inset, 0 20px 60px rgba(0,0,0,0.28)',
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

function displayDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusDot(s) {
  if (s === 'on_time') return { background: '#1D9E75' };
  if (s === 'late')    return { background: '#C9952A' };
  if (s === 'missed')  return { background: '#e57368' };
  return { background: 'rgba(255,255,255,0.1)' };
}

// ── Week Nav ──────────────────────────────────────────────────────────────────
function NavBar({ weekOffset, setWeekOffset, showRangePicker, setShowRangePicker, rangeInput, setRangeInput, appliedRange, setAppliedRange }) {
  const canApply = rangeInput.start && rangeInput.end && rangeInput.start <= rangeInput.end;

  const apply = () => {
    if (canApply) { setAppliedRange({ start: rangeInput.start, end: rangeInput.end }); setShowRangePicker(false); }
  };
  const clearRange = () => {
    setAppliedRange(null); setRangeInput({ start: '', end: '' }); setShowRangePicker(false); setWeekOffset(0);
  };

  if (appliedRange) {
    return (
      <div className="flex items-center justify-between mb-6 px-4 py-3 rounded-2xl" style={{ background: 'rgba(201,149,42,0.06)', border: '1px solid rgba(201,149,42,0.15)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <CalendarRange size={13} style={{ color: '#C9952A', flexShrink: 0 }} />
          <span className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {displayDate(appliedRange.start)} – {displayDate(appliedRange.end)}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
            View only
          </span>
        </div>
        <button onClick={clearRange} className="flex items-center gap-1 ml-3 px-3 py-1.5 rounded-xl text-xs flex-shrink-0 transition-colors" style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}>
          <X size={11} /> Clear
        </button>
      </div>
    );
  }

  if (showRangePicker) {
    return (
      <div className="mb-6 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Custom Date Range</p>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>From</p>
            <input type="date" value={rangeInput.start} max={rangeInput.end || TODAY}
              onChange={(e) => setRangeInput(r => ({ ...r, start: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>To</p>
            <input type="date" value={rangeInput.end} min={rangeInput.start} max={TODAY}
              onChange={(e) => setRangeInput(r => ({ ...r, end: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={apply} disabled={!canApply}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
            style={{ background: 'rgba(29,158,117,0.15)', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.3)' }}>
            Apply range
          </button>
          <button onClick={() => setShowRangePicker(false)} className="px-5 py-2.5 rounded-xl text-sm transition-all" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <button onClick={() => setWeekOffset(w => w + 1)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors"
        style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <ChevronLeft size={14} strokeWidth={2.5} /> Prev
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ color: weekOffset === 0 ? '#1D9E75' : 'rgba(255,255,255,0.55)' }}>
          {getWeekLabel(weekOffset)}
        </span>
        {weekOffset > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)' }}>
            View only
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button onClick={() => setShowRangePicker(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-colors"
          style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <CalendarRange size={13} /><span className="hidden sm:inline">Range</span>
        </button>
        <button onClick={() => setWeekOffset(w => Math.max(0, w - 1))} disabled={weekOffset === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors"
          style={{ color: weekOffset === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', cursor: weekOffset === 0 ? 'not-allowed' : 'pointer' }}>
          Next <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ── Prayer History ────────────────────────────────────────────────────────────
function PrayerHistory({ userId, weekOffset, customRange }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!userId) return;
    let startStr, endStr;
    if (customRange) { startStr = customRange.start; endStr = customRange.end; }
    else { const { start, end } = getWeekBounds(weekOffset); startStr = fmtDate(start); endStr = fmtDate(end); }
    supabase.from('prayers').select('*').eq('user_id', userId).gte('date', startStr).lte('date', endStr)
      .order('date', { ascending: false }).then(({ data }) => setRecords(data || []));
  }, [userId, weekOffset, customRange?.start, customRange?.end]);

  if (customRange) {
    let total = 0, onTime = 0, late = 0, missed = 0;
    records.forEach(r => { PRAYER_KEYS.forEach(p => { if (r[p]) { total++; if (r[p] === 'on_time') onTime++; else if (r[p] === 'late') late++; else if (r[p] === 'missed') missed++; } }); });
    const days = Math.round((new Date(customRange.end + 'T12:00:00') - new Date(customRange.start + 'T12:00:00')) / 86400000) + 1;

    return (
      <div className="rounded-3xl p-6 h-full flex flex-col" style={CARD}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Prayer Log</p>
            <p className="text-white/30 text-xs">{days} day period</p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }}>View only</span>
        </div>

        {records.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/20 text-sm">No prayers logged this period</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { label: 'On time', value: onTime, color: '#1D9E75', bg: 'rgba(29,158,117,0.08)' },
              { label: 'Late',    value: late,   color: '#C9952A', bg: 'rgba(201,149,42,0.08)' },
              { label: 'Missed',  value: missed,  color: '#e57368', bg: 'rgba(192,57,43,0.06)' },
            ].map(({ label, value, color, bg }) => {
              const pct = total > 0 ? value / total : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                    <span className="text-xs font-bold" style={{ color }}>
                      {value} <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>({Math.round(pct * 100)}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct * 100}%`, background: color, opacity: 0.75 }} />
                  </div>
                </div>
              );
            })}
            <p className="text-white/15 text-xs pt-3 border-t border-white/5">{total} prayers across {records.length} days</p>
          </div>
        )}
      </div>
    );
  }

  const { start, end } = getWeekBounds(weekOffset);
  const label = weekOffset === 0 ? 'This Week'
    : `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  if (records.length === 0) {
    return (
      <div className="rounded-3xl p-6 h-full flex flex-col items-center justify-center gap-2" style={CARD}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '18px' }}>☽</span>
        </div>
        <p className="text-white/25 text-sm font-medium">No prayer records yet</p>
        <p className="text-white/12 text-xs">Log today's prayers to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-6 h-full flex flex-col" style={CARD}>
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.25)' }}>
        {label}
      </p>
      <div className="space-y-2 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {records.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-xs font-medium w-24 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <div className="flex gap-3.5">
              {PRAYER_KEYS.map((p) => (
                <div key={p} className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={statusDot(r[p])} />
                  <span className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.18)' }}>{p[0].toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────
function ProfileView({ user, onSignOut }) {
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';
  const initials = displayName.slice(0, 2).toUpperCase();
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="max-w-lg mx-auto space-y-3">
      {/* Avatar card */}
      <div className="rounded-3xl p-8 text-center" style={GOLD_CARD}>
        {/* Avatar ring */}
        <div className="relative w-20 h-20 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg, #C9952A, #e8b84b, #C9952A)', padding: '2px' }}>
            <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: '#020c07' }}>
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

      {/* Account actions */}
      <div className="rounded-3xl overflow-hidden" style={CARD}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Account</p>
        </div>
        <button onClick={onSignOut}
          className="w-full px-5 py-4 text-left text-sm flex items-center gap-3 hover:bg-white/5 transition-colors"
          style={{ color: 'rgba(239,100,100,0.75)' }}>
          <LogOut size={15} />
          Sign out
        </button>
      </div>

      {/* Islamic closing */}
      <div className="pt-4 pb-2 text-center">
        <p className="arabic-text text-xl mb-1" style={{ color: 'rgba(201,149,42,0.25)' }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <p className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.1)' }}>In the name of Allah</p>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'home');
  const [weekOffset, setWeekOffset] = useState(0);
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [rangeInput, setRangeInput] = useState({ start: '', end: '' });
  const [appliedRange, setAppliedRange] = useState(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

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

  const resetNav = () => { setWeekOffset(0); setShowRangePicker(false); setRangeInput({ start: '', end: '' }); setAppliedRange(null); };
  const handleTabChange = (tab) => { setActiveTab(tab); resetNav(); };
  const handleSignOut = async () => { await signOut(); navigate('/'); };

  if (checkingOnboarding) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#020c07' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(29,158,117,0.2)', borderTopColor: '#1D9E75' }} />
    </div>
  );

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';
  const firstName = displayName.split(' ')[0];
  const navProps = { weekOffset, setWeekOffset, showRangePicker, setShowRangePicker, rangeInput, setRangeInput, appliedRange, setAppliedRange };

  return (
    <div className="min-h-screen relative" style={{ background: '#020c07' }}>

      {/* Layered atmospheric glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(29,158,117,0.09) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 30% at 80% 20%, rgba(201,149,42,0.04) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 40% 25% at 10% 80%, rgba(29,158,117,0.03) 0%, transparent 60%)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 lg:pb-12">

        {/* ── Header ── */}
        <div className="flex items-center justify-between pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-3 flex-shrink-0">
            <img src="/logo.png" alt="Path of Sabr" className="h-9 w-9 rounded-full object-cover shrink-0" />
            <span className="font-bold text-base tracking-tight" style={{ color: '#1D9E75' }}>Path of Sabr</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Companion CTA */}
            <button
              onClick={() => navigate('/companion')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold tracking-wide transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #C9952A 0%, #e8b84b 100%)',
                color: '#020c07',
                boxShadow: '0 0 24px rgba(201,149,42,0.3), 0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              ✦ <span className="hidden sm:inline">Meet Your Deen Companion</span>
              <span className="sm:hidden">Companion</span>
            </button>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-0.5 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {['home', 'prayers', 'profile'].map((tab) => (
                <button key={tab} onClick={() => handleTabChange(tab)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all duration-150"
                  style={activeTab === tab
                    ? { background: 'rgba(29,158,117,0.14)', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.25)' }
                    : { color: 'rgba(255,255,255,0.3)', border: '1px solid transparent' }}>
                  {tab === 'home' ? 'Home' : tab === 'prayers' ? 'Prayers' : 'Profile'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── HOME ── */}
        {activeTab === 'home' && (
          <>
            {/* Welcome hero */}
            <div className="mt-10 mb-8">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(29,158,117,0.65)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
                Assalamu Alaykum,
              </h1>
              <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight" style={{ color: '#C9952A' }}>
                {firstName}.
              </h1>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-px w-12" style={{ background: 'linear-gradient(to right, rgba(201,149,42,0.5), transparent)' }} />
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Your deen journey continues today</p>
              </div>
            </div>

            <NavBar {...navProps} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
              <PrayerTracker userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
              <DailyCheckIn  userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
              <PrayerHistory userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
            </div>

            <ProgressZone userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
          </>
        )}

        {/* ── PRAYERS ── */}
        {activeTab === 'prayers' && (
          <>
            <div className="mt-10 mb-8">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>Track</p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Prayers</h1>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-px w-12" style={{ background: 'linear-gradient(to right, rgba(29,158,117,0.5), transparent)' }} />
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Log and review your salah</p>
              </div>
            </div>
            <NavBar {...navProps} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 items-stretch">
              <PrayerTracker userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
              <PrayerHistory userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
            </div>
          </>
        )}

        {/* ── PROFILE ── */}
        {activeTab === 'profile' && (
          <>
            <div className="mt-10 mb-8">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>Account</p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Profile</h1>
            </div>
            <ProfileView user={user} onSignOut={handleSignOut} />
          </>
        )}
      </div>

      <div className="lg:hidden">
        <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>
    </div>
  );
}
