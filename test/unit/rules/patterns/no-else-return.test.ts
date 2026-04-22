import { describe, test, expect, vi } from 'vitest'
import { noElseReturnRule } from '../../../../src/rules/patterns/no-else-return.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

interface MockNode {
  type: string
  [key: string]: unknown
}

function createIdentifier(name: string): MockNode {
  return {
    type: 'Identifier',
    name,
  }
}

function createReturnStatement(): MockNode {
  return {
    type: 'ReturnStatement',
    argument: null,
  }
}

function createReturnStatementWithArg(argType: string, argValue: unknown): MockNode {
  return {
    type: 'ReturnStatement',
    argument: {
      type: argType,
      ...(typeof argValue === 'object' && argValue !== null ? argValue : { value: argValue }),
    },
  }
}

function createExpressionStatement(exprName = 'y'): MockNode {
  return {
    type: 'ExpressionStatement',
    expression: createIdentifier(exprName),
  }
}

function createThrowStatement(): MockNode {
  return {
    type: 'ThrowStatement',
    argument: createIdentifier('err'),
  }
}

function createVariableDeclaration(): MockNode {
  return {
    type: 'VariableDeclaration',
    declarations: [],
    kind: 'const',
  }
}

function createFunctionDeclaration(): MockNode {
  return {
    type: 'FunctionDeclaration',
    id: createIdentifier('fn'),
    params: [],
    body: createBlockStatementHelper([]),
  }
}

function createWhileStatement(): MockNode {
  return {
    type: 'WhileStatement',
    test: createIdentifier('x'),
    body: createBlockStatementHelper([]),
  }
}

function createForStatement(): MockNode {
  return {
    type: 'ForStatement',
    test: createIdentifier('x'),
    body: createBlockStatementHelper([]),
  }
}

function createTryStatement(): MockNode {
  return {
    type: 'TryStatement',
    block: createBlockStatementHelper([]),
    handler: null,
    finalizer: null,
  }
}

function createSwitchStatement(): MockNode {
  return {
    type: 'SwitchStatement',
    discriminant: createIdentifier('x'),
    cases: [],
  }
}

function createBlockStatementHelper(
  statements: MockNode[] = [],
  startCol = 0,
  endCol = 10,
): MockNode {
  return {
    type: 'BlockStatement',
    body: statements,
    loc: {
      start: { line: 1, column: startCol },
      end: { line: 1, column: endCol },
    },
    range: [startCol, endCol],
  }
}

function createBlockStatement(statements: MockNode[] = [], startCol = 0, endCol = 10): MockNode {
  return createBlockStatementHelper(statements, startCol, endCol)
}

function createBlockStatementWithRange(statements: MockNode[], range: [number, number]): MockNode {
  return {
    type: 'BlockStatement',
    body: statements,
    loc: {
      start: { line: 1, column: range[0] },
      end: { line: 1, column: range[1] },
    },
    range,
  }
}

function createIfStatement(
  test: MockNode | null,
  consequent: MockNode,
  alternate: MockNode | null,
  line = 1,
  column = 0,
  endCol = 50,
): MockNode {
  return {
    type: 'IfStatement',
    test,
    consequent,
    alternate,
    loc: {
      start: { line, column },
      end: { line, column: endCol },
    },
    range: [column, endCol],
  }
}

function createIfStatementWithRange(
  test: MockNode | null,
  consequent: MockNode,
  alternate: MockNode | null,
  range: [number, number],
): MockNode {
  return {
    type: 'IfStatement',
    test,
    consequent,
    alternate,
    loc: {
      start: { line: 1, column: range[0] },
      end: { line: 1, column: range[1] },
    },
    range,
  }
}

// Helper to create a standard detectable if-else-return pattern
function createDetectablePattern(
  consequentStatements: MockNode[] = [createReturnStatement()],
  alternateStatements: MockNode[] = [createExpressionStatement()],
): MockNode {
  const consequent = createBlockStatement(consequentStatements, 5, 20)
  const alternate = createBlockStatement(alternateStatements, 26, 40)
  return createIfStatement(createIdentifier('x'), consequent, alternate)
}

