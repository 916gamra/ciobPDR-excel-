import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import DashboardView from './components/DashboardView';
import StockView from './components/StockView';
import TypeView from './components/TypeView';
import DiagnosticView from './components/DiagnosticView';
import MachinesRegisteredView from './components/MachinesRegisteredView';
import FamilyView from './components/FamilyView';
import TemplatesView from './components/TemplatesView';
import ZonesView from './components/ZonesView';
import TechniciansView from './components/TechniciansView';
import OperationsView from './components/OperationsView';
import SortieRapideView from './components/SortieRapideView';
import NexusView from './components/NexusView';
import GuideView from './components/GuideView';

import AddArticleModal from './components/AddArticleModal';
import AddMachineModal from './components/AddMachineModal';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState('stock');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Core Data States
  const [types, setTypes] = useState(() => {
    const saved = localStorage.getItem('gmao_types');
    return saved ? JSON.parse(saved) : INITIAL_TYPES;
  });

  const [diagnostics, setDiagnostics] = useState(() => {
    const saved = localStorage.getItem('gmao_diagnostics');
    return saved ? JSON.parse(saved) : INITIAL_DIAGNOSTICS;
  });

  const [families, setFamilies] = useState(() => {
    const saved = localStorage.getItem('gmao_families');
    return saved ? JSON.parse(saved) : (initialData.Families?.length ? initialData.Families : INITIAL_FAMILIES);
  });

  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('gmao_templates');
    return saved ? JSON.parse(saved) : (initialData.Templates?.length ? initialData.Templates : INITIAL_TEMPLATES);
  });

  const [machines, setMachines] = useState(() => {
    const saved = localStorage.getItem('gmao_machines');
    return saved ? JSON.parse(saved) : (initialData.Machines_Registered?.length ? initialData.Machines_Registered : INITIAL_MACHINES_REGISTERED);
  });

  const [zones, setZones] = useState(() => {
    const saved = localStorage.getItem('gmao_zones');
    return saved ? JSON.parse(saved) : (initialData.Zones?.length ? initialData.Zones : INITIAL_ZONES);
  });

  const [technicians, setTechnicians] = useState(() => {
    const saved = localStorage.getItem('gmao_technicians');
    return saved ? JSON.parse(saved) : (initialData.Technicians?.length ? initialData.Technicians : INITIAL_TECHNICIANS);
  });

  const [operations, setOperations] = useState(() => {
    const saved = localStorage.getItem('gmao_operations');
    return saved ? JSON.parse(saved) : (initialData.Operations?.length ? initialData.Operations : INITIAL_OPERATIONS);
  });

  const [mouvements, setMouvements] = useState(() => {
    const saved = localStorage.getItem('gmao_mouvements');
    const rawList = saved ? JSON.parse(saved) : (initialData.Mouvement || []);
    return rawList.map((m, idx) => ({
      id: m.id || idx + 1,
      date: m.date || (m.Date ? String(m.Date).split('T')[0] : '2026-07-16'),
      ref: m.ref || m['Référence'] || m['Reference'] || '',
      quantite: Number(m.quantite != null ? m.quantite : (m['Quantité'] != null ? m['Quantité'] : m['Quantite'])) || 1,
      type: m.type || m['Type (Entrée/Sortie)'] || 'Sortie',
      action_id: m.action_id || m['Action_ID'] || 'CORRECTIVE',
      technicien: m.technicien || m.id_technician || 'Rachid',
      id_zone: m.id_zone || 'ZONE-01',
      id_machine_registered: m.id_machine_registered || '',
      operation: m.operation || m.id_operation || '',
      commentaire: m.commentaire || m['Commentaire / Motif'] || '',
      demandeur: m.demandeur || m.Demandeur || ''
    }));
  });

  const [rawStock, setRawStock] = useState(() => {
    const saved = localStorage.getItem('gmao_raw_stock');
    const rawList = saved ? JSON.parse(saved) : (initialData.Stock_Actuel || []);

    const seenRefs = new Set();
    return rawList.map((item, idx) => {
      let baseRef = String(item.Ref != null ? item.Ref : (item.ref != null ? item.ref : `ART-${idx + 1}`)).trim();
      let ref = baseRef;
      if (seenRefs.has(ref)) {
        ref = `${baseRef} #${idx + 1}`;
      }
      seenRefs.add(ref);

      const designation = String(item.designation || item['Désignation'] || item['D\u00c3\u00a9signation'] || item['Designation'] || ref);
      const initialType = item.type || item.Type;
      
      const { id_type, id_diag } = (item.id_type && item.id_diag)
        ? { id_type: item.id_type, id_diag: item.id_diag }
        : mapItemToTypeAndDiag(designation);

      return {
        id: item.id || idx + 1,
        ref: ref,
        designation: designation,
        id_type: id_type,
        id_diag: id_diag,
        type: typeof initialType === 'string' ? initialType : 'Standard',
        stockInitial: Number(item.stockInitial != null ? item.stockInitial : (item['Stock Initial'] != null ? item['Stock Initial'] : 10)) || 0,
        seuil: Number(item.seuil != null ? item.seuil : (item["Seuil d'Alerte"] != null ? item["Seuil d'Alerte"] : 3)) || 0,
        emplacement: String(item.emplacement || item.Emplacement || `R${(idx % 4) + 1}-B${String((idx % 12) + 1).padStart(2, '0')}`)
      };
    });
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('gmao_types', JSON.stringify(types));
      localStorage.setItem('gmao_diagnostics', JSON.stringify(diagnostics));
      localStorage.setItem('gmao_families', JSON.stringify(families));
      localStorage.setItem('gmao_templates', JSON.stringify(templates));
      localStorage.setItem('gmao_machines', JSON.stringify(machines));
      localStorage.setItem('gmao_zones', JSON.stringify(zones));
      localStorage.setItem('gmao_technicians', JSON.stringify(technicians));
      localStorage.setItem('gmao_operations', JSON.stringify(operations));
      localStorage.setItem('gmao_mouvements', JSON.stringify(mouvements));
      localStorage.setItem('gmao_raw_stock', JSON.stringify(rawStock));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [types, diagnostics, families, templates, machines, zones, technicians, operations, mouvements, rawStock]);

  // Compute Full Stock with Dynamic Live Calculations (Formula F, G, H, J)
  const stockItems = useMemo(() => {
    // Map entries and sorties by ref
    const mvtSummary = {};
    mouvements.forEach((m) => {
      const r = m.ref;
      if (!mvtSummary[r]) {
        mvtSummary[r] = { entrees: 0, sorties: 0 };
      }
      const q = Number(m.quantite) || 0;
      if (m.type === 'Entrée' || m.type === 'Entree') {
        mvtSummary[r].entrees += q;
      } else {
        mvtSummary[r].sorties += q;
      }
    });

    return rawStock.map((item) => {
      const mvt = mvtSummary[item.ref] || { entrees: 0, sorties: 0 };
      const entrees = mvt.entrees;
      const sorties = mvt.sorties;
      const stockInitial = Number(item.stockInitial) || 0;
      const seuil = Number(item.seuil) || 0;
      const stockActuel = stockInitial + entrees - sorties;

      let alerte = 'OK';
      if (stockActuel <= 0) {
        alerte = 'RUPTURE';
      } else if (stockActuel <= seuil) {
        alerte = 'ALERTE';
      }

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
  const [stockDiagFilter, setStockDiagFilter] = useState('ALL');
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

  // Filtered Stock Items
  const filteredStock = useMemo(() => {
    return stockItems.filter((item) => {
      if (stockTypeFilter !== 'ALL' && item.id_type !== stockTypeFilter) return false;
      if (stockDiagFilter !== 'ALL' && item.id_diag !== stockDiagFilter) return false;
      if (stockAlertOnly && item.alerte === 'OK') return false;

      if (stockSearch) {
        const q = stockSearch.toLowerCase();
        return (
          item.ref.toLowerCase().includes(q) ||
          item.designation.toLowerCase().includes(q) ||
          (item.id_type && item.id_type.toLowerCase().includes(q)) ||
          (item.id_diag && item.id_diag.toLowerCase().includes(q)) ||
          (item.emplacement && item.emplacement.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [stockItems, stockTypeFilter, stockDiagFilter, stockAlertOnly, stockSearch]);

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
    setStockDiagFilter('ALL');
    setStockAlertOnly(false);
    setCurrentTab('stock');
  };

  const handleNavigateToStockFilteredByDiag = (diagId) => {
    setStockDiagFilter(diagId);
    setStockTypeFilter('ALL');
    setStockAlertOnly(false);
    setCurrentTab('stock');
  };

  const handleNavigateToDiagFiltered = (typeId) => {
    setDiagTypeFilter(typeId);
    setCurrentTab('diagnostics');
  };

  const handleNavigateToTemplatesFiltered = (familyId) => {
    setTemplateFamilyFilter(familyId);
    setCurrentTab('templates');
  };

  const handleNavigateToMachinesByFamily = (familyId) => {
    setMchFamilyFilter(familyId);
    setMchTemplateFilter('ALL');
    setCurrentTab('machines');
  };

  const handleNavigateToMachinesByTemplate = (familyId, templateId) => {
    setMchFamilyFilter(familyId);
    setMchTemplateFilter(templateId);
    setCurrentTab('machines');
  };

  const handleNavigateToTechsByZone = (zoneId) => {
    setTechZoneFilter(zoneId);
    setCurrentTab('technicians');
  };

  const handleNavigateToOpsByZone = (zoneId) => {
    setOpZoneFilter(zoneId);
    setCurrentTab('operations');
  };

  const handleNavigateToMachinesByZone = (zoneId) => {
    setMchZoneFilter(zoneId);
    setCurrentTab('machines');
  };

  // ADD ENTITY HANDLERS
  const handleAddType = (newType) => {
    setTypes((prev) => [...prev, newType]);
  };

  const handleAddDiagnostic = (newDiag) => {
    setDiagnostics((prev) => [...prev, newDiag]);
  };

  const handleAddFamily = (newFam) => {
    setFamilies((prev) => [...prev, newFam]);
  };

  const handleAddTemplate = (newTpl) => {
    setTemplates((prev) => [...prev, newTpl]);
  };

  const handleAddZone = (newZone) => {
    setZones((prev) => [...prev, newZone]);
  };

  const handleAddTechnician = (newTech) => {
    setTechnicians((prev) => [...prev, newTech]);
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

  const handleAddMouvement = (newMvt) => {
    setMouvements((prev) => [newMvt, ...prev]);
  };

  const handleDeleteMouvement = (mvtId) => {
    setMouvements((prev) => prev.filter((m) => m.id !== mvtId));
  };

  const handleQuickSortie = (article) => {
    // Navigate to Sortie Rapide tab
    setCurrentTab('sortie');
  };

  // EXCEL EXPORT HANDLER
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Stock (Articles)
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
    const wsStock = XLSX.utils.json_to_sheet(stockData);
    XLSX.utils.book_append_sheet(wb, wsStock, 'Stock_Actuel');

    // 2. Machines Registered
    const mchData = machines.map((m) => ({
      'Code Machine (Ref)': m.id_machine_registered,
      Désignation: m.designation,
      ID_Family: m.id_family,
      ID_Template: m.id_templates,
      Zone_Default: m.id_zone_default,
      Technicien: m.technician,
      Statut: m.status
    }));
    const wsMch = XLSX.utils.json_to_sheet(mchData);
    XLSX.utils.book_append_sheet(wb, wsMch, 'Machines_Registered');

    // 3. Mouvements
    const wsMvt = XLSX.utils.json_to_sheet(mouvements);
    XLSX.utils.book_append_sheet(wb, wsMvt, 'Mouvements');

    // 4. Types
    const wsTypes = XLSX.utils.json_to_sheet(types);
    XLSX.utils.book_append_sheet(wb, wsTypes, 'Types');

    // 5. Diagnostics
    const wsDiag = XLSX.utils.json_to_sheet(diagnostics);
    XLSX.utils.book_append_sheet(wb, wsDiag, 'Diagnostics');

    // 6. Families
    const wsFam = XLSX.utils.json_to_sheet(families);
    XLSX.utils.book_append_sheet(wb, wsFam, 'Families');

    // 7. Templates
    const wsTpl = XLSX.utils.json_to_sheet(templates);
    XLSX.utils.book_append_sheet(wb, wsTpl, 'Templates');

    // 8. Zones
    const wsZones = XLSX.utils.json_to_sheet(zones);
    XLSX.utils.book_append_sheet(wb, wsZones, 'Zones');

    // 9. Technicians
    const wsTech = XLSX.utils.json_to_sheet(technicians);
    XLSX.utils.book_append_sheet(wb, wsTech, 'Technicians');

    // 10. Operations
    const wsOps = XLSX.utils.json_to_sheet(operations);
    XLSX.utils.book_append_sheet(wb, wsOps, 'Operations');

    XLSX.writeFile(wb, `GMAO_Light_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // FILE IMPORT HANDLER
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
          alert('Import JSON réussi !');
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
          alert('Import Excel réussi !');
        }
      } catch (err) {
        console.error('Import error:', err);
        alert('Erreur lors de l\'import du fichier.');
      }
    };

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

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
          diagnostics: diagnostics.length,
          machines: machines.length,
          families: families.length,
          templates: templates.length,
          zones: zones.length,
          technicians: technicians.length,
          operations: operations.length
        }}
      />

      {/* Header Bar */}
      <Header
        currentTab={currentTab}
        setMobileMenuOpen={setMobileMenuOpen}
        fileInputRef={fileInputRef}
        handleImportFile={handleImportFile}
        handleExportExcel={handleExportExcel}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
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
            onNavigateToStock={() => setCurrentTab('stock')}
            onNavigateToMachines={() => setCurrentTab('machines')}
            onNavigateToSortie={() => setCurrentTab('sortie')}
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
            stockDiagFilter={stockDiagFilter}
            setStockDiagFilter={setStockDiagFilter}
            stockAlertOnly={stockAlertOnly}
            setStockAlertOnly={setStockAlertOnly}
            types={types}
            diagnostics={diagnostics}
            onOpenAddArticle={() => setShowAddArticleModal(true)}
            onQuickSortie={handleQuickSortie}
            stockKPIs={stockKPIs}
            onNavigateToType={handleNavigateToStockFiltered}
            onNavigateToDiag={handleNavigateToStockFilteredByDiag}
          />
        )}

        {currentTab === 'types' && (
          <TypeView
            types={types}
            diagnostics={diagnostics}
            stockItems={stockItems}
            onAddType={handleAddType}
            onNavigateToStockFiltered={handleNavigateToStockFiltered}
            onNavigateToDiagFiltered={handleNavigateToDiagFiltered}
          />
        )}

        {currentTab === 'diagnostics' && (
          <DiagnosticView
            diagnostics={diagnostics}
            types={types}
            stockItems={stockItems}
            diagTypeFilter={diagTypeFilter}
            setDiagTypeFilter={setDiagTypeFilter}
            onAddDiagnostic={handleAddDiagnostic}
            onOpenAddTypeModal={() => setCurrentTab('types')}
            onNavigateToStockFilteredByDiag={handleNavigateToStockFilteredByDiag}
            onNavigateToTypeFiltered={handleNavigateToDiagFiltered}
          />
        )}

        {currentTab === 'machines' && (
          <MachinesRegisteredView
            machines={machines}
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
            onOpenAddFamilyModal={() => setCurrentTab('families')}
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
            onNavigateToTechsByZone={handleNavigateToTechsByZone}
            onNavigateToOpsByZone={handleNavigateToOpsByZone}
            onNavigateToMachinesByZone={handleNavigateToMachinesByZone}
          />
        )}

        {currentTab === 'technicians' && (
          <TechniciansView
            technicians={technicians}
            zones={zones}
            mouvements={mouvements}
            techZoneFilter={techZoneFilter}
            setTechZoneFilter={setTechZoneFilter}
            onAddTechnician={handleAddTechnician}
            onOpenAddZoneModal={() => setCurrentTab('zones')}
            onNavigateToZoneFiltered={handleNavigateToTechsByZone}
          />
        )}

        {currentTab === 'operations' && (
          <OperationsView
            operations={operations}
            zones={zones}
            mouvements={mouvements}
            opZoneFilter={opZoneFilter}
            setOpZoneFilter={setOpZoneFilter}
            onAddOperation={handleAddOperation}
            onOpenAddZoneModal={() => setCurrentTab('zones')}
            onNavigateToZoneFiltered={handleNavigateToOpsByZone}
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
            onDeleteMouvement={handleDeleteMouvement}
            onOpenAddArticle={() => setShowAddArticleModal(true)}
            onOpenAddMachine={() => setShowAddMachineModal(true)}
            onOpenAddZone={() => setCurrentTab('zones')}
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
      </main>

      {/* Quick Add Modals */}
      <AddArticleModal
        isOpen={showAddArticleModal}
        onClose={() => setShowAddArticleModal(false)}
        types={types}
        diagnostics={diagnostics}
        onAddArticle={handleAddArticle}
        onOpenAddTypeModal={() => {
          setShowAddArticleModal(false);
          setCurrentTab('types');
        }}
        onOpenAddDiagModal={() => {
          setShowAddArticleModal(false);
          setCurrentTab('diagnostics');
        }}
      />

      <AddMachineModal
        isOpen={showAddMachineModal}
        onClose={() => setShowAddMachineModal(false)}
        families={families}
        templates={templates}
        zones={zones}
        technicians={technicians}
        onAddMachine={handleAddMachine}
        onOpenAddFamilyModal={() => {
          setShowAddMachineModal(false);
          setCurrentTab('families');
        }}
        onOpenAddTemplateModal={() => {
          setShowAddMachineModal(false);
          setCurrentTab('templates');
        }}
        onOpenAddZoneModal={() => {
          setShowAddMachineModal(false);
          setCurrentTab('zones');
        }}
        onOpenAddTechModal={() => {
          setShowAddMachineModal(false);
          setCurrentTab('technicians');
        }}
      />
    </div>
  );
}
