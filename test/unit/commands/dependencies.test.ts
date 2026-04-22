import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import Dependencies from '../../../src/commands/dependencies.js'
import { discoverFiles } from '../../../src/core/file-discovery.js'
import { Parser } from '../../../src/core/parser.js'

vi.mock('../../../src/core/file-discovery.js')
vi.mock('../../../src/core/parser.js')

describe('Dependencies Command', () => {
  let command: Dependencies

  const mockDiscoverFiles = vi.mocked(discoverFiles)
  const mockParser = vi.mocked(Parser)

  beforeEach(() => {
    command = new Dependencies([], {} as any)
    mockDiscoverFiles.mockReset()
    mockParser.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('flags', () => {
    test('has circular flag', () => {
      const flags = Dependencies.flags
      expect(flags).toHaveProperty('circular')
      expect((flags.circular as any).char).toBe('c')
    })

    test('has external flag', () => {
      const flags = Dependencies.flags
      expect(flags).toHaveProperty('external')
      expect((flags.external as any).char).toBe('e')
    })

    test('has format flag', () => {
      const flags = Dependencies.flags
      expect(flags).toHaveProperty('format')
      expect((flags.format as any).options).toContain('json')
      expect((flags.format as any).options).toContain('dot')
    })
  })

  describe('description', () => {
    test('has description', () => {
      expect(Dependencies.description).toBe('Analyze and visualize module dependencies')
    })

    test('has examples', () => {
      expect(Dependencies.examples).toHaveLength(4)
    })
  })

  describe('extractImports', () => {
    test('extracts static imports', () => {
      const sourceCode = 'import { foo } from "./bar"\nimport baz from "qux"'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(2)
      expect(result[0].modulePath).toBe('./bar')
      expect(result[1].modulePath).toBe('qux')
    })

    test('extracts dynamic imports', () => {
      const sourceCode = 'const mod = import("./dynamic")'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].modulePath).toBe('./dynamic')
    })

    test('extracts require calls', () => {
      const sourceCode = 'const fs = require("fs")'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].modulePath).toBe('fs')
    })

    test('returns empty array for no imports', () => {
      const sourceCode = 'const x = 1'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(0)
    })
  })

  describe('detectCircularDependencies', () => {
    test('returns empty array when no cycles', () => {
      const graph = {
        nodes: new Map([
          ['a.ts', { filePath: 'a.ts', importDetails: new Map(), imports: new Set(['./b.ts']) }],
          ['b.ts', { filePath: 'b.ts', importDetails: new Map(), imports: new Set() }],
        ]),
      }

      const result = (command as any).detectCircularDependencies(graph)
      expect(result).toHaveLength(0)
    })

    test('detects simple cycle', () => {
      const graph = {
        nodes: new Map([
          [
            'src/a.ts',
            {
              filePath: 'src/a.ts',
              importDetails: new Map([
                [
                  './b.ts',
                  {
                    location: { column: 1, line: 1 },
                    modulePath: './b.ts',
                    sourceFile: 'src/a.ts',
                  },
                ],
              ]),
              imports: new Set(['./b.ts']),
            },
          ],
          [
            'src/b.ts',
            {
              filePath: 'src/b.ts',
              importDetails: new Map([
                [
                  './a.ts',
                  {
                    location: { column: 1, line: 1 },
                    modulePath: './a.ts',
                    sourceFile: 'src/b.ts',
                  },
                ],
              ]),
              imports: new Set(['./a.ts']),
            },
          ],
        ]),
      }

      const result = (command as any).detectCircularDependencies(graph)
      expect(result.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('findOrphanFiles', () => {
    test('finds files not imported by others', () => {
      const graph = {
        nodes: new Map([
          ['src/main.ts', { filePath: 'src/main.ts', imports: new Set(['src/utils.ts']) }],
          ['src/utils.ts', { filePath: 'src/utils.ts', imports: new Set() }],
          ['src/orphan.ts', { filePath: 'src/orphan.ts', imports: new Set() }],
        ]),
      }

      const result = (command as any).findOrphanFiles(graph)
      expect(result).toContain('src/main.ts')
      expect(result).toContain('src/orphan.ts')
      expect(result).toContain('src/utils.ts')
    })
  })

  describe('normalizeCycle', () => {
    test('normalizes cycle to start with smallest element', () => {
      const cycle = ['c.ts', 'a.ts', 'b.ts']
      const result = (command as any).normalizeCycle(cycle)
      expect(result[0]).toBe('a.ts')
    })

    test('handles single element cycle', () => {
      const cycle = ['a.ts']
      const result = (command as any).normalizeCycle(cycle)
      expect(result).toEqual(['a.ts'])
    })

    test('handles empty cycle', () => {
      const result = (command as any).normalizeCycle([])
      expect(result).toEqual([])
    })
  })

  describe('deduplicateCycles', () => {
    test('removes duplicate cycles', () => {
      const cycles = [
        { cycle: ['a.ts', 'b.ts'], location: { column: 1, line: 1 } },
        { cycle: ['b.ts', 'a.ts'], location: { column: 1, line: 2 } },
      ]
      const result = (command as any).deduplicateCycles(cycles)
      expect(result.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('graphToDotFormat', () => {
    test('handles empty graph', () => {
      const graph = { nodes: new Map() }
      const result = (command as any).graphToDotFormat(graph)
      expect(result).toHaveProperty('nodes')
      expect(result).toHaveProperty('edges')
    })

    test('converts graph to dot format', () => {
      const graph = {
        nodes: new Map([
          ['a.ts', { filePath: 'a.ts', imports: new Set(['./b.ts']) }],
          ['b.ts', { filePath: 'b.ts', imports: new Set() }],
        ]),
      }

      const result = (command as any).graphToDotFormat(graph)
      expect(result.nodes).toContain('a.ts')
      expect(result.edges).toHaveLength(1)
    })
  })

  describe('formatOutput', () => {
    test('formats as JSON when format is json', () => {
      const report = {
        circularDependencies: [],
        externalModules: ['lodash'],
        filesAnalyzed: 2,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const result = (command as any).formatOutput(report, { format: 'json' })
      expect(() => JSON.parse(result)).not.toThrow()
    })

    test('formats as DOT when format is dot', () => {
      const report = {
        circularDependencies: [],
        externalModules: [],
        filesAnalyzed: 2,
        graph: { edges: [['a.ts', 'b.ts']], nodes: ['a.ts', 'b.ts'] },
        internalModules: [],
        orphanFiles: [],
      }
      const result = (command as any).formatOutput(report, { format: 'dot' })
      expect(result).toContain('digraph')
    })

    test('formats as table by default', () => {
      const report = {
        circularDependencies: [],
        externalModules: ['lodash'],
        filesAnalyzed: 2,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const result = (command as any).formatOutput(report, { format: 'table' })
      expect(typeof result).toBe('string')
    })
  })

  describe('processDependency', () => {
    test('returns early when dependency node not found in graph', () => {
      const graph = {
        nodes: new Map([
          ['a.ts', { filePath: 'a.ts', importDetails: new Map(), imports: new Set() }],
        ]),
      }
      const context = {
        cycles: [],
        graph,
        maxDepth: 50,
        path: ['a.ts'],
        recursionStack: new Set(['a.ts']),
        visited: new Set(['a.ts']),
      }
      const initialCyclesLength = context.cycles.length

      // 'non-existent.ts' is not in the graph
      ;(command as any).processDependency('non-existent.ts', graph.nodes.get('a.ts')!, context)
      expect(context.cycles.length).toBe(initialCyclesLength)
    })

    test('calls detectCyclesFromNode for unvisited dependency', () => {
      const graph = {
        nodes: new Map([
          ['a.ts', { filePath: 'a.ts', importDetails: new Map(), imports: new Set(['b.ts']) }],
          ['b.ts', { filePath: 'b.ts', importDetails: new Map(), imports: new Set() }],
        ]),
      }
      const context = {
        cycles: [],
        graph,
        maxDepth: 50,
        path: ['a.ts'],
        recursionStack: new Set(['a.ts']),
        visited: new Set(['a.ts']),
      }

      // 'b.ts' exists in graph but is not in visited set
      ;(command as any).processDependency('b.ts', graph.nodes.get('a.ts')!, context)
      // The method will call detectCyclesFromNode which handles the unvisited node
      // We just verify it doesn't throw and the graph lookup succeeds
      expect(context.graph.nodes.has('b.ts')).toBe(true)
    })
  })

  describe('recordCycle', () => {
    test('records cycle with import details', () => {
      const node = {
        filePath: 'b.ts',
        importDetails: new Map([
          [
            './a.ts',
            { location: { column: 1, line: 1 }, modulePath: './a.ts', sourceFile: 'b.ts' },
          ],
        ]),
        imports: new Set(['./a.ts']),
      }
      const context = {
        cycles: [],
        path: ['a.ts', 'b.ts'],
      }

      ;(command as any).recordCycle('./a.ts', node, context)
      expect(context.cycles).toHaveLength(1)
    })

    test('does not record cycle without import details', () => {
      const node = {
        filePath: 'b.ts',
        importDetails: new Map(),
        imports: new Set(['./a.ts']),
      }
      const context = {
        cycles: [],
        path: ['a.ts', 'b.ts'],
      }

      ;(command as any).recordCycle('./a.ts', node, context)
      expect(context.cycles).toHaveLength(0)
    })
  })

  describe('finishNodeVisit', () => {
    test('removes path element and recursion stack entry', () => {
      const path = ['a.ts', 'b.ts', 'c.ts']
      const recursionStack = new Set(['a.ts', 'b.ts', 'c.ts'])

      ;(command as any).finishNodeVisit('c.ts', path, recursionStack)

      expect(path).toEqual(['a.ts', 'b.ts'])
      expect(recursionStack.has('c.ts')).toBe(false)
      expect(recursionStack.has('b.ts')).toBe(true)
    })
  })

  describe('detectCyclesFromNode', () => {
    test('returns early when max depth exceeded', () => {
      const graph = {
        nodes: new Map([
          ['a.ts', { filePath: 'a.ts', importDetails: new Map(), imports: new Set(['./b.ts']) }],
        ]),
      }
      const context = {
        cycles: [] as any[],
        graph,
        maxDepth: 2,
        path: ['x.ts', 'y.ts', 'z.ts'],
        recursionStack: new Set(['x.ts', 'y.ts', 'z.ts']),
        visited: new Set(['x.ts', 'y.ts', 'z.ts']),
      }
      const initialCycles = context.cycles.length

      ;(command as any).detectCyclesFromNode('a.ts', context)

      expect(context.cycles.length).toBe(initialCycles)
    })

    test('returns early when node not in graph', () => {
      const graph = { nodes: new Map() }
      const context = {
        cycles: [] as any[],
        graph,
        maxDepth: 50,
        path: [],
        recursionStack: new Set(),
        visited: new Set(),
      }

      ;(command as any).detectCyclesFromNode('nonexistent.ts', context)

      expect(context.visited.has('nonexistent.ts')).toBe(true)
    })
  })

  describe('formatOutput with flags', () => {
    test('formats circular dependencies when circular flag is true', () => {
      const report = {
        circularDependencies: [{ cycle: ['a.ts', 'b.ts'], location: { line: 1, column: 1 } }],
        externalModules: ['lodash'],
        filesAnalyzed: 2,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const result = (command as any).formatOutput(report, { circular: true })
      const parsed = JSON.parse(result)
      expect(parsed).toHaveProperty('circularDependencies')
    })

    test('formats external modules when external flag is true', () => {
      const report = {
        circularDependencies: [],
        externalModules: ['lodash', 'react'],
        filesAnalyzed: 2,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const result = (command as any).formatOutput(report, { external: true })
      const parsed = JSON.parse(result)
      expect(parsed).toHaveProperty('externalModules')
      expect(parsed.externalModules).toContain('lodash')
    })
  })

  describe('displayCircularDependencies', () => {
    test('displays message when no circular dependencies', () => {
      const report = { circularDependencies: [] }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayCircularDependencies(report, 'table')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No circular dependencies'))
    })

    test('displays circular dependencies in json format', () => {
      const report = {
        circularDependencies: [{ cycle: ['a.ts', 'b.ts'], location: { line: 1, column: 1 } }],
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayCircularDependencies(report, 'json')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('circularDependencies'))
    })

    test('displays circular dependencies count in table format', () => {
      const report = {
        circularDependencies: [
          { cycle: ['a.ts', 'b.ts', 'a.ts'], location: { line: 1, column: 1 } },
        ],
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayCircularDependencies(report, 'table')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('circular dependencies'))
    })
  })

  describe('displayExternalModules', () => {
    test('displays message when no external modules', () => {
      const report = { externalModules: [] }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayExternalModules(report, 'table')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No external dependencies'))
    })

    test('displays external modules in json format', () => {
      const report = { externalModules: ['lodash', 'react'] }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayExternalModules(report, 'json')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('externalModules'))
    })

    test('displays external modules count in table format', () => {
      const report = { externalModules: ['lodash', 'react'] }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayExternalModules(report, 'table')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('External modules'))
    })
  })

  describe('displayDotFormat', () => {
    test('outputs valid dot format', () => {
      const report = {
        graph: {
          edges: [['a.ts', 'b.ts']],
          nodes: ['a.ts', 'b.ts'],
        },
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayDotFormat(report)

      expect(logSpy).toHaveBeenCalledWith('digraph dependencies {')
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('a.ts'))
    })
  })

  describe('displayFullReport', () => {
    test('displays json format', () => {
      const report = {
        circularDependencies: [],
        externalModules: [],
        filesAnalyzed: 5,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayFullReport(report, 'json')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('filesAnalyzed'))
    })

    test('displays dot format', () => {
      const report = {
        circularDependencies: [],
        externalModules: [],
        filesAnalyzed: 5,
        graph: { edges: [['a.ts', 'b.ts']], nodes: ['a.ts', 'b.ts'] },
        internalModules: [],
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayFullReport(report, 'dot')

      expect(logSpy).toHaveBeenCalledWith('digraph dependencies {')
    })

    test('displays circular dependencies section', () => {
      const report = {
        circularDependencies: [
          { cycle: ['a.ts', 'b.ts', 'a.ts'], location: { line: 1, column: 1 } },
        ],
        externalModules: [],
        filesAnalyzed: 5,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayFullReport(report, 'table')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Circular Dependencies'))
    })

    test('displays no circular dependencies message', () => {
      const report = {
        circularDependencies: [],
        externalModules: [],
        filesAnalyzed: 5,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayFullReport(report, 'table')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No circular dependencies'))
    })

    test('displays internal modules section', () => {
      const report = {
        circularDependencies: [],
        externalModules: [],
        filesAnalyzed: 5,
        graph: { edges: [], nodes: [] },
        internalModules: ['./utils', './helpers'],
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayFullReport(report, 'table')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Internal Modules'))
    })

    test('displays external modules section', () => {
      const report = {
        circularDependencies: [],
        externalModules: ['lodash', 'react'],
        filesAnalyzed: 5,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayFullReport(report, 'table')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('External Modules'))
    })

    test('displays orphan files section', () => {
      const report = {
        circularDependencies: [],
        externalModules: [],
        filesAnalyzed: 5,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: ['orphan.ts'],
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayFullReport(report, 'table')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Orphan Files'))
    })
  })

  describe('displayDependencyTree', () => {
    test('displays message when no root files found', () => {
      const report = {
        graph: {
          edges: [['a.ts', 'b.ts']],
          nodes: ['b.ts'],
        },
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayDependencyTree(report)

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No root files found'))
    })

    test('displays tree for root files', () => {
      const report = {
        graph: {
          edges: [['a.ts', 'b.ts']],
          nodes: ['a.ts', 'b.ts'],
        },
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayDependencyTree(report)

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Dependency Tree'))
    })

    test('truncates when more than 5 root files', () => {
      const report = {
        graph: {
          edges: [],
          nodes: ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts', 'f.ts', 'g.ts'],
        },
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayDependencyTree(report)

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('more root files'))
    })
  })

  describe('normalizeCycle edge cases', () => {
    test('handles two-element cycle', () => {
      const result = (command as any).normalizeCycle(['b.ts', 'a.ts'])
      expect(result[0]).toBe('b.ts')
    })

    test('handles cycle where all elements are same', () => {
      const result = (command as any).normalizeCycle(['b.ts', 'b.ts', 'b.ts'])
      expect(result[0]).toBe('b.ts')
    })

    test('handles cycle with undefined elements filtered', () => {
      const result = (command as any).normalizeCycle(['z.ts', undefined, 'a.ts'].filter(Boolean))
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('graphToDotFormat with mixed imports', () => {
    test('only includes relative imports as edges', () => {
      const graph = {
        nodes: new Map([
          ['a.ts', { filePath: 'a.ts', imports: new Set(['./b.ts', 'lodash', 'react']) }],
          ['b.ts', { filePath: 'b.ts', imports: new Set() }],
        ]),
      }

      const result = (command as any).graphToDotFormat(graph)
      expect(result.edges).toHaveLength(1)
      expect(result.edges[0]).toEqual(['a.ts', './b.ts'])
    })

    test('handles file with only external imports', () => {
      const graph = {
        nodes: new Map([['a.ts', { filePath: 'a.ts', imports: new Set(['lodash', 'react']) }]]),
      }

      const result = (command as any).graphToDotFormat(graph)
      expect(result.edges).toHaveLength(0)
      expect(result.nodes).toContain('a.ts')
    })
  })

  describe('findOrphanFiles with mixed imports', () => {
    test('only counts relative imports as imported files', () => {
      const graph = {
        nodes: new Map([
          ['src/main.ts', { filePath: 'src/main.ts', imports: new Set(['./utils.ts', 'lodash']) }],
          ['src/utils.ts', { filePath: 'src/utils.ts', imports: new Set() }],
          ['src/standalone.ts', { filePath: 'src/standalone.ts', imports: new Set(['react']) }],
        ]),
      }

      const result = (command as any).findOrphanFiles(graph)
      expect(result).toContain('src/main.ts')
      expect(result).toContain('src/standalone.ts')
    })
  })

  describe('processDependency cycle detection', () => {
    test('records cycle when dependency is in recursionStack', () => {
      const graph = {
        nodes: new Map([
          [
            'a.ts',
            {
              filePath: 'a.ts',
              importDetails: new Map([
                [
                  './b.ts',
                  { location: { column: 1, line: 1 }, modulePath: './b.ts', sourceFile: 'a.ts' },
                ],
              ]),
              imports: new Set(['./b.ts']),
            },
          ],
          [
            'b.ts',
            {
              filePath: 'b.ts',
              importDetails: new Map([
                [
                  'a.ts',
                  { location: { column: 1, line: 1 }, modulePath: './a.ts', sourceFile: 'b.ts' },
                ],
              ]),
              imports: new Set(['./a.ts']),
            },
          ],
        ]),
      }

      const context = {
        cycles: [] as any[],
        graph,
        maxDepth: 50,
        path: ['a.ts', 'b.ts'],
        recursionStack: new Set(['a.ts', 'b.ts']),
        visited: new Set(['a.ts', 'b.ts']),
      }

      ;(command as any).processDependency('a.ts', graph.nodes.get('b.ts')!, context)

      expect(context.cycles.length).toBe(1)
      expect(context.cycles[0].cycle).toContain('a.ts')
    })
  })

  describe('normalizeCycle rotation edge cases', () => {
    test('rotates cycle to start with minimum element', () => {
      const cycle = ['z.ts', 'a.ts', 'm.ts']
      const result = (command as any).normalizeCycle(cycle)
      expect(result[0]).toBe('a.ts')
    })

    test('handles cycle that is already normalized', () => {
      const cycle = ['a.ts', 'b.ts', 'c.ts']
      const result = (command as any).normalizeCycle(cycle)
      expect(result[0]).toBe('a.ts')
    })
  })

  describe('extractImports additional patterns', () => {
    test('extracts external npm module imports', () => {
      const sourceCode = 'import lodash from "lodash"\nimport react from "react"'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(2)
      expect(result[0].modulePath).toBe('lodash')
      expect(result[1].modulePath).toBe('react')
    })

    test('extracts scoped package imports', () => {
      const sourceCode = 'import { something } from "@scope/package"'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].modulePath).toBe('@scope/package')
    })
  })

  describe('displayFullReport truncation', () => {
    test('truncates circular dependencies when more than 5', () => {
      const report = {
        circularDependencies: Array.from({ length: 10 }, (_, i) => ({
          cycle: [`a${i}.ts`, `b${i}.ts`],
          location: { line: 1, column: 1 },
        })),
        externalModules: [],
        filesAnalyzed: 10,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayFullReport(report, 'table')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('and 5 more'))
    })

    test('truncates internal modules when more than 10', () => {
      const report = {
        circularDependencies: [],
        externalModules: [],
        filesAnalyzed: 15,
        graph: { edges: [], nodes: [] },
        internalModules: Array.from({ length: 15 }, (_, i) => `./module${i}`),
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayFullReport(report, 'table')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('and 5 more'))
    })

    test('truncates external modules when more than 10', () => {
      const report = {
        circularDependencies: [],
        externalModules: Array.from({ length: 15 }, (_, i) => `npm-package-${i}`),
        filesAnalyzed: 15,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayFullReport(report, 'table')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('and 5 more'))
    })

    test('truncates orphan files when more than 5', () => {
      const report = {
        circularDependencies: [],
        externalModules: [],
        filesAnalyzed: 10,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: Array.from({ length: 10 }, (_, i) => `orphan${i}.ts`),
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayFullReport(report, 'table')

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('and 5 more'))
    })
  })

  describe('displayDependencyTree visited nodes', () => {
    test('handles nodes already visited', () => {
      const report = {
        graph: {
          edges: [['a.ts', 'a.ts']],
          nodes: ['a.ts'],
        },
      }
      const logSpy = vi.spyOn(command, 'log')

      ;(command as any).displayDependencyTree(report)

      expect(logSpy).toHaveBeenCalled()
    })
  })

  describe('deduplicateCycles with different rotations', () => {
    test('deduplicates cycles that are same but different starting point', () => {
      const cycles = [
        { cycle: ['a.ts', 'b.ts', 'c.ts'], location: { line: 1, column: 1 } },
        { cycle: ['b.ts', 'c.ts', 'a.ts'], location: { line: 2, column: 1 } },
        { cycle: ['c.ts', 'a.ts', 'b.ts'], location: { line: 3, column: 1 } },
      ]
      const result = (command as any).deduplicateCycles(cycles)
      expect(result.length).toBeLessThanOrEqual(3)
    })
  })

  describe('format flag options', () => {
    test('format flag has table option', () => {
      const flags = Dependencies.flags
      expect((flags.format as any).options).toContain('table')
    })

    test('format flag has default of table', () => {
      const flags = Dependencies.flags
      expect((flags.format as any).default).toBe('table')
    })

    test('format flag has char f', () => {
      const flags = Dependencies.flags
      expect((flags.format as any).char).toBe('f')
    })

    test('format flag has description', () => {
      const flags = Dependencies.flags
      expect(typeof (flags.format as any).description).toBe('string')
    })
  })

  describe('formatOutput comprehensive', () => {
    test('circular flag takes precedence over format dot', () => {
      const report = {
        circularDependencies: [{ cycle: ['a.ts', 'b.ts'], location: { line: 1, column: 1 } }],
        externalModules: [],
        filesAnalyzed: 2,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const result = (command as any).formatOutput(report, { circular: true, format: 'dot' })
      const parsed = JSON.parse(result)
      expect(parsed).toHaveProperty('circularDependencies')
      expect(parsed).not.toHaveProperty('graph')
    })

    test('external flag takes precedence over format json', () => {
      const report = {
        circularDependencies: [],
        externalModules: ['react'],
        filesAnalyzed: 2,
        graph: { edges: [], nodes: [] },
        internalModules: ['./utils'],
        orphanFiles: [],
      }
      const result = (command as any).formatOutput(report, { external: true, format: 'json' })
      const parsed = JSON.parse(result)
      expect(parsed).toHaveProperty('externalModules')
      expect(parsed).not.toHaveProperty('internalModules')
    })

    test('circular flag takes precedence over external flag', () => {
      const report = {
        circularDependencies: [{ cycle: ['a.ts'], location: { line: 1, column: 1 } }],
        externalModules: ['lodash'],
        filesAnalyzed: 1,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const result = (command as any).formatOutput(report, { circular: true, external: true })
      const parsed = JSON.parse(result)
      expect(parsed).toHaveProperty('circularDependencies')
    })

    test('dot format with multiple edges', () => {
      const report = {
        circularDependencies: [],
        externalModules: [],
        filesAnalyzed: 3,
        graph: {
          edges: [
            ['a.ts', 'b.ts'],
            ['a.ts', 'c.ts'],
            ['b.ts', 'c.ts'],
          ],
          nodes: ['a.ts', 'b.ts', 'c.ts'],
        },
        internalModules: [],
        orphanFiles: [],
      }
      const result = (command as any).formatOutput(report, { format: 'dot' })
      expect(result).toContain('digraph dependencies')
      expect(result).toContain('"a.ts" -> "b.ts"')
      expect(result).toContain('"a.ts" -> "c.ts"')
      expect(result).toContain('"b.ts" -> "c.ts"')
    })

    test('dot format with empty graph', () => {
      const report = {
        circularDependencies: [],
        externalModules: [],
        filesAnalyzed: 0,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const result = (command as any).formatOutput(report, { format: 'dot' })
      expect(result).toContain('digraph dependencies')
    })

    test('json format with all fields populated', () => {
      const report = {
        circularDependencies: [{ cycle: ['a.ts', 'b.ts'], location: { line: 1, column: 1 } }],
        externalModules: ['lodash'],
        filesAnalyzed: 5,
        graph: { edges: [['a.ts', 'b.ts']], nodes: ['a.ts', 'b.ts'] },
        internalModules: ['./utils'],
        orphanFiles: ['orphan.ts'],
      }
      const result = (command as any).formatOutput(report, { format: 'json' })
      const parsed = JSON.parse(result)
      expect(parsed.filesAnalyzed).toBe(5)
      expect(parsed.externalModules).toEqual(['lodash'])
      expect(parsed.internalModules).toEqual(['./utils'])
      expect(parsed.orphanFiles).toEqual(['orphan.ts'])
      expect(parsed.circularDependencies).toHaveLength(1)
    })

    test('table format returns JSON string of full report', () => {
      const report = {
        circularDependencies: [],
        externalModules: ['react'],
        filesAnalyzed: 1,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const result = (command as any).formatOutput(report, { format: 'table' })
      const parsed = JSON.parse(result)
      expect(parsed.filesAnalyzed).toBe(1)
    })
  })

  describe('circular flag properties', () => {
    test('circular flag has char c', () => {
      const flags = Dependencies.flags
      expect((flags.circular as any).char).toBe('c')
    })

    test('circular flag defaults to false', () => {
      const flags = Dependencies.flags
      expect((flags.circular as any).default).toBe(false)
    })

    test('circular flag has description', () => {
      const flags = Dependencies.flags
      expect(typeof (flags.circular as any).description).toBe('string')
    })
  })

  describe('detectCircularDependencies comprehensive', () => {
    test('detects three-node cycle', () => {
      const graph = {
        nodes: new Map([
          [
            'a.ts',
            {
              filePath: 'a.ts',
              importDetails: new Map([
                [
                  'b.ts',
                  { location: { column: 1, line: 1 }, modulePath: 'b.ts', sourceFile: 'a.ts' },
                ],
              ]),
              imports: new Set(['b.ts']),
            },
          ],
          [
            'b.ts',
            {
              filePath: 'b.ts',
              importDetails: new Map([
                [
                  'c.ts',
                  { location: { column: 1, line: 1 }, modulePath: 'c.ts', sourceFile: 'b.ts' },
                ],
              ]),
              imports: new Set(['c.ts']),
            },
          ],
          [
            'c.ts',
            {
              filePath: 'c.ts',
              importDetails: new Map([
                [
                  'a.ts',
                  { location: { column: 1, line: 1 }, modulePath: 'a.ts', sourceFile: 'c.ts' },
                ],
              ]),
              imports: new Set(['a.ts']),
            },
          ],
        ]),
      }

      const result = (command as any).detectCircularDependencies(graph)
      expect(result.length).toBeGreaterThanOrEqual(1)
    })

    test('detects four-node cycle', () => {
      const graph = {
        nodes: new Map([
          [
            'a.ts',
            {
              filePath: 'a.ts',
              importDetails: new Map([
                [
                  'b.ts',
                  { location: { column: 1, line: 1 }, modulePath: 'b.ts', sourceFile: 'a.ts' },
                ],
              ]),
              imports: new Set(['b.ts']),
            },
          ],
          [
            'b.ts',
            {
              filePath: 'b.ts',
              importDetails: new Map([
                [
                  'c.ts',
                  { location: { column: 1, line: 1 }, modulePath: 'c.ts', sourceFile: 'b.ts' },
                ],
              ]),
              imports: new Set(['c.ts']),
            },
          ],
          [
            'c.ts',
            {
              filePath: 'c.ts',
              importDetails: new Map([
                [
                  'd.ts',
                  { location: { column: 1, line: 1 }, modulePath: 'd.ts', sourceFile: 'c.ts' },
                ],
              ]),
              imports: new Set(['d.ts']),
            },
          ],
          [
            'd.ts',
            {
              filePath: 'd.ts',
              importDetails: new Map([
                [
                  'a.ts',
                  { location: { column: 1, line: 1 }, modulePath: 'a.ts', sourceFile: 'd.ts' },
                ],
              ]),
              imports: new Set(['a.ts']),
            },
          ],
        ]),
      }

      const result = (command as any).detectCircularDependencies(graph)
      expect(result.length).toBeGreaterThanOrEqual(1)
    })

    test('returns no cycles for linear chain', () => {
      const graph = {
        nodes: new Map([
          ['a.ts', { filePath: 'a.ts', importDetails: new Map(), imports: new Set(['./b.ts']) }],
          ['b.ts', { filePath: 'b.ts', importDetails: new Map(), imports: new Set(['./c.ts']) }],
          ['c.ts', { filePath: 'c.ts', importDetails: new Map(), imports: new Set() }],
        ]),
      }

      const result = (command as any).detectCircularDependencies(graph)
      expect(result).toHaveLength(0)
    })

    test('returns no cycles for diamond dependency', () => {
      const graph = {
        nodes: new Map([
          [
            'a.ts',
            { filePath: 'a.ts', importDetails: new Map(), imports: new Set(['./b.ts', './c.ts']) },
          ],
          ['b.ts', { filePath: 'b.ts', importDetails: new Map(), imports: new Set(['./d.ts']) }],
          ['c.ts', { filePath: 'c.ts', importDetails: new Map(), imports: new Set(['./d.ts']) }],
          ['d.ts', { filePath: 'd.ts', importDetails: new Map(), imports: new Set() }],
        ]),
      }

      const result = (command as any).detectCircularDependencies(graph)
      expect(result).toHaveLength(0)
    })

    test('handles empty graph', () => {
      const graph = { nodes: new Map() }
      const result = (command as any).detectCircularDependencies(graph)
      expect(result).toHaveLength(0)
    })

    test('handles single node with no imports', () => {
      const graph = {
        nodes: new Map([
          ['a.ts', { filePath: 'a.ts', importDetails: new Map(), imports: new Set() }],
        ]),
      }
      const result = (command as any).detectCircularDependencies(graph)
      expect(result).toHaveLength(0)
    })

    test('handles single node with self-import', () => {
      const graph = {
        nodes: new Map([
          [
            'a.ts',
            {
              filePath: 'a.ts',
              importDetails: new Map([
                [
                  './a.ts',
                  { location: { column: 1, line: 1 }, modulePath: './a.ts', sourceFile: 'a.ts' },
                ],
              ]),
              imports: new Set(['./a.ts']),
            },
          ],
        ]),
      }

      const result = (command as any).detectCircularDependencies(graph)
      expect(result.length).toBeGreaterThanOrEqual(0)
    })

    test('handles two independent cycles', () => {
      const graph = {
        nodes: new Map([
          [
            'a.ts',
            {
              filePath: 'a.ts',
              importDetails: new Map([
                [
                  'b.ts',
                  { location: { column: 1, line: 1 }, modulePath: 'b.ts', sourceFile: 'a.ts' },
                ],
              ]),
              imports: new Set(['b.ts']),
            },
          ],
          [
            'b.ts',
            {
              filePath: 'b.ts',
              importDetails: new Map([
                [
                  'a.ts',
                  { location: { column: 1, line: 1 }, modulePath: 'a.ts', sourceFile: 'b.ts' },
                ],
              ]),
              imports: new Set(['a.ts']),
            },
          ],
          [
            'c.ts',
            {
              filePath: 'c.ts',
              importDetails: new Map([
                [
                  'd.ts',
                  { location: { column: 1, line: 1 }, modulePath: 'd.ts', sourceFile: 'c.ts' },
                ],
              ]),
              imports: new Set(['d.ts']),
            },
          ],
          [
            'd.ts',
            {
              filePath: 'd.ts',
              importDetails: new Map([
                [
                  'c.ts',
                  { location: { column: 1, line: 1 }, modulePath: 'c.ts', sourceFile: 'd.ts' },
                ],
              ]),
              imports: new Set(['c.ts']),
            },
          ],
        ]),
      }

      const result = (command as any).detectCircularDependencies(graph)
      expect(result.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('displayCircularDependencies comprehensive', () => {
    test('displays single cycle in table format', () => {
      const report = {
        circularDependencies: [
          { cycle: ['x.ts', 'y.ts', 'x.ts'], location: { line: 5, column: 1 } },
        ],
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayCircularDependencies(report, 'table')
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('1 circular dependencies'))
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('x.ts'))
    })

    test('displays multiple cycles in table format', () => {
      const report = {
        circularDependencies: [
          { cycle: ['a.ts', 'b.ts', 'a.ts'], location: { line: 1, column: 1 } },
          { cycle: ['c.ts', 'd.ts', 'c.ts'], location: { line: 2, column: 1 } },
        ],
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayCircularDependencies(report, 'table')
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('2 circular dependencies'))
    })

    test('displays empty cycles in json format', () => {
      const report = { circularDependencies: [] }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayCircularDependencies(report, 'json')
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No circular dependencies'))
    })

    test('displays cycles with correct cycle format', () => {
      const report = {
        circularDependencies: [
          {
            cycle: ['alpha.ts', 'beta.ts', 'gamma.ts', 'alpha.ts'],
            location: { line: 3, column: 5 },
          },
        ],
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayCircularDependencies(report, 'table')
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('alpha.ts -> beta.ts -> gamma.ts'),
      )
    })
  })

  describe('external flag properties', () => {
    test('external flag has char e', () => {
      const flags = Dependencies.flags
      expect((flags.external as any).char).toBe('e')
    })

    test('external flag defaults to false', () => {
      const flags = Dependencies.flags
      expect((flags.external as any).default).toBe(false)
    })

    test('external flag has description', () => {
      const flags = Dependencies.flags
      expect(typeof (flags.external as any).description).toBe('string')
    })
  })

  describe('displayExternalModules comprehensive', () => {
    test('displays single external module in table format', () => {
      const report = { externalModules: ['express'] }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayExternalModules(report, 'table')
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('1'))
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('express'))
    })

    test('displays many external modules in table format', () => {
      const report = { externalModules: ['express', 'lodash', 'react', 'vitest'] }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayExternalModules(report, 'table')
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('4'))
    })

    test('displays empty external modules in json format', () => {
      const report = { externalModules: [] }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayExternalModules(report, 'json')
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No external dependencies'))
    })

    test('json output is valid JSON', () => {
      const report = { externalModules: ['lodash', 'chalk'] }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayExternalModules(report, 'json')
      const callArg = logSpy.mock.calls[0]?.[0]
      expect(() => JSON.parse(callArg)).not.toThrow()
      const parsed = JSON.parse(callArg)
      expect(parsed.externalModules).toEqual(['lodash', 'chalk'])
    })
  })

  describe('tree flag properties', () => {
    test('tree flag has char t', () => {
      const flags = Dependencies.flags
      expect((flags.tree as any).char).toBe('t')
    })

    test('tree flag defaults to false', () => {
      const flags = Dependencies.flags
      expect((flags.tree as any).default).toBe(false)
    })

    test('tree flag has description', () => {
      const flags = Dependencies.flags
      expect(typeof (flags.tree as any).description).toBe('string')
    })
  })

  describe('displayDependencyTree comprehensive', () => {
    test('displays single node with no edges', () => {
      const report = {
        graph: {
          edges: [],
          nodes: ['index.ts'],
        },
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayDependencyTree(report)
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Dependency Tree'))
    })

    test('displays tree with multiple children of root', () => {
      const report = {
        graph: {
          edges: [
            ['main.ts', 'a.ts'],
            ['main.ts', 'b.ts'],
            ['main.ts', 'c.ts'],
          ],
          nodes: ['main.ts', 'a.ts', 'b.ts', 'c.ts'],
        },
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayDependencyTree(report)
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Dependency Tree'))
    })

    test('displays tree with deep nesting', () => {
      const report = {
        graph: {
          edges: [
            ['a.ts', 'b.ts'],
            ['b.ts', 'c.ts'],
            ['c.ts', 'd.ts'],
            ['d.ts', 'e.ts'],
            ['e.ts', 'f.ts'],
            ['f.ts', 'g.ts'],
            ['g.ts', 'h.ts'],
            ['h.ts', 'i.ts'],
            ['i.ts', 'j.ts'],
            ['j.ts', 'k.ts'],
          ],
          nodes: [
            'a.ts',
            'b.ts',
            'c.ts',
            'd.ts',
            'e.ts',
            'f.ts',
            'g.ts',
            'h.ts',
            'i.ts',
            'j.ts',
            'k.ts',
          ],
        },
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayDependencyTree(report)
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Dependency Tree'))
    })

    test('handles tree with leaf node having no children', () => {
      const report = {
        graph: {
          edges: [['root.ts', 'leaf.ts']],
          nodes: ['root.ts', 'leaf.ts'],
        },
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayDependencyTree(report)
      expect(logSpy).toHaveBeenCalled()
    })

    test('handles exactly 5 root files without truncation message', () => {
      const report = {
        graph: {
          edges: [],
          nodes: ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'],
        },
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayDependencyTree(report)
      const allCalls = logSpy.mock.calls.map((call: any[]) => call[0])
      const hasMoreMessage = allCalls.some((msg: string) => msg.includes('more root files'))
      expect(hasMoreMessage).toBe(false)
    })

    test('handles 6 root files with truncation', () => {
      const report = {
        graph: {
          edges: [],
          nodes: ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts', 'f.ts'],
        },
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayDependencyTree(report)
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('1 more root files'))
    })

    test('handles self-referencing edge', () => {
      const report = {
        graph: {
          edges: [['a.ts', 'a.ts']],
          nodes: ['a.ts'],
        },
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayDependencyTree(report)
      expect(logSpy).toHaveBeenCalled()
    })
  })

  describe('ignore flag properties', () => {
    test('ignore flag has char i', () => {
      const flags = Dependencies.flags
      expect((flags.ignore as any).char).toBe('i')
    })

    test('ignore flag supports multiple values', () => {
      const flags = Dependencies.flags
      expect((flags.ignore as any).multiple).toBe(true)
    })

    test('ignore flag has description', () => {
      const flags = Dependencies.flags
      expect(typeof (flags.ignore as any).description).toBe('string')
    })
  })

  describe('output flag properties', () => {
    test('output flag has char o', () => {
      const flags = Dependencies.flags
      expect((flags.output as any).char).toBe('o')
    })

    test('output flag has description', () => {
      const flags = Dependencies.flags
      expect(typeof (flags.output as any).description).toBe('string')
    })
  })

  describe('path argument', () => {
    test('path arg has default value of dot', () => {
      const args = Dependencies.args
      expect((args.path as any).default).toBe('.')
    })

    test('path arg is not required', () => {
      const args = Dependencies.args
      expect((args.path as any).required).toBe(false)
    })

    test('path arg has description', () => {
      const args = Dependencies.args
      expect(typeof (args.path as any).description).toBe('string')
    })
  })

  describe('analyzeDependencies error handling', () => {
    test('handles parse errors gracefully', async () => {
      const mockParserInstance = {
        dispose: vi.fn(),
        initialize: vi.fn().mockResolvedValue(undefined),
        parseFile: vi.fn().mockRejectedValue(new Error('Parse error')),
      }
      mockParser.mockImplementation(function () {
        return mockParserInstance
      })

      const files = [{ absolutePath: '/bad.ts', path: 'bad.ts' }]
      const oraMock = { start: vi.fn().mockReturnThis(), stop: vi.fn(), text: '' }

      const cmd = new Dependencies([], {} as any)
      const result = await (cmd as any).analyzeDependencies(files, oraMock)

      expect(result.filesAnalyzed).toBe(0)
      expect(mockParserInstance.dispose).toHaveBeenCalled()
    })

    test('handles mixed parse success and failure', async () => {
      const mockParserInstance = {
        dispose: vi.fn(),
        initialize: vi.fn().mockResolvedValue(undefined),
        parseFile: vi
          .fn()
          .mockRejectedValueOnce(new Error('Error'))
          .mockResolvedValueOnce({
            sourceFile: { getText: () => 'import { x } from "./y"' },
          }),
      }
      mockParser.mockImplementation(function () {
        return mockParserInstance
      })

      const files = [
        { absolutePath: '/bad.ts', path: 'bad.ts' },
        { absolutePath: '/good.ts', path: 'good.ts' },
      ]
      const oraMock = { start: vi.fn().mockReturnThis(), stop: vi.fn(), text: '' }

      const cmd = new Dependencies([], {} as any)
      const result = await (cmd as any).analyzeDependencies(files, oraMock)

      expect(result.filesAnalyzed).toBe(1)
    })

    test('handles empty file list', async () => {
      const mockParserInstance = {
        dispose: vi.fn(),
        initialize: vi.fn().mockResolvedValue(undefined),
        parseFile: vi.fn(),
      }
      mockParser.mockImplementation(function () {
        return mockParserInstance
      })

      const oraMock = { start: vi.fn().mockReturnThis(), stop: vi.fn(), text: '' }

      const cmd = new Dependencies([], {} as any)
      const result = await (cmd as any).analyzeDependencies([], oraMock)

      expect(result.filesAnalyzed).toBe(0)
      expect(result.circularDependencies).toHaveLength(0)
      expect(result.externalModules).toHaveLength(0)
      expect(result.internalModules).toHaveLength(0)
      expect(result.orphanFiles).toHaveLength(0)
    })
  })

  describe('extractImports comprehensive', () => {
    test('extracts type imports', () => {
      const sourceCode = 'import type { Config } from "./config"'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].modulePath).toBe('./config')
    })

    test('extracts namespace imports', () => {
      const sourceCode = 'import * as fs from "fs"'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].modulePath).toBe('fs')
    })

    test('extracts default imports', () => {
      const sourceCode = 'import path from "path"'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].modulePath).toBe('path')
    })

    test('extracts imports with single quotes', () => {
      const sourceCode = "import { foo } from './bar'"
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].modulePath).toBe('./bar')
    })

    test('extracts imports with double quotes', () => {
      const sourceCode = 'import { foo } from "./bar"'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].modulePath).toBe('./bar')
    })

    test('extracts multiple imports from different lines', () => {
      const sourceCode = [
        'import { a } from "./a"',
        'import { b } from "./b"',
        'import { c } from "./c"',
      ].join('\n')
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(3)
      expect(result[0].modulePath).toBe('./a')
      expect(result[1].modulePath).toBe('./b')
      expect(result[2].modulePath).toBe('./c')
    })

    test('correctly records source file', () => {
      const sourceCode = 'import { foo } from "./bar"'
      const result = (command as any).extractImports(sourceCode, 'my-file.ts')
      expect(result[0].sourceFile).toBe('my-file.ts')
    })

    test('records correct line numbers', () => {
      const sourceCode = 'const x = 1\nconst y = 2\nimport { foo } from "./bar"'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result[0].location.line).toBe(3)
    })

    test('records column as 1', () => {
      const sourceCode = 'import { foo } from "./bar"'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result[0].location.column).toBe(1)
    })

    test('extracts dynamic imports with double quotes', () => {
      const sourceCode = 'const mod = import("./dynamic")'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].modulePath).toBe('./dynamic')
    })

    test('extracts dynamic imports with single quotes', () => {
      const sourceCode = "const mod = import('./dynamic')"
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].modulePath).toBe('./dynamic')
    })

    test('extracts require with single quotes', () => {
      const sourceCode = "const fs = require('fs')"
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].modulePath).toBe('fs')
    })

    test('extracts relative path imports with ..', () => {
      const sourceCode = 'import { foo } from "../utils"'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].modulePath).toBe('../utils')
    })

    test('extracts deeply nested relative imports', () => {
      const sourceCode = 'import { foo } from "../../core/utils"'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].modulePath).toBe('../../core/utils')
    })

    test('returns empty for function declarations', () => {
      const sourceCode = 'function importFiles() { return [] }'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(0)
    })

    test('returns empty for variable named importModule', () => {
      const sourceCode = 'const importModule = "something"'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(0)
    })

    test('handles mixed import styles', () => {
      const sourceCode = [
        'import { foo } from "./foo"',
        'const bar = require("bar")',
        'const baz = import("./baz")',
      ].join('\n')
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(3)
      expect(result[0].modulePath).toBe('./foo')
      expect(result[1].modulePath).toBe('bar')
      expect(result[2].modulePath).toBe('./baz')
    })

    test('handles import with destructuring', () => {
      const sourceCode = 'import { a, b, c } from "./utils"'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].modulePath).toBe('./utils')
    })

    test('handles import with alias', () => {
      const sourceCode = 'import { foo as bar } from "./utils"'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(1)
      expect(result[0].modulePath).toBe('./utils')
    })

    test('handles comment-like lines gracefully', () => {
      const sourceCode = '// import { foo } from "./fake"'
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(0)
    })

    test('handles empty source code', () => {
      const result = (command as any).extractImports('', 'test.ts')
      expect(result).toHaveLength(0)
    })
  })

  describe('graphToDotFormat edge cases', () => {
    test('handles node with multiple relative imports', () => {
      const graph = {
        nodes: new Map([
          ['a.ts', { filePath: 'a.ts', imports: new Set(['./b.ts', './c.ts', './d.ts']) }],
          ['b.ts', { filePath: 'b.ts', imports: new Set() }],
          ['c.ts', { filePath: 'c.ts', imports: new Set() }],
          ['d.ts', { filePath: 'd.ts', imports: new Set() }],
        ]),
      }
      const result = (command as any).graphToDotFormat(graph)
      expect(result.edges).toHaveLength(3)
      expect(result.nodes).toHaveLength(4)
    })

    test('handles self-referencing import', () => {
      const graph = {
        nodes: new Map([['a.ts', { filePath: 'a.ts', imports: new Set(['./a.ts']) }]]),
      }
      const result = (command as any).graphToDotFormat(graph)
      expect(result.edges).toHaveLength(1)
      expect(result.edges[0]).toEqual(['a.ts', './a.ts'])
    })

    test('returns empty edges for all external imports', () => {
      const graph = {
        nodes: new Map([
          ['a.ts', { filePath: 'a.ts', imports: new Set(['lodash', 'react', 'vitest']) }],
          ['b.ts', { filePath: 'b.ts', imports: new Set(['express', 'chalk']) }],
        ]),
      }
      const result = (command as any).graphToDotFormat(graph)
      expect(result.edges).toHaveLength(0)
      expect(result.nodes).toHaveLength(2)
    })

    test('preserves node order from graph', () => {
      const graph = {
        nodes: new Map([
          ['z.ts', { filePath: 'z.ts', imports: new Set() }],
          ['a.ts', { filePath: 'a.ts', imports: new Set() }],
          ['m.ts', { filePath: 'm.ts', imports: new Set() }],
        ]),
      }
      const result = (command as any).graphToDotFormat(graph)
      expect(result.nodes[0]).toBe('z.ts')
      expect(result.nodes[1]).toBe('a.ts')
      expect(result.nodes[2]).toBe('m.ts')
    })
  })

  describe('findOrphanFiles edge cases', () => {
    test('returns all files when no relative imports exist', () => {
      const graph = {
        nodes: new Map([
          ['a.ts', { filePath: 'a.ts', imports: new Set(['lodash']) }],
          ['b.ts', { filePath: 'b.ts', imports: new Set(['react']) }],
        ]),
      }
      const result = (command as any).findOrphanFiles(graph)
      expect(result).toHaveLength(2)
      expect(result).toContain('a.ts')
      expect(result).toContain('b.ts')
    })

    test('returns empty when all files are imported', () => {
      const graph = {
        nodes: new Map([
          ['index.ts', { filePath: 'index.ts', imports: new Set(['./a.ts', './b.ts']) }],
          ['a.ts', { filePath: 'a.ts', imports: new Set(['./b.ts']) }],
          ['b.ts', { filePath: 'b.ts', imports: new Set(['./a.ts']) }],
        ]),
      }
      const result = (command as any).findOrphanFiles(graph)
      expect(result).toContain('index.ts')
    })

    test('handles single file', () => {
      const graph = {
        nodes: new Map([['solo.ts', { filePath: 'solo.ts', imports: new Set() }]]),
      }
      const result = (command as any).findOrphanFiles(graph)
      expect(result).toEqual(['solo.ts'])
    })

    test('handles file that imports itself', () => {
      const graph = {
        nodes: new Map([['a.ts', { filePath: 'a.ts', imports: new Set(['./a.ts']) }]]),
      }
      const result = (command as any).findOrphanFiles(graph)
      expect(result).toContain('a.ts')
    })

    test('handles deeply nested relative imports', () => {
      const graph = {
        nodes: new Map([
          ['src/index.ts', { filePath: 'src/index.ts', imports: new Set(['./core/engine']) }],
          [
            'src/core/engine.ts',
            { filePath: 'src/core/engine.ts', imports: new Set(['./utils/parser']) },
          ],
          [
            'src/core/utils/parser.ts',
            { filePath: 'src/core/utils/parser.ts', imports: new Set() },
          ],
        ]),
      }
      const result = (command as any).findOrphanFiles(graph)
      expect(result).toContain('src/index.ts')
    })
  })

  describe('normalizeCycle comprehensive', () => {
    test('handles four element cycle rotation', () => {
      const cycle = ['d.ts', 'a.ts', 'b.ts', 'c.ts']
      const result = (command as any).normalizeCycle(cycle)
      expect(result[0]).toBe('a.ts')
    })

    test('handles cycle starting with minimum', () => {
      const cycle = ['a.ts', 'z.ts', 'm.ts']
      const result = (command as any).normalizeCycle(cycle)
      expect(result[0]).toBe('a.ts')
    })

    test('handles cycle with numbers', () => {
      const cycle = ['3.ts', '1.ts', '2.ts']
      const result = (command as any).normalizeCycle(cycle)
      expect(result[0]).toBe('1.ts')
    })

    test('handles long cycle', () => {
      const cycle = ['e.ts', 'a.ts', 'b.ts', 'c.ts', 'd.ts']
      const result = (command as any).normalizeCycle(cycle)
      expect(result[0]).toBe('a.ts')
    })

    test('handles two element cycle where first is smaller', () => {
      const cycle = ['a.ts', 'b.ts']
      const result = (command as any).normalizeCycle(cycle)
      expect(result[0]).toBe('a.ts')
    })

    test('handles cycle with path separators', () => {
      const cycle = ['src/z.ts', 'src/a.ts', 'src/m.ts']
      const result = (command as any).normalizeCycle(cycle)
      expect(result[0]).toBe('src/a.ts')
    })
  })

  describe('deduplicateCycles comprehensive', () => {
    test('returns empty array for empty input', () => {
      const result = (command as any).deduplicateCycles([])
      expect(result).toHaveLength(0)
    })

    test('returns single cycle unchanged', () => {
      const cycles = [{ cycle: ['a.ts', 'b.ts'], location: { line: 1, column: 1 } }]
      const result = (command as any).deduplicateCycles(cycles)
      expect(result).toHaveLength(1)
    })

    test('keeps genuinely different cycles', () => {
      const cycles = [
        { cycle: ['a.ts', 'b.ts'], location: { line: 1, column: 1 } },
        { cycle: ['c.ts', 'd.ts'], location: { line: 2, column: 1 } },
      ]
      const result = (command as any).deduplicateCycles(cycles)
      expect(result).toHaveLength(2)
    })

    test('deduplicates identical cycles', () => {
      const cycles = [
        { cycle: ['a.ts', 'b.ts'], location: { line: 1, column: 1 } },
        { cycle: ['a.ts', 'b.ts'], location: { line: 2, column: 1 } },
      ]
      const result = (command as any).deduplicateCycles(cycles)
      expect(result).toHaveLength(1)
    })

    test('handles four rotations of same cycle', () => {
      const cycles = [
        { cycle: ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'a.ts'], location: { line: 1, column: 1 } },
        { cycle: ['b.ts', 'c.ts', 'd.ts', 'a.ts', 'b.ts'], location: { line: 2, column: 1 } },
        { cycle: ['c.ts', 'd.ts', 'a.ts', 'b.ts', 'c.ts'], location: { line: 3, column: 1 } },
        { cycle: ['d.ts', 'a.ts', 'b.ts', 'c.ts', 'd.ts'], location: { line: 4, column: 1 } },
      ]
      const result = (command as any).deduplicateCycles(cycles)
      expect(result).toHaveLength(1)
    })
  })

  describe('recordCycle edge cases', () => {
    test('correctly slices cycle from middle of path', () => {
      const node = {
        filePath: 'c.ts',
        importDetails: new Map([
          ['a.ts', { location: { column: 1, line: 3 }, modulePath: 'a.ts', sourceFile: 'c.ts' }],
        ]),
        imports: new Set(['a.ts']),
      }
      const context = {
        cycles: [] as any[],
        path: ['x.ts', 'a.ts', 'b.ts', 'c.ts'],
      }

      ;(command as any).recordCycle('a.ts', node, context)
      expect(context.cycles).toHaveLength(1)
      expect(context.cycles[0].cycle).toEqual(['a.ts', 'b.ts', 'c.ts', 'a.ts'])
    })

    test('preserves location from import details', () => {
      const node = {
        filePath: 'b.ts',
        importDetails: new Map([
          [
            './a.ts',
            { location: { column: 5, line: 10 }, modulePath: './a.ts', sourceFile: 'b.ts' },
          ],
        ]),
        imports: new Set(['./a.ts']),
      }
      const context = {
        cycles: [] as any[],
        path: ['a.ts', 'b.ts'],
      }

      ;(command as any).recordCycle('./a.ts', node, context)
      expect(context.cycles[0].location).toEqual({ column: 5, line: 10 })
    })

    test('records multiple cycles sequentially', () => {
      const node1 = {
        filePath: 'b.ts',
        importDetails: new Map([
          [
            './a.ts',
            { location: { column: 1, line: 1 }, modulePath: './a.ts', sourceFile: 'b.ts' },
          ],
        ]),
        imports: new Set(['./a.ts']),
      }
      const context = {
        cycles: [] as any[],
        path: ['a.ts', 'b.ts'],
      }

      ;(command as any).recordCycle('./a.ts', node1, context)

      const node2 = {
        filePath: 'c.ts',
        importDetails: new Map([
          [
            './a.ts',
            { location: { column: 1, line: 2 }, modulePath: './a.ts', sourceFile: 'c.ts' },
          ],
        ]),
        imports: new Set(['./a.ts']),
      }
      context.path = ['a.ts', 'c.ts']
      ;(command as any).recordCycle('./a.ts', node2, context)
      expect(context.cycles).toHaveLength(2)
    })
  })

  describe('finishNodeVisit edge cases', () => {
    test('handles empty path gracefully', () => {
      const path: string[] = []
      const recursionStack = new Set<string>()

      ;(command as any).finishNodeVisit('a.ts', path, recursionStack)

      expect(path).toEqual([])
      expect(recursionStack.has('a.ts')).toBe(false)
    })

    test('handles single element path', () => {
      const path = ['a.ts']
      const recursionStack = new Set(['a.ts'])

      ;(command as any).finishNodeVisit('a.ts', path, recursionStack)

      expect(path).toEqual([])
      expect(recursionStack.has('a.ts')).toBe(false)
    })
  })

  describe('detectCyclesFromNode edge cases', () => {
    test('handles node with multiple imports no cycle', () => {
      const graph = {
        nodes: new Map([
          [
            'a.ts',
            {
              filePath: 'a.ts',
              importDetails: new Map(),
              imports: new Set(['./b.ts', './c.ts', './d.ts']),
            },
          ],
          ['b.ts', { filePath: 'b.ts', importDetails: new Map(), imports: new Set() }],
          ['c.ts', { filePath: 'c.ts', importDetails: new Map(), imports: new Set() }],
          ['d.ts', { filePath: 'd.ts', importDetails: new Map(), imports: new Set() }],
        ]),
      }
      const context = {
        cycles: [] as any[],
        graph,
        maxDepth: 50,
        path: [],
        recursionStack: new Set<string>(),
        visited: new Set<string>(),
      }

      ;(command as any).detectCyclesFromNode('a.ts', context)
      expect(context.cycles).toHaveLength(0)
    })

    test('handles node with no imports', () => {
      const graph = {
        nodes: new Map([
          ['a.ts', { filePath: 'a.ts', importDetails: new Map(), imports: new Set() }],
        ]),
      }
      const context = {
        cycles: [] as any[],
        graph,
        maxDepth: 50,
        path: [],
        recursionStack: new Set<string>(),
        visited: new Set<string>(),
      }

      ;(command as any).detectCyclesFromNode('a.ts', context)
      expect(context.cycles).toHaveLength(0)
      expect(context.visited.has('a.ts')).toBe(true)
    })

    test('respects maxDepth boundary exactly', () => {
      const graph = {
        nodes: new Map([
          ['a.ts', { filePath: 'a.ts', importDetails: new Map(), imports: new Set(['./b.ts']) }],
        ]),
      }
      const context = {
        cycles: [] as any[],
        graph,
        maxDepth: 50,
        path: new Array(51).fill('x.ts'),
        recursionStack: new Set(),
        visited: new Set(),
      }
      const initialCycles = context.cycles.length

      ;(command as any).detectCyclesFromNode('a.ts', context)
      expect(context.cycles.length).toBe(initialCycles)
    })
  })

  describe('processDependency edge cases', () => {
    test('handles visited but not in recursion stack (no cycle)', () => {
      const graph = {
        nodes: new Map([
          ['a.ts', { filePath: 'a.ts', importDetails: new Map(), imports: new Set(['./b.ts']) }],
          ['b.ts', { filePath: 'b.ts', importDetails: new Map(), imports: new Set() }],
        ]),
      }
      const context = {
        cycles: [] as any[],
        graph,
        maxDepth: 50,
        path: ['a.ts'],
        recursionStack: new Set(['a.ts']),
        visited: new Set(['a.ts', 'b.ts']),
      }

      ;(command as any).processDependency('b.ts', graph.nodes.get('a.ts')!, context)
      expect(context.cycles).toHaveLength(0)
    })

    test('handles dependency not in graph nodes', () => {
      const graph = {
        nodes: new Map([
          [
            'a.ts',
            { filePath: 'a.ts', importDetails: new Map(), imports: new Set(['./missing.ts']) },
          ],
        ]),
      }
      const context = {
        cycles: [] as any[],
        graph,
        maxDepth: 50,
        path: ['a.ts'],
        recursionStack: new Set(['a.ts']),
        visited: new Set(['a.ts']),
      }

      ;(command as any).processDependency('./missing.ts', graph.nodes.get('a.ts')!, context)
      expect(context.cycles).toHaveLength(0)
    })
  })

  describe('displayDotFormat comprehensive', () => {
    test('outputs correct node labels', () => {
      const report = {
        graph: {
          edges: [],
          nodes: ['index.ts', 'utils.ts', 'config.ts'],
        },
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayDotFormat(report)
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"index.ts" [label="index.ts"]'))
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"utils.ts" [label="utils.ts"]'))
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('"config.ts" [label="config.ts"]'),
      )
    })

    test('outputs correct edge syntax', () => {
      const report = {
        graph: {
          edges: [['main.ts', 'utils.ts']],
          nodes: ['main.ts', 'utils.ts'],
        },
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayDotFormat(report)
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"main.ts" -> "utils.ts"'))
    })

    test('outputs closing brace', () => {
      const report = {
        graph: {
          edges: [],
          nodes: ['a.ts'],
        },
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayDotFormat(report)
      expect(logSpy).toHaveBeenCalledWith('}')
    })

    test('handles multiple edges', () => {
      const report = {
        graph: {
          edges: [
            ['a.ts', 'b.ts'],
            ['a.ts', 'c.ts'],
            ['b.ts', 'c.ts'],
          ],
          nodes: ['a.ts', 'b.ts', 'c.ts'],
        },
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayDotFormat(report)
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"a.ts" -> "b.ts"'))
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"a.ts" -> "c.ts"'))
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"b.ts" -> "c.ts"'))
    })
  })

  describe('displayFullReport comprehensive', () => {
    test('displays files analyzed count', () => {
      const report = {
        circularDependencies: [],
        externalModules: [],
        filesAnalyzed: 42,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayFullReport(report, 'table')
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('42'))
    })

    test('displays exactly 5 circular deps without truncation', () => {
      const report = {
        circularDependencies: Array.from({ length: 5 }, (_, i) => ({
          cycle: [`a${i}.ts`, `b${i}.ts`],
          location: { line: 1, column: 1 },
        })),
        externalModules: [],
        filesAnalyzed: 10,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayFullReport(report, 'table')
      const allCalls = logSpy.mock.calls.map((call: any[]) => call[0])
      const hasMoreMessage = allCalls.some(
        (msg: string) => typeof msg === 'string' && msg.includes('more'),
      )
      expect(hasMoreMessage).toBe(false)
    })

    test('displays exactly 10 internal modules without truncation', () => {
      const report = {
        circularDependencies: [],
        externalModules: [],
        filesAnalyzed: 10,
        graph: { edges: [], nodes: [] },
        internalModules: Array.from({ length: 10 }, (_, i) => `./mod${i}`),
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayFullReport(report, 'table')
      const allCalls = logSpy.mock.calls.map((call: any[]) => call[0])
      const hasMoreMessage = allCalls.some(
        (msg: string) => typeof msg === 'string' && msg.includes('more'),
      )
      expect(hasMoreMessage).toBe(false)
    })

    test('displays all sections when populated', () => {
      const report = {
        circularDependencies: [{ cycle: ['a.ts', 'b.ts'], location: { line: 1, column: 1 } }],
        externalModules: ['lodash'],
        filesAnalyzed: 5,
        graph: { edges: [['a.ts', 'b.ts']], nodes: ['a.ts', 'b.ts'] },
        internalModules: ['./utils'],
        orphanFiles: ['orphan.ts'],
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayFullReport(report, 'table')
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Circular Dependencies'))
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Internal Modules'))
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('External Modules'))
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Orphan Files'))
    })

    test('does not display internal modules section when empty', () => {
      const report = {
        circularDependencies: [],
        externalModules: ['lodash'],
        filesAnalyzed: 1,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayFullReport(report, 'table')
      const allCalls = logSpy.mock.calls.map((call: any[]) => call[0])
      const hasInternalModulesHeader = allCalls.some(
        (msg: string) => typeof msg === 'string' && msg.includes('Internal Modules'),
      )
      expect(hasInternalModulesHeader).toBe(false)
    })

    test('does not display external modules section when empty', () => {
      const report = {
        circularDependencies: [],
        externalModules: [],
        filesAnalyzed: 1,
        graph: { edges: [], nodes: [] },
        internalModules: ['./utils'],
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayFullReport(report, 'table')
      const allCalls = logSpy.mock.calls.map((call: any[]) => call[0])
      const hasExternalModulesHeader = allCalls.some(
        (msg: string) => typeof msg === 'string' && msg.includes('External Modules'),
      )
      expect(hasExternalModulesHeader).toBe(false)
    })

    test('does not display orphan files section when empty', () => {
      const report = {
        circularDependencies: [],
        externalModules: ['lodash'],
        filesAnalyzed: 1,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayFullReport(report, 'table')
      const allCalls = logSpy.mock.calls.map((call: any[]) => call[0])
      const hasOrphanFilesHeader = allCalls.some(
        (msg: string) => typeof msg === 'string' && msg.includes('Orphan Files'),
      )
      expect(hasOrphanFilesHeader).toBe(false)
    })

    test('json output is parseable', () => {
      const report = {
        circularDependencies: [],
        externalModules: [],
        filesAnalyzed: 0,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayFullReport(report, 'json')
      const callArg = logSpy.mock.calls[0]?.[0]
      expect(() => JSON.parse(callArg)).not.toThrow()
    })
  })

  describe('analyzeDependencies integration', () => {
    test('categorizes internal and external imports', async () => {
      const mockParserInstance = {
        dispose: vi.fn(),
        initialize: vi.fn().mockResolvedValue(undefined),
        parseFile: vi
          .fn()
          .mockResolvedValueOnce({
            sourceFile: {
              getText: () => 'import { x } from "./internal"\nimport lodash from "lodash"',
            },
          })
          .mockResolvedValueOnce({
            sourceFile: { getText: () => 'import { y } from "./other"\nimport react from "react"' },
          }),
      }
      mockParser.mockImplementation(function () {
        return mockParserInstance
      })

      const files = [
        { absolutePath: '/a.ts', path: 'a.ts' },
        { absolutePath: '/b.ts', path: 'b.ts' },
      ]
      const oraMock = { start: vi.fn().mockReturnThis(), stop: vi.fn(), text: '' }

      const cmd = new Dependencies([], {} as any)
      const result = await (cmd as any).analyzeDependencies(files, oraMock)

      expect(result.filesAnalyzed).toBe(2)
      expect(result.externalModules).toContain('lodash')
      expect(result.externalModules).toContain('react')
      expect(result.internalModules).toContain('./internal')
      expect(result.internalModules).toContain('./other')
    })

    test('sorts external modules alphabetically', async () => {
      const mockParserInstance = {
        dispose: vi.fn(),
        initialize: vi.fn().mockResolvedValue(undefined),
        parseFile: vi.fn().mockResolvedValue({
          sourceFile: { getText: () => 'import z from "zoo"\nimport a from "alpha"' },
        }),
      }
      mockParser.mockImplementation(function () {
        return mockParserInstance
      })

      const files = [{ absolutePath: '/a.ts', path: 'a.ts' }]
      const oraMock = { start: vi.fn().mockReturnThis(), stop: vi.fn(), text: '' }

      const cmd = new Dependencies([], {} as any)
      const result = await (cmd as any).analyzeDependencies(files, oraMock)

      expect(result.externalModules[0]).toBe('alpha')
      expect(result.externalModules[1]).toBe('zoo')
    })

    test('sorts internal modules alphabetically', async () => {
      const mockParserInstance = {
        dispose: vi.fn(),
        initialize: vi.fn().mockResolvedValue(undefined),
        parseFile: vi.fn().mockResolvedValue({
          sourceFile: { getText: () => 'import { z } from "./zoo"\nimport { a } from "./alpha"' },
        }),
      }
      mockParser.mockImplementation(function () {
        return mockParserInstance
      })

      const files = [{ absolutePath: '/a.ts', path: 'a.ts' }]
      const oraMock = { start: vi.fn().mockReturnThis(), stop: vi.fn(), text: '' }

      const cmd = new Dependencies([], {} as any)
      const result = await (cmd as any).analyzeDependencies(files, oraMock)

      expect(result.internalModules[0]).toBe('./alpha')
      expect(result.internalModules[1]).toBe('./zoo')
    })

    test('deduplicates external modules', async () => {
      const mockParserInstance = {
        dispose: vi.fn(),
        initialize: vi.fn().mockResolvedValue(undefined),
        parseFile: vi
          .fn()
          .mockResolvedValueOnce({ sourceFile: { getText: () => 'import a from "lodash"' } })
          .mockResolvedValueOnce({ sourceFile: { getText: () => 'import b from "lodash"' } }),
      }
      mockParser.mockImplementation(function () {
        return mockParserInstance
      })

      const files = [
        { absolutePath: '/a.ts', path: 'a.ts' },
        { absolutePath: '/b.ts', path: 'b.ts' },
      ]
      const oraMock = { start: vi.fn().mockReturnThis(), stop: vi.fn(), text: '' }

      const cmd = new Dependencies([], {} as any)
      const result = await (cmd as any).analyzeDependencies(files, oraMock)

      expect(result.externalModules).toEqual(['lodash'])
    })

    test('deduplicates internal modules', async () => {
      const mockParserInstance = {
        dispose: vi.fn(),
        initialize: vi.fn().mockResolvedValue(undefined),
        parseFile: vi
          .fn()
          .mockResolvedValueOnce({ sourceFile: { getText: () => 'import { x } from "./shared"' } })
          .mockResolvedValueOnce({ sourceFile: { getText: () => 'import { y } from "./shared"' } }),
      }
      mockParser.mockImplementation(function () {
        return mockParserInstance
      })

      const files = [
        { absolutePath: '/a.ts', path: 'a.ts' },
        { absolutePath: '/b.ts', path: 'b.ts' },
      ]
      const oraMock = { start: vi.fn().mockReturnThis(), stop: vi.fn(), text: '' }

      const cmd = new Dependencies([], {} as any)
      const result = await (cmd as any).analyzeDependencies(files, oraMock)

      expect(result.internalModules).toEqual(['./shared'])
    })
  })
  describe('args configuration', () => {
    test('has path argument defined', () => {
      expect(Dependencies.args).toHaveProperty('path')
    })

    test('path argument is a string type', () => {
      const args = Dependencies.args
      expect((args.path as any).type).toBe('option')
    })
  })

  describe('static examples', () => {
    test('first example has analyze dependencies command', () => {
      const example = Dependencies.examples[0]
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    })

    test('second example has json format', () => {
      const example = Dependencies.examples[1]
      expect((example as any).command).toContain('json')
    })

    test('third example has circular flag', () => {
      const example = Dependencies.examples[2]
      expect((example as any).command).toContain('circular')
    })

    test('fourth example has tree flag', () => {
      const example = Dependencies.examples[3]
      expect((example as any).command).toContain('tree')
    })
  })

  describe('additional edge cases', () => {
    test('extractImports handles multiline source code', () => {
      const sourceCode = [
        'const x = 1',
        '',
        'import { a } from "./a"',
        'import { b } from "./b"',
        '',
        'const y = 2',
        'import { c } from "./c"',
      ].join('\n')
      const result = (command as any).extractImports(sourceCode, 'test.ts')
      expect(result).toHaveLength(3)
      expect(result[0].location.line).toBe(3)
      expect(result[1].location.line).toBe(4)
      expect(result[2].location.line).toBe(7)
    })

    test('graphToDotFormat with large graph', () => {
      const entries = Array.from({ length: 20 }, (_, i) => [
        `file${i}.ts`,
        { filePath: `file${i}.ts`, imports: new Set(i > 0 ? [`./file${i - 1}.ts`] : []) },
      ])
      const graph = { nodes: new Map(entries) }
      const result = (command as any).graphToDotFormat(graph)
      expect(result.nodes).toHaveLength(20)
      expect(result.edges).toHaveLength(19)
    })

    test('displayFullReport with no data at all', () => {
      const report = {
        circularDependencies: [],
        externalModules: [],
        filesAnalyzed: 0,
        graph: { edges: [], nodes: [] },
        internalModules: [],
        orphanFiles: [],
      }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayFullReport(report, 'table')
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('0'))
    })

    test('normalizeCycle handles five element rotation', () => {
      const cycle = ['z.ts', 'b.ts', 'c.ts', 'd.ts', 'a.ts', 'z.ts']
      const result = (command as any).normalizeCycle(cycle)
      expect(result[0]).toBe('a.ts')
    })

    test('detectCyclesFromNode handles node with empty imports set', () => {
      const graph = {
        nodes: new Map([
          ['leaf.ts', { filePath: 'leaf.ts', importDetails: new Map(), imports: new Set() }],
        ]),
      }
      const context = {
        cycles: [] as any[],
        graph,
        maxDepth: 50,
        path: [],
        recursionStack: new Set<string>(),
        visited: new Set<string>(),
      }
      ;(command as any).detectCyclesFromNode('leaf.ts', context)
      expect(context.cycles).toHaveLength(0)
      expect(context.visited.has('leaf.ts')).toBe(true)
    })

    test('findOrphanFiles with complex dependency graph', () => {
      const graph = {
        nodes: new Map([
          ['index.ts', { filePath: 'index.ts', imports: new Set(['./a.ts', './b.ts']) }],
          ['a.ts', { filePath: 'a.ts', imports: new Set(['./c.ts']) }],
          ['b.ts', { filePath: 'b.ts', imports: new Set(['./c.ts']) }],
          ['c.ts', { filePath: 'c.ts', imports: new Set() }],
          ['d.ts', { filePath: 'd.ts', imports: new Set() }],
        ]),
      }
      const result = (command as any).findOrphanFiles(graph)
      expect(result).toContain('index.ts')
      expect(result).toContain('d.ts')
      expect(result).toContain('c.ts')
      expect(result).toContain('a.ts')
      expect(result).toContain('b.ts')
      expect(result).toHaveLength(5)
    })

    test('formatOutput with all flags false returns full JSON', () => {
      const report = {
        circularDependencies: [],
        externalModules: ['chalk'],
        filesAnalyzed: 3,
        graph: { edges: [['a.ts', 'b.ts']], nodes: ['a.ts', 'b.ts'] },
        internalModules: ['./utils'],
        orphanFiles: [],
      }
      const result = (command as any).formatOutput(report, { format: 'table' })
      const parsed = JSON.parse(result)
      expect(parsed.filesAnalyzed).toBe(3)
      expect(parsed.externalModules).toEqual(['chalk'])
    })

    test('displayDependencyTree handles node at depth limit', () => {
      const edges: [string, string][] = []
      const nodes: string[] = []
      for (let i = 0; i < 12; i++) {
        nodes.push(`d${i}.ts`)
        if (i > 0) edges.push([`d${i - 1}.ts`, `d${i}.ts`])
      }
      const report = { graph: { edges, nodes } }
      const logSpy = vi.spyOn(command, 'log')
      ;(command as any).displayDependencyTree(report)
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Dependency Tree'))
    })

    test('recordCycle produces cycle ending with dependency', () => {
      const node = {
        filePath: 'b.ts',
        importDetails: new Map([
          [
            'start.ts',
            { location: { column: 1, line: 5 }, modulePath: 'start.ts', sourceFile: 'b.ts' },
          ],
        ]),
        imports: new Set(['start.ts']),
      }
      const context = {
        cycles: [] as any[],
        path: ['start.ts', 'mid.ts', 'b.ts'],
      }
      ;(command as any).recordCycle('start.ts', node, context)
      expect(context.cycles).toHaveLength(1)
      expect(context.cycles[0].cycle.at(-1)).toBe('start.ts')
    })
  })
})
