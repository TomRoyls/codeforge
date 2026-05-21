// ─── Interfaces ──────────────────────────────────────────

export interface GnomonMeasure {
  style: 'polar' | 'horizontal' | 'vertical' | 'armillary' | 'analemmatic' | 'broken'
  accuracy: number
  isAligned: boolean
  isMisaligned: boolean
  hasShadow: boolean
  shadowLength: number
  hasSharpEdge: boolean
  hasBluntEdge: boolean
}

export interface DialMeasure {
  calibration: number
  hasHourMarks: boolean
  hasMinuteMarks: boolean
  hasSeasonMarks: boolean
  hasCompassRose: boolean
  isProperlyCalibrated: boolean
  hasRomanNumerals: boolean
  markCount: number
}

export interface ShadowMeasure {
  tracking: number
  hasConsistentShadow: boolean
  hasWanderingShadow: boolean
  hasNoShadow: boolean
  hasLongShadow: boolean
  hasShortShadow: boolean
  isControllable: boolean
}

export interface HourSegment {
  lineCount: number
  complexity: number
  hasEntry: boolean
  hasProcessing: boolean
  hasCleanup: boolean
  hasComments: boolean
  isWellLit: boolean
}

export interface HourMeasure {
  morning: HourSegment
  afternoon: HourSegment
  hasGoldenHour: boolean
  hasBlueHour: boolean
  hasHighNoon: boolean
  hasMidnight: boolean
  peakHour: string
  quietHour: string
}

export interface WeatheringMeasure {
  resistance: number
  isPatina: boolean
  isErosion: boolean
  isCracked: boolean
  isMossCovered: boolean
  isPolished: boolean
  hasLichen: boolean
  patinaScore: number
  erosionScore: number
}

export interface SeasonMeasure {
  currentSeason: 'spring' | 'summer' | 'autumn' | 'winter' | 'perpetual' | 'unknown'
  hasEquinox: boolean
  hasSolstice: boolean
  isGrowing: boolean
  isDormant: boolean
  isDecaying: boolean
  isRenewing: boolean
}

export interface SundialMark {
  file: string
  gnomonAccuracy: number
  hourMarkingClarity: number
  shadowTracking: number
  dialCalibration: number
  weatheringResistance: number
  timeTellingAccuracy: number
  gnomon: GnomonMeasure
  dial: DialMeasure
  shadow: ShadowMeasure
  hour: HourMeasure
  weathering: WeatheringMeasure
  season: SeasonMeasure
  condition: 'precision-sundial' | 'garden-sundial' | 'rustic-dial' | 'weathered-stone' | 'cracked-dial' | 'broken-stick'
  qualityScore: number
}

export interface SundialGarden {
  directory: string
  marks: SundialMark[]
  avgGnomonAccuracy: number
  avgDialCalibration: number
  avgWeatheringResistance: number
  precisionCount: number
  brokenCount: number
  growingCount: number
  decayingCount: number
  gardenType: 'observatory-garden' | 'formal-garden' | 'cottage-garden' | 'rock-garden' | 'overgrown' | 'abandoned'
  condition: 'chronometer-garden' | 'sundial-garden' | 'time-garden' | 'clock-garden' | 'ruin-garden' | 'wilderness'
}

export interface ObservatoryMeasure {
  avgGnomonAccuracy: number
  avgDialCalibration: number
  avgWeatheringResistance: number
  isAccurate: boolean
  overallPrecision: number
}

