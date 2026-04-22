import chalk from 'chalk'
import { describe, expect, test } from 'vitest'

import {
  displayCircularDependencies,
  displayDependencyTree,
  displayDotFormat,
  displayExternalModules,
  displayFullReport,
  formatOutput,
  graphToDotFormat,
} from '../../../src/commands/dependencies-display-helpers.js'
import type {
  DependenciesReport,
  DependencyGraph,
  DependencyNode,
  ImportInfo,
} from '../../../src/commands/dependencies-helpers.js'

// ============================================================================
// Factory Helpers
// ============================================================================

const makeNode = (overrides: Partial<DependencyNode> = {}): DependencyNode => ({
  filePath: '/src/test.ts',
  importDetails: new Map<string, ImportInfo>(),
  imports: new Set<string>(),
  ...overrides,
})

const makeGraph = (nodes: DependencyNode[]): DependencyGraph => ({
  nodes: new Map(nodes.map((node) => [node.filePath, node])),
})

const makeReport = (overrides: Partial<DependenciesReport> = {}): DependenciesReport => ({
  circularDependencies: [],
  externalModules: [],
  filesAnalyzed: 0,
  graph: { edges: [], nodes: [] },
  internalModules: [],
  orphanFiles: [],
  ...overrides,
})

// ============================================================================
// formatOutput
// ============================================================================

describe('formatOutput', () => {
  test('returns circular dependencies JSON when circular flag is set', () => {
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
      ],
    })
    const result = formatOutput(report, { circular: true })

    expect(result).toContain('circularDependencies')
    expect(result).not.toContain('externalModules')
  })

  test('returns external modules JSON when external flag is set', () => {
    const report = makeReport({
      externalModules: ['lodash', 'react'],
    })
    const result = formatOutput(report, { external: true })

    expect(result).toContain('externalModules')
    expect(result).not.toContain('circularDependencies')
  })

  test('returns DOT format when format is dot', () => {
    const report = makeReport({
      graph: {
        edges: [
          ['/a', '/b'],
          ['/b', '/c'],
        ],
        nodes: ['/a', '/b', '/c'],
      },
    })
    const result = formatOutput(report, { format: 'dot' })

    expect(result).toContain('digraph dependencies')
    expect(result).toContain('"/a" [label="/a"]')
    expect(result).toContain('"/a" -> "/b"')
  })

  test('returns full report JSON by default', () => {
    const report = makeReport({
      externalModules: ['lodash'],
      filesAnalyzed: 5,
      internalModules: ['./a'],
    })
    const result = formatOutput(report, {})

    expect(result).toContain('circularDependencies')
    expect(result).toContain('externalModules')
    expect(result).toContain('filesAnalyzed')
    expect(result).toContain('internalModules')
  })

  test('circular flag takes precedence over external flag', () => {
    const report = makeReport({
      circularDependencies: [{ cycle: ['/a', '/a'], location: { column: 1, end: 1, line: 1 } }],
      externalModules: ['lodash'],
    })
    const result = formatOutput(report, { circular: true, external: true })

    expect(result).toContain('circularDependencies')
    expect(result).not.toContain('externalModules')
  })

  test('external flag takes precedence over format dot', () => {
    const report = makeReport({
      externalModules: ['lodash'],
      graph: { edges: [['/a', '/b']], nodes: ['/a', '/b'] },
    })
    const result = formatOutput(report, { external: true, format: 'dot' })

    expect(result).toContain('externalModules')
    expect(result).not.toContain('digraph')
  })

  test('DOT format includes all nodes with labels', () => {
    const report = makeReport({
      graph: {
        edges: [],
        nodes: ['/src/a.ts', '/src/b.ts'],
      },
    })
    const result = formatOutput(report, { format: 'dot' })

    expect(result).toContain('"/src/a.ts" [label="/src/a.ts"]')
    expect(result).toContain('"/src/b.ts" [label="/src/b.ts"]')
  })

  test('DOT format includes all edges', () => {
    const report = makeReport({
      graph: {
        edges: [
          ['/a', '/b'],
          ['/b', '/c'],
          ['/c', '/a'],
        ],
        nodes: ['/a', '/b', '/c'],
      },
    })
    const result = formatOutput(report, { format: 'dot' })

    expect(result).toContain('"/a" -> "/b"')
    expect(result).toContain('"/b" -> "/c"')
    expect(result).toContain('"/c" -> "/a"')
  })

  test('DOT format handles empty graph', () => {
    const report = makeReport({
      graph: { edges: [], nodes: [] },
    })
    const result = formatOutput(report, { format: 'dot' })

    expect(result).toContain('digraph dependencies')
    expect(result).toContain('}')
  })

  test('JSON output is pretty printed with 2 spaces', () => {
    const report = makeReport({
      externalModules: ['a'],
    })
    const result = formatOutput(report, { external: true })

    expect(result).toContain('\n  "externalModules"')
  })

  test('circular flag with empty circular dependencies returns empty array', () => {
    const report = makeReport({ circularDependencies: [] })
    const result = formatOutput(report, { circular: true })
    const parsed = JSON.parse(result)
    expect(parsed.circularDependencies).toEqual([])
  })

  test('external flag with empty external modules returns empty array', () => {
    const report = makeReport({ externalModules: [] })
    const result = formatOutput(report, { external: true })
    const parsed = JSON.parse(result)
    expect(parsed.externalModules).toEqual([])
  })

  test('DOT format with nodes but no edges outputs only node declarations', () => {
    const report = makeReport({
      graph: { edges: [], nodes: ['alpha.ts', 'beta.ts'] },
    })
    const result = formatOutput(report, { format: 'dot' })
    expect(result).toContain('digraph dependencies')
    expect(result).toContain('"alpha.ts"')
    expect(result).not.toContain('->')
  })

  test('format flag with unrecognized value defaults to full JSON', () => {
    const report = makeReport({ filesAnalyzed: 99 })
    const result = formatOutput(report, { format: 'csv' })
    expect(result).toContain('filesAnalyzed')
    expect(result).toContain('99')
  })

  test('no flags returns full report as JSON', () => {
    const report = makeReport({
      filesAnalyzed: 3,
      orphanFiles: ['x.ts'],
    })
    const result = formatOutput(report, {})
    const parsed = JSON.parse(result)
    expect(parsed.filesAnalyzed).toBe(3)
    expect(parsed.orphanFiles).toEqual(['x.ts'])
  })

  test('DOT format handles single node graph', () => {
    const report = makeReport({
      graph: { edges: [], nodes: ['single.ts'] },
    })
    const result = formatOutput(report, { format: 'dot' })
    expect(result).toContain('"single.ts" [label="single.ts"]')
    expect(result).toContain('digraph dependencies')
    expect(result).toContain('}')
  })

  test('circular flag with location data preserved in JSON', () => {
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/b', '/c', '/a'], location: { column: 3, end: 15, line: 7 } },
      ],
    })
    const result = formatOutput(report, { circular: true })
    const parsed = JSON.parse(result)
    expect(parsed.circularDependencies[0].location).toEqual({ column: 3, end: 15, line: 7 })
    expect(parsed.circularDependencies[0].cycle).toEqual(['/a', '/b', '/c', '/a'])
  })

  test('DOT format with self-loop edge', () => {
    const report = makeReport({
      graph: { edges: [['self.ts', 'self.ts']], nodes: ['self.ts'] },
    })
    const result = formatOutput(report, { format: 'dot' })
    expect(result).toContain('"self.ts" -> "self.ts"')
  })

  test('full report JSON contains graph field', () => {
    const report = makeReport({
      graph: { edges: [['x.ts', 'y.ts']], nodes: ['x.ts', 'y.ts'] },
    })
    const result = formatOutput(report, {})
    const parsed = JSON.parse(result)
    expect(parsed.graph).toEqual({ edges: [['x.ts', 'y.ts']], nodes: ['x.ts', 'y.ts'] })
  })

  test('external flag with single module returns array of one', () => {
    const report = makeReport({ externalModules: ['only-pkg'] })
    const result = formatOutput(report, { external: true })
    const parsed = JSON.parse(result)
    expect(parsed.externalModules).toEqual(['only-pkg'])
    expect(parsed.externalModules).toHaveLength(1)
  })

  test('DOT format preserves edge order', () => {
    const report = makeReport({
      graph: {
        edges: [
          ['first.ts', 'second.ts'],
          ['second.ts', 'third.ts'],
          ['third.ts', 'first.ts'],
        ],
        nodes: ['first.ts', 'second.ts', 'third.ts'],
      },
    })
    const result = formatOutput(report, { format: 'dot' })
    const firstEdgeIdx = result.indexOf('"first.ts" -> "second.ts"')
    const secondEdgeIdx = result.indexOf('"second.ts" -> "third.ts"')
    const thirdEdgeIdx = result.indexOf('"third.ts" -> "first.ts"')
    expect(firstEdgeIdx).toBeLessThan(secondEdgeIdx)
    expect(secondEdgeIdx).toBeLessThan(thirdEdgeIdx)
  })

  test('circular flag ignores external modules data', () => {
    const report = makeReport({
      circularDependencies: [{ cycle: ['/a', '/a'], location: { column: 1, end: 1, line: 1 } }],
      externalModules: ['react', 'vue'],
    })
    const result = formatOutput(report, { circular: true })
    expect(result).not.toContain('react')
    expect(result).not.toContain('vue')
  })

  test('external flag ignores circular dependencies data', () => {
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
      ],
      externalModules: ['axios'],
    })
    const result = formatOutput(report, { external: true })
    expect(result).not.toContain('circular')
    expect(result).toContain('axios')
  })

  test('circular flag takes precedence over format dot', () => {
    const report = makeReport({
      circularDependencies: [{ cycle: ['/a', '/a'], location: { column: 1, end: 1, line: 1 } }],
      graph: { edges: [['/x', '/y']], nodes: ['/x', '/y'] },
    })
    const result = formatOutput(report, { circular: true, format: 'dot' })
    expect(result).toContain('circularDependencies')
    expect(result).not.toContain('digraph')
  })

  test('full report JSON contains orphanFiles field', () => {
    const report = makeReport({ orphanFiles: ['orphan.ts'] })
    const result = formatOutput(report, {})
    const parsed = JSON.parse(result)
    expect(parsed.orphanFiles).toEqual(['orphan.ts'])
  })

  test('full report JSON contains internalModules field', () => {
    const report = makeReport({ internalModules: ['./utils'] })
    const result = formatOutput(report, {})
    const parsed = JSON.parse(result)
    expect(parsed.internalModules).toEqual(['./utils'])
  })

  test('circular flag with multiple dependencies returns all in JSON', () => {
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 5, line: 1 } },
        { cycle: ['/x', '/y', '/z', '/x'], location: { column: 2, end: 8, line: 3 } },
        { cycle: ['/p', '/p'], location: { column: 1, end: 2, line: 5 } },
      ],
    })
    const result = formatOutput(report, { circular: true })
    const parsed = JSON.parse(result)
    expect(parsed.circularDependencies).toHaveLength(3)
  })

  test('external flag with many modules returns complete array', () => {
    const modules = Array.from({ length: 50 }, (_, i) => `pkg-${i}`)
    const report = makeReport({ externalModules: modules })
    const result = formatOutput(report, { external: true })
    const parsed = JSON.parse(result)
    expect(parsed.externalModules).toHaveLength(50)
    expect(parsed.externalModules[0]).toBe('pkg-0')
    expect(parsed.externalModules[49]).toBe('pkg-49')
  })

  test('DOT format with large graph handles many nodes', () => {
    const nodes = Array.from({ length: 30 }, (_, i) => `node${i}.ts`)
    const edges: [string, string][] = nodes.slice(0, 29).map((n, i) => [n, nodes[i + 1]])
    const report = makeReport({ graph: { edges, nodes } })
    const result = formatOutput(report, { format: 'dot' })
    expect(result).toContain('digraph dependencies')
    for (const node of nodes) {
      expect(result).toContain(`"${node}" [label="${node}"]`)
    }
  })

  test('full report JSON with zero values includes all fields', () => {
    const report = makeReport({
      circularDependencies: [],
      externalModules: [],
      filesAnalyzed: 0,
      internalModules: [],
      orphanFiles: [],
    })
    const result = formatOutput(report, {})
    const parsed = JSON.parse(result)
    expect(parsed.filesAnalyzed).toBe(0)
    expect(parsed.circularDependencies).toEqual([])
    expect(parsed.externalModules).toEqual([])
    expect(parsed.internalModules).toEqual([])
    expect(parsed.orphanFiles).toEqual([])
  })
})

