import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-off flex flex-col">
      {/* Top bar */}
      <header className="border-b-2 border-ink bg-paper px-6 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-brand border-2 border-ink flex items-center justify-center shadow-brut-sm group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all duration-100">
            <span className="font-black text-paper text-xs">NR</span>
          </div>
          <span className="font-black text-base text-ink">NairaRamp</span>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        {children}
      </div>
    </div>
  );
}
