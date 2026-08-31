import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, X, Wrench, ShieldCheck, ClipboardList } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function AddUserModal({
  isOpen,
  onClose,
  zones = [],
  technicians = [],
  operations = [],
  onAddTechnician,
  onAddOperation,
  initialType = 'TECHNICIEN', // 'TECHNICIEN' | 'OPERATEUR' | 'CHEF'
  onOpenAddZoneModal,
}) {
  const [profileType, setProfileType] = useState(initialType);
  const [form, setForm] = useState({
    nom: '',
    id_zone: zones[0]?.id_zone || '',
    specialite: '',
  });
  const [error, setError] = useState('');

  // Auto-calculation of next ID respecting prefix & count
  const getNextId = (type) => {
    if (type === 'TECHNICIEN') {
      const nums = technicians
        .map((t) => {
          const m = String(t.id_technician || '').match(/TECH-(\d+)/i);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const max = nums.length > 0 ? Math.max(...nums) : 0;
      return `TECH-${String(max + 1).padStart(2, '0')}`;
    } else if (type === 'OPERATEUR') {
      const nums = operations
        .filter((o) => o.type_profil === 'OPERATEUR' || !String(o.id_operation).startsWith('CHEF'))
        .map((o) => {
          const m = String(o.id_operation || '').match(/OP-(\d+)/i);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const max = nums.length > 0 ? Math.max(...nums) : 0;
      return `OP-${String(max + 1).padStart(2, '0')}`;
    } else if (type === 'CHEF') {
      const nums = operations
        .filter((o) => o.type_profil === 'CHEF' || String(o.id_operation).startsWith('CHEF'))
        .map((o) => {
          const m = String(o.id_operation || '').match(/CHEF-(\d+)/i);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const max = nums.length > 0 ? Math.max(...nums) : 0;
      return `CHEF-${String(max + 1).padStart(2, '0')}`;
    }
    return '';
  };

  useEffect(() => {
    if (isOpen) {
      setProfileType(initialType);
      setForm({
        nom: '',
        id_zone: zones[0]?.id_zone || '',
        specialite:
          initialType === 'TECHNICIEN'
            ? 'Mécanique / Électrique'
            : initialType === 'CHEF'
              ? 'Superviseur Atelier'
              : 'Opérateur de Ligne',
      });
      setError('');
    }
  }, [isOpen, initialType, zones]);

  if (!isOpen) return null;

  const currentId = getNextId(profileType);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nom.trim()) {
      setError('Veuillez saisir le nom ou la désignation.');
      return;
    }

    if (profileType === 'TECHNICIEN') {
      if (technicians.some((t) => t.nom.toLowerCase().trim() === form.nom.toLowerCase().trim())) {
        setError('Un technicien portant ce nom existe déjà.');
        return;
      }
      onAddTechnician({
        id_technician: currentId,
        nom: form.nom.trim(),
        id_zone: form.id_zone,
        specialite: form.specialite.trim() || 'Spécialiste GMAO',
      });
    } else {
      if (operations.some((o) => o.nom.toLowerCase().trim() === form.nom.toLowerCase().trim())) {
        setError('Une opération ou un superviseur portant ce nom existe déjà.');
        return;
      }
      onAddOperation({
        id_operation: currentId,
        nom: form.nom.trim(),
        id_zone: form.id_zone,
        type_profil: profileType === 'CHEF' ? 'CHEF' : 'OPERATEUR',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-none">
                {profileType === 'TECHNICIEN'
                  ? 'Nouveau Technicien'
                  : profileType === 'CHEF'
                    ? "Nouveau Chef d'Équipe"
                    : 'Nouvelle Opération / Opérateur'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Création rapide liée aux zones et au workflow
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Switcher Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Type de Profil
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/80 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setProfileType('TECHNICIEN');
                setForm((prev) => ({ ...prev, specialite: 'Mécanique / Électrique' }));
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                profileType === 'TECHNICIEN'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              <span>Technicien</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setProfileType('CHEF');
                setForm((prev) => ({ ...prev, specialite: 'Superviseur Atelier' }));
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                profileType === 'CHEF'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Chef Équipe</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setProfileType('OPERATEUR');
                setForm((prev) => ({ ...prev, specialite: 'Opérateur de Ligne' }));
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                profileType === 'OPERATEUR'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
              <span>Opérateur</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Generated ID */}
          <div>
            <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              ID Auto-Généré
            </label>
            <input
              type="text"
              readOnly
              value={currentId}
              className="w-full h-9 px-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 cursor-not-allowed"
            />
          </div>

          {/* Nom / Intitulé */}
          <div>
            <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Nom / Intitulé complet <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder={
                profileType === 'TECHNICIEN'
                  ? 'ex: Karim Bennani'
                  : profileType === 'CHEF'
                    ? 'ex: Chef Amine Tazi'
                    : 'ex: Nettoyage et Graissage Ligne 1'
              }
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          {/* Zone affectée */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider">
                Zone / Atelier de Rattachement <span className="text-rose-500">*</span>
              </label>
              {onOpenAddZoneModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddZoneModal();
                  }}
                  className="text-[10.5px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  + Nouvelle Zone
                </button>
              )}
            </div>
            <CustomSelect
              value={form.id_zone}
              onChange={(val) => setForm({ ...form, id_zone: val })}
              options={zones.map((z) => ({
                value: z.id_zone,
                label: `${z.libelle} (${z.id_zone})`,
              }))}
              placeholder="-- Choisir une Zone --"
            />
          </div>

          {/* Spécialité (if Technicien) */}
          {profileType === 'TECHNICIEN' && (
            <div>
              <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Spécialité / Compétence
              </label>
              <input
                type="text"
                placeholder="ex: Mécanique, Électricité, Automatisme..."
                value={form.specialite}
                onChange={(e) => setForm({ ...form, specialite: e.target.value })}
                className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer & Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
