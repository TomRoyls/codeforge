import { Node, Project, SyntaxKind } from 'ts-morph'
import { describe, expect, it } from 'vitest'

import {
  getFunctionName,
  getNodePosition,
  getNodeRange,
  isFunctionLike,
  traverseAST,
  traverseASTMultiple,
  type ASTVisitor,
  type RuleViolation,
} from '../../src/ast/visitor.js'

function createProject(): Project {
  return new Project({ useInMemoryFileSystem: true })
}

function makeViolation(partial: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: '/test.ts',
    message: 'test violation',
    range: {
      end: { column: 1, line: 1 },
      start: { column: 0, line: 1 },
    },
    ruleId: 'test-rule',
    severity: 'error',
    ...partial,
  }
}

// ─── isFunctionLike ───

describe('isFunctionLike', () => {
  it('returns true for FunctionDeclaration', () => {
    const project = createProject()
    const sf = project.createSourceFile('fn-decl.ts', 'function foo() {}')
    const fn = sf.getFirstDescendantByKindOrThrow(SyntaxKind.FunctionDeclaration)
    expect(isFunctionLike(fn)).toBe(true)
  })

  it('returns true for ArrowFunction', () => {
    const project = createProject()
    const sf = project.createSourceFile('arrow.ts', 'const x = () => 1;')
    const arrow = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ArrowFunction)
    expect(isFunctionLike(arrow)).toBe(true)
  })

  it('returns true for MethodDeclaration', () => {
    const project = createProject()
    const sf = project.createSourceFile('method.ts', 'class A { bar() {} }')
    const method = sf.getFirstDescendantByKindOrThrow(SyntaxKind.MethodDeclaration)
    expect(isFunctionLike(method)).toBe(true)
  })

  it('returns true for Constructor', () => {
    const project = createProject()
    const sf = project.createSourceFile('ctor.ts', 'class A { constructor() {} }')
    const ctor = sf.getFirstDescendantByKindOrThrow(SyntaxKind.Constructor)
    expect(isFunctionLike(ctor)).toBe(true)
  })

  it('returns true for GetAccessor', () => {
    const project = createProject()
    const sf = project.createSourceFile('getter.ts', 'class A { get x() { return 1; } }')
    const getter = sf.getFirstDescendantByKindOrThrow(SyntaxKind.GetAccessor)
    expect(isFunctionLike(getter)).toBe(true)
  })

  it('returns true for SetAccessor', () => {
    const project = createProject()
    const sf = project.createSourceFile('setter.ts', 'class A { set x(v: number) {} }')
    const setter = sf.getFirstDescendantByKindOrThrow(SyntaxKind.SetAccessor)
    expect(isFunctionLike(setter)).toBe(true)
  })

  it('returns false for Identifier', () => {
    const project = createProject()
    const sf = project.createSourceFile('ident.ts', 'const x = 1;')
    const id = sf.getFirstDescendantByKindOrThrow(SyntaxKind.Identifier)
    expect(isFunctionLike(id)).toBe(false)
  })

  it('returns false for StringLiteral', () => {
    const project = createProject()
    const sf = project.createSourceFile('str.ts', "const x = 'hello';")
    const str = sf.getFirstDescendantByKindOrThrow(SyntaxKind.StringLiteral)
    expect(isFunctionLike(str)).toBe(false)
  })

  it('returns false for IfStatement', () => {
    const project = createProject()
    const sf = project.createSourceFile('if.ts', 'if (true) {}')
    const ifStmt = sf.getFirstDescendantByKindOrThrow(SyntaxKind.IfStatement)
    expect(isFunctionLike(ifStmt)).toBe(false)
  })
})

// ─── getNodePosition ───

describe('getNodePosition', () => {
  it('returns correct {line, column} for a node', () => {
    const project = createProject()
    const sf = project.createSourceFile('pos.ts', 'const x = 1;')
    const decl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.VariableDeclaration)
    const pos = getNodePosition(decl)
    expect(pos.line).toBeGreaterThanOrEqual(1)
    expect(pos.column).toBeGreaterThanOrEqual(0)
  })

  it('returns 1-based line numbers', () => {
    const project = createProject()
    const sf = project.createSourceFile('lines.ts', 'const a = 1;\nconst b = 2;')
    const decls = sf.getDescendantsOfKind(SyntaxKind.VariableDeclaration)
    const b = decls[1]!
    const pos = getNodePosition(b)
    expect(pos.line).toBe(2)
  })
})

// ─── getNodeRange ───

describe('getNodeRange', () => {
  it('returns correct start and end positions', () => {
    const project = createProject()
    const sf = project.createSourceFile('range.ts', 'const x = 1;')
    const decl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.VariableDeclaration)
    const range = getNodeRange(decl)
    expect(range.start.line).toBeLessThanOrEqual(range.end.line)
    expect(typeof range.start.column).toBe('number')
    expect(typeof range.end.column).toBe('number')
  })

  it('both start and end have line and column', () => {
    const project = createProject()
    const sf = project.createSourceFile('range2.ts', 'function foo() { return 1; }')
    const fn = sf.getFirstDescendantByKindOrThrow(SyntaxKind.FunctionDeclaration)
    const range = getNodeRange(fn)
    expect(range).toHaveProperty('start.line')
    expect(range).toHaveProperty('start.column')
    expect(range).toHaveProperty('end.line')
    expect(range).toHaveProperty('end.column')
  })
})

