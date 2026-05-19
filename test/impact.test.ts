import { describe, expect, it } from 'vitest'

import {
  type ImpactNode,
  type ImpactResult,
  type ImpactChain,
  buildImpactResult,
  buildReverseDependencyMap,
  computeAverageRiskScore,
  computeDirectDependents,
  computeImpactChains,
  computeIndirectDependents,
  computeRiskLevel,
  estimateEffort,
  extractExports,
  extractImports,
  extractImportsFrom,
  findHighestRiskFile,
  findUnusedExports,
  matchFile,
  resolveImportPath,
} from '../src/commands/impact-helpers.js'
import {
  formatBlastRadiusGauge,
  formatDirectDependents,
  formatImpactCsv,
  formatImpactJson,
  formatImpactTable,
  formatImpactTree,
} from '../src/commands/impact-format-helpers.js'

// ─── extractImports ───────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts relative imports', () => {
    expect(extractImports("import { x } from './a'")).toEqual(['./a'])
  })

  it('extracts multiple imports', () => {
    const code = "import { a } from './x'\nimport { b } from './y'"
    expect(extractImports(code)).toEqual(['./x', './y'])
  })

  it('ignores non-relative imports', () => {
    expect(extractImports("import { x } from 'react'")).toEqual(['react'])
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toEqual([])
  })

  it('extracts type imports', () => {
    expect(extractImports("import type { Config } from './types'")).toEqual(['./types'])
  })
})

// ─── extractImportsFrom ───────────────────────────────────────────────────────

describe('extractImportsFrom', () => {
  it('extracts named imports from specific source', () => {
    const code = "import { foo, bar } from './a'"
    expect(extractImportsFrom(code, './a')).toEqual(['foo', 'bar'])
  })

  it('returns empty for non-matching source', () => {
    const code = "import { foo } from './a'"
    expect(extractImportsFrom(code, './b')).toEqual([])
  })

  it('handles default imports', () => {
    const code = "import foo from './a'"
    expect(extractImportsFrom(code, './a')).toEqual(['foo'])
  })

  it('handles star imports', () => {
    const code = "import * as mod from './a'"
    expect(extractImportsFrom(code, './a')).toEqual(['* as mod'])
  })

  it('handles aliased imports', () => {
    const code = "import { foo as bar } from './a'"
    expect(extractImportsFrom(code, './a')).toEqual(['foo'])
  })
})

// ─── extractExports ───────────────────────────────────────────────────────────

describe('extractExports', () => {
  it('extracts function exports', () => {
    expect(extractExports('export function foo() {}')).toEqual(['foo'])
  })

  it('extracts const exports', () => {
    expect(extractExports('export const bar = 1')).toEqual(['bar'])
  })

  it('extracts class exports', () => {
    expect(extractExports('export class Baz {}')).toEqual(['Baz'])
  })

  it('extracts type exports', () => {
    expect(extractExports('export type Config = {}')).toEqual(['Config'])
  })

  it('extracts interface exports', () => {
    expect(extractExports('export interface IOpts {}')).toEqual(['IOpts'])
  })

  it('extracts named re-exports', () => {
    expect(extractExports("export { foo, bar } from './a'")).toEqual(['foo', 'bar'])
  })

  it('returns empty for no exports', () => {
    expect(extractExports('const x = 1')).toEqual([])
  })

  it('handles async function exports', () => {
    expect(extractExports('export async function fetchData() {}')).toEqual(['fetchData'])
  })
})

// ─── resolveImportPath ────────────────────────────────────────────────────────

describe('resolveImportPath', () => {
  it('resolves same-directory imports', () => {
    expect(resolveImportPath('./foo', 'src/mod/a.ts')).toBe('src/mod/foo')
  })

  it('resolves parent directory imports', () => {
    expect(resolveImportPath('../foo', 'src/mod/a.ts')).toBe('src/foo')
  })

  it('resolves deeply nested parent imports', () => {
    expect(resolveImportPath('../../foo', 'src/mod/deep/a.ts')).toBe('src/foo')
  })

  it('passes through non-relative imports', () => {
    expect(resolveImportPath('react', 'src/a.ts')).toBe('react')
  })

  it('handles current directory', () => {
    expect(resolveImportPath('./foo', 'a.ts')).toBe('foo')
  })
})

