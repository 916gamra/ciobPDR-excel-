import React, { useState } from 'react';
import { Package, Plus, X } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function AddArticleModal({
  isOpen,
  onClose,
  types,
  onAddArticle,
  onOpenAddTypeModal,
}) {
  const [form, setForm] = useState({
    ref: '',
    designation: '',
    id_type: types[0]?.id_type || '',
    stockInitial: 0,
    seuil: 5,
    emplacement: 'R1-B01',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanRef = form.ref.trim();
    if (!cleanRef) return;

    onAddArticle({
      ref: cleanRef,
      designation: form.designation.trim() || cleanRef,
      id_type: form.id_type,
      stockInitial: Number(form.stockInitial) || 0,
      seuil: Number(form.seuil) || 0,
      emplacement: form.emplacement.trim() || 'ATELIER',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header (BDR Light Excel UI) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Nouvel Article (Stock)</h3>
              <p className="text-xs text-slate-500">Ajout d'une référence au magasin central</p>
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Référence (Ref)
              </label>
              <input
                type="text"
                placeholder="ex: ART-500"
                value={form.ref}
                onChange={(e) => setForm({ ...form, ref: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold uppercase focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 shadow-2xs transition"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Désignation
              </label>
              <input
                type="text"
                placeholder="ex: Roulement 6204 2RS"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 shadow-2xs transition"
                required
              />
            </div>
          </div>

          <div>
            {/* Type with '+' Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Type d'Article (Famille / Genre)
                </label>
                <button
                  type="button"
                  onClick={onOpenAddTypeModal}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouveau Type</span>
                </button>
              </div>
              <CustomSelect
                value={form.id_type}
                onChange={(val) => setForm({ ...form, id_type: val })}
                options={types.map((t) => ({
                  value: t.id_type,
                  label: `${t.libelle} (${t.id_type})`,
                }))}
                placeholder="-- Sélectionner un Type --"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Stock Initial
              </label>
              <input
                type="number"
                min="0"
                value={form.stockInitial}
                onChange={(e) => setForm({ ...form, stockInitial: parseInt(e.target.value) || 0 })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 shadow-2xs transition"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Seuil d'Alerte
              </label>
              <input
                type="number"
                min="0"
                value={form.seuil}
                onChange={(e) => setForm({ ...form, seuil: parseInt(e.target.value) || 0 })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-amber-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 shadow-2xs transition"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Emplacement
              </label>
              <input
                type="text"
                placeholder="R1-B01"
                value={form.emplacement}
                onChange={(e) => setForm({ ...form, emplacement: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 shadow-2xs transition"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold transition cursor-pointer text-xs shadow-2xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs cursor-pointer text-xs flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enregistrer l'Article</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