// ============================================================================
// graphToDotFormat
// ============================================================================

describe('graphToDotFormat', () => {
  test('returns empty arrays for empty graph', () => {
    const graph = makeGraph([])
    const result = graphToDotFormat(graph)

    expect(result.nodes).toEqual([])
    expect(result.edges).toEqual([])
  })

  test('returns nodes for single node with no imports', () => {
    const graph = makeGraph([makeNode({ filePath: '/src/a.ts', imports: new Set() })])
    const result = graphToDotFormat(graph)

    expect(result.nodes).toEqual(['/src/a.ts'])
    expect(result.edges).toEqual([])
  })

  test('creates edge for relative import', () => {
    const graph = makeGraph([makeNode({ filePath: '/src/a.ts', imports: new Set(['./b']) })])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]).toEqual(['/src/a.ts', './b'])
  })

  test('excludes external imports from edges', () => {
    const graph = makeGraph([
      makeNode({ filePath: '/src/a.ts', imports: new Set(['lodash', 'react']) }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.edges).toEqual([])
  })

  test('includes only relative imports as edges', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/a.ts',
        imports: new Set(['./b', 'lodash', './c', 'react']),
      }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(2)
    expect(result.edges).toContainEqual(['/src/a.ts', './b'])
    expect(result.edges).toContainEqual(['/src/a.ts', './c'])
  })

  test('handles multiple nodes with edges between them', () => {
    const graph = makeGraph([
      makeNode({ filePath: '/src/a.ts', imports: new Set(['./b', './c']) }),
      makeNode({ filePath: '/src/b.ts', imports: new Set(['./c']) }),
      makeNode({ filePath: '/src/c.ts', imports: new Set() }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.nodes).toHaveLength(3)
    expect(result.edges).toHaveLength(3)
  })

  test('preserves node order from graph', () => {
    const graph = makeGraph([
      makeNode({ filePath: '/z.ts', imports: new Set() }),
      makeNode({ filePath: '/a.ts', imports: new Set() }),
      makeNode({ filePath: '/m.ts', imports: new Set() }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.nodes).toEqual(['/z.ts', '/a.ts', '/m.ts'])
  })

  test('handles parent directory imports', () => {
    const graph = makeGraph([makeNode({ filePath: '/src/sub/a.ts', imports: new Set(['../b']) })])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]).toEqual(['/src/sub/a.ts', '../b'])
  })

  test('handles single dot relative import', () => {
    const graph = makeGraph([makeNode({ filePath: '/src/a.ts', imports: new Set(['.']) })])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]).toEqual(['/src/a.ts', '.'])
  })

  test('handles deeply nested relative imports', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/deep/nested/file.ts',
        imports: new Set(['../../sibling']),
      }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]).toEqual(['/src/deep/nested/file.ts', '../../sibling'])
  })

  test('handles node with many relative imports', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/index.ts',
        imports: new Set(['./a', './b', './c', './d', './e']),
      }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(5)
    expect(result.nodes).toEqual(['/src/index.ts'])
  })

  test('handles node with only external imports producing no edges', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/vendor.ts',
        imports: new Set(['express', 'cors', 'helmet', 'morgan']),
      }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.edges).toEqual([])
    expect(result.nodes).toEqual(['/src/vendor.ts'])
  })

  test('handles mixed import styles from same node', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/mixed.ts',
        imports: new Set(['./local', '../parent', 'axios', '@scope/pkg', './utils']),
      }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(3)
    expect(result.nodes).toEqual(['/src/mixed.ts'])
  })

  test('excludes scoped package imports from edges', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/app.ts',
        imports: new Set(['@angular/core', '@nestjs/common', './local']),
      }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]).toEqual(['/src/app.ts', './local'])
  })

  test('import starting with triple dots is treated as relative', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/a.ts',
        imports: new Set(['...weird', './normal']),
      }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(2)
    expect(result.edges).toContainEqual(['/src/a.ts', '...weird'])
    expect(result.edges).toContainEqual(['/src/a.ts', './normal'])
  })

  test('handles node with empty importDetails map', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/a.ts',
        importDetails: new Map<string, ImportInfo>(),
        imports: new Set(['./b']),
      }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(1)
    expect(result.nodes).toEqual(['/src/a.ts'])
  })

  test('handles many nodes producing many edges', () => {
    const nodes = Array.from({ length: 20 }, (_, i) =>
      makeNode({
        filePath: `/src/file${i}.ts`,
        imports: new Set([`./dep${i}`]),
      }),
    )
    const graph = makeGraph(nodes)
    const result = graphToDotFormat(graph)

    expect(result.nodes).toHaveLength(20)
    expect(result.edges).toHaveLength(20)
  })

  test('handles node with relative import containing slashes', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/a.ts',
        imports: new Set(['./sub/deep/module']),
      }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]).toEqual(['/src/a.ts', './sub/deep/module'])
  })

  test('two nodes importing same target produce two edges', () => {
    const graph = makeGraph([
      makeNode({ filePath: '/src/a.ts', imports: new Set(['./shared']) }),
      makeNode({ filePath: '/src/b.ts', imports: new Set(['./shared']) }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(2)
    expect(result.edges).toContainEqual(['/src/a.ts', './shared'])
    expect(result.edges).toContainEqual(['/src/b.ts', './shared'])
  })

  test('node with no imports produces only a node entry', () => {
    const graph = makeGraph([makeNode({ filePath: '/src/empty.ts', imports: new Set() })])
    const result = graphToDotFormat(graph)

    expect(result.nodes).toEqual(['/src/empty.ts'])
    expect(result.edges).toEqual([])
  })

  test('relative import with only dot produces edge', () => {
    const graph = makeGraph([makeNode({ filePath: '/src/index.ts', imports: new Set(['.']) })])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]).toEqual(['/src/index.ts', '.'])
  })

  test('imports with importDetails populated are still filtered correctly', () => {
    const importDetails = new Map<string, ImportInfo>()
    importDetails.set('./local', {
      endColumn: 20,
      endLine: 1,
      importedNames: ['foo'],
      isTypeOnly: false,
      originalLine: "import { foo } from './local'",
      startColumn: 1,
      startLine: 1,
    })
    importDetails.set('external-pkg', {
      endColumn: 40,
      endLine: 2,
      importedNames: ['bar'],
      isTypeOnly: false,
      originalLine: "import { bar } from 'external-pkg'",
      startColumn: 1,
      startLine: 2,
    })
    const graph = makeGraph([
      makeNode({
        filePath: '/src/a.ts',
        importDetails,
        imports: new Set(['./local', 'external-pkg']),
      }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]).toEqual(['/src/a.ts', './local'])
  })

  test('handles node with relative import containing underscores', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/a.ts',
        imports: new Set(['./my_module']),
      }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]).toEqual(['/src/a.ts', './my_module'])
  })

  test('handles node with relative import containing dashes', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/a.ts',
        imports: new Set(['./my-component']),
      }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]).toEqual(['/src/a.ts', './my-component'])
  })

  test('handles graph with single node having both relative and external imports', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/mixed.ts',
        imports: new Set(['./a', 'lodash', './b', 'react', './c']),
      }),
    ])
    const result = graphToDotFormat(graph)

    expect(result.edges).toHaveLength(3)
    expect(result.nodes).toHaveLength(1)
  })
})

