"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Tag,
  Calendar,
  BarChart2,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Moon,
  Sun,
  Search,
  Bell,
  ExternalLink,
  Sliders,
  Rocket,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/painel/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/painel/clients", icon: Users },
  { name: "Orçamentos", href: "/painel/quotes", icon: FileText },
  { name: "Tags", href: "/painel/tags", icon: Tag },
  { name: "Agenda", href: "/painel/appointments", icon: Calendar },
  { name: "Blog", href: "/painel/blog", icon: FileText },
  { name: "Pixels", href: "/painel/pixels", icon: BarChart2 },
  { name: "Follow-ups", href: "/painel/followups", icon: MessageSquare },
  { name: "Onboarding", href: "/painel/onboarding", icon: Rocket },
  { name: "Configurações", href: "/painel/settings", icon: Settings },
];

export default function PainelShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setMobileOpen(false);

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [pathname, darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("mavox-dark-mode", String(next));
      return next;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem("mavox-dark-mode");
    if (saved !== null) {
      setDarkMode(saved === "true");
    }
  }, []);

  const handleSignout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      // Ignorar erro de rede
    }
    document.cookie = "mavox_session=; path=/; max-age=0";
    window.location.href = "/login";
  };

  return (
    <div
      className={`painel-app ${collapsed ? "collapsed" : ""} ${
        mobileOpen ? "open" : ""
      }`}
    >
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="painel-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className="painel-aside" aria-label="Navegação principal">
        {/* Brand */}
        <div className="painel-brand">
          <div className="painel-brand-id">
            <img
              src="/Logo MAVOX Verde Vibrante.png"
              alt="Mavox"
              className="painel-logo-img"
            />
            <small className="painel-brand-txt lbl">Painel administrativo</small>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="painel-tg"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* User Card */}
        <div className="painel-user">
          <img
            src="/alex.jpg"
            alt="Admin Mavox"
            className="painel-avatar"
          />
          <div className="painel-user-info lbl">
            <b>Admin Mavox</b>
            <span>contato@mavox.com.br</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="painel-grp lbl">Menu Principal</div>
        <nav className="painel-nav" role="navigation" aria-label="Menu principal">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`painel-nv ${isActive ? "on" : ""}`}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.name : undefined}
              >
                <Icon className="w-4 h-4 painel-ic flex-shrink-0" aria-hidden="true" />
                <span className="lbl truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="painel-sp" />

        {/* Storage / System Status Widget */}
        <div className="painel-store lbl hide-c">
          <div className="row">
            <span>Status do Sistema</span>
            <span style={{ color: "var(--ok)" }}>100% Online</span>
          </div>
          <div className="painel-seg">
            {Array.from({ length: 24 }).map((_, i) => (
              <i key={i} className={i < 20 ? "f" : ""} />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs" style={{ color: "var(--mu)" }}>
            <span>Capacidade ativa</span>
            <span>v2.4.0</span>
          </div>
        </div>

        {/* Bottom Options */}
        <div className="painel-nav pt-2" style={{ borderTop: "1px solid var(--bd)" }}>
          <button
            onClick={toggleDarkMode}
            className="painel-nv"
            type="button"
            title={darkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 painel-ic flex-shrink-0" />
            ) : (
              <Moon className="w-4 h-4 painel-ic flex-shrink-0" />
            )}
            <span className="lbl">{darkMode ? "Modo Claro" : "Modo Escuro"}</span>
          </button>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="painel-nv"
            title="Ver Site Público"
          >
            <ExternalLink className="w-4 h-4 painel-ic flex-shrink-0" />
            <span className="lbl">Ver Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="painel-main">
        {/* Top Bar */}
        <header className="painel-top">
          <button
            onClick={() => setMobileOpen(true)}
            className="painel-burger"
            aria-label="Abrir menu mobile"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1>
            <span>Mavox</span>
            <span style={{ color: "var(--mu)", fontWeight: 400, fontSize: "14px" }}>
              / {navigation.find((n) => pathname.startsWith(n.href))?.name || "Painel"}
            </span>
          </h1>

          {/* Quick Search */}
          <div className="painel-search">
            <Search className="w-4 h-4" />
            <input type="text" placeholder="Buscar clientes, propostas..." />
          </div>

          {/* Notifications */}
          <button className="painel-ib" aria-label="Notificações" title="Notificações">
            <Bell className="w-4 h-4" />
            <b>3</b>
          </button>

          {/* Settings */}
          <Link
            href="/painel/settings"
            className="painel-ib"
            aria-label="Configurações"
            title="Configurações"
          >
            <Sliders className="w-4 h-4" />
          </Link>

          {/* Sign Out */}
          <button
            onClick={handleSignout}
            className="painel-ib"
            aria-label="Encerrar sessão"
            title="Encerrar sessão"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Page Inner Content */}
        <div className="flex-1 w-full">{children}</div>
      </main>
    </div>
  );
}
