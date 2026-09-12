/**
 * Enterprise Centralized Logger Service for CIOB GMAO
 * Provides structured logging with levels (DEBUG, INFO, WARN, ERROR, FATAL)
 * Respects environment constraints and integrates with IndexedDB/ErrorTracker for telemetry.
 */
export class Logger {
  static levels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4,
  };

  // Determine current log level (default INFO in production, DEBUG in development)
  static currentLevel =
    typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'
      ? Logger.levels.WARN
      : Logger.levels.INFO;

  static setLevel(level) {
    if (typeof level === 'number') {
      Logger.currentLevel = level;
    } else if (typeof level === 'string' && Logger.levels[level.toUpperCase()] !== undefined) {
      Logger.currentLevel = Logger.levels[level.toUpperCase()];
    }
  }

  static formatPrefix(namespace = 'GMAO') {
    return `[${namespace}]`;
  }

  static debug(message, data = null, namespace = 'GMAO') {
    if (Logger.currentLevel <= Logger.levels.DEBUG) {
      if (data !== null && data !== undefined) {
        console.debug(`${Logger.formatPrefix(namespace)} [DEBUG] ${message}`, data);
      } else {
        console.debug(`${Logger.formatPrefix(namespace)} [DEBUG] ${message}`);
      }
    }
  }

  static info(message, data = null, namespace = 'GMAO') {
    if (Logger.currentLevel <= Logger.levels.INFO) {
      if (data !== null && data !== undefined) {
        console.info(`${Logger.formatPrefix(namespace)} [INFO] ${message}`, data);
      } else {
        console.info(`${Logger.formatPrefix(namespace)} [INFO] ${message}`);
      }
    }
  }

  static warn(message, data = null, namespace = 'GMAO') {
    if (Logger.currentLevel <= Logger.levels.WARN) {
      if (data !== null && data !== undefined) {
        console.warn(`${Logger.formatPrefix(namespace)} [WARN] ${message}`, data);
      } else {
        console.warn(`${Logger.formatPrefix(namespace)} [WARN] ${message}`);
      }
    }
  }

  static error(message, data = null, namespace = 'GMAO') {
    if (Logger.currentLevel <= Logger.levels.ERROR) {
      if (data !== null && data !== undefined) {
        console.error(`${Logger.formatPrefix(namespace)} [ERROR] ${message}`, data);
      } else {
        console.error(`${Logger.formatPrefix(namespace)} [ERROR] ${message}`);
      }
    }
  }

  static fatal(message, data = null, namespace = 'GMAO') {
    if (Logger.currentLevel <= Logger.levels.FATAL) {
      if (data !== null && data !== undefined) {
        console.error(`${Logger.formatPrefix(namespace)} [FATAL] ${message}`, data);
      } else {
        console.error(`${Logger.formatPrefix(namespace)} [FATAL] ${message}`);
      }
    }
  }

  static table(data, namespace = 'GMAO') {
    if (Logger.currentLevel <= Logger.levels.INFO) {
      if (typeof console !== 'undefined' && console.table) {
        console.table(data);
      } else if (typeof console !== 'undefined' && console.log) {
        console.log(`${Logger.formatPrefix(namespace)} [TABLE]`, data);
      }
    }
  }

  static group(label, namespace = 'GMAO') {
    if (Logger.currentLevel <= Logger.levels.INFO) {
      if (typeof console !== 'undefined' && console.group) {
        console.group(`${Logger.formatPrefix(namespace)} ${label}`);
      }
    }
  }

  static groupEnd() {
    if (Logger.currentLevel <= Logger.levels.INFO) {
      if (typeof console !== 'undefined' && console.groupEnd) {
        console.groupEnd();
      }
    }
  }

  // Instance adapter for object-oriented consumers (e.g. new Logger('SyncQueue'))
  constructor(namespace = 'GMAO') {
    this.namespace = namespace;
  }

  debug(msg, data) {
    Logger.debug(msg, data, this.namespace);
  }

  info(msg, data) {
    Logger.info(msg, data, this.namespace);
  }

  warn(msg, data) {
    Logger.warn(msg, data, this.namespace);
  }

  error(msg, data) {
    Logger.error(msg, data, this.namespace);
  }

  fatal(msg, data) {
    Logger.fatal(msg, data, this.namespace);
  }
}

export const logger = new Logger('GMAO');
export default logger;
