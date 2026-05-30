// ─── Interfaces ──────────────────────────────────────────

export interface RadiatingMeasure {
  luminosity: number
  glow: 'solar-flare' | 'full-moon' | 'proper-neon' | 'firefly' | 'dark-matter' | 'no-luminosity'
  hasHighLuminosity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasVisible: boolean
  hasNoHidden: boolean
  hasDocumented: boolean
  hasExpressive: boolean
  hasClear: boolean
  hasIlluminated: boolean
  hasSelfDocumenting: boolean
  hasRevealed: boolean
  hasOpen: boolean
  hasDirect: boolean
  hasBright: boolean
  hasRadiant: boolean
  hasLuminous: boolean
  crypticCount: number
  hiddenCount: number
}

export interface ThrivingMeasure {
  vibrancy: number
  vitality: 'bursting-life' | 'vibrant-growth' | 'proper-health' | 'wilting' | 'dormant' | 'no-vibrancy'
  hasHighVibrancy: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasAlive: boolean
  hasDynamic: boolean
  hasEvolving: boolean
  hasGrowing: boolean
  hasThriving: boolean
  hasActive: boolean
  hasEnergetic: boolean
  hasVibrant: boolean
  hasRobust: boolean
  hasVigorous: boolean
  hasFlourishing: boolean
  chaoticCount: number
  monolithicCount: number
}

export interface SteadyMeasure {
  consistency: number
  pulse: 'steady-beam' | 'reliable-pulse' | 'proper-rhythm' | 'flickering' | 'intermittent' | 'no-consistency'
  hasHighConsistency: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasReliable: boolean
  hasPredictable: boolean
  hasDependable: boolean
  hasUniform: boolean
  hasSteady: boolean
  hasConstant: boolean
  hasRhythmic: boolean
  hasHarmonious: boolean
  hasTrustworthy: boolean
  volatileCount: number
  untestedCount: number
}

export interface DiversifyingMeasure {
  diversity: number
  variety: 'kaleidoscope' | 'rich-ecosystem' | 'proper-garden' | 'monoculture' | 'single-stem' | 'no-diversity'
  hasHighDiversity: boolean
  hasVersatile: boolean
  hasMultiPurpose: boolean
  hasAdaptable: boolean
  hasFlexible: boolean
  hasRich: boolean
  hasVaried: boolean
  hasDiverse: boolean
  hasMultiFaceted: boolean
  hasComprehensive: boolean
  hasBroad: boolean
  hasWide: boolean
  hasColorful: boolean
  hasLayered: boolean
  hasComplex: boolean
  hasEclectic: boolean
  rigidCount: number
  narrowCount: number
}

export interface GroundingMeasure {
  brightness: number
  root: 'glowing-taproot' | 'bright-foundation' | 'proper-roots' | 'dim-base' | 'dark-underground' | 'no-brightness'
  hasHighBrightness: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasProven: boolean
  hasConnected: boolean
  hasIntegrated: boolean
  hasNetworked: boolean
  hasFoundational: boolean
  hasGrounded: boolean
  hasSolid: boolean
  hasStableBase: boolean
  hasEnduring: boolean
  hasInterlinked: boolean
  hasDeeplyRooted: boolean
  hackedCount: number
  isolatedCount: number
}

export type NeonCondition =
  | 'neon-masterpiece'
  | 'bioluminescent-perfection'
  | 'proper-glow'
  | 'dim-light'
  | 'dark-corner'
  | 'void'

export interface NeonBloom {
  file: string
  luminosityQuality: number
  structureVibrancy: number
  glowConsistency: number
  bloomDiversity: number
  rootBrightness: number
  radiating: RadiatingMeasure
  thriving: ThrivingMeasure
  steady: SteadyMeasure
  diversifying: DiversifyingMeasure
  grounding: GroundingMeasure
  condition: NeonCondition
  qualityScore: number
}

export type BedType =
  | 'grand-conservatory'
  | 'neon-parterre'
  | 'proper-bed'
  | 'window-box'
  | 'barren-soil'
  | 'no-bed'

export type BedCondition =
  | 'luminous-garden'
  | 'glowing-oasis'
  | 'proper-plot'
  | 'dim-corner'
  | 'dark-void'
  | 'void'

export interface NeonBed {
  directory: string
  blooms: NeonBloom[]
  avgLuminosity: number
  avgDiversity: number
  avgBrightness: number
  neonMasterpieceCount: number
  voidCount: number
  bedType: BedType
  condition: BedCondition
}

