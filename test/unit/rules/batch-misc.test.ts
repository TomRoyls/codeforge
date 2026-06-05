import { describe, expect, it } from 'vitest'
import { Project } from 'ts-morph'
import { nodeToGeneric } from '../../../src/rules/adapter-node-converter.js'

describe('Misc adapter conversions', () => {
  function parse(code: string): unknown {
    const project = new Project({ useInMemoryFileSystem: true })
    const sf = project.createSourceFile('test.ts', code)
    return nodeToGeneric(sf)
  }

  it('handles generator function', () => {
    const ast = parse('function* gen() { yield 1; }') as Record<string, unknown>
    const fn = (ast.body as unknown[])[0] as Record<string, unknown>
    expect(fn.type).toBe('FunctionDeclaration')
    expect(fn.generator).toBe(true)
  })

  it('handles generator method', () => {
    const ast = parse('class C { *gen() {} }') as Record<string, unknown>
    const cls = (ast.body as unknown[])[0] as Record<string, unknown>
    const body = cls.body as Record<string, unknown>
    const method = (body.body as unknown[])[0] as Record<string, unknown>
    expect(method.type).toBe('MethodDefinition')
    expect(method.generator).toBe(true)
  })

  it('handles computed property', () => {
    const ast = parse('const obj = { [key]: 42 }') as Record<string, unknown>
    const decl = (ast.body as unknown[])[0] as Record<string, unknown>
    const vdecl = (decl.declarations as unknown[])[0] as Record<string, unknown>
    const init = vdecl.init as Record<string, unknown>
    expect(init.type).toBe('ObjectExpression')
    const prop = (init.properties as unknown[])[0] as Record<string, unknown>
    expect(prop.computed).toBe(true)
  })

  it('handles shorthand property', () => {
    const ast = parse('const a = 1; const obj = { a };') as Record<string, unknown>
    const decl2 = (ast.body as unknown[])[1] as Record<string, unknown>
    const vdecl = (decl2.declarations as unknown[])[0] as Record<string, unknown>
    const init = vdecl.init as Record<string, unknown>
    const prop = (init.properties as unknown[])[0] as Record<string, unknown>
    expect(prop.shorthand).toBe(true)
  })

  it('handles optional chaining', () => {
    const ast = parse('const x = a?.b?.c') as Record<string, unknown>
    const decl = (ast.body as unknown[])[0] as Record<string, unknown>
    const vdecl = (decl.declarations as unknown[])[0] as Record<string, unknown>
    const init = vdecl.init as Record<string, unknown>
    expect(init.type).toBe('OptionalMemberExpression')
    expect(init.optional).toBe(true)
  })

  it('handles nullish coalescing', () => {
    const ast = parse('const x = a ?? b') as Record<string, unknown>
    const decl = (ast.body as unknown[])[0] as Record<string, unknown>
    const vdecl = (decl.declarations as unknown[])[0] as Record<string, unknown>
    const init = vdecl.init as Record<string, unknown>
    expect(init.type).toBe('LogicalExpression')
    expect(init.operator).toBe('??')
  })

  it('handles spread element', () => {
    const ast = parse('const x = [...arr]') as Record<string, unknown>
    const decl = (ast.body as unknown[])[0] as Record<string, unknown>
    const vdecl = (decl.declarations as unknown[])[0] as Record<string, unknown>
    const init = vdecl.init as Record<string, unknown>
    const elem = (init.elements as unknown[])[0] as Record<string, unknown>
    expect(elem.type).toBe('SpreadElement')
  })

  it('handles rest element in params', () => {
    const ast = parse('function f(...args) {}') as Record<string, unknown>
    const fn = (ast.body as unknown[])[0] as Record<string, unknown>
    const param = (fn.params as unknown[])[0] as Record<string, unknown>
    expect(param.type).toBe('RestElement')
  })

  it('handles yield* delegate', () => {
    const ast = parse('function* gen() { yield* [1, 2, 3]; }') as Record<string, unknown>
    const fn = (ast.body as unknown[])[0] as Record<string, unknown>
    const body = fn.body as Record<string, unknown>
    const stmt = (body.body as unknown[])[0] as Record<string, unknown>
    const expr = stmt.expression as Record<string, unknown>
    expect(expr.type).toBe('YieldExpression')
    expect(expr.delegate).toBe(true)
  })

  it('handles yield without delegate', () => {
    const ast = parse('function* gen() { yield 1; }') as Record<string, unknown>
    const fn = (ast.body as unknown[])[0] as Record<string, unknown>
    const body = fn.body as Record<string, unknown>
    const stmt = (body.body as unknown[])[0] as Record<string, unknown>
    const expr = stmt.expression as Record<string, unknown>
    expect(expr.type).toBe('YieldExpression')
    expect(expr.delegate).toBeUndefined()
  })
})
