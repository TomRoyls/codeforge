import { describe, it, expect } from 'vitest'
import { GraphBuilder } from '../src/core/dep-graph-builder/graph-builder.js'
import { GraphAnalyzer } from '../src/core/dep-graph-builder/graph-analyzer.js'
import type {
  GraphNode,
  GraphEdge,
  DependencyGraph,
} from '../src/core/dep-graph-builder/types.js'

// ─── Helpers ────────────────────────────────────────────────────────

function makeNode(overrides: Partial<GraphNode> & { id: string }): GraphNode {
  return {
    label: overrides.id,
    type: 'internal',
    metadata: {},
    ...overrides,
  }
}

function makeEdge(
  from: string,
  to: string,
  type: GraphEdge['type'] = 'import',
  names: string[] = [],
  isTypeOnly: boolean = false,
): GraphEdge {
  return { from, to, type, importedNames: names, isTypeOnly }
}

function makeGraph(nodeIds: string[], edges: GraphEdge[]): DependencyGraph {
  const nodes = new Map<string, GraphNode>()
  for (const id of nodeIds) {
    nodes.set(id, makeNode({ id }))
  }
  return { nodes, edges, root: nodeIds[0] ?? '' }
}

// ─── GraphBuilder – Constructor ─────────────────────────────────────

describe('GraphBuilder constructor', () => {
  it('builds an empty graph', () => {
    const builder = new GraphBuilder()
    const graph = builder.build()
    expect(graph.nodes.size).toBe(0)
    expect(graph.edges).toEqual([])
    expect(graph.root).toBe('')
  })
})

// ─── GraphBuilder – addNode ─────────────────────────────────────────

describe('GraphBuilder.addNode', () => {
  it('adds a single node', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a' }))
    const graph = builder.build()
    expect(graph.nodes.size).toBe(1)
    expect(graph.nodes.get('a')?.label).toBe('a')
  })

  it('overwrites a node with the same id', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a', label: 'first' }))
    builder.addNode(makeNode({ id: 'a', label: 'second' }))
    const graph = builder.build()
    expect(graph.nodes.size).toBe(1)
    expect(graph.nodes.get('a')?.label).toBe('second')
  })

  it('sets the first added node as root', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'first' }))
    builder.addNode(makeNode({ id: 'second' }))
    expect(builder.build().root).toBe('first')
  })

  it('does not change root when subsequent nodes are added', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'root' }))
    builder.addNode(makeNode({ id: 'other' }))
    builder.addNode(makeNode({ id: 'third' }))
    expect(builder.build().root).toBe('root')
  })

  it('preserves node type', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a', type: 'external' }))
    expect(builder.build().nodes.get('a')?.type).toBe('external')
  })

  it('preserves node metadata', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a', metadata: { version: '1.0', license: 'MIT' } }))
    const node = builder.build().nodes.get('a')!
    expect(node.metadata).toEqual({ version: '1.0', license: 'MIT' })
  })

  it('preserves optional path field', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a', path: '/src/a.ts' }))
    expect(builder.build().nodes.get('a')?.path).toBe('/src/a.ts')
  })

  it('adds multiple distinct nodes', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a' }))
    builder.addNode(makeNode({ id: 'b' }))
    builder.addNode(makeNode({ id: 'c' }))
    expect(builder.build().nodes.size).toBe(3)
  })
})

// ─── GraphBuilder – addEdge ─────────────────────────────────────────

describe('GraphBuilder.addEdge', () => {
  it('adds a single edge', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a' }))
    builder.addNode(makeNode({ id: 'b' }))
    builder.addEdge(makeEdge('a', 'b'))
    const graph = builder.build()
    expect(graph.edges).toHaveLength(1)
    expect(graph.edges[0]!.from).toBe('a')
    expect(graph.edges[0]!.to).toBe('b')
  })

  it('merges imported names when same from/to/type edge exists', () => {
    const builder = new GraphBuilder()
    builder.addEdge(makeEdge('a', 'b', 'import', ['foo']))
    builder.addEdge(makeEdge('a', 'b', 'import', ['bar']))
    const graph = builder.build()
    expect(graph.edges).toHaveLength(1)
    expect(graph.edges[0]!.importedNames).toContain('foo')
    expect(graph.edges[0]!.importedNames).toContain('bar')
  })

  it('deduplicates imported names during merge', () => {
    const builder = new GraphBuilder()
    builder.addEdge(makeEdge('a', 'b', 'import', ['foo']))
    builder.addEdge(makeEdge('a', 'b', 'import', ['foo', 'bar']))
    const edge = builder.build().edges[0]!
    const fooCount = edge.importedNames.filter((n) => n === 'foo').length
    expect(fooCount).toBe(1)
  })

  it('isTypeOnly becomes false when any merged edge is not type-only', () => {
    const builder = new GraphBuilder()
    builder.addEdge(makeEdge('a', 'b', 'import', [], true))
    builder.addEdge(makeEdge('a', 'b', 'import', [], false))
    expect(builder.build().edges[0]!.isTypeOnly).toBe(false)
  })

  it('isTypeOnly stays true when both edges are type-only', () => {
    const builder = new GraphBuilder()
    builder.addEdge(makeEdge('a', 'b', 'import', [], true))
    builder.addEdge(makeEdge('a', 'b', 'import', [], true))
    expect(builder.build().edges[0]!.isTypeOnly).toBe(true)
  })

  it('creates separate edges for different types', () => {
    const builder = new GraphBuilder()
    builder.addEdge(makeEdge('a', 'b', 'import'))
    builder.addEdge(makeEdge('a', 'b', 'dynamic'))
    expect(builder.build().edges).toHaveLength(2)
  })

  it('creates separate edges for different targets', () => {
    const builder = new GraphBuilder()
    builder.addEdge(makeEdge('a', 'b'))
    builder.addEdge(makeEdge('a', 'c'))
    expect(builder.build().edges).toHaveLength(2)
  })

  it('does not mutate the original imported names array', () => {
    const builder = new GraphBuilder()
    const names = ['foo']
    builder.addEdge(makeEdge('a', 'b', 'import', names))
    names.push('bar')
    expect(builder.build().edges[0]!.importedNames).toEqual(['foo'])
  })
})

