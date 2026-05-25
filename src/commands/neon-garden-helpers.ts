// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Light = 'blinding-brilliance' | 'bright-glow' | 'proper-radiance' | 'dim-flicker' | 'dark-shadow' | 'no-light'
export type Pulse = 'alive-with-energy' | 'vibrant-structure' | 'proper-rhythm' | 'dormant-structure' | 'dead-framework' | 'no-pulse'
export type Glow = 'steady-beacon' | 'consistent-light' | 'proper-glow' | 'flickering-bulb' | 'intermittent' | 'no-glow'
export type Garden = 'kaleidoscope' | 'varied-garden' | 'proper-mix' | 'monoculture' | 'single-plant' | 'no-diversity'
export type Root = 'fiber-optic-roots' | 'glowing-foundation' | 'proper-illumination' | 'dim-base' | 'dark-roots' | 'no-brightness'
export type NeonCondition = 'neon-masterpiece' | 'luminous-garden' | 'proper-glow' | 'dim-bed' | 'dark-patch' | 'barren-soil'
export type BedType = 'bioluminescent-paradise' | 'glowing-garden' | 'proper-bed' | 'dim-plot' | 'dark-corner' | 'no-bed'
export type BedCondition = 'neon-eden' | 'luminous-paradise' | 'proper-garden' | 'dim-yard' | 'dark-patch' | 'void'
export type GardenerGrade = 'neon-botanist' | 'light-gardener' | 'skilled-cultivator' | 'apprentice' | 'novice' | 'mole'

