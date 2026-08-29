import React from 'react';
import {
  LayoutDashboard,
  ArrowDownUp,
  Package,
  Tag,
  AlertCircle,
  Cpu,
  FolderTree,
  Layers,
  MapPin,
  Users,
  Wrench,
  GitBranch,
  BookOpen,
  X,
  Boxes,
  PieChart,
  Database,
  Factory,
  Lightbulb,
  Zap,
  Settings,
} from 'lucide-react';

export default function Sidebar({
  currentTab,
  setCurrentTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  counts
}) {
  const navTo = (tab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[270px] bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-[68px] px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
              <Zap className="w-5 h-5 text-white fill-white/20" />
            </div>
            <div>
              <div className="font-bold text-sm text-white tracking-tight leading-tight">
                CIOB GMAO
              </div>
              <div className="text-[11px] text-cyan-400 font-medium">
                Light UI Excel
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs">
          {/* Main Top Nav */}
          <div className="space-y-1">
            <button
              onClick={() => navTo('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition ${
                currentTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </span>
            </button>

            <button
              onClick={() => navTo('sortie')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition ${
                currentTab === 'sortie'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <ArrowDownUp className="w-4 h-4 text-cyan-400" />
                <span>Sortie Rapide</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-600 font-mono">
                Mvt
              </span>
            </button>
          </div>

          {/* GROUPE 1: COMPONENTS */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>Components</span>
            </div>
            <div className="space-y-0.5">
              {/* Stock (Twin Principal) */}
              <button
                onClick={() => navTo('stock')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition ${
                  currentTab === 'stock'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">Stock (Articles)</span>
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                    currentTab === 'stock'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {counts.stock || 0}
                </span>
              </button>

              {/* Type (Secondaire) */}
              <button
                onClick={() => navTo('types')}
                className={`w-full flex items-center justify-between px-3 py-1.5 pl-7 rounded-xl text-[12.5px] transition ${
                  currentTab === 'types'
                    ? 'bg-slate-800 text-cyan-600 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  {/*@ts-ignore*/}
                  <Tag className={`w-3.5 h-3.5 ${currentTab === 'types' ? 'text-cyan-600' : 'text-cyan-400'}`} />
                  <span>Type</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${currentTab === 'types' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>{counts.types || 0}</span>
              </button>

              {/* Designation (Secondaire) */}
              <button
                onClick={() => navTo('designations')}
                className={`w-full flex items-center justify-between px-3 py-1.5 pl-7 rounded-xl text-[12.5px] transition ${
                  currentTab === 'designations' || currentTab === 'diagnostics'
                    ? 'bg-slate-800 text-indigo-400 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Layers className={`w-3.5 h-3.5 ${currentTab === 'designations' || currentTab === 'diagnostics' ? 'text-indigo-400' : 'text-indigo-400'}`} />
                  <span>Désignation</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${currentTab === 'designations' || currentTab === 'diagnostics' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>{counts.designations || counts.diagnostics || 0}</span>
              </button>
            </div>
          </div>

          {/* GROUPE 2: MACHINES */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              <span>Machines</span>
            </div>
            <div className="space-y-0.5">
              {/* Machines Registered (Twin Principal) */}
              <button
                onClick={() => navTo('machines')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition ${
                  currentTab === 'machines'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Machines Registered</span>
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                    currentTab === 'machines'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {counts.machines || 0}
                </span>
              </button>

              {/* Family (Secondaire) */}
              <button
                onClick={() => navTo('families')}
                className={`w-full flex items-center justify-between px-3 py-1.5 pl-7 rounded-xl text-[12.5px] transition ${
                  currentTab === 'families' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  {/*@ts-ignore*/}
                  <FolderTree className={`w-3.5 h-3.5 ${currentTab === 'families' ? 'text-cyan-600' : 'text-cyan-400'}`} />
                  <span>Family</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${currentTab === 'families' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>{counts.families || 0}</span>
              </button>

              {/* Templates (Secondaire) */}
              <button
                onClick={() => navTo('templates')}
                className={`w-full flex items-center justify-between px-3 py-1.5 pl-7 rounded-xl text-[12.5px] transition ${
                  currentTab === 'templates' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  {/*@ts-ignore*/}
                  <Layers className={`w-3.5 h-3.5 ${currentTab === 'templates' ? 'text-amber-600' : 'text-amber-500'}`} />
                  <span>Templates</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${currentTab === 'templates' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>{counts.templates || 0}</span>
              </button>
            </div>
          </div>

          {/* GROUPE 3: ZONES & EQUIPES */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
              <Factory className="w-3.5 h-3.5" />
              <span>Zones & Équipes</span>
            </div>
            <div className="space-y-0.5">
              {/* Zones */}
              <button
                onClick={() => navTo('zones')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition ${
                  currentTab === 'zones'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold">Zones</span>
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                    currentTab === 'zones'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {counts.zones || 0}
                </span>
              </button>

              {/* Technicians (Auto ID) */}
              <button
                onClick={() => navTo('technicians')}
                className={`w-full flex items-center justify-between px-3 py-1.5 pl-7 rounded-xl text-[12.5px] transition ${
                  currentTab === 'technicians' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  {/*@ts-ignore*/}
                  <Users className={`w-3.5 h-3.5 ${currentTab === 'technicians' ? 'text-blue-600' : 'text-blue-400'}`} />
                  <span>Technicians</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${currentTab === 'technicians' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>{counts.technicians || 0}</span>
              </button>

              {/* Operations (Auto ID) */}
              <button
                onClick={() => navTo('operations')}
                className={`w-full flex items-center justify-between px-3 py-1.5 pl-7 rounded-xl text-[12.5px] transition ${
                  currentTab === 'operations' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  {/*@ts-ignore*/}
                  <Wrench className={`w-3.5 h-3.5 ${currentTab === 'operations' ? 'text-indigo-600' : 'text-indigo-400'}`} />
                  <span>Operations</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${currentTab === 'operations' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>{counts.operations || 0}</span>
              </button>
            </div>
          </div>

          {/* GROUPE 4: TOOLS & DOCUMENTATION */}
          <div className="space-y-1 pt-1 border-t border-slate-800/60">
            <button
              onClick={() => navTo('nexus')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition ${
                currentTab === 'nexus'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <GitBranch className="w-4 h-4 text-emerald-600" />
                <span>Nexus Matrix</span>
              </span>
            </button>
            <button
              onClick={() => navTo('guide')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition ${
                currentTab === 'guide'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Guide d'utilisation</span>
              </span>
            </button>
          </div>
        </div>

        {/* Guided Tip Box */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
          <div className="rounded-xl bg-slate-800/80 p-3 text-[11.5px] leading-relaxed text-slate-500 border border-slate-700/60 shadow-sm space-y-1.5">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-[12px]">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Astuce guidée</span>
            </div>
            <div className="text-slate-500 text-[11px] leading-relaxed">
              • <b className="text-slate-200">Zones</b> : cliquez sur les compteurs (Techs, Ops, Machines) pour naviguer filtré.
            </div>
            <div className="text-slate-400 text-[10.5px] leading-relaxed">
              • <b className="text-slate-200">Twin Tables</b> : Stock et Machines Registered regroupent l'intégralité avec badges cliquables.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
