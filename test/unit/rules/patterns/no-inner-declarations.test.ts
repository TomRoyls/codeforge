import { describe, expect, test, vi } from 'vitest'
import { noInnerDeclarationsRule } from '../../../../src/rules/patterns/no-inner-declarations.js'
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
    getSource: () => 'function foo() {}',
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

function makeFuncNode(parentType: string, locStartLine = 1, locStartCol = 0, locEndLine = 1, locEndCol = 5): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'foo' },
    params: [],
    body: { type: 'BlockStatement', body: [] },
    _parent: { type: parentType },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeVarNode(kind: string, parentType: string, locStartLine = 1, locStartCol = 0, locEndLine = 1, locEndCol = 5): unknown {
  return {
    type: 'VariableDeclaration',
    declarations: [],
    kind,
    _parent: { type: parentType },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (7) =====

describe('no-inner-declarations rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noInnerDeclarationsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noInnerDeclarationsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noInnerDeclarationsRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noInnerDeclarationsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noInnerDeclarationsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning declarations or blocks', () => {
      const desc = noInnerDeclarationsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/declar|block/)
    })

    test('should have empty schema', () => {
      expect(noInnerDeclarationsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (4) =====

  describe('structure', () => {
    test('create() returns visitor with FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('create() returns visitor with VariableDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      expect(visitor).toHaveProperty('VariableDeclaration')
      expect(typeof visitor.VariableDeclaration).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noInnerDeclarationsRule).toBeDefined()
      expect(noInnerDeclarationsRule.meta).toBeDefined()
      expect(noInnerDeclarationsRule.create).toBeDefined()
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noInnerDeclarationsRule.create(context)
      const visitor2 = noInnerDeclarationsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  // ===== FUNCTION DECLARATION POSITIVE CASES (14) =====

  describe('FunctionDeclaration — reports for block parents', () => {
    test('reports FunctionDeclaration inside BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('BlockStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration inside SwitchCase', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('SwitchCase'))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration inside IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('IfStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration inside ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('ForStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration inside ForInStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('ForInStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration inside ForOfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('ForOfStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration inside WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('WhileStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration inside DoWhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('DoWhileStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration inside TryStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('TryStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration inside CatchClause', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('CatchClause'))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration inside WithStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('WithStatement'))
      expect(reports.length).toBe(1)
    })

    test('report message is "Move function declaration to program root."', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('BlockStatement'))
      expect(reports[0].message).toBe('Move function declaration to program root.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('IfStatement'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report node matches the input FunctionDeclaration node', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      const node = makeFuncNode('WhileStatement')
      visitor.FunctionDeclaration(node)
      expect(reports[0].node).toBe(node)
    })
  })

  // ===== FUNCTION DECLARATION NEGATIVE CASES (14) =====

  describe('FunctionDeclaration — does NOT report', () => {
    test('does not report for Program parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('Program'))
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('FunctionDeclaration'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('ExpressionStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      expect(() => visitor.FunctionDeclaration({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      expect(() => visitor.FunctionDeclaration('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration({
        type: 'Identifier',
        name: 'foo',
        _parent: { type: 'BlockStatement' },
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        _parent: null,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent has no type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        _parent: { name: 'foo' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('VariableDeclaration'))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('CallExpression'))
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('MemberExpression'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== VARIABLE DECLARATION POSITIVE CASES — var + block parents (14) =====

  describe('VariableDeclaration — reports var in block parents', () => {
    test('reports var inside BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'BlockStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports var inside SwitchCase', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'SwitchCase'))
      expect(reports.length).toBe(1)
    })

    test('reports var inside IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'IfStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports var inside ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'ForStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports var inside ForInStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'ForInStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports var inside ForOfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'ForOfStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports var inside WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'WhileStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports var inside DoWhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'DoWhileStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports var inside TryStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'TryStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports var inside CatchClause', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'CatchClause'))
      expect(reports.length).toBe(1)
    })

    test('reports var inside WithStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'WithStatement'))
      expect(reports.length).toBe(1)
    })

    test('report message is "Move variable declaration to program root."', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'BlockStatement'))
      expect(reports[0].message).toBe('Move variable declaration to program root.')
    })

    test('report has loc and node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'IfStatement'))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input VariableDeclaration node', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      const node = makeVarNode('var', 'ForStatement')
      visitor.VariableDeclaration(node)
      expect(reports[0].node).toBe(node)
    })
  })

  // ===== VARIABLE DECLARATION NEGATIVE CASES (14) =====

  describe('VariableDeclaration — does NOT report', () => {
    test('does not report let inside BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('let', 'BlockStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report const inside BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('const', 'BlockStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report let inside IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('let', 'IfStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report const inside ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('const', 'ForStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report var inside Program', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'Program'))
      expect(reports.length).toBe(0)
    })

    test('does not report var inside ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'ExpressionStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report var when _parent is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'var',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      expect(() => visitor.VariableDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      expect(() => visitor.VariableDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      expect(() => visitor.VariableDeclaration({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration({
        type: 'Identifier',
        name: 'x',
        kind: 'var',
        _parent: { type: 'BlockStatement' },
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report var inside FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'FunctionDeclaration'))
      expect(reports.length).toBe(0)
    })

    test('does not report var when _parent is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'var',
        _parent: null,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when kind is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration({
        type: 'VariableDeclaration',
        declarations: [],
        _parent: { type: 'BlockStatement' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (28) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noInnerDeclarationsRule.create(ctx1)
      const visitor2 = noInnerDeclarationsRule.create(ctx2)
      visitor1.FunctionDeclaration(makeFuncNode('BlockStatement'))
      visitor2.FunctionDeclaration(makeFuncNode('Program'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('FunctionDeclaration accumulates reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('BlockStatement'))
      visitor.FunctionDeclaration(makeFuncNode('IfStatement'))
      expect(reports.length).toBe(2)
    })

    test('VariableDeclaration accumulates reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'BlockStatement'))
      visitor.VariableDeclaration(makeVarNode('var', 'IfStatement'))
      expect(reports.length).toBe(2)
    })

    test('FunctionDeclaration node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        _parent: { type: 'BlockStatement' },
      })
      expect(reports.length).toBe(1)
    })

    test('VariableDeclaration node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'var',
        _parent: { type: 'IfStatement' },
      })
      expect(reports.length).toBe(1)
    })

    test('FunctionDeclaration with partial loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        _parent: { type: 'WhileStatement' },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('VariableDeclaration with partial loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'var',
        _parent: { type: 'TryStatement' },
        loc: { start: { line: 7, column: 2 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('FunctionDeclaration report loc reflects specific node location', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('BlockStatement', 10, 4, 10, 20))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('VariableDeclaration report loc reflects specific node location', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'CatchClause', 15, 8, 15, 25))
      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(15)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('mixed FunctionDeclaration and VariableDeclaration reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('BlockStatement'))
      visitor.VariableDeclaration(makeVarNode('var', 'IfStatement'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe('Move function declaration to program root.')
      expect(reports[1].message).toBe('Move variable declaration to program root.')
    })

    test('FunctionDeclaration with extra properties still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'bar' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        _parent: { type: 'BlockStatement' },
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        async: false,
        generator: false,
      })
      expect(reports.length).toBe(1)
    })

    test('VariableDeclaration with extra properties still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration({
        type: 'VariableDeclaration',
        declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' } }],
        kind: 'var',
        _parent: { type: 'ForStatement' },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
      })
      expect(reports.length).toBe(1)
    })

    test('FunctionDeclaration node with empty loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        _parent: { type: 'CatchClause' },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('VariableDeclaration node with empty loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'var',
        _parent: { type: 'WithStatement' },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('multiple same FunctionDeclaration violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      const node = makeFuncNode('BlockStatement')
      visitor.FunctionDeclaration(node)
      visitor.FunctionDeclaration(node)
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(3)
    })

    test('multiple same VariableDeclaration violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      const node = makeVarNode('var', 'BlockStatement')
      visitor.VariableDeclaration(node)
      visitor.VariableDeclaration(node)
      expect(reports.length).toBe(2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noInnerDeclarationsRule.meta
      const meta2 = noInnerDeclarationsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('FunctionDeclaration report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('BlockStatement'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('VariableDeclaration report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration(makeVarNode('var', 'BlockStatement'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('FunctionDeclaration handles _parent as string (non-object)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        _parent: 'BlockStatement',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('VariableDeclaration handles _parent as string (non-object)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'var',
        _parent: 'BlockStatement',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('FunctionDeclaration default loc when loc missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        _parent: { type: 'BlockStatement' },
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('VariableDeclaration default loc when loc missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'var',
        _parent: { type: 'BlockStatement' },
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('rule exports are correct', () => {
      expect(noInnerDeclarationsRule).toBeDefined()
      expect(typeof noInnerDeclarationsRule.create).toBe('function')
      expect(typeof noInnerDeclarationsRule.meta).toBe('object')
    })

    test('mixed valid/invalid count correctly across both visitors', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration(makeFuncNode('Program'))
      visitor.FunctionDeclaration(makeFuncNode('BlockStatement'))
      visitor.VariableDeclaration(makeVarNode('let', 'BlockStatement'))
      visitor.VariableDeclaration(makeVarNode('var', 'IfStatement'))
      visitor.FunctionDeclaration(makeFuncNode('ExpressionStatement'))
      expect(reports.length).toBe(2)
    })

    test('FunctionDeclaration handles _parent as array', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        _parent: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('FunctionDeclaration handles _parent as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        _parent: 42,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('VariableDeclaration handles _parent as array', () => {
      const { context, reports } = createMockContext()
      const visitor = noInnerDeclarationsRule.create(context)
      visitor.VariableDeclaration({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'var',
        _parent: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })
  })
})
