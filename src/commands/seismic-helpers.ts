// ─── Types ─────────────────────────────────────────────────────────────────────

export type EventType = 'tremor' | 'earthquake' | 'aftershock' | 'foreshock' | 'swarm' | 'silent'
export type ActivityLevel = 'dormant' | 'active' | 'hyperactive'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type DriftDirection = 'expanding' | 'contracting' | 'stable'
export type ZoneRisk = 'stable' | 'minor' | 'moderate' | 'major' | 'catastrophic'
export type OverallRisk = 'stable' | 'minor' | 'moderate' | 'major' | 'catastrophic'

export interface SeismicEvent {
  file: string
  magnitude: number
  depth: number
  type: EventType
  timestamp: number
  epicenter: string
  affectedFiles: string[]
  description: string
}

export interface FaultLine {
  name: string
  files: string[]
  activityLevel: ActivityLevel
  avgMagnitude: number
  lastEventAge: number
  riskLevel: RiskLevel
  description: string
}

export interface TectonicPlate {
  name: string
  files: string[]
  stability: number
  pressureBuildup: number
  boundaries: string[]
  driftDirection: DriftDirection
  riskAssessment: string
}

export interface SeismicZone {
  zone: string
  events: SeismicEvent[]
  magnitude: number
  frequency: number
  risk: ZoneRisk
  recommendation: string
}

export interface SeismicStats {
  totalEvents: number
  avgMagnitude: number
  maxMagnitude: number
  tremorCount: number
  earthquakeCount: number
  aftershockCount: number
  swarmCount: number
  silentCount: number
  activeFaultLines: number
  dormantFaultLines: number
  hyperactiveFaultLines: number
  avgPlateStability: number
  highPressurePlates: number
  overallRisk: OverallRisk
  mostActiveZone: string
  mostStableZone: string
  pressureIndex: number
}

export interface SeismicResult {
  events: SeismicEvent[]
  faultLines: FaultLine[]
  plates: TectonicPlate[]
  zones: SeismicZone[]
  stats: SeismicStats
  recommendations: string[]
}

export interface SeismicOptions {
  verbose?: boolean
}

// ─── Content Analysis ──────────────────────────────────────────────────────────

/**
 * Compute cyclomatic complexity.
 *
 * @example
 * computeCyclomaticComplexity('if (a) { if (b) {} }') // => 3
 */
export function computeCyclomaticComplexity(content: string): number {
  const ifCount = (content.match(/\bif\b/g) ?? []).length
  const elseCount = (content.match(/\belse\b/g) ?? []).length
  const switchCount = (content.match(/\bswitch\b/g) ?? []).length
  const caseCount = (content.match(/\bcase\b/g) ?? []).length
  const ternaryCount = (content.match(/\?[^?]/g) ?? []).length
  return 1 + ifCount + elseCount + switchCount + caseCount + ternaryCount
}

/**
 * Compute max nesting depth.
 *
 * @example
 * computeNestingDepth('if (a) { if (b) { if (c) {} } }') // => 3
 */
export function computeNestingDepth(content: string): number {
  let maxDepth = 0
  let depth = 0
  for (const ch of content) {
    if (ch === '{') {
      depth++
      maxDepth = Math.max(maxDepth, depth)
    } else if (ch === '}') {
      depth = Math.max(0, depth - 1)
    }
  }
  return maxDepth
}

/**
 * Count import statements.
 *
 * @example
 * countImports('import { a } from "b"; import c from "d"') // => 2
 */
export function countImports(content: string): number {
  return (content.match(/^import\s+/gm) ?? []).length
}

/**
 * Count non-blank lines.
 *
 * @example
 * countNonBlankLines('a\n\nb\nc') // => 3
 */
export function countNonBlankLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count TODO/FIXME markers.
 *
 * @example
 * countDebtMarkers('// TODO: fix\n// FIXME: broken') // => 2
 */
export function countDebtMarkers(content: string): number {
  return (content.match(/(?:TODO|FIXME|HACK|XXX)\b/gi) ?? []).length
}

/**
 * Count exports.
 *
 * @example
 * countExports('export const a = 1; export function b() {}') // => 2
 */
export function countExports(content: string): number {
  return (content.match(/export\s+/g) ?? []).length
}

/**
 * Extract imported module paths.
 *
 * @example
 * extractImportPaths('import { a } from "./utils"') // => ['./utils']
 */
