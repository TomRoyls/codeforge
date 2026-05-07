import { describe, expect, it, vi } from 'vitest'
import type { SourceFile } from 'ts-morph'
import { applyFixesToFile, applyFixesToFiles, type RuleWithFix } from '../../../src/fix/fixer.js'
import type { FileFixReport, FixReport, FixResult, TextChange } from '../../../src/fix/types.js'
import type { RuleViolation } from '../../../src/ast/visitor.js'
import { RuleRegistry, createDefaultRegistry } from '../../../src/core/rule-registry.js'
import { allRules, getRule, getRuleIds, getRuleCategory } from '../../helpers/rule-helpers.js'
import { renderTextChangesAsDiff, formatDiffForConsole } from '../../../src/fix/diff-renderer.js'

function createMockSourceFile(text: string): SourceFile {
  return {
    getFilePath: () => '/test/file.ts',
    getFullText: () => text,
    replaceText: vi.fn(),
    saveSync: vi.fn(),
  } as unknown as SourceFile
}

function createMockViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: '/test/file.ts',
    message: 'Test violation',
    range: {
      end: { column: 10, line: 1 },
      start: { column: 0, line: 1 },
    },
    ruleId: 'test-rule',
    severity: 'warning',
    ...overrides,
  }
}

describe('Fix Integration', () => {
  describe('Rule Registry', () => {
    it('registers and runs rules', () => {
      const registry = new RuleRegistry()

      expect(registry.getEnabledRules()).toHaveLength(0)

      registry.register('test-rule', allRules['max-depth']!, 'complexity')

      expect(registry.getEnabledRules()).toHaveLength(1)
    })

    it('can enable and disable rules', () => {
      const registry = new RuleRegistry()
      registry.register('test-rule', allRules['max-depth']!, 'complexity')

      registry.disable('test-rule')
      expect(registry.getEnabledRules()).toHaveLength(0)

      registry.enable('test-rule')
      expect(registry.getEnabledRules()).toHaveLength(1)
    })
  })

  describe('Fix Application', () => {
    it('applies single fix correctly', () => {
      const sourceFile = createMockSourceFile('const x = 1;')
      const violation = createMockViolation()

      const rulesWithFixes = new Map<string, RuleWithFix>([
        [
          'test-rule',
          {
            fix: (): FixResult => ({
              applied: true,
              changes: [
                {
                  end: 11,
                  newText: 'let x = 1;',
                  oldText: 'const x = 1;',
                  start: 0,
                },
              ],
            }),
            id: 'test-rule',
            priority: 1,
          },
        ],
      ])

      const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)

      expect(report.fixesApplied).toBe(1)
      expect(report.changes).toHaveLength(1)
    })

    it('detects conflicting fixes', () => {
      const sourceFile = createMockSourceFile('const x = 1;')
      const violation1 = createMockViolation({
        range: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
      })
      const violation2 = createMockViolation({
        range: { end: { column: 15, line: 1 }, start: { column: 5, line: 1 } },
        ruleId: 'conflict-rule',
      })

      const rulesWithFixes = new Map<string, RuleWithFix>([
        [
          'test-rule',
          {
            fix: (): FixResult => ({
              applied: true,
              changes: [{ end: 10, newText: 'a', oldText: 'const x = ', start: 0 }],
            }),
            id: 'test-rule',
            priority: 1,
          },
        ],
        [
          'conflict-rule',
          {
            fix: (): FixResult => ({
              applied: true,
              changes: [{ end: 15, newText: 'b', oldText: 'x = 1;', start: 5 }],
            }),
            id: 'conflict-rule',
            priority: 2,
          },
        ],
      ])

      const report = applyFixesToFile(sourceFile, [violation1, violation2], rulesWithFixes, false)

      expect(report.fixesApplied).toBe(1)
      expect(report.fixesSkipped).toBe(1)
      expect(report.conflicts).toHaveLength(1)
    })

    it('respects dry-run mode', () => {
      const sourceFile = createMockSourceFile('const x = 1;')
      const violation = createMockViolation()

      const rulesWithFixes = new Map<string, RuleWithFix>([
        [
          'test-rule',
          {
            fix: (): FixResult => ({
              applied: true,
              changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
            }),
            id: 'test-rule',
            priority: 1,
          },
        ],
      ])

      const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, true)

      expect(report.fixesApplied).toBe(1)
      expect(sourceFile.replaceText).not.toHaveBeenCalled()
    })
  })

  describe('Rule System Integration', () => {
    it('loads all rules from registry', () => {
      expect(Object.keys(allRules).length).toBeGreaterThan(0)
    })

    it('all rules have required properties', () => {
      for (const [ruleId, rule] of Object.entries(allRules)) {
        expect(rule.meta).toBeDefined()
        expect(rule.meta.name).toBe(ruleId)
        expect(rule.defaultOptions).toBeDefined()
        expect(rule.create).toBeDefined()
      }
    })
  })
})

describe('RuleRegistry', () => {
  describe('constructor', () => {
    it('creates an empty registry', () => {
      const registry = new RuleRegistry()
      expect(registry.getEnabledRules()).toHaveLength(0)
    })

    it('starts with no rules', () => {
      const registry = new RuleRegistry()
      expect(registry.getRule('nonexistent')).toBeUndefined()
    })
  })

  describe('register', () => {
    it('registers a rule with default options', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'complexity')
      expect(registry.getEnabledRules()).toHaveLength(1)
    })

    it('registers a rule with custom options', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'complexity', { max: 5 })
      const rule = registry.getRule('my-rule')
      expect(rule).toBeDefined()
      expect(rule!.options).toEqual({ max: 5 })
    })

    it('registers multiple rules', () => {
      const registry = new RuleRegistry()
      registry.register('rule-a', allRules['max-depth']!, 'complexity')
      registry.register('rule-b', allRules['max-params']!, 'complexity')
      registry.register('rule-c', allRules['max-lines']!, 'complexity')
      expect(registry.getEnabledRules()).toHaveLength(3)
    })

    it('overwrites a rule with the same ID', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'complexity')
      registry.register('my-rule', allRules['max-params']!, 'complexity')
      expect(registry.getEnabledRules()).toHaveLength(1)
      const rule = registry.getRule('my-rule')
      expect(rule!.definition).toBe(allRules['max-params']!)
    })

    it('stores the category', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'security')
      const rule = registry.getRule('my-rule')
      expect(rule!.category).toBe('security')
    })

    it('registers rule as enabled by default', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'complexity')
      const rule = registry.getRule('my-rule')
      expect(rule!.enabled).toBe(true)
    })

    it('invalidates enabled rules cache on register', () => {
      const registry = new RuleRegistry()
      const first = registry.getEnabledRules()
      registry.register('my-rule', allRules['max-depth']!, 'complexity')
      const second = registry.getEnabledRules()
      expect(first).toHaveLength(0)
      expect(second).toHaveLength(1)
    })
  })

  describe('enable', () => {
    it('enables a disabled rule', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'complexity')
      registry.disable('my-rule')
      expect(registry.getEnabledRules()).toHaveLength(0)
      registry.enable('my-rule')
      expect(registry.getEnabledRules()).toHaveLength(1)
    })

    it('does nothing for non-existent rule', () => {
      const registry = new RuleRegistry()
      registry.enable('nonexistent')
      expect(registry.getEnabledRules()).toHaveLength(0)
    })

    it('keeps enabled rule enabled', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'complexity')
      registry.enable('my-rule')
      expect(registry.getEnabledRules()).toHaveLength(1)
    })

    it('invalidates enabled rules cache', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'complexity')
      registry.disable('my-rule')
      const before = registry.getEnabledRules()
      registry.enable('my-rule')
      const after = registry.getEnabledRules()
      expect(before).toHaveLength(0)
      expect(after).toHaveLength(1)
    })
  })

  describe('disable', () => {
    it('disables an enabled rule', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'complexity')
      registry.disable('my-rule')
      expect(registry.getEnabledRules()).toHaveLength(0)
    })

    it('does nothing for non-existent rule', () => {
      const registry = new RuleRegistry()
      registry.disable('nonexistent')
      expect(registry.getEnabledRules()).toHaveLength(0)
    })

    it('sets enabled to false on the rule', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'complexity')
      registry.disable('my-rule')
      const rule = registry.getRule('my-rule')
      expect(rule!.enabled).toBe(false)
    })

    it('invalidates enabled rules cache', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'complexity')
      const before = registry.getEnabledRules()
      registry.disable('my-rule')
      const after = registry.getEnabledRules()
      expect(before).toHaveLength(1)
      expect(after).toHaveLength(0)
    })

    it('keeps disabled rule disabled', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'complexity')
      registry.disable('my-rule')
      registry.disable('my-rule')
      expect(registry.getEnabledRules()).toHaveLength(0)
    })
  })

  describe('getEnabledRules', () => {
    it('returns only enabled rules', () => {
      const registry = new RuleRegistry()
      registry.register('rule-a', allRules['max-depth']!, 'complexity')
      registry.register('rule-b', allRules['max-params']!, 'complexity')
      registry.register('rule-c', allRules['max-lines']!, 'complexity')
      registry.disable('rule-b')
      const enabled = registry.getEnabledRules()
      expect(enabled).toHaveLength(2)
      expect(enabled.every((r) => r.enabled)).toBe(true)
    })

    it('returns cached result on second call', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'complexity')
      const first = registry.getEnabledRules()
      const second = registry.getEnabledRules()
      expect(first).toBe(second)
    })

    it('returns empty array when all rules disabled', () => {
      const registry = new RuleRegistry()
      registry.register('rule-a', allRules['max-depth']!, 'complexity')
      registry.register('rule-b', allRules['max-params']!, 'complexity')
      registry.disable('rule-a')
      registry.disable('rule-b')
      expect(registry.getEnabledRules()).toHaveLength(0)
    })

    it('returns all rules when all enabled', () => {
      const registry = new RuleRegistry()
      registry.register('rule-a', allRules['max-depth']!, 'complexity')
      registry.register('rule-b', allRules['max-params']!, 'complexity')
      expect(registry.getEnabledRules()).toHaveLength(2)
    })
  })

  describe('getRule', () => {
    it('returns a registered rule', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'complexity')
      const rule = registry.getRule('my-rule')
      expect(rule).toBeDefined()
      expect(rule!.definition).toBe(allRules['max-depth']!)
    })

    it('returns undefined for non-existent rule', () => {
      const registry = new RuleRegistry()
      expect(registry.getRule('nonexistent')).toBeUndefined()
    })

    it('returns rule with correct options', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'complexity', { max: 10 })
      const rule = registry.getRule('my-rule')
      expect(rule!.options).toEqual({ max: 10 })
    })

    it('returns rule with correct category', () => {
      const registry = new RuleRegistry()
      registry.register('my-rule', allRules['max-depth']!, 'performance')
      const rule = registry.getRule('my-rule')
      expect(rule!.category).toBe('performance')
    })
  })

  describe('createDefaultRegistry', () => {
    it('creates a new RuleRegistry instance', () => {
      const registry = createDefaultRegistry()
      expect(registry).toBeInstanceOf(RuleRegistry)
    })

    it('creates an empty registry', () => {
      const registry = createDefaultRegistry()
      expect(registry.getEnabledRules()).toHaveLength(0)
    })

    it('creates independent instances', () => {
      const reg1 = createDefaultRegistry()
      const reg2 = createDefaultRegistry()
      reg1.register('rule', allRules['max-depth']!, 'complexity')
      expect(reg1.getEnabledRules()).toHaveLength(1)
      expect(reg2.getEnabledRules()).toHaveLength(0)
    })
  })
})

