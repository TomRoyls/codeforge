// ─── Interfaces ──────────────────────────────────────────

export interface VoiceMeasure {
  projection: number
  range: 'whisper' | 'conversation' | 'presentation' | 'oration' | 'shout' | 'silence'
  isClear: boolean
  hasGoodDiction: boolean
  hasProperProjection: boolean
  hasVocalRange: boolean
  hasResonance: boolean
  hasProjection: boolean
  hasClarity: boolean
  hasVolume: boolean
  hasWhisper: boolean
  hasMumble: boolean
  mumbleCount: number
}

export interface ResonanceMeasure {
  quality: number
  frequency: number
  hasNaturalFrequency: boolean
  hasHarmonicResonance: boolean
  hasConstructiveInterference: boolean
  hasDestructiveInterference: boolean
  hasReverb: boolean
  hasEcho: boolean
  hasFeedback: boolean
  hasStandingWave: boolean
  hasDamping: boolean
  interferenceCount: number
}

export interface ReachMeasure {
  audience: number
  coverage: 'front-row' | 'orchestra' | 'mezzanine' | 'balcony' | 'nosebleed' | 'parking-lot'
  isAccessible: boolean
  hasUniversalAccess: boolean
  hasGoodSightLines: boolean
  hasComfortableSeating: boolean
  hasProgramNotes: boolean
  hasTranslation: boolean
  hasCaptions: boolean
  hasAudioDescription: boolean
  hasWheelchairAccess: boolean
  programNoteCount: number
}

export interface PresenceMeasure {
  quality: number
  performer: 'virtuoso' | 'soloist' | 'ensemble' | 'chorus' | 'understudy' | 'audience-member'
  hasStagePresence: boolean
  hasDramaticFlair: boolean
  hasImprovisation: boolean
  hasMemorablePerformance: boolean
  hasEncore: boolean
  hasCurtainCall: boolean
  hasProgram: boolean
  hasRehearsal: boolean
  hasDressRehearsal: boolean
  hasOpeningNight: boolean
}

export interface EchoMeasure {
  quality: number
  hasCleanEcho: boolean
  hasFlutterEcho: boolean
  hasReverberation: boolean
  hasDelay: boolean
  hasPrecedenceEffect: boolean
  hasSoundShadow: boolean
  hasAcousticShadow: boolean
  hasReflection: boolean
  hasDiffusion: boolean
  hasAbsorption: boolean
  shadowCount: number
}

export interface ArchitectureMeasure {
  acoustics: number
  style: 'roman' | 'greek' | 'modern' | 'baroque' | 'renaissance' | 'temporary'
  hasOptimalShape: boolean
  hasProperMaterials: boolean
  hasGoodGeometry: boolean
  hasAcousticShell: boolean
  hasSoundBoard: boolean
  hasDiffusers: boolean
  hasAbsorbers: boolean
  hasReflectors: boolean
  hasBassTraps: boolean
  hasIsolation: boolean
  trapCount: number
}

export interface AcousticReading {
  file: string
  voiceProjection: number
  acousticResonance: number
  audienceReach: number
  stagePresence: number
  echoQuality: number
  architecturalAcoustics: number
  voice: VoiceMeasure
  resonance: ResonanceMeasure
  reach: ReachMeasure
  presence: PresenceMeasure
  echo: EchoMeasure
  architecture: ArchitectureMeasure
  condition: 'carnegie-hall' | 'sydney-opera' | 'royal-albert' | 'local-theater' | 'school-auditorium' | 'echo-chamber'
  qualityScore: number
}

export interface AcousticVenue {
  directory: string
  readings: AcousticReading[]
  avgVoiceProjection: number
  avgResonance: number
  avgStagePresence: number
  carnegieHallCount: number
  echoChamberCount: number
  clearVoiceCount: number
  accessibleCount: number
  venueType: 'opera-house' | 'concert-hall' | 'recital-hall' | 'outdoor-stage' | 'basement' | 'closet'
  condition: 'world-class' | 'premium' | 'professional' | 'amateur' | 'hobby' | 'disastrous'
}

export interface FestivalMeasure {
  avgVoiceProjection: number
  avgResonance: number
  avgStagePresence: number
  isHarmonious: boolean
  overallAcoustics: number
}

