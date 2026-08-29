import React, { useState } from 'react';
import { Tag, Plus, Search, ArrowRight, Package, AlertCircle } from 'lucide-react';

export default function TypeView({
  types,
  diagnostics,
  stockItems,
  onAddType,
  onNavigateToStockFiltered,
  onNavigateToDiagFiltered
}) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ id_type: '', libelle: '' });

  const filtered = types.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.id_type.toLowerCase().includes(q) || t.libelle.toLowerCase().includes(q);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id_type || !form.libelle) return;
    onAddType(form);
    setForm({ id_type: '', libelle: '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 font-semibold text-xs uppercase tracking-wider">
            <Tag className="w-4 h-4" />
            <span>Niveau 1 • Nomenclature Articles</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Types d'Articles (Familles de Pièces)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cliquez sur <b className="text-cyan-600">Nb Articles</b> pour ouvrir le Stock filtré, ou sur <b className="text-amber-600">Nb Diagnostics</b> pour voir les motifs rattachés.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nouveau Type</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un type (ID, libellé)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total : <b className="text-slate-900">{types.length}</b> types configurés
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-[10.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">ID Type</th>
              <th className="py-3 px-4">Libellé du Type</th>
              <th className="py-3 px-4">Nb Articles (Stock)</th>
              <th className="py-3 px-4">Nb Diagnostics Associés</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((t) => {
              const articleCount = stockItems.filter((s) => s.id_type === t.id_type).length;
              const diagCount = diagnostics.filter((d) => d.id_type === t.id_type).length;

              return (
                <tr key={t.id_type} className="even:bg-slate-50/50 odd:bg-white hover:bg-slate-100/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {t.id_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 text-[13px]">
                    {t.libelle}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToStockFiltered(t.id_type)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200 text-xs font-semibold transition group shadow-2xs"
                      title="Aller vers le Stock filtré sur ce Type"
                    >
                      <Package className="w-3.5 h-3.5 text-cyan-600" />
                      <span>{articleCount} articles</span>
                      <ArrowRight className="w-3 h-3 text-cyan-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToDiagFiltered(t.id_type)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-semibold transition group shadow-2xs"
                      title="Voir les diagnostics liés à ce Type"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{diagCount} diagnostics</span>
                      <ArrowRight className="w-3 h-3 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">+ Nouveau Type d'Article</h3>
            <p className="text-xs text-slate-500 mb-4">Créez une catégorie principale pour classifier les articles en Stock.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ID Type (ex: TYPE-HYD)</label>
                <input
                  type="text"
                  placeholder="TYPE-HYD"
                  value={form.id_type}
                  onChange={(e) => setForm({ ...form, id_type: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold uppercase"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Libellé du Type</label>
                <input
                  type="text"
                  placeholder="Hydraulique & Haute Pression..."
                  value={form.libelle}
                  onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  required
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
