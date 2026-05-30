// ─── Types ─────────────────────────────────────────────────────────────────────

export type CampType = 'base-camp' | 'camp-1' | 'camp-2' | 'camp-3' | 'high-camp' | 'summit'
export type WeatherType = 'stable' | 'changing' | 'volatile'
export type PeakClassification = 'valley' | 'foothill' | 'ridge' | 'peak' | 'summit'
export type RouteDifficulty = 'easy' | 'moderate' | 'challenging' | 'extreme'

export interface Camp {
  elevation: number
  files: string[]
  description: string
  type: CampType
}

export interface Route {
  from: string
  to: string
  improvements: string[]
  difficulty: RouteDifficulty
}

export interface Expedition {
  name: string
  baseElevation: number
  summitElevation: number
  averageElevation: number
  camps: Camp[]
  routes: Route[]
}

export interface Peak {
  file: string
  elevation: number
  difficulty: number
  oxygen: number
  equipment: number
  weather: WeatherType
  view: number
  classification: PeakClassification
}

export interface SummitStats {
  totalPeaks: number
  summitCount: number
  valleyCount: number
  avgElevation: number
  highestPeak: string
  deepestValley: string
  oxygenDeprivation: number
  equipmentGaps: number
  trailCondition: number
}

export interface SummitResult {
  expedition: Expedition
  peaks: Peak[]
  stats: SummitStats
  recommendations: string[]
}

// ─── Elevation / Quality Score ─────────────────────────────────────────────────

/**
 * Compute elevation (quality score 0-100).
 *
 * @example
 * computeElevation('const x = 1', 'a.ts')
 */
export function computeElevation(content: string, file: string): number {
  const view = computeView(content)
  const oxygen = computeOxygen(content)
  const equipment = computeEquipment(file)
  const difficulty = computeDifficulty(content)
  const inverseDifficulty = Math.max(0, 100 - difficulty)
  const typeSafety = computeTypeSafety(content)

  const score = Math.round(
    view * 0.25 +
    oxygen * 0.20 +
    equipment * 0.20 +
    inverseDifficulty * 0.15 +
    70 * 0.10 +
    typeSafety * 0.10,
  )
  return Math.max(0, Math.min(100, score))
}

// ─── Difficulty ────────────────────────────────────────────────────────────────

/**
 * Compute difficulty (complexity 0-100).
 *
 * @example
 * computeDifficulty('if (x) { for (let i = 0; i < 10; i++) {} }')
 */
export function computeDifficulty(content: string): number {
  const patterns = [/\bif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcatch\b/g, /&&/g, /\|\|/g]
  let total = 1
  for (const pat of patterns) {
    const m = content.match(pat)
    if (m) total += m.length
  }
  return Math.min(100, total)
}

// ─── Oxygen / Documentation ────────────────────────────────────────────────────

/**
 * Compute oxygen (documentation coverage 0-100).
 *
 * @example
 * computeOxygen('export function foo() {}')
 */
export function computeOxygen(content: string): number {
  const exports = (content.match(/^export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+/gm) || []).length
  const jsdoc = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
  if (exports === 0) return jsdoc > 0 ? 80 : 50
  return Math.min(100, Math.round((jsdoc / exports) * 100))
}

// ─── Equipment / Test Coverage ─────────────────────────────────────────────────

/**
 * Compute equipment (test coverage estimate 0-100).
 *
 * @example
 * computeEquipment('mod.test.ts')
 */
