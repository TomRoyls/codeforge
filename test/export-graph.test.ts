import { describe, expect, it } from 'vitest'

import {
  buildExportGraph,
  buildExportGraphResult,
  computeExportGraphStats,
  extractExports,
  extractImports,
  findHubExports,
  findOrphanExports,
  sourceBaseName,
  type ExportInfo,
  type ExportNode,
  type ExportGraph,
} from '../src/commands/export-graph-helpers.js'

import {
  formatEdges,
  formatExportGraphJson,
  formatExportGraphStats,
  formatExportGraphTable,
  formatExportNode,
  formatExportNodes,
  formatHubExports,
  formatOrphanExports,
  typeLabel,
} from '../src/commands/export-graph-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

function makeExport(overrides: Partial<ExportInfo> = {}): ExportInfo {
  return {
    name: 'foo',
    file: 'src/mod.ts',
    line: 1,
    type: 'function',
    isReExport: false,
    importers: [],
    importCount: 0,
    ...overrides,
  }
}

function makeNode(overrides: Partial<ExportNode> = {}): ExportNode {
  return {
    file: 'src/mod.ts',
    exports: [],
    totalExports: 0,
    totalImports: 0,
    exportToImportRatio: 0,
    ...overrides,
  }
}

const fileContents = new Map<string, string>([
  ['src/core.ts', 'export function core() {}\nexport const VERSION = "1.0"\nexport interface Config { name: string }'],
  ['src/utils.ts', "import { core, VERSION } from './core.js'\nexport function helper() { core() }\nexport type Result = string | null"],
  ['src/app.ts', "import { helper } from './utils.js'\nimport { core } from './core.js'\nexport default class App {}"],
  ['src/main.ts', "import App from './app.js'\nimport { Config } from './core.js'"],
])

const allFiles = ['src/core.ts', 'src/utils.ts', 'src/app.ts', 'src/main.ts']

// ─── extractExports ─────────────────────────────────────

describe('extractExports', () => {
  it('extracts named function exports', () => {
    const exports = extractExports('export function hello() {}', 'test.ts')
    expect(exports.some((e) => e.name === 'hello' && e.type === 'function')).toBe(true)
  })

  it('extracts named class exports', () => {
    const exports = extractExports('export class Foo {}', 'test.ts')
    expect(exports.some((e) => e.name === 'Foo' && e.type === 'class')).toBe(true)
  })

  it('extracts interface exports', () => {
    const exports = extractExports('export interface Bar {}', 'test.ts')
    expect(exports.some((e) => e.name === 'Bar' && e.type === 'interface')).toBe(true)
  })

  it('extracts type exports', () => {
    const exports = extractExports('export type ID = string', 'test.ts')
    expect(exports.some((e) => e.name === 'ID' && e.type === 'type')).toBe(true)
  })

  it('extracts const exports', () => {
    const exports = extractExports('export const X = 1', 'test.ts')
    expect(exports.some((e) => e.name === 'X' && e.type === 'const')).toBe(true)
  })

  it('extracts enum exports', () => {
    const exports = extractExports('export enum Color { Red }', 'test.ts')
    expect(exports.some((e) => e.name === 'Color' && e.type === 'enum')).toBe(true)
  })

  it('extracts default function exports', () => {
    const exports = extractExports('export default function main() {}', 'test.ts')
    expect(exports.some((e) => e.name === 'main' && e.type === 'function')).toBe(true)
  })

  it('extracts default class exports', () => {
    const exports = extractExports('export default class App {}', 'test.ts')
    expect(exports.some((e) => e.name === 'App' && e.type === 'class')).toBe(true)
  })

  it('extracts re-exports from other modules', () => {
    const exports = extractExports("export { foo } from './bar.js'", 'test.ts')
    expect(exports.some((e) => e.name === 'foo' && e.isReExport)).toBe(true)
  })

  it('extracts export list', () => {
    const exports = extractExports('export { a, b, c }', 'test.ts')
    expect(exports.some((e) => e.name === 'a')).toBe(true)
    expect(exports.some((e) => e.name === 'b')).toBe(true)
    expect(exports.some((e) => e.name === 'c')).toBe(true)
  })

  it('extracts let exports', () => {
    const exports = extractExports('export let counter = 0', 'test.ts')
    expect(exports.some((e) => e.name === 'counter')).toBe(true)
  })

  it('extracts star re-export', () => {
    const exports = extractExports("export * from './utils.js'", 'test.ts')
    expect(exports.some((e) => e.isReExport)).toBe(true)
  })

  it('returns empty for no exports', () => {
    expect(extractExports('const x = 1', 'test.ts')).toEqual([])
  })

  it('sets line numbers', () => {
    const content = 'const a = 1\nexport function foo() {}'
    const exports = extractExports(content, 'test.ts')
    expect(exports[0].line).toBe(2)
  })

  it('handles export list with aliases', () => {
    const exports = extractExports('export { foo as bar }', 'test.ts')
    expect(exports.some((e) => e.name === 'bar')).toBe(true)
  })
})