export interface SundialFaceStats {
  totalFiles: number
  totalGardens: number
  avgGnomonAccuracy: number
  avgHourMarkingClarity: number
  avgShadowTracking: number
  avgDialCalibration: number
  avgWeatheringResistance: number
  avgTimeTellingAccuracy: number
  precisionSundialCount: number
  gardenSundialCount: number
  rusticDialCount: number
  weatheredStoneCount: number
  crackedDialCount: number
  brokenStickCount: number
  polarStyleCount: number
  horizontalStyleCount: number
  brokenStyleCount: number
  isAlignedCount: number
  hasGoldenHourCount: number
  hasHighNoonCount: number
  hasMidnightCount: number
  consistentShadowCount: number
  isPatinaCount: number
  isErosionCount: number
  isPolishedCount: number
  growingCount: number
  dormantCount: number
  decayingCount: number
  renewingCount: number
  perpetualCount: number
  overallPrecision: number
  chronometerGrade: 'master-chronometer' | 'chronometer' | 'horologist' | 'timekeeper' | 'novice' | 'time-blind'
  mostAccurate: string
  bestCalibrated: string
  mostRobust: string
  mostWeathered: string
  mostPredictable: string
}

export interface SundialFaceResult {
  marks: SundialMark[]
  gardens: SundialGarden[]
  observatory: ObservatoryMeasure
  stats: SundialFaceStats
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

export function countDefaults(content: string): number {
  const m = content.match(/\bdefault\b/g)
  return m ? m.length : 0
}

export function countDeprecated(content: string): number {
  const m = content.match(/\bdeprecated\b|\@deprecated/gi)
  return m ? m.length : 0
}

export function countAsync(content: string): number {
  const m = content.match(/\basync\b/g)
  return m ? m.length : 0
}

export function countAwait(content: string): number {
  const m = content.match(/\bawait\b/g)
  return m ? m.length : 0
}

export function countGenerics(content: string): number {
  const m = content.match(/<\w+>/g)
  return m ? m.length : 0
}

// ─── Gnomon Measurement ─────────────────────────────────

/**
 * Measure code correctness and precision
 * @example
 * measureGnomon(codeString) // { style, accuracy, isAligned, ... }
 */
export function measureGnomon(content: string): GnomonMeasure {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const functions = countFunctions(content)
  const returns = countReturnTypes(content)
  const jsdoc = countJSDoc(content)

  const accuracy = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 20 : 0) +
    (returns > 0 ? 15 : 0) +
    (jsdoc > 0 ? 15 : 0) +
    (functions > 0 ? 10 : 0) +
    (countExports(content) > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0),
  )))

  const isAligned = accuracy >= 60
  const isMisaligned = accuracy < 30 && loc > 0
  const hasShadow = functions > 0 || countClasses(content) > 0
  const shadowLength = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (countExports(content) * 15) +
    (countImports(content) * 10) +
    (functions * 5),
  )))

  const hasSharpEdge = types > 0 && returns > 0
  const hasBluntEdge = types === 0 && functions > 0

  let style: GnomonMeasure['style'] = 'broken'
  if (accuracy >= 70 && hasSharpEdge) style = 'polar'
  else if (accuracy >= 50 && hasShadow) style = 'horizontal'
  else if (accuracy >= 30) style = 'vertical'
  else if (countAsync(content) > 0) style = 'analemmatic'
  else if (countGenerics(content) > 0) style = 'armillary'

  return {
    style,
    accuracy,
    isAligned,
    isMisaligned,
    hasShadow,
    shadowLength,
    hasSharpEdge,
    hasBluntEdge,
  }
}

// ─── Dial Measurement ───────────────────────────────────

/**
 * Measure architectural alignment and code structure
 * @example
 * measureDial(codeString) // { calibration, hasHourMarks, ... }
 */
export function measureDial(content: string): DialMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const types = countTypeAnnotations(content)

  const calibration = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (functions > 0 ? 15 : 0) +
    (classes > 0 ? 15 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (imports > 0 ? 10 : 0) +
    (types > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (countErrorHandling(content) > 0 ? 10 : 0) +
    (loc < 100 ? 5 : 0),
  )))

  const hasHourMarks = functions > 0 || classes > 0
  const hasMinuteMarks = types > 0 && functions > 0
  const hasSeasonMarks = countEnums(content) > 0 || countTypes(content) > 0
  const hasCompassRose = imports > 0 && exports > 0
  const isProperlyCalibrated = calibration >= 60
  const hasRomanNumerals = countJSDoc(content) > 0 && exports > 0

  const markCount = functions + classes + interfaces + countEnums(content) + countTypes(content)

  return {
    calibration,
    hasHourMarks,
    hasMinuteMarks,
    hasSeasonMarks,
    hasCompassRose,
    isProperlyCalibrated,
    hasRomanNumerals,
    markCount,
  }
}

