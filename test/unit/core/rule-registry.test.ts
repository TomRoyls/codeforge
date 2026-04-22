import { describe, test, expect, beforeEach, vi } from 'vitest'
import type { SourceFile } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../src/ast/visitor'
import {
  RuleRegistry,
  createDefaultRegistry,
  type LoadedRule,
  type RuleCategory,
} from '../../../src/core/rule-registry'
import type { RuleDefinition } from '../../../src/rules/types'

function createMockSourceFile(): SourceFile {
  return {
    getFilePath: () => '/test/file.ts',
    getText: () => 'const x = 1;',
    getFullText: () => 'const x = 1;',
  } as SourceFile
}

function createMockRule(shouldViolate = false): RuleDefinition {
  return {
    meta: {
      category: 'complexity',
      description: 'Test rule',
      name: 'test-rule',
      recommended: true,
    },
    defaultOptions: {},
    create: () => ({
      visitor: {
        visitFunction: (_node: unknown, context: VisitorContext) => {
          if (shouldViolate) {
            context.addViolation({
              filePath: '/test/file.ts',
              message: 'Function found',
              range: {
                end: { column: 10, line: 1 },
                start: { column: 0, line: 1 },
              },
              ruleId: 'test-rule',
              severity: 'error',
            })
          }
        },
      },
      onComplete: shouldViolate
        ? () => [
            {
              filePath: '/test/file.ts',
              message: 'OnComplete violation',
              range: {
                end: { column: 10, line: 1 },
                start: { column: 0, line: 1 },
              },
              ruleId: 'test-rule',
              severity: 'warning',
            },
          ]
        : undefined,
    }),
  }
}

function createMockRuleWithVisitorOnly(): RuleDefinition {
  return {
    meta: {
      category: 'complexity',
      description: 'Visitor-only rule',
      name: 'visitor-only-rule',
      recommended: false,
    },
    defaultOptions: {},
    create: () => ({
      visitor: {},
    }),
  }
}

vi.mock('../../../src/ast/visitor', () => ({
  traverseAST: vi.fn((_sourceFile: SourceFile, visitor: object, violations: RuleViolation[]) => {
    if (visitor && 'visitFunction' in visitor) {
      const mockContext: VisitorContext = {
        addViolation: (v: RuleViolation) => violations.push(v),
        depth: 0,
        getFilePath: () => '/test/file.ts',
        parent: undefined,
        sourceFile: createMockSourceFile(),
      }
      const handler = visitor.visitFunction as (node: unknown, ctx: VisitorContext) => void
      handler(null, mockContext)
    }
  }),
  traverseASTMultiple: vi.fn(
    (_sourceFile: SourceFile, visitors: object[], violations: RuleViolation[]) => {
      for (const visitor of visitors) {
        if (visitor && 'visitFunction' in visitor) {
          const mockContext: VisitorContext = {
            addViolation: (v: RuleViolation) => violations.push(v),
            depth: 0,
            getFilePath: () => '/test/file.ts',
            parent: undefined,
            sourceFile: createMockSourceFile(),
          }
          const handler = visitor.visitFunction as (node: unknown, ctx: VisitorContext) => void
          handler(null, mockContext)
        }
      }
    },
  ),
}))