// ============================================================================
// displayCircularDependencies
// ============================================================================

describe('displayCircularDependencies', () => {
  test('displays success message when no circular dependencies', () => {
    const logs: string[] = []
    const report = makeReport({ circularDependencies: [] })

    displayCircularDependencies(report, 'table', (m) => logs.push(m))

    expect(logs).toHaveLength(1)
    expect(logs[0]).toContain('No circular dependencies')
  })

  test('displays JSON when format is json', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
      ],
    })

    displayCircularDependencies(report, 'json', (m) => logs.push(m))

    expect(logs).toHaveLength(1)
    expect(logs[0]).toContain('circularDependencies')
  })

  test('displays cycle count and details in table format', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
      ],
    })

    displayCircularDependencies(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toContain('circular dependencies')
    expect(logs[1]).toContain('Cycle:')
  })

  test('displays multiple cycles in table format', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
        { cycle: ['/c', '/d', '/c'], location: { column: 1, end: 10, line: 2 } },
      ],
    })

    displayCircularDependencies(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toContain('2 circular dependencies')
    expect(logs).toHaveLength(3)
  })

  test('success message is green colored', () => {
    const logs: string[] = []
    const report = makeReport({ circularDependencies: [] })

    displayCircularDependencies(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toBe(chalk.green('✓ No circular dependencies found!'))
  })

  test('cycle details are red colored in table format', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/x', '/y', '/x'], location: { column: 1, end: 10, line: 1 } },
      ],
    })

    displayCircularDependencies(report, 'table', (m) => logs.push(m))

    expect(logs[1]).toBe(chalk.red('  Cycle: /x -> /y -> /x'))
  })

  test('JSON format includes location data', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/b', '/a'], location: { column: 5, end: 20, line: 3 } },
      ],
    })

    displayCircularDependencies(report, 'json', (m) => logs.push(m))

    const parsed = JSON.parse(logs[0])
    expect(parsed.circularDependencies[0].location.line).toBe(3)
  })

  test('table format header message is red colored', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
      ],
    })

    displayCircularDependencies(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toBe(chalk.red('\nFound 1 circular dependencies:\n'))
  })

  test('handles large number of circular dependencies', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: Array.from({ length: 50 }, (_, i) => ({
        cycle: [`/a${i}`, `/b${i}`, `/a${i}`],
        location: { column: 1, end: 10, line: i + 1 },
      })),
    })

    displayCircularDependencies(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toContain('50 circular dependencies')
    expect(logs).toHaveLength(51)
  })

  test('empty format defaults to table format', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [{ cycle: ['/a', '/a'], location: { column: 1, end: 5, line: 1 } }],
    })

    displayCircularDependencies(report, '', (m) => logs.push(m))

    expect(logs[0]).toContain('circular dependencies')
    expect(logs[1]).toContain('Cycle:')
  })

  test('handles self-referencing single-node cycle', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [{ cycle: ['/a', '/a'], location: { column: 1, end: 5, line: 1 } }],
    })

    displayCircularDependencies(report, 'table', (m) => logs.push(m))

    expect(logs[1]).toBe(chalk.red('  Cycle: /a -> /a'))
  })

  test('handles long cycle with many nodes', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        {
          cycle: ['/a', '/b', '/c', '/d', '/e', '/f', '/a'],
          location: { column: 1, end: 20, line: 1 },
        },
      ],
    })

    displayCircularDependencies(report, 'table', (m) => logs.push(m))

    expect(logs[1]).toContain('/a -> /b -> /c -> /d -> /e -> /f -> /a')
  })

  test('table format works with explicit format string', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/x', '/y', '/x'], location: { column: 1, end: 5, line: 1 } },
      ],
    })

    displayCircularDependencies(report, 'table', (m) => logs.push(m))

    expect(logs).toHaveLength(2)
    expect(logs[0]).toContain('circular dependencies')
    expect(logs[1]).toContain('Cycle:')
  })

  test('JSON format is valid parseable JSON', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
      ],
    })

    displayCircularDependencies(report, 'json', (m) => logs.push(m))

    const parsed = JSON.parse(logs[0])
    expect(parsed).toHaveProperty('circularDependencies')
    expect(Array.isArray(parsed.circularDependencies)).toBe(true)
  })

  test('handles two cycles of different lengths', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/a'], location: { column: 1, end: 5, line: 1 } },
        { cycle: ['/x', '/y', '/z', '/x'], location: { column: 1, end: 10, line: 5 } },
      ],
    })

    displayCircularDependencies(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toContain('2 circular dependencies')
    expect(logs[1]).toBe(chalk.red('  Cycle: /a -> /a'))
    expect(logs[2]).toBe(chalk.red('  Cycle: /x -> /y -> /z -> /x'))
  })

  test('no circular dependencies with json format returns empty array', () => {
    const logs: string[] = []
    const report = makeReport({ circularDependencies: [] })

    displayCircularDependencies(report, 'json', (m) => logs.push(m))

    expect(logs).toHaveLength(1)
    expect(logs[0]).toContain('No circular dependencies')
  })

  test('json format with multiple cycles returns all cycles', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 5, line: 1 } },
        { cycle: ['/c', '/d', '/e', '/c'], location: { column: 1, end: 10, line: 5 } },
      ],
    })

    displayCircularDependencies(report, 'json', (m) => logs.push(m))

    const parsed = JSON.parse(logs[0])
    expect(parsed.circularDependencies).toHaveLength(2)
  })

  test('table format cycle details preserve path order', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        {
          cycle: ['/alpha', '/beta', '/gamma', '/alpha'],
          location: { column: 1, end: 10, line: 1 },
        },
      ],
    })

    displayCircularDependencies(report, 'table', (m) => logs.push(m))

    expect(logs[1]).toBe(chalk.red('  Cycle: /alpha -> /beta -> /gamma -> /alpha'))
  })

  test('single cycle shows count of 1 in header', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 5, line: 1 } },
      ],
    })

    displayCircularDependencies(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toBe(chalk.red('\nFound 1 circular dependencies:\n'))
  })

  test('json format output is pretty-printed', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [{ cycle: ['/a', '/a'], location: { column: 1, end: 5, line: 1 } }],
    })

    displayCircularDependencies(report, 'json', (m) => logs.push(m))

    expect(logs[0]).toContain('\n  "circularDependencies"')
  })

  test('success message contains checkmark character', () => {
    const logs: string[] = []
    const report = makeReport({ circularDependencies: [] })

    displayCircularDependencies(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toContain('✓')
  })

  test('json format with empty array when no circular deps returns green message', () => {
    const logs: string[] = []
    const report = makeReport({ circularDependencies: [] })

    displayCircularDependencies(report, 'json', (m) => logs.push(m))

    expect(logs[0]).toBe(chalk.green('✓ No circular dependencies found!'))
  })

  test('table format with three cycles shows all three', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/a'], location: { column: 1, end: 2, line: 1 } },
        { cycle: ['/b', '/c', '/b'], location: { column: 1, end: 5, line: 3 } },
        { cycle: ['/d', '/e', '/f', '/d'], location: { column: 1, end: 8, line: 7 } },
      ],
    })

    displayCircularDependencies(report, 'table', (m) => logs.push(m))

    expect(logs).toHaveLength(4)
    expect(logs[0]).toContain('3 circular dependencies')
    expect(logs[1]).toContain('/a -> /a')
    expect(logs[2]).toContain('/b -> /c -> /b')
    expect(logs[3]).toContain('/d -> /e -> /f -> /d')
  })
})

