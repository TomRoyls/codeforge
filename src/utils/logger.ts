export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

export interface LoggerOptions {
  level: LogLevel
  prefix?: string
  timestamp?: boolean
  colorize?: boolean
}

const COLORS = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
}

const LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: COLORS.cyan,
  [LogLevel.INFO]: COLORS.blue,
  [LogLevel.WARN]: COLORS.yellow,
  [LogLevel.ERROR]: COLORS.red,
  [LogLevel.SILENT]: COLORS.reset,
}

const LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.SILENT]: 'SILENT',
}

function safeStringify(value: unknown): string {
  const seen = new WeakSet()

  const tryStringify = (val: unknown): string => {
    if (val === null) return 'null'
    if (val === undefined) return 'undefined'

    if (typeof val === 'string') return val
    if (typeof val === 'number' || typeof val === 'boolean') return String(val)

    if (typeof val === 'object') {
      if (seen.has(val as object)) return '[Circular]'
      seen.add(val as object)

      if (Array.isArray(val)) {
        try {
          return val.map((item) => tryStringify(item)).join(', ')
        } catch {
          return '[Array]'
        }
      }

      try {
        return JSON.stringify(
          val,
          (_key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) return '[Circular]'
              seen.add(value)
            }
            return value
          },
          2,
        )
      } catch {
        return '[Object]'
      }
    }

    return String(val)
  }

  return tryStringify(value)
}

function formatArgs(...args: unknown[]): string {
  return args.map((arg) => safeStringify(arg)).join(' ')
}

function getTimestamp(): string {
  return new Date().toISOString()
}

export class Logger {
  private level: LogLevel
  private prefix: string
  private showTimestamp: boolean
  private colorize: boolean

  constructor(options: LoggerOptions) {
    this.level = options.level
    this.prefix = options.prefix ?? ''
    this.showTimestamp = options.timestamp ?? false
    this.colorize = options.colorize ?? true
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (level < this.level || level === LogLevel.SILENT) {
      return
    }

    let output = ''

    if (this.showTimestamp) {
      const timestamp = getTimestamp()
      output += this.colorize ? `${COLORS.dim}${timestamp}${COLORS.reset} ` : `${timestamp} `
    }

    const levelName = LEVEL_NAMES[level]
    const color = this.colorize ? LEVEL_COLORS[level] : ''
    const reset = this.colorize ? COLORS.reset : ''
    output += `${color}[${levelName}]${reset} `

    if (this.prefix) {
      output += `${COLORS.bold}${this.prefix}${reset} `
    }

    output += message

    const argsString = formatArgs(...args)
    if (argsString) {
      output += ` ${argsString}`
    }

    switch (level) {
      case LogLevel.ERROR:
        console.error(output)
        break
      case LogLevel.WARN:
        console.warn(output)
        break
      default:
        console.log(output)
        break
    }
  }

  public debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, ...args)
  }

  public info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, message, ...args)
  }

  public warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, message, ...args)
  }

  public error(message: string, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, message, ...args)
  }

  public setLevel(level: LogLevel): void {
    this.level = level
  }

  public getLevel(): LogLevel {
    return this.level
  }
}

export const logger = new Logger({
  level: LogLevel.INFO,
  timestamp: true,
  colorize: true,
})
