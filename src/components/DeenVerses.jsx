const items = [
  {
    type: 'quran',
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    text: 'Verily, in the remembrance of Allah do hearts find rest.',
    source: "Surah Ar-Ra'd, 13:28",
  },
  {
    type: 'hadith',
    arabic: null,
    text: 'The most beloved deeds to Allah are those done consistently, even if they are small.',
    source: 'Sahih al-Bukhari & Muslim',
  },
  {
    type: 'quran',
    arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا ادْخُلُوا فِي السِّلْمِ كَافَّةً',
    text: 'O you who believe, enter into Islam completely — do not follow the footsteps of Shaytan.',
    source: 'Surah Al-Baqarah, 2:208',
  },
  {
    type: 'hadith',
    arabic: null,
    text: 'Allah does not look at your appearance or wealth, but He looks at your hearts and your deeds.',
    source: 'Sahih Muslim',
  },
  {
    type: 'quran',
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    text: 'For indeed, with hardship will be ease.',
    source: 'Surah Ash-Sharh, 94:5',
  },
  {
    type: 'hadith',
    arabic: null,
    text: 'Whoever treads a path seeking knowledge, Allah will make easy for him a path to Paradise.',
    source: 'Sahih Muslim',
  },
];

export default function DeenVerses() {
  return (
    <section className="relative py-24 px-4 overflow-hidden" style={{ background: 'linear-gradient(160deg, #051a10 0%, #072d1c 50%, #062516 100%)' }}>

      {/* Radial green spotlight */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(29,158,117,0.18) 0%, transparent 70%)' }} />

      {/* Gold accent glow bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-40 pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(201,149,42,0.12) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="section-label text-[#C9952A] mb-3">Words of Guidance</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Why your deen matters more than anything
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto text-base">
            From the Quran and the Prophet ﷺ — reminders that have guided believers for over 1,400 years.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl p-7 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${item.type === 'quran' ? 'rgba(29,158,117,0.35)' : 'rgba(201,149,42,0.35)'}`,
                backdropFilter: 'blur(12px)',
                boxShadow: item.type === 'quran' ? '0 0 24px rgba(29,158,117,0.08) inset' : '0 0 24px rgba(201,149,42,0.08) inset',
              }}
            >
              <span className={`self-start text-xs font-bold px-3 py-1 rounded-full ${item.type === 'quran' ? 'bg-[#1D9E75]/20 text-[#1D9E75]' : 'bg-[#C9952A]/20 text-[#C9952A]'}`}>
                {item.type === 'quran' ? 'Quran' : 'Hadith'}
              </span>

              {item.arabic && (
                <p className="text-right text-xl leading-loose text-white/80 font-medium" style={{ fontFamily: "'Amiri', serif" }} dir="rtl">
                  {item.arabic}
                </p>
              )}

              <p className="text-white/70 text-base leading-relaxed italic">"{item.text}"</p>

              <p className={`text-sm font-semibold mt-auto ${item.type === 'quran' ? 'text-[#1D9E75]' : 'text-[#C9952A]'}`}>
                — {item.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
