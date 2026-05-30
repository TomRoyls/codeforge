// ─── Interfaces ──────────────────────────────────────────────────────────────

export type InstrumentType = 'strings' | 'woodwinds' | 'brass' | 'percussion' | 'keyboards' | 'vocals'
export type Register = 'bass' | 'tenor' | 'alto' | 'soprano' | 'contrabass' | 'piccolo'
export type TimeSignature = '4/4' | '3/4' | '6/8' | 'free' | 'chaotic'
export type PartCondition = 'virtuoso' | 'first-chair' | 'section-player' | 'amateur' | 'beginner' | 'tone-deaf'
export type SectionType = 'string-section' | 'woodwind-section' | 'brass-section' | 'percussion-section' | 'mixed-ensemble' | 'solo-stage'
export type SectionCondition = 'world-class' | 'professional' | 'community' | 'school' | 'garage' | 'cacophony'
export type MaestroGrade = 'grand-maestro' | 'maestro' | 'conductor' | 'musician' | 'busker' | 'street-performer'

export interface InstrumentPart {
  file: string
  tuning: number
  timing: number
  dynamics: number
  harmony: number
  soloQuality: number
  conductorClarity: number
  instrument: {
    type: InstrumentType
    family: string
    range: number
    register: Register
    isTuned: boolean
    pitchAccuracy: number
    hasVibrato: boolean
    isMuted: boolean
  }
  rhythm: {
    tempo: number
    isSteadyBeat: boolean
    hasSyncopation: boolean
    hasMissedBeats: boolean
    hasDoubleTime: boolean
    missedBeatCount: number
    timeSignature: TimeSignature
  }
  dynamicsObj: {
    range: number
    hasPianissimo: boolean
    hasFortissimo: boolean
    hasCrescendo: boolean
    hasDiminuendo: boolean
    hasSforzando: boolean
    dynamicControl: number
  }
  ensemble: {
    isInSection: boolean
    sectionLeader: boolean
    followsCues: boolean
    hasCueErrors: boolean
    blendsWell: boolean
    isSoloist: boolean
    cueErrorCount: number
  }
  score: {
    isReadable: boolean
    hasAnnotations: boolean
    hasDynamics: boolean
    hasTempoMarkings: boolean
    hasArticulations: boolean
    readability: number
    annotationCount: number
  }
  performance: {
    isRehearsed: boolean
    hasImprovisation: boolean
    hasMemorized: boolean
    needsSheet: boolean
    rehearsalQuality: number
    performanceReady: boolean
  }
  condition: PartCondition
  qualityScore: number
}

export interface OrchestraSection {
  directory: string
  instruments: InstrumentPart[]
  avgTuning: number
  avgTiming: number
  avgHarmony: number
  avgSoloQuality: number
  virtuosoCount: number
  toneDeafCount: number
  sectionType: SectionType
  condition: SectionCondition
}

export interface Symphony {
  avgTuning: number
  avgTiming: number
  avgHarmony: number
  avgSoloQuality: number
  avgConductorClarity: number
  isInTune: boolean
  overallHarmony: number
}

export interface OrchestraPitStats {
  totalFiles: number
  totalSections: number
  avgTuning: number
  avgTiming: number
  avgDynamics: number
  avgHarmony: number
  avgSoloQuality: number
  avgConductorClarity: number
  virtuosoCount: number
  firstChairCount: number
  sectionPlayerCount: number
  amateurCount: number
  beginnerCount: number
  toneDeafCount: number
  stringsCount: number
  woodwindsCount: number
  brassCount: number
  percussionCount: number
  keyboardsCount: number
  vocalsCount: number
  tunedCount: number
  steadyBeatCount: number
  missedBeatCount: number
  hasDynamicsCount: number
  inSectionCount: number
  soloistCount: number
  rehearsedCount: number
  performanceReadyCount: number
  overallHarmony: number
  maestroGrade: MaestroGrade
  bestInstrument: string
  worstInstrument: string
  bestTuned: string
  bestTimed: string
  bestDynamic: string
}

