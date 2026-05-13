const STEPS = [
  {
    emoji: '🌱',
    label: 'Day 1',
    title: 'You Show Up',
    detail: 'The decision is made. No perfect plan. Just one honest step toward Allah.',
    accent: '#1D9E75',
    pos: { left: '41%', top: '1%' },
    dot: [500, 85],
  },
  {
    emoji: '⭐',
    label: 'Week 1',
    title: 'First Real Wins',
    detail: 'Fajr prayed twice. One dhikr after salah. Small but real.',
    accent: '#C9952A',
    pos: { left: '68%', top: '27%' },
    dot: [723, 248],
  },
  {
    emoji: '💫',
    label: 'Weeks 2–3',
    title: 'Something Shifts',
    detail: 'You reach for the app before scrolling. Your heart starts to remember.',
    accent: '#1D9E75',
    pos: { left: '61%', top: '68%' },
    dot: [638, 510],
  },
  {
    emoji: '🤲',
    label: 'Week 4',
    title: 'You Feel It',
    detail: 'Clarity after salah. Guilt turning into resolve. A quietness you had been missing.',
    accent: '#C9952A',
    pos: { left: '23%', top: '68%' },
    dot: [362, 510],
  },
  {
    emoji: '🌟',
    label: 'Month 2+',
    title: 'The New You',
    detail: 'You slip. But you come back faster. That is the whole journey right there.',
    accent: '#1D9E75',
    pos: { left: '16%', top: '27%' },
    dot: [277, 248],
  },
];

const CX = 500, CY = 320, R = 235;

const ARROWS = [36, 108, 180, 252, 324].map((theta, i) => {
  const rad = (theta * Math.PI) / 180;
  return {
    x: CX + R * Math.sin(rad),
    y: CY - R * Math.cos(rad),
    rotation: theta,
    accent: i % 2 === 0 ? '#C9952A' : '#1D9E75',
  };
});

