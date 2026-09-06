export class ITaskRepository {
  async create(task) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async findAll(filters = {}) { throw new Error('Not implemented'); }
  async update(id, task) { throw new Error('Not implemented'); }
  async delete(id) { throw new Error('Not implemented'); }
}
