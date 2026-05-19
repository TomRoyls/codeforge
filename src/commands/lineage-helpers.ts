// ─── Types ────────────────────────────────────────────────────────────────────

export type LineageNodeType = 'function' | 'class' | 'interface' | 'type' | 'constant'

export interface LineageNode {
  name: string
  file: string
  line: number
  type: LineageNodeType
  ancestors: string[]
  descendants: string[]
  depth: number
  breadth: number
  criticality: number
}

export interface LineagePath {
  from: string
  to: string
  chain: string[]
  length: number
  files: string[]
  isCritical: boolean
}

export interface LineageCluster {
  root: string
  descendants: string[]
  depth: number
  breadth: number
  description: string
}

export interface LineageStats {
  totalNodes: number
  totalPaths: number
  maxDepth: number
  maxBreadth: number
  averageDepth: number
  criticalNodes: number
  fragileNodes: number
  orphanNodes: number
}

export interface LineageResult {
  nodes: LineageNode[]
  paths: LineagePath[]
  clusters: LineageCluster[]
  stats: LineageStats
  criticalPaths: LineagePath[]
  fragileNodes: LineageNode[]
  recommendations: string[]
}

export interface LineageOptions {
  verbose?: boolean
}

export interface GraphEdge {
  from: string
  to: string
  file: string
}

export interface LineageGraph {
  nodes: Map<string, { name: string; file: string; line: number; type: LineageNodeType }>
  edges: GraphEdge[]
  adjacency: Map<string, Set<string>>
  reverse: Map<string, Set<string>>
}

// ─── buildLineageGraph ────────────────────────────────────────────────────────

const FUNC_RE = /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[^=])\s*=>|(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?function|(?:export\s+)?class\s+(\w+)|(?:export\s+)?interface\s+(\w+)|(?:export\s+)?type\s+(\w+)\s*[=<]/
const IMPORT_RE = /import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/
const CALL_RE = /(?<!\w)(\w+)\s*\(/
const KEYWORDS = new Set(['if','else','for','while','do','switch','case','return','try','catch','finally','throw','new','typeof','instanceof','void','delete','in','of','async','await','yield','import','export','const','let','var','function','class','extends','super','this','true','false','null','undefined','console','Math','JSON','Object','Array','String','Number','Boolean','Promise','Error','Map','Set','Symbol','RegExp','Date','parseInt','parseFloat','isNaN','isFinite','NaN','Infinity','require'])

/**
 * Build a directed lineage graph from source files.
 *
 * @example
 * buildLineageGraph(['a.ts'], ['import { foo } from "b"; function bar() { foo() }'])
 */
export function buildLineageGraph(files: string[], contents: string[]): LineageGraph {
  const nodeMap = new Map<string, { name: string; file: string; line: number; type: LineageNodeType }>()
  const adjacency = new Map<string, Set<string>>()
  const reverse = new Map<string, Set<string>>()
  const edges: GraphEdge[] = []

  for (let fi = 0; fi < files.length; fi++) {
    const content = contents[fi] ?? ''
    const file = files[fi] ?? ''
    const lines = content.split('\n')

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li]
      if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) continue
      if (/^\s*import\s/.test(line)) continue

      const m = line.match(FUNC_RE)
      if (m) {
        const name = m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5] ?? m[6]
        if (name) {
          let type: LineageNodeType = 'function'
          if (m[4]) type = 'class'
          else if (m[5]) type = 'interface'
          else if (m[6]) type = 'type'
          else if (m[2] || m[3]) type = 'constant'

          const key = `${file}:${name}`
          nodeMap.set(key, { name, file, line: li + 1, type })
          if (!adjacency.has(key)) adjacency.set(key, new Set())
          if (!reverse.has(key)) reverse.set(key, new Set())
        }
      }
    }
  }

  const nameToFile = new Map<string, string>()
  for (const [key, node] of nodeMap) {
    nameToFile.set(node.name, key)
  }

  for (let fi = 0; fi < files.length; fi++) {
    const content = contents[fi] ?? ''
    const file = files[fi] ?? ''

    const localFunctions = new Set<string>()
    for (const [key, node] of nodeMap) {
      if (node.file === file) localFunctions.add(node.name)
    }

    const lines = content.split('\n')
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li]
      if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) continue

      const funcMatch = line.match(FUNC_RE)
      if (!funcMatch) continue

      const fnName = funcMatch[1] ?? funcMatch[2] ?? funcMatch[3] ?? funcMatch[4] ?? funcMatch[5] ?? funcMatch[6]
      if (!fnName) continue
      const sourceKey = `${file}:${fnName}`

      let bodyEnd = li + 1
      let braceDepth = 0
      let started = false
      for (let j = li; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') { braceDepth++; started = true }
          if (ch === '}') braceDepth--
        }
        if (started && braceDepth <= 0) { bodyEnd = j + 1; break }
      }

      const body = lines.slice(li, bodyEnd).join('\n')
      const calls = extractCallNames(body)

      for (const call of calls) {
        if (call === fnName) continue
        const targetKey = nameToFile.get(call)
        if (targetKey && targetKey !== sourceKey) {
          if (!adjacency.has(sourceKey)) adjacency.set(sourceKey, new Set())
          adjacency.get(sourceKey)!.add(targetKey)
          if (!reverse.has(targetKey)) reverse.set(targetKey, new Set())
          reverse.get(targetKey)!.add(sourceKey)
          edges.push({ from: sourceKey, to: targetKey, file })
        }
      }
    }
  }

  return { nodes: nodeMap, edges, adjacency, reverse }
}

