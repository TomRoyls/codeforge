import { AuditEntry } from '../src/core/audit-logger/audit-entry.js'
import { AuditStore } from '../src/core/audit-logger/audit-store.js'
import { AuditLogger } from '../src/core/audit-logger/audit-logger.js'
import {
  SEVERITY_LEVELS,
  ALL_SEVERITIES,
  ALL_CATEGORIES,
  DEFAULT_AUDIT_LOGGER_CONFIG,
} from '../src/core/audit-logger/types.js'
import type { AuditEntryData, AuditFilter, AuditLoggerConfig } from '../src/core/audit-logger/types.js'

// ─── Helpers ───────────────────────────────────────────────────────────

function makeEntry(overrides?: Partial<AuditEntryData>): AuditEntryData {
  return {
    id: 'test-id-1',
    timestamp: Date.now(),
    severity: 'info',
    category: 'system',
    action: 'test-action',
    message: 'test message',
    metadata: {},
    source: 'test-source',
    ...overrides,
  }
}

// ─── Constants ──────────────────────────────────────────────────────────

describe('AuditLogger Constants', () => {
  it('SEVERITY_LEVELS has correct ordering', () => {
    expect(SEVERITY_LEVELS.debug).toBeLessThan(SEVERITY_LEVELS.info)
    expect(SEVERITY_LEVELS.info).toBeLessThan(SEVERITY_LEVELS.warning)
    expect(SEVERITY_LEVELS.warning).toBeLessThan(SEVERITY_LEVELS.error)
    expect(SEVERITY_LEVELS.error).toBeLessThan(SEVERITY_LEVELS.critical)
  })

  it('ALL_SEVERITIES has 5 entries', () => {
    expect(ALL_SEVERITIES).toHaveLength(5)
  })

  it('ALL_CATEGORIES has 7 entries', () => {
    expect(ALL_CATEGORIES).toHaveLength(7)
  })

  it('DEFAULT_AUDIT_LOGGER_CONFIG has expected defaults', () => {
    expect(DEFAULT_AUDIT_LOGGER_CONFIG.minSeverity).toBe('debug')
    expect(DEFAULT_AUDIT_LOGGER_CONFIG.enabledCategories).toBeNull()
    expect(DEFAULT_AUDIT_LOGGER_CONFIG.maxEntries).toBe(10000)
    expect(DEFAULT_AUDIT_LOGGER_CONFIG.outputFormat).toBe('json')
    expect(DEFAULT_AUDIT_LOGGER_CONFIG.includeTimestamps).toBe(true)
    expect(DEFAULT_AUDIT_LOGGER_CONFIG.redactFields).toEqual([])
  })
})

// ─── AuditEntry ─────────────────────────────────────────────────────────

