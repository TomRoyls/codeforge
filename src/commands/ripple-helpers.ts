// ─── Types ────────────────────────────────────────────────────────────────────

export type RiskLevel = 'minimal' | 'low' | 'medium' | 'high' | 'critical'
export type EffortLevel = 'trivial' | 'easy' | 'moderate' | 'difficult' | 'major-refactor'

export interface RippleNode {
  file: string
  function: string
  directDependents: number
  transitiveDependents: number
  rippleScore: number
  riskLevel: RiskLevel
  ripplePath: string[]
}

export interface RippleWave {
  level: number
  files: string[]
  totalFiles: number
  description: string
}

export interface RippleSimulation {
  source: string
  sourceFile: string
  waves: RippleWave[]
  totalAffected: number
  maxDepth: number
  rippleScore: number
  estimatedEffort: EffortLevel
  affectedModules: string[]
  testingEffort: string
}

export interface RippleStats {
  totalFiles: number
  averageRippleScore: number
  maxRippleScore: number
  criticalFiles: number
  highRiskFiles: number
  lowRiskFiles: number
  mostIsolatedFile: string
  mostConnectedFile: string
}

export interface RippleResult {
  simulations: RippleSimulation[]
  hotspots: RippleNode[]
  stats: RippleStats
  recommendations: string[]
}

export interface RippleOptions {
  verbose?: boolean
}

export interface FileDepGraph {
  files: Set<string>
  imports: Map<string, Set<string>>
  importedBy: Map<string, Set<string>>
}

// ─── buildDependencyGraph ─────────────────────────────────────────────────────

const IMPORT_RE = /import\s+(?:type\s+)?(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/

/**
 * Build file-level dependency graph from source contents.
 *
 * @example
 * buildDependencyGraph(['a.ts', 'b.ts'], ['import { x } from "./b"', 'export const x = 1'])
 */
export function buildDependencyGraph(files: string[], contents: string[]): FileDepGraph {
  const fileSet = new Set(files)
  const imports = new Map<string, Set<string>>()
  const importedBy = new Map<string, Set<string>>()

  for (const file of files) {
    imports.set(file, new Set())
    importedBy.set(file, new Set())
  }

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const file = files[i] ?? ''
    const lines = content.split('\n')

    for (const line of lines) {
      const match = line.match(IMPORT_RE)
      if (match) {
        const rawTarget = match[1]
        const resolved = resolveImportPath(rawTarget, file, fileSet)
        if (resolved && imports.has(file)) {
          imports.get(file)!.add(resolved)
          if (!importedBy.has(resolved)) {
            importedBy.set(resolved, new Set())
          }
          importedBy.get(resolved)!.add(file)
        }
      }
    }
  }

  return { files: fileSet, imports, importedBy }
}

function resolveImportPath(raw: string, fromFile: string, knownFiles: Set<string>): string | null {
  if (!raw.startsWith('.')) return null

  const fromDir = fromFile.includes('/') ? fromFile.substring(0, fromFile.lastIndexOf('/')) : '.'
  const parts = fromDir === '.' ? raw.split('/') : [...fromDir.split('/'), ...raw.split('/')]
  const normalized: string[] = []
  for (const part of parts) {
    if (part === '..') { normalized.pop(); continue }
    if (part === '.' || part === '') continue
    normalized.push(part)
  }

  const candidates = [
    normalized.join('/'),
    normalized.join('/') + '.ts',
    normalized.join('/') + '.tsx',
    normalized.join('/') + '.js',
    normalized.join('/') + '/index.ts',
  ]

  for (const c of candidates) {
    if (knownFiles.has(c)) return c
  }
  return null
}

// ─── computeRippleWaves ───────────────────────────────────────────────────────

/**
 * BFS outward from source file computing ripple waves.
 *
 * @example
 * computeRippleWaves('a.ts', graph, 5)
 */
export function computeRippleWaves(
  sourceFile: string,
  graph: FileDepGraph,
  maxDepth: number = 10,
): RippleWave[] {
  const waves: RippleWave[] = []
  const visited = new Set<string>([sourceFile])
  let frontier = new Set<string>()

  const direct = graph.importedBy.get(sourceFile)
  if (direct) {
    for (const f of direct) frontier.add(f)
  }

  let level = 1
  while (frontier.size > 0 && level <= maxDepth) {
    const waveFiles = [...frontier].sort()
    waves.push({
      level,
      files: waveFiles,
      totalFiles: waveFiles.length,
      description: `Wave ${level}: ${waveFiles.length} file(s) affected`,
    })

    const nextFrontier = new Set<string>()
    for (const f of frontier) {
      visited.add(f)
      const deps = graph.importedBy.get(f)
      if (deps) {
        for (const dep of deps) {
          if (!visited.has(dep) && !frontier.has(dep)) {
            nextFrontier.add(dep)
          }
        }
      }
    }
    frontier = nextFrontier
    level++
  }

  return waves
}

