import { describe, expect, it } from 'vitest'

import { Project, SyntaxKind } from 'ts-morph'

import {
  extractExportSpecifiers,
  extractImportSpecifiers,
  genericNodeCache,
  getExportInfo,
  nodeToGeneric,
  setParentRefs,
} from '../../src/rules/adapter-node-converter.js'

// ─── extractImportSpecifiers ───

describe('extractImportSpecifiers', () => {
  const project = new Project({ useInMemoryFileSystem: true })

  it('extracts default import specifier', () => {
    const sf = project.createSourceFile('def.ts', "import foo from 'mod';")
    const importDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ImportDeclaration)
    const specs = extractImportSpecifiers(importDecl)
    expect(specs.length).toBeGreaterThanOrEqual(1)
    const defaultSpec = specs.find(
      (s) => s && typeof s === 'object' && (s as Record<string, unknown>).type === 'ImportDefaultSpecifier',
    )
    expect(defaultSpec).toBeDefined()
    project.removeSourceFile(sf)
  })

  it('extracts named import specifiers', () => {
    const sf = project.createSourceFile('named.ts', "import { A, B } from 'mod';")
    const importDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ImportDeclaration)
    const specs = extractImportSpecifiers(importDecl)
    const namedSpecs = specs.filter(
      (s) => s && typeof s === 'object' && (s as Record<string, unknown>).type === 'ImportSpecifier',
    )
    expect(namedSpecs.length).toBe(2)
    project.removeSourceFile(sf)
  })

  it('extracts namespace import specifier', () => {
    const sf = project.createSourceFile('ns.ts', "import * as mod from 'mod';")
    const importDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ImportDeclaration)
    const specs = extractImportSpecifiers(importDecl)
    const nsSpec = specs.find(
      (s) => s && typeof s === 'object' && (s as Record<string, unknown>).type === 'ImportNamespaceSpecifier',
    )
    expect(nsSpec).toBeDefined()
    project.removeSourceFile(sf)
  })

  it('returns empty array for side-effect import', () => {
    const sf = project.createSourceFile('side.ts', "import 'mod';")
    const importDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ImportDeclaration)
    const specs = extractImportSpecifiers(importDecl)
    expect(specs).toEqual([])
    project.removeSourceFile(sf)
  })

  it('extracts combined default and named imports', () => {
    const sf = project.createSourceFile('combo.ts', "import def, { A, B } from 'mod';")
    const importDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ImportDeclaration)
    const specs = extractImportSpecifiers(importDecl)
    expect(specs.length).toBe(3)
    project.removeSourceFile(sf)
  })

  it('returns empty array when node lacks compilerNode', () => {
    const result = extractImportSpecifiers({} as never)
    expect(result).toEqual([])
  })
})

// ─── extractExportSpecifiers ───

describe('extractExportSpecifiers', () => {
  const project = new Project({ useInMemoryFileSystem: true })

  it('extracts named export specifiers', () => {
    const sf = project.createSourceFile('exp.ts', "export { A, B } from 'mod';")
    const exportDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ExportDeclaration)
    const specs = extractExportSpecifiers(exportDecl)
    expect(specs.length).toBe(2)
    for (const spec of specs) {
      const s = spec as Record<string, unknown>
      expect(s.type).toBe('ExportSpecifier')
    }
    project.removeSourceFile(sf)
  })

  it('returns empty array for export all declaration', () => {
    const sf = project.createSourceFile('all.ts', "export * from 'mod';")
    const exportDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ExportDeclaration)
    const specs = extractExportSpecifiers(exportDecl)
    expect(specs).toEqual([])
    project.removeSourceFile(sf)
  })

  it('returns empty array when node lacks compilerNode', () => {
    const result = extractExportSpecifiers({} as never)
    expect(result).toEqual([])
  })

  it('populates exported and local on each specifier', () => {
    const sf = project.createSourceFile('fields.ts', "export { A } from 'mod';")
    const exportDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ExportDeclaration)
    const specs = extractExportSpecifiers(exportDecl)
    const spec = specs[0] as Record<string, unknown>
    expect(spec.exported).toBeDefined()
    expect(spec.local).toBeDefined()
    project.removeSourceFile(sf)
  })
})

// ─── getExportInfo ───