describe('AuditEntry', () => {
  describe('constructor', () => {
    it('creates entry from data', () => {
      const data = makeEntry()
      const entry = new AuditEntry(data)
      expect(entry.getId()).toBe('test-id-1')
    })

    it('copies data (shallow)', () => {
      const data = makeEntry()
      const entry = new AuditEntry(data)
      data.action = 'changed'
      expect(entry.getAction()).toBe('test-action')
    })
  })

  describe('getters', () => {
    it('returns all fields', () => {
      const data = makeEntry({
        severity: 'error',
        category: 'auth',
        action: 'login',
        message: 'Login failed',
        userId: 'u1',
        source: 'auth-service',
        duration: 42,
        correlationId: 'corr-1',
        sessionId: 'sess-1',
      })
      const entry = new AuditEntry(data)
      expect(entry.getId()).toBe('test-id-1')
      expect(entry.getSeverity()).toBe('error')
      expect(entry.getCategory()).toBe('auth')
      expect(entry.getAction()).toBe('login')
      expect(entry.getMessage()).toBe('Login failed')
      expect(entry.getMetadata()).toEqual({})
      expect(entry.getData().userId).toBe('u1')
      expect(entry.getData().duration).toBe(42)
      expect(entry.getData().correlationId).toBe('corr-1')
    })
  })

  describe('toJSON', () => {
    it('returns a copy of data', () => {
      const data = makeEntry()
      const entry = new AuditEntry(data)
      const json = entry.toJSON()
      expect(json.id).toBe('test-id-1')
      expect(json).not.toBe(data)
    })
  })

  describe('toText', () => {
    it('formats entry as text', () => {
      const entry = new AuditEntry(makeEntry({
        severity: 'warning',
        category: 'config',
        action: 'update',
        message: 'Config changed',
        source: 'cli',
      }))
      const text = entry.toText()
      expect(text).toContain('[WARNING]')
      expect(text).toContain('[config]')
      expect(text).toContain('update:')
      expect(text).toContain('Config changed')
      expect(text).toContain('(source: cli)')
    })

    it('includes user id when present', () => {
      const entry = new AuditEntry(makeEntry({ userId: 'user1' }))
      expect(entry.toText()).toContain('(user: user1)')
    })

    it('includes duration when present', () => {
      const entry = new AuditEntry(makeEntry({ duration: 123 }))
      expect(entry.toText()).toContain('(123ms)')
    })

    it('omits source when empty', () => {
      const entry = new AuditEntry(makeEntry({ source: '' }))
      expect(entry.toText()).not.toContain('(source:')
    })
  })

  describe('toCSV', () => {
    it('formats entry as CSV', () => {
      const entry = new AuditEntry(makeEntry())
      const csv = entry.toCSV()
      expect(csv).toContain('test-id-1')
      expect(csv).toContain('info')
      expect(csv).toContain('system')
    })

    it('escapes fields with commas', () => {
      const entry = new AuditEntry(makeEntry({ message: 'hello, world' }))
      const csv = entry.toCSV()
      expect(csv).toContain('"hello, world"')
    })

    it('escapes fields with quotes', () => {
      const entry = new AuditEntry(makeEntry({ action: 'say "hi"' }))
      const csv = entry.toCSV()
      expect(csv).toContain('"say ""hi"""')
    })

    it('leaves optional fields empty when not set', () => {
      const entry = new AuditEntry(makeEntry())
      const csv = entry.toCSV()
      const fields = csv.split(',')
      expect(fields[7]).toBe('')
      expect(fields[8]).toBe('')
    })

    it('includes duration when present', () => {
      const entry = new AuditEntry(makeEntry({ duration: 50 }))
      const csv = entry.toCSV()
      const fields = csv.split(',')
      expect(fields[9]).toBe('50')
    })
  })

  describe('matches', () => {
    it('matches empty filter', () => {
      const entry = new AuditEntry(makeEntry())
      expect(entry.matches({})).toBe(true)
    })

    it('matches severity filter', () => {
      const entry = new AuditEntry(makeEntry({ severity: 'error' }))
      expect(entry.matches({ severities: ['error'] })).toBe(true)
      expect(entry.matches({ severities: ['info'] })).toBe(false)
    })

    it('matches category filter', () => {
      const entry = new AuditEntry(makeEntry({ category: 'auth' }))
      expect(entry.matches({ categories: ['auth'] })).toBe(true)
      expect(entry.matches({ categories: ['system'] })).toBe(false)
    })

    it('matches time range', () => {
      const ts = 1000
      const entry = new AuditEntry(makeEntry({ timestamp: ts }))
      expect(entry.matches({ startTime: 900, endTime: 1100 })).toBe(true)
      expect(entry.matches({ startTime: 1001 })).toBe(false)
      expect(entry.matches({ endTime: 999 })).toBe(false)
    })

    it('matches action filter', () => {
      const entry = new AuditEntry(makeEntry({ action: 'login' }))
      expect(entry.matches({ actions: ['login'] })).toBe(true)
      expect(entry.matches({ actions: ['logout'] })).toBe(false)
    })

    it('matches source filter', () => {
      const entry = new AuditEntry(makeEntry({ source: 'api' }))
      expect(entry.matches({ sources: ['api'] })).toBe(true)
      expect(entry.matches({ sources: ['cli'] })).toBe(false)
    })

    it('matches userId filter', () => {
      const entry = new AuditEntry(makeEntry({ userId: 'u1' }))
      expect(entry.matches({ userIds: ['u1'] })).toBe(true)
      expect(entry.matches({ userIds: ['u2'] })).toBe(false)
    })

    it('fails userId match when entry has no userId', () => {
      const entry = new AuditEntry(makeEntry())
      expect(entry.matches({ userIds: ['u1'] })).toBe(false)
    })

    it('combines multiple filters', () => {
      const entry = new AuditEntry(makeEntry({ severity: 'error', category: 'auth' }))
      expect(entry.matches({ severities: ['error'], categories: ['auth'] })).toBe(true)
      expect(entry.matches({ severities: ['error'], categories: ['system'] })).toBe(false)
    })

    it('ignores empty filter arrays', () => {
      const entry = new AuditEntry(makeEntry({ severity: 'info' }))
      expect(entry.matches({ severities: [] })).toBe(true)
    })
  })

  describe('static methods', () => {
    it('severityValue returns correct level', () => {
      expect(AuditEntry.severityValue('debug')).toBe(0)
      expect(AuditEntry.severityValue('critical')).toBe(4)
    })

    it('generateId starts with audit_', () => {
      const id = AuditEntry.generateId()
      expect(id).toMatch(/^audit_/)
      expect(id.length).toBeGreaterThan(10)
    })

    it('generateId produces unique ids', () => {
      const ids = new Set<string>()
      for (let i = 0; i < 50; i++) {
        ids.add(AuditEntry.generateId())
      }
      expect(ids.size).toBe(50)
    })
  })
})

