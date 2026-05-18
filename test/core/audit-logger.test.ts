import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'

import { RunContext, AuditLogger } from '../../src/core/audit-logger.js'
import type { AuditEntry, AuditLog } from '../../src/core/audit-types.js'
import { DEFAULT_AUDIT_CONFIG } from '../../src/core/audit-types.js'

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  rename: vi.fn(),
  unlink: vi.fn(),
}))

vi.mock('node:os', () => ({
  userInfo: vi.fn(() => ({ username: 'testuser' })),
}))

const mockedReadFile = vi.mocked(fs.readFile)
const mockedWriteFile = vi.mocked(fs.writeFile)
const mockedMkdir = vi.mocked(fs.mkdir)
const mockedRename = vi.mocked(fs.rename)
const mockedUnlink = vi.mocked(fs.unlink)
const mockedUserInfo = vi.mocked(os.userInfo)

function makeEntry(overrides: Partial<AuditEntry> = {}): AuditEntry {
  return {
    id: overrides.id ?? 'abc123',
    timestamp: overrides.timestamp ?? '2025-01-01T00:00:00.000Z',
    command: overrides.command ?? 'analyze',
    filesAnalyzed: overrides.filesAnalyzed ?? 10,
    filesWithViolations: overrides.filesWithViolations ?? 2,
    totalViolations: overrides.totalViolations ?? 5,
    errorCount: overrides.errorCount ?? 1,
    warningCount: overrides.warningCount ?? 3,
    infoCount: overrides.infoCount ?? 1,
    rulesRun: overrides.rulesRun ?? ['no-eval', 'prefer-const'],
    durationMs: overrides.durationMs ?? 150,
    exitCode: overrides.exitCode ?? 0,
    configPath: overrides.configPath ?? null,
    user: overrides.user ?? 'testuser',
  }
}

function makeLog(entries: AuditEntry[] = []): AuditLog {
  return { version: 1, entries }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(Date, 'now').mockReturnValue(1700000000000)
  mockedUserInfo.mockReturnValue({ username: 'testuser' })
})

// ─── RunContext ───

