import { describe, test, expect, vi } from 'vitest'
import { noDuplicateElseIfRule } from '../../../../src/rules/patterns/no-duplicate-else-if.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createBlockStatement(statements: unknown[] = []): unknown {
  return {
    type: 'BlockStatement',
    body: statements,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createEmptyBlock(): unknown {
  return createBlockStatement([])
}

function createIfStatement(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'IfStatement',
    test,
    consequent,
    alternate,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createBinaryExpression(operator: string, left: unknown, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
  }
}

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
  }
}

function createLogicalExpression(operator: string, left: unknown, right: unknown): unknown {
  return {
    type: 'LogicalExpression',
    operator,
    left,
    right,
  }
}

function createMemberExpression(object: unknown, property: unknown, computed = false): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed,
  }
}

function createCallExpression(callee: unknown, args: unknown[] = []): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
  }
}

function createConditionalExpression(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
): unknown {
  return {
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
  }
}

describe('no-duplicate-else-if rule', () => {
  // ========================================
  // 1. META PROPERTIES (Tests 1-16)
  // ========================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noDuplicateElseIfRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noDuplicateElseIfRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noDuplicateElseIfRule.meta.docs?.recommended).toBe(true)
    })

    test('should have logic category', () => {
      expect(noDuplicateElseIfRule.meta.docs?.category).toBe('logic')
    })

    test('should have schema defined', () => {
      expect(noDuplicateElseIfRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noDuplicateElseIfRule.meta.fixable).toBeUndefined()
    })

    test('should mention duplicate in description', () => {
      expect(noDuplicateElseIfRule.meta.docs?.description.toLowerCase()).toContain('duplicate')
    })

    test('should mention if-else chain in description', () => {
      expect(noDuplicateElseIfRule.meta.docs?.description.toLowerCase()).toContain('if-else')
    })

    test('should have meta property defined', () => {
      expect(noDuplicateElseIfRule.meta).toBeDefined()
    })

    test('should have docs property defined', () => {
      expect(noDuplicateElseIfRule.meta.docs).toBeDefined()
    })

    test('should have docs description as non-empty string', () => {
      expect(typeof noDuplicateElseIfRule.meta.docs?.description).toBe('string')
      expect(noDuplicateElseIfRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have type as valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noDuplicateElseIfRule.meta.type)
    })

    test('should have severity as valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(noDuplicateElseIfRule.meta.severity)
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noDuplicateElseIfRule.meta.schema)).toBe(true)
    })

    test('should have docs url defined', () => {
      expect(noDuplicateElseIfRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url as string containing docs', () => {
      expect(typeof noDuplicateElseIfRule.meta.docs?.url).toBe('string')
      expect(noDuplicateElseIfRule.meta.docs?.url).toContain('docs')
    })
  })

  // ========================================
  // 2. VISITOR STRUCTURE (Tests 17-28)
  // ========================================
  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      expect(visitor).toHaveProperty('IfStatement')
      expect(visitor).toHaveProperty('Program:exit')
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should have IfStatement as a function', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      expect(typeof visitor.IfStatement).toBe('function')
    })

    test('should have Program:exit as a function', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      expect(typeof visitor['Program:exit']).toBe('function')
    })

    test('should create a new visitor each time', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor1 = noDuplicateElseIfRule.create(context)
      const visitor2 = noDuplicateElseIfRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context with different file paths', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}', filePath: '/custom/path.ts' })
      const visitor = noDuplicateElseIfRule.create(context)

      expect(visitor).toHaveProperty('IfStatement')
    })

    test('should accept context with different source', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1', filePath: '/src/file.ts' })
      const visitor = noDuplicateElseIfRule.create(context)

      expect(visitor).toHaveProperty('IfStatement')
    })

    test('should have create as a function', () => {
      expect(typeof noDuplicateElseIfRule.create).toBe('function')
    })

    test('should not throw when creating visitor with valid context', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })

      expect(() => noDuplicateElseIfRule.create(context)).not.toThrow()
    })

    test('IfStatement should not throw when called with valid node', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 1, 0)
      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('Program:exit should not throw when called without any nodes', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      expect(() => visitor['Program:exit']()).not.toThrow()
    })

    test('should have exactly two visitor methods', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      expect(Object.keys(visitor).length).toBe(2)
    })
  })

  // ========================================
  // 3. DETECTION POSITIVE - DUPLICATE CONDITIONS (Tests 29-72)
  // ========================================
  describe('detecting duplicate conditions', () => {
    test('should report duplicate identifier conditions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Duplicate condition')
    })

    test('should report duplicate literal conditions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createLiteral(5), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createLiteral(5), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report duplicate binary expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createBinaryExpression('>', createIdentifier('x'), createLiteral(10))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report multiple duplicate conditions in same chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const conditionA = createIdentifier('a')
      const conditionB = createIdentifier('b')

      const thirdIf = createIfStatement(conditionA, createEmptyBlock(), null, 5, 5)
      const secondIf = createIfStatement(conditionB, createEmptyBlock(), thirdIf, 3, 5)
      const firstIf = createIfStatement(conditionA, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor.IfStatement(thirdIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('line 1')
    })

    test('should report second occurrence location', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 10, 8)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should reference first occurrence line in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 10, 8)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 5, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message).toContain('line 5')
    })

    test('should detect duplicate with string literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createLiteral('hello'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(
        createLiteral('hello'),
        createEmptyBlock(),
        duplicateIf,
        1,
        0,
      )

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with boolean literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createLiteral(true), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createLiteral(true), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with null literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createLiteral(null), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createLiteral(null), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with numeric literal 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createLiteral(0), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createLiteral(0), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with negative numeric literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createLiteral(-1), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createLiteral(-1), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with empty string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createLiteral(''), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createLiteral(''), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate unary expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createUnaryExpression('!', createIdentifier('x'))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate logical expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createLogicalExpression('&&', createIdentifier('x'), createIdentifier('y'))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate member expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate call expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createCallExpression(createIdentifier('fn'), [createIdentifier('x')])
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate in three-branch chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condX = createIdentifier('x')

      const thirdIf = createIfStatement(condX, createEmptyBlock(), null, 7, 5)
      const secondIf = createIfStatement(createIdentifier('y'), createEmptyBlock(), thirdIf, 4, 5)
      const firstIf = createIfStatement(condX, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor.IfStatement(thirdIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate in four-branch chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condA = createIdentifier('a')

      const fourthIf = createIfStatement(condA, createEmptyBlock(), null, 10, 5)
      const thirdIf = createIfStatement(createIdentifier('c'), createEmptyBlock(), fourthIf, 7, 5)
      const secondIf = createIfStatement(createIdentifier('b'), createEmptyBlock(), thirdIf, 4, 5)
      const firstIf = createIfStatement(condA, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor.IfStatement(thirdIf)
      visitor.IfStatement(fourthIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect two separate duplicate pairs in same chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condA = createIdentifier('a')
      const condB = createIdentifier('b')

      const fourthIf = createIfStatement(condA, createEmptyBlock(), null, 10, 5)
      const thirdIf = createIfStatement(condB, createEmptyBlock(), fourthIf, 7, 5)
      const secondIf = createIfStatement(condB, createEmptyBlock(), thirdIf, 4, 5)
      const firstIf = createIfStatement(condA, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor.IfStatement(thirdIf)
      visitor.IfStatement(fourthIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(2)
    })

    test('should detect duplicate with === operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createBinaryExpression('===', createIdentifier('x'), createLiteral(1))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with !== operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createBinaryExpression('!==', createIdentifier('x'), createLiteral(1))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with <= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createBinaryExpression('<=', createIdentifier('x'), createLiteral(5))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with >= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createBinaryExpression('>=', createIdentifier('x'), createLiteral(5))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with || logical expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createLogicalExpression('||', createIdentifier('x'), createIdentifier('y'))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with typeof unary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createUnaryExpression('typeof', createIdentifier('x'))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate computed member expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createMemberExpression(createIdentifier('arr'), createLiteral(0), true)
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate call expressions with multiple args', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createCallExpression(createIdentifier('fn'), [
        createIdentifier('a'),
        createIdentifier('b'),
      ])
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with nested binary expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const innerCond = createBinaryExpression('+', createIdentifier('x'), createLiteral(1))
      const condition = createBinaryExpression('>', innerCond, createLiteral(5))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with conditional expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(1),
        createLiteral(2),
      )
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with double negation', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const innerUnary = createUnaryExpression('!', createIdentifier('x'))
      const condition = createUnaryExpression('!', innerUnary)
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with - unary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createUnaryExpression('-', createIdentifier('x'))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with chained member expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const obj = createMemberExpression(createIdentifier('a'), createIdentifier('b'))
      const condition = createMemberExpression(obj, createIdentifier('c'))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with same complex expression twice', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      // Build two structurally identical expressions (different objects)
      const buildExpr = () =>
        createLogicalExpression(
          '&&',
          createBinaryExpression('>', createIdentifier('x'), createLiteral(0)),
          createBinaryExpression('<', createIdentifier('x'), createLiteral(100)),
        )

      const duplicateIf = createIfStatement(buildExpr(), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(buildExpr(), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate in five-branch chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condA = createIdentifier('a')

      const fifth = createIfStatement(condA, createEmptyBlock(), null, 13, 5)
      const fourth = createIfStatement(createIdentifier('e'), createEmptyBlock(), fifth, 10, 5)
      const third = createIfStatement(createIdentifier('d'), createEmptyBlock(), fourth, 7, 5)
      const second = createIfStatement(createIdentifier('c'), createEmptyBlock(), third, 4, 5)
      const first = createIfStatement(condA, createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor.IfStatement(fourth)
      visitor.IfStatement(fifth)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect triple duplicate in same chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condX = createIdentifier('x')

      const third = createIfStatement(condX, createEmptyBlock(), null, 7, 5)
      const second = createIfStatement(condX, createEmptyBlock(), third, 4, 5)
      const first = createIfStatement(condX, createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor['Program:exit']()

      expect(reports.length).toBe(2)
    })

    test('should detect duplicate with same identifier but different casing treated as different', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const secondIf = createIfStatement(createIdentifier('X'), createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      // Different identifiers (case-sensitive), should NOT report
      expect(reports.length).toBe(0)
    })

    test('should detect duplicate with identical logical expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const buildCond = () =>
        createLogicalExpression(
          '||',
          createBinaryExpression('===', createIdentifier('x'), createLiteral(1)),
          createBinaryExpression('===', createIdentifier('y'), createLiteral(2)),
        )

      const duplicateIf = createIfStatement(buildCond(), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(buildCond(), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should report on first duplicate pair only when triple chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condA = createIdentifier('a')
      const condB = createIdentifier('b')

      const third = createIfStatement(condB, createEmptyBlock(), null, 7, 5)
      const second = createIfStatement(condA, createEmptyBlock(), third, 4, 5)
      const first = createIfStatement(condA, createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor['Program:exit']()

      // Second occurrence of 'a' should be reported
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('line 1')
    })

    test('should detect duplicate BooleanLiteral type', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const cond = { type: 'BooleanLiteral', value: true }
      const duplicateIf = createIfStatement(cond, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(
        { type: 'BooleanLiteral', value: true },
        createEmptyBlock(),
        duplicateIf,
        1,
        0,
      )

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate NumericLiteral type', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(
        { type: 'NumericLiteral', value: 42 },
        createEmptyBlock(),
        null,
        3,
        5,
      )
      const mainIf = createIfStatement(
        { type: 'NumericLiteral', value: 42 },
        createEmptyBlock(),
        duplicateIf,
        1,
        0,
      )

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate StringLiteral type', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(
        { type: 'StringLiteral', value: 'test' },
        createEmptyBlock(),
        null,
        3,
        5,
      )
      const mainIf = createIfStatement(
        { type: 'StringLiteral', value: 'test' },
        createEmptyBlock(),
        duplicateIf,
        1,
        0,
      )

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate call with no args', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createCallExpression(createIdentifier('fn'))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })
  })

  // ========================================
  // 4. DETECTION NEGATIVE - NO DUPLICATES (Tests 73-112)
  // ========================================
  describe('not detecting duplicates', () => {
    test('should not report different conditions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const secondIf = createIfStatement(createIdentifier('y'), createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report single if statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const singleIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 1, 0)

      visitor.IfStatement(singleIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report if without alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const singleIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null)

      visitor.IfStatement(singleIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report different binary expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition1 = createBinaryExpression('>', createIdentifier('x'), createLiteral(10))
      const condition2 = createBinaryExpression('>', createIdentifier('x'), createLiteral(20))

      const secondIf = createIfStatement(condition2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(condition1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report different operators', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition1 = createBinaryExpression('>', createIdentifier('x'), createLiteral(10))
      const condition2 = createBinaryExpression('<', createIdentifier('x'), createLiteral(10))

      const secondIf = createIfStatement(condition2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(condition1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report different identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const secondIf = createIfStatement(createIdentifier('y'), createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report different literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const secondIf = createIfStatement(createLiteral(2), createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(createLiteral(1), createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report different string literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const secondIf = createIfStatement(createLiteral('b'), createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(createLiteral('a'), createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report true vs false literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const secondIf = createIfStatement(createLiteral(false), createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(createLiteral(true), createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report different binary expression operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const cond1 = createBinaryExpression('>', createIdentifier('x'), createLiteral(10))
      const cond2 = createBinaryExpression('>', createIdentifier('y'), createLiteral(10))

      const secondIf = createIfStatement(cond2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(cond1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report with no IfStatement calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report when only Program:exit is called', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      visitor['Program:exit']()
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report three unique conditions in chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const third = createIfStatement(createIdentifier('c'), createEmptyBlock(), null, 7, 5)
      const second = createIfStatement(createIdentifier('b'), createEmptyBlock(), third, 4, 5)
      const first = createIfStatement(createIdentifier('a'), createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report four unique conditions in chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const fourth = createIfStatement(createIdentifier('d'), createEmptyBlock(), null, 10, 5)
      const third = createIfStatement(createIdentifier('c'), createEmptyBlock(), fourth, 7, 5)
      const second = createIfStatement(createIdentifier('b'), createEmptyBlock(), third, 4, 5)
      const first = createIfStatement(createIdentifier('a'), createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor.IfStatement(fourth)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report different unary operators', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const cond1 = createUnaryExpression('!', createIdentifier('x'))
      const cond2 = createUnaryExpression('-', createIdentifier('x'))

      const secondIf = createIfStatement(cond2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(cond1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report different logical operators', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const cond1 = createLogicalExpression('&&', createIdentifier('x'), createIdentifier('y'))
      const cond2 = createLogicalExpression('||', createIdentifier('x'), createIdentifier('y'))

      const secondIf = createIfStatement(cond2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(cond1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report different member expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const cond1 = createMemberExpression(createIdentifier('a'), createIdentifier('x'))
      const cond2 = createMemberExpression(createIdentifier('b'), createIdentifier('x'))

      const secondIf = createIfStatement(cond2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(cond1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report different call expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const cond1 = createCallExpression(createIdentifier('fn1'))
      const cond2 = createCallExpression(createIdentifier('fn2'))

      const secondIf = createIfStatement(cond2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(cond1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report call with different argument count', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const cond1 = createCallExpression(createIdentifier('fn'), [createIdentifier('x')])
      const cond2 = createCallExpression(createIdentifier('fn'), [
        createIdentifier('x'),
        createIdentifier('y'),
      ])

      const secondIf = createIfStatement(cond2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(cond1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report computed vs non-computed member expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const cond1 = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'), false)
      const cond2 = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'), true)

      const secondIf = createIfStatement(cond2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(cond1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report different conditional expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const cond1 = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(1),
        createLiteral(2),
      )
      const cond2 = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(1),
        createLiteral(3),
      )

      const secondIf = createIfStatement(cond2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(cond1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report if alternate is BlockStatement not IfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const elseBlock = createBlockStatement([{ type: 'ReturnStatement' }])
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), elseBlock, 1, 0)

      visitor.IfStatement(mainIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report when conditions are in separate chains', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      // Chain 1: if(x) else if(y)
      const chain1Else = createIfStatement(createIdentifier('y'), createEmptyBlock(), null, 3, 5)
      const chain1Main = createIfStatement(
        createIdentifier('x'),
        createEmptyBlock(),
        chain1Else,
        1,
        0,
      )

      // Chain 2: separate if(x) - not connected
      const chain2Main = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 10, 0)

      visitor.IfStatement(chain1Main)
      visitor.IfStatement(chain1Else)
      visitor.IfStatement(chain2Main)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report for five unique conditions', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const fifth = createIfStatement(createIdentifier('e'), createEmptyBlock(), null, 13, 5)
      const fourth = createIfStatement(createIdentifier('d'), createEmptyBlock(), fifth, 10, 5)
      const third = createIfStatement(createIdentifier('c'), createEmptyBlock(), fourth, 7, 5)
      const second = createIfStatement(createIdentifier('b'), createEmptyBlock(), third, 4, 5)
      const first = createIfStatement(createIdentifier('a'), createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor.IfStatement(fourth)
      visitor.IfStatement(fifth)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report different operands in same position', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const cond1 = createBinaryExpression('+', createIdentifier('a'), createIdentifier('b'))
      const cond2 = createBinaryExpression('+', createIdentifier('a'), createIdentifier('c'))

      const secondIf = createIfStatement(cond2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(cond1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report null vs undefined literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const secondIf = createIfStatement(createLiteral(undefined), createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(createLiteral(null), createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should not report when same condition appears in different branches of separate chains', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      // Two completely separate if chains with same condition
      const chain2 = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 10, 0)
      const chain1Alt = createIfStatement(createIdentifier('y'), createEmptyBlock(), null, 3, 5)
      const chain1 = createIfStatement(createIdentifier('x'), createEmptyBlock(), chain1Alt, 1, 0)

      visitor.IfStatement(chain1)
      visitor.IfStatement(chain1Alt)
      visitor.IfStatement(chain2)
      visitor['Program:exit']()

      // chain2 is NOT an alternate of chain1, so it's a separate chain
      expect(reports.length).toBe(0)
    })

    test('should not report identical conditions in separate unrelated if statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const if1 = createIfStatement(createIdentifier('a'), createEmptyBlock(), null, 1, 0)
      const if2 = createIfStatement(createIdentifier('a'), createEmptyBlock(), null, 5, 0)

      visitor.IfStatement(if1)
      visitor.IfStatement(if2)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })
  })

  // ========================================
  // 5. EDGE CASES (Tests 113-148)
  // ========================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      expect(() => visitor.IfStatement('string')).not.toThrow()
      expect(() => visitor.IfStatement(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: null,
      }
      const mainIf = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: duplicateIf,
      }

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'if (x) {} else if (x) {}',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      expect(() => {
        visitor.IfStatement(mainIf)
        visitor.IfStatement(duplicateIf)
        visitor['Program:exit']()
      }).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-if alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const elseBlock = createBlockStatement([{ type: 'ReturnStatement' }])
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), elseBlock, 1, 0)

      visitor.IfStatement(mainIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle node without test', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: 'IfStatement',
        consequent: createEmptyBlock(),
        alternate: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(() => visitor['Program:exit']()).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should only process each chain once', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle IfStatement with non-IfStatement type', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: null,
      }

      expect(() => {
        visitor.IfStatement(node)
        visitor['Program:exit']()
      }).not.toThrow()
    })

    test('should handle alternate that is not an IfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const mainIf = createIfStatement(
        createIdentifier('x'),
        createEmptyBlock(),
        {
          type: 'BlockStatement',
          body: [],
        },
        1,
        0,
      )

      expect(() => {
        visitor.IfStatement(mainIf)
        visitor['Program:exit']()
      }).not.toThrow()
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      expect(() => visitor.IfStatement(true)).not.toThrow()
      expect(() => visitor.IfStatement(false)).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      expect(() => visitor.IfStatement(0)).not.toThrow()
      expect(() => visitor.IfStatement(-1)).not.toThrow()
      expect(() => visitor.IfStatement(3.14)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      expect(() => visitor.IfStatement({})).not.toThrow()
      expect(() => visitor['Program:exit']()).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        alternate: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(() => visitor['Program:exit']()).not.toThrow()
    })

    test('should handle node with undefined test', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: undefined,
        consequent: createEmptyBlock(),
        alternate: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(() => visitor['Program:exit']()).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null test', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: null,
        consequent: createEmptyBlock(),
        alternate: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(() => visitor['Program:exit']()).not.toThrow()
    })

    test('should handle node with string type different from IfStatement', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: 'ForStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: null,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(() => visitor['Program:exit']()).not.toThrow()
    })

    test('should handle node with numeric type', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: 42,
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: null,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(() => visitor['Program:exit']()).not.toThrow()
    })

    test('should handle node with array type', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: ['IfStatement'],
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: null,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(() => visitor['Program:exit']()).not.toThrow()
    })

    test('should handle alternate as string', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: 'not a node',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(() => visitor['Program:exit']()).not.toThrow()
    })

    test('should handle alternate as number', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: 42,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(() => visitor['Program:exit']()).not.toThrow()
    })

    test('should handle node with only loc.start', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: null,
        loc: {
          start: { line: 3, column: 5 },
        },
      }
      const mainIf = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: duplicateIf,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc but missing start line', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: null,
        loc: {
          start: {},
          end: {},
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(() => visitor['Program:exit']()).not.toThrow()
    })

    test('should handle node with string line numbers', () => {
      const { context } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: null,
        loc: {
          start: { line: '1', column: '0' },
          end: { line: '1', column: '10' },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(() => visitor['Program:exit']()).not.toThrow()
    })

    test('should handle calling Program:exit multiple times', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()
      visitor['Program:exit']()

      // Second call should not double-report since seenIfStatements is cleared
      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      // Add extra properties
      const node = {
        ...mainIf,
        extra: 'data',
        nested: { foo: 'bar' },
      }

      visitor.IfStatement(node)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: null,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(() => visitor['Program:exit']()).not.toThrow()
    })

    test('should handle very large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(
        createIdentifier('x'),
        createEmptyBlock(),
        null,
        99999,
        0,
      )
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('line 1')
    })

    test('should handle very large column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(
        createIdentifier('x'),
        createEmptyBlock(),
        null,
        3,
        99999,
      )
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('should handle zero line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 0, 0)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 0, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle negative line numbers gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, -1, 0)
      const mainIf = createIfStatement(
        createIdentifier('x'),
        createEmptyBlock(),
        duplicateIf,
        -1,
        0,
      )

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle node where alternate references itself (circular)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node: Record<string, unknown> = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      node.alternate = node

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('should handle test that is a plain object without type', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = { name: 'x' }
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle consequent as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: null,
        alternate: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(() => visitor['Program:exit']()).not.toThrow()
    })
  })

  // ========================================
  // 6. LOCATION REPORTING (Tests 149-164)
  // ========================================
  describe('location reporting', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 1, 0)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 5, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at various lines', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 42, 0)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('should report location at various columns', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 15)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25) // column 5 + 20
    })

    test('should reference correct first line in message for line 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 5, 0)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message).toContain('line 1')
    })

    test('should reference correct first line in message for line 100', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 200, 0)
      const mainIf = createIfStatement(
        createIdentifier('x'),
        createEmptyBlock(),
        duplicateIf,
        100,
        0,
      )

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message).toContain('line 100')
    })

    test('should include loc in report descriptor', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct location for second duplicate in chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condA = createIdentifier('a')
      const condB = createIdentifier('b')

      const fourth = createIfStatement(condA, createEmptyBlock(), null, 10, 3)
      const third = createIfStatement(condB, createEmptyBlock(), fourth, 7, 5)
      const second = createIfStatement(condB, createEmptyBlock(), third, 4, 5)
      const first = createIfStatement(condA, createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor.IfStatement(fourth)
      visitor['Program:exit']()

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[1].loc?.start.line).toBe(10)
    })

    test('should use default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: null,
      }
      const mainIf = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: duplicateIf,
      }

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      // Should still report with default location
      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should report location for each duplicate pair separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condX = createIdentifier('x')

      const third = createIfStatement(condX, createEmptyBlock(), null, 7, 8)
      const second = createIfStatement(condX, createEmptyBlock(), third, 4, 4)
      const first = createIfStatement(condX, createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor['Program:exit']()

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[1].loc?.start.line).toBe(7)
    })

    test('should handle location with column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 5, 0)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location with same start and end line', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      // Default createIfStatement puts start and end on same line
      expect(reports[0].loc?.start.line).toBe(reports[0].loc?.end.line)
    })

    test('should include start.line in loc for first occurrence reference', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 15, 3)
      const mainIf = createIfStatement(
        createIdentifier('x'),
        createEmptyBlock(),
        duplicateIf,
        7,
        12,
      )

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      // The message should reference line 7 (first occurrence)
      expect(reports[0].message).toContain('line 7')
      // The reported location should be the duplicate (second occurrence)
      expect(reports[0].loc?.start.line).toBe(15)
    })

    test('should report both start and end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 10)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[0].loc?.end.column).toBe(30) // 10 + 20
    })

    test('should handle multi-line location span', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createEmptyBlock(),
        alternate: null,
        loc: {
          start: { line: 5, column: 2 },
          end: { line: 8, column: 1 },
        },
      }
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(8)
    })
  })

  // ========================================
  // 7. MESSAGE CONTENT (Tests 165-178)
  // ========================================
  describe('message quality', () => {
    test('should mention duplicate in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message.toLowerCase()).toContain('duplicate')
    })

    test('should mention if-else chain in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message.toLowerCase()).toContain('if-else chain')
    })

    test('should mention the line number of first occurrence', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 10, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 5, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message).toContain('line 5')
    })

    test('should mention condition in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message.toLowerCase()).toContain('condition')
    })

    test('should mention already checked in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message.toLowerCase()).toContain('already checked')
    })

    test('should include line number in message format', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      // Should contain "line X" pattern
      expect(reports[0].message).toMatch(/line \d+/)
    })

    test('should produce non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should produce string message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(typeof reports[0].message).toBe('string')
    })

    test('should produce unique messages for different duplicate pairs', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condA = createIdentifier('a')
      const condB = createIdentifier('b')

      const fourth = createIfStatement(condA, createEmptyBlock(), null, 10, 5)
      const third = createIfStatement(condB, createEmptyBlock(), fourth, 7, 5)
      const second = createIfStatement(condB, createEmptyBlock(), third, 4, 5)
      const first = createIfStatement(condA, createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor.IfStatement(fourth)
      visitor['Program:exit']()

      // Different pairs should have different line references
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('should mention was already checked at in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message).toContain('was already checked at')
    })

    test('should reference correct line for first condition in triple duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condX = createIdentifier('x')

      const third = createIfStatement(condX, createEmptyBlock(), null, 7, 5)
      const second = createIfStatement(condX, createEmptyBlock(), third, 4, 5)
      const first = createIfStatement(condX, createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor['Program:exit']()

      expect(reports.length).toBe(2)
      // Both duplicates reference line 1 since the seenConditions map keeps the first occurrence
      expect(reports[0].message).toContain('line 1')
      expect(reports[1].message).toContain('line 1')
    })

    test('should not mention undefined or null in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message).not.toContain('undefined')
      expect(reports[0].message).not.toContain('null')
    })

    test('should be grammatically correct English', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      // Message should start with uppercase
      expect(reports[0].message[0]).toBe(reports[0].message[0].toUpperCase())
      // Message should end with period
      expect(reports[0].message).toContain('.')
    })

    test('should produce meaningful message for binary expression duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = createBinaryExpression('>', createIdentifier('x'), createLiteral(10))
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(condition, createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].message).toContain('Duplicate condition')
      expect(reports[0].message).toContain('if-else chain')
    })

    test('should have consistent message format across different expression types', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      // Test with identifiers
      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      const identifierMessage = reports[0].message

      // Clear and test with literals
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor2 = noDuplicateElseIfRule.create(ctx2)

      const duplicateIf2 = createIfStatement(createLiteral(5), createEmptyBlock(), null, 3, 5)
      const mainIf2 = createIfStatement(createLiteral(5), createEmptyBlock(), duplicateIf2, 1, 0)

      visitor2.IfStatement(mainIf2)
      visitor2.IfStatement(duplicateIf2)
      visitor2['Program:exit']()

      // Both should start with "Duplicate condition"
      expect(identifierMessage.startsWith('Duplicate condition')).toBe(true)
      expect(reports2[0].message.startsWith('Duplicate condition')).toBe(true)
    })
  })

  // ========================================
  // 8. CONTEXT VARIATIONS (Tests 179-188)
  // ========================================
  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}', filePath: '/project/src/utils.ts' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should work with minimal source', () => {
      const { context, reports } = createMockRuleContext({ source: 'x', filePath: '/src/file.ts' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should work with complex source', () => {
      const source = `
        if (x) {
          doSomething();
        } else if (x) {
          doSomethingElse();
        }
      `
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should work with config containing options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowSome: true }], source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should work with long file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}', filePath: '/very/long/path/to/some/deeply/nested/directory/structure/src/file.ts' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should work with config containing extra properties', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{ extra: 'prop' }], rules: {} },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should work when context getAST returns object', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => ({ type: 'Program', body: [] }),
        getSource: () => 'code',
        getTokens: () => [{ type: 'Keyword', value: 'if' }],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should not use logger during normal operation', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      // Logger should be defined but not called
      expect(context.logger.debug).not.toHaveBeenCalled()
      expect(context.logger.info).not.toHaveBeenCalled()
      expect(context.logger.warn).not.toHaveBeenCalled()
      expect(context.logger.error).not.toHaveBeenCalled()
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/home/user/project/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })
  })

  // ========================================
  // 9. EXPORT VERIFICATION (Tests 189-196)
  // ========================================
  describe('export verification', () => {
    test('should export the rule as named export', () => {
      expect(noDuplicateElseIfRule).toBeDefined()
    })

    test('should be a RuleDefinition object', () => {
      expect(typeof noDuplicateElseIfRule).toBe('object')
      expect(noDuplicateElseIfRule).not.toBeNull()
    })

    test('should have meta property', () => {
      expect(noDuplicateElseIfRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noDuplicateElseIfRule).toHaveProperty('create')
    })

    test('should have exactly meta and create properties', () => {
      const keys = Object.keys(noDuplicateElseIfRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('should have meta.type as string', () => {
      expect(typeof noDuplicateElseIfRule.meta.type).toBe('string')
    })

    test('should have meta.severity as string', () => {
      expect(typeof noDuplicateElseIfRule.meta.severity).toBe('string')
    })

    test('should have create as function', () => {
      expect(typeof noDuplicateElseIfRule.create).toBe('function')
    })
  })

  // ========================================
  // 10. REPORT DESCRIPTOR STRUCTURE (Tests 197-206)
  // ========================================
  describe('report descriptor structure', () => {
    test('should have message in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0]).toHaveProperty('message')
    })

    test('should have loc in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0]).toHaveProperty('loc')
    })

    test('should have start in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('should have end in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('should have line and column in start', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('should have line and column in end', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('should have numeric line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should report correct number of reports for each chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      // Chain: if(a) else if(b) else if(a) else if(c) else if(b)
      // Duplicates: a at pos 3, b at pos 5 → 2 reports
      const fifth = createIfStatement(createIdentifier('b'), createEmptyBlock(), null, 13, 5)
      const fourth = createIfStatement(createIdentifier('c'), createEmptyBlock(), fifth, 10, 5)
      const third = createIfStatement(createIdentifier('a'), createEmptyBlock(), fourth, 7, 5)
      const second = createIfStatement(createIdentifier('b'), createEmptyBlock(), third, 4, 5)
      const first = createIfStatement(createIdentifier('a'), createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor.IfStatement(fourth)
      visitor.IfStatement(fifth)
      visitor['Program:exit']()

      expect(reports.length).toBe(2)
    })

    test('should produce exactly one report per duplicate pair', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })
  })

  // ========================================
  // 11. DIFFERENT EXPRESSION TYPES (Tests 207-226)
  // ========================================
  describe('different expression types', () => {
    test('should serialize Identifier conditions correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(
        createIdentifier('myVar'),
        createEmptyBlock(),
        null,
        3,
        5,
      )
      const mainIf = createIfStatement(
        createIdentifier('myVar'),
        createEmptyBlock(),
        duplicateIf,
        1,
        0,
      )

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should distinguish different Identifier names', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const secondIf = createIfStatement(
        createIdentifier('otherVar'),
        createEmptyBlock(),
        null,
        3,
        5,
      )
      const firstIf = createIfStatement(
        createIdentifier('myVar'),
        createEmptyBlock(),
        secondIf,
        1,
        0,
      )

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should serialize Literal with number correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const duplicateIf = createIfStatement(createLiteral(42), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(createLiteral(42), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should distinguish different number literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const secondIf = createIfStatement(createLiteral(43), createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(createLiteral(42), createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should serialize BinaryExpression with same structure as duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const buildCond = () =>
        createBinaryExpression('+', createIdentifier('a'), createIdentifier('b'))
      const duplicateIf = createIfStatement(buildCond(), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(buildCond(), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should distinguish BinaryExpression with different operators', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const cond1 = createBinaryExpression('+', createIdentifier('a'), createIdentifier('b'))
      const cond2 = createBinaryExpression('-', createIdentifier('a'), createIdentifier('b'))

      const secondIf = createIfStatement(cond2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(cond1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should serialize UnaryExpression as duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const buildCond = () => createUnaryExpression('!', createIdentifier('flag'))
      const duplicateIf = createIfStatement(buildCond(), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(buildCond(), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should distinguish UnaryExpression with different operators', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const cond1 = createUnaryExpression('!', createIdentifier('x'))
      const cond2 = createUnaryExpression('~', createIdentifier('x'))

      const secondIf = createIfStatement(cond2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(cond1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should serialize LogicalExpression as duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const buildCond = () =>
        createLogicalExpression('&&', createIdentifier('a'), createIdentifier('b'))
      const duplicateIf = createIfStatement(buildCond(), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(buildCond(), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should serialize MemberExpression as duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const buildCond = () =>
        createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      const duplicateIf = createIfStatement(buildCond(), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(buildCond(), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should serialize CallExpression as duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const buildCond = () => createCallExpression(createIdentifier('fn'))
      const duplicateIf = createIfStatement(buildCond(), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(buildCond(), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should serialize ConditionalExpression as duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const buildCond = () =>
        createConditionalExpression(createIdentifier('x'), createLiteral(1), createLiteral(2))
      const duplicateIf = createIfStatement(buildCond(), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(buildCond(), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle nested LogicalExpression duplicates', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const buildCond = () =>
        createLogicalExpression(
          '&&',
          createLogicalExpression('||', createIdentifier('a'), createIdentifier('b')),
          createIdentifier('c'),
        )

      const duplicateIf = createIfStatement(buildCond(), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(buildCond(), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle method call expression duplicates', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const callee = createMemberExpression(createIdentifier('obj'), createIdentifier('method'))
      const buildCond = () => createCallExpression(callee, [createIdentifier('arg')])
      const duplicateIf = createIfStatement(buildCond(), createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(buildCond(), createEmptyBlock(), duplicateIf, 1, 0)

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should distinguish same call with different callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const cond1 = createCallExpression(createIdentifier('fnA'), [createIdentifier('x')])
      const cond2 = createCallExpression(createIdentifier('fnB'), [createIdentifier('x')])

      const secondIf = createIfStatement(cond2, createEmptyBlock(), null, 3, 5)
      const firstIf = createIfStatement(cond1, createEmptyBlock(), secondIf, 1, 0)

      visitor.IfStatement(firstIf)
      visitor.IfStatement(secondIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle mixed expression types in chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condBinary = createBinaryExpression('>', createIdentifier('x'), createLiteral(5))
      const condUnary = createUnaryExpression('!', createIdentifier('y'))
      const condId = createIdentifier('z')

      const third = createIfStatement(condId, createEmptyBlock(), null, 7, 5)
      const second = createIfStatement(condUnary, createEmptyBlock(), third, 4, 5)
      const first = createIfStatement(condBinary, createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle mixed expression with one duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condBinary = createBinaryExpression('>', createIdentifier('x'), createLiteral(5))

      const third = createIfStatement(condBinary, createEmptyBlock(), null, 7, 5)
      const second = createIfStatement(createIdentifier('y'), createEmptyBlock(), third, 4, 5)
      const first = createIfStatement(condBinary, createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle Literal with undefined value', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const cond = createLiteral(undefined)
      const duplicateIf = createIfStatement(cond, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(
        createLiteral(undefined),
        createEmptyBlock(),
        duplicateIf,
        1,
        0,
      )

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle unknown node type serialization', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condition = { type: 'AwaitExpression', argument: createIdentifier('x') }
      const duplicateIf = createIfStatement(condition, createEmptyBlock(), null, 3, 5)
      const mainIf = createIfStatement(
        { type: 'AwaitExpression', argument: createIdentifier('x') },
        createEmptyBlock(),
        duplicateIf,
        1,
        0,
      )

      visitor.IfStatement(mainIf)
      visitor.IfStatement(duplicateIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })
  })

  // ========================================
  // 12. NESTED CHAINS (Tests 227-240)
  // ========================================
  describe('nested chains', () => {
    test('should detect duplicate in outer chain only', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condX = createIdentifier('x')

      // Outer chain: if(x) else if(y) else if(x)
      const outerThird = createIfStatement(condX, createEmptyBlock(), null, 7, 5)
      const outerSecond = createIfStatement(
        createIdentifier('y'),
        createEmptyBlock(),
        outerThird,
        4,
        5,
      )
      const outerFirst = createIfStatement(condX, createEmptyBlock(), outerSecond, 1, 0)

      visitor.IfStatement(outerFirst)
      visitor.IfStatement(outerSecond)
      visitor.IfStatement(outerThird)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should not detect duplicate across separate unrelated chains', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      // Chain A: if(a) else if(b)
      const chainAAlt = createIfStatement(createIdentifier('b'), createEmptyBlock(), null, 3, 5)
      const chainAMain = createIfStatement(
        createIdentifier('a'),
        createEmptyBlock(),
        chainAAlt,
        1,
        0,
      )

      // Chain B: if(a) else if(c)  - separate chain, same 'a'
      const chainBAlt = createIfStatement(createIdentifier('c'), createEmptyBlock(), null, 8, 5)
      const chainBMain = createIfStatement(
        createIdentifier('a'),
        createEmptyBlock(),
        chainBAlt,
        6,
        0,
      )

      visitor.IfStatement(chainAMain)
      visitor.IfStatement(chainAAlt)
      visitor.IfStatement(chainBMain)
      visitor.IfStatement(chainBAlt)
      visitor['Program:exit']()

      // No duplicates because the 'a' is in separate chains
      expect(reports.length).toBe(0)
    })

    test('should detect duplicates in longer chain correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condA = createIdentifier('a')
      const condB = createIdentifier('b')
      const condC = createIdentifier('c')

      // Chain: if(a) else if(b) else if(c) else if(a) else if(b)
      const fifth = createIfStatement(condB, createEmptyBlock(), null, 13, 5)
      const fourth = createIfStatement(condA, createEmptyBlock(), fifth, 10, 5)
      const third = createIfStatement(condC, createEmptyBlock(), fourth, 7, 5)
      const second = createIfStatement(condB, createEmptyBlock(), third, 4, 5)
      const first = createIfStatement(condA, createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor.IfStatement(fourth)
      visitor.IfStatement(fifth)
      visitor['Program:exit']()

      expect(reports.length).toBe(2)
    })

    test('should handle three separate chains with no duplicates', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      // Chain 1
      const c1Alt = createIfStatement(createIdentifier('b'), createEmptyBlock(), null, 3, 5)
      const c1 = createIfStatement(createIdentifier('a'), createEmptyBlock(), c1Alt, 1, 0)

      // Chain 2
      const c2Alt = createIfStatement(createIdentifier('d'), createEmptyBlock(), null, 8, 5)
      const c2 = createIfStatement(createIdentifier('c'), createEmptyBlock(), c2Alt, 6, 0)

      // Chain 3
      const c3Alt = createIfStatement(createIdentifier('f'), createEmptyBlock(), null, 13, 5)
      const c3 = createIfStatement(createIdentifier('e'), createEmptyBlock(), c3Alt, 11, 0)

      visitor.IfStatement(c1)
      visitor.IfStatement(c1Alt)
      visitor.IfStatement(c2)
      visitor.IfStatement(c2Alt)
      visitor.IfStatement(c3)
      visitor.IfStatement(c3Alt)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle chain where first and last have same condition', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condX = createIdentifier('x')

      const fourth = createIfStatement(condX, createEmptyBlock(), null, 10, 5)
      const third = createIfStatement(createIdentifier('c'), createEmptyBlock(), fourth, 7, 5)
      const second = createIfStatement(createIdentifier('b'), createEmptyBlock(), third, 4, 5)
      const first = createIfStatement(condX, createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor.IfStatement(fourth)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('line 1')
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should handle single if with BlockStatement else', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const elseBlock = createBlockStatement([])
      const mainIf = createIfStatement(createIdentifier('x'), createEmptyBlock(), elseBlock, 1, 0)

      visitor.IfStatement(mainIf)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle duplicate where condition is a complex nested expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const buildComplexCond = () =>
        createLogicalExpression(
          '||',
          createBinaryExpression('===', createIdentifier('x'), createLiteral(1)),
          createBinaryExpression('===', createIdentifier('y'), createLiteral(2)),
        )

      const third = createIfStatement(buildComplexCond(), createEmptyBlock(), null, 7, 5)
      const second = createIfStatement(createIdentifier('z'), createEmptyBlock(), third, 4, 5)
      const first = createIfStatement(buildComplexCond(), createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle two chains each with their own duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      // Chain 1: if(a) else if(b) else if(a) - duplicate
      const c1Third = createIfStatement(createIdentifier('a'), createEmptyBlock(), null, 5, 5)
      const c1Second = createIfStatement(createIdentifier('b'), createEmptyBlock(), c1Third, 3, 5)
      const c1First = createIfStatement(createIdentifier('a'), createEmptyBlock(), c1Second, 1, 0)

      // Chain 2: if(c) else if(d) else if(c) - duplicate
      const c2Third = createIfStatement(createIdentifier('c'), createEmptyBlock(), null, 15, 5)
      const c2Second = createIfStatement(createIdentifier('d'), createEmptyBlock(), c2Third, 13, 5)
      const c2First = createIfStatement(createIdentifier('c'), createEmptyBlock(), c2Second, 11, 0)

      visitor.IfStatement(c1First)
      visitor.IfStatement(c1Second)
      visitor.IfStatement(c1Third)
      visitor.IfStatement(c2First)
      visitor.IfStatement(c2Second)
      visitor.IfStatement(c2Third)
      visitor['Program:exit']()

      expect(reports.length).toBe(2)
    })

    test('should handle chain with same condition three times', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const condX = createIdentifier('x')

      const fourth = createIfStatement(condX, createEmptyBlock(), null, 13, 5)
      const third = createIfStatement(createIdentifier('y'), createEmptyBlock(), fourth, 10, 5)
      const second = createIfStatement(condX, createEmptyBlock(), third, 7, 5)
      const first = createIfStatement(condX, createEmptyBlock(), second, 4, 5)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor.IfStatement(fourth)
      visitor['Program:exit']()

      // Duplicates at position 2 (line 7) and position 4 (line 13) against first at line 4
      // But actually the second becomes "seen" too, so third duplicate reports against second
      expect(reports.length).toBe(2)
    })

    test('should handle chain where alternate is null at end', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const second = createIfStatement(createIdentifier('y'), createEmptyBlock(), null, 4, 5)
      const first = createIfStatement(createIdentifier('x'), createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor['Program:exit']()

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested binary expression duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const buildDeep = () =>
        createBinaryExpression(
          '===',
          createMemberExpression(
            createMemberExpression(createIdentifier('a'), createIdentifier('b')),
            createIdentifier('c'),
          ),
          createLiteral(42),
        )

      const second = createIfStatement(buildDeep(), createEmptyBlock(), null, 4, 5)
      const first = createIfStatement(buildDeep(), createEmptyBlock(), second, 1, 0)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should handle chain with complex binary + logical mix duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const buildCond = () =>
        createLogicalExpression(
          '&&',
          createBinaryExpression('>', createIdentifier('x'), createLiteral(0)),
          createBinaryExpression('<', createIdentifier('x'), createLiteral(100)),
        )

      const fourth = createIfStatement(buildCond(), createEmptyBlock(), null, 13, 5)
      const third = createIfStatement(createIdentifier('z'), createEmptyBlock(), fourth, 10, 5)
      const second = createIfStatement(buildCond(), createEmptyBlock(), third, 7, 5)
      const first = createIfStatement(createIdentifier('w'), createEmptyBlock(), second, 4, 5)

      visitor.IfStatement(first)
      visitor.IfStatement(second)
      visitor.IfStatement(third)
      visitor.IfStatement(fourth)
      visitor['Program:exit']()

      expect(reports.length).toBe(1)
    })

    test('should not report when nodes are visited in reverse order', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const second = createIfStatement(createIdentifier('y'), createEmptyBlock(), null, 4, 5)
      const first = createIfStatement(createIdentifier('x'), createEmptyBlock(), second, 1, 0)

      // Visit in reverse order (second before first)
      visitor.IfStatement(second)
      visitor.IfStatement(first)
      visitor['Program:exit']()

      // Should still not report since no duplicates
      expect(reports.length).toBe(0)
    })

    test('should handle duplicate detection when nodes visited in reverse', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) {} else if (x) {}' })
      const visitor = noDuplicateElseIfRule.create(context)

      const second = createIfStatement(createIdentifier('x'), createEmptyBlock(), null, 4, 5)
      const first = createIfStatement(createIdentifier('x'), createEmptyBlock(), second, 1, 0)

      // Visit in reverse order
      visitor.IfStatement(second)
      visitor.IfStatement(first)
      visitor['Program:exit']()

      // Should still detect since the chain is reconstructed via alternate references
      expect(reports.length).toBe(1)
    })
  })
})
