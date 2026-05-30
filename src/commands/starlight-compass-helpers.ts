// ─── Interfaces ──────────────────────────────────────────

export interface PoleMeasure {
  star: number
  brightness: 'polaris-brilliant' | 'bright-guide' | 'visible-star' | 'dim-star' | 'flickering' | 'invisible'
  hasHighStar: boolean
  hasClearEntryPoint: boolean
  hasProperInitialization: boolean
  hasNoObscurity: boolean
  hasGuidingLight: boolean
  hasNoConfusion: boolean
  hasReliable: boolean
  hasNoShifting: boolean
  hasFixed: boolean
  hasNoDrift: boolean
  obscurityCount: number
  confusionCount: number
}

export interface ConstellationMeasure {
  mapping: number
  pattern: 'ursa-major' | 'orion' | 'well-mapped' | 'partial-map' | 'random-stars' | 'chaos'
  hasHighMapping: boolean
  hasRecognizablePatterns: boolean
  hasProperConnections: boolean
  hasNoOrphans: boolean
  hasLogicalGrouping: boolean
  hasNoScattered: boolean
  hasProperHierarchy: boolean
  hasNoTangling: boolean
  hasClearBoundaries: boolean
  hasNoOverlapping: boolean
  orphanCount: number
  tanglingCount: number
}

export interface NavigationalMeasure {
  accuracy: number
  precision: 'gps-grade' | 'celestial-navigation' | 'dead-reckoning' | 'approximate' | 'lost' | 'shipwreck'
  hasHighAccuracy: boolean
  hasCorrectPaths: boolean
  hasNoWrongTurns: boolean
  hasAccurateLogic: boolean
  hasNoDeadEnds: boolean
  hasProperRouting: boolean
  hasNoCircularPaths: boolean
  hasReliableDestination: boolean
  hasNoBacktracking: boolean
  hasEfficientRoute: boolean
  wrongTurnCount: number
  deadEndCount: number
}

export interface StellarMeasure {
  clarity: number
  visibility: 'crystal-night' | 'clear-sky' | 'partly-cloudy' | 'light-pollution' | 'foggy' | 'blizzard'
  hasHighClarity: boolean
  hasReadableCode: boolean
  hasNoObfuscation: boolean
  hasClearNaming: boolean
  hasNoCryptography: boolean
  hasProperComments: boolean
  hasNoDarkZones: boolean
  hasVisibleLogic: boolean
  hasNoCamouflage: boolean
  hasTransparent: boolean
  obfuscationCount: number
  camouflageCount: number
}

export interface CosmicMeasure {
  awareness: number
  scope: 'cosmic-perspective' | 'galactic-view' | 'stellar-view' | 'planetary-view' | 'surface-level' | 'subterranean'
  hasHighAwareness: boolean
  hasProperContext: boolean
  hasNoTunnelVision: boolean
  hasBigPicture: boolean
  hasNoMyopia: boolean
  hasProperScoping: boolean
  hasNoOverreaching: boolean
  hasBalanced: boolean
  hasNoUnderreaching: boolean
  hasAwareness: boolean
  tunnelVisionCount: number
  overreachingCount: number
}

export interface GuidanceMeasure {
  quality: number
  rating: 'master-navigator' | 'skilled-pilot' | 'competent-helmsman' | 'learning-sailor' | 'lost-wanderer' | 'adrift'
  hasHighQuality: boolean
  hasClearDirections: boolean
  hasNoAmbiguity: boolean
  hasProperSignage: boolean
  hasNoMisdirection: boolean
  hasWaypoints: boolean
  hasNoConfusion: boolean
  hasProgressiveGuidance: boolean
  hasNoContradiction: boolean
  hasReliableMap: boolean
  ambiguityCount: number
  misdirectionCount: number
}

export interface StarPoint {
  file: string
  poleStar: number
  constellationMapping: number
  navigationalAccuracy: number
  stellarClarity: number
  cosmicAwareness: number
  guidanceQuality: number
  pole: PoleMeasure
  constellation: ConstellationMeasure
  navigational: NavigationalMeasure
  stellar: StellarMeasure
  cosmic: CosmicMeasure
  guidance: GuidanceMeasure
  condition: 'celestial-chart' | 'star-map' | 'navigational-aid' | 'rough-sketch' | 'smudged-drawing' | 'blank'
  qualityScore: number
}

