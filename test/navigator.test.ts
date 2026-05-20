import { describe, expect, it } from 'vitest'

import {
  buildAdjacencyList,
  buildNavigationMap,
  buildNavigatorResult,
  buildReverseAdjacency,
  classifyNode,
  computeAllWayfindingScores,
  computeDepths,
  computeNavigationComplexity,
  computeNavigatorStats,
  computePathDifficulty,
  computeWayfindingScore,
  extractImports,
  findShortestPath,
  isEntryPointFile,
  normalizeImportPath,
  resolveImportPath,
  type NavigationNode,
} from '../src/commands/navigator-helpers.js'

import {
  formatComplexityMeter,
  formatConnectivityChart,
  formatDepthChart,
  formatNavigatorJSON,
  formatNavigatorStats,
  formatNavigatorTable,
  formatNodeTypeBadge,
  formatRecommendations,
  formatWayfindingMeter,
  formatWayfindingScores,
  getNodeTypeColor,
} from '../src/commands/navigator-format-helpers.js'

// ─── extractImports ───────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts ESM imports', () => {
    const content = "import { foo } from './utils'\nimport { bar } from '../helpers'"
    const imports = extractImports(content)
    expect(imports).toContain('./utils')
    expect(imports).toContain('../helpers')
    expect(imports).toHaveLength(2)
  })

  it('extracts re-exports', () => {
    const content = "export { foo } from './module'"
    const imports = extractImports(content)
    expect(imports).toContain('./module')
  })

  it('extracts CommonJS requires', () => {
    const content = "const utils = require('./utils')"
    const imports = extractImports(content)
    expect(imports).toContain('./utils')
  })

  it('ignores external imports', () => {
    const content = "import chalk from 'chalk'\nimport { foo } from './local'"
    const imports = extractImports(content)
    expect(imports).toHaveLength(1)
    expect(imports).toContain('./local')
  })

  it('strips file extensions', () => {
    const content = "import { foo } from './utils.ts'"
    const imports = extractImports(content)
    expect(imports).toContain('./utils')
  })

  it('deduplicates imports', () => {
    const content = "import { a } from './utils'\nimport { b } from './utils'"
    const imports = extractImports(content)
    expect(imports).toHaveLength(1)
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toHaveLength(0)
  })
})

// ─── normalizeImportPath ──────────────────────────────────────────────────────

describe('normalizeImportPath', () => {
  it('strips .ts extension', () => {
    expect(normalizeImportPath('./utils.ts')).toBe('./utils')
  })

  it('strips .js extension', () => {
    expect(normalizeImportPath('./helpers.js')).toBe('./helpers')
  })

  it('leaves extensionless paths unchanged', () => {
    expect(normalizeImportPath('./utils')).toBe('./utils')
  })
})

// ─── resolveImportPath ────────────────────────────────────────────────────────

describe('resolveImportPath', () => {
  it('resolves relative import', () => {
    expect(resolveImportPath('src/commands/count.ts', './count-helpers')).toBe('src/commands/count-helpers')
  })

  it('resolves parent import', () => {
    expect(resolveImportPath('src/commands/count.ts', '../core/discovery')).toBe('src/core/discovery')
  })

  it('resolves deep parent import', () => {
    expect(resolveImportPath('src/a/b/c.ts', '../../utils')).toBe('src/utils')
  })

  it('handles root file', () => {
    expect(resolveImportPath('index.ts', './utils')).toBe('utils')
  })
})

// ─── buildAdjacencyList ───────────────────────────────────────────────────────

