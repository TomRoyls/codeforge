import { describe, expect, it } from 'vitest'
import { AuditLogger } from '../../../src/core/audit-logger/audit-logger.js'
import type { AuditEntryData, AuditLoggerConfig } from '../../../src/core/audit-logger/types.js'

// ─── Construction ───

describe('AuditLogger construction', () => {
  it('creates with default config', () => {
    const logger = new AuditLogger()
    const config = logger.getConfig()
    expect(config.minSeverity).toBe('debug')
    expect(config.maxEntries).toBe(10000)
    expect(config.outputFormat).toBe('json')
    expect(config.enabledCategories).toBeNull()
    expect(config.redactFields).toEqual([])
    expect(config.includeTimestamps).toBe(true)
  })

  it('merges partial config with defaults', () => {
    const logger = new AuditLogger({ minSeverity: 'warning' })
    const config = logger.getConfig()
    expect(config.minSeverity).toBe('warning')
    expect(config.maxEntries).toBe(10000)
  })

  it('accepts full custom config', () => {
    const logger = new AuditLogger({
      minSeverity: 'error',
      enabledCategories: ['auth', 'security'],
      maxEntries: 500,
      outputFormat: 'csv',
      includeTimestamps: false,
      redactFields: ['password', 'token'],
    })
    const config = logger.getConfig()
    expect(config.minSeverity).toBe('error')
    expect(config.enabledCategories).toEqual(['auth', 'security'])
    expect(config.maxEntries).toBe(500)
    expect(config.outputFormat).toBe('csv')
    expect(config.redactFields).toEqual(['password', 'token'])
  })

  it('returns a copy of config', () => {
    const logger = new AuditLogger()
    const config1 = logger.getConfig()
    config1.minSeverity = 'critical'
    const config2 = logger.getConfig()
    expect(config2.minSeverity).toBe('debug')
  })
})

// ─── log() ───

describe('AuditLogger log()', () => {
  it('returns a non-empty id string', () => {
    const logger = new AuditLogger()
    const id = logger.log('test.action', 'test message')
    expect(id).toBeTruthy()
    expect(typeof id).toBe('string')
  })

  it('creates entry with default values', () => {
    const logger = new AuditLogger()
    const id = logger.log('test.action', 'hello')
    const entry = logger.getEntry(id)
    expect(entry).not.toBeNull()
    expect(entry!.action).toBe('test.action')
    expect(entry!.message).toBe('hello')
    expect(entry!.severity).toBe('info')
    expect(entry!.category).toBe('system')
    expect(entry!.source).toBe('audit-logger')
    expect(entry!.metadata).toEqual({})
    expect(entry!.timestamp).toBeGreaterThan(0)
  })

  it('accepts custom options', () => {
    const logger = new AuditLogger()
    const id = logger.log('user.login', 'User logged in', {
      severity: 'info',
      category: 'auth',
      userId: 'u1',
      sessionId: 's1',
      metadata: { ip: '127.0.0.1' },
      source: 'auth-service',
      duration: 42,
      correlationId: 'corr-1',
    })
    const entry = logger.getEntry(id)
    expect(entry!.severity).toBe('info')
    expect(entry!.category).toBe('auth')
    expect(entry!.userId).toBe('u1')
    expect(entry!.sessionId).toBe('s1')
    expect(entry!.metadata).toEqual({ ip: '127.0.0.1' })
    expect(entry!.source).toBe('auth-service')
    expect(entry!.duration).toBe(42)
    expect(entry!.correlationId).toBe('corr-1')
  })

  it('returns empty string when below min severity', () => {
    const logger = new AuditLogger({ minSeverity: 'error' })
    const id = logger.log('action', 'msg', { severity: 'info' })
    expect(id).toBe('')
  })

  it('filters by enabled categories', () => {
    const logger = new AuditLogger({ enabledCategories: ['auth'] })
    const id = logger.log('action', 'msg', { category: 'system' })
    expect(id).toBe('')
  })

  it('allows log when category is in enabledCategories', () => {
    const logger = new AuditLogger({ enabledCategories: ['auth', 'security'] })
    const id = logger.log('action', 'msg', { category: 'auth' })
    expect(id).not.toBe('')
  })

  it('prunes entries when exceeding maxEntries', () => {
    const logger = new AuditLogger({ maxEntries: 3 })
    const id1 = logger.log('a1', 'm1')
    const id2 = logger.log('a2', 'm2')
    const id3 = logger.log('a3', 'm3')
    const id4 = logger.log('a4', 'm4')
    // After 4th entry, only last 3 should remain
    expect(logger.getEntry(id1)).toBeNull()
    expect(logger.getEntry(id2)).not.toBeNull()
    expect(logger.getEntry(id3)).not.toBeNull()
    expect(logger.getEntry(id4)).not.toBeNull()
  })
})

