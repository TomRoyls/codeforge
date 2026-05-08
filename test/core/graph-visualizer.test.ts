import { describe, it, expect } from 'vitest'
import { AsciiRenderer } from '../../src/core/graph-visualizer/ascii-renderer.js'
import { GraphVisualizer } from '../../src/core/graph-visualizer/graph-visualizer.js'
import type {
  VizGraph,
  RenderOptions,
  TreeLayout,
} from '../../src/core/graph-visualizer/types.js'
import { DEFAULT_RENDER_OPTIONS } from '../../src/core/graph-visualizer/types.js'

function makeGraph(
  nodes: Array<{ id: string; label: string; group?: string }>,
  edges: Array<{ from: string; to: string; label?: string; weight?: number; style?: 'solid' | 'dashed' | 'dotted' }>,
  directed = true,
  label?: string,
): VizGraph {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      label: n.label,
      ...(n.group ? { group: n.group } : {}),
    })),
    edges: edges.map((e) => ({
      from: e.from,
      to: e.to,
      ...(e.label ? { label: e.label } : {}),
      ...(e.weight !== undefined ? { weight: e.weight } : {}),
      ...(e.style ? { style: e.style } : {}),
    })),
    directed,
    ...(label ? { label } : {}),
  }
}

function makeTreeLayout(
  root: string,
  childrenMap: Record<string, string[]>,
  depthMap?: Record<string, number>,
): TreeLayout {
  const children = new Map<string, string[]>()
  const depths = new Map<string, number>()
  const order: string[] = []
  const visited = new Set<string>()
  const queue = [root]
  while (queue.length > 0) {
    const id = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    order.push(id)
    const ch = childrenMap[id] ?? []
    children.set(id, ch)
    depths.set(id, depthMap?.[id] ?? 0)
    for (const c of ch) {
      queue.push(c)
    }
  }
  return { root, children, depths, order }
}