export interface AmphitheaterAcousticsStats {
  totalFiles: number
  totalVenues: number
  avgVoiceProjection: number
  avgAcousticResonance: number
  avgAudienceReach: number
  avgStagePresence: number
  avgEchoQuality: number
  avgArchitecturalAcoustics: number
  carnegieHallCount: number
  sydneyOperaCount: number
  royalAlbertCount: number
  localTheaterCount: number
  schoolAuditoriumCount: number
  echoChamberCount: number
  isClearCount: number
  hasGoodDictionCount: number
  hasMumbleCount: number
  hasHarmonicResonanceCount: number
  hasDestructiveInterferenceCount: number
  isAccessibleCount: number
  hasProgramNotesCount: number
  hasStagePresenceCount: number
  hasRehearsalCount: number
  hasCleanEchoCount: number
  hasSoundShadowCount: number
  hasOptimalShapeCount: number
  hasIsolationCount: number
  overallAcoustics: number
  acousticianGrade: 'master-acoustician' | 'sound-engineer' | 'audio-engineer' | 'sound-technician' | 'roadie' | 'tone-deaf'
  bestReading: string
  clearestVoice: string
  bestResonance: string
  widestReach: string
  bestPresence: string
}

export interface AmphitheaterAcousticsResult {
  readings: AcousticReading[]
  venues: AcousticVenue[]
  festival: FestivalMeasure
  stats: AmphitheaterAcousticsStats
  recommendations: string[]
}

// ─── Counting Utilities ─────────────────────────────────

/**
 * Count non-empty lines
 * @example
 * countLoc('const a = 1\n\nconst b = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count function declarations
 * @example
 * countFunctions('function foo() {}') // 1
 */
export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

/**
 * Count class declarations
 * @example
 * countClasses('class Foo {}') // 1
 */
export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

/**
 * Count interface declarations
 * @example
 * countInterfaces('interface Foo {}') // 1
 */
export function countInterfaces(content: string): number {
  const m = content.match(/\binterface\s+\w+/g)
  return m ? m.length : 0
}

/**
 * Count type aliases
 * @example
 * countTypes('type Foo = string') // 1
 */
export function countTypes(content: string): number {
  const m = content.match(/\btype\s+\w+\s*=/g)
  return m ? m.length : 0
}

/**
 * Count enum declarations
 * @example
 * countEnums('enum Dir { Up, Down }') // 1
 */
export function countEnums(content: string): number {
  const m = content.match(/\benum\s+\w+/g)
  return m ? m.length : 0
}

/**
 * Count export statements
 * @example
 * countExports('export const a = 1') // 1
 */
export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

/**
 * Count import statements
 * @example
 * countImports("import { foo } from 'bar'") // 1
 */
export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

/**
 * Count JSDoc blocks
 * @example
 * countJSDoc('const x = 1') // 0
 */
export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

/**
 * Count all comments
 * @example
 * countComments('const a = 1 // inline') // 1
 */
export function countComments(content: string): number {
  const line = (content.match(/\/\/.*/g) || []).length
  const block = (content.match(/\/\*[\s\S]*?\*\//g) || []).length
  return line + block
}

/**
 * Count error handling keywords
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  const m = content.match(/\b(catch|finally|throw)\b/g)
  return m ? m.length : 0
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:number|string|boolean|void|any|unknown|never|object)\b/g)
  return m ? m.length : 0
}

/**
 * Count TODO markers
 * @example
 * countTodos('// TODO: fix') // 1
 */
export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b/gi)
  return m ? m.length : 0
}

/**
 * Count console calls
 * @example
 * countConsole('console.log("hi")') // 1
 */
export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

/**
 * Count branches
 * @example
 * countBranches('if (x) {}') // 1
 */
export function countBranches(content: string): number {
  const ifs = (content.match(/\bif\b/g) || []).length
  const switches = (content.match(/\bswitch\b/g) || []).length
  const ternaries = (content.match(/\?\s*[^;:]*\s*:/g) || []).length
  return ifs + switches + ternaries
}

/**
 * Count descriptive names
 * @example
 * countDescriptiveNames('function getData() {}') // 1
 */
export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

/**
 * Count default keywords
 * @example
 * countDefaults('export default class {}') // 1
 */
