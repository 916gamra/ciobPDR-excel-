import React from 'react';
import AnimatedPage from './AnimatedPage';
import { GitBranch, Layers, ArrowRight, Package, Cpu, MapPin, Tag, Users, Wrench } from 'lucide-react';

export default function NexusView({
  types,
  diagnostics,
  families,
  templates,
  zones,
  technicians,
  operations,
  machines,
  stockItems
}) {
  return (
    <AnimatedPage className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
          <GitBranch className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Nexus Matrix : Schéma des Liaisons GMAO Light</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Visualisez l'interconnexion complète et les formules de calcul entre les 3 piliers du système : <b className="text-blue-600">Components (Stock)</b>, <b className="text-emerald-600">Machines Registered</b> et <b className="text-purple-600">Zones & Équipes</b>.
        </p>
      </div>

      {/* 3 Columns Pillar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1: Components */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">1. Groupe Components</h3>
              <div className="text-[11px] text-slate-500">Stock • Type • Diagnostic</div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-200">
              <div className="font-bold text-cyan-900 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-600" />
                <span>Niveau 1 : Type ({types.length})</span>
              </div>
              <div className="text-[11.5px] text-cyan-800 mt-1">
                Catégorie parent pour pièces : Mécanique, Fixation, Pneumatique...
              </div>
              <div className="mt-2 pt-1.5 border-t border-cyan-200/60 font-mono text-[10px] text-cyan-900">
                Formule Nb Articles : <span className="font-semibold">=COUNTIF(Stock!D:D, [@id_type])</span>
              </div>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>

            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>Niveau 2 : Diagnostic ({diagnostics.length})</span>
              </div>
              <div className="text-[11.5px] text-amber-800 mt-1">
                Motifs d'usure ou pannes rattachés à chaque Type.
              </div>
              <div className="mt-2 pt-1.5 border-t border-amber-200/60 font-mono text-[10px] text-amber-900">
                Liaison : <span className="font-semibold">[@id_diag] → Diagnostic!B:B</span>
              </div>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 text-white shadow-xs">
              <div className="font-bold text-xs flex items-center justify-between">
                <span>Stock (Twin Principal)</span>
                <span className="font-mono text-cyan-400 font-bold">{stockItems.length} articles</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1">
                Catalogué par Type avec Formules Excel en temps réel.
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-800 font-mono text-[10px] text-emerald-400">
                Formule Actuel : <span className="text-white font-semibold">= E + F - G</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 2: Machines */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">2. Groupe Machines</h3>
              <div className="text-[11px] text-slate-500">Registered • Family • Templates</div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-200">
              <div className="font-bold text-cyan-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-600" />
                <span>Niveau 1 : Family ({families.length})</span>
              </div>
              <div className="text-[11.5px] text-cyan-800 mt-1">
                Familles technologiques : Emballage, Usinage, Découpe...
              </div>
              <div className="mt-2 pt-1.5 border-t border-cyan-200/60 font-mono text-[10px] text-cyan-900">
                Formule Nb Templates : <span className="font-semibold">=COUNTIF(Templates!C:C, [@id_family])</span>
              </div>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>

            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>Niveau 2 : Templates ({templates.length})</span>
              </div>
              <div className="text-[11.5px] text-amber-800 mt-1">
                Modèles de constructeurs rattachés à une Famille.
              </div>
              <div className="mt-2 pt-1.5 border-t border-amber-200/60 font-mono text-[10px] text-amber-900">
                Formule Nb Machines : <span className="font-semibold">=COUNTIF(Machines!D:D, [@id_templates])</span>
              </div>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 text-white shadow-xs">
              <div className="font-bold text-xs flex items-center justify-between">
                <span>Machines Registered (Twin)</span>
                <span className="font-mono text-emerald-400 font-bold">{machines.length} machines</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1">
                Intègre Famille + Template + Zone + Technicien assigné.
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-800 font-mono text-[10px] text-cyan-400">
                Liaisons : <span className="text-white font-semibold">id_family + id_templates + id_zone_default</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 3: Zones & Equipes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">3. Zones & Équipes</h3>
              <div className="text-[11px] text-slate-500">Zones • Techs (Auto) • Ops (Auto)</div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200">
              <div className="font-bold text-purple-900 flex items-center justify-between">
                <span>Niveau 1 : Zones ({zones.length})</span>
                <span className="text-[11px] font-semibold text-purple-700">Point d'entrée</span>
              </div>
              <div className="text-[11.5px] text-purple-800 mt-1">
                Secteurs de production (Détacheuse, Usinage, Emballage...)
              </div>
              <div className="mt-2 pt-1.5 border-t border-purple-200/60 font-mono text-[10px] text-purple-900">
                Formule Nb Machines : <span className="font-semibold">=COUNTIF(Machines!E:E, [@id_zone])</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                <div className="font-bold text-blue-900 flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-600" />
                  <span>Technicians</span>
                </div>
                <div className="text-[10.5px] font-mono text-blue-700 mt-0.5">
                  ID: TECH-01... ({technicians.length})
                </div>
                <div className="text-[9.5px] font-mono text-blue-800 mt-1">
                  =COUNTIF(Mvt[Tech], [@nom])
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200">
                <div className="font-bold text-indigo-900 flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-indigo-600" />
                  <span>Opérations & Chefs</span>
                </div>
                <div className="text-[10.5px] font-mono text-indigo-700 mt-0.5">
                  OP-xx & CHEF-xx ({operations.length})
                </div>
                <div className="text-[9.5px] font-mono text-indigo-800 mt-1">
                  =COUNTIF(Mvt[Op], [@nom])
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 text-white shadow-xs">
              <div className="font-bold text-xs flex items-center justify-between">
                <span>Sortie Rapide (Mouvement)</span>
                <span className="text-cyan-400 font-mono font-bold">Flux central</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1">
                Gouverné par Action_ID avec impact direct sur Stock Actuel.
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-800 font-mono text-[10px] text-amber-400">
                Formule SUMIFS : <span className="text-white font-semibold">SUMIFS(Mouvements[Qté], ...)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
