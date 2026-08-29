import React, { useState } from 'react';
import CustomSelect from './CustomSelect';
import { Layers, Plus, Search, ArrowRight, Package, Tag, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const TYPE_STYLES = {
  Foret: 'bg-amber-50 text-amber-700 border-amber-200',
  Tenaille: 'bg-slate-100 text-slate-700 border-slate-200',
  Cheville: 'bg-violet-50 text-violet-700 border-violet-200',
  Poinçon: 'bg-rose-50 text-rose-700 border-rose-200',
  Vis: 'bg-blue-50 text-blue-700 border-blue-200',
  Raccord: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Roulement: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Courroie: 'bg-orange-50 text-orange-700 border-orange-200',
  Capteur: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  teflon: 'bg-teal-50 text-teal-700 border-teal-200',
};

function getTypeStyle(typeStr) {
  if (!typeStr) return 'bg-cyan-50 text-cyan-800 border-cyan-200';
  const clean = String(typeStr).trim();
  const key = Object.keys(TYPE_STYLES).find(
    (k) => k.toLowerCase() === clean.toLowerCase()
  );
  return TYPE_STYLES[key] || 'bg-cyan-50 text-cyan-800 border-cyan-200';
}

export default function DesignationView({
  designations = [],
  types = [],
  stockItems = [],
  desigTypeFilter = 'ALL',
  setDesigTypeFilter,
  onAddDesignation,
  onOpenAddTypeModal,
  onNavigateToStockFilteredByRef
}) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    id_type: '',
    ref: '',
    designation: '',
    stockInitial: 5,
    seuil: 3,
    emplacement: ''
  });

  // Filtered and sorted designations
  const filtered = designations
    .filter((d) => {
      if (desigTypeFilter !== 'ALL' && d.id_type !== desigTypeFilter && d.type !== desigTypeFilter) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const r = String(d.ref || d.id_designation || '').toLowerCase();
        const name = String(d.designation || '').toLowerCase();
        const t = String(d.id_type || d.type || '').toLowerCase();
        return r.includes(q) || name.includes(q) || t.includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      const refA = String(a.ref || a.id_designation || '');
      const refB = String(b.ref || b.id_designation || '');
      return refA.localeCompare(refB, undefined, { numeric: true, sensitivity: 'base' });
    });

  const handleTypeSelect = (selectedType) => {
    if (!selectedType) return;
    const prefix = selectedType.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) || 'REF';
    
    // Find highest index among designations & stockItems for this prefix
    let maxIndex = 0;
    
    designations.forEach((d) => {
      const dType = d.id_type || d.type || '';
      const r = String(d.ref || d.id_designation || '');
      if (dType.toLowerCase() === selectedType.toLowerCase() || r.toUpperCase().startsWith(prefix)) {
        const match = r.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxIndex) maxIndex = num;
        }
      }
    });

    stockItems.forEach((s) => {
      const sType = s.id_type || s.type || '';
      const r = String(s.ref || '');
      if (sType.toLowerCase() === selectedType.toLowerCase() || r.toUpperCase().startsWith(prefix)) {
        const match = r.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxIndex) maxIndex = num;
        }
      }
    });

    const nextNumber = maxIndex + 1;
    const generatedRef = `${prefix}${String(nextNumber).padStart(3, '0')}`;

    setForm((prev) => ({
      ...prev,
      id_type: selectedType,
      ref: generatedRef
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id_type || !form.designation) return;

    onAddDesignation(form);
    setForm({
      id_type: '',
      ref: '',
      designation: '',
      stockInitial: 5,
      seuil: 3,
      emplacement: ''
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>Désignations d'Articles</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Équivalent des <b className="text-indigo-600">Templates</b> pour les machines: chaque Désignation est rattachée à un <b className="text-cyan-600">Type (Family)</b>.
          </p>
        </div>

        <button
          onClick={() => {
            const initialType = desigTypeFilter !== 'ALL' ? desigTypeFilter : (types[0]?.id_type || types[0] || 'Foret');
            handleTypeSelect(initialType);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-black transition shadow-xs flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle Désignation</span>
        </button>
      </div>

      {/* Excel Formula Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule C (Type Parente)</div>
            <div className="text-[11px] font-mono font-semibold text-cyan-700 mt-0.5">
              =[@id_type] (Clé Type)
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan-700">Liaison C</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule D (Nb Articles Stock)</div>
            <div className="text-[11px] font-mono font-semibold text-indigo-700 mt-0.5">
              =COUNTIF(Stock_Actuel!C:C, [@designation])
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">Calcul D</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formule E (Quantité en Stock)</div>
            <div className="text-[11px] font-mono font-semibold text-emerald-700 mt-0.5">
              =SUMIF(Stock!C:C, [@designation], Stock!H:H)
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Somme E</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par Ref (FORET001) ou Désignation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div className="w-52">
            <CustomSelect
              value={desigTypeFilter}
              onChange={(val) => setDesigTypeFilter(val)}
              options={[
                { value: 'ALL', label: `Tous les Types (D) (${types.length})` },
                ...types.map((t) => {
                  const val = typeof t === 'string' ? t : (t.id_type || t.libelle);
                  const label = typeof t === 'string' ? t : (t.libelle || t.id_type);
                  return {
                    value: val,
                    label: `[D] ${label}`
                  };
                })
              ]}
            />
          </div>

          {desigTypeFilter !== 'ALL' && (
            <button
              onClick={() => setDesigTypeFilter('ALL')}
              className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs hover:bg-slate-200 transition"
            >
              ✕ Réinitialiser
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium self-end sm:self-auto">
          Résultats : <b className="text-slate-900">{filtered.length}</b> / {designations.length} désignations
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Top Info Header Bar inside Card */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50/50 gap-2">
          <div className="font-bold text-slate-800 text-[13px]">
            Désignations • Ordre Excel Row 3 : B→G
          </div>
          <div className="font-mono text-[11px] text-slate-400 hidden lg:block">
            ref | designation | type | stockActuel | alerte | emplacement
          </div>
        </div>

        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-xs text-[10.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">
                  <span>REF / ID</span> <span className="text-slate-400 font-normal text-[10px]">(B)</span>
                </th>
                <th className="py-2.5 px-4 min-w-[220px]">
                  <span>DÉSIGNATION</span> <span className="text-slate-400 font-normal text-[10px]">(C) primary</span>
                </th>
                <th className="py-2.5 px-4">
                  <span>TYPE</span> <span className="text-slate-400 font-normal text-[10px]">(D)</span>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <span>STOCK ACTUEL</span> <span className="text-slate-400 font-normal text-[10px]">(E)</span>
                </th>
                <th className="py-2.5 px-3 text-center">
                  <span>ÉTAT</span> <span className="text-slate-400 font-normal text-[10px]">(F)</span>
                </th>
                <th className="py-2.5 px-4">
                  <span>EMPLACEMENT</span> <span className="text-slate-400 font-normal text-[10px]">(G)</span>
                </th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item, idx) => {
                const stockMatch = stockItems.find(
                  (s) =>
                    s.ref === item.ref ||
                    s.designation.toLowerCase() === (item.designation || '').toLowerCase()
                );

                const currentStock = stockMatch ? stockMatch.stockActuel : (item.stockInitial || 0);
                const threshold = stockMatch ? stockMatch.seuil : (item.seuil || 3);
                const alertStatus = stockMatch ? stockMatch.alerte : (currentStock <= 0 ? 'RUPTURE' : currentStock <= threshold ? 'ALERTE' : 'OK');
                const location = stockMatch ? stockMatch.emplacement : (item.emplacement || 'A1-R1');
                const typeName = item.id_type || item.type || 'Standard';

                return (
                  <tr key={item.ref || item.id_designation || idx} className="even:bg-slate-50/50 odd:bg-white hover:bg-slate-100/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11.5px]">
                        {item.ref || item.id_designation}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 text-[13px]">
                      {item.designation}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setDesigTypeFilter(typeName)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold transition ${getTypeStyle(typeName)}`}
                        title="Filtrer par ce Type"
                      >
                        <Tag className="w-3 h-3 opacity-70" />
                        <span>{typeName}</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 text-[13px]">
                      {currentStock}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {alertStatus === 'RUPTURE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          <span>RUPTURE</span>
                        </span>
                      )}
                      {alertStatus === 'ALERTE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>ALERTE</span>
                        </span>
                      )}
                      {alertStatus === 'OK' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>OK</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {location}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onNavigateToStockFilteredByRef && onNavigateToStockFilteredByRef(item.ref || item.designation)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white hover:bg-black text-xs font-medium transition"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Voir Stock</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">+ Nouvelle Désignation (Template)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Désignation d'article associée à un Type parent (ex: FORET001 → Foret Beton Ø12).
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Type Parent (Category)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      onOpenAddTypeModal();
                    }}
                    className="text-[11px] font-semibold text-cyan-600 hover:underline"
                  >
                    + Créer un Type
                  </button>
                </div>
                <CustomSelect
                  value={form.id_type}
                  onChange={(val) => handleTypeSelect(val)}
                  options={types.map((t) => {
                    const val = typeof t === 'string' ? t : (t.id_type || t.libelle);
                    const label = typeof t === 'string' ? t : (t.libelle || t.id_type);
                    return {
                      value: val,
                      label: label
                    };
                  })}
                  placeholder="-- Sélectionner un Type --"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  ID / Code Référence (Auto)
                </label>
                <input
                  type="text"
                  value={form.ref}
                  onChange={(e) => setForm({ ...form, ref: e.target.value })}
                  placeholder="FORET001"
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Désignation d'Article
                </label>
                <input
                  type="text"
                  placeholder="Foret Beton Ø12, Cheville Ø10..."
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Stock Initial</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stockInitial}
                    onChange={(e) => setForm({ ...form, stockInitial: Number(e.target.value) })}
                    className="mt-1 w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Seuil</label>
                  <input
                    type="number"
                    min="0"
                    value={form.seuil}
                    onChange={(e) => setForm({ ...form, seuil: Number(e.target.value) })}
                    className="mt-1 w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Emplacement</label>
                  <input
                    type="text"
                    placeholder="A1-R02"
                    value={form.emplacement}
                    onChange={(e) => setForm({ ...form, emplacement: e.target.value })}
                    className="mt-1 w-full h-9 px-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                  />
                </div>
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
