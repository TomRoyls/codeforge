import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'
import {
  parseSuppressions,
  parseSuppressionsFromSourceFile,
  filterSuppressedViolations,
} from '../../src/core/suppression-parser'
import type { RuleViolation } from '../../src/ast/visitor'
import { Parser } from '../../src/core/parser'

function createViolation(line: number, ruleId: string, filePath = '/test/file.ts'): RuleViolation {
  return {
    ruleId,
    severity: 'error',
    message: `Test violation for ${ruleId}`,
    filePath,
    range: {
      start: { line, column: 0 },
      end: { line, column: 10 },
    },
  }
}

describe('Suppression Integration Tests', () => {
  let tempDir: string

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-suppression-'))
  })

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('parseSuppressionsFromSourceFile', () => {
    test('parses suppressions from ts-morph SourceFile', async () => {
      const testFile = path.join(tempDir, 'source-file-test.ts')
      await fs.writeFile(
        testFile,
        `// codeforge-disable-next-line no-console
console.log('test')
// codeforge-disable max-complexity
function complex() {}
// codeforge-enable max-complexity
`,
      )

      const parser = new Parser()
      await parser.initialize()
      const parseResult = await parser.parseFile(testFile)

      const result = parseSuppressionsFromSourceFile(parseResult.sourceFile)

      expect(result.count).toBe(3)
      expect(result.suppressions[0].type).toBe('next-line')
      expect(result.suppressions[1].type).toBe('block-start')
      expect(result.suppressions[2].type).toBe('block-end')
    })

    test('parses suppressions from fixture file', async () => {
      const fixturePath = path.join(__dirname, 'fixtures', 'with-suppressions.ts')
      const parser = new Parser()
      await parser.initialize()
      const parseResult = await parser.parseFile(fixturePath)

      const result = parseSuppressionsFromSourceFile(parseResult.sourceFile)

      expect(result.count).toBeGreaterThanOrEqual(4)
      expect(
        result.suppressions.some(
          (s) => s.type === 'next-line' && s.ruleIds.includes('max-complexity'),
        ),
      ).toBe(true)
      expect(
        result.suppressions.some((s) => s.type === 'next-line' && s.ruleIds.includes('no-console')),
      ).toBe(true)
      expect(
        result.suppressions.some((s) => s.type === 'block-start' && s.ruleIds.includes('no-eval')),
      ).toBe(true)
      expect(
        result.suppressions.some((s) => s.type === 'block-end' && s.ruleIds.includes('no-eval')),
      ).toBe(true)
    })
  })

  describe('end-to-end suppression filtering', () => {
    test('filters violations suppressed by next-line comment', async () => {
      const code = `// codeforge-disable-next-line max-complexity
function complexFunction() {
  if (true) { if (true) { if (true) { return 1 } } }
}`
      const result = parseSuppressions(code)

      const violations = [
        createViolation(1, 'some-other-rule'),
        createViolation(2, 'max-complexity'),
        createViolation(3, 'max-complexity'),
      ]

      const filtered = filterSuppressedViolations(violations, result.suppressions)

      expect(filtered).toHaveLength(2)
      expect(filtered.map((v) => v.range.start.line)).toEqual([1, 3])
    })

    test('filters violations suppressed by block comment', async () => {
      const code = `// codeforge-disable no-console
console.log('a')
console.log('b')
// codeforge-enable no-console
console.log('c')`
      const result = parseSuppressions(code)

      const violations = [
        createViolation(2, 'no-console'),
        createViolation(3, 'no-console'),
        createViolation(5, 'no-console'),
      ]

      const filtered = filterSuppressedViolations(violations, result.suppressions)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].range.start.line).toBe(5)
    })

    test('filters violations from fixture file', async () => {
      const fixturePath = path.join(__dirname, 'fixtures', 'with-suppressions.ts')
      const content = await fs.readFile(fixturePath, 'utf-8')
      const result = parseSuppressions(content)

      const violations = [
        createViolation(4, 'max-complexity'),
        createViolation(16, 'max-complexity'),
        createViolation(28, 'no-console'),
        createViolation(31, 'no-console'),
        createViolation(34, 'no-eval'),
        createViolation(35, 'no-eval'),
        createViolation(39, 'no-eval'),
      ]

      const filtered = filterSuppressedViolations(violations, result.suppressions)

      expect(filtered).toHaveLength(3)
      expect(filtered.map((v) => v.range.start.line)).toEqual([16, 31, 39])
    })
  })

  describe('edge cases', () => {
    test('handles files with no suppressions', async () => {
      const code = `const x = 1
const y = 2`
      const result = parseSuppressions(code)

      const violations = [createViolation(1, 'some-rule'), createViolation(2, 'another-rule')]

      const filtered = filterSuppressedViolations(violations, result.suppressions)

      expect(filtered).toHaveLength(2)
    })

    test('handles mixed comment styles', async () => {
      const code = `/* codeforge-disable-next-line no-console */
console.log('block')
// codeforge-disable no-eval
eval('1+1')
/** codeforge-enable no-eval */
eval('2+2')`
      const result = parseSuppressions(code)

      expect(result.count).toBe(3)
      expect(result.suppressions[0].type).toBe('next-line')
      expect(result.suppressions[1].type).toBe('block-start')
      expect(result.suppressions[2].type).toBe('block-end')
    })

    test('handles suppression with no rule IDs (all rules)', async () => {
      const code = `// codeforge-disable-next-line
const x = eval('1')`
      const result = parseSuppressions(code)

      const violations = [
        createViolation(2, 'no-eval'),
        createViolation(2, 'no-console'),
        createViolation(2, 'max-complexity'),
      ]

      const filtered = filterSuppressedViolations(violations, result.suppressions)

      expect(filtered).toHaveLength(0)
    })
  })
})
