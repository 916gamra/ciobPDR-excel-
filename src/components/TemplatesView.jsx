import React, { useState } from 'react';
import CustomSelect from './CustomSelect';
import { Layers, Plus, Search, ArrowRight, FolderTree, Cpu } from 'lucide-react';

export default function TemplatesView({
  templates,
  families,
  machines,
  templateFamilyFilter,
  setTemplateFamilyFilter,
  onAddTemplate,
  onOpenAddFamilyModal,
  onNavigateToMachinesByTemplate,
  onNavigateToFamilyFiltered
}) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ id_templates: '', libelle: '', id_family: families[0]?.id_family || '' });

  const filtered = templates.filter((t) => {
    if (templateFamilyFilter !== 'ALL' && t.id_family !== templateFamilyFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return t.id_templates.toLowerCase().includes(q) || t.libelle.toLowerCase().includes(q) || t.id_family.toLowerCase().includes(q);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id_templates || !form.libelle || !form.id_family) return;
    onAddTemplate(form);
    setForm({ id_templates: '', libelle: '', id_family: families[0]?.id_family || '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Templates de Machines (Modèles Spécifiques)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rattaché à une <b className="text-cyan-600">Famille Parente</b>. Cliquez sur <b className="text-amber-600">Nb Machines</b> pour filtrer précisément : <span className="font-mono text-amber-700">Family = Famille parente + Template = Ce modèle</span>.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({ id_templates: '', libelle: '', id_family: families[0]?.id_family || '' });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-black transition shadow-xs flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouveau Template</span>
        </button>
      </div>

      {/* Excel Formula Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule C (Famille Parente)</div>
            <div className="text-[11px] font-mono font-semibold text-cyan-700 mt-0.5">
              =[@id_family] (Liaison Clé)
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan-700">Liaison C</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule D (Nb Machines Registered)</div>
            <div className="text-[11px] font-mono font-semibold text-amber-700 mt-0.5">
              =COUNTIF(Machines!E:E, [@id_templates])
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700">Calcul D</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule En Service (Statut)</div>
            <div className="text-[11px] font-mono font-semibold text-emerald-700 mt-0.5">
              =COUNTIFS(Machines!E:E, [@id_templates], Machines!H:H, "En service")
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">COUNTIFS</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un template (ID, libellé)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div className="w-56">
            <CustomSelect
              value={templateFamilyFilter}
              onChange={(val) => setTemplateFamilyFilter(val)}
              options={[
                { value: 'ALL', label: `Toutes les Familles Parentes (D) (${families.length})` },
                ...families.map((f) => ({
                  value: f.id_family,
                  label: `[D] ${f.libelle} (${f.id_family})`
                }))
              ]}
            />
          </div>

          {templateFamilyFilter !== 'ALL' && (
            <button
              onClick={() => setTemplateFamilyFilter('ALL')}
              className="text-xs text-slate-500 hover:text-slate-900 underline font-medium"
            >
              Effacer filtre
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total : <b className="text-slate-900">{filtered.length}</b> templates
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Top Info Header Bar inside Card */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50/50 gap-2">
          <div className="font-bold text-slate-800 text-[13px]">
            Templates • Ordre Excel Row 3 : B→E
          </div>
          <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
            id_templates | libelle | id_family | nb_machines
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50/90 text-[10.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">
                <span>ID TEMPLATE</span> <span className="text-slate-400 font-normal text-[10px]">(B)</span>
              </th>
              <th className="py-2.5 px-4">
                <span>LIBELLÉ DU MODÈLE</span> <span className="text-slate-400 font-normal text-[10px]">(C) primary</span>
              </th>
              <th className="py-2.5 px-4">
                <span>FAMILLE PARENTE</span> <span className="text-slate-400 font-normal text-[10px]">(D)</span>
              </th>
              <th className="py-2.5 px-4">
                <span>NB MACHINES</span> <span className="text-slate-400 font-normal text-[10px]">(E)</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((t) => {
              const fam = families.find((f) => f.id_family === t.id_family);
              const mCount = machines.filter((m) => m.id_templates === t.id_templates).length;

              return (
                <tr key={t.id_templates} className="even:bg-slate-50/50 odd:bg-white hover:bg-slate-100/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {t.id_templates}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 text-[13px]">
                    {t.libelle}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToFamilyFiltered(t.id_family)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-mono font-bold hover:bg-cyan-100 transition"
                      title="Voir cette Famille Parente"
                    >
                      <FolderTree className="w-3 h-3 text-cyan-600" />
                      <span>{t.id_family}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigateToMachinesByTemplate(t.id_family, t.id_templates)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-semibold transition group shadow-2xs"
                      title="Filtrer Machines : Famille + ce Template"
                    >
                      <Cpu className="w-3.5 h-3.5 text-amber-600" />
                      <span>{mCount} machines (Filtre ciblé)</span>
                      <ArrowRight className="w-3 h-3 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
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
            <h3 className="font-bold text-base text-slate-900 mb-1">+ Nouveau Template de Machine</h3>
            <p className="text-xs text-slate-500 mb-4">Ajoutez un modèle précis rattaché à une famille.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ID Template (ex: TPL-HYD200)</label>
                <input
                  type="text"
                  placeholder="TPL-HYD200"
                  value={form.id_templates}
                  onChange={(e) => setForm({ ...form, id_templates: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Libellé du Modèle</label>
                <input
                  type="text"
                  placeholder="Presse Hydraulique 200 Bars..."
                  value={form.libelle}
                  onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Famille Parente (Liaison)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      onOpenAddFamilyModal();
                    }}
                    className="text-[11px] text-cyan-700 hover:text-cyan-900 font-semibold inline-flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Créer Famille</span>
                  </button>
                </div>
                <CustomSelect
                  value={form.id_family}
                  onChange={(val) => setForm({ ...form, id_family: val })}
                  options={families.map((f) => ({
                    value: f.id_family,
                    label: `${f.libelle} (${f.id_family})`
                  }))}
                  placeholder="-- Choisir Famille --"
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
