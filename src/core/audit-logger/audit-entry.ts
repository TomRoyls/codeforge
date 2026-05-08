import type { AuditEntryData, AuditFilter, AuditSeverity } from './types.js'
import { SEVERITY_LEVELS } from './types.js'

export class AuditEntry {
  private readonly data: AuditEntryData

  constructor(data: AuditEntryData) {
    this.data = { ...data }
  }

  getId(): string {
    return this.data.id
  }

  getTimestamp(): number {
    return this.data.timestamp
  }

  getSeverity(): AuditSeverity {
    return this.data.severity
  }

  getCategory() {
    return this.data.category
  }

  getAction(): string {
    return this.data.action
  }

  getMessage(): string {
    return this.data.message
  }

  getMetadata(): Record<string, unknown> {
    return { ...this.data.metadata }
  }

  getData(): AuditEntryData {
    return { ...this.data }
  }

  toJSON(): Record<string, unknown> {
    return { ...this.data }
  }

  toText(): string {
    const ts = new Date(this.data.timestamp).toISOString()
    const parts = [
      `[${ts}]`,
      `[${this.data.severity.toUpperCase()}]`,
      `[${this.data.category}]`,
      `${this.data.action}:`,
      this.data.message,
    ]
    if (this.data.source) {
      parts.push(`(source: ${this.data.source})`)
    }
    if (this.data.userId) {
      parts.push(`(user: ${this.data.userId})`)
    }
    if (this.data.duration !== undefined) {
      parts.push(`(${this.data.duration}ms)`)
    }
    return parts.join(' ')
  }

  toCSV(): string {
    const escape = (val: string): string => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    }
    const fields = [
      this.data.id,
      String(this.data.timestamp),
      this.data.severity,
      this.data.category,
      escape(this.data.action),
      escape(this.data.message),
      escape(this.data.source),
      this.data.userId ?? '',
      this.data.sessionId ?? '',
      this.data.duration !== undefined ? String(this.data.duration) : '',
      this.data.correlationId ?? '',
    ]
    return fields.join(',')
  }

  matches(filter: AuditFilter): boolean {
    if (filter.severities && filter.severities.length > 0) {
      if (!filter.severities.includes(this.data.severity)) return false
    }
    if (filter.categories && filter.categories.length > 0) {
      if (!filter.categories.includes(this.data.category)) return false
    }
    if (filter.startTime !== undefined && this.data.timestamp < filter.startTime) return false
    if (filter.endTime !== undefined && this.data.timestamp > filter.endTime) return false
    if (filter.actions && filter.actions.length > 0) {
      if (!filter.actions.includes(this.data.action)) return false
    }
    if (filter.sources && filter.sources.length > 0) {
      if (!filter.sources.includes(this.data.source)) return false
    }
    if (filter.userIds && filter.userIds.length > 0) {
      if (!this.data.userId || !filter.userIds.includes(this.data.userId)) return false
    }
    return true
  }

  static severityValue(sev: AuditSeverity): number {
    return SEVERITY_LEVELS[sev]
  }

  static generateId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 10)
    return `audit_${timestamp}_${random}`
  }
}