describe('applyFixesToFile', () => {
  it('returns correct filePath in report', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({ applied: true, changes: [] }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.filePath).toBe('/test/file.ts')
  })

  it('returns zero fixes when no violations', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const rulesWithFixes = new Map<string, RuleWithFix>()
    const report = applyFixesToFile(sourceFile, [], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
    expect(report.changes).toHaveLength(0)
    expect(report.conflicts).toHaveLength(0)
  })

  it('returns zero fixes when no matching rules', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation({ ruleId: 'unknown-rule' })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'other-rule',
        {
          fix: (): FixResult => ({ applied: true, changes: [] }),
          id: 'other-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(0)
  })

  it('returns zero fixes when violations is empty array', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({ applied: true, changes: [] }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(0)
  })

  it('applies fix with multiple changes', () => {
    const sourceFile = createMockSourceFile('const x = 1; const y = 2;')
    const violation = createMockViolation()
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [
              { end: 5, newText: 'let', oldText: 'const', start: 0 },
              { end: 16, newText: 'let', oldText: 'const', start: 11 },
            ],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.changes).toHaveLength(2)
  })

  it('does not apply changes when fix returns applied=false', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({ applied: false, changes: [] }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(0)
  })

  it('does not apply changes when fix returns null', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: () => null,
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(0)
  })

  it('records conflict when fix returns conflict result', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: { conflictingRule: 'other-rule', reason: 'Cannot fix' },
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesSkipped).toBe(1)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0]!.conflictingRule).toBe('other-rule')
    expect(report.conflicts[0]!.reason).toBe('Cannot fix')
    expect(report.conflicts[0]!.ruleId).toBe('test-rule')
  })

  it('sorts fixes by priority', () => {
    const sourceFile = createMockSourceFile('aaaa bbbb cccc')
    const violation1 = createMockViolation({
      range: { end: { column: 4, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'low-priority',
    })
    const violation2 = createMockViolation({
      range: { end: { column: 9, line: 1 }, start: { column: 5, line: 1 } },
      ruleId: 'high-priority',
    })
    const fixCallOrder: string[] = []
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'low-priority',
        {
          fix: () => {
            fixCallOrder.push('low')
            return {
              applied: true,
              changes: [{ end: 4, newText: 'AAAA', oldText: 'aaaa', start: 0 }],
            }
          },
          id: 'low-priority',
          priority: 10,
        },
      ],
      [
        'high-priority',
        {
          fix: () => {
            fixCallOrder.push('high')
            return {
              applied: true,
              changes: [{ end: 9, newText: 'BBBB', oldText: 'bbbb', start: 5 }],
            }
          },
          id: 'high-priority',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation1, violation2], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(2)
    expect(fixCallOrder[0]).toBe('high')
    expect(fixCallOrder[1]).toBe('low')
  })

  it('applies changes to source file in non-dry-run mode', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(sourceFile.replaceText).toHaveBeenCalled()
  })

  it('does not call replaceText when no changes to apply', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const rulesWithFixes = new Map<string, RuleWithFix>()
    applyFixesToFile(sourceFile, [], rulesWithFixes, false)
    expect(sourceFile.replaceText).not.toHaveBeenCalled()
  })

  it('detects overlapping start within applied range', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation1 = createMockViolation({
      range: { end: { column: 6, line: 1 }, start: { column: 0, line: 1 } },
    })
    const violation2 = createMockViolation({
      range: { end: { column: 10, line: 1 }, start: { column: 3, line: 1 } },
      ruleId: 'overlap-rule',
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 6, newText: 'let x', oldText: 'const ', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
      [
        'overlap-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 10, newText: 'y', oldText: 'x = 1', start: 3 }],
          }),
          id: 'overlap-rule',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation1, violation2], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
  })

  it('detects overlapping end within applied range', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation1 = createMockViolation({
      range: { end: { column: 10, line: 1 }, start: { column: 5, line: 1 } },
    })
    const violation2 = createMockViolation({
      range: { end: { column: 12, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'enclosing-rule',
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 10, newText: 'z = 1', oldText: 'x = 1', start: 5 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
      [
        'enclosing-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 12, newText: 'let z = 1;', oldText: 'const x = 1;', start: 0 }],
          }),
          id: 'enclosing-rule',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation1, violation2], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
  })

  it('detects when new range completely encloses applied range', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation1 = createMockViolation({
      range: { end: { column: 8, line: 1 }, start: { column: 6, line: 1 } },
    })
    const violation2 = createMockViolation({
      range: { end: { column: 12, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'big-rule',
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 8, newText: 'y', oldText: 'x ', start: 6 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
      [
        'big-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 12, newText: 'let y = 1;', oldText: 'const x = 1;', start: 0 }],
          }),
          id: 'big-rule',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation1, violation2], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
  })

  it('allows non-overlapping fixes from different rules', () => {
    const sourceFile = createMockSourceFile('const x = 1; const y = 2;')
    const violation1 = createMockViolation({
      range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
    })
    const violation2 = createMockViolation({
      range: { end: { column: 17, line: 1 }, start: { column: 12, line: 1 } },
      ruleId: 'rule-b',
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
      [
        'rule-b',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 17, newText: 'let', oldText: 'const', start: 12 }],
          }),
          id: 'rule-b',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation1, violation2], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(2)
    expect(report.fixesSkipped).toBe(0)
  })

  it('handles empty rulesWithFixes map', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    const rulesWithFixes = new Map<string, RuleWithFix>()
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
  })

  it('handles violations from rules without fixes', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation({ ruleId: 'no-fix-rule' })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'other-rule',
        {
          fix: (): FixResult => ({ applied: true, changes: [] }),
          id: 'other-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(0)
  })

  it('passes sourceFile and violation to fix function', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    let receivedSourceFile: SourceFile | undefined
    let receivedViolation: RuleViolation | undefined
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (ctx) => {
            receivedSourceFile = ctx.sourceFile
            receivedViolation = ctx.violation
            return { applied: true, changes: [] }
          },
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(receivedSourceFile).toBe(sourceFile)
    expect(receivedViolation).toBe(violation)
  })

  it('provides getNodeByRange in context', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    let hasGetNodeByRange = false
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (ctx) => {
            hasGetNodeByRange = typeof ctx.getNodeByRange === 'function'
            return { applied: true, changes: [] }
          },
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(hasGetNodeByRange).toBe(true)
  })

  it('handles multi-line source text position calculation', () => {
    const sourceFile = createMockSourceFile('line1\nline2\nline3')
    const violation = createMockViolation({
      range: {
        end: { column: 5, line: 2 },
        start: { column: 0, line: 2 },
      },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 11, newText: 'LINE', oldText: 'line2', start: 6 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles violations on different lines', () => {
    const sourceFile = createMockSourceFile('const a = 1;\nconst b = 2;\nconst c = 3;')
    const violation1 = createMockViolation({
      range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
    })
    const violation2 = createMockViolation({
      range: { end: { column: 5, line: 2 }, start: { column: 0, line: 2 } },
      ruleId: 'rule-b',
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
      [
        'rule-b',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 18, newText: 'let', oldText: 'const', start: 13 }],
          }),
          id: 'rule-b',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation1, violation2], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(2)
  })

  it('skips fix when rule is not in map after initial filter', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({ applied: true, changes: [] }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    rulesWithFixes.delete('test-rule')
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(0)
  })

  it('handles fix with empty oldText and newText', () => {
    const sourceFile = createMockSourceFile('')
    const violation = createMockViolation({
      range: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 0, newText: '', oldText: '', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('tracks conflict with correct conflictingRule from rangesApplied', () => {
    const sourceFile = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      range: { end: { column: 3, line: 1 }, start: { column: 0, line: 1 } },
    })
    const v2 = createMockViolation({
      range: { end: { column: 5, line: 1 }, start: { column: 2, line: 1 } },
      ruleId: 'overlap',
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 3, newText: 'ABC', oldText: 'abc', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
      [
        'overlap',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'CDE', oldText: 'cdef', start: 2 }],
          }),
          id: 'overlap',
          priority: 5,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [v1, v2], rulesWithFixes, false)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0]!.conflictingRule).toBe('test-rule')
  })

  it('default dryRun is false', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sourceFile, [violation], rulesWithFixes)
    expect(sourceFile.replaceText).toHaveBeenCalled()
  })
})

