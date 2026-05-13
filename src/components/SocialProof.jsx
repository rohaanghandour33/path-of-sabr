// ── Journey cycle — 5 milestones arranged around a circular SVG path ──────────
// Desktop: circular layout with SVG arc + positioned cards
// Mobile: vertical timeline

const STEPS = [
  {
    label: 'Day 1',
    title: 'You Show Up',
    detail: 'The decision is made. No perfect plan needed — just one honest step toward Allah.',
    accent: '#1D9E75',
    // Card position as % of container (paddingBottom: 64%)
    pos: { left: '41%', top: '1%' },
    // SVG dot coords (viewBox 1000 × 640)
    dot: [500, 85],
  },
  {
    label: 'Week 1',
    title: 'First Real Wins',
    detail: 'Fajr prayed twice. One dhikr after salah. Small — but you felt something real.',
    accent: '#C9952A',
    pos: { left: '68%', top: '27%' },
    dot: [723, 248],
  },
  {
    label: 'Weeks 2–3',
    title: 'Something Shifts',
    detail: 'You reach for the app before scrolling. Your heart starts to remember what it missed.',
    accent: '#1D9E75',
    pos: { left: '61%', top: '68%' },
    dot: [638, 510],
  },
  {
    label: 'Week 4',
    title: 'You Feel It',
    detail: 'Clarity after salah. Guilt turning into resolve. A quietness you had been missing.',
    accent: '#C9952A',
    pos: { left: '23%', top: '68%' },
    dot: [362, 510],
  },
  {
    label: 'Month 2+',
    title: 'The New You',
    detail: 'You slip — but you come back faster. That is the entire journey, right there.',
    accent: '#1D9E75',
    pos: { left: '16%', top: '27%' },
    dot: [277, 248],
  },
];

// Arrow direction markers — placed at arc midpoints, rotated to tangent angle
// θ is measured from top (12 o'clock), clockwise
// midpoints at θ = 36°, 108°, 180°, 252°, 324°
const CX = 500, CY = 320, R = 235;
const ARROWS = [36, 108, 180, 252, 324].map((theta, i) => {
  const rad = (theta * Math.PI) / 180;
  return {
    x: CX + R * Math.sin(rad),
    y: CY - R * Math.cos(rad),
    rotation: theta, // SVG rotation to align with tangent
    accent: i % 2 === 0 ? '#C9952A' : '#1D9E75',
  };
});

