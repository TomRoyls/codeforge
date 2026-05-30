// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Coupling violation severity.
 *
 * @example
 * severity: 'warning'  // potential issue
 * severity: 'critical' // must fix
 */
export type ViolationSeverity = 'warning' | 'critical'

/**
 * Type of coupling violation.
 *
 * @example
 * type: 'high-afferent'   // too many dependents
 * type: 'high-efferent'   // too many dependencies
 * type: 'unstable-abstract' // abstract but unstable
 * type: 'cycle'           // circular dependency
 */
export type ViolationType = 'high-afferent' | 'high-efferent' | 'unstable-abstract' | 'cycle'

/**
 * Module coupling metrics.
 *
 * @example
 * const mod: ModuleCoupling = {
 *   module: 'src/core/discovery.ts',
 *   afferentCoupling: 8,
 *   efferentCoupling: 2,
 *   instability: 0.2,
 *   abstractness: 0.5,
 *   distance: 0.3,
 *   imports: ['./helpers'],
 *   importedBy: ['src/commands/count.ts'],
 *   totalExports: 6,
 *   abstractExports: 3,
 * }
 */
export interface ModuleCoupling {
  module: string
  afferentCoupling: number
  efferentCoupling: number
  instability: number
  abstractness: number
  distance: number
  imports: string[]
  importedBy: string[]
  totalExports: number
  abstractExports: number
}

/**
 * A cluster of tightly-coupled modules.
 *
 * @example
 * const cluster: CouplingCluster = {
 *   modules: ['a.ts', 'b.ts', 'c.ts'],
 *   size: 3,
 *   density: 0.67,
 *   averageCoupling: 4.2,
 * }
 */
export interface CouplingCluster {
  modules: string[]
  size: number
  density: number
  averageCoupling: number
}

/**
 * A coupling violation.
 *
 * @example
 * const v: CouplingViolation = {
 *   type: 'high-afferent',
 *   module: 'src/core/utils.ts',
 *   description: '12 modules depend on this',
 *   severity: 'critical',
 * }
 */
export interface CouplingViolation {
  type: ViolationType
  module: string
  description: string
  severity: ViolationSeverity
}

/**
 * Aggregate coupling statistics.
 *
 * @example
 * const stats = { totalModules: 20, totalEdges: 45, averageAfferent: 2.3, ... }
 */
export interface CouplingStats {
  totalModules: number
  totalEdges: number
  averageAfferent: number
  averageEfferent: number
  averageInstability: number
  mostStable: string
  mostUnstable: string
  mostDependedUpon: string
  mostDependent: string
}

/**
 * Complete coupling analysis result.
 *
 * @example
 * const result: CouplingResult = {
 *   modules: [...],
 *   clusters: [...],
 *   stats: { ... },
 *   violations: [...],
 *   recommendations: [...],
 * }
 */
export interface CouplingResult {
  modules: ModuleCoupling[]
  clusters: CouplingCluster[]
  stats: CouplingStats
  violations: CouplingViolation[]
  recommendations: string[]
}

/**
 * Options for coupling analysis.
 *
 * @example
 * const opts: CouplingOptions = { threshold: 5, verbose: true }
 */
export interface CouplingOptions {
  threshold?: number
  verbose?: boolean
}

/**
 * Internal dependency graph edge.
 */
export interface DependencyEdge {
  from: string
  to: string
}

/**
 * Internal dependency graph.
 */
export interface DependencyGraph {
  nodes: Set<string>
  edges: DependencyEdge[]
  adjacency: Map<string, Set<string>>
  reverseAdjacency: Map<string, Set<string>>
}

// ─── Import Extraction ─────────────────────────────────────────────────────────

/**
 * Extract raw import paths from source content.
 *
 * @example
 * extractImportPaths('import { foo } from "./bar"') // ['./bar']
 * extractImportPaths('import fs from "node:fs"') // ['node:fs']
 */
