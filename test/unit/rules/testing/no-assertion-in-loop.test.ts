import { describe, expect, test, vi } from 'vitest'
import { noAssertionInLoopRule } from '../../../../src/rules/testing/no-assertion-in-loop.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  node?: unknown
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  filePath = '/src/file.test.ts',
  source = 'for (let i = 0; i < 10; i++) { expect(x).toBe(1); }',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        node: descriptor.node,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
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

function createForStatementNode(line = 1, column = 0): unknown {
  return {
    type: 'ForStatement',
    init: null,
    test: { type: 'Identifier', name: 'condition' },
    update: null,
    body: { type: 'BlockStatement', body: [] },
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createWhileStatementNode(line = 1, column = 0): unknown {
  return {
    type: 'WhileStatement',
    test: { type: 'Identifier', name: 'condition' },
    body: { type: 'BlockStatement', body: [] },
    loc: { start: { line, column }, end: { line, column: column + 18 } },
  }
}

function createDoWhileStatementNode(line = 1, column = 0): unknown {
  return {
    type: 'DoWhileStatement',
    test: { type: 'Identifier', name: 'condition' },
    body: { type: 'BlockStatement', body: [] },
    loc: { start: { line, column }, end: { line, column: column + 22 } },
  }
}

function createForInStatementNode(line = 1, column = 0): unknown {
  return {
    type: 'ForInStatement',
    left: { type: 'Identifier', name: 'key' },
    right: { type: 'Identifier', name: 'obj' },
    body: { type: 'BlockStatement', body: [] },
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createForOfStatementNode(line = 1, column = 0): unknown {
  return {
    type: 'ForOfStatement',
    left: { type: 'Identifier', name: 'item' },
    right: { type: 'Identifier', name: 'arr' },
    body: { type: 'BlockStatement', body: [] },
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function createExpectCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'expect' },
    arguments: [{ type: 'Identifier', name: 'x' }],
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

function createExpectChainCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      },
      property: { type: 'Identifier', name: 'toBe' },
    },
    arguments: [{ type: 'Literal', value: 'expected' }],
    loc: { start: { line, column }, end: { line, column: column + 22 } },
  }
}

function createIteratorCall(methodName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'arr' },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: [{ type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } }],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createNormalCall(name: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + name.length + 2 } },
  }
}