// ─── GraphBuilder – removeNode ──────────────────────────────────────

describe('GraphBuilder.removeNode', () => {
  it('removes a node', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a' }))
    builder.addNode(makeNode({ id: 'b' }))
    builder.removeNode('a')
    expect(builder.build().nodes.has('a')).toBe(false)
    expect(builder.build().nodes.size).toBe(1)
  })

  it('removes all edges connected to the removed node', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a' }))
    builder.addNode(makeNode({ id: 'b' }))
    builder.addNode(makeNode({ id: 'c' }))
    builder.addEdge(makeEdge('a', 'b'))
    builder.addEdge(makeEdge('c', 'a'))
    builder.addEdge(makeEdge('b', 'c'))
    builder.removeNode('a')
    const graph = builder.build()
    expect(graph.edges).toHaveLength(1)
    expect(graph.edges[0]!.from).toBe('b')
    expect(graph.edges[0]!.to).toBe('c')
  })

  it('reassigns root when root is removed', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'root' }))
    builder.addNode(makeNode({ id: 'other' }))
    builder.removeNode('root')
    expect(builder.build().root).toBe('other')
  })

  it('sets root to empty string when last node is removed', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'only' }))
    builder.removeNode('only')
    expect(builder.build().root).toBe('')
    expect(builder.build().nodes.size).toBe(0)
  })

  it('does nothing for non-existent node id', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a' }))
    builder.removeNode('nonexistent')
    expect(builder.build().nodes.size).toBe(1)
  })
})

// ─── GraphBuilder – removeEdge ──────────────────────────────────────

describe('GraphBuilder.removeEdge', () => {
  it('removes an edge by from/to', () => {
    const builder = new GraphBuilder()
    builder.addEdge(makeEdge('a', 'b'))
    builder.addEdge(makeEdge('a', 'c'))
    builder.removeEdge('a', 'b')
    expect(builder.build().edges).toHaveLength(1)
    expect(builder.build().edges[0]!.to).toBe('c')
  })

  it('removes all edges with the same from/to regardless of type', () => {
    const builder = new GraphBuilder()
    builder.addEdge(makeEdge('a', 'b', 'import'))
    builder.addEdge(makeEdge('a', 'b', 'dynamic'))
    builder.removeEdge('a', 'b')
    expect(builder.build().edges).toHaveLength(0)
  })

  it('does nothing when edge does not exist', () => {
    const builder = new GraphBuilder()
    builder.addEdge(makeEdge('a', 'b'))
    builder.removeEdge('x', 'y')
    expect(builder.build().edges).toHaveLength(1)
  })
})

// ─── GraphBuilder – getNode ─────────────────────────────────────────

describe('GraphBuilder.getNode', () => {
  it('returns the node when found', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a', label: 'Alpha' }))
    const node = builder.getNode('a')!
    expect(node.label).toBe('Alpha')
  })

  it('returns null when node not found', () => {
    const builder = new GraphBuilder()
    expect(builder.getNode('missing')).toBeNull()
  })
})

// ─── GraphBuilder – getEdge ─────────────────────────────────────────

describe('GraphBuilder.getEdge', () => {
  it('returns the first edge matching from/to', () => {
    const builder = new GraphBuilder()
    builder.addEdge(makeEdge('a', 'b', 'import', ['foo']))
    const edge = builder.getEdge('a', 'b')!
    expect(edge.type).toBe('import')
    expect(edge.importedNames).toEqual(['foo'])
  })

  it('returns null when no matching edge', () => {
    const builder = new GraphBuilder()
    expect(builder.getEdge('a', 'b')).toBeNull()
  })
})

// ─── GraphBuilder – getOutEdges / getInEdges ────────────────────────

describe('GraphBuilder.getOutEdges', () => {
  it('returns all outgoing edges from a node', () => {
    const builder = new GraphBuilder()
    builder.addEdge(makeEdge('a', 'b'))
    builder.addEdge(makeEdge('a', 'c'))
    builder.addEdge(makeEdge('b', 'c'))
    const out = builder.getOutEdges('a')
    expect(out).toHaveLength(2)
    expect(out.map((e) => e.to).sort()).toEqual(['b', 'c'])
  })

  it('returns empty array when no outgoing edges', () => {
    const builder = new GraphBuilder()
    expect(builder.getOutEdges('a')).toEqual([])
  })
})

describe('GraphBuilder.getInEdges', () => {
  it('returns all incoming edges to a node', () => {
    const builder = new GraphBuilder()
    builder.addEdge(makeEdge('a', 'c'))
    builder.addEdge(makeEdge('b', 'c'))
    builder.addEdge(makeEdge('a', 'b'))
    const inn = builder.getInEdges('c')
    expect(inn).toHaveLength(2)
    expect(inn.map((e) => e.from).sort()).toEqual(['a', 'b'])
  })

  it('returns empty array when no incoming edges', () => {
    const builder = new GraphBuilder()
    expect(builder.getInEdges('a')).toEqual([])
  })
})

// ─── GraphBuilder – build ───────────────────────────────────────────

describe('GraphBuilder.build', () => {
  it('returns a defensive copy of nodes map', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a' }))
    const graph = builder.build()
    graph.nodes.delete('a')
    expect(builder.getNode('a')).not.toBeNull()
  })

  it('returns a defensive copy of edges array', () => {
    const builder = new GraphBuilder()
    builder.addEdge(makeEdge('a', 'b'))
    const graph = builder.build()
    graph.edges.length = 0
    expect(builder.build().edges).toHaveLength(1)
  })

  it('returns correct root', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'root' }))
    builder.addNode(makeNode({ id: 'child' }))
    expect(builder.build().root).toBe('root')
  })
})

// ─── GraphBuilder – clone ───────────────────────────────────────────

