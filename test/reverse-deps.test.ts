import { describe, expect, it } from 'vitest'

import {
  buildReverseDependencyMap,
  buildReverseDepsResult,
  computeRiskLevel,
  extractExports,
  extractImports,
  findCriticalPaths,
  findDirectDependents,
  findTransitiveDependents,
  sourceBaseName,
} from '../src/commands/reverse-deps-helpers.js'

import {
  formatAffectedTable,
  formatCriticalPaths,
  formatNodeTree,
  formatReverseDepsJson,
  formatReverseDepsStats,
  formatReverseDepsTable,
  riskIcon,
  riskLabel,
} from '../src/commands/reverse-deps-format-helpers.js'

import type { DependencyNode, ImpactAnalysis, ReverseDepsStats } from '../src/commands/reverse-deps-helpers.js'

// ─── Helpers ────────────────────────────────────────────

function makeNode(overrides: Partial<DependencyNode> = {}): DependencyNode {
  return {
    depth: 0,
    directDeps: [],
    directDependents: [],
    filePath: 'src/core.ts',
    transitiveDependents: 0,
    ...overrides,
  }
}

function makeAnalysis(overrides: Partial<ImpactAnalysis> = {}): ImpactAnalysis {
  return {
    criticalPaths: [['src/core.ts']],
    directImpact: [],
    indirectImpact: [],
    maxDepth: 0,
    riskLevel: 'low',
    targetFile: 'src/core.ts',
    totalAffected: 0,
    ...overrides,
  }
}

function makeStats(overrides: Partial<ReverseDepsStats> = {}): ReverseDepsStats {
  return {
    avgChainLength: 0,
    directDependents: 0,
    indirectDependents: 0,
    maxChainLength: 0,
    totalFiles: 10,
    ...overrides,
  }
}

const fileContents = new Map<string, string>([
  ['src/core.ts', 'export function core() {}'],
  ['src/utils.ts', "import { core } from './core.js'\nexport function util() { core() }"],
  ['src/app.ts', "import { util } from './utils.js'\nimport { core } from './core.js'"],
  ['src/main.ts', "import { app } from './app.js'"],
  ['src/test.ts', "import { core } from './core.js'\nimport { util } from './utils.js'"],
])

const allFiles = ['src/core.ts', 'src/utils.ts', 'src/app.ts', 'src/main.ts', 'src/test.ts']

// ─── extractImports ─────────────────────────────────────

describe('extractImports', () => {
  it('extracts static imports', () => {
    const imports = extractImports("import { foo } from './bar.js'", '/src/test.ts')
    expect(imports.length).toBe(1)
    expect(imports[0].source).toBe('./bar.js')
  })

  it('extracts dynamic imports', () => {
    const imports = extractImports("const m = import('./mod.js')", '/src/test.ts')
    expect(imports.length).toBe(1)
    expect(imports[0].source).toBe('./mod.js')
  })

  it('extracts require calls', () => {
    const imports = extractImports("const foo = require('./foo.js')", '/src/test.ts')
    expect(imports.length).toBe(1)
    expect(imports[0].source).toBe('./foo.js')
  })

  it('extracts type imports', () => {
    const imports = extractImports("import type { Foo } from './types.js'", '/src/test.ts')
    expect(imports.length).toBe(1)
    expect(imports[0].source).toBe('./types.js')
  })

  it('resolves relative paths', () => {
    const imports = extractImports("import { x } from './sub/mod.js'", '/src/test.ts')
    expect(imports[0].resolvedPath).toContain('sub')
  })

  it('keeps bare specifiers as-is', () => {
    const imports = extractImports("import chalk from 'chalk'", '/src/test.ts')
    expect(imports[0].resolvedPath).toBe('chalk')
  })

  it('deduplicates sources', () => {
    const content = "import { a } from './x.js'\nimport { b } from './x.js'"
    const imports = extractImports(content, '/src/test.ts')
    expect(imports.length).toBe(1)
  })

  it('returns empty for no imports', () => {
    const imports = extractImports('const x = 1', '/src/test.ts')
    expect(imports).toEqual([])
  })

  it('handles multiple imports', () => {
    const content = "import { a } from './a.js'\nimport { b } from './b.js'"
    const imports = extractImports(content, '/src/test.ts')
    expect(imports.length).toBe(2)
  })
})

// ─── extractExports ─────────────────────────────────────

describe('extractExports', () => {
  it('returns empty array', () => {
    const exports = extractExports('export const x = 1', '/src/test.ts')
    expect(Array.isArray(exports)).toBe(true)
  })
})

// ─── buildReverseDependencyMap ──────────────────────────