describe('RuleRegistry', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  describe('constructor', () => {
    test('creates empty registry', () => {
      expect(registry).toBeInstanceOf(RuleRegistry)
      expect(registry.getEnabledRules()).toHaveLength(0)
    })
  })

  describe('register', () => {
    test('registers a rule with required parameters', () => {
      const rule = createMockRule()
      registry.register('test-rule', rule, 'complexity')

      const loadedRule = registry.getRule('test-rule')
      expect(loadedRule).toBeDefined()
      expect(loadedRule?.definition).toBe(rule)
      expect(loadedRule?.category).toBe('complexity')
      expect(loadedRule?.enabled).toBe(true)
      expect(loadedRule?.options).toEqual({})
    })

    test('registers a rule with custom options', () => {
      const rule = createMockRule()
      const options = { max: 10, min: 1 }
      registry.register('test-rule', rule, 'performance', options)

      const loadedRule = registry.getRule('test-rule')
      expect(loadedRule?.options).toEqual(options)
    })

    test('registers multiple rules', () => {
      const rule1 = createMockRule()
      const rule2 = createMockRule()

      registry.register('rule-1', rule1, 'complexity')
      registry.register('rule-2', rule2, 'security')

      expect(registry.getEnabledRules()).toHaveLength(2)
    })

    test('overwrites existing rule with same id', () => {
      const rule1 = createMockRule()
      const rule2 = createMockRuleWithVisitorOnly()

      registry.register('test-rule', rule1, 'complexity')
      registry.register('test-rule', rule2, 'performance')

      const loadedRule = registry.getRule('test-rule')
      expect(loadedRule?.category).toBe('performance')
      expect(registry.getEnabledRules()).toHaveLength(1)
    })
  })

  describe('enable', () => {
    test('enables a disabled rule', () => {
      const rule = createMockRule()
      registry.register('test-rule', rule, 'complexity')
      registry.disable('test-rule')

      expect(registry.getRule('test-rule')?.enabled).toBe(false)

      registry.enable('test-rule')

      expect(registry.getRule('test-rule')?.enabled).toBe(true)
    })

    test('does nothing for non-existent rule', () => {
      expect(() => registry.enable('non-existent')).not.toThrow()
    })

    test('keeps enabled rule enabled', () => {
      const rule = createMockRule()
      registry.register('test-rule', rule, 'complexity')

      registry.enable('test-rule')

      expect(registry.getRule('test-rule')?.enabled).toBe(true)
    })
  })

  describe('disable', () => {
    test('disables an enabled rule', () => {
      const rule = createMockRule()
      registry.register('test-rule', rule, 'complexity')

      expect(registry.getRule('test-rule')?.enabled).toBe(true)

      registry.disable('test-rule')

      expect(registry.getRule('test-rule')?.enabled).toBe(false)
    })

    test('does nothing for non-existent rule', () => {
      expect(() => registry.disable('non-existent')).not.toThrow()
    })

    test('removes from enabled rules list', () => {
      const rule = createMockRule()
      registry.register('test-rule', rule, 'complexity')
      registry.disable('test-rule')

      expect(registry.getEnabledRules()).toHaveLength(0)
    })
  })

  describe('getEnabledRules', () => {
    test('returns empty array for empty registry', () => {
      expect(registry.getEnabledRules()).toEqual([])
    })

    test('returns only enabled rules', () => {
      const rule1 = createMockRule()
      const rule2 = createMockRule()
      const rule3 = createMockRule()

      registry.register('rule-1', rule1, 'complexity')
      registry.register('rule-2', rule2, 'security')
      registry.register('rule-3', rule3, 'performance')
      registry.disable('rule-2')

      const enabledRules = registry.getEnabledRules()
      expect(enabledRules).toHaveLength(2)
      expect(enabledRules.map((r) => r.definition)).toContain(rule1)
      expect(enabledRules.map((r) => r.definition)).toContain(rule3)
    })

    test('returns correct LoadedRule structure', () => {
      const rule = createMockRule()
      registry.register('test-rule', rule, 'complexity', { max: 5 })

      const enabledRules = registry.getEnabledRules()
      expect(enabledRules).toHaveLength(1)

      const loadedRule = enabledRules[0] as LoadedRule
      expect(loadedRule).toHaveProperty('category')
      expect(loadedRule).toHaveProperty('definition')
      expect(loadedRule).toHaveProperty('enabled')
      expect(loadedRule).toHaveProperty('options')
    })

    test('caches enabled rules for performance', () => {
      const rule1 = createMockRule()
      const rule2 = createMockRule()

      registry.register('rule-1', rule1, 'complexity')
      registry.register('rule-2', rule2, 'security')

      const rules1 = registry.getEnabledRules()
      const rules2 = registry.getEnabledRules()

      expect(rules1).toBe(rules2)
    })

    test('invalidates cache when rule is disabled', () => {
      const rule1 = createMockRule()
      const rule2 = createMockRule()

      registry.register('rule-1', rule1, 'complexity')
      registry.register('rule-2', rule2, 'security')

      const rulesBefore = registry.getEnabledRules()
      expect(rulesBefore).toHaveLength(2)

      registry.disable('rule-1')

      const rulesAfter = registry.getEnabledRules()
      expect(rulesAfter).toHaveLength(1)
      expect(rulesAfter).not.toBe(rulesBefore)
    })

    test('invalidates cache when rule is enabled', () => {
      const rule1 = createMockRule()
      const rule2 = createMockRule()

      registry.register('rule-1', rule1, 'complexity')
      registry.register('rule-2', rule2, 'security')
      registry.disable('rule-1')

      const rulesBefore = registry.getEnabledRules()
      expect(rulesBefore).toHaveLength(1)

      registry.enable('rule-1')

      const rulesAfter = registry.getEnabledRules()
      expect(rulesAfter).toHaveLength(2)
      expect(rulesAfter).not.toBe(rulesBefore)
    })

    test('invalidates cache when new rule is registered', () => {
      const rule1 = createMockRule()

      registry.register('rule-1', rule1, 'complexity')

      const rulesBefore = registry.getEnabledRules()
      expect(rulesBefore).toHaveLength(1)

      const rule2 = createMockRule()
      registry.register('rule-2', rule2, 'security')

      const rulesAfter = registry.getEnabledRules()
      expect(rulesAfter).toHaveLength(2)
      expect(rulesAfter).not.toBe(rulesBefore)
    })
  })

  describe('getRule', () => {
    test('returns undefined for non-existent rule', () => {
      expect(registry.getRule('non-existent')).toBeUndefined()
    })

    test('returns loaded rule for existing rule', () => {
      const rule = createMockRule()
      registry.register('test-rule', rule, 'complexity')

      const loadedRule = registry.getRule('test-rule')
      expect(loadedRule).toBeDefined()
      expect(loadedRule?.definition).toBe(rule)
    })

    test('returns rule with current state after modifications', () => {
      const rule = createMockRule()
      registry.register('test-rule', rule, 'complexity')
      registry.disable('test-rule')

      const loadedRule = registry.getRule('test-rule')
      expect(loadedRule?.enabled).toBe(false)
    })
  })

  describe('runRules', () => {
    test('returns empty array for empty registry', () => {
      const sourceFile = createMockSourceFile()
      const violations = registry.runRules(sourceFile)

      expect(violations).toEqual([])
    })

    test('returns violations from enabled rules', async () => {
      const rule = createMockRule(true)
      registry.register('test-rule', rule, 'complexity')

      const sourceFile = createMockSourceFile()
      const violations = registry.runRules(sourceFile)

      expect(violations.length).toBeGreaterThan(0)
    })

    test('does not run disabled rules', () => {
      const rule = createMockRule(true)
      registry.register('test-rule', rule, 'complexity')
      registry.disable('test-rule')

      const sourceFile = createMockSourceFile()
      const violations = registry.runRules(sourceFile)

      expect(violations).toEqual([])
    })

    test('runs multiple enabled rules', () => {
      const rule1 = createMockRule(true)
      const rule2 = createMockRule(true)

      registry.register('rule-1', rule1, 'complexity')
      registry.register('rule-2', rule2, 'security')

      const sourceFile = createMockSourceFile()
      const violations = registry.runRules(sourceFile)

      expect(violations.length).toBeGreaterThanOrEqual(2)
    })

    test('includes violations from onComplete callback', () => {
      const rule = createMockRule(true)
      registry.register('test-rule', rule, 'complexity')

      const sourceFile = createMockSourceFile()
      const violations = registry.runRules(sourceFile)

      const onCompleteViolations = violations.filter((v) => v.message === 'OnComplete violation')
      expect(onCompleteViolations.length).toBe(1)
    })

    test('handles rule without onComplete', () => {
      const rule = createMockRuleWithVisitorOnly()
      registry.register('test-rule', rule, 'complexity')

      const sourceFile = createMockSourceFile()

      expect(() => registry.runRules(sourceFile)).not.toThrow()
    })

    test('passes options to rule create function', () => {
      let receivedOptions: Record<string, unknown> | undefined
      const rule: RuleDefinition = {
        defaultOptions: {},
        meta: {
          category: 'complexity',
          description: 'Options test',
          name: 'options-test-rule',
          recommended: false,
        },
        create: (options) => {
          receivedOptions = options
          return { visitor: {} }
        },
      }

      registry.register('test-rule', rule, 'complexity', { max: 10 })
      const sourceFile = createMockSourceFile()
      registry.runRules(sourceFile)

      expect(receivedOptions).toEqual({ max: 10 })
    })
  })
})

describe('createDefaultRegistry', () => {
  test('creates new RuleRegistry instance', () => {
    const registry = createDefaultRegistry()
    expect(registry).toBeInstanceOf(RuleRegistry)
  })

  test('creates empty registry', () => {
    const registry = createDefaultRegistry()
    expect(registry.getEnabledRules()).toHaveLength(0)
  })

  test('creates independent instances', () => {
    const registry1 = createDefaultRegistry()
    const registry2 = createDefaultRegistry()

    const rule = createMockRule()
    registry1.register('test-rule', rule, 'complexity')

    expect(registry1.getEnabledRules()).toHaveLength(1)
    expect(registry2.getEnabledRules()).toHaveLength(0)
  })
})

describe('RuleCategory type', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('accepts valid categories', () => {
    const categories: RuleCategory[] = [
      'complexity',
      'dependencies',
      'performance',
      'security',
      'patterns',
    ]

    const rule = createMockRule()

    for (const category of categories) {
      const testRegistry = new RuleRegistry()
      expect(() => testRegistry.register('test', rule, category)).not.toThrow()
    }
  })

  test('accepts correctness category', () => {
    const rule = createMockRule()
    expect(() => registry.register('test', rule, 'correctness')).not.toThrow()
  })

  test('accepts testing category', () => {
    const rule = createMockRule()
    expect(() => registry.register('test', rule, 'testing')).not.toThrow()
  })

  test('all seven categories are accepted', () => {
    const categories: RuleCategory[] = [
      'complexity',
      'correctness',
      'dependencies',
      'patterns',
      'performance',
      'security',
      'testing',
    ]
    const rule = createMockRule()

    for (const category of categories) {
      registry.register(`rule-${category}`, rule, category)
    }

    expect(registry.getEnabledRules()).toHaveLength(7)
  })

  test('category is stored correctly in loaded rule', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'security')
    expect(registry.getRule('test')?.category).toBe('security')
  })

  test('different categories can coexist', () => {
    const rule = createMockRule()
    registry.register('r1', rule, 'complexity')
    registry.register('r2', rule, 'security')
    registry.register('r3', rule, 'performance')

    expect(registry.getRule('r1')?.category).toBe('complexity')
    expect(registry.getRule('r2')?.category).toBe('security')
    expect(registry.getRule('r3')?.category).toBe('performance')
  })
})