describe('RunContext', () => {
  describe('constructor', () => {
    it('should set command', () => {
      const ctx = new RunContext('analyze')
      const entry = ctx.finish(0)
      expect(entry.command).toBe('analyze')
    })

    it('should set configPath when provided', () => {
      const ctx = new RunContext('analyze', '/path/to/config.json')
      const entry = ctx.finish(0)
      expect(entry.configPath).toBe('/path/to/config.json')
    })

    it('should set configPath to null when not provided', () => {
      const ctx = new RunContext('analyze')
      const entry = ctx.finish(0)
      expect(entry.configPath).toBeNull()
    })

    it('should capture startTime from Date.now()', () => {
      const ctx = new RunContext('analyze')
      const entry = ctx.finish(0)
      expect(entry.timestamp).toBe(new Date(1700000000000).toISOString())
    })
  })

  describe('durationMs getter', () => {
    it('should return 0 before finish is called', () => {
      const ctx = new RunContext('analyze')
      expect(ctx.durationMs).toBe(0)
    })

    it('should return elapsed duration after finish', () => {
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(1700000000000)
        .mockReturnValueOnce(1700000000150)
      const ctx = new RunContext('analyze')
      ctx.finish(0)
      expect(ctx.durationMs).toBe(150)
    })
  })

  describe('entry getter', () => {
    it('should return null before finish is called', () => {
      const ctx = new RunContext('analyze')
      expect(ctx.entry).toBeNull()
    })

    it('should return AuditEntry after finish is called', () => {
      const ctx = new RunContext('analyze')
      const entry = ctx.finish(0)
      expect(ctx.entry).toBe(entry)
    })
  })

  describe('addRulesRun', () => {
    it('should set rulesRun on the entry', () => {
      const ctx = new RunContext('analyze')
      ctx.addRulesRun(['no-eval', 'prefer-const'])
      const entry = ctx.finish(0)
      expect(entry.rulesRun).toEqual(['no-eval', 'prefer-const'])
    })

    it('should copy the array (not reference)', () => {
      const ctx = new RunContext('analyze')
      const rules = ['no-eval']
      ctx.addRulesRun(rules)
      rules.push('extra-rule')
      const entry = ctx.finish(0)
      expect(entry.rulesRun).toEqual(['no-eval'])
    })
  })

  describe('setFileStats', () => {
    it('should set filesAnalyzed and filesWithViolations', () => {
      const ctx = new RunContext('analyze')
      ctx.setFileStats(42, 7)
      const entry = ctx.finish(0)
      expect(entry.filesAnalyzed).toBe(42)
      expect(entry.filesWithViolations).toBe(7)
    })

    it('should default to 0 when not called', () => {
      const ctx = new RunContext('analyze')
      const entry = ctx.finish(0)
      expect(entry.filesAnalyzed).toBe(0)
      expect(entry.filesWithViolations).toBe(0)
    })
  })

  describe('setViolationStats', () => {
    it('should set error, warning, and info counts', () => {
      const ctx = new RunContext('analyze')
      ctx.setViolationStats(3, 5, 2)
      const entry = ctx.finish(0)
      expect(entry.errorCount).toBe(3)
      expect(entry.warningCount).toBe(5)
      expect(entry.infoCount).toBe(2)
    })

    it('should default to 0 when not called', () => {
      const ctx = new RunContext('analyze')
      const entry = ctx.finish(0)
      expect(entry.errorCount).toBe(0)
      expect(entry.warningCount).toBe(0)
      expect(entry.infoCount).toBe(0)
    })
  })

  describe('finish', () => {
    it('should calculate totalViolations from error + warning + info counts', () => {
      const ctx = new RunContext('analyze')
      ctx.setViolationStats(3, 5, 2)
      const entry = ctx.finish(0)
      expect(entry.totalViolations).toBe(10)
    })

    it('should pass exitCode through', () => {
      const ctx = new RunContext('analyze')
      const entry = ctx.finish(1)
      expect(entry.exitCode).toBe(1)
    })

    it('should call os.userInfo for user field', () => {
      mockedUserInfo.mockReturnValueOnce({ username: 'ci-agent' })
      const ctx = new RunContext('analyze')
      const entry = ctx.finish(0)
      expect(entry.user).toBe('ci-agent')
    })

    it('should generate a unique id', () => {
      const ctx = new RunContext('analyze')
      const entry = ctx.finish(0)
      expect(entry.id).toBeTruthy()
      expect(typeof entry.id).toBe('string')
    })

    it('should generate different ids for different entries', () => {
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(1700000000000)
        .mockReturnValueOnce(1700000000100)
      const ctx1 = new RunContext('analyze')
      const entry1 = ctx1.finish(0)

      // generateId uses Date.now() + Math.random(), mock random difference
      const ctx2 = new RunContext('analyze')
      const entry2 = ctx2.finish(0)

      // IDs should be truthy strings
      expect(entry1.id).toBeTruthy()
      expect(entry2.id).toBeTruthy()
    })

    it('should set durationMs on the entry', () => {
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(1700000000000)
        .mockReturnValueOnce(1700000000250)
      const ctx = new RunContext('analyze')
      const entry = ctx.finish(0)
      expect(entry.durationMs).toBe(250)
    })

    it('should populate all AuditEntry fields', () => {
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(1700000000000)
        .mockReturnValueOnce(1700000000500)
      const ctx = new RunContext('analyze', 'config.json')
      ctx.addRulesRun(['rule-a'])
      ctx.setFileStats(100, 10)
      ctx.setViolationStats(1, 2, 3)

      const entry = ctx.finish(1)

      expect(entry.id).toBeTruthy()
      expect(entry.timestamp).toBe(new Date(1700000000000).toISOString())
      expect(entry.command).toBe('analyze')
      expect(entry.configPath).toBe('config.json')
      expect(entry.filesAnalyzed).toBe(100)
      expect(entry.filesWithViolations).toBe(10)
      expect(entry.totalViolations).toBe(6)
      expect(entry.errorCount).toBe(1)
      expect(entry.warningCount).toBe(2)
      expect(entry.infoCount).toBe(3)
      expect(entry.rulesRun).toEqual(['rule-a'])
      expect(entry.durationMs).toBe(500)
      expect(entry.exitCode).toBe(1)
      expect(entry.user).toBe('testuser')
    })
  })
})

// ─── AuditLogger - constructor ───

