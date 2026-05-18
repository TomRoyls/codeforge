import { AsciiRenderer } from './ascii-renderer.js'
import type {
  VizGraph,
  VizNode,
  RenderOptions,
  TreeLayout,
} from './types.js'
import { DEFAULT_RENDER_OPTIONS } from './types.js'

export class GraphVisualizer {
  private options: RenderOptions
  private renderer: AsciiRenderer

  constructor(options?: Partial<RenderOptions>) {
    this.options = { ...DEFAULT_RENDER_OPTIONS, ...options }
    this.renderer = new AsciiRenderer()
  }

  render(graph: VizGraph): string {
    if (graph.nodes.length === 0) return ''
    const layout = this.computeLayout(graph)
    const labels = new Map<string, string>()
    for (const node of graph.nodes) {
      labels.set(node.id, node.label)
    }
    let result = ''
    if (graph.label) {
      result += graph.label + '\n'
    }
    result += this.renderer.renderTree(layout, labels, this.options)
    return result
  }

  renderTreeFromRoot(rootId: string, graph: VizGraph): string {
    const layout = this.computeTreeLayout(rootId, graph)
    const labels = new Map<string, string>()
    for (const node of graph.nodes) {
      labels.set(node.id, node.label)
    }
    return this.renderer.renderTree(layout, labels, this.options)
  }

  renderAdjacencyMatrix(graph: VizGraph): string {
    if (graph.nodes.length === 0) return ''
    const nodeIds = graph.nodes.map((n) => n.id)
    let maxIdLen = 3
    for (let i = 0; i < nodeIds.length; i++) {
      const len = nodeIds[i]!.length
      if (len > maxIdLen) maxIdLen = len
    }
    const header = ' '.repeat(maxIdLen + 1) + nodeIds.map((id) => id.padStart(maxIdLen)).join(' ')
    const lines: string[] = [header]

    const adj = new Map<string, Set<string>>()
    for (const edge of graph.edges) {
      if (!adj.has(edge.from)) adj.set(edge.from, new Set())
      adj.get(edge.from)!.add(edge.to)
    }

    for (const rowId of nodeIds) {
      const row = (rowId + ':').padEnd(maxIdLen + 1)
      const cells = nodeIds.map((colId) => {
        const connected = adj.get(rowId)?.has(colId) ?? false
        return connected ? '1'.padStart(maxIdLen) : '0'.padStart(maxIdLen)
      })
      lines.push(row + cells.join(' '))
    }

    return lines.join('\n')
  }

  renderEdgeList(graph: VizGraph): string {
    if (graph.edges.length === 0) return ''
    const lines: string[] = []
    for (const edge of graph.edges) {
      const arrow = graph.directed ? ' -> ' : ' -- '
      let line = edge.from + arrow + edge.to
      if (edge.label) {
        line += ' [' + edge.label + ']'
      }
      if (edge.weight !== undefined && this.options.showWeights) {
        line += ' (w:' + String(edge.weight) + ')'
      }
      lines.push(line)
    }
    return lines.join('\n')
  }

