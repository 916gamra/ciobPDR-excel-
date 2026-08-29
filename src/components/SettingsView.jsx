import React from 'react';
import { Settings as SettingsIcon, Sliders, Database, Shield, FileSpreadsheet, HardDrive, RefreshCw } from 'lucide-react';

export default function SettingsView() {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                Paramètres du Système (Settings)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configuration générale, préférences de stockage local et paramètres du modèle GMAO Light
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Stockage Local Actif (100% Offline)
          </span>
        </div>
      </div>

      {/* Settings Grid Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Préférences d'affichage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Affichage & Thème</h3>
              <p className="text-[11px] text-slate-500">Personnalisation visuelle de l'espace de travail</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 leading-relaxed">
            Les options de personnalisation de l'affichage, de la densité des tableaux et des couleurs seront configurables ici.
          </div>
        </div>

        {/* Card 2: Intégrité des Données */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Modèle Excel Twin</h3>
              <p className="text-[11px] text-slate-500">Validation des schémas et formules</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 leading-relaxed">
            Contrôle des règles de calcul automatique (<code className="font-mono text-[11px] text-slate-700">=E+F-G</code>) et de l'intégrité des clés étrangères.
          </div>
        </div>

        {/* Card 3: Stockage & Cache */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Stockage Local</h3>
              <p className="text-[11px] text-slate-500">Gestion de la mémoire localStorage</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 leading-relaxed">
            Sauvegarde automatique hors-ligne active. Les données persistent de manière sécurisée dans votre navigateur.
          </div>
        </div>
      </div>
    </div>
  );
}