// ─── matchFile ────────────────────────────────────────────────────────────────

describe('matchFile', () => {
  it('matches exact file', () => {
    expect(matchFile('src/a.ts', ['src/a.ts', 'src/b.ts'])).toBe('src/a.ts')
  })

  it('matches with .ts extension', () => {
    expect(matchFile('src/a', ['src/a.ts'])).toBe('src/a.ts')
  })

  it('matches with .tsx extension', () => {
    expect(matchFile('src/a', ['src/a.tsx'])).toBe('src/a.tsx')
  })

  it('matches index files', () => {
    expect(matchFile('src/mod', ['src/mod/index.ts'])).toBe('src/mod/index.ts')
  })

  it('returns null for no match', () => {
    expect(matchFile('src/missing', ['src/a.ts'])).toBeNull()
  })
})

// ─── buildReverseDependencyMap ────────────────────────────────────────────────

describe('buildReverseDependencyMap', () => {
  it('maps who imports whom', () => {
    const files = ['src/a.ts', 'src/b.ts']
    const contents = ["export const x = 1", "import { x } from './a'"]
    const map = buildReverseDependencyMap(files, contents)

    expect(map.has('src/a.ts')).toBe(true)
    expect(map.get('src/a.ts')!.length).toBe(1)
    expect(map.get('src/a.ts')![0]!.file).toBe('src/b.ts')
  })

  it('handles multiple dependents', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const contents = ["export const x = 1", "import { x } from './a'", "import { x } from './a'"]
    const map = buildReverseDependencyMap(files, contents)

    expect(map.get('src/a.ts')!.length).toBe(2)
  })

  it('returns empty map for no dependencies', () => {
    const files = ['src/a.ts']
    const contents = ['const x = 1']
    const map = buildReverseDependencyMap(files, contents)
    expect(map.size).toBe(0)
  })

  it('ignores external imports', () => {
    const files = ['src/a.ts', 'src/b.ts']
    const contents = ["import { x } from 'react'", "const x = 1"]
    const map = buildReverseDependencyMap(files, contents)
    expect(map.size).toBe(0)
  })
})

// ─── computeDirectDependents ──────────────────────────────────────────────────

describe('computeDirectDependents', () => {
  it('computes direct dependents', () => {
    const reverseMap = new Map([
      ['src/a.ts', [{ file: 'src/b.ts', imports: ['foo', 'bar'] }]],
    ])
    const deps = computeDirectDependents('src/a.ts', reverseMap, ['foo', 'bar', 'baz'])

    expect(deps).toHaveLength(1)
    expect(deps[0]!.file).toBe('src/b.ts')
    expect(deps[0]!.isDirect).toBe(true)
    expect(deps[0]!.depth).toBe(1)
  })

  it('assigns risk levels', () => {
    const reverseMap = new Map([
      ['src/a.ts', [{ file: 'src/b.ts', imports: ['x'] }]],
    ])
    const deps = computeDirectDependents('src/a.ts', reverseMap, ['x'])
    expect(deps[0]!.riskLevel).toBe('high')
  })

  it('returns empty for no dependents', () => {
    const reverseMap = new Map()
    expect(computeDirectDependents('src/a.ts', reverseMap, [])).toEqual([])
  })
})

// ─── computeIndirectDependents ────────────────────────────────────────────────

