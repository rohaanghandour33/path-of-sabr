const struggles = [
  { icon: '🌙', problem: 'Missing Fajr — again',           detail: 'Wake up with the intention, miss it anyway, then carry the guilt all day.',          accent: '#1D9E75' },
  { icon: '📱', problem: 'Phone before prayer',             detail: 'Scrolling before salah has become the default — and it\'s hard to unlearn.',          accent: '#C9952A' },
  { icon: '😔', problem: '"Next Ramadan I\'ll fix it"',     detail: 'The restart cycle that repeats year after year without real change.',                   accent: '#1D9E75' },
  { icon: '🤷', problem: 'Not knowing where to start',     detail: 'Wanting a better deen but overwhelmed by where to actually begin.',                    accent: '#C9952A' },
  { icon: '💭', problem: 'Questions with no one to ask',   detail: 'Real deen questions, no scholar to turn to without feeling judged.',                   accent: '#1D9E75' },
  { icon: '🔁', problem: 'The same sins, over and over',   detail: 'Sincere tawbah, then the same fall. Wondering if real change is even possible.',       accent: '#C9952A' },
];

// ── Desktop mind map geometry ─────────────────────────────────────────────────
// Container: paddingBottom 56% → height = 56% of width
// SVG viewBox: 0 0 1000 560   (matches ratio 1:0.56)
// Hub rectangle (HTML div):  left 37%, top 28%, w 26%, h 44%
//   → SVG coords: x1=370, y1=156.8, x2=630, y2=403.2 → centre (500, 280)
//
// Cards: width 21% ≈ 210px,  height ≈ 110px
// Node CSS positions → SVG boundaries used for line clipping:
//   TL  left 3%  top 4%   → card bottom ≈ y 128     right ≈ x 240
//   TR  left 76% top 4%   → card bottom ≈ y 128     left  ≈ x 760
//   ML  left 0%  top 40%  → card right  ≈ x 210     centre y ≈ 280
//   MR  left 79% top 40%  → card left   ≈ x 790     centre y ≈ 280
//   BL  left 3%  top 76%  → card top    ≈ y 425.6   right ≈ x 240
//   BR  left 76% top 76%  → card top    ≈ y 425.6   left  ≈ x 760
//
// Lines go from hub-edge → card-edge (not hub-centre → card-centre).

const NODE_LAYOUT = [
  { ...struggles[0], css: { left: '3%',  top: '4%'  } },  // TL
  { ...struggles[1], css: { left: '76%', top: '4%'  } },  // TR
  { ...struggles[2], css: { left: '0%',  top: '40%' } },  // ML
  { ...struggles[3], css: { left: '79%', top: '40%' } },  // MR
  { ...struggles[4], css: { left: '3%',  top: '76%' } },  // BL
  { ...struggles[5], css: { left: '76%', top: '76%' } },  // BR
];

// Pre-computed: start = hub rect boundary, end = nearest card edge
const SVG_LINES = [
  { x1: 370, y1: 210, x2: 225, y2: 128, accent: '#1D9E75' },  // TL
  { x1: 630, y1: 210, x2: 775, y2: 128, accent: '#C9952A' },  // TR
  { x1: 370, y1: 280, x2: 212, y2: 280, accent: '#1D9E75' },  // ML
  { x1: 630, y1: 280, x2: 788, y2: 280, accent: '#C9952A' },  // MR
  { x1: 370, y1: 350, x2: 225, y2: 426, accent: '#1D9E75' },  // BL
  { x1: 630, y1: 350, x2: 775, y2: 426, accent: '#C9952A' },  // BR
];

