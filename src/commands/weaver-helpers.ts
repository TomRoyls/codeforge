// ─── Types ────────────────────────────────────────────────────────────────────

export type ThreadType = 'dynamic-import' | 'import' | 're-export' | 'type-import'

export interface Thread {
  from: string
  to: string
  type: ThreadType
  strength: number
  isTypeOnly: boolean
}

export interface WeavePattern {
  name: string
  files: string[]
  density: number
  health: number
  description: string
}

export type KnotType = 'complex' | 'simple'
export type KnotSeverity = 'high' | 'low' | 'medium'

export interface Knot {
  files: string[]
  type: KnotType
  severity: KnotSeverity
  threads: Thread[]
}

export type FileRole = 'bridge' | 'core' | 'leaf' | 'orphan' | 'utility'

export interface FabricScore {
  file: string
  incomingThreads: number
  outgoingThreads: number
  density: number
  textureScore: number
  role: FileRole
}

export interface WeaverStats {
  totalThreads: number
  avgThreadStrength: number
  patternCount: number
  tightWeaveCount: number
  looseWeaveCount: number
  knotCount: number
  simpleKnotCount: number
  complexKnotCount: number
  overallDensity: number
  overallHealth: number
  mostConnectedFile: string
  leastConnectedFile: string
  avgTextureScore: number
}

export interface WeaverResult {
  threads: Thread[]
  patterns: WeavePattern[]
  knots: Knot[]
  fabric: FabricScore[]
  stats: WeaverStats
  recommendations: string[]
}

export interface WeaverOptions {
  verbose?: boolean
}

// ─── Thread Extraction ────────────────────────────────────────────────────────

/**
 * Extract all import threads from files.
 *
 * @example
 * extractThreads(files, contents)
 */
export function extractThreads(files: string[], contents: string[]): Thread[] {
  const threads: Thread[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const lines = content.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) continue

      const esmImport = trimmed.match(/^import\s+(?:type\s+)?(?:\{([^}]+)\}|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"]/)

      if (esmImport) {
        const isTypeOnly = trimmed.startsWith('import type')
        const specifier = resolveImport(esmImport[2]!, file, files)
        if (specifier) {
          const namedImports = esmImport[1]
          const count = namedImports ? namedImports.split(',').length : 1
          threads.push({
            from: file,
            to: specifier,
            type: isTypeOnly ? 'type-import' : 'import',
            strength: computeThreadStrength(count, false),
            isTypeOnly,
          })
        }
        continue
      }

      const defaultImport = trimmed.match(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/)
      if (defaultImport) {
        const specifier = resolveImport(defaultImport[2]!, file, files)
        if (specifier) {
          threads.push({
            from: file,
            to: specifier,
            type: 'import',
            strength: computeThreadStrength(1, false),
            isTypeOnly: false,
          })
        }
        continue
      }

      const reExport = trimmed.match(/^export\s+(?:\{[^}]*\}|\*)\s+from\s+['"]([^'"]+)['"]/)
      if (reExport) {
        const specifier = resolveImport(reExport[1] ?? '', file, files)
        if (specifier) {
          threads.push({
            from: file,
            to: specifier,
            type: 're-export',
            strength: computeThreadStrength(1, true),
            isTypeOnly: false,
          })
        }
        continue
      }

      const dynamicImports = [...trimmed.matchAll(/import\(['"]([^'"]+)['"]\)/g)]
      for (const di of dynamicImports) {
        const specifier = resolveImport(di[1] ?? '', file, files)
        if (specifier) {
          threads.push({
            from: file,
            to: specifier,
            type: 'dynamic-import',
            strength: computeThreadStrength(1, false),
            isTypeOnly: false,
          })
        }
      }
    }
  }

  return threads
}

/**
 * Compute thread strength from import count.
 *
 * @example
 * computeThreadStrength(3, false)
 */
export function computeThreadStrength(importCount: number, isReExport: boolean): number {
  let strength = 1
  if (importCount >= 7) strength = 8
  else if (importCount >= 4) strength = 5
  else if (importCount >= 2) strength = 3

  if (isReExport) strength = Math.min(10, strength + 2)

  return strength
}

/**
 * Resolve import path to a known file.
 *
 * @example
 * resolveImport('./helpers', 'src/commands/count.ts', files)
 */
