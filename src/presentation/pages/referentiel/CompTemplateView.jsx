import {  useState, useMemo  } from 'react';
import AnimatedPage from '../../components/common/AnimatedPage';
import { Engine } from '../../components/common/icons/Engine';
import { CubeIcon } from '../../components/common/icons/CubeIcon';
import {
  Plus,
  Search,
  ArrowRight,
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
} from 'lucide-react';

export default function CompTemplateView({
  compTemplates = [],
  compFamilies = [],
  warehouseItems = [],
  compTemplateFamilyFilter = '',
  setCompTemplateFamilyFilter,
  onAddCompTemplate,
  onUpdateCompTemplate,
  onDeleteCompTemplate,
  onNavigateToCompFamilies,
  onNavigateToEntrepotByTemplate,
}) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toEdit, setToEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [sortField, setSortField] = useState('id_templates');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form state
  const [form, setForm] = useState({
    id_templates: '',
    libelle: '',
    id_family: '',
  });

  // Filter
  const filtered = useMemo(() => {
    return compTemplates.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch =
        t.id_templates?.toLowerCase().includes(q) ||
        t.libelle?.toLowerCase().includes(q) ||
        t.id_family?.toLowerCase().includes(q);

      const matchFamily = !compTemplateFamilyFilter || t.id_family === compTemplateFamilyFilter;
      return matchSearch && matchFamily;
    });
  }, [compTemplates, search, compTemplateFamilyFilter]);

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
    if (!form.id_templates || !form.libelle || !form.id_family) return;
    onAddCompTemplate({
      ...form,
      id_templates: form.id_templates.trim().toUpperCase(),
    });
    setForm({ id_templates: '', libelle: '', id_family: '' });
    setShowAddModal(false);
  };

  return (
    <AnimatedPage className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 sm:gap-4 w-full">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs font-bold">
            <CubeIcon className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Templates de Composants d&apos;Entrepôt
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Modèles et spécifications standardisés des sous-systèmes stockés en entrepôt rattachés aux Familles de Composants.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const nextIdx = compTemplates.length + 1;
            setForm({
              id_templates: `TPL-CMP${String(nextIdx).padStart(2, '0')}`,
              libelle: '',
              id_family: compFamilies[0]?.id_family || '',
            });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 transition shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Template Composant</span>
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
              {filtered.length} template{filtered.length > 1 ? 's' : ''} de composants / {compTemplates.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="relative md:col-span-8">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par ID template, modèle, famille..."
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

          <div className="md:col-span-4 flex items-center gap-2">
            <Engine className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={compTemplateFamilyFilter}
              onChange={(e) => setCompTemplateFamilyFilter && setCompTemplateFamilyFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer"
            >
              <option value="">Toutes les familles de composants</option>
              {compFamilies.map((f) => (
                <option key={f.id_family} value={f.id_family}>
                  {f.id_family} - {f.libelle}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50/50 gap-2">
          <div className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
            <CubeIcon className="w-4 h-4 text-teal-600" />
            <span>Tableau Templates de Composants (Entrepôt)</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
            id_templates | libelle | id_family (composant) | warehouse_items
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
                  onClick={() => handleSort('id_templates')}
                  className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/60 transition select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ID TEMPLATE</span>
                    {renderSortIcon('id_templates')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('libelle')}
                  className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/60 transition select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>MODÈLE / LIBELLÉ</span>
                    {renderSortIcon('libelle')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('id_family')}
                  className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/60 transition select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>FAMILLE COMPOSANT PARENTE</span>
                    {renderSortIcon('id_family')}
                  </div>
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
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Aucun template de composants trouvé.
                  </td>
                </tr>
              ) : (
                displayedData.map((t, idx) => {
                  const fam = compFamilies.find((f) => f.id_family === t.id_family);
                  const cCount = warehouseItems.filter(
                    (w) =>
                      (w.nature === 'COMPONENT' || w.nature === 'PARTIE') &&
                      w.id_templates === t.id_templates
                  ).length;

                  return (
                    <tr
                      key={t.id_templates}
                      className="even:bg-slate-50/80 odd:bg-white hover:bg-slate-100/70 border-b border-slate-200/70 transition-colors"
                    >
                      <td className="py-3 px-3 text-center font-mono text-[11px] font-bold text-slate-400 bg-slate-100/40 border-r border-slate-200/80 shrink-0">
                        {startIndex + idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                          {t.id_templates}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 text-[13px]">
                        {t.libelle}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            onNavigateToCompFamilies && onNavigateToCompFamilies(t.id_family)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold transition cursor-pointer"
                          title="Voir la famille de composants"
                        >
                          <Engine className="w-3 h-3 text-teal-600" />
                          <span className="font-mono">{t.id_family}</span>
                          {fam && <span className="text-slate-500 font-normal">({fam.libelle})</span>}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            onNavigateToEntrepotByTemplate &&
                            onNavigateToEntrepotByTemplate(t.id_templates, t.id_family)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition group shadow-2xs cursor-pointer"
                          title="Filtrer Entrepôt sur ce template de composant"
                        >
                          <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{cCount} composants</span>
                          <ArrowRight className="w-3 h-3 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setToEdit({ ...t })}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setToDelete(t)}
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
            <span>sur {totalItems} templates</span>
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
              Nouveau Template de Composant
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Modèle de sous-système standardisé stocké en entrepôt.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  ID Template (Clé Unique)
                </label>
                <input
                  type="text"
                  required
                  value={form.id_templates}
                  onChange={(e) => setForm({ ...form, id_templates: e.target.value })}
                  placeholder="ex: TPL-MOT380, TPL-POMVAC"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Libellé / Modèle
                </label>
                <input
                  type="text"
                  required
                  value={form.libelle}
                  onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                  placeholder="ex: Moteur Asynchrone 380V Trifasé 5.5kW"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Famille de Composant Parente
                </label>
                <select
                  required
                  value={form.id_family}
                  onChange={(e) => setForm({ ...form, id_family: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="">Sélectionnez une famille...</option>
                  {compFamilies.map((f) => (
                    <option key={f.id_family} value={f.id_family}>
                      {f.id_family} - {f.libelle}
                    </option>
                  ))}
                </select>
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
              Modifier Template de Composant
            </h3>
            <p className="text-xs font-mono text-teal-700 mb-4">{toEdit.id_templates}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateCompTemplate(toEdit.id_templates, toEdit);
                setToEdit(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Modèle / Libellé
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
                  Famille de Composant Parente
                </label>
                <select
                  required
                  value={toEdit.id_family || ''}
                  onChange={(e) => setToEdit({ ...toEdit, id_family: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  {compFamilies.map((f) => (
                    <option key={f.id_family} value={f.id_family}>
                      {f.id_family} - {f.libelle}
                    </option>
                  ))}
                </select>
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
              Supprimer ce Template de Composant ?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Êtes-vous sûr de vouloir supprimer{' '}
              <strong className="text-slate-900 font-mono">{toDelete.id_templates}</strong> (
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
                  onDeleteCompTemplate(toDelete.id_templates);
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
