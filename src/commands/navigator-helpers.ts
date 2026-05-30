// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavigationNode {
  file: string
  imports: number
  importedBy: number
  depth: number
  isEntryPoint: boolean
  isDeadEnd: boolean
  isHighway: boolean
  isIsland: boolean
}

export interface NavigationPath {
  from: string
  to: string
  hops: number
  files: string[]
  difficulty: number
}

export interface WayfindingScore {
  file: string
  score: number
  issues: string[]
}

export interface NavigationMap {
  nodes: NavigationNode[]
  paths: NavigationPath[]
  entryPoints: string[]
  deadEnds: string[]
  highways: string[]
  islands: string[]
}

export interface NavigatorStats {
  totalNodes: number
  avgConnectivity: number
  maxDepth: number
  avgDepth: number
  entryPointCount: number
  deadEndCount: number
  highwayCount: number
  islandCount: number
  navigationComplexity: number
  averageWayfinding: number
  hardestToReach: string
  easiestToReach: string
}

export interface NavigatorResult {
  map: NavigationMap
  wayfinding: WayfindingScore[]
  stats: NavigatorStats
  recommendations: string[]
}

export interface NavigatorOptions {
  verbose?: boolean
}

// ─── Import Extraction ────────────────────────────────────────────────────────

/**
 * Extract import targets from file content.
 *
 * @example
 * extractImports(content)
 */
export function extractImports(content: string): string[] {
  const imports: string[] = []

  // ESM imports: import ... from './path' or import ... from '../path'
  const esmMatches = content.matchAll(/from\s+['"](\.[^'"]+)['"]/g)
  for (const match of esmMatches) {
    imports.push(normalizeImportPath(match[1] ?? ''))
  }

  // Re-exports: export ... from './path'
  const reExportMatches = content.matchAll(/export\s+(?:[\w{}*,\s]+)\s+from\s+['"](\.[^'"]+)['"]/g)
  for (const match of reExportMatches) {
    imports.push(normalizeImportPath(match[1] ?? ''))
  }

  // CommonJS: require('./path')
  const cjsMatches = content.matchAll(/require\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g)
  for (const match of cjsMatches) {
    imports.push(normalizeImportPath(match[1] ?? ''))
  }

  return [...new Set(imports)]
}

/**
 * Normalize an import path (strip extensions).
 *
 * @example
 * normalizeImportPath('./utils.ts')
 */
export function normalizeImportPath(importPath: string): string {
  return importPath.replace(/\.(ts|tsx|js|jsx|mjs|cjs)$/, '')
}

/**
 * Resolve an import path relative to the importing file.
 *
 * @example
 * resolveImportPath('src/commands/count.ts', './count-helpers')
 */
export function resolveImportPath(fromFile: string, importPath: string): string {
  const dir = fromFile.includes('/') ? fromFile.substring(0, fromFile.lastIndexOf('/')) : ''
  const parts = importPath.split('/')
  const resolved: string[] = dir ? dir.split('/') : []

  for (const part of parts) {
    if (part === '..') {
      resolved.pop()
    } else if (part !== '.') {
      resolved.push(part)
    }
  }

  return resolved.join('/')
}

// ─── Adjacency List ───────────────────────────────────────────────────────────

/**
 * Build adjacency list from files and their contents.
 *
 * @example
 * buildAdjacencyList(files, contents)
 */
export function buildAdjacencyList(
  files: string[],
  contents: string[],
): Map<string, string[]> {
  const adj = new Map<string, string[]>()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const rawImports = extractImports(content)

    const resolvedImports: string[] = []
    for (const imp of rawImports) {
      const resolved = resolveImportPath(file, imp)
      // Check if resolved path matches any known file (with or without extension)
      const match = files.find((f) =>
        f === resolved || f === resolved + '.ts' || f === resolved + '.tsx' ||
        f === resolved + '.js' || f === resolved + '/index',
      )
      if (match) {
        resolvedImports.push(match)
      }
    }

    adj.set(file, [...new Set(resolvedImports)])
  }

  return adj
}

/**
 * Build reverse adjacency list (who imports whom).
 *
 * @example
 * buildReverseAdjacency(adjacency)
 */
export function buildReverseAdjacency(adj: Map<string, string[]>): Map<string, string[]> {
  const rev = new Map<string, string[]>()

  for (const [file, imports] of adj) {
    if (!rev.has(file)) rev.set(file, [])
    for (const imp of imports) {
      const list = rev.get(imp)
      if (list) {
        if (!list.includes(file)) list.push(file)
      } else {
        rev.set(imp, [file])
      }
    }
  }

  return rev
}

