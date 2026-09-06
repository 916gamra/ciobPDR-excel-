import React from 'react';
import ErrorBoundary from '../components/common/ErrorBoundary';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

import DashboardView from '../pages/dashboard/DashboardView';
import StockView from '../pages/stock/StockView';
import TypeView from '../pages/types/TypeView';
import DesignationView from '../pages/designations/DesignationView';
import MachinesRegisteredView from '../pages/machines/MachinesRegisteredView';
import EntrepotView from '../pages/entrepot/EntrepotView';
import CompFamilyView from '../pages/comp-families/CompFamilyView';
import CompTemplateView from '../pages/comp-templates/CompTemplateView';
import PartTypeView from '../pages/part-types/PartTypeView';
import PartDesignationView from '../pages/part-designations/PartDesignationView';
import FamilyView from '../pages/families/FamilyView';
import TemplatesView from '../pages/templates/TemplatesView';
import ZonesView from '../pages/zones/ZonesView';
import UtilisateursView from '../pages/utilisateurs/UtilisateursView';
import SortieRapideView from '../pages/sortie-rapide/SortieRapideView';
import SettingsView from '../pages/settings/SettingsView';
import NexusView from '../pages/system/NexusView';
import GuideView from '../pages/system/GuideView';

export default function AppRouter({
  currentTab, setCurrentTab, props
}) {
  return (
    <>
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
    </>
  );
}
