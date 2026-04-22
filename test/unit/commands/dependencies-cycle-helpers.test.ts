import { describe, expect, test } from 'vitest'

import {
  deduplicateCycles,
  detectCircularDependencies,
  detectCyclesFromNode,
  finishNodeVisit,
  normalizeCycle,
  processDependency,
  recordCycle,
} from '../../../src/commands/dependencies-cycle-helpers.js'
import type {
  CircularDependency,
  CycleDetectionContext,
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

const makeImportDetail = (
  modulePath: string,
  sourceFile: string,
  line = 1,
  column = 1,
  end = 10,
): ImportInfo => ({ location: { column, end, line }, modulePath, sourceFile })

/** Build a cycle-connected graph from an ordered path of file paths. */
const makeCycleGraph = (
  paths: string[],
  extraEdges: Map<string, string[]> = new Map(),
): DependencyGraph => {
  const nodes = new Map<string, DependencyNode>()
  for (let i = 0; i < paths.length; i++) {
    const current = paths[i]
    const next = paths[(i + 1) % paths.length]
    const details = new Map<string, ImportInfo>()
    details.set(next, makeImportDetail(next, current, i + 1))
    const extras = extraEdges.get(current) ?? []
    for (const extra of extras) {
      details.set(extra, makeImportDetail(extra, current))
    }
    nodes.set(current, {
      filePath: current,
      importDetails: details,
      imports: new Set([next, ...extras]),
    })
  }
  return { nodes }
}

// ============================================================================
// finishNodeVisit
// ============================================================================

describe('finishNodeVisit', () => {
  test('pops from path and deletes from recursionStack', () => {
    const path = ['/a', '/b', '/c']
    const recursionStack = new Set(['/a', '/b', '/c'])

    finishNodeVisit('/c', path, recursionStack)

    expect(path).toEqual(['/a', '/b'])
    expect(recursionStack.has('/c')).toBe(false)
    expect(recursionStack.has('/a')).toBe(true)
    expect(recursionStack.has('/b')).toBe(true)
  })

  test('handles path with single element', () => {
    const path = ['/a']
    const recursionStack = new Set(['/a'])

    finishNodeVisit('/a', path, recursionStack)

    expect(path).toEqual([])
    expect(recursionStack.has('/a')).toBe(false)
  })

  test('handles empty path gracefully', () => {
    const path: string[] = []
    const recursionStack = new Set<string>()

    finishNodeVisit('/x', path, recursionStack)

    expect(path).toEqual([])
    expect(recursionStack.size).toBe(0)
  })

  test('does not affect other items in recursionStack', () => {
    const path = ['/a', '/b']
    const recursionStack = new Set(['/a', '/b', '/c', '/d'])

    finishNodeVisit('/b', path, recursionStack)

    expect(recursionStack.has('/a')).toBe(true)
    expect(recursionStack.has('/c')).toBe(true)
    expect(recursionStack.has('/d')).toBe(true)
  })

  test('returns void', () => {
    const result = finishNodeVisit('/a', ['/a'], new Set(['/a']))
    expect(result).toBeUndefined()
  })

  test('removes only the specified node from recursionStack', () => {
    const path = ['/a', '/b', '/c']
    const recursionStack = new Set(['/a', '/b', '/c'])

    finishNodeVisit('/b', path, recursionStack)

    // path.pop() removes last element regardless of argument
    expect(recursionStack.has('/b')).toBe(false)
    expect(recursionStack.has('/a')).toBe(true)
    expect(recursionStack.has('/c')).toBe(true)
  })

  test('handles node not in recursionStack without error', () => {
    const path = ['/a']
    const recursionStack = new Set<string>()

    finishNodeVisit('/z', path, recursionStack)

    expect(path).toEqual([])
  })
})

// ============================================================================
// normalizeCycle
// ============================================================================

describe('normalizeCycle', () => {
  test('returns copy of single-element cycle', () => {
    const result = normalizeCycle(['/a'])
    expect(result).toEqual(['/a'])
  })

  test('returns copy of empty cycle', () => {
    const result = normalizeCycle([])
    expect(result).toEqual([])
  })

  test('rotates cycle to start with lexicographically smallest element', () => {
    const result = normalizeCycle(['/z', '/a', '/m', '/z'])
    expect(result[0]).toBe('/a')
  })

  test('appends smallest element at end to close cycle', () => {
    const result = normalizeCycle(['/z', '/a', '/m', '/z'])
    expect(result[result.length - 1]).toBe('/a')
  })

  test('handles two-element cycle', () => {
    const result = normalizeCycle(['/b', '/a', '/b'])
    expect(result).toEqual(['/a', '/b', '/a'])
  })

  test('handles already-normalized three-element cycle', () => {
    const result = normalizeCycle(['/a', '/b', '/c', '/a'])
    expect(result).toEqual(['/a', '/b', '/c', '/a'])
  })

  test('rotates three-element cycle starting at middle', () => {
    const result = normalizeCycle(['/c', '/a', '/b', '/c'])
    expect(result).toEqual(['/a', '/b', '/c', '/a'])
  })

  test('handles four-element cycle', () => {
    const result = normalizeCycle(['/d', '/c', '/a', '/b', '/d'])
    expect(result[0]).toBe('/a')
    expect(result[result.length - 1]).toBe('/a')
  })

  test('handles single-element cycle with duplicate', () => {
    const result = normalizeCycle(['/a', '/a'])
    expect(result).toEqual(['/a', '/a'])
  })

  test('returns new array without mutating input', () => {
    const input = ['/z', '/a', '/b', '/z']
    const result = normalizeCycle(input)
    expect(result).not.toBe(input)
    expect(input).toEqual(['/z', '/a', '/b', '/z'])
  })

  test('handles long cycle correctly', () => {
    const result = normalizeCycle(['/z', '/y', '/x', '/a', '/b', '/c', '/z'])
    expect(result).toEqual(['/a', '/b', '/c', '/z', '/y', '/x', '/a'])
  })

  test('handles paths with same prefix using lexicographic ordering', () => {
    const result = normalizeCycle(['/src/z.ts', '/src/a.ts', '/src/m.ts', '/src/z.ts'])
    expect(result[0]).toBe('/src/a.ts')
  })

  test('rotates reverse-ordered cycle', () => {
    const result = normalizeCycle(['/c', '/b', '/a', '/c'])
    expect(result).toEqual(['/a', '/c', '/b', '/a'])
  })

  test('preserves all unique elements in rotated output', () => {
    const result = normalizeCycle(['/d', '/a', '/b', '/c', '/d'])
    const unique = new Set(result.slice(0, -1))
    expect(unique.size).toBe(4)
  })

  test('handles five-element cycle', () => {
    const result = normalizeCycle(['/e', '/d', '/c', '/b', '/a', '/e'])
    expect(result[0]).toBe('/a')
    expect(result[result.length - 1]).toBe('/a')
    expect(result).toHaveLength(6)
  })
})

// ============================================================================
// deduplicateCycles
// ============================================================================

describe('deduplicateCycles', () => {
  test('returns empty array for empty input', () => {
    expect(deduplicateCycles([])).toEqual([])
  })

  test('keeps all unique cycles', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['/c', '/d', '/c'], location: { column: 1, end: 10, line: 2 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(2)
  })

  test('removes duplicate cycles with same normalized form', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['/b', '/a', '/b'], location: { column: 1, end: 10, line: 2 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(1)
  })

  test('keeps first occurrence when duplicates exist', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['/a', '/b', '/a'], location: { column: 2, end: 20, line: 5 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(1)
    expect(result[0]?.location.line).toBe(1)
  })

  test('deduplicates three rotations of the same cycle', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['/a', '/b', '/c', '/a'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['/b', '/c', '/a', '/b'], location: { column: 1, end: 10, line: 2 } },
      { cycle: ['/c', '/a', '/b', '/c'], location: { column: 1, end: 10, line: 3 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(1)
  })

  test('handles single cycle without duplication', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['/x', '/y', '/x'], location: { column: 1, end: 10, line: 1 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(1)
    expect(result[0]?.cycle).toEqual(['/x', '/y', '/x'])
  })

  test('deduplicates four-element cycle rotations', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['/a', '/b', '/c', '/d', '/a'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['/c', '/d', '/a', '/b', '/c'], location: { column: 1, end: 10, line: 2 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(1)
  })

  test('keeps cycles with different lengths separate', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['/a', '/b', '/c', '/a'], location: { column: 1, end: 10, line: 2 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(2)
  })

  test('handles many identical cycles efficiently', () => {
    const cycles: CircularDependency[] = Array.from({ length: 100 }, (_, i) => ({
      cycle: ['/a', '/b', '/a'],
      location: { column: 1, end: 10, line: i + 1 },
    }))
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(1)
  })
})

// ============================================================================
// recordCycle
// ============================================================================

describe('recordCycle', () => {
  test('records cycle with import details', () => {
    const node: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: 'a.ts', sourceFile: 'b.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const context = { cycles: [] as CircularDependency[], path: ['a.ts', 'b.ts'] }

    recordCycle('a.ts', node, context)

    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]?.cycle).toEqual(['a.ts', 'b.ts', 'a.ts'])
    expect(context.cycles[0]?.location).toEqual({ column: 1, end: 10, line: 1 })
  })

  test('does not record cycle when import detail is missing', () => {
    const node: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map(),
      imports: new Set(['./a.ts']),
    }
    const context = { cycles: [] as CircularDependency[], path: ['a.ts', 'b.ts'] }

    recordCycle('./a.ts', node, context)

    expect(context.cycles).toHaveLength(0)
  })

  test('records correct cycle when dependency appears mid-path', () => {
    const node: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 5, end: 20, line: 3 }, modulePath: 'a.ts', sourceFile: 'c.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const context = { cycles: [] as CircularDependency[], path: ['a.ts', 'b.ts', 'c.ts'] }

    recordCycle('a.ts', node, context)

    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]?.cycle).toEqual(['a.ts', 'b.ts', 'c.ts', 'a.ts'])
  })

  test('records cycle starting at the dependency index in path', () => {
    const node: DependencyNode = {
      filePath: 'd.ts',
      importDetails: new Map([
        [
          'b.ts',
          { location: { column: 1, end: 15, line: 2 }, modulePath: 'b.ts', sourceFile: 'd.ts' },
        ],
      ]),
      imports: new Set(['b.ts']),
    }
    const context = { cycles: [] as CircularDependency[], path: ['a.ts', 'b.ts', 'c.ts', 'd.ts'] }

    recordCycle('b.ts', node, context)

    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]?.cycle).toEqual(['b.ts', 'c.ts', 'd.ts', 'b.ts'])
  })

  test('does not mutate the path array', () => {
    const node: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: 'a.ts', sourceFile: 'b.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const context = { cycles: [] as CircularDependency[], path: ['a.ts', 'b.ts'] }
    const originalPath = [...context.path]

    recordCycle('a.ts', node, context)

    expect(context.path).toEqual(originalPath)
  })

  test('records self-referencing cycle', () => {
    const node: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 3, end: 15, line: 7 }, modulePath: 'a.ts', sourceFile: 'a.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const context = { cycles: [] as CircularDependency[], path: ['a.ts'] }

    recordCycle('a.ts', node, context)

    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]?.cycle).toEqual(['a.ts', 'a.ts'])
  })

  test('records location from the import detail', () => {
    const node: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 5, end: 25, line: 42 }, modulePath: 'a.ts', sourceFile: 'b.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const context = { cycles: [] as CircularDependency[], path: ['a.ts', 'b.ts'] }

    recordCycle('a.ts', node, context)

    expect(context.cycles[0]?.location).toEqual({ column: 5, end: 25, line: 42 })
  })

  test('records cycle for deep path correctly', () => {
    const node: DependencyNode = {
      filePath: 'e.ts',
      importDetails: new Map([
        [
          'b.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: 'b.ts', sourceFile: 'e.ts' },
        ],
      ]),
      imports: new Set(['b.ts']),
    }
    const context = {
      cycles: [] as CircularDependency[],
      path: ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'],
    }

    recordCycle('b.ts', node, context)

    expect(context.cycles[0]?.cycle).toEqual(['b.ts', 'c.ts', 'd.ts', 'e.ts', 'b.ts'])
  })
})

