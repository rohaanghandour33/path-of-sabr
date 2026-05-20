const STEPS = [
  {
    number: '01',
    emoji: '📋',
    title: 'Tell us about yourself',
    detail: '20 honest questions about your deen, your struggles, and your schedule. Takes 5 minutes and shapes everything your companion does.',
    accent: '#1D9E75',
  },
  {
    number: '02',
    emoji: '🤝',
    title: 'Meet your companion',
    detail: 'An AI grounded in Quran and authenticated Sunnah that knows your journey personally. Guidance built for you, not generic advice.',
    accent: '#C9952A',
  },
  {
    number: '03',
    emoji: '📈',
    title: 'Watch your deen grow',
    detail: 'Tasks assigned around your actual schedule. Prayer streaks. Daily check-ins. One small step at a time until it sticks.',
    accent: '#1D9E75',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #051a10 0%, #062516 100%)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 100%, rgba(29,158,117,0.07) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12 sm:mb-16">
          <p className="section-label text-[#C9952A] mb-3">How It Works</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 tracking-tight">
            Up and running in under 10 minutes
          </h2>
          <p className="text-white/40 max-w-sm mx-auto text-sm">
            No complicated setup. No generic plans. Just a companion that knows you.
          </p>
        </div>

        {/* ── DESKTOP: horizontal 3-col (unchanged) ───────────────────────── */}
        <div className="hidden lg:block relative">
          {/* Connecting line */}
          <div
            className="absolute top-10 left-[16.66%] right-[16.66%] h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, rgba(29,158,117,0.3), rgba(201,149,42,0.3), rgba(29,158,117,0.3))' }}
          />
          <div className="grid grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div
                  className="relative z-10 w-20 h-20 rounded-2xl flex flex-col items-center justify-center mb-5 flex-shrink-0"
                  style={{
                    background: s.accent === '#1D9E75'
                      ? 'linear-gradient(145deg, rgba(29,158,117,0.2), rgba(29,158,117,0.06))'
                      : 'linear-gradient(145deg, rgba(201,149,42,0.2), rgba(201,149,42,0.06))',
                    border: `1px solid ${s.accent === '#1D9E75' ? 'rgba(29,158,117,0.35)' : 'rgba(201,149,42,0.35)'}`,
                  }}
                >
                  <span className="text-2xl mb-0.5">{s.emoji}</span>
                  <span className="text-[10px] font-bold tracking-widest" style={{ color: s.accent }}>{s.number}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── MOBILE: vertical cycle — icon left, text right, arrow between ── */}
        <div className="lg:hidden relative">
          {/* Vertical spine line */}
          <div
            className="absolute left-9 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(180deg, rgba(29,158,117,0.4) 0%, rgba(201,149,42,0.4) 50%, rgba(29,158,117,0.4) 100%)' }}
          />

          <div className="space-y-0">
            {STEPS.map((s, i) => (
              <div key={i} className="relative">

                {/* Step row: icon + text */}
                <div className="flex items-start gap-5">
                  {/* Icon bubble — sits on top of the spine */}
                  <div
                    className="relative z-10 w-[72px] h-[72px] rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                    style={{
                      background: s.accent === '#1D9E75'
                        ? 'linear-gradient(145deg, rgba(29,158,117,0.22), rgba(29,158,117,0.07))'
                        : 'linear-gradient(145deg, rgba(201,149,42,0.22), rgba(201,149,42,0.07))',
                      border: `1px solid ${s.accent === '#1D9E75' ? 'rgba(29,158,117,0.4)' : 'rgba(201,149,42,0.4)'}`,
                      boxShadow: `0 0 20px ${s.accent === '#1D9E75' ? 'rgba(29,158,117,0.12)' : 'rgba(201,149,42,0.12)'}`,
                    }}
                  >
                    <span className="text-2xl mb-0.5">{s.emoji}</span>
                    <span className="text-[10px] font-bold tracking-widest" style={{ color: s.accent }}>{s.number}</span>
                  </div>

                  {/* Text — right side */}
                  <div className="pt-2 flex-1">
                    <h3 className="text-white font-bold text-lg mb-1.5 leading-snug">{s.title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{s.detail}</p>
                  </div>
                </div>

                {/* Arrow between steps */}
                {i < STEPS.length - 1 && (
                  <div className="flex items-center justify-start pl-[27px] py-3">
                    <svg width="18" height="28" viewBox="0 0 18 28" fill="none">
                      {/* Shaft */}
                      <line x1="9" y1="0" x2="9" y2="20" stroke="rgba(29,158,117,0.45)" strokeWidth="1.5" strokeDasharray="3 2" />
                      {/* Arrowhead */}
                      <path d="M2 16L9 26L16 16" stroke="rgba(29,158,117,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

        {/* CTA nudge */}
        <div className="mt-12 sm:mt-16 text-center">
          <a
            href="#waitlist"
            className="btn-primary inline-block text-white font-semibold px-10 py-4 rounded-2xl text-sm"
          >
            Start your journey →
          </a>
          <p className="text-white/25 text-xs mt-3">Free to join the waitlist. No card needed.</p>
        </div>

      </div>
    </section>
  );
}