export function extractImportPaths(content: string): string[] {
  const matches = content.match(/from\s+['"]([^'"]+)['"]/g) ?? []
  return matches.map(m => m.match(/['"]([^'"]+)['"]/)?.[1] ?? '')
}

// ─── Magnitude ─────────────────────────────────────────────────────────────────

/**
 * Compute magnitude (0-10 scale).
 *
 * @example
 * computeMagnitude('if (a) { if (b) {} }') // => 2
 */
export function computeMagnitude(content: string): number {
  if (content.length === 0) return 0

  const complexity = computeCyclomaticComplexity(content)
  const deps = countImports(content)
  const lines = countNonBlankLines(content)
  const nesting = computeNestingDepth(content)

  // complexity factor: 0-3
  const complexityFactor = Math.min(3, complexity / 10 * 3)
  // dependency factor: 0-3
  const depFactor = Math.min(3, deps / 8 * 3)
  // size factor: 0-2
  const sizeFactor = Math.min(2, lines / 200 * 2)
  // nesting factor: 0-2
  const nestingFactor = Math.min(2, nesting / 5 * 2)

  const raw = complexityFactor + depFactor + sizeFactor + nestingFactor
  return Math.min(10, Math.round(raw * 10) / 10)
}

/**
 * Compute depth (how deep in stack the change originated).
 *
 * @example
 * computeDepth('src/core/engine.ts', 3) // => 3
 */
export function computeDepth(file: string, maxDepth: number): number {
  const segments = file.split('/').length - 1
  return Math.min(maxDepth, segments)
}

// ─── Event Classification ──────────────────────────────────────────────────────

/**
 * Classify event type based on magnitude, frequency, and cascade depth.
 *
 * @example
 * classifyEventType(2.5, 10, 0) // => 'tremor'
 */
export function classifyEventType(magnitude: number, frequency: number, cascadeDepth: number): EventType {
  // earthquake: high magnitude
  if (magnitude >= 7) return 'earthquake'

  // silent: high complexity but low frequency
  if (magnitude >= 5 && frequency <= 1) return 'silent'

  // aftershock: follows high magnitude event
  if (cascadeDepth > 0 && magnitude >= 3) return 'aftershock'

  // swarm: frequent small events
  if (frequency >= 3 && magnitude < 3) return 'swarm'

  // foreshock: moderate magnitude with cascade potential
  if (magnitude >= 3 && magnitude < 7 && cascadeDepth > 0) return 'foreshock'

  // tremor: small magnitude
  if (magnitude < 3) return 'tremor'

  return 'tremor'
}

// ─── Fault Lines ───────────────────────────────────────────────────────────────

/**
 * Get directory from file path.
 *
 * @example
 * getDirectory('src/commands/app.ts') // => 'src/commands'
 */
export function getDirectory(file: string): string {
  return file.includes('/') ? file.substring(0, file.lastIndexOf('/')) : '.'
}

/**
 * Identify fault lines from events and files.
 *
 * @example
 * identifyFaultLines(events, files) // => [{ name: 'core', ... }]
 */
export function identifyFaultLines(events: SeismicEvent[], files: string[]): FaultLine[] {
  const faultMap = new Map<string, SeismicEvent[]>()

  for (const event of events) {
    const dir = getDirectory(event.file)
    const existing = faultMap.get(dir) ?? []
    existing.push(event)
    faultMap.set(dir, existing)
  }

  const faultLines: FaultLine[] = []
  for (const [dir, dirEvents] of faultMap) {
    const avgMag = dirEvents.length > 0
      ? Math.round((dirEvents.reduce((s, e) => s + e.magnitude, 0) / dirEvents.length) * 10) / 10
      : 0

    const fileCount = new Set(dirEvents.map(e => e.file)).size
    const totalMag = dirEvents.reduce((s, e) => s + e.magnitude, 0)

    let activityLevel: ActivityLevel = 'dormant'
    if (fileCount >= 5 || totalMag > 20) activityLevel = 'hyperactive'
    else if (fileCount >= 2 || totalMag > 5) activityLevel = 'active'

    let riskLevel: RiskLevel = 'low'
    if (avgMag >= 7) riskLevel = 'critical'
    else if (avgMag >= 5) riskLevel = 'high'
    else if (avgMag >= 3) riskLevel = 'medium'

    const dirFiles = files.filter(f => getDirectory(f) === dir)

    faultLines.push({
      name: dir,
      files: dirFiles,
      activityLevel,
      avgMagnitude: avgMag,
      lastEventAge: dirEvents.length,
      riskLevel,
      description: `${dirEvents.length} event(s) in ${dir}, avg magnitude ${avgMag}`,
    })
  }

  return faultLines
}

