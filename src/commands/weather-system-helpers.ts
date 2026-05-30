// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Forecast {
  shortTerm: string
  trend: 'improving' | 'stable' | 'deteriorating'
  confidence: number
}

export interface AtmosphericCondition {
  file: string
  pressure: number
  temperature: number
  humidity: number
  windSpeed: number
  visibility: number
  precipitation: number
  cloudCover: number
  dewPoint: number
  uvIndex: number
  atmosphericStability: 'very-stable' | 'stable' | 'neutral' | 'unstable' | 'very-unstable'
  weatherType: 'clear' | 'partly-cloudy' | 'cloudy' | 'overcast' | 'foggy' | 'drizzle' | 'rain' | 'thunderstorm' | 'hail' | 'tornado' | 'hurricane'
  windDirection: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'
  airQuality: 'excellent' | 'good' | 'moderate' | 'poor' | 'hazardous'
  forecast: Forecast
  frontType: 'warm-front' | 'cold-front' | 'occluded-front' | 'stationary' | 'none'
  alerts: string[]
  comfort: number
}

export interface WeatherZone {
  directory: string
  conditions: AtmosphericCondition[]
  zoneType: 'tropical' | 'temperate' | 'arctic' | 'desert' | 'monsoon' | 'mediterranean'
  avgPressure: number
  avgTemperature: number
  avgHumidity: number
  avgVisibility: number
  dominantWeather: string
  avgComfort: number
  alertCount: number
  extremeConditions: number
  climateStability: number
  hasWeatherEvents: boolean
  weatherEvents: string[]
  forecast: string
  health: 'ideal' | 'pleasant' | 'acceptable' | 'uncomfortable' | 'harsh' | 'extreme'
}

export interface GlobalForecast {
  overallWeather: string
  trend: 'clearing' | 'stable' | 'deteriorating' | 'storm-approaching' | 'catastrophic'
  avgPressure: number
  avgTemperature: number
  avgVisibility: number
  dominantFront: string
  stormRisk: number
  comfortIndex: number
  climateGrade: 'tropical-paradise' | 'pleasant' | 'temperate' | 'continental' | 'arctic' | 'hellish'
}

export interface WeatherSystemStats {
  totalFiles: number
  totalZones: number
  avgPressure: number
  avgTemperature: number
  avgHumidity: number
  avgVisibility: number
  avgComfort: number
  clearFiles: number
  stormyFiles: number
  foggyFiles: number
  extremeFiles: number
  totalAlerts: number
  tropicalZones: number
  arcticZones: number
  desertZones: number
  monsoonZones: number
  overallComfort: number
  airQualityIndex: number
  stormRisk: number
  climateGrade: string
  bestWeather: string
  worstWeather: string
  safestZone: string
  riskiestZone: string
}

