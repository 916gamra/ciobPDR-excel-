import {
  useState,
  useMemo,
  useRef,
  useEffect,
  startTransition,
} from 'react';
import * as XLSX from 'xlsx';
import { useGmaoState } from './hooks/useGmaoState';
import initialData from './initialData.json';
import {
  INITIAL_FAMILIES,
  INITIAL_TEMPLATES,
} from './data/seedData';

import { SplashScreen, LoginScreen } from './presentation/pages/auth';
import OfflineIndicator from './presentation/components/common/OfflineIndicator';

import { validateImportedData } from './utils/validation';
import { backupService } from './utils/BackupService';
import { logger } from './utils/Logger';
import { monitor } from './utils/PerformanceMonitor';

import { storageService } from './utils/storageService';

import { sanitizeObject } from './utils/sanitize';
import { safeNum, calculateStockStatus } from './utils/formulaEngine';

import { useAuth } from './context/AuthContext';
import { useAppComplexHandlers } from './hooks/useAppComplexHandlers';

import MainLayout from './presentation/components/layout/MainLayout';
import AppModals from './presentation/modals/AppModals';
import AppRouter from './presentation/router/AppRouter';

// Baseline stock lookup dictionary to ensure real quantities and type-based references are permanently preserved
const INITIAL_STOCK_LOOKUP = new Map();
const BASELINE_TYPE_COUNTERS = {};

(initialData.Stock_Actuel || []).forEach((item, idx) => {
  const typeName = String(item['Désignation'] || item.type || 'Divers').trim();
  const lowerType = typeName.toLowerCase();
  BASELINE_TYPE_COUNTERS[lowerType] = (BASELINE_TYPE_COUNTERS[lowerType] || 0) + 1;
  const count = BASELINE_TYPE_COUNTERS[lowerType];
  const pad2 = count < 10 ? `0${count}` : `${count}`;
  const ref = `${typeName}${count}`;
  const refPadded = `${typeName}${pad2}`;
  
  const designation = String(
    item.Ref != null ? item.Ref : item.ref != null ? item.ref : item['Désignation'] || `Article ${idx + 1}`
  ).trim();

  let initQty = 0;
  if (item.stockInitial != null && item.stockInitial !== '' && !isNaN(Number(item.stockInitial))) {
    initQty = Number(item.stockInitial);
  } else if (
    item['Stock Initial'] != null &&
    item['Stock Initial'] !== '' &&
    !isNaN(Number(item['Stock Initial']))
  ) {
    initQty = Number(item['Stock Initial']);
  } else if (
    item['Stock Actuel'] != null &&
    item['Stock Actuel'] !== '' &&
    !isNaN(Number(item['Stock Actuel']))
  ) {
    initQty = Number(item['Stock Actuel']);
  } else if (typeof item.Type === 'number' && !isNaN(item.Type)) {
    initQty = item.Type;
  } else if (
    !isNaN(Number(item.Type)) &&
    item.Type !== '' &&
    item.Type !== null &&
    typeof item.Type !== 'string'
  ) {
    initQty = Number(item.Type);
  }

  const dataObj = {
    id: idx + 1,
    qty: initQty,
    ref,
    refPadded,
    designation,
    type: typeName,
    id_type: typeName,
    seuil: Number(item["Seuil d'Alerte"] || item.seuil) || 3,
    emplacement: item.Emplacement || item.emplacement || `A${(idx % 8) + 1}-R${(idx % 6) + 1}`,
  };

  INITIAL_STOCK_LOOKUP.set(ref.toLowerCase(), dataObj);
  INITIAL_STOCK_LOOKUP.set(refPadded.toLowerCase(), dataObj);
  INITIAL_STOCK_LOOKUP.set(designation.toLowerCase(), dataObj);
  if (item.Ref) {
    INITIAL_STOCK_LOOKUP.set(String(item.Ref).trim().toLowerCase(), dataObj);
  }
});

function ErrorBoundary({ children }) {
  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error captured:', event?.error || event?.message);
    };

    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return children;
}

