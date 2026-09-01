/**
 * نظام مراقبة الأداء
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  /**
   * قياس مدة تنفيذ دالة
   */
  async measure(name, fn) {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;

      this.recordMetric(name, duration, 'success');

      if (duration > 1000) {
        console.warn(`⚠️ ${name} استغرق ${duration.toFixed(2)}ms`);
      } else {
        // console.log(`✅ ${name} استغرق ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, 'error');
      throw error;
    }
  }

  /**
   * تسجيل المقياس
   */
  recordMetric(name, duration, status) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name).push({
      duration,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * الحصول على إحصائيات
   */
  getStats(name) {
    const metrics = this.metrics.get(name) || [];
    if (metrics.length === 0) return null;

    const durations = metrics.map((m) => m.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return { avg, min, max, count: metrics.length };
  }

  /**
   * طباعة التقرير
   */
  printReport() {
    console.table(
      Array.from(this.metrics.entries()).map(([name, metrics]) => ({
        الاسم: name,
        'المتوسط (ms)': this.getStats(name)?.avg.toFixed(2),
        'الحد الأدنى (ms)': this.getStats(name)?.min.toFixed(2),
        'الحد الأقصى (ms)': this.getStats(name)?.max.toFixed(2),
        العدد: this.getStats(name)?.count,
      }))
    );
  }
}

export const monitor = new PerformanceMonitor();
