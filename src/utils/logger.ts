/**
 * Centralized logging utility for the plugin
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private static instance: Logger
  private logLevel: LogLevel = LogLevel.INFO
  private prefix = '[Left-Sidebar-Enhance]'

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel
  }

  private formatMessage(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString()
    const fullMessage = `${this.prefix} [${timestamp}] [${level}] ${message}`
    
    if (data !== undefined) {
      console.log(fullMessage, data)
    } else {
      console.log(fullMessage)
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.formatMessage('DEBUG', message, data)
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.formatMessage('INFO', message, data)
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.formatMessage('WARN', message, data)
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.formatMessage('ERROR', message, error)
    }
  }

  /**
   * Logs function execution time
   */
  async measureTime<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.debug(`${operation} completed in ${duration.toFixed(2)}ms`)
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.error(`${operation} failed after ${duration.toFixed(2)}ms`, error)
      throw error
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance()