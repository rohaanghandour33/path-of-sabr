const struggles = [
  { icon: '🌙', problem: 'Missing Fajr — again',         detail: 'Wake up with the intention, miss it anyway, then carry the guilt all day.',       accent: '#1D9E75' },
  { icon: '📱', problem: 'Phone before prayer',           detail: "Scrolling before salah has become the default and it's hard to unlearn.",         accent: '#C9952A' },
  { icon: '😔', problem: '"Next Ramadan I\'ll fix it"',  detail: 'The restart cycle that repeats year after year without real change.',              accent: '#1D9E75' },
  { icon: '🤷', problem: 'Not knowing where to start',   detail: 'Wanting a better deen but overwhelmed by where to actually begin.',               accent: '#C9952A' },
  { icon: '💭', problem: 'Questions with no one to ask', detail: 'Real deen questions, no scholar to turn to without feeling judged.',              accent: '#1D9E75' },
  { icon: '🔁', problem: 'The same sins, over and over', detail: 'Sincere tawbah, then the same fall. Wondering if real change is even possible.',  accent: '#C9952A' },
];

// ── Geometry ──────────────────────────────────────────────────────────────────
// Container paddingBottom 58% → SVG viewBox 0 0 1000 580
// Hub: left 36% top 24% w 28% h 52%  →  SVG rect (360,139) – (640,420) centre (500,280)
// Cards width 20%, connector lines from hub rect edge → nearest card edge

const NODE_LAYOUT = [
  { ...struggles[0], css: { left: '2%',  top: '3%'  } },  // TL
  { ...struggles[1], css: { left: '78%', top: '3%'  } },  // TR
  { ...struggles[2], css: { left: '0%',  top: '40%' } },  // ML
  { ...struggles[3], css: { left: '80%', top: '40%' } },  // MR
  { ...struggles[4], css: { left: '2%',  top: '76%' } },  // BL
  { ...struggles[5], css: { left: '78%', top: '76%' } },  // BR
];

const SVG_LINES = [
  { x1: 360, y1: 200, x2: 215, y2: 118, accent: '#1D9E75' },  // TL
  { x1: 640, y1: 200, x2: 785, y2: 118, accent: '#C9952A' },  // TR
  { x1: 360, y1: 280, x2: 205, y2: 280, accent: '#1D9E75' },  // ML
  { x1: 640, y1: 280, x2: 805, y2: 280, accent: '#C9952A' },  // MR
  { x1: 360, y1: 360, x2: 215, y2: 442, accent: '#1D9E75' },  // BL
  { x1: 640, y1: 360, x2: 785, y2: 442, accent: '#C9952A' },  // BR
];