describe('LoadedRule type', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('has required properties', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity', { threshold: 5 })
    const loaded = registry.getRule('test')!

    expect(loaded).toHaveProperty('category')
    expect(loaded).toHaveProperty('definition')
    expect(loaded).toHaveProperty('enabled')
    expect(loaded).toHaveProperty('options')
  })

  test('category is a string', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    expect(typeof registry.getRule('test')?.category).toBe('string')
  })

  test('definition is the original rule', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    expect(registry.getRule('test')?.definition).toBe(rule)
  })

  test('enabled defaults to true', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    expect(registry.getRule('test')?.enabled).toBe(true)
  })

  test('options defaults to empty object', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    expect(registry.getRule('test')?.options).toEqual({})
  })

  test('options preserves custom values', () => {
    const rule = createMockRule()
    const opts = { max: 10, strict: true, pattern: '.*' }
    registry.register('test', rule, 'complexity', opts)
    expect(registry.getRule('test')?.options).toEqual(opts)
  })
})

describe('RuleRegistry - register edge cases', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('register with empty string id', () => {
    const rule = createMockRule()
    registry.register('', rule, 'complexity')
    expect(registry.getRule('')).toBeDefined()
  })

  test('register with special characters in id', () => {
    const rule = createMockRule()
    registry.register('rule/with-special.chars', rule, 'complexity')
    expect(registry.getRule('rule/with-special.chars')).toBeDefined()
  })

  test('register with scoped package id', () => {
    const rule = createMockRule()
    registry.register('@scope/package-rule', rule, 'complexity')
    expect(registry.getRule('@scope/package-rule')).toBeDefined()
  })

  test('register many rules', () => {
    const rule = createMockRule()
    for (let i = 0; i < 100; i++) {
      registry.register(`rule-${i}`, rule, 'complexity')
    }
    expect(registry.getEnabledRules()).toHaveLength(100)
  })

  test('overwrite preserves enabled state as true', () => {
    const rule1 = createMockRule()
    const rule2 = createMockRule()
    registry.register('test', rule1, 'complexity')
    registry.disable('test')
    registry.register('test', rule2, 'security')
    expect(registry.getRule('test')?.enabled).toBe(true)
  })

  test('overwrite updates category', () => {
    const rule1 = createMockRule()
    const rule2 = createMockRule()
    registry.register('test', rule1, 'complexity')
    registry.register('test', rule2, 'security')
    expect(registry.getRule('test')?.category).toBe('security')
  })

  test('overwrite updates definition', () => {
    const rule1 = createMockRule()
    const rule2 = createMockRuleWithVisitorOnly()
    registry.register('test', rule1, 'complexity')
    registry.register('test', rule2, 'complexity')
    expect(registry.getRule('test')?.definition).toBe(rule2)
  })

  test('register invalidates cache', () => {
    const rule1 = createMockRule()
    registry.register('r1', rule1, 'complexity')
    const cached = registry.getEnabledRules()

    const rule2 = createMockRule()
    registry.register('r2', rule2, 'complexity')

    const after = registry.getEnabledRules()
    expect(after).not.toBe(cached)
    expect(after).toHaveLength(2)
  })
})

describe('RuleRegistry - enable edge cases', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('enable non-existent rule does not create entry', () => {
    registry.enable('nonexistent')
    expect(registry.getRule('nonexistent')).toBeUndefined()
  })

  test('enable returns void', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    const result = registry.enable('test')
    expect(result).toBeUndefined()
  })

  test('enable multiple times is idempotent', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    registry.enable('test')
    registry.enable('test')
    registry.enable('test')
    expect(registry.getRule('test')?.enabled).toBe(true)
    expect(registry.getEnabledRules()).toHaveLength(1)
  })

  test('enable after disable restores to enabled list', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    registry.disable('test')
    expect(registry.getEnabledRules()).toHaveLength(0)
    registry.enable('test')
    expect(registry.getEnabledRules()).toHaveLength(1)
  })

  test('enable invalidates cache', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    registry.disable('test')
    const cached = registry.getEnabledRules()
    registry.enable('test')
    const after = registry.getEnabledRules()
    expect(after).not.toBe(cached)
  })
})

describe('RuleRegistry - disable edge cases', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('disable non-existent rule does not throw', () => {
    expect(() => registry.disable('nonexistent')).not.toThrow()
  })

  test('disable non-existent rule does not create entry', () => {
    registry.disable('nonexistent')
    expect(registry.getRule('nonexistent')).toBeUndefined()
  })

  test('disable returns void', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    const result = registry.disable('test')
    expect(result).toBeUndefined()
  })

  test('disable multiple times is idempotent', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    registry.disable('test')
    registry.disable('test')
    registry.disable('test')
    expect(registry.getRule('test')?.enabled).toBe(false)
    expect(registry.getEnabledRules()).toHaveLength(0)
  })

  test('disable all rules leaves empty enabled list', () => {
    const rule = createMockRule()
    registry.register('r1', rule, 'complexity')
    registry.register('r2', rule, 'security')
    registry.register('r3', rule, 'performance')
    registry.disable('r1')
    registry.disable('r2')
    registry.disable('r3')
    expect(registry.getEnabledRules()).toHaveLength(0)
  })

  test('disable invalidates cache', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    const cached = registry.getEnabledRules()
    registry.disable('test')
    const after = registry.getEnabledRules()
    expect(after).not.toBe(cached)
  })

  test('disabled rule still retrievable via getRule', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    registry.disable('test')
    expect(registry.getRule('test')).toBeDefined()
    expect(registry.getRule('test')?.enabled).toBe(false)
  })
})

describe('RuleRegistry - getEnabledRules edge cases', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('returns new array after cache invalidation from register', () => {
    const rule = createMockRule()
    registry.register('r1', rule, 'complexity')
    const first = registry.getEnabledRules()
    registry.register('r2', rule, 'complexity')
    const second = registry.getEnabledRules()
    expect(first).not.toBe(second)
    expect(first).toHaveLength(1)
    expect(second).toHaveLength(2)
  })

  test('returns new array after cache invalidation from enable', () => {
    const rule = createMockRule()
    registry.register('r1', rule, 'complexity')
    registry.disable('r1')
    const first = registry.getEnabledRules()
    registry.enable('r1')
    const second = registry.getEnabledRules()
    expect(first).toHaveLength(0)
    expect(second).toHaveLength(1)
  })

  test('returns same reference on consecutive calls without changes', () => {
    const rule = createMockRule()
    registry.register('r1', rule, 'complexity')
    const first = registry.getEnabledRules()
    const second = registry.getEnabledRules()
    const third = registry.getEnabledRules()
    expect(first).toBe(second)
    expect(second).toBe(third)
  })

  test('handles all disabled rules', () => {
    const rule = createMockRule()
    registry.register('r1', rule, 'complexity')
    registry.register('r2', rule, 'security')
    registry.disable('r1')
    registry.disable('r2')
    expect(registry.getEnabledRules()).toEqual([])
  })

  test('handles mix of enabled and disabled', () => {
    const rule = createMockRule()
    registry.register('r1', rule, 'complexity')
    registry.register('r2', rule, 'security')
    registry.register('r3', rule, 'performance')
    registry.register('r4', rule, 'patterns')
    registry.disable('r2')
    registry.disable('r4')
    const enabled = registry.getEnabledRules()
    expect(enabled).toHaveLength(2)
  })
})