describe('buildAdjacencyList', () => {
  it('builds adjacency from files', () => {
    const files = ['src/index.ts', 'src/utils.ts', 'src/helpers.ts']
    const contents = [
      "import { foo } from './utils'\nimport { bar } from './helpers'",
      "import { baz } from './helpers'",
      '',
    ]
    const adj = buildAdjacencyList(files, contents)
    expect(adj.get('src/index.ts')).toEqual(['src/utils.ts', 'src/helpers.ts'])
    expect(adj.get('src/utils.ts')).toEqual(['src/helpers.ts'])
    expect(adj.get('src/helpers.ts')).toEqual([])
  })

  it('handles empty files', () => {
    const adj = buildAdjacencyList(['a.ts', 'b.ts'], ['', ''])
    expect(adj.get('a.ts')).toEqual([])
    expect(adj.get('b.ts')).toEqual([])
  })

  it('ignores unresolved imports', () => {
    const adj = buildAdjacencyList(['a.ts'], ["import { foo } from './nonexistent'"])
    expect(adj.get('a.ts')).toEqual([])
  })
})

// ─── buildReverseAdjacency ────────────────────────────────────────────────────

describe('buildReverseAdjacency', () => {
  it('builds reverse adjacency', () => {
    const adj = new Map([
      ['a.ts', ['b.ts', 'c.ts']],
      ['b.ts', ['c.ts']],
      ['c.ts', []],
    ])
    const rev = buildReverseAdjacency(adj)
    expect(rev.get('b.ts')).toEqual(['a.ts'])
    expect(rev.get('c.ts')).toEqual(['a.ts', 'b.ts'])
  })
})

// ─── isEntryPointFile ─────────────────────────────────────────────────────────

describe('isEntryPointFile', () => {
  it('identifies index files', () => {
    expect(isEntryPointFile('src/index.ts')).toBe(true)
    expect(isEntryPointFile('index.ts')).toBe(true)
  })

  it('identifies main files', () => {
    expect(isEntryPointFile('src/main.ts')).toBe(true)
  })

  it('identifies cli files', () => {
    expect(isEntryPointFile('src/cli.ts')).toBe(true)
  })

  it('rejects regular files', () => {
    expect(isEntryPointFile('src/utils.ts')).toBe(false)
    expect(isEntryPointFile('src/commands/count.ts')).toBe(false)
  })
})

// ─── classifyNode ─────────────────────────────────────────────────────────────

describe('classifyNode', () => {
  it('classifies entry points', () => {
    const result = classifyNode('src/index.ts', 5, 0)
    expect(result.isEntryPoint).toBe(true)
  })

  it('classifies entry points by connectivity', () => {
    const result = classifyNode('src/app.ts', 3, 0)
    expect(result.isEntryPoint).toBe(true)
  })

  it('classifies dead ends', () => {
    const result = classifyNode('src/leaf.ts', 0, 3)
    expect(result.isDeadEnd).toBe(true)
  })

  it('classifies highways', () => {
    const result = classifyNode('src/shared.ts', 5, 5)
    expect(result.isHighway).toBe(true)
  })

  it('classifies islands', () => {
    const result = classifyNode('src/orphan.ts', 0, 0)
    expect(result.isIsland).toBe(true)
  })

  it('does not classify utility with imports as dead end', () => {
    const result = classifyNode('src/utils.ts', 2, 3)
    expect(result.isDeadEnd).toBe(false)
    expect(result.isIsland).toBe(false)
  })
})

// ─── computeDepths ────────────────────────────────────────────────────────────

describe('computeDepths', () => {
  it('computes depths from entry points', () => {
    const adj = new Map([
      ['index.ts', ['a.ts', 'b.ts']],
      ['a.ts', ['c.ts']],
      ['b.ts', ['c.ts']],
      ['c.ts', []],
    ])
    const depths = computeDepths(adj, ['index.ts', 'a.ts', 'b.ts', 'c.ts'], ['index.ts'])
    expect(depths.get('index.ts')).toBe(0)
    expect(depths.get('a.ts')).toBe(1)
    expect(depths.get('b.ts')).toBe(1)
    expect(depths.get('c.ts')).toBe(2)
  })

  it('handles disconnected files', () => {
    const adj = new Map([
      ['a.ts', []],
      ['b.ts', []],
    ])
    const depths = computeDepths(adj, ['a.ts', 'b.ts'], ['a.ts'])
    expect(depths.get('a.ts')).toBe(0)
    expect(depths.get('b.ts')).toBe(1)
  })

  it('uses all files as starts when no entry points', () => {
    const adj = new Map([
      ['a.ts', ['b.ts']],
      ['b.ts', []],
    ])
    const depths = computeDepths(adj, ['a.ts', 'b.ts'], [])
    expect(depths.get('a.ts')).toBe(0)
    expect(depths.get('b.ts')).toBe(0)
  })
})