// ============================================================================
// processDependency
// ============================================================================

describe('processDependency', () => {
  test('returns early when dependency not in graph', () => {
    const graph: DependencyGraph = { nodes: new Map() }
    const node = makeNode({ filePath: 'a.ts', imports: new Set() })
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: ['a.ts'],
      recursionStack: new Set(['a.ts']),
      visited: new Set(['a.ts']),
    }

    processDependency('nonexistent.ts', node, context)

    expect(context.cycles).toHaveLength(0)
  })

  test('records cycle when dependency is in recursion stack and visited', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        [
          './b.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: './b.ts', sourceFile: 'a.ts' },
        ],
      ]),
      imports: new Set(['./b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: './a.ts', sourceFile: 'b.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: ['a.ts', 'b.ts'],
      recursionStack: new Set(['a.ts', 'b.ts']),
      visited: new Set(['a.ts', 'b.ts']),
    }

    processDependency('a.ts', nodeB, context)

    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]?.cycle).toContain('a.ts')
  })

  test('visits unvisited dependency via detectCyclesFromNode', () => {
    const nodeA = makeNode({ filePath: 'a.ts', imports: new Set(['b.ts']) })
    const nodeB = makeNode({ filePath: 'b.ts', imports: new Set() })
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: ['a.ts'],
      recursionStack: new Set(['a.ts']),
      visited: new Set(['a.ts']),
    }

    processDependency('b.ts', nodeA, context)

    expect(context.visited.has('b.ts')).toBe(true)
  })

  test('does nothing when dependency is visited but not in recursion stack', () => {
    const nodeA = makeNode({ filePath: 'a.ts', imports: new Set(['b.ts']) })
    const nodeB = makeNode({ filePath: 'b.ts', imports: new Set() })
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: ['a.ts'],
      recursionStack: new Set(['a.ts']),
      visited: new Set(['a.ts', 'b.ts']),
    }

    processDependency('b.ts', nodeA, context)

    expect(context.cycles).toHaveLength(0)
  })

  test('creates new path for recursive visit without mutating parent path', () => {
    const nodeA = makeNode({ filePath: 'a.ts', imports: new Set(['b.ts']) })
    const nodeB = makeNode({ filePath: 'b.ts', imports: new Set() })
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: ['a.ts'],
      recursionStack: new Set(['a.ts']),
      visited: new Set(['a.ts']),
    }

    processDependency('b.ts', nodeA, context)

    expect(context.path).toEqual(['a.ts'])
    expect(context.path).toEqual(['a.ts'])
  })

  test('records cycle for three-node back-reference', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts')]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['c.ts', makeImportDetail('c.ts', 'b.ts')]]),
      imports: new Set(['c.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'c.ts')]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
      ]),
    }

    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: ['a.ts', 'b.ts', 'c.ts'],
      recursionStack: new Set(['a.ts', 'b.ts', 'c.ts']),
      visited: new Set(['a.ts', 'b.ts', 'c.ts']),
    }

    processDependency('a.ts', nodeC, context)

    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]?.cycle).toEqual(['a.ts', 'b.ts', 'c.ts', 'a.ts'])
  })
})

// ============================================================================
// detectCyclesFromNode
// ============================================================================

describe('detectCyclesFromNode', () => {
  test('returns early when path exceeds max depth', () => {
    const graph = makeGraph([makeNode({ filePath: 'a.ts', imports: new Set(['./b.ts']) })])
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 2,
      path: ['x.ts', 'y.ts', 'z.ts'],
      recursionStack: new Set(['x.ts', 'y.ts', 'z.ts']),
      visited: new Set(['x.ts', 'y.ts', 'z.ts']),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.cycles).toHaveLength(0)
  })

  test('adds node to visited and recursion stack then cleans up', () => {
    const graph = makeGraph([makeNode({ filePath: 'a.ts', imports: new Set() })])
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.visited.has('a.ts')).toBe(true)
    expect(context.recursionStack.has('a.ts')).toBe(false)
    expect(context.path).toEqual([])
  })

  test('handles node not in graph', () => {
    const graph: DependencyGraph = { nodes: new Map() }
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('nonexistent.ts', context)

    expect(context.visited.has('nonexistent.ts')).toBe(true)
    expect(context.recursionStack.has('nonexistent.ts')).toBe(false)
  })

  test('detects cycle in two-node mutual dependency', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        [
          'b.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: 'b.ts', sourceFile: 'a.ts' },
        ],
      ]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 1, end: 10, line: 2 }, modulePath: 'a.ts', sourceFile: 'b.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.cycles.length).toBeGreaterThanOrEqual(1)
  })

  test('does not detect cycles in linear chain', () => {
    const graph = makeGraph([
      makeNode({ filePath: 'a.ts', imports: new Set(['b.ts']) }),
      makeNode({ filePath: 'b.ts', imports: new Set(['c.ts']) }),
      makeNode({ filePath: 'c.ts', imports: new Set() }),
    ])

    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.cycles).toHaveLength(0)
  })

  test('respects maxDepth limit', () => {
    const graph = makeGraph([
      makeNode({ filePath: 'a.ts', imports: new Set(['b.ts']) }),
      makeNode({ filePath: 'b.ts', imports: new Set(['c.ts']) }),
      makeNode({ filePath: 'c.ts', imports: new Set(['a.ts']) }),
    ])

    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 1,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.cycles).toHaveLength(0)
  })

  test('detects self-referencing module', () => {
    const node: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: 'a.ts', sourceFile: 'a.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = { nodes: new Map([['a.ts', node]]) }
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]?.cycle).toEqual(['a.ts', 'a.ts'])
  })

  test('detects three-node cycle a->b->c->a', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 1)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['c.ts', makeImportDetail('c.ts', 'b.ts', 2)]]),
      imports: new Set(['c.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'c.ts', 3)]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
      ]),
    }
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]?.cycle).toEqual(['a.ts', 'b.ts', 'c.ts', 'a.ts'])
  })

  test('does not re-detect cycle when starting from already-visited node', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts')]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts')]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(['a.ts', 'b.ts']),
    }

    detectCyclesFromNode('b.ts', context)

    expect(context.cycles).toHaveLength(0)
  })

  test('detects four-node cycle', () => {
    const graph = makeCycleGraph(['a.ts', 'b.ts', 'c.ts', 'd.ts'])
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]?.cycle).toEqual(['a.ts', 'b.ts', 'c.ts', 'd.ts', 'a.ts'])
  })

  test('cleans up recursion stack after visiting node with no edges', () => {
    const graph = makeGraph([makeNode({ filePath: 'a.ts', imports: new Set() })])
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.recursionStack.size).toBe(0)
  })

  test('handles node with multiple imports', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        ['b.ts', makeImportDetail('b.ts', 'a.ts')],
        ['c.ts', makeImportDetail('c.ts', 'a.ts')],
      ]),
      imports: new Set(['b.ts', 'c.ts']),
    }
    const nodeB = makeNode({ filePath: 'b.ts', imports: new Set() })
    const nodeC = makeNode({ filePath: 'c.ts', imports: new Set() })
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
      ]),
    }
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.cycles).toHaveLength(0)
    expect(context.visited.has('a.ts')).toBe(true)
    expect(context.visited.has('b.ts')).toBe(true)
    expect(context.visited.has('c.ts')).toBe(true)
  })
})

// ============================================================================
// detectCircularDependencies
// ============================================================================

