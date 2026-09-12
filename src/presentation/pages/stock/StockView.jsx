import { useState, useEffect, useRef, useMemo, useCallback, useDeferredValue } from 'react';
import AnimatedPage from '../../components/common/AnimatedPage';
import CustomSelect from '../../components/common/CustomSelect';
import QuickMovementModal from '../warehouse/QuickMovementModal';
import EditArticleModal from './EditArticleModal';
import { useSpareParts } from '../../hooks/useSpareParts';
import { StockItem } from '../../../core/domain';
import StockKPIBar from './components/StockKPIBar';
import { multiTokenSearch } from '../../../utils/searchUtils';
import { usePermission } from '../../components/common/PermissionGate.jsx';
import { contextMenu } from '../../../services/ContextMenuService';
import {
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowDownAZ,
  ArrowUpAZ,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Tag,
  MapPin,
  TrendingDown,
  TrendingUp,
  Boxes,
  X,
  Radio,
  MoreVertical,
  Edit,
  Inbox,
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

export default function StockView({
  stockItems: propStockItems = [],
  stockSearch = '',
  setStockSearch = () => {},
  stockTypeFilter = 'ALL',
  setStockTypeFilter = () => {},
  stockAlertOnly = false,
  setStockAlertOnly = () => {},
  types = [],
  zones = [],
  machines = [],
  technicians = [],
  operations = [],
  mouvements = [],
  onOpenAddArticle = () => {},
  onQuickSortie: _onQuickSortie = () => {},
  onAddMouvement = () => {},
  onUpdateArticle: propOnUpdateArticle,
  onDirectAdjustStock: propOnDirectAdjustStock,
  stockKPIs = { total: 0, alertes: 0, ruptures: 0, ok: 0, totalSorties: 0, totalEntrees: 0 },
  onNavigateToType: _onNavigateToType = () => {},
}) {
  const { stockItems: dbStockItems, updateArticle: dbUpdateArticle, directAdjustStock: dbDirectAdjustStock } = useSpareParts();

  const stockItems = propStockItems && propStockItems.length > 0 ? propStockItems : dbStockItems;
  const onUpdateArticle = propOnUpdateArticle || dbUpdateArticle;
  const onDirectAdjustStock = propOnDirectAdjustStock || dbDirectAdjustStock;
  
  const deferredStockSearch = useDeferredValue(stockSearch);
  const filteredStock = useMemo(() => {
    if (!stockItems || stockItems.length === 0) return [];

    return stockItems.filter((item) => {
      // Filter by type
      if (stockTypeFilter !== 'ALL') {
        const itemType = (item.id_type || item.type || '').toString();
        if (itemType !== stockTypeFilter) {
          return false;
        }
      }

      // Filter by alert status
      const domainItem = new StockItem(item);
      if (stockAlertOnly && domainItem.getCriticite() === 'OK') {
        return false;
      }

      // Filter by search
      if (deferredStockSearch) {
        return multiTokenSearch(item, ['ref', 'designation', 'emplacement', 'type', 'id_type'], deferredStockSearch);
      }

      return true;
    });
  }, [stockItems, stockTypeFilter, stockAlertOnly, deferredStockSearch]);

  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('type');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [activeKpiFilter, setActiveKpiFilter] = useState('ALL'); // ALL | 'OK' | 'ALERTE' | 'RUPTURE'

  // Dropdown actions popover menu state for table rows
  const [activeActionMenuRef, setActiveActionMenuRef] = useState(null);

  // Modals state
  const [quickModalState, setQuickModalState] = useState({
    isOpen: false,
    article: null,
    initialFlow: 'Sortie Interne',
    initialAction: 'CORRECTIVE',
  });

  const [editArticleModalState, setEditArticleModalState] = useState({
    isOpen: false,
    article: null,
  });

  const canEditStock = usePermission('stock.edit');

  const sortMenuRef = useRef(null);

  // Debounce state for high-performance stock searching
  const [localSearch, setLocalSearch] = useState(stockSearch);

  // Sync from parent in case a smart link modifies stockSearch externally
  useEffect(() => {
    setLocalSearch(stockSearch);
  }, [stockSearch]);

  // Debounce propagation of search input to setStockSearch
  useEffect(() => {
    const handler = setTimeout(() => {
      setStockSearch(localSearch);
    }, 200);
    return () => clearTimeout(handler);
  }, [localSearch, setStockSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [stockSearch, stockTypeFilter, stockAlertOnly, activeKpiFilter, sortField, sortOrder]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
      if (!event.target.closest('.action-menu-container')) {
        setActiveActionMenuRef(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Pre-filter with active KPI status card if clicked
  const effectiveFiltered = useMemo(() => {
    if (activeKpiFilter === 'ALL') return filteredStock;
    return filteredStock.filter((item) => item.alerte === activeKpiFilter);
  }, [filteredStock, activeKpiFilter]);

  const sortStock = useCallback((items) => {
    if (!sortField || !items || items.length === 0) return items || [];
    const list = [...items];
    const isAsc = sortOrder === 'asc';

    return list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'alerte') {
        const priority = { RUPTURE: 0, ALERTE: 1, OK: 2 };
        valA = priority[a.alerte] ?? 3;
        valB = priority[b.alerte] ?? 3;
        if (valA !== valB) return isAsc ? valA - valB : valB - valA;
      } else if (
        ['stockInitial', 'entrees', 'sorties', 'stockActuel', 'seuil'].includes(sortField)
      ) {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
        if (valA !== valB) return isAsc ? valA - valB : valB - valA;
      } else if (sortField === 'type') {
        const typeComp = String(a.type || a.id_type || '').localeCompare(
          String(b.type || b.id_type || ''),
          undefined,
          { sensitivity: 'base' }
        );
        if (typeComp !== 0) return isAsc ? typeComp : -typeComp;
        return String(a.ref || '').localeCompare(String(b.ref || ''), undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      } else {
        const strComp = String(valA || '').localeCompare(String(valB || ''), undefined, {
          numeric: true,
          sensitivity: 'base',
        });
        if (strComp !== 0) return isAsc ? strComp : -strComp;
      }

      // Secondary sort by ref numeric
      return String(a.ref || '').localeCompare(String(b.ref || ''), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }, [sortField, sortOrder]);

  const sortedStock = useMemo(() => {
    return sortStock(effectiveFiltered);
  }, [effectiveFiltered, sortStock]);

  const totalItems = sortedStock.length;
  const effectivePageSize = pageSize === 0 ? totalItems : pageSize;
  const totalPages = pageSize === 0 ? 1 : Math.ceil(totalItems / effectivePageSize) || 1;
  const startIndex = (currentPage - 1) * effectivePageSize;
  const displayedStock =
    pageSize === 0 ? sortedStock : sortedStock.slice(startIndex, startIndex + effectivePageSize);

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

  const hasActiveFilters =
    stockTypeFilter !== 'ALL' ||
    stockAlertOnly ||
    activeKpiFilter !== 'ALL' ||
    localSearch ||
    sortField !== 'ref' ||
    sortOrder !== 'asc';

  const clearAllFilters = () => {
    setStockTypeFilter('ALL');
    setStockAlertOnly(false);
    setActiveKpiFilter('ALL');
    setLocalSearch('');
    setSortField('ref');
    setSortOrder('asc');
  };

  const handleOpenQuickModal = (item, flow, action) => {
    setQuickModalState({
      isOpen: true,
      article: item,
      initialFlow: flow,
      initialAction: action,
    });
    setActiveActionMenuRef(null);
  };

  const handleOpenEditArticle = (item) => {
    setEditArticleModalState({
      isOpen: true,
      article: item,
    });
    setActiveActionMenuRef(null);
  };

  const handleRowContextMenu = (e, item) => {
    contextMenu.show(
      e,
      [
        {
          id: 'edit',
          label: 'Modifier l’article',
          onClick: () => handleOpenEditArticle(item),
        },
        {
          id: 'quick-sortie',
          label: 'Sortie directe (Sortie PDR)',
          onClick: () => handleOpenQuickModal(item, 'Sortie', 'CORRECTIVE'),
        },
        {
          id: 'quick-entree',
          label: 'Entrée directe (Réapprovisionnement)',
          onClick: () => handleOpenQuickModal(item, 'Entrée', 'REAPPRO'),
        },
        { separator: true },
        {
          id: 'copy-ref',
          label: `Copier la référence (${item.ref})`,
          onClick: () => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(item.ref);
            }
          },
        },
      ],
      `Article: ${item.ref}`
    );
  };

  return (
    <AnimatedPage className="space-y-5">
      {/* Top Banner (BDR Light GMAO Header) */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-5 h-5 text-cyan-600 shrink-0" />
            <span>Stock Actuel & Catalogue Pièces de Rechange (PDR)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Tableau central miroir de <b className="text-slate-800">Stock_Actuel (Excel B → K)</b>. Calcul temps réel :{' '}
            <b className="text-emerald-700 font-mono font-semibold">
              Stock Actuel = Initial (E) + Entrées (F) - Sorties (G)
            </b>{' '}
            avec menu d'actions et flux directs (Sortie, Entrée, Ajustement, et Édition de fiche).
          </p>
        </div>

        <button
          onClick={onOpenAddArticle}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 transition shadow-xs flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Article</span>
        </button>
      </div>

      {/* KPI Cards Bar (Interactive Clickable Filters) */}
      <StockKPIBar
        stockItems={stockItems}
        stockKPIs={stockKPIs}
        types={types}
        activeKpiFilter={activeKpiFilter}
        setActiveKpiFilter={setActiveKpiFilter}
        stockAlertOnly={stockAlertOnly}
        setStockAlertOnly={setStockAlertOnly}
      />

      {/* Excel Formula Preview Banner Cards (Excel Twin Model Formulas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 truncate">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Formule F : Entrées</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              Col. [F] (+)
            </span>
          </div>
          <div className="font-mono text-xs text-blue-700 font-bold">
            =SUMIFS(Mvt[Qté], Mvt[Type], "Entrée")
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 truncate">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="truncate">Formule G : Sorties</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
              Col. [G] (−)
            </span>
          </div>
          <div className="font-mono text-xs text-rose-700 font-bold">
            =SUMIFS(Mvt[Qté], Mvt[Type], "Sortie")
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 truncate">
              <Package className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Formule H : Stock Actuel</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              Col. [H] = E+F−G
            </span>
          </div>
          <div className="font-mono text-xs text-emerald-700 font-bold">
            = Initial (E) + Entrées (F) - Sorties (G)
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 truncate">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Formule J : Alerte</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              Col. [J] Statut
            </span>
          </div>
          <div className="font-mono text-xs text-amber-700 font-bold">
            =IF(H&lt;=0, "RUPTURE", IF(H&lt;=I, "ALERTE", "OK"))
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Filtres Multicritères & Recherche
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-cyan-50 text-cyan-800 px-3 py-1 rounded-lg text-xs font-bold border border-cyan-200/70">
              {filteredStock.length} article{filteredStock.length > 1 ? 's' : ''} affiché{filteredStock.length > 1 ? 's' : ''} / {stockItems.length}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
          {/* Search */}
          <div className="w-full">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                Recherche Article
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Col. B+C
              </span>
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ref, désignation, emplacement..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-8 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
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

          {/* Type Filter */}
          <div className="w-full">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                Type de Pièce
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
                Col. D
              </span>
            </label>
            <CustomSelect
              value={stockTypeFilter}
              onChange={(val) => setStockTypeFilter(val)}
              options={[
                {
                  value: 'ALL',
                  label: `Tous les Types (${types.length})`,
                  badge: `[${stockItems.length}]`,
                  badgeColor: 'bg-cyan-50 text-cyan-800',
                },
                ...types.map((t) => {
                  const val = typeof t === 'string' ? t : t.id_type || t.libelle;
                  const label = typeof t === 'string' ? t : t.libelle || t.id_type;
                  const count = stockItems.filter(
                    (s) =>
                      String(s.id_type || s.type || '').toLowerCase() === String(val).toLowerCase()
                  ).length;
                  return {
                    value: val,
                    label: `[D] ${label}`,
                    badge: `[${count}]`,
                    badgeColor: 'bg-cyan-50 text-cyan-800',
                  };
                }),
              ]}
            />
          </div>

          {/* Alert / State Filter */}
          <div className="w-full">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Filtrer par Alerte / État
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Col. J
              </span>
            </label>
            <button
              onClick={() => {
                if (activeKpiFilter === 'ALL' && !stockAlertOnly) {
                  setStockAlertOnly(true);
                } else {
                  setStockAlertOnly(false);
                  setActiveKpiFilter('ALL');
                }
              }}
              className={`w-full h-9 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                stockAlertOnly || activeKpiFilter !== 'ALL'
                  ? 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">
                  {stockAlertOnly || activeKpiFilter !== 'ALL'
                    ? `Actif : ${activeKpiFilter !== 'ALL' ? activeKpiFilter : 'Alertes'}`
                    : 'Alertes & Ruptures'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100/70 text-amber-800 shrink-0">
                {(stockKPIs.ruptures || 0) + (stockKPIs.alertes || 0)}
              </span>
            </button>
          </div>

          {/* Sort By Dropdown Menu Button */}
          <div className="w-full relative" ref={sortMenuRef}>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                Tri & Ordre
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Col. B→K
              </span>
            </label>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`w-full h-9 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                showSortMenu || sortField !== 'ref' || sortOrder !== 'asc'
                  ? 'bg-cyan-50 text-cyan-900 border-cyan-300 ring-1 ring-cyan-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Options de tri par colonne"
            >
              <div className="flex items-center gap-1.5 truncate">
                <ArrowUpDown className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <span className="truncate">
                  Tri : <b className="font-mono text-slate-900">{sortField.slice(0, 8).toUpperCase()}</b>
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-100/70 text-cyan-800">
                  {sortOrder === 'asc' ? 'A→Z' : 'Z→A'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${showSortMenu ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* Sort Popover Menu */}
            {showSortMenu && (
              <div className="absolute right-0 mt-1 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <SlidersHorizontal className="w-3 h-3 text-cyan-600" />
                    Trier par (Sort By)
                  </span>
                  <span>Colonnes B→K</span>
                </div>

                {/* Sort Field Options */}
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { key: 'ref', label: 'REF (B)' },
                    { key: 'designation', label: 'Désignation (C)' },
                    { key: 'type', label: 'Type (D)' },
                    { key: 'stockActuel', label: 'Stock Actuel (H)' },
                    { key: 'stockInitial', label: 'Initial (E)' },
                    { key: 'entrees', label: 'Entrées (F)' },
                    { key: 'sorties', label: 'Sorties (G)' },
                    { key: 'seuil', label: 'Seuil (I)' },
                    { key: 'alerte', label: 'Alerte (J)' },
                    { key: 'emplacement', label: 'Emplacement (K)' },
                  ].map((col) => (
                    <button
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={`px-2.5 py-1.5 rounded-lg border text-left font-medium text-[11px] flex items-center justify-between transition cursor-pointer ${
                        sortField === col.key
                          ? 'bg-cyan-50 text-cyan-900 border-cyan-300 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{col.label}</span>
                      {sortField === col.key &&
                        (sortOrder === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-cyan-600 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-cyan-600 shrink-0" />
                        ))}
                    </button>
                  ))}
                </div>

                {/* Sort Order Selector */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                      sortOrder === 'asc'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowUpAZ className="w-3.5 h-3.5" />
                    <span>Croissant (A-Z)</span>
                  </button>

                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                      sortOrder === 'desc'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowDownAZ className="w-3.5 h-3.5" />
                    <span>Décroissant (Z-A)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Stock Twin Table with Sticky Header, Zebra & Scroll */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Top Info Header Bar inside Card */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50/50 gap-2">
          <div className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-600" />
            <span>Tableau Stock_Actuel • Ordre Excel Row 3 : B → K</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
            N° | Ref (B) | Désignation (C) | Type (D) | Initial (E) | Entrées (F) | Sorties (G) | Actuel (H) | Seuil (I) | Alerte (J) | Emplacement (K)
          </div>
        </div>

        <div className="max-h-[62vh] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1020px]">
            <thead className="sticky top-0 bg-slate-100 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 z-10 shadow-2xs">
              <tr>
                <th className="py-3 px-3 text-center w-12 text-slate-500 font-mono text-[10px] bg-slate-200/60 border-r border-slate-200 shrink-0">
                  N°
                </th>

                {/* REF Column Header */}
                <th
                  onClick={() => handleSort('ref')}
                  className="py-3 px-3.5 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Référence"
                >
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span>REF</span>
                    <span className="text-slate-400 font-normal text-[10px]">(B)</span>
                    {renderSortIcon('ref')}
                  </div>
                </th>

                {/* DÉSIGNATION Column Header */}
                <th
                  onClick={() => handleSort('designation')}
                  className="py-3 px-3.5 cursor-pointer select-none hover:bg-slate-200/80 transition group min-w-[220px]"
                  title="Cliquer pour trier par Désignation"
                >
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>DÉSIGNATION</span>
                    <span className="text-slate-400 font-normal text-[10px]">(C)</span>
                    {renderSortIcon('designation')}
                  </div>
                </th>

                {/* TYPE Column Header */}
                <th
                  onClick={() => handleSort('type')}
                  className="py-3 px-3 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Type"
                >
                  <div className="flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>TYPE</span>
                    <span className="text-slate-400 font-normal text-[10px]">(D)</span>
                    {renderSortIcon('type')}
                  </div>
                </th>

                {/* INITIAL Column Header */}
                <th
                  onClick={() => handleSort('stockInitial')}
                  className="py-3 px-2.5 text-right cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Stock Initial"
                >
                  <div className="flex items-center justify-end gap-1">
                    <div>
                      <div>INITIAL</div>
                      <div className="text-[9.5px] text-slate-400 font-normal">(E)</div>
                    </div>
                    {renderSortIcon('stockInitial')}
                  </div>
                </th>

                {/* ENTRÉES Column Header */}
                <th
                  onClick={() => handleSort('entrees')}
                  className="py-3 px-2.5 text-right text-emerald-700 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Entrées"
                >
                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <div>ENTRÉES</div>
                      <div className="text-[9.5px] text-emerald-600 font-normal">(F)</div>
                    </div>
                    {renderSortIcon('entrees')}
                  </div>
                </th>

                {/* SORTIES Column Header */}
                <th
                  onClick={() => handleSort('sorties')}
                  className="py-3 px-2.5 text-right text-rose-700 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Sorties"
                >
                  <div className="flex items-center justify-end gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <div>
                      <div>SORTIES</div>
                      <div className="text-[9.5px] text-rose-600 font-normal">(G)</div>
                    </div>
                    {renderSortIcon('sorties')}
                  </div>
                </th>

                {/* ACTUEL Column Header */}
                <th
                  onClick={() => handleSort('stockActuel')}
                  className="py-3 px-2.5 text-right cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Stock Actuel"
                >
                  <div className="flex items-center justify-end gap-1">
                    <div>
                      <div className="font-black text-slate-900">ACTUEL</div>
                      <div className="text-[9.5px] text-slate-400 font-normal">(H)</div>
                    </div>
                    {renderSortIcon('stockActuel')}
                  </div>
                </th>

                {/* SEUIL Column Header */}
                <th
                  onClick={() => handleSort('seuil')}
                  className="py-3 px-2.5 text-right cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Seuil d'alerte"
                >
                  <div className="flex items-center justify-end gap-1">
                    <div>
                      <div>SEUIL</div>
                      <div className="text-[9.5px] text-slate-400 font-normal">(I)</div>
                    </div>
                    {renderSortIcon('seuil')}
                  </div>
                </th>

                {/* ALERTE Column Header */}
                <th
                  onClick={() => handleSort('alerte')}
                  className="py-3 px-3 text-center cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Statut d'Alerte"
                >
                  <div className="flex items-center justify-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <div>
                      <div>ALERTE</div>
                      <div className="text-[9.5px] text-slate-400 font-normal">(J)</div>
                    </div>
                    {renderSortIcon('alerte')}
                  </div>
                </th>

                {/* EMPLACEMENT Column Header */}
                <th
                  onClick={() => handleSort('emplacement')}
                  className="py-3 px-3.5 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Emplacement"
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <div>
                      <div>EMPLACEMENT</div>
                      <div className="text-[9.5px] text-slate-400 font-normal">(K)</div>
                    </div>
                    {renderSortIcon('emplacement')}
                  </div>
                </th>

                <th className="py-3 px-3.5 text-center min-w-[130px]">ACTIONS & FLUX</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {displayedStock.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-8 h-8 text-slate-300" />
                      <span>Aucun article ne correspond aux critères de recherche.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedStock.map((item, idx) => {
                  const domainItem = new StockItem(item);
                  const typeObj = types.find(
                    (t) => t.id_type === item.id_type || t.libelle === item.type
                  );
                  const rowNum = startIndex + idx + 1;
                  const isMenuOpen = activeActionMenuRef === item.ref;

                  return (
                    <tr
                      key={`stock-row-${item.id ?? ''}-${item.ref ?? ''}-${rowNum}`}
                      onContextMenu={(e) => handleRowContextMenu(e, item)}
                      className="even:bg-slate-50/70 odd:bg-white hover:bg-cyan-50/40 border-b border-slate-200/70 transition-colors"
                    >
                      {/* Row N° Column */}
                      <td className="py-3 px-3 text-center font-mono text-[11px] font-bold text-slate-400 bg-slate-100/40 border-r border-slate-200/80 shrink-0">
                        {rowNum}
                      </td>

                      {/* Ref */}
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {item.ref}
                        </span>
                      </td>

                      {/* Désignation */}
                      <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {item.designation}
                      </td>

                      {/* Type (Badge) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          onClick={() => {
                            const filterVal = item.type || item.id_type;
                            if (filterVal) {
                              setStockTypeFilter(filterVal);
                            }
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer shadow-2xs ${getTypeStyle(item.type)}`}
                          title="Filtrer par ce Type"
                        >
                          <span>{item.type || (typeObj ? typeObj.libelle : item.id_type)}</span>
                        </button>
                      </td>

                      {/* Initial (E) */}
                      <td className="py-3 px-2.5 text-right font-mono text-slate-600">
                        {item.stockInitial}
                      </td>

                      {/* Entrées (F) */}
                      <td className="py-3 px-2.5 text-right font-mono font-bold text-emerald-700">
                        {item.entrees > 0 ? `+${item.entrees}` : '0'}
                      </td>

                      {/* Sorties (G) */}
                      <td className="py-3 px-2.5 text-right font-mono font-bold text-rose-700">
                        {item.sorties > 0 ? `-${item.sorties}` : '0'}
                      </td>

                      {/* Actuel (H) */}
                      <td className="py-3 px-2.5 text-right font-mono font-black text-slate-900 text-sm">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          {domainItem.getActuel()}
                        </span>
                      </td>

                      {/* Seuil (I) */}
                      <td className="py-3 px-2.5 text-right font-mono text-slate-500 font-semibold">
                        {domainItem.getSeuilAlerte()}
                      </td>

                      {/* Alerte Badge (J) */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {domainItem.getCriticite() === 'RUPTURE' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>RUPTURE</span>
                          </span>
                        )}
                        {domainItem.getCriticite() === 'ALERTE' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>ALERTE</span>
                          </span>
                        )}
                        {domainItem.getCriticite() === 'OK' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>OK</span>
                          </span>
                        )}
                      </td>

                      {/* Emplacement (K) */}
                      <td className="py-3 px-3.5 font-mono text-slate-700 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                          <MapPin className="w-3 h-3 text-purple-500" />
                          <span>{item.emplacement || 'Non assigné'}</span>
                        </span>
                      </td>

                      {/* Quick Actions & Flux Menu (PDR Specialized) */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap action-menu-container relative">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Primary Fast Button: Quick Sortie */}
                          <button
                            onClick={() => handleOpenQuickModal(item, 'Sortie Interne', 'CORRECTIVE')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                            title="Sortie Rapide / Intervention"
                          >
                            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                            <span>Sortie</span>
                          </button>

                          {/* Quick Dropdown Actions Button */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveActionMenuRef(isMenuOpen ? null : item.ref)
                              }
                              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                                isMenuOpen
                                  ? 'bg-cyan-100 text-cyan-900 border-cyan-400 shadow-2xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                              title="Menu des Flux & Actions rapides"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-2 space-y-1 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                                <div className="px-2.5 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                  <span>FLUX & ACTIONS PDR</span>
                                  <span className="font-mono text-cyan-800">{item.ref}</span>
                                </div>

                                {/* 1. Sortie Interne */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenQuickModal(item, 'Sortie Interne', 'CORRECTIVE')}
                                  className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-950 flex items-center gap-2 transition cursor-pointer"
                                >
                                  <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                                    <TrendingDown className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="font-bold">Sortie Interne</div>
                                    <div className="text-[10px] text-slate-400">Corrective, Préventive, Usage</div>
                                  </div>
                                </button>

                                {/* 2. Entrée Interne */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenQuickModal(item, 'Entrée Interne', 'RETOUR')}
                                  className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-950 flex items-center gap-2 transition cursor-pointer"
                                >
                                  <div className="w-6 h-6 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="font-bold">Entrée Interne</div>
                                    <div className="text-[10px] text-slate-400">Retour Atelier, Récupération</div>
                                  </div>
                                </button>

                                {/* 3. Entrée Externe (Réapprovisionnement) */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenQuickModal(item, 'Entrée Externe', 'REAPPRO')}
                                  className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 flex items-center gap-2 transition cursor-pointer"
                                >
                                  <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                    <Inbox className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="font-bold">Entrée Externe</div>
                                    <div className="text-[10px] text-slate-400">Réappro Fournisseur (+ Qté)</div>
                                  </div>
                                </button>

                                {/* 4. Ajustement Inventaire & Recalibrage */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenQuickModal(item, 'Ajustement', 'INVENTAIRE')}
                                  className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-950 flex items-center gap-2 transition cursor-pointer"
                                >
                                  <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="font-bold">Ajuster le Stock</div>
                                    <div className="text-[10px] text-slate-400">Corriger valeur réelle / écart</div>
                                  </div>
                                </button>

                                {canEditStock && (
                                  <div className="border-t border-slate-100 my-1 pt-1">
                                    {/* 5. Modifier la fiche Article */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditArticle(item)}
                                      className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition cursor-pointer"
                                    >
                                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                                        <Edit className="w-3.5 h-3.5" />
                                      </div>
                                      <div>
                                        <div className="font-bold text-slate-800">Modifier l'Article</div>
                                        <div className="text-[10px] text-slate-400">Désignation, Seuil, Emplacement</div>
                                      </div>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
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
            {[50, 100, 250, 500, 0].map((size) => (
              <button
                key={size}
                onClick={() => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  pageSize === size
                    ? 'bg-white text-cyan-900 shadow-xs border border-slate-200/50'
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

      {/* Quick Movement & Flux Modal */}
      <QuickMovementModal
        isOpen={quickModalState.isOpen}
        onClose={() => setQuickModalState({ isOpen: false, article: null, initialFlow: 'Sortie Interne', initialAction: 'CORRECTIVE' })}
        article={quickModalState.article}
        initialFlow={quickModalState.initialFlow}
        initialAction={quickModalState.initialAction}
        zones={zones}
        machines={machines}
        technicians={technicians}
        operations={operations}
        mouvements={mouvements}
        onAddMouvement={onAddMouvement}
        onDirectAdjustStock={onDirectAdjustStock}
      />

      {/* Edit Article Modal */}
      <EditArticleModal
        isOpen={editArticleModalState.isOpen}
        onClose={() => setEditArticleModalState({ isOpen: false, article: null })}
        article={editArticleModalState.article}
        types={types}
        onUpdateArticle={onUpdateArticle}
        onOpenAddTypeModal={onOpenAddArticle}
      />
    </AnimatedPage>
  );
}
