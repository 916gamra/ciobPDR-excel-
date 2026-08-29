import React, { useState } from 'react';
import CustomSelect from './CustomSelect';
import {
  Wrench,
  Plus,
  Search,
  MapPin,
  Sparkles,
  Crown,
  UserCheck,
  Shield,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

export default function OperationsView({
  operations,
  zones,
  mouvements,
  opZoneFilter,
  setOpZoneFilter,
  onAddOperation,
  onOpenAddZoneModal,
  onNavigateToZoneFiltered
}) {
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState('ALL'); // 'ALL' | 'CHEF' | 'OPERATEUR'
  const [showAddModal, setShowAddModal] = useState(false);

  // Helper to determine role
  const getOpProfile = (op) => {
    if (op.type_profil) return op.type_profil;
    if (String(op.id_operation).toUpperCase().startsWith('CHEF')) return 'CHEF';
    return 'OPERATEUR';
  };

  // Dynamic Auto ID Calculation: OP-01, OP-02... OR CHEF-01, CHEF-02...
  const nextOpId = (profil = 'OPERATEUR') => {
    if (profil === 'CHEF') {
      const nums = operations
        .filter((op) => getOpProfile(op) === 'CHEF')
        .map((op) => {
          const m = String(op.id_operation).match(/CHEF-(\d+)/i);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const max = nums.length > 0 ? Math.max(...nums) : 0;
      return `CHEF-${String(max + 1).padStart(2, '0')}`;
    } else {
      const nums = operations
        .filter((op) => getOpProfile(op) === 'OPERATEUR')
        .map((op) => {
          const m = String(op.id_operation).match(/OP-(\d+)/i);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const max = nums.length > 0 ? Math.max(...nums) : 0;
      return `OP-${String(max + 1).padStart(2, '0')}`;
    }
  };

  const [form, setForm] = useState({
    type_profil: 'OPERATEUR', // 'OPERATEUR' | 'CHEF'
    nom: '',
    id_zone: zones[0]?.id_zone || ''
  });

  // Filtered List
  const filtered = operations.filter((op) => {
    const prof = getOpProfile(op);
    if (profileFilter !== 'ALL' && prof !== profileFilter) return false;
    if (opZoneFilter !== 'ALL' && op.id_zone !== opZoneFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(op.id_operation).toLowerCase().includes(q) ||
      String(op.nom).toLowerCase().includes(q) ||
      String(op.id_zone).toLowerCase().includes(q) ||
      prof.toLowerCase().includes(q)
    );
  });

  // Counts
  const countChefs = operations.filter((op) => getOpProfile(op) === 'CHEF').length;
  const countOperateurs = operations.filter((op) => getOpProfile(op) === 'OPERATEUR').length;
  const totalSorties = operations.reduce((acc, op) => {
    const sorties = mouvements.filter(
      (m) => m.operation === op.nom || m.operation === op.id_operation
    ).length;
    return acc + sorties;
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nom || !form.id_zone) return;
    const autoId = nextOpId(form.type_profil);
    onAddOperation({
      id_operation: autoId,
      nom: form.nom,
      id_zone: form.id_zone,
      type_profil: form.type_profil
    });
    setForm({
      type_profil: 'OPERATEUR',
      nom: '',
      id_zone: zones[0]?.id_zone || ''
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <Wrench className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>Opérations & Chefs d'Équipe (Répertoire & Rôles)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Génération automatique double : <b className="text-indigo-600 font-mono">OP-01, OP-02...</b> pour les opérateurs et <b className="text-amber-700 font-mono">CHEF-01, CHEF-02...</b> pour les chefs d'équipe.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setForm({ type_profil: 'OPERATEUR', nom: '', id_zone: zones[0]?.id_zone || '' });
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-black transition shadow-xs flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvelle Opération / Chef</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Répertoire</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{operations.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Tâches & Superviseurs</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>Chefs d'Équipe</span>
          </div>
          <div className="text-xl font-bold text-amber-900 mt-1">{countChefs}</div>
          <div className="text-[11px] font-mono font-semibold text-amber-700 mt-0.5">Codes CHEF-xx</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-200/80 bg-indigo-50/20 shadow-xs">
          <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Opérateurs & Gammes</span>
          </div>
          <div className="text-xl font-bold text-indigo-900 mt-1">{countOperateurs}</div>
          <div className="text-[11px] font-mono font-semibold text-indigo-700 mt-0.5">Codes OP-xx</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Sorties Associées</div>
          <div className="text-xl font-bold text-emerald-900 mt-1">{totalSorties}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Traçabilité Mouvements</div>
        </div>
      </div>

      {/* Excel Formula Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule Auto-ID Opérateur</div>
            <div className="text-[11px] font-mono font-semibold text-indigo-700 mt-0.5">
              ="OP-" & TEXT(COUNTIF(Op[Type],"OPERATEUR")+1, "00")
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">OP-xx</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule Auto-ID Chef</div>
            <div className="text-[11px] font-mono font-semibold text-amber-700 mt-0.5">
              ="CHEF-" & TEXT(COUNTIF(Op[Type],"CHEF")+1, "00")
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800">CHEF-xx</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule Classification Rôle</div>
            <div className="text-[11px] font-mono font-semibold text-purple-700 mt-0.5">
              =IF(ISNUMBER(SEARCH("CHEF",[@id_operation])),"CHEF","OPERATEUR")
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700">Rôle</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule E (Sorties & Traçabilité)</div>
            <div className="text-[11px] font-mono font-semibold text-emerald-700 mt-0.5">
              =COUNTIF(Mvt[Opération], [@nom])
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Calcul E</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px] flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher (ID, nom, zone, chef/opérateur)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setProfileFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                profileFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous ({operations.length})
            </button>
            <button
              onClick={() => setProfileFilter('CHEF')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
                profileFilter === 'CHEF'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              <Crown className="w-3 h-3" />
              <span>Chefs ({countChefs})</span>
            </button>
            <button
              onClick={() => setProfileFilter('OPERATEUR')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
                profileFilter === 'OPERATEUR'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 hover:text-indigo-900'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Opérateurs ({countOperateurs})</span>
            </button>
          </div>

          {/* Zone Filter */}
          <div className="w-52">
            <CustomSelect
              value={opZoneFilter}
              onChange={(val) => setOpZoneFilter(val)}
              options={[
                { value: 'ALL', label: `Toutes les Zones (D) (${zones.length})` },
                ...zones.map((z) => ({
                  value: z.id_zone,
                  label: `[D] ${z.libelle} (${z.id_zone})`
                }))
              ]}
            />
          </div>

          {(opZoneFilter !== 'ALL' || profileFilter !== 'ALL' || search) && (
            <button
              onClick={() => {
                setOpZoneFilter('ALL');
                setProfileFilter('ALL');
                setSearch('');
              }}
              className="text-xs text-slate-500 hover:text-slate-900 underline font-medium"
            >
              Réinitialiser filtres
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Affichage : <b className="text-slate-900">{filtered.length}</b> sur {operations.length}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Top Info Header Bar inside Card */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50/50 gap-2">
          <div className="font-bold text-slate-800 text-[13px] flex items-center gap-2">
            <span>Operations & Chefs • Ordre Excel Row 3 : B→E</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
            id_operation | type_profil | nom | id_zone | nb_sorties
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead className="bg-slate-50/90 text-[10.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">
                  <span>ID CODE</span> <span className="text-slate-400 font-normal text-[10px]">(B)</span>
                </th>
                <th className="py-2.5 px-4">
                  <span>PROFIL & RÔLE</span>
                </th>
                <th className="py-2.5 px-4">
                  <span>INTITULÉ DE L'OPÉRATION / RESPONSABLE</span> <span className="text-slate-400 font-normal text-[10px]">(C)</span>
                </th>
                <th className="py-2.5 px-4">
                  <span>ZONE D'EXÉCUTION</span> <span className="text-slate-400 font-normal text-[10px]">(D)</span>
                </th>
                <th className="py-2.5 px-4 text-right">
                  <span>NB SORTIES ASSOCIÉES</span> <span className="text-slate-400 font-normal text-[10px]">(E)</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400 font-medium">
                    Aucune opération ou chef ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filtered.map((op) => {
                  const prof = getOpProfile(op);
                  const isChef = prof === 'CHEF';
                  const zn = zones.find((z) => z.id_zone === op.id_zone);
                  const sortiesCount = mouvements.filter(
                    (m) => m.operation === op.nom || m.operation === op.id_operation
                  ).length;

                  return (
                    <tr
                      key={op.id_operation}
                      className="even:bg-slate-50/50 odd:bg-white hover:bg-slate-100/60 transition"
                    >
                      <td className="py-3 px-4 font-mono font-bold">
                        {isChef ? (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 inline-flex items-center gap-1.5 shadow-2xs font-mono font-bold text-xs">
                            <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{op.id_operation}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1.5 shadow-2xs font-mono font-bold text-xs">
                            <Wrench className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>{op.id_operation}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isChef ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 font-semibold text-[11px] border border-amber-200 inline-flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-700 shrink-0" />
                            <span>Chef d'Équipe</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200 inline-flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>Opérateur</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900 text-[13px]">
                        {op.nom}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => onNavigateToZoneFiltered(op.id_zone)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-xs font-medium hover:bg-purple-100 transition"
                          title="Voir cette Zone"
                        >
                          <MapPin className="w-3 h-3 text-purple-600" />
                          <span>{zn ? zn.libelle : op.id_zone}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                        <span className={`px-2 py-0.5 rounded-md text-xs ${sortiesCount > 0 ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-400'}`}>
                          {sortiesCount} flux
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              + Nouvelle Entrée : Opération ou Chef
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Sélectionnez le type de profil pour générer l'identifiant normalisé adéquat.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Selection Radio Cards */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Type de Profil (Rôle)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type_profil: 'OPERATEUR' })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      form.type_profil === 'OPERATEUR'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Opérateur</span>
                      </span>
                      {form.type_profil === 'OPERATEUR' && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      Génère: <b>OP-xx</b>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type_profil: 'CHEF' })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      form.type_profil === 'CHEF'
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-600" />
                        <span>Chef d'Équipe</span>
                      </span>
                      {form.type_profil === 'CHEF' && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      Génère: <b>CHEF-xx</b>
                    </div>
                  </button>
                </div>
              </div>

              {/* Auto ID Display */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  ID Généré ({form.type_profil === 'CHEF' ? 'Chef' : 'Opérateur'})
                </label>
                <div
                  className={`mt-1 h-10 px-3 rounded-xl border flex items-center justify-between font-mono font-bold text-xs ${
                    form.type_profil === 'CHEF'
                      ? 'border-amber-300 bg-amber-50 text-amber-900'
                      : 'border-indigo-200 bg-indigo-50 text-indigo-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className={`w-3.5 h-3.5 ${
                        form.type_profil === 'CHEF' ? 'text-amber-600' : 'text-indigo-600'
                      }`}
                    />
                    <span>{nextOpId(form.type_profil)}</span>
                  </div>
                  <span className="text-[10px] font-sans font-semibold text-slate-400">
                    Auto-incrémentation
                  </span>
                </div>
              </div>

              {/* Intitule */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {form.type_profil === 'CHEF'
                    ? "Intitulé du Rôle / Nom du Chef"
                    : "Intitulé de l'Opération / Tâche"}
                </label>
                <input
                  type="text"
                  placeholder={
                    form.type_profil === 'CHEF'
                      ? 'ex: Chef d\'Équipe Lignes & Extrusion'
                      : 'ex: Remplacement Courroie Principale...'
                  }
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  required
                />
              </div>

              {/* Zone */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Zone d'Affectation / Exécution
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      onOpenAddZoneModal();
                    }}
                    className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold inline-flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Créer Zone</span>
                  </button>
                </div>
                <CustomSelect
                  value={form.id_zone}
                  onChange={(val) => setForm({ ...form, id_zone: val })}
                  options={zones.map((z) => ({
                    value: z.id_zone,
                    label: `${z.libelle} (${z.id_zone})`
                  }))}
                  placeholder="-- Sélectionner une Zone --"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold"
                >
                  Enregistrer {form.type_profil === 'CHEF' ? 'Chef' : 'Opération'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
