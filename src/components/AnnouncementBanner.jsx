export default function AnnouncementBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full bg-[#085041] text-white text-center py-2.5 px-4 text-xs sm:text-sm font-medium tracking-wide border-b border-[#C9952A]/30">
      <span className="mr-2 text-[#C9952A]">✦</span>
      <span className="hidden sm:inline">10% of every subscription goes to charity (sadaqah) — </span>
      <span className="sm:hidden">10% goes to sadaqah — </span>
      <span className="text-[#C9952A] font-semibold">automatically, every month.</span>
      <span className="ml-2 text-[#C9952A]">✦</span>
    </div>
  );
}
