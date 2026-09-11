import { describe, it, expect } from 'vitest';
import { MachineEntity } from '../../domain/machines/entities/MachineEntity';
import { SparePartEntity } from '../../domain/pdr/entities/SparePartEntity';
import { TaskEntity } from '../../domain/maintenance/entities/TaskEntity';

describe('Domain Entities Unit Tests', () => {
  describe('MachineEntity', () => {
    it('should construct a MachineEntity with valid attributes', () => {
      const machine = new MachineEntity({
        id: 'MCH-01',
        id_machine_registered: 'MCH-01',
        designation: 'Tour Parallèle 01',
        id_family: 'USI',
        id_templates: 'TPL-TRP',
        id_zone_default: 'ZONE-01',
        status: 'En service',
      });

      expect(machine.id).toBe('MCH-01');
      expect(machine.id_machine_registered).toBe('MCH-01');
      expect(machine.designation).toBe('Tour Parallèle 01');
      expect(machine.status).toBe('En service');
    });

    it('should validate status default or custom property', () => {
      const machine = new MachineEntity({
        id: 'MCH-02',
        status: 'En maintenance',
      });
      expect(machine.status).toBe('En maintenance');
    });
  });

  describe('SparePartEntity', () => {
    it('should construct a SparePartEntity and calculate alert status correctly', () => {
      const part = new SparePartEntity({
        id: 'SP-01',
        ref: 'ROUL-6204',
        designation: 'Roulement 6204',
        stockInitial: 10,
        entrees: 0,
        sorties: 8,
        seuil: 5,
        emplacement: 'A1-R2',
      });

      expect(part.ref).toBe('ROUL-6204');
      expect(part.stockActuel).toBe(2);
      expect(part.alerte).toBe('ALERTE');
      expect(part.isLowStock()).toBe(true);
    });

    it('should return RUPTURE when stockActuel <= 0', () => {
      const part = new SparePartEntity({
        stockInitial: 5,
        sorties: 5,
        seuil: 2,
      });
      expect(part.stockActuel).toBe(0);
      expect(part.calculateAlert()).toBe('RUPTURE');
    });
  });

  describe('TaskEntity', () => {
    it('should construct a TaskEntity with action and code_bon', () => {
      const task = new TaskEntity({
        id: 'TSK-01',
        code_bon: 'Bon-001',
        ref: 'ROUL-6204',
        type: 'Sortie Interne',
        action_id: 'CORRECTIVE',
        quantite: 2,
        technicien: 'Rachid',
      });

      expect(task.id).toBe('TSK-01');
      expect(task.code_bon).toBe('Bon-001');
      expect(task.quantite).toBe(2);
      expect(task.action_id).toBe('CORRECTIVE');
    });
  });
});
