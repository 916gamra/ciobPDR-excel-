import React from 'react';
import { Factory, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

export default function MachinesKPIBar({
  kpis = {},
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div id="machines-kpis-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Card 1: Total Machines */}
      <div
        id="machines-kpi-total"
        onClick={() => setStatusFilter('ALL')}
        className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
          statusFilter === 'ALL'
            ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Parc Global
          </span>
          <span className="text-2xl font-black text-slate-900 mt-0.5 block font-mono">
            {kpis.total}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {kpis.activeFamiliesCount} Familles actives
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60">
          <Factory className="w-5 h-5 text-emerald-700" />
        </div>
      </div>

      {/* Card 2: En Service */}
      <div
        id="machines-kpi-en-service"
        onClick={() => setStatusFilter(statusFilter === 'En Service' ? 'ALL' : 'En Service')}
        className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
          statusFilter === 'En Service'
            ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/30'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
            En Service (Opérationnel)
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-0.5 block font-mono">
            {kpis.enService}
          </span>
          <span className="text-[11px] text-emerald-600/80 mt-0.5 block">
            {kpis.total > 0 ? Math.round((kpis.enService / kpis.total) * 100) : 0}% du parc en ligne
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Card 3: En Maintenance / Panne */}
      <div
        id="machines-kpi-maintenance"
        onClick={() => setStatusFilter(statusFilter === 'En Maintenance' ? 'ALL' : 'En Maintenance')}
        className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
          statusFilter === 'En Maintenance'
            ? 'border-amber-500 ring-2 ring-amber-100 bg-amber-50/30'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div>
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
            En Maintenance / Arrêt
          </span>
          <span className="text-2xl font-black text-amber-700 mt-0.5 block font-mono">
            {(kpis.enMaintenance || 0) + (kpis.enArret || 0)}
          </span>
          <span className="text-[11px] text-amber-600/80 mt-0.5 block">
            Interventions requises
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* Card 4: Traçabilité Sorties / Interventions */}
      <div id="machines-kpi-interventions" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
            Interventions Enregistrées
          </span>
          <span className="text-2xl font-black text-indigo-700 mt-0.5 block font-mono">
            {kpis.totalInterventions}
          </span>
          <span className="text-[11px] text-indigo-500 mt-0.5 block">
            =COUNTIF(Mvt[Machine])
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200/60">
          <Activity className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
