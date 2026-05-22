// ─── Regex Constants ────────────────────────────────────────────────────────

const EXPORT_REGEX = /\bexport\s+/g
const IMPORT_REGEX = /\bimport\s+/g
const FUNCTION_REGEX = /\bfunction\s+\w+/g
const ARROW_REGEX = /(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g
const CLASS_REGEX = /\bclass\s+\w+/g
const INTERFACE_REGEX = /\binterface\s+\w+/g
const TYPE_REGEX = /\btype\s+\w+/g
const ENUM_REGEX = /\benum\s+\w+/g
const JSDOC_REGEX = /\/\*\*[\s\S]*?\*\//g
const ASYNC_REGEX = /\basync\s+/g
const TRY_CATCH_REGEX = /\btry\s*\{/g
const DEEP_NESTED_REGEX = /\{[^{}]*\{[^{}]*\{[^{}]*\}/g
const CONSOLE_REGEX = /\bconsole\.\w+/g
const TODO_REGEX = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi
const GENERICS_REGEX = /<[^>]+>/g
const PRIVATE_REGEX = /private\s+/g
const PROTECTED_REGEX = /protected\s+/g
const ANY_REGEX = /\bany\b/g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g

// ─── Helper Functions ───────────────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

function countImportKeywords(content: string): number { return countMatches(content, IMPORT_REGEX) }
function countExportKeywords(content: string): number { return countMatches(content, EXPORT_REGEX) }
function countClassKeywords(content: string): number { return countMatches(content, CLASS_REGEX) }
function countInterfaceKeywords(content: string): number { return countMatches(content, INTERFACE_REGEX) }
function countTypeKeywords(content: string): number { return countMatches(content, TYPE_REGEX) }
function countEnumKeywords(content: string): number { return countMatches(content, ENUM_REGEX) }
function countFunctionKeywords(content: string): number { return countMatches(content, FUNCTION_REGEX) }
function countArrowFunctions(content: string): number { return countMatches(content, ARROW_REGEX) }
function countJSDocBlocks(content: string): number { return countMatches(content, JSDOC_REGEX) }
function countAsyncKeywords(content: string): number { return countMatches(content, ASYNC_REGEX) }
function countTryCatch(content: string): number { return countMatches(content, TRY_CATCH_REGEX) }
function countDeepNested(content: string): number { return countMatches(content, DEEP_NESTED_REGEX) }
function countConsoleUsage(content: string): number { return countMatches(content, CONSOLE_REGEX) }
function countTodoComments(content: string): number { return countMatches(content, TODO_REGEX) }
function countGenericsUsage(content: string): number { return countMatches(content, GENERICS_REGEX) }
function countPrivateMembers(content: string): number { return countMatches(content, PRIVATE_REGEX) }
function countProtectedMembers(content: string): number { return countMatches(content, PROTECTED_REGEX) }
function countAnyUsage(content: string): number { return countMatches(content, ANY_REGEX) }
function countCommentedCode(content: string): number { return countMatches(content, COMMENTED_CODE_REGEX) }
function countReExports(content: string): number { return countMatches(content, REEXPORT_REGEX) }

function genericsCount_safe(content: string): number { return countMatches(content, GENERICS_REGEX) }
function reExportCount_safe(content: string): number { return countMatches(content, REEXPORT_REGEX) }
function enumCount_safe(content: string): number { return countMatches(content, ENUM_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface GlowMeasure {
  intensity: number
  brightness: 'beacon' | 'bright' | 'steady' | 'dim' | 'flickering' | 'dark'
  hasHighIntensity: boolean
  hasProperIllumination: boolean
  hasNoDarkSpots: boolean
  hasEvenLight: boolean
  hasProperDiffusion: boolean
  hasNoGlare: boolean
  hasClearBeam: boolean
  hasNoShadow: boolean
  hasWarmTone: boolean
  hasNoHarshLight: boolean
  darkSpotCount: number
  shadowCount: number
}

export interface WarmthMeasure {
  level: number
  quality: 'hearth' | 'campfire' | 'candle' | 'match' | 'ember' | 'cold'
  hasHighWarmth: boolean
  hasWelcoming: boolean
  hasApproachable: boolean
  hasNoHostility: boolean
  hasComfortable: boolean
  hasInviting: boolean
  hasNoIntimidation: boolean
  hasGentle: boolean
  hasNoRejection: boolean
  hasNurturing: boolean
  hasNoColdness: boolean
  hostilityCount: number
  intimidationCount: number
}

export interface GuidanceMeasure {
  quality: number
  type: 'lighthouse' | 'waypoint' | 'trail-marker' | 'signpost' | 'cairn' | 'no-guide'
  hasHighGuidance: boolean
  hasClearDirections: boolean
  hasProperSignage: boolean
  hasNoAmbiguity: boolean
  hasPathway: boolean
  hasWarning: boolean
  hasNoMisdirection: boolean
  hasLandmark: boolean
  hasNoBlindAlley: boolean
  hasProperMapping: boolean
  hasNoLostTravelers: boolean
  ambiguityCount: number
  misdirectionCount: number
}

export interface StabilityMeasure {
  level: number
  state: 'rock-steady' | 'stable' | 'mostly-stable' | 'wavering' | 'unstable' | 'extinguished'
  hasHighStability: boolean
  hasConsistentFlame: boolean
  hasNoFlickering: boolean
  hasWindResistance: boolean
  hasNoGuttering: boolean
  hasFuelReserve: boolean
  hasNoSputtering: boolean
  hasProperDraft: boolean
  hasNoBlowout: boolean
  hasSelfRelighting: boolean
  hasNoBurnout: boolean
  flickeringCount: number
  blowoutCount: number
}

export interface ReachMeasure {
  distance: number
  range: 'lighthouse-beam' | 'lantern-range' | 'candle-glow' | 'match-flare' | 'spark' | 'none'
  hasHighReach: boolean
  hasWideIllumination: boolean
  hasDistantVisibility: boolean
  hasNoObscurity: boolean
  hasProperProjection: boolean
  hasNoDiminishing: boolean
  hasLongRange: boolean
  hasNoLocalOnly: boolean
  hasProperSpread: boolean
  hasNoIsolation: boolean
  hasBeacon: boolean
  obscuringCount: number
  isolationCount: number
}

export interface CraftsmanshipMeasure {
  quality: number
  make: 'royal-lantern' | 'masterwork' | 'artisan' | 'functional' | 'hasty' | 'broken'
  hasHighCraftsmanship: boolean
  hasProperConstruction: boolean
  hasNoDefects: boolean
  hasProperMaterials: boolean
  hasBeautifulDesign: boolean
  hasNoShoddyWork: boolean
  hasProperFinish: boolean
  hasDurable: boolean
  hasNoFragility: boolean
  hasLegacy: boolean
  hasTimeless: boolean
  defectCount: number
  shoddyCount: number
}

export interface LanternFlame {
  file: string
  glowIntensity: number
  lanternWarmth: number
  guidanceQuality: number
  flameStability: number
  lightReach: number
  lanternCraftsmanship: number
  glow: GlowMeasure
  warmth: WarmthMeasure
  guidance: GuidanceMeasure
  stability: StabilityMeasure
  reach: ReachMeasure
  craftsmanship: CraftsmanshipMeasure
  condition: 'sky-lantern' | 'stone-lantern' | 'paper-lantern' | 'oil-lamp' | 'candle-stub' | 'extinguished'
  qualityScore: number
}

export interface LanternProcession {
  directory: string
  flames: LanternFlame[]
  avgGlow: number
  avgStability: number
  avgCraftsmanship: number
  skyLanternCount: number
  extinguishedCount: number
  highIntensityCount: number
  stableCount: number
  processionType: 'festival-of-lights' | 'lantern-parade' | 'guided-tour' | 'night-walk' | 'dark-alley' | 'blackout'
  condition: 'floating-festival' | 'illuminated-path' | 'twilight-walk' | 'dim-corridor' | 'dark-tunnel' | 'void'
}

export interface LanternGlowResult {
  flames: LanternFlame[]
  processions: LanternProcession[]
  night: {
    avgGlow: number
    avgStability: number
    avgCraftsmanship: number
    isIlluminated: boolean
    overallIllumination: number
  }
  stats: {
    totalFiles: number
    totalProcessions: number
    avgGlowIntensity: number
    avgLanternWarmth: number
    avgGuidanceQuality: number
    avgFlameStability: number
    avgLightReach: number
    avgLanternCraftsmanship: number
    skyLanternCount: number
    stoneLanternCount: number
    paperLanternCount: number
    oilLampCount: number
    candleStubCount: number
    extinguishedCount: number
    hasHighIntensityCount: number
    hasHighWarmthCount: number
    hasHighGuidanceCount: number
    hasHighStabilityCount: number
    hasHighReachCount: number
    hasHighCraftsmanshipCount: number
    overallIllumination: number
    lanternKeeperGrade: 'grand-master' | 'master-keeper' | 'lantern-keeper' | 'attendant' | 'apprentice' | 'darkness-dweller'
    bestFlame: string
    brightest: string
    warmest: string
    bestGuided: string
    mostStable: string
    farthestReach: string
  }
  recommendations: string[]
}

// ─── Glow Measurement ───────────────────────────────────────────────────────

/** @example measureGlow(content) returns glow analysis */
export function measureGlow(content: string): GlowMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)
  const privateCount = countPrivateMembers(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let intensity = 20
  if (hasStructure) intensity += 12
  if (hasTypes) intensity += 12
  if (hasFunctions) intensity += 10
  if (jsdocCount > 0) intensity += 10
  if (exportCount > 0) intensity += 8
  if (importCount > 0) intensity += 5
  if (genericsCount > 0) intensity += 5
  if (anyCount === 0) intensity += 5
  if (consoleCount === 0) intensity += 5
  if (deepNestedCount === 0) intensity += 5
  if (privateCount === 0) intensity += 3
  intensity = Math.min(100, Math.max(0, Math.round(intensity)))

  const darkSpotCount = consoleCount + anyCount
  const shadowCount = deepNestedCount + privateCount

  const hasHighIntensity = intensity >= 75 && hasStructure && hasTypes
  const hasProperIllumination = hasStructure && hasTypes && hasFunctions
  const hasNoDarkSpots = darkSpotCount === 0
  const hasEvenLight = exportCount > 0 && importCount > 0
  const hasProperDiffusion = hasStructure && hasTypes && genericsCount > 0
  const hasNoGlare = anyCount === 0
  const hasClearBeam = hasFunctions && exportCount > 0
  const hasNoShadow = shadowCount === 0
  const hasWarmTone = jsdocCount > 0 && genericsCount > 0
  const hasNoHarshLight = consoleCount === 0 && deepNestedCount === 0

  let brightness: GlowMeasure['brightness'] = 'dark'
  if (hasHighIntensity && hasNoDarkSpots && hasNoShadow && hasProperDiffusion) brightness = 'beacon'
  else if (hasHighIntensity && hasNoDarkSpots) brightness = 'bright'
  else if (hasHighIntensity) brightness = 'steady'
  else if (hasProperIllumination && hasClearBeam) brightness = 'dim'
  else if (intensity > 30) brightness = 'flickering'

  return {
    intensity, brightness, hasHighIntensity, hasProperIllumination,
    hasNoDarkSpots, hasEvenLight, hasProperDiffusion, hasNoGlare,
    hasClearBeam, hasNoShadow, hasWarmTone, hasNoHarshLight,
    darkSpotCount, shadowCount,
  }
}

// ─── Warmth Measurement ─────────────────────────────────────────────────────

/** @example measureWarmth(content) returns warmth analysis */
export function measureWarmth(content: string): WarmthMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 20
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 8
  if (exportCount > 0) level += 8
  if (importCount > 0) level += 5
  if (genericsCount > 0) level += 5
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  if (todoCount === 0) level += 5
  if (commentedCodeCount === 0) level += 5
  level = Math.min(100, Math.max(0, Math.round(level)))

  const hostilityCount = anyCount + consoleCount
  const intimidationCount = todoCount + commentedCodeCount

  const hasHighWarmth = level >= 75 && hasStructure && hasTypes
  const hasWelcoming = hasStructure && hasTypes && exportCount > 0
  const hasApproachable = hasStructure && hasTypes && hasFunctions
  const hasNoHostility = hostilityCount === 0
  const hasComfortable = hasFunctions && jsdocCount > 0
  const hasInviting = hasStructure && hasTypes && genericsCount > 0
  const hasNoIntimidation = intimidationCount === 0
  const hasGentle = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoRejection = anyCount === 0 && todoCount === 0
  const hasNurturing = hasStructure && hasTypes && jsdocCount > 0
  const hasNoColdness = consoleCount === 0 && commentedCodeCount === 0

  let quality: WarmthMeasure['quality'] = 'cold'
  if (hasHighWarmth && hasNoHostility && hasNoIntimidation && hasInviting) quality = 'hearth'
  else if (hasHighWarmth && hasNoHostility) quality = 'campfire'
  else if (hasHighWarmth) quality = 'candle'
  else if (hasApproachable && hasWelcoming) quality = 'match'
  else if (level > 30) quality = 'ember'

  return {
    level, quality, hasHighWarmth, hasWelcoming, hasApproachable,
    hasNoHostility, hasComfortable, hasInviting, hasNoIntimidation,
    hasGentle, hasNoRejection, hasNurturing, hasNoColdness,
    hostilityCount, intimidationCount,
  }
}

// ─── Guidance Measurement ───────────────────────────────────────────────────

/** @example measureGuidance(content) returns guidance analysis */
export function measureGuidance(content: string): GuidanceMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const enumCount = countEnumKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let qualityVal = 20
  if (hasStructure) qualityVal += 10
  if (hasTypes) qualityVal += 10
  if (hasFunctions) qualityVal += 10
  if (jsdocCount > 0) qualityVal += 8
  if (enumCount > 0) qualityVal += 5
  if (genericsCount > 0) qualityVal += 5
  if (exportCount > 0) qualityVal += 8
  if (importCount > 0) qualityVal += 5
  if (anyCount === 0) qualityVal += 5
  if (consoleCount === 0) qualityVal += 5
  if (deepNestedCount === 0) qualityVal += 5
  if (commentedCodeCount === 0) qualityVal += 4
  qualityVal = Math.min(100, Math.max(0, Math.round(qualityVal)))

  const ambiguityCount = consoleCount + anyCount
  const misdirectionCount = deepNestedCount + commentedCodeCount

  const hasHighGuidance = qualityVal >= 75 && hasStructure && hasTypes
  const hasClearDirections = hasStructure && hasTypes && hasFunctions
  const hasProperSignage = jsdocCount > 0 && genericsCount > 0
  const hasNoAmbiguity = ambiguityCount === 0
  const hasPathway = exportCount > 0 && importCount > 0
  const hasWarning = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoMisdirection = misdirectionCount === 0
  const hasLandmark = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasNoBlindAlley = deepNestedCount === 0 && consoleCount === 0
  const hasProperMapping = hasFunctions && exportCount > 0
  const hasNoLostTravelers = importCount > 0 && jsdocCount > 0

  let guidanceType: GuidanceMeasure['type'] = 'no-guide'
  if (hasHighGuidance && hasNoAmbiguity && hasNoMisdirection && hasLandmark) guidanceType = 'lighthouse'
  else if (hasHighGuidance && hasNoAmbiguity) guidanceType = 'waypoint'
  else if (hasHighGuidance) guidanceType = 'trail-marker'
  else if (hasClearDirections && hasProperSignage) guidanceType = 'signpost'
  else if (qualityVal > 30) guidanceType = 'cairn'

  return {
    quality: qualityVal, type: guidanceType, hasHighGuidance, hasClearDirections,
    hasProperSignage, hasNoAmbiguity, hasPathway, hasWarning, hasNoMisdirection,
    hasLandmark, hasNoBlindAlley, hasProperMapping, hasNoLostTravelers,
    ambiguityCount, misdirectionCount,
  }
}

// ─── Stability Measurement ──────────────────────────────────────────────────

/** @example measureStability(content) returns stability analysis */
export function measureStability(content: string): StabilityMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 20
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 8
  if (tryCatchCount > 0) level += 8
  if (genericsCount > 0) level += 5
  if (exportCount > 0) level += 5
  if (importCount > 0) level += 5
  if (asyncCount > 0) level += 5
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  level = Math.min(100, Math.max(0, Math.round(level)))

  const flickeringCount = todoCount + anyCount
  const blowoutCount = deepNestedCount

  const hasHighStability = level >= 75 && hasStructure && hasTypes
  const hasConsistentFlame = hasStructure && hasTypes && hasFunctions
  const hasNoFlickering = flickeringCount === 0
  const hasWindResistance = tryCatchCount > 0 && asyncCount > 0
  const hasNoGuttering = consoleCount === 0
  const hasFuelReserve = hasStructure && hasTypes && genericsCount > 0
  const hasNoSputtering = todoCount === 0
  const hasProperDraft = hasFunctions && exportCount > 0
  const hasNoBlowout = blowoutCount === 0
  const hasSelfRelighting = tryCatchCount > 0 && jsdocCount > 0
  const hasNoBurnout = deepNestedCount === 0 && consoleCount === 0

  let state: StabilityMeasure['state'] = 'extinguished'
  if (hasHighStability && hasNoFlickering && hasNoBlowout && hasWindResistance) state = 'rock-steady'
  else if (hasHighStability && hasNoFlickering) state = 'stable'
  else if (hasHighStability) state = 'mostly-stable'
  else if (hasConsistentFlame && hasProperDraft) state = 'wavering'
  else if (level > 30) state = 'unstable'

  return {
    level, state, hasHighStability, hasConsistentFlame, hasNoFlickering,
    hasWindResistance, hasNoGuttering, hasFuelReserve, hasNoSputtering,
    hasProperDraft, hasNoBlowout, hasSelfRelighting, hasNoBurnout,
    flickeringCount, blowoutCount,
  }
}

// ─── Reach Measurement ──────────────────────────────────────────────────────

/** @example measureReach(content) returns reach analysis */
export function measureReach(content: string): ReachMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)
  const privateCount = countPrivateMembers(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let distance = 20
  if (hasStructure) distance += 10
  if (hasTypes) distance += 10
  if (hasFunctions) distance += 10
  if (jsdocCount > 0) distance += 8
  if (exportCount > 0) distance += 8
  if (importCount > 0) distance += 5
  if (genericsCount > 0) distance += 5
  if (anyCount === 0) distance += 5
  if (consoleCount === 0) distance += 5
  if (deepNestedCount === 0) distance += 5
  if (commentedCodeCount === 0) distance += 4
  if (privateCount === 0) distance += 5
  distance = Math.min(100, Math.max(0, Math.round(distance)))

  const obscuringCount = consoleCount + anyCount
  const isolationCount = privateCount + deepNestedCount

  const hasHighReach = distance >= 75 && hasStructure && hasTypes
  const hasWideIllumination = hasStructure && hasTypes && genericsCount > 0
  const hasDistantVisibility = exportCount > 0 && importCount > 0
  const hasNoObscurity = obscuringCount === 0
  const hasProperProjection = hasFunctions && jsdocCount > 0
  const hasNoDiminishing = consoleCount === 0 && commentedCodeCount === 0
  const hasLongRange = hasStructure && hasTypes && exportCount > 0
  const hasNoLocalOnly = privateCount === 0 && deepNestedCount === 0
  const hasProperSpread = hasFunctions && exportCount > 0
  const hasNoIsolation = isolationCount === 0
  const hasBeacon = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0

  let range: ReachMeasure['range'] = 'none'
  if (hasHighReach && hasNoObscurity && hasNoIsolation && hasWideIllumination) range = 'lighthouse-beam'
  else if (hasHighReach && hasNoObscurity) range = 'lantern-range'
  else if (hasHighReach) range = 'candle-glow'
  else if (hasProperSpread && hasDistantVisibility) range = 'match-flare'
  else if (distance > 30) range = 'spark'

  return {
    distance, range, hasHighReach, hasWideIllumination, hasDistantVisibility,
    hasNoObscurity, hasProperProjection, hasNoDiminishing, hasLongRange,
    hasNoLocalOnly, hasProperSpread, hasNoIsolation, hasBeacon,
    obscuringCount, isolationCount,
  }
}

// ─── Craftsmanship Measurement ──────────────────────────────────────────────

/** @example measureCraftsmanship(content) returns craftsmanship analysis */
export function measureCraftsmanship(content: string): CraftsmanshipMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let qualityVal = 20
  if (hasStructure) qualityVal += 12
  if (hasTypes) qualityVal += 12
  if (hasFunctions) qualityVal += 10
  if (jsdocCount > 0) qualityVal += 8
  if (exportCount > 0) qualityVal += 8
  if (genericsCount > 0) qualityVal += 5
  if (importCount > 0) qualityVal += 5
  if (anyCount === 0) qualityVal += 5
  if (consoleCount === 0) qualityVal += 5
  if (todoCount === 0) qualityVal += 5
  if (deepNestedCount === 0) qualityVal += 5
  qualityVal = Math.min(100, Math.max(0, Math.round(qualityVal)))

  const defectCount = anyCount + todoCount
  const shoddyCount = deepNestedCount + commentedCodeCount

  const hasHighCraftsmanship = qualityVal >= 75 && hasStructure && hasTypes
  const hasProperConstruction = hasStructure && hasTypes && hasFunctions
  const hasNoDefects = defectCount === 0
  const hasProperMaterials = importCount > 0 && exportCount > 0
  const hasBeautifulDesign = hasStructure && hasTypes && jsdocCount > 0
  const hasNoShoddyWork = shoddyCount === 0
  const hasProperFinish = hasFunctions && genericsCount > 0
  const hasDurable = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoFragility = deepNestedCount === 0 && consoleCount === 0
  const hasLegacy = reExportCount_safe(content) > 0 || enumCount_safe(content) > 0
  const hasTimeless = hasStructure && hasTypes && jsdocCount > 0 && genericsCount > 0

  let make: CraftsmanshipMeasure['make'] = 'broken'
  if (hasHighCraftsmanship && hasNoDefects && hasNoShoddyWork && hasTimeless) make = 'royal-lantern'
  else if (hasHighCraftsmanship && hasNoDefects) make = 'masterwork'
  else if (hasHighCraftsmanship) make = 'artisan'
  else if (hasProperConstruction && hasProperMaterials) make = 'functional'
  else if (qualityVal > 30) make = 'hasty'

  return {
    quality: qualityVal, make, hasHighCraftsmanship, hasProperConstruction,
    hasNoDefects, hasProperMaterials, hasBeautifulDesign, hasNoShoddyWork,
    hasProperFinish, hasDurable, hasNoFragility, hasLegacy, hasTimeless,
    defectCount, shoddyCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(flame) returns condition string */
export function classifyCondition(flame: LanternFlame): LanternFlame['condition'] {
  const { qualityScore } = flame
  if (qualityScore >= 80) return 'sky-lantern'
  if (qualityScore >= 65) return 'stone-lantern'
  if (qualityScore >= 50) return 'paper-lantern'
  if (qualityScore >= 35) return 'oil-lamp'
  if (qualityScore >= 20) return 'candle-stub'
  return 'extinguished'
}

// ─── Flame Analysis ─────────────────────────────────────────────────────────

/** @example analyzeLanternFlame(content, filePath) returns full flame */
export function analyzeLanternFlame(content: string, filePath: string): LanternFlame {
  const glow = measureGlow(content)
  const warmth = measureWarmth(content)
  const guidance = measureGuidance(content)
  const stability = measureStability(content)
  const reach = measureReach(content)
  const craftsmanship = measureCraftsmanship(content)

  const glowIntensity = glow.intensity
  const lanternWarmth = warmth.level
  const guidanceQuality = guidance.quality
  const flameStability = stability.level
  const lightReach = reach.distance
  const lanternCraftsmanship = craftsmanship.quality

  const qualityScore = Math.round(
    glowIntensity * 0.15 +
    lanternWarmth * 0.15 +
    guidanceQuality * 0.15 +
    flameStability * 0.2 +
    lightReach * 0.15 +
    lanternCraftsmanship * 0.2,
  )

  const result: LanternFlame = {
    file: filePath,
    glowIntensity, lanternWarmth, guidanceQuality, flameStability,
    lightReach, lanternCraftsmanship,
    glow, warmth, guidance, stability, reach, craftsmanship,
    condition: 'extinguished',
    qualityScore,
  }

  result.condition = classifyCondition(result)

  return result
}

// ─── Procession Analysis ────────────────────────────────────────────────────

/** @example analyzeLanternProcession(flames, dirPath) returns procession */
export function analyzeLanternProcession(flames: LanternFlame[], dirPath: string): LanternProcession {
  if (flames.length === 0) {
    return {
      directory: dirPath, flames: [], avgGlow: 0, avgStability: 0, avgCraftsmanship: 0,
      skyLanternCount: 0, extinguishedCount: 0, highIntensityCount: 0, stableCount: 0,
      processionType: 'blackout', condition: 'void',
    }
  }

  const avgGlow = Math.round(flames.reduce((s, f) => s + f.glowIntensity, 0) / flames.length)
  const avgStability = Math.round(flames.reduce((s, f) => s + f.flameStability, 0) / flames.length)
  const avgCraftsmanship = Math.round(flames.reduce((s, f) => s + f.lanternCraftsmanship, 0) / flames.length)

  const skyLanternCount = flames.filter((f) => f.condition === 'sky-lantern').length
  const extinguishedCount = flames.filter((f) => f.condition === 'extinguished').length
  const highIntensityCount = flames.filter((f) => f.glow.hasHighIntensity).length
  const stableCount = flames.filter((f) => f.stability.hasHighStability).length

  const processionType = classifyProcessionType(flames)
  const avgScore = flames.reduce((s, f) => s + f.qualityScore, 0) / flames.length
  const condition = classifyProcessionCondition(avgScore)

  return {
    directory: dirPath, flames, avgGlow, avgStability, avgCraftsmanship,
    skyLanternCount, extinguishedCount, highIntensityCount, stableCount,
    processionType, condition,
  }
}

// ─── Procession Classification ──────────────────────────────────────────────

/** @example classifyProcessionType(flames) returns procession type */
export function classifyProcessionType(flames: LanternFlame[]): LanternProcession['processionType'] {
  if (flames.length === 0) return 'blackout'
  const avgScore = flames.reduce((s, f) => s + f.qualityScore, 0) / flames.length
  const skyCnt = flames.filter((f) => f.condition === 'sky-lantern').length
  if (avgScore >= 75 && skyCnt >= Math.ceil(flames.length * 0.3)) return 'festival-of-lights'
  if (avgScore >= 60) return 'lantern-parade'
  if (avgScore >= 45) return 'guided-tour'
  if (avgScore >= 30) return 'night-walk'
  if (avgScore >= 15) return 'dark-alley'
  return 'blackout'
}

/** @example classifyProcessionCondition(avgScore) returns condition */
export function classifyProcessionCondition(avgScore: number): LanternProcession['condition'] {
  if (avgScore >= 80) return 'floating-festival'
  if (avgScore >= 65) return 'illuminated-path'
  if (avgScore >= 50) return 'twilight-walk'
  if (avgScore >= 35) return 'dim-corridor'
  if (avgScore >= 20) return 'dark-tunnel'
  return 'void'
}

/** @example classifyLanternKeeperGrade(avgIllumination) returns grade */
export function classifyLanternKeeperGrade(avgIllumination: number): LanternGlowResult['stats']['lanternKeeperGrade'] {
  if (avgIllumination >= 80) return 'grand-master'
  if (avgIllumination >= 65) return 'master-keeper'
  if (avgIllumination >= 50) return 'lantern-keeper'
  if (avgIllumination >= 35) return 'attendant'
  if (avgIllumination >= 20) return 'apprentice'
  return 'darkness-dweller'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(flames, processions, night, stats) returns recommendations */
export function generateRecommendations(
  flames: LanternFlame[],
  processions: LanternProcession[],
  night: LanternGlowResult['night'],
  stats: LanternGlowResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgGlowIntensity < 50) recs.push('Increase glow intensity — let your code shine brighter')
  if (stats.avgLanternWarmth < 50) recs.push('Warm your lantern — make code more approachable and friendly')
  if (stats.avgGuidanceQuality < 50) recs.push('Improve guidance — add clearer documentation and directions')
  if (stats.avgFlameStability < 50) recs.push('Stabilize your flame — improve error handling and reliability')
  if (stats.avgLightReach < 50) recs.push('Extend light reach — broaden the impact of your code')
  if (stats.avgLanternCraftsmanship < 50) recs.push('Refine craftsmanship — eliminate defects and improve quality')
  if (stats.extinguishedCount > flames.length * 0.5) recs.push('Too many extinguished flames — over half the codebase is in darkness')
  if (stats.hasHighCraftsmanshipCount === 0) recs.push('No masterwork lanterns found — tend your craft with patience')
  if (processions.length > 0 && night.overallIllumination < 60) recs.push('Overall illumination is low — consult the grand master')
  if (recs.length === 0) recs.push('Magnificent illumination achieved — your lanterns light the way for all travelers')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildLanternGlowResult(files, contents, options) returns full result */
export function buildLanternGlowResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): LanternGlowResult {
  const flames: LanternFlame[] = files.map((file, i) =>
    analyzeLanternFlame(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, LanternFlame[]>()
  for (const flame of flames) {
    const dir = flame.file.includes('/')
      ? flame.file.substring(0, flame.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(flame)
    } else {
      dirMap.set(dir, [flame])
    }
  }

  const processions: LanternProcession[] = Array.from(dirMap.entries()).map(([dir, dirFlames]) =>
    analyzeLanternProcession(dirFlames, dir),
  )

  const avgGlow = flames.length > 0
    ? Math.round(flames.reduce((s, f) => s + f.glowIntensity, 0) / flames.length)
    : 0
  const avgStability = flames.length > 0
    ? Math.round(flames.reduce((s, f) => s + f.flameStability, 0) / flames.length)
    : 0
  const avgCraftsmanship = flames.length > 0
    ? Math.round(flames.reduce((s, f) => s + f.lanternCraftsmanship, 0) / flames.length)
    : 0
  const overallIllumination = flames.length > 0
    ? Math.round(flames.reduce((s, f) => s + f.qualityScore, 0) / flames.length)
    : 0
  const isIlluminated = overallIllumination >= 65

  const night: LanternGlowResult['night'] = {
    avgGlow, avgStability, avgCraftsmanship, isIlluminated, overallIllumination,
  }

  const avgGlowIntensity = avgGlow
  const avgLanternWarmth = flames.length > 0
    ? Math.round(flames.reduce((s, f) => s + f.lanternWarmth, 0) / flames.length)
    : 0
  const avgGuidanceQuality = flames.length > 0
    ? Math.round(flames.reduce((s, f) => s + f.guidanceQuality, 0) / flames.length)
    : 0
  const avgFlameStability = avgStability
  const avgLightReach = flames.length > 0
    ? Math.round(flames.reduce((s, f) => s + f.lightReach, 0) / flames.length)
    : 0
  const avgLanternCraftsmanship = avgCraftsmanship

  const conditionCounts = {
    skyLantern: 0, stoneLantern: 0, paperLantern: 0,
    oilLamp: 0, candleStub: 0, extinguished: 0,
  }
  for (const f of flames) {
    switch (f.condition) {
      case 'sky-lantern': conditionCounts.skyLantern++; break
      case 'stone-lantern': conditionCounts.stoneLantern++; break
      case 'paper-lantern': conditionCounts.paperLantern++; break
      case 'oil-lamp': conditionCounts.oilLamp++; break
      case 'candle-stub': conditionCounts.candleStub++; break
      case 'extinguished': conditionCounts.extinguished++; break
    }
  }

  const hasHighIntensityCount = flames.filter((f) => f.glow.hasHighIntensity).length
  const hasHighWarmthCount = flames.filter((f) => f.warmth.hasHighWarmth).length
  const hasHighGuidanceCount = flames.filter((f) => f.guidance.hasHighGuidance).length
  const hasHighStabilityCount = flames.filter((f) => f.stability.hasHighStability).length
  const hasHighReachCount = flames.filter((f) => f.reach.hasHighReach).length
  const hasHighCraftsmanshipCount = flames.filter((f) => f.craftsmanship.hasHighCraftsmanship).length

  const bestFlame = flames.length > 0
    ? flames.reduce((best, f) => f.qualityScore > best.qualityScore ? f : best).file
    : ''
  const brightest = flames.length > 0
    ? flames.reduce((best, f) => f.glowIntensity > best.glowIntensity ? f : best).file
    : ''
  const warmest = flames.length > 0
    ? flames.reduce((best, f) => f.lanternWarmth > best.lanternWarmth ? f : best).file
    : ''
  const bestGuided = flames.length > 0
    ? flames.reduce((best, f) => f.guidanceQuality > best.guidanceQuality ? f : best).file
    : ''
  const mostStable = flames.length > 0
    ? flames.reduce((best, f) => f.flameStability > best.flameStability ? f : best).file
    : ''
  const farthestReach = flames.length > 0
    ? flames.reduce((best, f) => f.lightReach > best.lightReach ? f : best).file
    : ''

  const lanternKeeperGrade = classifyLanternKeeperGrade(overallIllumination)

  const stats: LanternGlowResult['stats'] = {
    totalFiles: files.length, totalProcessions: processions.length,
    avgGlowIntensity, avgLanternWarmth, avgGuidanceQuality,
    avgFlameStability, avgLightReach, avgLanternCraftsmanship,
    skyLanternCount: conditionCounts.skyLantern,
    stoneLanternCount: conditionCounts.stoneLantern,
    paperLanternCount: conditionCounts.paperLantern,
    oilLampCount: conditionCounts.oilLamp,
    candleStubCount: conditionCounts.candleStub,
    extinguishedCount: conditionCounts.extinguished,
    hasHighIntensityCount, hasHighWarmthCount, hasHighGuidanceCount,
    hasHighStabilityCount, hasHighReachCount, hasHighCraftsmanshipCount,
    overallIllumination, lanternKeeperGrade,
    bestFlame, brightest, warmest,
    bestGuided, mostStable, farthestReach,
  }

  const recommendations = generateRecommendations(flames, processions, night, stats)

  return { flames, processions, night, stats, recommendations }
}
