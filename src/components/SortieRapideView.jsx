import React, { useState } from 'react';
import {
  ArrowDownUp,
  Package,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Cpu,
  Users,
  Wrench,
  FileText
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
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Sortie',
    ref: stockItems[0]?.ref || '',
    quantite: 1,
    action_id: 'CORRECTIVE',
    id_zone: zones[0]?.id_zone || '',
    id_machine_registered: machines[0]?.id_machine_registered || '',
    technicien: technicians[0]?.nom || '',
    operation: operations[0]?.nom || '',
    commentaire: '',
    demandeur: ''
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.ref || form.quantite <= 0) return;

    const newMvt = {
      id: Date.now(),
      date: form.date,
      type: form.type,
      ref: form.ref,
      quantite: Number(form.quantite),
      action_id: form.action_id,
      id_zone: form.id_zone,
      id_machine_registered: form.id_machine_registered,
      technicien: form.technicien,
      operation: form.operation,
      commentaire: form.commentaire,
      demandeur: form.demandeur
    };

    onAddMouvement(newMvt);
    // Reset quantity and comment
    setForm({ ...form, quantite: 1, commentaire: '' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <ArrowDownUp className="w-4 h-4" />
            <span>Formulaire Gouverné • Mouvements & Traçabilité</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Sortie Rapide & Enregistrement de Flux
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chaque sortie ou entrée recalcule instantanément le <b className="text-cyan-600">Stock Actuel</b> et l'état d'alerte des articles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Nouveau Mouvement</span>
            </h3>
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'Sortie' })}
                className={`px-3 py-1 rounded-md transition ${
                  form.type === 'Sortie' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Sortie
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'Entrée' })}
                className={`px-3 py-1 rounded-md transition ${
                  form.type === 'Entrée' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Entrée
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Date */}
            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Date du Mouvement
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                  required
                />
              </div>
            </div>

            {/* Article Select */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Article (Stock)
                </label>
                <button
                  type="button"
                  onClick={onOpenAddArticle}
                  className="text-[10.5px] text-blue-600 hover:text-blue-800 font-semibold"
                >
                  + Créer Article
                </button>
              </div>
              <select
                value={form.ref}
                onChange={(e) => setForm({ ...form, ref: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                required
              >
                {stockItems.map((s, idx) => (
                  <option key={s.id || `${s.ref}-${idx}`} value={s.ref}>
                    [{s.ref}] {s.designation} (Actuel: {s.stockActuel})
                  </option>
                ))}
              </select>

              {/* Selected Article Preview Card */}
              {selectedArticle && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-semibold text-slate-800">{selectedArticle.designation}</div>
                    <div className="text-slate-500">Emplacement : <span className="font-mono font-bold text-slate-700">{selectedArticle.emplacement}</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500">Stock Actuel</div>
                    <div className={`font-mono font-bold text-sm ${selectedArticle.stockActuel <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {selectedArticle.stockActuel}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quantite */}
            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Quantité
              </label>
              <input
                type="number"
                min="1"
                value={form.quantite}
                onChange={(e) => setForm({ ...form, quantite: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold"
                required
              />
            </div>

            {/* Action ID (Gouvernance) */}
            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Type d'Action (Gouvernance)
              </label>
              <select
                value={form.action_id}
                onChange={(e) => setForm({ ...form, action_id: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
              >
                <option value="CORRECTIVE">Maintenance Corrective (Dépannage)</option>
                <option value="PREVENTIVE">Maintenance Préventive Planifiée</option>
                <option value="AMELIORATIVE">Amélioration / Rétrofit</option>
                <option value="REAPPRO">Réapprovisionnement Fournisseur</option>
                <option value="INVENTAIRE">Ajustement Inventaire</option>
              </select>
            </div>

            {/* Zone */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Zone / Atelier
                </label>
                <button
                  type="button"
                  onClick={onOpenAddZone}
                  className="text-[10.5px] text-purple-600 hover:text-purple-800 font-semibold"
                >
                  + Créer Zone
                </button>
              </div>
              <select
                value={form.id_zone}
                onChange={(e) => setForm({ ...form, id_zone: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
              >
                {zones.map((z) => (
                  <option key={z.id_zone} value={z.id_zone}>
                    {z.libelle} ({z.id_zone})
                  </option>
                ))}
              </select>
            </div>

            {/* Machine */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Machine Registered
                </label>
                <button
                  type="button"
                  onClick={onOpenAddMachine}
                  className="text-[10.5px] text-emerald-600 hover:text-emerald-800 font-semibold"
                >
                  + Créer Machine
                </button>
              </div>
              <select
                value={form.id_machine_registered}
                onChange={(e) => setForm({ ...form, id_machine_registered: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
              >
                <option value="">-- Non spécifiée / Atelier --</option>
                {(availableMachines.length > 0 ? availableMachines : machines).map((m) => (
                  <option key={m.id_machine_registered} value={m.id_machine_registered}>
                    [{m.id_machine_registered}] {m.designation}
                  </option>
                ))}
              </select>
            </div>

            {/* Technicien */}
            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Technicien Intervenant
              </label>
              <select
                value={form.technicien}
                onChange={(e) => setForm({ ...form, technicien: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
              >
                <option value="">-- Sélectionner Technicien --</option>
                {(availableTechs.length > 0 ? availableTechs : technicians).map((t) => (
                  <option key={t.id_technician} value={t.nom}>
                    {t.id_technician} - {t.nom} ({t.id_zone})
                  </option>
                ))}
              </select>
            </div>

            {/* Operation */}
            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Opération / Tâche
              </label>
              <select
                value={form.operation}
                onChange={(e) => setForm({ ...form, operation: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
              >
                <option value="">-- Sélectionner Opération --</option>
                {(availableOps.length > 0 ? availableOps : operations).map((op) => (
                  <option key={op.id_operation} value={op.nom}>
                    {op.id_operation} - {op.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Commentaire */}
            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Commentaire / Diagnostic
              </label>
              <input
                type="text"
                placeholder="Raison du changement, état de la pièce..."
                value={form.commentaire}
                onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              />
            </div>

            <button
              type="submit"
              className={`w-full h-10 rounded-xl font-bold text-xs text-slate-800 transition shadow-sm ${
                form.type === 'Sortie'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              Valider {form.type} ({form.quantite} unité{form.quantite > 1 ? 's' : ''})
            </button>
          </form>
        </div>

        {/* Movements History Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ArrowDownUp className="w-4 h-4 text-cyan-600" />
              <span>Historique des Mouvements ({mouvements.length})</span>
            </h3>
            <span className="text-xs text-slate-500">Flux enregistrés en temps réel</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="max-h-[68vh] overflow-y-auto overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead className="sticky top-0 bg-slate-100 text-[10.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 z-10">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Ref & Article</th>
                    <th className="py-3 px-2 text-right">Qté</th>
                    <th className="py-3 px-3">Machine</th>
                    <th className="py-3 px-3">Tech</th>
                    <th className="py-3 px-3">Motif</th>
                    <th className="py-3 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mouvements.map((m, idx) => {
                    const art = stockItems.find((s) => s.ref === m.ref);
                    return (
                      <tr key={m.id || `mvt-${idx}`} className="even:bg-slate-50/50 odd:bg-white hover:bg-slate-100/60 transition">
                        <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {m.date}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
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
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-bold text-slate-900">{m.ref}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                            {art ? art.designation : m.designation || ''}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900 text-xs">
                          {m.type === 'Sortie' ? `-${m.quantite}` : `+${m.quantite}`}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap text-[11px]">
                          {m.id_machine_registered || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap text-[11px]">
                          {m.technicien || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 truncate max-w-[120px] text-[11px]">
                          {m.commentaire || m.action_id || '-'}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => onDeleteMouvement(m.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Supprimer ce mouvement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
