import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  lazy,
  Suspense,
  useDeferredValue,
} from 'react';
import * as XLSX from 'xlsx';
import { useGmaoState } from './hooks/useGmaoState';
import { useGenericCRUD } from './hooks/useGenericCRUD';
import initialData from './initialData.json';
import {
  INITIAL_TYPES,
  INITIAL_DIAGNOSTICS,
  INITIAL_FAMILIES,
  INITIAL_TEMPLATES,
  INITIAL_MACHINES_REGISTERED,
  INITIAL_ZONES,
  INITIAL_TECHNICIANS,
  INITIAL_OPERATIONS,
  mapItemToTypeAndDiag,
} from './data/seedData';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoadingSkeleton from './components/LoadingSkeleton';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';

import { validateImportedData } from './utils/validation';
import { backupService } from './utils/BackupService';
import { auditService } from './utils/AuditService';
import { logger } from './utils/Logger';
import { monitor } from './utils/PerformanceMonitor';

// Lazy load views for instant app startup & fast tab transitions
const DashboardView = lazy(() => import('./components/DashboardView'));
const StockView = lazy(() => import('./components/StockView'));
const TypeView = lazy(() => import('./components/TypeView'));
const DesignationView = lazy(() => import('./components/DesignationView'));
const MachinesRegisteredView = lazy(() => import('./components/MachinesRegisteredView'));
const FamilyView = lazy(() => import('./components/FamilyView'));
const TemplatesView = lazy(() => import('./components/TemplatesView'));
const ZonesView = lazy(() => import('./components/ZonesView'));
const UtilisateursView = lazy(() => import('./components/UtilisateursView'));
const SortieRapideView = lazy(() => import('./components/SortieRapideView'));
const NexusView = lazy(() => import('./components/NexusView'));
const GuideView = lazy(() => import('./components/GuideView'));
const SettingsView = lazy(() => import('./components/SettingsView'));

const AddArticleModal = lazy(() => import('./components/AddArticleModal'));
const AddMachineModal = lazy(() => import('./components/AddMachineModal'));
const AddUserModal = lazy(() => import('./components/AddUserModal'));
const AddZoneModal = lazy(() => import('./components/AddZoneModal'));

import { storageService } from './utils/storageService';
import { sanitizeObject } from './utils/sanitize';
import { indexedDBService } from './utils/indexedDBService';
import { safeNum, calculateStockStatus } from './utils/formulaEngine';

