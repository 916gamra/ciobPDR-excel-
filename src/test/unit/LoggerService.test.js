import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../../core/logger/LoggerService';

describe('LoggerService Unit Tests', () => {
  beforeEach(() => {
    Logger.setLevel(Logger.levels.DEBUG);
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log debug messages when level is DEBUG', () => {
    Logger.setLevel(Logger.levels.DEBUG);
    Logger.debug('Test debug message', { detail: 123 }, 'TestNS');
    expect(console.debug).toHaveBeenCalled();
  });

  it('should not log debug when level is INFO', () => {
    Logger.setLevel(Logger.levels.INFO);
    Logger.debug('Hidden debug', null, 'TestNS');
    expect(console.debug).not.toHaveBeenCalled();
  });

  it('should log info messages when level is INFO', () => {
    Logger.setLevel(Logger.levels.INFO);
    Logger.info('Test info message', null, 'TestNS');
    expect(console.info).toHaveBeenCalled();
  });

  it('should log warn messages when level is WARN or lower', () => {
    Logger.setLevel(Logger.levels.WARN);
    Logger.warn('Warning condition', { code: 404 }, 'TestNS');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should log error and fatal messages', () => {
    Logger.setLevel(Logger.levels.ERROR);
    Logger.error('Critical failure', new Error('DB Error'), 'TestNS');
    expect(console.error).toHaveBeenCalled();

    Logger.fatal('Fatal system breakdown', null, 'TestNS');
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it('should support instance logger with custom namespace', () => {
    Logger.setLevel(Logger.levels.INFO);
    const customLogger = new Logger('CustomService');
    customLogger.info('Instance info test');
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('[CustomService] [INFO] Instance info test'));
  });
});
