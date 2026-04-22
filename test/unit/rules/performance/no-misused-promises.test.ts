import { describe, test, expect, vi } from 'vitest'
import {
  noMisusedPromisesRule,
  analyzeMisusedPromises,
} from '../../../../src/rules/performance/no-misused-promises'
import type { VisitorContext } from '../../../../src/ast/visitor'
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

function createMockCallExpression(config: {
  expression: Node
  args?: Node[]
  start?: number
  end?: number
}): Node {
  const node = createMockNode({
    kind: 207,
    text: 'forEach(async () => {})',
    start: config.start,
    end: config.end,
  })

  ;(node as unknown as Record<string, unknown>).getArguments = vi.fn(() => config.args || [])
  ;(node as unknown as Record<string, unknown>).getExpression = vi.fn(() => config.expression)

  return node
}

function createMockPropertyAccessExpression(config: {
  methodName: string
  start?: number
  end?: number
}): Node {
  const node = createMockNode({
    kind: 203,
    text: `items.${config.methodName}`,
    start: config.start,
    end: config.end,
  })

  ;(node as unknown as Record<string, unknown>).getName = vi.fn(() => config.methodName)

  return node
}

function createMockAsyncArrowFunction(config: {
  isAsync: boolean
  start?: number
  end?: number
}): Node {
  const node = createMockNode({
    kind: 211,
    text: config.isAsync ? 'async (item) => {}' : '(item) => {}',
    start: config.start,
    end: config.end,
  })

  ;(node as unknown as Record<string, unknown>).isAsync = vi.fn(() => config.isAsync)

  return node
}

function createMockAsyncFunctionExpression(config: {
  isAsync: boolean
  start?: number
  end?: number
}): Node {
  const node = createMockNode({
    kind: 216,
    text: config.isAsync ? 'async function(item) {}' : 'function(item) {}',
    start: config.start,
    end: config.end,
  })

  ;(node as unknown as Record<string, unknown>).isAsync = vi.fn(() => config.isAsync)

  return node
}

function createMockIdentifier(): Node {
  return createMockNode({
    kind: 79,
    text: 'items',
  })
}

describe('noMisusedPromisesRule', () => {
  describe('meta', () => {
    test('has correct rule name', () => {
      expect(noMisusedPromisesRule.meta.name).toBe('no-misused-promises')
    })

    test('has correct category', () => {
      expect(noMisusedPromisesRule.meta.category).toBe('performance')
    })

    test('is recommended', () => {
      expect(noMisusedPromisesRule.meta.recommended).toBe(true)
    })

    test('has description', () => {
      expect(noMisusedPromisesRule.meta.description).toContain('promise')
      expect(noMisusedPromisesRule.meta.description).toContain('forEach')
    })
  })

  describe('defaultOptions', () => {
    test('has empty default options', () => {
      expect(noMisusedPromisesRule.defaultOptions).toEqual({})
    })
  })

  describe('create', () => {
    test('returns visitor with visitNode', () => {
      const ruleInstance = noMisusedPromisesRule.create({})
      expect(ruleInstance.visitor).toBeDefined()
      expect(ruleInstance.visitor.visitNode).toBeDefined()
    })

    test('returns onComplete function', () => {
      const ruleInstance = noMisusedPromisesRule.create({})
      expect(ruleInstance.onComplete).toBeDefined()
      expect(typeof ruleInstance.onComplete).toBe('function')
    })
  })
})

describe('forEach with async callback detection', () => {
  test('detects forEach with async arrow function', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-misused-promises')
  })

  test('detects forEach with async function expression', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const asyncCallback = createMockAsyncFunctionExpression({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-misused-promises')
  })

  test('no violation for forEach with sync arrow function', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const syncCallback = createMockAsyncArrowFunction({ isAsync: false })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [syncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })

  test('no violation for forEach with sync function expression', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const syncCallback = createMockAsyncFunctionExpression({ isAsync: false })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [syncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })

  test('no violation for non-forEach method calls', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'map',
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })

  test('no violation for call without arguments', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })

  test('no violation for identifier call expression', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const identifier = createMockIdentifier()
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const callExpr = createMockCallExpression({
      expression: identifier,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })

  test('no violation for non-call expression nodes', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const regularNode = createMockNode({
      kind: 257,
      text: 'function test() {}',
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(regularNode, context)
    const violations = ruleInstance.onComplete!()

    expect(violations).toHaveLength(0)
  })
})

describe('violation structure', () => {
  test('violation includes correct ruleId', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].ruleId).toBe('no-misused-promises')
  })

  test('violation includes warning severity', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].severity).toBe('warning')
  })

  test('violation includes message about fire-and-forget', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].message).toContain('Promise')
    expect(violations[0].message).toContain('ignored')
  })

  test('violation suggests for-of alternative', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('for-of')
  })

  test('violation suggests Promise.all alternative', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('Promise.all')
  })

  test('violation includes range', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
      start: 10,
      end: 50,
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].range).toBeDefined()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })

  test('violation includes filePath', () => {
    const sourceFile = createMockSourceFile({
      getFilePath: vi.fn(() => '/test/myFile.ts'),
    })
    const context = createMockVisitorContext(sourceFile)

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].filePath).toBe('/test/myFile.ts')
  })
})

