import { Moon, Bot, Heart, BookOpen, Users, Leaf } from 'lucide-react';

const features = [
  { icon: Moon,     title: 'Prayer Tracker',          description: 'Log all five daily prayers with a single tap. Celebrate streaks and gently catch up after a miss — without shame.',                        accent: '#1D9E75', delay: 'delay-100' },
  { icon: Bot,      title: 'AI Deen Companion',        description: 'A conversational AI grounded in Quran and authenticated Sunnah. Ask anything and receive guidance, not judgement.',                          accent: '#C9952A', delay: 'delay-200' },
  { icon: Heart,    title: 'Mood Check-ins',           description: 'Daily emotional check-ins help you spot patterns between your spiritual practice and your mental wellbeing.',                                  accent: '#1D9E75', delay: 'delay-300' },
  { icon: BookOpen, title: 'Scholar-Sourced Guidance', description: 'Every response is rooted in verified scholarly sources. No fatwa-spinning — just sound Islamic knowledge, made accessible.',                  accent: '#C9952A', delay: 'delay-400' },
  { icon: Users,    title: 'FOMO Support',             description: "Gentle nudges, du'a reminders, and accountability tools built for Muslims navigating faith in a world designed to distract.",                accent: '#1D9E75', delay: 'delay-500' },
  { icon: Leaf,     title: '10% Sadaqah',              description: 'Every Core subscription automatically contributes 10% to verified charitable causes. Your growth helps someone else grow too.',               accent: '#C9952A', delay: 'delay-600' },
];

function FeatureCard({ icon: Icon, title, description, accent, delay }) {
  const isGold = accent === '#C9952A';
  return (
    <div
      className={`animate-fade-in-up ${delay} relative rounded-2xl p-5 sm:p-6 flex flex-row sm:flex-col gap-4 sm:gap-5 transition-all duration-300 hover:-translate-y-1`}
      style={{
        background: 'linear-gradient(145deg, #0d3320 0%, #0a2318 100%)',
        border: `1px solid ${isGold ? 'rgba(201,149,42,0.25)' : 'rgba(29,158,117,0.25)'}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top accent line — desktop only */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl hidden sm:block" style={{ background: `linear-gradient(90deg, transparent, ${accent}99, transparent)` }} />

      {/* Icon */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}>
        <Icon size={20} style={{ color: accent }} strokeWidth={1.8} />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <h3 className="text-white font-bold text-sm sm:text-base">{title}</h3>
        <p className="text-white/50 text-xs sm:text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative py-16 sm:py-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #062516 0%, #051a10 100%)' }}>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-80 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 100% at 50% 0%, rgba(201,149,42,0.1) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10 sm:mb-14">
          <p className="section-label text-[#C9952A] mb-3">What's inside</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight">
            Everything you need on your deen journey
          </h2>
          <p className="text-white/45 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Built for Muslims navigating faith in a modern world — not a generic habit tracker with an Islamic skin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>

        {/* Quranic quote */}
        <div className="mt-10 sm:mt-14 text-center px-2">
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
