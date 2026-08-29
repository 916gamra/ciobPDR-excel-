import React, { useState } from 'react';
import { Wrench, Plus, Search, MapPin, Sparkles, ArrowRight } from 'lucide-react';

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
  const [showAddModal, setShowAddModal] = useState(false);

  // Auto ID Calculation: OP-01, OP-02...
  const nextOpId = () => {
    const nums = operations
      .map((op) => {
        const m = op.id_operation.match(/OP-(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `OP-${String(max + 1).padStart(2, '0')}`;
  };

  const [form, setForm] = useState({
    nom: '',
    id_zone: zones[0]?.id_zone || ''
  });

  const filtered = operations.filter((op) => {
    if (opZoneFilter !== 'ALL' && op.id_zone !== opZoneFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      op.id_operation.toLowerCase().includes(q) ||
      op.nom.toLowerCase().includes(q) ||
      op.id_zone.toLowerCase().includes(q)
    );
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nom || !form.id_zone) return;
    const autoId = nextOpId();
    onAddOperation({
      id_operation: autoId,
      nom: form.nom,
      id_zone: form.id_zone
    });
    setForm({ nom: '', id_zone: zones[0]?.id_zone || '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
            <Wrench className="w-4 h-4" />
            <span>Niveau 2 Équipes (Auto-Généré) • Répertoire des Tâches</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Opérations & Gammes d'Intervention
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Génération automatique du code (<b className="text-indigo-600">OP-01, OP-02...</b>) rattaché à une zone spécifique.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({ nom: '', id_zone: zones[0]?.id_zone || '' });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-400 text-slate-950 hover:bg-indigo-300 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nouvelle Opération</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une opération (ID, nom)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <select
            value={opZoneFilter}
            onChange={(e) => setOpZoneFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
          >
            <option value="ALL">Toutes les Zones ({zones.length})</option>
            {zones.map((z) => (
              <option key={z.id_zone} value={z.id_zone}>
                {z.libelle} ({z.id_zone})
              </option>
            ))}
          </select>

          {opZoneFilter !== 'ALL' && (
            <button
              onClick={() => setOpZoneFilter('ALL')}
              className="text-xs text-slate-500 hover:text-slate-900 underline font-medium"
            >
              Effacer filtre
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total : <b className="text-slate-900">{filtered.length}</b> opérations
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-[10.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">ID Auto</th>
              <th className="py-3 px-4">Intitulé de l'Opération</th>
              <th className="py-3 px-4">Zone d'Exécution (Liaison)</th>
              <th className="py-3 px-4 text-right">Nb Sorties Associées</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((op) => {
              const zn = zones.find((z) => z.id_zone === op.id_zone);
              const sortiesCount = mouvements.filter(
                (m) => m.operation === op.nom || m.operation === op.id_operation
              ).length;

              return (
                <tr key={op.id_operation} className="even:bg-slate-50/50 odd:bg-white hover:bg-slate-100/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                      {op.id_operation}
                    </span>
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
                    {sortiesCount} mouvements
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
            <h3 className="font-bold text-base text-slate-900 mb-1">+ Nouvelle Opération</h3>
            <p className="text-xs text-slate-500 mb-4">L'identifiant est généré automatiquement par le système.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ID Opération (Auto-Généré)</label>
                <div className="mt-1 h-10 px-3 rounded-xl border border-indigo-200 bg-indigo-50/50 flex items-center gap-2 font-mono font-bold text-xs text-indigo-800">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{nextOpId()}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Intitulé de l'Opération</label>
                <input
                  type="text"
                  placeholder="ex: Remplacement Courroie Principale..."
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Zone d'Exécution (Liaison)</label>
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
                <select
                  value={form.id_zone}
                  onChange={(e) => setForm({ ...form, id_zone: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                  required
                >
                  {zones.map((z) => (
                    <option key={z.id_zone} value={z.id_zone}>
                      {z.libelle} ({z.id_zone})
                    </option>
                  ))}
                </select>
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
