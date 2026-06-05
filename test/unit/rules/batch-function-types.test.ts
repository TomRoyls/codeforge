import { describe, expect, it } from 'vitest'
import { Project } from 'ts-morph'

import { nodeToGeneric } from '../../../src/rules/adapter-node-converter.js'

describe('Function and Arrow type mappings', () => {
  function parse(code: string): unknown {
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', code)
    const result = nodeToGeneric(sourceFile)
    if (!result) throw new Error('Failed to convert')
    return result
  }

  describe('ArrowFunction', () => {
    it('preserves parameter typeAnnotation on arrow function', () => {
      const ast = parse('const f = (x: number) => x;') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      const decl = (stmt.declarations as Record<string, unknown>[])[0]
      const init = decl.init as Record<string, unknown>
      expect(init.type).toBe('ArrowFunctionExpression')
      const params = init.params as Record<string, unknown>[]
      expect(params).toHaveLength(1)
      const param = params[0]
      expect(param.type).toBe('Identifier')
      expect(param.name).toBe('x')
      const ta = param.typeAnnotation as Record<string, unknown> | undefined
      expect(ta).toBeDefined()
      expect(ta!.type).toBe('TSTypeAnnotation')
      expect((ta!.typeAnnotation as Record<string, unknown>).type).toBe('TSNumberKeyword')
    })

    it('preserves return type on arrow function', () => {
      const ast = parse('const f = (x: number): string => String(x);') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      const decl = (stmt.declarations as Record<string, unknown>[])[0]
      const init = decl.init as Record<string, unknown>
      expect(init.type).toBe('ArrowFunctionExpression')
      const rt = init.returnType as Record<string, unknown> | undefined
      expect(rt).toBeDefined()
      expect(rt!.type).toBe('TSTypeAnnotation')
      expect((rt!.typeAnnotation as Record<string, unknown>).type).toBe('TSStringKeyword')
    })
  })

  describe('FunctionDeclaration', () => {
    it('preserves parameter typeAnnotation', () => {
      const ast = parse('function foo(x: number): number { return x; }') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      expect(stmt.type).toBe('FunctionDeclaration')
      const params = stmt.params as Record<string, unknown>[]
      expect(params).toHaveLength(1)
      const param = params[0]
      expect(param.type).toBe('Identifier')
      const ta = param.typeAnnotation as Record<string, unknown> | undefined
      expect(ta).toBeDefined()
      expect(ta!.type).toBe('TSTypeAnnotation')
    })

    it('preserves return type', () => {
      const ast = parse('function foo(x: number): string { return String(x); }') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      const rt = stmt.returnType as Record<string, unknown> | undefined
      expect(rt).toBeDefined()
      expect(rt!.type).toBe('TSTypeAnnotation')
      expect((rt!.typeAnnotation as Record<string, unknown>).type).toBe('TSStringKeyword')
    })

    it('preserves function id (name)', () => {
      const ast = parse('function foo() {}') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      const id = stmt.id as Record<string, unknown>
      expect(id).toBeDefined()
      expect(id.type).toBe('Identifier')
      expect(id.name).toBe('foo')
    })
  })

  describe('FunctionExpression', () => {
    it('preserves parameter typeAnnotation on function expression', () => {
      const ast = parse('const f = function(x: number) { return x; }') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      const decl = (stmt.declarations as Record<string, unknown>[])[0]
      const init = decl.init as Record<string, unknown>
      expect(init.type).toBe('FunctionExpression')
      const params = init.params as Record<string, unknown>[]
      const param = params[0]
      const ta = param.typeAnnotation as Record<string, unknown> | undefined
      expect(ta).toBeDefined()
      expect(ta!.type).toBe('TSTypeAnnotation')
    })
  })

  describe('TypeAliasDeclaration', () => {
    it('converts type alias', () => {
      const ast = parse('type Foo = number;') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      expect(stmt.type).toBe('TSTypeAliasDeclaration')
      expect(stmt.id).toBeDefined()
      const id = stmt.id as Record<string, unknown>
      expect(id.type).toBe('Identifier')
      expect(id.name).toBe('Foo')
    })

    it('converts union type alias', () => {
      const ast = parse('type Foo = string | number;') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      expect(stmt.type).toBe('TSTypeAliasDeclaration')
      const ta = stmt.typeAnnotation as Record<string, unknown>
      expect(ta.type).toBe('TSTypeAnnotation')
      const inner = ta.typeAnnotation as Record<string, unknown>
      expect(inner.type).toBe('TSUnionType')
    })
  })

  describe('InterfaceDeclaration', () => {
    it('converts interface with body', () => {
      const ast = parse('interface Foo { bar: number; }') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      expect(stmt.type).toBe('TSInterfaceDeclaration')
      const id = stmt.id as Record<string, unknown>
      expect(id.name).toBe('Foo')
      const body = stmt.body as Record<string, unknown>
      expect(body.type).toBe('TSInterfaceBody')
      const members = body.body as unknown[]
      expect(members).toHaveLength(1)
    })
  })

  describe('EnumDeclaration', () => {
    it('converts string enum', () => {
      const ast = parse('enum E { A = "a", B = "b" }') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      expect(stmt.type).toBe('TSEnumDeclaration')
      const id = stmt.id as Record<string, unknown>
      expect(id.name).toBe('E')
      const members = stmt.members as unknown[]
      expect(members).toHaveLength(2)
    })
  })

  describe('Class with generics', () => {
    it('preserves class method return type', () => {
      const ast = parse('class C { foo(): number { return 1; } }') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      expect(stmt.type).toBe('ClassDeclaration')
      const body = stmt.body as Record<string, unknown>
      expect(body.type).toBe('ClassBody')
      const methods = body.body as Record<string, unknown>[]
      const method = methods[0]
      expect(method.type).toBe('MethodDefinition')
      const value = method.value as Record<string, unknown>
      expect(value.type).toBe('FunctionExpression')
      const rt = value.returnType as Record<string, unknown> | undefined
      expect(rt).toBeDefined()
      expect(rt!.type).toBe('TSTypeAnnotation')
      expect((rt!.typeAnnotation as Record<string, unknown>).type).toBe('TSNumberKeyword')
    })

    it('preserves constructor parameter types', () => {
      const ast = parse('class C { constructor(x: number, y: string) {} }') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      const body = stmt.body as Record<string, unknown>
      const methods = body.body as Record<string, unknown>[]
      const ctor = methods[0]
      expect(ctor.type).toBe('MethodDefinition')
      expect(ctor.kind).toBe('constructor')
      const value = ctor.value as Record<string, unknown>
      const params = value.params as Record<string, unknown>[]
      expect(params).toHaveLength(2)
      const ta0 = params[0].typeAnnotation as Record<string, unknown> | undefined
      expect(ta0).toBeDefined()
      expect((ta0!.typeAnnotation as Record<string, unknown>).type).toBe('TSNumberKeyword')
      const ta1 = params[1].typeAnnotation as Record<string, unknown> | undefined
      expect(ta1).toBeDefined()
      expect((ta1!.typeAnnotation as Record<string, unknown>).type).toBe('TSStringKeyword')
    })
  })
})