export interface ShiningMeasure {
  luminosity: number
  light: Light
  hasHighLuminosity: boolean
  hasReadable: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasVisible: boolean
  hasNoInvisible: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasLuminous: boolean
  hasIlluminated: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface PulsingMeasure {
  vibrancy: number
  pulse: Pulse
  hasHighVibrancy: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasOrganized: boolean
  hasNoHaphazard: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasActive: boolean
  hasNoStagnant: boolean
  hasFresh: boolean
  hasNoStale: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasAlive: boolean
  chaoticCount: number
  stagnantCount: number
}

export interface RadiatingMeasure {
  consistency: number
  glow: Glow
  hasHighConsistency: boolean
  hasUniform: boolean
  hasNoMixed: boolean
  hasReliable: boolean
  hasNoFlaky: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasComplete: boolean
  untestedCount: number
  unsafeCount: number
}

export interface DiversifyingMeasure {
  diversity: number
  garden: Garden
  hasHighDiversity: boolean
  hasVaried: boolean
  hasNoMonotone: boolean
  hasExpressive: boolean
  hasNoFormulaic: boolean
  hasTypeHandling: boolean
  hasNoSinglePath: boolean
  hasFlexible: boolean
  hasNoRigid: boolean
  hasGeneric: boolean
  hasNoHardcoded: boolean
  hasAdaptive: boolean
  hasNoStatic: boolean
  hasColorful: boolean
  singlePathCount: number
  hardcodedCount: number
}

export interface GroundingMeasure {
  brightness: number
  root: Root
  hasHighBrightness: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasWellArchitected: boolean
  hasNoAdHoc: boolean
  hasPrincipled: boolean
  hasNoHacky: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasEstablished: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  undocumentedCount: number
  adHocCount: number
}

export interface NeonBloom {
  file: string
  luminosityQuality: number
  structureVibrancy: number
  glowConsistency: number
  bloomDiversity: number
  rootBrightness: number
  shining: ShiningMeasure
  pulsing: PulsingMeasure
  radiating: RadiatingMeasure
  diversifying: DiversifyingMeasure
  grounding: GroundingMeasure
  condition: NeonCondition
  qualityScore: number
}

export interface NeonBed {
  directory: string
  blooms: NeonBloom[]
  avgLuminosity: number
  avgVibrancy: number
  avgBrightness: number
  neonMasterpieceCount: number
  barrenSoilCount: number
  bedType: BedType
  condition: BedCondition
}

export interface NeonGardenResult {
  blooms: NeonBloom[]
  beds: NeonBed[]
  landscape: {
    avgLuminosity: number
    avgVibrancy: number
    avgBrightness: number
    isNeon: boolean
    overallBrilliance: number
  }
  stats: {
    totalFiles: number
    totalBeds: number
    avgLuminosityQuality: number
    avgStructureVibrancy: number
    avgGlowConsistency: number
    avgBloomDiversity: number
    avgRootBrightness: number
    neonMasterpieceCount: number
    luminousGardenCount: number
    properGlowCount: number
    dimBedCount: number
    darkPatchCount: number
    barrenSoilCount: number
    hasHighLuminosityCount: number
    hasHighVibrancyCount: number
    hasHighConsistencyCount: number
    hasHighDiversityCount: number
    hasHighBrightnessCount: number
    overallBrilliance: number
    gardenerGrade: GardenerGrade
    bestBloom: string
    brightest: string
    mostVibrant: string
    mostConsistent: string
    bestRooted: string
  }
  recommendations: string[]
}

// ─── Detectors ─────────────────────────────────────────────────────

function hasPattern(content: string, pattern: RegExp): boolean {
  return pattern.test(content)
}

function countPattern(content: string, pattern: RegExp): number {
  const matches = content.match(pattern)
  return matches ? matches.length : 0
}

// ─── measureShining ────────────────────────────────────────────────

/**
 * @example measureShining('export function calculateTotal(items: Item[]): Number')
 */
export function measureShining(content: string): ShiningMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasEnum = hasPattern(content, /\benum\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 6
  if (hasConst) score += 4
  if (hasReturnType) score += 8
  if (hasTypeAnnotation) score += 6
  if (hasDoc) score += 6
  if (hasInterface) score += 6
  if (hasNamed) score += 4
  if (hasGenerics) score += 4
  if (hasReadonly) score += 4
  if (hasEnum) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 4

  const luminosity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const crypticCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const obfuscatedCount = (hasVar > 0 ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    luminosity,
    light: classifyLight(luminosity),
    hasHighLuminosity: luminosity >= 80,
    hasReadable: hasReturnType && hasNamed,
    hasSelfDocumenting: hasReturnType && hasNamed,
    hasNoCryptic: !hasEval && !hasAny,
    hasClear: hasReturnType && !hasAny,
    hasNoObfuscated: !hasEval && !hasAny,
    hasTransparent: hasExport && !hasAny,
    hasNoHidden: !hasEval,
    hasVisible: hasExport,
    hasNoInvisible: !hasDebugger,
    hasUnderstandable: hasTypeAnnotation && hasConst,
    hasNoArcane: !hasEval && !hasAny,
    hasLuminous: hasDoc && hasExport && !hasAny,
    hasIlluminated: hasDoc && hasReturnType,
    crypticCount,
    obfuscatedCount,
  }
}

// ─── measurePulsing ────────────────────────────────────────────────

/**
 * @example measurePulsing('export interface Store<T> extends Base { get(key: string): T }')
 */
export function measurePulsing(content: string): PulsingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasArrow = hasPattern(content, /=>/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 4
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasClass) score += 4
  if (hasExtends) score += 4
  if (hasImplements) score += 4
  if (hasAsync) score += 4
  if (hasAwait) score += 4
  if (hasPipeline) score += 4
  if (hasArrow) score += 4
  if (hasGenerics) score += 4
  if (hasConst) score += 4
  if (hasAbstract) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 4

  const vibrancy = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const chaoticCount = (hasVar > 0 ? 1 : 0) + (hasEval ? 1 : 0)
  const stagnantCount = (hasDebugger ? 1 : 0) + (hasAny ? 1 : 0)

  return {
    vibrancy,
    pulse: classifyPulse(vibrancy),
    hasHighVibrancy: vibrancy >= 80,
    hasWellStructured: hasInterface && hasExport,
    hasNoChaotic: hasVar === 0 && !hasEval,
    hasOrganized: hasExport && hasConst,
    hasNoHaphazard: !hasEval && hasVar === 0,
    hasModular: hasExport && (hasInterface || hasType),
    hasNoMonolithic: !hasEval,
    hasActive: hasAsync || hasAwait,
    hasNoStagnant: !hasDebugger,
    hasFresh: hasPipeline || hasArrow,
    hasNoStale: hasVar === 0,
    hasDynamic: hasGenerics && hasPipeline,
    hasNoStatic: !hasAny,
    hasAlive: hasExport && hasConst && !hasAny,
    chaoticCount,
    stagnantCount,
  }
}

// ─── measureRadiating ──────────────────────────────────────────────

