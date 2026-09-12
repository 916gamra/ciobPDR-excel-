const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src/core/domain');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(path.join(dir, 'Zone.js'), `export class Zone {
  constructor(data) {
    this.code = data.id_zone || data.code;
    this.libelle = data.libelle;
    this.philosophie = data.description || data.philosophie || 'Aucune philosophie définie';
  }

  getPhilosophie() { 
    return this.philosophie; 
  }

  getMachines(allMachines) { 
    return allMachines.filter(m => m.id_zone_default === this.code); 
  }

  getMachinesCount(allMachines) {
    return this.getMachines(allMachines).length;
  }

  getTechnicians(allTechs) { 
    return allTechs.filter(t => t.id_zone === this.code); 
  }

  getTechniciansCount(allTechs) {
    return this.getTechnicians(allTechs).length;
  }

  getPDRConsomme(machines, mouvements) {
    const machinesInZone = this.getMachines(machines).map(m => m.id_machine_registered);
    return mouvements.filter(m => machinesInZone.includes(m.id_machine_registered));
  }
}`);

fs.writeFileSync(path.join(dir, 'StockItem.js'), `export class StockItem {
  constructor(data) {
    this.id = data.id_article || data.id || data.ref;
    this.initial = Number(data.stockInitial) || 0;
    this.entrees = Number(data.entrees) || 0;
    this.sorties = Number(data.sorties) || 0;
    this.seuil = Number(data.seuil) || 0;
  }

  getActuel() { 
    return this.initial + this.entrees - this.sorties; 
  }

  getSeuilAlerte() {
    return this.seuil;
  }

  getFormule() {
    return \`\${this.initial} + \${this.entrees} - \${this.sorties} = \${this.getActuel()}\`;
  }

  isBelowSeuil() { 
    return this.getActuel() <= this.seuil; 
  }

  getCriticite() { 
    if(this.getActuel() <= 0) return 'RUPTURE'; 
    if(this.isBelowSeuil()) return 'ALERTE'; 
    return 'OK'; 
  }

  isUsedInBlueprint(blueprint) {
    if (!blueprint || !blueprint.pdr_theoriques) return false;
    return blueprint.pdr_theoriques.some(p => p.id_pdr === this.id); 
  }
}`);

fs.writeFileSync(path.join(dir, 'Blueprint.js'), `export class Blueprint {
  constructor(data) {
    this.id = data.id_blueprint || data.id;
    this.specs = data.specs || {}; 
    this.components_theoriques = data.components_theoriques || []; 
    this.parts_theoriques = data.parts_theoriques || []; 
    this.pdr_theoriques = data.pdr_theoriques || []; 
  }

  isSameSpecs(other) {
    const clean = (s) => Object.fromEntries(Object.entries(s || {}).filter(([_, v]) => v != null && String(v).trim() !== ''));
    return JSON.stringify(clean(this.specs)) === JSON.stringify(clean(other.specs));
  }

  isTwin(other) {
    const key = (arr, field) => JSON.stringify([...(arr || [])].map(x => ({id: String(x[field] || '').trim(), q: Number(x.qte || 1)})).sort((a, b) => a.id.localeCompare(b.id)));
    return this.isSameSpecs(other) &&
           key(this.components_theoriques, 'id_component') === key(other.components_theoriques || other.components_reels, 'id_component') &&
           key(this.parts_theoriques, 'id_part') === key(other.parts_theoriques || other.parts_reels, 'id_part') &&
           key(this.pdr_theoriques, 'id_pdr') === key(other.pdr_theoriques || other.pdr_historique, 'id_pdr');
  }

  extractFromNexus(machine, mouvements) {
    const related = mouvements.filter(m => m.id_machine_registered === machine.id_machine_registered);
    this.components_theoriques = machine.components_reels || [];
    this.pdr_theoriques = related.map(m => ({ id_pdr: m.ref || m.id_article, qte: 1, criticite: 'Moyenne' }));
  }

  getMachinesLiees(machines) {
    return machines.filter(m => m.id_blueprint === this.id);
  }

  getMachinesLieesCount(machines) {
    return this.getMachinesLiees(machines).length;
  }

  getBOMSummary() {
    return \`Comp:\${this.components_theoriques.length} Parts:\${this.parts_theoriques.length} PDR:\${this.pdr_theoriques.length}\`;
  }
}`);

fs.writeFileSync(path.join(dir, 'Machine.js'), `export class Machine {
  constructor(data) {
    this.id_machine_registered = data.id_machine_registered || data.id;
    this.id_family = data.id_family;
    this.id_templates = data.id_templates;
    this.id_blueprint = data.id_blueprint;
    this.components_reels = data.components_reels || [];
  }

  getPDRHistory(mouvements) {
    return mouvements.filter(m => m.id_machine_registered === this.id_machine_registered && String(m.type || '').toLowerCase().includes('sortie'));
  }

  getComponentsReels() {
    return this.components_reels;
  }

  hasBlueprint() {
    return !!this.id_blueprint;
  }

  getBlueprint() {
    return this.hasBlueprint() ? \`BPT lié: \${this.id_blueprint}\` : 'Sans Blueprint - Machine neuve';
  }

  getEvolution() {
    if (!this.hasBlueprint() && this.components_reels.length === 0) return 'Jour 1 : Famille + Modèle (Neuve)';
    if (!this.hasBlueprint() && this.components_reels.length > 0) return 'En cours de découverte (Tabs accumulés)';
    return 'Documentée avec Blueprint';
  }

  findTwins(allMachines) {
    return allMachines.filter(m => m.id_machine_registered !== this.id_machine_registered && m.id_family === this.id_family && m.id_templates === this.id_templates);
  }
}`);

fs.writeFileSync(path.join(dir, 'CompTemplate.js'), `export class CompTemplate {
  constructor(data) {
    this.id = data.id_comp_template || data.id;
    this.id_comp_family = data.id_comp_family;
  }

  getParts(allParts) {
    return allParts.filter(p => p.id_comp_template === this.id);
  }

  isUsedInBlueprint(blueprint) {
    if (!blueprint || !blueprint.components_theoriques) return false;
    return blueprint.components_theoriques.some(c => c.id_component === this.id);
  }
}`);

fs.writeFileSync(path.join(dir, 'Technician.js'), `export class Technician {
  constructor(data) {
    this.id_technician = data.id_technician || data.id;
    this.nom = data.nom;
    this.id_zone = data.id_zone;
  }

  getZone(zones) {
    return zones.find(z => z.id_zone === this.id_zone);
  }

  getMachinesResponsable(machines) {
    return machines.filter(m => m.technician === this.id_technician || m.technician === this.nom);
  }

  getInterventions(mouvements) {
    return mouvements.filter(m => m.technicien === this.nom || m.technicien === this.id_technician);
  }
}`);

fs.writeFileSync(path.join(dir, 'CompFamily.js'), `export class CompFamily {
  constructor(data) {
    this.id = data.id_family || data.id_comp_family;
    this.libelle = data.libelle;
  }
  
  getTemplates(allTemplates) {
    return allTemplates.filter(t => t.id_comp_family === this.id);
  }
}`);

fs.writeFileSync(path.join(dir, 'EntrepotItem.js'), `export class EntrepotItem {
  constructor(data) {
    this.id = data.id_warehouse_item || data.id || data.id_part;
    this.designation = data.designation;
    this.qte = Number(data.qte) || 0;
    this.category = data.category || 'PARTIE';
  }
  
  getStockActuel() { 
    return this.qte; 
  }
  
  isUsedInMachines(machines) {
    return machines.some(m =>
      (m.components_reels || []).some(c => c.id_component === this.id)
    );
  }
}`);

fs.writeFileSync(path.join(dir, 'Mouvement.js'), `export class Mouvement {
  constructor(data) {
    this.id = data.id || data.code_bon;
    this.type = data.type || '';
    this.action_id = data.action_id;
    this.id_machine_registered = data.id_machine_registered;
    this.ref = data.ref || data.id_article;
    this.qte = Number(data.quantite || data.qte) || 0;
    this.date = data.date;
    this.technicien = data.technicien;
  }
  
  isSortie() { 
    return String(this.type).toLowerCase().includes('sortie'); 
  }
  
  isEntree() { 
    return String(this.type).toLowerCase().includes('entrée') || String(this.type).toLowerCase().includes('entree'); 
  }
}`);

fs.writeFileSync(path.join(dir, 'index.js'), `export { Zone } from './Zone.js';
export { StockItem } from './StockItem.js';
export { Blueprint } from './Blueprint.js';
export { Machine } from './Machine.js';
export { CompTemplate } from './CompTemplate.js';
export { Technician } from './Technician.js';
export { CompFamily } from './CompFamily.js';
export { EntrepotItem } from './EntrepotItem.js';
export { Mouvement } from './Mouvement.js';
`);

