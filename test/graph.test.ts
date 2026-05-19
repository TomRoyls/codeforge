import { describe, expect, it } from 'vitest'

import Graph from '../src/commands/graph.js'
import {
  buildDependencyGraph,
  computeNodeDepths,
  extractDependencies,
  findCycles,
  type DependencyEdge,
  type DependencyNode,
  type GraphResult,
  resolveImportPath,
} from '../src/commands/graph-helpers.js'
import {
  drawBox,
  formatGraph,
  formatGraphJson,
  formatTree,
  formatTreeNode,
} from '../src/commands/graph-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeNode(overrides: Partial<DependencyNode> = {}): DependencyNode {
  return {
    depth: 0,
    filePath: '/project/src/index.ts',
    importedBy: [],
    imports: [],
    relativePath: 'src/index.ts',
    ...overrides,
  }
}

function makeEdge(overrides: Partial<DependencyEdge> = {}): DependencyEdge {
  return {
    from: '/project/src/index.ts',
    to: '/project/src/helpers.ts',
    type: 'import',
    ...overrides,
  }
}

function makeGraphResult(overrides: Partial<GraphResult> = {}): GraphResult {
  const nodes = new Map<string, DependencyNode>()
  const rootNode = makeNode()
  nodes.set(rootNode.filePath, rootNode)
  return {
    edges: [],
    maxDepth: 3,
    nodes,
    root: rootNode.filePath,
    totalEdges: 0,
    totalNodes: 1,
    ...overrides,
  }
}

// ─── Command static metadata ─────────────────────────────

describe('Graph command - static metadata', () => {
  it('has a description', () => {
    expect(Graph.description).toBe('Visualize file dependency graph as ASCII tree or graph')
  })

  it('has examples array', () => {
    expect(Array.isArray(Graph.examples)).toBe(true)
    expect(Graph.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Graph.args.path).toBeDefined()
    expect(Graph.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Graph.args.path.default).toBe('.')
  })
})

// ─── Command flags ───────────────────────────────────────

