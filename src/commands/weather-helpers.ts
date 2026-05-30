// ─── Types ─────────────────────────────────────────────────────────────────────

export type WeatherType = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'windy' | 'calm'

export type AlertSeverity = 'advisory' | 'warning' | 'watch'

export type AlertType = 'complexity-storm' | 'dependency-hurricane' | 'documentation-fog' | 'change-tornado' | 'entropy-heatwave'

export type ClimateType = 'tropical' | 'temperate' | 'arctic' | 'extreme'

export interface WeatherCondition {
  file: string
  temperature: number
  humidity: number
  windSpeed: number
  visibility: number
  pressure: number
  precipitation: number
  condition: WeatherType
  forecast: string
}

export interface RegionalForecast {
  region: string
  conditions: WeatherCondition[]
  avgTemperature: number
  avgVisibility: number
  avgPressure: number
  overall: string
  alert: string | null
}

export interface WeatherAlert {
  severity: AlertSeverity
  region: string
  type: AlertType
  description: string
  affectedFiles: string[]
  recommendation: string
}

export interface WeatherStats {
  totalFiles: number
  sunnyCount: number
  stormyCount: number
  foggyCount: number
  avgTemperature: number
  avgVisibility: number
  avgPressure: number
  avgWindSpeed: number
  hottestFile: string
  coldestFile: string
  calmestRegion: string
  stormiestRegion: string
  alertCount: number
  overallClimate: ClimateType
  climateStability: number
}

export interface WeatherResult {
  conditions: WeatherCondition[]
  forecasts: RegionalForecast[]
  alerts: WeatherAlert[]
  stats: WeatherStats
  recommendations: string[]
}

export interface WeatherOptions {
  verbose?: boolean
}

// ─── Temperature ───────────────────────────────────────────────────────────────

/**
 * Compute temperature (complexity warmth). 0-100.
 * High = hot/complex.
 *
 * @example
 * computeTemperature('if (x) { for (let i = 0; i < 10; i++) { } }')
 */
export function computeTemperature(content: string): number {
  if (!content || content.trim().length === 0) return 0
  const lines = content.split('\n')
  const total = lines.length
  if (total === 0) return 0

  const branches = (content.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b|\bcase\b/g) || []).length
  const ternaries = (content.match(/\?[^?]*:/g) || []).length
  const functions = (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) || []).length
  const nesting = computeMaxNesting(content)
  const anyTypes = (content.match(/:\s*any\b/g) || []).length

  let score = branches * 4 + ternaries * 3 + functions * 2 + nesting * 3 + anyTypes * 5
  score = Math.round((score / Math.max(total, 1)) * 100)
  return Math.max(0, Math.min(100, score))
}

// ─── Humidity ──────────────────────────────────────────────────────────────────

/**
 * Compute humidity (code density). 0-100.
 * Ratio of non-blank lines to total lines.
 *
 * @example
 * computeHumidity('const x = 1\n\nconst y = 2\n')
 */
export function computeHumidity(content: string): number {
  if (!content || content.trim().length === 0) return 0
  const lines = content.split('\n')
  const total = lines.length
  if (total === 0) return 0
  const nonBlank = lines.filter((l) => l.trim().length > 0).length
  return Math.round((nonBlank / total) * 100)
}

// ─── Wind Speed ────────────────────────────────────────────────────────────────

/**
 * Compute wind speed (change velocity). 0-100.
 * Without git data, uses heuristic from content.
 *
 * @example
 * computeWindSpeed('file.ts', null)
 */
export function computeWindSpeed(_file: string, gitLog: { commitsPerWeek?: number } | null): number {
  if (gitLog && gitLog.commitsPerWeek !== undefined) {
    return Math.max(0, Math.min(100, Math.round(gitLog.commitsPerWeek * 10)))
  }
  return 30
}

// ─── Visibility ────────────────────────────────────────────────────────────────

/**
 * Compute visibility (documentation clarity). 0-100.
 * High = clear, well-documented.
 *
 * @example
 * computeVisibility('/** Docs *\\/ function foo() {}')
 */
