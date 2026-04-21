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
    sourceFile: sourceFile as VisitorContext['sourceFile'],
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

    test('has description mentioning always true or false', () => {
      expect(noUselessComparisonRule.meta.description).toMatch(/always\s+(true|false)/i)
    })

    test('meta name is a string', () => {
      expect(typeof noUselessComparisonRule.meta.name).toBe('string')
    })

    test('meta category is a valid category', () => {
      const validCategories = [
        'complexity',
        'correctness',
        'dependencies',
        'patterns',
        'performance',
        'security',
        'style',
      ]
      expect(validCategories).toContain(noUselessComparisonRule.meta.category)
    })

    test('meta recommended is a boolean', () => {
      expect(typeof noUselessComparisonRule.meta.recommended).toBe('boolean')
    })

    test('meta description is a non-empty string', () => {
      expect(noUselessComparisonRule.meta.description.length).toBeGreaterThan(0)
    })

    test('fixable is undefined', () => {
      expect(noUselessComparisonRule.meta.fixable).toBeUndefined()
    })

    test('severity is not defined on meta', () => {
      expect(noUselessComparisonRule.meta.severity).toBeUndefined()
    })

    test('deprecated is not defined on meta', () => {
      expect(noUselessComparisonRule.meta.deprecated).toBeUndefined()
    })
  })

  describe('defaultOptions', () => {
    test('has default ignoreComparisonsToNaN', () => {
      expect(noUselessComparisonRule.defaultOptions.ignoreComparisonsToNaN).toBe(false)
    })

    test('defaultOptions is an object', () => {
      expect(typeof noUselessComparisonRule.defaultOptions).toBe('object')
    })

    test('defaultOptions has ignoreComparisonsToNaN key', () => {
      expect(noUselessComparisonRule.defaultOptions).toHaveProperty('ignoreComparisonsToNaN')
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

    test('onComplete returns an array', () => {
      const ruleInstance = noUselessComparisonRule.create({})
      const result = ruleInstance.onComplete!()
      expect(Array.isArray(result)).toBe(true)
    })

    test('create accepts empty options', () => {
      const ruleInstance = noUselessComparisonRule.create({})
      expect(ruleInstance.visitor.visitNode).toBeDefined()
    })

    test('create accepts options with ignoreComparisonsToNaN true', () => {
      const ruleInstance = noUselessComparisonRule.create({ ignoreComparisonsToNaN: true })
      expect(ruleInstance.visitor.visitNode).toBeDefined()
    })

    test('create accepts options with ignoreComparisonsToNaN false', () => {
      const ruleInstance = noUselessComparisonRule.create({ ignoreComparisonsToNaN: false })
      expect(ruleInstance.visitor.visitNode).toBeDefined()
    })

    test('visitor does not have exitNode', () => {
      const ruleInstance = noUselessComparisonRule.create({})
      expect(ruleInstance.visitor.exitNode).toBeUndefined()
    })

    test('visitor does not have visitFunction', () => {
      const ruleInstance = noUselessComparisonRule.create({})
      expect(ruleInstance.visitor.visitFunction).toBeUndefined()
    })

    test('visitor does not have visitSourceFile', () => {
      const ruleInstance = noUselessComparisonRule.create({})
      expect(ruleInstance.visitor.visitSourceFile).toBeUndefined()
    })

    test('visitor does not have visitBinaryExpression', () => {
      const ruleInstance = noUselessComparisonRule.create({})
      expect(ruleInstance.visitor.visitBinaryExpression).toBeUndefined()
    })
  })

  describe('self-comparison with ===', () => {
    test('reports x === x', () => {
      const sourceFile = createSourceFile('const x = 1; if (x === x) return x; }')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always')
      expect(violations[0].suggestion).toBeDefined()
    })

    test('reports foo === foo', () => {
      const sourceFile = createSourceFile('if (foo === foo) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports bar === bar in expression', () => {
      const sourceFile = createSourceFile('const result = bar === bar;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports myVar === myVar', () => {
      const sourceFile = createSourceFile('function test() { return myVar === myVar; }')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports data === data in if condition', () => {
      const sourceFile = createSourceFile('if (data === data) { console.log("same"); }')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports same numeric literal 5 === 5', () => {
      const sourceFile = createSourceFile('if (5 === 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports same string literal comparison', () => {
      const sourceFile = createSourceFile('if ("hello" === "hello") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports true === true', () => {
      const sourceFile = createSourceFile('if (true === true) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports false === false', () => {
      const sourceFile = createSourceFile('if (false === false) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports null === null', () => {
      const sourceFile = createSourceFile('if (null === null) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports message contains "always true" for non-NaN self-comparison', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('always true')
    })

    test('reports message mentions "comparing a value to itself"', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('comparing a value to itself')
    })

    test('suggestion says to remove comparison', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Remove this comparison')
    })

    test('suggestion says it can never be false', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('never be false')
    })
  })

  describe('self-comparison with ==', () => {
    test('reports x == x', () => {
      const sourceFile = createSourceFile('if (x == x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports foo == foo', () => {
      const sourceFile = createSourceFile('const r = foo == foo;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports 5 == 5', () => {
      const sourceFile = createSourceFile('if (5 == 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports "abc" == "abc"', () => {
      const sourceFile = createSourceFile('if ("abc" == "abc") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports true == true', () => {
      const sourceFile = createSourceFile('if (true == true) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports false == false', () => {
      const sourceFile = createSourceFile('if (false == false) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports null == null', () => {
      const sourceFile = createSourceFile('if (null == null) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('message contains "always true" for == self-comparison', () => {
      const sourceFile = createSourceFile('if (x == x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('always true')
    })

    test('suggestion says to remove for ==', () => {
      const sourceFile = createSourceFile('if (x == x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Remove this comparison')
    })
  })

  describe('self-comparison with !==', () => {
    test('reports x !== x', () => {
      const sourceFile = createSourceFile('if (x !== x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports foo !== foo', () => {
      const sourceFile = createSourceFile('const r = foo !== foo;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports 5 !== 5', () => {
      const sourceFile = createSourceFile('if (5 !== 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports "abc" !== "abc"', () => {
      const sourceFile = createSourceFile('if ("abc" !== "abc") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports true !== true', () => {
      const sourceFile = createSourceFile('if (true !== true) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports false !== false', () => {
      const sourceFile = createSourceFile('if (false !== false) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports null !== null', () => {
      const sourceFile = createSourceFile('if (null !== null) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('message contains "always false" for non-NaN !== self-comparison', () => {
      const sourceFile = createSourceFile('if (x !== x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('always false')
    })

    test('suggestion says it can never be true for !==', () => {
      const sourceFile = createSourceFile('if (x !== x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('never be true')
    })

    test('reports message mentions "comparing a value to itself" for !==', () => {
      const sourceFile = createSourceFile('if (x !== x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('comparing a value to itself')
    })
  })

  describe('self-comparison with !=', () => {
    test('reports x != x', () => {
      const sourceFile = createSourceFile('if (x != x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports foo != foo', () => {
      const sourceFile = createSourceFile('const r = foo != foo;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports 5 != 5', () => {
      const sourceFile = createSourceFile('if (5 != 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports "abc" != "abc"', () => {
      const sourceFile = createSourceFile('if ("abc" != "abc") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports null != null', () => {
      const sourceFile = createSourceFile('if (null != null) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('message contains "always false" for != self-comparison', () => {
      const sourceFile = createSourceFile('if (x != x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('always false')
    })

    test('suggestion says it can never be true for !=', () => {
      const sourceFile = createSourceFile('if (x != x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('never be true')
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

    test('NaN === NaN reports always false', () => {
      const sourceFile = createSourceFile('if (NaN === NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('always false')
    })

    test('NaN === NaN message mentions NaN !== NaN', () => {
      const sourceFile = createSourceFile('if (NaN === NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('NaN !== NaN')
    })

    test('NaN === NaN suggestion suggests Number.isNaN()', () => {
      const sourceFile = createSourceFile('if (NaN === NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Number.isNaN()')
    })

    test('NaN == NaN reports always false', () => {
      const sourceFile = createSourceFile('if (NaN == NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('always false')
    })

    test('NaN !== NaN reports always true', () => {
      const sourceFile = createSourceFile('if (NaN !== NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('always true')
    })

    test('NaN !== NaN message mentions NaN !== NaN is true', () => {
      const sourceFile = createSourceFile('if (NaN !== NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('NaN !== NaN is true')
    })

    test('NaN !== NaN suggestion suggests Number.isNaN()', () => {
      const sourceFile = createSourceFile('if (NaN !== NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Number.isNaN()')
    })

    test('NaN != NaN reports always true', () => {
      const sourceFile = createSourceFile('if (NaN != NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('always true')
    })

    test('NaN == NaN suggestion suggests Number.isNaN()', () => {
      const sourceFile = createSourceFile('if (NaN == NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Number.isNaN()')
    })

    test('NaN != NaN suggestion suggests Number.isNaN()', () => {
      const sourceFile = createSourceFile('if (NaN != NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Number.isNaN()')
    })

    test('ignores NaN === NaN when ignoreComparisonsToNaN is true', () => {
      const sourceFile = createSourceFile('if (NaN === NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile, { ignoreComparisonsToNaN: true })
      expect(violations).toHaveLength(0)
    })

    test('ignores NaN == NaN when ignoreComparisonsToNaN is true', () => {
      const sourceFile = createSourceFile('if (NaN == NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile, { ignoreComparisonsToNaN: true })
      expect(violations).toHaveLength(0)
    })

    test('ignores NaN !== NaN when ignoreComparisonsToNaN is true', () => {
      const sourceFile = createSourceFile('if (NaN !== NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile, { ignoreComparisonsToNaN: true })
      expect(violations).toHaveLength(0)
    })

    test('ignores NaN != NaN when ignoreComparisonsToNaN is true', () => {
      const sourceFile = createSourceFile('if (NaN != NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile, { ignoreComparisonsToNaN: true })
      expect(violations).toHaveLength(0)
    })

    test('does not ignore NaN === NaN when ignoreComparisonsToNaN is false', () => {
      const sourceFile = createSourceFile('if (NaN === NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile, { ignoreComparisonsToNaN: false })
      expect(violations).toHaveLength(1)
    })

    test('does not ignore NaN === NaN by default', () => {
      const sourceFile = createSourceFile('if (NaN === NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('NaN on left side of === is detected', () => {
      const sourceFile = createSourceFile('if (NaN === NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('NaN')
    })

    test('NaN on right side is detected via ==', () => {
      const sourceFile = createSourceFile('if (NaN == NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })
  })

  describe('numeric literal comparisons with <', () => {
    test('reports 5 < 10 as always true', () => {
      const sourceFile = createSourceFile('if (5 < 10) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('reports 10 < 5 as always false', () => {
      const sourceFile = createSourceFile('if (10 < 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('reports 1 < 100 as always true', () => {
      const sourceFile = createSourceFile('if (1 < 100) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('reports 100 < 1 as always false', () => {
      const sourceFile = createSourceFile('if (100 < 1) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('reports 0 < 1 as always true', () => {
      const sourceFile = createSourceFile('if (0 < 1) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('reports 3 < 3 as always false', () => {
      const sourceFile = createSourceFile('if (3 < 3) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('message mentions comparing constant numbers for <', () => {
      const sourceFile = createSourceFile('if (5 < 10) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('comparing constant numbers')
    })

    test('message includes both numbers for <', () => {
      const sourceFile = createSourceFile('if (5 < 10) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('5')
      expect(violations[0].message).toContain('10')
    })

    test('suggestion says replace with true for always true <', () => {
      const sourceFile = createSourceFile('if (5 < 10) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Replace with true')
    })

    test('suggestion says replace with false for always false <', () => {
      const sourceFile = createSourceFile('if (10 < 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Replace with false')
    })
  })

  describe('numeric literal comparisons with >', () => {
    test('reports 5 > 3 as always true', () => {
      const sourceFile = createSourceFile('const x = 5 > 3;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always')
      expect(violations[0].suggestion).toBeDefined()
    })

    test('reports 3 > 5 as always false', () => {
      const sourceFile = createSourceFile('if (3 > 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('reports 100 > 1 as always true', () => {
      const sourceFile = createSourceFile('if (100 > 1) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('reports 1 > 100 as always false', () => {
      const sourceFile = createSourceFile('if (1 > 100) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('reports 3 > 3 as always false', () => {
      const sourceFile = createSourceFile('if (3 > 3) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('reports 42 > 0 as always true', () => {
      const sourceFile = createSourceFile('if (42 > 0) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('message mentions comparing constant numbers for >', () => {
      const sourceFile = createSourceFile('if (5 > 3) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('comparing constant numbers')
    })

    test('suggestion says replace with true for always true >', () => {
      const sourceFile = createSourceFile('if (5 > 3) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Replace with true')
    })

    test('suggestion says replace with false for always false >', () => {
      const sourceFile = createSourceFile('if (3 > 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Replace with false')
    })
  })

  describe('numeric literal comparisons with <=', () => {
    test('reports 3 <= 5 as always true', () => {
      const sourceFile = createSourceFile('if (3 <= 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('reports 5 <= 3 as always false', () => {
      const sourceFile = createSourceFile('if (5 <= 3) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('reports 3 <= 3 as always true (equal values)', () => {
      const sourceFile = createSourceFile('if (3 <= 3) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('reports 1 <= 100 as always true', () => {
      const sourceFile = createSourceFile('if (1 <= 100) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('reports 100 <= 1 as always false', () => {
      const sourceFile = createSourceFile('if (100 <= 1) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('reports 0 <= 0 as always true', () => {
      const sourceFile = createSourceFile('if (0 <= 0) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('suggestion says replace with true for always true <=', () => {
      const sourceFile = createSourceFile('if (3 <= 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Replace with true')
    })

    test('suggestion says replace with false for always false <=', () => {
      const sourceFile = createSourceFile('if (5 <= 3) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Replace with false')
    })
  })

  describe('numeric literal comparisons with >=', () => {
    test('reports 5 >= 3 as always true', () => {
      const sourceFile = createSourceFile('if (5 >= 3) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('reports 3 >= 5 as always false', () => {
      const sourceFile = createSourceFile('if (3 >= 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('reports 3 >= 3 as always true (equal values)', () => {
      const sourceFile = createSourceFile('if (3 >= 3) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('reports 100 >= 1 as always true', () => {
      const sourceFile = createSourceFile('if (100 >= 1) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('reports 1 >= 100 as always false', () => {
      const sourceFile = createSourceFile('if (1 >= 100) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('reports 0 >= 0 as always true', () => {
      const sourceFile = createSourceFile('if (0 >= 0) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('suggestion says replace with true for always true >=', () => {
      const sourceFile = createSourceFile('if (5 >= 3) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Replace with true')
    })

    test('suggestion says replace with false for always false >=', () => {
      const sourceFile = createSourceFile('if (3 >= 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Replace with false')
    })
  })

  describe('string literal comparisons with <', () => {
    test('reports "a" < "b" as always true', () => {
      const sourceFile = createSourceFile('if ("a" < "b") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('reports "b" < "a" as always false', () => {
      const sourceFile = createSourceFile('if ("b" < "a") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('reports "abc" < "def" as always true', () => {
      const sourceFile = createSourceFile('if ("abc" < "def") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('reports "hello" < "hello" as always false (equal strings)', () => {
      const sourceFile = createSourceFile('if ("hello" < "hello") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('message mentions comparing constant strings for <', () => {
      const sourceFile = createSourceFile('if ("a" < "b") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('comparing constant strings')
    })

    test('suggestion says replace with true for string < always true', () => {
      const sourceFile = createSourceFile('if ("a" < "b") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Replace with true')
    })

    test('suggestion says replace with false for string < always false', () => {
      const sourceFile = createSourceFile('if ("b" < "a") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toContain('Replace with false')
    })
  })

  describe('string literal comparisons with >', () => {
    test('reports "b" > "a" as always true', () => {
      const sourceFile = createSourceFile('if ("b" > "a") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('reports "a" > "b" as always false', () => {
      const sourceFile = createSourceFile('if ("a" > "b") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('reports "hello" > "hello" as always false', () => {
      const sourceFile = createSourceFile('if ("hello" > "hello") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('message mentions comparing constant strings for >', () => {
      const sourceFile = createSourceFile('if ("b" > "a") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('comparing constant strings')
    })
  })

  describe('string literal comparisons with <=', () => {
    test('reports "a" <= "b" as always true', () => {
      const sourceFile = createSourceFile('if ("a" <= "b") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('reports "b" <= "a" as always false', () => {
      const sourceFile = createSourceFile('if ("b" <= "a") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('reports "hello" <= "hello" as always true', () => {
      const sourceFile = createSourceFile('if ("hello" <= "hello") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('message mentions comparing constant strings for <=', () => {
      const sourceFile = createSourceFile('if ("a" <= "b") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('comparing constant strings')
    })
  })

  describe('string literal comparisons with >=', () => {
    test('reports "b" >= "a" as always true', () => {
      const sourceFile = createSourceFile('if ("b" >= "a") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('reports "a" >= "b" as always false', () => {
      const sourceFile = createSourceFile('if ("a" >= "b") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always false')
    })

    test('reports "hello" >= "hello" as always true', () => {
      const sourceFile = createSourceFile('if ("hello" >= "hello") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('always true')
    })

    test('message mentions comparing constant strings for >=', () => {
      const sourceFile = createSourceFile('if ("b" >= "a") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('comparing constant strings')
    })
  })

  describe('valid comparisons (no reports)', () => {
    test('does not report x === y (different identifiers)', () => {
      const sourceFile = createSourceFile('if (x === y) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report a !== b (different identifiers)', () => {
      const sourceFile = createSourceFile('if (a !== b) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report x == y', () => {
      const sourceFile = createSourceFile('if (x == y) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report x != y', () => {
      const sourceFile = createSourceFile('if (x != y) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report x < y (variables, not literals)', () => {
      const sourceFile = createSourceFile('if (x < y) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report x > y', () => {
      const sourceFile = createSourceFile('if (x > y) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report x <= y', () => {
      const sourceFile = createSourceFile('if (x <= y) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report x >= y', () => {
      const sourceFile = createSourceFile('if (x >= y) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report x + y (not a comparison)', () => {
      const sourceFile = createSourceFile('const z = x + y;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report x - y', () => {
      const sourceFile = createSourceFile('const z = x - y;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report assignment', () => {
      const sourceFile = createSourceFile('const x = 1;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report function call', () => {
      const sourceFile = createSourceFile('const r = fn();')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report 3 === 5 (different literals)', () => {
      const sourceFile = createSourceFile('if (3 === 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report "a" === "b" (different string literals)', () => {
      const sourceFile = createSourceFile('if ("a" === "b") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report true === false', () => {
      const sourceFile = createSourceFile('if (true === false) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report non-comparison binary expressions', () => {
      const sourceFile = createSourceFile('const x = 1 + 2;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report logical AND', () => {
      const sourceFile = createSourceFile('if (x && y) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report logical OR', () => {
      const sourceFile = createSourceFile('if (x || y) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report instanceof', () => {
      const sourceFile = createSourceFile('if (x instanceof Error) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report 5 + 3', () => {
      const sourceFile = createSourceFile('const x = 5 + 3;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report obj.foo === bar (member expression)', () => {
      const sourceFile = createSourceFile('if (obj.foo === bar) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report fn() === fn() (call expressions)', () => {
      const sourceFile = createSourceFile('if (fn() === fn()) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report 5 < x (variable on right)', () => {
      const sourceFile = createSourceFile('if (5 < x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report x < 5 (variable on left)', () => {
      const sourceFile = createSourceFile('if (x < 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('multiple comparisons', () => {
    test('reports two separate self-comparisons independently', () => {
      const sourceFile = createSourceFile('if (x === x && y === y) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(2)
    })

    test('reports three separate self-comparisons', () => {
      const sourceFile = createSourceFile('if (x === x) {} if (y === y) {} if (z === z) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(3)
    })

    test('reports mixed operators in same file', () => {
      const sourceFile = createSourceFile('const a = x === x; const b = 5 > 3;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(2)
    })

    test('reports self-comparison and NaN comparison in same file', () => {
      const sourceFile = createSourceFile('const a = x === x; const b = NaN === NaN;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(2)
    })

    test('reports !== and === self-comparisons in same file', () => {
      const sourceFile = createSourceFile('const a = x === x; const b = y !== y;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(2)
    })

    test('reports string and number comparisons in same file', () => {
      const sourceFile = createSourceFile('const a = 5 > 3; const b = "a" < "b";')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(2)
    })

    test('each violation has unique message content', () => {
      const sourceFile = createSourceFile('const a = x === x; const b = y !== y;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).not.toBe(violations[1].message)
    })
  })

  describe('violation structure', () => {
    test('violation has ruleId set to no-useless-comparison', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].ruleId).toBe('no-useless-comparison')
    })

    test('violation severity is warning', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].severity).toBe('warning')
    })

    test('violation has a range', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].range).toBeDefined()
    })

    test('violation range has start position', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].range.start).toBeDefined()
      expect(typeof violations[0].range.start.line).toBe('number')
      expect(typeof violations[0].range.start.column).toBe('number')
    })

    test('violation range has end position', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].range.end).toBeDefined()
      expect(typeof violations[0].range.end.line).toBe('number')
      expect(typeof violations[0].range.end.column).toBe('number')
    })

    test('violation has filePath', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].filePath).toBeDefined()
      expect(typeof violations[0].filePath).toBe('string')
    })

    test('violation has message', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toBeDefined()
      expect(typeof violations[0].message).toBe('string')
      expect(violations[0].message.length).toBeGreaterThan(0)
    })

    test('violation has suggestion', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toBeDefined()
      expect(typeof violations[0].suggestion).toBe('string')
      expect(violations[0].suggestion!.length).toBeGreaterThan(0)
    })

    test('violation message contains "This comparison is"', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('This comparison is')
    })

    test('violation message contains "never change behavior"', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('never change behavior')
    })

    test('violation message contains "can be simplified"', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('can be simplified')
    })
  })

  describe('message content verification', () => {
    test('always true message format for self-comparison', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toMatch(/always true/)
    })

    test('always false message format for !== self-comparison', () => {
      const sourceFile = createSourceFile('if (x !== x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toMatch(/always false/)
    })

    test('NaN === NaN message mentions NaN !== NaN reason', () => {
      const sourceFile = createSourceFile('if (NaN === NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('NaN !== NaN')
    })

    test('NaN !== NaN message mentions NaN !== NaN is true reason', () => {
      const sourceFile = createSourceFile('if (NaN !== NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('NaN !== NaN is true')
    })

    test('numeric comparison message includes both values', () => {
      const sourceFile = createSourceFile('if (5 > 3) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('5')
      expect(violations[0].message).toContain('3')
    })

    test('string comparison message mentions constant strings', () => {
      const sourceFile = createSourceFile('if ("a" < "b") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('comparing constant strings')
    })

    test('numeric comparison message mentions constant numbers', () => {
      const sourceFile = createSourceFile('if (5 > 3) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('comparing constant numbers')
    })

    test('message for 10 < 5 says always false', () => {
      const sourceFile = createSourceFile('if (10 < 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('always false')
    })

    test('message for 5 >= 5 says always true', () => {
      const sourceFile = createSourceFile('if (5 >= 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('always true')
    })

    test('message for "z" > "a" says always true', () => {
      const sourceFile = createSourceFile('if ("z" > "a") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].message).toContain('always true')
    })
  })

  describe('integration with rule system', () => {
    test('rule can be created and used', () => {
      const ruleInstance = noUselessComparisonRule.create({})
      expect(ruleInstance.visitor.visitNode).toBeDefined()
    })

    test('rule conforms to RuleDefinition interface', () => {
      expect(noUselessComparisonRule.meta).toBeDefined()
      expect(noUselessComparisonRule.create).toBeDefined()
      expect(noUselessComparisonRule.defaultOptions).toBeDefined()
    })

    test('analyzeNoUselessComparison returns array', () => {
      const sourceFile = createSourceFile('const x = 1;')
      const result = analyzeNoUselessComparison(sourceFile)
      expect(Array.isArray(result)).toBe(true)
    })

    test('analyzeNoUselessComparison accepts empty options', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const result = analyzeNoUselessComparison(sourceFile, {})
      expect(Array.isArray(result)).toBe(true)
    })

    test('analyzeNoUselessComparison accepts ignoreComparisonsToNaN option', () => {
      const sourceFile = createSourceFile('if (NaN === NaN) {}')
      const result = analyzeNoUselessComparison(sourceFile, { ignoreComparisonsToNaN: true })
      expect(result).toHaveLength(0)
    })

    test('rule create with empty options still detects violations', () => {
      const ruleInstance = noUselessComparisonRule.create({})
      expect(typeof ruleInstance.visitor.visitNode).toBe('function')
    })
  })

  describe('edge cases', () => {
    test('empty file produces no violations', () => {
      const sourceFile = createSourceFile('')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('file with only comments produces no violations', () => {
      const sourceFile = createSourceFile('// just a comment')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('file with only variable declaration produces no violations', () => {
      const sourceFile = createSourceFile('const x = 42;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('nested useless comparison is reported', () => {
      const sourceFile = createSourceFile('function f() { if (x === x) { return true; } }')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('deeply nested useless comparison is reported', () => {
      const sourceFile = createSourceFile(
        'function f() { if (true) { if (true) { if (x === x) {} } } }',
      )
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('useless comparison in ternary is reported', () => {
      const sourceFile = createSourceFile('const r = x === x ? 1 : 2;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('useless comparison in return statement is reported', () => {
      const sourceFile = createSourceFile('function f() { return x === x; }')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('multiple useless comparisons on different lines', () => {
      const sourceFile = createSourceFile('const a = x === x;\nconst b = y === y;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(2)
    })

    test('self-comparison in arrow function is reported', () => {
      const sourceFile = createSourceFile('const f = () => x === x;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('self-comparison in object method is reported', () => {
      const sourceFile = createSourceFile('const obj = { method() { return x === x; } };')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })
  })

  describe('suggestion content', () => {
    test('self-comparison === suggests removal', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toBe('Remove this comparison, it can never be false')
    })

    test('self-comparison !== suggests removal', () => {
      const sourceFile = createSourceFile('if (x !== x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toBe('Remove this comparison, it can never be true')
    })

    test('NaN comparison suggests Number.isNaN()', () => {
      const sourceFile = createSourceFile('if (NaN === NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toBe('Use Number.isNaN() to check for NaN')
    })

    test('NaN !== comparison suggests Number.isNaN()', () => {
      const sourceFile = createSourceFile('if (NaN !== NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toBe('Use Number.isNaN() to check for NaN')
    })

    test('always true ordering suggests replace with true', () => {
      const sourceFile = createSourceFile('if (5 > 3) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toBe('Replace with true, or remove if used in condition')
    })

    test('always false ordering suggests replace with false', () => {
      const sourceFile = createSourceFile('if (3 > 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toBe('Replace with false, or remove if used in condition')
    })

    test('always true string comparison suggests replace with true', () => {
      const sourceFile = createSourceFile('if ("a" < "b") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toBe('Replace with true, or remove if used in condition')
    })

    test('always false string comparison suggests replace with false', () => {
      const sourceFile = createSourceFile('if ("b" < "a") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].suggestion).toBe('Replace with false, or remove if used in condition')
    })
  })

  describe('location reporting', () => {
    test('violation range start line is positive', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].range.start.line).toBeGreaterThan(0)
    })

    test('violation range end line is positive', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].range.end.line).toBeGreaterThan(0)
    })

    test('violation range start column is non-negative', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].range.start.column).toBeGreaterThanOrEqual(0)
    })

    test('violation range end column is non-negative', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].range.end.column).toBeGreaterThanOrEqual(0)
    })

    test('violation on second line reports correct start line', () => {
      const sourceFile = createSourceFile('const a = 1;\nif (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].range.start.line).toBe(2)
    })

    test('violations on different lines have different ranges', () => {
      const sourceFile = createSourceFile('if (x === x) {}\nif (y === y) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations[0].range.start.line).not.toBe(violations[1].range.start.line)
    })

    test('end position is after start position', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      const start = violations[0].range.start
      const end = violations[0].range.end
      expect(end.line).toBeGreaterThanOrEqual(start.line)
    })
  })

  describe('export verification', () => {
    test('noUselessComparisonRule is exported as named export', () => {
      expect(noUselessComparisonRule).toBeDefined()
    })

    test('analyzeNoUselessComparison is exported as named export', () => {
      expect(analyzeNoUselessComparison).toBeDefined()
      expect(typeof analyzeNoUselessComparison).toBe('function')
    })

    test('noUselessComparisonRule has create method', () => {
      expect(typeof noUselessComparisonRule.create).toBe('function')
    })

    test('noUselessComparisonRule has meta property', () => {
      expect(noUselessComparisonRule.meta).toBeDefined()
    })

    test('noUselessComparisonRule has defaultOptions property', () => {
      expect(noUselessComparisonRule.defaultOptions).toBeDefined()
    })
  })

  describe('comparison operator coverage', () => {
    test('reports === operator', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports == operator', () => {
      const sourceFile = createSourceFile('if (x == x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports !== operator', () => {
      const sourceFile = createSourceFile('if (x !== x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports != operator', () => {
      const sourceFile = createSourceFile('if (x != x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports < operator with literals', () => {
      const sourceFile = createSourceFile('if (1 < 2) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports > operator with literals', () => {
      const sourceFile = createSourceFile('if (2 > 1) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports <= operator with literals', () => {
      const sourceFile = createSourceFile('if (1 <= 2) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports >= operator with literals', () => {
      const sourceFile = createSourceFile('if (2 >= 1) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('does not report + operator', () => {
      const sourceFile = createSourceFile('const x = 1 + 1;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report - operator', () => {
      const sourceFile = createSourceFile('const x = 1 - 1;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report * operator', () => {
      const sourceFile = createSourceFile('const x = 2 * 3;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report / operator', () => {
      const sourceFile = createSourceFile('const x = 6 / 2;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report % operator', () => {
      const sourceFile = createSourceFile('const x = 5 % 2;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report ** operator', () => {
      const sourceFile = createSourceFile('const x = 2 ** 3;')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('expression type handling', () => {
    test('reports comparison with identifier on both sides', () => {
      const sourceFile = createSourceFile('if (foo === foo) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports comparison with numeric literals on both sides for ordering', () => {
      const sourceFile = createSourceFile('if (1 < 2) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports comparison with string literals on both sides for ordering', () => {
      const sourceFile = createSourceFile('if ("a" < "b") {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('does not report member expression === identifier', () => {
      const sourceFile = createSourceFile('if (obj.prop === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('does not report call expression === literal', () => {
      const sourceFile = createSourceFile('if (fn() === 5) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(0)
    })

    test('reports null === null', () => {
      const sourceFile = createSourceFile('if (null === null) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports true === true', () => {
      const sourceFile = createSourceFile('if (true === true) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports false !== false', () => {
      const sourceFile = createSourceFile('if (false !== false) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('reports null == null', () => {
      const sourceFile = createSourceFile('if (null == null) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })
  })

  describe('options handling', () => {
    test('default options detect x === x', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile)
      expect(violations).toHaveLength(1)
    })

    test('ignoreComparisonsToNaN does not affect non-NaN comparisons', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile, { ignoreComparisonsToNaN: true })
      expect(violations).toHaveLength(1)
    })

    test('ignoreComparisonsToNaN does not affect numeric literal comparisons', () => {
      const sourceFile = createSourceFile('if (5 > 3) {}')
      const violations = analyzeNoUselessComparison(sourceFile, { ignoreComparisonsToNaN: true })
      expect(violations).toHaveLength(1)
    })

    test('ignoreComparisonsToNaN does not affect string comparisons', () => {
      const sourceFile = createSourceFile('if ("a" < "b") {}')
      const violations = analyzeNoUselessComparison(sourceFile, { ignoreComparisonsToNaN: true })
      expect(violations).toHaveLength(1)
    })

    test('NaN !== NaN is ignored when option is true', () => {
      const sourceFile = createSourceFile('if (NaN !== NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile, { ignoreComparisonsToNaN: true })
      expect(violations).toHaveLength(0)
    })

    test('NaN != NaN is ignored when option is true', () => {
      const sourceFile = createSourceFile('if (NaN != NaN) {}')
      const violations = analyzeNoUselessComparison(sourceFile, { ignoreComparisonsToNaN: true })
      expect(violations).toHaveLength(0)
    })

    test('empty options object does not affect behavior', () => {
      const sourceFile = createSourceFile('if (x === x) {}')
      const violations = analyzeNoUselessComparison(sourceFile, {})
      expect(violations).toHaveLength(1)
    })
  })
})
