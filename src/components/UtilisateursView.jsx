import React, { useState, useRef, useMemo, useEffect } from 'react';
import AnimatedPage from './AnimatedPage';
import CustomSelect from './CustomSelect';
import {
  Users,
  Plus,
  Search,
  MapPin,
  Trash2,
  Edit2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  Sparkles,
  ClipboardList,
  Wrench,
  ArrowDown,
  ArrowUp
} from 'lucide-react';

export default function UtilisateursView({
  technicians,
  operations,
  zones,
  mouvements,
  onAddTechnician,
  onUpdateTechnician,
  onDeleteTechnician,
  onAddOperation,
  onUpdateOperation,
  onDeleteOperation,
  onOpenAddZoneModal
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(localSearch);
    }, 200);
    return () => clearTimeout(handler);
  }, [localSearch]);

  const [profileFilter, setProfileFilter] = useState('ALL'); // ALL, TECHNICIEN, OPERATEUR, CHEF
  const [zoneFilter, setZoneFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-calculation of next ID respecting order
  const getNextId = (type) => {
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

  // Form for Add/Edit
  const [form, setForm] = useState({
    type: 'TECHNICIEN', // TECHNICIEN, OPERATEUR, CHEF
    nom: '',
    id_zone: zones[0]?.id_zone || '',
    specialite: '' // used for Technicien
  });

  // Calculate combined users list
  const combinedUsers = useMemo(() => {
    const list = [];
    
    // Add technicians
    technicians.forEach((t) => {
      list.push({
        id: t.id_technician,
        nom: t.nom,
        id_zone: t.id_zone,
        type: 'TECHNICIEN',
        specialite: t.specialite || 'Spécialité Maintenance'
      });
    });

    // Add operations
    operations.forEach((o) => {
      list.push({
        id: o.id_operation,
        nom: o.nom,
        id_zone: o.id_zone,
        type: o.type_profil === 'CHEF' ? 'CHEF' : 'OPERATEUR',
        specialite: o.type_profil === 'CHEF' ? 'Superviseur / Responsable d\'Atelier' : 'Opérateur Ligne de Production'
      });
    });

    return list;
  }, [technicians, operations]);

  // Filters
  const filtered = combinedUsers.filter((u) => {
    if (profileFilter !== 'ALL' && u.type !== profileFilter) return false;
    if (zoneFilter !== 'ALL' && u.id_zone !== zoneFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.id.toLowerCase().includes(q) ||
      u.nom.toLowerCase().includes(q) ||
      u.id_zone.toLowerCase().includes(q) ||
      u.specialite.toLowerCase().includes(q)
    );
  });

  // Pagination & Sorting
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('nom');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    setCurrentPage(1);
  }, [search, profileFilter, zoneFilter, sortField, sortOrder]);

  const sortedData = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortOrder]);

  const totalItems = sortedData.length;
  const totalPages = pageSize === 0 ? 1 : Math.ceil(totalItems / pageSize);
  const effectivePageSize = pageSize === 0 ? totalItems : pageSize;
  const startIndex = (currentPage - 1) * effectivePageSize;
  const displayedData = pageSize === 0 ? sortedData : sortedData.slice(startIndex, startIndex + effectivePageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Submit Handler
  const handleSave = (e) => {
    e.preventDefault();
    if (!form.nom.trim()) return;

    if (userToEdit) {
      // Edit mode
      const isTech = userToEdit.id.startsWith('TECH-');
      if (isTech) {
        onUpdateTechnician(userToEdit.id, {
          id_technician: userToEdit.id,
          nom: form.nom,
          id_zone: form.id_zone,
          specialite: form.specialite
        });
      } else {
        onUpdateOperation(userToEdit.id, {
          id_operation: userToEdit.id,
          nom: form.nom,
          id_zone: form.id_zone,
          type_profil: form.type === 'CHEF' ? 'CHEF' : 'OPERATEUR'
        });
      }
      setUserToEdit(null);
    } else {
      // Add mode - Auto calculate ID on submission
      const nextId = getNextId(form.type);
      if (form.type === 'TECHNICIEN') {
        onAddTechnician({
          id_technician: nextId,
          nom: form.nom,
          id_zone: form.id_zone,
          specialite: form.specialite || 'Spécialité Maintenance'
        });
      } else {
        onAddOperation({
          id_operation: nextId,
          nom: form.nom,
          id_zone: form.id_zone,
          type_profil: form.type === 'CHEF' ? 'CHEF' : 'OPERATEUR'
        });
      }
      setShowAddModal(false);
    }

    // Reset Form
    setForm({
      type: 'TECHNICIEN',
      nom: '',
      id_zone: zones[0]?.id_zone || '',
      specialite: ''
    });
  };

  // Delete Handler
  const confirmDelete = () => {
    if (!userToDelete) return;
    const isTech = userToDelete.id.startsWith('TECH-');
    if (isTech) {
      onDeleteTechnician(userToDelete.id);
    } else {
      onDeleteOperation(userToDelete.id);
    }
    setUserToDelete(null);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition shrink-0" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-indigo-700 shrink-0 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-700 shrink-0 font-bold" />
    );
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        {/* Header section with Stats - Wrapped inside elegant card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Users className="w-5 h-5 text-indigo-600 shrink-0" />
              Registre des Utilisateurs & Membres
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Gérez les techniciens de maintenance, les opérateurs de ligne et les chefs d'équipe dans un répertoire unifié.
            </p>
          </div>

          <button
            onClick={() => {
              setForm({
                type: 'TECHNICIEN',
                nom: '',
                id_zone: zones[0]?.id_zone || '',
                specialite: ''
              });
              setUserToEdit(null);
              setShowAddModal(true);
            }}
            className="w-full md:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Ajouter un utilisateur
          </button>
        </div>

        {/* Quick KPI stats bar - Redesigned to be highly polished */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Membres */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Membres</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">{combinedUsers.length}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Membres enregistrés</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Techniciens */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Techniciens (TECH)</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">{technicians.length}</span>
              <span className="text-[10px] text-blue-500 mt-0.5 block">Maintenance & SAV</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Opérateurs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Opérateurs (OP)</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">{operations.filter(o => o.type_profil === 'OPERATEUR').length}</span>
              <span className="text-[10px] text-indigo-500 mt-0.5 block">Ligne de Production</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Chefs d'équipe */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Chefs d'équipe (CHEF)</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">{operations.filter(o => o.type_profil === 'CHEF').length}</span>
              <span className="text-[10px] text-emerald-500 mt-0.5 block">Superviseurs Ligne</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter and search controls - Fully responsive & styled */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Filtres & Tri de Données</span>
            </div>
            {/* Displaying the filtered count */}
            <div className="text-xs font-semibold text-slate-500">
              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold border border-indigo-100">
                {filtered.length} membre{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div className="relative w-full">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Recherche libre
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, ID, zone..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Profile filter select */}
            <div className="w-full">
              <CustomSelect
                label="Role / Profil (Col D)"
                options={[
                  { value: 'ALL', label: 'Tous les Profils (D)' },
                  { value: 'TECHNICIEN', label: '[D] Technicien' },
                  { value: 'OPERATEUR', label: '[D] Opérateur' },
                  { value: 'CHEF', label: '[D] Chef d\'équipe / Responsable' }
                ]}
                value={profileFilter}
                onChange={setProfileFilter}
              />
            </div>

            {/* Zone Filter */}
            <div className="w-full">
              <CustomSelect
                label="Zone d'Affectation (Col E)"
                options={[
                  { value: 'ALL', label: 'Toutes les Zones (E)' },
                  ...zones.map(z => ({ value: z.id_zone, label: `[E] ${z.libelle} (${z.id_zone})` }))
                ]}
                value={zoneFilter}
                onChange={setZoneFilter}
              />
            </div>

            {/* Sort Dropdown (Tri) like in Templates */}
            <div className="w-full relative" ref={sortMenuRef}>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Tri des enregistrements
              </label>
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className={`w-full h-10 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                  showSortMenu || sortField !== 'nom' || sortOrder !== 'asc'
                    ? 'bg-indigo-50 text-indigo-800 border-indigo-300 ring-1 ring-indigo-200 shadow-2xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Tri : <b className="font-mono text-slate-900">{sortField.toUpperCase()}</b> ({sortOrder === 'asc' ? 'A→Z' : 'Z→A'})</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>

              {showSortMenu && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                      Trier par
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    
                    <button
                      onClick={() => {
                        if (sortField === 'id') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('id');
                          setSortOrder('asc');
                        }
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                        sortField === 'id'
                          ? 'bg-indigo-50 text-indigo-800'
                          : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Identifiant (B)</span>
                      {sortField === 'id' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-600 shrink-0" /> : <ArrowDown className="w-3 h-3 text-indigo-600 shrink-0" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        if (sortField === 'nom') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('nom');
                          setSortOrder('asc');
                        }
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                        sortField === 'nom'
                          ? 'bg-indigo-50 text-indigo-800'
                          : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Nom Complet (C)</span>
                      {sortField === 'nom' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-600 shrink-0" /> : <ArrowDown className="w-3 h-3 text-indigo-600 shrink-0" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        if (sortField === 'type') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('type');
                          setSortOrder('asc');
                        }
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                        sortField === 'type'
                          ? 'bg-indigo-50 text-indigo-800'
                          : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Profil & Rôle (D)</span>
                      {sortField === 'type' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-600 shrink-0" /> : <ArrowDown className="w-3 h-3 text-indigo-600 shrink-0" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (sortField === 'id_zone') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('id_zone');
                          setSortOrder('asc');
                        }
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                        sortField === 'id_zone'
                          ? 'bg-indigo-50 text-indigo-800'
                          : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Zone d'Affectation (E)</span>
                      {sortField === 'id_zone' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-600 shrink-0" /> : <ArrowDown className="w-3 h-3 text-indigo-600 shrink-0" />
                      )}
                    </button>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unified Table in Templates Style */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {/* Top Info Header Bar inside Card */}
          <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50/50 gap-2">
            <div className="font-bold text-slate-800 text-[13px]">
              Répertoire des Membres • Ordre Excel Row 3 : B→F
            </div>
            <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
              id_user (B) | nom (C) | type_profil (D) | id_zone (E) | specialite (F)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-left text-xs whitespace-nowrap border-collapse">
              <thead className="bg-slate-100 text-[10.5px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12 text-slate-500 font-mono text-[10px] bg-slate-200/60 border-r border-slate-200 shrink-0">
                    N°
                  </th>
                  <th
                    onClick={() => handleSort('id')}
                    className="py-2.5 px-4 cursor-pointer select-none hover:bg-slate-200/80 transition group text-left"
                    title="Cliquer pour trier par Identifiant"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>IDENTIFIANT</span> <span className="text-slate-400 font-normal text-[10px] font-mono">(B)</span>
                      {renderSortIcon('id')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('nom')}
                    className="py-2.5 px-4 cursor-pointer select-none hover:bg-slate-200/80 transition group text-left"
                    title="Cliquer pour trier par Nom Complet"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>NOM COMPLET</span> <span className="text-slate-400 font-normal text-[10px] font-mono">(C)</span>
                      {renderSortIcon('nom')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('type')}
                    className="py-2.5 px-4 cursor-pointer select-none hover:bg-slate-200/80 transition group text-left"
                    title="Cliquer pour trier par Profil"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>PROFIL & RÔLE</span> <span className="text-slate-400 font-normal text-[10px] font-mono">(D)</span>
                      {renderSortIcon('type')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('id_zone')}
                    className="py-2.5 px-4 cursor-pointer select-none hover:bg-slate-200/80 transition group text-left"
                    title="Cliquer pour trier par Zone d'Affectation"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>ZONE D'AFFECTATION</span> <span className="text-slate-400 font-normal text-[10px] font-mono">(E)</span>
                      {renderSortIcon('id_zone')}
                    </div>
                  </th>
                  <th className="py-2.5 px-4 text-slate-500 font-bold">
                    <span>SPÉCIALITÉ / DESCRIPTION</span> <span className="text-slate-400 font-normal text-[10px] font-mono">(F)</span>
                  </th>
                  <th className="py-2.5 px-4 text-right pr-4 text-slate-500 font-bold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {displayedData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      Aucun membre trouvé correspondant à vos critères de recherche.
                    </td>
                  </tr>
                ) : (
                  displayedData.map((user, idx) => {
                    const zoneObj = zones.find(z => z.id_zone === user.id_zone);
                    let badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
                    let profileName = 'Technicien';
                    if (user.type === 'OPERATEUR') {
                      badgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
                      profileName = 'Opérateur Ligne';
                    } else if (user.type === 'CHEF') {
                      badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                      profileName = 'Chef d\'Équipe';
                    }

                    return (
                      <tr key={user.id} className="even:bg-slate-50/80 odd:bg-white hover:bg-slate-100/70 border-b border-slate-200/70 transition-colors">
                        {/* Row N° Column */}
                        <td className="py-3 px-3 text-center font-mono text-[11px] font-bold text-slate-400 bg-slate-100/40 border-r border-slate-200/80 shrink-0">
                          {idx + 1 + startIndex}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {user.id}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800 text-[13px]">
                          {user.nom}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[11px] font-bold border px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                            {profileName}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium text-slate-700">{zoneObj ? zoneObj.libelle : user.id_zone}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate" title={user.specialite}>
                          {user.specialite}
                        </td>
                        <td className="py-3 px-4 text-right pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setUserToEdit(user);
                                setForm({
                                  type: user.type,
                                  nom: user.nom,
                                  id_zone: user.id_zone,
                                  specialite: user.specialite === 'Spécialité Maintenance' || user.specialite.includes('Opérateur') || user.specialite.includes('Superviseur') ? '' : user.specialite
                                });
                                setShowAddModal(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                              title="Modifier l'utilisateur"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">Lignes par page :</span>
            <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              {[15, 50, 100, 0].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    pageSize === size
                      ? 'bg-white text-indigo-800 shadow-xs border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  {size === 0 ? 'Tout' : size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs font-semibold text-slate-500">
              Affichage <b className="text-slate-900">{totalItems === 0 ? 0 : startIndex + 1}</b> à <b className="text-slate-900">{Math.min(startIndex + displayedData.length, totalItems)}</b> sur <b className="text-slate-900">{totalItems}</b>
            </div>
            {pageSize !== 0 && totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Précédent
                </button>
                <span className="px-2 font-mono text-xs font-bold text-slate-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition cursor-pointer"
                >
                  Suivant
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Manual Add / Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  {userToEdit ? 'Modifier la Fiche Utilisateur' : 'Enregistrer un nouvel Utilisateur'}
                </h3>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                {/* Mode Select (Enabled ONLY for creation, disabled for editing) */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Type de Profil / Rôle
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'TECHNICIEN', label: 'Technicien' },
                      { key: 'OPERATEUR', label: 'Opérateur' },
                      { key: 'CHEF', label: 'Chef d\'équipe' }
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        disabled={!!userToEdit}
                        onClick={() => setForm({ ...form, type: item.key })}
                        className={`py-2 px-3 text-center text-xs font-bold rounded-xl border transition ${
                          form.type === item.key
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        } disabled:opacity-50`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generated ID Field */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Identifiant Unique (ID)
                  </label>
                  <div className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 flex items-center shadow-2xs">
                    {userToEdit ? userToEdit.id : getNextId(form.type)}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Généré automatiquement selon le profil choisi ({form.type}).
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Nom Complet du Membre
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    placeholder="Ex: Rachid Belkacem"
                    className="w-full h-10 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                {/* Zone Select */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                    <span>Affectation de Zone</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        onOpenAddZoneModal();
                      }}
                      className="text-[10px] text-indigo-600 hover:underline font-bold"
                    >
                      + Nouvelle zone
                    </button>
                  </label>
                  <select
                    value={form.id_zone}
                    onChange={(e) => setForm({ ...form, id_zone: e.target.value })}
                    className="w-full h-10 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  >
                    {zones.map((z) => (
                      <option key={z.id_zone} value={z.id_zone}>
                        {z.libelle}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specialty (Shown ONLY for Technicians) */}
                {form.type === 'TECHNICIEN' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Spécialité Technique
                    </label>
                    <input
                      type="text"
                      value={form.specialite}
                      onChange={(e) => setForm({ ...form, specialite: e.target.value })}
                      placeholder="Ex: Hydraulique & Pneumatique"
                      className="w-full h-10 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer shadow-xs"
                  >
                    {userToEdit ? 'Sauvegarder' : 'Créer l\'utilisateur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-sm font-black text-slate-900">Supprimer l'Utilisateur ?</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Confirmez-vous la suppression de <b>{userToDelete.nom}</b> ? Cette opération supprimera définitivement sa fiche.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