describe('applyFixesToFiles', () => {
  it('processes multiple files', () => {
    const sourceFile1 = createMockSourceFile('const x = 1;')
    const sourceFile2 = createMockSourceFile('const y = 2;')
    const violation1 = createMockViolation()
    const violation2 = createMockViolation({ message: 'Violation in file 2' })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFiles(
      [
        { sourceFile: sourceFile1, violations: [violation1] },
        { sourceFile: sourceFile2, violations: [violation2] },
      ],
      rulesWithFixes,
      false,
    )
    expect(report.filesProcessed).toBe(2)
    expect(report.totalFixesApplied).toBe(2)
    expect(report.fileReports).toHaveLength(2)
  })

  it('aggregates totalFixesSkipped across files', () => {
    const sourceFile1 = createMockSourceFile('const x = 1;')
    const sourceFile2 = createMockSourceFile('const y = 2;')
    const v1 = createMockViolation({
      range: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
    })
    const v2 = createMockViolation({
      range: { end: { column: 8, line: 1 }, start: { column: 3, line: 1 } },
      ruleId: 'conflict-rule',
    })
    const v3 = createMockViolation({ message: 'File 2 violation' })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 10, newText: 'let x = 1;', oldText: 'const x = 1;', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
      [
        'conflict-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 8, newText: 'y', oldText: 'x = 1', start: 3 }],
          }),
          id: 'conflict-rule',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFiles(
      [
        { sourceFile: sourceFile1, violations: [v1, v2] },
        { sourceFile: sourceFile2, violations: [v3] },
      ],
      rulesWithFixes,
      false,
    )
    expect(report.totalFixesSkipped).toBe(1)
    expect(report.totalFixesApplied).toBe(2)
  })

  it('returns empty report for empty files array', () => {
    const rulesWithFixes = new Map<string, RuleWithFix>()
    const report = applyFixesToFiles([], rulesWithFixes, false)
    expect(report.filesProcessed).toBe(0)
    expect(report.totalFixesApplied).toBe(0)
    expect(report.totalFixesSkipped).toBe(0)
    expect(report.fileReports).toHaveLength(0)
  })

  it('respects dry-run mode for all files', () => {
    const sourceFile1 = createMockSourceFile('const x = 1;')
    const sourceFile2 = createMockSourceFile('const y = 2;')
    const violation = createMockViolation()
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    applyFixesToFiles(
      [
        { sourceFile: sourceFile1, violations: [violation] },
        { sourceFile: sourceFile2, violations: [violation] },
      ],
      rulesWithFixes,
      true,
    )
    expect(sourceFile1.replaceText).not.toHaveBeenCalled()
    expect(sourceFile2.replaceText).not.toHaveBeenCalled()
  })

  it('handles files with no violations', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const rulesWithFixes = new Map<string, RuleWithFix>()
    const report = applyFixesToFiles([{ sourceFile, violations: [] }], rulesWithFixes, false)
    expect(report.filesProcessed).toBe(1)
    expect(report.totalFixesApplied).toBe(0)
    expect(report.fileReports).toHaveLength(1)
  })

  it('preserves individual file report details', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation()
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFiles(
      [{ sourceFile, violations: [violation] }],
      rulesWithFixes,
      false,
    )
    const fileReport = report.fileReports[0]!
    expect(fileReport.filePath).toBe('/test/file.ts')
    expect(fileReport.fixesApplied).toBe(1)
    expect(fileReport.changes).toHaveLength(1)
  })
})

describe('renderTextChangesAsDiff', () => {
  it('returns empty hunks for empty changes', () => {
    const diff = renderTextChangesAsDiff([], '/test/file.ts')
    expect(diff.filePath).toBe('/test/file.ts')
    expect(diff.hunks).toHaveLength(0)
  })

  it('creates hunks for single change', () => {
    const changes: TextChange[] = [{ end: 5, newText: 'let', oldText: 'const', start: 0 }]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    expect(diff.hunks).toHaveLength(1)
    expect(diff.hunks[0]!.header).toBe('@@ -0,+5 @@')
  })

  it('creates remove and add lines for each change', () => {
    const changes: TextChange[] = [{ end: 5, newText: 'let x', oldText: 'const x', start: 0 }]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    const hunk = diff.hunks[0]!
    const removeLines = hunk.changes.filter((l) => l.type === 'remove')
    const addLines = hunk.changes.filter((l) => l.type === 'add')
    expect(removeLines).toHaveLength(1)
    expect(addLines).toHaveLength(1)
  })

  it('handles multi-line oldText', () => {
    const changes: TextChange[] = [{ end: 15, newText: 'a', oldText: 'line1\nline2', start: 0 }]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    const hunk = diff.hunks[0]!
    const removeLines = hunk.changes.filter((l) => l.type === 'remove')
    expect(removeLines).toHaveLength(2)
  })

  it('handles multi-line newText', () => {
    const changes: TextChange[] = [{ end: 5, newText: 'new\nline', oldText: 'old', start: 0 }]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    const hunk = diff.hunks[0]!
    const addLines = hunk.changes.filter((l) => l.type === 'add')
    expect(addLines).toHaveLength(2)
  })

  it('creates multiple hunks for multiple changes', () => {
    const changes: TextChange[] = [
      { end: 5, newText: 'a', oldText: 'b', start: 0 },
      { end: 15, newText: 'c', oldText: 'd', start: 10 },
    ]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    expect(diff.hunks).toHaveLength(2)
  })

  it('sorts changes by start position', () => {
    const changes: TextChange[] = [
      { end: 15, newText: 'c', oldText: 'd', start: 10 },
      { end: 5, newText: 'a', oldText: 'b', start: 0 },
    ]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    expect(diff.hunks[0]!.header).toContain('-0')
    expect(diff.hunks[1]!.header).toContain('-10')
  })

  it('preserves filePath in result', () => {
    const diff = renderTextChangesAsDiff([], '/my/custom/path.ts')
    expect(diff.filePath).toBe('/my/custom/path.ts')
  })

  it('handles single-line oldText and newText', () => {
    const changes: TextChange[] = [{ end: 6, newText: 'let', oldText: 'const', start: 0 }]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    const hunk = diff.hunks[0]!
    expect(hunk.changes[0]!.type).toBe('remove')
    expect(hunk.changes[0]!.content).toBe('const')
    expect(hunk.changes[1]!.type).toBe('add')
    expect(hunk.changes[1]!.content).toBe('let')
  })
})

