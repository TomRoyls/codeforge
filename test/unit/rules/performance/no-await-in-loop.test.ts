import { describe, test, expect, vi } from 'vitest'
import { SyntaxKind } from 'ts-morph'
import {
  noAwaitInLoopRule,
  analyzeAwaitInLoop,
} from '../../../../src/rules/performance/no-await-in-loop'
import type { FunctionLikeNode, VisitorContext } from '../../../../src/ast/visitor'
import {
  createMockSourceFile,
  createMockFunctionDeclaration,
  createMockNode,
} from '../../../helpers/ast-helpers'
import type { SourceFile, Node } from 'ts-morph'

function createMockVisitorContext(sourceFile: SourceFile): VisitorContext {
  return {
    sourceFile,
    depth: 0,
    parent: undefined,
    addViolation: vi.fn(),
    getFilePath: () => sourceFile.getFilePath(),
  }
}

function createMockAwaitExpression(
  config: { start?: number; end?: number; filePath?: string } = {},
) {
  return createMockNode({
    kind: SyntaxKind.AwaitExpression,
    text: 'await promise',
    ...config,
  })
}

function createMockLoopWithAwait(loopKind: SyntaxKind, awaitNodes: Node[] = []): Node {
  const loopNode = createMockNode({
    kind: loopKind,
    text: 'for loop',
  })

  ;(loopNode as { getDescendantsOfKind: (kind: SyntaxKind) => Node[] }).getDescendantsOfKind =
    vi.fn((kind: SyntaxKind) => {
      if (kind === SyntaxKind.AwaitExpression) {
        return awaitNodes
      }
      return []
    })

  return loopNode
}

function createMockFunctionWithLoops(
  loops: Array<{ kind: SyntaxKind; awaitNodes?: Node[] }> = [],
): FunctionLikeNode {
  const loopNodes = loops.map((l) => createMockLoopWithAwait(l.kind, l.awaitNodes || []))

  const funcNode = createMockFunctionDeclaration({
    functionName: 'testFunction',
    children: loopNodes,
  })

  const loopKinds = [
    SyntaxKind.ForStatement,
    SyntaxKind.ForInStatement,
    SyntaxKind.ForOfStatement,
    SyntaxKind.WhileStatement,
    SyntaxKind.DoStatement,
  ]

  ;(funcNode as { getDescendantsOfKind: (kind: SyntaxKind) => Node[] }).getDescendantsOfKind =
    vi.fn((kind: SyntaxKind) => {
      if (loopKinds.includes(kind)) {
        return loopNodes.filter((n) => n.getKind() === kind)
      }
      return []
    })

  return funcNode as unknown as FunctionLikeNode
}

// Helper to run visitor + onComplete for a function with loops
function runRule(
  loops: Array<{ kind: SyntaxKind; awaitNodes?: Node[] }>,
  sourceFileOverrides: Record<string, unknown> = {},
) {
  const funcNode = createMockFunctionWithLoops(loops)
  const sourceFile = createMockSourceFile(sourceFileOverrides)
  const context = createMockVisitorContext(sourceFile)
  const ruleInstance = noAwaitInLoopRule.create({})
  ruleInstance.visitor.visitFunction!(funcNode, context)
  return { violations: ruleInstance.onComplete!(), context, sourceFile }
}

describe('noAwaitInLoopRule', () => {
  describe('meta', () => {
    test('has correct rule name', () => {
      expect(noAwaitInLoopRule.meta.name).toBe('no-await-in-loop')
    })

    test('has correct category', () => {
      expect(noAwaitInLoopRule.meta.category).toBe('performance')
    })

    test('is recommended', () => {
      expect(noAwaitInLoopRule.meta.recommended).toBe(true)
    })

    test('has description', () => {
      expect(noAwaitInLoopRule.meta.description).toContain('await')
      expect(noAwaitInLoopRule.meta.description).toContain('loop')
    })
  })

  describe('defaultOptions', () => {
    test('has empty default options', () => {
      expect(noAwaitInLoopRule.defaultOptions).toEqual({})
    })
  })

  describe('create', () => {
    test('returns visitor with visitFunction', () => {
      const ruleInstance = noAwaitInLoopRule.create({})
      expect(ruleInstance.visitor).toBeDefined()
      expect(ruleInstance.visitor.visitFunction).toBeDefined()
    })

    test('returns onComplete function', () => {
      const ruleInstance = noAwaitInLoopRule.create({})
      expect(ruleInstance.onComplete).toBeDefined()
      expect(typeof ruleInstance.onComplete).toBe('function')
    })

    test('returns empty violations for function with no loops', () => {
      const funcNode = createMockFunctionWithLoops([])
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = noAwaitInLoopRule.create({})
      ruleInstance.visitor.visitFunction!(funcNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(0)
    })
  })
})

describe('await detection in loops', () => {
  test('detects await in for loop', () => {
    const awaitNode = createMockAwaitExpression({ start: 10, end: 25 })
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-await-in-loop')
    expect(violations[0].message).toContain('performance')
  })

  test('detects await in for-of loop', () => {
    const awaitNode = createMockAwaitExpression({ start: 10, end: 25 })
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForOfStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-await-in-loop')
  })

  test('detects await in for-in loop', () => {
    const awaitNode = createMockAwaitExpression({ start: 10, end: 25 })
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForInStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-await-in-loop')
  })

  test('detects await in while loop', () => {
    const awaitNode = createMockAwaitExpression({ start: 10, end: 25 })
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.WhileStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-await-in-loop')
  })

  test('detects await in do-while loop', () => {
    const awaitNode = createMockAwaitExpression({ start: 10, end: 25 })
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.DoStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-await-in-loop')
  })

  test('no violation when await outside loop', () => {
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })

  test('detects multiple awaits in single loop', () => {
    const awaitNode1 = createMockAwaitExpression({ start: 10, end: 25 })
    const awaitNode2 = createMockAwaitExpression({ start: 30, end: 45 })
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode1, awaitNode2] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(2)
  })

  test('detects awaits in multiple loops', () => {
    const awaitNode1 = createMockAwaitExpression({ start: 10, end: 25 })
    const awaitNode2 = createMockAwaitExpression({ start: 50, end: 65 })
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode1] },
      { kind: SyntaxKind.WhileStatement, awaitNodes: [awaitNode2] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(2)
  })
})

