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
  { name: "Configurações", href: "/painel/settings", icon: Settings },
];

export default function AdminLayout({
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

  const wrapperClass = `min-h-screen flex transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`;
  const sidebarClass = `fixed inset-y-0 left-0 z-50 transition-all duration-300 ${collapsed ? "w-16" : "w-64"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`;
  const sidebarBg = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const cardBorder = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100";
  const inputBg = darkMode ? "bg-gray-700" : "bg-white";
  const inputBorder = darkMode ? "border-gray-600" : "border-gray-300";
  const inputText = darkMode ? "text-gray-100" : "text-gray-900";
  const headerBg = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const contentText = darkMode ? "text-gray-100" : "";

  return (
    <div className={wrapperClass}>
      {/* Sidebar */}
      <aside className={`${sidebarBg} ${sidebarClass}`} aria-label="Navegação principal">
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link href="/painel/dashboard" className="flex items-center gap-2" aria-label="Mavox Admin">
            <img src="/logo.png" alt="Mavox" className="h-8" />
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2 rounded-lg ${hoverBg} transition-colors lg:hidden`}
            aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Menu principal">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-600/20 text-blue-400" : `${textSecondary} ${hoverBg}`} ${collapsed ? "justify-center" : ""}`}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-blue-400" : textSecondary}`} aria-hidden="true" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}

          <div className="mt-6 px-3">
            <button
              onClick={toggleDarkMode}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg ${hoverBg} text-sm font-medium transition-colors`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className={textSecondary}>{darkMode ? "Modo Claro" : "Modo Escuro"}</span>
            </button>
          </div>
        </nav>

        <div className={`p-3 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${textSecondary} ${hoverBg} transition-colors ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Ver site" : undefined}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">Ver site</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {/* Main content */}
      <main className={`flex-1 flex flex-col min-w-0 ${collapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        {/* Top bar */}
        <header className={`sticky top-0 z-30 ${headerBg}`}>
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg ${hoverBg} transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className={`w-6 h-6 ${textSecondary}`} />
            </button>

            <div className="flex-1 flex items-center justify-end gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm {textSecondary}">
                <span>Painel Administrativo</span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/painel/settings"
                  className={`p-2 rounded-lg ${hoverBg} transition-colors ${textSecondary}`}
                  aria-label="Configurações"
                >
                  <Settings className={`w-5 h-5 ${textSecondary}`} />
                </Link>

                <button
                  onClick={handleSignout}
                  className={`p-2 rounded-lg ${hoverBg} transition-colors ${textSecondary}`}
                  aria-label="Sair"
                >
                  <LogOut className={`w-5 h-5 ${textSecondary}`} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className={`flex-1 p-4 sm:p-6 lg:p-8 ${contentText}`}>{children}</div>
      </main>
    </div>
  );
}