// ── Desktop journey diagram ───────────────────────────────────────────────────
function JourneyDesktop() {
  return (
    <div
      className="relative w-full select-none"
      style={{ paddingBottom: '64%' }} // matches SVG viewBox 1000 × 640
    >
      {/* SVG — circle path, dots, arrows */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 640"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="jCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#1D9E75" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity="0"   />
          </radialGradient>
          <linearGradient id="jCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#1D9E75" stopOpacity="0.5" />
            <stop offset="50%"  stopColor="#C9952A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Soft centre glow */}
        <ellipse cx={CX} cy={CY} rx="280" ry="220" fill="url(#jCenterGlow)" />

        {/* Journey circle — dashed, gradient stroke */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="url(#jCircleGrad)"
          strokeWidth="1.5"
          strokeDasharray="10 6"
        />

        {/* Milestone dots */}
        {STEPS.map((s, i) => (
          <g key={i}>
            <circle cx={s.dot[0]} cy={s.dot[1]} r="14" fill={s.accent} fillOpacity="0.12" />
            <circle cx={s.dot[0]} cy={s.dot[1]} r="6"  fill={s.accent} fillOpacity="0.9"  />
            <circle cx={s.dot[0]} cy={s.dot[1]} r="10" fill="none" stroke={s.accent} strokeWidth="1" strokeOpacity="0.3" />
          </g>
        ))}

        {/* Direction arrows — small triangles at arc midpoints */}
        {ARROWS.map((a, i) => (
          <polygon
            key={i}
            points="-7,-5 7,0 -7,5"
            transform={`translate(${a.x},${a.y}) rotate(${a.rotation})`}
            fill={a.accent}
            fillOpacity="0.55"
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
          boxShadow: '0 0 48px rgba(29,158,117,0.1), 0 8px 40px rgba(0,0,0,0.5)',
          padding: '20px',
        }}
      >
        <p
          className="font-bold tracking-[0.2em] uppercase mb-2"
          style={{ fontSize: '9px', color: 'rgba(29,158,117,0.65)' }}
        >
          The Journey
        </p>
        <p className="font-extrabold text-white leading-snug" style={{ fontSize: '14px' }}>
          What the next few weeks look like
        </p>
        <p className="mt-2 text-white/30" style={{ fontSize: '11px' }}>
          when you actually start
        </p>
      </div>

      {/* Step cards */}
      {STEPS.map((s, i) => (
        <div
          key={i}
          className="absolute z-10 rounded-2xl p-4 transition-all duration-300 hover:scale-[1.04] hover:z-30"
          style={{
            ...s.pos,
            width: '16%',
            background:
              s.accent === '#1D9E75'
                ? 'linear-gradient(145deg, rgba(29,158,117,0.13) 0%, #051a10 100%)'
                : 'linear-gradient(145deg, rgba(201,149,42,0.13) 0%, #051a10 100%)',
            border: `1px solid ${s.accent === '#1D9E75' ? 'rgba(29,158,117,0.35)' : 'rgba(201,149,42,0.35)'}`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.55)',
          }}
        >
          {/* Label badge */}
          <div
            className="inline-block px-2 py-0.5 rounded-full font-bold tracking-wide uppercase mb-2"
            style={{
              fontSize: '9px',
              background: `${s.accent}18`,
              color: s.accent,
              border: `1px solid ${s.accent}35`,
            }}
          >
            {s.label}
          </div>
          <p className="text-white font-bold text-sm leading-snug mb-1.5">{s.title}</p>
          <p className="text-white/45 leading-relaxed" style={{ fontSize: '11px' }}>{s.detail}</p>
        </div>
      ))}
    </div>
  );
}

// ── Mobile: vertical timeline ─────────────────────────────────────────────────
function JourneyMobile() {
  return (
    <div className="relative pl-8">
      {/* Spine line */}
      <div
        className="absolute left-3 top-4 bottom-4 w-px"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(29,158,117,0.45) 6%, rgba(29,158,117,0.45) 94%, transparent)',
        }}
      />

      <div className="space-y-5">
        {STEPS.map((s, i) => (
          <div key={i} className="relative">
            {/* Timeline dot */}
            <div
              className="absolute -left-[21px] top-[18px] w-3 h-3 rounded-full"
              style={{ background: s.accent, boxShadow: `0 0 8px ${s.accent}70` }}
            />

            <div
              className="rounded-2xl p-4"
              style={{
                background:
                  s.accent === '#1D9E75'
                    ? 'linear-gradient(145deg, rgba(29,158,117,0.12) 0%, #051a10 100%)'
                    : 'linear-gradient(145deg, rgba(201,149,42,0.12) 0%, #051a10 100%)',
                border: `1px solid ${s.accent === '#1D9E75' ? 'rgba(29,158,117,0.3)' : 'rgba(201,149,42,0.3)'}`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
              }}
            >
              <div
                className="inline-block px-2 py-0.5 rounded-full font-bold tracking-wide uppercase mb-2"
                style={{
                  fontSize: '9px',
                  background: `${s.accent}18`,
                  color: s.accent,
                  border: `1px solid ${s.accent}35`,
                }}
              >
                {s.label}
              </div>
              <p className="text-white font-bold text-sm mb-1.5">{s.title}</p>
              <p className="text-white/45 text-xs leading-relaxed">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function SocialProof() {
  return (
    <section
      className="relative py-16 sm:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #051a10 0%, #072d1c 100%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(29,158,117,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <p className="section-label text-[#C9952A] mb-3">The Journey</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
            What changes when you actually start
          </h2>
          <p className="text-white/40 max-w-md mx-auto text-sm">
            Most people feel a real shift within two weeks. Here is what that looks like.
          </p>
        </div>

        {/* Desktop circular diagram */}
        <div className="hidden lg:block">
          <JourneyDesktop />
        </div>

        {/* Mobile timeline */}
        <div className="lg:hidden">
          <JourneyMobile />
        </div>

        {/* CTA strip */}
        <div
          className="mt-10 sm:mt-14 rounded-2xl p-6 sm:p-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          style={{
            background: 'linear-gradient(145deg, #0d3320, #0a2318)',
            border: '1px solid rgba(29,158,117,0.25)',
          }}
        >
          <div>
            <p className="text-white font-bold text-lg sm:text-xl mb-1">Ready to actually change?</p>
            <p className="text-white/45 text-sm">
              Join Muslims who are done making excuses and ready to build their deen.
            </p>
          </div>
          <a
            href="#waitlist"
            className="btn-primary text-white font-semibold px-8 py-4 rounded-xl text-center text-sm whitespace-nowrap"
          >
            Join the Waitlist →
          </a>
        </div>

      </div>
    </section>
  );
}
