import { useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

export default function Hero() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="waitlist" className="relative min-h-screen gradient-hero flex flex-col items-center justify-center overflow-hidden pt-24 sm:pt-28 pb-20">

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 100 }, (_, i) => {
          const a = i * 137.508;
          const r = 10 + (i * 73 % 88);
          const x = 50 + r * Math.cos(a * Math.PI / 180) * 0.55;
          const y = 50 + r * Math.sin(a * Math.PI / 180) * 0.55;
          const s = 5 + (i * 31 % 16);
          const o = 0.1 + (i * 17 % 25) / 100;
          return (
            <svg key={i} className="absolute" style={{ left:`${x}%`, top:`${y}%`, width:s, height:s, opacity:o }} viewBox="0 0 20 20">
              <path d="M10 0 L11.8 8.2 L20 10 L11.8 11.8 L10 20 L8.2 11.8 L0 10 L8.2 8.2 Z" fill="white"/>
            </svg>
          );
        })}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">

        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 sm:mb-8 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] inline-block animate-pulse" />
          Early Access — Join the Waitlist
        </div>

        {/* Arabic */}
        <p className="arabic-text text-white/60 text-xl sm:text-2xl mb-4 animate-fade-in delay-100">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-200 text-[2rem] sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-5 sm:mb-6">
          Live for your deen.{' '}
          <span className="relative inline-block">
            <span className="relative z-10 text-[#C9952A]">Find your peace.</span>
            <span className="absolute bottom-1 left-0 right-0 h-2 sm:h-3 bg-[#1D9E75]/30 rounded-sm -z-0" />
          </span>
        </h1>

        {/* Subheading */}
        <p className="animate-fade-in-up delay-300 text-base sm:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto mb-4">
          Meet the AI companion that holds you accountable like no one else can.
          Track your prayers, break your patterns, and take the steps you've been putting off —
          until full submission to Allah isn't a distant goal, it's your daily reality.
        </p>

        {/* Sadaqah callout */}
        <div className="animate-fade-in-up delay-400 inline-flex items-center gap-2 text-[#E1F5EE] text-sm font-medium mb-8 sm:mb-10">
          <span className="text-lg">🌿</span>
          <span>10% of every subscription goes to sadaqah</span>
        </div>

        {/* Email form */}
        {status === 'success' ? (
          <div className="animate-fade-in-up flex flex-col items-center gap-3 px-2">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/25 text-white px-5 py-4 rounded-2xl w-full max-w-md">
              <CheckCircle2 className="text-[#1D9E75] shrink-0" size={22} />
              <div className="text-left">
                <p className="font-semibold text-sm sm:text-base">You're on the list.</p>
                <p className="text-white/70 text-xs sm:text-sm">We'll be in touch when Path of Sabr launches.</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}
            className="animate-fade-in-up delay-500 flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto px-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-5 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/25 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent transition text-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary flex items-center justify-center gap-2 text-white font-semibold px-6 py-4 rounded-xl shadow-lg disabled:opacity-70 whitespace-nowrap text-sm"
            >
              {status === 'loading' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>Join the Waitlist <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-400 text-xs mt-3">Something went wrong — please try again.</p>
        )}

        <p className="animate-fade-in-up delay-600 text-white/40 text-xs mt-4">
          No spam. Ever. Unsubscribe anytime.
        </p>

        {/* Stats row */}
        <div className="animate-fade-in-up delay-700 mt-8 sm:mt-10 mb-16 grid grid-cols-3 gap-3 sm:gap-6 max-w-xs sm:max-w-lg mx-auto border-t border-white/10 pt-6 sm:pt-8">
          {[
            { value: '5×',  label: 'Daily prayers' },
            { value: '10%', label: 'To sadaqah', gold: true },
            { value: '∞',   label: 'Patience' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-xl sm:text-2xl font-extrabold ${s.gold ? 'text-[#C9952A]' : 'text-[#E1F5EE]'}`}>{s.value}</p>
              <p className="text-[10px] sm:text-xs text-white/70 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shahada marquee */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #C9952A, transparent)' }} />
        <div className="py-2.5 overflow-hidden" style={{ background: 'rgba(201,149,42,0.08)', maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)' }}>
          <div className="flex whitespace-nowrap animate-marquee" style={{ fontFamily: "'Amiri', serif", fontSize: '18px', color: '#C9952A', direction: 'rtl', width: 'max-content' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="mx-6">
                لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ
                <span className="mx-4 opacity-50">✦</span>
              </span>
            ))}
          </div>
        </div>
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #C9952A, transparent)' }} />
      </div>
    </section>
  );
}