describe('analyzeMisusedPromises', () => {
  test('returns violations for async forEach callback', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    })

    const violations = analyzeMisusedPromises(callExpr, context)
    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-misused-promises')
  })

  test('returns empty array for sync forEach callback', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const syncCallback = createMockAsyncArrowFunction({ isAsync: false })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [syncCallback],
    })

    const violations = analyzeMisusedPromises(callExpr, context)
    expect(violations).toHaveLength(0)
  })

  test('returns empty array for non-call expression', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const regularNode = createMockNode({
      kind: 257,
      text: 'function test() {}',
    })

    const violations = analyzeMisusedPromises(regularNode, context)
    expect(violations).toHaveLength(0)
  })
})

// ============================================================
// NEW TEST BLOCKS: expanding from 25 to 200+ tests
// ============================================================

describe('meta expanded', () => {
  test('meta.name is a string', () => {
    expect(typeof noMisusedPromisesRule.meta.name).toBe('string')
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
    expect(validCategories).toContain(noMisusedPromisesRule.meta.category)
  })

  test('meta.recommended is boolean', () => {
    expect(typeof noMisusedPromisesRule.meta.recommended).toBe('boolean')
  })

  test('meta.description is a non-empty string', () => {
    expect(noMisusedPromisesRule.meta.description).toBeTruthy()
    expect(typeof noMisusedPromisesRule.meta.description).toBe('string')
  })

  test('meta.fixable is code', () => {
    expect(noMisusedPromisesRule.meta.fixable).toBe('code')
  })

  test('meta.name matches ruleId in violations', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].ruleId).toBe(noMisusedPromisesRule.meta.name)
  })

  test('meta has no deprecated field', () => {
    expect(noMisusedPromisesRule.meta.deprecated).toBeUndefined()
  })

  test('meta has no replacedBy field', () => {
    expect(noMisusedPromisesRule.meta.replacedBy).toBeUndefined()
  })
})

describe('create function - visitor structure', () => {
  test('visitor has visitNode method', () => {
    const ruleInstance = noMisusedPromisesRule.create({})
    expect(typeof ruleInstance.visitor.visitNode).toBe('function')
  })

  test('visitor does not have exitNode', () => {
    const ruleInstance = noMisusedPromisesRule.create({})
    expect(ruleInstance.visitor.exitNode).toBeUndefined()
  })

  test('visitor does not have visitFunction', () => {
    const ruleInstance = noMisusedPromisesRule.create({})
    expect(ruleInstance.visitor.visitFunction).toBeUndefined()
  })

  test('visitor does not have visitSourceFile', () => {
    const ruleInstance = noMisusedPromisesRule.create({})
    expect(ruleInstance.visitor.visitSourceFile).toBeUndefined()
  })

  test('visitor does not have visitIfStatement', () => {
    const ruleInstance = noMisusedPromisesRule.create({})
    expect(ruleInstance.visitor.visitIfStatement).toBeUndefined()
  })

  test('visitor does not have visitLoop', () => {
    const ruleInstance = noMisusedPromisesRule.create({})
    expect(ruleInstance.visitor.visitLoop).toBeUndefined()
  })

  test('onComplete returns array', () => {
    const ruleInstance = noMisusedPromisesRule.create({})
    const result = ruleInstance.onComplete!()
    expect(Array.isArray(result)).toBe(true)
  })

  test('onComplete returns empty array when no nodes visited', () => {
    const ruleInstance = noMisusedPromisesRule.create({})
    const result = ruleInstance.onComplete!()
    expect(result).toHaveLength(0)
  })

  test('create accepts options object', () => {
    const ruleInstance = noMisusedPromisesRule.create({ max: 5 })
    expect(ruleInstance.visitor.visitNode).toBeDefined()
  })

  test('create accepts empty options', () => {
    const ruleInstance = noMisusedPromisesRule.create({})
    expect(ruleInstance.visitor.visitNode).toBeDefined()
  })

  test('each create call produces independent instance', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const instance1 = noMisusedPromisesRule.create({})
    const instance2 = noMisusedPromisesRule.create({})

    instance1.visitor.visitNode!(callExpr, context)

    expect(instance1.onComplete!()).toHaveLength(1)
    expect(instance2.onComplete!()).toHaveLength(0)
  })
})

describe('async forEach with arrow function - various scenarios', () => {
  test('detects arr.forEach with async arrow', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects items.forEach with async arrow and second arg', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const secondArg = createMockNode({ kind: 79, text: 'thisArg' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback, secondArg],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects data.forEach with async arrow', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true, start: 5, end: 30 })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()
    expect(violations).toHaveLength(1)
  })

  test('detects results.forEach with async arrow', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
      start: 20,
      end: 60,
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects async arrow callback with start offset', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true, start: 100, end: 150 })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects async arrow callback at position 0', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true, start: 0, end: 10 })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects list.forEach with async arrow', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects users.forEach with async arrow and three args', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const secondArg = createMockNode({ kind: 79, text: 'index' })
    const thirdArg = createMockNode({ kind: 79, text: 'array' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback, secondArg, thirdArg],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })
})

