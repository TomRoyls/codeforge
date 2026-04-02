import { describe, test, expect, vi } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzeNoUselessComparison,
  noUselessComparisonRule,
} from '../../../../src/rules/patterns/no-useless-comparison.js'

import type { RuleDefinition, RuleOptions } from '../../../../src/rules/types.js'
import type { RuleViolation, VisitorContext } from '../../../../src/ast/visitor.js'
import {
  createMockSourceFile,
  createMockBinaryExpression,
  createMockIdentifier,
  createMockNumericLiteral,
  createMockStringLiteral,
  createMockBooleanLiteral,
  createMockNullLiteral,
  createSourceFileWithChildren,
  SyntaxKind,
} from '../../../helpers/ast-helpers'

function createSourceFile(code: string) {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

function createMockVisitorContext(sourceFile: unknown): VisitorContext {
  return {
    sourceFile: sourceFile as any,
    depth: 0,
    parent: undefined,
    addViolation: vi.fn(),
    getFilePath: () => '/src/file.ts',
  }
}

describe('no-useless-comparison rule', () => {
  describe('meta', () => {
    test('has correct rule name', () => {
      expect(noUselessComparisonRule.meta.name).toBe('no-useless-comparison')
    })

    test('has correct category', () => {
      expect(noUselessComparisonRule.meta.category).toBe('style')
    })

    test('is recommended', () => {
      expect(noUselessComparisonRule.meta.recommended).toBe(true)
    })

    test('has description', () => {
      expect(noUselessComparisonRule.meta.description).toContain('comparison')
    })

    test('has description mentioning useless', () => {
      expect(noUselessComparisonRule.meta.description.toLowerCase()).toContain('useless')
    })
  })

  describe('defaultOptions', () => {
    test('has default ignoreComparisonsToNaN', () => {
      expect(noUselessComparisonRule.defaultOptions.ignoreComparisonsToNaN).toBe(false)
    })
  })

  describe('create', () => {
    test('returns visitor with visitNode', () => {
      const ruleInstance = noUselessComparisonRule.create({})
      expect(ruleInstance.visitor).toBeDefined()
      expect(ruleInstance.visitor.visitNode).toBeDefined()
    })

    test('returns onComplete function', () => {
      const ruleInstance = noUselessComparisonRule.create({})
      expect(ruleInstance.onComplete).toBeDefined()
      expect(typeof ruleInstance.onComplete).toBe('function')
    })

    test('returns empty violations for no violations', () => {
      const sourceFile = createSourceFile('const x = 1 + 2;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('self-comparison', () => {
    test('reports x === x', () => {
      const sourceFile = createSourceFile('const x = 1; if (x === x) return x; }')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always')
      expect(violations[0].suggestion).toBeDefined()
    })
  })

  describe('NaN comparisons', () => {
    test('reports NaN === NaN by default', () => {
      const sourceFile = createSourceFile('if (NaN === NaN) return x; }')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always')
      expect(violations[0].suggestion).toBeDefined()
    })
  })

  describe('literal comparisons', () => {
    test('reports 5 > 3 as always true', () => {
      const sourceFile = createSourceFile('const x = 5 > 3;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always')
      expect(violations[0].suggestion).toBeDefined()
    })
  })

  describe('integration with rule system', () => {
    test('rule can be created and used', () => {
      const ruleInstance = noUselessComparisonRule.create({})
      expect(ruleInstance.visitor.visitNode).toBeDefined()
    })
  })
})