function extractCallNames(body: string): string[] {
  const calls = new Set<string>()
  let match: RegExpExecArray | null
  const regex = new RegExp(CALL_RE.source, 'g')
  while ((match = regex.exec(body)) !== null) {
    const name = match[1]
    if (name && !KEYWORDS.has(name) && !/^[A-Z]/.test(name)) {
      calls.add(name)
    }
  }
  return [...calls]
}

// ─── computeAncestors ─────────────────────────────────────────────────────────

/**
 * Trace ancestor chain upward via BFS.
 *
 * @example
 * computeAncestors('a.ts:foo', graph)
 * // => ['b.ts:bar', 'c.ts:baz']
 */
export function computeAncestors(key: string, graph: LineageGraph): string[] {
  const visited = new Set<string>()
  const queue = [key]
  visited.add(key)

  while (queue.length > 0) {
    const current = queue.shift()!
    const deps = graph.adjacency.get(current)
    if (deps) {
      for (const dep of deps) {
        if (!visited.has(dep)) {
          visited.add(dep)
          queue.push(dep)
        }
      }
    }
  }

  visited.delete(key)
  return [...visited]
}

// ─── computeDescendants ────────────────────────────────────────────────────────

/**
 * Trace descendant chain downward via BFS.
 *
 * @example
 * computeDescendants('a.ts:foo', graph)
 * // => ['b.ts:bar', 'c.ts:baz']
 */
export function computeDescendants(key: string, graph: LineageGraph): string[] {
  const visited = new Set<string>()
  const queue = [key]
  visited.add(key)

  while (queue.length > 0) {
    const current = queue.shift()!
    const rev = graph.reverse.get(current)
    if (rev) {
      for (const dep of rev) {
        if (!visited.has(dep)) {
          visited.add(dep)
          queue.push(dep)
        }
      }
    }
  }

  visited.delete(key)
  return [...visited]
}

// ─── computeDepth ─────────────────────────────────────────────────────────────

/**
 * Compute max depth of ancestor chain using DFS.
 *
 * @example
 * computeDepth('a.ts:foo', graph)
 * // => 3
 */