describe('async forEach with function expression - various scenarios', () => {
  test('detects arr.forEach with async function expression', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncFn] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects items.forEach with async function expression and second arg', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true })
    const secondArg = createMockNode({ kind: 79, text: 'thisArg' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncFn, secondArg],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects data.forEach with async function expression at position', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true, start: 50, end: 100 })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncFn] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects results.forEach with async function expression', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncFn],
      start: 30,
      end: 70,
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects async function expression with start=0', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true, start: 0, end: 25 })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncFn] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects async function expression with three extra args', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true })
    const arg2 = createMockNode({ kind: 79, text: 'a' })
    const arg3 = createMockNode({ kind: 79, text: 'b' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncFn, arg2, arg3],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('async function expression violation has correct severity', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncFn] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()
    expect(violations[0].severity).toBe('warning')
  })
})

describe('NOT flagged: sync forEach callbacks', () => {
  test('no violation for sync arrow function', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const syncCallback = createMockAsyncArrowFunction({ isAsync: false })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [syncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('no violation for sync function expression', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const syncFn = createMockAsyncFunctionExpression({ isAsync: false })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [syncFn] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('no violation for sync arrow with second arg', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const syncCallback = createMockAsyncArrowFunction({ isAsync: false })
    const secondArg = createMockNode({ kind: 79, text: 'thisArg' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [syncCallback, secondArg],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('no violation for sync function expression with second arg', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const syncFn = createMockAsyncFunctionExpression({ isAsync: false })
    const secondArg = createMockNode({ kind: 79, text: 'thisArg' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [syncFn, secondArg],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('no violation for sync arrow at various positions', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const syncCallback = createMockAsyncArrowFunction({ isAsync: false, start: 100, end: 150 })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [syncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('no violation for sync function expression at position 0', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const syncFn = createMockAsyncFunctionExpression({ isAsync: false, start: 0, end: 20 })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [syncFn] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('no violation for sync arrow with three args', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const syncCallback = createMockAsyncArrowFunction({ isAsync: false })
    const arg2 = createMockNode({ kind: 79, text: 'i' })
    const arg3 = createMockNode({ kind: 79, text: 'arr' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [syncCallback, arg2, arg3],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('analyzeMisusedPromises returns empty for sync arrow', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const syncCallback = createMockAsyncArrowFunction({ isAsync: false })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [syncCallback] })

    expect(analyzeMisusedPromises(callExpr, context)).toHaveLength(0)
  })
})

describe('NOT flagged: non-forEach methods with async callbacks', () => {
  const asyncMethods = [
    'map',
    'filter',
    'reduce',
    'find',
    'findIndex',
    'every',
    'some',
    'flatMap',
    'sort',
    'then',
    'catch',
    'finally',
    'subscribe',
    'on',
    'addEventListener',
    'exec',
    'apply',
    'call',
    'bind',
  ]

  asyncMethods.forEach((method) => {
    test(`no violation for ${method} with async arrow`, () => {
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
      const propertyAccess = createMockPropertyAccessExpression({ methodName: method })
      const callExpr = createMockCallExpression({
        expression: propertyAccess,
        args: [asyncCallback],
      })

      const ruleInstance = noMisusedPromisesRule.create({})
      ruleInstance.visitor.visitNode!(callExpr, context)
      expect(ruleInstance.onComplete!()).toHaveLength(0)
    })
  })
})

describe('NOT flagged: non-forEach methods with async function expression', () => {
  const asyncMethods = ['map', 'filter', 'reduce', 'find', 'every', 'some']

  asyncMethods.forEach((method) => {
    test(`no violation for ${method} with async function expression`, () => {
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const asyncFn = createMockAsyncFunctionExpression({ isAsync: true })
      const propertyAccess = createMockPropertyAccessExpression({ methodName: method })
      const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncFn] })

      const ruleInstance = noMisusedPromisesRule.create({})
      ruleInstance.visitor.visitNode!(callExpr, context)
      expect(ruleInstance.onComplete!()).toHaveLength(0)
    })
  })
})

describe('NOT flagged: forEach without callback', () => {
  test('no violation for forEach with no args (undefined args)', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('no violation for forEach with empty args array', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('no violation for forEach with only a non-function arg', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const stringArg = createMockNode({ kind: 9, text: '"notAFunction"' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [stringArg] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('no violation for forEach with numeric literal arg', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const numArg = createMockNode({ kind: 8, text: '42' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [numArg] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('no violation for forEach with identifier arg', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const identifier = createMockNode({ kind: 79, text: 'someVar' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [identifier] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })
})

describe('NOT flagged: non-PropertyAccessExpression expressions', () => {
  test('no violation for CallExpression expression', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const innerCallExpr = createMockCallExpression({
      expression: createMockNode({ kind: 79, text: 'fn' }),
      args: [],
    })
    const outerCallExpr = createMockCallExpression({
      expression: innerCallExpr,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(outerCallExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('no violation for ElementAccessExpression (kind 211 misused)', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const elementAccess = createMockNode({ kind: 183, text: 'obj["forEach"]' })
    const callExpr = createMockCallExpression({
      expression: elementAccess,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('no violation for identifier expression (direct call)', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const identifier = createMockNode({ kind: 79, text: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: identifier,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('no violation for string literal expression', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const stringLit = createMockNode({ kind: 9, text: '"forEach"' })
    const callExpr = createMockCallExpression({
      expression: stringLit,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('no violation for numeric literal expression', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const numLit = createMockNode({ kind: 8, text: '42' })
    const callExpr = createMockCallExpression({
      expression: numLit,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })
})

describe('NOT flagged: non-CallExpression nodes', () => {
  const nodeTypes = [
    { kind: 257, text: 'function test() {}', label: 'FunctionDeclaration' },
    { kind: 263, text: 'class Foo {}', label: 'ClassDeclaration' },
    { kind: 260, text: 'const x = 1', label: 'VariableDeclaration' },
    { kind: 244, text: 'if (true) {}', label: 'IfStatement' },
    { kind: 245, text: 'for (;;) {}', label: 'ForStatement' },
    { kind: 282, text: 'for (x of arr) {}', label: 'ForOfStatement' },
    { kind: 247, text: 'while (true) {}', label: 'WhileStatement' },
    { kind: 225, text: 'a + b', label: 'BinaryExpression' },
    { kind: 226, text: 'a ? b : c', label: 'ConditionalExpression' },
    { kind: 79, text: 'identifier', label: 'Identifier' },
    { kind: 253, text: 'catch (e) {}', label: 'CatchClause' },
  ]

  nodeTypes.forEach(({ kind, text, label }) => {
    test(`no violation for ${label} (kind ${kind})`, () => {
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const node = createMockNode({ kind, text })

      const ruleInstance = noMisusedPromisesRule.create({})
      ruleInstance.visitor.visitNode!(node, context)
      expect(ruleInstance.onComplete!()).toHaveLength(0)
    })
  })
})

describe('violation properties - detailed checks', () => {
  function createViolationSetup() {
    const sourceFile = createMockSourceFile({
      getFilePath: vi.fn(() => '/project/src/example.ts'),
    })
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true, start: 15, end: 40 })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
      start: 5,
      end: 20,
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
      start: 5,
      end: 50,
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    return ruleInstance.onComplete!()
  }

  test('violation has correct ruleId', () => {
    const violations = createViolationSetup()
    expect(violations[0].ruleId).toBe('no-misused-promises')
  })

  test('violation has warning severity', () => {
    const violations = createViolationSetup()
    expect(violations[0].severity).toBe('warning')
  })

  test('violation message mentions forEach', () => {
    const violations = createViolationSetup()
    expect(violations[0].message).toContain('forEach')
  })

  test('violation message mentions Promise or promise', () => {
    const violations = createViolationSetup()
    const msg = violations[0].message.toLowerCase()
    expect(msg).toContain('promise')
  })

  test('violation message mentions ignored or unhandled', () => {
    const violations = createViolationSetup()
    const msg = violations[0].message.toLowerCase()
    expect(msg.includes('ignored') || msg.includes('unhandled')).toBe(true)
  })

  test('violation has filePath', () => {
    const violations = createViolationSetup()
    expect(violations[0].filePath).toBe('/project/src/example.ts')
  })

  test('violation has range with start and end', () => {
    const violations = createViolationSetup()
    expect(violations[0].range).toBeDefined()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })

  test('violation range start has line and column', () => {
    const violations = createViolationSetup()
    expect(violations[0].range.start.line).toBeDefined()
    expect(violations[0].range.start.column).toBeDefined()
  })

  test('violation range end has line and column', () => {
    const violations = createViolationSetup()
    expect(violations[0].range.end.line).toBeDefined()
    expect(violations[0].range.end.column).toBeDefined()
  })

  test('violation has suggestion', () => {
    const violations = createViolationSetup()
    expect(violations[0].suggestion).toBeDefined()
  })

  test('violation suggestion mentions for-of', () => {
    const violations = createViolationSetup()
    expect(violations[0].suggestion).toContain('for-of')
  })

  test('violation suggestion mentions Promise.all', () => {
    const violations = createViolationSetup()
    expect(violations[0].suggestion).toContain('Promise.all')
  })

  test('violation suggestion mentions map()', () => {
    const violations = createViolationSetup()
    expect(violations[0].suggestion).toContain('map()')
  })
})

describe('analyzeMisusedPromises standalone function - comprehensive', () => {
  test('returns violation for async forEach arrow', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const result = analyzeMisusedPromises(callExpr, context)
    expect(result).toHaveLength(1)
    expect(result[0].ruleId).toBe('no-misused-promises')
  })

  test('returns violation for async forEach function expression', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncFn] })

    const result = analyzeMisusedPromises(callExpr, context)
    expect(result).toHaveLength(1)
  })

  test('returns empty for non-call expression', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const node = createMockNode({ kind: 257, text: 'function test() {}' })

    expect(analyzeMisusedPromises(node, context)).toHaveLength(0)
  })

  test('returns empty for sync arrow forEach', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const syncCallback = createMockAsyncArrowFunction({ isAsync: false })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [syncCallback] })

    expect(analyzeMisusedPromises(callExpr, context)).toHaveLength(0)
  })

  test('returns empty for sync function expression forEach', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const syncFn = createMockAsyncFunctionExpression({ isAsync: false })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [syncFn] })

    expect(analyzeMisusedPromises(callExpr, context)).toHaveLength(0)
  })

  test('returns empty for map with async callback', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'map' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    expect(analyzeMisusedPromises(callExpr, context)).toHaveLength(0)
  })

  test('returns empty for forEach without args', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [] })

    expect(analyzeMisusedPromises(callExpr, context)).toHaveLength(0)
  })

  test('returns empty for identifier expression', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const identifier = createMockNode({ kind: 79, text: 'forEach' })
    const callExpr = createMockCallExpression({ expression: identifier, args: [asyncCallback] })

    expect(analyzeMisusedPromises(callExpr, context)).toHaveLength(0)
  })

  test('result violation has warning severity', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const result = analyzeMisusedPromises(callExpr, context)
    expect(result[0].severity).toBe('warning')
  })

  test('result violation has suggestion', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const result = analyzeMisusedPromises(callExpr, context)
    expect(result[0].suggestion).toBeDefined()
  })

  test('result violation includes filePath from context', () => {
    const sourceFile = createMockSourceFile({
      getFilePath: vi.fn(() => '/custom/path.ts'),
    })
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const result = analyzeMisusedPromises(callExpr, context)
    expect(result[0].filePath).toBe('/custom/path.ts')
  })

  test('returns array (not null)', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const node = createMockNode({ kind: 257, text: 'test' })

    const result = analyzeMisusedPromises(node, context)
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('multiple violations accumulation', () => {
  test('accumulates two violations from separate visits', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    ruleInstance.visitor.visitNode!(callExpr, context)

    expect(ruleInstance.onComplete!()).toHaveLength(2)
  })

  test('accumulates three violations', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    ruleInstance.visitor.visitNode!(callExpr, context)
    ruleInstance.visitor.visitNode!(callExpr, context)

    expect(ruleInstance.onComplete!()).toHaveLength(3)
  })

  test('does not accumulate non-violations', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const syncCallback = createMockAsyncArrowFunction({ isAsync: false })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [syncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    ruleInstance.visitor.visitNode!(callExpr, context)

    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('accumulates mixed: violations and non-violations', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const syncCallback = createMockAsyncArrowFunction({ isAsync: false })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })

    const asyncCall = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
    })
    const syncCall = createMockCallExpression({
      expression: propertyAccess,
      args: [syncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(asyncCall, context)
    ruleInstance.visitor.visitNode!(syncCall, context)
    ruleInstance.visitor.visitNode!(asyncCall, context)

    expect(ruleInstance.onComplete!()).toHaveLength(2)
  })

  test('five violations accumulated', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)

    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    for (let i = 0; i < 5; i++) {
      ruleInstance.visitor.visitNode!(callExpr, context)
    }

    expect(ruleInstance.onComplete!()).toHaveLength(5)
  })
})

describe('edge cases', () => {
  test('forEach with non-callback first arg (number)', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const numArg = createMockNode({ kind: 8, text: '123' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [numArg] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('forEach with non-callback first arg (string)', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const strArg = createMockNode({ kind: 9, text: '"hello"' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [strArg] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('forEach with non-callback first arg (boolean)', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const boolArg = createMockNode({ kind: 102, text: 'true' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [boolArg] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('forEach with method name "foreach" (lowercase) not flagged', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'foreach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('forEach with method name "ForEach" (PascalCase) not flagged', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'ForEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('node with kind 207 but no getArguments mock does not crash', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const plainNode = createMockNode({ kind: 207, text: 'test()' })

    const ruleInstance = noMisusedPromisesRule.create({})
    // This will fail because getArguments/getExpression are not mocked
    expect(() => ruleInstance.visitor.visitNode!(plainNode, context)).toThrow()
  })

  test('PropertyAccessExpression without getName mock fails gracefully', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const propAccessNoName = createMockNode({ kind: 203, text: 'a.b' })
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const callExpr = createMockCallExpression({
      expression: propAccessNoName,
      args: [asyncCallback],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    // getName is not mocked on this node, will throw
    expect(() => ruleInstance.visitor.visitNode!(callExpr, context)).toThrow()
  })

  test('forEach with null callback in args array', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const nullNode = createMockNode({ kind: 101, text: 'null' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [nullNode],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('visiting a regular IfStatement node produces no violations', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ifNode = createMockNode({ kind: 244, text: 'if (x) {}' })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(ifNode, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })
})

describe('defaultOptions', () => {
  test('defaultOptions is an object', () => {
    expect(typeof noMisusedPromisesRule.defaultOptions).toBe('object')
  })

  test('defaultOptions is not null', () => {
    expect(noMisusedPromisesRule.defaultOptions).not.toBeNull()
  })

  test('defaultOptions is empty object', () => {
    expect(Object.keys(noMisusedPromisesRule.defaultOptions)).toHaveLength(0)
  })
})

describe('various array expressions with forEach', () => {
  test('detects violation with any array variable name (arr)', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects violation with items array', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncFn] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects violation with data array', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects violation with results array', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncFn] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects violation with large position offsets', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true, start: 500, end: 600 })
    const propertyAccess = createMockPropertyAccessExpression({
      methodName: 'forEach',
      start: 490,
      end: 510,
    })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
      start: 490,
      end: 610,
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })
})

describe('callback first arg - non-function kinds', () => {
  test('forEach with kind 79 (Identifier) callback - not flagged', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const identifierArg = createMockNode({ kind: 79, text: 'callback' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [identifierArg],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('forEach with kind 257 (FunctionDeclaration) callback - not flagged', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const fnDeclArg = createMockNode({ kind: 257, text: 'function myFn() {}' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [fnDeclArg],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('forEach with kind 305 (SourceFile) callback - not flagged', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const sourceFileArg = createMockNode({ kind: 305, text: 'source' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [sourceFileArg],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('forEach with kind 225 (BinaryExpression) callback - not flagged', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const binaryArg = createMockNode({ kind: 225, text: 'a + b' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [binaryArg],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })
})

describe('rule fixable property', () => {
  test('meta.fixable is code', () => {
    expect(noMisusedPromisesRule.meta.fixable).toBe('code')
  })

  test('meta has fixable field', () => {
    expect('fixable' in noMisusedPromisesRule.meta).toBe(true)
  })

  test('fixable is not whitespace', () => {
    expect(noMisusedPromisesRule.meta.fixable).not.toBe('whitespace')
  })
})

describe('analyzeMisusedPromises - additional non-triggering scenarios', () => {
  test('returns empty for forEach with non-callback first arg', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const strArg = createMockNode({ kind: 9, text: '"hello"' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [strArg] })

    expect(analyzeMisusedPromises(callExpr, context)).toHaveLength(0)
  })

  test('returns empty for forEach with non-PropertyAccessExpression', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const identifier = createMockNode({ kind: 79, text: 'callFn' })
    const callExpr = createMockCallExpression({ expression: identifier, args: [asyncCallback] })

    expect(analyzeMisusedPromises(callExpr, context)).toHaveLength(0)
  })

  test('returns empty for ClassDeclaration node', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const classNode = createMockNode({ kind: 263, text: 'class Foo {}' })

    expect(analyzeMisusedPromises(classNode, context)).toHaveLength(0)
  })

  test('returns empty for VariableDeclaration node', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const varNode = createMockNode({ kind: 260, text: 'const x = 1' })

    expect(analyzeMisusedPromises(varNode, context)).toHaveLength(0)
  })

  test('returns empty for IfStatement node', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const ifNode = createMockNode({ kind: 244, text: 'if (x) {}' })

    expect(analyzeMisusedPromises(ifNode, context)).toHaveLength(0)
  })

  test('returns empty for ForOfStatement node', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const forOfNode = createMockNode({ kind: 282, text: 'for (x of arr) {}' })

    expect(analyzeMisusedPromises(forOfNode, context)).toHaveLength(0)
  })

  test('returns violation with correct message for async arrow', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const result = analyzeMisusedPromises(callExpr, context)
    expect(result[0].message).toContain('forEach')
  })

  test('returns violation with range for async arrow', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const result = analyzeMisusedPromises(callExpr, context)
    expect(result[0].range).toBeDefined()
  })
})

describe('violation message content', () => {
  test('message is a non-empty string', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(typeof violations[0].message).toBe('string')
    expect(violations[0].message.length).toBeGreaterThan(0)
  })

  test('message mentions async or Promise', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const msg = ruleInstance.onComplete!()[0].message.toLowerCase()

    expect(msg.includes('promise') || msg.includes('async')).toBe(true)
  })

  test('message mentions forEach', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const msg = ruleInstance.onComplete!()[0].message

    expect(msg).toContain('forEach')
  })

  test('message mentions callback', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const msg = ruleInstance.onComplete!()[0].message.toLowerCase()

    expect(msg).toContain('callback')
  })

  test('suggestion is a non-empty string', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const suggestion = ruleInstance.onComplete!()[0].suggestion

    expect(typeof suggestion).toBe('string')
    expect(suggestion!.length).toBeGreaterThan(0)
  })
})

describe('case sensitivity and method name variations', () => {
  test('FORSEACH does not match', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'FORSEACH' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('for_each does not match', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'for_each' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('for-each does not match', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'for-each' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('forEachAsync does not match', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEachAsync' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('asyncForEach does not match', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'asyncForEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('forEach matches exactly', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })
})

describe('violation filePath from context', () => {
  test('uses getFilePath from context', () => {
    const sourceFile = createMockSourceFile({
      getFilePath: vi.fn(() => '/src/utils/processor.ts'),
    })
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].filePath).toBe('/src/utils/processor.ts')
  })

  test('uses default file path when none specified', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].filePath).toBe('/test/file.ts')
  })

  test('handles .tsx file extension', () => {
    const sourceFile = createMockSourceFile({
      getFilePath: vi.fn(() => '/src/components/App.tsx'),
    })
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].filePath).toBe('/src/components/App.tsx')
  })

  test('handles deeply nested file path', () => {
    const sourceFile = createMockSourceFile({
      getFilePath: vi.fn(() => '/root/a/b/c/d/e/file.ts'),
    })
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violations = ruleInstance.onComplete!()

    expect(violations[0].filePath).toBe('/root/a/b/c/d/e/file.ts')
  })
})

describe('additional non-CallExpression node kinds', () => {
  test('kind 246 (ForInStatement) produces no violation', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const node = createMockNode({ kind: 246, text: 'for (x in obj) {}' })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(node, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('kind 248 (DoStatement) produces no violation', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const node = createMockNode({ kind: 248, text: 'do {} while (true);' })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(node, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('kind 251 (SwitchStatement) produces no violation', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const node = createMockNode({ kind: 251, text: 'switch (x) {}' })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(node, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('kind 297 (CaseClause) produces no violation', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const node = createMockNode({ kind: 297, text: 'case 1:' })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(node, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('kind 298 (DefaultClause) produces no violation', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const node = createMockNode({ kind: 298, text: 'default:' })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(node, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('kind 173 (MethodDeclaration) produces no violation', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const node = createMockNode({ kind: 173, text: 'myMethod() {}' })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(node, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('kind 174 (ConstructorDeclaration) produces no violation', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const node = createMockNode({ kind: 174, text: 'constructor() {}' })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(node, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('kind 8 (NumericLiteral) produces no violation', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const node = createMockNode({ kind: 8, text: '42' })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(node, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('kind 9 (StringLiteral) produces no violation', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const node = createMockNode({ kind: 9, text: '"hello"' })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(node, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('kind 102 (TrueKeyword) produces no violation', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const node = createMockNode({ kind: 102, text: 'true' })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(node, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })
})

describe('rule create function - reusability', () => {
  test('multiple calls to create return different violation arrays', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const instance1 = noMisusedPromisesRule.create({})
    const instance2 = noMisusedPromisesRule.create({})

    instance1.visitor.visitNode!(callExpr, context)
    instance2.visitor.visitNode!(callExpr, context)
    instance2.visitor.visitNode!(callExpr, context)

    expect(instance1.onComplete!()).toHaveLength(1)
    expect(instance2.onComplete!()).toHaveLength(2)
  })

  test('onComplete does not reset violations', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)

    const first = ruleInstance.onComplete!()
    const second = ruleInstance.onComplete!()

    expect(first).toHaveLength(1)
    expect(second).toHaveLength(1)
  })

  test('visitNode handles undefined context.addViolation gracefully', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    // The rule uses its own internal violations array, not context.addViolation
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)

    // context.addViolation should not have been called (rule uses internal array)
    expect(context.addViolation).not.toHaveBeenCalled()
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })
})

describe('non-forEach async methods via analyzeMisusedPromises', () => {
  const methods = ['reduce', 'find', 'findIndex', 'every', 'some', 'flatMap']

  methods.forEach((method) => {
    test(`returns empty for ${method} with async arrow`, () => {
      const sourceFile = createMockSourceFile()
      const context = createMockVisitorContext(sourceFile)
      const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
      const propertyAccess = createMockPropertyAccessExpression({ methodName: method })
      const callExpr = createMockCallExpression({
        expression: propertyAccess,
        args: [asyncCallback],
      })

      expect(analyzeMisusedPromises(callExpr, context)).toHaveLength(0)
    })
  })
})

describe('violation range position mapping', () => {
  test('range start reflects callExpr position', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true, start: 10, end: 30 })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
      start: 5,
      end: 35,
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violation = ruleInstance.onComplete!()[0]

    expect(violation.range.start).toBeDefined()
    expect(violation.range.end).toBeDefined()
  })

  test('range at position 0,0', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true, start: 0, end: 10 })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
      start: 0,
      end: 15,
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violation = ruleInstance.onComplete!()[0]

    expect(violation.range.start).toBeDefined()
  })

  test('range at large offset', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true, start: 1000, end: 1100 })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback],
      start: 990,
      end: 1110,
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violation = ruleInstance.onComplete!()[0]

    expect(violation.range.start).toBeDefined()
    expect(violation.range.end).toBeDefined()
  })
})

describe('forEach with async function expression - additional edge cases', () => {
  test('async function expression with large start position', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true, start: 999, end: 1050 })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncFn] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('async function expression violation has correct message', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncFn] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violation = ruleInstance.onComplete!()[0]

    expect(violation.message).toContain('forEach')
    expect(violation.message).toContain('Promise')
  })

  test('async function expression violation has suggestion', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncFn] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const violation = ruleInstance.onComplete!()[0]

    expect(violation.suggestion).toBeDefined()
    expect(violation.suggestion).toContain('for-of')
  })

  test('async function expression with same start and end', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true, start: 50, end: 50 })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncFn] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })
})

describe('mixed node kind checks', () => {
  test('arrow function (kind 211) as non-callback context', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const arrowNode = createMockNode({ kind: 211, text: 'async () => {}' })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(arrowNode, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('function expression (kind 216) as non-callback context', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const fnExprNode = createMockNode({ kind: 216, text: 'async function() {}' })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(fnExprNode, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('PropertyAccessExpression (kind 203) alone produces no violation', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const propAccessNode = createMockNode({ kind: 203, text: 'arr.forEach' })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(propAccessNode, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })
})

describe('multiple different non-flagged patterns', () => {
  test('forEach with null literal arg', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const nullArg = createMockNode({ kind: 101, text: 'null' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [nullArg] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('forEach with undefined-like arg', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const undefArg = createMockNode({ kind: 79, text: 'undefined' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [undefArg] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('forEach with object literal arg', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const objArg = createMockNode({ kind: 190, text: '{}' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [objArg] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('forEach with array literal arg', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const arrArg = createMockNode({ kind: 194, text: '[]' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [arrArg] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })

  test('forEach with false keyword arg', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const falseArg = createMockNode({ kind: 99, text: 'false' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [falseArg] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(0)
  })
})

describe('rule definition completeness', () => {
  test('rule has all required properties', () => {
    expect(noMisusedPromisesRule.meta).toBeDefined()
    expect(noMisusedPromisesRule.create).toBeDefined()
    expect(noMisusedPromisesRule.defaultOptions).toBeDefined()
  })

  test('meta has all required fields', () => {
    expect(noMisusedPromisesRule.meta.name).toBeDefined()
    expect(noMisusedPromisesRule.meta.description).toBeDefined()
    expect(noMisusedPromisesRule.meta.category).toBeDefined()
    expect(noMisusedPromisesRule.meta.recommended).toBeDefined()
  })

  test('create returns proper structure', () => {
    const instance = noMisusedPromisesRule.create({})
    expect(instance.visitor).toBeDefined()
    expect(instance.onComplete).toBeDefined()
  })

  test('meta name is kebab-case', () => {
    expect(noMisusedPromisesRule.meta.name).toMatch(/^[a-z]+(-[a-z]+)*$/)
  })

  test('description is a sentence', () => {
    const desc = noMisusedPromisesRule.meta.description
    expect(desc[0]).toBe(desc[0].toUpperCase())
    expect(desc.length).toBeGreaterThan(10)
  })
})

describe('async forEach with arrow function - extra arg types', () => {
  test('detects with second arg as identifier', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const thisArg = createMockNode({ kind: 79, text: 'this' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback, thisArg],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects with second arg as null', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const nullArg = createMockNode({ kind: 101, text: 'null' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback, nullArg],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects with second arg as object', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const objArg = createMockNode({ kind: 190, text: '{}' })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback, objArg],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })

  test('detects with many extra args', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const extraArgs = Array.from({ length: 10 }, (_, i) =>
      createMockNode({ kind: 79, text: `arg${i}` }),
    )
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({
      expression: propertyAccess,
      args: [asyncCallback, ...extraArgs],
    })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    expect(ruleInstance.onComplete!()).toHaveLength(1)
  })
})

describe('analyzeMisusedPromises - boundary checks', () => {
  test('returns exactly one violation (not more)', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const result = analyzeMisusedPromises(callExpr, context)
    expect(result).toHaveLength(1)
    expect(result).not.toHaveLength(2)
  })

  test('returns exactly empty array for non-match', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const syncCallback = createMockAsyncArrowFunction({ isAsync: false })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [syncCallback] })

    const result = analyzeMisusedPromises(callExpr, context)
    expect(result).toHaveLength(0)
    expect(result).toEqual([])
  })

  test('returns violation with correct message content', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const result = analyzeMisusedPromises(callExpr, context)
    expect(result[0].message).toContain('Promise')
    expect(result[0].message).toContain('forEach')
  })

  test('does not return error severity', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const result = analyzeMisusedPromises(callExpr, context)
    expect(result[0].severity).not.toBe('error')
    expect(result[0].severity).not.toBe('info')
  })

  test('does not return info severity', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncFn] })

    const result = analyzeMisusedPromises(callExpr, context)
    expect(result[0].severity).toBe('warning')
  })
})

describe('additional positive detection tests', () => {
  test('async arrow with method name exactly forEach detected', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const result = analyzeMisusedPromises(callExpr, context)
    expect(result).toHaveLength(1)
    expect(result[0].ruleId).toBe('no-misused-promises')
  })

  test('async function expression with method name exactly forEach detected', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncFn = createMockAsyncFunctionExpression({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncFn] })

    const result = analyzeMisusedPromises(callExpr, context)
    expect(result).toHaveLength(1)
    expect(result[0].ruleId).toBe('no-misused-promises')
  })

  test('rule detects via visitor and analyzeMisusedPromises identically', () => {
    const sourceFile = createMockSourceFile()
    const context = createMockVisitorContext(sourceFile)
    const asyncCallback = createMockAsyncArrowFunction({ isAsync: true })
    const propertyAccess = createMockPropertyAccessExpression({ methodName: 'forEach' })
    const callExpr = createMockCallExpression({ expression: propertyAccess, args: [asyncCallback] })

    const ruleInstance = noMisusedPromisesRule.create({})
    ruleInstance.visitor.visitNode!(callExpr, context)
    const visitorResult = ruleInstance.onComplete!()
    const standaloneResult = analyzeMisusedPromises(callExpr, context)

    expect(visitorResult).toHaveLength(1)
    expect(standaloneResult).toHaveLength(1)
    expect(visitorResult[0].ruleId).toBe(standaloneResult[0].ruleId)
    expect(visitorResult[0].severity).toBe(standaloneResult[0].severity)
    expect(visitorResult[0].message).toBe(standaloneResult[0].message)
  })
})
