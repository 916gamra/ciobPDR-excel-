import React, { useState, useEffect } from 'react';
import { MapPin, Plus, X } from 'lucide-react';

export default function AddZoneModal({ isOpen, onClose, zones = [], onAddZone }) {
  const [form, setForm] = useState({
    id_zone: '',
    libelle: '',
  });
  const [error, setError] = useState('');

  // Auto-calculation of next Zone ID (e.g., ZONE-06)
  const getNextZoneId = () => {
    const nums = zones
      .map((z) => {
        const m = String(z.id_zone || '').match(/ZONE-(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `ZONE-${String(max + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isOpen) {
      setForm({
        id_zone: getNextZoneId(),
        libelle: '',
      });
      setError('');
    }
  }, [isOpen, zones]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.libelle.trim()) {
      setError('Veuillez saisir le nom / libellé de la zone.');
      return;
    }

    if (zones.some((z) => z.id_zone.toLowerCase().trim() === form.id_zone.toLowerCase().trim())) {
      setError('Ce code de zone existe déjà.');
      return;
    }

    onAddZone({
      id_zone: form.id_zone.trim().toUpperCase(),
      libelle: form.libelle.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header (BDR Light Excel UI) */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shadow-2xs font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 leading-tight">Nouvelle Zone / Atelier</h3>
              <p className="text-[11.5px] text-slate-500 mt-0.5">
                Création et intégration directe au workflow
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* ID Zone */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Code Zone (ID_Zone) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.id_zone}
              onChange={(e) => setForm({ ...form, id_zone: e.target.value.toUpperCase() })}
              placeholder="ex: ZONE-06 ou ZONE-ATEL"
              className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 shadow-2xs transition"
            />
          </div>

          {/* Libellé */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Libellé / Désignation de l'Atelier <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="ex: Ligne Embouteillage 3, Atelier Électrique..."
              value={form.libelle}
              onChange={(e) => setForm({ ...form, libelle: e.target.value })}
              className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 shadow-2xs transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold transition cursor-pointer text-xs shadow-2xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-xs cursor-pointer text-xs flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer la Zone</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