/**
 * @example measureRadiating('try { const x = parse(d) } catch { return null }')
 */
export function measureRadiating(content: string): RadiatingMeasure {
  let score = 0

  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasTryCatch) score += 6
  if (hasReturnType) score += 6
  if (hasTypeAnnotation) score += 4
  if (hasConst) score += 4
  if (hasExport) score += 4
  if (hasOptional) score += 6
  if (hasReadonly) score += 4
  if (hasGenerics) score += 4
  if (hasPrivate) score += 4
  if (hasInterface) score += 4
  if (hasAsync) score += 4
  if (hasDoc) score += 6

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 6

  const consistency = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const untestedCount = hasVar > 0 ? 1 : 0
  const unsafeCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  return {
    consistency,
    glow: classifyGlow(consistency),
    hasHighConsistency: consistency >= 80,
    hasUniform: hasReturnType && !hasAny,
    hasNoMixed: !hasEval && !hasAny,
    hasReliable: hasConst && !hasDebugger,
    hasNoFlaky: hasVar === 0 && !hasDebugger,
    hasConsistent: hasReturnType && hasConst,
    hasNoErratic: !hasEval,
    hasTested: hasTryCatch,
    hasNoUntested: hasVar === 0,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: hasVar === 0 && !hasAny,
    hasPolished: hasDoc && hasReturnType && !hasAny,
    hasNoRough: !hasEval && !hasDebugger,
    hasComplete: hasExport && hasReturnType && hasTryCatch,
    untestedCount,
    unsafeCount,
  }
}

// ─── measureDiversifying ───────────────────────────────────────────

/**
 * @example measureDiversifying('export interface Guard<T> { validate(i: T): Boolean }')
 */
export function measureDiversifying(content: string): DiversifyingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasUnion = hasPattern(content, /\|/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasArrow = hasPattern(content, /=>/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasExport) score += 4
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasClass) score += 4
  if (hasEnum) score += 4
  if (hasGenerics) score += 6
  if (hasOptional) score += 6
  if (hasUnion) score += 4
  if (hasReturnType) score += 4
  if (hasPipeline) score += 4
  if (hasArrow) score += 4
  if (hasAsync) score += 4
  if (hasConst) score += 4
  if (hasReadonly) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4

  const diversity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const singlePathCount = hasVar > 0 ? 1 : 0
  const hardcodedCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  return {
    diversity,
    garden: classifyGarden(diversity),
    hasHighDiversity: diversity >= 80,
    hasVaried: hasInterface && hasClass,
    hasNoMonotone: hasGenerics && !hasAny,
    hasExpressive: hasReturnType && hasOptional,
    hasNoFormulaic: !hasEval,
    hasTypeHandling: hasGenerics && hasOptional,
    hasNoSinglePath: hasVar === 0,
    hasFlexible: hasOptional && hasGenerics,
    hasNoRigid: !hasEval && !hasAny,
    hasGeneric: hasGenerics,
    hasNoHardcoded: !hasEval && !hasAny,
    hasAdaptive: hasGenerics && hasPipeline,
    hasNoStatic: !hasAny,
    hasColorful: hasEnum && hasInterface && hasGenerics,
    singlePathCount,
    hardcodedCount,
  }
}

// ─── measureGrounding ──────────────────────────────────────────────

/**
 * @example measureGrounding('/** docs *\\/ export class Store extends Base implements IStore {}')
 */