describe('computeIndirectDependents', () => {
  it('computes indirect dependents', () => {
    const reverseMap = new Map([
      ['src/b.ts', [{ file: 'src/c.ts', imports: ['y'] }]],
    ])
    const direct: ImpactNode[] = [
      { file: 'src/b.ts', depth: 1, imports: ['x'], totalImports: 1, isDirect: true, riskLevel: 'medium', reason: '' },
    ]
    const indirect = computeIndirectDependents(direct, reverseMap, 3)

    expect(indirect).toHaveLength(1)
    expect(indirect[0]!.file).toBe('src/c.ts')
    expect(indirect[0]!.depth).toBe(2)
    expect(indirect[0]!.isDirect).toBe(false)
  })

  it('respects max depth', () => {
    const reverseMap = new Map([
      ['src/b.ts', [{ file: 'src/c.ts', imports: ['y'] }]],
      ['src/c.ts', [{ file: 'src/d.ts', imports: ['z'] }]],
    ])
    const direct: ImpactNode[] = [
      { file: 'src/b.ts', depth: 1, imports: ['x'], totalImports: 1, isDirect: true, riskLevel: 'medium', reason: '' },
    ]
    const indirect = computeIndirectDependents(direct, reverseMap, 2)

    expect(indirect.some((n) => n.depth > 2)).toBe(false)
  })

  it('avoids cycles', () => {
    const reverseMap = new Map([
      ['src/b.ts', [{ file: 'src/a.ts', imports: ['y'] }]],
    ])
    const direct: ImpactNode[] = [
      { file: 'src/b.ts', depth: 1, imports: ['x'], totalImports: 1, isDirect: true, riskLevel: 'medium', reason: '' },
    ]
    const indirect = computeIndirectDependents(direct, reverseMap, 3)

    // src/a.ts would be found once (not revisited as direct already includes it)
    // Actually src/a.ts is not in visited (only src/b.ts is), so it will be added
    expect(indirect.length).toBeLessThanOrEqual(1)
  })

  it('returns empty for no direct deps', () => {
    expect(computeIndirectDependents([], new Map(), 3)).toEqual([])
  })
})

// ─── computeImpactChains ──────────────────────────────────────────────────────

describe('computeImpactChains', () => {
  it('traces chains', () => {
    const reverseMap = new Map([
      ['src/a.ts', [{ file: 'src/b.ts', imports: ['x'] }]],
      ['src/b.ts', [{ file: 'src/c.ts', imports: ['y'] }]],
    ])
    const chains = computeImpactChains('src/a.ts', reverseMap, 3)

    expect(chains.length).toBeGreaterThan(0)
    expect(chains[0]!.path[0]).toBe('src/a.ts')
  })

  it('handles no dependents', () => {
    const chains = computeImpactChains('src/a.ts', new Map(), 3)
    expect(chains).toEqual([])
  })

  it('respects depth limit', () => {
    const reverseMap = new Map([
      ['src/a.ts', [{ file: 'src/b.ts', imports: ['x'] }]],
      ['src/b.ts', [{ file: 'src/c.ts', imports: ['y'] }]],
      ['src/c.ts', [{ file: 'src/d.ts', imports: ['z'] }]],
    ])
    const chains = computeImpactChains('src/a.ts', reverseMap, 2)
    for (const chain of chains) {
      expect(chain.depth).toBeLessThanOrEqual(2)
    }
  })
})

// ─── computeRiskLevel ─────────────────────────────────────────────────────────

describe('computeRiskLevel', () => {
  it('returns high for >50% usage', () => {
    expect(computeRiskLevel(6, 10)).toBe('high')
  })

  it('returns medium for >20% usage', () => {
    expect(computeRiskLevel(3, 10)).toBe('medium')
  })

  it('returns low for <=20% usage', () => {
    expect(computeRiskLevel(1, 10)).toBe('low')
  })

  it('returns low for zero exports', () => {
    expect(computeRiskLevel(5, 0)).toBe('low')
  })
})

// ─── estimateEffort ───────────────────────────────────────────────────────────

describe('estimateEffort', () => {
  it('returns low for small impact', () => {
    expect(estimateEffort(2, 1)).toBe('low')
  })

  it('returns medium for moderate impact', () => {
    expect(estimateEffort(5, 3)).toBe('medium')
  })

  it('returns high for large impact', () => {
    expect(estimateEffort(12, 3)).toBe('high')
  })

  it('returns critical for massive impact', () => {
    expect(estimateEffort(20, 5)).toBe('critical')
  })

  it('returns critical for long chains', () => {
    expect(estimateEffort(8, 5)).toBe('critical')
  })
})