// ─── AuditStore ─────────────────────────────────────────────────────────

describe('AuditStore', () => {
  describe('add and get', () => {
    it('adds and retrieves an entry', () => {
      const store = new AuditStore()
      const data = makeEntry()
      store.add(data)
      expect(store.get('test-id-1')).toBeDefined()
      expect(store.get('test-id-1')?.id).toBe('test-id-1')
    })

    it('returns null for missing entry', () => {
      const store = new AuditStore()
      expect(store.get('nonexistent')).toBeNull()
    })

    it('returns a shallow copy from get', () => {
      const store = new AuditStore()
      store.add(makeEntry({ action: 'original' }))
      const retrieved = store.get('test-id-1')!
      retrieved.action = 'changed'
      expect(store.get('test-id-1')?.action).toBe('original')
    })
  })

  describe('query', () => {
    it('returns all entries with empty filter', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'a' }))
      store.add(makeEntry({ id: 'b' }))
      expect(store.query({})).toHaveLength(2)
    })

    it('filters by severity', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'a', severity: 'error' }))
      store.add(makeEntry({ id: 'b', severity: 'info' }))
      const results = store.query({ severities: ['error'] })
      expect(results).toHaveLength(1)
      expect(results[0]?.id).toBe('a')
    })

    it('applies limit', () => {
      const store = new AuditStore()
      for (let i = 0; i < 10; i++) {
        store.add(makeEntry({ id: `id-${i}` }))
      }
      const results = store.query({ limit: 3 })
      expect(results).toHaveLength(3)
    })

    it('applies offset', () => {
      const store = new AuditStore()
      for (let i = 0; i < 5; i++) {
        store.add(makeEntry({ id: `id-${i}` }))
      }
      const results = store.query({ offset: 3 })
      expect(results).toHaveLength(2)
    })

    it('applies limit and offset together', () => {
      const store = new AuditStore()
      for (let i = 0; i < 10; i++) {
        store.add(makeEntry({ id: `id-${i}` }))
      }
      const results = store.query({ offset: 2, limit: 3 })
      expect(results).toHaveLength(3)
      expect(results[0]?.id).toBe('id-2')
    })

    it('filters by time range', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'a', timestamp: 100 }))
      store.add(makeEntry({ id: 'b', timestamp: 200 }))
      store.add(makeEntry({ id: 'c', timestamp: 300 }))
      const results = store.query({ startTime: 150, endTime: 250 })
      expect(results).toHaveLength(1)
      expect(results[0]?.id).toBe('b')
    })

    it('filters by action', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'a', action: 'login' }))
      store.add(makeEntry({ id: 'b', action: 'logout' }))
      const results = store.query({ actions: ['login'] })
      expect(results).toHaveLength(1)
    })
  })

  describe('count', () => {
    it('counts all entries without filter', () => {
      const store = new AuditStore()
      store.add(makeEntry())
      store.add(makeEntry({ id: 'b' }))
      expect(store.count()).toBe(2)
    })

    it('counts with filter', () => {
      const store = new AuditStore()
      store.add(makeEntry({ severity: 'error' }))
      store.add(makeEntry({ severity: 'info' }))
      store.add(makeEntry({ id: 'c', severity: 'error' }))
      expect(store.count({ severities: ['error'] })).toBe(2)
    })

    it('returns 0 for empty store', () => {
      const store = new AuditStore()
      expect(store.count()).toBe(0)
    })
  })

  describe('getStats', () => {
    it('returns stats for empty store', () => {
      const store = new AuditStore()
      const stats = store.getStats()
      expect(stats.total).toBe(0)
      expect(stats.timeRange).toBeNull()
      expect(stats.avgDuration).toBe(0)
    })

    it('counts by severity', () => {
      const store = new AuditStore()
      store.add(makeEntry({ severity: 'error' }))
      store.add(makeEntry({ id: 'b', severity: 'error' }))
      store.add(makeEntry({ id: 'c', severity: 'info' }))
      const stats = store.getStats()
      expect(stats.bySeverity.error).toBe(2)
      expect(stats.bySeverity.info).toBe(1)
    })

    it('counts by category', () => {
      const store = new AuditStore()
      store.add(makeEntry({ category: 'auth' }))
      store.add(makeEntry({ id: 'b', category: 'auth' }))
      const stats = store.getStats()
      expect(stats.byCategory.auth).toBe(2)
    })

    it('counts by action', () => {
      const store = new AuditStore()
      store.add(makeEntry({ action: 'login' }))
      store.add(makeEntry({ id: 'b', action: 'login' }))
      store.add(makeEntry({ id: 'c', action: 'logout' }))
      const stats = store.getStats()
      expect(stats.byAction.login).toBe(2)
      expect(stats.byAction.logout).toBe(1)
    })

    it('computes time range', () => {
      const store = new AuditStore()
      store.add(makeEntry({ timestamp: 100 }))
      store.add(makeEntry({ id: 'b', timestamp: 500 }))
      const stats = store.getStats()
      expect(stats.timeRange).toEqual({ start: 100, end: 500 })
    })

    it('computes average duration', () => {
      const store = new AuditStore()
      store.add(makeEntry({ duration: 100 }))
      store.add(makeEntry({ id: 'b', duration: 200 }))
      const stats = store.getStats()
      expect(stats.avgDuration).toBe(150)
    })

    it('includes all severity keys', () => {
      const store = new AuditStore()
      store.add(makeEntry())
      const stats = store.getStats()
      for (const sev of ALL_SEVERITIES) {
        expect(stats.bySeverity).toHaveProperty(sev)
      }
    })

    it('includes all category keys', () => {
      const store = new AuditStore()
      store.add(makeEntry())
      const stats = store.getStats()
      for (const cat of ALL_CATEGORIES) {
        expect(stats.byCategory).toHaveProperty(cat)
      }
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const store = new AuditStore()
      store.add(makeEntry())
      store.add(makeEntry({ id: 'b' }))
      store.clear()
      expect(store.count()).toBe(0)
      expect(store.get('test-id-1')).toBeNull()
    })
  })

  describe('export', () => {
    it('exports as JSON', () => {
      const store = new AuditStore()
      store.add(makeEntry())
      const json = store.export('json')
      const parsed = JSON.parse(json)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].id).toBe('test-id-1')
    })

    it('exports as CSV with header', () => {
      const store = new AuditStore()
      store.add(makeEntry())
      const csv = store.export('csv')
      const lines = csv.split('\n')
      expect(lines[0]).toContain('id,timestamp')
      expect(lines).toHaveLength(2)
    })

    it('exports as text', () => {
      const store = new AuditStore()
      store.add(makeEntry({ severity: 'warning', category: 'config' }))
      const text = store.export('text')
      expect(text).toContain('[WARNING]')
      expect(text).toContain('[config]')
    })

    it('returns empty array for JSON with no entries', () => {
      const store = new AuditStore()
      expect(store.export('json')).toBe('[]')
    })

    it('returns empty string for text with no entries', () => {
      const store = new AuditStore()
      expect(store.export('text')).toBe('')
    })
  })

  describe('prune', () => {
    it('removes oldest entries exceeding max', () => {
      const store = new AuditStore()
      for (let i = 0; i < 10; i++) {
        store.add(makeEntry({ id: `id-${i}`, timestamp: i * 100 }))
      }
      const removed = store.prune(5)
      expect(removed).toBe(5)
      expect(store.count()).toBe(5)
      expect(store.get('id-0')).toBeNull()
      expect(store.get('id-9')).toBeDefined()
    })

    it('returns 0 when under max', () => {
      const store = new AuditStore()
      store.add(makeEntry())
      expect(store.prune(10)).toBe(0)
    })

    it('removes from index', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'a' }))
      store.add(makeEntry({ id: 'b' }))
      store.prune(1)
      expect(store.get('a')).toBeNull()
      expect(store.get('b')).toBeDefined()
    })
  })

  describe('getByTimeRange', () => {
    it('returns entries within range', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'a', timestamp: 100 }))
      store.add(makeEntry({ id: 'b', timestamp: 200 }))
      store.add(makeEntry({ id: 'c', timestamp: 300 }))
      const results = store.getByTimeRange(150, 250)
      expect(results).toHaveLength(1)
      expect(results[0]?.id).toBe('b')
    })

    it('includes boundary entries', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'a', timestamp: 100 }))
      const results = store.getByTimeRange(100, 100)
      expect(results).toHaveLength(1)
    })
  })

  describe('getByCorrelationId', () => {
    it('returns entries with matching correlationId', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'a', correlationId: 'corr-1' }))
      store.add(makeEntry({ id: 'b', correlationId: 'corr-1' }))
      store.add(makeEntry({ id: 'c', correlationId: 'corr-2' }))
      const results = store.getByCorrelationId('corr-1')
      expect(results).toHaveLength(2)
    })

    it('returns empty for unknown correlationId', () => {
      const store = new AuditStore()
      store.add(makeEntry())
      expect(store.getByCorrelationId('unknown')).toEqual([])
    })
  })
})

