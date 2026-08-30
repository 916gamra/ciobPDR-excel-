import React from 'react';
import DashboardSkeleton from './DashboardSkeleton';
import { 
  StockSkeleton, 
  SortieRapideSkeleton, 
  MachinesRegisteredSkeleton, 
  OperationsSkeleton, 
  GenericTableSkeleton,
  GuidanceCardsTableSkeleton
} from './PageSkeletons';

export default function LoadingSkeleton({ currentTab = 'dashboard' }) {
  switch (currentTab) {
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'stock':
      return <StockSkeleton />;
    case 'mouvements':
      return <SortieRapideSkeleton />;
    case 'machines':
      return <MachinesRegisteredSkeleton />;
    case 'operations':
      return <OperationsSkeleton />;
    case 'types':
    case 'designations':
    case 'diagnostics':
    case 'families':
    case 'machineTemplates':
      return <GuidanceCardsTableSkeleton />;
    case 'zones':
    case 'technicians':
      return <GenericTableSkeleton />;
    default:
      return <DashboardSkeleton />;
  }
}