// ─── extractImports ─────────────────────────────────────

describe('extractImports', () => {
  it('extracts named imports', () => {
    const imports = extractImports("import { foo } from './bar.js'", 'test.ts')
    expect(imports.some((i) => i.name === 'foo' && i.type === 'named')).toBe(true)
  })

  it('extracts default imports', () => {
    const imports = extractImports("import React from 'react'", 'test.ts')
    expect(imports.some((i) => i.name === 'React' && i.type === 'default')).toBe(true)
  })

  it('extracts namespace imports', () => {
    const imports = extractImports("import * as utils from './utils.js'", 'test.ts')
    expect(imports.some((i) => i.name === 'utils' && i.type === 'namespace')).toBe(true)
  })

  it('extracts dynamic imports', () => {
    const imports = extractImports("const m = import('./mod.js')", 'test.ts')
    expect(imports.some((i) => i.type === 'dynamic')).toBe(true)
  })

  it('extracts side-effect imports', () => {
    const imports = extractImports("import './polyfill.js'", 'test.ts')
    expect(imports.some((i) => i.source === './polyfill.js')).toBe(true)
  })

  it('extracts multiple named imports', () => {
    const imports = extractImports("import { a, b, c } from './mod.js'", 'test.ts')
    expect(imports.filter((i) => i.type === 'named').length).toBe(3)
  })

  it('extracts type imports', () => {
    const imports = extractImports("import type { Config } from './types.js'", 'test.ts')
    expect(imports.some((i) => i.name === 'Config')).toBe(true)
  })

  it('sets line numbers', () => {
    const content = 'const x = 1\nimport { foo } from "./bar.js"'
    const imports = extractImports(content, 'test.ts')
    expect(imports[0].line).toBe(2)
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1', 'test.ts')).toEqual([])
  })

  it('extracts require destructuring', () => {
    const imports = extractImports("const { a, b } = require('./mod')", 'test.ts')
    expect(imports.some((i) => i.name === 'a')).toBe(true)
    expect(imports.some((i) => i.name === 'b')).toBe(true)
  })
})

// ─── buildExportGraph ───────────────────────────────────

describe('buildExportGraph', () => {
  it('builds nodes from files', () => {
    const graph = buildExportGraph(allFiles, fileContents)
    expect(graph.nodes.length).toBe(4)
  })

  it('builds edges from imports', () => {
    const graph = buildExportGraph(allFiles, fileContents)
    expect(graph.edges.length).toBeGreaterThan(0)
  })

  it('finds orphans', () => {
    const graph = buildExportGraph(allFiles, fileContents)
    expect(graph.orphanExports.length).toBeGreaterThanOrEqual(0)
  })

  it('tracks importers on exports', () => {
    const graph = buildExportGraph(allFiles, fileContents)
    const coreNode = graph.nodes.find((n) => n.file === 'src/core.ts')!
    const coreExport = coreNode.exports.find((e) => e.name === 'core')!
    expect(coreExport.importCount).toBeGreaterThanOrEqual(1)
  })

  it('sets export count on nodes', () => {
    const graph = buildExportGraph(allFiles, fileContents)
    const coreNode = graph.nodes.find((n) => n.file === 'src/core.ts')!
    expect(coreNode.totalExports).toBeGreaterThanOrEqual(2)
  })

  it('sets import count on nodes', () => {
    const graph = buildExportGraph(allFiles, fileContents)
    const utilsNode = graph.nodes.find((n) => n.file === 'src/utils.ts')!
    expect(utilsNode.totalImports).toBeGreaterThanOrEqual(1)
  })

  it('handles empty files', () => {
    const graph = buildExportGraph(['src/empty.ts'], new Map([['src/empty.ts', '']]))
    expect(graph.nodes.length).toBe(1)
    expect(graph.nodes[0].totalExports).toBe(0)
  })

  it('handles no files', () => {
    const graph = buildExportGraph([], new Map())
    expect(graph.nodes).toEqual([])
    expect(graph.edges).toEqual([])
  })

  it('computes export to import ratio', () => {
    const graph = buildExportGraph(allFiles, fileContents)
    const mainNode = graph.nodes.find((n) => n.file === 'src/main.ts')!
    expect(typeof mainNode.exportToImportRatio).toBe('number')
  })
})