export interface NightSky {
  directory: string
  points: StarPoint[]
  avgPoleStar: number
  avgMapping: number
  avgGuidance: number
  celestialCount: number
  blankCount: number
  brightCount: number
  accurateCount: number
  skyType: 'celestial-sphere' | 'night-hemisphere' | 'visible-sky' | 'cloudy-sky' | 'overcast' | 'void'
  condition: 'master-chart' | 'navigational-sky' | 'partly-mapped' | 'dim-sky' | 'darkness' | 'void'
}

export interface StarlightCompassResult {
  points: StarPoint[]
  skies: NightSky[]
  cosmos: {
    avgPoleStar: number
    avgMapping: number
    avgGuidance: number
    isNavigable: boolean
    overallNavigation: number
  }
  stats: {
    totalFiles: number
    totalSkies: number
    avgPoleStar: number
    avgConstellationMapping: number
    avgNavigationalAccuracy: number
    avgStellarClarity: number
    avgCosmicAwareness: number
    avgGuidanceQuality: number
    celestialChartCount: number
    starMapCount: number
    navigationalAidCount: number
    roughSketchCount: number
    smudgedDrawingCount: number
    blankCount: number
    hasHighStarCount: number
    hasHighMappingCount: number
    hasHighAccuracyCount: number
    hasHighClarityCount: number
    hasHighAwarenessCount: number
    hasHighQualityCount: number
    overallNavigation: number
    navigatorGrade: 'celestial-master' | 'master-navigator' | 'navigator' | 'apprentice' | 'landlubber' | 'lost-soul'
    bestPoint: string
    brightestPole: string
    bestMapped: string
    mostAccurate: string
    clearest: string
    bestGuidance: string
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
const RETURN_RE = /\breturn\b/
const NESTED_TERNARY_RE = /\?.*:.*\?.*:/
const CONSOLE_RE = /\bconsole\.\w+/g
const ANY_RE = /:\s*any\b/g
const EVAL_RE = /\beval\s*\(/g
const HACK_RE = /\bHACK\b/gi
const FIXME_RE = /\bFIXME\b/gi
const DEPRECATED_RE = /@deprecated/g
const DOC_COMMENT_RE = /\/\*\*[\s\S]*?\*\//g
const EMPTY_CATCH_RE = /catch\s*\(\w*\)\s*\{\s*\}/g

// ─── measurePole ─────────────────────────────────────────

/** @example measurePole(content) returns PoleMeasure */
export function measurePole(content: string): PoleMeasure {
  let score = 0

  const hasClearEntryPoint = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const hasProperInitialization = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const obscurityCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoObscurity = obscurityCount === 0
  const hasGuidingLight = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const confusionCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoConfusion = confusionCount === 0
  const hasReliable = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoShifting = !NESTED_TERNARY_RE.test(content)
  const hasFixed = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoDrift = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasClearEntryPoint) score += 12
  if (hasProperInitialization) score += 12
  if (hasNoObscurity) score += 10
  if (hasGuidingLight) score += 10
  if (hasNoConfusion) score += 11
  if (hasReliable) score += 10
  if (hasNoShifting) score += 10
  if (hasFixed) score += 10
  if (hasNoDrift) score += 10

  const star = Math.min(100, Math.max(0, score))
  const hasHighStar = star >= 70

  let brightness: PoleMeasure['brightness'] = 'invisible'
  if (hasHighStar && hasNoObscurity && hasClearEntryPoint && hasFixed) brightness = 'polaris-brilliant'
  else if (hasHighStar && hasNoObscurity) brightness = 'bright-guide'
  else if (hasHighStar) brightness = 'visible-star'
  else if (hasClearEntryPoint && hasGuidingLight) brightness = 'dim-star'
  else if (star > 30) brightness = 'flickering'

  return {
    star, brightness, hasHighStar, hasClearEntryPoint, hasProperInitialization,
    hasNoObscurity, hasGuidingLight, hasNoConfusion, hasReliable, hasNoShifting,
    hasFixed, hasNoDrift, obscurityCount, confusionCount,
  }
}

// ─── measureConstellation ────────────────────────────────

/** @example measureConstellation(content) returns ConstellationMeasure */
export function measureConstellation(content: string): ConstellationMeasure {
  let score = 0

  const hasRecognizablePatterns = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const hasProperConnections = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const orphanCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoOrphans = orphanCount === 0
  const hasLogicalGrouping = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoScattered = !NESTED_TERNARY_RE.test(content)
  const hasProperHierarchy = CLASS_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const tanglingCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoTangling = tanglingCount === 0
  const hasClearBoundaries = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoOverlapping = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasRecognizablePatterns) score += 12
  if (hasProperConnections) score += 10
  if (hasNoOrphans) score += 12
  if (hasLogicalGrouping) score += 10
  if (hasNoScattered) score += 10
  if (hasProperHierarchy) score += 10
  if (hasNoTangling) score += 11
  if (hasClearBoundaries) score += 10
  if (hasNoOverlapping) score += 10

  const mapping = Math.min(100, Math.max(0, score))
  const hasHighMapping = mapping >= 70

  let pattern: ConstellationMeasure['pattern'] = 'chaos'
  if (hasHighMapping && hasNoOrphans && hasRecognizablePatterns && hasLogicalGrouping) pattern = 'ursa-major'
  else if (hasHighMapping && hasNoOrphans) pattern = 'orion'
  else if (hasHighMapping) pattern = 'well-mapped'
  else if (hasRecognizablePatterns && hasProperConnections) pattern = 'partial-map'
  else if (mapping > 30) pattern = 'random-stars'

  return {
    mapping, pattern, hasHighMapping, hasRecognizablePatterns, hasProperConnections,
    hasNoOrphans, hasLogicalGrouping, hasNoScattered, hasProperHierarchy,
    hasNoTangling, hasClearBoundaries, hasNoOverlapping, orphanCount, tanglingCount,
  }
}

// ─── measureNavigational ─────────────────────────────────

/** @example measureNavigational(content) returns NavigationalMeasure */
export function measureNavigational(content: string): NavigationalMeasure {
  let score = 0

  const hasCorrectPaths = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoWrongTurns = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const wrongTurnCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasAccurateLogic = wrongTurnCount === 0
  const deadEndCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoDeadEnds = deadEndCount === 0
  const hasProperRouting = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoCircularPaths = !NESTED_TERNARY_RE.test(content)
  const hasReliableDestination = RETURN_RE.test(content)
  const hasNoBacktracking = (content.match(HACK_RE) || []).length === 0
  const hasEfficientRoute = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasCorrectPaths) score += 12
  if (hasNoWrongTurns) score += 10
  if (hasAccurateLogic) score += 12
  if (hasNoDeadEnds) score += 11
  if (hasProperRouting) score += 10
  if (hasNoCircularPaths) score += 10
  if (hasReliableDestination) score += 10
  if (hasNoBacktracking) score += 10
  if (hasEfficientRoute) score += 10