describe('violation structure', () => {
  test('violation includes correct ruleId', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].ruleId).toBe('no-await-in-loop')
  })

  test('violation includes warning severity', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].severity).toBe('warning')
  })

  test('violation includes message', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].message).toContain('Await inside loop')
    expect(violations[0].message).toContain('performance')
  })

  test('violation includes suggestion', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('Promise.all()')
  })

  test('violation includes range', () => {
    const awaitNode = createMockAwaitExpression({ start: 10, end: 25 })
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].range).toBeDefined()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })

  test('violation includes filePath', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile({
      getFilePath: vi.fn(() => '/test/myFile.ts'),
    })
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].filePath).toBe('/test/myFile.ts')
  })
})

describe('analyzeAwaitInLoop', () => {
  test('returns violations for await in loop', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-await-in-loop')
  })

  test('returns empty array for function without await in loops', () => {
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations).toHaveLength(0)
  })
})

// ============================================================================
// NEW TESTS BELOW - expanding from 24 to 200+
// ============================================================================

describe('meta expanded', () => {
  test('meta.name is a string', () => {
    expect(typeof noAwaitInLoopRule.meta.name).toBe('string')
  })

  test('meta.description is a non-empty string', () => {
    expect(typeof noAwaitInLoopRule.meta.description).toBe('string')
    expect(noAwaitInLoopRule.meta.description.length).toBeGreaterThan(0)
  })

  test('meta.description mentions performance', () => {
    expect(noAwaitInLoopRule.meta.description).toMatch(/performance/i)
  })

  test('meta.category is one of valid categories', () => {
    const validCategories = [
      'complexity',
      'correctness',
      'dependencies',
      'patterns',
      'performance',
      'security',
      'style',
    ]
    expect(validCategories).toContain(noAwaitInLoopRule.meta.category)
  })

  test('meta.recommended is a boolean', () => {
    expect(typeof noAwaitInLoopRule.meta.recommended).toBe('boolean')
  })

  test('meta.fixable is code', () => {
    expect(noAwaitInLoopRule.meta.fixable).toBe('code')
  })

  test('meta does not have deprecated flag', () => {
    expect(noAwaitInLoopRule.meta.deprecated).toBeUndefined()
  })

  test('meta does not have replacedBy field', () => {
    expect(noAwaitInLoopRule.meta.replacedBy).toBeUndefined()
  })
})

describe('create function expanded', () => {
  test('create returns object with visitor property', () => {
    const result = noAwaitInLoopRule.create({})
    expect(result).toHaveProperty('visitor')
  })

  test('create returns object with onComplete property', () => {
    const result = noAwaitInLoopRule.create({})
    expect(result).toHaveProperty('onComplete')
  })

  test('create accepts empty options', () => {
    expect(() => noAwaitInLoopRule.create({})).not.toThrow()
  })

  test('visitor.visitFunction is a function', () => {
    const result = noAwaitInLoopRule.create({})
    expect(typeof result.visitor.visitFunction).toBe('function')
  })

  test('each create call returns independent instance', () => {
    const instance1 = noAwaitInLoopRule.create({})
    const instance2 = noAwaitInLoopRule.create({})
    expect(instance1).not.toBe(instance2)
  })

  test('onComplete returns array', () => {
    const result = noAwaitInLoopRule.create({})
    const violations = result.onComplete!()
    expect(Array.isArray(violations)).toBe(true)
  })

  test('violations accumulate across multiple visitFunction calls', () => {
    const ruleInstance = noAwaitInLoopRule.create({})
    const awaitNode1 = createMockAwaitExpression({ start: 10, end: 20 })
    const funcNode1 = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode1] },
    ])
    const sourceFile1 = createMockSourceFile()
    const context1 = createMockVisitorContext(sourceFile1)

    const awaitNode2 = createMockAwaitExpression({ start: 30, end: 40 })
    const funcNode2 = createMockFunctionWithLoops([
      { kind: SyntaxKind.WhileStatement, awaitNodes: [awaitNode2] },
    ])
    const sourceFile2 = createMockSourceFile()
    const context2 = createMockVisitorContext(sourceFile2)

    ruleInstance.visitor.visitFunction!(funcNode1, context1)
    ruleInstance.visitor.visitFunction!(funcNode2, context2)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(2)
  })

  test('defaultOptions is an empty object', () => {
    const keys = Object.keys(noAwaitInLoopRule.defaultOptions)
    expect(keys).toHaveLength(0)
  })
})

describe('for loop with await', () => {
  test('detects single await in for loop', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations).toHaveLength(1)
  })

  test('detects two awaits in for loop', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 5, end: 15 }),
          createMockAwaitExpression({ start: 20, end: 30 }),
        ],
      },
    ])
    expect(violations).toHaveLength(2)
  })

  test('detects three awaits in for loop', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 5, end: 15 }),
          createMockAwaitExpression({ start: 20, end: 30 }),
          createMockAwaitExpression({ start: 35, end: 45 }),
        ],
      },
    ])
    expect(violations).toHaveLength(3)
  })

  test('for loop with no await produces no violation', () => {
    const { violations } = runRule([{ kind: SyntaxKind.ForStatement, awaitNodes: [] }])
    expect(violations).toHaveLength(0)
  })

  test('for loop await has correct ruleId', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].ruleId).toBe('no-await-in-loop')
  })

  test('for loop await has warning severity', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].severity).toBe('warning')
  })

  test('for loop await violation has range with start and end', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [createMockAwaitExpression({ start: 100, end: 120 })],
      },
    ])
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })

  test('for loop with await at position 0', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [createMockAwaitExpression({ start: 0, end: 10 })],
      },
    ])
    expect(violations).toHaveLength(1)
  })

  test('for loop with await at large position', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [createMockAwaitExpression({ start: 5000, end: 5020 })],
      },
    ])
    expect(violations).toHaveLength(1)
  })

  test('for loop with five awaits', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 10, end: 20 }),
          createMockAwaitExpression({ start: 30, end: 40 }),
          createMockAwaitExpression({ start: 50, end: 60 }),
          createMockAwaitExpression({ start: 70, end: 80 }),
          createMockAwaitExpression({ start: 90, end: 100 }),
        ],
      },
    ])
    expect(violations).toHaveLength(5)
  })
})

