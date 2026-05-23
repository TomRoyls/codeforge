// ─── Interfaces ───────────────────────────────────────────

export interface CrepuscularMeasure {
  quality: number
  phase: 'golden-hour' | 'blue-hour' | 'civil-twilight' | 'nautical-twilight' | 'astronomical-twilight' | 'night'
  hasHighQuality: boolean
  hasSmoothTransition: boolean
  hasProperFading: boolean
  hasNoAbruptShift: boolean
  hasGradualChange: boolean
  hasNoJarringSwitch: boolean
  hasAdaptive: boolean
  hasNoRigidity: boolean
  hasResponsive: boolean
  hasNoStalling: boolean
  abruptShiftCount: number
  jarringSwitchCount: number
}

export interface BioluminescentMeasure {
  beauty: number
  glow: 'firefly-symphony' | 'glowing-fungi' | 'foxfire' | 'faint-sparkle' | 'dim-gleam' | 'darkness'
  hasHighBeauty: boolean
  hasSelfDocumenting: boolean
  hasProperHighlighting: boolean
  hasNoDarkZones: boolean
  hasGlowingPaths: boolean
  hasNoShadowCode: boolean
  hasVisibleLogic: boolean
  hasNoCamouflage: boolean
  hasRadiant: boolean
  hasNoBlindSpots: boolean
  darkZoneCount: number
  blindSpotCount: number
}

export interface EcotoneMeasure {
  richness: number
  diversity: 'species-rich' | 'diverse-boundary' | 'healthy-edge' | 'simple-edge' | 'barren-border' | 'wall'
  hasHighRichness: boolean
  hasProperBoundaries: boolean
  hasCleanInterfaces: boolean
  hasNoHardEdges: boolean
  hasPermeable: boolean
  hasNoLeaking: boolean
  hasTransitionZones: boolean
  hasNoRigidWalls: boolean
  hasProperEncapsulation: boolean
  hasNoOverexposure: boolean
  hardEdgeCount: number
  leakingCount: number
}

export interface CanopyMeasure {
  equilibrium: number
  balance: 'old-growth-canopy' | 'balanced-forest' | 'healthy-mix' | 'developing' | 'patchy' | 'barren'
  hasHighEquilibrium: boolean
  hasProperLayering: boolean
  hasBalancedDepth: boolean
  hasNoOvergrowth: boolean
  hasProperCoverage: boolean
  hasNoGaps: boolean
  hasLightFiltering: boolean
  hasNoChoking: boolean
  hasDiverse: boolean
  hasNoMonoculture: boolean
  overgrowthCount: number
  gapCount: number
}

export interface UnderstoryMeasure {
  vitality: number
  health: 'thriving-understory' | 'rich-ecosystem' | 'healthy-growth' | 'sparse' | 'barren' | 'dead'
  hasHighVitality: boolean
  hasHiddenGems: boolean
  hasProperUtilities: boolean
  hasNoDeadWood: boolean
  hasSupporting: boolean
  hasNoOrphans: boolean
  hasRichInfrastructure: boolean
  hasNoRot: boolean
  hasVibrant: boolean
  hasNoWaste: boolean
  deadWoodCount: number
  orphanCount: number
}

export interface SerenityMeasure {
  level: number
  peace: 'nirvana' | 'zen-garden' | 'peaceful-grove' | 'quiet-corner' | 'restless' | 'chaotic'
  hasHighLevel: boolean
  hasCalmFlow: boolean
  hasNoAnxiety: boolean
  hasPeaceful: boolean
  hasNoTurmoil: boolean
  hasHarmonious: boolean
  hasNoDiscord: boolean
  hasBalanced: boolean
  hasNoOverwhelming: boolean
  hasContemplative: boolean
  anxietyCount: number
  turmoilCount: number
}