// ============================================================================
// displayDependencyTree
// ============================================================================

describe('displayDependencyTree', () => {
  test('displays dependency tree header', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [['a.ts', 'b.ts']], nodes: ['a.ts', 'b.ts'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs.some((l) => l.includes('Dependency Tree'))).toBe(true)
  })

  test('displays no root files message when all files have imports', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [['a.ts', 'b.ts']], nodes: ['b.ts'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs.some((l) => l.includes('No root files found'))).toBe(true)
  })

  test('truncates when more than 5 root files', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [], nodes: ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts', 'f.ts'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs.some((l) => l.includes('more root files'))).toBe(true)
  })

  test('does not truncate when exactly 5 root files', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [], nodes: ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs.some((l) => l.includes('more root files'))).toBe(false)
  })

  test('renders root nodes in cyan when no children', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [], nodes: ['a.ts'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs.some((l) => l === chalk.cyan('a.ts'))).toBe(true)
  })

  test('renders parent nodes in green', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [['a.ts', 'b.ts']], nodes: ['a.ts', 'b.ts'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs.some((l) => l === chalk.green('a.ts'))).toBe(true)
  })

  test('renders already-visited nodes as dim', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [
          ['root.ts', 'shared.ts'],
          ['root.ts', 'consumer.ts'],
          ['consumer.ts', 'shared.ts'],
        ],
        nodes: ['root.ts'],
      },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    const dimShared = chalk.dim('shared.ts')
    expect(logs.some((l) => l.includes(dimShared))).toBe(true)
  })

  test('header includes box emoji', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [], nodes: ['a.ts'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs[0]).toContain('📦')
  })

  test('truncation message shows correct remaining count', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [], nodes: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs.some((l) => l.includes('3 more root files'))).toBe(true)
  })

  test('shows exactly 5 root files before truncation', () => {
    const logs: string[] = []
    const nodes = ['r1.ts', 'r2.ts', 'r3.ts', 'r4.ts', 'r5.ts', 'r6.ts', 'r7.ts']
    const report = makeReport({
      graph: { edges: [], nodes },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    const rootLogs = logs.filter((l) => l.includes('r') && l.includes('.ts'))
    const displayedRoots = rootLogs.filter(
      (l) => !l.includes('more root') && !l.includes('Dependency Tree'),
    )
    expect(displayedRoots.length).toBe(5)
  })

  test('no root files message is dim styled', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [['a.ts', 'b.ts']], nodes: ['b.ts'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs.some((l) => l === chalk.dim('No root files found (all files have imports)'))).toBe(
      true,
    )
  })

  test('renders multi-level tree with indentation', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [
          ['root.ts', 'child.ts'],
          ['child.ts', 'grandchild.ts'],
        ],
        nodes: ['root.ts'],
      },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    const grandchildLog = logs.find((l) => l.includes('grandchild.ts'))
    expect(grandchildLog).toBeDefined()
    expect(grandchildLog!.startsWith('    ')).toBe(true)
  })

  test('stops recursion at depth > 10 by dimming deep nodes', () => {
    const logs: string[] = []
    const edges: [string, string][] = []
    let current = 'level0.ts'
    for (let i = 1; i <= 12; i++) {
      const next = `level${i}.ts`
      edges.push([current, next])
      current = next
    }

    const report = makeReport({
      graph: { edges, nodes: ['level0.ts'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    // Root starts at depth 1, so level9 (depth 10) still recurses,
    // level10 (depth 11 > 10) gets dimmed and stops recursion.
    const dimmedLog = logs.find((l) => l.includes('level10.ts'))
    expect(dimmedLog).toBeDefined()
    expect(dimmedLog).toContain(chalk.dim('level10.ts'))
  })

  test('handles empty graph with no nodes', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [], nodes: [] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs.some((l) => l.includes('No root files found'))).toBe(true)
  })

  test('handles node that is both root and child', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [
          ['a.ts', 'b.ts'],
          ['c.ts', 'a.ts'],
        ],
        nodes: ['a.ts', 'c.ts'],
      },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs.some((l) => l.includes('a.ts'))).toBe(true)
    expect(logs.some((l) => l.includes('c.ts'))).toBe(true)
  })

  test('depth exactly 10 still renders as green parent', () => {
    const logs: string[] = []
    const edges: [string, string][] = []
    let current = 'level0.ts'
    for (let i = 1; i <= 9; i++) {
      const next = `level${i}.ts`
      edges.push([current, next])
      current = next
    }
    edges.push(['level9.ts', 'leaf.ts'])

    const report = makeReport({
      graph: { edges, nodes: ['level0.ts'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    const leafLog = logs.find((l) => l.includes('leaf.ts'))
    expect(leafLog).toBeDefined()
  })

  test('node with many children renders all of them', () => {
    const logs: string[] = []
    const edges: [string, string][] = Array.from({ length: 8 }, (_, i) => [
      'root.ts',
      `child${i}.ts`,
    ])
    const report = makeReport({
      graph: { edges, nodes: ['root.ts'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    for (let i = 0; i < 8; i++) {
      expect(logs.some((l) => l.includes(`child${i}.ts`))).toBe(true)
    }
  })

  test('multiple roots each with independent subtrees', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [
          ['root1.ts', 'child1.ts'],
          ['root2.ts', 'child2.ts'],
        ],
        nodes: ['root1.ts', 'root2.ts'],
      },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs.some((l) => l.includes('root1.ts'))).toBe(true)
    expect(logs.some((l) => l.includes('root2.ts'))).toBe(true)
    expect(logs.some((l) => l.includes('child1.ts'))).toBe(true)
    expect(logs.some((l) => l.includes('child2.ts'))).toBe(true)
  })

  test('shared child visited only once appears dim on second visit', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [
          ['root.ts', 'shared.ts'],
          ['root.ts', 'other.ts'],
          ['other.ts', 'shared.ts'],
        ],
        nodes: ['root.ts'],
      },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    const sharedLogs = logs.filter((l) => l.includes('shared.ts'))
    expect(sharedLogs.length).toBeGreaterThanOrEqual(2)
    const dimShared = sharedLogs.find((l) => l.includes(chalk.dim('shared.ts')))
    expect(dimShared).toBeDefined()
  })

  test('tree header has bold styling', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [], nodes: ['a.ts'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs[0]).toBe(chalk.bold('\n📦 Dependency Tree\n'))
  })

  test('root node with children renders as green', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [['root.ts', 'leaf.ts']], nodes: ['root.ts'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs.some((l) => l === chalk.green('root.ts'))).toBe(true)
  })

  test('leaf node renders as cyan', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [['root.ts', 'leaf.ts']], nodes: ['root.ts'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs.some((l) => l === '  ' + chalk.cyan('leaf.ts'))).toBe(true)
  })

  test('exactly 6 root files shows truncation with 1 remaining', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [], nodes: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    expect(logs.some((l) => l.includes('1 more root files'))).toBe(true)
  })

  test('tree with all nodes as roots when no edges', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [], nodes: ['a.ts', 'b.ts', 'c.ts'] },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    const rootLogs = logs.filter(
      (l) => l === chalk.cyan('a.ts') || l === chalk.cyan('b.ts') || l === chalk.cyan('c.ts'),
    )
    expect(rootLogs).toHaveLength(3)
  })

  test('diamond dependency renders shared node dim on second visit', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [
          ['root.ts', 'left.ts'],
          ['root.ts', 'right.ts'],
          ['left.ts', 'shared.ts'],
          ['right.ts', 'shared.ts'],
        ],
        nodes: ['root.ts'],
      },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    const sharedLogs = logs.filter((l) => l.includes('shared.ts'))
    const dimShared = sharedLogs.find((l) => l.includes(chalk.dim('shared.ts')))
    expect(dimShared).toBeDefined()
  })

  test('node that is child of multiple parents appears dim for second parent', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [
          ['parent1.ts', 'child.ts'],
          ['parent2.ts', 'child.ts'],
        ],
        nodes: ['parent1.ts', 'parent2.ts'],
      },
    })

    displayDependencyTree(report, (m) => logs.push(m))

    const childLogs = logs.filter((l) => l.includes('child.ts'))
    expect(childLogs.length).toBeGreaterThanOrEqual(2)
  })
})

