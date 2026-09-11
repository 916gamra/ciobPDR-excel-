import {
  useState,
  useRef,
  useEffect,
  startTransition,
} from 'react';
import { useGmaoState } from './hooks/useGmaoState';
import { useAppCalculations } from './hooks/useAppCalculations';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useAppExcelOperations } from './hooks/useAppExcelOperations';
import { useAppComplexHandlers } from './hooks/useAppComplexHandlers';

import { SplashScreen, LoginScreen } from './presentation/pages/auth';
import OfflineIndicator from './presentation/components/common/OfflineIndicator';
import ErrorBoundary from './presentation/components/common/ErrorBoundary';

import { backupService } from './utils/BackupService';
import { Logger } from './core/logger/LoggerService';
import { monitor } from './utils/PerformanceMonitor';

import { useAuth } from './context/AuthContext';
import MainLayout from './presentation/components/layout/MainLayout';
import AppModals from './presentation/modals/AppModals';
import AppRouter from './presentation/router/AppRouter';

export default function App() {
  const { user: currentUser } = useAuth();

  // Splash & Auth States - Display splash screen on application start/reload
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Toast State
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { message: '', type: 'success' } : prev));
    }, 4500);
  };

  // Navigation Tab State - Defaults to 'dashboard', persists active tab while logged in
  const [currentTab, setCurrentTab] = useState(() => {
    try {
      return localStorage.getItem('gmao_active_tab') || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  useEffect(() => {
    try {
      if (currentTab) {
        localStorage.setItem('gmao_active_tab', currentTab);
      }
    } catch {
      /* ignore storage error */
    }
  }, [currentTab]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Core Data States
  const gmaoState = useGmaoState();
  const {
    types,
    setTypes,
    designations,
    setDesignations,
    families,
    setFamilies,
    templates,
    setTemplates,
    blueprints,
    setBlueprints,
    machines,
    setMachines,
    warehouseItems,
    setWarehouseItems,
    zones,
    setZones,
    technicians,
    setTechnicians,
    operations,
    setOperations,
    mouvements,
    setMouvements,
    rawStock,
    setRawStock,
    compFamilies,
    setCompFamilies,
    compTemplates,
    setCompTemplates,
    partTypes,
    setPartTypes,
    partDesignations,
    setPartDesignations,
  } = gmaoState;

  // Auto Backup and Performance Monitor Initialization
  useEffect(() => {
    Logger.info('Application started');
    monitor.measure('App_Init', () => {
      backupService.startAutoBackup(() => {
        return {
          Stock_Actuel: rawStock,
          Mouvement: mouvements,
          Machines_Registered: machines,
          Warehouse_Items: warehouseItems,
          Families: families,
          Templates: templates,
          Zones: zones,
          Diagnostics: designations,
          Types: types,
          Technicians: technicians,
          Operations: operations,
        };
      }, currentUser?.name || currentUser?.nom || 'system');
    });

    return () => {
      backupService.stopAutoBackup();
    };
  }, [
    currentUser,
    rawStock,
    mouvements,
    machines,
    warehouseItems,
    families,
    templates,
    zones,
    designations,
    types,
    technicians,
    operations,
  ]);

  // Calculations: Real-time stock status, fallbacks, warehouse totals, KPIs
  const {
    stockItems,
    effectiveDesignations,
    effectiveFamilies,
    effectiveTemplates,
    diagnostics,
    warehouseItemsComputed,
    stockKPIs,
  } = useAppCalculations({
    rawStock,
    mouvements,
    designations,
    families,
    templates,
    warehouseItems,
  });

  // Smart Navigation & Filter States
  const { filters, navigation } = useAppNavigation({ setCurrentTab });

  // Modal States
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserModalType, setAddUserModalType] = useState('TECHNICIEN');
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);

  // Add / Update / Delete Entity Handlers
  const handleAddCompFamily = (newFam) => {
    setCompFamilies((prev) => [...prev, newFam]);
  };

  const handleAddCompTemplate = (newTpl) => {
    setCompTemplates((prev) => [...prev, newTpl]);
  };

  const handleAddPartType = (newType) => {
    setPartTypes((prev) => [...prev, newType]);
  };

  const handleAddPartDesignation = (newDesig) => {
    setPartDesignations((prev) => [...prev, newDesig]);
  };

  const handleAddType = (newType) => {
    setTypes((prev) => [...prev, newType]);
  };

  const handleAddDesignation = (newDesig) => {
    const newItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `desig_${Date.now()}`,
      ref: newDesig.ref,
      designation: newDesig.designation,
      type: newDesig.id_type,
      id_type: newDesig.id_type,
      stockInitial: Number(newDesig.stockInitial) || 0,
      seuil: Number(newDesig.seuil) || 3,
      emplacement: newDesig.emplacement || 'A1-R1',
    };
    setRawStock((prev) => [newItem, ...prev]);
    setDesignations((prev) => [newItem, ...(prev || [])]);
  };

  const handleAddFamily = (newFam) => {
    setFamilies((prev) => [...prev, newFam]);
  };

  const handleAddTemplate = (newTpl) => {
    setTemplates((prev) => [...prev, newTpl]);
  };

  const handleAddBlueprint = (newBlueprint) => {
    setBlueprints((prev) => [...prev, newBlueprint]);
    showToast(`Blueprint "${newBlueprint.id_blueprint}" ajouté avec succès !`);
  };

  const handleUpdateBlueprint = (id, updated) => {
    setBlueprints((prev) =>
      prev.map((b) => (b.id_blueprint === id ? { ...b, ...updated } : b))
    );
    showToast(`Blueprint "${id}" mis à jour avec succès !`);
  };

  const handleDeleteBlueprint = (id) => {
    setBlueprints((prev) => prev.filter((b) => b.id_blueprint !== id));
    showToast(`Blueprint "${id}" supprimé avec succès !`, 'info');
  };

  const handleAddZone = (newZone) => {
    setZones((prev) => [...prev, newZone]);
  };

  const {
    handleUpdateZone,
    handleDeleteZone,
    handleUpdateOperation,
    handleDeleteOperation,
    handleUpdateMachine,
    handleDeleteMachine,
    handleUpdateType,
    handleDeleteType,
    handleUpdateDesignation,
    handleDeleteDesignation,
    handleUpdateFamily,
    handleDeleteFamily,
    handleUpdateCompFamily,
    handleDeleteCompFamily,
    handleUpdateCompTemplate,
    handleDeleteCompTemplate,
    handleUpdatePartType,
    handleDeletePartType,
    handleUpdatePartDesignation,
    handleDeletePartDesignation,
    handleUpdateTemplate,
    handleDeleteTemplate,
    handleAddTechnician,
    handleUpdateTechnician,
    handleDeleteTechnician,
    handleAddOperation,
    handleAddMachine,
    handleAddArticle,
    handleAddMouvement,
    handleUpdateArticle,
    handleUpdateMouvement,
    handleDeleteMouvement,
    handleAddWarehouseItem,
    handleUpdateWarehouseItem,
    handleDeleteWarehouseItem,
    handleDirectAdjustStock,
    handleQuickSortie,
  } = useAppComplexHandlers({
    zones,
    setZones,
    operations,
    setOperations,
    technicians,
    setTechnicians,
    machines,
    setMachines,
    mouvements,
    setMouvements,
    types,
    setTypes,
    rawStock,
    setRawStock,
    designations,
    setDesignations,
    families,
    setFamilies,
    templates,
    setTemplates,
    compFamilies,
    setCompFamilies,
    compTemplates,
    setCompTemplates,
    partTypes,
    setPartTypes,
    partDesignations,
    setPartDesignations,
    warehouseItems,
    setWarehouseItems,
    showToast,
    setCurrentTab,
  });

  // Excel & File System Direct Operations
  const {
    linkedFileName,
    handleExportExcel,
    handleImportFile,
    handleDirectFileLink,
    handleDirectSave,
  } = useAppExcelOperations({
    state: gmaoState,
    stockItems,
    diagnostics,
    showToast,
    fileInputRef,
  });

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <ErrorBoundary>
      <MainLayout
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        counts={{
          stock: stockItems.length,
          types: types.length,
          designations: effectiveDesignations.length,
          diagnostics: effectiveDesignations.length,
          machines: machines.length,
          families: effectiveFamilies.length,
          templates: effectiveTemplates.length,
          blueprints: (blueprints || []).length,
          warehouse: warehouseItemsComputed.length,
          entrepot: warehouseItemsComputed.length,
          compFamilies: (compFamilies || []).length,
          compTemplates: (compTemplates || []).length,
          partTypes: (partTypes || []).length,
          partDesignations: (partDesignations || []).length,
          zones: zones.length,
          technicians: technicians.length,
          operations: operations.length,
        }}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        fileInputRef={fileInputRef}
        handleImportFile={handleImportFile}
        handleExportExcel={handleExportExcel}
        linkedFileName={linkedFileName}
        onDirectLink={handleDirectFileLink}
        onDirectSave={handleDirectSave}
      >
        <AppRouter
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          props={{
            dashboard: {
              stockItems,
              machines,
              warehouseItems: warehouseItemsComputed,
              mouvements,
              types,
              diagnostics,
              zones,
              technicians,
              operations,
              stockKPIs,
              onNavigateToStock: () => startTransition(() => setCurrentTab('stock')),
              onNavigateToMachines: () => startTransition(() => setCurrentTab('machines')),
              onNavigateToWarehouse: () => startTransition(() => setCurrentTab('entrepot')),
              onNavigateToSortie: () => startTransition(() => setCurrentTab('sortie')),
              onNavigateToZones: () => startTransition(() => setCurrentTab('zones')),
              onNavigateToUsers: () => startTransition(() => setCurrentTab('utilisateurs')),
              onNavigateToSettings: () => startTransition(() => setCurrentTab('settings')),
              onQuickSortie: handleQuickSortie,
              onAddMouvement: handleAddMouvement,
              onUpdateMouvement: handleUpdateMouvement,
              onDeleteMouvement: handleDeleteMouvement,
              onExportExcel: handleExportExcel,
            },
            stock: {
              stockItems,
              mouvements,
              stockSearch: filters.stockSearch,
              setStockSearch: filters.setStockSearch,
              stockTypeFilter: filters.stockTypeFilter,
              setStockTypeFilter: filters.setStockTypeFilter,
              stockAlertOnly: filters.stockAlertOnly,
              setStockAlertOnly: filters.setStockAlertOnly,
              types,
              zones,
              machines,
              technicians,
              operations,
              onOpenAddArticle: () => setShowAddArticleModal(true),
              onQuickSortie: handleQuickSortie,
              onAddMouvement: handleAddMouvement,
              onUpdateArticle: handleUpdateArticle,
              onDirectAdjustStock: handleDirectAdjustStock,
              stockKPIs,
              onNavigateToType: navigation.handleNavigateToStockFiltered,
            },
            sortie: {
              mouvements,
              stockItems,
              warehouseItems: warehouseItemsComputed,
              families,
              templates,
              types,
              diagnostics,
              zones,
              machines,
              technicians,
              operations,
              onAddMouvement: handleAddMouvement,
              onUpdateMouvement: handleUpdateMouvement,
              onDeleteMouvement: handleDeleteMouvement,
              onDirectAdjustStock: handleDirectAdjustStock,
              onAddWarehouseItem: handleAddWarehouseItem,
              onUpdateWarehouseItem: handleUpdateWarehouseItem,
              onOpenAddArticle: () => setShowAddArticleModal(true),
              onOpenAddMachine: () => setShowAddMachineModal(true),
              onOpenAddZone: () => setShowAddZoneModal(true),
              onOpenAddTech: () => {
                setAddUserModalType('TECHNICIEN');
                setShowAddUserModal(true);
              },
              onOpenAddChef: () => {
                setAddUserModalType('RESPONSABLE');
                setShowAddUserModal(true);
              },
              onOpenAddOperator: () => {
                setAddUserModalType('OPERATEUR');
                setShowAddUserModal(true);
              },
              onNavigateToWarehouse: () => startTransition(() => setCurrentTab('entrepot')),
              onNavigateToStockFilteredByRef: navigation.handleNavigateToStockFilteredByRef,
            },
            entrepot: {
              warehouseItems: warehouseItemsComputed,
              mouvements,
              compFamilies,
              compTemplates,
              partTypes,
              partDesignations,
              machines,
              whSearch: filters.whSearch,
              setWhSearch: filters.setWhSearch,
              whFamilyFilter: filters.whFamilyFilter,
              setWhFamilyFilter: filters.setWhFamilyFilter,
              whTemplateFilter: filters.whTemplateFilter,
              setWhTemplateFilter: filters.setWhTemplateFilter,
              whTypeFilter: filters.whTypeFilter,
              setWhTypeFilter: filters.setWhTypeFilter,
              whNatureFilter: filters.whNatureFilter,
              setWhNatureFilter: filters.setWhNatureFilter,
              onAddWarehouseItem: handleAddWarehouseItem,
              onUpdateWarehouseItem: handleUpdateWarehouseItem,
              onDeleteWarehouseItem: handleDeleteWarehouseItem,
              onNavigateToCompFamilies: navigation.handleNavigateToCompFamilies,
              onNavigateToCompTemplates: navigation.handleNavigateToCompTemplates,
              onNavigateToPartTypes: navigation.handleNavigateToPartTypes,
              onNavigateToPartDesignations: navigation.handleNavigateToPartDesignations,
              onNavigateToEntrepotByPart: navigation.handleNavigateToEntrepotByPart,
            },
            types: {
              types,
              search: filters.whSearch,
              setSearch: filters.setWhSearch,
              onAddType: handleAddType,
              onUpdateType: handleUpdateType,
              onDeleteType: handleDeleteType,
              onNavigateToDesignations: navigation.handleNavigateToDesignationsFiltered,
            },
            designations: {
              designations,
              types,
              search: filters.whSearch,
              setSearch: filters.setWhSearch,
              onAddDesignation: handleAddDesignation,
              onUpdateDesignation: handleUpdateDesignation,
              onDeleteDesignation: handleDeleteDesignation,
              onOpenAddTypeModal: () => startTransition(() => setCurrentTab('types')),
              onNavigateToDiag: navigation.handleNavigateToDiagFiltered,
            },
            machines: {
              machines,
              families: effectiveFamilies,
              templates: effectiveTemplates,
              blueprints,
              zones,
              technicians,
              mouvements,
              search: filters.mchSearch,
              setSearch: filters.setMchSearch,
              mchFamilyFilter: filters.mchFamilyFilter,
              setMchFamilyFilter: filters.setMchFamilyFilter,
              mchTemplateFilter: filters.mchTemplateFilter,
              setMchTemplateFilter: filters.setMchTemplateFilter,
              mchZoneFilter: filters.mchZoneFilter,
              setMchZoneFilter: filters.setMchZoneFilter,
              onAddMachine: handleAddMachine,
              onUpdateMachine: handleUpdateMachine,
              onDeleteMachine: handleDeleteMachine,
              onOpenAddMachine: () => setShowAddMachineModal(true),
              onNavigateToFamily: navigation.handleNavigateToFamilyFiltered,
              onNavigateToTemplate: navigation.handleNavigateToTemplatesFiltered,
              onNavigateToZone: navigation.handleNavigateToMachinesByZone,
              onNavigateToBlueprints: navigation.handleNavigateToBlueprintsFiltered,
            },
            compFamilies: {
              compFamilies,
              search: filters.whSearch,
              setSearch: filters.setWhSearch,
              onAddCompFamily: handleAddCompFamily,
              onUpdateCompFamily: handleUpdateCompFamily,
              onDeleteCompFamily: handleDeleteCompFamily,
              onNavigateToCompTemplates: navigation.handleNavigateToCompTemplates,
            },
            compTemplates: {
              compTemplates,
              compFamilies,
              search: filters.whSearch,
              setSearch: filters.setWhSearch,
              familyFilter: filters.compTemplateFamilyFilter,
              setFamilyFilter: filters.setCompTemplateFamilyFilter,
              onAddCompTemplate: handleAddCompTemplate,
              onUpdateCompTemplate: handleUpdateCompTemplate,
              onDeleteCompTemplate: handleDeleteCompTemplate,
              onOpenAddFamilyModal: () => startTransition(() => setCurrentTab('comp_families')),
              onNavigateToEntrepotByComp: navigation.handleNavigateToEntrepotByComp,
            },
            partTypes: {
              partTypes,
              partDesignations,
              warehouseItems: warehouseItemsComputed,
              search: filters.whSearch,
              setSearch: filters.setWhSearch,
              onAddPartType: handleAddPartType,
              onUpdatePartType: handleUpdatePartType,
              onDeletePartType: handleDeletePartType,
              onNavigateToPartDesignations: navigation.handleNavigateToPartDesignations,
              onNavigateToEntrepotByType: navigation.handleNavigateToEntrepotByType,
            },
            partDesignations: {
              partDesignations,
              partTypes,
              warehouseItems: warehouseItemsComputed,
              search: filters.whSearch,
              setSearch: filters.setWhSearch,
              partDesignationTypeFilter: filters.partDesignationTypeFilter,
              setPartDesignationTypeFilter: filters.setPartDesignationTypeFilter,
              onAddPartDesignation: handleAddPartDesignation,
              onUpdatePartDesignation: handleUpdatePartDesignation,
              onDeletePartDesignation: handleDeletePartDesignation,
              onNavigateToPartTypes: navigation.handleNavigateToPartTypes,
              onNavigateToEntrepotByPart: navigation.handleNavigateToEntrepotByPart,
              onNavigateToEntrepotByType: navigation.handleNavigateToEntrepotByType,
            },
            families: {
              families: effectiveFamilies,
              templates: effectiveTemplates,
              machines,
              search: filters.whSearch,
              setSearch: filters.setWhSearch,
              onAddFamily: handleAddFamily,
              onUpdateFamily: handleUpdateFamily,
              onDeleteFamily: handleDeleteFamily,
              onNavigateToTemplatesFiltered: navigation.handleNavigateToTemplatesFiltered,
              onNavigateToMachinesByFamily: navigation.handleNavigateToMachinesByFamily,
            },
            templates: {
              templates: effectiveTemplates,
              families: effectiveFamilies,
              machines,
              search: filters.whSearch,
              setSearch: filters.setWhSearch,
              templateFamilyFilter: filters.templateFamilyFilter,
              setTemplateFamilyFilter: filters.setTemplateFamilyFilter,
              onAddTemplate: handleAddTemplate,
              onUpdateTemplate: handleUpdateTemplate,
              onDeleteTemplate: handleDeleteTemplate,
              onOpenAddFamilyModal: () => startTransition(() => setCurrentTab('families')),
              onNavigateToMachinesByTemplate: navigation.handleNavigateToMachinesByTemplate,
              onNavigateToFamilyFiltered: navigation.handleNavigateToFamilyFiltered,
              onNavigateToBlueprints: navigation.handleNavigateToBlueprintsFiltered,
            },
            blueprints: {
              blueprints,
              templates: effectiveTemplates,
              families: effectiveFamilies,
              machines,
              compFamilies,
              compTemplates,
              partTypes,
              partDesignations,
              stockItems,
              warehouseItems: warehouseItemsComputed,
              mouvements,
              blueprintFamilyFilter: filters.blueprintFamilyFilter,
              setBlueprintFamilyFilter: filters.setBlueprintFamilyFilter,
              blueprintTemplateFilter: filters.blueprintTemplateFilter,
              setBlueprintTemplateFilter: filters.setBlueprintTemplateFilter,
              onAddBlueprint: handleAddBlueprint,
              onUpdateBlueprint: handleUpdateBlueprint,
              onDeleteBlueprint: handleDeleteBlueprint,
              onOpenAddFamilyModal: () => startTransition(() => setCurrentTab('families')),
              onOpenAddTemplateModal: () => startTransition(() => setCurrentTab('templates')),
              onNavigateToMachinesByTemplate: navigation.handleNavigateToMachinesByTemplate,
              onNavigateToFamily: navigation.handleNavigateToFamilyFiltered,
              onNavigateToTemplate: navigation.handleNavigateToTemplatesFiltered,
              onNavigateToTab: (tab) => startTransition(() => setCurrentTab(tab)),
            },
            zones: {
              zones,
              machines,
              technicians,
              operations,
              search: filters.whSearch,
              setSearch: filters.setWhSearch,
              onAddZone: handleAddZone,
              onUpdateZone: handleUpdateZone,
              onDeleteZone: handleDeleteZone,
              onNavigateToTechs: navigation.handleNavigateToTechsByZone,
              onNavigateToOps: navigation.handleNavigateToOpsByZone,
              onNavigateToMachines: navigation.handleNavigateToMachinesByZone,
              onOpenAddZoneModal: () => setShowAddZoneModal(true),
            },
            utilisateurs: {
              technicians,
              operations,
              zones,
              mouvements,
              techZoneFilter: filters.techZoneFilter,
              setTechZoneFilter: filters.setTechZoneFilter,
              opZoneFilter: filters.opZoneFilter,
              setOpZoneFilter: filters.setOpZoneFilter,
              onAddTechnician: handleAddTechnician,
              onUpdateTechnician: handleUpdateTechnician,
              onDeleteTechnician: handleDeleteTechnician,
              onAddOperation: handleAddOperation,
              onUpdateOperation: handleUpdateOperation,
              onDeleteOperation: handleDeleteOperation,
              onOpenAddArticle: () => setShowAddArticleModal(true),
              onOpenAddMachine: () => setShowAddMachineModal(true),
              onOpenAddZone: () => setShowAddZoneModal(true),
              onOpenAddTechModal: () => {
                setAddUserModalType('TECHNICIEN');
                setShowAddUserModal(true);
              },
              onOpenAddRespModal: () => {
                setAddUserModalType('RESPONSABLE');
                setShowAddUserModal(true);
              },
              onOpenAddOpModal: () => {
                setAddUserModalType('OPERATEUR');
                setShowAddUserModal(true);
              },
            },
            settings: {
              rawStock,
              stockItems,
              machines,
              mouvements,
              types,
              designations,
              zones,
              technicians,
              operations,
              compFamilies,
              compTemplates,
              partTypes,
              partDesignations,
              families: effectiveFamilies,
              templates: effectiveTemplates,
              warehouseItems: warehouseItemsComputed,
              onNavigateToWarehouse: () => startTransition(() => setCurrentTab('entrepot')),
            },
            nexus: {
              types,
              diagnostics,
              families: effectiveFamilies,
              templates: effectiveTemplates,
              blueprints,
              zones,
              technicians,
              operations,
              machines,
              stockItems,
              compFamilies,
              compTemplates,
              partTypes,
              partDesignations,
              warehouseItems: warehouseItemsComputed,
              mouvements,
              onNavigate: (tab) => startTransition(() => setCurrentTab(tab)),
            },
            guide: {},
          }}
        />

        <AppModals
          showAddArticleModal={showAddArticleModal}
          setShowAddArticleModal={setShowAddArticleModal}
          showAddMachineModal={showAddMachineModal}
          setShowAddMachineModal={setShowAddMachineModal}
          showAddUserModal={showAddUserModal}
          setShowAddUserModal={setShowAddUserModal}
          addUserModalType={addUserModalType}
          setAddUserModalType={setAddUserModalType}
          showAddZoneModal={showAddZoneModal}
          setShowAddZoneModal={setShowAddZoneModal}
          types={types}
          stockItems={stockItems}
          effectiveFamilies={effectiveFamilies}
          effectiveTemplates={effectiveTemplates}
          blueprints={blueprints}
          zones={zones}
          technicians={technicians}
          machines={machines}
          operations={operations}
          handleAddArticle={handleAddArticle}
          handleAddMachine={handleAddMachine}
          handleUpdateMachine={handleUpdateMachine}
          handleDeleteMachine={handleDeleteMachine}
          handleAddTechnician={handleAddTechnician}
          handleAddOperation={handleAddOperation}
          handleAddZone={handleAddZone}
          setCurrentTab={setCurrentTab}
          toast={toast}
          setToast={setToast}
        />

        {/* 100% Offline Status Indicator */}
        <OfflineIndicator />
      </MainLayout>
    </ErrorBoundary>
  );
}
