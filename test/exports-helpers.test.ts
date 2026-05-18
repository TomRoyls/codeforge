import { describe, it, expect } from 'vitest'
import {
  truncateSignature,
  extractImports,
  extractExports,
  getFunctionSignature,
} from '../src/commands/exports-helpers.js'

// ─── truncateSignature ─────────────────────────────────
describe('truncateSignature', () => {
  it('returns short strings unchanged', () => {
    expect(truncateSignature('hello')).toBe('hello')
  })

  it('returns string at exactly max length unchanged', () => {
    const s = 'a'.repeat(80)
    expect(truncateSignature(s)).toBe(s)
  })

  it('truncates strings exceeding max length', () => {
    const s = 'a'.repeat(100)
    const result = truncateSignature(s)
    expect(result.length).toBe(80)
    expect(result).toContain('...')
  })

  it('uses default max length of 80', () => {
    const s = 'a'.repeat(81)
    const result = truncateSignature(s)
    expect(result.length).toBe(80)
    expect(result.endsWith('...')).toBe(true)
  })

  it('supports custom max length', () => {
    const s = 'a'.repeat(50)
    const result = truncateSignature(s, 20)
    expect(result.length).toBe(20)
    expect(result.endsWith('...')).toBe(true)
  })

  it('handles max length of 3', () => {
    expect(truncateSignature('hello', 3)).toBe('...')
  })

  it('handles max length of 0 by returning ...', () => {
    expect(truncateSignature('hello', 0)).toBe('...')
  })

  it('handles max length of 1', () => {
    expect(truncateSignature('hello', 1)).toBe('...')
  })

  it('handles max length of 2', () => {
    expect(truncateSignature('hello', 2)).toBe('...')
  })

  it('preserves content within limit', () => {
    const s = 'hello world'
    const result = truncateSignature(s, 14)
    expect(result).toBe('hello world')
  })

  it('truncates exactly at boundary + 1', () => {
    const s = 'a'.repeat(21)
    const result = truncateSignature(s, 20)
    expect(result).toBe('a'.repeat(17) + '...')
  })
})

// ─── extractImports ────────────────────────────────────
describe('extractImports', () => {
  it('returns empty map for file with no imports', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', 'const x = 1;')
    const imports = extractImports(sourceFile)
    expect(imports.size).toBe(0)
  })

  it('extracts named imports', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile(
      'test.ts',
      `import { foo, bar } from 'module';`,
    )
    const imports = extractImports(sourceFile)
    expect(imports.get('foo')).toBe(1)
    expect(imports.get('bar')).toBe(1)
  })

  it('counts duplicate imports', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile(
      'test.ts',
      `import { foo } from 'mod1';\nimport { foo } from 'mod2';`,
    )
    const imports = extractImports(sourceFile)
    expect(imports.get('foo')).toBe(2)
  })

  it('extracts default imports', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', `import myDefault from 'module';`)
    const imports = extractImports(sourceFile)
    expect(imports.get('myDefault')).toBe(1)
  })

  it('extracts namespace imports', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', `import * as ns from 'module';`)
    const imports = extractImports(sourceFile)
    expect(imports.get('ns')).toBe(1)
  })
})

// ─── extractExports ────────────────────────────────────
describe('extractExports', () => {
  it('returns empty array for file with no exports', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', 'const x = 1;')
    const exports = extractExports(sourceFile, 'test.ts')
    expect(exports).toEqual([])
  })

  it('extracts exported function', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', `export function myFunc() {}`)
    const exports = extractExports(sourceFile, 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0].name).toBe('myFunc')
    expect(exports[0].type).toBe('function')
    expect(exports[0].isExported).toBe(true)
  })

  it('extracts exported class', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', `export class MyClass {}`)
    const exports = extractExports(sourceFile, 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0].name).toBe('MyClass')
    expect(exports[0].type).toBe('class')
  })

  it('extracts exported interface', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', `export interface MyInterface {}`)
    const exports = extractExports(sourceFile, 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0].name).toBe('MyInterface')
    expect(exports[0].type).toBe('interface')
  })

  it('extracts exported type alias', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', `export type MyType = string;`)
    const exports = extractExports(sourceFile, 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0].name).toBe('MyType')
    expect(exports[0].type).toBe('type')
    expect(exports[0].signature).toBe('string')
  })

  it('extracts exported const', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', `export const MY_CONST = 42;`)
    const exports = extractExports(sourceFile, 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0].name).toBe('MY_CONST')
    expect(exports[0].type).toBe('const')
  })

  it('detects default export for function', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', `export default function main() {}`)
    const exports = extractExports(sourceFile, 'test.ts')
    expect(exports[0].isDefault).toBe(true)
  })

  it('extracts multiple exports', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile(
      'test.ts',
      `export function fn() {}\nexport class Cls {}\nexport const x = 1;`,
    )
    const exports = extractExports(sourceFile, 'test.ts')
    expect(exports).toHaveLength(3)
    expect(exports.map((e) => e.type).sort()).toEqual(['class', 'const', 'function'])
  })

  it('sets file path correctly', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', `export function fn() {}`)
    const exports = extractExports(sourceFile, 'src/utils.ts')
    expect(exports[0].file).toBe('src/utils.ts')
  })

  it('initializes usageCount to 0', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', `export function fn() {}`)
    const exports = extractExports(sourceFile, 'test.ts')
    expect(exports[0].usageCount).toBe(0)
  })
})

// ─── getFunctionSignature ──────────────────────────────
describe('getFunctionSignature', () => {
  it('extracts function signature with parameters', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile(
      'test.ts',
      `export function greet(name: string, age: number): string { return name; }`,
    )
    const fn = sourceFile.getFunction('greet')!
    const signature = getFunctionSignature(fn, sourceFile)
    expect(signature).toContain('name: string')
    expect(signature).toContain('age: number')
  })

  it('includes return type for non-void returns', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile(
      'test.ts',
      `export function getNum(): number { return 1; }`,
    )
    const fn = sourceFile.getFunction('getNum')!
    const signature = getFunctionSignature(fn, sourceFile)
    expect(signature).toContain('=>')
    expect(signature).toContain('number')
  })

  it('includes async prefix for async functions', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile(
      'test.ts',
      `export async function fetchData(): Promise<void> {}`,
    )
    const fn = sourceFile.getFunction('fetchData')!
    const signature = getFunctionSignature(fn, sourceFile)
    expect(signature).toContain('async')
  })

  it('handles function with no parameters', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', `export function noop() {}`)
    const fn = sourceFile.getFunction('noop')!
    const signature = getFunctionSignature(fn, sourceFile)
    expect(signature).toContain('()')
  })

  it('truncates long signatures', async () => {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const longParam = 'a'.repeat(100)
    const sourceFile = project.createSourceFile(
      'test.ts',
      `export function fn(${longParam}: string): void {}`,
    )
    const fn = sourceFile.getFunction('fn')!
    const signature = getFunctionSignature(fn, sourceFile)
    expect(signature.length).toBeLessThanOrEqual(80)
    expect(signature).toContain('...')
  })
})
