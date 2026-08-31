import React, { useState, useRef, useMemo, useEffect } from 'react';
import AnimatedPage from './AnimatedPage';
import {       Tag, Plus, Search, ArrowRight, Package, Layers, Trash2, Edit2, AlertTriangle , ChevronLeft , ChevronRight , SlidersHorizontal , ArrowUpDown , ChevronDown , ArrowDown, ArrowUp } from 'lucide-react';

export default function TypeView({
  types = [],
  designations = [],
  stockItems = [],
  onAddType,
  onUpdateType,
  onDeleteType,
  onNavigateToStockFiltered,
  onNavigateToDesignationsFiltered
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(localSearch);
    }, 200);
    return () => clearTimeout(handler);
  }, [localSearch]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ id_type: '', libelle: '' });
  const [toEdit, setToEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const filtered = types.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const id = String(t.id_type || '').toLowerCase();
    const lib = String(t.libelle || '').toLowerCase();
    return id.includes(q) || lib.includes(q);
  });

  
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('id_type');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortMenuRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortField, sortOrder]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  const displayedData = pageSize === 0 ? sortedData : sortedData.slice(startIndex, startIndex + effectivePageSize);

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
      <ArrowUp className="w-3 h-3 text-cyan-700 shrink-0 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-cyan-700 shrink-0 font-bold" />
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id_type || !form.libelle) return;
    onAddType(form);
    setForm({ id_type: '', libelle: '' });
    setShowAddModal(false);
  };

  return (
    <AnimatedPage className="space-y-4">
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
      {/* Excel Formula Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">Formule D (Nb Désignations)</div>
            <div className="font-mono text-xs text-indigo-700 font-semibold mt-0.5">
              =COUNTIF(Designations!C:C, [@id_type])
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
            D
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">Formule E (Nb Articles)</div>
            <div className="font-mono text-xs text-cyan-700 font-semibold mt-0.5">
              =COUNTIF(Stock_Actuel!D:D, [@id_type])
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-xs">
            E
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">Liaison Stock (Nomenclature)</div>
            <div className="font-mono text-xs text-emerald-700 font-semibold mt-0.5">
              =SUMIF(Stock!D:D, [@id_type], Stock!H:H)
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
            sum
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Filtres & Tri de Données</span>
          </div>
          {/* Displaying the filtered count */}
          <div className="text-xs font-semibold text-slate-500">
            <span className="bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-lg font-bold border border-cyan-100">
              {filtered.length} type{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          {/* Search */}
          <div className="relative w-full">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Recherche
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un type (Foret, Vis, Roulement...)..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="w-full relative" ref={sortMenuRef}>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Tri des enregistrements
            </label>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`w-full h-10 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                showSortMenu || sortField !== 'id_type' || sortOrder !== 'asc'
                  ? 'bg-cyan-50 text-cyan-800 border-cyan-300 ring-1 ring-cyan-200 shadow-2xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-cyan-600" />
                <span>Tri : <b className="font-mono text-slate-900">{sortField.toUpperCase()}</b> ({sortOrder === 'asc' ? 'A→Z' : 'Z→A'})</span>
              </div>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>

            {showSortMenu && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600" />
                    Trier par
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  
                  <button
                    onClick={() => {
                      if (sortField === 'id_type') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('id_type');
                        setSortOrder('asc');
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                      sortField === 'id_type'
                        ? 'bg-cyan-50 text-cyan-800'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Type Ref (ID)</span>
                    {sortField === 'id_type' && (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-600 shrink-0" /> : <ArrowDown className="w-3 h-3 text-cyan-600 shrink-0" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (sortField === 'description') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('description');
                        setSortOrder('asc');
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                      sortField === 'description'
                        ? 'bg-cyan-50 text-cyan-800'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Description / Libellé</span>
                    {sortField === 'description' && (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-600 shrink-0" /> : <ArrowDown className="w-3 h-3 text-cyan-600 shrink-0" />
                    )}
                  </button>

                </div>
              </div>
            )}
          </div>
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
          <thead className="bg-slate-100 text-[10.5px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 text-center w-12 text-slate-500 font-mono text-[10px] bg-slate-200/60 border-r border-slate-200 shrink-0">
                N°
              </th>
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
              <th className="py-2.5 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {displayedData.map((t, idx) => {
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
                <tr key={typeVal} className="even:bg-slate-50/80 odd:bg-white hover:bg-slate-100/70 border-b border-slate-200/70 transition-colors">
                  {/* Row N° Column */}
                  <td className="py-3 px-3 text-center font-mono text-[11px] font-bold text-slate-400 bg-slate-100/40 border-r border-slate-200/80 shrink-0">
                    {idx + 1}
                  </td>
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
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setToEdit({ ...t })} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setToDelete(t)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      
      {/* Pagination Footer */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">Lignes par page :</span>
          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            {[100, 200, 500, 0].map((size) => (
              <button
                key={size}
                onClick={() => { setPageSize(size); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  pageSize === size
                    ? 'bg-white text-cyan-800 shadow-xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {size === 0 ? 'Tout' : size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs font-semibold text-slate-500">
            Affichage <b className="text-slate-900">{totalItems === 0 ? 0 : startIndex + 1}</b> à <b className="text-slate-900">{Math.min(startIndex + effectivePageSize, totalItems)}</b> sur <b className="text-slate-900">{totalItems}</b>
          </div>
          {pageSize !== 0 && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Précédent
              </button>
              <span className="px-2 font-mono text-xs font-bold text-slate-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition"
              >
                Suivant
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

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
    
      {toEdit && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">Modifier Type</h3>
            <form onSubmit={(e) => { e.preventDefault(); onUpdateType(toEdit.id_type, toEdit); setToEdit(null); }} className="space-y-3">
              <div><label className="text-[11px] font-bold text-slate-500">ID Type</label>
              <input type="text" value={toEdit.id_type} disabled className="mt-1 w-full h-10 px-3 rounded-xl bg-slate-100 text-slate-500 text-xs font-mono" /></div>
              <div><label className="text-[11px] font-bold text-slate-500">Libellé</label>
              <input type="text" value={toEdit.libelle} onChange={(e) => setToEdit({ ...toEdit, libelle: e.target.value })} required className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs" /></div>
              <div className="flex gap-2 pt-3">
                <button type="button" onClick={() => setToEdit(null)} className="flex-1 h-10 rounded-xl bg-slate-100 text-xs font-medium">Annuler</button>
                <button type="submit" className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-xs font-semibold">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <div className="flex flex-col items-center text-center"><AlertTriangle className="w-8 h-8 text-rose-600 mb-2" />
            <h3 className="font-bold text-lg text-slate-900">Supprimer ce type ?</h3></div>
            <p className="text-sm text-center text-slate-600">Confirmez-vous la suppression de <b>{toDelete.libelle}</b> ?</p>
            <div className="flex gap-2"><button onClick={() => setToDelete(null)} className="flex-1 h-10 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">Annuler</button>
            <button onClick={() => { onDeleteType(toDelete.id_type); setToDelete(null); }} className="flex-1 h-10 rounded-xl bg-rose-600 text-white text-xs font-semibold">Supprimer</button></div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