// ─── computeTransitiveDependents ──────────────────────────────────────────────

/**
 * Compute all files that transitively depend on the given file.
 *
 * @example
 * computeTransitiveDependents('core.ts', graph)
 */
export function computeTransitiveDependents(file: string, graph: FileDepGraph): string[] {
  const visited = new Set<string>()
  const queue = [file]
  visited.add(file)

  while (queue.length > 0) {
    const current = queue.shift()!
    const deps = graph.importedBy.get(current)
    if (deps) {
      for (const dep of deps) {
        if (!visited.has(dep)) {
          visited.add(dep)
          queue.push(dep)
        }
      }
    }
  }

  visited.delete(file)
  return [...visited]
}

// ─── computeRippleScore ───────────────────────────────────────────────────────

/**
 * Normalize ripple score 0-100 based on direct and transitive counts.
 *
 * @example
 * computeRippleScore(5, 20, 10, 50)
 * // => 50
 */
export function computeRippleScore(
  directCount: number,
  transitiveCount: number,
  maxDirect: number,
  maxTransitive: number,
): number {
  const directRatio = maxDirect > 0 ? directCount / maxDirect : 0
  const transitiveRatio = maxTransitive > 0 ? transitiveCount / maxTransitive : 0
  const raw = directRatio * 40 + transitiveRatio * 60
  return Math.min(Math.round(raw), 100)
}

// ─── classifyRisk ─────────────────────────────────────────────────────────────

/**
 * Classify risk level from ripple score.
 *
 * @example
 * classifyRisk(80)
 * // => 'critical'
 */
export function classifyRisk(score: number): RiskLevel {
  if (score >= 75) return 'critical'
  if (score >= 55) return 'high'
  if (score >= 35) return 'medium'
  if (score >= 15) return 'low'
  return 'minimal'
}

// ─── estimateEffort ───────────────────────────────────────────────────────────

/**
 * Estimate change effort from affected count and max depth.
 *
 * @example
 * estimateEffort(3, 1)
 * // => 'trivial'
 */
export function estimateEffort(totalAffected: number, maxDepth: number): EffortLevel {
  const impact = totalAffected + maxDepth * 2
  if (impact >= 20) return 'major-refactor'
  if (impact >= 12) return 'difficult'
  if (impact >= 6) return 'moderate'
  if (impact >= 2) return 'easy'
  return 'trivial'
}

// ─── estimateTestingEffort ────────────────────────────────────────────────────

/**
 * Estimate testing effort from ripple waves.
 *
 * @example
 * estimateTestingEffort(waves)
 */
export function estimateTestingEffort(waves: RippleWave[]): string {
  const totalFiles = waves.reduce((s, w) => s + w.totalFiles, 0)
  const depth = waves.length

  if (totalFiles === 0) return 'No additional testing needed'
  if (totalFiles <= 2 && depth <= 1) return 'Quick smoke tests for 1-2 files'
  if (totalFiles <= 5) return `Test ${totalFiles} files across ${depth} wave(s)`
  if (totalFiles <= 15) return `Thorough testing of ${totalFiles} files across ${depth} wave(s)`
  return `Full regression testing of ${totalFiles} files across ${depth} wave(s) — high risk`
}

// ─── findRippleHotspots ───────────────────────────────────────────────────────

/**
 * Find files with the highest ripple scores.
 *
 * @example
 * findRippleHotspots(graph)
 */
export function findRippleHotspots(graph: FileDepGraph): RippleNode[] {
  const nodes: RippleNode[] = []
  let maxDirect = 0
  let maxTransitive = 0

  const directCounts = new Map<string, number>()
  const transitiveCounts = new Map<string, number>()

  for (const file of graph.files) {
    const direct = graph.importedBy.get(file)?.size ?? 0
    const transitive = computeTransitiveDependents(file, graph).length
    directCounts.set(file, direct)
    transitiveCounts.set(file, transitive)
    maxDirect = Math.max(maxDirect, direct)
    maxTransitive = Math.max(maxTransitive, transitive)
  }

  for (const file of graph.files) {
    const direct = directCounts.get(file) ?? 0
    const transitive = transitiveCounts.get(file) ?? 0
    const score = computeRippleScore(direct, transitive, maxDirect, maxTransitive)
    const risk = classifyRisk(score)
    const path = computeTransitiveDependents(file, graph)

    nodes.push({
      file,
      function: '*',
      directDependents: direct,
      transitiveDependents: transitive,
      rippleScore: score,
      riskLevel: risk,
      ripplePath: path,
    })
  }

  return nodes.sort((a, b) => b.rippleScore - a.rippleScore)
}

