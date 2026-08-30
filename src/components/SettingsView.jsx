import React, { useState, useMemo, useEffect, useRef } from 'react';
import AnimatedPage from './AnimatedPage';
import {
  Settings as SettingsIcon,
  Sliders,
  Database,
  HardDrive,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  Cpu,
  Layers,
  Users,
  ShieldAlert,
  Download,
  Upload,
  RotateCcw,
  FolderOpen,
  CheckCircle2,
  Play,
  FileCode,
  Trash2,
  ChevronRight,
  HelpCircle,
  Clock,
  MapPin,
  ClipboardList,
  Activity,
  ChevronLeft,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  UserCheck,
  Lock,
  Unlock,
  Shield,
  Key
} from 'lucide-react';

import {
  INITIAL_TYPES,
  INITIAL_DIAGNOSTICS,
  INITIAL_FAMILIES,
  INITIAL_TEMPLATES,
  INITIAL_MACHINES_REGISTERED,
  INITIAL_ZONES,
  INITIAL_TECHNICIANS,
  INITIAL_OPERATIONS
} from '../data/seedData';
import initialData from '../initialData.json';

export default function SettingsView({
  rawStock = [],
  setRawStock,
  mouvements = [],
  setMouvements,
  machines = [],
  setMachines,
  families = [],
  setFamilies,
  templates = [],
  setTemplates,
  zones = [],
  setZones,
  technicians = [],
  setTechnicians,
  operations = [],
  setOperations,
  types = [],
  setTypes,
  showToast,
  linkedFileHandle,
  setLinkedFileHandle,
  linkedFileName,
  setLinkedFileName,
  onDirectLink,
  onDirectSave
}) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, injection, directory, matching, json-editor
  
  // Local storage size computation
  const localStorageSizeKB = useMemo(() => {
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += ((localStorage[x].length + x.length) * 2);
      }
    }
    return (total / 1024).toFixed(1);
  }, [rawStock, mouvements, machines, families, templates, zones, technicians, operations, types]);

  const maxLocalStorageSizeKB = 5120; // 5MB standard
  const storagePercentage = useMemo(() => {
    return Math.min(100, (localStorageSizeKB / maxLocalStorageSizeKB) * 100).toFixed(1);
  }, [localStorageSizeKB]);

  // Shared working directory path
  const [sharedFolderPath, setSharedFolderPath] = useState(() => {
    return localStorage.getItem('gmao_shared_folder_path') || 'Z:\\Partage\\CIOB_GMAO';
  });

  const [autoWriteExcel, setAutoWriteExcel] = useState(() => {
    return localStorage.getItem('gmao_auto_write_excel') !== 'false';
  });

  const [pollingInterval, setPollingInterval] = useState(() => {
    return localStorage.getItem('gmao_polling_interval') || '10s';
  });

  const [isDemoMode, setIsDemoMode] = useState(() => {
    return localStorage.getItem('gmao_start_mode') !== 'empty';
  });

  // Admin & Security Config States
  const [tempRole, setTempRole] = useState(() => {
    return localStorage.getItem('gmao_admin_role') || 'Gestionnaire Principal du Stock & Mouvements';
  });

  const [tempPin, setTempPin] = useState(() => {
    const saved = localStorage.getItem('gmao_admin_pin');
    if (saved) {
      try {
        const raw = atob(saved);
        if (raw.startsWith('CIOB_GMAO_SECURE_SALT:')) {
          return raw.replace('CIOB_GMAO_SECURE_SALT:', '');
        }
      } catch (e) {}
    }
    return '1234';
  });

  const [tempOpenMode, setTempOpenMode] = useState(() => {
    return localStorage.getItem('gmao_admin_open_mode') === 'true';
  });

  const [auditTarget, setAuditTarget] = useState('machines'); // machines, zones, utilisateurs
  const [showAuditUserModal, setShowAuditUserModal] = useState(false);
  const [auditUserForm, setAuditUserForm] = useState({ type: 'TECHNICIEN', nom: '', id_zone: '', specialite: '' });
  const [showAuditZoneModal, setShowAuditZoneModal] = useState(false);
  const [auditZoneForm, setAuditZoneForm] = useState({ libelle: '' });

  // Sequential ID Generator Helpers for audit manual registration
  const getNextUserId = (type) => {
    if (type === 'TECHNICIEN') {
      const nums = technicians
        .map((t) => {
          const m = String(t.id_technician || '').match(/TECH-(\d+)/i);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const max = nums.length > 0 ? Math.max(...nums) : 0;
      return `TECH-${String(max + 1).padStart(2, '0')}`;
    } else if (type === 'OPERATEUR') {
      const nums = operations
        .filter((o) => o.type_profil === 'OPERATEUR')
        .map((o) => {
          const m = String(o.id_operation || '').match(/OP-(\d+)/i);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const max = nums.length > 0 ? Math.max(...nums) : 0;
      return `OP-${String(max + 1).padStart(2, '0')}`;
    } else if (type === 'CHEF') {
      const nums = operations
        .filter((o) => o.type_profil === 'CHEF')
        .map((o) => {
          const m = String(o.id_operation || '').match(/CHEF-(\d+)/i);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const max = nums.length > 0 ? Math.max(...nums) : 0;
      return `CHEF-${String(max + 1).padStart(2, '0')}`;
    }
    return '';
  };

  const getNextZoneId = () => {
    const nums = zones
      .map((z) => {
        const m = String(z.id_zone || '').match(/ZONE-(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `ZONE-${String(max + 1).padStart(2, '0')}`;
  };

  // AUDIT & VERIFICATION ENGINE
  const discoveredItems = useMemo(() => {
    const candidates = {};
    
    if (auditTarget === 'machines') {
      const registeredIds = new Set(machines.map(m => String(m.id_machine_registered || '').toLowerCase().trim()));
      
      mouvements.forEach((m) => {
        const code = String(m.id_machine_registered || '').trim();
        if (code && !registeredIds.has(code.toLowerCase())) {
          candidates[code] = (candidates[code] || 0) + 1;
        }
      });
      
      const mchRegex = /\b([A-Z]{2,4}-\d{2,3}|[A-Z]{2,4}-\d{1,2})\b/gi;
      const scanTexts = (texts) => {
        let match;
        mchRegex.lastIndex = 0;
        while ((match = mchRegex.exec(texts)) !== null) {
          const code = match[1].toUpperCase();
          if (['B1', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'REF', 'TPL', 'FAM', 'ZONE', 'TECH', 'CHEF', 'OP', 'MCH'].includes(code)) continue;
          if (!registeredIds.has(code.toLowerCase())) {
            candidates[code] = (candidates[code] || 0) + 1;
          }
        }
      };

      mouvements.forEach((m) => scanTexts([m.commentaire, m.demandeur, m.ref].join(' ')));
      rawStock.forEach((s) => scanTexts([s.emplacement, s.designation, s.ref].join(' ')));

    } else if (auditTarget === 'zones') {
      const registeredZones = new Set([
        ...zones.map(z => String(z.id_zone || '').toLowerCase().trim()),
        ...zones.map(z => String(z.libelle || '').toLowerCase().trim())
      ]);

      mouvements.forEach(m => {
        const code = String(m.id_zone || '').trim();
        if (code && !registeredZones.has(code.toLowerCase())) candidates[code] = (candidates[code] || 0) + 1;
      });
      machines.forEach(m => {
        const code = String(m.id_zone_default || '').trim();
        if (code && !registeredZones.has(code.toLowerCase())) candidates[code] = (candidates[code] || 0) + 1;
      });

    } else if (auditTarget === 'utilisateurs') {
      const registeredNames = new Set([
        ...technicians.map(t => String(t.nom || '').toLowerCase().trim()),
        ...operations.map(o => String(o.nom || '').toLowerCase().trim())
      ]);

      mouvements.forEach(m => {
        const techName = String(m.technicien || '').trim();
        if (techName && techName !== 'Rachid' && !registeredNames.has(techName.toLowerCase())) {
          candidates[techName] = (candidates[techName] || 0) + 1;
        }
        const opName = String(m.operation || '').trim();
        if (opName && !registeredNames.has(opName.toLowerCase()) && !/^(OP-|CHEF-)/i.test(opName)) {
          candidates[opName] = (candidates[opName] || 0) + 1;
        }
      });

      machines.forEach(m => {
         const code = String(m.technician || '').trim();
         if (code && !registeredNames.has(code.toLowerCase())) {
           candidates[code] = (candidates[code] || 0) + 1;
         }
      });
    }

    return Object.entries(candidates)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);
  }, [auditTarget, mouvements, rawStock, machines, zones, technicians, operations]);

  const handleSaveAdminConfig = () => {
    if (!tempPin || tempPin.trim().length < 4) {
      showToast("Le code PIN doit comporter au moins 4 caracteres.", "error");
      return;
    }
    
    const encrypted = btoa(`CIOB_GMAO_SECURE_SALT:${tempPin.trim()}`);
    localStorage.setItem('gmao_admin_pin', encrypted);
    localStorage.setItem('gmao_admin_role', tempRole.trim());
    localStorage.setItem('gmao_admin_open_mode', tempOpenMode ? 'true' : 'false');

    // Also update existing session if logged in
    const session = localStorage.getItem('gmao_user_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        parsed.role = tempRole.trim();
        localStorage.setItem('gmao_user_session', JSON.stringify(parsed));
      } catch (e) {}
    }

    // Dispatch event to sync state immediately
    window.dispatchEvent(new Event('storage'));
    showToast("Configuration Administrateur enregistree et chiffree avec succes !", "success");
  };

  // JSON Advanced Editor States
  const [jsonTarget, setJsonTarget] = useState('rawStock');
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState(null);

  const originalJsonText = useMemo(() => {
    let targetData = [];
    if (jsonTarget === 'rawStock') targetData = rawStock;
    else if (jsonTarget === 'mouvements') targetData = mouvements;
    else if (jsonTarget === 'machines') targetData = machines;
    else if (jsonTarget === 'families') targetData = families;
    else if (jsonTarget === 'templates') targetData = templates;
    else if (jsonTarget === 'zones') targetData = zones;
    else if (jsonTarget === 'technicians') targetData = technicians;
    else if (jsonTarget === 'operations') targetData = operations;
    else if (jsonTarget === 'types') targetData = types;
    return JSON.stringify(targetData, null, 2);
  }, [jsonTarget, rawStock, mouvements, machines, families, templates, zones, technicians, operations, types]);

  const isJsonModified = useMemo(() => {
    return jsonText !== originalJsonText;
  }, [jsonText, originalJsonText]);

  // Load JSON for edit
  useEffect(() => {
    let targetData = [];
    if (jsonTarget === 'rawStock') targetData = rawStock;
    else if (jsonTarget === 'mouvements') targetData = mouvements;
    else if (jsonTarget === 'machines') targetData = machines;
    else if (jsonTarget === 'families') targetData = families;
    else if (jsonTarget === 'templates') targetData = templates;
    else if (jsonTarget === 'zones') targetData = zones;
    else if (jsonTarget === 'technicians') targetData = technicians;
    else if (jsonTarget === 'operations') targetData = operations;
    else if (jsonTarget === 'types') targetData = types;

    setJsonText(JSON.stringify(targetData, null, 2));
    setJsonError(null);
  }, [jsonTarget, rawStock, mouvements, machines, families, templates, zones, technicians, operations, types, activeTab]);

  const handleSaveJSON = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error("La structure doit être un tableau JSON d'objets.");
      }

      if (jsonTarget === 'rawStock') setRawStock(parsed);
      else if (jsonTarget === 'mouvements') setMouvements(parsed);
      else if (jsonTarget === 'machines') setMachines(parsed);
      else if (jsonTarget === 'families') setFamilies(parsed);
      else if (jsonTarget === 'templates') setTemplates(parsed);
      else if (jsonTarget === 'zones') setZones(parsed);
      else if (jsonTarget === 'technicians') setTechnicians(parsed);
      else if (jsonTarget === 'operations') setOperations(parsed);
      else if (jsonTarget === 'types') setTypes(parsed);

      setJsonError(null);
      showToast('Modification appliquee avec succes !', 'success');
    } catch (err) {
      setJsonError(err.message);
      showToast('Erreur de validation du JSON.', 'error');
    }
  };

  const handleDownloadJSON = () => {
    try {
      const blob = new Blob([jsonText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gmao_config_${jsonTarget}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Fichier JSON telecharge avec succes.', 'success');
    } catch (err) {
      showToast('Erreur lors du telechargement.', 'error');
    }
  };

  const handleUploadJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          showToast("Avertissement : Le fichier importe n'est pas un tableau d'objets.", 'info');
        }
        setJsonText(JSON.stringify(parsed, null, 2));
        setJsonError(null);
        showToast('Fichier charge dans l\'editeur. Veuillez l\'enregistrer pour appliquer.', 'success');
      } catch (err) {
        setJsonError(`JSON invalide : ${err.message}`);
        showToast('Le fichier importe contient un JSON invalide.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCancelEdits = () => {
    let targetData = [];
    if (jsonTarget === 'rawStock') targetData = rawStock;
    else if (jsonTarget === 'mouvements') targetData = mouvements;
    else if (jsonTarget === 'machines') targetData = machines;
    else if (jsonTarget === 'families') targetData = families;
    else if (jsonTarget === 'templates') targetData = templates;
    else if (jsonTarget === 'zones') targetData = zones;
    else if (jsonTarget === 'technicians') targetData = technicians;
    else if (jsonTarget === 'operations') targetData = operations;
    else if (jsonTarget === 'types') targetData = types;

    setJsonText(JSON.stringify(targetData, null, 2));
    setJsonError(null);
    showToast("Modification annulee. Retour aux donnees d'origine.", 'info');
  };

  // Directory details
  const [fileDetails, setFileDetails] = useState({ size: '1.2 Mo', lastModified: '30/08 10:23' });
  useEffect(() => {
    async function fetchFileDetails() {
      if (linkedFileHandle) {
        try {
          const file = await linkedFileHandle.getFile();
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
          const date = new Date(file.lastModified);
          const formattedDate = date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          setFileDetails({ size: `${sizeMB} Mo`, lastModified: formattedDate });
        } catch (e) {
          console.error(e);
        }
      }
    }
    fetchFileDetails();
  }, [linkedFileHandle]);

  // Settings modification handlers
  const handleSaveSettings = () => {
    localStorage.setItem('gmao_shared_folder_path', sharedFolderPath);
    localStorage.setItem('gmao_auto_write_excel', String(autoWriteExcel));
    localStorage.setItem('gmao_polling_interval', pollingInterval);
    localStorage.setItem('gmao_start_mode', isDemoMode ? 'demo' : 'empty');
    showToast('Parametres systeme mis a jour !', 'success');
  };

  // DATA INJECTION HUB HANDLERS
  const handleResetToZero = () => {
    if (window.confirm("Etes-vous sur de vouloir TOUT effacer ? Cette action videra les tables locales de stockage.")) {
      setRawStock([]);
      setMouvements([]);
      setMachines([]);
      setFamilies([]);
      setTemplates([]);
      setZones([]);
      setTechnicians([]);
      setOperations([]);
      setTypes([]);
      showToast('Base de donnees videe !', 'info');
    }
  };

  const handleInjectGroup = (group) => {
    if (group === 'stock') {
      const mappedStock = (initialData.Stock_Actuel || []).map((item, idx) => {
        let initStock = 0;
        if (typeof item.Type === 'number' && !isNaN(item.Type)) initStock = item.Type;
        else if (item.stockInitial != null) initStock = Number(item.stockInitial) || 0;
        
        return {
          id: item.id || idx + 1,
          ref: item.ref || `ART${String(idx + 1).padStart(3, '0')}`,
          designation: item.designation || item.Ref || `Piece ${idx + 1}`,
          type: item.type || item['Designation'] || 'Divers',
          id_type: item.type || item['Designation'] || 'Divers',
          stockInitial: initStock,
          seuil: Number(item.seuil) || 3,
          emplacement: item.emplacement || `A${(idx % 8) + 1}-R${(idx % 6) + 1}`
        };
      });
      setRawStock(mappedStock);
      const set = new Set();
      mappedStock.forEach((s) => { if (s.type) set.add(s.type); });
      setTypes(Array.from(set).map(t => ({ id_type: t, libelle: t })));
      showToast(`${mappedStock.length} articles injectes dans le stock.`, 'success');
    } else if (group === 'parc') {
      setMachines(INITIAL_MACHINES_REGISTERED);
      setFamilies(INITIAL_FAMILIES);
      setTemplates(INITIAL_TEMPLATES);
      showToast(`Parc machine initialise avec succes.`, 'success');
    } else if (group === 'zones') {
      setZones(INITIAL_ZONES);
      setTechnicians(INITIAL_TECHNICIANS);
      setOperations(INITIAL_OPERATIONS);
      showToast(`Zones et equipes initialisees avec succes.`, 'success');
    } else if (group === 'mouvements') {
      const mappedMvts = (initialData.Mouvement || []).map((m, idx) => ({
        id: m.id || idx + 1,
        date: m.date || '2026-07-16',
        ref: m.ref || m['Reference'] || '',
        quantite: Number(m.quantite) || 1,
        type: m.type || 'Sortie',
        action_id: m.action_id || 'CORRECTIVE',
        technicien: m.technicien || 'Rachid',
        id_zone: m.id_zone || 'ZONE-DET',
        id_machine_registered: m.id_machine_registered || '',
        operation: m.operation || '',
        commentaire: m.commentaire || '',
        demandeur: m.demandeur || ''
      }));
      setMouvements(mappedMvts);
      showToast(`${mappedMvts.length} mouvements historiques injectes.`, 'success');
    }
  };

  const handleInjectAll = () => {
    handleInjectGroup('stock');
    handleInjectGroup('parc');
    handleInjectGroup('zones');
    handleInjectGroup('mouvements');
    showToast('Injection globale terminee avec succes.', 'success');
  };

  const handleRegisterDiscovered = () => {
    if (discoveredItems.length === 0) return;

    if (auditTarget === 'machines') {
      const defaultFamily = families[0]?.id_family || 'FAM-EMB';
      const defaultTemplate = templates[0]?.id_templates || 'TPL-RCF100';
      const defaultZone = zones[0]?.id_zone || 'ZONE-DET';
      const defaultTech = technicians[0]?.nom || 'Rachid';

      const newMachines = discoveredItems.map((dm) => ({
        id_machine_registered: dm.code,
        designation: `Machine Auto-Detectee ${dm.code}`,
        id_family: defaultFamily,
        id_templates: defaultTemplate,
        id_zone_default: defaultZone,
        technician: defaultTech,
        status: 'En service'
      }));
      setMachines((prev) => [...prev, ...newMachines]);
      showToast(`${newMachines.length} machines enregistrées avec succès.`, 'success');
    } else {
      showToast("Veuillez enregistrer les éléments manuellement un par un pour garantir l'exactitude des informations.", "info");
    }
  };

  const getAuditLabel = () => {
    switch (auditTarget) {
      case 'machines': return 'Machines';
      case 'zones': return 'Zones';
      case 'utilisateurs': return 'Utilisateurs';
      default: return 'Eléments';
    }
  };



  return (
    <AnimatedPage className="space-y-6">
      {/* Header Banner - White, high-contrast, no emojis */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <SettingsIcon className="w-5 h-5 text-slate-600 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Configuration & Parametres</span>
                <span className="text-xs font-normal text-slate-400 font-mono">/ Settings & Twin Engine</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervision du stockage local, injection de maquettes, appairage automatique et liaison dossier reseau.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200/60 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            Mode Offline Local Actif
          </span>
        </div>
      </div>

      {/* Navigation Tabs - Place in card, full-width responsive grid, with premium light theme and matching color highlights */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 w-full">
          {[
            { id: 'overview', label: 'Supervision', sub: 'Supervision Stockage', icon: HardDrive, color: 'text-cyan-600', activeBg: 'bg-cyan-50/70', activeBorder: 'border-cyan-500', activeText: 'text-cyan-950', activeIconBg: 'bg-cyan-100/80' },
            { id: 'injection', label: 'Injection', sub: "Centre d'injection", icon: Sliders, color: 'text-emerald-600', activeBg: 'bg-emerald-50/70', activeBorder: 'border-emerald-500', activeText: 'text-emerald-950', activeIconBg: 'bg-emerald-100/80' },
            { id: 'directory', label: 'Reseau & Excel', sub: 'Twin Dossier Reseau', icon: FileSpreadsheet, color: 'text-indigo-600', activeBg: 'bg-indigo-50/70', activeBorder: 'border-indigo-500', activeText: 'text-indigo-950', activeIconBg: 'bg-indigo-100/80' },
            { id: 'matching', label: `Appairage (${discoveredItems.length})`, sub: 'Audit & Synchro', icon: ShieldAlert, color: 'text-amber-500', activeBg: 'bg-amber-50/70', activeBorder: 'border-amber-500', activeText: 'text-amber-950', activeIconBg: 'bg-amber-100/80' },
            { id: 'json-editor', label: 'Base JSON', sub: 'Editeur de Base', icon: FileCode, color: 'text-rose-500', activeBg: 'bg-rose-50/70', activeBorder: 'border-rose-500', activeText: 'text-rose-950', activeIconBg: 'bg-rose-100/80' },
            { id: 'admin', label: 'Compte Admin', sub: 'Profil & Securite', icon: UserCheck, color: 'text-violet-600', activeBg: 'bg-violet-50/70', activeBorder: 'border-violet-500', activeText: 'text-violet-950', activeIconBg: 'bg-violet-100/80' }
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left cursor-pointer w-full ${
                  isActive
                    ? `${tab.activeBg} ${tab.activeBorder} ${tab.activeText} shadow-xs font-bold scale-[1.01]`
                    : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/80 text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 border transition-all ${isActive ? `${tab.activeBorder} ${tab.activeIconBg}` : 'bg-white border-slate-200/80'}`}>
                  <IconComponent className={`w-4 h-4 ${tab.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>{tab.label}</div>
                  <div className={`text-[10px] mt-0.5 font-mono truncate ${isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                    {tab.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 w-full max-w-full overflow-hidden">
        
        {/* PANEL 1: SUPERVISION */}
        {activeTab === 'overview' &&
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-600" />
              Statistiques globales du stockage local
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* LocalStorage Usage */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-cyan-600" />
                    Cache Navigateur Local
                  </span>
                  <span className="font-mono text-cyan-800">{localStorageSizeKB} KB / 5 MB</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                  <div 
                    className="h-full bg-cyan-600 rounded-full transition-all duration-500" 
                    style={{ width: `${storagePercentage}%` }} 
                  />
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Le stockage local est occupe a {storagePercentage}%.
                </div>
              </div>

              {/* Counts Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Nombre de fiches enregistrees
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-500 pt-1">
                  <div>Articles: <b className="text-slate-900 font-mono font-bold">{rawStock.length}</b></div>
                  <div>Machines: <b className="text-slate-900 font-mono font-bold">{machines.length}</b></div>
                  <div>Mouvements: <b className="text-slate-900 font-mono font-bold">{mouvements.length}</b></div>
                  <div>Zones: <b className="text-slate-900 font-mono font-bold">{zones.length}</b></div>
                  <div>Techniciens: <b className="text-slate-900 font-mono font-bold">{technicians.length}</b></div>
                  <div>Chefs & Ops: <b className="text-slate-900 font-mono font-bold">{operations.length}</b></div>
                </div>
              </div>

              {/* Excel Linked */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2 col-span-1 md:col-span-2 lg:col-span-1">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                  Fichier Excel lie
                </div>
                <div className="text-xs pt-1 space-y-1 text-slate-500 font-medium">
                  <div className="truncate">Nom: <span className="text-slate-900 font-mono font-bold">{linkedFileName || 'GMAO_Light_Template.xlsx'}</span></div>
                  <div>Taille: <span className="text-slate-900 font-mono">{fileDetails.size}</span></div>
                  <div>Modifie le: <span className="text-slate-900 font-mono">{fileDetails.lastModified}</span></div>
                  <div className="flex items-center gap-1 text-[10px] font-bold mt-1 text-emerald-600">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Liaison: {linkedFileHandle ? "Connecte en Direct" : "Simulation Active (Excel Twin)"}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 leading-relaxed max-w-full">
              <div className="font-bold text-slate-900 mb-1">Mecanique d'unification de stockage:</div>
              Toutes les operations s'effectuent directement dans le navigateur pour garantir une execution fluide et ultra-rapide hors ligne. Les donnees de votre inventaire, de vos mouvements et de votre parc de machines sont preservees localement meme en cas de coupure de reseau.
            </div>
          </div>
        }

        {/* PANEL 2: INJECTION HUB */}
        {activeTab === 'injection' &&
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600 shrink-0" />
                  Centre d'injection des donnees d'usine
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Injectez les structures et donnees initiales du projet ou videz completement la base.
                </p>
              </div>
              <button
                onClick={handleInjectAll}
                className="w-full lg:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                Injecter toutes les donnees (941 elements)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Group 1: Stock */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs space-y-4">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-cyan-600" />
                    Stock & Articles
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Permet d'injecter 873 articles extraits de la maquette originale GMAO avec leurs codes et emplacements d'ateliers correspondants.
                  </p>
                </div>
                <button
                  onClick={() => handleInjectGroup('stock')}
                  className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  Injecter les articles
                </button>
              </div>

              {/* Group 2: Machines */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs space-y-4">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                    Parc Machines
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Initialise 6 machines enregistrees de reference, leurs familles de production et les templates structurels associés.
                  </p>
                </div>
                <button
                  onClick={() => handleInjectGroup('parc')}
                  className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  Injecter le parc
                </button>
              </div>

              {/* Group 3: Teams */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs space-y-4 col-span-1 sm:col-span-2 lg:col-span-1">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    Zones & Equipes
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Injecte les 4 zones geographiques d'ateliers d'usine, ainsi que l'equipe de techniciens et de coordinateurs GMAO.
                  </p>
                </div>
                <button
                  onClick={() => handleInjectGroup('zones')}
                  className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  Injecter les equipes
                </button>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 min-w-0">
                <span className="text-xs font-bold text-slate-700">Parametrage de demarrage par defaut:</span>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={isDemoMode}
                    onChange={(e) => setIsDemoMode(e.target.checked)}
                    className="rounded text-cyan-600 border-slate-300 focus:ring-cyan-500"
                  />
                  <span>Afficher les maquettes et fiches d'exemples au demarrage</span>
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
                <button
                  onClick={handleSaveSettings}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition cursor-pointer text-center"
                >
                  Enregistrer ma preference
                </button>
                <button
                  onClick={handleResetToZero}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Effacer tout et demarrer a vide
                </button>
              </div>
            </div>
          </div>
        }

        {/* PANEL 3: EXCEL & DIRECTORY LINK */}
        {activeTab === 'directory' &&
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-indigo-600" />
              Source des donnees et dossier reseau partage
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              Pour deployer le systeme sur plusieurs machines d'ateliers et partager la meme source en temps reel, vous pouvez coupler l'application a un repertoire de stockage partagé sur votre serveur local d'usine.
            </p>

            <div className="space-y-4 w-full bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Dossier reseau cible ou lecteur mappe partage :</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={sharedFolderPath}
                    onChange={(e) => setSharedFolderPath(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-200 font-mono text-slate-800"
                    placeholder="ex: Z:\Partage\CIOB_GMAO"
                  />
                  <button
                    onClick={onDirectLink}
                    className="h-10 px-4 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shrink-0 cursor-pointer w-full sm:w-auto"
                  >
                    <FolderOpen className="w-4 h-4 text-indigo-600" />
                    Changer de dossier
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Ecriture Excel automatique :</label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={autoWriteExcel}
                      onChange={(e) => setAutoWriteExcel(e.target.checked)}
                      className="rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <span>Mise a jour auto d'Excel a chaque mouvement</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Frequence de scrutation reseau (Auto-Reload) :</label>
                  <select
                    value={pollingInterval}
                    onChange={(e) => setPollingInterval(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 text-slate-800 w-full"
                  >
                    <option value="off">Rafraichissement manuel uniquement</option>
                    <option value="5s">Toutes les 5 secondes (Recommande)</option>
                    <option value="10s">Toutes les 10 secondes</option>
                    <option value="30s">Toutes les 30 secondes</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  Statut de couplage: 
                  {linkedFileHandle ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5 inline-flex">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      Connecté ({linkedFileName || "Fichier réseau partagé"})
                    </span>
                  ) : (
                    <span className="text-rose-700 font-bold flex items-center gap-1.5 inline-flex">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      Déconnecté (Aucun fichier réseau lié)
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="w-full sm:w-auto px-4 h-9 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Enregistrer les parametres
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 leading-relaxed max-w-full">
              <div className="font-bold text-slate-900 mb-1">Architecture reseau multi-postes:</div>
              En specifiant le meme chemin reseau partage d'ateliers pour chaque poste d'usine, l'application synchronisera ses ecrans automatiquement, garantissant aux operateurs, techniciens et coordinateurs un etat des stocks et un carnet de mouvements unifies.
            </div>
          </div>
        }

        {/* PANEL 4: AUDIT & MATCHING */}
        {activeTab === 'matching' &&
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                  Audit & vérification des données (Appairage)
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Détection automatique des éléments (machines, zones, utilisateurs) présents dans l'historique mais manquants dans les fiches officielles.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative">
                  <select
                    value={auditTarget}
                    onChange={(e) => setAuditTarget(e.target.value)}
                    className="appearance-none bg-white border border-slate-300 rounded-xl pl-4 pr-10 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                  >
                    <option value="machines">Machines (Parc)</option>
                    <option value="zones">Zones (Emplacements)</option>
                    <option value="utilisateurs">Utilisateurs (Membres)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
                {auditTarget === 'machines' && discoveredItems.length > 0 && (
                  <button
                    onClick={handleRegisterDiscovered}
                    className="w-full lg:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Enregistrer les {getAuditLabel()} ({discoveredItems.length})
                  </button>
                )}
              </div>
            </div>

            {discoveredItems.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2 max-w-full">
                <Check className="w-8 h-8 text-emerald-500 mx-auto bg-emerald-50 p-1.5 rounded-full" />
                <h4 className="text-sm font-bold text-slate-900">Tout est parfaitement apparié !</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Aucun identifiant ou nom de {getAuditLabel().toLowerCase()} manquant n'a été détecté dans les historiques. Vos analyses sont pleinement fiables.
                </p>
              </div>
            ) : (
              <div className="space-y-4 w-full max-w-full overflow-hidden">
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-xs text-amber-800 flex items-start gap-2.5 leading-relaxed">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Écart de base détecté :</span> Certains éléments de type "{getAuditLabel()}" apparaissent dans vos mouvements mais ne figurent pas dans la liste officielle.
                    {auditTarget === 'machines' ? " Cliquer sur le bouton d'enregistrement automatique ou enregistrez manuellement chaque élément." : " Cliquez sur Enregistrer à côté d'un élément pour ouvrir la fiche d'inscription manuelle et générer son identifiant séquentiel unique."}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-w-full">
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-[650px] w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Élément non enregistré détecté</th>
                          <th className="p-3">Occurrences</th>
                          <th className="p-3">Action recommandée</th>
                          <th className="p-3 text-right">Action manuelle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {discoveredItems.map((dm) => (
                          <tr key={dm.code} className="hover:bg-slate-50 transition text-slate-700">
                            <td className="p-3">
                              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                {dm.code}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 font-mono">
                              {dm.count} apparition{dm.count > 1 ? 's' : ''}
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded-full border border-cyan-200">
                                Créer la fiche ({getAuditLabel()})
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => {
                                  if (auditTarget === 'machines') {
                                    setMachines((prev) => [
                                      ...prev,
                                      {
                                        id_machine_registered: dm.code,
                                        designation: `Machine Auto-Detectee ${dm.code}`,
                                        id_family: families[0]?.id_family || 'FAM-EMB',
                                        id_templates: templates[0]?.id_templates || 'TPL-RCF100',
                                        id_zone_default: zones[0]?.id_zone || 'ZONE-DET',
                                        technician: technicians[0]?.nom || 'Technicien',
                                        status: 'En service'
                                      }
                                    ]);
                                    showToast(`Machine "${dm.code}" ajoutée avec succès.`, 'success');
                                  } else if (auditTarget === 'zones') {
                                    setAuditZoneForm({ libelle: dm.code });
                                    setShowAuditZoneModal(true);
                                  } else if (auditTarget === 'utilisateurs') {
                                    setAuditUserForm({
                                      type: 'TECHNICIEN',
                                      nom: dm.code,
                                      id_zone: zones[0]?.id_zone || '',
                                      specialite: ''
                                    });
                                    setShowAuditUserModal(true);
                                  }
                                }}
                                className="px-3 py-1 text-[11px] font-extrabold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition cursor-pointer"
                              >
                                Enregistrer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* AUDIT ZONE REGISTRATION MODAL */}
            {showAuditZoneModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Fiche d'enregistrement de Zone
                    </h3>
                    <button onClick={() => setShowAuditZoneModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Nom de la Zone / Atelier
                      </label>
                      <input
                        type="text"
                        value={auditZoneForm.libelle}
                        onChange={(e) => setAuditZoneForm(prev => ({ ...prev, libelle: e.target.value }))}
                        className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2"
                        placeholder="ex: Atelier Conditionnement"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAuditZoneModal(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!auditZoneForm.libelle.trim()) {
                          showToast("Veuillez saisir un nom de zone valide.", "error");
                          return;
                        }

                        const id = getNextZoneId();
                        const newZone = {
                          id_zone: id,
                          libelle: auditZoneForm.libelle.trim(),
                          nom: auditZoneForm.libelle.trim(),
                          description: ''
                        };
                        setZones(prev => [...prev, newZone]);
                        showToast(`Zone "${auditZoneForm.libelle.trim()}" enregistrée avec l'ID ${id}.`, 'success');
                        setShowAuditZoneModal(false);
                      }}
                      className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AUDIT USER REGISTRATION MODAL */}
            {showAuditUserModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Fiche d'enregistrement d'utilisateur
                    </h3>
                    <button onClick={() => setShowAuditUserModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Profil / Type d'utilisateur
                      </label>
                      <select
                        value={auditUserForm.type}
                        onChange={(e) => setAuditUserForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 bg-white"
                      >
                        <option value="TECHNICIEN">Technicien</option>
                        <option value="OPERATEUR">Opérateur (Production)</option>
                        <option value="CHEF">Chef d'équipe / Superviseur</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={auditUserForm.nom}
                        onChange={(e) => setAuditUserForm(prev => ({ ...prev, nom: e.target.value }))}
                        className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2"
                        placeholder="Nom de l'utilisateur"
                      />
                    </div>

                    {auditUserForm.type === 'TECHNICIEN' ? (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Spécialité
                        </label>
                        <input
                          type="text"
                          value={auditUserForm.specialite}
                          onChange={(e) => setAuditUserForm(prev => ({ ...prev, specialite: e.target.value }))}
                          className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2"
                          placeholder="Spécialité du technicien (ex: Mécanique, Électricité)"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Zone d'affectation
                        </label>
                        <select
                          value={auditUserForm.id_zone}
                          onChange={(e) => setAuditUserForm(prev => ({ ...prev, id_zone: e.target.value }))}
                          className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 bg-white"
                        >
                          <option value="">Sélectionner une zone</option>
                          {zones.map(z => (
                            <option key={z.id_zone} value={z.id_zone}>{z.libelle || z.nom}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAuditUserModal(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!auditUserForm.nom.trim()) {
                          showToast("Veuillez saisir un nom valide.", "error");
                          return;
                        }

                        const type = auditUserForm.type;
                        const id = getNextUserId(type);

                        if (type === 'TECHNICIEN') {
                          const newTech = {
                            id_technician: id,
                            nom: auditUserForm.nom.trim(),
                            specialite: auditUserForm.specialite.trim() || 'Générale',
                            contact: ''
                          };
                          setTechnicians(prev => [...prev, newTech]);
                        } else {
                          const newOp = {
                            id_operation: id,
                            nom: auditUserForm.nom.trim(),
                            id_zone: auditUserForm.id_zone || zones[0]?.id_zone || 'ZONE-DET',
                            type_profil: type
                          };
                          setOperations(prev => [...prev, newOp]);
                        }

                        showToast(`Utilisateur "${auditUserForm.nom.trim()}" enregistré avec l'ID ${id}.`, 'success');
                        setShowAuditUserModal(false);
                      }}
                      className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        }

        {/* PANEL 5: ADVANCED JSON PLAYGROUND */}
        {activeTab === 'json-editor' &&
          <div className="space-y-6 max-w-full overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-rose-500 shrink-0" />
                  Modification brute de la base de donnees locale au format JSON
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Modifiez directement les collections brutes de votre GMAO sous forme de fichiers de donnees JSON.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                <select
                  value={jsonTarget}
                  onChange={(e) => setJsonTarget(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200 text-slate-800 shadow-xs cursor-pointer min-w-[200px]"
                >
                  <option value="rawStock">Articles & Stock_Actuel</option>
                  <option value="mouvements">Mouvements & Historique</option>
                  <option value="machines">Machines_Registered</option>
                  <option value="families">Familles</option>
                  <option value="templates">Modeles (Templates)</option>
                  <option value="zones">Zones d'usine</option>
                  <option value="technicians">Techniciens</option>
                  <option value="operations">Coordinateurs & Chefs</option>
                  <option value="types">Types de pieces</option>
                </select>

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                  {/* Input cache pour le chargement du fichier JSON */}
                  <input
                    type="file"
                    id="json-file-upload-input"
                    accept=".json"
                    onChange={handleUploadJSON}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => document.getElementById('json-file-upload-input').click()}
                    className="h-10 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Importer un fichier JSON externe"
                  >
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Importer</span>
                  </button>

                  <button
                    onClick={handleDownloadJSON}
                    className="h-10 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Telecharger le code actuel au format JSON"
                  >
                    <Download className="w-4 h-4 text-indigo-600" />
                    <span>Telecharger</span>
                  </button>
                </div>
              </div>
            </div>

            {jsonError && (
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-mono text-rose-700 flex items-start gap-2 max-w-full overflow-hidden break-words">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold">Erreur de structure JSON :</div>
                  <div className="mt-1 opacity-90 whitespace-pre-wrap break-all text-[11px]">{jsonError}</div>
                </div>
              </div>
            )}

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 shadow-xs w-full max-w-full">
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-col sm:flex-row gap-2 justify-between sm:items-center text-xs text-slate-400 font-mono">
                <span className="truncate">Editeur natif de code ({jsonTarget})</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-700 w-fit shrink-0">Tableau d'objets attendu</span>
              </div>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full h-96 p-4 bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed border-0 focus:ring-0 focus:outline-none resize-y overflow-auto block"
                spellCheck="false"
              />
            </div>

            {/* Actions de modification JSON */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={handleCancelEdits}
                disabled={!isJsonModified}
                className={`w-full sm:w-auto h-10 px-4 border font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 ${
                  isJsonModified
                    ? 'bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-700 cursor-pointer'
                    : 'bg-rose-50/50 border-rose-100 text-rose-400 cursor-not-allowed opacity-50'
                }`}
                title="Annuler les modifications et recharger les donnees d'origine"
              >
                <RotateCcw className={`w-4 h-4 ${isJsonModified ? 'text-rose-600' : 'text-rose-400'}`} />
                <span>Annuler</span>
              </button>

              <button
                onClick={handleSaveJSON}
                disabled={!isJsonModified}
                className={`w-full sm:w-auto h-10 px-4 border font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 ${
                  isJsonModified
                    ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700 cursor-pointer'
                    : 'bg-emerald-50/50 border-emerald-100 text-emerald-400 cursor-not-allowed opacity-50'
                }`}
                title="Sauvegarder et appliquer definitivement le JSON"
              >
                <Check className={`w-4 h-4 ${isJsonModified ? 'text-emerald-600' : 'text-emerald-400'}`} />
                <span>Enregistrer</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 leading-relaxed max-w-full">
              <span className="font-bold text-slate-700">Notice de sauvegarde :</span> Vous pouvez copier cette structure JSON pour conserver une sauvegarde externe de securite ou modifier directement les champs des elements. Veillez a respecter les correspondances de cles ID pour ne pas rompre la coherence relationnelle.
            </div>
          </div>
        }

        {/* PANEL 6: ADMIN ACCOUNT & SECURITY SETTINGS */}
        {activeTab === 'admin' && (
          <div className="space-y-6 max-w-full overflow-hidden">
            {/* Tab header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-violet-500 shrink-0" />
                  Paramètres du Compte & Configuration d'Accès
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Gérez les informations d'identification, modifiez la description de fonction du Responsable du Magasin, configurez le code PIN de sécurité ou activez l'accès direct sans code.
                </p>
              </div>
            </div>

            {/* Profile Summary Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-violet-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                RM
              </div>
              <div className="text-center sm:text-left min-w-0 flex-1">
                <h4 className="text-base font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                  <span>Responsable du Magasin</span>
                  <span className="text-[10px] font-mono font-bold bg-violet-100 text-violet-700 border border-violet-200/50 px-2 py-0.5 rounded-full">Compte Principal</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Fonction : <span className="font-semibold text-slate-800">{tempRole}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Zone d'activité : Magasin Central • Privilèges : Écriture et Lecture Totale (Offline)
                </p>
              </div>
              <div className="flex flex-col items-center sm:items-end gap-1.5 shrink-0">
                <div className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Mode Chiffré Actif
                </div>
              </div>
            </div>

            {/* Config Fields Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              {/* Left Column: Role & Access Mode */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-violet-500" />
                    Rôle & Paramètres de Connexion
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Personnalisez votre étiquette de fonction et le comportement de l'écran d'accueil.</p>
                </div>

                {/* Description input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                    Description du Rôle
                  </label>
                  <input
                    type="text"
                    value={tempRole}
                    onChange={(e) => setTempRole(e.target.value)}
                    placeholder="Ex: Gestionnaire Principal du Stock & Mouvements"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-200 transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Ce titre s'affichera sur l'écran d'accueil, le menu latéral, ainsi que sur toutes les impressions de bons et rapports d'activité.
                  </p>
                </div>

                {/* Open mode option */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center h-5 mt-0.5">
                      <input
                        id="open-mode-checkbox"
                        type="checkbox"
                        checked={tempOpenMode}
                        onChange={(e) => setTempOpenMode(e.target.checked)}
                        className="w-4.5 h-4.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                      />
                    </div>
                    <div className="text-xs">
                      <label htmlFor="open-mode-checkbox" className="font-bold text-slate-800 cursor-pointer flex items-center gap-1.5">
                        {tempOpenMode ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
                        Activer l'Accès Libre (Connexion sans code)
                      </label>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Si coché, l'application se connectera directement en un clic sur le bouton de connexion sans exiger la saisie du code PIN. Idéal pour un usage rapide sur tablette ou PC dédié.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Code PIN & Encryption Engine */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    Code PIN de Sécurité
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Configurez votre code secret et visualisez le moteur de chiffrement local en direct.</p>
                </div>

                {/* PIN Code input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                    Nouveau Code PIN
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      pattern="[0-9]*"
                      value={tempPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setTempPin(val);
                      }}
                      placeholder="Ex: 1234"
                      maxLength={8}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono font-bold text-slate-800 tracking-wider focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-200 transition"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Saisissez uniquement des chiffres (Longueur recommandée : 4 à 8 chiffres).
                  </p>
                </div>

                {/* Live Cryptographic Engine visualization */}
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 font-mono text-[11px] space-y-2 max-w-full overflow-hidden">
                  <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-1.5 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      MOTEUR DE CHIFFREMENT GMAO
                    </span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400">AES-BASE64</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Algorithme:</span>
                    <span className="col-span-2 text-slate-300">Base64 + Salt pseudo-SHA</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Grain de Sel:</span>
                    <span className="col-span-2 text-indigo-400 select-all truncate">CIOB_GMAO_SECURE_SALT</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Texte Clair:</span>
                    <span className="col-span-2 text-amber-400">"{tempPin || 'vide'}"</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-800/80">
                    <span className="text-slate-500 font-bold">Résultat chiffré:</span>
                    <span className="col-span-2 text-emerald-400 font-bold break-all select-all text-[10.5px]">
                      {tempPin ? btoa(`CIOB_GMAO_SECURE_SALT:${tempPin}`) : 'Attente saisie...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-700">Notice de sécurité :</span> Vos modifications de sécurité seront enregistrées localement de manière sécurisée et prendront effet immédiatement.
              </div>
              <button
                onClick={handleSaveAdminConfig}
                className="w-full sm:w-auto h-11 px-6 bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <CheckCircle2 className="w-4.5 h-4.5 text-violet-100" />
                <span>Sauvegarder & Appliquer la Configuration</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </AnimatedPage>
  );
}
