/**
 * Data Retention Service for cleaning up old logs and cache
 */
export class DataRetentionService {
  static cleanOldLogs(retentionDays = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    try {
      const logs = JSON.parse(localStorage.getItem('gmao_audit_logs') || '[]');
      const filtered = logs.filter(l => new Date(l.timestamp || l.date) >= cutoffDate);
      localStorage.setItem('gmao_audit_logs', JSON.stringify(filtered));
      return logs.length - filtered.length;
    } catch (e) {
      console.error('Error cleaning logs:', e);
      return 0;
    }
  }
}