export function countDefaults(content: string): number {
  const m = content.match(/\bdefault\b/g)
  return m ? m.length : 0
}

/**
 * Count deprecated markers
 * @example
 * countDeprecated('@deprecated use new') // 1
 */
export function countDeprecated(content: string): number {
  const m = content.match(/\bdeprecated\b|\@deprecated/gi)
  return m ? m.length : 0
}

/**
 * Count return type annotations
 * @example
 * countReturnTypes('function foo(): string {}') // 1
 */
export function countReturnTypes(content: string): number {
  const m = content.match(/\)\s*:\s*\w+/g)
  return m ? m.length : 0
}

/**
 * Count generic type parameters
 * @example
 * countGenerics('function foo<T>() {}') // 1
 */
export function countGenerics(content: string): number {
  const m = content.match(/<\w+>/g)
  return m ? m.length : 0
}

/**
 * Count arrow functions
 * @example
 * countArrowFunctions('const f = () => 1') // 1
 */
export function countArrowFunctions(content: string): number {
  const m = content.match(/=>/g)
  return m ? m.length : 0
}

/**
 * Count async keywords
 * @example
 * countAsync('async function foo() {}') // 1
 */
export function countAsync(content: string): number {
  const m = content.match(/\basync\b/g)
  return m ? m.length : 0
}

/**
 * Count await keywords
 * @example
 * countAwait('await foo()') // 1
 */
export function countAwait(content: string): number {
  const m = content.match(/\bawait\b/g)
  return m ? m.length : 0
}

// ─── Voice Measurement ──────────────────────────────────

/**
 * Measure API clarity and projection
 * @example
 * measureVoice('export function add(a: number, b: number): number {}') // { projection, range, isClear, ... }
 */
export function measureVoice(content: string): VoiceMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const returns = countReturnTypes(content)
  const descriptives = countDescriptiveNames(content)
  const functions = countFunctions(content)
  const todos = countTodos(content)
  const consoleCalls = countConsole(content)

  const projection = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (returns > 0 ? 15 : 0) +
    (descriptives > 0 ? 15 : 0) +
    (functions > 0 ? 10 : 0) +
    (countInterfaces(content) > 0 ? 10 : 0) +
    (todos === 0 ? 5 : 0),
  )))

  const isClear = exports > 0 && types > 0
  const hasGoodDiction = descriptives > 0 && functions > 0
  const hasProperProjection = exports > 0 && countImports(content) > 0
  const hasVocalRange = countAsync(content) > 0 || countGenerics(content) > 0
  const hasResonance = countInterfaces(content) > 0 && types > 0
  const hasProjection = exports > 0
  const hasClarity = types > 0 && descriptives > 0
  const hasVolume = functions > 0 || countClasses(content) > 0
  const hasWhisper = countPrivateMembers(content) > 0
  const mumbleCount = todos + consoleCalls
  const hasMumble = mumbleCount > 0

  let range: VoiceMeasure['range'] = 'silence'
  if (projection >= 80) range = 'oration'
  else if (projection >= 60) range = 'presentation'
  else if (projection >= 40) range = 'conversation'
  else if (projection >= 20) range = 'whisper'
  else if (loc > 0) range = 'shout'

  return {
    projection, range, isClear, hasGoodDiction, hasProperProjection,
    hasVocalRange, hasResonance, hasProjection, hasClarity, hasVolume,
    hasWhisper, hasMumble, mumbleCount,
  }
}

/**
 * Count private members
 * @example
 * countPrivateMembers('private x: number') // 1
 */
export function countPrivateMembers(content: string): number {
  const m = content.match(/\bprivate\s+\w+/g)
  return m ? m.length : 0
}

// ─── Resonance Measurement ──────────────────────────────

/**
 * Measure code feedback quality
 * @example
 * measureResonance('try { foo() } catch(e) { handle(e) }') // { quality, frequency, ... }
 */
