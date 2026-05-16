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

        {/* Steps */}
        <div className="relative">
          {/* Connecting line — desktop only */}
          <div
            className="hidden lg:block absolute top-10 left-[16.66%] right-[16.66%] h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, rgba(29,158,117,0.3), rgba(201,149,42,0.3), rgba(29,158,117,0.3))' }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="relative flex flex-col items-start lg:items-center lg:text-center">

                {/* Number bubble */}
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
