import { Project, Node as TsNode, SyntaxKind } from 'ts-morph'

import {
  type ASTVisitor,
  type BranchingNode,
  type FunctionLikeNode,
  type Position,
  type Range,
  type RuleViolation,
  type VisitorContext,
  getFunctionName,
  getNodePosition,
  getNodeRange,
  isFunctionLike,
  Node,
  traverseAST,
  traverseASTMultiple,
} from '../src/ast/visitor.js'

// ─── Helpers ─────────────────────────────────────────────
const project = new Project({ useInMemoryFileSystem: true })

function makeSource(code: string, name = 'test.ts') {
  return project.createSourceFile(name, code, { overwrite: true })
}

function makeViolation(node: TsNode, ctx: VisitorContext): RuleViolation {
  const pos = getNodePosition(node)
  return {
    filePath: ctx.getFilePath(),
    message: 'test violation',
    range: { start: pos, end: pos },
    ruleId: 'test-rule',
    severity: 'warning',
  }
}

// ─── getNodePosition ─────────────────────────────────────
describe('getNodePosition', () => {
  it('returns correct line and column for a node', () => {
    const sf = makeSource('const x = 1;\nconst y = 2;')
    const xDecl = sf.getVariableDeclarations()[0]!
    const pos: Position = getNodePosition(xDecl)

    expect(pos.line).toBe(1)
    expect(pos.column).toBeGreaterThanOrEqual(1)
  })

  it('returns line 2 for second-line nodes', () => {
    const sf = makeSource('const a = 1;\nconst b = 2;')
    const bDecl = sf.getVariableDeclarations()[1]!
    const pos: Position = getNodePosition(bDecl)

    expect(pos.line).toBe(2)
  })

  it('works for a function declaration', () => {
    const sf = makeSource('function hello() { return 1; }')
    const fn = sf.getFunctionOrThrow('hello')
    const pos: Position = getNodePosition(fn)

    expect(pos.line).toBe(1)
    expect(pos.column).toBeGreaterThanOrEqual(1)
  })
})

// ─── getNodeRange ────────────────────────────────────────
describe('getNodeRange', () => {
  it('returns start and end positions for a node', () => {
    const sf = makeSource('const x = 1;')
    const xDecl = sf.getVariableDeclarations()[0]!
    const range: Range = getNodeRange(xDecl)

    expect(range.start.line).toBe(1)
    expect(range.end.line).toBeGreaterThanOrEqual(1)
    expect(range.start.column).toBeGreaterThanOrEqual(1)
  })

  it('end position is after or equal to start position', () => {
    const sf = makeSource('function foo() { return 42; }')
    const fn = sf.getFunctionOrThrow('foo')
    const range: Range = getNodeRange(fn)

    const startOffset = (range.start.line - 1) * 1000 + range.start.column
    const endOffset = (range.end.line - 1) * 1000 + range.end.column
    expect(endOffset).toBeGreaterThanOrEqual(startOffset)
  })

  it('works for multi-line nodes', () => {
    const sf = makeSource('function bar() {\n  return 1;\n}')
    const fn = sf.getFunctionOrThrow('bar')
    const range: Range = getNodeRange(fn)

    expect(range.start.line).toBe(1)
    expect(range.end.line).toBeGreaterThanOrEqual(2)
  })
})

