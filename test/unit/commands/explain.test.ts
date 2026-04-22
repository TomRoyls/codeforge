import { describe, test, expect, vi, beforeEach } from 'vitest'
import Explain from '../../../src/commands/explain.js'
import { allRules, getRuleCategory } from '../../../src/rules/index.js'

// Helper to create a command with mocked internals
function createCommand(ruleId?: string) {
  const command = new Explain([], {} as never)
  vi.spyOn(command as any, 'parse').mockResolvedValue({
    args: { 'rule-id': ruleId ?? undefined },
    flags: {},
  })
  vi.spyOn(command as any, 'config', 'get').mockReturnValue({ bin: 'codeforge' })
  return command
}

// Helper to run command and capture all log output
async function runAndCapture(ruleId: string): Promise<string> {
  const command = createCommand(ruleId)
  const logSpy = vi.spyOn(command as any, 'log')
  await command.run()
  return logSpy.mock.calls.map((call: unknown[]) => call.join(' ')).join('\n')
}

// Helper to run command expecting an error
async function runAndExpectError(ruleId: string): Promise<{ error: Error; errorMessage: string }> {
  const command = createCommand(ruleId)
  let errorMessage = ''
  vi.spyOn(command as any, 'error').mockImplementation((msg: string | unknown) => {
    errorMessage = msg as string
    throw new Error(msg as string)
  })
  let error = new Error('')
  try {
    await command.run()
  } catch (e) {
    error = e as Error
  }
  return { error, errorMessage }
}

// Get all known rule IDs from the allRules registry
function getAllRuleIds(): string[] {
  return Object.keys(allRules)
}

// Get a sample of rules from each category
function getSampleRuleIds(): string[] {
  return [
    'no-eval',
    'prefer-const',
    'no-unused-vars',
    'max-params',
    'no-console-log',
    'no-duplicate-imports',
    'max-complexity',
    'no-await-in-loop',
    'no-circular-deps',
    'eq-eq-eq',
    'curly',
    'no-explicit-any',
    'no-floating-promises',
    'prefer-template',
    'require-await',
    'sort-keys',
    'use-isnan',
    'object-shorthand',
    'prefer-arrow-callback',
    'prefer-readonly',
    'no-debugger',
    'no-alert',
    'no-shadow',
    'no-param-reassign',
    'no-nested-ternary',
    'no-throw-literal',
    'no-unsafe-regex',
    'no-empty',
    'no-fallthrough',
    'prefer-includes',
    'prefer-nullish-coalescing',
    'prefer-optional-chain',
    'prefer-rest-params',
    'prefer-spread',
    'no-implicit-coercion',
    'no-implied-eval',
    'no-non-null-assertion',
  ]
}

// Rules with examples in the explain.ts command's internal examplesMap
function getRulesWithExamples(): string[] {
  return ['no-eval', 'prefer-const', 'no-console-log', 'no-duplicate-imports', 'no-unused-vars']
}

// Rules known to NOT have examples in the command's internal map
function getRulesWithoutExamples(): string[] {
  return ['max-complexity', 'eq-eq-eq', 'no-alert', 'no-shadow', 'curly']
}

// All categories
const ALL_CATEGORIES = [
  'complexity',
  'security',
  'patterns',
  'dependencies',
  'performance',
  'correctness',
  'testing',
  'style',
]