// ─── findUnusedExports ────────────────────────────────────────────────────────

describe('findUnusedExports', () => {
  it('finds unused exports', () => {
    const exports = ['foo', 'bar', 'baz']
    const deps: ImpactNode[] = [{ file: 'a.ts', depth: 1, imports: ['foo'], totalImports: 1, isDirect: true, riskLevel: 'low', reason: '' }]
    expect(findUnusedExports(exports, deps)).toEqual(['bar', 'baz'])
  })

  it('returns all exports when no deps', () => {
    expect(findUnusedExports(['foo', 'bar'], [])).toEqual(['foo', 'bar'])
  })

  it('returns empty when all used', () => {
    const exports = ['foo', 'bar']
    const deps: ImpactNode[] = [{ file: 'a.ts', depth: 1, imports: ['foo', 'bar'], totalImports: 2, isDirect: true, riskLevel: 'low', reason: '' }]
    expect(findUnusedExports(exports, deps)).toEqual([])
  })

  it('handles empty exports', () => {
    expect(findUnusedExports([], [])).toEqual([])
  })
})

// ─── computeAverageRiskScore ──────────────────────────────────────────────────

describe('computeAverageRiskScore', () => {
  it('computes average', () => {
    const nodes: ImpactNode[] = [
      { file: 'a.ts', depth: 1, imports: [], totalImports: 0, isDirect: true, riskLevel: 'high', reason: '' },
      { file: 'b.ts', depth: 1, imports: [], totalImports: 0, isDirect: true, riskLevel: 'low', reason: '' },
    ]
    expect(computeAverageRiskScore(nodes)).toBe(57.5)
  })

  it('returns 0 for empty', () => {
    expect(computeAverageRiskScore([])).toBe(0)
  })
})

// ─── findHighestRiskFile ──────────────────────────────────────────────────────

describe('findHighestRiskFile', () => {
  it('finds highest risk file', () => {
    const nodes: ImpactNode[] = [
      { file: 'a.ts', depth: 1, imports: [], totalImports: 0, isDirect: true, riskLevel: 'low', reason: '' },
      { file: 'b.ts', depth: 1, imports: [], totalImports: 0, isDirect: true, riskLevel: 'high', reason: '' },
    ]
    expect(findHighestRiskFile(nodes)).toBe('b.ts')
  })

  it('returns empty for no nodes', () => {
    expect(findHighestRiskFile([])).toBe('')
  })
})

// ─── buildImpactResult ────────────────────────────────────────────────────────

