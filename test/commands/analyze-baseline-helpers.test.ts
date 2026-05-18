import { describe, expect, it, vi } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'

import {
  compareWithBaselineReport,
  loadBaselineReport,
  saveBaselineReport,
} from '../../src/commands/analyze-baseline-helpers.js'
import { compareWithBaseline, loadBaseline, saveBaseline } from '../../src/core/baseline.js'

vi.mock('../../src/core/baseline.js')

const mockedSaveBaseline = vi.mocked(saveBaseline)
const mockedLoadBaseline = vi.mocked(loadBaseline)
const mockedCompareWithBaseline = vi.mocked(compareWithBaseline)

// ─── Helpers ───

const makeViolation = (
  overrides: Partial<RuleViolation> = {},
): RuleViolation => ({
  filePath: 'src/test.ts',
  message: 'test violation',
  range: {
    end: { column: 10, line: 1 },
    start: { column: 1, line: 1 },
  },
  ruleId: 'test-rule',
  severity: 'error',
  ...overrides,
})

// ─── saveBaselineReport ───

describe('saveBaselineReport', () => {
  it('returns path from saveBaseline', async () => {
    mockedSaveBaseline.mockResolvedValue('/output/.codeforge-baseline.json')
    const result = await saveBaselineReport([makeViolation()], '/output/baseline.json')
    expect(result.path).toBe('/output/.codeforge-baseline.json')
  })

  it('includes total violation count in messages', async () => {
    mockedSaveBaseline.mockResolvedValue('/path/baseline.json')
    const violations = [makeViolation(), makeViolation(), makeViolation()]
    const result = await saveBaselineReport(violations, undefined)
    expect(result.messages).toContain('  Total violations: 3')
  })

  it('includes baseline path in first message', async () => {
    mockedSaveBaseline.mockResolvedValue('/custom/path.json')
    const result = await saveBaselineReport([makeViolation()], '/custom/path.json')
    expect(result.messages).toContain('Baseline saved to /custom/path.json')
  })

  it('handles zero violations', async () => {
    mockedSaveBaseline.mockResolvedValue('/empty/baseline.json')
    const result = await saveBaselineReport([], undefined)
    expect(result.messages).toContain('  Total violations: 0')
    expect(result.path).toBe('/empty/baseline.json')
  })

  it('passes output path to saveBaseline', async () => {
    mockedSaveBaseline.mockResolvedValue('/out/b.json')
    await saveBaselineReport([], '/out/b.json')
    expect(mockedSaveBaseline).toHaveBeenCalledWith([], '/out/b.json')
  })

  it('passes undefined output when not provided', async () => {
    mockedSaveBaseline.mockResolvedValue('/default.json')
    await saveBaselineReport([], undefined)
    expect(mockedSaveBaseline).toHaveBeenCalledWith([], undefined)
  })

  it('returns exactly two messages for non-empty violations', async () => {
    mockedSaveBaseline.mockResolvedValue('/p.json')
    const result = await saveBaselineReport([makeViolation()], undefined)
    expect(result.messages).toHaveLength(2)
  })
})

// ─── loadBaselineReport ───

describe('loadBaselineReport', () => {
  it('returns found: false when no baseline file exists', async () => {
    mockedLoadBaseline.mockResolvedValue(null)
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(false)
    expect(result.violations).toBeUndefined()
  })

  it('returns found: true with violations when baseline exists', async () => {
    const violations = [makeViolation({ ruleId: 'rule-a' })]
    mockedLoadBaseline.mockResolvedValue({
      summary: { errors: 1, info: 0, total: 1, warnings: 0 },
      timestamp: '2025-01-01T00:00:00.000Z',
      violations,
    })
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(true)
    expect(result.violations).toHaveLength(1)
    expect(result.violations?.[0]?.ruleId).toBe('rule-a')
  })

  it('returns found: true with empty violations array', async () => {
    mockedLoadBaseline.mockResolvedValue({
      summary: { errors: 0, info: 0, total: 0, warnings: 0 },
      timestamp: '2025-01-01T00:00:00.000Z',
      violations: [],
    })
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(true)
    expect(result.violations).toEqual([])
  })

  it('passes output path to loadBaseline', async () => {
    mockedLoadBaseline.mockResolvedValue(null)
    await loadBaselineReport('/custom/path.json')
    expect(mockedLoadBaseline).toHaveBeenCalledWith('/custom/path.json')
  })

  it('passes undefined to loadBaseline when no output given', async () => {
    mockedLoadBaseline.mockResolvedValue(null)
    await loadBaselineReport(undefined)
    expect(mockedLoadBaseline).toHaveBeenCalledWith(undefined)
  })
})

// ─── compareWithBaselineReport ───

