import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'
import { DSLParser } from '../../src/core/rule-dsl/dsl-parser.js'
import { RuleEvaluator } from '../../src/core/rule-dsl/rule-evaluator.js'
import { DSLIntegration } from '../../src/core/rule-dsl/dsl-integration.js'
import type {
  DSLRuleConfig,
  DSLCondition,
  DSLEvaluationContext,
  DSLFix,
  DSLParseResult,
  DSLViolation,
  DSLSeverity,
  DSLCategory,
  OperatorType,
} from '../../src/core/rule-dsl/types.js'

function makeContext(overrides: Partial<DSLEvaluationContext> = {}): DSLEvaluationContext {
  const content = overrides.content ?? 'console.log("hello")\nconst x = 1\n'
  return {
    filePath: overrides.filePath ?? 'test.ts',
    content,
    lines: content.split('\n'),
    lineNumber: overrides.lineNumber ?? 0,
    match: overrides.match,
  }
}

const SAMPLE_YAML = `rules:
  - id: no-console
    name: No Console Log
    description: Disallow console.log statements
    severity: warning
    category: patterns
    condition:
      type: pattern
      value: "console\\\\\.log\\\\\("
    message: "Unexpected console.log statement"
    suggestion: "Use a proper logging library instead"
    fix:
      type: replace
      pattern: "console\\\\\.log\\\\\(([^)]*)\\\\\)"
      replacement: "logger.info($1)"

  - id: max-file-lines
    name: Max File Lines
    description: Enforce maximum file line count
    severity: warning
    condition:
      type: count
      pattern: ".+"
      operator: gt
      value: 300
    message: "File exceeds 300 lines"
`

const SAMPLE_JSON = JSON.stringify({
  rules: [
    {
      id: 'no-eval',
      name: 'No Eval',
      description: 'Disallow eval usage',
      severity: 'error',
      category: 'security',
      condition: { type: 'pattern', value: 'eval\\(' },
      message: 'Unexpected eval usage',
      suggestion: 'Avoid using eval',
    },
    {
      id: 'no-debugger',
      name: 'No Debugger',
      description: 'Disallow debugger statements',
      severity: 'warning',
      condition: { type: 'regex', pattern: 'debugger', flags: 'g' },
      message: 'Unexpected debugger statement',
    },
  ],
}, null, 2)

