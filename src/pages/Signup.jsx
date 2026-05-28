import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ── Country list (Muslim-majority countries first, then alphabetical) ─────────
const COUNTRIES = [
  // Muslim-majority / commonly used first
  'Afghanistan','Albania','Algeria','Azerbaijan','Bahrain','Bangladesh','Bosnia and Herzegovina',
  'Brunei','Chad','Comoros','Djibouti','Egypt','Gambia','Guinea','Indonesia','Iran','Iraq',
  'Jordan','Kazakhstan','Kosovo','Kuwait','Kyrgyzstan','Lebanon','Libya','Malaysia','Maldives',
  'Mali','Mauritania','Morocco','Niger','Nigeria','Oman','Pakistan','Palestine','Qatar',
  'Saudi Arabia','Senegal','Sierra Leone','Somalia','Sudan','Syria','Tajikistan','Tunisia',
  'Turkey','Turkmenistan','United Arab Emirates','Uzbekistan','Western Sahara','Yemen',
  // Rest of world
  'Argentina','Australia','Austria','Belgium','Brazil','Canada','China','Denmark','Ethiopia',
  'Finland','France','Germany','Ghana','Greece','Hungary','India','Ireland','Israel','Italy',
  'Japan','Kenya','Mexico','Netherlands','New Zealand','Norway','Philippines','Poland',
  'Portugal','Russia','South Africa','South Korea','Spain','Sri Lanka','Sweden','Switzerland',
  'Tanzania','Thailand','Uganda','Ukraine','United Kingdom','United States','Vietnam','Zimbabwe',
].sort();

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName,  setFullName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [country,   setCountry]   = useState('');
  const [city,      setCity]      = useState('');
  const [timezone,  setTimezone]  = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [showTzPicker, setShowTzPicker] = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);

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

  // ── SIGNUP FORM (re-enable by setting COMING_SOON = false above) ───────────
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

              {/* ── Location — needed for accurate prayer times ─────────────── */}
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
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#1D9E75]/60 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
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
