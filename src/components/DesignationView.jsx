import React, { useState, useRef, useMemo, useEffect } from 'react';
import AnimatedPage from './AnimatedPage';
import CustomSelect from './CustomSelect';
import {
  Layers,
  Plus,
  Search,
  ArrowRight,
  Package,
  Tag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';

const TYPE_STYLES = {
  Foret: 'bg-amber-50 text-amber-700 border-amber-200',
  Tenaille: 'bg-slate-100 text-slate-700 border-slate-200',
  Cheville: 'bg-violet-50 text-violet-700 border-violet-200',
  Poinçon: 'bg-rose-50 text-rose-700 border-rose-200',
  Vis: 'bg-blue-50 text-blue-700 border-blue-200',
  Raccord: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Roulement: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Courroie: 'bg-orange-50 text-orange-700 border-orange-200',
  Capteur: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  teflon: 'bg-teal-50 text-teal-700 border-teal-200',
};

function getTypeStyle(typeStr) {
  if (!typeStr) return 'bg-cyan-50 text-cyan-800 border-cyan-200';
  const clean = String(typeStr).trim();
  const key = Object.keys(TYPE_STYLES).find((k) => k.toLowerCase() === clean.toLowerCase());
  return TYPE_STYLES[key] || 'bg-cyan-50 text-cyan-800 border-cyan-200';
}

export default function DesignationView({
  designations = [],
  types = [],
  stockItems = [],
  desigTypeFilter = 'ALL',
  setDesigTypeFilter,
  onAddDesignation,
  onUpdateDesignation,
  onDeleteDesignation,
  onOpenAddTypeModal,
  onNavigateToStockFilteredByRef,
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
  const [toEdit, setToEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState({
    id_type: '',
    ref: '',
    designation: '',
    stockInitial: 5,
    seuil: 3,
    emplacement: '',
  });

  // Filtered and sorted designations
  const filtered = designations
    .filter((d) => {
      if (
        desigTypeFilter !== 'ALL' &&
        d.id_type !== desigTypeFilter &&
        d.type !== desigTypeFilter
      ) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const r = String(d.ref || d.id_designation || '').toLowerCase();
        const name = String(d.designation || '').toLowerCase();
        const t = String(d.id_type || d.type || '').toLowerCase();
        return r.includes(q) || name.includes(q) || t.includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      const refA = String(a.ref || a.id_designation || '');
      const refB = String(b.ref || b.id_designation || '');
      return refA.localeCompare(refB, undefined, { numeric: true, sensitivity: 'base' });
    });

  const handleTypeSelect = (selectedType) => {
    if (!selectedType) return;
    const prefix =
      selectedType
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 10) || 'REF';

    // Find highest index among designations & stockItems for this prefix
    let maxIndex = 0;

    designations.forEach((d) => {
      const dType = d.id_type || d.type || '';
      const r = String(d.ref || d.id_designation || '');
      if (
        dType.toLowerCase() === selectedType.toLowerCase() ||
        r.toUpperCase().startsWith(prefix)
      ) {
        const match = r.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxIndex) maxIndex = num;
        }
      }
    });

    stockItems.forEach((s) => {
      const sType = s.id_type || s.type || '';
      const r = String(s.ref || '');
      if (
        sType.toLowerCase() === selectedType.toLowerCase() ||
        r.toUpperCase().startsWith(prefix)
      ) {
        const match = r.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxIndex) maxIndex = num;
        }
      }
    });

    const nextNumber = maxIndex + 1;
    const generatedRef = `${prefix}${String(nextNumber).padStart(3, '0')}`;

    setForm((prev) => ({
      ...prev,
      id_type: selectedType,
      ref: generatedRef,
    }));
  };

  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('id_diag');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortMenuRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, desigTypeFilter, sortField, sortOrder]);

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
    if (!form.id_type || !form.designation) return;

    onAddDesignation(form);
    setForm({
      id_type: '',
      ref: '',
      designation: '',
      stockInitial: 5,
      seuil: 3,
      emplacement: '',
    });
    setShowAddModal(false);
  };

  return (
    <AnimatedPage className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>Désignations d'Articles</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Équivalent des <b className="text-indigo-600">Templates</b> pour les machines: chaque
            Désignation est rattachée à un <b className="text-cyan-600">Type (Family)</b>.
          </p>
        </div>

        <button
          onClick={() => {
            const initialType =
              desigTypeFilter !== 'ALL'
                ? desigTypeFilter
                : types[0]?.id_type || types[0] || 'Foret';
            handleTypeSelect(initialType);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-black transition shadow-xs flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle Désignation</span>
        </button>
      </div>

      {/* Excel Formula Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Formule C (Type Parente)
            </div>
            <div className="font-mono text-xs text-cyan-700 font-semibold mt-0.5">
              =[@id_type] (Clé Type)
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-xs">
            C
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Formule D (Nb Articles Stock)
            </div>
            <div className="font-mono text-xs text-indigo-700 font-semibold mt-0.5">
              =COUNTIF(Stock_Actuel!C:C, [@designation])
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
            D
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Formule E (Quantité en Stock)
            </div>
            <div className="font-mono text-xs text-emerald-700 font-semibold mt-0.5">
              =SUMIF(Stock!C:C, [@designation], Stock!H:H)
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
            E
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Filtres & Tri de Données
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-slate-500">
              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold border border-indigo-100">
                {filtered.length} désignation{filtered.length > 1 ? 's' : ''} trouvée
                {filtered.length > 1 ? 's' : ''} / {designations.length} total
              </span>
            </div>
            {desigTypeFilter !== 'ALL' && (
              <button
                onClick={() => setDesigTypeFilter('ALL')}
                className="text-xs text-slate-500 hover:text-slate-900 underline font-medium cursor-pointer"
              >
                Réinitialiser filtre
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          {/* Search */}
          <div className="w-full">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Recherche
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par Ref (FORET001) ou Désignation..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Type Filter Select */}
          <div className="w-full">
            <CustomSelect
              label="Type Parente (Col C)"
              value={desigTypeFilter}
              onChange={(val) => setDesigTypeFilter(val)}
              options={[
                { value: 'ALL', label: `Tous les Types (${types.length})` },
                ...types.map((t) => {
                  const val = typeof t === 'string' ? t : t.id_type || t.libelle;
                  const label = typeof t === 'string' ? t : t.libelle || t.id_type;
                  return {
                    value: val,
                    label: `[C] ${label}`,
                  };
                }),
              ]}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full relative" ref={sortMenuRef}>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Tri des enregistrements
            </label>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`w-full h-10 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                showSortMenu || sortField !== 'id_diag' || sortOrder !== 'asc'
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300 ring-1 ring-indigo-200 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
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
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                    Trier par
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <button
                    onClick={() => {
                      if (sortField === 'id_diag') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('id_diag');
                        setSortOrder('asc');
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                      sortField === 'id_diag'
                        ? 'bg-indigo-50 text-indigo-800'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Diagnostic</span>
                    {sortField === 'id_diag' &&
                      (sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-indigo-600 shrink-0" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-indigo-600 shrink-0" />
                      ))}
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
                        ? 'bg-indigo-50 text-indigo-800'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Désignation</span>
                    {sortField === 'designation' &&
                      (sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-indigo-600 shrink-0" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-indigo-600 shrink-0" />
                      ))}
                  </button>

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
                        ? 'bg-indigo-50 text-indigo-800'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Type</span>
                    {sortField === 'id_type' &&
                      (sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-indigo-600 shrink-0" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-indigo-600 shrink-0" />
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
            Désignations • Ordre Excel Row 3 : B→G
          </div>
          <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
            ref | designation | type | stockActuel | alerte | emplacement
          </div>
        </div>

        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 text-[10.5px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12 text-slate-500 font-mono text-[10px] bg-slate-200/60 border-r border-slate-200 shrink-0">
                  N°
                </th>
                <th className="py-2.5 px-4">
                  <span>REF / ID</span>{' '}
                  <span className="text-slate-400 font-normal text-[10px]">(B)</span>
                </th>
                <th className="py-2.5 px-4 min-w-[220px]">
                  <span>DÉSIGNATION</span>{' '}
                  <span className="text-slate-400 font-normal text-[10px]">(C) primary</span>
                </th>
                <th className="py-2.5 px-4">
                  <span>TYPE</span>{' '}
                  <span className="text-slate-400 font-normal text-[10px]">(D)</span>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <span>STOCK ACTUEL</span>{' '}
                  <span className="text-slate-400 font-normal text-[10px]">(E)</span>
                </th>
                <th className="py-2.5 px-3 text-center">
                  <span>ÉTAT</span>{' '}
                  <span className="text-slate-400 font-normal text-[10px]">(F)</span>
                </th>
                <th className="py-2.5 px-4">
                  <span>EMPLACEMENT</span>{' '}
                  <span className="text-slate-400 font-normal text-[10px]">(G)</span>
                </th>
                <th className="py-2.5 px-4 text-center">Action</th>
                <th className="py-2.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {displayedData.map((item, idx) => {
                const stockMatch = stockItems.find(
                  (s) =>
                    s.ref === item.ref ||
                    (s.designation && String(s.designation).toLowerCase() === String(item.designation || '').toLowerCase())
                );

                const currentStock = stockMatch ? stockMatch.stockActuel : item.stockInitial || 0;
                const threshold = stockMatch ? stockMatch.seuil : item.seuil || 3;
                const alertStatus = stockMatch
                  ? stockMatch.alerte
                  : currentStock <= 0
                    ? 'RUPTURE'
                    : currentStock <= threshold
                      ? 'ALERTE'
                      : 'OK';
                const location = stockMatch ? stockMatch.emplacement : item.emplacement || 'A1-R1';
                const typeName = item.id_type || item.type || 'Standard';

                return (
                  <tr
                    key={item.ref || item.id_designation || idx}
                    className="even:bg-slate-50/80 odd:bg-white hover:bg-slate-100/70 border-b border-slate-200/70 transition-colors"
                  >
                    {/* Row N° Column */}
                    <td className="py-2.5 px-3 text-center font-mono text-[11px] font-bold text-slate-400 bg-slate-100/40 border-r border-slate-200/80 shrink-0">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11.5px]">
                        {item.ref || item.id_designation}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 text-[13px]">
                      {item.designation}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setDesigTypeFilter(typeName)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold transition ${getTypeStyle(typeName)}`}
                        title="Filtrer par ce Type"
                      >
                        <Tag className="w-3 h-3 opacity-70" />
                        <span>{typeName}</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 text-[13px]">
                      {currentStock}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {alertStatus === 'RUPTURE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          <span>RUPTURE</span>
                        </span>
                      )}
                      {alertStatus === 'ALERTE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>ALERTE</span>
                        </span>
                      )}
                      {alertStatus === 'OK' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>OK</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{location}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          onNavigateToStockFilteredByRef &&
                          onNavigateToStockFilteredByRef(item.ref || item.designation)
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white hover:bg-black text-xs font-medium transition"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Voir Stock</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setToEdit({ ...item })}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setToDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
            <h3 className="font-bold text-base text-slate-900 mb-1">
              + Nouvelle Désignation (Template)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Désignation d'article associée à un Type parent (ex: FORET001 → Foret Beton Ø12).
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Type Parent (Category)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      onOpenAddTypeModal();
                    }}
                    className="text-[11px] font-semibold text-cyan-600 hover:underline"
                  >
                    + Créer un Type
                  </button>
                </div>
                <CustomSelect
                  value={form.id_type}
                  onChange={(val) => handleTypeSelect(val)}
                  options={types.map((t) => {
                    const val = typeof t === 'string' ? t : t.id_type || t.libelle;
                    const label = typeof t === 'string' ? t : t.libelle || t.id_type;
                    return {
                      value: val,
                      label: label,
                    };
                  })}
                  placeholder="-- Sélectionner un Type --"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  ID / Code Référence (Auto)
                </label>
                <input
                  type="text"
                  value={form.ref}
                  onChange={(e) => setForm({ ...form, ref: e.target.value })}
                  placeholder="FORET001"
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Désignation d'Article
                </label>
                <input
                  type="text"
                  placeholder="Foret Beton Ø12, Cheville Ø10..."
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Stock Initial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stockInitial}
                    onChange={(e) => setForm({ ...form, stockInitial: Number(e.target.value) })}
                    className="mt-1 w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Seuil
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.seuil}
                    onChange={(e) => setForm({ ...form, seuil: Number(e.target.value) })}
                    className="mt-1 w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Emplacement
                  </label>
                  <input
                    type="text"
                    placeholder="A1-R02"
                    value={form.emplacement}
                    onChange={(e) => setForm({ ...form, emplacement: e.target.value })}
                    className="mt-1 w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                  />
                </div>
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
            <h3 className="font-bold text-base text-slate-900 mb-1">Modifier Désignation</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateDesignation(toEdit.ref, toEdit);
                setToEdit(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] font-bold text-slate-500">
                  ID / Réf (Désignation)
                </label>
                <input
                  type="text"
                  value={toEdit.ref}
                  disabled
                  className="mt-1 w-full h-10 px-3 rounded-xl bg-slate-100 text-slate-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500">
                  Désignation (Libellé)
                </label>
                <input
                  type="text"
                  value={toEdit.designation}
                  onChange={(e) => setToEdit({ ...toEdit, designation: e.target.value })}
                  required
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500">
                  Type de Pièce / Article
                </label>
                <CustomSelect
                  value={toEdit.id_type || toEdit.type}
                  onChange={(val) => setToEdit({ ...toEdit, id_type: val, type: val })}
                  options={types.map((t) => ({
                    value: t.id_type,
                    label: `${t.libelle} (${t.id_type})`,
                  }))}
                  placeholder="-- Sélectionner le type --"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500">
                    Stock Initial (Opt)
                  </label>
                  <input
                    type="number"
                    value={toEdit.stockInitial || 0}
                    onChange={(e) => setToEdit({ ...toEdit, stockInitial: e.target.value })}
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500">Seuil Alerte</label>
                  <input
                    type="number"
                    value={toEdit.seuil || 0}
                    onChange={(e) => setToEdit({ ...toEdit, seuil: e.target.value })}
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500">Emplacement</label>
                <input
                  type="text"
                  value={toEdit.emplacement || ''}
                  onChange={(e) => setToEdit({ ...toEdit, emplacement: e.target.value })}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="w-8 h-8 text-rose-600 mb-2" />
              <h3 className="font-bold text-lg text-slate-900">Supprimer la désignation ?</h3>
            </div>
            <p className="text-sm text-center text-slate-600">
              Confirmez-vous la suppression de <b>{toDelete.ref}</b> ? Cette opération est liée au
              Stock Initial.
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
                  onDeleteDesignation(toDelete.ref);
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
