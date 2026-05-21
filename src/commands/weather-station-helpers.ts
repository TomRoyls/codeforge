// ─── Types ──────────────────────────────────────────────────────────────────

export type TemperatureScale = 'frigid' | 'cold' | 'cool' | 'mild' | 'warm' | 'hot' | 'scorching'
export type PressureTrend = 'rising-rapidly' | 'rising' | 'steady' | 'falling' | 'falling-rapidly' | 'volatile'
export type HumidityComfort = 'arid' | 'dry' | 'comfortable' | 'humid' | 'tropical' | 'saturated'
export type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'variable' | 'calm'
export type PrecipType = 'clear' | 'drizzle' | 'rain' | 'heavy-rain' | 'thunderstorm' | 'monsoon'
export type VisCondition = 'unlimited' | 'excellent' | 'good' | 'moderate' | 'poor' | 'zero'
export type TempTrend = 'rising' | 'falling' | 'stable' | 'volatile'
export type ReadingCondition = 'perfect-day' | 'fair-weather' | 'partly-cloudy' | 'overcast' | 'stormy' | 'natural-disaster'
export type ZoneType = 'tropical-paradise' | 'mediterranean' | 'temperate' | 'continental' | 'arctic' | 'disaster-zone'
export type ZoneCondition = 'resort-weather' | 'pleasant' | 'seasonal' | 'challenging' | 'harsh' | 'apocalyptic'
export type MeteorologistGrade = 'chief-meteorologist' | 'senior-forecaster' | 'meteorologist' | 'weather-observer' | 'amateur' | 'groundhog'

export interface ThermometerMeasure {
  reading: number
  scale: TemperatureScale
  isComfortable: boolean
  hasHeatWave: boolean
  hasColdSpell: boolean
  hasFever: boolean
  hasFrostbite: boolean
  hasThermalEquilibrium: boolean
  temperatureTrend: TempTrend
}

export interface BarometerMeasure {
  reading: number
  trend: PressureTrend
  isHighPressure: boolean
  isLowPressure: boolean
  hasPressureSystem: boolean
  hasFront: boolean
  hasIsobar: boolean
  hasStormSystem: boolean
  hasClearSkies: boolean
  frontCount: number
}

export interface HygrometerMeasure {
  reading: number
  comfort: HumidityComfort
  isComfortable: boolean
  hasDewPoint: boolean
  hasCondensation: boolean
  hasFog: boolean
  hasMold: boolean
  hasDrought: boolean
  hasFlashFlood: boolean
  condensationCount: number
}

export interface AnemometerMeasure {
  reading: number
  direction: WindDirection
  beaufortScale: number
  isCalm: boolean
  hasBreeze: boolean
  hasGusts: boolean
  hasSustainedWinds: boolean
  hasGaleForce: boolean
  hasHurricane: boolean
  hasJetStream: boolean
  gustCount: number
}

export interface RainGaugeMeasure {
  reading: number
  type: PrecipType
  hasDrainage: boolean
  hasFlooding: boolean
  hasDrought: boolean
  hasAcidRain: boolean
  hasHail: boolean
  hasSnow: boolean
  hasRainbow: boolean
  hasUmbrella: boolean
  umbrellaCount: number
}

export interface VisibilityMeasure {
  reading: number
  condition: VisCondition
  hasClearView: boolean
  hasHaze: boolean
  hasFog: boolean
  hasSmog: boolean
  hasWhiteout: boolean
  hasMirage: boolean
  hasAurora: boolean
  hazeCount: number
}

export interface WeatherReading {
  file: string
  temperature: number
  pressure: number
  humidity: number
  windSpeed: number
  precipitation: number
  visibility: number
  thermometer: ThermometerMeasure
  barometer: BarometerMeasure
  hygrometer: HygrometerMeasure
  anemometer: AnemometerMeasure
  rainGauge: RainGaugeMeasure
  visibilityMeasure: VisibilityMeasure
  condition: ReadingCondition
  qualityScore: number
}

