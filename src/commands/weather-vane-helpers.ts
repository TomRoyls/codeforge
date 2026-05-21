// ─── Interfaces ──────────────────────────────────────────────────────────────

export type CardinalDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'
export type FrontType = 'warm' | 'cold' | 'occluded' | 'stationary' | 'none'
export type PrecipitationType = 'rain' | 'snow' | 'sleet' | 'hail' | 'drizzle' | 'none'
export type TemperatureTrend = 'rising' | 'falling' | 'stable'
export type CloudType = 'cirrus' | 'cumulus' | 'stratus' | 'nimbus' | 'cumulonimbus' | 'clear'
export type ForecastTrend = 'improving' | 'deteriorating' | 'stable' | 'volatile' | 'unknown'
export type WeatherCondition = 'fair-weather' | 'clear' | 'partly-cloudy' | 'cloudy' | 'stormy' | 'hurricane'
export type StationCondition = 'perfect-conditions' | 'good-weather' | 'changing' | 'unsettled' | 'stormy' | 'catastrophic'
export type StationType = 'observatory' | 'weather-station' | 'anemometer' | 'barometer' | 'weathered-post' | 'broken-vane'
export type MeteorologistGrade = 'chief-meteorologist' | 'meteorologist' | 'weatherman' | 'farmer' | 'shepherd' | 'groundhog'

export interface WindReading {
  file: string
  windDirection: number
  cardinalDirection: CardinalDirection
  windSpeed: number
  pressure: number
  humidity: number
  temperature: number
  wind: {
    direction: number
    speed: number
    isSteady: boolean
    isGusting: boolean
    isCalm: boolean
    isVariable: boolean
    gustFactor: number
    prevailingDirection: string
  }
  atmosphere: {
    pressure: number
    isHighPressure: boolean
    isLowPressure: boolean
    isRising: boolean
    isFalling: boolean
    frontType: FrontType
  }
  moisture: {
    humidity: number
    dewPoint: number
    isDry: boolean
    isDamp: boolean
    isSaturated: boolean
    hasPrecipitation: boolean
    precipitationType: PrecipitationType
  }
  temperatureObj: {
    current: number
    trend: TemperatureTrend
    isHot: boolean
    isCold: boolean
    isFreezing: boolean
    hasFever: boolean
    hasFrostbite: boolean
  }
  cloud: {
    coverage: number
    ceiling: number
    isClear: boolean
    isOvercast: boolean
    isPartlyCloudy: boolean
    hasStormClouds: boolean
    cloudType: CloudType
  }
  forecast: {
    shortRange: string
    trend: ForecastTrend
    confidence: number
    hasStormWarning: boolean
    hasClearingSkies: boolean
    hasFrontMoving: boolean
  }
  condition: WeatherCondition
  qualityScore: number
}

export interface WeatherStation {
  directory: string
  readings: WindReading[]
  avgWindSpeed: number
  avgPressure: number
  avgTemperature: number
  avgHumidity: number
  fairWeatherCount: number
  stormyCount: number
  prevailingWind: string
  stationType: StationType
  condition: StationCondition
}

export interface Climate {
  avgWindSpeed: number
  avgPressure: number
  avgTemperature: number
  avgHumidity: number
  prevailingWind: string
  isStable: boolean
  overallConditions: number
}

export interface WeatherVaneStats {
  totalFiles: number
  totalStations: number
  avgWindSpeed: number
  avgPressure: number
  avgTemperature: number
  avgHumidity: number
  avgCloudCoverage: number
  avgForecastConfidence: number
  fairWeatherCount: number
  clearCount: number
  partlyCloudyCount: number
  cloudyCount: number
  stormyCount: number
  hurricaneCount: number
  steadyWindCount: number
  gustingWindCount: number
  calmWindCount: number
  variableWindCount: number
  highPressureCount: number
  lowPressureCount: number
  hotCount: number
  coldCount: number
  freezingCount: number
  stormWarningCount: number
  clearingSkiesCount: number
  improvingCount: number
  deterioratingCount: number
  stableCount: number
  overallConditions: number
  meteorologistGrade: MeteorologistGrade
  bestConditions: string
  worstConditions: string
  mostActive: string
  mostStable: string
  stormiest: string
}

export interface WeatherVaneResult {
  readings: WindReading[]
  stations: WeatherStation[]
  climate: Climate
  stats: WeatherVaneStats
  recommendations: string[]
}