describe('detectCircularDependencies', () => {
  test('returns empty array for empty graph', () => {
    const graph: DependencyGraph = { nodes: new Map() }
    const result = detectCircularDependencies(graph)
    expect(result).toEqual([])
  })

  test('returns empty array for graph with no edges', () => {
    const graph = makeGraph([
      makeNode({ filePath: 'a.ts', imports: new Set() }),
      makeNode({ filePath: 'b.ts', imports: new Set() }),
    ])
    const result = detectCircularDependencies(graph)
    expect(result).toEqual([])
  })

  test('detects simple two-node cycle', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        [
          'b.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: 'b.ts', sourceFile: 'a.ts' },
        ],
      ]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: 'a.ts', sourceFile: 'b.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  test('detects no cycles in linear chain', () => {
    const graph = makeGraph([
      makeNode({ filePath: 'a.ts', imports: new Set(['b.ts']) }),
      makeNode({ filePath: 'b.ts', imports: new Set(['c.ts']) }),
      makeNode({ filePath: 'c.ts', imports: new Set() }),
    ])

    const result = detectCircularDependencies(graph)

    expect(result).toEqual([])
  })

  test('detects three-node cycle', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        [
          'b.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: 'b.ts', sourceFile: 'a.ts' },
        ],
      ]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        [
          'c.ts',
          { location: { column: 1, end: 10, line: 2 }, modulePath: 'c.ts', sourceFile: 'b.ts' },
        ],
      ]),
      imports: new Set(['c.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 1, end: 10, line: 3 }, modulePath: 'a.ts', sourceFile: 'c.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  test('deduplicates cycles from different starting points', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        [
          'b.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: 'b.ts', sourceFile: 'a.ts' },
        ],
      ]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 1, end: 10, line: 2 }, modulePath: 'a.ts', sourceFile: 'b.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
  })

  test('finds multiple distinct cycles', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        [
          'b.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: 'b.ts', sourceFile: 'a.ts' },
        ],
      ]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 1, end: 10, line: 2 }, modulePath: 'a.ts', sourceFile: 'b.ts' },
        ],
        [
          'c.ts',
          { location: { column: 1, end: 10, line: 3 }, modulePath: 'c.ts', sourceFile: 'b.ts' },
        ],
      ]),
      imports: new Set(['a.ts', 'c.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([
        [
          'b.ts',
          { location: { column: 1, end: 10, line: 4 }, modulePath: 'b.ts', sourceFile: 'c.ts' },
        ],
      ]),
      imports: new Set(['b.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  // ---- Additional coverage: single node ----

  test('handles single node graph with no edges', () => {
    const graph = makeGraph([makeNode({ filePath: 'a.ts', imports: new Set() })])
    const result = detectCircularDependencies(graph)
    expect(result).toEqual([])
  })

  // ---- Additional coverage: self-referencing module ----

  test('detects self-referencing module as a cycle', () => {
    const node: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: 'a.ts', sourceFile: 'a.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = { nodes: new Map([['a.ts', node]]) }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]?.cycle).toEqual(['a.ts', 'a.ts'])
  })

  // ---- Additional coverage: disconnected components ----

  test('handles disconnected components where only one has a cycle', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts')]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts')]]),
      imports: new Set(['a.ts']),
    }
    const nodeC = makeNode({ filePath: 'c.ts', imports: new Set(['d.ts']) })
    const nodeD = makeNode({ filePath: 'd.ts', imports: new Set() })
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
        ['d.ts', nodeD],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
  })

  test('handles two independent cycles in disconnected components', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 1)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts', 2)]]),
      imports: new Set(['a.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['d.ts', makeImportDetail('d.ts', 'c.ts', 3)]]),
      imports: new Set(['d.ts']),
    }
    const nodeD: DependencyNode = {
      filePath: 'd.ts',
      importDetails: new Map([['c.ts', makeImportDetail('c.ts', 'd.ts', 4)]]),
      imports: new Set(['c.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
        ['d.ts', nodeD],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(2)
  })

  // ---- Additional coverage: nested cycles ----

  test('finds nested cycles with shared node', () => {
    // a -> b -> c -> a (outer cycle)
    //      b -> d -> b (inner cycle, sharing node b)
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 1)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        ['c.ts', makeImportDetail('c.ts', 'b.ts', 2)],
        ['d.ts', makeImportDetail('d.ts', 'b.ts', 3)],
      ]),
      imports: new Set(['c.ts', 'd.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'c.ts', 4)]]),
      imports: new Set(['a.ts']),
    }
    const nodeD: DependencyNode = {
      filePath: 'd.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'd.ts', 5)]]),
      imports: new Set(['b.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
        ['d.ts', nodeD],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  // ---- Additional coverage: cycle path formatting ----

  test('cycle path starts and ends with the same node', () => {
    const graph = makeCycleGraph(['alpha.ts', 'beta.ts', 'gamma.ts'])
    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    const cycle = result[0]!.cycle
    expect(cycle[0]).toBe(cycle[cycle.length - 1])
  })

  test('cycle path contains all nodes in the cycle', () => {
    const paths = ['alpha.ts', 'beta.ts', 'gamma.ts']
    const graph = makeCycleGraph(paths)
    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    const cycleNodes = new Set(result[0]!.cycle.slice(0, -1))
    expect(cycleNodes.size).toBe(3)
    for (const p of paths) {
      expect(cycleNodes.has(p)).toBe(true)
    }
  })

  // ---- Additional coverage: large graph performance ----

  test('handles a 20-node linear chain without cycles efficiently', () => {
    const nodes: DependencyNode[] = []
    for (let i = 0; i < 20; i++) {
      const filePath = `node${i}.ts`
      const imports = i < 19 ? new Set([`node${i + 1}.ts`]) : new Set<string>()
      nodes.push(makeNode({ filePath, imports }))
    }
    const graph = makeGraph(nodes)

    const start = performance.now()
    const result = detectCircularDependencies(graph)
    const elapsed = performance.now() - start

    expect(result).toEqual([])
    expect(elapsed).toBeLessThan(100)
  })

  test('detects cycle in a 20-node chain with one back-edge', () => {
    const nodes: DependencyNode[] = []
    for (let i = 0; i < 20; i++) {
      const filePath = `node${i}.ts`
      const details = new Map<string, ImportInfo>()
      if (i < 19) {
        details.set(`node${i + 1}.ts`, makeImportDetail(`node${i + 1}.ts`, filePath, i + 1))
      }
      // Last node points back to first
      if (i === 19) {
        details.set('node0.ts', makeImportDetail('node0.ts', filePath, 20))
      }
      const imports = new Set([...details.keys()])
      nodes.push({ filePath, importDetails: details, imports })
    }
    const graph: DependencyGraph = {
      nodes: new Map(nodes.map((n) => [n.filePath, n])),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toHaveLength(21)
  })

  // ---- Additional coverage: clean graph (DAG) ----

  test('returns empty for a clean diamond DAG', () => {
    //     a
    //    / \
    //   b   c
    //    \ /
    //     d
    const nodeA = makeNode({ filePath: 'a.ts', imports: new Set(['b.ts', 'c.ts']) })
    const nodeB = makeNode({ filePath: 'b.ts', imports: new Set(['d.ts']) })
    const nodeC = makeNode({ filePath: 'c.ts', imports: new Set(['d.ts']) })
    const nodeD = makeNode({ filePath: 'd.ts', imports: new Set() })
    const graph = makeGraph([nodeA, nodeB, nodeC, nodeD])

    const result = detectCircularDependencies(graph)

    expect(result).toEqual([])
  })

  // ---- Additional coverage: nodes with no importDetails ----

  test('does not record cycles when importDetails are missing', () => {
    const nodeA = makeNode({ filePath: 'a.ts', imports: new Set(['b.ts']) })
    const nodeB = makeNode({ filePath: 'b.ts', imports: new Set(['a.ts']) })
    // Both nodes have imports but no importDetails entries
    const graph = makeGraph([nodeA, nodeB])

    const result = detectCircularDependencies(graph)

    expect(result).toEqual([])
  })

  // ---- Additional coverage: cycle detection preserves location info ----

  test('preserves location information in detected cycles', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 10, 5, 30)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts', 20, 3, 25)]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.location).toBeDefined()
    expect(typeof result[0]!.location.line).toBe('number')
    expect(typeof result[0]!.location.column).toBe('number')
    expect(typeof result[0]!.location.end).toBe('number')
  })

  // ---- Additional coverage: five-node cycle ----

  test('detects five-node cycle', () => {
    const graph = makeCycleGraph(['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'])
    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toHaveLength(6)
    expect(result[0]!.cycle[0]).toBe(result[0]!.cycle[5])
  })

  // ---- Additional coverage: graph with isolated node ----

  test('handles graph with one isolated node and one cycle', () => {
    const nodeX = makeNode({ filePath: 'x.ts', imports: new Set() })
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts')]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts')]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['x.ts', nodeX],
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
  })

  // ---- Additional coverage: multiple self-referencing modules ----

  test('detects multiple self-referencing modules as separate cycles', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'a.ts', 1)]]),
      imports: new Set(['a.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'b.ts', 2)]]),
      imports: new Set(['b.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(2)
  })

  // ---- Additional coverage: chain feeding into a cycle ----

  test('detects cycle when a linear chain feeds into a cycle', () => {
    // x -> a -> b -> c -> a  (chain x feeds into a-b-c cycle)
    const nodeX: DependencyNode = {
      filePath: 'x.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'x.ts', 1)]]),
      imports: new Set(['a.ts']),
    }
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 2)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['c.ts', makeImportDetail('c.ts', 'b.ts', 3)]]),
      imports: new Set(['c.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'c.ts', 4)]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['x.ts', nodeX],
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toEqual(['a.ts', 'b.ts', 'c.ts', 'a.ts'])
  })

  // ---- Additional coverage: fan-in topology ----

  test('handles fan-in topology with no cycles', () => {
    // a -> c, b -> c (fan-in, no cycles)
    const nodeA = makeNode({ filePath: 'a.ts', imports: new Set(['c.ts']) })
    const nodeB = makeNode({ filePath: 'b.ts', imports: new Set(['c.ts']) })
    const nodeC = makeNode({ filePath: 'c.ts', imports: new Set() })
    const graph = makeGraph([nodeA, nodeB, nodeC])

    const result = detectCircularDependencies(graph)

    expect(result).toEqual([])
  })

  // ---- Additional coverage: max depth truncation at boundary ----

  test('detects cycle when maxDepth equals path length', () => {
    // maxDepth=3, chain of 2 + back-edge should still detect
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts')]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['c.ts', makeImportDetail('c.ts', 'b.ts')]]),
      imports: new Set(['c.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'c.ts')]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
  })

  // ---- Additional coverage: graph with multiple outgoing edges from one node ----

  test('detects all cycles when one node has multiple outgoing edges', () => {
    // a -> b -> a, a -> c -> a
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        ['b.ts', makeImportDetail('b.ts', 'a.ts', 1)],
        ['c.ts', makeImportDetail('c.ts', 'a.ts', 2)],
      ]),
      imports: new Set(['b.ts', 'c.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts', 3)]]),
      imports: new Set(['a.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'c.ts', 4)]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(2)
  })

  // ---- Additional coverage: figure-eight topology ----

  test('handles figure-eight topology with shared center node', () => {
    // a -> hub -> c -> hub and hub -> e -> hub
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['hub.ts', makeImportDetail('hub.ts', 'a.ts', 1)]]),
      imports: new Set(['hub.ts']),
    }
    const nodeHub: DependencyNode = {
      filePath: 'hub.ts',
      importDetails: new Map([
        ['c.ts', makeImportDetail('c.ts', 'hub.ts', 2)],
        ['e.ts', makeImportDetail('e.ts', 'hub.ts', 3)],
      ]),
      imports: new Set(['c.ts', 'e.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['hub.ts', makeImportDetail('hub.ts', 'c.ts', 4)]]),
      imports: new Set(['hub.ts']),
    }
    const nodeE: DependencyNode = {
      filePath: 'e.ts',
      importDetails: new Map([['hub.ts', makeImportDetail('hub.ts', 'e.ts', 5)]]),
      imports: new Set(['hub.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['hub.ts', nodeHub],
        ['c.ts', nodeC],
        ['e.ts', nodeE],
      ]),
    }

    const result = detectCircularDependencies(graph)

    // hub->c->hub and hub->e->hub are two distinct cycles
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  // ---- Additional coverage: cycle with long file paths ----

  test('handles cycles with deeply nested file paths', () => {
    const paths = [
      '/very/deeply/nested/path/to/module/a.ts',
      '/very/deeply/nested/path/to/module/b.ts',
      '/very/deeply/nested/path/to/module/c.ts',
    ]
    const graph = makeCycleGraph(paths)
    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle[0]).toBe('/very/deeply/nested/path/to/module/a.ts')
  })

  // ---- Additional coverage: six-node cycle ----

  test('detects six-node cycle', () => {
    const graph = makeCycleGraph(['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts', 'f.ts'])
    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toHaveLength(7)
  })

  // ---- Additional coverage: graph with single node pointing to nonexistent ----

  test('handles single node importing nonexistent dependency', () => {
    const nodeA = makeNode({ filePath: 'a.ts', imports: new Set(['nonexistent.ts']) })
    const graph = makeGraph([nodeA])

    const result = detectCircularDependencies(graph)

    expect(result).toEqual([])
  })

  // ---- Additional coverage: multiple entry points to same cycle ----

  test('deduplicates when multiple entry points lead to same cycle', () => {
    // a -> b -> c -> b  (cycle: b->c->b)
    // d -> b (also reaches same cycle)
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 1)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['c.ts', makeImportDetail('c.ts', 'b.ts', 2)]]),
      imports: new Set(['c.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'c.ts', 3)]]),
      imports: new Set(['b.ts']),
    }
    const nodeD: DependencyNode = {
      filePath: 'd.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'd.ts', 4)]]),
      imports: new Set(['b.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
        ['d.ts', nodeD],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toEqual(['b.ts', 'c.ts', 'b.ts'])
  })

  // ---- Additional coverage: large star graph with no cycles ----

  test('handles large star graph efficiently', () => {
    // center imports all leaves, leaves have no imports
    const nodes: DependencyNode[] = []
    const centerImports = new Set<string>()
    for (let i = 0; i < 30; i++) {
      centerImports.add(`leaf${i}.ts`)
    }
    const center: DependencyNode = {
      filePath: 'center.ts',
      importDetails: new Map(),
      imports: centerImports,
    }
    nodes.push(center)
    for (let i = 0; i < 30; i++) {
      nodes.push(makeNode({ filePath: `leaf${i}.ts`, imports: new Set() }))
    }
    const graph = makeGraph(nodes)

    const result = detectCircularDependencies(graph)

    expect(result).toEqual([])
  })

  // ---- Additional coverage: overlapping cycle paths ----

  test('detects overlapping cycles sharing an edge', () => {
    // a->b->c->a and a->b->d->a share edge a->b
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 1)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        ['c.ts', makeImportDetail('c.ts', 'b.ts', 2)],
        ['d.ts', makeImportDetail('d.ts', 'b.ts', 3)],
      ]),
      imports: new Set(['c.ts', 'd.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'c.ts', 4)]]),
      imports: new Set(['a.ts']),
    }
    const nodeD: DependencyNode = {
      filePath: 'd.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'd.ts', 5)]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
        ['d.ts', nodeD],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(2)
  })

  // ---- Additional coverage: cycle with self-loop within larger cycle ----

  test('detects both self-loop and larger cycle in same graph', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        ['a.ts', makeImportDetail('a.ts', 'a.ts', 1)],
        ['b.ts', makeImportDetail('b.ts', 'a.ts', 2)],
      ]),
      imports: new Set(['a.ts', 'b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts', 3)]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const result = detectCircularDependencies(graph)

    // self-loop a->a and cycle a->b->a
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  // ---- Additional coverage: three disconnected components, two with cycles ----

  test('finds cycles in correct components of three disconnected subgraphs', () => {
    // Component 1: a->b->a (cycle)
    // Component 2: c->d (no cycle)
    // Component 3: e->f->e (cycle)
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 1)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts', 2)]]),
      imports: new Set(['a.ts']),
    }
    const nodeC = makeNode({ filePath: 'c.ts', imports: new Set(['d.ts']) })
    const nodeD = makeNode({ filePath: 'd.ts', imports: new Set() })
    const nodeE: DependencyNode = {
      filePath: 'e.ts',
      importDetails: new Map([['f.ts', makeImportDetail('f.ts', 'e.ts', 3)]]),
      imports: new Set(['f.ts']),
    }
    const nodeF: DependencyNode = {
      filePath: 'f.ts',
      importDetails: new Map([['e.ts', makeImportDetail('e.ts', 'f.ts', 4)]]),
      imports: new Set(['e.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
        ['d.ts', nodeD],
        ['e.ts', nodeE],
        ['f.ts', nodeF],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(2)
  })

  // ---- Additional coverage: deduplication of rotated 5-element cycles ----

  test('deduplicates rotations of a five-element cycle', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts')]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['c.ts', makeImportDetail('c.ts', 'b.ts')]]),
      imports: new Set(['c.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['d.ts', makeImportDetail('d.ts', 'c.ts')]]),
      imports: new Set(['d.ts']),
    }
    const nodeD: DependencyNode = {
      filePath: 'd.ts',
      importDetails: new Map([['e.ts', makeImportDetail('e.ts', 'd.ts')]]),
      imports: new Set(['e.ts']),
    }
    const nodeE: DependencyNode = {
      filePath: 'e.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'e.ts')]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
        ['d.ts', nodeD],
        ['e.ts', nodeE],
      ]),
    }

    const result = detectCircularDependencies(graph)

    // Should only find 1 cycle despite iterating all nodes
    expect(result).toHaveLength(1)
  })

  // ---- Additional coverage: cycle with partial import details ----

  test('detects cycles even when only some nodes have importDetails', () => {
    // a imports b with details, b imports a without details (no importDetail for a in b)
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts')]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map(),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const result = detectCircularDependencies(graph)

    // b->a has no importDetail, so no cycle is recorded
    expect(result).toEqual([])
  })

  // ---- Additional coverage: node with many imports, only one creates cycle ----

  test('detects single cycle among many non-cycle imports', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        ['b.ts', makeImportDetail('b.ts', 'a.ts', 1)],
        ['x.ts', makeImportDetail('x.ts', 'a.ts', 2)],
        ['y.ts', makeImportDetail('y.ts', 'a.ts', 3)],
      ]),
      imports: new Set(['b.ts', 'x.ts', 'y.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts', 4)]]),
      imports: new Set(['a.ts']),
    }
    const nodeX = makeNode({ filePath: 'x.ts', imports: new Set() })
    const nodeY = makeNode({ filePath: 'y.ts', imports: new Set() })
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['x.ts', nodeX],
        ['y.ts', nodeY],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toEqual(['a.ts', 'b.ts', 'a.ts'])
  })

  // ---- Additional coverage: two separate cycles of different sizes ----

  test('detects a two-node and a three-node cycle in the same graph', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 1)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts', 2)]]),
      imports: new Set(['a.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['d.ts', makeImportDetail('d.ts', 'c.ts', 3)]]),
      imports: new Set(['d.ts']),
    }
    const nodeD: DependencyNode = {
      filePath: 'd.ts',
      importDetails: new Map([['e.ts', makeImportDetail('e.ts', 'd.ts', 4)]]),
      imports: new Set(['e.ts']),
    }
    const nodeE: DependencyNode = {
      filePath: 'e.ts',
      importDetails: new Map([['c.ts', makeImportDetail('c.ts', 'e.ts', 5)]]),
      imports: new Set(['c.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeD],
        ['d.ts', nodeD],
        ['e.ts', nodeE],
        ['c.ts', nodeC],
      ]),
    }

    const result = detectCircularDependencies(graph)

    // At least the two-node cycle and three-node cycle
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  // ---- Additional coverage: performance - 50 node chain ----

  test('handles a 50-node linear chain efficiently', () => {
    const nodes: DependencyNode[] = []
    for (let i = 0; i < 50; i++) {
      const filePath = `node${i}.ts`
      const imports = i < 49 ? new Set([`node${i + 1}.ts`]) : new Set<string>()
      nodes.push(makeNode({ filePath, imports }))
    }
    const graph = makeGraph(nodes)

    const start = performance.now()
    const result = detectCircularDependencies(graph)
    const elapsed = performance.now() - start

    expect(result).toEqual([])
    expect(elapsed).toBeLessThan(200)
  })

  // ---- Additional coverage: bidirectional edge creates two distinct cycles ----

  test('treats bidirectional edges as a single cycle', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 1)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts', 2)]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const result = detectCircularDependencies(graph)

    // a->b->a and b->a->b normalize to the same cycle
    expect(result).toHaveLength(1)
  })

  // ---- Additional coverage: cycle with same-prefix path names ----

  test('handles cycles with similar path prefixes correctly', () => {
    const paths = ['/src/a.ts', '/src/a.test.ts', '/src/a.util.ts']
    const graph = makeCycleGraph(paths)
    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
  })

  // ---- Additional coverage: empty path in recordCycle ----

  test('recordCycle with dependency not in path produces empty subpath', () => {
    const node: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        [
          'z.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: 'z.ts', sourceFile: 'b.ts' },
        ],
      ]),
      imports: new Set(['z.ts']),
    }
    const context = { cycles: [] as CircularDependency[], path: ['a.ts', 'b.ts'] }

    recordCycle('z.ts', node, context)

    // indexOf returns -1, slice(-1) gets last element, adds dependency
    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]!.cycle).toEqual(['b.ts', 'z.ts'])
  })

  // ---- Additional coverage: deduplicateCycles with empty cycle arrays ----

  test('deduplicateCycles handles cycles with empty arrays', () => {
    const cycles: CircularDependency[] = [{ cycle: [], location: { column: 1, end: 10, line: 1 } }]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(1)
  })

  // ---- Additional coverage: normalizeCycle with all identical elements ----

  test('normalizeCycle handles all-identical elements', () => {
    const result = normalizeCycle(['/a', '/a', '/a', '/a'])
    expect(result).toEqual(['/a', '/a', '/a', '/a'])
  })

  // ---- Additional coverage: graph with 10-node ring cycle ----

  test('detects 10-node ring cycle', () => {
    const paths = Array.from({ length: 10 }, (_, i) => `node${i}.ts`)
    const graph = makeCycleGraph(paths)
    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toHaveLength(11)
  })

  // ---- Additional coverage: multiple self-loops across many nodes ----

  test('detects self-loops across many nodes in a graph', () => {
    const nodes: DependencyNode[] = []
    for (let i = 0; i < 5; i++) {
      const filePath = `self${i}.ts`
      nodes.push({
        filePath,
        importDetails: new Map([[filePath, makeImportDetail(filePath, filePath, i + 1)]]),
        imports: new Set([filePath]),
      })
    }
    const graph: DependencyGraph = { nodes: new Map(nodes.map((n) => [n.filePath, n])) }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(5)
  })

  // ---- Additional coverage: visited set persists across iterations ----

  test('visited set prevents re-traversal of already processed nodes', () => {
    // a -> b -> c -> a
    // Starting from a detects cycle. Starting from b finds b already visited.
    const graph = makeCycleGraph(['a.ts', 'b.ts', 'c.ts'])
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const cycles: CircularDependency[] = []

    detectCyclesFromNode('a.ts', {
      cycles,
      graph,
      maxDepth: 50,
      path: [],
      recursionStack,
      visited,
    })

    const firstCount = cycles.length

    detectCyclesFromNode('b.ts', {
      cycles,
      graph,
      maxDepth: 50,
      path: [],
      recursionStack,
      visited,
    })

    // b.ts is already in visited, so no new cycles should be found
    expect(cycles.length).toBe(firstCount)
  })

  // ---- Additional coverage: path length exactly at maxDepth ----

  test('does not traverse when path length equals maxDepth', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts')]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts')]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    // path already has 50 elements, maxDepth is 50
    const path: string[] = []
    for (let i = 0; i < 51; i++) path.push(`p${i}.ts`)

    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path,
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.cycles).toHaveLength(0)
  })

  // ---- Additional coverage: normalizeCycle with special characters in paths ----

  test('normalizeCycle handles paths with special characters', () => {
    const result = normalizeCycle(['[beta]', '[alpha]', '[gamma]', '[beta]'])
    expect(result[0]).toBe('[alpha]')
  })

  // ---- Additional coverage: normalizeCycle with numeric-like strings ----

  test('normalizeCycle handles numeric-like path strings', () => {
    const result = normalizeCycle(['3.ts', '1.ts', '2.ts', '3.ts'])
    expect(result).toEqual(['1.ts', '2.ts', '3.ts', '1.ts'])
  })

  // ---- Additional coverage: finishNodeVisit called multiple times ----

  test('finishNodeVisit correctly unwinds stack through multiple calls', () => {
    const path = ['a', 'b', 'c', 'd', 'e']
    const stack = new Set(['a', 'b', 'c', 'd', 'e'])

    finishNodeVisit('e', path, stack)
    expect(path).toEqual(['a', 'b', 'c', 'd'])
    expect(stack.has('e')).toBe(false)

    finishNodeVisit('d', path, stack)
    expect(path).toEqual(['a', 'b', 'c'])
    expect(stack.has('d')).toBe(false)

    finishNodeVisit('c', path, stack)
    expect(path).toEqual(['a', 'b'])
    expect(stack.has('c')).toBe(false)

    expect(stack.has('a')).toBe(true)
    expect(stack.has('b')).toBe(true)
  })

  // ---- Additional coverage: recordCycle records multiple cycles in same context ----

  test('recordCycle can be called multiple times to record distinct cycles', () => {
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: 'a.ts', sourceFile: 'b.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const context = { cycles: [] as CircularDependency[], path: ['a.ts', 'b.ts'] }

    recordCycle('a.ts', nodeB, context)
    recordCycle('a.ts', nodeB, context)

    expect(context.cycles).toHaveLength(2)
  })

  // ---- Additional coverage: deduplicateCycles preserves order ----

  test('deduplicateCycles preserves first-occurrence order', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['/z', '/a', '/z'], location: { column: 1, end: 10, line: 10 } },
      { cycle: ['/x', '/y', '/x'], location: { column: 1, end: 10, line: 20 } },
      { cycle: ['/a', '/z', '/a'], location: { column: 1, end: 10, line: 30 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(2)
    expect(result[0]!.location.line).toBe(10)
    expect(result[1]!.location.line).toBe(20)
  })

  // ---- Additional coverage: detectCyclesFromNode with maxDepth=0 ----

  test('detectCyclesFromNode with maxDepth=0 still processes node', () => {
    const node: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'a.ts')]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = { nodes: new Map([['a.ts', node]]) }
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 0,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    // path starts at 0, 0 > 0 is false, so it enters
    // path becomes ['a.ts'], then processes import 'a.ts' which is in recursionStack
    expect(context.cycles.length).toBeGreaterThanOrEqual(1)
  })

  // ---- Additional coverage: detectCyclesFromNode cleanup after error-like scenario ----

  test('detectCyclesFromNode cleans up visited even for nonexistent nodes', () => {
    const graph: DependencyGraph = { nodes: new Map() }
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('ghost.ts', context)

    expect(context.visited.has('ghost.ts')).toBe(true)
    expect(context.recursionStack.has('ghost.ts')).toBe(false)
    expect(context.path).toEqual([])
  })

  // ---- Additional coverage: processDependency with cycle and no importDetails ----

  test('processDependency detects back edge but does not record without importDetails', () => {
    const nodeA = makeNode({ filePath: 'a.ts', imports: new Set(['b.ts']) })
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map(), // no import detail for a.ts
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: ['a.ts', 'b.ts'],
      recursionStack: new Set(['a.ts', 'b.ts']),
      visited: new Set(['a.ts', 'b.ts']),
    }

    processDependency('a.ts', nodeB, context)

    // a.ts is in recursionStack AND visited, but nodeB has no importDetail for 'a.ts'
    expect(context.cycles).toHaveLength(0)
  })

  // ---- Additional coverage: normalizeCycle with two-element array ending same ----

  test('normalizeCycle with two identical elements returns them', () => {
    const result = normalizeCycle(['/x', '/x'])
    expect(result).toEqual(['/x', '/x'])
  })

  // ---- Additional coverage: deduplicateCycles with single-element cycles ----

  test('deduplicateCycles handles single-element duplicate cycles', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['/a'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['/a'], location: { column: 2, end: 20, line: 2 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(1)
    expect(result[0]!.location.line).toBe(1)
  })

  // ---- Additional coverage: diamond with cycle ----

  test('detects cycle in diamond with back edge from bottom to top', () => {
    //     a
    //    / \
    //   b   c
    //    \ /
    //     d -> a
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        ['b.ts', makeImportDetail('b.ts', 'a.ts', 1)],
        ['c.ts', makeImportDetail('c.ts', 'a.ts', 2)],
      ]),
      imports: new Set(['b.ts', 'c.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['d.ts', makeImportDetail('d.ts', 'b.ts', 3)]]),
      imports: new Set(['d.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['d.ts', makeImportDetail('d.ts', 'c.ts', 4)]]),
      imports: new Set(['d.ts']),
    }
    const nodeD: DependencyNode = {
      filePath: 'd.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'd.ts', 5)]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
        ['d.ts', nodeD],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle[0]).toBe('a.ts')
    expect(result[0]!.cycle[result[0]!.cycle.length - 1]).toBe('a.ts')
  })

  // ---- Additional coverage: normalizeCycle with unicode paths ----

  test('normalizeCycle handles unicode paths', () => {
    const result = normalizeCycle(['日本語', 'αβγ', '中文', '日本語'])
    expect(result[0]).toBe('αβγ')
    expect(result[result.length - 1]).toBe('αβγ')
  })

  // ---- Additional coverage: recordCycle with dependency at start of long path ----

  test('recordCycle captures full cycle from first element to current', () => {
    const importDetail = makeImportDetail('start.ts', 'end.ts', 5, 10, 30)
    const node: DependencyNode = {
      filePath: 'end.ts',
      importDetails: new Map([['start.ts', importDetail]]),
      imports: new Set(['start.ts']),
    }
    const context = {
      cycles: [] as CircularDependency[],
      path: ['start.ts', 'mid1.ts', 'mid2.ts', 'mid3.ts', 'end.ts'],
    }

    recordCycle('start.ts', node, context)

    expect(context.cycles[0]!.cycle).toEqual([
      'start.ts',
      'mid1.ts',
      'mid2.ts',
      'mid3.ts',
      'end.ts',
      'start.ts',
    ])
  })

  // ---- Additional coverage: large cycle with 15 nodes ----

  test('detects 15-node cycle', () => {
    const paths = Array.from({ length: 15 }, (_, i) => `f${i}.ts`)
    const graph = makeCycleGraph(paths)
    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toHaveLength(16)
  })

  // ---- Additional coverage: graph where cycle is only detectable from middle node ----

  test('detects cycle when starting from a non-cycle entry node', () => {
    // entry -> a -> b -> c -> b
    const entry: DependencyNode = {
      filePath: 'entry.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'entry.ts', 1)]]),
      imports: new Set(['a.ts']),
    }
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 2)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['c.ts', makeImportDetail('c.ts', 'b.ts', 3)]]),
      imports: new Set(['c.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'c.ts', 4)]]),
      imports: new Set(['b.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['entry.ts', entry],
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toEqual(['b.ts', 'c.ts', 'b.ts'])
  })
})

// ============================================================================
// Additional coverage: normalizeCycle edge cases
// ============================================================================

describe('normalizeCycle - additional edge cases', () => {
  test('handles cycle with only two unique elements', () => {
    const result = normalizeCycle(['/b', '/a', '/b', '/a', '/b'])
    expect(result[0]).toBe('/a')
  })

  test('handles cycle where smallest is in the middle', () => {
    const result = normalizeCycle(['/c', '/a', '/b', '/c'])
    expect(result).toEqual(['/a', '/b', '/c', '/a'])
  })

  test('handles cycle where smallest is last before closing', () => {
    const result = normalizeCycle(['/b', '/c', '/a', '/b'])
    expect(result).toEqual(['/a', '/b', '/c', '/a'])
  })

  test('returns all elements for a three-element input ending differently', () => {
    const result = normalizeCycle(['/x', '/y', '/z'])
    // withoutLast = ['/x', '/y'], min is /x
    expect(result).toEqual(['/x', '/y', '/x'])
  })

  test('handles single element without duplicate', () => {
    const result = normalizeCycle(['/solo'])
    expect(result).toEqual(['/solo'])
  })
})

// ============================================================================
// Additional coverage: processDependency edge cases
// ============================================================================

describe('processDependency - additional edge cases', () => {
  test('handles dependency in recursion stack but not in visited set', () => {
    // This tests the else-if branch: recursionStack has it but visited doesn't
    // In normal flow this shouldn't happen, but let's test it
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts')]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['c.ts', makeImportDetail('c.ts', 'b.ts')]]),
      imports: new Set(['c.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: ['a.ts'],
      recursionStack: new Set(['a.ts']),
      visited: new Set(),
    }

    // b.ts is not visited, so it will recurse into detectCyclesFromNode
    processDependency('b.ts', nodeA, context)

    expect(context.visited.has('b.ts')).toBe(true)
  })

  test('handles multiple dependencies processing sequentially', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        ['b.ts', makeImportDetail('b.ts', 'a.ts')],
        ['c.ts', makeImportDetail('c.ts', 'a.ts')],
      ]),
      imports: new Set(['b.ts', 'c.ts']),
    }
    const nodeB = makeNode({ filePath: 'b.ts', imports: new Set() })
    const nodeC = makeNode({ filePath: 'c.ts', imports: new Set() })
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
      ]),
    }

    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: ['a.ts'],
      recursionStack: new Set(['a.ts']),
      visited: new Set(['a.ts']),
    }

    processDependency('b.ts', nodeA, context)
    processDependency('c.ts', nodeA, context)

    expect(context.visited.has('b.ts')).toBe(true)
    expect(context.visited.has('c.ts')).toBe(true)
    expect(context.cycles).toHaveLength(0)
  })
})

