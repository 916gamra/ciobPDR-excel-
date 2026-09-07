import { lazy, Suspense } from 'react';
import ErrorBoundary from '../components/common/ErrorBoundary';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const DashboardView = lazy(() => import('../pages/dashboard/DashboardView'));
const StockView = lazy(() => import('../pages/stock/StockView'));
const TypeView = lazy(() => import('../pages/referentiel/TypeView'));
const DesignationView = lazy(() => import('../pages/referentiel/DesignationView'));
const MachinesRegisteredView = lazy(() => import('../pages/machines/MachinesRegisteredView'));
const EntrepotView = lazy(() => import('../pages/warehouse/EntrepotView'));
const CompFamilyView = lazy(() => import('../pages/referentiel/CompFamilyView'));
const CompTemplateView = lazy(() => import('../pages/referentiel/CompTemplateView'));
const PartTypeView = lazy(() => import('../pages/referentiel/PartTypeView'));
const PartDesignationView = lazy(() => import('../pages/referentiel/PartDesignationView'));
const FamilyView = lazy(() => import('../pages/machines/FamilyView'));
const TemplatesView = lazy(() => import('../pages/machines/TemplatesView'));
const ZonesView = lazy(() => import('../pages/referentiel/ZonesView'));
const UtilisateursView = lazy(() => import('../pages/utilisateurs/UtilisateursView'));
const SortieRapideView = lazy(() => import('../pages/movements/SortieRapideView'));
const SettingsView = lazy(() => import('../pages/settings/SettingsView'));
const NexusView = lazy(() => import('../pages/system/NexusView'));
const GuideView = lazy(() => import('../pages/system/GuideView'));

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
