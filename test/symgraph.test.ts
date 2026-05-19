import { describe, expect, it } from 'vitest'
import {
  assignDepths,
  buildCallGraph,
  buildSymgraphResult,
  computeGraphDensity,
  extractCalls,
  extractFunctions,
  findCentralNodes,
  findEntryPoints,
  findLeafNodes,
  findLongestChains,
  findOrphans,
  generateRecommendations,
  type CallGraph,
  type CallNode,
  type SymgraphStats,
} from '../src/commands/symgraph-helpers.js'
import {
  formatCallTree,
  formatChain,
  formatChains,
  formatEdgeList,
  formatEdgeRow,
  formatNodeRow,
  formatNodeTable,
  formatRecommendations,
  formatStats,
  formatSymgraphJson,
  formatSymgraphOutput,
} from '../src/commands/symgraph-format-helpers.js'
import type { CallChain, CallEdge, SymgraphResult } from '../src/commands/symgraph-helpers.js'

// ─── extractFunctions ─────────────────────────────────────────────────────────

describe('extractFunctions', () => {
  it('extracts named function declarations', () => {
    const nodes = extractFunctions('function foo() { return 1 }', 'a.ts')
    expect(nodes.has('a.ts:foo')).toBe(true)
    expect(nodes.get('a.ts:foo')!.type).toBe('function')
  })

  it('extracts exported functions', () => {
    const nodes = extractFunctions('export function bar() {}', 'a.ts')
    expect(nodes.get('a.ts:bar')!.isExported).toBe(true)
  })

  it('extracts async functions', () => {
    const nodes = extractFunctions('async function baz() {}', 'a.ts')
    expect(nodes.get('a.ts:baz')!.isAsync).toBe(true)
  })

  it('extracts exported async functions', () => {
    const nodes = extractFunctions('export async function qux() {}', 'a.ts')
    const node = nodes.get('a.ts:qux')!
    expect(node.isExported).toBe(true)
    expect(node.isAsync).toBe(true)
  })

  it('extracts arrow functions', () => {
    const nodes = extractFunctions('const add = (a, b) => a + b', 'a.ts')
    expect(nodes.has('a.ts:add')).toBe(true)
    expect(nodes.get('a.ts:add')!.type).toBe('arrow')
  })

  it('extracts async arrow functions', () => {
    const nodes = extractFunctions('const fetch = async () => {}', 'a.ts')
    expect(nodes.get('a.ts:fetch')!.isAsync).toBe(true)
  })

  it('extracts class declarations', () => {
    const nodes = extractFunctions('class MyClass {}', 'a.ts')
    expect(nodes.has('a.ts:MyClass')).toBe(true)
    expect(nodes.get('a.ts:MyClass')!.type).toBe('constructor')
  })

  it('extracts exported class declarations', () => {
    const nodes = extractFunctions('export class Service {}', 'a.ts')
    expect(nodes.get('a.ts:Service')!.isExported).toBe(true)
  })

  it('returns empty map for empty content', () => {
    const nodes = extractFunctions('', 'a.ts')
    expect(nodes.size).toBe(0)
  })

  it('records correct line numbers', () => {
    const content = '\n\nfunction foo() {}'
    const nodes = extractFunctions(content, 'a.ts')
    expect(nodes.get('a.ts:foo')!.line).toBe(3)
  })

  it('handles multiple functions in one file', () => {
    const content = 'function a() {}\nfunction b() {}\nfunction c() {}'
    const nodes = extractFunctions(content, 'a.ts')
    expect(nodes.size).toBe(3)
  })
})

// ─── extractCalls ──────────────────────────────────────────────────────────────