export function computeEquipment(file: string): number {
  if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(file)) return 100
  if (/^test\//.test(file) || /^tests?\//.test(file)) return 100
  if (/__tests__\//.test(file)) return 100
  return 30
}

// ─── Weather / Stability ──────────────────────────────────────────────────────

/**
 * Classify weather (change stability).
 *
 * @example
 * classifyWeather('mod.ts', 5)
 */
export function classifyWeather(_file: string, changeCount: number): WeatherType {
  if (changeCount <= 3) return 'stable'
  if (changeCount <= 8) return 'changing'
  return 'volatile'
}

// ─── View / Code Clarity ──────────────────────────────────────────────────────

/**
 * Compute view (code clarity 0-100).
 *
 * @example
 * computeView('function calculateTotal(a: number, b: number) { return a + b }')
 */
export function computeView(content: string): number {
  let score = 40

  const goodNames = content.match(/(?:const|let|function|class)\s+[a-z][a-zA-Z0-9]{2,}/g)
  if (goodNames && goodNames.length > 2) score += 15
  else if (goodNames && goodNames.length > 0) score += 5

  const lines = content.split('\n').filter((l) => l.trim().length > 0)
  const avgLineLen = lines.length > 0 ? lines.reduce((s, l) => s + l.length, 0) / lines.length : 0
  if (avgLineLen > 0 && avgLineLen < 80) score += 15
  else if (avgLineLen >= 80 && avgLineLen < 120) score += 5

  const blankLines = content.split('\n').filter((l) => l.trim().length === 0).length
  const blankRatio = lines.length > 0 ? blankLines / lines.length : 0
  if (blankRatio > 0.05 && blankRatio < 0.3) score += 10

  const typeAnnotations = content.match(/:\s*(string|number|boolean|void|any|never|unknown|object)\b/g)
  if (typeAnnotations && typeAnnotations.length > 2) score += 10

  const functions = (content.match(/\bfunction\b|=>\s*[{(]/g) || []).length
  if (functions > 0 && functions <= 5) score += 10
  else if (functions > 10) score -= 5

  return Math.max(0, Math.min(100, score))
}

// ─── Type Safety ───────────────────────────────────────────────────────────────

/**
 * Compute type safety score 0-100.
 *
 * @example
 * computeTypeSafety('function add(a: number, b: number): number {}')
 */
export function computeTypeSafety(content: string): number {
  let score = 50

  const typeAnnotations = content.match(/:\s*(string|number|boolean|void|any|never|unknown|object|Array|Record|Map|Set)\b/g)
  if (typeAnnotations) score += Math.min(30, typeAnnotations.length * 5)

  const anyUsage = (content.match(/:\s*any\b/g) || []).length
  score -= anyUsage * 10

  const generics = (content.match(/<\w+>/g) || []).length
  if (generics > 0) score += Math.min(10, generics * 3)

  return Math.max(0, Math.min(100, score))
}

// ─── Peak Classification ──────────────────────────────────────────────────────

/**
 * Classify a peak by elevation.
 *
 * @example
 * classifyPeak(90)
 */
export function classifyPeak(elevation: number): PeakClassification {
  if (elevation >= 85) return 'summit'
  if (elevation >= 70) return 'peak'
  if (elevation >= 50) return 'ridge'
  if (elevation >= 25) return 'foothill'
  return 'valley'
}

// ─── Camp Establishment ────────────────────────────────────────────────────────

/**
 * Establish camps grouping peaks by elevation.
 *
 * @example
 * establishCamps(peaks)
 */
export function establishCamps(peaks: Peak[]): Camp[] {
  const ranges: { type: CampType; min: number; max: number; description: string }[] = [
    { type: 'base-camp', min: 0, max: 25, description: 'Foundational code — needs significant improvement' },
    { type: 'camp-1', min: 25, max: 40, description: 'Basic quality — covering the essentials' },
    { type: 'camp-2', min: 40, max: 55, description: 'Developing quality — gaining elevation' },
    { type: 'camp-3', min: 55, max: 70, description: 'Solid quality — above average' },
    { type: 'high-camp', min: 70, max: 85, description: 'High quality — approaching excellence' },
    { type: 'summit', min: 85, max: 101, description: 'Exemplary code — the standard to follow' },
  ]

  const camps: Camp[] = []
  for (const range of ranges) {
    const files = peaks
      .filter((p) => p.elevation >= range.min && p.elevation < range.max)
      .map((p) => p.file)
    const avgElev = files.length > 0
      ? Math.round(peaks.filter((p) => p.elevation >= range.min && p.elevation < range.max).reduce((s, p) => s + p.elevation, 0) / files.length)
      : range.min
    camps.push({ type: range.type, elevation: avgElev, files, description: range.description })
  }

  return camps
}

// ─── Route Planning ────────────────────────────────────────────────────────────

/**
 * Plan improvement routes from low to high quality files.
 *
 * @example
 * planRoutes(peaks)
 */
export function planRoutes(peaks: Peak[]): Route[] {
  if (peaks.length < 2) return []

  const sorted = [...peaks].sort((a, b) => a.elevation - b.elevation)
  const bottom = sorted.slice(0, Math.max(1, Math.floor(sorted.length / 3)))
  const top = sorted.slice(-Math.max(1, Math.floor(sorted.length / 3)))

  const routes: Route[] = []
  const used = new Set<string>()

  for (const low of bottom) {
    const high = top.find((t) => !used.has(t.file) && t.elevation > low.elevation + 20)
    if (!high) continue
    used.add(high.file)

    const improvements: string[] = []
    if (high.oxygen > low.oxygen + 20) improvements.push('Add documentation')
    if (high.equipment > low.equipment + 20) improvements.push('Add test coverage')
    if (high.view > low.view + 20) improvements.push('Improve naming and structure')
    if (high.difficulty < low.difficulty - 10) improvements.push('Reduce complexity')
    if (improvements.length === 0) improvements.push('Follow the patterns in the target file')

    const gap = high.elevation - low.elevation
    const difficulty: RouteDifficulty = gap > 50 ? 'extreme' : gap > 35 ? 'challenging' : gap > 20 ? 'moderate' : 'easy'

    routes.push({ from: low.file, to: high.file, improvements, difficulty })
  }

  return routes
}

// ─── Expedition ────────────────────────────────────────────────────────────────

/**
 * Compute expedition summary.
 *
 * @example
 * computeExpedition(peaks)
 */
export function computeExpedition(peaks: Peak[]): Expedition {
  const elevations = peaks.map((p) => p.elevation)
  const baseElevation = elevations.length > 0 ? Math.min(...elevations) : 0
  const summitElevation = elevations.length > 0 ? Math.max(...elevations) : 0
  const averageElevation = elevations.length > 0 ? Math.round(elevations.reduce((s, v) => s + v, 0) / elevations.length) : 0

  const camps = establishCamps(peaks)
  const routes = planRoutes(peaks)

  return {
    name: 'Quality Expedition',
    baseElevation,
    summitElevation,
    averageElevation,
    camps,
    routes,
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate summit recommendations.
 *
 * @example
 * generateRecommendations(peaks, expedition, stats)
 */
export function generateRecommendations(peaks: Peak[], expedition: Expedition, stats: SummitStats): string[] {
  const recs: string[] = []

  const valleys = peaks.filter((p) => p.classification === 'valley')
  if (valleys.length > 0) {
    recs.push(`${valleys.length} valley file(s) need attention — start climbing with basic improvements`)
  }

  if (stats.oxygenDeprivation > 40) {
    recs.push(`${stats.oxygenDeprivation}% of files lack documentation — oxygen is running low`)
  }

  if (stats.equipmentGaps > 50) {
    recs.push(`${stats.equipmentGaps}% of files lack test coverage — gear up before the climb`)
  }

  const summits = peaks.filter((p) => p.classification === 'summit')
  if (summits.length > 0) {
    recs.push(`${summits.length} summit file(s) found — use as exemplars for the team`)
  }

  if (expedition.routes.length > 0) {
    recs.push(`${expedition.routes.length} route(s) planned — follow them to reach higher quality`)
  }

  if (stats.trailCondition < 50) {
    recs.push('Trail condition is poor — improve naming and structure for better readability')
  }

  if (recs.length === 0) {
    recs.push('The expedition reveals a well-maintained codebase — keep climbing')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete summit result.
 *
 * @example
 * buildSummitResult(['a.ts'], ['const x = 1'], {})
 */
export function buildSummitResult(files: string[], contents: string[], _options: Record<string, unknown>): SummitResult {
  if (files.length === 0) {
    const emptyStats: SummitStats = {
      totalPeaks: 0, summitCount: 0, valleyCount: 0, avgElevation: 0,
      highestPeak: 'none', deepestValley: 'none',
      oxygenDeprivation: 0, equipmentGaps: 0, trailCondition: 0,
    }
    return {
      expedition: { name: 'Empty Expedition', baseElevation: 0, summitElevation: 0, averageElevation: 0, camps: [], routes: [] },
      peaks: [], stats: emptyStats, recommendations: ['No files to analyze'],
    }
  }

  const peaks: Peak[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    const elevation = computeElevation(content, file)
    const difficulty = computeDifficulty(content)
    const oxygen = computeOxygen(content)
    const equipment = computeEquipment(file)
    const weather = classifyWeather(file, 0)
    const view = computeView(content)
    const classification = classifyPeak(elevation)

    return { file, elevation, difficulty, oxygen, equipment, weather, view, classification }
  })

  const expedition = computeExpedition(peaks)

  const summitCount = peaks.filter((p) => p.classification === 'summit').length
  const valleyCount = peaks.filter((p) => p.classification === 'valley').length
  const avgElevation = Math.round(peaks.reduce((s, p) => s + p.elevation, 0) / peaks.length)

  const sorted = [...peaks].sort((a, b) => b.elevation - a.elevation)
  const highestPeak = sorted[0]?.file ?? 'none'
  const deepestValley = sorted[sorted.length - 1]?.file ?? 'none'

  const lowOxygen = peaks.filter((p) => p.oxygen < 30).length
  const oxygenDeprivation = Math.round((lowOxygen / peaks.length) * 100)

  const lowEquipment = peaks.filter((p) => p.equipment < 50).length
  const equipmentGaps = Math.round((lowEquipment / peaks.length) * 100)

  const trailCondition = Math.round(peaks.reduce((s, p) => s + p.view, 0) / peaks.length)

  const stats: SummitStats = {
    totalPeaks: peaks.length,
    summitCount,
    valleyCount,
    avgElevation,
    highestPeak,
    deepestValley,
    oxygenDeprivation,
    equipmentGaps,
    trailCondition,
  }

  const recommendations = generateRecommendations(peaks, expedition, stats)

  return { expedition, peaks, stats, recommendations }
}
