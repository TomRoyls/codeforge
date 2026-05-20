// ─── Types ─────────────────────────────────────────────────────────────────────

export type PortType = 'home' | 'trade' | 'outpost' | 'harbor' | 'island' | 'reef'

export type RouteType = 'highway' | 'route' | 'path' | 'treacherous'

export type HazardType = 'maelstrom' | 'storm' | 'fog' | 'shallow' | 'pirate'

export type Severity = 'minor' | 'moderate' | 'major' | 'extreme'

export interface Port {
  file: string
  name: string
  type: PortType
  connections: string[]
  importance: number
  seaConditions: number
  supplies: number
}

export interface TradeRoute {
  from: string
  to: string
  cargo: string[]
  distance: number
  difficulty: number
  type: RouteType
}

export interface Waypoint {
  file: string
  reason: string
  readingTime: string
  difficulty: number
}

export interface Hazard {
  file: string
  type: HazardType
  severity: Severity
  description: string
}

export interface Journey {
  from: string
  to: string
  route: string[]
  distance: number
  difficulty: number
  waypoints: Waypoint[]
  hazards: Hazard[]
}

export interface VoyageStats {
  totalPorts: number
  homePorts: number
  tradeRoutes: number
  avgDistance: number
  maxDistance: number
  avgDifficulty: number
  hazardousRoutes: number
  mostIsolated: string
  mostConnected: string
  navigability: number
  chartCompleteness: number
}

export interface VoyageResult {
  ports: Port[]
  routes: TradeRoute[]
  journeys: Journey[]
  hazards: Hazard[]
  stats: VoyageStats
  recommendations: string[]
}

// ─── Import/Export Extraction ──────────────────────────────────────────────────

/**
 * Extract import paths from content.
 *
 * @example
 * extractImports('import { x } from "./foo"')
 */
export function extractImports(content: string): string[] {
  const paths: string[] = []
  const patterns = [
    /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]
  for (const pat of patterns) {
    let m: RegExpExecArray | null
    while ((m = pat.exec(content)) !== null) {
      paths.push(m[1])
    }
  }
  return [...new Set(paths)]
}

/**
 * Extract export names from content.
 *
 * @example
 * extractExports('export function foo() {}')
 */
export function extractExports(content: string): string[] {
  const exports: string[] = []
  const patterns = [
    /export\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+(\w+)/g,
    /export\s+\{([^}]+)\}/g,
  ]
  for (const pat of patterns) {
    let m: RegExpExecArray | null
    while ((m = pat.exec(content)) !== null) {
      if (pat.source.startsWith('export\\s+\\{')) {
        const names = m[1].split(',').map((n) => n.trim().split(/\s+as\s+/).pop()!.trim()).filter(Boolean)
        exports.push(...names)
      } else {
        exports.push(m[1])
      }
    }
  }
  return [...new Set(exports)]
}

/**
 * Resolve an import path to a file in the project.
 *
 * @example
 * resolveImport('./foo', ['foo.ts', 'bar.ts'])
 */
export function resolveImport(imp: string, allFiles: string[]): string | null {
  const normalized = imp.startsWith('./') ? imp.slice(2) : imp
  const candidates = [imp, normalized, imp + '.ts', imp + '.js', imp + '.tsx', imp + '.jsx',
    normalized + '.ts', normalized + '.js', normalized + '.tsx', normalized + '.jsx']
  for (const candidate of candidates) {
    if (allFiles.includes(candidate)) return candidate
  }
  return null
}

// ─── Complexity & Documentation ────────────────────────────────────────────────

/**
 * Compute complexity (sea conditions) 0-100.
 *
 * @example
 * computeSeaConditions('if (x) { for (let i = 0; i < 10; i++) {} }')
 */
export function computeSeaConditions(content: string): number {
  const branches = (content.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b|\bcase\b|\bcatch\b|\?:/g) || []).length
  const lines = content.split('\n').length
  if (lines === 0) return 0
  return Math.min(100, Math.round((branches / lines) * 200))
}

/**
 * Compute supplies (documentation quality) 0-100.
 *
 * @example
 * computeSupplies('/** docs *\/\nfunction foo() {}')
 */