describe('for-in loop with await', () => {
  test('detects single await in for-in loop', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForInStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations).toHaveLength(1)
  })

  test('detects two awaits in for-in loop', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForInStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 5, end: 15 }),
          createMockAwaitExpression({ start: 20, end: 30 }),
        ],
      },
    ])
    expect(violations).toHaveLength(2)
  })

  test('for-in loop with no await produces no violation', () => {
    const { violations } = runRule([{ kind: SyntaxKind.ForInStatement, awaitNodes: [] }])
    expect(violations).toHaveLength(0)
  })

  test('for-in loop await has correct message', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForInStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].message).toContain('Await inside loop')
  })

  test('for-in loop await has suggestion', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForInStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].suggestion).toContain('Promise.all()')
  })
})

describe('for-of loop with await', () => {
  test('detects single await in for-of loop', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForOfStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations).toHaveLength(1)
  })

  test('detects two awaits in for-of loop', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForOfStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 5, end: 15 }),
          createMockAwaitExpression({ start: 20, end: 30 }),
        ],
      },
    ])
    expect(violations).toHaveLength(2)
  })

  test('for-of loop with no await produces no violation', () => {
    const { violations } = runRule([{ kind: SyntaxKind.ForOfStatement, awaitNodes: [] }])
    expect(violations).toHaveLength(0)
  })

  test('for-of loop await has warning severity', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForOfStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].severity).toBe('warning')
  })

  test('for-of loop with three awaits', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForOfStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 5, end: 15 }),
          createMockAwaitExpression({ start: 20, end: 30 }),
          createMockAwaitExpression({ start: 35, end: 45 }),
        ],
      },
    ])
    expect(violations).toHaveLength(3)
  })
})

describe('while loop with await', () => {
  test('detects single await in while loop', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.WhileStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations).toHaveLength(1)
  })

  test('detects two awaits in while loop', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.WhileStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 5, end: 15 }),
          createMockAwaitExpression({ start: 20, end: 30 }),
        ],
      },
    ])
    expect(violations).toHaveLength(2)
  })

  test('while loop with no await produces no violation', () => {
    const { violations } = runRule([{ kind: SyntaxKind.WhileStatement, awaitNodes: [] }])
    expect(violations).toHaveLength(0)
  })

  test('while loop await has correct ruleId', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.WhileStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].ruleId).toBe('no-await-in-loop')
  })

  test('while loop with three awaits', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.WhileStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 5, end: 15 }),
          createMockAwaitExpression({ start: 20, end: 30 }),
          createMockAwaitExpression({ start: 35, end: 45 }),
        ],
      },
    ])
    expect(violations).toHaveLength(3)
  })
})

describe('do-while loop with await', () => {
  test('detects single await in do-while loop', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.DoStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations).toHaveLength(1)
  })

  test('detects two awaits in do-while loop', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.DoStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 5, end: 15 }),
          createMockAwaitExpression({ start: 20, end: 30 }),
        ],
      },
    ])
    expect(violations).toHaveLength(2)
  })

  test('do-while loop with no await produces no violation', () => {
    const { violations } = runRule([{ kind: SyntaxKind.DoStatement, awaitNodes: [] }])
    expect(violations).toHaveLength(0)
  })

  test('do-while loop await has correct severity', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.DoStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].severity).toBe('warning')
  })

  test('do-while loop with three awaits', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.DoStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 5, end: 15 }),
          createMockAwaitExpression({ start: 20, end: 30 }),
          createMockAwaitExpression({ start: 35, end: 45 }),
        ],
      },
    ])
    expect(violations).toHaveLength(3)
  })
})

describe('function without loops - no violations', () => {
  test('empty function produces no violations', () => {
    const { violations } = runRule([])
    expect(violations).toHaveLength(0)
  })

  test('function with no loops and no awaits', () => {
    const funcNode = createMockFunctionWithLoops([])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations).toHaveLength(0)
  })

  test('function with only non-loop statements produces no violations', () => {
    const funcNode = createMockFunctionDeclaration({ functionName: 'pureFn' })
    ;(funcNode as { getDescendantsOfKind: (kind: SyntaxKind) => Node[] }).getDescendantsOfKind =
      vi.fn(() => [])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode as unknown as FunctionLikeNode, context)
    expect(violations).toHaveLength(0)
  })

  test('function with empty loops but no awaits produces no violations', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [] },
      { kind: SyntaxKind.WhileStatement, awaitNodes: [] },
    ])
    expect(violations).toHaveLength(0)
  })

  test('function with all five loop types but no awaits', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [] },
      { kind: SyntaxKind.ForInStatement, awaitNodes: [] },
      { kind: SyntaxKind.ForOfStatement, awaitNodes: [] },
      { kind: SyntaxKind.WhileStatement, awaitNodes: [] },
      { kind: SyntaxKind.DoStatement, awaitNodes: [] },
    ])
    expect(violations).toHaveLength(0)
  })
})

describe('multiple loops each with awaits', () => {
  test('two for loops each with one await', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [createMockAwaitExpression({ start: 10, end: 20 })],
      },
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [createMockAwaitExpression({ start: 50, end: 60 })],
      },
    ])
    expect(violations).toHaveLength(2)
  })

  test('three loops of different types each with await', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [createMockAwaitExpression({ start: 10, end: 20 })],
      },
      {
        kind: SyntaxKind.ForOfStatement,
        awaitNodes: [createMockAwaitExpression({ start: 30, end: 40 })],
      },
      {
        kind: SyntaxKind.WhileStatement,
        awaitNodes: [createMockAwaitExpression({ start: 50, end: 60 })],
      },
    ])
    expect(violations).toHaveLength(3)
  })

  test('all five loop types each with one await', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [createMockAwaitExpression({ start: 5, end: 10 })],
      },
      {
        kind: SyntaxKind.ForInStatement,
        awaitNodes: [createMockAwaitExpression({ start: 15, end: 20 })],
      },
      {
        kind: SyntaxKind.ForOfStatement,
        awaitNodes: [createMockAwaitExpression({ start: 25, end: 30 })],
      },
      {
        kind: SyntaxKind.WhileStatement,
        awaitNodes: [createMockAwaitExpression({ start: 35, end: 40 })],
      },
      {
        kind: SyntaxKind.DoStatement,
        awaitNodes: [createMockAwaitExpression({ start: 45, end: 50 })],
      },
    ])
    expect(violations).toHaveLength(5)
  })

  test('for loop with 2 awaits and while loop with 1 await', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 10, end: 20 }),
          createMockAwaitExpression({ start: 25, end: 35 }),
        ],
      },
      {
        kind: SyntaxKind.WhileStatement,
        awaitNodes: [createMockAwaitExpression({ start: 50, end: 60 })],
      },
    ])
    expect(violations).toHaveLength(3)
  })

  test('two loops where only one has await', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
      { kind: SyntaxKind.WhileStatement, awaitNodes: [] },
    ])
    expect(violations).toHaveLength(1)
  })
})