  computeLayout(graph: VizGraph): TreeLayout {
    const children = new Map<string, string[]>()
    const depths = new Map<string, number>()
    const inDegree = new Map<string, number>()

    for (const node of graph.nodes) {
      children.set(node.id, [])
      inDegree.set(node.id, 0)
    }

    for (const edge of graph.edges) {
      const list = children.get(edge.from)
      if (list && !list.includes(edge.to)) {
        list.push(edge.to)
      }
      const current = inDegree.get(edge.to) ?? 0
      inDegree.set(edge.to, current + 1)
    }

    let roots: string[] = []
    for (const [id, degree] of inDegree) {
      if (degree === 0) {
        roots.push(id)
      }
    }

    if (roots.length === 0 && graph.nodes.length > 0) {
      roots = [graph.nodes[0]!.id]
    }

    const root = roots[0] ?? ''
    const order: string[] = []
    if (root === '') {
      return { root, children, depths, order }
    }
    const visited = new Set<string>()

    const bfs = (startId: string, startDepth: number): void => {
      const queue: Array<{ id: string; depth: number }> = [
        { id: startId, depth: startDepth },
      ]
      while (queue.length > 0) {
        const item = queue.shift()!
        if (visited.has(item.id)) continue
        visited.add(item.id)
        order.push(item.id)
        depths.set(item.id, item.depth)
        const nodeChildren = children.get(item.id) ?? []
        for (const childId of nodeChildren) {
          if (!visited.has(childId)) {
            queue.push({ id: childId, depth: item.depth + 1 })
          }
        }
      }
    }

    bfs(root, 0)
    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        bfs(node.id, 0)
      }
    }

    return { root, children, depths, order }
  }

  computeTreeLayout(rootId: string, graph: VizGraph): TreeLayout {
    const children = new Map<string, string[]>()
    const depths = new Map<string, number>()
    const order: string[] = []

    for (const node of graph.nodes) {
      children.set(node.id, [])
    }

    for (const edge of graph.edges) {
      const list = children.get(edge.from)
      if (list && !list.includes(edge.to)) {
        list.push(edge.to)
      }
    }

    const visited = new Set<string>()
    const stack: Array<{ id: string; depth: number }> = [
      { id: rootId, depth: 0 },
    ]

    while (stack.length > 0) {
      const item = stack.shift()!
      if (visited.has(item.id)) continue
      visited.add(item.id)
      order.push(item.id)
      depths.set(item.id, item.depth)
      const nodeChildren = children.get(item.id) ?? []
      for (const childId of nodeChildren) {
        if (!visited.has(childId)) {
          stack.push({ id: childId, depth: item.depth + 1 })
        }
      }
    }

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        visited.add(node.id)
        order.push(node.id)
        depths.set(node.id, 0)
      }
    }

    return { root: rootId, children, depths, order }
  }

  topologicalOrder(graph: VizGraph): string[] {
    const inDegree = new Map<string, number>()
    const adj = new Map<string, string[]>()

    for (const node of graph.nodes) {
      inDegree.set(node.id, 0)
      adj.set(node.id, [])
    }

    for (const edge of graph.edges) {
      const list = adj.get(edge.from)
      if (list) {
        list.push(edge.to)
      }
      const current = inDegree.get(edge.to) ?? 0
      inDegree.set(edge.to, current + 1)
    }

    const queue: string[] = []
    for (const [id, degree] of inDegree) {
      if (degree === 0) {
        queue.push(id)
      }
    }

    const result: string[] = []
    while (queue.length > 0) {
      const nodeId = queue.shift()!
      result.push(nodeId)
      const neighbors = adj.get(nodeId) ?? []
      for (const neighbor of neighbors) {
        const current = (inDegree.get(neighbor) ?? 1) - 1
        inDegree.set(neighbor, current)
        if (current === 0) {
          queue.push(neighbor)
        }
      }
    }

    return result
  }

  toDot(graph: VizGraph): string {
    const lines: string[] = []
    const graphType = graph.directed ? 'digraph' : 'graph'
    const arrow = graph.directed ? '->' : '--'
    lines.push(graphType + ' {')
    if (graph.label) {
      lines.push('  label="' + graph.label + '";')
    }

    const nodeGroups = new Map<string, VizNode[]>()
    for (const node of graph.nodes) {
      const group = node.group ?? 'default'
      if (!nodeGroups.has(group)) {
        nodeGroups.set(group, [])
      }
      nodeGroups.get(group)!.push(node)
    }

    for (const [group, nodes] of nodeGroups) {
      if (nodeGroups.size > 1) {
        lines.push('  subgraph "cluster_' + group + '" {')
        lines.push('    label="' + group + '";')
        for (const node of nodes) {
          lines.push(
            '    "' + node.id + '" [label="' + node.label + '"];',
          )
        }
        lines.push('  }')
      } else {
        for (const node of nodes) {
          lines.push(
            '  "' + node.id + '" [label="' + node.label + '"];',
          )
        }
      }
    }

    for (const edge of graph.edges) {
      let line = '  "' + edge.from + '" ' + arrow + ' "' + edge.to + '"'
      const attrs: string[] = []
      if (edge.label) {
        attrs.push('label="' + edge.label + '"')
      }
      if (edge.weight !== undefined) {
        attrs.push('weight=' + String(edge.weight))
      }
      if (edge.style) {
        attrs.push('style=' + edge.style)
      }
      if (attrs.length > 0) {
        line += ' [' + attrs.join(', ') + ']'
      }
      line += ';'
      lines.push(line)
    }

    lines.push('}')
    return lines.join('\n')
  }

  getOptions(): RenderOptions {
    return { ...this.options }
  }
}