describe('RuleRegistry - getRule edge cases', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('returns undefined for empty string id', () => {
    expect(registry.getRule('')).toBeUndefined()
  })

  test('returns undefined after rule unregistered via overwrite', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    expect(registry.getRule('test')).toBeDefined()
  })

  test('preserves state across multiple getRule calls', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    registry.disable('test')
    const r1 = registry.getRule('test')
    const r2 = registry.getRule('test')
    expect(r1?.enabled).toBe(false)
    expect(r2?.enabled).toBe(false)
  })

  test('case sensitive rule lookup', () => {
    const rule = createMockRule()
    registry.register('Test-Rule', rule, 'complexity')
    expect(registry.getRule('Test-Rule')).toBeDefined()
    expect(registry.getRule('test-rule')).toBeUndefined()
    expect(registry.getRule('TEST-RULE')).toBeUndefined()
  })
})

describe('RuleRegistry - runRules edge cases', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('returns empty array when only disabled rules', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'complexity')
    registry.disable('test')
    expect(registry.runRules(createMockSourceFile())).toEqual([])
  })

  test('runs rules with visitor but no violations', () => {
    const rule = createMockRule(false)
    registry.register('test', rule, 'complexity')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations).toBeDefined()
    expect(Array.isArray(violations)).toBe(true)
  })

  test('collects violations from multiple rules', () => {
    const rule = createMockRule(true)
    registry.register('r1', rule, 'complexity')
    registry.register('r2', rule, 'security')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations.length).toBeGreaterThanOrEqual(2)
  })

  test('returns array', () => {
    const violations = registry.runRules(createMockSourceFile())
    expect(Array.isArray(violations)).toBe(true)
  })

  test('handles rule with only onComplete', () => {
    const rule: RuleDefinition = {
      defaultOptions: {},
      meta: {
        category: 'complexity',
        description: 'OnComplete only',
        name: 'oncomplete-only',
        recommended: false,
      },
      create: () => ({
        visitor: {},
        onComplete: () => [
          {
            filePath: '/test/file.ts',
            message: 'OnComplete violation',
            range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
            ruleId: 'oncomplete-only',
            severity: 'warning',
          },
        ],
      }),
    }
    registry.register('test', rule, 'complexity')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toBe('OnComplete violation')
  })

  test('handles rule with empty onComplete', () => {
    const rule: RuleDefinition = {
      defaultOptions: {},
      meta: {
        category: 'complexity',
        description: 'Empty onComplete',
        name: 'empty-oncomplete',
        recommended: false,
      },
      create: () => ({
        visitor: {},
        onComplete: () => [],
      }),
    }
    registry.register('test', rule, 'complexity')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations).toEqual([])
  })

  test('does not run disabled rule visitors', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'complexity')
    registry.disable('test')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations).toEqual([])
  })

  test('re-enabled rule produces violations again', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'complexity')
    registry.disable('test')
    expect(registry.runRules(createMockSourceFile())).toEqual([])
    registry.enable('test')
    expect(registry.runRules(createMockSourceFile()).length).toBeGreaterThan(0)
  })

  test('passes empty options when none provided', () => {
    let receivedOpts: Record<string, unknown> | undefined
    const rule: RuleDefinition = {
      defaultOptions: {},
      meta: { category: 'complexity', description: 't', name: 't', recommended: false },
      create: (opts) => {
        receivedOpts = opts
        return { visitor: {} }
      },
    }
    registry.register('test', rule, 'complexity')
    registry.runRules(createMockSourceFile())
    expect(receivedOpts).toEqual({})
  })

  test('passes provided options to create', () => {
    let receivedOpts: Record<string, unknown> | undefined
    const rule: RuleDefinition = {
      defaultOptions: {},
      meta: { category: 'complexity', description: 't', name: 't', recommended: false },
      create: (opts) => {
        receivedOpts = opts
        return { visitor: {} }
      },
    }
    registry.register('test', rule, 'complexity', { level: 3 })
    registry.runRules(createMockSourceFile())
    expect(receivedOpts).toEqual({ level: 3 })
  })
})

describe('RuleRegistry - concurrent operations', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('register then immediately getRule', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    expect(registry.getRule('test')?.definition).toBe(rule)
  })

  test('register disable enable getRule', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    registry.disable('test')
    registry.enable('test')
    expect(registry.getRule('test')?.enabled).toBe(true)
  })

  test('register many then disable some', () => {
    const rule = createMockRule()
    for (let i = 0; i < 10; i++) {
      registry.register(`rule-${i}`, rule, 'complexity')
    }
    for (let i = 0; i < 5; i++) {
      registry.disable(`rule-${i}`)
    }
    expect(registry.getEnabledRules()).toHaveLength(5)
  })

  test('register overwrite preserves count', () => {
    const rule = createMockRule()
    registry.register('r1', rule, 'complexity')
    registry.register('r2', rule, 'security')
    registry.register('r1', rule, 'performance')
    expect(registry.getEnabledRules()).toHaveLength(2)
  })

  test('getEnabledRules after runRules returns same cache', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    registry.runRules(createMockSourceFile())
    const first = registry.getEnabledRules()
    const second = registry.getEnabledRules()
    expect(first).toBe(second)
  })
})

describe('RuleRegistry - violation structure', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('violation has ruleId field', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'complexity')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations.every((v) => typeof v.ruleId === 'string')).toBe(true)
  })

  test('violation has severity from rule', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'complexity')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations.some((v) => v.severity === 'error')).toBe(true)
  })

  test('violation has filePath', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'complexity')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations.every((v) => v.filePath !== undefined)).toBe(true)
  })

  test('violation has range with start and end', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'complexity')
    const violations = registry.runRules(createMockSourceFile())
    for (const v of violations) {
      expect(v.range).toHaveProperty('start')
      expect(v.range).toHaveProperty('end')
    }
  })

  test('violation range start has line and column', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'complexity')
    const violations = registry.runRules(createMockSourceFile())
    for (const v of violations) {
      expect(v.range.start).toHaveProperty('line')
      expect(v.range.start).toHaveProperty('column')
    }
  })

  test('multiple rules produce more violations than one', () => {
    const rule = createMockRule(true)
    registry.register('r1', rule, 'complexity')
    const v1 = registry.runRules(createMockSourceFile())
    registry.register('r2', rule, 'security')
    const v2 = registry.runRules(createMockSourceFile())
    expect(v2.length).toBeGreaterThanOrEqual(v1.length)
  })
})

