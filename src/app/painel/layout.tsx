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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      // Ignorar erro de rede
    }
    document.cookie = "neon_auth_session=; path=/; max-age=0";
    window.location.href = "/painel/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        aria-label="Navegação principal"
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          <Link href="/painel/dashboard" className="flex items-center gap-2" aria-label="Mavox Admin">
            <img src="/logo.png" alt="Mavox" className="h-8" />
            {!collapsed && <span className="font-bold text-gray-900 text-lg">Mavox Admin</span>}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                } ${collapsed ? "justify-center" : ""}`}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Ver site" : undefined}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">Ver site</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <main className={`flex-1 flex flex-col min-w-0 ${collapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 flex items-center justify-end gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <span>Painel Administrativo</span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/painel/settings"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Configurações"
                >
                  <Settings className="w-5 h-5 text-gray-500" />
                </Link>

                <button
                  onClick={handleSignout}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                  aria-label="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}