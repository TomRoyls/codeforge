import { describe, expect, it } from 'vitest'
import {
  buildLineageGraph,
  buildLineageResult,
  computeAncestors,
  computeBreadth,
  computeCriticality,
  computeDepth,
  computeDescendants,
  findCriticalPaths,
  findFragileNodes,
  findLineageClusters,
  findLineagePaths,
  generateRecommendations,
  type LineageGraph,
  type LineageNode,
  type LineagePath,
  type LineageStats,
} from '../src/commands/lineage-helpers.js'
import {
  breadthMeter,
  criticalityBadge,
  depthMeter,
  formatCluster,
  formatClusterTable,
  formatFragileNodes,
  formatLineageJson,
  formatLineageReport,
  formatNodeRow,
  formatNodeTable,
  formatPath,
  formatPathChain,
  formatPathTable,
  formatRecommendations,
  formatStats,
  typeBadge,
} from '../src/commands/lineage-format-helpers.js'

// ─── buildLineageGraph ────────────────────────────────────────────────────────

describe('buildLineageGraph', () => {
  it('creates empty graph from no files', () => {
    const graph = buildLineageGraph([], [])
    expect(graph.nodes.size).toBe(0)
    expect(graph.edges.length).toBe(0)
  })

  it('extracts function declarations', () => {
    const graph = buildLineageGraph(['a.ts'], ['function hello() {}'])
    expect(graph.nodes.size).toBe(1)
    const node = graph.nodes.get('a.ts:hello')!
    expect(node.name).toBe('hello')
    expect(node.type).toBe('function')
    expect(node.line).toBe(1)
  })

  it('extracts class declarations', () => {
    const graph = buildLineageGraph(['a.ts'], ['class MyClass {}'])
    const node = graph.nodes.get('a.ts:MyClass')!
    expect(node.type).toBe('class')
  })

  it('extracts interface declarations', () => {
    const graph = buildLineageGraph(['a.ts'], ['interface Config { x: number }'])
    const node = graph.nodes.get('a.ts:Config')!
    expect(node.type).toBe('interface')
  })

  it('extracts type declarations', () => {
    const graph = buildLineageGraph(['a.ts'], ['type Result = string | number'])
    const node = graph.nodes.get('a.ts:Result')!
    expect(node.type).toBe('type')
  })

  it('extracts const arrow functions', () => {
    const graph = buildLineageGraph(['a.ts'], ['const add = (a: number) => a + 1'])
    const node = graph.nodes.get('a.ts:add')!
    expect(node.type).toBe('constant')
  })

  it('builds edges for function calls', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts'],
      ['function foo() { bar() }', 'function bar() {}'],
    )
    expect(graph.edges.length).toBe(1)
    expect(graph.edges[0].from).toBe('a.ts:foo')
    expect(graph.edges[0].to).toBe('b.ts:bar')
  })

  it('builds adjacency list correctly', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts'],
      ['function foo() { bar() }', 'function bar() {}'],
    )
    const adj = graph.adjacency.get('a.ts:foo')!
    expect(adj.has('b.ts:bar')).toBe(true)
  })

  it('builds reverse adjacency list', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts'],
      ['function foo() { bar() }', 'function bar() {}'],
    )
    const rev = graph.reverse.get('b.ts:bar')!
    expect(rev.has('a.ts:foo')).toBe(true)
  })

  it('skips comment lines for node extraction', () => {
    const graph = buildLineageGraph(['a.ts'], ['// function commented() {}'])
    expect(graph.nodes.size).toBe(0)
  })

  it('skips import lines for node extraction', () => {
    const graph = buildLineageGraph(['a.ts'], ['import { x } from "y"'])
    expect(graph.nodes.size).toBe(0)
  })

  it('skips self-referencing calls', () => {
    const graph = buildLineageGraph(['a.ts'], ['function foo() { foo() }'])
    expect(graph.edges.length).toBe(0)
  })

  it('handles multiple files with cross-references', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts', 'c.ts'],
      [
        'function alpha() { beta() }',
        'function beta() { gamma() }',
        'function gamma() {}',
      ],
    )
    expect(graph.nodes.size).toBe(3)
    expect(graph.edges.length).toBe(2)
  })
})

