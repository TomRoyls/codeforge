import { describe, expect, it } from 'vitest'
import { Project } from 'ts-morph'

import { nodeToGeneric } from '../../../src/rules/adapter-node-converter.js'

describe('Import/Export mappings', () => {
  function parse(code: string): unknown {
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', code)
    const result = nodeToGeneric(sourceFile)
    if (!result) throw new Error('Failed to convert')
    return result
  }

  describe('ImportDeclaration', () => {
    it('converts default import', () => {
      const ast = parse("import foo from 'mod';") as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      expect(stmt.type).toBe('ImportDeclaration')
      expect(stmt.source).toBeDefined()
      const source = stmt.source as Record<string, unknown>
      expect(source.type).toBe('Literal')
      expect(source.value).toBe('mod')
      const specs = stmt.specifiers as unknown[]
      expect(specs).toHaveLength(1)
      const spec = specs[0] as Record<string, unknown>
      expect(spec.type).toBe('ImportDefaultSpecifier')
    })

    it('converts named imports', () => {
      const ast = parse("import { a, b as c } from 'mod';") as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      expect(stmt.type).toBe('ImportDeclaration')
      const specs = stmt.specifiers as unknown[]
      expect(specs).toHaveLength(2)
      const s0 = specs[0] as Record<string, unknown>
      expect(s0.type).toBe('ImportSpecifier')
      const local0 = s0.local as Record<string, unknown>
      expect(local0.name).toBe('a')
      const s1 = specs[1] as Record<string, unknown>
      const imported = s1.imported as Record<string, unknown>
      expect(imported.name).toBe('b')
      const local1 = s1.local as Record<string, unknown>
      expect(local1.name).toBe('c')
    })

    it('converts namespace import', () => {
      const ast = parse("import * as foo from 'mod';") as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      const specs = stmt.specifiers as unknown[]
      expect(specs).toHaveLength(1)
      const spec = specs[0] as Record<string, unknown>
      expect(spec.type).toBe('ImportNamespaceSpecifier')
    })
  })

  describe('ExportDeclaration', () => {
    it('converts named exports', () => {
      const ast = parse("export { a, b } from 'mod';") as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      expect(stmt.type).toBe('ExportNamedDeclaration')
      expect(stmt.source).toBeDefined()
      const specs = stmt.specifiers as unknown[]
      expect(specs).toHaveLength(2)
    })

    it('converts default export (expression form)', () => {
      const ast = parse('export default 42;') as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      expect(stmt.type).toBe('ExportDefaultDeclaration')
      expect(stmt.declaration).toBeDefined()
    })

    it('converts namespace export', () => {
      const ast = parse("export * from 'mod';") as Record<string, unknown>
      const stmt = (ast.body as unknown[])[0] as Record<string, unknown>
      expect(stmt.type).toBe('ExportAllDeclaration')
    })
  })
})
