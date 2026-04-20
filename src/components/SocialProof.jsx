const struggles = [
  {
    icon: '🌙',
    problem: 'Missing Fajr — again',
    detail: 'Most Muslims wake up with the intention to pray Fajr but consistently miss it, then carry guilt for the rest of the day.',
    accent: '#1D9E75',
  },
  {
    icon: '📱',
    problem: 'Phone before prayer',
    detail: 'Scrolling social media the moment you wake up instead of starting the day with dhikr and salah — a habit most struggle to break.',
    accent: '#C9952A',
  },
  {
    icon: '😔',
    problem: '"I\'ll start being consistent next Ramadan"',
    detail: 'The cycle of starting strong, losing momentum, and promising to restart — repeating year after year without real change.',
    accent: '#1D9E75',
  },
  {
    icon: '🤷',
    problem: 'Not knowing where to start',
    detail: 'Wanting to improve your deen but feeling overwhelmed about which habits to build first and how to stay on track.',
    accent: '#C9952A',
  },
  {
    icon: '💭',
    problem: 'Islamic questions with no one to ask',
    detail: 'Having genuine questions about your deen but not having a scholar or knowledgeable person to ask without feeling judged.',
    accent: '#1D9E75',
  },
  {
    icon: '🔁',
    problem: 'The same sins, over and over',
    detail: 'Making tawbah sincerely, then falling back into the same patterns — feeling stuck and wondering if real change is even possible.',
    accent: '#C9952A',
  },
];

export default function SocialProof() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden" style={{ background: 'linear-gradient(160deg, #051a10 0%, #072d1c 100%)' }}>

      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(29,158,117,0.12) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10 sm:mb-14">
          <p className="section-label text-[#C9952A] mb-3">Sound Familiar?</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-3 sm:mb-4">
            What most Muslims are going through
          </h2>
          <p className="text-white/45 max-w-md mx-auto text-sm sm:text-base">
            You are not alone. These are the struggles we built Path of Sabr to solve.
          </p>
        </div>

        {/* Struggle cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {struggles.map((s) => (
            <div
              key={s.problem}
              className="rounded-2xl p-5 sm:p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(145deg, #0d3320 0%, #0a2318 100%)',
                border: `1px solid ${s.accent === '#1D9E75' ? 'rgba(29,158,117,0.2)' : 'rgba(201,149,42,0.2)'}`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <h3 className="text-white font-bold text-sm sm:text-base">{s.problem}</h3>
              </div>
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed">{s.detail}</p>
              <p className="text-xs font-semibold mt-auto" style={{ color: s.accent }}>
                Path of Sabr helps with this →
              </p>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div
          className="mt-10 sm:mt-12 rounded-2xl p-6 sm:p-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
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
