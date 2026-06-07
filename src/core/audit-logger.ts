import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'

import type { AuditConfig, AuditEntry, AuditLog, ComplianceReport } from './audit-types.js'

import { DEFAULT_AUDIT_CONFIG } from './audit-types.js'
import { sortedByDesc } from '../utils/array-helpers.js'
import { increment } from '../utils/map-helpers.js'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

/**
 * @stable
 */
export class RunContext {
  readonly startTime: number
  private _durationMs = 0
  private _entry: AuditEntry | null = null
  private _command: string
  private _configPath: string | null
  private _rulesRun: string[] = []
  private _filesAnalyzed = 0
  private _filesWithViolations = 0
  private _errorCount = 0
  private _warningCount = 0
  private _infoCount = 0

  constructor(command: string, configPath?: string) {
    this._command = command
    this._configPath = configPath ?? null
    this.startTime = Date.now()
  }

  get durationMs(): number {
    return this._durationMs
  }

  get entry(): AuditEntry | null {
    return this._entry
  }

  addRulesRun(rules: string[]): void {
    this._rulesRun = [...rules]
  }

  setFileStats(analyzed: number, withViolations: number): void {
    this._filesAnalyzed = analyzed
    this._filesWithViolations = withViolations
  }

  setViolationStats(errors: number, warnings: number, info: number): void {
    this._errorCount = errors
    this._warningCount = warnings
    this._infoCount = info
  }

  finish(exitCode: number): AuditEntry {
    this._durationMs = Date.now() - this.startTime
    const entry: AuditEntry = {
      id: generateId(),
      timestamp: new Date(this.startTime).toISOString(),
      command: this._command,
      filesAnalyzed: this._filesAnalyzed,
      filesWithViolations: this._filesWithViolations,
      totalViolations: this._errorCount + this._warningCount + this._infoCount,
      errorCount: this._errorCount,
      warningCount: this._warningCount,
      infoCount: this._infoCount,
      rulesRun: this._rulesRun,
      durationMs: this._durationMs,
      exitCode,
      configPath: this._configPath,
      user: os.userInfo().username,
    }
    this._entry = entry
    return entry
  }

  toString(): string {
    return `RunContext(${this._command}, files=${this._filesAnalyzed}, errors=${this._errorCount}, durationMs=${this._durationMs})`
  }

  toJSON(): AuditEntry | null {
    return this._entry
  }

  clone(): this {
    const c = new RunContext(this._command, this._configPath ?? undefined)
    c._durationMs = this._durationMs
    c._entry = this._entry
    c._rulesRun = [...this._rulesRun]
    c._filesAnalyzed = this._filesAnalyzed
    c._filesWithViolations = this._filesWithViolations
    c._errorCount = this._errorCount
    c._warningCount = this._warningCount
    c._infoCount = this._infoCount
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RunContext)) return false
    if (this._command !== other._command) return false
    if (this._configPath !== other._configPath) return false
    if (this._filesAnalyzed !== other._filesAnalyzed) return false
    if (this._filesWithViolations !== other._filesWithViolations) return false
    if (this._errorCount !== other._errorCount) return false
    if (this._warningCount !== other._warningCount) return false
    if (this._infoCount !== other._infoCount) return false
    if (this._rulesRun.length !== other._rulesRun.length) return false
    for (let i = 0; i < this._rulesRun.length; i++) {
      if (this._rulesRun[i] !== other._rulesRun[i]) return false
    }
    return true
  }
}

/**
 * @stable
 */
export class AuditLogger {
  private config: AuditConfig

  constructor(config?: Partial<AuditConfig>) {
    this.config = { ...DEFAULT_AUDIT_CONFIG, ...config }
  }

  startRun(command: string, configPath?: string): RunContext {
    const ctx = new RunContext(command, configPath)
    return ctx
  }

  getLogPath(): string {
    const dir = path.isAbsolute(this.config.logDir)
      ? this.config.logDir
      : path.join(process.cwd(), this.config.logDir)
    return path.join(dir, 'audit.json')
  }

  async loadLog(): Promise<AuditLog> {
    const logPath = this.getLogPath()
    try {
      const data = await fs.readFile(logPath, 'utf-8')
      return JSON.parse(data) as AuditLog
    } catch {
      return { version: 1, entries: [] }
    }
  }

  async saveLog(log: AuditLog): Promise<void> {
    const logPath = this.getLogPath()
    const dir = path.dirname(logPath)
    await fs.mkdir(dir, { recursive: true })
    const pruned: AuditLog = {
      version: 1,
      entries: log.entries.slice(-this.config.maxEntries),
    }
    const tmpPath = logPath + '.tmp'
    await fs.writeFile(tmpPath, JSON.stringify(pruned, null, 2), 'utf-8')
    await fs.rename(tmpPath, logPath)
  }

  async recordEntry(entry: AuditEntry): Promise<void> {
    const log = await this.loadLog()
    log.entries.push(entry)
    await this.saveLog(log)
  }

  async generateComplianceReport(from: Date, to: Date): Promise<ComplianceReport> {
    const log = await this.loadLog()
    const fromIso = from.toISOString()
    const toIso = to.toISOString()
    const filtered = log.entries.filter((e) => e.timestamp >= fromIso && e.timestamp <= toIso)

    const totalRuns = filtered.length
    const totalViolations = filtered.reduce((sum, e) => sum + e.totalViolations, 0)
    const errorTrend = filtered.map((e) => e.totalViolations)
    let passCount = 0
    for (const e of filtered) {
      if (e.errorCount === 0) passCount++
    }
    const passRate = totalRuns > 0 ? passCount / totalRuns : 0
    const averageViolationsPerRun = totalRuns > 0 ? totalViolations / totalRuns : 0

    const ruleCounts = new Map<string, number>()
    const fileCounts = new Map<string, number>()
    for (const entry of filtered) {
      for (const rule of entry.rulesRun) {
        increment(ruleCounts, rule)
      }
    }

    const ruleEntries = [...ruleCounts.entries()]
      .map(([ruleId, count]) => ({ ruleId, count }))
    const topViolatedRules = sortedByDesc(ruleEntries, r => r.count)
      .slice(0, 10)

    const fileEntries = [...fileCounts.entries()]
      .map(([filePath, count]) => ({ filePath, count }))
    const topViolatedFiles = sortedByDesc(fileEntries, f => f.count)
      .slice(0, 10)

    return {
      generatedAt: new Date().toISOString(),
      period: { from: fromIso, to: toIso },
      totalRuns,
      totalViolations,
      errorTrend,
      topViolatedRules,
      topViolatedFiles,
      averageViolationsPerRun,
      passRate,
    }
  }

  async getEntries(limit?: number): Promise<AuditEntry[]> {
    const log = await this.loadLog()
    if (limit !== undefined) {
      return log.entries.slice(-limit)
    }
    return [...log.entries]
  }

  async clearLog(): Promise<void> {
    const logPath = this.getLogPath()
    try {
      await fs.unlink(logPath)
    } catch {
      // file may not exist
    }
  }

  toString(): string {
    return `AuditLogger(logDir=${this.config.logDir}, maxEntries=${this.config.maxEntries})`
  }

  toJSON(): AuditConfig {
    return { ...this.config }
  }

  clone(): this {
    return new AuditLogger(this.config) as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof AuditLogger)) return false
    return JSON.stringify(this.config) === JSON.stringify(other.config)
  }
}