export type BotanistGrade = 'master-botanist' | 'neon-gardener' | 'proper-cultivator' | 'apprentice' | 'novice' | 'weed-puller'

export interface NeonGardenResult {
  blooms: NeonBloom[]
  beds: NeonBed[]
  ecosystem: {
    avgLuminosity: number
    avgDiversity: number
    avgBrightness: number
    isNeon: boolean
    overallRadiance: number
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
    bioluminescentPerfectionCount: number
    properGlowCount: number
    dimLightCount: number
    darkCornerCount: number
    voidCount: number
    hasHighLuminosityCount: number
    hasHighVibrancyCount: number
    hasHighConsistencyCount: number
    hasHighDiversityCount: number
    hasHighBrightnessCount: number
    overallRadiance: number
    botanistGrade: BotanistGrade
    bestBloom: string
    mostLuminous: string
    mostVibrant: string
    mostConsistent: string
    mostDiverse: string
    brightest: string
  }
  recommendations: string[]
}

// ─── Score computation ──────────────────────────────────

function computeScore(positiveBooleans: boolean[]): number {
  const total = positiveBooleans.length
  const perFeature = total > 0 ? Math.floor(100 / total) : 0
  const remainder = total > 0 ? 100 - perFeature * total : 0
  let score = 0
  for (let i = 0; i < total; i++) {
    if (positiveBooleans[i]) {
      score += perFeature + (i < remainder ? 1 : 0)
    }
  }
  return score
}

// ─── Classifiers ────────────────────────────────────────

/** @example classifyNeonCondition(90) */
export function classifyNeonCondition(score: number): NeonCondition {
  if (score >= 90) return 'neon-masterpiece'
  if (score >= 75) return 'bioluminescent-perfection'
  if (score >= 60) return 'proper-glow'
  if (score >= 40) return 'dim-light'
  if (score >= 20) return 'dark-corner'
  return 'void'
}

/** @example classifyBedType(blooms) */
export function classifyBedType(blooms: NeonBloom[]): BedType {
  if (blooms.length === 0) return 'no-bed'
  const avg = blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length
  if (avg >= 85) return 'grand-conservatory'
  if (avg >= 70) return 'neon-parterre'
  if (avg >= 55) return 'proper-bed'
  if (avg >= 35) return 'window-box'
  return 'barren-soil'
}

/** @example classifyBedCondition(85) */
export function classifyBedCondition(score: number): BedCondition {
  if (score >= 85) return 'luminous-garden'
  if (score >= 70) return 'glowing-oasis'
  if (score >= 55) return 'proper-plot'
  if (score >= 35) return 'dim-corner'
  if (score >= 15) return 'dark-void'
  return 'void'
}

/** @example classifyBotanistGrade(80) */
export function classifyBotanistGrade(avgRadiance: number): BotanistGrade {
  if (avgRadiance >= 80) return 'master-botanist'
  if (avgRadiance >= 65) return 'neon-gardener'
  if (avgRadiance >= 50) return 'proper-cultivator'
  if (avgRadiance >= 35) return 'apprentice'
  if (avgRadiance >= 20) return 'novice'
  return 'weed-puller'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureRadiating('class X { readonly y: string }') */
export function measureRadiating(content: string): RadiatingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obfuscate|minified)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasVisible = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hiddenCount = (content.match(/\b(hidden|obscure|concealed)\b/gi) ?? []).length
  const hasNoHidden = hiddenCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasExpressive = /\b(const|readonly)\b/.test(content)
  const hasClear = !/\bany\b/.test(content)
  const hasIlluminated = /\b(async|await|Promise)\b/.test(content)
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRevealed = /\b(try|catch|if)\b/.test(content)
  const hasOpen = /\b(import|export)\b/.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasBright = /\b(readonly|private|protected)\b/.test(content)
  const hasRadiant = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasLuminous = /\b(readonly|as const)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasVisible, hasNoHidden, hasDocumented,
    hasExpressive, hasClear, hasIlluminated, hasSelfDocumenting, hasRevealed,
    hasOpen, hasDirect, hasBright, hasRadiant, hasLuminous,
  ]

  const luminosity = computeScore(positiveBooleans)
  const hasHighLuminosity = luminosity >= 60

  let glow: RadiatingMeasure['glow'] = 'no-luminosity'
  if (luminosity >= 90) glow = 'solar-flare'
  else if (luminosity >= 75) glow = 'full-moon'
  else if (luminosity >= 60) glow = 'proper-neon'
  else if (luminosity >= 40) glow = 'firefly'
  else if (luminosity >= 20) glow = 'dark-matter'

  return {
    luminosity, glow, hasHighLuminosity,
    hasReadable, hasNoCryptic, hasVisible, hasNoHidden, hasDocumented,
    hasExpressive, hasClear, hasIlluminated, hasSelfDocumenting, hasRevealed,
    hasOpen, hasDirect, hasBright, hasRadiant, hasLuminous,
    crypticCount, hiddenCount,
  }
}