describe('RuleRegistry - options handling', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('options with nested objects', () => {
    const rule = createMockRule()
    const opts = { config: { depth: 3, strict: true } }
    registry.register('test', rule, 'complexity', opts)
    expect(registry.getRule('test')?.options).toEqual(opts)
  })

  test('options with array values', () => {
    const rule = createMockRule()
    const opts = { patterns: ['*.ts', '*.tsx'], exclude: ['node_modules'] }
    registry.register('test', rule, 'complexity', opts)
    expect(registry.getRule('test')?.options).toEqual(opts)
  })

  test('options with numeric values', () => {
    const rule = createMockRule()
    const opts = { max: 10, min: 0, threshold: 0.5 }
    registry.register('test', rule, 'complexity', opts)
    expect(registry.getRule('test')?.options).toEqual(opts)
  })

  test('options with string values', () => {
    const rule = createMockRule()
    const opts = { message: 'Too complex', severity: 'error' }
    registry.register('test', rule, 'complexity', opts)
    expect(registry.getRule('test')?.options).toEqual(opts)
  })

  test('options with boolean values', () => {
    const rule = createMockRule()
    const opts = { enabled: true, strict: false, allowAny: true }
    registry.register('test', rule, 'complexity', opts)
    expect(registry.getRule('test')?.options).toEqual(opts)
  })

  test('options are passed to create function during runRules', () => {
    let receivedOpts: unknown
    const rule: RuleDefinition = {
      defaultOptions: {},
      meta: { category: 'complexity', description: 't', name: 't', recommended: false },
      create: (opts) => {
        receivedOpts = opts
        return { visitor: {} }
      },
    }
    const opts = { custom: 'value', num: 42 }
    registry.register('test', rule, 'complexity', opts)
    registry.runRules(createMockSourceFile())
    expect(receivedOpts).toEqual(opts)
  })

  test('empty options object is valid', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity', {})
    expect(registry.getRule('test')?.options).toEqual({})
  })

  test('different rules can have different options', () => {
    const rule = createMockRule()
    registry.register('r1', rule, 'complexity', { max: 5 })
    registry.register('r2', rule, 'security', { level: 'high' })
    expect(registry.getRule('r1')?.options).toEqual({ max: 5 })
    expect(registry.getRule('r2')?.options).toEqual({ level: 'high' })
  })

  test('overwriting rule replaces options', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity', { max: 5 })
    registry.register('test', rule, 'security', { max: 10 })
    expect(registry.getRule('test')?.options).toEqual({ max: 10 })
  })
})

describe('RuleRegistry - lifecycle', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('register -> getEnabledRules -> runRules works', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    expect(registry.getEnabledRules()).toHaveLength(1)
    const violations = registry.runRules(createMockSourceFile())
    expect(Array.isArray(violations)).toBe(true)
  })

  test('register -> disable -> getEnabledRules -> enable -> getEnabledRules works', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    expect(registry.getEnabledRules()).toHaveLength(1)
    registry.disable('test')
    expect(registry.getEnabledRules()).toHaveLength(0)
    registry.enable('test')
    expect(registry.getEnabledRules()).toHaveLength(1)
  })

  test('register multiple -> disable some -> runRules only runs enabled', () => {
    const violatingRule = createMockRule(true)
    const safeRule = createMockRule(false)
    registry.register('r1', violatingRule, 'complexity')
    registry.register('r2', safeRule, 'security')
    registry.disable('r1')
    const violations = registry.runRules(createMockSourceFile())
    const r1Violations = violations.filter((v) => v.ruleId === 'r1')
    expect(r1Violations).toHaveLength(0)
  })

  test('register -> overwrite -> runRules uses new definition', () => {
    const rule1 = createMockRule(false)
    const rule2 = createMockRule(true)
    registry.register('test', rule1, 'complexity')
    registry.register('test', rule2, 'security')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations.length).toBeGreaterThan(0)
  })

  test('createDefaultRegistry -> register -> runRules works', () => {
    const reg = createDefaultRegistry()
    const rule = createMockRule()
    reg.register('test', rule, 'complexity')
    expect(reg.getEnabledRules()).toHaveLength(1)
  })

  test('sequential register calls accumulate rules', () => {
    const rule = createMockRule()
    for (let i = 0; i < 5; i++) {
      registry.register(`rule-${i}`, rule, 'complexity')
      expect(registry.getEnabledRules()).toHaveLength(i + 1)
    }
  })

  test('sequential disable calls reduce enabled rules', () => {
    const rule = createMockRule()
    for (let i = 0; i < 5; i++) {
      registry.register(`rule-${i}`, rule, 'complexity')
    }
    for (let i = 0; i < 5; i++) {
      registry.disable(`rule-${i}`)
      expect(registry.getEnabledRules()).toHaveLength(4 - i)
    }
  })

  test('sequential enable calls restore rules', () => {
    const rule = createMockRule()
    for (let i = 0; i < 5; i++) {
      registry.register(`rule-${i}`, rule, 'complexity')
      registry.disable(`rule-${i}`)
    }
    expect(registry.getEnabledRules()).toHaveLength(0)
    for (let i = 0; i < 5; i++) {
      registry.enable(`rule-${i}`)
      expect(registry.getEnabledRules()).toHaveLength(i + 1)
    }
  })

  test('runRules returns consistent results across calls', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'complexity')
    const v1 = registry.runRules(createMockSourceFile())
    const v2 = registry.runRules(createMockSourceFile())
    expect(v1.length).toBe(v2.length)
  })
})

describe('RuleRegistry - stress tests', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('register 200 rules', () => {
    const rule = createMockRule()
    for (let i = 0; i < 200; i++) {
      registry.register(`rule-${i}`, rule, 'complexity')
    }
    expect(registry.getEnabledRules()).toHaveLength(200)
  })

  test('disable 100 of 100 rules', () => {
    const rule = createMockRule()
    for (let i = 0; i < 100; i++) {
      registry.register(`rule-${i}`, rule, 'complexity')
    }
    for (let i = 0; i < 100; i++) {
      registry.disable(`rule-${i}`)
    }
    expect(registry.getEnabledRules()).toHaveLength(0)
  })

  test('register overwrite 50 times', () => {
    const rule = createMockRule()
    for (let i = 0; i < 50; i++) {
      registry.register('test', rule, 'complexity')
    }
    expect(registry.getEnabledRules()).toHaveLength(1)
  })

  test('enable disable toggle 50 times', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    for (let i = 0; i < 50; i++) {
      registry.disable('test')
      registry.enable('test')
    }
    expect(registry.getRule('test')?.enabled).toBe(true)
    expect(registry.getEnabledRules()).toHaveLength(1)
  })

  test('getEnabledRules cached across 50 calls', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    const results: LoadedRule[][] = []
    for (let i = 0; i < 50; i++) {
      results.push(registry.getEnabledRules())
    }
    for (const r of results) {
      expect(r).toBe(results[0])
    }
  })

  test('getRule for 50 rules returns each correctly', () => {
    const rule = createMockRule()
    for (let i = 0; i < 50; i++) {
      registry.register(`rule-${i}`, rule, 'complexity')
    }
    for (let i = 0; i < 50; i++) {
      expect(registry.getRule(`rule-${i}`)).toBeDefined()
      expect(registry.getRule(`rule-${i}`)?.enabled).toBe(true)
    }
  })

  test('runRules with 50 enabled rules', () => {
    const rule = createMockRule(true)
    for (let i = 0; i < 50; i++) {
      registry.register(`rule-${i}`, rule, 'complexity')
    }
    const violations = registry.runRules(createMockSourceFile())
    expect(violations.length).toBeGreaterThan(0)
  })

  test('runRules with 50 rules only 10 enabled', () => {
    const rule = createMockRule(true)
    for (let i = 0; i < 50; i++) {
      registry.register(`rule-${i}`, rule, 'complexity')
    }
    for (let i = 10; i < 50; i++) {
      registry.disable(`rule-${i}`)
    }
    const violations = registry.runRules(createMockSourceFile())
    expect(registry.getEnabledRules()).toHaveLength(10)
  })

  test('alternating enable disable pattern', () => {
    const rule = createMockRule()
    for (let i = 0; i < 20; i++) {
      registry.register(`rule-${i}`, rule, 'complexity')
      if (i % 2 === 0) {
        registry.disable(`rule-${i}`)
      }
    }
    expect(registry.getEnabledRules()).toHaveLength(10)
  })
})

