const struggles = [
  { icon: '🌙', problem: 'Missing Fajr — again',           detail: 'Wake up with the intention, miss it anyway, then carry the guilt all day.',          accent: '#1D9E75' },
  { icon: '📱', problem: 'Phone before prayer',             detail: 'Scrolling before salah has become the default — and it\'s hard to unlearn.',          accent: '#C9952A' },
  { icon: '😔', problem: '"Next Ramadan I\'ll fix it"',     detail: 'The restart cycle that repeats year after year without real change.',                   accent: '#1D9E75' },
  { icon: '🤷', problem: 'Not knowing where to start',     detail: 'Wanting a better deen but overwhelmed by where to actually begin.',                    accent: '#C9952A' },
  { icon: '💭', problem: 'Questions with no one to ask',   detail: 'Real deen questions, no scholar to turn to without feeling judged.',                   accent: '#1D9E75' },
  { icon: '🔁', problem: 'The same sins, over and over',   detail: 'Sincere tawbah, then the same fall. Wondering if real change is even possible.',       accent: '#C9952A' },
];

// ── Desktop mind map ──────────────────────────────────────────────────────────
// Container: paddingBottom 52% → height ≈ 52% of width
// SVG viewBox: 0 0 1000 520 (matches ratio)
// Cards: ~190px wide × ~88px tall
// Node positions (% of container) and their SVG px centres:
//   TL: left 3%,  top 4%   → SVG centre (125, 64)
//   TR: left 78%, top 4%   → SVG centre (875, 64)
//   ML: left 0%,  top 40%  → SVG centre ( 95, 252)
//   MR: left 81%, top 40%  → SVG centre (905, 252)
//   BL: left 3%,  top 76%  → SVG centre (125, 440)
//   BR: left 78%, top 76%  → SVG centre (875, 440)
//   Centre hub: left 40%,  top 35%  → SVG centre (500, 260)

const NODE_LAYOUT = [
  { ...struggles[0], style: { left: '3%',  top: '4%'  }, svgCx: 125, svgCy:  64 },
  { ...struggles[1], style: { left: '78%', top: '4%'  }, svgCx: 875, svgCy:  64 },
  { ...struggles[2], style: { left: '0%',  top: '40%' }, svgCx:  95, svgCy: 252 },
  { ...struggles[3], style: { left: '81%', top: '40%' }, svgCx: 905, svgCy: 252 },
  { ...struggles[4], style: { left: '3%',  top: '76%' }, svgCx: 125, svgCy: 440 },
  { ...struggles[5], style: { left: '78%', top: '76%' }, svgCx: 875, svgCy: 440 },
];

const CX = 500, CY = 260; // SVG centre of hub