export function computeDepth(key: string, graph: LineageGraph): number {
  const memo = new Map<string, number>()

  function dfs(node: string, visiting: Set<string>): number {
    if (memo.has(node)) return memo.get(node)!
    if (visiting.has(node)) return 0

    visiting.add(node)
    const deps = graph.adjacency.get(node)
    let maxChild = 0
    if (deps) {
      for (const dep of deps) {
        maxChild = Math.max(maxChild, dfs(dep, visiting))
      }
    }
    visiting.delete(node)
    const result = maxChild + 1
    memo.set(node, result)
    return result
  }

  return dfs(key, new Set()) - 1
}

// ─── computeBreadth ───────────────────────────────────────────────────────────

/**
 * Compute total descendant count (breadth).
 *
 * @example
 * computeBreadth('a.ts:foo', graph)
 * // => 5
 */
export function computeBreadth(key: string, graph: LineageGraph): number {
  return computeDescendants(key, graph).length
}

// ─── computeCriticality ───────────────────────────────────────────────────────

/**
 * Compute criticality score 0-100 based on breadth and depth.
 *
 * @example
 * computeCriticality(10, 3)
 * // => 100
 */
export function computeCriticality(breadth: number, depth: number): number {
  const breadthScore = Math.min(breadth * 10, 50)
  const depthScore = Math.min(depth * 10, 50)
  return Math.min(breadthScore + depthScore, 100)
}

// ─── findLineagePaths ─────────────────────────────────────────────────────────

/**
 * Find all paths from root nodes (no ancestors) to leaf nodes (no descendants).
 *
 * @example
 * findLineagePaths(graph)
 */
export function findLineagePaths(graph: LineageGraph): LineagePath[] {
  const paths: LineagePath[] = []
  const allKeys = new Set(graph.nodes.keys())

  const tops: string[] = []
  for (const key of allKeys) {
    const rev = graph.reverse.get(key)
    if (!rev || rev.size === 0) tops.push(key)
  }

  function dfs(current: string, chain: string[], files: string[]) {
    chain.push(current)
    const node = graph.nodes.get(current)
    if (node) files.push(node.file)

    const deps = graph.adjacency.get(current)
    if (!deps || deps.size === 0) {
      if (chain.length > 1) {
        paths.push({
          from: chain[0],
          to: chain[chain.length - 1],
          chain: [...chain],
          length: chain.length - 1,
          files: [...files],
          isCritical: chain.length > 3,
        })
      }
    } else {
      for (const dep of deps) {
        dfs(dep, chain, files)
      }
    }

    chain.pop()
    files.pop()
  }

  for (const top of tops) {
    dfs(top, [], [])
  }

  return paths
}

// ─── findCriticalPaths ────────────────────────────────────────────────────────

/**
 * Filter paths that are critical (long or touch core modules).
 *
 * @example
 * findCriticalPaths(paths)
 */
export function findCriticalPaths(paths: LineagePath[]): LineagePath[] {
  return paths.filter((p) => p.isCritical || p.length >= 3).sort((a, b) => b.length - a.length)
}

// ─── findFragileNodes ─────────────────────────────────────────────────────────

/**
 * Find nodes that are sole ancestors to many descendants.
 *
 * @example
 * findFragileNodes(nodes, graph)
 */
export function findFragileNodes(nodes: LineageNode[], graph: LineageGraph): LineageNode[] {
  return nodes.filter((node) => {
    const key = `${node.file}:${node.name}`
    const rev = graph.reverse.get(key)
    const directDependents = rev ? rev.size : 0
    if (directDependents < 3) return false

    const deps = graph.adjacency.get(key)
    return !deps || deps.size <= 1
  })
}

// ─── findLineageClusters ──────────────────────────────────────────────────────

/**
 * Group nodes by common root ancestors.
 *
 * @example
 * findLineageClusters(nodes, graph)
 */