/** @example measureThriving('export class X { readonly y: string }') */
export function measureThriving(content: string): ThrivingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasAlive = /\b(async|await|Promise)\b/.test(content)
  const hasDynamic = /\b(function|=>|return)\b/.test(content)
  const hasEvolving = /\b(readonly|private|protected)\b/.test(content)
  const hasGrowing = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasThriving = !/\bany\b/.test(content)
  const hasActive = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasEnergetic = /\b(try|catch|if)\b/.test(content)
  const hasVibrant = /\b(const|readonly)\b/.test(content)
  const hasRobust = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasVigorous = /\b(throw|return)\b/.test(content)
  const hasFlourishing = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasModular, hasNoMonolithic, hasAlive,
    hasDynamic, hasEvolving, hasGrowing, hasThriving, hasActive,
    hasEnergetic, hasVibrant, hasRobust, hasVigorous, hasFlourishing,
  ]

  const vibrancy = computeScore(positiveBooleans)
  const hasHighVibrancy = vibrancy >= 60

  let vitality: ThrivingMeasure['vitality'] = 'no-vibrancy'
  if (vibrancy >= 90) vitality = 'bursting-life'
  else if (vibrancy >= 75) vitality = 'vibrant-growth'
  else if (vibrancy >= 60) vitality = 'proper-health'
  else if (vibrancy >= 40) vitality = 'wilting'
  else if (vibrancy >= 20) vitality = 'dormant'

  return {
    vibrancy, vitality, hasHighVibrancy,
    hasWellStructured, hasNoChaotic, hasModular, hasNoMonolithic, hasAlive,
    hasDynamic, hasEvolving, hasGrowing, hasThriving, hasActive,
    hasEnergetic, hasVibrant, hasRobust, hasVigorous, hasFlourishing,
    chaoticCount, monolithicCount,
  }
}

/** @example measureSteady('try { x } catch { y }') */
export function measureSteady(content: string): SteadyMeasure {
  const hasStable = /\b(const|readonly)\b/.test(content)
  const volatileCount = (content.match(/\b(volatile|unstable|fragile)\b/gi) ?? []).length
  const hasNoVolatile = volatileCount === 0
  const hasConsistent = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const erraticCount = (content.match(/\b(erratic|random|chaotic)\b/gi) ?? []).length
  const hasNoErratic = erraticCount === 0
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasReliable = !/\bany\b/.test(content)
  const hasPredictable = /\b(readonly|private|protected)\b/.test(content)
  const hasDependable = /\b(import|export)\b/.test(content)
  const hasUniform = /\b(class|interface|type)\b/.test(content)
  const hasSteady = /\b(async|await|Promise)\b/.test(content)
  const hasConstant = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRhythmic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasHarmonious = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasTrustworthy = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasStable, hasNoVolatile, hasConsistent, hasNoErratic, hasTested,
    hasNoUntested, hasReliable, hasPredictable, hasDependable, hasUniform,
    hasSteady, hasConstant, hasRhythmic, hasHarmonious, hasTrustworthy,
  ]

  const consistency = computeScore(positiveBooleans)
  const hasHighConsistency = consistency >= 60

  let pulse: SteadyMeasure['pulse'] = 'no-consistency'
  if (consistency >= 90) pulse = 'steady-beam'
  else if (consistency >= 75) pulse = 'reliable-pulse'
  else if (consistency >= 60) pulse = 'proper-rhythm'
  else if (consistency >= 40) pulse = 'flickering'
  else if (consistency >= 20) pulse = 'intermittent'

  return {
    consistency, pulse, hasHighConsistency,
    hasStable, hasNoVolatile, hasConsistent, hasNoErratic, hasTested,
    hasNoUntested, hasReliable, hasPredictable, hasDependable, hasUniform,
    hasSteady, hasConstant, hasRhythmic, hasHarmonious, hasTrustworthy,
    volatileCount, untestedCount,
  }
}