// ─── Severity Shortcuts ───

describe('AuditLogger severity shortcuts', () => {
  it('debug() logs with debug severity', () => {
    const logger = new AuditLogger()
    const id = logger.debug('act', 'msg', { foo: 'bar' })
    const entry = logger.getEntry(id)
    expect(entry!.severity).toBe('debug')
    expect(entry!.metadata).toEqual({ foo: 'bar' })
  })

  it('info() logs with info severity', () => {
    const logger = new AuditLogger()
    const id = logger.info('act', 'msg')
    const entry = logger.getEntry(id)
    expect(entry!.severity).toBe('info')
  })

  it('warn() logs with warning severity', () => {
    const logger = new AuditLogger()
    const id = logger.warn('act', 'msg')
    const entry = logger.getEntry(id)
    expect(entry!.severity).toBe('warning')
  })

  it('error() logs with error severity', () => {
    const logger = new AuditLogger()
    const id = logger.error('act', 'msg')
    const entry = logger.getEntry(id)
    expect(entry!.severity).toBe('error')
  })

  it('critical() logs with critical severity', () => {
    const logger = new AuditLogger()
    const id = logger.critical('act', 'msg')
    const entry = logger.getEntry(id)
    expect(entry!.severity).toBe('critical')
  })
})

// ─── getEntries() ───

describe('AuditLogger getEntries()', () => {
  it('returns all entries without filter', () => {
    const logger = new AuditLogger()
    logger.info('a1', 'm1')
    logger.info('a2', 'm2')
    expect(logger.getEntries()).toHaveLength(2)
  })

  it('filters by severity', () => {
    const logger = new AuditLogger()
    logger.info('a', 'm')
    logger.error('b', 'm')
    logger.warn('c', 'm')
    const results = logger.getEntries({ severities: ['error'] })
    expect(results).toHaveLength(1)
    expect(results[0]!.action).toBe('b')
  })

  it('filters by category', () => {
    const logger = new AuditLogger()
    logger.log('a', 'm', { category: 'auth' })
    logger.log('b', 'm', { category: 'system' })
    const results = logger.getEntries({ categories: ['auth'] })
    expect(results).toHaveLength(1)
    expect(results[0]!.action).toBe('a')
  })

  it('filters by action', () => {
    const logger = new AuditLogger()
    logger.info('login', 'm1')
    logger.info('logout', 'm2')
    const results = logger.getEntries({ actions: ['login'] })
    expect(results).toHaveLength(1)
    expect(results[0]!.action).toBe('login')
  })

  it('respects limit and offset', () => {
    const logger = new AuditLogger()
    logger.info('a1', 'm')
    logger.info('a2', 'm')
    logger.info('a3', 'm')
    const results = logger.getEntries({ offset: 1, limit: 1 })
    expect(results).toHaveLength(1)
    expect(results[0]!.action).toBe('a2')
  })

  it('returns empty array when no matches', () => {
    const logger = new AuditLogger()
    logger.info('a', 'm')
    const results = logger.getEntries({ severities: ['critical'] })
    expect(results).toEqual([])
  })
})

// ─── getEntry() ───

describe('AuditLogger getEntry()', () => {
  it('returns entry by id', () => {
    const logger = new AuditLogger()
    const id = logger.info('login', 'User logged in')
    const entry = logger.getEntry(id)
    expect(entry).not.toBeNull()
    expect(entry!.id).toBe(id)
    expect(entry!.action).toBe('login')
  })

  it('returns null for non-existent id', () => {
    const logger = new AuditLogger()
    expect(logger.getEntry('nonexistent')).toBeNull()
  })
})

// ─── getStats() ───