export function measureGrounding(content: string): GroundingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasDoc) score += 8
  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasInterface) score += 6
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 4
  if (hasTryCatch) score += 4
  if (hasReturnType) score += 4
  if (hasGenerics) score += 4
  if (hasClass) score += 4
  if (hasPrivate) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)

  const brightness = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const undocumentedCount = hasVar > 0 ? 1 : 0
  const adHocCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  return {
    brightness,
    root: classifyRoot(brightness),
    hasHighBrightness: brightness >= 80,
    hasDocumented: hasDoc,
    hasNoUndocumented: hasVar === 0,
    hasWellArchitected: hasInterface && hasExtends && !hasAny,
    hasNoAdHoc: hasVar === 0,
    hasPrincipled: hasAbstract || hasExtends,
    hasNoHacky: hasHackyCast === 0,
    hasMature: hasDoc && hasExport,
    hasNoNaive: !hasEval && !hasAny,
    hasProven: hasTryCatch && hasReturnType,
    hasNoExperimental: !hasAny,
    hasEstablished: hasExtends && hasImplements,
    hasPatterned: hasExtends || hasImplements,
    hasNoReinvented: !hasEval,
    undocumentedCount,
    adHocCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyLight(luminosity: number): Light {
  if (luminosity >= 90) return 'blinding-brilliance'
  if (luminosity >= 75) return 'bright-glow'
  if (luminosity >= 60) return 'proper-radiance'
  if (luminosity >= 40) return 'dim-flicker'
  if (luminosity >= 20) return 'dark-shadow'
  return 'no-light'
}

function classifyPulse(vibrancy: number): Pulse {
  if (vibrancy >= 90) return 'alive-with-energy'
  if (vibrancy >= 75) return 'vibrant-structure'
  if (vibrancy >= 60) return 'proper-rhythm'
  if (vibrancy >= 40) return 'dormant-structure'
  if (vibrancy >= 20) return 'dead-framework'
  return 'no-pulse'
}

function classifyGlow(consistency: number): Glow {
  if (consistency >= 90) return 'steady-beacon'
  if (consistency >= 75) return 'consistent-light'
  if (consistency >= 60) return 'proper-glow'
  if (consistency >= 40) return 'flickering-bulb'
  if (consistency >= 20) return 'intermittent'
  return 'no-glow'
}

function classifyGarden(diversity: number): Garden {
  if (diversity >= 90) return 'kaleidoscope'
  if (diversity >= 75) return 'varied-garden'
  if (diversity >= 60) return 'proper-mix'
  if (diversity >= 40) return 'monoculture'
  if (diversity >= 20) return 'single-plant'
  return 'no-diversity'
}

function classifyRoot(brightness: number): Root {
  if (brightness >= 90) return 'fiber-optic-roots'
  if (brightness >= 75) return 'glowing-foundation'
  if (brightness >= 60) return 'proper-illumination'
  if (brightness >= 40) return 'dim-base'
  if (brightness >= 20) return 'dark-roots'
  return 'no-brightness'
}

export function classifyNeonCondition(qualityScore: number): NeonCondition {
  if (qualityScore >= 90) return 'neon-masterpiece'
  if (qualityScore >= 75) return 'luminous-garden'
  if (qualityScore >= 60) return 'proper-glow'
  if (qualityScore >= 40) return 'dim-bed'
  if (qualityScore >= 20) return 'dark-patch'
  return 'barren-soil'
}

export function classifyBedType(blooms: NeonBloom[]): BedType {
  if (blooms.length === 0) return 'no-bed'
  const avgQs = blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length
  const masterpieceRatio = blooms.filter(b => b.condition === 'neon-masterpiece').length / blooms.length
  if (avgQs >= 85 && masterpieceRatio >= 0.5) return 'bioluminescent-paradise'
  if (avgQs >= 70 && masterpieceRatio >= 0.3) return 'glowing-garden'
  if (avgQs >= 55) return 'proper-bed'
  if (avgQs >= 35) return 'dim-plot'
  if (avgQs >= 15) return 'dark-corner'
  return 'no-bed'
}

export function classifyBedCondition(avgLuminosity: number): BedCondition {
  if (avgLuminosity >= 85) return 'neon-eden'
  if (avgLuminosity >= 70) return 'luminous-paradise'
  if (avgLuminosity >= 55) return 'proper-garden'
  if (avgLuminosity >= 35) return 'dim-yard'
  if (avgLuminosity >= 15) return 'dark-patch'
  return 'void'
}

export function classifyGardenerGrade(avgBrilliance: number): GardenerGrade {
  if (avgBrilliance >= 85) return 'neon-botanist'
  if (avgBrilliance >= 70) return 'light-gardener'
  if (avgBrilliance >= 55) return 'skilled-cultivator'
  if (avgBrilliance >= 40) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'mole'
}

// ─── analyzeNeonBloom ──────────────────────────────────────────────

/**
 * @example analyzeNeonBloom(content, 'src/foo.ts')
 */
export function analyzeNeonBloom(content: string, filePath: string): NeonBloom {
  const shining = measureShining(content)
  const pulsing = measurePulsing(content)
  const radiating = measureRadiating(content)
  const diversifying = measureDiversifying(content)
  const grounding = measureGrounding(content)

  const luminosityQuality = shining.luminosity
  const structureVibrancy = pulsing.vibrancy
  const glowConsistency = radiating.consistency
  const bloomDiversity = diversifying.diversity
  const rootBrightness = grounding.brightness

  const qualityScore = Math.round(
    luminosityQuality * 0.2 +
    structureVibrancy * 0.2 +
    glowConsistency * 0.2 +
    bloomDiversity * 0.2 +
    rootBrightness * 0.2,
  )

  return {
    file: filePath,
    luminosityQuality,
    structureVibrancy,
    glowConsistency,
    bloomDiversity,
    rootBrightness,
    shining,
    pulsing,
    radiating,
    diversifying,
    grounding,
    condition: classifyNeonCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeNeonBed ────────────────────────────────────────────────

/**
 * @example analyzeNeonBed(blooms, 'src')
 */
export function analyzeNeonBed(blooms: NeonBloom[], dirPath: string): NeonBed {
  if (blooms.length === 0) {
    return {
      directory: dirPath,
      blooms: [],
      avgLuminosity: 0,
      avgVibrancy: 0,
      avgBrightness: 0,
      neonMasterpieceCount: 0,
      barrenSoilCount: 0,
      bedType: 'no-bed',
      condition: 'void',
    }
  }

  const avgLuminosity = Math.round(blooms.reduce((s, b) => s + b.luminosityQuality, 0) / blooms.length)
  const avgVibrancy = Math.round(blooms.reduce((s, b) => s + b.structureVibrancy, 0) / blooms.length)
  const avgBrightness = Math.round(blooms.reduce((s, b) => s + b.rootBrightness, 0) / blooms.length)
  const neonMasterpieceCount = blooms.filter(b => b.condition === 'neon-masterpiece').length
  const barrenSoilCount = blooms.filter(b => b.condition === 'barren-soil').length

  return {
    directory: dirPath,
    blooms,
    avgLuminosity,
    avgVibrancy,
    avgBrightness,
    neonMasterpieceCount,
    barrenSoilCount,
    bedType: classifyBedType(blooms),
    condition: classifyBedCondition(avgLuminosity),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(blooms, beds, landscape, stats)
 */
export function generateRecommendations(
  blooms: NeonBloom[],
  beds: NeonBed[],
  landscape: NeonGardenResult['landscape'],
  stats: NeonGardenResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallBrilliance >= 85 && stats.barrenSoilCount === 0) {
    recs.push('Neon garden perfection — the garden blazes with bioluminescent brilliance')
    return recs
  }

  if (stats.avgLuminosityQuality < 60) {
    recs.push('Brighten the code — add return types, named exports, docs, remove eval and any')
  }
  if (stats.avgStructureVibrancy < 60) {
    recs.push('Enliven the structure — add interfaces, async/await, pipelines, generics, remove eval and var')
  }
  if (stats.avgGlowConsistency < 60) {
    recs.push('Steady the glow — add error handling, type safety, optionality, remove eval and debugger')
  }
  if (stats.avgBloomDiversity < 60) {
    recs.push('Diversify the garden — add generics, optionals, unions, enums, remove eval and any')
  }
  if (stats.avgRootBrightness < 60) {
    recs.push('Illuminate the roots — add documentation, abstractions, proven patterns, remove eval and any')
  }

  if (stats.barrenSoilCount > 0) {
    const barrenFiles = blooms.filter(b => b.condition === 'barren-soil').map(b => b.file)
    if (barrenFiles.length <= 3) {
      recs.push(`Barren soil detected: ${barrenFiles.join(', ')} — these need neon energy`)
    } else {
      recs.push(`${barrenFiles.length} barren files detected — they need neon energy`)
    }
  }

  if (beds.length > 1) {
    const dimBeds = beds.filter(b => b.condition === 'dim-yard' || b.condition === 'dark-patch')
    if (dimBeds.length > 0) {
      recs.push(`${dimBeds.length} bed(s) have dim or dark conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The neon garden holds steady — maintain current brilliance')
  }

  return recs
}

// ─── gatherFiles ───────────────────────────────────────────────────

/**
 * @example gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string,
  extensions: string[],
  ignorePatterns: string[],
): Promise<string[]> {
  try {
    const patterns = extensions.length > 0
      ? extensions.map(ext => `**/*${ext}`)
      : ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = Array.from(new Set([...defaultIgnore, ...ignorePatterns]))

    const files = await fg(patterns, {
      absolute: false,
      cwd: targetPath,
      ignore,
      onlyFiles: true,
    })

    return files.sort()
  } catch {
    return []
  }
}

// ─── buildNeonGardenResult ─────────────────────────────────────────

/**
 * @example buildNeonGardenResult(['a.ts'], [content])
 */
export async function buildNeonGardenResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<NeonGardenResult> {
  const blooms: NeonBloom[] = files.map((file, i) =>
    analyzeNeonBloom(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, NeonBloom[]>()
  for (const bloom of blooms) {
    const dir = path.dirname(bloom.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(bloom)
    } else {
      dirMap.set(dir, [bloom])
    }
  }

  const beds: NeonBed[] = Array.from(dirMap.entries()).map(([dir, dirBlooms]) =>
    analyzeNeonBed(dirBlooms, dir),
  )

  const avgLuminosityQuality = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.luminosityQuality, 0) / blooms.length)
    : 0
  const avgStructureVibrancy = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.structureVibrancy, 0) / blooms.length)
    : 0
  const avgGlowConsistency = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.glowConsistency, 0) / blooms.length)
    : 0
  const avgBloomDiversity = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.bloomDiversity, 0) / blooms.length)
    : 0
  const avgRootBrightness = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.rootBrightness, 0) / blooms.length)
    : 0

  const overallBrilliance = Math.round(
    (avgLuminosityQuality + avgStructureVibrancy + avgRootBrightness) / 3,
  )

  const landscape = {
    avgLuminosity: avgLuminosityQuality,
    avgVibrancy: avgStructureVibrancy,
    avgBrightness: avgRootBrightness,
    isNeon: overallBrilliance >= 80,
    overallBrilliance,
  }

  const bestBloom = blooms.length > 0
    ? blooms.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file
    : ''
  const brightest = blooms.length > 0
    ? blooms.reduce((best, b) => b.luminosityQuality > best.luminosityQuality ? b : best).file
    : ''
  const mostVibrant = blooms.length > 0
    ? blooms.reduce((best, b) => b.structureVibrancy > best.structureVibrancy ? b : best).file
    : ''
  const mostConsistent = blooms.length > 0
    ? blooms.reduce((best, b) => b.glowConsistency > best.glowConsistency ? b : best).file
    : ''
  const bestRooted = blooms.length > 0
    ? blooms.reduce((best, b) => b.rootBrightness > best.rootBrightness ? b : best).file
    : ''

  const stats = {
    totalFiles: blooms.length,
    totalBeds: beds.length,
    avgLuminosityQuality,
    avgStructureVibrancy,
    avgGlowConsistency,
    avgBloomDiversity,
    avgRootBrightness,
    neonMasterpieceCount: blooms.filter(b => b.condition === 'neon-masterpiece').length,
    luminousGardenCount: blooms.filter(b => b.condition === 'luminous-garden').length,
    properGlowCount: blooms.filter(b => b.condition === 'proper-glow').length,
    dimBedCount: blooms.filter(b => b.condition === 'dim-bed').length,
    darkPatchCount: blooms.filter(b => b.condition === 'dark-patch').length,
    barrenSoilCount: blooms.filter(b => b.condition === 'barren-soil').length,
    hasHighLuminosityCount: blooms.filter(b => b.shining.hasHighLuminosity).length,
    hasHighVibrancyCount: blooms.filter(b => b.pulsing.hasHighVibrancy).length,
    hasHighConsistencyCount: blooms.filter(b => b.radiating.hasHighConsistency).length,
    hasHighDiversityCount: blooms.filter(b => b.diversifying.hasHighDiversity).length,
    hasHighBrightnessCount: blooms.filter(b => b.grounding.hasHighBrightness).length,
    overallBrilliance,
    gardenerGrade: classifyGardenerGrade(overallBrilliance),
    bestBloom,
    brightest,
    mostVibrant,
    mostConsistent,
    bestRooted,
  }

  const recommendations = generateRecommendations(blooms, beds, landscape, { ...stats, recommendations: [] } as NeonGardenResult['stats'])

  return {
    blooms,
    beds,
    landscape,
    stats,
    recommendations,
  }
}
