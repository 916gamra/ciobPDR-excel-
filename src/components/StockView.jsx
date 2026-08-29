import React from 'react';
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
  ArrowRight
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
  const key = Object.keys(TYPE_STYLES).find(
    (k) => k.toLowerCase() === clean.toLowerCase()
  );
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
  onNavigateToType
}) {
  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <Package className="w-5 h-5 text-cyan-600 shrink-0" />
            <span>Stock Actuel & Articles (Catalogue Pièces)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tableau central miroir de Stock. Calcul temps réel : <b className="text-emerald-700 font-mono">Stock Actuel = Initial (E) + Entrées (F) - Sorties (G)</b> et détection automatique des <b className="text-amber-600">Alertes (J)</b>.
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher (Ref, désignation, emplacement)..."
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
            />
          </div>

          {/* Type Filter */}
          <div className="w-56">
            <CustomSelect
              value={stockTypeFilter}
              onChange={(val) => setStockTypeFilter(val)}
              options={[
                { value: 'ALL', label: `Tous les Types (D) (${types.length})` },
                ...types.map((t) => {
                  const val = typeof t === 'string' ? t : (t.id_type || t.libelle);
                  const label = typeof t === 'string' ? t : (t.libelle || t.id_type);
                  return {
                    value: val,
                    label: `[D] ${label}`
                  };
                })
              ]}
              compact={false}
            />
          </div>

          {/* Alert Toggle */}
          <button
            onClick={() => setStockAlertOnly(!stockAlertOnly)}
            className={`h-9 px-3 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
              stockAlertOnly
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Alertes / Ruptures ({stockKPIs.ruptures + stockKPIs.alertes})</span>
          </button>

          {(stockTypeFilter !== 'ALL' || stockAlertOnly || stockSearch) && (
            <button
              onClick={() => {
                setStockTypeFilter('ALL');
                setStockAlertOnly(false);
                setStockSearch('');
              }}
              className="text-xs text-slate-500 hover:text-slate-900 underline font-medium px-1"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Total Count Badge/Text */}
        <div className="text-xs text-slate-500 font-medium shrink-0">
          Total : <b className="text-slate-900">{filteredStock.length}</b> / <b className="text-slate-900">{stockItems.length}</b> articles
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
            Ref | Désignation | Type | Initial | Entrées | Sorties | Actuel | Seuil | Alerte | Emplacement
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[980px]">
            <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-xs text-[10.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 z-10 shadow-2xs">
              <tr>
                <th className="py-2.5 px-3">
                  <span>REF</span> <span className="text-slate-400 font-normal text-[10px]">(B)</span>
                </th>
                <th className="py-2.5 px-3">
                  <span>DÉSIGNATION</span> <span className="text-slate-400 font-normal text-[10px]">(C) primary</span>
                </th>
                <th className="py-2.5 px-3">
                  <span>TYPE</span> <span className="text-slate-400 font-normal text-[10px]">(D)</span>
                </th>
                <th className="py-2 px-2 text-right">
                  <div>INITIAL</div>
                  <div className="text-[9.5px] text-slate-400 font-normal">(E)</div>
                </th>
                <th className="py-2 px-2 text-right text-emerald-700">
                  <div>ENTRÉES</div>
                  <div className="text-[9.5px] text-emerald-600 font-normal">(F)</div>
                </th>
                <th className="py-2 px-2 text-right text-rose-700">
                  <div>SORTIES</div>
                  <div className="text-[9.5px] text-rose-600 font-normal">(G)</div>
                </th>
                <th className="py-2 px-2 text-right">
                  <div>ACTUEL</div>
                  <div className="text-[9.5px] text-slate-400 font-normal">(H)</div>
                </th>
                <th className="py-2 px-2 text-right">
                  <div>SEUIL</div>
                  <div className="text-[9.5px] text-slate-400 font-normal">(I)</div>
                </th>
                <th className="py-2 px-3 text-center">
                  <div>ALERTE</div>
                  <div className="text-[9.5px] text-slate-400 font-normal">(J)</div>
                </th>
                <th className="py-2 px-3">
                  <div>EMPLACEMENT</div>
                  <div className="text-[9.5px] text-slate-400 font-normal">(K)</div>
                </th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStock.slice(0, 300).map((item, idx) => {
                const typeObj = types.find((t) => t.id_type === item.id_type || t.libelle === item.type);
                
                return (
                  <tr
                    key={item.id || idx}
                    className="even:bg-slate-50/50 odd:bg-white hover:bg-blue-50/60 transition-colors"
                  >
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
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-medium transition shadow-xs"
                      >
                        <SortieEntreeIcon className="w-3.5 h-3.5" />
                        <span>Sortie</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div>
            Affichage de <b className="text-slate-800">{Math.min(300, filteredStock.length)}</b> sur{' '}
            <b className="text-slate-800">{stockItems.length}</b> articles
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-700 font-semibold">
              Total Entrées : <b className="text-emerald-700">+{stockKPIs.totalEntrees}</b>
            </span>
            <span>•</span>
            <span className="font-mono text-slate-700 font-semibold">
              Total Sorties : <b className="text-rose-700">-{stockKPIs.totalSorties}</b>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
