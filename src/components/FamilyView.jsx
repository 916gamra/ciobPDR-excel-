import React, { useState } from 'react';
import { FolderTree, Plus, Search, ArrowRight, Layers, Cpu } from 'lucide-react';

export default function FamilyView({
  families,
  templates,
  machines,
  onAddFamily,
  onNavigateToTemplatesFiltered,
  onNavigateToMachinesByFamily
}) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ id_family: '', libelle: '' });

  const filtered = families.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return f.id_family.toLowerCase().includes(q) || f.libelle.toLowerCase().includes(q);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id_family || !form.libelle) return;
    onAddFamily(form);
    setForm({ id_family: '', libelle: '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <FolderTree className="w-4 h-4" />
            <span>Niveau 1 Machines • Familles Technologiques</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Familles de Machines (Catégories d'Équipements)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cliquez sur <b className="text-cyan-600">Nb Templates</b> pour voir les modèles de la famille, ou sur <b className="text-emerald-600">Nb Machines</b> pour filtrer le parc (Family = sélectionnée, Template = Tous).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nouvelle Famille</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une famille (ID, libellé)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total : <b className="text-slate-900">{families.length}</b> familles
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-[10.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">ID Famille</th>
              <th className="py-3 px-4">Libellé de la Famille</th>
              <th className="py-3 px-4">Nb Templates (Modèles)</th>
              <th className="py-3 px-4">Nb Machines Installées</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((f) => {
              const tCount = templates.filter((t) => t.id_family === f.id_family).length;
              const mCount = machines.filter((m) => m.id_family === f.id_family).length;

              return (
                <tr key={f.id_family} className="even:bg-slate-50/50 odd:bg-white hover:bg-slate-100/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {f.id_family}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 text-[13px]">
                    {f.libelle}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToTemplatesFiltered(f.id_family)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200 text-xs font-semibold transition group shadow-2xs"
                      title="Voir les templates de cette famille"
                    >
                      <Layers className="w-3.5 h-3.5 text-cyan-600" />
                      <span>{tCount} templates</span>
                      <ArrowRight className="w-3 h-3 text-cyan-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToMachinesByFamily(f.id_family)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition group shadow-2xs"
                      title="Filtrer Machines Registered : Famille sélectionnée, Template = Tous"
                    >
                      <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{mCount} machines (All)</span>
                      <ArrowRight className="w-3 h-3 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
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
            <h3 className="font-bold text-base text-slate-900 mb-1">+ Nouvelle Famille de Machine</h3>
            <p className="text-xs text-slate-500 mb-4">Créez une catégorie principale de machine (ex: FAM-HYD).</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ID Famille (ex: FAM-HYD)</label>
                <input
                  type="text"
                  placeholder="FAM-HYD"
                  value={form.id_family}
                  onChange={(e) => setForm({ ...form, id_family: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold uppercase"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Libellé de la Famille</label>
                <input
                  type="text"
                  placeholder="Hydraulique & Pressurisation..."
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