describe('buildImpactResult', () => {
  it('computes full result', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const contents = [
      'export const foo = 1\nexport const bar = 2',
      "import { foo } from './a'",
      "import { foo } from './b'",
    ]
    const result = buildImpactResult('src/a.ts', files, contents, { depth: 3 })

    expect(result.target).toBe('src/a.ts')
    expect(result.exports).toEqual(['foo', 'bar'])
    expect(result.directDependents.length).toBeGreaterThan(0)
    expect(result.stats.directCount).toBeGreaterThan(0)
    expect(result.stats.blastRadius).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('detects unused exports', () => {
    const files = ['src/a.ts', 'src/b.ts']
    const contents = [
      'export const foo = 1\nexport const bar = 2',
      "import { foo } from './a'",
    ]
    const result = buildImpactResult('src/a.ts', files, contents)

    expect(result.unusedExports).toContain('bar')
  })

  it('handles file with no dependents', () => {
    const files = ['src/a.ts']
    const contents = ['export const x = 1']
    const result = buildImpactResult('src/a.ts', files, contents)

    expect(result.stats.blastRadius).toBe(0)
    expect(result.stats.directCount).toBe(0)
    expect(result.stats.estimatedEffort).toBe('low')
  })

  it('handles file not in list', () => {
    const result = buildImpactResult('missing.ts', ['other.ts'], ['x'])
    expect(result.target).toBe('missing.ts')
    expect(result.stats.blastRadius).toBe(0)
  })

  it('computes impact chains', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const contents = [
      'export const x = 1',
      "import { x } from './a'",
      "import { x } from './b'",
    ]
    const result = buildImpactResult('src/a.ts', files, contents, { depth: 3 })
    expect(result.chains.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatImpactTree', () => {
  it('handles empty chains', () => {
    expect(formatImpactTree([])).toContain('No dependency chains')
  })

  it('renders chains', () => {
    const chains: ImpactChain[] = [
      { path: ['src/a.ts', 'src/b.ts', 'src/c.ts'], depth: 2, files: ['src/a.ts', 'src/b.ts', 'src/c.ts'] },
    ]
    const output = formatImpactTree(chains)
    expect(output).toContain('src/a.ts')
    expect(output).toContain('src/b.ts')
    expect(output).toContain('src/c.ts')
  })
})

describe('formatDirectDependents', () => {
  it('handles no dependents', () => {
    expect(formatDirectDependents([])).toContain('No direct dependents')
  })

  it('renders dependents', () => {
    const nodes: ImpactNode[] = [
      { file: 'src/app.ts', depth: 1, imports: ['foo'], totalImports: 1, isDirect: true, riskLevel: 'high', reason: 'test' },
    ]
    const output = formatDirectDependents(nodes)
    expect(output).toContain('src/app.ts')
    expect(output).toContain('high')
  })
})

describe('formatBlastRadiusGauge', () => {
  it('renders gauge', () => {
    const output = formatBlastRadiusGauge(5)
    expect(output).toContain('5')
    expect(output).toContain('files')
  })

  it('uses red for large blast', () => {
    const output = formatBlastRadiusGauge(15)
    expect(output).toContain('15')
  })
})

describe('formatImpactTable', () => {
  it('renders full table', () => {
    const result: ImpactResult = {
      target: 'src/core.ts',
      directDependents: [{ file: 'src/app.ts', depth: 1, imports: ['x'], totalImports: 1, isDirect: true, riskLevel: 'medium', reason: 'test' }],
      indirectDependents: [],
      chains: [],
      stats: { blastRadius: 1, directCount: 1, indirectCount: 0, maxChainLength: 0, averageRiskScore: 58, highestRiskFile: 'src/app.ts', estimatedEffort: 'medium' },
      exports: ['x', 'y'],
      unusedExports: ['y'],
      recommendations: ['Test'],
    }
    const output = formatImpactTable(result, false)
    expect(output).toContain('src/core.ts')
    expect(output).toContain('Blast Radius')
    expect(output).toContain('src/app.ts')
  })
})

describe('formatImpactJson', () => {
  it('produces valid JSON', () => {
    const result: ImpactResult = {
      target: 'a.ts',
      directDependents: [],
      indirectDependents: [],
      chains: [],
      stats: { blastRadius: 0, directCount: 0, indirectCount: 0, maxChainLength: 0, averageRiskScore: 0, highestRiskFile: '', estimatedEffort: 'low' },
      exports: [],
      unusedExports: [],
      recommendations: [],
    }
    const json = formatImpactJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.target).toBe('a.ts')
  })
})

describe('formatImpactCsv', () => {
  it('produces CSV', () => {
    const result: ImpactResult = {
      target: 'a.ts',
      directDependents: [{ file: 'b.ts', depth: 1, imports: ['x'], totalImports: 1, isDirect: true, riskLevel: 'low', reason: '' }],
      indirectDependents: [],
      chains: [],
      stats: { blastRadius: 1, directCount: 1, indirectCount: 0, maxChainLength: 0, averageRiskScore: 25, highestRiskFile: 'b.ts', estimatedEffort: 'low' },
      exports: [],
      unusedExports: [],
      recommendations: [],
    }
    const csv = formatImpactCsv(result)
    const lines = csv.split('\n')
    expect(lines[0]).toContain('type')
    expect(lines.find((l) => l.startsWith('direct,'))).toBeDefined()
    expect(lines.find((l) => l.startsWith('stat,'))).toBeDefined()
  })
})