describe('buildReverseDependencyMap', () => {
  it('builds map from files and contents', () => {
    const map = buildReverseDependencyMap(allFiles, fileContents)
    expect(map.size).toBeGreaterThan(0)
  })

  it('finds core.ts dependents', () => {
    const map = buildReverseDependencyMap(allFiles, fileContents)
    const deps = map.get('src/core.ts') ?? []
    expect(deps).toContain('src/utils.ts')
    expect(deps).toContain('src/app.ts')
    expect(deps).toContain('src/test.ts')
  })

  it('finds utils.ts dependents', () => {
    const map = buildReverseDependencyMap(allFiles, fileContents)
    const deps = map.get('src/utils.ts') ?? []
    expect(deps).toContain('src/app.ts')
    expect(deps).toContain('src/test.ts')
  })

  it('returns empty for unknown files', () => {
    const map = buildReverseDependencyMap(allFiles, fileContents)
    expect(map.get('src/nonexistent.ts')).toBeUndefined()
  })

  it('handles empty files list', () => {
    const map = buildReverseDependencyMap([], new Map())
    expect(map.size).toBe(0)
  })

  it('does not duplicate dependents', () => {
    const content = "import { a } from './x.js'\nimport { b } from './x.js'"
    const files = ['src/x.ts', 'src/consumer.ts']
    const contents = new Map([['src/x.ts', ''], ['src/consumer.ts', content]])
    const map = buildReverseDependencyMap(files, contents)
    const deps = map.get('src/x.ts') ?? []
    expect(deps.length).toBe(1)
  })
})

// ─── findDirectDependents ───────────────────────────────

describe('findDirectDependents', () => {
  it('returns direct dependents', () => {
    const map = buildReverseDependencyMap(allFiles, fileContents)
    const deps = findDirectDependents('src/core.ts', map)
    expect(deps.length).toBeGreaterThanOrEqual(2)
  })

  it('returns empty for unknown file', () => {
    const map = buildReverseDependencyMap(allFiles, fileContents)
    expect(findDirectDependents('nonexistent.ts', map)).toEqual([])
  })

  it('returns empty for empty map', () => {
    expect(findDirectDependents('src/core.ts', new Map())).toEqual([])
  })
})

// ─── findTransitiveDependents ───────────────────────────

describe('findTransitiveDependents', () => {
  it('finds all transitive dependents', () => {
    const map = buildReverseDependencyMap(allFiles, fileContents)
    const deps = findTransitiveDependents('src/core.ts', map, 5)
    expect(deps.length).toBeGreaterThanOrEqual(3)
    expect(deps).toContain('src/utils.ts')
    expect(deps).toContain('src/app.ts')
  })

  it('respects max depth', () => {
    const map = buildReverseDependencyMap(allFiles, fileContents)
    const deps0 = findTransitiveDependents('src/core.ts', map, 0)
    const deps1 = findTransitiveDependents('src/core.ts', map, 1)
    expect(deps1.length).toBeGreaterThanOrEqual(deps0.length)
  })

  it('returns empty for leaf file', () => {
    const map = buildReverseDependencyMap(allFiles, fileContents)
    const deps = findTransitiveDependents('src/main.ts', map, 5)
    expect(deps).toEqual([])
  })

  it('handles cycles without infinite loop', () => {
    const cyclicFiles = ['src/a.ts', 'src/b.ts']
    const cyclicContents = new Map([
      ['src/a.ts', "import { b } from './b.js'"],
      ['src/b.ts', "import { a } from './a.js'"],
    ])
    const map = buildReverseDependencyMap(cyclicFiles, cyclicContents)
    const deps = findTransitiveDependents('src/a.ts', map, 10)
    expect(Array.isArray(deps)).toBe(true)
  })

  it('returns empty for unknown file', () => {
    const deps = findTransitiveDependents('nonexistent.ts', new Map(), 5)
    expect(deps).toEqual([])
  })
})

// ─── findCriticalPaths ──────────────────────────────────

describe('findCriticalPaths', () => {
  it('returns at least one path', () => {
    const map = buildReverseDependencyMap(allFiles, fileContents)
    const paths = findCriticalPaths('src/core.ts', map, 5)
    expect(paths.length).toBeGreaterThanOrEqual(1)
  })

  it('starts with target file', () => {
    const map = buildReverseDependencyMap(allFiles, fileContents)
    const paths = findCriticalPaths('src/core.ts', map, 5)
    expect(paths[0][0]).toContain('core.ts')
  })

  it('limits to 10 paths', () => {
    const map = buildReverseDependencyMap(allFiles, fileContents)
    const paths = findCriticalPaths('src/core.ts', map, 5)
    expect(paths.length).toBeLessThanOrEqual(10)
  })

  it('handles leaf file', () => {
    const map = buildReverseDependencyMap(allFiles, fileContents)
    const paths = findCriticalPaths('src/main.ts', map, 5)
    expect(paths[0]).toEqual(['src/main.ts'])
  })

  it('sorts paths by length descending', () => {
    const map = buildReverseDependencyMap(allFiles, fileContents)
    const paths = findCriticalPaths('src/core.ts', map, 5)
    for (let i = 1; i < paths.length; i++) {
      expect(paths[i - 1].length).toBeGreaterThanOrEqual(paths[i].length)
    }
  })

  it('respects maxDepth', () => {
    const map = buildReverseDependencyMap(allFiles, fileContents)
    const paths0 = findCriticalPaths('src/core.ts', map, 0)
    expect(paths0[0].length).toBeLessThanOrEqual(1)
  })
})