describe('extractCalls', () => {
  it('finds calls to defined functions', () => {
    const defined = new Set(['a.ts:foo', 'a.ts:bar'])
    const calls = extractCalls('foo()', 'a.ts', defined)
    expect(calls).toContain('a.ts:foo')
  })

  it('skips control flow keywords', () => {
    const defined = new Set(['a.ts:if'])
    const calls = extractCalls('if (true) {}', 'a.ts', defined)
    expect(calls).not.toContain('a.ts:if')
  })

  it('skips declaration keywords', () => {
    const defined = new Set(['a.ts:function'])
    const calls = extractCalls('function foo() {}', 'a.ts', defined)
    expect(calls).not.toContain('a.ts:function')
  })

  it('skips comment lines', () => {
    const defined = new Set(['a.ts:foo'])
    const calls = extractCalls('// foo()', 'a.ts', defined)
    expect(calls).not.toContain('a.ts:foo')
  })

  it('skips JSDoc comment lines', () => {
    const defined = new Set(['a.ts:foo'])
    const calls = extractCalls(' * foo()', 'a.ts', defined)
    expect(calls).not.toContain('a.ts:foo')
  })

  it('deduplicates calls', () => {
    const defined = new Set(['a.ts:foo'])
    const calls = extractCalls('foo()\nfoo()', 'a.ts', defined)
    expect(calls.length).toBe(1)
  })

  it('finds multiple distinct calls', () => {
    const defined = new Set(['a.ts:foo', 'a.ts:bar', 'a.ts:baz'])
    const calls = extractCalls('foo(); bar()', 'a.ts', defined)
    expect(calls).toContain('a.ts:foo')
    expect(calls).toContain('a.ts:bar')
  })

  it('returns empty array when no calls match', () => {
    const defined = new Set(['a.ts:foo'])
    const calls = extractCalls('baz()', 'a.ts', defined)
    expect(calls.length).toBe(0)
  })

  it('skips return keyword', () => {
    const defined = new Set(['a.ts:return'])
    const calls = extractCalls('return 1', 'a.ts', defined)
    expect(calls).not.toContain('a.ts:return')
  })
})

// ─── buildCallGraph ────────────────────────────────────────────────────────────

describe('buildCallGraph', () => {
  it('builds graph with nodes and edges', () => {
    const graph = buildCallGraph(
      ['a.ts'],
      ['function foo() { bar() }\nfunction bar() {}'],
    )
    expect(graph.nodes.size).toBe(2)
    expect(graph.edges.length).toBeGreaterThan(0)
  })

  it('creates edges between caller and callee', () => {
    const graph = buildCallGraph(
      ['a.ts'],
      ['export function main() { helper() }\nfunction helper() {}'],
    )
    const mainNode = graph.nodes.get('a.ts:main')!
    expect(mainNode.calls).toContain('a.ts:helper')
  })

  it('sets calledBy on callee', () => {
    const graph = buildCallGraph(
      ['a.ts'],
      ['export function main() { helper() }\nfunction helper() {}'],
    )
    const helperNode = graph.nodes.get('a.ts:helper')!
    expect(helperNode.calledBy).toContain('a.ts:main')
  })

  it('returns empty graph for no functions', () => {
    const graph = buildCallGraph(['a.ts'], ['const x = 1'])
    expect(graph.nodes.size).toBe(0)
    expect(graph.edges.length).toBe(0)
  })

  it('handles multiple files', () => {
    const graph = buildCallGraph(
      ['a.ts', 'b.ts'],
      ['export function foo() {}', 'function bar() {}'],
    )
    expect(graph.nodes.size).toBe(2)
  })
})

// ─── findEntryPoints ──────────────────────────────────────────────────────────

describe('findEntryPoints', () => {
  it('finds exported nodes with no callers', () => {
    const nodes = new Map<string, CallNode>()
    nodes.set('a.ts:main', {
      name: 'main', file: 'a.ts', line: 1,
      calls: [], calledBy: [],
      type: 'function', isExported: true, isAsync: false, depth: -1,
    })
    nodes.set('a.ts:helper', {
      name: 'helper', file: 'a.ts', line: 5,
      calls: [], calledBy: ['a.ts:main'],
      type: 'function', isExported: false, isAsync: false, depth: -1,
    })
    const graph: CallGraph = { nodes, edges: [] }
    const eps = findEntryPoints(graph)
    expect(eps.length).toBe(1)
    expect(eps[0]!.name).toBe('main')
  })

  it('falls back to non-exported nodes with no callers', () => {
    const nodes = new Map<string, CallNode>()
    nodes.set('a.ts:foo', {
      name: 'foo', file: 'a.ts', line: 1,
      calls: [], calledBy: [],
      type: 'function', isExported: false, isAsync: false, depth: -1,
    })
    const graph: CallGraph = { nodes, edges: [] }
    const eps = findEntryPoints(graph)
    expect(eps.length).toBe(1)
    expect(eps[0]!.name).toBe('foo')
  })

  it('returns empty for empty graph', () => {
    const graph: CallGraph = { nodes: new Map(), edges: [] }
    expect(findEntryPoints(graph).length).toBe(0)
  })
})

// ─── findCentralNodes ─────────────────────────────────────────────────────────