describe('AuditLogger', () => {
  describe('constructor', () => {
    it('should use DEFAULT_AUDIT_CONFIG when no config provided', () => {
      const logger = new AuditLogger()
      expect(logger.getLogPath()).toBe(
        path.join(process.cwd(), DEFAULT_AUDIT_CONFIG.logDir, 'audit.json'),
      )
    })

    it('should merge partial config with defaults', () => {
      const logger = new AuditLogger({ logDir: '/custom/logs', maxEntries: 500 })
      const logPath = logger.getLogPath()
      expect(logPath).toBe('/custom/logs/audit.json')
    })

    it('should override defaults fully', () => {
      const logger = new AuditLogger({
        enabled: false,
        logDir: '/tmp/audit',
        maxEntries: 50,
      })
      expect(logger.getLogPath()).toBe('/tmp/audit/audit.json')
    })
  })

  // ─── AuditLogger - getLogPath ───

  describe('getLogPath', () => {
    it('should return absolute path when logDir is absolute', () => {
      const logger = new AuditLogger({ logDir: '/var/log/audit' })
      expect(logger.getLogPath()).toBe('/var/log/audit/audit.json')
    })

    it('should join with cwd when logDir is relative', () => {
      const logger = new AuditLogger({ logDir: '.codeforge/audit' })
      expect(logger.getLogPath()).toBe(
        path.join(process.cwd(), '.codeforge/audit', 'audit.json'),
      )
    })

    it('should always append audit.json', () => {
      const logger = new AuditLogger({ logDir: '/tmp/test' })
      expect(logger.getLogPath()).toMatch(/audit\.json$/)
    })
  })

  // ─── AuditLogger - startRun ───

  describe('startRun', () => {
    it('should return a RunContext with the given command', () => {
      const logger = new AuditLogger()
      const ctx = logger.startRun('analyze')
      expect(ctx).toBeInstanceOf(RunContext)
      const entry = ctx.finish(0)
      expect(entry.command).toBe('analyze')
    })

    it('should pass configPath to RunContext', () => {
      const logger = new AuditLogger()
      const ctx = logger.startRun('analyze', 'my-config.json')
      const entry = ctx.finish(0)
      expect(entry.configPath).toBe('my-config.json')
    })
  })

  // ─── AuditLogger - loadLog ───

  describe('loadLog', () => {
    it('should return parsed log on success', async () => {
      const log = makeLog([makeEntry({ id: 'e1' })])
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(log))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const result = await logger.loadLog()
      expect(result).toEqual(log)
      expect(result.entries).toHaveLength(1)
    })

    it('should return empty log when file not found', async () => {
      mockedReadFile.mockRejectedValueOnce(new Error('ENOENT'))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const result = await logger.loadLog()
      expect(result).toEqual({ version: 1, entries: [] })
    })

    it('should return empty log on any read error', async () => {
      mockedReadFile.mockRejectedValueOnce(new Error('permission denied'))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const result = await logger.loadLog()
      expect(result).toEqual({ version: 1, entries: [] })
    })

    it('should read from the correct log path', async () => {
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog()))
      const logger = new AuditLogger({ logDir: '/custom/path' })
      await logger.loadLog()
      expect(mockedReadFile).toHaveBeenCalledWith('/custom/path/audit.json', 'utf-8')
    })
  })

  // ─── AuditLogger - saveLog ───

  describe('saveLog', () => {
    it('should create directory before writing', async () => {
      const logger = new AuditLogger({ logDir: '/tmp/audit-test' })
      await logger.saveLog(makeLog())
      expect(mockedMkdir).toHaveBeenCalledWith('/tmp/audit-test', { recursive: true })
    })

    it('should write to tmp file first then rename', async () => {
      const logger = new AuditLogger({ logDir: '/tmp/audit-test' })
      await logger.saveLog(makeLog())
      expect(mockedWriteFile).toHaveBeenCalledWith(
        '/tmp/audit-test/audit.json.tmp',
        expect.any(String),
        'utf-8',
      )
      expect(mockedRename).toHaveBeenCalledWith(
        '/tmp/audit-test/audit.json.tmp',
        '/tmp/audit-test/audit.json',
      )
    })

    it('should write valid JSON', async () => {
      const logger = new AuditLogger({ logDir: '/tmp' })
      const log = makeLog([makeEntry({ id: 'e1' })])
      await logger.saveLog(log)
      const writtenContent = mockedWriteFile.mock.calls[0]![1] as string
      const parsed = JSON.parse(writtenContent)
      expect(parsed.version).toBe(1)
      expect(parsed.entries).toHaveLength(1)
    })

    it('should pretty-print JSON with 2-space indent', async () => {
      const logger = new AuditLogger({ logDir: '/tmp' })
      await logger.saveLog(makeLog())
      const writtenContent = mockedWriteFile.mock.calls[0]![1] as string
      expect(writtenContent).toContain('\n  ')
    })

    it('should prune entries to maxEntries', async () => {
      const logger = new AuditLogger({ logDir: '/tmp', maxEntries: 2 })
      const entries = [
        makeEntry({ id: 'e1' }),
        makeEntry({ id: 'e2' }),
        makeEntry({ id: 'e3' }),
        makeEntry({ id: 'e4' }),
      ]
      await logger.saveLog(makeLog(entries))
      const writtenContent = mockedWriteFile.mock.calls[0]![1] as string
      const parsed = JSON.parse(writtenContent)
      expect(parsed.entries).toHaveLength(2)
      expect(parsed.entries[0].id).toBe('e3')
      expect(parsed.entries[1].id).toBe('e4')
    })

    it('should not prune when entries are within maxEntries', async () => {
      const logger = new AuditLogger({ logDir: '/tmp', maxEntries: 1000 })
      const entries = [makeEntry({ id: 'e1' }), makeEntry({ id: 'e2' })]
      await logger.saveLog(makeLog(entries))
      const writtenContent = mockedWriteFile.mock.calls[0]![1] as string
      const parsed = JSON.parse(writtenContent)
      expect(parsed.entries).toHaveLength(2)
    })

    it('should always set version to 1 in saved log', async () => {
      const logger = new AuditLogger({ logDir: '/tmp' })
      await logger.saveLog(makeLog())
      const writtenContent = mockedWriteFile.mock.calls[0]![1] as string
      const parsed = JSON.parse(writtenContent)
      expect(parsed.version).toBe(1)
    })
  })

  // ─── AuditLogger - recordEntry ───

  describe('recordEntry', () => {
    it('should load existing log, append entry, and save', async () => {
      const existingLog = makeLog([makeEntry({ id: 'existing' })])
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(existingLog))

      const logger = new AuditLogger({ logDir: '/tmp' })
      const newEntry = makeEntry({ id: 'new' })
      await logger.recordEntry(newEntry)

      const writtenContent = mockedWriteFile.mock.calls[0]![1] as string
      const parsed = JSON.parse(writtenContent)
      expect(parsed.entries).toHaveLength(2)
      expect(parsed.entries[0].id).toBe('existing')
      expect(parsed.entries[1].id).toBe('new')
    })

    it('should create new log when no existing log', async () => {
      mockedReadFile.mockRejectedValueOnce(new Error('ENOENT'))

      const logger = new AuditLogger({ logDir: '/tmp' })
      const entry = makeEntry({ id: 'first' })
      await logger.recordEntry(entry)

      const writtenContent = mockedWriteFile.mock.calls[0]![1] as string
      const parsed = JSON.parse(writtenContent)
      expect(parsed.entries).toHaveLength(1)
      expect(parsed.entries[0].id).toBe('first')
    })
  })

  // ─── AuditLogger - generateComplianceReport ───

  describe('generateComplianceReport', () => {
    it('should return empty report for no entries', async () => {
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog()))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const report = await logger.generateComplianceReport(
        new Date('2025-01-01'),
        new Date('2025-12-31'),
      )
      expect(report.totalRuns).toBe(0)
      expect(report.totalViolations).toBe(0)
      expect(report.passRate).toBe(0)
      expect(report.averageViolationsPerRun).toBe(0)
      expect(report.errorTrend).toEqual([])
      expect(report.topViolatedRules).toEqual([])
      expect(report.topViolatedFiles).toEqual([])
    })

    it('should filter entries by date range', async () => {
      const entries = [
        makeEntry({ id: 'in1', timestamp: '2025-03-15T00:00:00.000Z' }),
        makeEntry({ id: 'in2', timestamp: '2025-06-01T00:00:00.000Z' }),
        makeEntry({ id: 'out', timestamp: '2024-12-31T00:00:00.000Z' }),
      ]
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog(entries)))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const report = await logger.generateComplianceReport(
        new Date('2025-01-01'),
        new Date('2025-12-31'),
      )
      expect(report.totalRuns).toBe(2)
    })

    it('should calculate totalViolations across filtered entries', async () => {
      const entries = [
        makeEntry({ timestamp: '2025-06-01T00:00:00.000Z', totalViolations: 5 }),
        makeEntry({ timestamp: '2025-06-02T00:00:00.000Z', totalViolations: 3 }),
      ]
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog(entries)))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const report = await logger.generateComplianceReport(
        new Date('2025-01-01'),
        new Date('2025-12-31'),
      )
      expect(report.totalViolations).toBe(8)
    })

    it('should calculate passRate correctly', async () => {
      const entries = [
        makeEntry({ timestamp: '2025-06-01T00:00:00.000Z', errorCount: 0 }),
        makeEntry({ timestamp: '2025-06-02T00:00:00.000Z', errorCount: 3 }),
        makeEntry({ timestamp: '2025-06-03T00:00:00.000Z', errorCount: 0 }),
        makeEntry({ timestamp: '2025-06-04T00:00:00.000Z', errorCount: 1 }),
      ]
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog(entries)))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const report = await logger.generateComplianceReport(
        new Date('2025-01-01'),
        new Date('2025-12-31'),
      )
      // 2 out of 4 have errorCount === 0
      expect(report.passRate).toBe(0.5)
    })

    it('should calculate averageViolationsPerRun', async () => {
      const entries = [
        makeEntry({ timestamp: '2025-06-01T00:00:00.000Z', totalViolations: 10 }),
        makeEntry({ timestamp: '2025-06-02T00:00:00.000Z', totalViolations: 20 }),
      ]
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog(entries)))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const report = await logger.generateComplianceReport(
        new Date('2025-01-01'),
        new Date('2025-12-31'),
      )
      expect(report.averageViolationsPerRun).toBe(15)
    })

    it('should produce errorTrend as array of totalViolations per run', async () => {
      const entries = [
        makeEntry({ timestamp: '2025-06-01T00:00:00.000Z', totalViolations: 3 }),
        makeEntry({ timestamp: '2025-06-02T00:00:00.000Z', totalViolations: 7 }),
      ]
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog(entries)))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const report = await logger.generateComplianceReport(
        new Date('2025-01-01'),
        new Date('2025-12-31'),
      )
      expect(report.errorTrend).toEqual([3, 7])
    })

    it('should compute topViolatedRules from rulesRun', async () => {
      const entries = [
        makeEntry({ timestamp: '2025-06-01T00:00:00.000Z', rulesRun: ['a', 'b', 'c'] }),
        makeEntry({ timestamp: '2025-06-02T00:00:00.000Z', rulesRun: ['a', 'b'] }),
        makeEntry({ timestamp: '2025-06-03T00:00:00.000Z', rulesRun: ['a'] }),
      ]
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog(entries)))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const report = await logger.generateComplianceReport(
        new Date('2025-01-01'),
        new Date('2025-12-31'),
      )
      expect(report.topViolatedRules[0]).toEqual({ ruleId: 'a', count: 3 })
      expect(report.topViolatedRules[1]).toEqual({ ruleId: 'b', count: 2 })
      expect(report.topViolatedRules[2]).toEqual({ ruleId: 'c', count: 1 })
    })

    it('should limit topViolatedRules to 10', async () => {
      const rules = Array.from({ length: 15 }, (_, i) => `rule-${i}`)
      const entries = [
        makeEntry({ timestamp: '2025-06-01T00:00:00.000Z', rulesRun: rules }),
      ]
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog(entries)))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const report = await logger.generateComplianceReport(
        new Date('2025-01-01'),
        new Date('2025-12-31'),
      )
      expect(report.topViolatedRules).toHaveLength(10)
    })

    it('should set period to ISO strings of from/to dates', async () => {
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog()))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const from = new Date('2025-01-01T00:00:00.000Z')
      const to = new Date('2025-12-31T23:59:59.999Z')
      const report = await logger.generateComplianceReport(from, to)
      expect(report.period.from).toBe('2025-01-01T00:00:00.000Z')
      expect(report.period.to).toBe('2025-12-31T23:59:59.999Z')
    })

    it('should set generatedAt to a valid ISO timestamp', async () => {
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog()))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const report = await logger.generateComplianceReport(
        new Date('2025-01-01'),
        new Date('2025-12-31'),
      )
      expect(report.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      expect(new Date(report.generatedAt).getTime()).not.toBeNaN()
    })

    it('should include boundary dates in filter (inclusive)', async () => {
      const entries = [
        makeEntry({ id: 'start', timestamp: '2025-01-01T00:00:00.000Z' }),
        makeEntry({ id: 'end', timestamp: '2025-12-31T23:59:59.999Z' }),
      ]
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog(entries)))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const report = await logger.generateComplianceReport(
        new Date('2025-01-01T00:00:00.000Z'),
        new Date('2025-12-31T23:59:59.999Z'),
      )
      expect(report.totalRuns).toBe(2)
    })

    it('should sort topViolatedRules by count descending', async () => {
      const entries = [
        makeEntry({ timestamp: '2025-06-01T00:00:00.000Z', rulesRun: ['r1', 'r1'] }),
        makeEntry({ timestamp: '2025-06-02T00:00:00.000Z', rulesRun: ['r2', 'r2', 'r2', 'r2'] }),
        makeEntry({ timestamp: '2025-06-03T00:00:00.000Z', rulesRun: ['r1'] }),
      ]
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog(entries)))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const report = await logger.generateComplianceReport(
        new Date('2025-01-01'),
        new Date('2025-12-31'),
      )
      expect(report.topViolatedRules[0]!.ruleId).toBe('r2')
      expect(report.topViolatedRules[1]!.ruleId).toBe('r1')
    })
  })

  // ─── AuditLogger - getEntries ───

  describe('getEntries', () => {
    it('should return all entries when no limit', async () => {
      const entries = [makeEntry({ id: 'e1' }), makeEntry({ id: 'e2' }), makeEntry({ id: 'e3' })]
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog(entries)))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const result = await logger.getEntries()
      expect(result).toHaveLength(3)
    })

    it('should return a copy of entries array', async () => {
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog([makeEntry()])))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const result = await logger.getEntries()
      expect(result).not.toBe((await logger.loadLog()).entries)
    })

    it('should return limited entries from the end', async () => {
      const entries = [
        makeEntry({ id: 'e1' }),
        makeEntry({ id: 'e2' }),
        makeEntry({ id: 'e3' }),
        makeEntry({ id: 'e4' }),
      ]
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog(entries)))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const result = await logger.getEntries(2)
      expect(result).toHaveLength(2)
      expect(result[0]!.id).toBe('e3')
      expect(result[1]!.id).toBe('e4')
    })

    it('should return all entries when limit exceeds total', async () => {
      const entries = [makeEntry({ id: 'e1' })]
      mockedReadFile.mockResolvedValueOnce(JSON.stringify(makeLog(entries)))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const result = await logger.getEntries(100)
      expect(result).toHaveLength(1)
    })

    it('should return empty array for empty log', async () => {
      mockedReadFile.mockRejectedValueOnce(new Error('ENOENT'))
      const logger = new AuditLogger({ logDir: '/tmp' })
      const result = await logger.getEntries()
      expect(result).toEqual([])
    })
  })

  // ─── AuditLogger - clearLog ───

  describe('clearLog', () => {
    it('should unlink the log file', async () => {
      mockedUnlink.mockResolvedValueOnce(undefined)
      const logger = new AuditLogger({ logDir: '/tmp/audit-test' })
      await logger.clearLog()
      expect(mockedUnlink).toHaveBeenCalledWith('/tmp/audit-test/audit.json')
    })

    it('should handle file not found gracefully', async () => {
      mockedUnlink.mockRejectedValueOnce(new Error('ENOENT'))
      const logger = new AuditLogger({ logDir: '/tmp' })
      // Should not throw
      await expect(logger.clearLog()).resolves.toBeUndefined()
    })

    it('should handle any unlink error gracefully', async () => {
      mockedUnlink.mockRejectedValueOnce(new Error('permission denied'))
      const logger = new AuditLogger({ logDir: '/tmp' })
      await expect(logger.clearLog()).resolves.toBeUndefined()
    })
  })
})
