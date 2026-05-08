import { describe, it, expect } from 'vitest'
import { AuditEntry } from '../../src/core/audit-logger/audit-entry.js'
import { AuditStore } from '../../src/core/audit-logger/audit-store.js'
import { AuditLogger } from '../../src/core/audit-logger/audit-logger.js'
import type { AuditEntryData, AuditFilter, AuditSeverity, AuditCategory } from '../../src/core/audit-logger/types.js'
import { SEVERITY_LEVELS, DEFAULT_AUDIT_LOGGER_CONFIG } from '../../src/core/audit-logger/types.js'

function makeEntry(overrides: Partial<AuditEntryData> = {}): AuditEntryData {
  return {
    id: overrides.id ?? AuditEntry.generateId(),
    timestamp: overrides.timestamp ?? Date.now(),
    severity: overrides.severity ?? 'info',
    category: overrides.category ?? 'system',
    action: overrides.action ?? 'test.action',
    message: overrides.message ?? 'test message',
    userId: overrides.userId,
    sessionId: overrides.sessionId,
    metadata: overrides.metadata ?? {},
    source: overrides.source ?? 'test',
    duration: overrides.duration,
    correlationId: overrides.correlationId,
  }
}

describe('AuditEntry', () => {
  describe('constructor', () => {
    it('should create entry with all fields', () => {
      const data = makeEntry()
      const entry = new AuditEntry(data)
      expect(entry.getId()).toBe(data.id)
      expect(entry.getTimestamp()).toBe(data.timestamp)
      expect(entry.getSeverity()).toBe(data.severity)
      expect(entry.getCategory()).toBe(data.category)
      expect(entry.getAction()).toBe(data.action)
      expect(entry.getMessage()).toBe(data.message)
    })

    it('should store a copy of data', () => {
      const data = makeEntry()
      const entry = new AuditEntry(data)
      data.message = 'changed'
      expect(entry.getMessage()).toBe('test message')
    })
  })

  describe('getters', () => {
    it('should return id', () => {
      const entry = new AuditEntry(makeEntry({ id: 'entry-1' }))
      expect(entry.getId()).toBe('entry-1')
    })

    it('should return timestamp', () => {
      const ts = 1700000000000
      const entry = new AuditEntry(makeEntry({ timestamp: ts }))
      expect(entry.getTimestamp()).toBe(ts)
    })

    it('should return severity', () => {
      const entry = new AuditEntry(makeEntry({ severity: 'error' }))
      expect(entry.getSeverity()).toBe('error')
    })

    it('should return category', () => {
      const entry = new AuditEntry(makeEntry({ category: 'auth' }))
      expect(entry.getCategory()).toBe('auth')
    })

    it('should return action', () => {
      const entry = new AuditEntry(makeEntry({ action: 'user.login' }))
      expect(entry.getAction()).toBe('user.login')
    })

    it('should return message', () => {
      const entry = new AuditEntry(makeEntry({ message: 'hello' }))
      expect(entry.getMessage()).toBe('hello')
    })

    it('should return a copy of metadata', () => {
      const meta = { key: 'value' }
      const entry = new AuditEntry(makeEntry({ metadata: meta }))
      const retrieved = entry.getMetadata()
      expect(retrieved).toEqual({ key: 'value' })
      retrieved['key'] = 'changed'
      expect(entry.getMetadata()).toEqual({ key: 'value' })
    })

    it('should return full data copy via getData', () => {
      const data = makeEntry()
      const entry = new AuditEntry(data)
      const retrieved = entry.getData()
      expect(retrieved).toEqual(data)
      retrieved.message = 'changed'
      expect(entry.getMessage()).toBe('test message')
    })
  })

  describe('toJSON', () => {
    it('should return serializable object', () => {
      const data = makeEntry({ userId: 'u1', duration: 42 })
      const entry = new AuditEntry(data)
      const json = entry.toJSON()
      expect(json.id).toBe(data.id)
      expect(json.severity).toBe('info')
      expect(json.userId).toBe('u1')
      expect(json.duration).toBe(42)
      expect(JSON.stringify(json)).toBeTruthy()
    })
  })

  describe('toText', () => {
    it('should format basic entry', () => {
      const entry = new AuditEntry(makeEntry({
        timestamp: 1700000000000,
        severity: 'error',
        category: 'auth',
        action: 'login.failed',
        message: 'Invalid credentials',
        source: 'auth-module',
      }))
      const text = entry.toText()
      expect(text).toContain('[ERROR]')
      expect(text).toContain('[auth]')
      expect(text).toContain('login.failed')
      expect(text).toContain('Invalid credentials')
      expect(text).toContain('source: auth-module')
    })

    it('should include userId when present', () => {
      const entry = new AuditEntry(makeEntry({ userId: 'user-123' }))
      expect(entry.toText()).toContain('user: user-123')
    })

    it('should include duration when present', () => {
      const entry = new AuditEntry(makeEntry({ duration: 150 }))
      expect(entry.toText()).toContain('150ms')
    })

    it('should not include optional fields when absent', () => {
      const entry = new AuditEntry(makeEntry())
      const text = entry.toText()
      expect(text).not.toContain('user:')
      expect(text).not.toContain('ms)')
    })
  })

  describe('toCSV', () => {
    it('should produce CSV line with all fields', () => {
      const entry = new AuditEntry(makeEntry({
        id: 'id1',
        timestamp: 1700000000000,
        severity: 'warning',
        category: 'config',
        action: 'config.changed',
        message: 'Config updated',
        source: 'cli',
        userId: 'u1',
        sessionId: 's1',
        duration: 10,
        correlationId: 'corr1',
      }))
      const csv = entry.toCSV()
      expect(csv).toContain('id1')
      expect(csv).toContain('1700000000000')
      expect(csv).toContain('warning')
      expect(csv).toContain('config')
      expect(csv).toContain('config.changed')
      expect(csv).toContain('u1')
      expect(csv).toContain('s1')
      expect(csv).toContain('10')
      expect(csv).toContain('corr1')
    })

    it('should escape fields with commas', () => {
      const entry = new AuditEntry(makeEntry({ message: 'hello, world' }))
      const csv = entry.toCSV()
      expect(csv).toContain('"hello, world"')
    })

    it('should escape fields with quotes', () => {
      const entry = new AuditEntry(makeEntry({ message: 'say "hi"' }))
      const csv = entry.toCSV()
      expect(csv).toContain('"say ""hi"""')
    })

    it('should use empty string for missing optional fields', () => {
      const entry = new AuditEntry(makeEntry())
      const csv = entry.toCSV()
      const parts = csv.split(',')
      expect(parts[7]).toBe('')
      expect(parts[8]).toBe('')
      expect(parts[9]).toBe('')
      expect(parts[10]).toBe('')
    })
  })

  describe('matches', () => {
    const baseEntry = new AuditEntry(makeEntry({
      timestamp: 1000,
      severity: 'error',
      category: 'auth',
      action: 'login',
      source: 'auth-module',
      userId: 'user1',
    }))

    it('should match empty filter', () => {
      expect(baseEntry.matches({})).toBe(true)
    })

    it('should match by severities', () => {
      expect(baseEntry.matches({ severities: ['error', 'critical'] })).toBe(true)
      expect(baseEntry.matches({ severities: ['debug', 'info'] })).toBe(false)
    })

    it('should match by categories', () => {
      expect(baseEntry.matches({ categories: ['auth', 'security'] })).toBe(true)
      expect(baseEntry.matches({ categories: ['config', 'plugin'] })).toBe(false)
    })

    it('should match by time range', () => {
      expect(baseEntry.matches({ startTime: 500, endTime: 1500 })).toBe(true)
      expect(baseEntry.matches({ startTime: 2000 })).toBe(false)
      expect(baseEntry.matches({ endTime: 500 })).toBe(false)
    })

    it('should match by actions', () => {
      expect(baseEntry.matches({ actions: ['login', 'logout'] })).toBe(true)
      expect(baseEntry.matches({ actions: ['register'] })).toBe(false)
    })

    it('should match by sources', () => {
      expect(baseEntry.matches({ sources: ['auth-module'] })).toBe(true)
      expect(baseEntry.matches({ sources: ['cli'] })).toBe(false)
    })

    it('should match by userIds', () => {
      expect(baseEntry.matches({ userIds: ['user1'] })).toBe(true)
      expect(baseEntry.matches({ userIds: ['user2'] })).toBe(false)
    })

    it('should return false for userIds filter when entry has no userId', () => {
      const noUser = new AuditEntry(makeEntry())
      expect(noUser.matches({ userIds: ['user1'] })).toBe(false)
    })

    it('should combine multiple filter criteria', () => {
      expect(baseEntry.matches({
        severities: ['error'],
        categories: ['auth'],
        actions: ['login'],
      })).toBe(true)
      expect(baseEntry.matches({
        severities: ['error'],
        categories: ['config'],
      })).toBe(false)
    })
  })

  describe('static severityValue', () => {
    it('should return correct numeric levels', () => {
      expect(AuditEntry.severityValue('debug')).toBe(0)
      expect(AuditEntry.severityValue('info')).toBe(1)
      expect(AuditEntry.severityValue('warning')).toBe(2)
      expect(AuditEntry.severityValue('error')).toBe(3)
      expect(AuditEntry.severityValue('critical')).toBe(4)
    })

    it('should have increasing severity order', () => {
      expect(AuditEntry.severityValue('debug')).toBeLessThan(AuditEntry.severityValue('info'))
      expect(AuditEntry.severityValue('info')).toBeLessThan(AuditEntry.severityValue('warning'))
      expect(AuditEntry.severityValue('warning')).toBeLessThan(AuditEntry.severityValue('error'))
      expect(AuditEntry.severityValue('error')).toBeLessThan(AuditEntry.severityValue('critical'))
    })
  })

  describe('static generateId', () => {
    it('should generate unique ids', () => {
      const id1 = AuditEntry.generateId()
      const id2 = AuditEntry.generateId()
      expect(id1).not.toBe(id2)
    })

    it('should start with audit_ prefix', () => {
      const id = AuditEntry.generateId()
      expect(id.startsWith('audit_')).toBe(true)
    })
  })
})

