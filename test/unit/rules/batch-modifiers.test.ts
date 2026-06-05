import { describe, expect, it } from 'vitest'
import { Project } from 'ts-morph'
import { nodeToGeneric } from '../../../src/rules/adapter-node-converter.js'

describe('Modifier extraction', () => {
  function parse(code: string): unknown {
    const project = new Project({ useInMemoryFileSystem: true })
    const sf = project.createSourceFile('test.ts', code)
    return nodeToGeneric(sf)
  }

  it('extracts async modifier', () => {
    const ast = parse('async function foo() {}') as Record<string, unknown>
    const fn = (ast.body as unknown[])[0] as Record<string, unknown>
    expect(fn.type).toBe('FunctionDeclaration')
    expect(fn.async).toBe(true)
  })

  it('extracts export modifier', () => {
    const ast = parse('export function bar() {}') as Record<string, unknown>
    const fn = (ast.body as unknown[])[0] as Record<string, unknown>
    expect(fn.export).toBe(true)
  })

  it('extracts static modifier on method', () => {
    const ast = parse('class C { static method() {} }') as Record<string, unknown>
    const cls = (ast.body as unknown[])[0] as Record<string, unknown>
    const body = cls.body as Record<string, unknown>
    const method = (body.body as unknown[])[0] as Record<string, unknown>
    expect(method.static).toBe(true)
  })

  it('extracts readonly modifier on property', () => {
    const ast = parse('class C { readonly x: number = 1; }') as Record<string, unknown>
    const cls = (ast.body as unknown[])[0] as Record<string, unknown>
    const body = cls.body as Record<string, unknown>
    const prop = (body.body as unknown[])[0] as Record<string, unknown>
    expect(prop.readonly).toBe(true)
  })

  it('extracts private accessibility', () => {
    const ast = parse('class C { private method() {} }') as Record<string, unknown>
    const cls = (ast.body as unknown[])[0] as Record<string, unknown>
    const body = cls.body as Record<string, unknown>
    const method = (body.body as unknown[])[0] as Record<string, unknown>
    expect(method.accessibility).toBe('private')
  })

  it('extracts abstract modifier on class', () => {
    const ast = parse('abstract class C {}') as Record<string, unknown>
    const cls = (ast.body as unknown[])[0] as Record<string, unknown>
    expect(cls.abstract).toBe(true)
  })

  it('extracts declare modifier', () => {
    const ast = parse('declare const x: number;') as Record<string, unknown>
    const decl = (ast.body as unknown[])[0] as Record<string, unknown>
    expect(decl.declare).toBe(true)
  })
})