// ─── getFunctionName ───

describe('getFunctionName', () => {
  it('named function declaration returns the name', () => {
    const project = createProject()
    const sf = project.createSourceFile('gfn1.ts', 'function myFunc() {}')
    const fn = sf.getFirstDescendantByKindOrThrow(SyntaxKind.FunctionDeclaration)
    expect(getFunctionName(fn)).toBe('myFunc')
  })

  it('arrow function assigned to variable returns variable name', () => {
    const project = createProject()
    const sf = project.createSourceFile('gfn2.ts', 'const myArrow = () => 1;')
    const arrow = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ArrowFunction)
    expect(getFunctionName(arrow)).toBe('myArrow')
  })

  it('method in class returns ClassName.methodName', () => {
    const project = createProject()
    const sf = project.createSourceFile('gfn3.ts', 'class MyClass { myMethod() {} }')
    const method = sf.getFirstDescendantByKindOrThrow(SyntaxKind.MethodDeclaration)
    expect(getFunctionName(method)).toBe('MyClass.myMethod')
  })

  it('constructor returns constructor (ClassName)', () => {
    const project = createProject()
    const sf = project.createSourceFile('gfn4.ts', 'class Foo { constructor() {} }')
    const ctor = sf.getFirstDescendantByKindOrThrow(SyntaxKind.Constructor)
    expect(getFunctionName(ctor)).toBe('constructor (Foo)')
  })

  it('arrow function not assigned to variable returns arrow function', () => {
    const project = createProject()
    const sf = project.createSourceFile('gfn5.ts', '(() => 1);')
    const arrow = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ArrowFunction)
    expect(getFunctionName(arrow)).toBe('arrow function')
  })

  it('get accessor returns get accessorName', () => {
    const project = createProject()
    const sf = project.createSourceFile('gfn6.ts', 'class A { get value() { return 1; } }')
    const getter = sf.getFirstDescendantByKindOrThrow(SyntaxKind.GetAccessor)
    expect(getFunctionName(getter)).toBe('get value')
  })

  it('set accessor returns set accessorName', () => {
    const project = createProject()
    const sf = project.createSourceFile('gfn7.ts', 'class A { set value(v: number) {} }')
    const setter = sf.getFirstDescendantByKindOrThrow(SyntaxKind.SetAccessor)
    expect(getFunctionName(setter)).toBe('set value')
  })
})

// ─── traverseAST ───

