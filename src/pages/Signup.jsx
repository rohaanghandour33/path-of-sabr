import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ── Countries with flag emojis (sorted alphabetically) ───────────────────────
const COUNTRIES = [
  { name: 'Afghanistan',            flag: '🇦🇫' },
  { name: 'Albania',                flag: '🇦🇱' },
  { name: 'Algeria',                flag: '🇩🇿' },
  { name: 'Argentina',              flag: '🇦🇷' },
  { name: 'Australia',              flag: '🇦🇺' },
  { name: 'Austria',                flag: '🇦🇹' },
  { name: 'Azerbaijan',             flag: '🇦🇿' },
  { name: 'Bahrain',                flag: '🇧🇭' },
  { name: 'Bangladesh',             flag: '🇧🇩' },
  { name: 'Belgium',                flag: '🇧🇪' },
  { name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { name: 'Brazil',                 flag: '🇧🇷' },
  { name: 'Brunei',                 flag: '🇧🇳' },
  { name: 'Canada',                 flag: '🇨🇦' },
  { name: 'Chad',                   flag: '🇹🇩' },
  { name: 'China',                  flag: '🇨🇳' },
  { name: 'Comoros',                flag: '🇰🇲' },
  { name: 'Denmark',                flag: '🇩🇰' },
  { name: 'Djibouti',               flag: '🇩🇯' },
  { name: 'Egypt',                  flag: '🇪🇬' },
  { name: 'Ethiopia',               flag: '🇪🇹' },
  { name: 'Finland',                flag: '🇫🇮' },
  { name: 'France',                 flag: '🇫🇷' },
  { name: 'Gambia',                 flag: '🇬🇲' },
  { name: 'Germany',                flag: '🇩🇪' },
  { name: 'Ghana',                  flag: '🇬🇭' },
  { name: 'Greece',                 flag: '🇬🇷' },
  { name: 'Guinea',                 flag: '🇬🇳' },
  { name: 'Hungary',                flag: '🇭🇺' },
  { name: 'India',                  flag: '🇮🇳' },
  { name: 'Indonesia',              flag: '🇮🇩' },
  { name: 'Iran',                   flag: '🇮🇷' },
  { name: 'Iraq',                   flag: '🇮🇶' },
  { name: 'Ireland',                flag: '🇮🇪' },
  { name: 'Israel',                 flag: '🇮🇱' },
  { name: 'Italy',                  flag: '🇮🇹' },
  { name: 'Japan',                  flag: '🇯🇵' },
  { name: 'Jordan',                 flag: '🇯🇴' },
  { name: 'Kazakhstan',             flag: '🇰🇿' },
  { name: 'Kenya',                  flag: '🇰🇪' },
  { name: 'Kosovo',                 flag: '🇽🇰' },
  { name: 'Kuwait',                 flag: '🇰🇼' },
  { name: 'Kyrgyzstan',             flag: '🇰🇬' },
  { name: 'Lebanon',                flag: '🇱🇧' },
  { name: 'Libya',                  flag: '🇱🇾' },
  { name: 'Malaysia',               flag: '🇲🇾' },
  { name: 'Maldives',               flag: '🇲🇻' },
  { name: 'Mali',                   flag: '🇲🇱' },
  { name: 'Mauritania',             flag: '🇲🇷' },
  { name: 'Mexico',                 flag: '🇲🇽' },
  { name: 'Morocco',                flag: '🇲🇦' },
  { name: 'Netherlands',            flag: '🇳🇱' },
  { name: 'New Zealand',            flag: '🇳🇿' },
  { name: 'Niger',                  flag: '🇳🇪' },
  { name: 'Nigeria',                flag: '🇳🇬' },
  { name: 'Norway',                 flag: '🇳🇴' },
  { name: 'Oman',                   flag: '🇴🇲' },
  { name: 'Pakistan',               flag: '🇵🇰' },
  { name: 'Palestine',              flag: '🇵🇸' },
  { name: 'Philippines',            flag: '🇵🇭' },
  { name: 'Poland',                 flag: '🇵🇱' },
  { name: 'Portugal',               flag: '🇵🇹' },
  { name: 'Qatar',                  flag: '🇶🇦' },
  { name: 'Russia',                 flag: '🇷🇺' },
  { name: 'Saudi Arabia',           flag: '🇸🇦' },
  { name: 'Senegal',                flag: '🇸🇳' },
  { name: 'Sierra Leone',           flag: '🇸🇱' },
  { name: 'Somalia',                flag: '🇸🇴' },
  { name: 'South Africa',           flag: '🇿🇦' },
  { name: 'South Korea',            flag: '🇰🇷' },
  { name: 'Spain',                  flag: '🇪🇸' },
  { name: 'Sri Lanka',              flag: '🇱🇰' },
  { name: 'Sudan',                  flag: '🇸🇩' },
  { name: 'Sweden',                 flag: '🇸🇪' },
  { name: 'Switzerland',            flag: '🇨🇭' },
  { name: 'Syria',                  flag: '🇸🇾' },
  { name: 'Tajikistan',             flag: '🇹🇯' },
  { name: 'Tanzania',               flag: '🇹🇿' },
  { name: 'Thailand',               flag: '🇹🇭' },
  { name: 'Tunisia',                flag: '🇹🇳' },
  { name: 'Turkey',                 flag: '🇹🇷' },
  { name: 'Turkmenistan',           flag: '🇹🇲' },
  { name: 'Uganda',                 flag: '🇺🇬' },
  { name: 'Ukraine',                flag: '🇺🇦' },
  { name: 'United Arab Emirates',   flag: '🇦🇪' },
  { name: 'United Kingdom',         flag: '🇬🇧' },
  { name: 'United States',          flag: '🇺🇸' },
  { name: 'Uzbekistan',             flag: '🇺🇿' },
  { name: 'Vietnam',                flag: '🇻🇳' },
  { name: 'Western Sahara',         flag: '🇪🇭' },
  { name: 'Yemen',                  flag: '🇾🇪' },
  { name: 'Zimbabwe',               flag: '🇿🇼' },
].sort((a, b) => a.name.localeCompare(b.name));

// ── Custom country picker with flags + search ─────────────────────────────────
function CountrySelect({ value, onChange }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when opening
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const filtered = search.trim()
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES;

  const selected = COUNTRIES.find(c => c.name === value);

  return (
    <div ref={wrapRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full rounded-xl px-3 py-2.5 text-sm text-left flex items-center justify-between transition-colors"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: open
            ? '1px solid rgba(29,158,117,0.55)'
            : '1px solid rgba(255,255,255,0.1)',
          color: value ? 'white' : 'rgba(255,255,255,0.3)',
        }}
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              <span className="text-base flex-shrink-0">{selected.flag}</span>
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            <span>Select country</span>
          )}
        </span>
        <span className="flex-shrink-0 ml-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
          style={{
            background: '#0b2318',
            border: '1px solid rgba(29,158,117,0.22)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          }}
        >
          {/* Search */}
          <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent text-white text-sm placeholder-white/25 focus:outline-none"
            />
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 220, scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {filtered.length === 0 ? (
              <p className="text-center py-4 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No results</p>
            ) : (
              filtered.map(c => {
                const isSelected = c.name === value;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => { onChange(c.name); setOpen(false); setSearch(''); }}
                    className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 text-sm transition-colors"
                    style={{
                      background: isSelected ? 'rgba(29,158,117,0.15)' : 'transparent',
                      color: isSelected ? '#1D9E75' : 'rgba(255,255,255,0.8)',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span className="text-base flex-shrink-0">{c.flag}</span>
                    <span>{c.name}</span>
                    {isSelected && <span className="ml-auto text-xs">✓</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName,     setFullName]     = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [country,      setCountry]      = useState('');
  const [city,         setCity]         = useState('');
  const [timezone,     setTimezone]     = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [showTzPicker, setShowTzPicker] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(false);

  // All IANA timezones supported by the browser
  const allTimezones = Intl.supportedValuesOf
    ? Intl.supportedValuesOf('timeZone')
    : [timezone];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!country) { setError('Please select your country — it is needed for accurate prayer times.'); return; }
    if (!city.trim()) { setError('Please enter your city — it is needed for accurate prayer times.'); return; }
    setLoading(true);

    const { error: signUpError } = await signUp(email, password, fullName, { timezone, country, city: city.trim() });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  // ── COMING SOON — set to false to re-enable signup form ──────────────────
  const COMING_SOON = false;

  if (COMING_SOON) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <Link to="/">
            <img src="/logo.png" alt="Path of Sabr" className="h-12 w-12 rounded-full object-cover mx-auto mb-8" />
          </Link>
          <div
            className="rounded-2xl p-10"
            style={{ background: 'linear-gradient(145deg, #0d3820, #06180e)', border: '1px solid rgba(29,158,117,0.25)' }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)' }}>
              <span className="text-xl">🕌</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-3 tracking-tight">Coming Soon</h1>
            <p className="text-white/55 text-sm leading-relaxed mb-8">
              Join the waitlist to be first through the door.
            </p>
            <a
              href="https://pathofsabr.com"
              className="btn-primary inline-block text-white font-semibold px-8 py-3 rounded-xl text-sm"
            >
              Join the Waitlist
            </a>
          </div>
          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1D9E75] hover:text-[#1D9E75]/80 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── SIGNUP FORM ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/">
            <img src="/logo.png" alt="Path of Sabr" className="h-12 w-12 rounded-full object-cover mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-white/50 text-sm mt-1">Begin your journey with Path of Sabr</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {success ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#1D9E75]/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-white font-semibold text-lg mb-2">Check your email</h2>
              <p className="text-white/50 text-sm">
                We sent a confirmation link to <span className="text-white/80">{email}</span>.
                Click the link to activate your account.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Your name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#1D9E75]/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#1D9E75]/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#1D9E75]/60 transition-colors"
                />
              </div>

              {/* ── Location ─────────────────────────────────────────────────── */}
              <div className="rounded-xl p-4 space-y-4" style={{ background: 'rgba(29,158,117,0.05)', border: '1px solid rgba(29,158,117,0.15)' }}>
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5">🕌</span>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Your city and country are used to show <span style={{ color: '#1D9E75' }}>accurate daily prayer times</span> based on your location.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Country</label>
                    <CountrySelect value={country} onChange={setCountry} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. London"
                      className="w-full rounded-xl px-3 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#1D9E75]/60 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                </div>

                {/* Timezone — auto-detected, tap to change */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Timezone</label>
                  {showTzPicker ? (
                    <select
                      value={timezone}
                      onChange={(e) => { setTimezone(e.target.value); setShowTzPicker(false); }}
                      autoFocus
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#1D9E75]/60 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,149,42,0.35)', colorScheme: 'dark' }}
                    >
                      {allTimezones.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
                    </select>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowTzPicker(true)}
                      className="w-full text-left rounded-xl px-3 py-2.5 text-sm transition-colors flex items-center justify-between"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                    >
                      <span>{timezone.replace(/_/g, ' ')}</span>
                      <span className="text-[10px]" style={{ color: 'rgba(201,149,42,0.6)' }}>change</span>
                    </button>
                  )}
                  <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Auto-detected from your device</p>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Get started'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1D9E75] hover:text-[#1D9E75]/80 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
