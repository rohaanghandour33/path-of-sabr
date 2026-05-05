export default function Sadaqah() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden" style={{ background: 'linear-gradient(160deg, #062516 0%, #051a10 100%)' }}>
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 60% at 50% 50%, rgba(201,149,42,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Label */}
        <p className="section-label text-[#C9952A] mb-4">Sadaqah</p>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-6 tracking-tight leading-snug">
          We give because giving is the point.
        </h2>

        {/* Body */}
        <p className="text-white/55 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-4">
          10% of every subscription's profit goes to sadaqah — automatically, every month.
        </p>
        <p className="text-white/35 text-sm leading-relaxed max-w-xl mx-auto mb-14">
          We believe in giving sustainably. Sadaqah is calculated on profit so this commitment holds at every stage of growth — not just when it is easy, but always.
        </p>

        {/* Hadith card */}
        <div
          className="inline-block rounded-3xl px-8 py-8 sm:px-12 sm:py-10 max-w-lg w-full"
          style={{
            background: 'linear-gradient(160deg, rgba(201,149,42,0.08) 0%, rgba(8,80,65,0.18) 100%)',
            border: '1px solid rgba(201,149,42,0.22)',
            boxShadow: '0 0 40px rgba(201,149,42,0.08)',
          }}
        >
          {/* Arabic decorative line */}
          <div className="flex items-center gap-3 justify-center mb-6">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(201,149,42,0.4))' }} />
            <span style={{ color: 'rgba(201,149,42,0.5)', fontSize: '18px' }}>✦</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(201,149,42,0.4))' }} />
          </div>

          <blockquote
            className="text-lg sm:text-xl font-semibold leading-relaxed mb-5"
            style={{ color: 'rgba(255,255,255,0.88)' }}
          >
            "Charity does not decrease wealth."
          </blockquote>

          <p className="text-sm font-medium" style={{ color: '#C9952A' }}>
            — Sahih Muslim 2588
          </p>

          {/* Bottom decorative line */}
          <div className="flex items-center gap-3 justify-center mt-6">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(201,149,42,0.25))' }} />
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(201,149,42,0.25))' }} />
          </div>
        </div>

      </div>
    </section>
  );
}
