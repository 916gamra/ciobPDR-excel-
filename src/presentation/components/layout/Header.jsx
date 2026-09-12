import {
  Menu,
  Upload,
  Download,
  Link,
  Save,
  FileSpreadsheet,
  Bell
} from 'lucide-react';
import PWAInstallButton from '../common/PWAInstallButton';
import { getParentModuleForTab } from './navConfig';

export default function Header({
  currentTab,
  setCurrentTab,
  setMobileMenuOpen,
  fileInputRef,
  handleImportFile,
  handleExportExcel,
  linkedFileName,
  onDirectLink,
  onDirectSave,
  currentUser,
}) {
  const activeParent = getParentModuleForTab(currentTab);
  const childTabs = activeParent.children || [];

  return (
    <header className="sticky top-2 sm:top-3 z-30 w-[calc(100%-0.75rem)] sm:w-[calc(100%-1.25rem)] lg:w-[calc(100%-1.5rem)] max-w-[1840px] mx-auto rounded-[22px] sm:rounded-full bg-white/95 backdrop-blur-xl border border-zinc-200/90 shadow-[0_12px_32px_-6px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] select-none transition-all my-2 sm:my-3">
      <div className="px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Left: Desktop Brand Pill Capsule + Mobile Menu Button & Parent Module Title badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:text-black shadow-xs hover:shadow-md cursor-pointer transition-all"
            aria-label="Ouvrir le menu"
          >
            <Menu size={18} />
          </button>

          {/* Brand Capsule Pill (Matching Header Pills Style + Exact Mobile Sidebar Branding) */}
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white border border-zinc-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-emerald-300 hover:shadow-[0_4px_14px_rgba(16,185,129,0.12)] transition-all cursor-pointer shrink-0 group"
            title="CIOB GMAO Light - Dashboard"
          >
            {/* Dedicated 3D-styled green Excel workbook SVG Icon */}
            <div className="relative w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-xs shrink-0 ring-2 ring-emerald-500/20 overflow-hidden group-hover:scale-105 transition-transform">
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4px_4px]" />
              <svg
                className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white relative z-10"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="3.5"
                  fill="currentColor"
                  fillOpacity="0.15"
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
                <line
                  x1="9.5"
                  y1="3"
                  x2="9.5"
                  y2="21"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeOpacity="0.6"
                  strokeDasharray="1.5 1.5"
                />
                <line
                  x1="3"
                  y1="9.5"
                  x2="21"
                  y2="9.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeOpacity="0.6"
                  strokeDasharray="1.5 1.5"
                />
                <line
                  x1="3"
                  y1="15.5"
                  x2="21"
                  y2="15.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeOpacity="0.6"
                  strokeDasharray="1.5 1.5"
                />
                <path
                  d="M12.5 7.5L18 16.5M18 7.5L12.5 16.5"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="5" y="6" width="3" height="1.8" rx="0.5" fill="currentColor" />
                <rect x="5" y="11" width="3" height="1.8" rx="0.5" fill="currentColor" />
                <rect x="5" y="16" width="3" height="1.8" rx="0.5" fill="currentColor" />
              </svg>
            </div>

            {/* Brand Title & Subtitle */}
            <div className="text-left leading-tight pr-0.5 hidden sm:block">
              <div className="font-bold text-[13px] tracking-tight text-zinc-900 flex items-center gap-1.5">
                <span>Ciob PDR</span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-700 border border-emerald-500/25">
                  XLS
                </span>
              </div>
              <div className="text-[10px] font-semibold text-emerald-700 tracking-tight">
                Pièces de Rechange & GMAO
              </div>
            </div>
          </button>

          {/* Module Indicator Badge Capsule */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-zinc-900 tracking-tight">
              {activeParent.label}
            </span>
          </div>
        </div>

        {/* Center: Finexy/Quixotic Style Top Bar Pill Navigation with Floating Depth */}
        <div className="flex items-center justify-center flex-1 max-w-2xl mx-auto">
          {childTabs.length > 0 && (
            <div className="inline-flex items-center p-1.5 rounded-full bg-[#EFEFEE] border border-[#E5E5E3] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06),0_2px_10px_rgba(0,0,0,0.03)] overflow-x-auto max-w-full scrollbar-none">
              {childTabs.map((child) => {
                const isActive = currentTab === child.id;
                return (
                  <button
                    key={child.id}
                    onClick={() => setCurrentTab(child.id)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12.5px] font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#111111] text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] scale-[1.02]'
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/60'
                    }`}
                  >
                    {child.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Actions, Excel Integration, Search, Notification & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,.xlsx,.xls"
            className="hidden"
          />
          {/* Direct Link / Direct Save Button */}
          {linkedFileName ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/90 shadow-2xs truncate max-w-[150px]"
                title={`Fichier lié : ${linkedFileName}`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{linkedFileName}</span>
              </span>
              <button
                onClick={onDirectSave}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-[0_2px_8px_rgba(4,120,87,0.25)] cursor-pointer"
                title="Sauvegarder directement dans le fichier lié"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Enregistrer</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onDirectLink}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition shrink-0 cursor-pointer shadow-2xs"
              title="Lier un fichier Excel (.xlsx)"
            >
              <Link className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Lien Direct</span>
            </button>
          )}

          <PWAInstallButton variant="header" />

          {/* Export Excel Pill */}
          <button
            onClick={handleExportExcel}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-slate-900 hover:bg-black transition shadow-[0_2px_8px_rgba(0,0,0,0.18)] cursor-pointer"
            title="Exporter sous Excel"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Export Excel</span>
          </button>

          {/* Action Icon Circles */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-black hover:border-zinc-300 transition shadow-[0_2px_6px_rgba(0,0,0,0.04)] hover:shadow-md cursor-pointer"
            title="Importer JSON / Excel"
          >
            <Upload size={16} />
          </button>

          <button
            className="w-9 h-9 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-black hover:border-zinc-300 transition shadow-[0_2px_6px_rgba(0,0,0,0.04)] hover:shadow-md relative cursor-pointer"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF4D4D] rounded-full ring-2 ring-white" />
          </button>

          {/* User Profile Account Card Pill - Exact match with Mobile/Sidebar Account Card layout & icon */}
          <button
            onClick={() => setCurrentTab('settings')}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-zinc-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-emerald-300 hover:shadow-[0_4px_14px_rgba(16,185,129,0.12)] transition-all cursor-pointer shrink-0 ml-1 group"
            title="Mon Compte / Paramètres"
          >
            {/* Rounded Emerald Avatar Icon matching sidebar */}
            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-extrabold text-[10.5px] flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              {currentUser?.avatar || 'RM'}
            </div>
            {/* User Name & Role matching sidebar typography */}
            <div className="hidden sm:block text-left leading-tight min-w-0 pr-0.5">
              <div className="text-[11.5px] font-bold text-slate-900 truncate">
                {currentUser?.name || 'Achraf'}
              </div>
              <div className="text-[9.5px] font-semibold text-emerald-700 truncate">
                {currentUser?.titleFr || currentUser?.role || 'Administrateur'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