describe('findCentralNodes', () => {
  it('finds nodes called by more than 3 others', () => {
    const nodes = new Map<string, CallNode>()
    nodes.set('a.ts:util', {
      name: 'util', file: 'a.ts', line: 1,
      calls: [], calledBy: ['a.ts:a', 'a.ts:b', 'a.ts:c', 'a.ts:d'],
      type: 'function', isExported: false, isAsync: false, depth: -1,
    })
    const graph: CallGraph = { nodes, edges: [] }
    expect(findCentralNodes(graph).length).toBe(1)
  })

  it('excludes nodes with 3 or fewer callers', () => {
    const nodes = new Map<string, CallNode>()
    nodes.set('a.ts:util', {
      name: 'util', file: 'a.ts', line: 1,
      calls: [], calledBy: ['a.ts:a', 'a.ts:b', 'a.ts:c'],
      type: 'function', isExported: false, isAsync: false, depth: -1,
    })
    const graph: CallGraph = { nodes, edges: [] }
    expect(findCentralNodes(graph).length).toBe(0)
  })
})

// ─── findLeafNodes ────────────────────────────────────────────────────────────

describe('findLeafNodes', () => {
  it('finds nodes with no calls', () => {
    const nodes = new Map<string, CallNode>()
    nodes.set('a.ts:leaf', {
      name: 'leaf', file: 'a.ts', line: 1,
      calls: [], calledBy: ['a.ts:root'],
      type: 'function', isExported: false, isAsync: false, depth: -1,
    })
    nodes.set('a.ts:root', {
      name: 'root', file: 'a.ts', line: 5,
      calls: ['a.ts:leaf'], calledBy: [],
      type: 'function', isExported: true, isAsync: false, depth: -1,
    })
    const graph: CallGraph = { nodes, edges: [] }
    const leaves = findLeafNodes(graph)
    expect(leaves.length).toBe(1)
    expect(leaves[0]!.name).toBe('leaf')
  })
})

// ─── findOrphans ──────────────────────────────────────────────────────────────

describe('findOrphans', () => {
  it('finds non-exported nodes with no callers', () => {
    const nodes = new Map<string, CallNode>()
    nodes.set('a.ts:orphan', {
      name: 'orphan', file: 'a.ts', line: 1,
      calls: [], calledBy: [],
      type: 'function', isExported: false, isAsync: false, depth: -1,
    })
    const graph: CallGraph = { nodes, edges: [] }
    expect(findOrphans(graph).length).toBe(1)
  })

  it('excludes exported nodes', () => {
    const nodes = new Map<string, CallNode>()
    nodes.set('a.ts:main', {
      name: 'main', file: 'a.ts', line: 1,
      calls: [], calledBy: [],
      type: 'function', isExported: true, isAsync: false, depth: -1,
    })
    const graph: CallGraph = { nodes, edges: [] }
    expect(findOrphans(graph).length).toBe(0)
  })

  it('excludes nodes with callers', () => {
    const nodes = new Map<string, CallNode>()
    nodes.set('a.ts:util', {
      name: 'util', file: 'a.ts', line: 1,
      calls: [], calledBy: ['a.ts:main'],
      type: 'function', isExported: false, isAsync: false, depth: -1,
    })
    const graph: CallGraph = { nodes, edges: [] }
    expect(findOrphans(graph).length).toBe(0)
  })
})

// ─── computeGraphDensity ──────────────────────────────────────────────────────

describe('computeGraphDensity', () => {
  it('returns 0 for single node', () => {
    const nodes = new Map<string, CallNode>()
    nodes.set('a.ts:foo', {
      name: 'foo', file: 'a.ts', line: 1,
      calls: [], calledBy: [],
      type: 'function', isExported: true, isAsync: false, depth: -1,
    })
    expect(computeGraphDensity({ nodes, edges: [] })).toBe(0)
  })

  it('returns 0 for empty graph', () => {
    expect(computeGraphDensity({ nodes: new Map(), edges: [] })).toBe(0)
  })

  it('computes density correctly', () => {
    const nodes = new Map<string, CallNode>()
    nodes.set('a.ts:a', {
      name: 'a', file: 'a.ts', line: 1,
      calls: ['a.ts:b'], calledBy: [],
      type: 'function', isExported: true, isAsync: false, depth: -1,
    })
    nodes.set('a.ts:b', {
      name: 'b', file: 'a.ts', line: 5,
      calls: [], calledBy: ['a.ts:a'],
      type: 'function', isExported: false, isAsync: false, depth: -1,
    })
    const edges: CallEdge[] = [{ from: 'a.ts:a', to: 'a.ts:b', fromFile: 'a.ts', toFile: 'a.ts', type: 'direct' }]
    const density = computeGraphDensity({ nodes, edges })
    expect(density).toBe(0.5)
  })
})

