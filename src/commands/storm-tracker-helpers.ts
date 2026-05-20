// ─── Types ─────────────────────────────────────────────────────────────────────

export type SystemType = 'cyclone' | 'thunderstorm' | 'tornado' | 'hurricane' | 'front' | 'high-pressure' | 'low-pressure' | 'drought' | 'fog' | 'clear'
export type SystemCategory = 1 | 2 | 3 | 4 | 5
export type Movement = 'stationary' | 'slow-moving' | 'fast-moving' | 'expanding' | 'contracting'
export type FileCondition = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'hazy'
export type ShortTermForecast = 'stable' | 'minor-changes' | 'major-refactor' | 'rewrite-likely'
export type LongTermForecast = 'improving' | 'stable' | 'degrading' | 'critical'
export type RiskLevel = 'low' | 'moderate' | 'high' | 'extreme'
export type OverallWeather = 'calm' | 'unsettled' | 'stormy' | 'severe' | 'catastrophic'

export interface WeatherSystem {
  id: string
  type: SystemType
  name: string
  epicenter: string
  affectedFiles: string[]
  intensity: number
  category: SystemCategory
  movement: Movement
  description: string
  forecast: string
}

export interface AtmosphericCondition {
  file: string
  temperature: number
  humidity: number
  pressure: number
  windSpeed: number
  visibility: number
  precipitation: number
  condition: FileCondition
}

export interface WeatherForecast {
  area: string
  shortTerm: ShortTermForecast
  longTerm: LongTermForecast
  riskLevel: RiskLevel
  predictedIssues: string[]
  confidence: number
}

export interface StormTrackerStats {
  totalSystems: number
  cyclones: number
  thunderstorms: number
  tornadoes: number
  hurricanes: number
  droughts: number
  clearAreas: number
  avgTemperature: number
  avgHumidity: number
  avgPressure: number
  avgVisibility: number
  hottestFile: string
  mostCoupledFile: string
  highestPressureFile: string
  clearestFile: string
  overallWeather: OverallWeather
  stormIndex: number
  stabilityIndex: number
  forecastConfidence: number
}

export interface StormTrackerResult {
  systems: WeatherSystem[]
  conditions: AtmosphericCondition[]
  forecasts: WeatherForecast[]
  stats: StormTrackerStats
  recommendations: string[]
}

export interface StormTrackerOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Temperature ───────────────────────────────────────────────────────────────

/**
 * Compute code temperature (complexity heat) 0-100.
 *
 * @example
 * computeTemperature('if (x) { if (y) { } }') // => 30
 */