  const accuracy = Math.min(100, Math.max(0, score))
  const hasHighAccuracy = accuracy >= 70

  let precision: NavigationalMeasure['precision'] = 'shipwreck'
  if (hasHighAccuracy && hasAccurateLogic && hasCorrectPaths && hasEfficientRoute) precision = 'gps-grade'
  else if (hasHighAccuracy && hasAccurateLogic) precision = 'celestial-navigation'
  else if (hasHighAccuracy) precision = 'dead-reckoning'
  else if (hasCorrectPaths && hasNoWrongTurns) precision = 'approximate'
  else if (accuracy > 30) precision = 'lost'

  return {
    accuracy, precision, hasHighAccuracy, hasCorrectPaths, hasNoWrongTurns,
    hasAccurateLogic, hasNoDeadEnds, hasProperRouting, hasNoCircularPaths,
    hasReliableDestination, hasNoBacktracking, hasEfficientRoute, wrongTurnCount, deadEndCount,
  }
}

// ─── measureStellar ──────────────────────────────────────

/** @example measureStellar(content) returns StellarMeasure */
export function measureStellar(content: string): StellarMeasure {
  let score = 0

  const hasReadableCode = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const obfuscationCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoObfuscation = obfuscationCount === 0
  const hasClearNaming = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoCryptography = !NESTED_TERNARY_RE.test(content)
  const hasProperComments = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoDarkZones = (content.match(CONSOLE_RE) || []).length === 0
  const hasVisibleLogic = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const camouflageCount = (content.match(HACK_RE) || []).length + (content.match(DEPRECATED_RE) || []).length
  const hasNoCamouflage = camouflageCount === 0
  const hasTransparent = TRY_RE.test(content) && CATCH_RE.test(content)

  if (content.length > 0) score += 5
  if (hasReadableCode) score += 12
  if (hasNoObfuscation) score += 12
  if (hasClearNaming) score += 10
  if (hasNoCryptography) score += 10
  if (hasProperComments) score += 10
  if (hasNoDarkZones) score += 10
  if (hasVisibleLogic) score += 11
  if (hasNoCamouflage) score += 10
  if (hasTransparent) score += 10

  const clarity = Math.min(100, Math.max(0, score))
  const hasHighClarity = clarity >= 70

  let visibility: StellarMeasure['visibility'] = 'blizzard'
  if (hasHighClarity && hasNoObfuscation && hasProperComments && hasClearNaming) visibility = 'crystal-night'
  else if (hasHighClarity && hasNoObfuscation) visibility = 'clear-sky'
  else if (hasHighClarity) visibility = 'partly-cloudy'
  else if (hasClearNaming && hasVisibleLogic) visibility = 'light-pollution'
  else if (clarity > 30) visibility = 'foggy'

  return {
    clarity, visibility, hasHighClarity, hasReadableCode, hasNoObfuscation,
    hasClearNaming, hasNoCryptography, hasProperComments, hasNoDarkZones,
    hasVisibleLogic, hasNoCamouflage, hasTransparent, obfuscationCount, camouflageCount,
  }
}