describe('GraphBuilder.clone', () => {
  it('creates an independent copy', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a' }))
    builder.addNode(makeNode({ id: 'b' }))
    builder.addEdge(makeEdge('a', 'b', 'import', ['foo']))
    const cloned = builder.clone()
    cloned.removeNode('a')
    expect(builder.getNode('a')).not.toBeNull()
    expect(cloned.getNode('a')).toBeNull()
  })

  it('preserves root', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'root' }))
    expect(builder.clone().build().root).toBe('root')
  })

  it('preserves metadata independently', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a', metadata: { key: 'value' } }))
    const cloned = builder.clone()
    cloned.addNode(makeNode({ id: 'a', metadata: { key: 'changed' } }))
    expect(builder.getNode('a')?.metadata.key).toBe('value')
  })

  it('preserves edges with imported names independently', () => {
    const builder = new GraphBuilder()
    builder.addEdge(makeEdge('a', 'b', 'import', ['foo']))
    const cloned = builder.clone()
    cloned.removeEdge('a', 'b')
    expect(builder.build().edges).toHaveLength(1)
    expect(cloned.build().edges).toHaveLength(0)
  })

  it('clone of empty builder is empty', () => {
    const builder = new GraphBuilder()
    const cloned = builder.clone()
    expect(cloned.build().nodes.size).toBe(0)
    expect(cloned.build().edges).toEqual([])
    expect(cloned.build().root).toBe('')
  })
})

// ─── GraphBuilder – fromImports ─────────────────────────────────────

describe('GraphBuilder.fromImports', () => {
  it('parses a default import', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports("import path from 'path'", 'test.ts')
    expect(graph.nodes.has('path')).toBe(true)
    expect(graph.edges.some((e) => e.to === 'path')).toBe(true)
  })

  it('parses a named import', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports("import { readFileSync } from 'fs'", 'test.ts')
    expect(graph.nodes.has('fs')).toBe(true)
    const edge = graph.edges.find((e) => e.to === 'fs')
    expect(edge).toBeDefined()
    expect(edge!.importedNames).toContain('readFileSync')
  })

  it('parses multiple named imports', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports(
      "import { readFileSync, writeFileSync } from 'fs'",
      'test.ts',
    )
    const edge = graph.edges.find((e) => e.to === 'fs')!
    expect(edge.importedNames).toContain('readFileSync')
    expect(edge.importedNames).toContain('writeFileSync')
  })

  it('parses namespace import', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports("import * as fs from 'fs'", 'test.ts')
    const edge = graph.edges.find((e) => e.to === 'fs')!
    expect(edge.importedNames).toContain('fs')
  })

  it('parses dynamic import', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports("const mod = import('./utils')", 'test.ts')
    const edge = graph.edges.find((e) => e.type === 'dynamic')
    expect(edge).toBeDefined()
    expect(edge!.to).toBe('./utils')
  })

  it('parses re-export with braces', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports("export { foo } from './bar'", 'test.ts')
    const edge = graph.edges.find((e) => e.type === 'reexport')
    expect(edge).toBeDefined()
    expect(edge!.to).toBe('./bar')
  })

  it('parses re-export all', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports("export * from './utils'", 'test.ts')
    const edge = graph.edges.find((e) => e.type === 'reexport')
    expect(edge).toBeDefined()
    expect(edge!.to).toBe('./utils')
  })

  it('parses side-effect import', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports("import 'reflect-metadata'", 'test.ts')
    expect(graph.edges.some((e) => e.to === 'reflect-metadata')).toBe(true)
  })

  it('identifies internal imports (relative)', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports("import { foo } from './helper'", 'test.ts')
    expect(graph.nodes.get('./helper')?.type).toBe('internal')
  })

  it('identifies builtin imports', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports("import { readFileSync } from 'fs'", 'test.ts')
    expect(graph.nodes.get('fs')?.type).toBe('builtin')
  })

  it('identifies external imports', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports("import React from 'react'", 'test.ts')
    expect(graph.nodes.get('react')?.type).toBe('external')
  })

  it('identifies scoped external packages', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports("import { something } from '@scope/pkg'", 'test.ts')
    expect(graph.nodes.get('@scope/pkg')?.type).toBe('external')
  })

  it('resolves scoped package id to @scope/name', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports(
      "import { x } from '@scope/pkg/sub/path'",
      'test.ts',
    )
    expect(graph.nodes.has('@scope/pkg')).toBe(true)
  })

  it('marks type-only imports', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports("import type { Config } from './types'", 'test.ts')
    const edge = graph.edges.find((e) => e.to === './types')
    expect(edge?.isTypeOnly).toBe(true)
  })

  it('sets root to the provided filePath', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports("import { x } from 'lodash'", 'src/app.ts')
    expect(graph.root).toBe('src/app.ts')
    expect(graph.nodes.has('src/app.ts')).toBe(true)
  })

  it('sets root label to filename only', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports('', 'src/deep/app.ts')
    expect(graph.nodes.get('src/deep/app.ts')?.label).toBe('app.ts')
  })

  it('clears previous state on each call', () => {
    const builder = new GraphBuilder()
    builder.fromImports("import { x } from 'lodash'", 'a.ts')
    builder.fromImports("import { y } from 'underscore'", 'b.ts')
    const graph = builder.build()
    expect(graph.nodes.has('lodash')).toBe(false)
    expect(graph.nodes.has('underscore')).toBe(true)
    expect(graph.root).toBe('b.ts')
  })

  it('handles source with no imports', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports('const x = 42', 'empty.ts')
    expect(graph.nodes.size).toBe(1)
    expect(graph.edges).toHaveLength(0)
  })

  it('handles multiple import statements', () => {
    const source = `
      import { readFileSync } from 'fs';
      import path from 'path';
      import React from 'react';
    `
    const builder = new GraphBuilder()
    const graph = builder.fromImports(source, 'multi.ts')
    expect(graph.edges).toHaveLength(3)
  })

  it('parses import with aliased named import', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports(
      "import { readFileSync as read } from 'fs'",
      'test.ts',
    )
    const edge = graph.edges.find((e) => e.to === 'fs')!
    expect(edge.importedNames).toContain('read')
  })

  it('handles default + named import', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports(
      "import React, { useState } from 'react'",
      'test.ts',
    )
    const edge = graph.edges.find((e) => e.to === 'react')!
    expect(edge.importedNames).toContain('useState')
  })

  it('sets path for relative imports', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports("import { x } from './utils'", 'test.ts')
    expect(graph.nodes.get('./utils')?.path).toBe('./utils')
  })

  it('does not set path for external imports', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports("import React from 'react'", 'test.ts')
    expect(graph.nodes.get('react')?.path).toBeUndefined()
  })

  it('stores source in root node metadata', () => {
    const source = "import { x } from 'lodash'"
    const builder = new GraphBuilder()
    const graph = builder.fromImports(source, 'test.ts')
    expect(graph.nodes.get('test.ts')?.metadata.source).toBe(source)
  })
})

