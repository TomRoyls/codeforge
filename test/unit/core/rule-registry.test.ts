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
})