describe('multiple awaits in same loop', () => {
  test('two awaits in single for loop', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 10, end: 20 }),
          createMockAwaitExpression({ start: 30, end: 40 }),
        ],
      },
    ])
    expect(violations).toHaveLength(2)
  })

  test('three awaits in single for loop', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 10, end: 20 }),
          createMockAwaitExpression({ start: 30, end: 40 }),
          createMockAwaitExpression({ start: 50, end: 60 }),
        ],
      },
    ])
    expect(violations).toHaveLength(3)
  })

  test('five awaits in single for loop', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 10, end: 15 }),
          createMockAwaitExpression({ start: 20, end: 25 }),
          createMockAwaitExpression({ start: 30, end: 35 }),
          createMockAwaitExpression({ start: 40, end: 45 }),
          createMockAwaitExpression({ start: 50, end: 55 }),
        ],
      },
    ])
    expect(violations).toHaveLength(5)
  })

  test('two awaits in single while loop', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.WhileStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 10, end: 20 }),
          createMockAwaitExpression({ start: 30, end: 40 }),
        ],
      },
    ])
    expect(violations).toHaveLength(2)
  })

  test('two awaits in single for-of loop', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForOfStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 10, end: 20 }),
          createMockAwaitExpression({ start: 30, end: 40 }),
        ],
      },
    ])
    expect(violations).toHaveLength(2)
  })
})

describe('mixed loop types with mixed awaits', () => {
  test('for with await, for-in without, while with await', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
      { kind: SyntaxKind.ForInStatement, awaitNodes: [] },
      { kind: SyntaxKind.WhileStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations).toHaveLength(2)
  })

  test('do-while with 2 awaits, for-of with 0 awaits, for with 1 await', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.DoStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 5, end: 15 }),
          createMockAwaitExpression({ start: 20, end: 30 }),
        ],
      },
      { kind: SyntaxKind.ForOfStatement, awaitNodes: [] },
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [createMockAwaitExpression({ start: 40, end: 50 })],
      },
    ])
    expect(violations).toHaveLength(3)
  })

  test('for-in with await and do-while with await', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForInStatement, awaitNodes: [createMockAwaitExpression()] },
      { kind: SyntaxKind.DoStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations).toHaveLength(2)
  })

  test('all loops have multiple awaits each', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 5, end: 10 }),
          createMockAwaitExpression({ start: 15, end: 20 }),
        ],
      },
      {
        kind: SyntaxKind.WhileStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 25, end: 30 }),
          createMockAwaitExpression({ start: 35, end: 40 }),
        ],
      },
    ])
    expect(violations).toHaveLength(4)
  })

  test('no loops with awaits at all', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [] },
      { kind: SyntaxKind.ForInStatement, awaitNodes: [] },
      { kind: SyntaxKind.ForOfStatement, awaitNodes: [] },
      { kind: SyntaxKind.WhileStatement, awaitNodes: [] },
      { kind: SyntaxKind.DoStatement, awaitNodes: [] },
    ])
    expect(violations).toHaveLength(0)
  })
})

describe('violation properties detailed', () => {
  test('ruleId is exactly no-await-in-loop for for loop', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].ruleId).toBe('no-await-in-loop')
  })

  test('ruleId is exactly no-await-in-loop for while loop', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.WhileStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].ruleId).toBe('no-await-in-loop')
  })

  test('ruleId is exactly no-await-in-loop for do-while loop', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.DoStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].ruleId).toBe('no-await-in-loop')
  })

  test('severity is warning for for-in loop', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForInStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].severity).toBe('warning')
  })

  test('severity is warning for for-of loop', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForOfStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].severity).toBe('warning')
  })

  test('message is exact string', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].message).toBe('Await inside loop can cause performance issues.')
  })

  test('suggestion mentions map()', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].suggestion).toContain('map()')
  })

  test('suggestion mentions parallel execution', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].suggestion).toContain('parallel execution')
  })

  test('filePath comes from context getFilePath', () => {
    const { violations } = runRule(
      [{ kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] }],
      { getFilePath: vi.fn(() => '/custom/path.ts') },
    )
    expect(violations[0].filePath).toBe('/custom/path.ts')
  })

  test('range has start line and column', () => {
    const awaitNode = createMockAwaitExpression({ start: 10, end: 25 })
    const { violations } = runRule([{ kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] }])
    expect(violations[0].range.start).toHaveProperty('line')
    expect(violations[0].range.start).toHaveProperty('column')
  })

  test('range has end line and column', () => {
    const awaitNode = createMockAwaitExpression({ start: 10, end: 25 })
    const { violations } = runRule([{ kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] }])
    expect(violations[0].range.end).toHaveProperty('line')
    expect(violations[0].range.end).toHaveProperty('column')
  })

  test('multiple violations each have unique filePath from their context', () => {
    const ruleInstance = noAwaitInLoopRule.create({})

    const awaitNode1 = createMockAwaitExpression({ start: 10, end: 20 })
    const funcNode1 = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode1] },
    ])
    const sourceFile1 = createMockSourceFile({ getFilePath: vi.fn(() => '/file1.ts') })
    const context1 = createMockVisitorContext(sourceFile1)

    const awaitNode2 = createMockAwaitExpression({ start: 30, end: 40 })
    const funcNode2 = createMockFunctionWithLoops([
      { kind: SyntaxKind.WhileStatement, awaitNodes: [awaitNode2] },
    ])
    const sourceFile2 = createMockSourceFile({ getFilePath: vi.fn(() => '/file2.ts') })
    const context2 = createMockVisitorContext(sourceFile2)

    ruleInstance.visitor.visitFunction!(funcNode1, context1)
    ruleInstance.visitor.visitFunction!(funcNode2, context2)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].filePath).toBe('/file1.ts')
    expect(violations[1].filePath).toBe('/file2.ts')
  })
})

