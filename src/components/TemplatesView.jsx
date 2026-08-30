import React, { useState, useRef, useMemo, useEffect } from 'react';
import AnimatedPage from './AnimatedPage';
import CustomSelect from './CustomSelect';
import {       Layers, Plus, Search, ArrowRight, FolderTree, Cpu, Trash2, Edit2, AlertTriangle , ChevronLeft , ChevronRight , SlidersHorizontal , ArrowUpDown , ChevronDown , ArrowDown } from 'lucide-react';

export default function TemplatesView({
  templates,
  families,
  machines,
  templateFamilyFilter,
  setTemplateFamilyFilter,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onOpenAddFamilyModal,
  onNavigateToMachinesByTemplate,
  onNavigateToFamilyFiltered
}) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ id_templates: '', libelle: '', id_family: families[0]?.id_family || '' });
  const [toEdit, setToEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const filtered = templates.filter((t) => {
    if (templateFamilyFilter !== 'ALL' && t.id_family !== templateFamilyFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return t.id_templates.toLowerCase().includes(q) || t.libelle.toLowerCase().includes(q) || t.id_family.toLowerCase().includes(q);
  });

  
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('id_templates');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortMenuRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, templateFamilyFilter, sortField, sortOrder]);

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
    if (!form.id_templates || !form.libelle || !form.id_family) return;
    onAddTemplate(form);
    setForm({ id_templates: '', libelle: '', id_family: families[0]?.id_family || '' });
    setShowAddModal(false);
  };

  return (
    <AnimatedPage className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Templates de Machines (Modèles Spécifiques)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rattaché à une <b className="text-cyan-600">Famille Parente</b>. Cliquez sur <b className="text-amber-600">Nb Machines</b> pour filtrer précisément : <span className="font-mono text-amber-700">Family = Famille parente + Template = Ce modèle</span>.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({ id_templates: '', libelle: '', id_family: families[0]?.id_family || '' });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-black transition shadow-xs flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouveau Template</span>
        </button>
      </div>

      {/* Excel Formula Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule C (Famille Parente)</div>
            <div className="text-[11px] font-mono font-semibold text-cyan-700 mt-0.5">
              =[@id_family] (Liaison Clé)
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan-700">Liaison C</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule D (Nb Machines Registered)</div>
            <div className="text-[11px] font-mono font-semibold text-amber-700 mt-0.5">
              =COUNTIF(Machines!E:E, [@id_templates])
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700">Calcul D</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule En Service (Statut)</div>
            <div className="text-[11px] font-mono font-semibold text-emerald-700 mt-0.5">
              =COUNTIFS(Machines!E:E, [@id_templates], Machines!H:H, "En service")
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">COUNTIFS</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un template (ID, libellé)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
            />
          </div>

        <div className="relative" ref={sortMenuRef}>
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className={`h-9 px-3 rounded-xl border text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              showSortMenu || sortField !== 'id_templates' || sortOrder !== 'asc'
                ? 'bg-cyan-50 text-cyan-800 border-cyan-300 ring-1 ring-cyan-200 shadow-2xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-600" />
            <span className="hidden sm:inline">Tri : <b className="font-mono text-slate-900">{sortField.toUpperCase()}</b> ({sortOrder === 'asc' ? 'A→Z' : 'Z→A'})</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
          </button>

          {showSortMenu && (
            <div className="absolute left-0 md:right-0 md:left-auto mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600" />
                  Trier par
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                
                <button
                  onClick={() => {
                    if (sortField === 'id_templates') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('id_templates');
                      setSortOrder('asc');
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                    sortField === 'id_templates'
                      ? 'bg-cyan-50 text-cyan-800'
                      : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Modèle</span>
                  {sortField === 'id_templates' && (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-600 shrink-0" /> : <ArrowDown className="w-3 h-3 text-cyan-600 shrink-0" />
                  )}
                </button>
                
                <button
                  onClick={() => {
                    if (sortField === 'designation') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('designation');
                      setSortOrder('asc');
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                    sortField === 'designation'
                      ? 'bg-cyan-50 text-cyan-800'
                      : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Désignation</span>
                  {sortField === 'designation' && (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-600 shrink-0" /> : <ArrowDown className="w-3 h-3 text-cyan-600 shrink-0" />
                  )}
                </button>
                
                <button
                  onClick={() => {
                    if (sortField === 'id_family') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('id_family');
                      setSortOrder('asc');
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                    sortField === 'id_family'
                      ? 'bg-cyan-50 text-cyan-800'
                      : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Famille</span>
                  {sortField === 'id_family' && (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-600 shrink-0" /> : <ArrowDown className="w-3 h-3 text-cyan-600 shrink-0" />
                  )}
                </button>
                
              </div>
            </div>
          )}
        </div>



          <div className="w-56">
            <CustomSelect
              value={templateFamilyFilter}
              onChange={(val) => setTemplateFamilyFilter(val)}
              options={[
                { value: 'ALL', label: `Toutes les Familles Parentes (D) (${families.length})` },
                ...families.map((f) => ({
                  value: f.id_family,
                  label: `[D] ${f.libelle} (${f.id_family})`
                }))
              ]}
            />
          </div>

          {templateFamilyFilter !== 'ALL' && (
            <button
              onClick={() => setTemplateFamilyFilter('ALL')}
              className="text-xs text-slate-500 hover:text-slate-900 underline font-medium"
            >
              Effacer filtre
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total : <b className="text-slate-900">{filtered.length}</b> templates
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Top Info Header Bar inside Card */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50/50 gap-2">
          <div className="font-bold text-slate-800 text-[13px]">
            Templates • Ordre Excel Row 3 : B→E
          </div>
          <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
            id_templates | libelle | id_family | nb_machines
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-[10.5px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 text-center w-12 text-slate-500 font-mono text-[10px] bg-slate-200/60 border-r border-slate-200 shrink-0">
                N°
              </th>
              <th className="py-2.5 px-4">
                <span>ID TEMPLATE</span> <span className="text-slate-400 font-normal text-[10px]">(B)</span>
              </th>
              <th className="py-2.5 px-4">
                <span>LIBELLÉ DU MODÈLE</span> <span className="text-slate-400 font-normal text-[10px]">(C) primary</span>
              </th>
              <th className="py-2.5 px-4">
                <span>FAMILLE PARENTE</span> <span className="text-slate-400 font-normal text-[10px]">(D)</span>
              </th>
              <th className="py-2.5 px-4">
                <span>NB MACHINES</span> <span className="text-slate-400 font-normal text-[10px]">(E)</span>
              </th>
              <th className="py-2.5 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {displayedData.map((t, idx) => {
              const fam = families.find((f) => f.id_family === t.id_family);
              const mCount = machines.filter((m) => m.id_templates === t.id_templates).length;

              return (
                <tr key={t.id_templates} className="even:bg-slate-50/80 odd:bg-white hover:bg-slate-100/70 border-b border-slate-200/70 transition-colors">
                  {/* Row N° Column */}
                  <td className="py-3 px-3 text-center font-mono text-[11px] font-bold text-slate-400 bg-slate-100/40 border-r border-slate-200/80 shrink-0">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {t.id_templates}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 text-[13px]">
                    {t.libelle}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToFamilyFiltered(t.id_family)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-mono font-bold hover:bg-cyan-100 transition"
                      title="Voir cette Famille Parente"
                    >
                      <FolderTree className="w-3 h-3 text-cyan-600" />
                      <span>{t.id_family}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToMachinesByTemplate(t.id_family, t.id_templates)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-semibold transition group shadow-2xs"
                      title="Filtrer Machines : Famille + ce Template"
                    >
                      <Cpu className="w-3.5 h-3.5 text-amber-600" />
                      <span>{mCount} machines (Filtre ciblé)</span>
                      <ArrowRight className="w-3 h-3 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
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
            <h3 className="font-bold text-base text-slate-900 mb-1">+ Nouveau Template de Machine</h3>
            <p className="text-xs text-slate-500 mb-4">Ajoutez un modèle précis rattaché à une famille.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ID Template (ex: TPL-HYD200)</label>
                <input
                  type="text"
                  placeholder="TPL-HYD200"
                  value={form.id_templates}
                  onChange={(e) => setForm({ ...form, id_templates: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Libellé du Modèle</label>
                <input
                  type="text"
                  placeholder="Presse Hydraulique 200 Bars..."
                  value={form.libelle}
                  onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Famille Parente (Liaison)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      onOpenAddFamilyModal();
                    }}
                    className="text-[11px] text-cyan-700 hover:text-cyan-900 font-semibold inline-flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Créer Famille</span>
                  </button>
                </div>
                <CustomSelect
                  value={form.id_family}
                  onChange={(val) => setForm({ ...form, id_family: val })}
                  options={families.map((f) => ({
                    value: f.id_family,
                    label: `${f.libelle} (${f.id_family})`
                  }))}
                  placeholder="-- Choisir Famille --"
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
            <h3 className="font-bold text-base text-slate-900 mb-1">Modifier Template</h3>
            <form onSubmit={(e) => { e.preventDefault(); onUpdateTemplate(toEdit.id_templates, toEdit); setToEdit(null); }} className="space-y-3">
              <div><label className="text-[11px] font-bold text-slate-500">ID Template</label>
              <input type="text" value={toEdit.id_templates} disabled className="mt-1 w-full h-10 px-3 rounded-xl bg-slate-100 text-slate-500 text-xs font-mono" /></div>
              
              <div><label className="text-[11px] font-bold text-slate-500">Libellé</label>
              <input type="text" value={toEdit.libelle} onChange={(e) => setToEdit({ ...toEdit, libelle: e.target.value })} required className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs" /></div>
              
              <div>
                <label className="text-[11px] font-bold text-slate-500">Famille Parente</label>
                <CustomSelect
                  value={toEdit.id_family}
                  onChange={(val) => setToEdit({ ...toEdit, id_family: val })}
                  options={families.map((f) => ({ value: f.id_family, label: `${f.libelle} (${f.id_family})` }))}
                />
              </div>

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
            <h3 className="font-bold text-lg text-slate-900">Supprimer le template ?</h3></div>
            <p className="text-sm text-center text-slate-600">Confirmez-vous la suppression de <b>{toDelete.libelle}</b> ?</p>
            <div className="flex gap-2"><button onClick={() => setToDelete(null)} className="flex-1 h-10 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">Annuler</button>
            <button onClick={() => { onDeleteTemplate(toDelete.id_templates); setToDelete(null); }} className="flex-1 h-10 rounded-xl bg-rose-600 text-white text-xs font-semibold">Supprimer</button></div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
