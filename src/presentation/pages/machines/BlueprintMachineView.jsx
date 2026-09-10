import { useState, useRef, useMemo, useEffect } from 'react';
import AnimatedPage from '../../components/common/AnimatedPage';
import CustomSelect from '../../components/common/CustomSelect';
import SequentialCodePicker from '../../components/common/SequentialCodePicker';
import {
  FingerprintPattern,
  Layers,
  Plus,
  Search,
  ArrowRight,
  FolderTree,
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
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Factory,
} from 'lucide-react';
import { HubIcon } from '../../components/common/icons/HubIcon';
import { CategoryIcon } from '../../components/common/icons/CategoryIcon';

const SCHEMA_TYPES = [
  { value: 'Mécanique', label: 'Mécanique' },
  { value: 'Électrique', label: 'Électrique' },
  { value: 'Hydraulique', label: 'Hydraulique' },
  { value: 'Pneumatique', label: 'Pneumatique' },
  { value: 'Pneumo-Mécanique', label: 'Pneumo-Mécanique' },
  { value: 'Synoptique', label: 'Synoptique' },
];

const STATUS_OPTIONS = [
  { value: 'Approuvé', label: 'Approuvé' },
  { value: 'En Révision', label: 'En Révision' },
  { value: 'Archivé', label: 'Archivé' },
];

