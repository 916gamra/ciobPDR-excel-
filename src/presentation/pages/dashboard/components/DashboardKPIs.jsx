import { Package, Boxes, AlertTriangle, Cpu } from 'lucide-react';

export default function DashboardKPIs({
  stockKPIs,
  types = [],
  machineHealth,
  onNavigateToStock,
  onNavigateToMachines,
}) {
  return (
    <div id="dashboard-kpis-container" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Catalog Articles */}
      <div
        id="kpi-card-total-articles"
        onClick={onNavigateToStock}
        className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 hover:shadow-sm transition group"
      >
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Articles au Catalogue
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight group-hover:text-blue-600 transition">
            {stockKPIs.totalArticles}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <span>{types.length} catégories</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">{stockKPIs.ok} en stock normal</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
          <Package className="w-6 h-6" />
        </div>
      </div>

      {/* Physical Stock Balance */}
      <div
        id="kpi-card-stock-balance"
        onClick={onNavigateToStock}
        className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 hover:shadow-sm transition group"
      >
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Unités Physiques en Stock
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight group-hover:text-emerald-600 transition">
            {stockKPIs.totalStockActuel}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">+{stockKPIs.totalEntrees} E</span>
            <span>|</span>
            <span className="text-rose-600 font-bold">-{stockKPIs.totalSorties} S</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
          <Boxes className="w-6 h-6" />
        </div>
      </div>

      {/* Critical Alerts & Ruptures */}
      <div
        id="kpi-card-critical-alerts"
        onClick={onNavigateToStock}
        className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-rose-300 hover:shadow-sm transition group"
      >
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Seuils Critiques & Ruptures
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-rose-600 mt-1 font-mono tracking-tight">
            {stockKPIs.ruptures + stockKPIs.alertes}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
              {stockKPIs.ruptures} Ruptures
            </span>
            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
              {stockKPIs.alertes} Alertes
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition">
          <AlertTriangle className="w-6 h-6" />
        </div>
      </div>

      {/* Machines & Asset Fleet */}
      <div
        id="kpi-card-machines-fleet"
        onClick={onNavigateToMachines}
        className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 hover:shadow-sm transition group"
      >
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Parc Machines Actif
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight group-hover:text-purple-600 transition">
            {machineHealth.total}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span className="text-emerald-600 font-bold">{machineHealth.enService} en service</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">{machineHealth.enMaintenance} en maint.</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
          <Cpu className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
