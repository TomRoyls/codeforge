import { describe, expect, it } from 'vitest'
import { Project } from 'ts-morph'

import { nodeToGeneric } from '../../../src/rules/adapter-node-converter.js'

describe('VariableDeclaration typeAnnotation', () => {
  function parse(code: string): unknown {
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', code)
    const result = nodeToGeneric(sourceFile)
    if (!result) throw new Error('Failed to convert')
    return result
  }

  it('preserves typeAnnotation on typed variable declarator', () => {
    const ast = parse('let x: number = 5;') as Record<string, unknown>
    const stmt = (ast.body as unknown[])![0] as Record<string, unknown>
    expect(stmt.type).toBe('VariableDeclaration')
    expect(stmt.kind).toBe('let')
    const decls = stmt.declarations as Record<string, unknown>[]
    expect(decls).toHaveLength(1)
    const decl = decls![0]
    expect(decl.type).toBe('VariableDeclarator')
    const id = decl.id as Record<string, unknown>
    expect(id.type).toBe('Identifier')
    expect(id.name).toBe('x')
    const ta = id.typeAnnotation as Record<string, unknown> | undefined
    expect(ta).toBeDefined()
    expect(ta!.type).toBe('TSTypeAnnotation')
    const inner = ta!.typeAnnotation as Record<string, unknown>
    expect(inner.type).toBe('TSNumberKeyword')
  })

  it('preserves typeAnnotation on const with string type', () => {
    const ast = parse('const s: string = "hello";') as Record<string, unknown>
    const stmt = (ast.body as unknown[])![0] as Record<string, unknown>
    expect(stmt.kind).toBe('const')
    const decl = (stmt.declarations as Record<string, unknown>[])[0]
    const id = decl.id as Record<string, unknown>
    const ta = id.typeAnnotation as Record<string, unknown> | undefined
    expect(ta).toBeDefined()
    expect(ta!.type).toBe('TSTypeAnnotation')
    const inner = ta!.typeAnnotation as Record<string, unknown>
    expect(inner.type).toBe('TSStringKeyword')
  })

  it('preserves typeAnnotation on variable with union type', () => {
    const ast = parse('let v: string | number = 42;') as Record<string, unknown>
    const stmt = (ast.body as unknown[])![0] as Record<string, unknown>
    const decl = (stmt.declarations as Record<string, unknown>[])[0]
    const id = decl.id as Record<string, unknown>
    const ta = id.typeAnnotation as Record<string, unknown> | undefined
    expect(ta).toBeDefined()
    expect(ta!.type).toBe('TSTypeAnnotation')
    const union = ta!.typeAnnotation as Record<string, unknown>
    expect(union.type).toBe('TSUnionType')
  })

  it('variable without type annotation has no typeAnnotation property', () => {
    const ast = parse('let x = 5;') as Record<string, unknown>
    const stmt = (ast.body as unknown[])![0] as Record<string, unknown>
    const decl = (stmt.declarations as Record<string, unknown>[])[0]
    const id = decl.id as Record<string, unknown>
    expect(id.typeAnnotation).toBeUndefined()
  })

  it('preserves init (initializer) on variable declarator', () => {
    const ast = parse('let x: number = 5;') as Record<string, unknown>
    const stmt = (ast.body as unknown[])![0] as Record<string, unknown>
    const decl = (stmt.declarations as Record<string, unknown>[])[0]
    expect(decl.init).toBeDefined()
    const init = decl.init as Record<string, unknown>
    expect(init.type).toBe('Literal')
  })

  it('handles multiple declarators in one declaration', () => {
    const ast = parse('let a: number = 1, b: string = "two";') as Record<string, unknown>
    const stmt = (ast.body as unknown[])![0] as Record<string, unknown>
    const decls = stmt.declarations as Record<string, unknown>[]
    expect(decls).toHaveLength(2)
    const idA = decls[0].id as Record<string, unknown>
    const taA = idA.typeAnnotation as Record<string, unknown> | undefined
    expect(taA).toBeDefined()
    expect((taA!.typeAnnotation as Record<string, unknown>).type).toBe('TSNumberKeyword')
    const idB = decls[1].id as Record<string, unknown>
    const taB = idB.typeAnnotation as Record<string, unknown> | undefined
    expect(taB).toBeDefined()
    expect((taB!.typeAnnotation as Record<string, unknown>).type).toBe('TSStringKeyword')
  })
})
