import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Layers,
  Search,
  Check,
  AlertTriangle,
  RotateCcw,
  Plus,
  Trash2,
  Package,
  Wrench,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Cpu, Settings,
  MapPin,
  Users,
  Building2,
  Truck,
  DollarSign,
  Boxes,
  HelpCircle,
  X,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ArrowUpAZ,
  ArrowDownAZ,
  Crown,
  UserCheck,
  ExternalLink,
  Factory,
  ShoppingCart,
  Edit2,
  Activity,
  Sparkles,
  Zap,
  Tag,
  Hash,
  AlertCircle,
  FileText,
  Warehouse,
  Flame,
  CheckCircle2,
  ClipboardList,
  ShieldAlert,
  Inbox,
  Send,
  CornerDownRight,
  Split,
  ChevronsUp,
  RefreshCw,
  Scale,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

import { validateMovementWithContext } from '../utils/formulaEngine';
import MouvementsJournalTable from './MouvementsJournalTable';

// Animation wrapper
function AnimatedPage({ children }) {
  return <div className="space-y-4 animate-in fade-in duration-200">{children}</div>;
}

// Custom Select Component with BDR Light styling and optional onAddNew
function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionner...',
  disabled = false,
  onAddNew,
  addNewLabel = '+ Ajouter...',
  className = '',
  icon = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const q = String(search).toLowerCase();
    return options.filter((opt) => {
      const label = String(opt.label ?? opt.value ?? '');
      const badge = String(opt.badge ?? '');
      const sublabel = String(opt.sublabel ?? '');
      return (
        label.toLowerCase().includes(q) ||
        badge.toLowerCase().includes(q) ||
        sublabel.toLowerCase().includes(q)
      );
    });
  }, [options, search]);

  const selectedOpt = options.find((o) => o.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-8 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between text-left transition cursor-pointer ${
          disabled
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15'
        }`}
      >
        <span className="truncate flex items-center gap-1.5">
          {icon && <span className="shrink-0">{icon}</span>}
          {selectedOpt ? (
            <span className="flex items-center gap-1.5 truncate">
              {selectedOpt.icon && <span className="shrink-0">{selectedOpt.icon}</span>}
              <span className="truncate">{selectedOpt.label}</span>
              {selectedOpt.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                  {selectedOpt.badge}
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-full min-w-[220px] max-w-sm bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-1.5 space-y-1 max-h-60 overflow-y-auto">
            {options.length > 5 && (
              <div className="p-1 border-b border-slate-100 sticky top-0 bg-white">
                <input
                  type="text"
                  placeholder="Filtrer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-7 px-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  autoFocus
                />
              </div>
            )}
            <div className="space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="p-2 text-center text-xs text-slate-400">Aucun résultat</div>
              ) : (
                filteredOptions.map((opt, idx) => (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                      opt.value === value
                        ? 'bg-indigo-50 text-indigo-950 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate flex items-center gap-2">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="truncate">
                        <div className="truncate">{opt.label}</div>
                        {opt.sublabel && <div className="text-[10px] text-slate-400 font-normal truncate">{opt.sublabel}</div>}
                      </div>
                    </div>
                    {opt.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0 ml-1">
                        {opt.badge}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
            {onAddNew && (
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onAddNew();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{addNewLabel}</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function SortieRapideView({
  mouvements = [],
  stockItems = [],
  warehouseItems = [],
  families = [],
  templates = [],
  types = [],
  diagnostics = [],
  zones = [],
  machines = [],
  technicians = [],
  operations = [],
  onAddMouvement,
  onUpdateMouvement,
  onDeleteMouvement,
  onAddWarehouseItem,
  onUpdateWarehouseItem,
  onOpenAddArticle,
  onOpenAddMachine,
  onOpenAddZone,
  onOpenAddTech,
  onOpenAddChef,
  onOpenAddOperator,
  onNavigateToWarehouse,
}) {
  // Navigation Sub-Tabs: 'JOURNAL' | 'COMMANDES' | 'REPARATION_EXTERNE'
  const [activeSubTab, setActiveSubTab] = useState('JOURNAL');

  // Auto-calculation of next sequential Bon code (e.g. Bon-001, Bon-002, ...)
  const getNextBonCode = (mvtList = []) => {
    const nums = (mvtList || [])
      .map((m) => {
        const raw = String(m.code_bon || '');
        const match = raw.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n) && n > 0);
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `Bon-${String(max + 1).padStart(3, '0')}`;
  };

  const getCurrentTimeStr = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Form State
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    heure: getCurrentTimeStr(),
    // 5 Operational Flow Types:
    // 1. 'Sortie Interne' (PDR / PARTIE / COMPOSANT -> Machine/Zone)
    // 2. 'Entrée Interne' (Machine/Atelier -> Stock PDR / Entrepôt)
    // 3. 'Bon de Sortie'  (Entrepôt PARTIE/COMPOSANT -> Réparation Externe / Bobinage)
    // 4. 'Entrée Externe' (Fournisseur/Retour Réparation -> Stock/Entrepôt)
    // 5. 'COMMANDE'       (Demande d'Achat ou Demande de Sortie)
    type: 'Sortie Interne',
    item_source: 'STOCK_PDR', // 'STOCK_PDR' | 'WAREHOUSE_PARTIE' | 'WAREHOUSE_COMPOSANT'
    destination_type: 'STOCK_PDR', // For Entrée: 'STOCK_PDR' | 'WAREHOUSE_PARTIE' | 'WAREHOUSE_COMPOSANT'
    code_bon: getNextBonCode(mouvements),
    is_inconnu: false,
    num_commande: '',
    action_id: 'CORRECTIVE', // CORRECTIVE, PREVENTIVE, AMELIORATIVE, USAGE, REAPPRO, RETOUR, REPARATION_EXTERNE, SOUS_TRAITANCE, COMMANDE_STOCK
    usage_type: 'technician',
    demande_mode: 'ACHAT', // 'ACHAT' (Demande d'Achat) | 'SORTIE_EXT' (Demande de Sortie pour réparation)
    id_zone: zones[0]?.id_zone || '',
    id_machine_registered: machines[0]?.id_machine_registered || '',
    technicien: technicians[0]?.nom || '',
    id_technician: technicians[0]?.id_technician || '',
    operation: '',
    id_operation: '',
    fournisseur: 'Fournisseur Central Industriel',
    prestataire_externe: 'Atelier Bobinage & Rectification Externe',
    emplacement_reception: stockItems[0]?.emplacement || 'Magasin Central - R1',
    entrepot_unit: 'pcs', // 'pcs' | 'ensemble' | 'lot' | 'kg' | 'm'
    entrepot_etat: 'Fonctionnel', // 'Fonctionnel' | 'En révision' | 'Neuf' | 'En attente'
    date_retour_prevue: '',
    commentaire: '',
    pendingCmdId: null,
  });

  // Multi-articles list for the current Bon (up to 5 items)
  const [mouvementItems, setMouvementItems] = useState([
    {
      source: 'STOCK_PDR', // 'STOCK_PDR' | 'WAREHOUSE_PARTIE' | 'WAREHOUSE_COMPOSANT'
      ref: '',
      designation: '',
      quantite: 1,
      unit: 'pcs',
      emplacement: '',
    },
  ]);

  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Keep code_bon up to date when movements collection updates
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      code_bon: prev.is_inconnu
        ? `${getNextBonCode(mouvements)}-INCONNU`
        : getNextBonCode(mouvements),
    }));
  }, [mouvements]);

  // Handle flow type change
  const handleTypeChange = (newType) => {
    let newAction = 'CORRECTIVE';
    let newItemSource = 'STOCK_PDR';
    let newDestType = 'STOCK_PDR';

    if (newType === 'Sortie Interne') {
      newAction = 'CORRECTIVE';
      newItemSource = 'STOCK_PDR';
    } else if (newType === 'Entrée Interne') {
      newAction = 'RETOUR';
      newItemSource = 'STOCK_PDR';
      newDestType = 'STOCK_PDR';
    } else if (newType === 'Bon de Sortie' || newType === 'Sortie Externe') {
      newAction = 'REPARATION_EXTERNE';
      newItemSource = 'WAREHOUSE_PARTIE'; // Dedicated to Warehouse Parts & Components only
    } else if (newType === 'Entrée Externe') {
      newAction = 'REAPPRO';
      newItemSource = 'STOCK_PDR';
    } else if (newType === 'COMMANDE') {
      newAction = 'COMMANDE_ACHAT';
      newItemSource = 'STOCK_PDR';
    }

    setForm((prev) => ({
      ...prev,
      type: newType,
      action_id: newAction,
      item_source: newItemSource,
      destination_type: newDestType,
    }));

    // Reset items source
    setMouvementItems((prev) =>
      prev.map((item) => ({
        ...item,
        source: newItemSource,
      }))
    );
  };

  // Helper to smartly extract, infer or repair OT / Commande value
  const getSmartOtCommande = (m) => {
    if (!m) return 'INCONNU';
    const direct = m.num_commande || m.num_ot || m.code_ot || m.ot || m.commande || m.code_commande;
    if (direct && String(direct).trim() !== '' && String(direct).trim().toUpperCase() !== 'NULL' && String(direct).trim().toUpperCase() !== 'UNDEFINED') {
      return String(direct).trim();
    }
    // Smart inference from commentary: e.g. "OT-1234", "CMD-042", "BC-99", "DA-05"
    if (m.commentaire) {
      const match = String(m.commentaire).match(/\b(OT[-_ ]?[0-9A-Za-z]+|CMD[-_ ]?[0-9A-Za-z]+|BC[-_ ]?[0-9A-Za-z]+|DA[-_ ]?[0-9A-Za-z]+)\b/i);
      if (match) return match[1].toUpperCase();
    }
    // Commande type with code_bon
    if (String(m.type || '').toUpperCase().includes('COMMANDE') && m.code_bon) {
      return `CMD-${String(m.code_bon).replace(/^Bon-/i, '')}`;
    }
    return 'INCONNU';
  };

  // Helper to smartly resolve article metadata (Type, Désignation, Réf, Source) for any movement
  const resolveArticleInfo = (m) => {
    if (!m) return { type: 'PDR Consommable', designation: 'Article non spécifié', ref: '-', sourceCat: 'STOCK_PDR' };

    const rawRef = String(m.ref || m['Référence'] || m['Reference'] || '').trim();
    const directDesig = String(m.designation || m['Désignation'] || m['Designation'] || '').trim();
    const directType = String(m.id_type || m.type_article || m.type || m['Type'] || '').trim();

    // Determine Source Category
    const sourceCat = m.source_category || (
      rawRef.startsWith('MCH-') || rawRef.startsWith('PARTIE-') || rawRef.startsWith('MOT-') || rawRef.startsWith('POM-')
        ? 'WAREHOUSE_PARTIE'
        : rawRef.startsWith('COMP-')
          ? 'WAREHOUSE_COMPOSANT'
          : 'STOCK_PDR'
    );

    const lowerRef = rawRef.toLowerCase();
    const normRef = lowerRef.replace(/[^a-z0-9]/g, '');

    // 1. Warehouse items match
    if (warehouseItems && warehouseItems.length > 0) {
      const whMatch = warehouseItems.find((w) => {
        const wCode = String(w.id_warehouse_item || w.code || w.ref || '').trim().toLowerCase();
        return wCode === lowerRef || (normRef && wCode.replace(/[^a-z0-9]/g, '') === normRef);
      });
      if (whMatch) {
        const isPartie = whMatch.category === 'PARTIE' || whMatch.nature === 'PARTIE' || sourceCat === 'WAREHOUSE_PARTIE';
        return {
          type: isPartie ? (whMatch.id_family ? `Machine (${whMatch.id_family})` : 'Machine (Partie)') : (whMatch.id_type || 'Composant'),
          designation: whMatch.designation || whMatch.nom || directDesig || rawRef,
          ref: rawRef || whMatch.id_warehouse_item,
          sourceCat: isPartie ? 'WAREHOUSE_PARTIE' : 'WAREHOUSE_COMPOSANT',
        };
      }
    }

    // 2. Stock Items Match
    if (stockItems && stockItems.length > 0) {
      // 2a. Exact match
      const exactStock = stockItems.find((s) => String(s.ref || '').trim().toLowerCase() === lowerRef);
      if (exactStock) {
        const typeLabel = exactStock.designation || exactStock.id_type || 'PDR Consommable';
        const desigLabel = exactStock.ref;
        return {
          type: directType && directType !== 'Sortie' && directType !== 'Entrée' ? directType : (typeLabel || 'PDR Consommable'),
          designation: directDesig || desigLabel || rawRef,
          ref: rawRef,
          sourceCat: 'STOCK_PDR',
        };
      }

      // 2b. Normalized match (ignoring dashes/spaces)
      if (normRef) {
        const normStock = stockItems.find((s) => {
          const sNorm = String(s.ref || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return sNorm === normRef;
        });
        if (normStock) {
          return {
            type: directType && directType !== 'Sortie' && directType !== 'Entrée' ? directType : (normStock.designation || normStock.id_type || 'PDR Consommable'),
            designation: directDesig || normStock.ref,
            ref: rawRef,
            sourceCat: 'STOCK_PDR',
          };
        }
      }
    }

    // 3. Unified Catalog fallback
    const catalogMatch = unifiedSearchCatalog.find((c) => String(c.ref || '').toLowerCase() === lowerRef);
    if (catalogMatch) {
      return {
        type: catalogMatch.type || 'PDR Consommable',
        designation: catalogMatch.designation || rawRef,
        ref: rawRef,
        sourceCat: catalogMatch.source || sourceCat,
      };
    }

    // 4. If direct designation & type exist and are not equal to rawRef
    if (directDesig && directDesig !== rawRef && directType && directType !== 'Sortie' && directType !== 'Entrée') {
      return {
        type: directType,
        designation: directDesig,
        ref: rawRef,
        sourceCat,
      };
    }

    // 5. Intelligent Category & Number Decomposition for GMAO references (e.g. "Raccord04", "Courroie61", "Vis34")
    const match = rawRef.match(/^([a-zA-Z\s\u00C0-\u017F]+?)[_\-\s]*([0-9]+[a-zA-Z0-9\-\.]*)$/);
    if (match) {
      const rawCat = match[1].trim();
      const numPart = match[2].trim();
      const catLower = rawCat.toLowerCase();
      const catCap = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);

      let richType = catCap;
      if (catLower.includes('courroie') || catLower.includes('roulement') || catLower.includes('palier')) {
        richType = 'Mécanique & Transmission';
      } else if (catLower.includes('vis') || catLower.includes('ecrou') || catLower.includes('rondelle') || catLower.includes('cheville')) {
        richType = 'Fixation & Visserie';
      } else if (catLower.includes('foret') || catLower.includes('tarraud') || catLower.includes('meule') || catLower.includes('disque') || catLower.includes('lame')) {
        richType = 'Coupe & Perçage';
      } else if (catLower.includes('raccord') || catLower.includes('flexible') || catLower.includes('vérin') || catLower.includes('verin') || catLower.includes('silencieux') || catLower.includes('distributeur') || catLower.includes('vanne')) {
        richType = 'Pneumatique & Fluides';
      } else if (catLower.includes('capteur') || catLower.includes('contacteur') || catLower.includes('contacte') || catLower.includes('relais') || catLower.includes('sonde') || catLower.includes('voyant') || catLower.includes('fusible') || catLower.includes('interrupteur') || catLower.includes('fin de course') || catLower.includes('cosse') || catLower.includes('fiche') || catLower.includes('lampe')) {
        richType = 'Électrique & Capteurs';
      } else if (catLower.includes('huile') || catLower.includes('scotch') || catLower.includes('charbon') || catLower.includes('pastille') || catLower.includes('joint') || catLower.includes('teflon') || catLower.includes('pile')) {
        richType = 'Consommables Industriels';
      } else if (catLower.includes('pistolet') || catLower.includes('visseuse') || catLower.includes('douille') || catLower.includes('lunette') || catLower.includes('tenaille') || catLower.includes('brosse')) {
        richType = 'Outillage & Équipement';
      }

      if (stockItems && stockItems.length > 0) {
        const candidates = stockItems.filter((s) => {
          const sRef = String(s.ref || '').toLowerCase();
          const sDes = String(s.designation || '').toLowerCase();
          return sRef.includes(catLower) || sDes.includes(catLower);
        });

        if (candidates.length > 0) {
          const numMatch = candidates.find((c) => {
            const sRef = String(c.ref || '').toLowerCase();
            return sRef.includes(numPart.toLowerCase()) || (numPart.startsWith('0') && sRef.includes(numPart.slice(1)));
          });
          if (numMatch) {
            return {
              type: numMatch.designation || richType,
              designation: numMatch.ref,
              ref: rawRef,
              sourceCat,
            };
          }
        }
      }

      return {
        type: richType,
        designation: `${catCap} - Spécification N° ${numPart}`,
        ref: rawRef,
        sourceCat,
      };
    }

    return {
      type: directType && directType !== 'Sortie' && directType !== 'Entrée' ? directType : 'PDR Consommable',
      designation: directDesig || rawRef || 'Sans désignation',
      ref: rawRef || '-',
      sourceCat,
    };
  };

  // Helper to smartly normalize flux type (mapping legacy 'Sortie' -> 'Sortie Interne', etc.)
  const getSmartFluxType = (m) => {
    if (!m) return 'Sortie Interne';
    const raw = String(m.type || '').trim();
    const lower = raw.toLowerCase();
    if (!raw || lower === 'sortie' || lower === 'sortie interne') {
      return 'Sortie Interne';
    }
    if (lower === 'bon de sortie' || lower === 'sortie externe') {
      return 'Bon de Sortie';
    }
    if (lower === 'entrée interne' || lower === 'entree interne') {
      return 'Entrée Interne';
    }
    if (lower === 'entrée externe' || lower === 'entree externe') {
      return 'Entrée Externe';
    }
    if (lower === 'entrée' || lower === 'entree') {
      const act = String(m.action_id || '').toUpperCase();
      if (act === 'REAPPRO' || m.fournisseur) {
        return 'Entrée Externe';
      }
      return 'Entrée Interne';
    }
    if (lower.includes('commande') || lower.includes('achat')) {
      return 'COMMANDE';
    }
    if (lower.includes('sort')) {
      return 'Sortie Interne';
    }
    if (lower.includes('entr')) {
      return 'Entrée Interne';
    }
    return raw;
  };

  // Helper to render flux badge identical to form flow cards with colored icon box and pill tag
  const renderFluxBadge = (m) => {
    const fluxType = getSmartFluxType(m);

    if (fluxType === 'Sortie Interne') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-rose-50/90 border border-rose-300 text-rose-950 shadow-2xs">
          <div className="w-5 h-5 rounded-md bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold whitespace-nowrap text-rose-950">Sortie Interne</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-200 text-rose-800 font-bold">
            INTERNE
          </span>
        </div>
      );
    }

    if (fluxType === 'Entrée Interne') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-cyan-50/90 border border-cyan-300 text-cyan-950 shadow-2xs">
          <div className="w-5 h-5 rounded-md bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-600 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold whitespace-nowrap text-cyan-950">Entrée Interne</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-200 text-cyan-800 font-bold">
            INTERNE
          </span>
        </div>
      );
    }

    if (fluxType === 'Bon de Sortie') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-purple-50/90 border border-purple-300 text-purple-950 shadow-2xs">
          <div className="w-5 h-5 rounded-md bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
            <Truck className="w-3.5 h-3.5 text-purple-600 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold whitespace-nowrap text-purple-950">Bon de Sortie</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-200 text-purple-800 font-bold">
            EXTERNE
          </span>
        </div>
      );
    }

    if (fluxType === 'Entrée Externe') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 shadow-2xs">
          <div className="w-5 h-5 rounded-md bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Inbox className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold whitespace-nowrap text-emerald-950">Entrée Externe</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800 font-bold">
            EXTERNE
          </span>
        </div>
      );
    }

    if (fluxType === 'COMMANDE') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-950 shadow-2xs">
          <div className="w-5 h-5 rounded-md bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <ShoppingCart className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold whitespace-nowrap text-amber-950">COMMANDE</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 font-bold">
            ACHAT
          </span>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
        <span className="text-[11px] font-bold">{fluxType}</span>
      </div>
    );
  };

  // Helper to smartly normalize action/intervention type
  const getSmartActionType = (m) => {
    if (!m) return 'CORRECTIVE';
    const raw = String(m.action_id || '').trim().toUpperCase();
    if (!raw || raw === 'MACHINE' || raw === 'CORRECTIVE') {
      return 'CORRECTIVE';
    }
    if (raw === 'PREVENTIVE' || raw === 'PREV') return 'PREVENTIVE';
    if (raw === 'AMELIORATIVE' || raw === 'AMEL') return 'AMELIORATIVE';
    if (raw === 'USAGE' || raw === 'PERSONNEL') return 'USAGE';
    if (raw === 'REAPPRO' || raw === 'REAPPROVISIONNEMENT') return 'REAPPRO';
    if (raw === 'RETOUR' || raw === 'RETOUR_ATELIER') return 'RETOUR';
    if (raw === 'REPARATION_EXTERNE' || raw === 'REPARATION') return 'REPARATION_EXTERNE';
    if (raw === 'INVENTAIRE') return 'INVENTAIRE';
    if (raw === 'ACHAT_DIRECT') return 'ACHAT_DIRECT';
    return raw;
  };

  // Helper to render action/intervention type badge matching form cards styling
  const renderActionBadge = (m) => {
    const act = getSmartActionType(m);

    if (act === 'CORRECTIVE') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 shadow-2xs">
          <div className="w-4 h-4 rounded-md bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Wrench className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
          <span className="text-[10.5px] font-bold whitespace-nowrap text-rose-950">Corrective</span>
          <span className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-rose-100 text-rose-700 font-bold">
            CURATIF
          </span>
        </div>
      );
    }

    if (act === 'PREVENTIVE') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 shadow-2xs">
          <div className="w-4 h-4 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Clock className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
          <span className="text-[10.5px] font-bold whitespace-nowrap text-blue-950">Préventive</span>
          <span className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-blue-100 text-blue-700 font-bold">
            PLANIFIÉ
          </span>
        </div>
      );
    }

    if (act === 'AMELIORATIVE') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-2xs">
          <div className="w-4 h-4 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Sparkles className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
          <span className="text-[10.5px] font-bold whitespace-nowrap text-emerald-950">Amélioration</span>
          <span className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-emerald-100 text-emerald-700 font-bold">
            PROJET
          </span>
        </div>
      );
    }

    if (act === 'USAGE') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 shadow-2xs">
          <div className="w-4 h-4 rounded-md bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Users className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
          <span className="text-[10.5px] font-bold whitespace-nowrap text-purple-950">Usage Perso</span>
          <span className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-purple-100 text-purple-700 font-bold">
            INTERVENANT
          </span>
        </div>
      );
    }

    if (act === 'REAPPRO') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 shadow-2xs">
          <div className="w-4 h-4 rounded-md bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
            <Inbox className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
          <span className="text-[10.5px] font-bold whitespace-nowrap text-teal-950">Réappro</span>
          <span className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-teal-100 text-teal-700 font-bold">
            ENTRÉE
          </span>
        </div>
      );
    }

    if (act === 'RETOUR') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-950 shadow-2xs">
          <div className="w-4 h-4 rounded-md bg-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
            <RotateCcw className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
          <span className="text-[10.5px] font-bold whitespace-nowrap text-cyan-950">Retour Atelier</span>
          <span className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-cyan-100 text-cyan-700 font-bold">
            STOCK
          </span>
        </div>
      );
    }

    if (act === 'REPARATION_EXTERNE') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 shadow-2xs">
          <div className="w-4 h-4 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Truck className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
          <span className="text-[10.5px] font-bold whitespace-nowrap text-indigo-950">Rép. Externe</span>
          <span className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-indigo-100 text-indigo-700 font-bold">
            SOUS-TRAITANCE
          </span>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
        <span className="text-[10.5px] font-bold">{act}</span>
      </div>
    );
  };

  // Helper flags
  const isSortieInterne = form.type === 'Sortie Interne';
  const isEntreeInterne = form.type === 'Entrée Interne';
  const isBonSortie = form.type === 'Bon de Sortie' || form.type === 'Sortie Externe';
  const isEntreeExterne = form.type === 'Entrée Externe';
  const isCommandeFlow = form.type === 'COMMANDE';

  // Dynamic Supplier Options
  const supplierOptions = useMemo(() => {
    const list = ['Fournisseur Central Industriel', 'SKF Maroc / France', 'Schneider Electric', 'SMC Pneumatics', 'Festo Automation', 'Atelier Bobinage & Usinage'];
    mouvements.forEach((m) => {
      if (m.fournisseur && !list.includes(m.fournisseur)) {
        list.push(m.fournisseur);
      }
    });
    return list;
  }, [mouvements]);

  // Dynamic available machines and technicians based on selected zone
  const availableMachines = useMemo(() => {
    if (!form.id_zone) return machines;
    return machines.filter((m) => m.id_zone_default === form.id_zone);
  }, [machines, form.id_zone]);

  const availableTechs = useMemo(() => {
    if (!form.id_zone) return technicians;
    return technicians.filter((t) => t.id_zone === form.id_zone);
  }, [technicians, form.id_zone]);

  // Filtered lists for Operations and Chefs
  const chefsList = useMemo(() => {
    return operations.filter(
      (op) =>
        op.type_profil === 'CHEF' ||
        String(op.id_operation).startsWith('CHEF') ||
        String(op.nom).toUpperCase().includes('CHEF')
    );
  }, [operations]);

  const operatorsList = useMemo(() => {
    return operations.filter(
      (op) =>
        op.type_profil !== 'CHEF' &&
        !String(op.id_operation).startsWith('CHEF') &&
        !String(op.nom).toUpperCase().includes('CHEF')
    );
  }, [operations]);

  // Search Modal State
  const [isArticleSearchOpen, setIsArticleSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActiveTab, setSearchActiveTab] = useState('ALL'); // 'ALL' | 'STOCK_PDR' | 'WAREHOUSE_PARTIE' | 'WAREHOUSE_COMPOSANT'
  const [targetItemIndex, setTargetItemIndex] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Unified items list for search modal (Merging PDR Stock + Warehouse Digital Twin Items)
  const unifiedSearchCatalog = useMemo(() => {
    const catalog = [];

    // 1. Stock PDR Items
    stockItems.forEach((s) => {
      catalog.push({
        id: `PDR-${s.id || s.ref}`,
        source: 'STOCK_PDR',
        ref: s.ref,
        code: s.ref,
        designation: s.designation,
        category: 'PDR Consommable',
        badge: 'Stock PDR',
        badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        stockActuel: s.stockActuel ?? s.stockInitial ?? 0,
        emplacement: s.emplacement || 'Magasin Central',
        type: s.id_type || 'PDR',
        unit: 'pcs',
        raw: s,
      });
    });

    // 2. Warehouse Digital Twin Items (Parties & Composants)
    warehouseItems.forEach((w) => {
      const isPartie = w.category === 'PARTIE' || w.nature === 'PARTIE';
      const codeStr = w.id_warehouse_item || w.code || w.ref || `EXT-${w.id}`;
      catalog.push({
        id: `WH-${w.id || w.id_warehouse_item || w.code}`,
        source: isPartie ? 'WAREHOUSE_PARTIE' : 'WAREHOUSE_COMPOSANT',
        ref: codeStr,
        code: codeStr,
        designation: w.designation || w.nom || '',
        category: isPartie ? 'PARTIE (Machine Twin)' : 'COMPOSANT (Stock Twin)',
        badge: isPartie ? 'Entrepôt: PARTIE' : 'Entrepôt: COMPOSANT',
        badgeColor: isPartie
          ? 'bg-purple-50 text-purple-800 border-purple-200'
          : 'bg-blue-50 text-blue-800 border-blue-200',
        stockActuel: w.quantite ?? w.stockActuel ?? 1,
        emplacement: w.emplacement || w.rattachement_val || 'Entrepôt',
        type: isPartie ? w.id_family || 'Machine' : w.id_type || 'Composant',
        unit: w.unite || 'pcs',
        etat: w.etat || 'Fonctionnel',
        raw: w,
      });
    });

    return catalog;
  }, [stockItems, warehouseItems]);

  // Filtered Search Results
  const filteredCatalogResults = useMemo(() => {
    return unifiedSearchCatalog.filter((item) => {
      // Tab filter
      if (searchActiveTab !== 'ALL' && item.source !== searchActiveTab) {
        return false;
      }

      // Query filter
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        String(item.ref || '').toLowerCase().includes(q) ||
        String(item.designation || '').toLowerCase().includes(q) ||
        String(item.category || '').toLowerCase().includes(q) ||
        String(item.emplacement || '').toLowerCase().includes(q) ||
        String(item.type || '').toLowerCase().includes(q)
      );
    });
  }, [unifiedSearchCatalog, searchActiveTab, searchQuery]);

  // Active Pending Orders (Commandes en attente de livraison)
  const pendingOrders = useMemo(() => {
    return mouvements.filter((m) => m.type === 'COMMANDE' || m.action_id === 'COMMANDE_STOCK');
  }, [mouvements]);

  // Active Items Out for External Repair (Bons de sortie en cours)
  const activeExternalRepairs = useMemo(() => {
    return mouvements.filter(
      (m) =>
        m.type === 'Bon de Sortie' ||
        m.type === 'Sortie Externe' ||
        m.action_id === 'REPARATION_EXTERNE' ||
        m.action_id === 'SOUS_TRAITANCE'
    );
  }, [mouvements]);

  // Function to Highlight Search Matches
  const highlightMatch = (text, query) => {
    if (!text || !query) return text;
    const parts = String(text).split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-amber-200 text-amber-950 font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Add Item to Current Movement
  const handleAddItem = () => {
    if (mouvementItems.length >= 5) {
      alert('Vous pouvez ajouter jusqu’à 5 articles par bon.');
      return;
    }
    const defaultItem = unifiedSearchCatalog.find((c) => c.source === form.item_source) || unifiedSearchCatalog[0];
    setMouvementItems([
      ...mouvementItems,
      {
        source: form.item_source,
        ref: defaultItem?.ref || '',
        designation: defaultItem?.designation || '',
        quantite: 1,
        unit: defaultItem?.unit || 'pcs',
        emplacement: defaultItem?.emplacement || '',
      },
    ]);
  };

  // Remove Item from Current Movement
  const handleRemoveItem = (index) => {
    if (mouvementItems.length <= 1) return;
    setMouvementItems(mouvementItems.filter((_, i) => i !== index));
  };

  // Update Item in Current Movement
  const handleUpdateItem = (index, field, value) => {
    const updated = [...mouvementItems];
    updated[index][field] = value;

    if (field === 'ref') {
      const match = unifiedSearchCatalog.find((c) => c.ref === value);
      if (match) {
        updated[index].designation = match.designation;
        updated[index].emplacement = match.emplacement;
        updated[index].unit = match.unit;
        updated[index].source = match.source;
      }
    }
    setMouvementItems(updated);
  };

  // Select Item from Search Modal
  const handleSelectCatalogItem = (catalogItem) => {
    const updated = [...mouvementItems];
    if (updated[targetItemIndex]) {
      updated[targetItemIndex] = {
        ...updated[targetItemIndex],
        source: catalogItem.source,
        ref: catalogItem.ref,
        designation: catalogItem.designation,
        emplacement: catalogItem.emplacement,
        unit: catalogItem.unit,
      };
    }
    setMouvementItems(updated);
    setIsArticleSearchOpen(false);
    setSearchQuery('');
  };

  const getFormValidationState = () => {
    const errors = [];
    let isPristine = true;

    // Check if form is pristine
    if (
      (mouvementItems.length > 1) ||
      (mouvementItems[0] && mouvementItems[0].ref !== '') ||
      form.commentaire.trim() !== '' ||
      form.id_technician !== '' ||
      form.id_machine_registered !== '' ||
      form.id_zone !== '' ||
      form.num_commande !== '' ||
      form.fournisseur !== '' ||
      form.prestataire_externe !== ''
    ) {
      isPristine = false;
    }

    // Validation
    mouvementItems.forEach((item, idx) => {
      if (!item.ref || String(item.ref).trim() === '') {
        errors.push(`Ligne ${idx + 1} : Veuillez sélectionner un article dans le catalogue.`);
      }
      if (!item.quantite || Number(item.quantite) <= 0) {
        errors.push(`Ligne ${idx + 1} : La quantité doit être supérieure à 0.`);
      }
    });

    const isSortie = form.type.includes('Sortie');
    const isEntreeEx = form.type === 'Bon de Réception';
    const isSortieEx = form.type === 'Bon de Sortie';

    // Technicien validation
    if (form.action_id !== 'INVENTAIRE' && form.action_id !== 'REAPPRO') {
      if (!form.id_technician && !form.technicien) {
        errors.push('Veuillez sélectionner ou saisir un Intervenant / Demandeur.');
      }
    }

    // Sortie Validation
    if (isSortie && form.action_id !== 'USAGE') {
      if (form.destination_type === 'MACHINE' && !form.id_machine_registered) {
        errors.push('Veuillez sélectionner la Machine de destination.');
      }
      if (form.destination_type === 'ZONE' && !form.id_zone) {
        errors.push('Veuillez sélectionner la Zone de destination.');
      }
    }

    if (isSortieEx) {
      if (!form.prestataire_externe) {
        errors.push('Veuillez préciser le Prestataire Externe.');
      }
      if (!form.date_retour_prevue) {
        errors.push('Veuillez définir la Date de Retour Prévue.');
      }
    }

    if (isEntreeEx) {
      if (!form.fournisseur) {
        errors.push('Veuillez sélectionner ou saisir un Fournisseur.');
      }
    }

    // Collective stock deficit check
    if (isSortie || isSortieEx) {
      for (const item of mouvementItems) {
        if (!item.ref) continue;
        const match = unifiedSearchCatalog.find((c) => c.ref === item.ref) || stockItems.find((s) => s.ref === item.ref);
        const currentStock = match ? (match.stockActuel ?? match.raw?.stockActuel ?? match.raw?.stockInitial ?? 0) : 0;
        const qte = Number(item.quantite) || 0;
        if (qte > currentStock) {
          errors.push(`Stock insuffisant pour [${item.ref}] (Demandé: ${qte}, Dispo: ${currentStock}).`);
        }
      }
    }

    return {
      isPristine,
      isValid: errors.length === 0,
      errors
    };
  };

  const resetForm = () => {
    setMouvementItems([{ source: form.item_source, ref: '', designation: '', quantite: 1, unit: 'pcs', emplacement: '' }]);
    setForm((prev) => ({
      ...prev,
      num_commande: '',
      is_inconnu: false,
      date: new Date().toISOString().split('T')[0],
      heure: getCurrentTimeStr(),
      id_zone: '',
      id_machine_registered: '',
      id_operation: '',
      id_technician: '',
      technicien: '',
      operation: '',
      fournisseur: '',
      prestataire_externe: '',
      date_retour_prevue: '',
      commentaire: '',
    }));
  };

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    const { isValid, errors } = getFormValidationState();

    if (!isValid) {
      setValidationErrors(errors);
      setShowValidationAlert(true);
      return;
    }

    // Process valid submission
    const currentTime = form.heure && String(form.heure).trim() !== '' ? form.heure : getCurrentTimeStr();

    // Submit movement records for each item in the bon
    mouvementItems.forEach((item) => {
      const rawOt = form.num_commande ? form.num_commande.trim() : '';
      const finalNumCommande = rawOt !== '' ? rawOt : 'INCONNU';

      const match = unifiedSearchCatalog.find((c) => c.ref === item.ref) || stockItems.find((s) => s.ref === item.ref);
      const stockAvant = match ? (match.stockActuel ?? match.raw?.stockActuel ?? match.raw?.stockInitial ?? 0) : 0;
      const seuilMin = match?.raw?.seuil ?? match?.seuil ?? 5;
      const qteNum = Number(item.quantite) || 1;
      const isSortie = form.type.includes('Sortie') || form.type === 'Bon de Sortie';
      const stockApres = isSortie ? stockAvant - qteNum : stockAvant + qteNum;

      const mvtRecord = {
        code_bon: form.code_bon,
        num_commande: finalNumCommande,
        date: form.date,
        heure: currentTime,
        timestamp: new Date().toISOString(),
        ref: item.ref,
        designation: item.designation,
        quantite: qteNum,
        stock_avant: stockAvant,
        stock_apres: stockApres,
        seuil_min: seuilMin,
        unit: item.unit || 'pcs',
        source_category: item.source, // 'STOCK_PDR' | 'WAREHOUSE_PARTIE' | 'WAREHOUSE_COMPOSANT'
        destination_category: form.destination_type,
        type: form.type,
        action_id: form.action_id,
        id_zone: form.type.includes('Entrée') ? '' : form.id_zone,
        id_machine_registered: form.type.includes('Entrée') || form.action_id === 'USAGE' ? '' : form.id_machine_registered,
        technicien: form.technicien,
        id_technician: form.id_technician,
        operation: form.action_id === 'CORRECTIVE' || form.type.includes('Entrée') ? '' : form.operation,
        id_operation: form.id_operation,
        fournisseur: form.type === 'Bon de Sortie' ? form.prestataire_externe : form.fournisseur,
        emplacement_reception: form.emplacement_reception,
        commentaire: form.commentaire,
        date_retour_prevue: form.date_retour_prevue,
        entrepot_etat: form.entrepot_etat,
      };

      if (onAddMouvement) {
        onAddMouvement(mvtRecord);
      }

      // If this is an Entrée Interne directly to Entrepôt, synchronize or track with warehouse
      if (isEntreeInterne && isWarehouseDest && onAddWarehouseItem) {
        // Find if item already exists in warehouse
        const existingWh = warehouseItems.find((w) => w.id_warehouse_item === item.ref || w.code === item.ref);
        if (existingWh && onUpdateWarehouseItem) {
          onUpdateWarehouseItem(existingWh.id, {
            ...existingWh,
            quantite: (Number(existingWh.quantite) || 0) + Number(item.quantite),
            emplacement: form.emplacement_reception || existingWh.emplacement,
            etat: form.entrepot_etat || existingWh.etat,
          });
        }
      }
    });

    // Reset Form to Next Bon
    const nextCode = getNextBonCode(mouvements);
    resetForm();
    setForm((prev) => ({
      ...prev,
      code_bon: nextCode,
    }));
    
    setShowSuccessAlert(true);
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 3000);
  };

  // Convert Pending Commande / Demande to Entrée Externe in 1 click
  const handleFulfillOrder = (order) => {
    setForm((prev) => ({
      ...prev,
      type: 'Entrée Externe',
      action_id: 'REAPPRO',
      num_commande: order.num_commande || order.code_bon,
      fournisseur: order.fournisseur || 'Fournisseur Central',
      commentaire: `Réception de la commande ${order.num_commande || order.code_bon}`,
    }));
    setMouvementItems([
      {
        source: order.source_category || 'STOCK_PDR',
        ref: order.ref,
        designation: order.designation || '',
        quantite: order.quantite || 1,
        unit: order.unit || 'pcs',
        emplacement: form.emplacement_reception,
      },
    ]);
    setActiveSubTab('JOURNAL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Convert External Repair Return to Entrée Externe in 1 click
  const handleReceiveRepairReturn = (repairMvt) => {
    setForm((prev) => ({
      ...prev,
      type: 'Entrée Externe',
      action_id: 'RETOUR',
      num_commande: repairMvt.code_bon,
      fournisseur: repairMvt.fournisseur || 'Prestataire Externe',
      commentaire: `Retour après réparation/bobinage de ${repairMvt.ref} (${repairMvt.code_bon})`,
    }));
    setMouvementItems([
      {
        source: repairMvt.source_category || 'WAREHOUSE_PARTIE',
        ref: repairMvt.ref,
        designation: repairMvt.designation || '',
        quantite: repairMvt.quantite || 1,
        unit: repairMvt.unit || 'pcs',
        emplacement: 'Entrepôt - Atelier Révisé',
      },
    ]);
    setActiveSubTab('JOURNAL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatedPage>
      {/* Alert Modals */}
      {showSuccessAlert && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-emerald-200 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Opération réussie !</h3>
              <p className="text-slate-500 text-sm mt-1">Le bon a été enregistré avec succès et le formulaire a été réinitialisé.</p>
            </div>
          </div>
        </div>
      )}

      {showValidationAlert && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-rose-200 flex flex-col space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Formulaire incomplet</h3>
                <p className="text-slate-500 text-sm mt-1">Veuillez corriger les erreurs suivantes avant de valider :</p>
              </div>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 max-h-[40vh] overflow-y-auto">
              <ul className="space-y-1.5 text-sm text-rose-800 list-disc list-inside">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setShowValidationAlert(false)}
              className="w-full h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors cursor-pointer"
            >
              Compris, je vais corriger
            </button>
          </div>
        </div>
      )}

      {/* Top Banner with 3-Bons Philosophy Navigation */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Gestion des Mouvements & Bons Industriels (3 Catégories & 5 Flux)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            <b>Interne</b> (PDR + Parties + Composants) • <b>Bon de Sortie</b> (Réparation Externe) • <b>Externe</b> (Achats & Réappro)
          </p>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-stretch md:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('JOURNAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'JOURNAL'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span>Journal & Saisie</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('COMMANDES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'COMMANDES'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
            <span>Commandes en Attente ({pendingOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('REPARATION_EXTERNE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'REPARATION_EXTERNE'
                ? 'bg-white text-purple-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-purple-600" />
            <span>En Réparation Externe ({activeExternalRepairs.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: PENDING ORDERS / COMMANDES BACKLOG */}
      {activeSubTab === 'COMMANDES' && (
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Demandes d'Achat & Commandes en Attente</h3>
                <p className="text-xs text-slate-500">
                  Commandes de pièces ou composants en attente de livraison fournisseur. Cliquez sur "Réceptionner" pour les entrer en stock.
                </p>
              </div>
            </div>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
              <p className="text-xs font-medium">Aucune commande en attente de livraison.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingOrders.map((ord, idx) => (
                <div
                  key={`pending-ord-${ord.id ?? ''}-${ord.code_bon ?? ''}-${idx}`}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2.5 hover:shadow-xs transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                      {ord.num_commande || ord.code_bon}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{ord.date}</span>
                  </div>

                  <div>
                    <div className="font-bold text-xs text-slate-800">{ord.ref}</div>
                    <div className="text-xs text-slate-500">{ord.designation || 'Article / Pièce'}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-100">
                    <div className="text-slate-600 font-medium">
                      Qté : <b className="font-mono text-amber-900">{ord.quantite} {ord.unit || 'pcs'}</b>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFulfillOrder(ord)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer shadow-2xs"
                    >
                      <Inbox className="w-3 h-3" />
                      <span>📥 Réceptionner</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: ITEMS IN EXTERNAL REPAIR / BON DE SORTIE BACKLOG */}
      {activeSubTab === 'REPARATION_EXTERNE' && (
        <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Matériels & Équipements en Réparation Externe (Bons de Sortie)
                </h3>
                <p className="text-xs text-slate-500">
                  Moteurs, pompes et composants expédiés chez des sous-traitants/bobineurs. Cliquez sur "Réceptionner le Retour" à l'arrivée.
                </p>
              </div>
            </div>
          </div>

          {activeExternalRepairs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
              <p className="text-xs font-medium">Aucun équipement actuellement en réparation extérieure.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeExternalRepairs.map((rep, idx) => (
                <div
                  key={`active-rep-${rep.id ?? ''}-${rep.code_bon ?? ''}-${idx}`}
                  className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 space-y-2.5 hover:shadow-xs transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-purple-950 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-300">
                      {rep.code_bon}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{rep.date}</span>
                  </div>

                  <div>
                    <div className="font-bold text-xs text-slate-800">{rep.ref}</div>
                    <div className="text-xs text-slate-500">{rep.designation || 'Partie / Composant Entrepôt'}</div>
                    <div className="text-[11px] text-purple-800 font-medium mt-1">
                      Prestataire : <b>{rep.fournisseur || 'Atelier Externe'}</b>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-purple-100">
                    <div className="text-slate-600 font-medium">
                      Qté : <b className="font-mono text-purple-900">{rep.quantite} {rep.unit || 'pcs'}</b>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleReceiveRepairReturn(rep)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>📥 Réceptionner Retour</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MAIN VIEW: FORM & JOURNAL TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Form: Unified 3-Bons Generator (5 Cols on large screens) */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Émission de Bon de Mouvement</h3>
              <p className="text-xs text-slate-500">Sélectionnez le type de flux et les articles concernés</p>
            </div>
            <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200">
              {form.code_bon}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. FLOW TYPE SELECTOR (5 Operational Flows categorized under 3 Philosophies) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Type de Flux Industriel (5 Types)
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                {/* 1. Sortie Interne */}
                <button
                  type="button"
                  onClick={() => handleTypeChange('Sortie Interne')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    isSortieInterne
                      ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-500/20 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sortie Interne</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-200 text-rose-800 font-bold">INTERNE</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Stock/Entrepôt → Machine/Zone</div>
                </button>

                {/* 2. Entrée Interne */}
                <button
                  type="button"
                  onClick={() => handleTypeChange('Entrée Interne')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    isEntreeInterne
                      ? 'bg-cyan-50 border-cyan-400 text-cyan-950 font-bold ring-2 ring-cyan-500/20 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Entrée Interne</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-200 text-cyan-800 font-bold">INTERNE</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Machine/Atelier → Stock/Entrepôt</div>
                </button>

                {/* 3. Bon de Sortie (Réparation Externe) */}
                <button
                  type="button"
                  onClick={() => handleTypeChange('Bon de Sortie')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    isBonSortie
                      ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold ring-2 ring-purple-500/20 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Bon de Sortie</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-200 text-purple-800 font-bold">EXTERNE</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Entrepôt → Réparation Externe (Truck)</div>
                </button>

                {/* 4. Entrée Externe */}
                <button
                  type="button"
                  onClick={() => handleTypeChange('Entrée Externe')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    isEntreeExterne
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Inbox className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Entrée Externe</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800 font-bold">EXTERNE</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Fournisseur/Retour Réparation → Stock</div>
                </button>

                {/* 5. COMMANDE / Demandes d'Achat */}
                <button
                  type="button"
                  onClick={() => handleTypeChange('COMMANDE')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer col-span-2 ${
                    isCommandeFlow
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold ring-2 ring-amber-500/20 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
                      <span>Demande d'Achat & Approvisionnement (COMMANDE)</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 font-bold">ACHAT</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Demande d'achat de PDR, Composants ou Parties en attente</div>
                </button>
              </div>
            </div>

            {/* 2. DYNAMIC ITEM SOURCE SELECTOR FOR SORTIE INTERNE */}
            {isSortieInterne && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-slate-600" />
                  <span>Source de l'Article à Sortir :</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, item_source: 'STOCK_PDR' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'STOCK_PDR' })));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'STOCK_PDR'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>PDR (Stock)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, item_source: 'WAREHOUSE_PARTIE' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_PARTIE' })));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'WAREHOUSE_PARTIE'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>PARTIE (Entrepôt)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, item_source: 'WAREHOUSE_COMPOSANT' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_COMPOSANT' })));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'WAREHOUSE_COMPOSANT'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>COMPOSANT</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. DYNAMIC DESTINATION SELECTOR FOR ENTRÉE INTERNE */}
            {isEntreeInterne && (
              <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-200 space-y-2">
                <label className="text-[10.5px] font-bold text-cyan-950 uppercase tracking-wider block flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Destination de l'Entrée / Remise :</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, destination_type: 'STOCK_PDR', item_source: 'STOCK_PDR' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'STOCK_PDR' })));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.destination_type === 'STOCK_PDR'
                        ? 'bg-cyan-700 text-white border-cyan-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Magasin PDR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, destination_type: 'WAREHOUSE_PARTIE', item_source: 'WAREHOUSE_PARTIE' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_PARTIE' })));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.destination_type === 'WAREHOUSE_PARTIE'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Entrepôt: PARTIE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, destination_type: 'WAREHOUSE_COMPOSANT', item_source: 'WAREHOUSE_COMPOSANT' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_COMPOSANT' })));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.destination_type === 'WAREHOUSE_COMPOSANT'
                        ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Entrepôt: COMPOSANT</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. DYNAMIC SOURCE SELECTOR FOR BON DE SORTIE (Parts & Components strictly) */}
            {isBonSortie && (
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 space-y-2">
                <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-purple-700" />
                  <span>Matériel Expédié pour Réparation (Entrepôt) :</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, item_source: 'WAREHOUSE_PARTIE' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_PARTIE' })));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'WAREHOUSE_PARTIE'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>PARTIE (Machine Twin)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, item_source: 'WAREHOUSE_COMPOSANT' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_COMPOSANT' })));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'WAREHOUSE_COMPOSANT'
                        ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>COMPOSANT (Stock Twin)</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. DYNAMIC TARGET SELECTOR FOR DEMANDE D'ACHAT (PDR, Components, Parts) */}
            {isCommandeFlow && (
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-700" />
                  <span>Catégorie de la Demande d'Achat :</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, item_source: 'STOCK_PDR' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'STOCK_PDR' })));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'STOCK_PDR'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>PDR (Stock)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, item_source: 'WAREHOUSE_PARTIE' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_PARTIE' })));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'WAREHOUSE_PARTIE'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>PARTIE (Entrepôt)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, item_source: 'WAREHOUSE_COMPOSANT' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_COMPOSANT' })));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'WAREHOUSE_COMPOSANT'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>COMPOSANT</span>
                  </button>
                </div>
              </div>
            )}

            {/* 6. DYNAMIC CATEGORY & RETURN TRACKER SELECTOR FOR ENTRÉE EXTERNE (PDR, Components, Parts) */}
            {isEntreeExterne && (
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2.5">
                <label className="text-[10.5px] font-bold text-emerald-950 uppercase tracking-wider block flex items-center gap-1.5">
                  <Inbox className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Catégorie de Réception / Destination :</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, destination_type: 'STOCK_PDR', item_source: 'STOCK_PDR' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'STOCK_PDR' })));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.destination_type === 'STOCK_PDR'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>PDR (Stock)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, destination_type: 'WAREHOUSE_PARTIE', item_source: 'WAREHOUSE_PARTIE' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_PARTIE' })));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.destination_type === 'WAREHOUSE_PARTIE'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>PARTIE (Entrepôt)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, destination_type: 'WAREHOUSE_COMPOSANT', item_source: 'WAREHOUSE_COMPOSANT' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_COMPOSANT' })));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.destination_type === 'WAREHOUSE_COMPOSANT'
                        ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>COMPOSANT</span>
                  </button>
                </div>

                {/* Return Tracker Bar from Bon de Sortie (Repairs) and Demandes d'Achat (Orders) */}
                {(activeExternalRepairs.length > 0 || pendingOrders.length > 0) && (
                  <div className="pt-2 border-t border-emerald-200/70 space-y-1.5">
                    <div className="text-[10px] font-bold text-emerald-900 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <RotateCcw className="w-3 h-3 text-emerald-700" />
                        <span>Traçabilité des Retours & Commandes en Attente :</span>
                      </span>
                      <span className="font-mono text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        {activeExternalRepairs.length + pendingOrders.length} en attente
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {/* Active Repairs in Bon de Sortie */}
                      {activeExternalRepairs.map((rep, idx) => (
                        <button
                          key={`track-rep-${rep.id ?? ''}-${rep.code_bon ?? ''}-${idx}`}
                          type="button"
                          onClick={() => handleReceiveRepairReturn(rep)}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-purple-50 border border-purple-200 text-purple-950 text-[10.5px] font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                          title="Réceptionner le retour de cet équipement réparé"
                        >
                          <Truck className="w-3 h-3 text-purple-600 shrink-0" />
                          <span className="font-mono font-bold text-[10px] text-purple-800">{rep.code_bon}</span>
                          <span className="truncate max-w-[100px]">{rep.ref}</span>
                          <span className="text-[9px] text-purple-500 font-mono">({rep.quantite} pcs)</span>
                        </button>
                      ))}

                      {/* Pending Orders from Demandes d'Achat */}
                      {pendingOrders.map((ord, idx) => (
                        <button
                          key={`track-ord-${ord.id ?? ''}-${ord.code_bon ?? ''}-${idx}`}
                          type="button"
                          onClick={() => handleFulfillOrder(ord)}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-amber-50 border border-amber-200 text-amber-950 text-[10.5px] font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                          title="Réceptionner cette commande livrée par le fournisseur"
                        >
                          <ShoppingCart className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="font-mono font-bold text-[10px] text-amber-800">{ord.num_commande || ord.code_bon}</span>
                          <span className="truncate max-w-[100px]">{ord.ref}</span>
                          <span className="text-[9px] text-amber-500 font-mono">({ord.quantite} pcs)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. DATE, HEURE & OT/CMD REFERENCE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center justify-between">
                  <span>Heure</span>
                  <span className="text-[9.5px] text-indigo-600 font-mono font-medium flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> Auto
                  </span>
                </label>
                <input
                  type="time"
                  value={form.heure || ''}
                  onChange={(e) => setForm({ ...form, heure: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  N° OT / Commande / Réf
                </label>
                <input
                  type="text"
                  placeholder="Ex: OT-2026-042"
                  value={form.num_commande}
                  onChange={(e) => setForm({ ...form, num_commande: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-800"
                />
              </div>
            </div>

            {/* 5. MULTI-ARTICLES SECTION - EXCEL LIGHT UI PDR */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <Boxes className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <span>Articles & Pièces de Rechange (PDR)</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                        {mouvementItems.length}/5
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold bg-slate-50 text-slate-700 px-2 py-1 rounded-lg border border-slate-200">
                    Total: {mouvementItems.reduce((sum, it) => sum + (parseFloat(it.quantite) || 0), 0)} {mouvementItems[0]?.unit || 'pcs'}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={mouvementItems.length >= 5}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200 transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une pièce</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {mouvementItems.map((item, idx) => {
                  const match = unifiedSearchCatalog.find((c) => c.ref === item.ref);
                  const stockDispo = match ? (match.stockActuel ?? match.raw?.stockActuel ?? match.raw?.stockInitial ?? 0) : 0;
                  const seuilMin = match?.raw?.seuil ?? 5;
                  const qteVal = parseFloat(item.quantite) || 0;

                  const isSortie = form.type.includes('Sortie') || form.type === 'Bon de Sortie';
                  const isEntree = form.type.includes('Entrée');
                  const isCmd = form.type === 'COMMANDE';

                  // Dynamic Math Formulas (Excel Twin Simulation)
                  const nouveauSolde = isSortie
                    ? stockDispo - qteVal
                    : isEntree || isCmd
                      ? stockDispo + qteVal
                      : stockDispo;

                  const isDeficit = isSortie && qteVal > stockDispo;
                  const deficitAmount = isDeficit ? qteVal - stockDispo : 0;
                  const isSeuilAlert = isSortie && !isDeficit && nouveauSolde <= seuilMin && nouveauSolde >= 0;
                  const isStockOk = isSortie && !isDeficit && nouveauSolde > seuilMin;
                  const isZeroQte = qteVal <= 0;

                  return (
                    <div
                      key={`item-line-${idx}`}
                      className={`p-3 rounded-xl border bg-white transition shadow-2xs space-y-2.5 ${
                        isDeficit
                          ? 'border-rose-300 ring-1 ring-rose-200'
                          : isSeuilAlert
                            ? 'border-amber-300'
                            : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Bar: Ligne ID + Catalog Picker + Delete */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-[11px] font-bold text-slate-700">
                            Ligne {idx + 1}
                          </span>
                        </div>

                        {/* Search / Select in catalog button */}
                        <button
                          type="button"
                          onClick={() => {
                            setTargetItemIndex(idx);
                            setSearchActiveTab(item.source || 'ALL');
                            setIsArticleSearchOpen(true);
                          }}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-slate-50/90 hover:bg-slate-100 border border-slate-200 hover:border-emerald-500 text-left font-mono text-slate-800 flex items-center justify-between transition cursor-pointer shadow-2xs group"
                          title="Cliquer pour rechercher ou changer la pièce"
                        >
                          <span className="truncate text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{item.ref || 'Sélectionner une pièce dans le catalogue...'}</span>
                          </span>
                          <span className="text-[11px] text-indigo-700 group-hover:text-indigo-800 font-sans font-bold flex items-center gap-1 shrink-0 ml-1.5 bg-white px-2 py-0.5 rounded border border-slate-200">
                            <Search className="w-3 h-3 text-indigo-600" />
                            <span>
                              {item.source === 'STOCK_PDR' ? 'Catalogue PDR' :
                               item.source === 'WAREHOUSE_PARTIE' ? 'Catalogue Parties' :
                               item.source === 'WAREHOUSE_COMPOSANT' ? 'Catalogue Composants' : 'Catalogue'}
                            </span>
                          </span>
                        </button>

                        {mouvementItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer shrink-0"
                            title="Supprimer cette ligne"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Fields Row: Designation & Quantity */}
                      <div className="grid grid-cols-12 gap-2.5 items-start">
                        <div className="col-span-7">
                          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block mb-1">
                            Désignation de la pièce
                          </label>
                          <input
                            type="text"
                            placeholder="Sélectionnez un article..."
                            value={item.designation}
                            readOnly
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600 focus:outline-none cursor-not-allowed select-none"
                          />
                        </div>

                        <div className="col-span-5">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                              Quantité ({item.unit || 'pcs'})
                            </label>
                            {isSortie && stockDispo > 0 && (
                              <span className="text-[9.5px] text-slate-500 font-mono">Dispo: <b className="text-slate-800">{stockDispo}</b></span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0.1"
                              step="any"
                              value={item.quantite}
                              onChange={(e) => handleUpdateItem(idx, 'quantite', e.target.value)}
                              className={`w-full h-8 px-2.5 rounded-lg border font-mono font-bold text-xs text-right focus:outline-none ${
                                isDeficit
                                  ? 'border-rose-400 bg-rose-50/50 text-rose-800'
                                  : isZeroQte
                                    ? 'border-amber-400 bg-amber-50/50 text-amber-900'
                                    : 'border-slate-200 bg-white text-slate-900 focus:border-emerald-500'
                              }`}
                              required
                            />
                            <span className="text-xs text-slate-500 font-mono font-medium shrink-0 px-1.5 py-1 bg-slate-50 rounded border border-slate-200">
                              {item.unit || 'pcs'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Adjust Buttons (+1, +5, Max, Reset) */}
                      <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100 text-[10.5px]">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-[10px] font-medium mr-0.5">Ajuster:</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItem(idx, 'quantite', Math.max(1, qteVal - 1))}
                            className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200 cursor-pointer shadow-2xs"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateItem(idx, 'quantite', qteVal + 1)}
                            className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200 cursor-pointer shadow-2xs"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateItem(idx, 'quantite', qteVal + 5)}
                            className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200 cursor-pointer shadow-2xs"
                          >
                            +5
                          </button>
                          {isSortie && stockDispo > 0 && (
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(idx, 'quantite', stockDispo)}
                              className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono font-bold border border-emerald-200 cursor-pointer shadow-2xs"
                              title="Prendre tout le stock disponible"
                            >
                              Max ({stockDispo})
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleUpdateItem(idx, 'quantite', 1)}
                            className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-500 font-mono border border-slate-200 cursor-pointer shadow-2xs"
                            title="Réinitialiser à 1"
                          >
                            1
                          </button>
                        </div>

                        {match && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            Emplacement : <b className="text-slate-800 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">{match.emplacement || '-'}</b>
                          </div>
                        )}
                      </div>

                      {/* Real-time Excel Formula & Stock Simulation Bar */}
                      {match && (
                        <div className="pt-1.5 border-t border-slate-100">
                          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-slate-50/80 border border-slate-200 text-xs">
                            {isSortie ? (
                              <div className="flex items-center gap-1.5 font-mono text-[11px] flex-wrap">
                                <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Stock Actuel:</span>
                                <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                  {stockDispo}
                                </span>
                                <span className="font-bold text-rose-600">−</span>
                                <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Sortie:</span>
                                <span className="font-bold text-rose-700 bg-white px-1.5 py-0.5 rounded border border-rose-200">
                                  {qteVal}
                                </span>
                                <span className="font-bold text-slate-400">=</span>
                                <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Solde Prévu:</span>
                                <span
                                  className={`font-bold px-2 py-0.5 rounded border ${
                                    isDeficit
                                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                                      : isSeuilAlert
                                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                                        : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                  }`}
                                >
                                  {nouveauSolde} {item.unit || 'pcs'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 font-mono text-[11px] flex-wrap">
                                <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Stock Actuel:</span>
                                <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                  {stockDispo}
                                </span>
                                <span className="font-bold text-emerald-600">+</span>
                                <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Entrée:</span>
                                <span className="font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                                  {qteVal}
                                </span>
                                <span className="font-bold text-slate-400">=</span>
                                <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Nouveau Stock:</span>
                                <span className="font-bold px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-900">
                                  {nouveauSolde} {item.unit || 'pcs'}
                                </span>
                              </div>
                            )}

                            {/* Status Badge */}
                            <div>
                              {isDeficit && (
                                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                                  <AlertCircle className="w-3 h-3 shrink-0 text-rose-600" />
                                  <span>Déficit: -{deficitAmount} {item.unit || 'pcs'}</span>
                                </span>
                              )}
                              {isSeuilAlert && (
                                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                                  <AlertTriangle className="w-3 h-3 shrink-0 text-amber-600" />
                                  <span>Alerte Seuil (≤ {seuilMin})</span>
                                </span>
                              )}
                              {isStockOk && (
                                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-600" />
                                  <span>Stock Conforme</span>
                                </span>
                              )}
                              {isEntree && (
                                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200">
                                  <TrendingUp className="w-3 h-3 shrink-0 text-blue-600" />
                                  <span>Réappro (+{qteVal})</span>
                                </span>
                              )}
                              {isCmd && (
                                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                                  <ShoppingCart className="w-3 h-3 shrink-0 text-amber-600" />
                                  <span>Commande ({qteVal} pcs)</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* GLOBAL MULTI-ITEMS SUMMARY & VERIFICATION - EXCEL LIGHT STYLE */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold uppercase tracking-wider text-[11px] text-slate-800">
                      Bilan & Contrôle du Bon
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[11px] text-slate-600">Lignes : <b className="text-slate-900">{mouvementItems.length}</b></span>
                    <span className="text-[11px] text-slate-300">•</span>
                    <span className="text-[11px] text-slate-600">Quantité Totale : <b className="text-emerald-700 font-bold">{mouvementItems.reduce((acc, i) => acc + (parseFloat(i.quantite) || 0), 0)} pcs</b></span>
                  </div>
                </div>

                {/* Validation Status Indicator */}
                {(() => {
                  const isSortie = form.type.includes('Sortie') || form.type === 'Bon de Sortie';
                  const invalidQte = mouvementItems.some((i) => !i.quantite || parseFloat(i.quantite) <= 0);
                  const emptyRef = mouvementItems.some((i) => !i.ref || String(i.ref).trim() === '');
                  const deficitItems = isSortie
                    ? mouvementItems.filter((i) => {
                        const m = unifiedSearchCatalog.find((c) => c.ref === i.ref);
                        const st = m ? (m.stockActuel ?? m.raw?.stockActuel ?? m.raw?.stockInitial ?? 0) : 0;
                        return (parseFloat(i.quantite) || 0) > st;
                      })
                    : [];

                  if (emptyRef) {
                    return (
                      <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>Veuillez sélectionner une référence pour toutes les lignes d'articles.</span>
                      </div>
                    );
                  }

                  if (invalidQte) {
                    return (
                      <div className="flex items-center gap-2 text-xs text-rose-900 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>Quantité invalide détectée : chaque article doit avoir une quantité supérieure à 0.</span>
                      </div>
                    );
                  }

                  if (deficitItems.length > 0) {
                    return (
                      <div className="flex items-center justify-between text-xs text-rose-900 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>
                            <b>{deficitItems.length} article(s) en déficit</b> par rapport au stock physique.
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-300">
                          Avertissement
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div className="flex items-center justify-between text-xs text-emerald-900 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>Tous les articles sont conformes et prêts pour l'enregistrement.</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                        Prêt à Valider
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 6. CONTEXTUAL FIELDS BASED ON FLOW TYPE */}
            {/* CASE A: SORTIE INTERNE */}
            {isSortieInterne && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                {/* 5 Action Cards for Sortie Interne */}
                <div>
                  <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-600" />
                      <span>Type d'Intervention / Motif de Sortie (Action) :</span>
                    </span>
                    <span className="text-[9.5px] font-mono text-slate-400 font-normal">5 modes d'intervention</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
                    {[
                      {
                        id: 'CORRECTIVE',
                        label: 'Corrective',
                        icon: Wrench,
                        desc: 'Dépannage & Panne Machine',
                        color: 'border-blue-400 bg-blue-50 text-blue-950',
                        activeRing: 'ring-2 ring-blue-500/20 shadow-2xs',
                      },
                      {
                        id: 'PREVENTIVE',
                        label: 'Préventive',
                        icon: ShieldAlert,
                        desc: 'Entretien Planifié / Gamme',
                        color: 'border-emerald-400 bg-emerald-50 text-emerald-950',
                        activeRing: 'ring-2 ring-emerald-500/20 shadow-2xs',
                      },
                      {
                        id: 'AMELIORATIVE',
                        label: 'Amélioration',
                        icon: Sparkles,
                        desc: 'Projet & Travaux Neufs',
                        color: 'border-purple-400 bg-purple-50 text-purple-950',
                        activeRing: 'ring-2 ring-purple-500/20 shadow-2xs',
                      },
                      {
                        id: 'USAGE',
                        label: 'Usage Perso',
                        icon: Users,
                        desc: 'Dotation / Profil Utilisateur',
                        color: 'border-amber-400 bg-amber-50 text-amber-950',
                        activeRing: 'ring-2 ring-amber-500/20 shadow-2xs',
                      },
                      {
                        id: 'INVENTAIRE',
                        label: 'Inventaire',
                        icon: ClipboardList,
                        desc: 'Ajustement Écart / Rebut',
                        color: 'border-rose-400 bg-rose-50 text-rose-950',
                        activeRing: 'ring-2 ring-rose-500/20 shadow-2xs',
                      },
                    ].map((act) => {
                      const IconComp = act.icon;
                      const isActive = form.action_id === act.id;
                      return (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => {
                            const updatedForm = { ...form, action_id: act.id };
                            if (act.id === 'USAGE') {
                              updatedForm.id_machine_registered = '';
                              // Auto sync zone based on usage_type
                              if (form.usage_type === 'technician' && form.technicien) {
                                const t = technicians.find((tech) => tech.nom === form.technicien);
                                if (t?.id_zone) updatedForm.id_zone = t.id_zone;
                              } else if (form.usage_type === 'operation' && form.operation) {
                                const op = operatorsList.find((o) => o.nom === form.operation);
                                if (op?.id_zone) updatedForm.id_zone = op.id_zone;
                              } else if (form.usage_type === 'chef' && form.operation) {
                                const ch = chefsList.find((c) => c.nom === form.operation);
                                if (ch?.id_zone) updatedForm.id_zone = ch.id_zone;
                              }
                            } else if (act.id === 'CORRECTIVE') {
                              updatedForm.operation = '';
                              updatedForm.id_operation = '';
                            }
                            setForm(updatedForm);
                          }}
                          className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            isActive
                              ? `${act.color} ${act.activeRing} font-bold`
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <IconComp className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs font-bold truncate">{act.label}</span>
                          </div>
                          <div className="text-[9.5px] text-slate-500 leading-tight truncate">{act.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-fields for USAGE action */}
                {form.action_id === 'USAGE' ? (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block">
                        Bénéficiaire de l'Usage Personnel :
                      </label>
                      <span className="text-[10px] text-amber-700 font-medium italic">
                        Machine masquée (Non applicable)
                      </span>
                    </div>

                    {/* Usage Type Toggle */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'technician', label: 'Technicien', icon: Wrench },
                        { id: 'operation', label: 'Opérateur', icon: Users },
                        { id: 'chef', label: 'Chef / Superviseur', icon: Crown },
                      ].map((u) => {
                        const UIcon = u.icon;
                        const isSelected = form.usage_type === u.id;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              let newZone = form.id_zone;
                              let newTech = form.technicien;
                              let newOp = form.operation;
                              let newOpId = form.id_operation;

                              if (u.id === 'technician') {
                                const t = technicians[0];
                                newTech = t?.nom || '';
                                if (t?.id_zone) newZone = t.id_zone;
                                newOp = '';
                                newOpId = '';
                              } else if (u.id === 'operation') {
                                const op = operatorsList[0];
                                newOp = op?.nom || '';
                                newOpId = op?.id_operation || '';
                                if (op?.id_zone) newZone = op.id_zone;
                              } else if (u.id === 'chef') {
                                const ch = chefsList[0];
                                newOp = ch?.nom || '';
                                newOpId = ch?.id_operation || '';
                                if (ch?.id_zone) newZone = ch.id_zone;
                              }

                              setForm({
                                ...form,
                                usage_type: u.id,
                                id_zone: newZone,
                                technicien: newTech,
                                operation: newOp,
                                id_operation: newOpId,
                              });
                            }}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <UIcon className="w-3.5 h-3.5" />
                            <span>{u.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Beneficiary Dropdown based on usage_type */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      {form.usage_type === 'technician' && (
                        <div>
                          <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block mb-1">
                            Sélectionner le Technicien
                          </label>
                          <CustomSelect
                            value={form.technicien}
                            onChange={(val) => {
                              const t = technicians.find((tech) => tech.nom === val);
                              setForm({
                                ...form,
                                technicien: val,
                                id_technician: t?.id_technician || '',
                                id_zone: t?.id_zone || form.id_zone,
                              });
                            }}
                            options={technicians.map((t) => ({
                              value: t.nom,
                              label: t.nom,
                              badge: t.id_technician,
                            }))}
                            placeholder="-- Technicien --"
                            onAddNew={onOpenAddTech}
                          />
                        </div>
                      )}

                      {form.usage_type === 'operation' && (
                        <div>
                          <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block mb-1">
                            Sélectionner l'Opérateur
                          </label>
                          <CustomSelect
                            value={form.operation}
                            onChange={(val) => {
                              const op = operatorsList.find((o) => o.nom === val);
                              setForm({
                                ...form,
                                operation: val,
                                id_operation: op?.id_operation || '',
                                id_zone: op?.id_zone || form.id_zone,
                              });
                            }}
                            options={operatorsList.map((op) => ({
                              value: op.nom,
                              label: op.nom,
                              badge: op.id_operation,
                            }))}
                            placeholder="-- Opérateur --"
                            onAddNew={onOpenAddChef}
                          />
                        </div>
                      )}

                      {form.usage_type === 'chef' && (
                        <div>
                          <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block mb-1">
                            Sélectionner le Chef / Superviseur
                          </label>
                          <CustomSelect
                            value={form.operation}
                            onChange={(val) => {
                              const ch = chefsList.find((c) => c.nom === val);
                              setForm({
                                ...form,
                                operation: val,
                                id_operation: ch?.id_operation || '',
                                id_zone: ch?.id_zone || form.id_zone,
                              });
                            }}
                            options={chefsList.map((ch) => ({
                              value: ch.nom,
                              label: ch.nom,
                              badge: ch.id_operation,
                            }))}
                            placeholder="-- Chef d'équipe --"
                            onAddNew={onOpenAddChef}
                          />
                        </div>
                      )}

                      {/* Auto-deduced Zone */}
                      <div>
                        <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                          <span>Zone Rattachée</span>
                          <span className="text-[9px] text-amber-700 font-mono">(Déduite)</span>
                        </label>
                        <CustomSelect
                          value={form.id_zone}
                          onChange={(val) => setForm({ ...form, id_zone: val })}
                          options={zones.map((z) => ({
                            value: z.id_zone,
                            label: `${z.libelle} (${z.id_zone})`,
                          }))}
                          placeholder="-- Zone --"
                          onAddNew={onOpenAddZone}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard intervention fields for CORRECTIVE, PREVENTIVE, AMELIORATIVE, INVENTAIRE */
                  <div className="space-y-2.5">
                    {/* Zone & Machine */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Zone de l'Intervention
                        </label>
                        <CustomSelect
                          value={form.id_zone}
                          onChange={(val) => setForm({ ...form, id_zone: val })}
                          options={zones.map((z) => ({
                            value: z.id_zone,
                            label: `${z.libelle} (${z.id_zone})`,
                          }))}
                          placeholder="-- Zone --"
                          onAddNew={onOpenAddZone}
                        />
                      </div>

                      {/* Machine is hidden in INVENTAIRE, active in others */}
                      {form.action_id !== 'INVENTAIRE' ? (
                        <div>
                          <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Machine Concernée</span>
                            {form.action_id === 'CORRECTIVE' && (
                              <span className="text-[9px] text-rose-600 font-bold">*Requis</span>
                            )}
                          </label>
                          <CustomSelect
                            value={form.id_machine_registered}
                            onChange={(val) => {
                              const m = machines.find((mach) => mach.id_machine_registered === val);
                              setForm({
                                ...form,
                                id_machine_registered: val,
                                id_zone: m?.id_zone_default || form.id_zone,
                                technicien: m?.technician || form.technicien,
                              });
                            }}
                            options={[
                              { value: '', label: '-- Atelier / Sans Machine Spécifique --' },
                              ...availableMachines.map((m) => ({
                                value: m.id_machine_registered,
                                label: `[${m.id_machine_registered}] ${m.designation}`,
                              })),
                            ]}
                            placeholder="-- Machine --"
                            onAddNew={onOpenAddMachine}
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                            Motif de l'Écart / Rebut
                          </label>
                          <select
                            value={form.commentaire || 'Écart d’inventaire'}
                            onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                          >
                            <option value="Écart d’inventaire physique">Écart d’inventaire physique</option>
                            <option value="Casse / Détérioration en atelier">Casse / Détérioration en atelier</option>
                            <option value="Rebut & Obsolescence">Rebut & Obsolescence</option>
                            <option value="Péremption ou Déclassement">Péremption ou Déclassement</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Technicien & Opération / Superviseur */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Technicien Intervenant
                        </label>
                        <CustomSelect
                          value={form.technicien}
                          onChange={(val) => {
                            const t = technicians.find((tech) => tech.nom === val);
                            setForm({
                              ...form,
                              technicien: val,
                              id_technician: t?.id_technician || '',
                            });
                          }}
                          options={availableTechs.map((t) => ({
                            value: t.nom,
                            label: t.nom,
                            badge: t.id_technician,
                          }))}
                          placeholder="-- Technicien --"
                          onAddNew={onOpenAddTech}
                        />
                      </div>

                      {/* Superviseur / Opération (Hidden in CORRECTIVE and INVENTAIRE as per GMAO spec) */}
                      {form.action_id !== 'CORRECTIVE' && form.action_id !== 'INVENTAIRE' ? (
                        <div>
                          <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                            Superviseur / Chef (Opt.)
                          </label>
                          <CustomSelect
                            value={form.operation}
                            onChange={(val) => {
                              const c = chefsList.find((ch) => ch.nom === val);
                              setForm({
                                ...form,
                                operation: val,
                                id_operation: c?.id_operation || '',
                              });
                            }}
                            options={[
                              { value: '', label: '-- Aucun Superviseur --' },
                              ...chefsList.map((c) => ({
                                value: c.nom,
                                label: c.nom,
                                badge: c.id_operation,
                              })),
                            ]}
                            placeholder="-- Superviseur --"
                            onAddNew={onOpenAddChef}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center text-[10.5px] text-slate-500 italic bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
                          {form.action_id === 'CORRECTIVE'
                            ? 'ℹ️ Mode Correctif : Dépannage direct sans validation superviseur requise.'
                            : 'ℹ️ Mode Inventaire : Régularisation du stock physique enregistrée.'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CASE B: ENTRÉE INTERNE */}
            {isEntreeInterne && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                {/* 5 Action Cards for Entrée Interne */}
                <div>
                  <label className="text-[10.5px] font-bold text-cyan-950 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-cyan-700" />
                      <span>Motif de l'Entrée Interne (Action) :</span>
                    </span>
                    <span className="text-[9.5px] font-mono text-cyan-600 font-normal">5 modes de réintégration</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
                    {[
                      {
                        id: 'RETOUR',
                        label: 'Retour Pièce',
                        icon: RotateCcw,
                        desc: 'Non utilisé / Restant intervention',
                        color: 'border-cyan-400 bg-cyan-50 text-cyan-950',
                        activeRing: 'ring-2 ring-cyan-500/20 shadow-2xs',
                      },
                      {
                        id: 'DEMONTAGE',
                        label: 'Démontage Machine',
                        icon: Wrench,
                        desc: 'Pièce déposée / récupérée',
                        color: 'border-purple-400 bg-purple-50 text-purple-950',
                        activeRing: 'ring-2 ring-purple-500/20 shadow-2xs',
                      },
                      {
                        id: 'INVENTAIRE',
                        label: 'Ajustement +',
                        icon: ClipboardList,
                        desc: 'Surplus constaté en inventaire',
                        color: 'border-emerald-400 bg-emerald-50 text-emerald-950',
                        activeRing: 'ring-2 ring-emerald-500/20 shadow-2xs',
                      },
                      {
                        id: 'REPARATION_INTERNE',
                        label: 'Réparation Interne',
                        icon: RefreshCw,
                        desc: 'Rénovation atelier terminée',
                        color: 'border-blue-400 bg-blue-50 text-blue-950',
                        activeRing: 'ring-2 ring-blue-500/20 shadow-2xs',
                      },
                      {
                        id: 'TRANSFERT',
                        label: 'Transfert Interne',
                        icon: CornerDownRight,
                        desc: 'Transfert inter-ateliers / magasin',
                        color: 'border-amber-400 bg-amber-50 text-amber-950',
                        activeRing: 'ring-2 ring-amber-500/20 shadow-2xs',
                      },
                    ].map((act) => {
                      const IconComp = act.icon;
                      const isActive = form.action_id === act.id;
                      return (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => setForm({ ...form, action_id: act.id })}
                          className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            isActive
                              ? `${act.color} ${act.activeRing} font-bold`
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <IconComp className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs font-bold truncate">{act.label}</span>
                          </div>
                          <div className="text-[9.5px] text-slate-500 leading-tight truncate">{act.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Conditional fields for DEMONTAGE / RETOUR */}
                {(form.action_id === 'DEMONTAGE' || form.action_id === 'RETOUR') && (
                  <div className="p-3 bg-cyan-50/40 rounded-xl border border-cyan-200 space-y-2.5">
                    <div className="text-[10.5px] font-bold text-cyan-950 uppercase tracking-wider flex items-center gap-1">
                      <Factory className="w-3.5 h-3.5 text-cyan-700" />
                      <span>Origine du Matériel Rapatrié :</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Machine d'Origine (Dépose)
                        </label>
                        <CustomSelect
                          value={form.id_machine_registered}
                          onChange={(val) => {
                            const m = machines.find((mach) => mach.id_machine_registered === val);
                            setForm({
                              ...form,
                              id_machine_registered: val,
                              id_zone: m?.id_zone_default || form.id_zone,
                            });
                          }}
                          options={[
                            { value: '', label: '-- Non Spécifiée / Atelier --' },
                            ...machines.map((m) => ({
                              value: m.id_machine_registered,
                              label: `[${m.id_machine_registered}] ${m.designation}`,
                            })),
                          ]}
                          placeholder="-- Machine --"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Technicien Rapporteur
                        </label>
                        <CustomSelect
                          value={form.technicien}
                          onChange={(val) => {
                            const t = technicians.find((tech) => tech.nom === val);
                            setForm({
                              ...form,
                              technicien: val,
                              id_technician: t?.id_technician || '',
                            });
                          }}
                          options={technicians.map((t) => ({
                            value: t.nom,
                            label: t.nom,
                            badge: t.id_technician,
                          }))}
                          placeholder="-- Technicien --"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Storage and Condition fields */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-bold text-cyan-900 uppercase tracking-wider block mb-1">
                      Emplacement de Rangement
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: R1-B04 ou Atelier Central"
                      value={form.emplacement_reception}
                      onChange={(e) => setForm({ ...form, emplacement_reception: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-cyan-900 uppercase tracking-wider block mb-1">
                      État du Matériel Rapatrié
                    </label>
                    <select
                      value={form.entrepot_etat}
                      onChange={(e) => setForm({ ...form, entrepot_etat: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    >
                      <option value="Fonctionnel">Fonctionnel</option>
                      <option value="En révision">En révision</option>
                      <option value="Neuf">Neuf</option>
                      <option value="En attente">En attente contrôle</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* CASE C: BON DE SORTIE (RÉPARATION EXTERNE) */}
            {isBonSortie && (
              <div className="space-y-3 pt-2 border-t border-slate-100 bg-purple-50/40 p-3 rounded-xl border border-purple-200">
                <div>
                  <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1">
                    Atelier / Prestataire Extérieur (Bobineur / Usineur)
                  </label>
                  <CustomSelect
                    value={form.prestataire_externe}
                    onChange={(val) => setForm({ ...form, prestataire_externe: val })}
                    options={supplierOptions.map((s) => ({ value: s, label: s }))}
                    placeholder="-- Sélectionner Prestataire --"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1">
                      Responsable de l'Envoi
                    </label>
                    <CustomSelect
                      value={form.technicien}
                      onChange={(val) => setForm({ ...form, technicien: val })}
                      options={technicians.map((t) => ({ value: t.nom, label: t.nom }))}
                      placeholder="-- Technicien --"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1">
                      Date de Retour Estimée
                    </label>
                    <input
                      type="date"
                      value={form.date_retour_prevue}
                      onChange={(e) => setForm({ ...form, date_retour_prevue: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-xl border border-purple-200 bg-white text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CASE D: ENTRÉE EXTERNE */}
            {isEntreeExterne && (
              <div className="space-y-3 pt-2 border-t border-slate-100 bg-emerald-50/40 p-3 rounded-xl border border-emerald-200">
                <div>
                  <label className="text-[10.5px] font-bold text-emerald-950 uppercase tracking-wider block mb-1">
                    Fournisseur / Expéditeur
                  </label>
                  <CustomSelect
                    value={form.fournisseur}
                    onChange={(val) => setForm({ ...form, fournisseur: val })}
                    options={supplierOptions.map((s) => ({ value: s, label: s }))}
                    placeholder="-- Sélectionner Fournisseur --"
                  />
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-emerald-950 uppercase tracking-wider block mb-1">
                    Emplacement de Réception Magasin
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Magasin Central - R1"
                    value={form.emplacement_reception}
                    onChange={(e) => setForm({ ...form, emplacement_reception: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-xl border border-emerald-200 bg-white text-xs font-mono text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* CASE E: COMMANDE */}
            {isCommandeFlow && (
              <div className="space-y-3 pt-2 border-t border-slate-100 bg-amber-50/40 p-3 rounded-xl border border-amber-200">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, action_id: 'COMMANDE_ACHAT' })}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition ${
                      form.action_id === 'COMMANDE_ACHAT'
                        ? 'bg-white border-amber-500 shadow-sm ring-1 ring-amber-500'
                        : 'bg-white/50 border-amber-200 hover:bg-white text-slate-500'
                    }`}
                  >
                    <div className={`font-bold text-xs ${form.action_id === 'COMMANDE_ACHAT' ? 'text-amber-900' : 'text-slate-600'}`}>Demande d'Achat</div>
                    <div className="text-[10px] mt-0.5 opacity-80">Achat de PDR / Composants</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, action_id: 'COMMANDE_SORTIE' })}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition ${
                      form.action_id === 'COMMANDE_SORTIE'
                        ? 'bg-white border-amber-500 shadow-sm ring-1 ring-amber-500'
                        : 'bg-white/50 border-amber-200 hover:bg-white text-slate-500'
                    }`}
                  >
                    <div className={`font-bold text-xs ${form.action_id === 'COMMANDE_SORTIE' ? 'text-amber-900' : 'text-slate-600'}`}>Demande de Sortie</div>
                    <div className="text-[10px] mt-0.5 opacity-80">Sortie pour Maintenance</div>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block mb-1">
                      Demandeur / Responsable
                    </label>
                    <CustomSelect
                      value={form.technicien}
                      onChange={(val) => setForm({ ...form, technicien: val })}
                      options={technicians.map((t) => ({ value: t.nom, label: t.nom }))}
                      placeholder="-- Demandeur --"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block mb-1">
                      Fournisseur Suggéré
                    </label>
                    <input
                      type="text"
                      placeholder="Nom du fournisseur"
                      value={form.fournisseur}
                      onChange={(e) => setForm({ ...form, fournisseur: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-xl border border-amber-200 bg-white text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Commentaire / Observation */}
            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Commentaire / Motif du Bon
              </label>
              <input
                type="text"
                placeholder="Observation, raison du mouvement..."
                value={form.commentaire}
                onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                className="w-full h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
              />
            </div>

            {/* Submit & Reset Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  resetForm();
                }}
                className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 border border-slate-200 flex items-center justify-center transition cursor-pointer shrink-0"
                title="Réinitialiser le formulaire"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="submit"
                className={`flex-1 h-10 rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                  getFormValidationState().isPristine
                    ? 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                    : getFormValidationState().isValid
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                      : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                }`}
              >
                {getFormValidationState().isPristine ? (
                  <>
                    <HelpCircle className="w-4 h-4" />
                    <span>Formulaire prêt à être rempli</span>
                  </>
                ) : getFormValidationState().isValid ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Valider et Enregistrer (Prêt)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Valider {form.type} ({mouvementItems.reduce((acc, i) => acc + (Number(i.quantite) || 0), 0)} pcs) • {form.code_bon}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Table: Movements History & Excel Twin (7 Cols on large screens) */}
        <div className="lg:col-span-7">
          <MouvementsJournalTable
            mouvements={mouvements}
            stockItems={stockItems}
            warehouseItems={warehouseItems}
            machines={machines}
            zones={zones}
            technicians={technicians}
            operations={operations}
            onUpdateMouvement={onUpdateMouvement}
            onDeleteMouvement={onDeleteMouvement}
          />
        </div>
      </div>

      {/* UNIFIED ARTICLE & WAREHOUSE ITEM SEARCH MODAL */}
      {isArticleSearchOpen && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Catalogue Unifié des Pièces & Équipements</h3>
                  <p className="text-xs text-slate-500">Recherche instantanée dans le Stock PDR et le Registre de l'Entrepôt</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsArticleSearchOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input & Source Filters */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tapez un mot-clé (ex: 6204, Moteur, POMPE, Courroie, R1...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Selected Source & Quick Add */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  <span className="text-slate-400 font-bold text-[10.5px] uppercase shrink-0">Source Sélectionnée :</span>
                  {searchActiveTab === 'STOCK_PDR' && (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold">📦 Catalogue PDR ({stockItems.length})</span>
                  )}
                  {searchActiveTab === 'WAREHOUSE_PARTIE' && (
                    <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-lg font-bold">⚙️ Entrepôt: PARTIES ({warehouseItems.filter((w) => w.category === 'PARTIE' || w.nature === 'PARTIE').length})</span>
                  )}
                  {searchActiveTab === 'WAREHOUSE_COMPOSANT' && (
                    <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg font-bold">🔧 Entrepôt: COMPOSANTS ({warehouseItems.filter((w) => w.category === 'COMPOSANT' || w.nature === 'COMPOSANT').length})</span>
                  )}
                </div>
                {searchActiveTab === 'STOCK_PDR' && onOpenAddArticle && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsArticleSearchOpen(false);
                      onOpenAddArticle();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold transition cursor-pointer text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Créer Nouvelle PDR</span>
                  </button>
                )}
                {searchActiveTab === 'WAREHOUSE_PARTIE' && onOpenAddMachine && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsArticleSearchOpen(false);
                      onOpenAddMachine();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold transition cursor-pointer text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Créer Nouvelle Machine</span>
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="p-4 flex-1 overflow-y-auto max-h-[50vh] space-y-2">
              {filteredCatalogResults.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">Aucun article trouvé pour "{searchQuery}"</p>
                </div>
              ) : (
                filteredCatalogResults.map((art, idx) => (
                  <div
                    key={`cat-item-${art.id ?? ''}-${art.ref ?? ''}-${idx}`}
                    onClick={() => handleSelectCatalogItem(art)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-indigo-950">
                          {highlightMatch(art.ref, searchQuery)}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${art.badgeColor}`}>
                          {art.badge}
                        </span>
                        {art.stockActuel <= 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                            Rupture
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-700 font-medium">
                        {highlightMatch(art.designation, searchQuery)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Emplacement : <b className="font-mono text-slate-600">{art.emplacement}</b> • Type :{' '}
                        <b className="font-mono text-slate-600">{art.type}</b>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-400">Disponible</div>
                      <div className={`font-mono font-bold text-sm ${art.stockActuel <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {art.stockActuel} {art.unit}
                      </div>
                      <button
                        type="button"
                        className="mt-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded cursor-pointer"
                      >
                        Sélectionner
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