// ─── Node Classification ─────────────────────────────────────────────────────

const ENTRY_POINT_PATTERNS = [
  /(^|\/)index\.(ts|js)$/,
  /(^|\/)main\.(ts|js)$/,
  /(^|\/)cli\.(ts|js)$/,
  /(^|\/)app\.(ts|js)$/,
  /(^|\/)bin\//,
]

/**
 * Check if a file is an entry point.
 *
 * @example
 * isEntryPointFile('src/index.ts')
 */
export function isEntryPointFile(file: string): boolean {
  return ENTRY_POINT_PATTERNS.some((p) => p.test(file))
}

/**
 * Classify a navigation node.
 *
 * @example
 * classifyNode(file, imports, importedBy)
 */
export function classifyNode(
  file: string,
  imports: number,
  importedBy: number,
): {
  isEntryPoint: boolean
  isDeadEnd: boolean
  isHighway: boolean
  isIsland: boolean
} {
  const totalConnections = imports + importedBy
  const isEntryPoint = isEntryPointFile(file) || (importedBy === 0 && imports > 0)
  const isIsland = imports === 0 && importedBy === 0
  const isHighway = totalConnections > 8
  const isDeadEnd = imports === 0 && importedBy > 0 && !isIsland

  return { isEntryPoint, isDeadEnd, isHighway, isIsland }
}

// ─── Depth Computation ────────────────────────────────────────────────────────

/**
 * Compute node depths using BFS from entry points.
 *
 * @example
 * computeDepths(adj, files, entryPoints)
 */
export function computeDepths(
  adj: Map<string, string[]>,
  files: string[],
  entryPoints: string[],
): Map<string, number> {
  const depths = new Map<string, number>()
  const visited = new Set<string>()

  // Initialize entry points at depth 0
  const queue: Array<{ file: string; depth: number }> = entryPoints.map((f) => ({ file: f, depth: 0 }))

  // For files with no entry points, start from files with no incoming
  if (queue.length === 0) {
    for (const file of files) {
      queue.push({ file, depth: 0 })
    }
  }

  let _qi = 0
  while (_qi < queue.length) {
    const { file, depth } = queue[_qi]!
    _qi++
    if (visited.has(file)) continue
    visited.add(file)

    const existing = depths.get(file)
    if (existing === undefined || depth < existing) {
      depths.set(file, depth)
    }

    const imports = adj.get(file) ?? []
    for (const imp of imports) {
      if (!visited.has(imp)) {
        queue.push({ file: imp, depth: depth + 1 })
      }
    }
  }

  // Assign max depth to unreachable files
  const maxDepth = depths.size > 0 ? Math.max(...depths.values()) : 0
  for (const file of files) {
    if (!depths.has(file)) {
      depths.set(file, maxDepth + 1)
    }
  }

  return depths
}

// ─── Navigation Map ───────────────────────────────────────────────────────────

/**
 * Build the complete navigation map.
 *
 * @example
 * buildNavigationMap(files, contents)
 */
export function buildNavigationMap(files: string[], contents: string[]): NavigationMap {
  const adj = buildAdjacencyList(files, contents)
  const rev = buildReverseAdjacency(adj)

  const nodes: NavigationNode[] = []
  const entryPoints: string[] = []
  const deadEnds: string[] = []
  const highways: string[] = []
  const islands: string[] = []

  // Compute entry points first for depth calculation
  for (const file of files) {
    const imports = adj.get(file)?.length ?? 0
    const importedBy = rev.get(file)?.length ?? 0
    if (isEntryPointFile(file) || (importedBy === 0 && imports > 0)) {
      entryPoints.push(file)
    }
  }

  const depths = computeDepths(adj, files, entryPoints)

  for (const file of files) {
    const imports = adj.get(file)?.length ?? 0
    const importedBy = rev.get(file)?.length ?? 0
    const classification = classifyNode(file, imports, importedBy)
    const depth = depths.get(file) ?? 0

    const node: NavigationNode = {
      file,
      imports,
      importedBy,
      depth,
      ...classification,
    }

    nodes.push(node)

    if (classification.isEntryPoint && !entryPoints.includes(file)) entryPoints.push(file)
    if (classification.isDeadEnd) deadEnds.push(file)
    if (classification.isHighway) highways.push(file)
    if (classification.isIsland) islands.push(file)
  }

  // Compute sample paths between important nodes
  const paths = computeSamplePaths(nodes, adj)

  return {
    nodes,
    paths,
    entryPoints,
    deadEnds,
    highways,
    islands,
  }
}

