// ─── Types ────────────────────────────────────────────────────────────────────

export interface CallNode {
  name: string
  file: string
  line: number
  calls: string[]
  calledBy: string[]
  type: 'function' | 'method' | 'arrow' | 'constructor'
  isExported: boolean
  isAsync: boolean
  depth: number
}

export interface CallEdge {
  from: string
  to: string
  fromFile: string
  toFile: string
  type: 'direct' | 'indirect' | 'external'
}

export interface CallGraph {
  nodes: Map<string, CallNode>
  edges: CallEdge[]
}

export interface CallChain {
  path: string[]
  depth: number
  files: string[]
}

export interface SymgraphStats {
  totalFunctions: number
  totalEdges: number
  averageCallsPerFunction: number
  maxDepth: number
  entryPointCount: number
  centralCount: number
  leafCount: number
  orphanCount: number
  graphDensity: number
}

export interface SymgraphResult {
  graph: CallGraph
  entryPoints: CallNode[]
  centralNodes: CallNode[]
  leafNodes: CallNode[]
  orphans: CallNode[]
  longestChains: CallChain[]
  stats: SymgraphStats
  recommendations: string[]
}

export interface SymgraphOptions {
  depth?: number
}

// ─── extractFunctions ─────────────────────────────────────────────────────────

/**
 * Find all function definitions with metadata.
 *
 * @example
 * extractFunctions('function foo() {}', 'a.ts') // Map of CallNode
 */
export function extractFunctions(content: string, filePath: string): Map<string, CallNode> {
  const nodes = new Map<string, CallNode>()
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!

    const funcMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/)
    if (funcMatch) {
      const name = funcMatch[1] ?? ''
      const isExported = line.includes('export ')
      const isAsync = line.includes('async ')
      const key = `${filePath}:${name}`
      nodes.set(key, {
        name, file: filePath, line: i + 1,
        calls: [], calledBy: [],
        type: 'function', isExported, isAsync, depth: -1,
      })
      continue
    }

    const arrowMatch = line.match(/(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/)
    if (arrowMatch) {
      const name = arrowMatch[1] ?? ''
      const isExported = line.includes('export ')
      const isAsync = line.includes('async ')
      const key = `${filePath}:${name}`
      nodes.set(key, {
        name, file: filePath, line: i + 1,
        calls: [], calledBy: [],
        type: 'arrow', isExported, isAsync, depth: -1,
      })
      continue
    }

    const classMatch = line.match(/(?:export\s+)?class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/)
    if (classMatch) {
      const name = classMatch[1] ?? ''
      const isExported = line.includes('export ')
      const key = `${filePath}:${name}`
      nodes.set(key, {
        name, file: filePath, line: i + 1,
        calls: [], calledBy: [],
        type: 'constructor', isExported, isAsync: false, depth: -1,
      })
    }
  }

  return nodes
}

// ─── extractCalls ──────────────────────────────────────────────────────────────

/**
 * Find function calls within code and map to defined functions.
 *
 * @example
 * extractCalls('foo()', 'a.ts', definedSet) // ['a.ts:foo']
 */
export function extractCalls(content: string, filePath: string, definedNames: Set<string>): string[] {
  const calls: string[] = []
  const lines = content.split('\n')
  const seen = new Set<string>()

  for (const line of lines) {
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue

    const matchAll = line.matchAll(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g)
    for (const match of matchAll) {
      const name = match[1] ?? ''
      if (['if', 'for', 'while', 'switch', 'catch', 'return', 'new', 'throw', 'class', 'function', 'const', 'let', 'var', 'import', 'export', 'typeof', 'void'].includes(name)) continue

      const key = `${filePath}:${name}`
      if (definedNames.has(key) && !seen.has(key)) {
        seen.add(key)
        calls.push(key)
      }
    }
  }

  return calls
}

// ─── buildCallGraph ────────────────────────────────────────────────────────────

/**
 * Build complete call graph from files.
 *
 * @example
 * buildCallGraph(['a.ts'], ['function foo() { bar() }']) // CallGraph
 */