// ─── computeAncestors ─────────────────────────────────────────────────────────

describe('computeAncestors', () => {
  it('returns empty for root node', () => {
    const graph = buildLineageGraph(['a.ts'], ['function root() {}'])
    const ancestors = computeAncestors('a.ts:root', graph)
    expect(ancestors).toEqual([])
  })

  it('traces single ancestor', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts'],
      ['function foo() { bar() }', 'function bar() {}'],
    )
    const ancestors = computeAncestors('a.ts:foo', graph)
    expect(ancestors).toContain('b.ts:bar')
  })

  it('traces multi-level ancestor chain', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts', 'c.ts'],
      [
        'function alpha() { beta() }',
        'function beta() { gamma() }',
        'function gamma() {}',
      ],
    )
    const ancestors = computeAncestors('a.ts:alpha', graph)
    expect(ancestors).toContain('b.ts:beta')
    expect(ancestors).toContain('c.ts:gamma')
    expect(ancestors.length).toBe(2)
  })

  it('handles diamond dependency', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [
        'function top() { left(); right() }',
        'function left() { bottom() }',
        'function right() { bottom() }',
        'function bottom() {}',
      ],
    )
    const ancestors = computeAncestors('a.ts:top', graph)
    expect(ancestors.length).toBe(3)
    expect(ancestors).toContain('b.ts:left')
    expect(ancestors).toContain('c.ts:right')
    expect(ancestors).toContain('d.ts:bottom')
  })
})

// ─── computeDescendants ───────────────────────────────────────────────────────

describe('computeDescendants', () => {
  it('returns empty for top-level caller', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts'],
      ['function foo() { bar() }', 'function bar() {}'],
    )
    const descendants = computeDescendants('a.ts:foo', graph)
    expect(descendants).toEqual([])
  })

  it('traces reverse dependency as descendant', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts'],
      ['function foo() { bar() }', 'function bar() {}'],
    )
    const descendants = computeDescendants('b.ts:bar', graph)
    expect(descendants).toContain('a.ts:foo')
    expect(descendants.length).toBe(1)
  })

  it('traces descendants in reverse direction', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts', 'c.ts'],
      [
        'function alpha() { beta() }',
        'function beta() { gamma() }',
        'function gamma() {}',
      ],
    )
    const desc = computeDescendants('c.ts:gamma', graph)
    expect(desc).toContain('b.ts:beta')
    expect(desc).toContain('a.ts:alpha')
  })
})

// ─── computeDepth ─────────────────────────────────────────────────────────────

describe('computeDepth', () => {
  it('returns 0 for root node', () => {
    const graph = buildLineageGraph(['a.ts'], ['function root() {}'])
    expect(computeDepth('a.ts:root', graph)).toBe(0)
  })

  it('returns 1 for node with one ancestor level', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts'],
      ['function foo() { bar() }', 'function bar() {}'],
    )
    expect(computeDepth('a.ts:foo', graph)).toBe(1)
  })

  it('returns correct depth for chain', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [
        'function a() { b() }',
        'function b() { c() }',
        'function c() { d() }',
        'function d() {}',
      ],
    )
    expect(computeDepth('a.ts:a', graph)).toBe(3)
    expect(computeDepth('b.ts:b', graph)).toBe(2)
    expect(computeDepth('c.ts:c', graph)).toBe(1)
    expect(computeDepth('d.ts:d', graph)).toBe(0)
  })

  it('handles cycles safely', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts'],
      ['function foo() { bar() }', 'function bar() { foo() }'],
    )
    expect(() => computeDepth('a.ts:foo', graph)).not.toThrow()
    expect(computeDepth('a.ts:foo', graph)).toBeGreaterThanOrEqual(0)
  })
})

// ─── computeBreadth ───────────────────────────────────────────────────────────

describe('computeBreadth', () => {
  it('returns 0 for isolated node', () => {
    const graph = buildLineageGraph(['a.ts'], ['function iso() {}'])
    expect(computeBreadth('a.ts:iso', graph)).toBe(0)
  })

  it('counts direct descendants', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts'],
      ['function foo() { bar() }', 'function bar() {}'],
    )
    expect(computeBreadth('b.ts:bar', graph)).toBe(1)
  })
})

