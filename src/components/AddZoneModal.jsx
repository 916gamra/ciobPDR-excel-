import React, { useState, useEffect } from 'react';
import { MapPin, Plus, X } from 'lucide-react';

export default function AddZoneModal({
  isOpen,
  onClose,
  zones = [],
  onAddZone
}) {
  const [form, setForm] = useState({
    id_zone: '',
    libelle: ''
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
        libelle: ''
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
      libelle: form.libelle.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-none">Nouvelle Zone / Atelier</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Création et intégration directe au workflow
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* ID Zone */}
          <div>
            <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Code Zone (ID_Zone) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.id_zone}
              onChange={(e) => setForm({ ...form, id_zone: e.target.value.toUpperCase() })}
              placeholder="ex: ZONE-06 ou ZONE-ATEL"
              className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
            />
          </div>

          {/* Libellé */}
          <div>
            <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Libellé / Désignation de l'Atelier <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="ex: Ligne Embouteillage 3, Atelier Électrique..."
              value={form.libelle}
              onChange={(e) => setForm({ ...form, libelle: e.target.value })}
              className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition shadow-xs"
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