// ─── Tectonic Plates ───────────────────────────────────────────────────────────

/**
 * Identify tectonic plates (directory groups).
 *
 * @example
 * identifyTectonicPlates(files, contents) // => [{ name: 'src/commands', ... }]
 */
export function identifyTectonicPlates(files: string[], contents: string[]): TectonicPlate[] {
  const dirMap = new Map<string, { files: string[]; contents: string[] }>()

  for (let i = 0; i < files.length; i++) {
    const dir = getDirectory(files[i])
    const existing = dirMap.get(dir) ?? { files: [], contents: [] }
    existing.files.push(files[i])
    existing.contents.push(contents[i])
    dirMap.set(dir, existing)
  }

  const plates: TectonicPlate[] = []
  for (const [dir, data] of dirMap) {
    // stability: inverse of average complexity
    const complexities = data.contents.map(c => computeCyclomaticComplexity(c))
    const avgComplexity = complexities.length > 0
      ? complexities.reduce((a, b) => a + b, 0) / complexities.length
      : 0
    const stability = Math.max(0, Math.min(100, Math.round(100 - avgComplexity * 5)))

    // pressure: debt markers + high nesting + high deps
    const totalDebt = data.contents.reduce((s, c) => s + countDebtMarkers(c), 0)
    const totalNesting = data.contents.reduce((s, c) => s + computeNestingDepth(c), 0)
    const totalDeps = data.contents.reduce((s, c) => s + countImports(c), 0)
    const pressureBuildup = Math.min(100, Math.round(totalDebt * 10 + totalNesting * 3 + totalDeps * 2))

    // boundaries: files imported by other plates
    const allImportPaths = data.contents.flatMap(c => extractImportPaths(c))
    const boundaries = data.files.filter(f => {
      const base = f.replace(/\.\w+$/, '')
      return allImportPaths.some(p => p.includes(base.split('/').pop() ?? ''))
    })

    // drift direction
    const exportCount = data.contents.reduce((s, c) => s + countExports(c), 0)
    const importCount = data.contents.reduce((s, c) => s + countImports(c), 0)
    let driftDirection: DriftDirection = 'stable'
    if (exportCount > importCount * 1.5) driftDirection = 'expanding'
    else if (importCount > exportCount * 1.5) driftDirection = 'contracting'

    let riskAssessment = 'stable'
    if (pressureBuildup > 70) riskAssessment = 'high pressure — reduce complexity'
    else if (pressureBuildup > 40) riskAssessment = 'moderate pressure — monitor'
    else if (stability < 30) riskAssessment = 'low stability — needs attention'

    plates.push({
      name: dir,
      files: data.files,
      stability,
      pressureBuildup,
      boundaries,
      driftDirection,
      riskAssessment,
    })
  }

  return plates
}

// ─── Seismic Zones ─────────────────────────────────────────────────────────────

/**
 * Map seismic zones per directory.
 *
 * @example
 * mapSeismicZones(events, faultLines, plates) // => [{ zone: 'src', ... }]
 */
export function mapSeismicZones(events: SeismicEvent[], faultLines: FaultLine[], plates: TectonicPlate[]): SeismicZone[] {
  const zoneMap = new Map<string, SeismicEvent[]>()

  for (const event of events) {
    const dir = getDirectory(event.file)
    const existing = zoneMap.get(dir) ?? []
    existing.push(event)
    zoneMap.set(dir, existing)
  }

  // also add zones from plates that have no events
  for (const plate of plates) {
    if (!zoneMap.has(plate.name)) {
      zoneMap.set(plate.name, [])
    }
  }

  const zones: SeismicZone[] = []
  for (const [dir, dirEvents] of zoneMap) {
    const magnitude = dirEvents.length > 0
      ? Math.round((dirEvents.reduce((s, e) => s + e.magnitude, 0) / dirEvents.length) * 10) / 10
      : 0

    const frequency = dirEvents.length

    let risk: ZoneRisk = 'stable'
    if (magnitude >= 7 || frequency >= 8) risk = 'catastrophic'
    else if (magnitude >= 5 || frequency >= 5) risk = 'major'
    else if (magnitude >= 3 || frequency >= 3) risk = 'moderate'
    else if (magnitude >= 1 || frequency >= 1) risk = 'minor'

    let recommendation = 'No significant activity'
    if (risk === 'catastrophic') recommendation = 'Immediate action required — reduce complexity and add tests'
    else if (risk === 'major') recommendation = 'High risk — consider refactoring and increased test coverage'
    else if (risk === 'moderate') recommendation = 'Monitor closely — add documentation and type safety'
    else if (risk === 'minor') recommendation = 'Low risk — maintain current practices'

    zones.push({ zone: dir, events: dirEvents, magnitude, frequency, risk, recommendation })
  }

  return zones
}