function MindMapDesktop() {
  return (
    <div className="relative w-full" style={{ paddingBottom: '52%' }}>

      {/* SVG connector lines — behind everything */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 520"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {NODE_LAYOUT.map((n, i) => (
            <linearGradient key={i} id={`lg${i}`} x1={CX} y1={CY} x2={n.svgCx} y2={n.svgCy} gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor={n.accent} stopOpacity="0.55" />
              <stop offset="100%" stopColor={n.accent} stopOpacity="0.15" />
            </linearGradient>
          ))}
          {/* Hub glow */}
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#1D9E75" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Hub background glow */}
        <ellipse cx={CX} cy={CY} rx="120" ry="100" fill="url(#hubGlow)" />

        {/* Connector lines */}
        {NODE_LAYOUT.map((n, i) => (
          <line
            key={i}
            x1={CX} y1={CY}
            x2={n.svgCx} y2={n.svgCy}
            stroke={`url(#lg${i})`}
            strokeWidth="1.5"
            strokeDasharray="6 5"
            strokeLinecap="round"
          />
        ))}

        {/* Dot at each node end */}
        {NODE_LAYOUT.map((n, i) => (
          <circle key={i} cx={n.svgCx} cy={n.svgCy} r="4" fill={n.accent} fillOpacity="0.4" />
        ))}

        {/* Hub ring */}
        <ellipse cx={CX} cy={CY} rx="90" ry="75"
          fill="none"
          stroke="rgba(29,158,117,0.2)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
        <ellipse cx={CX} cy={CY} rx="72" ry="58"
          fill="rgba(29,158,117,0.04)"
          stroke="rgba(29,158,117,0.3)"
          strokeWidth="0.8"
        />
      </svg>

      {/* ── Hub (centre node) ── */}
      <div className="absolute flex flex-col items-center justify-center text-center z-10"
        style={{ left: '36%', top: '30%', width: '28%', height: '40%' }}>
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-1.5" style={{ color: 'rgba(29,158,117,0.7)' }}>
          Sound familiar?
        </p>
        <p className="font-extrabold text-white leading-tight text-sm lg:text-base px-1">
          What most Muslims are going through
        </p>
        <div className="mt-2 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase"
          style={{ background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.2)', color: '#1D9E75' }}>
          You are not alone
        </div>
      </div>

      {/* ── Struggle nodes ── */}
      {NODE_LAYOUT.map((n, i) => (
        <div key={i}
          className="absolute z-10 rounded-2xl p-3 flex flex-col gap-1.5 transition-all duration-300 hover:scale-[1.03]"
          style={{
            ...n.style,
            width: '19%',
            background: n.accent === '#1D9E75'
              ? 'linear-gradient(145deg, rgba(29,158,117,0.1) 0%, rgba(10,35,24,0.95) 100%)'
              : 'linear-gradient(145deg, rgba(201,149,42,0.1) 0%, rgba(10,35,24,0.95) 100%)',
            border: `1px solid ${n.accent === '#1D9E75' ? 'rgba(29,158,117,0.25)' : 'rgba(201,149,42,0.25)'}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">{n.icon}</span>
            <p className="text-white font-bold text-xs leading-tight">{n.problem}</p>
          </div>
          <p className="text-white/40 text-[10px] leading-relaxed">{n.detail}</p>
        </div>
      ))}
    </div>
  );
}

// ── Mobile — alternating branch layout ───────────────────────────────────────
function MindMapMobile() {
  return (
    <div className="relative">
      {/* Vertical spine */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(29,158,117,0.25) 10%, rgba(29,158,117,0.25) 90%, transparent)' }} />

      {/* Centre hub pill */}
      <div className="relative z-10 mx-auto mb-8 w-fit px-5 py-3 rounded-2xl text-center"
        style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.25)' }}>
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-0.5" style={{ color: 'rgba(29,158,117,0.7)' }}>Sound familiar?</p>
        <p className="text-white font-extrabold text-sm">What Muslims are going through</p>
      </div>

      {/* Nodes — alternating left / right */}
      <div className="space-y-4">
        {struggles.map((s, i) => {
          const isLeft = i % 2 === 0;
          return (
            <div key={i} className={`relative flex ${isLeft ? 'justify-start pr-[52%]' : 'justify-end pl-[52%]'}`}>
              {/* Branch connector */}
              <div className="absolute top-1/2 left-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  width: '48%',
                  height: '1px',
                  transformOrigin: isLeft ? 'right center' : 'left center',
                  [isLeft ? 'right' : 'left']: '0',
                  background: `linear-gradient(${isLeft ? 'to left' : 'to right'}, ${s.accent}55, ${s.accent}15)`,
                }} />

              {/* Node card */}
              <div className="relative z-10 rounded-2xl p-3.5 w-full"
                style={{
                  background: s.accent === '#1D9E75'
                    ? 'linear-gradient(145deg, rgba(29,158,117,0.1) 0%, rgba(10,35,24,0.98) 100%)'
                    : 'linear-gradient(145deg, rgba(201,149,42,0.1) 0%, rgba(10,35,24,0.98) 100%)',
                  border: `1px solid ${s.accent === '#1D9E75' ? 'rgba(29,158,117,0.25)' : 'rgba(201,149,42,0.25)'}`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg mt-0.5 leading-none">{s.icon}</span>
                  <div>
                    <p className="text-white font-bold text-sm leading-snug">{s.problem}</p>
                    <p className="text-white/45 text-xs mt-1 leading-relaxed">{s.detail}</p>
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

// ── Main section ──────────────────────────────────────────────────────────────
export default function SocialProof() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #051a10 0%, #072d1c 100%)' }}>

      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(29,158,117,0.1) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 40% 30% at 50% 50%, rgba(201,149,42,0.04) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header — desktop only (mobile header is inside the hub) */}
        <div className="hidden lg:block text-center mb-10">
          <p className="section-label text-[#C9952A] mb-3">Sound Familiar?</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-3">
            What most Muslims are going through
          </h2>
          <p className="text-white/40 max-w-md mx-auto text-sm">
            You are not alone. These are the struggles we built Path of Sabr to solve.
          </p>
        </div>

        {/* Section header — mobile only */}
        <div className="lg:hidden text-center mb-8">
          <p className="section-label text-[#C9952A] mb-3">Sound Familiar?</p>
          <h2 className="text-2xl font-extrabold text-white tracking-tight mb-3">
            What most Muslims are going through
          </h2>
          <p className="text-white/40 max-w-sm mx-auto text-sm">
            You are not alone. These are the struggles we built Path of Sabr to solve.
          </p>
        </div>

        {/* Desktop mind map */}
        <div className="hidden lg:block">
          <MindMapDesktop />
        </div>

        {/* Mobile branch layout */}
        <div className="lg:hidden">
          <MindMapMobile />
        </div>

        {/* CTA strip */}
        <div
          className="mt-10 sm:mt-14 rounded-2xl p-6 sm:p-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          style={{ background: 'linear-gradient(145deg, #0d3320, #0a2318)', border: '1px solid rgba(29,158,117,0.25)' }}
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
