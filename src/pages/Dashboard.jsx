import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarRange, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PrayerTracker from '../components/dashboard/PrayerTracker';
import DailyCheckIn from '../components/dashboard/DailyCheckIn';
import BottomNav from '../components/dashboard/BottomNav';
import ProgressZone from '../components/dashboard/ProgressZone';

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const TODAY = new Date().toISOString().split('T')[0];

const CARD_STYLE = {
  background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.025) 100%)',
  border: '1px solid rgba(201,149,42,0.15)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
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
  if (s === 'missed')  return { background: '#C0392B' };
  return { background: 'rgba(255,255,255,0.1)' };
}

// ── Navigation ─────────────────────────────────────────────────────────────────
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
      <div className="flex items-center justify-between mb-5 px-4 py-3 rounded-2xl" style={{ background: 'rgba(201,149,42,0.06)', border: '1px solid rgba(201,149,42,0.15)' }}>
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
      <div className="mb-5 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
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
    <div className="flex items-center justify-between mb-5">
      <button onClick={() => setWeekOffset(w => w + 1)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors"
        style={{ color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <ChevronLeft size={14} strokeWidth={2.5} /> Prev
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ color: weekOffset === 0 ? '#1D9E75' : 'rgba(255,255,255,0.6)' }}>
          {getWeekLabel(weekOffset)}
        </span>
        {weekOffset > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
            View only
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button onClick={() => setShowRangePicker(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <CalendarRange size={13} /><span className="hidden sm:inline">Custom range</span>
        </button>
        <button onClick={() => setWeekOffset(w => Math.max(0, w - 1))} disabled={weekOffset === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors"
          style={{ color: weekOffset === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', cursor: weekOffset === 0 ? 'not-allowed' : 'pointer' }}>
          Next <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ── Prayer History ─────────────────────────────────────────────────────────────
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
      <div className="dash-card rounded-3xl p-6 h-full flex flex-col" style={CARD_STYLE}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Prayer Log</p>
            <p className="text-white/25 text-xs">{days} day period</p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}>View only</span>
        </div>

        {records.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/25 text-sm">No prayers logged this period</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { label: 'On time', value: onTime, color: '#1D9E75' },
              { label: 'Late',    value: late,   color: '#C9952A' },
              { label: 'Missed',  value: missed,  color: '#e57368' },
            ].map(({ label, value, color }) => {
              const pct = total > 0 ? value / total : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                    <span className="text-xs font-semibold" style={{ color }}>
                      {value} <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>({Math.round(pct * 100)}%)</span>
                    </span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct * 100}%`, background: color, opacity: 0.7 }} />
                  </div>
                </div>
              );
            })}
            <p className="text-white/20 text-xs pt-2 border-t border-white/5">{total} prayers across {records.length} days</p>
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
      <div className="dash-card rounded-3xl p-6 h-full flex flex-col items-center justify-center" style={CARD_STYLE}>
        <p className="text-white/25 text-sm">No prayer records yet</p>
        <p className="text-white/15 text-xs mt-1">Log today's prayers to get started</p>
      </div>
    );
  }

  return (
    <div className="dash-card rounded-3xl p-6 h-full flex flex-col" style={CARD_STYLE}>
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {label}
      </p>
      <div className="space-y-1.5 flex-1 overflow-y-auto">
        {records.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-white/40 text-xs font-medium w-24 flex-shrink-0">
              {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <div className="flex gap-3">
              {PRAYER_KEYS.map((p) => (
                <div key={p} className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={statusDot(r[p])} />
                  <span className="text-[9px] font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>{p[0].toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profile ────────────────────────────────────────────────────────────────────
function ProfileView({ user, onSignOut }) {
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';
  return (
    <div className="max-w-lg mx-auto">
      <div className="dash-card rounded-3xl p-8 mb-3 text-center" style={CARD_STYLE}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.2)' }}>
          <span className="font-bold text-2xl" style={{ color: '#1D9E75' }}>{displayName[0].toUpperCase()}</span>
        </div>
        <p className="text-white font-semibold text-lg">{displayName}</p>
        <p className="text-white/35 text-sm mt-1">{user?.email}</p>
      </div>
      <div className="dash-card rounded-3xl overflow-hidden mb-3" style={CARD_STYLE}>
        <div className="px-5 py-3 border-b border-white/5">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>Account</p>
        </div>
        <button onClick={onSignOut} className="w-full px-5 py-4 text-left text-sm hover:bg-white/5 transition-colors" style={{ color: 'rgba(239,68,68,0.7)' }}>
          Sign out
        </button>
      </div>
      <p className="text-center text-white/10 arabic-text text-lg mt-8">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
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
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(29,158,117,0.3)', borderTopColor: '#1D9E75' }} />
    </div>
  );

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';
  const navProps = { weekOffset, setWeekOffset, showRangePicker, setShowRangePicker, rangeInput, setRangeInput, appliedRange, setAppliedRange };

  return (
    <div className="min-h-screen relative" style={{ background: '#020c07' }}>

      {/* Atmospheric page glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 100% 45% at 50% -5%, rgba(29,158,117,0.07) 0%, transparent 70%)',
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 lg:pb-10">

        {/* Header */}
        <div className="flex items-center justify-between pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Path of Sabr" className="h-9 w-9 rounded-full object-cover shrink-0" />
            <span className="font-bold text-base tracking-tight" style={{ color: '#1D9E75' }}>Path of Sabr</span>
          </div>
          <div className="hidden lg:flex items-center gap-0.5 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {['home', 'prayers', 'profile'].map((tab) => (
              <button key={tab} onClick={() => handleTabChange(tab)}
                className="px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all duration-150 tracking-wide"
                style={activeTab === tab
                  ? { background: 'rgba(29,158,117,0.15)', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.2)' }
                  : { color: 'rgba(255,255,255,0.35)', border: '1px solid transparent' }}>
                {tab === 'home' ? 'Home' : tab === 'prayers' ? 'Prayers' : 'Profile'}
              </button>
            ))}
          </div>
        </div>

        {/* HOME */}
        {activeTab === 'home' && (
          <>
            <div className="mt-8 mb-6">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: '#1D9E75' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                Assalamu Alaykum, {displayName}
              </h1>
            </div>

            <NavBar {...navProps} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
              <PrayerTracker userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
              <DailyCheckIn   userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
              <PrayerHistory  userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
            </div>

            <ProgressZone userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
          </>
        )}

        {/* PRAYERS */}
        {activeTab === 'prayers' && (
          <>
            <div className="mt-8 mb-6">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Track</p>
              <h1 className="text-2xl font-bold text-white">Prayers</h1>
            </div>
            <NavBar {...navProps} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 items-stretch">
              <PrayerTracker userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
              <PrayerHistory userId={user?.id} weekOffset={weekOffset} customRange={appliedRange} />
            </div>
          </>
        )}

        {/* PROFILE */}
        {activeTab === 'profile' && (
          <>
            <div className="mt-8 mb-6">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Account</p>
              <h1 className="text-2xl font-bold text-white">Profile</h1>
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