// ─── computeRiskLevel ───────────────────────────────────

describe('computeRiskLevel', () => {
  it('returns low for <5', () => {
    expect(computeRiskLevel(0)).toBe('low')
    expect(computeRiskLevel(4)).toBe('low')
  })

  it('returns medium for 5-15', () => {
    expect(computeRiskLevel(5)).toBe('medium')
    expect(computeRiskLevel(15)).toBe('medium')
  })

  it('returns high for >15', () => {
    expect(computeRiskLevel(16)).toBe('high')
    expect(computeRiskLevel(100)).toBe('high')
  })
})

// ─── sourceBaseName ─────────────────────────────────────

describe('sourceBaseName', () => {
  it('strips .ts extension', () => {
    expect(sourceBaseName('src/reverse-deps-helpers.ts')).toBe('reverse-deps-helpers')
  })

  it('handles plain name', () => {
    expect(sourceBaseName('foo.ts')).toBe('foo')
  })
})

// ─── buildReverseDepsResult ─────────────────────────────

describe('buildReverseDepsResult', () => {
  it('returns analysis with target file', async () => {
    const reader = async (f: string) => fileContents.get(f) ?? ''
    const result = await buildReverseDepsResult('src/core.ts', allFiles, reader, { depth: 5 })
    expect(result.analysis.targetFile).toContain('core.ts')
  })

  it('computes risk level', async () => {
    const reader = async (f: string) => fileContents.get(f) ?? ''
    const result = await buildReverseDepsResult('src/core.ts', allFiles, reader, { depth: 5 })
    expect(['low', 'medium', 'high']).toContain(result.analysis.riskLevel)
  })

  it('populates stats', async () => {
    const reader = async (f: string) => fileContents.get(f) ?? ''
    const result = await buildReverseDepsResult('src/core.ts', allFiles, reader, { depth: 5 })
    expect(result.stats.totalFiles).toBe(5)
    expect(result.stats.directDependents).toBeGreaterThanOrEqual(0)
  })

  it('builds nodes', async () => {
    const reader = async (f: string) => fileContents.get(f) ?? ''
    const result = await buildReverseDepsResult('src/core.ts', allFiles, reader, { depth: 5 })
    expect(result.nodes.length).toBeGreaterThanOrEqual(1)
  })

  it('handles unknown file gracefully', async () => {
    const reader = async () => ''
    const result = await buildReverseDepsResult('src/unknown.ts', ['src/unknown.ts'], reader)
    expect(result.analysis.totalAffected).toBe(0)
    expect(result.analysis.riskLevel).toBe('low')
  })
})

// ─── riskLabel ──────────────────────────────────────────

describe('riskLabel', () => {
  it('returns HIGH for high', () => {
    expect(riskLabel('high')).toContain('HIGH')
  })

  it('returns MEDIUM for medium', () => {
    expect(riskLabel('medium')).toContain('MEDIUM')
  })

  it('returns LOW for low', () => {
    expect(riskLabel('low')).toContain('LOW')
  })
})

// ─── riskIcon ───────────────────────────────────────────

describe('riskIcon', () => {
  it('returns dot for high', () => {
    expect(riskIcon('high')).toContain('●')
  })

  it('returns dot for medium', () => {
    expect(riskIcon('medium')).toContain('●')
  })

  it('returns dot for low', () => {
    expect(riskIcon('low')).toContain('●')
  })
})

// ─── formatNodeTree ─────────────────────────────────────

describe('formatNodeTree', () => {
  it('shows no-dependencies message for empty', () => {
    const result = formatNodeTree([])
    expect(result).toContain('No dependencies')
  })

  it('renders node file path', () => {
    const nodes = [makeNode({ filePath: 'src/core.ts', depth: 0 })]
    const result = formatNodeTree(nodes)
    expect(result).toContain('core.ts')
  })

  it('shows dependents count', () => {
    const nodes = [makeNode({ filePath: 'src/core.ts', depth: 0, directDependents: ['a.ts', 'b.ts'] })]
    const result = formatNodeTree(nodes)
    expect(result).toContain('2 dependents')
  })

  it('indents nested nodes', () => {
    const nodes = [
      makeNode({ filePath: 'src/core.ts', depth: 0 }),
      makeNode({ filePath: 'src/utils.ts', depth: 1 }),
    ]
    const result = formatNodeTree(nodes)
    expect(result).toContain('core.ts')
    expect(result).toContain('utils.ts')
  })
})

