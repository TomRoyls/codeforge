import { describe, expect, test, vi } from 'vitest'

import { type RuleViolation } from '../../../src/ast/visitor.js'

vi.mock('../../../src/core/baseline.js', () => ({
  saveBaseline: vi.fn().mockResolvedValue('/path/to/.codeforge-baseline.json'),
  loadBaseline: vi.fn().mockResolvedValue(null),
  compareWithBaseline: vi.fn(),
}))

// ============================================================================
// Helpers
// ============================================================================

const makeViolation = (overrides: Partial<RuleViolation> = {}): RuleViolation => ({
  ruleId: 'test-rule',
  severity: 'error',
  message: 'test message',
  filePath: '/test.ts',
  range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
  ...overrides,
})

// ============================================================================
// Import after mocks
// ============================================================================

const { saveBaseline, loadBaseline, compareWithBaseline } =
  await import('../../../src/core/baseline.js')
const { saveBaselineReport, loadBaselineReport, compareWithBaselineReport } =
  await import('../../../src/commands/analyze-baseline-helpers.js')

// ============================================================================
// saveBaselineReport
// ============================================================================

describe('saveBaselineReport', () => {
  test('returns save result with path and messages', async () => {
    const violations = [makeViolation(), makeViolation()]
    const result = await saveBaselineReport(violations, undefined)
    expect(result.path).toBe('/path/to/.codeforge-baseline.json')
    expect(result.messages).toEqual([
      'Baseline saved to /path/to/.codeforge-baseline.json',
      '  Total violations: 2',
    ])
  })

  test('passes output path to saveBaseline', async () => {
    const violations = [makeViolation()]
    await saveBaselineReport(violations, '/custom/output.json')
    expect(saveBaseline).toHaveBeenCalledWith(violations, '/custom/output.json')
  })

  test('reports zero violations correctly', async () => {
    const result = await saveBaselineReport([], undefined)
    expect(result.messages[1]).toBe('  Total violations: 0')
  })

  test('reports single violation correctly', async () => {
    const result = await saveBaselineReport([makeViolation()], undefined)
    expect(result.messages[1]).toBe('  Total violations: 1')
  })

  test('reports large number of violations correctly', async () => {
    const violations = Array.from({ length: 100 }, () => makeViolation())
    const result = await saveBaselineReport(violations, undefined)
    expect(result.messages[1]).toBe('  Total violations: 100')
  })

  test('returns path from saveBaseline', async () => {
    ;(saveBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce('/custom/path/baseline.json')
    const result = await saveBaselineReport([makeViolation()], undefined)
    expect(result.path).toBe('/custom/path/baseline.json')
    expect(result.messages[0]).toBe('Baseline saved to /custom/path/baseline.json')
  })

  test('result contains exactly two messages', async () => {
    const result = await saveBaselineReport([makeViolation()], undefined)
    expect(result.messages).toHaveLength(2)
  })

  test('passes undefined output when not specified', async () => {
    await saveBaselineReport([], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([], undefined)
  })

  test('handles violations with different severities', async () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]
    const result = await saveBaselineReport(violations, undefined)
    expect(result.messages[1]).toBe('  Total violations: 3')
  })

  test('handles violation with custom filePath', async () => {
    const v = makeViolation({ filePath: 'deeply/nested/src/module.ts' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with multi-line range', async () => {
    const v = makeViolation({
      range: { start: { line: 1, column: 1 }, end: { line: 5, column: 20 } },
    })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('report path matches the path returned by saveBaseline', async () => {
    ;(saveBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce('/a/b/c.json')
    const result = await saveBaselineReport([], undefined)
    expect(result.path).toBe('/a/b/c.json')
    expect(result.messages[0]).toContain('/a/b/c.json')
  })
})

// ============================================================================
// loadBaselineReport
// ============================================================================

describe('loadBaselineReport', () => {
  test('returns found=false when no baseline exists', async () => {
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(false)
    expect(result.violations).toBeUndefined()
  })

  test('returns found=true with violations when baseline exists', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation({ ruleId: 'baseline-rule' })],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(true)
    expect(result.violations).toHaveLength(1)
  })

  test('passes output path to loadBaseline', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    await loadBaselineReport('/custom/path.json')
    expect(loadBaseline).toHaveBeenCalledWith('/custom/path.json')
  })

  test('returns violations cast as RuleViolation[]', async () => {
    const baselineViolation = makeViolation({ ruleId: 'saved-rule', severity: 'warning' })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [baselineViolation],
      summary: { errors: 0, warnings: 1, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].ruleId).toBe('saved-rule')
    expect(result.violations![0].severity).toBe('warning')
  })

  test('returns multiple violations from baseline', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [
        makeViolation({ ruleId: 'rule-1' }),
        makeViolation({ ruleId: 'rule-2' }),
        makeViolation({ ruleId: 'rule-3' }),
      ],
      summary: { errors: 3, warnings: 0, info: 0, total: 3 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations).toHaveLength(3)
  })

  test('handles baseline with empty violations array', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(true)
    expect(result.violations).toHaveLength(0)
  })

  test('preserves violation message from baseline', async () => {
    const v = makeViolation({ message: 'specific baseline message' })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].message).toBe('specific baseline message')
  })

  test('preserves violation range from baseline', async () => {
    const v = makeViolation({
      range: { start: { line: 42, column: 7 }, end: { line: 42, column: 15 } },
    })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].range.start.line).toBe(42)
    expect(result.violations![0].range.start.column).toBe(7)
  })

  test('passes undefined output when not specified', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    await loadBaselineReport(undefined)
    expect(loadBaseline).toHaveBeenCalledWith(undefined)
  })

  test('returns violations with mixed severities', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [
        makeViolation({ ruleId: 'r1', severity: 'error' }),
        makeViolation({ ruleId: 'r2', severity: 'warning' }),
        makeViolation({ ruleId: 'r3', severity: 'info' }),
      ],
      summary: { errors: 1, warnings: 1, info: 1, total: 3 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].severity).toBe('error')
    expect(result.violations![1].severity).toBe('warning')
    expect(result.violations![2].severity).toBe('info')
  })
})

// ============================================================================
// compareWithBaselineReport
// ============================================================================

