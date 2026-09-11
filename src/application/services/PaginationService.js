export class PaginationService {
  /**
   * Paginate an array in-memory
   */
  static paginateArray(items = [], page = 1, limit = 50) {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, parseInt(limit, 10) || 50);
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    const effectivePage = Math.min(safePage, totalPages);
    const offset = (effectivePage - 1) * safeLimit;

    const data = items.slice(offset, offset + safeLimit);
    const hasMore = effectivePage < totalPages;
    const hasPrev = effectivePage > 1;

    return {
      data,
      pagination: {
        page: effectivePage,
        limit: safeLimit,
        total,
        totalPages,
        hasMore,
        hasPrev,
        offset
      }
    };
  }

  /**
   * Get safe next page
   */
  static getNextPage(currentPage, totalPages) {
    if (currentPage >= totalPages) return null;
    return currentPage + 1;
  }

  /**
   * Get safe previous page
   */
  static getPreviousPage(currentPage) {
    if (currentPage <= 1) return null;
    return currentPage - 1;
  }
}