// ─── Content Primitives ──────────────────────────────────────────────────────

/**
 * Count lines of code
 * @example
 * countLoc('const x = 1\nconst y = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count imports
 * @example
 * countImports('import { x } from "y"') // 1
 */
export function countImports(content: string): number {
  return (content.match(/^import\s+/gm) ?? []).length
}

/**
 * Count exports
 * @example
 * countExports('export function a() {}') // 1
 */
export function countExports(content: string): number {
  return (content.match(/\bexport\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+/g) ?? []).length
}

/**
 * Count functions
 * @example
 * countFunctions('function a() {}') // 1
 */
export function countFunctions(content: string): number {
  return (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) ?? []).length
}

/**
 * Count classes
 * @example
 * countClasses('class Foo {}') // 1
 */
export function countClasses(content: string): number {
  return (content.match(/\bclass\s+\w+/g) ?? []).length
}

/**
 * Count error handling constructs
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  return (content.match(/\btry\s*\{|\bcatch\s*\(|\.catch\s*\(|\bthrow\s+/g) ?? []).length
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)/g) ?? []).length
}

/**
 * Count branches
 * @example
 * countBranches('if (a) {}') // 1
 */
export function countBranches(content: string): number {
  return (content.match(/\bif\s*\(|\?\s*[^?]\s*:|\bswitch\s*\(/g) ?? []).length
}

/**
 * Count max nesting depth
 * @example
 * maxNesting('{{{}}}') // 3
 */
export function maxNesting(content: string): number {
  let m = 0
  let c = 0
  for (const ch of content) {
    if (ch === '{') { c++; if (c > m) m = c }
    else if (ch === '}') { c = Math.max(0, c - 1) }
  }
  return m
}

/**
 * Count console statements
 * @example
 * countConsole('console.log("x")') // 1
 */
export function countConsole(content: string): number {
  return (content.match(/console\.\w+\s*\(/g) ?? []).length
}

/**
 * Count comments
 * @example
 * countComments('// hello') // 1
 */
export function countComments(content: string): number {
  return (content.match(/\/\//g) ?? []).length + (content.match(/\/\*/g) ?? []).length
}

/**
 * Count TODO markers
 * @example
 * countTodos('TODO: fix') // 1
 */
export function countTodos(content: string): number {
  return (content.match(/TODO|FIXME|HACK|XXX/gi) ?? []).length
}

/**
 * Count JSDoc blocks
 * @example
 * countJSDoc('/** doc * slash /') // 1
 */
export function countJSDoc(content: string): number {
  return (content.match(/\/\*\*/g) ?? []).length
}

/**
 * Count descriptive names (camelCase longer than 3 chars)
 * @example
 * countDescriptiveNames('function calculateTotal() {}') // 1
 */
export function countDescriptiveNames(content: string): number {
  return (content.match(/\b(?:function|const|let|var)\s+[a-z]{1}[a-zA-Z]{3,}\b/g) ?? []).length
}

/**
 * Count short names (1-2 chars)
 * @example
 * countShortNames('const x = 1') // 1
 */
export function countShortNames(content: string): number {
  return (content.match(/\b(?:const|let|var)\s+[a-z]{1,2}\b/g) ?? []).length
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Convert degrees to cardinal direction
 * @example
 * toCardinal(0) // 'N'
 */
export function toCardinal(degrees: number): CardinalDirection {
  const d = ((degrees % 360) + 360) % 360
  if (d < 22.5 || d >= 337.5) return 'N'
  if (d < 67.5) return 'NE'
  if (d < 112.5) return 'E'
  if (d < 157.5) return 'SE'
  if (d < 202.5) return 'S'
  if (d < 247.5) return 'SW'
  if (d < 292.5) return 'W'
  return 'NW'
}

/**
 * Classify weather condition from scores
 * @example
 * classifyWeatherCondition(90) // 'fair-weather'
 */
export function classifyWeatherCondition(score: number): WeatherCondition {
  if (score >= 80) return 'fair-weather'
  if (score >= 65) return 'clear'
  if (score >= 45) return 'partly-cloudy'
  if (score >= 25) return 'cloudy'
  if (score >= 10) return 'stormy'
  return 'hurricane'
}

/**
 * Classify station condition from average scores
 * @example
 * classifyStationCondition(80) // 'perfect-conditions'
 */
export function classifyStationCondition(avgScore: number): StationCondition {
  if (avgScore >= 75) return 'perfect-conditions'
  if (avgScore >= 60) return 'good-weather'
  if (avgScore >= 40) return 'changing'
  if (avgScore >= 20) return 'unsettled'
  if (avgScore >= 8) return 'stormy'
  return 'catastrophic'
}

/**
 * Classify station type from readings
 * @example
 * classifyStationType([]) // 'broken-vane'
 */
export function classifyStationType(readings: WindReading[]): StationType {
  if (readings.length === 0) return 'broken-vane'
  const n = readings.length
  const steady = readings.filter(r => r.wind.isSteady).length
  const clear = readings.filter(r => r.condition === 'fair-weather' || r.condition === 'clear').length
  const documented = readings.filter(r => r.cloud.isClear || r.cloud.isPartlyCloudy).length

  if (documented > n * 0.7 && steady > n * 0.5) return 'observatory'
  if (clear > n * 0.4 && n >= 3) return 'weather-station'
  if (steady > n * 0.5) return 'anemometer'
  if (documented > n * 0.3) return 'barometer'
  if (readings.filter(r => r.wind.isVariable).length < n * 0.5) return 'weathered-post'
  return 'broken-vane'
}

/**
 * Classify meteorologist grade from average conditions
 * @example
 * classifyMeteorologistGrade(85) // 'chief-meteorologist'
 */
export function classifyMeteorologistGrade(avgConditions: number): MeteorologistGrade {
  if (avgConditions >= 80) return 'chief-meteorologist'
  if (avgConditions >= 65) return 'meteorologist'
  if (avgConditions >= 45) return 'weatherman'
  if (avgConditions >= 30) return 'farmer'
  if (avgConditions >= 15) return 'shepherd'
  return 'groundhog'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure wind properties from code content
 * @example
 * measureWind('import { x } from "./a"') // { direction, speed, ... }
 */
export function measureWind(content: string): WindReading['wind'] {
  const imports = countImports(content)
  const exports = countExports(content)
  const branches = countBranches(content)
  const loc = countLoc(content)

  const direction = ((imports * 45 + exports * 90 + branches * 30) % 360)
  const speed = Math.min(100, Math.max(0, Math.round(
    (imports * 10) +
    (exports * 8) +
    (branches * 5) +
    (loc * 0.3),
  )))
  const gustFactor = Math.min(100, Math.max(0, Math.round(
    (branches * 15) +
    (maxNesting(content) * 10),
  )))

  const isCalm = speed <= 10
  const isGusting = gustFactor >= 60
  const isVariable = branches > 5 && gustFactor >= 40
  const isSteady = !isVariable && !isGusting && speed > 10

  return {
    direction,
    speed,
    isSteady,
    isGusting,
    isCalm,
    isVariable,
    gustFactor,
    prevailingDirection: toCardinal(direction),
  }
}

/**
 * Measure atmospheric pressure from code content
 * @example
 * measureAtmosphere('TODO: fix this') // { pressure, frontType, ... }
 */
export function measureAtmosphere(content: string): WindReading['atmosphere'] {
  const todos = countTodos(content)
  const errors = countErrorHandling(content)
  const loc = countLoc(content)
  const console_ = countConsole(content)
  const shortNames = countShortNames(content)

  const pressure = Math.min(100, Math.max(0, Math.round(
    (todos * 15) +
    (console_ * 10) +
    (shortNames * 8) +
    (loc > 40 ? 10 : 0) +
    (errors === 0 && loc > 5 ? 15 : 0),
  )))

  const isHighPressure = pressure >= 60
  const isLowPressure = pressure <= 25
  const isRising = todos > 2
  const isFalling = errors > 0 && todos === 0

  let frontType: FrontType = 'none'
  if (isRising && todos >= 3) frontType = 'warm'
  else if (isFalling) frontType = 'cold'
  else if (isRising && isFalling) frontType = 'occluded'
  else if (pressure >= 40 && pressure <= 60) frontType = 'stationary'

  return {
    pressure,
    isHighPressure,
    isLowPressure,
    isRising,
    isFalling,
    frontType,
  }
}

/**
 * Measure moisture properties from code content
 * @example
 * measureMoisture('export function a() {}') // { humidity, dewPoint, ... }
 */
export function measureMoisture(content: string): WindReading['moisture'] {
  const exports = countExports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const types = countTypeAnnotations(content)
  const loc = countLoc(content)

  const humidity = Math.min(100, Math.max(0, Math.round(
    (exports * 10) +
    (functions * 8) +
    (classes * 12) +
    (types * 5) +
    (loc * 0.2),
  )))

  const dewPoint = Math.min(100, Math.max(0, Math.round(
    humidity * 0.6 +
    (countComments(content) > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0),
  )))

  const isDry = humidity <= 15
  const isDamp = humidity > 15 && humidity <= 50
  const isSaturated = humidity >= 75
  const hasPrecipitation = humidity >= 40

  let precipitationType: PrecipitationType = 'none'
  if (hasPrecipitation) {
    if (humidity >= 80) precipitationType = 'hail'
    else if (humidity >= 65) precipitationType = 'rain'
    else if (humidity >= 55) precipitationType = 'drizzle'
    else if (classes > 2) precipitationType = 'snow'
    else precipitationType = 'sleet'
  }

  return {
    humidity,
    dewPoint,
    isDry,
    isDamp,
    isSaturated,
    hasPrecipitation,
    precipitationType,
  }
}

/**
 * Measure temperature properties from code content
 * @example
 * measureTemperatureReading('function a() {}') // { current, trend, ... }
 */
export function measureTemperatureReading(content: string): WindReading['temperatureObj'] {
  const functions = countFunctions(content)
  const branches = countBranches(content)
  const nesting = maxNesting(content)
  const loc = countLoc(content)
  const imports = countImports(content)

  const current = Math.min(100, Math.max(0, Math.round(
    (functions * 8) +
    (branches * 5) +
    (nesting * 8) +
    (imports * 4) +
    (loc * 0.3),
  )))

  const trend: TemperatureTrend = functions > 3 ? 'rising' : loc < 5 ? 'falling' : 'stable'

  const isHot = current >= 70
  const isCold = current <= 20
  const isFreezing = current <= 5
  const hasFever = current >= 90
  const hasFrostbite = current <= 3

  return {
    current,
    trend,
    isHot,
    isCold,
    isFreezing,
    hasFever,
    hasFrostbite,
  }
}

/**
 * Measure cloud properties from code content
 * @example
 * measureCloud('const x = 1') // { coverage, ceiling, ... }
 */
export function measureCloud(content: string): WindReading['cloud'] {
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const todos = countTodos(content)
  const descriptive = countDescriptiveNames(content)
  const loc = countLoc(content)

  const coverage = Math.min(100, Math.max(0, Math.round(
    (todos * 20) +
    (comments === 0 && loc > 5 ? 25 : 0) +
    (jsdoc === 0 && loc > 5 ? 20 : 0) +
    (descriptive === 0 && loc > 3 ? 15 : 0) +
    (loc > 50 ? 10 : 0),
  )))

  const ceiling = Math.min(100, Math.max(0, Math.round(
    (comments > 0 ? 25 : 0) +
    (jsdoc > 0 ? 25 : 0) +
    (descriptive > 0 ? 20 : 0) +
    (todos === 0 ? 20 : 0) +
    (loc > 0 && loc <= 30 ? 10 : 0),
  )))

  const isClear = coverage <= 15
  const isOvercast = coverage >= 70
  const isPartlyCloudy = coverage > 15 && coverage < 70
  const hasStormClouds = coverage >= 80 && todos >= 3

  let cloudType: CloudType = 'clear'
  if (hasStormClouds) cloudType = 'cumulonimbus'
  else if (isOvercast) cloudType = 'nimbus'
  else if (coverage >= 50) cloudType = 'stratus'
  else if (isPartlyCloudy) cloudType = 'cumulus'
  else if (coverage > 5) cloudType = 'cirrus'

  return {
    coverage,
    ceiling,
    isClear,
    isOvercast,
    isPartlyCloudy,
    hasStormClouds,
    cloudType,
  }
}

/**
 * Measure forecast properties from code content
 * @example
 * measureForecast('TODO: refactor') // { shortRange, trend, ... }
 */
export function measureForecast(content: string): WindReading['forecast'] {
  const todos = countTodos(content)
  const errors = countErrorHandling(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const loc = countLoc(content)
  const descriptive = countDescriptiveNames(content)

  const trend: ForecastTrend = todos > 2 ? 'deteriorating'
    : (comments > 0 && jsdoc > 0) ? 'improving'
    : loc === 0 ? 'unknown'
    : errors === 0 && todos === 0 ? 'stable'
    : 'volatile'

  const confidence = Math.min(100, Math.max(0, Math.round(
    (comments > 0 ? 20 : 0) +
    (jsdoc > 0 ? 25 : 0) +
    (errors > 0 ? 15 : 0) +
    (todos === 0 ? 20 : 0) +
    (loc > 0 ? 10 : 0) +
    (descriptive > 0 ? 10 : 0),
  )))

  const hasStormWarning = todos >= 3 && errors === 0
  const hasClearingSkies = comments > 0 && jsdoc > 0 && todos === 0
  const hasFrontMoving = todos > 0 && errors > 0

  let shortRange = 'conditions stable'
  if (hasStormWarning) shortRange = 'storm warning: technical debt accumulating'
  else if (hasClearingSkies) shortRange = 'clearing skies: code quality improving'
  else if (hasFrontMoving) shortRange = 'front moving: mixed quality signals'
  else if (trend === 'deteriorating') shortRange = 'deteriorating: increasing debt signals'
  else if (trend === 'improving') shortRange = 'improving: documentation and quality rising'

  return {
    shortRange,
    trend,
    confidence,
    hasStormWarning,
    hasClearingSkies,
    hasFrontMoving,
  }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a wind reading
 * @example
 * analyzeWindReading('export function a(): number { return 1 }', 'a.ts') // WindReading
 */
export function analyzeWindReading(content: string, filePath: string): WindReading {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      file: filePath,
      windDirection: 0, cardinalDirection: 'N',
      windSpeed: 0, pressure: 0, humidity: 0, temperature: 0,
      wind: { direction: 0, speed: 0, isSteady: false, isGusting: false, isCalm: true, isVariable: false, gustFactor: 0, prevailingDirection: 'N' },
      atmosphere: { pressure: 0, isHighPressure: false, isLowPressure: true, isRising: false, isFalling: false, frontType: 'none' },
      moisture: { humidity: 0, dewPoint: 0, isDry: true, isDamp: false, isSaturated: false, hasPrecipitation: false, precipitationType: 'none' },
      temperatureObj: { current: 0, trend: 'stable', isHot: false, isCold: true, isFreezing: true, hasFever: false, hasFrostbite: true },
      cloud: { coverage: 0, ceiling: 0, isClear: true, isOvercast: false, isPartlyCloudy: false, hasStormClouds: false, cloudType: 'clear' },
      forecast: { shortRange: 'no data', trend: 'unknown', confidence: 0, hasStormWarning: false, hasClearingSkies: false, hasFrontMoving: false },
      condition: 'hurricane',
      qualityScore: 0,
    }
  }

  const wind = measureWind(content)
  const atmosphere = measureAtmosphere(content)
  const moisture = measureMoisture(content)
  const tempReading = measureTemperatureReading(content)
  const cloudReading = measureCloud(content)
  const forecastReading = measureForecast(content)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (100 - atmosphere.pressure) * 0.15 +
    (100 - cloudReading.coverage) * 0.15 +
    cloudReading.ceiling * 0.15 +
    forecastReading.confidence * 0.1 +
    (100 - wind.gustFactor) * 0.1 +
    (moisture.isSaturated ? 0 : 10) +
    (tempReading.hasFever ? 0 : 10) +
    (100 - wind.speed) * 0.05 +
    (wind.isSteady ? 10 : 0),
  )))

  const condition = classifyWeatherCondition(qualityScore)

  return {
    file: filePath,
    windDirection: wind.direction,
    cardinalDirection: wind.prevailingDirection as CardinalDirection,
    windSpeed: wind.speed,
    pressure: atmosphere.pressure,
    humidity: moisture.humidity,
    temperature: tempReading.current,
    wind,
    atmosphere,
    moisture,
    temperatureObj: tempReading,
    cloud: cloudReading,
    forecast: forecastReading,
    condition,
    qualityScore,
  }
}

// ─── Station Analysis ────────────────────────────────────────────────────────

/**
 * Analyze a directory as a weather station
 * @example
 * analyzeWeatherStation(readings, 'src') // WeatherStation
 */
export function analyzeWeatherStation(readings: WindReading[], dirPath: string): WeatherStation {
  if (readings.length === 0) {
    return {
      directory: dirPath, readings: [],
      avgWindSpeed: 0, avgPressure: 0, avgTemperature: 0, avgHumidity: 0,
      fairWeatherCount: 0, stormyCount: 0,
      prevailingWind: 'N',
      stationType: 'broken-vane',
      condition: 'catastrophic',
    }
  }

  const n = readings.length
  const avgWindSpeed = Math.round(readings.reduce((s, r) => s + r.windSpeed, 0) / n)
  const avgPressure = Math.round(readings.reduce((s, r) => s + r.pressure, 0) / n)
  const avgTemperature = Math.round(readings.reduce((s, r) => s + r.temperature, 0) / n)
  const avgHumidity = Math.round(readings.reduce((s, r) => s + r.humidity, 0) / n)

  const fairWeatherCount = readings.filter(r => r.condition === 'fair-weather' || r.condition === 'clear').length
  const stormyCount = readings.filter(r => r.condition === 'stormy' || r.condition === 'hurricane').length

  const dirCounts = new Map<string, number>()
  for (const r of readings) {
    const prev = dirCounts.get(r.cardinalDirection) ?? 0
    dirCounts.set(r.cardinalDirection, prev + 1)
  }
  let prevailingWind = 'N'
  let maxCount = 0
  for (const [dir, count] of dirCounts) {
    if (count > maxCount) { maxCount = count; prevailingWind = dir }
  }

  const stationType = classifyStationType(readings)
  const avgScore = Math.round(readings.reduce((s, r) => s + r.qualityScore, 0) / n)
  const condition = classifyStationCondition(avgScore)

  return {
    directory: dirPath, readings,
    avgWindSpeed, avgPressure, avgTemperature, avgHumidity,
    fairWeatherCount, stormyCount,
    prevailingWind,
    stationType, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate weather vane recommendations
 * @example
 * generateRecommendations(readings, stations, climate, stats) // string[]
 */
export function generateRecommendations(
  _readings: WindReading[],
  _stations: WeatherStation[],
  _climate: Climate,
  stats: WeatherVaneStats,
): string[] {
  void _readings
  void _stations
  void _climate
  const recs: string[] = []

  if (stats.stormWarningCount > 0) {
    recs.push(`Storm warnings: ${stats.stormWarningCount} files show accumulating technical debt`)
  }
  if (stats.variableWindCount > stats.totalFiles * 0.3) {
    recs.push('Variable winds: significant code direction inconsistency detected')
  }
  if (stats.freezingCount > 0) {
    recs.push(`Freezing conditions: ${stats.freezingCount} files appear abandoned or inactive`)
  }
  if (stats.overallConditions >= 60) {
    recs.push('Fair weather: codebase trends are healthy and predictable')
  }
  if (stats.clearingSkiesCount > 0) {
    recs.push(`Clearing skies: ${stats.clearingSkiesCount} files showing quality improvement`)
  }
  if (stats.deterioratingCount > stats.improvingCount) {
    recs.push('Deteriorating trend: more files declining than improving')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete weather vane result from files and contents
 * @example
 * buildWeatherVaneResult(['a.ts'], ['export function a() {}'], {}) // WeatherVaneResult
 */
export function buildWeatherVaneResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): WeatherVaneResult {
  void options

  const readings: WindReading[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeWindReading(content, file)
    } catch {
      return analyzeWindReading('', file)
    }
  })

  const dirMap = new Map<string, WindReading[]>()
  for (const r of readings) {
    const dir = r.file.includes('/') ? r.file.slice(0, r.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(r) } else { dirMap.set(dir, [r]) }
  }

  const stations: WeatherStation[] = Array.from(dirMap.entries()).map(([dir, rs]) =>
    analyzeWeatherStation(rs, dir),
  )

  const n = readings.length || 1
  const avgWindSpeed = Math.round(readings.reduce((s, r) => s + r.windSpeed, 0) / n)
  const avgPressure = Math.round(readings.reduce((s, r) => s + r.pressure, 0) / n)
  const avgTemperature = Math.round(readings.reduce((s, r) => s + r.temperature, 0) / n)
  const avgHumidity = Math.round(readings.reduce((s, r) => s + r.humidity, 0) / n)

  const dirCounts = new Map<string, number>()
  for (const r of readings) {
    const prev = dirCounts.get(r.cardinalDirection) ?? 0
    dirCounts.set(r.cardinalDirection, prev + 1)
  }
  let prevailingWind = 'N'
  let maxDirCount = 0
  for (const [dir, count] of dirCounts) {
    if (count > maxDirCount) { maxDirCount = count; prevailingWind = dir }
  }

  const overallConditions = Math.min(100, Math.max(0, Math.round(
    (100 - avgPressure) * 0.2 +
    (100 - readings.reduce((s, r) => s + r.cloud.coverage, 0) / n) * 0.2 +
    readings.reduce((s, r) => s + r.forecast.confidence, 0) / n * 0.15 +
    (readings.filter(r => r.condition === 'fair-weather' || r.condition === 'clear').length / n) * 100 * 0.2 +
    (readings.filter(r => r.wind.isSteady).length / n) * 100 * 0.1 +
    (100 - avgWindSpeed) * 0.1 +
    (stations.filter(s => s.condition === 'perfect-conditions' || s.condition === 'good-weather').length / Math.max(stations.length, 1)) * 100 * 0.05,
  )))

  const isStable = overallConditions >= 50 && avgWindSpeed < 60

  const climate: Climate = {
    avgWindSpeed,
    avgPressure,
    avgTemperature,
    avgHumidity,
    prevailingWind,
    isStable,
    overallConditions,
  }

  const stats: WeatherVaneStats = {
    totalFiles: files.length,
    totalStations: stations.length,
    avgWindSpeed,
    avgPressure,
    avgTemperature,
    avgHumidity,
    avgCloudCoverage: Math.round(readings.reduce((s, r) => s + r.cloud.coverage, 0) / n),
    avgForecastConfidence: Math.round(readings.reduce((s, r) => s + r.forecast.confidence, 0) / n),
    fairWeatherCount: readings.filter(r => r.condition === 'fair-weather').length,
    clearCount: readings.filter(r => r.condition === 'clear').length,
    partlyCloudyCount: readings.filter(r => r.condition === 'partly-cloudy').length,
    cloudyCount: readings.filter(r => r.condition === 'cloudy').length,
    stormyCount: readings.filter(r => r.condition === 'stormy').length,
    hurricaneCount: readings.filter(r => r.condition === 'hurricane').length,
    steadyWindCount: readings.filter(r => r.wind.isSteady).length,
    gustingWindCount: readings.filter(r => r.wind.isGusting).length,
    calmWindCount: readings.filter(r => r.wind.isCalm).length,
    variableWindCount: readings.filter(r => r.wind.isVariable).length,
    highPressureCount: readings.filter(r => r.atmosphere.isHighPressure).length,
    lowPressureCount: readings.filter(r => r.atmosphere.isLowPressure).length,
    hotCount: readings.filter(r => r.temperatureObj.isHot).length,
    coldCount: readings.filter(r => r.temperatureObj.isCold).length,
    freezingCount: readings.filter(r => r.temperatureObj.isFreezing).length,
    stormWarningCount: readings.filter(r => r.forecast.hasStormWarning).length,
    clearingSkiesCount: readings.filter(r => r.forecast.hasClearingSkies).length,
    improvingCount: readings.filter(r => r.forecast.trend === 'improving').length,
    deterioratingCount: readings.filter(r => r.forecast.trend === 'deteriorating').length,
    stableCount: readings.filter(r => r.forecast.trend === 'stable').length,
    overallConditions,
    meteorologistGrade: classifyMeteorologistGrade(overallConditions),
    bestConditions: readings.length > 0
      ? readings.reduce((a, b) => b.qualityScore > a.qualityScore ? b : a, readings[0]).file : 'none',
    worstConditions: readings.length > 0
      ? readings.reduce((a, b) => b.qualityScore < a.qualityScore ? b : a, readings[0]).file : 'none',
    mostActive: readings.length > 0
      ? readings.reduce((a, b) => b.temperature > a.temperature ? b : a, readings[0]).file : 'none',
    mostStable: readings.length > 0
      ? readings.reduce((a, b) => b.wind.isSteady && !a.wind.isSteady ? b : a, readings[0]).file : 'none',
    stormiest: readings.length > 0
      ? readings.reduce((a, b) => b.atmosphere.pressure > a.atmosphere.pressure ? b : a, readings[0]).file : 'none',
  }

  const recommendations = generateRecommendations(readings, stations, climate, stats)

  return { readings, stations, climate, stats, recommendations }
}
