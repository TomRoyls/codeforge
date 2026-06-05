import { describe, expect, it } from 'vitest'
import { Project, SyntaxKind, type Node } from 'ts-morph'
import { nodeToGeneric } from '../../../src/rules/adapter-node-converter.js'

function getInitializer(code: string): Node {
  const project = new Project({ useInMemoryFileSystem: true })
  const sf = project.createSourceFile('test.ts', code)
  const varDecl = sf.getFirstDescendantByKind(SyntaxKind.VariableDeclaration)
  if (!varDecl) throw new Error('No VariableDeclaration found')
  const init = varDecl.getInitializer()
  if (!init) throw new Error('No initializer found')
  return init
}

describe('optional chaining adapter', () => {
  it('maps PropertyAccessExpression with ?. to OptionalMemberExpression inside ChainExpression', () => {
    const node = getInitializer('const x = a?.b')
    const result = nodeToGeneric(node) as any
    expect(result.type).toBe('ChainExpression')
    const expr = result.expression
    expect(expr.type).toBe('OptionalMemberExpression')
    expect(expr.optional).toBe(true)
    expect(expr.object.name).toBe('a')
    expect(expr.property.name).toBe('b')
    expect(expr.computed).toBe(false)
  })

  it('maps ElementAccessExpression with ?. to OptionalMemberExpression', () => {
    const node = getInitializer('const x = a?.[0]')
    const result = nodeToGeneric(node) as any
    expect(result.type).toBe('ChainExpression')
    const expr = result.expression
    expect(expr.type).toBe('OptionalMemberExpression')
    expect(expr.optional).toBe(true)
    expect(expr.computed).toBe(true)
  })

  it('maps CallExpression with ?.() to OptionalCallExpression', () => {
    const node = getInitializer('const x = a?.()')
    const result = nodeToGeneric(node) as any
    expect(result.type).toBe('ChainExpression')
    const expr = result.expression
    expect(expr.type).toBe('OptionalCallExpression')
    expect(expr.optional).toBe(true)
    expect(expr.callee.name).toBe('a')
  })

  it('maps method call with ?. to OptionalCallExpression', () => {
    const node = getInitializer('const x = obj?.method()')
    const result = nodeToGeneric(node) as any
    expect(result.type).toBe('ChainExpression')
    const expr = result.expression
    expect(expr.type).toBe('OptionalCallExpression')
    expect(expr.optional).toBe(true)
    expect(expr.callee.type).toBe('OptionalMemberExpression')
    expect(expr.callee.object.name).toBe('obj')
    expect(expr.callee.property.name).toBe('method')
  })

  it('preserves non-optional MemberExpression type', () => {
    const node = getInitializer('const x = a.b')
    const result = nodeToGeneric(node) as any
    expect(result.type).toBe('MemberExpression')
    expect(result.optional).toBeUndefined()
  })

  it('preserves non-optional CallExpression type', () => {
    const node = getInitializer('const x = a()')
    const result = nodeToGeneric(node) as any
    expect(result.type).toBe('CallExpression')
    expect(result.optional).toBeUndefined()
  })

  it('handles long optional chain a?.b?.c?.d', () => {
    const node = getInitializer('const x = a?.b?.c?.d')
    const result = nodeToGeneric(node) as any
    expect(result.type).toBe('ChainExpression')
    expect(result.expression.type).toBe('OptionalMemberExpression')
    expect(result.expression.optional).toBe(true)
    expect(result.expression.object.type).toBe('OptionalMemberExpression')
    expect(result.expression.object.optional).toBe(true)
    expect(result.expression.object.object.type).toBe('OptionalMemberExpression')
    expect(result.expression.object.object.optional).toBe(true)
    expect(result.expression.object.object.object.name).toBe('a')
  })
})
