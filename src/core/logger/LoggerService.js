export class Logger {
  static levels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
  };

  static currentLevel = Logger.levels.INFO;

  static debug(message, data = {}) {
    if (Logger.currentLevel <= Logger.levels.DEBUG) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }

  static info(message, data = {}) {
    if (Logger.currentLevel <= Logger.levels.INFO) {
      console.log(`[INFO] ${message}`, data);
    }
  }

  static warn(message, data = {}) {
    if (Logger.currentLevel <= Logger.levels.WARN) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  static error(message, data = {}) {
    if (Logger.currentLevel <= Logger.levels.ERROR) {
      console.error(`[ERROR] ${message}`, data);
    }
  }

  static fatal(message, data = {}) {
    if (Logger.currentLevel <= Logger.levels.FATAL) {
      console.error(`[FATAL] ${message}`, data);
    }
  }
}
