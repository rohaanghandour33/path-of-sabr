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

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <header
      className={`fixed top-10 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#062516]/90 backdrop-blur-md shadow-lg border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            {/* Crescent + star icon */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D9E75] to-[#085041] flex items-center justify-center shadow-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"
                  fill="white"
                  opacity="0.95"
                />
                <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
              </svg>
            </div>
            <span
              className={`font-bold text-lg tracking-tight transition-colors ${
                scrolled ? 'text-[#085041]' : 'text-white'
              }`}
            >
              Path of Sabr
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-white/70 hover:text-white'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {l.label}
              </a>
            ))}
            <a
              href="#waitlist"
              className="btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow"
            >
              Join Waitlist
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X size={22} className={scrolled ? 'text-[#085041]' : 'text-white'} />
            ) : (
              <Menu size={22} className={scrolled ? 'text-[#085041]' : 'text-white'} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-gray-700 font-medium hover:text-[#085041] transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#waitlist"
            onClick={() => setMenuOpen(false)}
            className="btn-primary text-white text-sm font-semibold px-5 py-3 rounded-full text-center shadow"
          >
            Join Waitlist
          </a>
        </div>
      </div>
    </header>
  );
}
