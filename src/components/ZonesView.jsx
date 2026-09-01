import React, { useState, useRef, useMemo, useEffect } from 'react';
import AnimatedPage from './AnimatedPage';
import {
  MapPin,
  Plus,
  Search,
  ArrowRight,
  Users,
  Wrench,
  Cpu,
  Trash2,
  Edit2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';

export default function ZonesView({
  zones,
  technicians,
  operations,
  machines,
  onAddZone,
  onUpdateZone,
  onDeleteZone,
  onNavigateToTechsByZone,
  onNavigateToOpsByZone,
  onNavigateToMachinesByZone,
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
  const [form, setForm] = useState({ id_zone: '', libelle: '' });
  const [toEdit, setToEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const filtered = zones.filter((z) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(z?.id_zone || '').toLowerCase().includes(q) ||
      String(z?.libelle || '').toLowerCase().includes(q)
    );
  });

  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('id_zone');
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
      return (
        <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition shrink-0" />
      );
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-cyan-700 shrink-0 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-cyan-700 shrink-0 font-bold" />
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id_zone || !form.libelle) return;
    onAddZone(form);
    setForm({ id_zone: '', libelle: '' });
    setShowAddModal(false);
  };

  return (
    <AnimatedPage className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-purple-600 shrink-0" />
            <span>Zones & Ateliers de Production</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Point de départ du workflow. Cliquez sur <b className="text-blue-600">Nb Techs</b>,{' '}
            <b className="text-indigo-600">Nb Ops</b> ou{' '}
            <b className="text-emerald-600">Nb Machines</b> pour naviguer vers les listes filtrées.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-black transition shadow-xs flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle Zone</span>
        </button>
      </div>

      {/* Excel Formula Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Formule D (Techniciens)
            </div>
            <div className="font-mono text-xs text-blue-700 font-semibold mt-0.5">
              =COUNTIF(Techniciens!D:D, [@id_zone])
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
            D
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Formule E (Opérations)
            </div>
            <div className="font-mono text-xs text-indigo-700 font-semibold mt-0.5">
              =COUNTIF(Operations!D:D, [@id_zone])
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
            E
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Formule F (Machines)
            </div>
            <div className="font-mono text-xs text-emerald-700 font-semibold mt-0.5">
              =COUNTIF(Machines!F:F, [@id_zone])
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
            F
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Filtres & Tri de Données
            </span>
          </div>
          {/* Displaying the filtered count */}
          <div className="text-xs font-semibold text-slate-500">
            <span className="bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-lg font-bold border border-cyan-100">
              {filtered.length} zone{filtered.length > 1 ? 's' : ''} trouvée
              {filtered.length > 1 ? 's' : ''}
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
                placeholder="Rechercher une zone (Code, libellé)..."
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
                showSortMenu || sortField !== 'id_zone' || sortOrder !== 'asc'
                  ? 'bg-cyan-50 text-cyan-800 border-cyan-300 ring-1 ring-cyan-200 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-cyan-600" />
                <span>
                  Tri : <b className="font-mono text-slate-900">{sortField.toUpperCase()}</b> (
                  {sortOrder === 'asc' ? 'A→Z' : 'Z→A'})
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`}
              />
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
                      if (sortField === 'id_zone') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('id_zone');
                        setSortOrder('asc');
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                      sortField === 'id_zone'
                        ? 'bg-cyan-50 text-cyan-800'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Code Zone (ID)</span>
                    {sortField === 'id_zone' &&
                      (sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-cyan-600 shrink-0" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-cyan-600 shrink-0" />
                      ))}
                  </button>

                  <button
                    onClick={() => {
                      if (sortField === 'libelle') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('libelle');
                        setSortOrder('asc');
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                      sortField === 'libelle'
                        ? 'bg-cyan-50 text-cyan-800'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Libellé / Description</span>
                    {sortField === 'libelle' &&
                      (sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-cyan-600 shrink-0" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-cyan-600 shrink-0" />
                      ))}
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
            Zones • Ordre Excel Row 3 : B→F
          </div>
          <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
            id_zone | libelle | nb_techniciens | nb_operations | nb_machines
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-[10.5px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 text-center w-12 text-slate-500 font-mono text-[10px] bg-slate-200/60 border-r border-slate-200 shrink-0">
                N°
              </th>
              <th className="py-2.5 px-4">
                <span>CODE ZONE</span>{' '}
                <span className="text-slate-400 font-normal text-[10px]">(B)</span>
              </th>
              <th className="py-2.5 px-4">
                <span>LIBELLÉ SECTEUR / ATELIER</span>{' '}
                <span className="text-slate-400 font-normal text-[10px]">(C) primary</span>
              </th>
              <th className="py-2.5 px-4">
                <span>TECHNICIENS AFFECTÉS</span>{' '}
                <span className="text-slate-400 font-normal text-[10px]">(D)</span>
              </th>
              <th className="py-2.5 px-4">
                <span>OPÉRATIONS DÉFINIES</span>{' '}
                <span className="text-slate-400 font-normal text-[10px]">(E)</span>
              </th>
              <th className="py-2.5 px-4">
                <span>MACHINES INSTALLÉES</span>{' '}
                <span className="text-slate-400 font-normal text-[10px]">(F)</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {displayedData.map((z, idx) => {
              const tCount = technicians.filter((t) => t.id_zone === z.id_zone).length;
              const opCount = operations.filter((op) => op.id_zone === z.id_zone).length;
              const mCount = machines.filter((m) => m.id_zone_default === z.id_zone).length;

              return (
                <tr
                  key={z.id_zone}
                  className="even:bg-slate-50/80 odd:bg-white hover:bg-slate-100/70 border-b border-slate-200/70 transition-colors"
                >
                  {/* Row N° Column */}
                  <td className="py-3 px-3 text-center font-mono text-[11px] font-bold text-slate-400 bg-slate-100/40 border-r border-slate-200/80 shrink-0">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {z.id_zone}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 text-[13px]">
                    {z.libelle}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToTechsByZone(z.id_zone)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition group shadow-2xs"
                      title="Voir les techniciens de cette zone"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>{tCount} techs</span>
                      <ArrowRight className="w-3 h-3 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToOpsByZone(z.id_zone)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold transition group shadow-2xs"
                      title="Voir les opérations de cette zone"
                    >
                      <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{opCount} ops</span>
                      <ArrowRight className="w-3 h-3 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToMachinesByZone(z.id_zone)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition group shadow-2xs"
                      title="Voir les machines installées dans cette zone"
                    >
                      <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{mCount} machines</span>
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

      {/* Pagination Footer */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">Lignes par page :</span>
          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            {[100, 200, 500, 0].map((size) => (
              <button
                key={size}
                onClick={() => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
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
            Affichage <b className="text-slate-900">{totalItems === 0 ? 0 : startIndex + 1}</b> à{' '}
            <b className="text-slate-900">{Math.min(startIndex + effectivePageSize, totalItems)}</b>{' '}
            sur <b className="text-slate-900">{totalItems}</b>
          </div>
          {pageSize !== 0 && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
            <h3 className="font-bold text-base text-slate-900 mb-1">+ Nouvelle Zone / Atelier</h3>
            <p className="text-xs text-slate-500 mb-4">
              Créez une zone géographique ou un secteur d'usine.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Code Zone (ex: ZONE-FIN)
                </label>
                <input
                  type="text"
                  placeholder="ZONE-FIN"
                  value={form.id_zone}
                  onChange={(e) => setForm({ ...form, id_zone: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold uppercase"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Libellé Secteur / Atelier
                </label>
                <input
                  type="text"
                  placeholder="Atelier Finition & Peinture..."
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
            <h3 className="font-bold text-base text-slate-900 mb-1">Modifier Zone</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateZone(toEdit.id_zone, toEdit);
                setToEdit(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] font-bold text-slate-500">ID Zone</label>
                <input
                  type="text"
                  value={toEdit.id_zone}
                  disabled
                  className="mt-1 w-full h-10 px-3 rounded-xl bg-slate-100 text-slate-500 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500">Libellé</label>
                <input
                  type="text"
                  value={toEdit.libelle}
                  onChange={(e) => setToEdit({ ...toEdit, libelle: e.target.value })}
                  required
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setToEdit(null)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 text-xs font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-5 space-y-4">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="w-8 h-8 text-rose-600 mb-2" />
              <h3 className="font-bold text-lg text-slate-900">Supprimer la zone ?</h3>
            </div>
            <p className="text-sm text-center text-slate-600">
              Confirmez-vous la suppression de <b>{toDelete.libelle}</b> ? Les liaisons avec cette
              zone pourraient être rompues.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setToDelete(null)}
                className="flex-1 h-10 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDeleteZone(toDelete.id_zone);
                  setToDelete(null);
                }}
                className="flex-1 h-10 rounded-xl bg-rose-600 text-white text-xs font-semibold"
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