export function computeVisibility(content: string): number {
  if (!content || content.trim().length === 0) return 0
  const lines = content.split('\n')
  const total = lines.length
  if (total === 0) return 0

  const jsdocBlocks = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
  const paramTags = (content.match(/@param/g) || []).length
  const returnsTags = (content.match(/@returns/g) || []).length
  const exampleTags = (content.match(/@example/g) || []).length
  const inlineComments = lines.filter((l) => l.trim().startsWith('//')).length
  const typeAnnotations = (content.match(/:\s*(?:string|number|boolean|void|never|unknown)\b/g) || []).length
  const functions = (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) || []).length
  const descriptiveNames = (content.match(/const\s+[a-z][a-zA-Z]{4,}/g) || []).length

  let score = jsdocBlocks * 10 + paramTags * 5 + returnsTags * 5 + exampleTags * 8
  score += inlineComments * 2 + typeAnnotations * 3 + descriptiveNames * 1
  if (functions > 0) score += Math.round((jsdocBlocks / functions) * 20)

  score = Math.round((score / Math.max(total, 1)) * 100)
  return Math.max(0, Math.min(100, score))
}

// ─── Pressure ──────────────────────────────────────────────────────────────────

/**
 * Compute pressure (dependency pressure). 0-100.
 * High = high dependency burden.
 *
 * @example
 * computePressure('file.ts', ['./a', './b', './c'], ['d.ts', 'e.ts'])
 */
export function computePressure(_file: string, imports: string[], importedBy: string[]): number {
  const fanOut = imports.length
  const fanIn = importedBy.length
  let score = fanOut * 6 + fanIn * 4
  if (fanOut > 5) score += (fanOut - 5) * 8
  if (fanIn > 8) score += (fanIn - 8) * 5
  return Math.max(0, Math.min(100, score))
}

// ─── Precipitation ─────────────────────────────────────────────────────────────

/**
 * Compute precipitation (error/bug density). 0-100.
 * High = many error patterns.
 *
 * @example
 * computePrecipitation('try { foo() } catch (e) { throw new Error("fail") }')
 */
