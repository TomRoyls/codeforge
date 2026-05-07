import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'

import { afterEach, describe, expect, test } from 'vitest'

import type { AuditEntry, AuditLog } from '../../../src/core/audit-types.js'

import { AuditLogger, RunContext } from '../../../src/core/audit-logger.js'

let tmpDir: string

afterEach(async () => {
  if (tmpDir) {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  }
})

async function makeLogger(maxEntries = 1000): Promise<AuditLogger> {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-audit-'))
  return new AuditLogger({ logDir: tmpDir, maxEntries })
}

function makeEntry(overrides?: Partial<AuditEntry>): AuditEntry {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    timestamp: new Date().toISOString(),
    command: 'analyze',
    filesAnalyzed: 10,
    filesWithViolations: 3,
    totalViolations: 5,
    errorCount: 1,
    warningCount: 2,
    infoCount: 2,
    rulesRun: ['no-eval', 'prefer-const'],
    durationMs: 150,
    exitCode: 0,
    configPath: null,
    user: null,
    ...overrides,
  }
}

describe('RunContext', () => {
  test('creates with command', () => {
    const ctx = new RunContext('analyze')
    expect(ctx.startTime).toBeGreaterThan(0)
    expect(ctx.durationMs).toBe(0)
    expect(ctx.entry).toBeNull()
  })

  test('creates with configPath', () => {
    const ctx = new RunContext('analyze', '.codeforgerc.json')
    const entry = ctx.finish(0)
    expect(entry.configPath).toBe('.codeforgerc.json')
  })

  test('creates without configPath', () => {
    const ctx = new RunContext('analyze')
    const entry = ctx.finish(0)
    expect(entry.configPath).toBeNull()
  })

  test('tracks rules run', () => {
    const ctx = new RunContext('analyze')
    ctx.addRulesRun(['no-eval', 'prefer-const', 'max-params'])
    const entry = ctx.finish(0)
    expect(entry.rulesRun).toEqual(['no-eval', 'prefer-const', 'max-params'])
  })

  test('tracks file stats', () => {
    const ctx = new RunContext('analyze')
    ctx.setFileStats(42, 7)
    const entry = ctx.finish(0)
    expect(entry.filesAnalyzed).toBe(42)
    expect(entry.filesWithViolations).toBe(7)
  })

  test('tracks violation stats', () => {
    const ctx = new RunContext('analyze')
    ctx.setViolationStats(3, 5, 2)
    const entry = ctx.finish(0)
    expect(entry.errorCount).toBe(3)
    expect(entry.warningCount).toBe(5)
    expect(entry.infoCount).toBe(2)
    expect(entry.totalViolations).toBe(10)
  })

  test('finish produces valid AuditEntry with all required fields', () => {
    const ctx = new RunContext('analyze')
    ctx.setFileStats(5, 1)
    ctx.setViolationStats(1, 2, 3)
    ctx.addRulesRun(['rule-a'])
    const entry = ctx.finish(1)

    expect(entry.id).toBeTruthy()
    expect(entry.timestamp).toBeTruthy()
    expect(entry.command).toBe('analyze')
    expect(entry.filesAnalyzed).toBe(5)
    expect(entry.filesWithViolations).toBe(1)
    expect(entry.totalViolations).toBe(6)
    expect(entry.errorCount).toBe(1)
    expect(entry.warningCount).toBe(2)
    expect(entry.infoCount).toBe(3)
    expect(entry.rulesRun).toEqual(['rule-a'])
    expect(entry.durationMs).toBeGreaterThanOrEqual(0)
    expect(entry.exitCode).toBe(1)
    expect(entry.configPath).toBeNull()
    expect(typeof entry.user).toBe('string')
  })

  test('finish sets entry property', () => {
    const ctx = new RunContext('analyze')
    expect(ctx.entry).toBeNull()
    const entry = ctx.finish(0)
    expect(ctx.entry).toBe(entry)
  })

  test('durationMs is positive after finish', async () => {
    const ctx = new RunContext('analyze')
    await new Promise((r) => setTimeout(r, 10))
    ctx.finish(0)
    expect(ctx.durationMs).toBeGreaterThan(0)
  })

  test('timestamp is valid ISO 8601', () => {
    const ctx = new RunContext('analyze')
    const entry = ctx.finish(0)
    const parsed = new Date(entry.timestamp)
    expect(parsed.getTime()).not.toBeNaN()
    expect(entry.timestamp).toContain('T')
    expect(entry.timestamp).toContain('Z')
  })

  test('id is unique', () => {
    const ctx1 = new RunContext('analyze')
    const ctx2 = new RunContext('analyze')
    const e1 = ctx1.finish(0)
    const e2 = ctx2.finish(0)
    expect(e1.id).not.toBe(e2.id)
  })
})