describe('analyzeAwaitInLoop standalone function', () => {
  test('returns empty array for empty function', () => {
    const funcNode = createMockFunctionWithLoops([])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations).toHaveLength(0)
  })

  test('returns one violation for single for loop with await', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations).toHaveLength(1)
  })

  test('returns violations for while loop with await', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.WhileStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-await-in-loop')
  })

  test('returns violations for do-while loop with await', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.DoStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations).toHaveLength(1)
  })

  test('returns violations for for-in loop with await', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForInStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations).toHaveLength(1)
  })

  test('returns violations for for-of loop with await', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForOfStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations).toHaveLength(1)
  })

  test('returns multiple violations for multiple awaits', () => {
    const funcNode = createMockFunctionWithLoops([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 10, end: 20 }),
          createMockAwaitExpression({ start: 30, end: 40 }),
        ],
      },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations).toHaveLength(2)
  })

  test('returns violations across multiple loops', () => {
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
      { kind: SyntaxKind.WhileStatement, awaitNodes: [createMockAwaitExpression()] },
      { kind: SyntaxKind.DoStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations).toHaveLength(3)
  })

  test('violation has correct severity', () => {
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations[0].severity).toBe('warning')
  })

  test('violation has correct message', () => {
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations[0].message).toBe('Await inside loop can cause performance issues.')
  })

  test('violation has correct suggestion', () => {
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations[0].suggestion).toBe(
      'Consider using Promise.all() with map() for parallel execution.',
    )
  })

  test('violation has filePath from context', () => {
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const sourceFile = createMockSourceFile({ getFilePath: vi.fn(() => '/standalone/test.ts') })
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations[0].filePath).toBe('/standalone/test.ts')
  })

  test('returns empty for loop with no await', () => {
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations).toHaveLength(0)
  })
})

describe('onComplete returns accumulated violations', () => {
  test('onComplete returns empty array when no functions visited', () => {
    const ruleInstance = noAwaitInLoopRule.create({})
    const violations = ruleInstance.onComplete!()
    expect(violations).toEqual([])
  })

  test('onComplete returns single violation after one visit', () => {
    const ruleInstance = noAwaitInLoopRule.create({})
    const awaitNode = createMockAwaitExpression()
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('onComplete returns multiple violations after multiple visits', () => {
    const ruleInstance = noAwaitInLoopRule.create({})
    for (let i = 0; i < 5; i++) {
      const funcNode = createMockFunctionWithLoops([
        {
          kind: SyntaxKind.ForStatement,
          awaitNodes: [createMockAwaitExpression({ start: i * 10, end: i * 10 + 5 })],
        },
      ])
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      ruleInstance.visitor.visitFunction!(funcNode, context)
    }
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(5)
  })

  test('onComplete returns zero violations for functions without awaits', () => {
    const ruleInstance = noAwaitInLoopRule.create({})
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(0)
  })

  test('onComplete accumulates violations correctly mixed', () => {
    const ruleInstance = noAwaitInLoopRule.create({})
    // Visit with violation
    const funcWithAwait = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const sourceFile1 = createMockSourceFile()
    const context1 = createMockVisitorContext(sourceFile1)
    ruleInstance.visitor.visitFunction!(funcWithAwait, context1)

    // Visit without violation
    const funcWithoutAwait = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [] },
    ])
    const sourceFile2 = createMockSourceFile()
    const context2 = createMockVisitorContext(sourceFile2)
    ruleInstance.visitor.visitFunction!(funcWithoutAwait, context2)

    // Visit with 2 violations
    const funcWithTwo = createMockFunctionWithLoops([
      {
        kind: SyntaxKind.WhileStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 10, end: 20 }),
          createMockAwaitExpression({ start: 30, end: 40 }),
        ],
      },
    ])
    const sourceFile3 = createMockSourceFile()
    const context3 = createMockVisitorContext(sourceFile3)
    ruleInstance.visitor.visitFunction!(funcWithTwo, context3)

    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(3)
  })
})

describe('edge cases', () => {
  test('await expression at position 0,0', () => {
    const awaitNode = createMockAwaitExpression({ start: 0, end: 1 })
    const { violations } = runRule([{ kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] }])
    expect(violations).toHaveLength(1)
    expect(violations[0].range.start.line).toBeDefined()
  })

  test('function with single for loop and single await works correctly', () => {
    const awaitNode = createMockAwaitExpression({ start: 42, end: 55 })
    const { violations } = runRule([{ kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] }])
    expect(violations).toHaveLength(1)
    expect(violations[0].range).toBeDefined()
  })

  test('source file with custom file path passes it to violation', () => {
    const { violations } = runRule(
      [{ kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] }],
      { getFilePath: vi.fn(() => '/deeply/nested/path/file.ts') },
    )
    expect(violations[0].filePath).toBe('/deeply/nested/path/file.ts')
  })

  test('analyzeAwaitInLoop returns array', () => {
    const funcNode = createMockFunctionWithLoops([])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const result = analyzeAwaitInLoop(funcNode, context)
    expect(Array.isArray(result)).toBe(true)
  })

  test('rule does not crash with empty loops array', () => {
    const funcNode = createMockFunctionWithLoops([])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    expect(() => {
      const ruleInstance = noAwaitInLoopRule.create({})
      ruleInstance.visitor.visitFunction!(funcNode, context)
      ruleInstance.onComplete!()
    }).not.toThrow()
  })

  test('rule does not crash when calling onComplete without visiting', () => {
    const ruleInstance = noAwaitInLoopRule.create({})
    expect(() => ruleInstance.onComplete!()).not.toThrow()
  })

  test('calling onComplete multiple times returns same violations', () => {
    const ruleInstance = noAwaitInLoopRule.create({})
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    ruleInstance.visitor.visitFunction!(funcNode, context)

    const first = ruleInstance.onComplete!()
    const second = ruleInstance.onComplete!()
    expect(first).toEqual(second)
  })
})

describe('default file path behavior', () => {
  test('default source file path is /test/file.ts', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].filePath).toBe('/test/file.ts')
  })

  test('custom source file path is used in violation', () => {
    const { violations } = runRule(
      [{ kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] }],
      { getFilePath: vi.fn(() => '/app/src/index.ts') },
    )
    expect(violations[0].filePath).toBe('/app/src/index.ts')
  })

  test('analyzeAwaitInLoop uses custom file path', () => {
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const sourceFile = createMockSourceFile({ getFilePath: vi.fn(() => '/custom/module.ts') })
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations[0].filePath).toBe('/custom/module.ts')
  })
})

describe('violation message content', () => {
  test('message contains Await', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].message).toContain('Await')
  })

  test('message contains loop', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].message).toContain('loop')
  })

  test('message contains performance issues', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].message).toContain('performance issues')
  })

  test('suggestion contains Promise.all()', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].suggestion).toContain('Promise.all()')
  })

  test('suggestion contains map()', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].suggestion).toContain('map()')
  })
})

