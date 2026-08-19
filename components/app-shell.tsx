"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  FileText,
  PartyPopper,
  CalendarDays,
  Wallet,
  LogOut,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/materiais", label: "Materiais", icon: Layers },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/eventos", label: "Eventos", icon: PartyPopper },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
];

const COLLAPSE_KEY = "sidebar-collapsed";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  // Lê a preferência salva após a hidratação, para evitar mismatch de SSR.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com localStorage, que não existe no servidor
    if (window.localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const navItems = (onNavigate?: () => void) =>
    links.map((link) => {
      const Icon = link.icon;
      const active = pathname.startsWith(link.href);
      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          title={collapsed ? link.label : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
            active ? "bg-[var(--color-accent)] text-[var(--color-bg)]" : "text-sand-700 hover:bg-black/5",
            collapsed && "justify-center px-0"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" strokeWidth={2.75} />
          {!collapsed && link.label}
        </Link>
      );
    });

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col bg-[var(--color-surface)] transition-[width] duration-200 md:flex",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <button
          onClick={toggleCollapsed}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className="absolute -right-3.5 top-8 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-divider)] bg-[var(--color-bg)] text-sand-600 shadow-[var(--shadow-sm)] hover:bg-black/5"
        >
          {collapsed ? (
            <ChevronsRight className="h-3.5 w-3.5" strokeWidth={2.75} />
          ) : (
            <ChevronsLeft className="h-3.5 w-3.5" strokeWidth={2.75} />
          )}
        </button>
        <div className="flex flex-col gap-2 p-5">
          <Image
            src="/images/logo-badge.png"
            alt="Adriana Maia Festas"
            width={collapsed ? 40 : 56}
            height={collapsed ? 40 : 56}
            className="rounded-full"
          />
        </div>
        <nav className="flex-1 space-y-1 p-3">{navItems()}</nav>
        <div className="flex flex-col gap-1 p-3">
          <button
            onClick={handleLogout}
            title={collapsed ? "Sair" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-full px-3.5 py-2 text-sm font-medium text-sand-700 hover:bg-black/5",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={2.75} />
            {!collapsed && "Sair"}
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between bg-[var(--color-surface)] px-4 md:hidden">
        <span className="font-[family-name:var(--font-heading)] font-normal text-base text-[var(--color-accent-700)]">
          Adriana Maia Festas
        </span>
        <button onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
          <Menu className="h-6 w-6 text-sand-700" strokeWidth={2.75} />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col gap-0.5 bg-[var(--color-surface)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <Image src="/images/logo-badge.png" alt="Adriana Maia Festas" width={48} height={48} className="rounded-full" />
              <button onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
                <X className="h-5 w-5 text-sand-700" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">{navItems(() => setMobileOpen(false))}</nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 rounded-full px-3.5 py-2 text-sm font-medium text-sand-700 hover:bg-black/5"
            >
              <LogOut className="h-4 w-4" strokeWidth={2.75} />
              Sair
            </button>
          </div>
        </div>
      )}

      <main
        className={cn(
          "min-w-0 flex-1 p-4 pt-20 transition-[margin] duration-200 md:pt-8",
          collapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        {children}
      </main>
    </div>
  );
}
