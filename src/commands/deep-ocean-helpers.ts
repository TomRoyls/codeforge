// ─── Interfaces ──────────────────────────────────────────

export interface ZoneMeasure {
  current: 'sunlit-zone' | 'twilight-zone' | 'midnight-zone' | 'abyssal-zone' | 'hadal-zone' | 'trench'
  depth: number
  hasPhoticZone: boolean
  hasAphoticZone: boolean
  hasThermocline: boolean
  hasMixedLayer: boolean
  layerCount: number
}

export interface SurfaceMeasure {
  clarity: number
  hasWaves: boolean
  hasWhitecaps: boolean
  hasCalmWater: boolean
  hasRiptide: boolean
  clarityScore: number
}

export interface PressureMeasure {
  level: number
  hasCrushingPressure: boolean
  hasModeratePressure: boolean
  hasLowPressure: boolean
  hasPressureVents: boolean
  ventCount: number
  hasDecompression: boolean
}

export interface BioluminescenceMeasure {
  score: number
  hasGlowingCode: boolean
  hasDarkCode: boolean
  hasFlashingCode: boolean
  hasAnglerFish: boolean
  hasDeepStings: boolean
  glowCount: number
  stingCount: number
}

export interface CurrentMeasure {
  strength: number
  direction: 'upwelling' | 'downwelling' | 'thermohaline' | 'surface' | 'turbulent' | 'stagnant'
  hasGulfStream: boolean
  hasWhirlpool: boolean
  hasUndertow: boolean
  hasRipCurrent: boolean
  isNavigable: boolean
  whirlpoolCount: number
}

export interface ThermalMeasure {
  temperature: number
  hasHotVents: boolean
  hasColdSeeps: boolean
  hasThermalGradient: boolean
  isIsothermal: boolean
  ventCount: number
  seepCount: number
}

export interface LifeMeasure {
  diversity: number
  hasPlankton: boolean
  hasWhales: boolean
  hasSquid: boolean
  hasCoral: boolean
  hasSharks: boolean
  hasJellyfish: boolean
  planktonCount: number
  whaleCount: number
  sharkCount: number
}

export interface AbyssalMeasure {
  stability: number
  hasSeafloor: boolean
  hasMountains: boolean
  hasTrenches: boolean
  hasPlains: boolean
  hasVolcanicActivity: boolean
  mountainCount: number
  trenchCount: number
}

export interface OceanDepth {
  file: string
  depth: number
  pressure: number
  bioluminescence: number
  currentStrength: number
  temperature: number
  abyssalStability: number
  zone: ZoneMeasure
  surface: SurfaceMeasure
  pressureMeasure: PressureMeasure
  bioluminescenceMeasure: BioluminescenceMeasure
  currentMeasure: CurrentMeasure
  thermal: ThermalMeasure
  life: LifeMeasure
  abyssal: AbyssalMeasure
  condition: 'crystal-clear-waters' | 'clear-ocean' | 'coastal-waters' | 'murky-depths' | 'black-smoker' | 'dead-sea'
  qualityScore: number
}

export interface OceanBasin {
  directory: string
  depths: OceanDepth[]
  avgDepth: number
  avgPressure: number
  avgCurrentStrength: number
  clearWatersCount: number
  deadSeaCount: number
  surfaceOnlyCount: number
  deepDiveCount: number
  basinType: 'pacific-deep' | 'atlantic-mid' | 'indian-warm' | 'arctic-cold' | 'mediterranean' | 'dead-sea'
  condition: 'pristine-ocean' | 'healthy-sea' | 'coastal-waters' | 'polluted-bay' | 'stagnant-pool' | 'toxic-dump'
}

export interface PlanetMeasure {
  avgDepth: number
  avgPressure: number
  avgCurrentStrength: number
  isHealthy: boolean
  overallDepth: number
}