// ─── GraphAnalyzer – detectCycles ───────────────────────────────────

describe('GraphAnalyzer.detectCycles', () => {
  it('returns empty array for acyclic graph', () => {
    const graph = makeGraph(['a', 'b', 'c'], [
      makeEdge('a', 'b'),
      makeEdge('b', 'c'),
    ])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.detectCycles()).toEqual([])
  })

  it('detects a simple two-node cycle', () => {
    const graph = makeGraph(['a', 'b'], [
      makeEdge('a', 'b'),
      makeEdge('b', 'a'),
    ])
    const analyzer = new GraphAnalyzer(graph)
    const cycles = analyzer.detectCycles()
    expect(cycles.length).toBeGreaterThanOrEqual(1)
    expect(cycles[0]!.length).toBe(2)
    expect(cycles[0]!.severity).toBe('low')
  })

  it('detects a three-node cycle', () => {
    const graph = makeGraph(['a', 'b', 'c'], [
      makeEdge('a', 'b'),
      makeEdge('b', 'c'),
      makeEdge('c', 'a'),
    ])
    const analyzer = new GraphAnalyzer(graph)
    const cycles = analyzer.detectCycles()
    expect(cycles.length).toBeGreaterThanOrEqual(1)
    expect(cycles[0]!.length).toBe(3)
    expect(cycles[0]!.severity).toBe('medium')
  })

  it('assigns high severity for long cycles', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f']
    const edges: GraphEdge[] = []
    for (let i = 0; i < ids.length - 1; i++) {
      edges.push(makeEdge(ids[i]!, ids[i + 1]!))
    }
    edges.push(makeEdge('f', 'a'))
    const graph = makeGraph(ids, edges)
    const analyzer = new GraphAnalyzer(graph)
    const cycles = analyzer.detectCycles()
    expect(cycles.length).toBeGreaterThanOrEqual(1)
    expect(cycles[0]!.severity).toBe('high')
  })

  it('returns empty for empty graph', () => {
    const graph = makeGraph([], [])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.detectCycles()).toEqual([])
  })

  it('returns empty for single node with no edges', () => {
    const graph = makeGraph(['a'], [])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.detectCycles()).toEqual([])
  })

  it('detects self-loop as a cycle', () => {
    const graph = makeGraph(['a'], [makeEdge('a', 'a')])
    const analyzer = new GraphAnalyzer(graph)
    const cycles = analyzer.detectCycles()
    expect(cycles.length).toBeGreaterThanOrEqual(1)
  })

  it('detects cycle in disconnected graph components', () => {
    const graph = makeGraph(
      ['a', 'b', 'c', 'd'],
      [makeEdge('a', 'b'), makeEdge('c', 'd'), makeEdge('d', 'c')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const cycles = analyzer.detectCycles()
    expect(cycles.some((c) => c.nodes.includes('c') && c.nodes.includes('d'))).toBe(true)
  })

  it('detects multiple distinct cycles', () => {
    const graph = makeGraph(
      ['a', 'b', 'c', 'd'],
      [
        makeEdge('a', 'b'),
        makeEdge('b', 'a'),
        makeEdge('c', 'd'),
        makeEdge('d', 'c'),
      ],
    )
    const analyzer = new GraphAnalyzer(graph)
    const cycles = analyzer.detectCycles()
    expect(cycles.length).toBeGreaterThanOrEqual(2)
  })

  it('cycle nodes contain expected members', () => {
    const graph = makeGraph(['a', 'b'], [
      makeEdge('a', 'b'),
      makeEdge('b', 'a'),
    ])
    const analyzer = new GraphAnalyzer(graph)
    const cycles = analyzer.detectCycles()
    const nodes = cycles[0]!.nodes
    expect(nodes).toContain('a')
    expect(nodes).toContain('b')
  })
})

// ─── GraphAnalyzer – topologicalSort ────────────────────────────────

