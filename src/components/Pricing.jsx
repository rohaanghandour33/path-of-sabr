import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: null,
    description: 'Start your journey with the essentials — no credit card needed.',
    badge: null,
    features: ['5 daily prayer logs per day', 'Basic mood check-in (once daily)', '3 AI companion messages per week', 'Prayer streak tracking', 'Weekly summary report'],
    cta: 'Join the Waitlist',
    ctaHref: '#waitlist',
    primary: false,
  },
  {
    name: 'Core',
    price: '£7.99',
    period: '/month',
    description: 'The full Path of Sabr experience, with 10% of every payment going to sadaqah.',
    badge: 'Most Popular',
    features: ['Unlimited prayer tracking', 'Unlimited AI Deen Companion', 'Daily mood check-ins & insights', 'Scholar-sourced guidance library', 'FOMO & distraction support tools', 'Streak recovery & gentle nudges', 'Monthly progress report', '10% automatically to sadaqah ✦'],
    cta: 'Join the Waitlist',
    ctaHref: '#waitlist',
    primary: true,
  },
];

function PlanCard({ plan }) {
  return (
    <div
      className="relative rounded-3xl p-8 flex flex-col gap-6 transition-all duration-300 hover:-translate-y-1"
      style={plan.primary ? {
        background: 'linear-gradient(160deg, #0d5c3a 0%, #085041 100%)',
        border: '1px solid rgba(29,158,117,0.5)',
        boxShadow: '0 0 60px rgba(29,158,117,0.2), 0 20px 60px rgba(0,0,0,0.3)',
        scale: '1.03',
      } : {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Top glow line on primary */}
      {plan.primary && <div className="absolute top-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,149,42,0.8), transparent)' }} />}

      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 bg-[#C9952A] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
            <Sparkles size={12} /> {plan.badge}
          </span>
        </div>
      )}

      <div>
        <p className="section-label text-[#C9952A] mb-2">{plan.name}</p>
        <div className="flex items-end gap-1 mb-3">
          <span className="text-5xl font-extrabold tracking-tight text-white">{plan.price ?? 'Free'}</span>
          {plan.period && <span className="text-base mb-2 text-white/60">{plan.period}</span>}
        </div>
        <p className="text-sm leading-relaxed text-white/55">{plan.description}</p>
      </div>

      <a href={plan.ctaHref} className={`text-center font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 ${plan.primary ? 'bg-white text-[#085041] hover:bg-[#E1F5EE] shadow-md' : 'btn-primary text-white'}`}>
        {plan.cta}
      </a>

      <div className="border-t border-white/10" />

      <ul className="flex flex-col gap-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: plan.primary ? 'rgba(201,149,42,0.25)' : 'rgba(29,158,117,0.15)' }}>
              <Check size={11} strokeWidth={3} style={{ color: plan.primary ? '#C9952A' : '#1D9E75' }} />
            </span>
            <span className="text-sm text-white/75">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(160deg, #051a10 0%, #062516 100%)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,149,42,0.1) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-label text-[#C9952A] mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-white/50 max-w-lg mx-auto text-base leading-relaxed">
            Start free and upgrade when you're ready. Every Core subscription gives 10% to sadaqah automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start max-w-3xl mx-auto">
          {plans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-white/30 max-w-md mx-auto">
            ✦ Sadaqah is distributed to verified Islamic charities monthly. You'll receive a full breakdown.
          </p>
        </div>
      </div>
    </section>
  );
}
