import type { GraphNode, GraphEdge, DependencyGraph } from './types.js'

const NODE_BUILTINS = new Set([
  'fs', 'path', 'http', 'https', 'crypto', 'os', 'stream', 'url', 'util',
  'events', 'buffer', 'child_process', 'cluster', 'dgram', 'dns', 'net',
  'readline', 'repl', 'tls', 'v8', 'vm', 'worker_threads', 'assert',
  'async_hooks', 'perf_hooks', 'timers', 'zlib', 'console', 'process',
  'module', 'querystring', 'string_decoder', 'punycode', 'domain',
])

export class GraphBuilder {
  private nodes: Map<string, GraphNode> = new Map()
  private edges: GraphEdge[] = []
  private root: string = ''

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node)
    if (this.root === '') {
      this.root = node.id
    }
  }

  addEdge(edge: GraphEdge): void {
    const existing = this.edges.find(
      (e) => e.from === edge.from && e.to === edge.to && e.type === edge.type,
    )
    if (existing) {
      const merged = new Set([...existing.importedNames, ...edge.importedNames])
      existing.importedNames = [...merged]
      existing.isTypeOnly = existing.isTypeOnly && edge.isTypeOnly
    } else {
      this.edges.push({ ...edge, importedNames: [...edge.importedNames] })
    }
  }

  removeNode(id: string): void {
    this.nodes.delete(id)
    this.edges = this.edges.filter((e) => e.from !== id && e.to !== id)
    if (this.root === id) {
      const first = this.nodes.keys().next()
      this.root = first.done ? '' : first.value
    }
  }

  removeEdge(from: string, to: string): void {
    this.edges = this.edges.filter((e) => !(e.from === from && e.to === to))
  }

  getNode(id: string): GraphNode | null {
    return this.nodes.get(id) ?? null
  }

  getEdge(from: string, to: string): GraphEdge | null {
    return this.edges.find((e) => e.from === from && e.to === to) ?? null
  }

  getOutEdges(nodeId: string): GraphEdge[] {
    return this.edges.filter((e) => e.from === nodeId)
  }

  getInEdges(nodeId: string): GraphEdge[] {
    return this.edges.filter((e) => e.to === nodeId)
  }

  build(): DependencyGraph {
    return {
      nodes: new Map(this.nodes),
      edges: [...this.edges],
      root: this.root,
    }
  }

  fromImports(source: string, filePath: string): DependencyGraph {
    this.nodes.clear()
    this.edges = []
    this.root = ''

    const rootNode: GraphNode = {
      id: filePath,
      label: filePath.split('/').pop() ?? filePath,
      type: 'internal',
      path: filePath,
      metadata: { source },
    }
    this.addNode(rootNode)

    const importRegex =
      /import\s+(?:type\s+)?(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+))*)\s+from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g
    const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g
    const reexportRegex = /export\s+(?:\{[^}]*\}\s+from\s+['"]([^'"]+)['"]|\*\s+from\s+['"]([^'"]+)['"])/g

    let match: RegExpExecArray | null

    while ((match = importRegex.exec(source)) !== null) {
      const specifier = match[1] ?? match[2]
      if (specifier) {
        this.addImportNode(rootNode.id, specifier, 'import', source, match[0])
      }
    }

    while ((match = dynamicImportRegex.exec(source)) !== null) {
      const specifier = match[1]
      if (specifier) {
        this.addImportNode(rootNode.id, specifier, 'dynamic', source, match[0])
      }
    }

    while ((match = reexportRegex.exec(source)) !== null) {
      const specifier = match[1] ?? match[2]
      if (specifier) {
        this.addImportNode(rootNode.id, specifier, 'reexport', source, match[0])
      }
    }

    const typeImportRegex = /import\s+type\s+(?:\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g
    while ((match = typeImportRegex.exec(source)) !== null) {
      const specifier = match[1]
      if (specifier) {
        const existingEdge = this.edges.find(
          (e) => e.from === rootNode.id && e.to === this.resolveId(specifier),
        )
        if (existingEdge) {
          existingEdge.isTypeOnly = true
          existingEdge.type = 'type'
        }
      }
    }

    return this.build()
  }

  private resolveId(specifier: string): string {
    if (specifier.startsWith('.')) {
      return specifier
    }
    const parts = specifier.split('/')
    if (specifier.startsWith('@')) {
      return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : specifier
    }
    return parts[0] ?? specifier
  }

  private determineNodeType(specifier: string): 'internal' | 'external' | 'builtin' {
    if (specifier.startsWith('.')) return 'internal'
    const topLevel = specifier.startsWith('@')
      ? specifier.split('/').slice(0, 2).join('/')
      : specifier.split('/')[0] ?? specifier
    if (NODE_BUILTINS.has(topLevel)) return 'builtin'
    return 'external'
  }

  private extractImportedNames(importStmt: string): string[] {
    const names: string[] = []
    const braceMatch = importStmt.match(/\{([^}]+)\}/)
    if (braceMatch) {
      names.push(
        ...braceMatch[1]!.split(',').map((n) => n.trim().split(/\s+as\s+/).pop()!.trim()).filter(Boolean),
      )
    }
    const defaultMatch = importStmt.match(
      /import\s+(?:type\s+)?([a-zA-Z_$][\w$]*)\s*,?\s*(?:\{|from)/,
    )
    if (defaultMatch) {
      names.push(defaultMatch[1]!)
    }
    const namespaceMatch = importStmt.match(/\*\s+as\s+([a-zA-Z_$][\w$]*)/)
    if (namespaceMatch) {
      names.push(namespaceMatch[1]!)
    }
    return [...new Set(names)]
  }

  private addImportNode(
    rootId: string,
    specifier: string,
    edgeType: 'import' | 'dynamic' | 'reexport',
    _source: string,
    rawStmt: string,
  ): void {
    const nodeId = this.resolveId(specifier)
    const nodeType = this.determineNodeType(specifier)

    if (!this.nodes.has(nodeId)) {
      this.addNode({
        id: nodeId,
        label: specifier,
        type: nodeType,
        path: specifier.startsWith('.') ? specifier : undefined,
        metadata: {},
      })
    }

    const isTypeOnly = /^\s*import\s+type\s/.test(rawStmt)
    const importedNames = this.extractImportedNames(rawStmt)

    this.addEdge({
      from: rootId,
      to: nodeId,
      type: edgeType,
      importedNames,
      isTypeOnly,
    })
  }

  clone(): GraphBuilder {
    const cloned = new GraphBuilder()
    for (const [id, node] of this.nodes) {
      cloned.nodes.set(id, { ...node, metadata: { ...node.metadata } })
    }
    cloned.edges = this.edges.map((e) => ({
      ...e,
      importedNames: [...e.importedNames],
    }))
    cloned.root = this.root
    return cloned
  }
}
