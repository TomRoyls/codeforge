// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type PreservationGrade = 'perfect-amber' | 'clear-resin' | 'proper-preservation' | 'cloudy-amber' | 'cracked-resin' | 'no-preservation'
export type OrganizationPattern = 'celestial-map' | 'star-chart' | 'proper-atlas' | 'rough-sketch' | 'scattered-dots' | 'no-pattern'
export type ClarityBrightness = 'blazing-star' | 'bright-sun' | 'proper-light' | 'dim-star' | 'dark-body' | 'no-light'
export type CoherenceConstellation = 'grand-pattern' | 'recognized-constellation' | 'proper-shape' | 'loose-grouping' | 'random-stars' | 'no-connection'
export type DepthCosmos = 'deep-space' | 'galactic-depth' | 'proper-universe' | 'shallow-orbit' | 'surface-level' | 'no-depth'
export type StarCondition = 'golden-constellation' | 'amber-sky' | 'starlit-night' | 'cloudy-sky' | 'dark-night' | 'void'
export type GalaxyType = 'milky-way' | 'spiral-galaxy' | 'proper-nebula' | 'star-cluster' | 'dark-cloud' | 'no-galaxy'
export type GalaxyCondition = 'golden-universe' | 'amber-cosmos' | 'starry-realm' | 'dim-space' | 'dark-void' | 'void'
export type AstronomerGrade = 'master-astronomer' | 'expert-observer' | 'skilled-stargazer' | 'apprentice' | 'novice' | 'blind'

export interface PreservingMeasure {
  quality: number
  grade: PreservationGrade
  hasHighQuality: boolean
  hasWellDocumented: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasClearIntent: boolean
  hasNoAmbiguous: boolean
  hasPreserved: boolean
  hasNoDecayed: boolean
  hasLasting: boolean
  hasNoEphemeral: boolean
  hasArchival: boolean
  crypticCount: number
  ambiguousCount: number
}

export interface OrganizingMeasure {
  organization: number
  pattern: OrganizationPattern
  hasHighOrganization: boolean
  hasStructured: boolean
  hasWellOrganized: boolean
  hasNoChaotic: boolean
  hasGrouped: boolean
  hasNoScattered: boolean
  hasOrdered: boolean
  hasNoRandom: boolean
  hasSystematic: boolean
  hasNoHaphazard: boolean
  hasMethodical: boolean
  chaoticCount: number
  scatteredCount: number
}

export interface ClarifyingMeasure {
  clarity: number
  brightness: ClarityBrightness
  hasHighClarity: boolean
  hasReadable: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasClear: boolean
  hasNoHidden: boolean
  hasUnderstandable: boolean
  hasNoCryptic: boolean
  hasVisible: boolean
  hasNoInvisible: boolean
  hasLuminous: boolean
  obfuscatedCount: number
  hiddenCount: number
}

export interface ConnectingMeasure {
  coherence: number
  constellation: CoherenceConstellation
  hasHighCoherence: boolean
  hasConnected: boolean
  hasModular: boolean
  hasNoTangled: boolean
  hasCohesive: boolean
  hasNoScattered: boolean
  hasLinked: boolean
  hasNoIsolated: boolean
  hasHarmonious: boolean
  hasNoDiscordant: boolean
  hasUnified: boolean
  tangledCount: number
  isolatedCount: number
}

export interface DeepeningMeasure {
  depth: number
  cosmos: DepthCosmos
  hasHighDepth: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasSolidFoundation: boolean
  hasNoShaky: boolean
  untestedCount: number
  bareCrashCount: number
}

export interface AmberStar {
  file: string
  preservationQuality: number
  stellarOrganization: number
  starClarity: number
  constellationCoherence: number
  cosmicDepth: number
  preserving: PreservingMeasure
  organizing: OrganizingMeasure
  clarifying: ClarifyingMeasure
  connecting: ConnectingMeasure
  deepening: DeepeningMeasure
  condition: StarCondition
  qualityScore: number
}