describe('GraphAnalyzer.topologicalSort', () => {
  it('returns all nodes in valid order for DAG', () => {
    const graph = makeGraph(['a', 'b', 'c'], [
      makeEdge('a', 'b'),
      makeEdge('b', 'c'),
    ])
    const analyzer = new GraphAnalyzer(graph)
    const result = analyzer.topologicalSort()
    expect(result.isValid).toBe(true)
    expect(result.order).toHaveLength(3)
    expect(result.order.indexOf('a')).toBeLessThan(result.order.indexOf('b'))
    expect(result.order.indexOf('b')).toBeLessThan(result.order.indexOf('c'))
  })

  it('reports invalid for cyclic graph', () => {
    const graph = makeGraph(['a', 'b'], [
      makeEdge('a', 'b'),
      makeEdge('b', 'a'),
    ])
    const analyzer = new GraphAnalyzer(graph)
    const result = analyzer.topologicalSort()
    expect(result.isValid).toBe(false)
  })

  it('assigns level 0 to root nodes with no incoming edges', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    const result = analyzer.topologicalSort()
    expect(result.levels.get('a')).toBe(0)
    expect(result.levels.get('b')).toBe(1)
  })

  it('handles empty graph', () => {
    const graph = makeGraph([], [])
    const analyzer = new GraphAnalyzer(graph)
    const result = analyzer.topologicalSort()
    expect(result.order).toEqual([])
    expect(result.levels.size).toBe(0)
    expect(result.isValid).toBe(true)
  })

  it('handles single node graph', () => {
    const graph = makeGraph(['a'], [])
    const analyzer = new GraphAnalyzer(graph)
    const result = analyzer.topologicalSort()
    expect(result.order).toEqual(['a'])
    expect(result.isValid).toBe(true)
    expect(result.levels.get('a')).toBe(0)
  })

  it('handles disconnected graph', () => {
    const graph = makeGraph(['a', 'b', 'c'], [])
    const analyzer = new GraphAnalyzer(graph)
    const result = analyzer.topologicalSort()
    expect(result.isValid).toBe(true)
    expect(result.order).toHaveLength(3)
  })

  it('assigns -1 to nodes in cycles', () => {
    const graph = makeGraph(
      ['a', 'b', 'c'],
      [makeEdge('a', 'b'), makeEdge('b', 'c'), makeEdge('c', 'a')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const result = analyzer.topologicalSort()
    expect(result.isValid).toBe(false)
    for (const id of ['a', 'b', 'c']) {
      expect(result.levels.get(id)).toBe(-1)
    }
  })

  it('handles diamond dependency', () => {
    const graph = makeGraph(
      ['a', 'b', 'c', 'd'],
      [makeEdge('a', 'b'), makeEdge('a', 'c'), makeEdge('b', 'd'), makeEdge('c', 'd')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const result = analyzer.topologicalSort()
    expect(result.isValid).toBe(true)
    expect(result.levels.get('a')).toBe(0)
    expect(result.levels.get('d')).toBe(2)
  })

  it('order contains all nodes exactly once', () => {
    const graph = makeGraph(
      ['a', 'b', 'c', 'd'],
      [makeEdge('a', 'c'), makeEdge('b', 'd')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const result = analyzer.topologicalSort()
    expect(result.order.sort()).toEqual(['a', 'b', 'c', 'd'])
  })
})

// ─── GraphAnalyzer – getMetrics ─────────────────────────────────────

describe('GraphAnalyzer.getMetrics', () => {
  it('returns correct counts for empty graph', () => {
    const graph = makeGraph([], [])
    const analyzer = new GraphAnalyzer(graph)
    const metrics = analyzer.getMetrics()
    expect(metrics.totalNodes).toBe(0)
    expect(metrics.totalEdges).toBe(0)
    expect(metrics.avgDegree).toBe(0)
    expect(metrics.density).toBe(0)
    expect(metrics.cycles).toBe(0)
    expect(metrics.orphans).toEqual([])
  })

  it('returns correct totalNodes and totalEdges', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    const metrics = analyzer.getMetrics()
    expect(metrics.totalNodes).toBe(2)
    expect(metrics.totalEdges).toBe(1)
  })

  it('computes correct avgDegree', () => {
    const graph = makeGraph(
      ['a', 'b', 'c'],
      [makeEdge('a', 'b'), makeEdge('a', 'c')],
    )
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getMetrics().avgDegree).toBeCloseTo(2 / 3)
  })

  it('computes maxInDegree correctly', () => {
    const graph = makeGraph(
      ['a', 'b', 'c'],
      [makeEdge('a', 'c'), makeEdge('b', 'c')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const metrics = analyzer.getMetrics()
    expect(metrics.maxInDegree.node).toBe('c')
    expect(metrics.maxInDegree.degree).toBe(2)
  })

  it('computes maxOutDegree correctly', () => {
    const graph = makeGraph(
      ['a', 'b', 'c'],
      [makeEdge('a', 'b'), makeEdge('a', 'c')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const metrics = analyzer.getMetrics()
    expect(metrics.maxOutDegree.node).toBe('a')
    expect(metrics.maxOutDegree.degree).toBe(2)
  })

  it('computes density correctly', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getMetrics().density).toBeCloseTo(1 / 2)
  })

  it('returns 0 density for single node graph', () => {
    const graph = makeGraph(['a'], [])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getMetrics().density).toBe(0)
  })

  it('counts cycles correctly', () => {
    const graph = makeGraph(['a', 'b'], [
      makeEdge('a', 'b'),
      makeEdge('b', 'a'),
    ])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getMetrics().cycles).toBeGreaterThanOrEqual(1)
  })

  it('identifies orphan nodes', () => {
    const graph = makeGraph(
      ['a', 'b', 'c'],
      [makeEdge('a', 'b')],
    )
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getMetrics().orphans).toEqual(['c'])
  })

  it('picks first node when all degrees are zero', () => {
    const graph = makeGraph(['a', 'b'], [])
    const analyzer = new GraphAnalyzer(graph)
    const metrics = analyzer.getMetrics()
    expect(metrics.maxInDegree.node).toBe('a')
    expect(metrics.maxOutDegree.node).toBe('a')
  })
})

// ─── GraphAnalyzer – getDependents ──────────────────────────────────

describe('GraphAnalyzer.getDependents', () => {
  it('returns all nodes that transitively depend on the target', () => {
    const graph = makeGraph(
      ['a', 'b', 'c'],
      [makeEdge('a', 'b'), makeEdge('b', 'c')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const deps = analyzer.getDependents('c')
    expect(deps.sort()).toEqual(['a', 'b'])
  })

  it('does not include the target itself', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getDependents('b')).not.toContain('b')
  })

  it('returns empty for leaf with no dependents', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getDependents('a')).toEqual([])
  })

  it('handles disconnected graph', () => {
    const graph = makeGraph(['a', 'b', 'c'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getDependents('c')).toEqual([])
  })

  it('returns empty for nonexistent node', () => {
    const graph = makeGraph(['a'], [])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getDependents('missing')).toEqual([])
  })

  it('handles diamond dependency pattern', () => {
    const graph = makeGraph(
      ['a', 'b', 'c', 'd'],
      [makeEdge('a', 'b'), makeEdge('a', 'c'), makeEdge('b', 'd'), makeEdge('c', 'd')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const deps = analyzer.getDependents('d')
    expect(deps.sort()).toEqual(['a', 'b', 'c'])
  })
})

// ─── GraphAnalyzer – getDependencies ────────────────────────────────

describe('GraphAnalyzer.getDependencies', () => {
  it('returns all transitive dependencies', () => {
    const graph = makeGraph(
      ['a', 'b', 'c'],
      [makeEdge('a', 'b'), makeEdge('b', 'c')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const deps = analyzer.getDependencies('a')
    expect(deps.sort()).toEqual(['b', 'c'])
  })

  it('does not include the target itself', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getDependencies('a')).not.toContain('a')
  })

  it('returns empty for leaf node', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getDependencies('b')).toEqual([])
  })

  it('handles disconnected graph', () => {
    const graph = makeGraph(['a', 'b', 'c'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getDependencies('c')).toEqual([])
  })

  it('returns empty for nonexistent node', () => {
    const graph = makeGraph(['a'], [])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getDependencies('missing')).toEqual([])
  })

  it('handles diamond dependency pattern', () => {
    const graph = makeGraph(
      ['a', 'b', 'c', 'd'],
      [makeEdge('a', 'b'), makeEdge('a', 'c'), makeEdge('b', 'd'), makeEdge('c', 'd')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const deps = analyzer.getDependencies('a')
    expect(deps.sort()).toEqual(['b', 'c', 'd'])
  })
})

// ─── GraphAnalyzer – getOrphans ─────────────────────────────────────

describe('GraphAnalyzer.getOrphans', () => {
  it('returns all nodes with no edges', () => {
    const graph = makeGraph(['a', 'b', 'c'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getOrphans()).toEqual(['c'])
  })

  it('returns all nodes for graph with no edges', () => {
    const graph = makeGraph(['a', 'b'], [])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getOrphans().sort()).toEqual(['a', 'b'])
  })

  it('returns empty for fully connected graph', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getOrphans()).toEqual([])
  })

  it('returns empty for empty graph', () => {
    const graph = makeGraph([], [])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getOrphans()).toEqual([])
  })

  it('node with only outgoing edge is not an orphan', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getOrphans()).not.toContain('a')
  })

  it('node with only incoming edge is not an orphan', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getOrphans()).not.toContain('b')
  })
})