// ─── isFunctionLike ──────────────────────────────────────
describe('isFunctionLike', () => {
  it('returns true for function declarations', () => {
    const sf = makeSource('function foo() {}')
    const fn = sf.getFunctionOrThrow('foo')
    expect(isFunctionLike(fn)).toBe(true)
  })

  it('returns true for method declarations', () => {
    const sf = makeSource('class A { method() {} }')
    const cls = sf.getClassOrThrow('A')
    const method = cls.getMethodOrThrow('method')
    expect(isFunctionLike(method)).toBe(true)
  })

  it('returns true for arrow functions', () => {
    const sf = makeSource('const fn = () => 1')
    const arrow = sf.getFirstDescendantByKind(SyntaxKind.ArrowFunction)!
    expect(arrow).toBeDefined()
    expect(isFunctionLike(arrow)).toBe(true)
  })

  it('returns true for constructors', () => {
    const sf = makeSource('class A { constructor() {} }')
    const ctor = sf.getFirstDescendantByKind(SyntaxKind.Constructor)!
    expect(ctor).toBeDefined()
    expect(isFunctionLike(ctor)).toBe(true)
  })

  it('returns true for getters', () => {
    const sf = makeSource('class A { get x() { return 1; } }')
    const cls = sf.getClassOrThrow('A')
    const getter = cls.getGetAccessor('x')!
    expect(getter).toBeDefined()
    expect(isFunctionLike(getter)).toBe(true)
  })

  it('returns true for setters', () => {
    const sf = makeSource('class A { set x(v: number) {} }')
    const cls = sf.getClassOrThrow('A')
    const setter = cls.getSetAccessor('x')!
    expect(setter).toBeDefined()
    expect(isFunctionLike(setter)).toBe(true)
  })

  it('returns true for function expressions', () => {
    const sf = makeSource('const fn = function named() {}')
    const fnExpr = sf.getFirstDescendantByKind(SyntaxKind.FunctionExpression)!
    expect(fnExpr).toBeDefined()
    expect(isFunctionLike(fnExpr)).toBe(true)
  })

  it('returns false for variable declarations', () => {
    const sf = makeSource('const x = 1')
    const vDecl = sf.getVariableDeclarations()[0]!
    expect(isFunctionLike(vDecl)).toBe(false)
  })

  it('returns false for if statements', () => {
    const sf = makeSource('if (true) {}')
    const ifStmt = sf.getFirstDescendantByKind(SyntaxKind.IfStatement)!
    expect(isFunctionLike(ifStmt)).toBe(false)
  })

  it('returns false for return statements', () => {
    const sf = makeSource('function f() { return 1; }')
    const ret = sf.getFirstDescendantByKind(SyntaxKind.ReturnStatement)!
    expect(isFunctionLike(ret)).toBe(false)
  })
})

// ─── getFunctionName ─────────────────────────────────────
describe('getFunctionName', () => {
  it('returns function name for named function declarations', () => {
    const sf = makeSource('function myFunc() {}')
    const fn = sf.getFunctionOrThrow('myFunc')
    expect(getFunctionName(fn)).toBe('myFunc')
  })

  it('returns "anonymous function" for unnamed function expressions', () => {
    const sf = makeSource('const f = function() {}')
    const fnExpr = sf.getFirstDescendantByKind(SyntaxKind.FunctionExpression)!
    expect(getFunctionName(fnExpr)).toBe('anonymous function')
  })

  it('returns the name for named function expressions', () => {
    const sf = makeSource('const f = function namedExpr() {}')
    const fnExpr = sf.getFirstDescendantByKind(SyntaxKind.FunctionExpression)!
    expect(getFunctionName(fnExpr)).toBe('namedExpr')
  })

  it('returns "ClassName.methodName" for method declarations', () => {
    const sf = makeSource('class MyClass { myMethod() {} }')
    const cls = sf.getClassOrThrow('MyClass')
    const method = cls.getMethodOrThrow('myMethod')
    expect(getFunctionName(method)).toBe('MyClass.myMethod')
  })

  it('returns "constructor (ClassName)" for constructors', () => {
    const sf = makeSource('class MyClass { constructor() {} }')
    const ctor = sf.getFirstDescendantByKind(SyntaxKind.Constructor)!
    expect(getFunctionName(ctor)).toBe('constructor (MyClass)')
  })

  it('returns variable name for arrow functions assigned to a variable', () => {
    const sf = makeSource('const myArrow = () => {}')
    const arrow = sf.getFirstDescendantByKind(SyntaxKind.ArrowFunction)!
    expect(getFunctionName(arrow)).toBe('myArrow')
  })

  it('returns "arrow function" for unassigned arrow functions', () => {
    const sf = makeSource('[1, 2, 3].map(x => x * 2)')
    const arrow = sf.getFirstDescendantByKind(SyntaxKind.ArrowFunction)!
    expect(getFunctionName(arrow)).toBe('arrow function')
  })

  it('returns "get name" for getter accessors', () => {
    const sf = makeSource('class A { get value() { return 1; } }')
    const cls = sf.getClassOrThrow('A')
    const getter = cls.getGetAccessor('value')!
    expect(getFunctionName(getter)).toBe('get value')
  })

  it('returns "set name" for setter accessors', () => {
    const sf = makeSource('class A { set value(v: number) {} }')
    const cls = sf.getClassOrThrow('A')
    const setter = cls.getSetAccessor('value')!
    expect(getFunctionName(setter)).toBe('set value')
  })
})