describe('compareWithBaselineReport', () => {
  it('returns noBaseline exit code 1 when baseline not found', async () => {
    mockedLoadBaseline.mockResolvedValue(null)
    const result = await compareWithBaselineReport([], undefined)
    expect(result.noBaseline).toBe(true)
    expect(result.exitCode).toBe(1)
    expect(result.messages).toContain('No baseline file found. Run with --baseline save first.')
  })

  it('returns exit code 0 when no regressions', async () => {
    const baselineViolations = [makeViolation()]
    mockedLoadBaseline.mockResolvedValue({
      summary: { errors: 1, info: 0, total: 1, warnings: 0 },
      timestamp: '2025-01-01T00:00:00.000Z',
      violations: baselineViolations,
    })
    mockedCompareWithBaseline.mockReturnValue({
      improvements: [],
      regressions: [],
      unchanged: 1,
    })
    const result = await compareWithBaselineReport([makeViolation()], undefined)
    expect(result.exitCode).toBe(0)
    expect(result.noBaseline).toBe(false)
  })

  it('returns exit code 1 when regressions exist', async () => {
    mockedLoadBaseline.mockResolvedValue({
      summary: { errors: 0, info: 0, total: 0, warnings: 0 },
      timestamp: '2025-01-01T00:00:00.000Z',
      violations: [],
    })
    const regression = makeViolation({ ruleId: 'new-rule' })
    mockedCompareWithBaseline.mockReturnValue({
      improvements: [],
      regressions: [regression],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.exitCode).toBe(1)
    expect(result.noBaseline).toBe(false)
  })

  it('includes regression count in messages', async () => {
    mockedLoadBaseline.mockResolvedValue({
      summary: { errors: 0, info: 0, total: 0, warnings: 0 },
      timestamp: '2025-01-01T00:00:00.000Z',
      violations: [],
    })
    mockedCompareWithBaseline.mockReturnValue({
      improvements: [],
      regressions: [makeViolation()],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([makeViolation()], undefined)
    const stripped = result.messages.map((m) => m.replace(/\x1b\[[0-9;]*m/g, ''))
    expect(stripped).toContain('  Regressions (new violations): 1')
  })

  it('includes improvement count in messages', async () => {
    const baselineViolation = makeViolation({ ruleId: 'fixed-rule' })
    mockedLoadBaseline.mockResolvedValue({
      summary: { errors: 1, info: 0, total: 1, warnings: 0 },
      timestamp: '2025-01-01T00:00:00.000Z',
      violations: [baselineViolation],
    })
    mockedCompareWithBaseline.mockReturnValue({
      improvements: [baselineViolation],
      regressions: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    const stripped = result.messages.map((m) => m.replace(/\x1b\[[0-9;]*m/g, ''))
    expect(stripped).toContain('  Improvements (fixed violations): 1')
  })

  it('includes unchanged count in messages', async () => {
    const v = makeViolation()
    mockedLoadBaseline.mockResolvedValue({
      summary: { errors: 1, info: 0, total: 1, warnings: 0 },
      timestamp: '2025-01-01T00:00:00.000Z',
      violations: [v],
    })
    mockedCompareWithBaseline.mockReturnValue({
      improvements: [],
      regressions: [],
      unchanged: 1,
    })
    const result = await compareWithBaselineReport([v], undefined)
    const stripped = result.messages.map((m) => m.replace(/\x1b\[[0-9;]*m/g, ''))
    expect(stripped).toContain('  Unchanged: 1')
  })

  it('includes regression details when regressions exist', async () => {
    mockedLoadBaseline.mockResolvedValue({
      summary: { errors: 0, info: 0, total: 0, warnings: 0 },
      timestamp: '2025-01-01T00:00:00.000Z',
      violations: [],
    })
    const regression = makeViolation({
      filePath: 'src/app.ts',
      message: 'bad code',
      ruleId: 'no-bad',
    })
    mockedCompareWithBaseline.mockReturnValue({
      improvements: [],
      regressions: [regression],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    const detail = result.messages.find((m) => m.includes('no-bad') && m.includes('bad code'))
    expect(detail).toBeDefined()
  })

  it('does not include regression details section when no regressions', async () => {
    mockedLoadBaseline.mockResolvedValue({
      summary: { errors: 1, info: 0, total: 1, warnings: 0 },
      timestamp: '2025-01-01T00:00:00.000Z',
      violations: [makeViolation()],
    })
    mockedCompareWithBaseline.mockReturnValue({
      improvements: [],
      regressions: [],
      unchanged: 1,
    })
    const result = await compareWithBaselineReport([makeViolation()], undefined)
    const hasRegressionsHeader = result.messages.some((m) => m.includes('Regressions:'))
    expect(hasRegressionsHeader).toBe(false)
  })

  it('passes violations to compareWithBaseline', async () => {
    const current = [makeViolation({ ruleId: 'cur' })]
    const baseline = [makeViolation({ ruleId: 'base' })]
    mockedLoadBaseline.mockResolvedValue({
      summary: { errors: 1, info: 0, total: 1, warnings: 0 },
      timestamp: '2025-01-01T00:00:00.000Z',
      violations: baseline,
    })
    mockedCompareWithBaseline.mockReturnValue({
      improvements: [],
      regressions: [],
      unchanged: 0,
    })
    await compareWithBaselineReport(current, undefined)
    expect(mockedCompareWithBaseline).toHaveBeenCalledWith(current, baseline)
  })

  it('handles empty current violations against non-empty baseline', async () => {
    mockedLoadBaseline.mockResolvedValue({
      summary: { errors: 2, info: 0, total: 2, warnings: 0 },
      timestamp: '2025-01-01T00:00:00.000Z',
      violations: [makeViolation(), makeViolation()],
    })
    mockedCompareWithBaseline.mockReturnValue({
      improvements: [makeViolation(), makeViolation()],
      regressions: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.exitCode).toBe(0)
    const stripped = result.messages.map((m) => m.replace(/\x1b\[[0-9;]*m/g, ''))
    expect(stripped).toContain('  Improvements (fixed violations): 2')
  })

  it('starts messages with empty string and header', async () => {
    mockedLoadBaseline.mockResolvedValue({
      summary: { errors: 0, info: 0, total: 0, warnings: 0 },
      timestamp: '2025-01-01T00:00:00.000Z',
      violations: [],
    })
    mockedCompareWithBaseline.mockReturnValue({
      improvements: [],
      regressions: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages[0]).toBe('')
    expect(result.messages[1]).toBe('Baseline Comparison Results:')
  })
})
