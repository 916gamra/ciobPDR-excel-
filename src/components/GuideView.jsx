import React from 'react';
import { BookOpen, CheckCircle2, ArrowRight, Zap, Database, Layers, ShieldCheck } from 'lucide-react';

export default function GuideView() {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Manuel d'Utilisation, Règles d'Intégrité & Formules Excel</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Retrouvez les principes des tables miroirs (Twins), la gouvernance des liens intelligents, et la syntaxe exacte des formules de calcul Excel du modèle GMAO Light.
        </p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Rule 1: Twin Tables */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Les Deux Tables Miroirs (Twins)
            </h3>
          </div>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              • <b className="text-slate-900">Stock (Articles)</b> : Tableau central des pièces de rechange. Colonnes : Ref (B), Désignation (C), Type (D), Initial (E), Entrées (F), Sorties (G), Actuel (H), Seuil (I), Alerte (J), Emplacement (K).
            </p>
            <p>
              • <b className="text-slate-900">Machines Registered</b> : Tableau central des équipements. Colonnes : Code Machine (B), Désignation (C), Family (D), Template (E), Zone (F), Technician (G), Status (H).
            </p>
            <p className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700">
              Ces deux tables agissent comme les deux hubs de données majeurs du système.
            </p>
          </div>
        </div>

        {/* Rule 2: Smart Links Navigation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Navigation par Liens Intelligents (Smart Links)
            </h3>
          </div>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              • <b className="text-cyan-700">Family → Templates</b> : Clic sur <i>Nb Templates</i> ouvre la liste des modèles filtrée sur la famille.
            </p>
            <p>
              • <b className="text-emerald-700">Family → Machines</b> : Clic sur <i>Nb Machines</i> filtre Machines Registered avec <span className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">Family = Sélectionnée, Template = Tous</span>.
            </p>
            <p>
              • <b className="text-amber-700">Template → Machines</b> : Clic sur <i>Nb Machines</i> applique un filtre ciblé : <span className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">Family = Famille parente + Template = Ce modèle</span>.
            </p>
          </div>
        </div>

        {/* Rule 3: Auto-Generated IDs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Génération Automatique d'Identifiants (Auto-ID)
            </h3>
          </div>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              • <b className="text-blue-700">Technicians</b> : Auto-généré sous le format <span className="font-mono font-bold">TECH-01, TECH-02...</span>
            </p>
            <p>
              • <b className="text-indigo-700">Opérateurs</b> : Auto-généré sous le format <span className="font-mono font-bold">OP-01, OP-02...</span>
            </p>
            <p>
              • <b className="text-amber-700">Chefs d'Équipe</b> : Auto-généré sous le format <span className="font-mono font-bold">CHEF-01, CHEF-02...</span>
            </p>
            <p className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200 text-purple-900 font-medium">
              Distinction rigoureuse des rôles pour la gouvernance des sorties et interventions.
            </p>
          </div>
        </div>

        {/* Rule 4: Dropdowns & Quick '+' Creation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Listes Déroulantes & Création Instantanée '+'
            </h3>
          </div>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              Lors de la création d'un article ou d'une machine, vous pouvez sélectionner une entité existante ou cliquer sur le bouton <b>'+'</b> pour créer la catégorie immédiatement.
            </p>
            <p>
              La nouvelle entité est automatiquement enregistrée et pré-sélectionnée dans le formulaire en cours.
            </p>
          </div>
        </div>
      </div>

      {/* Excel Formulas Reference */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Formules Excel Standardisées (Calculs Stock & Relations)</span>
        </h3>
        
        {/* Stock Formulas */}
        <div>
          <div className="text-xs font-semibold text-slate-700 mb-2">1. Formules du Stock Actuel (Feuille Stock_Actuel)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Formule F (Entrées)</div>
              <div className="font-mono font-semibold text-blue-700 mt-1 text-[11px] break-all">
                =SUMIFS(Mouvement[Quantite], Mouvement[Ref], [@Ref], Mouvement[Type], "Entrée")
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Formule G (Sorties)</div>
              <div className="font-mono font-semibold text-rose-700 mt-1 text-[11px] break-all">
                =SUMIFS(Mouvement[Quantite], Mouvement[Ref], [@Ref], Mouvement[Type], "Sortie")
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Formule H (Stock Actuel)</div>
              <div className="font-mono font-bold text-emerald-700 mt-1 text-[11px]">
                =[@[Stock Initial]] + [@Entrees] - [@Sorties]
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Formule J (Alerte / Rupture)</div>
              <div className="font-mono font-semibold text-amber-700 mt-1 text-[11px] break-all">
                =IF([@[Stock Actuel]]&lt;=0, "RUPTURE", IF([@[Stock Actuel]]&lt;=[@Seuil], "ALERTE", "OK"))
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Sheet Aggregations */}
        <div className="pt-3 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-700 mb-2">2. Formules d'Agrégation & Liens Relationnels (COUNTIF / COUNTIFS)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Templates par Famille</div>
              <div className="font-mono text-cyan-800 font-semibold mt-1 text-[11px]">
                =COUNTIF(Templates!C:C, [@id_family])
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Machines par Template</div>
              <div className="font-mono text-amber-800 font-semibold mt-1 text-[11px]">
                =COUNTIF(Machines!D:D, [@id_templates])
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Machines par Zone</div>
              <div className="font-mono text-purple-800 font-semibold mt-1 text-[11px]">
                =COUNTIF(Machines!E:E, [@id_zone])
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Auto-ID Chef d'Équipe</div>
              <div className="font-mono text-amber-800 font-semibold mt-1 text-[11px]">
                ="CHEF-" & TEXT(COUNTIF(Op[Type],"CHEF")+1, "00")
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Classification Profil Chef</div>
              <div className="font-mono text-indigo-800 font-semibold mt-1 text-[11px]">
                =IF(ISNUMBER(SEARCH("CHEF",[@id_operation])),"CHEF","OPERATEUR")
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