// ─── computeCriticality ───────────────────────────────────────────────────────

describe('computeCriticality', () => {
  it('returns 0 for zero breadth and depth', () => {
    expect(computeCriticality(0, 0)).toBe(0)
  })

  it('caps at 100', () => {
    expect(computeCriticality(100, 100)).toBe(100)
  })

  it('computes based on breadth', () => {
    expect(computeCriticality(5, 0)).toBe(50)
  })

  it('computes based on depth', () => {
    expect(computeCriticality(0, 5)).toBe(50)
  })

  it('combines breadth and depth', () => {
    expect(computeCriticality(3, 3)).toBe(60)
  })
})

// ─── findLineagePaths ─────────────────────────────────────────────────────────

describe('findLineagePaths', () => {
  it('returns empty for single node', () => {
    const graph = buildLineageGraph(['a.ts'], ['function solo() {}'])
    expect(findLineagePaths(graph)).toEqual([])
  })

  it('finds single path', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts', 'c.ts'],
      [
        'function caller() { helper() }',
        'function helper() { util() }',
        'function util() {}',
      ],
    )
    const paths = findLineagePaths(graph)
    expect(paths.length).toBeGreaterThanOrEqual(1)
  })

  it('marks long paths as critical', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'],
      [
        'function a() { b() }',
        'function b() { c() }',
        'function c() { d() }',
        'function d() { e() }',
        'function e() {}',
      ],
    )
    const paths = findLineagePaths(graph)
    const longPath = paths.find((p) => p.length >= 4)
    expect(longPath).toBeDefined()
    expect(longPath!.isCritical).toBe(true)
  })

  it('populates file list in path', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts'],
      ['function foo() { bar() }', 'function bar() {}'],
    )
    const paths = findLineagePaths(graph)
    const path = paths[0]
    expect(path.files.length).toBeGreaterThan(0)
  })
})

// ─── findCriticalPaths ────────────────────────────────────────────────────────

describe('findCriticalPaths', () => {
  it('filters paths by length', () => {
    const paths: LineagePath[] = [
      { from: 'a', to: 'b', chain: ['a', 'b'], length: 1, files: ['a.ts'], isCritical: false },
      { from: 'a', to: 'd', chain: ['a', 'b', 'c', 'd'], length: 3, files: ['a.ts'], isCritical: true },
    ]
    const critical = findCriticalPaths(paths)
    expect(critical.length).toBe(1)
    expect(critical[0].length).toBe(3)
  })

  it('sorts by length descending', () => {
    const paths: LineagePath[] = [
      { from: 'a', to: 'c', chain: ['a', 'b', 'c'], length: 2, files: ['a.ts'], isCritical: true },
      { from: 'a', to: 'e', chain: ['a', 'b', 'c', 'd', 'e'], length: 4, files: ['a.ts'], isCritical: true },
    ]
    const critical = findCriticalPaths(paths)
    expect(critical[0].length).toBeGreaterThanOrEqual(critical[critical.length - 1].length)
  })

  it('returns empty for no critical paths', () => {
    const paths: LineagePath[] = [
      { from: 'a', to: 'b', chain: ['a', 'b'], length: 1, files: ['a.ts'], isCritical: false },
    ]
    expect(findCriticalPaths(paths)).toEqual([])
  })
})

// ─── findFragileNodes ─────────────────────────────────────────────────────────

describe('findFragileNodes', () => {
  it('finds utility nodes with many dependents', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [
        'function util() {}',
        'function caller1() { util() }',
        'function caller2() { util() }',
        'function caller3() { util() }',
      ],
    )
    const nodes = buildTestNodes(graph)
    const fragile = findFragileNodes(nodes, graph)
    expect(fragile.some((n) => n.name === 'util')).toBe(true)
  })

  it('excludes nodes with few dependents', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts', 'c.ts'],
      [
        'function middle() { dep1(); dep2() }',
        'function dep1() {}',
        'function dep2() {}',
      ],
    )
    const nodes = buildTestNodes(graph)
    const fragile = findFragileNodes(nodes, graph)
    expect(fragile.some((n) => n.name === 'dep1')).toBe(false)
    expect(fragile.some((n) => n.name === 'dep2')).toBe(false)
  })
})