export interface WeatherSystemResult {
  conditions: AtmosphericCondition[]
  zones: WeatherZone[]
  globalForecast: GlobalForecast
  stats: WeatherSystemStats
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────────────────────────

const EXPORT_RE = /export\s+(?:default\s+)?(?:function|class|const|let|interface|type)/g
const IMPORT_RE = /import\s+.*?from\s+['"][^'"]+['"]/g
const FUNCTION_RE = /(?:export\s+)?(?:async\s+)?function\s+\w+/g
const CLASS_RE = /(?:export\s+)?(?:abstract\s+)?class\s+\w+/g
const INTERFACE_RE = /(?:export\s+)?interface\s+\w+/g
const TYPE_RE = /(?:export\s+)?type\s+\w+/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const TODO_RE = /\/\/\s*(TODO|FIXME|HACK|XXX)/gi
const ANY_RE = /:\s*any\b/g
const CONSOLE_RE = /console\.\w+\(/g
const NESTED_IF_RE = /if\s*\(.*if\s*\(/s
const MAGIC_NUMBER_RE = /(?:===|!==|==|!=)\s*\d{3,}/g

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify weather type based on atmospheric metrics
 * @example
 * classifyWeatherType({ cloudCover: 10, precipitation: 0, visibility: 90 }) // 'clear'
 */
export function classifyWeatherType(m: { cloudCover: number; precipitation: number; visibility: number; pressure: number }): AtmosphericCondition['weatherType'] {
  if (m.visibility < 20 && m.cloudCover >= 70) return 'foggy'
  if (m.precipitation >= 70 && m.pressure >= 70) return 'hurricane'
  if (m.precipitation >= 60 && m.pressure >= 50) return 'tornado'
  if (m.precipitation >= 50 && m.pressure >= 40) return 'thunderstorm'
  if (m.precipitation >= 40) return 'hail'
  if (m.precipitation >= 25) return 'rain'
  if (m.precipitation >= 10) return 'drizzle'
  if (m.cloudCover >= 80) return 'overcast'
  if (m.cloudCover >= 50) return 'cloudy'
  if (m.cloudCover >= 20) return 'partly-cloudy'
  return 'clear'
}

/**
 * Classify atmospheric stability
 * @example
 * classifyAtmosphericStability(20) // 'very-stable'
 */
export function classifyAtmosphericStability(pressure: number): AtmosphericCondition['atmosphericStability'] {
  if (pressure <= 20) return 'very-stable'
  if (pressure <= 35) return 'stable'
  if (pressure <= 55) return 'neutral'
  if (pressure <= 75) return 'unstable'
  return 'very-unstable'
}

/**
 * Classify air quality from visibility and pressure
 * @example
 * classifyAirQuality(90, 10) // 'excellent'
 */
export function classifyAirQuality(visibility: number, pressure: number): AtmosphericCondition['airQuality'] {
  const score = (visibility + (100 - pressure)) / 2
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'moderate'
  if (score >= 20) return 'poor'
  return 'hazardous'
}

/**
 * Classify wind direction based on imports vs exports
 * @example
 * classifyWindDirection(0, 5) // 'N'
 */
export function classifyWindDirection(imports: number, exports: number): AtmosphericCondition['windDirection'] {
  if (exports > imports * 2) return 'N'
  if (exports > imports) return 'NE'
  if (exports === imports) return 'E'
  if (imports > exports * 2) return 'S'
  if (imports > exports) return 'SW'
  if (imports > 0 && exports === 0) return 'W'
  if (exports > 0 && imports === 0) return 'NW'
  return 'SE'
}

/**
 * Classify front type based on trend and pressure
 * @example
 * classifyFrontType('improving', 30) // 'warm-front'
 */
export function classifyFrontType(trend: Forecast['trend'], pressure: number): AtmosphericCondition['frontType'] {
  if (trend === 'improving' && pressure < 50) return 'warm-front'
  if (trend === 'deteriorating' && pressure > 40) return 'cold-front'
  if (trend === 'stable' && pressure >= 30 && pressure <= 60) return 'stationary'
  if (trend === 'deteriorating' && pressure <= 40) return 'occluded-front'
  return 'none'
}

/**
 * Classify climate grade from overall comfort
 * @example
 * classifyClimateGrade(90) // 'tropical-paradise'
 */
export function classifyClimateGrade(comfort: number): GlobalForecast['climateGrade'] {
  if (comfort >= 80) return 'tropical-paradise'
  if (comfort >= 65) return 'pleasant'
  if (comfort >= 45) return 'temperate'
  if (comfort >= 25) return 'continental'
  if (comfort >= 10) return 'arctic'
  return 'hellish'
}

/**
 * Classify global trend from average conditions
 * @example
 * classifyGlobalTrend(30, 80) // 'clearing'
 */
export function classifyGlobalTrend(avgPressure: number, avgVisibility: number): GlobalForecast['trend'] {
  if (avgPressure <= 25 && avgVisibility >= 70) return 'clearing'
  if (avgPressure <= 40 && avgVisibility >= 50) return 'stable'
  if (avgPressure >= 60) return 'catastrophic'
  if (avgPressure >= 45) return 'storm-approaching'
  return 'deteriorating'
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as an atmospheric condition
 * @example
 * analyzeAtmosphericCondition('export function add(a: number, b: number) { return a + b }', 'add.ts') // AtmosphericCondition
 */
export function analyzeAtmosphericCondition(content: string, filePath: string): AtmosphericCondition {
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0)

  const exports = (content.match(EXPORT_RE) ?? []).length
  const imports = (content.match(IMPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const todos = (content.match(TODO_RE) ?? []).length
  const consoles = (content.match(CONSOLE_RE) ?? []).length
  const nestedIf = NESTED_IF_RE.test(content) ? 1 : 0
  const magicNumbers = (content.match(MAGIC_NUMBER_RE) ?? []).length

  const pressure = computePressure(todos, anys, consoles, codeLines.length)
  const temperature = computeTemperature(codeLines, functions + classes, nestedIf, imports)
  const humidity = computeHumidity(imports, codeLines.length)
  const windSpeed = computeWindSpeed(todos, anys, codeLines.length)
  const visibility = computeVisibility(exports, interfaces + types, jsdoc, anys, codeLines.length)
  const precipitation = computePrecipitation(todos, codeLines.length)
  const cloudCover = computeCloudCover(anys, magicNumbers, nestedIf, codeLines.length)
  const dewPoint = computeDewPoint(temperature, humidity)
  const uvIndex = computeUvIndex(exports, anys, codeLines.length)

  const atmosphericStability = classifyAtmosphericStability(pressure)
  const weatherType = classifyWeatherType({ cloudCover, precipitation, visibility, pressure })
  const windDirection = classifyWindDirection(imports, exports)

  const forecast = computeForecast(pressure, visibility, temperature)
  const airQuality = classifyAirQuality(visibility, pressure)
  const frontType = classifyFrontType(forecast.trend, pressure)
  const alerts = generateAlerts(weatherType, pressure, visibility, temperature, precipitation)
  const comfort = computeComfort(visibility, temperature, pressure, humidity)

  return {
    file: filePath,
    pressure,
    temperature,
    humidity,
    windSpeed,
    visibility,
    precipitation,
    cloudCover,
    dewPoint,
    uvIndex,
    atmosphericStability,
    weatherType,
    windDirection,
    airQuality,
    forecast,
    frontType,
    alerts,
    comfort,
  }
}

// ─── Metric Computations ─────────────────────────────────────────────────────

function computePressure(todos: number, anys: number, consoles: number, lines: number): number {
  if (lines === 0) return 0
  let score = 10
  score += todos * 12
  score += anys * 10
  score += consoles * 3
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeTemperature(codeLines: string[], constructs: number, nestedIf: number, imports: number): number {
  if (codeLines.length === 0) return 0
  let score = 25
  const avgLen = codeLines.reduce((s, l) => s + l.length, 0) / codeLines.length
  if (avgLen > 100) score += 20
  else if (avgLen > 60) score += 10
  if (codeLines.length > 200) score += 15
  else if (codeLines.length > 50) score += 8
  if (constructs > 8) score += 10
  score += nestedIf * 15
  if (imports > 8) score += 8
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeHumidity(imports: number, lines: number): number {
  if (lines === 0) return 0
  return Math.min(100, Math.round((imports / (lines / 10)) * 50))
}

function computeWindSpeed(todos: number, anys: number, lines: number): number {
  if (lines === 0) return 0
  return Math.min(100, Math.round(todos * 10 + anys * 8))
}

function computeVisibility(exports: number, structural: number, jsdoc: number, anys: number, lines: number): number {
  if (lines === 0) return 0
  let score = 30
  score += Math.min(25, exports * 4)
  score += Math.min(15, structural * 4)
  score += Math.min(15, jsdoc * 3)
  score -= anys * 12
  if (exports > 0 && structural > 0) score += 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computePrecipitation(todos: number, lines: number): number {
  if (lines === 0) return 0
  return Math.min(100, Math.round(todos * 15))
}

function computeCloudCover(anys: number, magicNumbers: number, nestedIf: number, lines: number): number {
  if (lines === 0) return 0
  return Math.min(100, Math.round(anys * 15 + magicNumbers * 8 + nestedIf * 10))
}

function computeDewPoint(temperature: number, humidity: number): number {
  return Math.min(100, Math.round((temperature + humidity) / 2))
}

function computeUvIndex(exports: number, anys: number, lines: number): number {
  if (lines === 0) return 0
  let score = 20
  score += Math.min(30, exports * 5)
  score -= anys * 8
  if (exports > 5) score += 15
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeForecast(pressure: number, visibility: number, temperature: number): Forecast {
  let trend: Forecast['trend'] = 'stable'
  let shortTerm = 'Conditions holding steady'
  let confidence = 60

  if (pressure <= 25 && visibility >= 60) {
    trend = 'improving'
    shortTerm = 'Clear skies ahead'
    confidence = 80
  } else if (pressure >= 50) {
    trend = 'deteriorating'
    shortTerm = temperature >= 60 ? 'Storm conditions developing' : 'Cold front moving in'
    confidence = 70
  } else if (visibility < 40) {
    trend = 'stable'
    shortTerm = 'Poor visibility persisting'
    confidence = 55
  }

  return { shortTerm, trend, confidence }
}

function generateAlerts(weatherType: AtmosphericCondition['weatherType'], pressure: number, visibility: number, temperature: number, precipitation: number): string[] {
  const alerts: string[] = []
  if (weatherType === 'hurricane') alerts.push('HURRICANE WARNING - Critical tech debt emergency')
  if (weatherType === 'tornado') alerts.push('TORNADO WARNING - Unstable code with high complexity')
  if (weatherType === 'thunderstorm') alerts.push('THUNDERSTORM WARNING - Active issues with pressure')
  if (weatherType === 'hail') alerts.push('HAIL ADVISORY - Multiple incoming changes')
  if (pressure >= 70) alerts.push('HIGH PRESSURE ALERT - Excessive tech debt accumulation')
  if (visibility <= 20) alerts.push('LOW VISIBILITY ADVISORY - Code clarity critically low')
  if (temperature >= 80) alerts.push('HEAT ADVISORY - Code complexity dangerously high')
  if (precipitation >= 50) alerts.push('FLOOD WATCH - Many pending changes')
  if (weatherType === 'foggy') alerts.push('DENSE FOG ADVISORY - Unclear code')
  return alerts
}

function computeComfort(visibility: number, temperature: number, pressure: number, humidity: number): number {
  const tempComfort = temperature <= 50 ? temperature : Math.max(0, 100 - (temperature - 50))
  const pressComfort = 100 - pressure
  const humComfort = humidity <= 50 ? 100 - humidity : Math.max(0, 100 - (humidity - 50) * 2)
  return Math.min(100, Math.max(0, Math.round((visibility * 0.3 + tempComfort * 0.25 + pressComfort * 0.25 + humComfort * 0.2))))
}

// ─── Zone Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a directory as a weather zone
 * @example
 * analyzeWeatherZone(conditions, 'src') // WeatherZone
 */
export function analyzeWeatherZone(conditions: AtmosphericCondition[], dirPath: string): WeatherZone {
  if (conditions.length === 0) {
    return {
      directory: dirPath,
      conditions: [],
      zoneType: 'arctic',
      avgPressure: 0,
      avgTemperature: 0,
      avgHumidity: 0,
      avgVisibility: 0,
      dominantWeather: 'clear',
      avgComfort: 0,
      alertCount: 0,
      extremeConditions: 0,
      climateStability: 0,
      hasWeatherEvents: false,
      weatherEvents: [],
      forecast: 'No data available',
      health: 'extreme',
    }
  }

  const avgPressure = Math.round(conditions.reduce((s, c) => s + c.pressure, 0) / conditions.length)
  const avgTemperature = Math.round(conditions.reduce((s, c) => s + c.temperature, 0) / conditions.length)
  const avgHumidity = Math.round(conditions.reduce((s, c) => s + c.humidity, 0) / conditions.length)
  const avgVisibility = Math.round(conditions.reduce((s, c) => s + c.visibility, 0) / conditions.length)
  const avgComfort = Math.round(conditions.reduce((s, c) => s + c.comfort, 0) / conditions.length)

  const weatherCounts = new Map<string, number>()
  for (const c of conditions) {
    weatherCounts.set(c.weatherType, (weatherCounts.get(c.weatherType) ?? 0) + 1)
  }
  let dominantWeather = 'clear'
  let maxWeather = 0
  for (const [w, count] of weatherCounts) {
    if (count > maxWeather) { maxWeather = count; dominantWeather = w }
  }

  const alertCount = conditions.reduce((s, c) => s + c.alerts.length, 0)
  const extremeConditions = conditions.filter(c => c.weatherType === 'hurricane' || c.weatherType === 'tornado' || c.weatherType === 'thunderstorm').length
  const climateStability = Math.max(0, Math.round(100 - avgPressure - extremeConditions * 10))

  const weatherEvents = Array.from(weatherCounts.keys()).filter(w => w !== 'clear' && w !== 'partly-cloudy')
  const hasWeatherEvents = weatherEvents.length > 0

  const zoneType = classifyZoneType(avgPressure, avgTemperature, avgHumidity, avgVisibility)
  const health = classifyZoneHealth(avgComfort)
  const forecast = buildZoneForecast(avgPressure, avgVisibility, dominantWeather)

  return {
    directory: dirPath,
    conditions,
    zoneType,
    avgPressure,
    avgTemperature,
    avgHumidity,
    avgVisibility,
    dominantWeather,
    avgComfort,
    alertCount,
    extremeConditions,
    climateStability,
    hasWeatherEvents,
    weatherEvents,
    forecast,
    health,
  }
}

function classifyZoneType(avgPressure: number, avgTemperature: number, avgHumidity: number, avgVisibility: number): WeatherZone['zoneType'] {
  if (avgTemperature >= 60 && avgHumidity >= 50) return 'tropical'
  if (avgTemperature <= 25 && avgVisibility <= 30) return 'arctic'
  if (avgHumidity <= 15 && avgVisibility >= 60) return 'desert'
  if (avgHumidity >= 60 && avgPressure >= 40) return 'monsoon'
  if (avgPressure <= 30 && avgTemperature <= 50) return 'mediterranean'
  return 'temperate'
}

function classifyZoneHealth(avgComfort: number): WeatherZone['health'] {
  if (avgComfort >= 80) return 'ideal'
  if (avgComfort >= 65) return 'pleasant'
  if (avgComfort >= 45) return 'acceptable'
  if (avgComfort >= 25) return 'uncomfortable'
  if (avgComfort >= 10) return 'harsh'
  return 'extreme'
}

function buildZoneForecast(avgPressure: number, avgVisibility: number, dominantWeather: string): string {
  if (avgPressure <= 25) return 'Clear conditions expected to continue'
  if (dominantWeather === 'clear') return 'Fair weather with occasional clouds'
  if (avgVisibility < 40) return 'Reduced visibility likely to persist'
  if (avgPressure >= 50) return 'Active weather pattern - expect continued turbulence'
  return 'Mixed conditions with moderate stability'
}

// ─── Global Forecast ─────────────────────────────────────────────────────────

/**
 * Compute global forecast from all conditions and zones
 * @example
 * computeGlobalForecast(conditions, zones) // GlobalForecast
 */
export function computeGlobalForecast(conditions: AtmosphericCondition[], _zones: WeatherZone[]): GlobalForecast {
  if (conditions.length === 0) {
    return {
      overallWeather: 'clear',
      trend: 'stable',
      avgPressure: 0,
      avgTemperature: 0,
      avgVisibility: 0,
      dominantFront: 'none',
      stormRisk: 0,
      comfortIndex: 0,
      climateGrade: 'arctic',
    }
  }

  const avgPressure = Math.round(conditions.reduce((s, c) => s + c.pressure, 0) / conditions.length)
  const avgTemperature = Math.round(conditions.reduce((s, c) => s + c.temperature, 0) / conditions.length)
  const avgVisibility = Math.round(conditions.reduce((s, c) => s + c.visibility, 0) / conditions.length)
  const comfortIndex = Math.round(conditions.reduce((s, c) => s + c.comfort, 0) / conditions.length)

  const weatherCounts = new Map<string, number>()
  for (const c of conditions) {
    weatherCounts.set(c.weatherType, (weatherCounts.get(c.weatherType) ?? 0) + 1)
  }
  let overallWeather = 'clear'
  let maxW = 0
  for (const [w, count] of weatherCounts) {
    if (count > maxW) { maxW = count; overallWeather = w }
  }

  const frontCounts = new Map<string, number>()
  for (const c of conditions) {
    frontCounts.set(c.frontType, (frontCounts.get(c.frontType) ?? 0) + 1)
  }
  let dominantFront = 'none'
  let maxF = 0
  for (const [f, count] of frontCounts) {
    if (count > maxF && f !== 'none') { maxF = count; dominantFront = f }
  }

  const stormRisk = computeStormRisk(conditions)
  const trend = classifyGlobalTrend(avgPressure, avgVisibility)
  const climateGrade = classifyClimateGrade(comfortIndex)

  return {
    overallWeather,
    trend,
    avgPressure,
    avgTemperature,
    avgVisibility,
    dominantFront,
    stormRisk,
    comfortIndex,
    climateGrade,
  }
}

/**
 * Compute storm risk from conditions
 * @example
 * computeStormRisk(conditions) // 35
 */
export function computeStormRisk(conditions: AtmosphericCondition[]): number {
  if (conditions.length === 0) return 0
  const extremeCount = conditions.filter(c => c.pressure >= 60 || c.weatherType === 'thunderstorm' || c.weatherType === 'tornado' || c.weatherType === 'hurricane').length
  return Math.min(100, Math.round((extremeCount / conditions.length) * 100))
}

/**
 * Compute air quality index from conditions
 * @example
 * computeAirQualityIndex(conditions) // 75
 */
export function computeAirQualityIndex(conditions: AtmosphericCondition[]): number {
  if (conditions.length === 0) return 0
  const avgVisibility = conditions.reduce((s, c) => s + c.visibility, 0) / conditions.length
  const avgPressure = conditions.reduce((s, c) => s + c.pressure, 0) / conditions.length
  return Math.min(100, Math.round((avgVisibility + (100 - avgPressure)) / 2))
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate recommendations for improving weather conditions
 * @example
 * generateWeatherSystemRecommendations(conditions, zones, stats) // string[]
 */
export function generateWeatherSystemRecommendations(
  _conditions: AtmosphericCondition[],
  zones: WeatherZone[],
  stats: WeatherSystemStats,
): string[] {
  const recs: string[] = []

  if (stats.avgPressure >= 50) recs.push('High atmospheric pressure - reduce tech debt to clear skies')
  if (stats.avgVisibility < 40) recs.push('Low visibility - improve documentation and code clarity')
  if (stats.avgHumidity >= 60) recs.push('High humidity - reduce dependency density')
  if (stats.stormRisk >= 50) recs.push('High storm risk - stabilize critical files immediately')
  if (stats.extremeFiles > 0) recs.push(`${stats.extremeFiles} extreme weather file(s) need urgent attention`)
  if (stats.foggyFiles > 2) recs.push(`${stats.foggyFiles} foggy file(s) - clarify naming and structure`)
  if (stats.totalAlerts > 5) recs.push(`${stats.totalAlerts} active weather alerts - address highest priority first`)
  if (stats.monsoonZones > 0) recs.push('Monsoon conditions detected - manage dependency influx')

  const harshZones = zones.filter(z => z.health === 'harsh' || z.health === 'extreme')
  if (harshZones.length > 0) recs.push(`${harshZones.length} zone(s) with harsh conditions need intervention`)

  if (recs.length === 0) recs.push('Clear skies ahead - excellent atmospheric conditions across the codebase')
  return recs
}

// ─── Build Result ────────────────────────────────────────────────────────────

/**
 * Build the complete weather system analysis result
 * @example
 * buildWeatherSystemResult(files, contents, {}) // WeatherSystemResult
 */
export function buildWeatherSystemResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): WeatherSystemResult {
  const conditions: AtmosphericCondition[] = []
  for (let i = 0; i < files.length; i++) {
    conditions.push(analyzeAtmosphericCondition(contents[i] ?? '',files[i] ?? ''))
  }

  const dirMap = new Map<string, AtmosphericCondition[]>()
  for (const cond of conditions) {
    const normalized = cond.file.replace(/\\/g, '/')
    const dir = normalized.includes('/') ? normalized.substring(0, normalized.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) existing.push(cond)
    else dirMap.set(dir, [cond])
  }

  const zones: WeatherZone[] = []
  for (const [dir, dirConditions] of dirMap) {
    zones.push(analyzeWeatherZone(dirConditions, dir))
  }

  const globalForecast = computeGlobalForecast(conditions, zones)
  const stats = computeWeatherSystemStats(conditions, zones, globalForecast)
  const recommendations = generateWeatherSystemRecommendations(conditions, zones, stats)

  return { conditions, zones, globalForecast, stats, recommendations }
}

function computeWeatherSystemStats(conditions: AtmosphericCondition[], zones: WeatherZone[], globalForecast: GlobalForecast): WeatherSystemStats {
  const totalFiles = conditions.length
  const totalZones = zones.length

  const avgPressure = totalFiles > 0 ? Math.round(conditions.reduce((s, c) => s + c.pressure, 0) / totalFiles) : 0
  const avgTemperature = totalFiles > 0 ? Math.round(conditions.reduce((s, c) => s + c.temperature, 0) / totalFiles) : 0
  const avgHumidity = totalFiles > 0 ? Math.round(conditions.reduce((s, c) => s + c.humidity, 0) / totalFiles) : 0
  const avgVisibility = totalFiles > 0 ? Math.round(conditions.reduce((s, c) => s + c.visibility, 0) / totalFiles) : 0
  const avgComfort = totalFiles > 0 ? Math.round(conditions.reduce((s, c) => s + c.comfort, 0) / totalFiles) : 0

  const clearFiles = conditions.filter(c => c.weatherType === 'clear' || c.weatherType === 'partly-cloudy').length
  const stormyFiles = conditions.filter(c => c.weatherType === 'thunderstorm' || c.weatherType === 'tornado' || c.weatherType === 'hurricane').length
  const foggyFiles = conditions.filter(c => c.weatherType === 'foggy').length
  const extremeFiles = stormyFiles + foggyFiles

  const totalAlerts = conditions.reduce((s, c) => s + c.alerts.length, 0)

  const tropicalZones = zones.filter(z => z.zoneType === 'tropical').length
  const arcticZones = zones.filter(z => z.zoneType === 'arctic').length
  const desertZones = zones.filter(z => z.zoneType === 'desert').length
  const monsoonZones = zones.filter(z => z.zoneType === 'monsoon').length

  const overallComfort = avgComfort
  const airQualityIndex = computeAirQualityIndex(conditions)
  const stormRisk = globalForecast.stormRisk
  const climateGrade = globalForecast.climateGrade

  const sortedByComfort = [...conditions].sort((a, b) => b.comfort - a.comfort)
  const bestWeather = sortedByComfort.length > 0 ? (sortedByComfort[0] ?? { file: '' }).file : 'none'
  const worstWeather = sortedByComfort.length > 0 ? sortedByComfort[sortedByComfort.length - 1]?.file : 'none'

  const sortedZones = [...zones].sort((a, b) => b.avgComfort - a.avgComfort)
  const safestZone = sortedZones.length > 0 ? (sortedZones[0] ?? { directory: '' }).directory : 'none'
  const riskiestZone = sortedZones.length > 0 ? sortedZones[sortedZones.length - 1]?.directory : 'none'

  return {
    totalFiles,
    totalZones,
    avgPressure,
    avgTemperature,
    avgHumidity,
    avgVisibility,
    avgComfort,
    clearFiles,
    stormyFiles,
    foggyFiles,
    extremeFiles,
    totalAlerts,
    tropicalZones,
    arcticZones,
    desertZones,
    monsoonZones,
    overallComfort,
    airQualityIndex,
    stormRisk,
    climateGrade,
    bestWeather,
    worstWeather: worstWeather ?? '',
    safestZone,
    riskiestZone: riskiestZone ?? '',
  }
}