// ─── AuditLogger ────────────────────────────────────────────────────────

describe('AuditLogger', () => {
  describe('constructor', () => {
    it('creates logger with defaults', () => {
      const logger = new AuditLogger()
      const config = logger.getConfig()
      expect(config.minSeverity).toBe('debug')
      expect(config.maxEntries).toBe(10000)
    })

    it('accepts custom config', () => {
      const logger = new AuditLogger({ minSeverity: 'error', maxEntries: 100 })
      const config = logger.getConfig()
      expect(config.minSeverity).toBe('error')
      expect(config.maxEntries).toBe(100)
    })

    it('returns a copy of config', () => {
      const logger = new AuditLogger()
      const config = logger.getConfig()
      config.minSeverity = 'critical'
      expect(logger.getConfig().minSeverity).toBe('debug')
    })
  })

  describe('log', () => {
    it('logs an entry and returns id', () => {
      const logger = new AuditLogger()
      const id = logger.log('test', 'hello')
      expect(id).toMatch(/^audit_/)
      expect(logger.getEntry(id)).toBeDefined()
      expect(logger.getEntry(id)?.action).toBe('test')
    })

    it('uses default severity info', () => {
      const logger = new AuditLogger()
      const id = logger.log('act', 'msg')
      expect(logger.getEntry(id)?.severity).toBe('info')
    })

    it('uses default category system', () => {
      const logger = new AuditLogger()
      const id = logger.log('act', 'msg')
      expect(logger.getEntry(id)?.category).toBe('system')
    })

    it('respects severity override', () => {
      const logger = new AuditLogger()
      const id = logger.log('act', 'msg', { severity: 'error', category: 'auth' })
      expect(logger.getEntry(id)?.severity).toBe('error')
      expect(logger.getEntry(id)?.category).toBe('auth')
    })

    it('returns empty string when below min severity', () => {
      const logger = new AuditLogger({ minSeverity: 'error' })
      const id = logger.log('act', 'msg', { severity: 'info' })
      expect(id).toBe('')
    })

    it('filters by enabled categories', () => {
      const logger = new AuditLogger({ enabledCategories: ['auth'] })
      const id1 = logger.log('login', 'msg', { category: 'auth' })
      const id2 = logger.log('scan', 'msg', { category: 'analysis' })
      expect(id1).not.toBe('')
      expect(id2).toBe('')
    })

    it('allows all categories when enabledCategories is null', () => {
      const logger = new AuditLogger({ enabledCategories: null })
      const id = logger.log('act', 'msg', { category: 'security' })
      expect(id).not.toBe('')
    })

    it('stores metadata', () => {
      const logger = new AuditLogger()
      const id = logger.log('act', 'msg', { metadata: { key: 'value' } })
      expect(logger.getEntry(id)?.metadata.key).toBe('value')
    })

    it('stores userId', () => {
      const logger = new AuditLogger()
      const id = logger.log('act', 'msg', { userId: 'user1' })
      expect(logger.getEntry(id)?.userId).toBe('user1')
    })

    it('stores duration', () => {
      const logger = new AuditLogger()
      const id = logger.log('act', 'msg', { duration: 42 })
      expect(logger.getEntry(id)?.duration).toBe(42)
    })

    it('stores correlationId', () => {
      const logger = new AuditLogger()
      const id = logger.log('act', 'msg', { correlationId: 'corr-1' })
      expect(logger.getEntry(id)?.correlationId).toBe('corr-1')
    })
  })

  describe('convenience methods', () => {
    it('debug logs with debug severity', () => {
      const logger = new AuditLogger()
      const id = logger.debug('act', 'msg')
      expect(logger.getEntry(id)?.severity).toBe('debug')
    })

    it('info logs with info severity', () => {
      const logger = new AuditLogger()
      const id = logger.info('act', 'msg')
      expect(logger.getEntry(id)?.severity).toBe('info')
    })

    it('warn logs with warning severity', () => {
      const logger = new AuditLogger()
      const id = logger.warn('act', 'msg')
      expect(logger.getEntry(id)?.severity).toBe('warning')
    })

    it('error logs with error severity', () => {
      const logger = new AuditLogger()
      const id = logger.error('act', 'msg')
      expect(logger.getEntry(id)?.severity).toBe('error')
    })

    it('critical logs with critical severity', () => {
      const logger = new AuditLogger()
      const id = logger.critical('act', 'msg')
      expect(logger.getEntry(id)?.severity).toBe('critical')
    })

    it('convenience methods pass metadata', () => {
      const logger = new AuditLogger()
      const id = logger.info('act', 'msg', { extra: 'data' })
      expect(logger.getEntry(id)?.metadata.extra).toBe('data')
    })
  })

  describe('redaction', () => {
    it('redacts configured fields', () => {
      const logger = new AuditLogger({ redactFields: ['password', 'token'] })
      const id = logger.info('login', 'msg', { password: 'secret', token: 'abc', name: 'john' })
      const entry = logger.getEntry(id)!
      expect(entry.metadata.password).toBe('[REDACTED]')
      expect(entry.metadata.token).toBe('[REDACTED]')
      expect(entry.metadata.name).toBe('john')
    })

    it('does not redact when no fields configured', () => {
      const logger = new AuditLogger()
      const id = logger.info('act', 'msg', { secret: 'value' })
      expect(logger.getEntry(id)?.metadata.secret).toBe('value')
    })
  })

  describe('getEntries', () => {
    it('returns all entries without filter', () => {
      const logger = new AuditLogger()
      logger.info('a', 'msg')
      logger.info('b', 'msg')
      expect(logger.getEntries()).toHaveLength(2)
    })

    it('filters entries', () => {
      const logger = new AuditLogger()
      logger.info('login', 'msg')
      logger.error('crash', 'msg')
      const errors = logger.getEntries({ severities: ['error'] })
      expect(errors).toHaveLength(1)
      expect(errors[0]?.action).toBe('crash')
    })
  })

  describe('getStats', () => {
    it('returns stats from store', () => {
      const logger = new AuditLogger()
      logger.info('a', 'msg')
      logger.error('b', 'msg')
      const stats = logger.getStats()
      expect(stats.total).toBe(2)
      expect(stats.bySeverity.info).toBe(1)
      expect(stats.bySeverity.error).toBe(1)
    })
  })

  describe('export', () => {
    it('exports as JSON by default', () => {
      const logger = new AuditLogger()
      logger.info('act', 'msg')
      const exported = logger.export()
      const parsed = JSON.parse(exported)
      expect(parsed).toHaveLength(1)
    })

    it('exports as CSV', () => {
      const logger = new AuditLogger()
      logger.info('act', 'msg')
      const csv = logger.export('csv')
      expect(csv).toContain('id,timestamp')
    })

    it('exports as text', () => {
      const logger = new AuditLogger()
      logger.info('act', 'msg')
      const text = logger.export('text')
      expect(text).toContain('act:')
    })
  })

  describe('setMinSeverity', () => {
    it('changes minimum severity', () => {
      const logger = new AuditLogger()
      logger.setMinSeverity('error')
      const config = logger.getConfig()
      expect(config.minSeverity).toBe('error')
    })

    it('filters subsequent logs', () => {
      const logger = new AuditLogger()
      logger.setMinSeverity('error')
      const id1 = logger.info('act', 'msg')
      const id2 = logger.error('act', 'msg')
      expect(id1).toBe('')
      expect(id2).not.toBe('')
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const logger = new AuditLogger()
      logger.info('a', 'msg')
      logger.info('b', 'msg')
      logger.clear()
      expect(logger.getEntries()).toHaveLength(0)
    })
  })

  describe('onEntry callback', () => {
    it('notifies on entry', () => {
      const logger = new AuditLogger()
      const received: AuditEntryData[] = []
      logger.onEntry((entry) => { received.push(entry) })
      logger.info('act', 'msg')
      expect(received).toHaveLength(1)
      expect(received[0]?.action).toBe('act')
    })

    it('notifies multiple callbacks', () => {
      const logger = new AuditLogger()
      let count1 = 0
      let count2 = 0
      logger.onEntry(() => { count1++ })
      logger.onEntry(() => { count2++ })
      logger.info('act', 'msg')
      expect(count1).toBe(1)
      expect(count2).toBe(1)
    })

    it('does not notify for filtered entries', () => {
      const logger = new AuditLogger({ minSeverity: 'error' })
      let count = 0
      logger.onEntry(() => { count++ })
      logger.info('act', 'msg')
      expect(count).toBe(0)
    })
  })

  describe('maxEntries pruning', () => {
    it('prunes when exceeding maxEntries', () => {
      const logger = new AuditLogger({ maxEntries: 3 })
      logger.info('a', 'msg')
      logger.info('b', 'msg')
      logger.info('c', 'msg')
      logger.info('d', 'msg')
      expect(logger.getEntries()).toHaveLength(3)
      const actions = logger.getEntries().map(e => e.action)
      expect(actions).not.toContain('a')
      expect(actions).toContain('d')
    })
  })
})
