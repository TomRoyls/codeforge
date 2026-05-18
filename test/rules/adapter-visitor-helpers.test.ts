import { describe, expect, it, vi } from 'vitest'

import { Node, Project, SyntaxKind } from 'ts-morph'

import {
  applyTypeRewrites,
  dispatchClassBody,
  dispatchExportAssignment,
  dispatchExportDeclaration,
  dispatchExportWrapper,
  dispatchImportSpecifiers,
  ensureGenericNode,
} from '../../src/rules/adapter-visitor-helpers.js'

import { genericNodeCache } from '../../src/rules/adapter-node-converter.js'

import type { RuleVisitor } from '../../src/plugins/types.js'

// ─── applyTypeRewrites ───

describe('applyTypeRewrites', () => {
  it('rewrites BinaryExpression with assignment operator = to AssignmentExpression', () => {
    const node: Record<string, unknown> = { operator: '=', type: 'BinaryExpression' }
    applyTypeRewrites('BinaryExpression', node)
    expect(node.type).toBe('AssignmentExpression')
  })

  it('rewrites BinaryExpression with assignment operator += to AssignmentExpression', () => {
    const node: Record<string, unknown> = { operator: '+=', type: 'BinaryExpression' }
    applyTypeRewrites('BinaryExpression', node)
    expect(node.type).toBe('AssignmentExpression')
  })

  it('rewrites BinaryExpression with assignment operator *= to AssignmentExpression', () => {
    const node: Record<string, unknown> = { operator: '*=', type: 'BinaryExpression' }
    applyTypeRewrites('BinaryExpression', node)
    expect(node.type).toBe('AssignmentExpression')
  })

  it('rewrites BinaryExpression with logical operator && to LogicalExpression', () => {
    const node: Record<string, unknown> = { operator: '&&', type: 'BinaryExpression' }
    applyTypeRewrites('BinaryExpression', node)
    expect(node.type).toBe('LogicalExpression')
  })

  it('rewrites BinaryExpression with logical operator || to LogicalExpression', () => {
    const node: Record<string, unknown> = { operator: '||', type: 'BinaryExpression' }
    applyTypeRewrites('BinaryExpression', node)
    expect(node.type).toBe('LogicalExpression')
  })

  it('rewrites BinaryExpression with logical operator ?? to LogicalExpression', () => {
    const node: Record<string, unknown> = { operator: '??', type: 'BinaryExpression' }
    applyTypeRewrites('BinaryExpression', node)
    expect(node.type).toBe('LogicalExpression')
  })

  it('leaves BinaryExpression with + operator unchanged', () => {
    const node: Record<string, unknown> = { operator: '+', type: 'BinaryExpression' }
    applyTypeRewrites('BinaryExpression', node)
    expect(node.type).toBe('BinaryExpression')
  })

  it('leaves BinaryExpression with === operator unchanged', () => {
    const node: Record<string, unknown> = { operator: '===', type: 'BinaryExpression' }
    applyTypeRewrites('BinaryExpression', node)
    expect(node.type).toBe('BinaryExpression')
  })

  it('rewrites PrefixUnaryExpression with ++ to UpdateExpression with prefix true', () => {
    const node: Record<string, unknown> = { operator: '++', type: 'PrefixUnaryExpression' }
    applyTypeRewrites('PrefixUnaryExpression', node)
    expect(node.type).toBe('UpdateExpression')
    expect(node.prefix).toBe(true)
  })

  it('rewrites PrefixUnaryExpression with -- to UpdateExpression with prefix true', () => {
    const node: Record<string, unknown> = { operator: '--', type: 'PrefixUnaryExpression' }
    applyTypeRewrites('PrefixUnaryExpression', node)
    expect(node.type).toBe('UpdateExpression')
    expect(node.prefix).toBe(true)
  })

  it('rewrites PrefixUnaryExpression with ! to UnaryExpression', () => {
    const node: Record<string, unknown> = { operator: '!', type: 'PrefixUnaryExpression' }
    applyTypeRewrites('PrefixUnaryExpression', node)
    expect(node.type).toBe('UnaryExpression')
  })

  it('rewrites PrefixUnaryExpression with ~ to UnaryExpression', () => {
    const node: Record<string, unknown> = { operator: '~', type: 'PrefixUnaryExpression' }
    applyTypeRewrites('PrefixUnaryExpression', node)
    expect(node.type).toBe('UnaryExpression')
  })

  it('sets prefix false on PostfixUnaryExpression', () => {
    const node: Record<string, unknown> = { operator: '++', type: 'PostfixUnaryExpression' }
    applyTypeRewrites('PostfixUnaryExpression', node)
    expect(node.prefix).toBe(false)
  })

  it('does not modify unrelated kind names', () => {
    const node: Record<string, unknown> = { type: 'Identifier' }
    applyTypeRewrites('Identifier', node)
    expect(node.type).toBe('Identifier')
  })
})

