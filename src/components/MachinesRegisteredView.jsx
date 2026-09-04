import React, { useState, useRef, useMemo, useEffect } from 'react';
import AnimatedPage from './AnimatedPage';
import CustomSelect from './CustomSelect';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  ArrowRight,
  MapPin,
  Users,
  FolderTree,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
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

export default function MachinesRegisteredView({
  machines,
  families,
  templates,
  zones,
  technicians,
  mouvements,
  mchFamilyFilter,
  setMchFamilyFilter,
  mchTemplateFilter,
  setMchTemplateFilter,
  mchZoneFilter,
  setMchZoneFilter,
  mchSearch,
  setMchSearch,
  onOpenAddMachine,
  onNavigateToFamily,
  onNavigateToTemplate,
  onNavigateToZone,
  onUpdateMachine,
  onDeleteMachine,
}) {
  const [toEdit, setToEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  // Debounce state for high-performance machine searching
  const [localSearch, setLocalSearch] = useState(mchSearch);

  // Sync from parent
  useEffect(() => {
    setLocalSearch(mchSearch);
  }, [mchSearch]);

  // Propagate to parent with 200ms debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setMchSearch(localSearch);
    }, 200);
    return () => clearTimeout(handler);
  }, [localSearch, setMchSearch]);

  // Only show families that have registered machines
  const machineFamilies = useMemo(() => {
    const usedFamilyIds = new Set(machines.map((m) => m.id_family).filter(Boolean));
    return families.filter((f) => usedFamilyIds.has(f.id_family));
  }, [families, machines]);

  // Cascading templates based on selected family and existing registered machines
  const availableTemplates = useMemo(() => {
    let relTemplates = templates;
    if (mchFamilyFilter !== 'ALL') {
      relTemplates = templates.filter((t) => t.id_family === mchFamilyFilter);
    }
    const usedTemplateIds = new Set(machines.map((m) => m.id_templates).filter(Boolean));
    return relTemplates.filter((t) => usedTemplateIds.has(t.id_templates));
  }, [templates, mchFamilyFilter, machines]);

  const filteredMachines = useMemo(() => {
    return machines.filter((m) => {
      if (mchFamilyFilter !== 'ALL' && m.id_family !== mchFamilyFilter) return false;
      if (mchTemplateFilter !== 'ALL' && m.id_templates !== mchTemplateFilter) return false;
      if (mchZoneFilter !== 'ALL' && m.id_zone_default !== mchZoneFilter) return false;
      if (mchSearch) {
        const q = String(mchSearch).trim().toLowerCase();
        return (
          String(m.id_machine_registered || '').toLowerCase().includes(q) ||
          String(m.designation || '').toLowerCase().includes(q) ||
          String(m.id_family || '').toLowerCase().includes(q) ||
          String(m.id_templates || '').toLowerCase().includes(q) ||
          String(m.id_zone_default || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [machines, mchFamilyFilter, mchTemplateFilter, mchZoneFilter, mchSearch]);

  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('id_machine_registered');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortMenuRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [mchSearch, mchFamilyFilter, mchTemplateFilter, mchZoneFilter, sortField, sortOrder]);

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
    if (!sortField) return filteredMachines;
    return [...filteredMachines].sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredMachines, sortField, sortOrder]);

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

  return (
    <AnimatedPage className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Machines Registered (Équipements & Lignes)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tableau centralisé miroir de Stock. Intègre <b className="text-cyan-600">Famille</b>,{' '}
            <b className="text-amber-600">Template</b>, <b className="text-purple-600">Zone</b> et{' '}
            <b className="text-blue-600">Technicien</b> avec badges interactifs.
          </p>
        </div>

        <button
          onClick={onOpenAddMachine}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-black transition shadow-xs flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle Machine Registered</span>
        </button>
      </div>

      {/* Excel Formula Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Liaison Famille (D)
            </div>
            <div className="text-[11px] font-mono font-semibold text-cyan-700 mt-0.5">
              =[@id_family] → Family!B:B
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan-700">
            Liaison D
          </span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Liaison Template (E)
            </div>
            <div className="text-[11px] font-mono font-semibold text-amber-700 mt-0.5">
              =[@id_templates] → Template!B:B
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700">
            Liaison E
          </span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Liaison Zone Défaut (F)
            </div>
            <div className="text-[11px] font-mono font-semibold text-purple-700 mt-0.5">
              =[@id_zone_default] → Zone!B:B
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700">
            Liaison F
          </span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Interventions / Sorties
            </div>
            <div className="text-[11px] font-mono font-semibold text-rose-700 mt-0.5">
              =COUNTIF(Mvt[Machine], [@id_machine])
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700">
            Traçabilité
          </span>
        </div>
      </div>

      {/* Filter Bar with Cascading Selects */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Filtres & Tri de Données
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-slate-500">
              <span className="bg-cyan-50 text-cyan-800 px-2.5 py-1 rounded-lg font-bold border border-cyan-100">
                {filteredMachines.length} machine{filteredMachines.length > 1 ? 's' : ''} trouvée
                {filteredMachines.length > 1 ? 's' : ''} / {machines.length} total
              </span>
            </div>
            {(mchFamilyFilter !== 'ALL' ||
              mchTemplateFilter !== 'ALL' ||
              mchZoneFilter !== 'ALL' ||
              localSearch) && (
              <button
                onClick={() => {
                  setMchFamilyFilter('ALL');
                  setMchTemplateFilter('ALL');
                  setMchZoneFilter('ALL');
                  setLocalSearch('');
                }}
                className="text-xs text-slate-500 hover:text-slate-900 underline font-medium cursor-pointer"
              >
                Réinitialiser filtres
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Search */}
          <div className="w-full">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Recherche
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher (Code, désignation, zone)..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="relative" ref={sortMenuRef}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`h-9 px-3 rounded-xl border text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                showSortMenu || sortField !== 'id_machine_registered' || sortOrder !== 'asc'
                  ? 'bg-cyan-50 text-cyan-800 border-cyan-300 ring-1 ring-cyan-200 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden sm:inline">
                Tri : <b className="font-mono text-slate-900">{sortField.toUpperCase()}</b> (
                {sortOrder === 'asc' ? 'A→Z' : 'Z→A'})
              </span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`}
              />
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
                      if (sortField === 'id_machine_registered') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('id_machine_registered');
                        setSortOrder('asc');
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                      sortField === 'id_machine_registered'
                        ? 'bg-cyan-50 text-cyan-800'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>ID Machine</span>
                    {sortField === 'id_machine_registered' &&
                      (sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-cyan-600 shrink-0" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-cyan-600 shrink-0" />
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
                        ? 'bg-cyan-50 text-cyan-800'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Désignation</span>
                    {sortField === 'designation' &&
                      (sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-cyan-600 shrink-0" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-cyan-600 shrink-0" />
                      ))}
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
                    {sortField === 'id_family' &&
                      (sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-cyan-600 shrink-0" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-cyan-600 shrink-0" />
                      ))}
                  </button>

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
                    {sortField === 'id_templates' &&
                      (sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-cyan-600 shrink-0" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-cyan-600 shrink-0" />
                      ))}
                  </button>

                  <button
                    onClick={() => {
                      if (sortField === 'id_zone_default') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('id_zone_default');
                        setSortOrder('asc');
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                      sortField === 'id_zone_default'
                        ? 'bg-cyan-50 text-cyan-800'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Zone</span>
                    {sortField === 'id_zone_default' &&
                      (sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-cyan-600 shrink-0" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-cyan-600 shrink-0" />
                      ))}
                  </button>

                  <button
                    onClick={() => {
                      if (sortField === 'technician') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('technician');
                        setSortOrder('asc');
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                      sortField === 'technician'
                        ? 'bg-cyan-50 text-cyan-800'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Technicien</span>
                    {sortField === 'technician' &&
                      (sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-cyan-600 shrink-0" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-cyan-600 shrink-0" />
                      ))}
                  </button>

                  <button
                    onClick={() => {
                      if (sortField === 'status') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('status');
                        setSortOrder('asc');
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                      sortField === 'status'
                        ? 'bg-cyan-50 text-cyan-800'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Statut</span>
                    {sortField === 'status' &&
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

          {/* Family Filter */}
          <div className="w-48">
            <CustomSelect
              value={mchFamilyFilter}
              onChange={(val) => {
                setMchFamilyFilter(val);
                setMchTemplateFilter('ALL');
              }}
              options={[
                { value: 'ALL', label: `Toutes les Familles (${machineFamilies.length})` },
                ...machineFamilies.map((f) => ({
                  value: f.id_family,
                  label: `[D] ${f.libelle} (${f.id_family})`,
                })),
              ]}
            />
          </div>

          {/* Cascading Template Filter */}
          <div className="w-52">
            <CustomSelect
              value={mchTemplateFilter}
              onChange={(val) => setMchTemplateFilter(val)}
              options={[
                { value: 'ALL', label: `Tous les Templates (E) (${availableTemplates.length})` },
                ...availableTemplates.map((t) => ({
                  value: t.id_templates,
                  label: `[E] ${t.libelle} (${t.id_templates})`,
                })),
              ]}
            />
          </div>

          {/* Zone Filter */}
          <div className="w-48">
            <CustomSelect
              value={mchZoneFilter}
              onChange={(val) => setMchZoneFilter(val)}
              options={[
                { value: 'ALL', label: `Toutes les Zones (F) (${zones.length})` },
                ...zones.map((z) => ({
                  value: z.id_zone,
                  label: `[F] ${z.libelle} (${z.id_zone})`,
                })),
              ]}
            />
          </div>

          {(mchFamilyFilter !== 'ALL' ||
            mchTemplateFilter !== 'ALL' ||
            mchZoneFilter !== 'ALL' ||
            mchSearch) && (
            <button
              onClick={() => {
                setMchFamilyFilter('ALL');
                setMchTemplateFilter('ALL');
                setMchZoneFilter('ALL');
                setMchSearch('');
              }}
              className="text-xs text-slate-500 hover:text-slate-900 underline font-medium px-1"
            >
              Effacer filtres
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Affichage : <b className="text-slate-900">{filteredMachines.length}</b> /{' '}
          {machines.length} machines
        </div>
      </div>

      {/* Main Table with Sticky Header, Zebra & Scroll 60vh */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Top Info Header Bar inside Card */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50/50 gap-2">
          <div className="font-bold text-slate-800 text-[13px]">
            Machines_Registered • Ordre Excel Row 3 : B→H
          </div>
          <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
            id_machine_registered | designation | id_family | id_templates | id_zone_default |
            technician | status
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[940px]">
            <thead className="sticky top-0 bg-slate-100 text-[10.5px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 z-10 shadow-2xs">
              <tr>
                <th className="py-2.5 px-3 text-center w-12 text-slate-500 font-mono text-[10px] bg-slate-200/60 border-r border-slate-200 shrink-0">
                  N°
                </th>
                <th className="py-2.5 px-4">
                  <span>CDE CODE</span>{' '}
                  <span className="text-slate-400 font-normal text-[10px]">(B)</span>
                </th>
                <th className="py-2.5 px-4">
                  <span>DÉSIGNATION</span>{' '}
                  <span className="text-slate-400 font-normal text-[10px]">(C) primary</span>
                </th>
                <th className="py-2.5 px-3">
                  <span>FAMILY</span>{' '}
                  <span className="text-slate-400 font-normal text-[10px]">(D)</span>
                </th>
                <th className="py-2.5 px-3">
                  <span>TEMPLATE</span>{' '}
                  <span className="text-slate-400 font-normal text-[10px]">(E)</span>
                </th>
                <th className="py-2.5 px-3">
                  <span>ZONE</span>{' '}
                  <span className="text-slate-400 font-normal text-[10px]">(F)</span>
                </th>
                <th className="py-2.5 px-3">
                  <span>TECHNICIAN</span>{' '}
                  <span className="text-slate-400 font-normal text-[10px]">(G)</span>
                </th>
                <th className="py-2.5 px-3 text-center">
                  <span>STATUS</span>{' '}
                  <span className="text-slate-400 font-normal text-[10px]">(H)</span>
                </th>
                <th className="py-2.5 px-4 text-right">Interventions</th>
                <th className="py-2.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {displayedData.map((m, idx) => {
                const fam = families.find((f) => f.id_family === m.id_family);
                const tpl = templates.find((t) => t.id_templates === m.id_templates);
                const zn = zones.find((z) => z.id_zone === m.id_zone_default);
                const tech = technicians.find((t) => t.id_technician === m.technician);
                const sortiesCount = mouvements.filter(
                  (x) => x.id_machine_registered === m.id_machine_registered
                ).length;

                return (
                  <tr
                    key={m.id_machine_registered}
                    className="even:bg-slate-50/80 odd:bg-white hover:bg-emerald-50/50 border-b border-slate-200/70 transition-colors"
                  >
                    {/* Row N° Column */}
                    <td className="py-3 px-3 text-center font-mono text-[11px] font-bold text-slate-400 bg-slate-100/40 border-r border-slate-200/80 shrink-0">
                      {idx + 1}
                    </td>

                    {/* Cde Machine */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {m.id_machine_registered}
                      </span>
                    </td>

                    {/* Désignation */}
                    <td className="py-3 px-4 font-semibold text-slate-800 text-[13px] whitespace-nowrap">
                      {m.designation}
                    </td>

                    {/* Family (Badge Cyan) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setMchFamilyFilter(m.id_family);
                          setMchTemplateFilter('ALL');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px] font-mono font-bold hover:bg-cyan-100 transition"
                        title="Filtrer par cette Famille"
                      >
                        <FolderTree className="w-3 h-3 text-cyan-600" />
                        <span>{m.id_family}</span>
                      </button>
                    </td>

                    {/* Template (Badge Amber) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setMchFamilyFilter(m.id_family);
                          setMchTemplateFilter(m.id_templates);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold hover:bg-amber-100 transition"
                        title="Filtrer par ce Template"
                      >
                        <Layers className="w-3 h-3 text-amber-600" />
                        <span>{tpl ? tpl.libelle : m.id_templates}</span>
                      </button>
                    </td>

                    {/* Zone */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={() => setMchZoneFilter(m.id_zone_default)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-medium hover:bg-purple-100 transition"
                        title="Filtrer par cette Zone"
                      >
                        <MapPin className="w-3 h-3 text-purple-600" />
                        <span>{zn ? zn.libelle : m.id_zone_default || 'Atelier'}</span>
                      </button>
                    </td>

                    {/* Technician */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-medium">
                        <Users className="w-3 h-3 text-blue-600" />
                        <span>
                          {tech
                            ? `${tech.id_technician} (${tech.nom})`
                            : m.technician || 'Non assigné'}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'En Service'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : m.status === 'En Maintenance'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {m.status === 'En Service' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        <span>{m.status || 'En Service'}</span>
                      </span>
                    </td>

                    {/* Interventions Count */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                      {sortiesCount} sorties
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setToEdit({ ...m })}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setToDelete(m)}
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

      {toEdit && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">Modifier Machine</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateMachine(toEdit.id_machine_registered, toEdit);
                setToEdit(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] font-bold text-slate-500">ID Machine</label>
                <input
                  type="text"
                  value={toEdit.id_machine_registered}
                  disabled
                  className="mt-1 w-full h-10 px-3 rounded-xl bg-slate-100 text-slate-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500">Désignation</label>
                <input
                  type="text"
                  value={toEdit.designation}
                  onChange={(e) => setToEdit({ ...toEdit, designation: e.target.value })}
                  required
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500">Famille</label>
                  <CustomSelect
                    value={toEdit.id_family}
                    onChange={(val) => {
                      setToEdit({ ...toEdit, id_family: val, id_templates: '' });
                    }}
                    options={families.map((f) => ({ value: f.id_family, label: f.id_family }))}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500">Modèle (Template)</label>
                  <CustomSelect
                    value={toEdit.id_templates}
                    onChange={(val) => setToEdit({ ...toEdit, id_templates: val })}
                    options={templates
                      .filter((t) => t.id_family === toEdit.id_family)
                      .map((t) => ({ value: t.id_templates, label: t.id_templates }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500">Zone par Défaut</label>
                  <CustomSelect
                    value={toEdit.id_zone_default}
                    onChange={(val) => setToEdit({ ...toEdit, id_zone_default: val })}
                    options={zones.map((z) => ({ value: z.id_zone, label: z.id_zone }))}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500">Technicien</label>
                  <CustomSelect
                    value={toEdit.technician}
                    onChange={(val) => setToEdit({ ...toEdit, technician: val })}
                    options={technicians.map((t) => ({ value: t.nom, label: t.nom }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500">Statut</label>
                <CustomSelect
                  value={toEdit.status || 'En Service'}
                  onChange={(val) => setToEdit({ ...toEdit, status: val })}
                  options={[
                    { value: 'En Service', label: 'En Service' },
                    { value: 'En Panne', label: 'En Panne' },
                    { value: 'Arrêt', label: 'Arrêt' },
                  ]}
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
              <h3 className="font-bold text-lg text-slate-900">Supprimer la machine ?</h3>
            </div>
            <p className="text-sm text-center text-slate-600">
              Confirmez-vous la suppression de <b>{toDelete.id_machine_registered}</b> ?
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
                  onDeleteMachine(toDelete.id_machine_registered);
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