export function resolveImport(importPath: string, fromFile: string, knownFiles: string[]): string | null {
  if (!importPath.startsWith('.')) return null

  const dir = fromFile.includes('/') ? fromFile.substring(0, fromFile.lastIndexOf('/')) : ''
  let resolved = dir ? `${dir}/${importPath}` : importPath

  resolved = resolved.replace(/^\.\//, '').replace(/\/\.\//g, '/').replace(/\/[^/]+\/\.\.\//g, '/')

  for (const known of knownFiles) {
    const withoutExt = known.replace(/\.\w+$/, '')
    if (withoutExt === resolved || known === resolved + '.ts' || known === resolved + '.js') {
      return known
    }
  }

  return null
}

// ─── Weave Pattern Detection ──────────────────────────────────────────────────

/**
 * Detect weave patterns in the dependency graph.
 *
 * @example
 * detectWeavePatterns(threads, files)
 */
export function detectWeavePatterns(threads: Thread[], files: string[]): WeavePattern[] {
  const patterns: WeavePattern[] = []

  if (files.length === 0) return patterns

  const adjacency = buildAdjacency(threads, files)
  const density = computeDensity(threads, files)

  if (density > 0.5) {
    patterns.push({
      name: 'tight',
      files: files.filter((f) => getThreadCount(f, threads) > 2),
      density,
      health: Math.max(0, 100 - density * 30),
      description: 'Densely interconnected modules with many cross-dependencies',
    })
  }

  if (density < 0.2 && files.length > 1) {
    patterns.push({
      name: 'loose',
      files: files.filter((f) => getThreadCount(f, threads) <= 1),
      density,
      health: Math.min(100, 80 + (1 - density) * 20),
      description: 'Loosely connected modules with minimal dependencies',
    })
  }

  const knots = detectKnots(threads)
  if (knots.length > 0) {
    patterns.push({
      name: 'tangled',
      files: knots.flatMap((k) => k.files),
      density,
      health: Math.max(0, 60 - knots.length * 15),
      description: `Contains ${knots.length} circular dependency cycle(s)`,
    })
  }

  const incomingPerFile = new Map<string, number>()
  for (const t of threads) {
    incomingPerFile.set(t.to, (incomingPerFile.get(t.to) ?? 0) + 1)
  }
  const hubs = [...incomingPerFile.entries()].filter(([, c]) => c >= 3).map(([f]) => f)
  if (hubs.length > 0 && hubs.length <= files.length / 2) {
    patterns.push({
      name: 'hub-spoke',
      files: hubs,
      density,
      health: 75,
      description: `Central hub file(s) with ${hubs.length} dependents`,
    })
  }

  const layers = detectLayers(adjacency, files)
  if (layers && layers.length >= 3) {
    patterns.push({
      name: 'layered',
      files,
      density,
      health: 90,
      description: `Clear layered architecture with ${layers.length} layers`,
    })
  }

  return patterns
}

/**
 * Build adjacency map from threads.
 *
 * @example
 * buildAdjacency(threads, files)
 */
export function buildAdjacency(threads: Thread[], files: string[]): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>()
  for (const f of files) adj.set(f, new Set())
  for (const t of threads) {
    const set = adj.get(t.from)
    if (set) set.add(t.to)
  }
  return adj
}

/**
 * Compute overall density.
 *
 * @example
 * computeDensity(threads, files)
 */
export function computeDensity(threads: Thread[], files: string[]): number {
  const n = files.length
  if (n <= 1) return 0
  const maxEdges = n * (n - 1)
  const uniqueEdges = new Set(threads.map((t) => `${t.from}->${t.to}`))
  return Math.round((uniqueEdges.size / maxEdges) * 100) / 100
}

/**
 * Get thread count for a file.
 *
 * @example
 * getThreadCount('a.ts', threads)
 */
export function getThreadCount(file: string, threads: Thread[]): number {
  let count = 0
  for (const t of threads) {
    if (t.from === file || t.to === file) count++
  }
  return count
}

/**
 * Detect layer structure.
 *
 * @example
 * detectLayers(adjacency, files)
 */
export function detectLayers(adjacency: Map<string, Set<string>>, files: string[]): string[][] | null {
  const inDegree = new Map<string, number>()
  for (const f of files) inDegree.set(f, 0)
  for (const [, deps] of adjacency) {
    for (const dep of deps) {
      if (inDegree.has(dep)) inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1)
    }
  }

  const layers: string[][] = []
  const remaining = new Set(files)

  while (remaining.size > 0) {
    const layer: string[] = []
    for (const f of remaining) {
      const deps = adjacency.get(f)
      if (!deps) continue
      let allOutside = true
      for (const d of deps) {
        if (remaining.has(d) && d !== f) {
          allOutside = false
          break
        }
      }
      if (allOutside || deps.size === 0) layer.push(f)
    }

    if (layer.length === 0) return null
    layers.push(layer)
    for (const f of layer) remaining.delete(f)
  }

  return layers.length >= 2 ? layers : null
}

