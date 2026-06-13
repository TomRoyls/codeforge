export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: number
  meta?: Record<string, unknown>
}

export class LoggerUtils2 {
  private level: LogLevel = 'info'
  private entries: LogEntry[] = []
  private handlers: ((entry: LogEntry) => void)[] = []

  private static levels: Record<LogLevel, number> = {
    trace: 0, debug: 1, info: 2, warn: 3, error: 4, fatal: 5,
  }

  setLevel(level: LogLevel): this {
    this.level = level
    return this
  }

  getLevel(): LogLevel { return this.level }

  private shouldLog(level: LogLevel): boolean {
    return LoggerUtils2.levels[level] >= LoggerUtils2.levels[this.level]
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return
    const entry: LogEntry = { level, message, timestamp: Date.now(), meta }
    this.entries.push(entry)
    this.handlers.forEach(h => h(entry))
  }

  trace(msg: string, meta?: Record<string, unknown>): void { this.log('trace', msg, meta) }
  debug(msg: string, meta?: Record<string, unknown>): void { this.log('debug', msg, meta) }
  info(msg: string, meta?: Record<string, unknown>): void { this.log('info', msg, meta) }
  warn(msg: string, meta?: Record<string, unknown>): void { this.log('warn', msg, meta) }
  error(msg: string, meta?: Record<string, unknown>): void { this.log('error', msg, meta) }
  fatal(msg: string, meta?: Record<string, unknown>): void { this.log('fatal', msg, meta) }

  addHandler(fn: (entry: LogEntry) => void): this {
    this.handlers.push(fn)
    return this
  }

  getEntries(): LogEntry[] { return [...this.entries] }

  getEntriesByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter(e => e.level === level)
  }

  clear(): void { this.entries = [] }

  count(): number { return this.entries.length }

  child(prefix: string): LoggerUtils2 {
    const child = new LoggerUtils2()
    child.setLevel(this.level)
    child.handlers = [...this.handlers]
    child.addHandler((entry) => {
      this.log(entry.level, `[${prefix}] ${entry.message}`, entry.meta)
    })
    return child
  }

  static format(entry: LogEntry): string {
    const time = new Date(entry.timestamp).toISOString()
    const meta = entry.meta ? ' ' + JSON.stringify(entry.meta) : ''
    return `[${time}] ${entry.level.toUpperCase()}: ${entry.message}${meta}`
  }

  static levelValue(level: LogLevel): number {
    return LoggerUtils2.levels[level]
  }

  static compareLevels(a: LogLevel, b: LogLevel): number {
    return LoggerUtils2.levels[a] - LoggerUtils2.levels[b]
  }

  toArray(): LogEntry[] { return [...this.entries] }
  toString(): string { return this.entries.map(e => LoggerUtils2.format(e)).join('\n') }
  toJSON(): LogEntry[] { return this.entries }
  clone(): LoggerUtils2 {
    const l = new LoggerUtils2()
    l.setLevel(this.level)
    l.entries = [...this.entries]
    return l
  }
  equals(other: unknown): boolean {
    if (!(other instanceof LoggerUtils2)) return false
    return this.level === other.level && this.count() === other.count()
  }
}