export interface ClimateZone {
  directory: string
  readings: WeatherReading[]
  avgTemperature: number
  avgPressure: number
  avgVisibility: number
  perfectDayCount: number
  stormyCount: number
  comfortableCount: number
  clearViewCount: number
  zoneType: ZoneType
  condition: ZoneCondition
}

export interface WeatherStationStats {
  totalFiles: number
  totalZones: number
  avgTemperature: number
  avgPressure: number
  avgHumidity: number
  avgWindSpeed: number
  avgPrecipitation: number
  avgVisibility: number
  perfectDayCount: number
  fairWeatherCount: number
  partlyCloudyCount: number
  overcastCount: number
  stormyCount: number
  naturalDisasterCount: number
  isComfortableCount: number
  hasHeatWaveCount: number
  isHighPressureCount: number
  hasStormSystemCount: number
  hasFogCount: number
  hasCondensationCount: number
  isCalmCount: number
  hasGaleForceCount: number
  hasDrainageCount: number
  hasFloodingCount: number
  hasUmbrellaCount: number
  hasClearViewCount: number
  overallClimate: number
  meteorologistGrade: MeteorologistGrade
  bestConditions: string
  clearestSkies: string
  mostStable: string
  bestDrainage: string
  calmestWinds: string
}

export interface WeatherStationResult {
  readings: WeatherReading[]
  zones: ClimateZone[]
  bureau: {
    avgTemperature: number
    avgPressure: number
    avgVisibility: number
    isCalmClimate: boolean
    overallClimate: number
  }
  stats: WeatherStationStats
  recommendations: string[]
}

// ─── Regex Patterns ─────────────────────────────────────────────────────────

