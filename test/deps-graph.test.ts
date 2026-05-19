import { describe, expect, it } from 'vitest'

import DepsGraph from '../src/commands/deps-graph.js'
import {
  buildGraph,
  extractImports,
  findChains,
  findHubs,
  isExternalImport,
  resolveImportPath,
  type DepGraph,
  type FileNode,
  type HubFile,
  type ImportInfo,
} from '../src/commands/deps-graph-helpers.js'
import {
  formatGraphDot,
  formatGraphJson,
  formatGraphTable,
  formatGraphText,
} from '../src/commands/deps-graph-format-helpers.js'
import type { GraphStats } from '../src/commands/deps-graph-helpers.js'

// ─── Test data factories ────────────────────────────────

function makeImportInfo(overrides: Partial<ImportInfo> = {}): ImportInfo {
  return {
    isExternal: false,
    isTypeOnly: false,
    line: 1,
    source: './foo',
    ...overrides,
  }
}

function makeFileNode(overrides: Partial<FileNode> = {}): FileNode {
  return {
    depth: 0,
    filePath: 'src/index.ts',
    importedBy: [],
    imports: [],
    ...overrides,
  }
}

function makeGraphStats(overrides: Partial<GraphStats> = {}): GraphStats {
  return {
    avgImportsPerFile: 2,
    externalImports: 0,
    maxDepth: 1,
    totalEdges: 2,
    totalFiles: 3,
    totalImports: 6,
    ...overrides,
  }
}

function makeDepGraph(overrides: Partial<DepGraph> = {}): DepGraph {
  const nodes = new Map<string, FileNode>()
  nodes.set('src/a.ts', makeFileNode({ filePath: 'src/a.ts' }))
  nodes.set('src/b.ts', makeFileNode({ filePath: 'src/b.ts' }))
  nodes.set('src/c.ts', makeFileNode({ filePath: 'src/c.ts' }))

  return {
    edges: [],
    nodes,
    stats: makeGraphStats(),
    ...overrides,
  }
}

