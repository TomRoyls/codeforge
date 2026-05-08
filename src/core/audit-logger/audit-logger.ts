import { AuditStore } from './audit-store.js'
import { AuditEntry } from './audit-entry.js'
import type { AuditEntryData, AuditFilter, AuditStats, AuditLoggerConfig, AuditSeverity } from './types.js'
import { SEVERITY_LEVELS, DEFAULT_AUDIT_LOGGER_CONFIG } from './types.js'

export class AuditLogger {
  private config: AuditLoggerConfig
  private store: AuditStore
  private callbacks: ((entry: AuditEntryData) => void)[] = []

  constructor(config?: Partial<AuditLoggerConfig>) {
    this.config = { ...DEFAULT_AUDIT_LOGGER_CONFIG, ...config }
    this.store = new AuditStore()
  }

  log(
    action: string,
    message: string,
    options?: Partial<Omit<AuditEntryData, 'id' | 'timestamp' | 'action' | 'message'>>,
  ): string {
    const severity: AuditSeverity = options?.severity ?? 'info'
    if (!this.shouldLog(severity, options?.category ?? 'system')) {
      return ''
    }

    const id = AuditEntry.generateId()
    const entry: AuditEntryData = {
      id,
      timestamp: Date.now(),
      severity,
      category: options?.category ?? 'system',
      action,
      message,
      userId: options?.userId,
      sessionId: options?.sessionId,
      metadata: this.redactMetadata(options?.metadata ?? {}),
      source: options?.source ?? 'audit-logger',
      duration: options?.duration,
      correlationId: options?.correlationId,
    }

    this.store.add(entry)
    this.store.prune(this.config.maxEntries)
    this.notifyCallbacks(entry)

    return id
  }

  debug(action: string, message: string, metadata?: Record<string, unknown>): string {
    return this.log(action, message, { severity: 'debug', metadata })
  }

  info(action: string, message: string, metadata?: Record<string, unknown>): string {
    return this.log(action, message, { severity: 'info', metadata })
  }

  warn(action: string, message: string, metadata?: Record<string, unknown>): string {
    return this.log(action, message, { severity: 'warning', metadata })
  }

  error(action: string, message: string, metadata?: Record<string, unknown>): string {
    return this.log(action, message, { severity: 'error', metadata })
  }

  critical(action: string, message: string, metadata?: Record<string, unknown>): string {
    return this.log(action, message, { severity: 'critical', metadata })
  }

  getEntries(filter?: AuditFilter): AuditEntryData[] {
    return this.store.query(filter ?? {})
  }

  getEntry(id: string): AuditEntryData | null {
    return this.store.get(id)
  }

  getStats(): AuditStats {
    return this.store.getStats()
  }

  export(format?: 'json' | 'csv' | 'text'): string {
    return this.store.export(format ?? this.config.outputFormat)
  }

  setMinSeverity(severity: AuditSeverity): void {
    this.config.minSeverity = severity
  }

  getConfig(): AuditLoggerConfig {
    return { ...this.config }
  }

  clear(): void {
    this.store.clear()
  }

  onEntry(callback: (entry: AuditEntryData) => void): void {
    this.callbacks.push(callback)
  }

  private shouldLog(severity: AuditSeverity, category: string): boolean {
    const minLevel = SEVERITY_LEVELS[this.config.minSeverity]
    const entryLevel = SEVERITY_LEVELS[severity]
    if (entryLevel < minLevel) return false

    if (this.config.enabledCategories !== null) {
      if (!this.config.enabledCategories.includes(category as AuditEntryData['category'])) {
        return false
      }
    }

    return true
  }

  private redactMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    if (this.config.redactFields.length === 0) return metadata
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(metadata)) {
      if (this.config.redactFields.includes(key)) {
        result[key] = '[REDACTED]'
      } else {
        result[key] = value
      }
    }
    return result
  }

  private notifyCallbacks(entry: AuditEntryData): void {
    for (const cb of this.callbacks) {
      cb(entry)
    }
  }
}