// ─── Risk & Pressure ───────────────────────────────────────────────────────────

/**
 * Compute overall pressure index (0-100).
 *
 * @example
 * computePressureIndex(stats) // => 45
 */
export function computePressureIndex(stats: Pick<SeismicStats, 'avgMagnitude' | 'activeFaultLines' | 'hyperactiveFaultLines' | 'highPressurePlates' | 'earthquakeCount'>): number {
  const magPressure = Math.min(40, stats.avgMagnitude * 4)
  const faultPressure = Math.min(30, (stats.activeFaultLines + stats.hyperactiveFaultLines * 3) * 5)
  const platePressure = Math.min(30, stats.highPressurePlates * 10)

  return Math.min(100, Math.round(magPressure + faultPressure + platePressure))
}

/**
 * Classify overall risk.
 *
 * @example
 * classifyOverallRisk(3.5, 2, 45) // => 'moderate'
 */
export function classifyOverallRisk(avgMagnitude: number, activeFaults: number, pressureIndex: number): OverallRisk {
  const score = avgMagnitude * 2 + activeFaults * 1.5 + pressureIndex * 0.3
  if (score >= 30) return 'catastrophic'
  if (score >= 20) return 'major'
  if (score >= 12) return 'moderate'
  if (score >= 5) return 'minor'
  return 'stable'
}

// ─── Find Dominant ─────────────────────────────────────────────────────────────

/**
 * Find the most common value.
 *
 * @example
 * findDominant(['a', 'b', 'a']) // => 'a'
 */