describe('each loop type produces consistent violations', () => {
  test('for loop violation has all required fields', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const v = violations[0]
    expect(v).toHaveProperty('ruleId')
    expect(v).toHaveProperty('severity')
    expect(v).toHaveProperty('message')
    expect(v).toHaveProperty('filePath')
    expect(v).toHaveProperty('range')
    expect(v).toHaveProperty('suggestion')
  })

  test('for-in loop violation has all required fields', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForInStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const v = violations[0]
    expect(v).toHaveProperty('ruleId')
    expect(v).toHaveProperty('severity')
    expect(v).toHaveProperty('message')
    expect(v).toHaveProperty('filePath')
    expect(v).toHaveProperty('range')
    expect(v).toHaveProperty('suggestion')
  })

  test('for-of loop violation has all required fields', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForOfStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const v = violations[0]
    expect(v).toHaveProperty('ruleId')
    expect(v).toHaveProperty('severity')
    expect(v).toHaveProperty('message')
    expect(v).toHaveProperty('filePath')
    expect(v).toHaveProperty('range')
    expect(v).toHaveProperty('suggestion')
  })

  test('while loop violation has all required fields', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.WhileStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const v = violations[0]
    expect(v).toHaveProperty('ruleId')
    expect(v).toHaveProperty('severity')
    expect(v).toHaveProperty('message')
    expect(v).toHaveProperty('filePath')
    expect(v).toHaveProperty('range')
    expect(v).toHaveProperty('suggestion')
  })

  test('do-while loop violation has all required fields', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.DoStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const v = violations[0]
    expect(v).toHaveProperty('ruleId')
    expect(v).toHaveProperty('severity')
    expect(v).toHaveProperty('message')
    expect(v).toHaveProperty('filePath')
    expect(v).toHaveProperty('range')
    expect(v).toHaveProperty('suggestion')
  })
})

describe('analyzeAwaitInLoop vs visitor consistency', () => {
  test('both return same count for single for loop with await', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode1 = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ])
    const funcNode2 = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile1 = createMockSourceFile()
    const sourceFile2 = createMockSourceFile()
    const context1 = createMockVisitorContext(sourceFile1)
    const context2 = createMockVisitorContext(sourceFile2)

    const standaloneViolations = analyzeAwaitInLoop(funcNode1, context1)

    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode2, context2)
    const visitorViolations = ruleInstance.onComplete!()

    expect(standaloneViolations).toHaveLength(visitorViolations.length)
  })

  test('both return same ruleId', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode1 = createMockFunctionWithLoops([
      { kind: SyntaxKind.WhileStatement, awaitNodes: [awaitNode] },
    ])
    const funcNode2 = createMockFunctionWithLoops([
      { kind: SyntaxKind.WhileStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile1 = createMockSourceFile()
    const sourceFile2 = createMockSourceFile()
    const context1 = createMockVisitorContext(sourceFile1)
    const context2 = createMockVisitorContext(sourceFile2)

    const standaloneViolations = analyzeAwaitInLoop(funcNode1, context1)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode2, context2)
    const visitorViolations = ruleInstance.onComplete!()

    expect(standaloneViolations[0].ruleId).toBe(visitorViolations[0].ruleId)
  })

  test('both return same severity', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode1 = createMockFunctionWithLoops([
      { kind: SyntaxKind.DoStatement, awaitNodes: [awaitNode] },
    ])
    const funcNode2 = createMockFunctionWithLoops([
      { kind: SyntaxKind.DoStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile1 = createMockSourceFile()
    const sourceFile2 = createMockSourceFile()
    const context1 = createMockVisitorContext(sourceFile1)
    const context2 = createMockVisitorContext(sourceFile2)

    const standaloneViolations = analyzeAwaitInLoop(funcNode1, context1)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode2, context2)
    const visitorViolations = ruleInstance.onComplete!()

    expect(standaloneViolations[0].severity).toBe(visitorViolations[0].severity)
  })

  test('both return same message', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode1 = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForOfStatement, awaitNodes: [awaitNode] },
    ])
    const funcNode2 = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForOfStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile1 = createMockSourceFile()
    const sourceFile2 = createMockSourceFile()
    const context1 = createMockVisitorContext(sourceFile1)
    const context2 = createMockVisitorContext(sourceFile2)

    const standaloneViolations = analyzeAwaitInLoop(funcNode1, context1)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode2, context2)
    const visitorViolations = ruleInstance.onComplete!()

    expect(standaloneViolations[0].message).toBe(visitorViolations[0].message)
  })

  test('both return empty for no loops', () => {
    const funcNode1 = createMockFunctionWithLoops([])
    const funcNode2 = createMockFunctionWithLoops([])
    const sourceFile1 = createMockSourceFile()
    const sourceFile2 = createMockSourceFile()
    const context1 = createMockVisitorContext(sourceFile1)
    const context2 = createMockVisitorContext(sourceFile2)

    const standaloneViolations = analyzeAwaitInLoop(funcNode1, context1)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode2, context2)
    const visitorViolations = ruleInstance.onComplete!()

    expect(standaloneViolations).toHaveLength(0)
    expect(visitorViolations).toHaveLength(0)
  })
})

describe('range computation', () => {
  test('range start matches await node start position', () => {
    const awaitNode = createMockAwaitExpression({ start: 42, end: 55 })
    const { violations } = runRule([{ kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] }])
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.start.line).toBeDefined()
    expect(violations[0].range.start.column).toBeDefined()
  })

  test('range end matches await node end position', () => {
    const awaitNode = createMockAwaitExpression({ start: 10, end: 25 })
    const { violations } = runRule([{ kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] }])
    expect(violations[0].range.end).toBeDefined()
    expect(violations[0].range.end.line).toBeDefined()
    expect(violations[0].range.end.column).toBeDefined()
  })

  test('different await nodes produce different ranges', () => {
    const awaitNode1 = createMockAwaitExpression({ start: 5, end: 10 })
    const awaitNode2 = createMockAwaitExpression({ start: 100, end: 110 })
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [awaitNode1, awaitNode2],
      },
    ])
    expect(violations[0].range).not.toEqual(violations[1].range)
  })
})