describe('DSLParser', () => {
  let parser: DSLParser

  beforeEach(() => {
    parser = new DSLParser()
  })

  describe('parseYAML', () => {
    it('should parse a simple YAML rule', () => {
      const result = parser.parseYAML(SAMPLE_YAML)
      expect(result.success).toBe(true)
      expect(result.rules.length).toBeGreaterThanOrEqual(1)
      expect(result.errors).toHaveLength(0)
    })

    it('should return error for empty input', () => {
      const result = parser.parseYAML('')
      expect(result.success).toBe(false)
      expect(result.rules).toHaveLength(0)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should return error for whitespace-only input', () => {
      const result = parser.parseYAML('   \n  \n  ')
      expect(result.success).toBe(false)
    })

    it('should parse rule id correctly', () => {
      const yaml = `rules:
  - id: my-rule
    name: My Rule
    condition:
      type: pattern
      value: "test"
    message: "Test"
`
      const result = parser.parseYAML(yaml)
      expect(result.success).toBe(true)
      expect(result.rules[0]!.id).toBe('my-rule')
    })

    it('should apply default severity as warning', () => {
      const yaml = `rules:
  - id: test-rule
    name: Test Rule
    condition:
      type: pattern
      value: "x"
    message: "x found"
`
      const result = parser.parseYAML(yaml)
      expect(result.rules[0]!.severity).toBe('warning')
    })

    it('should apply default category as patterns', () => {
      const yaml = `rules:
  - id: test-rule
    name: Test Rule
    condition:
      type: pattern
      value: "x"
    message: "x found"
`
      const result = parser.parseYAML(yaml)
      expect(result.rules[0]!.category).toBe('patterns')
    })

    it('should apply default enabled as true', () => {
      const yaml = `rules:
  - id: test-rule
    name: Test Rule
    condition:
      type: pattern
      value: "x"
    message: "x found"
`
      const result = parser.parseYAML(yaml)
      expect(result.rules[0]!.enabled).toBe(true)
    })

    it('should parse severity when specified', () => {
      const yaml = `rules:
  - id: test-rule
    name: Test Rule
    severity: error
    condition:
      type: pattern
      value: "x"
    message: "x found"
`
      const result = parser.parseYAML(yaml)
      expect(result.rules[0]!.severity).toBe('error')
    })

    it('should parse category when specified', () => {
      const yaml = `rules:
  - id: test-rule
    name: Test Rule
    severity: warning
    category: security
    condition:
      type: pattern
      value: "x"
    message: "x found"
`
      const result = parser.parseYAML(yaml)
      expect(result.rules[0]!.category).toBe('security')
    })

    it('should parse suggestion when provided', () => {
      const yaml = `rules:
  - id: test-rule
    name: Test
    condition:
      type: pattern
      value: "x"
    message: "x found"
    suggestion: "Use y instead"
`
      const result = parser.parseYAML(yaml)
      expect(result.rules[0]!.suggestion).toBe('Use y instead')
    })

    it('should parse fix when provided', () => {
      const yaml = `rules:
  - id: test-rule
    name: Test
    condition:
      type: pattern
      value: "x"
    message: "x found"
    fix:
      type: replace
      pattern: "x"
      replacement: "y"
`
      const result = parser.parseYAML(yaml)
      expect(result.rules[0]!.fix).toBeDefined()
      expect(result.rules[0]!.fix!.type).toBe('replace')
      expect(result.rules[0]!.fix!.pattern).toBe('x')
      expect(result.rules[0]!.fix!.replacement).toBe('y')
    })

    it('should parse boolean values', () => {
      const yaml = `rules:
  - id: test-rule
    name: Test
    enabled: false
    condition:
      type: pattern
      value: "x"
    message: "x found"
`
      const result = parser.parseYAML(yaml)
      expect(result.rules[0]!.enabled).toBe(false)
    })

    it('should parse numeric values', () => {
      const yaml = `rules:
  - id: test-rule
    name: Test
    condition:
      type: count
      pattern: ".+"
      operator: gt
      value: 300
    message: "too many"
`
      const result = parser.parseYAML(yaml)
      expect(result.success).toBe(true)
      expect((result.rules[0]!.condition as { type: 'count'; value: number }).value).toBe(300)
    })

    it('should parse multiple rules', () => {
      const yaml = `rules:
  - id: rule-1
    name: Rule 1
    condition:
      type: pattern
      value: "a"
    message: "a found"
  - id: rule-2
    name: Rule 2
    condition:
      type: pattern
      value: "b"
    message: "b found"
`
      const result = parser.parseYAML(yaml)
      expect(result.success).toBe(true)
      expect(result.rules).toHaveLength(2)
    })

    it('should return error for missing rules array', () => {
      const result = parser.parseYAML('something: else\n')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('parseJSON', () => {
    it('should parse valid JSON rules', () => {
      const result = parser.parseJSON(SAMPLE_JSON)
      expect(result.success).toBe(true)
      expect(result.rules).toHaveLength(2)
    })

    it('should parse rule fields correctly from JSON', () => {
      const result = parser.parseJSON(SAMPLE_JSON)
      const rule = result.rules[0]!
      expect(rule.id).toBe('no-eval')
      expect(rule.name).toBe('No Eval')
      expect(rule.description).toBe('Disallow eval usage')
      expect(rule.severity).toBe('error')
      expect(rule.category).toBe('security')
    })

    it('should return error for invalid JSON', () => {
      const result = parser.parseJSON('{invalid json}')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should return error for empty JSON object without rules', () => {
      const result = parser.parseJSON('{}')
      expect(result.success).toBe(false)
      expect(result.errors[0]!.message).toContain('rules')
    })

    it('should return error when rules is not an array', () => {
      const result = parser.parseJSON('{"rules": "not-array"}')
      expect(result.success).toBe(false)
    })

    it('should validate individual rules', () => {
      const result = parser.parseJSON('{"rules": [{"id": "x"}]}')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should parse condition from JSON', () => {
      const result = parser.parseJSON(SAMPLE_JSON)
      const rule = result.rules.find((r) => r.id === 'no-eval')
      expect(rule).toBeDefined()
      expect(rule!.condition.type).toBe('pattern')
    })

    it('should parse regex condition with flags from JSON', () => {
      const result = parser.parseJSON(SAMPLE_JSON)
      const rule = result.rules.find((r) => r.id === 'no-debugger')
      expect(rule).toBeDefined()
      expect(rule!.condition.type).toBe('regex')
      const regexCond = rule!.condition as { type: 'regex'; pattern: string; flags?: string }
      expect(regexCond.flags).toBe('g')
    })
  })

  describe('parseFile', () => {
    let tmpDir: string

    beforeEach(async () => {
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rule-dsl-test-'))
    })

    afterEach(async () => {
      await fs.rm(tmpDir, { recursive: true, force: true })
    })

    it('should parse a YAML file', async () => {
      const filePath = path.join(tmpDir, 'rules.yaml')
      await fs.writeFile(filePath, SAMPLE_YAML, 'utf-8')
      const result = await parser.parseFile(filePath)
      expect(result.success).toBe(true)
      expect(result.rules.length).toBeGreaterThanOrEqual(1)
    })

    it('should parse a JSON file', async () => {
      const filePath = path.join(tmpDir, 'rules.json')
      await fs.writeFile(filePath, SAMPLE_JSON, 'utf-8')
      const result = await parser.parseFile(filePath)
      expect(result.success).toBe(true)
      expect(result.rules).toHaveLength(2)
    })

    it('should parse a .yml file as YAML', async () => {
      const yaml = `rules:
  - id: yml-rule
    name: YML Rule
    condition:
      type: pattern
      value: "test"
    message: "test"
`
      const filePath = path.join(tmpDir, 'rules.yml')
      await fs.writeFile(filePath, yaml, 'utf-8')
      const result = await parser.parseFile(filePath)
      expect(result.success).toBe(true)
      expect(result.rules[0]!.id).toBe('yml-rule')
    })
  })

  describe('validateRule', () => {
    it('should return empty errors for valid rule', () => {
      const errors = parser.validateRule({
        id: 'test',
        name: 'Test',
        condition: { type: 'pattern', value: 'x' },
        message: 'Found x',
      })
      expect(errors).toHaveLength(0)
    })

    it('should return error for missing id', () => {
      const errors = parser.validateRule({
        name: 'Test',
        condition: { type: 'pattern', value: 'x' },
        message: 'Found x',
      })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should return error for missing name', () => {
      const errors = parser.validateRule({
        id: 'test',
        condition: { type: 'pattern', value: 'x' },
        message: 'Found x',
      })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should return error for missing condition', () => {
      const errors = parser.validateRule({
        id: 'test',
        name: 'Test',
        message: 'Found x',
      })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should return error for missing message', () => {
      const errors = parser.validateRule({
        id: 'test',
        name: 'Test',
        condition: { type: 'pattern', value: 'x' },
      })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should return error for invalid severity', () => {
      const errors = parser.validateRule({
        id: 'test',
        name: 'Test',
        severity: 'invalid',
        condition: { type: 'pattern', value: 'x' },
        message: 'Found x',
      })
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should return error for invalid category', () => {
      const errors = parser.validateRule({
        id: 'test',
        name: 'Test',
        category: 'invalid',
        condition: { type: 'pattern', value: 'x' },
        message: 'Found x',
      })
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('validateCondition', () => {
    it('should validate pattern condition', () => {
      const errors = parser.validateCondition({ type: 'pattern', value: 'test' })
      expect(errors).toHaveLength(0)
    })

    it('should reject pattern without value', () => {
      const errors = parser.validateCondition({ type: 'pattern' } as DSLCondition)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should validate ast condition', () => {
      const errors = parser.validateCondition({ type: 'ast', selector: 'CallExpression' })
      expect(errors).toHaveLength(0)
    })

    it('should validate and condition with children', () => {
      const errors = parser.validateCondition({
        type: 'and',
        conditions: [
          { type: 'pattern', value: 'a' },
          { type: 'pattern', value: 'b' },
        ],
      })
      expect(errors).toHaveLength(0)
    })

    it('should reject and condition without conditions array', () => {
      const errors = parser.validateCondition({ type: 'and' } as DSLCondition)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should validate or condition', () => {
      const errors = parser.validateCondition({
        type: 'or',
        conditions: [{ type: 'pattern', value: 'a' }],
      })
      expect(errors).toHaveLength(0)
    })

    it('should validate not condition', () => {
      const errors = parser.validateCondition({
        type: 'not',
        condition: { type: 'pattern', value: 'a' },
      })
      expect(errors).toHaveLength(0)
    })

    it('should reject not condition without child', () => {
      const errors = parser.validateCondition({ type: 'not' } as DSLCondition)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should validate exists condition', () => {
      const errors = parser.validateCondition({ type: 'exists', pattern: 'TODO' })
      expect(errors).toHaveLength(0)
    })

    it('should validate count condition', () => {
      const errors = parser.validateCondition({
        type: 'count',
        pattern: '.+',
        operator: 'gt',
        value: 100,
      })
      expect(errors).toHaveLength(0)
    })

    it('should reject count with invalid operator', () => {
      const errors = parser.validateCondition({
        type: 'count',
        pattern: '.+',
        operator: 'invalid',
        value: 100,
      } as DSLCondition)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should validate line-length condition', () => {
      const errors = parser.validateCondition({
        type: 'line-length',
        operator: 'gt',
        value: 120,
      })
      expect(errors).toHaveLength(0)
    })

    it('should validate file-size condition', () => {
      const errors = parser.validateCondition({
        type: 'file-size',
        operator: 'lt',
        value: 50000,
      })
      expect(errors).toHaveLength(0)
    })

    it('should validate regex condition', () => {
      const errors = parser.validateCondition({
        type: 'regex',
        pattern: 'test',
        flags: 'gi',
      })
      expect(errors).toHaveLength(0)
    })

    it('should reject invalid condition type', () => {
      const errors = parser.validateCondition({ type: 'unknown' } as DSLCondition)
      expect(errors.length).toBeGreaterThan(0)
    })
  })
})

describe('RuleEvaluator', () => {
  let evaluator: RuleEvaluator

  beforeEach(() => {
    evaluator = new RuleEvaluator()
  })

  describe('evaluateCondition', () => {
    it('should match a pattern condition', () => {
      const ctx = makeContext()
      const result = evaluator.evaluateCondition(
        { type: 'pattern', value: 'console\\.log' },
        ctx,
      )
      expect(result).toBe(true)
    })

    it('should not match when pattern is absent', () => {
      const ctx = makeContext({ content: 'const x = 1\n' })
      const result = evaluator.evaluateCondition(
        { type: 'pattern', value: 'console\\.log' },
        ctx,
      )
      expect(result).toBe(false)
    })

    it('should evaluate and condition - both true', () => {
      const ctx = makeContext({ content: 'console.log("hi")\n' })
      const result = evaluator.evaluateCondition(
        {
          type: 'and',
          conditions: [
            { type: 'pattern', value: 'console' },
            { type: 'pattern', value: 'log' },
          ],
        },
        ctx,
      )
      expect(result).toBe(true)
    })

    it('should evaluate and condition - one false', () => {
      const ctx = makeContext({ content: 'console.log("hi")\n' })
      const result = evaluator.evaluateCondition(
        {
          type: 'and',
          conditions: [
            { type: 'pattern', value: 'console' },
            { type: 'pattern', value: 'process\\.exit' },
          ],
        },
        ctx,
      )
      expect(result).toBe(false)
    })

    it('should evaluate or condition - one true', () => {
      const ctx = makeContext({ content: 'console.log("hi")\n' })
      const result = evaluator.evaluateCondition(
        {
          type: 'or',
          conditions: [
            { type: 'pattern', value: 'eval\\(' },
            { type: 'pattern', value: 'console' },
          ],
        },
        ctx,
      )
      expect(result).toBe(true)
    })

    it('should evaluate or condition - both false', () => {
      const ctx = makeContext({ content: 'const x = 1\n' })
      const result = evaluator.evaluateCondition(
        {
          type: 'or',
          conditions: [
            { type: 'pattern', value: 'eval\\(' },
            { type: 'pattern', value: 'debugger' },
          ],
        },
        ctx,
      )
      expect(result).toBe(false)
    })

    it('should evaluate not condition', () => {
      const ctx = makeContext({ content: 'const x = 1\n' })
      const result = evaluator.evaluateCondition(
        { type: 'not', condition: { type: 'pattern', value: 'eval' } },
        ctx,
      )
      expect(result).toBe(true)
    })

    it('should evaluate exists condition', () => {
      const ctx = makeContext({ content: 'TODO: fix this\n' })
      const result = evaluator.evaluateCondition(
        { type: 'exists', pattern: 'TODO' },
        ctx,
      )
      expect(result).toBe(true)
    })

    it('should evaluate count condition - gt', () => {
      const ctx = makeContext({ content: 'a\nb\nc\n' })
      const result = evaluator.evaluateCondition(
        { type: 'count', pattern: '.', operator: 'gt', value: 2 },
        ctx,
      )
      expect(result).toBe(true)
    })

    it('should evaluate count condition - lt', () => {
      const ctx = makeContext({ content: 'a\nb\n' })
      const result = evaluator.evaluateCondition(
        { type: 'count', pattern: 'x', operator: 'lt', value: 1 },
        ctx,
      )
      expect(result).toBe(true)
    })

    it('should evaluate line-length condition', () => {
      const longLine = 'x'.repeat(150)
      const ctx = makeContext({ content: longLine + '\n', lineNumber: 0 })
      const result = evaluator.evaluateCondition(
        { type: 'line-length', operator: 'gt', value: 120 },
        ctx,
      )
      expect(result).toBe(true)
    })

    it('should evaluate file-size condition', () => {
      const bigContent = 'x'.repeat(1000)
      const ctx = makeContext({ content: bigContent })
      const result = evaluator.evaluateCondition(
        { type: 'file-size', operator: 'gt', value: 500 },
        ctx,
      )
      expect(result).toBe(true)
    })

    it('should evaluate regex condition with flags', () => {
      const ctx = makeContext({ content: 'Hello World\n' })
      const result = evaluator.evaluateCondition(
        { type: 'regex', pattern: 'hello', flags: 'i' },
        ctx,
      )
      expect(result).toBe(true)
    })

    it('should evaluate ast condition with selector', () => {
      const ctx = makeContext({ content: 'function test() {}\n' })
      const result = evaluator.evaluateCondition(
        { type: 'ast', selector: 'function' },
        ctx,
      )
      expect(result).toBe(true)
    })

    it('should evaluate ast condition with filter', () => {
      const ctx = makeContext({ content: 'function test() {}\n' })
      const result = evaluator.evaluateCondition(
        { type: 'ast', selector: 'function', filter: 'test' },
        ctx,
      )
      expect(result).toBe(true)
    })
  })

  describe('evaluateRule', () => {
    it('should return violations for matching content', () => {
      const rule: DSLRuleConfig = {
        id: 'no-console',
        name: 'No Console',
        description: '',
        severity: 'warning',
        category: 'patterns',
        enabled: true,
        condition: { type: 'pattern', value: 'console\\.log' },
        message: 'No console.log',
      }
      const violations = evaluator.evaluateRule(rule, 'test.ts', 'console.log("hello")\n')
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0]!.ruleId).toBe('no-console')
    })

    it('should return empty for non-matching content', () => {
      const rule: DSLRuleConfig = {
        id: 'no-eval',
        name: 'No Eval',
        description: '',
        severity: 'error',
        category: 'security',
        enabled: true,
        condition: { type: 'pattern', value: 'eval\\(' },
        message: 'No eval',
      }
      const violations = evaluator.evaluateRule(rule, 'test.ts', 'const x = 1\n')
      expect(violations).toHaveLength(0)
    })

    it('should include file path in violations', () => {
      const rule: DSLRuleConfig = {
        id: 'test-rule',
        name: 'Test',
        description: '',
        severity: 'warning',
        category: 'patterns',
        enabled: true,
        condition: { type: 'pattern', value: 'test' },
        message: 'Found test',
      }
      const violations = evaluator.evaluateRule(rule, '/path/to/file.ts', 'test content\n')
      expect(violations[0]!.filePath).toBe('/path/to/file.ts')
    })

    it('should include severity in violations', () => {
      const rule: DSLRuleConfig = {
        id: 'test-rule',
        name: 'Test',
        description: '',
        severity: 'error',
        category: 'security',
        enabled: true,
        condition: { type: 'pattern', value: 'test' },
        message: 'Found test',
      }
      const violations = evaluator.evaluateRule(rule, 'test.ts', 'test\n')
      expect(violations[0]!.severity).toBe('error')
    })

    it('should include suggestion in violations when present', () => {
      const rule: DSLRuleConfig = {
        id: 'test-rule',
        name: 'Test',
        description: '',
        severity: 'warning',
        category: 'patterns',
        enabled: true,
        condition: { type: 'pattern', value: 'test' },
        message: 'Found test',
        suggestion: 'Use something else',
      }
      const violations = evaluator.evaluateRule(rule, 'test.ts', 'test\n')
      expect(violations[0]!.suggestion).toBe('Use something else')
    })

    it('should handle count conditions that match', () => {
      const rule: DSLRuleConfig = {
        id: 'too-many-lines',
        name: 'Too Many',
        description: '',
        severity: 'warning',
        category: 'complexity',
        enabled: true,
        condition: { type: 'count', pattern: '.+', operator: 'gt', value: 1 },
        message: 'More than 1 line',
      }
      const violations = evaluator.evaluateRule(rule, 'test.ts', 'line1\nline2\n')
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should handle file-size conditions', () => {
      const rule: DSLRuleConfig = {
        id: 'big-file',
        name: 'Big File',
        description: '',
        severity: 'warning',
        category: 'complexity',
        enabled: true,
        condition: { type: 'file-size', operator: 'gt', value: 10 },
        message: 'File too large',
      }
      const violations = evaluator.evaluateRule(rule, 'test.ts', 'x'.repeat(100))
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('applyFix', () => {
    it('should apply replace fix', () => {
      const fix: DSLFix = { type: 'replace', pattern: 'foo', replacement: 'bar' }
      const match = 'foo bar'.match(/foo/) as RegExpMatchArray
      const result = evaluator.applyFix(fix, 'foo bar', match)
      expect(result).toBe('bar bar')
    })

    it('should apply prepend fix', () => {
      const fix: DSLFix = { type: 'prepend', pattern: 'test', replacement: '// comment\n' }
      const match = 'test'.match(/test/) as RegExpMatchArray
      const result = evaluator.applyFix(fix, 'test code', match)
      expect(result).toBe('// comment\ntest code')
    })

    it('should apply append fix', () => {
      const fix: DSLFix = { type: 'append', pattern: 'test', replacement: '\n// end' }
      const match = 'test'.match(/test/) as RegExpMatchArray
      const result = evaluator.applyFix(fix, 'code test', match)
      expect(result).toBe('code test\n// end')
    })

    it('should apply delete fix', () => {
      const fix: DSLFix = { type: 'delete', pattern: 'console\\.log\\([^)]*\\)\\s*;?' }
      const match = 'console.log("hi")'.match(/console\.log\([^)]*\)/) as RegExpMatchArray
      const result = evaluator.applyFix(fix, 'console.log("hi");\nconst x = 1;', match)
      expect(result).toBe('\nconst x = 1;')
    })

    it('should handle replace without replacement using match', () => {
      const fix: DSLFix = { type: 'replace', pattern: 'test' }
      const match = 'test value'.match(/test/) as RegExpMatchArray
      const result = evaluator.applyFix(fix, 'test value', match)
      expect(result).toBe('test value')
    })
  })

  describe('compareValues', () => {
    it('should compare gt correctly', () => {
      expect(evaluator.compareValues(5, 'gt', 3)).toBe(true)
      expect(evaluator.compareValues(3, 'gt', 5)).toBe(false)
    })

    it('should compare lt correctly', () => {
      expect(evaluator.compareValues(3, 'lt', 5)).toBe(true)
      expect(evaluator.compareValues(5, 'lt', 3)).toBe(false)
    })

    it('should compare eq correctly', () => {
      expect(evaluator.compareValues(5, 'eq', 5)).toBe(true)
      expect(evaluator.compareValues(5, 'eq', 3)).toBe(false)
    })

    it('should compare gte correctly', () => {
      expect(evaluator.compareValues(5, 'gte', 5)).toBe(true)
      expect(evaluator.compareValues(6, 'gte', 5)).toBe(true)
      expect(evaluator.compareValues(4, 'gte', 5)).toBe(false)
    })

    it('should compare lte correctly', () => {
      expect(evaluator.compareValues(5, 'lte', 5)).toBe(true)
      expect(evaluator.compareValues(4, 'lte', 5)).toBe(true)
      expect(evaluator.compareValues(6, 'lte', 5)).toBe(false)
    })
  })

  describe('getMatches', () => {
    it('should find all pattern matches', () => {
      const content = 'console.log("a")\nconsole.log("b")\n'
      const matches = evaluator.getMatches(
        content,
        { type: 'pattern', value: 'console\\.log' },
      )
      expect(matches).toHaveLength(2)
    })

    it('should return correct line numbers', () => {
      const content = 'line1\nconsole.log("a")\nline3\n'
      const matches = evaluator.getMatches(
        content,
        { type: 'pattern', value: 'console' },
      )
      expect(matches).toHaveLength(1)
      expect(matches[0]!.line).toBe(2)
    })

    it('should find regex matches with flags', () => {
      const content = 'Hello hello HELLO\n'
      const matches = evaluator.getMatches(
        content,
        { type: 'regex', pattern: 'hello', flags: 'gi' },
      )
      expect(matches).toHaveLength(3)
    })

    it('should return empty for non-matching', () => {
      const content = 'no match here\n'
      const matches = evaluator.getMatches(
        content,
        { type: 'pattern', value: 'eval\\(' },
      )
      expect(matches).toHaveLength(0)
    })

    it('should return empty for non-matchable condition types', () => {
      const content = 'test\n'
      const matches = evaluator.getMatches(
        content,
        { type: 'count', pattern: '.', operator: 'gt', value: 0 },
      )
      expect(matches).toHaveLength(0)
    })
  })
})

describe('DSLIntegration', () => {
  let integration: DSLIntegration
  let tmpDir: string

  beforeEach(async () => {
    integration = new DSLIntegration()
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rule-dsl-int-'))
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  describe('loadRulesFromDirectory', () => {
    it('should load rules from YAML files', async () => {
      await fs.writeFile(path.join(tmpDir, 'rules.yaml'), SAMPLE_YAML, 'utf-8')
      const rules = await integration.loadRulesFromDirectory(tmpDir)
      expect(rules.length).toBeGreaterThanOrEqual(1)
    })

    it('should load rules from JSON files', async () => {
      await fs.writeFile(path.join(tmpDir, 'rules.json'), SAMPLE_JSON, 'utf-8')
      const rules = await integration.loadRulesFromDirectory(tmpDir)
      expect(rules).toHaveLength(2)
    })

    it('should load rules from multiple files', async () => {
      await fs.writeFile(path.join(tmpDir, 'rules.yaml'), SAMPLE_YAML, 'utf-8')
      await fs.writeFile(path.join(tmpDir, 'rules.json'), SAMPLE_JSON, 'utf-8')
      const rules = await integration.loadRulesFromDirectory(tmpDir)
      expect(rules.length).toBeGreaterThanOrEqual(3)
    })

    it('should return empty array for non-existent directory', async () => {
      const rules = await integration.loadRulesFromDirectory('/non/existent/path')
      expect(rules).toHaveLength(0)
    })

    it('should ignore non-rule files', async () => {
      await fs.writeFile(path.join(tmpDir, 'readme.md'), '# Rules', 'utf-8')
      await fs.writeFile(path.join(tmpDir, 'rules.json'), SAMPLE_JSON, 'utf-8')
      const rules = await integration.loadRulesFromDirectory(tmpDir)
      expect(rules).toHaveLength(2)
    })
  })

  describe('convertToViolations', () => {
    it('should convert DSL violations to integration format', () => {
      const dslViolations: DSLViolation[] = [
        {
          ruleId: 'test-rule',
          filePath: 'test.ts',
          line: 1,
          column: 1,
          message: 'Test violation',
          severity: 'warning',
        },
      ]
      const results = new Map<string, DSLViolation[]>([['test.ts', dslViolations]])
      const violations = integration.convertToViolations(results)
      expect(violations).toHaveLength(1)
      expect(violations[0]!.ruleId).toBe('test-rule')
      expect(violations[0]!.source).toBe('dsl')
    })

    it('should handle multiple files', () => {
      const results = new Map<string, DSLViolation[]>([
        ['a.ts', [{ ruleId: 'r1', filePath: 'a.ts', line: 1, column: 1, message: 'm', severity: 'warning' }]],
        ['b.ts', [{ ruleId: 'r2', filePath: 'b.ts', line: 2, column: 3, message: 'n', severity: 'error' }]],
      ])
      const violations = integration.convertToViolations(results)
      expect(violations).toHaveLength(2)
    })

    it('should preserve suggestion', () => {
      const results = new Map<string, DSLViolation[]>([
        ['test.ts', [{ ruleId: 'r', filePath: 'test.ts', line: 1, column: 1, message: 'm', severity: 'warning', suggestion: 'fix it' }]],
      ])
      const violations = integration.convertToViolations(results)
      expect(violations[0]!.suggestion).toBe('fix it')
    })
  })

  describe('mergeWithExistingRules', () => {
    it('should add new rules without conflicts', () => {
      const dslRules: DSLRuleConfig[] = [
        {
          id: 'new-rule',
          name: 'New',
          description: '',
          severity: 'warning',
          category: 'patterns',
          enabled: true,
          condition: { type: 'pattern', value: 'x' },
          message: 'x found',
        },
      ]
      const result = integration.mergeWithExistingRules(dslRules, ['existing-rule'])
      expect(result.merged).toHaveLength(1)
      expect(result.conflicts).toHaveLength(0)
    })

    it('should detect conflicts', () => {
      const dslRules: DSLRuleConfig[] = [
        {
          id: 'existing-rule',
          name: 'Dup',
          description: '',
          severity: 'warning',
          category: 'patterns',
          enabled: true,
          condition: { type: 'pattern', value: 'x' },
          message: 'x found',
        },
      ]
      const result = integration.mergeWithExistingRules(dslRules, ['existing-rule'])
      expect(result.merged).toHaveLength(0)
      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0]).toBe('existing-rule')
    })

    it('should handle mixed conflicts and new rules', () => {
      const dslRules: DSLRuleConfig[] = [
        {
          id: 'existing',
          name: 'Dup',
          description: '',
          severity: 'warning',
          category: 'patterns',
          enabled: true,
          condition: { type: 'pattern', value: 'x' },
          message: 'x',
        },
        {
          id: 'new-rule',
          name: 'New',
          description: '',
          severity: 'warning',
          category: 'patterns',
          enabled: true,
          condition: { type: 'pattern', value: 'y' },
          message: 'y',
        },
      ]
      const result = integration.mergeWithExistingRules(dslRules, ['existing'])
      expect(result.merged).toHaveLength(1)
      expect(result.conflicts).toHaveLength(1)
    })
  })

  describe('getRuleMetadata', () => {
    it('should extract rule metadata', () => {
      const rule: DSLRuleConfig = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        severity: 'error',
        category: 'security',
        enabled: true,
        condition: { type: 'pattern', value: 'x' },
        message: 'Found x',
        suggestion: 'Use y',
        fix: { type: 'replace', pattern: 'x', replacement: 'y' },
      }
      const metadata = integration.getRuleMetadata(rule)
      expect(metadata).toEqual({
        id: 'test-rule',
        name: 'Test Rule',
        description: 'A test rule',
        severity: 'error',
        category: 'security',
        enabled: true,
        hasFix: true,
        fixType: 'replace',
        hasSuggestion: true,
        conditionType: 'pattern',
      })
    })

    it('should handle rule without fix or suggestion', () => {
      const rule: DSLRuleConfig = {
        id: 'simple-rule',
        name: 'Simple',
        description: '',
        severity: 'warning',
        category: 'patterns',
        enabled: true,
        condition: { type: 'exists', pattern: 'TODO' },
        message: 'TODO found',
      }
      const metadata = integration.getRuleMetadata(rule)
      expect(metadata).toEqual({
        id: 'simple-rule',
        name: 'Simple',
        description: '',
        severity: 'warning',
        category: 'patterns',
        enabled: true,
        hasFix: false,
        fixType: undefined,
        hasSuggestion: false,
        conditionType: 'exists',
      })
    })
  })
})