describe('AuditStore', () => {
  describe('add and get', () => {
    it('should add and retrieve an entry', () => {
      const store = new AuditStore()
      const data = makeEntry({ id: 'e1' })
      store.add(data)
      expect(store.get('e1')).toEqual(data)
    })

    it('should return null for non-existent entry', () => {
      const store = new AuditStore()
      expect(store.get('nonexistent')).toBeNull()
    })

    it('should handle multiple entries', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'e1' }))
      store.add(makeEntry({ id: 'e2' }))
      store.add(makeEntry({ id: 'e3' }))
      expect(store.get('e1')).toBeTruthy()
      expect(store.get('e2')).toBeTruthy()
      expect(store.get('e3')).toBeTruthy()
      expect(store.count()).toBe(3)
    })
  })

  describe('query', () => {
    let store: AuditStore
    beforeEach(() => {
      store = new AuditStore()
      store.add(makeEntry({ id: 'e1', severity: 'info', category: 'auth', action: 'login', source: 'api', timestamp: 1000 }))
      store.add(makeEntry({ id: 'e2', severity: 'error', category: 'system', action: 'crash', source: 'kernel', timestamp: 2000 }))
      store.add(makeEntry({ id: 'e3', severity: 'warning', category: 'config', action: 'update', source: 'api', timestamp: 3000 }))
      store.add(makeEntry({ id: 'e4', severity: 'info', category: 'auth', action: 'logout', source: 'api', timestamp: 4000, userId: 'u1' }))
    })

    it('should return all entries with empty filter', () => {
      expect(store.query({})).toHaveLength(4)
    })

    it('should filter by severities', () => {
      expect(store.query({ severities: ['info'] })).toHaveLength(2)
      expect(store.query({ severities: ['error', 'warning'] })).toHaveLength(2)
    })

    it('should filter by categories', () => {
      expect(store.query({ categories: ['auth'] })).toHaveLength(2)
      expect(store.query({ categories: ['config', 'system'] })).toHaveLength(2)
    })

    it('should filter by time range', () => {
      expect(store.query({ startTime: 1500, endTime: 3500 })).toHaveLength(2)
    })

    it('should filter by actions', () => {
      expect(store.query({ actions: ['login'] })).toHaveLength(1)
    })

    it('should filter by sources', () => {
      expect(store.query({ sources: ['api'] })).toHaveLength(3)
    })

    it('should filter by userIds', () => {
      expect(store.query({ userIds: ['u1'] })).toHaveLength(1)
    })

    it('should apply limit', () => {
      expect(store.query({ limit: 2 })).toHaveLength(2)
    })

    it('should apply offset', () => {
      const results = store.query({ offset: 2 })
      expect(results).toHaveLength(2)
    })

    it('should apply both limit and offset', () => {
      const results = store.query({ offset: 1, limit: 2 })
      expect(results).toHaveLength(2)
    })
  })

  describe('count', () => {
    it('should return total count without filter', () => {
      const store = new AuditStore()
      store.add(makeEntry())
      store.add(makeEntry())
      store.add(makeEntry())
      expect(store.count()).toBe(3)
    })

    it('should return filtered count', () => {
      const store = new AuditStore()
      store.add(makeEntry({ severity: 'info' }))
      store.add(makeEntry({ severity: 'error' }))
      store.add(makeEntry({ severity: 'info' }))
      expect(store.count({ severities: ['info'] })).toBe(2)
    })
  })

  describe('getStats', () => {
    it('should return empty stats for empty store', () => {
      const store = new AuditStore()
      const stats = store.getStats()
      expect(stats.total).toBe(0)
      expect(stats.timeRange).toBeNull()
      expect(stats.avgDuration).toBe(0)
    })

    it('should compute stats correctly', () => {
      const store = new AuditStore()
      store.add(makeEntry({ severity: 'info', category: 'auth', action: 'login', timestamp: 1000, duration: 10 }))
      store.add(makeEntry({ severity: 'error', category: 'system', action: 'login', timestamp: 2000, duration: 20 }))
      const stats = store.getStats()
      expect(stats.total).toBe(2)
      expect(stats.bySeverity['info']).toBe(1)
      expect(stats.bySeverity['error']).toBe(1)
      expect(stats.byCategory['auth']).toBe(1)
      expect(stats.byCategory['system']).toBe(1)
      expect(stats.byAction['login']).toBe(2)
      expect(stats.timeRange).toEqual({ start: 1000, end: 2000 })
      expect(stats.avgDuration).toBe(15)
    })

    it('should initialize all severity keys to zero', () => {
      const store = new AuditStore()
      const stats = store.getStats()
      const severities: AuditSeverity[] = ['debug', 'info', 'warning', 'error', 'critical']
      for (const sev of severities) {
        expect(stats.bySeverity[sev]).toBe(0)
      }
    })

    it('should initialize all category keys to zero', () => {
      const store = new AuditStore()
      const stats = store.getStats()
      const categories: AuditCategory[] = ['auth', 'config', 'analysis', 'plugin', 'system', 'performance', 'security']
      for (const cat of categories) {
        expect(stats.byCategory[cat]).toBe(0)
      }
    })

    it('should handle entries without duration', () => {
      const store = new AuditStore()
      store.add(makeEntry({ duration: undefined }))
      expect(store.getStats().avgDuration).toBe(0)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'e1' }))
      store.add(makeEntry({ id: 'e2' }))
      store.clear()
      expect(store.count()).toBe(0)
      expect(store.get('e1')).toBeNull()
    })
  })

  describe('export', () => {
    it('should export as JSON', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'e1', severity: 'info' }))
      const json = store.export('json')
      const parsed = JSON.parse(json)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].id).toBe('e1')
    })

    it('should export as CSV', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'e1', action: 'test' }))
      const csv = store.export('csv')
      const lines = csv.split('\n')
      expect(lines[0]).toBe('id,timestamp,severity,category,action,message,source,userId,sessionId,duration,correlationId')
      expect(lines[1]).toContain('e1')
    })

    it('should export as text', () => {
      const store = new AuditStore()
      store.add(makeEntry({ severity: 'error', action: 'fail', message: 'broken' }))
      const text = store.export('text')
      expect(text).toContain('[ERROR]')
      expect(text).toContain('fail')
      expect(text).toContain('broken')
    })

    it('should return empty array for empty JSON export', () => {
      const store = new AuditStore()
      expect(store.export('json')).toBe('[]')
    })

    it('should return empty string for empty text export', () => {
      const store = new AuditStore()
      expect(store.export('text')).toBe('')
    })
  })

  describe('prune', () => {
    it('should remove oldest entries to fit maxEntries', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'e1' }))
      store.add(makeEntry({ id: 'e2' }))
      store.add(makeEntry({ id: 'e3' }))
      const removed = store.prune(2)
      expect(removed).toBe(1)
      expect(store.count()).toBe(2)
      expect(store.get('e1')).toBeNull()
      expect(store.get('e2')).toBeTruthy()
      expect(store.get('e3')).toBeTruthy()
    })

    it('should return 0 when no pruning needed', () => {
      const store = new AuditStore()
      store.add(makeEntry())
      expect(store.prune(10)).toBe(0)
    })

    it('should clean up correlation index on prune', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'e1', correlationId: 'corr1' }))
      store.add(makeEntry({ id: 'e2', correlationId: 'corr1' }))
      store.prune(1)
      expect(store.getByCorrelationId('corr1')).toHaveLength(1)
    })
  })

  describe('getByTimeRange', () => {
    it('should return entries within range', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'e1', timestamp: 1000 }))
      store.add(makeEntry({ id: 'e2', timestamp: 2000 }))
      store.add(makeEntry({ id: 'e3', timestamp: 3000 }))
      const results = store.getByTimeRange(1500, 2500)
      expect(results).toHaveLength(1)
      expect(results[0]!.id).toBe('e2')
    })

    it('should include boundary values', () => {
      const store = new AuditStore()
      store.add(makeEntry({ timestamp: 1000 }))
      store.add(makeEntry({ timestamp: 2000 }))
      expect(store.getByTimeRange(1000, 2000)).toHaveLength(2)
    })

    it('should return empty for no matches', () => {
      const store = new AuditStore()
      store.add(makeEntry({ timestamp: 5000 }))
      expect(store.getByTimeRange(1000, 2000)).toHaveLength(0)
    })
  })

  describe('getByCorrelationId', () => {
    it('should return entries with matching correlationId', () => {
      const store = new AuditStore()
      store.add(makeEntry({ id: 'e1', correlationId: 'corr1' }))
      store.add(makeEntry({ id: 'e2', correlationId: 'corr1' }))
      store.add(makeEntry({ id: 'e3', correlationId: 'corr2' }))
      expect(store.getByCorrelationId('corr1')).toHaveLength(2)
    })

    it('should return empty array for non-existent correlationId', () => {
      const store = new AuditStore()
      expect(store.getByCorrelationId('nonexistent')).toEqual([])
    })
  })
})

