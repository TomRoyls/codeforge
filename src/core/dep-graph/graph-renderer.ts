import type { DependencyGraph } from './types.js'

export class GraphRenderer {
  toDot(graph: DependencyGraph): string {
    const lines: string[] = ['digraph dependencies {']
    lines.push('  rankdir=LR;')
    lines.push('  node [shape=box];')
    lines.push('')

    for (const [id, node] of graph.nodes) {
      const color = node.type === 'internal' ? 'lightblue' : node.type === 'external' ? 'lightyellow' : 'lightgray'
      const label = node.label.replace(/"/g, '\\"')
      lines.push(`  "${id}" [label="${label}", fillcolor=${color}, style=filled];`)
    }

    lines.push('')

    for (const edge of graph.edges) {
      const style = edge.type === 'dynamic-import' ? 'style=dashed' : edge.type === 'type-import' ? 'style=dotted' : ''
      const label = edge.importedNames.length > 0 ? `label="${edge.importedNames.join(', ')}"` : ''
      const attrs = [style, label].filter(Boolean).join(', ')
      const attrStr = attrs.length > 0 ? ` [${attrs}]` : ''
      lines.push(`  "${edge.from}" -> "${edge.to}"${attrStr};`)
    }

    lines.push('}')
    return lines.join('\n')
  }

  toJSON(graph: DependencyGraph): string {
    const nodesArray = Array.from(graph.nodes.values()).map((node) => ({
      ...node,
    }))

    const data = {
      nodes: nodesArray,
      edges: graph.edges,
    }

    return JSON.stringify(data, null, 2)
  }

  toMermaid(graph: DependencyGraph): string {
    const lines: string[] = ['graph LR']

    for (const edge of graph.edges) {
      const fromLabel = this.sanitizeMermaidId(edge.from)
      const toLabel = this.sanitizeMermaidId(edge.to)
      const label = edge.importedNames.length > 0 ? `|${edge.importedNames.join(', ')}|` : ''
      lines.push(`  ${fromLabel} -->${label} ${toLabel}`)
    }

    const connectedNodes = new Set<string>()
    for (const edge of graph.edges) {
      connectedNodes.add(edge.from)
      connectedNodes.add(edge.to)
    }

    for (const [id, node] of graph.nodes) {
      if (!connectedNodes.has(id)) {
        const sanitized = this.sanitizeMermaidId(id)
        lines.push(`  ${sanitized}["${node.label}"]`)
      }
    }

    return lines.join('\n')
  }

  toAdjacencyList(graph: DependencyGraph): Map<string, string[]> {
    const adjacency = new Map<string, string[]>()

    for (const nodeId of graph.nodes.keys()) {
      adjacency.set(nodeId, [])
    }

    for (const edge of graph.edges) {
      const existing = adjacency.get(edge.from)
      if (existing) {
        existing.push(edge.to)
      } else {
        adjacency.set(edge.from, [edge.to])
      }
    }

    return adjacency
  }

  toFlatList(graph: DependencyGraph, sortBy: 'name' | 'degree' | 'depth'): string[] {
    switch (sortBy) {
      case 'name':
        return this.sortByName(graph)
      case 'degree':
        return this.sortByDegree(graph)
      case 'depth':
        return this.sortByDepth(graph)
    }
  }

  private sortByName(graph: DependencyGraph): string[] {
    return Array.from(graph.nodes.keys()).sort((a, b) => a.localeCompare(b))
  }

  private sortByDegree(graph: DependencyGraph): string[] {
    const degrees = new Map<string, number>()
    for (const nodeId of graph.nodes.keys()) {
      degrees.set(nodeId, 0)
    }
    for (const edge of graph.edges) {
      degrees.set(edge.from, (degrees.get(edge.from) ?? 0) + 1)
      degrees.set(edge.to, (degrees.get(edge.to) ?? 0) + 1)
    }
    return Array.from(graph.nodes.keys()).sort((a, b) => (degrees.get(b) ?? 0) - (degrees.get(a) ?? 0))
  }

  private sortByDepth(graph: DependencyGraph): string[] {
    const depth = new Map<string, number>()

    const roots = Array.from(graph.nodes.keys()).filter(
      (id) => !graph.edges.some((e) => e.to === id),
    )

    const queue: Array<{ id: string; d: number }> = roots.map((r) => ({ id: r, d: 0 }))
    const enqueued = new Set(roots)

    while (queue.length > 0) {
      const item = queue.shift()!
      depth.set(item.id, item.d)

      for (const edge of graph.edges) {
        if (edge.from === item.id && !enqueued.has(edge.to)) {
          enqueued.add(edge.to)
          queue.push({ id: edge.to, d: item.d + 1 })
        }
      }
    }

    for (const nodeId of graph.nodes.keys()) {
      if (!depth.has(nodeId)) {
        depth.set(nodeId, 0)
      }
    }

    return Array.from(graph.nodes.keys()).sort((a, b) => (depth.get(a) ?? 0) - (depth.get(b) ?? 0))
  }

  private sanitizeMermaidId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^_+|_+$/g, '')
  }
}
