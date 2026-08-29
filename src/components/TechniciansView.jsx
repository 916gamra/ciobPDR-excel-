import React, { useState } from 'react';
import CustomSelect from './CustomSelect';
import { Users, Plus, Search, MapPin, Sparkles, ArrowRight } from 'lucide-react';

export default function TechniciansView({
  technicians,
  zones,
  mouvements,
  techZoneFilter,
  setTechZoneFilter,
  onAddTechnician,
  onOpenAddZoneModal,
  onNavigateToZoneFiltered
}) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Auto ID Calculation: TECH-01, TECH-02...
  const nextTechId = () => {
    const nums = technicians
      .map((t) => {
        const m = t.id_technician.match(/TECH-(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `TECH-${String(max + 1).padStart(2, '0')}`;
  };

  const [form, setForm] = useState({
    nom: '',
    id_zone: zones[0]?.id_zone || '',
    specialite: ''
  });

  const filtered = technicians.filter((t) => {
    if (techZoneFilter !== 'ALL' && t.id_zone !== techZoneFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.id_technician.toLowerCase().includes(q) ||
      t.nom.toLowerCase().includes(q) ||
      t.id_zone.toLowerCase().includes(q) ||
      (t.specialite && t.specialite.toLowerCase().includes(q))
    );
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nom || !form.id_zone) return;
    const autoId = nextTechId();
    onAddTechnician({
      id_technician: autoId,
      nom: form.nom,
      id_zone: form.id_zone,
      specialite: form.specialite || 'Maintenance Générale'
    });
    setForm({ nom: '', id_zone: zones[0]?.id_zone || '', specialite: '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="w-5 h-5 text-blue-600 shrink-0" />
            <span>Techniciens de Maintenance</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Génération automatique du matricule (<b className="text-blue-600">TECH-01, TECH-02...</b>) sans risque d'erreur de saisie manuelle.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({ nom: '', id_zone: zones[0]?.id_zone || '', specialite: '' });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-black transition shadow-xs flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouveau Technicien</span>
        </button>
      </div>

      {/* Excel Formula Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule B (Auto-ID Matricule)</div>
            <div className="text-[11px] font-mono font-semibold text-blue-700 mt-0.5">
              ="TECH-" & TEXT(ROW()-3, "00")
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700">Formule B</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule D (Zone Principale)</div>
            <div className="text-[11px] font-mono font-semibold text-purple-700 mt-0.5">
              =[@id_zone] → Zone!B:B
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700">Liaison D</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule F (Interventions / Sorties)</div>
            <div className="text-[11px] font-mono font-semibold text-emerald-700 mt-0.5">
              =COUNTIF(Mvt[Technicien], [@nom])
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Calcul F</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un technicien (ID, nom, spécialité)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div className="w-52">
            <CustomSelect
              value={techZoneFilter}
              onChange={(val) => setTechZoneFilter(val)}
              options={[
                { value: 'ALL', label: `Toutes les Zones (D) (${zones.length})` },
                ...zones.map((z) => ({
                  value: z.id_zone,
                  label: `[D] ${z.libelle} (${z.id_zone})`
                }))
              ]}
            />
          </div>

          {techZoneFilter !== 'ALL' && (
            <button
              onClick={() => setTechZoneFilter('ALL')}
              className="text-xs text-slate-500 hover:text-slate-900 underline font-medium"
            >
              Effacer filtre
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total : <b className="text-slate-900">{filtered.length}</b> techniciens
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Top Info Header Bar inside Card */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50/50 gap-2">
          <div className="font-bold text-slate-800 text-[13px]">
            Technicians • Ordre Excel Row 3 : B→F
          </div>
          <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
            id_technician | nom | id_zone | specialite | nb_sorties
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50/90 text-[10.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">
                <span>ID TECHNICIEN</span> <span className="text-slate-400 font-normal text-[10px]">(B)</span>
              </th>
              <th className="py-2.5 px-4">
                <span>NOM DU TECHNICIEN</span> <span className="text-slate-400 font-normal text-[10px]">(C) primary</span>
              </th>
              <th className="py-2.5 px-4">
                <span>ZONE PRINCIPALE</span> <span className="text-slate-400 font-normal text-[10px]">(D)</span>
              </th>
              <th className="py-2.5 px-4">
                <span>SPÉCIALITÉ & COMPÉTENCE</span> <span className="text-slate-400 font-normal text-[10px]">(E)</span>
              </th>
              <th className="py-2.5 px-4 text-right">
                <span>NB SORTIES / INTERVENTIONS</span> <span className="text-slate-400 font-normal text-[10px]">(F)</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((t) => {
              const zn = zones.find((z) => z.id_zone === t.id_zone);
              const sortiesCount = mouvements.filter(
                (m) => m.technicien === t.nom || m.technicien === t.id_technician
              ).length;

              return (
                <tr key={t.id_technician} className="even:bg-slate-50/50 odd:bg-white hover:bg-slate-100/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                      {t.id_technician}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 text-[13px]">
                    {t.nom}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToZoneFiltered(t.id_zone)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-xs font-medium hover:bg-purple-100 transition"
                      title="Voir cette Zone"
                    >
                      <MapPin className="w-3 h-3 text-purple-600" />
                      <span>{zn ? zn.libelle : t.id_zone}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {t.specialite || 'Maintenance Générale'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                    {sortiesCount} sorties
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">+ Nouveau Technicien</h3>
            <p className="text-xs text-slate-500 mb-4">L'identifiant est généré automatiquement par le système.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ID Technicien (Auto-Généré)</label>
                <div className="mt-1 h-10 px-3 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center gap-2 font-mono font-bold text-xs text-blue-800">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>{nextTechId()}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Nom & Prénom</label>
                <input
                  type="text"
                  placeholder="ex: Hassan..."
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Zone Affectée (Liaison)</label>
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

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Spécialité</label>
                <input
                  type="text"
                  placeholder="ex: Électromécanique & Automates..."
                  value={form.specialite}
                  onChange={(e) => setForm({ ...form, specialite: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
