const testimonials = [
  { quote: "I've tried every habit app out there. None of them understood why I felt guilty when I missed Fajr. This does.",           name: 'Fatima A.', location: 'London, UK',     initials: 'FA', highlight: 'felt guilty when I missed Fajr',    gradient: 'linear-gradient(135deg,#1D9E75,#085041)' },
  { quote: "The AI doesn't just remind me to pray — it asks how I'm feeling about my deen. That's the difference.",                   name: 'Omar R.',   location: 'Manchester, UK', initials: 'OR', highlight: "asks how I'm feeling about my deen", gradient: 'linear-gradient(135deg,#C9952A,#7a5a1a)' },
  { quote: "Knowing 10% goes to sadaqah made me feel like my subscription itself is an act of worship. SubhanAllah.",                 name: 'Aisha M.',  location: 'Birmingham, UK', initials: 'AM', highlight: 'an act of worship',                  gradient: 'linear-gradient(135deg,#085041,#1D9E75)' },
];

function Stars({ gold }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={gold ? '#C9952A' : '#1D9E75'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

function hl(quote, word) {
  const parts = quote.split(word);
  if (parts.length < 2) return quote;
  return <>{parts[0]}<mark className="bg-[#C9952A]/20 text-[#C9952A] not-italic font-semibold rounded px-0.5 not-italic">{word}</mark>{parts[1]}</>;
}

export default function SocialProof() {
  return (
    <section className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(160deg, #051a10 0%, #072d1c 100%)' }}>

      {/* Spotlight */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(29,158,117,0.12) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <p className="section-label text-[#C9952A] mb-3">Community</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">You are not alone in this</h2>
          <p className="text-white/45 max-w-md mx-auto text-base">Muslims across the UK are already on the waitlist. Here's what they're saying.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 ${i === 1 ? 'md:-translate-y-3' : ''}`}
              style={{ background: 'linear-gradient(145deg, #0d3320 0%, #0a2318 100%)', border: '1px solid rgba(29,158,117,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            >
              <div className="h-[2px]" style={{ background: i === 1 ? 'linear-gradient(90deg,#C9952A,#1D9E75)' : 'linear-gradient(90deg,#1D9E75,#085041)' }} />

              <div className="p-6 flex flex-col gap-4 flex-1">
                <div className="flex items-center justify-between">
                  <Stars gold={i === 1} />
                  <span className="text-[10px] font-bold text-[#1D9E75] bg-[#1D9E75]/15 px-2 py-0.5 rounded-full">Verified</span>
                </div>

                <p className="text-white/75 text-sm leading-relaxed italic flex-1">"{hl(t.quote, t.highlight)}"</p>

                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: t.gradient }}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-white/35 text-xs">{t.location}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5 text-sm text-white/45">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {['FA','OR','AM','ZK','NR'].map((ini, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-white text-[9px] font-bold" style={{ background: testimonials[i % 3].gradient, borderColor: '#051a10' }}>{ini}</div>
              ))}
            </div>
            <span><strong className="text-white">500+</strong> Muslims on the waitlist</span>
          </div>
          <span className="hidden sm:block text-white/15">|</span>
          <div className="flex items-center gap-1.5"><Stars /><span><strong className="text-white">4.9/5</strong> early access rating</span></div>
          <span className="hidden sm:block text-white/15">|</span>
          <span>🇬🇧 Built in the UK, for Muslims worldwide</span>
        </div>

        {/* CTA strip */}
        <div
          className="mt-12 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: 'linear-gradient(145deg, #0d3320, #0a2318)', border: '1px solid rgba(29,158,117,0.25)', boxShadow: '0 0 60px rgba(29,158,117,0.08)' }}
        >
          <div>
            <p className="text-white font-bold text-xl mb-1">Ready to start your journey?</p>
            <p className="text-white/45 text-sm">Join Muslims across the UK building consistency in their deen.</p>
          </div>
          <a href="#waitlist" className="btn-primary shrink-0 text-white font-semibold px-8 py-3.5 rounded-xl whitespace-nowrap">
            Join the Waitlist →
          </a>
        </div>
      </div>
    </section>
  );
}
