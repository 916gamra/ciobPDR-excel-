import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Puzzle,
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
  Gauge,
  ShieldCheck,
  Hammer,
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
      newItemSource = 'WAREHOUSE_PARTIE'; // Dedicated to Warehouse Parts & Components strictly by default
      newDestType = 'PRESTATAIRE_EXTERNE';
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
    if (raw === 'ETALONNAGE_CONTROLE' || raw === 'ETALONNAGE' || raw === 'CONTROLE') return 'ETALONNAGE_CONTROLE';
    if (raw === 'GARANTIE_ECHANGE' || raw === 'GARANTIE' || raw === 'ECHANGE') return 'GARANTIE_ECHANGE';
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
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 shadow-2xs">
          <div className="w-4 h-4 rounded-md bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Truck className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
          <span className="text-[10.5px] font-bold whitespace-nowrap text-purple-950">Rép. Externe</span>
          <span className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-purple-100 text-purple-700 font-bold">
            SOUS-TRAITANCE
          </span>
        </div>
      );
    }

    if (act === 'ETALONNAGE_CONTROLE') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 shadow-2xs">
          <div className="w-4 h-4 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Gauge className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
          <span className="text-[10.5px] font-bold whitespace-nowrap text-blue-950">Étalonnage</span>
          <span className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-blue-100 text-blue-700 font-bold">
            MÉTROLOGIE
          </span>
        </div>
      );
    }

    if (act === 'GARANTIE_ECHANGE') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-2xs">
          <div className="w-4 h-4 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
          <span className="text-[10.5px] font-bold whitespace-nowrap text-emerald-950">Garantie</span>
          <span className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-emerald-100 text-emerald-700 font-bold">
            ÉCHANGE
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

  // Dynamic available machines based on selected zone
  const availableMachines = useMemo(() => {
    if (!form.id_zone) return machines;
    return machines.filter((m) => m.id_zone_default === form.id_zone);
  }, [machines, form.id_zone]);

  // Available technicians:
  // For Corrective: ALL technicians across the factory can intervene
  // For Preventive / other: ALL technicians with zone technicians prioritized
  const availableTechs = useMemo(() => {
    if (form.action_id === 'CORRECTIVE') {
      return technicians;
    }
    if (!form.id_zone) return technicians;
    const zoneTechs = technicians.filter((t) => t.id_zone === form.id_zone);
    const otherTechs = technicians.filter((t) => t.id_zone !== form.id_zone);
    return [...zoneTechs, ...otherTechs];
  }, [technicians, form.id_zone, form.action_id]);

  // Filtered lists for Responsables (all RESP / CHEF profiles)
  const responsablesList = useMemo(() => {
    return operations.filter(
      (op) =>
        op.type_profil === 'RESPONSABLE' ||
        op.type_profil === 'CHEF' ||
        String(op.id_operation).startsWith('RESP') ||
        String(op.id_operation).startsWith('CHEF') ||
        String(op.nom).toUpperCase().includes('RESP') ||
        String(op.nom).toUpperCase().includes('CHEF')
    );
  }, [operations]);

  // Backward-compatible aliases for existing references
  const supervisorsList = responsablesList;
  const chefsList = responsablesList;

  // Helper to extract allowed zones for a given responsable
  const getResponsableAllowedZones = useCallback((resp) => {
    if (!resp) return zones;
    let zoneIds = [];
    if (Array.isArray(resp.zones) && resp.zones.length > 0) {
      zoneIds = resp.zones;
    } else if (resp.id_zone) {
      zoneIds = String(resp.id_zone).split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (zoneIds.length === 0 || zoneIds.includes('ALL')) {
      return zones;
    }
    const matched = zones.filter((z) => zoneIds.includes(z.id_zone));
    return matched.length > 0 ? matched : zones;
  }, [zones]);

  // Current Responsable for USAGE mode
  const currentUsageResponsable = useMemo(() => {
    return (
      responsablesList.find(
        (r) => r.nom === form.operation || r.id_operation === form.id_operation
      ) ||
      responsablesList[0] ||
      null
    );
  }, [responsablesList, form.operation, form.id_operation]);

  // Maintenance Workshop default zone (e.g. ZONE-ATEL)
  const maintenanceZone = useMemo(() => {
    return (
      zones.find(
        (z) =>
          z.id_zone === 'ZONE-ATEL' ||
          z.id_zone?.toUpperCase().includes('ATEL') ||
          z.libelle?.toUpperCase().includes('ATELIER') ||
          z.libelle?.toUpperCase().includes('MAINT')
      ) ||
      zones[0] || { id_zone: 'ZONE-ATEL', libelle: 'Atelier Central Maintenance' }
    );
  }, [zones]);

  // Smart filter to find only Responsables related to a given zone (e.g. for Operator usage)
  const getResponsablesForZone = useCallback(
    (zoneId) => {
      if (!zoneId) return responsablesList;
      const filtered = responsablesList.filter((r) => {
        if (r.id_zone === 'ALL' || (Array.isArray(r.zones) && r.zones.includes('ALL'))) return true;
        if (r.id_zone === zoneId) return true;
        if (Array.isArray(r.zones) && r.zones.includes(zoneId)) return true;
        if (
          typeof r.id_zone === 'string' &&
          r.id_zone.split(',').map((s) => s.trim()).includes(zoneId)
        ) {
          return true;
        }
        return false;
      });
      return filtered.length > 0 ? filtered : responsablesList;
    },
    [responsablesList]
  );

  // Responsables list filtered for the current Operator's zone
  const operatorFilteredResponsables = useMemo(() => {
    return getResponsablesForZone(form.id_zone);
  }, [getResponsablesForZone, form.id_zone]);

  // Allowed zones for the currently selected USAGE Responsable
  const usageAllowedZones = useMemo(() => {
    return getResponsableAllowedZones(currentUsageResponsable);
  }, [currentUsageResponsable, getResponsableAllowedZones]);

  // Available machines for USAGE mode, filtered exclusively by selected zone
  const usageAvailableMachines = useMemo(() => {
    if (!form.id_zone) return [];
    return machines.filter((m) => m.id_zone_default === form.id_zone);
  }, [machines, form.id_zone]);

  const operatorsList = useMemo(() => {
    return operations.filter(
      (op) =>
        op.type_profil === 'OPERATEUR' ||
        (!String(op.id_operation).startsWith('CHEF') &&
          !String(op.id_operation).startsWith('RESP') &&
          op.type_profil !== 'RESPONSABLE' &&
          op.type_profil !== 'CHEF')
    );
  }, [operations]);

  // Helper to smartly find responsable assigned to a specific zone
  const findSupervisorForZone = (zoneId) => {
    if (!zoneId) return responsablesList[0] || null;

    const hasTpl = (s, tplId) => {
      if (Array.isArray(s.templates) && s.templates.some((t) => (typeof t === 'string' ? t : t?.id) === tplId)) return true;
      if (Array.isArray(s.template_ids) && s.template_ids.includes(tplId)) return true;
      if (typeof s.template_id === 'string' && s.template_id.includes(tplId)) return true;
      return false;
    };

    const zoneMatches = (s) =>
      (s.zones && (s.zones.includes(zoneId) || s.zones.includes('ALL'))) ||
      s.id_zone === zoneId ||
      s.id_zone === 'ALL' ||
      (typeof s.id_zone === 'string' && s.id_zone.split(',').map((x) => x.trim()).includes(zoneId));

    // 1. Check Responsable Zone (RZN) matching this zone
    const rzn = responsablesList.find((s) => hasTpl(s, 'RZN') && zoneMatches(s));
    if (rzn) return rzn;

    // 2. Check Responsable Maintenance (RMT)
    const rmt = responsablesList.find((s) => hasTpl(s, 'RMT') && zoneMatches(s));
    if (rmt) return rmt;

    // 3. Direct match on zones or id_zone
    const directMatch = responsablesList.find((s) => zoneMatches(s));
    if (directMatch) return directMatch;

    return responsablesList[0] || null;
  };

  // Auto-populate responsable when Zone changes for Corrective, Preventive and Améliorative
  useEffect(() => {
    if (
      form.type === 'Sortie Interne' &&
      (form.action_id === 'CORRECTIVE' || form.action_id === 'PREVENTIVE' || form.action_id === 'AMELIORATIVE')
    ) {
      const sup = findSupervisorForZone(form.id_zone);
      if (sup) {
        setForm((prev) => {
          if (prev.operation === sup.nom && prev.id_operation === sup.id_operation) return prev;
          return {
            ...prev,
            operation: sup.nom,
            id_operation: sup.id_operation,
          };
        });
      }
    }
  }, [form.id_zone, form.action_id, form.type, responsablesList]);

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
        m.action_id === 'ETALONNAGE_CONTROLE' ||
        m.action_id === 'GARANTIE_ECHANGE' ||
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

    const isSortie = form.type === 'Sortie Interne';
    const isEntreeEx = form.type === 'Bon de Réception' || form.type === 'Entrée Externe';
    const isSortieEx = form.type === 'Bon de Sortie' || form.type === 'Sortie Externe';

    // Technicien validation
    if (form.action_id !== 'INVENTAIRE' && form.action_id !== 'REAPPRO' && !isSortieEx && form.action_id !== 'USAGE') {
      if (!form.id_technician && !form.technicien) {
        errors.push('Veuillez sélectionner ou saisir un Technicien intervenant.');
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

    // Specific USAGE Validation for 3 Profile Modes (Responsable, Technicien, Opérateur)
    if (isSortie && form.action_id === 'USAGE') {
      const uType = form.usage_type || 'responsable';
      if (uType === 'technician') {
        if (!form.technicien || String(form.technicien).trim() === '') {
          errors.push('Veuillez sélectionner le Technicien demandeur.');
        }
      } else if (uType === 'operation' || uType === 'operator') {
        if (!form.operation || String(form.operation).trim() === '') {
          errors.push('Veuillez sélectionner l’Opérateur demandeur (Obligatoire).');
        }
        if (!form.id_zone || String(form.id_zone).trim() === '') {
          errors.push('Zone d’affectation de l’Opérateur non définie.');
        }
      } else {
        // 'responsable' / 'chef'
        if (!form.operation || String(form.operation).trim() === '') {
          errors.push('Veuillez sélectionner le Responsable demandeur (Obligatoire).');
        }
        if (!form.id_zone || String(form.id_zone).trim() === '') {
          errors.push('Veuillez sélectionner la Zone rattachée au Responsable (Obligatoire).');
        }
      }
    }

    if (isSortieEx) {
      if (!form.prestataire_externe || String(form.prestataire_externe).trim() === '') {
        errors.push('Veuillez préciser le Prestataire Externe (Obligatoire).');
      }
      if (!form.date_retour_prevue || String(form.date_retour_prevue).trim() === '') {
        errors.push('Veuillez définir la Date de Retour Prévue (Obligatoire).');
      }
      if (!form.technicien || String(form.technicien).trim() === '') {
        errors.push('Veuillez sélectionner le Technicien Émetteur de la sortie.');
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

      let mvtTech = form.technicien;
      let mvtIdTech = form.id_technician;
      let mvtOp = form.operation;
      let mvtIdOp = form.id_operation;
      let mvtDemandeur = form.demandeur || form.operation || form.technicien || '';
      let mvtZone = form.type.includes('Entrée') ? '' : form.id_zone;
      let mvtUsageType = form.usage_type || 'responsable';

      if (form.action_id === 'USAGE') {
        if (form.usage_type === 'technician') {
          mvtTech = form.technicien;
          mvtIdTech = form.id_technician;
          mvtOp = '';
          mvtIdOp = form.id_technician;
          mvtDemandeur = form.technicien;
          mvtZone = form.id_zone || maintenanceZone.id_zone;
          mvtUsageType = 'technician';
        } else if (form.usage_type === 'operation' || form.usage_type === 'operator') {
          mvtTech = form.operation; // Nom de l'opérateur
          mvtIdTech = form.id_operation;
          mvtOp = form.responsable_validation || form.operation;
          mvtIdOp = form.id_responsable_validation || form.id_operation;
          mvtDemandeur = form.operation;
          mvtZone = form.id_zone;
          mvtUsageType = 'operation';
        } else {
          // Responsable
          mvtTech = form.operation;
          mvtIdTech = form.id_operation;
          mvtOp = form.operation;
          mvtIdOp = form.id_operation;
          mvtDemandeur = form.operation;
          mvtZone = form.id_zone;
          mvtUsageType = 'responsable';
        }
      }

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
        destination_category: isBonSortie ? 'PRESTATAIRE_EXTERNE' : form.destination_type,
        type: form.type,
        action_id: form.action_id,
        usage_type: mvtUsageType,
        id_zone: form.type.includes('Entrée') ? '' : mvtZone,
        id_machine_registered: form.type.includes('Entrée') ? '' : form.id_machine_registered,
        technicien: mvtTech,
        id_technician: mvtIdTech,
        operation: form.type.includes('Entrée') ? '' : mvtOp,
        id_operation: mvtIdOp,
        demandeur: mvtDemandeur,
        fournisseur: isBonSortie ? form.prestataire_externe : form.fournisseur,
        prestataire_externe: isBonSortie ? form.prestataire_externe : (form.prestataire_externe || ''),
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
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-purple-950 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-300">
                        {rep.code_bon}
                      </span>
                      {renderActionBadge(rep)}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{rep.date}</span>
                  </div>

                  <div>
                    <div className="font-bold text-xs text-slate-800">{rep.ref}</div>
                    <div className="text-xs text-slate-500">{rep.designation || 'Partie / Composant Entrepôt'}</div>
                    <div className="text-[11px] text-purple-900 font-medium mt-1">
                      Prestataire : <b>{rep.fournisseur || rep.prestataire_externe || 'Atelier Externe'}</b>
                    </div>
                    {rep.id_machine_registered && (
                      <div className="text-[10.5px] text-slate-600 font-mono mt-0.5">
                        Machine d'origine : <b>{rep.id_machine_registered}</b>
                      </div>
                    )}
                    {rep.date_retour_prevue && (
                      <div className="text-[10.5px] text-indigo-700 font-medium mt-0.5">
                        Retour prévu : <b>{rep.date_retour_prevue}</b>
                      </div>
                    )}
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
              <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2">
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
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'STOCK_PDR'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-2xs'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-emerald-50/40 hover:border-emerald-200 hover:text-emerald-900'
                    }`}
                  >
                    <Package className={`w-3.5 h-3.5 ${form.item_source === 'STOCK_PDR' ? 'text-emerald-600' : 'text-emerald-600/80'}`} />
                    <span>PDR (Stock)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, item_source: 'WAREHOUSE_PARTIE' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_PARTIE' })));
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'WAREHOUSE_PARTIE'
                        ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold ring-2 ring-purple-500/20 shadow-2xs'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-purple-50/40 hover:border-purple-200 hover:text-purple-900'
                    }`}
                  >
                    <Layers className={`w-3.5 h-3.5 ${form.item_source === 'WAREHOUSE_PARTIE' ? 'text-purple-600' : 'text-purple-600/80'}`} />
                    <span>PARTIE (Entrepôt)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, item_source: 'WAREHOUSE_COMPOSANT' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_COMPOSANT' })));
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'WAREHOUSE_COMPOSANT'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-2xs'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-indigo-50/40 hover:border-indigo-200 hover:text-indigo-900'
                    }`}
                  >
                    <Puzzle className={`w-3.5 h-3.5 ${form.item_source === 'WAREHOUSE_COMPOSANT' ? 'text-indigo-600' : 'text-indigo-600/80'}`} />
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
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.destination_type === 'STOCK_PDR'
                        ? 'bg-cyan-50 border-cyan-400 text-cyan-950 font-bold ring-2 ring-cyan-500/20 shadow-2xs'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-cyan-50/40 hover:border-cyan-200 hover:text-cyan-900'
                    }`}
                  >
                    <Package className={`w-3.5 h-3.5 ${form.destination_type === 'STOCK_PDR' ? 'text-cyan-600' : 'text-cyan-600/80'}`} />
                    <span>Magasin PDR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, destination_type: 'WAREHOUSE_PARTIE', item_source: 'WAREHOUSE_PARTIE' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_PARTIE' })));
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.destination_type === 'WAREHOUSE_PARTIE'
                        ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold ring-2 ring-purple-500/20 shadow-2xs'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-purple-50/40 hover:border-purple-200 hover:text-purple-900'
                    }`}
                  >
                    <Layers className={`w-3.5 h-3.5 ${form.destination_type === 'WAREHOUSE_PARTIE' ? 'text-purple-600' : 'text-purple-600/80'}`} />
                    <span>Entrepôt: PARTIE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, destination_type: 'WAREHOUSE_COMPOSANT', item_source: 'WAREHOUSE_COMPOSANT' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_COMPOSANT' })));
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.destination_type === 'WAREHOUSE_COMPOSANT'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-2xs'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-indigo-50/40 hover:border-indigo-200 hover:text-indigo-900'
                    }`}
                  >
                    <Puzzle className={`w-3.5 h-3.5 ${form.destination_type === 'WAREHOUSE_COMPOSANT' ? 'text-indigo-600' : 'text-indigo-600/80'}`} />
                    <span>Entrepôt: COMPOSANT</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. DYNAMIC SOURCE SELECTOR FOR BON DE SORTIE (Parts & Components strictly, with exception PDR Haute Valeur) */}
            {isBonSortie && (
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-purple-700" />
                    <span>Source Matériel (Entrepôt Sortant) :</span>
                  </label>
                  <span className="text-[10px] text-purple-700 font-semibold italic">
                    Priorité : PARTIE & COMPOSANT
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, item_source: 'WAREHOUSE_PARTIE' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_PARTIE' })));
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'WAREHOUSE_PARTIE'
                        ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold ring-2 ring-purple-500/20 shadow-2xs'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-purple-50/40 hover:border-purple-200 hover:text-purple-900'
                    }`}
                  >
                    <Layers className={`w-3.5 h-3.5 ${form.item_source === 'WAREHOUSE_PARTIE' ? 'text-purple-600' : 'text-purple-600/80'}`} />
                    <span className="truncate">PARTIE (Organe)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, item_source: 'WAREHOUSE_COMPOSANT' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_COMPOSANT' })));
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'WAREHOUSE_COMPOSANT'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-2xs'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-indigo-50/40 hover:border-indigo-200 hover:text-indigo-900'
                    }`}
                  >
                    <Puzzle className={`w-3.5 h-3.5 ${form.item_source === 'WAREHOUSE_COMPOSANT' ? 'text-indigo-600' : 'text-indigo-600/80'}`} />
                    <span className="truncate">COMPOSANT (Moteur...)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, item_source: 'STOCK_PDR' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'STOCK_PDR' })));
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'STOCK_PDR'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold ring-2 ring-amber-500/20 shadow-2xs'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-amber-50/40 hover:border-amber-200 hover:text-amber-900'
                    }`}
                    title="Exception PDR de haute valeur (Carte électronique, automate)"
                  >
                    <Package className={`w-3.5 h-3.5 ${form.item_source === 'STOCK_PDR' ? 'text-amber-600' : 'text-amber-600/80'}`} />
                    <span className="truncate">PDR (Exception)</span>
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
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'STOCK_PDR'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold ring-2 ring-amber-500/20 shadow-2xs'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-amber-50/40 hover:border-amber-200 hover:text-amber-900'
                    }`}
                  >
                    <Package className={`w-3.5 h-3.5 ${form.item_source === 'STOCK_PDR' ? 'text-amber-600' : 'text-amber-600/80'}`} />
                    <span>PDR (Stock)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, item_source: 'WAREHOUSE_PARTIE' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_PARTIE' })));
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'WAREHOUSE_PARTIE'
                        ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold ring-2 ring-purple-500/20 shadow-2xs'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-purple-50/40 hover:border-purple-200 hover:text-purple-900'
                    }`}
                  >
                    <Layers className={`w-3.5 h-3.5 ${form.item_source === 'WAREHOUSE_PARTIE' ? 'text-purple-600' : 'text-purple-600/80'}`} />
                    <span>PARTIE (Entrepôt)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, item_source: 'WAREHOUSE_COMPOSANT' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_COMPOSANT' })));
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.item_source === 'WAREHOUSE_COMPOSANT'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-2xs'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-indigo-50/40 hover:border-indigo-200 hover:text-indigo-900'
                    }`}
                  >
                    <Puzzle className={`w-3.5 h-3.5 ${form.item_source === 'WAREHOUSE_COMPOSANT' ? 'text-indigo-600' : 'text-indigo-600/80'}`} />
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
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.destination_type === 'STOCK_PDR'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-2xs'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-emerald-50/40 hover:border-emerald-200 hover:text-emerald-900'
                    }`}
                  >
                    <Package className={`w-3.5 h-3.5 ${form.destination_type === 'STOCK_PDR' ? 'text-emerald-600' : 'text-emerald-600/80'}`} />
                    <span>PDR (Stock)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, destination_type: 'WAREHOUSE_PARTIE', item_source: 'WAREHOUSE_PARTIE' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_PARTIE' })));
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.destination_type === 'WAREHOUSE_PARTIE'
                        ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold ring-2 ring-purple-500/20 shadow-2xs'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-purple-50/40 hover:border-purple-200 hover:text-purple-900'
                    }`}
                  >
                    <Layers className={`w-3.5 h-3.5 ${form.destination_type === 'WAREHOUSE_PARTIE' ? 'text-purple-600' : 'text-purple-600/80'}`} />
                    <span>PARTIE (Entrepôt)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, destination_type: 'WAREHOUSE_COMPOSANT', item_source: 'WAREHOUSE_COMPOSANT' });
                      setMouvementItems(mouvementItems.map((i) => ({ ...i, source: 'WAREHOUSE_COMPOSANT' })));
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.destination_type === 'WAREHOUSE_COMPOSANT'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-2xs'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-indigo-50/40 hover:border-indigo-200 hover:text-indigo-900'
                    }`}
                  >
                    <Puzzle className={`w-3.5 h-3.5 ${form.destination_type === 'WAREHOUSE_COMPOSANT' ? 'text-indigo-600' : 'text-indigo-600/80'}`} />
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
                              const uType = form.usage_type || 'responsable';
                              if (uType === 'technician') {
                                const tech = technicians.find((t) => t.nom === form.technicien) || technicians[0];
                                updatedForm.technicien = tech ? tech.nom : '';
                                updatedForm.id_technician = tech ? tech.id_technician : '';
                                updatedForm.demandeur = tech ? tech.nom : '';
                                updatedForm.operation = '';
                                updatedForm.id_operation = tech ? tech.id_technician : '';
                                updatedForm.id_zone = maintenanceZone.id_zone;
                                updatedForm.id_machine_registered = '';
                              } else if (uType === 'operation' || uType === 'operator') {
                                const op = operatorsList.find((o) => o.nom === form.operation) || operatorsList[0];
                                const opZone = op?.id_zone || zones[0]?.id_zone || '';
                                const respsForZone = getResponsablesForZone(opZone);
                                const bestResp = respsForZone[0] || null;
                                updatedForm.operation = op ? op.nom : '';
                                updatedForm.id_operation = op ? op.id_operation : '';
                                updatedForm.technicien = op ? op.nom : '';
                                updatedForm.id_technician = op ? op.id_operation : '';
                                updatedForm.demandeur = op ? op.nom : '';
                                updatedForm.id_zone = opZone;
                                updatedForm.responsable_validation = bestResp ? bestResp.nom : '';
                                updatedForm.id_responsable_validation = bestResp ? bestResp.id_operation : '';
                                updatedForm.id_machine_registered = '';
                              } else {
                                const defaultResp = currentUsageResponsable || responsablesList[0];
                                const allowed = getResponsableAllowedZones(defaultResp);
                                const targetZone = allowed.some((z) => z.id_zone === form.id_zone)
                                  ? form.id_zone
                                  : (allowed[0]?.id_zone || '');
                                const machs = machines.filter((m) => m.id_zone_default === targetZone);
                                updatedForm.operation = defaultResp ? defaultResp.nom : '';
                                updatedForm.id_operation = defaultResp ? defaultResp.id_operation : '';
                                updatedForm.technicien = defaultResp ? defaultResp.nom : '';
                                updatedForm.id_technician = defaultResp ? defaultResp.id_operation : '';
                                updatedForm.demandeur = defaultResp ? defaultResp.nom : '';
                                updatedForm.id_zone = targetZone;
                                updatedForm.id_machine_registered = machs.some((m) => m.id_machine_registered === form.id_machine_registered)
                                  ? form.id_machine_registered
                                  : '';
                              }
                            } else if (act.id === 'CORRECTIVE' || act.id === 'PREVENTIVE' || act.id === 'AMELIORATIVE') {
                              const sup = findSupervisorForZone(form.id_zone);
                              if (sup) {
                                updatedForm.operation = sup.nom;
                                updatedForm.id_operation = sup.id_operation;
                              }
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
                {form.action_id === 'USAGE' && (
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-700" />
                        <span>Type de Demandeur (Usage Personnel) :</span>
                      </label>
                      <span className="text-[9.5px] text-amber-800 font-semibold bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300">
                        {form.usage_type === 'technician'
                          ? 'Technicien de Maintenance'
                          : form.usage_type === 'operation' || form.usage_type === 'operator'
                            ? 'Opérateur de Production'
                            : 'Responsable (RESP)'}
                      </span>
                    </div>

                    {/* 3-Button Profile Selector */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* 1. Responsable (RESP) */}
                      <button
                        type="button"
                        onClick={() => {
                          const resp = currentUsageResponsable || responsablesList[0];
                          const allowed = getResponsableAllowedZones(resp);
                          const nextZone = allowed.some((z) => z.id_zone === form.id_zone)
                            ? form.id_zone
                            : (allowed[0]?.id_zone || '');
                          const machs = machines.filter((m) => m.id_zone_default === nextZone);
                          setForm((prev) => ({
                            ...prev,
                            usage_type: 'responsable',
                            operation: resp ? resp.nom : '',
                            id_operation: resp ? resp.id_operation : '',
                            technicien: resp ? resp.nom : '',
                            id_technician: resp ? resp.id_operation : '',
                            demandeur: resp ? resp.nom : '',
                            id_zone: nextZone,
                            id_machine_registered: machs.some((m) => m.id_machine_registered === prev.id_machine_registered)
                              ? prev.id_machine_registered
                              : '',
                          }));
                        }}
                        className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          form.usage_type === 'responsable' || form.usage_type === 'chef' || !form.usage_type
                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs font-bold ring-2 ring-amber-300'
                            : 'bg-white border-amber-200/80 text-amber-950 hover:bg-amber-100/60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Crown className={`w-3.5 h-3.5 shrink-0 ${form.usage_type === 'responsable' || form.usage_type === 'chef' || !form.usage_type ? 'text-white' : 'text-amber-700'}`} />
                          <span className="text-xs font-bold truncate">Responsable (RESP)</span>
                        </div>
                        <div className={`text-[9.5px] leading-tight truncate ${form.usage_type === 'responsable' || form.usage_type === 'chef' || !form.usage_type ? 'text-amber-100' : 'text-amber-800/80'}`}>
                          Périmètre & Zones Responsable
                        </div>
                      </button>

                      {/* 2. Technicien */}
                      <button
                        type="button"
                        onClick={() => {
                          const tech = technicians.find((t) => t.nom === form.technicien) || technicians[0];
                          setForm((prev) => ({
                            ...prev,
                            usage_type: 'technician',
                            technicien: tech ? tech.nom : '',
                            id_technician: tech ? tech.id_technician : '',
                            demandeur: tech ? tech.nom : '',
                            operation: '',
                            id_operation: tech ? tech.id_technician : '',
                            id_zone: maintenanceZone.id_zone,
                            id_machine_registered: '',
                          }));
                        }}
                        className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          form.usage_type === 'technician'
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs font-bold ring-2 ring-blue-300'
                            : 'bg-white border-blue-200/80 text-blue-950 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Wrench className={`w-3.5 h-3.5 shrink-0 ${form.usage_type === 'technician' ? 'text-white' : 'text-blue-700'}`} />
                          <span className="text-xs font-bold truncate">Technicien</span>
                        </div>
                        <div className={`text-[9.5px] leading-tight truncate ${form.usage_type === 'technician' ? 'text-blue-100' : 'text-blue-700/80'}`}>
                          Atelier Maintenance auto
                        </div>
                      </button>

                      {/* 3. Opérateur */}
                      <button
                        type="button"
                        onClick={() => {
                          const op = operatorsList.find((o) => o.nom === form.operation) || operatorsList[0];
                          const opZone = op?.id_zone || zones[0]?.id_zone || '';
                          const respsForZone = getResponsablesForZone(opZone);
                          const bestResp = respsForZone[0] || null;
                          const machs = machines.filter((m) => m.id_zone_default === opZone);
                          setForm((prev) => ({
                            ...prev,
                            usage_type: 'operation',
                            operation: op ? op.nom : '',
                            id_operation: op ? op.id_operation : '',
                            demandeur: op ? op.nom : '',
                            technicien: op ? op.nom : '',
                            id_technician: op ? op.id_operation : '',
                            id_zone: opZone,
                            responsable_validation: bestResp ? bestResp.nom : '',
                            id_responsable_validation: bestResp ? bestResp.id_operation : '',
                            id_machine_registered: machs.some((m) => m.id_machine_registered === prev.id_machine_registered)
                              ? prev.id_machine_registered
                              : '',
                          }));
                        }}
                        className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          form.usage_type === 'operation' || form.usage_type === 'operator'
                            ? 'bg-purple-600 text-white border-purple-700 shadow-xs font-bold ring-2 ring-purple-300'
                            : 'bg-white border-purple-200/80 text-purple-950 hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <UserCheck className={`w-3.5 h-3.5 shrink-0 ${form.usage_type === 'operation' || form.usage_type === 'operator' ? 'text-white' : 'text-purple-700'}`} />
                          <span className="text-xs font-bold truncate">Opérateur</span>
                        </div>
                        <div className={`text-[9.5px] leading-tight truncate ${form.usage_type === 'operation' || form.usage_type === 'operator' ? 'text-purple-100' : 'text-purple-700/80'}`}>
                          Zone liée & Responsable
                        </div>
                      </button>
                    </div>

                    {/* Dynamic Form Content based on selected profile */}

                    {/* MODE 1: RESPONSABLE */}
                    {(form.usage_type === 'responsable' || form.usage_type === 'chef' || !form.usage_type) && (
                      <div className="space-y-2.5 pt-1">
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* 1. Demandeur (Responsable) */}
                          <div>
                            <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                              <span>Demandeur (Responsable)</span>
                              <span className="text-[9px] text-amber-800 font-bold">*Requis</span>
                            </label>
                            <CustomSelect
                              value={form.operation}
                              onChange={(val) => {
                                const resp = responsablesList.find((r) => r.nom === val);
                                const allowed = getResponsableAllowedZones(resp);
                                const isZoneValid = allowed.some((z) => z.id_zone === form.id_zone);
                                const nextZone = isZoneValid ? form.id_zone : (allowed[0]?.id_zone || '');
                                const machs = machines.filter((m) => m.id_zone_default === nextZone);
                                setForm((prev) => ({
                                  ...prev,
                                  operation: val,
                                  id_operation: resp?.id_operation || '',
                                  technicien: val,
                                  id_technician: resp?.id_operation || '',
                                  demandeur: val,
                                  id_zone: nextZone,
                                  id_machine_registered: machs.some((m) => m.id_machine_registered === prev.id_machine_registered)
                                    ? prev.id_machine_registered
                                    : '',
                                }));
                              }}
                              options={responsablesList.map((r) => ({
                                value: r.nom,
                                label: r.nom,
                                badge: r.id_operation,
                                sublabel: r.template_label || r.template_id || r.type_profil || 'Responsable',
                              }))}
                              placeholder="-- Sélectionner le Responsable --"
                              onAddNew={onOpenAddChef}
                            />
                          </div>

                          {/* 2. Zone Rattachée (Filtrée par le Responsable) */}
                          <div>
                            <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                              <span>Zone Rattachée</span>
                              <span className="text-[9px] text-amber-800 font-bold">*Requis (Filtrée)</span>
                            </label>
                            <CustomSelect
                              value={form.id_zone}
                              onChange={(val) => {
                                const machs = machines.filter((m) => m.id_zone_default === val);
                                setForm((prev) => ({
                                  ...prev,
                                  id_zone: val,
                                  id_machine_registered: machs.some((m) => m.id_machine_registered === prev.id_machine_registered)
                                    ? prev.id_machine_registered
                                    : '',
                                }));
                              }}
                              options={usageAllowedZones.map((z) => ({
                                value: z.id_zone,
                                label: `${z.libelle} (${z.id_zone})`,
                              }))}
                              placeholder="-- Zone du Responsable --"
                              onAddNew={onOpenAddZone}
                            />
                          </div>
                        </div>

                        {/* Machine Concernée (Optionnel) */}
                        <div>
                          <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Machine Concernée (Optionnel)</span>
                            <span className="text-[9.5px] text-amber-700 font-medium">
                              {form.id_zone
                                ? 'Machines de la Zone sélectionnée uniquement (ou sans machine)'
                                : 'Sélectionner d’abord la Zone'}
                            </span>
                          </label>
                          <CustomSelect
                            value={form.id_machine_registered}
                            onChange={(val) => setForm({ ...form, id_machine_registered: val })}
                            options={[
                              { value: '', label: '-- Aucune machine / Usage ou dotation Zone générale --' },
                              ...usageAvailableMachines.map((m) => ({
                                value: m.id_machine_registered,
                                label: `[${m.id_machine_registered}] ${m.designation}`,
                                sublabel: m.technician ? `Tech: ${m.technician}` : '',
                              })),
                            ]}
                            placeholder="-- Machine (Optionnel) --"
                            onAddNew={onOpenAddMachine}
                          />
                        </div>
                      </div>
                    )}

                    {/* MODE 2: TECHNICIEN */}
                    {form.usage_type === 'technician' && (
                      <div className="space-y-2.5 pt-1">
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* 1. Technicien Demandeur */}
                          <div>
                            <label className="text-[10.5px] font-bold text-blue-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                              <span>Technicien Demandeur</span>
                              <span className="text-[9px] text-blue-700 font-bold">*Requis</span>
                            </label>
                            <CustomSelect
                              value={form.technicien}
                              onChange={(val) => {
                                const tech = technicians.find((t) => t.nom === val);
                                setForm((prev) => ({
                                  ...prev,
                                  technicien: val,
                                  id_technician: tech?.id_technician || '',
                                  demandeur: val,
                                  operation: '',
                                  id_operation: tech?.id_technician || '',
                                  id_zone: maintenanceZone.id_zone,
                                  id_machine_registered: '',
                                }));
                              }}
                              options={technicians.map((t) => ({
                                value: t.nom,
                                label: t.nom,
                                badge: t.id_technician,
                                sublabel: t.specialite || 'Maintenance',
                              }))}
                              placeholder="-- Sélectionner le Technicien --"
                              onAddNew={onOpenAddTech}
                            />
                          </div>

                          {/* 2. Zone Automatique: Atelier Maintenance */}
                          <div>
                            <label className="text-[10.5px] font-bold text-blue-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                              <span>Zone d'Affectation</span>
                              <span className="text-[9px] text-blue-700 font-bold font-mono">Automatique</span>
                            </label>
                            <div className="h-8 px-2.5 rounded-xl border border-blue-200 bg-blue-50/80 flex items-center justify-between text-xs font-semibold text-blue-900">
                              <div className="flex items-center gap-1.5 truncate">
                                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="truncate">{maintenanceZone.libelle}</span>
                              </div>
                              <span className="text-[10px] font-mono bg-blue-200/80 text-blue-900 px-1.5 py-0.5 rounded font-bold shrink-0">
                                {maintenanceZone.id_zone}
                              </span>
                            </div>
                            <p className="text-[9.5px] text-blue-700/80 mt-1">
                              Attribution automatique à l'Atelier Central Maintenance pour l'usage personnel du technicien.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MODE 3: OPÉRATEUR */}
                    {(form.usage_type === 'operation' || form.usage_type === 'operator') && (
                      <div className="space-y-2.5 pt-1">
                        <div className="grid grid-cols-3 gap-2.5">
                          {/* 1. Opérateur Demandeur (Mandatory) */}
                          <div>
                            <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                              <span>Opérateur Demandeur</span>
                              <span className="text-[9px] text-purple-800 font-bold">*Requis</span>
                            </label>
                            <CustomSelect
                              value={form.operation}
                              onChange={(val) => {
                                const op = operatorsList.find((o) => o.nom === val);
                                const opZone = op?.id_zone || zones[0]?.id_zone || '';
                                const respsForZone = getResponsablesForZone(opZone);
                                const bestResp = respsForZone[0] || null;
                                const machs = machines.filter((m) => m.id_zone_default === opZone);
                                setForm((prev) => ({
                                  ...prev,
                                  operation: val,
                                  id_operation: op?.id_operation || '',
                                  technicien: val,
                                  id_technician: op?.id_operation || '',
                                  demandeur: val,
                                  id_zone: opZone,
                                  responsable_validation: bestResp ? bestResp.nom : '',
                                  id_responsable_validation: bestResp ? bestResp.id_operation : '',
                                  id_machine_registered: machs.some((m) => m.id_machine_registered === prev.id_machine_registered)
                                    ? prev.id_machine_registered
                                    : '',
                                }));
                              }}
                              options={operatorsList.map((op) => ({
                                value: op.nom,
                                label: op.nom,
                                badge: op.id_operation,
                                sublabel: op.id_zone ? `Zone: ${op.id_zone}` : 'Opérateur',
                              }))}
                              placeholder="-- Sélectionner l'Opérateur --"
                              onAddNew={onOpenAddOperator}
                            />
                          </div>

                          {/* 2. Zone Déduite Automatiquement de l'Opérateur */}
                          <div>
                            <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                              <span>Zone (Liée à l'Opérateur)</span>
                              <span className="text-[9px] text-purple-800 font-bold font-mono">Auto-Déduite</span>
                            </label>
                            <div className="h-8 px-2.5 rounded-xl border border-purple-200 bg-purple-50/80 flex items-center justify-between text-xs font-semibold text-purple-900">
                              <div className="flex items-center gap-1.5 truncate">
                                <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span className="truncate">
                                  {zones.find((z) => z.id_zone === form.id_zone)?.libelle || form.id_zone || 'Zone Opérateur'}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono bg-purple-200/80 text-purple-900 px-1.5 py-0.5 rounded font-bold shrink-0">
                                {form.id_zone || 'ZONE'}
                              </span>
                            </div>
                            <p className="text-[9.5px] text-purple-700/80 mt-1">
                              Zone d'affectation rattachée à la fiche de l'opérateur.
                            </p>
                          </div>

                          {/* 3. Responsable Validateur (Filtré intelligemment par la Zone de l'opérateur) */}
                          <div>
                            <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                              <span>Responsable Référent</span>
                              <span className="text-[9px] text-purple-800 font-semibold font-mono">Filtré Zone</span>
                            </label>
                            <CustomSelect
                              value={form.responsable_validation || form.technicien}
                              onChange={(val) => {
                                const r = responsablesList.find((resp) => resp.nom === val);
                                setForm((prev) => ({
                                  ...prev,
                                  responsable_validation: val,
                                  id_responsable_validation: r?.id_operation || '',
                                }));
                              }}
                              options={operatorFilteredResponsables.map((r) => ({
                                value: r.nom,
                                label: r.nom,
                                badge: r.id_operation,
                                sublabel: r.template_label || r.type_profil || 'Responsable Zone',
                              }))}
                              placeholder="-- Responsable de la Zone --"
                              onAddNew={onOpenAddChef}
                            />
                          </div>
                        </div>

                        {/* Machine Concernée (Optionnel, filtrée par la Zone de l'opérateur) */}
                        <div>
                          <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Machine Concernée (Optionnel)</span>
                            <span className="text-[9.5px] text-purple-700 font-medium">
                              {form.id_zone
                                ? `Machines de la Zone ${form.id_zone} (ou sans machine)`
                                : 'Sélectionner d’abord l’Opérateur'}
                            </span>
                          </label>
                          <CustomSelect
                            value={form.id_machine_registered}
                            onChange={(val) => setForm({ ...form, id_machine_registered: val })}
                            options={[
                              { value: '', label: '-- Aucune machine / Usage ou dotation Zone générale --' },
                              ...usageAvailableMachines.map((m) => ({
                                value: m.id_machine_registered,
                                label: `[${m.id_machine_registered}] ${m.designation}`,
                                sublabel: m.technician ? `Tech: ${m.technician}` : '',
                              })),
                            ]}
                            placeholder="-- Machine (Optionnel) --"
                            onAddNew={onOpenAddMachine}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-fields for CORRECTIVE action */}
                {form.action_id === 'CORRECTIVE' && (
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-blue-700" />
                        <span>Paramètres de l'Intervention Corrective (Dépannage Curatif) :</span>
                      </label>
                      <span className="text-[9.5px] text-blue-800 font-semibold bg-blue-100/90 px-2 py-0.5 rounded border border-blue-300 flex items-center gap-1">
                        <Wrench className="w-2.5 h-2.5 text-blue-600" />
                        Dépannage & Curatif
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Zone & Machine */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-blue-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Zone de l'Intervention</span>
                            <span className="text-[9px] text-blue-700 font-bold">*Requis</span>
                          </label>
                          <CustomSelect
                            value={form.id_zone}
                            onChange={(val) => {
                              const machs = machines.filter((m) => m.id_zone_default === val);
                              const sup = findSupervisorForZone(val);
                              setForm((prev) => ({
                                ...prev,
                                id_zone: val,
                                id_machine_registered: machs.some((m) => m.id_machine_registered === prev.id_machine_registered)
                                  ? prev.id_machine_registered
                                  : (machs[0]?.id_machine_registered || ''),
                                operation: sup ? sup.nom : prev.operation,
                                id_operation: sup ? sup.id_operation : prev.id_operation,
                              }));
                            }}
                            options={zones.map((z) => ({
                              value: z.id_zone,
                              label: `${z.libelle} (${z.id_zone})`,
                            }))}
                            placeholder="-- Zone --"
                            onAddNew={onOpenAddZone}
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-blue-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Machine Concernée</span>
                            <span className="text-[9px] text-blue-700 font-mono">Filtrée par Zone</span>
                          </label>
                          <CustomSelect
                            value={form.id_machine_registered}
                            onChange={(val) => {
                              const m = machines.find((mach) => mach.id_machine_registered === val);
                              const targetZone = m?.id_zone_default || form.id_zone;
                              const sup = findSupervisorForZone(targetZone);
                              setForm((prev) => ({
                                ...prev,
                                id_machine_registered: val,
                                id_zone: targetZone,
                                technicien: m?.technician || prev.technicien,
                                operation: sup ? sup.nom : prev.operation,
                                id_operation: sup ? sup.id_operation : prev.id_operation,
                              }));
                            }}
                            options={[
                              { value: '', label: '-- Atelier / Sans Machine Spécifique --' },
                              ...availableMachines.map((m) => ({
                                value: m.id_machine_registered,
                                label: `[${m.id_machine_registered}] ${m.designation}`,
                                sublabel: m.technician ? `Tech assigné: ${m.technician}` : '',
                              })),
                            ]}
                            placeholder="-- Machine --"
                            onAddNew={onOpenAddMachine}
                          />
                        </div>
                      </div>

                      {/* Technicien & Superviseur */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-blue-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Technicien Intervenant</span>
                            <span className="text-[9px] font-semibold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">
                              Tous techniciens (Usine)
                            </span>
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
                              sublabel: t.specialite ? `${t.id_zone || 'Usine'} • ${t.specialite}` : t.id_zone,
                            }))}
                            placeholder="-- Technicien --"
                            onAddNew={onOpenAddTech}
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-blue-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Responsable (RESP)</span>
                            <span className="text-[9px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5 text-blue-600" />
                              Auto-déduit (Zone)
                            </span>
                          </label>
                          <CustomSelect
                            value={form.operation}
                            onChange={(val) => {
                              const s = responsablesList.find((sup) => sup.nom === val);
                              setForm({
                                ...form,
                                operation: val,
                                id_operation: s?.id_operation || '',
                              });
                            }}
                            options={[
                              { value: '', label: '-- Aucun Responsable --' },
                              ...responsablesList.map((s) => ({
                                value: s.nom,
                                label: s.nom,
                                badge: s.id_operation,
                                sublabel: s.template_label || s.template_id || s.type_profil,
                              })),
                            ]}
                            placeholder="-- Responsable (RESP) --"
                            onAddNew={onOpenAddChef}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-fields for PREVENTIVE action */}
                {form.action_id === 'PREVENTIVE' && (
                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Paramètres de la Maintenance Préventive (Planifiée) :</span>
                      </label>
                      <span className="text-[9.5px] text-emerald-800 font-semibold bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                        Gamme & Entretien Planifié
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Zone & Machine */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-emerald-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Zone de l'Intervention</span>
                            <span className="text-[9px] text-emerald-700 font-bold">*Requis</span>
                          </label>
                          <CustomSelect
                            value={form.id_zone}
                            onChange={(val) => {
                              const machs = machines.filter((m) => m.id_zone_default === val);
                              const sup = findSupervisorForZone(val);
                              setForm((prev) => ({
                                ...prev,
                                id_zone: val,
                                id_machine_registered: machs.some((m) => m.id_machine_registered === prev.id_machine_registered)
                                  ? prev.id_machine_registered
                                  : (machs[0]?.id_machine_registered || ''),
                                operation: sup ? sup.nom : prev.operation,
                                id_operation: sup ? sup.id_operation : prev.id_operation,
                              }));
                            }}
                            options={zones.map((z) => ({
                              value: z.id_zone,
                              label: `${z.libelle} (${z.id_zone})`,
                            }))}
                            placeholder="-- Zone --"
                            onAddNew={onOpenAddZone}
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-emerald-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Machine Concernée</span>
                            <span className="text-[9px] text-emerald-700 font-mono">Filtrée par Zone</span>
                          </label>
                          <CustomSelect
                            value={form.id_machine_registered}
                            onChange={(val) => {
                              const m = machines.find((mach) => mach.id_machine_registered === val);
                              const targetZone = m?.id_zone_default || form.id_zone;
                              const sup = findSupervisorForZone(targetZone);
                              setForm((prev) => ({
                                ...prev,
                                id_machine_registered: val,
                                id_zone: targetZone,
                                technicien: m?.technician || prev.technicien,
                                operation: sup ? sup.nom : prev.operation,
                                id_operation: sup ? sup.id_operation : prev.id_operation,
                              }));
                            }}
                            options={[
                              { value: '', label: '-- Atelier / Sans Machine Spécifique --' },
                              ...availableMachines.map((m) => ({
                                value: m.id_machine_registered,
                                label: `[${m.id_machine_registered}] ${m.designation}`,
                                sublabel: m.technician ? `Tech assigné: ${m.technician}` : '',
                              })),
                            ]}
                            placeholder="-- Machine --"
                            onAddNew={onOpenAddMachine}
                          />
                        </div>
                      </div>

                      {/* Technicien & Superviseur */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-emerald-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Technicien Intervenant</span>
                            <span className="text-[9px] text-emerald-700 font-bold">*Requis</span>
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
                              sublabel: t.specialite ? `${t.id_zone || 'Usine'} • ${t.specialite}` : t.id_zone,
                            }))}
                            placeholder="-- Technicien --"
                            onAddNew={onOpenAddTech}
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-emerald-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Responsable (RESP)</span>
                            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5 text-emerald-600" />
                              Auto-déduit (Zone)
                            </span>
                          </label>
                          <CustomSelect
                            value={form.operation}
                            onChange={(val) => {
                              const s = responsablesList.find((sup) => sup.nom === val);
                              setForm({
                                ...form,
                                operation: val,
                                id_operation: s?.id_operation || '',
                              });
                            }}
                            options={[
                              { value: '', label: '-- Aucun Responsable --' },
                              ...responsablesList.map((s) => ({
                                value: s.nom,
                                label: s.nom,
                                badge: s.id_operation,
                                sublabel: s.template_label || s.template_id || s.type_profil,
                              })),
                            ]}
                            placeholder="-- Responsable (RESP) --"
                            onAddNew={onOpenAddChef}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-fields for AMELIORATIVE action */}
                {form.action_id === 'AMELIORATIVE' && (
                  <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                        <span>Paramètres d'Amélioration & Travaux Neufs :</span>
                      </label>
                      <span className="text-[9.5px] text-purple-800 font-semibold bg-purple-100/90 px-2 py-0.5 rounded border border-purple-300 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                        Projet & Travaux Neufs
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Zone & Machine */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Zone d'Implantation</span>
                            <span className="text-[9px] text-purple-700 font-bold">*Requis</span>
                          </label>
                          <CustomSelect
                            value={form.id_zone}
                            onChange={(val) => {
                              const machs = machines.filter((m) => m.id_zone_default === val);
                              const sup = findSupervisorForZone(val);
                              setForm((prev) => ({
                                ...prev,
                                id_zone: val,
                                id_machine_registered: machs.some((m) => m.id_machine_registered === prev.id_machine_registered)
                                  ? prev.id_machine_registered
                                  : (machs[0]?.id_machine_registered || ''),
                                operation: sup ? sup.nom : prev.operation,
                                id_operation: sup ? sup.id_operation : prev.id_operation,
                              }));
                            }}
                            options={zones.map((z) => ({
                              value: z.id_zone,
                              label: `${z.libelle} (${z.id_zone})`,
                            }))}
                            placeholder="-- Zone --"
                            onAddNew={onOpenAddZone}
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Machine ou Installation</span>
                            <span className="text-[9px] text-purple-700 font-mono">Filtrée par Zone</span>
                          </label>
                          <CustomSelect
                            value={form.id_machine_registered}
                            onChange={(val) => {
                              const m = machines.find((mach) => mach.id_machine_registered === val);
                              const targetZone = m?.id_zone_default || form.id_zone;
                              const sup = findSupervisorForZone(targetZone);
                              setForm((prev) => ({
                                ...prev,
                                id_machine_registered: val,
                                id_zone: targetZone,
                                technicien: m?.technician || prev.technicien,
                                operation: sup ? sup.nom : prev.operation,
                                id_operation: sup ? sup.id_operation : prev.id_operation,
                              }));
                            }}
                            options={[
                              { value: '', label: '-- Installation Générale / Sans Machine --' },
                              ...availableMachines.map((m) => ({
                                value: m.id_machine_registered,
                                label: `[${m.id_machine_registered}] ${m.designation}`,
                                sublabel: m.technician ? `Tech assigné: ${m.technician}` : '',
                              })),
                            ]}
                            placeholder="-- Machine --"
                            onAddNew={onOpenAddMachine}
                          />
                        </div>
                      </div>

                      {/* Technicien & Superviseur */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Technicien / Chargé de Travaux</span>
                            <span className="text-[9px] text-purple-700 font-bold">*Requis</span>
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
                              sublabel: t.specialite ? `${t.id_zone || 'Usine'} • ${t.specialite}` : t.id_zone,
                            }))}
                            placeholder="-- Technicien --"
                            onAddNew={onOpenAddTech}
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Responsable (RESP)</span>
                            <span className="text-[9px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5 text-purple-600" />
                              Auto-déduit (Zone)
                            </span>
                          </label>
                          <CustomSelect
                            value={form.operation}
                            onChange={(val) => {
                              const s = responsablesList.find((sup) => sup.nom === val);
                              setForm({
                                ...form,
                                operation: val,
                                id_operation: s?.id_operation || '',
                              });
                            }}
                            options={[
                              { value: '', label: '-- Aucun Responsable --' },
                              ...responsablesList.map((s) => ({
                                value: s.nom,
                                label: s.nom,
                                badge: s.id_operation,
                                sublabel: s.template_label || s.template_id || s.type_profil,
                              })),
                            ]}
                            placeholder="-- Responsable (RESP) --"
                            onAddNew={onOpenAddChef}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-fields for INVENTAIRE action */}
                {form.action_id === 'INVENTAIRE' && (
                  <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5 text-rose-700" />
                        <span>Régularisation & Déstockage pour Écart d'Inventaire :</span>
                      </label>
                      <span className="text-[9.5px] text-rose-800 font-semibold bg-rose-100/90 px-2 py-0.5 rounded border border-rose-300 flex items-center gap-1">
                        <ClipboardList className="w-2.5 h-2.5 text-rose-600" />
                        Ajustement Écart & Rebut
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Zone & Motif */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-rose-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Zone / Magasin</span>
                            <span className="text-[9px] text-rose-700 font-bold">*Requis</span>
                          </label>
                          <CustomSelect
                            value={form.id_zone}
                            onChange={(val) => {
                              const sup = findSupervisorForZone(val);
                              setForm((prev) => ({
                                ...prev,
                                id_zone: val,
                                operation: sup ? sup.nom : prev.operation,
                                id_operation: sup ? sup.id_operation : prev.id_operation,
                              }));
                            }}
                            options={zones.map((z) => ({
                              value: z.id_zone,
                              label: `${z.libelle} (${z.id_zone})`,
                            }))}
                            placeholder="-- Zone --"
                            onAddNew={onOpenAddZone}
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-rose-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Motif de l'Écart / Rebut</span>
                            <span className="text-[9px] text-rose-700 font-bold">*Requis</span>
                          </label>
                          <select
                            value={form.commentaire || 'Écart d’inventaire physique'}
                            onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-rose-200 bg-white text-xs font-semibold text-slate-800"
                          >
                            <option value="Écart d’inventaire physique">Écart d’inventaire physique</option>
                            <option value="Casse / Détérioration en atelier">Casse / Détérioration en atelier</option>
                            <option value="Rebut & Obsolescence">Rebut & Obsolescence</option>
                            <option value="Péremption ou Déclassement">Péremption ou Déclassement</option>
                          </select>
                        </div>
                      </div>

                      {/* Technicien & Note */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-rose-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Contrôleur / Technicien</span>
                            <span className="text-[9px] text-rose-700 font-bold">*Requis</span>
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
                              sublabel: t.specialite ? `${t.id_zone || 'Usine'} • ${t.specialite}` : t.id_zone,
                            }))}
                            placeholder="-- Technicien --"
                            onAddNew={onOpenAddTech}
                          />
                        </div>

                        <div className="flex items-center text-[10.5px] text-rose-800 font-medium bg-rose-100/70 px-3 py-1.5 rounded-xl border border-rose-200/80">
                          ℹ️ Mode Inventaire : La sortie sera comptabilisée comme régularisation immédiate du stock physique.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CASE B: ENTRÉE INTERNE */}
            {isEntreeInterne && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                {/* 6 Action Cards for Entrée Interne */}
                <div>
                  <label className="text-[10.5px] font-bold text-cyan-950 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-cyan-700" />
                      <span>Motif de l'Entrée Interne (Action) :</span>
                    </span>
                    <span className="text-[9.5px] font-mono text-cyan-600 font-normal">6 modes de réintégration</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
                    {[
                      {
                        id: 'RETOUR',
                        label: 'Retour Atelier',
                        icon: RotateCcw,
                        desc: 'Non utilisé / Restant intervention',
                        color: 'border-cyan-400 bg-cyan-50 text-cyan-950',
                        activeRing: 'ring-2 ring-cyan-500/20 shadow-2xs',
                      },
                      {
                        id: 'FABRICATION_INTERNE',
                        label: 'Fabrication / Tournage',
                        icon: Hammer,
                        desc: 'Usinage & confection interne',
                        color: 'border-indigo-400 bg-indigo-50 text-indigo-950',
                        activeRing: 'ring-2 ring-indigo-500/20 shadow-2xs',
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
                        id: 'REPARATION_INTERNE',
                        label: 'Réparation Interne',
                        icon: RefreshCw,
                        desc: 'Rénovation atelier terminée',
                        color: 'border-blue-400 bg-blue-50 text-blue-950',
                        activeRing: 'ring-2 ring-blue-500/20 shadow-2xs',
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

                {/* 1. RETOUR ATELIER CARD */}
                {form.action_id === 'RETOUR' && (
                  <div className="p-3 bg-cyan-50/70 rounded-xl border border-cyan-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-cyan-950 uppercase tracking-wider flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-cyan-700" />
                        <span>Paramètres de Retour Atelier (Pièce Non Utilisée / Surplus Chantier) :</span>
                      </label>
                      <span className="text-[9.5px] text-cyan-800 font-semibold bg-cyan-100/90 px-2 py-0.5 rounded border border-cyan-300 flex items-center gap-1">
                        <RotateCcw className="w-2.5 h-2.5 text-cyan-600" />
                        Restant Intervention & Réintégration
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-cyan-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Machine Concernée (Origine)</span>
                            <span className="text-[9px] text-cyan-700 font-mono">Optionnel</span>
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
                              { value: '', label: '-- Non Spécifiée / Chantier Général --' },
                              ...machines.map((m) => ({
                                value: m.id_machine_registered,
                                label: `[${m.id_machine_registered}] ${m.designation}`,
                              })),
                            ]}
                            placeholder="-- Machine --"
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-cyan-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Technicien Rapporteur</span>
                            <span className="text-[9px] text-cyan-700 font-bold">*Requis</span>
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
                              sublabel: t.specialite ? `${t.id_zone || 'Usine'} • ${t.specialite}` : t.id_zone,
                            }))}
                            placeholder="-- Technicien --"
                            onAddNew={onOpenAddTech}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-cyan-950 uppercase tracking-wider block mb-1">
                            Emplacement de Rangement / Casier
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: R1-B04 ou Magasin Central"
                            value={form.emplacement_reception}
                            onChange={(e) => setForm({ ...form, emplacement_reception: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-cyan-200 bg-white text-xs font-mono text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-cyan-950 uppercase tracking-wider block mb-1">
                            État du Matériel Rapatrié
                          </label>
                          <select
                            value={form.entrepot_etat || 'Fonctionnel'}
                            onChange={(e) => setForm({ ...form, entrepot_etat: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-cyan-200 bg-white text-xs font-semibold text-slate-800"
                          >
                            <option value="Fonctionnel">Fonctionnel (Prêt à l'emploi)</option>
                            <option value="Neuf">Neuf (Emballage intact)</option>
                            <option value="En révision">En révision / Contrôle</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. FABRICATION INTERNE CARD */}
                {form.action_id === 'FABRICATION_INTERNE' && (
                  <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Hammer className="w-3.5 h-3.5 text-indigo-700" />
                        <span>Paramètres de Fabrication & Tournage / Usinage Interne :</span>
                      </label>
                      <span className="text-[9.5px] text-indigo-800 font-semibold bg-indigo-100/90 px-2 py-0.5 rounded border border-indigo-300 flex items-center gap-1">
                        <Hammer className="w-2.5 h-2.5 text-indigo-600" />
                        Usinage & Confection Atelier
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-indigo-950 uppercase tracking-wider block mb-1">
                            Temps de Main d'Œuvre / Usinage (Heures)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            placeholder="Ex: 2.5 h"
                            value={form.temps_fabrication || ''}
                            onChange={(e) => setForm({ ...form, temps_fabrication: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-indigo-200 bg-white text-xs font-mono text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-indigo-950 uppercase tracking-wider block mb-1">
                            Matière Première ou Ébauche Utilisée
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Barre Acier 40mm, Tôle Inox 3mm..."
                            value={form.matiere_premiere || ''}
                            onChange={(e) => setForm({ ...form, matiere_premiere: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-indigo-200 bg-white text-xs text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-indigo-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Technicien / Usineur</span>
                            <span className="text-[9px] text-indigo-700 font-bold">*Requis</span>
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
                              sublabel: t.specialite ? `${t.id_zone || 'Usine'} • ${t.specialite}` : t.id_zone,
                            }))}
                            placeholder="-- Technicien --"
                            onAddNew={onOpenAddTech}
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-indigo-950 uppercase tracking-wider block mb-1">
                            Emplacement de Stockage
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: R2-A01 ou Rayonnage PDR"
                            value={form.emplacement_reception}
                            onChange={(e) => setForm({ ...form, emplacement_reception: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-indigo-200 bg-white text-xs font-mono text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. DÉMONTAGE MACHINE CARD */}
                {form.action_id === 'DEMONTAGE' && (
                  <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-purple-700" />
                        <span>Paramètres de Démontage & Récupération sur Machine :</span>
                      </label>
                      <span className="text-[9.5px] text-purple-800 font-semibold bg-purple-100/90 px-2 py-0.5 rounded border border-purple-300 flex items-center gap-1">
                        <Wrench className="w-2.5 h-2.5 text-purple-600" />
                        Organe Déposé & Revalorisé
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Machine d'Origine (Démontage)</span>
                            <span className="text-[9px] text-purple-700 font-bold">*Requis</span>
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
                              { value: '', label: '-- Sélectionner la Machine Déposée --' },
                              ...machines.map((m) => ({
                                value: m.id_machine_registered,
                                label: `[${m.id_machine_registered}] ${m.designation}`,
                              })),
                            ]}
                            placeholder="-- Machine --"
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Technicien Démonteur</span>
                            <span className="text-[9px] text-purple-700 font-bold">*Requis</span>
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
                              sublabel: t.specialite ? `${t.id_zone || 'Usine'} • ${t.specialite}` : t.id_zone,
                            }))}
                            placeholder="-- Technicien --"
                            onAddNew={onOpenAddTech}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1">
                            État de la Pièce Déposée
                          </label>
                          <select
                            value={form.entrepot_etat || 'En révision'}
                            onChange={(e) => setForm({ ...form, entrepot_etat: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-purple-200 bg-white text-xs font-semibold text-slate-800"
                          >
                            <option value="En révision">En révision / À réviser</option>
                            <option value="Fonctionnel">Fonctionnel (Bon état)</option>
                            <option value="En attente">En attente contrôle / Test</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1">
                            Emplacement de Stockage / Dépôt
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Zone Dépôt ou R3-C02"
                            value={form.emplacement_reception}
                            onChange={(e) => setForm({ ...form, emplacement_reception: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-purple-200 bg-white text-xs font-mono text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. RÉPARATION INTERNE CARD */}
                {form.action_id === 'REPARATION_INTERNE' && (
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-blue-700" />
                        <span>Paramètres de Réparation & Reconditionnement en Atelier :</span>
                      </label>
                      <span className="text-[9.5px] text-blue-800 font-semibold bg-blue-100/90 px-2 py-0.5 rounded border border-blue-300 flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5 text-blue-600" />
                        Rénovation & Remise en État
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-blue-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Technicien Rénovateur</span>
                            <span className="text-[9px] text-blue-700 font-bold">*Requis</span>
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
                              sublabel: t.specialite ? `${t.id_zone || 'Usine'} • ${t.specialite}` : t.id_zone,
                            }))}
                            placeholder="-- Technicien --"
                            onAddNew={onOpenAddTech}
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-blue-950 uppercase tracking-wider block mb-1">
                            Organe ou Sous-Ensemble Rénové
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Réducteur, Pompe hydraulique, Vérin..."
                            value={form.commentaire || ''}
                            onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-blue-200 bg-white text-xs text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-blue-950 uppercase tracking-wider block mb-1">
                            État Après Réparation
                          </label>
                          <select
                            value={form.entrepot_etat || 'Fonctionnel'}
                            onChange={(e) => setForm({ ...form, entrepot_etat: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-blue-200 bg-white text-xs font-semibold text-slate-800"
                          >
                            <option value="Fonctionnel">Reconditionné (Fonctionnel / Testé OK)</option>
                            <option value="En attente">En attente banc de test</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-blue-950 uppercase tracking-wider block mb-1">
                            Emplacement de Réintégration
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: R1-A05 ou Stock Pièces Rénovées"
                            value={form.emplacement_reception}
                            onChange={(e) => setForm({ ...form, emplacement_reception: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-blue-200 bg-white text-xs font-mono text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. AJUSTEMENT + (INVENTAIRE) CARD */}
                {form.action_id === 'INVENTAIRE' && (
                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Régularisation & Ajustement Positif de Stock (Surplus d'Inventaire) :</span>
                      </label>
                      <span className="text-[9.5px] text-emerald-800 font-semibold bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                        <ClipboardList className="w-2.5 h-2.5 text-emerald-600" />
                        Surplus & Réajustement +
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-emerald-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Motif du Surplus / Constat</span>
                            <span className="text-[9px] text-emerald-700 font-bold">*Requis</span>
                          </label>
                          <select
                            value={form.commentaire || 'Surplus constaté en inventaire physique'}
                            onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-emerald-200 bg-white text-xs font-semibold text-slate-800"
                          >
                            <option value="Surplus constaté en inventaire physique">Surplus constaté en inventaire physique</option>
                            <option value="Annulation sortie non consommée">Annulation sortie non consommée</option>
                            <option value="Correction écart de saisie antérieure">Correction écart de saisie antérieure</option>
                            <option value="Réintégration lot retrouvé">Réintégration lot retrouvé</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-emerald-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Contrôleur / Agent d'Inventaire</span>
                            <span className="text-[9px] text-emerald-700 font-bold">*Requis</span>
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
                              sublabel: t.specialite ? `${t.id_zone || 'Usine'} • ${t.specialite}` : t.id_zone,
                            }))}
                            placeholder="-- Contrôleur --"
                            onAddNew={onOpenAddTech}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-emerald-950 uppercase tracking-wider block mb-1">
                            Emplacement Confirmé sur Rayon
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: R1-B04"
                            value={form.emplacement_reception}
                            onChange={(e) => setForm({ ...form, emplacement_reception: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-emerald-200 bg-white text-xs font-mono text-slate-800"
                          />
                        </div>

                        <div className="flex items-center text-[10.5px] text-emerald-800 font-medium bg-emerald-100/70 px-3 py-1.5 rounded-xl border border-emerald-200/80">
                          ℹ️ Mode Ajustement (+) : La quantité sera immédiatement créditée au stock physique sans fournisseur externe.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. TRANSFERT INTERNE CARD */}
                {form.action_id === 'TRANSFERT' && (
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-amber-700" />
                        <span>Paramètres de Transfert Inter-Magasins ou Ateliers :</span>
                      </label>
                      <span className="text-[9.5px] text-amber-800 font-semibold bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                        <CornerDownRight className="w-2.5 h-2.5 text-amber-600" />
                        Mouvement Interne & Réaffectation
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Zone ou Magasin de Provenance</span>
                            <span className="text-[9px] text-amber-700 font-bold">*Requis</span>
                          </label>
                          <CustomSelect
                            value={form.id_zone}
                            onChange={(val) => setForm({ ...form, id_zone: val })}
                            options={zones.map((z) => ({
                              value: z.id_zone,
                              label: `${z.libelle} (${z.id_zone})`,
                            }))}
                            placeholder="-- Zone Source --"
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                            <span>Agent Responsable du Transfert</span>
                            <span className="text-[9px] text-amber-700 font-bold">*Requis</span>
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
                              sublabel: t.specialite ? `${t.id_zone || 'Usine'} • ${t.specialite}` : t.id_zone,
                            }))}
                            placeholder="-- Agent Transfert --"
                            onAddNew={onOpenAddTech}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block mb-1">
                            Emplacement de Destination / Arrivée
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: R4-B02 ou Magasin B"
                            value={form.emplacement_reception}
                            onChange={(e) => setForm({ ...form, emplacement_reception: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-amber-200 bg-white text-xs font-mono text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block mb-1">
                            État à Réception
                          </label>
                          <select
                            value={form.entrepot_etat || 'Fonctionnel'}
                            onChange={(e) => setForm({ ...form, entrepot_etat: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-xl border border-amber-200 bg-white text-xs font-semibold text-slate-800"
                          >
                            <option value="Fonctionnel">Fonctionnel</option>
                            <option value="En attente">En attente pointage</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CASE C: BON DE SORTIE (RÉPARATION EXTERNE / ÉTALONNAGE / GARANTIE) */}
            {isBonSortie && (
              <div className="space-y-3 pt-2 border-t border-slate-100 bg-purple-50/40 p-3 rounded-xl border border-purple-200">
                {/* 3 Action Cards for Bon de Sortie */}
                <div>
                  <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-purple-700" />
                      <span>Motif & Nature de la Sortie Externe (Action) :</span>
                    </span>
                    <span className="text-[10px] text-purple-700 font-semibold italic">
                      3 Actions Disponibles
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      {
                        id: 'REPARATION_EXTERNE',
                        label: 'Réparation Externe',
                        desc: 'Moteur, bobinage, usinage...',
                        icon: Truck,
                        color: 'bg-purple-50 border-purple-400 text-purple-950 ring-2 ring-purple-500/20 shadow-2xs font-bold',
                      },
                      {
                        id: 'ETALONNAGE_CONTROLE',
                        label: 'Étalonnage / Contrôle',
                        desc: 'Mesure, métrologie, capteurs...',
                        icon: Gauge,
                        color: 'bg-blue-50 border-blue-400 text-blue-950 ring-2 ring-blue-500/20 shadow-2xs font-bold',
                      },
                      {
                        id: 'GARANTIE_ECHANGE',
                        label: 'Garantie / Échange',
                        desc: 'Retour constructeur, garantie...',
                        icon: ShieldCheck,
                        color: 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs font-bold',
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
                              ? act.color
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <IconComp className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                            <span className="text-xs font-bold truncate">{act.label}</span>
                          </div>
                          <div className="text-[9.5px] text-slate-500 leading-tight truncate">{act.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Prestataire Externe (Obligatoire) */}
                <div>
                  <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1">
                    Atelier / Prestataire Extérieur (Bobineur / Usineur / Labo) <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <CustomSelect
                    value={form.prestataire_externe}
                    onChange={(val) => setForm({ ...form, prestataire_externe: val })}
                    options={supplierOptions.map((s) => ({ value: s, label: s }))}
                    placeholder="-- Sélectionner Prestataire Externe --"
                    onAddNew={(val) => setForm({ ...form, prestataire_externe: val })}
                  />
                </div>

                {/* Machine d'Origine (Équipement Source) & Date de Retour Prévue */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1">
                      Machine d'Origine (Équipement Source)
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
                        { value: '', label: '-- Stock Équipement / Non affecté --' },
                        ...machines.map((m) => ({
                          value: m.id_machine_registered,
                          label: `[${m.id_machine_registered}] ${m.designation}`,
                        })),
                      ]}
                      placeholder="-- Machine d'origine --"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1">
                      Date de Retour Estimée <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.date_retour_prevue}
                      onChange={(e) => setForm({ ...form, date_retour_prevue: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-xl border border-purple-200 bg-white text-xs font-mono text-slate-800"
                      required
                    />
                  </div>
                </div>

                {/* Technicien Émetteur (Responsable de la Sortie) */}
                <div>
                  <label className="text-[10.5px] font-bold text-purple-950 uppercase tracking-wider block mb-1">
                    Technicien Émetteur (Demandeur de l'Envoi) <span className="text-rose-600 font-bold">*</span>
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
                    placeholder="-- Technicien émetteur --"
                  />
                </div>
              </div>
            )}

            {/* CASE D: ENTRÉE EXTERNE */}
            {isEntreeExterne && (
              <div className="space-y-3 pt-2 border-t border-slate-100 bg-emerald-50/40 p-3 rounded-xl border border-emerald-200">
                {/* 3 Action Cards for Entrée Externe */}
                <div>
                  <label className="text-[10.5px] font-bold text-emerald-950 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Inbox className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Nature de la Réception Externe (Action) :</span>
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      {
                        id: 'REAPPRO',
                        label: 'Réapprovisionnement',
                        desc: 'Commande fournisseur / stock',
                        icon: Truck,
                      },
                      {
                        id: 'RETOUR_REPARATION',
                        label: 'Retour Réparation',
                        desc: 'Retour bobinage / usinage',
                        icon: RefreshCw,
                      },
                      {
                        id: 'INVENTAIRE',
                        label: 'Régularisation +',
                        desc: 'Ajustement inventaire',
                        icon: ClipboardList,
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
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <IconComp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="text-xs font-bold truncate">{act.label}</span>
                          </div>
                          <div className="text-[9.5px] text-slate-500 leading-tight truncate">{act.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Smart One-Click Autofill for RETOUR_REPARATION if active external repairs exist */}
                {activeExternalRepairs.length > 0 && (
                  <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-xs">
                    <div className="font-bold text-purple-950 flex items-center gap-1 mb-1.5">
                      <Truck className="w-3.5 h-3.5 text-purple-600" />
                      <span>{activeExternalRepairs.length} Bon(s) de Sortie en Réparation Externe en attente :</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeExternalRepairs.slice(0, 3).map((rep, idx) => (
                        <button
                          key={`rep-btn-${idx}`}
                          type="button"
                          onClick={() => handleFulfillRepair(rep)}
                          className="px-2 py-1 bg-white hover:bg-purple-100 border border-purple-300 text-purple-900 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <span>{rep.code_bon}</span>
                          <span className="text-slate-500 font-normal">({rep.ref})</span>
                          <span className="text-emerald-600">↳ Réceptionner</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10.5px] font-bold text-emerald-950 uppercase tracking-wider block mb-1">
                    Fournisseur / Prestataire Expéditeur
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

            {/* CASE E: COMMANDE (Demande d'Achat & Approvisionnement) */}
            {isCommandeFlow && (
              <div className="space-y-3 pt-2 border-t border-slate-100 bg-amber-50/40 p-3 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <ShoppingCart className="w-4 h-4 text-amber-600" />
                    <span>Informations de la Demande d'Achat</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                    APPROVISIONNEMENT
                  </span>
                </div>

                {/* Priority Selector */}
                <div>
                  <label className="text-[10.5px] font-bold text-amber-950 uppercase tracking-wider block mb-1">
                    Niveau de Priorité :
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'NORMALE', label: '🟢 Normale', color: 'border-emerald-300 text-emerald-900 bg-emerald-50' },
                      { id: 'URGENTE', label: '🟡 Urgente', color: 'border-amber-300 text-amber-900 bg-amber-50' },
                      { id: 'CRITIQUE', label: '🔴 Critique (Rupture)', color: 'border-rose-300 text-rose-900 bg-rose-50' },
                    ].map((p) => {
                      const isSel = (form.priorite || 'NORMALE') === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setForm({ ...form, priorite: p.id })}
                          className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                            isSel
                              ? `${p.color} ring-2 ring-amber-500/20 shadow-2xs`
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
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
                      placeholder="Nom du fournisseur ou prestataire"
                      value={form.fournisseur}
                      onChange={(e) => setForm({ ...form, fournisseur: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-xl border border-amber-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-amber-500"
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
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-emerald-700" />
                      Catalogue PDR ({stockItems.length})
                    </span>
                  )}
                  {searchActiveTab === 'WAREHOUSE_PARTIE' && (
                    <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-700" />
                      Entrepôt: PARTIES ({warehouseItems.filter((w) => w.category === 'PARTIE' || w.nature === 'PARTIE').length})
                    </span>
                  )}
                  {searchActiveTab === 'WAREHOUSE_COMPOSANT' && (
                    <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1.5">
                      <Puzzle className="w-3.5 h-3.5 text-indigo-700" />
                      Entrepôt: COMPOSANTS ({warehouseItems.filter((w) => w.category === 'COMPOSANT' || w.nature === 'COMPOSANT').length})
                    </span>
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