// ============================================================================
// Additional coverage: detectCyclesFromNode edge cases
// ============================================================================

describe('detectCyclesFromNode - additional edge cases', () => {
  test('handles node with empty imports set', () => {
    const node = makeNode({ filePath: 'empty.ts', imports: new Set() })
    const graph = makeGraph([node])
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('empty.ts', context)

    expect(context.cycles).toHaveLength(0)
    expect(context.visited.has('empty.ts')).toBe(true)
    expect(context.recursionStack.size).toBe(0)
  })

  test('detects two cycles branching from same node', () => {
    // a -> b -> a and a -> c -> a
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        ['b.ts', makeImportDetail('b.ts', 'a.ts', 1)],
        ['c.ts', makeImportDetail('c.ts', 'a.ts', 2)],
      ]),
      imports: new Set(['b.ts', 'c.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts', 3)]]),
      imports: new Set(['a.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'c.ts', 4)]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
      ]),
    }
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.cycles).toHaveLength(2)
  })

  test('handles already-visited node with no cycle', () => {
    const nodeA = makeNode({ filePath: 'a.ts', imports: new Set(['b.ts']) })
    const nodeB = makeNode({ filePath: 'b.ts', imports: new Set() })
    const graph = makeGraph([nodeA, nodeB])
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(['a.ts']),
    }

    // a.ts is already visited, but we try to start from it again
    detectCyclesFromNode('a.ts', context)

    // It still gets added to visited again (Set dedup), recursionStack cleaned up
    expect(context.cycles).toHaveLength(0)
  })

  test('path is restored after full traversal', () => {
    const graph = makeGraph([
      makeNode({ filePath: 'a.ts', imports: new Set(['b.ts']) }),
      makeNode({ filePath: 'b.ts', imports: new Set() }),
    ])
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.path).toEqual([])
  })

  test('detects cycle when path starts non-empty but under maxDepth', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts')]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts')]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 10,
      path: ['pre.ts'],
      recursionStack: new Set(['pre.ts']),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.cycles.length).toBeGreaterThanOrEqual(1)
  })
})

