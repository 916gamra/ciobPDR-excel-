import { lazy, Suspense } from 'react';
import ErrorBoundary from '../components/common/ErrorBoundary';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

// Helper to auto-retry dynamic import if network or temporary chunk reload issue occurs
function lazyRetry(importFn) {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.warn('[AppRouter] Chunk load error, retrying import...', error);
      // Wait 300ms and try one more time before failing
      await new Promise((resolve) => setTimeout(resolve, 300));
      return await importFn();
    }
  });
}

const DashboardView = lazyRetry(() => import('../pages/dashboard/DashboardView'));
const StockView = lazyRetry(() => import('../pages/stock/StockView'));
const TypeView = lazyRetry(() => import('../pages/referentiel/TypeView'));
const DesignationView = lazyRetry(() => import('../pages/referentiel/DesignationView'));
const MachinesRegisteredView = lazyRetry(() => import('../pages/machines/MachinesRegisteredView'));
const EntrepotView = lazyRetry(() => import('../pages/warehouse/EntrepotView'));
const CompFamilyView = lazyRetry(() => import('../pages/referentiel/CompFamilyView'));
const CompTemplateView = lazyRetry(() => import('../pages/referentiel/CompTemplateView'));
const PartTypeView = lazyRetry(() => import('../pages/referentiel/PartTypeView'));
const PartDesignationView = lazyRetry(() => import('../pages/referentiel/PartDesignationView'));
const FamilyView = lazyRetry(() => import('../pages/machines/FamilyView'));
const TemplatesView = lazyRetry(() => import('../pages/machines/TemplatesView'));
const BlueprintMachineView = lazyRetry(() => import('../pages/machines/BlueprintMachineView'));
const ZonesView = lazyRetry(() => import('../pages/referentiel/ZonesView'));
const UtilisateursView = lazyRetry(() => import('../pages/utilisateurs/UtilisateursView'));
const SortieRapideView = lazyRetry(() => import('../pages/movements/SortieRapideView'));
const SettingsView = lazyRetry(() => import('../pages/settings/SettingsView'));
const NexusView = lazyRetry(() => import('../pages/system/NexusView'));
const GuideView = lazyRetry(() => import('../pages/system/GuideView'));

export default function AppRouter({
  currentTab, setCurrentTab: _setCurrentTab, props
}) {
  return (
    <Suspense fallback={<LoadingSkeleton currentTab={currentTab} />}>
      {currentTab === 'dashboard' && (
        <ErrorBoundary>
          <DashboardView {...props.dashboard} />
        </ErrorBoundary>
      )}

      {currentTab === 'stock' && (
        <ErrorBoundary>
          <StockView {...props.stock} />
        </ErrorBoundary>
      )}

      {currentTab === 'sortie' && (
        <ErrorBoundary>
          <SortieRapideView {...props.sortie} />
        </ErrorBoundary>
      )}

      {currentTab === 'entrepot' && (
        <ErrorBoundary>
          <EntrepotView {...props.entrepot} />
        </ErrorBoundary>
      )}

      {currentTab === 'types' && (
        <ErrorBoundary>
          <TypeView {...props.types} />
        </ErrorBoundary>
      )}

      {currentTab === 'designations' && (
        <ErrorBoundary>
          <DesignationView {...props.designations} />
        </ErrorBoundary>
      )}

      {currentTab === 'machines' && (
        <ErrorBoundary>
          <MachinesRegisteredView {...props.machines} />
        </ErrorBoundary>
      )}

      {currentTab === 'comp_families' && (
        <ErrorBoundary>
          <CompFamilyView {...props.compFamilies} />
        </ErrorBoundary>
      )}

      {currentTab === 'comp_templates' && (
        <ErrorBoundary>
          <CompTemplateView {...props.compTemplates} />
        </ErrorBoundary>
      )}

      {currentTab === 'part_types' && (
        <ErrorBoundary>
          <PartTypeView {...props.partTypes} />
        </ErrorBoundary>
      )}

      {currentTab === 'part_designations' && (
        <ErrorBoundary>
          <PartDesignationView {...props.partDesignations} />
        </ErrorBoundary>
      )}

      {currentTab === 'families' && (
        <ErrorBoundary>
          <FamilyView {...props.families} />
        </ErrorBoundary>
      )}

      {currentTab === 'templates' && (
        <ErrorBoundary>
          <TemplatesView {...props.templates} />
        </ErrorBoundary>
      )}

      {currentTab === 'blueprints' && (
        <ErrorBoundary>
          <BlueprintMachineView {...props.blueprints} />
        </ErrorBoundary>
      )}

      {currentTab === 'zones' && (
        <ErrorBoundary>
          <ZonesView {...props.zones} />
        </ErrorBoundary>
      )}

      {currentTab === 'utilisateurs' && (
        <ErrorBoundary>
          <UtilisateursView {...props.utilisateurs} />
        </ErrorBoundary>
      )}

      {currentTab === 'settings' && (
        <ErrorBoundary>
          <SettingsView {...props.settings} />
        </ErrorBoundary>
      )}

      {currentTab === 'nexus' && (
        <ErrorBoundary>
          <NexusView {...props.nexus} />
        </ErrorBoundary>
      )}

      {currentTab === 'guide' && (
        <ErrorBoundary>
          <GuideView {...props.guide} />
        </ErrorBoundary>
      )}
    </Suspense>
  );
}
