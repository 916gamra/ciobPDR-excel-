import { Logger } from '../../../core/logger/LoggerService.js';

/**
 * StockCalculationService
 * Excel Twin Model: Exact replica of Excel SUMIFS & Stock status logic
 * Ref: GMAO_Light_Template_V2_Formules.xlsx
 */
export class StockCalculationService {
  /**
   * Calculate total entrees for an article (Excel: SUMIFS(Mouvements[Quantite], Mouvements[Ref], [@Ref], Mouvements[Type], "Entrée"))
   */
  static calculateEntrees(ref, movements = []) {
    if (!ref || !Array.isArray(movements)) return 0;
    const cleanRef = String(ref).trim().toUpperCase();
    return movements
      .filter((m) => {
        const mRef = String(m.ref || m.id_part || '').trim().toUpperCase();
        const mType = String(m.type || '').trim().toLowerCase();
        return mRef === cleanRef && (mType.includes('entrée') || mType.includes('entree') || mType === 'in');
      })
      .reduce((sum, m) => sum + (parseFloat(m.quantite) || 0), 0);
  }

  /**
   * Calculate total sorties for an article (Excel: SUMIFS(Mouvements[Quantite], Mouvements[Ref], [@Ref], Mouvements[Type], "Sortie"))
   */
  static calculateSorties(ref, movements = []) {
    if (!ref || !Array.isArray(movements)) return 0;
    const cleanRef = String(ref).trim().toUpperCase();
    return movements
      .filter((m) => {
        const mRef = String(m.ref || m.id_part || '').trim().toUpperCase();
        const mType = String(m.type || '').trim().toLowerCase();
        return mRef === cleanRef && (mType.includes('sortie') || mType === 'out');
      })
      .reduce((sum, m) => sum + (parseFloat(m.quantite) || 0), 0);
  }

  /**
   * Calculate current stock: stockActuel = stockInitial + entrees - sorties
   */
  static calculateStockActuel(article, movements = []) {
    if (!article) return 0;
    const initial = parseFloat(article.stockInitial ?? article.stock_initial ?? 0) || 0;
    const entrees = this.calculateEntrees(article.ref, movements);
    const sorties = this.calculateSorties(article.ref, movements);
    return Math.round((initial + entrees - sorties) * 100) / 100;
  }

  /**
   * Get alert status according to Excel formula:
   * IF(stockActuel <= 0, "RUPTURE", IF(stockActuel <= seuil, "ALERTE", "OK"))
   */
  static getAlertStatus(article, currentStock = null) {
    if (!article) return 'OK';
    const stock = currentStock !== null ? currentStock : (parseFloat(article.stockActuel) || 0);
    const seuil = parseFloat(article.seuil ?? article.minThreshold ?? 5) || 0;

    if (stock < 0) {
      Logger.warn(`[StockCalculationService] Negative stock detected for ${article.ref}: ${stock}`);
      return 'RUPTURE';
    }
    if (stock === 0) {
      return 'RUPTURE';
    }
    if (stock <= seuil) {
      return 'ALERTE';
    }
    return 'OK';
  }

  /**
   * Verify calculations against Excel data model
   */
  static verifyCalculations(articles = [], movements = []) {
    const mismatches = [];

    for (const article of articles) {
      const calculatedStock = this.calculateStockActuel(article, movements);
      const calculatedAlert = this.getAlertStatus(article, calculatedStock);

      const recordedStock = parseFloat(article.stockActuel ?? 0);
      if (Math.abs(recordedStock - calculatedStock) > 0.001) {
        mismatches.push({
          ref: article.ref,
          field: 'stockActuel',
          recorded: recordedStock,
          calculated: calculatedStock,
          difference: recordedStock - calculatedStock
        });
      }

      if (article.alerte && article.alerte !== calculatedAlert) {
        mismatches.push({
          ref: article.ref,
          field: 'alerte',
          recorded: article.alerte,
          calculated: calculatedAlert
        });
      }
    }

    if (mismatches.length > 0) {
      Logger.warn(`[StockCalculationService] Found ${mismatches.length} calculation variance(s)`, mismatches);
    } else {
      Logger.info('✅ [StockCalculationService] All calculations matched Excel specifications perfectly');
    }

    return {
      isValid: mismatches.length === 0,
      totalChecked: articles.length,
      mismatchCount: mismatches.length,
      mismatches
    };
  }

  /**
   * Get stock statistics & aggregate metrics
   */
  static getStockStatistics(articles = [], movements = []) {
    const stats = {
      totalArticles: articles.length,
      totalQuantity: 0,
      totalValue: 0,
      articlesInRupture: 0,
      articlesInAlerte: 0,
      articlesOK: 0
    };

    for (const article of articles) {
      const currentStock = this.calculateStockActuel(article, movements);
      const status = this.getAlertStatus(article, currentStock);
      const unitPrice = parseFloat(article.unitPrice ?? article.prix_unitaire ?? 0) || 0;

      stats.totalQuantity += currentStock;
      stats.totalValue += currentStock * unitPrice;

      if (status === 'RUPTURE') stats.articlesInRupture++;
      else if (status === 'ALERTE') stats.articlesInAlerte++;
      else stats.articlesOK++;
    }

    return stats;
  }
}