// ─── Shadow Measurement ─────────────────────────────────

/**
 * Measure change propagation and impact tracking
 * @example
 * measureShadow(codeString) // { tracking, hasConsistentShadow, ... }
 */
export function measureShadow(content: string): ShadowMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)

  const tracking = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 20 : 0) +
    (exports > 0 ? 20 : 0) +
    (countInterfaces(content) > 0 ? 15 : 0) +
    (imports > 0 ? 10 : 0) +
    (functions > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (countErrorHandling(content) > 0 ? 10 : 0) +
    (countReturnTypes(content) > 0 ? 5 : 0),
  )))

  const hasConsistentShadow = exports > 0 && types > 0
  const hasWanderingShadow = functions > 5 && exports === 0 && loc > 0
  const hasNoShadow = exports === 0 && imports === 0 && loc > 0
  const hasLongShadow = exports > 3 || imports > 5
  const hasShortShadow = exports <= 2 && imports <= 2 && loc > 0
  const isControllable = tracking >= 50

  return {
    tracking,
    hasConsistentShadow,
    hasWanderingShadow,
    hasNoShadow,
    hasLongShadow,
    hasShortShadow,
    isControllable,
  }
}

// ─── Hour Measurement ───────────────────────────────────

function analyzeSegment(lines: string[]): HourSegment {
  const lineCount = lines.length
  const content = lines.join('\n')
  const complexity = lineCount === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (countBranches(content) * 15) +
    (countFunctions(content) * 10) +
    (countClasses(content) * 10) +
    (countErrorHandling(content) * 5),
  )))

  const hasEntry = /^import\s|^\s*(const|let|var)\s/.test(content)
  const hasProcessing = /\bfunction\b|\bclass\b|=>/.test(content)
  const hasCleanup = /\breturn\b|\bthrow\b|\bcatch\b/.test(content)
  const hasComments = countComments(content) > 0
  const isWellLit = countJSDoc(content) > 0 || (countComments(content) > 0 && countTypeAnnotations(content) > 0)

  return { lineCount, complexity, hasEntry, hasProcessing, hasCleanup, hasComments, isWellLit }
}

/**
 * Measure code sections like hours on a sundial
 * @example
 * measureHour(codeString) // { morning, afternoon, hasGoldenHour, ... }
 */
export function measureHour(content: string): HourMeasure {
  const lines = content.split('\n')
  const mid = Math.ceil(lines.length / 2)
  const morning = analyzeSegment(lines.slice(0, mid))
  const afternoon = analyzeSegment(lines.slice(mid))

  const hasGoldenHour = morning.isWellLit && morning.complexity > 0
  const hasBlueHour = morning.hasEntry && afternoon.hasCleanup
  const hasHighNoon = Math.max(morning.complexity, afternoon.complexity) >= 50
  const hasMidnight = countAsync(content) > 0 || countAwait(content) > 0

  const peakHour = morning.complexity >= afternoon.complexity ? 'morning' : 'afternoon'
  const quietHour = morning.complexity <= afternoon.complexity ? 'morning' : 'afternoon'

  return {
    morning,
    afternoon,
    hasGoldenHour,
    hasBlueHour,
    hasHighNoon,
    hasMidnight,
    peakHour,
    quietHour,
  }
}

// ─── Weathering Measurement ─────────────────────────────

/**
 * Measure code aging and robustness
 * @example
 * measureWeathering(codeString) // { resistance, isPatina, isErosion, ... }
 */
