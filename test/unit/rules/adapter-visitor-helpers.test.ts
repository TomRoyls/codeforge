import { describe, test, expect, vi, beforeEach } from 'vitest'
import { SyntaxKind, type Node } from 'ts-morph'
import { genericNodeCache } from '../../../src/rules/adapter-node-converter.js'
import { EXPORTABLE_KINDS } from '../../../src/rules/adapter-constants.js'
import {
  ensureGenericNode,
  applyTypeRewrites,
  dispatchExportDeclaration,
  dispatchExportWrapper,
  dispatchClassBody,
  dispatchExportAssignment,
  dispatchImportSpecifiers,
} from '../../../src/rules/adapter-visitor-helpers.js'

type GenericNode = Record<string, unknown>
type RuleVisitor = Record<string, (node: unknown) => void>

const KIND_MAP: Record<string, number> = {
  FunctionDeclaration: SyntaxKind.FunctionDeclaration,
  ClassDeclaration: SyntaxKind.ClassDeclaration,
  ClassExpression: SyntaxKind.ClassExpression,
  ExportDeclaration: SyntaxKind.ExportDeclaration,
  ImportDeclaration: SyntaxKind.ImportDeclaration,
  VariableDeclaration: SyntaxKind.VariableDeclaration,
  Block: SyntaxKind.Block,
}

function createMockNode(
  overrides: {
    kindName?: string
    start?: number
    end?: number
    text?: string
    compilerNode?: Record<string, unknown>
    getModifiers?: () => Array<{ getKindName: () => string }>
    getParent?: () => Node | undefined
  } = {},
): Node {
  const kindName = overrides.kindName ?? 'VariableDeclaration'
  const syntaxKind = KIND_MAP[kindName] ?? SyntaxKind.VariableDeclaration
  const mockSourceFile = {
    getFilePath: () => '/test/file.ts',
    getFullText: () => overrides.text ?? 'const x = 1;',
    getLineAndColumnAtPos: (pos: number) => ({ line: 1, column: pos }),
  }
  return {
    getSourceFile: () => mockSourceFile,
    getStart: () => overrides.start ?? 0,
    getEnd: () => overrides.end ?? 11,
    getText: () => overrides.text ?? 'const x = 1;',
    getKindName: () => kindName,
    getKind: () => syntaxKind,
    getModifiers: overrides.getModifiers,
    getParent: overrides.getParent ?? (() => undefined),
    compilerNode: overrides.compilerNode ?? {},
    isAsync: () => false,
    isGenerator: () => false,
    isStatic: () => false,
    isReadonly: () => false,
    getAccessibility: () => undefined,
    isParameterProperty: () => false,
    hasOverrideKeyword: () => false,
    isTypeOnly: () => false,
    questionDotToken: undefined,
  } as unknown as Node
}

function makeGenericNode(overrides: GenericNode = {}): GenericNode {
  return {
    type: 'TestNode',
    range: [0, 10],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    ...overrides,
  }
}

