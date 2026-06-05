import { describe, expect, it } from 'vitest'
import { Project } from 'ts-morph'

import { nodeToGeneric } from '../../../src/rules/adapter-node-converter.js'

describe('Destructuring with type annotations', () => {
  function parse(code: string): unknown {
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', code)
    const result = nodeToGeneric(sourceFile)
    if (!result) throw new Error('Failed to convert')
    return result
  }

  it('preserves type annotation on array destructuring', () => {
    const ast = parse('const [a, b]: [number, string] = [1, "two"];') as Record<string, unknown>
    const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
    const decls = stmt.declarations as Record<string, unknown>[]
    const decl = decls[0]
    expect(decl.type).toBe('VariableDeclarator')
    const id = decl.id as Record<string, unknown>
    expect(id.type).toBe('ArrayPattern')
    const ta = id.typeAnnotation as Record<string, unknown> | undefined
    expect(ta).toBeDefined()
    expect(ta!.type).toBe('TSTypeAnnotation')
    const inner = ta!.typeAnnotation as Record<string, unknown>
    expect(inner.type).toBe('TSTupleType')
  })

  it('preserves type annotation on object destructuring', () => {
    const ast = parse('const { a, b }: { a: number; b: string } = { a: 1, b: "x" };') as Record<string, unknown>
    const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
    const decls = stmt.declarations as Record<string, unknown>[]
    const decl = decls[0]
    expect(decl.type).toBe('VariableDeclarator')
    const id = decl.id as Record<string, unknown>
    expect(id.type).toBe('ObjectPattern')
    const ta = id.typeAnnotation as Record<string, unknown> | undefined
    expect(ta).toBeDefined()
    expect(ta!.type).toBe('TSTypeAnnotation')
    const inner = ta!.typeAnnotation as Record<string, unknown>
    expect(inner.type).toBe('TSTypeLiteral')
  })

  it('preserves elements in array destructuring pattern', () => {
    const ast = parse('const [a, b] = [1, 2];') as Record<string, unknown>
    const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
    const decls = stmt.declarations as Record<string, unknown>[]
    const decl = decls[0]
    const id = decl.id as Record<string, unknown>
    expect(id.type).toBe('ArrayPattern')
    const elements = id.elements as unknown[]
    expect(elements).toHaveLength(2)
  })

  it('preserves properties in object destructuring pattern', () => {
    const ast = parse('const { a, b } = obj;') as Record<string, unknown>
    const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
    const decls = stmt.declarations as Record<string, unknown>[]
    const decl = decls[0]
    const id = decl.id as Record<string, unknown>
    expect(id.type).toBe('ObjectPattern')
    const properties = id.properties as unknown[]
    expect(properties).toHaveLength(2)
  })
})
