import React, { useState } from 'react';
import { Package, Plus, X } from 'lucide-react';

export default function AddArticleModal({
  isOpen,
  onClose,
  types,
  diagnostics,
  onAddArticle,
  onOpenAddTypeModal,
  onOpenAddDiagModal
}) {
  const [form, setForm] = useState({
    ref: '',
    designation: '',
    id_type: types[0]?.id_type || '',
    id_diag: diagnostics[0]?.id_diag || '',
    stockInitial: 0,
    seuil: 5,
    emplacement: 'R1-B01'
  });

  if (!isOpen) return null;

  // Filter diagnostics by selected type if applicable
  const relevantDiagnostics = form.id_type
    ? diagnostics.filter((d) => d.id_type === form.id_type)
    : diagnostics;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.ref || !form.designation) return;

    onAddArticle({
      ref: form.ref.trim(),
      designation: form.designation.trim(),
      id_type: form.id_type,
      id_diag: form.id_diag || (relevantDiagnostics[0]?.id_diag || ''),
      stockInitial: Number(form.stockInitial) || 0,
      seuil: Number(form.seuil) || 0,
      emplacement: form.emplacement.trim() || 'ATELIER'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Nouvel Article (Stock)</h3>
              <p className="text-xs text-slate-500">Ajout d'une référence au magasin central</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Référence (Ref)
              </label>
              <input
                type="text"
                placeholder="ex: ART-500"
                value={form.ref}
                onChange={(e) => setForm({ ...form, ref: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold uppercase"
                required
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Désignation
              </label>
              <input
                type="text"
                placeholder="ex: Roulement 6204 2RS"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Type with '+' Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Type d'Article
                </label>
                <button
                  type="button"
                  onClick={onOpenAddTypeModal}
                  className="text-[10.5px] text-cyan-600 hover:text-cyan-800 font-semibold inline-flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Nouveau</span>
                </button>
              </div>
              <select
                value={form.id_type}
                onChange={(e) => {
                  const newType = e.target.value;
                  const relDiag = diagnostics.filter((d) => d.id_type === newType);
                  setForm({
                    ...form,
                    id_type: newType,
                    id_diag: relDiag[0]?.id_diag || ''
                  });
                }}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
              >
                {types.map((t) => (
                  <option key={t.id_type} value={t.id_type}>
                    {t.libelle} ({t.id_type})
                  </option>
                ))}
              </select>
            </div>

            {/* Diagnostic with '+' Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Diagnostic Associé
                </label>
                <button
                  type="button"
                  onClick={onOpenAddDiagModal}
                  className="text-[10.5px] text-amber-600 hover:text-amber-800 font-semibold inline-flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Nouveau</span>
                </button>
              </div>
              <select
                value={form.id_diag}
                onChange={(e) => setForm({ ...form, id_diag: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
              >
                {(relevantDiagnostics.length > 0 ? relevantDiagnostics : diagnostics).map((d) => (
                  <option key={d.id_diag} value={d.id_diag}>
                    {d.libelle} ({d.id_diag})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Stock Initial
              </label>
              <input
                type="number"
                min="0"
                value={form.stockInitial}
                onChange={(e) => setForm({ ...form, stockInitial: parseInt(e.target.value) || 0 })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Seuil d'Alerte
              </label>
              <input
                type="number"
                min="0"
                value={form.seuil}
                onChange={(e) => setForm({ ...form, seuil: parseInt(e.target.value) || 0 })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-amber-700"
                required
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Emplacement
              </label>
              <input
                type="text"
                placeholder="R1-B01"
                value={form.emplacement}
                onChange={(e) => setForm({ ...form, emplacement: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-medium"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold"
            >
              Enregistrer l'Article
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
