import React from 'react';
import SortieEntreeIcon from './SortieEntreeIcon';
import {
  Package,
  Cpu,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Boxes,
  ArrowRight,
  Plus
} from 'lucide-react';

export default function DashboardView({
  stockItems,
  machines,
  mouvements,
  types,
  diagnostics,
  zones,
  technicians,
  stockKPIs,
  onNavigateToStock,
  onNavigateToMachines,
  onNavigateToSortie,
  onQuickSortie
}) {
  const alertAndRuptureItems = stockItems.filter(
    (s) => s.alerte === 'RUPTURE' || s.alerte === 'ALERTE'
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Articles */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Articles (Stock)
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
              {stockKPIs.totalArticles}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Ref cataloguées en magasin
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Stock Actuel Total */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Unités Physiques
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
              {stockKPIs.totalStockActuel}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{stockKPIs.totalEntrees} entrées | -{stockKPIs.totalSorties} sorties</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Ruptures & Alertes */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Alertes & Ruptures
            </div>
            <div className="text-2xl font-extrabold text-rose-600 mt-1 font-mono">
              {stockKPIs.ruptures + stockKPIs.alertes}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              <b className="text-rose-600">{stockKPIs.ruptures} ruptures</b> • <b className="text-amber-600">{stockKPIs.alertes} alertes</b>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Total Machines */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Machines Registered
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
              {machines.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Réparties sur <b className="text-purple-600">{zones.length} zones</b>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Excel Formula Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule Entrées (F)</div>
            <div className="text-[11px] font-mono font-semibold text-blue-700 mt-0.5">
              =SUMIFS(Qté, Ref, [@Ref], "Entrée")
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700">Calcul F</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule Sorties (G)</div>
            <div className="text-[11px] font-mono font-semibold text-rose-700 mt-0.5">
              =SUMIFS(Qté, Ref, [@Ref], "Sortie")
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700">Calcul G</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule Actuel (H)</div>
            <div className="text-[11px] font-mono font-bold text-emerald-700 mt-0.5">
              =[@[Initial]] + [@Entrees] - [@Sorties]
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Calcul H</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule Alerte (J)</div>
            <div className="text-[11px] font-mono font-semibold text-amber-700 mt-0.5">
              =IF(H&lt;=0, "RUPTURE", IF(H&lt;=I, "ALERTE", "OK"))
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700">Calcul J</span>
        </div>
      </div>

      {/* Main Watchlist & Recent Flux */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlist Ruptures & Alertes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Articles Sous Seuil Critique ({alertAndRuptureItems.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Réapprovisionnement nécessaire en atelier
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToStock}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <span>Voir tout le Stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Ref</th>
                  <th className="py-2.5 px-3">Désignation</th>
                  <th className="py-2.5 px-2 text-right">Stock Actuel</th>
                  <th className="py-2.5 px-2 text-right">Seuil</th>
                  <th className="py-2.5 px-3 text-center">État</th>
                  <th className="py-2.5 px-3">Emplacement</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alertAndRuptureItems.slice(0, 8).map((item, idx) => (
                  <tr key={item.id || `${item.ref}-${idx}`} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {item.ref}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {item.designation}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-rose-600">
                      {item.stockActuel}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-500">
                      {item.seuil}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.alerte === 'RUPTURE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          <span>RUPTURE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>ALERTE</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {item.emplacement}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onQuickSortie(item)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-medium hover:bg-black transition"
                      >
                        Sortie
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Launch & Recent Mouvements */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <SortieEntreeIcon className="w-4 h-4 shrink-0" strokeWidth={2.25} />
              <span>Derniers Mouvements</span>
            </h3>
            <button
              onClick={onNavigateToSortie}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <span>+ Sortie</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {mouvements.slice(0, 6).map((m, idx) => {
              const art = stockItems.find((s) => s.ref === m.ref);
              return (
                <div
                  key={m.id || `mvt-${idx}`}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                          m.type === 'Sortie' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {m.type}
                      </span>
                      <span className="font-mono font-bold text-slate-900">{m.ref}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                      {art ? art.designation : m.designation || 'Article'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {m.date} • {m.technicien || 'Tech'} • {m.id_machine_registered || 'Atelier'}
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-sm">
                    {m.type === 'Sortie' ? (
                      <span className="text-rose-600">-{m.quantite}</span>
                    ) : (
                      <span className="text-emerald-600">+{m.quantite}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