// ============================================================================
// displayDotFormat
// ============================================================================

describe('displayDotFormat', () => {
  test('outputs valid dot format with nodes and edges', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [['a.ts', 'b.ts']], nodes: ['a.ts', 'b.ts'] },
    })

    displayDotFormat(report, (m) => logs.push(m))

    expect(logs[0]).toBe('digraph dependencies {')
    expect(logs[logs.length - 1]).toBe('}')
    expect(logs.some((l) => l.includes('a.ts'))).toBe(true)
    expect(logs.some((l) => l.includes('->'))).toBe(true)
  })

  test('handles empty graph', () => {
    const logs: string[] = []
    const report = makeReport({ graph: { edges: [], nodes: [] } })

    displayDotFormat(report, (m) => logs.push(m))

    expect(logs[0]).toBe('digraph dependencies {')
    expect(logs[logs.length - 1]).toBe('}')
  })

  test('includes empty line between nodes and edges', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [['a.ts', 'b.ts']], nodes: ['a.ts', 'b.ts'] },
    })

    displayDotFormat(report, (m) => logs.push(m))

    expect(logs).toContain('')
  })

  test('formats node labels with quotes', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [], nodes: ['src/index.ts'] },
    })

    displayDotFormat(report, (m) => logs.push(m))

    expect(logs.some((l) => l === '  "src/index.ts" [label="src/index.ts"];')).toBe(true)
  })

  test('formats edges with arrows', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [['a.ts', 'b.ts']], nodes: ['a.ts', 'b.ts'] },
    })

    displayDotFormat(report, (m) => logs.push(m))

    expect(logs.some((l) => l === '  "a.ts" -> "b.ts";')).toBe(true)
  })

  test('handles multiple edges correctly', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [
          ['a.ts', 'b.ts'],
          ['a.ts', 'c.ts'],
          ['b.ts', 'c.ts'],
        ],
        nodes: ['a.ts', 'b.ts', 'c.ts'],
      },
    })

    displayDotFormat(report, (m) => logs.push(m))

    const edgeLogs = logs.filter((l) => l.includes('->'))
    expect(edgeLogs).toHaveLength(3)
  })

  test('empty line separator appears between nodes and edges sections', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [['x.ts', 'y.ts']], nodes: ['x.ts', 'y.ts'] },
    })

    displayDotFormat(report, (m) => logs.push(m))

    const emptyIndex = logs.indexOf('')
    const nodeLogs = logs.filter((l) => l.includes('[label='))
    const edgeLogs = logs.filter((l) => l.includes('->'))
    expect(emptyIndex).toBeGreaterThan(
      nodeLogs[nodeLogs.length - 1] ? logs.indexOf(nodeLogs[nodeLogs.length - 1]) : -1,
    )
    expect(emptyIndex).toBeLessThan(logs.indexOf(edgeLogs[0]))
  })

  test('handles node with spaces in name', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [], nodes: ['my file.ts'] },
    })

    displayDotFormat(report, (m) => logs.push(m))

    expect(logs.some((l) => l.includes('"my file.ts" [label="my file.ts"]'))).toBe(true)
  })

  test('handles self-loop edge in dot output', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [['loop.ts', 'loop.ts']], nodes: ['loop.ts'] },
    })

    displayDotFormat(report, (m) => logs.push(m))

    expect(logs.some((l) => l === '  "loop.ts" -> "loop.ts";')).toBe(true)
  })

  test('outputs nodes in given order', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [], nodes: ['z.ts', 'a.ts', 'm.ts'] },
    })

    displayDotFormat(report, (m) => logs.push(m))

    const nodeLogs = logs.filter((l) => l.includes('[label='))
    expect(nodeLogs[0]).toContain('z.ts')
    expect(nodeLogs[1]).toContain('a.ts')
    expect(nodeLogs[2]).toContain('m.ts')
  })

  test('empty graph still has opening and closing braces', () => {
    const logs: string[] = []
    const report = makeReport({ graph: { edges: [], nodes: [] } })

    displayDotFormat(report, (m) => logs.push(m))

    expect(logs[0]).toBe('digraph dependencies {')
    expect(logs[1]).toBe('')
    expect(logs[2]).toBe('}')
  })

  test('multiple edges from same source node', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [
          ['hub.ts', 'a.ts'],
          ['hub.ts', 'b.ts'],
          ['hub.ts', 'c.ts'],
        ],
        nodes: ['hub.ts', 'a.ts', 'b.ts', 'c.ts'],
      },
    })

    displayDotFormat(report, (m) => logs.push(m))

    const hubEdges = logs.filter((l) => l.includes('hub.ts') && l.includes('->'))
    expect(hubEdges).toHaveLength(3)
  })

  test('node name with forward slashes formats correctly', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [], nodes: ['src/components/Button.tsx'] },
    })

    displayDotFormat(report, (m) => logs.push(m))

    expect(
      logs.some((l) => l === '  "src/components/Button.tsx" [label="src/components/Button.tsx"];'),
    ).toBe(true)
  })

  test('multiple edges to same target node', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [
          ['a.ts', 'target.ts'],
          ['b.ts', 'target.ts'],
          ['c.ts', 'target.ts'],
        ],
        nodes: ['a.ts', 'b.ts', 'c.ts', 'target.ts'],
      },
    })

    displayDotFormat(report, (m) => logs.push(m))

    const targetEdges = logs.filter((l) => l.includes('->') && l.includes('target.ts'))
    expect(targetEdges).toHaveLength(3)
  })

  test('outputs correct number of total log lines', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [['a.ts', 'b.ts']],
        nodes: ['a.ts', 'b.ts'],
      },
    })

    displayDotFormat(report, (m) => logs.push(m))

    // opening brace + 2 node lines + empty line + 1 edge line + closing brace = 6
    expect(logs).toHaveLength(6)
  })

  test('node labels use semicolons', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [], nodes: ['a.ts'] },
    })

    displayDotFormat(report, (m) => logs.push(m))

    expect(logs.some((l) => l.endsWith('];'))).toBe(true)
  })

  test('edge lines use semicolons', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [['a.ts', 'b.ts']], nodes: ['a.ts', 'b.ts'] },
    })

    displayDotFormat(report, (m) => logs.push(m))

    const edgeLogs = logs.filter((l) => l.includes('->'))
    expect(edgeLogs.every((l) => l.endsWith(';'))).toBe(true)
  })

  test('handles nodes with extensions other than ts', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [['app.js', 'utils.js']],
        nodes: ['app.js', 'utils.js', 'styles.css'],
      },
    })

    displayDotFormat(report, (m) => logs.push(m))

    expect(logs.some((l) => l.includes('styles.css'))).toBe(true)
    expect(logs.some((l) => l.includes('app.js') && l.includes('->'))).toBe(true)
  })

  test('handles edge with special characters in node names', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [['$app', '@scope/pkg']], nodes: ['$app', '@scope/pkg'] },
    })

    displayDotFormat(report, (m) => logs.push(m))

    expect(logs.some((l) => l.includes('"$app" -> "@scope/pkg";'))).toBe(true)
  })
})