// ─── traverseAST ─────────────────────────────────────────
describe('traverseAST', () => {
  it('calls visitNode for every node', () => {
    const sf = makeSource('const x = 1;')
    const visited: TsNode[] = []
    const visitor: ASTVisitor = {
      visitNode(node) {
        visited.push(node)
      },
    }

    traverseAST(sf, visitor)

    // Should have visited multiple nodes: SourceFile, VariableStatement,
    // VariableDeclarationList, VariableDeclaration, Identifier, NumericLiteral, etc.
    expect(visited.length).toBeGreaterThan(3)
  })

  it('calls visitSourceFile for the root', () => {
    const sf = makeSource('const x = 1;')
    let called = false
    const visitor: ASTVisitor = {
      visitSourceFile(_node) {
        called = true
      },
    }

    traverseAST(sf, visitor)
    expect(called).toBe(true)
  })

  it('calls visitFunction for function-like nodes', () => {
    const sf = makeSource('function foo() {}')
    const fns: FunctionLikeNode[] = []
    const visitor: ASTVisitor = {
      visitFunction(node) {
        fns.push(node)
      },
    }

    traverseAST(sf, visitor)
    expect(fns.length).toBe(1)
  })

  it('calls visitFunction for arrow functions', () => {
    const sf = makeSource('const f = () => 1')
    const fns: FunctionLikeNode[] = []
    const visitor: ASTVisitor = {
      visitFunction(node) {
        fns.push(node)
      },
    }

    traverseAST(sf, visitor)
    expect(fns.length).toBe(1)
    expect(fns[0]!.getKind()).toBe(SyntaxKind.ArrowFunction)
  })

  it('calls visitFunction for constructors and methods', () => {
    const sf = makeSource('class A { constructor() {} method() {} }')
    const fns: FunctionLikeNode[] = []
    const visitor: ASTVisitor = {
      visitFunction(node) {
        fns.push(node)
      },
    }

    traverseAST(sf, visitor)
    expect(fns.length).toBe(2) // constructor + method
  })

  it('calls visitIfStatement for if statements', () => {
    const sf = makeSource('if (true) { 1; } else { 2; }')
    let called = false
    const visitor: ASTVisitor = {
      visitIfStatement() {
        called = true
      },
    }

    traverseAST(sf, visitor)
    expect(called).toBe(true)
  })

  it('calls visitLoop for for statements', () => {
    const sf = makeSource('for (let i = 0; i < 10; i++) {}')
    let called = false
    const visitor: ASTVisitor = {
      visitLoop() {
        called = true
      },
    }

    traverseAST(sf, visitor)
    expect(called).toBe(true)
  })

  it('calls visitLoop for while statements', () => {
    const sf = makeSource('while (true) {}')
    let called = false
    const visitor: ASTVisitor = {
      visitLoop() {
        called = true
      },
    }

    traverseAST(sf, visitor)
    expect(called).toBe(true)
  })

  it('calls visitLoop for do-while statements', () => {
    const sf = makeSource('do {} while (true)')
    let called = false
    const visitor: ASTVisitor = {
      visitLoop() {
        called = true
      },
    }

    traverseAST(sf, visitor)
    expect(called).toBe(true)
  })

  it('calls visitLoop for for-in statements', () => {
    const sf = makeSource('for (const k in obj) {}')
    let called = false
    const visitor: ASTVisitor = {
      visitLoop() {
        called = true
      },
    }

    traverseAST(sf, visitor)
    expect(called).toBe(true)
  })

  it('calls visitLoop for for-of statements', () => {
    const sf = makeSource('for (const x of arr) {}')
    let called = false
    const visitor: ASTVisitor = {
      visitLoop() {
        called = true
      },
    }

    traverseAST(sf, visitor)
    expect(called).toBe(true)
  })

  it('calls visitSwitch for switch statements', () => {
    const sf = makeSource('switch (x) { case 1: break; default: break; }')
    let called = false
    const visitor: ASTVisitor = {
      visitSwitch() {
        called = true
      },
    }

    traverseAST(sf, visitor)
    expect(called).toBe(true)
  })

  it('calls visitCase for case clauses', () => {
    const sf = makeSource('switch (x) { case 1: break; default: break; }')
    let caseCount = 0
    const visitor: ASTVisitor = {
      visitCase() {
        caseCount++
      },
    }

    traverseAST(sf, visitor)
    expect(caseCount).toBe(2) // case 1 + default
  })

  it('calls visitCatch for catch clauses', () => {
    const sf = makeSource('try { 1; } catch (e) { 2; }')
    let called = false
    const visitor: ASTVisitor = {
      visitCatch() {
        called = true
      },
    }

    traverseAST(sf, visitor)
    expect(called).toBe(true)
  })

  it('calls visitConditional for ternary expressions', () => {
    const sf = makeSource('const x = true ? 1 : 2')
    let called = false
    const visitor: ASTVisitor = {
      visitConditional() {
        called = true
      },
    }

    traverseAST(sf, visitor)
    expect(called).toBe(true)
  })

  it('calls visitBinaryExpression for binary expressions', () => {
    const sf = makeSource('const x = a + b')
    let called = false
    const visitor: ASTVisitor = {
      visitBinaryExpression() {
        called = true
      },
    }

    traverseAST(sf, visitor)
    expect(called).toBe(true)
  })

  it('calls exitNode after visiting children', () => {
    const sf = makeSource('const x = 1;')
    const order: string[] = []
    const visitor: ASTVisitor = {
      visitNode(node) {
        if (TsNode.isSourceFile(node)) {
          order.push('visit-sourcefile')
        }
      },
      exitNode(node) {
        if (TsNode.isSourceFile(node)) {
          order.push('exit-sourcefile')
        }
      },
    }

    traverseAST(sf, visitor)
    expect(order).toEqual(['visit-sourcefile', 'exit-sourcefile'])
  })

  it('collects violations via addViolation', () => {
    const sf = makeSource('function foo() {}')
    const violations: RuleViolation[] = []
    const visitor: ASTVisitor = {
      visitFunction(node, ctx) {
        violations.push(makeViolation(node, ctx))
      },
    }

    traverseAST(sf, visitor, violations)
    expect(violations.length).toBe(1)
    expect(violations[0]!.ruleId).toBe('test-rule')
    expect(violations[0]!.filePath).toContain('test.ts')
  })

  it('tracks depth correctly', () => {
    const sf = makeSource('function foo() { if (true) { 1; } }')
    const depths: number[] = []
    const visitor: ASTVisitor = {
      visitNode(_node, ctx) {
        depths.push(ctx.depth)
      },
    }

    traverseAST(sf, visitor)
    // SourceFile is at depth 0
    expect(depths[0]).toBe(0)
    // Deeper nodes should have increasing depth
    expect(depths.length).toBeGreaterThan(1)
    const maxDepth = Math.max(...depths)
    expect(maxDepth).toBeGreaterThan(0)
  })

  it('getFilePath returns correct path', () => {
    const sf = makeSource('const x = 1;', 'my-file.ts')
    let filePath = ''
    const visitor: ASTVisitor = {
      visitSourceFile(_node, ctx) {
        filePath = ctx.getFilePath()
      },
    }

    traverseAST(sf, visitor)
    expect(filePath).toContain('my-file.ts')
  })

  it('provides parent node in context', () => {
    const sf = makeSource('function foo() {}')
    const parents: TsNode[] = []
    const visitor: ASTVisitor = {
      visitFunction(node, ctx) {
        parents.push(ctx.parent)
      },
    }

    traverseAST(sf, visitor)
    expect(parents.length).toBe(1)
    // The parent parameter in context is the node itself for the visit call
    expect(parents[0]).toBeDefined()
  })

  it('respects MAX_TRAVERSAL_DEPTH (200) — deep nesting stops at depth 200', () => {
    // Build a deeply nested expression: (((...(((1)))...)))
    const depth = 220
    const code = '('.repeat(depth) + '1' + ')'.repeat(depth)
    const sf = makeSource(code)
    const visitedDepths: number[] = []
    const visitor: ASTVisitor = {
      visitNode(_node, ctx) {
        visitedDepths.push(ctx.depth)
      },
    }

    traverseAST(sf, visitor)
    const maxVisited = Math.max(...visitedDepths)
    expect(maxVisited).toBeLessThanOrEqual(201) // depth 0..200 + 1 for going beyond
  })

  it('handles a complex file with many node types', () => {
    const code = `
function top() {
  if (true) {
    for (let i = 0; i < 10; i++) {}
    while (false) {}
    switch (1) {
      case 1: break;
      default: break;
    }
  }
  try {
    const x = a ? 1 : 2;
  } catch (e) {
    const y = a + b;
  }
  return () => true;
}
class Foo {
  constructor() {}
  method() {}
  get val() { return 1; }
  set val(v: number) {}
}
const arrow = () => 42;
`
    const sf = makeSource(code)
    const counts = {
      functions: 0,
      ifStmts: 0,
      loops: 0,
      switches: 0,
      cases: 0,
      catches: 0,
      conditionals: 0,
      binary: 0,
    }
    const visitor: ASTVisitor = {
      visitFunction() { counts.functions++ },
      visitIfStatement() { counts.ifStmts++ },
      visitLoop() { counts.loops++ },
      visitSwitch() { counts.switches++ },
      visitCase() { counts.cases++ },
      visitCatch() { counts.catches++ },
      visitConditional() { counts.conditionals++ },
      visitBinaryExpression() { counts.binary++ },
    }

    traverseAST(sf, visitor)

    // top, arrow, constructor, method, getter, setter, arrow (return)
    expect(counts.functions).toBeGreaterThanOrEqual(5)
    expect(counts.ifStmts).toBeGreaterThanOrEqual(1)
    expect(counts.loops).toBeGreaterThanOrEqual(2) // for + while
    expect(counts.switches).toBeGreaterThanOrEqual(1)
    expect(counts.cases).toBeGreaterThanOrEqual(2) // case + default
    expect(counts.catches).toBeGreaterThanOrEqual(1)
    expect(counts.conditionals).toBeGreaterThanOrEqual(1)
    expect(counts.binary).toBeGreaterThanOrEqual(1)
  })

  it('defaults violations to empty array when not provided', () => {
    const sf = makeSource('const x = 1;')
    // Should not throw
    const visitor: ASTVisitor = {
      visitNode() {},
    }
    expect(() => traverseAST(sf, visitor)).not.toThrow()
  })
})

