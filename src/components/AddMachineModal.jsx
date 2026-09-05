import React, { useState, useEffect } from 'react';
import { Factory, Plus, X, Boxes, Layers, MapPin, Users, Radio, Cpu } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs font-bold">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Nouvelle Machine Registered</h3>
              <p className="text-xs text-slate-500">
                Ajout d'un équipement au catalogue global (Liaison B→H)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Factory className="w-3 h-3 text-emerald-600" />
                <span>Code Machine (B)</span>
              </label>
              <input
                type="text"
                placeholder="ex: MCH-01"
                value={form.id_machine_registered}
                onChange={(e) => setForm({ ...form, id_machine_registered: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-mono font-bold uppercase focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-2xs transition"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-slate-500" />
                <span>Désignation (C)</span>
              </label>
              <input
                type="text"
                placeholder="ex: Ligne Ensacheuse 03"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-2xs transition"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Family with '+' Button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <Boxes className="w-3 h-3 text-cyan-600" />
                  <span>Famille (D)</span>
                </label>
                {onOpenAddFamilyModal && (
                  <button
                    type="button"
                    onClick={onOpenAddFamilyModal}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-0.5 cursor-pointer bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nouvelle</span>
                  </button>
                )}
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-600" />
                  <span>Template (E)</span>
                </label>
                {onOpenAddTemplateModal && (
                  <button
                    type="button"
                    onClick={onOpenAddTemplateModal}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-0.5 cursor-pointer bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nouveau</span>
                  </button>
                )}
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

          <div className="grid grid-cols-2 gap-3.5">
            {/* Zone with '+' Button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-purple-600" />
                  <span>Zone Défaut (F)</span>
                </label>
                {onOpenAddZoneModal && (
                  <button
                    type="button"
                    onClick={onOpenAddZoneModal}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-0.5 cursor-pointer bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nouvelle</span>
                  </button>
                )}
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-600" />
                  <span>Technicien (G)</span>
                </label>
                {onOpenAddTechModal && (
                  <button
                    type="button"
                    onClick={onOpenAddTechModal}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-0.5 cursor-pointer bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nouveau</span>
                  </button>
                )}
              </div>
              <CustomSelect
                value={form.technician}
                onChange={(val) => setForm({ ...form, technician: val })}
                options={technicians.map((t) => ({
                  value: t.id_technician,
                  label: `${t.nom} (${t.id_technician})`,
                }))}
                placeholder="-- Choisir Technicien --"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Radio className="w-3 h-3 text-slate-500" />
              <span>Statut Opérationnel (H)</span>
            </label>
            <CustomSelect
              value={form.status}
              onChange={(val) => setForm({ ...form, status: val })}
              options={[
                {
                  value: 'En Service',
                  label: 'En Service (Opérationnel)',
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
                  value: 'En Panne',
                  label: 'En Panne / Incident',
                  badge: 'Incident',
                  badgeColor: 'bg-rose-100 text-rose-800',
                },
                {
                  value: 'Arrêt',
                  label: 'Arrêt Machine',
                  badge: 'Arrêt',
                  badgeColor: 'bg-slate-100 text-slate-800',
                },
              ]}
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition shadow-xs cursor-pointer text-xs flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer la Machine</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