export function measureWeathering(content: string): WeatheringMeasure {
  const loc = countLoc(content)
  const todos = countTodos(content)
  const deprecated = countDeprecated(content)
  const consoles = countConsole(content)
  const errors = countErrorHandling(content)
  const jsdoc = countJSDoc(content)
  const types = countTypeAnnotations(content)

  const resistance = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (jsdoc > 0 ? 15 : 0) +
    (todos === 0 ? 15 : 0) +
    (consoles === 0 ? 10 : 0) +
    (countInterfaces(content) > 0 ? 10 : 0) +
    (countExports(content) > 0 ? 10 : 0),
  )))

  const patinaScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (countDescriptiveNames(content) > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (todos === 0 ? 10 : 0) +
    (deprecated === 0 ? 10 : 0),
  )))

  const erosionScore = Math.min(100, Math.max(0, Math.round(
    (todos * 10) +
    (deprecated * 15) +
    (consoles * 5) +
    (countBranches(content) > 10 ? 10 : 0),
  )))

  const isPatina = patinaScore >= 60 && erosionScore <= 30
  const isErosion = erosionScore > 40
  const isCracked = todos > 0 || deprecated > 0
  const isMossCovered = consoles > 3
  const isPolished = resistance >= 70 && todos === 0 && deprecated === 0
  const hasLichen = todos > 0 && todos <= 2

  return {
    resistance,
    isPatina,
    isErosion,
    isCracked,
    isMossCovered,
    isPolished,
    hasLichen,
    patinaScore,
    erosionScore,
  }
}

// ─── Season Measurement ─────────────────────────────────

/**
 * Measure code lifecycle stage
 * @example
 * measureSeason(codeString) // { currentSeason, isGrowing, ... }
 */
export function measureSeason(content: string): SeasonMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const jsdoc = countJSDoc(content)
  const todos = countTodos(content)
  const types = countTypeAnnotations(content)

  const complexity = Math.min(100, Math.max(0,
    functions * 10 + classes * 15 + interfaces * 5 + countBranches(content) * 3,
  ))

  const hasEquinox = complexity >= 30 && complexity <= 70
  const hasSolstice = complexity > 70 || complexity < 10

  const isGrowing = jsdoc > 0 && todos === 0 && functions > 0
  const isDormant = todos === 0 && countConsole(content) === 0 && exports > 0 && loc > 0
  const isDecaying = todos > 2 || countDeprecated(content) > 0
  const isRenewing = todos > 0 && jsdoc > 0 && types > 0

  let currentSeason: SeasonMeasure['currentSeason'] = 'unknown'
  if (jsdoc > 0 && functions > 0 && exports > 0 && interfaces > 0) currentSeason = 'perpetual'
  else if (isGrowing) currentSeason = 'spring'
  else if (isDormant) currentSeason = 'summer'
  else if (isDecaying) currentSeason = 'autumn'
  else if (isRenewing) currentSeason = 'winter'

  return {
    currentSeason,
    hasEquinox,
    hasSolstice,
    isGrowing,
    isDormant,
    isDecaying,
    isRenewing,
  }
}

// ─── Mark Analysis ──────────────────────────────────────

/**
 * Analyze a single file as a sundial mark
 * @example
 * analyzeSundialMark(content, filePath) // SundialMark
 */
export function analyzeSundialMark(content: string, filePath: string): SundialMark {
  const gnomon = measureGnomon(content)
  const dial = measureDial(content)
  const shadow = measureShadow(content)
  const hour = measureHour(content)
  const weathering = measureWeathering(content)
  const season = measureSeason(content)

  const gnomonAccuracy = gnomon.accuracy
  const hourMarkingClarity = dial.hasRomanNumerals ? Math.min(100, dial.calibration + 10) : dial.calibration
  const shadowTracking = shadow.tracking
  const dialCalibration = dial.calibration
  const weatheringResistance = weathering.resistance
  const timeTellingAccuracy = Math.min(100, Math.max(0, Math.round(
    (gnomonAccuracy * 0.3) +
    (shadowTracking * 0.3) +
    (dialCalibration * 0.2) +
    (weatheringResistance * 0.2),
  )))

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (gnomonAccuracy * 0.2) +
    (hourMarkingClarity * 0.15) +
    (shadowTracking * 0.15) +
    (dialCalibration * 0.15) +
    (weatheringResistance * 0.2) +
    (timeTellingAccuracy * 0.15),
  )))

  const condition = classifyMarkCondition(qualityScore, gnomon, weathering)

  return {
    file: filePath,
    gnomonAccuracy,
    hourMarkingClarity,
    shadowTracking,
    dialCalibration,
    weatheringResistance,
    timeTellingAccuracy,
    gnomon,
    dial,
    shadow,
    hour,
    weathering,
    season,
    condition,
    qualityScore,
  }
}