export interface DeepOceanStats {
  totalFiles: number
  totalBasins: number
  avgDepth: number
  avgPressure: number
  avgBioluminescence: number
  avgCurrentStrength: number
  avgTemperature: number
  avgAbyssalStability: number
  crystalClearCount: number
  clearOceanCount: number
  coastalWatersCount: number
  murkyDepthsCount: number
  blackSmokerCount: number
  deadSeaCount: number
  sunlitZoneCount: number
  twilightZoneCount: number
  midnightZoneCount: number
  abyssalZoneCount: number
  hadalZoneCount: number
  hasWhirlpoolCount: number
  hasUndertowCount: number
  hasAnglerFishCount: number
  hasSharksCount: number
  hasHotVentsCount: number
  hasThermoclineCount: number
  hasSeafloorCount: number
  hasTrenchesCount: number
  navigableCount: number
  overallDepth: number
  oceanographerGrade: 'chief-oceanographer' | 'oceanographer' | 'marine-biologist' | 'diver' | 'swimmer' | 'landlubber'
  clearestWaters: string
  deepestDive: string
  strongestCurrent: string
  mostStable: string
  mostDangerous: string
}

export interface DeepOceanResult {
  depths: OceanDepth[]
  basins: OceanBasin[]
  planet: PlanetMeasure
  stats: DeepOceanStats
  recommendations: string[]
}

// ─── Utility helpers ────────────────────────────────────

export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

export function countInterfaces(content: string): number {
  const m = content.match(/\binterface\s+\w+/g)
  return m ? m.length : 0
}

export function countEnums(content: string): number {
  const m = content.match(/\benum\s+\w+/g)
  return m ? m.length : 0
}

export function countTypes(content: string): number {
  const m = content.match(/\btype\s+\w+\s*=/g)
  return m ? m.length : 0
}

export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

export function countComments(content: string): number {
  const line = (content.match(/\/\/.*/g) || []).length
  const block = (content.match(/\/\*[\s\S]*?\*\//g) || []).length
  return line + block
}

export function countErrorHandling(content: string): number {
  const m = content.match(/\b(catch|finally|throw)\b/g)
  return m ? m.length : 0
}

export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:number|string|boolean|void|any|unknown|never|object)\b/g)
  return m ? m.length : 0
}

export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b/gi)
  return m ? m.length : 0
}

export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

export function countBranches(content: string): number {
  const ifs = (content.match(/\bif\b/g) || []).length
  const switches = (content.match(/\bswitch\b/g) || []).length
  const ternaries = (content.match(/\?[^:]*:/g) || []).length
  return ifs + switches + ternaries
}

export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

export function countReturnTypes(content: string): number {
  const m = content.match(/\)\s*:\s*\w+/g)
  return m ? m.length : 0
}

export function countNestingDepth(content: string): number {
  let maxDepth = 0
  let currentDepth = 0
  for (const ch of content) {
    if (ch === '{' || ch === '(' || ch === '[') {
      currentDepth++
      if (currentDepth > maxDepth) maxDepth = currentDepth
    } else if (ch === '}' || ch === ')' || ch === ']') {
      currentDepth = Math.max(0, currentDepth - 1)
    }
  }
  return maxDepth
}

export function countAsync(content: string): number {
  const m = content.match(/\basync\b/g)
  return m ? m.length : 0
}

export function countAwait(content: string): number {
  const m = content.match(/\bawait\b/g)
  return m ? m.length : 0
}

export function countSideEffects(content: string): number {
  const writes = (content.match(/\bprocess\.env\b/g) || []).length
  const fsOps = (content.match(/\bfs\.\w+/g) || []).length
  const domOps = (content.match(/\bdocument\.\w+/g) || []).length
  return writes + fsOps + domOps
}

// ─── Zone Measurement ───────────────────────────────────

/**
 * Measure code depth zone
 * @example
 * measureZone(codeString) // { current, depth, hasPhoticZone, ... }
 */
export function measureZone(content: string): ZoneMeasure {
  const loc = countLoc(content)
  const nesting = countNestingDepth(content)
  const jsdoc = countJSDoc(content)
  const types = countTypeAnnotations(content)

  const depth = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (nesting * 8) +
    (countBranches(content) * 3) +
    (countFunctions(content) * 2),
  )))

  const hasPhoticZone = jsdoc > 0 && types > 0
  const hasAphoticZone = jsdoc === 0 && loc > 10
  const hasThermocline = nesting > 3 && jsdoc > 0
  const hasMixedLayer = nesting <= 2 && loc > 0
  const layerCount = [hasPhoticZone, hasAphoticZone, nesting > 2, types > 0].filter(Boolean).length

  let current: ZoneMeasure['current'] = 'sunlit-zone'
  if (depth >= 80) current = 'trench'
  else if (depth >= 65) current = 'hadal-zone'
  else if (depth >= 50) current = 'abyssal-zone'
  else if (depth >= 30) current = 'midnight-zone'
  else if (depth >= 15) current = 'twilight-zone'

  return { current, depth, hasPhoticZone, hasAphoticZone, hasThermocline, hasMixedLayer, layerCount }
}