// ── Desktop ───────────────────────────────────────────────────────────────────
function JourneyDesktop() {
  return (
    <div className="relative w-full select-none" style={{ paddingBottom: '64%' }}>

      {/* SVG background — circle path + dots + arrows */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 640"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="jGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#1D9E75" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity="0"   />
          </radialGradient>
          <linearGradient id="jArc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#1D9E75" stopOpacity="0.55" />
            <stop offset="50%"  stopColor="#C9952A" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* Centre glow */}
        <ellipse cx={CX} cy={CY} rx="270" ry="210" fill="url(#jGlow)" />

        {/* Dashed circle arc */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="url(#jArc)"
          strokeWidth="1.5"
        />

        {/* Dots at each milestone */}
        {STEPS.map((s, i) => (
          <g key={i}>
            <circle cx={s.dot[0]} cy={s.dot[1]} r="16" fill={s.accent} fillOpacity="0.1" />
            <circle cx={s.dot[0]} cy={s.dot[1]} r="5"  fill={s.accent} fillOpacity="0.95" />
            <circle cx={s.dot[0]} cy={s.dot[1]} r="11" fill="none" stroke={s.accent} strokeWidth="1" strokeOpacity="0.25" />
          </g>
        ))}

        {/* Direction arrows */}
        {ARROWS.map((a, i) => (
          <polygon
            key={i}
            points="-6,-4 6,0 -6,4"
            transform={`translate(${a.x},${a.y}) rotate(${a.rotation})`}
            fill={a.accent}
            fillOpacity="0.6"
          />
        ))}
      </svg>

      {/* Centre hub */}
      <div
        className="absolute z-20 flex flex-col items-center justify-center text-center"
        style={{
          left: '36%', top: '26%', width: '28%', height: '48%',
          background: 'linear-gradient(160deg, #0f3d22 0%, #051a10 100%)',
          border: '1px solid rgba(29,158,117,0.3)',
          borderRadius: '50%',
          boxShadow: '0 0 60px rgba(29,158,117,0.12), 0 8px 40px rgba(0,0,0,0.5)',
          padding: '24px',
        }}
      >
        <div className="text-3xl mb-2">🕌</div>
        <p className="font-bold tracking-[0.2em] uppercase mb-1.5" style={{ fontSize: '9px', color: 'rgba(29,158,117,0.65)' }}>
          Your Journey
        </p>
        <p className="font-extrabold text-white leading-snug" style={{ fontSize: '13px' }}>
          What the next few weeks look like
        </p>
      </div>

      {/* Step cards */}
      {STEPS.map((s, i) => (
        <div
          key={i}
          className="absolute z-10 rounded-2xl transition-all duration-300 hover:scale-[1.05] hover:z-30"
          style={{
            ...s.pos,
            width: '16%',
            padding: '14px',
            background:
              s.accent === '#1D9E75'
                ? 'linear-gradient(145deg, rgba(29,158,117,0.14) 0%, #051a10 100%)'
                : 'linear-gradient(145deg, rgba(201,149,42,0.14) 0%, #051a10 100%)',
            border: `1px solid ${s.accent === '#1D9E75' ? 'rgba(29,158,117,0.4)' : 'rgba(201,149,42,0.4)'}`,
            boxShadow: '0 6px 28px rgba(0,0,0,0.55)',
          }}
        >
          <div className="text-2xl mb-2 leading-none">{s.emoji}</div>
          <div
            className="inline-block px-2 py-0.5 rounded-full font-bold tracking-wide uppercase mb-2"
            style={{ fontSize: '8px', background: `${s.accent}20`, color: s.accent, border: `1px solid ${s.accent}40` }}
          >
            {s.label}
          </div>
          <p className="text-white font-bold leading-snug mb-1" style={{ fontSize: '12px' }}>{s.title}</p>
          <p className="text-white/45 leading-relaxed" style={{ fontSize: '10px' }}>{s.detail}</p>
        </div>
      ))}
    </div>
  );
}

// ── Mobile: vertical timeline ─────────────────────────────────────────────────
function JourneyMobile() {
  return (
    <div className="relative pl-10">
      {/* Spine */}
      <div
        className="absolute left-4 top-5 bottom-5 w-px"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(29,158,117,0.4) 5%, rgba(29,158,117,0.4) 95%, transparent)' }}
      />

      <div className="space-y-4">
        {STEPS.map((s, i) => (
          <div key={i} className="relative flex items-start gap-3">
            {/* Emoji + dot on the spine */}
            <div
              className="absolute -left-[26px] top-4 w-3.5 h-3.5 rounded-full flex-shrink-0"
              style={{ background: s.accent, boxShadow: `0 0 10px ${s.accent}80` }}
            />

            <div
              className="flex-1 rounded-2xl p-4"
              style={{
                background:
                  s.accent === '#1D9E75'
                    ? 'linear-gradient(145deg, rgba(29,158,117,0.12) 0%, #051a10 100%)'
                    : 'linear-gradient(145deg, rgba(201,149,42,0.12) 0%, #051a10 100%)',
                border: `1px solid ${s.accent === '#1D9E75' ? 'rgba(29,158,117,0.3)' : 'rgba(201,149,42,0.3)'}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl leading-none">{s.emoji}</span>
                <div
                  className="px-2 py-0.5 rounded-full font-bold tracking-wide uppercase"
                  style={{ fontSize: '9px', background: `${s.accent}20`, color: s.accent, border: `1px solid ${s.accent}40` }}
                >
                  {s.label}
                </div>
              </div>
              <p className="text-white font-bold text-sm mb-1">{s.title}</p>
              <p className="text-white/45 text-xs leading-relaxed">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function SocialProof() {
  return (
    <section
      className="relative py-16 sm:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #051a10 0%, #072d1c 100%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(29,158,117,0.1) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-8 sm:mb-12">
          <p className="section-label text-[#C9952A] mb-3">✨ The Journey</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
            What changes when you actually start
          </h2>
          <p className="text-white/40 max-w-md mx-auto text-sm">
            Most people feel a real shift within two weeks. Here is what that looks like.
          </p>
        </div>

        <div className="hidden lg:block">
          <JourneyDesktop />
        </div>

        <div className="lg:hidden">
          <JourneyMobile />
        </div>

        {/* CTA */}
        <div
          className="mt-10 sm:mt-14 rounded-2xl p-6 sm:p-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          style={{ background: 'linear-gradient(145deg, #0d3320, #0a2318)', border: '1px solid rgba(29,158,117,0.25)' }}
        >
          <div>
            <p className="text-white font-bold text-lg sm:text-xl mb-1">🚪 Ready to actually change?</p>
            <p className="text-white/45 text-sm">Join Muslims who are done making excuses and ready to build their deen.</p>
          </div>
          <a href="#waitlist" className="btn-primary text-white font-semibold px-8 py-4 rounded-xl text-center text-sm whitespace-nowrap">
            Join the Waitlist →
          </a>
        </div>

      </div>
    </section>
  );
}