export interface OrchestraPitResult {
  instruments: InstrumentPart[]
  sections: OrchestraSection[]
  symphony: Symphony
  stats: OrchestraPitStats
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
 * Classify part condition from quality score
 * @example
 * classifyPartCondition(90) // 'virtuoso'
 */
export function classifyPartCondition(score: number): PartCondition {
  if (score >= 80) return 'virtuoso'
  if (score >= 65) return 'first-chair'
  if (score >= 45) return 'section-player'
  if (score >= 25) return 'amateur'
  if (score >= 10) return 'beginner'
  return 'tone-deaf'
}

/**
 * Classify section type from instruments
 * @example
 * classifySectionType([]) // 'solo-stage'
 */
export function classifySectionType(instruments: InstrumentPart[]): SectionType {
  if (instruments.length === 0) return 'solo-stage'
  const typeCounts = new Map<InstrumentType, number>()
  for (const inst of instruments) {
    const prev = typeCounts.get(inst.instrument.type) ?? 0
    typeCounts.set(inst.instrument.type, prev + 1)
  }
  const n = instruments.length
  const virtuoso = instruments.filter(i => i.condition === 'virtuoso' || i.condition === 'first-chair').length

  if (virtuoso > n * 0.5 && instruments.some(i => i.instrument.type === 'strings')) return 'string-section'
  if (virtuoso > n * 0.5 && instruments.some(i => i.instrument.type === 'woodwinds')) return 'woodwind-section'
  if (virtuoso > n * 0.5 && instruments.some(i => i.instrument.type === 'brass')) return 'brass-section'
  if (virtuoso > n * 0.5 && instruments.some(i => i.instrument.type === 'percussion')) return 'percussion-section'
  if (typeCounts.size > 1 && n >= 3) return 'mixed-ensemble'
  return 'solo-stage'
}

/**
 * Classify section condition from avg score
 * @example
 * classifySectionCondition(85) // 'world-class'
 */
export function classifySectionCondition(avgScore: number): SectionCondition {
  if (avgScore >= 75) return 'world-class'
  if (avgScore >= 60) return 'professional'
  if (avgScore >= 40) return 'community'
  if (avgScore >= 25) return 'school'
  if (avgScore >= 10) return 'garage'
  return 'cacophony'
}

/**
 * Classify maestro grade from avg harmony
 * @example
 * classifyMaestroGrade(85) // 'grand-maestro'
 */
export function classifyMaestroGrade(avgHarmony: number): MaestroGrade {
  if (avgHarmony >= 80) return 'grand-maestro'
  if (avgHarmony >= 65) return 'maestro'
  if (avgHarmony >= 45) return 'conductor'
  if (avgHarmony >= 30) return 'musician'
  if (avgHarmony >= 15) return 'busker'
  return 'street-performer'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure instrument properties from code content
 * @example
 * measureInstrument('export function a(): number { return 1 }') // { type, range, ... }
 */
export function measureInstrument(content: string): InstrumentPart['instrument'] {
  const exports = countExports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const loc = countLoc(content)
  const branches = countBranches(content)

  const range = Math.min(100, Math.max(0, Math.round(
    (exports * 10) +
    (functions * 8) +
    (classes * 12) +
    (types * 5) +
    (loc * 0.2),
  )))

  let type: InstrumentType = 'vocals'
  if (classes > 0 && functions > classes) type = 'strings'
  else if (classes > 0) type = 'brass'
  else if (functions > 3) type = 'woodwinds'
  else if (exports > 0 && functions <= 1) type = 'keyboards'
  else if (branches > 3 && loc > 0) type = 'percussion'

  let register: Register = 'alto'
  if (range >= 80) register = 'soprano'
  else if (range >= 60) register = 'alto'
  else if (range >= 40) register = 'tenor'
  else if (range >= 20) register = 'bass'
  else if (range > 0) register = 'contrabass'
  else register = 'piccolo'

  const family = type === 'strings' ? 'core-logic'
    : type === 'woodwinds' ? 'utilities'
    : type === 'brass' ? 'models'
    : type === 'percussion' ? 'handlers'
    : type === 'keyboards' ? 'config'
    : 'entry'

  const comments = countComments(content)
  const descriptive = countDescriptiveNames(content)
  const pitchAccuracy = Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 30 : 0) +
    (comments > 0 ? 20 : 0) +
    (jsdoc > 0 ? 25 : 0) +
    (descriptive > 0 ? 25 : 0),
  )))

  const isTuned = pitchAccuracy >= 60
  const imports = countImports(content)
  const hasVibrato = imports > 0 && exports > 0
  const isMuted = exports === 0 && loc > 0

  return {
    type, family, range, register,
    isTuned, pitchAccuracy, hasVibrato, isMuted,
  }
}

