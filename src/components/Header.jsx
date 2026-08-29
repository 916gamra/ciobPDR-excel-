import React from 'react';
import { Menu, Upload, Download, RefreshCw } from 'lucide-react';

export default function Header({
  currentTab,
  setMobileMenuOpen,
  fileInputRef,
  handleImportFile,
  handleExportExcel,
  onResetData
}) {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard • Vue Consolidée';
      case 'sortie':
        return 'Sortie Rapide • Formulaire Gouverné';
      case 'stock':
        return 'Stock Actuel • Colonnes Excel exactes';
      case 'types':
        return 'Types d\'Articles • Nomenclature Parent';
      case 'designations':
      case 'diagnostics':
        return 'Désignations d\'Articles • Catalogue (Templates)';
      case 'machines':
        return 'Machines Registered • Twin Principal';
      case 'families':
        return 'Familles de Machines • Nomenclature';
      case 'templates':
        return 'Templates & Modèles • Nomenclature';
      case 'zones':
        return 'Zones & Ateliers • Cartographie';
      case 'technicians':
        return 'Techniciens • Équipe de Maintenance';
      case 'operations':
        return 'Opérations & Tâches • Répertoire';
      case 'nexus':
        return 'Nexus Matrix • Matrice Relationnelle';
      case 'guide':
        return 'Guide d\'Utilisation • Règles & Formules';
      default:
        return 'GMAO Light V5';
    }
  };

  const getTabSubtitle = () => {
    switch (currentTab) {
      case 'stock':
        return 'Source: /mnt/data/gmao_light_data.json • SUMIFS =E+F-G recalculé en JS';
      case 'types':
        return 'Niveau parent des articles (Family) — cliquez sur "Nb Désignations" ou "Nb Articles"';
      case 'designations':
      case 'diagnostics':
        return 'Catalogue des modèles d\'articles (Templates) avec ID/Ref, Désignation et Type parent';
      case 'machines':
        return 'Catalogue complet des équipements avec liaison Famille, Template, Zone et Technicien';
      case 'families':
        return 'Groupes technologiques majeurs — transition vers Templates ou Machines';
      case 'templates':
        return 'Modèles d\'équipements — transition ciblée (Famille + Template) vers Machines';
      case 'zones':
        return 'Secteurs d\'usine — compteurs cliquables vers Techniciens, Opérations et Machines';
      case 'technicians':
        return 'ID automatique TECH-01, TECH-02... généré sans saisie manuelle';
      case 'operations':
        return 'ID automatique OP-01, OP-02... rattaché à une zone';
      case 'sortie':
        return 'Formulaire gouverné selon Action_ID avec impact direct sur le Stock';
      case 'dashboard':
        return 'Indicateurs clés de performance, alertes de réapprovisionnement et flux récents';
      case 'nexus':
        return 'Cartographie des interconnexions entre zones, machines, techniciens et pièces';
      case 'guide':
        return 'Workflow ordonnancé et formules Excel standardisées';
      default:
        return 'Hub GMAO Light avec intégrité référentielle';
    }
  };

  return (
    <header className="h-[68px] bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
            {getTabTitle()}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 hidden sm:block truncate max-w-xl mt-0.5">
            {getTabSubtitle()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFile}
          accept=".json,.xlsx,.xls"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          title="Importer un fichier JSON ou Excel"
        >
          <Upload className="w-3.5 h-3.5 text-slate-600" />
          <span>Importer</span>
        </button>
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-white bg-slate-900 hover:bg-black transition shadow-sm"
          title="Exporter toutes les tables sous Excel"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter Excel</span>
        </button>
      </div>
    </header>
  );
}