// ── Desktop ───────────────────────────────────────────────────────────────────
function MindMapDesktop() {
  return (
    <div className="relative w-full select-none" style={{ paddingBottom: '58%' }}>

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 580"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {SVG_LINES.map((l, i) => (
            <linearGradient key={i} id={`lg${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor={l.accent} stopOpacity="0.5" />
              <stop offset="100%" stopColor={l.accent} stopOpacity="0.12" />
            </linearGradient>
          ))}
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#1D9E75" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity="0"  />
          </radialGradient>
        </defs>

        {/* Centre glow */}
        <ellipse cx="500" cy="280" rx="210" ry="160" fill="url(#hubGlow)" />

        {/* Connector lines */}
        {SVG_LINES.map((l, i) => (
          <line
            key={i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={`url(#lg${i})`}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}

        {/* Card-end dots */}
        {SVG_LINES.map((l, i) => (
          <circle key={i} cx={l.x2} cy={l.y2} r="3.5" fill={l.accent} fillOpacity="0.45" />
        ))}

        {/* Hub-end dots */}
        {SVG_LINES.map((l, i) => (
          <circle key={i} cx={l.x1} cy={l.y1} r="2.5" fill={l.accent} fillOpacity="0.55" />
        ))}
      </svg>

      {/* Hub */}
      <div
        className="absolute z-20 flex flex-col items-center justify-center text-center"
        style={{
          left: '36%', top: '24%', width: '28%', height: '52%',
          background: 'linear-gradient(160deg, #0d3820 0%, #040f08 100%)',
          border: '1px solid rgba(29,158,117,0.35)',
          borderRadius: '32px',
          boxShadow: '0 0 60px rgba(29,158,117,0.1), 0 16px 48px rgba(0,0,0,0.6)',
          padding: '24px 20px',
        }}
      >
        <p className="font-bold tracking-[0.18em] uppercase mb-2.5" style={{ fontSize: '9px', color: 'rgba(29,158,117,0.6)' }}>
          Sound familiar?
        </p>
        <p className="font-extrabold text-white leading-snug mb-4" style={{ fontSize: '15px' }}>
          What most Muslims are quietly going through
        </p>
        <div
          className="px-3 py-1.5 rounded-full font-semibold"
          style={{ fontSize: '10px', background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.25)', color: 'rgba(29,158,117,0.85)' }}
        >
          You are not alone
        </div>
      </div>

      {/* Cards */}
      {NODE_LAYOUT.map((n, i) => (
        <div
          key={i}
          className="absolute z-10 rounded-2xl flex flex-col gap-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:z-30"
          style={{
            ...n.css,
            width: '20%',
            padding: '16px',
            background: n.accent === '#1D9E75'
              ? 'linear-gradient(145deg, rgba(29,158,117,0.09) 0%, #040f08 100%)'
              : 'linear-gradient(145deg, rgba(201,149,42,0.09) 0%, #040f08 100%)',
            border: `1px solid ${n.accent === '#1D9E75' ? 'rgba(29,158,117,0.22)' : 'rgba(201,149,42,0.22)'}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          <span className="text-2xl leading-none">{n.icon}</span>
          <p className="text-white font-bold text-sm leading-snug">{n.problem}</p>
          <p className="text-white/40 text-xs leading-relaxed">{n.detail}</p>
        </div>
      ))}
    </div>
  );
}

// ── Mobile ────────────────────────────────────────────────────────────────────
function MindMapMobile() {
  return (
    <div className="relative">
      {/* Spine */}
      <div
        className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(29,158,117,0.25) 8%, rgba(29,158,117,0.25) 92%, transparent)' }}
      />

      {/* Hub pill */}
      <div
        className="relative z-10 mx-auto mb-6 w-fit px-6 py-4 text-center"
        style={{
          background: 'linear-gradient(160deg, #0d3820, #040f08)',
          border: '1px solid rgba(29,158,117,0.3)',
          borderRadius: '20px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <p className="text-[9px] font-bold tracking-[0.18em] uppercase mb-1" style={{ color: 'rgba(29,158,117,0.6)' }}>
          Sound familiar?
        </p>
        <p className="text-white font-extrabold text-base leading-snug">
          What Muslims are going through
        </p>
      </div>

      {/* Alternating cards */}
      <div className="space-y-3">
        {struggles.map((s, i) => {
          const isLeft = i % 2 === 0;
          return (
            <div key={i} className={`relative flex ${isLeft ? 'justify-start pr-[48%]' : 'justify-end pl-[48%]'}`}>
              {/* Branch line */}
              <div
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  width: '44%',
                  height: '1px',
                  left: isLeft ? '50%' : undefined,
                  right: isLeft ? undefined : '50%',
                  background: `linear-gradient(${isLeft ? 'to left' : 'to right'}, ${s.accent}50, transparent)`,
                }}
              />
              <div
                className="relative z-10 rounded-2xl p-4 w-full"
                style={{
                  background: s.accent === '#1D9E75'
                    ? 'linear-gradient(145deg, rgba(29,158,117,0.09) 0%, #040f08 100%)'
                    : 'linear-gradient(145deg, rgba(201,149,42,0.09) 0%, #040f08 100%)',
                  border: `1px solid ${s.accent === '#1D9E75' ? 'rgba(29,158,117,0.22)' : 'rgba(201,149,42,0.22)'}`,
                }}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl mt-0.5 leading-none flex-shrink-0">{s.icon}</span>
                  <div>
                    <p className="text-white font-bold text-sm leading-snug">{s.problem}</p>
                    <p className="text-white/40 text-xs mt-1.5 leading-relaxed">{s.detail}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function SocialProof() {
  return (
    <section
      className="relative py-16 sm:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #051a10 0%, #061509 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(29,158,117,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-8 sm:mb-12">
          <p className="section-label text-[#C9952A] mb-3">Sound Familiar?</p>
          <p className="text-white/35 max-w-sm mx-auto text-sm">
            You are not alone. These are the struggles we built Path of Sabr to solve.
          </p>
        </div>

        <div className="hidden lg:block">
          <MindMapDesktop />
        </div>

        <div className="lg:hidden">
          <MindMapMobile />
        </div>

        <div
          className="mt-10 sm:mt-14 rounded-2xl p-6 sm:p-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          style={{ background: 'linear-gradient(145deg, #0d3320, #0a2318)', border: '1px solid rgba(29,158,117,0.2)' }}
        >
          <div>
            <p className="text-white font-bold text-lg sm:text-xl mb-1">Ready to actually change?</p>
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