// ─── assignDepths ─────────────────────────────────────────────────────────────

describe('assignDepths', () => {
  it('assigns depth 0 to entry points', () => {
    const nodes = new Map<string, CallNode>()
    const mainNode: CallNode = {
      name: 'main', file: 'a.ts', line: 1,
      calls: ['a.ts:helper'], calledBy: [],
      type: 'function', isExported: true, isAsync: false, depth: -1,
    }
    const helperNode: CallNode = {
      name: 'helper', file: 'a.ts', line: 5,
      calls: [], calledBy: ['a.ts:main'],
      type: 'function', isExported: false, isAsync: false, depth: -1,
    }
    nodes.set('a.ts:main', mainNode)
    nodes.set('a.ts:helper', helperNode)
    assignDepths({ nodes, edges: [] }, [mainNode])
    expect(mainNode.depth).toBe(0)
    expect(helperNode.depth).toBe(1)
  })

  it('leaves unreachable nodes at -1', () => {
    const nodes = new Map<string, CallNode>()
    const mainNode: CallNode = {
      name: 'main', file: 'a.ts', line: 1,
      calls: [], calledBy: [],
      type: 'function', isExported: true, isAsync: false, depth: -1,
    }
    const orphanNode: CallNode = {
      name: 'orphan', file: 'a.ts', line: 5,
      calls: [], calledBy: [],
      type: 'function', isExported: false, isAsync: false, depth: -1,
    }
    nodes.set('a.ts:main', mainNode)
    nodes.set('a.ts:orphan', orphanNode)
    assignDepths({ nodes, edges: [] }, [mainNode])
    expect(orphanNode.depth).toBe(-1)
  })
})

// ─── findLongestChains ────────────────────────────────────────────────────────