// ============================================================================
// displayExternalModules
// ============================================================================

describe('displayExternalModules', () => {
  test('displays message when no external modules', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: [] })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs).toHaveLength(1)
    expect(logs[0]).toContain('No external dependencies')
  })

  test('displays JSON format', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['lodash', 'react'] })

    displayExternalModules(report, 'json', (m) => logs.push(m))

    expect(logs).toHaveLength(1)
    expect(logs[0]).toContain('externalModules')
  })

  test('displays module list in table format', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['lodash'] })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toContain('External modules')
    expect(logs[1]).toContain('lodash')
  })

  test('no external modules message is green', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: [] })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toBe(chalk.green('✓ No external dependencies found'))
  })

  test('module names are dim styled in table format', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['chalk'] })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs[1]).toBe(`  ${chalk.dim('chalk')}`)
  })

  test('displays multiple external modules', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['lodash', 'react', 'vitest'] })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toContain('3')
    expect(logs).toHaveLength(4)
  })

  test('JSON output includes all modules', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['lodash', 'react'] })

    displayExternalModules(report, 'json', (m) => logs.push(m))

    expect(logs[0]).toContain('lodash')
    expect(logs[0]).toContain('react')
  })

  test('table header includes module count', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['a', 'b', 'c', 'd'] })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toContain('(4)')
  })

  test('empty string format behaves like table format', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['express'] })

    displayExternalModules(report, '', (m) => logs.push(m))

    expect(logs[0]).toContain('External modules')
  })

  test('single module displays correctly in table format', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['axios'] })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs).toHaveLength(2)
    expect(logs[0]).toContain('1')
    expect(logs[1]).toContain('axios')
  })

  test('handles scoped packages (@scope/pkg)', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['@angular/core', '@nestjs/common'] })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('@angular/core'))).toBe(true)
    expect(logs.some((l) => l.includes('@nestjs/common'))).toBe(true)
    expect(logs[0]).toContain('2')
  })

  test('JSON format with scoped packages is valid JSON', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['@scope/pkg'] })

    displayExternalModules(report, 'json', (m) => logs.push(m))

    const parsed = JSON.parse(logs[0])
    expect(parsed.externalModules).toEqual(['@scope/pkg'])
  })

  test('module names with hyphens display correctly', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['node-fetch', 'is-plain-object'] })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('node-fetch'))).toBe(true)
    expect(logs.some((l) => l.includes('is-plain-object'))).toBe(true)
  })

  test('large number of external modules displays all', () => {
    const logs: string[] = []
    const modules = Array.from({ length: 25 }, (_, i) => `pkg-${i}`)
    const report = makeReport({ externalModules: modules })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toContain('25')
    expect(logs).toHaveLength(26)
  })

  test('module with dots in name displays correctly', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['lodash.debounce'] })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('lodash.debounce'))).toBe(true)
  })

  test('table format with exactly 2 modules shows both', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['alpha', 'beta'] })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs).toHaveLength(3)
    expect(logs[0]).toContain('(2)')
    expect(logs[1]).toContain('alpha')
    expect(logs[2]).toContain('beta')
  })

  test('json format preserves module order', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['first', 'second', 'third'] })

    displayExternalModules(report, 'json', (m) => logs.push(m))

    const parsed = JSON.parse(logs[0])
    expect(parsed.externalModules).toEqual(['first', 'second', 'third'])
  })

  test('table format module names have two-space indent', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['my-pkg'] })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs[1]).toBe(`  ${chalk.dim('my-pkg')}`)
  })

  test('handles module names with underscores', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['my_awesome_lib'] })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('my_awesome_lib'))).toBe(true)
  })

  test('json format with single module returns valid JSON', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['solo'] })

    displayExternalModules(report, 'json', (m) => logs.push(m))

    const parsed = JSON.parse(logs[0])
    expect(parsed.externalModules).toEqual(['solo'])
  })

  test('table header includes External modules text', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['pkg'] })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toContain('External modules')
  })

  test('table header is cyan colored', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['pkg'] })

    displayExternalModules(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toContain(chalk.cyan('External modules'))
  })
})

// ============================================================================
// displayFullReport
// ============================================================================