describe('compareWithBaselineReport', () => {
  test('returns noBaseline when no baseline file exists', async () => {
    const result = await compareWithBaselineReport([], undefined)
    expect(result.noBaseline).toBe(true)
    expect(result.exitCode).toBe(1)
    expect(result.messages).toEqual(['No baseline file found. Run with --baseline save first.'])
  })

  test('returns exitCode 0 when no regressions', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation()],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 1,
    })
    const result = await compareWithBaselineReport([makeViolation()], undefined)
    expect(result.noBaseline).toBe(false)
    expect(result.exitCode).toBe(0)
    expect(result.messages).toContain('')
    expect(result.messages).toContain('Baseline Comparison Results:')
    expect(result.messages).toContain('  Regressions (new violations): 0')
    expect(result.messages).toContain('  Improvements (fixed violations): 0')
    expect(result.messages).toContain('  Unchanged: 1')
  })

  test('returns exitCode 1 when regressions exist', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'src/foo.ts',
      ruleId: 'new-rule',
      message: 'new issue',
      range: { start: { line: 5, column: 3 }, end: { line: 5, column: 10 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.exitCode).toBe(1)
    expect(result.messages).toContain('  Regressions (new violations): 1')
    expect(result.messages).toContain('Regressions:')
    expect(result.messages).toContain('  src/foo.ts:5:3 - new-rule: new issue')
  })

  test('includes improvements in messages', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation()],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [makeViolation()],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.exitCode).toBe(0)
    expect(result.messages).toContain('  Improvements (fixed violations): 1')
  })

  test('does not include regressions section when no regressions', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages).not.toContain('Regressions:')
  })

  test('passes output path through to loadBaseline', async () => {
    await compareWithBaselineReport([], '/output.json')
    expect(loadBaseline).toHaveBeenCalledWith('/output.json')
  })

  test('formats regression details correctly', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'src/bar.ts',
      ruleId: 'some-rule',
      message: 'something wrong',
      range: { start: { line: 10, column: 5 }, end: { line: 10, column: 20 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  src/bar.ts:10:5 - some-rule: something wrong')
  })

  test('handles multiple regressions', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regressions = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'rule-a',
        message: 'issue a',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
      }),
      makeViolation({
        filePath: 'b.ts',
        ruleId: 'rule-b',
        message: 'issue b',
        range: { start: { line: 2, column: 3 }, end: { line: 2, column: 8 } },
      }),
    ]
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions,
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport(regressions, undefined)
    expect(result.exitCode).toBe(1)
    expect(result.messages).toContain('  Regressions (new violations): 2')
    expect(result.messages).toContain('  a.ts:1:1 - rule-a: issue a')
    expect(result.messages).toContain('  b.ts:2:3 - rule-b: issue b')
  })

  test('noBaseline is false when baseline exists', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.noBaseline).toBe(false)
  })

  test('includes empty string at start of messages for spacing', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages[0]).toBe('')
  })

  test('handles both regressions and improvements simultaneously', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation({ ruleId: 'old-rule' })],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'new.ts',
      ruleId: 'new-rule',
      message: 'new problem',
      range: { start: { line: 3, column: 1 }, end: { line: 3, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [makeViolation()],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.exitCode).toBe(1)
    expect(result.messages).toContain('  Regressions (new violations): 1')
    expect(result.messages).toContain('  Improvements (fixed violations): 1')
    expect(result.messages).toContain('Regressions:')
  })

  test('shows correct unchanged count', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation(), makeViolation(), makeViolation()],
      summary: { errors: 3, warnings: 0, info: 0, total: 3 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [makeViolation()],
      unchanged: 2,
    })
    const result = await compareWithBaselineReport([makeViolation(), makeViolation()], undefined)
    expect(result.messages).toContain('  Unchanged: 2')
    expect(result.exitCode).toBe(0)
  })

  test('passes current violations to compareWithBaseline', async () => {
    const currentViolations = [
      makeViolation({ ruleId: 'current-1' }),
      makeViolation({ ruleId: 'current-2' }),
    ]
    const baselineViolations = [makeViolation({ ruleId: 'baseline-1' })]
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: baselineViolations,
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [currentViolations[0]],
      improvements: [],
      unchanged: 1,
    })
    await compareWithBaselineReport(currentViolations, undefined)
    expect(compareWithBaseline).toHaveBeenCalledWith(currentViolations, baselineViolations)
  })

  test('regression detail uses start line and column not end', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'x.ts',
      ruleId: 'check-range',
      message: 'range check',
      range: { start: { line: 99, column: 42 }, end: { line: 200, column: 1 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  x.ts:99:42 - check-range: range check')
  })

  test('noBaseline result has no comparison messages', async () => {
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages).toHaveLength(1)
    expect(result.messages).not.toContain('Baseline Comparison Results:')
  })

  test('regressions header appears after summary block', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'y.ts',
      ruleId: 'order-rule',
      message: 'order check',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    const summaryIdx = result.messages.indexOf('Baseline Comparison Results:')
    const regressionsIdx = result.messages.indexOf('Regressions:')
    expect(summaryIdx).toBeGreaterThan(-1)
    expect(regressionsIdx).toBeGreaterThan(summaryIdx)
  })

  test('handles many regressions', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regressions = Array.from({ length: 5 }, (_, i) =>
      makeViolation({
        filePath: `file${i}.ts`,
        ruleId: `rule-${i}`,
        message: `issue ${i}`,
        range: { start: { line: i + 1, column: i + 1 }, end: { line: i + 1, column: i + 5 } },
      }),
    )
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions,
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport(regressions, undefined)
    expect(result.exitCode).toBe(1)
    expect(result.messages).toContain('  Regressions (new violations): 5')
    expect(result.messages).toContain('  file0.ts:1:1 - rule-0: issue 0')
    expect(result.messages).toContain('  file4.ts:5:5 - rule-4: issue 4')
  })

  test('exitCode remains 1 even when improvements exist alongside regressions', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation()],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'src/new.ts',
      ruleId: 'regression-rule',
      message: 'regression',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [makeViolation(), makeViolation()],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.exitCode).toBe(1)
    expect(result.messages).toContain('  Improvements (fixed violations): 2')
  })

  test('handles regression with special characters in message', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'special.ts',
      ruleId: 'special-rule',
      message: 'use `${x}` not "string" <>&',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain(
      '  special.ts:1:1 - special-rule: use `${x}` not "string" <>&',
    )
  })

  test('returns correct message structure order', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 5,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages[0]).toBe('')
    expect(result.messages[1]).toBe('Baseline Comparison Results:')
    expect(result.messages[2]).toBe('  Regressions (new violations): 0')
    expect(result.messages[3]).toBe('  Improvements (fixed violations): 0')
    expect(result.messages[4]).toBe('  Unchanged: 5')
  })
})

