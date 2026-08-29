import React, { useState } from 'react';
import { AlertCircle, Plus, Search, ArrowRight, Package, Tag } from 'lucide-react';

export default function DiagnosticView({
  diagnostics,
  types,
  stockItems,
  diagTypeFilter,
  setDiagTypeFilter,
  onAddDiagnostic,
  onOpenAddTypeModal,
  onNavigateToStockFilteredByDiag,
  onNavigateToTypeFiltered
}) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ id_diag: '', libelle: '', id_type: types[0]?.id_type || '' });

  const filtered = diagnostics.filter((d) => {
    if (diagTypeFilter !== 'ALL' && d.id_type !== diagTypeFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return d.id_diag.toLowerCase().includes(q) || d.libelle.toLowerCase().includes(q) || d.id_type.toLowerCase().includes(q);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id_diag || !form.libelle || !form.id_type) return;
    onAddDiagnostic(form);
    setForm({ id_diag: '', libelle: '', id_type: types[0]?.id_type || '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            <span>Niveau 2 (Élément Enfant) • Diagnostics & Motifs</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Diagnostics (Motifs de Maintenance & Usure)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chaque diagnostic est rattaché à un <b className="text-cyan-600">Type Parent</b>. Cliquez sur <b className="text-amber-600">Nb Articles</b> pour voir le stock correspondant.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({ id_diag: '', libelle: '', id_type: types[0]?.id_type || '' });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nouveau Diagnostic</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un diagnostic (ID, libellé)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <select
            value={diagTypeFilter}
            onChange={(e) => setDiagTypeFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
          >
            <option value="ALL">Tous les Types Parents ({types.length})</option>
            {types.map((t) => (
              <option key={t.id_type} value={t.id_type}>
                {t.libelle} ({t.id_type})
              </option>
            ))}
          </select>

          {diagTypeFilter !== 'ALL' && (
            <button
              onClick={() => setDiagTypeFilter('ALL')}
              className="text-xs text-slate-500 hover:text-slate-900 underline font-medium"
            >
              Effacer filtre
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total : <b className="text-slate-900">{filtered.length}</b> diagnostics
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-[10.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">ID Diag</th>
              <th className="py-3 px-4">Libellé du Diagnostic</th>
              <th className="py-3 px-4">Type Parent (Liaison)</th>
              <th className="py-3 px-4">Nb Articles (Stock)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((d) => {
              const typeObj = types.find((t) => t.id_type === d.id_type);
              const articleCount = stockItems.filter((s) => s.id_diag === d.id_diag).length;

              return (
                <tr key={d.id_diag} className="even:bg-slate-50/50 odd:bg-white hover:bg-slate-100/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {d.id_diag}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 text-[13px]">
                    {d.libelle}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToTypeFiltered(d.id_type)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-medium hover:bg-cyan-100 transition"
                      title="Voir ce Type Parent"
                    >
                      <Tag className="w-3 h-3 text-cyan-600" />
                      <span>{typeObj ? typeObj.libelle : d.id_type}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToStockFilteredByDiag(d.id_diag)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-semibold transition group shadow-2xs"
                      title="Aller vers le Stock filtré sur ce Diagnostic"
                    >
                      <Package className="w-3.5 h-3.5 text-amber-600" />
                      <span>{articleCount} articles</span>
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
            <h3 className="font-bold text-base text-slate-900 mb-1">+ Nouveau Diagnostic</h3>
            <p className="text-xs text-slate-500 mb-4">Ajoutez un motif rattaché à un type de pièce.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ID Diagnostic (ex: DIAG-PRESS)</label>
                <input
                  type="text"
                  placeholder="DIAG-PRESS"
                  value={form.id_diag}
                  onChange={(e) => setForm({ ...form, id_diag: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Libellé du Diagnostic</label>
                <input
                  type="text"
                  placeholder="Baisse pression pompe hydraulique..."
                  value={form.libelle}
                  onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Type Parent (Liaison)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      onOpenAddTypeModal();
                    }}
                    className="text-[11px] text-cyan-700 hover:text-cyan-900 font-semibold inline-flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Créer Type</span>
                  </button>
                </div>
                <select
                  value={form.id_type}
                  onChange={(e) => setForm({ ...form, id_type: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                  required
                >
                  {types.map((t) => (
                    <option key={t.id_type} value={t.id_type}>
                      {t.libelle} ({t.id_type})
                    </option>
                  ))}
                </select>
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