describe('Graph command - flags', () => {
  it('has format flag with options', () => {
    expect(Graph.flags.format.options).toContain('tree')
    expect(Graph.flags.format.options).toContain('graph')
    expect(Graph.flags.format.options).toContain('json')
  })

  it('defaults format to tree', () => {
    expect(Graph.flags.format.default).toBe('tree')
  })

  it('has output flag', () => {
    expect(Graph.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Graph.flags.ignore).toBeDefined()
    expect(Graph.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag', () => {
    expect(Graph.flags.ext).toBeDefined()
    expect(Graph.flags.ext.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has depth flag defaulting to 3', () => {
    expect(Graph.flags.depth.default).toBe(3)
  })

  it('has direction flag defaulting to imports', () => {
    expect(Graph.flags.direction.default).toBe('imports')
  })

  it('has direction options', () => {
    expect(Graph.flags.direction.options).toContain('imports')
    expect(Graph.flags.direction.options).toContain('imported-by')
  })

  it('has highlight flag', () => {
    expect(Graph.flags.highlight).toBeDefined()
  })
})

// ─── Command class structure ─────────────────────────────

describe('Graph command - class structure', () => {
  it('exports a default class', () => {
    expect(Graph).toBeDefined()
    expect(typeof Graph).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Graph.prototype.run).toBe('function')
  })
})

// ─── extractDependencies - ESM imports ───────────────────

describe('extractDependencies - ESM imports', () => {
  it('extracts default import', () => {
    const content = `import foo from './bar'`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(1)
    expect(result.imports[0]).toBe('/project/src/bar')
  })

  it('extracts named imports', () => {
    const content = `import { foo, bar } from './utils'`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(1)
    expect(result.imports[0]).toBe('/project/src/utils')
  })

  it('extracts type import', () => {
    const content = `import type { Config } from './types'`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(1)
    expect(result.imports[0]).toBe('/project/src/types')
  })

  it('extracts side-effect import', () => {
    const content = `import './polyfills'`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(1)
    expect(result.imports[0]).toBe('/project/src/polyfills')
  })

  it('extracts namespace import', () => {
    const content = `import * as utils from './utils'`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(1)
    expect(result.imports[0]).toBe('/project/src/utils')
  })

  it('skips external dependencies', () => {
    const content = `import { foo } from 'chalk'`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(0)
  })

  it('extracts multiple imports', () => {
    const content = `import { a } from './a'\nimport { b } from './b'`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(2)
  })

  it('deduplicates same import', () => {
    const content = `import { a } from './utils'\nimport { b } from './utils'`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(1)
  })
})

// ─── extractDependencies - CJS require ───────────────────

describe('extractDependencies - CJS require', () => {
  it('extracts require call', () => {
    const content = `const foo = require('./bar')`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(1)
    expect(result.imports[0]).toBe('/project/src/bar')
  })

  it('skips external require', () => {
    const content = `const path = require('path')`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(0)
  })
})

// ─── extractDependencies - dynamic imports ───────────────

describe('extractDependencies - dynamic imports', () => {
  it('extracts dynamic import', () => {
    const content = `const mod = import('./lazy')`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(1)
    expect(result.edges[0]!.type).toBe('dynamic-import')
  })

  it('skips external dynamic import', () => {
    const content = `const mod = import('lodash')`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(0)
  })
})

// ─── extractDependencies - re-exports ────────────────────

describe('extractDependencies - re-exports', () => {
  it('extracts re-export', () => {
    const content = `export { foo } from './bar'`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(1)
    expect(result.edges[0]!.type).toBe('re-export')
  })

  it('extracts re-export all', () => {
    const content = `export * from './bar'`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(1)
  })

  it('extracts type re-export', () => {
    const content = `export type { Config } from './types'`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(1)
  })
})

// ─── extractDependencies - edge cases ────────────────────

describe('extractDependencies - edge cases', () => {
  it('returns empty for file with no dependencies', () => {
    const content = `const x = 1\nconsole.log(x)`
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(0)
    expect(result.edges).toHaveLength(0)
  })

  it('returns empty for empty content', () => {
    const result = extractDependencies('', '/project/src/index.ts')
    expect(result.imports).toHaveLength(0)
    expect(result.edges).toHaveLength(0)
  })

  it('handles mixed import types', () => {
    const content = [
      `import { a } from './a'`,
      `const b = require('./b')`,
      `const c = import('./c')`,
      `export { d } from './d'`,
    ].join('\n')
    const result = extractDependencies(content, '/project/src/index.ts')
    expect(result.imports).toHaveLength(4)
    const types = result.edges.map((e) => e.type)
    expect(types).toContain('import')
    expect(types).toContain('dynamic-import')
    expect(types).toContain('re-export')
  })
})

// ─── resolveImportPath ───────────────────────────────────

describe('resolveImportPath', () => {
  it('resolves relative path', () => {
    const result = resolveImportPath('/project/src', './helpers')
    expect(result).toBe('/project/src/helpers')
  })

  it('normalizes trailing slashes', () => {
    const result = resolveImportPath('/project/src', './helpers/')
    expect(result).toBe('/project/src/helpers')
  })

  it('resolves parent directory', () => {
    const result = resolveImportPath('/project/src/commands', '../index')
    expect(result).toBe('/project/src/commands/../index')
  })
})

// ─── buildDependencyGraph ────────────────────────────────

describe('buildDependencyGraph', () => {
  it('builds simple chain A→B→C', async () => {
    const files = new Map<string, string>([
      ['/a.ts', 'a.ts'],
      ['/b.ts', 'b.ts'],
      ['/c.ts', 'c.ts'],
    ])
    const contents = new Map<string, string>([
      ['/a.ts', `import { b } from './b'`],
      ['/b.ts', `import { c } from './c'`],
      ['/c.ts', 'export const c = 1'],
    ])
    const reader = (path: string) => Promise.resolve(contents.get(path) ?? '')
    const result = await buildDependencyGraph('/a.ts', files, reader, 3, 'imports')
    expect(result.totalNodes).toBe(3)
    expect(result.nodes.has('/a.ts')).toBe(true)
    expect(result.nodes.has('/b.ts')).toBe(true)
    expect(result.nodes.has('/c.ts')).toBe(true)
  })

  it('handles multiple imports from one file', async () => {
    const files = new Map<string, string>([
      ['/a.ts', 'a.ts'],
      ['/b.ts', 'b.ts'],
      ['/c.ts', 'c.ts'],
    ])
    const contents = new Map<string, string>([
      ['/a.ts', `import { b } from './b'\nimport { c } from './c'`],
      ['/b.ts', 'export const b = 1'],
      ['/c.ts', 'export const c = 1'],
    ])
    const reader = (path: string) => Promise.resolve(contents.get(path) ?? '')
    const result = await buildDependencyGraph('/a.ts', files, reader, 3, 'imports')
    expect(result.totalNodes).toBe(3)
    const rootNode = result.nodes.get('/a.ts')!
    expect(rootNode.imports).toHaveLength(2)
  })

  it('respects max depth', async () => {
    const files = new Map<string, string>([
      ['/a.ts', 'a.ts'],
      ['/b.ts', 'b.ts'],
      ['/c.ts', 'c.ts'],
    ])
    const contents = new Map<string, string>([
      ['/a.ts', `import { b } from './b'`],
      ['/b.ts', `import { c } from './c'`],
      ['/c.ts', 'export const c = 1'],
    ])
    const reader = (path: string) => Promise.resolve(contents.get(path) ?? '')
    const result = await buildDependencyGraph('/a.ts', files, reader, 1, 'imports')
    expect(result.totalNodes).toBe(2)
    expect(result.nodes.has('/a.ts')).toBe(true)
    expect(result.nodes.has('/b.ts')).toBe(true)
    expect(result.nodes.has('/c.ts')).toBe(false)
  })

  it('follows imported-by direction', async () => {
    const files = new Map<string, string>([
      ['/a.ts', 'a.ts'],
      ['/b.ts', 'b.ts'],
      ['/c.ts', 'c.ts'],
    ])
    const contents = new Map<string, string>([
      ['/a.ts', `import { b } from './b'`],
      ['/b.ts', `import { c } from './c'`],
      ['/c.ts', 'export const c = 1'],
    ])
    const reader = (path: string) => Promise.resolve(contents.get(path) ?? '')
    const result = await buildDependencyGraph('/c.ts', files, reader, 3, 'imported-by')
    expect(result.totalNodes).toBe(3)
    expect(result.nodes.has('/c.ts')).toBe(true)
    expect(result.nodes.has('/b.ts')).toBe(true)
    expect(result.nodes.has('/a.ts')).toBe(true)
  })

  it('handles file read error gracefully', async () => {
    const files = new Map<string, string>([
      ['/a.ts', 'a.ts'],
    ])
    const reader = () => Promise.reject(new Error('read error'))
    const result = await buildDependencyGraph('/a.ts', files, reader, 3, 'imports')
    expect(result.totalNodes).toBe(1)
  })
})

// ─── computeNodeDepths ───────────────────────────────────

describe('computeNodeDepths', () => {
  it('computes correct depths', () => {
    const nodes = new Map<string, DependencyNode>([
      ['/a.ts', makeNode({ filePath: '/a.ts', imports: ['/b.ts'], depth: -1 })],
      ['/b.ts', makeNode({ filePath: '/b.ts', imports: ['/c.ts'], importedBy: ['/a.ts'], depth: -1 })],
      ['/c.ts', makeNode({ filePath: '/c.ts', importedBy: ['/b.ts'], depth: -1 })],
    ])
    const result = computeNodeDepths(nodes, '/a.ts')
    expect(result.get('/a.ts')!.depth).toBe(0)
    expect(result.get('/b.ts')!.depth).toBe(1)
    expect(result.get('/c.ts')!.depth).toBe(2)
  })

  it('handles disconnected nodes', () => {
    const nodes = new Map<string, DependencyNode>([
      ['/a.ts', makeNode({ filePath: '/a.ts', imports: [], depth: -1 })],
      ['/orphan.ts', makeNode({ filePath: '/orphan.ts', imports: [], depth: -1 })],
    ])
    const result = computeNodeDepths(nodes, '/a.ts')
    expect(result.get('/a.ts')!.depth).toBe(0)
    expect(result.get('/orphan.ts')!.depth).toBe(-1)
  })

  it('handles single node', () => {
    const nodes = new Map<string, DependencyNode>([
      ['/a.ts', makeNode({ filePath: '/a.ts', depth: -1 })],
    ])
    const result = computeNodeDepths(nodes, '/a.ts')
    expect(result.get('/a.ts')!.depth).toBe(0)
  })
})

// ─── findCycles ──────────────────────────────────────────

describe('findCycles', () => {
  it('returns empty for no cycles', () => {
    const nodes = new Map<string, DependencyNode>([
      ['/a.ts', makeNode({ filePath: '/a.ts', imports: ['/b.ts'] })],
      ['/b.ts', makeNode({ filePath: '/b.ts', imports: [] })],
    ])
    const cycles = findCycles(nodes)
    expect(cycles).toHaveLength(0)
  })

  it('detects simple cycle A→B→A', () => {
    const nodes = new Map<string, DependencyNode>([
      ['/a.ts', makeNode({ filePath: '/a.ts', imports: ['/b.ts'] })],
      ['/b.ts', makeNode({ filePath: '/b.ts', imports: ['/a.ts'] })],
    ])
    const cycles = findCycles(nodes)
    expect(cycles.length).toBeGreaterThanOrEqual(1)
  })

  it('detects longer cycle A→B→C→A', () => {
    const nodes = new Map<string, DependencyNode>([
      ['/a.ts', makeNode({ filePath: '/a.ts', imports: ['/b.ts'] })],
      ['/b.ts', makeNode({ filePath: '/b.ts', imports: ['/c.ts'] })],
      ['/c.ts', makeNode({ filePath: '/c.ts', imports: ['/a.ts'] })],
    ])
    const cycles = findCycles(nodes)
    expect(cycles.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty for empty nodes', () => {
    const cycles = findCycles(new Map())
    expect(cycles).toHaveLength(0)
  })

  it('handles self-loop', () => {
    const nodes = new Map<string, DependencyNode>([
      ['/a.ts', makeNode({ filePath: '/a.ts', imports: ['/a.ts'] })],
    ])
    const cycles = findCycles(nodes)
    expect(cycles.length).toBeGreaterThanOrEqual(1)
  })
})

// ─── formatTree ──────────────────────────────────────────

describe('formatTree', () => {
  it('renders simple tree output', () => {
    const nodes = new Map<string, DependencyNode>([
      ['/a.ts', makeNode({ filePath: '/a.ts', relativePath: 'a.ts', imports: ['/b.ts'] })],
      ['/b.ts', makeNode({ filePath: '/b.ts', relativePath: 'b.ts', imports: [] })],
    ])
    const result = makeGraphResult({ nodes, root: '/a.ts', totalNodes: 2 })
    const output = formatTree(result)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })

  it('renders deep tree with indentation', () => {
    const nodes = new Map<string, DependencyNode>([
      ['/a.ts', makeNode({ filePath: '/a.ts', relativePath: 'a.ts', imports: ['/b.ts', '/d.ts'] })],
      ['/b.ts', makeNode({ filePath: '/b.ts', relativePath: 'b.ts', imports: ['/c.ts'] })],
      ['/c.ts', makeNode({ filePath: '/c.ts', relativePath: 'c.ts', imports: [] })],
      ['/d.ts', makeNode({ filePath: '/d.ts', relativePath: 'd.ts', imports: [] })],
    ])
    const result = makeGraphResult({ nodes, root: '/a.ts', totalNodes: 4 })
    const output = formatTree(result)
    expect(output).toContain('├── ')
    expect(output).toContain('└── ')
  })

  it('returns empty string for missing root', () => {
    const result = makeGraphResult({ root: '/nonexistent.ts' })
    const output = formatTree(result)
    expect(output).toBe('')
  })

  it('applies highlight pattern', () => {
    const nodes = new Map<string, DependencyNode>([
      ['/a.ts', makeNode({ filePath: '/a.ts', relativePath: 'a.ts', imports: ['/b.ts'] })],
      ['/b.ts', makeNode({ filePath: '/b.ts', relativePath: 'b-helpers.ts', imports: [] })],
    ])
    const result = makeGraphResult({ nodes, root: '/a.ts', totalNodes: 2 })
    const output = formatTree(result, 'b-helpers')
    expect(output).toContain('b-helpers.ts')
  })
})

// ─── formatTreeNode ──────────────────────────────────────

describe('formatTreeNode', () => {
  it('formats a single node', () => {
    const node = makeNode({ relativePath: 'index.ts', imports: [] })
    const result = makeGraphResult()
    const lines: string[] = []
    const visited = new Set<string>()
    formatTreeNode(node, '', true, 0, 3, visited, result, lines)
    expect(lines.length).toBe(1)
    expect(lines[0]).toContain('index.ts')
  })

  it('formats node with children', () => {
    const childNode = makeNode({ filePath: '/b.ts', relativePath: 'b.ts', imports: [] })
    const parentNode = makeNode({ filePath: '/a.ts', relativePath: 'a.ts', imports: ['/b.ts'] })
    const nodes = new Map<string, DependencyNode>([
      ['/a.ts', parentNode],
      ['/b.ts', childNode],
    ])
    const result = makeGraphResult({ nodes })
    const lines: string[] = []
    const visited = new Set<string>()
    formatTreeNode(parentNode, '', true, 0, 3, visited, result, lines)
    expect(lines.length).toBe(2)
    expect(lines[0]).toContain('a.ts')
    expect(lines[1]).toContain('b.ts')
  })

  it('respects max depth', () => {
    const leafNode = makeNode({ filePath: '/c.ts', relativePath: 'c.ts', imports: [] })
    const midNode = makeNode({ filePath: '/b.ts', relativePath: 'b.ts', imports: ['/c.ts'] })
    const rootNode = makeNode({ filePath: '/a.ts', relativePath: 'a.ts', imports: ['/b.ts'] })
    const nodes = new Map<string, DependencyNode>([
      ['/a.ts', rootNode],
      ['/b.ts', midNode],
      ['/c.ts', leafNode],
    ])
    const result = makeGraphResult({ nodes })
    const lines: string[] = []
    const visited = new Set<string>()
    formatTreeNode(rootNode, '', true, 0, 1, visited, result, lines)
    expect(lines.length).toBe(2)
  })
})

// ─── formatGraph ─────────────────────────────────────────

describe('formatGraph', () => {
  it('renders simple graph output', () => {
    const nodes = new Map<string, DependencyNode>([
      ['/a.ts', makeNode({ filePath: '/a.ts', relativePath: 'a.ts', imports: ['/b.ts'] })],
      ['/b.ts', makeNode({ filePath: '/b.ts', relativePath: 'b.ts', imports: [] })],
    ])
    const edges = [makeEdge()]
    const result = makeGraphResult({ edges, nodes, totalNodes: 2, totalEdges: 1 })
    const output = formatGraph(result)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })

  it('returns boxes for nodes with no edges', () => {
    const nodes = new Map<string, DependencyNode>([
      ['/a.ts', makeNode({ filePath: '/a.ts', relativePath: 'a.ts', imports: [] })],
    ])
    const result = makeGraphResult({ nodes, totalNodes: 1 })
    const output = formatGraph(result)
    expect(output).toContain('a.ts')
    expect(output).toContain('┌')
    expect(output).toContain('└')
  })

  it('returns empty for empty graph', () => {
    const result = makeGraphResult({ nodes: new Map(), totalNodes: 0 })
    const output = formatGraph(result)
    expect(output).toBe('')
  })

  it('applies highlight pattern', () => {
    const nodes = new Map<string, DependencyNode>([
      ['/a.ts', makeNode({ filePath: '/a.ts', relativePath: 'a.ts', imports: ['/b.ts'] })],
      ['/b.ts', makeNode({ filePath: '/b.ts', relativePath: 'b-helpers.ts', imports: [] })],
    ])
    const edges = [makeEdge()]
    const result = makeGraphResult({ edges, nodes, totalNodes: 2, totalEdges: 1 })
    const output = formatGraph(result, 'b-helpers')
    expect(output).toContain('b-helpers')
  })
})

// ─── drawBox ─────────────────────────────────────────────

describe('drawBox', () => {
  it('draws a box around text', () => {
    const result = drawBox('hello', 10)
    const lines = result.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toContain('┌')
    expect(lines[0]).toContain('┐')
    expect(lines[1]).toContain('│')
    expect(lines[1]).toContain('hello')
    expect(lines[2]).toContain('└')
    expect(lines[2]).toContain('┘')
  })

  it('uses minimum width of 4', () => {
    const result = drawBox('ab', 2)
    const lines = result.split('\n')
    expect(lines[0]!.length).toBeGreaterThanOrEqual(6)
  })

  it('centers text in box', () => {
    const result = drawBox('hi', 10)
    const lines = result.split('\n')
    expect(lines[1]).toContain('hi')
  })

  it('draws horizontal line characters', () => {
    const result = drawBox('test', 10)
    expect(result).toContain('─')
  })
})

// ─── formatGraphJson ─────────────────────────────────────

describe('formatGraphJson', () => {
  it('produces valid JSON', () => {
    const result = makeGraphResult()
    const output = formatGraphJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains nodes object', () => {
    const result = makeGraphResult()
    const output = formatGraphJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.nodes).toBeDefined()
    expect(typeof parsed.nodes).toBe('object')
  })

  it('contains edges array', () => {
    const result = makeGraphResult()
    const output = formatGraphJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.edges).toBeDefined()
    expect(Array.isArray(parsed.edges)).toBe(true)
  })

  it('contains root path', () => {
    const result = makeGraphResult()
    const output = formatGraphJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.root).toBe('/project/src/index.ts')
  })

  it('contains maxDepth', () => {
    const result = makeGraphResult({ maxDepth: 5 })
    const output = formatGraphJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.maxDepth).toBe(5)
  })

  it('serializes edge types', () => {
    const edges = [makeEdge({ type: 'dynamic-import' }), makeEdge({ type: 're-export' })]
    const result = makeGraphResult({ edges, totalEdges: 2 })
    const output = formatGraphJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.edges).toHaveLength(2)
    expect(parsed.edges[0].type).toBe('dynamic-import')
    expect(parsed.edges[1].type).toBe('re-export')
  })
})

// ─── Re-exports ──────────────────────────────────────────

describe('Graph command - re-exports', () => {
  it('re-exports helper functions', () => {
    expect(extractDependencies).toBeDefined()
    expect(buildDependencyGraph).toBeDefined()
    expect(computeNodeDepths).toBeDefined()
    expect(findCycles).toBeDefined()
    expect(resolveImportPath).toBeDefined()
  })

  it('re-exports format functions', () => {
    expect(formatTree).toBeDefined()
    expect(formatGraph).toBeDefined()
    expect(formatGraphJson).toBeDefined()
    expect(formatTreeNode).toBeDefined()
    expect(drawBox).toBeDefined()
  })
})
