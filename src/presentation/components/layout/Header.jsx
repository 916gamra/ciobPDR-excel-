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
    <header className="sticky top-0 z-30 bg-[#FAFAF9]/85 backdrop-blur-xl border-b border-transparent lg:border-zinc-100 select-none transition-all">
      <div className="px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Button & Parent Module Title badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:text-black shadow-2xs cursor-pointer"
            aria-label="Ouvrir le menu"
          >
            <Menu size={18} />
          </button>

          {/* Module Indicator Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200/90 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-zinc-900 tracking-tight">
              {activeParent.label}
            </span>
          </div>
        </div>

        {/* Center: Finexy/Quixotic Style Top Bar Pill Navigation */}
        <div className="flex items-center justify-center flex-1 max-w-2xl mx-auto">
          {childTabs.length > 0 && (
            <div className="inline-flex items-center p-1.5 rounded-full bg-[#EFEFEE] border border-[#E9E9E8] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] overflow-x-auto max-w-full scrollbar-none">
              {childTabs.map((child) => {
                const isActive = currentTab === child.id;

                return (
                  <button
                    key={child.id}
                    onClick={() => setCurrentTab(child.id)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12.5px] font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#111111] text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/50'
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-xs cursor-pointer"
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
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-slate-900 hover:bg-black transition shadow-xs cursor-pointer"
            title="Exporter sous Excel"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Export Excel</span>
          </button>

          {/* Action Icon Circles */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-black hover:border-zinc-300 transition shadow-2xs cursor-pointer"
            title="Importer JSON / Excel"
          >
            <Upload size={16} />
          </button>

          <button
            className="w-9 h-9 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-black hover:border-zinc-300 transition shadow-2xs relative cursor-pointer"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF4D4D] rounded-full ring-2 ring-white" />
          </button>

          {/* User Profile Avatar Pill */}
          <div className="flex items-center gap-2 pl-1 border-l border-zinc-200/80 ml-1">
            <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs overflow-hidden ring-2 ring-white shadow-2xs shrink-0">
              {currentUser?.avatar || 'A'}
            </div>
            <div className="hidden xl:block text-left leading-tight pr-1">
              <div className="text-[12px] font-bold text-zinc-900 truncate">
                {currentUser?.name || 'Achraf'}
              </div>
              <div className="text-[10px] text-zinc-500 font-medium truncate">
                {currentUser?.role || 'Admin'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