export default function BlueprintMachineView({
  blueprints = [],
  templates = [],
  families = [],
  machines = [],
  blueprintFamilyFilter = 'ALL',
  setBlueprintFamilyFilter = () => {},
  blueprintTemplateFilter = 'ALL',
  setBlueprintTemplateFilter = () => {},
  onAddBlueprint = () => {},
  onUpdateBlueprint = () => {},
  onDeleteBlueprint = () => {},
  onOpenAddFamilyModal = () => {},
  onOpenAddTemplateModal = () => {},
  onNavigateToMachinesByTemplate = () => {},
  onNavigateToFamily = () => {},
  onNavigateToTemplate = () => {},
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
  const [form, setForm] = useState({
    id_blueprint: '',
    libelle: '',
    id_family: families[0]?.id_family || '',
    id_templates: templates[0]?.id_templates || '',
    ref_plan: '',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Mécanique',
    description: '',
  });
  const [toEdit, setToEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  // Taken blueprint numbers for SequentialCodePicker
  const takenBlueprintNumbers = useMemo(() => {
    const set = new Set();
    blueprints.forEach((b) => {
      const match = String(b.id_blueprint || '').match(/BPT-(\d+)/i) || String(b.id_blueprint || '').match(/-(\d+)$/);
      if (match) {
        set.add(parseInt(match[1], 10));
      }
    });
    return set;
  }, [blueprints]);

  // Next auto-generated ID for Add Modal
  const autoNextBlueprintId = useMemo(() => {
    let nextNum = 1;
    while (takenBlueprintNumbers.has(nextNum) && nextNum < 999) {
      nextNum++;
    }
    return `BPT-${String(nextNum).padStart(2, '0')}`;
  }, [takenBlueprintNumbers]);

  // Available templates based on selected family in modal
  const modalTemplates = useMemo(() => {
    if (!form.id_family) return templates;
    const filtered = templates.filter((t) => t.id_family === form.id_family);
    return filtered.length > 0 ? filtered : templates;
  }, [templates, form.id_family]);

  // Available templates based on selected family in edit modal
  const editModalTemplates = useMemo(() => {
    if (!toEdit?.id_family) return templates;
    const filtered = templates.filter((t) => t.id_family === toEdit.id_family);
    return filtered.length > 0 ? filtered : templates;
  }, [templates, toEdit?.id_family]);

  // Filtered templates for filter bar
  const filterBarTemplates = useMemo(() => {
    if (blueprintFamilyFilter === 'ALL') return templates;
    return templates.filter((t) => t.id_family === blueprintFamilyFilter);
  }, [templates, blueprintFamilyFilter]);

  // Filtered blueprints list
  const filtered = useMemo(() => {
    return blueprints.filter((b) => {
      if (blueprintFamilyFilter !== 'ALL' && b.id_family !== blueprintFamilyFilter) return false;
      if (blueprintTemplateFilter !== 'ALL' && b.id_templates !== blueprintTemplateFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        String(b?.id_blueprint || '').toLowerCase().includes(q) ||
        String(b?.libelle || '').toLowerCase().includes(q) ||
        String(b?.id_family || '').toLowerCase().includes(q) ||
        String(b?.id_templates || '').toLowerCase().includes(q) ||
        String(b?.ref_plan || '').toLowerCase().includes(q) ||
        String(b?.type_schema || '').toLowerCase().includes(q) ||
        String(b?.statut || '').toLowerCase().includes(q) ||
        String(b?.description || '').toLowerCase().includes(q)
      );
    });
  }, [blueprints, blueprintFamilyFilter, blueprintTemplateFilter, search]);

  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('id_blueprint');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortMenuRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, blueprintFamilyFilter, blueprintTemplateFilter, sortField, sortOrder]);

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

  const handleOpenAdd = () => {
    const defaultFam = families[0]?.id_family || '';
    const matchingTpls = templates.filter((t) => t.id_family === defaultFam);
    setForm({
      id_blueprint: autoNextBlueprintId,
      libelle: '',
      id_family: defaultFam,
      id_templates: matchingTpls[0]?.id_templates || templates[0]?.id_templates || '',
      ref_plan: '',
      revision: 'Rev-A',
      statut: 'Approuvé',
      type_schema: 'Mécanique',
      description: '',
    });
    setShowAddModal(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!form.id_blueprint || !form.libelle || !form.id_family || !form.id_templates) return;
    onAddBlueprint(form);
    setShowAddModal(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!toEdit || !toEdit.id_blueprint || !toEdit.libelle) return;
    onUpdateBlueprint(toEdit.id_blueprint, toEdit);
    setToEdit(null);
  };

  const handleConfirmDelete = () => {
    if (toDelete) {
      onDeleteBlueprint(toDelete.id_blueprint);
      setToDelete(null);
    }
  };

  return (
    <AnimatedPage className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 sm:gap-4 w-full">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs font-bold">
            <FingerprintPattern className="w-5 h-5 text-indigo-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Blueprint Machine (Plans & Schémas Niveau 3)
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase">
                Level 3 Blueprint
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rattaché à la <b className="text-cyan-600">Famille</b> (Niveau 1) et au{' '}
              <b className="text-amber-600">Template</b> (Niveau 2). Architecture technique détaillée et plans d'ensemble.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black transition shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Blueprint</span>
        </button>
      </div>

      {/* Excel Formula Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Formule C (Famille Parente)
            </div>
            <div className="font-mono text-xs text-cyan-700 font-semibold mt-0.5">
              =[@id_family] (Niveau 1)
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-xs">
            L1
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Formule D (Template Parent)
            </div>
            <div className="font-mono text-xs text-amber-700 font-semibold mt-0.5">
              =[@id_templates] (Niveau 2)
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
            L2
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Formule E (Machines Liées)
            </div>
            <div className="font-mono text-xs text-emerald-700 font-semibold mt-0.5">
              =COUNTIF(Machines!E:E, [@id_templates])
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
            MCH
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
          {/* Displaying the filtered count */}
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-slate-500">
              <span className="bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-lg font-bold border border-indigo-100">
                {filtered.length} blueprint{filtered.length > 1 ? 's' : ''} trouvé
                {filtered.length > 1 ? 's' : ''}
              </span>
            </div>
            {(blueprintFamilyFilter !== 'ALL' || blueprintTemplateFilter !== 'ALL' || search) && (
              <button
                onClick={() => {
                  setBlueprintFamilyFilter('ALL');
                  setBlueprintTemplateFilter('ALL');
                  setLocalSearch('');
                  setSearch('');
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
              Recherche Blueprint
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par ID, libellé, plan..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Filter by Family */}
          <div className="w-full">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Famille Parente (L1)
            </label>
            <CustomSelect
              options={[
                { value: 'ALL', label: 'Toutes les familles' },
                ...families.map((f) => ({
                  value: f.id_family,
                  label: `${f.id_family} - ${f.libelle}`,
                })),
              ]}
              value={blueprintFamilyFilter}
              onChange={(val) => {
                setBlueprintFamilyFilter(val);
                setBlueprintTemplateFilter('ALL');
              }}
              placeholder="Filtrer par Famille"
            />
          </div>

          {/* Filter by Template */}
          <div className="w-full">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Template Parent (L2)
            </label>
            <CustomSelect
              options={[
                { value: 'ALL', label: 'Tous les templates' },
                ...filterBarTemplates.map((t) => ({
                  value: t.id_templates,
                  label: `${t.id_templates} - ${t.libelle}`,
                })),
              ]}
              value={blueprintTemplateFilter}
              onChange={setBlueprintTemplateFilter}
              placeholder="Filtrer par Template"
            />
          </div>

          {/* Sort & Pagination Options */}
          <div className="flex items-center gap-2">
            {/* Sort Menu Button */}
            <div className="relative flex-1" ref={sortMenuRef}>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Trier par
              </label>
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                <span className="truncate">
                  {sortField === 'id_blueprint' && 'ID Blueprint'}
                  {sortField === 'libelle' && 'Libellé'}
                  {sortField === 'id_family' && 'Famille'}
                  {sortField === 'id_templates' && 'Template'}
                  {sortField === 'type_schema' && 'Type Schéma'}
                  {sortField === 'statut' && 'Statut'}
                  {' '}({sortOrder === 'asc' ? 'Croissant' : 'Décroissant'})
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1.5 space-y-1">
                  {[
                    { id: 'id_blueprint', label: 'ID Blueprint' },
                    { id: 'libelle', label: 'Libellé / Schéma' },
                    { id: 'id_family', label: 'Famille Parente' },
                    { id: 'id_templates', label: 'Template Parent' },
                    { id: 'type_schema', label: 'Type Schéma' },
                    { id: 'statut', label: 'Statut' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        handleSort(opt.id);
                        setShowSortMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium ${
                        sortField === opt.id
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortField === opt.id && (
                        <span className="text-[10px] text-indigo-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Page Size Selector */}
            <div className="w-24">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Afficher
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={0}>Tous</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th
                  onClick={() => handleSort('id_blueprint')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition group select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ID Blueprint</span>
                    {renderSortIcon('id_blueprint')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('libelle')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition group select-none min-w-[220px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Schéma & Plan Technique</span>
                    {renderSortIcon('libelle')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('id_family')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition group select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Famille (L1)</span>
                    {renderSortIcon('id_family')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('id_templates')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition group select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Template (L2)</span>
                    {renderSortIcon('id_templates')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('type_schema')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition group select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Type & Réf Plan</span>
                    {renderSortIcon('type_schema')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('statut')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition group select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Statut & Rév.</span>
                    {renderSortIcon('statut')}
                  </div>
                </th>
                <th className="py-3 px-4 text-center whitespace-nowrap">
                  <span>Nb Machines</span>
                </th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FingerprintPattern className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-600">
                      Aucun blueprint trouvé
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Essayez d'ajuster vos filtres de recherche ou créez un nouveau blueprint.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedData.map((b) => {
                  const matchingFamily = families.find((f) => f.id_family === b.id_family);
                  const matchingTemplate = templates.find((t) => t.id_templates === b.id_templates);
                  const relatedMachinesCount = machines.filter(
                    (m) => m.id_templates === b.id_templates
                  ).length;

                  return (
                    <tr
                      key={b.id_blueprint}
                      className="hover:bg-slate-50/80 transition-colors duration-150 group"
                    >
                      {/* ID Blueprint */}
                      <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs">
                          <FingerprintPattern className="w-3.5 h-3.5 text-indigo-600" />
                          {b.id_blueprint}
                        </span>
                      </td>

                      {/* Libellé & Description */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 leading-snug">
                          {b.libelle}
                        </div>
                        {b.description && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {b.description}
                          </div>
                        )}
                      </td>

                      {/* Famille Parente (Level 1) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => onNavigateToFamily && onNavigateToFamily(b.id_family)}
                          title={`Voir la famille ${b.id_family}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200 transition font-medium text-xs cursor-pointer group/fam"
                        >
                          <HubIcon className="w-3.5 h-3.5 text-cyan-600 group-hover/fam:scale-110 transition-transform" />
                          <span className="font-mono font-bold">{b.id_family}</span>
                          {matchingFamily && (
                            <span className="text-slate-500 text-[10.5px] max-w-[100px] truncate hidden md:inline">
                              - {matchingFamily.libelle}
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Template Parent (Level 2) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => onNavigateToTemplate && onNavigateToTemplate(b.id_family, b.id_templates)}
                          title={`Voir le template ${b.id_templates}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition font-medium text-xs cursor-pointer group/tpl"
                        >
                          <CategoryIcon className="w-3.5 h-3.5 text-amber-600 group-hover/tpl:scale-110 transition-transform" />
                          <span className="font-mono font-bold">{b.id_templates}</span>
                          {matchingTemplate && (
                            <span className="text-slate-500 text-[10.5px] max-w-[100px] truncate hidden md:inline">
                              - {matchingTemplate.libelle}
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Type & Réf Plan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            {b.type_schema || 'Mécanique'}
                          </span>
                          {b.ref_plan && (
                            <span className="font-mono text-[10.5px] text-slate-500">
                              {b.ref_plan}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Statut & Révision */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${
                              b.statut === 'Approuvé'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : b.statut === 'En Révision'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {b.statut === 'Approuvé' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {b.statut === 'En Révision' && <Clock className="w-3 h-3 mr-1" />}
                            {b.statut || 'Approuvé'}
                          </span>
                          {b.revision && (
                            <span className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                              {b.revision}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Nb Machines Liées */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() =>
                            onNavigateToMachinesByTemplate(b.id_family, b.id_templates)
                          }
                          title="Filtrer les machines par ce modèle"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition text-xs cursor-pointer group/mch"
                        >
                          <Factory className="w-3.5 h-3.5 text-slate-500 group-hover/mch:text-slate-800" />
                          <span>{relatedMachinesCount}</span>
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover/mch:opacity-100 transition-opacity" />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setToEdit({ ...b })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setToDelete(b)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Affichage de {startIndex + 1} à {Math.min(startIndex + effectivePageSize, totalItems)}{' '}
              sur {totalItems} blueprints
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 font-medium font-mono text-slate-700">
                Page {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                  <FingerprintPattern className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Nouveau Blueprint Machine</h3>
                  <p className="text-[11px] text-slate-500">
                    Niveau 3 de la hiérarchie Machine
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="space-y-4 pt-4">
              {/* Sequential Code Picker for Blueprint */}
              <div>
                <SequentialCodePicker
                  prefix="BPT-"
                  currentCode={form.id_blueprint}
                  onChangeCode={(newCode) => setForm((prev) => ({ ...prev, id_blueprint: newCode }))}
                  autoGeneratedCode={autoNextBlueprintId}
                  takenNumbers={takenBlueprintNumbers}
                  label="Code Identifiant Blueprint (Niveau 3)"
                  helperText="Format standard BPT-01, BPT-02..."
                />
              </div>

              {/* Libellé */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Libellé du Schéma / Plan Technique <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Schéma Cinématique Poupée Fixe & Broche"
                  value={form.libelle}
                  onChange={(e) => setForm((prev) => ({ ...prev, libelle: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Famille Parente (L1) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Famille Parente (L1) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      onOpenAddFamilyModal();
                    }}
                    className="text-[11px] text-cyan-600 hover:underline font-semibold"
                  >
                    + Créer famille
                  </button>
                </div>
                <CustomSelect
                  options={families.map((f) => ({
                    value: f.id_family,
                    label: `${f.id_family} - ${f.libelle}`,
                  }))}
                  value={form.id_family}
                  onChange={(val) => {
                    const matched = templates.filter((t) => t.id_family === val);
                    setForm((prev) => ({
                      ...prev,
                      id_family: val,
                      id_templates: matched[0]?.id_templates || templates[0]?.id_templates || '',
                    }));
                  }}
                  placeholder="Sélectionner une Famille"
                />
              </div>

              {/* Template Parent (L2) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Template Parent (L2) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      onOpenAddTemplateModal();
                    }}
                    className="text-[11px] text-amber-600 hover:underline font-semibold"
                  >
                    + Créer template
                  </button>
                </div>
                <CustomSelect
                  options={modalTemplates.map((t) => ({
                    value: t.id_templates,
                    label: `${t.id_templates} - ${t.libelle}`,
                  }))}
                  value={form.id_templates}
                  onChange={(val) => setForm((prev) => ({ ...prev, id_templates: val }))}
                  placeholder="Sélectionner un Template"
                />
              </div>

              {/* Type de Schéma & Référence Plan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Type de Schéma
                  </label>
                  <CustomSelect
                    options={SCHEMA_TYPES}
                    value={form.type_schema}
                    onChange={(val) => setForm((prev) => ({ ...prev, type_schema: val }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Réf. Plan (DWG / SCH)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: DWG-TR-001-A"
                    value={form.ref_plan}
                    onChange={(e) => setForm((prev) => ({ ...prev, ref_plan: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Statut & Révision */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Statut du Document
                  </label>
                  <CustomSelect
                    options={STATUS_OPTIONS}
                    value={form.statut}
                    onChange={(val) => setForm((prev) => ({ ...prev, statut: val }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Indice Révision
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Rev-A, v1.0"
                    value={form.revision}
                    onChange={(e) => setForm((prev) => ({ ...prev, revision: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes & Spécifications Techniques
                </label>
                <textarea
                  rows={2}
                  placeholder="Tolérances, chaîne cinématique, références composants..."
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black transition cursor-pointer shadow-xs"
                >
                  Ajouter le Blueprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {toEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Modifier Blueprint {toEdit.id_blueprint}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Mise à jour des métadonnées du schéma
                  </p>
                </div>
              </div>
              <button
                onClick={() => setToEdit(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Code Blueprint
                </label>
                <input
                  type="text"
                  disabled
                  value={toEdit.id_blueprint}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 font-mono text-xs text-slate-500 cursor-not-allowed font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Libellé du Schéma <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={toEdit.libelle}
                  onChange={(e) => setToEdit((prev) => ({ ...prev, libelle: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Famille Parente (L1) <span className="text-rose-500">*</span>
                </label>
                <CustomSelect
                  options={families.map((f) => ({
                    value: f.id_family,
                    label: `${f.id_family} - ${f.libelle}`,
                  }))}
                  value={toEdit.id_family}
                  onChange={(val) => {
                    const matched = templates.filter((t) => t.id_family === val);
                    setToEdit((prev) => ({
                      ...prev,
                      id_family: val,
                      id_templates: matched[0]?.id_templates || templates[0]?.id_templates || '',
                    }));
                  }}
                  placeholder="Sélectionner une Famille"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Template Parent (L2) <span className="text-rose-500">*</span>
                </label>
                <CustomSelect
                  options={editModalTemplates.map((t) => ({
                    value: t.id_templates,
                    label: `${t.id_templates} - ${t.libelle}`,
                  }))}
                  value={toEdit.id_templates}
                  onChange={(val) => setToEdit((prev) => ({ ...prev, id_templates: val }))}
                  placeholder="Sélectionner un Template"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Type de Schéma
                  </label>
                  <CustomSelect
                    options={SCHEMA_TYPES}
                    value={toEdit.type_schema || 'Mécanique'}
                    onChange={(val) => setToEdit((prev) => ({ ...prev, type_schema: val }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Réf. Plan
                  </label>
                  <input
                    type="text"
                    value={toEdit.ref_plan || ''}
                    onChange={(e) => setToEdit((prev) => ({ ...prev, ref_plan: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Statut
                  </label>
                  <CustomSelect
                    options={STATUS_OPTIONS}
                    value={toEdit.statut || 'Approuvé'}
                    onChange={(val) => setToEdit((prev) => ({ ...prev, statut: val }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Révision
                  </label>
                  <input
                    type="text"
                    value={toEdit.revision || ''}
                    onChange={(e) => setToEdit((prev) => ({ ...prev, revision: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes & Spécifications
                </label>
                <textarea
                  rows={2}
                  value={toEdit.description || ''}
                  onChange={(e) => setToEdit((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setToEdit(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black transition cursor-pointer shadow-xs"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Confirmer la suppression</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Êtes-vous sûr de vouloir supprimer le blueprint{' '}
              <b className="font-mono text-slate-900 font-bold">{toDelete.id_blueprint}</b> (
              {toDelete.libelle}) ?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setToDelete(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer shadow-xs"
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