describe('no-assertion-in-loop rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noAssertionInLoopRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noAssertionInLoopRule.meta.severity).toBe('warn')
    })

    test('should have testing category', () => {
      expect(noAssertionInLoopRule.meta.docs?.category).toBe('testing')
    })

    test('should not be recommended', () => {
      expect(noAssertionInLoopRule.meta.docs?.recommended).toBe(false)
    })

    test('description mentions assertion', () => {
      expect(noAssertionInLoopRule.meta.docs?.description.toLowerCase()).toContain('assertion')
    })

    test('description mentions loop', () => {
      expect(noAssertionInLoopRule.meta.docs?.description.toLowerCase()).toContain('loop')
    })

    test('has correct docs URL', () => {
      expect(noAssertionInLoopRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-assertion-in-loop',
      )
    })

    test('has empty schema', () => {
      expect(noAssertionInLoopRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('returns visitor with all required loop methods', () => {
      const { context } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('CallExpression:exit')
      expect(visitor).toHaveProperty('ForStatement')
      expect(visitor).toHaveProperty('ForStatement:exit')
      expect(visitor).toHaveProperty('WhileStatement')
      expect(visitor).toHaveProperty('WhileStatement:exit')
      expect(visitor).toHaveProperty('DoWhileStatement')
      expect(visitor).toHaveProperty('DoWhileStatement:exit')
      expect(visitor).toHaveProperty('ForInStatement')
      expect(visitor).toHaveProperty('ForInStatement:exit')
      expect(visitor).toHaveProperty('ForOfStatement')
      expect(visitor).toHaveProperty('ForOfStatement:exit')
    })

    test('creates new visitor per call', () => {
      const { context } = createMockContext()
      const visitor1 = noAssertionInLoopRule.create(context)
      const visitor2 = noAssertionInLoopRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('valid: expect outside loops', () => {
    test('expect at top level - no report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(0)
    })

    test('multiple top-level expects - no report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor.CallExpression(createExpectCall(3, 0))
      expect(reports.length).toBe(0)
    })

    test('expect after for loop exits - no report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor['ForStatement:exit'](createForStatementNode())
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(0)
    })

    test('expect after while loop exits - no report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.WhileStatement(createWhileStatementNode())
      visitor['WhileStatement:exit'](createWhileStatementNode())
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(0)
    })

    test('expect after forEach exits - no report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const forEachNode = createIteratorCall('forEach')
      visitor.CallExpression(forEachNode)
      visitor['CallExpression:exit'](forEachNode)
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(0)
    })

    test('non-expect call inside for loop - no report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createNormalCall('processData'))
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(0)
    })

    test('non-expect call inside forEach - no report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const forEachNode = createIteratorCall('forEach')
      visitor.CallExpression(forEachNode)
      visitor.CallExpression(createNormalCall('processItem'))
      visitor['CallExpression:exit'](forEachNode)
      expect(reports.length).toBe(0)
    })

    test('describe() inside for loop - no report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createNormalCall('describe'))
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(0)
    })

    test('console.log inside for loop - no report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createNormalCall('console.log'))
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(0)
    })

    test('non-iterator method does not create loop context', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const findNode = createIteratorCall('find')
      visitor.CallExpression(findNode)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](findNode)
      expect(reports.length).toBe(0)
    })
  })

  describe('invalid: expect inside for loop', () => {
    test('reports expect inside for loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(1)
    })

    test('reports correct location for expect in for loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall(5, 8))
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports multiple expects in for loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor.CallExpression(createExpectCall(3, 0))
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(3)
    })

    test('reports chained expect call inside for loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectChainCall())
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(1)
    })
  })

  describe('invalid: expect inside while loop', () => {
    test('reports expect inside while loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.WhileStatement(createWhileStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['WhileStatement:exit'](createWhileStatementNode())
      expect(reports.length).toBe(1)
    })

    test('reports correct location for expect in while', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.WhileStatement(createWhileStatementNode())
      visitor.CallExpression(createExpectCall(7, 4))
      visitor['WhileStatement:exit'](createWhileStatementNode())
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('reports multiple expects in while loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.WhileStatement(createWhileStatementNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['WhileStatement:exit'](createWhileStatementNode())
      expect(reports.length).toBe(2)
    })
  })

  describe('invalid: expect inside do-while', () => {
    test('reports expect inside do-while', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.DoWhileStatement(createDoWhileStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['DoWhileStatement:exit'](createDoWhileStatementNode())
      expect(reports.length).toBe(1)
    })

    test('reports correct location for expect in do-while', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.DoWhileStatement(createDoWhileStatementNode())
      visitor.CallExpression(createExpectCall(3, 6))
      visitor['DoWhileStatement:exit'](createDoWhileStatementNode())
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('reports multiple expects in do-while', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.DoWhileStatement(createDoWhileStatementNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['DoWhileStatement:exit'](createDoWhileStatementNode())
      expect(reports.length).toBe(2)
    })
  })

  describe('invalid: expect inside for-in', () => {
    test('reports expect inside for-in', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForInStatement(createForInStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['ForInStatement:exit'](createForInStatementNode())
      expect(reports.length).toBe(1)
    })

    test('reports correct location for expect in for-in', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForInStatement(createForInStatementNode())
      visitor.CallExpression(createExpectCall(4, 2))
      visitor['ForInStatement:exit'](createForInStatementNode())
      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('reports multiple expects in for-in', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForInStatement(createForInStatementNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['ForInStatement:exit'](createForInStatementNode())
      expect(reports.length).toBe(2)
    })
  })

  describe('invalid: expect inside for-of', () => {
    test('reports expect inside for-of', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForOfStatement(createForOfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['ForOfStatement:exit'](createForOfStatementNode())
      expect(reports.length).toBe(1)
    })

    test('reports correct location for expect in for-of', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForOfStatement(createForOfStatementNode())
      visitor.CallExpression(createExpectCall(6, 3))
      visitor['ForOfStatement:exit'](createForOfStatementNode())
      expect(reports[0].loc?.start.line).toBe(6)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('reports multiple expects in for-of', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForOfStatement(createForOfStatementNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['ForOfStatement:exit'](createForOfStatementNode())
      expect(reports.length).toBe(2)
    })
  })

  describe('invalid: expect inside forEach', () => {
    test('reports expect inside forEach callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const forEachNode = createIteratorCall('forEach')
      visitor.CallExpression(forEachNode)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](forEachNode)
      expect(reports.length).toBe(1)
    })

    test('reports correct location for expect in forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const forEachNode = createIteratorCall('forEach')
      visitor.CallExpression(forEachNode)
      visitor.CallExpression(createExpectCall(9, 12))
      visitor['CallExpression:exit'](forEachNode)
      expect(reports[0].loc?.start.line).toBe(9)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('reports multiple expects in forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const forEachNode = createIteratorCall('forEach')
      visitor.CallExpression(forEachNode)
      visitor.CallExpression(createExpectCall(1, 0))
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['CallExpression:exit'](forEachNode)
      expect(reports.length).toBe(2)
    })
  })

  describe('invalid: expect inside map', () => {
    test('reports expect inside map callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const mapNode = createIteratorCall('map')
      visitor.CallExpression(mapNode)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](mapNode)
      expect(reports.length).toBe(1)
    })

    test('reports correct location for expect in map', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const mapNode = createIteratorCall('map')
      visitor.CallExpression(mapNode)
      visitor.CallExpression(createExpectCall(10, 5))
      visitor['CallExpression:exit'](mapNode)
      expect(reports[0].loc?.start.line).toBe(10)
    })
  })

  describe('invalid: expect inside filter', () => {
    test('reports expect inside filter callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const filterNode = createIteratorCall('filter')
      visitor.CallExpression(filterNode)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](filterNode)
      expect(reports.length).toBe(1)
    })

    test('reports correct location for expect in filter', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const filterNode = createIteratorCall('filter')
      visitor.CallExpression(filterNode)
      visitor.CallExpression(createExpectCall(8, 3))
      visitor['CallExpression:exit'](filterNode)
      expect(reports[0].loc?.start.line).toBe(8)
    })
  })

  describe('invalid: expect inside reduce', () => {
    test('reports expect inside reduce callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const reduceNode = createIteratorCall('reduce')
      visitor.CallExpression(reduceNode)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](reduceNode)
      expect(reports.length).toBe(1)
    })

    test('reports correct location for expect in reduce', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const reduceNode = createIteratorCall('reduce')
      visitor.CallExpression(reduceNode)
      visitor.CallExpression(createExpectCall(12, 6))
      visitor['CallExpression:exit'](reduceNode)
      expect(reports[0].loc?.start.line).toBe(12)
    })
  })

  describe('invalid: expect inside every', () => {
    test('reports expect inside every callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const everyNode = createIteratorCall('every')
      visitor.CallExpression(everyNode)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](everyNode)
      expect(reports.length).toBe(1)
    })

    test('reports correct location for expect in every', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const everyNode = createIteratorCall('every')
      visitor.CallExpression(everyNode)
      visitor.CallExpression(createExpectCall(15, 2))
      visitor['CallExpression:exit'](everyNode)
      expect(reports[0].loc?.start.line).toBe(15)
    })
  })

  describe('invalid: expect inside some', () => {
    test('reports expect inside some callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const someNode = createIteratorCall('some')
      visitor.CallExpression(someNode)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](someNode)
      expect(reports.length).toBe(1)
    })

    test('reports correct location for expect in some', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const someNode = createIteratorCall('some')
      visitor.CallExpression(someNode)
      visitor.CallExpression(createExpectCall(20, 4))
      visitor['CallExpression:exit'](someNode)
      expect(reports[0].loc?.start.line).toBe(20)
    })
  })

  describe('nested loops', () => {
    test('expect in nested for loops', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['ForStatement:exit'](createForStatementNode())
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(1)
    })

    test('expect in forEach inside for loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      const forEachNode = createIteratorCall('forEach')
      visitor.CallExpression(forEachNode)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](forEachNode)
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(1)
    })

    test('expect in for loop inside forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const forEachNode = createIteratorCall('forEach')
      visitor.CallExpression(forEachNode)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['ForStatement:exit'](createForStatementNode())
      visitor['CallExpression:exit'](forEachNode)
      expect(reports.length).toBe(1)
    })

    test('depth resets after exiting nested loops', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor['ForStatement:exit'](createForStatementNode())
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['ForStatement:exit'](createForStatementNode())
      visitor.CallExpression(createExpectCall(3, 0))
      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
    })

    test('sequential loops both report independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor['ForStatement:exit'](createForStatementNode())
      visitor.WhileStatement(createWhileStatementNode())
      visitor.CallExpression(createExpectCall(5, 0))
      visitor['WhileStatement:exit'](createWhileStatementNode())
      expect(reports.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    test('null node in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      expect(() => visitor.CallExpression(null)).not.toThrow()
      visitor['ForStatement:exit'](createForStatementNode())
    })

    test('undefined node in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      visitor['ForStatement:exit'](createForStatementNode())
    })

    test('non-object node (string) in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      expect(() => visitor.CallExpression('string')).not.toThrow()
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(0)
    })

    test('non-object node (number) in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      expect(() => visitor.CallExpression(123)).not.toThrow()
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(0)
    })

    test('empty object node in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      expect(() => visitor.CallExpression({})).not.toThrow()
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(0)
    })

    test('node without loc property reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [],
      })
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('node without callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression({ type: 'CallExpression', arguments: [] })
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(0)
    })

    test('CallExpression with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [] })
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(0)
    })

    test('node without type is not processed', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression({ callee: { type: 'Identifier', name: 'expect' }, arguments: [] })
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(0)
    })

    test('computed property does not trigger iterator detection', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'forEach' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(0)
    })
  })

  describe('report message content', () => {
    test('message starts with "Unexpected"', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports[0].message).toMatch(/^Unexpected/)
    })

    test('message mentions "loop"', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports[0].message.toLowerCase()).toContain('loop')
    })

    test('message mentions "assertion"', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports[0].message.toLowerCase()).toContain('assertion')
    })
  })

  describe('state isolation', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noAssertionInLoopRule.create(ctx1)
      const visitor2 = noAssertionInLoopRule.create(ctx2)
      visitor1.ForStatement(createForStatementNode())
      visitor1.CallExpression(createExpectCall())
      visitor2.CallExpression(createExpectCall())
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
      visitor1['ForStatement:exit'](createForStatementNode())
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall(1, 0))
      visitor['ForStatement:exit'](createForStatementNode())
      visitor.WhileStatement(createWhileStatementNode())
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['WhileStatement:exit'](createWhileStatementNode())
      expect(reports.length).toBe(2)
    })

    test('depth resets correctly between loops', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['ForStatement:exit'](createForStatementNode())
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(1)
    })
  })

  describe('default export', () => {
    test('rule is properly exported', () => {
      expect(noAssertionInLoopRule).toBeDefined()
      expect(noAssertionInLoopRule.meta).toBeDefined()
      expect(noAssertionInLoopRule.create).toBeDefined()
    })
  })

  describe('CallExpression:exit behavior', () => {
    test('exit pops forEach from stack allowing expect after', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const forEachNode = createIteratorCall('forEach')
      visitor.CallExpression(forEachNode)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](forEachNode)
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(1)
    })

    test('exit pops map from stack allowing expect after', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const mapNode = createIteratorCall('map')
      visitor.CallExpression(mapNode)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](mapNode)
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(1)
    })

    test('exit pops reduce from stack allowing expect after', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const reduceNode = createIteratorCall('reduce')
      visitor.CallExpression(reduceNode)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](reduceNode)
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(1)
    })

    test('exit for non-iterator method does not pop stack', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      const findNode = createIteratorCall('find')
      visitor.CallExpression(findNode)
      visitor.CallExpression(createExpectCall(1, 0))
      visitor['CallExpression:exit'](findNode)
      visitor.CallExpression(createExpectCall(2, 0))
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(2)
    })

    test('exit with null node does not throw', () => {
      const { context } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      expect(() => visitor['CallExpression:exit'](null)).not.toThrow()
    })

    test('exit with non-CallExpression node does not throw', () => {
      const { context } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      expect(() =>
        visitor['CallExpression:exit']({ type: 'Identifier', name: 'x' }),
      ).not.toThrow()
    })
  })

  describe('loop statement exit behavior', () => {
    test('ForStatement exit allows expect after', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['ForStatement:exit'](createForStatementNode())
      visitor.CallExpression(createExpectCall(2, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('WhileStatement exit allows expect after', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.WhileStatement(createWhileStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['WhileStatement:exit'](createWhileStatementNode())
      visitor.CallExpression(createExpectCall(2, 0))
      expect(reports.length).toBe(1)
    })

    test('DoWhileStatement exit allows expect after', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.DoWhileStatement(createDoWhileStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['DoWhileStatement:exit'](createDoWhileStatementNode())
      visitor.CallExpression(createExpectCall(2, 0))
      expect(reports.length).toBe(1)
    })

    test('ForInStatement exit allows expect after', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForInStatement(createForInStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['ForInStatement:exit'](createForInStatementNode())
      visitor.CallExpression(createExpectCall(2, 0))
      expect(reports.length).toBe(1)
    })

    test('ForOfStatement exit allows expect after', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForOfStatement(createForOfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['ForOfStatement:exit'](createForOfStatementNode())
      visitor.CallExpression(createExpectCall(2, 0))
      expect(reports.length).toBe(1)
    })
  })

  describe('mixed loop types', () => {
    test('for inside while with expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.WhileStatement(createWhileStatementNode())
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['ForStatement:exit'](createForStatementNode())
      visitor['WhileStatement:exit'](createWhileStatementNode())
      expect(reports.length).toBe(1)
    })

    test('forEach inside for-of with expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForOfStatement(createForOfStatementNode())
      const forEachNode = createIteratorCall('forEach')
      visitor.CallExpression(forEachNode)
      visitor.CallExpression(createExpectCall())
      visitor['CallExpression:exit'](forEachNode)
      visitor['ForOfStatement:exit'](createForOfStatementNode())
      expect(reports.length).toBe(1)
    })

    test('while inside forEach with expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const forEachNode = createIteratorCall('forEach')
      visitor.CallExpression(forEachNode)
      visitor.WhileStatement(createWhileStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['WhileStatement:exit'](createWhileStatementNode())
      visitor['CallExpression:exit'](forEachNode)
      expect(reports.length).toBe(1)
    })

    test('deeply nested 3-level loops', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.WhileStatement(createWhileStatementNode())
      visitor.ForOfStatement(createForOfStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['ForOfStatement:exit'](createForOfStatementNode())
      visitor['WhileStatement:exit'](createWhileStatementNode())
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(1)
    })
  })

  describe('report descriptor details', () => {
    test('report includes loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall(5, 10))
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report loc start matches expect node', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall(5, 10))
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end matches expect node', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall(5, 10))
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('report includes node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      const expectNode = createExpectCall()
      visitor.CallExpression(expectNode)
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports[0].node).toBe(expectNode)
    })
  })

  describe('additional edge cases', () => {
    test('non-iterator method find does not push to stack', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const findNode = createIteratorCall('find')
      visitor.CallExpression(findNode)
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(0)
    })

    test('non-iterator method flatMap does not push to stack', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const flatMapNode = createIteratorCall('flatMap')
      visitor.CallExpression(flatMapNode)
      visitor.CallExpression(createExpectCall())
      expect(reports.length).toBe(0)
    })

    test('expect inside for loop with mixed non-expect calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createNormalCall('setup'))
      visitor.CallExpression(createExpectCall())
      visitor.CallExpression(createNormalCall('teardown'))
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports.length).toBe(1)
    })

    test('chained expect inside forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      const forEachNode = createIteratorCall('forEach')
      visitor.CallExpression(forEachNode)
      visitor.CallExpression(createExpectChainCall())
      visitor['CallExpression:exit'](forEachNode)
      expect(reports.length).toBe(1)
    })

    test('report message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noAssertionInLoopRule.create(context)
      visitor.ForStatement(createForStatementNode())
      visitor.CallExpression(createExpectCall())
      visitor['ForStatement:exit'](createForStatementNode())
      expect(reports[0].message).toMatch(/\.$/)
    })
  })
})