describe('AsciiRenderer', () => {
  const renderer = new AsciiRenderer()

  describe('renderTree', () => {
    it('should render a single root node', () => {
      const layout = makeTreeLayout('a', { a: [] })
      const labels = new Map([['a', 'Root']])
      const result = renderer.renderTree(layout, labels, DEFAULT_RENDER_OPTIONS)
      expect(result).toBe('Root')
    })

    it('should render root with children', () => {
      const layout = makeTreeLayout('a', { a: ['b', 'c'], b: [], c: [] })
      const labels = new Map([
        ['a', 'Root'],
        ['b', 'Child1'],
        ['c', 'Child2'],
      ])
      const result = renderer.renderTree(layout, labels, DEFAULT_RENDER_OPTIONS)
      expect(result).toContain('Root')
      expect(result).toContain('Child1')
      expect(result).toContain('Child2')
      expect(result).toContain('├──')
      expect(result).toContain('└──')
    })

    it('should render last child with └──', () => {
      const layout = makeTreeLayout('a', { a: ['b', 'c'], b: [], c: [] })
      const labels = new Map([
        ['a', 'A'],
        ['b', 'B'],
        ['c', 'C'],
      ])
      const result = renderer.renderTree(layout, labels, DEFAULT_RENDER_OPTIONS)
      const lines = result.split('\n')
      expect(lines[1]).toContain('├──')
      expect(lines[2]).toContain('└──')
    })

    it('should render a single child with └──', () => {
      const layout = makeTreeLayout('a', { a: ['b'], b: [] })
      const labels = new Map([
        ['a', 'A'],
        ['b', 'B'],
      ])
      const result = renderer.renderTree(layout, labels, DEFAULT_RENDER_OPTIONS)
      expect(result).toContain('└── B')
      expect(result).not.toContain('├──')
    })

    it('should use node id when label not found', () => {
      const layout = makeTreeLayout('a', { a: [] })
      const labels = new Map<string, string>()
      const result = renderer.renderTree(layout, labels, DEFAULT_RENDER_OPTIONS)
      expect(result).toBe('a')
    })

    it('should respect maxDepth option', () => {
      const layout = makeTreeLayout('a', {
        a: ['b'],
        b: ['c'],
        c: ['d'],
        d: [],
      })
      const labels = new Map([
        ['a', 'A'],
        ['b', 'B'],
        ['c', 'C'],
        ['d', 'D'],
      ])
      const options: RenderOptions = { ...DEFAULT_RENDER_OPTIONS, maxDepth: 1 }
      const result = renderer.renderTree(layout, labels, options)
      expect(result).toContain('A')
      expect(result).toContain('B')
    })

    it('should use nodePrefix', () => {
      const layout = makeTreeLayout('a', { a: ['b'], b: [] })
      const labels = new Map([
        ['a', 'Root'],
        ['b', 'Child'],
      ])
      const options: RenderOptions = { ...DEFAULT_RENDER_OPTIONS, nodePrefix: '[*] ' }
      const result = renderer.renderTree(layout, labels, options)
      expect(result).toContain('[*] Root')
      expect(result).toContain('[*] Child')
    })

    it('should show only ids when showLabels is false', () => {
      const layout = makeTreeLayout('a', { a: ['b'], b: [] })
      const labels = new Map([
        ['a', 'Root'],
        ['b', 'Child'],
      ])
      const options: RenderOptions = { ...DEFAULT_RENDER_OPTIONS, showLabels: false }
      const result = renderer.renderTree(layout, labels, options)
      expect(result).toContain('a')
      expect(result).not.toContain('Root')
    })

    it('should handle deeply nested trees', () => {
      const layout = makeTreeLayout('a', {
        a: ['b'],
        b: ['c'],
        c: ['d'],
        d: [],
      })
      const labels = new Map([
        ['a', 'A'],
        ['b', 'B'],
        ['c', 'C'],
        ['d', 'D'],
      ])
      const result = renderer.renderTree(layout, labels, DEFAULT_RENDER_OPTIONS)
      expect(result).toContain('A')
      expect(result).toContain('D')
    })
  })

  describe('renderNode', () => {
    it('should render with ├── for non-last node', () => {
      const result = renderer.renderNode('id', 'Label', 0, false, '')
      expect(result).toBe('├── Label')
    })

    it('should render with └── for last node', () => {
      const result = renderer.renderNode('id', 'Label', 0, true, '')
      expect(result).toBe('└── Label')
    })

    it('should include prefix', () => {
      const result = renderer.renderNode('id', 'Label', 1, false, '│   ')
      expect(result).toBe('│   ├── Label')
    })
  })

  describe('renderConnector', () => {
    it('should return ├── for non-last', () => {
      expect(renderer.renderConnector(0, false)).toBe('├── ')
    })

    it('should return └── for last', () => {
      expect(renderer.renderConnector(0, true)).toBe('└── ')
    })

    it('should be consistent across depths', () => {
      expect(renderer.renderConnector(5, false)).toBe('├── ')
      expect(renderer.renderConnector(5, true)).toBe('└── ')
    })
  })

  describe('renderBox', () => {
    it('should render a box around a label', () => {
      const result = renderer.renderBox('Hello', 10)
      expect(result[0]).toContain('┌')
      expect(result[0]).toContain('┐')
      expect(result).toContain('│Hello   │')
      expect(result[result.length - 1]).toContain('└')
      expect(result[result.length - 1]).toContain('┘')
    })

    it('should handle width equal to label length plus padding', () => {
      const result = renderer.renderBox('Hi', 4)
      expect(result.length).toBe(3)
    })

    it('should handle empty label', () => {
      const result = renderer.renderBox('', 5)
      expect(result.length).toBe(3)
      expect(result[1]).toContain('│')
    })
  })

  describe('truncateLabel', () => {
    it('should return label unchanged when within maxWidth', () => {
      expect(renderer.truncateLabel('Hello', 10)).toBe('Hello')
    })

    it('should truncate and add ellipsis when too long', () => {
      expect(renderer.truncateLabel('Hello World', 8)).toBe('Hello...')
    })

    it('should return empty string for zero maxWidth', () => {
      expect(renderer.truncateLabel('Hello', 0)).toBe('')
    })

    it('should handle exact length match', () => {
      expect(renderer.truncateLabel('Hello', 5)).toBe('Hello')
    })

    it('should handle maxWidth of 3 with ellipsis', () => {
      expect(renderer.truncateLabel('Hello', 3)).toBe('...')
    })

    it('should handle maxWidth less than 3', () => {
      expect(renderer.truncateLabel('Hello', 2)).toBe('He')
    })
  })

  describe('wrapText', () => {
    it('should return text in single line when it fits', () => {
      const result = renderer.wrapText('Hello', 10)
      expect(result).toEqual(['Hello'])
    })

    it('should wrap at word boundaries', () => {
      const result = renderer.wrapText('Hello World Test', 8)
      expect(result.length).toBeGreaterThan(1)
      expect(result.join(' ').includes('Hello')).toBe(true)
    })

    it('should handle zero maxWidth', () => {
      const result = renderer.wrapText('Hello', 0)
      expect(result).toEqual(['Hello'])
    })

    it('should handle text that fits exactly', () => {
      const result = renderer.wrapText('Hello', 5)
      expect(result).toEqual(['Hello'])
    })

    it('should break long words when no space available', () => {
      const result = renderer.wrapText('ABCDEFGHIJ', 5)
      expect(result.length).toBeGreaterThan(1)
    })

    it('should handle empty string', () => {
      const result = renderer.wrapText('', 10)
      expect(result).toEqual([''])
    })

    it('should preserve all content when wrapping', () => {
      const text = 'one two three four'
      const result = renderer.wrapText(text, 7)
      const reconstructed = result.join(' ')
      expect(reconstructed).toBe(text)
    })
  })
})