export default function App() {
  const { user: currentUser } = useAuth();

  // Splash & Auth States - Always display splash screen on application start/reload
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Toast & Direct File Link States
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [linkedFileHandle, setLinkedFileHandle] = useState(null);
  const [linkedFileName, setLinkedFileName] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { message: '', type: 'success' } : prev));
    }, 4500);
  };

  // Navigation - Defaults to 'dashboard', persists active tab while logged in
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
  } = useGmaoState();

  // Auto Backup and Performance Monitor Initialization
  useEffect(() => {
    logger.info('Application started');
    monitor.measure('App_Init', () => {
      // Start auto backup
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

  // Compute Full Stock with Dynamic Live Calculations (Formula F, G, H, J)
  const stockItems = useMemo(() => {
    // Map entries and sorties by ref
    const mvtSummary = {};
    mouvements.forEach((m) => {
      const r = String(m.ref || m['Référence'] || m['Reference'] || '')
        .trim()
        .toLowerCase();
      if (!r) return;
      if (!mvtSummary[r]) {
        mvtSummary[r] = { entrees: 0, sorties: 0 };
      }
      const q = safeNum(m.quantite != null ? m.quantite : m['Quantité'], 0);
      const t = String(m.type || m['Type (Entrée/Sortie)'] || '').toLowerCase();
      if (t.includes('entr')) {
        mvtSummary[r].entrees += q;
      } else if (t.includes('sort')) {
        mvtSummary[r].sorties += q;
      }
    });

    return rawStock.map((item) => {
      const itemRefKey = String(item.ref || '')
        .trim()
        .toLowerCase();
      const itemDesigKey = String(item.designation || '')
        .trim()
        .toLowerCase();

      // Support matching unpadded and padded variants (e.g. courroie1 vs courroie01)
      const normRefKey = itemRefKey.replace(/^([a-zA-Z\u00C0-\u017F\s_-]+?)0+(\d+)$/, '$1$2');
      const padRefKey = itemRefKey.replace(/^([a-zA-Z\u00C0-\u017F\s_-]+?)(\d+)$/, (match, p1, p2) => 
        p2.length === 1 ? `${p1}0${p2}` : match
      );

      let entrees =
        mvtSummary[itemRefKey]?.entrees ||
        mvtSummary[normRefKey]?.entrees ||
        mvtSummary[padRefKey]?.entrees ||
        (itemDesigKey ? mvtSummary[itemDesigKey]?.entrees || 0 : 0);
      let sorties =
        mvtSummary[itemRefKey]?.sorties ||
        mvtSummary[normRefKey]?.sorties ||
        mvtSummary[padRefKey]?.sorties ||
        (itemDesigKey ? mvtSummary[itemDesigKey]?.sorties || 0 : 0);

      let stockInitial = 0;
      if (item.stockInitial !== undefined && item.stockInitial !== null && item.stockInitial !== '' && !isNaN(Number(item.stockInitial))) {
        stockInitial = Number(item.stockInitial);
      } else {
        const baseline =
          INITIAL_STOCK_LOOKUP.get(itemRefKey) ||
          INITIAL_STOCK_LOOKUP.get(normRefKey) ||
          INITIAL_STOCK_LOOKUP.get(padRefKey) ||
          (itemDesigKey ? INITIAL_STOCK_LOOKUP.get(itemDesigKey) : null);
        if (baseline && baseline.qty > 0) {
          stockInitial = baseline.qty;
        }
      }

      const seuil = safeNum(item.seuil, 3);
      const { stockActuel, alerte } = calculateStockStatus(stockInitial, entrees, sorties, seuil);

      return {
        ...item,
        stockInitial,
        entrees,
        sorties,
        stockActuel,
        alerte,
      };
    });
  }, [rawStock, mouvements]);

  const effectiveDesignations = useMemo(() => {
    if (
      Array.isArray(designations) &&
      designations.length > 0 &&
      designations.some((d) => (d.ref || d.id_designation) && (d.designation || d.libelle))
    ) {
      return designations;
    }
    if (Array.isArray(stockItems) && stockItems.length > 0) {
      return stockItems.map((s) => ({
        id: s.id,
        ref: s.ref,
        designation: s.designation,
        id_type: s.id_type || s.type || 'Standard',
        type: s.type || s.id_type || 'Standard',
        stockInitial: s.stockInitial || 0,
        seuil: s.seuil || 3,
        emplacement: s.emplacement || 'A1-R1',
      }));
    }
    return designations || [];
  }, [designations, stockItems]);

  const effectiveFamilies = useMemo(() => {
    if (
      Array.isArray(families) &&
      families.length >= 10 &&
      !families.some((f) => f.ref || f.stockInitial !== undefined || f.stockActuel !== undefined) &&
      families.some((f) => f.id_family === 'FAM-TR' || f.id_family === 'FAM-PRI')
    ) {
      return families;
    }
    return INITIAL_FAMILIES;
  }, [families]);

  const effectiveTemplates = useMemo(() => {
    if (
      Array.isArray(templates) &&
      templates.length >= 14 &&
      !templates.some(
        (t) => t.ref || t.stockInitial !== undefined || t.stockActuel !== undefined
      ) &&
      templates.some((t) => t.id_templates === 'TPL-TRR' || t.id_templates === 'TPL-PRI')
    ) {
      return templates;
    }
    return INITIAL_TEMPLATES;
  }, [templates]);

  const diagnostics = effectiveDesignations;

  const warehouseItemsComputed = useMemo(() => {
    const mvtSummary = {};
    mouvements.forEach((m) => {
      const r = String(m.ref || m['Référence'] || m['Reference'] || '')
        .trim()
        .toLowerCase();
      if (!r) return;
      if (!mvtSummary[r]) {
        mvtSummary[r] = { entrees: 0, sorties: 0 };
      }
      const q = safeNum(m.quantite != null ? m.quantite : m['Quantité'], 0);
      const t = String(m.type || m['Type (Entrée/Sortie)'] || '').toLowerCase();
      if (t.includes('entr')) {
        mvtSummary[r].entrees += q;
      } else if (t.includes('sort')) {
        mvtSummary[r].sorties += q;
      }
    });

    return warehouseItems.map((item) => {
      const r = String(item.id_warehouse_item || '')
        .trim()
        .toLowerCase();
      const initial = safeNum(item.stockInitial, 1);
      const entrees = mvtSummary[r]?.entrees || 0;
      const sorties = mvtSummary[r]?.sorties || 0;
      const stockActuel = initial + entrees - sorties;

      const seuil = safeNum(item.seuil, 0);
      let alerte = 'OK';
      if (stockActuel <= 0) alerte = 'RUPTURE';
      else if (stockActuel <= seuil && seuil > 0) alerte = 'ALERTE';

      return {
        ...item,
        stockInitial: initial,
        entrees,
        sorties,
        stockActuel,
        seuil,
        alerte,
      };
    });
  }, [warehouseItems, mouvements]);

  // Filter States
  const [stockSearch, setStockSearch] = useState('');
  const [stockTypeFilter, setStockTypeFilter] = useState('ALL');
  const [stockAlertOnly, setStockAlertOnly] = useState(false);

  const [mchSearch, setMchSearch] = useState('');
  const [mchFamilyFilter, setMchFamilyFilter] = useState('ALL');
  const [mchTemplateFilter, setMchTemplateFilter] = useState('ALL');
  const [mchZoneFilter, setMchZoneFilter] = useState('ALL');

  const [diagTypeFilter, setDiagTypeFilter] = useState('ALL');
  const [opZoneFilter, setOpZoneFilter] = useState('ALL');
  const [techZoneFilter, setTechZoneFilter] = useState('ALL');
  const [templateFamilyFilter, setTemplateFamilyFilter] = useState('ALL');
  const [blueprintFamilyFilter, setBlueprintFamilyFilter] = useState('ALL');
  const [blueprintTemplateFilter, setBlueprintTemplateFilter] = useState('ALL');

  // Groupe Entrepôt Filter States
  const [whFamilyFilter, setWhFamilyFilter] = useState('ALL');
  const [whTemplateFilter, setWhTemplateFilter] = useState('ALL');
  const [whTypeFilter, setWhTypeFilter] = useState('ALL');
  const [whNatureFilter, setWhNatureFilter] = useState('ALL');
  const [whSearch, setWhSearch] = useState('');
  const [compTemplateFamilyFilter, setCompTemplateFamilyFilter] = useState('');
  const [partDesignationTypeFilter, setPartDesignationTypeFilter] = useState('');

  // Modal States
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserModalType, setAddUserModalType] = useState('TECHNICIEN');
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);

  // Filtered Stock Items
  

  // Stock KPIs
  const stockKPIs = useMemo(() => {
    let totalEntrees = 0;
    let totalSorties = 0;
    let totalStockActuel = 0;
    let ruptures = 0;
    let alertes = 0;

    stockItems.forEach((s) => {
      totalEntrees += s.entrees;
      totalSorties += s.sorties;
      totalStockActuel += s.stockActuel;
      if (s.alerte === 'RUPTURE') ruptures++;
      else if (s.alerte === 'ALERTE') alertes++;
    });

    return {
      totalArticles: stockItems.length,
      totalEntrees,
      totalSorties,
      totalStockActuel,
      ruptures,
      alertes,
    };
  }, [stockItems]);

  // SMART NAVIGATION HANDLERS
  const handleNavigateToStockFiltered = (typeId) => {
    setStockTypeFilter(typeId);
    setStockAlertOnly(false);
    startTransition(() => setCurrentTab('stock'));
  };

  const handleNavigateToStockFilteredByRef = (refVal) => {
    setStockSearch(refVal);
    setStockTypeFilter('ALL');
    startTransition(() => setCurrentTab('stock'));
  };

  const handleNavigateToDesignationsFiltered = (typeId) => {
    setDiagTypeFilter(typeId);
    startTransition(() => setCurrentTab('designations'));
  };

  const handleNavigateToDiagFiltered = handleNavigateToDesignationsFiltered;

  const handleNavigateToFamilyFiltered = (familyId) => {
    setWhSearch(familyId || '');
    startTransition(() => setCurrentTab('families'));
  };

  const handleNavigateToTemplatesFiltered = (familyId) => {
    setTemplateFamilyFilter(familyId);
    startTransition(() => setCurrentTab('templates'));
  };

  const handleNavigateToMachinesByFamily = (familyId) => {
    setMchFamilyFilter(familyId);
    setMchTemplateFilter('ALL');
    startTransition(() => setCurrentTab('machines'));
  };

  const handleNavigateToMachinesByTemplate = (familyId, templateId) => {
    setMchFamilyFilter(familyId);
    setMchTemplateFilter(templateId);
    startTransition(() => setCurrentTab('machines'));
  };

  const handleNavigateToTechsByZone = (zoneId) => {
    setTechZoneFilter(zoneId);
    startTransition(() => setCurrentTab('technicians'));
  };

  const handleNavigateToOpsByZone = (zoneId) => {
    setOpZoneFilter(zoneId);
    startTransition(() => setCurrentTab('operations'));
  };

  const handleNavigateToMachinesByZone = (zoneId) => {
    setMchZoneFilter(zoneId);
    startTransition(() => setCurrentTab('machines'));
  };

  // GROUPE ENTREPÔT NAVIGATION HANDLERS
  const handleNavigateToCompTemplates = (familyId) => {
    setCompTemplateFamilyFilter(familyId || '');
    startTransition(() => setCurrentTab('comp_templates'));
  };

  const handleNavigateToCompFamilies = () => {
    startTransition(() => setCurrentTab('comp_families'));
  };

  const handleNavigateToPartDesignations = (typeId) => {
    setPartDesignationTypeFilter(typeId || '');
    startTransition(() => setCurrentTab('part_designations'));
  };

  const handleNavigateToPartTypes = () => {
    startTransition(() => setCurrentTab('part_types'));
  };

  const handleNavigateToEntrepotByComp = (familyId, templateId) => {
    setWhFamilyFilter(familyId || 'ALL');
    setWhTemplateFilter(templateId || 'ALL');
    setWhNatureFilter('COMPONENT');
    startTransition(() => setCurrentTab('entrepot'));
  };

  const handleNavigateToEntrepotByType = (typeId) => {
    setWhTypeFilter(typeId || 'ALL');
    setWhNatureFilter('PART');
    startTransition(() => setCurrentTab('entrepot'));
  };

  const handleNavigateToEntrepotByPart = (refOrPart, typeId) => {
    if (typeId) setWhTypeFilter(typeId);
    setWhSearch(refOrPart || '');
    setWhNatureFilter('PART');
    startTransition(() => setCurrentTab('entrepot'));
  };

  // ADD ENTITY HANDLERS
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
      id: crypto.randomUUID(),
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

  const handleNavigateToBlueprintsFiltered = (familyId, templateId) => {
    if (familyId) setBlueprintFamilyFilter(familyId);
    if (templateId) setBlueprintTemplateFilter(templateId);
    startTransition(() => setCurrentTab('blueprints'));
  };

  const handleAddZone = (newZone) => {
    setZones((prev) => [...prev, newZone]);
  };

  // ===== UPDATE & DELETE HANDLERS =====
  
  const {
    handleUpdateZone, handleDeleteZone,
    handleUpdateOperation, handleDeleteOperation,
    handleUpdateMachine, handleDeleteMachine,
    handleUpdateType, handleDeleteType,
    handleUpdateDesignation, handleDeleteDesignation,
    handleUpdateFamily, handleDeleteFamily,
    handleUpdateCompFamily, handleDeleteCompFamily,
    handleUpdateCompTemplate, handleDeleteCompTemplate,
    handleUpdatePartType, handleDeletePartType,
    handleUpdatePartDesignation, handleDeletePartDesignation,
    handleUpdateTemplate, handleDeleteTemplate,
    handleAddTechnician, handleUpdateTechnician, handleDeleteTechnician,
    handleAddOperation, handleAddMachine, handleAddArticle, handleAddMouvement,
    handleUpdateArticle,
    handleUpdateMouvement, handleDeleteMouvement,
    handleAddWarehouseItem, handleUpdateWarehouseItem, handleDeleteWarehouseItem,
    handleDirectAdjustStock, handleQuickSortie
  } = useAppComplexHandlers({
    zones, setZones, operations, setOperations, technicians, setTechnicians, machines, setMachines, mouvements, setMouvements,
    types, setTypes, rawStock, setRawStock, designations, setDesignations, families, setFamilies, templates, setTemplates,
    compFamilies, setCompFamilies, compTemplates, setCompTemplates, partTypes, setPartTypes, partDesignations, setPartDesignations,
    warehouseItems, setWarehouseItems, showToast, setCurrentTab
  });

  // AUTOMATIC BACKUP CREATOR
  const createAutomaticBackup = (reason = 'Importation Excel') => {
    try {
      const now = new Date();
      const dateStr =
        now.toLocaleDateString('fr-FR') +
        ' À ' +
        now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const backupKey = `gmao_backup_${now.getTime()}`;
      const backupData = {
        timestamp: now.toISOString(),
        dateFormatted: dateStr,
        reason,
        data: {
          rawStock,
          mouvements,
          machines,
          warehouseItems,
          families,
          templates,
          zones,
          technicians,
          operations,
          types,
          diagnostics,
        },
      };

      storageService.setItem(backupKey, backupData);

      const backupList = storageService.getItem('gmao_backups_list') || [];
      const updatedList = [
        {
          key: backupKey,
          date: dateStr,
          reason,
          itemsCount: rawStock.length,
          mvtsCount: mouvements.length,
        },
        ...backupList,
      ].slice(0, 15);

      storageService.setItem('gmao_backups_list', updatedList);
      return dateStr;
    } catch (err) {
      console.error('Backup creation error:', err);
      return new Date().toLocaleString('fr-FR');
    }
  };

  // HELPER TO BUILD COMPLETE EXCEL WORKBOOK
  const buildWorkbook = () => {
    const wb = XLSX.utils.book_new();

    // 1. Stock_Actuel
    const stockData = stockItems.map((s) => ({
      Ref: s.ref,
      Désignation: s.designation,
      ID_Type: s.id_type,
      ID_Diagnostic: s.id_diag,
      'Stock Initial': s.stockInitial,
      Entrées: s.entrees,
      Sorties: s.sorties,
      'Stock Actuel': s.stockActuel,
      Seuil: s.seuil,
      Alerte: s.alerte,
      Emplacement: s.emplacement,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stockData), 'Stock_Actuel');

    // 2. Machines_Registered
    const mchData = machines.map((m) => ({
      'Code Machine (Ref)': m.id_machine_registered,
      Désignation: m.designation,
      ID_Family: m.id_family,
      ID_Template: m.id_templates,
      Zone_Default: m.id_zone_default,
      Technicien: m.technician,
      Statut: m.status,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mchData), 'Machines_Registered');

    // 3. Warehouse_Items (Entrepôt)
    const warehouseData = warehouseItems.map((w) => ({
      'Code Entrepôt (Ref)': w.id_warehouse_item || w.id_machine_registered,
      Désignation: w.designation,
      Nature: w.nature || 'COMPOSANT',
      ID_Family: w.id_family,
      ID_Template: w.id_templates,
      Rattachement: w.rattachement_type || 'NON_ASSIGNE',
      'Machine Associée': w.id_machine_associee || '',
      Zone: w.id_zone_default,
      Responsable: w.technician,
      Statut: w.status,
      Quantité: w.quantite || 1,
      Emplacement: w.emplacement || '',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(warehouseData), 'Warehouse_Items');

    // 4. Mouvements
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mouvements), 'Mouvements');

    // 5. Types
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(types), 'Types');

    // 6. Diagnostics
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(diagnostics), 'Diagnostics');

    // 7. Families
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(families), 'Families');

    // 8. Templates
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(templates), 'Templates');

    // 9. Zones
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(zones), 'Zones');

    // 10. Technicians
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(technicians), 'Technicians');

    // 11. Operations
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(operations), 'Operations');

    // 12. Comp_Families
    if (compFamilies && compFamilies.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(compFamilies), 'Comp_Families');
    }

    // 13. Comp_Templates
    if (compTemplates && compTemplates.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(compTemplates), 'Comp_Templates');
    }

    // 14. Part_Types
    if (partTypes && partTypes.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(partTypes), 'Part_Types');
    }

    // 15. Part_Designations
    if (partDesignations && partDesignations.length > 0) {
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(partDesignations),
        'Part_Designations'
      );
    }

    // 16. Blueprints (Level 3 Machine Technical Plans)
    if (blueprints && blueprints.length > 0) {
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(blueprints),
        'Blueprints'
      );
    }

    return wb;
  };

  // EXCEL EXPORT HANDLER
  const handleExportExcel = () => {
    const wb = buildWorkbook();
    XLSX.writeFile(wb, `GMAO_Light_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Export Excel généré et téléchargé avec succès !', 'success');
  };

  // FILE IMPORT HANDLER WITH AUTOMATIC DATED BACKUP

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Fichier trop volumineux. La taille maximale est de 10 MB.', 'error');
      return;
    }

    const validExtensions = ['.json', '.xlsx'];
    const validMimeTypes = [
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExt) || (file.type && !validMimeTypes.includes(file.type))) {
      showToast('Format de fichier non supporté. Seuls JSON et XLSX.', 'error');
      return;
    }

    const backupDate = createAutomaticBackup('Importation : ' + file.name);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        let importedData = {};
        if (file.name.endsWith('.json')) {
          importedData = JSON.parse(evt.target.result);
        } else {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          if (workbook.SheetNames.includes('Stock_Actuel')) {
            importedData.Stock_Actuel = XLSX.utils.sheet_to_json(workbook.Sheets['Stock_Actuel']);
          }
          if (workbook.SheetNames.includes('Mouvements')) {
            importedData.Mouvement = XLSX.utils.sheet_to_json(workbook.Sheets['Mouvements']);
          }
          if (workbook.SheetNames.includes('Machines_Registered')) {
            importedData.Machines_Registered = XLSX.utils.sheet_to_json(
              workbook.Sheets['Machines_Registered']
            );
          }
          if (workbook.SheetNames.includes('Warehouse_Items')) {
            importedData.Warehouse_Items = XLSX.utils.sheet_to_json(
              workbook.Sheets['Warehouse_Items']
            );
          } else if (workbook.SheetNames.includes('Entrepot')) {
            importedData.Warehouse_Items = XLSX.utils.sheet_to_json(workbook.Sheets['Entrepot']);
          }
          if (workbook.SheetNames.includes('Comp_Families')) {
            importedData.Comp_Families = XLSX.utils.sheet_to_json(workbook.Sheets['Comp_Families']);
          }
          if (workbook.SheetNames.includes('Comp_Templates')) {
            importedData.Comp_Templates = XLSX.utils.sheet_to_json(
              workbook.Sheets['Comp_Templates']
            );
          }
          if (workbook.SheetNames.includes('Part_Types')) {
            importedData.Part_Types = XLSX.utils.sheet_to_json(workbook.Sheets['Part_Types']);
          }
          if (workbook.SheetNames.includes('Part_Designations')) {
            importedData.Part_Designations = XLSX.utils.sheet_to_json(
              workbook.Sheets['Part_Designations']
            );
          }
          if (workbook.SheetNames.includes('Blueprints')) {
            importedData.Blueprints = XLSX.utils.sheet_to_json(
              workbook.Sheets['Blueprints']
            );
          }
        }

        const validation = validateImportedData(importedData);
        if (!validation.valid) {
          const errorMsgs = [];
          if (validation.errors.stock.length > 0)
            errorMsgs.push('Erreurs Stock: ' + validation.errors.stock.length);
          if (validation.errors.movements.length > 0)
            errorMsgs.push('Erreurs Mouvements: ' + validation.errors.movements.length);
          if (validation.errors.general.length > 0) errorMsgs.push(...validation.errors.general);

          showToast('Import échoué: données invalides. ' + errorMsgs.join(', '), 'error');
          logger.error('Validation failed on import', validation.errors);
          return;
        }

        if (importedData.Stock_Actuel && importedData.Stock_Actuel.length > 0)
          setRawStock(sanitizeObject(importedData.Stock_Actuel));
        if (importedData.Mouvement && importedData.Mouvement.length > 0)
          setMouvements(sanitizeObject(importedData.Mouvement));
        if (importedData.Machines_Registered && importedData.Machines_Registered.length > 0)
          setMachines(sanitizeObject(importedData.Machines_Registered));
        if (importedData.Warehouse_Items && importedData.Warehouse_Items.length > 0)
          setWarehouseItems(sanitizeObject(importedData.Warehouse_Items));
        if (importedData.Families && importedData.Families.length > 0)
          setFamilies(sanitizeObject(importedData.Families));
        if (importedData.Templates && importedData.Templates.length > 0)
          setTemplates(sanitizeObject(importedData.Templates));
        if (importedData.Blueprints && importedData.Blueprints.length > 0)
          setBlueprints(sanitizeObject(importedData.Blueprints));
        if (importedData.Zones && importedData.Zones.length > 0)
          setZones(sanitizeObject(importedData.Zones));
        if (importedData.Technicians && importedData.Technicians.length > 0)
          setTechnicians(sanitizeObject(importedData.Technicians));
        if (importedData.Operations && importedData.Operations.length > 0)
          setOperations(sanitizeObject(importedData.Operations));
        if (importedData.Comp_Families && importedData.Comp_Families.length > 0)
          setCompFamilies(sanitizeObject(importedData.Comp_Families));
        if (importedData.Comp_Templates && importedData.Comp_Templates.length > 0)
          setCompTemplates(sanitizeObject(importedData.Comp_Templates));
        if (importedData.Part_Types && importedData.Part_Types.length > 0)
          setPartTypes(sanitizeObject(importedData.Part_Types));
        if (importedData.Part_Designations && importedData.Part_Designations.length > 0)
          setPartDesignations(sanitizeObject(importedData.Part_Designations));

        showToast('Import réussi ! (Backup daté du ' + backupDate + ')', 'success');
        logger.info('File imported successfully', { file: file.name });
      } catch (err) {
        console.error('Import error:', err);
        showToast('Erreur lors de la lecture du fichier.', 'error');
        logger.error('Import error', { error: err.message });
      }
    };

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // DIRECT FILE SYSTEM ACCESS API LINK (NO EXPORT DOWNLOAD NEEDED)
  const handleDirectFileLink = async () => {
    if (!('showOpenFilePicker' in window)) {
      showToast(
        "Liaison directe disponible sur Chrome/Edge. Basculement vers l'import classique.",
        'info'
      );
      fileInputRef.current?.click();
      return;
    }

    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'Fichiers Excel GMAO (.xlsx)',
            accept: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
                '.xlsx',
                '.xls',
              ],
            },
          },
        ],
        multiple: false,
      });

      const file = await handle.getFile();
      const backupDate = createAutomaticBackup(`Avant Liaison Directe : ${file.name}`);

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

      if (workbook.SheetNames.includes('Stock_Actuel')) {
        const parsedStock = XLSX.utils.sheet_to_json(workbook.Sheets['Stock_Actuel']);
        if (parsedStock.length > 0) setRawStock(parsedStock);
      }
      if (workbook.SheetNames.includes('Machines_Registered')) {
        const parsedMch = XLSX.utils.sheet_to_json(workbook.Sheets['Machines_Registered']);
        if (parsedMch.length > 0) setMachines(parsedMch);
      }
      if (workbook.SheetNames.includes('Mouvements')) {
        const parsedMvt = XLSX.utils.sheet_to_json(workbook.Sheets['Mouvements']);
        if (parsedMvt.length > 0) setMouvements(parsedMvt);
      }

      setLinkedFileHandle(handle);
      setLinkedFileName(file.name);
      showToast(
        `🔗 Fichier "${file.name}" lié en direct ! (Backup sauvegardé : ${backupDate})`,
        'success'
      );
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Direct link error:', err);
        showToast("Erreur lors de l'accès au fichier sélectionné.", 'error');
      }
    }
  };

  // DIRECT FILE SYSTEM SAVE HANDLER
  const handleDirectSave = async () => {
    if (!linkedFileHandle) {
      handleExportExcel();
      return;
    }

    try {
      const wb = buildWorkbook();
      const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      const writable = await linkedFileHandle.createWritable();
      await writable.write(wbOut);
      await writable.close();

      showToast(`💾 Écriture directe réussie dans "${linkedFileName}" !`, 'success');
    } catch (err) {
      console.error('Direct save error:', err);
      showToast('Écriture directe impossible. Exportation standard...', 'info');
      handleExportExcel();
    }
  };

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
            stockItems, machines, warehouseItems: warehouseItemsComputed, mouvements, types, diagnostics, zones, technicians, operations, stockKPIs,
            onNavigateToStock: () => startTransition(() => setCurrentTab('stock')),
            onNavigateToMachines: () => startTransition(() => setCurrentTab('machines')),
            onNavigateToWarehouse: () => startTransition(() => setCurrentTab('entrepot')),
            onNavigateToSortie: () => startTransition(() => setCurrentTab('sortie')),
            onNavigateToZones: () => startTransition(() => setCurrentTab('zones')),
            onNavigateToUsers: () => startTransition(() => setCurrentTab('utilisateurs')),
            onNavigateToSettings: () => startTransition(() => setCurrentTab('settings')),
            onQuickSortie: handleQuickSortie, onAddMouvement: handleAddMouvement, onUpdateMouvement: handleUpdateMouvement, onDeleteMouvement: handleDeleteMouvement, onExportExcel: handleExportExcel
          },
          stock: {
            stockItems, mouvements, stockSearch, setStockSearch, stockTypeFilter, setStockTypeFilter, stockAlertOnly, setStockAlertOnly, types, zones, machines, technicians, operations,
            onOpenAddArticle: () => setShowAddArticleModal(true),
            onQuickSortie: handleQuickSortie, onAddMouvement: handleAddMouvement, onUpdateArticle: handleUpdateArticle, onDirectAdjustStock: handleDirectAdjustStock, stockKPIs, onNavigateToType: handleNavigateToStockFiltered
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
            onOpenAddTech: () => { setAddUserModalType('TECHNICIEN'); setShowAddUserModal(true); },
            onOpenAddChef: () => { setAddUserModalType('RESPONSABLE'); setShowAddUserModal(true); },
            onOpenAddOperator: () => { setAddUserModalType('OPERATEUR'); setShowAddUserModal(true); },
            onNavigateToWarehouse: () => startTransition(() => setCurrentTab('entrepot')),
            onNavigateToStockFilteredByRef: handleNavigateToStockFilteredByRef
          },
          entrepot: {
            warehouseItems: warehouseItemsComputed, mouvements, compFamilies, compTemplates, partTypes, partDesignations, machines, whSearch, setWhSearch, whFamilyFilter, setWhFamilyFilter, whTemplateFilter, setWhTemplateFilter, whTypeFilter, setWhTypeFilter, whNatureFilter, setWhNatureFilter,
            onAddWarehouseItem: handleAddWarehouseItem, onUpdateWarehouseItem: handleUpdateWarehouseItem, onDeleteWarehouseItem: handleDeleteWarehouseItem,
            onNavigateToCompFamilies: handleNavigateToCompFamilies, onNavigateToCompTemplates: handleNavigateToCompTemplates, onNavigateToPartTypes: handleNavigateToPartTypes, onNavigateToPartDesignations: handleNavigateToPartDesignations, onNavigateToEntrepotByPart: handleNavigateToEntrepotByPart
          },
          types: {
            types, search: whSearch, setSearch: setWhSearch, onAddType: handleAddType, onUpdateType: handleUpdateType, onDeleteType: handleDeleteType, onNavigateToDesignations: handleNavigateToDesignationsFiltered
          },
          designations: {
            designations, types, search: whSearch, setSearch: setWhSearch, onAddDesignation: handleAddDesignation, onUpdateDesignation: handleUpdateDesignation, onDeleteDesignation: handleDeleteDesignation, onOpenAddTypeModal: () => startTransition(() => setCurrentTab('types')), onNavigateToDiag: handleNavigateToDiagFiltered
          },
          machines: {
            machines,
            families: effectiveFamilies,
            templates: effectiveTemplates,
            zones,
            technicians,
            mouvements,
            search: mchSearch,
            setSearch: setMchSearch,
            mchFamilyFilter,
            setMchFamilyFilter,
            mchTemplateFilter,
            setMchTemplateFilter,
            mchZoneFilter,
            setMchZoneFilter,
            onAddMachine: handleAddMachine,
            onUpdateMachine: handleUpdateMachine,
            onDeleteMachine: handleDeleteMachine,
            onOpenAddMachine: () => setShowAddMachineModal(true),
            onNavigateToFamily: handleNavigateToFamilyFiltered,
            onNavigateToTemplate: handleNavigateToTemplatesFiltered,
            onNavigateToZone: handleNavigateToMachinesByZone,
          },
          compFamilies: {
            compFamilies, search: whSearch, setSearch: setWhSearch, onAddCompFamily: handleAddCompFamily, onUpdateCompFamily: handleUpdateCompFamily, onDeleteCompFamily: handleDeleteCompFamily, onNavigateToCompTemplates: handleNavigateToCompTemplates
          },
          compTemplates: {
            compTemplates, compFamilies, search: whSearch, setSearch: setWhSearch, familyFilter: compTemplateFamilyFilter, setFamilyFilter: setCompTemplateFamilyFilter, onAddCompTemplate: handleAddCompTemplate, onUpdateCompTemplate: handleUpdateCompTemplate, onDeleteCompTemplate: handleDeleteCompTemplate, onOpenAddFamilyModal: () => startTransition(() => setCurrentTab('comp_families')), onNavigateToEntrepotByComp: handleNavigateToEntrepotByComp
          },
          partTypes: {
            partTypes, partDesignations, warehouseItems: warehouseItemsComputed, search: whSearch, setSearch: setWhSearch, onAddPartType: handleAddPartType, onUpdatePartType: handleUpdatePartType, onDeletePartType: handleDeletePartType, onNavigateToPartDesignations: handleNavigateToPartDesignations, onNavigateToEntrepotByType: handleNavigateToEntrepotByType
          },
          partDesignations: {
            partDesignations, partTypes, warehouseItems: warehouseItemsComputed, search: whSearch, setSearch: setWhSearch, partDesignationTypeFilter, setPartDesignationTypeFilter, onAddPartDesignation: handleAddPartDesignation, onUpdatePartDesignation: handleUpdatePartDesignation, onDeletePartDesignation: handleDeletePartDesignation, onNavigateToPartTypes: handleNavigateToPartTypes, onNavigateToEntrepotByPart: handleNavigateToEntrepotByPart, onNavigateToEntrepotByType: handleNavigateToEntrepotByType
          },
          families: {
            families: effectiveFamilies,
            templates: effectiveTemplates,
            machines,
            search: whSearch,
            setSearch: setWhSearch,
            onAddFamily: handleAddFamily,
            onUpdateFamily: handleUpdateFamily,
            onDeleteFamily: handleDeleteFamily,
            onNavigateToTemplatesFiltered: handleNavigateToTemplatesFiltered,
            onNavigateToMachinesByFamily: handleNavigateToMachinesByFamily
          },
          templates: {
            templates: effectiveTemplates,
            families: effectiveFamilies,
            machines,
            search: whSearch,
            setSearch: setWhSearch,
            templateFamilyFilter,
            setTemplateFamilyFilter,
            onAddTemplate: handleAddTemplate,
            onUpdateTemplate: handleUpdateTemplate,
            onDeleteTemplate: handleDeleteTemplate,
            onOpenAddFamilyModal: () => startTransition(() => setCurrentTab('families')),
            onNavigateToMachinesByTemplate: handleNavigateToMachinesByTemplate,
            onNavigateToFamilyFiltered: handleNavigateToFamilyFiltered,
            onNavigateToBlueprints: handleNavigateToBlueprintsFiltered,
          },
          blueprints: {
            blueprints,
            templates: effectiveTemplates,
            families: effectiveFamilies,
            machines,
            blueprintFamilyFilter,
            setBlueprintFamilyFilter,
            blueprintTemplateFilter,
            setBlueprintTemplateFilter,
            onAddBlueprint: handleAddBlueprint,
            onUpdateBlueprint: handleUpdateBlueprint,
            onDeleteBlueprint: handleDeleteBlueprint,
            onOpenAddFamilyModal: () => startTransition(() => setCurrentTab('families')),
            onOpenAddTemplateModal: () => startTransition(() => setCurrentTab('templates')),
            onNavigateToMachinesByTemplate: handleNavigateToMachinesByTemplate,
            onNavigateToFamily: handleNavigateToFamilyFiltered,
            onNavigateToTemplate: handleNavigateToTemplatesFiltered,
          },
          zones: {
            zones,
            machines,
            technicians,
            operations,
            search: whSearch,
            setSearch: setWhSearch,
            onAddZone: handleAddZone,
            onUpdateZone: handleUpdateZone,
            onDeleteZone: handleDeleteZone,
            onNavigateToTechs: handleNavigateToTechsByZone,
            onNavigateToOps: handleNavigateToOpsByZone,
            onNavigateToMachines: handleNavigateToMachinesByZone,
            onOpenAddZoneModal: () => setShowAddZoneModal(true),
          },
          utilisateurs: {
            technicians, operations, zones, mouvements, techZoneFilter, setTechZoneFilter, opZoneFilter, setOpZoneFilter,
            onAddTechnician: handleAddTechnician, onUpdateTechnician: handleUpdateTechnician, onDeleteTechnician: handleDeleteTechnician,
            onAddOperation: handleAddOperation, onUpdateOperation: handleUpdateOperation, onDeleteOperation: handleDeleteOperation,
            onOpenAddArticle: () => setShowAddArticleModal(true), onOpenAddMachine: () => setShowAddMachineModal(true), onOpenAddZone: () => setShowAddZoneModal(true),
            onOpenAddTechModal: () => { setAddUserModalType('TECHNICIEN'); setShowAddUserModal(true); },
            onOpenAddRespModal: () => { setAddUserModalType('RESPONSABLE'); setShowAddUserModal(true); },
            onOpenAddOpModal: () => { setAddUserModalType('OPERATEUR'); setShowAddUserModal(true); }
          },
          settings: {
            rawStock, stockItems, machines, mouvements, types, designations, zones, technicians, operations,
            compFamilies, compTemplates, partTypes, partDesignations, families: effectiveFamilies, templates: effectiveTemplates, warehouseItems: warehouseItemsComputed,
            onNavigateToWarehouse: () => startTransition(() => setCurrentTab('entrepot'))
          },
          nexus: {
            types, diagnostics, families: effectiveFamilies, templates: effectiveTemplates, zones, technicians, operations, machines, stockItems
          },
          guide: {}
        }}
      />

      <AppModals 
        showAddArticleModal={showAddArticleModal} setShowAddArticleModal={setShowAddArticleModal}
        showAddMachineModal={showAddMachineModal} setShowAddMachineModal={setShowAddMachineModal}
        showAddUserModal={showAddUserModal} setShowAddUserModal={setShowAddUserModal} addUserModalType={addUserModalType} setAddUserModalType={setAddUserModalType}
        showAddZoneModal={showAddZoneModal} setShowAddZoneModal={setShowAddZoneModal}
        types={types} stockItems={stockItems} effectiveFamilies={effectiveFamilies} effectiveTemplates={effectiveTemplates} zones={zones} technicians={technicians} machines={machines} operations={operations}
        handleAddArticle={handleAddArticle} handleAddMachine={handleAddMachine} handleUpdateMachine={handleUpdateMachine} handleDeleteMachine={handleDeleteMachine}
        handleAddTechnician={handleAddTechnician} handleAddOperation={handleAddOperation} handleAddZone={handleAddZone}
        setCurrentTab={setCurrentTab}
        toast={toast} setToast={setToast}
      />

      {/* 100% Offline Status Indicator */}
      <OfflineIndicator />
    </MainLayout>
    </ErrorBoundary>
  );
}
