import { useState } from 'react';

const CARDS = [
  {
    icon: '🌙',
    pain: '"I set 3 alarms for Fajr. I slept through all of them. Again."',
    solution: 'Path of Sabr tracks every prayer without shame and builds a streak system that actually makes you want to show up tomorrow.',
    accent: '#1D9E75',
  },
  {
    icon: '📱',
    pain: '"I pick up my phone before I even make wudu. Every single morning."',
    solution: 'Daily check-ins help you spot the pattern. Your companion nudges you before the habit kicks in, not after.',
    accent: '#C9952A',
  },
  {
    icon: '😔',
    pain: '"I\'ve been saying I\'ll fix my deen after Ramadan for 4 years now."',
    solution: 'Your companion calls it out every time. Then gives you one thing you can do in the next 10 minutes.',
    accent: '#1D9E75',
  },
  {
    icon: '🤷',
    pain: '"I want to be closer to Allah. I just have no idea where to actually start."',
    solution: '20 questions build a personal plan around your life, your schedule, and exactly where you are right now.',
    accent: '#C9952A',
  },
  {
    icon: '💭',
    pain: '"I have real deen questions but I\'m too embarrassed to ask anyone."',
    solution: 'Ask anything. Your companion is grounded in Quran and authenticated Sunnah and never makes you feel judged.',
    accent: '#1D9E75',
  },
  {
    icon: '🔁',
    pain: '"I make tawbah, feel good for a week, then fall into the exact same thing."',
    solution: 'Real accountability without shame. Your companion walks with you through the cycle and helps you break it for good.',
    accent: '#C9952A',
  },
];

export default function SocialProof() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(null); // 'left' | 'right'
  const [animating, setAnimating] = useState(false);

  const go = (nextIdx, direction) => {
    if (animating) return;
    setDir(direction);
    setAnimating(true);
    setTimeout(() => {
      setIdx(nextIdx);
      setDir(null);
      setAnimating(false);
    }, 260);
  };

  const prev = () => go((idx - 1 + CARDS.length) % CARDS.length, 'left');
  const next = () => go((idx + 1) % CARDS.length, 'right');

  const card = CARDS[idx];

  return (
    <section
      className="relative py-16 sm:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #051a10 0%, #061509 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(29,158,117,0.05) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="section-label text-[#C9952A] mb-3">Sound Familiar?</p>
          <p className="text-white/35 max-w-sm mx-auto text-sm">
            You are not alone. These are the struggles we built Path of Sabr to solve.
          </p>
        </div>

        {/* Flashcard */}
        <div className="relative">

          {/* Card */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #0d3820 0%, #06180e 100%)',
              border: `1px solid ${card.accent === '#1D9E75' ? 'rgba(29,158,117,0.25)' : 'rgba(201,149,42,0.25)'}`,
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              opacity: animating ? 0 : 1,
              transform: animating
                ? `translateX(${dir === 'right' ? '-24px' : '24px'})`
                : 'translateX(0)',
              transition: 'opacity 0.26s ease, transform 0.26s ease',
            }}
          >
            {/* Pain half */}
            <div className="px-8 sm:px-14 pt-10 sm:pt-14 pb-8 sm:pb-10 text-center">
              <span className="text-4xl sm:text-5xl mb-6 block">{card.icon}</span>
              <p
                className="font-bold text-white leading-snug"
                style={{ fontSize: 'clamp(1.15rem, 3vw, 1.65rem)' }}
              >
                {card.pain}
              </p>
            </div>

            {/* Divider */}
            <div className="mx-8 sm:mx-14 h-px" style={{ background: `linear-gradient(90deg, transparent, ${card.accent}40, transparent)` }} />

            {/* Solution half */}
            <div className="px-8 sm:px-14 pt-6 sm:pt-8 pb-10 sm:pb-12 text-center">
              <p
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: card.accent === '#1D9E75' ? 'rgba(29,158,117,0.6)' : 'rgba(201,149,42,0.6)' }}
              >
                How Path of Sabr helps
              </p>
              <p className="text-white/65 leading-relaxed text-sm sm:text-base max-w-lg mx-auto">
                {card.solution}
              </p>
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-7">
          {CARDS.map((c, i) => (
            <button
              key={i}
              onClick={() => go(i, i > idx ? 'right' : 'left')}
              className="rounded-full transition-all duration-300"
              style={{
                width:  i === idx ? 20 : 6,
                height: 6,
                background: i === idx ? card.accent : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>

        {/* Counter */}
        <p className="text-center mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {idx + 1} of {CARDS.length}
        </p>

        {/* Bottom CTA */}
        <div
          className="mt-12 rounded-2xl p-6 sm:p-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          style={{ background: 'linear-gradient(145deg, #0d3320, #0a2318)', border: '1px solid rgba(29,158,117,0.2)' }}
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