// ─── Surface Measurement ────────────────────────────────

/**
 * Measure surface code clarity
 * @example
 * measureSurface(codeString) // { clarity, hasWaves, hasCalmWater, ... }
 */
export function measureSurface(content: string): SurfaceMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)

  const clarity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 25 : 0) +
    (comments > 0 ? 15 : 0) +
    (types > 0 ? 20 : 0) +
    (exports > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0) +
    (loc < 50 ? 10 : 0),
  )))

  const hasWaves = countBranches(content) > 3
  const hasWhitecaps = countTodos(content) > 0 || countConsole(content) > 0
  const hasCalmWater = countBranches(content) <= 2 && countTodos(content) === 0 && loc > 0
  const hasRiptide = countAsync(content) > 0 && countErrorHandling(content) === 0
  const clarityScore = clarity

  return { clarity, hasWaves, hasWhitecaps, hasCalmWater, hasRiptide, clarityScore }
}

// ─── Pressure Measurement ───────────────────────────────

/**
 * Measure code complexity pressure
 * @example
 * measurePressure(content) // { level, hasCrushingPressure, ... }
 */
export function measurePressure(content: string): PressureMeasure {
  const loc = countLoc(content)
  const branches = countBranches(content)
  const nesting = countNestingDepth(content)
  const functions = countFunctions(content)

  const level = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (branches * 8) +
    (nesting * 5) +
    (functions > 5 ? 10 : 0) +
    (loc > 100 ? 10 : 0),
  )))

  const hasCrushingPressure = level >= 70
  const hasModeratePressure = level >= 30 && level < 70
  const hasLowPressure = level < 30 && loc > 0
  const ventCount = countInterfaces(content) + countClasses(content)
  const hasPressureVents = ventCount > 0 && level > 30
  const hasDecompression = countErrorHandling(content) > 0

  return { level, hasCrushingPressure, hasModeratePressure, hasLowPressure, hasPressureVents, ventCount, hasDecompression }
}

// ─── Bioluminescence Measurement ────────────────────────

/**
 * Measure hidden behavior revelation
 * @example
 * measureBioluminescence(content) // { score, hasGlowingCode, ... }
 */
export function measureBioluminescence(content: string): BioluminescenceMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const types = countTypeAnnotations(content)
  const returns = countReturnTypes(content)

  const score = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 25 : 0) +
    (types > 0 ? 25 : 0) +
    (returns > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0) +
    (countComments(content) > 0 ? 10 : 0) +
    (countExports(content) > 0 ? 10 : 0),
  )))

  const hasGlowingCode = jsdoc > 0 && types > 0
  const hasDarkCode = jsdoc === 0 && types === 0 && loc > 0
  const hasFlashingCode = countAsync(content) > 0 || countAwait(content) > 0
  const glowCount = jsdoc + returns
  const stingCount = countSideEffects(content) + countConsole(content)

  const hasAnglerFish = countDescriptiveNames(content) === 0 && countFunctions(content) > 0 && loc > 0
  const hasDeepStings = stingCount > 0

  return { score, hasGlowingCode, hasDarkCode, hasFlashingCode, hasAnglerFish, hasDeepStings, glowCount, stingCount }
}

// ─── Current Measurement ────────────────────────────────

/**
 * Measure data flow intensity
 * @example
 * measureCurrent(content) // { strength, direction, hasGulfStream, ... }
 */