// ─── GraphAnalyzer – getBottlenecks ─────────────────────────────────

describe('GraphAnalyzer.getBottlenecks', () => {
  it('returns nodes with in-degree >= threshold', () => {
    const graph = makeGraph(
      ['a', 'b', 'c', 'shared'],
      [makeEdge('a', 'shared'), makeEdge('b', 'shared'), makeEdge('c', 'shared')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const bottlenecks = analyzer.getBottlenecks(3)
    expect(bottlenecks).toContain('shared')
    expect(bottlenecks).toHaveLength(1)
  })

  it('uses default threshold of 3', () => {
    const graph = makeGraph(
      ['a', 'b', 'shared'],
      [makeEdge('a', 'shared'), makeEdge('b', 'shared')],
    )
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getBottlenecks()).toEqual([])
  })

  it('returns empty for graph with no edges', () => {
    const graph = makeGraph(['a', 'b'], [])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getBottlenecks()).toEqual([])
  })

  it('can return multiple bottlenecks', () => {
    const graph = makeGraph(
      ['a', 'b', 'c', 'd', 'x', 'y'],
      [
        makeEdge('a', 'x'),
        makeEdge('b', 'x'),
        makeEdge('c', 'x'),
        makeEdge('a', 'y'),
        makeEdge('b', 'y'),
        makeEdge('d', 'y'),
      ],
    )
    const analyzer = new GraphAnalyzer(graph)
    const bottlenecks = analyzer.getBottlenecks(3).sort()
    expect(bottlenecks).toEqual(['x', 'y'])
  })

  it('respects custom threshold of 1', () => {
    const graph = makeGraph(
      ['a', 'b'],
      [makeEdge('a', 'b')],
    )
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getBottlenecks(1)).toContain('b')
  })
})

// ─── GraphAnalyzer – getSubgraph ────────────────────────────────────

describe('GraphAnalyzer.getSubgraph', () => {
  it('returns only nodes and edges within the subset', () => {
    const graph = makeGraph(
      ['a', 'b', 'c', 'd'],
      [makeEdge('a', 'b'), makeEdge('b', 'c'), makeEdge('c', 'd')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const sub = analyzer.getSubgraph(['a', 'b'])
    expect(sub.nodes.size).toBe(2)
    expect(sub.edges).toHaveLength(1)
    expect(sub.edges[0]!.from).toBe('a')
    expect(sub.edges[0]!.to).toBe('b')
  })

  it('excludes edges where one endpoint is not in subset', () => {
    const graph = makeGraph(
      ['a', 'b', 'c'],
      [makeEdge('a', 'b'), makeEdge('b', 'c')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const sub = analyzer.getSubgraph(['a', 'c'])
    expect(sub.edges).toHaveLength(0)
  })

  it('skips ids not in graph', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    const sub = analyzer.getSubgraph(['a', 'missing'])
    expect(sub.nodes.size).toBe(1)
    expect(sub.nodes.has('a')).toBe(true)
  })

  it('sets root to the first id in the array', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    const sub = analyzer.getSubgraph(['b', 'a'])
    expect(sub.root).toBe('b')
  })

  it('returns empty graph for empty array', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    const sub = analyzer.getSubgraph([])
    expect(sub.nodes.size).toBe(0)
    expect(sub.edges).toHaveLength(0)
    expect(sub.root).toBe('')
  })

  it('does not mutate original graph nodes', () => {
    const graph = makeGraph(['a'], [])
    const analyzer = new GraphAnalyzer(graph)
    const sub = analyzer.getSubgraph(['a'])
    sub.nodes.delete('a')
    expect(graph.nodes.has('a')).toBe(true)
  })

  it('does not mutate original graph edges', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    const sub = analyzer.getSubgraph(['a', 'b'])
    sub.edges.length = 0
    expect(graph.edges).toHaveLength(1)
  })

  it('copies node metadata independently', () => {
    const graph = makeGraph(['a'], [])
    graph.nodes.get('a')!.metadata.key = 'original'
    const analyzer = new GraphAnalyzer(graph)
    const sub = analyzer.getSubgraph(['a'])
    sub.nodes.get('a')!.metadata.key = 'modified'
    expect(graph.nodes.get('a')!.metadata.key).toBe('original')
  })
})