export function computeTemperature(content: string): number {
  if (content.trim().length === 0) return 20

  let temp = 20
  const lines = content.split('\n').filter(l => l.trim().length > 0)

  let complexity = 1
  const complexityPatterns = [/\bif\b/g, /\belse\s+if\b/g, /\bfor\b/g, /\bwhile\b/g, /\bcase\b/g, /\bcatch\b/g, /&&/g, /\|\|/g]
  for (const p of complexityPatterns) {
    const m = content.match(p)
    if (m) complexity += m.length
  }
  temp += Math.min(complexity * 3, 30)

  let nesting = 0
  let maxNesting = 0
  for (const ch of content) {
    if (ch === '{') { nesting++; if (nesting > maxNesting) maxNesting = nesting }
    else if (ch === '}') { nesting = Math.max(0, nesting - 1) }
  }
  temp += Math.min(maxNesting * 5, 20)

  const functions = (content.match(/function\s+\w+|=>\s*[{(]/g) ?? []).length
  temp += Math.min(functions * 2, 15)

  if (lines.length > 100) temp += 10
  if (lines.length > 300) temp += 5

  return Math.max(0, Math.min(100, temp))
}

// ─── Humidity ──────────────────────────────────────────────────────────────────

/**
 * Compute coupling humidity 0-100.
 *
 * @example
 * computeHumidity("import { x } from './a'\nimport { y } from './b'", 5) // => 40
 */
export function computeHumidity(content: string, totalFiles: number): number {
  if (content.trim().length === 0) return 0
  if (totalFiles <= 1) return 10

  let humidity = 10
  const imports = (content.match(/^import\s.*from\s+['"]\.+/gm) ?? []).length
  const allImports = (content.match(/^import\s/gm) ?? []).length

  humidity += Math.min(imports * 8, 40)
  humidity += Math.min(allImports * 3, 20)

  const exports = (content.match(/^export\s/gm) ?? []).length
  humidity += Math.min(exports * 3, 20)

  return Math.max(0, Math.min(100, humidity))
}

// ─── Pressure ──────────────────────────────────────────────────────────────────

/**
 * Compute technical debt pressure 0-100.
 *
 * @example
 * computePressure('// TODO: fix\n// HACK: workaround') // => 30
 */
export function computePressure(content: string): number {
  if (content.trim().length === 0) return 0

  let pressure = 5
  const todos = (content.match(/TODO/g) ?? []).length
  const fixmes = (content.match(/FIXME/g) ?? []).length
  const hacks = (content.match(/HACK/g) ?? []).length
  const xxxs = (content.match(/XXX/g) ?? []).length

  pressure += todos * 8
  pressure += fixmes * 10
  pressure += hacks * 12
  pressure += xxxs * 10

  if (/\bvar\s/.test(content)) pressure += 5
  if (/\beval\s*\(/.test(content)) pressure += 15
  if (/\bany\b/.test(content)) pressure += 5

  return Math.max(0, Math.min(100, pressure))
}

// ─── Wind Speed ────────────────────────────────────────────────────────────────

/**
 * Compute wind speed (rate of change proxy) 0-100.
 *
 * @example
 * computeWindSpeed(content) // => 30
 */
export function computeWindSpeed(content: string): number {
  if (content.trim().length === 0) return 0

  let speed = 10
  const lines = content.split('\n').filter(l => l.trim().length > 0)

  speed += Math.min(lines.length / 10, 20)

  const changes = (content.match(/\/\/.*$|\/\*/gm) ?? []).length
  speed += Math.min(changes * 2, 15)

  const branches = (content.match(/\bif\b|\belse\b|\bswitch\b/g) ?? []).length
  speed += Math.min(branches * 2, 15)

  if (lines.length > 200) speed += 10
  if (lines.length > 500) speed += 10

  return Math.max(0, Math.min(100, Math.round(speed)))
}

// ─── Visibility ────────────────────────────────────────────────────────────────

/**
 * Compute code visibility (clarity) 0-100.
 *
 * @example
 * computeVisibility('/** doc *\/ function foo() {}') // => 80
 */
export function computeVisibility(content: string): number {
  if (content.trim().length === 0) return 100

  let vis = 50
  const lines = content.split('\n')
  const nonEmpty = lines.filter(l => l.trim().length > 0)

  const jsdoc = (content.match(/\/\*\*[\s\S]*?\*\//g) ?? []).length
  const inline = (content.match(/\/\/.*$/gm) ?? []).length
  const commentRatio = (jsdoc + inline) / Math.max(nonEmpty.length, 1)

  if (commentRatio > 0.15) vis += 15
  if (commentRatio > 0.25) vis += 10

  const avgLineLen = nonEmpty.length > 0
    ? nonEmpty.reduce((s, l) => s + l.length, 0) / nonEmpty.length : 0
  if (avgLineLen > 0 && avgLineLen < 80) vis += 10
  if (avgLineLen > 120) vis -= 10

  let maxNesting = 0
  let nesting = 0
  for (const ch of content) {
    if (ch === '{') { nesting++; if (nesting > maxNesting) maxNesting = nesting }
    else if (ch === '}') { nesting = Math.max(0, nesting - 1) }
  }
  if (maxNesting <= 2) vis += 10
  if (maxNesting > 5) vis -= 15

  return Math.max(0, Math.min(100, vis))
}

// ─── Precipitation ─────────────────────────────────────────────────────────────

/**
 * Compute precipitation (issue density) 0-100.
 *
 * @example
 * computePrecipitation('// TODO: fix\nconsole.log("debug")') // => 20
 */
export function computePrecipitation(content: string): number {
  if (content.trim().length === 0) return 0

  let precip = 0
  precip += (content.match(/TODO|FIXME|HACK|XXX/g) ?? []).length * 8
  precip += (content.match(/console\.log/g) ?? []).length * 5
  precip += (content.match(/\bvar\s/g) ?? []).length * 3
  precip += (content.match(/\beval\s*\(/g) ?? []).length * 10

  return Math.max(0, Math.min(100, precip))
}

// ─── Condition Classification ──────────────────────────────────────────────────

/**
 * Classify file weather condition.
 *
 * @example
 * classifyCondition(20, 30, 90) // => 'sunny'
 */
export function classifyCondition(temp: number, humidity: number, visibility: number): FileCondition {
  if (visibility < 30) return 'foggy'
  if (temp > 70 && humidity > 60) return 'stormy'
  if (temp > 50 && humidity > 40) return 'rainy'
  if (humidity > 60) return 'cloudy'
  if (visibility < 60) return 'hazy'
  if (temp > 40 || humidity > 30) return 'partly-cloudy'
  return 'sunny'
}

// ─── Cyclone Detection ─────────────────────────────────────────────────────────

/**
 * Detect cyclones (circular dependencies).
 *
 * @example
 * detectCyclones(['a.ts','b.ts'], ["import {x} from './b'","import {y} from './a'"]) // => [WeatherSystem]
 */
export function detectCyclones(files: string[], contents: string[]): WeatherSystem[] {
  const systems: WeatherSystem[] = []
  const importGraph = new Map<string, Set<string>>()

  for (let i = 0; i < files.length; i++) {
    const deps = new Set<string>()
    const matches = (contents[i] ?? '').matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g)
    for (const m of matches) {
      const source = m[1]
      if (source.startsWith('.')) {
        for (const f of files) {
          if (f !== files[i] && (f.includes(source.replace(/^\.\//, '')) || source.includes(f.replace(/\.\w+$/, '')))) {
            deps.add(f)
          }
        }
      }
    }
    importGraph.set(files[i], deps)
  }

  const visited = new Set<string>()
  const recStack = new Set<string>()
  const cycles: string[][] = []

  const dfs = (node: string, path: string[]): void => {
    visited.add(node)
    recStack.add(node)
    path.push(node)

    const deps = importGraph.get(node) ?? new Set()
    for (const dep of deps) {
      if (!visited.has(dep)) {
        dfs(dep, [...path])
      } else if (recStack.has(dep)) {
        const cycleStart = path.indexOf(dep)
        if (cycleStart >= 0) {
          cycles.push(path.slice(cycleStart))
        }
      }
    }

    recStack.delete(node)
  }

  for (const file of files) {
    if (!visited.has(file)) {
      dfs(file, [])
    }
  }

  for (let i = 0; i < cycles.length; i++) {
    const cycle = cycles[i]
    const intensity = Math.min(100, cycle.length * 20 + 40)
    systems.push({
      id: `cyclone-${i}`,
      type: 'cyclone',
      name: `Cyclone ${String.fromCharCode(65 + (i % 26))}`,
      epicenter: cycle[0] ?? 'unknown',
      affectedFiles: cycle,
      intensity,
      category: Math.min(5, Math.max(1, Math.ceil(intensity / 20))) as SystemCategory,
      movement: 'stationary',
      description: `Circular dependency: ${cycle.join(' → ')} → ${cycle[0]}`,
      forecast: 'Will cause build issues if dependencies change',
    })
  }

  return systems
}

// ─── Thunderstorm Detection ────────────────────────────────────────────────────

/**
 * Detect thunderstorms (high churn/complexity files).
 *
 * @example
 * detectThunderstorms(conditions) // => [WeatherSystem]
 */
export function detectThunderstorms(conditions: AtmosphericCondition[]): WeatherSystem[] {
  const systems: WeatherSystem[] = []
  let count = 0

  for (const c of conditions) {
    if (c.temperature > 60 && c.windSpeed > 50) {
      count++
      systems.push({
        id: `thunderstorm-${count}`,
        type: 'thunderstorm',
        name: `Thunderstorm ${count}`,
        epicenter: c.file,
        affectedFiles: [c.file],
        intensity: Math.round((c.temperature + c.windSpeed) / 2),
        category: Math.min(5, Math.max(1, Math.ceil((c.temperature + c.windSpeed) / 40))) as SystemCategory,
        movement: 'fast-moving',
        description: `High complexity (temp:${c.temperature}) with rapid change indicators (wind:${c.windSpeed})`,
        forecast: 'Likely to require frequent fixes',
      })
    }
  }

  return systems
}

// ─── Hurricane Detection ───────────────────────────────────────────────────────

/**
 * Detect hurricanes (large files with far-reaching impact).
 *
 * @example
 * detectHurricanes(conditions, files) // => [WeatherSystem]
 */
export function detectHurricanes(conditions: AtmosphericCondition[], _files: string[]): WeatherSystem[] {
  const systems: WeatherSystem[] = []
  let count = 0

  for (const c of conditions) {
    if (c.humidity > 70 && c.temperature > 50) {
      count++
      const intensity = Math.round((c.humidity * 0.6) + (c.temperature * 0.4))
      systems.push({
        id: `hurricane-${count}`,
        type: 'hurricane',
        name: `Hurricane ${String.fromCharCode(65 + ((count - 1) % 26))}`,
        epicenter: c.file,
        affectedFiles: [c.file],
        intensity,
        category: Math.min(5, Math.max(1, Math.ceil(intensity / 20))) as SystemCategory,
        movement: 'expanding',
        description: `Large coupled file (humidity:${c.humidity}) with high complexity (temp:${c.temperature})`,
        forecast: 'Changes will ripple across many files',
      })
    }
  }

  return systems
}

// ─── Tornado Detection ─────────────────────────────────────────────────────────

/**
 * Detect tornadoes (spinning code).
 *
 * @example
 * detectTornadoes(conditions, contents) // => [WeatherSystem]
 */
export function detectTornadoes(conditions: AtmosphericCondition[], contents: string[]): WeatherSystem[] {
  const systems: WeatherSystem[] = []
  let count = 0

  for (let i = 0; i < conditions.length; i++) {
    const c = conditions[i]
    const content = contents[i] ?? ''

    if (c.temperature > 70) {
      let maxNesting = 0
      let nesting = 0
      for (const ch of content) {
        if (ch === '{') { nesting++; if (nesting > maxNesting) maxNesting = nesting }
        else if (ch === '}') { nesting = Math.max(0, nesting - 1) }
      }

      if (maxNesting > 5) {
        count++
        systems.push({
          id: `tornado-${count}`,
          type: 'tornado',
          name: `Tornado ${count}`,
          epicenter: c.file,
          affectedFiles: [c.file],
          intensity: Math.min(100, maxNesting * 15),
          category: Math.min(5, Math.max(1, Math.ceil(maxNesting / 2))) as SystemCategory,
          movement: 'stationary',
          description: `Deeply nested code (${maxNesting} levels) with high complexity`,
          forecast: 'Refactor to reduce nesting before it becomes unmaintainable',
        })
      }
    }
  }

  return systems
}

// ─── Drought Detection ─────────────────────────────────────────────────────────

/**
 * Detect droughts (stagnant/dead code).
 *
 * @example
 * detectDroughts(conditions) // => [WeatherSystem]
 */
export function detectDroughts(conditions: AtmosphericCondition[]): WeatherSystem[] {
  const systems: WeatherSystem[] = []
  let count = 0

  for (const c of conditions) {
    if (c.temperature < 25 && c.windSpeed < 20 && c.pressure < 10) {
      count++
      systems.push({
        id: `drought-${count}`,
        type: 'drought',
        name: `Drought ${count}`,
        epicenter: c.file,
        affectedFiles: [c.file],
        intensity: Math.round(100 - c.temperature - c.windSpeed),
        category: 1,
        movement: 'stationary',
        description: `Low activity file (temp:${c.temperature}, wind:${c.windSpeed}) — possibly dead code`,
        forecast: 'Verify this file is still needed',
      })
    }
  }

  return systems
}

// ─── Fog Detection ─────────────────────────────────────────────────────────────

/**
 * Detect foggy areas (poor visibility).
 *
 * @example
 * detectFog(conditions) // => [WeatherSystem]
 */
export function detectFog(conditions: AtmosphericCondition[]): WeatherSystem[] {
  const systems: WeatherSystem[] = []
  let count = 0

  for (const c of conditions) {
    if (c.visibility < 40) {
      count++
      systems.push({
        id: `fog-${count}`,
        type: 'fog',
        name: `Fog ${count}`,
        epicenter: c.file,
        affectedFiles: [c.file],
        intensity: Math.round(100 - c.visibility),
        category: Math.min(5, Math.max(1, Math.ceil((100 - c.visibility) / 20))) as SystemCategory,
        movement: 'stationary',
        description: `Low visibility code (vis:${c.visibility}/100) — poorly documented or unclear`,
        forecast: 'Add documentation to improve clarity',
      })
    }
  }

  return systems
}

// ─── Forecasts ─────────────────────────────────────────────────────────────────

/**
 * Generate weather forecasts.
 *
 * @example
 * generateForecasts(systems, conditions) // => [WeatherForecast]
 */
export function generateForecasts(systems: WeatherSystem[], conditions: AtmosphericCondition[]): WeatherForecast[] {
  const forecasts: WeatherForecast[] = []
  const dirMap = new Map<string, AtmosphericCondition[]>()

  for (const c of conditions) {
    const dir = c.file.includes('/') ? c.file.substring(0, c.file.lastIndexOf('/')) : '.'
    const entry = dirMap.get(dir) ?? []
    entry.push(c)
    dirMap.set(dir, entry)
  }

  for (const [dir, conds] of dirMap) {
    const avgTemp = conds.reduce((s, c) => s + c.temperature, 0) / conds.length
    const avgPressure = conds.reduce((s, c) => s + c.pressure, 0) / conds.length
    const dirSystems = systems.filter(s => s.affectedFiles.some(f => f.startsWith(dir)))
    const hasSevere = dirSystems.some(s => s.category >= 4)

    let shortTerm: ShortTermForecast = 'stable'
    if (hasSevere) shortTerm = 'rewrite-likely'
    else if (avgTemp > 60 || avgPressure > 50) shortTerm = 'major-refactor'
    else if (avgTemp > 35 || dirSystems.length > 2) shortTerm = 'minor-changes'

    let longTerm: LongTermForecast = 'stable'
    if (avgPressure > 60) longTerm = 'critical'
    else if (avgPressure > 30 || avgTemp > 50) longTerm = 'degrading'
    else if (avgTemp < 30 && avgPressure < 15) longTerm = 'improving'

    let riskLevel: RiskLevel = 'low'
    if (hasSevere) riskLevel = 'extreme'
    else if (dirSystems.length > 3 || avgPressure > 50) riskLevel = 'high'
    else if (dirSystems.length > 0 || avgTemp > 40) riskLevel = 'moderate'

    const predictedIssues: string[] = []
    if (avgPressure > 30) predictedIssues.push('Technical debt accumulation')
    if (avgTemp > 50) predictedIssues.push('Complexity growth')
    if (dirSystems.some(s => s.type === 'cyclone')) predictedIssues.push('Dependency conflicts')
    if (dirSystems.some(s => s.type === 'fog')) predictedIssues.push('Documentation gaps')

    const confidence = Math.min(100, Math.round(60 + (conds.length * 5)))

    forecasts.push({
      area: dir,
      shortTerm,
      longTerm,
      riskLevel,
      predictedIssues,
      confidence,
    })
  }

  return forecasts
}

// ─── Storm & Stability Index ───────────────────────────────────────────────────

/**
 * Compute storm index 0-100.
 *
 * @example
 * computeStormIndex(systems, conditions) // => 45
 */
export function computeStormIndex(systems: WeatherSystem[], conditions: AtmosphericCondition[]): number {
  let index = 0

  const severeSystems = systems.filter(s => s.category >= 4).length
  index += severeSystems * 20

  const moderateSystems = systems.filter(s => s.category >= 2 && s.category <= 3).length
  index += moderateSystems * 8

  if (conditions.length > 0) {
    const avgTemp = conditions.reduce((s, c) => s + c.temperature, 0) / conditions.length
    index += Math.round(avgTemp * 0.2)

    const stormyConds = conditions.filter(c => c.condition === 'stormy' || c.condition === 'rainy').length
    index += stormyConds * 5
  }

  return Math.max(0, Math.min(100, index))
}

/**
 * Compute stability index 0-100.
 *
 * @example
 * computeStabilityIndex(conditions) // => 70
 */
export function computeStabilityIndex(conditions: AtmosphericCondition[]): number {
  if (conditions.length === 0) return 100

  let stability = 100

  const avgTemp = conditions.reduce((s, c) => s + c.temperature, 0) / conditions.length
  stability -= avgTemp * 0.3

  const avgPressure = conditions.reduce((s, c) => s + c.pressure, 0) / conditions.length
  stability -= avgPressure * 0.2

  const avgHumidity = conditions.reduce((s, c) => s + c.humidity, 0) / conditions.length
  stability -= avgHumidity * 0.1

  const lowVis = conditions.filter(c => c.visibility < 40).length
  stability -= lowVis * 5

  return Math.max(0, Math.min(100, Math.round(stability)))
}

/**
 * Classify overall weather.
 *
 * @example
 * classifyOverallWeather(15, 85) // => 'calm'
 */
export function classifyOverallWeather(stormIndex: number, stability: number): OverallWeather {
  const composite = (stormIndex * 0.6) + ((100 - stability) * 0.4)

  if (composite >= 75) return 'catastrophic'
  if (composite >= 55) return 'severe'
  if (composite >= 35) return 'stormy'
  if (composite >= 15) return 'unsettled'
  return 'calm'
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate weather recommendations.
 *
 * @example
 * generateRecommendations(systems, conditions, forecasts, stats) // => ['Break...']
 */
export function generateRecommendations(
  systems: WeatherSystem[],
  conditions: AtmosphericCondition[],
  _forecasts: WeatherForecast[],
  _stats: StormTrackerStats,
): string[] {
  const recs: string[] = []

  const cyclones = systems.filter(s => s.type === 'cyclone')
  if (cyclones.length > 0) {
    recs.push(`Break ${cyclones.length} circular dependenc${cyclones.length > 1 ? 'ies' : 'y'} to resolve cyclones`)
  }

  const hurricanes = systems.filter(s => s.type === 'hurricane')
  if (hurricanes.length > 0) {
    recs.push(`Split ${hurricanes.length} large coupled file${hurricanes.length > 1 ? 's' : ''} to reduce hurricane impact`)
  }

  const highPressure = conditions.filter(c => c.pressure > 50)
  if (highPressure.length > 0) {
    recs.push(`Address technical debt in ${highPressure.length} high-pressure file${highPressure.length > 1 ? 's' : ''}`)
  }

  const fog = systems.filter(s => s.type === 'fog')
  if (fog.length > 0) {
    recs.push(`Add documentation to ${fog.length} foggy file${fog.length > 1 ? 's' : ''} to improve visibility`)
  }

  const droughts = systems.filter(s => s.type === 'drought')
  if (droughts.length > 0) {
    recs.push(`Verify ${droughts.length} drought file${droughts.length > 1 ? 's' : ''} still needed — may be dead code`)
  }

  const tornadoes = systems.filter(s => s.type === 'tornado')
  if (tornadoes.length > 0) {
    recs.push(`Reduce nesting in ${tornadoes.length} file${tornadoes.length > 1 ? 's' : ''} to clear tornadoes`)
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete storm tracker result.
 *
 * @example
 * buildStormTrackerResult(['a.ts'], ['code'], {}) // => StormTrackerResult
 */
export function buildStormTrackerResult(files: string[], contents: string[], options: StormTrackerOptions): StormTrackerResult {
  const conditions: AtmosphericCondition[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const temp = computeTemperature(content)
    const humidity = computeHumidity(content, files.length)
    const pressure = computePressure(content)
    const wind = computeWindSpeed(content)
    const visibility = computeVisibility(content)
    const precip = computePrecipitation(content)
    const condition = classifyCondition(temp, humidity, visibility)

    conditions.push({
      file: files[i],
      temperature: temp,
      humidity,
      pressure,
      windSpeed: wind,
      visibility,
      precipitation: precip,
      condition,
    })
  }

  const systems: WeatherSystem[] = []
  systems.push(...detectCyclones(files, contents))
  systems.push(...detectThunderstorms(conditions))
  systems.push(...detectHurricanes(conditions, files))
  systems.push(...detectTornadoes(conditions, contents))
  systems.push(...detectDroughts(conditions))
  systems.push(...detectFog(conditions))

  let clearCount = 0
  for (const c of conditions) {
    if (c.condition === 'sunny' && c.temperature < 30 && c.pressure < 15) {
      clearCount++
    }
  }

  const forecasts = generateForecasts(systems, conditions)

  const avgTemperature = conditions.length > 0
    ? Math.round(conditions.reduce((s, c) => s + c.temperature, 0) / conditions.length) : 0
  const avgHumidity = conditions.length > 0
    ? Math.round(conditions.reduce((s, c) => s + c.humidity, 0) / conditions.length) : 0
  const avgPressure = conditions.length > 0
    ? Math.round(conditions.reduce((s, c) => s + c.pressure, 0) / conditions.length) : 0
  const avgVisibility = conditions.length > 0
    ? Math.round(conditions.reduce((s, c) => s + c.visibility, 0) / conditions.length) : 100

  const hottestFile = conditions.length > 0
    ? conditions.reduce((a, b) => a.temperature >= b.temperature ? a : b).file : ''
  const mostCoupledFile = conditions.length > 0
    ? conditions.reduce((a, b) => a.humidity >= b.humidity ? a : b).file : ''
  const highestPressureFile = conditions.length > 0
    ? conditions.reduce((a, b) => a.pressure >= b.pressure ? a : b).file : ''
  const clearestFile = conditions.length > 0
    ? conditions.reduce((a, b) => a.visibility >= b.visibility ? a : b).file : ''

  const stormIndex = computeStormIndex(systems, conditions)
  const stabilityIndex = computeStabilityIndex(conditions)
  const overallWeather = classifyOverallWeather(stormIndex, stabilityIndex)

  const avgConfidence = forecasts.length > 0
    ? Math.round(forecasts.reduce((s, f) => s + f.confidence, 0) / forecasts.length) : 50

  const stats: StormTrackerStats = {
    totalSystems: systems.length,
    cyclones: systems.filter(s => s.type === 'cyclone').length,
    thunderstorms: systems.filter(s => s.type === 'thunderstorm').length,
    tornadoes: systems.filter(s => s.type === 'tornado').length,
    hurricanes: systems.filter(s => s.type === 'hurricane').length,
    droughts: systems.filter(s => s.type === 'drought').length,
    clearAreas: clearCount,
    avgTemperature,
    avgHumidity,
    avgPressure,
    avgVisibility,
    hottestFile,
    mostCoupledFile,
    highestPressureFile,
    clearestFile,
    overallWeather,
    stormIndex,
    stabilityIndex,
    forecastConfidence: avgConfidence,
  }

  const recommendations = generateRecommendations(systems, conditions, forecasts, stats)

  if (options.verbose) {
    // Verbose includes additional detail
  }

  return { systems, conditions, forecasts, stats, recommendations }
}