// ─── findShortestPath ─────────────────────────────────────────────────────────

describe('findShortestPath', () => {
  it('finds direct connection', () => {
    const adj = new Map([['a.ts', ['b.ts']]])
    const path = findShortestPath('a.ts', 'b.ts', adj)
    expect(path).not.toBeNull()
    expect(path!.hops).toBe(1)
    expect(path!.files).toEqual([])
  })

  it('finds multi-hop path', () => {
    const adj = new Map([
      ['a.ts', ['b.ts']],
      ['b.ts', ['c.ts']],
    ])
    const path = findShortestPath('a.ts', 'c.ts', adj)
    expect(path).not.toBeNull()
    expect(path!.hops).toBe(2)
    expect(path!.files).toEqual(['b.ts'])
  })

  it('returns null for unreachable', () => {
    const adj = new Map([
      ['a.ts', []],
      ['b.ts', []],
    ])
    expect(findShortestPath('a.ts', 'b.ts', adj)).toBeNull()
  })

  it('handles same file', () => {
    const adj = new Map([['a.ts', ['b.ts']]])
    const path = findShortestPath('a.ts', 'a.ts', adj)
    expect(path).not.toBeNull()
    expect(path!.hops).toBe(0)
  })
})

// ─── computePathDifficulty ────────────────────────────────────────────────────

describe('computePathDifficulty', () => {
  it('low difficulty for 0-1 hops', () => {
    expect(computePathDifficulty(0)).toBe(5)
    expect(computePathDifficulty(1)).toBe(5)
  })

  it('medium difficulty for 3 hops', () => {
    expect(computePathDifficulty(3)).toBe(30)
  })

  it('high difficulty for 8+ hops', () => {
    expect(computePathDifficulty(10)).toBeGreaterThanOrEqual(70)
  })

  it('caps at 100', () => {
    expect(computePathDifficulty(100)).toBeLessThanOrEqual(100)
  })
})

// ─── computeWayfindingScore ───────────────────────────────────────────────────

describe('computeWayfindingScore', () => {
  it('scores well-connected nodes higher', () => {
    const goodNode: NavigationNode = { file: 'a.ts', imports: 5, importedBy: 5, depth: 0, isEntryPoint: true, isDeadEnd: false, isHighway: true, isIsland: false }
    const badNode: NavigationNode = { file: 'b.ts', imports: 0, importedBy: 0, depth: 5, isEntryPoint: false, isDeadEnd: false, isHighway: false, isIsland: true }
    const map = { nodes: [], paths: [], entryPoints: [], deadEnds: [], highways: [], islands: [] }
    const goodScore = computeWayfindingScore('a.ts', goodNode, map)
    const badScore = computeWayfindingScore('b.ts', badNode, map)
    expect(goodScore.score).toBeGreaterThan(badScore.score)
  })

  it('flags islands', () => {
    const node: NavigationNode = { file: 'a.ts', imports: 0, importedBy: 0, depth: 1, isEntryPoint: false, isDeadEnd: false, isHighway: false, isIsland: true }
    const map = { nodes: [], paths: [], entryPoints: [], deadEnds: [], highways: [], islands: [] }
    const score = computeWayfindingScore('a.ts', node, map)
    expect(score.issues.some((i) => i.includes('isolated'))).toBe(true)
  })

  it('flags dead ends', () => {
    const node: NavigationNode = { file: 'a.ts', imports: 0, importedBy: 3, depth: 1, isEntryPoint: false, isDeadEnd: true, isHighway: false, isIsland: false }
    const map = { nodes: [], paths: [], entryPoints: [], deadEnds: [], highways: [], islands: [] }
    const score = computeWayfindingScore('a.ts', node, map)
    expect(score.issues.some((i) => i.includes('Dead end'))).toBe(true)
  })

  it('returns score in 0-100 range', () => {
    const node: NavigationNode = { file: 'a.ts', imports: 2, importedBy: 3, depth: 1, isEntryPoint: false, isDeadEnd: false, isHighway: false, isIsland: false }
    const map = { nodes: [], paths: [], entryPoints: [], deadEnds: [], highways: [], islands: [] }
    const score = computeWayfindingScore('a.ts', node, map)
    expect(score.score).toBeGreaterThanOrEqual(0)
    expect(score.score).toBeLessThanOrEqual(100)
  })
})