describe('findLongestChains', () => {
  it('finds call chains from entry points', () => {
    const nodes = new Map<string, CallNode>()
    nodes.set('a.ts:a', {
      name: 'a', file: 'a.ts', line: 1,
      calls: ['a.ts:b'], calledBy: [],
      type: 'function', isExported: true, isAsync: false, depth: 0,
    })
    nodes.set('a.ts:b', {
      name: 'b', file: 'a.ts', line: 5,
      calls: ['a.ts:c'], calledBy: ['a.ts:a'],
      type: 'function', isExported: false, isAsync: false, depth: 1,
    })
    nodes.set('a.ts:c', {
      name: 'c', file: 'a.ts', line: 9,
      calls: [], calledBy: ['a.ts:b'],
      type: 'function', isExported: false, isAsync: false, depth: 2,
    })
    const chains = findLongestChains({ nodes, edges: [] }, 5)
    expect(chains.length).toBeGreaterThan(0)
    expect(chains[0]!.depth).toBe(2)
    expect(chains[0]!.path).toEqual(['a.ts:a', 'a.ts:b', 'a.ts:c'])
  })

  it('returns empty for no entry points', () => {
    const graph: CallGraph = { nodes: new Map(), edges: [] }
    expect(findLongestChains(graph, 3).length).toBe(0)
  })

  it('respects max depth', () => {
    const nodes = new Map<string, CallNode>()
    nodes.set('a.ts:a', {
      name: 'a', file: 'a.ts', line: 1,
      calls: ['a.ts:b'], calledBy: [],
      type: 'function', isExported: true, isAsync: false, depth: 0,
    })
    nodes.set('a.ts:b', {
      name: 'b', file: 'a.ts', line: 5,
      calls: ['a.ts:c'], calledBy: ['a.ts:a'],
      type: 'function', isExported: false, isAsync: false, depth: 1,
    })
    nodes.set('a.ts:c', {
      name: 'c', file: 'a.ts', line: 9,
      calls: ['a.ts:d'], calledBy: ['a.ts:b'],
      type: 'function', isExported: false, isAsync: false, depth: 2,
    })
    nodes.set('a.ts:d', {
      name: 'd', file: 'a.ts', line: 13,
      calls: [], calledBy: ['a.ts:c'],
      type: 'function', isExported: false, isAsync: false, depth: 3,
    })
    const chains = findLongestChains({ nodes, edges: [] }, 2)
    for (const chain of chains) {
      expect(chain.depth).toBeLessThanOrEqual(2)
    }
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('warns about orphans', () => {
    const orphan: CallNode = {
      name: 'deadFn', file: 'a.ts', line: 1,
      calls: [], calledBy: [],
      type: 'function', isExported: false, isAsync: false, depth: -1,
    }
    const stats: SymgraphStats = {
      totalFunctions: 5, totalEdges: 3, averageCallsPerFunction: 0.6,
      maxDepth: 2, entryPointCount: 1, centralCount: 0,
      leafCount: 2, orphanCount: 1, graphDensity: 0.15,
    }
    const recs = generateRecommendations([orphan], [], stats)
    expect(recs.some((r) => r.includes('orphan'))).toBe(true)
  })

  it('warns about high graph density', () => {
    const stats: SymgraphStats = {
      totalFunctions: 10, totalEdges: 15, averageCallsPerFunction: 1.5,
      maxDepth: 3, entryPointCount: 2, centralCount: 0,
      leafCount: 3, orphanCount: 0, graphDensity: 0.5,
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('tightly coupled'))).toBe(true)
  })

  it('warns about deep call chains', () => {
    const stats: SymgraphStats = {
      totalFunctions: 10, totalEdges: 10, averageCallsPerFunction: 1,
      maxDepth: 7, entryPointCount: 1, centralCount: 0,
      leafCount: 3, orphanCount: 0, graphDensity: 0.1,
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('Max call depth is 7'))).toBe(true)
  })

  it('warns about no entry points', () => {
    const stats: SymgraphStats = {
      totalFunctions: 5, totalEdges: 3, averageCallsPerFunction: 0.6,
      maxDepth: 2, entryPointCount: 0, centralCount: 0,
      leafCount: 2, orphanCount: 0, graphDensity: 0.15,
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('No entry points'))).toBe(true)
  })

  it('returns healthy message when no issues', () => {
    const stats: SymgraphStats = {
      totalFunctions: 5, totalEdges: 3, averageCallsPerFunction: 0.6,
      maxDepth: 2, entryPointCount: 1, centralCount: 0,
      leafCount: 2, orphanCount: 0, graphDensity: 0.1,
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })

  it('warns about central nodes', () => {
    const central: CallNode = {
      name: 'util', file: 'a.ts', line: 1,
      calls: [], calledBy: ['a.ts:a', 'a.ts:b', 'a.ts:c', 'a.ts:d'],
      type: 'function', isExported: false, isAsync: false, depth: -1,
    }
    const stats: SymgraphStats = {
      totalFunctions: 5, totalEdges: 5, averageCallsPerFunction: 1,
      maxDepth: 2, entryPointCount: 1, centralCount: 1,
      leafCount: 2, orphanCount: 0, graphDensity: 0.1,
    }
    const recs = generateRecommendations([], [central], stats)
    expect(recs.some((r) => r.includes('central'))).toBe(true)
  })
})

// ─── buildSymgraphResult ──────────────────────────────────────────────────────

describe('buildSymgraphResult', () => {
  it('returns complete result object', () => {
    const result = buildSymgraphResult(
      ['a.ts'],
      ['export function main() { helper() }\nfunction helper() {}'],
    )
    expect(result.stats.totalFunctions).toBe(2)
    expect(result.entryPoints.length).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty files', () => {
    const result = buildSymgraphResult(['a.ts'], [''])
    expect(result.stats.totalFunctions).toBe(0)
    expect(result.stats.totalEdges).toBe(0)
  })

  it('respects depth option', () => {
    const result = buildSymgraphResult(
      ['a.ts'],
      ['export function a() { b() }\nfunction b() { c() }\nfunction c() { d() }\nfunction d() {}'],
      { depth: 2 },
    )
    for (const chain of result.longestChains) {
      expect(chain.depth).toBeLessThanOrEqual(2)
    }
  })
})

// ─── format-helpers ───────────────────────────────────────────────────────────

describe('formatNodeRow', () => {
  it('formats a function node', () => {
    const node: CallNode = {
      name: 'foo', file: 'a.ts', line: 1,
      calls: ['a.ts:bar'], calledBy: [],
      type: 'function', isExported: false, isAsync: false, depth: 0,
    }
    const row = formatNodeRow(node)
    expect(row).toContain('foo')
    expect(row).toContain('a.ts')
  })
})

describe('formatNodeTable', () => {
  it('returns (none) for empty array', () => {
    expect(formatNodeTable([])).toContain('(none)')
  })

  it('includes header for non-empty array', () => {
    const node: CallNode = {
      name: 'foo', file: 'a.ts', line: 1,
      calls: [], calledBy: [],
      type: 'function', isExported: false, isAsync: false, depth: 0,
    }
    const table = formatNodeTable([node])
    expect(table).toContain('Function')
    expect(table).toContain('foo')
  })
})