/**
 * Measure rhythm properties from code content
 * @example
 * measureRhythm('if (a) { if (b) {} }') // { tempo, isSteadyBeat, ... }
 */
export function measureRhythm(content: string): InstrumentPart['rhythm'] {
  const functions = countFunctions(content)
  const branches = countBranches(content)
  const nesting = maxNesting(content)
  const loc = countLoc(content)
  const errors = countErrorHandling(content)

  const tempo = Math.min(100, Math.max(0, Math.round(
    (functions * 8) +
    (branches * 5) +
    (nesting * 5) +
    (loc * 0.3),
  )))

  const missedBeatCount = branches > 0 && errors === 0 ? Math.max(1, branches) : 0
  const isSteadyBeat = tempo >= 15 && tempo <= 60 && nesting <= 3
  const hasSyncopation = branches > 0 && nesting > 2
  const hasMissedBeats = missedBeatCount > 0
  const hasDoubleTime = nesting > 4

  let timeSignature: TimeSignature = '4/4'
  if (loc === 0) timeSignature = 'free'
  else if (hasDoubleTime) timeSignature = 'chaotic'
  else if (branches > 0 && branches % 3 === 0) timeSignature = '3/4'
  else if (branches > 0 && branches % 6 === 0) timeSignature = '6/8'

  return {
    tempo, isSteadyBeat, hasSyncopation,
    hasMissedBeats, hasDoubleTime, missedBeatCount, timeSignature,
  }
}

/**
 * Measure dynamics properties from code content
 * @example
 * measureDynamics('try {} catch(e) {}') // { range, hasPianissimo, ... }
 */
export function measureDynamics(content: string): InstrumentPart['dynamicsObj'] {
  const errors = countErrorHandling(content)
  const branches = countBranches(content)
  const loc = countLoc(content)
  const todos = countTodos(content)
  const types = countTypeAnnotations(content)

  const range = Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 30 : 0) +
    (branches > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (loc > 0 ? 10 : 0) +
    (errors >= 2 ? 20 : 0) +
    (errors >= 4 ? 10 : 0),
  )))

  const hasPianissimo = errors > 0
  const hasFortissimo = errors >= 3
  const hasCrescendo = errors >= 2 && branches > 0
  const hasDiminuendo = errors > 0 && todos === 0
  const hasSforzando = (content.match(/throw\s+/g) ?? []).length > 0

  const dynamicControl = Math.min(100, Math.max(0, Math.round(
    (hasPianissimo ? 25 : 0) +
    (hasFortissimo ? 20 : 0) +
    (hasCrescendo ? 20 : 0) +
    (hasDiminuendo ? 20 : 0) +
    (hasSforzando ? 15 : 0),
  )))

  return {
    range, hasPianissimo, hasFortissimo,
    hasCrescendo, hasDiminuendo, hasSforzando, dynamicControl,
  }
}

/**
 * Measure ensemble properties from code content
 * @example
 * measureEnsemble('import { x } from "./a"') // { isInSection, followsCues, ... }
 */
export function measureEnsemble(content: string): InstrumentPart['ensemble'] {
  const exports = countExports(content)
  const imports = countImports(content)
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)

  const isInSection = imports > 0 || exports > 0
  const sectionLeader = exports >= 3
  const followsCues = imports > 0 && types > 0
  const cueErrorCount = imports > 0 && types === 0 ? imports : 0
  const hasCueErrors = cueErrorCount > 0
  const blendsWell = comments > 0 && jsdoc > 0 && types > 0
  const isSoloist = exports > 0 && imports === 0

  return {
    isInSection, sectionLeader, followsCues,
    hasCueErrors, blendsWell, isSoloist, cueErrorCount,
  }
}

/**
 * Measure score (readability) properties from code content
 * @example
 * measureScore('// comment\nexport function a() {}') // { isReadable, ... }
 */
export function measureScore(content: string): InstrumentPart['score'] {
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const errors = countErrorHandling(content)
  const loc = countLoc(content)
  const todos = countTodos(content)
  const descriptive = countDescriptiveNames(content)

  const annotationCount = comments + jsdoc
  const isReadable = loc <= 30 || (comments > 0 && descriptive > 0)
  const hasAnnotations = comments > 0 || jsdoc > 0
  const hasDynamics = errors > 0
  const hasTempoMarkings = jsdoc > 0
  const hasArticulations = jsdoc > 0 && comments > jsdoc

  const readability = Math.min(100, Math.max(0, Math.round(
    (hasAnnotations ? 25 : 0) +
    (isReadable ? 25 : 0) +
    (descriptive > 0 ? 20 : 0) +
    (todos === 0 ? 15 : 0) +
    (hasArticulations ? 15 : 0),
  )))

  return {
    isReadable, hasAnnotations, hasDynamics,
    hasTempoMarkings, hasArticulations, readability, annotationCount,
  }
}