describe('traverseAST', () => {
  it('calls visitNode for every node', () => {
    const project = createProject()
    const sf = project.createSourceFile('traverse1.ts', 'const x = 1;')
    const visited: Node[] = []
    const visitor: ASTVisitor = {
      visitNode(node) {
        visited.push(node)
      },
    }
    traverseAST(sf, visitor)
    expect(visited.length).toBeGreaterThan(0)
  })

  it('calls visitSourceFile for the root', () => {
    const project = createProject()
    const sf = project.createSourceFile('traverse2.ts', 'const x = 1;')
    let visited = false
    const visitor: ASTVisitor = {
      visitSourceFile() {
        visited = true
      },
    }
    traverseAST(sf, visitor)
    expect(visited).toBe(true)
  })

  it('calls visitFunction for function nodes', () => {
    const project = createProject()
    const sf = project.createSourceFile('traverse3.ts', 'function foo() {}')
    let visited = false
    const visitor: ASTVisitor = {
      visitFunction() {
        visited = true
      },
    }
    traverseAST(sf, visitor)
    expect(visited).toBe(true)
  })

  it('calls visitIfStatement for if statements', () => {
    const project = createProject()
    const sf = project.createSourceFile('traverse4.ts', 'if (true) {}')
    let visited = false
    const visitor: ASTVisitor = {
      visitIfStatement() {
        visited = true
      },
    }
    traverseAST(sf, visitor)
    expect(visited).toBe(true)
  })

  it('calls visitLoop for for/while/do-while/for-in/for-of', () => {
    const project = createProject()
    const code = [
      'for (let i = 0; i < 10; i++) {}',
      'for (const x of []) {}',
      'for (const x in {}) {}',
      'while (false) {}',
      'do {} while (false);',
    ].join('\n')
    const sf = project.createSourceFile('traverse5.ts', code)
    let loopCount = 0
    const visitor: ASTVisitor = {
      visitLoop() {
        loopCount++
      },
    }
    traverseAST(sf, visitor)
    expect(loopCount).toBe(5)
  })

  it('calls exitNode after visiting children (post-order)', () => {
    const project = createProject()
    const sf = project.createSourceFile('traverse6.ts', 'const x = 1;')
    const order: string[] = []
    const visitor: ASTVisitor = {
      visitNode(node) {
        order.push(`enter:${node.getKindName()}`)
      },
      exitNode(node) {
        order.push(`exit:${node.getKindName()}`)
      },
    }
    traverseAST(sf, visitor)
    const firstEnter = order[0]!
    const kindName = firstEnter.split(':')[1]!
    const firstExit = order.find((o) => o === `exit:${kindName}`)
    expect(firstExit).toBeDefined()
    expect(order.indexOf(firstEnter)).toBeLessThan(order.indexOf(firstExit!))
  })

  it('stops at MAX_TRAVERSAL_DEPTH', () => {
    const project = createProject()
    const depth = 210
    const code = '{'.repeat(depth) + '1' + '}'.repeat(depth)
    const sf = project.createSourceFile('traverse7.ts', code)
    let maxDepth = 0
    const visitor: ASTVisitor = {
      visitNode(_node, ctx) {
        if (ctx.depth > maxDepth) maxDepth = ctx.depth
      },
    }
    traverseAST(sf, visitor)
    expect(maxDepth).toBeLessThanOrEqual(201)
  })

  it('addViolation pushes to violations array', () => {
    const project = createProject()
    const sf = project.createSourceFile('traverse8.ts', 'const x = 1;')
    const violations: RuleViolation[] = []
    const violation = makeViolation()
    const visitor: ASTVisitor = {
      visitNode(_node, ctx) {
        ctx.addViolation(violation)
      },
    }
    traverseAST(sf, visitor, violations)
    expect(violations.length).toBeGreaterThan(0)
    expect(violations[0]).toEqual(violation)
  })

  it('context.getFilePath() returns correct path', () => {
    const project = createProject()
    const sf = project.createSourceFile('/some/path/test.ts', 'const x = 1;')
    let filePath = ''
    const visitor: ASTVisitor = {
      visitSourceFile(_node, ctx) {
        filePath = ctx.getFilePath()
      },
    }
    traverseAST(sf, visitor)
    expect(filePath).toBe('/some/path/test.ts')
  })

  it('context.depth increments for nested nodes', () => {
    const project = createProject()
    const sf = project.createSourceFile(
      'traverse10.ts',
      'function foo() { function bar() {} }',
    )
    const depths: number[] = []
    const visitor: ASTVisitor = {
      visitFunction(_node, ctx) {
        depths.push(ctx.depth)
      },
    }
    traverseAST(sf, visitor)
    expect(depths.length).toBe(2)
    expect(depths[0]!).toBeLessThan(depths[1]!)
  })

  it('context.parent is set correctly', () => {
    const project = createProject()
    const sf = project.createSourceFile('traverse11.ts', 'const x = 1;')
    let sourceFileParent: Node | undefined
    const visitor: ASTVisitor = {
      visitSourceFile(_node, ctx) {
        sourceFileParent = ctx.parent
      },
    }
    traverseAST(sf, visitor)
    expect(sourceFileParent).toBeDefined()
    expect(Node.isSourceFile(sourceFileParent!)).toBe(true)
  })
})

// ─── traverseASTMultiple ───

describe('traverseASTMultiple', () => {
  it('empty visitors array produces no traversal', () => {
    const project = createProject()
    const sf = project.createSourceFile('multi1.ts', 'const x = 1;')
    let called = false
    const visitor: ASTVisitor = {
      visitNode() {
        called = true
      },
    }
    traverseASTMultiple(sf, [], [])
    expect(called).toBe(false)
  })

  it('single visitor delegates to traverseAST', () => {
    const project = createProject()
    const sf = project.createSourceFile('multi2.ts', 'const x = 1;')
    const violations: RuleViolation[] = []
    let count = 0
    const visitor: ASTVisitor = {
      visitNode() {
        count++
      },
    }
    traverseASTMultiple(sf, [visitor], violations)
    expect(count).toBeGreaterThan(0)
  })

  it('multiple visitors all receive callbacks', () => {
    const project = createProject()
    const sf = project.createSourceFile('multi3.ts', 'function foo() {}')
    const counts = [0, 0, 0]
    const visitors: ASTVisitor[] = [
      { visitFunction() { counts[0]!++ } },
      { visitFunction() { counts[1]!++ } },
      { visitFunction() { counts[2]!++ } },
    ]
    traverseASTMultiple(sf, visitors)
    expect(counts[0]).toBe(1)
    expect(counts[1]).toBe(1)
    expect(counts[2]).toBe(1)
  })

  it('each visitor can add violations independently', () => {
    const project = createProject()
    const sf = project.createSourceFile('multi4.ts', 'const x = 1;')
    const violations: RuleViolation[] = []
    const visitors: ASTVisitor[] = [
      {
        visitSourceFile(_node, ctx) {
          ctx.addViolation(makeViolation({ ruleId: 'rule-a' }))
        },
      },
      {
        visitSourceFile(_node, ctx) {
          ctx.addViolation(makeViolation({ ruleId: 'rule-b' }))
        },
      },
    ]
    traverseASTMultiple(sf, visitors, violations)
    expect(violations).toHaveLength(2)
    expect(violations[0]!.ruleId).toBe('rule-a')
    expect(violations[1]!.ruleId).toBe('rule-b')
  })
})
