import { Link } from 'react-router-dom';

export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Link to="/">
            <img src="/logo.png" alt="Path of Sabr" className="h-12 w-12 rounded-full object-cover mb-4" />
          </Link>
        </div>

        {/* Coming soon card */}
        <div
          className="rounded-2xl px-8 py-10 text-center"
          style={{
            background: 'linear-gradient(160deg, #0f3d22 0%, #051a10 100%)',
            border: '1px solid rgba(29,158,117,0.3)',
            boxShadow: '0 0 48px rgba(29,158,117,0.07), 0 8px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.25)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>

          <p
            className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3"
            style={{ color: 'rgba(29,158,117,0.7)' }}
          >
            Coming Soon
          </p>

          <h1 className="text-xl font-bold text-white leading-snug mb-3">
            Join the waitlist to be first through the door
          </h1>

          <p className="text-white/40 text-sm leading-relaxed mb-8">
            Path of Sabr is almost ready. Get early access by joining the waitlist at our website.
          </p>

          <a
            href="https://pathofsabr.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block text-white font-semibold px-8 py-3.5 rounded-xl text-sm"
          >
            Join the Waitlist →
          </a>
        </div>

        {/* Login link for existing users */}
        <p className="text-center text-white/35 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-medium transition-colors" style={{ color: '#1D9E75' }}>
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