/**
 * Classify mark condition
 * @example
 * classifyMarkCondition(90, gnomon, weathering) // 'precision-sundial'
 */
export function classifyMarkCondition(
  score: number,
  gnomon: GnomonMeasure,
  weathering: WeatheringMeasure,
): SundialMark['condition'] {
  if (score >= 80 && gnomon.isAligned && weathering.isPolished) return 'precision-sundial'
  if (score >= 65 && gnomon.isAligned) return 'garden-sundial'
  if (score >= 45) return 'rustic-dial'
  if (score >= 30 && !weathering.isErosion) return 'weathered-stone'
  if (score >= 15) return 'cracked-dial'
  return 'broken-stick'
}

// ─── Garden Analysis ────────────────────────────────────

/**
 * Analyze a directory as a sundial garden
 * @example
 * analyzeSundialGarden(marks, dirPath) // SundialGarden
 */
export function analyzeSundialGarden(marks: SundialMark[], dirPath: string): SundialGarden {
  const count = marks.length
  if (count === 0) {
    return {
      directory: dirPath,
      marks: [],
      avgGnomonAccuracy: 0,
      avgDialCalibration: 0,
      avgWeatheringResistance: 0,
      precisionCount: 0,
      brokenCount: 0,
      growingCount: 0,
      decayingCount: 0,
      gardenType: 'abandoned',
      condition: 'wilderness',
    }
  }

  const avgGnomonAccuracy = Math.round(marks.reduce((s, m) => s + m.gnomonAccuracy, 0) / count)
  const avgDialCalibration = Math.round(marks.reduce((s, m) => s + m.dialCalibration, 0) / count)
  const avgWeatheringResistance = Math.round(marks.reduce((s, m) => s + m.weatheringResistance, 0) / count)

  const precisionCount = marks.filter(m => m.condition === 'precision-sundial').length
  const brokenCount = marks.filter(m => m.condition === 'broken-stick').length
  const growingCount = marks.filter(m => m.season.isGrowing).length
  const decayingCount = marks.filter(m => m.season.isDecaying).length

  const gardenType = classifyGardenType(marks, avgGnomonAccuracy)
  const condition = classifyGardenCondition(avgGnomonAccuracy)

  return {
    directory: dirPath,
    marks,
    avgGnomonAccuracy,
    avgDialCalibration,
    avgWeatheringResistance,
    precisionCount,
    brokenCount,
    growingCount,
    decayingCount,
    gardenType,
    condition,
  }
}

/**
 * Classify garden type
 * @example
 * classifyGardenType(marks, 80) // 'observatory-garden'
 */
export function classifyGardenType(marks: SundialMark[], avgAccuracy: number): SundialGarden['gardenType'] {
  if (marks.length === 0) return 'abandoned'
  const precisionRatio = marks.filter(m => m.condition === 'precision-sundial').length / marks.length
  const allDecent = marks.every(m => m.qualityScore >= 40)

  if (precisionRatio >= 0.5 && avgAccuracy >= 70) return 'observatory-garden'
  if (allDecent && avgAccuracy >= 55) return 'formal-garden'
  if (avgAccuracy >= 40) return 'cottage-garden'
  if (avgAccuracy >= 25) return 'rock-garden'
  if (avgAccuracy >= 15) return 'overgrown'
  return 'abandoned'
}

