import React, { useState, useRef, useMemo, useEffect } from 'react';
import AnimatedPage from './AnimatedPage';
import CustomSelect from './CustomSelect';
import {
  Factory,
  Plus,
  Search,
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
  Boxes,
  Activity,
  Cpu,
  Sparkles,
  ShieldCheck,
  X,
  Radio,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

export default function MachinesRegisteredView({
  machines = [],
  families = [],
  templates = [],
  zones = [],
  technicians = [],
  mouvements = [],
  mchFamilyFilter = 'ALL',
  setMchFamilyFilter = () => {},
  mchTemplateFilter = 'ALL',
  setMchTemplateFilter = () => {},
  mchZoneFilter = 'ALL',
  setMchZoneFilter = () => {},
  mchSearch = '',
  setMchSearch = () => {},
  onOpenAddMachine = () => {},
  onNavigateToFamily = () => {},
  onNavigateToTemplate = () => {},
  onNavigateToZone = () => {},
  onUpdateMachine = () => {},
  onDeleteMachine = () => {},
}) {
  const [toEdit, setToEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | 'En Service' | 'En Maintenance' | 'Arrêt'

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

  // Calculate Interventions Count Map per Machine for high efficiency
  const sortiesCountMap = useMemo(() => {
    const map = {};
    mouvements.forEach((m) => {
      if (m.id_machine_registered) {
        map[m.id_machine_registered] = (map[m.id_machine_registered] || 0) + 1;
      }
    });
    return map;
  }, [mouvements]);

  // KPI Statistics
  const kpis = useMemo(() => {
    const total = machines.length;
    let enService = 0;
    let enMaintenance = 0;
    let enArret = 0;

    machines.forEach((m) => {
      const st = String(m.status || 'En Service').toLowerCase();
      if (st.includes('service')) enService++;
      else if (st.includes('maint') || st.includes('panne')) enMaintenance++;
      else enArret++;
    });

    const activeFamiliesCount = new Set(machines.map((m) => m.id_family).filter(Boolean)).size;
    const totalInterventions = Object.values(sortiesCountMap).reduce((a, b) => a + b, 0);

    return {
      total,
      enService,
      enMaintenance,
      enArret,
      activeFamiliesCount,
      totalInterventions,
    };
  }, [machines, sortiesCountMap]);

  // Filtering
  const filteredMachines = useMemo(() => {
    return machines.filter((m) => {
      if (mchFamilyFilter !== 'ALL' && m.id_family !== mchFamilyFilter) return false;
      if (mchTemplateFilter !== 'ALL' && m.id_templates !== mchTemplateFilter) return false;
      if (mchZoneFilter !== 'ALL' && m.id_zone_default !== mchZoneFilter) return false;
      if (statusFilter !== 'ALL') {
        const st = String(m.status || 'En Service').toLowerCase();
        if (statusFilter === 'En Service' && !st.includes('service')) return false;
        if (statusFilter === 'En Maintenance' && !st.includes('maint') && !st.includes('panne')) return false;
        if (statusFilter === 'Arrêt' && (st.includes('service') || st.includes('maint') || st.includes('panne'))) return false;
      }
      if (mchSearch) {
        const q = String(mchSearch).trim().toLowerCase();
        const techObj = technicians.find((t) => t.id_technician === m.technician || t.nom === m.technician);
        const techName = techObj ? techObj.nom.toLowerCase() : '';
        const znObj = zones.find((z) => z.id_zone === m.id_zone_default);
        const znName = znObj ? znObj.libelle.toLowerCase() : '';

        return (
          String(m.id_machine_registered || '').toLowerCase().includes(q) ||
          String(m.designation || '').toLowerCase().includes(q) ||
          String(m.id_family || '').toLowerCase().includes(q) ||
          String(m.id_templates || '').toLowerCase().includes(q) ||
          String(m.id_zone_default || '').toLowerCase().includes(q) ||
          String(m.technician || '').toLowerCase().includes(q) ||
          techName.includes(q) ||
          znName.includes(q)
        );
      }
      return true;
    });
  }, [machines, mchFamilyFilter, mchTemplateFilter, mchZoneFilter, statusFilter, mchSearch, technicians, zones]);

  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('id_machine_registered');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortMenuRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [mchSearch, mchFamilyFilter, mchTemplateFilter, mchZoneFilter, statusFilter, sortField, sortOrder]);

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
      if (sortField === 'sorties') {
        const cntA = sortiesCountMap[a.id_machine_registered] || 0;
        const cntB = sortiesCountMap[b.id_machine_registered] || 0;
        return sortOrder === 'asc' ? cntA - cntB : cntB - cntA;
      }
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredMachines, sortField, sortOrder, sortiesCountMap]);

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
      <ArrowUp className="w-3 h-3 text-emerald-700 shrink-0 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-emerald-700 shrink-0 font-bold" />
    );
  };

  const hasActiveFilters =
    mchFamilyFilter !== 'ALL' ||
    mchTemplateFilter !== 'ALL' ||
    mchZoneFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    localSearch;

  const clearAllFilters = () => {
    setMchFamilyFilter('ALL');
    setMchTemplateFilter('ALL');
    setMchZoneFilter('ALL');
    setStatusFilter('ALL');
    setLocalSearch('');
  };

  return (
    <AnimatedPage className="space-y-5">
      {/* Top Banner with Refined Excel Layout */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Factory className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Parc Machines & Équipements Enregistrés</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Répertoire central des équipements de production et lignes industrielles. Lié dynamiquement avec{' '}
            <b className="text-cyan-700 font-semibold">Familles (D)</b>,{' '}
            <b className="text-amber-700 font-semibold">Templates (E)</b>,{' '}
            <b className="text-purple-700 font-semibold">Zones (F)</b> et{' '}
            <b className="text-blue-700 font-semibold">Techniciens (G)</b>.
          </p>
        </div>

        <button
          onClick={onOpenAddMachine}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black transition shadow-xs flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Machine</span>
        </button>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Machines */}
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
            statusFilter === 'ALL' ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Parc Global
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block font-mono">
              {kpis.total}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {kpis.activeFamiliesCount} Familles actives
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60">
            <Factory className="w-5 h-5 text-emerald-700" />
          </div>
        </div>

        {/* Card 2: En Service */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'En Service' ? 'ALL' : 'En Service')}
          className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
            statusFilter === 'En Service' ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
              En Service (Opérationnel)
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-0.5 block font-mono">
              {kpis.enService}
            </span>
            <span className="text-[11px] text-emerald-600/80 mt-0.5 block">
              {kpis.total > 0 ? Math.round((kpis.enService / kpis.total) * 100) : 0}% du parc en ligne
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: En Maintenance / Panne */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'En Maintenance' ? 'ALL' : 'En Maintenance')}
          className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
            statusFilter === 'En Maintenance' ? 'border-amber-500 ring-2 ring-amber-100 bg-amber-50/30' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
              En Maintenance / Arrêt
            </span>
            <span className="text-2xl font-black text-amber-700 mt-0.5 block font-mono">
              {kpis.enMaintenance + kpis.enArret}
            </span>
            <span className="text-[11px] text-amber-600/80 mt-0.5 block">
              Interventions requises
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Traçabilité Sorties / Interventions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
              Interventions Enregistrées
            </span>
            <span className="text-2xl font-black text-indigo-700 mt-0.5 block font-mono">
              {kpis.totalInterventions}
            </span>
            <span className="text-[11px] text-indigo-500 mt-0.5 block">
              =COUNTIF(Mvt[Machine])
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200/60">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Excel Formula Guidance Cards (Excel Twin Model Formulas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              LIAISON FAMILLE (D)
            </div>
            <div className="text-[11px] font-mono font-bold text-cyan-700 mt-0.5">
              =[@id_family] → Family!B:B
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200/60">
            Liaison D
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              LIAISON TEMPLATE (E)
            </div>
            <div className="text-[11px] font-mono font-bold text-amber-700 mt-0.5">
              =[@id_templates] → Template!B:B
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
            Liaison E
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              LIAISON ZONE DÉFAUT (F)
            </div>
            <div className="text-[11px] font-mono font-bold text-purple-700 mt-0.5">
              =[@id_zone_default] → Zone!B:B
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">
            Liaison F
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              INTERVENTIONS / SORTIES
            </div>
            <div className="text-[11px] font-mono font-bold text-rose-700 mt-0.5">
              =COUNTIF(Mvt[Machine], [@id_machine])
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60">
            Traçabilité
          </span>
        </div>
      </div>

      {/* Filter Bar with Cascading Selects & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Filtres Multicritères & Recherche
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-200/70">
              {filteredMachines.length} machine{filteredMachines.length > 1 ? 's' : ''} affichée{filteredMachines.length > 1 ? 's' : ''} / {machines.length}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60"
              >
                <X className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          {/* Search */}
          <div className="w-full sm:col-span-2 lg:col-span-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Recherche
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Code, Nom, Zone, Tech..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Family Filter (D) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Famille (D)
            </label>
            <CustomSelect
              value={mchFamilyFilter}
              onChange={(val) => {
                setMchFamilyFilter(val);
                setMchTemplateFilter('ALL');
              }}
              options={[
                { value: 'ALL', label: `Toutes Familles (${machineFamilies.length})` },
                ...machineFamilies.map((f) => ({
                  value: f.id_family,
                  label: `[D] ${f.libelle} (${f.id_family})`,
                })),
              ]}
            />
          </div>

          {/* Cascading Template Filter (E) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Template Modèle (E)
            </label>
            <CustomSelect
              value={mchTemplateFilter}
              onChange={(val) => setMchTemplateFilter(val)}
              options={[
                { value: 'ALL', label: `Tous Templates (${availableTemplates.length})` },
                ...availableTemplates.map((t) => ({
                  value: t.id_templates,
                  label: `[E] ${t.libelle} (${t.id_templates})`,
                })),
              ]}
            />
          </div>

          {/* Zone Filter (F) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Zone par Défaut (F)
            </label>
            <CustomSelect
              value={mchZoneFilter}
              onChange={(val) => setMchZoneFilter(val)}
              options={[
                { value: 'ALL', label: `Toutes Zones (${zones.length})` },
                ...zones.map((z) => ({
                  value: z.id_zone,
                  label: `[F] ${z.libelle} (${z.id_zone})`,
                })),
              ]}
            />
          </div>

          {/* Sort Menu Button */}
          <div className="relative" ref={sortMenuRef}>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Tri & Ordre
            </label>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`w-full h-9 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                showSortMenu || sortField !== 'id_machine_registered' || sortOrder !== 'asc'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-1 ring-emerald-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">
                  Tri : <b className="font-mono text-slate-900">{sortField.slice(0, 10).toUpperCase()}</b> (
                  {sortOrder === 'asc' ? 'A→Z' : 'Z→A'})
                </span>
              </div>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Sort Popover Menu */}
            {showSortMenu && (
              <div className="absolute right-0 mt-1 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-2.5 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Sélectionner la Colonne de Tri</span>
                  <span>A→H</span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {[
                    { key: 'id_machine_registered', label: 'Code Machine (B)' },
                    { key: 'designation', label: 'Désignation (C)' },
                    { key: 'id_family', label: 'Famille (D)' },
                    { key: 'id_templates', label: 'Template Modèle (E)' },
                    { key: 'id_zone_default', label: 'Zone Défaut (F)' },
                    { key: 'technician', label: 'Technicien Assigné (G)' },
                    { key: 'status', label: 'Statut Opérationnel (H)' },
                    { key: 'sorties', label: 'Interventions / Sorties' },
                  ].map((col) => (
                    <button
                      key={col.key}
                      onClick={() => {
                        handleSort(col.key);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg border text-left font-medium text-[11px] flex items-center justify-between transition cursor-pointer ${
                        sortField === col.key
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      <span>{col.label}</span>
                      {sortField === col.key && (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-emerald-700" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-emerald-700" />
                        )
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Table with Iconic Excel Mirror Headers */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Top Info Header Bar inside Card */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50/50 gap-2">
          <div className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
            <Factory className="w-4 h-4 text-emerald-600" />
            <span>Tableau Machines_Registered • Colonnes B → H</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
            id_machine_registered (B) | designation (C) | id_family (D) | id_templates (E) | id_zone_default (F) | technician (G) | status (H)
          </div>
        </div>

        <div className="max-h-[62vh] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[980px]">
            <thead className="sticky top-0 bg-slate-100 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 z-10 shadow-2xs">
              <tr>
                {/* Row N° */}
                <th className="py-3 px-3 text-center w-12 text-slate-500 font-mono text-[10px] bg-slate-200/60 border-r border-slate-200 shrink-0">
                  N°
                </th>

                {/* CDE CODE (B) */}
                <th
                  onClick={() => handleSort('id_machine_registered')}
                  className="py-3 px-4 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Code Machine"
                >
                  <div className="flex items-center gap-1.5">
                    <Factory className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>CODE MACHINE</span>
                    <span className="text-slate-400 font-normal text-[10px]">(B)</span>
                    {renderSortIcon('id_machine_registered')}
                  </div>
                </th>

                {/* DÉSIGNATION (C) */}
                <th
                  onClick={() => handleSort('designation')}
                  className="py-3 px-4 cursor-pointer select-none hover:bg-slate-200/80 transition group min-w-[200px]"
                  title="Cliquer pour trier par Désignation"
                >
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>DÉSIGNATION</span>
                    <span className="text-slate-400 font-normal text-[10px]">(C)</span>
                    {renderSortIcon('designation')}
                  </div>
                </th>

                {/* FAMILY (D) */}
                <th
                  onClick={() => handleSort('id_family')}
                  className="py-3 px-3 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Famille"
                >
                  <div className="flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span>FAMILLE</span>
                    <span className="text-slate-400 font-normal text-[10px]">(D)</span>
                    {renderSortIcon('id_family')}
                  </div>
                </th>

                {/* TEMPLATE (E) */}
                <th
                  onClick={() => handleSort('id_templates')}
                  className="py-3 px-3 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Template"
                >
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>TEMPLATE</span>
                    <span className="text-slate-400 font-normal text-[10px]">(E)</span>
                    {renderSortIcon('id_templates')}
                  </div>
                </th>

                {/* ZONE DÉFAUT (F) */}
                <th
                  onClick={() => handleSort('id_zone_default')}
                  className="py-3 px-3 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Zone"
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>ZONE DÉFAUT</span>
                    <span className="text-slate-400 font-normal text-[10px]">(F)</span>
                    {renderSortIcon('id_zone_default')}
                  </div>
                </th>

                {/* TECHNICIEN (G) */}
                <th
                  onClick={() => handleSort('technician')}
                  className="py-3 px-3 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Technicien"
                >
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>TECHNICIEN</span>
                    <span className="text-slate-400 font-normal text-[10px]">(G)</span>
                    {renderSortIcon('technician')}
                  </div>
                </th>

                {/* STATUS (H) */}
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-3 text-center cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Statut"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>STATUT</span>
                    <span className="text-slate-400 font-normal text-[10px]">(H)</span>
                    {renderSortIcon('status')}
                  </div>
                </th>

                {/* INTERVENTIONS */}
                <th
                  onClick={() => handleSort('sorties')}
                  className="py-3 px-4 text-right cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Nombre d'Interventions"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>INTERVENTIONS</span>
                    {renderSortIcon('sorties')}
                  </div>
                </th>

                {/* ACTIONS */}
                <th className="py-3 px-4 text-right">
                  <span>ACTIONS</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {displayedData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Factory className="w-8 h-8 text-slate-300" />
                      <span>Aucune machine ne correspond aux critères de recherche.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedData.map((m, idx) => {
                  const fam = families.find((f) => f.id_family === m.id_family);
                  const tpl = templates.find((t) => t.id_templates === m.id_templates);
                  const zn = zones.find((z) => z.id_zone === m.id_zone_default);
                  const tech = technicians.find(
                    (t) => t.id_technician === m.technician || t.nom === m.technician
                  );
                  const sortiesCount = sortiesCountMap[m.id_machine_registered] || 0;
                  const isService = String(m.status || 'En Service').toLowerCase().includes('service');
                  const isMaintenance = String(m.status || '').toLowerCase().includes('maint') || String(m.status || '').toLowerCase().includes('panne');

                  return (
                    <tr
                      key={m.id_machine_registered}
                      className="even:bg-slate-50/70 odd:bg-white hover:bg-emerald-50/40 border-b border-slate-200/70 transition-colors"
                    >
                      {/* Row N° Column */}
                      <td className="py-3 px-3 text-center font-mono text-[11px] font-bold text-slate-400 bg-slate-100/40 border-r border-slate-200/80 shrink-0">
                        {startIndex + idx + 1}
                      </td>

                      {/* Cde Machine (B) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center font-mono text-[11px] font-black shrink-0">
                            <Factory className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-slate-900 text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                              {m.id_machine_registered}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Désignation (C) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-[13px]">{m.designation}</div>
                        <div className="text-[10.5px] text-slate-400 font-mono">
                          {tpl?.libelle ? `${tpl.libelle} • ` : ''}{fam?.libelle || m.id_family}
                        </div>
                      </td>

                      {/* Family (D) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setMchFamilyFilter(m.id_family);
                            setMchTemplateFilter('ALL');
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px] font-mono font-bold hover:bg-cyan-100 hover:border-cyan-300 transition cursor-pointer shadow-2xs"
                          title="Filtrer par cette Famille"
                        >
                          <Boxes className="w-3 h-3 text-cyan-600" />
                          <span>{m.id_family}</span>
                        </button>
                      </td>

                      {/* Template (E) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setMchFamilyFilter(m.id_family);
                            setMchTemplateFilter(m.id_templates);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 hover:border-amber-300 transition cursor-pointer shadow-2xs"
                          title="Filtrer par ce Template"
                        >
                          <Layers className="w-3 h-3 text-amber-600" />
                          <span>{tpl ? tpl.libelle : m.id_templates}</span>
                        </button>
                      </td>

                      {/* Zone Défaut (F) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          onClick={() => setMchZoneFilter(m.id_zone_default)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold hover:bg-purple-100 hover:border-purple-300 transition cursor-pointer shadow-2xs"
                          title="Filtrer par cette Zone"
                        >
                          <MapPin className="w-3 h-3 text-purple-600" />
                          <span>{zn ? zn.libelle : m.id_zone_default || 'Magasin Central'}</span>
                        </button>
                      </td>

                      {/* Technicien (G) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold">
                          <Users className="w-3 h-3 text-blue-600" />
                          <span>
                            {tech
                              ? `${tech.nom} (${tech.id_technician})`
                              : m.technician || 'Non assigné'}
                          </span>
                        </div>
                      </td>

                      {/* Status (H) */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            isService
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                              : isMaintenance
                                ? 'bg-amber-50 text-amber-700 border border-amber-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {isService ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          <span>{m.status || 'En Service'}</span>
                        </span>
                      </td>

                      {/* Interventions Count */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                            sortiesCount > 0
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
                              : 'text-slate-400'
                          }`}
                        >
                          <Activity className="w-3 h-3 text-indigo-500" />
                          <span>{sortiesCount} sortie{sortiesCount > 1 ? 's' : ''}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            onClick={() => setToEdit({ ...m })}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 transition cursor-pointer"
                            title="Modifier la machine"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setToDelete(m)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition cursor-pointer"
                            title="Supprimer la machine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  pageSize === size
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/50'
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
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition cursor-pointer"
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
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition cursor-pointer"
              >
                Suivant
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: MODIFIER MACHINE */}
      {toEdit && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Factory className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Modifier Machine Registered</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{toEdit.id_machine_registered}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setToEdit(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateMachine(toEdit.id_machine_registered, toEdit);
                setToEdit(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Code Machine (B)
                </label>
                <input
                  type="text"
                  value={toEdit.id_machine_registered}
                  disabled
                  className="w-full h-10 px-3 rounded-xl bg-slate-100 text-slate-500 text-xs font-mono font-bold border border-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Désignation de la Machine (C)
                </label>
                <input
                  type="text"
                  value={toEdit.designation}
                  onChange={(e) => setToEdit({ ...toEdit, designation: e.target.value })}
                  required
                  placeholder="Ex: Ligne d'Extrusion Principale"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Famille (D)
                  </label>
                  <CustomSelect
                    value={toEdit.id_family}
                    onChange={(val) => {
                      const relTpl = templates.filter((t) => t.id_family === val);
                      setToEdit({ ...toEdit, id_family: val, id_templates: relTpl[0]?.id_templates || '' });
                    }}
                    options={families.map((f) => ({ value: f.id_family, label: `${f.libelle} (${f.id_family})` }))}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Template Modèle (E)
                  </label>
                  <CustomSelect
                    value={toEdit.id_templates}
                    onChange={(val) => setToEdit({ ...toEdit, id_templates: val })}
                    options={templates
                      .filter((t) => !toEdit.id_family || t.id_family === toEdit.id_family)
                      .map((t) => ({ value: t.id_templates, label: `${t.libelle} (${t.id_templates})` }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Zone par Défaut (F)
                  </label>
                  <CustomSelect
                    value={toEdit.id_zone_default}
                    onChange={(val) => setToEdit({ ...toEdit, id_zone_default: val })}
                    options={zones.map((z) => ({ value: z.id_zone, label: `${z.libelle} (${z.id_zone})` }))}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Technicien Responsable (G)
                  </label>
                  <CustomSelect
                    value={toEdit.technician}
                    onChange={(val) => setToEdit({ ...toEdit, technician: val })}
                    options={technicians.map((t) => ({ value: t.id_technician, label: `${t.nom} (${t.id_technician})` }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Statut Opérationnel (H)
                </label>
                <CustomSelect
                  value={toEdit.status || 'En Service'}
                  onChange={(val) => setToEdit({ ...toEdit, status: val })}
                  options={[
                    { value: 'En Service', label: 'En Service (Opérationnel)' },
                    { value: 'En Maintenance', label: 'En Maintenance' },
                    { value: 'En Panne', label: 'En Panne' },
                    { value: 'Arrêt', label: 'Arrêt Machine' },
                  ]}
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setToEdit(null)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Enregistrer Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUPPRIMER MACHINE */}
      {toDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Supprimer la Machine ?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Êtes-vous sûr de vouloir supprimer définitivement l'équipement{' '}
                <b className="font-mono text-slate-900">{toDelete.id_machine_registered}</b> ({toDelete.designation}) ?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setToDelete(null)}
                className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDeleteMachine(toDelete.id_machine_registered);
                  setToDelete(null);
                }}
                className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
