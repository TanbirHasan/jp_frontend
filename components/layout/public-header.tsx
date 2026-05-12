import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-4 border-b border-[#dfe5dc] py-3">
      <Link href="/" className="text-base font-semibold tracking-wide">
        Hirelane
      </Link>
      <nav className="flex items-center gap-2">
        <Link href="/jobs" className="px-3 py-2 text-sm font-semibold">
          Jobs
        </Link>
        <Link href="/login" className="px-3 py-2 text-sm font-semibold">
          Login
        </Link>
        <Link
          href="/register"
          className="bg-[#161719] px-4 py-2 text-sm font-semibold text-white"
        >
          Register
        </Link>
      </nav>
    </header>
  );
}