export function measureResonance(content: string): ResonanceMeasure {
  const loc = countLoc(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const returns = countReturnTypes(content)
  const defaults = countDefaults(content)
  const deprecated = countDeprecated(content)
  const todos = countTodos(content)

  const quality = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 20 : 0) +
    (types > 0 ? 15 : 0) +
    (exports > 0 ? 15 : 0) +
    (returns > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (defaults > 0 ? 5 : 0) +
    (functions > 0 ? 5 : 0),
  )))

  const frequency = loc === 0 ? 5 : Math.min(100, Math.max(0, Math.round(
    (functions * 5) +
    (errors * 8) +
    (returns * 3) +
    (countBranches(content) * 2),
  )))

  const hasNaturalFrequency = defaults > 0 || countInterfaces(content) > 0
  const hasHarmonicResonance = exports > 0 && types > 0 && errors > 0
  const hasConstructiveInterference = countImports(content) > 0 && exports > 0
  const interferenceCount = deprecated + todos
  const hasDestructiveInterference = interferenceCount > 2
  const hasReverb = countAsync(content) > 0 || countAwait(content) > 0
  const hasEcho = countBranches(content) > 2
  const hasFeedback = errors > 0 && returns > 0
  const hasStandingWave = countInterfaces(content) > 0 && exports > 0
  const hasDamping = errors > 0 && countBranches(content) > 0

  return {
    quality, frequency, hasNaturalFrequency, hasHarmonicResonance,
    hasConstructiveInterference, hasDestructiveInterference,
    hasReverb, hasEcho, hasFeedback, hasStandingWave, hasDamping,
    interferenceCount,
  }
}

// ─── Reach Measurement ──────────────────────────────────

/**
 * Measure code accessibility
 * @example
 * measureReach('export function add(a: number, b: number): number {}') // { audience, coverage, ... }
 */
export function measureReach(content: string): ReachMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const descriptives = countDescriptiveNames(content)
  const returns = countReturnTypes(content)

  const audience = loc === 0 ? 5 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 25 : 0) +
    (comments > 0 ? 10 : 0) +
    (types > 0 ? 15 : 0) +
    (descriptives > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (returns > 0 ? 10 : 0) +
    (countImports(content) > 0 ? 10 : 0) +
    (countErrorHandling(content) > 0 ? 5 : 0),
  )))

  const isAccessible = exports > 0 && types > 0
  const hasUniversalAccess = countInterfaces(content) > 0 && exports > 0
  const hasGoodSightLines = countImports(content) > 0 && exports > 0
  const hasComfortableSeating = descriptives > 0 && jsdoc > 0
  const programNoteCount = jsdoc
  const hasProgramNotes = jsdoc > 0
  const hasTranslation = countGenerics(content) > 0
  const hasCaptions = comments > 0 && jsdoc === 0
  const hasAudioDescription = descriptives > 0
  const hasWheelchairAccess = countErrorHandling(content) > 0

  let coverage: ReachMeasure['coverage'] = 'parking-lot'
  if (audience >= 80) coverage = 'front-row'
  else if (audience >= 60) coverage = 'orchestra'
  else if (audience >= 40) coverage = 'mezzanine'
  else if (audience >= 20) coverage = 'balcony'
  else if (audience >= 10) coverage = 'nosebleed'

  return {
    audience, coverage, isAccessible, hasUniversalAccess,
    hasGoodSightLines, hasComfortableSeating, hasProgramNotes,
    hasTranslation, hasCaptions, hasAudioDescription, hasWheelchairAccess,
    programNoteCount,
  }
}

// ─── Presence Measurement ───────────────────────────────

/**
 * Measure documentation quality
 * @example
 * measurePresence('const x = 1') // { quality, performer, ... }
 */
export function measurePresence(content: string): PresenceMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const errors = countErrorHandling(content)
  const descriptives = countDescriptiveNames(content)

  const quality = loc === 0 ? 5 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 30 : 0) +
    (comments > 0 ? 10 : 0) +
    (types > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (errors > 0 ? 10 : 0) +
    (descriptives > 0 ? 15 : 0) +
    (countReturnTypes(content) > 0 ? 10 : 0),
  )))

  const hasStagePresence = jsdoc >= 3
  const hasDramaticFlair = jsdoc > 0 && descriptives > 0
  const hasImprovisation = errors > 0 && countBranches(content) > 0
  const hasMemorablePerformance = exports > 0 && jsdoc > 0 && types > 0
  const hasEncore = countGenerics(content) > 0 || countAsync(content) > 0
  const hasCurtainCall = errors > 0 && countDefaults(content) > 0
  const hasProgram = jsdoc > 0
  const hasRehearsal = jsdoc > 0 && countFunctions(content) > 0
  const hasDressRehearsal = errors > 0 && jsdoc > 0
  const hasOpeningNight = exports > 0 && types > 0 && jsdoc > 0

  let performer: PresenceMeasure['performer'] = 'audience-member'
  if (quality >= 80 && hasStagePresence) performer = 'virtuoso'
  else if (quality >= 60 && jsdoc > 0) performer = 'soloist'
  else if (quality >= 45 && exports > 0) performer = 'ensemble'
  else if (quality >= 30 && types > 0) performer = 'chorus'
  else if (quality >= 15) performer = 'understudy'

  return {
    quality, performer, hasStagePresence, hasDramaticFlair,
    hasImprovisation, hasMemorablePerformance, hasEncore,
    hasCurtainCall, hasProgram, hasRehearsal, hasDressRehearsal,
    hasOpeningNight,
  }
}

