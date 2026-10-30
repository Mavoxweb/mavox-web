"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Image,
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

type Tab = "perfil" | "senha" | "preferencias";

export default function UsuarioPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("perfil");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Perfil form
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  // Senha form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Preferencias
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/painel/user", { credentials: "include" });
      const data = await res.json();
      if (data.ok && data.user) {
        setUser(data.user);
        setName(data.user.name);
        if (data.user.avatar_url) {
          setAvatarPreview(data.user.avatar_url);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // Carregar preferência de tema
    const saved = localStorage.getItem("mavox-dark-mode");
    if (saved !== null) {
      setDarkMode(saved === "true");
    }
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Arquivo deve ser uma imagem");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Imagem deve ter no máximo 2MB");
        return;
      }
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Nome é obrigatório");
      return;
    }
    setSaving(true);
    setNameError("");

    try {
      const body: { name: string; avatar_url?: string } = { name: name.trim() };
      if (avatarFile) {
        // Upload do avatar
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadRes = await fetch("/api/painel/blog/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          body.avatar_url = uploadData.url;
        } else {
          throw new Error(uploadData.error || "Falha no upload da imagem");
        }
      } else if (avatarPreview === null && user?.avatar_url) {
        // Manter avatar atual se não mudou
        body.avatar_url = user.avatar_url;
      }

      const res = await fetch("/api/painel/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao salvar perfil");

      toast.success("Perfil atualizado com sucesso");
      router.refresh();
    } catch (err: any) {
      setNameError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Senha atual é obrigatória");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError("Nova senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/painel/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao alterar senha");

      toast.success("Senha alterada com sucesso");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem("mavox-dark-mode", String(checked));
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--p)" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--bad)" }} />
        <h2 className="text-xl font-semibold" style={{ color: "var(--tx)" }}>Não autenticado</h2>
        <Link href="/login" className="mt-4 inline-block" style={{ color: "var(--p)" }}>Fazer login</Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "perfil", label: "Perfil", icon: <User className="w-4 h-4" /> },
    { id: "senha", label: "Senha", icon: <Lock className="w-4 h-4" /> },
    { id: "preferencias", label: "Preferências", icon: <Image className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--tx)" }}>Minha Conta</h1>
        <p className="text-sm mt-1" style={{ color: "var(--mu)" }}>Gerencie seu perfil, senha e preferências</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-[#1e293b] rounded-xl border p-1" style={{ borderColor: "var(--bd)" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-white dark:bg-[#334155] shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
            style={{ color: tab === t.id ? "var(--tx)" : "var(--mu)" }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl border p-6" style={{ borderColor: "var(--bd)" }}>
        {tab === "perfil" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2"
                    style={{ borderColor: "var(--bd)" }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800" style={{ borderColor: "var(--bd)" }}>
                    <User className="w-10 h-10" style={{ color: "var(--mu)" }} />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg cursor-pointer border" style={{ borderColor: "var(--bd)" }} title="Alterar foto">
                  <Camera className="w-4 h-4" style={{ color: "var(--tx)" }} />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--tx)" }}>Nome completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(""); }}
                  placeholder="Seu nome"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  style={{ borderColor: nameError ? "var(--bad)" : "var(--bd)", background: "var(--side)" }}
                />
                {nameError && <p className="text-sm mt-1" style={{ color: "var(--bad)" }}>{nameError}</p>}
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--tx)" }}>E-mail</label>
              <div className="flex items-center gap-3 px-4 py-2.5 border rounded-lg" style={{ borderColor: "var(--bd)", background: "var(--side)" }}>
                <Mail className="w-5 h-5" style={{ color: "var(--mu)" }} />
                <span style={{ color: "var(--tx)" }}>{user.email}</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800" style={{ color: "var(--mu)" }}>Não alterável</span>
              </div>
            </div>

            {/* Info */}
            <div className="pt-4 border-t" style={{ borderColor: "var(--bd)" }}>
              <p className="text-sm" style={{ color: "var(--mu)" }}>
                Conta criada em {new Date(user.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--bd)" }}>
              <Link href="/painel/dashboard" className="px-4 py-2.5 border rounded-lg font-medium transition-colors" style={{ borderColor: "var(--bd)", color: "var(--tx)" }}>
                Voltar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 font-medium"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        )}

        {tab === "senha" && (
          <form onSubmit={handleSavePassword} className="space-y-5 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--tx)" }}>Senha Atual *</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(""); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12"
                  style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--tx)" }}>Nova Senha *</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); }}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12"
                  style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--tx)" }}>Confirmar Nova Senha *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }}
                  placeholder="Repita a nova senha"
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12"
                  style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="text-sm p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border" style={{ borderColor: "var(--bad)", color: "var(--bad)" }}>
                <AlertCircle className="w-4 h-4 inline mr-1" /> {passwordError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--bd)" }}>
              <Link href="/painel/dashboard" className="px-4 py-2.5 border rounded-lg font-medium transition-colors" style={{ borderColor: "var(--bd)", color: "var(--tx)" }}>
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 font-medium"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Alterando..." : "Alterar Senha"}
              </button>
            </div>
          </form>
        )}

        {tab === "preferencias" && (
          <div className="space-y-6 max-w-md">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--mu)" }}>Aparência</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: "var(--bd)", background: "var(--side)" }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Image className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: "var(--tx)" }}>Modo Escuro</p>
                    <p className="text-xs" style={{ color: "var(--mu)" }}>Alterna entre tema claro e escuro</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => handleDarkModeChange(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--bd)" }}>
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--mu)" }}>Notificações</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: "var(--bd)", background: "var(--side)" }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: "var(--tx)" }}>Notificações do Sistema</p>
                    <p className="text-xs" style={{ color: "var(--mu)" }}>Receber alertas de novos leads, propostas e tarefas</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--bd)" }}>
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--mu)" }}>Zona de Perigo</h3>
              <div className="p-4 border rounded-lg" style={{ borderColor: "var(--bd)", background: "rgba(239, 68, 68, 0.05)" }}>
                <p className="text-sm" style={{ color: "var(--tx)" }}>
                  Ações irreversíveis. Use com cuidado.
                </p>
                <div className="mt-3 flex gap-2">
                  <button className="px-4 py-2 border rounded-lg text-sm font-medium transition-colors" style={{ borderColor: "var(--bad)", color: "var(--bad)" }}>
                    Excluir Conta
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}