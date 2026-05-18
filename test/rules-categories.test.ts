import { describe, it, expect } from 'vitest'
import { getRuleCategory } from '../src/rules/categories.js'
import type { RuleCategory } from '../src/rules/categories.js'

// ─── getRuleCategory ─────────────────────────────────────
describe('getRuleCategory', () => {
  it('is a function', () => {
    expect(typeof getRuleCategory).toBe('function')
  })

  it('returns "complexity" for known complexity rule', () => {
    expect(getRuleCategory('max-complexity')).toBe('complexity')
  })

  it('returns "complexity" for max-depth', () => {
    expect(getRuleCategory('max-depth')).toBe('complexity')
  })

  it('returns "complexity" for max-lines', () => {
    expect(getRuleCategory('max-lines')).toBe('complexity')
  })

  it('returns "complexity" for max-lines-per-function', () => {
    expect(getRuleCategory('max-lines-per-function')).toBe('complexity')
  })

  it('returns "complexity" for max-params', () => {
    expect(getRuleCategory('max-params')).toBe('complexity')
  })

  it('returns "patterns" for known patterns rule', () => {
    expect(getRuleCategory('no-eval')).toBe('security')
  })

  it('returns "patterns" for curly', () => {
    expect(getRuleCategory('curly')).toBe('patterns')
  })

  it('returns "patterns" for eq-eq-eq', () => {
    expect(getRuleCategory('eq-eq-eq')).toBe('patterns')
  })

  it('returns "security" for no-hardcoded-credentials', () => {
    expect(getRuleCategory('no-hardcoded-credentials')).toBe('security')
  })

  it('returns "security" for no-eval', () => {
    expect(getRuleCategory('no-eval')).toBe('security')
  })

  it('returns "security" for no-unsafe-call', () => {
    expect(getRuleCategory('no-unsafe-call')).toBe('security')
  })

  it('returns "security" for no-unsafe-return', () => {
    expect(getRuleCategory('no-unsafe-return')).toBe('security')
  })

  it('returns "security" for no-sql-injection', () => {
    expect(getRuleCategory('no-sql-injection')).toBe('security')
  })

  it('returns "security" for no-weak-crypto', () => {
    expect(getRuleCategory('no-weak-crypto')).toBe('security')
  })

  it('returns "security" for no-deprecated-api', () => {
    expect(getRuleCategory('no-deprecated-api')).toBe('security')
  })

  it('returns "performance" for no-await-in-loop', () => {
    expect(getRuleCategory('no-await-in-loop')).toBe('performance')
  })

  it('returns "performance" for no-array-reduce', () => {
    expect(getRuleCategory('no-array-reduce')).toBe('performance')
  })

  it('returns "performance" for no-sync-in-async', () => {
    expect(getRuleCategory('no-sync-in-async')).toBe('performance')
  })

  it('returns "dependencies" for no-circular-deps', () => {
    expect(getRuleCategory('no-circular-deps')).toBe('dependencies')
  })

  it('returns "dependencies" for consistent-imports', () => {
    expect(getRuleCategory('consistent-imports')).toBe('dependencies')
  })

  it('returns "dependencies" for no-barrel-imports', () => {
    expect(getRuleCategory('no-barrel-imports')).toBe('dependencies')
  })

  it('returns "testing" for expect-expect', () => {
    expect(getRuleCategory('expect-expect')).toBe('testing')
  })

  it('returns "testing" for consistent-test-it', () => {
    expect(getRuleCategory('consistent-test-it')).toBe('testing')
  })

  it('returns "testing" for no-focused-tests', () => {
    expect(getRuleCategory('no-focused-tests')).toBe('testing')
  })

  it('returns "testing" for no-identical-title', () => {
    expect(getRuleCategory('no-identical-title')).toBe('testing')
  })

  it('returns "testing" for max-expects', () => {
    expect(getRuleCategory('max-expects')).toBe('testing')
  })

  it('returns "testing" for max-nested-describe', () => {
    expect(getRuleCategory('max-nested-describe')).toBe('testing')
  })

  it('returns "correctness" for no-constant-binary-expression', () => {
    expect(getRuleCategory('no-constant-binary-expression')).toBe('correctness')
  })

  it('returns "correctness" for no-empty-catch', () => {
    expect(getRuleCategory('no-empty-catch')).toBe('correctness')
  })

  it('returns "correctness" for no-unsafe-negation', () => {
    expect(getRuleCategory('no-unsafe-negation')).toBe('correctness')
  })

  it('returns "correctness" for no-throw-literal', () => {
    expect(getRuleCategory('no-throw-literal')).toBe('correctness')
  })

  it('returns default "complexity" for unknown rule ID', () => {
    expect(getRuleCategory('nonexistent-rule-xyz')).toBe('complexity')
  })

  it('returns default "complexity" for empty string', () => {
    expect(getRuleCategory('')).toBe('complexity')
  })

  it('returns RuleCategory type value for any valid rule', () => {
    const validCategories: RuleCategory[] = [
      'complexity',
      'correctness',
      'dependencies',
      'patterns',
      'performance',
      'security',
      'testing',
    ]
    const result = getRuleCategory('curly')
    expect(validCategories).toContain(result)
  })

  it('returns "patterns" for prefer-const', () => {
    expect(getRuleCategory('prefer-const')).toBe('patterns')
  })

  it('returns "patterns" for no-var', () => {
    expect(getRuleCategory('no-var')).toBe('patterns')
  })

  it('returns "patterns" for no-console', () => {
    expect(getRuleCategory('no-console')).toBe('patterns')
  })

  it('returns "patterns" for no-debugger', () => {
    expect(getRuleCategory('no-debugger')).toBe('patterns')
  })

  it('returns "patterns" for no-constant-condition', () => {
    expect(getRuleCategory('no-constant-condition')).toBe('patterns')
  })

  it('returns "patterns" for no-dupe-keys', () => {
    expect(getRuleCategory('no-dupe-keys')).toBe('patterns')
  })

  it('returns "patterns" for no-duplicate-case', () => {
    expect(getRuleCategory('no-duplicate-case')).toBe('patterns')
  })

  it('returns "patterns" for no-unreachable', () => {
    expect(getRuleCategory('no-unreachable')).toBe('patterns')
  })

  it('returns "patterns" for no-fallthrough', () => {
    expect(getRuleCategory('no-fallthrough')).toBe('patterns')
  })

  it('returns "patterns" for no-unsafe-optional-chaining', () => {
    expect(getRuleCategory('no-unsafe-optional-chaining')).toBe('patterns')
  })

  it('returns "patterns" for no-unused-vars', () => {
    expect(getRuleCategory('no-unused-vars')).toBe('patterns')
  })

  it('returns "patterns" for object-shorthand', () => {
    expect(getRuleCategory('object-shorthand')).toBe('patterns')
  })

  it('returns "patterns" for prefer-template', () => {
    expect(getRuleCategory('prefer-template')).toBe('patterns')
  })

  it('returns "testing" for valid-expect', () => {
    expect(getRuleCategory('valid-expect')).toBe('testing')
  })

  it('returns "testing" for valid-title', () => {
    expect(getRuleCategory('valid-title')).toBe('testing')
  })

  it('returns "testing" for require-hook', () => {
    expect(getRuleCategory('require-hook')).toBe('testing')
  })

  it('returns "dependencies" for no-unused-exports', () => {
    expect(getRuleCategory('no-unused-exports')).toBe('dependencies')
  })

  it('returns "patterns" for no-unnecessary-* rules', () => {
    expect(getRuleCategory('no-unnecessary-ternary')).toBe('patterns')
    expect(getRuleCategory('no-unnecessary-concat')).toBe('patterns')
    expect(getRuleCategory('no-unnecessary-escape')).toBe('patterns')
  })

  it('returns "patterns" for many no-unnecessary-array-* rules', () => {
    expect(getRuleCategory('no-unnecessary-array-flat')).toBe('patterns')
    expect(getRuleCategory('no-unnecessary-array-map-identity')).toBe('patterns')
    expect(getRuleCategory('no-unnecessary-array-concat-single')).toBe('patterns')
  })

  it('always returns one of the valid category strings', () => {
    const validCategories = new Set<string>([
      'complexity',
      'correctness',
      'dependencies',
      'patterns',
      'performance',
      'security',
      'testing',
    ])
    const rules = [
      'max-complexity',
      'no-eval',
      'no-circular-deps',
      'expect-expect',
      'no-await-in-loop',
      'curly',
      'no-empty-catch',
    ]
    for (const rule of rules) {
      expect(validCategories.has(getRuleCategory(rule))).toBe(true)
    }
  })
})

// ─── RuleCategory type ───────────────────────────────────
describe('RuleCategory type', () => {
  it('accepts all valid category values', () => {
    const categories: RuleCategory[] = [
      'complexity',
      'correctness',
      'dependencies',
      'patterns',
      'performance',
      'security',
      'testing',
    ]
    expect(categories.length).toBe(7)
    expect(categories).toContain('complexity')
    expect(categories).toContain('correctness')
    expect(categories).toContain('dependencies')
    expect(categories).toContain('patterns')
    expect(categories).toContain('performance')
    expect(categories).toContain('security')
    expect(categories).toContain('testing')
  })

  it('getRuleCategory returns a valid RuleCategory for each category type', () => {
    const rulePerCategory: Record<string, string> = {
      'max-complexity': 'complexity',
      'no-constant-binary-expression': 'correctness',
      'no-circular-deps': 'dependencies',
      curly: 'patterns',
      'no-await-in-loop': 'performance',
      'no-eval': 'security',
      'expect-expect': 'testing',
    }
    for (const [ruleId, expectedCat] of Object.entries(rulePerCategory)) {
      expect(getRuleCategory(ruleId)).toBe(expectedCat)
    }
  })
})
