import { useState } from 'react';
import { storageService } from '../utils/storageService';
import initialData from '../initialData.json';
import {
  INITIAL_WAREHOUSE_ITEMS,
  INITIAL_COMP_FAMILIES,
  INITIAL_COMP_TEMPLATES,
  INITIAL_PART_TYPES,
  INITIAL_PART_DESIGNATIONS,
} from '../data/seedData';

/**
 * Hook managing Entrepôt items, component families/templates, and part types/designations
 */
export function useWarehouseSubState(groupedState = {}) {
  const [warehouseItems, setWarehouseItems] = useState(() => {
    return (
      groupedState.warehouseItems ||
      storageService.getItem('gmao_warehouse_items_v1') ||
      (initialData.Warehouse_Items?.length
        ? initialData.Warehouse_Items
        : INITIAL_WAREHOUSE_ITEMS)
    );
  });

  const [compFamilies, setCompFamilies] = useState(() => {
    return (
      groupedState.compFamilies ||
      storageService.getItem('gmao_comp_families_v1') ||
      INITIAL_COMP_FAMILIES
    );
  });

  const [compTemplates, setCompTemplates] = useState(() => {
    return (
      groupedState.compTemplates ||
      storageService.getItem('gmao_comp_templates_v1') ||
      INITIAL_COMP_TEMPLATES
    );
  });

  const [partTypes, setPartTypes] = useState(() => {
    return (
      groupedState.partTypes ||
      storageService.getItem('gmao_part_types_v1') ||
      INITIAL_PART_TYPES
    );
  });

  const [partDesignations, setPartDesignations] = useState(() => {
    return (
      groupedState.partDesignations ||
      storageService.getItem('gmao_part_designations_v1') ||
      INITIAL_PART_DESIGNATIONS
    );
  });

  return {
    warehouseItems,
    setWarehouseItems,
    compFamilies,
    setCompFamilies,
    compTemplates,
    setCompTemplates,
    partTypes,
    setPartTypes,
    partDesignations,
    setPartDesignations,
  };
}