describe('formatDiffForConsole', () => {
  it('returns empty string for diff with no hunks', () => {
    const diff = renderTextChangesAsDiff([], '/test/file.ts')
    const output = formatDiffForConsole(diff)
    expect(output).toBe('')
  })

  it('includes file path in output', () => {
    const changes: TextChange[] = [{ end: 5, newText: 'let', oldText: 'const', start: 0 }]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    const output = formatDiffForConsole(diff)
    expect(output).toContain('/test/file.ts')
  })

  it('includes hunk headers', () => {
    const changes: TextChange[] = [{ end: 5, newText: 'let', oldText: 'const', start: 0 }]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    const output = formatDiffForConsole(diff)
    expect(output).toContain('@@ -0,+5 @@')
  })

  it('includes + and - prefixes for changes', () => {
    const changes: TextChange[] = [{ end: 6, newText: 'let', oldText: 'const', start: 0 }]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    const output = formatDiffForConsole(diff)
    expect(output).toContain('- const')
    expect(output).toContain('+ let')
  })

  it('handles multiple hunks', () => {
    const changes: TextChange[] = [
      { end: 5, newText: 'a', oldText: 'b', start: 0 },
      { end: 15, newText: 'c', oldText: 'd', start: 10 },
    ]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    const output = formatDiffForConsole(diff)
    const headerCount = output.split('@@').length - 1
    expect(headerCount).toBeGreaterThanOrEqual(2)
  })

  it('includes fix preview indicator', () => {
    const changes: TextChange[] = [{ end: 5, newText: 'let', oldText: 'const', start: 0 }]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    const output = formatDiffForConsole(diff)
    expect(output).toContain('fix preview')
  })
})