describe('GraphVisualizer', () => {
  describe('constructor', () => {
    it('should create with default options', () => {
      const viz = new GraphVisualizer()
      const opts = viz.getOptions()
      expect(opts.direction).toBe('TB')
      expect(opts.maxWidth).toBe(80)
      expect(opts.maxDepth).toBe(10)
      expect(opts.showLabels).toBe(true)
      expect(opts.showWeights).toBe(false)
      expect(opts.nodePrefix).toBe('')
      expect(opts.indent).toBe('  ')
      expect(opts.colors).toBe(false)
    })

    it('should merge partial options', () => {
      const viz = new GraphVisualizer({ maxWidth: 120, direction: 'LR' })
      const opts = viz.getOptions()
      expect(opts.maxWidth).toBe(120)
      expect(opts.direction).toBe('LR')
      expect(opts.maxDepth).toBe(10)
    })

    it('should override all options', () => {
      const viz = new GraphVisualizer({
        direction: 'BT',
        maxWidth: 60,
        maxDepth: 5,
        showLabels: false,
        showWeights: true,
        nodePrefix: '> ',
        indent: '    ',
        colors: true,
      })
      const opts = viz.getOptions()
      expect(opts.direction).toBe('BT')
      expect(opts.maxWidth).toBe(60)
      expect(opts.maxDepth).toBe(5)
      expect(opts.showLabels).toBe(false)
      expect(opts.showWeights).toBe(true)
      expect(opts.nodePrefix).toBe('> ')
      expect(opts.indent).toBe('    ')
      expect(opts.colors).toBe(true)
    })
  })

  describe('getOptions', () => {
    it('should return a copy of options', () => {
      const viz = new GraphVisualizer()
      const opts1 = viz.getOptions()
      const opts2 = viz.getOptions()
      expect(opts1).toEqual(opts2)
      expect(opts1).not.toBe(opts2)
    })
  })

  describe('render', () => {
    it('should render empty graph', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph([], [])
      expect(viz.render(graph)).toBe('')
    })

    it('should render single node', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph([{ id: 'a', label: 'NodeA' }], [])
      const result = viz.render(graph)
      expect(result).toBe('NodeA')
    })

    it('should include graph label when present', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [{ id: 'a', label: 'NodeA' }],
        [],
        true,
        'My Graph',
      )
      const result = viz.render(graph)
      expect(result).toContain('My Graph')
      expect(result).toContain('NodeA')
    })

    it('should render graph with edges', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [{ from: 'a', to: 'b' }],
      )
      const result = viz.render(graph)
      expect(result).toContain('A')
      expect(result).toContain('B')
    })

    it('should render disconnected nodes', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [],
      )
      const result = viz.render(graph)
      expect(result).toContain('A')
      expect(result).toContain('B')
    })
  })

  describe('renderTreeFromRoot', () => {
    it('should render tree from specified root', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'root', label: 'Root' },
          { id: 'child', label: 'Child' },
        ],
        [{ from: 'root', to: 'child' }],
      )
      const result = viz.renderTreeFromRoot('root', graph)
      expect(result).toContain('Root')
      expect(result).toContain('Child')
    })

    it('should handle missing root gracefully', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [{ id: 'a', label: 'A' }],
        [],
      )
      const result = viz.renderTreeFromRoot('nonexistent', graph)
      expect(result).toContain('nonexistent')
    })
  })

  describe('renderAdjacencyMatrix', () => {
    it('should return empty string for empty graph', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph([], [])
      expect(viz.renderAdjacencyMatrix(graph)).toBe('')
    })

    it('should render adjacency matrix for simple graph', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [{ from: 'a', to: 'b' }],
      )
      const result = viz.renderAdjacencyMatrix(graph)
      expect(result).toContain('a')
      expect(result).toContain('b')
      expect(result).toContain('1')
      expect(result).toContain('0')
    })

    it('should show 1 for connected nodes', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [{ from: 'a', to: 'b' }],
      )
      const result = viz.renderAdjacencyMatrix(graph)
      const lines = result.split('\n')
      expect(lines.length).toBe(3)
    })

    it('should show 0 for disconnected nodes', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [],
      )
      const result = viz.renderAdjacencyMatrix(graph)
      expect(result).not.toContain('1')
    })

    it('should handle self-loops', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [{ id: 'a', label: 'A' }],
        [{ from: 'a', to: 'a' }],
      )
      const result = viz.renderAdjacencyMatrix(graph)
      expect(result).toContain('1')
    })

    it('should handle bidirectional edges in directed graph', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [
          { from: 'a', to: 'b' },
          { from: 'b', to: 'a' },
        ],
      )
      const result = viz.renderAdjacencyMatrix(graph)
      const lines = result.split('\n')
      const aRow = lines.find((l) => l.startsWith('a:'))
      const bRow = lines.find((l) => l.startsWith('b:'))
      expect(aRow).toBeDefined()
      expect(bRow).toBeDefined()
    })
  })

  describe('renderEdgeList', () => {
    it('should return empty string for graph with no edges', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph([{ id: 'a', label: 'A' }], [])
      expect(viz.renderEdgeList(graph)).toBe('')
    })

    it('should render directed edges with arrow', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [{ from: 'a', to: 'b' }],
        true,
      )
      const result = viz.renderEdgeList(graph)
      expect(result).toBe('a -> b')
    })

    it('should render undirected edges with double dash', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [{ from: 'a', to: 'b' }],
        false,
      )
      const result = viz.renderEdgeList(graph)
      expect(result).toBe('a -- b')
    })

    it('should include edge label', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [{ from: 'a', to: 'b', label: 'uses' }],
        true,
      )
      const result = viz.renderEdgeList(graph)
      expect(result).toBe('a -> b [uses]')
    })

    it('should include weight when showWeights is true', () => {
      const viz = new GraphVisualizer({ showWeights: true })
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [{ from: 'a', to: 'b', weight: 5 }],
        true,
      )
      const result = viz.renderEdgeList(graph)
      expect(result).toContain('(w:5)')
    })

    it('should not include weight when showWeights is false', () => {
      const viz = new GraphVisualizer({ showWeights: false })
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [{ from: 'a', to: 'b', weight: 5 }],
        true,
      )
      const result = viz.renderEdgeList(graph)
      expect(result).not.toContain('(w:5)')
    })

    it('should render multiple edges', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
          { id: 'c', label: 'C' },
        ],
        [
          { from: 'a', to: 'b' },
          { from: 'b', to: 'c' },
        ],
        true,
      )
      const result = viz.renderEdgeList(graph)
      const lines = result.split('\n')
      expect(lines).toHaveLength(2)
    })
  })

  describe('computeLayout', () => {
    it('should return empty layout for empty graph', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph([], [])
      const layout = viz.computeLayout(graph)
      expect(layout.root).toBe('')
      expect(layout.order).toEqual([])
    })

    it('should find root node with zero in-degree', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [{ from: 'a', to: 'b' }],
      )
      const layout = viz.computeLayout(graph)
      expect(layout.root).toBe('a')
    })

    it('should compute correct depths', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
          { id: 'c', label: 'C' },
        ],
        [
          { from: 'a', to: 'b' },
          { from: 'b', to: 'c' },
        ],
      )
      const layout = viz.computeLayout(graph)
      expect(layout.depths.get('a')).toBe(0)
      expect(layout.depths.get('b')).toBe(1)
      expect(layout.depths.get('c')).toBe(2)
    })

    it('should compute correct order', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
          { id: 'c', label: 'C' },
        ],
        [
          { from: 'a', to: 'b' },
          { from: 'a', to: 'c' },
        ],
      )
      const layout = viz.computeLayout(graph)
      expect(layout.order[0]).toBe('a')
      expect(layout.order).toContain('b')
      expect(layout.order).toContain('c')
    })

    it('should handle cyclic graph by picking first node', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [
          { from: 'a', to: 'b' },
          { from: 'b', to: 'a' },
        ],
      )
      const layout = viz.computeLayout(graph)
      expect(layout.order).toContain('a')
      expect(layout.order).toContain('b')
    })

    it('should compute children map', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
          { id: 'c', label: 'C' },
        ],
        [
          { from: 'a', to: 'b' },
          { from: 'a', to: 'c' },
        ],
      )
      const layout = viz.computeLayout(graph)
      const aChildren = layout.children.get('a')
      expect(aChildren).toBeDefined()
      expect(aChildren!).toContain('b')
      expect(aChildren!).toContain('c')
    })
  })

  describe('computeTreeLayout', () => {
    it('should use specified root', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
          { id: 'c', label: 'C' },
        ],
        [
          { from: 'a', to: 'b' },
          { from: 'b', to: 'c' },
        ],
      )
      const layout = viz.computeTreeLayout('b', graph)
      expect(layout.root).toBe('b')
      expect(layout.depths.get('b')).toBe(0)
      expect(layout.depths.get('c')).toBe(1)
    })

    it('should handle disconnected nodes', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [],
      )
      const layout = viz.computeTreeLayout('a', graph)
      expect(layout.order).toContain('a')
      expect(layout.order).toContain('b')
    })
  })

  describe('topologicalOrder', () => {
    it('should return correct topological order', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
          { id: 'c', label: 'C' },
        ],
        [
          { from: 'a', to: 'b' },
          { from: 'b', to: 'c' },
        ],
      )
      const order = viz.topologicalOrder(graph)
      expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'))
      expect(order.indexOf('b')).toBeLessThan(order.indexOf('c'))
    })

    it('should handle graph with no edges', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [],
      )
      const order = viz.topologicalOrder(graph)
      expect(order).toHaveLength(2)
      expect(order).toContain('a')
      expect(order).toContain('b')
    })

    it('should handle diamond dependency', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
          { id: 'c', label: 'C' },
          { id: 'd', label: 'D' },
        ],
        [
          { from: 'a', to: 'b' },
          { from: 'a', to: 'c' },
          { from: 'b', to: 'd' },
          { from: 'c', to: 'd' },
        ],
      )
      const order = viz.topologicalOrder(graph)
      expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'))
      expect(order.indexOf('a')).toBeLessThan(order.indexOf('c'))
      expect(order.indexOf('b')).toBeLessThan(order.indexOf('d'))
      expect(order.indexOf('c')).toBeLessThan(order.indexOf('d'))
    })

    it('should handle empty graph', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph([], [])
      const order = viz.topologicalOrder(graph)
      expect(order).toEqual([])
    })

    it('should handle cyclic graph with partial order', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [
          { from: 'a', to: 'b' },
          { from: 'b', to: 'a' },
        ],
      )
      const order = viz.topologicalOrder(graph)
      expect(order.length).toBeLessThan(2)
    })
  })

  describe('toDot', () => {
    it('should generate digraph for directed graph', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [{ from: 'a', to: 'b' }],
        true,
      )
      const dot = viz.toDot(graph)
      expect(dot).toContain('digraph')
      expect(dot).toContain('->')
    })

    it('should generate graph for undirected graph', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [{ from: 'a', to: 'b' }],
        false,
      )
      const dot = viz.toDot(graph)
      expect(dot).toContain('graph')
      expect(dot).toContain('--')
      expect(dot).not.toContain('digraph')
    })

    it('should include graph label', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [{ id: 'a', label: 'A' }],
        [],
        true,
        'Test Graph',
      )
      const dot = viz.toDot(graph)
      expect(dot).toContain('label="Test Graph"')
    })

    it('should include node labels', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [{ id: 'a', label: 'MyNode' }],
        [],
      )
      const dot = viz.toDot(graph)
      expect(dot).toContain('"a" [label="MyNode"]')
    })

    it('should include edge label', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [{ from: 'a', to: 'b', label: 'uses' }],
        true,
      )
      const dot = viz.toDot(graph)
      expect(dot).toContain('label="uses"')
    })

    it('should include edge weight', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [{ from: 'a', to: 'b', weight: 3 }],
        true,
      )
      const dot = viz.toDot(graph)
      expect(dot).toContain('weight=3')
    })

    it('should include edge style', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [{ from: 'a', to: 'b', style: 'dashed' }],
        true,
      )
      const dot = viz.toDot(graph)
      expect(dot).toContain('style=dashed')
    })

    it('should group nodes by cluster when multiple groups exist', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A', group: 'core' },
          { id: 'b', label: 'B', group: 'utils' },
        ],
        [{ from: 'a', to: 'b' }],
        true,
      )
      const dot = viz.toDot(graph)
      expect(dot).toContain('cluster_core')
      expect(dot).toContain('cluster_utils')
    })

    it('should not use subgraph for single group', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph(
        [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
        [{ from: 'a', to: 'b' }],
        true,
      )
      const dot = viz.toDot(graph)
      expect(dot).not.toContain('subgraph')
    })

    it('should wrap in curly braces', () => {
      const viz = new GraphVisualizer()
      const graph = makeGraph([{ id: 'a', label: 'A' }], [])
      const dot = viz.toDot(graph)
      expect(dot).toContain('{')
      expect(dot).toContain('}')
    })
  })
})