// ============================================================================
// saveBaselineReport - additional coverage
// ============================================================================

describe('saveBaselineReport - additional', () => {
  test('passes empty array correctly', async () => {
    await saveBaselineReport([], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([], undefined)
  })

  test('passes custom output string path', async () => {
    const violations = [makeViolation()]
    await saveBaselineReport(violations, '/tmp/my-baseline.json')
    expect(saveBaseline).toHaveBeenCalledWith(violations, '/tmp/my-baseline.json')
  })

  test('passes relative output path', async () => {
    const violations = [makeViolation()]
    await saveBaselineReport(violations, './baseline.json')
    expect(saveBaseline).toHaveBeenCalledWith(violations, './baseline.json')
  })

  test('returns result object with exactly path and messages keys', async () => {
    const result = await saveBaselineReport([], undefined)
    expect(Object.keys(result).sort()).toEqual(['messages', 'path'])
  })

  test('messages array first element contains "Baseline saved to"', async () => {
    const result = await saveBaselineReport([makeViolation()], undefined)
    expect(result.messages[0]).toMatch(/^Baseline saved to /)
  })

  test('messages array second element contains "Total violations:"', async () => {
    const result = await saveBaselineReport([makeViolation(), makeViolation()], undefined)
    expect(result.messages[1]).toMatch(/^  Total violations: /)
  })

  test('handles violation with suggestion field', async () => {
    const v = makeViolation({ suggestion: 'Use const instead of let' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with empty message', async () => {
    const v = makeViolation({ message: '' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with very long message', async () => {
    const longMsg = 'a'.repeat(500)
    const v = makeViolation({ message: longMsg })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with special characters in filePath', async () => {
    const v = makeViolation({ filePath: 'path/with spaces/and-dashes/file.ts' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation at line 0 column 0', async () => {
    const v = makeViolation({
      range: { start: { line: 0, column: 0 }, end: { line: 0, column: 1 } },
    })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with large line numbers', async () => {
    const v = makeViolation({
      range: { start: { line: 99999, column: 99999 }, end: { line: 99999, column: 99999 } },
    })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with unicode in message', async () => {
    const v = makeViolation({ message: 'エラーが発生しました 🚨' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with ruleId containing slashes', async () => {
    const v = makeViolation({ ruleId: 'category/sub-category/specific-rule' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with all severity levels in single call', async () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: 'e1' }),
      makeViolation({ severity: 'warning', ruleId: 'w1' }),
      makeViolation({ severity: 'info', ruleId: 'i1' }),
      makeViolation({ severity: 'error', ruleId: 'e2' }),
    ]
    const result = await saveBaselineReport(violations, undefined)
    expect(result.messages[1]).toBe('  Total violations: 4')
  })

  test('correct count for exactly 3 violations', async () => {
    const violations = [makeViolation(), makeViolation(), makeViolation()]
    const result = await saveBaselineReport(violations, undefined)
    expect(result.messages[1]).toBe('  Total violations: 3')
  })

  test('correct count for exactly 10 violations', async () => {
    const violations = Array.from({ length: 10 }, (_, i) => makeViolation({ ruleId: `rule-${i}` }))
    const result = await saveBaselineReport(violations, undefined)
    expect(result.messages[1]).toBe('  Total violations: 10')
  })

  test('path matches between messages[0] and result.path', async () => {
    ;(saveBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce('/x/y/z.json')
    const result = await saveBaselineReport([makeViolation()], undefined)
    expect(result.messages[0]).toBe(`Baseline saved to ${result.path}`)
  })

  test('handles violation with deeply nested filePath', async () => {
    const v = makeViolation({ filePath: 'a/b/c/d/e/f/g/h/i/j/k/file.ts' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with .tsx extension', async () => {
    const v = makeViolation({ filePath: 'component.tsx' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with .js extension', async () => {
    const v = makeViolation({ filePath: 'index.js' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })
})

// ============================================================================
// loadBaselineReport - additional coverage
// ============================================================================

describe('loadBaselineReport - additional', () => {
  test('passes relative output path', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    await loadBaselineReport('./my-baseline.json')
    expect(loadBaseline).toHaveBeenCalledWith('./my-baseline.json')
  })

  test('passes absolute output path', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    await loadBaselineReport('/absolute/path/baseline.json')
    expect(loadBaseline).toHaveBeenCalledWith('/absolute/path/baseline.json')
  })

  test('returns undefined violations when baseline not found', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    const result = await loadBaselineReport(undefined)
    expect(result.violations).toBeUndefined()
    expect(result.found).toBe(false)
  })

  test('result has exactly found key when baseline not found', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    const result = await loadBaselineReport(undefined)
    expect(Object.keys(result)).toEqual(['found'])
  })

  test('result has found and violations keys when baseline exists', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation()],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(Object.keys(result).sort()).toEqual(['found', 'violations'])
  })

  test('preserves ruleId from loaded baseline', async () => {
    const v = makeViolation({ ruleId: 'custom-rule-id-123' })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].ruleId).toBe('custom-rule-id-123')
  })

  test('preserves filePath from loaded baseline', async () => {
    const v = makeViolation({ filePath: 'src/deep/module.ts' })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].filePath).toBe('src/deep/module.ts')
  })

  test('preserves end range from loaded baseline', async () => {
    const v = makeViolation({
      range: { start: { line: 10, column: 5 }, end: { line: 20, column: 30 } },
    })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].range.end.line).toBe(20)
    expect(result.violations![0].range.end.column).toBe(30)
  })

  test('handles baseline with single violation correctly', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation({ ruleId: 'only-one' })],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations).toHaveLength(1)
    expect(result.found).toBe(true)
  })

  test('handles baseline with many violations', async () => {
    const manyViolations = Array.from({ length: 50 }, (_, i) =>
      makeViolation({ ruleId: `rule-${i}`, filePath: `file${i}.ts` }),
    )
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: manyViolations,
      summary: { errors: 50, warnings: 0, info: 0, total: 50 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations).toHaveLength(50)
  })

  test('preserves violation with info severity', async () => {
    const v = makeViolation({ severity: 'info' })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 0, warnings: 0, info: 1, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].severity).toBe('info')
  })

  test('preserves violation with error severity', async () => {
    const v = makeViolation({ severity: 'error' })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].severity).toBe('error')
  })

  test('preserves violation with warning severity', async () => {
    const v = makeViolation({ severity: 'warning' })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 0, warnings: 1, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].severity).toBe('warning')
  })

  test('handles violations with same ruleId but different files', async () => {
    const violations = [
      makeViolation({ ruleId: 'same-rule', filePath: 'a.ts' }),
      makeViolation({ ruleId: 'same-rule', filePath: 'b.ts' }),
    ]
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations,
      summary: { errors: 2, warnings: 0, info: 0, total: 2 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].filePath).toBe('a.ts')
    expect(result.violations![1].filePath).toBe('b.ts')
  })

  test('handles violations with same file but different rules', async () => {
    const violations = [
      makeViolation({ ruleId: 'rule-a', filePath: 'same.ts' }),
      makeViolation({ ruleId: 'rule-b', filePath: 'same.ts' }),
    ]
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations,
      summary: { errors: 2, warnings: 0, info: 0, total: 2 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations).toHaveLength(2)
    expect(result.violations![0].ruleId).toBe('rule-a')
    expect(result.violations![1].ruleId).toBe('rule-b')
  })

  test('handles violation at line 1 column 1', async () => {
    const v = makeViolation({
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
    })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].range.start.line).toBe(1)
    expect(result.violations![0].range.start.column).toBe(1)
  })
})

