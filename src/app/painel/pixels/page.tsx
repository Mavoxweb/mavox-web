"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, Edit, BarChart2, Wifi, Smartphone } from "lucide-react";
import Link from "next/link";

interface PixelEvent {
  id: string;
  name: string;
  pixel_id_meta: string | null;
  pixel_id_google: string | null;
  created_at: string;
}

export default function PixelsPage() {
  const router = useRouter();
  const [pixels, setPixels] = useState<PixelEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPixel, setEditingPixel] = useState<PixelEvent | null>(null);
  const [formData, setFormData] = useState({ name: "", pixel_id_meta: "", pixel_id_google: "" });
  const [error, setError] = useState("");

  const fetchPixels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/painel/pixels");
      const data = await res.json();
      setPixels(data.data);
    } catch (error) {
      console.error("Erro ao buscar pixels:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPixels();
  }, [fetchPixels]);

  const handleOpenModal = (pixel?: PixelEvent) => {
    if (pixel) {
      setEditingPixel(pixel);
      setFormData({ name: pixel.name, pixel_id_meta: pixel.pixel_id_meta || "", pixel_id_google: pixel.pixel_id_google || "" });
    } else {
      setEditingPixel(null);
      setFormData({ name: "", pixel_id_meta: "", pixel_id_google: "" });
    }
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPixel(null);
    setFormData({ name: "", pixel_id_meta: "", pixel_id_google: "" });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const url = editingPixel ? `/api/painel/pixels/${editingPixel.id}` : "/api/painel/pixels";
      const method = editingPixel ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao salvar");
        return;
      }

      handleCloseModal();
      fetchPixels();
    } catch (error) {
      setError("Erro ao salvar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento de pixel?")) return;
    try {
      const res = await fetch(`/api/painel/pixels/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      fetchPixels();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pixels de Conversão</h1>
          <p className="text-gray-600 mt-1">Configure IDs do Meta Ads e Google Ads para rastreamento</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Evento
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="p-8 text-center animate-pulse text-gray-400">Carregando...</div>
        ) : pixels.length === 0 ? (
          <div className="p-8 text-center">
            <BarChart2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento de pixel configurado</h3>
            <p className="text-gray-500 mb-6">Adicione eventos para rastrear conversões no Meta Ads e Google Ads</p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Adicionar Primeiro Evento
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {pixels.map(pixel => (
              <li key={pixel.id} className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{pixel.name}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    {pixel.pixel_id_meta && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        <Wifi className="w-3 h-3" />
                        Meta: {pixel.pixel_id_meta}
                      </span>
                    )}
                    {pixel.pixel_id_google && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-800">
                        <Smartphone className="w-3 h-3" />
                        Google: {pixel.pixel_id_google}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(pixel)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pixel.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingPixel ? "Editar Evento de Pixel" : "Novo Evento de Pixel"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Evento *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="ex: proposta_aceita, clique_whatsapp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Pixel ID</label>
                  <input
                    type="text"
                    value={formData.pixel_id_meta}
                    onChange={(e) => setFormData({ ...formData, pixel_id_meta: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Ex: 123456789012345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Ads ID</label>
                  <input
                    type="text"
                    value={formData.pixel_id_google}
                    onChange={(e) => setFormData({ ...formData, pixel_id_google: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Ex: AW-123456789"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingPixel ? "Salvar" : "Criar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}