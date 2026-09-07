/**
 * محسّن الصيغ مع Indexing
 * يحسّن الأداء مع البيانات الكبيرة ومحاكاة معادلات الإكسيل
 */

export class FormulaOptimizer {
  constructor() {
    this.mouvementsIndex = new Map();
    this.articlesIndex = new Map();
    this.cache = new Map();
  }

  /**
   * بناء الـ index للحركات
   */
  buildMouvementsIndex(mouvements = []) {
    this.mouvementsIndex.clear();
    
    for (const m of mouvements) {
      const key = m.ref;
      if (!key) continue;
      if (!this.mouvementsIndex.has(key)) {
        this.mouvementsIndex.set(key, {
          entrees: [],
          sorties: [],
          all: []
        });
      }
      
      const index = this.mouvementsIndex.get(key);
      index.all.push(m);
      
      if (m.type === 'Entrée' || m.type === 'Entree' || m.type === 'Entrée Interne' || m.type === 'Entrée Externe') {
        index.entrees.push(m);
      } else if (m.type === 'Sortie' || m.type === 'Sortie Interne' || m.type === 'Bon de Sortie' || m.type === 'Sortie Externe') {
        index.sorties.push(m);
      }
    }
  }

  /**
   * حساب الـ Entrées بسرعة
   */
  calculateEntrees(ref) {
    const cacheKey = `entrees_${ref}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const index = this.mouvementsIndex.get(ref);
    if (!index) return 0;

    const sum = index.entrees.reduce(
      (total, m) => total + (Number(m.quantite) || 0),
      0
    );

    this.cache.set(cacheKey, sum);
    return sum;
  }

  /**
   * حساب الـ Sorties بسرعة
   */
  calculateSorties(ref) {
    const cacheKey = `sorties_${ref}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const index = this.mouvementsIndex.get(ref);
    if (!index) return 0;

    const sum = index.sorties.reduce(
      (total, m) => total + (Number(m.quantite) || 0),
      0
    );

    this.cache.set(cacheKey, sum);
    return sum;
  }

  /**
   * حساب المخزون الحالي
   */
  calculateStock(article) {
    const ref = article.ref || article.code;
    const cacheKey = `stock_${ref}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const entrees = this.calculateEntrees(ref);
    const sorties = this.calculateSorties(ref);
    const stock = Number(article.stockInitial || article.stock_initial || 0) + entrees - sorties;

    this.cache.set(cacheKey, stock);
    return Math.max(0, stock);
  }

  /**
   * حساب جميع الأسهم
   */
  calculateAllStocks(articles = []) {
    return articles.map(article => {
      const ref = article.ref || article.code;
      const entrees = this.calculateEntrees(ref);
      const sorties = this.calculateSorties(ref);
      const stockActuel = Number(article.stockInitial || article.stock_initial || 0) + entrees - sorties;
      const finalStock = Math.max(0, stockActuel);
      const seuil = Number(article.seuil || 0);

      let alerte = 'OK';
      if (finalStock <= 0) alerte = 'RUPTURE';
      else if (finalStock <= seuil) alerte = 'ALERTE';

      return {
        ...article,
        entrees,
        sorties,
        stockActuel: finalStock,
        alerte
      };
    });
  }

  /**
   * مسح الـ cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * الحصول على إحصائيات الـ cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      mouvementsIndexSize: this.mouvementsIndex.size
    };
  }
}

export default FormulaOptimizer;
