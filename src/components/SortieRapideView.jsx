import React, { useState, useMemo } from 'react';
import CustomSelect from './CustomSelect';
import SortieEntreeIcon from './SortieEntreeIcon';
import {
  ArrowUp,
  ArrowDown,
  Package,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Cpu,
  Users,
  Wrench,
  FileText,
  Crown,
  UserCheck,
  Sparkles,
  ChevronsUp,
  Info,
  Search,
  Hash,
  Truck,
  RotateCcw,
  Sliders,
  Check,
  X,
  Factory,
  Warehouse,
  ShieldCheck,
  Filter
} from 'lucide-react';

export default function SortieRapideView({
  mouvements,
  stockItems,
  zones,
  machines,
  technicians,
  operations,
  onAddMouvement,
  onDeleteMouvement,
  onOpenAddArticle,
  onOpenAddMachine,
  onOpenAddZone
}) {
  // Find Zone Maintenance (e.g. ZONE-ATEL or any atelier zone or first zone)
  const maintenanceZone = zones.find((z) => 
    z.id_zone.toLowerCase().includes('atel') || 
    z.libelle.toLowerCase().includes('maintenance') || 
    z.libelle.toLowerCase().includes('atelier')
  ) || zones[0];

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Sortie', // 'Sortie' | 'Entrée'
    ref: stockItems[0]?.ref || '',
    quantite: 1,
    bon_number: String(mouvements.length + 1).padStart(3, '0'), // User enters number, prefix is BON-
    action_id: 'CORRECTIVE', // In Sortie: CORRECTIVE, PREVENTIVE, AMELIORATIVE, USAGE, INVENTAIRE / In Entree: REAPPRO, RETOUR, INVENTAIRE
    usage_type: 'technician', // 'technician' | 'operation' | 'chef'
    id_zone: zones[0]?.id_zone || '',
    id_machine_registered: machines[0]?.id_machine_registered || '',
    technicien: technicians[0]?.nom || '',
    operation: '',
    fournisseur: 'Fournisseur Central Industriel',
    emplacement_reception: stockItems[0]?.emplacement || 'Magasin Central - R1',
    commentaire: ''
  });

  // Modal / Dropdown state for Article Search
  const [isArticleSearchOpen, setIsArticleSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Filter for movements table
  const [tableFilterType, setTableFilterType] = useState('ALL'); // 'ALL' | 'Sortie' | 'Entrée'
  const [tableFilterAction, setTableFilterAction] = useState('ALL');
  const [tableSearchText, setTableSearchText] = useState('');

  const selectedArticle = stockItems.find((s) => s.ref === form.ref);

  // Available machines for selected zone
  const availableMachines = machines.filter(
    (m) => !form.id_zone || m.id_zone_default === form.id_zone
  );

  // Available techs for selected zone
  const availableTechs = technicians.filter(
    (t) => !form.id_zone || t.id_zone === form.id_zone
  );

  // Available ops for selected zone
  const availableOps = operations.filter(
    (op) => !form.id_zone || op.id_zone === form.id_zone
  );

  // List of chefs and operators
  const chefsList = operations.filter(
    (op) => op.type_profil === 'CHEF' || String(op.id_operation).startsWith('CHEF')
  );
  const operatorsList = operations.filter(
    (op) => op.type_profil !== 'CHEF' && !String(op.id_operation).startsWith('CHEF')
  );

  // Unique article types for search filter
  const articleTypes = useMemo(() => {
    const set = new Set();
    stockItems.forEach((item) => {
      if (item.id_type) set.add(item.id_type);
    });
    return Array.from(set);
  }, [stockItems]);

  // Filtered articles based on search query and type filter
  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stockItems.filter((item) => {
      if (filterType !== 'ALL' && item.id_type !== filterType) {
        return false;
      }
      if (!q) return true;
      const refMatch = String(item.ref || '').toLowerCase().includes(q);
      const desMatch = String(item.designation || '').toLowerCase().includes(q);
      const typeMatch = String(item.id_type || '').toLowerCase().includes(q);
      const empMatch = String(item.emplacement || '').toLowerCase().includes(q);
      return refMatch || desMatch || typeMatch || empMatch;
    });
  }, [stockItems, searchQuery, filterType]);

  // Helper for highlight matched text in search results
  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const strText = String(text);
    const lowerQuery = query.toLowerCase();
    const index = strText.toLowerCase().indexOf(lowerQuery);
    if (index === -1) return strText;

    const before = strText.slice(0, index);
    const match = strText.slice(index, index + query.length);
    const after = strText.slice(index + query.length);

    return (
      <>
        {before}
        <mark className="bg-amber-200 text-amber-900 font-bold px-0.5 rounded">
          {match}
        </mark>
        {after}
      </>
    );
  };

  // When type changes (Sortie vs Entrée), adapt available default actions and form structure
  const handleTypeChange = (newType) => {
    if (newType === 'Sortie') {
      const defaultAction = 'CORRECTIVE';
      setForm({
        ...form,
        type: 'Sortie',
        action_id: defaultAction,
        operation: '',
        id_zone: zones[0]?.id_zone || '',
        id_machine_registered: machines[0]?.id_machine_registered || '',
        technicien: technicians[0]?.nom || ''
      });
    } else {
      // Entrée
      const defaultAction = 'REAPPRO';
      setForm({
        ...form,
        type: 'Entrée',
        action_id: defaultAction,
        id_zone: '',
        id_machine_registered: '',
        operation: '',
        technicien: technicians[0]?.nom || '',
        emplacement_reception: selectedArticle?.emplacement || 'Magasin Central - R1'
      });
    }
  };

  // Synchronize dynamic fields when action_id changes
  const handleActionChange = (newAction) => {
    let updated = { ...form, action_id: newAction };

    if (newAction === 'CORRECTIVE') {
      // Machine + Tech + Zone (No Operator)
      updated.operation = '';
      if (!updated.id_zone && zones.length > 0) updated.id_zone = zones[0].id_zone;
      if (!updated.technicien && technicians.length > 0) updated.technicien = technicians[0].nom;
      if (!updated.id_machine_registered && machines.length > 0) updated.id_machine_registered = machines[0].id_machine_registered;
    } else if (newAction === 'PREVENTIVE' || newAction === 'AMELIORATIVE') {
      // Tech + Zone + Machine (+ optional Op/Gamme)
      if (!updated.id_zone && zones.length > 0) updated.id_zone = zones[0].id_zone;
      if (!updated.technicien && technicians.length > 0) updated.technicien = technicians[0].nom;
      if (!updated.id_machine_registered && machines.length > 0) updated.id_machine_registered = machines[0].id_machine_registered;
    } else if (newAction === 'USAGE') {
      // Personal Usage -> No Machine
      updated.id_machine_registered = '';
      if (updated.usage_type === 'technician') {
        updated.operation = '';
        if (maintenanceZone) updated.id_zone = maintenanceZone.id_zone;
        if (!updated.technicien && technicians.length > 0) updated.technicien = technicians[0].nom;
      } else if (updated.usage_type === 'operation') {
        updated.technicien = '';
        const op = operatorsList[0] || operations[0];
        if (op) {
          updated.operation = op.nom;
          updated.id_zone = op.id_zone || zones[0]?.id_zone || '';
        }
      } else if (updated.usage_type === 'chef') {
        updated.technicien = '';
        const ch = chefsList[0] || operations[0];
        if (ch) {
          updated.operation = ch.nom;
          updated.id_zone = ch.id_zone || zones[0]?.id_zone || '';
        }
      }
    } else if (newAction === 'REAPPRO' || newAction === 'RETOUR') {
      // Entrée specific -> No machine, no zone, only tech demandeur + warehouse/factory
      updated.id_machine_registered = '';
      updated.id_zone = '';
      updated.operation = '';
      if (!updated.technicien && technicians.length > 0) updated.technicien = technicians[0].nom;
    }

    setForm(updated);
  };

  const handleUsageTypeChange = (newUsageType) => {
    let updated = { ...form, usage_type: newUsageType, id_machine_registered: '' };

    if (newUsageType === 'technician') {
      updated.operation = '';
      if (maintenanceZone) updated.id_zone = maintenanceZone.id_zone;
      if (!updated.technicien && technicians.length > 0) updated.technicien = technicians[0].nom;
    } else if (newUsageType === 'operation') {
      updated.technicien = '';
      const op = operatorsList[0] || operations[0];
      if (op) {
        updated.operation = op.nom;
        updated.id_zone = op.id_zone || zones[0]?.id_zone || '';
      }
    } else if (newUsageType === 'chef') {
      updated.technicien = '';
      const ch = chefsList[0] || operations[0];
      if (ch) {
        updated.operation = ch.nom;
        updated.id_zone = ch.id_zone || zones[0]?.id_zone || '';
      }
    }

    setForm(updated);
  };

  // When selected technician changes in USAGE mode
  const handleTechnicianChange = (techNom) => {
    const techObj = technicians.find((t) => t.nom === techNom);
    setForm((prev) => ({
      ...prev,
      technicien: techNom,
      id_zone: prev.action_id === 'USAGE' ? (maintenanceZone ? maintenanceZone.id_zone : (techObj?.id_zone || prev.id_zone)) : prev.id_zone
    }));
  };

  // When selected operator/chef changes in USAGE mode
  const handleOperationChange = (opNom) => {
    const opObj = operations.find((o) => o.nom === opNom || o.id_operation === opNom);
    setForm((prev) => ({
      ...prev,
      operation: opNom,
      id_zone: opObj?.id_zone ? opObj.id_zone : prev.id_zone
    }));
  };

  // Select article from search modal
  const handleSelectArticle = (art) => {
    setForm((prev) => ({
      ...prev,
      ref: art.ref,
      emplacement_reception: art.emplacement || prev.emplacement_reception
    }));
    setIsArticleSearchOpen(false);
    setSearchQuery('');
  };

  // Quantity stepper handlers
  const handleIncreaseQty = () => {
    setForm((prev) => ({ ...prev, quantite: Number(prev.quantite) + 1 }));
  };

  const handleDecreaseQty = () => {
    setForm((prev) => ({ ...prev, quantite: Math.max(1, Number(prev.quantite) - 1) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.ref || form.quantite <= 0) return;

    const fullBonCode = `Bon-${form.bon_number.trim() || String(mouvements.length + 1).padStart(3, '0')}`;

    const newMvt = {
      id: Date.now(),
      date: form.date,
      type: form.type,
      ref: form.ref,
      quantite: Number(form.quantite),
      code_bon: fullBonCode,
      action_id: form.action_id,
      id_zone: form.type === 'Entrée' ? '' : form.id_zone,
      id_machine_registered: form.type === 'Entrée' || form.action_id === 'USAGE' ? '' : form.id_machine_registered,
      technicien: form.action_id === 'USAGE' && form.usage_type !== 'technician' ? '' : form.technicien,
      operation: form.action_id === 'CORRECTIVE' || form.type === 'Entrée' ? '' : (form.action_id === 'USAGE' && form.usage_type === 'technician' ? '' : form.operation),
      fournisseur: form.type === 'Entrée' ? form.fournisseur : undefined,
      emplacement_reception: form.type === 'Entrée' ? form.emplacement_reception : undefined,
      commentaire: form.commentaire,
      usage_type: form.action_id === 'USAGE' ? form.usage_type : undefined
    };

    onAddMouvement(newMvt);
    
    // Prepare next bon number
    const nextBonNum = String(parseInt(form.bon_number, 10) + 1 || mouvements.length + 2).padStart(3, '0');
    setForm({
      ...form,
      quantite: 1,
      bon_number: nextBonNum,
      commentaire: ''
    });
  };

  // Filtered movements for table
  const displayedMouvements = useMemo(() => {
    return mouvements.filter((m) => {
      if (tableFilterType !== 'ALL' && m.type !== tableFilterType) return false;
      if (tableFilterAction !== 'ALL' && m.action_id !== tableFilterAction) return false;
      if (tableSearchText.trim()) {
        const q = tableSearchText.trim().toLowerCase();
        const bonMatch = String(m.code_bon || '').toLowerCase().includes(q);
        const refMatch = String(m.ref || '').toLowerCase().includes(q);
        const techMatch = String(m.technicien || '').toLowerCase().includes(q);
        const opMatch = String(m.operation || '').toLowerCase().includes(q);
        const mchMatch = String(m.id_machine_registered || '').toLowerCase().includes(q);
        const comMatch = String(m.commentaire || '').toLowerCase().includes(q);
        return bonMatch || refMatch || techMatch || opMatch || mchMatch || comMatch;
      }
      return true;
    });
  }, [mouvements, tableFilterType, tableFilterAction, tableSearchText]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <SortieEntreeIcon className="w-5 h-5 shrink-0" strokeWidth={2.5} />
            <span>Sortie & Entrée Rapide (Formulaire Gouverné)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gouvernance stricte par Type d'Action : Cartes adaptatives dynamiques selon le flux (<b className="text-rose-700">Sortie</b> ou <b className="text-emerald-700">Entrée</b>), traçabilité par <b className="text-indigo-700">Bon-#</b> et recherche d'article avancée.
          </p>
        </div>
      </div>

      {/* Excel Formula Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Corrective</div>
              <div className="text-xs font-semibold text-rose-700">Machine + Tech + Zone</div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">Sortie</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Préventive / Amélio</div>
              <div className="text-xs font-semibold text-blue-700">Tech + Zone + Machine</div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Sortie</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Usage Métier</div>
              <div className="text-xs font-semibold text-amber-700">Tech / Op / Chef (Sans Machine)</div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Sortie</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Réappro Fournisseur</div>
              <div className="text-xs font-semibold text-emerald-700">Tech Demandeur + Magasin</div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Entrée</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Container (5 columns on wide screen) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Nouveau Mouvement</span>
            </h3>
            {/* Flow Type Switcher: Sortie / Entree */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleTypeChange('Sortie')}
                className={`px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  form.type === 'Sortie'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Sortie</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('Entrée')}
                className={`px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  form.type === 'Entrée'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Entrée</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Row: Date & Code Bon with # icon and Bon- prefix */}
            <div className="grid grid-cols-2 gap-3">
              {/* Date */}
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                  required
                />
              </div>

              {/* Code Bon: User enters digits with Bon- locked prefix and # Icon */}
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-indigo-600" />
                  <span>Numéro de Bon</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 flex items-center gap-1 pointer-events-none text-indigo-700 font-mono font-bold text-xs">
                    <Hash className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Bon-</span>
                  </div>
                  <input
                    type="text"
                    placeholder="001"
                    value={form.bon_number}
                    onChange={(e) => setForm({ ...form, bon_number: e.target.value })}
                    className="w-full h-9 pl-16 pr-2.5 rounded-xl border border-indigo-200 bg-indigo-50/30 text-xs font-mono font-bold text-indigo-950 focus:bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Article Select with Advanced Search Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-slate-600" />
                  <span>Article (Stock Actuel)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsArticleSearchOpen(true)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-200 transition"
                  >
                    <Search className="w-3 h-3" />
                    <span>Recherche Avancée</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenAddArticle}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    + Créer
                  </button>
                </div>
              </div>

              {/* Custom selector */}
              <CustomSelect
                value={form.ref}
                onChange={(val) => {
                  const item = stockItems.find((s) => s.ref === val);
                  setForm({
                    ...form,
                    ref: val,
                    emplacement_reception: item?.emplacement || form.emplacement_reception
                  });
                }}
                options={stockItems.map((s) => ({
                  value: s.ref,
                  label: `[${s.ref}] ${s.designation}`,
                  badge: s.stockActuel <= 0 ? 'Rupture (0)' : `Stock: ${s.stockActuel}`,
                  badgeColor: s.stockActuel <= 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                }))}
                placeholder="-- Choisir un Article --"
                searchable={true}
              />

              {/* Selected Article Preview Card */}
              {selectedArticle && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span>{selectedArticle.designation}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700 font-mono">
                        {selectedArticle.id_type || 'Type N/A'}
                      </span>
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Emplacement : <span className="font-mono font-bold text-slate-700">{selectedArticle.emplacement || 'R1-B01'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500 text-[10px]">Stock Actuel</div>
                    <div className={`font-mono font-bold text-sm ${selectedArticle.stockActuel <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {selectedArticle.stockActuel} {selectedArticle.stockActuel <= 0 ? '⚠️' : '✓'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quantite with Stepper Buttons (- / +) */}
            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Quantité de Pièces ({form.type})
              </label>
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={handleDecreaseQty}
                  className="absolute left-1.5 z-10 w-7 h-7 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition active:scale-95"
                  title="Diminuer la quantité"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={form.quantite}
                  onChange={(e) => setForm({ ...form, quantite: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full h-9 px-10 text-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-900 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={handleIncreaseQty}
                  className="absolute right-1.5 z-10 w-7 h-7 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition active:scale-95"
                  title="Augmenter la quantité"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Type d'Action (Filter Selector with clean SVG icons) */}
            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Type d'Action (Gouvernance Métier)
              </label>

              {form.type === 'Sortie' ? (
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleActionChange('CORRECTIVE')}
                    className={`p-2 rounded-xl text-left border transition flex items-center gap-2 ${
                      form.action_id === 'CORRECTIVE'
                        ? 'bg-blue-50/80 border-blue-300 text-blue-950 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      form.action_id === 'CORRECTIVE' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] leading-tight">Corrective</div>
                      <div className="text-[9.5px] text-slate-500 font-normal">Dépannage Machine</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionChange('PREVENTIVE')}
                    className={`p-2 rounded-xl text-left border transition flex items-center gap-2 ${
                      form.action_id === 'PREVENTIVE'
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      form.action_id === 'PREVENTIVE' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] leading-tight">Préventive</div>
                      <div className="text-[9.5px] text-slate-500 font-normal">Planifiée & Gamme</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionChange('AMELIORATIVE')}
                    className={`p-2 rounded-xl text-left border transition flex items-center gap-2 ${
                      form.action_id === 'AMELIORATIVE'
                        ? 'bg-purple-50/80 border-purple-300 text-purple-950 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      form.action_id === 'AMELIORATIVE' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
                    }`}>
                      <ChevronsUp className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] leading-tight">Améliorative</div>
                      <div className="text-[9.5px] text-slate-500 font-normal">Rétrofit & Modif</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionChange('USAGE')}
                    className={`p-2 rounded-xl text-left border transition flex items-center gap-2 ${
                      form.action_id === 'USAGE'
                        ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      form.action_id === 'USAGE' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] leading-tight">Usage Personnel</div>
                      <div className="text-[9.5px] text-slate-500 font-normal">Sans Machine</div>
                    </div>
                  </button>
                </div>
              ) : (
                /* Entrée Action choices */
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleActionChange('REAPPRO')}
                    className={`p-2 rounded-xl text-left border transition flex items-center gap-2 ${
                      form.action_id === 'REAPPRO'
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      form.action_id === 'REAPPRO' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] leading-tight">Réappro Fournisseur</div>
                      <div className="text-[9.5px] text-slate-500 font-normal">Achat & Livraison</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionChange('RETOUR')}
                    className={`p-2 rounded-xl text-left border transition flex items-center gap-2 ${
                      form.action_id === 'RETOUR'
                        ? 'bg-cyan-50/80 border-cyan-300 text-cyan-950 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      form.action_id === 'RETOUR' ? 'bg-cyan-600 text-white' : 'bg-cyan-100 text-cyan-700'
                    }`}>
                      <RotateCcw className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] leading-tight">Retour Atelier</div>
                      <div className="text-[9.5px] text-slate-500 font-normal">Réintégration Pièce</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* DYNAMIC CARD CONTAINERS ACCORDING TO ACTION TYPE */}

            {/* CASE 1: ENTRÉE FLOW (REAPPRO / RETOUR) -> Shows Technician Demandeur + Warehouse & Factory Reception without Zone/Machine */}
            {form.type === 'Entrée' && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 border-b border-emerald-200/60 pb-2">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-xs text-emerald-950">Gouvernance de Réception (Entrée en Stock)</span>
                </div>

                {/* Technicien Réceptionnaire / Demandeur */}
                <div>
                  <label className="text-[10.5px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                    Technicien Réceptionnaire / Demandeur
                  </label>
                  <CustomSelect
                    value={form.technicien}
                    onChange={(val) => setForm({ ...form, technicien: val })}
                    options={technicians.map((t) => ({
                      value: t.nom,
                      label: `${t.id_technician} - ${t.nom}`,
                      badge: t.id_zone,
                      sublabel: t.specialite
                    }))}
                    placeholder="-- Sélectionner Technicien --"
                  />
                </div>

                {/* Warehouse Location & Factory Info */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-bold text-emerald-900 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Warehouse className="w-3 h-3 text-emerald-600" />
                      <span>Emplacement Magasin</span>
                    </label>
                    <input
                      type="text"
                      value={form.emplacement_reception}
                      onChange={(e) => setForm({ ...form, emplacement_reception: e.target.value })}
                      placeholder="ex: R1-B04"
                      className="w-full h-8 px-2.5 rounded-xl border border-emerald-200 bg-white text-xs font-mono font-semibold text-emerald-950"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-emerald-900 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Factory className="w-3 h-3 text-emerald-600" />
                      <span>Fournisseur / Usine</span>
                    </label>
                    <input
                      type="text"
                      value={form.fournisseur}
                      onChange={(e) => setForm({ ...form, fournisseur: e.target.value })}
                      placeholder="Nom du Fournisseur"
                      className="w-full h-8 px-2.5 rounded-xl border border-emerald-200 bg-white text-xs font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CASE 2: SORTIE -> USAGE (Personal Usage Card) */}
            {form.type === 'Sortie' && form.action_id === 'USAGE' && (
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                <div>
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-amber-900 block mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Bénéficiaire de l'Usage (Sans Machine)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUsageTypeChange('technician')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                        form.usage_type === 'technician'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-100/50'
                      }`}
                    >
                      <Users className="w-3 h-3" />
                      <span>Technicien</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUsageTypeChange('operation')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                        form.usage_type === 'operation'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-indigo-50'
                      }`}
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Opérateur</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUsageTypeChange('chef')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                        form.usage_type === 'chef'
                          ? 'bg-amber-700 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-100/50'
                      }`}
                    >
                      <Crown className="w-3 h-3" />
                      <span>Chef</span>
                    </button>
                  </div>
                </div>

                {form.usage_type === 'technician' && (
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Technicien Bénéficiaire
                    </label>
                    <CustomSelect
                      value={form.technicien}
                      onChange={(val) => handleTechnicianChange(val)}
                      options={technicians.map((t) => ({
                        value: t.nom,
                        label: `[${t.id_technician}] ${t.nom}`,
                        badge: t.id_zone,
                        sublabel: t.specialite
                      }))}
                      placeholder="-- Sélectionner Technicien --"
                    />
                  </div>
                )}

                {form.usage_type === 'operation' && (
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Opérateur Bénéficiaire
                    </label>
                    <CustomSelect
                      value={form.operation}
                      onChange={(val) => handleOperationChange(val)}
                      options={operatorsList.map((op) => ({
                        value: op.nom,
                        label: `[${op.id_operation}] ${op.nom}`,
                        badge: `Zone: ${op.id_zone}`
                      }))}
                      placeholder="-- Sélectionner Opérateur --"
                    />
                  </div>
                )}

                {form.usage_type === 'chef' && (
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Chef d'Équipe Bénéficiaire
                    </label>
                    <CustomSelect
                      value={form.operation}
                      onChange={(val) => handleOperationChange(val)}
                      options={chefsList.map((op) => ({
                        value: op.nom,
                        label: `👑 [${op.id_operation}] ${op.nom}`,
                        badge: `Zone: ${op.id_zone}`,
                        badgeColor: 'bg-amber-100 text-amber-900'
                      }))}
                      placeholder="-- Sélectionner Chef d'Équipe --"
                    />
                  </div>
                )}

                {/* Zone auto deduced */}
                <div>
                  <label className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Zone Déduite Automatiquement
                  </label>
                  <div className="h-8 px-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs font-medium text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>{zones.find((z) => z.id_zone === form.id_zone)?.libelle || form.id_zone || 'Zone Déduite'}</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {form.id_zone || 'AUTO'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* CASE 3: SORTIE -> CORRECTIVE CARD (Machine + Tech + Zone, No Opérateur) */}
            {form.type === 'Sortie' && form.action_id === 'CORRECTIVE' && (
              <div className="p-3.5 rounded-2xl bg-blue-50/40 border border-blue-200 space-y-3">
                <div className="flex items-center gap-2 border-b border-blue-200/60 pb-2">
                  <Wrench className="w-4 h-4 text-blue-700" />
                  <span className="font-bold text-xs text-blue-950">Gouvernance Corrective (Dépannage Machine)</span>
                </div>

                {/* Zone & Machine side by side */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
                      Zone
                    </label>
                    <CustomSelect
                      value={form.id_zone}
                      onChange={(val) => setForm({ ...form, id_zone: val })}
                      options={zones.map((z) => ({
                        value: z.id_zone,
                        label: `${z.libelle} (${z.id_zone})`
                      }))}
                      placeholder="-- Zone --"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
                      Machine Concernée
                    </label>
                    <CustomSelect
                      value={form.id_machine_registered}
                      onChange={(val) => setForm({ ...form, id_machine_registered: val })}
                      options={(availableMachines.length > 0 ? availableMachines : machines).map((m) => ({
                        value: m.id_machine_registered,
                        label: `[${m.id_machine_registered}] ${m.designation}`,
                        badge: m.id_zone_default
                      }))}
                      placeholder="-- Machine Obligatoire --"
                    />
                  </div>
                </div>

                {/* Technicien */}
                <div>
                  <label className="text-[10.5px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
                    Technicien Intervenant
                  </label>
                  <CustomSelect
                    value={form.technicien}
                    onChange={(val) => setForm({ ...form, technicien: val })}
                    options={(availableTechs.length > 0 ? availableTechs : technicians).map((t) => ({
                      value: t.nom,
                      label: `${t.id_technician} - ${t.nom}`,
                      badge: t.id_zone,
                      sublabel: t.specialite
                    }))}
                    placeholder="-- Sélectionner Technicien --"
                  />
                </div>
              </div>
            )}

            {/* CASE 4: SORTIE -> PREVENTIVE CARD (Machine + Tech + Zone + Gamme Opérateur/Chef) */}
            {form.type === 'Sortie' && form.action_id === 'PREVENTIVE' && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 border-b border-emerald-200/60 pb-2">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-xs text-emerald-950">
                    Gouvernance Préventive (Planifiée & Gammes)
                  </span>
                </div>

                {/* Zone & Machine side by side */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                      Zone
                    </label>
                    <CustomSelect
                      value={form.id_zone}
                      onChange={(val) => setForm({ ...form, id_zone: val })}
                      options={zones.map((z) => ({
                        value: z.id_zone,
                        label: `${z.libelle} (${z.id_zone})`
                      }))}
                      placeholder="-- Zone --"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                      Machine
                    </label>
                    <CustomSelect
                      value={form.id_machine_registered}
                      onChange={(val) => setForm({ ...form, id_machine_registered: val })}
                      options={[
                        { value: '', label: '-- Non spécifiée / Atelier --' },
                        ...(availableMachines.length > 0 ? availableMachines : machines).map((m) => ({
                          value: m.id_machine_registered,
                          label: `[${m.id_machine_registered}] ${m.designation}`,
                          badge: m.id_zone_default
                        }))
                      ]}
                      placeholder="-- Non spécifiée / Atelier --"
                    />
                  </div>
                </div>

                {/* Technicien */}
                <div>
                  <label className="text-[10.5px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                    Technicien Intervenant
                  </label>
                  <CustomSelect
                    value={form.technicien}
                    onChange={(val) => setForm({ ...form, technicien: val })}
                    options={(availableTechs.length > 0 ? availableTechs : technicians).map((t) => ({
                      value: t.nom,
                      label: `${t.id_technician} - ${t.nom}`,
                      badge: t.id_zone,
                      sublabel: t.specialite
                    }))}
                    placeholder="-- Sélectionner Technicien --"
                  />
                </div>

                {/* Gamme d'Opération / Superviseur */}
                <div>
                  <label className="text-[10.5px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                    Gamme d'Opération / Superviseur (Optionnel)
                  </label>
                  <CustomSelect
                    value={form.operation}
                    onChange={(val) => setForm({ ...form, operation: val })}
                    options={[
                      { value: '', label: '-- Aucune Gamme Spécifique --' },
                      ...chefsList.map((op) => ({
                        group: "👑 Chefs d'Équipe (Supervision)",
                        value: op.nom,
                        label: `[${op.id_operation}] ${op.nom}`,
                        badge: op.id_zone
                      })),
                      ...operatorsList.map((op) => ({
                        group: '🔧 Gammes Opérateurs',
                        value: op.nom,
                        label: `[${op.id_operation}] ${op.nom}`,
                        badge: op.id_zone
                      }))
                    ]}
                    placeholder="-- Aucune Gamme Spécifique --"
                  />
                </div>
              </div>
            )}

            {/* CASE 5: SORTIE -> AMELIORATIVE CARD (Machine + Tech + Zone + Gamme Opérateur/Chef) */}
            {form.type === 'Sortie' && form.action_id === 'AMELIORATIVE' && (
              <div className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-200 space-y-3">
                <div className="flex items-center gap-2 border-b border-purple-200/60 pb-2">
                  <ChevronsUp className="w-4 h-4 text-purple-700" />
                  <span className="font-bold text-xs text-purple-950">
                    Gouvernance Améliorative (Rétrofit & Amélioration)
                  </span>
                </div>

                {/* Zone & Machine side by side */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10.5px] font-bold text-purple-900 uppercase tracking-wider block mb-1">
                      Zone
                    </label>
                    <CustomSelect
                      value={form.id_zone}
                      onChange={(val) => setForm({ ...form, id_zone: val })}
                      options={zones.map((z) => ({
                        value: z.id_zone,
                        label: `${z.libelle} (${z.id_zone})`
                      }))}
                      placeholder="-- Zone --"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-purple-900 uppercase tracking-wider block mb-1">
                      Machine Concernée
                    </label>
                    <CustomSelect
                      value={form.id_machine_registered}
                      onChange={(val) => setForm({ ...form, id_machine_registered: val })}
                      options={[
                        { value: '', label: '-- Non spécifiée / Rétrofit Général --' },
                        ...(availableMachines.length > 0 ? availableMachines : machines).map((m) => ({
                          value: m.id_machine_registered,
                          label: `[${m.id_machine_registered}] ${m.designation}`,
                          badge: m.id_zone_default
                        }))
                      ]}
                      placeholder="-- Non spécifiée / Rétrofit Général --"
                    />
                  </div>
                </div>

                {/* Technicien */}
                <div>
                  <label className="text-[10.5px] font-bold text-purple-900 uppercase tracking-wider block mb-1">
                    Technicien Intervenant
                  </label>
                  <CustomSelect
                    value={form.technicien}
                    onChange={(val) => setForm({ ...form, technicien: val })}
                    options={(availableTechs.length > 0 ? availableTechs : technicians).map((t) => ({
                      value: t.nom,
                      label: `${t.id_technician} - ${t.nom}`,
                      badge: t.id_zone,
                      sublabel: t.specialite
                    }))}
                    placeholder="-- Sélectionner Technicien --"
                  />
                </div>

                {/* Gamme d'Opération / Superviseur */}
                <div>
                  <label className="text-[10.5px] font-bold text-purple-900 uppercase tracking-wider block mb-1">
                    Gamme de Rétrofit / Superviseur (Optionnel)
                  </label>
                  <CustomSelect
                    value={form.operation}
                    onChange={(val) => setForm({ ...form, operation: val })}
                    options={[
                      { value: '', label: '-- Aucune Gamme Spécifique --' },
                      ...chefsList.map((op) => ({
                        group: "👑 Chefs d'Équipe (Supervision)",
                        value: op.nom,
                        label: `[${op.id_operation}] ${op.nom}`,
                        badge: op.id_zone
                      })),
                      ...operatorsList.map((op) => ({
                        group: '🔧 Gammes Opérateurs',
                        value: op.nom,
                        label: `[${op.id_operation}] ${op.nom}`,
                        badge: op.id_zone
                      }))
                    ]}
                    placeholder="-- Aucune Gamme Spécifique --"
                  />
                </div>
              </div>
            )}

            {/* Commentaire / Motif */}
            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Commentaire / Motif / Observation
              </label>
              <input
                type="text"
                placeholder="Raison du mouvement, numéro de bon physique..."
                value={form.commentaire}
                onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              />
            </div>

            <button
              type="submit"
              className={`w-full h-11 rounded-xl font-bold text-xs text-white transition shadow-sm flex items-center justify-center gap-2 ${
                form.type === 'Sortie'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                Valider {form.type} ({form.quantite} unité{form.quantite > 1 ? 's' : ''}) • Bon-{form.bon_number || '001'}
              </span>
            </button>
          </form>
        </div>

        {/* Movements History Table (7 columns on wide screen) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Table Header & Interactive Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <SortieEntreeIcon className="w-4 h-4 shrink-0" strokeWidth={2.25} />
                <span>Historique des Mouvements ({displayedMouvements.length} / {mouvements.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500">Traçabilité complète des sorties et réapprovisionnements</p>
            </div>

            {/* Table Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Type Filter Buttons */}
              <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTableFilterType('ALL')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    tableFilterType === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
                  }`}
                >
                  Tous
                </button>
                <button
                  type="button"
                  onClick={() => setTableFilterType('Sortie')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    tableFilterType === 'Sortie' ? 'bg-rose-600 text-white shadow-2xs font-bold' : 'text-slate-500'
                  }`}
                >
                  Sorties
                </button>
                <button
                  type="button"
                  onClick={() => setTableFilterType('Entrée')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    tableFilterType === 'Entrée' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'text-slate-500'
                  }`}
                >
                  Entrées
                </button>
              </div>

              {/* Quick Search */}
              <div className="relative flex-1 sm:w-44">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Recherche bon, ref..."
                  value={tableSearchText}
                  onChange={(e) => setTableSearchText(e.target.value)}
                  className="w-full h-8 pl-8 pr-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="max-h-[66vh] overflow-y-auto overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                <thead className="sticky top-0 bg-slate-100 text-[10.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 z-10">
                  <tr>
                    <th className="py-3 px-3">Bon # / Date</th>
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-3">Action ID</th>
                    <th className="py-3 px-3">Réf & Article</th>
                    <th className="py-3 px-2 text-right">Qté</th>
                    <th className="py-3 px-3">Machine / Zone / Emplacement</th>
                    <th className="py-3 px-3">Intervenant / Demandeur</th>
                    <th className="py-3 px-3">Motif / Commentaire</th>
                    <th className="py-3 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedMouvements.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-xs text-slate-400 font-medium">
                        Aucun mouvement correspondant aux critères.
                      </td>
                    </tr>
                  ) : (
                    displayedMouvements.map((m, idx) => {
                      const art = stockItems.find((s) => s.ref === m.ref);
                      const isChef = String(m.operation).toUpperCase().includes('CHEF') ||
                        operations.some((op) => (op.nom === m.operation || op.id_operation === m.operation) && (op.type_profil === 'CHEF' || String(op.id_operation).startsWith('CHEF')));

                      return (
                        <tr key={m.id || `mvt-${idx}`} className="even:bg-slate-50/50 odd:bg-white hover:bg-indigo-50/30 transition">
                          {/* Bon # & Date */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-mono font-bold text-indigo-950 text-[11px] flex items-center gap-1">
                              <Hash className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>{m.code_bon || `Bon-${String(idx + 1).padStart(3, '0')}`}</span>
                            </div>
                            <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                              {m.date}
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                m.type === 'Sortie'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {m.type}
                            </span>
                          </td>

                          {/* Action ID */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                              m.action_id === 'CORRECTIVE'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : m.action_id === 'PREVENTIVE'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : m.action_id === 'AMELIORATIVE'
                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                : m.action_id === 'USAGE'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : m.action_id === 'REAPPRO'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {m.action_id || (m.type === 'Sortie' ? 'CORRECTIVE' : 'REAPPRO')}
                            </span>
                          </td>

                          {/* Ref & Article */}
                          <td className="py-2.5 px-3">
                            <div className="font-mono font-bold text-slate-900">{m.ref}</div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[130px]">
                              {art ? art.designation : m.designation || ''}
                            </div>
                          </td>

                          {/* Qte */}
                          <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900 text-xs">
                            <span className={m.type === 'Sortie' ? 'text-rose-600' : 'text-emerald-600'}>
                              {m.type === 'Sortie' ? `-${m.quantite}` : `+${m.quantite}`}
                            </span>
                          </td>

                          {/* Machine / Zone / Warehouse Location */}
                          <td className="py-2.5 px-3 whitespace-nowrap text-[11px]">
                            {m.type === 'Entrée' ? (
                              <div>
                                <div className="font-mono font-semibold text-emerald-800 flex items-center gap-1">
                                  <Warehouse className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>{m.emplacement_reception || art?.emplacement || 'Magasin'}</span>
                                </div>
                                {m.fournisseur && (
                                  <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                    {m.fournisseur}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div className="font-mono font-semibold text-slate-800">
                                  {m.id_machine_registered ? (
                                    <span className="flex items-center gap-1">
                                      <Cpu className="w-3 h-3 text-indigo-600 shrink-0" />
                                      <span>{m.id_machine_registered}</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic">Sans Machine</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-purple-700 flex items-center gap-0.5 mt-0.5">
                                  <MapPin className="w-2.5 h-2.5 text-purple-500 shrink-0" />
                                  <span>{m.id_zone || '-'}</span>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Intervenant / Chef / Tech */}
                          <td className="py-2.5 px-3 whitespace-nowrap text-[11px]">
                            {m.technicien && (
                              <div className="text-slate-800 font-medium flex items-center gap-1">
                                <Users className="w-3 h-3 text-blue-600 shrink-0" />
                                <span>{m.technicien}</span>
                              </div>
                            )}
                            {m.operation && (
                              <div className="mt-0.5">
                                {isChef ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200 font-semibold text-[10px]">
                                    <Crown className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                    <span className="truncate max-w-[110px]">{m.operation}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-slate-600 text-[10.5px]">
                                    <UserCheck className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                    <span className="truncate max-w-[110px]">{m.operation}</span>
                                  </span>
                                )}
                              </div>
                            )}
                            {!m.technicien && !m.operation && (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Motif / Commentaire */}
                          <td className="py-2.5 px-3 text-slate-500 truncate max-w-[120px] text-[11px]">
                            {m.commentaire || '-'}
                          </td>

                          {/* Action */}
                          <td className="py-2.5 px-2 text-center">
                            <button
                              onClick={() => onDeleteMouvement(m.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition rounded-md hover:bg-rose-50"
                              title="Supprimer ce mouvement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ADVANCED ARTICLE SEARCH MODAL WITH REAL-TIME FILTERING & MATCH HIGHLIGHTING */}
      {isArticleSearchOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Recherche & Sélection d'Article</h3>
                  <p className="text-xs text-slate-500">Recherche instantanée par Référence, Désignation, Type ou Emplacement</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsArticleSearchOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input and Type Filter Pills */}
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tapez des lettres ou chiffres (ex: 6204, ROULEMENT, R1, Foret...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-indigo-200 bg-indigo-50/20 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Effacer
                  </button>
                )}
              </div>

              {/* Type Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <span className="text-slate-400 font-bold text-[10px] uppercase shrink-0">Filtrer par Type :</span>
                <button
                  type="button"
                  onClick={() => setFilterType('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition shrink-0 font-semibold ${
                    filterType === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tous ({stockItems.length})
                </button>
                {articleTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1 rounded-lg transition shrink-0 font-semibold ${
                      filterType === t
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Results List */}
            <div className="p-4 flex-1 overflow-y-auto max-h-[50vh] space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Articles trouvés ({filteredArticles.length})
              </div>

              {filteredArticles.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Package className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">Aucun article ne correspond à "{searchQuery}"</p>
                  <button
                    type="button"
                    onClick={onOpenAddArticle}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    + Créer un nouvel article
                  </button>
                </div>
              ) : (
                filteredArticles.map((art) => {
                  const isSelected = form.ref === art.ref;
                  return (
                    <div
                      key={art.ref}
                      onClick={() => handleSelectArticle(art)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-indigo-950">
                            {highlightMatch(art.ref, searchQuery)}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                            {highlightMatch(art.id_type || 'Type', searchQuery)}
                          </span>
                          {art.stockActuel <= 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                              Rupture
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-700 font-medium">
                          {highlightMatch(art.designation, searchQuery)}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>Emplacement : <b className="font-mono text-slate-600">{highlightMatch(art.emplacement || 'R1-B01', searchQuery)}</b></span>
                          <span>•</span>
                          <span>Seuil Alerte : <b className="font-mono text-slate-600">{art.seuil || 5}</b></span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-400">Stock Actuel</div>
                        <div className={`font-mono font-bold text-sm ${art.stockActuel <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {art.stockActuel}
                        </div>
                        <button
                          type="button"
                          className="mt-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition"
                        >
                          Sélectionner
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Cliquez sur un article pour l'insérer directement dans le formulaire
              </span>
              <button
                type="button"
                onClick={() => setIsArticleSearchOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
