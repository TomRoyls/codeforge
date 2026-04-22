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

function createMockAsyncArrowFunctionWithCalls(callExpressions: Node[] = []): FunctionLikeNode {
  const funcNode = createMockNode({
    kind: SyntaxKind.ArrowFunction,
    text: 'async () => {}',
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

function createMockAsyncMethodWithCalls(callExpressions: Node[] = []): FunctionLikeNode {
  const funcNode = createMockNode({
    kind: SyntaxKind.MethodDeclaration,
    text: 'async method() {}',
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

  test('detects sync operation in async arrow function', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('path')" })
    const funcNode = createMockAsyncArrowFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-sync-in-async')
  })

  test('detects sync operation in async method', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('path')" })
    const funcNode = createMockAsyncMethodWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-sync-in-async')
  })

  test('no violation in non-async arrow function', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('path')" })
    const funcNode = createMockNode({
      kind: SyntaxKind.ArrowFunction,
      text: '() => {}',
    })
    ;(
      funcNode as unknown as { getDescendantsOfKind: (kind: number) => Node[] }
    ).getDescendantsOfKind = vi.fn((kind: number) => {
      if (kind === SyntaxKind.CallExpression) {
        return [callNode]
      }
      return []
    })
    ;(funcNode as unknown as { isAsync: () => boolean }).isAsync = vi.fn(() => false)

    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })

  test('no violation in non-async method', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('path')" })
    const funcNode = createMockNode({
      kind: SyntaxKind.MethodDeclaration,
      text: 'method() {}',
    })
    ;(
      funcNode as unknown as { getDescendantsOfKind: (kind: number) => Node[] }
    ).getDescendantsOfKind = vi.fn((kind: number) => {
      if (kind === SyntaxKind.CallExpression) {
        return [callNode]
      }
      return []
    })
    ;(funcNode as unknown as { isAsync: () => boolean }).isAsync = vi.fn(() => false)

    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ruleInstance = noSyncInAsyncRule.create({})
    ruleInstance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
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

  test('returns violation with correct severity for readFileSync', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('data.txt')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations[0].severity).toBe('warning')
  })

  test('returns violation with suggestion for writeFileSync', () => {
    const callNode = createMockCallExpression({ text: "fs.writeFileSync('out.txt', data)" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations[0].suggestion).toContain('writeFile')
  })

  test('detects multiple sync operations in one async function', () => {
    const callNode1 = createMockCallExpression({ text: "fs.readFileSync('a')" })
    const callNode2 = createMockCallExpression({ text: "fs.writeFileSync('b')" })
    const callNode3 = createMockCallExpression({ text: "fs.existsSync('c')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode1, callNode2, callNode3])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations).toHaveLength(3)
  })

  test('returns violation with filePath for mkdirSync', () => {
    const callNode = createMockCallExpression({ text: "fs.mkdirSync('dir')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile({
      getFilePath: vi.fn(() => '/project/src/util.ts'),
    })
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations[0].filePath).toBe('/project/src/util.ts')
  })

  test('returns violation with range for execSync', () => {
    const callNode = createMockCallExpression({ text: "execSync('cmd')", start: 20, end: 35 })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations[0].range).toBeDefined()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })

  test('returns message mentioning the sync operation name', () => {
    const callNode = createMockCallExpression({ text: "fs.unlinkSync('file')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations[0].message).toContain('unlinkSync')
  })

  test('detects in async arrow function via standalone', () => {
    const callNode = createMockCallExpression({ text: "fs.readdirSync('.')" })
    const funcNode = createMockAsyncArrowFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations).toHaveLength(1)
  })

  test('detects in async method via standalone', () => {
    const callNode = createMockCallExpression({ text: "fs.statSync('path')" })
    const funcNode = createMockAsyncMethodWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('statSync')
  })

  test('no violation for async function with async readFile', () => {
    const callNode = createMockCallExpression({ text: "await fs.readFile('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations).toHaveLength(0)
  })

  test('no violation for async function with only regular calls', () => {
    const callNode = createMockCallExpression({ text: "console.log('hello')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations).toHaveLength(0)
  })
})

describe('meta expanded', () => {
  test('meta has fixable property set to code', () => {
    expect(noSyncInAsyncRule.meta.fixable).toBe('code')
  })

  test('meta name is a non-empty string', () => {
    expect(noSyncInAsyncRule.meta.name).toBeTruthy()
    expect(typeof noSyncInAsyncRule.meta.name).toBe('string')
  })

  test('meta category is a non-empty string', () => {
    expect(noSyncInAsyncRule.meta.category).toBeTruthy()
    expect(typeof noSyncInAsyncRule.meta.category).toBe('string')
  })

  test('meta description mentions sync and async', () => {
    const desc = noSyncInAsyncRule.meta.description
    expect(desc.toLowerCase()).toContain('sync')
    expect(desc.toLowerCase()).toContain('async')
  })

  test('meta recommended is boolean', () => {
    expect(typeof noSyncInAsyncRule.meta.recommended).toBe('boolean')
  })

  test('meta has exactly expected fields', () => {
    const meta = noSyncInAsyncRule.meta
    expect(Object.keys(meta).sort()).toEqual(
      ['name', 'description', 'category', 'recommended', 'fixable'].sort(),
    )
  })

  test('meta description is a string with more than 10 chars', () => {
    expect(noSyncInAsyncRule.meta.description.length).toBeGreaterThan(10)
  })

  test('meta fixable is code indicating auto-fix capability', () => {
    expect(noSyncInAsyncRule.meta.fixable).toBe('code')
  })
})

describe('create function', () => {
  test('create returns object with visitor property', () => {
    const instance = noSyncInAsyncRule.create({})
    expect(instance).toHaveProperty('visitor')
  })

  test('create returns object with onComplete property', () => {
    const instance = noSyncInAsyncRule.create({})
    expect(instance).toHaveProperty('onComplete')
  })

  test('visitor has visitFunction method', () => {
    const instance = noSyncInAsyncRule.create({})
    expect(typeof instance.visitor.visitFunction).toBe('function')
  })

  test('onComplete returns empty array when no functions visited', () => {
    const instance = noSyncInAsyncRule.create({})
    const result = instance.onComplete!()
    expect(result).toEqual([])
  })

  test('visitFunction does not crash on sync function with no calls', () => {
    const funcNode = createMockSyncFunctionWithCalls([])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    expect(() => instance.visitor.visitFunction!(funcNode, context)).not.toThrow()
  })

  test('onComplete accumulates violations across multiple visitFunction calls', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('a')" })
    const funcNode1 = createMockAsyncFunctionWithCalls([callNode])
    const funcNode2 = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})

    instance.visitor.visitFunction!(funcNode1, context)
    instance.visitor.visitFunction!(funcNode2, context)
    const violations = instance.onComplete!()

    expect(violations).toHaveLength(2)
  })

  test('create accepts empty options object', () => {
    expect(() => noSyncInAsyncRule.create({})).not.toThrow()
  })

  test('create is idempotent - each call returns fresh state', () => {
    const instance1 = noSyncInAsyncRule.create({})
    const instance2 = noSyncInAsyncRule.create({})

    const callNode = createMockCallExpression({ text: "fs.readFileSync('x')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    instance1.visitor.visitFunction!(funcNode, context)
    expect(instance1.onComplete!()).toHaveLength(1)
    expect(instance2.onComplete!()).toHaveLength(0)
  })
})

describe('readFileSync detection', () => {
  test('detects fs.readFileSync in async function', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('/etc/passwd')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects bare readFileSync call', () => {
    const callNode = createMockCallExpression({ text: "readFileSync('config.json')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects readFileSync with encoding parameter', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('data.txt', 'utf8')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects readFileSync assigned to variable', () => {
    const callNode = createMockCallExpression({ text: "const data = fs.readFileSync('file')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('no violation for readFile (async version)', () => {
    const callNode = createMockCallExpression({ text: "await fs.readFile('file', 'utf8')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('suggestion suggests readFile for readFileSync', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('file')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('readFile')
  })
})

describe('writeFileSync detection', () => {
  test('detects fs.writeFileSync in async function', () => {
    const callNode = createMockCallExpression({ text: "fs.writeFileSync('out.txt', 'data')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects bare writeFileSync call', () => {
    const callNode = createMockCallExpression({ text: "writeFileSync('log.txt', msg)" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects writeFileSync with options object', () => {
    const callNode = createMockCallExpression({
      text: "fs.writeFileSync('out.bin', buf, { encoding: 'binary' })",
    })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('no violation for writeFile (async version)', () => {
    const callNode = createMockCallExpression({ text: "await fs.writeFile('out.txt', data)" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('suggestion suggests writeFile for writeFileSync', () => {
    const callNode = createMockCallExpression({ text: "fs.writeFileSync('file', data)" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('writeFile')
  })
})

describe('existsSync detection', () => {
  test('detects fs.existsSync in async function', () => {
    const callNode = createMockCallExpression({ text: "fs.existsSync('/tmp/lock')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects existsSync in condition', () => {
    const callNode = createMockCallExpression({ text: "if (fs.existsSync('config')) { }" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('no violation for fs.exists (deprecated async version)', () => {
    const callNode = createMockCallExpression({ text: "fs.exists('path', cb)" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('suggestion suggests exists for existsSync', () => {
    const callNode = createMockCallExpression({ text: "fs.existsSync('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('exists')
  })

  test('detects existsSync with variable path argument', () => {
    const callNode = createMockCallExpression({ text: 'fs.existsSync(configPath)' })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })
})

describe('mkdirSync/rmdirSync/unlinkSync/readdirSync detection', () => {
  test('detects mkdirSync in async function', () => {
    const callNode = createMockCallExpression({ text: "fs.mkdirSync('new-dir')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('mkdirSync')
  })

  test('detects mkdirSync with recursive option', () => {
    const callNode = createMockCallExpression({
      text: "fs.mkdirSync('a/b/c', { recursive: true })",
    })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('suggestion for mkdirSync suggests mkdir', () => {
    const callNode = createMockCallExpression({ text: "fs.mkdirSync('dir')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('mkdir')
  })

  test('detects rmdirSync in async function', () => {
    const callNode = createMockCallExpression({ text: "fs.rmdirSync('old-dir')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('rmdirSync')
  })

  test('suggestion for rmdirSync suggests rmdir', () => {
    const callNode = createMockCallExpression({ text: "fs.rmdirSync('dir')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('rmdir')
  })

  test('detects unlinkSync in async function', () => {
    const callNode = createMockCallExpression({ text: "fs.unlinkSync('/tmp/file')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('unlinkSync')
  })

  test('suggestion for unlinkSync suggests unlink', () => {
    const callNode = createMockCallExpression({ text: "fs.unlinkSync('file')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('unlink')
  })

  test('detects readdirSync in async function', () => {
    const callNode = createMockCallExpression({ text: "fs.readdirSync('./src')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('readdirSync')
  })

  test('suggestion for readdirSync suggests readdir', () => {
    const callNode = createMockCallExpression({ text: "fs.readdirSync('.')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('readdir')
  })

  test('detects readdirSync with withFileTypes option', () => {
    const callNode = createMockCallExpression({
      text: "fs.readdirSync('.', { withFileTypes: true })",
    })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('no violation for mkdir (async version)', () => {
    const callNode = createMockCallExpression({ text: "await fs.mkdir('dir')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('statSync/lstatSync detection', () => {
  test('detects statSync in async function', () => {
    const callNode = createMockCallExpression({ text: "fs.statSync('file.txt')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects lstatSync in async function', () => {
    const callNode = createMockCallExpression({ text: "fs.lstatSync('symlink')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('statSync')
  })

  test('suggestion for statSync suggests stat', () => {
    const callNode = createMockCallExpression({ text: "fs.statSync('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('stat')
  })

  test('suggestion for lstatSync suggests lstat', () => {
    const callNode = createMockCallExpression({ text: "fs.lstatSync('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('stat')
  })

  test('no violation for stat (async version)', () => {
    const callNode = createMockCallExpression({ text: "await fs.stat('file.txt')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('detects statSync with bigint option', () => {
    const callNode = createMockCallExpression({ text: "fs.statSync('f', { bigint: true })" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })
})

describe('execSync/spawnSync/execFileSync detection', () => {
  test('detects execSync in async function', () => {
    const callNode = createMockCallExpression({ text: "child_process.execSync('npm test')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects spawnSync in async function', () => {
    const callNode = createMockCallExpression({
      text: "child_process.spawnSync('node', ['script.js'])",
    })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects execFileSync in async function', () => {
    const callNode = createMockCallExpression({
      text: "child_process.execFileSync('git', ['pull'])",
    })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('execFileSync')
  })

  test('suggestion for execSync suggests exec', () => {
    const callNode = createMockCallExpression({ text: "execSync('cmd')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('exec')
  })

  test('suggestion for spawnSync suggests spawn', () => {
    const callNode = createMockCallExpression({ text: "spawnSync('cmd')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('spawn')
  })

  test('suggestion for execFileSync suggests execFile', () => {
    const callNode = createMockCallExpression({ text: "execFileSync('cmd')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('execFile')
  })

  test('no violation for exec (async version)', () => {
    const callNode = createMockCallExpression({ text: "await exec('npm test')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation for spawn (async version)', () => {
    const callNode = createMockCallExpression({ text: "spawn('node', ['script.js'])" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('NOT flagged: sync function with sync calls', () => {
  test('no violation: sync function with readFileSync', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('data')" })
    const funcNode = createMockSyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: sync function with writeFileSync', () => {
    const callNode = createMockCallExpression({ text: "fs.writeFileSync('out', data)" })
    const funcNode = createMockSyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: sync function with existsSync', () => {
    const callNode = createMockCallExpression({ text: "fs.existsSync('path')" })
    const funcNode = createMockSyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: sync function with execSync', () => {
    const callNode = createMockCallExpression({ text: "execSync('cmd')" })
    const funcNode = createMockSyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: sync function with mkdirSync', () => {
    const callNode = createMockCallExpression({ text: "fs.mkdirSync('dir')" })
    const funcNode = createMockSyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: sync function with multiple sync calls', () => {
    const callNode1 = createMockCallExpression({ text: "fs.readFileSync('a')" })
    const callNode2 = createMockCallExpression({ text: "fs.writeFileSync('b')" })
    const funcNode = createMockSyncFunctionWithCalls([callNode1, callNode2])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: non-async arrow function with sync call', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('f')" })
    const funcNode = createMockNode({
      kind: SyntaxKind.ArrowFunction,
      text: '() => {}',
    })
    ;(
      funcNode as unknown as { getDescendantsOfKind: (kind: number) => Node[] }
    ).getDescendantsOfKind = vi.fn((kind: number) => {
      if (kind === SyntaxKind.CallExpression) return [callNode]
      return []
    })
    ;(funcNode as unknown as { isAsync: () => boolean }).isAsync = vi.fn(() => false)

    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: non-async method with sync call', () => {
    const callNode = createMockCallExpression({ text: "fs.writeFileSync('log')" })
    const funcNode = createMockNode({
      kind: SyntaxKind.MethodDeclaration,
      text: 'method() {}',
    })
    ;(
      funcNode as unknown as { getDescendantsOfKind: (kind: number) => Node[] }
    ).getDescendantsOfKind = vi.fn((kind: number) => {
      if (kind === SyntaxKind.CallExpression) return [callNode]
      return []
    })
    ;(funcNode as unknown as { isAsync: () => boolean }).isAsync = vi.fn(() => false)

    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: sync function with rmdirSync', () => {
    const callNode = createMockCallExpression({ text: "fs.rmdirSync('dir')" })
    const funcNode = createMockSyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: sync function with readdirSync', () => {
    const callNode = createMockCallExpression({ text: "fs.readdirSync('.')" })
    const funcNode = createMockSyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('NOT flagged: async function with no sync calls', () => {
  test('no violation: async function with console.log', () => {
    const callNode = createMockCallExpression({ text: "console.log('hello')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with fetch call', () => {
    const callNode = createMockCallExpression({ text: "await fetch('/api')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with Promise.all', () => {
    const callNode = createMockCallExpression({ text: 'await Promise.all(promises)' })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with JSON.parse', () => {
    const callNode = createMockCallExpression({ text: 'JSON.parse(data)' })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with Array.from', () => {
    const callNode = createMockCallExpression({ text: 'Array.from(items)' })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with custom function call', () => {
    const callNode = createMockCallExpression({ text: 'processData(input)' })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with no call expressions at all', () => {
    const funcNode = createMockAsyncFunctionWithCalls([])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with Math.max', () => {
    const callNode = createMockCallExpression({ text: 'Math.max(1, 2, 3)' })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with Object.keys', () => {
    const callNode = createMockCallExpression({ text: 'Object.keys(obj)' })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with Date.now', () => {
    const callNode = createMockCallExpression({ text: 'Date.now()' })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('NOT flagged: async function with async versions', () => {
  test('no violation: async function with readFile', () => {
    const callNode = createMockCallExpression({ text: "await fs.readFile('path', 'utf8')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with writeFile', () => {
    const callNode = createMockCallExpression({ text: "await fs.writeFile('out', data)" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with mkdir', () => {
    const callNode = createMockCallExpression({
      text: "await fs.mkdir('dir', { recursive: true })",
    })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with rmdir', () => {
    const callNode = createMockCallExpression({ text: "await fs.rmdir('dir')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with unlink', () => {
    const callNode = createMockCallExpression({ text: "await fs.unlink('file')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with readdir', () => {
    const callNode = createMockCallExpression({ text: "await fs.readdir('.')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with stat', () => {
    const callNode = createMockCallExpression({ text: "await fs.stat('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with lstat', () => {
    const callNode = createMockCallExpression({ text: "await fs.lstat('link')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with exec (child_process async)', () => {
    const callNode = createMockCallExpression({ text: "await exec('npm run build')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with execFile (async version)', () => {
    const callNode = createMockCallExpression({ text: "await execFile('node', ['script.js'])" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with spawn (async version)', () => {
    const callNode = createMockCallExpression({ text: "spawn('node', ['app.js'])" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation: async function with access (async fs)', () => {
    const callNode = createMockCallExpression({ text: "await fs.access('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('multiple sync operations in one function', () => {
  test('detects readFileSync + writeFileSync pair', () => {
    const callNode1 = createMockCallExpression({ text: "fs.readFileSync('in.txt')" })
    const callNode2 = createMockCallExpression({ text: "fs.writeFileSync('out.txt', data)" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode1, callNode2])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(2)
  })

  test('detects all 12 sync operations in one async function', () => {
    const ops = [
      "fs.readFileSync('a')",
      "fs.writeFileSync('b')",
      "fs.existsSync('c')",
      "fs.mkdirSync('d')",
      "fs.rmdirSync('e')",
      "fs.unlinkSync('f')",
      "fs.readdirSync('g')",
      "fs.statSync('h')",
      "fs.lstatSync('i')",
      "execSync('j')",
      "spawnSync('k')",
      "execFileSync('l')",
    ]
    const callNodes = ops.map((op) => createMockCallExpression({ text: op }))
    const funcNode = createMockAsyncFunctionWithCalls(callNodes)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(12)
  })

  test('detects mix of sync and async calls', () => {
    const callNode1 = createMockCallExpression({ text: "await fs.readFile('a')" })
    const callNode2 = createMockCallExpression({ text: "fs.writeFileSync('b')" })
    const callNode3 = createMockCallExpression({ text: "console.log('c')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode1, callNode2, callNode3])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects three different sync operations with correct messages', () => {
    const callNode1 = createMockCallExpression({ text: "fs.readFileSync('a')" })
    const callNode2 = createMockCallExpression({ text: "fs.mkdirSync('b')" })
    const callNode3 = createMockCallExpression({ text: "execSync('c')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode1, callNode2, callNode3])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(3)
    expect(violations[0].message).toContain('readFileSync')
    expect(violations[1].message).toContain('mkdirSync')
    expect(violations[2].message).toContain('execSync')
  })

  test('handles empty call expressions array', () => {
    const funcNode = createMockAsyncFunctionWithCalls([])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('violation properties detailed', () => {
  test('violation ruleId is always no-sync-in-async for writeFileSync', () => {
    const callNode = createMockCallExpression({ text: "fs.writeFileSync('f')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].ruleId).toBe('no-sync-in-async')
  })

  test('violation severity is always warning for mkdirSync', () => {
    const callNode = createMockCallExpression({ text: "fs.mkdirSync('d')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].severity).toBe('warning')
  })

  test('violation message contains blocks the event loop for rmdirSync', () => {
    const callNode = createMockCallExpression({ text: "fs.rmdirSync('d')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].message).toContain('blocks the event loop')
  })

  test('violation message includes the sync operation name', () => {
    const callNode = createMockCallExpression({ text: "fs.lstatSync('p')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    const msg = instance.onComplete!()[0].message
    expect(msg).toContain('statSync')
    expect(msg).toContain('Synchronous operation')
  })

  test('violation suggestion includes Consider using for execFileSync', () => {
    const callNode = createMockCallExpression({ text: "execFileSync('cmd')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('Consider using')
  })

  test('violation suggestion includes async version with parens', () => {
    const callNode = createMockCallExpression({ text: "fs.readdirSync('.')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('readdir()')
  })

  test('violation range has start and end with line and column', () => {
    const callNode = createMockCallExpression({
      text: "fs.readFileSync('file')",
      start: 50,
      end: 75,
    })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    const range = instance.onComplete!()[0].range
    expect(range.start).toHaveProperty('line')
    expect(range.start).toHaveProperty('column')
    expect(range.end).toHaveProperty('line')
    expect(range.end).toHaveProperty('column')
  })

  test('violation filePath matches context getFilePath', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('f')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile({
      getFilePath: vi.fn(() => '/app/src/main.ts'),
    })
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].filePath).toBe('/app/src/main.ts')
  })

  test('violation message format is consistent', () => {
    const callNode = createMockCallExpression({ text: "fs.writeFileSync('out', d)" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    const msg = instance.onComplete!()[0].message
    expect(msg).toMatch(/^Synchronous operation '.*' in async function blocks the event loop\.$/)
  })

  test('violation suggestion format is consistent', () => {
    const callNode = createMockCallExpression({ text: "fs.unlinkSync('f')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    const suggestion = instance.onComplete!()[0].suggestion
    expect(suggestion).toMatch(/^Consider using the async version '.*\(\)' instead\.$/)
  })
})

describe('isAsyncFunction edge cases', () => {
  test('detects sync in async function expression', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('data')" })
    const funcNode = createMockNode({
      kind: SyntaxKind.FunctionExpression,
      text: 'async function() {}',
    })
    ;(
      funcNode as unknown as { getDescendantsOfKind: (kind: number) => Node[] }
    ).getDescendantsOfKind = vi.fn((kind: number) => {
      if (kind === SyntaxKind.CallExpression) return [callNode]
      return []
    })
    ;(funcNode as unknown as { isAsync: () => boolean }).isAsync = vi.fn(() => true)

    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('no violation in non-async function expression', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('data')" })
    const funcNode = createMockNode({
      kind: SyntaxKind.FunctionExpression,
      text: 'function() {}',
    })
    ;(
      funcNode as unknown as { getDescendantsOfKind: (kind: number) => Node[] }
    ).getDescendantsOfKind = vi.fn((kind: number) => {
      if (kind === SyntaxKind.CallExpression) return [callNode]
      return []
    })
    ;(funcNode as unknown as { isAsync: () => boolean }).isAsync = vi.fn(() => false)

    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('detects sync in async arrow function', () => {
    const callNode = createMockCallExpression({ text: "fs.mkdirSync('d')" })
    const funcNode = createMockAsyncArrowFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('mkdirSync')
  })

  test('detects sync in async method declaration', () => {
    const callNode = createMockCallExpression({ text: "fs.statSync('f')" })
    const funcNode = createMockAsyncMethodWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('statSync')
  })

  test('detects sync in async method with correct filePath', () => {
    const callNode = createMockCallExpression({ text: "fs.writeFileSync('f')" })
    const funcNode = createMockAsyncMethodWithCalls([callNode])
    const sourceFile = createMockSourceFile({
      getFilePath: vi.fn(() => '/src/service.ts'),
    })
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].filePath).toBe('/src/service.ts')
  })

  test('unknown function kind returns no violation even with sync calls', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('f')" })
    const funcNode = createMockNode({
      kind: 99999, // Unknown kind
      text: 'someFunction() {}',
    })
    ;(
      funcNode as unknown as { getDescendantsOfKind: (kind: number) => Node[] }
    ).getDescendantsOfKind = vi.fn((kind: number) => {
      if (kind === SyntaxKind.CallExpression) return [callNode]
      return []
    })
    ;(funcNode as unknown as { isAsync: () => boolean }).isAsync = vi.fn(() => true)

    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context)
    // Unknown kind (99999) doesn't match any check in isAsyncFunction, returns false
    expect(instance.onComplete!()).toHaveLength(0)
  })
})

describe('edge cases', () => {
  test('text containing readFileSync as substring of longer word', () => {
    const callNode = createMockCallExpression({ text: "myreadFileSyncWrapper('f')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('getDescendantsOfKind returns non-CallExpression kinds as empty', () => {
    const funcNode = createMockAsyncFunctionWithCalls([])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('violation is only reported once per call expression even if text matches multiple ops', () => {
    // A call expression that mentions two sync ops - only one violation per call
    const callNode = createMockCallExpression({ text: "fs.readFileSync(writeFileSync('x'))" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    // First match in SYNC_OPERATIONS order wins (readFileSync comes before writeFileSync)
    expect(instance.onComplete!()[0].message).toContain('readFileSync')
  })

  test('handles call with empty text', () => {
    const callNode = createMockCallExpression({ text: '' })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('handles function with many non-sync calls and one sync call', () => {
    const calls = [
      createMockCallExpression({ text: "console.log('a')" }),
      createMockCallExpression({ text: 'JSON.parse(data)' }),
      createMockCallExpression({ text: 'Math.max(1, 2)' }),
      createMockCallExpression({ text: "fs.readFileSync('secret')" }),
      createMockCallExpression({ text: 'process.exit(0)' }),
    ]
    const funcNode = createMockAsyncFunctionWithCalls(calls)
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('readFileSync')
  })

  test('different file paths for different contexts', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('f')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])

    const sourceFile1 = createMockSourceFile({ getFilePath: vi.fn(() => '/a.ts') })
    const sourceFile2 = createMockSourceFile({ getFilePath: vi.fn(() => '/b.ts') })

    const instance1 = noSyncInAsyncRule.create({})
    const instance2 = noSyncInAsyncRule.create({})

    instance1.visitor.visitFunction!(funcNode, createMockVisitorContext(sourceFile1))
    instance2.visitor.visitFunction!(funcNode, createMockVisitorContext(sourceFile2))

    expect(instance1.onComplete!()[0].filePath).toBe('/a.ts')
    expect(instance2.onComplete!()[0].filePath).toBe('/b.ts')
  })

  test('onComplete does not clear violations on subsequent calls', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('f')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)

    const first = instance.onComplete!()
    const second = instance.onComplete!()
    expect(first).toHaveLength(1)
    expect(second).toHaveLength(1)
  })
})

describe('getAsyncVersion for each sync operation', () => {
  test('readFileSync becomes readFile', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('f')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('readFile')
  })

  test('writeFileSync becomes writeFile', () => {
    const callNode = createMockCallExpression({ text: "fs.writeFileSync('f')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('writeFile')
  })

  test('existsSync becomes exists', () => {
    const callNode = createMockCallExpression({ text: "fs.existsSync('f')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('exists')
  })

  test('mkdirSync becomes mkdir', () => {
    const callNode = createMockCallExpression({ text: "fs.mkdirSync('d')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('mkdir')
  })

  test('rmdirSync becomes rmdir', () => {
    const callNode = createMockCallExpression({ text: "fs.rmdirSync('d')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('rmdir')
  })

  test('unlinkSync becomes unlink', () => {
    const callNode = createMockCallExpression({ text: "fs.unlinkSync('f')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('unlink')
  })

  test('readdirSync becomes readdir', () => {
    const callNode = createMockCallExpression({ text: "fs.readdirSync('.')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('readdir')
  })

  test('statSync becomes stat', () => {
    const callNode = createMockCallExpression({ text: "fs.statSync('f')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('stat')
  })

  test('lstatSync suggestion contains stat', () => {
    const callNode = createMockCallExpression({ text: "fs.lstatSync('f')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('stat')
  })

  test('execSync becomes exec', () => {
    const callNode = createMockCallExpression({ text: "execSync('cmd')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('exec')
  })

  test('spawnSync becomes spawn', () => {
    const callNode = createMockCallExpression({ text: "spawnSync('cmd')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('spawn')
  })

  test('execFileSync becomes execFile', () => {
    const callNode = createMockCallExpression({ text: "execFileSync('cmd')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toContain('execFile')
  })
})

describe('additional detection scenarios', () => {
  test('detects sync call in deeply nested async function', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('deep')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('no violation: text with Sync but not a known sync operation', () => {
    const callNode = createMockCallExpression({ text: "customSyncOperation('data')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('detects readFileSync with Buffer return', () => {
    const callNode = createMockCallExpression({ text: "const buf = fs.readFileSync('binary.dat')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('no violation: async function with only return statement', () => {
    const funcNode = createMockAsyncFunctionWithCalls([])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('violation for existsSync used in ternary', () => {
    const callNode = createMockCallExpression({ text: "fs.existsSync('x') ? 'yes' : 'no'" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('multiple calls to same sync op produce multiple violations', () => {
    const callNode1 = createMockCallExpression({ text: "fs.readFileSync('a')" })
    const callNode2 = createMockCallExpression({ text: "fs.readFileSync('b')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode1, callNode2])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(2)
  })

  test('violation for sync call inside async arrow with complex expression', () => {
    const callNode = createMockCallExpression({ text: "JSON.stringify(fs.statSync('f'))" })
    const funcNode = createMockAsyncArrowFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('no violation for text with Sync substring not matching known ops', () => {
    const callNode = createMockCallExpression({ text: 'syncDBWithRemote()' })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation for text containing Synchronized (capitalized)', () => {
    const callNode = createMockCallExpression({ text: 'isSynchronized(obj)' })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('violation for execFileSync with array args', () => {
    const callNode = createMockCallExpression({
      text: "child_process.execFileSync('node', ['--version'])",
    })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('execFileSync')
  })

  test('no violation for async function with callback-based fs call', () => {
    const callNode = createMockCallExpression({ text: "fs.readFile('f', callback)" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('analyzeSyncInAsync with statSync reports correct operation', () => {
    const callNode = createMockCallExpression({ text: "fs.statSync('path')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations[0].message).toContain('statSync')
    expect(violations[0].suggestion).toContain('stat')
  })

  test('analyzeSyncInAsync for arrow function with unlinkSync', () => {
    const callNode = createMockCallExpression({ text: "fs.unlinkSync('file')" })
    const funcNode = createMockAsyncArrowFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('unlinkSync')
    expect(violations[0].suggestion).toContain('unlink')
  })

  test('analyzeSyncInAsync for method with writeFileSync', () => {
    const callNode = createMockCallExpression({ text: "fs.writeFileSync('out', data)" })
    const funcNode = createMockAsyncMethodWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('writeFileSync')
  })

  test('visitFunction handles null getDescendantsOfKind gracefully', () => {
    const funcNode = createMockNode({
      kind: SyntaxKind.FunctionDeclaration,
      text: 'async function test() {}',
    })
    ;(
      funcNode as unknown as { getDescendantsOfKind: (kind: number) => Node[] }
    ).getDescendantsOfKind = vi.fn(() => [])
    ;(funcNode as unknown as { isAsync: () => boolean }).isAsync = vi.fn(() => true)

    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    expect(() =>
      instance.visitor.visitFunction!(funcNode as unknown as FunctionLikeNode, context),
    ).not.toThrow()
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('create with options does not affect detection', () => {
    const callNode = createMockCallExpression({ text: "fs.readFileSync('f')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({ someOption: true } as Record<string, unknown>)
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects spawnSync with options object', () => {
    const callNode = createMockCallExpression({
      text: "child_process.spawnSync('node', ['test'], { stdio: 'inherit' })",
    })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('spawnSync')
  })

  test('detects mkdirSync used in try-catch block text', () => {
    const callNode = createMockCallExpression({ text: "try { fs.mkdirSync('dir') } catch(e) {}" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects writeFileSync chained in expression', () => {
    const callNode = createMockCallExpression({
      text: "fs.writeFileSync('f', data) && doSomething()",
    })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('violation for readdirSync with absolute path', () => {
    const callNode = createMockCallExpression({ text: "fs.readdirSync('/usr/local/bin')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    const violations = instance.onComplete!()
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toContain('readdir')
  })

  test('detects rmdirSync with recursive option', () => {
    const callNode = createMockCallExpression({ text: "fs.rmdirSync('dir', { recursive: true })" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects unlinkSync in conditional', () => {
    const callNode = createMockCallExpression({ text: "shouldDelete && fs.unlinkSync('temp')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects existsSync as function argument', () => {
    const callNode = createMockCallExpression({ text: "validate(fs.existsSync('config'))" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects readFileSync in template literal context', () => {
    const callNode = createMockCallExpression({ text: "`data: ${fs.readFileSync('f')}`" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects writeFileSync in return statement context', () => {
    const callNode = createMockCallExpression({ text: "return fs.writeFileSync('out', result)" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('detects statSync used in size comparison', () => {
    const callNode = createMockCallExpression({ text: "fs.statSync('f').size > 1024" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('no violation for async function with await and no sync calls', () => {
    const callNode = createMockCallExpression({ text: 'await delay(1000)' })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation for async function with only promise chain', () => {
    const callNode = createMockCallExpression({ text: "fetch('/api').then(r => r.json())" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('detects execSync with cwd option', () => {
    const callNode = createMockCallExpression({ text: "execSync('npm test', { cwd: '/project' })" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
    expect(instance.onComplete!()[0].message).toContain('execSync')
  })

  test('detects lstatSync in async method', () => {
    const callNode = createMockCallExpression({ text: "fs.lstatSync('link')" })
    const funcNode = createMockAsyncMethodWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(1)
  })

  test('analyzeSyncInAsync returns multiple violations with correct filePaths', () => {
    const callNode1 = createMockCallExpression({ text: "fs.readFileSync('a')" })
    const callNode2 = createMockCallExpression({ text: "fs.writeFileSync('b')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode1, callNode2])
    const sourceFile = createMockSourceFile({
      getFilePath: vi.fn(() => '/multi-test.ts'),
    })
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations).toHaveLength(2)
    expect(violations[0].filePath).toBe('/multi-test.ts')
    expect(violations[1].filePath).toBe('/multi-test.ts')
  })

  test('analyzeSyncInAsync returns violations with warning severity for each', () => {
    const callNode1 = createMockCallExpression({ text: "fs.mkdirSync('a')" })
    const callNode2 = createMockCallExpression({ text: "fs.rmdirSync('b')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode1, callNode2])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations.every((v) => v.severity === 'warning')).toBe(true)
  })

  test('detects sync operation via create with correct range for positioned call', () => {
    const callNode = createMockCallExpression({
      text: "fs.readFileSync('config.json')",
      start: 100,
      end: 130,
    })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    const range = instance.onComplete!()[0].range
    expect(range.start).toBeDefined()
    expect(range.end).toBeDefined()
  })

  test('no violation for text containing only partial sync operation name', () => {
    const callNode = createMockCallExpression({ text: "readFile('data.txt')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('no violation for text with writeFile (not writeFileSync)', () => {
    const callNode = createMockCallExpression({ text: "fs.writeFile('out', data)" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()).toHaveLength(0)
  })

  test('analyzeSyncInAsync with readdirSync reports correct operation name', () => {
    const callNode = createMockCallExpression({ text: "fs.readdirSync('./src')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations[0].message).toContain('readdirSync')
  })

  test('analyzeSyncInAsync with spawnSync reports correct operation', () => {
    const callNode = createMockCallExpression({ text: "spawnSync('npm', ['run', 'build'])" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations[0].message).toContain('spawnSync')
    expect(violations[0].suggestion).toContain('spawn')
  })

  test('no violation for sync function with existsSync via standalone', () => {
    const callNode = createMockCallExpression({ text: "fs.existsSync('path')" })
    const funcNode = createMockSyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const violations = analyzeSyncInAsync(funcNode, context)
    expect(violations).toHaveLength(0)
  })

  test('violation message format for existsSync', () => {
    const callNode = createMockCallExpression({ text: "fs.existsSync('x')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    const msg = instance.onComplete!()[0].message
    expect(msg).toBe("Synchronous operation 'existsSync' in async function blocks the event loop.")
  })

  test('violation message format for mkdirSync', () => {
    const callNode = createMockCallExpression({ text: "fs.mkdirSync('d')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    const msg = instance.onComplete!()[0].message
    expect(msg).toBe("Synchronous operation 'mkdirSync' in async function blocks the event loop.")
  })

  test('violation suggestion format for mkdirSync', () => {
    const callNode = createMockCallExpression({ text: "fs.mkdirSync('d')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toBe(
      "Consider using the async version 'mkdir()' instead.",
    )
  })

  test('violation suggestion format for unlinkSync', () => {
    const callNode = createMockCallExpression({ text: "fs.unlinkSync('f')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toBe(
      "Consider using the async version 'unlink()' instead.",
    )
  })

  test('violation suggestion format for readdirSync', () => {
    const callNode = createMockCallExpression({ text: "fs.readdirSync('.')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toBe(
      "Consider using the async version 'readdir()' instead.",
    )
  })

  test('violation suggestion format for execFileSync', () => {
    const callNode = createMockCallExpression({ text: "execFileSync('cmd')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toBe(
      "Consider using the async version 'execFile()' instead.",
    )
  })

  test('violation suggestion format for rmdirSync', () => {
    const callNode = createMockCallExpression({ text: "fs.rmdirSync('d')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toBe(
      "Consider using the async version 'rmdir()' instead.",
    )
  })

  test('violation suggestion format for spawnSync', () => {
    const callNode = createMockCallExpression({ text: "spawnSync('cmd')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toBe(
      "Consider using the async version 'spawn()' instead.",
    )
  })

  test('violation suggestion format for writeFileSync', () => {
    const callNode = createMockCallExpression({ text: "fs.writeFileSync('f')" })
    const funcNode = createMockAsyncFunctionWithCalls([callNode])
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const instance = noSyncInAsyncRule.create({})
    instance.visitor.visitFunction!(funcNode, context)
    expect(instance.onComplete!()[0].suggestion).toBe(
      "Consider using the async version 'writeFile()' instead.",
    )
  })
})