describe('getExportInfo', () => {
  const project = new Project({ useInMemoryFileSystem: true })

  it('returns isExported true and isDefault true for export default class', () => {
    const sf = project.createSourceFile('defcls.ts', 'export default class Foo {}')
    const classDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ClassDeclaration)
    const info = getExportInfo(classDecl)
    expect(info.isExported).toBe(true)
    expect(info.isDefault).toBe(true)
    project.removeSourceFile(sf)
  })

  it('returns isExported true and isDefault false for named export', () => {
    const sf = project.createSourceFile('namedexp.ts', 'export function foo() {}')
    const fnDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.FunctionDeclaration)
    const info = getExportInfo(fnDecl)
    expect(info.isExported).toBe(true)
    expect(info.isDefault).toBe(false)
    project.removeSourceFile(sf)
  })

  it('returns isExported false for non-exported declaration', () => {
    const sf = project.createSourceFile('internal.ts', 'class Foo {}')
    const classDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ClassDeclaration)
    const info = getExportInfo(classDecl)
    expect(info.isExported).toBe(false)
    expect(info.isDefault).toBe(false)
    project.removeSourceFile(sf)
  })

  it('returns false/false for node without getModifiers', () => {
    const sf = project.createSourceFile('noexp.ts', 'const x = 1;')
    const numLiteral = sf.getFirstDescendantByKindOrThrow(SyntaxKind.NumericLiteral)
    const info = getExportInfo(numLiteral)
    expect(info.isExported).toBe(false)
    expect(info.isDefault).toBe(false)
    project.removeSourceFile(sf)
  })

  it('handles exported interface', () => {
    const sf = project.createSourceFile('iface.ts', 'export interface IFoo {}')
    const ifaceDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.InterfaceDeclaration)
    const info = getExportInfo(ifaceDecl)
    expect(info.isExported).toBe(true)
    project.removeSourceFile(sf)
  })
})

// ─── nodeToGeneric ───

describe('nodeToGeneric', () => {
  const project = new Project({ useInMemoryFileSystem: true })

  it('converts a VariableStatement to a generic node with type', () => {
    const sf = project.createSourceFile('vs.ts', 'const x = 1;')
    const varStmt = sf.getFirstDescendantByKindOrThrow(SyntaxKind.VariableStatement)
    const result = nodeToGeneric(varStmt)
    expect(result.type).toBe('VariableDeclaration')
    expect(result.range).toBeDefined()
    expect(Array.isArray(result.range)).toBe(true)
    project.removeSourceFile(sf)
  })

  it('converts an Identifier with name property', () => {
    const sf = project.createSourceFile('id.ts', 'const x = 1;')
    const identifier = sf.getFirstDescendantByKindOrThrow(SyntaxKind.Identifier)
    const result = nodeToGeneric(identifier)
    expect(result.type).toBe('Identifier')
    project.removeSourceFile(sf)
  })

  it('converts a FunctionDeclaration with async flag', () => {
    const sf = project.createSourceFile('asyncfn.ts', 'async function foo() {}')
    const fnDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.FunctionDeclaration)
    const result = nodeToGeneric(fnDecl)
    expect(result.type).toBe('FunctionDeclaration')
    expect(result.async).toBe(true)
    project.removeSourceFile(sf)
  })

  it('converts a regular FunctionDeclaration without async flag', () => {
    const sf = project.createSourceFile('fn.ts', 'function foo() {}')
    const fnDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.FunctionDeclaration)
    const result = nodeToGeneric(fnDecl)
    expect(result.async).toBeUndefined()
    project.removeSourceFile(sf)
  })

  it('converts a ClassDeclaration with loc and range', () => {
    const sf = project.createSourceFile('cls.ts', 'class Foo {}')
    const classDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ClassDeclaration)
    const result = nodeToGeneric(classDecl)
    expect(result.type).toBe('ClassDeclaration')
    expect(result.loc).toBeDefined()
    expect(result.loc.start).toBeDefined()
    expect(result.loc.end).toBeDefined()
    project.removeSourceFile(sf)
  })

  it('converts a StringLiteral with value and raw', () => {
    const sf = project.createSourceFile('str.ts', "const x = 'hello';")
    const strLiteral = sf.getFirstDescendantByKindOrThrow(SyntaxKind.StringLiteral)
    const result = nodeToGeneric(strLiteral)
    expect(result.type).toBe('Literal')
    expect(result.value).toBe('hello')
    project.removeSourceFile(sf)
  })

  it('converts a NumericLiteral with numeric value', () => {
    const sf = project.createSourceFile('num.ts', 'const x = 42;')
    const numLiteral = sf.getFirstDescendantByKindOrThrow(SyntaxKind.NumericLiteral)
    const result = nodeToGeneric(numLiteral)
    expect(result.type).toBe('Literal')
    expect(result.value).toBe(42)
    project.removeSourceFile(sf)
  })

  it('converts a BinaryExpression with = operator preserving BinaryExpression type', () => {
    const sf = project.createSourceFile('assign.ts', 'let x; x = 5;')
    const binExpr = sf.getFirstDescendantByKindOrThrow(SyntaxKind.BinaryExpression)
    const result = nodeToGeneric(binExpr)
    expect(result.type).toBe('BinaryExpression')
    expect(result.operator).toBe('=')
    project.removeSourceFile(sf)
  })

  it('converts a BinaryExpression with && operator preserving BinaryExpression type', () => {
    const sf = project.createSourceFile('logic.ts', 'const x = a && b;')
    const binExpr = sf.getFirstDescendantByKindOrThrow(SyntaxKind.BinaryExpression)
    const result = nodeToGeneric(binExpr)
    expect(result.type).toBe('BinaryExpression')
    expect(result.operator).toBe('&&')
    project.removeSourceFile(sf)
  })

  it('converts a regular BinaryExpression without retype', () => {
    const sf = project.createSourceFile('add.ts', 'const x = a + b;')
    const binExpr = sf.getFirstDescendantByKindOrThrow(SyntaxKind.BinaryExpression)
    const result = nodeToGeneric(binExpr)
    expect(result.type).toBe('BinaryExpression')
    expect(result.operator).toBe('+')
    project.removeSourceFile(sf)
  })

  it('converts PropertyAccessExpression to MemberExpression', () => {
    const sf = project.createSourceFile('prop.ts', 'const x = foo.bar;')
    const propAccess = sf.getFirstDescendantByKindOrThrow(SyntaxKind.PropertyAccessExpression)
    const result = nodeToGeneric(propAccess)
    expect(result.type).toBe('MemberExpression')
    expect(result.computed).toBe(false)
    project.removeSourceFile(sf)
  })

  it('converts ElementAccessExpression to MemberExpression with computed true', () => {
    const sf = project.createSourceFile('elem.ts', 'const x = arr[0];')
    const elemAccess = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ElementAccessExpression)
    const result = nodeToGeneric(elemAccess)
    expect(result.type).toBe('MemberExpression')
    expect(result.computed).toBe(true)
    project.removeSourceFile(sf)
  })

  it('converts an ArrowFunction with async flag', () => {
    const sf = project.createSourceFile('arrow.ts', 'const f = async () => 1;')
    const arrow = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ArrowFunction)
    const result = nodeToGeneric(arrow)
    expect(result.type).toBe('ArrowFunctionExpression')
    expect(result.async).toBe(true)
    project.removeSourceFile(sf)
  })

  it('converts ShorthandPropertyAssignment with shorthand flag', () => {
    const sf = project.createSourceFile('short.ts', 'const x = 1; const obj = { x };')
    const shorthand = sf.getFirstDescendantByKindOrThrow(SyntaxKind.ShorthandPropertyAssignment)
    const result = nodeToGeneric(shorthand)
    expect(result.type).toBe('Property')
    expect(result.shorthand).toBe(true)
    project.removeSourceFile(sf)
  })

  it('does not itself store result in genericNodeCache (ensureGenericNode does that)', () => {
    const sf = project.createSourceFile('cache.ts', 'const y = 2;')
    const varDecl = sf.getFirstDescendantByKindOrThrow(SyntaxKind.VariableDeclaration)
    genericNodeCache.delete(varDecl)
    nodeToGeneric(varDecl)
    expect(genericNodeCache.get(varDecl)).toBeUndefined()
    project.removeSourceFile(sf)
  })
})