export function findDominant<T extends string>(values: T[]): T {
  if (values.length === 0) return 'stable' as T
  const counts = new Map<T, number>()
  for (const v of values) {
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  let dominant = values[0]
  let maxCount = 0
  for (const [val, count] of counts) {
    if (count > maxCount) {
      maxCount = count
      dominant = val
    }
  }
  return dominant
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate seismic recommendations.
 *
 * @example
 * generateRecommendations(events, faultLines, plates, zones, stats)
 * // => ['Active fault lines need attention...']
 */
export function generateRecommendations(
  events: SeismicEvent[],
  faultLines: FaultLine[],
  plates: TectonicPlate[],
  zones: SeismicZone[],
  stats: SeismicStats,
): string[] {
  const recs: string[] = []

  const activeFaults = faultLines.filter(f => f.activityLevel === 'active' || f.activityLevel === 'hyperactive')
  if (activeFaults.length > 0) {
    recs.push(`Stabilize ${activeFaults.length} active fault line(s) — add tests or refactor frequently changing files`)
  }

  const highPressure = plates.filter(p => p.pressureBuildup > 60)
  if (highPressure.length > 0) {
    recs.push(`Reduce pressure in ${highPressure.length} plate(s) — address tech debt and reduce complexity`)
  }

  const earthquakeZones = zones.filter(z => z.risk === 'major' || z.risk === 'catastrophic')
  if (earthquakeZones.length > 0) {
    recs.push(`Increase monitoring in ${earthquakeZones.length} high-risk zone(s) — ${earthquakeZones.map(z => z.zone).join(', ')}`)
  }

  const silentEvents = events.filter(e => e.type === 'silent')
  if (silentEvents.length > 0) {
    recs.push(`Investigate ${silentEvents.length} silent event(s) — hidden complexity needs documentation`)
  }

  if (stats.overallRisk === 'catastrophic' || stats.overallRisk === 'major') {
    recs.push('Overall seismic risk is high — prioritize stability improvements across the codebase')
  }

  if (stats.pressureIndex > 60) {
    recs.push(`Pressure index is ${stats.pressureIndex}/100 — address technical debt before it triggers earthquakes`)
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the full seismic analysis result.
 *
 * @example
 * buildSeismicResult(['app.ts'], ['const x = 1'], {})
 * // => { events: [...], faultLines: [...], plates: [...], ... }
 */
export function buildSeismicResult(files: string[], contents: string[], options: SeismicOptions): SeismicResult {
  const maxDepth = files.length > 0 ? Math.max(...files.map(f => f.split('/').length - 1)) : 1

  // build events
  const events: SeismicEvent[] = files.map((file, idx) => {
    const content = contents[idx]
    const magnitude = computeMagnitude(content)
    const depth = computeDepth(file, maxDepth)

    // find affected files (files that import from this file)
    const base = file.replace(/\.\w+$/, '')
    const baseName = base.split('/').pop() ?? ''
    const affectedFiles = files.filter((f, i) => {
      if (i === idx) return false
      return extractImportPaths(contents[i]).some(p => p.includes(baseName))
    })

    // count files in same directory for frequency
    const sameDir = files.filter(f => getDirectory(f) === getDirectory(file))
    const frequency = sameDir.length

    const cascadeDepth = affectedFiles.length
    const type = classifyEventType(magnitude, frequency > 3 ? 3 : 0, cascadeDepth)

    return {
      file,
      magnitude,
      depth,
      type,
      timestamp: idx,
      epicenter: file,
      affectedFiles,
      description: `${type} in ${file} (magnitude ${magnitude})`,
    }
  })

  const faultLines = identifyFaultLines(events, files)
  const plates = identifyTectonicPlates(files, contents)
  const zones = mapSeismicZones(events, faultLines, plates)

  // stats
  const tremorCount = events.filter(e => e.type === 'tremor').length
  const earthquakeCount = events.filter(e => e.type === 'earthquake').length
  const aftershockCount = events.filter(e => e.type === 'aftershock').length
  const swarmCount = events.filter(e => e.type === 'swarm').length
  const silentCount = events.filter(e => e.type === 'silent').length

  const avgMagnitude = events.length > 0
    ? Math.round((events.reduce((s, e) => s + e.magnitude, 0) / events.length) * 10) / 10
    : 0
  const maxMagnitude = events.length > 0
    ? Math.round(Math.max(...events.map(e => e.magnitude)) * 10) / 10
    : 0

  const activeFaultLines = faultLines.filter(f => f.activityLevel === 'active').length
  const dormantFaultLines = faultLines.filter(f => f.activityLevel === 'dormant').length
  const hyperactiveFaultLines = faultLines.filter(f => f.activityLevel === 'hyperactive').length

  const avgPlateStability = plates.length > 0
    ? Math.round(plates.reduce((s, p) => s + p.stability, 0) / plates.length)
    : 100
  const highPressurePlates = plates.filter(p => p.pressureBuildup > 60).length

  const pressureIndex = computePressureIndex({
    avgMagnitude,
    activeFaultLines,
    hyperactiveFaultLines,
    highPressurePlates,
    earthquakeCount,
  })

  const overallRisk = classifyOverallRisk(avgMagnitude, activeFaultLines + hyperactiveFaultLines, pressureIndex)

  const sortedZones = [...zones].sort((a, b) => b.magnitude - a.magnitude)
  const mostActiveZone = sortedZones.length > 0 ? sortedZones[0].zone : ''
  const stableZones = [...zones].sort((a, b) => a.magnitude - b.magnitude)
  const mostStableZone = stableZones.length > 0 ? stableZones[0].zone : ''

  const stats: SeismicStats = {
    totalEvents: events.length,
    avgMagnitude,
    maxMagnitude,
    tremorCount,
    earthquakeCount,
    aftershockCount,
    swarmCount,
    silentCount,
    activeFaultLines,
    dormantFaultLines,
    hyperactiveFaultLines,
    avgPlateStability,
    highPressurePlates,
    overallRisk,
    mostActiveZone,
    mostStableZone,
    pressureIndex,
  }

  const recommendations = generateRecommendations(events, faultLines, plates, zones, stats)

  return { events, faultLines, plates, zones, stats, recommendations }
}