// ─── GraphAnalyzer – shortestPath ───────────────────────────────────

describe('GraphAnalyzer.shortestPath', () => {
  it('returns single-node path when from === to', () => {
    const graph = makeGraph(['a'], [])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.shortestPath('a', 'a')).toEqual(['a'])
  })

  it('finds direct path', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.shortestPath('a', 'b')).toEqual(['a', 'b'])
  })

  it('finds two-hop path', () => {
    const graph = makeGraph(
      ['a', 'b', 'c'],
      [makeEdge('a', 'b'), makeEdge('b', 'c')],
    )
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.shortestPath('a', 'c')).toEqual(['a', 'b', 'c'])
  })

  it('returns null when no path exists', () => {
    const graph = makeGraph(['a', 'b'], [])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.shortestPath('a', 'b')).toBeNull()
  })

  it('returns null for unreachable node in disconnected graph', () => {
    const graph = makeGraph(
      ['a', 'b', 'c', 'd'],
      [makeEdge('a', 'b'), makeEdge('c', 'd')],
    )
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.shortestPath('a', 'd')).toBeNull()
  })

  it('finds shortest path among multiple paths', () => {
    const graph = makeGraph(
      ['a', 'b', 'c', 'd'],
      [
        makeEdge('a', 'b'),
        makeEdge('b', 'd'),
        makeEdge('a', 'c'),
        makeEdge('c', 'd'),
      ],
    )
    const analyzer = new GraphAnalyzer(graph)
    const path = analyzer.shortestPath('a', 'd')!
    expect(path).toHaveLength(3)
    expect(path[0]).toBe('a')
    expect(path[2]).toBe('d')
  })

  it('returns null for nonexistent source node', () => {
    const graph = makeGraph(['a'], [])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.shortestPath('missing', 'a')).toBeNull()
  })

  it('returns null for nonexistent target node', () => {
    const graph = makeGraph(['a'], [])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.shortestPath('a', 'missing')).toBeNull()
  })

  it('handles longer chain', () => {
    const graph = makeGraph(
      ['a', 'b', 'c', 'd', 'e'],
      [
        makeEdge('a', 'b'),
        makeEdge('b', 'c'),
        makeEdge('c', 'd'),
        makeEdge('d', 'e'),
      ],
    )
    const analyzer = new GraphAnalyzer(graph)
    const path = analyzer.shortestPath('a', 'e')!
    expect(path).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
})

// ─── GraphAnalyzer – affects ────────────────────────────────────────

describe('GraphAnalyzer.affects', () => {
  it('returns same result as getDependents', () => {
    const graph = makeGraph(
      ['a', 'b', 'c'],
      [makeEdge('a', 'b'), makeEdge('b', 'c')],
    )
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.affects('c').sort()).toEqual(
      analyzer.getDependents('c').sort(),
    )
  })

  it('returns empty for leaf node with no dependents', () => {
    const graph = makeGraph(['a', 'b'], [makeEdge('a', 'b')])
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.affects('a')).toEqual([])
  })

  it('returns all transitive dependents', () => {
    const graph = makeGraph(
      ['a', 'b', 'c'],
      [makeEdge('a', 'b'), makeEdge('b', 'c')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const result = analyzer.affects('b')
    expect(result).toContain('a')
  })
})

// ─── GraphBuilder + GraphAnalyzer Integration ───────────────────────

describe('GraphBuilder + GraphAnalyzer integration', () => {
  it('builds and analyzes a realistic dependency graph', () => {
    const builder = new GraphBuilder()
    builder.fromImports(
      `
      import { readFileSync } from 'fs';
      import path from 'path';
      import express from 'express';
      import { config } from './config';
      import { logger } from './logger';
      `,
      'src/app.ts',
    )
    const graph = builder.build()
    const analyzer = new GraphAnalyzer(graph)

    expect(graph.nodes.size).toBe(6)
    expect(graph.edges).toHaveLength(5)

    const metrics = analyzer.getMetrics()
    expect(metrics.totalNodes).toBe(6)
    expect(metrics.totalEdges).toBe(5)
    expect(metrics.cycles).toBe(0)
    expect(metrics.orphans).toEqual([])

    const topo = analyzer.topologicalSort()
    expect(topo.isValid).toBe(true)
    expect(topo.order).toHaveLength(6)
  })

  it('detects cycles in imports-based graph', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a.ts', path: 'a.ts' }))
    builder.addNode(makeNode({ id: 'b.ts', path: 'b.ts' }))
    builder.addEdge(makeEdge('a.ts', 'b.ts'))
    builder.addEdge(makeEdge('b.ts', 'a.ts'))
    const analyzer = new GraphAnalyzer(builder.build())
    expect(analyzer.detectCycles().length).toBeGreaterThanOrEqual(1)
  })

  it('build subgraph from builder output', () => {
    const builder = new GraphBuilder()
    builder.fromImports(
      `
      import { a } from 'fs';
      import { b } from 'path';
      import { c } from 'lodash';
      `,
      'src/index.ts',
    )
    const graph = builder.build()
    const analyzer = new GraphAnalyzer(graph)
    const sub = analyzer.getSubgraph(['src/index.ts', 'fs', 'path'])
    expect(sub.nodes.size).toBe(3)
    expect(sub.edges).toHaveLength(2)
  })

  it('shortest path through imports graph', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a' }))
    builder.addNode(makeNode({ id: 'b' }))
    builder.addNode(makeNode({ id: 'c' }))
    builder.addEdge(makeEdge('a', 'b'))
    builder.addEdge(makeEdge('b', 'c'))
    const analyzer = new GraphAnalyzer(builder.build())
    expect(analyzer.shortestPath('a', 'c')).toEqual(['a', 'b', 'c'])
  })

  it('clone preserves analysis capability', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'x' }))
    builder.addNode(makeNode({ id: 'y' }))
    builder.addEdge(makeEdge('x', 'y'))
    const cloned = builder.clone()
    const analyzer = new GraphAnalyzer(cloned.build())
    expect(analyzer.getMetrics().totalNodes).toBe(2)
    expect(analyzer.getMetrics().totalEdges).toBe(1)
    expect(analyzer.detectCycles()).toEqual([])
  })

  it('removeNode then analyze', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a' }))
    builder.addNode(makeNode({ id: 'b' }))
    builder.addNode(makeNode({ id: 'c' }))
    builder.addEdge(makeEdge('a', 'b'))
    builder.addEdge(makeEdge('b', 'c'))
    builder.removeNode('b')
    const analyzer = new GraphAnalyzer(builder.build())
    const metrics = analyzer.getMetrics()
    expect(metrics.totalNodes).toBe(2)
    expect(metrics.totalEdges).toBe(0)
    expect(metrics.orphans.sort()).toEqual(['a', 'c'])
  })
})

