// ─── Interfaces ──────────────────────────────────────────────────────────────

export type BellType = 'church-bell' | 'carillon' | 'chime' | 'handbell' | 'signal-bell' | 'alarm-bell' | 'ship-bell' | 'silent'
export type RingingPattern = 'single' | 'double' | 'triple' | 'toll' | 'peal' | 'change-ringing' | 'carillon' | 'silent'
export type BellCondition = 'perfect-pitch' | 'well-tuned' | 'tuned' | 'slightly-off' | 'out-of-tune' | 'cracked' | 'silent'
export type ChamberCondition = 'cathedral' | 'church' | 'chapel' | 'belfry' | 'bell-cot' | 'silenced'
export type CampanologistGrade = 'master-ringer' | 'campanologist' | 'ringer' | 'bellhop' | 'deaf' | 'tone-deaf'

export interface RingingInfo {
  frequency: number
  pattern: RingingPattern
  hasDistinctSignals: boolean
  signalCount: number
  isOnSchedule: boolean
  hasFalseAlarms: boolean
  hasMissedSignals: boolean
  falseAlarmCount: number
  missedSignalCount: number
}

export interface SignalsInfo {
  exports: number
  errors: number
  events: number
  logs: number
  returns: number
  totalSignals: number
  signalClarity: number
  hasNoisySignals: boolean
  hasSilentFailures: boolean
}

export interface TowerInfo {
  height: number
  isAccessible: boolean
  hasStairway: boolean
  hasCracks: boolean
  foundationDepth: number
  canSupportWeight: boolean
}

export interface AcousticsInfo {
  clarity: number
  echo: number
  dampening: number
  interference: number
  hasReverb: boolean
  hasHarmonics: boolean
}

export interface Bell {
  file: string
  bellQuality: number
  resonance: number
  reach: number
  timing: number
  volume: number
  bellType: BellType
  tone: number
  ringing: RingingInfo
  signals: SignalsInfo
  tower: TowerInfo
  acoustics: AcousticsInfo
  condition: BellCondition
  qualityScore: number
}

export interface BellChamber {
  directory: string
  bells: Bell[]
  avgBellQuality: number
  avgResonance: number
  avgSignalClarity: number
  dominantBellType: string
  totalSignals: number
  falseAlarmCount: number
  missedSignalCount: number
  carillonBells: number
  alarmBells: number
  silentBells: number
  isHarmonious: boolean
  hasDissonance: boolean
  chamberAcoustics: number
  condition: ChamberCondition
}

export interface CityInfo {
  totalSignals: number
  avgSignalClarity: number
  avgResonance: number
  falseAlarmRate: number
  missedSignalRate: number
  isAudible: boolean
  overallAcoustics: number
}

export interface BellTowerStats {
  totalFiles: number
  totalChambers: number
  avgBellQuality: number
  avgResonance: number
  avgReach: number
  avgTiming: number
  avgVolume: number
  avgSignalClarity: number
  avgAcoustics: number
  churchBells: number
  carillonBells: number
  alarmBells: number
  silentBells: number
  totalSignals: number
  falseAlarmCount: number
  missedSignalCount: number
  noisySignalCount: number
  silentFailureCount: number
  harmoniousChambers: number
  dissonantChambers: number
  perfectPitchCount: number
  crackedCount: number
  overallAcoustics: number
  campanologistGrade: CampanologistGrade
  bestBell: string
  worstBell: string
  loudestBell: string
  quietestBell: string
  bestChamber: string
}