export interface AmberGalaxy {
  directory: string
  stars: AmberStar[]
  avgPreservation: number
  avgOrganization: number
  avgClarity: number
  goldenConstellationCount: number
  voidCount: number
  galaxyType: GalaxyType
  condition: GalaxyCondition
}

export interface AmberCosmos {
  avgPreservation: number
  avgOrganization: number
  avgClarity: number
  isGolden: boolean
  overallLuminosity: number
}

export interface AmberConstellationStats {
  totalFiles: number
  totalGalaxies: number
  avgPreservationQuality: number
  avgStellarOrganization: number
  avgStarClarity: number
  avgConstellationCoherence: number
  avgCosmicDepth: number
  goldenConstellationCount: number
  amberSkyCount: number
  starlitNightCount: number
  cloudySkyCount: number
  darkNightCount: number
  voidCount: number
  hasHighQualityCount: number
  hasHighOrganizationCount: number
  hasHighClarityCount: number
  hasHighCoherenceCount: number
  hasHighDepthCount: number
  overallLuminosity: number
  astronomerGrade: AstronomerGrade
  bestStar: string
  mostPreserved: string
  mostOrganized: string
  clearest: string
  deepest: string
}

export interface AmberConstellationResult {
  stars: AmberStar[]
  galaxies: AmberGalaxy[]
  cosmos: AmberCosmos
  stats: AmberConstellationStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const countMatches = (pattern: RegExp, content: string): number => {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
  const globalPattern = new RegExp(pattern.source, flags)
  return (content.match(globalPattern) ?? []).length
}

// ─── Boolean Detectors ─────────────────────────────────────────────

const hasExport = (c: string) => has(/\bexport\b/, c)
const hasInterface = (c: string) => has(/\binterface\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasReturnType = (c: string) => has(/:\s*(?:string|number|boolean|void|Promise|unknown|never)\b/, c)
const hasGenerics = (c: string) => has(/<[A-Z][A-Za-z]*>/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasConst = (c: string) => has(/\bconst\b/, c)
const hasAsync = (c: string) => has(/\basync\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure preservation quality (lasting value)
 * @example
 * const m = measurePreserving(content)
 * console.log(m.grade) // 'perfect-amber'
 */
export function measurePreserving(content: string): PreservingMeasure {
  let score = 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasReadonly(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasAsync(content) ? 4 : 0

  const hasWellDocumented = hasDocComments(content) && hasReturnType(content)
  const hasSelfDocumenting = hasInterface(content) && hasExport(content)
  const hasClearIntent = hasEnum(content) && hasTypeAlias(content)
  const hasPreserved = hasNamedExport(content) && hasConst(content)
  const hasLasting = hasGenerics(content) && hasReadonly(content)
  const hasArchival = hasOptional(content) && hasAsync(content)

  score += hasWellDocumented ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasClearIntent ? 5 : 0
  score += hasPreserved ? 5 : 0
  score += hasLasting ? 5 : 0
  score += hasArchival ? 5 : 0

  const quality = Math.min(score, 100)
  const crypticCount = countMatches(/\bvar\b/, content)
  const ambiguousCount = countMatches(/\bany\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoAmbiguous = ambiguousCount === 0
  const hasNoDecayed = countMatches(/\beval\b/, content) === 0
  const hasNoEphemeral = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: PreservationGrade
  if (quality >= 85) grade = 'perfect-amber'
  else if (quality >= 70) grade = 'clear-resin'
  else if (quality >= 55) grade = 'proper-preservation'
  else if (quality >= 40) grade = 'cloudy-amber'
  else if (quality >= 25) grade = 'cracked-resin'
  else grade = 'no-preservation'

  return {
    quality, grade, hasHighQuality, hasWellDocumented, hasSelfDocumenting,
    hasNoCryptic, hasClearIntent, hasNoAmbiguous, hasPreserved, hasNoDecayed,
    hasLasting, hasNoEphemeral, hasArchival, crypticCount, ambiguousCount,
  }
}

/**
 * Measure stellar organization (structural arrangement)
 * @example
 * const m = measureOrganizing(content)
 * console.log(m.pattern) // 'celestial-map'
 */
export function measureOrganizing(content: string): OrganizingMeasure {
  let score = 0
  score += hasInterface(content) ? 8 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasStructured = hasInterface(content) && hasEnum(content)
  const hasWellOrganized = hasTypeAlias(content) && hasConst(content)
  const hasGrouped = hasExport(content) && hasReturnType(content)
  const hasOrdered = hasGenerics(content) && hasDocComments(content)
  const hasSystematic = hasReadonly(content) && hasNamedExport(content)
  const hasMethodical = hasOptional(content) && hasPrivate(content)

  score += hasStructured ? 5 : 0
  score += hasWellOrganized ? 5 : 0
  score += hasGrouped ? 5 : 0
  score += hasOrdered ? 5 : 0
  score += hasSystematic ? 5 : 0
  score += hasMethodical ? 5 : 0

  const organization = Math.min(score, 100)
  const chaoticCount = countMatches(/\bvar\b/, content)
  const scatteredCount = countMatches(/\bany\b/, content)

  const hasNoChaotic = chaoticCount === 0
  const hasNoScattered = scatteredCount === 0
  const hasNoRandom = countMatches(/\beval\b/, content) === 0
  const hasNoHaphazard = !has(/\bdebugger\b/, content)
  const hasHighOrganization = organization >= 70

  let pattern: OrganizationPattern
  if (organization >= 85) pattern = 'celestial-map'
  else if (organization >= 70) pattern = 'star-chart'
  else if (organization >= 55) pattern = 'proper-atlas'
  else if (organization >= 40) pattern = 'rough-sketch'
  else if (organization >= 25) pattern = 'scattered-dots'
  else pattern = 'no-pattern'

  return {
    organization, pattern, hasHighOrganization, hasStructured, hasWellOrganized,
    hasNoChaotic, hasGrouped, hasNoScattered, hasOrdered, hasNoRandom,
    hasSystematic, hasNoHaphazard, hasMethodical, chaoticCount, scatteredCount,
  }
}

/**
 * Measure star clarity (component clarity)
 * @example
 * const m = measureClarifying(content)
 * console.log(m.brightness) // 'blazing-star'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasReadonly(content) ? 4 : 0

  const hasReadable = hasExport(content) && hasInterface(content)
  const hasTransparent = hasReturnType(content) && hasDocComments(content)
  const hasClear = hasDocComments(content) && hasNamedExport(content)
  const hasUnderstandable = hasEnum(content) && hasTypeAlias(content)
  const hasVisible = hasAsync(content) && hasConst(content)
  const hasLuminous = hasOptional(content) && hasReadonly(content)

  score += hasReadable ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasUnderstandable ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasLuminous ? 5 : 0

  const clarity = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bany\b/, content)
  const hiddenCount = countMatches(/\beval\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoHidden = hiddenCount === 0
  const hasNoInvisible = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let brightness: ClarityBrightness
  if (clarity >= 85) brightness = 'blazing-star'
  else if (clarity >= 70) brightness = 'bright-sun'
  else if (clarity >= 55) brightness = 'proper-light'
  else if (clarity >= 40) brightness = 'dim-star'
  else if (clarity >= 25) brightness = 'dark-body'
  else brightness = 'no-light'

  return {
    clarity, brightness, hasHighClarity, hasReadable, hasTransparent,
    hasNoObfuscated, hasClear, hasNoHidden, hasUnderstandable, hasNoCryptic: hasNoObfuscated,
    hasVisible, hasNoInvisible, hasLuminous, obfuscatedCount, hiddenCount,
  }
}

/**
 * Measure constellation coherence (cross-part connection)
 * @example
 * const m = measureConnecting(content)
 * console.log(m.constellation) // 'grand-pattern'
 */
export function measureConnecting(content: string): ConnectingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasUnionType(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasReadonly(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasConnected = hasExport(content) && hasInterface(content)
  const hasModular = hasGenerics(content) && hasUnionType(content)
  const hasCohesive = hasAsync(content) && hasTryCatch(content)
  const hasLinked = hasThrow(content) && hasReturnType(content)
  const hasHarmonious = hasConst(content) && hasOptional(content)
  const hasUnified = hasReadonly(content) && hasPrivate(content)

  score += hasConnected ? 5 : 0
  score += hasModular ? 5 : 0
  score += hasCohesive ? 5 : 0
  score += hasLinked ? 5 : 0
  score += hasHarmonious ? 5 : 0
  score += hasUnified ? 5 : 0

  const coherence = Math.min(score, 100)
  const tangledCount = countMatches(/\bvar\b/, content)
  const isolatedCount = countMatches(/\beval\b/, content)

  const hasNoTangled = tangledCount === 0
  const didNoScattered = countMatches(/\bany\b/, content) === 0
  const hasNoIsolated = isolatedCount === 0
  const hasNoDiscordant = countMatches(/\beval\b/, content) === 0
  const hasHighCoherence = coherence >= 70

  let constellation: CoherenceConstellation
  if (coherence >= 85) constellation = 'grand-pattern'
  else if (coherence >= 70) constellation = 'recognized-constellation'
  else if (coherence >= 55) constellation = 'proper-shape'
  else if (coherence >= 40) constellation = 'loose-grouping'
  else if (coherence >= 25) constellation = 'random-stars'
  else constellation = 'no-connection'

  return {
    coherence, constellation, hasHighCoherence, hasConnected, hasModular,
    hasNoTangled, hasCohesive, hasNoScattered: didNoScattered, hasLinked,
    hasNoIsolated, hasHarmonious, hasNoDiscordant, hasUnified,
    tangledCount, isolatedCount,
  }
}

/**
 * Measure cosmic depth (architecture depth)
 * @example
 * const m = measureDeepening(content)
 * console.log(m.cosmos) // 'deep-space'
 */
export function measureDeepening(content: string): DeepeningMeasure {
  let score = 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasTested = hasInterface(content) && hasTryCatch(content)
  const hasTypeSafe = hasReadonly(content) && hasOptional(content)
  const hasErrorHandled = hasTryCatch(content) && hasStrictEq(content)
  const hasWellArchitected = hasEnum(content) && hasTypeAlias(content)
  const hasSolidFoundation = hasConst(content) && hasGenerics(content)

  score += hasTested ? 5 : 0
  score += hasTypeSafe ? 5 : 0
  score += hasErrorHandled ? 5 : 0
  score += hasWellArchitected ? 5 : 0
  score += hasSolidFoundation ? 5 : 0

  const depth = Math.min(score, 100)
  const untestedCount = countMatches(/\bvar\b/, content)
  const bareCrashCount = countMatches(/\bany\b/, content)

  const hasNoUntested = untestedCount === 0
  const hasNoUnsafe = bareCrashCount === 0
  const hasNoBareCrash = !has(/\bdebugger\b/, content)
  const hasNoHacked = countMatches(/\beval\b/, content) === 0
  const hasNoShaky = countMatches(/\bany\b/, content) === 0
  const hasHighDepth = depth >= 70

  let cosmos: DepthCosmos
  if (depth >= 85) cosmos = 'deep-space'
  else if (depth >= 70) cosmos = 'galactic-depth'
  else if (depth >= 55) cosmos = 'proper-universe'
  else if (depth >= 40) cosmos = 'shallow-orbit'
  else if (depth >= 25) cosmos = 'surface-level'
  else cosmos = 'no-depth'

  return {
    depth, cosmos, hasHighDepth, hasTested, hasNoUntested, hasTypeSafe,
    hasNoUnsafe, hasErrorHandled, hasNoBareCrash, hasWellArchitected,
    hasNoHacked, hasSolidFoundation, hasNoShaky, untestedCount, bareCrashCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify star condition
 * @example
 * classifyStarCondition(90) // 'golden-constellation'
 */
export function classifyStarCondition(score: number): StarCondition {
  if (score >= 85) return 'golden-constellation'
  if (score >= 70) return 'amber-sky'
  if (score >= 55) return 'starlit-night'
  if (score >= 40) return 'cloudy-sky'
  if (score >= 25) return 'dark-night'
  return 'void'
}

/**
 * Classify galaxy type
 * @example
 * classifyGalaxyType(stars) // 'milky-way'
 */
export function classifyGalaxyType(stars: AmberStar[]): GalaxyType {
  if (stars.length === 0) return 'no-galaxy'
  const avgQs = Math.round(stars.reduce((s, st) => s + st.qualityScore, 0) / stars.length)
  const masterpieceRatio = stars.filter(st => st.condition === 'golden-constellation').length / stars.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'milky-way'
  if (avgQs >= 60) return 'spiral-galaxy'
  if (avgQs >= 45) return 'proper-nebula'
  if (avgQs >= 30) return 'star-cluster'
  if (avgQs >= 15) return 'dark-cloud'
  return 'no-galaxy'
}

/**
 * Classify galaxy condition
 * @example
 * classifyGalaxyCondition(80) // 'golden-universe'
 */
export function classifyGalaxyCondition(avgQs: number): GalaxyCondition {
  if (avgQs >= 75) return 'golden-universe'
  if (avgQs >= 60) return 'amber-cosmos'
  if (avgQs >= 45) return 'starry-realm'
  if (avgQs >= 30) return 'dim-space'
  if (avgQs >= 15) return 'dark-void'
  return 'void'
}

/**
 * Classify astronomer grade
 * @example
 * classifyAstronomerGrade(85) // 'master-astronomer'
 */
export function classifyAstronomerGrade(avgLuminosity: number): AstronomerGrade {
  if (avgLuminosity >= 80) return 'master-astronomer'
  if (avgLuminosity >= 65) return 'expert-observer'
  if (avgLuminosity >= 50) return 'skilled-stargazer'
  if (avgLuminosity >= 35) return 'apprentice'
  if (avgLuminosity >= 20) return 'novice'
  return 'blind'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(stars, galaxies, cosmos, stats)
 */
export function generateRecommendations(
  stars: AmberStar[],
  galaxies: AmberGalaxy[],
  cosmos: AmberCosmos,
  stats: AmberConstellationStats,
): string[] {
  const recs: string[] = []
  if (stats.avgPreservationQuality < 50) {
    recs.push('Increase preservation quality with documented interfaces, clear return types, and well-preserved named exports')
  }
  if (stats.avgStellarOrganization < 50) {
    recs.push('Improve stellar organization with structured interfaces, organized type aliases, and grouped export patterns')
  }
  if (stats.avgStarClarity < 50) {
    recs.push('Boost star clarity with readable exports, transparent return types, and clear named exports')
  }
  if (stats.avgConstellationCoherence < 50) {
    recs.push('Enhance constellation coherence with connected exports, modular generics, and cohesive async patterns')
  }
  if (stats.avgCosmicDepth < 50) {
    recs.push('Add cosmic depth with tested interfaces, type-safe readonly properties, and well-architected enums')
  }
  if (stats.voidCount > 0) {
    recs.push(`${stats.voidCount} file(s) are void — they need to be forged into amber under immense pressure`)
  }
  if (cosmos.overallLuminosity < 40) {
    recs.push('Overall luminosity is dangerously low — focus on preservation quality and star clarity first')
  }
  const allWeak = galaxies.every(g => g.galaxyType === 'no-galaxy' || g.galaxyType === 'dark-cloud')
  if (allWeak && galaxies.length > 0) {
    recs.push('All galaxies are dark clouds — consider a major refactoring of the entire codebase')
  }
  const voidFiles = stars.filter(st => st.condition === 'void').map(st => st.file)
  if (voidFiles.length > 0 && voidFiles.length <= 3) {
    recs.push(`Transform these void files into amber: ${voidFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The amber constellation blazes with golden perfection! Every star is preserved in amber, organized across the cosmos')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as amber star
 * @example
 * const star = analyzeAmberStar(content, 'index.ts')
 * console.log(star.condition) // 'golden-constellation'
 */
export function analyzeAmberStar(content: string, filePath: string): AmberStar {
  const preserving = measurePreserving(content)
  const organizing = measureOrganizing(content)
  const clarifying = measureClarifying(content)
  const connecting = measureConnecting(content)
  const deepening = measureDeepening(content)

  const qualityScore = Math.round(
    preserving.quality * 0.2 +
    organizing.organization * 0.2 +
    clarifying.clarity * 0.2 +
    connecting.coherence * 0.2 +
    deepening.depth * 0.2,
  )

  return {
    file: filePath,
    preservationQuality: preserving.quality,
    stellarOrganization: organizing.organization,
    starClarity: clarifying.clarity,
    constellationCoherence: connecting.coherence,
    cosmicDepth: deepening.depth,
    preserving, organizing, clarifying, connecting, deepening,
    condition: classifyStarCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as amber galaxy
 * @example
 * const galaxy = analyzeAmberGalaxy(stars, 'src')
 * console.log(galaxy.galaxyType) // 'milky-way'
 */
export function analyzeAmberGalaxy(stars: AmberStar[], dirPath: string): AmberGalaxy {
  if (stars.length === 0) {
    return {
      directory: dirPath, stars: [], avgPreservation: 0, avgOrganization: 0,
      avgClarity: 0, goldenConstellationCount: 0, voidCount: 0,
      galaxyType: 'no-galaxy', condition: 'void',
    }
  }

  const avgPreservation = Math.round(stars.reduce((s, st) => s + st.preservationQuality, 0) / stars.length)
  const avgOrganization = Math.round(stars.reduce((s, st) => s + st.stellarOrganization, 0) / stars.length)
  const avgClarity = Math.round(stars.reduce((s, st) => s + st.starClarity, 0) / stars.length)
  const goldenConstellationCount = stars.filter(st => st.condition === 'golden-constellation').length
  const voidCount = stars.filter(st => st.condition === 'void').length
  const avgQs = Math.round(stars.reduce((s, st) => s + st.qualityScore, 0) / stars.length)

  return {
    directory: dirPath, stars, avgPreservation, avgOrganization, avgClarity,
    goldenConstellationCount, voidCount,
    galaxyType: classifyGalaxyType(stars),
    condition: classifyGalaxyCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete amber constellation result
 * @example
 * const result = await buildAmberConstellationResult(files, contents)
 * console.log(result.stats.astronomerGrade) // 'master-astronomer'
 */
export async function buildAmberConstellationResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AmberConstellationResult> {
  const stars = files.map((file, i) => analyzeAmberStar(contents[i] ?? '', file))

  const dirMap = new Map<string, AmberStar[]>()
  for (const star of stars) {
    const dir = path.dirname(star.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(star) } else { dirMap.set(dir, [star]) }
  }

  const galaxies = Array.from(dirMap.entries()).map(([dir, dirStars]) =>
    analyzeAmberGalaxy(dirStars, dir),
  )

  const avgPreservation = stars.length > 0
    ? Math.round(stars.reduce((s, st) => s + st.preservationQuality, 0) / stars.length) : 0
  const avgOrganization = stars.length > 0
    ? Math.round(stars.reduce((s, st) => s + st.stellarOrganization, 0) / stars.length) : 0
  const avgClarity = stars.length > 0
    ? Math.round(stars.reduce((s, st) => s + st.starClarity, 0) / stars.length) : 0

  const overallLuminosity = stars.length > 0
    ? Math.round((avgPreservation + avgOrganization + avgClarity) / 3) : 0
  const isGolden = avgPreservation >= 60

  const cosmos: AmberCosmos = { avgPreservation, avgOrganization, avgClarity, isGolden, overallLuminosity }

  const avgCoherence = stars.length > 0
    ? Math.round(stars.reduce((s, st) => s + st.constellationCoherence, 0) / stars.length) : 0
  const avgDepth = stars.length > 0
    ? Math.round(stars.reduce((s, st) => s + st.cosmicDepth, 0) / stars.length) : 0

  const bestStar = stars.length > 0
    ? stars.reduce((best, st) => st.qualityScore > best.qualityScore ? st : best).file : ''
  const mostPreserved = stars.length > 0
    ? stars.reduce((best, st) => st.preservationQuality > best.preservationQuality ? st : best).file : ''
  const mostOrganized = stars.length > 0
    ? stars.reduce((best, st) => st.stellarOrganization > best.stellarOrganization ? st : best).file : ''
  const clearest = stars.length > 0
    ? stars.reduce((best, st) => st.starClarity > best.starClarity ? st : best).file : ''
  const deepest = stars.length > 0
    ? stars.reduce((best, st) => st.cosmicDepth > best.cosmicDepth ? st : best).file : ''

  const stats: AmberConstellationStats = {
    totalFiles: stars.length,
    totalGalaxies: galaxies.length,
    avgPreservationQuality: avgPreservation,
    avgStellarOrganization: avgOrganization,
    avgStarClarity: avgClarity,
    avgConstellationCoherence: avgCoherence,
    avgCosmicDepth: avgDepth,
    goldenConstellationCount: stars.filter(st => st.condition === 'golden-constellation').length,
    amberSkyCount: stars.filter(st => st.condition === 'amber-sky').length,
    starlitNightCount: stars.filter(st => st.condition === 'starlit-night').length,
    cloudySkyCount: stars.filter(st => st.condition === 'cloudy-sky').length,
    darkNightCount: stars.filter(st => st.condition === 'dark-night').length,
    voidCount: stars.filter(st => st.condition === 'void').length,
    hasHighQualityCount: stars.filter(st => st.preserving.hasHighQuality).length,
    hasHighOrganizationCount: stars.filter(st => st.organizing.hasHighOrganization).length,
    hasHighClarityCount: stars.filter(st => st.clarifying.hasHighClarity).length,
    hasHighCoherenceCount: stars.filter(st => st.connecting.hasHighCoherence).length,
    hasHighDepthCount: stars.filter(st => st.deepening.hasHighDepth).length,
    overallLuminosity,
    astronomerGrade: classifyAstronomerGrade(overallLuminosity),
    bestStar, mostPreserved, mostOrganized, clearest, deepest,
  }

  const recommendations = generateRecommendations(stars, galaxies, cosmos, stats)

  return { stars, galaxies, cosmos, stats, recommendations }
}

/**
 * Gather files matching patterns
 * @example
 * const files = gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string, exts: string[], ignore: string[],
): Promise<string[]> {
  const extensions = exts.length > 0 ? exts : ['.ts', '.js', '.tsx', '.jsx']
  const patterns = extensions.map(ext => `**/*${ext}`)
  const ignorePatterns = ignore.length > 0 ? ignore : ['**/node_modules/**', '**/dist/**', '**/.git/**']
  const entries = await fg(patterns, { cwd: targetPath, ignore: ignorePatterns, absolute: true })
  return Array.from(new Set(entries)).sort()
}