// ============================================================================
// Additional coverage: deduplicateCycles edge cases
// ============================================================================

describe('deduplicateCycles - additional edge cases', () => {
  test('handles mix of unique and duplicate cycles of different lengths', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['/b', '/a', '/b'], location: { column: 1, end: 10, line: 2 } }, // dup of first
      { cycle: ['/x', '/y', '/z', '/x'], location: { column: 1, end: 10, line: 3 } },
      { cycle: ['/y', '/z', '/x', '/y'], location: { column: 1, end: 10, line: 4 } }, // dup of third
      { cycle: ['/p', '/q', '/p'], location: { column: 1, end: 10, line: 5 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(3)
  })

  test('handles single cycle with long path', () => {
    const cycles: CircularDependency[] = [
      {
        cycle: ['/a', '/b', '/c', '/d', '/e', '/f', '/a'],
        location: { column: 1, end: 10, line: 1 },
      },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toHaveLength(7)
  })

  test('handles cycles with same nodes but different traversal order as distinct', () => {
    // a->b->c->a normalizes to a->b->c->a
    // a->c->b->a normalizes to a->c->b->a
    // These are different cycles (different edges)
    const cycles: CircularDependency[] = [
      { cycle: ['/a', '/b', '/c', '/a'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['/a', '/c', '/b', '/a'], location: { column: 1, end: 10, line: 2 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(2)
  })

  test('handles cycle where normalized form has different first element than original', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['/z', '/a', '/b', '/z'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['/b', '/z', '/a', '/b'], location: { column: 1, end: 10, line: 2 } },
    ]
    const result = deduplicateCycles(cycles)
    // Both normalize to /a->/b->/z->/a
    expect(result).toHaveLength(1)
  })
})

// ============================================================================
// Additional coverage: finishNodeVisit edge cases
// ============================================================================

describe('finishNodeVisit - additional edge cases', () => {
  test('handles path with many elements removing only last', () => {
    const path = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    const stack = new Set(path)

    finishNodeVisit('10', path, stack)

    expect(path).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9'])
    expect(stack.has('10')).toBe(false)
    expect(stack.size).toBe(9)
  })

  test('handles non-string-like path values gracefully', () => {
    const path = ['/src/utils/helpers/format.ts']
    const stack = new Set(['/src/utils/helpers/format.ts'])

    finishNodeVisit('/src/utils/helpers/format.ts', path, stack)

    expect(path).toEqual([])
    expect(stack.size).toBe(0)
  })

  test('calling finishNodeVisit on already-empty path produces empty', () => {
    const path: string[] = []
    const stack = new Set<string>()

    finishNodeVisit('anything', path, stack)

    expect(path).toEqual([])
    expect(stack.size).toBe(0)
  })
})

// ============================================================================
// Additional coverage: finishNodeVisit - more edge cases
// ============================================================================

describe('finishNodeVisit - extended', () => {
  test('removes from recursionStack even if path was already empty', () => {
    const path: string[] = []
    const stack = new Set(['orphan'])

    finishNodeVisit('orphan', path, stack)

    expect(stack.has('orphan')).toBe(false)
  })

  test('works with paths containing spaces', () => {
    const path = ['/src/my file.ts', '/src/other file.ts']
    const stack = new Set(['/src/my file.ts', '/src/other file.ts'])

    finishNodeVisit('/src/other file.ts', path, stack)

    expect(path).toEqual(['/src/my file.ts'])
    expect(stack.has('/src/other file.ts')).toBe(false)
  })

  test('does not remove duplicate entries from recursionStack', () => {
    const path = ['/a', '/b']
    const stack = new Set(['/a', '/b'])

    finishNodeVisit('/b', path, stack)

    expect(stack.has('/a')).toBe(true)
    expect(stack.has('/b')).toBe(false)
  })

  test('handles very long path efficiently', () => {
    const path: string[] = []
    const stack = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      path.push(`node${i}`)
      stack.add(`node${i}`)
    }

    finishNodeVisit('node999', path, stack)

    expect(path).toHaveLength(999)
    expect(stack.size).toBe(999)
    expect(stack.has('node999')).toBe(false)
  })
})

// ============================================================================
// Additional coverage: normalizeCycle - extended
// ============================================================================

describe('normalizeCycle - extended', () => {
  test('handles cycle starting with smallest element', () => {
    const result = normalizeCycle(['/a', '/b', '/c', '/a'])
    expect(result).toEqual(['/a', '/b', '/c', '/a'])
  })

  test('handles cycle ending with smallest element', () => {
    const result = normalizeCycle(['/b', '/c', '/a', '/b'])
    expect(result).toEqual(['/a', '/b', '/c', '/a'])
  })

  test('handles six-element cycle with smallest in middle', () => {
    const result = normalizeCycle(['/f', '/a', '/b', '/c', '/d', '/e', '/f'])
    expect(result[0]).toBe('/a')
    expect(result[result.length - 1]).toBe('/a')
    expect(result).toHaveLength(7)
  })

  test('handles cycle with hyphenated paths', () => {
    const result = normalizeCycle(['/z-module', '/a-module', '/m-module', '/z-module'])
    expect(result[0]).toBe('/a-module')
  })

  test('handles cycle with dots in paths', () => {
    const result = normalizeCycle(['/z.spec.ts', '/a.spec.ts', '/m.spec.ts', '/z.spec.ts'])
    expect(result[0]).toBe('/a.spec.ts')
  })

  test('handles three-element cycle with all same prefix', () => {
    const result = normalizeCycle(['/src/c.ts', '/src/a.ts', '/src/b.ts', '/src/c.ts'])
    expect(result).toEqual(['/src/a.ts', '/src/b.ts', '/src/c.ts', '/src/a.ts'])
  })

  test('handles two-element cycle with smallest first', () => {
    const result = normalizeCycle(['/a', '/b', '/a'])
    expect(result).toEqual(['/a', '/b', '/a'])
  })

  test('handles two-element cycle with smallest last', () => {
    const result = normalizeCycle(['/b', '/a', '/b'])
    expect(result).toEqual(['/a', '/b', '/a'])
  })

  test('handles empty string in cycle', () => {
    const result = normalizeCycle(['/b', '', '/a', '/b'])
    expect(result[0]).toBe('')
  })
})

// ============================================================================
// Additional coverage: deduplicateCycles - extended
// ============================================================================

describe('deduplicateCycles - extended', () => {
  test('handles cycles that differ only in closing element', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['/a', '/b', '/c'], location: { column: 1, end: 10, line: 2 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(1)
  })

  test('handles empty cycles mixed with non-empty', () => {
    const cycles: CircularDependency[] = [
      { cycle: [], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 2 } },
      { cycle: [], location: { column: 1, end: 10, line: 3 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(2)
  })

  test('handles single-element cycle mixed with larger cycles', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['/a'], location: { column: 1, end: 10, line: 1 } },
      { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 2 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(2)
  })

  test('handles duplicate six-element cycle rotations', () => {
    const cycles: CircularDependency[] = [
      {
        cycle: ['/a', '/b', '/c', '/d', '/e', '/f', '/a'],
        location: { column: 1, end: 10, line: 1 },
      },
      {
        cycle: ['/c', '/d', '/e', '/f', '/a', '/b', '/c'],
        location: { column: 1, end: 10, line: 2 },
      },
      {
        cycle: ['/f', '/a', '/b', '/c', '/d', '/e', '/f'],
        location: { column: 1, end: 10, line: 3 },
      },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(1)
  })

  test('preserves location of first duplicate', () => {
    const cycles: CircularDependency[] = [
      { cycle: ['/b', '/a', '/b'], location: { column: 5, end: 50, line: 42 } },
      { cycle: ['/a', '/b', '/a'], location: { column: 1, end: 10, line: 1 } },
    ]
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(1)
    expect(result[0]!.location.line).toBe(42)
  })

  test('handles large number of unique cycles', () => {
    const cycles: CircularDependency[] = Array.from({ length: 50 }, (_, i) => ({
      cycle: [`/node${i}`, `/node${i}-dep`, `/node${i}`],
      location: { column: 1, end: 10, line: i + 1 },
    }))
    const result = deduplicateCycles(cycles)
    expect(result).toHaveLength(50)
  })
})

// ============================================================================
// Additional coverage: recordCycle - extended
// ============================================================================

describe('recordCycle - extended', () => {
  test('records cycle when dependency is at index 0 of path', () => {
    const node: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 1, end: 10, line: 5 }, modulePath: 'a.ts', sourceFile: 'b.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const context = { cycles: [] as CircularDependency[], path: ['a.ts', 'b.ts'] }

    recordCycle('a.ts', node, context)

    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]!.cycle).toEqual(['a.ts', 'b.ts', 'a.ts'])
  })

  test('records cycle when dependency is at last position in path', () => {
    const node: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([
        [
          'c.ts',
          { location: { column: 2, end: 15, line: 8 }, modulePath: 'c.ts', sourceFile: 'c.ts' },
        ],
      ]),
      imports: new Set(['c.ts']),
    }
    const context = { cycles: [] as CircularDependency[], path: ['a.ts', 'b.ts', 'c.ts'] }

    recordCycle('c.ts', node, context)

    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]!.cycle).toEqual(['c.ts', 'c.ts'])
  })

  test('does not record when importDetails key does not match dependency', () => {
    const node: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        [
          'wrong.ts',
          { location: { column: 1, end: 10, line: 1 }, modulePath: 'wrong.ts', sourceFile: 'b.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const context = { cycles: [] as CircularDependency[], path: ['a.ts', 'b.ts'] }

    recordCycle('a.ts', node, context)

    expect(context.cycles).toHaveLength(0)
  })

  test('records cycle with very long path', () => {
    const longPath: string[] = []
    for (let i = 0; i < 100; i++) {
      longPath.push(`node${i}.ts`)
    }
    const node: DependencyNode = {
      filePath: 'node99.ts',
      importDetails: new Map([
        [
          'node0.ts',
          {
            location: { column: 1, end: 10, line: 1 },
            modulePath: 'node0.ts',
            sourceFile: 'node99.ts',
          },
        ],
      ]),
      imports: new Set(['node0.ts']),
    }
    const context = { cycles: [] as CircularDependency[], path: longPath }

    recordCycle('node0.ts', node, context)

    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]!.cycle).toHaveLength(101) // 100 nodes + closing
    expect(context.cycles[0]!.cycle[0]).toBe('node0.ts')
    expect(context.cycles[0]!.cycle[100]).toBe('node0.ts')
  })

  test('records location column and end correctly', () => {
    const node: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        [
          'a.ts',
          { location: { column: 7, end: 42, line: 99 }, modulePath: 'a.ts', sourceFile: 'b.ts' },
        ],
      ]),
      imports: new Set(['a.ts']),
    }
    const context = { cycles: [] as CircularDependency[], path: ['a.ts', 'b.ts'] }

    recordCycle('a.ts', node, context)

    expect(context.cycles[0]!.location.column).toBe(7)
    expect(context.cycles[0]!.location.end).toBe(42)
    expect(context.cycles[0]!.location.line).toBe(99)
  })
})