// ============================================================================
// compareWithBaselineReport - additional coverage
// ============================================================================

describe('compareWithBaselineReport - additional', () => {
  test('noBaseline result exitCode is always 1', async () => {
    const result = await compareWithBaselineReport([], undefined)
    expect(result.exitCode).toBe(1)
  })

  test('noBaseline result has exactly one message', async () => {
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages).toHaveLength(1)
  })

  test('noBaseline message instructs to run save first', async () => {
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages[0]).toContain('--baseline save')
  })

  test('noBaseline is true regardless of violations passed', async () => {
    const result = await compareWithBaselineReport([makeViolation(), makeViolation()], undefined)
    expect(result.noBaseline).toBe(true)
  })

  test('passes violations to loadBaselineReport correctly', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 0,
    })
    await compareWithBaselineReport([], undefined)
    expect(loadBaseline).toHaveBeenCalledWith(undefined)
  })

  test('passes custom output path to loadBaseline', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 0,
    })
    await compareWithBaselineReport([], '/my/custom/path.json')
    expect(loadBaseline).toHaveBeenCalledWith('/my/custom/path.json')
  })

  test('messages start with empty string for spacing', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation()],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 1,
    })
    const result = await compareWithBaselineReport([makeViolation()], undefined)
    expect(result.messages[0]).toBe('')
  })

  test('regressions section has empty line before header', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'test.ts',
      ruleId: 'test-rule',
      message: 'test',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    const regressionsIdx = result.messages.indexOf('Regressions:')
    expect(regressionsIdx).toBeGreaterThan(-1)
    expect(result.messages[regressionsIdx - 1]).toBe('')
  })

  test('handles regression with filePath containing spaces', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'path with spaces/file.ts',
      ruleId: 'space-rule',
      message: 'space issue',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  path with spaces/file.ts:1:1 - space-rule: space issue')
  })

  test('handles regression with filePath containing dots', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'src/utils/helpers.format.ts',
      ruleId: 'dot-rule',
      message: 'dot issue',
      range: { start: { line: 3, column: 7 }, end: { line: 3, column: 10 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  src/utils/helpers.format.ts:3:7 - dot-rule: dot issue')
  })

  test('handles regression at line 0 column 0', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'zero.ts',
      ruleId: 'zero-rule',
      message: 'zero issue',
      range: { start: { line: 0, column: 0 }, end: { line: 0, column: 1 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  zero.ts:0:0 - zero-rule: zero issue')
  })

  test('handles regression with colons in message', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'colon.ts',
      ruleId: 'colon-rule',
      message: 'expected: found',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  colon.ts:1:1 - colon-rule: expected: found')
  })

  test('handles regression with unicode message', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'unicode.ts',
      ruleId: 'uni-rule',
      message: '未使用の変数です 🚨',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  unicode.ts:1:1 - uni-rule: 未使用の変数です 🚨')
  })

  test('handles only improvements with no regressions', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation(), makeViolation()],
      summary: { errors: 2, warnings: 0, info: 0, total: 2 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [makeViolation(), makeViolation()],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.exitCode).toBe(0)
    expect(result.messages).toContain('  Improvements (fixed violations): 2')
    expect(result.messages).not.toContain('Regressions:')
  })

  test('shows 0 improvements when none exist', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages).toContain('  Improvements (fixed violations): 0')
  })

  test('shows 0 regressions when none exist', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages).toContain('  Regressions (new violations): 0')
  })

  test('messages have exactly 5 entries when no regressions', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages).toHaveLength(5)
  })

  test('messages have 7+ entries when 1 regression (empty line + header + detail)', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'f.ts',
      ruleId: 'r',
      message: 'm',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toHaveLength(8)
  })

  test('messages have 9 entries when 2 regressions', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regressions = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'r1',
        message: 'm1',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
      }),
      makeViolation({
        filePath: 'b.ts',
        ruleId: 'r2',
        message: 'm2',
        range: { start: { line: 2, column: 2 }, end: { line: 2, column: 3 } },
      }),
    ]
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions,
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport(regressions, undefined)
    expect(result.messages).toHaveLength(9)
  })

  test('regression details preserve exact violation data', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'exact.ts',
      ruleId: 'exact-rule',
      message: 'exact message',
      range: { start: { line: 42, column: 7 }, end: { line: 42, column: 15 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  exact.ts:42:7 - exact-rule: exact message')
  })

  test('passes baseline violations to compareWithBaseline', async () => {
    const baselineViolations = [makeViolation({ ruleId: 'b1' }), makeViolation({ ruleId: 'b2' })]
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: baselineViolations,
      summary: { errors: 2, warnings: 0, info: 0, total: 2 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 2,
    })
    const currentViolations = [makeViolation({ ruleId: 'c1' })]
    await compareWithBaselineReport(currentViolations, undefined)
    expect(compareWithBaseline).toHaveBeenCalledWith(currentViolations, baselineViolations)
  })

  test('handles large unchanged count', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 1000,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages).toContain('  Unchanged: 1000')
  })

  test('handles large improvements count', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: Array.from({ length: 50 }, () => makeViolation()),
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages).toContain('  Improvements (fixed violations): 50')
  })

  test('handles large regressions count', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regressions = Array.from({ length: 25 }, (_, i) =>
      makeViolation({
        filePath: `file${i}.ts`,
        ruleId: `rule-${i}`,
        message: `msg ${i}`,
        range: { start: { line: i, column: i }, end: { line: i, column: i + 1 } },
      }),
    )
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions,
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport(regressions, undefined)
    expect(result.messages).toContain('  Regressions (new violations): 25')
    expect(result.exitCode).toBe(1)
  })

  test('regression with ruleId containing special characters', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'spec.ts',
      ruleId: '@scope/package-rule',
      message: 'scoped rule',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  spec.ts:1:1 - @scope/package-rule: scoped rule')
  })

  test('result has exitCode, messages, and noBaseline keys', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(Object.keys(result).sort()).toEqual(['exitCode', 'messages', 'noBaseline'])
  })

  test('handles regression with empty ruleId', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'empty.ts',
      ruleId: '',
      message: 'empty rule',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  empty.ts:1:1 - : empty rule')
  })

  test('handles regression with empty message', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'nomsg.ts',
      ruleId: 'msg-rule',
      message: '',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  nomsg.ts:1:1 - msg-rule: ')
  })

  test('handles regression with empty filePath', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: '',
      ruleId: 'fp-rule',
      message: 'no file',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  :1:1 - fp-rule: no file')
  })
})

