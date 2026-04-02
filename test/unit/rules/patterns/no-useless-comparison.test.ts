import { describe, test, expect, vi } from 'vitest'
import {
  noUselessComparisonRule,
  analyzeNoUselessComparison,
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

function createMockVisitorContext(sourceFile: unknown): VisitorContext {
  return {
    sourceFile: sourceFile as any,
    depth: 0,
    parent: undefined,
    addViolation: vi.fn(),
    getFilePath: () => '/src/file.ts',
  }
}

vi.mock('ts-morph', () => {
  const actual = vi.importActual('ts-morph')
  const kinds = {
    SourceFile: 305,
    BinaryExpression: 225,
    Identifier: 79,
    NumericLiteral: 8,
    StringLiteral: 9,
    TrueKeyword: 102,
    FalseKeyword: 99,
    NullKeyword: 101,
    EqualsEqualsToken: 40,
    EqualsEqualsEqualsToken: 41,
    ExclamationEqualsToken: 42,
    ExclamationEqualsEqualsToken: 43,
    LessThanToken: 32,
    LessThanEqualsToken: 33,
    GreaterThanToken: 35,
    GreaterThanEqualsToken: 36,
  }

  const isNodeOfKind = (node: { getKind: () => number }, kind: number) => node?.getKind() === kind

  return {
    ...actual,
    Node: {
      isBinaryExpression: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.BinaryExpression),
      isIdentifier: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.Identifier),
      isNumericLiteral: (node: { getKind: () => number }) =>
        isNodeOfKind(node, kinds.NumericLiteral),
      isStringLiteral: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.StringLiteral),
      isTrueLiteral: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.TrueKeyword),
      isFalseLiteral: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.FalseKeyword),
      isNullLiteral: (node: { getKind: () => number }) => isNodeOfKind(node, kinds.NullKeyword),
    },
  }
})

describe('no-useless-comparison rule', () => {
  describe('meta', () => {
    test('has correct rule name', () => {
      expect(noUselessComparisonRule.meta.name).toBe('no-useless-comparison')
    })

    test('has correct category', () => {
      expect(noUselessComparisonRule.meta.category).toBe('patterns')
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
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = noUselessComparisonRule.create({})
      const node = createMockBinaryExpression({
        left: createMockIdentifier('x'),
        right: createMockIdentifier('y'),
        operator: '===',
      })
      ruleInstance.visitor.visitNode!(node as any, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(0)
    })
  })
})

describe('self-comparison', () => {
  test('reports x === x', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockIdentifier('x'),
      right: createMockIdentifier('x'),
      operator: '===',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('always true')
    expect(violations[0].suggestion).toContain('never be false')
  })

  test('reports x !== x', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockIdentifier('x'),
      right: createMockIdentifier('x'),
      operator: '!==',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('always false')
    expect(violations[0].suggestion).toContain('never be true')
  })

  test('reports == for self-comparison', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockIdentifier('value'),
      right: createMockIdentifier('value'),
      operator: '==',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('always true')
  })

  test('reports != for self-comparison', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockIdentifier('value'),
      right: createMockIdentifier('value'),
      operator: '!=',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('always false')
  })

  test('does not report x === y', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockIdentifier('x'),
      right: createMockIdentifier('y'),
      operator: '===',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })
})

describe('NaN comparisons', () => {
  test('reports NaN === NaN by default', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockIdentifier('NaN'),
      right: createMockIdentifier('NaN'),
      operator: '===',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('always false')
    expect(violations[0].message).toContain('NaN')
    expect(violations[0].suggestion).toContain('Number.isNaN()')
  })

  test('reports NaN !== NaN by default', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockIdentifier('NaN'),
      right: createMockIdentifier('NaN'),
      operator: '!==',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('always true')
    expect(violations[0].message).toContain('NaN')
  })

  test('ignores NaN comparisons when option is set', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({ ignoreComparisonsToNaN: true })

    const node = createMockBinaryExpression({
      left: createMockIdentifier('NaN'),
      right: createMockIdentifier('NaN'),
      operator: '===',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })
})