// ─── dispatchClassBody ───

describe('dispatchClassBody', () => {
  it('calls ClassBody handler for ClassDeclaration with body', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ClassBody: handler }
    const genericNode = {
      body: [{ type: 'MethodDefinition' }],
      loc: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } },
      range: [0, 10],
    }
    dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
    expect(handler).toHaveBeenCalledOnce()
    const callArg = handler.mock.calls[0]![0] as Record<string, unknown>
    expect(callArg.type).toBe('ClassBody')
    expect(callArg.parent).toBe(genericNode)
  })

  it('calls ClassBody handler for ClassExpression with body', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ClassBody: handler }
    const genericNode = {
      body: [{ type: 'PropertyDefinition' }],
      loc: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } },
      range: [0, 10],
    }
    dispatchClassBody('ClassExpression', genericNode, visitor, '')
    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not call handler when body is not an array', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ClassBody: handler }
    dispatchClassBody('ClassDeclaration', { body: null }, visitor, '')
    expect(handler).not.toHaveBeenCalled()
  })

  it('is a no-op for non-class kind names', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ClassBody: handler }
    dispatchClassBody('FunctionDeclaration', { body: [] }, visitor, '')
    expect(handler).not.toHaveBeenCalled()
  })

  it('sets parent on body members when suffix is empty', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ClassBody: handler }
    const member: Record<string, unknown> = { type: 'MethodDefinition' }
    const genericNode = {
      body: [member],
      loc: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } },
      range: [0, 10],
    }
    dispatchClassBody('ClassDeclaration', genericNode, visitor, '')
    const classBodyNode = handler.mock.calls[0]![0] as Record<string, unknown>
    expect(member.parent).toBe(classBodyNode)
  })

  it('does not set parent on body members when suffix is non-empty', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { 'ClassBody:Exit': handler }
    const member: Record<string, unknown> = { type: 'MethodDefinition' }
    const genericNode = {
      body: [member],
      loc: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } },
      range: [0, 10],
    }
    dispatchClassBody('ClassDeclaration', genericNode, visitor, ':Exit')
    expect(member.parent).toBeUndefined()
  })

  it('does not crash when no handler is registered', () => {
    const visitor: RuleVisitor = {}
    const genericNode = {
      body: [{ type: 'MethodDefinition' }],
      loc: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } },
      range: [0, 10],
    }
    expect(() => dispatchClassBody('ClassDeclaration', genericNode, visitor, '')).not.toThrow()
  })
})

// ─── dispatchExportAssignment ───

describe('dispatchExportAssignment', () => {
  it('calls ExportDefaultDeclaration handler for ExportAssignment', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
    const genericNode = {
      expression: { type: 'Identifier' },
      loc: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } },
      range: [0, 20],
    }
    dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
    expect(handler).toHaveBeenCalledOnce()
    const callArg = handler.mock.calls[0]![0] as Record<string, unknown>
    expect(callArg.type).toBe('ExportDefaultDeclaration')
    expect(callArg.declaration).toEqual({ type: 'Identifier' })
  })

  it('uses genericNode itself when expression is missing', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
    const genericNode = {
      loc: { end: { column: 0, line: 1 }, start: { column: 0, line: 1 } },
      range: [0, 20],
    }
    dispatchExportAssignment('ExportAssignment', genericNode, visitor, '')
    expect(handler).toHaveBeenCalledOnce()
    const callArg = handler.mock.calls[0]![0] as Record<string, unknown>
    expect(callArg.declaration).toBe(genericNode)
  })

  it('is a no-op for non-ExportAssignment kind names', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
    dispatchExportAssignment('FunctionDeclaration', {}, visitor, '')
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not crash when no handler is registered', () => {
    const visitor: RuleVisitor = {}
    expect(() =>
      dispatchExportAssignment('ExportAssignment', { expression: {} }, visitor, ''),
    ).not.toThrow()
  })
})

// ─── dispatchExportWrapper ───

