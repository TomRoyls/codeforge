import { describe, expect, it, vi } from 'vitest'
import type { SourceFile } from 'ts-morph'
import { applyFixesToFile, type RuleWithFix } from '../../../src/fix/fixer.js'
import type { FixResult } from '../../../src/fix/types.js'
import type { RuleViolation } from '../../../src/ast/visitor.js'
import { RuleRegistry } from '../../../src/core/rule-registry.js'
import { allRules } from '../../../src/rules/index.js'

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