// ─── computeNavigationComplexity ──────────────────────────────────────────────

describe('computeNavigationComplexity', () => {
  it('returns 30 baseline for empty map', () => {
    const map = { nodes: [], paths: [], entryPoints: [], deadEnds: [], highways: [], islands: [] }
    expect(computeNavigationComplexity(map)).toBe(0)
  })

  it('increases with islands', () => {
    const map = {
      nodes: [
        { file: 'a.ts', imports: 0, importedBy: 0, depth: 0, isEntryPoint: false, isDeadEnd: false, isHighway: false, isIsland: true },
      ],
      paths: [],
      entryPoints: [],
      deadEnds: [],
      highways: [],
      islands: ['a.ts'],
    }
    expect(computeNavigationComplexity(map)).toBeGreaterThan(0)
  })

  it('increases with dead ends', () => {
    const map = {
      nodes: [
        { file: 'a.ts', imports: 0, importedBy: 1, depth: 1, isEntryPoint: false, isDeadEnd: true, isHighway: false, isIsland: false },
      ],
      paths: [],
      entryPoints: [],
      deadEnds: ['a.ts'],
      highways: [],
      islands: [],
    }
    expect(computeNavigationComplexity(map)).toBeGreaterThan(0)
  })
})

// ─── buildNavigationMap ───────────────────────────────────────────────────────

describe('buildNavigationMap', () => {
  it('builds map from files', () => {
    const files = ['src/index.ts', 'src/utils.ts']
    const contents = [
      "import { foo } from './utils'",
      '',
    ]
    const map = buildNavigationMap(files, contents)
    expect(map.nodes).toHaveLength(2)
    expect(map.entryPoints).toContain('src/index.ts')
  })

  it('detects islands', () => {
    const files = ['src/orphan.ts']
    const contents = ['']
    const map = buildNavigationMap(files, contents)
    expect(map.islands).toContain('src/orphan.ts')
  })

  it('detects dead ends', () => {
    const files = ['src/index.ts', 'src/leaf.ts']
    const contents = [
      "import { foo } from './leaf'",
      '',
    ]
    const map = buildNavigationMap(files, contents)
    expect(map.deadEnds).toContain('src/leaf.ts')
  })
})

// ─── computeNavigatorStats ────────────────────────────────────────────────────