// ─── Knot Detection ───────────────────────────────────────────────────────────

/**
 * Detect circular dependencies (knots).
 *
 * @example
 * detectKnots(threads)
 */
export function detectKnots(threads: Thread[]): Knot[] {
  const adj = new Map<string, Set<string>>()
  for (const t of threads) {
    let set = adj.get(t.from)
    if (!set) { set = new Set(); adj.set(t.from, set) }
    set.add(t.to)
  }

  const visited = new Set<string>()
  const recStack = new Set<string>()
  const cycles: string[][] = []

  function dfs(node: string, path: string[]): void {
    visited.add(node)
    recStack.add(node)

    const neighbors = adj.get(node)
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path, neighbor])
        } else if (recStack.has(neighbor)) {
          const cycleStart = path.indexOf(neighbor)
          if (cycleStart >= 0) {
            cycles.push(path.slice(cycleStart))
          }
        }
      }
    }

    recStack.delete(node)
  }

  for (const node of adj.keys()) {
    if (!visited.has(node)) dfs(node, [node])
  }

  const seen = new Set<string>()
  const knots: Knot[] = []

  for (const cycle of cycles) {
    const key = [...cycle].sort().join('|')
    if (seen.has(key)) continue
    seen.add(key)

    const cycleThreads: Thread[] = []
    for (let i = 0; i < cycle.length; i++) {
      const from = cycle[i]!
      const to = cycle[(i + 1) % cycle.length]!
      const thread = threads.find((t) => t.from === from && t.to === to)
      if (thread) cycleThreads.push(thread)
    }

    const knotType: KnotType = cycle.length === 2 ? 'simple' : 'complex'
    const severity: KnotSeverity = cycle.length >= 4 ? 'high' : cycle.length >= 3 ? 'medium' : 'low'

    knots.push({
      files: cycle,
      type: knotType,
      severity,
      threads: cycleThreads,
    })
  }

  return knots
}

// ─── Fabric Score ─────────────────────────────────────────────────────────────

/**
 * Compute fabric scores for all files.
 *
 * @example
 * computeFabricScores(files, threads)
 */
export function computeFabricScores(files: string[], threads: Thread[]): FabricScore[] {
  return files.map((file) => computeFabricScore(file, threads, files))
}

/**
 * Compute fabric score for a single file.
 *
 * @example
 * computeFabricScore('a.ts', threads, files)
 */
export function computeFabricScore(file: string, threads: Thread[], allFiles: string[]): FabricScore {
  const incoming = threads.filter((t) => t.to === file).length
  const outgoing = threads.filter((t) => t.from === file).length
  const total = incoming + outgoing

  const n = allFiles.length
  const maxPossible = Math.max(1, (n - 1) * 2)
  const density = Math.round((total / maxPossible) * 100) / 100

  let textureScore = 50
  if (total === 0) textureScore = 10
  else if (total === 1) textureScore = 40
  else if (total <= 3) textureScore = 70
  else if (total <= 6) textureScore = 85
  else if (total <= 10) textureScore = 75
  else textureScore = 50

  const balance = Math.abs(incoming - outgoing)
  if (balance <= 1 && total > 1) textureScore = Math.min(100, textureScore + 10)

  if (total > 15) textureScore = Math.max(0, textureScore - 20)

  textureScore = Math.max(0, Math.min(100, textureScore))

  const role = determineRole(file, threads)

  return { file, incomingThreads: incoming, outgoingThreads: outgoing, density, textureScore, role }
}

/**
 * Determine the role of a file.
 *
 * @example
 * determineRole('a.ts', threads)
 */
export function determineRole(file: string, threads: Thread[]): FileRole {
  const incoming = threads.filter((t) => t.to === file).length
  const outgoing = threads.filter((t) => t.from === file).length

  if (incoming === 0 && outgoing === 0) return 'orphan'
  if (incoming >= 3) return 'core'
  if (incoming >= 1 && outgoing >= 1) return 'bridge'
  if (outgoing >= 1 && incoming === 0) return 'leaf'
  return 'utility'
}