// ─── formatAffectedTable ────────────────────────────────

describe('formatAffectedTable', () => {
  it('shows no dependents message', () => {
    const result = formatAffectedTable(makeAnalysis())
    expect(result).toContain('No dependents')
  })

  it('renders direct impact', () => {
    const result = formatAffectedTable(makeAnalysis({ directImpact: ['src/a.ts'] }))
    expect(result).toContain('Direct Impact')
    expect(result).toContain('src/a.ts')
  })

  it('renders indirect impact', () => {
    const result = formatAffectedTable(makeAnalysis({ indirectImpact: ['src/b.ts'] }))
    expect(result).toContain('Indirect Impact')
    expect(result).toContain('src/b.ts')
  })
})

// ─── formatCriticalPaths ────────────────────────────────

describe('formatCriticalPaths', () => {
  it('returns empty for no paths', () => {
    const result = formatCriticalPaths([])
    expect(result).toBe('')
  })

  it('renders path', () => {
    const result = formatCriticalPaths([['src/core.ts', 'src/utils.ts']])
    expect(result).toContain('Critical Paths')
    expect(result).toContain('core.ts')
    expect(result).toContain('utils.ts')
  })

  it('numbers paths', () => {
    const result = formatCriticalPaths([
      ['src/a.ts', 'src/b.ts'],
      ['src/a.ts', 'src/c.ts'],
    ])
    expect(result).toContain('1.')
    expect(result).toContain('2.')
  })
})

// ─── formatReverseDepsStats ─────────────────────────────

describe('formatReverseDepsStats', () => {
  it('renders total files', () => {
    const result = formatReverseDepsStats(makeStats({ totalFiles: 42 }))
    expect(result).toContain('42')
  })

  it('renders direct dependents', () => {
    const result = formatReverseDepsStats(makeStats({ directDependents: 7 }))
    expect(result).toContain('7')
  })

  it('renders max chain length', () => {
    const result = formatReverseDepsStats(makeStats({ maxChainLength: 4 }))
    expect(result).toContain('4')
  })

  it('renders all fields', () => {
    const result = formatReverseDepsStats(makeStats())
    expect(result).toContain('Total Files')
    expect(result).toContain('Direct Dependents')
    expect(result).toContain('Indirect Dependents')
    expect(result).toContain('Max Chain Length')
    expect(result).toContain('Avg Chain Length')
  })
})

// ─── formatReverseDepsTable ─────────────────────────────

describe('formatReverseDepsTable', () => {
  it('renders header', () => {
    const result = formatReverseDepsTable(makeAnalysis(), [makeNode()], makeStats())
    expect(result).toContain('Reverse Dependency Analysis')
  })

  it('renders target file', () => {
    const result = formatReverseDepsTable(makeAnalysis({ targetFile: 'src/core.ts' }), [makeNode()], makeStats())
    expect(result).toContain('src/core.ts')
  })

  it('renders risk level', () => {
    const result = formatReverseDepsTable(makeAnalysis({ riskLevel: 'high' }), [makeNode()], makeStats())
    expect(result).toContain('HIGH')
  })

  it('renders affected count', () => {
    const result = formatReverseDepsTable(makeAnalysis({ totalAffected: 5 }), [makeNode()], makeStats())
    expect(result).toContain('5')
  })
})

// ─── formatReverseDepsJson ──────────────────────────────

describe('formatReverseDepsJson', () => {
  it('produces valid JSON', () => {
    const json = formatReverseDepsJson(makeAnalysis(), [makeNode()], makeStats())
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('includes analysis', () => {
    const parsed = JSON.parse(formatReverseDepsJson(makeAnalysis({ targetFile: 'src/x.ts' }), [makeNode()], makeStats()))
    expect(parsed.analysis.targetFile).toBe('src/x.ts')
  })

  it('includes nodes', () => {
    const parsed = JSON.parse(formatReverseDepsJson(makeAnalysis(), [makeNode()], makeStats()))
    expect(parsed.nodes.length).toBe(1)
  })

  it('includes stats', () => {
    const parsed = JSON.parse(formatReverseDepsJson(makeAnalysis(), [makeNode()], makeStats({ totalFiles: 99 })))
    expect(parsed.stats.totalFiles).toBe(99)
  })
})
