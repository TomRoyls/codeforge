import { describe, it, expect } from 'vitest'
import { TransformParser } from '../src/core/transform/transform-parser.js'

describe('TransformParser', () => {
  const parser = new TransformParser()

  describe('findFunctionByName', () => {
    it('finds a named function declaration', () => {
      const source = `function hello() { return 1; }`
      const result = parser.findFunctionByName(source, 'hello')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('function hello()')
      expect(result!.start).toBe(0)
    })

    it('finds an exported function', () => {
      const source = `export function greet(name: string) { return name; }`
      const result = parser.findFunctionByName(source, 'greet')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('export function greet')
    })

    it('finds an async function', () => {
      const source = `async function fetchData() { return await fetch('/'); }`
      const result = parser.findFunctionByName(source, 'fetchData')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('async function fetchData')
    })

    it('finds an arrow function with braces', () => {
      const source = `const add = (a: number, b: number) => { return a + b; }`
      const result = parser.findFunctionByName(source, 'add')
      expect(result).not.toBeNull()
    })

    it('returns null for non-existent function', () => {
      const source = `function hello() { return 1; }`
      const result = parser.findFunctionByName(source, 'missing')
      expect(result).toBeNull()
    })

    it('handles nested braces correctly', () => {
      const source = `function complex() { if (true) { return { a: 1 }; } }`
      const result = parser.findFunctionByName(source, 'complex')
      expect(result).not.toBeNull()
      expect(result!.content).toBe(source)
      expect(result!.end - result!.start).toBe(source.length)
    })
  })

  describe('findClassByName', () => {
    it('finds a class declaration', () => {
      const source = `class MyClass { constructor() {} }`
      const result = parser.findClassByName(source, 'MyClass')
      expect(result).not.toBeNull()
      expect(result!.content).toContain('class MyClass')
    })

    it('finds an exported class', () => {
      const source = `export class Service { run() {} }`
      const result = parser.findClassByName(source, 'Service')
      expect(result).not.toBeNull()
    })

    it('finds an abstract class', () => {
      const source = `export abstract class Base { abstract method(): void; }`
      const result = parser.findClassByName(source, 'Base')
      expect(result).not.toBeNull()
    })

    it('finds a class with extends', () => {
      const source = `class Child extends Parent { constructor() { super(); } }`
      const result = parser.findClassByName(source, 'Child')
      expect(result).not.toBeNull()
    })

    it('returns null for non-existent class', () => {
      const source = `class Foo {}`
      const result = parser.findClassByName(source, 'Bar')
      expect(result).toBeNull()
    })
  })

  describe('findImportStatements', () => {
    it('finds named imports', () => {
      const source = `import { foo, bar } from 'module'`
      const result = parser.findImportStatements(source)
      expect(result).toHaveLength(1)
      expect(result[0]!.module).toBe('module')
      expect(result[0]!.imports).toEqual(['foo', 'bar'])
    })

    it('finds namespace import', () => {
      const source = `import * as utils from 'utils'`
      const result = parser.findImportStatements(source)
      expect(result).toHaveLength(1)
      expect(result[0]!.imports).toEqual(['* as utils'])
    })

    it('finds default import', () => {
      const source = `import React from 'react'`
      const result = parser.findImportStatements(source)
      expect(result).toHaveLength(1)
      expect(result[0]!.imports).toEqual(['React'])
    })

    it('finds type import', () => {
      const source = `import type { Config } from './types'`
      const result = parser.findImportStatements(source)
      expect(result).toHaveLength(1)
      expect(result[0]!.module).toBe('./types')
    })

    it('finds multiple imports', () => {
      const source = `
        import { a } from 'mod1'
        import { b } from 'mod2'
      `
      const result = parser.findImportStatements(source)
      expect(result).toHaveLength(2)
    })

    it('returns empty for no imports', () => {
      const source = `const x = 1`
      const result = parser.findImportStatements(source)
      expect(result).toHaveLength(0)
    })
  })

  describe('findExportStatements', () => {
    it('finds named exports', () => {
      const source = `export const foo = 1\nexport function bar() {}`
      const result = parser.findExportStatements(source)
      expect(result.filter(e => e.type === 'named')).toHaveLength(2)
    })

    it('finds default export', () => {
      const source = `export default function main() {}`
      const result = parser.findExportStatements(source)
      expect(result.some(e => e.type === 'default')).toBe(true)
    })

    it('finds re-exports', () => {
      const source = `export { foo, bar } from 'module'`
      const result = parser.findExportStatements(source)
      expect(result.every(e => e.type === 're-export')).toBe(true)
      expect(result).toHaveLength(2)
    })

    it('returns empty for no exports', () => {
      const source = `const x = 1`
      const result = parser.findExportStatements(source)
      expect(result).toHaveLength(0)
    })
  })

  describe('findStringLiterals', () => {
    it('finds single-quoted strings', () => {
      const source = `const x = 'hello'`
      const result = parser.findStringLiterals(source)
      expect(result).toHaveLength(1)
      expect(result[0]!.quote).toBe("'")
      expect(result[0]!.value).toBe('hello')
    })

    it('finds double-quoted strings', () => {
      const source = `const x = "world"`
      const result = parser.findStringLiterals(source)
      expect(result).toHaveLength(1)
      expect(result[0]!.quote).toBe('"')
    })

    it('finds template literals', () => {
      const source = 'const x = `template`'
      const result = parser.findStringLiterals(source)
      expect(result).toHaveLength(1)
      expect(result[0]!.quote).toBe('`')
    })

    it('handles escaped quotes', () => {
      const source = `const x = "he said \\"hello\\""`
      const result = parser.findStringLiterals(source)
      expect(result).toHaveLength(1)
    })
  })

  describe('replaceInRange', () => {
    it('replaces a range in source', () => {
      const source = 'hello world'
      const result = parser.replaceInRange(source, 6, 11, 'earth')
      expect(result).toBe('hello earth')
    })

    it('replaces at beginning', () => {
      const source = 'hello world'
      const result = parser.replaceInRange(source, 0, 5, 'goodbye')
      expect(result).toBe('goodbye world')
    })
  })

  describe('addImport', () => {
    it('adds a new import when none exist', () => {
      const source = `const x = 1`
      const result = parser.addImport(source, 'lodash', ['debounce'])
      expect(result).toContain("import { debounce } from 'lodash'")
    })

    it('merges with existing import from same module', () => {
      const source = `import { foo } from 'utils'`
      const result = parser.addImport(source, 'utils', ['bar'])
      expect(result).toContain('foo')
      expect(result).toContain('bar')
      expect(result).toContain("from 'utils'")
    })
  })

  describe('removeImport', () => {
    it('removes an existing import', () => {
      const source = `import { foo } from 'utils'\nconst x = 1`
      const result = parser.removeImport(source, 'utils')
      expect(result).not.toContain('import')
      expect(result).toContain('const x = 1')
    })

    it('returns source unchanged for non-existent import', () => {
      const source = `const x = 1`
      const result = parser.removeImport(source, 'missing')
      expect(result).toBe(source)
    })
  })

  describe('addExport', () => {
    it('adds a default export', () => {
      const source = `const main = () => {}`
      const result = parser.addExport(source, 'main', 'default')
      expect(result).toContain('export default main')
    })

    it('adds a named export', () => {
      const source = `const foo = 1`
      const result = parser.addExport(source, 'foo', 'named')
      expect(result).toContain('export { foo }')
    })
  })
})
