import React, { useState } from 'react';
import { Tag, Plus, Search, ArrowRight, Package, Layers } from 'lucide-react';

export default function TypeView({
  types = [],
  designations = [],
  stockItems = [],
  onAddType,
  onNavigateToStockFiltered,
  onNavigateToDesignationsFiltered
}) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ id_type: '', libelle: '' });

  const filtered = types.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const id = String(t.id_type || '').toLowerCase();
    const lib = String(t.libelle || '').toLowerCase();
    return id.includes(q) || lib.includes(q);
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
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <Tag className="w-5 h-5 text-cyan-600 shrink-0" />
            <span>Types d'Articles (Types & Catégories)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Équivalent des <b className="text-cyan-600">Families</b> pour les machines (ex: Foret, Vis, Roulement). Cliquez sur <b className="text-indigo-600">Nb Désignations</b> pour voir les modèles ou <b className="text-cyan-600">Nb Articles</b> pour le Stock.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-black transition shadow-xs flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouveau Type</span>
        </button>
      </div>

      {/* Excel Formula Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule D (Nb Désignations)</div>
            <div className="text-[11px] font-mono font-semibold text-indigo-700 mt-0.5">
              =COUNTIF(Designations!C:C, [@id_type])
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">Calcul D</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule E (Nb Articles Stockés)</div>
            <div className="text-[11px] font-mono font-semibold text-cyan-700 mt-0.5">
              =COUNTIF(Stock_Actuel!D:D, [@id_type])
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan-700">Calcul E</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Liaison Stock (Nomenclature)</div>
            <div className="text-[11px] font-mono font-semibold text-emerald-700 mt-0.5">
              =SUMIF(Stock!D:D, [@id_type], Stock!H:H)
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Somme Pièces</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un type (Foret, Vis, Roulement...)..."
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
        {/* Top Info Header Bar inside Card */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50/50 gap-2">
          <div className="font-bold text-slate-800 text-[13px]">
            Types • Ordre Excel Row 3 : B→E
          </div>
          <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
            id_type | libelle | nb_designations | nb_articles
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50/90 text-[10.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">
                <span>ID TYPE</span> <span className="text-slate-400 font-normal text-[10px]">(B)</span>
              </th>
              <th className="py-2.5 px-4">
                <span>LIBELLÉ DU TYPE</span> <span className="text-slate-400 font-normal text-[10px]">(C) primary</span>
              </th>
              <th className="py-2.5 px-4">
                <span>NB DÉSIGNATIONS</span> <span className="text-slate-400 font-normal text-[10px]">(D)</span>
              </th>
              <th className="py-2.5 px-4">
                <span>NB ARTICLES</span> <span className="text-slate-400 font-normal text-[10px]">(E)</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((t) => {
              const typeVal = t.id_type || t.libelle;
              const desigCount = designations.filter(
                (d) =>
                  (d.id_type && d.id_type.toLowerCase() === typeVal.toLowerCase()) ||
                  (d.type && d.type.toLowerCase() === typeVal.toLowerCase())
              ).length;

              const articleCount = stockItems.filter(
                (s) =>
                  (s.id_type && s.id_type.toLowerCase() === typeVal.toLowerCase()) ||
                  (s.type && s.type.toLowerCase() === typeVal.toLowerCase())
              ).length;

              return (
                <tr key={typeVal} className="even:bg-slate-50/50 odd:bg-white hover:bg-slate-100/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px]">
                      {typeVal}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 text-[13px]">
                    {t.libelle || typeVal}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToDesignationsFiltered && onNavigateToDesignationsFiltered(typeVal)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold transition group shadow-2xs"
                      title="Voir les Désignations (Templates) liées à ce Type"
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{desigCount} désignations</span>
                      <ArrowRight className="w-3 h-3 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToStockFiltered && onNavigateToStockFiltered(typeVal)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200 text-xs font-semibold transition group shadow-2xs"
                      title="Aller vers le Stock filtré sur ce Type"
                    >
                      <Package className="w-3.5 h-3.5 text-cyan-600" />
                      <span>{articleCount} articles</span>
                      <ArrowRight className="w-3 h-3 text-cyan-600 group-hover:translate-x-0.5 transition-transform" />
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
            <p className="text-xs text-slate-500 mb-4">Créez une catégorie parent (ex: Foret, Vis, Roulement) pour regrouper les désignations.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ID / Nom du Type (ex: Foret, Vis, Roulement)</label>
                <input
                  type="text"
                  placeholder="Foret, Vis, Roulement..."
                  value={form.id_type}
                  onChange={(e) => setForm({ ...form, id_type: e.target.value, libelle: form.libelle || e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Libellé du Type</label>
                <input
                  type="text"
                  placeholder="Forêts & Mèches de perçage..."
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