// ============================================================================
// saveBaselineReport - edge cases
// ============================================================================

describe('saveBaselineReport - edge cases', () => {
  test('handles violation with same ruleId appearing multiple times', async () => {
    const violations = [
      makeViolation({ ruleId: 'dup-rule', filePath: 'a.ts' }),
      makeViolation({ ruleId: 'dup-rule', filePath: 'b.ts' }),
      makeViolation({ ruleId: 'dup-rule', filePath: 'c.ts' }),
    ]
    const result = await saveBaselineReport(violations, undefined)
    expect(result.messages[1]).toBe('  Total violations: 3')
    expect(saveBaseline).toHaveBeenCalledWith(violations, undefined)
  })

  test('handles violation with absolute filePath starting with /', async () => {
    const v = makeViolation({ filePath: '/home/user/project/src/index.ts' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('path returned by saveBaseline is reflected in messages[0]', async () => {
    ;(saveBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      '/tmp/test-output/baseline.json',
    )
    const result = await saveBaselineReport([makeViolation()], undefined)
    expect(result.path).toBe('/tmp/test-output/baseline.json')
    expect(result.messages[0]).toBe('Baseline saved to /tmp/test-output/baseline.json')
  })

  test('handles violations with sequential different ruleIds', async () => {
    const violations = Array.from({ length: 7 }, (_, i) =>
      makeViolation({ ruleId: `rule-${i}`, filePath: `file${i}.ts` }),
    )
    const result = await saveBaselineReport(violations, undefined)
    expect(result.messages[1]).toBe('  Total violations: 7')
  })

  test('preserves violations array reference passed to saveBaseline', async () => {
    const violations = [makeViolation({ ruleId: 'ref-test' })]
    await saveBaselineReport(violations, undefined)
    expect(saveBaseline).toHaveBeenCalledWith(violations, undefined)
  })
})

// ============================================================================
// loadBaselineReport - edge cases
// ============================================================================

describe('loadBaselineReport - edge cases', () => {
  test('preserves violation with suggestion field', async () => {
    const v = makeViolation({ suggestion: 'Use const instead of let' })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].suggestion).toBe('Use const instead of let')
  })

  test('preserves violation with empty message', async () => {
    const v = makeViolation({ message: '' })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].message).toBe('')
  })

  test('handles violations with sequential file paths', async () => {
    const violations = Array.from({ length: 10 }, (_, i) =>
      makeViolation({ filePath: `src/module${i}.ts`, ruleId: `rule-${i}` }),
    )
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations,
      summary: { errors: 10, warnings: 0, info: 0, total: 10 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations).toHaveLength(10)
    expect(result.violations![5].filePath).toBe('src/module5.ts')
  })

  test('handles violation with very long ruleId', async () => {
    const longRuleId = 'category'.repeat(20)
    const v = makeViolation({ ruleId: longRuleId })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].ruleId).toBe(longRuleId)
  })

  test('found is true even with empty violations array', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(true)
    expect(result.violations).toEqual([])
  })
})

// ============================================================================
// compareWithBaselineReport - mixed scenario edge cases
// ============================================================================

describe('compareWithBaselineReport - mixed scenarios', () => {
  test('all three categories non-zero: regressions + improvements + unchanged', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation(), makeViolation(), makeViolation(), makeViolation()],
      summary: { errors: 4, warnings: 0, info: 0, total: 4 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'new.ts',
      ruleId: 'new-rule',
      message: 'new issue',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [makeViolation(), makeViolation()],
      unchanged: 2,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.exitCode).toBe(1)
    expect(result.messages).toContain('  Regressions (new violations): 1')
    expect(result.messages).toContain('  Improvements (fixed violations): 2')
    expect(result.messages).toContain('  Unchanged: 2')
    expect(result.messages).toContain('Regressions:')
  })

  test('regression detail with very long filePath', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const longPath = 'src/'.repeat(50) + 'file.ts'
    const regression = makeViolation({
      filePath: longPath,
      ruleId: 'long-path-rule',
      message: 'deep file',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain(`  ${longPath}:1:1 - long-path-rule: deep file`)
  })

  test('unchanged is 0 when all violations are regressions', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regressions = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'r1',
        message: 'm1',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
      }),
      makeViolation({
        filePath: 'b.ts',
        ruleId: 'r2',
        message: 'm2',
        range: { start: { line: 2, column: 2 }, end: { line: 2, column: 3 } },
      }),
    ]
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions,
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport(regressions, undefined)
    expect(result.messages).toContain('  Unchanged: 0')
    expect(result.messages).toContain('  Improvements (fixed violations): 0')
  })

  test('improvements section never lists individual violation details', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation()],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const improvement = makeViolation({
      filePath: 'improved.ts',
      ruleId: 'fixed-rule',
      message: 'was fixed',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [improvement],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages).not.toContain('  improved.ts:1:1 - fixed-rule: was fixed')
    expect(result.messages).not.toContain('Improvements:')
  })

  test('regression with mixed severity levels', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regressions = [
      makeViolation({
        filePath: 'err.ts',
        ruleId: 'err-rule',
        message: 'error',
        severity: 'error',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
      }),
      makeViolation({
        filePath: 'warn.ts',
        ruleId: 'warn-rule',
        message: 'warning',
        severity: 'warning',
        range: { start: { line: 2, column: 2 }, end: { line: 2, column: 3 } },
      }),
    ]
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions,
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport(regressions, undefined)
    expect(result.exitCode).toBe(1)
    expect(result.messages).toContain('  err.ts:1:1 - err-rule: error')
    expect(result.messages).toContain('  warn.ts:2:2 - warn-rule: warning')
  })

  test('regression detail uses filePath as-is without normalization', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: './relative/path/../file.ts',
      ruleId: 'raw-path',
      message: 'raw',
      range: { start: { line: 3, column: 8 }, end: { line: 3, column: 12 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  ./relative/path/../file.ts:3:8 - raw-path: raw')
  })
})

