// Pre-compute node positions (6 nodes evenly spaced, starting from top)
// Container is landscape (paddingBottom 62%), so R is intentionally an ellipse —
// wider left/right, tighter top/bottom — which fills the space naturally.
const R = 32;

const NODES = [
  { icon: '🌙', problem: 'Missing Fajr',              color: '#1D9E75', angle: 270 },
  { icon: '📱', problem: 'Phone Before Prayer',        color: '#C9952A', angle: 330 },
  { icon: '🔁', problem: 'The Same Sins',              color: '#1D9E75', angle: 30  },
  { icon: '🤷', problem: 'Not Knowing Where to Start', color: '#C9952A', angle: 90  },
  { icon: '💭', problem: 'No One to Ask',              color: '#1D9E75', angle: 150 },
  { icon: '😔', problem: 'Next Ramadan...',            color: '#C9952A', angle: 210 },
].map(n => ({
  ...n,
  x: 50 + R * Math.cos(n.angle * Math.PI / 180),
  y: 50 + R * Math.sin(n.angle * Math.PI / 180),
}));

// ── Desktop circular mind map ─────────────────────────────────────────────────
function CircleMap() {
  return (
    <div
      className="relative w-full select-none mx-auto"
      style={{ maxWidth: 900, paddingBottom: '62%' }}
    >
      {/* Connector lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="centreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#1D9E75" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft centre glow */}
        <ellipse cx="50" cy="50" rx="22" ry="22" fill="url(#centreGlow)" />

        {/* Lines from hub centre to each node centre — nodes sit on top */}
        {NODES.map((n, i) => (
          <line
            key={i}
            x1="50" y1="50"
            x2={n.x} y2={n.y}
            stroke={n.color}
            strokeWidth="0.4"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Hub */}
      <div
        className="absolute z-20 flex flex-col items-center justify-center text-center rounded-full"
        style={{
          left: '50%', top: '50%',
          width: '24%',
          aspectRatio: '1/1',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(145deg, #0d3820 0%, #040f08 100%)',
          border: '1.5px solid rgba(29,158,117,0.45)',
          boxShadow: '0 0 40px rgba(29,158,117,0.15), 0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        <p className="font-extrabold text-white leading-tight" style={{ fontSize: 'clamp(8px, 1.8vw, 13px)' }}>
          Sound<br />Familiar?
        </p>
        <p className="mt-1 font-semibold" style={{ fontSize: 'clamp(6px, 1.1vw, 9px)', color: 'rgba(29,158,117,0.7)' }}>
          You are not alone
        </p>
      </div>

      {/* Nodes */}
      {NODES.map((n, i) => (
        <div
          key={i}
          className="absolute z-10 rounded-full flex flex-col items-center justify-center text-center transition-transform duration-300 hover:scale-105"
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            width: '21%',
            aspectRatio: '1/1',
            transform: 'translate(-50%, -50%)',
            background: n.color === '#1D9E75'
              ? 'linear-gradient(145deg, rgba(29,158,117,0.22) 0%, rgba(29,158,117,0.08) 100%)'
              : 'linear-gradient(145deg, rgba(201,149,42,0.22) 0%, rgba(201,149,42,0.08) 100%)',
            border: `1.5px solid ${n.color === '#1D9E75' ? 'rgba(29,158,117,0.4)' : 'rgba(201,149,42,0.4)'}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            padding: '8%',
          }}
        >
          <span style={{ fontSize: 'clamp(14px, 2.8vw, 22px)', lineHeight: 1 }}>{n.icon}</span>
          <p
            className="font-bold text-white leading-tight mt-1"
            style={{ fontSize: 'clamp(6px, 1.15vw, 9.5px)' }}
          >
            {n.problem}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Mobile — 2-col grid of circles ───────────────────────────────────────────
function CircleMapMobile() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Hub pill */}
      <div
        className="px-7 py-4 rounded-full text-center"
        style={{
          background: 'linear-gradient(145deg, #0d3820, #040f08)',
          border: '1.5px solid rgba(29,158,117,0.4)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <p className="text-white font-extrabold text-base leading-snug">Sound Familiar?</p>
        <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(29,158,117,0.7)' }}>You are not alone</p>
      </div>

      {/* 2-col grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {NODES.map((n, i) => (
          <div
            key={i}
            className="rounded-full flex flex-col items-center justify-center text-center"
            style={{
              aspectRatio: '1/1',
              background: n.color === '#1D9E75'
                ? 'linear-gradient(145deg, rgba(29,158,117,0.2) 0%, rgba(29,158,117,0.07) 100%)'
                : 'linear-gradient(145deg, rgba(201,149,42,0.2) 0%, rgba(201,149,42,0.07) 100%)',
              border: `1.5px solid ${n.color === '#1D9E75' ? 'rgba(29,158,117,0.38)' : 'rgba(201,149,42,0.38)'}`,
              padding: '12%',
            }}
          >
            <span className="text-2xl leading-none">{n.icon}</span>
            <p className="text-white font-bold text-[11px] leading-tight mt-1.5">{n.problem}</p>
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
      style={{ background: 'linear-gradient(160deg, #051a10 0%, #061509 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(29,158,117,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10 sm:mb-14">
          <p className="section-label text-[#C9952A] mb-3">Sound Familiar?</p>
          <p className="text-white/35 max-w-sm mx-auto text-sm">
            You are not alone. These are the struggles we built Path of Sabr to solve.
          </p>
        </div>

        <div className="hidden lg:block">
          <CircleMap />
        </div>

        <div className="lg:hidden">
          <CircleMapMobile />
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