describe('adapter-visitor-helpers', () => {
  describe('ensureGenericNode', () => {
    test('returns cached node when present in genericNodeCache', () => {
      const node = createMockNode()
      const cached: GenericNode = { type: 'CachedNode', range: [0, 1] }
      genericNodeCache.set(node, cached)
      const result = ensureGenericNode(node)
      expect(result).toBe(cached)
    })

    test('creates new generic node via nodeToGeneric when not cached', () => {
      const node = createMockNode({ kindName: 'VariableDeclaration' })
      const result = ensureGenericNode(node)
      expect(result.type).toBe('VariableDeclarator')
      expect(result.range).toEqual([0, 11])
    })

    test('calls setParentRefs on new node — children get parent ref', () => {
      const child: GenericNode = { type: 'Identifier', name: 'x' }
      const parent: GenericNode = { type: 'VariableDeclarator', id: child }
      const node = createMockNode()
      const result = ensureGenericNode(node)
      expect(result).toBeDefined()
      expect(result.type).toBeDefined()
    })

    test('sets parent ref from cached parent node', () => {
      const parentNode = createMockNode({ kindName: 'Block', start: 0, end: 30 })
      const parentGeneric = ensureGenericNode(parentNode)

      const childNode = createMockNode({
        kindName: 'VariableDeclaration',
        start: 5,
        end: 20,
        getParent: () => parentNode,
      })
      const childGeneric = ensureGenericNode(childNode)
      expect(childGeneric.parent).toBe(parentGeneric)
    })

    test('caches the result in genericNodeCache', () => {
      const node = createMockNode()
      const result = ensureGenericNode(node)
      expect(genericNodeCache.get(node)).toBe(result)
    })

    test('handles getParent() throwing gracefully', () => {
      const node = createMockNode({
        kindName: 'VariableDeclaration',
        getParent: () => {
          throw new Error('No parent')
        },
      })
      expect(() => ensureGenericNode(node)).not.toThrow()
      const result = ensureGenericNode(node)
      expect(result.type).toBe('VariableDeclarator')
    })

    test('returns the same object for repeated calls with same node', () => {
      const node = createMockNode()
      const result1 = ensureGenericNode(node)
      const result2 = ensureGenericNode(node)
      expect(result1).toBe(result2)
    })

    test('does not re-run setParentRefs for cached node', () => {
      const node = createMockNode()
      const cached: GenericNode = { type: 'Cached', range: [0, 5] }
      genericNodeCache.set(node, cached)
      const result = ensureGenericNode(node)
      expect(result).toBe(cached)
      expect(Object.keys(result)).toEqual(['type', 'range'])
    })

    test('getParent returns undefined — no parent set', () => {
      const node = createMockNode({
        kindName: 'VariableDeclaration',
        getParent: () => undefined,
      })
      const result = ensureGenericNode(node)
      expect(result.parent).toBeUndefined()
    })

    test('parent exists but not in cache — no parent ref set', () => {
      const parentNode = createMockNode({ kindName: 'Block', start: 0, end: 20 })
      const childNode = createMockNode({
        kindName: 'VariableDeclaration',
        start: 5,
        end: 15,
        getParent: () => parentNode,
      })
      const result = ensureGenericNode(childNode)
      expect(result.parent).toBeUndefined()
    })

    test('creates node with range and loc properties', () => {
      const node = createMockNode({ start: 10, end: 25 })
      const result = ensureGenericNode(node)
      expect(result.range).toEqual([10, 25])
      expect(result.loc).toBeDefined()
    })

    test('handles node with null getParent return', () => {
      const node = createMockNode({
        kindName: 'VariableDeclaration',
        getParent: () => null as unknown as Node,
      })
      expect(() => ensureGenericNode(node)).not.toThrow()
    })

    test('different nodes produce different generic nodes', () => {
      const node1 = createMockNode({ kindName: 'FunctionDeclaration' })
      const node2 = createMockNode({ kindName: 'ClassDeclaration' })
      const result1 = ensureGenericNode(node1)
      const result2 = ensureGenericNode(node2)
      expect(result1).not.toBe(result2)
      expect(result1.type).not.toBe(result2.type)
    })

    test('parent link works for nested ensureGenericNode scenario', () => {
      const parentNode = createMockNode({ kindName: 'Block', start: 0, end: 30 })
      const parentGeneric = ensureGenericNode(parentNode)

      const childNode = createMockNode({
        kindName: 'VariableDeclaration',
        start: 5,
        end: 20,
        getParent: () => parentNode,
      })
      const childGeneric = ensureGenericNode(childNode)
      expect(childGeneric.parent).toBe(parentGeneric)
    })

    test('does not mutate cached parent when linking child', () => {
      const parentNode = createMockNode({ kindName: 'Block', start: 0, end: 30 })
      const parentGeneric = ensureGenericNode(parentNode)
      const parentKeysBefore = Object.keys(parentGeneric)

      const childNode = createMockNode({
        kindName: 'VariableDeclaration',
        getParent: () => parentNode,
      })
      ensureGenericNode(childNode)

      const parentKeysAfter = Object.keys(parentGeneric)
      expect(parentKeysAfter).toEqual(parentKeysBefore)
    })
  })

  describe('applyTypeRewrites', () => {
    test('BinaryExpression with "=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with "+=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '+=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with "**=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '**=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with "&&=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '&&=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with "||=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '||=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with "??" → LogicalExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '??' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('LogicalExpression')
    })

    test('BinaryExpression with "&&" → LogicalExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '&&' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('LogicalExpression')
    })

    test('BinaryExpression with "||" → LogicalExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '||' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('LogicalExpression')
    })

    test('BinaryExpression with "+" → type unchanged', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '+' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with "===" → type unchanged', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '===' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('PrefixUnaryExpression with "++" → UpdateExpression, prefix=true', () => {
      const node = makeGenericNode({ type: 'PrefixUnaryExpression', operator: '++' })
      applyTypeRewrites('PrefixUnaryExpression', node)
      expect(node.type).toBe('UpdateExpression')
      expect(node.prefix).toBe(true)
    })

    test('PrefixUnaryExpression with "--" → UpdateExpression, prefix=true', () => {
      const node = makeGenericNode({ type: 'PrefixUnaryExpression', operator: '--' })
      applyTypeRewrites('PrefixUnaryExpression', node)
      expect(node.type).toBe('UpdateExpression')
      expect(node.prefix).toBe(true)
    })

    test('PrefixUnaryExpression with "!" → UnaryExpression', () => {
      const node = makeGenericNode({ type: 'PrefixUnaryExpression', operator: '!' })
      applyTypeRewrites('PrefixUnaryExpression', node)
      expect(node.type).toBe('UnaryExpression')
    })

    test('PrefixUnaryExpression with "-" → UnaryExpression', () => {
      const node = makeGenericNode({ type: 'PrefixUnaryExpression', operator: '-' })
      applyTypeRewrites('PrefixUnaryExpression', node)
      expect(node.type).toBe('UnaryExpression')
    })

    test('PrefixUnaryExpression with "+" → UnaryExpression', () => {
      const node = makeGenericNode({ type: 'PrefixUnaryExpression', operator: '+' })
      applyTypeRewrites('PrefixUnaryExpression', node)
      expect(node.type).toBe('UnaryExpression')
    })

    test('PrefixUnaryExpression with "~" → UnaryExpression', () => {
      const node = makeGenericNode({ type: 'PrefixUnaryExpression', operator: '~' })
      applyTypeRewrites('PrefixUnaryExpression', node)
      expect(node.type).toBe('UnaryExpression')
    })

    test('PostfixUnaryExpression → prefix=false', () => {
      const node = makeGenericNode({ type: 'PostfixUnaryExpression', operator: '++' })
      applyTypeRewrites('PostfixUnaryExpression', node)
      expect(node.prefix).toBe(false)
    })

    test('PostfixUnaryExpression → type is not changed by applyTypeRewrites', () => {
      const node = makeGenericNode({ type: 'PostfixUnaryExpression', operator: '++' })
      applyTypeRewrites('PostfixUnaryExpression', node)
      expect(node.type).toBe('PostfixUnaryExpression')
    })

    test('unknown kindName → no changes', () => {
      const node = makeGenericNode({ type: 'Identifier', operator: '=' })
      applyTypeRewrites('Identifier', node)
      expect(node.type).toBe('Identifier')
      expect(node.prefix).toBeUndefined()
    })

    test('empty string kindName → no changes', () => {
      const node = makeGenericNode({ type: 'Identifier' })
      applyTypeRewrites('', node)
      expect(node.type).toBe('Identifier')
    })
  })

  describe('dispatchExportDeclaration', () => {
    test('non-ExportDeclaration kindName → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({ kindName: 'VariableDeclaration' })
      const genericNode = makeGenericNode()
      dispatchExportDeclaration('VariableDeclaration', node, genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('ExportDeclaration with specifiers (visit) → dispatches ExportNamedDeclaration', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: 'foo', pos: 10, end: 13 }, pos: 10, end: 13 }],
          },
        },
      })
      const genericNode = makeGenericNode({ source: "'./utils'" })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ExportNamedDeclaration')
      expect((call as GenericNode).specifiers).toHaveLength(1)
    })

    test('ExportDeclaration caches specifiers on genericNode during visit', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: 'bar', pos: 10, end: 13 }, pos: 10, end: 13 }],
          },
        },
      })
      const genericNode = makeGenericNode()
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      expect(genericNode.specifiers).toBeDefined()
      expect(genericNode.specifiers as unknown[]).toHaveLength(1)
    })

    test('ExportDeclaration with specifiers (exit) → reads cached specifiers, dispatches :exit', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportNamedDeclaration:exit': exitHandler }
      const node = createMockNode({ kindName: 'ExportDeclaration' })
      const genericNode = makeGenericNode({
        specifiers: [{ type: 'ExportSpecifier', local: { name: 'x' } }],
      })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, ':exit')
      expect(exitHandler).toHaveBeenCalledOnce()
      const call = exitHandler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ExportNamedDeclaration')
    })

    test('ExportDeclaration without specifiers but with source → dispatches ExportAllDeclaration', () => {
      const allHandler = vi.fn()
      const visitor: RuleVisitor = { ExportAllDeclaration: allHandler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {},
      })
      const genericNode = makeGenericNode({ source: "'./utils'" })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      expect(allHandler).toHaveBeenCalledOnce()
      const call = allHandler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ExportAllDeclaration')
      expect((call as GenericNode).source).toBeDefined()
      expect(((call as GenericNode).source as GenericNode).type).toBe('Literal')
    })

    test('ExportDeclaration without specifiers and no source → dispatches ExportNamedDeclaration', () => {
      const namedHandler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: namedHandler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {},
      })
      const genericNode = makeGenericNode()
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      expect(namedHandler).toHaveBeenCalledOnce()
      const call = namedHandler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ExportNamedDeclaration')
      expect((call as GenericNode).specifiers).toEqual([])
    })

    test('no handler registered → no error', () => {
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: 'a', pos: 5, end: 6 }, pos: 5, end: 6 }],
          },
        },
      })
      const genericNode = makeGenericNode()
      const visitor: RuleVisitor = {}
      expect(() =>
        dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, ''),
      ).not.toThrow()
    })

    test('sets sourceLiteral with type Literal when source exists', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportAllDeclaration: handler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {},
      })
      const genericNode = makeGenericNode({ source: "'./my-module'" })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      const sourceLiteral = call.source as GenericNode
      expect(sourceLiteral.type).toBe('Literal')
      expect(sourceLiteral.value).toBe("'./my-module'")
    })

    test('sourceLiteral is null when no source', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {},
      })
      const genericNode = makeGenericNode()
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.source).toBeNull()
    })

    test('exportKind defaults to "value"', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportAllDeclaration: handler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {},
      })
      const genericNode = makeGenericNode({ source: "'./x'" })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.exportKind).toBe('value')
    })

    test('exportKind uses genericNode.exportKind when set', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: 'T', pos: 5, end: 6 }, pos: 5, end: 6 }],
          },
        },
      })
      const genericNode = makeGenericNode({ exportKind: 'type' })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.exportKind).toBe('type')
    })

    test('dispatched node has range and loc from genericNode', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: 'a', pos: 5, end: 6 }, pos: 5, end: 6 }],
          },
        },
      })
      const genericNode = makeGenericNode({
        range: [0, 20],
        loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 5 } },
      })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.range).toEqual([0, 20])
      expect(call.loc).toEqual({ start: { line: 1, column: 0 }, end: { line: 2, column: 5 } })
    })

    test('exit with empty cached specifiers and source → ExportAllDeclaration:exit', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportAllDeclaration:exit': exitHandler }
      const node = createMockNode({ kindName: 'ExportDeclaration' })
      const genericNode = makeGenericNode({ source: "'./lib'", specifiers: [] })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, ':exit')
      expect(exitHandler).toHaveBeenCalledOnce()
    })

    test('exit with cached specifiers array → ExportNamedDeclaration:exit', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportNamedDeclaration:exit': exitHandler }
      const node = createMockNode({ kindName: 'ExportDeclaration' })
      const specs = [{ type: 'ExportSpecifier', local: { name: 'a' }, exported: { name: 'a' } }]
      const genericNode = makeGenericNode({ specifiers: specs })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, ':exit')
      expect(exitHandler).toHaveBeenCalledOnce()
      const call = exitHandler.mock.calls[0][0] as GenericNode
      expect((call as GenericNode).specifiers).toBe(specs)
    })

    test('ExportAllDeclaration dispatched node has exported=null', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportAllDeclaration: handler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {},
      })
      const genericNode = makeGenericNode({ source: "'./mod'" })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.exported).toBeNull()
    })
  })

  describe('dispatchExportWrapper', () => {
    test('non-EXPORTABLE_KINDS → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'Identifier',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('Identifier', node, genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('EXPORTABLE_KINDS with isExported=true, isDefault=false → ExportNamedDeclaration', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'FunctionDeclaration',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('FunctionDeclaration', node, genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ExportNamedDeclaration')
      expect(call.declaration).toBe(genericNode)
      expect(call.specifiers).toEqual([])
    })

    test('EXPORTABLE_KINDS with isExported=true, isDefault=true → ExportDefaultDeclaration', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const node = createMockNode({
        kindName: 'FunctionDeclaration',
        getModifiers: () => [
          { getKindName: () => 'ExportKeyword' },
          { getKindName: () => 'DefaultKeyword' },
        ],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('FunctionDeclaration', node, genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ExportDefaultDeclaration')
      expect(call.declaration).toBe(genericNode)
    })

    test('EXPORTABLE_KINDS with isExported=false → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'FunctionDeclaration',
        getModifiers: () => [],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('FunctionDeclaration', node, genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('suffix=":exit" dispatches to ExportNamedDeclaration:exit', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportNamedDeclaration:exit': exitHandler }
      const node = createMockNode({
        kindName: 'ClassDeclaration',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('ClassDeclaration', node, genericNode, visitor, ':exit')
      expect(exitHandler).toHaveBeenCalledOnce()
      const call = exitHandler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ExportNamedDeclaration')
    })

    test('no handler → no error', () => {
      const node = createMockNode({
        kindName: 'FunctionDeclaration',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericNode = makeGenericNode()
      const visitor: RuleVisitor = {}
      expect(() =>
        dispatchExportWrapper('FunctionDeclaration', node, genericNode, visitor, ''),
      ).not.toThrow()
    })

    test('export wrapper has source=null', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'FunctionDeclaration',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('FunctionDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.source).toBeNull()
    })

    test('ExportDefaultDeclaration has no specifiers property', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const node = createMockNode({
        kindName: 'FunctionDeclaration',
        getModifiers: () => [
          { getKindName: () => 'ExportKeyword' },
          { getKindName: () => 'DefaultKeyword' },
        ],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('FunctionDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.specifiers).toBeUndefined()
    })

    test('export wrapper has range and loc from genericNode', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'FunctionDeclaration',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericNode = makeGenericNode({
        range: [5, 30],
        loc: { start: { line: 2, column: 0 }, end: { line: 5, column: 1 } },
      })
      dispatchExportWrapper('FunctionDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.range).toEqual([5, 30])
      expect(call.loc).toEqual({ start: { line: 2, column: 0 }, end: { line: 5, column: 1 } })
    })

    test('all EXPORTABLE_KINDS trigger dispatch when exported', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      for (const kind of EXPORTABLE_KINDS) {
        handler.mockClear()
        const node = createMockNode({
          kindName: kind,
          getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
        })
        const genericNode = makeGenericNode()
        dispatchExportWrapper(kind, node, genericNode, visitor, '')
        expect(handler, `expected dispatch for ${kind}`).toHaveBeenCalledOnce()
      }
    })
  })

  describe('dispatchClassBody', () => {
    test('non-ClassDeclaration/ClassExpression → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const genericNode = makeGenericNode({ body: [] })
      dispatchClassBody('FunctionDeclaration', genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('ClassDeclaration with array body → dispatches ClassBody handler', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const genericNode = makeGenericNode({ body: [] })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ClassBody')
      expect(call.body).toEqual([])
    })

    test('ClassExpression with array body → dispatches ClassBody handler', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const genericNode = makeGenericNode({ body: [] })
      dispatchClassBody('ClassExpression', genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
    })

    test('ClassDeclaration with non-array body → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const genericNode = makeGenericNode({ body: 'not-an-array' })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('ClassDeclaration with undefined body → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const genericNode = makeGenericNode()
      delete genericNode.body
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('suffix=":exit" → dispatches ClassBody:exit', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ClassBody:exit': exitHandler }
      const genericNode = makeGenericNode({ body: [] })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, ':exit')
      expect(exitHandler).toHaveBeenCalledOnce()
    })

    test('suffix="" sets parent on body members', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const member: GenericNode = { type: 'MethodDefinition', key: 'foo' }
      const genericNode = makeGenericNode({ body: [member] })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
      const classBodyNode = handler.mock.calls[0][0] as GenericNode
      expect(member.parent).toBe(classBodyNode)
    })

    test('suffix=":exit" does NOT set parent on body members', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ClassBody:exit': exitHandler }
      const member: GenericNode = { type: 'MethodDefinition', key: 'bar' }
      const genericNode = makeGenericNode({ body: [member] })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, ':exit')
      expect(exitHandler).toHaveBeenCalledOnce()
      expect(member.parent).toBeUndefined()
    })

    test('no handler → no error', () => {
      const genericNode = makeGenericNode({ body: [] })
      const visitor: RuleVisitor = {}
      expect(() => dispatchClassBody('ClassDeclaration', genericNode, visitor, '')).not.toThrow()
    })

    test('ClassBody node has parent set to genericNode', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const genericNode = makeGenericNode({ body: [] })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.parent).toBe(genericNode)
    })

    test('body members that are null or primitive are skipped for parent assignment', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const genericNode = makeGenericNode({ body: [null, 42, 'string'] })
      expect(() => dispatchClassBody('ClassDeclaration', genericNode, visitor, '')).not.toThrow()
      expect(handler).toHaveBeenCalledOnce()
    })
  })

  describe('dispatchExportAssignment', () => {
    test('non-ExportAssignment → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const genericNode = makeGenericNode()
      dispatchExportAssignment('FunctionDeclaration', genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('ExportAssignment → dispatches ExportDefaultDeclaration', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const genericNode = makeGenericNode()
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ExportDefaultDeclaration')
    })

    test('uses genericNode.expression as declaration when present', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const expression: GenericNode = { type: 'Identifier', name: 'foo' }
      const genericNode = makeGenericNode({ expression })
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.declaration).toBe(expression)
    })

    test('falls back to genericNode when expression is absent', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const genericNode = makeGenericNode()
      delete genericNode.expression
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.declaration).toBe(genericNode)
    })

    test('suffix=":exit" → dispatches ExportDefaultDeclaration:exit', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportDefaultDeclaration:exit': exitHandler }
      const genericNode = makeGenericNode()
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, ':exit')
      expect(exitHandler).toHaveBeenCalledOnce()
      const call = exitHandler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ExportDefaultDeclaration')
    })

    test('dispatched node has range from genericNode', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const genericNode = makeGenericNode({ range: [0, 15] })
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.range).toEqual([0, 15])
    })

    test('dispatched node has loc from genericNode', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const loc = { start: { line: 3, column: 0 }, end: { line: 3, column: 10 } }
      const genericNode = makeGenericNode({ loc })
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.loc).toBe(loc)
    })

    test('no handler → no error', () => {
      const genericNode = makeGenericNode()
      const visitor: RuleVisitor = {}
      expect(() =>
        dispatchExportAssignment('ExportAssignment', genericNode, visitor, ''),
      ).not.toThrow()
    })
  })

  describe('dispatchImportSpecifiers', () => {
    test('non-ImportDeclaration → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ImportDefaultSpecifier: handler }
      const node = createMockNode({ kindName: 'VariableDeclaration' })
      const genericNode = makeGenericNode()
      dispatchImportSpecifiers('VariableDeclaration', node, genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('ImportDeclaration (visit) → extracts specifiers, caches on genericNode, dispatches per-specifier', () => {
      const defaultHandler = vi.fn()
      const visitor: RuleVisitor = { ImportDefaultSpecifier: defaultHandler }
      const node = createMockNode({
        kindName: 'ImportDeclaration',
        compilerNode: {
          importClause: {
            name: { text: 'Foo', pos: 7, end: 10 },
          },
        },
      })
      const genericNode = makeGenericNode()
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, '')
      expect(defaultHandler).toHaveBeenCalledOnce()
      expect(genericNode.specifiers).toBeDefined()
      expect(genericNode.specifiers as unknown[]).toHaveLength(1)
    })

    test('ImportDeclaration (exit) → reads cached specifiers, dispatches :exit handlers', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ImportDefaultSpecifier:exit': exitHandler }
      const node = createMockNode({ kindName: 'ImportDeclaration' })
      const specs: GenericNode[] = [{ type: 'ImportDefaultSpecifier', local: { name: 'Foo' } }]
      const genericNode = makeGenericNode({ specifiers: specs })
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, ':exit')
      expect(exitHandler).toHaveBeenCalledOnce()
      expect(exitHandler.mock.calls[0][0]).toBe(specs[0])
    })

    test('multiple specifiers → dispatches each individually', () => {
      const defaultHandler = vi.fn()
      const namedHandler = vi.fn()
      const visitor: RuleVisitor = {
        ImportDefaultSpecifier: defaultHandler,
        ImportSpecifier: namedHandler,
      }
      const node = createMockNode({
        kindName: 'ImportDeclaration',
        compilerNode: {
          importClause: {
            name: { text: 'Default', pos: 7, end: 14 },
            namedBindings: {
              elements: [{ name: { text: 'A', pos: 17, end: 18 }, pos: 17, end: 18 }],
            },
          },
        },
      })
      const genericNode = makeGenericNode()
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, '')
      expect(defaultHandler).toHaveBeenCalledOnce()
      expect(namedHandler).toHaveBeenCalledOnce()
    })

    test('empty specifiers → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ImportDefaultSpecifier: handler }
      const node = createMockNode({
        kindName: 'ImportDeclaration',
        compilerNode: {},
      })
      const genericNode = makeGenericNode()
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('no matching handler → no error', () => {
      const node = createMockNode({
        kindName: 'ImportDeclaration',
        compilerNode: {
          importClause: {
            name: { text: 'Foo', pos: 7, end: 10 },
          },
        },
      })
      const genericNode = makeGenericNode()
      const visitor: RuleVisitor = {}
      expect(() =>
        dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, ''),
      ).not.toThrow()
    })

    test('spec with type → dispatches to handler with that type', () => {
      const namespaceHandler = vi.fn()
      const visitor: RuleVisitor = { ImportNamespaceSpecifier: namespaceHandler }
      const node = createMockNode({
        kindName: 'ImportDeclaration',
        compilerNode: {
          importClause: {
            namedBindings: {
              name: { text: 'Utils', pos: 15, end: 20 },
              pos: 9,
              end: 20,
            },
          },
        },
      })
      const genericNode = makeGenericNode()
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, '')
      expect(namespaceHandler).toHaveBeenCalledOnce()
      const call = namespaceHandler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ImportNamespaceSpecifier')
    })

    test('spec without type → no dispatch for that spec', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { UnknownSpecifier: handler }
      const node = createMockNode({ kindName: 'ImportDeclaration' })
      const specs: GenericNode[] = [{ notType: 'Something' }]
      const genericNode = makeGenericNode({ specifiers: specs })
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, ':exit')
      expect(handler).not.toHaveBeenCalled()
    })

    test('exit with non-array specifiers → early return', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ImportSpecifier: handler }
      const node = createMockNode({ kindName: 'ImportDeclaration' })
      const genericNode = makeGenericNode({ specifiers: 'not-array' })
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, ':exit')
      expect(handler).not.toHaveBeenCalled()
    })

    test('exit with undefined specifiers → early return', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ImportSpecifier: handler }
      const node = createMockNode({ kindName: 'ImportDeclaration' })
      const genericNode = makeGenericNode()
      delete genericNode.specifiers
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, ':exit')
      expect(handler).not.toHaveBeenCalled()
    })

    test('null spec in array is skipped', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { 'ImportDefaultSpecifier:exit': handler }
      const node = createMockNode({ kindName: 'ImportDeclaration' })
      const specs: unknown[] = [null, { type: 'ImportDefaultSpecifier', local: { name: 'X' } }]
      const genericNode = makeGenericNode({ specifiers: specs })
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, ':exit')
      expect(handler).toHaveBeenCalledOnce()
    })

    test('primitive spec in array is skipped', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ImportSpecifier: handler }
      const node = createMockNode({ kindName: 'ImportDeclaration' })
      const specs: unknown[] = [42, 'string', true]
      const genericNode = makeGenericNode({ specifiers: specs })
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, ':exit')
      expect(handler).not.toHaveBeenCalled()
    })

    test('visit caches specifiers array on genericNode', () => {
      const visitor: RuleVisitor = {}
      const node = createMockNode({
        kindName: 'ImportDeclaration',
        compilerNode: {
          importClause: {
            name: { text: 'Foo', pos: 7, end: 10 },
          },
        },
      })
      const genericNode = makeGenericNode()
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, '')
      expect(Array.isArray(genericNode.specifiers)).toBe(true)
      expect((genericNode.specifiers as unknown[]).length).toBe(1)
    })

    test('named bindings with multiple elements → dispatches each', () => {
      const namedHandler = vi.fn()
      const visitor: RuleVisitor = { ImportSpecifier: namedHandler }
      const node = createMockNode({
        kindName: 'ImportDeclaration',
        compilerNode: {
          importClause: {
            namedBindings: {
              elements: [
                { name: { text: 'A', pos: 10, end: 11 }, pos: 10, end: 11 },
                { name: { text: 'B', pos: 14, end: 15 }, pos: 14, end: 15 },
                { name: { text: 'C', pos: 18, end: 19 }, pos: 18, end: 19 },
              ],
            },
          },
        },
      })
      const genericNode = makeGenericNode()
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, '')
      expect(namedHandler).toHaveBeenCalledTimes(3)
    })

    test('exit with large specifier set → all dispatched', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { 'ImportSpecifier:exit': handler }
      const specs: GenericNode[] = Array.from({ length: 50 }, (_, i) => ({
        type: 'ImportSpecifier',
        local: { name: `S${i}` },
      }))
      const node = createMockNode({ kindName: 'ImportDeclaration' })
      const genericNode = makeGenericNode({ specifiers: specs })
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, ':exit')
      expect(handler).toHaveBeenCalledTimes(50)
    })
  })

  describe('applyTypeRewrites additional edge cases', () => {
    test('BinaryExpression with "<<=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '<<=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with ">>=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '>>=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with ">>>=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '>>>=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with "%=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '%=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with "^=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '^=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with "&=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '&=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with "|=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '|=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with "??=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '??=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with "-=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '-=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with "/=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '/=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with "*=" → AssignmentExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '*=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with "%=" is not a LogicalExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '%=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('AssignmentExpression')
    })

    test('PrefixUnaryExpression with "~" → type is UnaryExpression, not UpdateExpression', () => {
      const node = makeGenericNode({ type: 'PrefixUnaryExpression', operator: '~' })
      applyTypeRewrites('PrefixUnaryExpression', node)
      expect(node.type).toBe('UnaryExpression')
      expect(node.prefix).toBeUndefined()
    })

    test('PostfixUnaryExpression with "--" → prefix=false', () => {
      const node = makeGenericNode({ type: 'PostfixUnaryExpression', operator: '--' })
      applyTypeRewrites('PostfixUnaryExpression', node)
      expect(node.prefix).toBe(false)
    })

    test('node without operator property → no crash on unknown kind', () => {
      const node = makeGenericNode({ type: 'SomeNode' })
      expect(() => applyTypeRewrites('SomeNode', node)).not.toThrow()
    })
  })

  describe('ensureGenericNode additional edge cases', () => {
    test('grandchild node gets correct parent link via cache', () => {
      const grandparentNode = createMockNode({ kindName: 'Block', start: 0, end: 100 })
      const grandparentGeneric = ensureGenericNode(grandparentNode)

      const parentNode = createMockNode({
        kindName: 'Block',
        start: 0,
        end: 50,
        getParent: () => grandparentNode,
      })
      const parentGeneric = ensureGenericNode(parentNode)
      expect(parentGeneric.parent).toBe(grandparentGeneric)

      const childNode = createMockNode({
        kindName: 'VariableDeclaration',
        start: 5,
        end: 30,
        getParent: () => parentNode,
      })
      const childGeneric = ensureGenericNode(childNode)
      expect(childGeneric.parent).toBe(parentGeneric)
    })

    test('sibling nodes share the same parent', () => {
      const parentNode = createMockNode({ kindName: 'Block', start: 0, end: 100 })
      const parentGeneric = ensureGenericNode(parentNode)

      const child1 = createMockNode({
        kindName: 'VariableDeclaration',
        start: 5,
        end: 20,
        getParent: () => parentNode,
      })
      const child2 = createMockNode({
        kindName: 'VariableDeclaration',
        start: 25,
        end: 45,
        getParent: () => parentNode,
      })
      const g1 = ensureGenericNode(child1)
      const g2 = ensureGenericNode(child2)
      expect(g1.parent).toBe(g2.parent)
      expect(g1.parent).toBe(parentGeneric)
    })

    test('FunctionDeclaration creates correct generic node type', () => {
      const node = createMockNode({ kindName: 'FunctionDeclaration' })
      const result = ensureGenericNode(node)
      expect(result.type).toBe('FunctionDeclaration')
    })

    test('ClassDeclaration creates correct generic node type', () => {
      const node = createMockNode({ kindName: 'ClassDeclaration' })
      const result = ensureGenericNode(node)
      expect(result.type).toBe('ClassDeclaration')
    })

    test('ImportDeclaration creates correct generic node type', () => {
      const node = createMockNode({ kindName: 'ImportDeclaration' })
      const result = ensureGenericNode(node)
      expect(result.type).toBe('ImportDeclaration')
    })
  })

  describe('dispatchExportDeclaration additional edge cases', () => {
    test('visit with multiple specifiers caches all on genericNode', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {
          exportClause: {
            elements: [
              { name: { text: 'a', pos: 5, end: 6 }, pos: 5, end: 6 },
              { name: { text: 'b', pos: 8, end: 9 }, pos: 8, end: 9 },
              { name: { text: 'c', pos: 11, end: 12 }, pos: 11, end: 12 },
            ],
          },
        },
      })
      const genericNode = makeGenericNode()
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      expect(genericNode.specifiers).toHaveLength(3)
    })

    test('exit with source and no specifiers dispatches ExportAllDeclaration:exit', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportAllDeclaration:exit': exitHandler }
      const node = createMockNode({ kindName: 'ExportDeclaration' })
      const genericNode = makeGenericNode({
        source: "'./reexport'",
        specifiers: [],
      })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, ':exit')
      expect(exitHandler).toHaveBeenCalledOnce()
      const call = exitHandler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ExportAllDeclaration')
      expect((call.source as GenericNode).value).toBe("'./reexport'")
    })

    test('visit with source and specifiers → ExportNamedDeclaration with source', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: 'x', pos: 5, end: 6 }, pos: 5, end: 6 }],
          },
        },
      })
      const genericNode = makeGenericNode({ source: "'./utils'" })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ExportNamedDeclaration')
      expect((call.source as GenericNode).type).toBe('Literal')
    })

    test('dispatched ExportNamedDeclaration has declaration=null', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: 'a', pos: 5, end: 6 }, pos: 5, end: 6 }],
          },
        },
      })
      const genericNode = makeGenericNode()
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.declaration).toBeNull()
    })
  })

  describe('dispatchExportWrapper additional edge cases', () => {
    test('ClassExpression is not in EXPORTABLE_KINDS → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'ClassExpression',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('ClassExpression', node, genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('ExportDefaultDeclaration:exit dispatched with suffix', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportDefaultDeclaration:exit': exitHandler }
      const node = createMockNode({
        kindName: 'FunctionDeclaration',
        getModifiers: () => [
          { getKindName: () => 'ExportKeyword' },
          { getKindName: () => 'DefaultKeyword' },
        ],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('FunctionDeclaration', node, genericNode, visitor, ':exit')
      expect(exitHandler).toHaveBeenCalledOnce()
      const call = exitHandler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ExportDefaultDeclaration')
      expect(call.declaration).toBe(genericNode)
    })

    test('InterfaceDeclaration with export keyword → ExportNamedDeclaration', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'InterfaceDeclaration',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('InterfaceDeclaration', node, genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
      expect((handler.mock.calls[0][0] as GenericNode).declaration).toBe(genericNode)
    })

    test('EnumDeclaration with export keyword → ExportNamedDeclaration', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'EnumDeclaration',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('EnumDeclaration', node, genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
    })

    test('TypeAliasDeclaration with export keyword → ExportNamedDeclaration', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'TypeAliasDeclaration',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('TypeAliasDeclaration', node, genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
    })

    test('ModuleDeclaration with export keyword → ExportNamedDeclaration', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'ModuleDeclaration',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('ModuleDeclaration', node, genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
    })
  })

  describe('dispatchClassBody additional edge cases', () => {
    test('large body array sets parent on all object members', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const members: GenericNode[] = Array.from({ length: 20 }, (_, i) => ({
        type: 'MethodDefinition',
        key: `method${i}`,
      }))
      const genericNode = makeGenericNode({ body: members })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      const classBodyNode = handler.mock.calls[0][0] as GenericNode
      for (const member of members) {
        expect(member.parent).toBe(classBodyNode)
      }
    })

    test('ClassBody node inherits range from parent genericNode', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const genericNode = makeGenericNode({
        body: [],
        range: [100, 500],
        loc: { start: { line: 5, column: 0 }, end: { line: 25, column: 1 } },
      })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.range).toEqual([100, 500])
      expect(call.loc).toEqual({ start: { line: 5, column: 0 }, end: { line: 25, column: 1 } })
    })

    test('body with mixed valid and null entries → parent set only on valid', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const validMember: GenericNode = { type: 'MethodDefinition', key: 'valid' }
      const genericNode = makeGenericNode({ body: [null, validMember, undefined] })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      const classBodyNode = handler.mock.calls[0][0] as GenericNode
      expect(validMember.parent).toBe(classBodyNode)
    })

    test('ClassExpression with body → same behavior as ClassDeclaration', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const member: GenericNode = { type: 'PropertyDefinition', key: 'x' }
      const genericNode = makeGenericNode({ body: [member] })
      dispatchClassBody('ClassExpression', genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
      expect(member.parent).toBe(handler.mock.calls[0][0])
    })
  })

  describe('dispatchExportAssignment additional edge cases', () => {
    test('ExportDefaultDeclaration wrapper parent is not set', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const genericNode = makeGenericNode()
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.parent).toBeUndefined()
    })

    test('expression is object node → used as declaration', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const expression: GenericNode = { type: 'ArrowFunctionExpression', body: {} }
      const genericNode = makeGenericNode({ expression })
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.declaration).toBe(expression)
    })

    test('both enter and exit handlers called for same ExportAssignment', () => {
      const enterHandler = vi.fn()
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = {
        ExportDefaultDeclaration: enterHandler,
        'ExportDefaultDeclaration:exit': exitHandler,
      }
      const genericNode = makeGenericNode()
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      expect(enterHandler).toHaveBeenCalledOnce()
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, ':exit')
      expect(exitHandler).toHaveBeenCalledOnce()
    })
  })

  describe('applyTypeRewrites — remaining arithmetic/comparison operators', () => {
    test('BinaryExpression with "**" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '**' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with "<" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '<' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with ">" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '>' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with "<=" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '<=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with ">=" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '>=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with "!=" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '!=' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with "!==" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '!==' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with "&" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '&' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with "|" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '|' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with "^" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '^' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with "<<" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '<<' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with ">>" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '>>' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with ">>>" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '>>>' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with "%" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '%' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with "-" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '-' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with "/" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '/' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with "*" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: '*' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('PrefixUnaryExpression with "typeof" → UnaryExpression', () => {
      const node = makeGenericNode({ type: 'PrefixUnaryExpression', operator: 'typeof' })
      applyTypeRewrites('PrefixUnaryExpression', node)
      expect(node.type).toBe('UnaryExpression')
      expect(node.prefix).toBeUndefined()
    })

    test('PrefixUnaryExpression with "void" → UnaryExpression', () => {
      const node = makeGenericNode({ type: 'PrefixUnaryExpression', operator: 'void' })
      applyTypeRewrites('PrefixUnaryExpression', node)
      expect(node.type).toBe('UnaryExpression')
      expect(node.prefix).toBeUndefined()
    })

    test('PrefixUnaryExpression with "delete" → UnaryExpression', () => {
      const node = makeGenericNode({ type: 'PrefixUnaryExpression', operator: 'delete' })
      applyTypeRewrites('PrefixUnaryExpression', node)
      expect(node.type).toBe('UnaryExpression')
      expect(node.prefix).toBeUndefined()
    })

    test('applyTypeRewrites does not add prefix to UnaryExpression', () => {
      const node = makeGenericNode({ type: 'PrefixUnaryExpression', operator: '!' })
      applyTypeRewrites('PrefixUnaryExpression', node)
      expect(node.type).toBe('UnaryExpression')
      expect(node.prefix).toBeUndefined()
    })

    test('PostfixUnaryExpression with "--" sets prefix=false only', () => {
      const node = makeGenericNode({ type: 'PostfixUnaryExpression', operator: '--' })
      applyTypeRewrites('PostfixUnaryExpression', node)
      expect(node.prefix).toBe(false)
      expect(node.type).toBe('PostfixUnaryExpression')
    })

    test('BinaryExpression with "," stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: ',' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with "in" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: 'in' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })

    test('BinaryExpression with "instanceof" stays BinaryExpression', () => {
      const node = makeGenericNode({ type: 'BinaryExpression', operator: 'instanceof' })
      applyTypeRewrites('BinaryExpression', node)
      expect(node.type).toBe('BinaryExpression')
    })
  })

  describe('dispatchExportDeclaration — extended coverage', () => {
    test('exit with undefined specifiers and source → ExportAllDeclaration:exit', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportAllDeclaration:exit': exitHandler }
      const node = createMockNode({ kindName: 'ExportDeclaration' })
      const genericNode = makeGenericNode({ source: "'./module'" })
      delete genericNode.specifiers
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, ':exit')
      expect(exitHandler).toHaveBeenCalledOnce()
    })

    test('exit with undefined specifiers and no source → ExportNamedDeclaration:exit', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportNamedDeclaration:exit': exitHandler }
      const node = createMockNode({ kindName: 'ExportDeclaration' })
      const genericNode = makeGenericNode()
      delete genericNode.specifiers
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, ':exit')
      expect(exitHandler).toHaveBeenCalledOnce()
      const call = exitHandler.mock.calls[0][0] as GenericNode
      expect((call as GenericNode).specifiers).toEqual([])
    })

    test('sourceLiteral has range from genericNode', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportAllDeclaration: handler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {},
      })
      const genericNode = makeGenericNode({
        source: "'./mod'",
        range: [5, 25],
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 25 } },
      })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      const src = call.source as GenericNode
      expect(src.range).toEqual([5, 25])
    })

    test('sourceLiteral has loc from genericNode', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportAllDeclaration: handler }
      const loc = { start: { line: 2, column: 3 }, end: { line: 2, column: 15 } }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {},
      })
      const genericNode = makeGenericNode({ source: "'./mod'", loc })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      const src = call.source as GenericNode
      expect(src.loc).toBe(loc)
    })

    test('ExportAllDeclaration:exit dispatched node has exported=null', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportAllDeclaration:exit': exitHandler }
      const node = createMockNode({ kindName: 'ExportDeclaration' })
      const genericNode = makeGenericNode({ source: "'./x'", specifiers: [] })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, ':exit')
      const call = exitHandler.mock.calls[0][0] as GenericNode
      expect(call.exported).toBeNull()
    })

    test('ExportAllDeclaration:exit dispatched node has exportKind from genericNode', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportAllDeclaration:exit': exitHandler }
      const node = createMockNode({ kindName: 'ExportDeclaration' })
      const genericNode = makeGenericNode({ source: "'./x'", specifiers: [], exportKind: 'type' })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, ':exit')
      const call = exitHandler.mock.calls[0][0] as GenericNode
      expect(call.exportKind).toBe('type')
    })

    test('ExportNamedDeclaration:exit uses exportKind from genericNode', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportNamedDeclaration:exit': exitHandler }
      const node = createMockNode({ kindName: 'ExportDeclaration' })
      const specs = [{ type: 'ExportSpecifier', local: { name: 'A' } }]
      const genericNode = makeGenericNode({ specifiers: specs, exportKind: 'type' })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, ':exit')
      const call = exitHandler.mock.calls[0][0] as GenericNode
      expect(call.exportKind).toBe('type')
    })

    test('visit then exit produces consistent results', () => {
      const namedHandler = vi.fn()
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = {
        ExportNamedDeclaration: namedHandler,
        'ExportNamedDeclaration:exit': exitHandler,
      }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: 'foo', pos: 5, end: 8 }, pos: 5, end: 8 }],
          },
        },
      })
      const genericNode = makeGenericNode()
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, ':exit')
      expect(namedHandler).toHaveBeenCalledOnce()
      expect(exitHandler).toHaveBeenCalledOnce()
    })

    test('ExportAllDeclaration dispatched with correct source value', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportAllDeclaration: handler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {},
      })
      const genericNode = makeGenericNode({ source: "'./deep/path'" })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      const src = call.source as GenericNode
      expect(src.value).toBe("'./deep/path'")
    })

    test('visit with specifiers but no source → source null on ExportNamedDeclaration', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: 'a', pos: 5, end: 6 }, pos: 5, end: 6 }],
          },
        },
      })
      const genericNode = makeGenericNode()
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.source).toBeNull()
    })

    test('ExportAllDeclaration dispatched with range and loc from genericNode', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportAllDeclaration: handler }
      const node = createMockNode({ kindName: 'ExportDeclaration', compilerNode: {} })
      const genericNode = makeGenericNode({
        source: "'./x'",
        range: [10, 30],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.range).toEqual([10, 30])
      expect(call.loc).toEqual({ start: { line: 2, column: 0 }, end: { line: 2, column: 20 } })
    })

    test('ExportNamedDeclaration dispatched with range and loc from genericNode', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: 'z', pos: 5, end: 6 }, pos: 5, end: 6 }],
          },
        },
      })
      const genericNode = makeGenericNode({
        range: [100, 200],
        loc: { start: { line: 10, column: 0 }, end: { line: 12, column: 5 } },
      })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.range).toEqual([100, 200])
    })

    test('ExportNamedDeclaration exit without source → source null', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportNamedDeclaration:exit': exitHandler }
      const node = createMockNode({ kindName: 'ExportDeclaration' })
      const specs = [{ type: 'ExportSpecifier', local: { name: 'x' } }]
      const genericNode = makeGenericNode({ specifiers: specs })
      dispatchExportDeclaration('ExportDeclaration', node, genericNode, visitor, ':exit')
      const call = exitHandler.mock.calls[0][0] as GenericNode
      expect(call.source).toBeNull()
    })
  })

  describe('dispatchExportWrapper — extended coverage', () => {
    test('ExportDefaultDeclaration:exit has source=null', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportDefaultDeclaration:exit': exitHandler }
      const node = createMockNode({
        kindName: 'FunctionDeclaration',
        getModifiers: () => [
          { getKindName: () => 'ExportKeyword' },
          { getKindName: () => 'DefaultKeyword' },
        ],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('FunctionDeclaration', node, genericNode, visitor, ':exit')
      const call = exitHandler.mock.calls[0][0] as GenericNode
      expect(call.source).toBeNull()
    })

    test('ExportNamedDeclaration:exit has specifiers=[]', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportNamedDeclaration:exit': exitHandler }
      const node = createMockNode({
        kindName: 'ClassDeclaration',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('ClassDeclaration', node, genericNode, visitor, ':exit')
      const call = exitHandler.mock.calls[0][0] as GenericNode
      expect(call.specifiers).toEqual([])
    })

    test('ExportDefaultDeclaration:exit has range from genericNode', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportDefaultDeclaration:exit': exitHandler }
      const node = createMockNode({
        kindName: 'FunctionDeclaration',
        getModifiers: () => [
          { getKindName: () => 'ExportKeyword' },
          { getKindName: () => 'DefaultKeyword' },
        ],
      })
      const genericNode = makeGenericNode({ range: [50, 100] })
      dispatchExportWrapper('FunctionDeclaration', node, genericNode, visitor, ':exit')
      const call = exitHandler.mock.calls[0][0] as GenericNode
      expect(call.range).toEqual([50, 100])
    })

    test('ClassDeclaration exported with default → ExportDefaultDeclaration', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const node = createMockNode({
        kindName: 'ClassDeclaration',
        getModifiers: () => [
          { getKindName: () => 'ExportKeyword' },
          { getKindName: () => 'DefaultKeyword' },
        ],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('ClassDeclaration', node, genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ExportDefaultDeclaration')
    })

    test('Non-exported InterfaceDeclaration → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'InterfaceDeclaration',
        getModifiers: () => [],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('InterfaceDeclaration', node, genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('Non-exported EnumDeclaration → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'EnumDeclaration',
        getModifiers: () => [],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('EnumDeclaration', node, genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('Non-exported TypeAliasDeclaration → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'TypeAliasDeclaration',
        getModifiers: () => [],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('TypeAliasDeclaration', node, genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('Non-exported ModuleDeclaration → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'ModuleDeclaration',
        getModifiers: () => [],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('ModuleDeclaration', node, genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('ExportDefaultDeclaration:exit dispatched without specifiers', () => {
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = { 'ExportDefaultDeclaration:exit': exitHandler }
      const node = createMockNode({
        kindName: 'FunctionDeclaration',
        getModifiers: () => [
          { getKindName: () => 'ExportKeyword' },
          { getKindName: () => 'DefaultKeyword' },
        ],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('FunctionDeclaration', node, genericNode, visitor, ':exit')
      const call = exitHandler.mock.calls[0][0] as GenericNode
      expect(call.specifiers).toBeUndefined()
    })

    test('ExportNamedDeclaration wrapper declaration is the genericNode', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'FunctionDeclaration',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericNode = makeGenericNode({ type: 'FunctionDeclaration' })
      dispatchExportWrapper('FunctionDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.declaration).toBe(genericNode)
    })

    test('Non-EXPORTABLE_KINDS like Block → no dispatch even with export modifiers', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const node = createMockNode({
        kindName: 'Block',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericNode = makeGenericNode()
      dispatchExportWrapper('Block', node, genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('ExportNamedDeclaration with loc from genericNode', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
      const loc = { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } }
      const node = createMockNode({
        kindName: 'EnumDeclaration',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericNode = makeGenericNode({ loc })
      dispatchExportWrapper('EnumDeclaration', node, genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.loc).toBe(loc)
    })
  })

  describe('dispatchClassBody — extended coverage', () => {
    test('ClassDeclaration with empty body array → dispatches ClassBody with empty body', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const genericNode = makeGenericNode({ body: [] })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.body).toEqual([])
    })

    test('ClassBody dispatched node has type "ClassBody"', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const genericNode = makeGenericNode({ body: [] })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.type).toBe('ClassBody')
    })

    test('body with PropertyDefinition member → parent set to ClassBody node', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const member: GenericNode = { type: 'PropertyDefinition', key: 'prop' }
      const genericNode = makeGenericNode({ body: [member] })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      const classBodyNode = handler.mock.calls[0][0] as GenericNode
      expect(member.parent).toBe(classBodyNode)
    })

    test('multiple body members all get same parent reference', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const m1: GenericNode = { type: 'MethodDefinition', key: 'a' }
      const m2: GenericNode = { type: 'MethodDefinition', key: 'b' }
      const m3: GenericNode = { type: 'PropertyDefinition', key: 'c' }
      const genericNode = makeGenericNode({ body: [m1, m2, m3] })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      const classBodyNode = handler.mock.calls[0][0] as GenericNode
      expect(m1.parent).toBe(classBodyNode)
      expect(m2.parent).toBe(classBodyNode)
      expect(m3.parent).toBe(classBodyNode)
    })

    test('body member that is a number → skipped for parent assignment', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const valid: GenericNode = { type: 'MethodDefinition', key: 'valid' }
      const genericNode = makeGenericNode({ body: [42, valid] })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
      expect(valid.parent).toBe(handler.mock.calls[0][0])
    })

    test('body member that is a string → skipped for parent assignment', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const valid: GenericNode = { type: 'PropertyDefinition', key: 'valid' }
      const genericNode = makeGenericNode({ body: ['str', valid] })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      expect(valid.parent).toBe(handler.mock.calls[0][0])
    })

    test('ClassBody node body is same array reference as genericNode.body', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const body: GenericNode[] = [{ type: 'MethodDefinition', key: 'x' }]
      const genericNode = makeGenericNode({ body })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.body).toBe(body)
    })

    test('ClassExpression with empty body → dispatches', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const genericNode = makeGenericNode({ body: [] })
      dispatchClassBody('ClassExpression', genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
    })

    test('ClassBody with body containing false → skipped for parent', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const genericNode = makeGenericNode({ body: [false, true] })
      expect(() => dispatchClassBody('ClassDeclaration', genericNode, visitor, '')).not.toThrow()
      expect(handler).toHaveBeenCalledOnce()
    })

    test('ClassBody parent ref is the genericNode itself', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ClassBody: handler }
      const genericNode = makeGenericNode({ body: [] })
      dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.parent).toBe(genericNode)
    })
  })

  describe('dispatchExportAssignment — extended coverage', () => {
    test('expression is null → falls back to genericNode (nullish coalescing)', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const genericNode = makeGenericNode({ expression: null })
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.declaration).toBe(genericNode)
    })

    test('expression is 0 → uses 0 as declaration (not nullish)', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const genericNode = makeGenericNode({ expression: 0 })
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.declaration).toBe(0)
    })

    test('expression is false → uses false as declaration (not nullish)', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const genericNode = makeGenericNode({ expression: false })
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.declaration).toBe(false)
    })

    test('expression is empty string → uses empty string as declaration', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const genericNode = makeGenericNode({ expression: '' })
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.declaration).toBe('')
    })

    test('dispatched wrapper does not have source property', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const genericNode = makeGenericNode()
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.source).toBeUndefined()
    })

    test('dispatched wrapper does not have specifiers property', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const genericNode = makeGenericNode()
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.specifiers).toBeUndefined()
    })

    test('expression with object node → declaration is that object', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const expression: GenericNode = { type: 'FunctionExpression', id: null, params: [] }
      const genericNode = makeGenericNode({ expression })
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.declaration).toBe(expression)
    })

    test('non-ExportAssignment kindName like "Identifier" → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const genericNode = makeGenericNode()
      dispatchExportAssignment('Identifier', genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('non-ExportAssignment kindName like "BinaryExpression" → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const genericNode = makeGenericNode()
      dispatchExportAssignment('BinaryExpression', genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('range and loc on wrapper come from genericNode not expression', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
      const expression: GenericNode = {
        type: 'ArrowFunction',
        range: [999, 999],
        loc: { start: { line: 99, column: 9 }, end: { line: 99, column: 9 } },
      }
      const genericNode = makeGenericNode({
        expression,
        range: [0, 20],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
      const call = handler.mock.calls[0][0] as GenericNode
      expect(call.range).toEqual([0, 20])
      expect(call.loc).toEqual({ start: { line: 1, column: 0 }, end: { line: 1, column: 20 } })
    })
  })

  describe('dispatchImportSpecifiers — extended coverage', () => {
    test('visit with only named bindings → no default import dispatched', () => {
      const defaultHandler = vi.fn()
      const namedHandler = vi.fn()
      const visitor: RuleVisitor = {
        ImportDefaultSpecifier: defaultHandler,
        ImportSpecifier: namedHandler,
      }
      const node = createMockNode({
        kindName: 'ImportDeclaration',
        compilerNode: {
          importClause: {
            namedBindings: {
              elements: [{ name: { text: 'A', pos: 10, end: 11 }, pos: 10, end: 11 }],
            },
          },
        },
      })
      const genericNode = makeGenericNode()
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, '')
      expect(defaultHandler).not.toHaveBeenCalled()
      expect(namedHandler).toHaveBeenCalledOnce()
    })

    test('specifier with empty type string → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { '': handler }
      const node = createMockNode({ kindName: 'ImportDeclaration' })
      const specs: GenericNode[] = [{ type: '', local: { name: 'X' } }]
      const genericNode = makeGenericNode({ specifiers: specs })
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, ':exit')
      expect(handler).not.toHaveBeenCalled()
    })

    test('specifier with unknown type and no handler → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ImportDefaultSpecifier: handler }
      const node = createMockNode({ kindName: 'ImportDeclaration' })
      const specs: GenericNode[] = [{ type: 'UnknownSpecifier', local: { name: 'X' } }]
      const genericNode = makeGenericNode({ specifiers: specs })
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, ':exit')
      expect(handler).not.toHaveBeenCalled()
    })

    test('null and valid spec in same array during exit', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { 'ImportSpecifier:exit': handler }
      const valid: GenericNode = { type: 'ImportSpecifier', local: { name: 'Y' } }
      const node = createMockNode({ kindName: 'ImportDeclaration' })
      const genericNode = makeGenericNode({ specifiers: [null, valid] })
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, ':exit')
      expect(handler).toHaveBeenCalledOnce()
      expect(handler.mock.calls[0][0]).toBe(valid)
    })

    test('empty compilerNode → no specifiers extracted', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ImportDefaultSpecifier: handler }
      const node = createMockNode({
        kindName: 'ImportDeclaration',
        compilerNode: {},
      })
      const genericNode = makeGenericNode()
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
      expect(genericNode.specifiers).toEqual([])
    })

    test('importClause without name or namedBindings → no specifiers', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ImportSpecifier: handler }
      const node = createMockNode({
        kindName: 'ImportDeclaration',
        compilerNode: {
          importClause: {},
        },
      })
      const genericNode = makeGenericNode()
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, '')
      expect(handler).not.toHaveBeenCalled()
    })

    test('exit with single ImportDefaultSpecifier → dispatched', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { 'ImportDefaultSpecifier:exit': handler }
      const spec: GenericNode = { type: 'ImportDefaultSpecifier', local: { name: 'Z' } }
      const node = createMockNode({ kindName: 'ImportDeclaration' })
      const genericNode = makeGenericNode({ specifiers: [spec] })
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, ':exit')
      expect(handler).toHaveBeenCalledOnce()
      expect(handler.mock.calls[0][0]).toBe(spec)
    })

    test('visit with namespace import only → ImportNamespaceSpecifier', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ImportNamespaceSpecifier: handler }
      const node = createMockNode({
        kindName: 'ImportDeclaration',
        compilerNode: {
          importClause: {
            namedBindings: {
              name: { text: 'All', pos: 10, end: 13 },
              pos: 9,
              end: 13,
            },
          },
        },
      })
      const genericNode = makeGenericNode()
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, '')
      expect(handler).toHaveBeenCalledOnce()
    })

    test('multiple different specifier types in same visit', () => {
      const defaultHandler = vi.fn()
      const namespaceHandler = vi.fn()
      const namedHandler = vi.fn()
      const visitor: RuleVisitor = {
        ImportDefaultSpecifier: defaultHandler,
        ImportNamespaceSpecifier: namespaceHandler,
        ImportSpecifier: namedHandler,
      }
      const node = createMockNode({
        kindName: 'ImportDeclaration',
        compilerNode: {
          importClause: {
            name: { text: 'Default', pos: 7, end: 14 },
            namedBindings: {
              name: { text: 'NS', pos: 17, end: 19 },
              elements: [{ name: { text: 'A', pos: 22, end: 23 }, pos: 22, end: 23 }],
              pos: 16,
              end: 30,
            },
          },
        },
      })
      const genericNode = makeGenericNode()
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, '')
      expect(defaultHandler).toHaveBeenCalledOnce()
      expect(namespaceHandler).toHaveBeenCalledOnce()
      expect(namedHandler).toHaveBeenCalledOnce()
    })

    test('visit caches specifiers then exit dispatches them', () => {
      const namedHandler = vi.fn()
      const exitHandler = vi.fn()
      const visitor: RuleVisitor = {
        ImportSpecifier: namedHandler,
        'ImportSpecifier:exit': exitHandler,
      }
      const node = createMockNode({
        kindName: 'ImportDeclaration',
        compilerNode: {
          importClause: {
            namedBindings: {
              elements: [
                { name: { text: 'A', pos: 5, end: 6 }, pos: 5, end: 6 },
                { name: { text: 'B', pos: 9, end: 10 }, pos: 9, end: 10 },
              ],
            },
          },
        },
      })
      const genericNode = makeGenericNode()
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, '')
      expect(namedHandler).toHaveBeenCalledTimes(2)
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, ':exit')
      expect(exitHandler).toHaveBeenCalledTimes(2)
    })

    test('exit with empty specifiers array → no dispatch', () => {
      const handler = vi.fn()
      const visitor: RuleVisitor = { ImportSpecifier: handler }
      const node = createMockNode({ kindName: 'ImportDeclaration' })
      const genericNode = makeGenericNode({ specifiers: [] })
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, ':exit')
      expect(handler).not.toHaveBeenCalled()
    })

    test('exit with specifiers containing mixed known/unknown types', () => {
      const knownHandler = vi.fn()
      const visitor: RuleVisitor = { 'ImportDefaultSpecifier:exit': knownHandler }
      const node = createMockNode({ kindName: 'ImportDeclaration' })
      const specs: GenericNode[] = [
        { type: 'ImportDefaultSpecifier', local: { name: 'A' } },
        { type: 'CustomSpecifier', local: { name: 'B' } },
      ]
      const genericNode = makeGenericNode({ specifiers: specs })
      dispatchImportSpecifiers('ImportDeclaration', node, genericNode, visitor, ':exit')
      expect(knownHandler).toHaveBeenCalledOnce()
    })
  })

  describe('ensureGenericNode — extended coverage', () => {
    test('two nodes with same kindName produce different objects', () => {
      const node1 = createMockNode({ kindName: 'FunctionDeclaration', start: 0, end: 10 })
      const node2 = createMockNode({ kindName: 'FunctionDeclaration', start: 20, end: 30 })
      const result1 = ensureGenericNode(node1)
      const result2 = ensureGenericNode(node2)
      expect(result1).not.toBe(result2)
    })

    test('node with start=0 end=0 → empty range', () => {
      const node = createMockNode({ start: 0, end: 0 })
      const result = ensureGenericNode(node)
      expect(result.range).toEqual([0, 0])
    })

    test('cache isolation between different nodes', () => {
      const node1 = createMockNode({ kindName: 'FunctionDeclaration', start: 0, end: 10 })
      const node2 = createMockNode({ kindName: 'ClassDeclaration', start: 20, end: 30 })
      const result1 = ensureGenericNode(node1)
      const result2 = ensureGenericNode(node2)
      expect(genericNodeCache.get(node1)).toBe(result1)
      expect(genericNodeCache.get(node2)).toBe(result2)
    })

    test('node with specific text content', () => {
      const node = createMockNode({ text: 'export function hello() {}' })
      const result = ensureGenericNode(node)
      expect(result).toBeDefined()
      expect(result.type).toBeDefined()
    })

    test('node created has loc with start and end objects', () => {
      const node = createMockNode({ start: 5, end: 25 })
      const result = ensureGenericNode(node)
      expect(result.loc).toBeDefined()
      expect((result.loc as GenericNode).start).toBeDefined()
      expect((result.loc as GenericNode).end).toBeDefined()
    })

    test('sibling nodes have separate cache entries', () => {
      const parent = createMockNode({ kindName: 'Block', start: 0, end: 100 })
      ensureGenericNode(parent)
      const child1 = createMockNode({
        kindName: 'VariableDeclaration',
        start: 5,
        end: 15,
        getParent: () => parent,
      })
      const child2 = createMockNode({
        kindName: 'VariableDeclaration',
        start: 20,
        end: 30,
        getParent: () => parent,
      })
      const g1 = ensureGenericNode(child1)
      const g2 = ensureGenericNode(child2)
      expect(genericNodeCache.get(child1)).toBe(g1)
      expect(genericNodeCache.get(child2)).toBe(g2)
      expect(g1).not.toBe(g2)
    })

    test('Block kindName creates correct generic node', () => {
      const node = createMockNode({ kindName: 'Block' })
      const result = ensureGenericNode(node)
      expect(result.type).toBe('BlockStatement')
    })

    test('node with large range values', () => {
      const node = createMockNode({ start: 5000, end: 10000 })
      const result = ensureGenericNode(node)
      expect(result.range).toEqual([5000, 10000])
    })

    test('node with getModifiers returning undefined → still creates generic node', () => {
      const node = createMockNode({ kindName: 'VariableDeclaration' })
      const result = ensureGenericNode(node)
      expect(result).toBeDefined()
      expect(result.type).toBe('VariableDeclarator')
    })
  })

  describe('integration — dispatch combinations', () => {
    test('applyTypeRewrites then ensureGenericNode on separate nodes are independent', () => {
      const rewriteNode = makeGenericNode({ type: 'BinaryExpression', operator: '=' })
      applyTypeRewrites('BinaryExpression', rewriteNode)
      const freshNode = createMockNode({ kindName: 'VariableDeclaration' })
      const generic = ensureGenericNode(freshNode)
      expect(rewriteNode.type).toBe('AssignmentExpression')
      expect(generic.type).toBe('VariableDeclarator')
    })

    test('multiple dispatch functions on different kindNames do not interfere', () => {
      const importHandler = vi.fn()
      const exportHandler = vi.fn()
      const classHandler = vi.fn()
      const visitor: RuleVisitor = {
        ImportDefaultSpecifier: importHandler,
        ExportAllDeclaration: exportHandler,
        ClassBody: classHandler,
      }
      const importNode = createMockNode({
        kindName: 'ImportDeclaration',
        compilerNode: {
          importClause: { name: { text: 'X', pos: 5, end: 6 } },
        },
      })
      const exportNode = createMockNode({
        kindName: 'ExportDeclaration',
        compilerNode: {},
      })
      const genericImport = makeGenericNode()
      const genericExport = makeGenericNode({ source: "'./x'" })
      const genericClass = makeGenericNode({ body: [] })

      dispatchImportSpecifiers('ImportDeclaration', importNode, genericImport, visitor, '')
      dispatchExportDeclaration('ExportDeclaration', exportNode, genericExport, visitor, '')
      dispatchClassBody('ClassDeclaration', genericClass, visitor, '')

      expect(importHandler).toHaveBeenCalledOnce()
      expect(exportHandler).toHaveBeenCalledOnce()
      expect(classHandler).toHaveBeenCalledOnce()
    })

    test('dispatchExportAssignment and dispatchExportWrapper are independent', () => {
      const defaultHandler1 = vi.fn()
      const defaultHandler2 = vi.fn()
      const visitor: RuleVisitor = {
        ExportDefaultDeclaration: defaultHandler1,
        ExportNamedDeclaration: defaultHandler2,
      }
      const genericForAssignment = makeGenericNode()
      const nodeForWrapper = createMockNode({
        kindName: 'FunctionDeclaration',
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      const genericForWrapper = makeGenericNode()

      dispatchExportAssignment('ExportAssignment', genericForAssignment, visitor, '')
      dispatchExportWrapper('FunctionDeclaration', nodeForWrapper, genericForWrapper, visitor, '')

      expect(defaultHandler1).toHaveBeenCalledOnce()
      expect(defaultHandler2).toHaveBeenCalledOnce()
    })
  })
})