export function buildCallGraph(files: string[], contents: string[]): CallGraph {
  const nodes = new Map<string, CallNode>()
  const edges: CallEdge[] = []

  // pass 1: extract all function definitions
  const allDefinedNames = new Set<string>()
  for (let i = 0; i < files.length; i++) {
    const fileNodes = extractFunctions(contents[i] ?? '', files[i]!)
    for (const [key, node] of fileNodes) {
      nodes.set(key, node)
      allDefinedNames.add(key)
    }
  }

  // pass 2: extract calls within each function's scope
  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]!
    const content = contents[i] ?? ''

    // distribute calls to function nodes in this file
    const fileNodes = [...nodes.values()].filter((n) => n.file === filePath)
    for (const node of fileNodes) {
      // simple heuristic: assign calls found in file to each function
      // a more precise approach would parse function bodies
      const lines = content.split('\n')
      let funcEnd = lines.length
      // find function body boundaries
      let braceCount = 0
      let inFunc = false
      const funcStart = node.line - 1

      for (let li = funcStart; li < lines.length; li++) {
        const line = lines[li]!
        for (const ch of line) {
          if (ch === '{') braceCount++
          if (ch === '}') braceCount--
        }
        if (li === funcStart) inFunc = true
        if (inFunc && braceCount === 0 && li > funcStart) {
          funcEnd = li + 1
          break
        }
        if (li === funcStart && !line.includes('{')) {
          // arrow function on single line or expression body
          if (node.type === 'arrow') funcEnd = li + 1
        }
      }

      const body = lines.slice(funcStart, funcEnd).join('\n')
      const bodyDefined = new Set([...allDefinedNames])
      const bodyCalls = extractCalls(body, filePath, bodyDefined)

      for (const callKey of bodyCalls) {
        if (callKey === `${filePath}:${node.name}`) continue // skip self-calls
        if (!node.calls.includes(callKey)) {
          node.calls.push(callKey)
        }

        const target = nodes.get(callKey)
        if (target && !target.calledBy.includes(`${filePath}:${node.name}`)) {
          target.calledBy.push(`${filePath}:${node.name}`)
        }

        const edgeExists = edges.some((e) => e.from === `${filePath}:${node.name}` && e.to === callKey)
        if (!edgeExists) {
          edges.push({
            from: `${filePath}:${node.name}`,
            to: callKey,
            fromFile: filePath,
            toFile: target?.file ?? filePath,
            type: filePath === (target?.file ?? filePath) ? 'direct' : 'indirect',
          })
        }
      }
    }
  }

  return { nodes, edges }
}

// ─── findEntryPoints ──────────────────────────────────────────────────────────

/**
 * Find exported functions with no callers (entry points).
 *
 * @example
 * findEntryPoints(graph) // [CallNode, ...]
 */
export function findEntryPoints(graph: CallGraph): CallNode[] {
  const entryPoints: CallNode[] = []
  for (const node of graph.nodes.values()) {
    if (node.isExported && node.calledBy.length === 0) {
      entryPoints.push(node)
    }
  }
  // also include non-exported nodes with no callers if graph has no exported entry points
  if (entryPoints.length === 0) {
    for (const node of graph.nodes.values()) {
      if (node.calledBy.length === 0) {
        entryPoints.push(node)
      }
    }
  }
  return entryPoints
}

// ─── findCentralNodes ─────────────────────────────────────────────────────────

/**
 * Find functions called by more than 3 others.
 *
 * @example
 * findCentralNodes(graph) // central CallNode[]
 */
export function findCentralNodes(graph: CallGraph): CallNode[] {
  return [...graph.nodes.values()].filter((n) => n.calledBy.length > 3)
}

// ─── findLeafNodes ────────────────────────────────────────────────────────────

/**
 * Find functions that call nothing.
 *
 * @example
 * findLeafNodes(graph) // leaf CallNode[]
 */
export function findLeafNodes(graph: CallGraph): CallNode[] {
  return [...graph.nodes.values()].filter((n) => n.calls.length === 0)
}

// ─── findOrphans ──────────────────────────────────────────────────────────────

/**
 * Find functions not called by anyone and not exported.
 *
 * @example
 * findOrphans(graph) // orphan CallNode[]
 */
export function findOrphans(graph: CallGraph): CallNode[] {
  return [...graph.nodes.values()].filter((n) => n.calledBy.length === 0 && !n.isExported)
}

// ─── computeGraphDensity ──────────────────────────────────────────────────────

/**
 * Compute graph density: edges / (nodes * (nodes - 1)).
 *
 * @example
 * computeGraphDensity(graph) // 0.15
 */
export function computeGraphDensity(graph: CallGraph): number {
  const n = graph.nodes.size
  if (n <= 1) return 0
  return Math.round((graph.edges.length / (n * (n - 1))) * 10000) / 10000
}

// ─── findLongestChains ────────────────────────────────────────────────────────

/**
 * DFS from entry points to find longest call chains.
 *
 * @example
 * findLongestChains(graph, 5) // [CallChain, ...]
 */
