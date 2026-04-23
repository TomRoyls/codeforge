import * as fs from 'fs/promises'
import * as path from 'path'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { RuleViolation } from '../../../src/ast/visitor.js'
import {
  saveBaseline,
  loadBaseline,
  compareWithBaseline,
  type BaselineFile,
  type BaselineViolation,
} from '../../../src/core/baseline.js'

vi.mock('fs/promises')

vi.mock('path', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    resolve: vi.fn((...args: string[]) => `/resolved/${args.join('/')}`),
  }
})

function createViolation(
  ruleId: string,
  filePath: string,
  line: number,
  message: string,
  severity: 'error' | 'warning' | 'info' = 'error',
): RuleViolation {
  return {
    ruleId,
    filePath,
    message,
    severity,
    range: {
      start: { line, column: 1 },
      end: { line, column: 10 },
    },
  }
}

function getWrittenContent(): string {
  return String(vi.mocked(fs.writeFile).mock.calls[0][1])
}

function parseWrittenBaseline(): BaselineFile {
  return JSON.parse(getWrittenContent()) as BaselineFile
}

describe('baseline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('saveBaseline', () => {
    it('saves violations to default path', async () => {
      await saveBaseline([createViolation('rule1', 'file1.ts', 10, 'Error 1')])

      expect(fs.writeFile).toHaveBeenCalledTimes(1)
      expect(path.resolve).toHaveBeenCalledWith('.codeforge-baseline.json')
    })

    it('saves violations to custom output path', async () => {
      await saveBaseline([createViolation('rule1', 'file1.ts', 10, 'Error 1')], 'custom.json')

      expect(path.resolve).toHaveBeenCalledWith('custom.json')
      expect(fs.writeFile).toHaveBeenCalledWith('/resolved/custom.json', expect.any(String), 'utf8')
    })

    it('creates timestamp as ISO string', async () => {
      const before = new Date().toISOString()
      await saveBaseline([createViolation('r', 'f.ts', 1, 'm')])
      const after = new Date().toISOString()

      const parsed = parseWrittenBaseline()
      expect(parsed.timestamp).toBeTruthy()
      const ts = new Date(parsed.timestamp).toISOString()
      expect(ts).toBe(parsed.timestamp)
      expect(parsed.timestamp >= before).toBe(true)
      expect(parsed.timestamp <= after).toBe(true)
    })

    it('converts violations to baseline format', async () => {
      const violation = createViolation('rule1', 'file.ts', 5, 'Test message', 'warning')

      await saveBaseline([violation])

      const parsed = parseWrittenBaseline()
      expect(parsed.violations).toHaveLength(1)
      const bv = parsed.violations[0]
      expect(bv.ruleId).toBe('rule1')
      expect(bv.filePath).toBe('file.ts')
      expect(bv.range.start.line).toBe(5)
      expect(bv.range.start.column).toBe(1)
      expect(bv.range.end.line).toBe(5)
      expect(bv.range.end.column).toBe(10)
      expect(bv.severity).toBe('warning')
      expect(bv.message).toBe('Test message')
    })

    it('calculates error count correctly', async () => {
      const violations = [
        createViolation('r1', 'f.ts', 1, 'm', 'error'),
        createViolation('r2', 'f.ts', 2, 'm', 'error'),
        createViolation('r3', 'f.ts', 3, 'm', 'warning'),
      ]

      await saveBaseline(violations)

      expect(parseWrittenBaseline().summary.errors).toBe(2)
    })

    it('calculates warning count correctly', async () => {
      const violations = [
        createViolation('r1', 'f.ts', 1, 'm', 'warning'),
        createViolation('r2', 'f.ts', 2, 'm', 'warning'),
        createViolation('r3', 'f.ts', 3, 'm', 'error'),
      ]

      await saveBaseline(violations)

      expect(parseWrittenBaseline().summary.warnings).toBe(2)
    })

    it('calculates info count correctly', async () => {
      const violations = [
        createViolation('r1', 'f.ts', 1, 'm', 'info'),
        createViolation('r2', 'f.ts', 2, 'm', 'info'),
        createViolation('r3', 'f.ts', 3, 'm', 'info'),
        createViolation('r4', 'f.ts', 4, 'm', 'error'),
      ]

      await saveBaseline(violations)

      expect(parseWrittenBaseline().summary.info).toBe(3)
    })

    it('sets total to violations.length', async () => {
      const violations = [
        createViolation('r1', 'f.ts', 1, 'm', 'error'),
        createViolation('r2', 'f.ts', 2, 'm', 'warning'),
        createViolation('r3', 'f.ts', 3, 'm', 'info'),
        createViolation('r4', 'f.ts', 4, 'm', 'error'),
        createViolation('r5', 'f.ts', 5, 'm', 'warning'),
      ]

      await saveBaseline(violations)

      expect(parseWrittenBaseline().summary.total).toBe(5)
    })

    it('returns resolved file path', async () => {
      const result = await saveBaseline([], 'my-output.json')

      expect(result).toBe('/resolved/my-output.json')
    })

    it('writes pretty-printed JSON', async () => {
      await saveBaseline([createViolation('r', 'f.ts', 1, 'm')])

      const content = getWrittenContent()

      expect(content).toContain('\n')
      expect(content).toContain('  ')
      expect(() => JSON.parse(content)).not.toThrow()
    })

    it('returns default baseline path when no output path specified', async () => {
      const result = await saveBaseline([createViolation('r', 'f.ts', 1, 'm')])

      expect(result).toBe('/resolved/.codeforge-baseline.json')
      expect(path.resolve).toHaveBeenCalledWith('.codeforge-baseline.json')
    })

    it('preserves all range end fields in saved violations', async () => {
      const violation: RuleViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        message: 'm',
        severity: 'error',
        range: {
          start: { line: 3, column: 5 },
          end: { line: 7, column: 15 },
        },
      }

      await saveBaseline([violation])

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].range.end.line).toBe(7)
      expect(parsed.violations[0].range.end.column).toBe(15)
    })

    it('preserves violation order in saved file', async () => {
      const violations = [
        createViolation('alpha', 'a.ts', 1, 'first'),
        createViolation('beta', 'b.ts', 2, 'second'),
        createViolation('gamma', 'c.ts', 3, 'third'),
      ]

      await saveBaseline(violations)

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].ruleId).toBe('alpha')
      expect(parsed.violations[1].ruleId).toBe('beta')
      expect(parsed.violations[2].ruleId).toBe('gamma')
    })

    it('handles violations with same ruleId and file but different lines', async () => {
      const violations = [
        createViolation('rule1', 'same.ts', 10, 'first'),
        createViolation('rule1', 'same.ts', 20, 'second'),
        createViolation('rule1', 'same.ts', 30, 'third'),
      ]

      await saveBaseline(violations)

      const parsed = parseWrittenBaseline()
      expect(parsed.violations).toHaveLength(3)
      expect(parsed.summary.total).toBe(3)
    })

    it('handles special characters in violation messages', async () => {
      const violations = [
        createViolation('r1', 'f.ts', 1, 'Message with "quotes" and <html> & stuff'),
      ]

      await saveBaseline(violations)

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].message).toBe('Message with "quotes" and <html> & stuff')
    })

    it('handles single info-only violation', async () => {
      await saveBaseline([createViolation('r1', 'f.ts', 1, 'info msg', 'info')])

      const parsed = parseWrittenBaseline()
      expect(parsed.summary.errors).toBe(0)
      expect(parsed.summary.warnings).toBe(0)
      expect(parsed.summary.info).toBe(1)
      expect(parsed.summary.total).toBe(1)
    })

    it('writes JSON with all top-level keys', async () => {
      await saveBaseline([])

      const parsed = parseWrittenBaseline()
      expect(parsed).toHaveProperty('timestamp')
      expect(parsed).toHaveProperty('violations')
      expect(parsed).toHaveProperty('summary')
    })

    it('handles violations across multiple files', async () => {
      const violations = [
        createViolation('r1', 'src/a.ts', 1, 'm'),
        createViolation('r2', 'src/b.ts', 2, 'm'),
        createViolation('r3', 'src/c.ts', 3, 'm'),
      ]

      await saveBaseline(violations)

      const parsed = parseWrittenBaseline()
      const files = parsed.violations.map((v) => v.filePath)
      expect(files).toEqual(['src/a.ts', 'src/b.ts', 'src/c.ts'])
    })
  })

  describe('loadBaseline', () => {
    it('loads and parses existing baseline file', async () => {
      const baselineContent: BaselineFile = {
        timestamp: '2025-01-01T00:00:00.000Z',
        violations: [
          {
            ruleId: 'r1',
            filePath: 'f.ts',
            range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
            severity: 'error',
            message: 'test',
          },
        ],
        summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baselineContent))

      const result = await loadBaseline('baseline.json')

      expect(result).not.toBeNull()
      expect(result!.violations).toHaveLength(1)
      expect(result!.violations[0].ruleId).toBe('r1')
    })

    it('returns null when file not found', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(
        Object.assign(new Error('ENOENT: no such file'), { code: 'ENOENT' }),
      )

      const result = await loadBaseline('nonexistent.json')

      expect(result).toBeNull()
    })

    it('returns null on parse error', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('not valid json {{{')

      const result = await loadBaseline('bad.json')

      expect(result).toBeNull()
    })

    it('uses default path when no outputPath provided', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        '{"timestamp":"","violations":[],"summary":{"errors":0,"warnings":0,"info":0,"total":0}}',
      )

      await loadBaseline()

      expect(path.resolve).toHaveBeenCalledWith('.codeforge-baseline.json')
    })

    it('uses custom path when outputPath provided', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        '{"timestamp":"","violations":[],"summary":{"errors":0,"warnings":0,"info":0,"total":0}}',
      )

      await loadBaseline('custom.json')

      expect(path.resolve).toHaveBeenCalledWith('custom.json')
    })

    it('returns BaselineFile with correct structure', async () => {
      const baseline: BaselineFile = {
        timestamp: '2025-01-01T00:00:00.000Z',
        violations: [],
        summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))

      const result = await loadBaseline('test.json')

      expect(result).toEqual({
        timestamp: expect.any(String),
        violations: expect.any(Array),
        summary: expect.objectContaining({
          errors: expect.any(Number),
          warnings: expect.any(Number),
          info: expect.any(Number),
          total: expect.any(Number),
        }),
      })
    })

    it('returns null on any read error', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Permission denied'))

      const result = await loadBaseline('no-perm.json')

      expect(result).toBeNull()
    })

    it('returns null for empty file content', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('')

      const result = await loadBaseline('empty.json')

      expect(result).toBeNull()
    })

    it('loads baseline with multiple violations', async () => {
      const baseline: BaselineFile = {
        timestamp: '2025-01-01T00:00:00.000Z',
        violations: [
          {
            ruleId: 'r1',
            filePath: 'a.ts',
            range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
            severity: 'error',
            message: 'e1',
          },
          {
            ruleId: 'r2',
            filePath: 'b.ts',
            range: { start: { line: 2, column: 1 }, end: { line: 2, column: 5 } },
            severity: 'warning',
            message: 'e2',
          },
          {
            ruleId: 'r3',
            filePath: 'c.ts',
            range: { start: { line: 3, column: 1 }, end: { line: 3, column: 5 } },
            severity: 'info',
            message: 'e3',
          },
        ],
        summary: { errors: 1, warnings: 1, info: 1, total: 3 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))

      const result = await loadBaseline('multi.json')

      expect(result).not.toBeNull()
      expect(result!.violations).toHaveLength(3)
      expect(result!.violations[0].severity).toBe('error')
      expect(result!.violations[1].severity).toBe('warning')
      expect(result!.violations[2].severity).toBe('info')
    })

    it('loads baseline with zero summary values', async () => {
      const baseline: BaselineFile = {
        timestamp: '2025-06-15T12:00:00.000Z',
        violations: [],
        summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))

      const result = await loadBaseline('empty-baseline.json')

      expect(result).not.toBeNull()
      expect(result!.summary.errors).toBe(0)
      expect(result!.summary.warnings).toBe(0)
      expect(result!.summary.info).toBe(0)
      expect(result!.summary.total).toBe(0)
    })

    it('preserves violation range fields when loading', async () => {
      const baseline: BaselineFile = {
        timestamp: '2025-01-01T00:00:00.000Z',
        violations: [
          {
            ruleId: 'r1',
            filePath: 'f.ts',
            range: { start: { line: 10, column: 3 }, end: { line: 20, column: 8 } },
            severity: 'error',
            message: 'm',
          },
        ],
        summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))

      const result = await loadBaseline('range-test.json')

      expect(result!.violations[0].range.start.line).toBe(10)
      expect(result!.violations[0].range.start.column).toBe(3)
      expect(result!.violations[0].range.end.line).toBe(20)
      expect(result!.violations[0].range.end.column).toBe(8)
    })

    it('returns null for content that is just whitespace', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('   \n\t  ')

      const result = await loadBaseline('whitespace.json')

      expect(result).toBeNull()
    })

    it('loads baseline with nested directory path', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        '{"timestamp":"2025-01-01T00:00:00.000Z","violations":[],"summary":{"errors":0,"warnings":0,"info":0,"total":0}}',
      )

      await loadBaseline('reports/baseline.json')

      expect(path.resolve).toHaveBeenCalledWith('reports/baseline.json')
    })
  })

  describe('compareWithBaseline', () => {
    it('returns empty regressions when violations match', () => {
      const violations = [createViolation('rule1', 'file1.ts', 10, 'Error', 'error')]

      const result = compareWithBaseline(violations, violations)

      expect(result.regressions).toHaveLength(0)
    })

    it('returns empty improvements when violations match', () => {
      const violations = [createViolation('rule1', 'file1.ts', 10, 'Error', 'error')]

      const result = compareWithBaseline(violations, violations)

      expect(result.improvements).toHaveLength(0)
    })

    it('calculates unchanged count correctly', () => {
      const baseline = [
        createViolation('rule1', 'file1.ts', 10, 'E1', 'error'),
        createViolation('rule2', 'file2.ts', 20, 'E2', 'error'),
        createViolation('rule3', 'file3.ts', 30, 'E3', 'error'),
      ]
      const current = [
        createViolation('rule1', 'file1.ts', 10, 'E1', 'error'),
        createViolation('rule2', 'file2.ts', 20, 'E2', 'error'),
      ]

      const result = compareWithBaseline(current, baseline)

      expect(result.unchanged).toBe(2)
    })

    it('identifies new violations as regressions', () => {
      const baseline = [createViolation('rule1', 'file1.ts', 10, 'Error', 'error')]
      const current = [
        createViolation('rule1', 'file1.ts', 10, 'Error', 'error'),
        createViolation('rule2', 'file2.ts', 20, 'New Error', 'error'),
      ]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(1)
      expect(result.regressions[0].ruleId).toBe('rule2')
    })

    it('identifies removed violations as improvements', () => {
      const baseline = [
        createViolation('rule1', 'file1.ts', 10, 'Error', 'error'),
        createViolation('rule2', 'file2.ts', 20, 'Fixed', 'error'),
      ]
      const current = [createViolation('rule1', 'file1.ts', 10, 'Error', 'error')]

      const result = compareWithBaseline(current, baseline)

      expect(result.improvements).toHaveLength(1)
      expect(result.improvements[0].ruleId).toBe('rule2')
    })

    it('handles completely different violation sets', () => {
      const baseline = [
        createViolation('rule1', 'file1.ts', 10, 'A', 'error'),
        createViolation('rule2', 'file2.ts', 20, 'B', 'error'),
      ]
      const current = [
        createViolation('rule3', 'file3.ts', 30, 'C', 'error'),
        createViolation('rule4', 'file4.ts', 40, 'D', 'error'),
      ]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(2)
      expect(result.improvements).toHaveLength(2)
      expect(result.unchanged).toBe(0)
    })

    it('handles empty current violations — all improvements', () => {
      const baseline = [
        createViolation('rule1', 'file1.ts', 10, 'E', 'error'),
        createViolation('rule2', 'file2.ts', 20, 'W', 'warning'),
      ]

      const result = compareWithBaseline([], baseline)

      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(2)
      expect(result.unchanged).toBe(0)
    })

    it('handles empty baseline — all regressions', () => {
      const current = [
        createViolation('rule1', 'file1.ts', 10, 'E', 'error'),
        createViolation('rule2', 'file2.ts', 20, 'W', 'warning'),
      ]

      const result = compareWithBaseline(current, [])

      expect(result.regressions).toHaveLength(2)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(0)
    })

    it('handles same violations in different order', () => {
      const v1 = createViolation('rule1', 'file1.ts', 10, 'E1', 'error')
      const v2 = createViolation('rule2', 'file2.ts', 20, 'E2', 'error')
      const v3 = createViolation('rule3', 'file3.ts', 30, 'E3', 'error')

      const result = compareWithBaseline([v3, v1, v2], [v1, v2, v3])

      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(3)
    })

    it('creates correct violation key format — matches by ruleId, filePath, line', () => {
      const baseline = [createViolation('my-rule', 'src/file.ts', 42, 'old message', 'error')]
      const current = [createViolation('my-rule', 'src/file.ts', 42, 'new message', 'warning')]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(1)
    })

    it('returns improvement violations with correct fields', () => {
      const baselineViolation: BaselineViolation = {
        ruleId: 'removed-rule',
        filePath: 'removed.ts',
        range: { start: { line: 5, column: 2 }, end: { line: 5, column: 8 } },
        severity: 'warning',
        message: 'Removed violation message',
      }

      const result = compareWithBaseline([], [baselineViolation])

      expect(result.improvements).toHaveLength(1)
      const imp = result.improvements[0]
      expect(imp.ruleId).toBe('removed-rule')
      expect(imp.filePath).toBe('removed.ts')
      expect(imp.range.start.line).toBe(5)
      expect(imp.range.start.column).toBe(2)
      expect(imp.range.end.line).toBe(5)
      expect(imp.range.end.column).toBe(8)
      expect(imp.severity).toBe('warning')
      expect(imp.message).toBe('Removed violation message')
    })

    it('computes unchanged as current count minus regressions', () => {
      const baseline = [
        createViolation('rule1', 'f1.ts', 1, 'E', 'error'),
        createViolation('rule2', 'f2.ts', 2, 'E', 'error'),
        createViolation('rule3', 'f3.ts', 3, 'E', 'error'),
      ]
      const current = [
        createViolation('rule1', 'f1.ts', 1, 'E', 'error'),
        createViolation('rule2', 'f2.ts', 2, 'E', 'error'),
        createViolation('new-rule', 'f4.ts', 4, 'N', 'error'),
      ]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(1)
      expect(result.unchanged).toBe(2)
    })

    it('treats violations with same key but different severity as match', () => {
      const baseline: BaselineViolation[] = [
        {
          ruleId: 'r1',
          filePath: 'f.ts',
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          severity: 'error',
          message: 'msg',
        },
      ]
      const current = [createViolation('r1', 'f.ts', 1, 'msg', 'warning')]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(1)
    })

    it('treats violations with same key but different message as match', () => {
      const baseline: BaselineViolation[] = [
        {
          ruleId: 'r1',
          filePath: 'f.ts',
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          severity: 'error',
          message: 'original message',
        },
      ]
      const current = [createViolation('r1', 'f.ts', 1, 'updated message', 'error')]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(1)
    })

    it('distinguishes violations by file path', () => {
      const baseline = [createViolation('r1', 'a.ts', 1, 'm')]
      const current = [createViolation('r1', 'b.ts', 1, 'm')]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(1)
      expect(result.improvements).toHaveLength(1)
      expect(result.unchanged).toBe(0)
    })

    it('distinguishes violations by line number', () => {
      const baseline = [createViolation('r1', 'f.ts', 10, 'm')]
      const current = [createViolation('r1', 'f.ts', 20, 'm')]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(1)
      expect(result.improvements).toHaveLength(1)
      expect(result.unchanged).toBe(0)
    })

    it('distinguishes violations by ruleId', () => {
      const baseline = [createViolation('rule-a', 'f.ts', 1, 'm')]
      const current = [createViolation('rule-b', 'f.ts', 1, 'm')]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(1)
      expect(result.improvements).toHaveLength(1)
      expect(result.unchanged).toBe(0)
    })

    it('handles duplicate violations in current with same key', () => {
      const baseline = [createViolation('r1', 'f.ts', 1, 'm')]
      const current = [createViolation('r1', 'f.ts', 1, 'm'), createViolation('r1', 'f.ts', 1, 'm')]

      const result = compareWithBaseline(current, baseline)

      // Set collapses duplicate keys, so both match the single baseline key
      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(2)
    })

    it('returns mixed regressions improvements and unchanged', () => {
      const baseline = [
        createViolation('r1', 'a.ts', 1, 'stays'),
        createViolation('r2', 'b.ts', 2, 'removed'),
        createViolation('r3', 'c.ts', 3, 'removed2'),
      ]
      const current = [
        createViolation('r1', 'a.ts', 1, 'stays'),
        createViolation('r4', 'd.ts', 4, 'new'),
        createViolation('r5', 'e.ts', 5, 'new2'),
      ]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(2)
      expect(result.improvements).toHaveLength(2)
      expect(result.unchanged).toBe(1)
    })

    it('handles single matched violation', () => {
      const v = createViolation('r1', 'f.ts', 1, 'm')
      const baselineV: BaselineViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
        severity: 'error',
        message: 'm',
      }

      const result = compareWithBaseline([v], [baselineV])

      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(1)
    })

    it('handles large violation sets with partial overlap', () => {
      const baseline: BaselineViolation[] = []
      const current: RuleViolation[] = []

      for (let i = 1; i <= 50; i++) {
        baseline.push({
          ruleId: `rule-${i}`,
          filePath: `file-${i}.ts`,
          range: { start: { line: i, column: 1 }, end: { line: i, column: 5 } },
          severity: 'error',
          message: `msg-${i}`,
        })
      }
      for (let i = 26; i <= 75; i++) {
        current.push(createViolation(`rule-${i}`, `file-${i}.ts`, i, `msg-${i}`))
      }

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(25)
      expect(result.improvements).toHaveLength(25)
      expect(result.unchanged).toBe(25)
    })

    it('unchanged is zero when all current are new', () => {
      const current = [
        createViolation('r1', 'f1.ts', 1, 'm'),
        createViolation('r2', 'f2.ts', 2, 'm'),
      ]
      const baseline = [createViolation('r0', 'f0.ts', 0, 'old')]

      const result = compareWithBaseline(current, baseline)

      expect(result.unchanged).toBe(0)
      expect(result.regressions).toHaveLength(2)
    })

    it('regression preserves violation message', () => {
      const baseline: BaselineViolation[] = []
      const current = [createViolation('r1', 'f.ts', 1, 'specific regression message')]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions[0].message).toBe('specific regression message')
    })

    it('regression preserves violation range', () => {
      const baseline: BaselineViolation[] = []
      const current: RuleViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        range: { start: { line: 100, column: 5 }, end: { line: 200, column: 10 } },
        severity: 'error',
        message: 'm',
      }

      const result = compareWithBaseline([current], baseline)

      expect(result.regressions[0].range.start.line).toBe(100)
      expect(result.regressions[0].range.start.column).toBe(5)
      expect(result.regressions[0].range.end.line).toBe(200)
      expect(result.regressions[0].range.end.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    it('saveBaseline with empty violations array', async () => {
      await saveBaseline([])

      const parsed = parseWrittenBaseline()

      expect(parsed.violations).toHaveLength(0)
      expect(parsed.summary.total).toBe(0)
      expect(parsed.summary.errors).toBe(0)
      expect(parsed.summary.warnings).toBe(0)
      expect(parsed.summary.info).toBe(0)
    })

    it('compareWithBaseline with both empty arrays', () => {
      const result = compareWithBaseline([], [])

      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(0)
    })

    it('loadBaseline with malformed JSON', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{not valid}')

      const result = await loadBaseline('malformed.json')

      expect(result).toBeNull()
    })

    it('saveBaseline with mixed severity violations', async () => {
      const violations = [
        createViolation('r1', 'f.ts', 1, 'm', 'error'),
        createViolation('r2', 'f.ts', 2, 'm', 'warning'),
        createViolation('r3', 'f.ts', 3, 'm', 'info'),
        createViolation('r4', 'f.ts', 4, 'm', 'error'),
        createViolation('r5', 'f.ts', 5, 'm', 'warning'),
      ]

      await saveBaseline(violations)

      const parsed = parseWrittenBaseline()
      expect(parsed.summary.errors).toBe(2)
      expect(parsed.summary.warnings).toBe(2)
      expect(parsed.summary.info).toBe(1)
      expect(parsed.summary.total).toBe(5)
    })

    it('compareWithBaseline ignores suggestion field in comparison', () => {
      const violation: RuleViolation = {
        ruleId: 'rule1',
        filePath: 'file.ts',
        range: { start: { line: 10, column: 1 }, end: { line: 10, column: 5 } },
        severity: 'error',
        message: 'Error message',
        suggestion: 'Fix it like this',
      }
      const baselineViolation: BaselineViolation = {
        ruleId: 'rule1',
        filePath: 'file.ts',
        range: { start: { line: 10, column: 1 }, end: { line: 10, column: 5 } },
        severity: 'error',
        message: 'Error message',
      }

      const result = compareWithBaseline([violation], [baselineViolation])

      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(1)
    })
  })

  describe('round-trip and integration', () => {
    it('save then load preserves all violation data', async () => {
      const violations = [
        createViolation('r1', 'a.ts', 1, 'error msg', 'error'),
        createViolation('r2', 'b.ts', 2, 'warn msg', 'warning'),
        createViolation('r3', 'c.ts', 3, 'info msg', 'info'),
      ]

      await saveBaseline(violations, 'roundtrip.json')
      const written = getWrittenContent()
      vi.mocked(fs.readFile).mockResolvedValue(written)

      const loaded = await loadBaseline('roundtrip.json')

      expect(loaded).not.toBeNull()
      expect(loaded!.violations).toHaveLength(3)
      expect(loaded!.violations[0].ruleId).toBe('r1')
      expect(loaded!.violations[1].severity).toBe('warning')
      expect(loaded!.violations[2].message).toBe('info msg')
      expect(loaded!.summary.total).toBe(3)
      expect(loaded!.summary.errors).toBe(1)
      expect(loaded!.summary.warnings).toBe(1)
      expect(loaded!.summary.info).toBe(1)
    })

    it('detects new regressions after saving baseline', async () => {
      const originalViolations = [createViolation('r1', 'a.ts', 1, 'old')]

      await saveBaseline(originalViolations, 'baseline.json')
      const written = getWrittenContent()
      vi.mocked(fs.readFile).mockResolvedValue(written)
      const loaded = await loadBaseline('baseline.json')

      const newViolations = [
        createViolation('r1', 'a.ts', 1, 'old'),
        createViolation('r2', 'b.ts', 2, 'new regression'),
      ]

      const result = compareWithBaseline(newViolations, loaded!.violations)

      expect(result.regressions).toHaveLength(1)
      expect(result.regressions[0].ruleId).toBe('r2')
      expect(result.unchanged).toBe(1)
    })

    it('detects improvements after fixing violations', async () => {
      const originalViolations = [
        createViolation('r1', 'a.ts', 1, 'fixed'),
        createViolation('r2', 'b.ts', 2, 'still here'),
      ]

      await saveBaseline(originalViolations, 'baseline.json')
      const written = getWrittenContent()
      vi.mocked(fs.readFile).mockResolvedValue(written)
      const loaded = await loadBaseline('baseline.json')

      const fixedViolations = [createViolation('r2', 'b.ts', 2, 'still here')]

      const result = compareWithBaseline(fixedViolations, loaded!.violations)

      expect(result.improvements).toHaveLength(1)
      expect(result.improvements[0].ruleId).toBe('r1')
      expect(result.regressions).toHaveLength(0)
      expect(result.unchanged).toBe(1)
    })

    it('compares all severity types against subset baseline', () => {
      const baseline: BaselineViolation[] = [
        {
          ruleId: 'r1',
          filePath: 'f.ts',
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          severity: 'error',
          message: 'm',
        },
      ]
      const current = [
        createViolation('r1', 'f.ts', 1, 'm', 'error'),
        createViolation('r2', 'f.ts', 2, 'w', 'warning'),
        createViolation('r3', 'f.ts', 3, 'i', 'info'),
      ]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(2)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(1)
    })

    it('handles save with only warning severity violations', async () => {
      const violations = [
        createViolation('r1', 'f.ts', 1, 'm', 'warning'),
        createViolation('r2', 'f.ts', 2, 'm', 'warning'),
      ]

      await saveBaseline(violations)

      const parsed = parseWrittenBaseline()
      expect(parsed.summary.errors).toBe(0)
      expect(parsed.summary.warnings).toBe(2)
      expect(parsed.summary.info).toBe(0)
    })

    it('handles violation with line number 0', async () => {
      const violation = createViolation('r1', 'f.ts', 0, 'zero line')

      await saveBaseline([violation])

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].range.start.line).toBe(0)
    })

    it('handles violation with very large line number', async () => {
      const violation = createViolation('r1', 'f.ts', 999999, 'large line')

      await saveBaseline([violation])

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].range.start.line).toBe(999999)
    })

    it('handles empty message in violation', async () => {
      const violation = createViolation('r1', 'f.ts', 1, '')

      await saveBaseline([violation])

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].message).toBe('')
    })

    it('compareWithBaseline with violations at same line in different files', () => {
      const baseline = [
        createViolation('r1', 'a.ts', 10, 'm'),
        createViolation('r1', 'b.ts', 10, 'm'),
      ]
      const current = [createViolation('r1', 'a.ts', 10, 'm')]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(1)
      expect(result.improvements[0].filePath).toBe('b.ts')
      expect(result.unchanged).toBe(1)
    })
  })

  describe('saveBaseline — additional coverage', () => {
    it('saves single error violation with correct summary', async () => {
      await saveBaseline([createViolation('r1', 'f.ts', 1, 'm', 'error')])

      const parsed = parseWrittenBaseline()
      expect(parsed.summary.errors).toBe(1)
      expect(parsed.summary.warnings).toBe(0)
      expect(parsed.summary.info).toBe(0)
      expect(parsed.summary.total).toBe(1)
    })

    it('saves single warning violation with correct summary', async () => {
      await saveBaseline([createViolation('r1', 'f.ts', 1, 'm', 'warning')])

      const parsed = parseWrittenBaseline()
      expect(parsed.summary.errors).toBe(0)
      expect(parsed.summary.warnings).toBe(1)
      expect(parsed.summary.info).toBe(0)
      expect(parsed.summary.total).toBe(1)
    })

    it('saves single info violation with correct summary', async () => {
      await saveBaseline([createViolation('r1', 'f.ts', 1, 'm', 'info')])

      const parsed = parseWrittenBaseline()
      expect(parsed.summary.errors).toBe(0)
      expect(parsed.summary.warnings).toBe(0)
      expect(parsed.summary.info).toBe(1)
      expect(parsed.summary.total).toBe(1)
    })

    it('writes file with utf-8 encoding', async () => {
      await saveBaseline([createViolation('r', 'f.ts', 1, 'm')])

      expect(fs.writeFile).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'utf8')
    })

    it('strips suggestion field from RuleViolation when converting to baseline', async () => {
      const violation: RuleViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
        severity: 'error',
        message: 'm',
        suggestion: 'fix it',
      }

      await saveBaseline([violation])

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0]).not.toHaveProperty('suggestion')
      expect(parsed.violations[0]).toHaveProperty('ruleId')
      expect(parsed.violations[0]).toHaveProperty('filePath')
      expect(parsed.violations[0]).toHaveProperty('range')
      expect(parsed.violations[0]).toHaveProperty('severity')
      expect(parsed.violations[0]).toHaveProperty('message')
    })

    it('handles unicode characters in violation messages', async () => {
      const violations = [createViolation('r1', 'f.ts', 1, 'エラーが発生しました 🚨')]

      await saveBaseline(violations)

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].message).toBe('エラーが発生しました 🚨')
    })

    it('handles file paths with directory separators', async () => {
      const violations = [createViolation('r1', 'src/lib/module/file.ts', 1, 'm')]

      await saveBaseline(violations, 'nested/output.json')

      expect(path.resolve).toHaveBeenCalledWith('nested/output.json')
      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].filePath).toBe('src/lib/module/file.ts')
    })

    it('preserves range start column in saved violations', async () => {
      const violation: RuleViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        message: 'm',
        severity: 'error',
        range: { start: { line: 5, column: 42 }, end: { line: 5, column: 50 } },
      }

      await saveBaseline([violation])

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].range.start.column).toBe(42)
    })

    it('produces valid JSON for violations with backslashes in message', async () => {
      const violations = [createViolation('r1', 'f.ts', 1, 'Path: C:\\Users\\test\\file.ts')]

      await saveBaseline(violations)

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].message).toBe('Path: C:\\Users\\test\\file.ts')
    })

    it('writes exactly one file for a single call', async () => {
      await saveBaseline([createViolation('r1', 'f.ts', 1, 'm')])

      expect(fs.writeFile).toHaveBeenCalledTimes(1)
    })

    it('uses path.resolve for output path', async () => {
      await saveBaseline([], 'some/path/baseline.json')

      expect(path.resolve).toHaveBeenCalledWith('some/path/baseline.json')
    })

    it('handles violation with very long ruleId', async () => {
      const longRuleId = 'a'.repeat(500)
      await saveBaseline([createViolation(longRuleId, 'f.ts', 1, 'm')])

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].ruleId).toBe(longRuleId)
      expect(parsed.violations[0].ruleId).toHaveLength(500)
    })

    it('handles violation with very long file path', async () => {
      const longPath = 'src/'.repeat(100) + 'file.ts'
      await saveBaseline([createViolation('r1', longPath, 1, 'm')])

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].filePath).toBe(longPath)
    })

    it('handles violation with very long message', async () => {
      const longMessage = 'Error: '.repeat(500)
      await saveBaseline([createViolation('r1', 'f.ts', 1, longMessage)])

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].message).toBe(longMessage)
    })

    it('handles many violations with all same ruleId', async () => {
      const violations = Array.from({ length: 100 }, (_, i) =>
        createViolation('same-rule', 'f.ts', i + 1, `msg ${i}`, 'error'),
      )

      await saveBaseline(violations)

      const parsed = parseWrittenBaseline()
      expect(parsed.violations).toHaveLength(100)
      expect(parsed.summary.total).toBe(100)
      expect(parsed.summary.errors).toBe(100)
    })

    it('handles violation with negative line number', async () => {
      const violation = createViolation('r1', 'f.ts', -1, 'negative')

      await saveBaseline([violation])

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].range.start.line).toBe(-1)
    })

    it('handles violation with column 0', async () => {
      const violation: RuleViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        message: 'm',
        severity: 'error',
        range: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
      }

      await saveBaseline([violation])

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].range.start.column).toBe(0)
      expect(parsed.violations[0].range.end.column).toBe(0)
    })

    it('handles multi-line range where end line differs from start', async () => {
      const violation: RuleViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        message: 'm',
        severity: 'warning',
        range: { start: { line: 5, column: 1 }, end: { line: 15, column: 20 } },
      }

      await saveBaseline([violation])

      const parsed = parseWrittenBaseline()
      expect(parsed.violations[0].range.start.line).toBe(5)
      expect(parsed.violations[0].range.end.line).toBe(15)
    })
  })

  describe('loadBaseline — additional coverage', () => {
    it('returns null for EACCES permission error', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(
        Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' }),
      )

      const result = await loadBaseline('no-access.json')

      expect(result).toBeNull()
    })

    it('loads baseline containing many violations', async () => {
      const violations = Array.from({ length: 200 }, (_, i) => ({
        ruleId: `rule-${i}`,
        filePath: `file-${i}.ts`,
        range: { start: { line: i + 1, column: 1 }, end: { line: i + 1, column: 5 } },
        severity: 'error' as const,
        message: `msg-${i}`,
      }))
      const baseline: BaselineFile = {
        timestamp: '2025-01-01T00:00:00.000Z',
        violations,
        summary: { errors: 200, warnings: 0, info: 0, total: 200 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))

      const result = await loadBaseline('large.json')

      expect(result).not.toBeNull()
      expect(result!.violations).toHaveLength(200)
      expect(result!.summary.total).toBe(200)
    })

    it('returns parsed value for content that is a JSON number', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('42')

      const result = await loadBaseline('number.json')

      expect(result).toBe(42)
    })

    it('returns parsed value for content that is a JSON string', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('"hello"')

      const result = await loadBaseline('string.json')

      expect(result).toBe('hello')
    })

    it('returns parsed value for content that is a JSON boolean', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('true')

      const result = await loadBaseline('bool.json')

      expect(result).toBe(true)
    })

    it('returns parsed value for content that is a JSON null', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('null')

      const result = await loadBaseline('null.json')

      expect(result).toBeNull()
    })

    it('returns parsed value for content that is a JSON array', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('[]')

      const result = await loadBaseline('array.json')

      expect(result).toEqual([])
    })

    it('preserves timestamp field from loaded baseline', async () => {
      const ts = '2025-03-14T15:30:00.000Z'
      const baseline: BaselineFile = {
        timestamp: ts,
        violations: [],
        summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))

      const result = await loadBaseline('ts-test.json')

      expect(result!.timestamp).toBe(ts)
    })

    it('loads baseline with all error severity violations', async () => {
      const baseline: BaselineFile = {
        timestamp: '2025-01-01T00:00:00.000Z',
        violations: [
          {
            ruleId: 'r1',
            filePath: 'f1.ts',
            range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
            severity: 'error',
            message: 'm1',
          },
          {
            ruleId: 'r2',
            filePath: 'f2.ts',
            range: { start: { line: 2, column: 1 }, end: { line: 2, column: 5 } },
            severity: 'error',
            message: 'm2',
          },
        ],
        summary: { errors: 2, warnings: 0, info: 0, total: 2 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))

      const result = await loadBaseline('errors-only.json')

      expect(result!.violations.every((v) => v.severity === 'error')).toBe(true)
    })

    it('loads baseline with unicode in violation messages', async () => {
      const baseline: BaselineFile = {
        timestamp: '2025-01-01T00:00:00.000Z',
        violations: [
          {
            ruleId: 'r1',
            filePath: '日本語.ts',
            range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
            severity: 'error',
            message: 'エラー 🚨',
          },
        ],
        summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))

      const result = await loadBaseline('unicode.json')

      expect(result!.violations[0].message).toBe('エラー 🚨')
      expect(result!.violations[0].filePath).toBe('日本語.ts')
    })

    it('loads baseline with violation at line 0', async () => {
      const baseline: BaselineFile = {
        timestamp: '2025-01-01T00:00:00.000Z',
        violations: [
          {
            ruleId: 'r1',
            filePath: 'f.ts',
            range: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            severity: 'info',
            message: 'zero line',
          },
        ],
        summary: { errors: 0, warnings: 0, info: 1, total: 1 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))

      const result = await loadBaseline('line0.json')

      expect(result!.violations[0].range.start.line).toBe(0)
      expect(result!.violations[0].range.start.column).toBe(0)
    })

    it('loads baseline with absolute file path', async () => {
      const baseline: BaselineFile = {
        timestamp: '2025-01-01T00:00:00.000Z',
        violations: [
          {
            ruleId: 'r1',
            filePath: '/absolute/path/to/file.ts',
            range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
            severity: 'error',
            message: 'm',
          },
        ],
        summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))

      const result = await loadBaseline('abs-path.json')

      expect(result!.violations[0].filePath).toBe('/absolute/path/to/file.ts')
    })
  })

  describe('compareWithBaseline — additional coverage', () => {
    it('handles duplicate baseline violations with same key', () => {
      const baseline = [
        createViolation('r1', 'f.ts', 1, 'first'),
        createViolation('r1', 'f.ts', 1, 'second'),
      ]
      const current = [createViolation('r1', 'f.ts', 1, 'm')]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(1)
    })

    it('distinguishes violations by column difference but same rule file line', () => {
      const baseline: BaselineViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
        severity: 'error',
        message: 'm',
      }
      const current: RuleViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        range: { start: { line: 1, column: 99 }, end: { line: 1, column: 100 } },
        severity: 'error',
        message: 'm',
      }

      const result = compareWithBaseline([current], [baseline])

      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(1)
    })

    it('improvement preserves all fields from baseline violation', () => {
      const baselineViolation: BaselineViolation = {
        ruleId: 'complex-rule',
        filePath: 'deep/nested/path.ts',
        range: { start: { line: 42, column: 3 }, end: { line: 55, column: 20 } },
        severity: 'info',
        message: 'Complex improvement msg',
      }

      const result = compareWithBaseline([], [baselineViolation])

      const imp = result.improvements[0]
      expect(imp.ruleId).toBe('complex-rule')
      expect(imp.filePath).toBe('deep/nested/path.ts')
      expect(imp.range.start.line).toBe(42)
      expect(imp.range.start.column).toBe(3)
      expect(imp.range.end.line).toBe(55)
      expect(imp.range.end.column).toBe(20)
      expect(imp.severity).toBe('info')
      expect(imp.message).toBe('Complex improvement msg')
    })

    it('handles regression with info severity', () => {
      const current = [createViolation('r1', 'f.ts', 1, 'info reg', 'info')]

      const result = compareWithBaseline(current, [])

      expect(result.regressions).toHaveLength(1)
      expect(result.regressions[0].severity).toBe('info')
    })

    it('handles regression with warning severity', () => {
      const current = [createViolation('r1', 'f.ts', 1, 'warn reg', 'warning')]

      const result = compareWithBaseline(current, [])

      expect(result.regressions).toHaveLength(1)
      expect(result.regressions[0].severity).toBe('warning')
    })

    it('handles improvement with error severity', () => {
      const baseline: BaselineViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
        severity: 'error',
        message: 'fixed error',
      }

      const result = compareWithBaseline([], [baseline])

      expect(result.improvements).toHaveLength(1)
      expect(result.improvements[0].severity).toBe('error')
    })

    it('handles improvement with info severity', () => {
      const baseline: BaselineViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
        severity: 'info',
        message: 'fixed info',
      }

      const result = compareWithBaseline([], [baseline])

      expect(result.improvements).toHaveLength(1)
      expect(result.improvements[0].severity).toBe('info')
    })

    it('returns multiple regressions with correct details', () => {
      const current = [
        createViolation('r1', 'a.ts', 1, 'first regression', 'error'),
        createViolation('r2', 'b.ts', 2, 'second regression', 'warning'),
      ]

      const result = compareWithBaseline(current, [])

      expect(result.regressions).toHaveLength(2)
      expect(result.regressions[0].filePath).toBe('a.ts')
      expect(result.regressions[1].filePath).toBe('b.ts')
    })

    it('returns multiple improvements with correct details', () => {
      const baseline: BaselineViolation[] = [
        {
          ruleId: 'r1',
          filePath: 'a.ts',
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          severity: 'error',
          message: 'first improvement',
        },
        {
          ruleId: 'r2',
          filePath: 'b.ts',
          range: { start: { line: 2, column: 1 }, end: { line: 2, column: 5 } },
          severity: 'warning',
          message: 'second improvement',
        },
      ]

      const result = compareWithBaseline([], baseline)

      expect(result.improvements).toHaveLength(2)
      expect(result.improvements[0].filePath).toBe('a.ts')
      expect(result.improvements[1].filePath).toBe('b.ts')
    })

    it('handles violations with empty filePath as distinct', () => {
      const baseline = [createViolation('r1', '', 1, 'm')]
      const current = [createViolation('r1', '', 1, 'm')]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(1)
    })

    it('handles violations with empty ruleId as distinct', () => {
      const baseline = [createViolation('', 'f.ts', 1, 'm')]
      const current = [createViolation('', 'f.ts', 1, 'm')]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(1)
    })

    it('distinguishes empty filePath from non-empty filePath', () => {
      const baseline = [createViolation('r1', '', 1, 'm')]
      const current = [createViolation('r1', 'f.ts', 1, 'm')]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(1)
      expect(result.improvements).toHaveLength(1)
      expect(result.unchanged).toBe(0)
    })

    it('distinguishes empty ruleId from non-empty ruleId', () => {
      const baseline = [createViolation('', 'f.ts', 1, 'm')]
      const current = [createViolation('r1', 'f.ts', 1, 'm')]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(1)
      expect(result.improvements).toHaveLength(1)
      expect(result.unchanged).toBe(0)
    })

    it('handles one violation moved to a different line', () => {
      const baseline = [
        createViolation('r1', 'a.ts', 5, 'moved'),
        createViolation('r2', 'b.ts', 10, 'stays'),
      ]
      const current = [
        createViolation('r1', 'a.ts', 15, 'moved'),
        createViolation('r2', 'b.ts', 10, 'stays'),
      ]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(1)
      expect(result.improvements).toHaveLength(1)
      expect(result.unchanged).toBe(1)
    })

    it('handles all regressions when baseline is completely replaced', () => {
      const baseline = [
        createViolation('old-1', 'a.ts', 1, 'm'),
        createViolation('old-2', 'b.ts', 2, 'm'),
      ]
      const current = [
        createViolation('new-1', 'c.ts', 3, 'm'),
        createViolation('new-2', 'd.ts', 4, 'm'),
      ]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(2)
      expect(result.improvements).toHaveLength(2)
      expect(result.unchanged).toBe(0)
    })

    it('unchanged equals current length when no regressions', () => {
      const baseline = [
        createViolation('r1', 'f.ts', 1, 'm'),
        createViolation('r2', 'f.ts', 2, 'm'),
      ]
      const current = [createViolation('r1', 'f.ts', 1, 'm'), createViolation('r2', 'f.ts', 2, 'm')]

      const result = compareWithBaseline(current, baseline)

      expect(result.unchanged).toBe(current.length)
    })

    it('regression preserves severity from current violation', () => {
      const current = [createViolation('r1', 'f.ts', 1, 'm', 'warning')]

      const result = compareWithBaseline(current, [])

      expect(result.regressions[0].severity).toBe('warning')
    })

    it('handles very large violation sets with no overlap', () => {
      const baseline: BaselineViolation[] = Array.from({ length: 50 }, (_, i) => ({
        ruleId: `old-${i}`,
        filePath: `old-${i}.ts`,
        range: { start: { line: i + 1, column: 1 }, end: { line: i + 1, column: 5 } },
        severity: 'error' as const,
        message: `old-${i}`,
      }))
      const current: RuleViolation[] = Array.from({ length: 50 }, (_, i) =>
        createViolation(`new-${i}`, `new-${i}.ts`, i + 1, `new-${i}`),
      )

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(50)
      expect(result.improvements).toHaveLength(50)
      expect(result.unchanged).toBe(0)
    })
  })

  describe('violation key format', () => {
    it('uses colon as separator in violation key', () => {
      const baseline = [createViolation('r1', 'f.ts', 42, 'm')]
      const current = [createViolation('r1', 'f.ts', 42, 'm')]

      const result = compareWithBaseline(current, baseline)

      expect(result.unchanged).toBe(1)
    })

    it('distinguishes violations with same rule and line but different file containing colon', () => {
      const baseline = [createViolation('r1', 'normal.ts', 1, 'm')]
      const current = [createViolation('r1', 'other.ts', 1, 'm')]

      const result = compareWithBaseline(current, baseline)

      expect(result.regressions).toHaveLength(1)
      expect(result.improvements).toHaveLength(1)
    })

    it('handles ruleId containing colon character', () => {
      const baseline = [createViolation('rule:with:colons', 'f.ts', 1, 'm')]
      const current = [createViolation('rule:with:colons', 'f.ts', 1, 'm')]

      const result = compareWithBaseline(current, baseline)

      expect(result.unchanged).toBe(1)
    })
  })

  describe('round-trip — additional scenarios', () => {
    it('save and compare detects exact match as unchanged', async () => {
      const violations = [
        createViolation('r1', 'a.ts', 1, 'm1', 'error'),
        createViolation('r2', 'b.ts', 2, 'm2', 'warning'),
      ]

      await saveBaseline(violations, 'match.json')
      const written = getWrittenContent()
      vi.mocked(fs.readFile).mockResolvedValue(written)
      const loaded = await loadBaseline('match.json')

      const result = compareWithBaseline(violations, loaded!.violations)

      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(2)
    })

    it('save and compare detects partial match', async () => {
      const original = [
        createViolation('r1', 'a.ts', 1, 'keep'),
        createViolation('r2', 'b.ts', 2, 'remove'),
      ]

      await saveBaseline(original, 'partial.json')
      const written = getWrittenContent()
      vi.mocked(fs.readFile).mockResolvedValue(written)
      const loaded = await loadBaseline('partial.json')

      const updated = [
        createViolation('r1', 'a.ts', 1, 'keep'),
        createViolation('r3', 'c.ts', 3, 'new'),
      ]

      const result = compareWithBaseline(updated, loaded!.violations)

      expect(result.regressions).toHaveLength(1)
      expect(result.improvements).toHaveLength(1)
      expect(result.unchanged).toBe(1)
    })

    it('save and load preserves all severity counts', async () => {
      const violations = [
        createViolation('r1', 'f.ts', 1, 'm', 'error'),
        createViolation('r2', 'f.ts', 2, 'm', 'error'),
        createViolation('r3', 'f.ts', 3, 'm', 'warning'),
        createViolation('r4', 'f.ts', 4, 'm', 'warning'),
        createViolation('r5', 'f.ts', 5, 'm', 'warning'),
        createViolation('r6', 'f.ts', 6, 'm', 'info'),
      ]

      await saveBaseline(violations, 'sev.json')
      const written = getWrittenContent()
      vi.mocked(fs.readFile).mockResolvedValue(written)
      const loaded = await loadBaseline('sev.json')

      expect(loaded!.summary.errors).toBe(2)
      expect(loaded!.summary.warnings).toBe(3)
      expect(loaded!.summary.info).toBe(1)
      expect(loaded!.summary.total).toBe(6)
    })

    it('save baseline with suggestion then compare ignores suggestion', async () => {
      const violation: RuleViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
        severity: 'error',
        message: 'm',
        suggestion: 'fix it',
      }

      await saveBaseline([violation], 'sug.json')
      const written = getWrittenContent()
      vi.mocked(fs.readFile).mockResolvedValue(written)
      const loaded = await loadBaseline('sug.json')

      const loadedViolation = loaded!.violations[0]
      expect(loadedViolation).not.toHaveProperty('suggestion')

      const result = compareWithBaseline([violation], loaded!.violations)
      expect(result.unchanged).toBe(1)
    })
  })

  describe('saveBaseline — extended coverage', () => {
    it('produces JSON that starts with opening brace', async () => {
      await saveBaseline([])
      const content = getWrittenContent()
      expect(content.trimStart()[0]).toBe('{')
    })

    it('produces JSON that ends with closing brace', async () => {
      await saveBaseline([])
      const content = getWrittenContent()
      expect(content.trimEnd().at(-1)).toBe('}')
    })

    it('does not call writeFile more than once per invocation', async () => {
      await saveBaseline([createViolation('r1', 'f.ts', 1, 'm')])
      expect(fs.writeFile).toHaveBeenCalledTimes(1)
    })

    it('correctly counts all errors in 10-violation set', async () => {
      const violations = Array.from({ length: 10 }, (_, i) =>
        createViolation(`r${i}`, `f${i}.ts`, i + 1, 'm', 'error'),
      )
      await saveBaseline(violations)
      expect(parseWrittenBaseline().summary.errors).toBe(10)
      expect(parseWrittenBaseline().summary.warnings).toBe(0)
      expect(parseWrittenBaseline().summary.info).toBe(0)
    })

    it('correctly counts all warnings in 10-violation set', async () => {
      const violations = Array.from({ length: 10 }, (_, i) =>
        createViolation(`r${i}`, `f${i}.ts`, i + 1, 'm', 'warning'),
      )
      await saveBaseline(violations)
      expect(parseWrittenBaseline().summary.warnings).toBe(10)
    })

    it('correctly counts all info in 10-violation set', async () => {
      const violations = Array.from({ length: 10 }, (_, i) =>
        createViolation(`r${i}`, `f${i}.ts`, i + 1, 'm', 'info'),
      )
      await saveBaseline(violations)
      expect(parseWrittenBaseline().summary.info).toBe(10)
    })

    it('handles violation with single-character ruleId', async () => {
      await saveBaseline([createViolation('x', 'f.ts', 1, 'm')])
      expect(parseWrittenBaseline().violations[0].ruleId).toBe('x')
    })

    it('handles violation with single-character filePath', async () => {
      await saveBaseline([createViolation('r1', 'x', 1, 'm')])
      expect(parseWrittenBaseline().violations[0].filePath).toBe('x')
    })

    it('handles violation with single-character message', async () => {
      await saveBaseline([createViolation('r1', 'f.ts', 1, 'x')])
      expect(parseWrittenBaseline().violations[0].message).toBe('x')
    })

    it('preserves range where start equals end (zero-width range)', async () => {
      const violation: RuleViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        message: 'm',
        severity: 'error',
        range: { start: { line: 5, column: 3 }, end: { line: 5, column: 3 } },
      }
      await saveBaseline([violation])
      const v = parseWrittenBaseline().violations[0]
      expect(v.range.start.line).toBe(5)
      expect(v.range.start.column).toBe(3)
      expect(v.range.end.line).toBe(5)
      expect(v.range.end.column).toBe(3)
    })

    it('preserves range where start line is greater than end line', async () => {
      const violation: RuleViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        message: 'm',
        severity: 'error',
        range: { start: { line: 20, column: 1 }, end: { line: 10, column: 5 } },
      }
      await saveBaseline([violation])
      const v = parseWrittenBaseline().violations[0]
      expect(v.range.start.line).toBe(20)
      expect(v.range.end.line).toBe(10)
    })

    it('handles two sequential saveBaseline calls independently', async () => {
      await saveBaseline([createViolation('r1', 'a.ts', 1, 'first')])
      const firstContent = getWrittenContent()

      vi.clearAllMocks()
      await saveBaseline([createViolation('r2', 'b.ts', 2, 'second')])
      const secondContent = getWrittenContent()

      const first = JSON.parse(firstContent) as BaselineFile
      const second = JSON.parse(secondContent) as BaselineFile
      expect(first.violations[0].ruleId).toBe('r1')
      expect(second.violations[0].ruleId).toBe('r2')
    })

    it('handles violations with same filePath and line but different ruleIds', async () => {
      const violations = [
        createViolation('rule-a', 'same.ts', 10, 'm1'),
        createViolation('rule-b', 'same.ts', 10, 'm2'),
        createViolation('rule-c', 'same.ts', 10, 'm3'),
      ]
      await saveBaseline(violations)
      const parsed = parseWrittenBaseline()
      expect(parsed.violations).toHaveLength(3)
      expect(parsed.summary.total).toBe(3)
    })

    it('handles file path with forward slashes', async () => {
      await saveBaseline([createViolation('r1', 'src/components/Button.tsx', 42, 'm')])
      expect(parseWrittenBaseline().violations[0].filePath).toBe('src/components/Button.tsx')
    })

    it('handles file path with dots in name', async () => {
      await saveBaseline([createViolation('r1', 'file.test.utils.ts', 1, 'm')])
      expect(parseWrittenBaseline().violations[0].filePath).toBe('file.test.utils.ts')
    })

    it('handles message with newlines', async () => {
      await saveBaseline([createViolation('r1', 'f.ts', 1, 'line1\nline2\nline3')])
      expect(parseWrittenBaseline().violations[0].message).toBe('line1\nline2\nline3')
    })

    it('handles message with tabs', async () => {
      await saveBaseline([createViolation('r1', 'f.ts', 1, 'col1\tcol2\tcol3')])
      expect(parseWrittenBaseline().violations[0].message).toBe('col1\tcol2\tcol3')
    })

    it('handles mixed severity counts totaling correctly', async () => {
      const violations = [
        ...Array.from({ length: 7 }, (_, i) => createViolation(`e${i}`, 'f.ts', i, 'm', 'error')),
        ...Array.from({ length: 3 }, (_, i) =>
          createViolation(`w${i}`, 'f.ts', i + 10, 'm', 'warning'),
        ),
      ]
      await saveBaseline(violations)
      const parsed = parseWrittenBaseline()
      expect(parsed.summary.errors).toBe(7)
      expect(parsed.summary.warnings).toBe(3)
      expect(parsed.summary.info).toBe(0)
      expect(parsed.summary.total).toBe(10)
    })

    it('returns the resolved path from path.resolve', async () => {
      const result = await saveBaseline([], 'output/report.json')
      expect(result).toBe('/resolved/output/report.json')
    })

    it('handles violation with column value exceeding line length', async () => {
      const violation: RuleViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        message: 'm',
        severity: 'error',
        range: { start: { line: 1, column: 999 }, end: { line: 1, column: 1000 } },
      }
      await saveBaseline([violation])
      expect(parseWrittenBaseline().violations[0].range.start.column).toBe(999)
    })

    it('handles multiple violations in the same file at consecutive lines', async () => {
      const violations = [1, 2, 3, 4, 5].map((line) =>
        createViolation('r1', 'same.ts', line, `msg at line ${line}`),
      )
      await saveBaseline(violations)
      const parsed = parseWrittenBaseline()
      expect(parsed.violations).toHaveLength(5)
      parsed.violations.forEach((v, i) => {
        expect(v.range.start.line).toBe(i + 1)
      })
    })
  })

  describe('loadBaseline — extended coverage', () => {
    it('returns null for EISDIR error', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(
        Object.assign(new Error('EISDIR: illegal operation'), { code: 'EISDIR' }),
      )
      expect(await loadBaseline('dir.json')).toBeNull()
    })

    it('returns null for ENOTDIR error', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(
        Object.assign(new Error('ENOTDIR: not a directory'), { code: 'ENOTDIR' }),
      )
      expect(await loadBaseline('notdir.json')).toBeNull()
    })

    it('returns null for EMFILE too many open files', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(
        Object.assign(new Error('EMFILE: too many open files'), { code: 'EMFILE' }),
      )
      expect(await loadBaseline('emfile.json')).toBeNull()
    })

    it('loads baseline with extra top-level properties', async () => {
      const content = JSON.stringify({
        timestamp: '2025-01-01T00:00:00.000Z',
        violations: [],
        summary: { errors: 0, warnings: 0, info: 0, total: 0 },
        extraProp: 'hello',
      })
      vi.mocked(fs.readFile).mockResolvedValue(content)
      const result = await loadBaseline('extra.json')
      expect(result).not.toBeNull()
      expect(result!.violations).toEqual([])
    })

    it('loads baseline with empty string timestamp', async () => {
      const baseline: BaselineFile = {
        timestamp: '',
        violations: [],
        summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))
      const result = await loadBaseline('empty-ts.json')
      expect(result).not.toBeNull()
      expect(result!.timestamp).toBe('')
    })

    it('loads baseline with single violation correctly', async () => {
      const baseline: BaselineFile = {
        timestamp: '2025-01-01T00:00:00.000Z',
        violations: [
          {
            ruleId: 'single-rule',
            filePath: 'single.ts',
            range: { start: { line: 99, column: 5 }, end: { line: 99, column: 10 } },
            severity: 'warning',
            message: 'single',
          },
        ],
        summary: { errors: 0, warnings: 1, info: 0, total: 1 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))
      const result = await loadBaseline('single.json')
      expect(result!.violations[0].ruleId).toBe('single-rule')
      expect(result!.violations[0].filePath).toBe('single.ts')
      expect(result!.violations[0].severity).toBe('warning')
    })

    it('returns null for file content with only BOM', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('\uFEFF')
      expect(await loadBaseline('bom.json')).toBeNull()
    })

    it('loads baseline with very long timestamp string', async () => {
      const longTs = '2025-01-01T00:00:00.000000000Z'
      const baseline: BaselineFile = {
        timestamp: longTs,
        violations: [],
        summary: { errors: 0, warnings: 0, info: 0, total: 0 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))
      const result = await loadBaseline('long-ts.json')
      expect(result!.timestamp).toBe(longTs)
    })

    it('loads baseline and returns a non-null object', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        '{"timestamp":"","violations":[],"summary":{"errors":0,"warnings":0,"info":0,"total":0}}',
      )
      const result = await loadBaseline('obj.json')
      expect(typeof result).toBe('object')
      expect(result).not.toBeNull()
    })

    it('loads baseline with violation having column equal to 1', async () => {
      const baseline: BaselineFile = {
        timestamp: '2025-01-01T00:00:00.000Z',
        violations: [
          {
            ruleId: 'r1',
            filePath: 'f.ts',
            range: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
            severity: 'error',
            message: 'm',
          },
        ],
        summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))
      const result = await loadBaseline('col1.json')
      expect(result!.violations[0].range.start.column).toBe(1)
      expect(result!.violations[0].range.end.column).toBe(1)
    })

    it('loads baseline with negative column values', async () => {
      const baseline: BaselineFile = {
        timestamp: '2025-01-01T00:00:00.000Z',
        violations: [
          {
            ruleId: 'r1',
            filePath: 'f.ts',
            range: { start: { line: 1, column: -1 }, end: { line: 1, column: -5 } },
            severity: 'error',
            message: 'm',
          },
        ],
        summary: { errors: 1, warnings: 0, info: 0, total: 1 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))
      const result = await loadBaseline('neg-col.json')
      expect(result!.violations[0].range.start.column).toBe(-1)
      expect(result!.violations[0].range.end.column).toBe(-5)
    })

    it('handles reading the same file twice sequentially', async () => {
      const content =
        '{"timestamp":"","violations":[],"summary":{"errors":0,"warnings":0,"info":0,"total":0}}'
      vi.mocked(fs.readFile).mockResolvedValue(content)

      const first = await loadBaseline('same.json')
      const second = await loadBaseline('same.json')

      expect(first).toEqual(second)
      expect(fs.readFile).toHaveBeenCalledTimes(2)
    })

    it('loads baseline with large summary counts', async () => {
      const baseline: BaselineFile = {
        timestamp: '2025-01-01T00:00:00.000Z',
        violations: [],
        summary: { errors: 10000, warnings: 5000, info: 2000, total: 17000 },
      }
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseline))
      const result = await loadBaseline('big-summary.json')
      expect(result!.summary.errors).toBe(10000)
      expect(result!.summary.warnings).toBe(5000)
      expect(result!.summary.info).toBe(2000)
      expect(result!.summary.total).toBe(17000)
    })

    it('returns null for truncated JSON content', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{"timestamp":"2025')
      expect(await loadBaseline('truncated.json')).toBeNull()
    })
  })

  describe('compareWithBaseline — extended coverage', () => {
    it('returns stable results for identical calls', () => {
      const baseline = [createViolation('r1', 'f.ts', 1, 'm')]
      const current = [createViolation('r2', 'g.ts', 2, 'n')]

      const result1 = compareWithBaseline(current, baseline)
      const result2 = compareWithBaseline(current, baseline)

      expect(result1.regressions.length).toBe(result2.regressions.length)
      expect(result1.improvements.length).toBe(result2.improvements.length)
      expect(result1.unchanged).toBe(result2.unchanged)
    })

    it('does not mutate the currentViolations array', () => {
      const current = [createViolation('r1', 'f.ts', 1, 'm')]
      const currentCopy = [...current]
      compareWithBaseline(current, [])
      expect(current).toEqual(currentCopy)
    })

    it('does not mutate the baselineViolations array', () => {
      const baseline: BaselineViolation[] = [
        {
          ruleId: 'r1',
          filePath: 'f.ts',
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          severity: 'error',
          message: 'm',
        },
      ]
      const baselineCopy = [...baseline]
      compareWithBaseline([], baseline)
      expect(baseline).toEqual(baselineCopy)
    })

    it('handles single regression correctly', () => {
      const current = [createViolation('new-rule', 'new.ts', 99, 'new issue')]
      const result = compareWithBaseline(current, [])
      expect(result.regressions).toHaveLength(1)
      expect(result.regressions[0].ruleId).toBe('new-rule')
      expect(result.regressions[0].filePath).toBe('new.ts')
      expect(result.regressions[0].range.start.line).toBe(99)
      expect(result.regressions[0].message).toBe('new issue')
    })

    it('handles single improvement correctly', () => {
      const baseline: BaselineViolation[] = [
        {
          ruleId: 'old-rule',
          filePath: 'old.ts',
          range: { start: { line: 50, column: 1 }, end: { line: 50, column: 5 } },
          severity: 'warning',
          message: 'old issue',
        },
      ]
      const result = compareWithBaseline([], baseline)
      expect(result.improvements).toHaveLength(1)
      expect(result.improvements[0].ruleId).toBe('old-rule')
      expect(result.improvements[0].filePath).toBe('old.ts')
      expect(result.improvements[0].range.start.line).toBe(50)
      expect(result.improvements[0].message).toBe('old issue')
    })

    it('handles violation moved between files as regression plus improvement', () => {
      const baseline = [createViolation('r1', 'original.ts', 10, 'moved')]
      const current = [createViolation('r1', 'moved-to.ts', 10, 'moved')]

      const result = compareWithBaseline(current, baseline)
      expect(result.regressions).toHaveLength(1)
      expect(result.improvements).toHaveLength(1)
      expect(result.unchanged).toBe(0)
    })

    it('handles same file and line but ruleId case difference', () => {
      const baseline = [createViolation('MyRule', 'f.ts', 1, 'm')]
      const current = [createViolation('myrule', 'f.ts', 1, 'm')]

      const result = compareWithBaseline(current, baseline)
      expect(result.regressions).toHaveLength(1)
      expect(result.improvements).toHaveLength(1)
    })

    it('handles baseline with more violations than current', () => {
      const baseline = [
        createViolation('r1', 'a.ts', 1, 'm'),
        createViolation('r2', 'b.ts', 2, 'm'),
        createViolation('r3', 'c.ts', 3, 'm'),
      ]
      const current = [createViolation('r2', 'b.ts', 2, 'm')]

      const result = compareWithBaseline(current, baseline)
      expect(result.improvements).toHaveLength(2)
      expect(result.regressions).toHaveLength(0)
      expect(result.unchanged).toBe(1)
    })

    it('handles current with more violations than baseline', () => {
      const baseline = [createViolation('r2', 'b.ts', 2, 'm')]
      const current = [
        createViolation('r1', 'a.ts', 1, 'm'),
        createViolation('r2', 'b.ts', 2, 'm'),
        createViolation('r3', 'c.ts', 3, 'm'),
      ]

      const result = compareWithBaseline(current, baseline)
      expect(result.regressions).toHaveLength(2)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(1)
    })

    it('returns correct unchanged when one of three matches', () => {
      const baseline = [
        createViolation('keep', 'a.ts', 1, 'm'),
        createViolation('remove', 'b.ts', 2, 'm'),
        createViolation('remove2', 'c.ts', 3, 'm'),
      ]
      const current = [
        createViolation('keep', 'a.ts', 1, 'm'),
        createViolation('add', 'd.ts', 4, 'm'),
      ]

      const result = compareWithBaseline(current, baseline)
      expect(result.unchanged).toBe(1)
    })

    it('handles violations with very large line numbers', () => {
      const baseline: BaselineViolation[] = [
        {
          ruleId: 'r1',
          filePath: 'f.ts',
          range: { start: { line: 999999, column: 1 }, end: { line: 999999, column: 5 } },
          severity: 'error',
          message: 'm',
        },
      ]
      const current = [createViolation('r1', 'f.ts', 999999, 'm')]

      const result = compareWithBaseline(current, baseline)
      expect(result.unchanged).toBe(1)
    })

    it('handles violations with negative line numbers in comparison', () => {
      const baseline = [createViolation('r1', 'f.ts', -5, 'm')]
      const current = [createViolation('r1', 'f.ts', -5, 'm')]

      const result = compareWithBaseline(current, baseline)
      expect(result.unchanged).toBe(1)
    })

    it('returns regressions as RuleViolation objects', () => {
      const current = [createViolation('r1', 'f.ts', 1, 'm')]
      const result = compareWithBaseline(current, [])

      const reg = result.regressions[0]
      expect(typeof reg.ruleId).toBe('string')
      expect(typeof reg.filePath).toBe('string')
      expect(typeof reg.message).toBe('string')
      expect(typeof reg.range.start.line).toBe('number')
      expect(typeof reg.range.start.column).toBe('number')
    })

    it('returns improvements as objects with correct types', () => {
      const baseline: BaselineViolation[] = [
        {
          ruleId: 'r1',
          filePath: 'f.ts',
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          severity: 'error',
          message: 'm',
        },
      ]
      const result = compareWithBaseline([], baseline)

      const imp = result.improvements[0]
      expect(typeof imp.ruleId).toBe('string')
      expect(typeof imp.filePath).toBe('string')
      expect(typeof imp.message).toBe('string')
      expect(typeof imp.range.start.line).toBe('number')
    })

    it('handles 3 regressions with 0 improvements and 0 unchanged', () => {
      const current = [
        createViolation('r1', 'a.ts', 1, 'm'),
        createViolation('r2', 'b.ts', 2, 'm'),
        createViolation('r3', 'c.ts', 3, 'm'),
      ]
      const result = compareWithBaseline(current, [])
      expect(result.regressions).toHaveLength(3)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(0)
    })

    it('handles 0 regressions with 3 improvements and 0 unchanged', () => {
      const baseline: BaselineViolation[] = [
        {
          ruleId: 'r1',
          filePath: 'a.ts',
          range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
          severity: 'error',
          message: 'm1',
        },
        {
          ruleId: 'r2',
          filePath: 'b.ts',
          range: { start: { line: 2, column: 1 }, end: { line: 2, column: 5 } },
          severity: 'error',
          message: 'm2',
        },
        {
          ruleId: 'r3',
          filePath: 'c.ts',
          range: { start: { line: 3, column: 1 }, end: { line: 3, column: 5 } },
          severity: 'error',
          message: 'm3',
        },
      ]
      const result = compareWithBaseline([], baseline)
      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(3)
      expect(result.unchanged).toBe(0)
    })

    it('handles swapping two violations between baseline and current', () => {
      const baseline = [
        createViolation('r1', 'a.ts', 1, 'm'),
        createViolation('r2', 'b.ts', 2, 'm'),
      ]
      const current = [createViolation('r2', 'b.ts', 2, 'm'), createViolation('r1', 'a.ts', 1, 'm')]

      const result = compareWithBaseline(current, baseline)
      expect(result.regressions).toHaveLength(0)
      expect(result.improvements).toHaveLength(0)
      expect(result.unchanged).toBe(2)
    })

    it('handles same ruleId and file but multiple different lines', () => {
      const baseline = [
        createViolation('r1', 'f.ts', 1, 'm'),
        createViolation('r1', 'f.ts', 2, 'm'),
      ]
      const current = [createViolation('r1', 'f.ts', 1, 'm'), createViolation('r1', 'f.ts', 3, 'm')]

      const result = compareWithBaseline(current, baseline)
      expect(result.regressions).toHaveLength(1)
      expect(result.improvements).toHaveLength(1)
      expect(result.unchanged).toBe(1)
    })

    it('handles file path with extension difference', () => {
      const baseline = [createViolation('r1', 'file.ts', 1, 'm')]
      const current = [createViolation('r1', 'file.tsx', 1, 'm')]

      const result = compareWithBaseline(current, baseline)
      expect(result.regressions).toHaveLength(1)
      expect(result.improvements).toHaveLength(1)
      expect(result.unchanged).toBe(0)
    })

    it('handles violations with numeric-like ruleIds', () => {
      const baseline = [createViolation('123', 'f.ts', 456, 'm')]
      const current = [createViolation('123', 'f.ts', 456, 'm')]

      const result = compareWithBaseline(current, baseline)
      expect(result.unchanged).toBe(1)
    })

    it('handles violations where ruleId contains file path separators', () => {
      const baseline = [createViolation('src/rules/my-rule', 'f.ts', 1, 'm')]
      const current = [createViolation('src/rules/my-rule', 'f.ts', 1, 'm')]

      const result = compareWithBaseline(current, baseline)
      expect(result.unchanged).toBe(1)
    })

    it('handles duplicate keys in current producing fewer regressions than raw count', () => {
      const baseline: BaselineViolation[] = []
      const current = [
        createViolation('dup', 'f.ts', 1, 'm'),
        createViolation('dup', 'f.ts', 1, 'm'),
        createViolation('dup', 'f.ts', 1, 'm'),
      ]

      const result = compareWithBaseline(current, baseline)
      expect(result.regressions).toHaveLength(3)
      expect(result.unchanged).toBe(0)
    })

    it('handles improvement message preservation with special characters', () => {
      const baseline: BaselineViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
        severity: 'error',
        message: 'fix <div> & "quotes" in \'template\'',
      }

      const result = compareWithBaseline([], [baseline])
      expect(result.improvements[0].message).toBe('fix <div> & "quotes" in \'template\'')
    })

    it('handles regression message preservation with special characters', () => {
      const current = [createViolation('r1', 'f.ts', 1, 'new: <br/> & "error"')]

      const result = compareWithBaseline(current, [])
      expect(result.regressions[0].message).toBe('new: <br/> & "error"')
    })
  })

  describe('violation key format — extended', () => {
    it('distinguishes violations differing only by line number 1 vs 2', () => {
      const baseline = [createViolation('r1', 'f.ts', 1, 'm')]
      const current = [createViolation('r1', 'f.ts', 2, 'm')]

      const result = compareWithBaseline(current, baseline)
      expect(result.regressions).toHaveLength(1)
      expect(result.improvements).toHaveLength(1)
    })

    it('matches violations with file paths containing colons', () => {
      const baseline = [createViolation('r1', 'path:to:file', 1, 'm')]
      const current = [createViolation('r1', 'path:to:file', 1, 'm')]

      const result = compareWithBaseline(current, baseline)
      expect(result.unchanged).toBe(1)
    })

    it('distinguishes violations where ruleId is a substring of another', () => {
      const baseline = [createViolation('rule', 'f.ts', 1, 'm')]
      const current = [createViolation('rule-extra', 'f.ts', 1, 'm')]

      const result = compareWithBaseline(current, baseline)
      expect(result.regressions).toHaveLength(1)
      expect(result.improvements).toHaveLength(1)
    })

    it('handles filePath that is just a number string', () => {
      const baseline = [createViolation('r1', '12345', 1, 'm')]
      const current = [createViolation('r1', '12345', 1, 'm')]

      const result = compareWithBaseline(current, baseline)
      expect(result.unchanged).toBe(1)
    })

    it('handles line number as very large integer', () => {
      const baseline = [createViolation('r1', 'f.ts', Number.MAX_SAFE_INTEGER, 'm')]
      const current = [createViolation('r1', 'f.ts', Number.MAX_SAFE_INTEGER, 'm')]

      const result = compareWithBaseline(current, baseline)
      expect(result.unchanged).toBe(1)
    })
  })

  describe('round-trip — extended scenarios', () => {
    it('save and reload empty violations produces empty array', async () => {
      await saveBaseline([], 'empty.json')
      const written = getWrittenContent()
      vi.mocked(fs.readFile).mockResolvedValue(written)
      const loaded = await loadBaseline('empty.json')

      expect(loaded!.violations).toEqual([])
      expect(loaded!.summary.total).toBe(0)
    })

    it('save and reload preserves range exactly', async () => {
      const violation: RuleViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        range: { start: { line: 3, column: 7 }, end: { line: 9, column: 12 } },
        severity: 'warning',
        message: 'range test',
      }

      await saveBaseline([violation], 'range.json')
      const written = getWrittenContent()
      vi.mocked(fs.readFile).mockResolvedValue(written)
      const loaded = await loadBaseline('range.json')

      const loadedV = loaded!.violations[0]
      expect(loadedV.range.start.line).toBe(3)
      expect(loadedV.range.start.column).toBe(7)
      expect(loadedV.range.end.line).toBe(9)
      expect(loadedV.range.end.column).toBe(12)
    })

    it('save multiple violations and compare subset finds improvements', async () => {
      const violations = [
        createViolation('r1', 'a.ts', 1, 'keep', 'error'),
        createViolation('r2', 'b.ts', 2, 'remove', 'warning'),
        createViolation('r3', 'c.ts', 3, 'remove2', 'info'),
      ]

      await saveBaseline(violations, 'subset.json')
      const written = getWrittenContent()
      vi.mocked(fs.readFile).mockResolvedValue(written)
      const loaded = await loadBaseline('subset.json')

      const subset = [createViolation('r1', 'a.ts', 1, 'keep', 'error')]
      const result = compareWithBaseline(subset, loaded!.violations)

      expect(result.improvements).toHaveLength(2)
      expect(result.regressions).toHaveLength(0)
      expect(result.unchanged).toBe(1)
    })

    it('save then compare with completely new violations finds all regressions', async () => {
      const original = [
        createViolation('r1', 'a.ts', 1, 'old1'),
        createViolation('r2', 'b.ts', 2, 'old2'),
      ]

      await saveBaseline(original, 'replace.json')
      const written = getWrittenContent()
      vi.mocked(fs.readFile).mockResolvedValue(written)
      const loaded = await loadBaseline('replace.json')

      const newViolations = [
        createViolation('r3', 'c.ts', 3, 'new1'),
        createViolation('r4', 'd.ts', 4, 'new2'),
      ]

      const result = compareWithBaseline(newViolations, loaded!.violations)
      expect(result.regressions).toHaveLength(2)
      expect(result.improvements).toHaveLength(2)
      expect(result.unchanged).toBe(0)
    })

    it('save and reload preserves summary counts for mixed severities', async () => {
      const violations = [
        createViolation('r1', 'f.ts', 1, 'm', 'error'),
        createViolation('r2', 'f.ts', 2, 'm', 'error'),
        createViolation('r3', 'f.ts', 3, 'm', 'warning'),
        createViolation('r4', 'f.ts', 4, 'm', 'info'),
        createViolation('r5', 'f.ts', 5, 'm', 'info'),
      ]

      await saveBaseline(violations, 'mixed.json')
      const written = getWrittenContent()
      vi.mocked(fs.readFile).mockResolvedValue(written)
      const loaded = await loadBaseline('mixed.json')

      expect(loaded!.summary.errors).toBe(2)
      expect(loaded!.summary.warnings).toBe(1)
      expect(loaded!.summary.info).toBe(2)
      expect(loaded!.summary.total).toBe(5)
    })

    it('save single violation round-trips correctly', async () => {
      const violation = createViolation('test-rule', 'test.ts', 42, 'test message', 'warning')
      await saveBaseline([violation], 'single-rt.json')
      const written = getWrittenContent()
      vi.mocked(fs.readFile).mockResolvedValue(written)
      const loaded = await loadBaseline('single-rt.json')

      expect(loaded!.violations).toHaveLength(1)
      expect(loaded!.violations[0].ruleId).toBe('test-rule')
      expect(loaded!.violations[0].filePath).toBe('test.ts')
      expect(loaded!.violations[0].severity).toBe('warning')
      expect(loaded!.violations[0].message).toBe('test message')
      expect(loaded!.violations[0].range.start.line).toBe(42)
    })
  })

  describe('violationToBaseline — implicit coverage', () => {
    it('omits suggestion from saved violation even when present on RuleViolation', async () => {
      const v: RuleViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
        severity: 'error',
        message: 'm',
        suggestion: 'do something',
      }
      await saveBaseline([v])
      const parsed = parseWrittenBaseline()
      const keys = Object.keys(parsed.violations[0])
      expect(keys).not.toContain('suggestion')
    })

    it('preserves exact range object from input', async () => {
      const v: RuleViolation = {
        ruleId: 'r1',
        filePath: 'f.ts',
        range: { start: { line: 4, column: 2 }, end: { line: 6, column: 8 } },
        severity: 'error',
        message: 'm',
      }
      await saveBaseline([v])
      const parsed = parseWrittenBaseline()
      const bv = parsed.violations[0]
      expect(bv.range).toEqual({ start: { line: 4, column: 2 }, end: { line: 6, column: 8 } })
    })

    it('maps severity correctly for error', async () => {
      await saveBaseline([createViolation('r', 'f.ts', 1, 'm', 'error')])
      expect(parseWrittenBaseline().violations[0].severity).toBe('error')
    })

    it('maps severity correctly for warning', async () => {
      await saveBaseline([createViolation('r', 'f.ts', 1, 'm', 'warning')])
      expect(parseWrittenBaseline().violations[0].severity).toBe('warning')
    })

    it('maps severity correctly for info', async () => {
      await saveBaseline([createViolation('r', 'f.ts', 1, 'm', 'info')])
      expect(parseWrittenBaseline().violations[0].severity).toBe('info')
    })

    it('maps filePath correctly', async () => {
      await saveBaseline([createViolation('r', 'deeply/nested/path.ts', 1, 'm')])
      expect(parseWrittenBaseline().violations[0].filePath).toBe('deeply/nested/path.ts')
    })

    it('maps message correctly', async () => {
      await saveBaseline([createViolation('r', 'f.ts', 1, 'exact message content')])
      expect(parseWrittenBaseline().violations[0].message).toBe('exact message content')
    })
  })
})