export default function App() {
  // Splash & Auth States
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState(
    () => storageService.getItem('gmao_user_session') || null
  );

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

  // Navigation
  const [currentTab, setCurrentTab] = useState('stock');
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
          Families: families,
          Templates: templates,
          Zones: zones,
          Diagnostics: designations,
          Types: types,
          Technicians: technicians,
          Operations: operations,
        };
      }, currentUser?.nom || 'system');
    });

    return () => {
      backupService.stopAutoBackup();
    };
  }, [
    currentUser,
    rawStock,
    mouvements,
    machines,
    families,
    templates,
    zones,
    designations,
    types,
    technicians,
    operations,
  ]);

  const diagnostics = designations;

  // Compute Full Stock with Dynamic Live Calculations (Formula F, G, H, J)
  const stockItems = useMemo(() => {
    // Map entries and sorties by ref
    const mvtSummary = {};
    mouvements.forEach((m) => {
      const r = String(m.ref || m['Référence'] || '')
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
      const itemRefKey = item.ref.toLowerCase();
      let entrees = mvtSummary[itemRefKey]?.entrees || 0;
      let sorties = mvtSummary[itemRefKey]?.sorties || 0;

      const stockInitial = safeNum(item.stockInitial, 0);
      const seuil = safeNum(item.seuil, 0);
      const { stockActuel, alerte } = calculateStockStatus(stockInitial, entrees, sorties, seuil);

      return {
        ...item,
        entrees,
        sorties,
        stockActuel,
        alerte,
      };
    });
  }, [rawStock, mouvements]);

  // Filter States
  const [stockSearch, setStockSearch] = useState('');
  const deferredStockSearch = useDeferredValue(stockSearch);
  const [stockTypeFilter, setStockTypeFilter] = useState('ALL');
  const [stockAlertOnly, setStockAlertOnly] = useState(false);

  const [mchSearch, setMchSearch] = useState('');
  const deferredMchSearch = useDeferredValue(mchSearch);
  const [mchFamilyFilter, setMchFamilyFilter] = useState('ALL');
  const [mchTemplateFilter, setMchTemplateFilter] = useState('ALL');
  const [mchZoneFilter, setMchZoneFilter] = useState('ALL');

  const [diagTypeFilter, setDiagTypeFilter] = useState('ALL');
  const [opZoneFilter, setOpZoneFilter] = useState('ALL');
  const [techZoneFilter, setTechZoneFilter] = useState('ALL');
  const [templateFamilyFilter, setTemplateFamilyFilter] = useState('ALL');

  // Modal States
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserModalType, setAddUserModalType] = useState('TECHNICIEN');
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);

  // Filtered Stock Items
  const filteredStock = useMemo(() => {
    return stockItems.filter((item) => {
      if (
        stockTypeFilter !== 'ALL' &&
        item.id_type !== stockTypeFilter &&
        item.type !== stockTypeFilter
      )
        return false;
      if (stockAlertOnly && item.alerte === 'OK') return false;

      if (deferredStockSearch) {
        const q = deferredStockSearch.toLowerCase();
        return (
          item.ref.toLowerCase().includes(q) ||
          item.designation.toLowerCase().includes(q) ||
          (item.type && item.type.toLowerCase().includes(q)) ||
          (item.id_type && item.id_type.toLowerCase().includes(q)) ||
          (item.emplacement && item.emplacement.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [stockItems, stockTypeFilter, stockAlertOnly, deferredStockSearch]);

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
    React.startTransition(() => setCurrentTab('stock'));
  };

  const handleNavigateToStockFilteredByRef = (refVal) => {
    setStockSearch(refVal);
    setStockTypeFilter('ALL');
    React.startTransition(() => setCurrentTab('stock'));
  };

  const handleNavigateToDesignationsFiltered = (typeId) => {
    setDiagTypeFilter(typeId);
    React.startTransition(() => setCurrentTab('designations'));
  };

  const handleNavigateToDiagFiltered = handleNavigateToDesignationsFiltered;

  const handleNavigateToTemplatesFiltered = (familyId) => {
    setTemplateFamilyFilter(familyId);
    React.startTransition(() => setCurrentTab('templates'));
  };

  const handleNavigateToMachinesByFamily = (familyId) => {
    setMchFamilyFilter(familyId);
    setMchTemplateFilter('ALL');
    React.startTransition(() => setCurrentTab('machines'));
  };

  const handleNavigateToMachinesByTemplate = (familyId, templateId) => {
    setMchFamilyFilter(familyId);
    setMchTemplateFilter(templateId);
    React.startTransition(() => setCurrentTab('machines'));
  };

  const handleNavigateToTechsByZone = (zoneId) => {
    setTechZoneFilter(zoneId);
    React.startTransition(() => setCurrentTab('technicians'));
  };

  const handleNavigateToOpsByZone = (zoneId) => {
    setOpZoneFilter(zoneId);
    React.startTransition(() => setCurrentTab('operations'));
  };

  const handleNavigateToMachinesByZone = (zoneId) => {
    setMchZoneFilter(zoneId);
    React.startTransition(() => setCurrentTab('machines'));
  };

  // ADD ENTITY HANDLERS
  const handleAddType = (newType) => {
    setTypes((prev) => [...prev, newType]);
  };

  const handleAddDesignation = (newDesig) => {
    setRawStock((prev) => [
      {
        id: crypto.randomUUID(),
        ref: newDesig.ref,
        designation: newDesig.designation,
        type: newDesig.id_type,
        id_type: newDesig.id_type,
        stockInitial: Number(newDesig.stockInitial) || 0,
        seuil: Number(newDesig.seuil) || 3,
        emplacement: newDesig.emplacement || 'A1-R1',
      },
      ...prev,
    ]);
  };

  const handleAddDiagnostic = handleAddDesignation;

  const handleAddFamily = (newFam) => {
    setFamilies((prev) => [...prev, newFam]);
  };

  const handleAddTemplate = (newTpl) => {
    setTemplates((prev) => [...prev, newTpl]);
  };

  const handleAddZone = (newZone) => {
    setZones((prev) => [...prev, newZone]);
  };

  // ===== UPDATE & DELETE HANDLERS =====
  const handleUpdateZone = (id, updatedZone) => {
    setZones((prev) => prev.map((z) => (z.id_zone === id ? updatedZone : z)));
    const oldZone = zones.find((z) => z.id_zone === id);
    if (oldZone && oldZone.id_zone !== updatedZone.id_zone) {
      setTechnicians((prev) =>
        prev.map((t) => (t.id_zone === id ? { ...t, id_zone: updatedZone.id_zone } : t))
      );
      setOperations((prev) =>
        prev.map((o) => (o.id_zone === id ? { ...o, id_zone: updatedZone.id_zone } : o))
      );
      setMachines((prev) =>
        prev.map((m) =>
          m.id_zone_default === id ? { ...m, id_zone_default: updatedZone.id_zone } : m
        )
      );
      setMouvements((prev) =>
        prev.map((m) => (m.id_zone === id ? { ...m, id_zone: updatedZone.id_zone } : m))
      );
    }
  };
  const handleDeleteZone = (id) => setZones((prev) => prev.filter((z) => z.id_zone !== id));

  const handleUpdateOperation = (id, updatedOp) => {
    setOperations((prev) => prev.map((o) => (o.id_operation === id ? updatedOp : o)));
    const oldOp = operations.find((o) => o.id_operation === id);
    if (oldOp && oldOp.nom !== updatedOp.nom) {
      setMouvements((prev) =>
        prev.map((m) => (m.operation === oldOp.nom ? { ...m, operation: updatedOp.nom } : m))
      );
    }
  };
  const handleDeleteOperation = (id) =>
    setOperations((prev) => prev.filter((o) => o.id_operation !== id));

  const handleUpdateMachine = (id, updatedMch) => {
    setMachines((prev) => prev.map((m) => (m.id_machine_registered === id ? updatedMch : m)));
    if (id !== updatedMch.id_machine_registered) {
      setMouvements((prev) =>
        prev.map((m) =>
          m.id_machine_registered === id
            ? { ...m, id_machine_registered: updatedMch.id_machine_registered }
            : m
        )
      );
    }
  };
  const handleDeleteMachine = (id) =>
    setMachines((prev) => prev.filter((m) => m.id_machine_registered !== id));

  const handleUpdateType = (id, updatedType) => {
    setTypes((prev) => prev.map((t) => (t.id_type === id ? updatedType : t)));
    if (id !== updatedType.id_type) {
      setRawStock((prev) =>
        prev.map((s) =>
          s.type === id || s.id_type === id
            ? { ...s, type: updatedType.id_type, id_type: updatedType.id_type }
            : s
        )
      );
    }
  };
  const handleDeleteType = (id) => setTypes((prev) => prev.filter((t) => t.id_type !== id));

  const handleUpdateDesignation = (id, updatedDesig) => {
    setRawStock((prev) =>
      prev.map((s) =>
        s.ref === id
          ? {
              ...s,
              ref: updatedDesig.ref,
              designation: updatedDesig.designation,
              type: updatedDesig.id_type,
              id_type: updatedDesig.id_type,
              stockInitial: Number(updatedDesig.stockInitial),
              seuil: Number(updatedDesig.seuil),
              emplacement: updatedDesig.emplacement,
            }
          : s
      )
    );
  };
  const handleDeleteDesignation = (id) => setRawStock((prev) => prev.filter((s) => s.ref !== id));
  const handleUpdateDiagnostic = handleUpdateDesignation;
  const handleDeleteDiagnostic = handleDeleteDesignation;

  const handleUpdateFamily = (id, updatedFamily) => {
    setFamilies((prev) => prev.map((f) => (f.id_family === id ? updatedFamily : f)));
    if (id !== updatedFamily.id_family) {
      setTemplates((prev) =>
        prev.map((t) => (t.id_family === id ? { ...t, id_family: updatedFamily.id_family } : t))
      );
      setMachines((prev) =>
        prev.map((m) => (m.id_family === id ? { ...m, id_family: updatedFamily.id_family } : m))
      );
    }
  };
  const handleDeleteFamily = (id) => setFamilies((prev) => prev.filter((f) => f.id_family !== id));

  const handleUpdateTemplate = (id, updatedTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id_templates === id ? updatedTemplate : t)));
    if (id !== updatedTemplate.id_templates) {
      setMachines((prev) =>
        prev.map((m) =>
          m.id_templates === id ? { ...m, id_templates: updatedTemplate.id_templates } : m
        )
      );
    }
  };
  const handleDeleteTemplate = (id) =>
    setTemplates((prev) => prev.filter((t) => t.id_templates !== id));
  // ===================================

  const handleAddTechnician = (newTech) => {
    setTechnicians((prev) => [...prev, newTech]);
  };

  const handleUpdateTechnician = (id, updatedTech) => {
    setTechnicians((prev) => prev.map((t) => (t.id_technician === id ? updatedTech : t)));

    // Cascade update to Machines (technician field) if name changed
    const oldTech = technicians.find((t) => t.id_technician === id);
    if (oldTech && oldTech.nom !== updatedTech.nom) {
      setMachines((prev) =>
        prev.map((m) => (m.technician === oldTech.nom ? { ...m, technician: updatedTech.nom } : m))
      );
      // Cascade update to Mouvements if it stores the name
      setMouvements((prev) =>
        prev.map((m) => (m.technicien === oldTech.nom ? { ...m, technicien: updatedTech.nom } : m))
      );
    }
  };

  const handleDeleteTechnician = (id) => {
    setTechnicians((prev) => prev.filter((t) => t.id_technician !== id));
  };

  const handleAddOperation = (newOp) => {
    setOperations((prev) => [...prev, newOp]);
  };

  const handleAddMachine = (newMch) => {
    setMachines((prev) => [...prev, newMch]);
  };

  const handleAddArticle = (newArt) => {
    if (rawStock.some((s) => String(s.ref).toLowerCase() === String(newArt.ref).toLowerCase())) {
      showToast('Erreur: La référence existe déjà.', 'error');
      return;
    }
    setRawStock((prev) => [
      {
        id: crypto.randomUUID(),
        ...newArt,
      },
      ...prev,
    ]);
  };

  const handleAddMouvement = (newMvtOrArray) => {
    if (Array.isArray(newMvtOrArray)) {
      setMouvements((prev) => [...newMvtOrArray, ...prev]);
    } else {
      setMouvements((prev) => [newMvtOrArray, ...prev]);
    }
  };

  const { handleUpdate: handleUpdateArticle, handleDelete: handleDeleteArticle } = useGenericCRUD(
    setRawStock,
    'id'
  );
  const { handleUpdate: handleUpdateMouvement, handleDelete: handleDeleteMouvement } =
    useGenericCRUD(setMouvements, 'id');

  const handleQuickSortie = (article) => {
    // Navigate to Sortie Rapide tab
    React.startTransition(() => setCurrentTab('sortie'));
  };

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

    // 3. Mouvements
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mouvements), 'Mouvements');

    // 4. Types
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(types), 'Types');

    // 5. Diagnostics
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(diagnostics), 'Diagnostics');

    // 6. Families
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(families), 'Families');

    // 7. Templates
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(templates), 'Templates');

    // 8. Zones
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(zones), 'Zones');

    // 9. Technicians
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(technicians), 'Technicians');

    // 10. Operations
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(operations), 'Operations');

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
        if (importedData.Families && importedData.Families.length > 0)
          setFamilies(sanitizeObject(importedData.Families));
        if (importedData.Templates && importedData.Templates.length > 0)
          setTemplates(sanitizeObject(importedData.Templates));
        if (importedData.Zones && importedData.Zones.length > 0)
          setZones(sanitizeObject(importedData.Zones));
        if (importedData.Technicians && importedData.Technicians.length > 0)
          setTechnicians(sanitizeObject(importedData.Technicians));
        if (importedData.Operations && importedData.Operations.length > 0)
          setOperations(sanitizeObject(importedData.Operations));

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
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col md:pl-[270px] relative isolate select-none font-sans">
      {/* Background Excel Grid Subtle Lines & Ambient Tones (Identical to Splash Screen) */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#107c41_1px,transparent_1px)] [background-size:20px_20px] -z-10" />
      <div className="fixed -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        counts={{
          stock: stockItems.length,
          types: types.length,
          designations: designations.length,
          diagnostics: designations.length,
          machines: machines.length,
          families: families.length,
          templates: templates.length,
          zones: zones.length,
          technicians: technicians.length,
          operations: operations.length,
        }}
        currentUser={currentUser}
        onLogout={() => {
          storageService.removeItem('gmao_user_session');
          setCurrentUser(null);
        }}
      />

      {/* Header Bar */}
      <Header
        currentTab={currentTab}
        setMobileMenuOpen={setMobileMenuOpen}
        fileInputRef={fileInputRef}
        handleImportFile={handleImportFile}
        handleExportExcel={handleExportExcel}
        linkedFileName={linkedFileName}
        onDirectLink={handleDirectFileLink}
        onDirectSave={handleDirectSave}
      />

      {/* Main Content Area - Full Fluid Width with Lazy Loading Suspense */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
        <Suspense fallback={<LoadingSkeleton currentTab={currentTab} />}>
          {currentTab === 'dashboard' && (
            <ErrorBoundary>
              <DashboardView
                stockItems={stockItems}
                machines={machines}
                mouvements={mouvements}
                types={types}
                diagnostics={diagnostics}
                zones={zones}
                technicians={technicians}
                stockKPIs={stockKPIs}
                onNavigateToStock={() => React.startTransition(() => setCurrentTab('stock'))}
                onNavigateToMachines={() => React.startTransition(() => setCurrentTab('machines'))}
                onNavigateToSortie={() => React.startTransition(() => setCurrentTab('sortie'))}
                onQuickSortie={handleQuickSortie}
                onUpdateMouvement={handleUpdateMouvement}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'stock' && (
            <ErrorBoundary>
              <StockView
                stockItems={stockItems}
                filteredStock={filteredStock}
                stockSearch={stockSearch}
                setStockSearch={setStockSearch}
                stockTypeFilter={stockTypeFilter}
                setStockTypeFilter={setStockTypeFilter}
                stockAlertOnly={stockAlertOnly}
                setStockAlertOnly={setStockAlertOnly}
                types={types}
                onOpenAddArticle={() => setShowAddArticleModal(true)}
                onQuickSortie={handleQuickSortie}
                stockKPIs={stockKPIs}
                onNavigateToType={handleNavigateToStockFiltered}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'types' && (
            <ErrorBoundary>
              <TypeView
                types={types}
                designations={designations}
                stockItems={stockItems}
                onAddType={handleAddType}
                onUpdateType={handleUpdateType}
                onDeleteType={handleDeleteType}
                onNavigateToStockFiltered={handleNavigateToStockFiltered}
                onNavigateToDesignationsFiltered={handleNavigateToDesignationsFiltered}
              />
            </ErrorBoundary>
          )}

          {(currentTab === 'designations' || currentTab === 'diagnostics') && (
            <ErrorBoundary>
              <DesignationView
                designations={designations}
                types={types}
                stockItems={stockItems}
                desigTypeFilter={diagTypeFilter}
                setDesigTypeFilter={setDiagTypeFilter}
                onAddDesignation={handleAddDesignation}
                onUpdateDesignation={handleUpdateDesignation}
                onDeleteDesignation={handleDeleteDesignation}
                onOpenAddTypeModal={() => React.startTransition(() => setCurrentTab('types'))}
                onNavigateToStockFilteredByRef={handleNavigateToStockFilteredByRef}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'machines' && (
            <ErrorBoundary>
              <MachinesRegisteredView
                machines={machines}
                onUpdateMachine={handleUpdateMachine}
                onDeleteMachine={handleDeleteMachine}
                families={families}
                templates={templates}
                zones={zones}
                technicians={technicians}
                mouvements={mouvements}
                mchFamilyFilter={mchFamilyFilter}
                setMchFamilyFilter={setMchFamilyFilter}
                mchTemplateFilter={mchTemplateFilter}
                setMchTemplateFilter={setMchTemplateFilter}
                mchZoneFilter={mchZoneFilter}
                setMchZoneFilter={setMchZoneFilter}
                mchSearch={mchSearch}
                setMchSearch={setMchSearch}
                onOpenAddMachine={() => setShowAddMachineModal(true)}
                onNavigateToFamily={handleNavigateToMachinesByFamily}
                onNavigateToTemplate={handleNavigateToMachinesByTemplate}
                onNavigateToZone={handleNavigateToMachinesByZone}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'families' && (
            <ErrorBoundary>
              <FamilyView
                families={families}
                templates={templates}
                machines={machines}
                onAddFamily={handleAddFamily}
                onUpdateFamily={handleUpdateFamily}
                onDeleteFamily={handleDeleteFamily}
                onNavigateToTemplatesFiltered={handleNavigateToTemplatesFiltered}
                onNavigateToMachinesByFamily={handleNavigateToMachinesByFamily}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'templates' && (
            <ErrorBoundary>
              <TemplatesView
                templates={templates}
                families={families}
                machines={machines}
                templateFamilyFilter={templateFamilyFilter}
                setTemplateFamilyFilter={setTemplateFamilyFilter}
                onAddTemplate={handleAddTemplate}
                onUpdateTemplate={handleUpdateTemplate}
                onDeleteTemplate={handleDeleteTemplate}
                onOpenAddFamilyModal={() => React.startTransition(() => setCurrentTab('families'))}
                onNavigateToMachinesByTemplate={handleNavigateToMachinesByTemplate}
                onNavigateToFamilyFiltered={handleNavigateToTemplatesFiltered}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'zones' && (
            <ErrorBoundary>
              <ZonesView
                zones={zones}
                technicians={technicians}
                operations={operations}
                machines={machines}
                onAddZone={handleAddZone}
                onUpdateZone={handleUpdateZone}
                onDeleteZone={handleDeleteZone}
                onNavigateToTechsByZone={handleNavigateToTechsByZone}
                onNavigateToOpsByZone={handleNavigateToOpsByZone}
                onNavigateToMachinesByZone={handleNavigateToMachinesByZone}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'utilisateurs' && (
            <ErrorBoundary>
              <UtilisateursView
                technicians={technicians}
                operations={operations}
                zones={zones}
                mouvements={mouvements}
                onAddTechnician={handleAddTechnician}
                onUpdateTechnician={handleUpdateTechnician}
                onDeleteTechnician={handleDeleteTechnician}
                onAddOperation={handleAddOperation}
                onUpdateOperation={handleUpdateOperation}
                onDeleteOperation={handleDeleteOperation}
                onOpenAddZoneModal={() => React.startTransition(() => setCurrentTab('zones'))}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'sortie' && (
            <ErrorBoundary>
              <SortieRapideView
                mouvements={mouvements}
                stockItems={stockItems}
                zones={zones}
                machines={machines}
                technicians={technicians}
                operations={operations}
                onAddMouvement={handleAddMouvement}
                onUpdateMouvement={handleUpdateMouvement}
                onDeleteMouvement={handleDeleteMouvement}
                onOpenAddArticle={() => setShowAddArticleModal(true)}
                onOpenAddMachine={() => setShowAddMachineModal(true)}
                onOpenAddZone={() => setShowAddZoneModal(true)}
                onOpenAddTech={() => {
                  setAddUserModalType('TECHNICIEN');
                  setShowAddUserModal(true);
                }}
                onOpenAddChef={() => {
                  setAddUserModalType('CHEF');
                  setShowAddUserModal(true);
                }}
                onOpenAddOperator={() => {
                  setAddUserModalType('OPERATEUR');
                  setShowAddUserModal(true);
                }}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'nexus' && (
            <ErrorBoundary>
              <NexusView
                types={types}
                diagnostics={diagnostics}
                families={families}
                templates={templates}
                zones={zones}
                technicians={technicians}
                operations={operations}
                machines={machines}
                stockItems={stockItems}
              />
            </ErrorBoundary>
          )}

          {currentTab === 'guide' && (
            <ErrorBoundary>
              <GuideView />
            </ErrorBoundary>
          )}

          {currentTab === 'settings' && (
            <ErrorBoundary>
              <SettingsView
                rawStock={rawStock}
                setRawStock={setRawStock}
                mouvements={mouvements}
                setMouvements={setMouvements}
                machines={machines}
                setMachines={setMachines}
                families={families}
                setFamilies={setFamilies}
                templates={templates}
                setTemplates={setTemplates}
                zones={zones}
                setZones={setZones}
                technicians={technicians}
                setTechnicians={setTechnicians}
                operations={operations}
                setOperations={setOperations}
                types={types}
                setTypes={setTypes}
                showToast={showToast}
                linkedFileHandle={linkedFileHandle}
                setLinkedFileHandle={setLinkedFileHandle}
                linkedFileName={linkedFileName}
                setLinkedFileName={setLinkedFileName}
                onDirectLink={handleDirectFileLink}
                onDirectSave={handleDirectSave}
              />
            </ErrorBoundary>
          )}
        </Suspense>
      </main>

      {/* Quick Add Modals with Suspense */}
      <Suspense fallback={null}>
        <AddArticleModal
          isOpen={showAddArticleModal}
          onClose={() => setShowAddArticleModal(false)}
          types={types}
          onAddArticle={handleAddArticle}
          onOpenAddTypeModal={() => {
            setShowAddArticleModal(false);
            React.startTransition(() => setCurrentTab('types'));
          }}
        />

        <AddMachineModal
          isOpen={showAddMachineModal}
          onClose={() => setShowAddMachineModal(false)}
          families={families}
          templates={templates}
          zones={zones}
          technicians={technicians}
          machines={machines}
          onAddMachine={handleAddMachine}
          onUpdateMachine={handleUpdateMachine}
          onDeleteMachine={handleDeleteMachine}
          onOpenAddFamilyModal={() => {
            setShowAddMachineModal(false);
            React.startTransition(() => setCurrentTab('families'));
          }}
          onOpenAddTemplateModal={() => {
            setShowAddMachineModal(false);
            React.startTransition(() => setCurrentTab('templates'));
          }}
          onOpenAddZoneModal={() => {
            setShowAddMachineModal(false);
            setShowAddZoneModal(true);
          }}
          onOpenAddTechModal={() => {
            setShowAddMachineModal(false);
            setAddUserModalType('TECHNICIEN');
            setShowAddUserModal(true);
          }}
        />

        <AddUserModal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          zones={zones}
          technicians={technicians}
          operations={operations}
          initialType={addUserModalType}
          onAddTechnician={handleAddTechnician}
          onAddOperation={handleAddOperation}
          onOpenAddZoneModal={() => {
            setShowAddUserModal(false);
            setShowAddZoneModal(true);
          }}
        />

        <AddZoneModal
          isOpen={showAddZoneModal}
          onClose={() => setShowAddZoneModal(false)}
          zones={zones}
          onAddZone={handleAddZone}
        />
      </Suspense>

      {/* Global Notification Toast */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}
    </div>
  );
}
