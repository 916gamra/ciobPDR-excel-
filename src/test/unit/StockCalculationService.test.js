import { describe, it, expect } from 'vitest';
import { StockCalculationService } from '../../domain/pdr/services/StockCalculationService.js';

describe('StockCalculationService', () => {
  const mockArticle = {
    id: 'art-1',
    ref: 'ROUL-6204',
    designation: 'Roulement 6204-2RS',
    stockInitial: 100,
    seuil: 10,
    unitPrice: 45
  };

  const mockMovements = [
    { id: 'm1', ref: 'ROUL-6204', type: 'Entrée', quantite: 50 },
    { id: 'm2', ref: 'ROUL-6204', type: 'Sortie', quantite: 30 },
    { id: 'm3', ref: 'ROUL-6204', type: 'Sortie', quantite: 20 },
    { id: 'm4', ref: 'COURR-B52', type: 'Entrée', quantite: 25 }
  ];

  describe('calculateEntrees', () => {
    it('should calculate total entrees correctly for given reference', () => {
      const entrees = StockCalculationService.calculateEntrees('ROUL-6204', mockMovements);
      expect(entrees).toBe(50);
    });

    it('should return 0 when no matching entrees exist', () => {
      const entrees = StockCalculationService.calculateEntrees('UNKNOWN-REF', mockMovements);
      expect(entrees).toBe(0);
    });
  });

  describe('calculateSorties', () => {
    it('should calculate total sorties correctly for given reference', () => {
      const sorties = StockCalculationService.calculateSorties('ROUL-6204', mockMovements);
      expect(sorties).toBe(50);
    });

    it('should return 0 when no matching sorties exist', () => {
      const sorties = StockCalculationService.calculateSorties('UNKNOWN-REF', mockMovements);
      expect(sorties).toBe(0);
    });
  });

  describe('calculateStockActuel', () => {
    it('should calculate stock according to formula: initial + entrees - sorties', () => {
      const stock = StockCalculationService.calculateStockActuel(mockArticle, mockMovements);
      expect(stock).toBe(100); // 100 + 50 - (30 + 20) = 100
    });

    it('should handle zero movements and retain initial stock', () => {
      const stock = StockCalculationService.calculateStockActuel(mockArticle, []);
      expect(stock).toBe(100);
    });

    it('should accurately calculate negative stock in case of surplus sorties', () => {
      const surplusMovements = [
        { id: 'm1', ref: 'ROUL-6204', type: 'Sortie', quantite: 150 }
      ];
      const stock = StockCalculationService.calculateStockActuel(mockArticle, surplusMovements);
      expect(stock).toBe(-50);
    });
  });

  describe('getAlertStatus', () => {
    it('should return RUPTURE for negative stock', () => {
      expect(StockCalculationService.getAlertStatus(mockArticle, -5)).toBe('RUPTURE');
    });

    it('should return RUPTURE for zero stock', () => {
      expect(StockCalculationService.getAlertStatus(mockArticle, 0)).toBe('RUPTURE');
    });

    it('should return ALERTE when stock is below or equal to seuil threshold', () => {
      expect(StockCalculationService.getAlertStatus(mockArticle, 10)).toBe('ALERTE');
      expect(StockCalculationService.getAlertStatus(mockArticle, 4)).toBe('ALERTE');
    });

    it('should return OK when stock is strictly above seuil threshold', () => {
      expect(StockCalculationService.getAlertStatus(mockArticle, 11)).toBe('OK');
      expect(StockCalculationService.getAlertStatus(mockArticle, 100)).toBe('OK');
    });
  });

  describe('verifyCalculations & Statistics', () => {
    it('should verify matching calculations without variance', () => {
      const articles = [{ ...mockArticle, stockActuel: 100, alerte: 'OK' }];
      const result = StockCalculationService.verifyCalculations(articles, mockMovements);
      expect(result.isValid).toBe(true);
      expect(result.mismatchCount).toBe(0);
    });

    it('should detect mismatches when recorded stock diverges from formula', () => {
      const corruptedArticles = [{ ...mockArticle, stockActuel: 999, alerte: 'OK' }];
      const result = StockCalculationService.verifyCalculations(corruptedArticles, mockMovements);
      expect(result.isValid).toBe(false);
      expect(result.mismatchCount).toBe(1);
    });

    it('should compute comprehensive stock statistics', () => {
      const stats = StockCalculationService.getStockStatistics([mockArticle], mockMovements);
      expect(stats.totalArticles).toBe(1);
      expect(stats.totalQuantity).toBe(100);
      expect(stats.totalValue).toBe(4500); // 100 * 45
      expect(stats.articlesOK).toBe(1);
      expect(stats.articlesInAlerte).toBe(0);
      expect(stats.articlesInRupture).toBe(0);
    });
  });
});