export function extractImportPaths(content: string): string[] {
  const imports: string[] = []
  const staticRegex = /import\s+(?:type\s+)?(?:[\w{}*,\s]+?)\s*(?:from\s+)?['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  while ((match = staticRegex.exec(content)) !== null) {
if (match[1] !== undefined) imports.push(match[1])
  }
  const dynamicRegex = /import\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((match = dynamicRegex.exec(content)) !== null) {
if (match[1] !== undefined) imports.push(match[1])
  }
  return [...new Set(imports)]
}

/**
 * Check if an import is external (node_modules or built-in).
 *
 * @example
 * isExternalImport('node:fs') // true
 * isExternalImport('./helpers') // false
 * isExternalImport('chalk') // true
 */
export function isExternalImport(importPath: string): boolean {
  return !importPath.startsWith('.') && !importPath.startsWith('/')
}

/**
 * Resolve a relative import to a project path.
 *
 * @example
 * resolveImportPath('./helpers', 'src/commands/count.ts') // 'src/commands/helpers'
 */
export function resolveImportPath(importPath: string, fromFile: string): string {
  if (isExternalImport(importPath)) return importPath

  const dir = fromFile.includes('/') ? fromFile.substring(0, fromFile.lastIndexOf('/')) : ''
  const parts = dir ? dir.split('/') : []
  for (const segment of importPath.split('/')) {
    if (segment === '..') {
      parts.pop()
    } else if (segment !== '.') {
      parts.push(segment)
    }
  }
  return parts.join('/')
}

// ─── Dependency Graph ──────────────────────────────────────────────────────────

/**
 * Build a dependency graph from files and contents.
 *
 * @example
 * const graph = buildDependencyGraph(['a.ts', 'b.ts'], [codeA, codeB])
 */
export function buildDependencyGraph(files: string[], contents: string[]): DependencyGraph {
  const nodes = new Set<string>()
  const edges: DependencyEdge[] = []
  const adjacency = new Map<string, Set<string>>()
  const reverseAdjacency = new Map<string, Set<string>>()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i]
    if (file === undefined || content === undefined) continue

    nodes.add(file)
    if (!adjacency.has(file)) adjacency.set(file, new Set())
    if (!reverseAdjacency.has(file)) reverseAdjacency.set(file, new Set())

    const imports = extractImportPaths(content)
    for (const imp of imports) {
      if (isExternalImport(imp)) continue

      const resolved = resolveImportPath(imp, file)
      edges.push({ from: file, to: resolved })

      const adj = adjacency.get(file)
      if (adj) adj.add(resolved)
    }
  }

  // Build reverse adjacency
  for (const edge of edges) {
    const revSet = reverseAdjacency.get(edge.to)
    if (revSet) {
      revSet.add(edge.from)
    } else {
      reverseAdjacency.set(edge.to, new Set([edge.from]))
    }
    if (!nodes.has(edge.to)) nodes.add(edge.to)
  }

  return { nodes, edges, adjacency, reverseAdjacency }
}

// ─── Afferent / Efferent ──────────────────────────────────────────────────────

/**
 * Compute afferent coupling (Ca) — how many modules depend on this one.
 *
 * @example
 * computeAfferent('core.ts', graph) // 5
 */
export function computeAfferent(module: string, graph: DependencyGraph): number {
  return graph.reverseAdjacency.get(module)?.size ?? 0
}

/**
 * Compute efferent coupling (Ce) — how many modules this one depends on.
 *
 * @example
 * computeEfferent('commands.ts', graph) // 3
 */
export function computeEfferent(module: string, graph: DependencyGraph): number {
  return graph.adjacency.get(module)?.size ?? 0
}

// ─── Instability ───────────────────────────────────────────────────────────────

/**
 * Compute instability: Ce / (Ca + Ce). 0 = maximally stable, 1 = maximally unstable.
 *
 * @example
 * computeInstability(0, 5) // 1.0
 * computeInstability(10, 0) // 0.0
 * computeInstability(5, 5) // 0.5
 */
export function computeInstability(afferent: number, efferent: number): number {
  const total = afferent + efferent
  if (total === 0) return 0
  return Math.round((efferent / total) * 100) / 100
}

