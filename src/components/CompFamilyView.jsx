import React, { useState, useMemo } from 'react';
import AnimatedPage from './AnimatedPage';
import { Engine } from './icons/Engine';
import {
  Plus,
  Search,
  ArrowRight,
  Layers,
  Trash2,
  Edit2,
  Warehouse,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Tag,
} from 'lucide-react';

export default function CompFamilyView({
  compFamilies = [],
  compTemplates = [],
  warehouseItems = [],
  onAddCompFamily,
  onUpdateCompFamily,
  onDeleteCompFamily,
  onNavigateToCompTemplates,
  onNavigateToEntrepotByFamily,
}) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toEdit, setToEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [sortField, setSortField] = useState('id_family');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Form state
  const [form, setForm] = useState({
    id_family: '',
    libelle: '',
    componentCode: '',
  });

  // Filter
  const filtered = useMemo(() => {
    return compFamilies.filter((f) => {
      const q = search.toLowerCase();
      return (
        f.id_family?.toLowerCase().includes(q) ||
        f.libelle?.toLowerCase().includes(q) ||
        f.componentCode?.toLowerCase().includes(q)
      );
    });
  }, [compFamilies, search]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortOrder]);

  const totalItems = sortedData.length;
  const totalPages = pageSize === 0 ? 1 : Math.ceil(totalItems / pageSize);
  const effectivePageSize = pageSize === 0 ? totalItems : pageSize;
  const startIndex = (currentPage - 1) * effectivePageSize;
  const displayedData =
    pageSize === 0 ? sortedData : sortedData.slice(startIndex, startIndex + effectivePageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition shrink-0" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-teal-700 shrink-0 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-teal-700 shrink-0 font-bold" />
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id_family || !form.libelle) return;
    const cleanPrefix = (form.componentCode || form.id_family.replace(/^FAM-?/i, ''))
      .toUpperCase()
      .trim();

    onAddCompFamily({
      ...form,
      id_family: form.id_family.trim().toUpperCase(),
      componentCode: cleanPrefix,
    });
    setForm({ id_family: '', libelle: '', componentCode: '' });
    setShowAddModal(false);
  };

  return (
    <AnimatedPage className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 sm:gap-4 w-full">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs font-bold">
            <Engine className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Familles de Composants d&apos;Entrepôt
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Nomenclature des familles de sous-systèmes et ensembles stockés en entrepôt (Moteurs, Pompes, Réducteurs...).
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const nextIdx = compFamilies.length + 1;
            setForm({
              id_family: `FAM-CMP${String(nextIdx).padStart(2, '0')}`,
              libelle: '',
              componentCode: `CMP${nextIdx}`,
            });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 transition shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Famille Composant</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Recherche & Filtres
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-teal-50 text-teal-800 px-3 py-1 rounded-lg text-xs font-bold border border-teal-200/70">
              {filtered.length} famille{filtered.length > 1 ? 's' : ''} de composants / {compFamilies.length}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par ID famille, libellé, préfixe code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50/50 gap-2">
          <div className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
            <Engine className="w-4 h-4 text-teal-600" />
            <span>Tableau Familles de Composants (Entrepôt)</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
            id_family | libelle | componentCode | templates | warehouse_items
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-[10.5px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12 text-slate-500 font-mono text-[10px] bg-slate-200/60 border-r border-slate-200 shrink-0">
                  N°
                </th>
                <th
                  onClick={() => handleSort('id_family')}
                  className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/60 transition select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ID FAMILLE</span>
                    {renderSortIcon('id_family')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('libelle')}
                  className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/60 transition select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>LIBELLÉ FAMILLE COMPOSANT</span>
                    {renderSortIcon('libelle')}
                  </div>
                </th>
                <th className="py-2.5 px-4">
                  <span>PRÉFIXE CODE</span>
                </th>
                <th className="py-2.5 px-4">
                  <span>TEMPLATES COMPOSANTS</span>
                </th>
                <th className="py-2.5 px-4">
                  <span>COMPOSANTS EN ENTREPÔT</span>
                </th>
                <th className="py-2.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {displayedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Aucune famille de composants trouvée.
                  </td>
                </tr>
              ) : (
                displayedData.map((f, idx) => {
                  const tCount = compTemplates.filter((t) => t.id_family === f.id_family).length;
                  const cCount = warehouseItems.filter(
                    (w) =>
                      (w.nature === 'COMPONENT' || w.nature === 'PARTIE') &&
                      w.id_family === f.id_family
                  ).length;

                  return (
                    <tr
                      key={f.id_family}
                      className="even:bg-slate-50/80 odd:bg-white hover:bg-slate-100/70 border-b border-slate-200/70 transition-colors"
                    >
                      <td className="py-3 px-3 text-center font-mono text-[11px] font-bold text-slate-400 bg-slate-100/40 border-r border-slate-200/80 shrink-0">
                        {startIndex + idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                          {f.id_family}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 text-[13px]">
                        {f.libelle}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs">
                          <Tag className="w-3 h-3 text-slate-500" />
                          {f.componentCode || f.id_family.replace(/^FAM-?/i, '')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            onNavigateToCompTemplates && onNavigateToCompTemplates(f.id_family)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 text-xs font-semibold transition group shadow-2xs cursor-pointer"
                          title="Voir les templates de cette famille de composants"
                        >
                          <Layers className="w-3.5 h-3.5 text-teal-600" />
                          <span>{tCount} templates</span>
                          <ArrowRight className="w-3 h-3 text-teal-600 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            onNavigateToEntrepotByFamily &&
                            onNavigateToEntrepotByFamily(f.id_family)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition group shadow-2xs cursor-pointer"
                          title="Filtrer Entrepôt sur cette famille de composants"
                        >
                          <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{cCount} composants</span>
                          <ArrowRight className="w-3 h-3 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setToEdit({ ...f })}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setToDelete(f)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50/50 gap-3">
          <div className="flex items-center gap-2">
            <span>Afficher</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700"
            >
              <option value={5}>5 lignes</option>
              <option value={10}>10 lignes</option>
              <option value={25}>25 lignes</option>
              <option value={0}>Tous ({totalItems})</option>
            </select>
            <span>sur {totalItems} familles</span>
          </div>

          {pageSize > 0 && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-700 px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              + Nouvelle Famille de Composant
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Famille d&apos;ensembles et sous-systèmes stockés en entrepôt.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  ID Famille (Clé Unique)
                </label>
                <input
                  type="text"
                  required
                  value={form.id_family}
                  onChange={(e) => setForm({ ...form, id_family: e.target.value })}
                  placeholder="ex: FAM-MOT, FAM-POM, FAM-RED"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Libellé / Désignation de la Famille
                </label>
                <input
                  type="text"
                  required
                  value={form.libelle}
                  onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                  placeholder="ex: Moteurs & Motoréducteurs"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Préfixe Code Composant (Optionnel)
                </label>
                <input
                  type="text"
                  value={form.componentCode}
                  onChange={(e) => setForm({ ...form, componentCode: e.target.value })}
                  placeholder="ex: MOT, POM, RED"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Utilisé pour générer les codes automatiques en entrepôt (ex: MOT-01, MOT-02...).
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {toEdit && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Modifier Famille de Composant
            </h3>
            <p className="text-xs font-mono text-teal-700 mb-4">{toEdit.id_family}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateCompFamily(toEdit.id_family, toEdit);
                setToEdit(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Libellé
                </label>
                <input
                  type="text"
                  required
                  value={toEdit.libelle || ''}
                  onChange={(e) => setToEdit({ ...toEdit, libelle: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Préfixe Code Composant
                </label>
                <input
                  type="text"
                  value={toEdit.componentCode || ''}
                  onChange={(e) =>
                    setToEdit({
                      ...toEdit,
                      componentCode: e.target.value.toUpperCase().trim(),
                    })
                  }
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setToEdit(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs cursor-pointer"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {toDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Supprimer cette Famille de Composant ?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Êtes-vous sûr de vouloir supprimer{' '}
              <strong className="text-slate-900 font-mono">{toDelete.id_family}</strong> (
              {toDelete.libelle}) ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDeleteCompFamily(toDelete.id_family);
                  setToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