export interface BellTowerResult {
  bells: Bell[]
  chambers: BellChamber[]
  city: CityInfo
  stats: BellTowerStats
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
 * Count error handling
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
  let max = 0
  let cur = 0
  for (const ch of content) {
    if (ch === '{') { cur++; if (cur > max) max = cur }
    else if (ch === '}') { cur = Math.max(0, cur - 1) }
  }
  return max
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

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify bell type from code structure
 * @example
 * classifyBellType('export function a() {}') // 'signal-bell'
 */
export function classifyBellType(content: string): BellType {
  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFunctions(content)
  const hasClass = /\bclass\s+\w/.test(content)
  const hasInterface = /interface\s+\w/.test(content)

  if (hasInterface && hasClass && exports > 3) return 'carillon'
  if (hasClass && exports > 1) return 'church-bell'
  if (exports > 2 && funcs > 1) return 'chime'
  if (countErrorHandling(content) > 2 && imports > 2) return 'alarm-bell'
  if (exports > 0 && imports > 0) return 'signal-bell'
  if (exports > 0) return 'handbell'
  if (imports > 2) return 'ship-bell'
  return 'silent'
}

/**
 * Classify bell condition from quality score
 * @example
 * classifyBellCondition(85) // 'perfect-pitch'
 */
export function classifyBellCondition(qualityScore: number): BellCondition {
  if (qualityScore >= 85) return 'perfect-pitch'
  if (qualityScore >= 70) return 'well-tuned'
  if (qualityScore >= 55) return 'tuned'
  if (qualityScore >= 40) return 'slightly-off'
  if (qualityScore >= 20) return 'out-of-tune'
  if (qualityScore >= 5) return 'cracked'
  return 'silent'
}

/**
 * Classify chamber condition from acoustics
 * @example
 * classifyChamberCondition(80) // 'cathedral'
 */
export function classifyChamberCondition(acoustics: number): ChamberCondition {
  if (acoustics >= 80) return 'cathedral'
  if (acoustics >= 60) return 'church'
  if (acoustics >= 40) return 'chapel'
  if (acoustics >= 25) return 'belfry'
  if (acoustics >= 10) return 'bell-cot'
  return 'silenced'
}

/**
 * Classify campanologist grade from average acoustics
 * @example
 * classifyCampanologistGrade(85) // 'master-ringer'
 */
export function classifyCampanologistGrade(avgAcoustics: number): CampanologistGrade {
  if (avgAcoustics >= 80) return 'master-ringer'
  if (avgAcoustics >= 65) return 'campanologist'
  if (avgAcoustics >= 45) return 'ringer'
  if (avgAcoustics >= 30) return 'bellhop'
  if (avgAcoustics >= 15) return 'deaf'
  return 'tone-deaf'
}

// ─── Detection Functions ──────────────────────────────────────────────────────

/**
 * Detect silent failures (swallowed errors)
 * @example
 * detectSilentFailures('try {} catch(e) {}') // number
 */
export function detectSilentFailures(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  let count = 0
  const catchBlocks = content.match(/\bcatch\s*\([^)]*\)\s*\{[^}]*\}/g) ?? []
  for (const block of catchBlocks) {
    const inner = block.replace(/\bcatch\s*\([^)]*\)\s*\{/, '').replace(/\}$/, '').trim()
    if (inner.length === 0 || (!inner.includes('throw') && !inner.includes('console') && !inner.includes('return'))) {
      count++
    }
  }
  if (countErrorHandling(content) === 0 && loc > 50 && countFunctions(content) > 2) count++
  return count
}

/**
 * Detect false alarms (unnecessary signals)
 * @example
 * detectFalseAlarms('console.log("a")\nconsole.log("b")\nconsole.log("c")') // number
 */