function MindMapDesktop() {
  return (
    <div className="relative w-full select-none" style={{ paddingBottom: '56%' }}>

      {/* SVG — lives behind everything, only draws lines and glow */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 560"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {SVG_LINES.map((l, i) => (
            <linearGradient
              key={i} id={`ll${i}`}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%"   stopColor={l.accent} stopOpacity="0.7" />
              <stop offset="100%" stopColor={l.accent} stopOpacity="0.25" />
            </linearGradient>
          ))}
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#1D9E75" stopOpacity="0.13" />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity="0"   />
          </radialGradient>
        </defs>

        {/* Soft glow centred on hub */}
        <ellipse cx="500" cy="280" rx="200" ry="150" fill="url(#hubGlow)" />

        {/* Solid connector lines — short, hub-edge to card-edge */}
        {SVG_LINES.map((l, i) => (
          <line
            key={i}
            x1={l.x1} y1={l.y1}
            x2={l.x2} y2={l.y2}
            stroke={`url(#ll${i})`}
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}

        {/* Connection dot at the card end of each line */}
        {SVG_LINES.map((l, i) => (
          <circle key={i} cx={l.x2} cy={l.y2} r="4" fill={l.accent} fillOpacity="0.5" />
        ))}
        {/* Small dot at the hub end */}
        {SVG_LINES.map((l, i) => (
          <circle key={i} cx={l.x1} cy={l.y1} r="3" fill={l.accent} fillOpacity="0.6" />
        ))}
      </svg>

      {/* ── Hub node — solid background so nothing bleeds through ── */}
      <div
        className="absolute z-20 flex flex-col items-center justify-center text-center"
        style={{
          left: '37%', top: '28%', width: '26%', height: '44%',
          background: 'linear-gradient(160deg, #0f3d22 0%, #051a10 100%)',
          border: '2px solid rgba(29,158,117,0.45)',
          borderRadius: '28px',
          boxShadow: '0 0 48px rgba(29,158,117,0.12), 0 8px 40px rgba(0,0,0,0.55)',
          padding: '20px 16px',
        }}
      >
        <p
          className="font-bold tracking-[0.2em] uppercase mb-2"
          style={{ fontSize: '9px', color: 'rgba(29,158,117,0.7)', letterSpacing: '0.2em' }}
        >
          Sound familiar?
        </p>
        <p className="font-extrabold text-white leading-snug mb-3" style={{ fontSize: '15px' }}>
          What most Muslims are going through
        </p>
        <div
          className="px-3 py-1 rounded-full font-bold tracking-widest uppercase"
          style={{
            fontSize: '9px',
            background: 'rgba(29,158,117,0.14)',
            border: '1px solid rgba(29,158,117,0.3)',
            color: '#1D9E75',
          }}
        >
          You are not alone
        </div>
      </div>

      {/* ── Struggle node cards ── */}
      {NODE_LAYOUT.map((n, i) => (
        <div
          key={i}
          className="absolute z-10 rounded-2xl flex flex-col gap-2 transition-all duration-300 hover:scale-[1.03] hover:z-30"
          style={{
            ...n.css,
            width: '21%',
            padding: '14px 14px',
            background: n.accent === '#1D9E75'
              ? 'linear-gradient(145deg, rgba(29,158,117,0.12) 0%, #051a10 100%)'
              : 'linear-gradient(145deg, rgba(201,149,42,0.12) 0%, #051a10 100%)',
            border: `1px solid ${n.accent === '#1D9E75' ? 'rgba(29,158,117,0.3)' : 'rgba(201,149,42,0.3)'}`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-start gap-2">
            <span className="text-xl leading-none mt-0.5 flex-shrink-0">{n.icon}</span>
            <p className="text-white font-bold text-sm leading-snug">{n.problem}</p>
          </div>
          <p className="text-white/45 text-xs leading-relaxed">{n.detail}</p>
        </div>
      ))}
    </div>
  );
}

// ── Mobile — alternating branch layout ───────────────────────────────────────
function MindMapMobile() {
  return (
    <div className="relative">
      <div
        className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(29,158,117,0.3) 8%, rgba(29,158,117,0.3) 92%, transparent)' }}
      />

      {/* Hub pill */}
      <div
        className="relative z-10 mx-auto mb-8 w-fit px-5 py-4 text-center"
        style={{
          background: 'linear-gradient(160deg, #0f3d22, #051a10)',
          border: '2px solid rgba(29,158,117,0.4)',
          borderRadius: '20px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: 'rgba(29,158,117,0.65)' }}>
          Sound familiar?
        </p>
        <p className="text-white font-extrabold text-base leading-snug">
          What Muslims are going through
        </p>
      </div>

      {/* Alternating nodes */}
      <div className="space-y-4">
        {struggles.map((s, i) => {
          const isLeft = i % 2 === 0;
          return (
            <div key={i} className={`relative flex ${isLeft ? 'justify-start pr-[50%]' : 'justify-end pl-[50%]'}`}>
              {/* Branch line */}
              <div
                className="absolute top-1/2 left-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  width: '46%',
                  height: '1.5px',
                  [isLeft ? 'right' : 'left']: '0',
                  background: `linear-gradient(${isLeft ? 'to left' : 'to right'}, ${s.accent}60, ${s.accent}10)`,
                }}
              />
              <div
                className="relative z-10 rounded-2xl p-4 w-full"
                style={{
                  background: s.accent === '#1D9E75'
                    ? 'linear-gradient(145deg, rgba(29,158,117,0.12) 0%, #051a10 100%)'
                    : 'linear-gradient(145deg, rgba(201,149,42,0.12) 0%, #051a10 100%)',
                  border: `1px solid ${s.accent === '#1D9E75' ? 'rgba(29,158,117,0.3)' : 'rgba(201,149,42,0.3)'}`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                }}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl mt-0.5 leading-none flex-shrink-0">{s.icon}</span>
                  <div>
                    <p className="text-white font-bold text-sm leading-snug">{s.problem}</p>
                    <p className="text-white/45 text-xs mt-1.5 leading-relaxed">{s.detail}</p>
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
    <section
      className="relative py-16 sm:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #051a10 0%, #072d1c 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(29,158,117,0.1) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Eyebrow + subtitle — shown above mind map on desktop */}
        <div className="text-center mb-8 sm:mb-12">
          <p className="section-label text-[#C9952A] mb-3">Sound Familiar?</p>
          <p className="text-white/40 max-w-md mx-auto text-sm">
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
