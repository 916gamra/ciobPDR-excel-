import { Logger } from '../../../core/logger/LoggerService.js';

/**
 * Stock Calculation Service
 * ✅ حسابات المخزون مطابقة لـ Excel
 */
export class StockCalculationService {
  /**
   * Calculate total entrees for an article
   * ✅ مطابق لـ Excel SUMIFS formula
   */
  static calculateEntrees(ref, movements) {
    try {
      const entrees = movements
        .filter(m => m.ref === ref && m.type === 'Entrée')
        .reduce((sum, m) => sum + m.quantite, 0);
      
      Logger.debug('Entrees calculated', { ref, entrees });
      return entrees;
    } catch (error) {
      Logger.error('❌ Entrees calculation failed', error);
      return 0;
    }
  }

  /**
   * Calculate total sorties for an article
   * ✅ مطابق لـ Excel SUMIFS formula
   */
  static calculateSorties(ref, movements) {
    try {
      const sorties = movements
        .filter(m => m.ref === ref && m.type === 'Sortie')
        .reduce((sum, m) => sum + m.quantite, 0);
      
      Logger.debug('Sorties calculated', { ref, sorties });
      return sorties;
    } catch (error) {
      Logger.error('❌ Sorties calculation failed', error);
      return 0;
    }
  }

  /**
   * Calculate current stock
   * ✅ Formula: Initial + Entrees - Sorties
   */
  static calculateStockActuel(article, movements) {
    try {
      const entrees = this.calculateEntrees(article.ref, movements);
      const sorties = this.calculateSorties(article.ref, movements);
      const stockActuel = article.stockInitial + entrees - sorties;
      
      Logger.debug('Stock calculated', { 
        ref: article.ref, 
        initial: article.stockInitial,
        entrees,
        sorties,
        stockActuel 
      });
      
      return stockActuel;
    } catch (error) {
      Logger.error('❌ Stock calculation failed', error);
      return article.stockInitial;
    }
  }

  /**
   * Get alert status
   * ✅ Logic: RUPTURE (<=0), ALERTE (<=seuil), OK
   */
  static getAlertStatus(article, currentStock) {
    try {
      if (currentStock < 0) {
        Logger.warn('⚠️ Negative stock detected', { ref: article.ref, stock: currentStock });
        return 'RUPTURE';
      }

      if (currentStock === 0) {
        Logger.warn('⚠️ Zero stock', { ref: article.ref });
        return 'RUPTURE';
      }

      if (currentStock <= article.minThreshold) {
        Logger.info('ℹ️ Low stock alert', { 
          ref: article.ref, 
          stock: currentStock, 
          threshold: article.minThreshold 
        });
        return 'ALERTE';
      }

      return 'OK';
    } catch (error) {
      Logger.error('❌ Alert status calculation failed', error);
      return 'OK';
    }
  }

  /**
   * Verify calculations against expected values
   * ✅ للتحقق من دقة الحسابات
   */
  static async verifyCalculations(articles, movements) {
    try {
      const mismatches = [];

      for (const article of articles) {
        const calculatedStock = this.calculateStockActuel(article, movements);
        const calculatedAlert = this.getAlertStatus(article, calculatedStock);

        // Check for stock mismatches
        if (Math.abs(article.stockActuel - calculatedStock) > 0.01) {
          mismatches.push({
            ref: article.ref,
            field: 'stockActuel',
            expected: article.stockActuel,
            calculated: calculatedStock,
            difference: article.stockActuel - calculatedStock
          });
        }

        // Check for alert mismatches
        if (article.alerte !== calculatedAlert) {
          mismatches.push({
            ref: article.ref,
            field: 'alerte',
            expected: article.alerte,
            calculated: calculatedAlert
          });
        }
      }

      if (mismatches.length > 0) {
        Logger.error('❌ Calculation mismatches found', { count: mismatches.length, mismatches });
        return { isValid: false, mismatches };
      }

      Logger.info('✅ All calculations verified successfully');
      return { isValid: true, mismatches: [] };
    } catch (error) {
      Logger.error('❌ Verification failed', error);
      return { isValid: false, error: error.message };
    }
  }

  /**
   * Get stock statistics
   * ✅ للإحصائيات العامة
   */
  static getStockStatistics(articles, movements) {
    try {
      const stats = {
        totalArticles: articles.length,
        totalValue: 0,
        articlesInRupture: 0,
        articlesInAlerte: 0,
        articlesOK: 0,
        totalQuantity: 0,
        ruptureCost: 0,
        alerteCost: 0
      };

      for (const article of articles) {
        const currentStock = this.calculateStockActuel(article, movements);
        const status = this.getAlertStatus(article, currentStock);
        const value = currentStock * (article.unitPrice || 0);

        stats.totalValue += value;
        stats.totalQuantity += currentStock;

        if (status === 'RUPTURE') {
          stats.articlesInRupture++;
          stats.ruptureCost += value;
        } else if (status === 'ALERTE') {
          stats.articlesInAlerte++;
          stats.alerteCost += value;
        } else {
          stats.articlesOK++;
        }
      }

      Logger.info('✅ Stock statistics calculated', stats);
      return stats;
    } catch (error) {
      Logger.error('❌ Statistics calculation failed', error);
      return null;
    }
  }

  /**
   * Get articles by alert status
   */
  static getArticlesByStatus(articles, movements, status) {
    try {
      return articles.filter(article => {
        const currentStock = this.calculateStockActuel(article, movements);
        const articleStatus = this.getAlertStatus(article, currentStock);
        return articleStatus === status;
      });
    } catch (error) {
      Logger.error('❌ Failed to get articles by status', error);
      return [];
    }
  }
}
