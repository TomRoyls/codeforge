import { describe, it, expect } from 'vitest'
import { extractImports, findOrphanFiles } from '../src/commands/dependencies-helpers.js'
import type { DependencyGraph } from '../src/commands/dependencies-helpers.js'

// ─── extractImports ───────────────────────────────────
describe('extractImports', () => {
  it('extracts static imports', () => {
    const code = `import { foo } from './utils'`
    const result = extractImports(code, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.modulePath).toBe('./utils')
  })

  it('extracts type imports', () => {
    const code = `import type { Foo } from './types'`
    const result = extractImports(code, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.modulePath).toBe('./types')
  })

  it('extracts default imports', () => {
    const code = `import React from 'react'`
    const result = extractImports(code, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.modulePath).toBe('react')
  })

  it('extracts namespace imports', () => {
    const code = `import * as utils from './utils'`
    const result = extractImports(code, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.modulePath).toBe('./utils')
  })

  it('extracts dynamic imports', () => {
    const code = `const mod = import('./module')`
    const result = extractImports(code, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.modulePath).toBe('./module')
  })

  it('extracts require calls', () => {
    const code = `const fs = require('fs')`
    const result = extractImports(code, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.modulePath).toBe('fs')
  })

  it('extracts multiple imports from different lines', () => {
    const code = `import { a } from './a'\nimport { b } from './b'\nimport { c } from './c'`
    const result = extractImports(code, 'test.ts')
    expect(result).toHaveLength(3)
  })

  it('sets correct source file', () => {
    const result = extractImports(`import { x } from './x'`, 'my-file.ts')
    expect(result[0]!.sourceFile).toBe('my-file.ts')
  })

  it('sets correct line number', () => {
    const code = `// comment\nimport { x } from './x'`
    const result = extractImports(code, 'test.ts')
    expect(result[0]!.location.line).toBe(2)
  })

  it('returns empty array for code without imports', () => {
    const code = `const x = 1\nconsole.log(x)`
    expect(extractImports(code, 'test.ts')).toEqual([])
  })

  it('returns empty array for empty code', () => {
    expect(extractImports('', 'test.ts')).toEqual([])
  })

  it('handles mixed import styles', () => {
    const code = [
      `import { foo } from './utils'`,
      `const bar = import('./dynamic')`,
      `const baz = require('lodash')`,
    ].join('\n')
    const result = extractImports(code, 'test.ts')
    expect(result).toHaveLength(3)
    expect(result.map((r) => r.modulePath)).toEqual(['./utils', './dynamic', 'lodash'])
  })

  it('handles import with single quotes', () => {
    const code = `import { x } from './mod'`
    const result = extractImports(code, 'test.ts')
    expect(result[0]!.modulePath).toBe('./mod')
  })

  it('handles import with double quotes', () => {
    const code = `import { x } from "./mod"`
    const result = extractImports(code, 'test.ts')
    expect(result[0]!.modulePath).toBe('./mod')
  })

  it('sets column to 1 and end to line length', () => {
    const code = `import { foo } from './utils'`
    const result = extractImports(code, 'test.ts')
    expect(result[0]!.location.column).toBe(1)
    expect(result[0]!.location.end).toBe(code.length)
  })
})

// ─── findOrphanFiles ──────────────────────────────────
describe('findOrphanFiles', () => {
  it('returns all files as orphans when nothing imports anything', () => {
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', { filePath: 'a.ts', importDetails: new Map(), imports: new Set() }],
        ['b.ts', { filePath: 'b.ts', importDetails: new Map(), imports: new Set() }],
      ]),
    }
    const result = findOrphanFiles(graph)
    expect(result).toHaveLength(2)
  })

  it('excludes files that are imported by others', () => {
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', { filePath: 'a.ts', importDetails: new Map(), imports: new Set(['./b.ts']) }],
        ['./b.ts', { filePath: './b.ts', importDetails: new Map(), imports: new Set() }],
      ]),
    }
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['a.ts'])
  })

  it('only considers relative imports as imports', () => {
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', { filePath: 'a.ts', importDetails: new Map(), imports: new Set(['react']) }],
        ['b.ts', { filePath: 'b.ts', importDetails: new Map(), imports: new Set() }],
      ]),
    }
    const result = findOrphanFiles(graph)
    expect(result).toHaveLength(2)
  })

  it('returns empty for empty graph', () => {
    const graph: DependencyGraph = { nodes: new Map() }
    expect(findOrphanFiles(graph)).toEqual([])
  })

  it('handles chain of imports', () => {
    const graph: DependencyGraph = {
      nodes: new Map([
        ['main.ts', { filePath: 'main.ts', importDetails: new Map(), imports: new Set(['./a.ts']) }],
        ['./a.ts', { filePath: './a.ts', importDetails: new Map(), imports: new Set(['./b.ts']) }],
        ['./b.ts', { filePath: './b.ts', importDetails: new Map(), imports: new Set() }],
      ]),
    }
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['main.ts'])
  })
})