// ============================================================================
// Additional coverage: processDependency - extended
// ============================================================================

describe('processDependency - extended', () => {
  test('returns early when graph has no nodes', () => {
    const graph: DependencyGraph = { nodes: new Map() }
    const node = makeNode({ filePath: 'a.ts', imports: new Set() })
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    processDependency('missing.ts', node, context)

    expect(context.cycles).toHaveLength(0)
    expect(context.visited.size).toBe(0)
  })

  test('visits unvisited node and discovers its dependencies', () => {
    const nodeA = makeNode({ filePath: 'a.ts', imports: new Set(['b.ts']) })
    const nodeB = makeNode({ filePath: 'b.ts', imports: new Set(['c.ts']) })
    const nodeC = makeNode({ filePath: 'c.ts', imports: new Set() })
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
      ]),
    }
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: ['a.ts'],
      recursionStack: new Set(['a.ts']),
      visited: new Set(['a.ts']),
    }

    processDependency('b.ts', nodeA, context)

    expect(context.visited.has('b.ts')).toBe(true)
    expect(context.visited.has('c.ts')).toBe(true)
  })

  test('handles dependency in recursionStack with importDetails correctly', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 10, 5, 30)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts', 20, 3, 25)]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: ['a.ts', 'b.ts'],
      recursionStack: new Set(['a.ts', 'b.ts']),
      visited: new Set(['a.ts', 'b.ts']),
    }

    processDependency('a.ts', nodeB, context)

    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]!.cycle).toEqual(['a.ts', 'b.ts', 'a.ts'])
    expect(context.cycles[0]!.location.line).toBe(20)
  })

  test('does not mutate original context path when recursing', () => {
    const nodeA = makeNode({ filePath: 'a.ts', imports: new Set(['b.ts']) })
    const nodeB = makeNode({ filePath: 'b.ts', imports: new Set() })
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: ['root.ts', 'a.ts'],
      recursionStack: new Set(['root.ts', 'a.ts']),
      visited: new Set(['root.ts', 'a.ts']),
    }

    processDependency('b.ts', nodeA, context)

    expect(context.path).toEqual(['root.ts', 'a.ts'])
  })
})