/**
 * Measure performance properties from code content
 * @example
 * measurePerformance('export function a(): number { try { return 1 } catch(e) { return 0 } }') // { ... }
 */
export function measurePerformance(content: string): InstrumentPart['performance'] {
  const errors = countErrorHandling(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const imports = countImports(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const todos = countTodos(content)
  const loc = countLoc(content)

  const isRehearsed = errors > 0
  const hasImprovisation = imports > 0 && exports > 0
  const hasMemorized = imports === 0 && loc > 0
  const needsSheet = imports > 0 && jsdoc === 0

  const rehearsalQuality = Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 30 : 0) +
    (types > 0 ? 25 : 0) +
    (exports > 0 ? 15 : 0) +
    (comments > 0 ? 15 : 0) +
    (todos === 0 ? 15 : 0),
  )))

  const performanceReady = isRehearsed && exports > 0 && types > 0

  return {
    isRehearsed, hasImprovisation, hasMemorized,
    needsSheet, rehearsalQuality, performanceReady,
  }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as an instrument part
 * @example
 * analyzeInstrumentPart('export function a(): number { return 1 }', 'a.ts') // InstrumentPart
 */
export function analyzeInstrumentPart(content: string, filePath: string): InstrumentPart {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      file: filePath,
      tuning: 0, timing: 0, dynamics: 0, harmony: 0, soloQuality: 0, conductorClarity: 0,
      instrument: { type: 'vocals', family: 'entry', range: 0, register: 'piccolo', isTuned: false, pitchAccuracy: 0, hasVibrato: false, isMuted: true },
      rhythm: { tempo: 0, isSteadyBeat: true, hasSyncopation: false, hasMissedBeats: false, hasDoubleTime: false, missedBeatCount: 0, timeSignature: 'free' },
      dynamicsObj: { range: 0, hasPianissimo: false, hasFortissimo: false, hasCrescendo: false, hasDiminuendo: false, hasSforzando: false, dynamicControl: 0 },
      ensemble: { isInSection: false, sectionLeader: false, followsCues: false, hasCueErrors: false, blendsWell: false, isSoloist: false, cueErrorCount: 0 },
      score: { isReadable: true, hasAnnotations: false, hasDynamics: false, hasTempoMarkings: false, hasArticulations: false, readability: 15, annotationCount: 0 },
      performance: { isRehearsed: false, hasImprovisation: false, hasMemorized: false, needsSheet: false, rehearsalQuality: 0, performanceReady: false },
      condition: 'tone-deaf',
      qualityScore: 0,
    }
  }

  const instrument = measureInstrument(content)
  const rhythm = measureRhythm(content)
  const dynamicsReading = measureDynamics(content)
  const ensemble = measureEnsemble(content)
  const scoreReading = measureScore(content)
  const perfReading = measurePerformance(content)

  const tuning = instrument.pitchAccuracy
  const timing = Math.min(100, Math.max(0, Math.round(
    (rhythm.isSteadyBeat ? 30 : 10) +
    (rhythm.missedBeatCount === 0 ? 30 : Math.max(0, 30 - rhythm.missedBeatCount * 5)) +
    (rhythm.timeSignature === '4/4' ? 20 : rhythm.timeSignature === '3/4' ? 15 : 5) +
    (rhythm.hasDoubleTime ? 0 : 20),
  )))
  const dynamics = dynamicsReading.dynamicControl
  const harmony = Math.min(100, Math.max(0, Math.round(
    (ensemble.blendsWell ? 30 : 0) +
    (ensemble.followsCues ? 25 : 0) +
    (ensemble.isInSection ? 20 : 0) +
    (ensemble.cueErrorCount === 0 ? 15 : Math.max(0, 15 - ensemble.cueErrorCount * 5)) +
    (ensemble.sectionLeader ? 10 : 0),
  )))
  const soloQuality = Math.min(100, Math.max(0, Math.round(
    instrument.range * 0.25 +
    scoreReading.readability * 0.25 +
    perfReading.rehearsalQuality * 0.25 +
    (instrument.isTuned ? 25 : 5),
  )))
  const conductorClarity = Math.min(100, Math.max(0, Math.round(
    (scoreReading.hasAnnotations ? 25 : 0) +
    (scoreReading.hasArticulations ? 25 : 0) +
    (ensemble.sectionLeader ? 20 : 0) +
    (instrument.isTuned ? 15 : 0) +
    (perfReading.performanceReady ? 15 : 0),
  )))

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    tuning * 0.2 +
    timing * 0.2 +
    dynamics * 0.15 +
    harmony * 0.2 +
    soloQuality * 0.15 +
    conductorClarity * 0.1,
  )))

  const condition = classifyPartCondition(qualityScore)

  return {
    file: filePath,
    tuning, timing, dynamics, harmony, soloQuality, conductorClarity,
    instrument, rhythm, dynamicsObj: dynamicsReading, ensemble,
    score: scoreReading, performance: perfReading,
    condition, qualityScore,
  }
}