describe('computeNavigatorStats', () => {
  it('computes stats correctly', () => {
    const map: import('../src/commands/navigator-helpers.js').NavigationMap = {
      nodes: [
        { file: 'index.ts', imports: 2, importedBy: 0, depth: 0, isEntryPoint: true, isDeadEnd: false, isHighway: false, isIsland: false },
        { file: 'utils.ts', imports: 0, importedBy: 2, depth: 1, isEntryPoint: false, isDeadEnd: true, isHighway: false, isIsland: false },
      ],
      paths: [],
      entryPoints: ['index.ts'],
      deadEnds: ['utils.ts'],
      highways: [],
      islands: [],
    }
    const wayfinding = [
      { file: 'index.ts', score: 85, issues: [] },
      { file: 'utils.ts', score: 55, issues: ['Dead end'] },
    ]
    const stats = computeNavigatorStats(map, wayfinding)
    expect(stats.totalNodes).toBe(2)
    expect(stats.avgConnectivity).toBe(2)
    expect(stats.entryPointCount).toBe(1)
    expect(stats.deadEndCount).toBe(1)
    expect(stats.hardestToReach).toBe('utils.ts')
    expect(stats.easiestToReach).toBe('index.ts')
    expect(stats.averageWayfinding).toBe(70)
  })

  it('handles empty data', () => {
    const stats = computeNavigatorStats(
      { nodes: [], paths: [], entryPoints: [], deadEnds: [], highways: [], islands: [] },
      [],
    )
    expect(stats.totalNodes).toBe(0)
    expect(stats.avgConnectivity).toBe(0)
  })
})

// ─── generateNavigatorRecommendations (via buildNavigatorResult) ───────────────

