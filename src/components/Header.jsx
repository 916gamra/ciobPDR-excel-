import React from 'react';
import { Menu, Upload, Download, RefreshCw, LogOut, User } from 'lucide-react';

export default function Header({
  currentTab,
  setMobileMenuOpen,
  fileInputRef,
  handleImportFile,
  handleExportExcel,
  onResetData,
  currentUser,
  onLogout
}) {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard • Vue Consolidée';
      case 'sortie':
        return 'Sortie & Entrée Rapide • Formulaire Gouverné';
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
        return 'Opérations & Chefs d\'Équipe • Répertoire & Rôles';
      case 'nexus':
        return 'Nexus Matrix • Matrice Relationnelle';
      case 'guide':
        return 'Guide d\'Utilisation • Règles & Formules';
      case 'settings':
        return 'Paramètres • Configuration Système';
      default:
        return 'GMAO Light V5';
    }
  };

  const getTabSubtitle = () => {
    switch (currentTab) {
      case 'settings':
        return {
          source: '/mnt/data/gmao_light_data.json • Paramètres',
          desc: 'Configuration générale, préférences d\'interface et état du stockage'
        };
      case 'dashboard':
        return {
          source: '/mnt/data/gmao_light_data.json • Feuille: Dashboard',
          desc: 'Indicateurs consolidés, alertes de réapprovisionnement et flux récents'
        };
      case 'sortie':
        return {
          source: '/mnt/data/gmao_light_data.json • Feuille: Mouvements',
          desc: 'Flux central gouverné par Action_ID avec impact direct sur Stock Actuel'
        };
      case 'stock':
        return {
          source: '/mnt/data/gmao_light_data.json • Feuille: Stock_Actuel',
          desc: 'Tableau central des articles avec calcul temps réel des stocks et alertes'
        };
      case 'types':
        return {
          source: '/mnt/data/gmao_light_data.json • Feuille: Types',
          desc: 'Nomenclature Parent • Liens dynamiques vers Désignations et Articles'
        };
      case 'designations':
      case 'diagnostics':
        return {
          source: '/mnt/data/gmao_light_data.json • Feuille: Diagnostic',
          desc: 'Catalogue des modèles d\'articles • Lié au Type parent et aux Articles'
        };
      case 'machines':
        return {
          source: '/mnt/data/gmao_light_data.json • Feuille: Machines_Registered',
          desc: 'Twin central • Intégration Famille, Template, Zone et Technicien'
        };
      case 'families':
        return {
          source: '/mnt/data/gmao_light_data.json • Feuille: Families',
          desc: 'Groupes technologiques majeurs • Transitions vers Templates et Machines'
        };
      case 'templates':
        return {
          source: '/mnt/data/gmao_light_data.json • Feuille: Templates',
          desc: 'Modèles d\'équipements • Filtrage croisé Famille + Modèle vers Parc'
        };
      case 'zones':
        return {
          source: '/mnt/data/gmao_light_data.json • Feuille: Zones',
          desc: 'Cartographie usine • Compteurs interactifs vers Techs, Ops et Machines'
        };
      case 'technicians':
        return {
          source: '/mnt/data/gmao_light_data.json • Feuille: Techniciens',
          desc: 'Génération automatique Auto-ID TECH-xx • Affectation par zone et interventions'
        };
      case 'operations':
        return {
          source: '/mnt/data/gmao_light_data.json • Feuille: Operations',
          desc: 'Double Auto-ID : OP-xx (Opérateurs) & CHEF-xx (Chefs d\'Équipe) • Traçabilité par zone'
        };
      case 'nexus':
        return {
          source: '/mnt/data/gmao_light_data.json • Matrice Relationnelle',
          desc: 'Schéma d\'intégrité référentielle et cartographie des 3 piliers GMAO Light'
        };
      case 'guide':
        return {
          source: '/mnt/data/gmao_light_data.json • Manuel & Formules',
          desc: 'Workflow ordonnancé, règles d\'intégrité et syntaxe des formules'
        };
      default:
        return {
          source: '/mnt/data/gmao_light_data.json • Hub GMAO Light',
          desc: 'Architecture relationnelle avec intégrité référentielle'
        };
    }
  };

  const currentTabInfo = getTabSubtitle();

  return (
    <header className="h-[68px] bg-white border-b border-slate-200 px-4 md:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 tracking-tight shrink-0">
              {getTabTitle()}
            </h1>
            {currentTabInfo.source && (
              <span className="hidden lg:inline-flex items-center font-mono text-[10.5px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[280px] xl:max-w-md shadow-2xs shrink-0">
                Source: {currentTabInfo.source}
              </span>
            )}
          </div>
          {currentTabInfo.desc && (
            <p className="text-xs text-slate-500 hidden sm:block truncate max-w-xl xl:max-w-2xl mt-0.5">
              {currentTabInfo.desc}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFile}
          accept=".json,.xlsx,.xls"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition shrink-0"
          title="Importer un fichier JSON ou Excel"
        >
          <Upload className="w-3.5 h-3.5 text-slate-600" />
          <span>Importer</span>
        </button>
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-white bg-slate-900 hover:bg-black transition shadow-sm shrink-0"
          title="Exporter toutes les tables sous Excel"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter Excel</span>
        </button>

        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1 shrink-0">
            <div className="hidden md:flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/80 px-2.5 py-1 rounded-xl">
              <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                {currentUser.avatar || 'RM'}
              </div>
              <div className="text-left leading-tight">
                <div className="text-[11px] font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[9.5px] text-emerald-800 font-semibold">{currentUser.titleFr || currentUser.role}</div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
