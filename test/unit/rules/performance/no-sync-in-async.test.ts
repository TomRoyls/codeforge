import { describe, test, expect, vi } from 'vitest'
import { SyntaxKind } from 'ts-morph'
import {
  noSyncInAsyncRule,
  analyzeSyncInAsync,
} from '../../../../src/rules/performance/no-sync-in-async'
import type { FunctionLikeNode, VisitorContext } from '../../../../src/ast/visitor'
import { createMockSourceFile, createMockNode } from '../../../helpers/ast-helpers'
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

function createMockCallExpression(config: { text?: string; start?: number; end?: number } = {}) {
  return createMockNode({
    kind: SyntaxKind.CallExpression,
    text: config.text || 'someFunction()',
    ...config,
  })
}

function createMockAsyncFunctionWithCalls(callExpressions: Node[] = []): FunctionLikeNode {
  const funcNode = createMockNode({
    kind: SyntaxKind.FunctionDeclaration,
    text: 'async function test() {}',
  })

  ;(
    funcNode as unknown as { getDescendantsOfKind: (kind: number) => Node[] }
  ).getDescendantsOfKind = vi.fn((kind: number) => {
    if (kind === SyntaxKind.CallExpression) {
      return callExpressions
    }
    return []
  })

  ;(funcNode as unknown as { isAsync: () => boolean }).isAsync = vi.fn(() => true)

  return funcNode as unknown as FunctionLikeNode
}

function createMockSyncFunctionWithCalls(callExpressions: Node[] = []): FunctionLikeNode {
  const funcNode = createMockNode({
    kind: SyntaxKind.FunctionDeclaration,
    text: 'function test() {}',
  })

  ;(
    funcNode as unknown as { getDescendantsOfKind: (kind: number) => Node[] }
  ).getDescendantsOfKind = vi.fn((kind: number) => {
    if (kind === SyntaxKind.CallExpression) {
      return callExpressions
    }
    return []
  })

  ;(funcNode as unknown as { isAsync: () => boolean }).isAsync = vi.fn(() => false)

  return funcNode as unknown as FunctionLikeNode
}

describe('noSyncInAsyncRule', () => {
  describe('meta', () => {
    test('has correct rule name', () => {
      expect(noSyncInAsyncRule.meta.name).toBe('no-sync-in-async')
    })

    test('has correct category', () => {
      expect(noSyncInAsyncRule.meta.category).toBe('performance')
    })

    test('is recommended', () => {
      expect(noSyncInAsyncRule.meta.recommended).toBe(true)
    })

    test('has description', () => {
      expect(noSyncInAsyncRule.meta.description).toContain('synchronous')
      expect(noSyncInAsyncRule.meta.description).toContain('async')
    })
  })

  describe('defaultOptions', () => {
    test('has empty default options', () => {
      expect(noSyncInAsyncRule.defaultOptions).toEqual({})
    })
  })

  describe('create', () => {
    test('returns visitor with visitFunction', () => {
      const ruleInstance = noSyncInAsyncRule.create({})
      expect(ruleInstance.visitor).toBeDefined()
      expect(ruleInstance.visitor.visitFunction).toBeDefined()
    })

    test('returns onComplete function', () => {
      const ruleInstance = noSyncInAsyncRule.create({})
      expect(ruleInstance.onComplete).toBeDefined()
      expect(typeof ruleInstance.onComplete).toBe('function')
    })

    test('returns empty violations for async function with no sync calls', () => {
      const funcNode = createMockAsyncFunctionWithCalls([])
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const ruleInstance = noSyncInAsyncRule.create({})
      ruleInstance.visitor.visitFunction!(funcNode, context)
      const violations = ruleInstance.onComplete!()
      expect(violations).toHaveLength(0)
    })
  })
})

describe('sync operation detection', () => {
  test('detects readFileSync in async function', () => {
    const callNode = createMockCallExpression({
      text: "fs.readFileSync('path')",
      start: 10,
      end: 35,
    })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-sync-in-async')
    expect(violations[0].message).toContain('readFileSync')
  })

  test('no violation in sync function', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('path')" })
    const funcNode = createMockSyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })

  test('detects multiple sync operations', () => {
    const callNode1 = createMockCallExpression({ text: "fs.readFileSync('a')", start: 10, end: 30 })
    const callNode2 = createMockCallExpression({
      text: "fs.writeFileSync('b')",
      start: 40,
      end: 60,
    })
    const funcNode = createMockAsyncFunctionWithCalls([callNode1, callNode2])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(2)
  })

  test('detects execSync', () => {
    const callNode = createMockCallExpression({ text: "child_process.execSync('cmd')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('execSync')
  })

  test('detects spawnSync', () => {
    const callNode = createMockCallExpression({ text: "child_process.spawnSync('cmd')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('spawnSync')
  })

  test('detects existsSync', () => {
    const callNode = createMockCallExpression({ text: "fs.existsSync('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('existsSync')
  })

  test('detects mkdirSync', () => {
    const callNode = createMockCallExpression({ text: "fs.mkdirSync('dir')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('mkdirSync')
  })

  test('detects statSync', () => {
    const callNode = createMockCallExpression({ text: "fs.statSync('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('statSync')
  })

  test('no violation for async readFile', () => {
    const callNode = createMockCallExpression({ text: "await fs.readFile('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })
})

describe('violation structure', () => {
  test('violation includes correct ruleId', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].ruleId).toBe('no-sync-in-async')
  })

  test('violation includes warning severity', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].severity).toBe('warning')
  })

  test('violation includes message', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].message).toContain('blocks the event loop')
  })

  test('violation includes suggestion with async version', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('readFile')
  })

  test('violation includes range', () => {
    const callNode = createMockCallExpression({
      text: "fs.readFileSync('path')",
      start: 10,
      end: 35,
    })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].range).toBeDefined()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })

  test('violation includes filePath', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile({
      getFilePath: vi.fn(() => '/test/myFile.ts'),
    })
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].filePath).toBe('/test/myFile.ts')
  })
})

describe('analyzeSyncInAsync', () => {
  test('returns violations for sync operation in async function', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-sync-in-async')
  })

  test('returns empty array for sync function', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('path')" })
    const funcNode = createMockSyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations).toHaveLength(0)
  })

  test('returns empty array for async function with no sync operations', () => {
    const funcNode = createMockAsyncFunctionWithCalls([])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations).toHaveLength(0)
  })
})