export function measureCurrent(content: string): CurrentMeasure {
  const loc = countLoc(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)
  const interfaces = countInterfaces(content)

  const strength = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (imports > 0 ? 15 : 0) +
    (exports > 0 ? 15 : 0) +
    (functions > 0 ? 10 : 0) +
    (types > 0 ? 10 : 0) +
    (interfaces > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (countErrorHandling(content) > 0 ? 10 : 0) +
    (countReturnTypes(content) > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0),
  )))

  const hasGulfStream = imports > 0 && exports > 0 && functions > 0
  const hasWhirlpool = countImports(content) > 5 && countExports(content) === 0 && loc > 0
  const hasUndertow = countSideEffects(content) > 0 && exports === 0
  const hasRipCurrent = countAsync(content) > 0 && countErrorHandling(content) === 0
  const isNavigable = strength >= 50
  const whirlpoolCount = hasWhirlpool ? 1 : 0

  let direction: CurrentMeasure['direction'] = 'stagnant'
  if (imports > 0 && exports > 0 && Math.abs(imports - exports) <= 2) direction = 'thermohaline'
  else if (imports > exports) direction = 'downwelling'
  else if (exports > imports) direction = 'upwelling'
  else if (functions > 0 && imports === 0 && exports === 0) direction = 'turbulent'
  else if (imports === 0 && exports === 0 && loc > 0) direction = 'stagnant'
  else direction = 'surface'

  return { strength, direction, hasGulfStream, hasWhirlpool, hasUndertow, hasRipCurrent, isNavigable, whirlpoolCount }
}

// ─── Thermal Measurement ────────────────────────────────

/**
 * Measure activity level
 * @example
 * measureThermal(content) // { temperature, hasHotVents, ... }
 */
export function measureThermal(content: string): ThermalMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const branches = countBranches(content)
  const asyncs = countAsync(content)

  const temperature = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (functions * 8) +
    (branches * 5) +
    (asyncs * 10) +
    (countErrorHandling(content) * 5) +
    (countClasses(content) * 8),
  )))

  const hasHotVents = temperature >= 60
  const hasColdSeeps = temperature < 20 && loc > 0
  const hasThermalGradient = functions > 0 && branches > 0 && Math.abs(functions - branches) > 2
  const isIsothermal = functions <= 1 && branches <= 1 && loc > 0
  const ventCount = functions + countClasses(content)
  const seepCount = hasColdSeeps ? 1 : 0

  return { temperature, hasHotVents, hasColdSeeps, hasThermalGradient, isIsothermal, ventCount, seepCount }
}

// ─── Life Measurement ───────────────────────────────────

/**
 * Measure construct variety
 * @example
 * measureLife(content) // { diversity, hasPlankton, hasWhales, ... }
 */
export function measureLife(content: string): LifeMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const enums = countEnums(content)
  const types = countTypes(content)

  const palette: string[] = []
  if (functions > 0) palette.push('function')
  if (classes > 0) palette.push('class')
  if (interfaces > 0) palette.push('interface')
  if (enums > 0) palette.push('enum')
  if (types > 0) palette.push('type')
  if (countExports(content) > 0) palette.push('export')
  if (countImports(content) > 0) palette.push('import')

  const diversity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (palette.length * 12) +
    (functions > 0 ? 5 : 0) +
    (classes > 0 ? 5 : 0) +
    (interfaces > 0 ? 5 : 0),
  )))

  const hasPlankton = functions > 3 && classes === 0
  const hasWhales = classes > 0 && functions > 2
  const hasSquid = countNestingDepth(content) > 4
  const hasCoral = interfaces > 0 && functions > 0
  const hasSharks = countTodos(content) > 2 || countConsole(content) > 3
  const hasJellyfish = countAsync(content) > 0 && countAwait(content) > 0 && countErrorHandling(content) === 0

  const planktonCount = functions
  const whaleCount = classes
  const sharkCount = countTodos(content) + countConsole(content)

  return {
    diversity,
    hasPlankton,
    hasWhales,
    hasSquid,
    hasCoral,
    hasSharks,
    hasJellyfish,
    planktonCount,
    whaleCount,
    sharkCount,
  }
}

// ─── Abyssal Measurement ────────────────────────────────

/**
 * Measure deep code stability
 * @example
 * measureAbyssal(content) // { stability, hasSeafloor, ... }
 */
export function measureAbyssal(content: string): AbyssalMeasure {
  const loc = countLoc(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const interfaces = countInterfaces(content)
  const classes = countClasses(content)

  const stability = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0) +
    (countTodos(content) === 0 ? 10 : 0) +
    (classes > 0 ? 10 : 0) +
    (countExports(content) > 0 ? 5 : 0),
  )))

  const hasSeafloor = interfaces > 0 && types > 0
  const hasMountains = classes > 0 || (countFunctions(content) > 3 && loc > 0)
  const hasTrenches = countNestingDepth(content) > 4
  const hasPlains = countNestingDepth(content) <= 2 && loc > 0
  const hasVolcanicActivity = countTodos(content) > 0 || countDeprecated(content) > 0
  const mountainCount = classes + (countFunctions(content) > 3 ? 1 : 0)
  const trenchCount = hasTrenches ? 1 : 0

  return { stability, hasSeafloor, hasMountains, hasTrenches, hasPlains, hasVolcanicActivity, mountainCount, trenchCount }
}