// ─── Echo Measurement ───────────────────────────────────

/**
 * Measure code consistency
 * @example
 * measureEcho('import { a } from "x"\nexport { a }') // { quality, hasCleanEcho, ... }
 */
export function measureEcho(content: string): EchoMeasure {
  const loc = countLoc(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const branches = countBranches(content)

  const quality = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (imports > 0 && exports > 0 ? 20 : 0) +
    (Math.abs(imports - exports) <= 2 && imports > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (interfaces > 0 ? 10 : 0) +
    (errors > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (functions > 0 && branches < functions * 4 ? 10 : 0),
  )))

  const hasCleanEcho = imports > 0 && exports > 0 && Math.abs(imports - exports) <= 2
  const hasFlutterEcho = countAsync(content) > 0 || countGenerics(content) > 0
  const hasReverberation = classes > 0 && functions > 0
  const hasDelay = countAsync(content) > 0 || countAwait(content) > 0
  const hasPrecedenceEffect = exports > 0 && imports > 0
  const shadowCount = countTodos(content) + countDeprecated(content) + countConsole(content)
  const hasSoundShadow = shadowCount > 0
  const hasAcousticShadow = loc > 20 && exports === 0 && interfaces === 0
  const hasReflection = interfaces > 0 && exports > 0
  const hasDiffusion = functions > 0 && classes > 0 && interfaces > 0
  const hasAbsorption = errors > 0

  return {
    quality, hasCleanEcho, hasFlutterEcho, hasReverberation,
    hasDelay, hasPrecedenceEffect, hasSoundShadow, hasAcousticShadow,
    hasReflection, hasDiffusion, hasAbsorption, shadowCount,
  }
}

// ─── Architecture Measurement ───────────────────────────

/**
 * Measure structural quality
 * @example
 * measureArchitecture('interface Foo {} class Bar implements Foo {}') // { acoustics, style, ... }
 */
export function measureArchitecture(content: string): ArchitectureMeasure {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const errors = countErrorHandling(content)
  const generics = countGenerics(content)
  const jsdoc = countJSDoc(content)
  const returns = countReturnTypes(content)

  const acoustics = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 15 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (imports > 0 ? 10 : 0) +
    (errors > 0 ? 15 : 0) +
    (jsdoc > 0 ? 10 : 0) +
    (returns > 0 ? 10 : 0) +
    (generics > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 5 : 0),
  )))

  const hasOptimalShape = interfaces > 0 && exports > 0 && imports > 0
  const hasProperMaterials = types > 0 && generics > 0
  const hasGoodGeometry = imports > 0 && exports > 0
  const hasAcousticShell = errors > 0 && types > 0
  const hasSoundBoard = countDescriptiveNames(content) > 0 && jsdoc > 0
  const hasDiffusers = countClasses(content) > 0 && countFunctions(content) > 0 && interfaces > 0
  const hasAbsorbers = errors > 0
  const hasReflectors = interfaces > 0 && exports > 0
  const trapCount = countBranches(content) > countFunctions(content) * 5 && countFunctions(content) > 0 ? 1 : 0
  const hasBassTraps = trapCount > 0
  const hasIsolation = imports > 0 && exports > 0 && Math.abs(imports - exports) <= 3

  let style: ArchitectureMeasure['style'] = 'temporary'
  if (generics > 0 && interfaces > 0) style = 'roman'
  else if (interfaces > 0 && types > 3) style = 'greek'
  else if (errors > 0 && types > 0) style = 'modern'
  else if (countClasses(content) > 0 && generics > 0) style = 'baroque'
  else if (types > 0 && exports > 0) style = 'renaissance'

  return {
    acoustics, style, hasOptimalShape, hasProperMaterials,
    hasGoodGeometry, hasAcousticShell, hasSoundBoard, hasDiffusers,
    hasAbsorbers, hasReflectors, hasBassTraps, hasIsolation, trapCount,
  }
}