/**
 * Classify garden condition
 * @example
 * classifyGardenCondition(80) // 'chronometer-garden'
 */
export function classifyGardenCondition(avgAccuracy: number): SundialGarden['condition'] {
  if (avgAccuracy >= 75) return 'chronometer-garden'
  if (avgAccuracy >= 60) return 'sundial-garden'
  if (avgAccuracy >= 45) return 'time-garden'
  if (avgAccuracy >= 30) return 'clock-garden'
  if (avgAccuracy >= 15) return 'ruin-garden'
  return 'wilderness'
}

// ─── Chronometer Grade ──────────────────────────────────

/**
 * Classify chronometer grade from precision
 * @example
 * classifyChronometerGrade(90) // 'master-chronometer'
 */
export function classifyChronometerGrade(avgPrecision: number): SundialFaceStats['chronometerGrade'] {
  if (avgPrecision >= 80) return 'master-chronometer'
  if (avgPrecision >= 65) return 'chronometer'
  if (avgPrecision >= 50) return 'horologist'
  if (avgPrecision >= 35) return 'timekeeper'
  if (avgPrecision >= 20) return 'novice'
  return 'time-blind'
}

// ─── Recommendations ────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(marks, gardens, observatory, stats) // ['Add type annotations...']
 */
export function generateRecommendations(
  marks: SundialMark[],
  _gardens: SundialGarden[],
  _observatory: ObservatoryMeasure,
  stats: SundialFaceStats,
): string[] {
  const recs: string[] = []

  if (stats.brokenStickCount > 0) {
    recs.push('Repair broken sundials by adding type annotations and error handling')
  }
  if (stats.avgGnomonAccuracy < 40) {
    recs.push('Improve gnomon accuracy with return types and JSDoc documentation')
  }
  if (stats.avgDialCalibration < 40) {
    recs.push('Calibrate dials with clear interfaces and structured exports')
  }
  if (stats.avgWeatheringResistance < 40) {
    recs.push('Strengthen weathering resistance by resolving TODOs and adding error handling')
  }
  if (stats.avgShadowTracking < 40) {
    recs.push('Improve shadow tracking with explicit type boundaries and exports')
  }
  if (stats.decayingCount > stats.totalFiles * 0.3) {
    recs.push('Address decaying code by resolving deprecation warnings and TODOs')
  }
  if (stats.crackedDialCount > stats.totalFiles * 0.3) {
    recs.push('Fix cracked dials to improve overall time-telling accuracy')
  }

  if (recs.length === 0) {
    recs.push('Continue maintaining high chronometric precision standards')
  }

  return recs
}

// ─── Orchestrator ───────────────────────────────────────

/**
 * Build the full sundial face result
 * @example
 * buildSundialFaceResult(files, contents, {}) // SundialFaceResult
 */
