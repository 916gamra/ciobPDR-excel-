import React, { useState, useRef, useMemo, useEffect } from 'react';
import AnimatedPage from './AnimatedPage';
import CustomSelect from './CustomSelect';
import { generateWarehouseItemCode } from '../data/seedData';
import {
  Boxes,
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
  Warehouse,
  Factory,
  Cpu,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Tag,
  Info,
  Clock,
  Check,
  X,
  Building2,
  Scale,
  Package,
} from 'lucide-react';

export default function EntrepotView({
  warehouseItems = [],
  families = [],
  templates = [],
  types = [],
  diagnostics = [],
  stockItems = [],
  zones = [],
  machines = [],
  technicians = [],
  mouvements = [],
  whFamilyFilter = 'ALL',
  setWhFamilyFilter,
  whTemplateFilter = 'ALL',
  setWhTemplateFilter,
  whTypeFilter = 'ALL',
  setWhTypeFilter,
  whNatureFilter = 'ALL',
  setWhNatureFilter,
  whRattachementFilter = 'ALL',
  setWhRattachementFilter,
  whStatusFilter = 'ALL',
  setWhStatusFilter,
  whSearch = '',
  setWhSearch,
  onAddWarehouseItem,
  onUpdateWarehouseItem,
  onDeleteWarehouseItem,
  onNavigateToFamily,
  onNavigateToTemplate,
  onNavigateToType,
  onNavigateToDiag,
  onNavigateToZone,
  onNavigateToMachine,
  onOpenAddFamilyModal,
  onOpenAddTemplateModal,
}) {
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [toEdit, setToEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);

  // Local filter states if not provided via props
  const [internalFamilyFilter, setInternalFamilyFilter] = useState('ALL');
  const [internalTemplateFilter, setInternalTemplateFilter] = useState('ALL');
  const [internalTypeFilter, setInternalTypeFilter] = useState('ALL');
  const [internalNatureFilter, setInternalNatureFilter] = useState('ALL');
  const [internalRattachementFilter, setInternalRattachementFilter] = useState('ALL');
  const [internalStatusFilter, setInternalStatusFilter] = useState('ALL');

  const currentFamilyFilter = whFamilyFilter !== undefined ? whFamilyFilter : internalFamilyFilter;
  const changeFamilyFilter = setWhFamilyFilter || setInternalFamilyFilter;

  const currentTemplateFilter =
    whTemplateFilter !== undefined ? whTemplateFilter : internalTemplateFilter;
  const changeTemplateFilter = setWhTemplateFilter || setInternalTemplateFilter;

  const currentTypeFilter = whTypeFilter !== undefined ? whTypeFilter : internalTypeFilter;
  const changeTypeFilter = setWhTypeFilter || setInternalTypeFilter;

  const currentNatureFilter = whNatureFilter !== undefined ? whNatureFilter : internalNatureFilter;
  const changeNatureFilter = setWhNatureFilter || setInternalNatureFilter;

  const currentRattachementFilter =
    whRattachementFilter !== undefined ? whRattachementFilter : internalRattachementFilter;
  const changeRattachementFilter = setWhRattachementFilter || setInternalRattachementFilter;

  const currentStatusFilter = whStatusFilter !== undefined ? whStatusFilter : internalStatusFilter;
  const changeStatusFilter = setWhStatusFilter || setInternalStatusFilter;

  // Debounce search
  const [localSearch, setLocalSearch] = useState(whSearch);

  useEffect(() => {
    setLocalSearch(whSearch);
  }, [whSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (setWhSearch) setWhSearch(localSearch);
    }, 200);
    return () => clearTimeout(handler);
  }, [localSearch, setWhSearch]);

  // Form state for add modal (Dual Twin)
  const [addForm, setAddForm] = useState({
    id_warehouse_item: '',
    designation: '',
    nature: 'PARTIE', // 'PARTIE' (Machine Twin) | 'COMPOSANT' (Stock Twin)
    id_family: '',
    id_templates: '',
    id_type: '',
    id_diag: '',
    rattachement_type: 'ENTREPOT', // 'MACHINE' | 'ZONE' | 'ENTREPOT'
    id_machine_registered: '',
    id_zone: '',
    technician: '',
    status: 'En stock (Disponible)',
    emplacement: 'E-MAG-01',
    remarques: '',
  });

  // Form state for edit modal
  const [editForm, setEditForm] = useState({
    id_warehouse_item: '',
    designation: '',
    nature: 'PARTIE',
    id_family: '',
    id_templates: '',
    id_type: '',
    id_diag: '',
    rattachement_type: 'ENTREPOT',
    id_machine_registered: '',
    id_zone: '',
    technician: '',
    status: 'En stock (Disponible)',
    emplacement: '',
    remarques: '',
  });

  // Open Add Modal initialized with smart auto-code
  const handleOpenAddModal = () => {
    const defaultFam = families[0]?.id_family || 'FAM-MOT';
    const relTemplates = templates.filter((t) => t.id_family === defaultFam);
    const defaultTpl = relTemplates[0]?.id_templates || templates[0]?.id_templates || '';
    const autoCode = generateWarehouseItemCode(defaultFam, warehouseItems, 'PARTIE');
    const defaultTplObj = templates.find((t) => t.id_templates === defaultTpl);

    setAddForm({
      id_warehouse_item: autoCode,
      designation: defaultTplObj ? defaultTplObj.libelle : '',
      nature: 'PARTIE',
      id_family: defaultFam,
      id_templates: defaultTpl,
      id_type: types[0]?.id_type || 'TYPE-MEC',
      id_diag: '',
      rattachement_type: 'ENTREPOT',
      id_machine_registered: '',
      id_zone: zones[0]?.id_zone || '',
      technician: technicians[0]?.nom || '',
      status: 'En stock (Disponible)',
      emplacement: 'E-MAG-A01',
      remarques: '',
    });
    setShowAddModal(true);
  };

  // Switch Nature in Add Modal
  const handleAddNatureSwitch = (newNature) => {
    if (newNature === 'PARTIE') {
      const defaultFam = addForm.id_family || families[0]?.id_family || 'FAM-MOT';
      const relTemplates = templates.filter((t) => t.id_family === defaultFam);
      const defaultTpl = relTemplates[0]?.id_templates || '';
      const autoCode = generateWarehouseItemCode(defaultFam, warehouseItems, 'PARTIE');
      const defaultTplObj = templates.find((t) => t.id_templates === defaultTpl);

      setAddForm((prev) => ({
        ...prev,
        nature: 'PARTIE',
        id_family: defaultFam,
        id_templates: defaultTpl,
        id_warehouse_item: autoCode,
        designation: defaultTplObj ? defaultTplObj.libelle : prev.designation,
      }));
    } else {
      // COMPOSANT
      const defaultType = addForm.id_type || types[0]?.id_type || 'TYPE-MEC';
      const relDiags = diagnostics.filter((d) => d.id_type === defaultType);
      const defaultDiag = relDiags[0]?.id_diag || '';
      const autoCode = generateWarehouseItemCode(defaultType, warehouseItems, 'COMPOSANT');
      const defaultDiagObj = diagnostics.find((d) => d.id_diag === defaultDiag);

      setAddForm((prev) => ({
        ...prev,
        nature: 'COMPOSANT',
        id_type: defaultType,
        id_diag: defaultDiag,
        id_warehouse_item: autoCode,
        designation: defaultDiagObj ? defaultDiagObj.libelle : prev.designation,
      }));
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setToEdit(item);
    setEditForm({
      id_warehouse_item: item.id_warehouse_item || '',
      designation: item.designation || '',
      nature: item.nature || 'PARTIE',
      id_family: item.id_family || '',
      id_templates: item.id_templates || '',
      id_type: item.id_type || '',
      id_diag: item.id_diag || '',
      rattachement_type: item.rattachement_type || 'ENTREPOT',
      id_machine_registered: item.id_machine_registered || '',
      id_zone: item.id_zone || '',
      technician: item.technician || '',
      status: item.status || 'En service',
      emplacement: item.emplacement || '',
      remarques: item.remarques || '',
    });
  };

  // Cascading templates according to family in add form
  const availableAddTemplates = addForm.id_family
    ? templates.filter((t) => t.id_family === addForm.id_family)
    : templates;

  // Cascading diagnostics/designations according to type in add form
  const availableAddDiags = addForm.id_type
    ? diagnostics.filter((d) => d.id_type === addForm.id_type)
    : diagnostics;

  const handleAddFamilyChange = (newFam) => {
    const relTpl = templates.filter((t) => t.id_family === newFam);
    const newTpl = relTpl[0]?.id_templates || '';
    const autoCode = generateWarehouseItemCode(newFam, warehouseItems, 'PARTIE');
    const tplObj = templates.find((t) => t.id_templates === newTpl);

    setAddForm((prev) => ({
      ...prev,
      id_family: newFam,
      id_templates: newTpl,
      id_warehouse_item: autoCode,
      designation: tplObj ? tplObj.libelle : prev.designation,
    }));
  };

  const handleAddTemplateChange = (newTpl) => {
    const tplObj = templates.find((t) => t.id_templates === newTpl);
    setAddForm((prev) => ({
      ...prev,
      id_templates: newTpl,
      designation: tplObj ? tplObj.libelle : prev.designation,
    }));
  };

  const handleAddTypeChange = (newType) => {
    const relDiags = diagnostics.filter((d) => d.id_type === newType);
    const newDiag = relDiags[0]?.id_diag || '';
    const autoCode = generateWarehouseItemCode(newType, warehouseItems, 'COMPOSANT');
    const diagObj = diagnostics.find((d) => d.id_diag === newDiag);

    setAddForm((prev) => ({
      ...prev,
      id_type: newType,
      id_diag: newDiag,
      id_warehouse_item: autoCode,
      designation: diagObj ? diagObj.libelle : prev.designation,
    }));
  };

  const handleAddDiagChange = (newDiag) => {
    const diagObj = diagnostics.find((d) => d.id_diag === newDiag);
    setAddForm((prev) => ({
      ...prev,
      id_diag: newDiag,
      designation: diagObj ? diagObj.libelle : prev.designation,
    }));
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!addForm.id_warehouse_item || !addForm.designation) return;

    if (onAddWarehouseItem) {
      onAddWarehouseItem({
        id_warehouse_item: addForm.id_warehouse_item.trim().toUpperCase(),
        designation: addForm.designation.trim(),
        nature: addForm.nature,
        id_family: addForm.nature === 'PARTIE' ? addForm.id_family : '',
        id_templates: addForm.nature === 'PARTIE' ? addForm.id_templates : '',
        id_type: addForm.nature === 'COMPOSANT' ? addForm.id_type : '',
        id_diag: addForm.nature === 'COMPOSANT' ? addForm.id_diag : '',
        rattachement_type: addForm.rattachement_type,
        id_machine_registered:
          addForm.rattachement_type === 'MACHINE' ? addForm.id_machine_registered : '',
        id_zone:
          addForm.rattachement_type === 'ZONE' || addForm.rattachement_type === 'MACHINE'
            ? addForm.id_zone
            : '',
        technician: addForm.technician,
        status: addForm.status,
        emplacement: addForm.emplacement.trim(),
        remarques: addForm.remarques.trim(),
      });
    }
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (!editForm.id_warehouse_item || !editForm.designation) return;

    if (onUpdateWarehouseItem) {
      onUpdateWarehouseItem(toEdit.id_warehouse_item, {
        id_warehouse_item: editForm.id_warehouse_item.trim().toUpperCase(),
        designation: editForm.designation.trim(),
        nature: editForm.nature,
        id_family: editForm.nature === 'PARTIE' ? editForm.id_family : '',
        id_templates: editForm.nature === 'PARTIE' ? editForm.id_templates : '',
        id_type: editForm.nature === 'COMPOSANT' ? editForm.id_type : '',
        id_diag: editForm.nature === 'COMPOSANT' ? editForm.id_diag : '',
        rattachement_type: editForm.rattachement_type,
        id_machine_registered:
          editForm.rattachement_type === 'MACHINE' ? editForm.id_machine_registered : '',
        id_zone:
          editForm.rattachement_type === 'ZONE' || editForm.rattachement_type === 'MACHINE'
            ? editForm.id_zone
            : '',
        technician: editForm.technician,
        status: editForm.status,
        emplacement: editForm.emplacement.trim(),
        remarques: editForm.remarques.trim(),
      });
    }
    setToEdit(null);
  };

  const handleConfirmDelete = () => {
    if (toDelete && onDeleteWarehouseItem) {
      onDeleteWarehouseItem(toDelete.id_warehouse_item);
    }
    setToDelete(null);
  };

  // Filtered Warehouse Elements (Dual Twin Cascading Filter)
  const filteredItems = useMemo(() => {
    return warehouseItems.filter((item) => {
      // Nature filter
      if (currentNatureFilter !== 'ALL' && item.nature !== currentNatureFilter) return false;

      // Family & Template filters (active for PARTIE)
      if (currentFamilyFilter !== 'ALL' && item.id_family !== currentFamilyFilter) return false;
      if (currentTemplateFilter !== 'ALL' && item.id_templates !== currentTemplateFilter)
        return false;

      // Type filter (active for COMPOSANT)
      if (currentTypeFilter !== 'ALL' && item.id_type !== currentTypeFilter) return false;

      // Rattachement filter
      if (
        currentRattachementFilter !== 'ALL' &&
        item.rattachement_type !== currentRattachementFilter
      )
        return false;

      // Status filter
      if (currentStatusFilter !== 'ALL' && item.status !== currentStatusFilter) return false;

      if (whSearch) {
        const q = whSearch.toLowerCase();
        const code = String(item.id_warehouse_item || '').toLowerCase();
        const desig = String(item.designation || '').toLowerCase();
        const fam = String(item.id_family || '').toLowerCase();
        const tpl = String(item.id_templates || '').toLowerCase();
        const typ = String(item.id_type || '').toLowerCase();
        const diag = String(item.id_diag || '').toLowerCase();
        const mch = String(item.id_machine_registered || '').toLowerCase();
        const zone = String(item.id_zone || '').toLowerCase();
        const empl = String(item.emplacement || '').toLowerCase();
        const rem = String(item.remarques || '').toLowerCase();

        return (
          code.includes(q) ||
          desig.includes(q) ||
          fam.includes(q) ||
          tpl.includes(q) ||
          typ.includes(q) ||
          diag.includes(q) ||
          mch.includes(q) ||
          zone.includes(q) ||
          empl.includes(q) ||
          rem.includes(q)
        );
      }
      return true;
    });
  }, [
    warehouseItems,
    currentFamilyFilter,
    currentTemplateFilter,
    currentTypeFilter,
    currentNatureFilter,
    currentRattachementFilter,
    currentStatusFilter,
    whSearch,
  ]);

  // Sorting & Pagination
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('id_warehouse_item');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    whSearch,
    currentFamilyFilter,
    currentTemplateFilter,
    currentTypeFilter,
    currentNatureFilter,
    currentRattachementFilter,
    currentStatusFilter,
    sortField,
    sortOrder,
  ]);

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
    if (!sortField) return filteredItems;
    return [...filteredItems].sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortField, sortOrder]);

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

  // Quick Analytics Counts
  const kpis = useMemo(() => {
    let parties = 0;
    let composants = 0;
    let enService = 0;
    let enStock = 0;
    let enRevision = 0;

    warehouseItems.forEach((item) => {
      if (item.nature === 'PARTIE') parties++;
      else composants++;

      const st = String(item.status || '').toLowerCase();
      if (st.includes('service')) enService++;
      else if (st.includes('stock') || st.includes('dispo')) enStock++;
      else if (st.includes('rev') || st.includes('ext')) enRevision++;
    });

    return {
      total: warehouseItems.length,
      parties,
      composants,
      enService,
      enStock,
      enRevision,
    };
  }, [warehouseItems]);

  return (
    <AnimatedPage className="space-y-4">
      {/* 1. Header & Summary KPIs Banner (BDR Light Excel UI) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-2xs font-bold">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Entrepôt : Éléments & Composants
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
                  {warehouseItems.length} Enregistrés
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                  Dual-Twin Model
                </span>
              </div>
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-blue-700">Parties :</span> Moteurs & Pompes
                (Family/Template) &bull;{' '}
                <span className="font-semibold text-indigo-700">Composants :</span> Éléments
                spécifiques (Type/Désignation)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Élément / Composant</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (High-contrast light layout) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold">
            <Warehouse className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Entrepôt
            </div>
            <div className="text-base font-extrabold text-slate-900">{kpis.total}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Parties (Ensembles)
            </div>
            <div className="text-base font-extrabold text-blue-700">{kpis.parties}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Composants Spécifiques
            </div>
            <div className="text-base font-extrabold text-indigo-700">{kpis.composants}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              En Service Actif
            </div>
            <div className="text-base font-extrabold text-emerald-700">{kpis.enService}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-bold">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              En Stock / Réserve
            </div>
            <div className="text-base font-extrabold text-sky-700">{kpis.enStock}</div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar (Excel Style Dual-Twin Filter) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher code, désignation..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-teal-500 outline-none transition"
            />
          </div>

          {/* Nature Filter (Dual-Twin Switch) */}
          <div>
            <select
              value={currentNatureFilter}
              onChange={(e) => changeNatureFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:bg-white focus:border-teal-500 outline-none transition"
            >
              <option value="ALL">Toutes les Natures</option>
              <option value="PARTIE">⚡ Parties (Family/Template)</option>
              <option value="COMPOSANT">🧩 Composants (Type/Désignation)</option>
            </select>
          </div>

          {/* Smart Classification Filter: Family for PARTIE or Type for COMPOSANT */}
          <div>
            {currentNatureFilter === 'COMPOSANT' ? (
              <select
                value={currentTypeFilter}
                onChange={(e) => changeTypeFilter(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-indigo-50/50 text-xs font-semibold text-indigo-800 focus:bg-white focus:border-indigo-500 outline-none transition"
              >
                <option value="ALL">Tous les Types de Composants</option>
                {types.map((t) => {
                  const count = warehouseItems.filter(
                    (i) => i.nature === 'COMPOSANT' && i.id_type === t.id_type
                  ).length;
                  return (
                    <option key={t.id_type} value={t.id_type}>
                      {t.libelle} ({t.id_type}) [{count}]
                    </option>
                  );
                })}
              </select>
            ) : (
              <select
                value={currentFamilyFilter}
                onChange={(e) => {
                  changeFamilyFilter(e.target.value);
                  if (changeTemplateFilter) changeTemplateFilter('ALL');
                }}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-blue-50/50 text-xs font-semibold text-blue-800 focus:bg-white focus:border-blue-500 outline-none transition"
              >
                <option value="ALL">Toutes les Familles de Parties</option>
                {families.map((f) => {
                  const count = warehouseItems.filter((i) => i.id_family === f.id_family).length;
                  return (
                    <option key={f.id_family} value={f.id_family}>
                      {f.libelle} ({f.id_family}) [{count}]
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Rattachement Filter */}
          <div>
            <select
              value={currentRattachementFilter}
              onChange={(e) => changeRattachementFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:bg-white focus:border-teal-500 outline-none transition"
            >
              <option value="ALL">Tous les Rattachements</option>
              <option value="MACHINE">Rattaché à une Machine</option>
              <option value="ZONE">Rattaché à une Zone / Atelier</option>
              <option value="ENTREPOT">Entrepôt Central (Stock Réserve)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={currentStatusFilter}
              onChange={(e) => changeStatusFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:bg-white focus:border-teal-500 outline-none transition"
            >
              <option value="ALL">Tous les Statuts</option>
              <option value="En service">En service</option>
              <option value="En stock (Disponible)">En stock (Disponible)</option>
              <option value="En révision / Externe">En révision / Externe</option>
              <option value="Hors service">Hors service</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicators & Reset */}
        {(whSearch ||
          currentFamilyFilter !== 'ALL' ||
          currentTypeFilter !== 'ALL' ||
          currentNatureFilter !== 'ALL' ||
          currentRattachementFilter !== 'ALL' ||
          currentStatusFilter !== 'ALL') && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-700">Filtres actifs :</span>
              {whSearch && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[11px]">
                  "{whSearch}"
                </span>
              )}
              {currentNatureFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-bold text-[11px]">
                  {currentNatureFilter === 'PARTIE' ? 'Parties (Ensembles)' : 'Composants'}
                </span>
              )}
              {currentFamilyFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px]">
                  Famille: {currentFamilyFilter}
                </span>
              )}
              {currentTypeFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                  Type: {currentTypeFilter}
                </span>
              )}
              {currentRattachementFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[11px]">
                  Rattaché : {currentRattachementFilter}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                if (setWhSearch) setWhSearch('');
                setLocalSearch('');
                changeFamilyFilter('ALL');
                if (changeTemplateFilter) changeTemplateFilter('ALL');
                changeTypeFilter('ALL');
                changeNatureFilter('ALL');
                changeRattachementFilter('ALL');
                changeStatusFilter('ALL');
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* 4. Table View (Excel Twin Style) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                <th
                  onClick={() => handleSort('id_warehouse_item')}
                  className="px-3.5 py-3 font-mono cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Code Élément</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('nature')}
                  className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nature (Twin)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('designation')}
                  className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Désignation & Spécifications</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-3.5 py-3">Classification (Famille/Template ou Type/Diag)</th>
                <th className="px-3.5 py-3">Rattachement & Emplacement</th>
                <th className="px-3.5 py-3">Responsable</th>
                <th
                  onClick={() => handleSort('status')}
                  className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Statut</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('stockActuel')}
                  className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Stock (Actuel)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-3.5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Warehouse className="w-8 h-8 text-slate-300 stroke-1" />
                      <p className="font-semibold">Aucun élément d'entrepôt trouvé</p>
                      <button
                        onClick={handleOpenAddModal}
                        className="mt-1 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 transition"
                      >
                        + Ajouter un premier élément
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedData.map((item) => {
                  const isPartie = item.nature === 'PARTIE';
                  const famObj = families.find((f) => f.id_family === item.id_family);
                  const tplObj = templates.find((t) => t.id_templates === item.id_templates);
                  const typeObj = types.find((t) => t.id_type === item.id_type);
                  const diagObj = diagnostics.find((d) => d.id_diag === item.id_diag);

                  return (
                    <tr
                      key={item.id_warehouse_item}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Code */}
                      <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md border font-mono font-bold ${
                              isPartie
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            }`}
                          >
                            {item.id_warehouse_item}
                          </span>
                        </div>
                      </td>

                      {/* Nature */}
                      <td className="px-3.5 py-2.5">
                        {isPartie ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                            <Cpu className="w-3 h-3" />
                            <span>Partie (Machine)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Layers className="w-3 h-3" />
                            <span>Composant (Stock)</span>
                          </span>
                        )}
                      </td>

                      {/* Designation */}
                      <td className="px-3.5 py-2.5 font-medium text-slate-900 max-w-[240px]">
                        <div className="truncate font-semibold" title={item.designation}>
                          {item.designation}
                        </div>
                        {item.remarques && (
                          <div
                            className="text-[10px] text-slate-500 truncate"
                            title={item.remarques}
                          >
                            {item.remarques}
                          </div>
                        )}
                      </td>

                      {/* Classification (Dual Twin) */}
                      <td className="px-3.5 py-2.5">
                        {isPartie ? (
                          <div className="space-y-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                onNavigateToFamily && onNavigateToFamily(item.id_family)
                              }
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline block truncate max-w-[170px] text-left cursor-pointer"
                              title={famObj?.libelle || item.id_family}
                            >
                              <span className="font-mono text-[9.5px] bg-blue-50 text-blue-700 px-1 py-0.2 rounded mr-1">
                                [D]
                              </span>
                              {famObj ? famObj.libelle : item.id_family || '--'}
                            </button>
                            {tplObj && (
                              <button
                                type="button"
                                onClick={() =>
                                  onNavigateToTemplate && onNavigateToTemplate(item.id_templates)
                                }
                                className="text-[10px] text-slate-500 hover:text-slate-700 block truncate max-w-[170px] text-left font-mono cursor-pointer"
                                title={tplObj.libelle}
                              >
                                <span className="font-mono text-[9.5px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded mr-1">
                                  [E]
                                </span>
                                {tplObj.libelle}
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <button
                              type="button"
                              onClick={() => onNavigateToType && onNavigateToType(item.id_type)}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline block truncate max-w-[170px] text-left cursor-pointer"
                              title={typeObj?.libelle || item.id_type}
                            >
                              <span className="font-mono text-[9.5px] bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded mr-1">
                                [Type]
                              </span>
                              {typeObj ? typeObj.libelle : item.id_type || '--'}
                            </button>
                            {diagObj && (
                              <button
                                type="button"
                                onClick={() => onNavigateToDiag && onNavigateToDiag(item.id_type)}
                                className="text-[10px] text-slate-500 hover:text-slate-700 block truncate max-w-[170px] text-left cursor-pointer"
                                title={diagObj.libelle}
                              >
                                <span className="font-mono text-[9.5px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded mr-1">
                                  [Diag]
                                </span>
                                {diagObj.libelle}
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Rattachement */}
                      <td className="px-3.5 py-2.5">
                        <div className="space-y-0.5">
                          {item.rattachement_type === 'MACHINE' && item.id_machine_registered ? (
                            <button
                              type="button"
                              onClick={() =>
                                onNavigateToMachine &&
                                onNavigateToMachine(item.id_machine_registered)
                              }
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-mono font-bold text-[10.5px] border border-purple-200 hover:bg-purple-100 cursor-pointer"
                            >
                              <Factory className="w-3 h-3" />
                              <span>{item.id_machine_registered}</span>
                            </button>
                          ) : item.rattachement_type === 'ZONE' && item.id_zone ? (
                            <button
                              type="button"
                              onClick={() => onNavigateToZone && onNavigateToZone(item.id_zone)}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10.5px] border border-amber-200 hover:bg-amber-100 cursor-pointer"
                            >
                              <MapPin className="w-3 h-3" />
                              <span>{item.id_zone}</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10.5px]">
                              <Warehouse className="w-3 h-3" />
                              <span>Entrepôt Central</span>
                            </span>
                          )}

                          {item.emplacement && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              Empl: {item.emplacement}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Responsable */}
                      <td className="px-3.5 py-2.5 text-slate-600 font-medium">
                        {item.technician || <span className="text-slate-300">--</span>}
                      </td>

                      {/* Statut */}
                      <td className="px-3.5 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            String(item.status).includes('service')
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : String(item.status).includes('stock') ||
                                  String(item.status).includes('dispo')
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : String(item.status).includes('rev') ||
                                    String(item.status).includes('ext')
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {item.status || 'En service'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedDetails(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition cursor-pointer"
                            title="Détails"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setToDelete(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                            title="Supprimer"
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

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Affichage de <b className="text-slate-800">{displayedData.length}</b> sur{' '}
            <b className="text-slate-800">{totalItems}</b> éléments
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-semibold text-slate-700">
                Page {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. ADD MODAL (Dual Twin Architecture) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Ajouter un Élément à l'Entrepôt
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choisissez la nature (Partie ou Composant)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmitAdd} className="p-4 sm:p-5 space-y-4 text-xs">
              {/* Nature Selector (Dual Twin Toggle) */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  Nature de l'Élément *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddNatureSwitch('PARTIE')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      addForm.nature === 'PARTIE'
                        ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>⚡ PARTIE (Machine Twin)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddNatureSwitch('COMPOSANT')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      addForm.nature === 'COMPOSANT'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>🧩 COMPOSANT (Stock Twin)</span>
                  </button>
                </div>
              </div>

              {/* Conditional Twin Selectors */}
              {addForm.nature === 'PARTIE' ? (
                /* PARTIE -> Family & Template (Machine Model Twin) */
                <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-blue-900">
                        Famille de Machine *
                      </label>
                      {onOpenAddFamilyModal && (
                        <button
                          type="button"
                          onClick={onOpenAddFamilyModal}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                        >
                          + Famille
                        </button>
                      )}
                    </div>
                    <select
                      required
                      value={addForm.id_family}
                      onChange={(e) => handleAddFamilyChange(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    >
                      {families.map((f) => (
                        <option key={f.id_family} value={f.id_family}>
                          {f.libelle} ({f.id_family})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-blue-900">
                        Modèle / Template
                      </label>
                      {onOpenAddTemplateModal && (
                        <button
                          type="button"
                          onClick={onOpenAddTemplateModal}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                        >
                          + Template
                        </button>
                      )}
                    </div>
                    <select
                      value={addForm.id_templates}
                      onChange={(e) => handleAddTemplateChange(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:border-blue-500 outline-none"
                    >
                      <option value="">-- Aucun Template --</option>
                      {availableAddTemplates.map((t) => (
                        <option key={t.id_templates} value={t.id_templates}>
                          {t.libelle} ({t.id_templates})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                /* COMPOSANT -> Type & Diagnostic / Article (Stock Model Twin) */
                <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div>
                    <label className="text-[11px] font-bold text-indigo-900 block mb-1">
                      Type de Pièce (Stock) *
                    </label>
                    <select
                      required
                      value={addForm.id_type}
                      onChange={(e) => handleAddTypeChange(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:border-indigo-500 outline-none"
                    >
                      {types.map((t) => (
                        <option key={t.id_type} value={t.id_type}>
                          {t.libelle} ({t.id_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-indigo-900 block mb-1">
                      Désignation / Diagnostic Réf.
                    </label>
                    <select
                      value={addForm.id_diag}
                      onChange={(e) => handleAddDiagChange(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:border-indigo-500 outline-none"
                    >
                      <option value="">-- Sélectionner ou saisir libre --</option>
                      {availableAddDiags.map((d) => (
                        <option key={d.id_diag} value={d.id_diag}>
                          {d.libelle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Code Auto-Generated & Designation */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Code Élément *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.id_warehouse_item}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        id_warehouse_item: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-teal-300 bg-teal-50/50 text-xs font-mono font-bold uppercase focus:bg-white focus:border-teal-600 outline-none"
                    placeholder="EXT-01 ou COMP-01"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Désignation / Description Complète *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.designation}
                    onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-teal-500 outline-none"
                    placeholder="Ex: Moteur Asynchrone 380V ou Courroie spéciale 5m"
                  />
                </div>
              </div>

              {/* Rattachement Options */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Rattachement & Destination *
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAddForm({
                        ...addForm,
                        rattachement_type: 'MACHINE',
                        id_machine_registered:
                          addForm.id_machine_registered || machines[0]?.id_machine_registered || '',
                      })
                    }
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      addForm.rattachement_type === 'MACHINE'
                        ? 'bg-purple-50 text-purple-700 border-purple-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Factory className="w-3 h-3" />
                    <span>Machine</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAddForm({
                        ...addForm,
                        rattachement_type: 'ZONE',
                        id_zone: addForm.id_zone || zones[0]?.id_zone || '',
                      })
                    }
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      addForm.rattachement_type === 'ZONE'
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Zone</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddForm({ ...addForm, rattachement_type: 'ENTREPOT' })}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      addForm.rattachement_type === 'ENTREPOT'
                        ? 'bg-teal-50 text-teal-700 border-teal-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Warehouse className="w-3 h-3" />
                    <span>Entrepôt</span>
                  </button>
                </div>

                {/* Conditional Rattachement Dropdowns */}
                {addForm.rattachement_type === 'MACHINE' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">
                      Machine Active Destinataire
                    </label>
                    <select
                      value={addForm.id_machine_registered}
                      onChange={(e) => {
                        const mch = machines.find(
                          (m) => m.id_machine_registered === e.target.value
                        );
                        setAddForm({
                          ...addForm,
                          id_machine_registered: e.target.value,
                          id_zone: mch?.id_zone_default || addForm.id_zone,
                        });
                      }}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-purple-800 focus:border-teal-500 outline-none"
                    >
                      {machines.map((m) => (
                        <option key={m.id_machine_registered} value={m.id_machine_registered}>
                          {m.id_machine_registered} - {m.designation}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {addForm.rattachement_type === 'ZONE' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Zone d'Atelier</label>
                    <select
                      value={addForm.id_zone}
                      onChange={(e) => setAddForm({ ...addForm, id_zone: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-amber-800 focus:border-teal-500 outline-none"
                    >
                      {zones.map((z) => (
                        <option key={z.id_zone} value={z.id_zone}>
                          {z.libelle} ({z.id_zone})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Status, Technician & Emplacement */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Statut *</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-teal-500 outline-none"
                  >
                    <option value="En service">En service</option>
                    <option value="En stock (Disponible)">En stock (Disponible)</option>
                    <option value="En révision / Externe">En révision / Externe</option>
                    <option value="Hors service">Hors service</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Technicien Responsable
                  </label>
                  <select
                    value={addForm.technician}
                    onChange={(e) => setAddForm({ ...addForm, technician: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-teal-500 outline-none"
                  >
                    <option value="">-- Aucun --</option>
                    {technicians.map((t) => (
                      <option key={t.id_technician || t.nom} value={t.nom}>
                        {t.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Emplacement / Rayon
                  </label>
                  <input
                    type="text"
                    value={addForm.emplacement}
                    onChange={(e) => setAddForm({ ...addForm, emplacement: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-medium focus:border-teal-500 outline-none"
                    placeholder="E-MAG-01"
                  />
                </div>
              </div>

              {/* Remarques */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Remarques / Suivi Prestataire Externe
                </label>
                <textarea
                  rows="2"
                  value={addForm.remarques}
                  onChange={(e) => setAddForm({ ...addForm, remarques: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-teal-500 outline-none"
                  placeholder="Notes sur la révision, vulcanisation, bobinage..."
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer l'Élément</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT MODAL (Dual Twin Architecture) */}
      {toEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Modifier : {toEdit.id_warehouse_item}
                  </h3>
                  <p className="text-xs text-slate-500">Mise à jour de la fiche élément</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setToEdit(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-4 sm:p-5 space-y-4 text-xs">
              {/* Nature Selector in Edit */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nature de l'Élément
                </label>
                <select
                  value={editForm.nature}
                  onChange={(e) => setEditForm({ ...editForm, nature: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-blue-500 outline-none"
                >
                  <option value="PARTIE">⚡ PARTIE (Machine Twin - Family/Template)</option>
                  <option value="COMPOSANT">🧩 COMPOSANT (Stock Twin - Type/Désignation)</option>
                </select>
              </div>

              {/* Conditional Twin Selectors in Edit */}
              {editForm.nature === 'PARTIE' ? (
                <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div>
                    <label className="text-[11px] font-bold text-blue-900 block mb-1">
                      Famille Machine
                    </label>
                    <select
                      value={editForm.id_family}
                      onChange={(e) => setEditForm({ ...editForm, id_family: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    >
                      {families.map((f) => (
                        <option key={f.id_family} value={f.id_family}>
                          {f.libelle} ({f.id_family})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-blue-900 block mb-1">
                      Modèle / Template
                    </label>
                    <select
                      value={editForm.id_templates}
                      onChange={(e) => setEditForm({ ...editForm, id_templates: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:border-blue-500 outline-none"
                    >
                      <option value="">-- Aucun Template --</option>
                      {templates
                        .filter((t) => !editForm.id_family || t.id_family === editForm.id_family)
                        .map((t) => (
                          <option key={t.id_templates} value={t.id_templates}>
                            {t.libelle} ({t.id_templates})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div>
                    <label className="text-[11px] font-bold text-indigo-900 block mb-1">
                      Type de Pièce (Stock)
                    </label>
                    <select
                      value={editForm.id_type}
                      onChange={(e) => setEditForm({ ...editForm, id_type: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:border-indigo-500 outline-none"
                    >
                      {types.map((t) => (
                        <option key={t.id_type} value={t.id_type}>
                          {t.libelle} ({t.id_type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-indigo-900 block mb-1">
                      Diagnostic / Article Réf.
                    </label>
                    <select
                      value={editForm.id_diag}
                      onChange={(e) => setEditForm({ ...editForm, id_diag: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:border-indigo-500 outline-none"
                    >
                      <option value="">-- Saisie libre / Aucun --</option>
                      {diagnostics
                        .filter((d) => !editForm.id_type || d.id_type === editForm.id_type)
                        .map((d) => (
                          <option key={d.id_diag} value={d.id_diag}>
                            {d.libelle}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Code</label>
                  <input
                    type="text"
                    disabled
                    value={editForm.id_warehouse_item}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-100 text-xs font-mono font-bold text-slate-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Désignation *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Rattachement
                  </label>
                  <select
                    value={editForm.rattachement_type}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        rattachement_type: e.target.value,
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-blue-500 outline-none"
                  >
                    <option value="MACHINE">Machine</option>
                    <option value="ZONE">Zone</option>
                    <option value="ENTREPOT">Entrepôt</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Statut</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-blue-500 outline-none"
                  >
                    <option value="En service">En service</option>
                    <option value="En stock (Disponible)">En stock (Disponible)</option>
                    <option value="En révision / Externe">En révision / Externe</option>
                    <option value="Hors service">Hors service</option>
                  </select>
                </div>
              </div>

              {editForm.rattachement_type === 'MACHINE' ? (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Machine Cible
                  </label>
                  <select
                    value={editForm.id_machine_registered}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        id_machine_registered: e.target.value,
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-purple-800 focus:border-blue-500 outline-none"
                  >
                    <option value="">-- Aucune --</option>
                    {machines.map((m) => (
                      <option key={m.id_machine_registered} value={m.id_machine_registered}>
                        {m.id_machine_registered} - {m.designation}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Emplacement / Rayon
                  </label>
                  <input
                    type="text"
                    value={editForm.emplacement}
                    onChange={(e) => setEditForm({ ...editForm, emplacement: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:border-blue-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Remarques / Notes
                </label>
                <textarea
                  rows="2"
                  value={editForm.remarques}
                  onChange={(e) => setEditForm({ ...editForm, remarques: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-blue-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setToEdit(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer Modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. DELETE CONFIRMATION MODAL */}
      {toDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Confirmer la suppression</h3>
              <p className="text-xs text-slate-500 mt-1">
                Êtes-vous sûr de vouloir supprimer l'élément{' '}
                <span className="font-mono font-bold text-slate-900">
                  {toDelete.id_warehouse_item}
                </span>{' '}
                ({toDelete.designation}) ?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition cursor-pointer text-xs shadow-xs"
              >
                Oui, Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. DETAILS MODAL */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {selectedDetails.id_warehouse_item}
                  </h3>
                  <p className="text-xs text-slate-500">Fiche technique GMAO</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetails(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Désignation</div>
                <div className="font-semibold text-slate-900">{selectedDetails.designation}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Nature (Twin)</div>
                  <div className="font-bold text-slate-800">
                    {selectedDetails.nature === 'PARTIE' ? '⚡ Partie (Machine)' : '🧩 Composant (Stock)'}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Statut</div>
                  <div className="font-bold text-slate-800">{selectedDetails.status}</div>
                </div>
              </div>

              {selectedDetails.nature === 'PARTIE' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="text-[10px] font-bold text-blue-700 uppercase">Famille [D]</div>
                    <div className="font-bold text-slate-800">{selectedDetails.id_family || '--'}</div>
                  </div>
                  <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="text-[10px] font-bold text-blue-700 uppercase">Template [E]</div>
                    <div className="font-bold text-slate-800">{selectedDetails.id_templates || '--'}</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <div className="text-[10px] font-bold text-indigo-700 uppercase">Type Pièce [B]</div>
                    <div className="font-bold text-slate-800">{selectedDetails.id_type || '--'}</div>
                  </div>
                  <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <div className="text-[10px] font-bold text-indigo-700 uppercase">Diagnostic / Ref [C]</div>
                    <div className="font-bold text-slate-800">{selectedDetails.id_diag || 'Spécifique'}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Rattachement</div>
                  <div className="font-bold text-slate-800">
                    {selectedDetails.rattachement_type === 'MACHINE'
                      ? `Machine : ${selectedDetails.id_machine_registered}`
                      : selectedDetails.rattachement_type === 'ZONE'
                        ? `Zone : ${selectedDetails.id_zone}`
                        : 'Entrepôt Central'}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Emplacement</div>
                  <div className="font-mono font-bold text-slate-800">
                    {selectedDetails.emplacement || '--'}
                  </div>
                </div>
              </div>

              {selectedDetails.remarques && (
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Remarques / Observations
                  </div>
                  <div className="text-slate-700">{selectedDetails.remarques}</div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
