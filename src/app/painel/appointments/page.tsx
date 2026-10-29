"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Calendar, Clock, ExternalLink, Trash2, Edit } from "lucide-react";

interface Appointment {
  id: string;
  client_id: string | null;
  title: string;
  clientName: string | null;
  clientEmail: string | null;
  starts_at: string;
  ends_at: string;
  meet_link: string | null;
}

interface ClientOption {
  id: string;
  name: string;
  company: string | null;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [clientId, setClientId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    startsAt: "",
    endsAt: "",
    meetLink: "",
  });
  const [error, setError] = useState("");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (search) params.set("search", search);
      if (clientId) params.set("clientId", clientId);

      const res = await fetch(`/api/painel/appointments?${params.toString()}`);
      const data = await res.json();
      setAppointments(data.data || []);
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
    } finally {
      setLoading(false);
    }
  }, [search, clientId]);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/painel/clients?limit=100");
      const data = await res.json();
      setClients(data.data || []);
    } catch (err) {
      console.error("Erro ao buscar clientes para select:", err);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchClients();
  }, [fetchAppointments, fetchClients]);

  const handleOpenModal = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        clientId: appointment.client_id || "",
        title: appointment.title,
        startsAt: appointment.starts_at ? new Date(appointment.starts_at).toISOString().slice(0, 16) : "",
        endsAt: appointment.ends_at ? new Date(appointment.ends_at).toISOString().slice(0, 16) : "",
        meetLink: appointment.meet_link || "",
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        clientId: "",
        title: "",
        startsAt: "",
        endsAt: "",
        meetLink: "",
      });
    }
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAppointment(null);
    setFormData({ clientId: "", title: "", startsAt: "", endsAt: "", meetLink: "" });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const url = editingAppointment
        ? `/api/painel/appointments/${editingAppointment.id}`
        : "/api/painel/appointments";
      const method = editingAppointment ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao salvar agendamento");
        return;
      }

      handleCloseModal();
      fetchAppointments();
    } catch (err) {
      setError("Erro ao salvar agendamento");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;
    try {
      const res = await fetch(`/api/painel/appointments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      fetchAppointments();
    } catch (err) {
      console.error("Erro ao excluir agendamento:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--tx)" }}>
            Agenda & Reuniões
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--mu)" }}>
            Gerencie reuniões, calls de alinhamento e links do Google Meet com clientes.
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="painel-btn pr">
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="painel-search">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="painel-btn text-xs py-2 px-3 outline-none"
        >
          <option value="">Todos os clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.company ? `(${c.company})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Appointments List */}
      <div className="painel-c">
        {loading ? (
          <div className="py-12 text-center text-xs" style={{ color: "var(--mu)" }}>
            Carregando agenda...
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center text-xs" style={{ color: "var(--mu)" }}>
            Nenhum agendamento encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b" style={{ borderColor: "var(--bd)", color: "var(--mu)" }}>
                <tr>
                  <th className="py-3 px-4 font-semibold">Reunião / Cliente</th>
                  <th className="py-3 px-4 font-semibold">Data & Horário</th>
                  <th className="py-3 px-4 font-semibold">Link da Reunião</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--bd)" }}>
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-sm" style={{ color: "var(--tx)" }}>
                        {appt.title}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--mu)" }}>
                        {appt.clientName || "Cliente não vinculado"} {appt.clientEmail ? `• ${appt.clientEmail}` : ""}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5" style={{ color: "var(--tx)" }}>
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>{new Date(appt.starts_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--mu)" }}>
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(appt.starts_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          {" - "}
                          {new Date(appt.ends_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {appt.meet_link ? (
                        <a
                          href={appt.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Acessar Meet
                        </a>
                      ) : (
                        <span className="text-[11px]" style={{ color: "var(--mu)" }}>
                          Sem link
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenModal(appt)}
                          className="painel-ib !w-7 !h-7"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(appt.id)}
                          className="painel-ib !w-7 !h-7 text-red-500 hover:text-red-700"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="painel-c max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--tx)" }}>
              {editingAppointment ? "Editar Reunião" : "Novo Agendamento"}
            </h3>

            {error && (
              <div className="mb-4 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 p-3 rounded-lg border border-red-200 dark:border-red-900/50">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--tx)" }}>
                  Título da Reunião *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alinhamento de Escopo do E-commerce"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                  style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--tx)" }}>
                  Cliente
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                  style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                >
                  <option value="">Nenhum cliente vinculado</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--tx)" }}>
                    Início *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                    style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--tx)" }}>
                    Fim *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                    style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--tx)" }}>
                  Link do Google Meet
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  value={formData.meetLink}
                  onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                  style={{ borderColor: "var(--bd)", background: "var(--side)" }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: "var(--bd)" }}>
                <button type="button" onClick={handleCloseModal} className="painel-btn">
                  Cancelar
                </button>
                <button type="submit" className="painel-btn pr">
                  {editingAppointment ? "Atualizar" : "Salvar Agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