describe('AuditLogger getStats()', () => {
  it('returns empty stats initially', () => {
    const logger = new AuditLogger()
    const stats = logger.getStats()
    expect(stats.total).toBe(0)
    expect(stats.avgDuration).toBe(0)
    expect(stats.timeRange).toBeNull()
  })

  it('counts entries by severity', () => {
    const logger = new AuditLogger()
    logger.info('a', 'm')
    logger.info('b', 'm')
    logger.error('c', 'm')
    const stats = logger.getStats()
    expect(stats.total).toBe(3)
    expect(stats.bySeverity.info).toBe(2)
    expect(stats.bySeverity.error).toBe(1)
  })

  it('computes avgDuration', () => {
    const logger = new AuditLogger()
    logger.log('a', 'm', { duration: 100 })
    logger.log('b', 'm', { duration: 200 })
    const stats = logger.getStats()
    expect(stats.avgDuration).toBe(150)
  })

  it('sets timeRange from first to last entry', () => {
    const logger = new AuditLogger()
    logger.info('a', 'm')
    logger.info('b', 'm')
    const stats = logger.getStats()
    expect(stats.timeRange).not.toBeNull()
    expect(stats.timeRange!.start).toBeLessThanOrEqual(stats.timeRange!.end)
  })
})

// ─── export() ───

describe('AuditLogger export()', () => {
  it('exports as JSON by default', () => {
    const logger = new AuditLogger()
    logger.info('a', 'm')
    const output = logger.export()
    const parsed = JSON.parse(output)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed).toHaveLength(1)
  })

  it('exports as CSV', () => {
    const logger = new AuditLogger()
    logger.info('a', 'm')
    const output = logger.export('csv')
    expect(output).toContain('id,timestamp,severity')
    expect(output).toContain('info')
  })

  it('exports as text', () => {
    const logger = new AuditLogger()
    logger.info('login', 'User logged in')
    const output = logger.export('text')
    expect(output).toContain('INFO')
    expect(output).toContain('login')
  })

  it('exports empty as [] for JSON with no entries', () => {
    const logger = new AuditLogger()
    expect(logger.export('json')).toBe('[]')
  })
})

// ─── setMinSeverity() ───

describe('AuditLogger setMinSeverity()', () => {
  it('changes minimum severity level', () => {
    const logger = new AuditLogger()
    logger.setMinSeverity('error')
    // info should now be filtered
    const id = logger.info('a', 'm')
    expect(id).toBe('')
    // error should pass
    const id2 = logger.error('b', 'm')
    expect(id2).not.toBe('')
  })
})

// ─── clear() ───

describe('AuditLogger clear()', () => {
  it('removes all entries', () => {
    const logger = new AuditLogger()
    logger.info('a', 'm')
    logger.info('b', 'm')
    logger.clear()
    expect(logger.getEntries()).toHaveLength(0)
    expect(logger.getStats().total).toBe(0)
  })
})

// ─── onEntry() callback ───

describe('AuditLogger onEntry() callback', () => {
  it('invokes callback on each logged entry', () => {
    const logger = new AuditLogger()
    const received: AuditEntryData[] = []
    logger.onEntry((entry) => received.push(entry))
    logger.info('a', 'm1')
    logger.error('b', 'm2')
    expect(received).toHaveLength(2)
    expect(received[0]!.action).toBe('a')
    expect(received[1]!.action).toBe('b')
  })

  it('does not invoke callback for filtered entries', () => {
    const logger = new AuditLogger({ minSeverity: 'error' })
    const received: AuditEntryData[] = []
    logger.onEntry((entry) => received.push(entry))
    logger.info('a', 'm')
    logger.error('b', 'm')
    expect(received).toHaveLength(1)
    expect(received[0]!.severity).toBe('error')
  })

  it('supports multiple callbacks', () => {
    const logger = new AuditLogger()
    const received1: AuditEntryData[] = []
    const received2: AuditEntryData[] = []
    logger.onEntry((entry) => received1.push(entry))
    logger.onEntry((entry) => received2.push(entry))
    logger.info('a', 'm')
    expect(received1).toHaveLength(1)
    expect(received2).toHaveLength(1)
  })
})

// ─── Redaction ───

describe('AuditLogger metadata redaction', () => {
  it('redacts configured fields', () => {
    const logger = new AuditLogger({ redactFields: ['password', 'apiKey'] })
    const id = logger.info('login', 'User login', { password: 'secret', apiKey: 'key123', safe: 'visible' })
    const entry = logger.getEntry(id)
    expect(entry!.metadata.password).toBe('[REDACTED]')
    expect(entry!.metadata.apiKey).toBe('[REDACTED]')
    expect(entry!.metadata.safe).toBe('visible')
  })

  it('does not redact when redactFields is empty', () => {
    const logger = new AuditLogger({ redactFields: [] })
    const id = logger.info('a', 'm', { secret: 'visible' })
    const entry = logger.getEntry(id)
    expect(entry!.metadata.secret).toBe('visible')
  })
})
