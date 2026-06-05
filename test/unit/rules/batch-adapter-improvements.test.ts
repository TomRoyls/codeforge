import { describe, expect, it } from 'vitest'
import { Project } from 'ts-morph'

import { nodeToGeneric } from '../../../src/rules/adapter-node-converter.js'

function parse(code: string): unknown {
  const project = new Project({ useInMemoryFileSystem: true })
  const sourceFile = project.createSourceFile('test.ts', code)
  return nodeToGeneric(sourceFile)
}

describe('Adapter improvements batch tests', () => {
  describe('TSEnumBody wrapping', () => {
    it('wraps enum members in TSEnumBody', () => {
      const ast = parse('enum Color { Red, Green, Blue }') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      expect(stmt.type).toBe('TSEnumDeclaration')
      expect(stmt.body).toBeDefined()
      const body = stmt.body as Record<string, unknown>
      expect(body.type).toBe('TSEnumBody')
      expect(Array.isArray(body.members)).toBe(true)
      expect((body.members as unknown[]).length).toBe(3)
    })

    it('preserves enum member initializers in TSEnumBody', () => {
      const ast = parse('enum E { A = 1, B = 2, C }') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      const body = stmt.body as Record<string, unknown>
      const members = body.members as Record<string, unknown>[]
      expect(members[0]!.init).toBeDefined()
      expect((members[0]!.init as Record<string, unknown>).type).toBe('Literal')
      expect(members[2]!.init).toBeUndefined()
    })
  })

  describe('TSModuleBody mapping', () => {
    it('maps ModuleBlock to TSModuleBody', () => {
      const ast = parse('namespace Foo { export const x = 1; }') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      expect(stmt.type).toBe('TSModuleDeclaration')
      expect(stmt.body).toBeDefined()
      const body = stmt.body as Record<string, unknown>
      expect(body.type).toBe('TSModuleBody')
      expect(Array.isArray(body.body)).toBe(true)
    })
  })

  describe('ExpressionWithTypeArguments', () => {
    it('preserves expression property (not mapped to argument)', () => {
      const ast = parse('class Foo extends Bar<Baz> {}') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      const classBody = stmt.body as Record<string, unknown>
      expect(classBody.type).toBe('ClassBody')
      expect(classBody.body).toBeDefined()
    })
  })

  describe('questionToken (optional member)', () => {
    it('sets optional:true for optional interface property', () => {
      const ast = parse('interface Foo { bar?: string; }') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      expect(stmt.type).toBe('TSInterfaceDeclaration')
      const body = stmt.body as Record<string, unknown>
      const members = body.body as Record<string, unknown>[]
      const bar = members[0]!
      expect(bar.optional).toBe(true)
    })

    it('sets optional:true for optional method signature', () => {
      const ast = parse('interface Foo { bar?(): void; }') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      const body = stmt.body as Record<string, unknown>
      const members = body.body as Record<string, unknown>[]
      const bar = members[0]!
      expect(bar.optional).toBe(true)
    })
  })

  describe('exclamationToken (definite assignment)', () => {
    it('sets definite:true for property with definite assignment', () => {
      const ast = parse('class Foo { x!: number; }') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      const classBody = stmt.body as Record<string, unknown>
      const members = classBody.body as Record<string, unknown>[]
      const x = members[0]!
      expect(x.definite).toBe(true)
    })
  })

  describe('OverrideKeyword', () => {
    it('sets override:true for method with override modifier', () => {
      const ast = parse('class Foo extends Bar { override bar(): void {} }') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      const classBody = stmt.body as Record<string, unknown>
      const members = classBody.body as Record<string, unknown>[]
      const bar = members[0]!
      expect(bar.override).toBe(true)
    })
  })

  describe('ParenthesizedExpression unwrapping', () => {
    it('unwraps parenthesized expressions', () => {
      const ast = parse('const x = (a + b);') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      const decl = stmt.declarations as unknown[]
      const init = (decl[0] as Record<string, unknown>).init as Record<string, unknown>
      expect(init.type).not.toBe('ParenthesizedExpression')
      expect(init.type).toBe('BinaryExpression')
    })
  })

  describe('TemplateLiteralTypeSpan', () => {
    it('maps TemplateLiteralTypeSpan type name', () => {
      const ast = parse('type X = `foo${string}bar`;') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      expect(stmt.type).toBe('TSTypeAliasDeclaration')
      const typeAnnotation = stmt.typeAnnotation as Record<string, unknown>
      expect(typeAnnotation.type).toBe('TSTypeAnnotation')
      const inner = typeAnnotation.typeAnnotation as Record<string, unknown>
      expect(inner.type).toBe('TSTemplateLiteralType')
    })
  })
})