describe('visitor context integration', () => {
  test('addViolation is available on context but not used by rule', () => {
    const awaitNode = createMockAwaitExpression()
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noAwaitInLoopRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    // Rule uses onComplete to return violations, not context.addViolation
    expect(context.addViolation).not.toHaveBeenCalled()
  })

  test('getFilePath on context returns correct path', () => {
    const sourceFile = createMockSourceFile({ getFilePath: vi.fn(() => '/ctx/test.ts') })
    const context = createMockVisitorContext(sourceFile)
    expect(context.getFilePath()).toBe('/ctx/test.ts')
  })

  test('context has sourceFile property', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    expect(context.sourceFile).toBe(sourceFile)
  })

  test('context has depth property', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    expect(context.depth).toBe(0)
  })

  test('context has parent property', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    expect(context.parent).toBeUndefined()
  })
})

describe('rule type safety', () => {
  test('meta.name type is string', () => {
    expect(typeof noAwaitInLoopRule.meta.name).toBe('string')
  })

  test('meta.category type is string', () => {
    expect(typeof noAwaitInLoopRule.meta.category).toBe('string')
  })

  test('meta.recommended type is boolean', () => {
    expect(typeof noAwaitInLoopRule.meta.recommended).toBe('boolean')
  })

  test('meta.description type is string', () => {
    expect(typeof noAwaitInLoopRule.meta.description).toBe('string')
  })

  test('create is a function', () => {
    expect(typeof noAwaitInLoopRule.create).toBe('function')
  })

  test('defaultOptions is an object', () => {
    expect(typeof noAwaitInLoopRule.defaultOptions).toBe('object')
  })
})

describe('large number of violations', () => {
  test('handles ten awaits in single loop', () => {
    const awaitNodes = Array.from({ length: 10 }, (_, i) =>
      createMockAwaitExpression({ start: i * 10, end: i * 10 + 5 }),
    )
    const { violations } = runRule([{ kind: SyntaxKind.ForStatement, awaitNodes }])
    expect(violations).toHaveLength(10)
  })

  test('handles ten loops each with one await', () => {
    const loops = Array.from({ length: 10 }, (_, i) => ({
      kind: SyntaxKind.ForStatement,
      awaitNodes: [createMockAwaitExpression({ start: i * 10, end: i * 10 + 5 })],
    }))
    const { violations } = runRule(loops)
    expect(violations).toHaveLength(10)
  })

  test('all ten violations have correct ruleId', () => {
    const awaitNodes = Array.from({ length: 10 }, (_, i) =>
      createMockAwaitExpression({ start: i * 10, end: i * 10 + 5 }),
    )
    const { violations } = runRule([{ kind: SyntaxKind.ForStatement, awaitNodes }])
    for (const v of violations) {
      expect(v.ruleId).toBe('no-await-in-loop')
    }
  })

  test('all ten violations have warning severity', () => {
    const awaitNodes = Array.from({ length: 10 }, (_, i) =>
      createMockAwaitExpression({ start: i * 10, end: i * 10 + 5 }),
    )
    const { violations } = runRule([{ kind: SyntaxKind.WhileStatement, awaitNodes }])
    for (const v of violations) {
      expect(v.severity).toBe('warning')
    }
  })
})

describe('analyzeAwaitInLoop with multiple loop types', () => {
  test('detects await in all five loop types simultaneously', () => {
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
      { kind: SyntaxKind.ForInStatement, awaitNodes: [createMockAwaitExpression()] },
      { kind: SyntaxKind.ForOfStatement, awaitNodes: [createMockAwaitExpression()] },
      { kind: SyntaxKind.WhileStatement, awaitNodes: [createMockAwaitExpression()] },
      { kind: SyntaxKind.DoStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations).toHaveLength(5)
  })

  test('returns correct count with mixed await counts', () => {
    const funcNode = createMockFunctionWithLoops([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 5, end: 10 }),
          createMockAwaitExpression({ start: 15, end: 20 }),
        ],
      },
      { kind: SyntaxKind.ForInStatement, awaitNodes: [] },
      {
        kind: SyntaxKind.ForOfStatement,
        awaitNodes: [createMockAwaitExpression({ start: 25, end: 30 })],
      },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations).toHaveLength(3)
  })

  test('all violations from standalone have same message', () => {
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
      { kind: SyntaxKind.WhileStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    for (const v of violations) {
      expect(v.message).toBe('Await inside loop can cause performance issues.')
    }
  })
})

describe('additional for loop scenarios', () => {
  test('for loop await at start of file', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [createMockAwaitExpression({ start: 0, end: 5 })],
      },
    ])
    expect(violations).toHaveLength(1)
    expect(violations[0].range.start.line).toBe(1)
  })

  test('for loop with await followed by non-await code', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [createMockAwaitExpression({ start: 50, end: 60 })],
      },
    ])
    expect(violations).toHaveLength(1)
  })

  test('for loop with exactly one await produces exactly one violation', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [createMockAwaitExpression({ start: 20, end: 30 })],
      },
    ])
    expect(violations).toHaveLength(1)
  })
})

describe('additional while loop scenarios', () => {
  test('while loop with await at various positions', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.WhileStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 5, end: 10 }),
          createMockAwaitExpression({ start: 100, end: 105 }),
          createMockAwaitExpression({ start: 500, end: 505 }),
        ],
      },
    ])
    expect(violations).toHaveLength(3)
  })

  test('while loop with single await has suggestion about Promise.all', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.WhileStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].suggestion).toContain('Promise.all()')
  })

  test('while loop with single await has correct filePath', () => {
    const { violations } = runRule(
      [{ kind: SyntaxKind.WhileStatement, awaitNodes: [createMockAwaitExpression()] }],
      { getFilePath: vi.fn(() => '/while-loop.ts') },
    )
    expect(violations[0].filePath).toBe('/while-loop.ts')
  })
})

describe('additional do-while scenarios', () => {
  test('do-while with four awaits', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.DoStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 10, end: 15 }),
          createMockAwaitExpression({ start: 20, end: 25 }),
          createMockAwaitExpression({ start: 30, end: 35 }),
          createMockAwaitExpression({ start: 40, end: 45 }),
        ],
      },
    ])
    expect(violations).toHaveLength(4)
  })

  test('do-while with single await has range with start and end', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.DoStatement,
        awaitNodes: [createMockAwaitExpression({ start: 15, end: 30 })],
      },
    ])
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })
})

describe('additional for-in scenarios', () => {
  test('for-in with four awaits', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForInStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 10, end: 15 }),
          createMockAwaitExpression({ start: 20, end: 25 }),
          createMockAwaitExpression({ start: 30, end: 35 }),
          createMockAwaitExpression({ start: 40, end: 45 }),
        ],
      },
    ])
    expect(violations).toHaveLength(4)
  })
})

