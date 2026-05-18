import { describe, expect, it } from 'vitest'

import type { RuleViolation } from '../../src/ast/visitor.js'

import { maxComplexityRule } from '../../src/rules/complexity/max-complexity.js'
import { maxDepthRule } from '../../src/rules/complexity/max-depth.js'
import { maxLinesPerFunctionRule, maxLinesRule } from '../../src/rules/complexity/max-lines.js'
import { maxNestedCallbacksRule } from '../../src/rules/complexity/max-nested-callbacks.js'
import { maxParamsRule } from '../../src/rules/complexity/max-params.js'

// ─── SyntaxKind constants (matching ts-morph's bundled TypeScript) ───

const SK = {
  AmpersandAmpersandToken: 56,
  ArrowFunction: 219,
  BarBarToken: 57,
  BinaryExpression: 226,
  Block: 241,
  CaseClause: 296,
  CatchClause: 299,
  ConditionalExpression: 227,
  Constructor: 176,
  DoStatement: 246,
  ForInStatement: 249,
  ForOfStatement: 250,
  ForStatement: 248,
  FunctionDeclaration: 262,
  FunctionExpression: 218,
  GetAccessor: 177,
  IfStatement: 245,
  MethodDeclaration: 174,
  SetAccessor: 178,
  SwitchStatement: 255,
  TryStatement: 258,
  WhileStatement: 247,
} as const

// ─── Mock factories ───

type MockNode = Record<string, unknown>

/** Loose visitor type so we can invoke handlers with mock nodes. */
type LooseVisitor = Record<string, ((...args: unknown[]) => void) | undefined>

function looseVisitor(v: unknown): LooseVisitor {
  return v as unknown as LooseVisitor
}

function createSourceFileMock(overrides: MockNode = {}): MockNode {
  const mock: MockNode = {
    getDescendants: () => [],
    getEnd: () => 100,
    getFilePath: () => 'test.ts',
    getFullText: () => '',
    getLineAndColumnAtPos: (_pos: number) => ({ column: 0, line: 1 }),
    getStart: () => 0,
    ...overrides,
  }
  // SourceFile.getSourceFile() returns itself
  mock.getSourceFile = () => mock
  return mock
}

function createFunctionNodeMock(overrides: MockNode = {}): MockNode {
  const sf = createSourceFileMock()
  return {
    getEnd: () => 100,
    getKind: () => SK.FunctionDeclaration,
    getName: () => 'testFunc',
    getParameters: () => [],
    getParent: () => ({}),
    getSourceFile: () => sf,
    getStart: () => 0,
    forEachChild: (_cb: (child: MockNode) => void) => {},
    ...overrides,
  }
}

/** Build a chain of `levels` nodes, each nesting the next. */
function createNestedChain(levels: number, kind: number): MockNode {
  return {
    getKind: () => kind,
    forEachChild: (cb: (child: MockNode) => void) => {
      if (levels > 1) {
        cb(createNestedChain(levels - 1, kind))
      }
    },
  }
}

/** Build a flat list of leaf nodes with the given kinds. */
function createFlatChildren(kinds: number[]): MockNode[] {
  return kinds.map((kind) => ({
    getKind: () => kind,
    forEachChild: (_cb: (child: MockNode) => void) => {},
  }))
}

// ─── max-params rule ───