// ─── traverseASTMultiple ─────────────────────────────────
describe('traverseASTMultiple', () => {
  it('does nothing for empty visitors array', () => {
    const sf = makeSource('function foo() {}')
    const violations: RuleViolation[] = []
    traverseASTMultiple(sf, [], violations)
    expect(violations.length).toBe(0)
  })

  it('delegates to traverseAST for a single visitor', () => {
    const sf = makeSource('function foo() {}')
    let called = false
    const visitor: ASTVisitor = {
      visitFunction() { called = true },
    }

    traverseASTMultiple(sf, [visitor])
    expect(called).toBe(true)
  })

  it('calls all visitors for matching nodes', () => {
    const sf = makeSource('function foo() {}')
    let v1Called = false
    let v2Called = false
    const visitor1: ASTVisitor = {
      visitFunction() { v1Called = true },
    }
    const visitor2: ASTVisitor = {
      visitFunction() { v2Called = true },
    }

    traverseASTMultiple(sf, [visitor1, visitor2])
    expect(v1Called).toBe(true)
    expect(v2Called).toBe(true)
  })

  it('collects violations from all visitors', () => {
    const sf = makeSource('function foo() { const x = a + b; }')
    const violations: RuleViolation[] = []

    const visitor1: ASTVisitor = {
      visitFunction(node, ctx) {
        violations.push({
          filePath: ctx.getFilePath(),
          message: 'v1 violation',
          range: getNodeRange(node),
          ruleId: 'rule-1',
          severity: 'warning',
        })
      },
    }

    const visitor2: ASTVisitor = {
      visitBinaryExpression(node, ctx) {
        violations.push({
          filePath: ctx.getFilePath(),
          message: 'v2 violation',
          range: getNodeRange(node),
          ruleId: 'rule-2',
          severity: 'error',
        })
      },
    }

    traverseASTMultiple(sf, [visitor1, visitor2], violations)
    expect(violations.length).toBe(2)
    expect(violations.find(v => v.ruleId === 'rule-1')).toBeDefined()
    expect(violations.find(v => v.ruleId === 'rule-2')).toBeDefined()
  })

  it('only calls visitors that implement a specific callback', () => {
    const sf = makeSource('if (true) {} function foo() {}')
    let ifCalled = false
    let fnCalled = false

    const ifVisitor: ASTVisitor = {
      visitIfStatement() { ifCalled = true },
    }

    const fnVisitor: ASTVisitor = {
      visitFunction() { fnCalled = true },
    }

    traverseASTMultiple(sf, [ifVisitor, fnVisitor])
    expect(ifCalled).toBe(true)
    expect(fnCalled).toBe(true)
  })

  it('exitNode is called for all visitors that implement it', () => {
    const sf = makeSource('const x = 1;')
    let exit1 = false
    let exit2 = false

    const v1: ASTVisitor = {
      exitNode(_node) { exit1 = true },
    }

    const v2: ASTVisitor = {
      exitNode(_node) { exit2 = true },
    }

    traverseASTMultiple(sf, [v1, v2])
    expect(exit1).toBe(true)
    expect(exit2).toBe(true)
  })

  it('visitNode is called for every node across all visitors implementing it', () => {
    const sf = makeSource('const x = 1; const y = 2;')
    let count1 = 0
    let count2 = 0

    const v1: ASTVisitor = { visitNode() { count1++ } }
    const v2: ASTVisitor = { visitNode() { count2++ } }

    traverseASTMultiple(sf, [v1, v2])
    expect(count1).toBeGreaterThan(0)
    expect(count1).toBe(count2) // both should see same number of nodes
  })

  it('provides correct depth in context for multi-visitor', () => {
    const sf = makeSource('function foo() {}')
    const depths: number[] = []

    const visitor: ASTVisitor = {
      visitSourceFile(_node, ctx) { depths.push(ctx.depth) },
      visitFunction(_node, ctx) { depths.push(ctx.depth) },
    }

    traverseASTMultiple(sf, [visitor])
    expect(depths).toContain(0) // SourceFile at depth 0
    expect(depths.length).toBe(2)
  })

  it('getFilePath returns correct path in multi-visitor', () => {
    const sf = makeSource('const x = 1;', 'multi-test.ts')
    let filePath = ''

    const visitor: ASTVisitor = {
      visitSourceFile(_node, ctx) { filePath = ctx.getFilePath() },
    }

    traverseASTMultiple(sf, [visitor])
    expect(filePath).toContain('multi-test.ts')
  })
})

