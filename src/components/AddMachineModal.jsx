import React, { useState, useEffect } from 'react';
import { Cpu, Plus, X } from 'lucide-react';
import CustomSelect from './CustomSelect';

function generateMachineCode(selectedTemplateId, existingMachines = []) {
  if (!selectedTemplateId) return 'MCH-01';

  // Clean prefix from selected template ID (e.g. DET -> DET, TPL-RCF100 -> RCF100)
  const prefix =
    selectedTemplateId
      .replace(/^TPL-?/i, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '') || 'MCH';

  let maxIndex = 0;
  existingMachines.forEach((m) => {
    const code = String(m.id_machine_registered || '').toUpperCase();
    const tpl = String(m.id_templates || '').toUpperCase();
    if (code.startsWith(prefix) || tpl === selectedTemplateId.toUpperCase()) {
      const match = code.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxIndex) maxIndex = num;
      }
    }
  });

  const nextNum = maxIndex + 1;
  return `${prefix}-${String(nextNum).padStart(2, '0')}`;
}

export default function AddMachineModal({
  isOpen,
  onClose,
  families = [],
  templates = [],
  zones = [],
  technicians = [],
  machines = [],
  onAddMachine,
  onOpenAddFamilyModal,
  onOpenAddTemplateModal,
  onOpenAddZoneModal,
  onOpenAddTechModal,
}) {
  const [form, setForm] = useState({
    id_machine_registered: '',
    designation: '',
    id_family: families[0]?.id_family || '',
    id_templates: templates[0]?.id_templates || '',
    id_zone_default: zones[0]?.id_zone || '',
    technician: technicians[0]?.id_technician || '',
    status: 'En Service',
  });

  useEffect(() => {
    if (isOpen) {
      const initialFam = families[0]?.id_family || '';
      const relTemplates = initialFam
        ? templates.filter((t) => t.id_family === initialFam)
        : templates;
      const initialTpl = relTemplates[0]?.id_templates || templates[0]?.id_templates || '';
      const autoCode = generateMachineCode(initialTpl, machines);

      setForm({
        id_machine_registered: autoCode,
        designation: '',
        id_family: initialFam,
        id_templates: initialTpl,
        id_zone_default: zones[0]?.id_zone || '',
        technician: technicians[0]?.id_technician || '',
        status: 'En Service',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Cascading templates according to selected family
  const availableTemplates = form.id_family
    ? templates.filter((t) => t.id_family === form.id_family)
    : templates;

  const handleFamilyChange = (newFam) => {
    const relTpl = templates.filter((t) => t.id_family === newFam);
    const newTpl = relTpl[0]?.id_templates || '';
    const autoCode = generateMachineCode(newTpl, machines);
    setForm((prev) => ({
      ...prev,
      id_family: newFam,
      id_templates: newTpl,
      id_machine_registered: autoCode,
    }));
  };

  const handleTemplateChange = (newTpl) => {
    const autoCode = generateMachineCode(newTpl, machines);
    setForm((prev) => ({
      ...prev,
      id_templates: newTpl,
      id_machine_registered: autoCode,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id_machine_registered || !form.designation) return;

    onAddMachine({
      id_machine_registered: form.id_machine_registered.trim().toUpperCase(),
      designation: form.designation.trim(),
      id_family: form.id_family,
      id_templates: form.id_templates || availableTemplates[0]?.id_templates || '',
      id_zone_default: form.id_zone_default,
      technician: form.technician,
      status: form.status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header (BDR Light Excel UI) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Nouvelle Machine Registered</h3>
              <p className="text-xs text-slate-500">
                Ajout d'un équipement au catalogue global (Twin Stock)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Code Machine (Cde = Ref)
              </label>
              <input
                type="text"
                placeholder="ex: MCH-007"
                value={form.id_machine_registered}
                onChange={(e) => setForm({ ...form, id_machine_registered: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold uppercase focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 shadow-2xs transition"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Désignation de la Machine
              </label>
              <input
                type="text"
                placeholder="ex: Ligne Ensacheuse 03"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 shadow-2xs transition"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Family with '+' Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Famille de Machine
                </label>
                <button
                  type="button"
                  onClick={onOpenAddFamilyModal}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouvelle</span>
                </button>
              </div>
              <CustomSelect
                value={form.id_family}
                onChange={(val) => handleFamilyChange(val)}
                options={families.map((f) => ({
                  value: f.id_family,
                  label: `${f.libelle} (${f.id_family})`,
                }))}
                placeholder="-- Choisir Famille --"
              />
            </div>

            {/* Template with '+' Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Template / Modèle
                </label>
                <button
                  type="button"
                  onClick={onOpenAddTemplateModal}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouveau</span>
                </button>
              </div>
              <CustomSelect
                value={form.id_templates}
                onChange={(val) => handleTemplateChange(val)}
                options={(availableTemplates.length > 0 ? availableTemplates : templates).map(
                  (t) => ({
                    value: t.id_templates,
                    label: `${t.libelle} (${t.id_templates})`,
                  })
                )}
                placeholder="-- Choisir Modèle --"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Zone with '+' Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Zone d'Installation
                </label>
                <button
                  type="button"
                  onClick={onOpenAddZoneModal}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouvelle</span>
                </button>
              </div>
              <CustomSelect
                value={form.id_zone_default}
                onChange={(val) => setForm({ ...form, id_zone_default: val })}
                options={zones.map((z) => ({
                  value: z.id_zone,
                  label: `${z.libelle} (${z.id_zone})`,
                }))}
                placeholder="-- Choisir Zone --"
              />
            </div>

            {/* Technician with '+' Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Technicien Référent
                </label>
                <button
                  type="button"
                  onClick={onOpenAddTechModal}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouveau</span>
                </button>
              </div>
              <CustomSelect
                value={form.technician}
                onChange={(val) => setForm({ ...form, technician: val })}
                options={technicians.map((t) => ({
                  value: t.id_technician,
                  label: `${t.id_technician} - ${t.nom} (${t.id_zone})`,
                }))}
                placeholder="-- Choisir Technicien --"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Statut Opérationnel
            </label>
            <CustomSelect
              value={form.status}
              onChange={(val) => setForm({ ...form, status: val })}
              options={[
                {
                  value: 'En Service',
                  label: 'En Service',
                  badge: 'Actif',
                  badgeColor: 'bg-emerald-100 text-emerald-800',
                },
                {
                  value: 'En Maintenance',
                  label: 'En Maintenance',
                  badge: 'Entretien',
                  badgeColor: 'bg-amber-100 text-amber-800',
                },
                {
                  value: 'Hors Service',
                  label: 'Hors Service',
                  badge: 'Arrêt',
                  badgeColor: 'bg-rose-100 text-rose-800',
                },
              ]}
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold transition cursor-pointer text-xs shadow-2xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs cursor-pointer text-xs flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enregistrer la Machine</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
