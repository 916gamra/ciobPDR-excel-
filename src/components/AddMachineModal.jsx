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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Nouvelle Machine Registered</h3>
              <p className="text-xs text-slate-500">
                Ajout d'un équipement au catalogue global (Twin Stock)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Code Machine (Cde = Ref)
              </label>
              <input
                type="text"
                placeholder="ex: MCH-007"
                value={form.id_machine_registered}
                onChange={(e) => setForm({ ...form, id_machine_registered: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold uppercase"
                required
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Désignation de la Machine
              </label>
              <input
                type="text"
                placeholder="ex: Ligne Ensacheuse 03"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Family with '+' Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Famille de Machine
                </label>
                <button
                  type="button"
                  onClick={onOpenAddFamilyModal}
                  className="text-[10.5px] text-cyan-600 hover:text-cyan-800 font-semibold inline-flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
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
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Template / Modèle
                </label>
                <button
                  type="button"
                  onClick={onOpenAddTemplateModal}
                  className="text-[10.5px] text-amber-600 hover:text-amber-800 font-semibold inline-flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
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
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Zone d'Installation
                </label>
                <button
                  type="button"
                  onClick={onOpenAddZoneModal}
                  className="text-[10.5px] text-purple-600 hover:text-purple-800 font-semibold inline-flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
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
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Technicien Référent
                </label>
                <button
                  type="button"
                  onClick={onOpenAddTechModal}
                  className="text-[10.5px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
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
            <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
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

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold"
            >
              Enregistrer la Machine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