// ─── Abstractness ──────────────────────────────────────────────────────────────

/**
 * Compute abstractness: ratio of abstract exports to total exports.
 *
 * @example
 * computeAbstractness('export interface Foo {}') // 1.0
 * computeAbstractness('export function foo() {}') // 0.0
 * computeAbstractness('export interface I {} export function f() {}') // 0.5
 */
export function computeAbstractness(content: string): { abstractness: number; totalExports: number; abstractExports: number } {
  const lines = content.split('\n')
  let totalExports = 0
  let abstractExports = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('export')) continue

    totalExports++
    if (/^export\s+(?:default\s+)?(?:interface|type)\s/.test(trimmed)) {
      abstractExports++
    }
    // Named re-exports of abstract things are hard to detect without parsing
    // export { Foo } from './bar' — count as concrete
  }

  const abstractness = totalExports > 0 ? Math.round((abstractExports / totalExports) * 100) / 100 : 0
  return { abstractness, totalExports, abstractExports }
}

// ─── Distance ──────────────────────────────────────────────────────────────────

/**
 * Compute distance from main sequence: |A + I - 1|.
 * 0 = ideal, 1 = worst.
 *
 * @example
 * computeDistance(1.0, 0.0) // 0.0 (abstract and stable)
 * computeDistance(0.0, 1.0) // 0.0 (concrete and unstable)
 * computeDistance(0.0, 0.0) // 1.0 (concrete and stable — zone of pain)
 */
export function computeDistance(abstractness: number, instability: number): number {
  return Math.round(Math.abs(abstractness + instability - 1) * 100) / 100
}

// ─── Cluster Detection ─────────────────────────────────────────────────────────

/**
 * Find clusters of tightly-coupled modules.
 *
 * @example
 * findClusters(graph) // [{ modules: ['a', 'b', 'c'], size: 3, density: 0.67, ... }]
 */
export function findClusters(graph: DependencyGraph): CouplingCluster[] {
  const visited = new Set<string>()
  const clusters: CouplingCluster[] = []

  for (const node of graph.nodes) {
    if (visited.has(node)) continue
    if (isExternalImport(node)) continue

    const cluster = expandCluster(node, graph, visited)
    if (cluster.modules.length >= 2) {
      clusters.push(cluster)
    }
  }

  clusters.sort((a, b) => b.size - a.size)
  return clusters
}

/**
 * Expand a cluster from a seed node using mutual dependency reachability.
 *
 * @example
 * expandCluster('a.ts', graph, visited) // { modules: [...], size: 3, ... }
 */
export function expandCluster(seed: string, graph: DependencyGraph, visited: Set<string>): CouplingCluster {
  const clusterModules = new Set<string>()
  const queue = [seed]

  while (queue.length > 0) {
    const current = queue.pop()
    if (!current) continue
    if (visited.has(current)) continue
    if (isExternalImport(current)) continue

    visited.add(current)
    clusterModules.add(current)

    const outEdges = graph.adjacency.get(current) ?? new Set()
    const inEdges = graph.reverseAdjacency.get(current) ?? new Set()

    for (const neighbor of [...outEdges, ...inEdges]) {
      if (!visited.has(neighbor) && !isExternalImport(neighbor)) {
        queue.push(neighbor)
      }
    }
  }

  const modules = [...clusterModules].sort()
  const size = modules.length

  let actualEdges = 0
  let totalCoupling = 0
  for (const mod of modules) {
    const outEdges = graph.adjacency.get(mod) ?? new Set()
    for (const target of outEdges) {
      if (clusterModules.has(target)) actualEdges++
    }
    totalCoupling += (graph.adjacency.get(mod) ?? new Set()).size
    totalCoupling += (graph.reverseAdjacency.get(mod) ?? new Set()).size
  }

  const maxEdges = size * (size - 1)
  const density = maxEdges > 0 ? Math.round((actualEdges / maxEdges) * 100) / 100 : 0
  const averageCoupling = size > 0 ? Math.round((totalCoupling / size) * 10) / 10 : 0

  return { modules, size, density, averageCoupling }
}