// ─── Depth Analysis ─────────────────────────────────────

/**
 * Analyze a single file as ocean depth
 * @example
 * analyzeOceanDepth(content, filePath) // OceanDepth
 */
export function analyzeOceanDepth(content: string, filePath: string): OceanDepth {
  const zone = measureZone(content)
  const surface = measureSurface(content)
  const pressureMeasure = measurePressure(content)
  const bioluminescenceMeasure = measureBioluminescence(content)
  const currentMeasure = measureCurrent(content)
  const thermal = measureThermal(content)
  const life = measureLife(content)
  const abyssal = measureAbyssal(content)

  const depth = zone.depth
  const pressure = pressureMeasure.level
  const bioluminescence = bioluminescenceMeasure.score
  const currentStrength = currentMeasure.strength
  const temperature = thermal.temperature
  const abyssalStability = abyssal.stability

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (surface.clarity * 0.2) +
    (bioluminescence * 0.2) +
    (currentStrength * 0.15) +
    (abyssalStability * 0.15) +
    ((100 - pressure) * 0.15) +
    (life.diversity * 0.15),
  )))

  const condition = classifyDepthCondition(qualityScore, surface, pressureMeasure)

  return {
    file: filePath,
    depth,
    pressure,
    bioluminescence,
    currentStrength,
    temperature,
    abyssalStability,
    zone,
    surface,
    pressureMeasure,
    bioluminescenceMeasure,
    currentMeasure,
    thermal,
    life,
    abyssal,
    condition,
    qualityScore,
  }
}

/**
 * Classify depth condition
 * @example
 * classifyDepthCondition(90, surface, pressure) // 'crystal-clear-waters'
 */
export function classifyDepthCondition(
  score: number,
  surface: SurfaceMeasure,
  pressure: PressureMeasure,
): OceanDepth['condition'] {
  if (score >= 80 && surface.hasCalmWater) return 'crystal-clear-waters'
  if (score >= 65) return 'clear-ocean'
  if (score >= 45) return 'coastal-waters'
  if (score >= 25 && !pressure.hasCrushingPressure) return 'murky-depths'
  if (score >= 10) return 'black-smoker'
  return 'dead-sea'
}

// ─── Basin Analysis ─────────────────────────────────────

/**
 * Analyze a directory as ocean basin
 * @example
 * analyzeOceanBasin(depths, dirPath) // OceanBasin
 */
export function analyzeOceanBasin(depths: OceanDepth[], dirPath: string): OceanBasin {
  const count = depths.length
  if (count === 0) {
    return {
      directory: dirPath,
      depths: [],
      avgDepth: 0,
      avgPressure: 0,
      avgCurrentStrength: 0,
      clearWatersCount: 0,
      deadSeaCount: 0,
      surfaceOnlyCount: 0,
      deepDiveCount: 0,
      basinType: 'dead-sea',
      condition: 'toxic-dump',
    }
  }

  const avgDepth = Math.round(depths.reduce((s, d) => s + d.depth, 0) / count)
  const avgPressure = Math.round(depths.reduce((s, d) => s + d.pressure, 0) / count)
  const avgCurrentStrength = Math.round(depths.reduce((s, d) => s + d.currentStrength, 0) / count)

  const clearWatersCount = depths.filter(d => d.condition === 'crystal-clear-waters' || d.condition === 'clear-ocean').length
  const deadSeaCount = depths.filter(d => d.condition === 'dead-sea').length
  const surfaceOnlyCount = depths.filter(d => d.zone.current === 'sunlit-zone').length
  const deepDiveCount = depths.filter(d => d.zone.current === 'abyssal-zone' || d.zone.current === 'hadal-zone' || d.zone.current === 'trench').length

  const basinType = classifyBasinType(depths, avgDepth)
  const condition = classifyBasinCondition(avgDepth)

  return {
    directory: dirPath,
    depths,
    avgDepth,
    avgPressure,
    avgCurrentStrength,
    clearWatersCount,
    deadSeaCount,
    surfaceOnlyCount,
    deepDiveCount,
    basinType,
    condition,
  }
}