export function computePrecipitation(content: string): number {
  if (!content || content.trim().length === 0) return 0
  const lines = content.split('\n')
  const total = lines.length
  if (total === 0) return 0

  const tryCatch = (content.match(/\btry\b|\bcatch\b/g) || []).length
  const throwStmt = (content.match(/\bthrow\b/g) || []).length
  const newError = (content.match(/new\s+Error/g) || []).length
  const errorTypes = (content.match(/\bError\b|\bTypeError\b|\bRangeError\b|\bSyntaxError\b/g) || []).length
  const nullChecks = (content.match(/===?\s*null|!==?\s*null|\?\?/g) || []).length
  const undefinedChecks = (content.match(/===?\s*undefined|!==?\s*undefined/g) || []).length
  const todoFixme = (content.match(/TODO|FIXME|HACK|XXX/gi) || []).length

  let score = tryCatch * 5 + throwStmt * 4 + newError * 5 + errorTypes * 2 + nullChecks * 2 + undefinedChecks * 2 + todoFixme * 3
  score = Math.round((score / Math.max(total, 1)) * 100)
  return Math.max(0, Math.min(100, score))
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Compute maximum nesting depth.
 *
 * @example
 * computeMaxNesting('{{{x}}}') // 3
 */
export function computeMaxNesting(content: string): number {
  let maxDepth = 0
  let depth = 0
  for (const ch of content) {
    if (ch === '{') { depth++; if (depth > maxDepth) maxDepth = depth }
    else if (ch === '}') { depth = Math.max(0, depth - 1) }
  }
  return maxDepth
}

/**
 * Extract imports from content.
 *
 * @example
 * extractImports("import { foo } from './bar'") // ['./bar']
 */
export function extractImports(content: string): string[] {
  const imports: string[] = []
  const matches = content.matchAll(/import\s+.*?from\s+['"](.+?)['"]/g) || []
  for (const m of matches) { if (m[1]) imports.push(m[1]) }
  return imports
}

/**
 * Resolve import path to known file.
 *
 * @example
 * resolveImportPath('./utils', new Set(['utils.ts'])) // 'utils.ts'
 */
export function resolveImportPath(importPath: string, knownFiles: Set<string>): string | null {
  const stripped = importPath.replace(/^\.\//, '')
  for (const ext of ['', '.ts', '.js', '.tsx', '.jsx', '/index.ts', '/index.js']) {
    const candidate = stripped + ext
    if (knownFiles.has(candidate)) return candidate
  }
  return null
}

// ─── Condition Classification ──────────────────────────────────────────────────

/**
 * Classify weather condition from metrics.
 *
 * @example
 * classifyCondition(80, 60, 20, 10, 40, 60) // 'stormy'
 */
export function classifyCondition(temperature: number, _humidity: number, wind: number, visibility: number, _pressure: number, precipitation: number): WeatherType {
  if (visibility < 30) return 'foggy'
  if (wind > 70) return 'windy'
  if (temperature > 70 && precipitation > 50) return 'stormy'
  if (temperature > 50 && precipitation > 30) return 'rainy'
  if (temperature > 40 && visibility < 60) return 'cloudy'
  if (temperature > 30 && visibility > 60) return 'partly-cloudy'
  if (temperature < 30 && visibility > 70) return 'sunny'
  return 'calm'
}

// ─── Forecast ──────────────────────────────────────────────────────────────────

/**
 * Generate a forecast string for a condition.
 *
 * @example
 * generateForecast('stormy') // 'Expect continued turbulence'
 */
export function generateForecast(condition: WeatherType): string {
  switch (condition) {
    case 'sunny': return 'Clear skies ahead'
    case 'partly-cloudy': return 'Mostly pleasant with minor complexity'
    case 'cloudy': return 'Overcast — consider improving documentation'
    case 'rainy': return 'Bug showers likely — add tests'
    case 'stormy': return 'Severe complexity — seek shelter (refactor)'
    case 'foggy': return 'Low visibility — add documentation'
    case 'windy': return 'High volatility — stabilize changes'
    case 'calm': return 'Peaceful conditions expected to continue'
  }
}

// ─── Regional Forecasts ────────────────────────────────────────────────────────

/**
 * Group conditions into regional forecasts by directory.
 *
 * @example
 * groupIntoRegions(conditions, ['src/a.ts', 'src/b.ts', 'test/c.ts'])
 */
export function groupIntoRegions(conditions: WeatherCondition[], files: string[]): RegionalForecast[] {
  const regionMap: Record<string, WeatherCondition[]> = {}

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file) continue
    const parts = file.split('/')
    const region = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    if (!regionMap[region]) regionMap[region] = []
    const cond = conditions[i]
    if (cond) regionMap[region].push(cond)
  }

  const forecasts: RegionalForecast[] = []
  for (const [region, conds] of Object.entries(regionMap)) {
    const avgTemp = conds.length > 0 ? Math.round(conds.reduce((s, c) => s + c.temperature, 0) / conds.length) : 0
    const avgVis = conds.length > 0 ? Math.round(conds.reduce((s, c) => s + c.visibility, 0) / conds.length) : 0
    const avgPres = conds.length > 0 ? Math.round(conds.reduce((s, c) => s + c.pressure, 0) / conds.length) : 0

    const stormCount = conds.filter((c) => c.condition === 'stormy').length
    const fogCount = conds.filter((c) => c.condition === 'foggy').length
    const sunnyCount = conds.filter((c) => c.condition === 'sunny').length

    let overall = 'mixed conditions'
    if (sunnyCount > conds.length / 2) overall = 'mostly sunny'
    else if (stormCount > conds.length / 3) overall = 'stormy'
    else if (fogCount > conds.length / 3) overall = 'foggy'
    else if (avgTemp > 60) overall = 'hot and complex'
    else if (avgVis > 70) overall = 'clear'
    else if (avgTemp < 30) overall = 'cool and stable'

    let alert: string | null = null
    if (stormCount > 0) alert = `${stormCount} stormy file(s) detected`
    else if (fogCount > conds.length / 2) alert = 'Widespread fog — low documentation'

    forecasts.push({ region, conditions: conds, avgTemperature: avgTemp, avgVisibility: avgVis, avgPressure: avgPres, overall, alert })
  }

  return forecasts
}

// ─── Alerts ────────────────────────────────────────────────────────────────────

/**
 * Detect weather alerts from conditions and forecasts.
 *
 * @example
 * detectAlerts(forecasts, conditions)
 */
export function detectAlerts(forecasts: RegionalForecast[], conditions: WeatherCondition[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = []

  const hotFiles = conditions.filter((c) => c.temperature > 80)
  if (hotFiles.length >= 3) {
    alerts.push({
      severity: 'warning',
      region: 'codebase',
      type: 'complexity-storm',
      description: `${hotFiles.length} files with extreme complexity`,
      affectedFiles: hotFiles.map((f) => f.file),
      recommendation: 'Refactor complex files to reduce cognitive load',
    })
  }

  for (const fc of forecasts) {
    const highPressure = fc.conditions.filter((c) => c.pressure > 80)
    const highWind = fc.conditions.filter((c) => c.windSpeed > 70)
    if (highPressure.length > 0 && highWind.length > 0) {
      alerts.push({
        severity: 'warning',
        region: fc.region,
        type: 'dependency-hurricane',
        description: `High dependency pressure and volatility in ${fc.region}`,
        affectedFiles: [...new Set([...highPressure, ...highWind].map((c) => c.file))],
        recommendation: 'Decouple modules and reduce change frequency',
      })
    }
  }

  for (const fc of forecasts) {
    const lowVis = fc.conditions.filter((c) => c.visibility < 20)
    if (lowVis.length > fc.conditions.length / 2 && fc.conditions.length >= 2) {
      alerts.push({
        severity: 'advisory',
        region: fc.region,
        type: 'documentation-fog',
        description: `Low visibility in ${fc.region} — documentation needed`,
        affectedFiles: lowVis.map((c) => c.file),
        recommendation: 'Add JSDoc comments and inline documentation',
      })
    }
  }

  for (const fc of forecasts) {
    const highWind = fc.conditions.filter((c) => c.windSpeed > 80)
    const highPrecip = fc.conditions.filter((c) => c.precipitation > 50)
    if (highWind.length > 0 && highPrecip.length > 0) {
      alerts.push({
        severity: 'watch',
        region: fc.region,
        type: 'change-tornado',
        description: `Rapid changes with high error density in ${fc.region}`,
        affectedFiles: [...new Set([...highWind, ...highPrecip].map((c) => c.file))],
        recommendation: 'Stabilize changes and add error handling',
      })
    }
  }

  const avgTemp = conditions.length > 0 ? conditions.reduce((s, c) => s + c.temperature, 0) / conditions.length : 0
  if (avgTemp > 60 && conditions.length >= 5) {
    alerts.push({
      severity: 'watch',
      region: 'codebase',
      type: 'entropy-heatwave',
      description: 'System-wide complexity above comfortable levels',
      affectedFiles: conditions.filter((c) => c.temperature > 50).map((c) => c.file),
      recommendation: 'Plan a refactoring sprint to cool things down',
    })
  }

  return alerts
}

// ─── Climate ───────────────────────────────────────────────────────────────────

/**
 * Classify overall climate.
 *
 * @example
 * classifyClimate(50, 60) // 'temperate'
 */
export function classifyClimate(avgTemperature: number, avgVisibility: number): ClimateType {
  if (avgTemperature > 70) return 'tropical'
  if (avgTemperature < 20 && avgVisibility > 70) return 'arctic'
  if (avgTemperature > 50 && avgVisibility < 30) return 'extreme'
  return 'temperate'
}

/**
 * Compute climate stability (0-100).
 *
 * @example
 * computeClimateStability(conditions)
 */
export function computeClimateStability(conditions: WeatherCondition[]): number {
  if (conditions.length === 0) return 100
  const stableConditions = conditions.filter((c) => c.condition === 'calm' || c.condition === 'sunny')
  const avgVis = conditions.reduce((s, c) => s + c.visibility, 0) / conditions.length
  const avgWind = conditions.reduce((s, c) => s + c.windSpeed, 0) / conditions.length
  const stableRatio = stableConditions.length / conditions.length
  const visFactor = avgVis / 100
  const windFactor = 1 - avgWind / 100
  return Math.round((stableRatio * 40 + visFactor * 30 + windFactor * 30) * 100 / 100)
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate weather recommendations.
 *
 * @example
 * generateWeatherRecommendations(conditions, forecasts, alerts, stats)
 */
export function generateWeatherRecommendations(conditions: WeatherCondition[], _forecasts: RegionalForecast[], alerts: WeatherAlert[], stats: WeatherStats): string[] {
  const recs: string[] = []

  const stormy = conditions.filter((c) => c.condition === 'stormy')
  if (stormy.length > 0) {
    recs.push(`Seek shelter — refactor ${stormy.length} stormy file(s): ${stormy.map((f) => f.file).join(', ')}`)
  }

  const foggy = conditions.filter((c) => c.condition === 'foggy')
  if (foggy.length > 0) {
    recs.push(`Improve visibility — add documentation to ${foggy.length} foggy file(s)`)
  }

  const windy = conditions.filter((c) => c.condition === 'windy')
  if (windy.length > 0) {
    recs.push(`Stabilize ${windy.length} volatile file(s) — reduce change frequency`)
  }

  for (const alert of alerts) {
    recs.push(`[${alert.severity.toUpperCase()}] ${alert.recommendation}`)
  }

  if (stats.hottestFile) {
    recs.push(`Hottest file "${stats.hottestFile}" — consider breaking it down`)
  }

  if (recs.length === 0) {
    recs.push('Weather looks good — pleasant coding conditions')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete weather result.
 *
 * @example
 * buildWeatherResult(['a.ts'], ['function foo() {}'], {})
 */
export function buildWeatherResult(files: string[], contents: string[], options: WeatherOptions): WeatherResult {
  const knownSet = new Set(files)
  const conditions: WeatherCondition[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] || ''

    const temperature = computeTemperature(content)
    const humidity = computeHumidity(content)
    const windSpeed = computeWindSpeed(file, null)
    const visibility = computeVisibility(content)
    const imports = extractImports(content).map((imp) => resolveImportPath(imp, knownSet)).filter((r): r is string => r !== null)
    const importedBy: string[] = []
    for (let j = 0; j < files.length; j++) {
      if (j === i) continue
      const otherImports = extractImports(contents[j] || '')
      for (const imp of otherImports) {
        if (resolveImportPath(imp, knownSet) === file) { importedBy.push(files[j] ?? ''); break }
      }
    }
    const pressure = computePressure(file, imports, importedBy)
    const precipitation = computePrecipitation(content)
    const condition = classifyCondition(temperature, humidity, windSpeed, visibility, pressure, precipitation)
    const forecast = generateForecast(condition)

    conditions.push({ file, temperature, humidity, windSpeed, visibility, pressure, precipitation, condition, forecast })
  }

  const forecasts = groupIntoRegions(conditions, files)
  const alerts = detectAlerts(forecasts, conditions)

  const sunnyCount = conditions.filter((c) => c.condition === 'sunny').length
  const stormyCount = conditions.filter((c) => c.condition === 'stormy').length
  const foggyCount = conditions.filter((c) => c.condition === 'foggy').length

  const avgTemperature = conditions.length > 0 ? Math.round(conditions.reduce((s, c) => s + c.temperature, 0) / conditions.length) : 0
  const avgVisibility = conditions.length > 0 ? Math.round(conditions.reduce((s, c) => s + c.visibility, 0) / conditions.length) : 0
  const avgPressure = conditions.length > 0 ? Math.round(conditions.reduce((s, c) => s + c.pressure, 0) / conditions.length) : 0
  const avgWindSpeed = conditions.length > 0 ? Math.round(conditions.reduce((s, c) => s + c.windSpeed, 0) / conditions.length) : 0

  const sortedByTemp = [...conditions].sort((a, b) => b.temperature - a.temperature)
  const hottestFile = sortedByTemp[0]?.file || ''
  const coldestFile = sortedByTemp[sortedByTemp.length - 1]?.file || ''

  const calmestRegion = forecasts.length > 0
    ? forecasts.sort((a, b) => a.avgTemperature - b.avgTemperature)[0]?.region ?? ''
    : ''
  const stormiestRegion = forecasts.length > 0
    ? forecasts.sort((a, b) => b.avgTemperature - a.avgTemperature)[0]?.region ?? ''
    : ''

  const overallClimate = classifyClimate(avgTemperature, avgVisibility)
  const climateStability = computeClimateStability(conditions)

  const stats: WeatherStats = {
    sunnyCount,
    stormyCount,
    foggyCount,
    avgTemperature,
    avgVisibility,
    avgPressure,
    avgWindSpeed,
    hottestFile,
    coldestFile,
    calmestRegion,
    stormiestRegion,
    alertCount: alerts.length,
    overallClimate,
    climateStability,
    totalFiles: files.length,
  }

  const recommendations = generateWeatherRecommendations(conditions, forecasts, alerts, stats)

  if (options.verbose) {
    for (const fc of forecasts) {
      if (!fc.alert && fc.conditions.some((c) => c.condition === 'cloudy')) {
        fc.alert = 'Cloudy conditions — could benefit from better docs'
      }
    }
  }

  return { conditions, forecasts, alerts, stats, recommendations }
}
