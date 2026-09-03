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
  INITIAL_WAREHOUSE_ITEMS,
  INITIAL_ZONES,
  INITIAL_TECHNICIANS,
  INITIAL_OPERATIONS,
} from '../data/seedData';
import { safeNum } from '../utils/formulaEngine';

// Build a fast lookup dictionary from initial baseline stock data to ensure original quantities are never lost
const INITIAL_STOCK_LOOKUP = new Map();
(initialData.Stock_Actuel || []).forEach((item, idx) => {
  const refKey = String(item.Ref || item.ref || item['Référence'] || item['Reference'] || '').trim().toLowerCase();
  const desigKey = String(item['Désignation'] || item.designation || '').trim().toLowerCase();

  let initQty = 0;
  if (item.stockInitial != null && item.stockInitial !== '' && !isNaN(Number(item.stockInitial))) {
    initQty = Number(item.stockInitial);
  } else if (item['Stock Initial'] != null && item['Stock Initial'] !== '' && !isNaN(Number(item['Stock Initial']))) {
    initQty = Number(item['Stock Initial']);
  } else if (item['Stock Actuel'] != null && item['Stock Actuel'] !== '' && !isNaN(Number(item['Stock Actuel']))) {
    initQty = Number(item['Stock Actuel']);
  } else if (typeof item.Type === 'number' && !isNaN(item.Type)) {
    initQty = item.Type;
  } else if (!isNaN(Number(item.Type)) && item.Type !== '' && item.Type !== null && typeof item.Type !== 'string') {
    initQty = Number(item.Type);
  }

  const dataObj = {
    qty: initQty,
    ref: item.Ref || item.ref || item['Référence'] || item['Reference'] || `ART${String(idx + 1).padStart(3, '0')}`,
    designation: item.Ref || item.designation || item['Désignation'] || `Piece ${idx + 1}`,
    type: item['Désignation'] || item.type || 'Divers',
    seuil: Number(item["Seuil d'Alerte"] || item.seuil) || 3,
    emplacement: item.Emplacement || item.emplacement || `A${(idx % 8) + 1}-R${(idx % 6) + 1}`,
  };

  if (refKey) INITIAL_STOCK_LOOKUP.set(refKey, dataObj);
  if (desigKey && !INITIAL_STOCK_LOOKUP.has(desigKey)) INITIAL_STOCK_LOOKUP.set(desigKey, dataObj);
});

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

  const [warehouseItems, setWarehouseItems] = useState(() => {
    return (
      groupedState.warehouseItems ||
      storageService.getItem('gmao_warehouse_items_v1') ||
      (initialData.Warehouse_Items?.length
        ? initialData.Warehouse_Items
        : INITIAL_WAREHOUSE_ITEMS)
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
      num_commande: (() => {
        const direct =
          m.num_commande ||
          m['N° Commande'] ||
          m['Num_Commande'] ||
          m['N° Demande'] ||
          m['Code Demande'] ||
          m.num_demande ||
          m['N° OT'] ||
          m['Num_OT'] ||
          m['OT'] ||
          m.ot ||
          m.num_ot;
        if (direct && String(direct).trim() !== '' && String(direct).trim().toUpperCase() !== 'NULL' && String(direct).trim().toUpperCase() !== 'UNDEFINED') {
          return String(direct).trim();
        }
        // Smart inference from commentary: e.g. "OT-1234", "CMD-042", "BC-99"
        const com = m.commentaire || m['Commentaire / Motif'] || '';
        if (com) {
          const match = String(com).match(/\b(OT[-_ ]?[0-9A-Za-z]+|CMD[-_ ]?[0-9A-Za-z]+|BC[-_ ]?[0-9A-Za-z]+|DA[-_ ]?[0-9A-Za-z]+)\b/i);
          if (match) return match[1].toUpperCase();
        }
        // If it is a Commande type
        const mType = m.type || m['Type (Entrée/Sortie)'] || '';
        const mBon = m.code_bon || m['Code_Bon'] || m['Code Bon'] || '';
        if (String(mType).toUpperCase().includes('COMMANDE') && mBon) {
          return `CMD-${String(mBon).replace(/^Bon-/i, '')}`;
        }
        return 'INCONNU';
      })(),
      date:
        m.date || (m.Date ? String(m.Date).split('T')[0] : new Date().toISOString().split('T')[0]),
      ref: m.ref || m['Référence'] || m['Reference'] || '',
      quantite: safeNum(
        m.quantite != null ? m.quantite : m['Quantité'] != null ? m['Quantité'] : m['Quantite'],
        1
      ),
      type: (() => {
        const rawType = m.type || m['Type (Entrée/Sortie)'] || '';
        const str = String(rawType).trim();
        const lower = str.toLowerCase();
        if (!str || lower === 'sortie' || lower === 'sortie interne') return 'Sortie Interne';
        if (lower === 'bon de sortie' || lower === 'sortie externe') return 'Bon de Sortie';
        if (lower === 'entrée interne' || lower === 'entree interne') return 'Entrée Interne';
        if (lower === 'entrée externe' || lower === 'entree externe') return 'Entrée Externe';
        if (lower === 'entrée' || lower === 'entree') {
          const act = String(m.action_id || m['Action_ID'] || '').toUpperCase();
          if (act === 'REAPPRO' || m.fournisseur || m.Fournisseur) return 'Entrée Externe';
          return 'Entrée Interne';
        }
        if (lower.includes('commande') || lower.includes('achat')) return 'COMMANDE';
        if (lower.includes('sort')) return 'Sortie Interne';
        if (lower.includes('entr')) return 'Entrée Interne';
        return str;
      })(),
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
    const rawList = saved && Array.isArray(saved) && saved.length > 0 ? saved : initialData.Stock_Actuel || [];

    return rawList
      .map((s, idx) => {
        const itemRef = String(s.ref || s.Ref || s['Référence'] || s['Reference'] || '').trim();
        const refKey = itemRef.toLowerCase();
        
        // Find baseline by ref first
        let baseline = INITIAL_STOCK_LOOKUP.get(refKey);

        const itemDesig = String(
          s.designation || s.Ref || s.ref || s['Désignation'] || s['D\u00c3\u00a9signation'] || ''
        ).trim();
        const desigKey = itemDesig.toLowerCase();
        
        if (!baseline) {
          baseline = INITIAL_STOCK_LOOKUP.get(desigKey);
        }

        let stockInitial = 0;
        if (s.stockInitial != null && s.stockInitial !== '' && !isNaN(Number(s.stockInitial))) {
          stockInitial = Number(s.stockInitial);
        } else if (s['Stock Initial'] != null && s['Stock Initial'] !== '' && !isNaN(Number(s['Stock Initial']))) {
          stockInitial = Number(s['Stock Initial']);
        } else if (s['Stock Actuel'] != null && s['Stock Actuel'] !== '' && !isNaN(Number(s['Stock Actuel']))) {
          stockInitial = Number(s['Stock Actuel']);
        } else if (typeof s.Type === 'number' && !isNaN(s.Type)) {
          stockInitial = s.Type;
        } else if (s.Type != null && !isNaN(Number(s.Type)) && s.Type !== '' && typeof s.Type !== 'string') {
          stockInitial = Number(s.Type);
        }

        // If stored quantity was 0, null, or lost, restore from authentic Excel baseline data
        if (stockInitial <= 0 && baseline && baseline.qty > 0) {
          stockInitial = baseline.qty;
        }

        const finalRef = itemRef || (baseline ? baseline.ref : `ART${String(idx + 1).padStart(3, '0')}`);
        
        // Fix for mixed up designation and type:
        // If this item is in the baseline, we strongly prefer the baseline's designation and type 
        // to recover the lost information.
        let finalDesignation = itemDesig;
        let finalType = s.type || s.id_type || s['Désignation'];
        
        if (baseline) {
           finalDesignation = baseline.designation;
           finalType = baseline.type;
        } else {
           finalDesignation = finalDesignation || finalRef;
           finalType = finalType || 'Divers';
        }

        const finalSeuil =
          Number(s.seuil != null ? s.seuil : s["Seuil d'Alerte"] != null ? s["Seuil d'Alerte"] : (baseline ? baseline.seuil : 3)) || 3;
        const finalEmplacement =
          s.emplacement ||
          s.Emplacement ||
          (baseline ? baseline.emplacement : `A${(idx % 8) + 1}-R${(idx % 6) + 1}`);

        return {
          id: s.id || idx + 1,
          ref: finalRef,
          designation: finalDesignation,
          id_type: s.id_type || finalType,
          id_diag: s.id_diag || s.diag || s.Diag || '',
          type: finalType,
          stockInitial,
          seuil: finalSeuil,
          emplacement: finalEmplacement,
        };
      })
      .sort((a, b) =>
        String(a.ref).localeCompare(String(b.ref), undefined, { numeric: true, sensitivity: 'base' })
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
        warehouseItems,
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
      indexedDBService.setItem('gmao_warehouse_items_v1', warehouseItems);
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
    warehouseItems,
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
  };
}