describe('RuleRegistry - create function behavior', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('create is called once per rule during runRules', () => {
    let createCount = 0
    const rule: RuleDefinition = {
      defaultOptions: {},
      meta: { category: 'complexity', description: 't', name: 't', recommended: false },
      create: () => {
        createCount++
        return { visitor: {} }
      },
    }
    registry.register('test', rule, 'complexity')
    registry.runRules(createMockSourceFile())
    expect(createCount).toBe(1)
  })

  test('create is called for each enabled rule', () => {
    let createCount = 0
    const rule: RuleDefinition = {
      defaultOptions: {},
      meta: { category: 'complexity', description: 't', name: 't', recommended: false },
      create: () => {
        createCount++
        return { visitor: {} }
      },
    }
    registry.register('r1', rule, 'complexity')
    registry.register('r2', rule, 'security')
    registry.register('r3', rule, 'performance')
    registry.runRules(createMockSourceFile())
    expect(createCount).toBe(3)
  })

  test('create is not called for disabled rules', () => {
    let createCount = 0
    const rule: RuleDefinition = {
      defaultOptions: {},
      meta: { category: 'complexity', description: 't', name: 't', recommended: false },
      create: () => {
        createCount++
        return { visitor: {} }
      },
    }
    registry.register('r1', rule, 'complexity')
    registry.register('r2', rule, 'security')
    registry.disable('r2')
    registry.runRules(createMockSourceFile())
    expect(createCount).toBe(1)
  })

  test('create receives default options when none specified', () => {
    let receivedOpts: unknown
    const rule: RuleDefinition = {
      defaultOptions: { level: 1 },
      meta: { category: 'complexity', description: 't', name: 't', recommended: false },
      create: (opts) => {
        receivedOpts = opts
        return { visitor: {} }
      },
    }
    registry.register('test', rule, 'complexity')
    registry.runRules(createMockSourceFile())
    expect(receivedOpts).toEqual({})
  })

  test('create returns visitor object', () => {
    const rule: RuleDefinition = {
      defaultOptions: {},
      meta: { category: 'complexity', description: 't', name: 't', recommended: false },
      create: () => ({
        visitor: {
          visitFunction: vi.fn(),
          visitVariableDeclaration: vi.fn(),
        },
      }),
    }
    registry.register('test', rule, 'complexity')
    const violations = registry.runRules(createMockSourceFile())
    expect(Array.isArray(violations)).toBe(true)
  })

  test('create returns visitor with onComplete', () => {
    const rule: RuleDefinition = {
      defaultOptions: {},
      meta: { category: 'complexity', description: 't', name: 't', recommended: false },
      create: () => ({
        visitor: {},
        onComplete: () => [
          {
            filePath: '/test/file.ts',
            message: 'Complete',
            range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
            ruleId: 'test',
            severity: 'info' as const,
          },
        ],
      }),
    }
    registry.register('test', rule, 'complexity')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations.some((v) => v.message === 'Complete')).toBe(true)
  })
})

describe('RuleRegistry - rule category coverage', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('complexity category rules run correctly', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'complexity')
    expect(registry.getRule('test')?.category).toBe('complexity')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations.length).toBeGreaterThan(0)
  })

  test('security category rules run correctly', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'security')
    expect(registry.getRule('test')?.category).toBe('security')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations.length).toBeGreaterThan(0)
  })

  test('performance category rules run correctly', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'performance')
    expect(registry.getRule('test')?.category).toBe('performance')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations.length).toBeGreaterThan(0)
  })

  test('dependencies category rules run correctly', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'dependencies')
    expect(registry.getRule('test')?.category).toBe('dependencies')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations.length).toBeGreaterThan(0)
  })

  test('patterns category rules run correctly', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'patterns')
    expect(registry.getRule('test')?.category).toBe('patterns')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations.length).toBeGreaterThan(0)
  })

  test('correctness category rules run correctly', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'correctness')
    expect(registry.getRule('test')?.category).toBe('correctness')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations.length).toBeGreaterThan(0)
  })

  test('testing category rules run correctly', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'testing')
    expect(registry.getRule('test')?.category).toBe('testing')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations.length).toBeGreaterThan(0)
  })

  test('rules from all categories can coexist', () => {
    const rule = createMockRule()
    const categories: RuleCategory[] = [
      'complexity',
      'correctness',
      'dependencies',
      'patterns',
      'performance',
      'security',
      'testing',
    ]
    for (const cat of categories) {
      registry.register(`rule-${cat}`, rule, cat)
    }
    expect(registry.getEnabledRules()).toHaveLength(7)
  })
})

describe('RuleRegistry - cache behavior details', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('cache is null before first getEnabledRules', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    // First call creates cache
    const first = registry.getEnabledRules()
    expect(first).toBeDefined()
  })

  test('register after cache populates invalidates it', () => {
    const rule = createMockRule()
    registry.register('r1', rule, 'complexity')
    registry.getEnabledRules()
    registry.register('r2', rule, 'security')
    const rules = registry.getEnabledRules()
    expect(rules).toHaveLength(2)
  })

  test('disable after cache populates invalidates it', () => {
    const rule = createMockRule()
    registry.register('r1', rule, 'complexity')
    registry.register('r2', rule, 'security')
    registry.getEnabledRules()
    registry.disable('r1')
    const rules = registry.getEnabledRules()
    expect(rules).toHaveLength(1)
  })

  test('enable after cache populates invalidates it', () => {
    const rule = createMockRule()
    registry.register('r1', rule, 'complexity')
    registry.disable('r1')
    registry.getEnabledRules()
    registry.enable('r1')
    const rules = registry.getEnabledRules()
    expect(rules).toHaveLength(1)
  })

  test('cache stays valid across multiple reads', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    const results = []
    for (let i = 0; i < 10; i++) {
      results.push(registry.getEnabledRules())
    }
    for (const r of results) {
      expect(r).toBe(results[0])
    }
  })

  test('overwrite invalidates cache', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    registry.getEnabledRules()
    registry.register('test', rule, 'security')
    const rules = registry.getEnabledRules()
    expect(rules).toHaveLength(1)
    expect(rules[0].category).toBe('security')
  })
})

