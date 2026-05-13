import { Moon, Bot, Heart, BookOpen, Users, Target } from 'lucide-react';

const features = [
  {
    icon: Moon,
    title: 'Prayer Tracker',
    description: 'Log all five prayers with one tap. Build streaks and recover from misses — without shame.',
    accent: '#1D9E75',
    delay: 'delay-100',
  },
  {
    icon: Bot,
    title: 'AI Deen Companion',
    description: 'Conversational AI grounded in Quran and authenticated Sunnah. Guidance, not judgement.',
    accent: '#C9952A',
    delay: 'delay-200',
  },
  {
    icon: Heart,
    title: 'Mood Check-ins',
    description: 'Daily check-ins reveal patterns between your spiritual practice and your mental wellbeing.',
    accent: '#1D9E75',
    delay: 'delay-300',
  },
  {
    icon: BookOpen,
    title: 'Scholar-Sourced Guidance',
    description: 'Every answer is rooted in verified scholarly sources. Sound Islamic knowledge, made accessible.',
    accent: '#C9952A',
    delay: 'delay-400',
  },
  {
    icon: Users,
    title: 'FOMO Support',
    description: "Du'a reminders and accountability tools for Muslims navigating a world built to distract.",
    accent: '#1D9E75',
    delay: 'delay-500',
  },
  {
    icon: Target,
    title: 'Assigned Tasks',
    description: 'Personalised weekly tasks built around your schedule and goals to bring you closer to Allah.',
    accent: '#C9952A',
    delay: 'delay-600',
  },
];

// ── Mobile card (row layout, standard rounded rect) ───────────────────────────
function MobileCard({ icon: Icon, title, description, accent, delay }) {
  const isGold = accent === '#C9952A';
  return (
    <div
      className={`animate-fade-in-up ${delay} relative rounded-2xl p-5 flex flex-row gap-4 transition-all duration-300 hover:-translate-y-1`}
      style={{
        background: 'linear-gradient(145deg, #0d3320 0%, #0a2318 100%)',
        border: `1px solid ${isGold ? 'rgba(201,149,42,0.25)' : 'rgba(29,158,117,0.25)'}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}99, transparent)` }}
      />
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}
      >
        <Icon size={20} style={{ color: accent }} strokeWidth={1.8} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-white font-bold text-sm">{title}</h3>
        <p className="text-white/50 text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ── Desktop ring card (circular) ──────────────────────────────────────────────
function RingCard({ icon: Icon, title, description, accent, delay }) {
  return (
    <div
      className={`animate-fade-in-up ${delay} relative w-full transition-all duration-300 hover:scale-[1.04] hover:z-30`}
      style={{
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        background: 'linear-gradient(145deg, #0d3320 0%, #0a2318 100%)',
        border: `2.5px solid ${accent}`,
        boxShadow: `0 0 0 1px ${accent}15, 0 0 40px ${accent}18, 0 12px 48px rgba(0,0,0,0.6)`,
      }}
    >
      {/* Subtle inner ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: '10px',
          border: `1px solid ${accent}12`,
          borderRadius: '50%',
        }}
      />

      {/* Centred content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-3 flex-shrink-0"
          style={{ background: `${accent}18`, border: `1px solid ${accent}40` }}
        >
          <Icon size={22} style={{ color: accent }} strokeWidth={1.8} />
        </div>
        <h3 className="text-white font-bold text-sm leading-tight mb-2">{title}</h3>
        <p className="text-white/50 text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function Features() {
  return (
    <section
      id="features"
      className="relative py-16 sm:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #062516 0%, #051a10 100%)' }}
    >
      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-80 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 100% at 50% 0%, rgba(201,149,42,0.1) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="section-label text-[#C9952A] mb-3">What's inside</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight">
            Everything you need on your deen journey
          </h2>
          <p className="text-white/45 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Built for Muslims navigating faith in a modern world. Not a generic habit tracker with an Islamic skin.
          </p>
        </div>

        {/* ── Mobile: standard cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:hidden">
          {features.map((f) => <MobileCard key={f.title} {...f} />)}
        </div>

        {/* ── Desktop: Olympic ring layout ────────────────────────────────────── */}
        {/*
          7-column grid. Items span 2 cols each.
          Row 1 at cols 1–2, 3–4, 5–6   (z-index 10)
          Row 2 at cols 2–3, 4–5, 6–7   (z-index 5, offset + slight vertical overlap)
          Result: row 2 circles sit between and behind row 1 circles — chain effect.
        */}
        <div
          className="hidden lg:grid"
          style={{
            gridTemplateColumns: 'repeat(7, 1fr)',
            columnGap: '10px',
          }}
        >
          {/* Row 1 */}
          {features.slice(0, 3).map((f, i) => (
            <div
              key={f.title}
              style={{
                gridColumn: `${1 + i * 2} / span 2`,
                gridRow: 1,
                position: 'relative',
                zIndex: 10,
              }}
            >
              <RingCard {...f} />
            </div>
          ))}

          {/* Row 2 — offset by 1 col, pulled up to interlock */}
          {features.slice(3, 6).map((f, i) => (
            <div
              key={f.title}
              style={{
                gridColumn: `${2 + i * 2} / span 2`,
                gridRow: 2,
                marginTop: '-70px',
                position: 'relative',
                zIndex: 5,
              }}
            >
              <RingCard {...f} />
            </div>
          ))}
        </div>

        {/* Quranic quote */}
        <div className="mt-12 sm:mt-16 text-center px-2">
          <div
            className="inline-block rounded-2xl px-6 sm:px-8 py-5 sm:py-6 max-w-2xl w-full"
            style={{ background: 'linear-gradient(135deg, #0d3320, #0a2318)', border: '1px solid rgba(201,149,42,0.3)' }}
          >
            <p className="arabic-text text-white/90 text-xl sm:text-2xl mb-2 sm:mb-3">إِنَّ اللَّهَ مَعَ الصَّابِرِينَ</p>
            <p className="text-white/65 text-xs sm:text-sm font-medium">"Indeed, Allah is with the patient."</p>
            <p className="text-[#C9952A] text-xs mt-2">— Surah Al-Baqarah 2:153</p>
          </div>
        </div>

      </div>
    </section>
  );
}
