type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private level: LogLevel = "info";

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ["debug", "info", "warn", "error"];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog("debug")) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog("info")) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog("warn")) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog("error")) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}

const logger = new Logger();
export default logger;
