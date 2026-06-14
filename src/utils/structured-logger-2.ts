export type LogLevel2 = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
export type LogField2 = Record<string, unknown>

export interface StructuredLog2 {
  id: string
  level: LogLevel2
  message: string
  timestamp: number
  fields: LogField2
  traceId: string | null
  spanId: string | null
  source: string
  category: string
}

export class StructuredLogger2 {
  private logs: StructuredLog2[] = []
  private maxLogs: number = 100000
  private minLevel: LogLevel2 = 'debug'
  private levelOrder: Record<LogLevel2, number> = {
    trace: 0, debug: 1, info: 2, warn: 3, error: 4, fatal: 5,
  }
  private sinks: Array<(log: StructuredLog2) => void> = []
  private filters: Array<(log: StructuredLog2) => boolean> = []
  private idCounter = 0
  private counters: Map<LogLevel2, number> = new Map()
  private categoryIndex: Map<string, StructuredLog2[]> = new Map()
  private sourceIndex: Map<string, StructuredLog2[]> = new Map()
  private listeners: Array<(log: StructuredLog2) => void> = []

  setMaxLogs(n: number): this { this.maxLogs = n; return this }
  setMinLevel(level: LogLevel2): this { this.minLevel = level; return this }

  private shouldLog(level: LogLevel2): boolean {
    return this.levelOrder[level] >= this.levelOrder[this.minLevel]
  }

  log(level: LogLevel2, message: string, fields: LogField2 = {}, category = 'default', source = 'app', traceId: string | null = null, spanId: string | null = null): string | null {
    if (!this.shouldLog(level)) return null
    const entry: StructuredLog2 = {
      id: `log_${++this.idCounter}`,
      level, message, fields, category, source, traceId, spanId,
      timestamp: Date.now(),
    }
    for (const filter of this.filters) {
      if (!filter(entry)) return null
    }
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) this.logs.shift()
    this.counters.set(level, (this.counters.get(level) || 0) + 1)
    if (!this.categoryIndex.has(category)) this.categoryIndex.set(category, [])
    this.categoryIndex.get(category)!.push(entry)
    if (!this.sourceIndex.has(source)) this.sourceIndex.set(source, [])
    this.sourceIndex.get(source)!.push(entry)
    this.sinks.forEach(sink => sink(entry))
    this.listeners.forEach(fn => fn(entry))
    return entry.id
  }

  trace(msg: string, fields?: LogField2, category?: string): string | null { return this.log('trace', msg, fields, category) }
  debug(msg: string, fields?: LogField2, category?: string): string | null { return this.log('debug', msg, fields, category) }
  info(msg: string, fields?: LogField2, category?: string): string | null { return this.log('info', msg, fields, category) }
  warn(msg: string, fields?: LogField2, category?: string): string | null { return this.log('warn', msg, fields, category) }
  error(msg: string, fields?: LogField2, category?: string): string | null { return this.log('error', msg, fields, category) }
  fatal(msg: string, fields?: LogField2, category?: string): string | null { return this.log('fatal', msg, fields, category) }

  addSink(fn: (log: StructuredLog2) => void): this { this.sinks.push(fn); return this }
  addFilter(fn: (log: StructuredLog2) => boolean): this { this.filters.push(fn); return this }

  getByLevel(level: LogLevel2): StructuredLog2[] {
    return this.logs.filter(l => l.level === level)
  }

  getByCategory(category: string): StructuredLog2[] {
    return this.categoryIndex.get(category) || []
  }

  getBySource(source: string): StructuredLog2[] {
    return this.sourceIndex.get(source) || []
  }

  getByTraceId(traceId: string): StructuredLog2[] {
    return this.logs.filter(l => l.traceId === traceId)
  }

  getByTimeRange(start: number, end: number): StructuredLog2[] {
    return this.logs.filter(l => l.timestamp >= start && l.timestamp <= end)
  }

  search(query: string): StructuredLog2[] {
    return this.logs.filter(l => l.message.includes(query))
  }

  listen(fn: (log: StructuredLog2) => void): this {
    this.listeners.push(fn)
    return this
  }

  getLevelCount(level: LogLevel2): number {
    return this.counters.get(level) || 0
  }

  getStats(): { total: number; trace: number; debug: number; info: number; warn: number; error: number; fatal: number; categories: number; sources: number } {
    return {
      total: this.logs.length,
      trace: this.getLevelCount('trace'),
      debug: this.getLevelCount('debug'),
      info: this.getLevelCount('info'),
      warn: this.getLevelCount('warn'),
      error: this.getLevelCount('error'),
      fatal: this.getLevelCount('fatal'),
      categories: this.categoryIndex.size,
      sources: this.sourceIndex.size,
    }
  }

  count(): number { return this.logs.length }

  toArray(): StructuredLog2[] { return [...this.logs] }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): StructuredLogger2 {
    const sl = new StructuredLogger2()
    sl.maxLogs = this.maxLogs
    sl.minLevel = this.minLevel
    sl.logs = [...this.logs]
    sl.idCounter = this.idCounter
    this.counters.forEach((v, k) => sl.counters.set(k, v))
    return sl
  }
  equals(other: unknown): boolean {
    if (!(other instanceof StructuredLogger2)) return false
    return this.logs.length === other.logs.length
  }
  clear(): void {
    this.logs = []
    this.sinks = []
    this.filters = []
    this.listeners = []
    this.counters.clear()
    this.categoryIndex.clear()
    this.sourceIndex.clear()
    this.idCounter = 0
  }
}
