import { describe, it, expect, vi } from 'vitest'

import {
  saveBaselineReport,
  loadBaselineReport,
  compareWithBaselineReport,
} from '../src/commands/analyze-baseline-helpers.js'

import type { RuleViolation } from '../src/ast/visitor.js'

// ─── Helpers ──────────────────────────────────────────

function makeViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: 'src/foo.ts',
    message: 'Unexpected foo',
    range: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
    ruleId: 'no-foo',
    severity: 'error',
    ...overrides,
  }
}

vi.mock('../src/core/baseline.js', () => ({
  saveBaseline: vi.fn().mockResolvedValue('/tmp/.codeforge-baseline.json'),
  loadBaseline: vi.fn().mockResolvedValue(null),
  compareWithBaseline: vi.fn().mockReturnValue({
    improvements: [],
    regressions: [],
    unchanged: 0,
  }),
}))

import { saveBaseline, loadBaseline, compareWithBaseline } from '../src/core/baseline.js'

// ─── saveBaselineReport ───────────────────────────────
describe('saveBaselineReport', () => {
  it('saves violations and returns messages with path', async () => {
    const violations = [makeViolation(), makeViolation({ ruleId: 'no-bar' })]
    const result = await saveBaselineReport(violations, undefined)

    expect(saveBaseline).toHaveBeenCalledWith(violations, undefined)
    expect(result.path).toBe('/tmp/.codeforge-baseline.json')
    expect(result.messages).toHaveLength(2)
    expect(result.messages[0]).toContain('Baseline saved to')
    expect(result.messages[1]).toContain('Total violations: 2')
  })

  it('handles empty violations array', async () => {
    const result = await saveBaselineReport([], undefined)

    expect(result.messages[1]).toContain('Total violations: 0')
  })

  it('passes custom output path', async () => {
    await saveBaselineReport([], 'custom-path.json')
    expect(saveBaseline).toHaveBeenCalledWith([], 'custom-path.json')
  })
})

// ─── loadBaselineReport ───────────────────────────────
describe('loadBaselineReport', () => {
  it('returns found: false when no baseline file exists', async () => {
    vi.mocked(loadBaseline).mockResolvedValueOnce(null)
    const result = await loadBaselineReport(undefined)

    expect(result.found).toBe(false)
    expect(result.violations).toBeUndefined()
  })

  it('returns found: true with violations when baseline exists', async () => {
    const violations = [makeViolation()]
    vi.mocked(loadBaseline).mockResolvedValueOnce({
      summary: { total: 1, errors: 1, warnings: 0, info: 0 },
      timestamp: '2025-01-01',
      violations,
    })

    const result = await loadBaselineReport(undefined)

    expect(result.found).toBe(true)
    expect(result.violations).toEqual(violations)
  })

  it('passes output path to loadBaseline', async () => {
    vi.mocked(loadBaseline).mockResolvedValueOnce(null)
    await loadBaselineReport('my-output.json')
    expect(loadBaseline).toHaveBeenCalledWith('my-output.json')
  })
})

// ─── compareWithBaselineReport ────────────────────────
describe('compareWithBaselineReport', () => {
  it('returns error when no baseline found', async () => {
    vi.mocked(loadBaseline).mockResolvedValueOnce(null)

    const result = await compareWithBaselineReport([], undefined)

    expect(result.exitCode).toBe(1)
    expect(result.noBaseline).toBe(true)
    expect(result.messages).toContain('No baseline file found. Run with --baseline save first.')
  })

  it('returns exitCode 0 when no regressions', async () => {
    const baselineViolations = [makeViolation()]
    vi.mocked(loadBaseline).mockResolvedValueOnce({
      summary: { total: 1, errors: 1, warnings: 0, info: 0 },
      timestamp: '2025-01-01',
      violations: baselineViolations,
    })
    vi.mocked(compareWithBaseline).mockReturnValueOnce({
      improvements: [],
      regressions: [],
      unchanged: 1,
    })

    const result = await compareWithBaselineReport(baselineViolations, undefined)

    expect(result.exitCode).toBe(0)
    expect(result.noBaseline).toBe(false)
  })

  it('returns exitCode 1 when regressions exist', async () => {
    const baselineViolations = [makeViolation()]
    const regression = makeViolation({ filePath: 'src/new.ts', ruleId: 'new-rule' })
    vi.mocked(loadBaseline).mockResolvedValueOnce({
      summary: { total: 1, errors: 1, warnings: 0, info: 0 },
      timestamp: '2025-01-01',
      violations: baselineViolations,
    })
    vi.mocked(compareWithBaseline).mockReturnValueOnce({
      improvements: [],
      regressions: [regression],
      unchanged: 0,
    })

    const result = await compareWithBaselineReport(baselineViolations, undefined)

    expect(result.exitCode).toBe(1)
    expect(result.messages).toContain('Regressions:')
    expect(result.messages).toContain(
      `  ${regression.filePath}:${regression.range.start.line}:${regression.range.start.column} - ${regression.ruleId}: ${regression.message}`,
    )
  })

  it('includes improvements count in messages', async () => {
    vi.mocked(loadBaseline).mockResolvedValueOnce({
      summary: { total: 1, errors: 1, warnings: 0, info: 0 },
      timestamp: '2025-01-01',
      violations: [makeViolation()],
    })
    vi.mocked(compareWithBaseline).mockReturnValueOnce({
      improvements: [makeViolation({ ruleId: 'fixed' })],
      regressions: [],
      unchanged: 0,
    })

    const result = await compareWithBaselineReport([], undefined)

    expect(result.messages).toContain('  Improvements (fixed violations): 1')
    expect(result.messages).toContain('  Regressions (new violations): 0')
    expect(result.messages).toContain('  Unchanged: 0')
  })

  it('does not include regressions section when no regressions', async () => {
    vi.mocked(loadBaseline).mockResolvedValueOnce({
      summary: { total: 0, errors: 0, warnings: 0, info: 0 },
      timestamp: '2025-01-01',
      violations: [],
    })
    vi.mocked(compareWithBaseline).mockReturnValueOnce({
      improvements: [],
      regressions: [],
      unchanged: 0,
    })

    const result = await compareWithBaselineReport([], undefined)

    expect(result.messages).not.toContain('Regressions:')
  })

  it('passes output path to loadBaseline', async () => {
    vi.mocked(loadBaseline).mockResolvedValueOnce(null)
    await compareWithBaselineReport([], 'output.json')
    expect(loadBaseline).toHaveBeenCalledWith('output.json')
  })
})