// ============================================================================
// saveBaselineReport - extended coverage
// ============================================================================

describe('saveBaselineReport - extended', () => {
  test('correct total for 2 violations', async () => {
    const result = await saveBaselineReport(
      [makeViolation({ ruleId: 'a' }), makeViolation({ ruleId: 'b' })],
      undefined,
    )
    expect(result.messages[1]).toBe('  Total violations: 2')
  })

  test('correct total for 5 violations', async () => {
    const violations = Array.from({ length: 5 }, (_, i) => makeViolation({ ruleId: `r${i}` }))
    const result = await saveBaselineReport(violations, undefined)
    expect(result.messages[1]).toBe('  Total violations: 5')
  })

  test('correct total for 50 violations', async () => {
    const violations = Array.from({ length: 50 }, (_, i) => makeViolation({ ruleId: `r${i}` }))
    const result = await saveBaselineReport(violations, undefined)
    expect(result.messages[1]).toBe('  Total violations: 50')
  })

  test('correct total for 250 violations', async () => {
    const violations = Array.from({ length: 250 }, (_, i) => makeViolation({ ruleId: `r${i}` }))
    const result = await saveBaselineReport(violations, undefined)
    expect(result.messages[1]).toBe('  Total violations: 250')
  })

  test('handles violation with suggestion field preserved', async () => {
    const v = makeViolation({ suggestion: 'Consider using optional chaining' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with severity warning', async () => {
    const v = makeViolation({ severity: 'warning' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with severity info', async () => {
    const v = makeViolation({ severity: 'info' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with backslash in filePath', async () => {
    const v = makeViolation({ filePath: 'src\\utils\\file.ts' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with hyphenated ruleId', async () => {
    const v = makeViolation({ ruleId: 'no-unused-vars' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with underscored ruleId', async () => {
    const v = makeViolation({ ruleId: 'no_underscore_rule' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation at very end of file (large line)', async () => {
    const v = makeViolation({
      range: { start: { line: 10000, column: 1 }, end: { line: 10000, column: 50 } },
    })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with single character range', async () => {
    const v = makeViolation({
      range: { start: { line: 5, column: 3 }, end: { line: 5, column: 4 } },
    })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles output path with tilde', async () => {
    await saveBaselineReport([], '~/baseline.json')
    expect(saveBaseline).toHaveBeenCalledWith([], '~/baseline.json')
  })

  test('handles output path with environment-like variable', async () => {
    await saveBaselineReport([], '${HOME}/baseline.json')
    expect(saveBaseline).toHaveBeenCalledWith([], '${HOME}/baseline.json')
  })

  test('messages array is frozen-length at 2', async () => {
    const result = await saveBaselineReport([makeViolation()], undefined)
    expect(result.messages.length).toBe(2)
  })

  test('path string is exactly what saveBaseline returns', async () => {
    ;(saveBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce('/exact/path.json')
    const result = await saveBaselineReport([], undefined)
    expect(result.path).toBe('/exact/path.json')
  })

  test('handles violation with .vue extension', async () => {
    const v = makeViolation({ filePath: 'Component.vue' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with .py extension', async () => {
    const v = makeViolation({ filePath: 'script.py' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with multi-byte characters in message', async () => {
    const v = makeViolation({ message: '中文テスト한국어' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('result is awaitable multiple times', async () => {
    const result = await saveBaselineReport([makeViolation()], undefined)
    const result2 = result
    expect(result2.path).toBe(result.path)
    expect(result2.messages).toEqual(result.messages)
  })

  test('messages first element format is consistent', async () => {
    ;(saveBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce('/z.json')
    const result = await saveBaselineReport([], undefined)
    expect(result.messages[0]).toBe('Baseline saved to /z.json')
  })

  test('messages second element format is consistent', async () => {
    const result = await saveBaselineReport(
      [makeViolation(), makeViolation(), makeViolation()],
      undefined,
    )
    expect(result.messages[1]).toBe('  Total violations: 3')
  })
})

// ============================================================================
// loadBaselineReport - extended coverage
// ============================================================================

describe('loadBaselineReport - extended', () => {
  test('returns found false on second consecutive null call', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(false)
  })

  test('handles baseline with timestamp field', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation()],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-06-15T12:00:00Z',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(true)
    expect(result.violations).toHaveLength(1)
  })

  test('handles baseline with old timestamp', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2020-01-01T00:00:00Z',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(true)
  })

  test('handles baseline with violations containing emoji in message', async () => {
    const v = makeViolation({ message: 'Error 🔥 in code ⚡' })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].message).toBe('Error 🔥 in code ⚡')
  })

  test('handles baseline with violations containing newlines in message', async () => {
    const v = makeViolation({ message: 'line1\nline2\nline3' })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].message).toBe('line1\nline2\nline3')
  })

  test('handles baseline with violations containing tab characters', async () => {
    const v = makeViolation({ message: 'col1\tcol2\tcol3' })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].message).toBe('col1\tcol2\tcol3')
  })

  test('handles baseline with violation at max line number', async () => {
    const v = makeViolation({
      range: {
        start: { line: Number.MAX_SAFE_INTEGER, column: 1 },
        end: { line: Number.MAX_SAFE_INTEGER, column: 2 },
      },
    })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].range.start.line).toBe(Number.MAX_SAFE_INTEGER)
  })

  test('preserves all fields of multiple violations', async () => {
    const v1 = makeViolation({ ruleId: 'r1', filePath: 'f1.ts', message: 'm1', severity: 'error' })
    const v2 = makeViolation({
      ruleId: 'r2',
      filePath: 'f2.ts',
      message: 'm2',
      severity: 'warning',
    })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v1, v2],
      summary: { errors: 1, warnings: 1, info: 0, total: 2 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].ruleId).toBe('r1')
    expect(result.violations![0].filePath).toBe('f1.ts')
    expect(result.violations![1].ruleId).toBe('r2')
    expect(result.violations![1].filePath).toBe('f2.ts')
  })

  test('handles baseline with 100 violations', async () => {
    const violations = Array.from({ length: 100 }, (_, i) => makeViolation({ ruleId: `rule-${i}` }))
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations,
      summary: { errors: 100, warnings: 0, info: 0, total: 100 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations).toHaveLength(100)
  })

  test('handles path with spaces', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    await loadBaselineReport('/path with spaces/baseline.json')
    expect(loadBaseline).toHaveBeenCalledWith('/path with spaces/baseline.json')
  })

  test('handles path with encoded characters', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    await loadBaselineReport('/path%20with%20spaces/baseline.json')
    expect(loadBaseline).toHaveBeenCalledWith('/path%20with%20spaces/baseline.json')
  })

  test('handles empty string path', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    await loadBaselineReport('')
    expect(loadBaseline).toHaveBeenCalledWith('')
  })

  test('found is strictly boolean true', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation()],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(true)
    expect(typeof result.found).toBe('boolean')
  })

  test('found is strictly boolean false', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(false)
    expect(typeof result.found).toBe('boolean')
  })

  test('violations array is same reference from baseline', async () => {
    const baselineViolations = [makeViolation({ ruleId: 'ref-check' })]
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: baselineViolations,
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations).toBe(baselineViolations)
  })
})

// ============================================================================
// compareWithBaselineReport - extended coverage
// ============================================================================

describe('compareWithBaselineReport - extended', () => {
  test('noBaseline with violations still returns correct message', async () => {
    const result = await compareWithBaselineReport(
      [makeViolation(), makeViolation(), makeViolation()],
      undefined,
    )
    expect(result.messages[0]).toBe('No baseline file found. Run with --baseline save first.')
    expect(result.exitCode).toBe(1)
  })

  test('noBaseline with custom output path', async () => {
    const result = await compareWithBaselineReport([], '/custom/path.json')
    expect(result.noBaseline).toBe(true)
  })

  test('comparison result has all expected keys', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result).toHaveProperty('exitCode')
    expect(result).toHaveProperty('messages')
    expect(result).toHaveProperty('noBaseline')
  })

  test('exitCode is number type', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(typeof result.exitCode).toBe('number')
  })

  test('noBaseline is boolean type', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(typeof result.noBaseline).toBe('boolean')
  })

  test('messages is array type', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(Array.isArray(result.messages)).toBe(true)
  })

  test('regression with large line number formats correctly', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'big.ts',
      ruleId: 'big-rule',
      message: 'big line',
      range: { start: { line: 99999, column: 88888 }, end: { line: 99999, column: 88889 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  big.ts:99999:88888 - big-rule: big line')
  })

  test('handles 10 regressions with correct count', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regressions = Array.from({ length: 10 }, (_, i) =>
      makeViolation({
        filePath: `f${i}.ts`,
        ruleId: `r${i}`,
        message: `m${i}`,
        range: { start: { line: i, column: i }, end: { line: i, column: i + 1 } },
      }),
    )
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions,
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport(regressions, undefined)
    expect(result.messages).toContain('  Regressions (new violations): 10')
  })

  test('regressions details appear in order', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regressions = [
      makeViolation({
        filePath: 'a.ts',
        ruleId: 'first',
        message: 'first issue',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
      }),
      makeViolation({
        filePath: 'b.ts',
        ruleId: 'second',
        message: 'second issue',
        range: { start: { line: 2, column: 2 }, end: { line: 2, column: 3 } },
      }),
    ]
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions,
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport(regressions, undefined)
    const firstIdx = result.messages.indexOf('  a.ts:1:1 - first: first issue')
    const secondIdx = result.messages.indexOf('  b.ts:2:2 - second: second issue')
    expect(firstIdx).toBeGreaterThan(-1)
    expect(secondIdx).toBeGreaterThan(firstIdx)
  })

  test('regression with single-char message', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'x.ts',
      ruleId: 'y',
      message: 'z',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  x.ts:1:1 - y: z')
  })

  test('handles regression with Windows-style path', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'C:\\Users\\dev\\project\\src\\file.ts',
      ruleId: 'win-rule',
      message: 'windows',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain(
      '  C:\\Users\\dev\\project\\src\\file.ts:1:1 - win-rule: windows',
    )
  })

  test('Baseline Comparison Results header appears at index 1', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 3,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages[1]).toBe('Baseline Comparison Results:')
  })

  test('Unchanged count reflects compareWithBaseline return value', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 42,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.messages).toContain('  Unchanged: 42')
  })

  test('improvements only scenario exitCode is 0', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation()],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [makeViolation()],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([], undefined)
    expect(result.exitCode).toBe(0)
    expect(result.noBaseline).toBe(false)
  })

  test('unchanged only scenario exitCode is 0', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation()],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 1,
    })
    const result = await compareWithBaselineReport([makeViolation()], undefined)
    expect(result.exitCode).toBe(0)
    expect(result.messages).toContain('  Unchanged: 1')
  })

  test('handles regression with hash in message', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'hash.ts',
      ruleId: 'hash-rule',
      message: 'see #123 for details',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  hash.ts:1:1 - hash-rule: see #123 for details')
  })

  test('handles regression with parentheses in message', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'paren.ts',
      ruleId: 'paren-rule',
      message: 'unexpected token (',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  paren.ts:1:1 - paren-rule: unexpected token (')
  })

  test('handles regression with slash in filePath', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'src/utils/deep/helper.ts',
      ruleId: 'deep-rule',
      message: 'deep',
      range: { start: { line: 7, column: 3 }, end: { line: 7, column: 10 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  src/utils/deep/helper.ts:7:3 - deep-rule: deep')
  })

  test('messages length for 3 regressions is 10', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regressions = Array.from({ length: 3 }, (_, i) =>
      makeViolation({
        filePath: `f${i}.ts`,
        ruleId: `r${i}`,
        message: `m${i}`,
        range: { start: { line: i, column: i }, end: { line: i, column: i + 1 } },
      }),
    )
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions,
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport(regressions, undefined)
    // 5 base + 1 empty + 1 header + 3 details = 10
    expect(result.messages).toHaveLength(10)
  })

  test('calls loadBaseline before compareWithBaseline', async () => {
    const callOrder: string[] = []
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockImplementationOnce(async () => {
      callOrder.push('load')
      return {
        violations: [],
        summary: { errors: 0, warnings: 0, info: 0, total: 0 },
        timestamp: '2024-01-01',
      }
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      callOrder.push('compare')
      return { regressions: [], improvements: [], unchanged: 0 }
    })
    await compareWithBaselineReport([], undefined)
    expect(callOrder).toEqual(['load', 'compare'])
  })

  test('does not call compareWithBaseline when no baseline', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockClear()
    await compareWithBaselineReport([], undefined)
    expect(compareWithBaseline).not.toHaveBeenCalled()
  })

  test('passes empty current violations array to compareWithBaseline', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation()],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [makeViolation()],
      unchanged: 0,
    })
    await compareWithBaselineReport([], undefined)
    expect(compareWithBaseline).toHaveBeenCalledWith([], [makeViolation()])
  })
})

