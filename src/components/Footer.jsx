export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    Product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Join Waitlist', href: '#waitlist' },
    ],
    Company: [
      { label: 'About', href: '#' },
      { label: 'Sadaqah Partners', href: '#' },
      { label: 'Blog', href: '#' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  };

  return (
    <footer className="relative bg-[#085041] text-white">
      {/* Wave */}
      <div className="absolute top-0 left-0 right-0 -translate-y-full pointer-events-none">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 40C240 0 480 80 720 40C960 0 1200 80 1440 40V80H0V40Z" fill="#085041"/>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#" className="flex items-center gap-2.5 mb-4">
              <img
                src="/image-1777032189455.png"
                alt="Path of Sabr Logo"
                className="h-10 w-10 rounded-full object-cover shrink-0"
              />
              <span className="font-bold text-lg tracking-tight">Path of Sabr</span>
            </a>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              For the Muslim who is genuinely trying.
            </p>
            <p className="arabic-text text-white/40 text-xl">
              وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ
            </p>
            <p className="text-white/35 text-xs mt-1">
              "And be patient, and your patience is not but through Allah." — 16:127
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-3 sm:mb-4">
                {section}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href}
                      className="text-white/65 text-sm hover:text-white transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/40 text-xs">© {currentYear} Path of Sabr. All rights reserved.</p>
          <p className="text-white/40 text-xs">
            Made with intention.{' '}
            <span className="text-[#C9952A]">10% to sadaqah.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