describe('formatEdgeRow', () => {
  it('formats an edge with arrow', () => {
    const edge: CallEdge = {
      from: 'a.ts:main', to: 'a.ts:helper',
      fromFile: 'a.ts', toFile: 'a.ts', type: 'direct',
    }
    const row = formatEdgeRow(edge)
    expect(row).toContain('main')
    expect(row).toContain('helper')
    expect(row).toContain('direct')
  })
})

describe('formatEdgeList', () => {
  it('returns (no edges) for empty', () => {
    expect(formatEdgeList([])).toContain('(no edges)')
  })
})

describe('formatCallTree', () => {
  it('returns (no entry points) for empty', () => {
    expect(formatCallTree(new Map(), [], 3)).toContain('(no entry points)')
  })

  it('renders tree structure', () => {
    const nodes = new Map<string, CallNode>()
    nodes.set('a.ts:main', {
      name: 'main', file: 'a.ts', line: 1,
      calls: ['a.ts:helper'], calledBy: [],
      type: 'function', isExported: true, isAsync: false, depth: 0,
    })
    nodes.set('a.ts:helper', {
      name: 'helper', file: 'a.ts', line: 5,
      calls: [], calledBy: ['a.ts:main'],
      type: 'function', isExported: false, isAsync: false, depth: 1,
    })
    const tree = formatCallTree(nodes, [nodes.get('a.ts:main')!], 3)
    expect(tree).toContain('main')
    expect(tree).toContain('helper')
  })
})

describe('formatChain', () => {
  it('formats chain with arrows', () => {
    const chain: CallChain = {
      path: ['a.ts:main', 'a.ts:foo', 'a.ts:bar'],
      depth: 2,
      files: ['a.ts', 'a.ts', 'a.ts'],
    }
    const formatted = formatChain(chain)
    expect(formatted).toContain('main')
    expect(formatted).toContain('foo')
    expect(formatted).toContain('bar')
    expect(formatted).toContain('depth: 2')
  })
})

describe('formatChains', () => {
  it('returns (no chains found) for empty', () => {
    expect(formatChains([])).toContain('(no chains found)')
  })
})

describe('formatStats', () => {
  it('formats all stat fields', () => {
    const stats: SymgraphStats = {
      totalFunctions: 10, totalEdges: 15, averageCallsPerFunction: 1.5,
      maxDepth: 3, entryPointCount: 2, centralCount: 1,
      leafCount: 3, orphanCount: 0, graphDensity: 0.1667,
    }
    const formatted = formatStats(stats)
    expect(formatted).toContain('10')
    expect(formatted).toContain('15')
    expect(formatted).toContain('1.5')
    expect(formatted).toContain('3')
  })
})

describe('formatRecommendations', () => {
  it('formats as bullet list', () => {
    const recs = formatRecommendations(['test rec'])
    expect(recs).toContain('test rec')
  })
})

describe('formatSymgraphOutput', () => {
  it('includes all sections', () => {
    const result: SymgraphResult = {
      graph: { nodes: new Map(), edges: [] },
      entryPoints: [],
      centralNodes: [],
      leafNodes: [],
      orphans: [],
      longestChains: [],
      stats: {
        totalFunctions: 0, totalEdges: 0, averageCallsPerFunction: 0,
        maxDepth: 0, entryPointCount: 0, centralCount: 0,
        leafCount: 0, orphanCount: 0, graphDensity: 0,
      },
      recommendations: ['Looks good.'],
    }
    const output = formatSymgraphOutput(result, 3)
    expect(output).toContain('Statistics')
    expect(output).toContain('Call Tree')
    expect(output).toContain('Recommendations')
  })
})

describe('formatSymgraphJson', () => {
  it('returns valid JSON', () => {
    const result: SymgraphResult = {
      graph: { nodes: new Map(), edges: [] },
      entryPoints: [],
      centralNodes: [],
      leafNodes: [],
      orphans: [],
      longestChains: [],
      stats: {
        totalFunctions: 0, totalEdges: 0, averageCallsPerFunction: 0,
        maxDepth: 0, entryPointCount: 0, centralCount: 0,
        leafCount: 0, orphanCount: 0, graphDensity: 0,
      },
      recommendations: [],
    }
    const json = formatSymgraphJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFunctions).toBe(0)
  })
})