describe('Default types', () => {
  it('should have correct default render options', () => {
    expect(DEFAULT_RENDER_OPTIONS.direction).toBe('TB')
    expect(DEFAULT_RENDER_OPTIONS.maxWidth).toBe(80)
    expect(DEFAULT_RENDER_OPTIONS.maxDepth).toBe(10)
    expect(DEFAULT_RENDER_OPTIONS.showLabels).toBe(true)
    expect(DEFAULT_RENDER_OPTIONS.showWeights).toBe(false)
    expect(DEFAULT_RENDER_OPTIONS.nodePrefix).toBe('')
    expect(DEFAULT_RENDER_OPTIONS.indent).toBe('  ')
    expect(DEFAULT_RENDER_OPTIONS.colors).toBe(false)
  })
})

describe('Integration tests', () => {
  it('should render a full dependency graph', () => {
    const viz = new GraphVisualizer()
    const graph = makeGraph(
      [
        { id: 'app', label: 'App' },
        { id: 'router', label: 'Router' },
        { id: 'auth', label: 'AuthService' },
        { id: 'db', label: 'Database' },
      ],
      [
        { from: 'app', to: 'router' },
        { from: 'app', to: 'auth' },
        { from: 'router', to: 'auth' },
        { from: 'auth', to: 'db' },
      ],
      true,
      'Dependency Graph',
    )
    const result = viz.render(graph)
    expect(result).toContain('Dependency Graph')
    expect(result).toContain('App')
    expect(result).toContain('Router')
    expect(result).toContain('AuthService')
    expect(result).toContain('Database')
  })

  it('should produce adjacency matrix for same graph', () => {
    const viz = new GraphVisualizer()
    const graph = makeGraph(
      [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ],
      [
        { from: 'a', to: 'b' },
        { from: 'a', to: 'c' },
      ],
    )
    const matrix = viz.renderAdjacencyMatrix(graph)
    expect(matrix).toContain('a')
    expect(matrix).toContain('b')
    expect(matrix).toContain('c')
  })

  it('should produce DOT output for same graph', () => {
    const viz = new GraphVisualizer()
    const graph = makeGraph(
      [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      [{ from: 'a', to: 'b', label: 'depends', weight: 2, style: 'solid' }],
      true,
      'My Deps',
    )
    const dot = viz.toDot(graph)
    expect(dot).toContain('digraph')
    expect(dot).toContain('label="My Deps"')
    expect(dot).toContain('label="depends"')
    expect(dot).toContain('weight=2')
    expect(dot).toContain('style=solid')
  })

  it('should handle graph with many nodes and no edges', () => {
    const viz = new GraphVisualizer()
    const graph = makeGraph(
      [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
        { id: 'd', label: 'D' },
        { id: 'e', label: 'E' },
      ],
      [],
    )
    const result = viz.render(graph)
    expect(result).toContain('A')
    expect(result).toContain('B')
    expect(result).toContain('C')
    expect(result).toContain('D')
    expect(result).toContain('E')
  })

  it('should handle graph with groups in DOT output', () => {
    const viz = new GraphVisualizer()
    const graph = makeGraph(
      [
        { id: 'a', label: 'A', group: 'frontend' },
        { id: 'b', label: 'B', group: 'backend' },
        { id: 'c', label: 'C', group: 'frontend' },
      ],
      [
        { from: 'a', to: 'b' },
        { from: 'c', to: 'b' },
      ],
    )
    const dot = viz.toDot(graph)
    expect(dot).toContain('cluster_frontend')
    expect(dot).toContain('cluster_backend')
  })

  it('should render edge list with labels and weights', () => {
    const viz = new GraphVisualizer({ showWeights: true })
    const graph = makeGraph(
      [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      [{ from: 'a', to: 'b', label: 'imports', weight: 10 }],
      true,
    )
    const result = viz.renderEdgeList(graph)
    expect(result).toBe('a -> b [imports] (w:10)')
  })

  it('should handle undirected graph end-to-end', () => {
    const viz = new GraphVisualizer()
    const graph = makeGraph(
      [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      [{ from: 'a', to: 'b' }],
      false,
    )
    const edgeList = viz.renderEdgeList(graph)
    expect(edgeList).toBe('a -- b')
    const dot = viz.toDot(graph)
    expect(dot).toContain('graph {')
    expect(dot).toContain('--')
  })
})