// ─── Reading Analysis ───────────────────────────────────

/**
 * Analyze a single file as an acoustic reading
 * @example
 * analyzeAcousticReading(content, filePath) // AcousticReading
 */
export function analyzeAcousticReading(content: string, filePath: string): AcousticReading {
  const voice = measureVoice(content)
  const resonance = measureResonance(content)
  const reach = measureReach(content)
  const presence = measurePresence(content)
  const echo = measureEcho(content)
  const architecture = measureArchitecture(content)

  const voiceProjection = voice.projection
  const acousticResonance = resonance.quality
  const audienceReach = reach.audience
  const stagePresence = presence.quality
  const echoQuality = echo.quality
  const architecturalAcoustics = architecture.acoustics

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (voiceProjection * 0.20) +
    (acousticResonance * 0.15) +
    (audienceReach * 0.15) +
    (stagePresence * 0.20) +
    (echoQuality * 0.15) +
    (architecturalAcoustics * 0.15),
  )))

  const condition = classifyReadingCondition(qualityScore, voice, presence)

  return {
    file: filePath,
    voiceProjection, acousticResonance, audienceReach,
    stagePresence, echoQuality, architecturalAcoustics,
    voice, resonance, reach, presence, echo, architecture,
    condition, qualityScore,
  }
}

/**
 * Classify reading condition
 * @example
 * classifyReadingCondition(90, voice, presence) // 'carnegie-hall'
 */
export function classifyReadingCondition(
  score: number,
  voice: VoiceMeasure,
  presence: PresenceMeasure,
): AcousticReading['condition'] {
  if (score >= 80 && voice.isClear && presence.hasOpeningNight) return 'carnegie-hall'
  if (score >= 65 && voice.hasGoodDiction) return 'sydney-opera'
  if (score >= 50) return 'royal-albert'
  if (score >= 35) return 'local-theater'
  if (score >= 20) return 'school-auditorium'
  return 'echo-chamber'
}

// ─── Venue Analysis ─────────────────────────────────────

/**
 * Analyze a directory as an acoustic venue
 * @example
 * analyzeAcousticVenue(readings, dirPath) // AcousticVenue
 */
export function analyzeAcousticVenue(readings: AcousticReading[], dirPath: string): AcousticVenue {
  const count = readings.length
  if (count === 0) {
    return {
      directory: dirPath, readings: [],
      avgVoiceProjection: 0, avgResonance: 0, avgStagePresence: 0,
      carnegieHallCount: 0, echoChamberCount: 0,
      clearVoiceCount: 0, accessibleCount: 0,
      venueType: 'closet', condition: 'disastrous',
    }
  }

  const avgVoiceProjection = Math.round(readings.reduce((s, r) => s + r.voiceProjection, 0) / count)
  const avgResonance = Math.round(readings.reduce((s, r) => s + r.acousticResonance, 0) / count)
  const avgStagePresence = Math.round(readings.reduce((s, r) => s + r.stagePresence, 0) / count)

  const carnegieHallCount = readings.filter(r => r.condition === 'carnegie-hall').length
  const echoChamberCount = readings.filter(r => r.condition === 'echo-chamber').length
  const clearVoiceCount = readings.filter(r => r.voice.isClear).length
  const accessibleCount = readings.filter(r => r.reach.isAccessible).length

  const venueType = classifyVenueType(readings, avgVoiceProjection)
  const condition = classifyVenueCondition(avgVoiceProjection)

  return {
    directory: dirPath, readings,
    avgVoiceProjection, avgResonance, avgStagePresence,
    carnegieHallCount, echoChamberCount, clearVoiceCount, accessibleCount,
    venueType, condition,
  }
}