describe('AuditLogger', () => {
  test('constructor merges with defaults', () => {
    const logger = new AuditLogger({ maxEntries: 500 })
    expect(logger.getLogPath()).toContain('.codeforge/audit')
  })

  test('getLogPath returns resolved path', async () => {
    const logger = await makeLogger()
    expect(logger.getLogPath()).toBe(path.join(tmpDir, 'audit.json'))
  })

  test('loadLog returns empty log when no file exists', async () => {
    const logger = await makeLogger()
    const log = await logger.loadLog()
    expect(log).toEqual({ version: 1, entries: [] })
  })

  test('saveLog + loadLog roundtrip', async () => {
    const logger = await makeLogger()
    const entry = makeEntry()
    const log: AuditLog = { version: 1, entries: [entry] }
    await logger.saveLog(log)
    const loaded = await logger.loadLog()
    expect(loaded.version).toBe(1)
    expect(loaded.entries).toHaveLength(1)
    expect(loaded.entries[0]!.id).toBe(entry.id)
  })

  test('saveLog creates directory if missing', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-audit-'))
    tmpDir = dir
    const nestedDir = path.join(dir, 'nested', 'deep')
    const logger = new AuditLogger({ logDir: nestedDir })
    const log: AuditLog = { version: 1, entries: [] }
    await logger.saveLog(log)
    const stat = await fs.stat(path.join(nestedDir, 'audit.json'))
    expect(stat.isFile()).toBe(true)
    await fs.rm(dir, { recursive: true, force: true })
  })

  test('atomic write produces valid file', async () => {
    const logger = await makeLogger()
    const log: AuditLog = { version: 1, entries: [makeEntry()] }
    await logger.saveLog(log)
    const raw = await fs.readFile(logger.getLogPath(), 'utf-8')
    const parsed = JSON.parse(raw) as AuditLog
    expect(parsed.version).toBe(1)
    expect(parsed.entries).toHaveLength(1)
  })

  test('maxEntries pruning keeps newest', async () => {
    const logger = await makeLogger(3)
    const entries: AuditEntry[] = []
    for (let i = 0; i < 5; i++) {
      entries.push(makeEntry({ id: `entry-${i}`, timestamp: new Date(i * 1000).toISOString() }))
    }
    const log: AuditLog = { version: 1, entries }
    await logger.saveLog(log)
    const loaded = await logger.loadLog()
    expect(loaded.entries).toHaveLength(3)
    expect(loaded.entries[0]!.id).toBe('entry-2')
    expect(loaded.entries[2]!.id).toBe('entry-4')
  })

  test('clearLog removes file', async () => {
    const logger = await makeLogger()
    await logger.saveLog({ version: 1, entries: [makeEntry()] })
    await expect(fs.access(logger.getLogPath())).resolves.toBeUndefined()
    await logger.clearLog()
    await expect(fs.access(logger.getLogPath())).rejects.toThrow()
  })

  test('clearLog does not throw when file does not exist', async () => {
    const logger = await makeLogger()
    await expect(logger.clearLog()).resolves.toBeUndefined()
  })

  test('getEntries returns all entries', async () => {
    const logger = await makeLogger()
    const entries = [makeEntry(), makeEntry(), makeEntry()]
    await logger.saveLog({ version: 1, entries })
    const result = await logger.getEntries()
    expect(result).toHaveLength(3)
  })

  test('getEntries with limit returns last N', async () => {
    const logger = await makeLogger()
    const entries = [makeEntry({ id: 'a' }), makeEntry({ id: 'b' }), makeEntry({ id: 'c' })]
    await logger.saveLog({ version: 1, entries })
    const result = await logger.getEntries(2)
    expect(result).toHaveLength(2)
    expect(result[0]!.id).toBe('b')
    expect(result[1]!.id).toBe('c')
  })

  test('getEntries without limit returns all', async () => {
    const logger = await makeLogger()
    const entries = [makeEntry(), makeEntry()]
    await logger.saveLog({ version: 1, entries })
    const result = await logger.getEntries()
    expect(result).toHaveLength(2)
  })

  test('recordEntry appends to log', async () => {
    const logger = await makeLogger()
    await logger.recordEntry(makeEntry({ id: 'first' }))
    await logger.recordEntry(makeEntry({ id: 'second' }))
    const entries = await logger.getEntries()
    expect(entries).toHaveLength(2)
    expect(entries[0]!.id).toBe('first')
    expect(entries[1]!.id).toBe('second')
  })

  test('multiple runs recorded sequentially', async () => {
    const logger = await makeLogger()
    for (let i = 0; i < 5; i++) {
      await logger.recordEntry(makeEntry({ id: `run-${i}`, command: `cmd-${i}` }))
    }
    const entries = await logger.getEntries()
    expect(entries).toHaveLength(5)
    for (let i = 0; i < 5; i++) {
      expect(entries[i]!.command).toBe(`cmd-${i}`)
    }
  })

  test('startRun returns RunContext', () => {
    const logger = new AuditLogger()
    const ctx = logger.startRun('analyze')
    expect(ctx).toBeInstanceOf(RunContext)
    expect(ctx.entry).toBeNull()
  })

  test('startRun with configPath passes through', () => {
    const logger = new AuditLogger()
    const ctx = logger.startRun('analyze', 'my-config.json')
    const entry = ctx.finish(0)
    expect(entry.configPath).toBe('my-config.json')
  })
})

