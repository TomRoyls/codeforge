import { describe, expect, it } from 'vitest'

import { extractImports, findOrphanFiles, type DependencyGraph } from '../../src/commands/dependencies-helpers.js'

// ─── extractImports ───

describe('extractImports', () => {
  it('extracts static imports', () => {
    const code = `import { foo } from 'bar'`
    const result = extractImports(code, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('bar')
  })

  it('extracts type imports', () => {
    const code = `import type { Foo } from './types'`
    const result = extractImports(code, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./types')
  })

  it('extracts default imports', () => {
    const code = `import React from 'react'`
    const result = extractImports(code, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('react')
  })

  it('extracts namespace imports', () => {
    const code = `import * as fs from 'fs'`
    const result = extractImports(code, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('fs')
  })

  it('extracts dynamic imports', () => {
    const code = `const mod = import('dynamic-module')`
    const result = extractImports(code, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('dynamic-module')
  })

  it('extracts require calls', () => {
    const code = `const path = require('path')`
    const result = extractImports(code, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('path')
  })

  it('returns empty for no imports', () => {
    const code = `const x = 1\nconsole.log(x)`
    expect(extractImports(code, 'test.ts')).toEqual([])
  })

  it('sets sourceFile from filePath param', () => {
    const result = extractImports(`import { x } from 'module'`, 'my/file.ts')
    expect(result[0].sourceFile).toBe('my/file.ts')
  })

  it('tracks line numbers correctly', () => {
    const code = `const a = 1\nimport { b } from 'c'\nconst d = 2`
    const result = extractImports(code, 'test.ts')
    expect(result[0].location.line).toBe(2)
  })
})

// ─── findOrphanFiles ───

describe('findOrphanFiles', () => {
  it('finds files not imported by others', () => {
    const graph: DependencyGraph = {
      nodes: new Map([
        ['./a.ts', { filePath: './a.ts', importDetails: new Map(), imports: new Set(['./b.ts']) }],
        ['./b.ts', { filePath: './b.ts', importDetails: new Map(), imports: new Set() }],
        ['./c.ts', { filePath: './c.ts', importDetails: new Map(), imports: new Set() }],
      ]),
    }
    const orphans = findOrphanFiles(graph)
    expect(orphans).toContain('./c.ts')
    expect(orphans).toContain('./a.ts')
    expect(orphans).not.toContain('./b.ts')
  })

  it('considers only relative imports', () => {
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', { filePath: 'a.ts', importDetails: new Map(), imports: new Set(['lodash']) }],
      ]),
    }
    const orphans = findOrphanFiles(graph)
    expect(orphans).toContain('a.ts')
  })

  it('returns empty for fully connected graph', () => {
    const graph: DependencyGraph = {
      nodes: new Map([
        ['./a.ts', { filePath: './a.ts', importDetails: new Map(), imports: new Set(['./b.ts']) }],
        ['./b.ts', { filePath: './b.ts', importDetails: new Map(), imports: new Set(['./a.ts']) }],
      ]),
    }
    expect(findOrphanFiles(graph)).toEqual([])
  })
})