export function findLongestChains(graph: CallGraph, maxDepth: number): CallChain[] {
  const entryPoints = findEntryPoints(graph)
  const chains: CallChain[] = []

  function dfs(key: string, path: string[], files: string[], depth: number, visited: Set<string>) {
    if (depth > maxDepth) return
    const node = graph.nodes.get(key)
    if (!node) return

    const currentPath = [...path, key]
    const currentFiles = [...files, node.file]

    if (currentPath.length > 1) {
      chains.push({ path: currentPath, depth: currentPath.length - 1, files: currentFiles })
    }

    for (const callKey of node.calls) {
      if (visited.has(callKey)) continue
      visited.add(callKey)
      dfs(callKey, currentPath, currentFiles, depth + 1, visited)
      visited.delete(callKey)
    }
  }

  for (const ep of entryPoints) {
    const key = `${ep.file}:${ep.name}`
    const visited = new Set<string>([key])
    for (const callKey of ep.calls) {
      visited.add(callKey)
      dfs(callKey, [key], [ep.file], 1, visited)
      visited.delete(callKey)
    }
  }

  chains.sort((a, b) => b.depth - a.depth)
  return chains.slice(0, 10)
}

// ─── assignDepths ─────────────────────────────────────────────────────────────

/**
 * Assign depth from entry points via BFS.
 *
 * @example
 * assignDepths(graph, entryPoints) // mutates nodes
 */
export function assignDepths(graph: CallGraph, entryPoints: CallNode[]): void {
  for (const node of graph.nodes.values()) {
    node.depth = -1
  }

  const queue: Array<{ key: string; depth: number }> = []
  for (const ep of entryPoints) {
    const key = `${ep.file}:${ep.name}`
    ep.depth = 0
    queue.push({ key, depth: 0 })
  }

  let _qi = 0
  while (_qi < queue.length) {
    const { key, depth } = queue[_qi]!
    _qi++
    const node = graph.nodes.get(key)
    if (!node) continue

    for (const callKey of node.calls) {
      const target = graph.nodes.get(callKey)
      if (target && target.depth === -1) {
        target.depth = depth + 1
        queue.push({ key: callKey, depth: depth + 1 })
      }
    }
  }
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate actionable recommendations from graph analysis.
 *
 * @example
 * generateRecommendations(orphans, centralNodes, stats) // ['X may be dead code']
 */
export function generateRecommendations(
  orphans: CallNode[],
  centralNodes: CallNode[],
  stats: SymgraphStats,
): string[] {
  const recs: string[] = []

  if (orphans.length > 0) {
    recs.push(`${orphans.length} orphan function(s) found — may be dead code: ${orphans.slice(0, 3).map((o) => o.name).join(', ')}`)
  }

  if (centralNodes.length > 0) {
    recs.push(`${centralNodes.length} central function(s) called by many — ensure good test coverage: ${centralNodes.slice(0, 3).map((c) => c.name).join(', ')}`)
  }

  if (stats.maxDepth > 5) {
    recs.push(`Max call depth is ${stats.maxDepth} — deep abstraction layers may be hard to follow`)
  }

  if (stats.graphDensity > 0.3) {
    recs.push(`High graph density (${(stats.graphDensity * 100).toFixed(1)}%) — functions are tightly coupled`)
  }

  if (stats.entryPointCount === 0 && stats.totalFunctions > 0) {
    recs.push('No entry points detected — consider exporting key functions')
  }

  if (recs.length === 0) {
    recs.push('Call graph looks healthy — good separation of concerns.')
  }

  return recs
}

// ─── buildSymgraphResult ──────────────────────────────────────────────────────

/**
 * Orchestrate full call graph analysis.
 *
 * @example
 * buildSymgraphResult(['a.ts'], ['code...']) // SymgraphResult
 */
export function buildSymgraphResult(
  files: string[],
  contents: string[],
  options?: SymgraphOptions,
): SymgraphResult {
  const maxDepth = options?.depth ?? 3

  const graph = buildCallGraph(files, contents)
  const entryPoints = findEntryPoints(graph)
  const centralNodes = findCentralNodes(graph)
  const leafNodes = findLeafNodes(graph)
  const orphans = findOrphans(graph)
  const longestChains = findLongestChains(graph, maxDepth)

  assignDepths(graph, entryPoints)

  const totalFunctions = graph.nodes.size
  const totalEdges = graph.edges.length
  const averageCallsPerFunction = totalFunctions > 0
    ? Math.round((totalEdges / totalFunctions) * 10) / 10
    : 0
  const maxCallDepth = Math.max(0, ...[...graph.nodes.values()].map((n) => n.depth).filter((d) => d >= 0))
  const graphDensity = computeGraphDensity(graph)

  const stats: SymgraphStats = {
    totalFunctions,
    totalEdges,
    averageCallsPerFunction,
    maxDepth: maxCallDepth,
    entryPointCount: entryPoints.length,
    centralCount: centralNodes.length,
    leafCount: leafNodes.length,
    orphanCount: orphans.length,
    graphDensity,
  }

  const recommendations = generateRecommendations(orphans, centralNodes, stats)

  return {
    graph,
    entryPoints,
    centralNodes,
    leafNodes,
    orphans,
    longestChains,
    stats,
    recommendations,
  }
}
