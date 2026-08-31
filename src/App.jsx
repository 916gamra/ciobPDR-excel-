import React, { useState, useMemo, useRef, useEffect, lazy, Suspense } from 'react';
import * as XLSX from 'xlsx';
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
  mapItemToTypeAndDiag
} from './data/seedData';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoadingSkeleton from './components/LoadingSkeleton';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import Toast from './components/Toast';

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
import { indexedDBService } from './utils/indexedDBService';
import { safeNum, calculateStockStatus } from './utils/formulaEngine';

export default function App() {
  // Splash & Auth States
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => storageService.getItem('gmao_user_session') || null);

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
  const [types, setTypes] = useState(() => {
    const saved = storageService.getItem('gmao_types_v4');
    if (saved) return saved;
    const set = new Set();
    (initialData.Stock_Actuel || []).forEach((item) => {
      const t = String(item['Désignation'] || item['D\u00c3\u00a9signation'] || item.type || '').trim();
      if (t && t !== '3' && !/^\d+$/.test(t)) set.add(t);
    });
    if (!set.size) {
      ['Foret', 'Tenaille', 'Vis', 'Roulement', 'Courroie', 'Raccord', 'Cheville', 'Capteur', 'teflon'].forEach(t => set.add(t));
    }
    return Array.from(set).map((t) => ({ id_type: t, libelle: t }));
  });

  const [families, setFamilies] = useState(() => {
    const saved = storageService.getItem('gmao_families');
    return saved ? saved : (initialData.Families?.length ? initialData.Families : INITIAL_FAMILIES);
  });

  const [templates, setTemplates] = useState(() => {
    const saved = storageService.getItem('gmao_templates');
    return saved ? saved : (initialData.Templates?.length ? initialData.Templates : INITIAL_TEMPLATES);
  });

  const [machines, setMachines] = useState(() => {
    const saved = storageService.getItem('gmao_machines');
    return saved ? saved : (initialData.Machines_Registered?.length ? initialData.Machines_Registered : INITIAL_MACHINES_REGISTERED);
  });

  const [zones, setZones] = useState(() => {
    const saved = storageService.getItem('gmao_zones');
    return saved ? saved : (initialData.Zones?.length ? initialData.Zones : INITIAL_ZONES);
  });

  const [technicians, setTechnicians] = useState(() => {
    const saved = storageService.getItem('gmao_technicians');
    return saved ? saved : (initialData.Technicians?.length ? initialData.Technicians : INITIAL_TECHNICIANS);
  });

  const [operations, setOperations] = useState(() => {
    const saved = storageService.getItem('gmao_operations');
    return saved ? saved : (initialData.Operations?.length ? initialData.Operations : INITIAL_OPERATIONS);
  });

  const [mouvements, setMouvements] = useState(() => {
    const saved = storageService.getItem('gmao_mouvements');
    const rawList = saved ? saved : (initialData.Mouvement || []);
    return rawList.map((m, idx) => ({
      id: m.id || idx + 1,
      code_bon: m.code_bon || m['Code_Bon'] || m['Code Bon'] || m['N° Bon'] || `Bon-${String(idx + 1).padStart(3, '0')}`,
      num_commande: m.num_commande || m['N° Commande'] || m['Num_Commande'] || m['N° Demande'] || m['Code Demande'] || m.num_demande || '',
      date: m.date || (m.Date ? String(m.Date).split('T')[0] : '2026-07-16'),
      ref: m.ref || m['Référence'] || m['Reference'] || '',
      quantite: safeNum(m.quantite != null ? m.quantite : (m['Quantité'] != null ? m['Quantité'] : m['Quantite']), 1),
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
      usage_type: m.usage_type || ''
    }));
  });

  const [rawStock, setRawStock] = useState(() => {
    const saved = storageService.getItem('gmao_raw_stock_v6');
    const rawList = saved ? saved : (initialData.Stock_Actuel || []);

    const typeCounters = {};

    return rawList.map((item, idx) => {
      if (item.ref && item.designation && item.type && item.type !== '3' && !/^\d+$/.test(item.type) && item.designation !== item.ref && /^([A-Z0-9]+)\d{3}$/.test(item.ref)) {
        return item;
      }

      const rawArticleName = String(item.Ref != null ? item.Ref : (item.designation != null ? item.designation : `Pièce ${idx + 1}`)).trim();
      const rawType = String(item['Désignation'] || item['D\u00c3\u00a9signation'] || (typeof item.type === 'string' && !/^\d+$/.test(item.type) ? item.type : 'Divers')).trim();
      
      const typePrefix = rawType.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) || 'REF';
      typeCounters[typePrefix] = (typeCounters[typePrefix] || 0) + 1;
      const refCode = `${typePrefix}${String(typeCounters[typePrefix]).padStart(3, '0')}`;

      let initStock = 0;
      if (typeof item.Type === 'number' && !isNaN(item.Type)) {
        initStock = item.Type;
      } else if (typeof item['Stock Initial'] === 'number' && !isNaN(item['Stock Initial'])) {
        initStock = item['Stock Initial'];
      } else if (item.stockInitial != null) {
        initStock = safeNum(item.stockInitial, 0);
      }

      if (initStock === 0 && item['Stock Initial'] == null && item.stockInitial == null) {
        initStock = (idx % 12) + 1;
      }

      return {
        id: item.id || idx + 1,
        ref: refCode,
        designation: rawArticleName,
        type: rawType,
        id_type: rawType,
        stockInitial: initStock,
        seuil: safeNum(item.seuil != null ? item.seuil : (item["Seuil d'Alerte"] != null ? item["Seuil d'Alerte"] : Math.max(2, Math.floor(initStock * 0.25))), 3),
        emplacement: String(item.emplacement || item.Emplacement || `A${(idx % 8) + 1}-R${(idx % 6) + 1}`)
      };
    });
  });

  // Derive designations directly from rawStock for 100% synchronization & perfect ordering
  const designations = useMemo(() => {
    return rawStock.map((s) => ({
      id_designation: s.ref,
      ref: s.ref,
      designation: s.designation,
      id_type: s.type || s.id_type || 'Divers',
      type: s.type || s.id_type || 'Divers',
      stockInitial: s.stockInitial,
      seuil: s.seuil,
      emplacement: s.emplacement
    })).sort((a, b) => a.ref.localeCompare(b.ref, undefined, { numeric: true, sensitivity: 'base' }));
  }, [rawStock]);

  const diagnostics = designations;

  // Save to LocalStorage and IndexedDB (Debounced to avoid I/O bottlenecks during fast updates)
  useEffect(() => {
    const timer = setTimeout(() => {
      storageService.setItem('gmao_types_v4', types);
      storageService.setItem('gmao_designations_v2', designations);
      storageService.setItem('gmao_families', families);
      storageService.setItem('gmao_templates', templates);
      storageService.setItem('gmao_machines', machines);
      storageService.setItem('gmao_zones', zones);
      storageService.setItem('gmao_technicians', technicians);
      storageService.setItem('gmao_operations', operations);
      storageService.setItem('gmao_mouvements', mouvements);
      storageService.setItem('gmao_raw_stock_v6', rawStock);

      // High capacity IndexedDB backup
      indexedDBService.setItem('gmao_mouvements', mouvements);
      indexedDBService.setItem('gmao_raw_stock_v6', rawStock);
    }, 250);

    return () => clearTimeout(timer);
  }, [types, designations, families, templates, machines, zones, technicians, operations, mouvements, rawStock]);

  // Unique list of types in stock for filter dropdown
  const stockTypesList = useMemo(() => {
    const set = new Set();
    rawStock.forEach((s) => {
      if (s.type) set.add(s.type);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rawStock]);

  // Compute Full Stock with Dynamic Live Calculations (Formula F, G, H, J)
  const stockItems = useMemo(() => {
    // Map entries and sorties by ref
    const mvtSummary = {};
    mouvements.forEach((m) => {
      const r = String(m.ref || m['Référence'] || '').trim().toLowerCase();
      if (!r) return;
      if (!mvtSummary[r]) {
        mvtSummary[r] = { entrees: 0, sorties: 0 };
      }
      const q = safeNum(m.quantite != null ? m.quantite : m['Quantité'], 0);
      const t = String(m.type || m['Type (Entrée/Sortie)'] || '').toLowerCase();
      if (t.includes('entr')) {
        mvtSummary[r].entrees += q;
      } else {
        mvtSummary[r].sorties += q;
      }
    });

    return rawStock.map((item) => {
      const itemRefKey = item.ref.toLowerCase();
      const itemDesigKey = item.designation.toLowerCase();

      let entrees = (mvtSummary[itemRefKey]?.entrees || 0) + (mvtSummary[itemDesigKey]?.entrees || 0);
      let sorties = (mvtSummary[itemRefKey]?.sorties || 0) + (mvtSummary[itemDesigKey]?.sorties || 0);

      const stockInitial = safeNum(item.stockInitial, 0);
      const seuil = safeNum(item.seuil, 0);
      const { stockActuel, alerte } = calculateStockStatus(stockInitial, entrees, sorties, seuil);

      return {
        ...item,
        entrees,
        sorties,
        stockActuel,
        alerte
      };
    });
  }, [rawStock, mouvements]);

  // Filters State
  const [stockSearch, setStockSearch] = useState('');
  const [stockTypeFilter, setStockTypeFilter] = useState('ALL');
  const [stockAlertOnly, setStockAlertOnly] = useState(false);

  const [diagTypeFilter, setDiagTypeFilter] = useState('ALL');
  const [templateFamilyFilter, setTemplateFamilyFilter] = useState('ALL');

  const [mchFamilyFilter, setMchFamilyFilter] = useState('ALL');
  const [mchTemplateFilter, setMchTemplateFilter] = useState('ALL');
  const [mchZoneFilter, setMchZoneFilter] = useState('ALL');
  const [mchSearch, setMchSearch] = useState('');

  const [techZoneFilter, setTechZoneFilter] = useState('ALL');
  const [opZoneFilter, setOpZoneFilter] = useState('ALL');

  // Modals state
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

      if (stockSearch) {
        const q = stockSearch.toLowerCase();
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
  }, [stockItems, stockTypeFilter, stockAlertOnly, stockSearch]);

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
      alertes
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
        id: Date.now(),
        ref: newDesig.ref,
        designation: newDesig.designation,
        type: newDesig.id_type,
        id_type: newDesig.id_type,
        stockInitial: Number(newDesig.stockInitial) || 0,
        seuil: Number(newDesig.seuil) || 3,
        emplacement: newDesig.emplacement || 'A1-R1'
      },
      ...prev
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
    setZones(prev => prev.map(z => z.id_zone === id ? updatedZone : z));
    const oldZone = zones.find(z => z.id_zone === id);
    if (oldZone && oldZone.id_zone !== updatedZone.id_zone) {
      setTechnicians(prev => prev.map(t => t.id_zone === id ? { ...t, id_zone: updatedZone.id_zone } : t));
      setOperations(prev => prev.map(o => o.id_zone === id ? { ...o, id_zone: updatedZone.id_zone } : o));
      setMachines(prev => prev.map(m => m.id_zone_default === id ? { ...m, id_zone_default: updatedZone.id_zone } : m));
      setMouvements(prev => prev.map(m => m.id_zone === id ? { ...m, id_zone: updatedZone.id_zone } : m));
    }
  };
  const handleDeleteZone = (id) => setZones(prev => prev.filter(z => z.id_zone !== id));

  const handleUpdateOperation = (id, updatedOp) => {
    setOperations(prev => prev.map(o => o.id_operation === id ? updatedOp : o));
    const oldOp = operations.find(o => o.id_operation === id);
    if (oldOp && oldOp.nom !== updatedOp.nom) {
      setMouvements(prev => prev.map(m => m.operation === oldOp.nom ? { ...m, operation: updatedOp.nom } : m));
    }
  };
  const handleDeleteOperation = (id) => setOperations(prev => prev.filter(o => o.id_operation !== id));

  const handleUpdateMachine = (id, updatedMch) => {
    setMachines(prev => prev.map(m => m.id_machine_registered === id ? updatedMch : m));
    if (id !== updatedMch.id_machine_registered) {
      setMouvements(prev => prev.map(m => m.id_machine_registered === id ? { ...m, id_machine_registered: updatedMch.id_machine_registered } : m));
    }
  };
  const handleDeleteMachine = (id) => setMachines(prev => prev.filter(m => m.id_machine_registered !== id));

  const handleUpdateType = (id, updatedType) => {
    setTypes(prev => prev.map(t => t.id_type === id ? updatedType : t));
    if (id !== updatedType.id_type) {
      setRawStock(prev => prev.map(s => s.type === id || s.id_type === id ? { ...s, type: updatedType.id_type, id_type: updatedType.id_type } : s));
    }
  };
  const handleDeleteType = (id) => setTypes(prev => prev.filter(t => t.id_type !== id));

  const handleUpdateDesignation = (id, updatedDesig) => {
    setRawStock(prev => prev.map(s => s.ref === id ? { 
      ...s, 
      ref: updatedDesig.ref, 
      designation: updatedDesig.designation, 
      type: updatedDesig.id_type, 
      id_type: updatedDesig.id_type,
      stockInitial: Number(updatedDesig.stockInitial),
      seuil: Number(updatedDesig.seuil),
      emplacement: updatedDesig.emplacement
    } : s));
  };
  const handleDeleteDesignation = (id) => setRawStock(prev => prev.filter(s => s.ref !== id));
  const handleUpdateDiagnostic = handleUpdateDesignation;
  const handleDeleteDiagnostic = handleDeleteDesignation;

  const handleUpdateFamily = (id, updatedFamily) => {
    setFamilies(prev => prev.map(f => f.id_family === id ? updatedFamily : f));
    if (id !== updatedFamily.id_family) {
      setTemplates(prev => prev.map(t => t.id_family === id ? { ...t, id_family: updatedFamily.id_family } : t));
      setMachines(prev => prev.map(m => m.id_family === id ? { ...m, id_family: updatedFamily.id_family } : m));
    }
  };
  const handleDeleteFamily = (id) => setFamilies(prev => prev.filter(f => f.id_family !== id));

  const handleUpdateTemplate = (id, updatedTemplate) => {
    setTemplates(prev => prev.map(t => t.id_templates === id ? updatedTemplate : t));
    if (id !== updatedTemplate.id_templates) {
      setMachines(prev => prev.map(m => m.id_templates === id ? { ...m, id_templates: updatedTemplate.id_templates } : m));
    }
  };
  const handleDeleteTemplate = (id) => setTemplates(prev => prev.filter(t => t.id_templates !== id));
  // ===================================

  const handleAddTechnician = (newTech) => {
    setTechnicians((prev) => [...prev, newTech]);
  };

  const handleUpdateTechnician = (id, updatedTech) => {
    setTechnicians((prev) => prev.map((t) => t.id_technician === id ? updatedTech : t));
    
    // Cascade update to Machines (technician field) if name changed
    const oldTech = technicians.find(t => t.id_technician === id);
    if (oldTech && oldTech.nom !== updatedTech.nom) {
      setMachines((prev) => prev.map(m => m.technician === oldTech.nom ? { ...m, technician: updatedTech.nom } : m));
      // Cascade update to Mouvements if it stores the name
      setMouvements((prev) => prev.map(m => m.technicien === oldTech.nom ? { ...m, technicien: updatedTech.nom } : m));
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
    setRawStock((prev) => [
      {
        id: Date.now(),
        ...newArt
      },
      ...prev
    ]);
  };

  const handleAddMouvement = (newMvtOrArray) => {
    if (Array.isArray(newMvtOrArray)) {
      setMouvements((prev) => [...newMvtOrArray, ...prev]);
    } else {
      setMouvements((prev) => [newMvtOrArray, ...prev]);
    }
  };

  const handleDeleteMouvement = (mvtId) => {
    setMouvements((prev) => prev.filter((m) => m.id !== mvtId));
  };

  const handleUpdateMouvement = (mvtId, updatedMvt) => {
    setMouvements((prev) =>
      prev.map((m) => (m.id === mvtId ? { ...m, ...updatedMvt } : m))
    );
  };

  const handleQuickSortie = (article) => {
    // Navigate to Sortie Rapide tab
    React.startTransition(() => setCurrentTab('sortie'));
  };

  // AUTOMATIC BACKUP CREATOR
  const createAutomaticBackup = (reason = 'Importation Excel') => {
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR') + ' À ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
          diagnostics
        }
      };

      storageService.setItem(backupKey, backupData);

      const backupList = storageService.getItem('gmao_backups_list') || [];
      const updatedList = [
        { key: backupKey, date: dateStr, reason, itemsCount: rawStock.length, mvtsCount: mouvements.length },
        ...backupList
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
      Emplacement: s.emplacement
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
      Statut: m.status
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
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create Automatic Dated Backup before overwriting data
    const backupDate = createAutomaticBackup(`Importation : ${file.name}`);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        if (file.name.endsWith('.json')) {
          const json = JSON.parse(evt.target.result);
          if (json.Stock_Actuel) setRawStock(json.Stock_Actuel);
          if (json.Mouvement) setMouvements(json.Mouvement);
          if (json.Machines_Registered) setMachines(json.Machines_Registered);
          if (json.Families) setFamilies(json.Families);
          if (json.Templates) setTemplates(json.Templates);
          if (json.Zones) setZones(json.Zones);
          if (json.Technicians) setTechnicians(json.Technicians);
          if (json.Operations) setOperations(json.Operations);
          showToast(`Import JSON réussi ! (Backup daté du ${backupDate})`, 'success');
        } else {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
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
          if (workbook.SheetNames.includes('Types')) {
            const parsedTypes = XLSX.utils.sheet_to_json(workbook.Sheets['Types']);
            if (parsedTypes.length > 0) setTypes(parsedTypes);
          }
          if (workbook.SheetNames.includes('Families')) {
            const parsedFam = XLSX.utils.sheet_to_json(workbook.Sheets['Families']);
            if (parsedFam.length > 0) setFamilies(parsedFam);
          }
          if (workbook.SheetNames.includes('Zones')) {
            const parsedZones = XLSX.utils.sheet_to_json(workbook.Sheets['Zones']);
            if (parsedZones.length > 0) setZones(parsedZones);
          }
          showToast(`Import Excel réussi via XLSX.read ! (Backup daté du ${backupDate})`, 'success');
        }
      } catch (err) {
        console.error('Import error:', err);
        showToast('Erreur lors de l\'importation du fichier.', 'error');
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
      showToast('Liaison directe disponible sur Chrome/Edge. Basculement vers l\'import classique.', 'info');
      fileInputRef.current?.click();
      return;
    }

    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'Fichiers Excel GMAO (.xlsx)',
            accept: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx', '.xls']
            }
          }
        ],
        multiple: false
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
      showToast(`🔗 Fichier "${file.name}" lié en direct ! (Backup sauvegardé : ${backupDate})`, 'success');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Direct link error:', err);
        showToast('Erreur lors de l\'accès au fichier sélectionné.', 'error');
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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col md:pl-[270px]">
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
          operations: operations.length
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
            />
          )}

          {currentTab === 'stock' && (
            <StockView
              stockItems={stockItems}
              filteredStock={filteredStock}
              stockSearch={stockSearch}
              setStockSearch={setStockSearch}
              stockTypeFilter={stockTypeFilter}
              setStockTypeFilter={setStockTypeFilter}
              stockAlertOnly={stockAlertOnly}
              setStockAlertOnly={setStockAlertOnly}
              types={stockTypesList}
              onOpenAddArticle={() => setShowAddArticleModal(true)}
              onQuickSortie={handleQuickSortie}
              stockKPIs={stockKPIs}
              onNavigateToType={handleNavigateToStockFiltered}
            />
          )}

          {currentTab === 'types' && (
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
          )}

          {(currentTab === 'designations' || currentTab === 'diagnostics') && (
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
          )}

          {currentTab === 'machines' && (
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
          )}

          {currentTab === 'families' && (
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
          )}

          {currentTab === 'templates' && (
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
          )}

          {currentTab === 'zones' && (
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
          )}

          {currentTab === 'utilisateurs' && (
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
          )}

          {currentTab === 'sortie' && (
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
          )}

          {currentTab === 'nexus' && (
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
          )}

          {currentTab === 'guide' && <GuideView />}

          {currentTab === 'settings' && (
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