function buildTestNodes(graph: LineageGraph): LineageNode[] {
  const nodes: LineageNode[] = []
  for (const [key, node] of graph.nodes) {
    const ancestors = computeAncestors(key, graph)
    const descendants = computeDescendants(key, graph)
    nodes.push({
      name: node.name,
      file: node.file,
      line: node.line,
      type: node.type,
      ancestors: ancestors.map((a) => a.split(':').pop()!),
      descendants: descendants.map((d) => d.split(':').pop()!),
      depth: computeDepth(key, graph),
      breadth: descendants.length,
      criticality: computeCriticality(descendants.length, computeDepth(key, graph)),
    })
  }
  return nodes
}

// ─── findLineageClusters ──────────────────────────────────────────────────────

describe('findLineageClusters', () => {
  it('groups nodes by root ancestor', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts', 'c.ts'],
      [
        'function root() { child() }',
        'function child() { grandchild() }',
        'function grandchild() {}',
      ],
    )
    const nodes = buildTestNodes(graph)
    const clusters = findLineageClusters(nodes, graph)
    expect(clusters.length).toBeGreaterThanOrEqual(1)
  })

  it('sorts clusters by breadth descending', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts', 'c.ts'],
      [
        'function root() { child() }',
        'function child() {}',
        'function solo() {}',
      ],
    )
    const nodes = buildTestNodes(graph)
    const clusters = findLineageClusters(nodes, graph)
    for (let i = 1; i < clusters.length; i++) {
      expect(clusters[i - 1].breadth).toBeGreaterThanOrEqual(clusters[i].breadth)
    }
  })

  it('includes description in cluster', () => {
    const graph = buildLineageGraph(
      ['a.ts', 'b.ts', 'c.ts'],
      [
        'function root() { child() }',
        'function child() { grandchild() }',
        'function grandchild() {}',
      ],
    )
    const nodes = buildTestNodes(graph)
    const clusters = findLineageClusters(nodes, graph)
    if (clusters.length > 0) {
      expect(clusters[0].description).toContain('lineage')
    }
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: LineageStats = {
    totalNodes: 10,
    totalPaths: 5,
    maxDepth: 3,
    maxBreadth: 5,
    averageDepth: 1.5,
    criticalNodes: 0,
    fragileNodes: 0,
    orphanNodes: 0,
  }

  it('generates default recommendation when all is healthy', () => {
    const recs = generateRecommendations([], [], baseStats)
    expect(recs).toEqual(['Lineage graph looks healthy — good dependency structure'])
  })

  it('warns about long critical paths', () => {
    const paths: LineagePath[] = [
      { from: 'a', to: 'z', chain: ['a', 'b', 'c', 'd'], length: 3, files: ['a.ts'], isCritical: true },
    ]
    const recs = generateRecommendations(paths, [], baseStats)
    expect(recs.some((r) => r.includes('Longest lineage chain'))).toBe(true)
  })

  it('warns about fragile nodes', () => {
    const fragile: LineageNode[] = [
      { name: 'x', file: 'a.ts', line: 1, type: 'function', ancestors: [], descendants: ['a', 'b', 'c'], depth: 0, breadth: 3, criticality: 30 },
    ]
    const recs = generateRecommendations([], fragile, baseStats)
    expect(recs.some((r) => r.includes('fragile'))).toBe(true)
  })

  it('warns about deep chains', () => {
    const stats = { ...baseStats, maxDepth: 7 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('Max dependency depth'))).toBe(true)
  })

  it('warns about many orphan nodes', () => {
    const stats = { ...baseStats, orphanNodes: 8, totalNodes: 10 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('orphan'))).toBe(true)
  })

  it('warns about critical nodes', () => {
    const stats = { ...baseStats, criticalNodes: 3 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('critical'))).toBe(true)
  })
})

// ─── buildLineageResult ───────────────────────────────────────────────────────