// ─── Cycle Detection ──────────────────────────────────────────────────────────

/**
 * Detect cycles in the dependency graph.
 *
 * @example
 * detectCycles(graph) // [['a', 'b', 'a'], ...]
 */
export function detectCycles(graph: DependencyGraph): string[][] {
  const cycles: string[][] = []
  const visited = new Set<string>()
  const recStack = new Set<string>()
  const path: string[] = []

  for (const node of graph.nodes) {
    if (!visited.has(node)) {
      dfsCycles(node, graph, visited, recStack, path, cycles)
    }
  }

  return cycles
}

/**
 * DFS helper for cycle detection.
 */
export function dfsCycles(
  node: string,
  graph: DependencyGraph,
  visited: Set<string>,
  recStack: Set<string>,
  path: string[],
  cycles: string[][],
): void {
  visited.add(node)
  recStack.add(node)
  path.push(node)

  const neighbors = graph.adjacency.get(node) ?? new Set()
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      dfsCycles(neighbor, graph, visited, recStack, path, cycles)
    } else if (recStack.has(neighbor)) {
      const cycleStart = path.indexOf(neighbor)
      if (cycleStart >= 0) {
        const cycle = [...path.slice(cycleStart), neighbor]
        cycles.push(cycle)
      }
    }
  }

  path.pop()
  recStack.delete(node)
}

// ─── Violation Detection ──────────────────────────────────────────────────────

/**
 * Detect coupling violations based on threshold.
 *
 * @example
 * detectViolations(modules, graph, 5)
 * // [{ type: 'high-afferent', module: 'core.ts', ... }]
 */
