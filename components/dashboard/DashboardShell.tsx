"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import clsx from "clsx";
import { ReactNode } from "react";
import { Monogram } from "@/components/brand/Wordmark";

export interface NavItem {
  href: string;
  label: string;
}

// A nav item is only "active" if it's the single most specific match for the
// current path — not just any prefix match. Without this, a root item like
// "/participant" would match every sub-page too (e.g. "/participant/modules"
// starts with "/participant/"), so it and the real active item would both
// light up at once.
function getActiveHref(pathname: string, navItems: NavItem[]): string | null {
  let best: string | null = null;
  for (const item of navItems) {
    const isMatch = pathname === item.href || pathname.startsWith(item.href + "/");
    if (isMatch && (best === null || item.href.length > best.length)) {
      best = item.href;
    }
  }
  return best;
}

export function DashboardShell({
  navItems,
  roleLabel,
  children,
}: {
  navItems: NavItem[];
  roleLabel: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const activeHref = getActiveHref(pathname, navItems);

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-white/10 shrink-0">
        <div className="px-5 py-6 flex items-center gap-2 border-b border-white/10">
          <Monogram className="w-9 h-9 text-sm" />
          <div>
            <p className="font-display font-bold text-sm leading-none">PLAY TO PROGRESS</p>
            <p className="text-[10px] uppercase tracking-wider text-gold mt-1">{roleLabel}</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "block px-3 py-2 rounded-sm text-sm transition",
                  active ? "bg-gold/10 text-gold border-l-2 border-gold" : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-xs text-white/40 truncate">{session?.user?.name}</p>
          <Link href="/account" className="text-xs text-white/40 hover:text-gold mt-1 block">
            Change password
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs text-white/40 hover:text-gold mt-1 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-black border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monogram className="w-8 h-8 text-xs" />
          <p className="font-display font-bold text-xs">{roleLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-xs text-white/50">
            Password
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-xs text-white/50 cursor-pointer">
            Sign out
          </button>
        </div>
      </div>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-black border-t border-white/10 flex overflow-x-auto">
        {navItems.map((item) => {
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex-1 text-center text-[11px] py-3 whitespace-nowrap px-3",
                active ? "text-gold" : "text-white/50"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="flex-1 px-5 md:px-10 py-8 md:py-10 pt-20 md:pt-10 pb-24 md:pb-10 max-w-7xl">
        {children}
      </main>
    </div>
  );
}