function makeHubFile(overrides: Partial<HubFile> = {}): HubFile {
  return {
    filePath: 'src/utils.ts',
    importCount: 3,
    importedByCount: 10,
    score: 23,
    ...overrides,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('DepsGraph command - static metadata', () => {
  it('has a description', () => {
    expect(DepsGraph.description).toBe('Analyze import dependency graph across source files')
  })

  it('has examples array', () => {
    expect(Array.isArray(DepsGraph.examples)).toBe(true)
    expect(DepsGraph.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(DepsGraph.args.path).toBeDefined()
    expect(DepsGraph.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(DepsGraph.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('DepsGraph command - flags', () => {
  it('has format flag with options', () => {
    expect(DepsGraph.flags.format.options).toContain('table')
    expect(DepsGraph.flags.format.options).toContain('json')
    expect(DepsGraph.flags.format.options).toContain('dot')
    expect(DepsGraph.flags.format.options).toContain('text')
  })

  it('defaults format to table', () => {
    expect(DepsGraph.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(DepsGraph.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(DepsGraph.flags.ignore).toBeDefined()
    expect(DepsGraph.flags.ignore.multiple).toBe(true)
  })

  it('has depth flag defaulting to 10', () => {
    expect(DepsGraph.flags.depth.default).toBe(10)
  })

  it('has external flag defaulting to false', () => {
    expect(DepsGraph.flags.external.default).toBe(false)
  })

  it('has top flag defaulting to 10', () => {
    expect(DepsGraph.flags.top.default).toBe(10)
  })

  it('has ext flag', () => {
    expect(DepsGraph.flags.ext).toBeDefined()
  })
})

// ─── Class structure ────────────────────────────────────

describe('DepsGraph command - class structure', () => {
  it('exports a default class', () => {
    expect(DepsGraph).toBeDefined()
    expect(typeof DepsGraph).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof DepsGraph.prototype.run).toBe('function')
  })
})

// ─── extractImports ─────────────────────────────────────

describe('extractImports', () => {
  it('extracts ES module default import', () => {
    const content = `import foo from './bar'`
    const result = extractImports(content, 'src/index.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.source).toBe('./bar')
    expect(result[0]!.isExternal).toBe(false)
    expect(result[0]!.isTypeOnly).toBe(false)
    expect(result[0]!.line).toBe(1)
  })

  it('extracts named import', () => {
    const content = `import { a, b } from './utils'`
    const result = extractImports(content, 'src/index.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.source).toBe('./utils')
    expect(result[0]!.isExternal).toBe(false)
  })

  it('extracts side-effect import', () => {
    const content = `import './setup'`
    const result = extractImports(content, 'src/index.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.source).toBe('./setup')
    expect(result[0]!.isExternal).toBe(false)
    expect(result[0]!.isTypeOnly).toBe(false)
  })

  it('extracts type-only import', () => {
    const content = `import type { X } from './types'`
    const result = extractImports(content, 'src/index.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.source).toBe('./types')
    expect(result[0]!.isTypeOnly).toBe(true)
    expect(result[0]!.isExternal).toBe(false)
  })

  it('extracts CommonJS require', () => {
    const content = `const x = require('./foo')`
    const result = extractImports(content, 'src/index.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.source).toBe('./foo')
    expect(result[0]!.isExternal).toBe(false)
    expect(result[0]!.isTypeOnly).toBe(false)
  })

  it('identifies external package import', () => {
    const content = `import chalk from 'chalk'`
    const result = extractImports(content, 'src/index.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.source).toBe('chalk')
    expect(result[0]!.isExternal).toBe(true)
  })

  it('returns empty array for file with no imports', () => {
    const content = `const x = 1\nconsole.log(x)`
    const result = extractImports(content, 'src/index.ts')
    expect(result).toHaveLength(0)
  })

  it('extracts multiple imports from different lines', () => {
    const content = `import foo from './bar'\nimport { baz } from './qux'`
    const result = extractImports(content, 'src/index.ts')
    expect(result).toHaveLength(2)
    expect(result[0]!.source).toBe('./bar')
    expect(result[1]!.source).toBe('./qux')
  })

  it('tracks line numbers correctly', () => {
    const content = `\n\nimport foo from './bar'`
    const result = extractImports(content, 'src/index.ts')
    expect(result[0]!.line).toBe(3)
  })

  it('identifies external require', () => {
    const content = `const path = require('path')`
    const result = extractImports(content, 'src/index.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.isExternal).toBe(true)
    expect(result[0]!.source).toBe('path')
  })
})

// ─── isExternalImport ───────────────────────────────────

describe('isExternalImport', () => {
  it('returns false for relative import starting with .', () => {
    expect(isExternalImport('./foo')).toBe(false)
  })

  it('returns false for relative import starting with ..', () => {
    expect(isExternalImport('../foo')).toBe(false)
  })

  it('returns false for absolute path', () => {
    expect(isExternalImport('/foo/bar')).toBe(false)
  })

  it('returns true for package name', () => {
    expect(isExternalImport('chalk')).toBe(true)
  })

  it('returns true for scoped package', () => {
    expect(isExternalImport('@oclif/core')).toBe(true)
  })

  it('returns true for node built-in', () => {
    expect(isExternalImport('path')).toBe(true)
  })
})

// ─── resolveImportPath ──────────────────────────────────

describe('resolveImportPath', () => {
  it('resolves relative import with ./', () => {
    const result = resolveImportPath('./foo', 'src/index.ts')
    expect(result).toBe('src/foo.ts')
  })

  it('resolves parent directory import', () => {
    const result = resolveImportPath('../utils', 'src/commands/cmd.ts')
    expect(result).toBe('src/utils.ts')
  })

  it('returns external import unchanged', () => {
    const result = resolveImportPath('chalk', 'src/index.ts')
    expect(result).toBe('chalk')
  })

  it('adds .ts extension if missing', () => {
    const result = resolveImportPath('./helpers', 'src/index.ts')
    expect(result).toBe('src/helpers.ts')
  })

  it('preserves existing .ts extension', () => {
    const result = resolveImportPath('./foo.ts', 'src/index.ts')
    expect(result).toBe('src/foo.ts')
  })

  it('preserves existing .tsx extension', () => {
    const result = resolveImportPath('./foo.tsx', 'src/index.ts')
    expect(result).toBe('src/foo.tsx')
  })
})

// ─── buildGraph ─────────────────────────────────────────

describe('buildGraph', () => {
  it('builds graph from mock files', async () => {
    const files = [
      { absolutePath: '/src/a.ts', path: 'src/a.ts' },
      { absolutePath: '/src/b.ts', path: 'src/b.ts' },
    ]

    const fileContents = new Map<string, string>([
      ['/src/a.ts', `import { x } from './b'`],
      ['/src/b.ts', `const y = 1`],
    ])

    const graph = await buildGraph(
      files,
      (path) => Promise.resolve(fileContents.get(path) ?? ''),
      { includeExternal: false, maxDepth: 10 },
    )

    expect(graph.stats.totalFiles).toBe(2)
    expect(graph.stats.totalImports).toBe(1)
    expect(graph.nodes.has('src/a.ts')).toBe(true)
    expect(graph.nodes.has('src/b.ts')).toBe(true)
  })

  it('filters out external imports when includeExternal is false', async () => {
    const files = [
      { absolutePath: '/src/a.ts', path: 'src/a.ts' },
    ]

    const fileContents = new Map<string, string>([
      ['/src/a.ts', `import chalk from 'chalk'\nimport { x } from './b'`],
    ])

    const graph = await buildGraph(
      files,
      (path) => Promise.resolve(fileContents.get(path) ?? ''),
      { includeExternal: false, maxDepth: 10 },
    )

    const node = graph.nodes.get('src/a.ts')
    expect(node!.imports).toHaveLength(1)
    expect(node!.imports[0]!.isExternal).toBe(false)
  })

  it('includes external imports when includeExternal is true', async () => {
    const files = [
      { absolutePath: '/src/a.ts', path: 'src/a.ts' },
    ]

    const fileContents = new Map<string, string>([
      ['/src/a.ts', `import chalk from 'chalk'`],
    ])

    const graph = await buildGraph(
      files,
      (path) => Promise.resolve(fileContents.get(path) ?? ''),
      { includeExternal: true, maxDepth: 10 },
    )

    const node = graph.nodes.get('src/a.ts')
    expect(node!.imports).toHaveLength(1)
    expect(node!.imports[0]!.isExternal).toBe(true)
  })

  it('handles empty file list', async () => {
    const graph = await buildGraph(
      [],
      () => Promise.resolve(''),
      { includeExternal: false, maxDepth: 10 },
    )

    expect(graph.stats.totalFiles).toBe(0)
    expect(graph.stats.totalImports).toBe(0)
    expect(graph.edges).toHaveLength(0)
  })

  it('handles unreadable files gracefully', async () => {
    const files = [
      { absolutePath: '/src/a.ts', path: 'src/a.ts' },
    ]

    const graph = await buildGraph(
      files,
      () => Promise.reject(new Error('ENOENT')),
      { includeExternal: false, maxDepth: 10 },
    )

    const node = graph.nodes.get('src/a.ts')
    expect(node!.imports).toHaveLength(0)
  })
})

// ─── findHubs ───────────────────────────────────────────

describe('findHubs', () => {
  it('ranks hubs by score', () => {
    const nodes = new Map<string, FileNode>()
    nodes.set('src/utils.ts', makeFileNode({
      filePath: 'src/utils.ts',
      importedBy: ['src/a.ts', 'src/b.ts', 'src/c.ts'],
      imports: [makeImportInfo({ source: './helper', isExternal: false })],
    }))
    nodes.set('src/a.ts', makeFileNode({
      filePath: 'src/a.ts',
      importedBy: [],
      imports: [makeImportInfo({ source: './utils', isExternal: false })],
    }))

    const graph = makeDepGraph({ nodes })
    const hubs = findHubs(graph, 10)

    expect(hubs[0]!.filePath).toBe('src/utils.ts')
    expect(hubs[0]!.importedByCount).toBe(3)
    expect(hubs[0]!.score).toBe(7)
  })

  it('limits results to count', () => {
    const nodes = new Map<string, FileNode>()
    for (let i = 0; i < 20; i++) {
      nodes.set(`src/file${i}.ts`, makeFileNode({
        filePath: `src/file${i}.ts`,
        importedBy: Array.from({ length: i + 1 }, (_, j) => `src/dep${j}.ts`),
        imports: [],
      }))
    }

    const graph = makeDepGraph({ nodes })
    const hubs = findHubs(graph, 5)
    expect(hubs).toHaveLength(5)
  })

  it('returns empty for empty graph', () => {
    const graph = makeDepGraph({ nodes: new Map(), stats: makeGraphStats({ totalFiles: 0 }) })
    const hubs = findHubs(graph, 10)
    expect(hubs).toHaveLength(0)
  })

  it('calculates score as importedByCount * 2 + importCount', () => {
    const nodes = new Map<string, FileNode>()
    nodes.set('src/hub.ts', makeFileNode({
      filePath: 'src/hub.ts',
      importedBy: ['a.ts', 'b.ts'],
      imports: [makeImportInfo({ source: './x', isExternal: false }), makeImportInfo({ source: './y', isExternal: false })],
    }))

    const graph = makeDepGraph({ nodes })
    const hubs = findHubs(graph, 10)

    expect(hubs[0]!.score).toBe(6)
  })
})

// ─── findChains ─────────────────────────────────────────

describe('findChains', () => {
  it('finds dependency chains', () => {
    const nodes = new Map<string, FileNode>()
    nodes.set('src/a.ts', makeFileNode({
      filePath: 'src/a.ts',
      imports: [makeImportInfo({ source: './b' })],
    }))
    nodes.set('src/b.ts', makeFileNode({
      filePath: 'src/b.ts',
      imports: [makeImportInfo({ source: './c' })],
    }))
    nodes.set('src/c.ts', makeFileNode({
      filePath: 'src/c.ts',
      imports: [],
    }))

    const edges = [
      { from: 'src/a.ts', to: 'src/b.ts' },
      { from: 'src/b.ts', to: 'src/c.ts' },
    ]

    const graph = makeDepGraph({ edges, nodes })
    const chains = findChains(graph, 10)

    expect(chains.length).toBeGreaterThanOrEqual(1)
  })

  it('respects maxDepth', () => {
    const nodes = new Map<string, FileNode>()
    nodes.set('src/a.ts', makeFileNode({
      filePath: 'src/a.ts',
      imports: [makeImportInfo({ source: './b' })],
    }))
    nodes.set('src/b.ts', makeFileNode({
      filePath: 'src/b.ts',
      imports: [makeImportInfo({ source: './c' })],
    }))
    nodes.set('src/c.ts', makeFileNode({
      filePath: 'src/c.ts',
      imports: [],
    }))

    const graph = makeDepGraph({ nodes })
    const chains = findChains(graph, 1)

    for (const chain of chains) {
      expect(chain.length).toBeLessThanOrEqual(2)
    }
  })

  it('returns empty for graph with no edges', () => {
    const nodes = new Map<string, FileNode>()
    nodes.set('src/a.ts', makeFileNode({ filePath: 'src/a.ts', imports: [] }))

    const graph = makeDepGraph({ nodes, edges: [] })
    const chains = findChains(graph, 10)

    expect(chains).toHaveLength(0)
  })
})

// ─── formatGraphTable ───────────────────────────────────

describe('formatGraphTable', () => {
  it('contains header row with column names', () => {
    const graph = makeDepGraph()
    const hubs = [makeHubFile()]
    const output = formatGraphTable(graph, hubs)
    expect(output).toContain('File')
    expect(output).toContain('Imported By')
    expect(output).toContain('Imports')
    expect(output).toContain('Score')
  })

  it('contains stats section', () => {
    const graph = makeDepGraph()
    const output = formatGraphTable(graph, [])
    expect(output).toContain('Total files')
    expect(output).toContain('Total imports')
    expect(output).toContain('Total edges')
    expect(output).toContain('Max depth')
  })

  it('shows hub data rows', () => {
    const graph = makeDepGraph()
    const hubs = [makeHubFile({ filePath: 'src/utils.ts', importedByCount: 5, importCount: 2, score: 12 })]
    const output = formatGraphTable(graph, hubs)
    expect(output).toContain('src/utils.ts')
    expect(output).toContain('12')
  })

  it('handles empty hubs', () => {
    const graph = makeDepGraph()
    const output = formatGraphTable(graph, [])
    expect(output).toContain('No files found')
  })

  it('handles multiple hubs', () => {
    const graph = makeDepGraph()
    const hubs = [
      makeHubFile({ filePath: 'src/a.ts', score: 20 }),
      makeHubFile({ filePath: 'src/b.ts', score: 10 }),
    ]
    const output = formatGraphTable(graph, hubs)
    expect(output).toContain('src/a.ts')
    expect(output).toContain('src/b.ts')
  })
})

// ─── formatGraphDot ─────────────────────────────────────

describe('formatGraphDot', () => {
  it('produces valid DOT format', () => {
    const graph = makeDepGraph({
      edges: [{ from: 'src/a.ts', to: 'src/b.ts' }],
    })
    const output = formatGraphDot(graph)
    expect(output).toContain('digraph {')
    expect(output).toContain('}')
  })

  it('uses filename-only labels', () => {
    const graph = makeDepGraph({
      edges: [{ from: 'src/a.ts', to: 'src/b.ts' }],
    })
    const output = formatGraphDot(graph)
    expect(output).toContain('"a.ts"')
    expect(output).toContain('"b.ts"')
  })

  it('handles empty graph', () => {
    const graph = makeDepGraph({ edges: [] })
    const output = formatGraphDot(graph)
    expect(output).toContain('digraph {')
    expect(output).toContain('}')
  })
})

// ─── formatGraphText ────────────────────────────────────

describe('formatGraphText', () => {
  it('produces text output', () => {
    const graph = makeDepGraph({ edges: [] })
    const output = formatGraphText(graph, 10)
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })

  it('shows tree connectors', () => {
    const nodes = new Map<string, FileNode>()
    nodes.set('src/a.ts', makeFileNode({
      filePath: 'src/a.ts',
      imports: [makeImportInfo({ source: './b' })],
    }))
    nodes.set('src/b.ts', makeFileNode({
      filePath: 'src/b.ts',
      imports: [],
    }))

    const graph = makeDepGraph({ nodes, edges: [{ from: 'src/a.ts', to: 'src/b.ts' }] })
    const output = formatGraphText(graph, 10)
    expect(output).toContain('a.ts')
  })
})

// ─── formatGraphJson ────────────────────────────────────

describe('formatGraphJson', () => {
  it('produces valid JSON', () => {
    const graph = makeDepGraph()
    const output = formatGraphJson(graph)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains nodes array', () => {
    const graph = makeDepGraph()
    const output = formatGraphJson(graph)
    const parsed = JSON.parse(output)
    expect(parsed.nodes).toBeDefined()
    expect(Array.isArray(parsed.nodes)).toBe(true)
  })

  it('contains edges array', () => {
    const graph = makeDepGraph({
      edges: [{ from: 'src/a.ts', to: 'src/b.ts' }],
    })
    const output = formatGraphJson(graph)
    const parsed = JSON.parse(output)
    expect(parsed.edges).toBeDefined()
    expect(parsed.edges).toHaveLength(1)
  })

  it('contains stats object', () => {
    const graph = makeDepGraph()
    const output = formatGraphJson(graph)
    const parsed = JSON.parse(output)
    expect(parsed.stats).toBeDefined()
    expect(parsed.stats.totalFiles).toBe(3)
  })

  it('handles empty graph', () => {
    const graph = makeDepGraph({
      nodes: new Map(),
      edges: [],
      stats: makeGraphStats({ totalFiles: 0, totalImports: 0, totalEdges: 0 }),
    })
    const output = formatGraphJson(graph)
    const parsed = JSON.parse(output)
    expect(parsed.nodes).toHaveLength(0)
    expect(parsed.stats.totalFiles).toBe(0)
  })

  it('preserves import details', () => {
    const nodes = new Map<string, FileNode>()
    nodes.set('src/a.ts', makeFileNode({
      filePath: 'src/a.ts',
      imports: [makeImportInfo({ source: './b', isExternal: false, isTypeOnly: true, line: 3 })],
    }))

    const graph = makeDepGraph({ nodes })
    const output = formatGraphJson(graph)
    const parsed = JSON.parse(output)
    expect(parsed.nodes[0].imports[0].source).toBe('./b')
    expect(parsed.nodes[0].imports[0].isTypeOnly).toBe(true)
    expect(parsed.nodes[0].imports[0].line).toBe(3)
  })
})

// ─── Type interface tests ───────────────────────────────

describe('Type interfaces', () => {
  it('ImportInfo has all required fields', () => {
    const info: ImportInfo = makeImportInfo()
    expect(info.source).toBeDefined()
    expect(info.line).toBeDefined()
    expect(typeof info.isTypeOnly).toBe('boolean')
    expect(typeof info.isExternal).toBe('boolean')
  })

  it('FileNode has all required fields', () => {
    const node: FileNode = makeFileNode()
    expect(node.filePath).toBeDefined()
    expect(Array.isArray(node.imports)).toBe(true)
    expect(Array.isArray(node.importedBy)).toBe(true)
    expect(typeof node.depth).toBe('number')
  })

  it('HubFile has all required fields', () => {
    const hub: HubFile = makeHubFile()
    expect(hub.filePath).toBeDefined()
    expect(typeof hub.importCount).toBe('number')
    expect(typeof hub.importedByCount).toBe('number')
    expect(typeof hub.score).toBe('number')
  })

  it('GraphStats has all required fields', () => {
    const stats: GraphStats = makeGraphStats()
    expect(typeof stats.totalFiles).toBe('number')
    expect(typeof stats.totalImports).toBe('number')
    expect(typeof stats.totalEdges).toBe('number')
    expect(typeof stats.avgImportsPerFile).toBe('number')
    expect(typeof stats.maxDepth).toBe('number')
    expect(typeof stats.externalImports).toBe('number')
  })
})