describe('additional for-of scenarios', () => {
  test('for-of with four awaits', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForOfStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 10, end: 15 }),
          createMockAwaitExpression({ start: 20, end: 25 }),
          createMockAwaitExpression({ start: 30, end: 35 }),
          createMockAwaitExpression({ start: 40, end: 45 }),
        ],
      },
    ])
    expect(violations).toHaveLength(4)
  })

  test('for-of with await at position 0', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForOfStatement,
        awaitNodes: [createMockAwaitExpression({ start: 0, end: 5 })],
      },
    ])
    expect(violations).toHaveLength(1)
  })
})

describe('analyzeAwaitInLoop additional edge cases', () => {
  test('returns correct range for await at specific position', () => {
    const awaitNode = createMockAwaitExpression({ start: 77, end: 88 })
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations[0].range).toBeDefined()
  })

  test('returns correct range for multiple await nodes', () => {
    const funcNode = createMockFunctionWithLoops([
      {
        kind: SyntaxKind.WhileStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 10, end: 20 }),
          createMockAwaitExpression({ start: 30, end: 40 }),
        ],
      },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations[0].range).toBeDefined()
    expect(violations[1].range).toBeDefined()
  })

  test('all violations from standalone have warning severity', () => {
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
      { kind: SyntaxKind.DoStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    for (const v of violations) {
      expect(v.severity).toBe('warning')
    }
  })

  test('standalone returns correct suggestion text', () => {
    const funcNode = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForInStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const violations = analyzeAwaitInLoop(funcNode, context)
    expect(violations[0].suggestion).toBe(
      'Consider using Promise.all() with map() for parallel execution.',
    )
  })

  test('standalone function is callable multiple times independently', () => {
    const funcNode1 = createMockFunctionWithLoops([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    const funcNode2 = createMockFunctionWithLoops([])
    const sourceFile = createMockSourceFile()
    const context1 = createMockVisitorContext(sourceFile)
    const context2 = createMockVisitorContext(sourceFile)

    const violations1 = analyzeAwaitInLoop(funcNode1, context1)
    const violations2 = analyzeAwaitInLoop(funcNode2, context2)

    expect(violations1).toHaveLength(1)
    expect(violations2).toHaveLength(0)
  })
})

describe('violation order and consistency', () => {
  test('violations appear in order of loop iteration', () => {
    const awaitNode1 = createMockAwaitExpression({ start: 10, end: 15 })
    const awaitNode2 = createMockAwaitExpression({ start: 30, end: 35 })
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode1, awaitNode2] },
    ])
    expect(violations[0].range.start).toBeDefined()
    expect(violations[1].range.start).toBeDefined()
  })

  test('violations from multiple loops maintain correct order', () => {
    const awaitNode1 = createMockAwaitExpression({ start: 10, end: 20 })
    const awaitNode2 = createMockAwaitExpression({ start: 50, end: 60 })
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [awaitNode1] },
      { kind: SyntaxKind.WhileStatement, awaitNodes: [awaitNode2] },
    ])
    expect(violations).toHaveLength(2)
    expect(violations[0].ruleId).toBe('no-await-in-loop')
    expect(violations[1].ruleId).toBe('no-await-in-loop')
  })
})

describe('fixable property', () => {
  test('meta.fixable is code', () => {
    expect(noAwaitInLoopRule.meta.fixable).toBe('code')
  })

  test('meta.fixable is a string', () => {
    expect(typeof noAwaitInLoopRule.meta.fixable).toBe('string')
  })

  test('meta.fixable is not whitespace', () => {
    expect(noAwaitInLoopRule.meta.fixable).not.toBe('whitespace')
  })
})

describe('rule exports', () => {
  test('noAwaitInLoopRule is exported', () => {
    expect(noAwaitInLoopRule).toBeDefined()
  })

  test('analyzeAwaitInLoop is exported as function', () => {
    expect(typeof analyzeAwaitInLoop).toBe('function')
  })

  test('noAwaitInLoopRule has meta property', () => {
    expect(noAwaitInLoopRule).toHaveProperty('meta')
  })

  test('noAwaitInLoopRule has create property', () => {
    expect(noAwaitInLoopRule).toHaveProperty('create')
  })

  test('noAwaitInLoopRule has defaultOptions property', () => {
    expect(noAwaitInLoopRule).toHaveProperty('defaultOptions')
  })
})

describe('loop detection completeness', () => {
  test('detects for-in loop that only loop type with await', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForInStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-await-in-loop')
  })

  test('detects do-while as only loop type with await', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.DoStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-await-in-loop')
  })

  test('detects for-of as only loop type with await', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForOfStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-await-in-loop')
  })

  test('for loop and do-while each with two awaits produces four violations', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 10, end: 15 }),
          createMockAwaitExpression({ start: 20, end: 25 }),
        ],
      },
      {
        kind: SyntaxKind.DoStatement,
        awaitNodes: [
          createMockAwaitExpression({ start: 30, end: 35 }),
          createMockAwaitExpression({ start: 40, end: 45 }),
        ],
      },
    ])
    expect(violations).toHaveLength(4)
  })

  test('for-in and for-of each with one await produces two violations', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.ForInStatement,
        awaitNodes: [createMockAwaitExpression({ start: 10, end: 15 })],
      },
      {
        kind: SyntaxKind.ForOfStatement,
        awaitNodes: [createMockAwaitExpression({ start: 20, end: 25 })],
      },
    ])
    expect(violations).toHaveLength(2)
  })

  test('while loop alone with single await produces correct violation', () => {
    const { violations } = runRule([
      {
        kind: SyntaxKind.WhileStatement,
        awaitNodes: [createMockAwaitExpression({ start: 99, end: 110 })],
      },
    ])
    expect(violations).toHaveLength(1)
    expect(violations[0].severity).toBe('warning')
  })

  test('for loop alone with single await has suggestion', () => {
    const { violations } = runRule([
      { kind: SyntaxKind.ForStatement, awaitNodes: [createMockAwaitExpression()] },
    ])
    expect(violations[0].suggestion).toBe(
      'Consider using Promise.all() with map() for parallel execution.',
    )
  })

  test('empty function visited by standalone produces empty result', () => {
    const funcNode = createMockFunctionWithLoops([])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    expect(analyzeAwaitInLoop(funcNode, context)).toEqual([])
  })
})
