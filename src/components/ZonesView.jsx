import React, { useState } from 'react';
import { MapPin, Plus, Search, ArrowRight, Users, Wrench, Cpu } from 'lucide-react';

export default function ZonesView({
  zones,
  technicians,
  operations,
  machines,
  onAddZone,
  onNavigateToTechsByZone,
  onNavigateToOpsByZone,
  onNavigateToMachinesByZone
}) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ id_zone: '', libelle: '' });

  const filtered = zones.filter((z) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return z.id_zone.toLowerCase().includes(q) || z.libelle.toLowerCase().includes(q);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id_zone || !form.libelle) return;
    onAddZone(form);
    setForm({ id_zone: '', libelle: '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-semibold text-xs uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Niveau 1 Équipes • Cartographie des Secteurs & Ateliers</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Zones & Ateliers de Production
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Point de départ du workflow. Cliquez sur <b className="text-blue-600">Nb Techs</b>, <b className="text-indigo-600">Nb Ops</b> ou <b className="text-emerald-600">Nb Machines</b> pour naviguer vers les listes filtrées.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-400 text-slate-950 hover:bg-purple-300 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nouvelle Zone</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une zone (Code, libellé)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total : <b className="text-slate-900">{zones.length}</b> zones
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-[10.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Code Zone</th>
              <th className="py-3 px-4">Libellé Secteur / Atelier</th>
              <th className="py-3 px-4">Techniciens Affectés</th>
              <th className="py-3 px-4">Opérations Définies</th>
              <th className="py-3 px-4">Machines Installées</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((z) => {
              const tCount = technicians.filter((t) => t.id_zone === z.id_zone).length;
              const opCount = operations.filter((op) => op.id_zone === z.id_zone).length;
              const mCount = machines.filter((m) => m.id_zone_default === z.id_zone).length;

              return (
                <tr key={z.id_zone} className="even:bg-slate-50/50 odd:bg-white hover:bg-slate-100/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {z.id_zone}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 text-[13px]">
                    {z.libelle}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToTechsByZone(z.id_zone)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition group shadow-2xs"
                      title="Voir les techniciens de cette zone"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>{tCount} techs</span>
                      <ArrowRight className="w-3 h-3 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToOpsByZone(z.id_zone)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold transition group shadow-2xs"
                      title="Voir les opérations de cette zone"
                    >
                      <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{opCount} ops</span>
                      <ArrowRight className="w-3 h-3 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToMachinesByZone(z.id_zone)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition group shadow-2xs"
                      title="Voir les machines installées dans cette zone"
                    >
                      <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{mCount} machines</span>
                      <ArrowRight className="w-3 h-3 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
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
            <h3 className="font-bold text-base text-slate-900 mb-1">+ Nouvelle Zone / Atelier</h3>
            <p className="text-xs text-slate-500 mb-4">Créez une zone géographique ou un secteur d'usine.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Code Zone (ex: ZONE-FIN)</label>
                <input
                  type="text"
                  placeholder="ZONE-FIN"
                  value={form.id_zone}
                  onChange={(e) => setForm({ ...form, id_zone: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold uppercase"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Libellé Secteur / Atelier</label>
                <input
                  type="text"
                  placeholder="Atelier Finition & Peinture..."
                  value={form.libelle}
                  onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  required
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
