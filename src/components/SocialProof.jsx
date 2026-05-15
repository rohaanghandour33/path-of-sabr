const struggles = [
  { icon: '🌙', problem: 'Missing Fajr — again',         detail: 'Wake up with the intention, miss it anyway, then carry the guilt all day.',        accent: '#1D9E75' },
  { icon: '📱', problem: 'Phone before prayer',           detail: 'Scrolling before salah has become the default and it\'s hard to unlearn.',         accent: '#C9952A' },
  { icon: '😔', problem: '"Next Ramadan I\'ll fix it"',  detail: 'The restart cycle that repeats year after year without real change.',               accent: '#1D9E75' },
  { icon: '🤷', problem: 'Not knowing where to start',   detail: 'Wanting a better deen but overwhelmed by where to actually begin.',                accent: '#C9952A' },
  { icon: '💭', problem: 'Questions with no one to ask', detail: 'Real deen questions, no scholar to turn to without feeling judged.',               accent: '#1D9E75' },
  { icon: '🔁', problem: 'The same sins, over and over', detail: 'Sincere tawbah, then the same fall. Wondering if real change is even possible.',   accent: '#C9952A' },
];

function StruggleCard({ icon, problem, detail, accent }) {
  const isGreen = accent === '#1D9E75';
  return (
    <div
      className="group relative rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: isGreen
          ? 'linear-gradient(145deg, rgba(29,158,117,0.08) 0%, #061c10 100%)'
          : 'linear-gradient(145deg, rgba(201,149,42,0.08) 0%, #061c10 100%)',
        border: `1px solid ${isGreen ? 'rgba(29,158,117,0.2)' : 'rgba(201,149,42,0.2)'}`,
        boxShadow: '0 2px 20px rgba(0,0,0,0.35)',
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-px rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }}
      />

      {/* Emoji */}
      <span className="text-3xl leading-none">{icon}</span>

      {/* Text */}
      <div>
        <p className="text-white font-bold text-base leading-snug mb-1.5">{problem}</p>
        <p className="text-white/45 text-sm leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

export default function SocialProof() {
  return (
    <section
      className="relative py-16 sm:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #051a10 0%, #072d1c 100%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(29,158,117,0.07) 0%, transparent 65%)' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="section-label text-[#C9952A] mb-3">Sound Familiar?</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 tracking-tight">
            What most Muslims are quietly going through
          </h2>
          <p className="text-white/40 max-w-sm mx-auto text-sm leading-relaxed">
            You are not alone. These are the struggles we built Path of Sabr to solve.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {struggles.map((s) => (
            <StruggleCard key={s.problem} {...s} />
          ))}
        </div>

        {/* CTA */}
        <div
          className="mt-10 sm:mt-14 rounded-2xl p-6 sm:p-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ background: 'linear-gradient(145deg, #0d3320, #0a2318)', border: '1px solid rgba(29,158,117,0.2)' }}
        >
          <div>
            <p className="text-white font-bold text-lg sm:text-xl mb-1">Ready to actually change?</p>
            <p className="text-white/45 text-sm">Join Muslims who are done making excuses and ready to build their deen.</p>
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