describe('displayFullReport', () => {
  test('displays JSON format', () => {
    const logs: string[] = []
    const report = makeReport({ filesAnalyzed: 5 })

    displayFullReport(report, 'json', (m) => logs.push(m))

    expect(logs).toHaveLength(1)
    expect(logs[0]).toContain('filesAnalyzed')
  })

  test('delegates to dot format when format is dot', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [['a.ts', 'b.ts']], nodes: ['a.ts', 'b.ts'] },
    })

    displayFullReport(report, 'dot', (m) => logs.push(m))

    expect(logs[0]).toBe('digraph dependencies {')
  })

  test('displays circular dependencies section', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 20, line: 5 } },
      ],
      filesAnalyzed: 2,
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('Circular Dependencies'))).toBe(true)
  })

  test('displays no circular dependencies message when none found', () => {
    const logs: string[] = []
    const report = makeReport({ filesAnalyzed: 2 })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('No circular dependencies'))).toBe(true)
  })

  test('displays internal modules section', () => {
    const logs: string[] = []
    const report = makeReport({ internalModules: ['./utils', './helpers'] })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('Internal Modules'))).toBe(true)
  })

  test('displays external modules section', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: ['lodash', 'react'] })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('External Modules'))).toBe(true)
  })

  test('displays orphan files section', () => {
    const logs: string[] = []
    const report = makeReport({ orphanFiles: ['orphan.ts'] })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('Orphan Files'))).toBe(true)
  })

  test('truncates circular dependencies when more than 5', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: Array.from({ length: 10 }, (_, i) => ({
        cycle: [`a${i}.ts`, `b${i}.ts`],
        location: { line: 1, column: 1, end: 10 },
      })),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('and 5 more'))).toBe(true)
  })

  test('truncates internal modules when more than 10', () => {
    const logs: string[] = []
    const report = makeReport({
      internalModules: Array.from({ length: 15 }, (_, i) => `./module${i}`),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('and 5 more'))).toBe(true)
  })

  test('truncates external modules when more than 10', () => {
    const logs: string[] = []
    const report = makeReport({
      externalModules: Array.from({ length: 15 }, (_, i) => `npm-package-${i}`),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('and 5 more'))).toBe(true)
  })

  test('truncates orphan files when more than 5', () => {
    const logs: string[] = []
    const report = makeReport({
      orphanFiles: Array.from({ length: 10 }, (_, i) => `orphan${i}.ts`),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('and 5 more'))).toBe(true)
  })

  test('does not show internal modules section when empty', () => {
    const logs: string[] = []
    const report = makeReport({ internalModules: [] })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('Internal Modules'))).toBe(false)
  })

  test('does not show external modules section when empty', () => {
    const logs: string[] = []
    const report = makeReport({ externalModules: [] })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('External Modules'))).toBe(false)
  })

  test('does not show orphan files section when empty', () => {
    const logs: string[] = []
    const report = makeReport({ orphanFiles: [] })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('Orphan Files'))).toBe(false)
  })

  test('displays files analyzed count', () => {
    const logs: string[] = []
    const report = makeReport({ filesAnalyzed: 42 })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('42'))).toBe(true)
  })

  test('circular dependency details are red colored', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
      ],
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    const circLog = logs.find((l) => l.includes('/a -> /b'))
    expect(circLog).toBeDefined()
    expect(circLog).toBe(chalk.red('  • /a -> /b -> /a'))
  })

  test('header includes chart emoji', () => {
    const logs: string[] = []
    const report = makeReport({})

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('📊'))).toBe(true)
  })

  test('all sections display together when populated', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [{ cycle: ['/a', '/a'], location: { column: 1, end: 5, line: 1 } }],
      externalModules: ['express'],
      filesAnalyzed: 10,
      internalModules: ['./utils'],
      orphanFiles: ['orphan.ts'],
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('Circular Dependencies'))).toBe(true)
    expect(logs.some((l) => l.includes('Internal Modules'))).toBe(true)
    expect(logs.some((l) => l.includes('External Modules'))).toBe(true)
    expect(logs.some((l) => l.includes('Orphan Files'))).toBe(true)
  })

  test('exactly 5 circular dependencies does not truncate', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: Array.from({ length: 5 }, (_, i) => ({
        cycle: [`a${i}`, `b${i}`],
        location: { column: 1, end: 5, line: i + 1 },
      })),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('and 4 more'))).toBe(false)
    expect(logs.some((l) => l.includes('more'))).toBe(false)
  })

  test('exactly 10 internal modules does not truncate', () => {
    const logs: string[] = []
    const report = makeReport({
      internalModules: Array.from({ length: 10 }, (_, i) => `./mod${i}`),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('more'))).toBe(false)
  })

  test('exactly 10 external modules does not truncate', () => {
    const logs: string[] = []
    const report = makeReport({
      externalModules: Array.from({ length: 10 }, (_, i) => `pkg${i}`),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('more'))).toBe(false)
  })

  test('exactly 5 orphan files does not truncate', () => {
    const logs: string[] = []
    const report = makeReport({
      orphanFiles: Array.from({ length: 5 }, (_, i) => `orphan${i}.ts`),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('more'))).toBe(false)
  })

  test('internal modules show count in section header', () => {
    const logs: string[] = []
    const report = makeReport({
      internalModules: ['./a', './b', './c'],
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('Internal Modules (3)'))).toBe(true)
  })

  test('external modules show count in section header', () => {
    const logs: string[] = []
    const report = makeReport({
      externalModules: ['p1', 'p2'],
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('External Modules (2)'))).toBe(true)
  })

  test('orphan files show count in section header', () => {
    const logs: string[] = []
    const report = makeReport({
      orphanFiles: ['o1.ts', 'o2.ts', 'o3.ts', 'o4.ts'],
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('Orphan Files (not imported by any file) (4)'))).toBe(true)
  })

  test('no circular dependencies message is green in full report', () => {
    const logs: string[] = []
    const report = makeReport({ circularDependencies: [] })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l === chalk.green('\n✓ No circular dependencies'))).toBe(true)
  })

  test('files analyzed zero is displayed', () => {
    const logs: string[] = []
    const report = makeReport({ filesAnalyzed: 0 })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('Files analyzed: 0'))).toBe(true)
  })

  test('JSON format contains all report fields', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [{ cycle: ['/a', '/a'], location: { column: 1, end: 1, line: 1 } }],
      externalModules: ['lodash'],
      filesAnalyzed: 7,
      internalModules: ['./x'],
      orphanFiles: ['o.ts'],
    })

    displayFullReport(report, 'json', (m) => logs.push(m))

    const parsed = JSON.parse(logs[0])
    expect(parsed.filesAnalyzed).toBe(7)
    expect(parsed.circularDependencies).toHaveLength(1)
    expect(parsed.externalModules).toEqual(['lodash'])
    expect(parsed.internalModules).toEqual(['./x'])
    expect(parsed.orphanFiles).toEqual(['o.ts'])
  })

  test('6 circular dependencies shows truncation with correct count', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: Array.from({ length: 6 }, (_, i) => ({
        cycle: [`a${i}`, `b${i}`],
        location: { column: 1, end: 5, line: i + 1 },
      })),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('and 1 more'))).toBe(true)
  })

  test('11 internal modules truncates showing 10 plus more message', () => {
    const logs: string[] = []
    const report = makeReport({
      internalModules: Array.from({ length: 11 }, (_, i) => `./mod${i}`),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('and 1 more'))).toBe(true)
  })

  test('internal modules content is listed in table format', () => {
    const logs: string[] = []
    const report = makeReport({
      internalModules: ['./utils', './helpers'],
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l === '  ./utils')).toBe(true)
    expect(logs.some((l) => l === '  ./helpers')).toBe(true)
  })

  test('external modules content is listed in table format', () => {
    const logs: string[] = []
    const report = makeReport({
      externalModules: ['express', 'cors'],
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l === '  express')).toBe(true)
    expect(logs.some((l) => l === '  cors')).toBe(true)
  })

  test('orphan files content is listed in table format', () => {
    const logs: string[] = []
    const report = makeReport({
      orphanFiles: ['orphan1.ts', 'orphan2.ts'],
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l === '  orphan1.ts')).toBe(true)
    expect(logs.some((l) => l === '  orphan2.ts')).toBe(true)
  })

  test('internal modules header is cyan colored', () => {
    const logs: string[] = []
    const report = makeReport({
      internalModules: ['./a'],
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l === chalk.cyan('\nInternal Modules (1):'))).toBe(true)
  })

  test('external modules header is yellow colored', () => {
    const logs: string[] = []
    const report = makeReport({
      externalModules: ['pkg'],
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l === chalk.yellow('\nExternal Modules (1):'))).toBe(true)
  })

  test('orphan files header is magenta colored', () => {
    const logs: string[] = []
    const report = makeReport({
      orphanFiles: ['o.ts'],
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(
      logs.some((l) => l === chalk.magenta('\nOrphan Files (not imported by any file) (1):')),
    ).toBe(true)
  })

  test('files analyzed line is dim styled', () => {
    const logs: string[] = []
    const report = makeReport({ filesAnalyzed: 99 })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l === chalk.dim('Files analyzed: 99'))).toBe(true)
  })

  test('6 orphan files shows truncation message', () => {
    const logs: string[] = []
    const report = makeReport({
      orphanFiles: Array.from({ length: 6 }, (_, i) => `orphan${i}.ts`),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('and 1 more'))).toBe(true)
  })

  test('11 external modules truncates with correct count', () => {
    const logs: string[] = []
    const report = makeReport({
      externalModules: Array.from({ length: 11 }, (_, i) => `pkg${i}`),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('and 1 more'))).toBe(true)
  })

  test('dot format delegation outputs closing brace', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: { edges: [['a.ts', 'b.ts']], nodes: ['a.ts', 'b.ts'] },
    })

    displayFullReport(report, 'dot', (m) => logs.push(m))

    expect(logs[logs.length - 1]).toBe('}')
  })

  test('circular dependency section header is red colored', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
      ],
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l === chalk.red('\nCircular Dependencies (1):'))).toBe(true)
  })

  test('report with only files analyzed shows minimal output', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [],
      externalModules: [],
      filesAnalyzed: 5,
      internalModules: [],
      orphanFiles: [],
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('Files analyzed: 5'))).toBe(true)
    expect(logs.some((l) => l.includes('No circular dependencies'))).toBe(true)
    expect(logs.some((l) => l.includes('Internal Modules'))).toBe(false)
    expect(logs.some((l) => l.includes('External Modules'))).toBe(false)
    expect(logs.some((l) => l.includes('Orphan Files'))).toBe(false)
  })

  test('circular dependency items use bullet point format', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [
        { cycle: ['/x', '/y', '/x'], location: { column: 1, end: 10, line: 1 } },
      ],
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('• /x -> /y -> /x'))).toBe(true)
  })

  test('7 circular dependencies shows and 2 more', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: Array.from({ length: 7 }, (_, i) => ({
        cycle: [`a${i}`, `b${i}`],
        location: { column: 1, end: 5, line: i + 1 },
      })),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('and 2 more'))).toBe(true)
  })

  test('12 internal modules truncates showing 10 plus and 2 more', () => {
    const logs: string[] = []
    const report = makeReport({
      internalModules: Array.from({ length: 12 }, (_, i) => `./mod${i}`),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('and 2 more'))).toBe(true)
  })

  test('all populated sections appear in output', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [{ cycle: ['/a', '/a'], location: { column: 1, end: 1, line: 1 } }],
      externalModules: ['pkg'],
      filesAnalyzed: 10,
      internalModules: ['./mod'],
      orphanFiles: ['orphan.ts'],
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    const circIdx = logs.findIndex((l) => l.includes('Circular Dependencies'))
    const internalIdx = logs.findIndex((l) => l.includes('Internal Modules'))
    const externalIdx = logs.findIndex((l) => l.includes('External Modules'))
    const orphanIdx = logs.findIndex((l) => l.includes('Orphan Files'))
    expect(circIdx).toBeLessThan(internalIdx)
    expect(internalIdx).toBeLessThan(externalIdx)
    expect(externalIdx).toBeLessThan(orphanIdx)
  })

  test('json format with full report is parseable', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [{ cycle: ['/a', '/a'], location: { column: 1, end: 1, line: 1 } }],
      externalModules: ['lodash'],
      filesAnalyzed: 3,
      internalModules: ['./x'],
      orphanFiles: ['o.ts'],
    })

    displayFullReport(report, 'json', (m) => logs.push(m))

    const parsed = JSON.parse(logs[0])
    expect(typeof parsed).toBe('object')
    expect(parsed).toHaveProperty('filesAnalyzed')
    expect(parsed).toHaveProperty('circularDependencies')
    expect(parsed).toHaveProperty('externalModules')
    expect(parsed).toHaveProperty('internalModules')
    expect(parsed).toHaveProperty('orphanFiles')
    expect(parsed).toHaveProperty('graph')
  })

  test('dot format delegation from full report produces valid dot', () => {
    const logs: string[] = []
    const report = makeReport({
      graph: {
        edges: [
          ['x.ts', 'y.ts'],
          ['y.ts', 'z.ts'],
        ],
        nodes: ['x.ts', 'y.ts', 'z.ts'],
      },
    })

    displayFullReport(report, 'dot', (m) => logs.push(m))

    expect(logs[0]).toBe('digraph dependencies {')
    expect(logs[logs.length - 1]).toBe('}')
    expect(logs.some((l) => l.includes('x.ts') && l.includes('->'))).toBe(true)
  })

  test('table format with zero files analyzed displays zero', () => {
    const logs: string[] = []
    const report = makeReport({ filesAnalyzed: 0 })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l.includes('Files analyzed: 0'))).toBe(true)
  })

  test('truncation message for circular deps is dim styled', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: Array.from({ length: 8 }, (_, i) => ({
        cycle: [`a${i}`, `b${i}`],
        location: { column: 1, end: 5, line: i + 1 },
      })),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l === chalk.dim('  ... and 3 more'))).toBe(true)
  })

  test('header line is bold styled', () => {
    const logs: string[] = []
    const report = makeReport({})

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs[0]).toBe(chalk.bold('\n📊 Dependency Analysis\n'))
  })

  test('files analyzed line appears before circular dependencies section', () => {
    const logs: string[] = []
    const report = makeReport({
      circularDependencies: [{ cycle: ['/a', '/a'], location: { column: 1, end: 1, line: 1 } }],
      filesAnalyzed: 3,
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    const filesIdx = logs.findIndex((l) => l.includes('Files analyzed'))
    const circIdx = logs.findIndex((l) => l.includes('Circular Dependencies'))
    expect(filesIdx).toBeLessThan(circIdx)
  })

  test('orphan files truncation message is dim styled', () => {
    const logs: string[] = []
    const report = makeReport({
      orphanFiles: Array.from({ length: 8 }, (_, i) => `orphan${i}.ts`),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l === chalk.dim('  ... and 3 more'))).toBe(true)
  })

  test('internal modules truncation message is dim styled', () => {
    const logs: string[] = []
    const report = makeReport({
      internalModules: Array.from({ length: 13 }, (_, i) => `./mod${i}`),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l === chalk.dim('  ... and 3 more'))).toBe(true)
  })

  test('external modules truncation message is dim styled', () => {
    const logs: string[] = []
    const report = makeReport({
      externalModules: Array.from({ length: 14 }, (_, i) => `pkg${i}`),
    })

    displayFullReport(report, 'table', (m) => logs.push(m))

    expect(logs.some((l) => l === chalk.dim('  ... and 4 more'))).toBe(true)
  })
})
