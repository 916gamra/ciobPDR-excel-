import { useEffect, useRef, useCallback } from 'react';
import { storageService } from '../utils/storageService';
import { indexedDBService } from '../utils/indexedDBService';
import { Logger } from '../core/logger/LoggerService';
import { SparePartApplicationService } from '../application/services/SparePartApplicationService.js';
import { MachineApplicationService } from '../application/services/MachineApplicationService.js';
import { TaskApplicationService } from '../application/services/TaskApplicationService.js';

/**
 * Handles persistence, debounced storage, multi-tab sync, and Enterprise database sync
 */
export function useGmaoPersistence({
  state,
  setters,
  validators,
}) {
  const {
    types,
    designations,
    families,
    templates,
    blueprints,
    compFamilies,
    compTemplates,
    partTypes,
    partDesignations,
    machines,
    warehouseItems,
    zones,
    technicians,
    operations,
    mouvements,
    rawStock,
  } = state;

  const {
    setTypes,
    setDesignations,
    setFamilies,
    setTemplates,
    setBlueprints,
    setCompFamilies,
    setCompTemplates,
    setPartTypes,
    setPartDesignations,
    setMachines,
    setWarehouseItems,
    setZones,
    setTechnicians,
    setOperations,
    setMouvements,
    setRawStock,
  } = setters;

  const { isValidMachineFamilies, isValidMachineTemplates } = validators;

  const saveTimer = useRef(null);
  const lastSavedState = useRef(null);

  const saveAllState = useCallback(() => {
    const fullState = {
      types,
      designations,
      families,
      templates,
      blueprints,
      compFamilies,
      compTemplates,
      partTypes,
      partDesignations,
      machines,
      warehouseItems,
      zones,
      technicians,
      operations,
      mouvements,
      rawStock,
    };

    // Avoid saving if state has not changed
    const currentStateStr = JSON.stringify(fullState);
    if (lastSavedState.current === currentStateStr) {
      return;
    }
    lastSavedState.current = currentStateStr;

    // Save unified state to LocalStorage
    storageService.setItem('gmao_full_state_v1', fullState);
    storageService.setItem('gmao_blueprints_v1', blueprints);
    storageService.setItem('gmao_comp_families_v1', compFamilies);
    storageService.setItem('gmao_comp_templates_v1', compTemplates);
    storageService.setItem('gmao_part_types_v1', partTypes);
    storageService.setItem('gmao_part_designations_v1', partDesignations);

    // High performance single-transaction batch save to IndexedDB
    indexedDBService.setItemsBatch({
      gmao_full_state_v1: fullState,
      gmao_blueprints_v1: blueprints,
      gmao_warehouse_items_v1: warehouseItems,
      gmao_mouvements: mouvements,
      gmao_raw_stock_v6: rawStock,
    });
  }, [
    types,
    designations,
    families,
    templates,
    blueprints,
    compFamilies,
    compTemplates,
    partTypes,
    partDesignations,
    machines,
    warehouseItems,
    zones,
    technicians,
    operations,
    mouvements,
    rawStock,
  ]);

  // Debounce with 1000ms delay to eliminate redundant I/O writes
  useEffect(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(() => {
      saveAllState();
    }, 1000);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [saveAllState]);

  // Real-time Multi-Window / Multi-Tab Synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'gmao_full_state_v1' && e.newValue) {
        try {
          const fresh = storageService.getItem('gmao_full_state_v1');
          if (fresh) {
            if (fresh.types) setTypes(fresh.types);
            if (fresh.designations) setDesignations(fresh.designations);
            if (fresh.families && isValidMachineFamilies(fresh.families)) setFamilies(fresh.families);
            if (fresh.templates && isValidMachineTemplates(fresh.templates)) setTemplates(fresh.templates);
            if (fresh.blueprints && Array.isArray(fresh.blueprints)) setBlueprints(fresh.blueprints);
            if (fresh.compFamilies) setCompFamilies(fresh.compFamilies);
            if (fresh.compTemplates) setCompTemplates(fresh.compTemplates);
            if (fresh.partTypes) setPartTypes(fresh.partTypes);
            if (fresh.partDesignations) setPartDesignations(fresh.partDesignations);
            if (fresh.machines) setMachines(fresh.machines);
            if (fresh.warehouseItems) setWarehouseItems(fresh.warehouseItems);
            if (fresh.zones) setZones(fresh.zones);
            if (fresh.technicians) setTechnicians(fresh.technicians);
            if (fresh.operations) setOperations(fresh.operations);
            if (fresh.mouvements) setMouvements(fresh.mouvements);
            if (fresh.rawStock) setRawStock(fresh.rawStock);
          }
        } catch (err) {
          Logger.error('Failed to sync across tabs:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [
    isValidMachineFamilies,
    isValidMachineTemplates,
    setTypes,
    setDesignations,
    setFamilies,
    setTemplates,
    setBlueprints,
    setCompFamilies,
    setCompTemplates,
    setPartTypes,
    setPartDesignations,
    setMachines,
    setWarehouseItems,
    setZones,
    setTechnicians,
    setOperations,
    setMouvements,
    setRawStock,
  ]);

  // Enterprise IndexedDB Sync
  useEffect(() => {
    let isMounted = true;
    let isSyncing = false;

    async function syncEnterpriseDb() {
      if (isSyncing) return;
      isSyncing = true;

      try {
        const sparePartService = new SparePartApplicationService();
        const machineService = new MachineApplicationService();
        const taskService = new TaskApplicationService();

        const [idbParts, idbMachines, idbTasks] = await Promise.all([
          sparePartService.listSpareParts(),
          machineService.listMachines(),
          taskService.listTasks(),
        ]);

        if (isMounted && idbParts.length === 0 && rawStock.length > 0) {
          const existingRefs = new Set(idbParts.map((p) => p.ref || p.id));
          const partsToCreate = [];
          for (const p of rawStock) {
            if (!existingRefs.has(p.ref) && !existingRefs.has(p.id)) {
              const partId =
                p.id ||
                p.ref ||
                (typeof crypto !== 'undefined' && crypto.randomUUID
                  ? crypto.randomUUID()
                  : `part_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
              partsToCreate.push({ ...p, id: partId });
              existingRefs.add(p.ref);
            }
          }
          if (partsToCreate.length > 0) {
            await Promise.all(partsToCreate.map((p) => sparePartService.createSparePart(p)));
          }
        } else if (isMounted && idbParts.length > 0 && rawStock.length === 0) {
          setRawStock(idbParts);
        }

        if (isMounted && idbMachines.length === 0 && machines.length > 0) {
          const existingMachines = new Set(idbMachines.map((m) => m.id_machine_registered || m.id));
          const machinesToCreate = [];
          for (const m of machines) {
            if (!existingMachines.has(m.id_machine_registered) && !existingMachines.has(m.id)) {
              const mchId =
                m.id ||
                m.id_machine_registered ||
                (typeof crypto !== 'undefined' && crypto.randomUUID
                  ? crypto.randomUUID()
                  : `mch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
              machinesToCreate.push({
                ...m,
                id: mchId,
                id_machine_registered: m.id_machine_registered || mchId,
              });
              existingMachines.add(m.id_machine_registered);
            }
          }
          if (machinesToCreate.length > 0) {
            await Promise.all(machinesToCreate.map((m) => machineService.createMachine(m)));
          }
        } else if (isMounted && idbMachines.length > 0 && machines.length === 0) {
          setMachines(idbMachines);
        }

        if (isMounted && idbTasks.length === 0 && mouvements.length > 0) {
          const existingTasks = new Set(idbTasks.map((t) => t.id || t.code_bon));
          const tasksToCreate = [];
          for (const t of mouvements) {
            if (!existingTasks.has(t.id) && !existingTasks.has(t.code_bon)) {
              const taskId =
                t.id ||
                t.code_bon ||
                (typeof crypto !== 'undefined' && crypto.randomUUID
                  ? crypto.randomUUID()
                  : `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
              tasksToCreate.push({ ...t, id: taskId });
              existingTasks.add(t.code_bon);
            }
          }
          if (tasksToCreate.length > 0) {
            await Promise.all(tasksToCreate.map((t) => taskService.createTask(t)));
          }
        } else if (isMounted && idbTasks.length > 0 && mouvements.length === 0) {
          setMouvements(idbTasks);
        }
      } catch (err) {
        Logger.error('Enterprise DB Sync Error:', err);
      } finally {
        isSyncing = false;
      }
    }

    syncEnterpriseDb();

    return () => {
      isMounted = false;
    };
  }, [machines, mouvements, rawStock, setMachines, setMouvements, setRawStock]);
}
