import { useState, useMemo, useEffect } from 'react';
import AnimatedPage from '../../components/common/AnimatedPage';
import SequentialCodePicker from '../../components/common/SequentialCodePicker';
import {
  FingerprintPattern,
  Layers,
  Plus,
  Search,
  Trash2,
  Edit2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Sparkles,
  Factory,
  Wrench,
  Zap,
  Info,
  X,
} from 'lucide-react';
import { CubeIcon } from '../../components/common/icons/CubeIcon';
import { LayersIcon } from '../../components/common/icons/LayersIcon';

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
  compFamilies: _compFamilies = [],
  compTemplates = [],
  partTypes = [],
  partDesignations = [],
  stockItems = [],
  warehouseItems: _warehouseItems = [],
  mouvements = [],
  blueprintFamilyFilter = 'ALL',
  setBlueprintFamilyFilter = () => {},
  blueprintTemplateFilter = 'ALL',
  setBlueprintTemplateFilter = () => {},
  onAddBlueprint = () => {},
  onUpdateBlueprint = () => {},
  onDeleteBlueprint = () => {},
  onOpenAddFamilyModal: _onOpenAddFamilyModal = () => {},
  onOpenAddTemplateModal: _onOpenAddTemplateModal = () => {},
  onNavigateToMachinesByTemplate: _onNavigateToMachinesByTemplate = () => {},
  onNavigateToFamily: _onNavigateToFamily = () => {},
  onNavigateToTemplate: _onNavigateToTemplate = () => {},
  onNavigateToTab = () => {},
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
  const [activeModalTab, setActiveModalTab] = useState('specs'); // 'specs' | 'components' | 'parts' | 'pdr'
  const [selectedInspectBlueprint, setSelectedInspectBlueprint] = useState(null);
  const [inspectActiveTab, setInspectActiveTab] = useState('specs');

  // Form State for Add/Edit Blueprint with 4-Tab BOM architecture
  const initialFormState = {
    id_blueprint: '',
    libelle: '',
    id_family: families[0]?.id_family || '',
    id_templates: templates[0]?.id_templates || '',
    ref_plan: '',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Mécanique',
    description: '',
    specs: {
      puissance: '',
      course: '',
      moteur: '',
      dimensions: '',
    },
    components_theoriques: [],
    parts_theoriques: [],
    pdr_theoriques: [],
  };

  const [form, setForm] = useState(initialFormState);
  const [toEdit, setToEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  // Helper inputs for adding items into Tab 2, 3, 4
  const [newCompItem, setNewCompItem] = useState({ id_component: '', libelle: '', qte: 1 });
  const [newPartItem, setNewPartItem] = useState({ id_part: '', libelle: '', qte: 1 });
  const [newPdrItem, setNewPdrItem] = useState({ id_pdr: '', libelle: '', qte: 1, criticite: 'Haute' });

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

  const editModalTemplates = useMemo(() => {
    if (!toEdit?.id_family) return templates;
    const filtered = templates.filter((t) => t.id_family === toEdit.id_family);
    return filtered.length > 0 ? filtered : templates;
  }, [templates, toEdit?.id_family]);

  // Sorting
  const [sortField, setSortField] = useState('id_blueprint');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtered templates for filter bar
  const availableFilterTemplates = useMemo(() => {
    if (blueprintFamilyFilter === 'ALL') return templates;
    return templates.filter((t) => t.id_family === blueprintFamilyFilter);
  }, [templates, blueprintFamilyFilter]);

  // Filtered blueprints list
  const filteredBlueprints = useMemo(() => {
    return blueprints.filter((b) => {
      if (blueprintFamilyFilter !== 'ALL' && b.id_family !== blueprintFamilyFilter) return false;
      if (blueprintTemplateFilter !== 'ALL' && b.id_templates !== blueprintTemplateFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const bId = String(b.id_blueprint || '').toLowerCase();
        const bLib = String(b.libelle || '').toLowerCase();
        const bPlan = String(b.ref_plan || '').toLowerCase();
        const bFam = String(b.id_family || '').toLowerCase();
        const bTpl = String(b.id_templates || '').toLowerCase();
        const bType = String(b.type_schema || '').toLowerCase();
        if (
          !bId.includes(q) &&
          !bLib.includes(q) &&
          !bPlan.includes(q) &&
          !bFam.includes(q) &&
          !bTpl.includes(q) &&
          !bType.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [blueprints, blueprintFamilyFilter, blueprintTemplateFilter, search]);

  // Sorted blueprints
  const sortedBlueprints = useMemo(() => {
    return [...filteredBlueprints].sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredBlueprints, sortField, sortOrder]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const totalPages = Math.max(1, Math.ceil(sortedBlueprints.length / itemsPerPage));
  const paginatedBlueprints = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedBlueprints.slice(start, start + itemsPerPage);
  }, [sortedBlueprints, currentPage, itemsPerPage]);

  // Map of machine counts per blueprint
  const blueprintMachineCountMap = useMemo(() => {
    const counts = {};
    machines.forEach((m) => {
      if (m.id_blueprint) {
        counts[m.id_blueprint] = (counts[m.id_blueprint] || 0) + 1;
      }
    });
    return counts;
  }, [machines]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setForm({
      ...initialFormState,
      id_blueprint: autoNextBlueprintId,
      id_family: families[0]?.id_family || '',
      id_templates: templates[0]?.id_templates || '',
    });
    setActiveModalTab('specs');
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (bp) => {
    setToEdit({
      ...bp,
      specs: {
        puissance: bp.specs?.puissance || '',
        course: bp.specs?.course || '',
        moteur: bp.specs?.moteur || '',
        dimensions: bp.specs?.dimensions || '',
        ...bp.specs,
      },
      components_theoriques: bp.components_theoriques || [],
      parts_theoriques: bp.parts_theoriques || [],
      pdr_theoriques: bp.pdr_theoriques || [],
    });
    setActiveModalTab('specs');
  };

  // Submit Add
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!form.id_blueprint || !form.libelle) return;
    onAddBlueprint(form);
    setShowAddModal(false);
    setForm(initialFormState);
  };

  // Submit Edit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!toEdit.id_blueprint || !toEdit.libelle) return;
    onUpdateBlueprint(toEdit);
    setToEdit(null);
  };

  // Extract real PDR from machine history into form
  const handleExtractFromMachineHistory = (machineCode, target = 'add') => {
    if (!machineCode) return;
    const relatedMvts = mouvements.filter(
      (m) =>
        (m.id_machine_registered === machineCode || m.machine === machineCode) &&
        (m.type === 'Sortie' || m.quantite > 0)
    );

    const map = new Map();
    relatedMvts.forEach((m) => {
      const ref = m.ref || m.id_article;
      if (!ref) return;
      const existing = map.get(ref) || { id_pdr: ref, libelle: ref, qte: 0, criticite: 'Moyenne' };
      existing.qte += Math.abs(Number(m.quantite) || 1);
      map.set(ref, existing);
    });

    const extractedPdr = Array.from(map.values());
    if (extractedPdr.length === 0) {
      alert(`Aucune consommation PDR enregistrée pour la machine ${machineCode}.`);
      return;
    }

    if (target === 'add') {
      setForm((prev) => ({
        ...prev,
        pdr_theoriques: [...prev.pdr_theoriques, ...extractedPdr.filter((x) => !prev.pdr_theoriques.some((p) => p.id_pdr === x.id_pdr))],
      }));
    } else {
      setToEdit((prev) => ({
        ...prev,
        pdr_theoriques: [...prev.pdr_theoriques, ...extractedPdr.filter((x) => !prev.pdr_theoriques.some((p) => p.id_pdr === x.id_pdr))],
      }));
    }
  };

  return (
    <AnimatedPage className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <FingerprintPattern className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>Blueprints Machines (Level 3 - BOM & Spécifications)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Définissez la <b>Nomenclature Maîtresse (BOM)</b> à 4 volets : Spécifications techniques (Loi), Composants (Entrepôt),
            Pièces détachées (Entrepôt) et PDR Consommables critiques. Liaison directe avec les Machines Registered et Nexus.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateToTab('nexus')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition"
          >
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Nexus Matrix</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Blueprint (BOM)</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Family Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium pl-1">Famille :</span>
            <select
              value={blueprintFamilyFilter}
              onChange={(e) => {
                setBlueprintFamilyFilter(e.target.value);
                setBlueprintTemplateFilter('ALL');
              }}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">Toutes les Familles</option>
              {families.map((f, idx) => (
                <option key={`filter-fam-${f.id_family || idx}-${idx}`} value={f.id_family}>
                  {f.id_family} • {f.label_family || f.libelle}
                </option>
              ))}
            </select>
          </div>

          {/* Template Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Modèle :</span>
            <select
              value={blueprintTemplateFilter}
              onChange={(e) => setBlueprintTemplateFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">Tous les Modèles</option>
              {availableFilterTemplates.map((t, idx) => (
                <option key={`filter-tpl-${t.id_templates || idx}-${idx}`} value={t.id_templates}>
                  {t.id_templates} • {t.label_templates || t.libelle}
                </option>
              ))}
            </select>
          </div>

          {(blueprintFamilyFilter !== 'ALL' || blueprintTemplateFilter !== 'ALL') && (
            <button
              onClick={() => {
                setBlueprintFamilyFilter('ALL');
                setBlueprintTemplateFilter('ALL');
              }}
              className="h-8 px-2 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher blueprint, ref plan, schema..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full h-8 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Main Blueprints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('id_blueprint')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Code Blueprint</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('libelle')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Libellé du Plan (BOM)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Famille ➔ Modèle</th>
                <th className="py-3 px-4">Spécifications</th>
                <th className="py-3 px-4 text-center">Composants</th>
                <th className="py-3 px-4 text-center">Parts</th>
                <th className="py-3 px-4 text-center">PDR</th>
                <th className="py-3 px-4 text-center">Machines Liées</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedBlueprints.length > 0 ? (
                paginatedBlueprints.map((bp, idx) => {
                  const mchCount = blueprintMachineCountMap[bp.id_blueprint] || 0;
                  const compCount = bp.components_theoriques?.length || 0;
                  const partsCount = bp.parts_theoriques?.length || 0;
                  const pdrCount = bp.pdr_theoriques?.length || 0;

                  return (
                    <tr
                      key={`bp-row-${bp.id_blueprint || idx}-${idx}`}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md text-[11px]">
                            {bp.id_blueprint}
                          </span>
                          {bp.ref_plan && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              [{bp.ref_plan}]
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{bp.libelle}</div>
                        {bp.description && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{bp.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-bold text-cyan-700">{bp.id_family}</span>
                          <span className="text-slate-300">➔</span>
                          <span className="font-bold text-amber-700">{bp.id_templates}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[11px] text-slate-600">
                          {bp.specs?.puissance ? (
                            <span className="font-semibold text-slate-800">{bp.specs.puissance}</span>
                          ) : (
                            <span className="text-slate-400 italic">Standard</span>
                          )}
                          {bp.specs?.course && <span className="text-slate-400"> • {bp.specs.course}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${compCount > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-400'}`}>
                          {compCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${partsCount > 0 ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-400'}`}>
                          {partsCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${pdrCount > 0 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-400'}`}>
                          {pdrCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            mchCount > 0
                              ? 'bg-slate-100 text-slate-800 border border-slate-200'
                              : 'text-slate-400'
                          }`}
                        >
                          <Factory className="w-3 h-3 text-slate-500" />
                          <span>{mchCount}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                            bp.statut === 'Approuvé'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : bp.statut === 'En Révision'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {bp.statut || 'Approuvé'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedInspectBlueprint(bp);
                              setInspectActiveTab('specs');
                            }}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition"
                            title="Inspecter le BOM 4-Tabs"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(bp)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                            title="Modifier Blueprint"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setToDelete(bp)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition"
                            title="Supprimer Blueprint"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <FingerprintPattern className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div>Aucun blueprint trouvé pour les filtres sélectionnés.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div>
            Affichage de <b>{paginatedBlueprints.length}</b> sur <b>{filteredBlueprints.length}</b> blueprints
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4-Tab Inspect Drawer / Modal */}
      {selectedInspectBlueprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                  <FingerprintPattern className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-700 text-sm">
                      {selectedInspectBlueprint.id_blueprint}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-mono text-slate-600 font-semibold">
                      {selectedInspectBlueprint.ref_plan || 'SANS-REF'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {selectedInspectBlueprint.statut}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedInspectBlueprint.libelle}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedInspectBlueprint(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Tabs Bar */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 bg-white overflow-x-auto">
              <button
                onClick={() => setInspectActiveTab('specs')}
                className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                  inspectActiveTab === 'specs'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>1. Spécifications & Loi</span>
              </button>
              <button
                onClick={() => setInspectActiveTab('components')}
                className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                  inspectActiveTab === 'components'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CubeIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Composants ({selectedInspectBlueprint.components_theoriques?.length || 0})</span>
              </button>
              <button
                onClick={() => setInspectActiveTab('parts')}
                className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                  inspectActiveTab === 'parts'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayersIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>3. Pièces & Visserie ({selectedInspectBlueprint.parts_theoriques?.length || 0})</span>
              </button>
              <button
                onClick={() => setInspectActiveTab('pdr')}
                className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                  inspectActiveTab === 'pdr'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>4. PDR Consommables ({selectedInspectBlueprint.pdr_theoriques?.length || 0})</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {inspectActiveTab === 'specs' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Famille</div>
                      <div className="text-xs font-bold text-cyan-700 mt-0.5">
                        {selectedInspectBlueprint.id_family}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Modèle Template</div>
                      <div className="text-xs font-bold text-amber-700 mt-0.5">
                        {selectedInspectBlueprint.id_templates}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Type Schéma</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {selectedInspectBlueprint.type_schema}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Révision</div>
                      <div className="text-xs font-bold font-mono text-slate-800 mt-0.5">
                        {selectedInspectBlueprint.revision || 'Rev-A'}
                      </div>
                    </div>
                  </div>

                  {/* Technical Specs Details */}
                  <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                    <h4 className="font-bold text-indigo-900 text-xs">Spécifications & Paramètres Constructeur</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500">Puissance / Force :</span>{' '}
                        <b className="text-slate-800">{selectedInspectBlueprint.specs?.puissance || 'Non spécifié'}</b>
                      </div>
                      <div>
                        <span className="text-slate-500">Course / Capacité :</span>{' '}
                        <b className="text-slate-800">{selectedInspectBlueprint.specs?.course || 'Standard'}</b>
                      </div>
                      <div>
                        <span className="text-slate-500">Motorisation :</span>{' '}
                        <b className="text-slate-800">{selectedInspectBlueprint.specs?.moteur || 'Standard'}</b>
                      </div>
                      <div>
                        <span className="text-slate-500">Encombrement (LxPxH) :</span>{' '}
                        <b className="text-slate-800">{selectedInspectBlueprint.specs?.dimensions || 'Non mesuré'}</b>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedInspectBlueprint.description && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Notes & Description</div>
                      {selectedInspectBlueprint.description}
                    </div>
                  )}
                </div>
              )}

              {inspectActiveTab === 'components' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500">
                    Sous-ensembles majeurs et composants d'entrepôt rattachés au schéma :
                  </div>
                  {selectedInspectBlueprint.components_theoriques?.length > 0 ? (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {selectedInspectBlueprint.components_theoriques.map((c, idx) => (
                        <div key={`inspect-comp-${c.id_component || idx}-${idx}`} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                              {c.id_component}
                            </span>
                            <span className="font-semibold text-slate-800">{c.libelle || c.id_component}</span>
                          </div>
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            Qté : {c.qte || 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      Aucun composant majeur spécifié pour ce Blueprint.
                    </div>
                  )}
                </div>
              )}

              {inspectActiveTab === 'parts' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500">
                    Visserie, fixations et pièces d'assemblage magasin requises :
                  </div>
                  {selectedInspectBlueprint.parts_theoriques?.length > 0 ? (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {selectedInspectBlueprint.parts_theoriques.map((p, idx) => (
                        <div key={`inspect-part-${p.id_part || idx}-${idx}`} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px]">
                              {p.id_part}
                            </span>
                            <span className="font-semibold text-slate-800">{p.libelle || p.id_part}</span>
                          </div>
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            Qté : {p.qte || 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      Aucune pièce d'entrepôt spécifiée.
                    </div>
                  )}
                </div>
              )}

              {inspectActiveTab === 'pdr' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500">
                    Pièces de Rechange (PDR) consommables et organes d'usure préventifs :
                  </div>
                  {selectedInspectBlueprint.pdr_theoriques?.length > 0 ? (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {selectedInspectBlueprint.pdr_theoriques.map((p, idx) => (
                        <div key={`inspect-pdr-${p.id_pdr || idx}-${idx}`} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                              {p.id_pdr}
                            </span>
                            <span className="font-semibold text-slate-800">{p.libelle || p.id_pdr}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.criticite === 'Haute'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              Critique : {p.criticite || 'Moyenne'}
                            </span>
                            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              Qté : {p.qte || 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      Aucune PDR théorique renseignée.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedInspectBlueprint(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Blueprint Modal (4-Tabs BOM Master) */}
      {(showAddModal || toEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                  <FingerprintPattern className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {toEdit ? `Modifier Blueprint : ${toEdit.id_blueprint}` : 'Nouveau Blueprint (BOM 4-Tabs)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nomenclature technique complète liant modèle d'usine et composants réels.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setToEdit(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Tabs Bar */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 bg-white overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveModalTab('specs')}
                className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                  activeModalTab === 'specs'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>1. Infos & Spécifications (Loi)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('components')}
                className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                  activeModalTab === 'components'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CubeIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  2. Composants ({toEdit ? toEdit.components_theoriques?.length || 0 : form.components_theoriques?.length || 0})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('parts')}
                className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                  activeModalTab === 'parts'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayersIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  3. Pièces & Visserie ({toEdit ? toEdit.parts_theoriques?.length || 0 : form.parts_theoriques?.length || 0})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('pdr')}
                className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                  activeModalTab === 'pdr'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  4. PDR Consommables ({toEdit ? toEdit.pdr_theoriques?.length || 0 : form.pdr_theoriques?.length || 0})
                </span>
              </button>
            </div>

            <form onSubmit={toEdit ? handleEditSubmit : handleAddSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
                {/* TAB 1: Specs */}
                {activeModalTab === 'specs' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Code Blueprint with SequentialCodePicker */}
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Code Blueprint (Auto / Unique)</label>
                        <SequentialCodePicker
                          prefix="BPT-"
                          currentCode={toEdit ? toEdit.id_blueprint : form.id_blueprint}
                          onChangeCode={(code) => {
                            if (toEdit) setToEdit({ ...toEdit, id_blueprint: code });
                            else setForm({ ...form, id_blueprint: code });
                          }}
                          autoGeneratedCode={autoNextBlueprintId}
                          takenNumbers={takenBlueprintNumbers}
                          disabled={!!toEdit}
                        />
                      </div>

                      {/* Libellé */}
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Libellé du Schéma / Plan *</label>
                        <input
                          type="text"
                          required
                          value={toEdit ? toEdit.libelle : form.libelle}
                          onChange={(e) => {
                            if (toEdit) setToEdit({ ...toEdit, libelle: e.target.value });
                            else setForm({ ...form, libelle: e.target.value });
                          }}
                          placeholder="Ex: Plan Poupée Fixe & Broche"
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Family Selection */}
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Famille Technologique *</label>
                        <select
                          value={toEdit ? toEdit.id_family : form.id_family}
                          onChange={(e) => {
                            const newFam = e.target.value;
                            const tpls = templates.filter((t) => t.id_family === newFam);
                            const firstTpl = tpls[0]?.id_templates || '';
                            if (toEdit) {
                              setToEdit({ ...toEdit, id_family: newFam, id_templates: firstTpl });
                            } else {
                              setForm({ ...form, id_family: newFam, id_templates: firstTpl });
                            }
                          }}
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        >
                          {families.map((f, idx) => (
                            <option key={`modal-fam-${f.id_family || idx}-${idx}`} value={f.id_family}>
                              {f.id_family} • {f.label_family || f.libelle}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Template Selection */}
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Modèle Template de Base *</label>
                        <select
                          value={toEdit ? toEdit.id_templates : form.id_templates}
                          onChange={(e) => {
                            if (toEdit) setToEdit({ ...toEdit, id_templates: e.target.value });
                            else setForm({ ...form, id_templates: e.target.value });
                          }}
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        >
                          {(toEdit ? editModalTemplates : modalTemplates).map((t, idx) => (
                            <option key={`modal-tpl-${t.id_templates || idx}-${idx}`} value={t.id_templates}>
                              {t.id_templates} • {t.label_templates || t.libelle}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Ref Plan */}
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Réf Plan Dessin / DWG</label>
                        <input
                          type="text"
                          value={toEdit ? toEdit.ref_plan : form.ref_plan}
                          onChange={(e) => {
                            if (toEdit) setToEdit({ ...toEdit, ref_plan: e.target.value });
                            else setForm({ ...form, ref_plan: e.target.value });
                          }}
                          placeholder="DWG-TR-001"
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>

                      {/* Revision */}
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Révision</label>
                        <input
                          type="text"
                          value={toEdit ? toEdit.revision : form.revision}
                          onChange={(e) => {
                            if (toEdit) setToEdit({ ...toEdit, revision: e.target.value });
                            else setForm({ ...form, revision: e.target.value });
                          }}
                          placeholder="Rev-A"
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>

                      {/* Statut */}
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Statut</label>
                        <select
                          value={toEdit ? toEdit.statut : form.statut}
                          onChange={(e) => {
                            if (toEdit) setToEdit({ ...toEdit, statut: e.target.value });
                            else setForm({ ...form, statut: e.target.value });
                          }}
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                        >
                          {STATUS_OPTIONS.map((st, idx) => (
                            <option key={`status-opt-${st.value}-${idx}`} value={st.value}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Technical Specs box */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-indigo-600" />
                        <span>Paramètres & Spécifications Physiques (Puissance, Course, Moteur)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-500 font-medium mb-1">Puissance / Tonnage</label>
                          <input
                            type="text"
                            value={toEdit ? toEdit.specs?.puissance || '' : form.specs?.puissance || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (toEdit) setToEdit({ ...toEdit, specs: { ...toEdit.specs, puissance: val } });
                              else setForm({ ...form, specs: { ...form.specs, puissance: val } });
                            }}
                            placeholder="Ex: 200 Tonnes / 7.5 kW"
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-medium mb-1">Course / Déplacement</label>
                          <input
                            type="text"
                            value={toEdit ? toEdit.specs?.course || '' : form.specs?.course || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (toEdit) setToEdit({ ...toEdit, specs: { ...toEdit.specs, course: val } });
                              else setForm({ ...form, specs: { ...form.specs, course: val } });
                            }}
                            placeholder="Ex: 850 mm"
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Components (Warehouse) */}
                {activeModalTab === 'components' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-emerald-900 font-semibold text-xs">
                        Ajoutez les sous-ensembles constructeur issus des modèles de composants d'entrepôt :
                      </div>
                    </div>

                    {/* Quick Add Row */}
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <select
                        value={newCompItem.id_component}
                        onChange={(e) => {
                          const id = e.target.value;
                          const found = compTemplates.find((ct) => ct.id_comp_template === id);
                          setNewCompItem({
                            id_component: id,
                            libelle: found?.label_comp_template || id,
                            qte: 1,
                          });
                        }}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs flex-1"
                      >
                        <option value="">Sélectionner un composant...</option>
                        {compTemplates.map((ct, idx) => (
                          <option key={`comp-tpl-${ct.id_comp_template || idx}-${idx}`} value={ct.id_comp_template}>
                            {ct.id_comp_template} • {ct.label_comp_template || ct.libelle}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={newCompItem.qte}
                        onChange={(e) => setNewCompItem({ ...newCompItem, qte: Number(e.target.value) || 1 })}
                        placeholder="Qté"
                        className="h-8 w-16 px-2 text-center rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          if (!newCompItem.id_component) return;
                          const item = { ...newCompItem };
                          if (toEdit) {
                            setToEdit({
                              ...toEdit,
                              components_theoriques: [...(toEdit.components_theoriques || []), item],
                            });
                          } else {
                            setForm({
                              ...form,
                              components_theoriques: [...form.components_theoriques, item],
                            });
                          }
                          setNewCompItem({ id_component: '', libelle: '', qte: 1 });
                        }}
                        className="h-8 px-3 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition"
                      >
                        Ajouter
                      </button>
                    </div>

                    {/* List */}
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {(toEdit ? toEdit.components_theoriques : form.components_theoriques)?.map((c, idx) => (
                        <div key={`form-comp-${c.id_component || idx}-${idx}`} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                              {c.id_component}
                            </span>
                            <span className="font-semibold text-slate-800">{c.libelle}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-700">Qté: {c.qte}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (toEdit) {
                                  setToEdit({
                                    ...toEdit,
                                    components_theoriques: toEdit.components_theoriques.filter((_, i) => i !== idx),
                                  });
                                } else {
                                  setForm({
                                    ...form,
                                    components_theoriques: form.components_theoriques.filter((_, i) => i !== idx),
                                  });
                                }
                              }}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: Parts (Warehouse) */}
                {activeModalTab === 'parts' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-purple-900 font-semibold text-xs">
                        Ajoutez la visserie et les pièces de structure d'entrepôt :
                      </div>
                    </div>

                    {/* Quick Add Row */}
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <select
                        value={newPartItem.id_part}
                        onChange={(e) => {
                          const id = e.target.value;
                          const found = partDesignations.find((pd) => pd.id_part_designation === id) || partTypes.find((pt) => pt.id_part_type === id);
                          setNewPartItem({
                            id_part: id,
                            libelle: found?.label_part_designation || found?.label_part_type || id,
                            qte: 1,
                          });
                        }}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs flex-1"
                      >
                        <option value="">Sélectionner une pièce...</option>
                        {partTypes.map((pt, idx) => (
                          <option key={`part-type-${pt.id_part_type || idx}-${idx}`} value={pt.id_part_type}>
                            {pt.id_part_type} • {pt.label_part_type || pt.libelle}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={newPartItem.qte}
                        onChange={(e) => setNewPartItem({ ...newPartItem, qte: Number(e.target.value) || 1 })}
                        placeholder="Qté"
                        className="h-8 w-16 px-2 text-center rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          if (!newPartItem.id_part) return;
                          const item = { ...newPartItem };
                          if (toEdit) {
                            setToEdit({
                              ...toEdit,
                              parts_theoriques: [...(toEdit.parts_theoriques || []), item],
                            });
                          } else {
                            setForm({
                              ...form,
                              parts_theoriques: [...form.parts_theoriques, item],
                            });
                          }
                          setNewPartItem({ id_part: '', libelle: '', qte: 1 });
                        }}
                        className="h-8 px-3 rounded-lg bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition"
                      >
                        Ajouter
                      </button>
                    </div>

                    {/* List */}
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {(toEdit ? toEdit.parts_theoriques : form.parts_theoriques)?.map((p, idx) => (
                        <div key={`form-part-${p.id_part || idx}-${idx}`} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[11px]">
                              {p.id_part}
                            </span>
                            <span className="font-semibold text-slate-800">{p.libelle}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-700">Qté: {p.qte}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (toEdit) {
                                  setToEdit({
                                    ...toEdit,
                                    parts_theoriques: toEdit.parts_theoriques.filter((_, i) => i !== idx),
                                  });
                                } else {
                                  setForm({
                                    ...form,
                                    parts_theoriques: form.parts_theoriques.filter((_, i) => i !== idx),
                                  });
                                }
                              }}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: PDR Consommables & Nexus Extraction */}
                {activeModalTab === 'pdr' && (
                  <div className="space-y-4">
                    {/* Nexus Extraction Tool Box */}
                    <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          <span>Extraction Nexus (depuis l'historique d'une Machine)</span>
                        </div>
                        <div className="text-[11px] text-indigo-800 mt-0.5">
                          Remplissez automatiquement la liste des PDR à partir des mouvements réels d'une machine.
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <select
                          id="nexus-mch-select"
                          className="h-8 px-2 rounded-lg border border-indigo-200 bg-white text-xs font-mono text-slate-800"
                        >
                          {machines.map((m, idx) => (
                            <option key={`nexus-mch-${m.id_machine_registered || idx}-${idx}`} value={m.id_machine_registered}>
                              {m.id_machine_registered}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const sel = document.getElementById('nexus-mch-select')?.value;
                            handleExtractFromMachineHistory(sel, toEdit ? 'edit' : 'add');
                          }}
                          className="h-8 px-3 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition"
                        >
                          Extraire
                        </button>
                      </div>
                    </div>

                    {/* Manual PDR Add Row */}
                    <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <select
                        value={newPdrItem.id_pdr}
                        onChange={(e) => {
                          const ref = e.target.value;
                          const found = stockItems.find((s) => s.ref === ref);
                          setNewPdrItem({
                            ...newPdrItem,
                            id_pdr: ref,
                            libelle: found?.designation || ref,
                          });
                        }}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs flex-1 min-w-[160px]"
                      >
                        <option value="">Sélectionner un article PDR...</option>
                        {stockItems.map((s, idx) => (
                          <option key={`pdr-stock-opt-${s.ref || s.id || idx}-${idx}`} value={s.ref}>
                            {s.ref} • {s.designation}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={newPdrItem.qte}
                        onChange={(e) => setNewPdrItem({ ...newPdrItem, qte: Number(e.target.value) || 1 })}
                        placeholder="Qté"
                        className="h-8 w-16 px-2 text-center rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold"
                      />

                      <select
                        value={newPdrItem.criticite}
                        onChange={(e) => setNewPdrItem({ ...newPdrItem, criticite: e.target.value })}
                        className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                      >
                        <option value="Haute">Critique : Haute</option>
                        <option value="Moyenne">Critique : Moyenne</option>
                        <option value="Faible">Critique : Faible</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          if (!newPdrItem.id_pdr) return;
                          const item = { ...newPdrItem };
                          if (toEdit) {
                            setToEdit({
                              ...toEdit,
                              pdr_theoriques: [...(toEdit.pdr_theoriques || []), item],
                            });
                          } else {
                            setForm({
                              ...form,
                              pdr_theoriques: [...form.pdr_theoriques, item],
                            });
                          }
                          setNewPdrItem({ id_pdr: '', libelle: '', qte: 1, criticite: 'Haute' });
                        }}
                        className="h-8 px-3 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition"
                      >
                        Ajouter
                      </button>
                    </div>

                    {/* List */}
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {(toEdit ? toEdit.pdr_theoriques : form.pdr_theoriques)?.map((p, idx) => (
                        <div key={`form-pdr-${p.id_pdr || idx}-${idx}`} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                              {p.id_pdr}
                            </span>
                            <span className="font-semibold text-slate-800">{p.libelle}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.criticite === 'Haute'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {p.criticite || 'Moyenne'}
                            </span>
                            <span className="font-mono font-bold text-slate-700">Qté: {p.qte}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (toEdit) {
                                  setToEdit({
                                    ...toEdit,
                                    pdr_theoriques: toEdit.pdr_theoriques.filter((_, i) => i !== idx),
                                  });
                                } else {
                                  setForm({
                                    ...form,
                                    pdr_theoriques: form.pdr_theoriques.filter((_, i) => i !== idx),
                                  });
                                }
                              }}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  {activeModalTab !== 'pdr' ? 'Onglet suivant pour renseigner les pièces' : 'Prêt à enregistrer'}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setToEdit(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
                  >
                    {toEdit ? 'Enregistrer Modifications' : 'Créer Blueprint BOM'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-5 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Supprimer ce Blueprint ?</h3>
                <div className="font-mono text-xs text-rose-600 font-bold">{toDelete.id_blueprint}</div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Cette action supprimera définitivement le schéma et la nomenclature (BOM) associée. Les machines liées conserveront leurs
              paramètres d'usine standards.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDeleteBlueprint(toDelete.id_blueprint);
                  setToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirmer Suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
