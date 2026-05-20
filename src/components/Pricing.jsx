import { useState } from 'react';
import { Check, Sparkles, Lock, ChevronDown, ChevronUp } from 'lucide-react';

const PLANS = [
  {
    name: 'Reflect',
    price: '£0',
    annualPrice: null,
    annualEquiv: null,
    annualSave: null,
    period: null,
    description: 'Free forever. Begin your journey with the essentials, no credit card needed.',
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
    annualPrice: '£59',
    annualEquiv: '£4.92/month equivalent',
    annualSave: 'Save 38%',
    period: '/month',
    description: "The full Path of Sabr experience. 10% of every subscription's profit goes to sadaqah automatically.",
    badge: null,
    features: [
      'Everything in Reflect',
      'AI Deen Companion (15 msgs/day)',
      'Daily mood check-ins & insights',
      'Scholar-sourced guidance library',
      'Streak recovery & gentle nudges',
      'Monthly progress report',
      "10% of profit to sadaqah ✦",
    ],
    primary: false,
    accent: '#1D9E75',
  },
  {
    name: 'Companion',
    price: '£14.99',
    annualPrice: '£119',
    annualEquiv: '£9.92/month equivalent',
    annualSave: 'Save 34%',
    period: '/month',
    description: 'For those who want to go deeper. Unlimited access and richer daily check-ins.',
    badge: 'Most Popular',
    features: [
      'Everything in Thrive',
      'Unlimited AI Deen Companion',
      'No message limits, ever',
      'Deeper daily check-ins',
      'Priority response times',
      "10% of profit to sadaqah ✦",
    ],
    primary: true,
    accent: '#C9952A',
  },
];