export function detectFalseAlarms(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  let count = 0
  if (countConsole(content) > 3) count += countConsole(content) - 3
  if (countTodos(content) > 0 && countErrorHandling(content) === 0) count += 1
  return count
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure signals in code
 * @example
 * measureSignals('export function a() { return 1 }') // SignalsInfo
 */
export function measureSignals(content: string): SignalsInfo {
  const loc = countLoc(content)
  const exports = countExports(content)
  const errors = countErrorHandling(content)
  const events = (content.match(/\bemit\s*\(|\.on\s*\(|\.addEventListener\s*\(/g) ?? []).length
  const logs = countConsole(content)
  const returns = (content.match(/\breturn\b/g) ?? []).length
  const totalSignals = exports + errors + events + Math.min(logs, 5) + Math.min(returns, 10)

  const signalClarity = Math.min(100, Math.round(
    (exports > 0 ? 25 : 0) +
    (errors > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (logs <= 2 ? 10 : 0) +
    (countBranches(content) <= 5 ? 10 : 0),
  ))

  const hasNoisySignals = logs > 5
  const hasSilentFailures = detectSilentFailures(content) > 0

  return { exports, errors, events, logs, returns, totalSignals, signalClarity, hasNoisySignals, hasSilentFailures }
}

/**
 * Assess ringing patterns
 * @example
 * assessRinging('export function a() { return 1 }') // RingingInfo
 */
export function assessRinging(content: string): RingingInfo {
  const loc = countLoc(content)
  const funcs = countFunctions(content)
  const exports = countExports(content)
  const errors = countErrorHandling(content)
  const falseAlarmCount = detectFalseAlarms(content)
  const missedSignalCount = detectSilentFailures(content)

  const frequency = Math.min(100, Math.round(
    funcs * 6 + exports * 4 + errors * 3,
  ))

  let pattern: RingingPattern = 'silent'
  if (exports > 5 && funcs > 3) pattern = 'carillon'
  else if (exports > 3) pattern = 'change-ringing'
  else if (exports > 1 && errors > 0) pattern = 'peal'
  else if (exports > 1) pattern = 'triple'
  else if (errors > 0 && exports > 0) pattern = 'double'
  else if (errors > 0) pattern = 'toll'
  else if (exports > 0) pattern = 'single'
  else if (funcs > 0) pattern = 'single'

  const hasDistinctSignals = exports > 0 && errors > 0
  const signalCount = exports + errors
  const isOnSchedule = countBranches(content) <= 8 && countComments(content) > 0

  return {
    frequency, pattern, hasDistinctSignals, signalCount, isOnSchedule,
    hasFalseAlarms: falseAlarmCount > 0, hasMissedSignals: missedSignalCount > 0,
    falseAlarmCount, missedSignalCount,
  }
}

/**
 * Assess acoustics of the code
 * @example
 * assessAcoustics('export function calc(): number { return 1 }') // AcousticsInfo
 */
export function assessAcoustics(content: string): AcousticsInfo {
  const loc = countLoc(content)
  if (loc === 0) {
    return { clarity: 0, echo: 0, dampening: 100, interference: 0, hasReverb: false, hasHarmonics: false }
  }

  const clarity = Math.min(100, Math.round(
    (countTypeAnnotations(content) > 0 ? 25 : 0) +
    (countExports(content) > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (maxNesting(content) <= 3 ? 15 : maxNesting(content) <= 5 ? 8 : 0) +
    (countConsole(content) <= 1 ? 5 : 0),
  ))

  const echo = Math.min(100, Math.round(
    countConsole(content) * 5 +
    (countImports(content) > 3 && countExports(content) === 0 ? 15 : 0),
  ))

  const dampening = Math.min(100, Math.round(
    (countErrorHandling(content) === 0 && loc > 30 ? 25 : 0) +
    (countTypeAnnotations(content) === 0 && countExports(content) > 0 ? 20 : 0) +
    (countComments(content) === 0 && loc > 40 ? 15 : 0),
  ))

  const interference = Math.min(100, Math.round(
    (countBranches(content) > 8 ? 15 : 0) +
    (countTodos(content) * 8) +
    (maxNesting(content) > 4 ? 10 : 0),
  ))

  const hasReverb = countImports(content) > 3 && countExports(content) > 2
  const hasHarmonics = countTypeAnnotations(content) > 2 && countErrorHandling(content) > 0

  return { clarity, echo, dampening, interference, hasReverb, hasHarmonics }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a bell
 * @example
 * analyzeBell('export function calc() { return 1 }', 'calc.ts') // Bell
 */
export function analyzeBell(content: string, filePath: string): Bell {
  const loc = countLoc(content)
  const signals = measureSignals(content)
  const ringing = assessRinging(content)
  const acoustics = assessAcoustics(content)

  const bellQuality = Math.min(100, Math.round(
    signals.signalClarity * 0.35 +
    acoustics.clarity * 0.3 +
    (ringing.hasDistinctSignals ? 20 : 0) +
    (ringing.isOnSchedule ? 15 : 0),
  ))

  const resonance = Math.min(100, Math.round(
    (countExports(content) > 0 ? 20 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 15 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (countImports(content) > 0 ? 10 : 0) +
    (acoustics.hasHarmonics ? 10 : 0) +
    (countFunctions(content) > 0 ? 10 : 0),
  ))

  const reach = Math.min(100, Math.round(
    countExports(content) * 12 +
    (/\breturn\b/.test(content) ? 15 : 0) +
    countImports(content) * 5,
  ))

  const timing = Math.min(100, Math.round(
    (ringing.isOnSchedule ? 30 : 10) +
    (countBranches(content) <= 5 ? 25 : countBranches(content) <= 10 ? 15 : 5) +
    (maxNesting(content) <= 3 ? 25 : maxNesting(content) <= 5 ? 15 : 5) +
    (countComments(content) > 0 ? 20 : 5),
  ))

  const volume = Math.min(100, Math.round(
    signals.totalSignals * 5 +
    countFunctions(content) * 3 +
    (loc > 20 ? 10 : 0),
  ))

  const bellType = classifyBellType(content)
  const tone = Math.min(100, Math.round(
    countTypeAnnotations(content) * 8 +
    countImports(content) * 4 +
    (/\binterface\b/.test(content) ? 15 : 0),
  ))

  const tower: TowerInfo = {
    height: Math.min(100, Math.round(
      countFunctions(content) * 6 +
      countExports(content) * 8 +
      maxNesting(content) * 5,
    )),
    isAccessible: countComments(content) > 0 || countExports(content) > 0,
    hasStairway: countTypeAnnotations(content) > 0,
    hasCracks: countTodos(content) > 2 || (countErrorHandling(content) === 0 && loc > 50),
    foundationDepth: Math.min(100, Math.round(
      countComments(content) * 5 +
      countErrorHandling(content) * 8 +
      countTypeAnnotations(content) * 6,
    )),
    canSupportWeight: maxNesting(content) <= 5 && loc <= 400,
  }

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    bellQuality * 0.3 +
    resonance * 0.2 +
    acoustics.clarity * 0.2 +
    timing * 0.15 +
    (tower.hasCracks ? -5 : 5) +
    (signals.hasNoisySignals ? -5 : 0) +
    (signals.hasSilentFailures ? -10 : 0) +
    5,
  )))

  const condition = classifyBellCondition(qualityScore)

  return {
    file: filePath, bellQuality, resonance, reach, timing, volume,
    bellType, tone, ringing, signals, tower, acoustics, condition, qualityScore,
  }
}

// ─── Chamber Analysis ────────────────────────────────────────────────────────

/**
 * Analyze a directory as a bell chamber
 * @example
 * analyzeBellChamber(bells, 'src') // BellChamber
 */
export function analyzeBellChamber(bells: Bell[], dirPath: string): BellChamber {
  if (bells.length === 0) {
    return {
      directory: dirPath, bells: [], avgBellQuality: 0, avgResonance: 0,
      avgSignalClarity: 0, dominantBellType: 'silent', totalSignals: 0,
      falseAlarmCount: 0, missedSignalCount: 0, carillonBells: 0,
      alarmBells: 0, silentBells: 0, isHarmonious: true,
      hasDissonance: false, chamberAcoustics: 100, condition: 'cathedral',
    }
  }

  const n = bells.length
  const avgBellQuality = Math.round(bells.reduce((s, b) => s + b.bellQuality, 0) / n)
  const avgResonance = Math.round(bells.reduce((s, b) => s + b.resonance, 0) / n)
  const avgSignalClarity = Math.round(bells.reduce((s, b) => s + b.signals.signalClarity, 0) / n)

  const typeMap = new Map<string, number>()
  for (const b of bells) {
    const count = typeMap.get(b.bellType) ?? 0
    typeMap.set(b.bellType, count + 1)
  }
  const dominantBellType = Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1])[0][0]

  const totalSignals = bells.reduce((s, b) => s + b.signals.totalSignals, 0)
  const falseAlarmCount = bells.reduce((s, b) => s + b.ringing.falseAlarmCount, 0)
  const missedSignalCount = bells.reduce((s, b) => s + b.ringing.missedSignalCount, 0)
  const carillonBells = bells.filter(b => b.bellType === 'carillon').length
  const alarmBells = bells.filter(b => b.bellType === 'alarm-bell').length
  const silentBells = bells.filter(b => b.bellType === 'silent').length

  const isHarmonious = avgBellQuality >= 40 && falseAlarmCount < n
  const hasDissonance = silentBells > n * 0.5 || missedSignalCount > n

  const chamberAcoustics = Math.min(100, Math.max(0, Math.round(
    avgBellQuality * 0.3 +
    avgSignalClarity * 0.25 +
    avgResonance * 0.2 +
    (isHarmonious ? 15 : 0) +
    (hasDissonance ? -10 : 0) +
    10,
  )))

  const condition = classifyChamberCondition(chamberAcoustics)

  return {
    directory: dirPath, bells, avgBellQuality, avgResonance, avgSignalClarity,
    dominantBellType, totalSignals, falseAlarmCount, missedSignalCount,
    carillonBells, alarmBells, silentBells, isHarmonious, hasDissonance,
    chamberAcoustics, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate bell tower recommendations
 * @example
 * generateRecommendations(bells, chambers, city, stats) // string[]
 */
export function generateRecommendations(
  bells: Bell[],
  _chambers: BellChamber[],
  _city: CityInfo,
  stats: BellTowerStats,
): string[] {
  void bells
  void _chambers
  void _city
  const recs: string[] = []

  if (stats.falseAlarmCount > 0) {
    recs.push(`False alarms: ${stats.falseAlarmCount} unnecessary signals detected across files`)
  }
  if (stats.silentFailureCount > 0) {
    recs.push(`Silent failures: ${stats.silentFailureCount} files silently swallow errors`)
  }
  if (stats.crackedCount > 0) {
    recs.push(`Cracked bells: ${stats.crackedCount} files have degraded signal quality`)
  }
  if (stats.noisySignalCount > 0) {
    recs.push(`Noisy signals: ${stats.noisySignalCount} files produce excessive output`)
  }
  if (stats.dissonantChambers > 0) {
    recs.push(`Dissonance: ${stats.dissonantChambers} directories have conflicting signal patterns`)
  }
  if (stats.overallAcoustics >= 60) {
    recs.push('Good acoustics: the bell tower is well-tuned and audible')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete bell tower result from files and contents
 * @example
 * buildBellTowerResult(['a.ts'], ['export function a() {}'], {}) // BellTowerResult
 */
export function buildBellTowerResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): BellTowerResult {
  void options

  const bells: Bell[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeBell(content, file)
    } catch {
      return analyzeBell('', file)
    }
  })

  const dirMap = new Map<string, Bell[]>()
  for (const b of bells) {
    const dir = b.file.includes('/') ? b.file.slice(0, b.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(b) } else { dirMap.set(dir, [b]) }
  }

  const chambers: BellChamber[] = Array.from(dirMap.entries()).map(([dir, bs]) =>
    analyzeBellChamber(bs, dir),
  )

  const n = bells.length || 1
  const totalSignals = bells.reduce((s, b) => s + b.signals.totalSignals, 0)
  const avgSignalClarity = Math.round(bells.reduce((s, b) => s + b.signals.signalClarity, 0) / n)
  const avgResonance = Math.round(bells.reduce((s, b) => s + b.resonance, 0) / n)
  const falseAlarmRate = Math.min(100, Math.round((bells.reduce((s, b) => s + b.ringing.falseAlarmCount, 0) / n) * 20))
  const missedSignalRate = Math.min(100, Math.round((bells.reduce((s, b) => s + b.ringing.missedSignalCount, 0) / n) * 20))

  const overallAcoustics = Math.min(100, Math.max(0, Math.round(
    Math.round(bells.reduce((s, b) => s + b.bellQuality, 0) / n) * 0.3 +
    avgSignalClarity * 0.25 +
    avgResonance * 0.2 +
    Math.round(bells.reduce((s, b) => s + b.acoustics.clarity, 0) / n) * 0.25,
  )))

  const city: CityInfo = {
    totalSignals, avgSignalClarity, avgResonance,
    falseAlarmRate, missedSignalRate,
    isAudible: avgSignalClarity >= 40,
    overallAcoustics,
  }

  const stats: BellTowerStats = {
    totalFiles: files.length,
    totalChambers: chambers.length,
    avgBellQuality: Math.round(bells.reduce((s, b) => s + b.bellQuality, 0) / n),
    avgResonance,
    avgReach: Math.round(bells.reduce((s, b) => s + b.reach, 0) / n),
    avgTiming: Math.round(bells.reduce((s, b) => s + b.timing, 0) / n),
    avgVolume: Math.round(bells.reduce((s, b) => s + b.volume, 0) / n),
    avgSignalClarity,
    avgAcoustics: overallAcoustics,
    churchBells: bells.filter(b => b.bellType === 'church-bell').length,
    carillonBells: bells.filter(b => b.bellType === 'carillon').length,
    alarmBells: bells.filter(b => b.bellType === 'alarm-bell').length,
    silentBells: bells.filter(b => b.bellType === 'silent').length,
    totalSignals,
    falseAlarmCount: bells.reduce((s, b) => s + b.ringing.falseAlarmCount, 0),
    missedSignalCount: bells.reduce((s, b) => s + b.ringing.missedSignalCount, 0),
    noisySignalCount: bells.filter(b => b.signals.hasNoisySignals).length,
    silentFailureCount: bells.filter(b => b.signals.hasSilentFailures).length,
    harmoniousChambers: chambers.filter(c => c.isHarmonious).length,
    dissonantChambers: chambers.filter(c => c.hasDissonance).length,
    perfectPitchCount: bells.filter(b => b.condition === 'perfect-pitch').length,
    crackedCount: bells.filter(b => b.condition === 'cracked' || b.condition === 'silent').length,
    overallAcoustics,
    campanologistGrade: classifyCampanologistGrade(overallAcoustics),
    bestBell: bells.length > 0
      ? bells.reduce((b, c) => c.qualityScore > b.qualityScore ? c : b, bells[0]).file : 'none',
    worstBell: bells.length > 0
      ? bells.reduce((b, c) => c.qualityScore < b.qualityScore ? c : b, bells[0]).file : 'none',
    loudestBell: bells.length > 0
      ? bells.reduce((b, c) => c.volume > b.volume ? c : b, bells[0]).file : 'none',
    quietestBell: bells.length > 0
      ? bells.reduce((b, c) => c.volume < b.volume ? c : b, bells[0]).file : 'none',
    bestChamber: chambers.length > 0
      ? chambers.reduce((b, c) => c.chamberAcoustics > b.chamberAcoustics ? c : b, chambers[0]).directory : 'none',
  }

  const recommendations = generateRecommendations(bells, chambers, city, stats)

  return { bells, chambers, city, stats, recommendations }
}
