import {
  useState,
  useRef,
  useEffect,
} from 'react';
import { useGmaoState } from './hooks/useGmaoState';
import { useAppCalculations } from './hooks/useAppCalculations';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useAppExcelOperations } from './hooks/useAppExcelOperations';
import { useAppModals } from './hooks/useAppModals';
import { useAppEntityActions } from './hooks/useAppEntityActions';

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
import { useAppRouterProps } from './presentation/router/useAppRouterProps';

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
    designations,
    families,
    templates,
    blueprints,
    machines,
    warehouseItems,
    zones,
    technicians,
    operations,
    mouvements,
    rawStock,
    compFamilies,
    compTemplates,
    partTypes,
    partDesignations,
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
  const modals = useAppModals();

  // Consolidated Entity Actions
  const entityActions = useAppEntityActions({
    gmaoState,
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

  const routerProps = useAppRouterProps({
    setCurrentTab,
    stockItems,
    machines,
    warehouseItemsComputed,
    mouvements,
    types,
    diagnostics,
    zones,
    technicians,
    operations,
    stockKPIs,
    filters,
    navigation,
    effectiveFamilies,
    effectiveTemplates,
    blueprints,
    compFamilies,
    compTemplates,
    partTypes,
    partDesignations,
    rawStock,
    designations,
    families,
    templates,
    modals,
    handlers: entityActions,
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
          props={routerProps}
        />

        <AppModals
          {...modals}
          types={types}
          stockItems={stockItems}
          effectiveFamilies={effectiveFamilies}
          effectiveTemplates={effectiveTemplates}
          blueprints={blueprints}
          zones={zones}
          technicians={technicians}
          machines={machines}
          operations={operations}
          handleAddArticle={entityActions.handleAddArticle}
          handleAddMachine={entityActions.handleAddMachine}
          handleUpdateMachine={entityActions.handleUpdateMachine}
          handleDeleteMachine={entityActions.handleDeleteMachine}
          handleAddTechnician={entityActions.handleAddTechnician}
          handleAddOperation={entityActions.handleAddOperation}
          handleAddZone={entityActions.handleAddZone}
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