export function computeSupplies(content: string): number {
  const lines = content.split('\n')
  if (lines.length === 0) return 0
  const docLines = lines.filter((l) =>
    l.trim().startsWith('/**') || l.trim().startsWith('*') || l.trim().startsWith('//') || l.trim().startsWith('*/'),
  ).length
  return Math.min(100, Math.round((docLines / lines.length) * 200))
}

// ─── Port Classification ───────────────────────────────────────────────────────

/**
 * Classify a file as a port type.
 *
 * @example
 * classifyPortType('main.ts', ['./a', './b'], ['x'], ['./c'])
 */
export function classifyPortType(
  file: string,
  imports: string[],
  exports: string[],
  importedBy: string[],
): PortType {
  const isEntry = /^(main|index|cli|app|server|run)\b/.test(file.replace(/^.*\//, '').replace(/\.[jt]sx?$/, ''))

  if (isEntry && importedBy.length === 0) return 'home'
  if (imports.length === 0 && importedBy.length === 0) return 'island'
  if (imports.length > 0 && exports.length === 0) return 'outpost'
  if (importedBy.length >= 5) return 'harbor'
  if (imports.length > 0 && importedBy.length > 0) return 'trade'
  return 'island'
}

/**
 * Compute port importance (0-100).
 *
 * @example
 * computeImportance(5, 10, 80)
 */
export function computeImportance(importedByCount: number, exportCount: number, seaConditions: number): number {
  const connectionScore = Math.min(50, importedByCount * 10)
  const exportScore = Math.min(30, exportCount * 5)
  const complexityPenalty = seaConditions > 70 ? 10 : 0
  return Math.min(100, connectionScore + exportScore + 20 - complexityPenalty)
}

/**
 * Map all files to ports.
 *
 * @example
 * mapPorts(files, contents, fileImports, fileExports, importedBy)
 */
export function mapPorts(
  files: string[],
  contents: string[],
  fileImports: Map<string, string[]>,
  fileExports: Map<string, string[]>,
  importedBy: Map<string, string[]>,
): Port[] {
  return files.map((file, i) => {
    const content = contents[i] ?? ''
    const imports = fileImports.get(file) ?? []
    const exports = fileExports.get(file) ?? []
    const deps = importedBy.get(file) ?? []
    const seaConditions = computeSeaConditions(content)
    const supplies = computeSupplies(content)

    const resolvedConnections = imports
      .map((imp) => resolveImport(imp, files))
      .filter((f): f is string => f !== null)

    return {
      file,
      name: file.replace(/\.[jt]sx?$/, ''),
      type: classifyPortType(file, imports, exports, deps),
      connections: resolvedConnections,
      importance: computeImportance(deps.length, exports.length, seaConditions),
      seaConditions,
      supplies,
    }
  })
}

// ─── Trade Routes ──────────────────────────────────────────────────────────────

/**
 * Chart trade routes between ports.
 *
 * @example
 * chartRoutes(ports, fileImports, files)
 */
export function chartRoutes(
  ports: Port[],
  fileImports: Map<string, string[]>,
  files: string[],
): TradeRoute[] {
  const routes: TradeRoute[] = []
  const seen = new Set<string>()

  for (const port of ports) {
    const imports = fileImports.get(port.file) ?? []
    for (const imp of imports) {
      const target = resolveImport(imp, files)
      if (target) {
        const key = `${port.file}->${target}`
        if (!seen.has(key)) {
          seen.add(key)
          const cargo = extractCargo(imp, fileImports)
          const difficulty = computeRouteDifficulty(port.file, target, ports)
          routes.push({
            from: port.file,
            to: target,
            cargo,
            distance: 1,
            difficulty,
            type: classifyRouteType(difficulty),
          })
        }
      }
    }
  }

  return routes
}

function extractCargo(imp: string, fileImports: Map<string, string[]>): string[] {
  return [imp]
}

/**
 * Classify route type by difficulty.
 *
 * @example
 * classifyRouteType(30)
 */
export function classifyRouteType(difficulty: number): RouteType {
  if (difficulty <= 25) return 'highway'
  if (difficulty <= 50) return 'route'
  if (difficulty <= 75) return 'path'
  return 'treacherous'
}

/**
 * Compute route difficulty.
 *
 * @example
 * computeRouteDifficulty('a.ts', 'b.ts', ports)
 */
export function computeRouteDifficulty(from: string, to: string, ports: Port[]): number {
  const fromPort = ports.find((p) => p.file === from)
  const toPort = ports.find((p) => p.file === to)
  const fromConditions = fromPort?.seaConditions ?? 0
  const toConditions = toPort?.seaConditions ?? 0
  const fromSupplies = fromPort?.supplies ?? 50
  const toSupplies = toPort?.supplies ?? 50
  const avgConditions = (fromConditions + toConditions) / 2
  const supplyPenalty = (100 - fromSupplies + 100 - toSupplies) / 4
  return Math.min(100, Math.round(avgConditions * 0.6 + supplyPenalty * 0.4))
}

// ─── Journey Planning ──────────────────────────────────────────────────────────

/**
 * Plan a journey (BFS shortest path) between two files.
 *
 * @example
 * planJourney('main.ts', 'util.ts', ports)
 */
export function planJourney(from: string, to: string, ports: Port[]): Journey | null {
  if (from === to) {
    return {
      from, to, route: [from], distance: 0, difficulty: 0,
      waypoints: [], hazards: [],
    }
  }

  const portMap = new Map(ports.map((p) => [p.file, p]))
  const visited = new Set<string>()
  const queue: Array<{ file: string; path: string[] }> = [{ file: from, path: [from] }]
  visited.add(from)

  while (queue.length > 0) {
    const current = queue.shift()!
    const port = portMap.get(current.file)
    if (!port) continue

    for (const conn of port.connections) {
      if (conn === to) {
        const route = [...current.path, conn]
        return buildJourney(from, to, route, ports)
      }
      if (!visited.has(conn)) {
        visited.add(conn)
        queue.push({ file: conn, path: [...current.path, conn] })
      }
    }
  }

  return null
}

function buildJourney(from: string, to: string, route: string[], ports: Port[]): Journey {
  const portMap = new Map(ports.map((p) => [p.file, p]))
  const waypoints: Waypoint[] = route.map((file) => {
    const port = portMap.get(file)
    return {
      file,
      reason: port ? `${port.type} port` : 'Unknown',
      readingTime: estimateReadingTime(file, ''),
      difficulty: port?.seaConditions ?? 0,
    }
  })

  const difficulty = Math.round(route.reduce((sum, file) => {
    const port = portMap.get(file)
    return sum + (port?.seaConditions ?? 0)
  }, 0) / route.length)

  const hazards = identifyJourneyHazards(route, ports)

  return {
    from, to, route, distance: route.length - 1, difficulty, waypoints, hazards,
  }
}

/**
 * Estimate reading time for a file.
 *
 * @example
 * estimateReadingTime('mod.ts', content)
 */
export function estimateReadingTime(file: string, content: string): string {
  const lines = content ? content.split('\n').length : 50
  const minutes = Math.max(1, Math.round(lines / 50))
  return `${minutes} min`
}

function identifyJourneyHazards(route: string[], ports: Port[]): Hazard[] {
  const portMap = new Map(ports.map((p) => [p.file, p]))
  const hazards: Hazard[] = []

  for (const file of route) {
    const port = portMap.get(file)
    if (!port) continue
    if (port.seaConditions > 70) {
      hazards.push({ file, type: 'storm', severity: 'major', description: 'High complexity makes navigation difficult' })
    }
    if (port.supplies < 20) {
      hazards.push({ file, type: 'fog', severity: 'moderate', description: 'Low documentation obscures understanding' })
    }
  }

  return hazards
}

// ─── Hazard Identification ─────────────────────────────────────────────────────

/**
 * Identify all hazards in the voyage map.
 *
 * @example
 * identifyHazards(ports, routes)
 */
export function identifyHazards(ports: Port[], routes: TradeRoute[]): Hazard[] {
  const hazards: Hazard[] = []
  const portMap = new Map(ports.map((p) => [p.file, p]))

  for (const port of ports) {
    if (port.seaConditions > 70) {
      hazards.push({
        file: port.file,
        type: 'storm',
        severity: port.seaConditions > 90 ? 'extreme' : 'major',
        description: `Complexity at ${port.seaConditions}% makes this port stormy`,
      })
    }

    if (port.supplies < 20) {
      hazards.push({
        file: port.file,
        type: 'fog',
        severity: port.supplies < 10 ? 'major' : 'moderate',
        description: `Documentation at ${port.supplies}% makes this port foggy`,
      })
    }

    const content = ''
    const fnCount = (content.match(/function\s+\w+/g) || []).length
    if (fnCount > 10) {
      hazards.push({
        file: port.file,
        type: 'pirate',
        severity: 'moderate',
        description: 'Too many responsibilities steal focus',
      })
    }
  }

  const circularDeps = findCircularDependencies(ports)
  for (const cycle of circularDeps) {
    hazards.push({
      file: cycle[0],
      type: 'maelstrom',
      severity: 'extreme',
      description: `Circular dependency: ${cycle.join(' → ')} → ${cycle[0]}`,
    })
  }

  return hazards
}

/**
 * Find circular dependencies.
 *
 * @example
 * findCircularDependencies(ports)
 */
export function findCircularDependencies(ports: Port[]): string[][] {
  const cycles: string[][] = []
  const portMap = new Map(ports.map((p) => [p.file, p]))

  for (const port of ports) {
    const visited = new Set<string>()
    const path: string[] = []

    function dfs(current: string): boolean {
      if (visited.has(current)) {
        const cycleStart = path.indexOf(current)
        if (cycleStart >= 0) {
          const cycle = path.slice(cycleStart)
          const key = [...cycle].sort().join(',')
          if (!cycles.some((c) => [...c].sort().join(',') === key)) {
            cycles.push(cycle)
          }
        }
        return false
      }
      visited.add(current)
      path.push(current)

      const p = portMap.get(current)
      if (p) {
        for (const conn of p.connections) {
          dfs(conn)
        }
      }

      path.pop()
      return false
    }

    dfs(port.file)
  }

  return cycles.slice(0, 10)
}

// ─── Navigability & Chart Completeness ─────────────────────────────────────────

/**
 * Compute navigability (how easy to navigate).
 *
 * @example
 * computeNavigability(journeys, routes)
 */
export function computeNavigability(journeys: Journey[], routes: TradeRoute[]): number {
  if (journeys.length === 0 && routes.length === 0) return 0

  const reachableJourneys = journeys.filter((j) => j !== null).length
  const totalJourneys = journeys.length
  const reachRatio = totalJourneys > 0 ? (reachableJourneys / totalJourneys) : 0

  const easyRoutes = routes.filter((r) => r.type === 'highway' || r.type === 'route').length
  const routeRatio = routes.length > 0 ? (easyRoutes / routes.length) : 0

  return Math.round((reachRatio * 60 + routeRatio * 40))
}

/**
 * Compute chart completeness (how well-mapped).
 *
 * @example
 * computeChartCompleteness(ports, routes)
 */
export function computeChartCompleteness(ports: Port[], routes: TradeRoute[]): number {
  if (ports.length === 0) return 0

  const documentedPorts = ports.filter((p) => p.supplies > 20).length
  const connectedPorts = ports.filter((p) => p.connections.length > 0 || p.type === 'harbor').length

  const docScore = (documentedPorts / ports.length) * 60
  const connectionScore = (connectedPorts / ports.length) * 40

  return Math.round(Math.min(100, docScore + connectionScore))
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate voyage recommendations.
 *
 * @example
 * generateRecommendations(ports, routes, journeys, hazards, stats)
 */
export function generateRecommendations(
  ports: Port[],
  routes: TradeRoute[],
  journeys: Journey[],
  hazards: Hazard[],
  stats: VoyageStats,
): string[] {
  const recs: string[] = []

  const maelstroms = hazards.filter((h) => h.type === 'maelstrom')
  if (maelstroms.length > 0) {
    recs.push(`${maelstroms.length} maelstrom(s) detected — break circular dependencies: ${maelstroms.map((m) => m.file).join(', ')}`)
  }

  const storms = hazards.filter((h) => h.type === 'storm')
  if (storms.length > 0) {
    recs.push(`${storms.length} stormy port(s) — simplify complex files: ${storms.slice(0, 3).map((s) => s.file).join(', ')}`)
  }

  const fog = hazards.filter((h) => h.type === 'fog')
  if (fog.length > 0) {
    recs.push(`${fog.length} foggy port(s) — add documentation: ${fog.slice(0, 3).map((f) => f.file).join(', ')}`)
  }

  const longJourneys = journeys.filter((j) => j.distance > 5)
  if (longJourneys.length > 0) {
    recs.push(`${longJourneys.length} long journey(s) — add re-export shortcuts for common paths`)
  }

  if (stats.mostIsolated !== 'none') {
    recs.push(`${stats.mostIsolated} is isolated — consider adding more connections or documentation`)
  }

  if (stats.navigability > 70) {
    recs.push(`Navigability is ${stats.navigability}% — well-charted codebase`)
  }

  if (recs.length === 0) {
    recs.push('All routes are clear with good navigability across the codebase')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete voyage result.
 *
 * @example
 * buildVoyageResult(['a.ts'], ['code'], {})
 */
export function buildVoyageResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): VoyageResult {
  if (files.length === 0) {
    const emptyStats: VoyageStats = {
      totalPorts: 0, homePorts: 0, tradeRoutes: 0, avgDistance: 0, maxDistance: 0,
      avgDifficulty: 0, hazardousRoutes: 0, mostIsolated: 'none', mostConnected: 'none',
      navigability: 0, chartCompleteness: 0,
    }
    return { ports: [], routes: [], journeys: [], hazards: [], stats: emptyStats, recommendations: ['No files to analyze'] }
  }

  const fileImports = new Map<string, string[]>()
  const fileExports = new Map<string, string[]>()
  const importedBy = new Map<string, string[]>()

  for (const file of files) {
    const idx = files.indexOf(file)
    const content = contents[idx] ?? ''
    fileImports.set(file, extractImports(content))
    fileExports.set(file, extractExports(content))
    importedBy.set(file, [])
  }

  for (const file of files) {
    const imports = fileImports.get(file) ?? []
    for (const imp of imports) {
      const resolved = resolveImport(imp, files)
      if (resolved) {
        const list = importedBy.get(resolved)
        if (list && !list.includes(file)) list.push(file)
      }
    }
  }

  const ports = mapPorts(files, contents, fileImports, fileExports, importedBy)
  const routes = chartRoutes(ports, fileImports, files)

  const homePorts = ports.filter((p) => p.type === 'home')
  const harborPorts = ports.filter((p) => p.type === 'harbor')
  const destinations = [...harborPorts.slice(0, 3), ...ports.filter((p) => p.importance > 50).slice(0, 2)]

  const journeys: Journey[] = []
  for (const home of homePorts.slice(0, 2)) {
    for (const dest of destinations) {
      if (home.file !== dest.file) {
        const journey = planJourney(home.file, dest.file, ports)
        if (journey) journeys.push(journey)
      }
    }
  }

  if (journeys.length === 0 && ports.length >= 2) {
    const journey = planJourney(ports[0].file, ports[ports.length - 1].file, ports)
    if (journey) journeys.push(journey)
  }

  const hazards = identifyHazards(ports, routes)

  const avgDistance = journeys.length > 0
    ? Math.round(journeys.reduce((s, j) => s + j.distance, 0) / journeys.length * 10) / 10
    : 0
  const maxDistance = journeys.length > 0
    ? Math.max(...journeys.map((j) => j.distance))
    : 0
  const avgDifficulty = routes.length > 0
    ? Math.round(routes.reduce((s, r) => s + r.difficulty, 0) / routes.length)
    : 0
  const hazardousRoutes = routes.filter((r) => r.type === 'treacherous').length

  const portImportance = new Map(ports.map((p) => [p.file, p.importance]))
  const mostIsolated = ports.length > 0
    ? ports.reduce((a, b) => (a.connections.length === 0 && b.connections.length === 0)
        ? (a.importance < b.importance ? a : b)
        : a.connections.length < b.connections.length ? a : b).file
    : 'none'
  const mostConnected = ports.length > 0
    ? ports.reduce((a, b) => a.connections.length > b.connections.length ? a : b).file
    : 'none'

  const navigability = computeNavigability(journeys, routes)
  const chartCompleteness = computeChartCompleteness(ports, routes)

  const stats: VoyageStats = {
    totalPorts: ports.length,
    homePorts: homePorts.length,
    tradeRoutes: routes.length,
    avgDistance,
    maxDistance,
    avgDifficulty,
    hazardousRoutes,
    mostIsolated,
    mostConnected,
    navigability,
    chartCompleteness,
  }

  const recommendations = generateRecommendations(ports, routes, journeys, hazards, stats)

  return { ports, routes, journeys, hazards, stats, recommendations }
}