describe('dispatchExportWrapper', () => {
  it('calls ExportDefaultDeclaration for exported default class', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ExportDefaultDeclaration: handler }
    const project = new Project({ useInMemoryFileSystem: true })
    const sf = project.createSourceFile('exp.ts', 'export default class Foo {}')
    const classDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ClassDeclaration)
    const genericNode = { type: 'ClassDeclaration', loc: {}, range: [0, 10] }

    dispatchExportWrapper('ClassDeclaration', classDecl, genericNode, visitor, '')
    expect(handler).toHaveBeenCalledOnce()
    project.removeSourceFile(sf)
  })

  it('calls ExportNamedDeclaration for non-default exported function', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
    const project = new Project({ useInMemoryFileSystem: true })
    const sf = project.createSourceFile('exp2.ts', 'export function foo() {}')
    const fnDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.FunctionDeclaration)
    const genericNode = { type: 'FunctionDeclaration', loc: {}, range: [0, 10] }

    dispatchExportWrapper('FunctionDeclaration', fnDecl, genericNode, visitor, '')
    expect(handler).toHaveBeenCalledOnce()
    project.removeSourceFile(sf)
  })

  it('is a no-op for non-exportable kind names', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
    dispatchExportWrapper('VariableStatement', {} as never, { type: 'VariableStatement' }, visitor, '')
    expect(handler).not.toHaveBeenCalled()
  })

  it('is a no-op for non-exported declarations', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
    const project = new Project({ useInMemoryFileSystem: true })
    const sf = project.createSourceFile('internal.ts', 'class Foo {}')
    const classDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ClassDeclaration)
    const genericNode = { type: 'ClassDeclaration', loc: {}, range: [0, 10] }

    dispatchExportWrapper('ClassDeclaration', classDecl, genericNode, visitor, '')
    expect(handler).not.toHaveBeenCalled()
    project.removeSourceFile(sf)
  })

  it('does not crash when no handler is registered', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    const sf = project.createSourceFile('nohandler.ts', 'export default class Foo {}')
    const classDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ClassDeclaration)
    const visitor: RuleVisitor = {}
    const genericNode = { type: 'ClassDeclaration', loc: {}, range: [0, 10] }

    expect(() =>
      dispatchExportWrapper('ClassDeclaration', classDecl, genericNode, visitor, ''),
    ).not.toThrow()
    project.removeSourceFile(sf)
  })
})

// ─── dispatchImportSpecifiers ───

describe('dispatchImportSpecifiers', () => {
  it('calls handler for each import specifier', () => {
    const importSpecHandler = vi.fn()
    const defaultSpecHandler = vi.fn()
    const visitor: RuleVisitor = {
      ImportDefaultSpecifier: defaultSpecHandler,
      ImportSpecifier: importSpecHandler,
    }

    const project = new Project({ useInMemoryFileSystem: true })
    const sf = project.createSourceFile('imp.ts', "import def, { A, B } from 'mod';")
    const importDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ImportDeclaration)
    const genericNode = { type: 'ImportDeclaration' }

    dispatchImportSpecifiers('ImportDeclaration', importDecl, genericNode, visitor, '')
    expect(defaultSpecHandler).toHaveBeenCalledOnce()
    expect(importSpecHandler).toHaveBeenCalledTimes(2)
    project.removeSourceFile(sf)
  })

  it('is a no-op for non-ImportDeclaration kind names', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ImportSpecifier: handler }
    dispatchImportSpecifiers('VariableDeclaration', {} as never, {}, visitor, '')
    expect(handler).not.toHaveBeenCalled()
  })

  it('handles :Exit suffix by reading specifiers from genericNode', () => {
    const importSpecHandler = vi.fn()
    const visitor: RuleVisitor = { 'ImportSpecifier:Exit': importSpecHandler }
    const spec1 = { type: 'ImportSpecifier' }
    const spec2 = { type: 'ImportSpecifier' }
    const genericNode = { specifiers: [spec1, spec2], type: 'ImportDeclaration' }

    dispatchImportSpecifiers('ImportDeclaration', {} as never, genericNode, visitor, ':Exit')
    expect(importSpecHandler).toHaveBeenCalledTimes(2)
  })

  it('returns early when specifiers is not an array on :Exit', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { 'ImportSpecifier:Exit': handler }
    const genericNode = { type: 'ImportDeclaration' }

    dispatchImportSpecifiers('ImportDeclaration', {} as never, genericNode, visitor, ':Exit')
    expect(handler).not.toHaveBeenCalled()
  })

  it('skips specifiers without a type property', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { 'ImportSpecifier:Exit': handler }
    const genericNode = {
      specifiers: [{ notType: 'x' }, { type: 'ImportSpecifier' }],
      type: 'ImportDeclaration',
    }

    dispatchImportSpecifiers('ImportDeclaration', {} as never, genericNode, visitor, ':Exit')
    expect(handler).toHaveBeenCalledOnce()
  })
})

// ─── dispatchExportDeclaration ───