export function detectViolations(modules: ModuleCoupling[], graph: DependencyGraph, threshold: number): CouplingViolation[] {
  const violations: CouplingViolation[] = []

  for (const mod of modules) {
    if (mod.afferentCoupling > threshold * 2) {
      violations.push({
        type: 'high-afferent',
        module: mod.module,
        description: `${mod.afferentCoupling} modules depend on this (threshold: ${threshold * 2})`,
        severity: mod.afferentCoupling > threshold * 3 ? 'critical' : 'warning',
      })
    }

    if (mod.efferentCoupling > threshold * 2) {
      violations.push({
        type: 'high-efferent',
        module: mod.module,
        description: `Depends on ${mod.efferentCoupling} modules (threshold: ${threshold * 2})`,
        severity: mod.efferentCoupling > threshold * 3 ? 'critical' : 'warning',
      })
    }

    if (mod.abstractness > 0.5 && mod.instability > 0.5) {
      violations.push({
        type: 'unstable-abstract',
        module: mod.module,
        description: `Abstract (${mod.abstractness}) but unstable (${mod.instability})`,
        severity: 'warning',
      })
    }
  }

  const cycles = detectCycles(graph)
  for (const cycle of cycles) {
    const involved = cycle.slice(0, -1)
    violations.push({
      type: 'cycle',
      module: involved.join(' -> '),
      description: `Circular dependency: ${cycle.join(' -> ')}`,
      severity: 'critical',
    })
  }

  return violations
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate recommendations based on coupling analysis.
 *
 * @example
 * generateRecommendations(violations, clusters)
 * // ['Consider splitting the god module core.ts...', ...]
 */
export function generateRecommendations(violations: CouplingViolation[], clusters: CouplingCluster[]): string[] {
  const recs: string[] = []

  const criticalCount = violations.filter((v) => v.severity === 'critical').length
  if (criticalCount > 0) {
    recs.push(`${criticalCount} critical coupling violation${criticalCount > 1 ? 's' : ''} detected. Prioritize resolving these.`)
  }

  const highAfferent = violations.filter((v) => v.type === 'high-afferent')
  if (highAfferent.length > 0) {
    recs.push('Modules with high afferent coupling may be god modules. Consider splitting responsibilities.')
  }

  const highEfferent = violations.filter((v) => v.type === 'high-efferent')
  if (highEfferent.length > 0) {
    recs.push('Modules with high efferent coupling know too much. Consider dependency injection or facade patterns.')
  }

  const cycles = violations.filter((v) => v.type === 'cycle')
  if (cycles.length > 0) {
    recs.push(`${cycles.length} circular dependenc${cycles.length > 1 ? 'ies' : 'y'} found. Use dependency inversion or event-based decoupling.`)
  }

  const unstableAbstract = violations.filter((v) => v.type === 'unstable-abstract')
  if (unstableAbstract.length > 0) {
    recs.push('Abstract modules should be stable. Separate abstract interfaces from concrete implementations.')
  }

  if (clusters.length > 0 && clusters[0] && clusters[0].size > 5) {
    recs.push(`Largest cluster has ${clusters[0].size} modules. Consider introducing a facade or mediator to reduce coupling.`)
  }

  if (recs.length === 0) {
    recs.push('Module coupling is within healthy limits. Good architectural boundaries.')
  }

  return recs
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

/**
 * Build a complete coupling analysis result.
 *
 * @example
 * const result = buildCouplingResult(['a.ts'], [content], { threshold: 5 })
 */
export function buildCouplingResult(
  files: string[],
  contents: string[],
  options: CouplingOptions,
): CouplingResult {
  const threshold = options.threshold ?? 5

  const graph = buildDependencyGraph(files, contents)

  const moduleContents = new Map<string, string>()
  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    const c = contents[i]
    if (f !== undefined && c !== undefined) moduleContents.set(f, c)
  }

  const modules: ModuleCoupling[] = []
  for (const file of files) {
    const afferent = computeAfferent(file, graph)
    const efferent = computeEfferent(file, graph)
    const instability = computeInstability(afferent, efferent)
    const content = moduleContents.get(file) ?? ''
    const { abstractness, totalExports, abstractExports } = computeAbstractness(content)
    const distance = computeDistance(abstractness, instability)
    const imports = [...(graph.adjacency.get(file) ?? new Set())]
    const importedBy = [...(graph.reverseAdjacency.get(file) ?? new Set())]

    modules.push({
      module: file,
      afferentCoupling: afferent,
      efferentCoupling: efferent,
      instability,
      abstractness,
      distance,
      imports,
      importedBy,
      totalExports,
      abstractExports,
    })
  }

  const clusters = findClusters(graph)
  const violations = detectViolations(modules, graph, threshold)
  const recommendations = generateRecommendations(violations, clusters)

  const totalEdges = graph.edges.length
  const avgAfferent = modules.length > 0 ? Math.round((modules.reduce((s, m) => s + m.afferentCoupling, 0) / modules.length) * 10) / 10 : 0
  const avgEfferent = modules.length > 0 ? Math.round((modules.reduce((s, m) => s + m.efferentCoupling, 0) / modules.length) * 10) / 10 : 0
  const avgInstability = modules.length > 0 ? Math.round((modules.reduce((s, m) => s + m.instability, 0) / modules.length) * 100) / 100 : 0

  const sortedByAfferent = [...modules].sort((a, b) => b.afferentCoupling - a.afferentCoupling)
  const sortedByEfferent = [...modules].sort((a, b) => b.efferentCoupling - a.efferentCoupling)
  const sortedByInstability = [...modules].sort((a, b) => b.instability - a.instability)
  const sortedByStability = [...modules].sort((a, b) => a.instability - b.instability)

  const stats: CouplingStats = {
    totalModules: files.length,
    totalEdges,
    averageAfferent: avgAfferent,
    averageEfferent: avgEfferent,
    averageInstability: avgInstability,
    mostStable: sortedByStability[0]?.module ?? '',
    mostUnstable: sortedByInstability[0]?.module ?? '',
    mostDependedUpon: sortedByAfferent[0]?.module ?? '',
    mostDependent: sortedByEfferent[0]?.module ?? '',
  }

  return { modules, clusters, stats, violations, recommendations }
}
