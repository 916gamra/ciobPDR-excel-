import { describe, it, expect } from 'vitest';
import { PaginationService } from '../../application/services/PaginationService.js';

describe('PaginationService', () => {
  const mockItems = Array.from({ length: 125 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

  it('should paginate items with default and custom limits', () => {
    const page1 = PaginationService.paginateArray(mockItems, 1, 50);
    expect(page1.data.length).toBe(50);
    expect(page1.pagination.page).toBe(1);
    expect(page1.pagination.total).toBe(125);
    expect(page1.pagination.totalPages).toBe(3);
    expect(page1.pagination.hasMore).toBe(true);
    expect(page1.pagination.hasPrev).toBe(false);

    const page3 = PaginationService.paginateArray(mockItems, 3, 50);
    expect(page3.data.length).toBe(25);
    expect(page3.pagination.page).toBe(3);
    expect(page3.pagination.hasMore).toBe(false);
    expect(page3.pagination.hasPrev).toBe(true);
  });

  it('should handle edge cases like out-of-bounds page or empty array', () => {
    const emptyResult = PaginationService.paginateArray([], 1, 50);
    expect(emptyResult.data.length).toBe(0);
    expect(emptyResult.pagination.total).toBe(0);
    expect(emptyResult.pagination.totalPages).toBe(1);

    const overflowResult = PaginationService.paginateArray(mockItems, 999, 50);
    expect(overflowResult.pagination.page).toBe(3);
    expect(overflowResult.data.length).toBe(25);
  });

  it('should calculate next and previous page numbers', () => {
    expect(PaginationService.getNextPage(1, 5)).toBe(2);
    expect(PaginationService.getNextPage(5, 5)).toBeNull();
    expect(PaginationService.getPreviousPage(3)).toBe(2);
    expect(PaginationService.getPreviousPage(1)).toBeNull();
  });
});