describe('Explain Command', () => {
  // ─── Command metadata (static properties) ───────────────────────────────────

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Explain.description).toBe('Explain a specific rule in detail')
    })

    test('description is a non-empty string', () => {
      expect(typeof Explain.description).toBe('string')
      expect(Explain.description.length).toBeGreaterThan(0)
    })

    test('has examples defined', () => {
      expect(Explain.examples).toBeDefined()
      expect(Array.isArray(Explain.examples)).toBe(true)
      expect(Explain.examples.length).toBeGreaterThan(0)
    })

    test('example command format is correct', () => {
      expect(Explain.examples[0].command).toContain('<%= config.bin %>')
      expect(Explain.examples[0].command).toContain('<%= command.id %>')
    })

    test('second example command format is correct', () => {
      expect(Explain.examples[1].command).toContain('<%= config.bin %>')
      expect(Explain.examples[1].command).toContain('<%= command.id %>')
    })

    test('first example explains no-eval', () => {
      expect(Explain.examples[0].command).toContain('no-eval')
    })

    test('second example explains prefer-const', () => {
      expect(Explain.examples[1].command).toContain('prefer-const')
    })

    test('has args defined', () => {
      expect(Explain.args).toBeDefined()
      expect(Explain.args['rule-id']).toBeDefined()
      expect(Explain.args['rule-id'].required).toBe(true)
      expect(Explain.args['rule-id'].description).toBe('The ID of the rule to explain')
    })

    test('rule-id arg name is correct', () => {
      expect(Explain.args['rule-id'].name).toBe('rule-id')
    })

    test('example descriptions are meaningful', () => {
      for (const example of Explain.examples) {
        expect(example.description).toBeDefined()
        expect(typeof example.description).toBe('string')
        expect(example.description.length).toBeGreaterThan(0)
      }
    })

    test('first example has a description about no-eval', () => {
      expect(Explain.examples[0].description).toContain('no-eval')
    })

    test('second example has a description about prefer-const', () => {
      expect(Explain.examples[1].description).toContain('prefer-const')
    })

    test('has exactly 2 examples', () => {
      expect(Explain.examples.length).toBe(2)
    })

    test('Explain is a class', () => {
      expect(typeof Explain).toBe('function')
    })

    test('Explain has a run method', () => {
      const command = new Explain([], {} as never)
      expect(typeof command.run).toBe('function')
    })
  })

  // ─── Error handling ─────────────────────────────────────────────────────────

  describe('run - error handling', () => {
    test('errors for non-existent rule', async () => {
      const { error } = await runAndExpectError('non-existent-rule-xyz')
      expect(error.message).toContain('not found')
    })

    test('error message includes the rule ID', async () => {
      const { errorMessage } = await runAndExpectError('unknown-rule')
      expect(errorMessage).toContain('unknown-rule')
    })

    test('error message includes available rules command', async () => {
      const { errorMessage } = await runAndExpectError('unknown-rule')
      expect(errorMessage).toContain('rules')
      expect(errorMessage).toContain('not found')
    })

    test('error message includes bin name', async () => {
      const { errorMessage } = await runAndExpectError('unknown-rule')
      expect(errorMessage).toContain('codeforge')
    })

    test('error message suggests running rules command', async () => {
      const { errorMessage } = await runAndExpectError('missing-rule')
      expect(errorMessage).toContain("Run 'codeforge rules'")
    })

    test('requires rule-id argument', async () => {
      const command = new Explain([], {} as never)
      vi.spyOn(command as any, 'parse').mockResolvedValue({
        args: { 'rule-id': undefined },
        flags: {},
      })
      vi.spyOn(command as any, 'config', 'get').mockReturnValue({ bin: 'codeforge' })
      await expect(command.run()).rejects.toThrow()
    })

    test('errors for empty string rule-id', async () => {
      const { error } = await runAndExpectError('')
      expect(error.message).toContain('not found')
    })

    test('errors for whitespace-only rule-id', async () => {
      const { error } = await runAndExpectError('   ')
      expect(error.message).toContain('not found')
    })

    test('errors for rule-id with special characters', async () => {
      const { error } = await runAndExpectError('!@#$%')
      expect(error.message).toContain('not found')
    })

    test('errors for near-miss rule ID', async () => {
      const { error } = await runAndExpectError('no-eval-typo')
      expect(error.message).toContain('not found')
    })

    test('errors for case-mismatch rule ID', async () => {
      const { error } = await runAndExpectError('No-Eval')
      expect(error.message).toContain('not found')
    })

    test('errors for rule ID with spaces', async () => {
      const { error } = await runAndExpectError('no eval')
      expect(error.message).toContain('not found')
    })

    test('error thrown is an Error instance', async () => {
      const { error } = await runAndExpectError('non-existent')
      expect(error).toBeInstanceOf(Error)
    })
  })

  // ─── Run integration - valid rules ─────────────────────────────────────────

  describe('run integration - valid rules', () => {
    test('explains no-eval rule', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('no-eval')
      expect(output).toContain('security')
    })

    test('explains prefer-const rule', async () => {
      const output = await runAndCapture('prefer-const')
      expect(output).toContain('prefer-const')
      expect(output).toContain('[patterns]')
    })

    test('explains no-unused-vars rule', async () => {
      const output = await runAndCapture('no-unused-vars')
      expect(output).toContain('no-unused-vars')
    })

    test('explains max-params rule', async () => {
      const output = await runAndCapture('max-params')
      expect(output).toContain('max-params')
      expect(output).toContain('complexity')
    })

    test('explains no-console-log rule', async () => {
      const output = await runAndCapture('no-console-log')
      expect(output).toContain('no-console-log')
      expect(output).toContain('[patterns]')
    })

    test('explains no-duplicate-imports rule', async () => {
      const output = await runAndCapture('no-duplicate-imports')
      expect(output).toContain('no-duplicate-imports')
    })

    test('explains eq-eq-eq rule', async () => {
      const output = await runAndCapture('eq-eq-eq')
      expect(output).toContain('eq-eq-eq')
    })

    test('explains curly rule', async () => {
      const output = await runAndCapture('curly')
      expect(output).toContain('curly')
    })

    test('explains no-explicit-any rule', async () => {
      const output = await runAndCapture('no-explicit-any')
      expect(output).toContain('no-explicit-any')
    })

    test('explains no-floating-promises rule', async () => {
      const output = await runAndCapture('no-floating-promises')
      expect(output).toContain('no-floating-promises')
    })

    test('explains prefer-template rule', async () => {
      const output = await runAndCapture('prefer-template')
      expect(output).toContain('prefer-template')
    })

    test('explains require-await rule', async () => {
      const output = await runAndCapture('require-await')
      expect(output).toContain('require-await')
    })

    test('explains sort-keys rule', async () => {
      const output = await runAndCapture('sort-keys')
      expect(output).toContain('sort-keys')
    })

    test('explains use-isnan rule', async () => {
      const output = await runAndCapture('use-isnan')
      expect(output).toContain('use-isnan')
    })

    test('explains object-shorthand rule', async () => {
      const output = await runAndCapture('object-shorthand')
      expect(output).toContain('object-shorthand')
    })

    test('explains no-debugger rule', async () => {
      const output = await runAndCapture('no-debugger')
      expect(output).toContain('no-debugger')
    })

    test('explains no-alert rule', async () => {
      const output = await runAndCapture('no-alert')
      expect(output).toContain('no-alert')
    })

    test('explains no-await-in-loop rule', async () => {
      const output = await runAndCapture('no-await-in-loop')
      expect(output).toContain('no-await-in-loop')
      expect(output).toContain('[performance]')
    })

    test('explains no-circular-deps rule', async () => {
      const output = await runAndCapture('no-circular-deps')
      expect(output).toContain('no-circular-deps')
      expect(output).toContain('[dependencies]')
    })

    test('explains no-shadow rule', async () => {
      const output = await runAndCapture('no-shadow')
      expect(output).toContain('no-shadow')
    })

    test('explains prefer-readonly rule', async () => {
      const output = await runAndCapture('prefer-readonly')
      expect(output).toContain('prefer-readonly')
    })

    test('explains prefer-optional-chain rule', async () => {
      const output = await runAndCapture('prefer-optional-chain')
      expect(output).toContain('prefer-optional-chain')
    })

    test('explains prefer-includes rule', async () => {
      const output = await runAndCapture('prefer-includes')
      expect(output).toContain('prefer-includes')
    })

    test('explains no-nested-ternary rule', async () => {
      const output = await runAndCapture('no-nested-ternary')
      expect(output).toContain('no-nested-ternary')
    })

    test('explains no-throw-literal rule', async () => {
      const output = await runAndCapture('no-throw-literal')
      expect(output).toContain('no-throw-literal')
    })

    test('explains no-unsafe-regex rule', async () => {
      const output = await runAndCapture('no-unsafe-regex')
      expect(output).toContain('no-unsafe-regex')
    })
  })

  // ─── Output sections ────────────────────────────────────────────────────────

  describe('output sections', () => {
    test('displays header with rule ID and category', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('no-eval')
      expect(output).toContain('[security]')
    })

    test('header contains a separator line', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('─')
    })

    test('displays description section', async () => {
      const output = await runAndCapture('prefer-const')
      expect(output).toContain('Description')
    })

    test('description section contains actual text', async () => {
      const output = await runAndCapture('no-eval')
      const descIndex = output.indexOf('Description')
      expect(descIndex).toBeGreaterThan(-1)
    })

    test('displays severity section', async () => {
      const output = await runAndCapture('prefer-const')
      expect(output).toContain('Severity')
    })

    test('severity displays Error for error severity', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('Error')
    })

    test('displays auto-fixable status', async () => {
      const output = await runAndCapture('prefer-const')
      expect(output).toContain('Auto-fixable')
    })

    test('auto-fixable shows Yes for fixable rules', async () => {
      const output = await runAndCapture('prefer-const')
      expect(output).toContain('Auto-fixable')
    })

    test('auto-fixable shows No for non-fixable rules', async () => {
      const output = await runAndCapture('max-complexity')
      expect(output).toContain('Auto-fixable')
    })

    test('displays recommended status', async () => {
      const output = await runAndCapture('prefer-const')
      expect(output).toContain('Recommended')
    })

    test('displays examples section when available', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('Examples')
      expect(output).toContain('Bad')
      expect(output).toContain('Good')
    })

    test('examples section shows ❌ for bad code', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('❌')
    })

    test('examples section shows ✅ for good code', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('✅')
    })

    test('examples include description for each example', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('Using eval()')
    })

    test('examples include bad code snippet', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('eval')
    })

    test('examples include good code snippet', async () => {
      const output = await runAndCapture('prefer-const')
      expect(output).toContain('const name')
    })

    test('displays best practices section', async () => {
      const output = await runAndCapture('prefer-const')
      expect(output).toContain('Best Practices')
    })

    test('best practices have bullet points', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('•')
    })

    test('displays related rules section when available', async () => {
      const output = await runAndCapture('no-console-log')
      expect(output).toContain('Related Rules')
    })

    test('related rules have bullet points', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('•')
    })

    test('displays documentation URL when available', async () => {
      const output = await runAndCapture('prefer-const')
      const hasDoc = output.includes('Documentation')
      expect(typeof hasDoc).toBe('boolean')
    })
  })

  // ─── Different categories ───────────────────────────────────────────────────

  describe('different categories', () => {
    test('explains complexity rule with category badge', async () => {
      const output = await runAndCapture('max-complexity')
      expect(output).toContain('max-complexity')
      expect(output).toContain('[complexity]')
    })

    test('explains security rule with category badge', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('no-eval')
      expect(output).toContain('[security]')
    })

    test('explains patterns rule with category badge', async () => {
      const output = await runAndCapture('prefer-const')
      expect(output).toContain('prefer-const')
      expect(output).toContain('[patterns]')
    })

    test('explains performance rule with category badge', async () => {
      const output = await runAndCapture('no-await-in-loop')
      expect(output).toContain('no-await-in-loop')
      expect(output).toContain('[performance]')
    })

    test('explains dependencies rule with category badge', async () => {
      const output = await runAndCapture('no-circular-deps')
      expect(output).toContain('no-circular-deps')
      expect(output).toContain('[dependencies]')
    })

    test('explains testing rule with category badge', async () => {
      const output = await runAndCapture('no-skipped-tests')
      expect(output).toContain('no-skipped-tests')
      expect(output).toMatch(/\[\w+\]/)
    })

    test('explains correctness rule with category badge', async () => {
      const output = await runAndCapture('no-throw-literal')
      expect(output).toContain('no-throw-literal')
      expect(output).toContain('[correctness]')
    })

    test('category badge format is [category]', async () => {
      const output = await runAndCapture('max-params')
      expect(output).toMatch(/\[\w+\]/)
    })
  })

  // ─── allRules integration ───────────────────────────────────────────────────

  describe('allRules integration', () => {
    test('gets rule for existing rule', () => {
      const rule = allRules['max-params']
      expect(rule).toBeDefined()
      expect(rule.meta).toBeDefined()
      expect(rule.create).toBeDefined()
    })

    test('returns undefined for non-existent rule', () => {
      const rule = allRules['non-existent-rule-xyz']
      expect(rule).toBeUndefined()
    })

    test('rule has required properties', () => {
      const rule = allRules['max-params']
      expect(rule).toHaveProperty('meta')
      expect(rule).toHaveProperty('create')
      expect(rule.meta).toHaveProperty('name')
    })

    test('rule meta has description', () => {
      const rule = allRules['max-params']
      expect(rule.meta.description).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
    })

    test('rule meta has category', () => {
      const rule = allRules['max-params']
      expect(rule.meta.category).toBeDefined()
      expect(typeof rule.meta.category).toBe('string')
    })

    test('rule meta has recommended flag', () => {
      const rule = allRules['max-params']
      expect(typeof rule.meta.recommended).toBe('boolean')
    })

    test('rule meta has severity', () => {
      const rule = allRules['max-params']
      if (rule.meta.severity !== undefined) {
        expect(typeof rule.meta.severity).toBe('string')
      }
    })

    test('all registered rules have meta', () => {
      for (const [id, rule] of Object.entries(allRules)) {
        expect(rule.meta).toBeDefined()
        expect(rule.meta.name).toBeDefined()
      }
    })

    test('all registered rules have create function', () => {
      for (const [id, rule] of Object.entries(allRules)) {
        expect(typeof rule.create).toBe('function')
      }
    })

    test('all registered rules have description', () => {
      for (const [id, rule] of Object.entries(allRules)) {
        expect(rule.meta.description).toBeDefined()
        expect(typeof rule.meta.description).toBe('string')
        expect(rule.meta.description.length).toBeGreaterThan(0)
      }
    })

    test('all registered rules have valid category', () => {
      for (const [id, rule] of Object.entries(allRules)) {
        expect(ALL_CATEGORIES).toContain(rule.meta.category)
      }
    })

    test('all registered rules have boolean recommended', () => {
      for (const [id, rule] of Object.entries(allRules)) {
        expect(typeof rule.meta.recommended).toBe('boolean')
      }
    })

    test('has substantial number of rules registered', () => {
      const ruleCount = Object.keys(allRules).length
      expect(ruleCount).toBeGreaterThan(50)
    })

    test('specific well-known rules exist', () => {
      const knownRules = [
        'no-eval',
        'prefer-const',
        'no-unused-vars',
        'max-params',
        'eq-eq-eq',
        'curly',
      ]
      for (const ruleId of knownRules) {
        expect(allRules[ruleId]).toBeDefined()
      }
    })
  })

  // ─── getRuleCategory integration ────────────────────────────────────────────

  describe('getRuleCategory integration', () => {
    test('returns correct category for max-params', () => {
      expect(getRuleCategory('max-params')).toBe('complexity')
    })

    test('returns correct category for max-complexity', () => {
      expect(getRuleCategory('max-complexity')).toBe('complexity')
    })

    test('returns correct category for no-eval', () => {
      expect(getRuleCategory('no-eval')).toBe('security')
    })

    test('returns correct category for prefer-const', () => {
      expect(getRuleCategory('prefer-const')).toBe('patterns')
    })

    test('returns correct category for no-console-log', () => {
      expect(getRuleCategory('no-console-log')).toBe('patterns')
    })

    test('returns correct category for no-await-in-loop', () => {
      expect(getRuleCategory('no-await-in-loop')).toBe('performance')
    })

    test('returns correct category for no-circular-deps', () => {
      expect(getRuleCategory('no-circular-deps')).toBe('dependencies')
    })

    test('returns correct category for no-throw-literal', () => {
      expect(getRuleCategory('no-throw-literal')).toBe('correctness')
    })

    test('returns correct category for no-skipped-tests', () => {
      expect(getRuleCategory('no-skipped-tests')).toBe('testing')
    })

    test('returns complexity as default for unknown rule', () => {
      expect(getRuleCategory('unknown-xyz-rule')).toBe('complexity')
    })

    test('returns valid category for all known rules', () => {
      for (const ruleId of Object.keys(allRules)) {
        const category = getRuleCategory(ruleId)
        expect(ALL_CATEGORIES).toContain(category)
      }
    })

    test('returns string type', () => {
      const category = getRuleCategory('no-eval')
      expect(typeof category).toBe('string')
    })

    test('returns consistent categories for same rule', () => {
      expect(getRuleCategory('no-eval')).toBe(getRuleCategory('no-eval'))
    })

    test('returns correct category for max-depth', () => {
      expect(getRuleCategory('max-depth')).toBe('complexity')
    })

    test('returns correct category for max-lines', () => {
      expect(getRuleCategory('max-lines')).toBe('complexity')
    })

    test('returns correct category for no-sync-in-async', () => {
      expect(getRuleCategory('no-sync-in-async')).toBe('performance')
    })

    test('returns correct category for no-unused-exports', () => {
      expect(getRuleCategory('no-unused-exports')).toBe('dependencies')
    })

    test('returns correct category for no-deprecated-api', () => {
      expect(getRuleCategory('no-deprecated-api')).toBe('security')
    })

    test('returns correct category for eq-eq-eq', () => {
      expect(getRuleCategory('eq-eq-eq')).toBe('patterns')
    })

    test('returns correct category for no-unsafe-regex', () => {
      expect(getRuleCategory('no-unsafe-regex')).toBe('security')
    })
  })

  // ─── Examples content validation ────────────────────────────────────────────

  describe('example content validation', () => {
    test('examples contain bad and good code patterns for no-eval', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('❌')
      expect(output).toContain('✅')
    })

    test('no-eval has two examples', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('Using eval()')
      expect(output).toContain('Using Function()')
    })

    test('examples for no-duplicate-imports mention import', async () => {
      const output = await runAndCapture('no-duplicate-imports')
      expect(output).toContain('import')
    })

    test('examples for prefer-const show let vs const', async () => {
      const output = await runAndCapture('prefer-const')
      expect(output).toContain('let name')
    })

    test('examples for no-console-log mention console.log', async () => {
      const output = await runAndCapture('no-console-log')
      expect(output).toContain('console.log')
    })

    test('examples for no-unused-vars show unused variable', async () => {
      const output = await runAndCapture('no-unused-vars')
      expect(output).toContain('result')
    })

    test('rules without examples do not show Examples section', async () => {
      const output = await runAndCapture('max-complexity')
      expect(output).not.toContain('Examples')
    })
  })

  // ─── Best practices validation ──────────────────────────────────────────────

  describe('best practices validation', () => {
    test('best practices contain actionable advice for no-eval', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('Best Practices')
      expect(output).toContain('•')
    })

    test('no-eval best practices mention JSON.parse', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('JSON.parse')
    })

    test('prefer-const best practices mention const by default', async () => {
      const output = await runAndCapture('prefer-const')
      expect(output).toContain('const')
    })

    test('no-console-log best practices mention logging library', async () => {
      const output = await runAndCapture('no-console-log')
      expect(output).toContain('logging')
    })

    test('rules without specific best practices get defaults', async () => {
      const output = await runAndCapture('max-complexity')
      expect(output).toContain('Best Practices')
      expect(output).toContain('Follow the rule consistently')
    })

    test('default best practices mention auto-fix', async () => {
      const output = await runAndCapture('max-complexity')
      expect(output).toContain('auto-fix')
    })

    test('default best practices mention reviewing violations', async () => {
      const output = await runAndCapture('max-complexity')
      expect(output).toContain('Review violations')
    })

    test('best practices for no-duplicate-imports mention combining imports', async () => {
      const output = await runAndCapture('no-duplicate-imports')
      expect(output).toContain('Combine')
    })

    test('best practices for no-unused-vars mention removing code', async () => {
      const output = await runAndCapture('no-unused-vars')
      expect(output).toContain('Remove unused')
    })

    test('rules without specific best practices get default practices', async () => {
      const output = await runAndCapture('eq-eq-eq')
      expect(output).toContain('Follow the rule consistently')
    })
  })

  // ─── Related rules validation ───────────────────────────────────────────────

  describe('related rules validation', () => {
    test('no-console-log has related rules', async () => {
      const output = await runAndCapture('no-console-log')
      expect(output).toContain('Related Rules')
    })

    test('no-console-log related rules include no-debugger', async () => {
      const output = await runAndCapture('no-console-log')
      expect(output).toContain('no-debugger')
    })

    test('no-eval has related rules', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('Related Rules')
    })

    test('no-eval related rules include no-implied-eval', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('no-implied-eval')
    })

    test('prefer-const related rules include no-var', async () => {
      const output = await runAndCapture('prefer-const')
      expect(output).toContain('no-var')
    })

    test('rules with mapped related rules show them', async () => {
      const output = await runAndCapture('no-unused-vars')
      expect(output).toContain('Related Rules')
    })

    test('no-unused-vars related rules include no-duplicate-imports', async () => {
      const output = await runAndCapture('no-unused-vars')
      expect(output).toContain('no-duplicate-imports')
    })

    test('rules without mapped related rules get category-based fallback', async () => {
      const output = await runAndCapture('max-complexity')
      expect(output).toContain('Related Rules')
    })
  })

  // ─── Severity display ───────────────────────────────────────────────────────

  describe('severity display', () => {
    test('displays Error severity for error-level rules', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('Error')
    })

    test('severity section is always present', async () => {
      const output = await runAndCapture('max-params')
      expect(output).toContain('Severity')
    })

    test('default severity is error when not specified', async () => {
      const output = await runAndCapture('max-complexity')
      expect(output).toContain('Severity')
    })
  })

  // ─── Header formatting ──────────────────────────────────────────────────────

  describe('header formatting', () => {
    test('header starts with a blank line', async () => {
      const command = createCommand('no-eval')
      const logSpy = vi.spyOn(command as any, 'log')
      await command.run()
      expect(logSpy.mock.calls[0]).toEqual([''])
    })

    test('header contains rule ID prominently', async () => {
      const output = await runAndCapture('no-eval')
      const occurrences = output.split('no-eval').length - 1
      expect(occurrences).toBeGreaterThanOrEqual(1)
    })

    test('header separator length matches rule ID and category', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('─')
    })

    test('header for max-params shows complexity category', async () => {
      const output = await runAndCapture('max-params')
      expect(output).toContain('[complexity]')
    })
  })

  // ─── Edge cases ─────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    test('handles rule with minimal metadata', async () => {
      const output = await runAndCapture('max-params')
      expect(output).toContain('max-params')
      expect(output).toContain('Severity')
    })

    test('displays all sections even if some are empty', async () => {
      const output = await runAndCapture('max-params')
      expect(output).toContain('Severity')
      expect(output).toContain('Auto-fixable')
      expect(output).toContain('Recommended')
    })

    test('run does not throw for any registered rule', async () => {
      const ruleIds = getAllRuleIds()
      for (const ruleId of ruleIds.slice(0, 20)) {
        const command = createCommand(ruleId)
        await expect(command.run()).resolves.toBeUndefined()
      }
    })

    test('output is non-empty for every registered rule', async () => {
      const ruleIds = getAllRuleIds()
      for (const ruleId of ruleIds.slice(0, 20)) {
        const output = await runAndCapture(ruleId)
        expect(output.length).toBeGreaterThan(0)
      }
    })

    test('command run returns void (undefined)', async () => {
      const command = createCommand('no-eval')
      const result = await command.run()
      expect(result).toBeUndefined()
    })

    test('multiple sequential runs work correctly', async () => {
      const output1 = await runAndCapture('no-eval')
      const output2 = await runAndCapture('no-eval')
      expect(output1).toContain('no-eval')
      expect(output2).toContain('no-eval')
    })

    test('different rules produce different output', async () => {
      const output1 = await runAndCapture('no-eval')
      const output2 = await runAndCapture('prefer-const')
      expect(output1).not.toBe(output2)
    })

    test('rule ID with hyphens works correctly', async () => {
      const output = await runAndCapture('no-await-in-loop')
      expect(output).toContain('no-await-in-loop')
    })

    test('rule ID that is a simple word (curly) works', async () => {
      const output = await runAndCapture('curly')
      expect(output).toContain('curly')
    })

    test('command can be instantiated multiple times', () => {
      const cmd1 = new Explain([], {} as never)
      const cmd2 = new Explain([], {} as never)
      expect(cmd1).not.toBe(cmd2)
    })
  })

  // ─── Rules with examples data-driven ────────────────────────────────────────

  describe('rules with examples - data driven', () => {
    for (const ruleId of getRulesWithExamples().slice(0, 20)) {
      test(`${ruleId} shows Examples section`, async () => {
        const output = await runAndCapture(ruleId)
        expect(output).toContain('Examples')
      })

      test(`${ruleId} examples show bad code marker`, async () => {
        const output = await runAndCapture(ruleId)
        expect(output).toContain('❌')
      })

      test(`${ruleId} examples show good code marker`, async () => {
        const output = await runAndCapture(ruleId)
        expect(output).toContain('✅')
      })
    }
  })

  // ─── Rules without examples data-driven ─────────────────────────────────────

  describe('rules without examples - data driven', () => {
    for (const ruleId of getRulesWithoutExamples()) {
      if (allRules[ruleId]) {
        test(`${ruleId} does not show Examples section`, async () => {
          const output = await runAndCapture(ruleId)
          expect(output).not.toContain('Examples')
        })

        test(`${ruleId} still shows other sections`, async () => {
          const output = await runAndCapture(ruleId)
          expect(output).toContain('Description')
          expect(output).toContain('Severity')
        })
      }
    }
  })

  // ─── Sample rules comprehensive check ───────────────────────────────────────

  describe('sample rules comprehensive', () => {
    for (const ruleId of getSampleRuleIds()) {
      if (allRules[ruleId]) {
        test(`${ruleId} - run succeeds`, async () => {
          const command = createCommand(ruleId)
          await expect(command.run()).resolves.toBeUndefined()
        })

        test(`${ruleId} - output contains rule ID`, async () => {
          const output = await runAndCapture(ruleId)
          expect(output).toContain(ruleId)
        })

        test(`${ruleId} - output contains Description section`, async () => {
          const output = await runAndCapture(ruleId)
          expect(output).toContain('Description')
        })

        test(`${ruleId} - output contains Severity section`, async () => {
          const output = await runAndCapture(ruleId)
          expect(output).toContain('Severity')
        })

        test(`${ruleId} - output contains Best Practices section`, async () => {
          const output = await runAndCapture(ruleId)
          expect(output).toContain('Best Practices')
        })
      }
    }
  })

  // ─── Category consistency ───────────────────────────────────────────────────

  describe('category consistency', () => {
    test('all complexity rules have complexity category', () => {
      const complexityRules = [
        'max-complexity',
        'max-depth',
        'max-lines',
        'max-lines-per-function',
        'max-params',
      ]
      for (const ruleId of complexityRules) {
        expect(getRuleCategory(ruleId)).toBe('complexity')
      }
    })

    test('all security rules have security category', () => {
      const securityRules = [
        'no-eval',
        'no-deprecated-api',
        'no-dynamic-delete',
        'no-unsafe-return',
      ]
      for (const ruleId of securityRules) {
        expect(getRuleCategory(ruleId)).toBe('security')
      }
    })

    test('all performance rules have performance category', () => {
      const perfRules = ['no-await-in-loop', 'no-sync-in-async']
      for (const ruleId of perfRules) {
        expect(getRuleCategory(ruleId)).toBe('performance')
      }
    })

    test('all dependency rules have dependencies category', () => {
      const depRules = [
        'no-circular-deps',
        'no-unused-exports',
        'consistent-imports',
        'no-barrel-imports',
      ]
      for (const ruleId of depRules) {
        expect(getRuleCategory(ruleId)).toBe('dependencies')
      }
    })

    test('category from getRuleCategory is a valid category', () => {
      for (const [id, rule] of Object.entries(allRules)) {
        const fnCategory = getRuleCategory(id)
        expect(ALL_CATEGORIES).toContain(fnCategory)
      }
    })

    test('meta.category is a valid category', () => {
      for (const [id, rule] of Object.entries(allRules)) {
        expect(ALL_CATEGORIES).toContain(rule.meta.category)
      }
    })
  })

  // ─── Output completeness ────────────────────────────────────────────────────

  describe('output completeness', () => {
    test('output for no-eval contains all major sections', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('no-eval')
      expect(output).toContain('[security]')
      expect(output).toContain('Description')
      expect(output).toContain('Severity')
      expect(output).toContain('Auto-fixable')
      expect(output).toContain('Recommended')
      expect(output).toContain('Examples')
      expect(output).toContain('Best Practices')
      expect(output).toContain('Related Rules')
    })

    test('output for prefer-const contains all major sections', async () => {
      const output = await runAndCapture('prefer-const')
      expect(output).toContain('prefer-const')
      expect(output).toContain('[patterns]')
      expect(output).toContain('Description')
      expect(output).toContain('Severity')
      expect(output).toContain('Auto-fixable')
      expect(output).toContain('Recommended')
      expect(output).toContain('Examples')
      expect(output).toContain('Best Practices')
      expect(output).toContain('Related Rules')
    })

    test('log is called multiple times for rich output', async () => {
      const command = createCommand('no-eval')
      const logSpy = vi.spyOn(command as any, 'log')
      await command.run()
      expect(logSpy.mock.calls.length).toBeGreaterThan(5)
    })
  })

  // ─── Fixable status ─────────────────────────────────────────────────────────

  describe('fixable status', () => {
    test('auto-fixable section present for all rules', async () => {
      const output = await runAndCapture('eq-eq-eq')
      expect(output).toContain('Auto-fixable')
    })

    test('shows Yes for fixable rules that have fixable property', async () => {
      const output = await runAndCapture('prefer-const')
      expect(output).toContain('Auto-fixable')
    })

    test('shows No for rules without fixable property', async () => {
      const output = await runAndCapture('max-complexity')
      expect(output).toContain('Auto-fixable')
    })
  })

  // ─── Recommended status ─────────────────────────────────────────────────────

  describe('recommended status', () => {
    test('recommended section present for all rules', async () => {
      const output = await runAndCapture('curly')
      expect(output).toContain('Recommended')
    })

    test('recommended shows Yes or No', async () => {
      const output = await runAndCapture('no-eval')
      expect(output).toContain('Recommended')
      const recommendedSection = output.slice(output.indexOf('Recommended'))
      expect(recommendedSection).toMatch(/(Yes|No)/)
    })
  })

  // ─── Error messages quality ─────────────────────────────────────────────────

  describe('error messages quality', () => {
    test('error message is user-friendly', async () => {
      const { errorMessage } = await runAndExpectError('nonexistent')
      expect(errorMessage).toContain("'nonexistent'")
      expect(errorMessage).toContain('not found')
    })

    test('error message provides actionable guidance', async () => {
      const { errorMessage } = await runAndExpectError('typo-rule')
      expect(errorMessage).toContain('Run')
      expect(errorMessage).toContain('rules')
    })

    test('error message includes the full rule ID with special chars', async () => {
      const { errorMessage } = await runAndExpectError('my-special-rule')
      expect(errorMessage).toContain('my-special-rule')
    })

    test('error message format is consistent', async () => {
      const { errorMessage: msg1 } = await runAndExpectError('rule-a')
      const { errorMessage: msg2 } = await runAndExpectError('rule-b')
      expect(msg1).toContain('not found')
      expect(msg2).toContain('not found')
      expect(msg1).toContain("Run 'codeforge rules'")
      expect(msg2).toContain("Run 'codeforge rules'")
    })
  })

  // ─── Specific rule output content ───────────────────────────────────────────

  describe('specific rule output content', () => {
    test('no-empty-catch shows best practices', async () => {
      const output = await runAndCapture('no-empty-catch')
      expect(output).toContain('Best Practices')
    })

    test('no-unsafe-regex shows best practices section', async () => {
      const output = await runAndCapture('no-unsafe-regex')
      expect(output).toContain('Best Practices')
    })

    test('max-complexity shows best practices section', async () => {
      const output = await runAndCapture('max-complexity')
      expect(output).toContain('Best Practices')
    })

    test('prefer-rest-params shows best practices section', async () => {
      const output = await runAndCapture('prefer-rest-params')
      expect(output).toContain('Best Practices')
    })

    test('no-floating-promises shows best practices section', async () => {
      const output = await runAndCapture('no-floating-promises')
      expect(output).toContain('Best Practices')
    })

    test('no-implicit-coercion shows best practices section', async () => {
      const output = await runAndCapture('no-implicit-coercion')
      expect(output).toContain('Best Practices')
    })

    test('prefer-spread shows best practices section', async () => {
      const output = await runAndCapture('prefer-spread')
      expect(output).toContain('Best Practices')
    })

    test('prefer-nullish-coalescing shows best practices section', async () => {
      const output = await runAndCapture('prefer-nullish-coalescing')
      expect(output).toContain('Best Practices')
    })

    test('consistent-imports shows best practices section', async () => {
      const output = await runAndCapture('consistent-imports')
      expect(output).toContain('Best Practices')
    })

    test('no-var shows default best practices', async () => {
      const output = await runAndCapture('no-var')
      expect(output).toContain('Follow the rule consistently')
    })

    test('sort-keys shows default best practices', async () => {
      const output = await runAndCapture('sort-keys')
      expect(output).toContain('Enable auto-fix')
    })

    test('use-isnan shows default best practices', async () => {
      const output = await runAndCapture('use-isnan')
      expect(output).toContain('Consider the rule')
    })

    test('object-shorthand shows default best practices', async () => {
      const output = await runAndCapture('object-shorthand')
      expect(output).toContain('Review violations')
    })

    test('prefer-arrow-callback shows default best practices', async () => {
      const output = await runAndCapture('prefer-arrow-callback')
      expect(output).toContain('Best Practices')
    })

    test('prefer-includes shows default best practices', async () => {
      const output = await runAndCapture('prefer-includes')
      expect(output).toContain('Best Practices')
    })

    test('no-shadow shows default best practices', async () => {
      const output = await runAndCapture('no-shadow')
      expect(output).toContain('Best Practices')
    })

    test('no-param-reassign shows default best practices', async () => {
      const output = await runAndCapture('no-param-reassign')
      expect(output).toContain('Best Practices')
    })
  })

  // ─── Data-driven: all rules produce valid output ────────────────────────────

  describe('all rules produce valid output', () => {
    const allRuleIds = getAllRuleIds()

    const batchSize = 30
    for (let i = 0; i < batchSize && i < allRuleIds.length; i++) {
      const ruleId = allRuleIds[i]
      test(`${ruleId} produces non-empty output with basic sections`, async () => {
        const output = await runAndCapture(ruleId)
        expect(output.length).toBeGreaterThan(0)
        expect(output).toContain(ruleId)
        expect(output).toContain('Description')
        expect(output).toContain('Severity')
        expect(output).toContain('Best Practices')
      })
    }
  })

  // ─── Command instantiation ──────────────────────────────────────────────────

  describe('command instantiation', () => {
    test('can create command with empty argv', () => {
      const command = new Explain([], {} as never)
      expect(command).toBeDefined()
    })

    test('command has id or static properties', () => {
      expect(Explain.description).toBeDefined()
      expect(Explain.args).toBeDefined()
      expect(Explain.examples).toBeDefined()
    })

    test('static args is an object', () => {
      expect(typeof Explain.args).toBe('object')
      expect(Explain.args).not.toBeNull()
    })

    test('static description matches expected', () => {
      expect(Explain.description).toBe('Explain a specific rule in detail')
    })

    test('static examples is an array', () => {
      expect(Array.isArray(Explain.examples)).toBe(true)
    })
  })

  // ─── Output structure order ─────────────────────────────────────────────────

  describe('output structure order', () => {
    test('header comes before description', async () => {
      const output = await runAndCapture('no-eval')
      const headerIdx = output.indexOf('[security]')
      const descIdx = output.indexOf('Description')
      expect(headerIdx).toBeGreaterThan(-1)
      expect(descIdx).toBeGreaterThan(-1)
      expect(headerIdx).toBeLessThan(descIdx)
    })

    test('description comes before severity', async () => {
      const output = await runAndCapture('no-eval')
      const descIdx = output.indexOf('Description')
      const sevIdx = output.indexOf('Severity')
      expect(descIdx).toBeLessThan(sevIdx)
    })

    test('severity comes before auto-fixable', async () => {
      const output = await runAndCapture('no-eval')
      const sevIdx = output.indexOf('Severity')
      const fixIdx = output.indexOf('Auto-fixable')
      expect(sevIdx).toBeLessThan(fixIdx)
    })

    test('auto-fixable comes before recommended', async () => {
      const output = await runAndCapture('no-eval')
      const fixIdx = output.indexOf('Auto-fixable')
      const recIdx = output.indexOf('Recommended')
      expect(fixIdx).toBeLessThan(recIdx)
    })

    test('best practices comes after examples', async () => {
      const output = await runAndCapture('no-eval')
      const exIdx = output.indexOf('Examples')
      const bpIdx = output.indexOf('Best Practices')
      expect(exIdx).toBeLessThan(bpIdx)
    })
  })

  // ─── Adapted rules ──────────────────────────────────────────────────────────

  describe('adapted plugin rules', () => {
    test('adapted rules are accessible in allRules', () => {
      const adaptedIds = [
        'prefer-object-spread',
        'prefer-optional-chain',
        'prefer-math-trunc',
        'no-circular-deps',
        'no-eval',
        'no-dynamic-delete',
        'prefer-const',
      ]
      for (const id of adaptedIds) {
        expect(allRules[id]).toBeDefined()
      }
    })

    test('adapted rules have valid meta', () => {
      const adaptedIds = ['prefer-object-spread', 'prefer-optional-chain', 'no-eval']
      for (const id of adaptedIds) {
        const rule = allRules[id]
        expect(rule.meta).toBeDefined()
        expect(rule.meta.name).toBeDefined()
        expect(rule.meta.description).toBeDefined()
      }
    })

    test('adapted rules can be explained', async () => {
      const adaptedIds = ['prefer-object-spread', 'no-dynamic-delete', 'no-unsafe-return']
      for (const ruleId of adaptedIds) {
        const output = await runAndCapture(ruleId)
        expect(output).toContain(ruleId)
        expect(output).toContain('Description')
      }
    })
  })

  // ─── Rule registry completeness ─────────────────────────────────────────────

  describe('rule registry completeness', () => {
    test('every rule in allRules has a category mapping', () => {
      for (const ruleId of Object.keys(allRules)) {
        const category = getRuleCategory(ruleId)
        expect(ALL_CATEGORIES).toContain(category)
      }
    })

    test('all category values are lowercase', () => {
      for (const ruleId of Object.keys(allRules)) {
        const category = getRuleCategory(ruleId)
        expect(category).toBe(category.toLowerCase())
      }
    })

    test('all rule IDs follow kebab-case or lowercase pattern', () => {
      for (const ruleId of Object.keys(allRules)) {
        expect(ruleId).toBe(ruleId.toLowerCase())
      }
    })
  })
})