const FUNCTION_RE = /\bfunction\s+(\w+)/g
const ARROW_RE = /=>\s*[{(]/g
const IMPORT_RE = /import\s+(?:\{[^}]*\}|\w+)\s+from\s+['"]([^'"]+)['"]/g
const EXPORT_RE = /export\s+/g
const IF_RE = /\bif\s*\(/g
const FOR_RE = /\bfor\s*\(/g
const WHILE_RE = /\bwhile\s*\(/g
const SWITCH_RE = /\bswitch\s*\(/g
const TRY_CATCH_RE = /try\s*\{/g
const TYPE_ANNOTATION_RE = /:\s*(?:string|number|boolean|void|Promise|Record|Map|Set|Array|Date|RegExp|Error|[A-Z]\w+)/
const INTERFACE_RE = /(?:interface|type)\s+\w+\s*(?:<[^>]+>)?\s*\{/
const CLASS_RE = /\bclass\s+\w+/
const CONST_RE = /\bconst\s+/g
const LET_RE = /\blet\s+/g
const MUTATION_RE = /\.\s*(push|pop|shift|unshift|splice|sort|reverse)\s*\(/g
const SIDE_EFFECT_RE = /\b(console|process|fs|fetch|http|writeFile|readFile)\b/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const COMMENT_RE = /\/\/.*$/gm
const PIPE_RE = /[.\s](map|filter|reduce|forEach|flatMap|find|some|every)\s*\(/g
const RETURN_RE = /\breturn\b/g
const ASYNC_RE = /\basync\s+/
const GENERIC_RE = /<\w+>/
const DEAD_CODE_RE = /\b(debugger|with)\s*[(;]/
const ANY_TYPE_RE = /:\s*any\b/

// ─── measureThermometer ─────────────────────────────────────────────────────

/**
 * Measure code activity/heat
 * @example
 * measureThermometer('function a() {} function b() {}') // { reading: 50, scale: 'mild', ... }
 */
export function measureThermometer(content: string): ThermometerMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      reading: 0, scale: 'frigid', isComfortable: false, hasHeatWave: false,
      hasColdSpell: true, hasFever: false, hasFrostbite: true,
      hasThermalEquilibrium: false, temperatureTrend: 'stable',
    }
  }

  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const returns = (content.match(RETURN_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const deadCode = (content.match(DEAD_CODE_RE) ?? []).length

  const activityRatio = (functions + returns + pipes + exports) / Math.max(loc, 1)
  let reading = Math.round(activityRatio * 400)
  reading = Math.max(0, Math.min(100, reading - deadCode * 15))

  let scale: TemperatureScale = 'frigid'
  if (reading >= 90) scale = 'scorching'
  else if (reading >= 75) scale = 'hot'
  else if (reading >= 60) scale = 'warm'
  else if (reading >= 40) scale = 'mild'
  else if (reading >= 25) scale = 'cool'
  else if (reading >= 10) scale = 'cold'

  const isComfortable = reading >= 30 && reading <= 70
  const hasHeatWave = reading >= 85
  const hasColdSpell = reading <= 10
  const hasFever = reading >= 80
  const hasFrostbite = deadCode > 0 && reading <= 15
  const hasThermalEquilibrium = reading >= 35 && reading <= 65

  let temperatureTrend: TempTrend = 'stable'
  if (reading >= 80) temperatureTrend = 'rising'
  else if (reading <= 20) temperatureTrend = 'falling'
  if (functions > 0 && pipes > functions * 2) temperatureTrend = 'volatile'

  return {
    reading, scale, isComfortable, hasHeatWave, hasColdSpell,
    hasFever, hasFrostbite, hasThermalEquilibrium, temperatureTrend,
  }
}

// ─── measureBarometer ───────────────────────────────────────────────────────

/**
 * Measure complexity pressure
 * @example
 * measureBarometer('if (x) { for (let i = 0; i < 10; i++) {} }') // { reading: 60, ... }
 */
export function measureBarometer(content: string): BarometerMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      reading: 0, trend: 'steady', isHighPressure: false, isLowPressure: true,
      hasPressureSystem: false, hasFront: false, hasIsobar: false,
      hasStormSystem: false, hasClearSkies: true, frontCount: 0,
    }
  }

  const ifs = (content.match(IF_RE) ?? []).length
  const fors = (content.match(FOR_RE) ?? []).length
  const whiles = (content.match(WHILE_RE) ?? []).length
  const switches = (content.match(SWITCH_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length

  const branching = ifs + fors + whiles + switches
  const branchRatio = functions > 0 ? branching / functions : branching > 0 ? 1 : 0

  let reading = Math.round(Math.min(branchRatio * 30, 60) + Math.min(branching * 2, 40))
  reading = Math.max(0, Math.min(100, reading))

  const isHighPressure = reading >= 70
  const isLowPressure = reading < 30
  const hasPressureSystem = functions > 0 && branching > 0
  const hasFront = switches > 0 || ifs > functions
  const hasIsobar = branching > 0 && functions > 0 && Math.abs(ifs - fors) <= 2
  const hasStormSystem = reading >= 80
  const hasClearSkies = reading <= 20

  let trend: PressureTrend = 'steady'
  if (reading >= 80) trend = 'rising-rapidly'
  else if (reading >= 60) trend = 'rising'
  else if (reading <= 15) trend = 'falling-rapidly'
  else if (reading <= 30) trend = 'falling'
  if (branching > 5 && switches > 0) trend = 'volatile'

  return {
    reading, trend, isHighPressure, isLowPressure,
    hasPressureSystem, hasFront, hasIsobar, hasStormSystem,
    hasClearSkies, frontCount: Math.max(0, ifs - Math.max(functions, 1)),
  }
}

// ─── measureHygrometer ──────────────────────────────────────────────────────

/**
 * Measure dependency moisture
 * @example
 * measureHygrometer('import { a, b, c } from "x"; import { d } from "y"') // { reading: 70, ... }
 */
export function measureHygrometer(content: string): HygrometerMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      reading: 0, comfort: 'arid', isComfortable: false, hasDewPoint: false,
      hasCondensation: false, hasFog: false, hasMold: false,
      hasDrought: true, hasFlashFlood: false, condensationCount: 0,
    }
  }

  const imports = (content.match(IMPORT_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length

  const importRatio = imports / Math.max(loc, 1)
  let reading = Math.round(importRatio * 500 + Math.min(sideEffects * 5, 20))
  reading = Math.max(0, Math.min(100, reading))

  let comfort: HumidityComfort = 'arid'
  if (reading >= 85) comfort = 'saturated'
  else if (reading >= 70) comfort = 'tropical'
  else if (reading >= 55) comfort = 'humid'
  else if (reading >= 35) comfort = 'comfortable'
  else if (reading >= 15) comfort = 'dry'

  const isComfortable = reading >= 25 && reading <= 55
  const hasDewPoint = imports > 0 && types > 0
  const hasCondensation = imports > 5
  const hasFog = imports > 10 || (imports > 3 && sideEffects > 3)
  const hasMold = sideEffects > 5
  const hasDrought = imports === 0 && functions > 0
  const hasFlashFlood = imports > 8

  return {
    reading, comfort, isComfortable, hasDewPoint, hasCondensation,
    hasFog, hasMold, hasDrought, hasFlashFlood,
    condensationCount: Math.max(0, imports - 3),
  }
}

// ─── measureAnemometer ──────────────────────────────────────────────────────

/**
 * Measure change velocity
 * @example
 * measureAnemometer('let x = 1; x = 2; x = 3; let y = 4; y = 5') // { reading: 60, ... }
 */
export function measureAnemometer(content: string): AnemometerMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      reading: 0, direction: 'calm', beaufortScale: 0, isCalm: true,
      hasBreeze: false, hasGusts: false, hasSustainedWinds: false,
      hasGaleForce: false, hasHurricane: false, hasJetStream: false, gustCount: 0,
    }
  }

  const lets = (content.match(LET_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length
  const mutations = (content.match(MUTATION_RE) ?? []).length
  const asyncs = (content.match(ASYNC_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length

  const changeDensity = (lets + mutations) / Math.max(loc, 1)
  let reading = Math.round(changeDensity * 300 + Math.min(asyncs * 5, 15) + Math.min(pipes * 2, 15))
  reading = Math.max(0, Math.min(100, reading))

  const isCalm = reading <= 15
  const hasBreeze = reading > 15 && reading <= 35
  const hasGusts = mutations > 3
  const hasSustainedWinds = lets > 3
  const hasGaleForce = reading >= 70
  const hasHurricane = reading >= 90
  const hasJetStream = pipes > 3 && functions > 0

  const beaufortScale = Math.min(12, Math.round(reading / 8.33))

  let direction: WindDirection = 'calm'
  if (reading >= 80) direction = 'variable'
  else if (reading >= 60) direction = 'NW'
  else if (reading >= 40) direction = 'W'
  else if (reading >= 25) direction = 'SW'
  else if (reading >= 15) direction = 'S'

  return {
    reading, direction, beaufortScale, isCalm, hasBreeze,
    hasGusts, hasSustainedWinds, hasGaleForce, hasHurricane,
    hasJetStream, gustCount: mutations,
  }
}

// ─── measureRainGauge ───────────────────────────────────────────────────────

/**
 * Measure error/input volume
 * @example
 * measureRainGauge('try { x() } catch(e) { console.error(e) }') // { reading: 30, ... }
 */
export function measureRainGauge(content: string): RainGaugeMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      reading: 0, type: 'clear', hasDrainage: false, hasFlooding: false,
      hasDrought: true, hasAcidRain: false, hasHail: false, hasSnow: false,
      hasRainbow: false, hasUmbrella: false, umbrellaCount: 0,
    }
  }

  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const ifs = (content.match(IF_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length

  const errorDensity = tryCatch / Math.max(functions, 1)
  const inputDensity = ifs / Math.max(functions, 1)
  let reading = Math.round((errorDensity + inputDensity) * 25 + Math.min(sideEffects * 2, 15))
  reading = Math.max(0, Math.min(100, reading))

  const hasDrainage = tryCatch > 0
  const hasFlooding = sideEffects > 5 && tryCatch === 0
  const hasDrought = tryCatch === 0 && ifs === 0
  const hasAcidRain = anyTypes > 0
  const hasHail = anyTypes > 2
  const hasSnow = tryCatch > 3
  const hasRainbow = jsdoc > 0 && tryCatch > 0
  const hasUmbrella = ifs > 0 && types > 0

  let type: PrecipType = 'clear'
  if (reading >= 80) type = 'monsoon'
  else if (reading >= 60) type = 'thunderstorm'
  else if (reading >= 40) type = 'heavy-rain'
  else if (reading >= 25) type = 'rain'
  else if (reading >= 10) type = 'drizzle'

  return {
    reading, type, hasDrainage, hasFlooding, hasDrought,
    hasAcidRain, hasHail, hasSnow, hasRainbow, hasUmbrella,
    umbrellaCount: tryCatch + (types > 0 ? 1 : 0),
  }
}

// ─── measureVisibility ──────────────────────────────────────────────────────

/**
 * Measure code clarity
 * @example
 * measureVisibility('export function add(a: number, b: number): number { return a + b }') // { reading: 80, ... }
 */
export function measureVisibility(content: string): VisibilityMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      reading: 0, condition: 'zero', hasClearView: false, hasHaze: false,
      hasFog: false, hasSmog: false, hasWhiteout: false, hasMirage: false,
      hasAurora: false, hazeCount: 0,
    }
  }

  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const comments = (content.match(COMMENT_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const deadCode = (content.match(DEAD_CODE_RE) ?? []).length
  const lets = (content.match(LET_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length

  let reading = 30
  if (jsdoc > 0) reading += 20
  if (types > 0) reading += 15
  if (interfaces > 0) reading += 10
  if (exports > 0) reading += 10
  reading += Math.min(comments, 10)
  if (anyTypes > 0) reading -= 15
  if (deadCode > 0) reading -= 20
  if (lets > consts && lets > 2) reading -= 10
  reading = Math.max(0, Math.min(100, reading))

  let condition: VisCondition = 'zero'
  if (reading >= 90) condition = 'unlimited'
  else if (reading >= 75) condition = 'excellent'
  else if (reading >= 55) condition = 'good'
  else if (reading >= 35) condition = 'moderate'
  else if (reading >= 15) condition = 'poor'

  const hasClearView = reading >= 80
  const hasHaze = reading >= 40 && reading < 70
  const hasFog = reading < 30 && loc > 5
  const hasSmog = anyTypes > 0 || deadCode > 0
  const hasWhiteout = reading <= 10 && loc > 10
  const hasMirage = anyTypes > 0 && jsdoc > 0
  const hasAurora = jsdoc > 0 && types > 0 && interfaces > 0

  return {
    reading, condition, hasClearView, hasHaze, hasFog, hasSmog,
    hasWhiteout, hasMirage, hasAurora, hazeCount: Math.max(0, Math.round((100 - reading) / 20)),
  }
}

// ─── analyzeWeatherReading ──────────────────────────────────────────────────

/**
 * Analyze a single file as a weather reading
 * @example
 * analyzeWeatherReading('const x = 1', 'test.ts') // { qualityScore: 40, condition: 'overcast', ... }
 */
export function analyzeWeatherReading(content: string, filePath: string): WeatherReading {
  const thermometer = measureThermometer(content)
  const barometer = measureBarometer(content)
  const hygrometer = measureHygrometer(content)
  const anemometer = measureAnemometer(content)
  const rainGauge = measureRainGauge(content)
  const visibility = measureVisibility(content)

  const temperature = thermometer.reading
  const pressure = barometer.reading
  const humidity = hygrometer.reading
  const windSpeed = anemometer.reading
  const precipitation = rainGauge.reading
  const visibilityScore = visibility.reading

  const qualityScore = Math.round(
    (temperature + (100 - pressure) + (100 - humidity) + (100 - windSpeed) + (100 - precipitation) + visibilityScore) / 6,
  )

  let condition: ReadingCondition = 'natural-disaster'
  if (qualityScore >= 90) condition = 'perfect-day'
  else if (qualityScore >= 75) condition = 'fair-weather'
  else if (qualityScore >= 60) condition = 'partly-cloudy'
  else if (qualityScore >= 40) condition = 'overcast'
  else if (qualityScore >= 20) condition = 'stormy'

  return {
    file: filePath,
    temperature, pressure, humidity, windSpeed, precipitation,
    visibility: visibilityScore,
    thermometer, barometer, hygrometer, anemometer, rainGauge,
    visibilityMeasure: visibility,
    condition, qualityScore,
  }
}

// ─── classifyZoneType ───────────────────────────────────────────────────────

/**
 * Classify climate zone type based on readings
 * @example
 * classifyZoneType(readings) // 'mediterranean'
 */
export function classifyZoneType(readings: WeatherReading[]): ZoneType {
  if (readings.length === 0) return 'disaster-zone'

  const avgQuality = readings.reduce((s, x) => s + x.qualityScore, 0) / readings.length
  const perfectCount = readings.filter((r) => r.condition === 'perfect-day').length

  if (avgQuality >= 80 && perfectCount >= 2) return 'tropical-paradise'
  if (avgQuality >= 65) return 'mediterranean'
  if (avgQuality >= 50) return 'temperate'
  if (avgQuality >= 30) return 'continental'
  if (avgQuality >= 15) return 'arctic'
  return 'disaster-zone'
}

// ─── classifyMeteorologistGrade ─────────────────────────────────────────────

/**
 * Classify meteorologist grade based on average climate
 * @example
 * classifyMeteorologistGrade(85) // 'senior-forecaster'
 */
export function classifyMeteorologistGrade(avgClimate: number): MeteorologistGrade {
  if (avgClimate >= 90) return 'chief-meteorologist'
  if (avgClimate >= 75) return 'senior-forecaster'
  if (avgClimate >= 55) return 'meteorologist'
  if (avgClimate >= 35) return 'weather-observer'
  if (avgClimate >= 15) return 'amateur'
  return 'groundhog'
}

// ─── classifyZoneCondition ──────────────────────────────────────────────────

function classifyZoneCondition(avgClimate: number): ZoneCondition {
  if (avgClimate >= 85) return 'resort-weather'
  if (avgClimate >= 65) return 'pleasant'
  if (avgClimate >= 45) return 'seasonal'
  if (avgClimate >= 25) return 'challenging'
  if (avgClimate >= 10) return 'harsh'
  return 'apocalyptic'
}

// ─── analyzeClimateZone ─────────────────────────────────────────────────────

/**
 * Analyze a directory as a climate zone
 * @example
 * analyzeClimateZone(readings, 'src/') // { zoneType: 'temperate', ... }
 */
export function analyzeClimateZone(readings: WeatherReading[], dirPath: string): ClimateZone {
  if (readings.length === 0) {
    return {
      directory: dirPath,
      readings: [],
      avgTemperature: 0, avgPressure: 0, avgVisibility: 0,
      perfectDayCount: 0, stormyCount: 0, comfortableCount: 0,
      clearViewCount: 0,
      zoneType: 'disaster-zone', condition: 'apocalyptic',
    }
  }

  const avgTemperature = Math.round(readings.reduce((s, x) => s + x.temperature, 0) / readings.length)
  const avgPressure = Math.round(readings.reduce((s, x) => s + x.pressure, 0) / readings.length)
  const avgVisibility = Math.round(readings.reduce((s, x) => s + x.visibility, 0) / readings.length)
  const avgQuality = Math.round(readings.reduce((s, x) => s + x.qualityScore, 0) / readings.length)

  return {
    directory: dirPath,
    readings,
    avgTemperature, avgPressure, avgVisibility,
    perfectDayCount: readings.filter((r) => r.condition === 'perfect-day').length,
    stormyCount: readings.filter((r) => r.condition === 'stormy' || r.condition === 'natural-disaster').length,
    comfortableCount: readings.filter((r) => r.thermometer.isComfortable).length,
    clearViewCount: readings.filter((r) => r.visibilityMeasure.hasClearView).length,
    zoneType: classifyZoneType(readings),
    condition: classifyZoneCondition(avgQuality),
  }
}

// ─── generateRecommendations ────────────────────────────────────────────────

/**
 * Generate improvement recommendations
 * @example
 * generateRecommendations(readings, zones, bureau, stats) // ['Reduce complexity pressure...']
 */
export function generateRecommendations(
  readings: WeatherReading[],
  zones: ClimateZone[],
  _bureau: { avgTemperature: number; avgPressure: number; avgVisibility: number; isCalmClimate: boolean; overallClimate: number },
  stats: WeatherStationStats,
): string[] {
  const recs: string[] = []

  if (stats.hasHeatWaveCount > stats.totalFiles * 0.5) {
    recs.push('Heat wave warning — too many files are excessively active, consider splitting responsibilities')
  }
  if (stats.isHighPressureCount > stats.totalFiles * 0.4) {
    recs.push('High pressure system — reduce branching complexity across the codebase')
  }
  if (stats.hasFogCount > stats.totalFiles * 0.3) {
    recs.push('Dense fog — reduce dependency count to improve code clarity')
  }
  if (stats.hasCondensationCount > stats.totalFiles * 0.3) {
    recs.push('Heavy condensation — too many imports accumulating, refactor module boundaries')
  }
  if (stats.hasGaleForceCount > stats.totalFiles * 0.3) {
    recs.push('Gale force winds detected — reduce let bindings and mutations for stability')
  }
  if (stats.hasFloodingCount > stats.totalFiles * 0.2) {
    recs.push('Flash flood risk — add error handling (try/catch) to prevent overflow')
  }
  if (stats.naturalDisasterCount > stats.totalFiles * 0.3) {
    recs.push('Natural disaster zone — major refactoring needed to stabilize conditions')
  }

  const worst = readings.length > 0
    ? readings.reduce((w, r) => r.qualityScore < w.qualityScore ? r : w, readings[0])
    : null
  if (worst && worst.qualityScore < 20) {
    recs.push(`Severe conditions in "${worst.file}" (score: ${worst.qualityScore}) — immediate attention needed`)
  }

  if (zones.some((z) => z.condition === 'apocalyptic')) {
    recs.push('Apocalyptic zones detected — consider architectural emergency measures')
  }

  return recs.length > 0 ? recs : ['Weather conditions are favorable — maintain current practices']
}

// ─── buildWeatherStationResult ──────────────────────────────────────────────

/**
 * Build the complete weather station result
 * @example
 * buildWeatherStationResult(['a.ts'], ['const x = 1'], {}) // { readings: [...], ... }
 */
export function buildWeatherStationResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): WeatherStationResult {
  const readings: WeatherReading[] = []
  for (let i = 0; i < files.length; i++) {
    readings.push(analyzeWeatherReading(contents[i] ?? '', files[i] ?? ''))
  }

  const dirMap = new Map<string, WeatherReading[]>()
  for (const reading of readings) {
    const dir = reading.file.includes('/') ? reading.file.substring(0, reading.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(reading)
    } else {
      dirMap.set(dir, [reading])
    }
  }

  const zones: ClimateZone[] = []
  for (const [dir, dirReadings] of dirMap) {
    zones.push(analyzeClimateZone(dirReadings, dir))
  }

  const avgTemperature = readings.length > 0 ? Math.round(readings.reduce((s, x) => s + x.temperature, 0) / readings.length) : 0
  const avgPressure = readings.length > 0 ? Math.round(readings.reduce((s, x) => s + x.pressure, 0) / readings.length) : 0
  const avgVisibility = readings.length > 0 ? Math.round(readings.reduce((s, x) => s + x.visibility, 0) / readings.length) : 0
  const overallClimate = readings.length > 0 ? Math.round(readings.reduce((s, x) => s + x.qualityScore, 0) / readings.length) : 0

  const bureau = {
    avgTemperature,
    avgPressure,
    avgVisibility,
    isCalmClimate: overallClimate >= 60,
    overallClimate,
  }

  const conditions = readings.map((r) => r.condition)
  const bestConditions = readings.length > 0
    ? readings.reduce((b, r) => r.qualityScore > b.qualityScore ? r : b, readings[0])
    : null
  const clearestSkies = readings.length > 0
    ? readings.reduce((b, r) => r.visibilityMeasure.reading > b.visibilityMeasure.reading ? r : b, readings[0])
    : null
  const mostStable = readings.length > 0
    ? readings.reduce((b, r) => r.barometer.reading < b.barometer.reading ? r : b, readings[0])
    : null
  const bestDrainage = readings.length > 0
    ? readings.reduce((b, r) => r.rainGauge.hasDrainage && !b.rainGauge.hasDrainage ? r : b, readings[0])
    : null
  const calmestWinds = readings.length > 0
    ? readings.reduce((b, r) => r.anemometer.reading < b.anemometer.reading ? r : b, readings[0])
    : null

  const stats: WeatherStationStats = {
    totalFiles: readings.length,
    totalZones: zones.length,
    avgTemperature,
    avgPressure,
    avgHumidity: readings.length > 0 ? Math.round(readings.reduce((s, x) => s + x.humidity, 0) / readings.length) : 0,
    avgWindSpeed: readings.length > 0 ? Math.round(readings.reduce((s, x) => s + x.windSpeed, 0) / readings.length) : 0,
    avgPrecipitation: readings.length > 0 ? Math.round(readings.reduce((s, x) => s + x.precipitation, 0) / readings.length) : 0,
    avgVisibility,
    perfectDayCount: conditions.filter((c) => c === 'perfect-day').length,
    fairWeatherCount: conditions.filter((c) => c === 'fair-weather').length,
    partlyCloudyCount: conditions.filter((c) => c === 'partly-cloudy').length,
    overcastCount: conditions.filter((c) => c === 'overcast').length,
    stormyCount: conditions.filter((c) => c === 'stormy').length,
    naturalDisasterCount: conditions.filter((c) => c === 'natural-disaster').length,
    isComfortableCount: readings.filter((r) => r.thermometer.isComfortable).length,
    hasHeatWaveCount: readings.filter((r) => r.thermometer.hasHeatWave).length,
    isHighPressureCount: readings.filter((r) => r.barometer.isHighPressure).length,
    hasStormSystemCount: readings.filter((r) => r.barometer.hasStormSystem).length,
    hasFogCount: readings.filter((r) => r.hygrometer.hasFog).length,
    hasCondensationCount: readings.filter((r) => r.hygrometer.hasCondensation).length,
    isCalmCount: readings.filter((r) => r.anemometer.isCalm).length,
    hasGaleForceCount: readings.filter((r) => r.anemometer.hasGaleForce).length,
    hasDrainageCount: readings.filter((r) => r.rainGauge.hasDrainage).length,
    hasFloodingCount: readings.filter((r) => r.rainGauge.hasFlooding).length,
    hasUmbrellaCount: readings.filter((r) => r.rainGauge.hasUmbrella).length,
    hasClearViewCount: readings.filter((r) => r.visibilityMeasure.hasClearView).length,
    overallClimate,
    meteorologistGrade: classifyMeteorologistGrade(overallClimate),
    bestConditions: bestConditions?.file ?? '',
    clearestSkies: clearestSkies?.file ?? '',
    mostStable: mostStable?.file ?? '',
    bestDrainage: bestDrainage?.file ?? '',
    calmestWinds: calmestWinds?.file ?? '',
  }

  const recommendations = generateRecommendations(readings, zones, bureau, stats)

  return { readings, zones, bureau, stats, recommendations }
}