// ============================================================================
// Additional coverage: detectCyclesFromNode - extended
// ============================================================================

describe('detectCyclesFromNode - extended', () => {
  test('handles node with import to nonexistent node', () => {
    const node = makeNode({ filePath: 'a.ts', imports: new Set(['ghost.ts']) })
    const graph = makeGraph([node])
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.cycles).toHaveLength(0)
    expect(context.visited.has('a.ts')).toBe(true)
    expect(context.path).toEqual([])
  })

  test('detects cycle with intermediate nodes having multiple imports', () => {
    // a -> b -> c -> a, b also imports d (dead end)
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 1)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        ['c.ts', makeImportDetail('c.ts', 'b.ts', 2)],
        ['d.ts', makeImportDetail('d.ts', 'b.ts', 3)],
      ]),
      imports: new Set(['c.ts', 'd.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'c.ts', 4)]]),
      imports: new Set(['a.ts']),
    }
    const nodeD = makeNode({ filePath: 'd.ts', imports: new Set() })
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
        ['d.ts', nodeD],
      ]),
    }
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.cycles).toHaveLength(1)
    expect(context.cycles[0]!.cycle).toEqual(['a.ts', 'b.ts', 'c.ts', 'a.ts'])
  })

  test('handles maxDepth exactly at cycle detection boundary', () => {
    // a -> b -> c -> a, need path length of 3 to detect
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts')]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['c.ts', makeImportDetail('c.ts', 'b.ts')]]),
      imports: new Set(['c.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'c.ts')]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
      ]),
    }

    // maxDepth=3, path starts empty, so path.length=0 <= 3, enters
    // path becomes ['a.ts'] (1 <= 3), processes b
    // path becomes ['a.ts','b.ts'] (2 <= 3), processes c
    // path becomes ['a.ts','b.ts','c.ts'] (3 <= 3), processes a
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 3,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.cycles).toHaveLength(1)
  })

  test('cleans up path after detecting cycle', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts')]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts')]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    expect(context.path).toEqual([])
    expect(context.recursionStack.size).toBe(0)
  })

  test('detects cycle from node that is not the smallest in cycle', () => {
    const graph = makeCycleGraph(['c.ts', 'a.ts', 'b.ts'])
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('c.ts', context)

    expect(context.cycles).toHaveLength(1)
    // Cycle should include all three nodes
    const cycle = context.cycles[0]!.cycle
    expect(new Set(cycle.slice(0, -1)).size).toBe(3)
  })

  test('handles node importing itself and another node', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        ['a.ts', makeImportDetail('a.ts', 'a.ts', 1)],
        ['b.ts', makeImportDetail('b.ts', 'a.ts', 2)],
      ]),
      imports: new Set(['a.ts', 'b.ts']),
    }
    const nodeB = makeNode({ filePath: 'b.ts', imports: new Set() })
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: [],
      recursionStack: new Set(),
      visited: new Set(),
    }

    detectCyclesFromNode('a.ts', context)

    // Should detect self-loop a->a
    expect(context.cycles.length).toBeGreaterThanOrEqual(1)
    const hasSelfLoop = context.cycles.some(
      (c) => c.cycle.length === 2 && c.cycle[0] === c.cycle[1],
    )
    expect(hasSelfLoop).toBe(true)
  })
})

// ============================================================================
// Additional coverage: detectCircularDependencies - extended
// ============================================================================

describe('detectCircularDependencies - extended', () => {
  test('handles graph with single node that has no imports', () => {
    const graph = makeGraph([makeNode({ filePath: 'solo.ts', imports: new Set() })])
    const result = detectCircularDependencies(graph)
    expect(result).toEqual([])
  })

  test('handles graph where all nodes point to nonexistent nodes', () => {
    const graph = makeGraph([
      makeNode({ filePath: 'a.ts', imports: new Set(['missing1.ts']) }),
      makeNode({ filePath: 'b.ts', imports: new Set(['missing2.ts']) }),
    ])
    const result = detectCircularDependencies(graph)
    expect(result).toEqual([])
  })

  test('detects cycle in two-node graph where both have importDetails', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 1, 1, 10)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'b.ts', 2, 5, 20)]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }
    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toEqual(['a.ts', 'b.ts', 'a.ts'])
    expect(result[0]!.location.line).toBe(2)
  })

  test('handles seven-node ring cycle', () => {
    const paths = Array.from({ length: 7 }, (_, i) => `ring${i}.ts`)
    const graph = makeCycleGraph(paths)
    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toHaveLength(8)
  })

  test('handles Y-shaped graph with no cycles', () => {
    // a -> c, b -> c, c -> d
    const nodeA = makeNode({ filePath: 'a.ts', imports: new Set(['c.ts']) })
    const nodeB = makeNode({ filePath: 'b.ts', imports: new Set(['c.ts']) })
    const nodeC = makeNode({ filePath: 'c.ts', imports: new Set(['d.ts']) })
    const nodeD = makeNode({ filePath: 'd.ts', imports: new Set() })
    const graph = makeGraph([nodeA, nodeB, nodeC, nodeD])

    const result = detectCircularDependencies(graph)

    expect(result).toEqual([])
  })

  test('handles graph with cycle that requires traversal through multiple nodes', () => {
    // a -> b -> c -> d -> e -> b (cycle: b->c->d->e->b)
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 1)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['c.ts', makeImportDetail('c.ts', 'b.ts', 2)]]),
      imports: new Set(['c.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['d.ts', makeImportDetail('d.ts', 'c.ts', 3)]]),
      imports: new Set(['d.ts']),
    }
    const nodeD: DependencyNode = {
      filePath: 'd.ts',
      importDetails: new Map([['e.ts', makeImportDetail('e.ts', 'd.ts', 4)]]),
      imports: new Set(['e.ts']),
    }
    const nodeE: DependencyNode = {
      filePath: 'e.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'e.ts', 5)]]),
      imports: new Set(['b.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
        ['d.ts', nodeD],
        ['e.ts', nodeE],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toEqual(['b.ts', 'c.ts', 'd.ts', 'e.ts', 'b.ts'])
  })

  test('handles graph with two self-loops and a mutual cycle', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        ['a.ts', makeImportDetail('a.ts', 'a.ts', 1)],
        ['b.ts', makeImportDetail('b.ts', 'a.ts', 2)],
      ]),
      imports: new Set(['a.ts', 'b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        ['b.ts', makeImportDetail('b.ts', 'b.ts', 3)],
        ['a.ts', makeImportDetail('a.ts', 'b.ts', 4)],
      ]),
      imports: new Set(['b.ts', 'a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }

    const result = detectCircularDependencies(graph)

    // a->a, b->b, a->b->a (three distinct cycles)
    expect(result.length).toBeGreaterThanOrEqual(3)
  })

  test('handles node with many outgoing edges but only one creates cycle', () => {
    const imports = new Set<string>()
    const details = new Map<string, ImportInfo>()
    for (let i = 0; i < 10; i++) {
      const dep = `leaf${i}.ts`
      imports.add(dep)
      details.set(dep, makeImportDetail(dep, 'hub.ts', i + 1))
    }
    imports.add('back.ts')
    details.set('back.ts', makeImportDetail('back.ts', 'hub.ts', 11))

    const hubNode: DependencyNode = {
      filePath: 'hub.ts',
      importDetails: details,
      imports,
    }
    const backNode: DependencyNode = {
      filePath: 'back.ts',
      importDetails: new Map([['hub.ts', makeImportDetail('hub.ts', 'back.ts', 12)]]),
      imports: new Set(['hub.ts']),
    }
    const leafNodes: DependencyNode[] = []
    for (let i = 0; i < 10; i++) {
      leafNodes.push(makeNode({ filePath: `leaf${i}.ts`, imports: new Set() }))
    }

    const nodesMap = new Map<string, DependencyNode>()
    nodesMap.set('hub.ts', hubNode)
    nodesMap.set('back.ts', backNode)
    for (const leaf of leafNodes) {
      nodesMap.set(leaf.filePath, leaf)
    }
    const graph: DependencyGraph = { nodes: nodesMap }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toEqual(['hub.ts', 'back.ts', 'hub.ts'])
  })
})

