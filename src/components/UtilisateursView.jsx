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
  ClipboardList
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
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState('ALL'); // ALL, TECHNICIEN, OPERATEUR, CHEF
  const [zoneFilter, setZoneFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

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

  return (
    <AnimatedPage>
      <div className="space-y-6">
        {/* Header section with Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
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
            className="w-full lg:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Ajouter un utilisateur
          </button>
        </div>

        {/* Quick KPI stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Membres', val: combinedUsers.length, color: 'text-slate-800 bg-slate-50 border-slate-200' },
            { label: 'Techniciens', val: technicians.length, color: 'text-blue-700 bg-blue-50/50 border-blue-100' },
            { label: 'Opérateurs', val: operations.filter(o => o.type_profil === 'OPERATEUR').length, color: 'text-indigo-700 bg-indigo-50/50 border-indigo-100' },
            { label: 'Chefs d\'équipe', val: operations.filter(o => o.type_profil === 'CHEF').length, color: 'text-emerald-700 bg-emerald-50/50 border-emerald-100' }
          ].map((kpi, idx) => (
            <div key={idx} className={`p-3 border rounded-xl flex flex-col justify-center ${kpi.color}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">{kpi.label}</span>
              <span className="text-lg font-black mt-0.5">{kpi.val}</span>
            </div>
          ))}
        </div>

        {/* Filter and search controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Rechercher par nom, ID, zone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            {/* Profile filter select */}
            <div className="w-full md:w-56 shrink-0">
              <CustomSelect
                label="Profil"
                options={[
                  { value: 'ALL', label: 'Tous les profils' },
                  { value: 'TECHNICIEN', label: 'Technicien' },
                  { value: 'OPERATEUR', label: 'Opérateur' },
                  { value: 'CHEF', label: 'Chef d\'équipe' }
                ]}
                value={profileFilter}
                onChange={setProfileFilter}
              />
            </div>

            {/* Zone Filter */}
            <div className="w-full md:w-56 shrink-0">
              <CustomSelect
                label="Affectation Zone"
                options={[
                  { value: 'ALL', label: 'Toutes les zones' },
                  ...zones.map(z => ({ value: z.id_zone, label: z.libelle }))
                ]}
                value={zoneFilter}
                onChange={setZoneFilter}
              />
            </div>
          </div>
        </div>

        {/* Unified Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-4 cursor-pointer select-none" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1.5">
                      Identifiant
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5 cursor-pointer select-none" onClick={() => handleSort('nom')}>
                    <div className="flex items-center gap-1.5">
                      Nom Complet
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5 cursor-pointer select-none" onClick={() => handleSort('type')}>
                    <div className="flex items-center gap-1.5">
                      Profil & Rôle
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5 cursor-pointer select-none" onClick={() => handleSort('id_zone')}>
                    <div className="flex items-center gap-1.5">
                      Zone d'Affectation
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5">Spécialité / Description</th>
                  <th className="p-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {displayedData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      Aucun membre trouvé correspondant à vos critères de recherche.
                    </td>
                  </tr>
                ) : (
                  displayedData.map((user) => {
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
                      <tr key={user.id} className="hover:bg-slate-50 transition text-slate-700">
                        <td className="p-3.5 pl-4">
                          <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            {user.id}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {user.nom}
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[10px] border px-2 py-0.5 rounded-full ${badgeColor}`}>
                            {profileName}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{zoneObj ? zoneObj.libelle : user.id_zone}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-500 italic max-w-xs truncate" title={user.specialite}>
                          {user.specialite}
                        </td>
                        <td className="p-3.5 text-right pr-4">
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
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Modifier l'utilisateur"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="bg-slate-50/50 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="text-[11px] font-bold text-slate-500 font-mono">
                Affichage de {startIndex + 1} à {Math.min(startIndex + effectivePageSize, totalItems)} sur {totalItems} membres
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold px-3 text-slate-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
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