// ─── simulateRipple ───────────────────────────────────────────────────────────

/**
 * Run full ripple simulation for a single file.
 *
 * @example
 * simulateRipple('core.ts', graph)
 */
export function simulateRipple(file: string, graph: FileDepGraph): RippleSimulation {
  const waves = computeRippleWaves(file, graph)
  const totalAffected = waves.reduce((s, w) => s + w.totalFiles, 0)
  const maxDepth = waves.length > 0 ? waves.length : 0

  const direct = graph.importedBy.get(file)?.size ?? 0
  const transitive = totalAffected
  let maxDirect = 0
  let maxTransitive = 0
  for (const f of graph.files) {
    maxDirect = Math.max(maxDirect, graph.importedBy.get(f)?.size ?? 0)
    maxTransitive = Math.max(maxTransitive, computeTransitiveDependents(f, graph).length)
  }
  const rippleScore = computeRippleScore(direct, transitive, maxDirect, maxTransitive)
  const estimatedEffort = estimateEffort(totalAffected, maxDepth)
  const affectedModules = [...new Set(waves.flatMap((w) => w.files.map(extractModule)))].sort()
  const testingEffort = estimateTestingEffort(waves)

  return {
    source: file,
    sourceFile: file,
    waves,
    totalAffected,
    maxDepth,
    rippleScore,
    estimatedEffort,
    affectedModules,
    testingEffort,
  }
}

function extractModule(file: string): string {
  const parts = file.split('/')
  return parts.length > 1 ? parts[0] : '.'
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate recommendations based on ripple analysis.
 *
 * @example
 * generateRecommendations(hotspots, stats)
 */
export function generateRecommendations(hotspots: RippleNode[], stats: RippleStats): string[] {
  const recs: string[] = []

  const critical = hotspots.filter((h) => h.riskLevel === 'critical')
  if (critical.length > 0) {
    recs.push(`${critical.length} critical ripple file(s) — changes require careful change management: ${critical.map((c) => c.file).join(', ')}`)
  }

  const highRisk = hotspots.filter((h) => h.riskLevel === 'high')
  if (highRisk.length > 0) {
    recs.push(`Consider decoupling ${highRisk.length} high-risk file(s) to reduce blast radius`)
  }

  const lowRisk = hotspots.filter((h) => h.riskLevel === 'minimal' || h.riskLevel === 'low')
  if (lowRisk.length > 0) {
    recs.push(`${lowRisk.length} file(s) are safe to change freely (low ripple)`)
  }

  if (stats.maxRippleScore > 50) {
    recs.push('Highest ripple score is significant — review core dependency structure')
  }

  if (recs.length === 0) {
    recs.push('All files have minimal ripple — codebase is well-decoupled')
  }

  return recs
}

// ─── buildRippleResult ────────────────────────────────────────────────────────

/**
 * Build the complete ripple analysis result.
 *
 * @example
 * buildRippleResult(['a.ts'], ['import { x } from "./b"'])
 */
export function buildRippleResult(
  filePaths: string[],
  contents: string[],
  _options?: RippleOptions,
): RippleResult {
  const graph = buildDependencyGraph(filePaths, contents)

  const hotspots = findRippleHotspots(graph)

  const simulations: RippleSimulation[] = []
  for (const file of graph.files) {
    simulations.push(simulateRipple(file, graph))
  }

  const totalFiles = graph.files.size
  const scores = hotspots.map((h) => h.rippleScore)
  const averageRippleScore = totalFiles > 0
    ? Math.round(scores.reduce((s, v) => s + v, 0) / totalFiles * 10) / 10
    : 0
  const maxRippleScore = scores.length > 0 ? Math.max(...scores) : 0

  const stats: RippleStats = {
    totalFiles,
    averageRippleScore,
    maxRippleScore,
    criticalFiles: hotspots.filter((h) => h.riskLevel === 'critical').length,
    highRiskFiles: hotspots.filter((h) => h.riskLevel === 'high').length,
    lowRiskFiles: hotspots.filter((h) => h.riskLevel === 'minimal' || h.riskLevel === 'low').length,
    mostIsolatedFile: hotspots.length > 0 ? hotspots[hotspots.length - 1].file : '',
    mostConnectedFile: hotspots.length > 0 ? hotspots[0].file : '',
  }

  const recommendations = generateRecommendations(hotspots, stats)

  return { simulations, hotspots, stats, recommendations }
}