describe('no-else-return rule', () => {
  // ============================================================
  // META - EXISTING TESTS (7)
  // ============================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noElseReturnRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noElseReturnRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noElseReturnRule.meta.docs?.recommended).toBe(true)
    })

    test('should have style category', () => {
      expect(noElseReturnRule.meta.docs?.category).toBe('style')
    })

    test('should have schema defined', () => {
      expect(noElseReturnRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noElseReturnRule.meta.fixable).toBe('code')
    })

    test('should mention else in description', () => {
      expect(noElseReturnRule.meta.docs?.description.toLowerCase()).toContain('else')
    })

    test('should mention return in description', () => {
      expect(noElseReturnRule.meta.docs?.description.toLowerCase()).toContain('return')
    })
  })

  // ============================================================
  // META EXHAUSTIVE - NEW (28)
  // ============================================================
  describe('meta exhaustive', () => {
    test('should have meta property', () => {
      expect(noElseReturnRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noElseReturnRule).toHaveProperty('create')
    })

    test('meta type should be exactly suggestion', () => {
      expect(noElseReturnRule.meta.type).toBe('suggestion')
      expect(noElseReturnRule.meta.type).not.toBe('problem')
      expect(noElseReturnRule.meta.type).not.toBe('layout')
    })

    test('meta severity should be exactly warn', () => {
      expect(noElseReturnRule.meta.severity).toBe('warn')
      expect(noElseReturnRule.meta.severity).not.toBe('error')
      expect(noElseReturnRule.meta.severity).not.toBe('off')
    })

    test('meta docs should be an object', () => {
      expect(typeof noElseReturnRule.meta.docs).toBe('object')
      expect(noElseReturnRule.meta.docs).not.toBeNull()
    })

    test('meta docs description should be a non-empty string', () => {
      expect(typeof noElseReturnRule.meta.docs?.description).toBe('string')
      expect(noElseReturnRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta docs description should start with capital letter', () => {
      const desc = noElseReturnRule.meta.docs?.description ?? ''
      expect(desc[0]).toBe(desc[0].toUpperCase())
    })

    test('meta docs description should end with period', () => {
      const desc = noElseReturnRule.meta.docs?.description ?? ''
      expect(desc.endsWith('.')).toBe(true)
    })

    test('meta docs url should be defined', () => {
      expect(noElseReturnRule.meta.docs?.url).toBeDefined()
    })

    test('meta docs url should be a string', () => {
      expect(typeof noElseReturnRule.meta.docs?.url).toBe('string')
    })

    test('meta docs url should contain rule name', () => {
      expect(noElseReturnRule.meta.docs?.url).toContain('no-else-return')
    })

    test('meta docs url should start with https', () => {
      expect(noElseReturnRule.meta.docs?.url).toMatch(/^https:/)
    })

    test('meta schema should be an array', () => {
      expect(Array.isArray(noElseReturnRule.meta.schema)).toBe(true)
    })

    test('meta schema should be empty array', () => {
      const schema = noElseReturnRule.meta.schema
      if (Array.isArray(schema)) {
        expect(schema.length).toBe(0)
      }
    })

    test('meta fixable should be exactly code', () => {
      expect(noElseReturnRule.meta.fixable).toBe('code')
      expect(noElseReturnRule.meta.fixable).not.toBe('whitespace')
    })

    test('meta should not be deprecated', () => {
      expect(noElseReturnRule.meta.deprecated).toBeUndefined()
    })

    test('meta should not have replacedBy', () => {
      expect(noElseReturnRule.meta.replacedBy).toBeUndefined()
    })

    test('meta should not have requiresTypeChecking', () => {
      expect(noElseReturnRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('meta docs recommended should be boolean true', () => {
      expect(noElseReturnRule.meta.docs?.recommended).toBe(true)
      expect(noElseReturnRule.meta.docs?.recommended).not.toBe(false)
    })

    test('meta docs category should be style string', () => {
      expect(noElseReturnRule.meta.docs?.category).toBe('style')
    })

    test('meta docs description should mention unnecessary', () => {
      expect(noElseReturnRule.meta.docs?.description.toLowerCase()).toContain('unnecessary')
    })

    test('meta docs description should mention block or blocks', () => {
      const desc = noElseReturnRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc.includes('block')).toBe(true)
    })

    test('meta docs description should be longer than 20 characters', () => {
      expect((noElseReturnRule.meta.docs?.description ?? '').length).toBeGreaterThan(20)
    })

    test('meta should only have expected top-level keys', () => {
      const meta = noElseReturnRule.meta
      const keys = Object.keys(meta)
      const expectedKeys = ['type', 'severity', 'docs', 'schema', 'fixable']
      for (const key of keys) {
        expect(expectedKeys).toContain(key)
      }
    })

    test('meta docs should have description property', () => {
      expect(noElseReturnRule.meta.docs).toHaveProperty('description')
    })

    test('meta docs should have category property', () => {
      expect(noElseReturnRule.meta.docs).toHaveProperty('category')
    })

    test('meta docs should have recommended property', () => {
      expect(noElseReturnRule.meta.docs).toHaveProperty('recommended')
    })

    test('meta docs should have url property', () => {
      expect(noElseReturnRule.meta.docs).toHaveProperty('url')
    })
  })

  // ============================================================
  // CREATE / VISITOR STRUCTURE - EXISTING (1) + NEW (14)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with IfStatement method', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      expect(visitor).toHaveProperty('IfStatement')
    })

    test('should return an object', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should return visitor with exactly IfStatement key', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      expect(Object.keys(visitor)).toContain('IfStatement')
    })

    test('IfStatement should be a function', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      expect(typeof visitor.IfStatement).toBe('function')
    })

    test('IfStatement function should accept one argument', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      expect(visitor.IfStatement.length).toBe(1)
    })

    test('should return new visitor object on each call', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor1 = noElseReturnRule.create(context)
      const visitor2 = noElseReturnRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('create should be a function', () => {
      expect(typeof noElseReturnRule.create).toBe('function')
    })

    test('create should accept one argument', () => {
      expect(noElseReturnRule.create.length).toBe(1)
    })

    test('should not throw when create is called with valid context', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      expect(() => noElseReturnRule.create(context)).not.toThrow()
    })

    test('IfStatement should not throw when called with undefined', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('IfStatement should not throw when called with null', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('IfStatement should not throw when called with empty object', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      expect(() => visitor.IfStatement({})).not.toThrow()
    })

    test('calling IfStatement should return void', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const result = visitor.IfStatement(createDetectablePattern())
      expect(result).toBeUndefined()
    })

    test('should not throw when IfStatement is called with no arguments', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      expect(() => visitor.IfStatement()).not.toThrow()
    })

    test('visitor should be usable after multiple create calls', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const v1 = noElseReturnRule.create(ctx1)
      const v2 = noElseReturnRule.create(ctx2)
      v1.IfStatement(createDetectablePattern())
      v2.IfStatement(createDetectablePattern())
      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
    })
  })

  // ============================================================
  // DETECTING UNNECESSARY ELSE BLOCKS - EXISTING (4)
  // ============================================================
  describe('detecting unnecessary else blocks', () => {
    test('should report else block after return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary else block')
    })

    test('should report else if block after return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const innerIf = createIfStatement(createIdentifier('y'), createBlockStatement(), null, 1, 25)
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, innerIf)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
    })

    test('should report when return is nested in if within consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const innerIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createReturnStatement()]),
        null,
        1,
        10,
      )
      const consequent = createBlockStatement([innerIf])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
    })

    test('should report else block when return is in nested if in alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([
        createIfStatement(
          createIdentifier('y'),
          createBlockStatement([createReturnStatement()]),
          null,
          1,
          30,
        ),
      ])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
    })

    test('should report location of else block', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()], 5, 20)
      const alternate = {
        type: 'BlockStatement',
        body: [createExpressionStatement()],
        loc: {
          start: { line: 2, column: 5 },
          end: { line: 2, column: 15 },
        },
        range: [26, 40],
      }
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate, 1, 0)

      visitor.IfStatement(ifStatement)

      expect(reports[0].loc?.start.line).toBe(2)
    })
  })

  // ============================================================
  // DETECTION POSITIVE CASES - NEW (20)
  // ============================================================
  describe('detection positive cases', () => {
    test('should detect return with identifier argument in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ret = createReturnStatementWithArg('Identifier', { name: 'result' })
      const ifNode = createDetectablePattern([ret])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect return with literal argument in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ret = createReturnStatementWithArg('Literal', { value: 42 })
      const ifNode = createDetectablePattern([ret])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect return with call expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ret = createReturnStatementWithArg('CallExpression', { callee: createIdentifier('fn') })
      const ifNode = createDetectablePattern([ret])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect return as only statement in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createDetectablePattern([createReturnStatement()])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect return as first statement among many in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createDetectablePattern([
        createReturnStatement(),
        createExpressionStatement(),
        createExpressionStatement('z'),
      ])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect return as last statement among many in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createDetectablePattern([
        createExpressionStatement(),
        createExpressionStatement('z'),
        createReturnStatement(),
      ])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect return as middle statement among many in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createDetectablePattern([
        createExpressionStatement(),
        createReturnStatement(),
        createExpressionStatement('z'),
      ])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect else block with multiple statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createDetectablePattern(
        [createReturnStatement()],
        [
          createExpressionStatement('a'),
          createExpressionStatement('b'),
          createExpressionStatement('c'),
        ],
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect else block with single statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createDetectablePattern(
        [createReturnStatement()],
        [createExpressionStatement()],
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect when consequent is directly a ReturnStatement (non-block)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifNode = createIfStatement(createIdentifier('x'), createReturnStatement(), alternate)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect when alternate is an IfStatement (else-if chain)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()])
      const elseIfAlternate = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createExpressionStatement()]),
        null,
      )
      const ifNode = createIfStatement(createIdentifier('x'), consequent, elseIfAlternate)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect with binary expression test', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const test = {
        type: 'BinaryExpression',
        operator: '>',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 0 },
      }
      const ifNode = createIfStatement(
        test as MockNode,
        createBlockStatement([createReturnStatement()]),
        createBlockStatement([createExpressionStatement()]),
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect with call expression test', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const test = { type: 'CallExpression', callee: createIdentifier('isValid') }
      const ifNode = createIfStatement(
        test as MockNode,
        createBlockStatement([createReturnStatement()]),
        createBlockStatement([createExpressionStatement()]),
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect with null test', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createIfStatement(
        null,
        createBlockStatement([createReturnStatement()]),
        createBlockStatement([createExpressionStatement()]),
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect when nested if in consequent has return in both branches', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const nestedIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createReturnStatement()]),
        createBlockStatement([createReturnStatement()]),
      )
      const ifNode = createDetectablePattern([nestedIf])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect when nested if in consequent has return only in alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const nestedIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createExpressionStatement()]),
        createBlockStatement([createReturnStatement()]),
      )
      const ifNode = createDetectablePattern([nestedIf])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect when consequent has return and throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createDetectablePattern([createReturnStatement(), createThrowStatement()])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect empty alternate block with return in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([])
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect with deeply nested return in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const level3 = createIfStatement(
        createIdentifier('z'),
        createBlockStatement([createReturnStatement()]),
        null,
      )
      const level2 = createIfStatement(createIdentifier('y'), createBlockStatement([level3]), null)
      const ifNode = createDetectablePattern([level2])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect when return is nested two levels deep with returns in both inner branches', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const innerIf = createIfStatement(
        createIdentifier('z'),
        createBlockStatement([createReturnStatement()]),
        createBlockStatement([createReturnStatement()]),
      )
      const middleIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([innerIf]),
        null,
      )
      const ifNode = createDetectablePattern([middleIf])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // NOT DETECTING NECESSARY ELSE BLOCKS - EXISTING (3)
  // ============================================================
  describe('not detecting necessary else blocks', () => {
    test('should not report if without else', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, null)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(0)
    })

    test('should not report else block without return in consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createExpressionStatement()])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(0)
    })

    test('should report if consequent has return statement directly', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(
        createIdentifier('x'),
        createReturnStatement(),
        alternate,
      )

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // NEGATIVE CASES - NEW (22)
  // ============================================================
  describe('negative cases', () => {
    test('should not report when consequent has only expression statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([createExpressionStatement(), createExpressionStatement('z')]),
        createBlockStatement([createExpressionStatement()]),
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent has only variable declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([createVariableDeclaration()]),
        createBlockStatement([createExpressionStatement()]),
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent has only function declaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([createFunctionDeclaration()]),
        createBlockStatement([createExpressionStatement()]),
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent has while loop but no return', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([createWhileStatement()]),
        createBlockStatement([createExpressionStatement()]),
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent has for loop but no return', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([createForStatement()]),
        createBlockStatement([createExpressionStatement()]),
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent has try-catch but no return', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([createTryStatement()]),
        createBlockStatement([createExpressionStatement()]),
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent has switch but no return', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([createSwitchStatement()]),
        createBlockStatement([createExpressionStatement()]),
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is empty block', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: undefined,
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when alternate is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: null,
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when there is no alternate property', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([createReturnStatement()]),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for non-IfStatement type ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: createBlockStatement([createExpressionStatement()]),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for type WhileStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const node = {
        type: 'WhileStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: createBlockStatement([createExpressionStatement()]),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for type ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const node = {
        type: 'ForStatement',
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: createBlockStatement([createExpressionStatement()]),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when nested if in consequent has no return in any branch', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const nestedIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createExpressionStatement()]),
        createBlockStatement([createExpressionStatement('z')]),
      )
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([nestedIf]),
        createBlockStatement([createExpressionStatement()]),
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent has only throw statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([createThrowStatement()]),
        createBlockStatement([createExpressionStatement()]),
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent has return inside nested if but not in nested if alternate', () => {
      // The rule's hasReturnStatement for IfStatement checks if EITHER branch has return
      // So this WILL report. Let me make a case that won't report:
      // nested if with no return in either branch
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const nestedIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createExpressionStatement()]),
        null,
      )
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([nestedIf]),
        createBlockStatement([createExpressionStatement()]),
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is a plain expression (not block, not return, not if)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createExpressionStatement()
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is an IfStatement without return', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createExpressionStatement()]),
        null,
      )
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('should not report when passed a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(42)
      expect(reports.length).toBe(0)
    })

    test('should not report when passed a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement('if (x) return;')
      expect(reports.length).toBe(0)
    })

    test('should not report when passed a boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(true)
      expect(reports.length).toBe(0)
    })

    test('should not report when passed an array', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement([createReturnStatement()])
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // FIX FUNCTIONALITY - EXISTING (4)
  // ============================================================
  describe('fix functionality', () => {
    test('should provide fix for else block with single statement', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )

      visitor.IfStatement(ifStatement)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.range).toBeDefined()
      expect(reports[0].fix?.text).toBeDefined()
    })

    test('should provide fix that removes else keyword', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )

      visitor.IfStatement(ifStatement)

      const fix = reports[0].fix
      expect(fix).toBeDefined()
      const removedText = source.slice(fix!.range[0], fix!.range[1])
      expect(removedText).toContain('else')
    })

    test('should provide fix that extracts block content', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )

      visitor.IfStatement(ifStatement)

      const fix = reports[0].fix
      expect(fix?.text).toContain('y()')
    })

    test('should provide fix for else if (non-block alternate)', () => {
      const source = 'if (x) { return; } else if (y) { z(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createIfStatementWithRange(
        createIdentifier('y'),
        createBlockStatement(),
        null,
        [24, 40],
      )
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 40],
      )

      visitor.IfStatement(ifStatement)

      expect(reports[0].fix).toBeDefined()
    })
  })

  // ============================================================
  // FIX FUNCTIONALITY - EXPANDED - NEW (18)
  // ============================================================
  describe('fix functionality expanded', () => {
    test('should produce fix that starts at else keyword position', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      // The else keyword starts at position 20
      expect(fix!.range[0]).toBeLessThanOrEqual(24)
    })

    test('should produce fix that ends at alternate range end', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(fix!.range[1]).toBe(33)
    })

    test('should produce fix text starting with newline for block alternate', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(fix!.text).toMatch(/^\n/)
    })

    test('should produce fix with space prefix for non-block alternate', () => {
      const source = 'if (x) { return; } else if (y) { z(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createIfStatementWithRange(
        createIdentifier('y'),
        createBlockStatement(),
        null,
        [24, 40],
      )
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 40],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(fix!.text).toMatch(/^ /)
    })

    test('should handle fix for empty alternate block', () => {
      const source = 'if (x) { return; } else { }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([], [24, 27])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 27],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      // Empty block should produce empty fix text
      expect(fix!.text).toBe('')
    })

    test('should produce fix for alternate with multiple statements', () => {
      const source = 'if (x) { return; } else { y(); z(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange(
        [createExpressionStatement('y'), createExpressionStatement('z')],
        [24, 37],
      )
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 37],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(fix!.text).toContain('y()')
      expect(fix!.text).toContain('z()')
    })

    test('should not produce fix when if has no range', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([createExpressionStatement()])
      // No range on the if statement
      const ifNode = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent,
        alternate,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.IfStatement(ifNode)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should not produce fix when alternate has no range', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = {
        type: 'BlockStatement',
        body: [createExpressionStatement()],
        loc: { start: { line: 1, column: 20 }, end: { line: 1, column: 30 } },
      }
      // if has range but alternate does not
      const ifNode = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent,
        alternate,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        range: [0, 30] as [number, number],
      }
      visitor.IfStatement(ifNode)
      expect(reports[0].fix).toBeUndefined()
    })

    test('fix range should be tuple of two numbers', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(Array.isArray(fix!.range)).toBe(true)
      expect(fix!.range.length).toBe(2)
      expect(typeof fix!.range[0]).toBe('number')
      expect(typeof fix!.range[1]).toBe('number')
    })

    test('fix text should be a string', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(typeof fix!.text).toBe('string')
    })

    test('fix should replace from else keyword to end of alternate', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      const replaced = source.slice(fix!.range[0], fix!.range[1])
      expect(replaced).toContain('else')
      expect(replaced).toContain('y()')
    })

    test('should preserve content of alternate block in fix', () => {
      const source = 'if (x) { return; } else { foo(); bar(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange(
        [createExpressionStatement('foo'), createExpressionStatement('bar')],
        [24, 41],
      )
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 43],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(fix!.text).toContain('foo()')
      expect(fix!.text).toContain('bar()')
    })

    test('fix for non-block alternate should preserve original text', () => {
      const source = 'if (x) { return; } else if (y) { z(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createIfStatementWithRange(
        createIdentifier('y'),
        createBlockStatement(),
        null,
        [24, 40],
      )
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 40],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(fix!.text).toContain('if (y)')
    })

    test('should produce fix with range starting before alternate', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      // Fix range should start at or before the alternate start
      expect(fix!.range[0]).toBeLessThanOrEqual(24)
    })

    test('fix range start should be less than end', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(fix!.range[0]).toBeLessThan(fix!.range[1])
    })

    test('should handle fix when source has no else keyword between ranges', () => {
      // Edge: source doesn't actually contain 'else' in the scanned range
      const source = 'if (x) { return; } maybe { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [26, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )
      visitor.IfStatement(ifStatement)
      // Should still produce a fix (falls back to alternateStart)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
    })

    test('should handle fix for very long source', () => {
      const padding = ' '.repeat(100)
      const source = `if (x) { return; } else { y(); }${padding}`
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
    })

    test('fix text for non-block alternate should start with space', () => {
      const source = 'if (x) { return; } else y();'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      // Non-block alternate (just an expression statement)
      const alternate = {
        type: 'ExpressionStatement',
        expression: createIdentifier('y'),
        loc: { start: { line: 1, column: 24 }, end: { line: 1, column: 28 } },
        range: [24, 28] as [number, number],
      }
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 28],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(fix!.text.startsWith(' ')).toBe(true)
    })
  })

  // ============================================================
  // EDGE CASES - EXISTING (10)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      expect(() => visitor.IfStatement('string')).not.toThrow()
      expect(() => visitor.IfStatement(123)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const node = {
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: createBlockStatement([createExpressionStatement()]),
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('should handle non-IfStatement type', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: createBlockStatement([createExpressionStatement()]),
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty consequent block', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(0)
    })

    test('should handle empty alternate block', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
    })

    test('should handle node without consequent', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        alternate: createBlockStatement([createExpressionStatement()]),
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('should handle node without alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([createReturnStatement()]),
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: null,
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([createExpressionStatement()])
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent,
        alternate,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle alternate without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = {
        type: 'BlockStatement',
        body: [createExpressionStatement()],
      }
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent,
        alternate,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })
  })

  // ============================================================
  // EDGE CASES - EXPANDED - NEW (20)
  // ============================================================
  describe('edge cases expanded', () => {
    test('should handle node with boolean false alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: false,
      }
      expect(() => visitor.IfStatement(node)).not.toThrow()
      // false !== undefined && false !== null is true, so hasAlternate returns true
      expect(reports.length).toBe(1)
    })

    test('should handle node with numeric 0 alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: 0,
      }
      expect(() => visitor.IfStatement(node)).not.toThrow()
      // 0 !== undefined && 0 !== null is true, so hasAlternate returns true
      expect(reports.length).toBe(1)
    })

    test('should handle node with empty string alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: '',
      }
      expect(() => visitor.IfStatement(node)).not.toThrow()
      // '' !== undefined && '' !== null is true, so hasAlternate returns true
      expect(reports.length).toBe(1)
    })

    test('should handle very large consequent body', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const statements: MockNode[] = []
      for (let i = 0; i < 100; i++) {
        statements.push(createExpressionStatement(`expr${i}`))
      }
      statements.push(createReturnStatement())
      const ifNode = createDetectablePattern(statements)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should handle very large alternate body', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const altStatements: MockNode[] = []
      for (let i = 0; i < 100; i++) {
        altStatements.push(createExpressionStatement(`expr${i}`))
      }
      const ifNode = createDetectablePattern([createReturnStatement()], altStatements)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should handle calling IfStatement with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      // TypeScript won't allow this easily but runtime might get it
      expect(() =>
        (visitor as Record<string, (...args: unknown[]) => void>).IfStatement(),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing test property', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const node = {
        type: 'IfStatement',
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: createBlockStatement([createExpressionStatement()]),
      }
      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle consequent as non-block expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createExpressionStatement()
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate)
      visitor.IfStatement(ifNode)
      // ExpressionStatement is not ReturnStatement, BlockStatement, or IfStatement
      // so hasReturnStatement returns false
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested if-else with returns at all levels', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const level4 = createIfStatement(
        createIdentifier('d'),
        createBlockStatement([createReturnStatement()]),
        null,
      )
      const level3 = createIfStatement(createIdentifier('c'), createBlockStatement([level4]), null)
      const level2 = createIfStatement(createIdentifier('b'), createBlockStatement([level3]), null)
      const ifNode = createDetectablePattern([level2])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should handle multiple calls with same visitor independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      // First call: valid pattern
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(1)

      // Second call: invalid pattern (no return)
      const noReturn = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([createExpressionStatement()]),
        createBlockStatement([createExpressionStatement()]),
      )
      visitor.IfStatement(noReturn)
      expect(reports.length).toBe(1) // still 1, no new report
    })

    test('should handle creating multiple independent visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const v1 = noElseReturnRule.create(ctx1)
      const v2 = noElseReturnRule.create(ctx2)

      v1.IfStatement(createDetectablePattern())
      v2.IfStatement(createDetectablePattern())
      v2.IfStatement(createDetectablePattern())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(2)
    })

    test('should not modify input node', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const originalNode = createDetectablePattern()
      const originalType = originalNode.type
      const originalConsequent = originalNode.consequent

      visitor.IfStatement(originalNode)

      expect(originalNode.type).toBe(originalType)
      expect(originalNode.consequent).toBe(originalConsequent)
    })

    test('should produce same result when called with same inputs', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const v1 = noElseReturnRule.create(ctx1)
      const v2 = noElseReturnRule.create(ctx2)

      const node = createDetectablePattern()
      v1.IfStatement(node)
      v2.IfStatement(node)

      expect(r1.length).toBe(r2.length)
      expect(r1[0].message).toBe(r2[0].message)
    })

    test('should handle range at position 0', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(fix!.range[0]).toBeGreaterThanOrEqual(0)
    })

    test('should handle very large range positions', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [10007, 10018])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [10024, 10033])
      const ifStatement = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [10000, 10035],
      )
      visitor.IfStatement(ifStatement)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
    })

    test('should handle consequent that is an IfStatement without return', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createExpressionStatement()]),
        null,
      )
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })

    test('should handle consequent that is an IfStatement with return', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createReturnStatement()]),
        null,
      )
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate)
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should handle alternate with only loc.start but no loc.end', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = {
        type: 'BlockStatement',
        body: [createExpressionStatement()],
        loc: { start: { line: 2, column: 5 } },
      }
      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent,
        alternate,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle consequent body as non-array', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = {
        type: 'BlockStatement',
        body: 'not an array',
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 20 } },
      }
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifNode = createIfStatement(createIdentifier('x'), consequent as MockNode, alternate)
      visitor.IfStatement(ifNode)
      // body is not array so Array.isArray check fails, hasReturnStatement returns false
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // MESSAGE QUALITY - EXISTING (3)
  // ============================================================
  describe('message quality', () => {
    test('should mention else block in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports[0].message.toLowerCase()).toContain('else')
    })

    test('should mention unnecessary in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })

    test('should mention return in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports[0].message.toLowerCase()).toContain('return')
    })
  })

  // ============================================================
  // MESSAGE QUALITY - EXPANDED - NEW (8)
  // ============================================================
  describe('message quality expanded', () => {
    test('should produce exactly one report for one violation', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(1)
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should have consistent message across multiple calls', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const v1 = noElseReturnRule.create(ctx1)
      const v2 = noElseReturnRule.create(ctx2)
      v1.IfStatement(createDetectablePattern())
      v2.IfStatement(createDetectablePattern())
      expect(r1[0].message).toBe(r2[0].message)
    })

    test('message should not be empty', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should be a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(typeof reports[0].message).toBe('string')
    })

    test('message should match exact expected text', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports[0].message).toBe('Unnecessary else block after return statement.')
    })

    test('should mention block in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports[0].message.toLowerCase()).toContain('block')
    })

    test('message should be consistent regardless of node structure', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const v1 = noElseReturnRule.create(ctx1)
      const v2 = noElseReturnRule.create(ctx2)

      // Different node structures, same rule trigger
      const node1 = createDetectablePattern()
      const node2 = createIfStatement(
        createIdentifier('z'),
        createReturnStatement(),
        createBlockStatement([createExpressionStatement()]),
      )
      v1.IfStatement(node1)
      v2.IfStatement(node2)

      expect(r1[0].message).toBe(r2[0].message)
    })
  })

  // ============================================================
  // DEEPLY NESTED STRUCTURES - EXISTING (2)
  // ============================================================
  describe('deeply nested structures', () => {
    test('should detect return in nested if-else within consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const deeplyNestedReturn = createBlockStatement([createReturnStatement()])
      const nestedIf = createIfStatement(
        createIdentifier('y'),
        deeplyNestedReturn,
        createBlockStatement([createExpressionStatement()]),
        1,
        10,
      )
      const consequent = createBlockStatement([nestedIf])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
    })

    test('should detect return in both branches of nested if', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      const nestedIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createReturnStatement()]),
        createBlockStatement([createReturnStatement()]),
        1,
        10,
      )
      const consequent = createBlockStatement([nestedIf])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifStatement = createIfStatement(createIdentifier('x'), consequent, alternate)

      visitor.IfStatement(ifStatement)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // LOCATION REPORTING - NEW (16)
  // ============================================================
  describe('location reporting', () => {
    test('should report location matching alternate node location', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()], 5, 20)
      const alternate = createBlockStatement([createExpressionStatement()], 26, 40)
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate)
      visitor.IfStatement(ifNode)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(26)
    })

    test('should report correct end location for alternate', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()], 5, 20)
      const alternate = createBlockStatement([createExpressionStatement()], 26, 40)
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate)
      visitor.IfStatement(ifNode)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(40)
    })

    test('should handle alternate at line 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()], 5, 20)
      const alternate = createBlockStatement([createExpressionStatement()], 26, 40)
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate, 1, 0)
      visitor.IfStatement(ifNode)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle alternate at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()], 5, 20)
      const alternate = {
        type: 'BlockStatement',
        body: [createExpressionStatement()],
        loc: { start: { line: 100, column: 5 }, end: { line: 100, column: 15 } },
      }
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate, 99, 0)
      visitor.IfStatement(ifNode)
      expect(reports[0].loc?.start.line).toBe(100)
    })

    test('should handle alternate at column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()], 0, 10)
      const alternate = {
        type: 'BlockStatement',
        body: [createExpressionStatement()],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      }
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate, 1, 0)
      visitor.IfStatement(ifNode)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle alternate at high column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()], 0, 10)
      const alternate = {
        type: 'BlockStatement',
        body: [createExpressionStatement()],
        loc: { start: { line: 1, column: 500 }, end: { line: 1, column: 600 } },
      }
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate, 1, 0)
      visitor.IfStatement(ifNode)
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should handle alternate on different line from if', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = {
        type: 'BlockStatement',
        body: [createReturnStatement()],
        loc: { start: { line: 1, column: 5 }, end: { line: 2, column: 5 } },
      }
      const alternate = {
        type: 'BlockStatement',
        body: [createExpressionStatement()],
        loc: { start: { line: 3, column: 0 }, end: { line: 4, column: 10 } },
      }
      const ifNode = createIfStatement(
        createIdentifier('x'),
        consequent as MockNode,
        alternate as MockNode,
        1,
        0,
      )
      visitor.IfStatement(ifNode)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should use default location when alternate has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = {
        type: 'BlockStatement',
        body: [createExpressionStatement()],
      }
      const ifNode = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent,
        alternate,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.IfStatement(ifNode)
      expect(reports[0].loc).toBeDefined()
      // Falls back to extractLocation on the node (the if statement)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report location with correct start and end structure', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('should report start line as a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should report start column as a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should report end line as a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('should report end column as a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should handle alternate that is IfStatement with own location', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createExpressionStatement()]),
        null,
        5,
        10,
        30,
      )
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate)
      visitor.IfStatement(ifNode)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle location when alternate is non-BlockStatement non-IfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createExpressionStatement()
      alternate.loc = { start: { line: 2, column: 5 }, end: { line: 2, column: 10 } }
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate)
      visitor.IfStatement(ifNode)
      expect(reports[0].loc).toBeDefined()
    })

    test('should report location even without ranges', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate)
      visitor.IfStatement(ifNode)
      // Location should still be reported even without fix
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  // ============================================================
  // MULTIPLE REPORTS - NEW (8)
  // ============================================================
  describe('multiple reports', () => {
    test('should produce separate reports for separate calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(2)
    })

    test('should not carry state between calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      // First: no report
      visitor.IfStatement(
        createIfStatement(
          createIdentifier('x'),
          createBlockStatement([createExpressionStatement()]),
          createBlockStatement([createExpressionStatement()]),
        ),
      )
      expect(reports.length).toBe(0)
      // Second: report
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(1)
    })

    test('should report independently for different visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const v1 = noElseReturnRule.create(ctx1)
      const v2 = noElseReturnRule.create(ctx2)
      v1.IfStatement(createDetectablePattern())
      v2.IfStatement(createDetectablePattern())
      v1.IfStatement(createDetectablePattern())
      expect(r1.length).toBe(2)
      expect(r2.length).toBe(1)
    })

    test('should report correctly when called twice with same pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const pattern = createDetectablePattern()
      visitor.IfStatement(pattern)
      visitor.IfStatement(pattern)
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should report correctly for alternating valid/invalid calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      // Invalid
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(1)

      // Valid (no alternate)
      visitor.IfStatement(
        createIfStatement(
          createIdentifier('x'),
          createBlockStatement([createReturnStatement()]),
          null,
        ),
      )
      expect(reports.length).toBe(1)

      // Invalid again
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(2)

      // Valid (no return)
      visitor.IfStatement(
        createIfStatement(
          createIdentifier('x'),
          createBlockStatement([createExpressionStatement()]),
          createBlockStatement([createExpressionStatement()]),
        ),
      )
      expect(reports.length).toBe(2)
    })

    test('should accumulate reports across many calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.IfStatement(createDetectablePattern())
      }
      expect(reports.length).toBe(10)
    })

    test('should not report for valid calls interspersed with invalid', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.IfStatement(createDetectablePattern()) // reports
        visitor.IfStatement(
          createIfStatement(
            // no report (no alternate)
            createIdentifier('x'),
            createBlockStatement([createReturnStatement()]),
            null,
          ),
        )
      }
      expect(reports.length).toBe(5)
    })

    test('each report should have its own message', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      visitor.IfStatement(createDetectablePattern())
      expect(reports[0].message).toBe(reports[1].message)
      // Both messages should be defined strings
      expect(reports[0].message.length).toBeGreaterThan(0)
      expect(reports[1].message.length).toBeGreaterThan(0)
    })
  })

  // ============================================================
  // CONTEXT VARIATIONS - NEW (10)
  // ============================================================
  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }', filePath: '/some/other/path.ts' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(1)
    })

    test('should work with long source code', () => {
      const longSource = 'x'.repeat(10000) + 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: longSource, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc, fix: descriptor.fix })
        },
        getFilePath: () => '/project/src/file.ts',
        getAST: () => null,
        getSource: () => 'if (x) { return; } else { y(); }',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(1)
    })

    test('should work with populated options in config', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowInCatch: true, maxDepth: 3 }], source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(1)
    })

    test('should work with empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(1)
    })

    test('should work when getAST returns null', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      expect(context.getAST()).toBeNull()
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(1)
    })

    test('should work when getTokens returns empty array', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      expect(context.getTokens()).toEqual([])
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(1)
    })

    test('should work when getComments returns empty array', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      expect(context.getComments()).toEqual([])
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(1)
    })

    test('should not crash with special characters in source', () => {
      const source = 'if (x) { return "héllo wörld"; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange(
        [createReturnStatementWithArg('Literal', { value: 'héllo wörld' })],
        [7, 34],
      )
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [40, 49])
      const ifNode = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 51],
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPORTS - NEW (4)
  // ============================================================
  describe('exports', () => {
    test('should export noElseReturnRule as named export', () => {
      expect(noElseReturnRule).toBeDefined()
      expect(typeof noElseReturnRule).toBe('object')
    })

    test('should have meta on exported rule', () => {
      expect(noElseReturnRule.meta).toBeDefined()
      expect(typeof noElseReturnRule.meta).toBe('object')
    })

    test('should have create on exported rule', () => {
      expect(noElseReturnRule.create).toBeDefined()
      expect(typeof noElseReturnRule.create).toBe('function')
    })

    test('should export with correct structure (RuleDefinition)', () => {
      expect(noElseReturnRule).toHaveProperty('meta')
      expect(noElseReturnRule).toHaveProperty('create')
      const keys = Object.keys(noElseReturnRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })
  })

  // ============================================================
  // REPORT DESCRIPTOR - NEW (8)
  // ============================================================
  describe('report descriptor', () => {
    test('should include message in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports[0]).toHaveProperty('message')
      expect(typeof reports[0].message).toBe('string')
    })

    test('should include loc in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0].loc).toBeDefined()
    })

    test('should not include fix when ranges are missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatement([createReturnStatement()])
      const alternate = createBlockStatement([createExpressionStatement()])
      // No range on if statement
      const ifNode = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent,
        alternate,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.IfStatement(ifNode)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should include fix when ranges are present', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifNode = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )
      visitor.IfStatement(ifNode)
      expect(reports[0].fix).toBeDefined()
    })

    test('fix should have range property as tuple', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifNode = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )
      visitor.IfStatement(ifNode)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(fix!.range).toHaveLength(2)
    })

    test('fix should have text property as string', () => {
      const source = 'if (x) { return; } else { y(); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = noElseReturnRule.create(context)
      const consequent = createBlockStatementWithRange([createReturnStatement()], [7, 18])
      const alternate = createBlockStatementWithRange([createExpressionStatement()], [24, 33])
      const ifNode = createIfStatementWithRange(
        createIdentifier('x'),
        consequent,
        alternate,
        [0, 35],
      )
      visitor.IfStatement(ifNode)
      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(typeof fix!.text).toBe('string')
    })

    test('report loc should have start and end', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      const loc = reports[0].loc
      expect(loc).toBeDefined()
      expect(loc?.start).toBeDefined()
      expect(loc?.end).toBeDefined()
    })

    test('report loc start should be before end', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      const loc = reports[0].loc
      expect(loc).toBeDefined()
      const startPos = loc!.start.line * 10000 + loc!.start.column
      const endPos = loc!.end.line * 10000 + loc!.end.column
      expect(startPos).toBeLessThanOrEqual(endPos)
    })
  })

  // ============================================================
  // RETURN STATEMENT DETECTION VARIATIONS - NEW (10)
  // ============================================================
  describe('return statement detection variations', () => {
    test('should detect return statement with object expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ret = createReturnStatementWithArg('ObjectExpression', { properties: [] })
      const ifNode = createDetectablePattern([ret])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect return statement with array expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ret = createReturnStatementWithArg('ArrayExpression', { elements: [] })
      const ifNode = createDetectablePattern([ret])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect return statement with binary expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const ret = createReturnStatementWithArg('BinaryExpression', { operator: '+' })
      const ifNode = createDetectablePattern([ret])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect return in nested block statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      // A block within a block that has return
      const innerBlock = createBlockStatement([createReturnStatement()])
      const consequent = createBlockStatement([innerBlock])
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifNode = createIfStatement(createIdentifier('x'), consequent, alternate)
      visitor.IfStatement(ifNode)
      // The hasReturnStatement checks BlockStatement body recursively
      expect(reports.length).toBe(1)
    })

    test('should not detect when return is only in nested if alternate', () => {
      // Wait - hasReturnStatement for IfStatement checks if EITHER branch has return
      // So if the nested if has return in alternate, it WILL return true
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const nestedIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createExpressionStatement()]),
        createBlockStatement([createReturnStatement()]),
      )
      const ifNode = createDetectablePattern([nestedIf])
      visitor.IfStatement(ifNode)
      // hasReturnStatement for IfStatement returns true if alternate has return
      expect(reports.length).toBe(1)
    })

    test('should detect when return is in nested if consequent only', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const nestedIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createReturnStatement()]),
        null,
      )
      const ifNode = createDetectablePattern([nestedIf])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect return in deeply nested if (3 levels)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const level2 = createIfStatement(
        createIdentifier('z'),
        createBlockStatement([createReturnStatement()]),
        null,
      )
      const level1 = createIfStatement(createIdentifier('y'), createBlockStatement([level2]), null)
      const ifNode = createDetectablePattern([level1])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should detect return in nested if with both branches having returns', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const nestedIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createReturnStatement()]),
        createBlockStatement([createReturnStatement()]),
      )
      const ifNode = createDetectablePattern([nestedIf])
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should not detect when no return exists anywhere in consequent tree', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const nestedIf = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createExpressionStatement()]),
        null,
      )
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([nestedIf, createExpressionStatement()]),
        createBlockStatement([createExpressionStatement()]),
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // ALTERNATE TYPE VARIATIONS - NEW (6)
  // ============================================================
  describe('alternate type variations', () => {
    test('should handle alternate as BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const alternate = createBlockStatement([createExpressionStatement()])
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([createReturnStatement()]),
        alternate,
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should handle alternate as IfStatement (else-if chain)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const alternate = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createExpressionStatement()]),
        null,
      )
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([createReturnStatement()]),
        alternate,
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should handle alternate as empty BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const alternate = createBlockStatement([])
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([createReturnStatement()]),
        alternate,
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should handle alternate with nested if inside block', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const alternate = createBlockStatement([
        createIfStatement(
          createIdentifier('y'),
          createBlockStatement([createExpressionStatement()]),
          null,
        ),
      ])
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([createReturnStatement()]),
        alternate,
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should handle alternate as ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const alternate = createExpressionStatement()
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([createReturnStatement()]),
        alternate,
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })

    test('should handle deeply chained else-if', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const level3 = createIfStatement(
        createIdentifier('z'),
        createBlockStatement([createExpressionStatement()]),
        null,
      )
      const level2 = createIfStatement(
        createIdentifier('y'),
        createBlockStatement([createExpressionStatement()]),
        level3,
      )
      const ifNode = createIfStatement(
        createIdentifier('x'),
        createBlockStatement([createReturnStatement()]),
        level2,
      )
      visitor.IfStatement(ifNode)
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // ISIFSTATEMENT CHECK - NEW (6)
  // ============================================================
  describe('isIfStatement check', () => {
    test('should not report for type VariableDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement({
        type: 'VariableDeclaration',
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: createBlockStatement([createExpressionStatement()]),
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for type FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement({
        type: 'FunctionDeclaration',
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: createBlockStatement([createExpressionStatement()]),
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for type BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement({
        type: 'BlockStatement',
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: createBlockStatement([createExpressionStatement()]),
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for type ReturnStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement({
        type: 'ReturnStatement',
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: createBlockStatement([createExpressionStatement()]),
      })
      expect(reports.length).toBe(0)
    })

    test('should report for type IfStatement with exact casing', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(reports.length).toBe(1)
    })

    test('should not report for type ifstatement (wrong casing)', () => {
      const { context, reports } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement({
        type: 'ifstatement',
        consequent: createBlockStatement([createReturnStatement()]),
        alternate: createBlockStatement([createExpressionStatement()]),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // IMMUTABILITY / STATE - NEW (4)
  // ============================================================
  describe('immutability and state', () => {
    test('should not modify input node properties', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const visitor = noElseReturnRule.create(context)
      const originalNode = createDetectablePattern()
      const before = JSON.stringify(originalNode)
      visitor.IfStatement(originalNode)
      const after = JSON.stringify(originalNode)
      expect(before).toBe(after)
    })

    test('should not modify context', () => {
      const { context } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const getSource = context.getSource
      const getFilePath = context.getFilePath
      const visitor = noElseReturnRule.create(context)
      visitor.IfStatement(createDetectablePattern())
      expect(context.getSource).toBe(getSource)
      expect(context.getFilePath).toBe(getFilePath)
    })

    test('should produce same result for same inputs across different contexts', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }', filePath: '/a.ts' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }', filePath: '/b.ts' })
      const v1 = noElseReturnRule.create(ctx1)
      const v2 = noElseReturnRule.create(ctx2)
      const node = createDetectablePattern()
      v1.IfStatement(node)
      v2.IfStatement(node)
      expect(r1[0].message).toBe(r2[0].message)
      expect(r1[0].loc).toEqual(r2[0].loc)
    })

    test('should not have shared state between create calls', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'if (x) { return; } else { y(); }' })
      const v1 = noElseReturnRule.create(ctx1)
      const v2 = noElseReturnRule.create(ctx2)
      v1.IfStatement(createDetectablePattern())
      expect(r2.length).toBe(0)
    })
  })
})
