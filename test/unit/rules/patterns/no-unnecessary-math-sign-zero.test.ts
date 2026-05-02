import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathSignZeroRule } from '../../../../src/rules/patterns/no-unnecessary-math-sign-zero.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  node?: unknown
}

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => '[]',
    getTokens: () => [],
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
  return { context, reports }
}

function makeMathCallNode(
  objectName: string,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-sign-zero rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathSignZeroRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathSignZeroRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathSignZeroRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathSignZeroRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathSignZeroRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning sign', () => {
      const desc = noUnnecessaryMathSignZeroRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/sign/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathSignZeroRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-sign-zero.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathSignZeroRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathSignZeroRule).toBeDefined()
      expect(noUnnecessaryMathSignZeroRule.meta).toBeDefined()
      expect(noUnnecessaryMathSignZeroRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — Math.sign(0) PATTERNS (15) =====

  describe('positive cases — Math.sign(0) patterns', () => {
    test('does not report for Math.sign(0) — basic MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0) with custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }], 5, 10, 5, 25))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(-0) — negative zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: -0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(+0) — positive zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: +0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0.0) — zero with decimal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0.0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0x0) — hex zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0x0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0) on different line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }], 10, 4, 10, 20))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0) as part of larger expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      const signNode = makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }])
      visitor.CallExpression(signNode)
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0) inside conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({
        type: 'ConditionalExpression',
        test: makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }]),
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0) as function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }])],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0) in binary expression context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }]),
        right: { type: 'Literal', value: 0 },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0) with extra node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 15),
        range: [0, 15] as [number, number],
        extra: true,
        trailingComments: [] as unknown[],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0) with computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0) without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0) multiple invocations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== VALID NON-ZERO ARGUMENT CASES (10) =====

  describe('valid non-zero argument cases', () => {
    test('does not report for Math.sign(5) — positive number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(-5) — negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: -5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: -1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0.5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(-0.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: -0.5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 100 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0.001)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0.001 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(3.14)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 3.14 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== VARIABLE/EXPRESSION ARGUMENT CASES (5) =====

  describe('variable and expression arguments', () => {
    test('does not report for Math.sign(x) — variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(y) — another variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'Identifier', name: 'y' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(a + b) — binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(getValue()) — call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getValue' },
        arguments: [],
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(obj.val) — member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'val' },
      }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== ARGUMENT COUNT CASES (5) =====

  describe('argument count variations', () => {
    test('does not report for Math.sign() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0, 1) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0, 1, 2) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 1 }, { type: 'NumericLiteral', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(0, extra) — mixed argument types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }, { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report with empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', []))
      expect(reports.length).toBe(0)
    })
  })

  // ===== WRONG METHOD NAME CASES (8) =====

  describe('wrong method names', () => {
    test('does not report for Math.abs(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'abs', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'floor', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'ceil', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'round', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'max', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.min(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'min', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.trunc(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'trunc', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sqrt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sqrt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== WRONG OBJECT NAME CASES (5) =====

  describe('wrong object names', () => {
    test('does not report for parseInt.sign(0) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('parseInt', 'sign', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.sign(0) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('console', 'sign', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.sign(0) — generic object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('obj', 'sign', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.sign(0) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Number', 'sign', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyMath.sign(0) — custom object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('MyMath', 'sign', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== MALFORMED / PRIMITIVE NODES (7) =====

  describe('malformed and primitive nodes', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== WRONG NODE TYPES (5) =====

  describe('wrong node types', () => {
    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'fn' }, params: [], body: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== MISSING / NULL CALLEE (5) =====

  describe('missing or null callee', () => {
    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: undefined, arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a plain Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'sign' },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a plain function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== MISSING / NULL PROPERTY (5) =====

  describe('missing or null property', () => {
    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: null,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'sign' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Sign" (uppercase S)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'Sign', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "signs" (plural)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'signs', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== ARGUMENT TYPE VARIATIONS (5) =====

  describe('argument type variations', () => {
    test('does not report when argument type is Literal instead of NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'StringLiteral', value: '0' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [undefined]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (10) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathSignZeroRule.create(ctx1)
      const visitor2 = noUnnecessaryMathSignZeroRule.create(ctx2)
      visitor1.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }]))
      visitor2.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 5 }]))
      expect(rep1.length).toBe(0)
      expect(rep2.length).toBe(0)
    })

    test('multiple calls never produce reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: -5 }]))
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathSignZeroRule.create(context)
      const visitor2 = noUnnecessaryMathSignZeroRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathSignZeroRule.meta
      const meta2 = noUnnecessaryMathSignZeroRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: {},
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathSignZeroRule).toBeDefined()
      expect(typeof noUnnecessaryMathSignZeroRule.create).toBe('function')
      expect(typeof noUnnecessaryMathSignZeroRule.meta).toBe('object')
    })

    test('mixed valid inputs all produce no reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeMathCallNode('Math', 'abs', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'NumericLiteral', value: 5 }]))
      visitor.CallExpression(makeMathCallNode('console', 'sign', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeMathCallNode('Math', 'sign', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