describe('AuditLogger', () => {
  describe('constructor', () => {
    it('should use default config when no config provided', () => {
      const logger = new AuditLogger()
      const config = logger.getConfig()
      expect(config.minSeverity).toBe(DEFAULT_AUDIT_LOGGER_CONFIG.minSeverity)
      expect(config.maxEntries).toBe(DEFAULT_AUDIT_LOGGER_CONFIG.maxEntries)
      expect(config.outputFormat).toBe(DEFAULT_AUDIT_LOGGER_CONFIG.outputFormat)
    })

    it('should merge partial config', () => {
      const logger = new AuditLogger({ minSeverity: 'warning', maxEntries: 500 })
      const config = logger.getConfig()
      expect(config.minSeverity).toBe('warning')
      expect(config.maxEntries).toBe(500)
      expect(config.outputFormat).toBe(DEFAULT_AUDIT_LOGGER_CONFIG.outputFormat)
    })

    it('should return a copy of config', () => {
      const logger = new AuditLogger()
      const config = logger.getConfig()
      config.minSeverity = 'critical'
      expect(logger.getConfig().minSeverity).toBe('debug')
    })
  })

  describe('log', () => {
    it('should log entry and return id', () => {
      const logger = new AuditLogger()
      const id = logger.log('test.action', 'test message')
      expect(id).toBeTruthy()
      expect(id.startsWith('audit_')).toBe(true)
      expect(logger.getEntry(id)).toBeTruthy()
    })

    it('should log entry with all options', () => {
      const logger = new AuditLogger()
      const id = logger.log('action', 'msg', {
        severity: 'error',
        category: 'auth',
        userId: 'u1',
        sessionId: 's1',
        source: 'custom',
        duration: 42,
        correlationId: 'corr1',
        metadata: { key: 'value' },
      })
      const entry = logger.getEntry(id)
      expect(entry!.severity).toBe('error')
      expect(entry!.category).toBe('auth')
      expect(entry!.userId).toBe('u1')
      expect(entry!.sessionId).toBe('s1')
      expect(entry!.source).toBe('custom')
      expect(entry!.duration).toBe(42)
      expect(entry!.correlationId).toBe('corr1')
      expect(entry!.metadata).toEqual({ key: 'value' })
    })

    it('should default to info severity when not specified', () => {
      const logger = new AuditLogger()
      const id = logger.log('action', 'msg')
      expect(logger.getEntry(id)!.severity).toBe('info')
    })

    it('should default to system category when not specified', () => {
      const logger = new AuditLogger()
      const id = logger.log('action', 'msg')
      expect(logger.getEntry(id)!.category).toBe('system')
    })

    it('should default source to audit-logger', () => {
      const logger = new AuditLogger()
      const id = logger.log('action', 'msg')
      expect(logger.getEntry(id)!.source).toBe('audit-logger')
    })
  })

  describe('severity methods', () => {
    it('debug should log with debug severity', () => {
      const logger = new AuditLogger()
      const id = logger.debug('action', 'msg')
      expect(logger.getEntry(id)!.severity).toBe('debug')
    })

    it('info should log with info severity', () => {
      const logger = new AuditLogger()
      const id = logger.info('action', 'msg')
      expect(logger.getEntry(id)!.severity).toBe('info')
    })

    it('warn should log with warning severity', () => {
      const logger = new AuditLogger()
      const id = logger.warn('action', 'msg')
      expect(logger.getEntry(id)!.severity).toBe('warning')
    })

    it('error should log with error severity', () => {
      const logger = new AuditLogger()
      const id = logger.error('action', 'msg')
      expect(logger.getEntry(id)!.severity).toBe('error')
    })

    it('critical should log with critical severity', () => {
      const logger = new AuditLogger()
      const id = logger.critical('action', 'msg')
      expect(logger.getEntry(id)!.severity).toBe('critical')
    })

    it('should pass metadata to severity methods', () => {
      const logger = new AuditLogger()
      const id = logger.info('action', 'msg', { detail: 'extra' })
      expect(logger.getEntry(id)!.metadata).toEqual({ detail: 'extra' })
    })
  })

  describe('minSeverity filtering', () => {
    it('should filter entries below minSeverity', () => {
      const logger = new AuditLogger({ minSeverity: 'warning' })
      const debugId = logger.debug('action', 'debug msg')
      const infoId = logger.info('action', 'info msg')
      const warnId = logger.warn('action', 'warn msg')
      expect(debugId).toBe('')
      expect(infoId).toBe('')
      expect(warnId).toBeTruthy()
      expect(logger.getEntries()).toHaveLength(1)
    })

    it('should allow all entries when minSeverity is debug', () => {
      const logger = new AuditLogger({ minSeverity: 'debug' })
      logger.debug('a', 'm')
      logger.info('b', 'm')
      logger.warn('c', 'm')
      expect(logger.getEntries()).toHaveLength(3)
    })
  })

  describe('category filtering', () => {
    it('should filter entries by enabledCategories', () => {
      const logger = new AuditLogger({ enabledCategories: ['auth', 'system'] })
      const id1 = logger.log('a', 'm', { category: 'auth' })
      const id2 = logger.log('b', 'm', { category: 'config' })
      expect(id1).toBeTruthy()
      expect(id2).toBe('')
    })

    it('should allow all categories when enabledCategories is null', () => {
      const logger = new AuditLogger({ enabledCategories: null })
      logger.log('a', 'm', { category: 'auth' })
      logger.log('b', 'm', { category: 'config' })
      expect(logger.getEntries()).toHaveLength(2)
    })
  })

  describe('getEntries', () => {
    it('should return all entries with no filter', () => {
      const logger = new AuditLogger()
      logger.info('a', 'm1')
      logger.info('b', 'm2')
      expect(logger.getEntries()).toHaveLength(2)
    })

    it('should filter entries', () => {
      const logger = new AuditLogger()
      logger.log('a', 'm', { severity: 'info' })
      logger.log('b', 'm', { severity: 'error' })
      const filtered = logger.getEntries({ severities: ['error'] })
      expect(filtered).toHaveLength(1)
      expect(filtered[0]!.action).toBe('b')
    })
  })

  describe('getEntry', () => {
    it('should return specific entry by id', () => {
      const logger = new AuditLogger()
      const id = logger.info('test', 'msg')
      const entry = logger.getEntry(id)
      expect(entry).toBeTruthy()
      expect(entry!.action).toBe('test')
    })

    it('should return null for non-existent id', () => {
      const logger = new AuditLogger()
      expect(logger.getEntry('nonexistent')).toBeNull()
    })
  })

  describe('getStats', () => {
    it('should return stats from store', () => {
      const logger = new AuditLogger()
      logger.info('a', 'm')
      logger.error('b', 'm')
      const stats = logger.getStats()
      expect(stats.total).toBe(2)
      expect(stats.bySeverity['info']).toBe(1)
      expect(stats.bySeverity['error']).toBe(1)
    })
  })

  describe('export', () => {
    it('should export using configured format', () => {
      const logger = new AuditLogger({ outputFormat: 'json' })
      logger.info('test', 'msg')
      const exported = logger.export()
      const parsed = JSON.parse(exported)
      expect(parsed).toHaveLength(1)
    })

    it('should export using specified format', () => {
      const logger = new AuditLogger({ outputFormat: 'json' })
      logger.info('test', 'msg')
      const csv = logger.export('csv')
      expect(csv).toContain('id,')
      expect(csv).toContain('test')
    })
  })

  describe('setMinSeverity', () => {
    it('should update min severity', () => {
      const logger = new AuditLogger()
      logger.info('a', 'm')
      expect(logger.getEntries()).toHaveLength(1)
      logger.setMinSeverity('error')
      logger.info('b', 'm')
      expect(logger.getEntries()).toHaveLength(1)
      logger.error('c', 'm')
      expect(logger.getEntries()).toHaveLength(2)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      const logger = new AuditLogger()
      logger.info('a', 'm')
      logger.info('b', 'm')
      logger.clear()
      expect(logger.getEntries()).toHaveLength(0)
      expect(logger.getStats().total).toBe(0)
    })
  })

  describe('onEntry', () => {
    it('should call callback for each logged entry', () => {
      const logger = new AuditLogger()
      const received: AuditEntryData[] = []
      logger.onEntry((entry) => received.push(entry))
      logger.info('a', 'm1')
      logger.error('b', 'm2')
      expect(received).toHaveLength(2)
      expect(received[0]!.action).toBe('a')
      expect(received[1]!.action).toBe('b')
    })

    it('should not call callback for filtered entries', () => {
      const logger = new AuditLogger({ minSeverity: 'error' })
      const received: AuditEntryData[] = []
      logger.onEntry((entry) => received.push(entry))
      logger.info('a', 'm')
      logger.error('b', 'm')
      expect(received).toHaveLength(1)
      expect(received[0]!.severity).toBe('error')
    })
  })

  describe('redaction', () => {
    it('should redact configured fields', () => {
      const logger = new AuditLogger({ redactFields: ['password', 'token'] })
      const id = logger.log('action', 'msg', {
        metadata: { password: 'secret', token: 'abc123', name: 'visible' },
      })
      const entry = logger.getEntry(id)
      expect(entry!.metadata['password']).toBe('[REDACTED]')
      expect(entry!.metadata['token']).toBe('[REDACTED]')
      expect(entry!.metadata['name']).toBe('visible')
    })

    it('should not redact when redactFields is empty', () => {
      const logger = new AuditLogger({ redactFields: [] })
      const id = logger.log('action', 'msg', {
        metadata: { secret: 'value' },
      })
      expect(logger.getEntry(id)!.metadata['secret']).toBe('value')
    })
  })

  describe('maxEntries', () => {
    it('should prune entries when exceeding maxEntries', () => {
      const logger = new AuditLogger({ maxEntries: 3 })
      logger.info('a', 'm1')
      logger.info('b', 'm2')
      logger.info('c', 'm3')
      logger.info('d', 'm4')
      expect(logger.getEntries()).toHaveLength(3)
      const entries = logger.getEntries()
      expect(entries[0]!.action).toBe('b')
      expect(entries[2]!.action).toBe('d')
    })
  })

  describe('SEVERITY_LEVELS constant', () => {
    it('should have all severity levels defined', () => {
      expect(SEVERITY_LEVELS['debug']).toBe(0)
      expect(SEVERITY_LEVELS['info']).toBe(1)
      expect(SEVERITY_LEVELS['warning']).toBe(2)
      expect(SEVERITY_LEVELS['error']).toBe(3)
      expect(SEVERITY_LEVELS['critical']).toBe(4)
    })
  })

  describe('DEFAULT_AUDIT_LOGGER_CONFIG', () => {
    it('should have expected default values', () => {
      expect(DEFAULT_AUDIT_LOGGER_CONFIG.minSeverity).toBe('debug')
      expect(DEFAULT_AUDIT_LOGGER_CONFIG.enabledCategories).toBeNull()
      expect(DEFAULT_AUDIT_LOGGER_CONFIG.maxEntries).toBe(10000)
      expect(DEFAULT_AUDIT_LOGGER_CONFIG.outputFormat).toBe('json')
      expect(DEFAULT_AUDIT_LOGGER_CONFIG.includeTimestamps).toBe(true)
      expect(DEFAULT_AUDIT_LOGGER_CONFIG.redactFields).toEqual([])
    })
  })
})