/**
 * Compute sample navigation paths.
 *
 * @example
 * computeSamplePaths(nodes, adj)
 */
export function computeSamplePaths(
  nodes: NavigationNode[],
  adj: Map<string, string[]>,
): NavigationPath[] {
  const paths: NavigationPath[] = []

  // Find paths from entry points to dead ends
  const entries = nodes.filter((n) => n.isEntryPoint)
  const deadEndNodes = nodes.filter((n) => n.isDeadEnd)

  for (const entry of entries.slice(0, 5)) {
    for (const dead of deadEndNodes.slice(0, 5)) {
      const path = findShortestPath(entry.file, dead.file, adj)
      if (path) {
        paths.push(path)
      }
    }
  }

  return paths
}

// ─── Shortest Path (BFS) ──────────────────────────────────────────────────────

/**
 * Find shortest path between two files using BFS.
 *
 * @example
 * findShortestPath('src/index.ts', 'src/utils.ts', adj)
 */
export function findShortestPath(
  from: string,
  to: string,
  adj: Map<string, string[]>,
): NavigationPath | null {
  if (from === to) {
    return { from, to, hops: 0, files: [], difficulty: 0 }
  }

  const visited = new Set<string>()
  const queue: Array<{ file: string; path: string[] }> = [{ file: from, path: [] }]
  visited.add(from)

  let _qi = 0
  while (_qi < queue.length) {
    const { file, path } = queue[_qi]!
    _qi++
    const imports = adj.get(file) ?? []

    for (const imp of imports) {
      if (imp === to) {
        const fullPath = [...path, imp]
        return {
          from,
          to,
          hops: fullPath.length,
          files: path,
          difficulty: computePathDifficulty(fullPath.length),
        }
      }

      if (!visited.has(imp)) {
        visited.add(imp)
        queue.push({ file: imp, path: [...path, imp] })
      }
    }
  }

  return null
}

/**
 * Compute path difficulty from hop count.
 *
 * @example
 * computePathDifficulty(5)
 */
export function computePathDifficulty(hops: number): number {
  if (hops <= 1) return 5
  if (hops <= 2) return 15
  if (hops <= 3) return 30
  if (hops <= 5) return 50
  if (hops <= 8) return 70
  return Math.min(100, 70 + (hops - 8) * 5)
}

// ─── Wayfinding Score ─────────────────────────────────────────────────────────

/**
 * Compute wayfinding score for a file.
 *
 * @example
 * computeWayfindingScore(file, node, map)
 */
export function computeWayfindingScore(
  file: string,
  node: NavigationNode,
  _map: NavigationMap,
): WayfindingScore {
  let score = 70
  const issues: string[] = []

  // Well-connected bonus
  const totalConnections = node.imports + node.importedBy
  if (totalConnections >= 5) {
    score += Math.min(15, totalConnections * 2)
  }

  // Near entry point bonus
  if (node.depth <= 1) {
    score += 10
  } else if (node.depth <= 2) {
    score += 5
  }

  // Deep nesting penalty
  if (node.depth > 4) {
    score -= 15
    issues.push(`Deep nesting (depth ${node.depth}) makes this file hard to reach`)
  } else if (node.depth > 3) {
    score -= 5
  }

  // Island penalty
  if (node.isIsland) {
    score -= 30
    issues.push('File has no connections — completely isolated')
  }

  // Dead end penalty
  if (node.isDeadEnd) {
    score -= 10
    issues.push('Dead end file — no outgoing imports')
  }

  // Entry point bonus
  if (node.isEntryPoint) {
    score += 5
  }

  // Highway is neutral but could indicate god-module
  if (node.isHighway) {
    issues.push('Highway node — many connections may indicate a god module')
  }

  // Very low connectivity penalty
  if (totalConnections === 1) {
    score -= 5
    issues.push('Single connection — fragile link in the dependency chain')
  }

  return {
    file,
    score: Math.max(0, Math.min(100, score)),
    issues,
  }
}

// ─── Wayfinding All ───────────────────────────────────────────────────────────

/**
 * Compute wayfinding scores for all files.
 *
 * @example
 * computeAllWayfindingScores(map)
 */
export function computeAllWayfindingScores(map: NavigationMap): WayfindingScore[] {
  return map.nodes.map((node) =>
    computeWayfindingScore(node.file, node, map),
  )
}

// ─── Navigation Complexity ────────────────────────────────────────────────────