// ─── measureCosmic ───────────────────────────────────────

/** @example measureCosmic(content) returns CosmicMeasure */
export function measureCosmic(content: string): CosmicMeasure {
  let score = 0

  const hasProperContext = INTERFACE_RE.test(content) && EXPORT_RE.test(content)
  const tunnelVisionCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoTunnelVision = tunnelVisionCount === 0
  const hasBigPicture = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoMyopia = !NESTED_TERNARY_RE.test(content)
  const hasProperScoping = CLASS_RE.test(content) && TYPE_RE.test(content)
  const overreachingCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoOverreaching = overreachingCount === 0
  const hasBalanced = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoUnderreaching = (content.match(HACK_RE) || []).length === 0 && (content.match(FIXME_RE) || []).length === 0
  const hasAwareness = IMPORT_RE.test(content) && EXPORT_RE.test(content)

  if (content.length > 0) score += 5
  if (hasProperContext) score += 12
  if (hasNoTunnelVision) score += 12
  if (hasBigPicture) score += 10
  if (hasNoMyopia) score += 10
  if (hasProperScoping) score += 10
  if (hasNoOverreaching) score += 10
  if (hasBalanced) score += 10
  if (hasNoUnderreaching) score += 11
  if (hasAwareness) score += 10

  const awareness = Math.min(100, Math.max(0, score))
  const hasHighAwareness = awareness >= 70

  let scope: CosmicMeasure['scope'] = 'subterranean'
  if (hasHighAwareness && hasNoTunnelVision && hasProperContext && hasBigPicture) scope = 'cosmic-perspective'
  else if (hasHighAwareness && hasNoTunnelVision) scope = 'galactic-view'
  else if (hasHighAwareness) scope = 'stellar-view'
  else if (hasProperContext && hasAwareness) scope = 'planetary-view'
  else if (awareness > 30) scope = 'surface-level'

  return {
    awareness, scope, hasHighAwareness, hasProperContext, hasNoTunnelVision,
    hasBigPicture, hasNoMyopia, hasProperScoping, hasNoOverreaching,
    hasBalanced, hasNoUnderreaching, hasAwareness, tunnelVisionCount, overreachingCount,
  }
}

// ─── measureGuidance ─────────────────────────────────────

