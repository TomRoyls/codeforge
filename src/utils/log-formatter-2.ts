import type { LogEntry } from './logger-utils-2.js'

export class LogFormatter2 {
  static json(entry: LogEntry): string {
    return JSON.stringify(entry)
  }

  static text(entry: LogEntry): string {
    const time = new Date(entry.timestamp).toISOString()
    const meta = entry.meta ? ' ' + JSON.stringify(entry.meta) : ''
    return `${time} [${entry.level.toUpperCase()}] ${entry.message}${meta}`
  }

  static colored(entry: LogEntry): string {
    const colors: Record<string, string> = {
      trace: '\x1b[90m', debug: '\x1b[36m', info: '\x1b[32m',
      warn: '\x1b[33m', error: '\x1b[31m', fatal: '\x1b[35m',
    }
    const reset = '\x1b[0m'
    const color = colors[entry.level] || ''
    const time = new Date(entry.timestamp).toISOString()
    return `${color}[${time}] ${entry.level.toUpperCase()}: ${entry.message}${reset}`
  }

  static table(entries: LogEntry[]): string {
    const header = 'TIME                    | LEVEL  | MESSAGE'
    const separator = '------------------------|--------|----------'
    const rows = entries.map(e => {
      const time = new Date(e.timestamp).toISOString().substring(0, 24)
      const level = e.level.toUpperCase().padEnd(7)
      return `${time} | ${level} | ${e.message}`
    })
    return [header, separator, ...rows].join('\n')
  }

  static csv(entries: LogEntry[]): string {
    const header = 'timestamp,level,message,meta'
    const rows = entries.map(e => {
      const msg = `"${e.message.replace(/"/g, '""')}"`
      const meta = e.meta ? `"${JSON.stringify(e.meta).replace(/"/g, '""')}"` : ''
      return `${e.timestamp},${e.level},${msg},${meta}`
    })
    return [header, ...rows].join('\n')
  }

  static syslog(entry: LogEntry): string {
    const priority = { trace: 7, debug: 7, info: 6, warn: 4, error: 3, fatal: 2 }
    const pri = priority[entry.level] || 6
    const time = new Date(entry.timestamp).toISOString()
    return `<${pri}>${time} ${entry.level.toUpperCase()}: ${entry.message}`
  }

  static compact(entry: LogEntry): string {
    return `${entry.level[0].toUpperCase()}: ${entry.message}`
  }

  static jsonl(entries: LogEntry[]): string {
    return entries.map(e => LogFormatter2.json(e)).join('\n')
  }

  static markdown(entries: LogEntry[]): string {
    if (entries.length === 0) return ''
    const lines = entries.map(e => {
      const time = new Date(e.timestamp).toISOString()
      const emoji = { trace: '🔍', debug: '🐛', info: 'ℹ️', warn: '⚠️', error: '❌', fatal: '💀' }
      const icon = emoji[e.level] || '📝'
      return `| ${time} | ${icon} ${e.level.toUpperCase()} | ${e.message} |`
    })
    return '| Time | Level | Message |\n|------|-------|---------|\n' + lines.join('\n')
  }

  static custom(entry: LogEntry, template: string): string {
    return template
      .replace(/\{level\}/g, entry.level)
      .replace(/\{LEVEL\}/g, entry.level.toUpperCase())
      .replace(/\{message\}/g, entry.message)
      .replace(/\{timestamp\}/g, String(entry.timestamp))
      .replace(/\{iso\}/g, new Date(entry.timestamp).toISOString())
      .replace(/\{meta\}/g, entry.meta ? JSON.stringify(entry.meta) : '')
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): LogFormatter2 { return new LogFormatter2() }
  equals(other: unknown): boolean { return other instanceof LogFormatter2 }
}