// ─── setParentRefs ───

describe('setParentRefs', () => {
  it('sets parent on nested nodes', () => {
    const child = { type: 'Identifier' }
    const parent = { body: [child], type: 'BlockStatement' }
    setParentRefs(parent)
    expect(child.parent).toBe(parent)
  })

  it('sets parent on deeply nested nodes', () => {
    const leaf = { type: 'Identifier' }
    const mid = { argument: leaf, type: 'ReturnStatement' }
    const root = { body: [mid], type: 'BlockStatement' }
    setParentRefs(root)
    expect(mid.parent).toBe(root)
    expect(leaf.parent).toBe(mid)
  })

  it('does not set parent on root node when called with null', () => {
    const root = { type: 'Program' }
    setParentRefs(root, null)
    expect(root.parent).toBeUndefined()
  })

  it('handles nodes without type property (skips them)', () => {
    const nonNode = { value: 'hello' }
    const parent = { body: [nonNode], type: 'BlockStatement' }
    setParentRefs(parent)
    expect((nonNode as Record<string, unknown>).parent).toBeUndefined()
  })

  it('handles arrays containing null and primitive values', () => {
    const child = { type: 'Literal' }
    const parent = { elements: [null, child, 42], type: 'ArrayExpression' }
    setParentRefs(parent)
    expect(child.parent).toBe(parent)
  })

  it('handles circular references without infinite loop', () => {
    const node: Record<string, unknown> = { type: 'Node' }
    node.self = node
    expect(() => setParentRefs(node)).not.toThrow()
  })

  it('sets parent on property value nodes', () => {
    const value = { type: 'Literal' }
    const prop = { key: { type: 'Identifier' }, type: 'Property', value }
    const obj = { properties: [prop], type: 'ObjectExpression' }
    setParentRefs(obj)
    expect(value.parent).toBe(prop)
    expect(prop.parent).toBe(obj)
  })

  it('accepts explicit parent parameter', () => {
    const child = { type: 'Identifier' }
    const explicitParent = { type: 'FunctionDeclaration' }
    setParentRefs(child, explicitParent)
    expect(child.parent).toBe(explicitParent)
  })
})