/** @example measureGuidance(content) returns GuidanceMeasure */
export function measureGuidance(content: string): GuidanceMeasure {
  let score = 0

  const hasClearDirections = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const ambiguityCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoAmbiguity = ambiguityCount === 0
  const hasProperSignage = (content.match(DOC_COMMENT_RE) || []).length > 0
  const misdirectionCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoMisdirection = misdirectionCount === 0
  const hasWaypoints = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasNoConfusion = !NESTED_TERNARY_RE.test(content)
  const hasProgressiveGuidance = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoContradiction = (content.match(HACK_RE) || []).length === 0
  const hasReliableMap = ASYNC_RE.test(content) && AWAIT_RE.test(content)

  if (content.length > 0) score += 5
  if (hasClearDirections) score += 12
  if (hasNoAmbiguity) score += 12
  if (hasProperSignage) score += 10
  if (hasNoMisdirection) score += 10
  if (hasWaypoints) score += 10
  if (hasNoConfusion) score += 10
  if (hasProgressiveGuidance) score += 11
  if (hasNoContradiction) score += 10
  if (hasReliableMap) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let rating: GuidanceMeasure['rating'] = 'adrift'
  if (hasHighQuality && hasNoAmbiguity && hasClearDirections && hasProperSignage) rating = 'master-navigator'
  else if (hasHighQuality && hasNoAmbiguity) rating = 'skilled-pilot'
  else if (hasHighQuality) rating = 'competent-helmsman'
  else if (hasClearDirections && hasWaypoints) rating = 'learning-sailor'
  else if (quality > 30) rating = 'lost-wanderer'

  return {
    quality, rating, hasHighQuality, hasClearDirections, hasNoAmbiguity,
    hasProperSignage, hasNoMisdirection, hasWaypoints, hasNoConfusion,
    hasProgressiveGuidance, hasNoContradiction, hasReliableMap, ambiguityCount, misdirectionCount,
  }
}

// ─── classifyCondition ───────────────────────────────────

/** @example classifyCondition(point) returns condition */
export function classifyCondition(point: StarPoint): StarPoint['condition'] {
  const { qualityScore } = point
  if (qualityScore >= 80) return 'celestial-chart'
  if (qualityScore >= 65) return 'star-map'
  if (qualityScore >= 50) return 'navigational-aid'
  if (qualityScore >= 35) return 'rough-sketch'
  if (qualityScore >= 20) return 'smudged-drawing'
  return 'blank'
}

// ─── analyzeStarPoint ────────────────────────────────────