// ============================================================================
// Additional boundary and integration tests
// ============================================================================

describe('saveBaselineReport - boundary', () => {
  test('handles exactly 1 violation count string', async () => {
    const result = await saveBaselineReport([makeViolation()], undefined)
    expect(result.messages[1]).toMatch(/\b1\b/)
  })

  test('handles violation with range on same line', async () => {
    const v = makeViolation({
      range: { start: { line: 5, column: 1 }, end: { line: 5, column: 100 } },
    })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with end before start column logically', async () => {
    const v = makeViolation({
      range: { start: { line: 1, column: 10 }, end: { line: 1, column: 5 } },
    })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles output path as empty string', async () => {
    await saveBaselineReport([], '')
    expect(saveBaseline).toHaveBeenCalledWith([], '')
  })

  test('handles violation with very long filePath (500 chars)', async () => {
    const longPath = 'a/'.repeat(125) + 'file.ts'
    const v = makeViolation({ filePath: longPath })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('handles violation with ruleId containing dots', async () => {
    const v = makeViolation({ ruleId: 'no.eval.security' })
    await saveBaselineReport([v], undefined)
    expect(saveBaseline).toHaveBeenCalledWith([v], undefined)
  })

  test('total violations string has correct indentation', async () => {
    const result = await saveBaselineReport([makeViolation()], undefined)
    expect(result.messages[1].startsWith('  ')).toBe(true)
  })
})

describe('loadBaselineReport - boundary', () => {
  test('handles baseline with summary containing all zeros', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.found).toBe(true)
    expect(result.violations).toEqual([])
  })

  test('handles baseline with mixed severity summary', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [
        makeViolation({ severity: 'error' }),
        makeViolation({ severity: 'warning' }),
        makeViolation({ severity: 'info' }),
      ],
      summary: { errors: 1, warnings: 1, info: 1, total: 3 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations).toHaveLength(3)
  })

  test('handles baseline with violation containing backslashes in filePath', async () => {
    const v = makeViolation({ filePath: 'src\\nested\\file.ts' })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].filePath).toBe('src\\nested\\file.ts')
  })

  test('handles baseline with two violations in same file same line', async () => {
    const violations = [
      makeViolation({
        filePath: 'same.ts',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
      }),
      makeViolation({
        filePath: 'same.ts',
        range: { start: { line: 1, column: 10 }, end: { line: 1, column: 15 } },
      }),
    ]
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations,
      summary: { errors: 2, warnings: 0, info: 0, total: 2 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations).toHaveLength(2)
    expect(result.violations![0].range.start.column).toBe(1)
    expect(result.violations![1].range.start.column).toBe(10)
  })

  test('handles violation with dot-dot in filePath', async () => {
    const v = makeViolation({ filePath: '../parent/file.ts' })
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [v],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    const result = await loadBaselineReport(undefined)
    expect(result.violations![0].filePath).toBe('../parent/file.ts')
  })
})