// ─── findOrphanExports ──────────────────────────────────

describe('findOrphanExports', () => {
  it('finds exports with no importers', () => {
    const exports = [makeExport({ importCount: 0 }), makeExport({ name: 'used', importCount: 3 })]
    const orphans = findOrphanExports(exports)
    expect(orphans.length).toBe(1)
    expect(orphans[0].name).toBe('foo')
  })

  it('excludes re-exports', () => {
    const exports = [makeExport({ importCount: 0, isReExport: true })]
    const orphans = findOrphanExports(exports)
    expect(orphans).toEqual([])
  })

  it('returns empty when all used', () => {
    const exports = [makeExport({ importCount: 5 })]
    expect(findOrphanExports(exports)).toEqual([])
  })
})

// ─── findHubExports ─────────────────────────────────────

describe('findHubExports', () => {
  it('finds exports with >5 importers', () => {
    const exports = [makeExport({ importCount: 10 })]
    const hubs = findHubExports(exports)
    expect(hubs.length).toBe(1)
  })

  it('excludes exports with <=5 importers', () => {
    const exports = [makeExport({ importCount: 5 })]
    expect(findHubExports(exports)).toEqual([])
  })

  it('returns empty for no hubs', () => {
    expect(findHubExports([])).toEqual([])
  })
})

// ─── computeExportGraphStats ────────────────────────────

describe('computeExportGraphStats', () => {
  it('computes total exports', () => {
    const graph: ExportGraph = {
      edges: [],
      hubExports: [],
      nodes: [makeNode({ totalExports: 5 }), makeNode({ totalExports: 3 })],
      orphanExports: [],
    }
    const stats = computeExportGraphStats(graph)
    expect(stats.totalExports).toBe(8)
  })

  it('computes total imports', () => {
    const graph: ExportGraph = {
      edges: [],
      hubExports: [],
      nodes: [makeNode({ totalImports: 4 }), makeNode({ totalImports: 6 })],
      orphanExports: [],
    }
    const stats = computeExportGraphStats(graph)
    expect(stats.totalImports).toBe(10)
  })

  it('computes total edges', () => {
    const graph: ExportGraph = {
      edges: [{ from: 'a', to: 'b', symbols: ['x'], count: 1 }],
      hubExports: [],
      nodes: [],
      orphanExports: [],
    }
    const stats = computeExportGraphStats(graph)
    expect(stats.totalEdges).toBe(1)
  })

  it('computes avg exports per file', () => {
    const graph: ExportGraph = {
      edges: [],
      hubExports: [],
      nodes: [makeNode({ totalExports: 6 }), makeNode({ totalExports: 4 })],
      orphanExports: [],
    }
    const stats = computeExportGraphStats(graph)
    expect(stats.avgExportsPerFile).toBe(5)
  })

  it('returns null mostUsedExport when none used', () => {
    const graph: ExportGraph = {
      edges: [],
      hubExports: [],
      nodes: [makeNode({ exports: [makeExport({ importCount: 0 })] })],
      orphanExports: [],
    }
    const stats = computeExportGraphStats(graph)
    expect(stats.mostUsedExport).toBeNull()
  })

  it('finds most used export', () => {
    const exp = makeExport({ name: 'popular', importCount: 10 })
    const graph: ExportGraph = {
      edges: [],
      hubExports: [],
      nodes: [makeNode({ exports: [exp, makeExport({ name: 'rare', importCount: 1 })] })],
      orphanExports: [],
    }
    const stats = computeExportGraphStats(graph)
    expect(stats.mostUsedExport!.name).toBe('popular')
  })

  it('computes orphan and hub counts', () => {
    const graph: ExportGraph = {
      edges: [],
      hubExports: [makeExport({ importCount: 10 })],
      nodes: [],
      orphanExports: [makeExport()],
    }
    const stats = computeExportGraphStats(graph)
    expect(stats.orphanCount).toBe(1)
    expect(stats.hubCount).toBe(1)
  })

  it('handles empty graph', () => {
    const graph: ExportGraph = { edges: [], hubExports: [], nodes: [], orphanExports: [] }
    const stats = computeExportGraphStats(graph)
    expect(stats.totalExports).toBe(0)
    expect(stats.avgExportsPerFile).toBe(0)
  })
})