/** @example measureDiversifying('export class X { readonly y: string }') */
export function measureDiversifying(content: string): DiversifyingMeasure {
  const hasVersatile = /\b(class|interface|type)\b/.test(content)
  const rigidCount = (content.match(/\b(rigid|inflexible|hardcoded)\b/gi) ?? []).length
  const hasMultiPurpose = /\b(import|export)\b/.test(content)
  const narrowCount = (content.match(/\b(narrow|limited|restricted)\b/gi) ?? []).length
  const hasAdaptable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasFlexible = !/\bany\b/.test(content)
  const hasRich = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasVaried = /\b(readonly|private|protected)\b/.test(content)
  const hasDiverse = /\b(async|await|Promise)\b/.test(content)
  const hasMultiFaceted = /\b(function|=>|return)\b/.test(content)
  const hasComprehensive = /\b(try|catch|if)\b/.test(content)
  const hasBroad = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasWide = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasColorful = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasLayered = /\b(const|readonly)\b/.test(content)
  const hasComplex = /\b(throw|return)\b/.test(content)
  const hasEclectic = /\b(readonly|as const)\b/.test(content)

  const positiveBooleans = [
    hasVersatile, hasMultiPurpose, hasAdaptable, hasFlexible, hasRich,
    hasVaried, hasDiverse, hasMultiFaceted, hasComprehensive, hasBroad,
    hasWide, hasColorful, hasLayered, hasComplex, hasEclectic,
  ]

  const diversity = computeScore(positiveBooleans)
  const hasHighDiversity = diversity >= 60

  let variety: DiversifyingMeasure['variety'] = 'no-diversity'
  if (diversity >= 90) variety = 'kaleidoscope'
  else if (diversity >= 75) variety = 'rich-ecosystem'
  else if (diversity >= 60) variety = 'proper-garden'
  else if (diversity >= 40) variety = 'monoculture'
  else if (diversity >= 20) variety = 'single-stem'

  return {
    diversity, variety, hasHighDiversity,
    hasVersatile, hasMultiPurpose, hasAdaptable, hasFlexible, hasRich,
    hasVaried, hasDiverse, hasMultiFaceted, hasComprehensive, hasBroad,
    hasWide, hasColorful, hasLayered, hasComplex, hasEclectic,
    rigidCount, narrowCount,
  }
}