describe('compareWithBaselineReport - boundary', () => {
  test('regression with angle brackets in message', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'type.ts',
      ruleId: 'type-rule',
      message: 'expected Array<string> but got Array<number>',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain(
      '  type.ts:1:1 - type-rule: expected Array<string> but got Array<number>',
    )
  })

  test('regression with pipe character in message', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'pipe.ts',
      ruleId: 'pipe-rule',
      message: 'use a | b | c',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  pipe.ts:1:1 - pipe-rule: use a | b | c')
  })

  test('empty line before regressions header is at correct index', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'idx.ts',
      ruleId: 'idx-rule',
      message: 'idx msg',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    // messages: ['', 'Baseline Comparison Results:', '  Regressions ...: 1', '  Improvements ...: 0', '  Unchanged: 0', '', 'Regressions:', '  idx.ts:1:1 - idx-rule: idx msg']
    expect(result.messages[5]).toBe('')
    expect(result.messages[6]).toBe('Regressions:')
  })

  test('noBaseline result does not call compareWithBaseline', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockClear()
    await compareWithBaselineReport([makeViolation()], undefined)
    expect(compareWithBaseline).not.toHaveBeenCalled()
  })

  test('regression with semicolon in message', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      timestamp: '2024-01-01',
    })
    const regression = makeViolation({
      filePath: 'semi.ts',
      ruleId: 'semi-rule',
      message: 'missing semicolon; expected ;',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [regression],
      improvements: [],
      unchanged: 0,
    })
    const result = await compareWithBaselineReport([regression], undefined)
    expect(result.messages).toContain('  semi.ts:1:1 - semi-rule: missing semicolon; expected ;')
  })

  test('result noBaseline is false when baseline found and no regressions', async () => {
    ;(loadBaseline as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      violations: [makeViolation()],
      summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      timestamp: '2024-01-01',
    })
    ;(compareWithBaseline as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      regressions: [],
      improvements: [],
      unchanged: 1,
    })
    const result = await compareWithBaselineReport([makeViolation()], undefined)
    expect(result.noBaseline).toBe(false)
  })
})