/**
 * Compute overall navigation complexity (0-100, higher = more complex).
 *
 * @example
 * computeNavigationComplexity(map)
 */
export function computeNavigationComplexity(map: NavigationMap): number {
  if (map.nodes.length === 0) return 0

  let complexity = 30

  // Islands add complexity
  complexity += map.islands.length * 10

  // Dead ends add complexity
  complexity += map.deadEnds.length * 5

  // Deep nodes add complexity
  const deepNodes = map.nodes.filter((n) => n.depth > 3)
  complexity += deepNodes.length * 5

  // Highways indicate potential complexity
  complexity += map.highways.length * 3

  // Large depth range adds complexity
  const maxDepth = Math.max(...map.nodes.map((n) => n.depth))
  if (maxDepth > 5) complexity += 10

  // Normalize to 0-100
  return Math.max(0, Math.min(100, complexity))
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Compute navigator statistics.
 *
 * @example
 * computeNavigatorStats(map, wayfinding)
 */
export function computeNavigatorStats(
  map: NavigationMap,
  wayfinding: WayfindingScore[],
): NavigatorStats {
  const nodes = map.nodes
  const totalNodes = nodes.length

  const totalConnections = nodes.reduce((s, n) => s + n.imports + n.importedBy, 0)
  const avgConnectivity = totalNodes > 0
    ? Math.round((totalConnections / totalNodes) * 10) / 10
    : 0

  const depths = nodes.map((n) => n.depth)
  const maxDepth = depths.length > 0 ? Math.max(...depths) : 0
  const avgDepth = depths.length > 0
    ? Math.round(depths.reduce((s, d) => s + d, 0) / depths.length * 10) / 10
    : 0

  const wfScores = wayfinding.map((w) => w.score)
  const avgWf = wfScores.length > 0
    ? Math.round(wfScores.reduce((s, w) => s + w, 0) / wfScores.length)
    : 0

  const sortedWf = [...wayfinding].sort((a, b) => a.score - b.score)
  const hardestToReach = sortedWf[0]?.file ?? ''
  const easiestToReach = sortedWf[sortedWf.length - 1]?.file ?? ''

  return {
    totalNodes,
    avgConnectivity,
    maxDepth,
    avgDepth,
    entryPointCount: map.entryPoints.length,
    deadEndCount: map.deadEnds.length,
    highwayCount: map.highways.length,
    islandCount: map.islands.length,
    navigationComplexity: computeNavigationComplexity(map),
    averageWayfinding: avgWf,
    hardestToReach,
    easiestToReach,
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate navigator recommendations.
 *
 * @example
 * generateNavigatorRecommendations(map, wayfinding, stats)
 */
export function generateNavigatorRecommendations(
  map: NavigationMap,
  wayfinding: WayfindingScore[],
  stats: NavigatorStats,
): string[] {
  const recs: string[] = []

  if (map.islands.length > 0) {
    recs.push(`${map.islands.length} island file(s) found — connect or remove: ${map.islands.slice(0, 3).join(', ')}`)
  }

  if (map.deadEnds.length > 0) {
    recs.push(`${map.deadEnds.length} dead end file(s) — consider adding re-exports or documentation`)
  }

  if (map.highways.length > 0) {
    recs.push(`${map.highways.length} highway module(s) — consider splitting into focused modules`)
  }

  const deepFiles = map.nodes.filter((n) => n.depth > 4)
  if (deepFiles.length > 0) {
    recs.push(`${deepFiles.length} deeply nested file(s) — flatten the import hierarchy`)
  }

  const lowWf = wayfinding.filter((w) => w.score < 40)
  if (lowWf.length > 0) {
    recs.push(`${lowWf.length} file(s) with low wayfinding scores — improve discoverability`)
  }

  if (stats.navigationComplexity > 60) {
    recs.push(`High navigation complexity (${stats.navigationComplexity}/100) — simplify the dependency graph`)
  }

  if (recs.length === 0) {
    recs.push('Navigation structure looks healthy — codebase is well-connected')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete navigator result.
 *
 * @example
 * buildNavigatorResult(files, contents)
 */
export function buildNavigatorResult(
  files: string[],
  contents: string[],
  _options?: NavigatorOptions,
): NavigatorResult {
  const map = buildNavigationMap(files, contents)
  const wayfinding = computeAllWayfindingScores(map)
  const stats = computeNavigatorStats(map, wayfinding)
  const recommendations = generateNavigatorRecommendations(map, wayfinding, stats)

  return { map, wayfinding, stats, recommendations }
}