/** @example measureGrounding('import { X } from "y"') */
export function measureGrounding(content: string): GroundingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = !/\bany\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasProven = /\b(try|catch|if)\b/.test(content)
  const hasConnected = /\b(import|export)\b/.test(content)
  const hasIntegrated = /\b(readonly|private|protected)\b/.test(content)
  const hasNetworked = /\b(async|await|Promise)\b/.test(content)
  const hasFoundational = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasGrounded = /\b(const|readonly)\b/.test(content)
  const hasSolid = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasStableBase = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasEnduring = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasInterlinked = /\b(function|=>|return)\b/.test(content)
  const hasDeeplyRooted = (content.match(/\b(isolated|disconnected|orphan)\b/gi) ?? []).length === 0
  const isolatedCount = (content.match(/\b(isolated|disconnected|orphan)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasProven,
    hasConnected, hasIntegrated, hasNetworked, hasFoundational, hasGrounded,
    hasSolid, hasStableBase, hasEnduring, hasInterlinked, hasDeeplyRooted,
  ]

  const brightness = computeScore(positiveBooleans)
  const hasHighBrightness = brightness >= 60

  let root: GroundingMeasure['root'] = 'no-brightness'
  if (brightness >= 90) root = 'glowing-taproot'
  else if (brightness >= 75) root = 'bright-foundation'
  else if (brightness >= 60) root = 'proper-roots'
  else if (brightness >= 40) root = 'dim-base'
  else if (brightness >= 20) root = 'dark-underground'

  return {
    brightness, root, hasHighBrightness,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasProven,
    hasConnected, hasIntegrated, hasNetworked, hasFoundational, hasGrounded,
    hasSolid, hasStableBase, hasEnduring, hasInterlinked, hasDeeplyRooted,
    hackedCount, isolatedCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeNeonBloom(content, 'app.ts') */
export function analyzeNeonBloom(content: string, filePath: string): NeonBloom {
  const radiating = measureRadiating(content)
  const thriving = measureThriving(content)
  const steady = measureSteady(content)
  const diversifying = measureDiversifying(content)
  const grounding = measureGrounding(content)

  const luminosityQuality = radiating.luminosity
  const structureVibrancy = thriving.vibrancy
  const glowConsistency = steady.consistency
  const bloomDiversity = diversifying.diversity
  const rootBrightness = grounding.brightness

  const qualityScore = Math.round(
    luminosityQuality * 0.2 +
    structureVibrancy * 0.2 +
    glowConsistency * 0.2 +
    bloomDiversity * 0.2 +
    rootBrightness * 0.2,
  )

  const condition = classifyNeonCondition(qualityScore)

  return {
    file: filePath,
    luminosityQuality, structureVibrancy, glowConsistency, bloomDiversity, rootBrightness,
    radiating, thriving, steady, diversifying, grounding,
    condition, qualityScore,
  }
}

/** @example analyzeNeonBed(blooms, 'src') */
export function analyzeNeonBed(blooms: NeonBloom[], dirPath: string): NeonBed {
  if (blooms.length === 0) {
    return {
      directory: dirPath, blooms: [],
      avgLuminosity: 0, avgDiversity: 0, avgBrightness: 0,
      neonMasterpieceCount: 0, voidCount: 0,
      bedType: 'no-bed', condition: 'void',
    }
  }

  const avgLuminosity = Math.round(blooms.reduce((s, b) => s + b.luminosityQuality, 0) / blooms.length)
  const avgDiversity = Math.round(blooms.reduce((s, b) => s + b.bloomDiversity, 0) / blooms.length)
  const avgBrightness = Math.round(blooms.reduce((s, b) => s + b.rootBrightness, 0) / blooms.length)
  const neonMasterpieceCount = blooms.filter((b) => b.condition === 'neon-masterpiece').length
  const voidCount = blooms.filter((b) => b.condition === 'void').length
  const bedType = classifyBedType(blooms)
  const avgQuality = Math.round(blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length)
  const condition = classifyBedCondition(avgQuality)

  return {
    directory: dirPath, blooms,
    avgLuminosity, avgDiversity, avgBrightness,
    neonMasterpieceCount, voidCount,
    bedType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildNeonGardenResult(['a.ts'], [content]) */
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
    const dir = bloom.file.includes('/')
      ? bloom.file.substring(0, bloom.file.lastIndexOf('/'))
      : '.'
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
    ? Math.round(blooms.reduce((s, b) => s + b.luminosityQuality, 0) / blooms.length) : 0
  const avgStructureVibrancy = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.structureVibrancy, 0) / blooms.length) : 0
  const avgGlowConsistency = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.glowConsistency, 0) / blooms.length) : 0
  const avgBloomDiversity = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.bloomDiversity, 0) / blooms.length) : 0
  const avgRootBrightness = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.rootBrightness, 0) / blooms.length) : 0

  const overallRadiance = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length) : 0
  const isNeon = overallRadiance >= 60

  const ecosystem = { avgLuminosity: avgLuminosityQuality, avgDiversity: avgBloomDiversity, avgBrightness: avgRootBrightness, isNeon, overallRadiance }

  const neonMasterpieceCount = blooms.filter((b) => b.condition === 'neon-masterpiece').length
  const bioluminescentPerfectionCount = blooms.filter((b) => b.condition === 'bioluminescent-perfection').length
  const properGlowCount = blooms.filter((b) => b.condition === 'proper-glow').length
  const dimLightCount = blooms.filter((b) => b.condition === 'dim-light').length
  const darkCornerCount = blooms.filter((b) => b.condition === 'dark-corner').length
  const voidCount = blooms.filter((b) => b.condition === 'void').length

  const hasHighLuminosityCount = blooms.filter((b) => b.radiating.hasHighLuminosity).length
  const hasHighVibrancyCount = blooms.filter((b) => b.thriving.hasHighVibrancy).length
  const hasHighConsistencyCount = blooms.filter((b) => b.steady.hasHighConsistency).length
  const hasHighDiversityCount = blooms.filter((b) => b.diversifying.hasHighDiversity).length
  const hasHighBrightnessCount = blooms.filter((b) => b.grounding.hasHighBrightness).length

  const botanistGrade = classifyBotanistGrade(overallRadiance)

  const bestBloom = blooms.length > 0
    ? blooms.reduce((best, b) => (b.qualityScore > best.qualityScore ? b : best)).file : ''
  const mostLuminous = blooms.length > 0
    ? blooms.reduce((best, b) => (b.luminosityQuality > best.luminosityQuality ? b : best)).file : ''
  const mostVibrant = blooms.length > 0
    ? blooms.reduce((best, b) => (b.structureVibrancy > best.structureVibrancy ? b : best)).file : ''
  const mostConsistent = blooms.length > 0
    ? blooms.reduce((best, b) => (b.glowConsistency > best.glowConsistency ? b : best)).file : ''
  const mostDiverse = blooms.length > 0
    ? blooms.reduce((best, b) => (b.bloomDiversity > best.bloomDiversity ? b : best)).file : ''
  const brightest = blooms.length > 0
    ? blooms.reduce((best, b) => (b.rootBrightness > best.rootBrightness ? b : best)).file : ''

  const stats: NeonGardenResult['stats'] = {
    totalFiles: files.length, totalBeds: beds.length,
    avgLuminosityQuality, avgStructureVibrancy, avgGlowConsistency, avgBloomDiversity, avgRootBrightness,
    neonMasterpieceCount, bioluminescentPerfectionCount, properGlowCount, dimLightCount, darkCornerCount, voidCount,
    hasHighLuminosityCount, hasHighVibrancyCount, hasHighConsistencyCount, hasHighDiversityCount, hasHighBrightnessCount,
    overallRadiance, botanistGrade,
    bestBloom, mostLuminous, mostVibrant, mostConsistent, mostDiverse, brightest,
  }

  const recommendations = generateRecommendations(blooms, beds, ecosystem, stats)

  return { blooms, beds, ecosystem, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(blooms, beds, ecosystem, stats) */
export function generateRecommendations(
  blooms: NeonBloom[],
  beds: NeonBed[],
  _ecosystem: NeonGardenResult['ecosystem'],
  stats: NeonGardenResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgLuminosityQuality >= 90 &&
    stats.avgStructureVibrancy >= 90 &&
    stats.avgGlowConsistency >= 90 &&
    stats.avgBloomDiversity >= 90 &&
    stats.avgRootBrightness >= 90
  ) {
    recs.push(
      'Your neon garden is a masterpiece of bioluminescence! Every bloom combines luminosity quality, structure vibrancy, glow consistency, bloom diversity, and root brightness into a radiant ecosystem worthy of eternal preservation!',
    )
    return recs
  }

  if (stats.avgLuminosityQuality < 60) {
    recs.push(
      'Amplify luminosity quality — neon plants glow because they are healthy; your code should radiate readability, visibility, and self-documenting clarity',
    )
  }

  if (stats.avgStructureVibrancy < 60) {
    recs.push(
      'Revitalize structure vibrancy — a vibrant garden is clearly thriving; your code should feel alive with dynamic patterns, modular growth, and robust architecture',
    )
  }

  if (stats.avgGlowConsistency < 60) {
    recs.push(
      'Steady glow consistency — bioluminescence is constant, not flickering; your code should be stable, predictable, and reliable through every cycle',
    )
  }

  if (stats.avgBloomDiversity < 60) {
    recs.push(
      'Enrich bloom diversity — a garden with one plant is a crop, not a garden; your code should demonstrate versatile, adaptable, and multi-faceted capabilities',
    )
  }

  if (stats.avgRootBrightness < 60) {
    recs.push(
      'Illuminate root brightness — in a neon garden even roots glow; your code should have well-architected, principled, and deeply connected foundations',
    )
  }

  if (stats.overallRadiance < 40) {
    recs.push(
      'The neon garden has gone dark — only shadows remain where once bioluminescent life illuminated every surface',
    )
  }

  const voidBlooms = blooms.filter((b) => b.condition === 'void')
  if (voidBlooms.length > 0 && voidBlooms.length <= 5) {
    recs.push(`Replant these dark patches: ${voidBlooms.map((b) => b.file).join(', ')}`)
  } else if (voidBlooms.length > 5) {
    recs.push(`Replant ${voidBlooms.length} dark patches before the garden loses all its color`)
  }

  const poorBeds = beds.filter((b) => b.condition === 'void' || b.condition === 'dark-void')
  if (poorBeds.length === beds.length && beds.length > 0) {
    recs.push('All garden beds have lost their glow — the neon garden needs a complete replanting from seed to canopy')
  }

  if (recs.length === 0) {
    recs.push('Your neon garden radiates beautifully — each bloom combines luminosity quality, structure vibrancy, glow consistency, bloom diversity, and root brightness')
  }

  return recs
}