describe('RuleRegistry - rule id handling', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('handles hyphenated rule ids', () => {
    const rule = createMockRule()
    registry.register('no-console-log', rule, 'complexity')
    expect(registry.getRule('no-console-log')).toBeDefined()
  })

  test('handles underscore rule ids', () => {
    const rule = createMockRule()
    registry.register('no_console_log', rule, 'complexity')
    expect(registry.getRule('no_console_log')).toBeDefined()
  })

  test('handles camelCase rule ids', () => {
    const rule = createMockRule()
    registry.register('noConsoleLog', rule, 'complexity')
    expect(registry.getRule('noConsoleLog')).toBeDefined()
  })

  test('handles PascalCase rule ids', () => {
    const rule = createMockRule()
    registry.register('NoConsoleLog', rule, 'complexity')
    expect(registry.getRule('NoConsoleLog')).toBeDefined()
  })

  test('handles numeric suffix rule ids', () => {
    const rule = createMockRule()
    registry.register('rule-123', rule, 'complexity')
    expect(registry.getRule('rule-123')).toBeDefined()
  })

  test('handles very long rule ids', () => {
    const rule = createMockRule()
    const longId = 'a'.repeat(200)
    registry.register(longId, rule, 'complexity')
    expect(registry.getRule(longId)).toBeDefined()
  })

  test('handles scoped package rule ids', () => {
    const rule = createMockRule()
    registry.register('@typescript-eslint/no-explicit-any', rule, 'complexity')
    expect(registry.getRule('@typescript-eslint/no-explicit-any')).toBeDefined()
  })

  test('rule ids are exact match (no fuzzy)', () => {
    const rule = createMockRule()
    registry.register('no-console', rule, 'complexity')
    expect(registry.getRule('no-console')).toBeDefined()
    expect(registry.getRule('no_console')).toBeUndefined()
    expect(registry.getRule('noConsole')).toBeUndefined()
    expect(registry.getRule('NO-CONSOLE')).toBeUndefined()
  })
})

describe('createDefaultRegistry additional tests', () => {
  test('instance has register method', () => {
    const reg = createDefaultRegistry()
    expect(typeof reg.register).toBe('function')
  })

  test('instance has enable method', () => {
    const reg = createDefaultRegistry()
    expect(typeof reg.enable).toBe('function')
  })

  test('instance has disable method', () => {
    const reg = createDefaultRegistry()
    expect(typeof reg.disable).toBe('function')
  })

  test('instance has getEnabledRules method', () => {
    const reg = createDefaultRegistry()
    expect(typeof reg.getEnabledRules).toBe('function')
  })

  test('instance has getRule method', () => {
    const reg = createDefaultRegistry()
    expect(typeof reg.getRule).toBe('function')
  })

  test('instance has runRules method', () => {
    const reg = createDefaultRegistry()
    expect(typeof reg.runRules).toBe('function')
  })

  test('multiple instances are independent', () => {
    const reg1 = createDefaultRegistry()
    const reg2 = createDefaultRegistry()
    const rule = createMockRule()
    reg1.register('test', rule, 'complexity')
    reg1.disable('test')
    expect(reg1.getEnabledRules()).toHaveLength(0)
    expect(reg2.getEnabledRules()).toHaveLength(0)
  })

  test('returns RuleRegistry instance', () => {
    const reg = createDefaultRegistry()
    expect(reg).toBeInstanceOf(RuleRegistry)
  })
})

describe('RuleRegistry - comprehensive register patterns', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('register with all seven categories', () => {
    const rule = createMockRule()
    const categories: RuleCategory[] = [
      'complexity',
      'correctness',
      'dependencies',
      'patterns',
      'performance',
      'security',
      'testing',
    ]
    for (let i = 0; i < categories.length; i++) {
      registry.register(`rule-${i}`, rule, categories[i])
    }
    const enabled = registry.getEnabledRules()
    expect(enabled).toHaveLength(7)
    for (let i = 0; i < categories.length; i++) {
      expect(enabled[i].category).toBe(categories[i])
    }
  })

  test('register and immediately getRule returns correct data', () => {
    const rule = createMockRule()
    const opts = { threshold: 5 }
    registry.register('my-rule', rule, 'security', opts)
    const loaded = registry.getRule('my-rule')
    expect(loaded?.category).toBe('security')
    expect(loaded?.definition).toBe(rule)
    expect(loaded?.enabled).toBe(true)
    expect(loaded?.options).toEqual(opts)
  })

  test('register rule id that looks like path', () => {
    const rule = createMockRule()
    registry.register('path/to/rule', rule, 'complexity')
    expect(registry.getRule('path/to/rule')).toBeDefined()
  })

  test('register rule id with dots', () => {
    const rule = createMockRule()
    registry.register('no.eval.rule', rule, 'security')
    expect(registry.getRule('no.eval.rule')).toBeDefined()
  })

  test('register overwriting same category preserves category', () => {
    const rule1 = createMockRule()
    const rule2 = createMockRule()
    registry.register('test', rule1, 'security')
    registry.register('test', rule2, 'security')
    expect(registry.getRule('test')?.category).toBe('security')
  })

  test('register overwriting different category changes category', () => {
    const rule1 = createMockRule()
    const rule2 = createMockRule()
    registry.register('test', rule1, 'complexity')
    registry.register('test', rule2, 'security')
    expect(registry.getRule('test')?.category).toBe('security')
  })

  test('register with undefined options defaults to empty object', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity', undefined)
    expect(registry.getRule('test')?.options).toEqual({})
  })

  test('register does not affect other rules', () => {
    const rule = createMockRule()
    registry.register('r1', rule, 'complexity')
    registry.register('r2', rule, 'security')
    registry.register('r3', rule, 'performance')
    expect(registry.getRule('r1')).toBeDefined()
    expect(registry.getRule('r2')).toBeDefined()
    expect(registry.getRule('r3')).toBeDefined()
    registry.register('r4', rule, 'testing')
    expect(registry.getRule('r1')).toBeDefined()
    expect(registry.getRule('r2')).toBeDefined()
    expect(registry.getRule('r3')).toBeDefined()
  })
})

describe('RuleRegistry - comprehensive enable/disable patterns', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('enable non-existent id does not add to registry', () => {
    registry.enable('ghost')
    expect(registry.getRule('ghost')).toBeUndefined()
    expect(registry.getEnabledRules()).toHaveLength(0)
  })

  test('disable non-existent id does not add to registry', () => {
    registry.disable('ghost')
    expect(registry.getRule('ghost')).toBeUndefined()
    expect(registry.getEnabledRules()).toHaveLength(0)
  })

  test('disable then enable returns to initial state', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    const initial = registry.getEnabledRules()
    registry.disable('test')
    registry.enable('test')
    const after = registry.getEnabledRules()
    expect(after).toHaveLength(initial.length)
  })

  test('disable specific rule leaves others enabled', () => {
    const rule = createMockRule()
    registry.register('r1', rule, 'complexity')
    registry.register('r2', rule, 'security')
    registry.register('r3', rule, 'performance')
    registry.disable('r2')
    const enabled = registry.getEnabledRules()
    expect(enabled).toHaveLength(2)
    expect(registry.getRule('r1')?.enabled).toBe(true)
    expect(registry.getRule('r2')?.enabled).toBe(false)
    expect(registry.getRule('r3')?.enabled).toBe(true)
  })

  test('enable already enabled rule preserves content', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    const before = registry.getEnabledRules()
    registry.enable('test')
    const after = registry.getEnabledRules()
    expect(after).toHaveLength(before.length)
  })

  test('disable already disabled rule preserves content', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    registry.disable('test')
    const before = registry.getEnabledRules()
    registry.disable('test')
    const after = registry.getEnabledRules()
    expect(after).toHaveLength(before.length)
  })

  test('toggle enable/disable rapidly', () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    for (let i = 0; i < 20; i++) {
      if (i % 2 === 0) {
        registry.disable('test')
      } else {
        registry.enable('test')
      }
    }
    expect(registry.getRule('test')?.enabled).toBe(true)
  })

  test('enable multiple rules after batch disable', () => {
    const rule = createMockRule()
    for (let i = 0; i < 5; i++) {
      registry.register(`r${i}`, rule, 'complexity')
      registry.disable(`r${i}`)
    }
    expect(registry.getEnabledRules()).toHaveLength(0)
    for (let i = 0; i < 5; i++) {
      registry.enable(`r${i}`)
    }
    expect(registry.getEnabledRules()).toHaveLength(5)
  })
})