describe('dispatchExportDeclaration', () => {
  it('calls ExportAllDeclaration when no specifiers and source exists', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ExportAllDeclaration: handler }
    const genericNode = {
      source: './foo',
      loc: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
      range: [0, 20],
    }

    dispatchExportDeclaration('ExportDeclaration', {} as never, genericNode, visitor, '')
    expect(handler).toHaveBeenCalledOnce()
    const callArg = handler.mock.calls[0]![0] as Record<string, unknown>
    expect(callArg.type).toBe('ExportAllDeclaration')
    expect((callArg.source as Record<string, unknown>).value).toBe('./foo')
  })

  it('calls ExportNamedDeclaration when specifiers exist', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
    const project = new Project({ useInMemoryFileSystem: true })
    const sf = project.createSourceFile('named.ts', "export { A, B } from 'mod';")
    const exportDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ExportDeclaration)
    const genericNode = {
      source: 'mod',
      loc: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
      range: [0, 30],
    }

    dispatchExportDeclaration('ExportDeclaration', exportDecl, genericNode, visitor, '')
    expect(handler).toHaveBeenCalledOnce()
    const callArg = handler.mock.calls[0]![0] as Record<string, unknown>
    expect(callArg.type).toBe('ExportNamedDeclaration')
    expect(Array.isArray(callArg.specifiers)).toBe(true)
    project.removeSourceFile(sf)
  })

  it('is a no-op for non-ExportDeclaration kind names', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
    dispatchExportDeclaration('FunctionDeclaration', {} as never, {}, visitor, '')
    expect(handler).not.toHaveBeenCalled()
  })

  it('handles :Exit suffix with existing specifiers', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { 'ExportNamedDeclaration:Exit': handler }
    const specs = [{ type: 'ExportSpecifier' }]
    const genericNode = {
      source: 'mod',
      specifiers: specs,
      loc: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
      range: [0, 30],
    }

    dispatchExportDeclaration('ExportDeclaration', {} as never, genericNode, visitor, ':Exit')
    expect(handler).toHaveBeenCalledOnce()
    const callArg = handler.mock.calls[0]![0] as Record<string, unknown>
    expect(callArg.type).toBe('ExportNamedDeclaration')
  })

  it('dispatches ExportNamedDeclaration when source is null and no specifiers', () => {
    const handler = vi.fn()
    const visitor: RuleVisitor = { ExportNamedDeclaration: handler }
    const genericNode = {
      source: null,
      loc: { end: { column: 5, line: 1 }, start: { column: 0, line: 1 } },
      range: [0, 20],
    }

    dispatchExportDeclaration('ExportDeclaration', {} as never, genericNode, visitor, '')
    expect(handler).toHaveBeenCalledOnce()
    const callArg = handler.mock.calls[0]![0] as Record<string, unknown>
    expect(callArg.type).toBe('ExportNamedDeclaration')
    expect(callArg.source).toBeNull()
  })
})

// ─── ensureGenericNode ───

describe('ensureGenericNode', () => {
  it('converts a ts-morph Node to a generic node', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    const sf = project.createSourceFile('gen.ts', 'const x = 1;')
    const varStmt = sf.getFirstDescendantByKindOrThrow(SyntaxKind.VariableStatement)
    const result = ensureGenericNode(varStmt)
    expect(result).toBeDefined()
    expect(result.type).toBeDefined()
    expect(typeof result.type).toBe('string')
    project.removeSourceFile(sf)
  })

  it('caches the generic node and returns the same object on repeat calls', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    const sf = project.createSourceFile('cache.ts', 'const y = 2;')
    const varDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.VariableDeclaration)
    const first = ensureGenericNode(varDecl)
    const second = ensureGenericNode(varDecl)
    expect(first).toBe(second)
    project.removeSourceFile(sf)
  })

  it('stores result in genericNodeCache', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    const sf = project.createSourceFile('store.ts', 'const z = 3;')
    const varStmt = sf.getFirstDescendantByKindOrThrow(SyntaxKind.VariableStatement)
    const result = ensureGenericNode(varStmt)
    expect(genericNodeCache.get(varStmt)).toBe(result)
    project.removeSourceFile(sf)
  })

  it('sets parent reference when parent is already cached', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    const sf = project.createSourceFile('parent.ts', 'const x = 1;')
    const varStmt = sf.getFirstDescendantByKindOrThrow(SyntaxKind.VariableStatement)
    const varDeclList = sf.getFirstDescendantByKindOrThrow(SyntaxKind.VariableDeclarationList)

    const parentResult = ensureGenericNode(varStmt)
    const childResult = ensureGenericNode(varDeclList)
    expect(childResult.parent).toBe(parentResult)
    project.removeSourceFile(sf)
  })
})