/**
 * Classify venue type
 * @example
 * classifyVenueType(readings, 80) // 'opera-house'
 */
export function classifyVenueType(readings: AcousticReading[], avgVoice: number): AcousticVenue['venueType'] {
  if (readings.length === 0) return 'closet'
  const carnegieRatio = readings.filter(r => r.condition === 'carnegie-hall').length / readings.length
  const allGood = readings.every(r => r.qualityScore >= 50)

  if (carnegieRatio >= 0.5 && avgVoice >= 70) return 'opera-house'
  if (allGood && avgVoice >= 55) return 'concert-hall'
  if (avgVoice >= 45) return 'recital-hall'
  if (avgVoice >= 30) return 'outdoor-stage'
  if (avgVoice >= 15) return 'basement'
  return 'closet'
}

/**
 * Classify venue condition
 * @example
 * classifyVenueCondition(80) // 'world-class'
 */
export function classifyVenueCondition(avgVoice: number): AcousticVenue['condition'] {
  if (avgVoice >= 75) return 'world-class'
  if (avgVoice >= 60) return 'premium'
  if (avgVoice >= 45) return 'professional'
  if (avgVoice >= 30) return 'amateur'
  if (avgVoice >= 15) return 'hobby'
  return 'disastrous'
}

// ─── Acoustician Grade ──────────────────────────────────

/**
 * Classify acoustician grade
 * @example
 * classifyAcousticianGrade(90) // 'master-acoustician'
 */
export function classifyAcousticianGrade(avgAcoustics: number): AmphitheaterAcousticsStats['acousticianGrade'] {
  if (avgAcoustics >= 75) return 'master-acoustician'
  if (avgAcoustics >= 60) return 'sound-engineer'
  if (avgAcoustics >= 45) return 'audio-engineer'
  if (avgAcoustics >= 30) return 'sound-technician'
  if (avgAcoustics >= 15) return 'roadie'
  return 'tone-deaf'
}

// ─── Recommendations ────────────────────────────────────

/**
 * Generate acoustic recommendations
 * @example
 * generateRecommendations(readings, venues, festival, stats) // ['Add JSDoc...']
 */
export function generateRecommendations(
  readings: AcousticReading[],
  _venues: AcousticVenue[],
  _festival: FestivalMeasure,
  stats: AmphitheaterAcousticsStats,
): string[] {
  const recs: string[] = []

  if (stats.echoChamberCount > 0) {
    recs.push('Add exports, types, and documentation to improve echo-chamber files')
  }
  if (stats.hasMumbleCount > stats.totalFiles * 0.3) {
    recs.push('Remove TODOs and console calls to eliminate mumbling')
  }
  if (stats.avgVoiceProjection < 35) {
    recs.push('Export functions with clear type signatures for better voice projection')
  }
  if (stats.avgStagePresence < 35) {
    recs.push('Add JSDoc documentation and descriptive names for stronger stage presence')
  }
  if (stats.hasDestructiveInterferenceCount > stats.totalFiles * 0.3) {
    recs.push('Resolve deprecated markers and excessive TODOs to reduce destructive interference')
  }
  if (stats.hasSoundShadowCount > stats.totalFiles * 0.4) {
    recs.push('Address code smells to eliminate sound shadows')
  }
  if (stats.hasIsolationCount < stats.totalFiles * 0.3) {
    recs.push('Balance imports and exports for proper module isolation')
  }
  if (stats.avgArchitecturalAcoustics < 35) {
    recs.push('Add interfaces and error handling to improve architectural acoustics')
  }

  if (recs.length === 0) {
    recs.push('This amphitheater has exceptional acoustics — carry the sound forward')
  }

  return recs
}

// ─── Orchestrator ───────────────────────────────────────

/**
 * Build the full amphitheater acoustics result
 * @example
 * buildAmphitheaterAcousticsResult(files, contents, {}) // AmphitheaterAcousticsResult
 */
export function buildAmphitheaterAcousticsResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown> = {},
): AmphitheaterAcousticsResult {
  const readings: AcousticReading[] = files.map((file, i) =>
    analyzeAcousticReading(contents[i] ?? '', file),
  )

  const venueMap = new Map<string, AcousticReading[]>()
  for (const reading of readings) {
    const dir = reading.file.includes('/') ? reading.file.substring(0, reading.file.lastIndexOf('/')) : '.'
    const existing = venueMap.get(dir)
    if (existing) {
      existing.push(reading)
    } else {
      venueMap.set(dir, [reading])
    }
  }

  const venues: AcousticVenue[] = Array.from(venueMap.entries()).map(([dir, vReadings]) =>
    analyzeAcousticVenue(vReadings, dir),
  )

  const totalFiles = readings.length
  const avg = (fn: (r: AcousticReading) => number) =>
    totalFiles === 0 ? 0 : Math.round(readings.reduce((s, r) => s + fn(r), 0) / totalFiles)

  const overallAcoustics = avg(r => r.qualityScore)

  const festival: FestivalMeasure = {
    avgVoiceProjection: avg(r => r.voiceProjection),
    avgResonance: avg(r => r.acousticResonance),
    avgStagePresence: avg(r => r.stagePresence),
    isHarmonious: overallAcoustics >= 60,
    overallAcoustics,
  }

  const bestReading = readings.length > 0
    ? readings.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best, readings[0]).file
    : ''
  const clearestVoice = readings.length > 0
    ? readings.reduce((best, r) => r.voiceProjection > best.voiceProjection ? r : best, readings[0]).file
    : ''
  const bestResonance = readings.length > 0
    ? readings.reduce((best, r) => r.acousticResonance > best.acousticResonance ? r : best, readings[0]).file
    : ''
  const widestReach = readings.length > 0
    ? readings.reduce((best, r) => r.audienceReach > best.audienceReach ? r : best, readings[0]).file
    : ''
  const bestPresence = readings.length > 0
    ? readings.reduce((best, r) => r.stagePresence > best.stagePresence ? r : best, readings[0]).file
    : ''

  const stats: AmphitheaterAcousticsStats = {
    totalFiles,
    totalVenues: venues.length,
    avgVoiceProjection: festival.avgVoiceProjection,
    avgAcousticResonance: festival.avgResonance,
    avgAudienceReach: avg(r => r.audienceReach),
    avgStagePresence: festival.avgStagePresence,
    avgEchoQuality: avg(r => r.echoQuality),
    avgArchitecturalAcoustics: avg(r => r.architecturalAcoustics),
    carnegieHallCount: readings.filter(r => r.condition === 'carnegie-hall').length,
    sydneyOperaCount: readings.filter(r => r.condition === 'sydney-opera').length,
    royalAlbertCount: readings.filter(r => r.condition === 'royal-albert').length,
    localTheaterCount: readings.filter(r => r.condition === 'local-theater').length,
    schoolAuditoriumCount: readings.filter(r => r.condition === 'school-auditorium').length,
    echoChamberCount: readings.filter(r => r.condition === 'echo-chamber').length,
    isClearCount: readings.filter(r => r.voice.isClear).length,
    hasGoodDictionCount: readings.filter(r => r.voice.hasGoodDiction).length,
    hasMumbleCount: readings.filter(r => r.voice.hasMumble).length,
    hasHarmonicResonanceCount: readings.filter(r => r.resonance.hasHarmonicResonance).length,
    hasDestructiveInterferenceCount: readings.filter(r => r.resonance.hasDestructiveInterference).length,
    isAccessibleCount: readings.filter(r => r.reach.isAccessible).length,
    hasProgramNotesCount: readings.filter(r => r.reach.hasProgramNotes).length,
    hasStagePresenceCount: readings.filter(r => r.presence.hasStagePresence).length,
    hasRehearsalCount: readings.filter(r => r.presence.hasRehearsal).length,
    hasCleanEchoCount: readings.filter(r => r.echo.hasCleanEcho).length,
    hasSoundShadowCount: readings.filter(r => r.echo.hasSoundShadow).length,
    hasOptimalShapeCount: readings.filter(r => r.architecture.hasOptimalShape).length,
    hasIsolationCount: readings.filter(r => r.architecture.hasIsolation).length,
    overallAcoustics,
    acousticianGrade: classifyAcousticianGrade(overallAcoustics),
    bestReading, clearestVoice, bestResonance, widestReach, bestPresence,
  }

  const recommendations = generateRecommendations(readings, venues, festival, stats)

  return { readings, venues, festival, stats, recommendations }
}
