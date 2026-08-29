import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  ArrowRight,
  MapPin,
  Users,
  FolderTree,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function MachinesRegisteredView({
  machines,
  families,
  templates,
  zones,
  technicians,
  mouvements,
  mchFamilyFilter,
  setMchFamilyFilter,
  mchTemplateFilter,
  setMchTemplateFilter,
  mchZoneFilter,
  setMchZoneFilter,
  mchSearch,
  setMchSearch,
  onOpenAddMachine,
  onNavigateToFamily,
  onNavigateToTemplate,
  onNavigateToZone
}) {
  // Cascading templates based on selected family
  const availableTemplates = mchFamilyFilter === 'ALL'
    ? templates
    : templates.filter((t) => t.id_family === mchFamilyFilter);

  const filteredMachines = machines.filter((m) => {
    if (mchFamilyFilter !== 'ALL' && m.id_family !== mchFamilyFilter) return false;
    if (mchTemplateFilter !== 'ALL' && m.id_templates !== mchTemplateFilter) return false;
    if (mchZoneFilter !== 'ALL' && m.id_zone_default !== mchZoneFilter) return false;
    if (mchSearch) {
      const q = mchSearch.toLowerCase();
      return (
        m.id_machine_registered.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        m.id_family.toLowerCase().includes(q) ||
        m.id_templates.toLowerCase().includes(q) ||
        (m.id_zone_default && m.id_zone_default.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Twin Principal Machines • Catalogue Global</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Machines Registered (Équipements & Lignes)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tableau centralisé miroir de Stock. Intègre <b className="text-cyan-600">Famille</b>, <b className="text-amber-600">Template</b>, <b className="text-purple-600">Zone</b> et <b className="text-blue-600">Technicien</b> avec badges interactifs.
          </p>
        </div>

        <button
          onClick={onOpenAddMachine}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nouvelle Machine Registered</span>
        </button>
      </div>

      {/* Filter Bar with Cascading Selects */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher (Code, désignation, zone)..."
              value={mchSearch}
              onChange={(e) => setMchSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          {/* Family Filter */}
          <select
            value={mchFamilyFilter}
            onChange={(e) => {
              setMchFamilyFilter(e.target.value);
              setMchTemplateFilter('ALL');
            }}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
          >
            <option value="ALL">Toutes les Familles ({families.length})</option>
            {families.map((f) => (
              <option key={f.id_family} value={f.id_family}>
                {f.libelle} ({f.id_family})
              </option>
            ))}
          </select>

          {/* Cascading Template Filter */}
          <select
            value={mchTemplateFilter}
            onChange={(e) => setMchTemplateFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
          >
            <option value="ALL">Tous les Templates ({availableTemplates.length})</option>
            {availableTemplates.map((t) => (
              <option key={t.id_templates} value={t.id_templates}>
                {t.libelle} ({t.id_templates})
              </option>
            ))}
          </select>

          {/* Zone Filter */}
          <select
            value={mchZoneFilter}
            onChange={(e) => setMchZoneFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
          >
            <option value="ALL">Toutes les Zones ({zones.length})</option>
            {zones.map((z) => (
              <option key={z.id_zone} value={z.id_zone}>
                {z.libelle} ({z.id_zone})
              </option>
            ))}
          </select>

          {(mchFamilyFilter !== 'ALL' || mchTemplateFilter !== 'ALL' || mchZoneFilter !== 'ALL' || mchSearch) && (
            <button
              onClick={() => {
                setMchFamilyFilter('ALL');
                setMchTemplateFilter('ALL');
                setMchZoneFilter('ALL');
                setMchSearch('');
              }}
              className="text-xs text-slate-500 hover:text-slate-900 underline font-medium px-1"
            >
              Effacer filtres
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Affichage : <b className="text-slate-900">{filteredMachines.length}</b> / {machines.length} machines
        </div>
      </div>

      {/* Main Table with Sticky Header, Zebra & Scroll 60vh */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="max-h-[60vh] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead className="sticky top-0 bg-slate-100 text-[10.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 z-10 shadow-2xs">
              <tr>
                <th className="py-3 px-4">Cde (Code Machine = Ref)</th>
                <th className="py-3 px-4">Désignation</th>
                <th className="py-3 px-3">Family</th>
                <th className="py-3 px-3">Template</th>
                <th className="py-3 px-3">Zone</th>
                <th className="py-3 px-3">Technician</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Interventions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMachines.map((m) => {
                const fam = families.find((f) => f.id_family === m.id_family);
                const tpl = templates.find((t) => t.id_templates === m.id_templates);
                const zn = zones.find((z) => z.id_zone === m.id_zone_default);
                const tech = technicians.find((t) => t.id_technician === m.technician);
                const sortiesCount = mouvements.filter(
                  (x) => x.id_machine_registered === m.id_machine_registered
                ).length;

                return (
                  <tr
                    key={m.id_machine_registered}
                    className="even:bg-slate-50/50 odd:bg-white hover:bg-emerald-50/50 transition-colors"
                  >
                    {/* Cde Machine */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {m.id_machine_registered}
                      </span>
                    </td>

                    {/* Désignation */}
                    <td className="py-3 px-4 font-semibold text-slate-800 text-[13px] whitespace-nowrap">
                      {m.designation}
                    </td>

                    {/* Family (Badge Cyan) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setMchFamilyFilter(m.id_family);
                          setMchTemplateFilter('ALL');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px] font-semibold hover:bg-cyan-100 transition"
                        title="Filtrer par cette Famille"
                      >
                        <FolderTree className="w-3 h-3 text-cyan-600" />
                        <span>{fam ? fam.libelle : m.id_family}</span>
                      </button>
                    </td>

                    {/* Template (Badge Amber) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setMchFamilyFilter(m.id_family);
                          setMchTemplateFilter(m.id_templates);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold hover:bg-amber-100 transition"
                        title="Filtrer par ce Template"
                      >
                        <Layers className="w-3 h-3 text-amber-600" />
                        <span>{tpl ? tpl.libelle : m.id_templates}</span>
                      </button>
                    </td>

                    {/* Zone */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={() => setMchZoneFilter(m.id_zone_default)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-medium hover:bg-purple-100 transition"
                        title="Filtrer par cette Zone"
                      >
                        <MapPin className="w-3 h-3 text-purple-600" />
                        <span>{zn ? zn.libelle : m.id_zone_default || 'Atelier'}</span>
                      </button>
                    </td>

                    {/* Technician */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-medium">
                        <Users className="w-3 h-3 text-blue-600" />
                        <span>{tech ? `${tech.id_technician} (${tech.nom})` : m.technician || 'Non assigné'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'En Service'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : m.status === 'En Maintenance'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {m.status === 'En Service' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        <span>{m.status || 'En Service'}</span>
                      </span>
                    </td>

                    {/* Interventions Count */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                      {sortiesCount} sorties
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