// ── Shared pricing UI (used on both mobile and desktop) ───────────────────────
function PricingUI({ annual, compact }) {
  const [selected, setSelected] = useState(2); // default Companion
  const [showAll, setShowAll]   = useState(false);

  const plan = PLANS[selected];
  const showAnnual = annual && plan.annualPrice;

  return (
    <div className={compact ? '' : 'max-w-2xl mx-auto'}>

      {/* ── Plan tab selector ── */}
      <div
        className="flex rounded-2xl p-1 mb-6"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {PLANS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setSelected(i)}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 relative"
            style={selected === i ? {
              background: p.accent === '#C9952A'
                ? 'rgba(201,149,42,0.15)'
                : 'rgba(29,158,117,0.15)',
              color: p.accent,
              border: `1px solid ${p.accent === '#C9952A' ? 'rgba(201,149,42,0.35)' : 'rgba(29,158,117,0.35)'}`,
            } : {
              color: 'rgba(255,255,255,0.3)',
              border: '1px solid transparent',
            }}
          >
            {p.badge && (
              <span
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                style={{ background: '#C9952A', color: '#fff', opacity: selected === i ? 1 : 0.5 }}
              >
                ★ Popular
              </span>
            )}
            {p.name}
          </button>
        ))}
      </div>

      {/* ── Selected plan card ── */}
      <div
        className="relative rounded-3xl overflow-hidden mb-5"
        style={{
          border: plan.primary
            ? '1px solid rgba(201,149,42,0.5)'
            : '1px solid rgba(29,158,117,0.25)',
          boxShadow: plan.primary
            ? '0 0 40px rgba(201,149,42,0.18), 0 20px 60px rgba(0,0,0,0.35)'
            : '0 20px 60px rgba(0,0,0,0.28)',
        }}
      >
        {/* Blurred background */}
        <div
          className="p-7 flex flex-col gap-5"
          style={{
            background: plan.primary
              ? 'linear-gradient(160deg, #0d5c3a 0%, #085041 100%)'
              : 'rgba(255,255,255,0.04)',
            filter: 'blur(6px)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          <div>
            <p className="font-bold text-xl mb-1" style={{ color: plan.accent }}>{plan.name}</p>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-5xl font-extrabold text-white">
                {showAnnual ? plan.annualPrice : plan.price}
              </span>
              {(showAnnual || plan.period) && (
                <span className="text-base text-white/50">
                  {showAnnual ? '/year' : plan.period}
                </span>
              )}
              {showAnnual && plan.annualSave && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,149,42,0.2)', color: '#C9952A' }}>
                  {plan.annualSave}
                </span>
              )}
            </div>
            <p className="text-sm text-white/50 leading-relaxed">{plan.description}</p>
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${plan.accent}20` }}>
                  <Check size={11} strokeWidth={3} style={{ color: plan.accent }} />
                </span>
                <span className="text-sm text-white/70">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lock overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8"
          style={{ background: 'rgba(5,26,16,0.78)' }}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)' }}
          >
            <Lock size={20} style={{ color: '#1D9E75' }} />
          </div>
          <p className="text-white font-bold text-base">Revealed at launch</p>
          <p className="text-white/40 text-sm text-center max-w-xs leading-relaxed">
            Join the waitlist to lock in founding member pricing before it goes up.
          </p>
        </div>
      </div>

      {/* Plan description below card */}
      <p className="text-sm leading-relaxed text-center mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {plan.description}
      </p>

      {/* ── See all plans toggle ── */}
      <button
        onClick={() => setShowAll(!showAll)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 hover:bg-white/5"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        {showAll ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        {showAll ? 'Hide plan details' : 'See all plans and features'}
      </button>

      {/* ── Expanded: all 3 plans ── */}
      {showAll && (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((p) => {
            const sa = annual && p.annualPrice;
            return (
              <div
                key={p.name}
                className="rounded-2xl p-5 cursor-pointer transition-all duration-150 hover:scale-[1.01]"
                onClick={() => { setSelected(PLANS.indexOf(p)); setShowAll(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{
                  background: p.primary
                    ? 'linear-gradient(145deg, rgba(201,149,42,0.09) 0%, rgba(255,255,255,0.02) 100%)'
                    : 'rgba(255,255,255,0.03)',
                  border: p.primary
                    ? '1px solid rgba(201,149,42,0.28)'
                    : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <p className="font-extrabold text-base" style={{ color: p.accent }}>{p.name}</p>
                  {p.badge && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,149,42,0.18)', color: '#C9952A' }}>
                      ★ Popular
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-extrabold text-white">
                    {sa ? p.annualPrice : p.price}
                  </span>
                  {(sa || p.period) && (
                    <span className="text-xs text-white/40">{sa ? '/year' : p.period}</span>
                  )}
                  {sa && p.annualSave && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1" style={{ background: 'rgba(201,149,42,0.15)', color: '#C9952A' }}>
                      {p.annualSave}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {p.description}
                </p>

                <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />

                {/* Features */}
                <ul className="flex flex-col gap-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: `${p.accent}20` }}>
                        <Check size={9} strokeWidth={3} style={{ color: p.accent }} />
                      </span>
                      <span className="text-xs text-white/60 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="relative py-16 sm:py-24 overflow-hidden" style={{ background: 'linear-gradient(160deg, #051a10 0%, #062516 100%)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(29,158,117,0.08) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <p className="section-label text-[#C9952A] mb-3">Pricing</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-white/50 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Pricing is revealed at launch. Join the waitlist now to lock in founding member rates, before they go up.
          </p>

          {/* Monthly / Annual toggle */}
          <div className="inline-flex items-center gap-3 mt-8 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setAnnual(false)}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={!annual
                ? { background: 'rgba(29,158,117,0.18)', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.3)' }
                : { color: 'rgba(255,255,255,0.35)', border: '1px solid transparent' }}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={annual
                ? { background: 'rgba(201,149,42,0.15)', color: '#C9952A', border: '1px solid rgba(201,149,42,0.3)' }
                : { color: 'rgba(255,255,255,0.35)', border: '1px solid transparent' }}
            >
              Annual
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(201,149,42,0.2)', color: '#C9952A' }}>
                Save up to 38%
              </span>
            </button>
          </div>
        </div>

        {/* Shared UI — same on mobile and desktop */}
        <PricingUI annual={annual} />

        {annual && (
          <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Annual plans billed once per year. Cancel anytime before renewal.
          </p>
        )}

        <div className="mt-10 text-center">
          <a href="#waitlist" className="btn-primary text-white font-semibold px-8 py-4 rounded-xl text-sm inline-block">
            Join the Waitlist for Early Access →
          </a>
          <p className="text-xs text-white/30 max-w-md mx-auto mt-4">
            ✦ 10% of every subscription's profit goes to sadaqah automatically.
          </p>
        </div>

      </div>
    </section>
  );
}