// ─── Section Analysis ────────────────────────────────────────────────────────

/**
 * Analyze a directory as an orchestra section
 * @example
 * analyzeOrchestraSection(instruments, 'src') // OrchestraSection
 */
export function analyzeOrchestraSection(instruments: InstrumentPart[], dirPath: string): OrchestraSection {
  if (instruments.length === 0) {
    return {
      directory: dirPath, instruments: [],
      avgTuning: 0, avgTiming: 0, avgHarmony: 0, avgSoloQuality: 0,
      virtuosoCount: 0, toneDeafCount: 0,
      sectionType: 'solo-stage', condition: 'cacophony',
    }
  }

  const n = instruments.length
  const avgTuning = Math.round(instruments.reduce((s, i) => s + i.tuning, 0) / n)
  const avgTiming = Math.round(instruments.reduce((s, i) => s + i.timing, 0) / n)
  const avgHarmony = Math.round(instruments.reduce((s, i) => s + i.harmony, 0) / n)
  const avgSoloQuality = Math.round(instruments.reduce((s, i) => s + i.soloQuality, 0) / n)
  const virtuosoCount = instruments.filter(i => i.condition === 'virtuoso' || i.condition === 'first-chair').length
  const toneDeafCount = instruments.filter(i => i.condition === 'tone-deaf' || i.condition === 'beginner').length

  const sectionType = classifySectionType(instruments)
  const avgScore = Math.round(instruments.reduce((s, i) => s + i.qualityScore, 0) / n)
  const condition = classifySectionCondition(avgScore)

  return {
    directory: dirPath, instruments,
    avgTuning, avgTiming, avgHarmony, avgSoloQuality,
    virtuosoCount, toneDeafCount, sectionType, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate orchestra pit recommendations
 * @example
 * generateRecommendations(instruments, sections, symphony, stats) // string[]
 */
export function generateRecommendations(
  _instruments: InstrumentPart[],
  _sections: OrchestraSection[],
  _symphony: Symphony,
  stats: OrchestraPitStats,
): string[] {
  void _instruments
  void _sections
  void _symphony
  const recs: string[] = []

  if (stats.toneDeafCount > 0) {
    recs.push(`Tone-deaf instruments: ${stats.toneDeafCount} files need fundamental quality improvement`)
  }
  if (stats.missedBeatCount > 5) {
    recs.push(`Missed beats: ${stats.missedBeatCount} error handling gaps in the ensemble`)
  }
  if (stats.overallHarmony >= 60) {
    recs.push('In harmony: modules coordinate well across the codebase')
  }
  if (stats.soloistCount > stats.totalFiles * 0.5) {
    recs.push('Too many soloists: consider better module integration')
  }
  if (stats.performanceReadyCount === 0 && stats.totalFiles > 0) {
    recs.push('No instruments performance-ready: add error handling and type safety')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete orchestra pit result from files and contents
 * @example
 * buildOrchestraPitResult(['a.ts'], ['export function a() {}'], {}) // OrchestraPitResult
 */
export function buildOrchestraPitResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): OrchestraPitResult {
  void options

  const instruments: InstrumentPart[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeInstrumentPart(content, file)
    } catch {
      return analyzeInstrumentPart('', file)
    }
  })

  const dirMap = new Map<string, InstrumentPart[]>()
  for (const inst of instruments) {
    const dir = inst.file.includes('/') ? inst.file.slice(0, inst.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(inst) } else { dirMap.set(dir, [inst]) }
  }

  const sections: OrchestraSection[] = Array.from(dirMap.entries()).map(([dir, is]) =>
    analyzeOrchestraSection(is, dir),
  )

  const n = instruments.length || 1
  const avgTuning = Math.round(instruments.reduce((s, i) => s + i.tuning, 0) / n)
  const avgTiming = Math.round(instruments.reduce((s, i) => s + i.timing, 0) / n)
  const avgHarmony = Math.round(instruments.reduce((s, i) => s + i.harmony, 0) / n)
  const avgSoloQuality = Math.round(instruments.reduce((s, i) => s + i.soloQuality, 0) / n)
  const avgConductorClarity = Math.round(instruments.reduce((s, i) => s + i.conductorClarity, 0) / n)

  const overallHarmony = Math.min(100, Math.max(0, Math.round(
    avgTuning * 0.2 +
    avgTiming * 0.2 +
    avgHarmony * 0.2 +
    avgSoloQuality * 0.2 +
    avgConductorClarity * 0.2,
  )))

  const isInTune = overallHarmony >= 50

  const symphony: Symphony = {
    avgTuning, avgTiming, avgHarmony, avgSoloQuality, avgConductorClarity,
    isInTune, overallHarmony,
  }

  const firstInstrument = instruments[0]
  const stats: OrchestraPitStats = {
    totalFiles: files.length,
    totalSections: sections.length,
    avgTuning,
    avgTiming,
    avgDynamics: Math.round(instruments.reduce((s, i) => s + i.dynamics, 0) / n),
    avgHarmony,
    avgSoloQuality,
    avgConductorClarity,
    virtuosoCount: instruments.filter(i => i.condition === 'virtuoso').length,
    firstChairCount: instruments.filter(i => i.condition === 'first-chair').length,
    sectionPlayerCount: instruments.filter(i => i.condition === 'section-player').length,
    amateurCount: instruments.filter(i => i.condition === 'amateur').length,
    beginnerCount: instruments.filter(i => i.condition === 'beginner').length,
    toneDeafCount: instruments.filter(i => i.condition === 'tone-deaf').length,
    stringsCount: instruments.filter(i => i.instrument.type === 'strings').length,
    woodwindsCount: instruments.filter(i => i.instrument.type === 'woodwinds').length,
    brassCount: instruments.filter(i => i.instrument.type === 'brass').length,
    percussionCount: instruments.filter(i => i.instrument.type === 'percussion').length,
    keyboardsCount: instruments.filter(i => i.instrument.type === 'keyboards').length,
    vocalsCount: instruments.filter(i => i.instrument.type === 'vocals').length,
    tunedCount: instruments.filter(i => i.instrument.isTuned).length,
    steadyBeatCount: instruments.filter(i => i.rhythm.isSteadyBeat).length,
    missedBeatCount: instruments.reduce((s, i) => s + i.rhythm.missedBeatCount, 0),
    hasDynamicsCount: instruments.filter(i => i.dynamicsObj.hasPianissimo).length,
    inSectionCount: instruments.filter(i => i.ensemble.isInSection).length,
    soloistCount: instruments.filter(i => i.ensemble.isSoloist).length,
    rehearsedCount: instruments.filter(i => i.performance.isRehearsed).length,
    performanceReadyCount: instruments.filter(i => i.performance.performanceReady).length,
    overallHarmony,
    maestroGrade: classifyMaestroGrade(overallHarmony),
    bestInstrument: instruments.length > 0 && firstInstrument
      ? instruments.reduce((a, b) => b.qualityScore > a.qualityScore ? b : a, firstInstrument).file : 'none',
    worstInstrument: instruments.length > 0 && firstInstrument
      ? instruments.reduce((a, b) => b.qualityScore < a.qualityScore ? b : a, firstInstrument).file : 'none',
    bestTuned: instruments.length > 0 && firstInstrument
      ? instruments.reduce((a, b) => b.tuning > a.tuning ? b : a, firstInstrument).file : 'none',
    bestTimed: instruments.length > 0 && firstInstrument
      ? instruments.reduce((a, b) => b.timing > a.timing ? b : a, firstInstrument).file : 'none',
    bestDynamic: instruments.length > 0 && firstInstrument
      ? instruments.reduce((a, b) => b.dynamics > a.dynamics ? b : a, firstInstrument).file : 'none',
  }

  const recommendations = generateRecommendations(instruments, sections, symphony, stats)

  return { instruments, sections, symphony, stats, recommendations }
}