export interface TwilightSpecimen {
  file: string
  crepuscularQuality: number
  bioluminescentBeauty: number
  ecotoneRichness: number
  canopyEquilibrium: number
  understoryVitality: number
  twilightSerenity: number
  crepuscular: CrepuscularMeasure
  bioluminescent: BioluminescentMeasure
  ecotone: EcotoneMeasure
  canopy: CanopyMeasure
  understory: UnderstoryMeasure
  serenity: SerenityMeasure
  condition: 'enchanted-grove' | 'twilight-sanctuary' | 'mystical-glade' | 'shadowy-path' | 'dark-thicket' | 'void'
  qualityScore: number
}

export interface ForestTrail {
  directory: string
  specimens: TwilightSpecimen[]
  avgCrepuscular: number
  avgBioluminescent: number
  avgSerenity: number
  enchantedCount: number
  voidCount: number
  transitionalCount: number
  luminousCount: number
  trailType: 'ancient-forest' | 'old-growth' | 'secondary-forest' | 'plantation' | 'clearing' | 'wasteland'
  condition: 'enchanted-forest' | 'twilight-woods' | 'shadow-grove' | 'dim-trail' | 'dark-thicket' | 'void'
}

export interface TwilightForestResult {
  specimens: TwilightSpecimen[]
  trails: ForestTrail[]
  woodland: {
    avgCrepuscular: number
    avgBioluminescent: number
    avgSerenity: number
    isSerene: boolean
    overallSerenity: number
  }
  stats: {
    totalFiles: number
    totalTrails: number
    avgCrepuscularQuality: number
    avgBioluminescentBeauty: number
    avgEcotoneRichness: number
    avgCanopyEquilibrium: number
    avgUnderstoryVitality: number
    avgTwilightSerenity: number
    enchantedGroveCount: number
    twilightSanctuaryCount: number
    mysticalGladeCount: number
    shadowyPathCount: number
    darkThicketCount: number
    voidCount: number
    hasHighQualityCount: number
    hasHighBeautyCount: number
    hasHighRichnessCount: number
    hasHighEquilibriumCount: number
    hasHighVitalityCount: number
    hasHighLevelCount: number
    overallSerenity: number
    rangerGrade: 'forest-spirit' | 'ancient-ranger' | 'woodland-keeper' | 'trail-guide' | 'lost-wanderer' | 'blind-in-dark'
    bestSpecimen: string
    bestTransitions: string
    mostLuminous: string
    bestBoundaries: string
    mostBalanced: string
    deepest: string
  }
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────

const INTERFACE_RE = /\binterface\b/
const CLASS_RE = /\bclass\b/
const TYPE_RE = /\btype\b/
const EXPORT_RE = /\bexport\b/
const IMPORT_RE = /\bimport\b/
const FUNCTION_RE = /\bfunction\b/
const ARROW_RE = /=>/
const ASYNC_RE = /\basync\b/
const AWAIT_RE = /\bawait\b/
const TRY_RE = /\btry\b/
const CATCH_RE = /\bcatch\b/
const GENERIC_RE = /<[A-Z]\w*[,>]/
const OPTIONAL_RE = /\?\s*:/
const NESTED_TERNARY_RE = /\?.*:.*\?.*:/
const CONSOLE_RE = /\bconsole\.\w+/g
const ANY_RE = /:\s*any\b/g
const EVAL_RE = /\beval\s*\(/g
const TODO_RE = /\bTODO\b/gi
const HACK_RE = /\bHACK\b/gi
const FIXME_RE = /\bFIXME\b/gi
const DEPRECATED_RE = /@deprecated/g
const DOC_COMMENT_RE = /\/\*\*[\s\S]*?\*\//g
const EMPTY_CATCH_RE = /catch\s*\(\w*\)\s*\{\s*\}/g

// ─── measureCrepuscular ──────────────────────────────────

/** @example measureCrepuscular(content) returns CrepuscularMeasure */
export function measureCrepuscular(content: string): CrepuscularMeasure {
  let score = 0

  const hasSmoothTransition = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const abruptShiftCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoAbruptShift = abruptShiftCount === 0
  const hasProperFading = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const jarringSwitchCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoJarringSwitch = jarringSwitchCount === 0
  const hasGradualChange = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasAdaptive = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoRigidity = !NESTED_TERNARY_RE.test(content)
  const hasResponsive = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoStalling = (content.match(EMPTY_CATCH_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasSmoothTransition) score += 12
  if (hasNoAbruptShift) score += 12
  if (hasProperFading) score += 10
  if (hasNoJarringSwitch) score += 10
  if (hasGradualChange) score += 10
  if (hasAdaptive) score += 10
  if (hasNoRigidity) score += 10
  if (hasResponsive) score += 11
  if (hasNoStalling) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let phase: CrepuscularMeasure['phase'] = 'night'
  if (hasHighQuality && hasNoAbruptShift && hasSmoothTransition && hasResponsive) phase = 'golden-hour'
  else if (hasHighQuality && hasNoAbruptShift) phase = 'blue-hour'
  else if (hasHighQuality) phase = 'civil-twilight'
  else if (hasSmoothTransition && hasProperFading) phase = 'nautical-twilight'
  else if (quality > 30) phase = 'astronomical-twilight'

  return {
    quality, phase, hasHighQuality, hasSmoothTransition, hasProperFading,
    hasNoAbruptShift, hasGradualChange, hasNoJarringSwitch, hasAdaptive,
    hasNoRigidity, hasResponsive, hasNoStalling, abruptShiftCount, jarringSwitchCount,
  }
}

// ─── measureBioluminescent ───────────────────────────────

/** @example measureBioluminescent(content) returns BioluminescentMeasure */
export function measureBioluminescent(content: string): BioluminescentMeasure {
  let score = 0

  const hasSelfDocumenting = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasProperHighlighting = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const darkZoneCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDarkZones = darkZoneCount === 0
  const hasGlowingPaths = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoShadowCode = (content.match(CONSOLE_RE) || []).length === 0
  const hasVisibleLogic = CLASS_RE.test(content) && INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const blindSpotCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoBlindSpots = blindSpotCount === 0
  const hasRadiant = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoCamouflage = !NESTED_TERNARY_RE.test(content)
  const hasProperIllumination = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasSelfDocumenting) score += 12
  if (hasProperHighlighting) score += 10
  if (hasNoDarkZones) score += 12
  if (hasGlowingPaths) score += 10
  if (hasNoShadowCode) score += 10
  if (hasVisibleLogic) score += 10
  if (hasNoBlindSpots) score += 10
  if (hasRadiant) score += 11
  if (hasNoCamouflage) score += 10

  const beauty = Math.min(100, Math.max(0, score))
  const hasHighBeauty = beauty >= 70

  let glow: BioluminescentMeasure['glow'] = 'darkness'
  if (hasHighBeauty && hasNoDarkZones && hasSelfDocumenting && hasVisibleLogic) glow = 'firefly-symphony'
  else if (hasHighBeauty && hasNoDarkZones) glow = 'glowing-fungi'
  else if (hasHighBeauty) glow = 'foxfire'
  else if (hasSelfDocumenting && hasProperHighlighting) glow = 'faint-sparkle'
  else if (beauty > 30) glow = 'dim-gleam'

  return {
    beauty, glow, hasHighBeauty, hasSelfDocumenting, hasProperHighlighting,
    hasNoDarkZones, hasGlowingPaths, hasNoShadowCode, hasVisibleLogic, hasNoCamouflage,
    hasRadiant, hasNoBlindSpots, darkZoneCount, blindSpotCount,
  }
}

// ─── measureEcotone ──────────────────────────────────────

/** @example measureEcotone(content) returns EcotoneMeasure */
export function measureEcotone(content: string): EcotoneMeasure {
  let score = 0

  const hasProperBoundaries = INTERFACE_RE.test(content) && EXPORT_RE.test(content)
  const hasCleanInterfaces = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hardEdgeCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoHardEdges = hardEdgeCount === 0
  const hasPermeable = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const leakingCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoLeaking = leakingCount === 0
  const hasTransitionZones = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoRigidWalls = !NESTED_TERNARY_RE.test(content)
  const hasProperEncapsulation = CLASS_RE.test(content) && INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoOverexposure = (content.match(CONSOLE_RE) || []).length === 0
  const hasEcotoneDiversity = TRY_RE.test(content) && CATCH_RE.test(content)

  if (content.length > 0) score += 5
  if (hasProperBoundaries) score += 12
  if (hasCleanInterfaces) score += 10
  if (hasNoHardEdges) score += 12
  if (hasPermeable) score += 10
  if (hasNoLeaking) score += 10
  if (hasTransitionZones) score += 10
  if (hasNoRigidWalls) score += 10
  if (hasProperEncapsulation) score += 11
  if (hasNoOverexposure) score += 10

  const richness = Math.min(100, Math.max(0, score))
  const hasHighRichness = richness >= 70

  let diversity: EcotoneMeasure['diversity'] = 'wall'
  if (hasHighRichness && hasNoHardEdges && hasProperEncapsulation && hasPermeable) diversity = 'species-rich'
  else if (hasHighRichness && hasNoHardEdges) diversity = 'diverse-boundary'
  else if (hasHighRichness) diversity = 'healthy-edge'
  else if (hasProperBoundaries && hasCleanInterfaces) diversity = 'simple-edge'
  else if (richness > 30) diversity = 'barren-border'

  return {
    richness, diversity, hasHighRichness, hasProperBoundaries, hasCleanInterfaces,
    hasNoHardEdges, hasPermeable, hasNoLeaking, hasTransitionZones, hasNoRigidWalls,
    hasProperEncapsulation, hasNoOverexposure, hardEdgeCount, leakingCount,
  }
}

// ─── measureCanopy ───────────────────────────────────────

/** @example measureCanopy(content) returns CanopyMeasure */
export function measureCanopy(content: string): CanopyMeasure {
  let score = 0

  const hasProperLayering = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const hasBalancedDepth = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const overgrowthCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoOvergrowth = overgrowthCount === 0
  const hasProperCoverage = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoGaps = !NESTED_TERNARY_RE.test(content)
  const hasLightFiltering = TRY_RE.test(content) && CATCH_RE.test(content)
  const gapCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoChoking = gapCount === 0
  const hasDiverse = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoMonoculture = (content.match(GENERIC_RE) || []).length > 0 || (content.match(OPTIONAL_RE) || []).length > 0
  const hasProperCanopy = CLASS_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))

