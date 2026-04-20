import { Check, Sparkles, Lock } from 'lucide-react';

const plans = [
  {
    name: 'Reflect',
    price: '£0',
    period: null,
    description: 'Free forever. Begin your journey with the essentials — no credit card needed.',
    badge: null,
    features: [
      'Basic prayer tracker',
      'Daily Quran verse & hadith',
      'Prayer streak tracking',
      'No AI companion',
    ],
    primary: false,
    accent: '#1D9E75',
  },
  {
    name: 'Thrive',
    price: '£7.99',
    period: '/month',
    description: 'The full Path of Sabr experience. 10% of every subscription goes to sadaqah automatically.',
    badge: null,
    features: [
      'Everything in Reflect',
      'AI Deen Companion (15 msgs/day)',
      'Daily mood check-ins & insights',
      'Scholar-sourced guidance library',
      'Streak recovery & gentle nudges',
      'Monthly progress report',
      '10% automatically to sadaqah ✦',
    ],
    primary: false,
    accent: '#1D9E75',
  },
  {
    name: 'Companion Mode',
    price: '£14.99',
    period: '/month',
    description: 'For those who want to go deeper. Unlimited access and richer daily check-ins.',
    badge: 'Most Popular',
    features: [
      'Everything in Thrive',
      'Unlimited AI Deen Companion',
      'No message limits — ever',
      'Deeper daily check-ins',
      'Priority response times',
      '10% automatically to sadaqah ✦',
    ],
    primary: true,
    accent: '#C9952A',
  },
];

function PlanCard({ plan }) {
  return (
    <div
      className={`relative rounded-3xl overflow-hidden ${plan.primary ? 'sm:scale-[1.04]' : ''}`}
      style={plan.primary ? {
        border: '1px solid rgba(201,149,42,0.7)',
        boxShadow: '0 0 0 1px rgba(201,149,42,0.15), 0 0 40px rgba(201,149,42,0.2), 0 20px 60px rgba(0,0,0,0.35)',
      } : {
        border: '1px solid rgba(59,130,246,0.6)',
        boxShadow: '0 0 0 1px rgba(59,130,246,0.1), 0 0 30px rgba(59,130,246,0.15), 0 20px 40px rgba(0,0,0,0.3)',
      }}
    >
      {/* Blurred card content */}
      <div
        className="p-7 sm:p-8 flex flex-col gap-5 sm:gap-6"
        style={plan.primary ? {
          background: 'linear-gradient(160deg, #0d5c3a 0%, #085041 100%)',
          filter: 'blur(8px)',
          userSelect: 'none',
          pointerEvents: 'none',
        } : {
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          filter: 'blur(8px)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {plan.primary && (
          <div className="absolute top-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,149,42,0.9), transparent)' }} />
        )}

        {plan.badge && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1.5 text-white text-xs font-bold px-4 py-1.5 rounded-full" style={{ background: '#C9952A' }}>
              <Sparkles size={12} /> {plan.badge}
            </span>
          </div>
        )}

        <div>
          <p className="section-label mb-2" style={{ color: plan.accent }}>{plan.name}</p>
          <div className="flex items-end gap-1 mb-2 sm:mb-3">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">{plan.price}</span>
            {plan.period && <span className="text-base mb-1 sm:mb-2 text-white/60">{plan.period}</span>}
          </div>
          <p className="text-sm leading-relaxed text-white/55">{plan.description}</p>
        </div>

        <div className="text-center font-semibold text-sm py-4 rounded-xl text-white/50 border border-white/10">
          Join the Waitlist
        </div>

        <div className="border-t border-white/10" />

        <ul className="flex flex-col gap-3">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${plan.accent}18` }}>
                <Check size={11} strokeWidth={3} style={{ color: plan.accent }} />
              </span>
              <span className="text-sm text-white/75">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: 'rgba(5,26,16,0.75)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)' }}>
          <Lock size={18} style={{ color: '#1D9E75' }} />
        </div>
        <p className="text-white font-bold text-sm">Revealed at launch</p>
        <p className="text-white/40 text-xs text-center px-6">Join the waitlist to get early access & founding member pricing</p>
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-16 sm:py-24 overflow-hidden" style={{ background: 'linear-gradient(160deg, #051a10 0%, #062516 100%)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(29,158,117,0.08) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <p className="section-label text-[#C9952A] mb-3">Pricing</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-white/50 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Pricing is revealed at launch. Join the waitlist now to lock in founding member rates — before they go up.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-5 items-center">
          {plans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}
        </div>

        <div className="mt-10 sm:mt-12 text-center">
          <a href="#waitlist" className="btn-primary text-white font-semibold px-8 py-4 rounded-xl text-sm inline-block">
            Join the Waitlist for Early Access →
          </a>
          <p className="text-xs text-white/30 max-w-md mx-auto mt-4">
            ✦ Every paid plan gives 10% to sadaqah automatically.
          </p>
        </div>
      </div>
    </section>
  );
}