/**
 * Classify basin type
 * @example
 * classifyBasinType(depths, 60) // 'pacific-deep'
 */
export function classifyBasinType(depths: OceanDepth[], avgDepth: number): OceanBasin['basinType'] {
  if (depths.length === 0) return 'dead-sea'
  const clearRatio = depths.filter(d => d.condition === 'crystal-clear-waters' || d.condition === 'clear-ocean').length / depths.length

  if (clearRatio >= 0.5 && avgDepth <= 40) return 'pacific-deep'
  if (avgDepth >= 50) return 'atlantic-mid'
  if (avgDepth >= 30) return 'indian-warm'
  if (avgDepth >= 15) return 'mediterranean'
  if (avgDepth >= 5) return 'arctic-cold'
  return 'dead-sea'
}

/**
 * Classify basin condition
 * @example
 * classifyBasinCondition(70) // 'pristine-ocean'
 */
export function classifyBasinCondition(avgDepth: number): OceanBasin['condition'] {
  if (avgDepth >= 65) return 'pristine-ocean'
  if (avgDepth >= 50) return 'healthy-sea'
  if (avgDepth >= 35) return 'coastal-waters'
  if (avgDepth >= 20) return 'polluted-bay'
  if (avgDepth >= 10) return 'stagnant-pool'
  return 'toxic-dump'
}

// ─── Oceanographer Grade ────────────────────────────────

/**
 * Classify oceanographer grade
 * @example
 * classifyOceanographerGrade(90) // 'chief-oceanographer'
 */
export function classifyOceanographerGrade(avgDepth: number): DeepOceanStats['oceanographerGrade'] {
  if (avgDepth >= 80) return 'chief-oceanographer'
  if (avgDepth >= 65) return 'oceanographer'
  if (avgDepth >= 50) return 'marine-biologist'
  if (avgDepth >= 35) return 'diver'
  if (avgDepth >= 20) return 'swimmer'
  return 'landlubber'
}

// ─── Recommendations ────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(depths, basins, planet, stats) // ['Add JSDoc...']
 */
export function generateRecommendations(
  depths: OceanDepth[],
  _basins: OceanBasin[],
  _planet: PlanetMeasure,
  stats: DeepOceanStats,
): string[] {
  const recs: string[] = []

  if (stats.deadSeaCount > 0) {
    recs.push('Resuscitate dead sea files with documentation, types, and error handling')
  }
  if (stats.avgDepth < 30) {
    recs.push('Dive deeper with type annotations and return types for better depth')
  }
  if (stats.avgPressure > 60) {
    recs.push('Reduce pressure by extracting functions and adding error handling vents')
  }
  if (stats.hasAnglerFishCount > 0) {
    recs.push('Name functions descriptively to illuminate angler fish code')
  }
  if (stats.hasWhirlpoolCount > 0) {
    recs.push('Break circular dependencies to resolve data flow whirlpools')
  }
  if (stats.hasTrenchesCount > stats.totalFiles * 0.3) {
    recs.push('Reduce nesting depth to fill dangerous code trenches')
  }
  if (stats.murkyDepthsCount > stats.totalFiles * 0.3) {
    recs.push('Add JSDoc documentation to clear murky code depths')
  }

  if (recs.length === 0) {
    recs.push('Continue maintaining healthy ocean code depths')
  }

  return recs
}

// ─── Orchestrator ───────────────────────────────────────

/**
 * Build the full deep ocean result
 * @example
 * buildDeepOceanResult(files, contents, {}) // DeepOceanResult
 */