  if (content.length > 0) score += 5
  if (hasProperLayering) score += 12
  if (hasBalancedDepth) score += 10
  if (hasNoOvergrowth) score += 10
  if (hasProperCoverage) score += 10
  if (hasNoGaps) score += 10
  if (hasLightFiltering) score += 10
  if (hasNoChoking) score += 11
  if (hasDiverse) score += 12
  if (hasNoMonoculture) score += 10

  const equilibrium = Math.min(100, Math.max(0, score))
  const hasHighEquilibrium = equilibrium >= 70

  let balance: CanopyMeasure['balance'] = 'barren'
  if (hasHighEquilibrium && hasProperLayering && hasBalancedDepth && hasDiverse) balance = 'old-growth-canopy'
  else if (hasHighEquilibrium && hasProperLayering) balance = 'balanced-forest'
  else if (hasHighEquilibrium) balance = 'healthy-mix'
  else if (hasProperLayering && hasBalancedDepth) balance = 'developing'
  else if (equilibrium > 30) balance = 'patchy'

  return {
    equilibrium, balance, hasHighEquilibrium, hasProperLayering, hasBalancedDepth,
    hasNoOvergrowth, hasProperCoverage, hasNoGaps, hasLightFiltering, hasNoChoking,
    hasDiverse, hasNoMonoculture, overgrowthCount, gapCount,
  }
}

