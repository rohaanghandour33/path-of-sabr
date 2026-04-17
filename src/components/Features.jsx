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
      className={`animate-fade-in-up ${delay} relative rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl`}
      style={{
        background: 'linear-gradient(145deg, #0d3320 0%, #0a2318 100%)',
        border: `1px solid ${isGold ? 'rgba(201,149,42,0.25)' : 'rgba(29,158,117,0.25)'}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${accent}99, transparent)` }} />

      {/* Icon */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}>
        <Icon size={20} style={{ color: accent }} strokeWidth={1.8} />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2">
        <h3 className="text-white font-bold text-base">{title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{description}</p>
      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)` }} />
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #062516 0%, #051a10 100%)' }}>

      {/* Top spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-80 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 100% at 50% 0%, rgba(201,149,42,0.1) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <p className="section-label text-[#C9952A] mb-3">What's inside</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Everything you need on your deen journey
          </h2>
          <p className="text-white/45 max-w-xl mx-auto text-base leading-relaxed">
            Built for Muslims navigating faith in a modern world — not a generic habit tracker with an Islamic skin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>

        {/* Quranic quote */}
        <div className="mt-14 text-center">
          <div
            className="inline-block rounded-2xl px-8 py-6 max-w-2xl"
            style={{ background: 'linear-gradient(135deg, #0d3320, #0a2318)', border: '1px solid rgba(201,149,42,0.3)', boxShadow: '0 0 40px rgba(201,149,42,0.06)' }}
          >
            <p className="arabic-text text-white/90 text-2xl mb-3">إِنَّ اللَّهَ مَعَ الصَّابِرِينَ</p>
            <p className="text-white/65 text-sm font-medium">"Indeed, Allah is with the patient."</p>
            <p className="text-[#C9952A] text-xs mt-2">— Surah Al-Baqarah 2:153</p>
          </div>
        </div>
      </div>
    </section>
  );
}
