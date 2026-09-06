import { IMachineRepository } from '../../../domain/machines/repositories/IMachineRepository.js';
import { MachineEntity } from '../../../domain/machines/entities/MachineEntity.js';
import { DatabaseService } from '../../../core/database/DatabaseService.js';

export class MachineRepositoryImpl extends IMachineRepository {
  constructor() {
    super();
    this.db = new DatabaseService();
    this.storeName = 'machines';
  }

  async create(machine) {
    await this.db.save(this.storeName, machine);
    return machine;
  }

  async findById(id) {
    const row = await this.db.getById(this.storeName, id);
    if (!row) return null;
    return new MachineEntity(row);
  }

  async findAll(filters = {}) {
    const all = await this.db.getAll(this.storeName);
    let filtered = all;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        (item.designation || '').toLowerCase().includes(s) || 
        (item.id || '').toLowerCase().includes(s)
      );
    }
    return filtered.map(row => new MachineEntity(row));
  }

  async update(id, machine) {
    await this.db.save(this.storeName, machine);
    return machine;
  }

  async delete(id) {
    await this.db.delete(this.storeName, id);
  }
}