/** @example analyzeStarPoint(content, filePath) returns StarPoint */
export function analyzeStarPoint(content: string, filePath: string): StarPoint {
  const pole = measurePole(content)
  const constellation = measureConstellation(content)
  const navigational = measureNavigational(content)
  const stellar = measureStellar(content)
  const cosmic = measureCosmic(content)
  const guidance = measureGuidance(content)

  const poleStar = pole.star
  const constellationMapping = constellation.mapping
  const navigationalAccuracy = navigational.accuracy
  const stellarClarity = stellar.clarity
  const cosmicAwareness = cosmic.awareness
  const guidanceQuality = guidance.quality

  const qualityScore = Math.round(
    poleStar * 0.15 +
    constellationMapping * 0.15 +
    navigationalAccuracy * 0.2 +
    stellarClarity * 0.15 +
    cosmicAwareness * 0.15 +
    guidanceQuality * 0.2,
  )

  const result: StarPoint = {
    file: filePath,
    poleStar, constellationMapping, navigationalAccuracy,
    stellarClarity, cosmicAwareness, guidanceQuality,
    pole, constellation, navigational, stellar, cosmic, guidance,
    qualityScore,
    condition: 'blank',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── classifySkyType ─────────────────────────────────────

/** @example classifySkyType(points) returns sky type */
export function classifySkyType(points: StarPoint[]): NightSky['skyType'] {
  if (points.length === 0) return 'void'
  const avgScore = points.reduce((s, p) => s + p.qualityScore, 0) / points.length
  const celestialCnt = points.filter((p) => p.condition === 'celestial-chart').length
  if (avgScore >= 75 && celestialCnt >= Math.ceil(points.length * 0.3)) return 'celestial-sphere'
  if (avgScore >= 60) return 'night-hemisphere'
  if (avgScore >= 45) return 'visible-sky'
  if (avgScore >= 30) return 'cloudy-sky'
  if (avgScore >= 15) return 'overcast'
  return 'void'
}

// ─── analyzeNightSky ─────────────────────────────────────

/** @example analyzeNightSky(points, dirPath) returns NightSky */
export function analyzeNightSky(points: StarPoint[], dirPath: string): NightSky {
  if (points.length === 0) {
    return {
      directory: dirPath, points: [], avgPoleStar: 0, avgMapping: 0, avgGuidance: 0,
      celestialCount: 0, blankCount: 0, brightCount: 0, accurateCount: 0,
      skyType: 'void', condition: 'void',
    }
  }

  const avgPoleStar = Math.round(points.reduce((s, p) => s + p.poleStar, 0) / points.length)
  const avgMapping = Math.round(points.reduce((s, p) => s + p.constellationMapping, 0) / points.length)
  const avgGuidance = Math.round(points.reduce((s, p) => s + p.guidanceQuality, 0) / points.length)
  const celestialCount = points.filter((p) => p.condition === 'celestial-chart').length
  const blankCount = points.filter((p) => p.condition === 'blank').length
  const brightCount = points.filter((p) => p.pole.hasHighStar).length
  const accurateCount = points.filter((p) => p.navigational.hasHighAccuracy).length

  const skyType = classifySkyType(points)
  const avgScore = points.reduce((s, p) => s + p.qualityScore, 0) / points.length
  let condition: NightSky['condition'] = 'void'
  if (avgScore >= 75) condition = 'master-chart'
  else if (avgScore >= 60) condition = 'navigational-sky'
  else if (avgScore >= 45) condition = 'partly-mapped'
  else if (avgScore >= 30) condition = 'dim-sky'
  else if (avgScore >= 15) condition = 'darkness'

  return {
    directory: dirPath, points, avgPoleStar, avgMapping, avgGuidance,
    celestialCount, blankCount, brightCount, accurateCount, skyType, condition,
  }
}

// ─── classifyNavigatorGrade ──────────────────────────────

/** @example classifyNavigatorGrade(avgNavigation) returns grade */
export function classifyNavigatorGrade(avgNavigation: number): StarlightCompassResult['stats']['navigatorGrade'] {
  if (avgNavigation >= 80) return 'celestial-master'
  if (avgNavigation >= 65) return 'master-navigator'
  if (avgNavigation >= 50) return 'navigator'
  if (avgNavigation >= 35) return 'apprentice'
  if (avgNavigation >= 20) return 'landlubber'
  return 'lost-soul'
}

// ─── generateRecommendations ─────────────────────────────

/** @example generateRecommendations(points, skies, cosmos, stats) returns string[] */
export function generateRecommendations(
  points: StarPoint[],
  skies: NightSky[],
  cosmos: StarlightCompassResult['cosmos'],
  stats: StarlightCompassResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgPoleStar < 50) recs.push('Strengthen pole star — add clear exports and interfaces for entry point clarity')
  if (stats.avgConstellationMapping < 50) recs.push('Improve constellation mapping — organize code structure with proper patterns')
  if (stats.avgNavigationalAccuracy < 50) recs.push('Enhance navigational accuracy — reduce any/eval for correct code paths')
  if (stats.avgStellarClarity < 50) recs.push('Boost stellar clarity — add documentation and reduce obfuscation')
  if (stats.avgCosmicAwareness < 50) recs.push('Expand cosmic awareness — improve code context and reduce tunnel vision')
  if (stats.avgGuidanceQuality < 50) recs.push('Improve guidance quality — add type annotations and reduce ambiguity')
  if (stats.blankCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of points are blank — consider major refactoring')
  if (stats.smudgedDrawingCount > 0) recs.push('Warning: smudged drawings detected — these files need clarity')
  if (cosmos.overallNavigation < 40) recs.push('Overall navigation is critically low — establish a starlight recovery plan')
  if (skies.length > 0 && skies.every((s) => s.condition === 'void')) recs.push('All skies are void — your codebase needs fundamental navigation setup')

  if (points.length > 0) {
    const highObscurity = points.filter((p) => p.pole.obscurityCount > 2)
    if (highObscurity.length > points.length * 0.5) recs.push('Over 50% of points have high obscurity — reduce any/eval usage')
  }

  return recs
}

// ─── buildStarlightCompassResult ─────────────────────────

/** @example buildStarlightCompassResult(files, contents, options) returns full result */
export function buildStarlightCompassResult(files: string[], contents: string[], _options?: Record<string, unknown>): StarlightCompassResult {
  const points = files.map((file, i) => analyzeStarPoint(contents[i] ?? '', file))

  const skyMap = new Map<string, StarPoint[]>()
  points.forEach((point) => {
    const parts = point.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = skyMap.get(dir)
    if (existing) existing.push(point)
    else skyMap.set(dir, [point])
  })

  const skies = Array.from(skyMap.entries()).map(([dir, ps]) => analyzeNightSky(ps, dir))

  const avgPoleStar = points.length > 0 ? Math.round(points.reduce((s, p) => s + p.poleStar, 0) / points.length) : 0
  const avgConstellationMapping = points.length > 0 ? Math.round(points.reduce((s, p) => s + p.constellationMapping, 0) / points.length) : 0
  const avgNavigationalAccuracy = points.length > 0 ? Math.round(points.reduce((s, p) => s + p.navigationalAccuracy, 0) / points.length) : 0
  const avgStellarClarity = points.length > 0 ? Math.round(points.reduce((s, p) => s + p.stellarClarity, 0) / points.length) : 0
  const avgCosmicAwareness = points.length > 0 ? Math.round(points.reduce((s, p) => s + p.cosmicAwareness, 0) / points.length) : 0
  const avgGuidanceQuality = points.length > 0 ? Math.round(points.reduce((s, p) => s + p.guidanceQuality, 0) / points.length) : 0

  const overallNavigation = Math.round(
    avgPoleStar * 0.15 +
    avgConstellationMapping * 0.15 +
    avgNavigationalAccuracy * 0.2 +
    avgStellarClarity * 0.15 +
    avgCosmicAwareness * 0.15 +
    avgGuidanceQuality * 0.2,
  )

  const cosmos = {
    avgPoleStar,
    avgMapping: avgConstellationMapping,
    avgGuidance: avgGuidanceQuality,
    isNavigable: overallNavigation >= 60,
    overallNavigation,
  }

  const stats = {
    totalFiles: files.length,
    totalSkies: skies.length,
    avgPoleStar,
    avgConstellationMapping,
    avgNavigationalAccuracy,
    avgStellarClarity,
    avgCosmicAwareness,
    avgGuidanceQuality,
    celestialChartCount: points.filter((p) => p.condition === 'celestial-chart').length,
    starMapCount: points.filter((p) => p.condition === 'star-map').length,
    navigationalAidCount: points.filter((p) => p.condition === 'navigational-aid').length,
    roughSketchCount: points.filter((p) => p.condition === 'rough-sketch').length,
    smudgedDrawingCount: points.filter((p) => p.condition === 'smudged-drawing').length,
    blankCount: points.filter((p) => p.condition === 'blank').length,
    hasHighStarCount: points.filter((p) => p.pole.hasHighStar).length,
    hasHighMappingCount: points.filter((p) => p.constellation.hasHighMapping).length,
    hasHighAccuracyCount: points.filter((p) => p.navigational.hasHighAccuracy).length,
    hasHighClarityCount: points.filter((p) => p.stellar.hasHighClarity).length,
    hasHighAwarenessCount: points.filter((p) => p.cosmic.hasHighAwareness).length,
    hasHighQualityCount: points.filter((p) => p.guidance.hasHighQuality).length,
    overallNavigation,
    navigatorGrade: classifyNavigatorGrade(overallNavigation),
    bestPoint: '',
    brightestPole: '',
    bestMapped: '',
    mostAccurate: '',
    clearest: '',
    bestGuidance: '',
  }

  if (points.length > 0) {
    stats.bestPoint = points.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.brightestPole = points.reduce((a, b) => a.poleStar >= b.poleStar ? a : b).file
    stats.bestMapped = points.reduce((a, b) => a.constellationMapping >= b.constellationMapping ? a : b).file
    stats.mostAccurate = points.reduce((a, b) => a.navigationalAccuracy >= b.navigationalAccuracy ? a : b).file
    stats.clearest = points.reduce((a, b) => a.stellarClarity >= b.stellarClarity ? a : b).file
    stats.bestGuidance = points.reduce((a, b) => a.guidanceQuality >= b.guidanceQuality ? a : b).file
  }

  const recommendations = generateRecommendations(points, skies, cosmos, stats)

  return { points, skies, cosmos, stats, recommendations }
}