export function findLineageClusters(nodes: LineageNode[], graph: LineageGraph): LineageCluster[] {
  const clusters: LineageCluster[] = []
  const processed = new Set<string>()

  const roots = nodes.filter((n) => n.ancestors.length === 0)
  for (const root of roots) {
    const rootKey = `${root.file}:${root.name}`
    if (processed.has(rootKey)) continue
    processed.add(rootKey)

    const desc = computeDescendants(rootKey, graph)
    if (desc.length === 0) continue

    clusters.push({
      root: root.name,
      descendants: desc.map((d) => d.split(':').pop()!),
      depth: computeDepth(rootKey, graph),
      breadth: desc.length,
      description: `${root.name} lineage: ${desc.length} descendant(s)`,
    })
  }

  return clusters.sort((a, b) => b.breadth - a.breadth)
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate recommendations based on lineage analysis.
 *
 * @example
 * generateRecommendations(criticalPaths, fragileNodes, stats)
 */
export function generateRecommendations(
  criticalPaths: LineagePath[],
  fragileNodes: LineageNode[],
  stats: LineageStats,
): string[] {
  const recs: string[] = []

  if (criticalPaths.length > 0) {
    const longest = criticalPaths[0]
    recs.push(`Longest lineage chain is ${longest.length} levels deep — consider introducing abstraction layers`)
  }

  if (fragileNodes.length > 0) {
    recs.push(`${fragileNodes.length} fragile node(s) with many dependents — add fallbacks or interfaces`)
  }

  if (stats.maxDepth > 5) {
    recs.push(`Max dependency depth is ${stats.maxDepth} — simplify deep chains`)
  }

  if (stats.orphanNodes > stats.totalNodes * 0.3) {
    recs.push(`${stats.orphanNodes} orphan nodes with no lineage — verify they are needed`)
  }

  if (stats.criticalNodes > 0) {
    recs.push(`${stats.criticalNodes} critical node(s) — ensure these are well-tested`)
  }

  if (recs.length === 0) {
    recs.push('Lineage graph looks healthy — good dependency structure')
  }

  return recs
}

// ─── buildLineageResult ───────────────────────────────────────────────────────

/**
 * Build the complete lineage analysis result.
 *
 * @example
 * buildLineageResult(['a.ts'], ['function foo() { bar() }'])
 */
export function buildLineageResult(
  filePaths: string[],
  contents: string[],
  _options?: LineageOptions,
): LineageResult {
  const graph = buildLineageGraph(filePaths, contents)
  const lineageNodes: LineageNode[] = []

  for (const [key, node] of graph.nodes) {
    const ancestors = computeAncestors(key, graph)
    const descendants = computeDescendants(key, graph)
    const depth = computeDepth(key, graph)
    const breadth = descendants.length
    const criticality = computeCriticality(breadth, depth)

    lineageNodes.push({
      name: node.name,
      file: node.file,
      line: node.line,
      type: node.type,
      ancestors: ancestors.map((a) => a.split(':').pop()!),
      descendants: descendants.map((d) => d.split(':').pop()!),
      depth,
      breadth,
      criticality,
    })
  }

  const paths = findLineagePaths(graph)
  const criticalPaths = findCriticalPaths(paths)
  const fragileNodes = findFragileNodes(lineageNodes, graph)
  const clusters = findLineageClusters(lineageNodes, graph)

  const totalNodes = lineageNodes.length
  const maxDepth = lineageNodes.reduce((m, n) => Math.max(m, n.depth), 0)
  const maxBreadth = lineageNodes.reduce((m, n) => Math.max(m, n.breadth), 0)
  const averageDepth = totalNodes > 0
    ? Math.round(lineageNodes.reduce((s, n) => s + n.depth, 0) / totalNodes * 10) / 10
    : 0
  const criticalNodes = lineageNodes.filter((n) => n.criticality >= 50).length
  const orphanNodes = lineageNodes.filter((n) => n.ancestors.length === 0 && n.descendants.length === 0).length

  const stats: LineageStats = {
    totalNodes,
    totalPaths: paths.length,
    maxDepth,
    maxBreadth,
    averageDepth,
    criticalNodes,
    fragileNodes: fragileNodes.length,
    orphanNodes,
  }

  const recommendations = generateRecommendations(criticalPaths, fragileNodes, stats)

  return {
    nodes: lineageNodes,
    paths,
    clusters,
    stats,
    criticalPaths,
    fragileNodes,
    recommendations,
  }
}