describe('Rule System Integration', () => {
  it('loads all rules from registry', () => {
    expect(Object.keys(allRules).length).toBeGreaterThan(0)
  })

  it('all rules have required properties', () => {
    for (const [ruleId, rule] of Object.entries(allRules)) {
      expect(rule.meta).toBeDefined()
      expect(rule.meta.name).toBe(ruleId)
      expect(rule.defaultOptions).toBeDefined()
      expect(rule.create).toBeDefined()
    }
  })

  it('all rules have meta.name matching their key', () => {
    for (const [ruleId, rule] of Object.entries(allRules)) {
      expect(rule.meta.name).toBe(ruleId)
    }
  })

  it('all rules have meta.category', () => {
    for (const rule of Object.values(allRules)) {
      expect(rule.meta.category).toBeDefined()
      expect(typeof rule.meta.category).toBe('string')
    }
  })

  it('all rules have meta.description', () => {
    for (const rule of Object.values(allRules)) {
      expect(rule.meta.description).toBeDefined()
      expect(typeof rule.meta.description).toBe('string')
      expect(rule.meta.description.length).toBeGreaterThan(0)
    }
  })

  it('all rules have create method that returns visitor', () => {
    for (const [ruleId, rule] of Object.entries(allRules)) {
      const result = rule.create(rule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(typeof result.visitor).toBe('object')
    }
  })

  it('all rules return valid default options', () => {
    for (const rule of Object.values(allRules)) {
      expect(rule.defaultOptions).toBeDefined()
      expect(typeof rule.defaultOptions).toBe('object')
    }
  })

  it('getRule returns undefined for non-existent rule', () => {
    expect(getRule('non-existent-rule-xyz')).toBeUndefined()
  })

  it('getRule returns rule for valid ID', () => {
    const firstRuleId = Object.keys(allRules)[0]!
    const rule = getRule(firstRuleId)
    expect(rule).toBeDefined()
    expect(rule!.meta.name).toBe(firstRuleId)
  })

  it('getRuleIds returns all rule IDs', () => {
    const ids = getRuleIds()
    expect(ids.length).toBe(Object.keys(allRules).length)
    for (const id of ids) {
      expect(allRules[id]).toBeDefined()
    }
  })

  it('getRuleCategory returns category for known rule', () => {
    const cat = getRuleCategory('max-depth')
    expect(cat).toBe('complexity')
  })

  it('getRuleCategory returns default for unknown rule', () => {
    const cat = getRuleCategory('unknown-rule-xyz')
    expect(cat).toBe('complexity')
  })

  it('all rule IDs in allRules are unique', () => {
    const ids = Object.keys(allRules)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('all rule categories are valid', () => {
    const validCategories = [
      'complexity',
      'dependencies',
      'performance',
      'security',
      'patterns',
      'correctness',
      'testing',
      'style',
    ]
    for (const rule of Object.values(allRules)) {
      expect(validCategories).toContain(rule.meta.category)
    }
  })

  it('complexity rules exist', () => {
    expect(allRules['max-depth']).toBeDefined()
    expect(allRules['max-params']).toBeDefined()
    expect(allRules['max-lines']).toBeDefined()
    expect(allRules['max-lines-per-function']).toBeDefined()
    expect(allRules['max-complexity']).toBeDefined()
  })

  it('performance rules exist', () => {
    expect(allRules['no-await-in-loop']).toBeDefined()
    expect(allRules['no-sync-in-async']).toBeDefined()
  })

  it('security rules exist', () => {
    expect(allRules['no-eval']).toBeDefined()
    expect(allRules['no-deprecated-api']).toBeDefined()
  })

  it('pattern rules exist', () => {
    expect(allRules['prefer-const']).toBeDefined()
    expect(allRules['eq-eq-eq']).toBeDefined()
  })

  it('dependency rules exist', () => {
    expect(allRules['no-circular-deps']).toBeDefined()
    expect(allRules['no-unused-exports']).toBeDefined()
  })

  it('testing rules exist', () => {
    expect(allRules['no-skipped-tests']).toBeDefined()
    expect(allRules['no-focused-tests']).toBeDefined()
  })
})

describe('createMockViolation helper', () => {
  it('creates violation with default values', () => {
    const v = createMockViolation()
    expect(v.filePath).toBe('/test/file.ts')
    expect(v.message).toBe('Test violation')
    expect(v.ruleId).toBe('test-rule')
    expect(v.severity).toBe('warning')
    expect(v.range.start.line).toBe(1)
    expect(v.range.start.column).toBe(0)
    expect(v.range.end.line).toBe(1)
    expect(v.range.end.column).toBe(10)
  })

  it('overrides filePath', () => {
    const v = createMockViolation({ filePath: '/other/path.ts' })
    expect(v.filePath).toBe('/other/path.ts')
  })

  it('overrides message', () => {
    const v = createMockViolation({ message: 'Custom message' })
    expect(v.message).toBe('Custom message')
  })

  it('overrides ruleId', () => {
    const v = createMockViolation({ ruleId: 'custom-rule' })
    expect(v.ruleId).toBe('custom-rule')
  })

  it('overrides severity', () => {
    const v = createMockViolation({ severity: 'error' })
    expect(v.severity).toBe('error')
  })

  it('overrides range', () => {
    const v = createMockViolation({
      range: { start: { line: 5, column: 2 }, end: { line: 5, column: 10 } },
    })
    expect(v.range.start.line).toBe(5)
    expect(v.range.start.column).toBe(2)
    expect(v.range.end.line).toBe(5)
    expect(v.range.end.column).toBe(10)
  })

  it('overrides multiple properties', () => {
    const v = createMockViolation({
      filePath: '/a.ts',
      message: 'msg',
      ruleId: 'r1',
      severity: 'info',
    })
    expect(v.filePath).toBe('/a.ts')
    expect(v.message).toBe('msg')
    expect(v.ruleId).toBe('r1')
    expect(v.severity).toBe('info')
  })
})

describe('createMockSourceFile helper', () => {
  it('returns default file path', () => {
    const sf = createMockSourceFile('code')
    expect(sf.getFilePath()).toBe('/test/file.ts')
  })

  it('returns provided text', () => {
    const sf = createMockSourceFile('const x = 1;')
    expect(sf.getFullText()).toBe('const x = 1;')
  })

  it('returns empty text', () => {
    const sf = createMockSourceFile('')
    expect(sf.getFullText()).toBe('')
  })

  it('returns multi-line text', () => {
    const text = 'line1\nline2\nline3'
    const sf = createMockSourceFile(text)
    expect(sf.getFullText()).toBe(text)
  })

  it('has replaceText mock', () => {
    const sf = createMockSourceFile('code')
    expect(typeof sf.replaceText).toBe('function')
  })

  it('has saveSync mock', () => {
    const sf = createMockSourceFile('code')
    expect(typeof sf.saveSync).toBe('function')
  })
})

describe('FixResult types', () => {
  it('represents applied fix with changes', () => {
    const result: FixResult = {
      applied: true,
      changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
    }
    expect(result.applied).toBe(true)
    expect(result.changes).toHaveLength(1)
  })

  it('represents unapplied fix', () => {
    const result: FixResult = {
      applied: false,
      changes: [],
    }
    expect(result.applied).toBe(false)
    expect(result.changes).toHaveLength(0)
  })

  it('represents fix with conflict', () => {
    const result: FixResult = {
      applied: false,
      changes: [],
      conflict: { conflictingRule: 'other', reason: 'Overlap' },
    }
    expect(result.conflict).toBeDefined()
    expect(result.conflict!.conflictingRule).toBe('other')
    expect(result.conflict!.reason).toBe('Overlap')
  })
})

describe('TextChange type', () => {
  it('has all required fields', () => {
    const change: TextChange = { end: 10, newText: 'hello', oldText: 'world', start: 0 }
    expect(change.start).toBe(0)
    expect(change.end).toBe(10)
    expect(change.newText).toBe('hello')
    expect(change.oldText).toBe('world')
  })
})

describe('FileFixReport type', () => {
  it('contains all required fields', () => {
    const report: FileFixReport = {
      changes: [],
      conflicts: [],
      filePath: '/test.ts',
      fixesApplied: 0,
      fixesSkipped: 0,
    }
    expect(report.filePath).toBe('/test.ts')
    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
    expect(report.changes).toHaveLength(0)
    expect(report.conflicts).toHaveLength(0)
  })
})

describe('FixReport type', () => {
  it('contains all required fields', () => {
    const report: FixReport = {
      fileReports: [],
      filesProcessed: 0,
      totalFixesApplied: 0,
      totalFixesSkipped: 0,
    }
    expect(report.filesProcessed).toBe(0)
    expect(report.totalFixesApplied).toBe(0)
    expect(report.totalFixesSkipped).toBe(0)
    expect(report.fileReports).toHaveLength(0)
  })
})

describe('Edge Cases', () => {
  it('handles source file with only whitespace', () => {
    const sourceFile = createMockSourceFile('   \n   \n   ')
    const violation = createMockViolation({
      range: { end: { column: 3, line: 1 }, start: { column: 0, line: 1 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 3, newText: '', oldText: '   ', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles single character source file', () => {
    const sourceFile = createMockSourceFile('x')
    const violation = createMockViolation({
      range: { end: { column: 1, line: 1 }, start: { column: 0, line: 1 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 1, newText: 'y', oldText: 'x', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles many non-overlapping violations', () => {
    const sourceFile = createMockSourceFile('a b c d e f g h i j')
    const violations: RuleViolation[] = []
    const rulesWithFixes = new Map<string, RuleWithFix>()
    for (let i = 0; i < 10; i++) {
      const ruleId = `rule-${i}`
      violations.push(
        createMockViolation({
          range: { end: { column: i * 2 + 1, line: 1 }, start: { column: i * 2, line: 1 } },
          ruleId,
        }),
      )
      rulesWithFixes.set(ruleId, {
        fix: (): FixResult => ({
          applied: true,
          changes: [{ end: i * 2 + 1, newText: 'X', oldText: 'x', start: i * 2 }],
        }),
        id: ruleId,
        priority: i,
      })
    }
    const report = applyFixesToFile(sourceFile, violations, rulesWithFixes, false)
    expect(report.fixesApplied).toBe(10)
    expect(report.fixesSkipped).toBe(0)
  })

  it('handles violations with same ruleId', () => {
    const sourceFile = createMockSourceFile('aaaa bbbb')
    const v1 = createMockViolation({
      range: { end: { column: 4, line: 1 }, start: { column: 0, line: 1 } },
    })
    const v2 = createMockViolation({
      range: { end: { column: 9, line: 1 }, start: { column: 5, line: 1 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 4, newText: 'AAAA', oldText: 'aaaa', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [v1, v2], rulesWithFixes, false)
    expect(report.fixesApplied).toBeGreaterThanOrEqual(1)
  })

  it('handles very long source text', () => {
    const longText = 'a'.repeat(10000)
    const sourceFile = createMockSourceFile(longText)
    const violation = createMockViolation({
      range: { end: { column: 10000, line: 1 }, start: { column: 0, line: 1 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 10000, newText: 'b'.repeat(10000), oldText: longText, start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles source file with Windows-style line endings in text', () => {
    const sourceFile = createMockSourceFile('line1\r\nline2')
    const violation = createMockViolation({
      range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'LINE1', oldText: 'line1', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles violation with line beyond source text', () => {
    const sourceFile = createMockSourceFile('short')
    const violation = createMockViolation({
      range: { end: { column: 5, line: 100 }, start: { column: 0, line: 100 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'x', oldText: 'y', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report).toBeDefined()
  })

  it('handles violations with severity error', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation({ severity: 'error' })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles violations with severity info', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation({ severity: 'info' })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles violation with suggestion', () => {
    const sourceFile = createMockSourceFile('const x = 1;')
    const violation = createMockViolation({ suggestion: 'Use let instead' })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles multiple conflicts from overlapping ranges', () => {
    const sourceFile = createMockSourceFile('abcdefghij')
    const v1 = createMockViolation({
      range: { end: { column: 3, line: 1 }, start: { column: 0, line: 1 } },
    })
    const v2 = createMockViolation({
      range: { end: { column: 5, line: 1 }, start: { column: 2, line: 1 } },
      ruleId: 'rule-b',
    })
    const v3 = createMockViolation({
      range: { end: { column: 4, line: 1 }, start: { column: 2, line: 1 } },
      ruleId: 'rule-c',
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 3, newText: 'ABC', oldText: 'abc', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
      [
        'rule-b',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'DE', oldText: 'de', start: 2 }],
          }),
          id: 'rule-b',
          priority: 2,
        },
      ],
      [
        'rule-c',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 4, newText: 'CD', oldText: 'cd', start: 2 }],
          }),
          id: 'rule-c',
          priority: 3,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [v1, v2, v3], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(2)
    expect(report.conflicts).toHaveLength(2)
  })

  it('handles zero-width range violation', () => {
    const sourceFile = createMockSourceFile('hello')
    const violation = createMockViolation({
      range: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 0, newText: '// comment\n', oldText: '', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles violation on last line of multi-line file', () => {
    const sourceFile = createMockSourceFile('line1\nline2\nline3')
    const violation = createMockViolation({
      range: { end: { column: 5, line: 3 }, start: { column: 0, line: 3 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 17, newText: 'LINE3', oldText: 'line3', start: 12 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles dry-run with conflicts', () => {
    const sourceFile = createMockSourceFile('abc')
    const v1 = createMockViolation({
      range: { end: { column: 2, line: 1 }, start: { column: 0, line: 1 } },
    })
    const v2 = createMockViolation({
      range: { end: { column: 3, line: 1 }, start: { column: 1, line: 1 } },
      ruleId: 'conflict',
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 2, newText: 'AB', oldText: 'ab', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
      [
        'conflict',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 3, newText: 'BC', oldText: 'bc', start: 1 }],
          }),
          id: 'conflict',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [v1, v2], rulesWithFixes, true)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
    expect(sourceFile.replaceText).not.toHaveBeenCalled()
  })

  it('handles three non-overlapping fixes', () => {
    const sourceFile = createMockSourceFile('aaa bbb ccc')
    const v1 = createMockViolation({
      range: { end: { column: 3, line: 1 }, start: { column: 0, line: 1 } },
    })
    const v2 = createMockViolation({
      range: { end: { column: 7, line: 1 }, start: { column: 4, line: 1 } },
      ruleId: 'rule-b',
    })
    const v3 = createMockViolation({
      range: { end: { column: 11, line: 1 }, start: { column: 8, line: 1 } },
      ruleId: 'rule-c',
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 3, newText: 'AAA', oldText: 'aaa', start: 0 }],
          }),
          id: 'test-rule',
          priority: 3,
        },
      ],
      [
        'rule-b',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 7, newText: 'BBB', oldText: 'bbb', start: 4 }],
          }),
          id: 'rule-b',
          priority: 2,
        },
      ],
      [
        'rule-c',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 11, newText: 'CCC', oldText: 'ccc', start: 8 }],
          }),
          id: 'rule-c',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [v1, v2, v3], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(3)
    expect(report.fixesSkipped).toBe(0)
  })

  it('handles source file with tabs', () => {
    const sourceFile = createMockSourceFile('\tconst x = 1;')
    const violation = createMockViolation({
      range: { end: { column: 6, line: 1 }, start: { column: 1, line: 1 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 6, newText: 'let', oldText: 'const', start: 1 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles source file with unicode characters', () => {
    const sourceFile = createMockSourceFile('const café = "beans";')
    const violation = createMockViolation({
      range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles fix that produces empty newText', () => {
    const sourceFile = createMockSourceFile('delete this;')
    const violation = createMockViolation({
      range: { end: { column: 12, line: 1 }, start: { column: 0, line: 1 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 12, newText: '', oldText: 'delete this;', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.changes[0]!.newText).toBe('')
  })
})

describe('RuleRegistry categories', () => {
  it('registers rules with complexity category', () => {
    const registry = new RuleRegistry()
    registry.register('r1', allRules['max-depth']!, 'complexity')
    const rule = registry.getRule('r1')
    expect(rule!.category).toBe('complexity')
  })

  it('registers rules with security category', () => {
    const registry = new RuleRegistry()
    registry.register('r1', allRules['max-depth']!, 'security')
    const rule = registry.getRule('r1')
    expect(rule!.category).toBe('security')
  })

  it('registers rules with performance category', () => {
    const registry = new RuleRegistry()
    registry.register('r1', allRules['max-depth']!, 'performance')
    const rule = registry.getRule('r1')
    expect(rule!.category).toBe('performance')
  })

  it('registers rules with dependencies category', () => {
    const registry = new RuleRegistry()
    registry.register('r1', allRules['max-depth']!, 'dependencies')
    const rule = registry.getRule('r1')
    expect(rule!.category).toBe('dependencies')
  })

  it('registers rules with patterns category', () => {
    const registry = new RuleRegistry()
    registry.register('r1', allRules['max-depth']!, 'patterns')
    const rule = registry.getRule('r1')
    expect(rule!.category).toBe('patterns')
  })

  it('registers rules with correctness category', () => {
    const registry = new RuleRegistry()
    registry.register('r1', allRules['max-depth']!, 'correctness')
    const rule = registry.getRule('r1')
    expect(rule!.category).toBe('correctness')
  })

  it('registers rules with testing category', () => {
    const registry = new RuleRegistry()
    registry.register('r1', allRules['max-depth']!, 'testing')
    const rule = registry.getRule('r1')
    expect(rule!.category).toBe('testing')
  })
})

describe('RuleRegistry caching', () => {
  it('cache is invalidated on register', () => {
    const registry = new RuleRegistry()
    const cached1 = registry.getEnabledRules()
    registry.register('r1', allRules['max-depth']!, 'complexity')
    const cached2 = registry.getEnabledRules()
    expect(cached1).not.toBe(cached2)
  })

  it('cache is invalidated on enable', () => {
    const registry = new RuleRegistry()
    registry.register('r1', allRules['max-depth']!, 'complexity')
    registry.disable('r1')
    const cached1 = registry.getEnabledRules()
    registry.enable('r1')
    const cached2 = registry.getEnabledRules()
    expect(cached1).not.toBe(cached2)
  })

  it('cache is invalidated on disable', () => {
    const registry = new RuleRegistry()
    registry.register('r1', allRules['max-depth']!, 'complexity')
    const cached1 = registry.getEnabledRules()
    registry.disable('r1')
    const cached2 = registry.getEnabledRules()
    expect(cached1).not.toBe(cached2)
  })

  it('returns same cached array when no changes', () => {
    const registry = new RuleRegistry()
    registry.register('r1', allRules['max-depth']!, 'complexity')
    const first = registry.getEnabledRules()
    const second = registry.getEnabledRules()
    expect(first).toBe(second)
  })

  it('cache correctly reflects multiple changes', () => {
    const registry = new RuleRegistry()
    registry.register('r1', allRules['max-depth']!, 'complexity')
    registry.register('r2', allRules['max-params']!, 'complexity')
    registry.register('r3', allRules['max-lines']!, 'complexity')
    registry.disable('r2')
    const enabled = registry.getEnabledRules()
    expect(enabled).toHaveLength(2)
    const ids = enabled.map((r) => r.definition)
    expect(ids).toContain(allRules['max-depth']!)
    expect(ids).toContain(allRules['max-lines']!)
  })
})

describe('applyFixesToFile position calculations', () => {
  it('correctly calculates position on first line', () => {
    const sourceFile = createMockSourceFile('hello world')
    const violation = createMockViolation({
      range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
    })
    let receivedChange: TextChange | undefined
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => {
            receivedChange = { end: 5, newText: 'HELLO', oldText: 'hello', start: 0 }
            return { applied: true, changes: [receivedChange] }
          },
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('correctly calculates position on second line', () => {
    const sourceFile = createMockSourceFile('hello\nworld')
    const violation = createMockViolation({
      range: { end: { column: 5, line: 2 }, start: { column: 0, line: 2 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 11, newText: 'WORLD', oldText: 'world', start: 6 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('correctly calculates position on third line', () => {
    const sourceFile = createMockSourceFile('a\nb\nc')
    const violation = createMockViolation({
      range: { end: { column: 1, line: 3 }, start: { column: 0, line: 3 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'C', oldText: 'c', start: 4 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles column offset on second line', () => {
    const sourceFile = createMockSourceFile('hello\n  world')
    const violation = createMockViolation({
      range: { end: { column: 9, line: 2 }, start: { column: 2, line: 2 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 13, newText: 'WORLD', oldText: 'world', start: 8 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })
})

describe('applyFixesToFile conflict detection edge cases', () => {
  it('detects conflict when ranges are identical', () => {
    const sourceFile = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      range: { end: { column: 3, line: 1 }, start: { column: 0, line: 1 } },
    })
    const v2 = createMockViolation({
      range: { end: { column: 3, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'dup-rule',
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 3, newText: 'ABC', oldText: 'abc', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
      [
        'dup-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 3, newText: 'XYZ', oldText: 'abc', start: 0 }],
          }),
          id: 'dup-rule',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [v1, v2], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.fixesSkipped).toBe(1)
  })

  it('detects conflict when one range starts at end of another', () => {
    const sourceFile = createMockSourceFile('abcdef')
    const v1 = createMockViolation({
      range: { end: { column: 3, line: 1 }, start: { column: 0, line: 1 } },
    })
    const v2 = createMockViolation({
      range: { end: { column: 6, line: 1 }, start: { column: 3, line: 1 } },
      ruleId: 'adjacent-rule',
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 3, newText: 'ABC', oldText: 'abc', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
      [
        'adjacent-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 6, newText: 'DEF', oldText: 'def', start: 3 }],
          }),
          id: 'adjacent-rule',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [v1, v2], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(2)
    expect(report.fixesSkipped).toBe(0)
  })

  it('allows completely separate ranges on same line', () => {
    const sourceFile = createMockSourceFile('aaa   bbb')
    const v1 = createMockViolation({
      range: { end: { column: 3, line: 1 }, start: { column: 0, line: 1 } },
    })
    const v2 = createMockViolation({
      range: { end: { column: 9, line: 1 }, start: { column: 6, line: 1 } },
      ruleId: 'sep-rule',
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 3, newText: 'AAA', oldText: 'aaa', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
      [
        'sep-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 9, newText: 'BBB', oldText: 'bbb', start: 6 }],
          }),
          id: 'sep-rule',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [v1, v2], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(2)
  })
})

describe('DiffRenderer with complex changes', () => {
  it('handles change where oldText has multiple lines and newText is single line', () => {
    const changes: TextChange[] = [
      { end: 20, newText: 'single', oldText: 'multi\nline\ntext', start: 0 },
    ]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    const hunk = diff.hunks[0]!
    expect(hunk.changes.filter((l) => l.type === 'remove')).toHaveLength(3)
    expect(hunk.changes.filter((l) => l.type === 'add')).toHaveLength(1)
  })

  it('handles change where oldText is single line and newText has multiple lines', () => {
    const changes: TextChange[] = [
      { end: 5, newText: 'multi\nline\ntext', oldText: 'single', start: 0 },
    ]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    const hunk = diff.hunks[0]!
    expect(hunk.changes.filter((l) => l.type === 'remove')).toHaveLength(1)
    expect(hunk.changes.filter((l) => l.type === 'add')).toHaveLength(3)
  })

  it('handles empty oldText with non-empty newText', () => {
    const changes: TextChange[] = [{ end: 0, newText: 'inserted', oldText: '', start: 0 }]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    const hunk = diff.hunks[0]!
    expect(hunk.changes.filter((l) => l.type === 'remove')).toHaveLength(1)
    expect(hunk.changes.filter((l) => l.type === 'add')).toHaveLength(1)
    expect(hunk.changes[0]!.content).toBe('')
    expect(hunk.changes[1]!.content).toBe('inserted')
  })

  it('handles non-empty oldText with empty newText', () => {
    const changes: TextChange[] = [{ end: 8, newText: '', oldText: 'deleted', start: 0 }]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    const hunk = diff.hunks[0]!
    expect(hunk.changes.filter((l) => l.type === 'remove')).toHaveLength(1)
    expect(hunk.changes.filter((l) => l.type === 'add')).toHaveLength(1)
    expect(hunk.changes[0]!.content).toBe('deleted')
    expect(hunk.changes[1]!.content).toBe('')
  })

  it('formatDiffForConsole does not crash with empty hunks', () => {
    const diff = renderTextChangesAsDiff([], '/test/file.ts')
    const output = formatDiffForConsole(diff)
    expect(output).toBe('')
  })

  it('formatDiffForConsole handles change with special characters', () => {
    const changes: TextChange[] = [{ end: 5, newText: '<div>', oldText: 'const', start: 0 }]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    const output = formatDiffForConsole(diff)
    expect(output).toContain('<div>')
    expect(output).toContain('const')
  })
})

describe('RuleRegistry with real rules', () => {
  it('can register and use max-depth rule', () => {
    const registry = new RuleRegistry()
    registry.register('max-depth', allRules['max-depth']!, 'complexity')
    const enabled = registry.getEnabledRules()
    expect(enabled).toHaveLength(1)
    expect(enabled[0]!.definition.meta.name).toBe('max-depth')
  })

  it('can register and use max-params rule', () => {
    const registry = new RuleRegistry()
    registry.register('max-params', allRules['max-params']!, 'complexity')
    const enabled = registry.getEnabledRules()
    expect(enabled).toHaveLength(1)
    expect(enabled[0]!.definition.meta.name).toBe('max-params')
  })

  it('can register and use max-lines rule', () => {
    const registry = new RuleRegistry()
    registry.register('max-lines', allRules['max-lines']!, 'complexity')
    const rule = registry.getRule('max-lines')
    expect(rule).toBeDefined()
    expect(rule!.enabled).toBe(true)
  })

  it('can register and use max-lines-per-function rule', () => {
    const registry = new RuleRegistry()
    registry.register('max-lines-per-function', allRules['max-lines-per-function']!, 'complexity')
    const rule = registry.getRule('max-lines-per-function')
    expect(rule).toBeDefined()
  })

  it('can register and use max-complexity rule', () => {
    const registry = new RuleRegistry()
    registry.register('max-complexity', allRules['max-complexity']!, 'complexity')
    const rule = registry.getRule('max-complexity')
    expect(rule).toBeDefined()
  })

  it('can disable and re-enable rules with real definitions', () => {
    const registry = new RuleRegistry()
    registry.register('max-depth', allRules['max-depth']!, 'complexity')
    registry.disable('max-depth')
    expect(registry.getEnabledRules()).toHaveLength(0)
    registry.enable('max-depth')
    expect(registry.getEnabledRules()).toHaveLength(1)
  })

  it('rule create method returns visitor with valid structure', () => {
    const registry = new RuleRegistry()
    registry.register('max-depth', allRules['max-depth']!, 'complexity')
    const rule = registry.getRule('max-depth')
    const result = rule!.definition.create(rule!.options)
    expect(result.visitor).toBeDefined()
  })
})

describe('applyFixesToFile with priority ordering', () => {
  it('applies higher priority fix first', () => {
    const sourceFile = createMockSourceFile('part1 part2')
    const v1 = createMockViolation({
      range: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'low',
    })
    const v2 = createMockViolation({
      range: { end: { column: 11, line: 1 }, start: { column: 6, line: 1 } },
      ruleId: 'high',
    })
    const callOrder: string[] = []
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'low',
        {
          fix: () => {
            callOrder.push('low')
            return {
              applied: true,
              changes: [{ end: 5, newText: 'PART1', oldText: 'part1', start: 0 }],
            }
          },
          id: 'low',
          priority: 100,
        },
      ],
      [
        'high',
        {
          fix: () => {
            callOrder.push('high')
            return {
              applied: true,
              changes: [{ end: 11, newText: 'PART2', oldText: 'part2', start: 6 }],
            }
          },
          id: 'high',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sourceFile, [v1, v2], rulesWithFixes, false)
    expect(callOrder[0]).toBe('high')
    expect(callOrder[1]).toBe('low')
  })

  it('applies fixes with same priority', () => {
    const sourceFile = createMockSourceFile('aaa bbb')
    const v1 = createMockViolation({
      range: { end: { column: 3, line: 1 }, start: { column: 0, line: 1 } },
    })
    const v2 = createMockViolation({
      range: { end: { column: 7, line: 1 }, start: { column: 4, line: 1 } },
      ruleId: 'rule-b',
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 3, newText: 'AAA', oldText: 'aaa', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
      [
        'rule-b',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 7, newText: 'BBB', oldText: 'bbb', start: 4 }],
          }),
          id: 'rule-b',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [v1, v2], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(2)
  })

  it('respects priority when determining conflicts', () => {
    const sourceFile = createMockSourceFile('abcdefgh')
    const v1 = createMockViolation({
      range: { end: { column: 4, line: 1 }, start: { column: 0, line: 1 } },
      ruleId: 'prio-1',
    })
    const v2 = createMockViolation({
      range: { end: { column: 6, line: 1 }, start: { column: 2, line: 1 } },
      ruleId: 'prio-10',
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'prio-1',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 4, newText: 'ABCD', oldText: 'abcd', start: 0 }],
          }),
          id: 'prio-1',
          priority: 1,
        },
      ],
      [
        'prio-10',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 6, newText: 'CDEF', oldText: 'cdef', start: 2 }],
          }),
          id: 'prio-10',
          priority: 10,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [v1, v2], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
    expect(report.conflicts[0]!.ruleId).toBe('prio-10')
  })
})

describe('applyFixesToFiles aggregation', () => {
  it('correctly sums fixesApplied across files', () => {
    const sf1 = createMockSourceFile('const a = 1;')
    const sf2 = createMockSourceFile('const b = 2;')
    const sf3 = createMockSourceFile('const c = 3;')
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [createMockViolation()] },
        { sourceFile: sf2, violations: [createMockViolation()] },
        { sourceFile: sf3, violations: [createMockViolation()] },
      ],
      rulesWithFixes,
      false,
    )
    expect(report.totalFixesApplied).toBe(3)
    expect(report.filesProcessed).toBe(3)
  })

  it('handles mixed applied and skipped fixes', () => {
    const sf1 = createMockSourceFile('abc def')
    const v1a = createMockViolation({
      range: { end: { column: 3, line: 1 }, start: { column: 0, line: 1 } },
    })
    const v1b = createMockViolation({
      range: { end: { column: 5, line: 1 }, start: { column: 2, line: 1 } },
      ruleId: 'conflict',
    })
    const sf2 = createMockSourceFile('ghi jkl')
    const v2 = createMockViolation({
      range: { end: { column: 3, line: 1 }, start: { column: 0, line: 1 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 3, newText: 'ABC', oldText: 'abc', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
      [
        'conflict',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'DE', oldText: 'de', start: 2 }],
          }),
          id: 'conflict',
          priority: 2,
        },
      ],
    ])
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [v1a, v1b] },
        { sourceFile: sf2, violations: [v2] },
      ],
      rulesWithFixes,
      false,
    )
    expect(report.totalFixesApplied).toBe(2)
    expect(report.totalFixesSkipped).toBe(1)
  })
})

describe('applyFixesToFiles edge cases', () => {
  it('handles single file in array', () => {
    const sf = createMockSourceFile('const x = 1;')
    const v = createMockViolation()
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFiles([{ sourceFile: sf, violations: [v] }], rulesWithFixes, false)
    expect(report.filesProcessed).toBe(1)
    expect(report.fileReports).toHaveLength(1)
    expect(report.totalFixesApplied).toBe(1)
  })

  it('handles file with violations but no applicable rules', () => {
    const sf = createMockSourceFile('const x = 1;')
    const v = createMockViolation({ ruleId: 'no-rule-for-this' })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        { fix: (): FixResult => ({ applied: true, changes: [] }), id: 'test-rule', priority: 1 },
      ],
    ])
    const report = applyFixesToFiles([{ sourceFile: sf, violations: [v] }], rulesWithFixes, false)
    expect(report.totalFixesApplied).toBe(0)
    expect(report.totalFixesSkipped).toBe(0)
  })

  it('handles empty violations in files', () => {
    const sf = createMockSourceFile('const x = 1;')
    const rulesWithFixes = new Map<string, RuleWithFix>()
    const report = applyFixesToFiles([{ sourceFile: sf, violations: [] }], rulesWithFixes, false)
    expect(report.filesProcessed).toBe(1)
    expect(report.totalFixesApplied).toBe(0)
  })

  it('aggregates file reports correctly', () => {
    const sf1 = createMockSourceFile('const a = 1;')
    const sf2 = createMockSourceFile('const b = 2;')
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [createMockViolation()] },
        { sourceFile: sf2, violations: [createMockViolation()] },
      ],
      rulesWithFixes,
      false,
    )
    expect(report.fileReports[0]!.fixesApplied).toBe(1)
    expect(report.fileReports[1]!.fixesApplied).toBe(1)
    expect(report.fileReports[0]!.filePath).toBe('/test/file.ts')
    expect(report.fileReports[1]!.filePath).toBe('/test/file.ts')
  })

  it('handles dry-run correctly across multiple files', () => {
    const sf1 = createMockSourceFile('const a = 1;')
    const sf2 = createMockSourceFile('const b = 2;')
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 5, newText: 'let', oldText: 'const', start: 0 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFiles(
      [
        { sourceFile: sf1, violations: [createMockViolation()] },
        { sourceFile: sf2, violations: [createMockViolation()] },
      ],
      rulesWithFixes,
      true,
    )
    expect(report.totalFixesApplied).toBe(2)
    expect(sf1.replaceText).not.toHaveBeenCalled()
    expect(sf2.replaceText).not.toHaveBeenCalled()
  })
})

describe('RuleRegistry enable/disable interactions', () => {
  it('toggling enable/disable multiple times works correctly', () => {
    const registry = new RuleRegistry()
    registry.register('r1', allRules['max-depth']!, 'complexity')
    expect(registry.getEnabledRules()).toHaveLength(1)
    registry.disable('r1')
    expect(registry.getEnabledRules()).toHaveLength(0)
    registry.enable('r1')
    expect(registry.getEnabledRules()).toHaveLength(1)
    registry.disable('r1')
    expect(registry.getEnabledRules()).toHaveLength(0)
    registry.enable('r1')
    expect(registry.getEnabledRules()).toHaveLength(1)
  })

  it('enabling non-existent rule does not affect other rules', () => {
    const registry = new RuleRegistry()
    registry.register('r1', allRules['max-depth']!, 'complexity')
    registry.enable('nonexistent')
    expect(registry.getEnabledRules()).toHaveLength(1)
  })

  it('disabling non-existent rule does not affect other rules', () => {
    const registry = new RuleRegistry()
    registry.register('r1', allRules['max-depth']!, 'complexity')
    registry.disable('nonexistent')
    expect(registry.getEnabledRules()).toHaveLength(1)
  })

  it('registering over an existing rule resets enabled state', () => {
    const registry = new RuleRegistry()
    registry.register('r1', allRules['max-depth']!, 'complexity')
    registry.disable('r1')
    expect(registry.getEnabledRules()).toHaveLength(0)
    registry.register('r1', allRules['max-params']!, 'complexity')
    expect(registry.getEnabledRules()).toHaveLength(1)
    const rule = registry.getRule('r1')
    expect(rule!.enabled).toBe(true)
    expect(rule!.definition).toBe(allRules['max-params']!)
  })
})

describe('applyFixesToFile with fix returning conflict', () => {
  it('records conflict with correct ruleId', () => {
    const sourceFile = createMockSourceFile('code')
    const violation = createMockViolation({ ruleId: 'conflict-returner' })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'conflict-returner',
        {
          fix: (): FixResult => ({
            applied: false,
            changes: [],
            conflict: { conflictingRule: 'other', reason: 'Cannot coexist' },
          }),
          id: 'conflict-returner',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.conflicts).toHaveLength(1)
    expect(report.conflicts[0]!.ruleId).toBe('conflict-returner')
  })

  it('does not record conflict when fix returns null', () => {
    const sourceFile = createMockSourceFile('code')
    const violation = createMockViolation()
    const rulesWithFixes = new Map<string, RuleWithFix>([
      ['test-rule', { fix: () => null, id: 'test-rule', priority: 1 }],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.conflicts).toHaveLength(0)
    expect(report.fixesApplied).toBe(0)
    expect(report.fixesSkipped).toBe(0)
  })

  it('does not record conflict when fix returns applied=false without conflict', () => {
    const sourceFile = createMockSourceFile('code')
    const violation = createMockViolation()
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        { fix: (): FixResult => ({ applied: false, changes: [] }), id: 'test-rule', priority: 1 },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.conflicts).toHaveLength(0)
    expect(report.fixesSkipped).toBe(0)
  })
})

describe('Rule system completeness', () => {
  it('has rules in all major categories', () => {
    const categories = new Set(Object.values(allRules).map((r) => r.meta.category))
    expect(categories.has('complexity')).toBe(true)
    expect(categories.has('performance')).toBe(true)
    expect(categories.has('security')).toBe(true)
    expect(categories.has('patterns')).toBe(true)
  })

  it('getRuleIds returns array of strings', () => {
    const ids = getRuleIds()
    expect(Array.isArray(ids)).toBe(true)
    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) {
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    }
  })

  it('all rules create method returns object with visitor', () => {
    for (const [id, rule] of Object.entries(allRules)) {
      const result = rule.create(rule.defaultOptions)
      expect(result, `Rule ${id} create() should return object`).toBeDefined()
      expect(result.visitor, `Rule ${id} should have visitor`).toBeDefined()
    }
  })

  it('all rules have boolean recommended field', () => {
    for (const [id, rule] of Object.entries(allRules)) {
      expect([true, false], `Rule ${id} recommended should be boolean`).toContain(
        rule.meta.recommended,
      )
    }
  })

  it('no rule has empty description', () => {
    for (const [id, rule] of Object.entries(allRules)) {
      expect(
        rule.meta.description.length,
        `Rule ${id} should have non-empty description`,
      ).toBeGreaterThan(0)
    }
  })
})

describe('DiffRenderer edge cases', () => {
  it('handles TextChange where oldText equals newText', () => {
    const changes: TextChange[] = [{ end: 5, newText: 'hello', oldText: 'hello', start: 0 }]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    expect(diff.hunks).toHaveLength(1)
    expect(diff.hunks[0]!.changes.filter((l) => l.type === 'remove')).toHaveLength(1)
    expect(diff.hunks[0]!.changes.filter((l) => l.type === 'add')).toHaveLength(1)
  })

  it('handles changes with very large range values', () => {
    const changes: TextChange[] = [
      { end: 1000000, newText: 'big', oldText: 'content', start: 999990 },
    ]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    expect(diff.hunks).toHaveLength(1)
    expect(diff.hunks[0]!.header).toContain('999990')
  })

  it('handles empty strings in both old and new text', () => {
    const changes: TextChange[] = [{ end: 0, newText: '', oldText: '', start: 0 }]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    expect(diff.hunks).toHaveLength(1)
  })

  it('does not produce context lines for basic changes', () => {
    const changes: TextChange[] = [{ end: 3, newText: 'abc', oldText: 'def', start: 0 }]
    const diff = renderTextChangesAsDiff(changes, '/test/file.ts')
    const contextLines = diff.hunks[0]!.changes.filter((l) => l.type === 'context')
    expect(contextLines).toHaveLength(0)
  })
})

describe('applyFixesToFile additional edge cases', () => {
  it('handles fix returning single change with zero-length range', () => {
    const sourceFile = createMockSourceFile('abc')
    const violation = createMockViolation({
      range: { end: { column: 1, line: 1 }, start: { column: 1, line: 1 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 1, newText: 'X', oldText: '', start: 1 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })

  it('handles violation with suggestion field passed to fix', () => {
    const sourceFile = createMockSourceFile('code')
    const violation = createMockViolation({ suggestion: 'Consider using let' })
    let capturedViolation: RuleViolation | undefined
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (ctx) => {
            capturedViolation = ctx.violation
            return { applied: true, changes: [] }
          },
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(capturedViolation!.suggestion).toBe('Consider using let')
  })

  it('handles source file with only newline characters', () => {
    const sourceFile = createMockSourceFile('\n\n\n')
    const violation = createMockViolation({
      range: { end: { column: 1, line: 2 }, start: { column: 0, line: 2 } },
    })
    const rulesWithFixes = new Map<string, RuleWithFix>([
      [
        'test-rule',
        {
          fix: (): FixResult => ({
            applied: true,
            changes: [{ end: 2, newText: 'x', oldText: '\n', start: 1 }],
          }),
          id: 'test-rule',
          priority: 1,
        },
      ],
    ])
    const report = applyFixesToFile(sourceFile, [violation], rulesWithFixes, false)
    expect(report.fixesApplied).toBe(1)
  })
})