// ─── Overall Health ───────────────────────────────────────────────────────────

/**
 * Compute overall health score.
 *
 * @example
 * computeOverallHealth(patterns, knots, fabric)
 */
export function computeOverallHealth(patterns: WeavePattern[], knots: Knot[], fabric: FabricScore[]): number {
  let health = 80

  const tangled = patterns.find((p) => p.name === 'tangled')
  if (tangled) health -= 15

  health -= knots.length * 10

  const orphans = fabric.filter((f) => f.role === 'orphan').length
  health -= orphans * 5

  const avgTexture = fabric.length > 0 ? fabric.reduce((s, f) => s + f.textureScore, 0) / fabric.length : 50
  health = health * 0.6 + avgTexture * 0.4

  return Math.max(0, Math.min(100, Math.round(health)))
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate recommendations.
 *
 * @example
 * generateRecommendations(patterns, knots, fabric, stats)
 */
export function generateRecommendations(
  patterns: WeavePattern[],
  knots: Knot[],
  fabric: FabricScore[],
  _stats: WeaverStats,
): string[] {
  const recs: string[] = []

  if (knots.length > 0) {
    const simple = knots.filter((k) => k.type === 'simple').length
    const complex = knots.filter((k) => k.type === 'complex').length
    if (complex > 0) recs.push(`Untangle ${complex} complex circular dependencies — these cause maintenance headaches`)
    if (simple > 0) recs.push(`Break ${simple} simple circular dependencies by extracting shared logic`)
  }

  const tight = patterns.find((p) => p.name === 'tight')
  if (tight && tight.files.length > 0) {
    recs.push('Consider decoupling tightly woven modules for better maintainability')
  }

  const orphans = fabric.filter((f) => f.role === 'orphan')
  if (orphans.length > 0) {
    recs.push(`${orphans.length} orphan file(s) have no connections — connect them or document why standalone`)
  }

  const hubSpoke = patterns.find((p) => p.name === 'hub-spoke')
  if (hubSpoke) {
    recs.push('Hub-spoke pattern detected — ensure hub files are not overloaded with responsibilities')
  }

  const lowTexture = fabric.filter((f) => f.textureScore < 40)
  if (lowTexture.length > 0) {
    recs.push(`${lowTexture.length} file(s) have low texture scores — review their integration`)
  }

  if (recs.length === 0) {
    recs.push('The weave is healthy — dependencies are well-structured and balanced')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete weaver result.
 *
 * @example
 * buildWeaverResult(files, contents)
 */
export function buildWeaverResult(
  files: string[],
  contents: string[],
  _options?: WeaverOptions,
): WeaverResult {
  const threads = extractThreads(files, contents)
  const patterns = detectWeavePatterns(threads, files)
  const knots = detectKnots(threads)
  const fabric = computeFabricScores(files, threads)
  const overallHealth = computeOverallHealth(patterns, knots, fabric)

  const totalStrength = threads.reduce((s, t) => s + t.strength, 0)
  const avgStrength = threads.length > 0 ? Math.round((totalStrength / threads.length) * 10) / 10 : 0
  const overallDensity = computeDensity(threads, files)
  const avgTexture = fabric.length > 0 ? Math.round(fabric.reduce((s, f) => s + f.textureScore, 0) / fabric.length * 10) / 10 : 0

  const connectedCounts = fabric.map((f) => f.incomingThreads + f.outgoingThreads)
  const mostIdx = connectedCounts.indexOf(Math.max(...connectedCounts))
  const leastIdx = connectedCounts.indexOf(Math.min(...connectedCounts))

  const stats: WeaverStats = {
    totalThreads: threads.length,
    avgThreadStrength: avgStrength,
    patternCount: patterns.length,
    tightWeaveCount: patterns.filter((p) => p.name === 'tight').length,
    looseWeaveCount: patterns.filter((p) => p.name === 'loose').length,
    knotCount: knots.length,
    simpleKnotCount: knots.filter((k) => k.type === 'simple').length,
    complexKnotCount: knots.filter((k) => k.type === 'complex').length,
    overallDensity,
    overallHealth,
    mostConnectedFile: fabric[mostIdx]?.file ?? '',
    leastConnectedFile: fabric[leastIdx]?.file ?? '',
    avgTextureScore: avgTexture,
  }

  const recommendations = generateRecommendations(patterns, knots, fabric, stats)

  return { threads, patterns, knots, fabric, stats, recommendations }
}