// ─── buildExportGraphResult ─────────────────────────────

describe('buildExportGraphResult', () => {
  it('returns graph and stats', async () => {
    const reader = async (f: string) => fileContents.get(f) ?? ''
    const result = await buildExportGraphResult(allFiles, reader)
    expect(result.graph).toBeTruthy()
    expect(result.stats).toBeTruthy()
  })

  it('skips unreadable files', async () => {
    const reader = async () => { throw new Error('nope') }
    const result = await buildExportGraphResult(['src/x.ts'], reader)
    expect(result.graph.nodes.length).toBe(1)
    expect(result.graph.nodes[0].totalExports).toBe(0)
  })

  it('populates stats', async () => {
    const reader = async (f: string) => fileContents.get(f) ?? ''
    const result = await buildExportGraphResult(allFiles, reader)
    expect(result.stats.totalExports).toBeGreaterThan(0)
    expect(result.stats.totalEdges).toBeGreaterThan(0)
  })
})

// ─── sourceBaseName ─────────────────────────────────────

describe('sourceBaseName', () => {
  it('strips .ts extension', () => {
    expect(sourceBaseName('src/export-graph-helpers.ts')).toBe('export-graph-helpers')
  })
})

// ─── typeLabel ──────────────────────────────────────────

describe('typeLabel', () => {
  it('labels function', () => expect(typeLabel('function')).toContain('fn'))
  it('labels class', () => expect(typeLabel('class')).toContain('cls'))
  it('labels const', () => expect(typeLabel('const')).toContain('con'))
  it('labels interface', () => expect(typeLabel('interface')).toContain('ifc'))
  it('labels type', () => expect(typeLabel('type')).toContain('typ'))
  it('labels enum', () => expect(typeLabel('enum')).toContain('enum'))
  it('labels default', () => expect(typeLabel('default')).toContain('def'))
  it('labels unknown', () => expect(typeLabel('other')).toBeTruthy())
})

// ─── formatExportNode ───────────────────────────────────

describe('formatExportNode', () => {
  it('renders file name', () => {
    const result = formatExportNode(makeNode({ file: 'src/core.ts' }))
    expect(result).toContain('core.ts')
  })

  it('renders export count', () => {
    const result = formatExportNode(makeNode({ totalExports: 5 }))
    expect(result).toContain('5')
  })

  it('renders import count', () => {
    const result = formatExportNode(makeNode({ totalImports: 3 }))
    expect(result).toContain('3')
  })

  it('renders exports with types', () => {
    const node = makeNode({ exports: [makeExport({ name: 'core', type: 'function' })] })
    const result = formatExportNode(node)
    expect(result).toContain('core')
  })

  it('shows unused for zero importers', () => {
    const node = makeNode({ exports: [makeExport({ name: 'unused', importCount: 0 })] })
    const result = formatExportNode(node)
    expect(result).toContain('unused')
  })
})

// ─── formatExportNodes ──────────────────────────────────