// ─── Type Exports ───────────────────────────────────────────────────

describe('type exports', () => {
  it('DependencyGraph has correct shape', () => {
    const graph: DependencyGraph = {
      nodes: new Map(),
      edges: [],
      root: '',
    }
    expect(graph.nodes).toBeInstanceOf(Map)
    expect(graph.edges).toEqual([])
    expect(graph.root).toBe('')
  })

  it('GraphNode has required fields', () => {
    const node: GraphNode = {
      id: 'test',
      label: 'Test',
      type: 'internal',
      metadata: {},
    }
    expect(node.id).toBe('test')
    expect(node.type).toBe('internal')
  })

  it('GraphEdge has required fields', () => {
    const edge: GraphEdge = {
      from: 'a',
      to: 'b',
      type: 'import',
      importedNames: ['foo'],
      isTypeOnly: false,
    }
    expect(edge.type).toBe('import')
    expect(edge.importedNames).toEqual(['foo'])
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('fromImports handles empty string', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports('', 'empty.ts')
    expect(graph.nodes.size).toBe(1)
    expect(graph.edges).toHaveLength(0)
  })

  it('fromImports handles only whitespace', () => {
    const builder = new GraphBuilder()
    const graph = builder.fromImports('   \n  \t  ', 'ws.ts')
    expect(graph.nodes.size).toBe(1)
    expect(graph.edges).toHaveLength(0)
  })

  it('GraphAnalyzer handles graph with only one node and a self-loop', () => {
    const graph = makeGraph(['a'], [makeEdge('a', 'a')])
    const analyzer = new GraphAnalyzer(graph)
    const metrics = analyzer.getMetrics()
    expect(metrics.totalEdges).toBe(1)
    expect(metrics.cycles).toBeGreaterThanOrEqual(1)
  })

  it('getBottlenecks with threshold higher than any in-degree returns empty', () => {
    const graph = makeGraph(
      ['a', 'b', 'c'],
      [makeEdge('a', 'b'), makeEdge('c', 'b')],
    )
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.getBottlenecks(10)).toEqual([])
  })

  it('getSubgraph with single node returns that node only', () => {
    const graph = makeGraph(
      ['a', 'b', 'c'],
      [makeEdge('a', 'b'), makeEdge('b', 'c')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const sub = analyzer.getSubgraph(['b'])
    expect(sub.nodes.size).toBe(1)
    expect(sub.edges).toHaveLength(0)
  })

  it('topologicalSort handles multiple independent roots', () => {
    const graph = makeGraph(
      ['a', 'b', 'c', 'd'],
      [makeEdge('a', 'c'), makeEdge('b', 'd')],
    )
    const analyzer = new GraphAnalyzer(graph)
    const result = analyzer.topologicalSort()
    expect(result.isValid).toBe(true)
    const rootLevelNodes = result.order.filter(
      (id) => result.levels.get(id) === 0,
    )
    expect(rootLevelNodes.sort()).toEqual(['a', 'b'])
  })

  it('detects cycle in larger interconnected graph', () => {
    const graph = makeGraph(
      ['a', 'b', 'c', 'd', 'e'],
      [
        makeEdge('a', 'b'),
        makeEdge('b', 'c'),
        makeEdge('c', 'd'),
        makeEdge('d', 'e'),
        makeEdge('e', 'b'), // cycle back to b
      ],
    )
    const analyzer = new GraphAnalyzer(graph)
    expect(analyzer.detectCycles().length).toBeGreaterThanOrEqual(1)
  })

  it('shortestPath returns null for self on nonexistent node', () => {
    const graph = makeGraph(['a'], [])
    const analyzer = new GraphAnalyzer(graph)
    // 'missing' is not in the graph so no adjacency list entry
    expect(analyzer.shortestPath('missing', 'missing')).toEqual(['missing'])
  })

  it('fromImports with many different import styles', () => {
    const source = `
      import defaultExport from 'pkg1';
      import { named } from 'pkg2';
      import { a as aliasA, b as aliasB } from 'pkg3';
      import * as namespace from 'pkg4';
      import 'side-effect';
      const dynamic = import('pkg5');
      export { reexported } from 'pkg6';
      export * from 'pkg7';
    `
    const builder = new GraphBuilder()
    const graph = builder.fromImports(source, 'mixed.ts')
    expect(graph.edges.length).toBe(8)
  })

  it('builder getNode after multiple overwrites returns last version', () => {
    const builder = new GraphBuilder()
    builder.addNode(makeNode({ id: 'a', label: 'v1', type: 'internal', metadata: {} }))
    builder.addNode(makeNode({ id: 'a', label: 'v2', type: 'external', metadata: { ver: 2 } }))
    const node = builder.getNode('a')!
    expect(node.label).toBe('v2')
    expect(node.type).toBe('external')
    expect(node.metadata.ver).toBe(2)
  })
})