describe('AuditLogger generateComplianceReport', () => {
  test('generates report from populated log', async () => {
    const logger = await makeLogger()
    const now = new Date()
    const entries = [
      makeEntry({
        timestamp: now.toISOString(),
        totalViolations: 5,
        errorCount: 0,
        warningCount: 3,
        infoCount: 2,
        rulesRun: ['no-eval', 'prefer-const'],
      }),
      makeEntry({
        timestamp: now.toISOString(),
        totalViolations: 3,
        errorCount: 1,
        warningCount: 1,
        infoCount: 1,
        rulesRun: ['no-eval', 'max-params'],
      }),
    ]
    await logger.saveLog({ version: 1, entries })
    const from = new Date(now.getTime() - 10000)
    const to = new Date(now.getTime() + 10000)
    const report = await logger.generateComplianceReport(from, to)

    expect(report.totalRuns).toBe(2)
    expect(report.totalViolations).toBe(8)
    expect(report.averageViolationsPerRun).toBe(4)
    expect(report.passRate).toBe(0.5)
    expect(report.errorTrend).toEqual([5, 3])
  })

  test('generates report with empty log', async () => {
    const logger = await makeLogger()
    const report = await logger.generateComplianceReport(new Date('2024-01-01'), new Date('2024-12-31'))
    expect(report.totalRuns).toBe(0)
    expect(report.totalViolations).toBe(0)
    expect(report.averageViolationsPerRun).toBe(0)
    expect(report.passRate).toBe(0)
    expect(report.errorTrend).toEqual([])
    expect(report.topViolatedRules).toEqual([])
    expect(report.topViolatedFiles).toEqual([])
  })

  test('filters entries by date range', async () => {
    const logger = await makeLogger()
    const entries = [
      makeEntry({ id: 'old', timestamp: '2024-01-01T00:00:00.000Z', totalViolations: 1, errorCount: 0 }),
      makeEntry({ id: 'mid', timestamp: '2024-06-15T00:00:00.000Z', totalViolations: 5, errorCount: 0 }),
      makeEntry({ id: 'new', timestamp: '2024-12-31T00:00:00.000Z', totalViolations: 3, errorCount: 0 }),
    ]
    await logger.saveLog({ version: 1, entries })
    const report = await logger.generateComplianceReport(
      new Date('2024-06-01'),
      new Date('2024-07-01'),
    )
    expect(report.totalRuns).toBe(1)
    expect(report.totalViolations).toBe(5)
  })

  test('passRate is 1 when all runs have 0 errors', async () => {
    const logger = await makeLogger()
    const now = new Date()
    const entries = [
      makeEntry({ timestamp: now.toISOString(), errorCount: 0 }),
      makeEntry({ timestamp: now.toISOString(), errorCount: 0 }),
    ]
    await logger.saveLog({ version: 1, entries })
    const report = await logger.generateComplianceReport(
      new Date(now.getTime() - 10000),
      new Date(now.getTime() + 10000),
    )
    expect(report.passRate).toBe(1)
  })

  test('passRate is 0 when all runs have errors', async () => {
    const logger = await makeLogger()
    const now = new Date()
    const entries = [
      makeEntry({ timestamp: now.toISOString(), errorCount: 2 }),
      makeEntry({ timestamp: now.toISOString(), errorCount: 1 }),
    ]
    await logger.saveLog({ version: 1, entries })
    const report = await logger.generateComplianceReport(
      new Date(now.getTime() - 10000),
      new Date(now.getTime() + 10000),
    )
    expect(report.passRate).toBe(0)
  })

  test('report period matches input dates', async () => {
    const logger = await makeLogger()
    const from = new Date('2024-01-01')
    const to = new Date('2024-12-31')
    const report = await logger.generateComplianceReport(from, to)
    expect(report.period.from).toBe(from.toISOString())
    expect(report.period.to).toBe(to.toISOString())
  })

  test('report generatedAt is valid ISO', async () => {
    const logger = await makeLogger()
    const report = await logger.generateComplianceReport(new Date(), new Date())
    expect(new Date(report.generatedAt).getTime()).not.toBeNaN()
  })

  test('topViolatedRules aggregates and sorts descending', async () => {
    const logger = await makeLogger()
    const now = new Date()
    const entries = [
      makeEntry({ timestamp: now.toISOString(), rulesRun: ['a', 'b'] }),
      makeEntry({ timestamp: now.toISOString(), rulesRun: ['a', 'c'] }),
      makeEntry({ timestamp: now.toISOString(), rulesRun: ['a', 'b', 'c'] }),
    ]
    await logger.saveLog({ version: 1, entries })
    const report = await logger.generateComplianceReport(
      new Date(now.getTime() - 10000),
      new Date(now.getTime() + 10000),
    )
    expect(report.topViolatedRules[0]!.ruleId).toBe('a')
    expect(report.topViolatedRules[0]!.count).toBe(3)
    expect(report.topViolatedRules[1]!.ruleId).toBe('b')
    expect(report.topViolatedRules[1]!.count).toBe(2)
  })
})