// ─── Type exports ────────────────────────────────────────
describe('Type exports', () => {
  it('Node is re-exported from ts-morph', () => {
    expect(Node).toBeDefined()
    // Node should have static type-check methods from ts-morph
    expect(typeof Node.isSourceFile).toBe('function')
    expect(typeof Node.isFunctionDeclaration).toBe('function')
  })

  it('Position type is usable with correct shape', () => {
    const pos: Position = { line: 1, column: 5 }
    expect(pos.line).toBe(1)
    expect(pos.column).toBe(5)
  })

  it('Range type is usable with correct shape', () => {
    const range: Range = {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 10 },
    }
    expect(range.start.line).toBe(1)
    expect(range.end.column).toBe(10)
  })

  it('RuleViolation type is usable with correct shape', () => {
    const violation: RuleViolation = {
      filePath: '/test.ts',
      message: 'test',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
      ruleId: 'test-rule',
      severity: 'error',
    }
    expect(violation.severity).toBe('error')

    const withSuggestion: RuleViolation = {
      ...violation,
      suggestion: 'fix it',
    }
    expect(withSuggestion.suggestion).toBe('fix it')
  })

  it('VisitorContext type is usable with correct shape', () => {
    const sf = makeSource('const x = 1;')
    const ctx: VisitorContext = {
      addViolation() {},
      depth: 0,
      getFilePath: () => 'test.ts',
      parent: undefined,
      sourceFile: sf,
    }
    expect(ctx.depth).toBe(0)
    expect(ctx.getFilePath()).toBe('test.ts')
    expect(ctx.sourceFile).toBe(sf)
  })

  it('ASTVisitor type accepts partial visitor objects', () => {
    const emptyVisitor: ASTVisitor = {}
    expect(Object.keys(emptyVisitor).length).toBe(0)

    const partialVisitor: ASTVisitor = {
      visitNode() {},
      visitFunction() {},
    }
    expect(typeof partialVisitor.visitNode).toBe('function')
    expect(typeof partialVisitor.visitFunction).toBe('function')
  })
})
