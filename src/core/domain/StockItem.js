export class StockItem {
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
    return `${this.initial} + ${this.entrees} - ${this.sorties} = ${this.getActuel()}`;
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
}