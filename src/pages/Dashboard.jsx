import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarRange, X, LogOut } from 'lucide-react';
import Companion from './Companion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { checkAndGenerateTasks, getUserSchedule } from '../lib/taskUtils';
import PrayerTracker from '../components/dashboard/PrayerTracker';
import DailyCheckIn from '../components/dashboard/DailyCheckIn';
import BottomNav from '../components/dashboard/BottomNav';
import WeeklyPrayerRing from '../components/dashboard/WeeklyPrayerRing';
import HomeSummaryCards from '../components/dashboard/HomeSummaryCards';
import TasksView from '../components/dashboard/TasksView';
import ScheduleSurvey from '../components/dashboard/ScheduleSurvey';

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

const DAILY_QUOTES = [
  // ── Quran ──────────────────────────────────────────────────────────────────
  { type: 'quran',  text: "Indeed, with hardship comes ease.",                                                              ref: "Al-Inshirah 94:6" },
  { type: 'quran',  text: "And Allah is with the patient.",                                                                  ref: "Al-Baqarah 2:153" },
  { type: 'quran',  text: "Verily, the remembrance of Allah is the greatest.",                                               ref: "Al-Ankabut 29:45" },
  { type: 'quran',  text: "Allah does not burden a soul beyond that it can bear.",                                           ref: "Al-Baqarah 2:286" },
  { type: 'quran',  text: "So remember Me; I will remember you.",                                                            ref: "Al-Baqarah 2:152" },
  { type: 'quran',  text: "And He found you lost and guided you.",                                                           ref: "Ad-Duha 93:7" },
  { type: 'quran',  text: "Your Lord has not taken leave of you, nor has He detested you.",                                  ref: "Ad-Duha 93:3" },
  { type: 'quran',  text: "Put your trust in Allah. Indeed, Allah loves those who trust in Him.",                            ref: "Al-Imran 3:159" },
  { type: 'quran',  text: "Whoever relies upon Allah — He is sufficient for him.",                                           ref: "At-Talaq 65:3" },
  { type: 'quran',  text: "Do not lose hope, nor be sad. You will surely be victorious if you are true believers.",          ref: "Al-Imran 3:139" },
  { type: 'quran',  text: "And when My servants ask you about Me — I am near.",                                              ref: "Al-Baqarah 2:186" },
  { type: 'quran',  text: "Indeed, the patient will be given their reward without account.",                                 ref: "Az-Zumar 39:10" },
  { type: 'quran',  text: "And whoever fears Allah — He will make for him a way out.",                                       ref: "At-Talaq 65:2" },
  { type: 'quran',  text: "And He is with you wherever you are.",                                                            ref: "Al-Hadid 57:4" },
  { type: 'quran',  text: "Call upon Me; I will respond to you.",                                                            ref: "Ghafir 40:60" },
  { type: 'quran',  text: "My mercy encompasses all things.",                                                                ref: "Al-A'raf 7:156" },
  { type: 'quran',  text: "And do not despair of relief from Allah. Indeed, no one despairs of His relief except the disbelieving people.", ref: "Yusuf 12:87" },
  { type: 'quran',  text: "So be patient. Indeed, the promise of Allah is truth.",                                           ref: "Ghafir 40:55" },
  { type: 'quran',  text: "And seek help through patience and prayer.",                                                      ref: "Al-Baqarah 2:45" },
  { type: 'quran',  text: "He knows what is in every heart.",                                                                ref: "Al-Mulk 67:13" },
  { type: 'quran',  text: "And speak to people good words.",                                                                 ref: "Al-Baqarah 2:83" },
  { type: 'quran',  text: "Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater.",   ref: "Al-Ankabut 29:45" },
  { type: 'quran',  text: "Every soul will taste death. Then to Us you will be returned.",                                   ref: "Al-Ankabut 29:57" },
  { type: 'quran',  text: "So verily, with every difficulty there is relief.",                                               ref: "Al-Inshirah 94:5" },
  { type: 'quran',  text: "And your Lord is going to give you, and you will be satisfied.",                                  ref: "Ad-Duha 93:5" },
  { type: 'quran',  text: "And whoever does an atom's weight of good will see it.",                                          ref: "Az-Zalzalah 99:7" },
  { type: 'quran',  text: "Indeed, Allah will not change the condition of a people until they change what is in themselves.", ref: "Ar-Ra'd 13:11" },
  { type: 'quran',  text: "And He found you poor and made you self-sufficient.",                                             ref: "Ad-Duha 93:8" },
  // ── Hadith ─────────────────────────────────────────────────────────────────
  { type: 'hadith', text: "The most beloved deeds to Allah are those done most consistently, even if they are small.",      ref: "Prophet ﷺ — Bukhari & Muslim" },
  { type: 'hadith', text: "None of you truly believes until he loves for his brother what he loves for himself.",            ref: "Prophet ﷺ — Bukhari & Muslim" },
  { type: 'hadith', text: "Speak good or remain silent.",                                                                    ref: "Prophet ﷺ — Bukhari & Muslim" },
  { type: 'hadith', text: "The strong person is not the one who overcomes people. The strong person is the one who controls himself when angry.", ref: "Prophet ﷺ — Bukhari & Muslim" },
  { type: 'hadith', text: "Every act of goodness is a charity.",                                                            ref: "Prophet ﷺ — Muslim" },
  { type: 'hadith', text: "Smiling at your brother is an act of charity.",                                                  ref: "Prophet ﷺ — Tirmidhi" },
  { type: 'hadith', text: "He who does not show mercy will not be shown mercy.",                                             ref: "Prophet ﷺ — Bukhari & Muslim" },
  { type: 'hadith', text: "Allah is gentle and loves gentleness in all matters.",                                           ref: "Prophet ﷺ — Bukhari" },
  { type: 'hadith', text: "Make du'a to Allah while being certain of a response.",                                          ref: "Prophet ﷺ — Tirmidhi" },
  { type: 'hadith', text: "The one who remembers Allah and the one who does not are like the living and the dead.",         ref: "Prophet ﷺ — Bukhari" },
  { type: 'hadith', text: "A good character is the heaviest thing placed on the scale of deeds.",                          ref: "Prophet ﷺ — Tirmidhi" },
  { type: 'hadith', text: "Be in this world as though you are a stranger or a traveller passing through.",                  ref: "Prophet ﷺ — Bukhari" },
  { type: 'hadith', text: "Verily, Allah does not look at your bodies or your forms. He looks at your hearts and your actions.", ref: "Prophet ﷺ — Muslim" },
  { type: 'hadith', text: "Modesty brings nothing but good.",                                                               ref: "Prophet ﷺ — Bukhari & Muslim" },
  { type: 'hadith', text: "The best of you are those who learn the Quran and teach it.",                                    ref: "Prophet ﷺ — Bukhari" },
  { type: 'hadith', text: "Make things easy, do not make them difficult.",                                                  ref: "Prophet ﷺ — Bukhari" },
  { type: 'hadith', text: "The best of people are those who are most beneficial to people.",                                ref: "Prophet ﷺ — Al-Mu'jam al-Awsat" },
  { type: 'hadith', text: "Guard yourself from the Fire, even if it be with half a date.",                                  ref: "Prophet ﷺ — Bukhari & Muslim" },
  { type: 'hadith', text: "The dua of a Muslim for his brother in his absence is answered.",                                ref: "Prophet ﷺ — Muslim" },
  { type: 'hadith', text: "Take benefit of five before five: your youth, your health, your wealth, your free time, and your life.", ref: "Prophet ﷺ — Al-Hakim" },
  { type: 'hadith', text: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",               ref: "Prophet ﷺ — Bukhari & Muslim" },
  { type: 'hadith', text: "The world is a prison for the believer and a paradise for the disbeliever.",                    ref: "Prophet ﷺ — Muslim" },
  { type: 'hadith', text: "Feed the hungry, visit the sick, and free those in captivity.",                                 ref: "Prophet ﷺ — Bukhari" },
  { type: 'hadith', text: "Allah loves that when any of you does a deed, he does it with excellence.",                     ref: "Prophet ﷺ — Bayhaqi" },
  { type: 'hadith', text: "Whoever is not grateful to people is not grateful to Allah.",                                    ref: "Prophet ﷺ — Abu Dawud & Tirmidhi" },
];

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

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [weekOffset, setWeekOffset] = useState(0);
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [rangeInput, setRangeInput] = useState({ start: '', end: '' });
  const [appliedRange, setAppliedRange] = useState(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Live stats refresh — incremented whenever prayers or check-in are saved
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const refreshStats = () => setStatsRefreshKey((k) => k + 1);

  // Task system state
  const [isFirstWeek,        setIsFirstWeek]        = useState(false);
  const [freeDays,            setFreeDays]            = useState(null);   // null=loading, []=none, ['Mon',...]
  const [showScheduleSurvey,  setShowScheduleSurvey]  = useState(false);
  const [showFirstWeekPopup,  setShowFirstWeekPopup]  = useState(false);
  const [tomorrowTask,        setTomorrowTask]        = useState(null);   // task due tomorrow for banner

  // ── Onboarding gate ───────────────────────────────────────────────────────
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

  // ── Task system boot (runs after onboarding check) ───────────────────────
  useEffect(() => {
    if (!user || checkingOnboarding) return;

    const joined = user.created_at || user.user_metadata?.created_at;
    const days   = joined ? daysSince(joined) : 999;
    const firstWeek = days < 7;
    setIsFirstWeek(firstWeek);

    // First-week one-time popup
    const popupKey = `first_week_popup_${user.id}`;
    if (firstWeek && !localStorage.getItem(popupKey)) {
      setShowFirstWeekPopup(true);
      localStorage.setItem(popupKey, 'true');
    }

    if (firstWeek) { setFreeDays([]); return; }

    // Day 8+: fetch schedule for this week
    getUserSchedule(user.id).then(async (days) => {
      if (days === null) {
        // No schedule set yet → show survey
        setFreeDays([]);
        setShowScheduleSurvey(true);
      } else {
        setFreeDays(days);
        if (days.length > 0) {
          // Generate task if needed
          await checkAndGenerateTasks(user.id);
          // Check if there's a task due TOMORROW for in-app banner
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          const bannerKey = `tomorrow_banner_${user.id}_${tomorrowStr}`;
          if (!sessionStorage.getItem(bannerKey)) {
            const { data } = await supabase
              .from('user_tasks')
              .select('task_title, task_description, task_type')
              .eq('user_id', user.id)
              .eq('due_date', tomorrowStr)
              .eq('completed', false)
              .limit(1)
              .maybeSingle();
            if (data) {
              setTomorrowTask(data);
              sessionStorage.setItem(bannerKey, 'true');
            }
          }
        }
      }
    });
  }, [user?.id, checkingOnboarding]);

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

  // Daily rotating ayah — changes each calendar day
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const dailyQuote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: '100dvh', background: '#020c07' }}
    >

      {/* ── First-week popup ── */}
      {showFirstWeekPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: 'rgba(2,12,7,0.88)', backdropFilter: 'blur(10px)' }}>
          <div className="w-full max-w-sm rounded-3xl p-8 text-center"
            style={{ background: 'linear-gradient(145deg, #0d3320, #0a2318)', border: '1px solid rgba(201,149,42,0.3)' }}>
            <div className="text-4xl mb-4">🤲</div>
            <h2 className="text-white font-extrabold text-xl mb-3 tracking-tight">
              Welcome to Path of Sabr
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Before we give you tasks, we need to get to know you properly. This week — no tasks. Just use the app, talk to your AI companion, and log your prayers.
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
              From next week, your tasks will be completely personal to you — based on your real struggles, not a generic list.
            </p>
            <div className="h-px mb-5" style={{ background: 'rgba(201,149,42,0.2)' }} />
            <p className="text-[11px] mb-6" style={{ color: 'rgba(201,149,42,0.55)' }}>
              ✦ Week 1 is all about getting to know you
            </p>
            <button
              onClick={() => setShowFirstWeekPopup(false)}
              className="w-full btn-primary text-white font-bold py-4 rounded-2xl text-sm"
            >
              Let's begin →
            </button>
          </div>
        </div>
      )}

      {/* ── Schedule survey ── */}
      {showScheduleSurvey && !showFirstWeekPopup && (
        <ScheduleSurvey
          userId={user?.id}
          onSave={(days) => {
            setFreeDays(days);
            setShowScheduleSurvey(false);
            if (days.length > 0) checkAndGenerateTasks(user.id);
          }}
        />
      )}

      {/* ── Tomorrow task banner ── */}
      {tomorrowTask && !showScheduleSurvey && !showFirstWeekPopup && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(2,12,7,0.75)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: 'linear-gradient(145deg, #0d3320, #0a2318)', border: '1px solid rgba(29,158,117,0.3)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(201,149,42,0.12)', border: '1px solid rgba(201,149,42,0.25)', color: '#C9952A' }}>
                  Tomorrow's Task
                </span>
              </div>
              <button onClick={() => setTomorrowTask(null)} style={{ color: 'rgba(255,255,255,0.3)' }}>✕</button>
            </div>
            <h3 className="text-white font-extrabold text-lg mb-2">{tomorrowTask.task_title}</h3>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {tomorrowTask.task_description}
            </p>
            <button
              onClick={() => { setTomorrowTask(null); handleTabChange('tasks'); }}
              className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all"
              style={{ background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75' }}
            >
              Got it →
            </button>
          </div>
        </div>
      )}

      {/* Layered atmospheric glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(29,158,117,0.09) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 30% at 80% 20%, rgba(201,149,42,0.04) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 40% 25% at 10% 80%, rgba(29,158,117,0.03) 0%, transparent 60%)' }} />
      </div>

      {/* ── Header (always visible, flex-shrink-0) ── */}
      <div
        className="relative flex-shrink-0 px-4 sm:px-6 lg:px-8"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between pt-6 pb-5">
          <div className="flex items-center gap-3 flex-shrink-0">
            <img src="/logo.png" alt="Path of Sabr" className="h-9 w-9 rounded-full object-cover shrink-0" />
            <span className="font-bold text-base tracking-tight" style={{ color: '#1D9E75' }}>Path of Sabr</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { id: 'home',    label: 'Home' },
              { id: 'prayers', label: 'Prayers' },
              { id: 'tasks',   label: 'Tasks' },
              { id: 'ai',      label: 'AI Companion' },
              { id: 'profile', label: 'Profile' },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => handleTabChange(id)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150"
                style={activeTab === id
                  ? { background: 'rgba(29,158,117,0.14)', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.25)' }
                  : { color: 'rgba(255,255,255,0.3)', border: '1px solid transparent' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Companion tab (full remaining height, no padding) ── */}
      {activeTab === 'ai' && (
        <div className="flex-1 min-h-0">
          <Companion userId={user?.id} user={user} embedded />
        </div>
      )}

      {/* ── All other tabs (scrollable) ── */}
      {activeTab !== 'ai' && (
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-12">

        {/* ── HOME ── */}
        {activeTab === 'home' && (
          <>

            {/* ── Hero ── */}
            <div className="animate-fade-in-up mt-8 mb-10">

              {/* Date pill */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.15)' }}
              >
                <span style={{ color: 'rgba(29,158,117,0.7)', fontSize: '9px' }}>✦</span>
                <span className="text-xs font-semibold tracking-wide" style={{ color: 'rgba(29,158,117,0.85)' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {/* Greeting row */}
              <div className="flex items-start justify-between gap-8 mb-8">
                <div>
                  <h1 className="text-[2.6rem] lg:text-[3.4rem] font-extrabold text-white leading-[1.05] tracking-tight">
                    Assalamu Alaykum,
                  </h1>
                  <h1
                    className="text-[2.6rem] lg:text-[3.4rem] font-extrabold leading-[1.05] tracking-tight mb-5"
                    style={{ color: '#C9952A', textShadow: '0 0 60px rgba(201,149,42,0.3)' }}
                  >
                    {firstName}.
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="h-px w-10 rounded-full" style={{ background: 'linear-gradient(to right, rgba(201,149,42,0.5), transparent)' }} />
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Your deen journey continues today</p>
                  </div>
                </div>

                {/* Desktop companion CTA */}
                <button
                  onClick={() => handleTabChange('ai')}
                  className="hidden sm:flex flex-col items-center gap-2.5 px-7 py-6 rounded-3xl flex-shrink-0 transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(150deg, #C9952A 0%, #e8b84b 100%)',
                    boxShadow: '0 0 50px rgba(201,149,42,0.4), 0 12px 32px rgba(0,0,0,0.5)',
                  }}
                >
                  <span className="text-3xl">☽</span>
                  <span className="text-sm font-extrabold tracking-wide text-center leading-snug" style={{ color: '#020c07' }}>
                    Deen<br />Companion
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: 'rgba(2,12,7,0.5)' }}>
                    Talk now →
                  </span>
                </button>
              </div>

              {/* Daily reminder strip */}
              <div
                className="rounded-2xl px-5 py-4 mb-4"
                style={{
                  background: dailyQuote.type === 'hadith'
                    ? 'linear-gradient(135deg, rgba(29,158,117,0.07) 0%, rgba(29,158,117,0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(201,149,42,0.07) 0%, rgba(201,149,42,0.02) 100%)',
                  border: dailyQuote.type === 'hadith'
                    ? '1px solid rgba(29,158,117,0.15)'
                    : '1px solid rgba(201,149,42,0.14)',
                }}
              >
                <p
                  className="text-[9px] font-bold tracking-[0.2em] uppercase mb-2.5"
                  style={{ color: dailyQuote.type === 'hadith' ? 'rgba(29,158,117,0.6)' : 'rgba(201,149,42,0.55)' }}
                >
                  ✦ {dailyQuote.type === 'hadith' ? 'Hadith' : 'Quranic Verse'}
                </p>
                <p className="text-sm leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                  "{dailyQuote.text}"
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: dailyQuote.type === 'hadith' ? 'rgba(29,158,117,0.5)' : 'rgba(201,149,42,0.45)' }}
                >
                  — {dailyQuote.ref}
                </p>
              </div>

              {/* Mobile companion CTA */}
              <button
                onClick={() => handleTabChange('ai')}
                className="sm:hidden w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,149,42,0.12), rgba(201,149,42,0.05))',
                  border: '1px solid rgba(201,149,42,0.22)',
                }}
              >
                <span className="text-lg">☽</span>
                <span className="text-sm font-bold" style={{ color: '#C9952A' }}>Open Deen Companion</span>
                <span className="text-xs" style={{ color: 'rgba(201,149,42,0.5)' }}>→</span>
              </button>
            </div>

            {/* ── Today section header ── */}
            <div className="animate-fade-in-up delay-200 flex items-center gap-4 mb-5">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase flex-shrink-0" style={{ color: 'rgba(255,255,255,0.18)' }}>
                Today's Dashboard
              </p>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.06), transparent)' }} />
            </div>

            {/* ── Widget grid — always shows today ── */}
            <div className="animate-fade-in-up delay-200 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
              <PrayerTracker    userId={user?.id} weekOffset={0} customRange={null} onUpdate={refreshStats} />
              <DailyCheckIn     userId={user?.id} weekOffset={0} customRange={null} onUpdate={refreshStats} />
              <WeeklyPrayerRing userId={user?.id} refreshKey={statsRefreshKey} />
            </div>

            {/* ── Progress summary ── */}
            <div className="animate-fade-in-up delay-400">
              <HomeSummaryCards userId={user?.id} onViewTasks={() => handleTabChange('tasks')} refreshKey={statsRefreshKey} />
            </div>

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

        {/* ── TASKS ── */}
        {activeTab === 'tasks' && (
          <>
            <div className="mt-10 mb-8">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {isFirstWeek ? 'Week 1' : 'Your Task'}
              </p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Tasks</h1>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-px w-12" style={{ background: 'linear-gradient(to right, rgba(29,158,117,0.5), transparent)' }} />
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {isFirstWeek ? 'Getting to know you this week' : 'One task. Specific to you. Timed for when you\'re free.'}
                </p>
              </div>
            </div>
            <TasksView
              userId={user?.id}
              isFirstWeek={isFirstWeek}
              freeDays={freeDays || []}
              onNeedSchedule={() => setShowScheduleSurvey(true)}
            />
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
      </div>
      )}

      {/* Bottom nav — part of flex flow, never overlaps content */}
      <div className="lg:hidden flex-shrink-0">
        <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>

    </div>
  );
}
