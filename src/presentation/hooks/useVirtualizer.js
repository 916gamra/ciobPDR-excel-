import { useState, useEffect, useCallback } from 'react';

/**
 * useVirtualizer
 * Lightweight, high-performance table & list virtualization hook
 * Renders only visible rows + overscan buffer to handle 10,000+ items smoothly.
 */
export function useVirtualizer(options = {}) {
  const {
    count = 0,
    getScrollElement = () => null,
    estimateSize = () => 40,
    overscan = 6
  } = options;

  const [scrollOffset, setScrollOffset] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    const el = getScrollElement();
    if (!el) return;

    setContainerHeight(el.clientHeight || 600);

    const handleScroll = () => {
      setScrollOffset(el.scrollTop);
    };

    const handleResize = () => {
      setContainerHeight(el.clientHeight || 600);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [getScrollElement]);

  const itemSize = typeof estimateSize === 'function' ? estimateSize() : (estimateSize || 40);

  const getVirtualItems = useCallback(() => {
    if (count === 0) return [];

    const visibleCount = Math.ceil(containerHeight / itemSize);
    const startIndex = Math.max(0, Math.floor(scrollOffset / itemSize) - overscan);
    const endIndex = Math.min(count, startIndex + visibleCount + overscan * 2);

    const items = [];
    for (let i = startIndex; i < endIndex; i++) {
      items.push({
        key: i,
        index: i,
        start: i * itemSize,
        end: (i + 1) * itemSize,
        size: itemSize
      });
    }

    return items;
  }, [count, containerHeight, itemSize, scrollOffset, overscan]);

  const getTotalSize = useCallback(() => {
    return count * itemSize;
  }, [count, itemSize]);

  return {
    getVirtualItems,
    getTotalSize,
    scrollOffset
  };
}