export function buildDeepOceanResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown> = {},
): DeepOceanResult {
  const depths: OceanDepth[] = files.map((file, i) =>
    analyzeOceanDepth(contents[i] ?? '', file),
  )

  const basinMap = new Map<string, OceanDepth[]>()
  for (const d of depths) {
    const dir = d.file.includes('/') ? d.file.substring(0, d.file.lastIndexOf('/')) : '.'
    const existing = basinMap.get(dir)
    if (existing) {
      existing.push(d)
    } else {
      basinMap.set(dir, [d])
    }
  }

  const basins: OceanBasin[] = Array.from(basinMap.entries()).map(([dir, bDepths]) =>
    analyzeOceanBasin(bDepths, dir),
  )

  const totalFiles = depths.length
  const avg = (fn: (d: OceanDepth) => number) =>
    totalFiles === 0 ? 0 : Math.round(depths.reduce((s, d) => s + fn(d), 0) / totalFiles)

  const planet: PlanetMeasure = {
    avgDepth: avg(d => d.depth),
    avgPressure: avg(d => d.pressure),
    avgCurrentStrength: avg(d => d.currentStrength),
    isHealthy: avg(d => d.qualityScore) >= 50,
    overallDepth: avg(d => d.qualityScore),
  }

  const overallDepth = planet.overallDepth

  const clearestWaters = depths.length > 0
    ? depths.reduce((best, d) => d.surface.clarity > best.surface.clarity ? d : best, depths[0]).file
    : ''
  const deepestDive = depths.length > 0
    ? depths.reduce((best, d) => d.depth > best.depth ? d : best, depths[0]).file
    : ''
  const strongestCurrent = depths.length > 0
    ? depths.reduce((best, d) => d.currentStrength > best.currentStrength ? d : best, depths[0]).file
    : ''
  const mostStable = depths.length > 0
    ? depths.reduce((best, d) => d.abyssalStability > best.abyssalStability ? d : best, depths[0]).file
    : ''
  const mostDangerous = depths.length > 0
    ? depths.reduce((best, d) => d.life.sharkCount > best.life.sharkCount ? d : best, depths[0]).file
    : ''

  const stats: DeepOceanStats = {
    totalFiles,
    totalBasins: basins.length,
    avgDepth: planet.avgDepth,
    avgPressure: planet.avgPressure,
    avgBioluminescence: avg(d => d.bioluminescence),
    avgCurrentStrength: planet.avgCurrentStrength,
    avgTemperature: avg(d => d.temperature),
    avgAbyssalStability: avg(d => d.abyssalStability),
    crystalClearCount: depths.filter(d => d.condition === 'crystal-clear-waters').length,
    clearOceanCount: depths.filter(d => d.condition === 'clear-ocean').length,
    coastalWatersCount: depths.filter(d => d.condition === 'coastal-waters').length,
    murkyDepthsCount: depths.filter(d => d.condition === 'murky-depths').length,
    blackSmokerCount: depths.filter(d => d.condition === 'black-smoker').length,
    deadSeaCount: depths.filter(d => d.condition === 'dead-sea').length,
    sunlitZoneCount: depths.filter(d => d.zone.current === 'sunlit-zone').length,
    twilightZoneCount: depths.filter(d => d.zone.current === 'twilight-zone').length,
    midnightZoneCount: depths.filter(d => d.zone.current === 'midnight-zone').length,
    abyssalZoneCount: depths.filter(d => d.zone.current === 'abyssal-zone').length,
    hadalZoneCount: depths.filter(d => d.zone.current === 'hadal-zone').length,
    hasWhirlpoolCount: depths.filter(d => d.currentMeasure.hasWhirlpool).length,
    hasUndertowCount: depths.filter(d => d.currentMeasure.hasUndertow).length,
    hasAnglerFishCount: depths.filter(d => d.bioluminescenceMeasure.hasAnglerFish).length,
    hasSharksCount: depths.filter(d => d.life.hasSharks).length,
    hasHotVentsCount: depths.filter(d => d.thermal.hasHotVents).length,
    hasThermoclineCount: depths.filter(d => d.zone.hasThermocline).length,
    hasSeafloorCount: depths.filter(d => d.abyssal.hasSeafloor).length,
    hasTrenchesCount: depths.filter(d => d.abyssal.hasTrenches).length,
    navigableCount: depths.filter(d => d.currentMeasure.isNavigable).length,
    overallDepth,
    oceanographerGrade: classifyOceanographerGrade(overallDepth),
    clearestWaters,
    deepestDive,
    strongestCurrent,
    mostStable,
    mostDangerous,
  }

  const recommendations = generateRecommendations(depths, basins, planet, stats)

  return { depths, basins, planet, stats, recommendations }
}

function countDeprecated(content: string): number {
  const m = content.match(/\bdeprecated\b|\@deprecated/gi)
  return m ? m.length : 0
}