describe('buildLineageResult', () => {
  it('returns empty result for empty input', () => {
    const result = buildLineageResult([], [])
    expect(result.nodes).toEqual([])
    expect(result.stats.totalNodes).toBe(0)
    expect(result.stats.maxDepth).toBe(0)
    expect(result.stats.averageDepth).toBe(0)
  })

  it('returns complete result for single file', () => {
    const result = buildLineageResult(['a.ts'], ['function foo() { bar() }\nfunction bar() {}'])
    expect(result.nodes.length).toBe(2)
    expect(result.stats.totalNodes).toBe(2)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const result = buildLineageResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [
        'function alpha() { beta() }',
        'function beta() { gamma() }',
        'function gamma() {}',
      ],
    )
    expect(result.stats.totalNodes).toBe(3)
    expect(result.stats.maxDepth).toBe(2)
    expect(result.stats.maxBreadth).toBeGreaterThanOrEqual(0)
    expect(result.stats.averageDepth).toBeGreaterThan(0)
  })

  it('identifies orphan nodes', () => {
    const result = buildLineageResult(['a.ts'], ['function iso() {}'])
    expect(result.stats.orphanNodes).toBe(1)
  })

  it('identifies critical paths', () => {
    const result = buildLineageResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'],
      [
        'function a() { b() }',
        'function b() { c() }',
        'function c() { d() }',
        'function d() { e() }',
        'function e() {}',
      ],
    )
    expect(result.criticalPaths.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('criticalityBadge', () => {
  it('returns CRITICAL for high values', () => {
    expect(criticalityBadge(90)).toContain('CRITICAL')
  })

  it('returns HIGH for medium-high values', () => {
    expect(criticalityBadge(60)).toContain('HIGH')
  })

  it('returns MEDIUM for medium values', () => {
    expect(criticalityBadge(30)).toContain('MEDIUM')
  })

  it('returns LOW for low values', () => {
    expect(criticalityBadge(10)).toContain('LOW')
  })
})

describe('typeBadge', () => {
  it('returns colored type for function', () => {
    const badge = typeBadge('function')
    expect(badge).toContain('function')
  })

  it('returns colored type for class', () => {
    const badge = typeBadge('class')
    expect(badge).toContain('class')
  })

  it('handles unknown types', () => {
    const badge = typeBadge('unknown')
    expect(badge).toContain('unknown')
  })
})

describe('depthMeter', () => {
  it('returns 0 meter when max is 0', () => {
    expect(depthMeter(0, 0)).toContain('0')
  })

  it('shows filled blocks for depth', () => {
    const meter = depthMeter(5, 10)
    expect(meter).toContain('5')
  })
})

describe('breadthMeter', () => {
  it('returns 0 meter when max is 0', () => {
    expect(breadthMeter(0, 0)).toContain('0')
  })

  it('shows filled blocks for breadth', () => {
    const meter = breadthMeter(3, 10)
    expect(meter).toContain('3')
  })
})

describe('formatNodeRow', () => {
  it('formats a node as a row', () => {
    const node: LineageNode = {
      name: 'foo', file: 'a.ts', line: 1, type: 'function',
      ancestors: [], descendants: [], depth: 2, breadth: 3, criticality: 40,
    }
    const row = formatNodeRow(node, 5, 5)
    expect(row).toContain('foo')
    expect(row).toContain('a.ts')
  })
})

describe('formatNodeTable', () => {
  it('formats nodes as table with header', () => {
    const nodes: LineageNode[] = [
      { name: 'foo', file: 'a.ts', line: 1, type: 'function', ancestors: [], descendants: [], depth: 0, breadth: 0, criticality: 0 },
    ]
    const table = formatNodeTable(nodes, false)
    expect(table).toContain('Name')
    expect(table).toContain('foo')
  })

  it('includes ancestors/descendants in verbose mode', () => {
    const nodes: LineageNode[] = [
      { name: 'foo', file: 'a.ts', line: 1, type: 'function', ancestors: ['bar'], descendants: ['baz'], depth: 1, breadth: 1, criticality: 20 },
    ]
    const table = formatNodeTable(nodes, true)
    expect(table).toContain('bar')
    expect(table).toContain('baz')
  })
})

describe('formatPathChain', () => {
  it('formats chain with arrows', () => {
    const chain = formatPathChain(['a.ts:foo', 'b.ts:bar'])
    expect(chain).toContain('foo')
    expect(chain).toContain('bar')
  })
})

describe('formatPath', () => {
  it('formats path with chain and length', () => {
    const path: LineagePath = {
      from: 'a.ts:foo', to: 'b.ts:bar', chain: ['a.ts:foo', 'b.ts:bar'], length: 1, files: ['a.ts'], isCritical: false,
    }
    const formatted = formatPath(path)
    expect(formatted).toContain('1')
  })

  it('shows CRITICAL label for critical paths', () => {
    const path: LineagePath = {
      from: 'a', to: 'd', chain: ['a', 'b', 'c', 'd'], length: 3, files: ['a.ts'], isCritical: true,
    }
    const formatted = formatPath(path)
    expect(formatted).toContain('CRITICAL')
  })
})

describe('formatPathTable', () => {
  it('formats paths as table', () => {
    const paths: LineagePath[] = [
      { from: 'a', to: 'b', chain: ['a.ts:foo', 'b.ts:bar'], length: 1, files: ['a.ts'], isCritical: false },
    ]
    const table = formatPathTable(paths)
    expect(table).toContain('Chain')
    expect(table).toContain('foo')
  })
})

describe('formatCluster', () => {
  it('formats cluster with root and descendants', () => {
    const cluster = { root: 'core', descendants: ['a', 'b'], depth: 2, breadth: 2, description: 'core lineage: 2 descendant(s)' }
    const formatted = formatCluster(cluster)
    expect(formatted).toContain('core')
    expect(formatted).toContain('a')
    expect(formatted).toContain('b')
  })
})

describe('formatClusterTable', () => {
  it('formats clusters as table', () => {
    const clusters = [
      { root: 'core', descendants: ['a'], depth: 1, breadth: 1, description: 'test' },
    ]
    const table = formatClusterTable(clusters)
    expect(table).toContain('Root')
    expect(table).toContain('core')
  })
})

describe('formatStats', () => {
  it('formats all stats', () => {
    const stats: LineageStats = {
      totalNodes: 10, totalPaths: 5, maxDepth: 3, maxBreadth: 7,
      averageDepth: 1.5, criticalNodes: 2, fragileNodes: 1, orphanNodes: 3,
    }
    const formatted = formatStats(stats)
    expect(formatted).toContain('10')
    expect(formatted).toContain('5')
    expect(formatted).toContain('3')
    expect(formatted).toContain('7')
    expect(formatted).toContain('1.5')
    expect(formatted).toContain('2')
    expect(formatted).toContain('1')
    expect(formatted).toContain('3')
  })
})

describe('formatRecommendations', () => {
  it('formats recommendations as numbered list', () => {
    const recs = ['Fix A', 'Fix B']
    const formatted = formatRecommendations(recs)
    expect(formatted).toContain('1.')
    expect(formatted).toContain('2.')
    expect(formatted).toContain('Fix A')
  })
})

describe('formatFragileNodes', () => {
  it('returns message when no fragile nodes', () => {
    const formatted = formatFragileNodes([])
    expect(formatted).toContain('No fragile nodes')
  })

  it('formats fragile nodes list', () => {
    const nodes: LineageNode[] = [
      { name: 'core', file: 'a.ts', line: 1, type: 'function', ancestors: [], descendants: ['x', 'y', 'z'], depth: 0, breadth: 3, criticality: 30 },
    ]
    const formatted = formatFragileNodes(nodes)
    expect(formatted).toContain('core')
    expect(formatted).toContain('3 dependents')
  })
})

describe('formatLineageReport', () => {
  it('formats complete report', () => {
    const result = buildLineageResult(['a.ts'], ['function foo() { bar() } function bar() {}'])
    const report = formatLineageReport(result, false)
    expect(report).toContain('Lineage Statistics')
    expect(report).toContain('Recommendations')
  })
})

describe('formatLineageJson', () => {
  it('outputs valid JSON', () => {
    const result = buildLineageResult(['a.ts'], ['function foo() {}'])
    const json = formatLineageJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.nodes).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