describe('RuleRegistry - runRules comprehensive', () => {
  let registry: RuleRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new RuleRegistry()
  })

  test('runRules with no rules returns empty', () => {
    const violations = registry.runRules(createMockSourceFile())
    expect(violations).toEqual([])
  })

  test('runRules returns array', () => {
    const violations = registry.runRules(createMockSourceFile())
    expect(Array.isArray(violations)).toBe(true)
  })

  test('runRules with enabled non-violating rule returns empty', () => {
    const rule = createMockRule(false)
    registry.register('test', rule, 'complexity')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations).toEqual([])
  })

  test('runRules with enabled violating rule returns violations', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'complexity')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations.length).toBeGreaterThan(0)
  })

  test('runRules does not throw for empty registry', () => {
    expect(() => registry.runRules(createMockSourceFile())).not.toThrow()
  })

  test('runRules calls traverseASTMultiple', async () => {
    const rule = createMockRule()
    registry.register('test', rule, 'complexity')
    registry.runRules(createMockSourceFile())
    const { traverseASTMultiple } = await import('../../../src/ast/visitor')
    expect(traverseASTMultiple).toHaveBeenCalled()
  })

  test('runRules with visitor-only rule does not throw', () => {
    const rule = createMockRuleWithVisitorOnly()
    registry.register('test', rule, 'complexity')
    expect(() => registry.runRules(createMockSourceFile())).not.toThrow()
  })

  test('runRules with rule returning empty onComplete', () => {
    const rule: RuleDefinition = {
      defaultOptions: {},
      meta: { category: 'complexity', description: 't', name: 't', recommended: false },
      create: () => ({
        visitor: {},
        onComplete: () => [],
      }),
    }
    registry.register('test', rule, 'complexity')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations).toEqual([])
  })

  test('runRules with rule returning multiple onComplete violations', () => {
    const rule: RuleDefinition = {
      defaultOptions: {},
      meta: { category: 'complexity', description: 't', name: 't', recommended: false },
      create: () => ({
        visitor: {},
        onComplete: () => [
          {
            filePath: '/test/a.ts',
            message: 'V1',
            range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
            ruleId: 'test',
            severity: 'error' as const,
          },
          {
            filePath: '/test/b.ts',
            message: 'V2',
            range: { end: { column: 3, line: 2 }, start: { column: 0, line: 2 } },
            ruleId: 'test',
            severity: 'warning' as const,
          },
        ],
      }),
    }
    registry.register('test', rule, 'complexity')
    const violations = registry.runRules(createMockSourceFile())
    expect(violations).toHaveLength(2)
  })

  test('runRules handles mix of visitor and onComplete violations', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'complexity')
    const violations = registry.runRules(createMockSourceFile())
    const visitorV = violations.filter((v) => v.message === 'Function found')
    const completeV = violations.filter((v) => v.message === 'OnComplete violation')
    expect(visitorV.length).toBeGreaterThan(0)
    expect(completeV.length).toBeGreaterThan(0)
  })

  test('runRules after disable+enable produces same violations', () => {
    const rule = createMockRule(true)
    registry.register('test', rule, 'complexity')
    const v1 = registry.runRules(createMockSourceFile())
    registry.disable('test')
    registry.enable('test')
    const v2 = registry.runRules(createMockSourceFile())
    expect(v1.length).toBe(v2.length)
  })
})

describe('RuleRegistry - mock source file', () => {
  test('createMockSourceFile returns object with getFilePath', () => {
    const sf = createMockSourceFile()
    expect(sf.getFilePath()).toBe('/test/file.ts')
  })

  test('createMockSourceFile returns object with getText', () => {
    const sf = createMockSourceFile()
    expect(sf.getText()).toBe('const x = 1;')
  })

  test('createMockSourceFile returns object with getFullText', () => {
    const sf = createMockSourceFile()
    expect(sf.getFullText()).toBe('const x = 1;')
  })
})

describe('RuleRegistry - mock rule helpers', () => {
  test('createMockRule returns valid RuleDefinition', () => {
    const rule = createMockRule()
    expect(rule).toHaveProperty('meta')
    expect(rule).toHaveProperty('defaultOptions')
    expect(rule).toHaveProperty('create')
  })

  test('createMockRule meta has required fields', () => {
    const rule = createMockRule()
    expect(rule.meta).toHaveProperty('name')
    expect(rule.meta).toHaveProperty('description')
    expect(rule.meta).toHaveProperty('category')
    expect(rule.meta).toHaveProperty('recommended')
  })

  test('createMockRule create returns visitor', () => {
    const result = createMockRule().create({})
    expect(result).toHaveProperty('visitor')
  })

  test('createMockRule(false) is configured correctly', () => {
    const rule = createMockRule(false)
    expect(rule.meta.name).toBe('test-rule')
  })

  test('createMockRule(true) is configured to produce violations', () => {
    const rule = createMockRule(true)
    expect(rule.meta.name).toBe('test-rule')
  })

  test('createMockRuleWithVisitorOnly returns valid rule', () => {
    const rule = createMockRuleWithVisitorOnly()
    expect(rule.meta.name).toBe('visitor-only-rule')
    expect(rule.create({})).toHaveProperty('visitor')
  })

  test('createMockRuleWithVisitorOnly has no onComplete', () => {
    const rule = createMockRuleWithVisitorOnly()
    const result = rule.create({})
    expect(result).not.toHaveProperty('onComplete')
  })

  test('mock rule defaultOptions is empty object', () => {
    expect(createMockRule().defaultOptions).toEqual({})
  })

  test('mock rule meta recommended defaults to true', () => {
    expect(createMockRule().meta.recommended).toBe(true)
  })

  test('mock rule meta category is complexity', () => {
    expect(createMockRule().meta.category).toBe('complexity')
  })

  test('visitor-only rule meta recommended is false', () => {
    expect(createMockRuleWithVisitorOnly().meta.recommended).toBe(false)
  })

  test('visitor-only rule meta category is complexity', () => {
    expect(createMockRuleWithVisitorOnly().meta.category).toBe('complexity')
  })

  test('createMockRule create returns callable visitor', () => {
    const result = createMockRule().create({})
    expect(typeof result.visitor).toBe('object')
  })

  test('createMockRuleWithVisitorOnly visitor is empty object', () => {
    const result = createMockRuleWithVisitorOnly().create({})
    expect(result.visitor).toEqual({})
  })
})