export function buildSundialFaceResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown> = {},
): SundialFaceResult {
  const marks: SundialMark[] = files.map((file, i) =>
    analyzeSundialMark(contents[i] ?? '', file),
  )

  const gardenMap = new Map<string, SundialMark[]>()
  for (const mark of marks) {
    const dir = mark.file.includes('/') ? mark.file.substring(0, mark.file.lastIndexOf('/')) : '.'
    const existing = gardenMap.get(dir)
    if (existing) {
      existing.push(mark)
    } else {
      gardenMap.set(dir, [mark])
    }
  }

  const gardens: SundialGarden[] = Array.from(gardenMap.entries()).map(([dir, gMarks]) =>
    analyzeSundialGarden(gMarks, dir),
  )

  const totalFiles = marks.length
  const avg = (fn: (m: SundialMark) => number) =>
    totalFiles === 0 ? 0 : Math.round(marks.reduce((s, m) => s + fn(m), 0) / totalFiles)

  const observatory: ObservatoryMeasure = {
    avgGnomonAccuracy: avg(m => m.gnomonAccuracy),
    avgDialCalibration: avg(m => m.dialCalibration),
    avgWeatheringResistance: avg(m => m.weatheringResistance),
    isAccurate: avg(m => m.gnomonAccuracy) >= 60,
    overallPrecision: avg(m => m.qualityScore),
  }

  const overallPrecision = observatory.overallPrecision

  const mostAccurate = marks.length > 0
    ? marks.reduce((best, m) => m.gnomonAccuracy > best.gnomonAccuracy ? m : best, marks[0]).file
    : ''
  const bestCalibrated = marks.length > 0
    ? marks.reduce((best, m) => m.dialCalibration > best.dialCalibration ? m : best, marks[0]).file
    : ''
  const mostRobust = marks.length > 0
    ? marks.reduce((best, m) => m.weatheringResistance > best.weatheringResistance ? m : best, marks[0]).file
    : ''
  const mostWeathered = marks.length > 0
    ? marks.reduce((best, m) => m.weathering.erosionScore > best.weathering.erosionScore ? m : best, marks[0]).file
    : ''
  const mostPredictable = marks.length > 0
    ? marks.reduce((best, m) => m.timeTellingAccuracy > best.timeTellingAccuracy ? m : best, marks[0]).file
    : ''

  const stats: SundialFaceStats = {
    totalFiles,
    totalGardens: gardens.length,
    avgGnomonAccuracy: observatory.avgGnomonAccuracy,
    avgHourMarkingClarity: avg(m => m.hourMarkingClarity),
    avgShadowTracking: avg(m => m.shadowTracking),
    avgDialCalibration: observatory.avgDialCalibration,
    avgWeatheringResistance: observatory.avgWeatheringResistance,
    avgTimeTellingAccuracy: avg(m => m.timeTellingAccuracy),
    precisionSundialCount: marks.filter(m => m.condition === 'precision-sundial').length,
    gardenSundialCount: marks.filter(m => m.condition === 'garden-sundial').length,
    rusticDialCount: marks.filter(m => m.condition === 'rustic-dial').length,
    weatheredStoneCount: marks.filter(m => m.condition === 'weathered-stone').length,
    crackedDialCount: marks.filter(m => m.condition === 'cracked-dial').length,
    brokenStickCount: marks.filter(m => m.condition === 'broken-stick').length,
    polarStyleCount: marks.filter(m => m.gnomon.style === 'polar').length,
    horizontalStyleCount: marks.filter(m => m.gnomon.style === 'horizontal').length,
    brokenStyleCount: marks.filter(m => m.gnomon.style === 'broken').length,
    isAlignedCount: marks.filter(m => m.gnomon.isAligned).length,
    hasGoldenHourCount: marks.filter(m => m.hour.hasGoldenHour).length,
    hasHighNoonCount: marks.filter(m => m.hour.hasHighNoon).length,
    hasMidnightCount: marks.filter(m => m.hour.hasMidnight).length,
    consistentShadowCount: marks.filter(m => m.shadow.hasConsistentShadow).length,
    isPatinaCount: marks.filter(m => m.weathering.isPatina).length,
    isErosionCount: marks.filter(m => m.weathering.isErosion).length,
    isPolishedCount: marks.filter(m => m.weathering.isPolished).length,
    growingCount: marks.filter(m => m.season.isGrowing).length,
    dormantCount: marks.filter(m => m.season.isDormant).length,
    decayingCount: marks.filter(m => m.season.isDecaying).length,
    renewingCount: marks.filter(m => m.season.isRenewing).length,
    perpetualCount: marks.filter(m => m.season.currentSeason === 'perpetual').length,
    overallPrecision,
    chronometerGrade: classifyChronometerGrade(overallPrecision),
    mostAccurate,
    bestCalibrated,
    mostRobust,
    mostWeathered,
    mostPredictable,
  }

  const recommendations = generateRecommendations(marks, gardens, observatory, stats)

  return { marks, gardens, observatory, stats, recommendations }
}