describe('literal comparisons', () => {
  test('reports 5 > 3 as always true', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockNumericLiteral(5),
      right: createMockNumericLiteral(3),
      operator: '>',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('always true')
    expect(violations[0].message).toContain('5')
    expect(violations[0].message).toContain('3')
  })

  test('reports 3 > 5 as always false', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockNumericLiteral(3),
      right: createMockNumericLiteral(5),
      operator: '>',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('always false')
  })

  test('reports "zebra" < "apple" as always false', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockStringLiteral('zebra'),
      right: createMockStringLiteral('apple'),
      operator: '<',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('always false')
    expect(violations[0].message).toContain('comparing constant strings')
  })

  test('reports "apple" < "zebra" as always true', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockStringLiteral('apple'),
      right: createMockStringLiteral('zebra'),
      operator: '<',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('always true')
  })

  test('reports 10 >= 10 as always true', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockNumericLiteral(10),
      right: createMockNumericLiteral(10),
      operator: '>=',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('always true')
  })

  test('does not report 5 > x', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockNumericLiteral(5),
      right: createMockIdentifier('x'),
      operator: '>',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })

  test('does not report x > 5', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockIdentifier('x'),
      right: createMockNumericLiteral(5),
      operator: '>',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })
})

describe('violation structure', () => {
  test('violation includes correct ruleId', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockIdentifier('x'),
      right: createMockIdentifier('x'),
      operator: '===',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].ruleId).toBe('no-useless-comparison')
  })

  test('violation includes warning severity', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockIdentifier('x'),
      right: createMockIdentifier('x'),
      operator: '===',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].severity).toBe('warning')
  })

  test('violation includes suggestion', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockIdentifier('x'),
      right: createMockIdentifier('x'),
      operator: '===',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].suggestion).toBeDefined()
  })

  test('violation includes range', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockIdentifier('x'),
      right: createMockIdentifier('x'),
      operator: '===',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].range).toBeDefined()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })
})

describe('analyzeNoUselessComparison', () => {
  test('returns empty array for file with no violations', () => {
    const node = createMockBinaryExpression({
      left: createMockIdentifier('x'),
      right: createMockIdentifier('y'),
      operator: '===',
    })
    const sourceFile = createSourceFileWithChildren([node]) as any
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeNoUselessComparison(sourceFile)
    expect(violations).toHaveLength(0)
  })

  test('returns violations for useless comparisons', () => {
    const node = createMockBinaryExpression({
      left: createMockIdentifier('x'),
      right: createMockIdentifier('x'),
      operator: '===',
    })
    const sourceFile = createSourceFileWithChildren([node]) as any
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeNoUselessComparison(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-useless-comparison')
  })

  test('uses default options when not specified', () => {
    const node = createMockBinaryExpression({
      left: createMockIdentifier('NaN'),
      right: createMockIdentifier('NaN'),
      operator: '===',
    })
    const sourceFile = createSourceFileWithChildren([node]) as any
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeNoUselessComparison(sourceFile)
    expect(violations).toHaveLength(1)
  })

  test('uses custom options when specified', () => {
    const node = createMockBinaryExpression({
      left: createMockIdentifier('NaN'),
      right: createMockIdentifier('NaN'),
      operator: '===',
    })
    const sourceFile = createSourceFileWithChildren([node]) as any
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeNoUselessComparison(sourceFile, {
      ignoreComparisonsToNaN: true,
    })
    expect(violations).toHaveLength(0)
  })

  test('handles multiple violations', () => {
    const node1 = createMockBinaryExpression({
      left: createMockIdentifier('x'),
      right: createMockIdentifier('x'),
      operator: '===',
    })
    const node2 = createMockBinaryExpression({
      left: createMockNumericLiteral(5),
      right: createMockNumericLiteral(3),
      operator: '>',
    })
    const sourceFile = createSourceFileWithChildren([node1, node2]) as any
    ;(sourceFile as { getKind: () => number }).getKind = () => SyntaxKind.SourceFile

    const violations = analyzeNoUselessComparison(sourceFile)
    expect(violations).toHaveLength(2)
  })
})

describe('edge cases', () => {
  test('handles empty source file', () => {
    const sourceFile = createMockSourceFile()
    const violations = analyzeNoUselessComparison(sourceFile as any)
    expect(violations).toHaveLength(0)
  })

  test('handles non-binary expression nodes', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockIdentifier('x')
    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })

  test('handles arithmetic operators (not comparisons)', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockIdentifier('x'),
      right: createMockIdentifier('y'),
      operator: '+',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })

  test('handles boolean literals', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockBooleanLiteral(true),
      right: createMockBooleanLiteral(true),
      operator: '===',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
  })

  test('handles null literals', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockNullLiteral(),
      right: createMockNullLiteral(),
      operator: '===',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
  })

  test('handles same string literals', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockStringLiteral('hello'),
      right: createMockStringLiteral('hello'),
      operator: '===',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
  })

  test('handles same numeric literals', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noUselessComparisonRule.create({})

    const node = createMockBinaryExpression({
      left: createMockNumericLiteral(42),
      right: createMockNumericLiteral(42),
      operator: '===',
    })

    ruleInstance.visitor.visitNode!(node as any, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
  })
})
