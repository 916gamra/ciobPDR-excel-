import { useState, useEffect } from 'react';
import { storageService } from '../utils/storageService';
import { indexedDBService } from '../utils/indexedDBService';
import initialData from '../initialData.json';
import {
  INITIAL_TYPES,
  INITIAL_DIAGNOSTICS,
  INITIAL_FAMILIES,
  INITIAL_TEMPLATES,
  INITIAL_MACHINES_REGISTERED,
  INITIAL_ZONES,
  INITIAL_TECHNICIANS,
  INITIAL_OPERATIONS,
} from '../data/seedData';
import { safeNum } from '../utils/formulaEngine';

/**
 * Custom hook to manage the core application state and its persistence.
 */
export function useGmaoState() {
  const [groupedState] = useState(() => storageService.getItem('gmao_full_state_v1') || {});

  const [types, setTypes] = useState(() => {
    if (groupedState.types) return groupedState.types;
    const saved = storageService.getItem('gmao_types_v4');
    if (saved) return saved;
    const set = new Set();
    (initialData.Stock_Actuel || []).forEach((item) => {
      const t = String(
        item['Désignation'] || item['D\u00c3\u00a9signation'] || item.type || ''
      ).trim();
      if (t && t !== '3' && !/^\d+$/.test(t)) set.add(t);
    });
    if (!set.size) {
      [
        'Foret',
        'Tenaille',
        'Vis',
        'Roulement',
        'Courroie',
        'Raccord',
        'Cheville',
        'Capteur',
        'teflon',
      ].forEach((t) => set.add(t));
    }
    return Array.from(set).map((t) => ({ id_type: t, libelle: t }));
  });

  const [families, setFamilies] = useState(() => {
    return (
      groupedState.families ||
      storageService.getItem('gmao_families') ||
      (initialData.Families?.length ? initialData.Families : INITIAL_FAMILIES)
    );
  });

  const [templates, setTemplates] = useState(() => {
    return (
      groupedState.templates ||
      storageService.getItem('gmao_templates') ||
      (initialData.Templates?.length ? initialData.Templates : INITIAL_TEMPLATES)
    );
  });

  const [machines, setMachines] = useState(() => {
    return (
      groupedState.machines ||
      storageService.getItem('gmao_machines') ||
      (initialData.Machines_Registered?.length
        ? initialData.Machines_Registered
        : INITIAL_MACHINES_REGISTERED)
    );
  });

  const [zones, setZones] = useState(() => {
    return (
      groupedState.zones ||
      storageService.getItem('gmao_zones') ||
      (initialData.Zones?.length ? initialData.Zones : INITIAL_ZONES)
    );
  });

  const [technicians, setTechnicians] = useState(() => {
    return (
      groupedState.technicians ||
      storageService.getItem('gmao_technicians') ||
      (initialData.Technicians?.length ? initialData.Technicians : INITIAL_TECHNICIANS)
    );
  });

  const [operations, setOperations] = useState(() => {
    return (
      groupedState.operations ||
      storageService.getItem('gmao_operations') ||
      (initialData.Operations?.length ? initialData.Operations : INITIAL_OPERATIONS)
    );
  });

  const [mouvements, setMouvements] = useState(() => {
    const saved = groupedState.mouvements || storageService.getItem('gmao_mouvements');
    const rawList = saved ? saved : initialData.Mouvement || [];
    return rawList.map((m, idx) => ({
      id: m.id || idx + 1,
      code_bon:
        m.code_bon ||
        m['Code_Bon'] ||
        m['Code Bon'] ||
        m['N° Bon'] ||
        `Bon-${String(idx + 1).padStart(3, '0')}`,
      num_commande:
        m.num_commande ||
        m['N° Commande'] ||
        m['Num_Commande'] ||
        m['N° Demande'] ||
        m['Code Demande'] ||
        m.num_demande ||
        '',
      date:
        m.date || (m.Date ? String(m.Date).split('T')[0] : new Date().toISOString().split('T')[0]),
      ref: m.ref || m['Référence'] || m['Reference'] || '',
      quantite: safeNum(
        m.quantite != null ? m.quantite : m['Quantité'] != null ? m['Quantité'] : m['Quantite'],
        1
      ),
      type: m.type || m['Type (Entrée/Sortie)'] || 'Sortie',
      action_id: m.action_id || m['Action_ID'] || 'CORRECTIVE',
      technicien: m.technicien || m.id_technician || 'Rachid',
      id_zone: m.id_zone || 'ZONE-01',
      id_machine_registered: m.id_machine_registered || '',
      operation: m.operation || m.id_operation || '',
      commentaire: m.commentaire || m['Commentaire / Motif'] || '',
      demandeur: m.demandeur || m.Demandeur || '',
      fournisseur: m.fournisseur || m.Fournisseur || '',
      emplacement_reception: m.emplacement_reception || m['Emplacement'] || '',
      usage_type: m.usage_type || '',
    }));
  });

  const [rawStock, setRawStock] = useState(() => {
    const saved = groupedState.rawStock || storageService.getItem('gmao_raw_stock_v6');
    const rawList = saved ? saved : initialData.Stock_Actuel || [];
    return rawList
      .map((s, idx) => ({
        id: s.id || idx + 1,
        ref: s.ref || s['Référence'] || s['Reference'] || `REF-UNK-${idx}`,
        designation:
          s.designation || s['Désignation'] || s['D\u00c3\u00a9signation'] || 'Sans désignation',
        id_type: s.id_type || s.type || s['Type'] || s['Désignation'] || '',
        id_diag: s.id_diag || s.diag || s.Diag || '',
        type: s.type || s.id_type || 'Divers',
        stockInitial: s.stockInitial,
        seuil: s.seuil,
        emplacement: s.emplacement,
      }))
      .sort((a, b) =>
        a.ref.localeCompare(b.ref, undefined, { numeric: true, sensitivity: 'base' })
      );
  });

  const [designations, setDesignations] = useState(() => {
    return (
      groupedState.designations ||
      storageService.getItem('gmao_designations_v2') ||
      (initialData.Diagnostics?.length ? initialData.Diagnostics : INITIAL_DIAGNOSTICS)
    );
  });

  // Save to LocalStorage and IndexedDB (Debounced to avoid I/O bottlenecks during fast updates)
  useEffect(() => {
    const timer = setTimeout(() => {
      const fullState = {
        types,
        designations,
        families,
        templates,
        machines,
        zones,
        technicians,
        operations,
        mouvements,
        rawStock,
      };
      // Grouped state save (Task 10)
      storageService.setItem('gmao_full_state_v1', fullState);

      // High capacity IndexedDB backup
      indexedDBService.setItem('gmao_full_state_v1', fullState);

      // Keep individual DB backups for compatibility with export/import tools if they rely on it
      indexedDBService.setItem('gmao_mouvements', mouvements);
      indexedDBService.setItem('gmao_raw_stock_v6', rawStock);
    }, 250);
    return () => clearTimeout(timer);
  }, [
    types,
    designations,
    families,
    templates,
    machines,
    zones,
    technicians,
    operations,
    mouvements,
    rawStock,
  ]);

  return {
    types,
    setTypes,
    designations,
    setDesignations,
    families,
    setFamilies,
    templates,
    setTemplates,
    machines,
    setMachines,
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
  };
}