describe('max-params rule', () => {
  it('reports when params exceed default max (4)', () => {
    const result = maxParamsRule.create({})
    const visitor = looseVisitor(result.visitor)
    const params = Array.from({ length: 5 }, () => ({}))

    visitor.visitFunction!(createFunctionNodeMock({ getParameters: () => params }))

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('5 parameters')
    expect(violations[0]!.message).toContain('Maximum allowed is 4')
  })

  it('does not report when params equal to default max', () => {
    const result = maxParamsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({ getParameters: () => Array.from({ length: 4 }, () => ({})) }),
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when params below default max', () => {
    const result = maxParamsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(createFunctionNodeMock({ getParameters: () => [{}, {}] }))

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports with custom max option', () => {
    const result = maxParamsRule.create({ max: 2 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(createFunctionNodeMock({ getParameters: () => [{}, {}, {}] }))

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('3 parameters')
    expect(violations[0]!.message).toContain('Maximum allowed is 2')
  })

  it('does not report with custom max when at limit', () => {
    const result = maxParamsRule.create({ max: 2 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(createFunctionNodeMock({ getParameters: () => [{}, {}] }))

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('handles zero params', () => {
    const result = maxParamsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(createFunctionNodeMock({ getParameters: () => [] }))

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('handles missing getParameters method', () => {
    const result = maxParamsRule.create({})
    const visitor = looseVisitor(result.visitor)
    const sf = createSourceFileMock()
    // Node without getParameters — countParameters returns 0
    const node: MockNode = {
      getEnd: () => 100,
      getKind: () => SK.FunctionDeclaration,
      getName: () => 'noParams',
      getParent: () => ({}),
      getSourceFile: () => sf,
      getStart: () => 0,
      forEachChild: () => {},
    }

    visitor.visitFunction!(node)

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports for arrow function node', () => {
    const result = maxParamsRule.create({})
    const visitor = looseVisitor(result.visitor)
    const params = Array.from({ length: 5 }, () => ({}))

    visitor.visitFunction!(
      createFunctionNodeMock({
        getKind: () => SK.ArrowFunction,
        getParent: () => ({ getKind: () => 999 }),
        getParameters: () => params,
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('arrow function')
  })

  it('reports for method declaration node', () => {
    const result = maxParamsRule.create({})
    const visitor = looseVisitor(result.visitor)
    const params = Array.from({ length: 5 }, () => ({}))

    visitor.visitFunction!(
      createFunctionNodeMock({
        getKind: () => SK.MethodDeclaration,
        getParent: () => ({ getKind: () => 999 }),
        getParameters: () => params,
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
  })

  it('reports multiple functions independently', () => {
    const result = maxParamsRule.create({ max: 3 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({ getParameters: () => [{}, {}, {}, {}] }),
    )
    visitor.visitFunction!(
      createFunctionNodeMock({ getParameters: () => [{}, {}, {}, {}, {}] }),
    )

    expect(result.onComplete!()).toHaveLength(2)
  })

  it('captures correct rule id and severity', () => {
    const result = maxParamsRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({ getParameters: () => [{}, {}, {}, {}, {}] }),
    )

    const v = result.onComplete!()
    expect(v[0]!.ruleId).toBe('max-params')
    expect(v[0]!.severity).toBe('warning')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(maxParamsRule.meta.category).toBe('complexity')
    expect(maxParamsRule.meta.recommended).toBe(true)
    expect(maxParamsRule.meta.name).toBe('max-params')
    expect(maxParamsRule.meta.fixable).toBe('code')
  })

  it('has correct default options', () => {
    expect(maxParamsRule.defaultOptions.max).toBe(4)
  })
})

// ─── max-lines rule ───

describe('max-lines rule', () => {
  it('reports when file exceeds max lines', () => {
    const lines = Array.from({ length: 11 }, (_, i) => `line${i}`).join('\n')
    const result = maxLinesRule.create({ max: 10 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitSourceFile!(createSourceFileMock({ getFullText: () => lines }))

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('11 lines')
    expect(violations[0]!.message).toContain('Maximum allowed is 10')
  })

  it('does not report when lines equal to max', () => {
    const lines = Array.from({ length: 10 }, (_, i) => `line${i}`).join('\n')
    const result = maxLinesRule.create({ max: 10 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitSourceFile!(createSourceFileMock({ getFullText: () => lines }))

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when lines below max', () => {
    const lines = Array.from({ length: 5 }, (_, i) => `line${i}`).join('\n')
    const result = maxLinesRule.create({ max: 10 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitSourceFile!(createSourceFileMock({ getFullText: () => lines }))

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports with custom max option', () => {
    const result = maxLinesRule.create({ max: 3 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitSourceFile!(createSourceFileMock({ getFullText: () => 'a\nb\nc\nd\ne' }))

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Maximum allowed is 3')
  })

  it('handles single-line file', () => {
    const result = maxLinesRule.create({ max: 10 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitSourceFile!(createSourceFileMock({ getFullText: () => 'single line' }))

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('skips blank lines when option enabled', () => {
    // "a", "", "b", "", "c" → 5 total, 3 non-blank
    const text = 'a\n\nb\n\nc'
    const result = maxLinesRule.create({ max: 3, skipBlankLines: true })
    const visitor = looseVisitor(result.visitor)

    visitor.visitSourceFile!(createSourceFileMock({ getFullText: () => text }))

    // 3 non-blank = max, no violation
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports when non-blank lines exceed max with skipBlankLines', () => {
    // "a", "", "b", "", "c", "", "d" → 7 total, 4 non-blank
    const text = 'a\n\nb\n\nc\n\nd'
    const result = maxLinesRule.create({ max: 3, skipBlankLines: true })
    const visitor = looseVisitor(result.visitor)

    visitor.visitSourceFile!(createSourceFileMock({ getFullText: () => text }))

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('4 lines')
  })

  it('captures correct rule id', () => {
    const result = maxLinesRule.create({ max: 1 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitSourceFile!(createSourceFileMock({ getFullText: () => 'a\nb' }))

    expect(result.onComplete!()[0]!.ruleId).toBe('max-lines')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(maxLinesRule.meta.category).toBe('complexity')
    expect(maxLinesRule.meta.name).toBe('max-lines')
    expect(maxLinesRule.meta.fixable).toBe('code')
    expect(maxLinesRule.meta.recommended).toBe(false)
  })
})

// ─── max-lines-per-function rule ───

describe('max-lines-per-function rule', () => {
  it('reports when function exceeds max lines', () => {
    const result = maxLinesPerFunctionRule.create({ max: 10 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        getStartLineNumber: () => 1,
        getEndLineNumber: () => 15,
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('15 lines')
    expect(violations[0]!.message).toContain('Maximum allowed is 10')
  })

  it('does not report when function lines equal to max', () => {
    const result = maxLinesPerFunctionRule.create({ max: 10 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        getStartLineNumber: () => 1,
        getEndLineNumber: () => 10,
      }),
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report when function lines below max', () => {
    const result = maxLinesPerFunctionRule.create({ max: 10 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        getStartLineNumber: () => 1,
        getEndLineNumber: () => 5,
      }),
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports with custom max option', () => {
    const result = maxLinesPerFunctionRule.create({ max: 5 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        getStartLineNumber: () => 1,
        getEndLineNumber: () => 10,
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Maximum allowed is 5')
  })

  it('reports for single-line function that exceeds max of 0', () => {
    const result = maxLinesPerFunctionRule.create({ max: 0 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        getStartLineNumber: () => 1,
        getEndLineNumber: () => 1,
      }),
    )

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('reports multiple functions independently', () => {
    const result = maxLinesPerFunctionRule.create({ max: 5 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        getName: () => 'funcA',
        getStartLineNumber: () => 1,
        getEndLineNumber: () => 10,
      }),
    )
    visitor.visitFunction!(
      createFunctionNodeMock({
        getName: () => 'funcB',
        getStartLineNumber: () => 11,
        getEndLineNumber: () => 20,
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(2)
    expect(violations[0]!.message).toContain('funcA')
    expect(violations[1]!.message).toContain('funcB')
  })

  it('captures correct rule id', () => {
    const result = maxLinesPerFunctionRule.create({ max: 1 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        getStartLineNumber: () => 1,
        getEndLineNumber: () => 5,
      }),
    )

    expect(result.onComplete!()[0]!.ruleId).toBe('max-lines-per-function')
  })

  it('captures correct severity and suggestion', () => {
    const result = maxLinesPerFunctionRule.create({ max: 1 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        getStartLineNumber: () => 1,
        getEndLineNumber: () => 5,
      }),
    )

    const v = result.onComplete!()
    expect(v[0]!.severity).toBe('warning')
    expect(v[0]!.suggestion).toContain('single-responsibility')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(maxLinesPerFunctionRule.meta.category).toBe('complexity')
    expect(maxLinesPerFunctionRule.meta.name).toBe('max-lines-per-function')
    expect(maxLinesPerFunctionRule.meta.recommended).toBe(true)
    expect(maxLinesPerFunctionRule.meta.fixable).toBe('code')
  })

  it('has correct default options', () => {
    expect(maxLinesPerFunctionRule.defaultOptions.max).toBe(50)
  })
})

// ─── max-depth rule ───

describe('max-depth rule', () => {
  it('reports when nesting depth exceeds default max (4)', () => {
    const result = maxDepthRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(createNestedChain(5, SK.IfStatement))
        },
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('nesting depth of 5')
    expect(violations[0]!.message).toContain('Maximum allowed is 4')
  })

  it('does not report when depth at default max', () => {
    const result = maxDepthRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(createNestedChain(4, SK.IfStatement))
        },
      }),
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report for shallow nesting', () => {
    const result = maxDepthRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(createNestedChain(2, SK.IfStatement))
        },
      }),
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report for zero-depth function', () => {
    const result = maxDepthRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(createFunctionNodeMock())

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports with custom max option', () => {
    const result = maxDepthRule.create({ max: 2 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(createNestedChain(3, SK.IfStatement))
        },
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Maximum allowed is 2')
  })

  it('counts different nesting constructs (for, while, switch)', () => {
    const result = maxDepthRule.create({ max: 3 })
    const visitor = looseVisitor(result.visitor)
    // Chain: for → while → switch → if → depth 4
    const ifNode: MockNode = {
      getKind: () => SK.IfStatement,
      forEachChild: () => {},
    }
    const switchNode: MockNode = {
      getKind: () => SK.SwitchStatement,
      forEachChild: (cb: (child: MockNode) => void) => {
        cb(ifNode)
      },
    }
    const whileNode: MockNode = {
      getKind: () => SK.WhileStatement,
      forEachChild: (cb: (child: MockNode) => void) => {
        cb(switchNode)
      },
    }
    const forNode: MockNode = {
      getKind: () => SK.ForStatement,
      forEachChild: (cb: (child: MockNode) => void) => {
        cb(whileNode)
      },
    }

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(forNode)
        },
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('nesting depth of 4')
  })

  it('does not count non-nesting constructs', () => {
    const result = maxDepthRule.create({ max: 2 })
    const visitor = looseVisitor(result.visitor)
    const nonNesting: MockNode = {
      getKind: () => 999, // not a nesting construct
      forEachChild: () => {},
    }

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(nonNesting)
        },
      }),
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports multiple functions independently', () => {
    const result = maxDepthRule.create({ max: 2 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        getName: () => 'deep',
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(createNestedChain(3, SK.IfStatement))
        },
      }),
    )
    visitor.visitFunction!(
      createFunctionNodeMock({
        getName: () => 'deeper',
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(createNestedChain(4, SK.IfStatement))
        },
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(2)
  })

  it('captures correct rule id and suggestion', () => {
    const result = maxDepthRule.create({ max: 0 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(createNestedChain(1, SK.IfStatement))
        },
      }),
    )

    const v = result.onComplete!()
    expect(v[0]!.ruleId).toBe('max-depth')
    expect(v[0]!.suggestion).toContain('Extract')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(maxDepthRule.meta.category).toBe('complexity')
    expect(maxDepthRule.meta.name).toBe('max-depth')
    expect(maxDepthRule.meta.recommended).toBe(true)
    expect(maxDepthRule.meta.fixable).toBe('code')
  })

  it('has correct default options', () => {
    expect(maxDepthRule.defaultOptions.max).toBe(4)
  })
})

// ─── max-complexity rule ───

describe('max-complexity rule', () => {
  it('reports when complexity exceeds default max (10)', () => {
    const result = maxComplexityRule.create({})
    const visitor = looseVisitor(result.visitor)
    // 11 if statements → complexity 1 + 11 = 12 > 10
    const children = createFlatChildren(Array(11).fill(SK.IfStatement))

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          children.forEach(cb)
        },
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('complexity of 12')
    expect(violations[0]!.message).toContain('Maximum allowed is 10')
  })

  it('does not report when complexity at default max', () => {
    const result = maxComplexityRule.create({})
    const visitor = looseVisitor(result.visitor)
    // 9 if statements → complexity 1 + 9 = 10 = max
    const children = createFlatChildren(Array(9).fill(SK.IfStatement))

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          children.forEach(cb)
        },
      }),
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report for simple function (complexity 1)', () => {
    const result = maxComplexityRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(createFunctionNodeMock())

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports with custom max option', () => {
    const result = maxComplexityRule.create({ max: 3 })
    const visitor = looseVisitor(result.visitor)
    // 4 if statements → complexity 1 + 4 = 5 > 3
    const children = createFlatChildren(Array(4).fill(SK.IfStatement))

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          children.forEach(cb)
        },
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Maximum allowed is 3')
  })

  it('counts loops correctly', () => {
    const result = maxComplexityRule.create({ max: 5 })
    const visitor = looseVisitor(result.visitor)
    // for + while + for-in + for-of + do = 5 branches → complexity 1 + 5 = 6 > 5
    const children = createFlatChildren([
      SK.ForStatement,
      SK.WhileStatement,
      SK.ForInStatement,
      SK.ForOfStatement,
      SK.DoStatement,
    ])

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          children.forEach(cb)
        },
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('complexity of 6')
  })

  it('counts catch clauses', () => {
    const result = maxComplexityRule.create({ max: 3 })
    const visitor = looseVisitor(result.visitor)
    const children = createFlatChildren([
      SK.CatchClause,
      SK.CatchClause,
      SK.CatchClause,
      SK.IfStatement,
    ])

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          children.forEach(cb)
        },
      }),
    )

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('counts conditional expressions', () => {
    const result = maxComplexityRule.create({ max: 3 })
    const visitor = looseVisitor(result.visitor)
    const children = createFlatChildren([
      SK.ConditionalExpression,
      SK.ConditionalExpression,
      SK.ConditionalExpression,
    ])

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          children.forEach(cb)
        },
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('complexity of 4')
  })

  it('counts binary expressions with logical operators', () => {
    const result = maxComplexityRule.create({ max: 3 })
    const visitor = looseVisitor(result.visitor)
    const logicalBinary: MockNode = {
      getKind: () => SK.BinaryExpression,
      getOperatorToken: () => ({ getKind: () => SK.AmpersandAmpersandToken }),
      forEachChild: () => {},
    }

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(logicalBinary)
          cb(logicalBinary)
          cb(logicalBinary)
        },
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('complexity of 4')
  })

  it('does not count binary expressions without logical operators', () => {
    const result = maxComplexityRule.create({ max: 5 })
    const visitor = looseVisitor(result.visitor)
    const plusBinary: MockNode = {
      getKind: () => SK.BinaryExpression,
      getOperatorToken: () => ({ getKind: () => 999 }), // not && or ||
      forEachChild: () => {},
    }

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(plusBinary)
        },
      }),
    )

    // complexity = 1 (base only), no violation
    expect(result.onComplete!()).toHaveLength(0)
  })

  it('counts case clauses', () => {
    const result = maxComplexityRule.create({ max: 4 })
    const visitor = looseVisitor(result.visitor)
    const children = createFlatChildren([
      SK.CaseClause,
      SK.CaseClause,
      SK.CaseClause,
      SK.CaseClause,
    ])

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          children.forEach(cb)
        },
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('complexity of 5')
  })

  it('counts mixed constructs together', () => {
    const result = maxComplexityRule.create({ max: 5 })
    const visitor = looseVisitor(result.visitor)
    const logicalBinary: MockNode = {
      getKind: () => SK.BinaryExpression,
      getOperatorToken: () => ({ getKind: () => SK.BarBarToken }),
      forEachChild: () => {},
    }
    const children = createFlatChildren([
      SK.IfStatement,
      SK.IfStatement,
      SK.ForStatement,
      SK.CaseClause,
    ])

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          children.forEach(cb)
          cb(logicalBinary)
        },
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('complexity of 6')
  })

  it('captures correct rule id and severity', () => {
    const result = maxComplexityRule.create({ max: 1 })
    const visitor = looseVisitor(result.visitor)
    const children = createFlatChildren([SK.IfStatement, SK.IfStatement])

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          children.forEach(cb)
        },
      }),
    )

    const v = result.onComplete!()
    expect(v[0]!.ruleId).toBe('max-complexity')
    expect(v[0]!.severity).toBe('warning')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(maxComplexityRule.meta.category).toBe('complexity')
    expect(maxComplexityRule.meta.name).toBe('max-complexity')
    expect(maxComplexityRule.meta.recommended).toBe(true)
    expect(maxComplexityRule.meta.fixable).toBe('code')
  })

  it('has correct default options', () => {
    expect(maxComplexityRule.defaultOptions.max).toBe(10)
  })
})

// ─── max-nested-callbacks rule ───

describe('max-nested-callbacks rule', () => {
  it('reports when callback depth exceeds default max (4)', () => {
    const result = maxNestedCallbacksRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(createNestedChain(5, SK.ArrowFunction))
        },
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('callback nesting depth of 5')
    expect(violations[0]!.message).toContain('Maximum allowed is 4')
  })

  it('does not report when depth at default max', () => {
    const result = maxNestedCallbacksRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(createNestedChain(4, SK.ArrowFunction))
        },
      }),
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('does not report for zero nesting', () => {
    const result = maxNestedCallbacksRule.create({})
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(createFunctionNodeMock())

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports with custom max option', () => {
    const result = maxNestedCallbacksRule.create({ max: 2 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(createNestedChain(3, SK.ArrowFunction))
        },
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('Maximum allowed is 2')
  })

  it('counts nested function expressions', () => {
    const result = maxNestedCallbacksRule.create({ max: 2 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(createNestedChain(3, SK.FunctionExpression))
        },
      }),
    )

    expect(result.onComplete!()).toHaveLength(1)
  })

  it('does not count non-callback nodes', () => {
    const result = maxNestedCallbacksRule.create({ max: 2 })
    const visitor = looseVisitor(result.visitor)
    const nonCallback: MockNode = {
      getKind: () => 999,
      forEachChild: () => {},
    }

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(nonCallback)
        },
      }),
    )

    expect(result.onComplete!()).toHaveLength(0)
  })

  it('reports multiple functions independently', () => {
    const result = maxNestedCallbacksRule.create({ max: 2 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        getName: () => 'funcA',
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(createNestedChain(3, SK.ArrowFunction))
        },
      }),
    )
    visitor.visitFunction!(
      createFunctionNodeMock({
        getName: () => 'funcB',
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(createNestedChain(4, SK.ArrowFunction))
        },
      }),
    )

    const violations = result.onComplete!()
    expect(violations).toHaveLength(2)
  })

  it('captures correct rule id and suggestion', () => {
    const result = maxNestedCallbacksRule.create({ max: 0 })
    const visitor = looseVisitor(result.visitor)

    visitor.visitFunction!(
      createFunctionNodeMock({
        forEachChild: (cb: (child: MockNode) => void) => {
          cb(createNestedChain(1, SK.ArrowFunction))
        },
      }),
    )

    const v = result.onComplete!()
    expect(v[0]!.ruleId).toBe('max-nested-callbacks')
    expect(v[0]!.suggestion).toContain('async/await')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(maxNestedCallbacksRule.meta.category).toBe('complexity')
    expect(maxNestedCallbacksRule.meta.name).toBe('max-nested-callbacks')
    expect(maxNestedCallbacksRule.meta.recommended).toBe(true)
    expect(maxNestedCallbacksRule.meta.fixable).toBe('code')
  })

  it('has correct default options', () => {
    expect(maxNestedCallbacksRule.defaultOptions.max).toBe(4)
  })
})
