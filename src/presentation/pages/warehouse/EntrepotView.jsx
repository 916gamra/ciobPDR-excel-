import React, { useState, useRef, useMemo, useEffect } from 'react';
import AnimatedPage from '../../components/common/AnimatedPage';
import CustomSelect from '../../components/common/CustomSelect';
import QuickMovementModal from './QuickMovementModal';
import { generateWarehouseItemCode } from '../../../data/seedData';
import { storageService } from '../../../utils/storageService';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  ArrowRight,
  MapPin,
  Users,
  User,
  FolderTree,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Warehouse,
  Factory,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Tag,
  Hash,
  Info,
  Clock,
  Check,
  X,
  Building2,
  Scale,
  Package,
  XCircle,
  FileSpreadsheet,
  Zap,
  MoreVertical,
  Activity,
  TrendingUp,
  SwatchBook,
} from 'lucide-react';
import { Engine } from '../../components/common/icons/Engine';
import { CubeIcon } from '../../components/common/icons/CubeIcon';

export default function EntrepotView({
  warehouseItems = [],
  families: propFamilies = [],
  templates: propTemplates = [],
  types: propTypes = [],
  diagnostics: propDiagnostics = [],
  compFamilies = [],
  compTemplates = [],
  partTypes = [],
  partDesignations = [],
  stockItems = [],
  zones = [],
  machines = [],
  technicians = [],
  mouvements = [],
  whFamilyFilter = 'ALL',
  setWhFamilyFilter,
  whTemplateFilter = 'ALL',
  setWhTemplateFilter,
  whTypeFilter = 'ALL',
  setWhTypeFilter,
  whNatureFilter = 'ALL',
  setWhNatureFilter,
  whRattachementFilter = 'ALL',
  setWhRattachementFilter,
  whStatusFilter = 'ALL',
  setWhStatusFilter,
  whSearch = '',
  setWhSearch,
  onAddWarehouseItem,
  onUpdateWarehouseItem,
  onDeleteWarehouseItem,
  onAddMouvement,
  onUpdateFamily,
  onNavigateToFamily,
  onNavigateToTemplate,
  onNavigateToType,
  onNavigateToDiag,
  onNavigateToZone,
  onNavigateToMachine,
}) {
  const families = compFamilies && compFamilies.length > 0 ? compFamilies : propFamilies;
  const templates = compTemplates && compTemplates.length > 0 ? compTemplates : propTemplates;
  const types = partTypes && partTypes.length > 0 ? partTypes : propTypes;
  const diagnostics = partDesignations && partDesignations.length > 0 ? partDesignations : propDiagnostics;
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [toEdit, setToEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);

  // Quick Action / Movement Modal State
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);
  const [quickModalState, setQuickModalState] = useState({
    isOpen: false,
    article: null,
    initialFlow: 'Sortie Interne',
    initialAction: 'CORRECTIVE',
  });

  // Local filter states if not provided via props
  const [internalFamilyFilter, setInternalFamilyFilter] = useState('ALL');
  const [internalTemplateFilter, setInternalTemplateFilter] = useState('ALL');
  const [internalTypeFilter, setInternalTypeFilter] = useState('ALL');
  const [internalNatureFilter, setInternalNatureFilter] = useState('ALL');
  const [internalRattachementFilter, setInternalRattachementFilter] = useState('ALL');
  const [internalStatusFilter, setInternalStatusFilter] = useState('ALL');
  const [activeKpiFilter, setActiveKpiFilter] = useState('ALL'); // ALL | 'COMPONENT' | 'PART' | 'SERVICE' | 'RESERVE'

  // Backward compatibility nature matchers
  const isComponentNature = (n) => n === 'COMPONENT' || n === 'PARTIE';
  const isPartNature = (n) => n === 'PART' || n === 'COMPOSANT';

  const currentFamilyFilter = whFamilyFilter !== undefined ? whFamilyFilter : internalFamilyFilter;
  const changeFamilyFilter = setWhFamilyFilter || setInternalFamilyFilter;

  const currentTemplateFilter =
    whTemplateFilter !== undefined ? whTemplateFilter : internalTemplateFilter;
  const changeTemplateFilter = setWhTemplateFilter || setInternalTemplateFilter;

  const currentTypeFilter = whTypeFilter !== undefined ? whTypeFilter : internalTypeFilter;
  const changeTypeFilter = setWhTypeFilter || setInternalTypeFilter;

  const currentNatureFilter = whNatureFilter !== undefined ? whNatureFilter : internalNatureFilter;
  const changeNatureFilter = setWhNatureFilter || setInternalNatureFilter;

  const currentRattachementFilter =
    whRattachementFilter !== undefined ? whRattachementFilter : internalRattachementFilter;
  const changeRattachementFilter = setWhRattachementFilter || setInternalRattachementFilter;

  const currentStatusFilter = whStatusFilter !== undefined ? whStatusFilter : internalStatusFilter;
  const changeStatusFilter = setWhStatusFilter || setInternalStatusFilter;

  // Debounce search
  const [localSearch, setLocalSearch] = useState(whSearch);

  useEffect(() => {
    setLocalSearch(whSearch);
  }, [whSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (setWhSearch) setWhSearch(localSearch);
    }, 200);
    return () => clearTimeout(handler);
  }, [localSearch, setWhSearch]);

  // Form state for add modal (Dual Twin)
  const [familyComponentCodes, setFamilyComponentCodes] = useState(() => {
    const initialMap = {};
    // 1. From families table (primary source of truth)
    (families || []).forEach((f) => {
      if (f.id_family && f.componentCode) {
        initialMap[f.id_family] = String(f.componentCode).toUpperCase().trim();
      }
    });

    // 2. From saved storage (handles plain object, JSON string, or storageService cache)
    try {
      const saved = storageService.getItem('gmao_family_component_codes_v1');
      if (saved) {
        if (typeof saved === 'object' && saved !== null) {
          Object.assign(initialMap, saved);
        } else if (typeof saved === 'string' && !saved.startsWith('WC:')) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object') {
              Object.assign(initialMap, parsed);
            }
          } catch {
            // Ignore non-JSON strings
          }
        }
      }
    } catch (e) {
      // Ignore storage errors gracefully
    }

    // 3. From existing items in warehouseItems
    (warehouseItems || []).forEach((item) => {
      if (isComponentNature(item.nature) && item.id_family && item.id_warehouse_item) {
        if (!initialMap[item.id_family]) {
          const match = String(item.id_warehouse_item).match(/^([A-Z0-9]+)-/i);
          if (match) {
            initialMap[item.id_family] = match[1].toUpperCase();
          }
        }
      }
    });

    if (!initialMap['FAM-EXT']) initialMap['FAM-EXT'] = 'EXT';
    if (!initialMap['FAM-MOT']) initialMap['FAM-MOT'] = 'MOT';
    if (!initialMap['FAM-POM']) initialMap['FAM-POM'] = 'POM';
    if (!initialMap['FAM-RED']) initialMap['FAM-RED'] = 'RED';
    if (!initialMap['FAM-EMB']) initialMap['FAM-EMB'] = 'EMB';
    if (!initialMap['FAM-USI']) initialMap['FAM-USI'] = 'USI';
    if (!initialMap['FAM-DEC']) initialMap['FAM-DEC'] = 'DEC';
    if (!initialMap['FAM-ASSEM']) initialMap['FAM-ASSEM'] = 'ASS';
    if (!initialMap['FAM-COUR']) initialMap['FAM-COUR'] = 'COUR';
    return initialMap;
  });

  // Persist familyComponentCodes via storageService
  useEffect(() => {
    try {
      storageService.setItem('gmao_family_component_codes_v1', familyComponentCodes);
    } catch (e) {
      // Ignore storage errors gracefully
    }
  }, [familyComponentCodes]);

  // Helper to calculate next sequential component code based on Family Prefix
  const getNextFamilyComponentCode = (familyId, customPrefix = '', items = warehouseItems) => {
    let prefix = customPrefix || familyComponentCodes[familyId] || '';
    if (!prefix && familyId) {
      const famObj = families.find((f) => f.id_family === familyId);
      if (famObj && famObj.componentCode) {
        prefix = famObj.componentCode;
      } else {
        const raw = (famObj ? famObj.libelle : familyId)
          .replace(/^FAM-?/i, '')
          .replace(/[^A-Z0-9]/gi, '')
          .toUpperCase()
          .slice(0, 4);
        prefix = raw || 'CMP';
      }
    }
    prefix = prefix.toUpperCase().trim();
    if (!prefix) return '';

    let maxIdx = 0;
    items.forEach((it) => {
      if (isComponentNature(it.nature)) {
        const code = String(it.id_warehouse_item || '').toUpperCase();
        if (code.startsWith(prefix + '-')) {
          const match = code.match(new RegExp(`^${prefix}-(\\d+)`, 'i'));
          if (match) {
            const n = parseInt(match[1], 10);
            if (!isNaN(n) && n > maxIdx) maxIdx = n;
          }
        }
      }
    });
    return `${prefix}-${String(maxIdx + 1).padStart(2, '0')}`;
  };

  // Helper to calculate next auto Reference for PARTS based on Type (e.g. VIS-01, ROUL-01, RACC-01)
  const getNextPartRef = (typeId, items = warehouseItems) => {
    if (!typeId) return 'PART-01';
    let prefix = '';
    const clean = String(typeId).toUpperCase();
    if (clean.includes('VIS') || clean.includes('FIX')) prefix = 'VIS';
    else if (clean.includes('ROUL') || clean.includes('MEC')) prefix = 'ROUL';
    else if (clean.includes('RACC') || clean.includes('PNE')) prefix = 'RACC';
    else if (clean.includes('ELE') || clean.includes('CAPT')) prefix = 'ELEC';
    else if (clean.includes('COU') || clean.includes('LAME')) prefix = 'COU';
    else if (clean.includes('CON') || clean.includes('POLY')) prefix = 'CONS';
    else if (clean.includes('OUT')) prefix = 'OUT';
    else {
      prefix = clean.replace(/^TYPE-?/i, '').replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'PART';
    }

    let maxIdx = 0;
    items.forEach((it) => {
      if (isPartNature(it.nature)) {
        const code = String(it.id_warehouse_item || it.ref || '').toUpperCase();
        if (code.startsWith(prefix + '-') || code.startsWith(prefix)) {
          const match = code.match(new RegExp(`^${prefix}[-_]?(\\d+)`, 'i'));
          if (match) {
            const n = parseInt(match[1], 10);
            if (!isNaN(n) && n > maxIdx) maxIdx = n;
          }
        }
      }
    });
    return `${prefix}-${String(maxIdx + 1).padStart(2, '0')}`;
  };

  // Cascade Update: When a family prefix is changed, update state, families table, and rename existing components
  const handleCascadeFamilyPrefixUpdate = (familyId, newPrefix) => {
    const cleanPrefix = (newPrefix || '').toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
    if (!familyId || !cleanPrefix) return;

    // 1. Update dictionary state
    setFamilyComponentCodes((prev) => ({
      ...prev,
      [familyId]: cleanPrefix,
    }));

    // 2. Update Family in families table if onUpdateFamily exists
    if (onUpdateFamily) {
      const fam = families.find((f) => f.id_family === familyId);
      if (fam) {
        onUpdateFamily(familyId, {
          ...fam,
          componentCode: cleanPrefix,
        });
      }
    }

    // 3. Cascade rename all existing components under this family
    if (onUpdateWarehouseItem) {
      const matchingComponents = warehouseItems.filter(
        (it) => isComponentNature(it.nature) && it.id_family === familyId
      );

      matchingComponents.forEach((item, index) => {
        const oldCode = item.id_warehouse_item;
        const numMatch = String(oldCode).match(/-(\d+)$/);
        const seqNum = numMatch ? numMatch[1] : String(index + 1).padStart(2, '0');
        const newCode = `${cleanPrefix}-${seqNum}`;

        if (oldCode !== newCode) {
          onUpdateWarehouseItem(oldCode, {
            ...item,
            id_warehouse_item: newCode,
          });
        }
      });
    }
  };

  const [addForm, setAddForm] = useState({
    id_warehouse_item: '',
    designation: '',
    nature: 'COMPONENT', // 'COMPONENT' (Machine Twin) | 'PART' (Stock Twin)
    id_family: '',
    family_prefix: '', // Prefix stored/entered for this family (e.g. EXT)
    id_templates: '',
    id_type: '',
    id_diag: '',
    rattachement_type: 'ENTREPOT', // 'MACHINE' | 'ZONE' | 'ENTREPOT'
    id_machine_registered: '',
    id_zone: '',
    technician: '',
    status: 'En stock (Disponible)',
    emplacement: 'E-MAG-01',
    stockInitial: 1,
    seuil: 0,
    remarques: '',
  });

  // Form state for edit modal
  const [editForm, setEditForm] = useState({
    id_warehouse_item: '',
    designation: '',
    nature: 'COMPONENT',
    id_family: '',
    id_templates: '',
    id_type: '',
    id_diag: '',
    rattachement_type: 'ENTREPOT',
    id_machine_registered: '',
    id_zone: '',
    technician: '',
    status: 'En stock (Disponible)',
    emplacement: '',
    stockInitial: 1,
    seuil: 0,
    remarques: '',
  });

  // Open Add Modal initialized with smart auto-code
  const handleOpenAddModal = () => {
    const defaultFam = families[0]?.id_family || 'FAM-MOT';
    const relTemplates = templates.filter((t) => t.id_family === defaultFam);
    const defaultTpl = relTemplates[0]?.id_templates || templates[0]?.id_templates || '';
    const prefix = familyComponentCodes[defaultFam] || '';
    const autoCode = getNextFamilyComponentCode(defaultFam, prefix);
    const defaultTplObj = templates.find((t) => t.id_templates === defaultTpl);

    setAddForm({
      id_warehouse_item: autoCode,
      designation: defaultTplObj ? defaultTplObj.libelle : '',
      nature: 'COMPONENT',
      id_family: defaultFam,
      family_prefix: prefix,
      id_templates: defaultTpl,
      id_type: types[0]?.id_type || 'TYPE-MEC',
      id_diag: '',
      rattachement_type: 'ENTREPOT',
      id_machine_registered: '',
      id_zone: zones[0]?.id_zone || '',
      technician: technicians[0]?.nom || '',
      status: 'En stock (Disponible)',
      emplacement: 'E-MAG-A01',
      stockInitial: 1,
      seuil: 0,
      remarques: '',
    });
    setShowAddModal(true);
  };

  // Switch Nature in Add Modal
  const handleAddNatureSwitch = (newNature) => {
    if (isComponentNature(newNature)) {
      const defaultFam = addForm.id_family || families[0]?.id_family || 'FAM-MOT';
      const relTemplates = templates.filter((t) => t.id_family === defaultFam);
      const defaultTpl = relTemplates[0]?.id_templates || '';
      const prefix = addForm.family_prefix || familyComponentCodes[defaultFam] || '';
      const autoCode = getNextFamilyComponentCode(defaultFam, prefix);
      const defaultTplObj = templates.find((t) => t.id_templates === defaultTpl);

      setAddForm((prev) => ({
        ...prev,
        nature: 'COMPONENT',
        id_family: defaultFam,
        family_prefix: prefix,
        id_templates: defaultTpl,
        id_warehouse_item: autoCode,
        designation: defaultTplObj ? defaultTplObj.libelle : prev.designation,
      }));
    } else {
      // PART
      const defaultType = addForm.id_type || types[0]?.id_type || 'TYPE-MEC';
      const relDiags = diagnostics.filter((d) => d.id_type === defaultType);
      const defaultDiag = relDiags[0]?.id_diag || '';
      const autoCode = getNextPartRef(defaultType);
      const defaultDiagObj = diagnostics.find((d) => d.id_diag === defaultDiag);

      setAddForm((prev) => ({
        ...prev,
        nature: 'PART',
        id_type: defaultType,
        id_diag: defaultDiag,
        id_warehouse_item: autoCode,
        designation: defaultDiagObj ? defaultDiagObj.libelle : prev.designation,
      }));
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setToEdit(item);
    setEditForm({
      id_warehouse_item: item.id_warehouse_item || '',
      designation: item.designation || '',
      nature: item.nature || 'COMPONENT',
      id_family: item.id_family || '',
      id_templates: item.id_templates || '',
      id_type: item.id_type || '',
      id_diag: item.id_diag || '',
      rattachement_type: item.rattachement_type || 'ENTREPOT',
      id_machine_registered: item.id_machine_registered || '',
      id_zone: item.id_zone || '',
      technician: item.technician || '',
      status: item.status || 'En service',
      emplacement: item.emplacement || '',
      stockInitial: item.stockInitial != null ? item.stockInitial : 1,
      seuil: item.seuil != null ? item.seuil : 0,
      remarques: item.remarques || '',
    });
    setActiveActionMenuId(null);
  };

  const handleOpenQuickModal = (item, flow, action) => {
    // Adapt warehouse item into article format for QuickMovementModal
    const adaptedArticle = {
      id: item.id_warehouse_item,
      ref: item.id_warehouse_item,
      designation: item.designation,
      stockInitial: item.stockInitial || 1,
      entrees: item.entrees || 0,
      sorties: item.sorties || 0,
      stockActuel: item.stockActuel != null ? item.stockActuel : (item.stockInitial || 1),
      seuil: item.seuil || 0,
      alerte: item.alerte || 'OK',
      emplacement: item.emplacement || '',
    };
    setQuickModalState({
      isOpen: true,
      article: adaptedArticle,
      initialFlow: flow,
      initialAction: action,
    });
    setActiveActionMenuId(null);
  };

  // Cascading templates according to family in add form
  const availableAddTemplates = addForm.id_family
    ? templates.filter((t) => t.id_family === addForm.id_family)
    : templates;

  // Cascading diagnostics/designations according to type in add form
  const availableAddDiags = addForm.id_type
    ? diagnostics.filter((d) => d.id_type === addForm.id_type)
    : diagnostics;

  const handleAddFamilyChange = (newFam) => {
    const relTpl = templates.filter((t) => t.id_family === newFam);
    const newTpl = relTpl[0]?.id_templates || '';
    const prefix = familyComponentCodes[newFam] || '';
    const autoCode = getNextFamilyComponentCode(newFam, prefix);
    const tplObj = templates.find((t) => t.id_templates === newTpl);

    setAddForm((prev) => ({
      ...prev,
      id_family: newFam,
      family_prefix: prefix,
      id_templates: newTpl,
      id_warehouse_item: autoCode,
      designation: tplObj ? tplObj.libelle : prev.designation,
    }));
  };

  const handleAddFamilyPrefixChange = (newPrefix) => {
    const cleanPrefix = newPrefix.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const autoCode = getNextFamilyComponentCode(addForm.id_family, cleanPrefix);

    setAddForm((prev) => ({
      ...prev,
      family_prefix: cleanPrefix,
      id_warehouse_item: autoCode || prev.id_warehouse_item,
    }));
  };

  const handleAddTemplateChange = (newTpl) => {
    const tplObj = templates.find((t) => t.id_templates === newTpl);
    setAddForm((prev) => ({
      ...prev,
      id_templates: newTpl,
      designation: tplObj ? tplObj.libelle : prev.designation,
    }));
  };

  const handleAddTypeChange = (newType) => {
    const relDiags = diagnostics.filter((d) => d.id_type === newType);
    const newDiag = relDiags[0]?.id_diag || '';
    const autoCode = getNextPartRef(newType);
    const diagObj = diagnostics.find((d) => d.id_diag === newDiag);

    setAddForm((prev) => ({
      ...prev,
      id_type: newType,
      id_diag: newDiag,
      id_warehouse_item: autoCode,
      designation: diagObj ? diagObj.libelle : prev.designation,
    }));
  };

  const handleAddDiagChange = (newDiag) => {
    const diagObj = diagnostics.find((d) => d.id_diag === newDiag);
    setAddForm((prev) => ({
      ...prev,
      id_diag: newDiag,
      designation: diagObj ? diagObj.libelle : prev.designation,
    }));
  };

  // Submit Add
  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!addForm.id_warehouse_item || !addForm.designation) {
      alert('Veuillez renseigner le code et la désignation.');
      return;
    }

    const isComp = isComponentNature(addForm.nature);

    // If adding a Component, save the family prefix and sync with familyComponentCodes / families
    if (isComp && addForm.id_family) {
      const match = String(addForm.id_warehouse_item).match(/^([A-Z0-9]+)-/i);
      const prefixToSave = (addForm.family_prefix || (match ? match[1] : '')).toUpperCase().trim();
      if (prefixToSave) {
        handleCascadeFamilyPrefixUpdate(addForm.id_family, prefixToSave);
      }
    }

    if (onAddWarehouseItem) {
      onAddWarehouseItem({
        id_warehouse_item: addForm.id_warehouse_item.trim().toUpperCase(),
        designation: addForm.designation.trim(),
        nature: addForm.nature,
        id_family: isComp ? addForm.id_family : '',
        id_templates: isComp ? addForm.id_templates : '',
        id_type: !isComp ? addForm.id_type : '',
        id_diag: !isComp ? addForm.id_diag : '',
        rattachement_type: addForm.rattachement_type,
        id_machine_registered:
          addForm.rattachement_type === 'MACHINE' ? addForm.id_machine_registered : '',
        id_zone: addForm.rattachement_type === 'ZONE' ? addForm.id_zone : '',
        technician: addForm.technician,
        status: addForm.status,
        emplacement: addForm.emplacement,
        stockInitial: Number(addForm.stockInitial) || 1,
        seuil: Number(addForm.seuil) || 0,
        remarques: addForm.remarques,
      });
    }
    setShowAddModal(false);
  };

  // Submit Edit
  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (!editForm.designation) {
      alert('La désignation est obligatoire.');
      return;
    }

    if (onUpdateWarehouseItem) {
      const isComp = isComponentNature(editForm.nature);
      onUpdateWarehouseItem(toEdit.id_warehouse_item, {
        ...toEdit,
        designation: editForm.designation.trim(),
        nature: editForm.nature,
        id_family: isComp ? editForm.id_family : '',
        id_templates: isComp ? editForm.id_templates : '',
        id_type: !isComp ? editForm.id_type : '',
        id_diag: !isComp ? editForm.id_diag : '',
        rattachement_type: editForm.rattachement_type,
        id_machine_registered:
          editForm.rattachement_type === 'MACHINE' ? editForm.id_machine_registered : '',
        id_zone: editForm.rattachement_type === 'ZONE' ? editForm.id_zone : '',
        technician: editForm.technician,
        status: editForm.status,
        emplacement: editForm.emplacement,
        stockInitial: Number(editForm.stockInitial) || 1,
        seuil: Number(editForm.seuil) || 0,
        remarques: editForm.remarques,
      });
    }
    setToEdit(null);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (toDelete && onDeleteWarehouseItem) {
      onDeleteWarehouseItem(toDelete.id_warehouse_item);
    }
    setToDelete(null);
  };

  // Table pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortField, setSortField] = useState('id_warehouse_item');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
      if (!event.target.closest('.action-menu-container')) {
        setActiveActionMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return warehouseItems.filter((item) => {
      // Nature filter
      if (currentNatureFilter !== 'ALL') {
        if (isComponentNature(currentNatureFilter) && !isComponentNature(item.nature)) return false;
        if (isPartNature(currentNatureFilter) && !isPartNature(item.nature)) return false;
      }

      // KPI filter
      if (isComponentNature(activeKpiFilter) && !isComponentNature(item.nature)) return false;
      if (isPartNature(activeKpiFilter) && !isPartNature(item.nature)) return false;
      if (activeKpiFilter === 'SERVICE' && !String(item.status || '').toLowerCase().includes('service')) return false;
      if (activeKpiFilter === 'RESERVE' && !String(item.status || '').toLowerCase().includes('stock') && !String(item.status || '').toLowerCase().includes('dispo')) return false;

      // Family filter (for components)
      if (
        isComponentNature(item.nature) &&
        currentFamilyFilter !== 'ALL' &&
        item.id_family !== currentFamilyFilter
      ) {
        return false;
      }

      // Template filter (for components)
      if (
        isComponentNature(item.nature) &&
        currentTemplateFilter !== 'ALL' &&
        item.id_templates !== currentTemplateFilter
      ) {
        return false;
      }

      // Type filter (for parts)
      if (
        isPartNature(item.nature) &&
        currentTypeFilter !== 'ALL' &&
        item.id_type !== currentTypeFilter
      ) {
        return false;
      }

      // Rattachement filter
      if (
        currentRattachementFilter !== 'ALL' &&
        item.rattachement_type !== currentRattachementFilter
      ) {
        return false;
      }

      // Status filter
      if (currentStatusFilter !== 'ALL') {
        const itemStatus = String(item.status || '').toLowerCase();
        const filterStatus = String(currentStatusFilter).toLowerCase();
        if (!itemStatus.includes(filterStatus)) {
          return false;
        }
      }

      // Text search
      if (localSearch) {
        const q = localSearch.trim().toLowerCase();
        const code = String(item.id_warehouse_item || '').toLowerCase();
        const desig = String(item.designation || '').toLowerCase();
        const fam = String(item.id_family || '').toLowerCase();
        const tpl = String(item.id_templates || '').toLowerCase();
        const typ = String(item.id_type || '').toLowerCase();
        const diag = String(item.id_diag || '').toLowerCase();
        const tech = String(item.technician || '').toLowerCase();
        const mch = String(item.id_machine_registered || '').toLowerCase();
        const zn = String(item.id_zone || '').toLowerCase();
        const empl = String(item.emplacement || '').toLowerCase();

        return (
          code.includes(q) ||
          desig.includes(q) ||
          fam.includes(q) ||
          tpl.includes(q) ||
          typ.includes(q) ||
          diag.includes(q) ||
          tech.includes(q) ||
          mch.includes(q) ||
          zn.includes(q) ||
          empl.includes(q)
        );
      }

      return true;
    });
  }, [
    warehouseItems,
    currentNatureFilter,
    activeKpiFilter,
    currentFamilyFilter,
    currentTemplateFilter,
    currentTypeFilter,
    currentRattachementFilter,
    currentStatusFilter,
    localSearch,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    currentNatureFilter,
    activeKpiFilter,
    currentFamilyFilter,
    currentTemplateFilter,
    currentTypeFilter,
    currentRattachementFilter,
    currentStatusFilter,
    localSearch,
    sortField,
    sortOrder,
  ]);

  const sortedData = useMemo(() => {
    if (!sortField) return filteredItems;
    return [...filteredItems].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (['stockInitial', 'entrees', 'sorties', 'stockActuel', 'seuil'].includes(sortField)) {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortField, sortOrder]);

  const totalItems = sortedData.length;
  const totalPages = pageSize === 0 ? 1 : Math.ceil(totalItems / pageSize) || 1;
  const effectivePageSize = pageSize === 0 ? totalItems : pageSize;
  const startIndex = (currentPage - 1) * effectivePageSize;
  const displayedData =
    pageSize === 0 ? sortedData : sortedData.slice(startIndex, startIndex + effectivePageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition shrink-0" />
      );
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-cyan-700 shrink-0 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-cyan-700 shrink-0 font-bold" />
    );
  };

  // Quick Analytics Counts
  const kpis = useMemo(() => {
    let components = 0;
    let parts = 0;
    let enService = 0;
    let enStock = 0;
    let enRevision = 0;

    warehouseItems.forEach((item) => {
      if (isComponentNature(item.nature)) components++;
      else parts++;

      const st = String(item.status || '').toLowerCase();
      if (st.includes('service')) enService++;
      else if (st.includes('stock') || st.includes('dispo')) enStock++;
      else if (st.includes('rev') || st.includes('ext')) enRevision++;
    });

    return {
      total: warehouseItems.length,
      components,
      parts,
      enService,
      enStock,
      enRevision,
    };
  }, [warehouseItems]);

  const hasActiveFilters =
    currentNatureFilter !== 'ALL' ||
    activeKpiFilter !== 'ALL' ||
    currentFamilyFilter !== 'ALL' ||
    currentTemplateFilter !== 'ALL' ||
    currentTypeFilter !== 'ALL' ||
    currentRattachementFilter !== 'ALL' ||
    currentStatusFilter !== 'ALL' ||
    localSearch ||
    sortField !== 'id_warehouse_item' ||
    sortOrder !== 'asc';

  const clearAllFilters = () => {
    changeNatureFilter('ALL');
    setActiveKpiFilter('ALL');
    changeFamilyFilter('ALL');
    if (changeTemplateFilter) changeTemplateFilter('ALL');
    changeTypeFilter('ALL');
    changeRattachementFilter('ALL');
    changeStatusFilter('ALL');
    setLocalSearch('');
    if (setWhSearch) setWhSearch('');
    setSortField('id_warehouse_item');
    setSortOrder('asc');
  };

  return (
    <AnimatedPage className="space-y-5">
      {/* 1. Header Banner (Consistent GMAO Light Theme) */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 sm:gap-4 w-full">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs font-bold">
            <Warehouse className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Entrepôt : Components & Parts
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
                {warehouseItems.length} Enregistrés
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded-full">
                Dual-Twin GMAO
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Inventaire physique & réconciliation de l'entrepôt. Gestion unifiée des{' '}
              <b className="text-blue-700 font-bold">Components Machines</b> (arborescence Famille/Template) et des{' '}
              <b className="text-indigo-700 font-bold">Parts de Rechange</b> (Type/Désignation).
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black transition shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Component / Part</span>
        </button>
      </div>

      {/* 2. Top Metric Cards (Interactive KPI Filter Bar) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Global */}
        <div
          onClick={() => {
            setActiveKpiFilter('ALL');
            changeNatureFilter('ALL');
          }}
          className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
            activeKpiFilter === 'ALL' && currentNatureFilter === 'ALL'
              ? 'border-teal-500 ring-2 ring-teal-100 bg-teal-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Inventaire Global
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block font-mono">
              {kpis.total}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Components & Parts
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200/60">
            <Warehouse className="w-5 h-5 text-teal-700" />
          </div>
        </div>

        {/* Card 2: Components (Ensembles / Sub-systems) */}
        <div
          onClick={() => {
            setActiveKpiFilter('COMPONENT');
            changeNatureFilter('COMPONENT');
          }}
          className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
            isComponentNature(currentNatureFilter) || isComponentNature(activeKpiFilter)
              ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
              Components (Twin Machine)
            </span>
            <span className="text-2xl font-black text-blue-700 mt-0.5 block font-mono">
              {kpis.components}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Moteurs, Pompes, Extincteurs (Ensembles)
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/60">
            <Engine className="w-5 h-5 text-blue-700" />
          </div>
        </div>

        {/* Card 3: Parts (Pièces détachées) */}
        <div
          onClick={() => {
            setActiveKpiFilter('PART');
            changeNatureFilter('PART');
          }}
          className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
            isPartNature(currentNatureFilter) || isPartNature(activeKpiFilter)
              ? 'border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
              Parts (Twin Stock)
            </span>
            <span className="text-2xl font-black text-indigo-700 mt-0.5 block font-mono">
              {kpis.parts}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Pièces détachées & Composants PDR
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200/60">
            <SwatchBook className="w-5 h-5 text-indigo-700" />
          </div>
        </div>

        {/* Card 4: En Service Actif */}
        <div
          onClick={() => {
            setActiveKpiFilter('SERVICE');
          }}
          className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
            activeKpiFilter === 'SERVICE'
              ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              En Service Actif
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-0.5 block font-mono">
              {kpis.enService}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Montés sur Machines / Lignes
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
        </div>
      </div>

      {/* 3. Excel Twin Formulas & Logic Reference Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 truncate">
              <Engine className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Formule Twin Component</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              Col. [D] + [E]
            </span>
          </div>
          <div className="font-mono text-xs text-blue-700 font-bold">
            Code = Auto(Famille, Template)
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 truncate">
              <SwatchBook className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">Formule Twin Part</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
              Col. [B] + [C]
            </span>
          </div>
          <div className="font-mono text-xs text-indigo-700 font-bold">
            Code = Auto(Type, Désignation)
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 truncate">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Calcul Solde Stock</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              Col. [H] = E+F−G
            </span>
          </div>
          <div className="font-mono text-xs text-emerald-700 font-bold">
            Solde = Initial + Entrées - Sorties
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 truncate">
              <Boxes className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate">Rattachement Dynamique</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
              Col. [E] + [F]
            </span>
          </div>
          <div className="font-mono text-xs text-purple-700 font-bold">
            Machine ⟷ Zone ⟷ Entrepôt
          </div>
        </div>
      </div>

      {/* 4. Filter & Search Bar (Clean GMAO Excel Twin Design) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
        {/* Filter Card Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/70 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Filtres & Recherche Avancée
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {filteredItems.length} résultat{filteredItems.length > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Recherche multi-critères, filtrage par Nature Twin, Classification et Localisation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="h-8 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Effacer tous les filtres actifs"
              >
                <X className="w-3.5 h-3.5 text-rose-500" />
                <span>Réinitialiser</span>
              </button>
            )}

            {/* Custom Sort Select Popover */}
            <div className="relative" ref={sortMenuRef}>
              <button
                type="button"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-2 cursor-pointer shadow-2xs transition"
                title="Options de tri par colonne"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-slate-500 font-semibold hidden sm:inline">Tri:</span>
                <span className="font-bold text-slate-900">
                  {sortField === 'id_warehouse_item'
                    ? 'Code Élément (A)'
                    : sortField === 'designation'
                    ? 'Désignation (C)'
                    : sortField === 'nature'
                    ? 'Nature (B)'
                    : sortField === 'status'
                    ? 'Statut (G)'
                    : sortField === 'stockActuel'
                    ? 'Stock (H)'
                    : sortField}
                </span>
                <span className="text-[10px] font-mono text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  {sortOrder === 'asc' ? '▲ ASC' : '▼ DESC'}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 text-xs animate-fadeIn">
                  <div className="px-2 py-1.5 border-b border-slate-100 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Trier les éléments par :
                  </div>
                  <div className="space-y-0.5">
                    {[
                      { id: 'id_warehouse_item', label: 'Code Élément (A)', icon: Tag },
                      { id: 'nature', label: 'Nature Twin (B)', icon: CubeIcon },
                      { id: 'designation', label: 'Désignation (C)', icon: Package },
                      { id: 'status', label: 'Statut Opérationnel (G)', icon: Activity },
                      { id: 'stockActuel', label: 'Stock & Solde (H)', icon: TrendingUp },
                    ].map((opt) => {
                      const IconComp = opt.icon;
                      const isSelected = sortField === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            handleSort(opt.id);
                            setShowSortMenu(false);
                          }}
                          className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200/80'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-700' : 'text-slate-400'}`} />
                            <span>{opt.label}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-mono text-teal-700 font-bold">
                              {sortOrder === 'asc' ? '▲ A→Z' : '▼ Z→A'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters Controls Grid with Clean Descriptive Labels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Field 1: Search Box */}
          <div className="space-y-1">
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                Recherche Rapide
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Col. A+C
              </span>
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Code, désignation, réf..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-8 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition shadow-2xs"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  title="Effacer la recherche"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Field 2: Nature Twin Filter (Dual-Twin Switch) */}
          <div className="space-y-1">
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                Nature (Dual Twin)
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Col. B
              </span>
            </label>
            <CustomSelect
              value={currentNatureFilter}
              onChange={(val) => {
                changeNatureFilter(val);
                setActiveKpiFilter('ALL');
              }}
              options={[
                { value: 'ALL', label: 'Toutes Natures (Dual Twin)', badge: '[B]', badgeColor: 'bg-teal-50 text-teal-800' },
                { value: 'COMPONENT', label: 'Components (Machine / Ensemble)', badge: '[B]', badgeColor: 'bg-blue-50 text-blue-800' },
                { value: 'PART', label: 'Parts (Stock / Rechange)', badge: '[B]', badgeColor: 'bg-indigo-50 text-indigo-800' },
              ]}
            />
          </div>

          {/* Field 3: Smart Classification Filter: Family for COMPONENT or Type for PART */}
          <div className="space-y-1">
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              {isPartNature(currentNatureFilter) ? (
                <span className="inline-flex items-center gap-1.5 text-indigo-700">
                  <SwatchBook className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  Type de Part
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-blue-700">
                  <Engine className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  Famille de Component
                </span>
              )}
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {isPartNature(currentNatureFilter) ? 'Col. B' : 'Col. D'}
              </span>
            </label>
            {isPartNature(currentNatureFilter) ? (
              <CustomSelect
                value={currentTypeFilter}
                onChange={(val) => changeTypeFilter(val)}
                options={[
                  { value: 'ALL', label: `Tous Types (${types.length})`, badge: '[B]', badgeColor: 'bg-indigo-50 text-indigo-800' },
                  ...types.map((t) => {
                    const count = warehouseItems.filter(
                      (i) => isPartNature(i.nature) && i.id_type === t.id_type
                    ).length;
                    return {
                      value: t.id_type,
                      label: `[B] ${t.libelle} (${t.id_type})`,
                      badge: `[${count}]`,
                      badgeColor: 'bg-indigo-50 text-indigo-800',
                    };
                  }),
                ]}
              />
            ) : (
              <CustomSelect
                value={currentFamilyFilter}
                onChange={(val) => {
                  changeFamilyFilter(val);
                  if (changeTemplateFilter) changeTemplateFilter('ALL');
                }}
                options={[
                  { value: 'ALL', label: `Toutes Familles (${families.length})`, badge: '[D]', badgeColor: 'bg-blue-50 text-blue-800' },
                  ...families.map((f) => {
                    const count = warehouseItems.filter((i) => i.id_family === f.id_family).length;
                    return {
                      value: f.id_family,
                      label: `[D] ${f.libelle} (${f.id_family})`,
                      badge: `[${count}]`,
                      badgeColor: 'bg-blue-50 text-blue-800',
                    };
                  }),
                ]}
              />
            )}
          </div>

          {/* Field 4: Rattachement Filter */}
          <div className="space-y-1">
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                Rattachement & Emplacement
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                Col. E
              </span>
            </label>
            <CustomSelect
              value={currentRattachementFilter}
              onChange={(val) => changeRattachementFilter(val)}
              options={[
                { value: 'ALL', label: 'Tous Rattachements' },
                { value: 'MACHINE', label: '🏭 Rattaché à une Machine', badge: '[E]', badgeColor: 'bg-teal-50 text-teal-800' },
                { value: 'ZONE', label: '📍 Rattaché à une Zone / Atelier', badge: '[F]', badgeColor: 'bg-purple-50 text-purple-800' },
                { value: 'ENTREPOT', label: '🏢 Entrepôt Central (Stock)', badge: '[E]', badgeColor: 'bg-slate-100 text-slate-800' },
              ]}
            />
          </div>

          {/* Field 5: Status Filter */}
          <div className="space-y-1">
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Statut Opérationnel
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Col. G
              </span>
            </label>
            <CustomSelect
              value={currentStatusFilter}
              onChange={(val) => changeStatusFilter(val)}
              options={[
                { value: 'ALL', label: 'Tous Statuts' },
                { value: 'En service', label: '🟢 En service', badge: '[G]', badgeColor: 'bg-emerald-50 text-emerald-800' },
                { value: 'En stock (Disponible)', label: '🔵 En stock (Disponible)', badge: '[G]', badgeColor: 'bg-blue-50 text-blue-800' },
                { value: 'En révision / Externe', label: '🟡 En révision / Externe', badge: '[G]', badgeColor: 'bg-amber-50 text-amber-800' },
                { value: 'Hors service', label: '🔴 Hors service', badge: '[G]', badgeColor: 'bg-rose-50 text-rose-800' },
              ]}
            />
          </div>
        </div>

        {/* Active Filter Chips & Clear summary */}
        {hasActiveFilters && (
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-600 text-[11px]">Filtres actifs :</span>
              {localSearch && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 font-mono text-[11px] font-semibold text-slate-800 border border-slate-200">
                  <span>Recherche: "{localSearch}"</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalSearch('');
                      if (setWhSearch) setWhSearch('');
                    }}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {currentNatureFilter !== 'ALL' && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold text-[11px] border ${
                    isComponentNature(currentNatureFilter)
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}
                >
                  {isComponentNature(currentNatureFilter) ? (
                    <span className="inline-flex items-center gap-1">
                      <CubeIcon className="w-3 h-3 text-blue-600" /> Components
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <CubeIcon className="w-3 h-3 text-indigo-600" /> Parts
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => changeNatureFilter('ALL')}
                    className="hover:opacity-75 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {currentFamilyFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                  <span>Famille: {currentFamilyFilter}</span>
                  <button
                    type="button"
                    onClick={() => changeFamilyFilter('ALL')}
                    className="hover:text-blue-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {currentTypeFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">
                  <span>Type: {currentTypeFilter}</span>
                  <button
                    type="button"
                    onClick={() => changeTypeFilter('ALL')}
                    className="hover:text-indigo-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {currentRattachementFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200">
                  <span>Rattachement: {currentRattachementFilter}</span>
                  <button
                    type="button"
                    onClick={() => changeRattachementFilter('ALL')}
                    className="hover:text-purple-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {currentStatusFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200">
                  <span>Statut: {currentStatusFilter}</span>
                  <button
                    type="button"
                    onClick={() => changeStatusFilter('ALL')}
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer transition underline decoration-rose-200 hover:decoration-rose-500"
            >
              Effacer tous les filtres
            </button>
          </div>
        )}
      </div>

      {/* 5. Main Table (BDR Light GMAO Excel Twin Layout) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Top Info Header Bar inside Card (Excel Twin Model Header) */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50/50 gap-2">
          <div className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-teal-600" />
            <span>Tableau Warehouse_Items • Colonnes A → I</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
            id_warehouse_item (A) | nature (B) | designation (C) | classification (D) | rattachement (E) | technician (F) | status (G) | stockActuel (H)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[980px]">
            <thead className="bg-slate-100/90 text-[10.5px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 select-none">
              <tr>
                {/* Row Number Column */}
                <th className="py-2.5 px-3 text-center w-12 text-slate-500 font-mono text-[10px] bg-slate-200/50 border-r border-slate-200 shrink-0">
                  N°
                </th>

                {/* Col 1: Code Élément (A) */}
                <th
                  onClick={() => handleSort('id_warehouse_item')}
                  className="py-2.5 px-3.5 cursor-pointer select-none hover:bg-slate-200/80 transition group text-left whitespace-nowrap"
                  title="Cliquer pour trier par Code Élément"
                >
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>CODE ÉLÉMENT</span>{' '}
                    <span className="text-slate-400 font-normal text-[10px] font-mono">(A)</span>
                    {renderSortIcon('id_warehouse_item')}
                  </div>
                </th>

                {/* Col 2: Nature Twin (B) */}
                <th
                  onClick={() => handleSort('nature')}
                  className="py-2.5 px-3 cursor-pointer select-none hover:bg-slate-200/80 transition group text-left whitespace-nowrap"
                  title="Cliquer pour trier par Nature (Partie / Composant)"
                >
                  <div className="flex items-center gap-1.5">
                    {currentNatureFilter === 'COMPOSANT' ? (
                      <CubeIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    ) : currentNatureFilter === 'PARTIE' ? (
                      <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    ) : (
                      <div className="flex items-center -space-x-1 shrink-0">
                        <Layers className="w-3 h-3 text-blue-600" />
                        <CubeIcon className="w-3 h-3 text-indigo-600" />
                      </div>
                    )}
                    <span>NATURE (TWIN)</span>{' '}
                    <span className="text-slate-400 font-normal text-[10px] font-mono">(B)</span>
                    {renderSortIcon('nature')}
                  </div>
                </th>

                {/* Col 3: Désignation & Spécifications (C) */}
                <th
                  onClick={() => handleSort('designation')}
                  className="py-2.5 px-3.5 cursor-pointer select-none hover:bg-slate-200/80 transition group text-left min-w-[220px]"
                  title="Cliquer pour trier par Désignation"
                >
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>DÉSIGNATION & SPÉCIFICATIONS</span>{' '}
                    <span className="text-slate-400 font-normal text-[10px] font-mono">(C)</span>
                    {renderSortIcon('designation')}
                  </div>
                </th>

                {/* Col 4: Classification (D) */}
                <th
                  onClick={() => handleSort(currentNatureFilter === 'COMPOSANT' ? 'id_type' : 'id_family')}
                  className="py-2.5 px-3 cursor-pointer select-none hover:bg-slate-200/80 transition group text-left whitespace-nowrap"
                  title="Classification (Famille/Template ou Type/Diag)"
                >
                  <div className="flex items-center gap-1.5">
                    {currentNatureFilter === 'COMPOSANT' ? (
                      <CubeIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    ) : (
                      <Boxes className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    )}
                    <span>CLASSIFICATION</span>{' '}
                    <span className="text-slate-400 font-normal text-[10px] font-mono">(D)</span>
                    {renderSortIcon(currentNatureFilter === 'COMPOSANT' ? 'id_type' : 'id_family')}
                  </div>
                </th>

                {/* Col 5: Rattachement & Localisation (E) */}
                <th
                  onClick={() => handleSort('id_machine_registered')}
                  className="py-2.5 px-3 cursor-pointer select-none hover:bg-slate-200/80 transition group text-left whitespace-nowrap"
                  title="Cliquer pour trier par Machine / Zone / Entrepôt"
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>RATTACHEMENT & LOCALISATION</span>{' '}
                    <span className="text-slate-400 font-normal text-[10px] font-mono">(E)</span>
                    {renderSortIcon('id_machine_registered')}
                  </div>
                </th>

                {/* Col 6: Responsable (F) */}
                <th
                  onClick={() => handleSort('technician')}
                  className="py-2.5 px-3 cursor-pointer select-none hover:bg-slate-200/80 transition group text-left whitespace-nowrap"
                  title="Cliquer pour trier par Responsable / Technicien"
                >
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>RESPONSABLE</span>{' '}
                    <span className="text-slate-400 font-normal text-[10px] font-mono">(F)</span>
                    {renderSortIcon('technician')}
                  </div>
                </th>

                {/* Col 7: Statut (G) */}
                <th
                  onClick={() => handleSort('status')}
                  className="py-2.5 px-3 cursor-pointer select-none hover:bg-slate-200/80 transition group text-left whitespace-nowrap"
                  title="Cliquer pour trier par Statut"
                >
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>STATUT</span>{' '}
                    <span className="text-slate-400 font-normal text-[10px] font-mono">(G)</span>
                    {renderSortIcon('status')}
                  </div>
                </th>

                {/* Col 8: Stock Actuel & Solde (H) */}
                <th
                  onClick={() => handleSort('stockActuel')}
                  className="py-2.5 px-3 cursor-pointer select-none hover:bg-slate-200/80 transition group text-right whitespace-nowrap"
                  title="Cliquer pour trier par Stock Actuel"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>STOCK & SOLDE</span>{' '}
                    <span className="text-slate-400 font-normal text-[10px] font-mono">(H)</span>
                    {renderSortIcon('stockActuel')}
                  </div>
                </th>

                {/* Col 9: Action (•••) */}
                <th className="py-2.5 px-3 text-center w-20 select-none font-bold text-slate-400 tracking-widest whitespace-nowrap">
                  •••
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-slate-400 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Warehouse className="w-10 h-10 text-slate-300 stroke-1" />
                      <p className="font-bold text-slate-600 text-sm">Aucun élément d'entrepôt trouvé</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Modifiez vos critères de recherche ou ajoutez un nouvel élément ou composant d'entrepôt.
                      </p>
                      <button
                        onClick={handleOpenAddModal}
                        className="mt-2 px-4 py-2 rounded-xl bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 border border-teal-200 transition cursor-pointer"
                      >
                        + Ajouter un élément
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedData.map((item, idx) => {
                  const realIndex = startIndex + idx;
                  const isCompItem = isComponentNature(item.nature);
                  const famObj = families.find((f) => f.id_family === item.id_family);
                  const tplObj = templates.find((t) => t.id_templates === item.id_templates);
                  const typeObj = types.find((t) => t.id_type === item.id_type);
                  const diagObj = diagnostics.find((d) => d.id_diag === item.id_diag);
                  const isActionOpen = activeActionMenuId === item.id_warehouse_item;

                  return (
                    <tr
                      key={item.id_warehouse_item}
                      className="even:bg-slate-50/70 odd:bg-white hover:bg-teal-50/30 transition-colors border-b border-slate-100"
                    >
                      {/* Row N° Column */}
                      <td className="py-2.5 px-3 text-center font-mono text-[10.5px] font-bold text-slate-400 bg-slate-100/30 border-r border-slate-200/60 shrink-0">
                        {realIndex + 1}
                      </td>

                      {/* Col 1: Code Élément (A) */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-bold text-xs border shadow-2xs ${
                            isCompItem
                              ? 'bg-blue-50 text-blue-900 border-blue-200/90'
                              : 'bg-indigo-50 text-indigo-900 border-indigo-200/90'
                          }`}
                        >
                          <Hash className="w-3 h-3 text-teal-600 shrink-0" />
                          <span>{item.id_warehouse_item}</span>
                        </span>
                      </td>

                      {/* Col 2: Nature (Twin) (B) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {isCompItem ? (
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
                            <div className="w-6 h-6 rounded-lg bg-blue-100/80 flex items-center justify-center shrink-0">
                              <Engine className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <div>
                              <span className="font-extrabold text-[11px] block leading-tight">COMPONENT</span>
                              <span className="text-[9.5px] text-blue-500 font-medium block">Machine Twin</span>
                            </div>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                            <div className="w-6 h-6 rounded-lg bg-indigo-100/80 flex items-center justify-center shrink-0">
                              <SwatchBook className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                            <div>
                              <span className="font-extrabold text-[11px] block leading-tight">PART</span>
                              <span className="text-[9.5px] text-indigo-500 font-medium block">Stock Twin</span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Col 3: Désignation & Spécifications (C) */}
                      <td className="py-2.5 px-3.5 max-w-[280px]">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 border border-slate-200/80 mt-0.5 shadow-2xs">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 text-xs sm:text-[12.5px] leading-snug truncate" title={item.designation}>
                              {item.designation}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10.5px] text-slate-500 truncate">
                              {item.emplacement && (
                                <span className="inline-flex items-center gap-1 font-mono font-semibold text-slate-600 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200/70 shrink-0">
                                  <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                  {item.emplacement}
                                </span>
                              )}
                              {item.remarques ? (
                                <span className="truncate italic text-slate-400 text-[10px]" title={item.remarques}>
                                  {item.remarques}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">Élément géré en GMAO</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Col 4: Classification (D) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {isCompItem ? (
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() =>
                                onNavigateToFamily && onNavigateToFamily(item.id_family)
                              }
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200/70 font-semibold text-[11px] transition cursor-pointer max-w-[190px] truncate"
                              title={`Famille: ${famObj?.libelle || item.id_family}`}
                            >
                              <Engine className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="truncate">{famObj?.libelle || item.id_family || 'Famille'}</span>
                            </button>
                            {tplObj && (
                              <button
                                type="button"
                                onClick={() =>
                                  onNavigateToTemplate && onNavigateToTemplate(item.id_templates)
                                }
                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100/90 hover:bg-slate-200 text-slate-600 border border-slate-200/70 font-mono text-[10px] transition cursor-pointer max-w-[190px] truncate"
                                title={`Template: ${tplObj.libelle}`}
                              >
                                <Layers className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span className="truncate">{tplObj.libelle}</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => onNavigateToType && onNavigateToType(item.id_type)}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 font-semibold text-[11px] transition cursor-pointer max-w-[190px] truncate"
                              title={`Type: ${typeObj?.libelle || item.id_type}`}
                            >
                              <SwatchBook className="w-3 h-3 text-indigo-600 shrink-0" />
                              <span className="truncate">{typeObj?.libelle || item.id_type || 'Type'}</span>
                            </button>
                            {diagObj && (
                              <button
                                type="button"
                                onClick={() => onNavigateToDiag && onNavigateToDiag(item.id_type)}
                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100/90 hover:bg-slate-200 text-slate-600 border border-slate-200/70 text-[10px] transition cursor-pointer max-w-[190px] truncate"
                                title={`Diagnostic: ${diagObj.libelle}`}
                              >
                                <Tag className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span className="truncate">{diagObj.libelle}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Col 5: Rattachement & Localisation (E) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="space-y-1">
                          {item.rattachement_type === 'MACHINE' && item.id_machine_registered ? (
                            <div className="space-y-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  onNavigateToMachine &&
                                  onNavigateToMachine(item.id_machine_registered)
                                }
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 font-mono font-bold text-[11px] transition cursor-pointer"
                              >
                                <Factory className="w-3 h-3 text-purple-600 shrink-0" />
                                <span>{item.id_machine_registered}</span>
                              </button>
                              <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                                {machines.find((m) => m.id_machine_registered === item.id_machine_registered)?.designation || 'Machine affectée'}
                              </span>
                            </div>
                          ) : item.rattachement_type === 'ZONE' && item.id_zone ? (
                            <div className="space-y-0.5">
                              <button
                                type="button"
                                onClick={() => onNavigateToZone && onNavigateToZone(item.id_zone)}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 font-semibold text-[11px] transition cursor-pointer"
                              >
                                <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>{item.id_zone}</span>
                              </button>
                              <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                                {zones.find((z) => z.id_zone === item.id_zone)?.libelle || 'Zone atelier'}
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[11px]">
                                <Warehouse className="w-3 h-3 text-slate-500 shrink-0" />
                                <span>Entrepôt Central</span>
                              </span>
                              <span className="text-[10px] text-slate-400 block">Stock & Magasin PDR</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Col 6: Responsable (F) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-xs shrink-0">
                            <User className="w-3 h-3 text-purple-600" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block leading-tight">
                              {item.technician || 'Non assigné'}
                            </span>
                            <span className="text-[9.5px] text-slate-400 font-medium block">
                              {item.technician ? 'Technicien Référent' : 'Disponible pour affectation'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Col 7: Statut Opérationnel (G) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {String(item.status).includes('service') ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>En service</span>
                          </span>
                        ) : String(item.status).includes('stock') || String(item.status).includes('dispo') ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                            <span>En stock</span>
                          </span>
                        ) : String(item.status).includes('rev') || String(item.status).includes('ext') ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>En révision</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>{item.status || 'Arrêt'}</span>
                          </span>
                        )}
                      </td>

                      {/* Col 8: Stock Actuel & Solde (H) */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg font-mono font-bold text-xs ${
                              (item.stockActuel || 0) <= 0
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : (item.stockActuel || 0) <= (item.seuil || 2)
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                            }`}
                          >
                            {item.stockActuel != null ? item.stockActuel : (item.stockInitial || 1)} u
                          </span>
                          <span className="text-[9.5px] font-mono text-slate-400 mt-0.5">
                            Init: {item.stockInitial || 1} • Seuil: {item.seuil || 2}
                          </span>
                        </div>
                      </td>

                      {/* Col 9: Action & Dropdown (•••) */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="relative inline-flex items-center justify-end action-menu-container">
                          <div className="inline-flex rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                            {/* Primary Action Button (Sortie Interne) */}
                            <button
                              type="button"
                              onClick={() => handleOpenQuickModal(item, 'Sortie Interne', 'CORRECTIVE')}
                              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold transition flex items-center gap-1 cursor-pointer border-r border-slate-200"
                              title="Sortie directe"
                            >
                              <Wrench className="w-3.5 h-3.5 text-slate-500" />
                              <span className="hidden sm:inline">Sortie</span>
                            </button>

                            {/* Dropdown Toggle */}
                            <button
                              type="button"
                              onClick={() =>
                                setActiveActionMenuId(isActionOpen ? null : item.id_warehouse_item)
                              }
                              className={`p-1.5 hover:bg-slate-100 transition cursor-pointer ${
                                isActionOpen ? 'bg-slate-100 text-teal-800' : 'text-slate-500'
                              }`}
                              title="Options et Flux PDR"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Popover Action Menu */}
                          {isActionOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-40 text-left animate-fadeIn">
                              <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Actions Rapides & Flux PDR
                                </div>
                                <div className="font-mono font-bold text-xs text-slate-800 truncate">
                                  {item.id_warehouse_item}
                                </div>
                              </div>

                              <div className="space-y-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenQuickModal(item, 'Sortie Interne', 'CORRECTIVE')}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                                >
                                  <Wrench className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Sortie Interne (Atelier / Machine)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenQuickModal(item, 'Entrée Interne', 'RETOUR_ATELIER')}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-2 transition cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Entrée Interne (Retour / Surplus)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenQuickModal(item, 'Entrée Externe', 'REAPPRO')}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Entrée Externe (Réapprovisionnement)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenQuickModal(item, 'Ajustement & Recalibrage', 'INVENTAIRE')}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-amber-700 hover:bg-amber-50 flex items-center gap-2 transition cursor-pointer"
                                >
                                  <Scale className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Ajustement Inventaire / Solde</span>
                                </button>
                              </div>

                              <div className="my-1 border-t border-slate-100" />

                              <div className="space-y-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDetails(item);
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50 flex items-center gap-2 transition cursor-pointer"
                                >
                                  <Info className="w-3.5 h-3.5 text-teal-600" />
                                  <span>Fiche Technique & Détails</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(item)}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-2 transition cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Modifier les Paramètres</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setToDelete(item);
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Supprimer de l'entrepôt</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Card (قاعدة الجدول) with Row Counters & Full Pagination */}
        <div className="bg-slate-50/70 p-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Lignes par page selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">Lignes par page :</span>
            <div className="flex bg-slate-200/70 rounded-lg p-0.5 border border-slate-300/60">
              {[15, 25, 50, 100, 0].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    pageSize === size
                      ? 'bg-white text-teal-800 shadow-xs border border-slate-200/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {size === 0 ? 'Tout' : size}
                </button>
              ))}
            </div>
          </div>

          {/* Records count & pagination buttons */}
          <div className="flex items-center gap-4">
            <div className="text-xs font-semibold text-slate-500">
              Affichage <b className="text-slate-900">{totalItems === 0 ? 0 : startIndex + 1}</b> à{' '}
              <b className="text-slate-900">
                {Math.min(startIndex + displayedData.length, totalItems)}
              </b>{' '}
              sur <b className="text-slate-900">{totalItems}</b>
            </div>

            {pageSize !== 0 && totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Précédent
                </button>

                <span className="px-2 font-mono text-xs font-bold text-slate-600">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition cursor-pointer shadow-2xs"
                >
                  Suivant
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. ADD MODAL (Dual Twin Architecture) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Ajouter un Élément à l'Entrepôt
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choisissez la nature (Partie ou Composant)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmitAdd} className="p-4 sm:p-5 space-y-4 text-xs">
              {/* Nature Selector (Dual Twin Toggle) */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  Nature de l'Élément *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddNatureSwitch('COMPONENT')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      isComponentNature(addForm.nature)
                        ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Engine className="w-3.5 h-3.5" />
                    <span>Component (Twin Machine)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddNatureSwitch('PART')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      isPartNature(addForm.nature)
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <SwatchBook className="w-3.5 h-3.5" />
                    <span>Part (Twin Stock)</span>
                  </button>
                </div>
              </div>

              {/* Code & Designation */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Code Auto *
                  </label>
                  <input
                    type="text"
                    value={addForm.id_warehouse_item}
                    onChange={(e) =>
                      setAddForm({ ...addForm, id_warehouse_item: e.target.value.toUpperCase() })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-teal-500 outline-none"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Désignation de l'élément *
                  </label>
                  <input
                    type="text"
                    value={addForm.designation}
                    onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                    placeholder="Ex: Moteur Triphasé 5.5kW"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-teal-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Classification according to Nature */}
              {isComponentNature(addForm.nature) ? (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2.5">
                  <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Classification Component Machine (Twin Model)</span>
                    </div>
                    {addForm.id_family && familyComponentCodes[addForm.id_family] ? (
                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        Préfixe Famille Actif : {familyComponentCodes[addForm.id_family]}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Nouveau Préfixe de Famille
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10.5px] font-semibold text-slate-700 block mb-1">
                        Famille *
                      </label>
                      <select
                        value={addForm.id_family}
                        onChange={(e) => handleAddFamilyChange(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-blue-500 outline-none"
                      >
                        {families.map((f) => (
                          <option key={f.id_family} value={f.id_family}>
                            {f.libelle} ({f.id_family})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10.5px] font-semibold text-slate-700 block mb-1">
                        Code Préfixe Famille (Composant) *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={addForm.family_prefix || ''}
                          onChange={(e) => handleAddFamilyPrefixChange(e.target.value)}
                          placeholder="Ex: EXT, MOT, POM..."
                          className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-blue-900 focus:border-blue-500 outline-none uppercase"
                        />
                        {familyComponentCodes[addForm.id_family] && (
                          <span
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200"
                            title="Ce préfixe est enregistré pour cette famille"
                          >
                            ✓ Enregistré
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10.5px] font-semibold text-slate-700 block mb-1">
                        Template Associé
                      </label>
                      <select
                        value={addForm.id_templates}
                        onChange={(e) => handleAddTemplateChange(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs focus:border-blue-500 outline-none"
                      >
                        <option value="">-- Aucun Template --</option>
                        {availableAddTemplates.map((t) => (
                          <option key={t.id_templates} value={t.id_templates}>
                            {t.libelle}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="text-[10.5px] text-slate-500 bg-white/70 p-2 rounded-lg border border-blue-100/70 flex items-center justify-between gap-2 flex-wrap">
                    <span className="leading-tight">
                      Code auto-généré : <b className="text-blue-700 font-bold font-mono">{addForm.id_warehouse_item || '...'}</b> (Famille {addForm.id_family})
                    </span>
                    {addForm.id_family && addForm.family_prefix && (
                      <button
                        type="button"
                        onClick={() => {
                          handleCascadeFamilyPrefixUpdate(addForm.id_family, addForm.family_prefix);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-blue-800 bg-blue-100 hover:bg-blue-200 border border-blue-300 transition cursor-pointer"
                        title="Synchroniser et renommer tous les composants existants de cette famille avec ce nouveau préfixe"
                      >
                        <Zap className="w-3 h-3 text-blue-600" />
                        <span>Mettre à jour tous les composants ({warehouseItems.filter((i) => isComponentNature(i.nature) && i.id_family === addForm.id_family).length})</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2.5">
                  <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CubeIcon className="w-3.5 h-3.5" />
                      <span>Classification Part Stock (Twin Model)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Réf PDR Auto-générée : {addForm.id_warehouse_item || 'PART-01'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10.5px] font-semibold text-slate-700 block mb-1">
                        Type Pièce (Génère la Référence) *
                      </label>
                      <select
                        value={addForm.id_type}
                        onChange={(e) => handleAddTypeChange(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs focus:border-indigo-500 outline-none font-semibold"
                      >
                        {types.map((t) => (
                          <option key={t.id_type} value={t.id_type}>
                            {t.libelle} ({t.id_type})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10.5px] font-semibold text-slate-700 block mb-1">
                        Diagnostic / Réf Rattachée
                      </label>
                      <select
                        value={addForm.id_diag}
                        onChange={(e) => handleAddDiagChange(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs focus:border-indigo-500 outline-none"
                      >
                        <option value="">-- Aucun Diagnostic --</option>
                        {availableAddDiags.map((d) => (
                          <option key={d.id_diag} value={d.id_diag}>
                            {d.libelle}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="text-[10.5px] text-slate-500 bg-white/70 p-2 rounded-lg border border-indigo-100/70 flex items-center justify-between gap-2">
                    <span className="leading-tight">
                      Réf Pièce <b className="text-indigo-700 font-bold font-mono">{addForm.id_warehouse_item || '...'}</b> générée automatiquement selon le Type.
                    </span>
                    <span className="font-mono text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 shrink-0">
                      Type: {addForm.id_type || 'TYPE'}
                    </span>
                  </div>
                </div>
              )}

              {/* Location & Rattachement */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Rattachement
                  </label>
                  <select
                    value={addForm.rattachement_type}
                    onChange={(e) => setAddForm({ ...addForm, rattachement_type: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-teal-500 outline-none"
                  >
                    <option value="MACHINE">Machine</option>
                    <option value="ZONE">Zone / Atelier</option>
                    <option value="ENTREPOT">Entrepôt Central (Stock Réserve)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Statut</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-teal-500 outline-none"
                  >
                    <option value="En stock (Disponible)">En stock (Disponible)</option>
                    <option value="En service">En service</option>
                    <option value="En révision / Externe">En révision / Externe</option>
                    <option value="Hors service">Hors service</option>
                  </select>
                </div>
              </div>

              {addForm.rattachement_type === 'MACHINE' ? (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Machine Associée
                  </label>
                  <select
                    value={addForm.id_machine_registered}
                    onChange={(e) =>
                      setAddForm({ ...addForm, id_machine_registered: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-purple-800 focus:border-teal-500 outline-none"
                  >
                    <option value="">-- Sélectionner Machine --</option>
                    {machines.map((m) => (
                      <option key={m.id_machine_registered} value={m.id_machine_registered}>
                        {m.id_machine_registered} - {m.designation}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Emplacement / Rayon
                    </label>
                    <input
                      type="text"
                      value={addForm.emplacement}
                      onChange={(e) => setAddForm({ ...addForm, emplacement: e.target.value })}
                      placeholder="Ex: E-MAG-A01"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:border-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Quantité Initiale
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={addForm.stockInitial}
                      onChange={(e) => setAddForm({ ...addForm, stockInitial: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold focus:border-teal-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Responsable & Remarques */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Responsable
                  </label>
                  <select
                    value={addForm.technician}
                    onChange={(e) => setAddForm({ ...addForm, technician: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs focus:border-teal-500 outline-none"
                  >
                    <option value="">-- Aucun --</option>
                    {technicians.map((t) => (
                      <option key={t.id_technician || t.nom} value={t.nom}>
                        {t.nom} ({t.id_technician})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Seuil Alerte (Min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.seuil}
                    onChange={(e) => setAddForm({ ...addForm, seuil: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Remarques / Observations
                </label>
                <textarea
                  rows="2"
                  value={addForm.remarques}
                  onChange={(e) => setAddForm({ ...addForm, remarques: e.target.value })}
                  placeholder="Détails techniques, fournisseur, état..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-teal-500 outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer l'Élément</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. EDIT MODAL */}
      {toEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Modifier l'Élément : {toEdit.id_warehouse_item}
                  </h3>
                  <p className="text-xs text-slate-500">Mise à jour des paramètres GMAO</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setToEdit(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-4 sm:p-5 space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Désignation *
                </label>
                <input
                  type="text"
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Rattachement
                  </label>
                  <select
                    value={editForm.rattachement_type}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        rattachement_type: e.target.value,
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-blue-500 outline-none"
                  >
                    <option value="MACHINE">Machine</option>
                    <option value="ZONE">Zone / Atelier</option>
                    <option value="ENTREPOT">Entrepôt Central</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Statut</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-blue-500 outline-none"
                  >
                    <option value="En service">En service</option>
                    <option value="En stock (Disponible)">En stock (Disponible)</option>
                    <option value="En révision / Externe">En révision / Externe</option>
                    <option value="Hors service">Hors service</option>
                  </select>
                </div>
              </div>

              {editForm.rattachement_type === 'MACHINE' ? (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Machine Cible
                  </label>
                  <select
                    value={editForm.id_machine_registered}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        id_machine_registered: e.target.value,
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-purple-800 focus:border-blue-500 outline-none"
                  >
                    <option value="">-- Aucune --</option>
                    {machines.map((m) => (
                      <option key={m.id_machine_registered} value={m.id_machine_registered}>
                        {m.id_machine_registered} - {m.designation}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Emplacement / Rayon
                    </label>
                    <input
                      type="text"
                      value={editForm.emplacement}
                      onChange={(e) => setEditForm({ ...editForm, emplacement: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Quantité Initiale
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.stockInitial}
                      onChange={(e) => setEditForm({ ...editForm, stockInitial: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Responsable
                  </label>
                  <select
                    value={editForm.technician}
                    onChange={(e) => setEditForm({ ...editForm, technician: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs focus:border-blue-500 outline-none"
                  >
                    <option value="">-- Aucun --</option>
                    {technicians.map((t) => (
                      <option key={t.id_technician || t.nom} value={t.nom}>
                        {t.nom} ({t.id_technician})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Seuil Alerte
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.seuil}
                    onChange={(e) => setEditForm({ ...editForm, seuil: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Remarques / Notes
                </label>
                <textarea
                  rows="2"
                  value={editForm.remarques}
                  onChange={(e) => setEditForm({ ...editForm, remarques: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:border-blue-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setToEdit(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer Modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. DELETE CONFIRMATION MODAL */}
      {toDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Confirmer la suppression</h3>
              <p className="text-xs text-slate-500 mt-1">
                Êtes-vous sûr de vouloir supprimer l'élément{' '}
                <span className="font-mono font-bold text-slate-900">
                  {toDelete.id_warehouse_item}
                </span>{' '}
                ({toDelete.designation}) ?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition cursor-pointer text-xs shadow-xs"
              >
                Oui, Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. DETAILS MODAL */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {selectedDetails.id_warehouse_item}
                  </h3>
                  <p className="text-xs text-slate-500">Fiche technique GMAO</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetails(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Désignation</div>
                <div className="font-semibold text-slate-900">{selectedDetails.designation}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Nature (Twin)</div>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    {isComponentNature(selectedDetails.nature) ? (
                      <span className="inline-flex items-center gap-1 text-blue-700">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        Component (Machine Twin)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-indigo-700">
                        <CubeIcon className="w-3.5 h-3.5 text-indigo-600" />
                        Part (Stock Twin)
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Statut</div>
                  <div className="font-bold text-slate-800">{selectedDetails.status}</div>
                </div>
              </div>

              {isComponentNature(selectedDetails.nature) ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="text-[10px] font-bold text-blue-700 uppercase">Famille [D]</div>
                    <div className="font-bold text-slate-800">{selectedDetails.id_family || '--'}</div>
                  </div>
                  <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="text-[10px] font-bold text-blue-700 uppercase">Template [E]</div>
                    <div className="font-bold text-slate-800">{selectedDetails.id_templates || '--'}</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <div className="text-[10px] font-bold text-indigo-700 uppercase">Type Pièce [B]</div>
                    <div className="font-bold text-slate-800">{selectedDetails.id_type || '--'}</div>
                  </div>
                  <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <div className="text-[10px] font-bold text-indigo-700 uppercase">Diagnostic / Ref [C]</div>
                    <div className="font-bold text-slate-800">{selectedDetails.id_diag || 'Spécifique'}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Rattachement</div>
                  <div className="font-bold text-slate-800">
                    {selectedDetails.rattachement_type === 'MACHINE'
                      ? `Machine : ${selectedDetails.id_machine_registered}`
                      : selectedDetails.rattachement_type === 'ZONE'
                        ? `Zone : ${selectedDetails.id_zone}`
                        : 'Entrepôt Central'}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Emplacement</div>
                  <div className="font-mono font-bold text-slate-800">
                    {selectedDetails.emplacement || '--'}
                  </div>
                </div>
              </div>

              {selectedDetails.remarques && (
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Remarques / Observations
                  </div>
                  <div className="text-slate-700">{selectedDetails.remarques}</div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Quick Movement Modal for Row-Level Operations */}
      <QuickMovementModal
        isOpen={quickModalState.isOpen}
        onClose={() => setQuickModalState((prev) => ({ ...prev, isOpen: false }))}
        article={quickModalState.article}
        initialFlow={quickModalState.initialFlow}
        initialAction={quickModalState.initialAction}
        zones={zones}
        machines={machines}
        technicians={technicians}
        mouvements={mouvements}
        onAddMouvement={onAddMouvement}
      />
    </AnimatedPage>
  );
}