// ─── measureUnderstory ───────────────────────────────────

/** @example measureUnderstory(content) returns UnderstoryMeasure */
export function measureUnderstory(content: string): UnderstoryMeasure {
  let score = 0

  const hasHiddenGems = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasProperUtilities = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const deadWoodCount = (content.match(TODO_RE) || []).length + (content.match(HACK_RE) || []).length
  const hasNoDeadWood = deadWoodCount === 0
  const hasSupporting = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const orphanCount = (content.match(DEPRECATED_RE) || []).length + (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoOrphans = orphanCount === 0
  const hasRichInfrastructure = CLASS_RE.test(content) && INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoRot = !NESTED_TERNARY_RE.test(content)
  const hasVibrant = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoWaste = (content.match(CONSOLE_RE) || []).length === 0
  const hasDeepRoots = TRY_RE.test(content) && CATCH_RE.test(content)

  if (content.length > 0) score += 5
  if (hasHiddenGems) score += 12
  if (hasProperUtilities) score += 10
  if (hasNoDeadWood) score += 10
  if (hasSupporting) score += 10
  if (hasNoOrphans) score += 10
  if (hasRichInfrastructure) score += 12
  if (hasNoRot) score += 10
  if (hasVibrant) score += 11
  if (hasNoWaste) score += 10

  const vitality = Math.min(100, Math.max(0, score))
  const hasHighVitality = vitality >= 70

  let health: UnderstoryMeasure['health'] = 'dead'
  if (hasHighVitality && hasRichInfrastructure && hasNoDeadWood && hasSupporting) health = 'thriving-understory'
  else if (hasHighVitality && hasRichInfrastructure) health = 'rich-ecosystem'
  else if (hasHighVitality) health = 'healthy-growth'
  else if (hasHiddenGems && hasProperUtilities) health = 'sparse'
  else if (vitality > 30) health = 'barren'

  return {
    vitality, health, hasHighVitality, hasHiddenGems, hasProperUtilities,
    hasNoDeadWood, hasSupporting, hasNoOrphans, hasRichInfrastructure, hasNoRot,
    hasVibrant, hasNoWaste, deadWoodCount, orphanCount,
  }
}

// ─── measureSerenity ─────────────────────────────────────

/** @example measureSerenity(content) returns SerenityMeasure */
export function measureSerenity(content: string): SerenityMeasure {
  let score = 0

  const hasCalmFlow = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const anxietyCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoAnxiety = anxietyCount === 0
  const hasPeaceful = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const turmoilCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoTurmoil = turmoilCount === 0
  const hasHarmonious = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoDiscord = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasBalanced = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoOverwhelming = !NESTED_TERNARY_RE.test(content)
  const hasContemplative = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasTranquil = (content.match(CONSOLE_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasCalmFlow) score += 12
  if (hasNoAnxiety) score += 12
  if (hasPeaceful) score += 10
  if (hasNoTurmoil) score += 10
  if (hasHarmonious) score += 10
  if (hasNoDiscord) score += 10
  if (hasBalanced) score += 11
  if (hasNoOverwhelming) score += 10
  if (hasContemplative) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let peace: SerenityMeasure['peace'] = 'chaotic'
  if (hasHighLevel && hasNoAnxiety && hasCalmFlow && hasContemplative) peace = 'nirvana'
  else if (hasHighLevel && hasNoAnxiety) peace = 'zen-garden'
  else if (hasHighLevel) peace = 'peaceful-grove'
  else if (hasCalmFlow && hasPeaceful) peace = 'quiet-corner'
  else if (level > 30) peace = 'restless'

  return {
    level, peace, hasHighLevel, hasCalmFlow, hasNoAnxiety, hasPeaceful,
    hasNoTurmoil, hasHarmonious, hasNoDiscord, hasBalanced, hasNoOverwhelming,
    hasContemplative, anxietyCount, turmoilCount,
  }
}

// ─── classifyCondition ───────────────────────────────────

/** @example classifyCondition(specimen) returns condition */
export function classifyCondition(specimen: TwilightSpecimen): TwilightSpecimen['condition'] {
  const { qualityScore } = specimen
  if (qualityScore >= 80) return 'enchanted-grove'
  if (qualityScore >= 65) return 'twilight-sanctuary'
  if (qualityScore >= 50) return 'mystical-glade'
  if (qualityScore >= 35) return 'shadowy-path'
  if (qualityScore >= 20) return 'dark-thicket'
  return 'void'
}

// ─── analyzeTwilightSpecimen ─────────────────────────────

/** @example analyzeTwilightSpecimen(content, filePath) returns TwilightSpecimen */
export function analyzeTwilightSpecimen(content: string, filePath: string): TwilightSpecimen {
  const crepuscular = measureCrepuscular(content)
  const bioluminescent = measureBioluminescent(content)
  const ecotone = measureEcotone(content)
  const canopy = measureCanopy(content)
  const understory = measureUnderstory(content)
  const serenity = measureSerenity(content)

  const crepuscularQuality = crepuscular.quality
  const bioluminescentBeauty = bioluminescent.beauty
  const ecotoneRichness = ecotone.richness
  const canopyEquilibrium = canopy.equilibrium
  const understoryVitality = understory.vitality
  const twilightSerenity = serenity.level

  const qualityScore = Math.round(
    crepuscularQuality * 0.15 +
    bioluminescentBeauty * 0.15 +
    ecotoneRichness * 0.15 +
    canopyEquilibrium * 0.2 +
    understoryVitality * 0.15 +
    twilightSerenity * 0.2,
  )

  const result: TwilightSpecimen = {
    file: filePath,
    crepuscularQuality, bioluminescentBeauty, ecotoneRichness,
    canopyEquilibrium, understoryVitality, twilightSerenity,
    crepuscular, bioluminescent, ecotone, canopy, understory, serenity,
    qualityScore,
    condition: 'void',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── classifyTrailType ───────────────────────────────────

/** @example classifyTrailType(specimens) returns trail type */
export function classifyTrailType(specimens: TwilightSpecimen[]): ForestTrail['trailType'] {
  if (specimens.length === 0) return 'wasteland'
  const avgScore = specimens.reduce((s, spec) => s + spec.qualityScore, 0) / specimens.length
  const enchantedCnt = specimens.filter((spec) => spec.condition === 'enchanted-grove').length
  if (avgScore >= 75 && enchantedCnt >= Math.ceil(specimens.length * 0.3)) return 'ancient-forest'
  if (avgScore >= 60) return 'old-growth'
  if (avgScore >= 45) return 'secondary-forest'
  if (avgScore >= 30) return 'plantation'
  if (avgScore >= 15) return 'clearing'
  return 'wasteland'
}

// ─── analyzeForestTrail ──────────────────────────────────

/** @example analyzeForestTrail(specimens, dirPath) returns ForestTrail */
export function analyzeForestTrail(specimens: TwilightSpecimen[], dirPath: string): ForestTrail {
  if (specimens.length === 0) {
    return {
      directory: dirPath, specimens: [], avgCrepuscular: 0, avgBioluminescent: 0,
      avgSerenity: 0, enchantedCount: 0, voidCount: 0, transitionalCount: 0,
      luminousCount: 0, trailType: 'wasteland', condition: 'void',
    }
  }

  const avgCrepuscular = Math.round(specimens.reduce((s, spec) => s + spec.crepuscularQuality, 0) / specimens.length)
  const avgBioluminescent = Math.round(specimens.reduce((s, spec) => s + spec.bioluminescentBeauty, 0) / specimens.length)
  const avgSerenity = Math.round(specimens.reduce((s, spec) => s + spec.twilightSerenity, 0) / specimens.length)
  const enchantedCount = specimens.filter((spec) => spec.condition === 'enchanted-grove').length
  const voidCount = specimens.filter((spec) => spec.condition === 'void').length
  const transitionalCount = specimens.filter((spec) => spec.crepuscular.hasHighQuality).length
  const luminousCount = specimens.filter((spec) => spec.bioluminescent.hasHighBeauty).length

  const trailType = classifyTrailType(specimens)
  const avgScore = specimens.reduce((s, spec) => s + spec.qualityScore, 0) / specimens.length
  let condition: ForestTrail['condition'] = 'void'
  if (avgScore >= 75) condition = 'enchanted-forest'
  else if (avgScore >= 60) condition = 'twilight-woods'
  else if (avgScore >= 45) condition = 'shadow-grove'
  else if (avgScore >= 30) condition = 'dim-trail'
  else if (avgScore >= 15) condition = 'dark-thicket'

  return {
    directory: dirPath, specimens, avgCrepuscular, avgBioluminescent, avgSerenity,
    enchantedCount, voidCount, transitionalCount, luminousCount, trailType, condition,
  }
}

// ─── classifyRangerGrade ─────────────────────────────────

/** @example classifyRangerGrade(avgSerenity) returns grade */
export function classifyRangerGrade(avgSerenity: number): TwilightForestResult['stats']['rangerGrade'] {
  if (avgSerenity >= 80) return 'forest-spirit'
  if (avgSerenity >= 65) return 'ancient-ranger'
  if (avgSerenity >= 50) return 'woodland-keeper'
  if (avgSerenity >= 35) return 'trail-guide'
  if (avgSerenity >= 20) return 'lost-wanderer'
  return 'blind-in-dark'
}

// ─── generateRecommendations ─────────────────────────────

/** @example generateRecommendations(specimens, trails, woodland, stats) returns string[] */
export function generateRecommendations(
  specimens: TwilightSpecimen[],
  trails: ForestTrail[],
  woodland: TwilightForestResult['woodland'],
  stats: TwilightForestResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgCrepuscularQuality < 50) recs.push('Improve crepuscular quality — add interfaces, types, and smooth transitions for code adaptability')
  if (stats.avgBioluminescentBeauty < 50) recs.push('Enhance bioluminescent beauty — reduce any/eval and add documentation for code illumination')
  if (stats.avgEcotoneRichness < 50) recs.push('Enrich ecotone diversity — improve boundaries and reduce hard edges for code flexibility')
  if (stats.avgCanopyEquilibrium < 50) recs.push('Balance canopy equilibrium — add layering and reduce overgrowth for code structure')
  if (stats.avgUnderstoryVitality < 50) recs.push('Revitalize understory — reduce dead wood and add hidden gems for code depth')
  if (stats.avgTwilightSerenity < 50) recs.push('Restore twilight serenity — reduce anxiety and turmoil for code peace')
  if (stats.voidCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of specimens are void — consider major twilight restoration')
  if (stats.darkThicketCount > 0) recs.push('Warning: dark-thicket specimens detected — these files need illumination')
  if (woodland.overallSerenity < 40) recs.push('Overall serenity is critically low — establish a twilight cultivation regimen')
  if (trails.length > 0 && trails.every((t) => t.condition === 'void')) recs.push('All trails lead to darkness — your codebase needs fundamental twilight restoration')

  if (specimens.length > 0) {
    const highAnxiety = specimens.filter((spec) => spec.crepuscular.abruptShiftCount > 2)
    if (highAnxiety.length > specimens.length * 0.5) recs.push('Over 50% of specimens have high abrupt shifts — reduce any/eval usage')
  }

  return recs
}

// ─── buildTwilightForestResult ───────────────────────────

/** @example buildTwilightForestResult(files, contents, options) returns full result */
export function buildTwilightForestResult(files: string[], contents: string[], _options?: Record<string, unknown>): TwilightForestResult {
  const specimens = files.map((file, i) => analyzeTwilightSpecimen(contents[i] ?? '', file))

  const trailMap = new Map<string, TwilightSpecimen[]>()
  specimens.forEach((specimen) => {
    const parts = specimen.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = trailMap.get(dir)
    if (existing) existing.push(specimen)
    else trailMap.set(dir, [specimen])
  })

  const trails = Array.from(trailMap.entries()).map(([dir, specs]) => analyzeForestTrail(specs, dir))

  const avgCrepuscularQuality = specimens.length > 0 ? Math.round(specimens.reduce((s, spec) => s + spec.crepuscularQuality, 0) / specimens.length) : 0
  const avgBioluminescentBeauty = specimens.length > 0 ? Math.round(specimens.reduce((s, spec) => s + spec.bioluminescentBeauty, 0) / specimens.length) : 0
  const avgEcotoneRichness = specimens.length > 0 ? Math.round(specimens.reduce((s, spec) => s + spec.ecotoneRichness, 0) / specimens.length) : 0
  const avgCanopyEquilibrium = specimens.length > 0 ? Math.round(specimens.reduce((s, spec) => s + spec.canopyEquilibrium, 0) / specimens.length) : 0
  const avgUnderstoryVitality = specimens.length > 0 ? Math.round(specimens.reduce((s, spec) => s + spec.understoryVitality, 0) / specimens.length) : 0
  const avgTwilightSerenity = specimens.length > 0 ? Math.round(specimens.reduce((s, spec) => s + spec.twilightSerenity, 0) / specimens.length) : 0

  const overallSerenity = Math.round(
    avgCrepuscularQuality * 0.15 +
    avgBioluminescentBeauty * 0.15 +
    avgEcotoneRichness * 0.15 +
    avgCanopyEquilibrium * 0.2 +
    avgUnderstoryVitality * 0.15 +
    avgTwilightSerenity * 0.2,
  )

  const woodland = {
    avgCrepuscular: avgCrepuscularQuality,
    avgBioluminescent: avgBioluminescentBeauty,
    avgSerenity: avgTwilightSerenity,
    isSerene: overallSerenity >= 60,
    overallSerenity,
  }

  const stats = {
    totalFiles: files.length,
    totalTrails: trails.length,
    avgCrepuscularQuality,
    avgBioluminescentBeauty,
    avgEcotoneRichness,
    avgCanopyEquilibrium,
    avgUnderstoryVitality,
    avgTwilightSerenity,
    enchantedGroveCount: specimens.filter((spec) => spec.condition === 'enchanted-grove').length,
    twilightSanctuaryCount: specimens.filter((spec) => spec.condition === 'twilight-sanctuary').length,
    mysticalGladeCount: specimens.filter((spec) => spec.condition === 'mystical-glade').length,
    shadowyPathCount: specimens.filter((spec) => spec.condition === 'shadowy-path').length,
    darkThicketCount: specimens.filter((spec) => spec.condition === 'dark-thicket').length,
    voidCount: specimens.filter((spec) => spec.condition === 'void').length,
    hasHighQualityCount: specimens.filter((spec) => spec.crepuscular.hasHighQuality).length,
    hasHighBeautyCount: specimens.filter((spec) => spec.bioluminescent.hasHighBeauty).length,
    hasHighRichnessCount: specimens.filter((spec) => spec.ecotone.hasHighRichness).length,
    hasHighEquilibriumCount: specimens.filter((spec) => spec.canopy.hasHighEquilibrium).length,
    hasHighVitalityCount: specimens.filter((spec) => spec.understory.hasHighVitality).length,
    hasHighLevelCount: specimens.filter((spec) => spec.serenity.hasHighLevel).length,
    overallSerenity,
    rangerGrade: classifyRangerGrade(overallSerenity),
    bestSpecimen: '',
    bestTransitions: '',
    mostLuminous: '',
    bestBoundaries: '',
    mostBalanced: '',
    deepest: '',
  }

  if (specimens.length > 0) {
    stats.bestSpecimen = specimens.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.bestTransitions = specimens.reduce((a, b) => a.crepuscularQuality >= b.crepuscularQuality ? a : b).file
    stats.mostLuminous = specimens.reduce((a, b) => a.bioluminescentBeauty >= b.bioluminescentBeauty ? a : b).file
    stats.bestBoundaries = specimens.reduce((a, b) => a.ecotoneRichness >= b.ecotoneRichness ? a : b).file
    stats.mostBalanced = specimens.reduce((a, b) => a.canopyEquilibrium >= b.canopyEquilibrium ? a : b).file
    stats.deepest = specimens.reduce((a, b) => a.understoryVitality >= b.understoryVitality ? a : b).file
  }

  const recommendations = generateRecommendations(specimens, trails, woodland, stats)

  return { specimens, trails, woodland, stats, recommendations }
}
