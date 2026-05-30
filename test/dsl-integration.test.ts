import { describe, it, expect } from 'vitest'
import { DSLIntegration } from '../src/core/rule-dsl/dsl-integration.js'
import type { DSLViolation, DSLRuleConfig } from '../src/core/rule-dsl/types.js'

function makeRule(id: string): DSLRuleConfig {
  return {
    id,
    name: `Rule ${id}`,
    description: '',
    severity: 'error',
    category: 'patterns',
    enabled: true,
    condition: { type: 'pattern', value: 'test' },
    message: `Violation: ${id}`,
  }
}

function makeViolation(ruleId: string, filePath: string, line: number): DSLViolation {
  return {
    ruleId,
    filePath,
    line,
    column: 1,
    message: `Violation at ${line}`,
    severity: 'error',
  }
}

describe('DSLIntegration', () => {
  const integration = new DSLIntegration()

  describe('loadRulesFromDirectory', () => {
    it('returns empty for non-existent directory', async () => {
      const rules = await integration.loadRulesFromDirectory('/nonexistent/path')
      expect(rules).toEqual([])
    })

    it('returns empty for empty directory', async () => {
      const rules = await integration.loadRulesFromDirectory('/tmp')
      expect(Array.isArray(rules)).toBe(true)
    })
  })

  describe('convertToViolations', () => {
    it('converts DSL violations to integration violations', () => {
      const input = new Map<string, DSLViolation[]>()
      input.set('test.ts', [
        makeViolation('r1', 'test.ts', 5),
        makeViolation('r2', 'test.ts', 10),
      ])

      const violations = integration.convertToViolations(input)
      expect(violations).toHaveLength(2)
      expect(violations[0]!.ruleId).toBe('r1')
      expect(violations[0]!.source).toBe('dsl')
      expect(violations[0]!.filePath).toBe('test.ts')
    })

    it('handles multiple files', () => {
      const input = new Map<string, DSLViolation[]>()
      input.set('a.ts', [makeViolation('r1', 'a.ts', 1)])
      input.set('b.ts', [makeViolation('r2', 'b.ts', 2)])

      const violations = integration.convertToViolations(input)
      expect(violations).toHaveLength(2)
      expect(violations.some((v) => v.filePath === 'a.ts')).toBe(true)
      expect(violations.some((v) => v.filePath === 'b.ts')).toBe(true)
    })

    it('handles empty map', () => {
      const violations = integration.convertToViolations(new Map())
      expect(violations).toEqual([])
    })

    it('preserves suggestion when present', () => {
      const input = new Map<string, DSLViolation[]>()
      input.set('test.ts', [{
        ...makeViolation('r1', 'test.ts', 1),
        suggestion: 'Use const instead',
      }])

      const violations = integration.convertToViolations(input)
      expect(violations[0]!.suggestion).toBe('Use const instead')
    })
  })

  describe('mergeWithExistingRules', () => {
    it('merges non-conflicting rules', () => {
      const dslRules = [makeRule('new1'), makeRule('new2')]
      const existing = ['existing1']

      const { merged, conflicts } = integration.mergeWithExistingRules(dslRules, existing)
      expect(merged).toHaveLength(2)
      expect(conflicts).toHaveLength(0)
    })

    it('detects conflicts', () => {
      const dslRules = [makeRule('existing1'), makeRule('new1')]
      const existing = ['existing1']

      const { merged, conflicts } = integration.mergeWithExistingRules(dslRules, existing)
      expect(merged).toHaveLength(1)
      expect(merged[0]!.id).toBe('new1')
      expect(conflicts).toEqual(['existing1'])
    })

    it('handles empty DSL rules', () => {
      const { merged, conflicts } = integration.mergeWithExistingRules([], ['existing1'])
      expect(merged).toHaveLength(0)
      expect(conflicts).toHaveLength(0)
    })

    it('handles empty existing rules', () => {
      const dslRules = [makeRule('r1')]
      const { merged, conflicts } = integration.mergeWithExistingRules(dslRules, [])
      expect(merged).toHaveLength(1)
      expect(conflicts).toHaveLength(0)
    })

    it('deduplicates within DSL rules', () => {
      const dslRules = [makeRule('dup'), makeRule('dup')]
      const { merged, conflicts } = integration.mergeWithExistingRules(dslRules, ['dup'])
      expect(merged).toHaveLength(0)
      expect(conflicts).toEqual(['dup', 'dup'])
    })
  })

  describe('getRuleMetadata', () => {
    it('extracts metadata from a rule', () => {
      const rule = makeRule('test-rule')
      const meta = integration.getRuleMetadata(rule) as Record<string, unknown>

      expect(meta.id).toBe('test-rule')
      expect(meta.name).toBe('Rule test-rule')
      expect(meta.severity).toBe('error')
      expect(meta.category).toBe('patterns')
      expect(meta.enabled).toBe(true)
      expect(meta.hasFix).toBe(false)
      expect(meta.conditionType).toBe('pattern')
    })

    it('detects fix presence', () => {
      const rule: DSLRuleConfig = {
        ...makeRule('fixable'),
        fix: { type: 'replace', pattern: 'x', replacement: 'y' },
      }
      const meta = integration.getRuleMetadata(rule) as Record<string, unknown>

      expect(meta.hasFix).toBe(true)
      expect(meta.fixType).toBe('replace')
    })

    it('detects suggestion presence', () => {
      const rule: DSLRuleConfig = {
        ...makeRule('suggested'),
        suggestion: 'Consider using const',
      }
      const meta = integration.getRuleMetadata(rule) as Record<string, unknown>

      expect(meta.hasSuggestion).toBe(true)
    })
  })
})
