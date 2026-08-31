import React from 'react';
import AnimatedPage from './AnimatedPage';
import CustomSelect from './CustomSelect';
import SortieEntreeIcon from './SortieEntreeIcon';
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowDownAZ,
  ArrowUpAZ,
  SlidersHorizontal,
  ChevronDown,
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
  stockItems,
  filteredStock,
  stockSearch,
  setStockSearch,
  stockTypeFilter,
  setStockTypeFilter,
  stockAlertOnly,
  setStockAlertOnly,
  types,
  onOpenAddArticle,
  onQuickSortie,
  stockKPIs,
  onNavigateToType,
}) {
  const [pageSize, setPageSize] = React.useState(100);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortField, setSortField] = React.useState('ref');
  const [sortOrder, setSortOrder] = React.useState('asc');
  const [showSortMenu, setShowSortMenu] = React.useState(false);

  const sortMenuRef = React.useRef(null);

  // Debounce state for high-performance stock searching
  const [localSearch, setLocalSearch] = React.useState(stockSearch);

  // Sync from parent in case a smart link modifies stockSearch externally
  React.useEffect(() => {
    setLocalSearch(stockSearch);
  }, [stockSearch]);

  // Debounce propagation of search input to setStockSearch
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setStockSearch(localSearch);
    }, 200);
    return () => clearTimeout(handler);
  }, [localSearch, setStockSearch]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [stockSearch, stockTypeFilter, stockAlertOnly, sortField, sortOrder]);

  // Close sort menu on outside click
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
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

  const sortedStock = React.useMemo(() => {
    if (!sortField) return filteredStock;
    const list = [...filteredStock];
    return list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'alerte') {
        const priority = { RUPTURE: 0, ALERTE: 1, OK: 2 };
        valA = priority[a.alerte] ?? 3;
        valB = priority[b.alerte] ?? 3;
      } else if (
        ['stockInitial', 'entrees', 'sorties', 'stockActuel', 'seuil'].includes(sortField)
      ) {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredStock, sortField, sortOrder]);

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

  return (
    <AnimatedPage className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <Package className="w-5 h-5 text-cyan-600 shrink-0" />
            <span>Stock Actuel & Articles (Catalogue Pièces)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tableau central miroir de Stock. Calcul temps réel :{' '}
            <b className="text-emerald-700 font-mono">
              Stock Actuel = Initial (E) + Entrées (F) - Sorties (G)
            </b>{' '}
            et détection automatique des <b className="text-amber-600">Alertes (J)</b>.
          </p>
        </div>

        <button
          onClick={onOpenAddArticle}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-black transition shadow-xs flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvel Article</span>
        </button>
      </div>

      {/* Excel Formula Preview Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Formule F : Entrées
            </div>
            <div className="font-mono text-xs text-blue-700 font-semibold mt-0.5">
              =SUMIFS(Mvt[Qté], Mvt[Type], "Entrée")
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            +
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Formule G : Sorties
            </div>
            <div className="font-mono text-xs text-rose-700 font-semibold mt-0.5">
              =SUMIFS(Mvt[Qté], Mvt[Type], "Sortie")
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
            -
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Formule H : Stock Actuel
            </div>
            <div className="font-mono text-xs text-emerald-700 font-bold mt-0.5">
              = E + F - G (Init + Ent - Sort)
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            =
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Formule J : Alerte
            </div>
            <div className="font-mono text-xs text-amber-700 font-semibold mt-0.5">
              =IF(H&lt;=0, "RUPTURE", IF(H&lt;=I, "ALERTE", "OK"))
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
            !
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
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
                placeholder="Rechercher (Ref, désignation, emplacement)..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="w-full">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Filtrer par Type (D)
            </label>
            <CustomSelect
              value={stockTypeFilter}
              onChange={(val) => setStockTypeFilter(val)}
              options={[
                { value: 'ALL', label: `Tous les Types (${types.length})` },
                ...types.map((t) => {
                  const val = typeof t === 'string' ? t : t.id_type || t.libelle;
                  const label = typeof t === 'string' ? t : t.libelle || t.id_type;
                  return {
                    value: val,
                    label: `[D] ${label}`,
                  };
                }),
              ]}
              compact={false}
            />
          </div>

          {/* Alert Toggle */}
          <div className="w-full">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              État du Stock
            </label>
            <button
              onClick={() => setStockAlertOnly(!stockAlertOnly)}
              className={`w-full h-10 px-3 rounded-xl border text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                stockAlertOnly
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Alertes / Ruptures ({stockKPIs.ruptures + stockKPIs.alertes})</span>
            </button>
          </div>

          {/* Sort By Dropdown Menu Button */}
          <div className="w-full relative" ref={sortMenuRef}>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Tri & Colonne
            </label>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`w-full h-10 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                showSortMenu || sortField !== 'ref' || sortOrder !== 'asc'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-1 ring-emerald-200 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Options de tri par colonne"
            >
              <div className="flex items-center gap-2 truncate">
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">
                  Tri : <b className="font-mono text-slate-900">{sortField.toUpperCase()}</b> (
                  {sortOrder === 'asc' ? 'A→Z' : 'Z→A'})
                </span>
              </div>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform shrink-0 ${showSortMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Sort Popover Menu */}
            {showSortMenu && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600" />
                    Trier par (Sort By)
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Champs & Ordre</span>
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
                      className={`px-2.5 py-1.5 rounded-xl border text-left font-medium text-[11px] flex items-center justify-between transition cursor-pointer ${
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

                {/* Sort Order Selector (Ascending / Descending Buttons) */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      sortOrder === 'asc'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowUpAZ className="w-3.5 h-3.5" />
                    <span>Croissant (A-Z)</span>
                  </button>

                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      sortOrder === 'desc'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
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

          {(stockTypeFilter !== 'ALL' ||
            stockAlertOnly ||
            stockSearch ||
            sortField !== 'ref' ||
            sortOrder !== 'asc') && (
            <button
              onClick={() => {
                setStockTypeFilter('ALL');
                setStockAlertOnly(false);
                setStockSearch('');
                setSortField('ref');
                setSortOrder('asc');
              }}
              className="text-xs text-slate-500 hover:text-slate-900 underline font-medium px-1 cursor-pointer"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Total Count Badge/Text */}
        <div className="text-xs text-slate-500 font-medium shrink-0">
          Total : <b className="text-slate-900">{filteredStock.length}</b> /{' '}
          <b className="text-slate-900">{stockItems.length}</b> articles
        </div>
      </div>

      {/* Main Stock Twin Table with Sticky Header, Zebra & Scroll 60vh */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Top Info Header Bar inside Card */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50/50 gap-2">
          <div className="font-bold text-slate-800 text-[13px]">
            Stock_Actuel • Ordre Excel Row 3 : B→K
          </div>
          <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
            N° | Ref | Désignation | Type | Initial | Entrées | Sorties | Actuel | Seuil | Alerte |
            Emplacement
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1020px]">
            <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-[10.5px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 z-10 shadow-2xs">
              <tr>
                <th className="py-2.5 px-3 text-center w-12 text-slate-500 font-mono text-[10px] bg-slate-200/60 border-r border-slate-200 shrink-0">
                  N°
                </th>

                {/* REF Column Header */}
                <th
                  onClick={() => handleSort('ref')}
                  className="py-2.5 px-3 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Référence"
                >
                  <div className="flex items-center gap-1">
                    <span>REF</span>{' '}
                    <span className="text-slate-400 font-normal text-[10px]">(B)</span>
                    {renderSortIcon('ref')}
                  </div>
                </th>

                {/* DÉSIGNATION Column Header */}
                <th
                  onClick={() => handleSort('designation')}
                  className="py-2.5 px-3 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Désignation"
                >
                  <div className="flex items-center gap-1">
                    <span>DÉSIGNATION</span>{' '}
                    <span className="text-slate-400 font-normal text-[10px]">(C)</span>
                    {renderSortIcon('designation')}
                  </div>
                </th>

                {/* TYPE Column Header */}
                <th
                  onClick={() => handleSort('type')}
                  className="py-2.5 px-3 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Type"
                >
                  <div className="flex items-center gap-1">
                    <span>TYPE</span>{' '}
                    <span className="text-slate-400 font-normal text-[10px]">(D)</span>
                    {renderSortIcon('type')}
                  </div>
                </th>

                {/* INITIAL Column Header */}
                <th
                  onClick={() => handleSort('stockInitial')}
                  className="py-2 px-2 text-right cursor-pointer select-none hover:bg-slate-200/80 transition group"
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
                  className="py-2 px-2 text-right text-emerald-700 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Entrées"
                >
                  <div className="flex items-center justify-end gap-1">
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
                  className="py-2 px-2 text-right text-rose-700 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Sorties"
                >
                  <div className="flex items-center justify-end gap-1">
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
                  className="py-2 px-2 text-right cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Stock Actuel"
                >
                  <div className="flex items-center justify-end gap-1">
                    <div>
                      <div>ACTUEL</div>
                      <div className="text-[9.5px] text-slate-400 font-normal">(H)</div>
                    </div>
                    {renderSortIcon('stockActuel')}
                  </div>
                </th>

                {/* SEUIL Column Header */}
                <th
                  onClick={() => handleSort('seuil')}
                  className="py-2 px-2 text-right cursor-pointer select-none hover:bg-slate-200/80 transition group"
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
                  className="py-2 px-3 text-center cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Statut d'Alerte"
                >
                  <div className="flex items-center justify-center gap-1">
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
                  className="py-2 px-3 cursor-pointer select-none hover:bg-slate-200/80 transition group"
                  title="Cliquer pour trier par Emplacement"
                >
                  <div className="flex items-center gap-1">
                    <div>
                      <div>EMPLACEMENT</div>
                      <div className="text-[9.5px] text-slate-400 font-normal">(K)</div>
                    </div>
                    {renderSortIcon('emplacement')}
                  </div>
                </th>

                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {displayedStock.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-xs text-slate-400 font-medium">
                    Aucun article correspondant à la recherche.
                  </td>
                </tr>
              ) : (
                displayedStock.map((item, idx) => {
                  const typeObj = types.find(
                    (t) => t.id_type === item.id_type || t.libelle === item.type
                  );
                  const rowNum = startIndex + idx + 1;

                  return (
                    <tr
                      key={item.id || item.ref || idx}
                      className="even:bg-slate-50/80 odd:bg-white hover:bg-blue-50/80 border-b border-slate-200/70 transition-colors"
                    >
                      {/* Row N° Column */}
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] font-bold text-slate-400 bg-slate-100/40 border-r border-slate-200/80 shrink-0">
                        {rowNum}
                      </td>

                      {/* Ref */}
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {item.ref}
                      </td>

                      {/* Désignation */}
                      <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                        {item.designation}
                      </td>

                      {/* Type (Badge) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <button
                          onClick={() => {
                            const filterVal = item.type || item.id_type;
                            if (filterVal) {
                              setStockTypeFilter(filterVal);
                            }
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold transition ${getTypeStyle(item.type)}`}
                          title="Filtrer par ce Type"
                        >
                          <span>{item.type || (typeObj ? typeObj.libelle : item.id_type)}</span>
                        </button>
                      </td>

                      {/* Initial */}
                      <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                        {item.stockInitial}
                      </td>

                      {/* Entrées */}
                      <td className="py-2.5 px-2 text-right font-mono font-medium text-emerald-600">
                        {item.entrees > 0 ? `+${item.entrees}` : '0'}
                      </td>

                      {/* Sorties */}
                      <td className="py-2.5 px-2 text-right font-mono font-medium text-rose-600">
                        {item.sorties > 0 ? `-${item.sorties}` : '0'}
                      </td>

                      {/* Actuel */}
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900 text-[13px]">
                        {item.stockActuel}
                      </td>

                      {/* Seuil */}
                      <td className="py-2.5 px-2 text-right font-mono text-slate-500">
                        {item.seuil}
                      </td>

                      {/* Alerte Badge */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {item.alerte === 'RUPTURE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            <span>RUPTURE</span>
                          </span>
                        )}
                        {item.alerte === 'ALERTE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>ALERTE</span>
                          </span>
                        )}
                        {item.alerte === 'OK' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>OK</span>
                          </span>
                        )}
                      </td>

                      {/* Emplacement */}
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {item.emplacement}
                      </td>

                      {/* Quick Sortie Button */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => onQuickSortie(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-medium transition shadow-xs cursor-pointer"
                        >
                          <SortieEntreeIcon className="w-3.5 h-3.5" />
                          <span>Sortie</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary & Pagination Controls */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Page Size Selector & Record Status */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Afficher :</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 px-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer shadow-2xs"
              >
                <option value={50}>50 lignes</option>
                <option value={100}>100 lignes</option>
                <option value={250}>250 lignes</option>
                <option value={500}>500 lignes</option>
                <option value={0}>Tout afficher ({totalItems})</option>
              </select>
            </div>

            <div className="text-slate-500">
              Affichage de <b className="text-slate-900">{totalItems === 0 ? 0 : startIndex + 1}</b>{' '}
              à{' '}
              <b className="text-slate-900">
                {Math.min(startIndex + displayedStock.length, totalItems)}
              </b>{' '}
              sur <b className="text-slate-900">{totalItems}</b> articles
            </div>
          </div>

          {/* Page Navigation Buttons */}
          {pageSize > 0 && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition cursor-pointer shadow-2xs"
              >
                Précédent
              </button>

              <span className="px-2 font-mono text-slate-700 font-bold">
                Page {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition cursor-pointer shadow-2xs"
              >
                Suivant
              </button>
            </div>
          )}

          {/* Totals */}
          <div className="flex items-center gap-3 font-mono text-slate-700 font-semibold text-[11px]">
            <span>
              Total Entrées : <b className="text-emerald-700">+{stockKPIs.totalEntrees}</b>
            </span>
            <span>•</span>
            <span>
              Total Sorties : <b className="text-rose-700">-{stockKPIs.totalSorties}</b>
            </span>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