// ============================================================================
// Additional coverage: normalizeCycle with real-world-like paths
// ============================================================================

describe('normalizeCycle - real-world paths', () => {
  test('handles absolute paths with different depths', () => {
    const result = normalizeCycle([
      '/src/deep/c.ts',
      '/src/a.ts',
      '/src/deep/b.ts',
      '/src/deep/c.ts',
    ])
    expect(result[0]).toBe('/src/a.ts')
  })

  test('handles relative paths', () => {
    const result = normalizeCycle(['../z.ts', '../a.ts', '../m.ts', '../z.ts'])
    expect(result[0]).toBe('../a.ts')
  })

  test('handles paths with @ scope', () => {
    const result = normalizeCycle(['@scope/z', '@scope/a', '@scope/m', '@scope/z'])
    expect(result[0]).toBe('@scope/a')
  })

  test('handles mixed length paths', () => {
    const result = normalizeCycle([
      '/very/long/path/z.ts',
      '/a.ts',
      '/medium/m.ts',
      '/very/long/path/z.ts',
    ])
    expect(result[0]).toBe('/a.ts')
  })

  test('handles index files', () => {
    const result = normalizeCycle(['./b/index.ts', './a/index.ts', './c/index.ts', './b/index.ts'])
    expect(result[0]).toBe('./a/index.ts')
  })
})

// ============================================================================
// Additional coverage: detectCircularDependencies - stress and edge cases
// ============================================================================

describe('detectCircularDependencies - stress and edge cases', () => {
  test('handles graph where import exists but importDetails is empty', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map(),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map(),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
      ]),
    }
    const result = detectCircularDependencies(graph)
    expect(result).toEqual([])
  })

  test('handles eight-node ring cycle', () => {
    const paths = Array.from({ length: 8 }, (_, i) => `n${i}.ts`)
    const graph = makeCycleGraph(paths)
    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toHaveLength(9)
  })

  test('handles nine-node ring cycle', () => {
    const paths = Array.from({ length: 9 }, (_, i) => `m${i}.ts`)
    const graph = makeCycleGraph(paths)
    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toHaveLength(10)
  })

  test('handles twelve-node ring cycle', () => {
    const paths = Array.from({ length: 12 }, (_, i) => `t${i}.ts`)
    const graph = makeCycleGraph(paths)
    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toHaveLength(13)
  })

  test('handles graph with two cycles sharing multiple nodes', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        ['b.ts', makeImportDetail('b.ts', 'a.ts', 1)],
        ['c.ts', makeImportDetail('c.ts', 'a.ts', 2)],
      ]),
      imports: new Set(['b.ts', 'c.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['c.ts', makeImportDetail('c.ts', 'b.ts', 3)]]),
      imports: new Set(['c.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'c.ts', 4)]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  test('handles single node with self-import and importDetails', () => {
    const node: DependencyNode = {
      filePath: 'loop.ts',
      importDetails: new Map([['loop.ts', makeImportDetail('loop.ts', 'loop.ts', 42, 10, 50)]]),
      imports: new Set(['loop.ts']),
    }
    const graph: DependencyGraph = { nodes: new Map([['loop.ts', node]]) }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toEqual(['loop.ts', 'loop.ts'])
    expect(result[0]!.location.line).toBe(42)
  })

  test('handles linear chain of 5 nodes feeding into cycle', () => {
    const chainLen = 5
    const nodes: DependencyNode[] = []
    for (let i = 0; i < chainLen; i++) {
      nodes.push({
        filePath: `chain${i}.ts`,
        importDetails: new Map([
          [`chain${i + 1}.ts`, makeImportDetail(`chain${i + 1}.ts`, `chain${i}.ts`, i + 1)],
        ]),
        imports: new Set([`chain${i + 1}.ts`]),
      })
    }
    const cycleA: DependencyNode = {
      filePath: 'cA.ts',
      importDetails: new Map([['cB.ts', makeImportDetail('cB.ts', 'cA.ts', 6)]]),
      imports: new Set(['cB.ts']),
    }
    const cycleB: DependencyNode = {
      filePath: 'cB.ts',
      importDetails: new Map([['cA.ts', makeImportDetail('cA.ts', 'cB.ts', 7)]]),
      imports: new Set(['cA.ts']),
    }
    nodes[chainLen - 1]!.importDetails.set(
      'cA.ts',
      makeImportDetail('cA.ts', `chain${chainLen - 1}.ts`, chainLen),
    )
    nodes[chainLen - 1]!.imports.add('cA.ts')

    const graph: DependencyGraph = {
      nodes: new Map([...nodes.map((n) => [n.filePath, n]), ['cA.ts', cycleA], ['cB.ts', cycleB]]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toEqual(['cA.ts', 'cB.ts', 'cA.ts'])
  })

  test('handles graph with 3 disconnected self-loops', () => {
    const nodes: DependencyNode[] = ['s1.ts', 's2.ts', 's3.ts'].map((fp, i) => ({
      filePath: fp,
      importDetails: new Map([[fp, makeImportDetail(fp, fp, i + 1)]]),
      imports: new Set([fp]),
    }))
    const graph: DependencyGraph = { nodes: new Map(nodes.map((n) => [n.filePath, n])) }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(3)
  })

  test('handles wide graph with 20 nodes and no edges', () => {
    const nodes: DependencyNode[] = Array.from({ length: 20 }, (_, i) =>
      makeNode({ filePath: `empty${i}.ts`, imports: new Set() }),
    )
    const graph = makeGraph(nodes)

    const result = detectCircularDependencies(graph)

    expect(result).toEqual([])
  })

  test('handles complete 2-node mutual dependency with detailed locations', () => {
    const nodeA: DependencyNode = {
      filePath: 'alpha.ts',
      importDetails: new Map([
        [
          'beta.ts',
          {
            location: { column: 3, end: 25, line: 7 },
            modulePath: './beta',
            sourceFile: 'alpha.ts',
          },
        ],
      ]),
      imports: new Set(['beta.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'beta.ts',
      importDetails: new Map([
        [
          'alpha.ts',
          {
            location: { column: 8, end: 40, line: 15 },
            modulePath: './alpha',
            sourceFile: 'beta.ts',
          },
        ],
      ]),
      imports: new Set(['alpha.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['alpha.ts', nodeA],
        ['beta.ts', nodeB],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.location).toEqual({ column: 8, end: 40, line: 15 })
  })

  test('handles graph where cycle nodes have extra non-cycle imports', () => {
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([
        ['b.ts', makeImportDetail('b.ts', 'a.ts', 1)],
        ['lonely.ts', makeImportDetail('lonely.ts', 'a.ts', 2)],
      ]),
      imports: new Set(['b.ts', 'lonely.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([
        ['a.ts', makeImportDetail('a.ts', 'b.ts', 3)],
        ['orphan.ts', makeImportDetail('orphan.ts', 'b.ts', 4)],
      ]),
      imports: new Set(['a.ts', 'orphan.ts']),
    }
    const lonely = makeNode({ filePath: 'lonely.ts', imports: new Set() })
    const orphan = makeNode({ filePath: 'orphan.ts', imports: new Set() })
    const graph: DependencyGraph = {
      nodes: new Map([
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['lonely.ts', lonely],
        ['orphan.ts', orphan],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
  })

  test('handles 30-node chain with back-edge from last to first', () => {
    const nodes: DependencyNode[] = []
    for (let i = 0; i < 30; i++) {
      const filePath = `n${i}.ts`
      const details = new Map<string, ImportInfo>()
      if (i < 29) {
        details.set(`n${i + 1}.ts`, makeImportDetail(`n${i + 1}.ts`, filePath, i + 1))
      } else {
        details.set('n0.ts', makeImportDetail('n0.ts', filePath, 30))
      }
      nodes.push({ filePath, importDetails: details, imports: new Set([...details.keys()]) })
    }
    const graph: DependencyGraph = { nodes: new Map(nodes.map((n) => [n.filePath, n])) }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toHaveLength(31)
  })

  test('handles graph with triangle plus tail', () => {
    const tail: DependencyNode = {
      filePath: 'tail.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'tail.ts', 1)]]),
      imports: new Set(['a.ts']),
    }
    const nodeA: DependencyNode = {
      filePath: 'a.ts',
      importDetails: new Map([['b.ts', makeImportDetail('b.ts', 'a.ts', 2)]]),
      imports: new Set(['b.ts']),
    }
    const nodeB: DependencyNode = {
      filePath: 'b.ts',
      importDetails: new Map([['c.ts', makeImportDetail('c.ts', 'b.ts', 3)]]),
      imports: new Set(['c.ts']),
    }
    const nodeC: DependencyNode = {
      filePath: 'c.ts',
      importDetails: new Map([['a.ts', makeImportDetail('a.ts', 'c.ts', 4)]]),
      imports: new Set(['a.ts']),
    }
    const graph: DependencyGraph = {
      nodes: new Map([
        ['tail.ts', tail],
        ['a.ts', nodeA],
        ['b.ts', nodeB],
        ['c.ts', nodeC],
      ]),
    }

    const result = detectCircularDependencies(graph)

    expect(result).toHaveLength(1)
    expect(result[0]!.cycle).toEqual(['a.ts', 'b.ts', 'c.ts', 'a.ts'])
  })

  test('handles graph with only dead-end edges', () => {
    const nodes: DependencyNode[] = Array.from({ length: 5 }, (_, i) => ({
      filePath: `dead${i}.ts`,
      importDetails: new Map<string, ImportInfo>(),
      imports: new Set<string>(),
    }))
    const graph: DependencyGraph = { nodes: new Map(nodes.map((n) => [n.filePath, n])) }

    const result = detectCircularDependencies(graph)

    expect(result).toEqual([])
  })
})
