export type AuditSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical'
export type AuditCategory = 'auth' | 'config' | 'analysis' | 'plugin' | 'system' | 'performance' | 'security'

export interface AuditEntryData {
  id: string
  timestamp: number
  severity: AuditSeverity
  category: AuditCategory
  action: string
  message: string
  userId?: string
  sessionId?: string
  metadata: Record<string, unknown>
  source: string
  duration?: number
  correlationId?: string
}

export interface AuditFilter {
  severities?: AuditSeverity[]
  categories?: AuditCategory[]
  startTime?: number
  endTime?: number
  actions?: string[]
  sources?: string[]
  userIds?: string[]
  limit?: number
  offset?: number
}

export interface AuditStats {
  total: number
  bySeverity: Record<AuditSeverity, number>
  byCategory: Record<AuditCategory, number>
  byAction: Record<string, number>
  timeRange: { start: number; end: number } | null
  avgDuration: number
}

export interface AuditLoggerConfig {
  minSeverity: AuditSeverity
  enabledCategories: AuditCategory[] | null
  maxEntries: number
  outputFormat: 'json' | 'text' | 'csv'
  includeTimestamps: boolean
  redactFields: string[]
}

export const SEVERITY_LEVELS: Record<AuditSeverity, number> = {
  debug: 0,
  info: 1,
  warning: 2,
  error: 3,
  critical: 4,
}

export const ALL_SEVERITIES: AuditSeverity[] = ['debug', 'info', 'warning', 'error', 'critical']
export const ALL_CATEGORIES: AuditCategory[] = ['auth', 'config', 'analysis', 'plugin', 'system', 'performance', 'security']

export const DEFAULT_AUDIT_LOGGER_CONFIG: AuditLoggerConfig = {
  minSeverity: 'debug',
  enabledCategories: null,
  maxEntries: 10000,
  outputFormat: 'json',
  includeTimestamps: true,
  redactFields: [],
}
