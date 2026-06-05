import { describe, expect, it } from 'vitest'
import { Project } from 'ts-morph'
import { nodeToGeneric } from '../../../src/rules/adapter-node-converter.js'

describe('ForOfStatement await', () => {
  function parse(code: string): unknown {
    const project = new Project({ useInMemoryFileSystem: true })
    const sf = project.createSourceFile('test.ts', code)
    return nodeToGeneric(sf)
  }

  it('sets await=true on for-await-of', () => {
    const ast = parse('async function f() { for await (const v of arr) {} }') as Record<string, unknown>
    const fn = (ast.body as unknown[])[0] as Record<string, unknown>
    const fnBody = fn.body as Record<string, unknown>
    const forOf = (fnBody.body as unknown[])[0] as Record<string, unknown>
    expect(forOf.type).toBe('ForOfStatement')
    expect(forOf.await).toBe(true)
  })

  it('sets await=false on regular for-of', () => {
    const ast = parse('for (const v of arr) {}') as Record<string, unknown>
    const forOf = (ast.body as unknown[])[0] as Record<string, unknown>
    expect(forOf.type).toBe('ForOfStatement')
    expect(forOf.await).toBeUndefined()
  })
})
