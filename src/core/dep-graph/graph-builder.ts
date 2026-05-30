import type { GraphNode, GraphEdge, DependencyGraph, GraphMetrics } from './types.js'
import { escapeRegex } from '../../utils/string-helpers.js'
import { roundTo } from '../../utils/math-helpers.js'

const IMPORT_REGEX = /import\s+(?:(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g
const RE_EXPORT_REGEX = /export\s+(?:\{[^}]*\}\s+from|\*\s+from)\s+['"]([^'"]+)['"]/g
const DYNAMIC_IMPORT_REGEX = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g
const TYPE_IMPORT_REGEX = /import\s+type\s+(?:\{[^}]*\}\s+from\s+)?['"]([^'"]+)['"]/g

const _extractNamesCache = new Map<string, RegExp[]>()

export class GraphBuilder {
  private nodes: Map<string, GraphNode> = new Map()
  private edges: GraphEdge[] = []

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node)
  }

  addEdge(edge: GraphEdge): void {
    this.edges.push(edge)
  }

  buildFromSource(source: string, filePath: string): DependencyGraph {
    const moduleId = filePath.replace(/\.[^/.]+$/, '')

    this.addNode({
      id: moduleId,
      label: moduleId.split('/').pop() ?? moduleId,
      type: 'internal',
      filePath,
    })

    const imports: { specifier: string; type: 'import' | 're-export' | 'dynamic-import' | 'type-import'; names: string[] }[] = []

    let match: RegExpExecArray | null

    TYPE_IMPORT_REGEX.lastIndex = 0
    while ((match = TYPE_IMPORT_REGEX.exec(source)) !== null) {
      imports.push({ specifier: match[1]!, type: 'type-import', names: this.extractNames(source, match[1]!) })
    }

    IMPORT_REGEX.lastIndex = 0
    while ((match = IMPORT_REGEX.exec(source)) !== null) {
      if (!source.substring(match.index, match.index + 20).includes('import type')) {
        imports.push({ specifier: match[1]!, type: 'import', names: this.extractNames(source, match[1]!) })
      }
    }

    RE_EXPORT_REGEX.lastIndex = 0
    while ((match = RE_EXPORT_REGEX.exec(source)) !== null) {
      imports.push({ specifier: match[1]!, type: 're-export', names: [] })
    }

    DYNAMIC_IMPORT_REGEX.lastIndex = 0
    while ((match = DYNAMIC_IMPORT_REGEX.exec(source)) !== null) {
      imports.push({ specifier: match[1]!, type: 'dynamic-import', names: [] })
    }

    for (const imp of imports) {
      const targetId = this.resolveModule(imp.specifier, filePath)
      if (!this.nodes.has(targetId)) {
        this.addNode({
          id: targetId,
          label: imp.specifier.split('/').pop() ?? imp.specifier,
          type: this.classifyModule(imp.specifier),
          filePath: imp.specifier.startsWith('.') ? imp.specifier : undefined,
        })
      }
      this.addEdge({
        from: moduleId,
        to: targetId,
        type: imp.type,
        importedNames: imp.names,
      })
    }

    return this.build()
  }

  private extractNames(source: string, specifier: string): string[] {
    let patterns = _extractNamesCache.get(specifier)
    if (!patterns) {
      const escaped = escapeRegex(specifier)
      patterns = [
        new RegExp(`import\\s+\\{([^}]+)\\}\\s+from\\s+['"]${escaped}['"]`),
        new RegExp(`import\\s+type\\s+\\{([^}]+)\\}\\s+from\\s+['"]${escaped}['"]`),
      ]
      _extractNamesCache.set(specifier, patterns)
    }
    for (const pattern of patterns) {
      const m = source.match(pattern)
      if (m && m[1]) {
        return m[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]!.trim()).filter(Boolean)
      }
    }
    return []
  }

  private resolveModule(specifier: string, _fromPath: string): string {
    if (specifier.startsWith('.') || specifier.startsWith('/')) {
      return specifier.replace(/\.[^/.]+$/, '')
    }
    return specifier
  }

  private classifyModule(specifier: string): 'internal' | 'external' | 'builtin' {
    const builtins = ['fs', 'path', 'http', 'https', 'url', 'util', 'os', 'stream', 'crypto', 'buffer', 'events', 'child_process', 'net', 'tls', 'dns', 'assert', 'cluster', 'dgram', 'readline', 'repl', 'string_decoder', 'tty', 'zlib', 'punycode', 'querystring', 'vm', 'worker_threads', 'perf_hooks', 'async_hooks', 'diagnostics_channel', 'inspector']
    if (builtins.includes(specifier) || specifier.startsWith('node:')) {
      return 'builtin'
    }
    if (specifier.startsWith('.') || specifier.startsWith('/')) {
      return 'internal'
    }
    return 'external'
  }

  getDependents(nodeId: string): string[] {
    return this.edges
      .filter((e) => e.to === nodeId)
      .map((e) => e.from)
  }

  getDependencies(nodeId: string): string[] {
    return this.edges
      .filter((e) => e.from === nodeId)
      .map((e) => e.to)
  }

  getSubgraph(rootId: string, depth: number): DependencyGraph {
    const subNodes = new Map<string, GraphNode>()
    const subEdges: GraphEdge[] = []
    const visited = new Set<string>()
    const queue: Array<{ id: string; currentDepth: number }> = [{ id: rootId, currentDepth: 0 }]
    let _qi = 0

    while (_qi < queue.length) {
      const item = queue[_qi++]!
      if (item.currentDepth > depth || visited.has(item.id)) continue
      visited.add(item.id)

      const node = this.nodes.get(item.id)
      if (node) {
        subNodes.set(node.id, node)
      }

      for (const edge of this.edges) {
        if (edge.from === item.id) {
          subEdges.push(edge)
          if (!visited.has(edge.to)) {
            queue.push({ id: edge.to, currentDepth: item.currentDepth + 1 })
          }
        }
      }
    }

    return { nodes: subNodes, edges: subEdges }
  }

  merge(other: DependencyGraph): DependencyGraph {
    const mergedNodes = new Map(this.nodes)
    for (const [key, value] of other.nodes) {
      if (!mergedNodes.has(key)) {
        mergedNodes.set(key, value)
      }
    }

    const existingEdges = new Set(this.edges.map((e) => `${e.from}->${e.to}:${e.type}`))
    const mergedEdges = [...this.edges]
    for (const edge of other.edges) {
      const key = `${edge.from}->${edge.to}:${edge.type}`
      if (!existingEdges.has(key)) {
        mergedEdges.push(edge)
        existingEdges.add(key)
      }
    }

    return { nodes: mergedNodes, edges: mergedEdges }
  }

  getMetrics(): GraphMetrics {
    const totalNodes = this.nodes.size
    const totalEdges = this.edges.length
    const avgDegree = totalNodes > 0 ? totalEdges / totalNodes : 0

    const dependents = new Set<string>()
    for (const edge of this.edges) {
      dependents.add(edge.from)
      dependents.add(edge.to)
    }

    const orphans = Array.from(this.nodes.keys()).filter((id) => {
      return !this.edges.some((e) => e.from === id || e.to === id)
    })

    const visited = new Set<string>()
    let maxDepth = 0

    const roots = Array.from(this.nodes.keys()).filter(
      (id) => !this.edges.some((e) => e.to === id),
    )

    for (const root of roots) {
      const stack: Array<{ id: string; depth: number }> = [{ id: root, depth: 0 }]
      while (stack.length > 0) {
        const item = stack.pop()!
        if (item.depth > maxDepth) maxDepth = item.depth
        const key = `${item.id}:${item.depth}`
        if (visited.has(key)) continue
        visited.add(key)
        for (const edge of this.edges) {
          if (edge.from === item.id) {
            stack.push({ id: edge.to, depth: item.depth + 1 })
          }
        }
      }
    }

    const cycleCount = this.countCycles()

    return {
      totalNodes,
      totalEdges,
      avgDegree: roundTo(avgDegree, 2),
      maxDepth,
      cycleCount,
      orphanCount: orphans.length,
    }
  }

  private countCycles(): number {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    let count = 0

    const dfs = (nodeId: string): void => {
      visited.add(nodeId)
      recursionStack.add(nodeId)

      for (const edge of this.edges) {
        if (edge.from === nodeId) {
          if (!visited.has(edge.to)) {
            dfs(edge.to)
          } else if (recursionStack.has(edge.to)) {
            count++
          }
        }
      }

      recursionStack.delete(nodeId)
    }

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId)
      }
    }

    return count
  }

  build(): DependencyGraph {
    return {
      nodes: new Map(this.nodes),
      edges: [...this.edges],
    }
  }

  reset(): void {
    this.nodes.clear()
    this.edges = []
  }
}