describe('buildNavigatorResult', () => {
  it('builds complete result', () => {
    const files = ['src/index.ts', 'src/utils.ts', 'src/orphan.ts']
    const contents = [
      "import { foo } from './utils'",
      '',
      '',
    ]
    const result = buildNavigatorResult(files, contents)
    expect(result.map.nodes).toHaveLength(3)
    expect(result.wayfinding).toHaveLength(3)
    expect(result.stats.totalNodes).toBe(3)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty input', () => {
    const result = buildNavigatorResult([], [])
    expect(result.map.nodes).toHaveLength(0)
    expect(result.stats.totalNodes).toBe(0)
  })

  it('produces healthy message for well-connected code', () => {
    // Fully connected graph with no islands/dead ends
    const files = ['a.ts', 'b.ts']
    const contents = [
      "import { x } from './b'",
      "import { y } from './a'",
    ]
    const result = buildNavigatorResult(files, contents)
    expect(result.stats.totalNodes).toBe(2)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('getNodeTypeColor', () => {
  it('returns color for each type', () => {
    expect(typeof getNodeTypeColor('entry')('x')).toBe('string')
    expect(typeof getNodeTypeColor('deadEnd')('x')).toBe('string')
    expect(typeof getNodeTypeColor('highway')('x')).toBe('string')
    expect(typeof getNodeTypeColor('island')('x')).toBe('string')
    expect(typeof getNodeTypeColor('unknown')('x')).toBe('string')
  })
})

describe('formatNodeTypeBadge', () => {
  it('formats island badge', () => {
    const node: NavigationNode = { file: 'a.ts', imports: 0, importedBy: 0, depth: 0, isEntryPoint: false, isDeadEnd: false, isHighway: false, isIsland: true }
    expect(formatNodeTypeBadge(node)).toContain('ISLAND')
  })

  it('formats entry badge', () => {
    const node: NavigationNode = { file: 'index.ts', imports: 2, importedBy: 0, depth: 0, isEntryPoint: true, isDeadEnd: false, isHighway: false, isIsland: false }
    expect(formatNodeTypeBadge(node)).toContain('ENTRY')
  })

  it('formats dead end badge', () => {
    const node: NavigationNode = { file: 'a.ts', imports: 0, importedBy: 3, depth: 1, isEntryPoint: false, isDeadEnd: true, isHighway: false, isIsland: false }
    expect(formatNodeTypeBadge(node)).toContain('DEAD END')
  })

  it('formats highway badge', () => {
    const node: NavigationNode = { file: 'a.ts', imports: 5, importedBy: 5, depth: 0, isEntryPoint: false, isDeadEnd: false, isHighway: true, isIsland: false }
    expect(formatNodeTypeBadge(node)).toContain('HIGHWAY')
  })
})

describe('formatComplexityMeter', () => {
  it('renders meter with score', () => {
    const meter = formatComplexityMeter(50)
    expect(meter).toContain('█')
    expect(meter).toContain('░')
    expect(meter).toContain('50/100')
  })
})

describe('formatDepthChart', () => {
  it('renders depth chart', () => {
    const nodes: NavigationNode[] = [
      { file: 'a.ts', imports: 0, importedBy: 0, depth: 0, isEntryPoint: true, isDeadEnd: false, isHighway: false, isIsland: false },
      { file: 'b.ts', imports: 1, importedBy: 0, depth: 1, isEntryPoint: false, isDeadEnd: false, isHighway: false, isIsland: false },
      { file: 'c.ts', imports: 0, importedBy: 1, depth: 2, isEntryPoint: false, isDeadEnd: true, isHighway: false, isIsland: false },
    ]
    const chart = formatDepthChart(nodes)
    expect(chart).toContain('Depth  0')
    expect(chart).toContain('Depth  1')
    expect(chart).toContain('Depth  2')
  })
})

describe('formatConnectivityChart', () => {
  it('renders connectivity chart', () => {
    const nodes: NavigationNode[] = [
      { file: 'a.ts', imports: 5, importedBy: 3, depth: 0, isEntryPoint: true, isDeadEnd: false, isHighway: false, isIsland: false },
      { file: 'b.ts', imports: 1, importedBy: 2, depth: 1, isEntryPoint: false, isDeadEnd: false, isHighway: false, isIsland: false },
    ]
    const chart = formatConnectivityChart(nodes)
    expect(chart).toContain('Connectivity')
    expect(chart).toContain('8')
  })
})

describe('formatWayfindingScores', () => {
  it('renders scores', () => {
    const wf = [
      { file: 'a.ts', score: 85, issues: [] },
      { file: 'b.ts', score: 45, issues: ['Dead end file'] },
    ]
    const output = formatWayfindingScores(wf)
    expect(output).toContain('Wayfinding Scores')
    expect(output).toContain('85')
    expect(output).toContain('45')
    expect(output).toContain('Dead end file')
  })

  it('shows empty message', () => {
    expect(formatWayfindingScores([])).toContain('No wayfinding data')
  })
})

describe('formatWayfindingMeter', () => {
  it('renders meter bar', () => {
    const meter = formatWayfindingMeter(75)
    expect(meter).toContain('█')
    expect(meter).toContain('75')
  })
})

describe('formatNavigatorStats', () => {
  it('renders stats', () => {
    const stats = {
      totalNodes: 10, avgConnectivity: 3.5, maxDepth: 4, avgDepth: 1.8,
      entryPointCount: 2, deadEndCount: 1, highwayCount: 1, islandCount: 0,
      navigationComplexity: 45, averageWayfinding: 72,
      hardestToReach: 'deep.ts', easiestToReach: 'index.ts',
    }
    const output = formatNavigatorStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('3.5')
    expect(output).toContain('deep.ts')
    expect(output).toContain('index.ts')
    expect(output).toContain('45/100')
  })
})

describe('formatRecommendations', () => {
  it('renders numbered recommendations', () => {
    const output = formatRecommendations(['Fix this', 'Fix that'])
    expect(output).toContain('1. Fix this')
    expect(output).toContain('2. Fix that')
  })

  it('shows no recs message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatNavigatorTable', () => {
  it('renders full table', () => {
    const result = buildNavigatorResult(
      ['index.ts', 'utils.ts'],
      ["import { foo } from './utils'", ''],
    )
    const table = formatNavigatorTable(result)
    expect(table).toContain('Code Navigator')
    expect(table).toContain('Navigation Nodes')
    expect(table).toContain('Wayfinding Scores')
    expect(table).toContain('Recommendations')
  })
})

describe('formatNavigatorJSON', () => {
  it('produces valid JSON', () => {
    const result = buildNavigatorResult(['a.ts'], [''])
    const json = formatNavigatorJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.map.nodes).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