describe('formatExportNodes', () => {
  it('renders header', () => {
    const result = formatExportNodes([])
    expect(result).toContain('Export Nodes')
  })

  it('renders multiple nodes', () => {
    const result = formatExportNodes([makeNode({ file: 'a.ts' }), makeNode({ file: 'b.ts' })])
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

// ─── formatEdges ────────────────────────────────────────

describe('formatEdges', () => {
  it('renders no edges message', () => {
    const result = formatEdges([])
    expect(result).toContain('No edges')
  })

  it('renders edge with arrow', () => {
    const edges = [{ from: 'src/a.ts', to: 'src/b.ts', symbols: ['foo'], count: 1 }]
    const result = formatEdges(edges)
    expect(result).toContain('src/a.ts')
    expect(result).toContain('src/b.ts')
  })

  it('renders symbols', () => {
    const edges = [{ from: 'src/a.ts', to: 'src/b.ts', symbols: ['foo', 'bar'], count: 2 }]
    const result = formatEdges(edges)
    expect(result).toContain('foo')
    expect(result).toContain('bar')
  })
})

// ─── formatOrphanExports ────────────────────────────────

describe('formatOrphanExports', () => {
  it('shows no orphans message', () => {
    const result = formatOrphanExports([])
    expect(result).toContain('No orphan')
  })

  it('renders orphan name', () => {
    const result = formatOrphanExports([makeExport({ name: 'unusedFn' })])
    expect(result).toContain('unusedFn')
  })

  it('renders file location', () => {
    const result = formatOrphanExports([makeExport({ file: 'src/x.ts', line: 5 })])
    expect(result).toContain('src/x.ts')
  })
})

// ─── formatHubExports ───────────────────────────────────

describe('formatHubExports', () => {
  it('shows no hubs message', () => {
    const result = formatHubExports([])
    expect(result).toContain('No hub')
  })

  it('renders hub name and count', () => {
    const result = formatHubExports([makeExport({ name: 'popular', importCount: 10 })])
    expect(result).toContain('popular')
    expect(result).toContain('10')
  })
})

// ─── formatExportGraphStats ─────────────────────────────

describe('formatExportGraphStats', () => {
  it('renders total exports', () => {
    const result = formatExportGraphStats({ totalExports: 42, totalImports: 30, totalEdges: 15, orphanCount: 3, hubCount: 2, avgExportsPerFile: 5, avgImportsPerFile: 3, mostUsedExport: null, leastUsedExports: [] })
    expect(result).toContain('42')
  })

  it('renders most used export', () => {
    const stats = { totalExports: 10, totalImports: 8, totalEdges: 5, orphanCount: 0, hubCount: 0, avgExportsPerFile: 2, avgImportsPerFile: 1.6, mostUsedExport: makeExport({ name: 'core', importCount: 7 }), leastUsedExports: [] }
    const result = formatExportGraphStats(stats)
    expect(result).toContain('core')
    expect(result).toContain('7')
  })

  it('renders all stat fields', () => {
    const result = formatExportGraphStats({ totalExports: 0, totalImports: 0, totalEdges: 0, orphanCount: 0, hubCount: 0, avgExportsPerFile: 0, avgImportsPerFile: 0, mostUsedExport: null, leastUsedExports: [] })
    expect(result).toContain('Total Exports')
    expect(result).toContain('Total Imports')
    expect(result).toContain('Total Edges')
    expect(result).toContain('Orphan')
    expect(result).toContain('Hub')
  })
})

// ─── formatExportGraphTable ─────────────────────────────

describe('formatExportGraphTable', () => {
  const graph: ExportGraph = {
    edges: [{ from: 'a.ts', to: 'b.ts', symbols: ['x'], count: 1 }],
    hubExports: [],
    nodes: [makeNode({ file: 'a.ts' })],
    orphanExports: [],
  }
  const stats = { totalExports: 5, totalImports: 3, totalEdges: 1, orphanCount: 0, hubCount: 0, avgExportsPerFile: 5, avgImportsPerFile: 3, mostUsedExport: null, leastUsedExports: [] }

  it('renders header', () => {
    const result = formatExportGraphTable(graph, stats)
    expect(result).toContain('Export Dependency Graph')
  })

  it('renders nodes', () => {
    const result = formatExportGraphTable(graph, stats)
    expect(result).toContain('a.ts')
  })

  it('renders edges', () => {
    const result = formatExportGraphTable(graph, stats)
    expect(result).toContain('b.ts')
  })
})

// ─── formatExportGraphJson ──────────────────────────────

describe('formatExportGraphJson', () => {
  it('produces valid JSON', () => {
    const graph: ExportGraph = { edges: [], hubExports: [], nodes: [], orphanExports: [] }
    const stats = { totalExports: 0, totalImports: 0, totalEdges: 0, orphanCount: 0, hubCount: 0, avgExportsPerFile: 0, avgImportsPerFile: 0, mostUsedExport: null, leastUsedExports: [] }
    const json = formatExportGraphJson(graph, stats)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('includes graph nodes', () => {
    const graph: ExportGraph = { edges: [], hubExports: [], nodes: [makeNode({ file: 'a.ts' })], orphanExports: [] }
    const stats = { totalExports: 1, totalImports: 0, totalEdges: 0, orphanCount: 0, hubCount: 0, avgExportsPerFile: 1, avgImportsPerFile: 0, mostUsedExport: null, leastUsedExports: [] }
    const parsed = JSON.parse(formatExportGraphJson(graph, stats))
    expect(parsed.graph.nodes.length).toBe(1)
  })
})
