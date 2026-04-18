import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <>
      <header
        className={`fixed top-10 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#062516]/90 backdrop-blur-md shadow-lg border-b border-white/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D9E75] to-[#085041] flex items-center justify-center shadow-md shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z" fill="white" opacity="0.95"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="white"/>
                </svg>
              </div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                Path of Sabr
              </span>
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                  {l.label}
                </a>
              ))}
              <a href="#waitlist"
                className="btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow">
                Join Waitlist
              </a>
            </nav>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen dark menu */}
      <div
        className={`md:hidden fixed inset-0 z-30 flex flex-col items-center justify-center gap-8 transition-all duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(5,26,16,0.97)', backdropFilter: 'blur(16px)' }}
      >
        {navLinks.map((l) => (
          <a key={l.label} href={l.href}
            onClick={() => setMenuOpen(false)}
            className="text-2xl font-bold text-white/80 hover:text-white transition-colors">
            {l.label}
          </a>
        ))}
        <a href="#waitlist"
          onClick={() => setMenuOpen(false)}
          className="btn-primary text-white font-bold px-10 py-4 rounded-2xl text-lg mt-2">
          Join Waitlist
        </a>
        <p className="text-white/25 text-xs mt-6 arabic-text text-xl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
      </div>
    </>
  );
}
