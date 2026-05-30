// ─── Interfaces ───────────────────────────────────────────

export interface BeaconMeasure {
  strength: number
  intensity: 'million-candlepower' | 'powerful-beacon' | 'bright-light' | 'standard' | 'dim-bulb' | 'dark'
  hasHighStrength: boolean
  hasVisibleEntry: boolean
  hasProperSignaling: boolean
  hasNoDarkZones: boolean
  hasConsistent: boolean
  hasNoFlickering: boolean
  hasClearPurpose: boolean
  hasNoObscurity: boolean
  hasReachable: boolean
  hasNoHidden: boolean
  darkZoneCount: number
  flickeringCount: number
}

export interface FogMeasure {
  penetration: number
  clarity: 'crystal-piercing' | 'fog-cutting' | 'penetrating' | 'moderate' | 'dim' | 'opaque'
  hasHighPenetration: boolean
  hasClearInComplexity: boolean
  hasProperAbstraction: boolean
  hasNoConfusion: boolean
  hasVisibleLogic: boolean
  hasNoObfuscation: boolean
  hasTransparent: boolean
  hasNoMuddying: boolean
  hasNavigable: boolean
  hasNoImpenetrable: boolean
  confusionCount: number
  obfuscationCount: number
}

export interface WarningMeasure {
  system: number
  effectiveness: 'fail-safe-system' | 'excellent-warning' | 'proper-alert' | 'basic-signal' | 'faint-horn' | 'silent'
  hasHighSystem: boolean
  hasProperErrorHandling: boolean
  hasEarlyWarning: boolean
  hasNoSilentFailure: boolean
  hasClearMessages: boolean
  hasNoSwallowedErrors: boolean
  hasProperValidation: boolean
  hasNoMissedErrors: boolean
  hasGracefulDegradation: boolean
  hasNoCascadeFailure: boolean
  silentFailureCount: number
  swallowedCount: number
}

export interface FoundationMeasure {
  stability: number
  bedrock: 'granite-bedrock' | 'solid-foundation' | 'concrete-base' | 'wooden-pier' | 'sandbar' | 'quicksand'
  hasHighStability: boolean
  hasSolidBase: boolean
  hasProperStructure: boolean
  hasNoErosion: boolean
  hasReinforced: boolean
  hasNoCracking: boolean
  hasProperAnchoring: boolean
  hasNoSettling: boolean
  hasWeathered: boolean
  hasNoDegradation: boolean
  erosionCount: number
  crackingCount: number
}

export interface CoverageMeasure {
  level: number
  sweep: '360-degree' | 'wide-sweep' | 'good-coverage' | 'partial-sweep' | 'narrow-beam' | 'no-rotation'
  hasHighLevel: boolean
  hasCompletePaths: boolean
  hasNoDeadAngles: boolean
  hasProperScope: boolean
  hasNoBlindSpots: boolean
  hasThorough: boolean
  hasNoGaps: boolean
  hasProperExtent: boolean
  hasComprehensive: boolean
  hasNoMissingPaths: boolean
  deadAngleCount: number
  blindSpotCount: number
}

export interface GuidanceMeasure {
  quality: number
  rating: 'master-pilot' | 'skilled-navigator' | 'reliable-guide' | 'basic-aid' | 'unreliable' | 'misleading'
  hasHighQuality: boolean
  hasClearDirections: boolean
  hasNoAmbiguity: boolean
  hasProperFlow: boolean
  hasNoConfusion: boolean
  hasProgressive: boolean
  hasNoContradiction: boolean
  hasReliable: boolean
  hasNoMisdirection: boolean
  hasConsistent: boolean
  ambiguityCount: number
  contradictionCount: number
}

export interface BeaconRay {
  file: string
  beaconStrength: number
  fogPenetration: number
  warningSystem: number
  foundationStability: number
  rotatingCoverage: number
  guidanceQuality: number
  beacon: BeaconMeasure
  fog: FogMeasure
  warning: WarningMeasure
  foundation: FoundationMeasure
  coverage: CoverageMeasure
  guidance: GuidanceMeasure
  condition: 'coastal-masterpiece' | 'reliable-beacon' | 'functional-light' | 'flickering-candle' | 'broken-lens' | 'dark-tower'
  qualityScore: number
}

export interface Coastline {
  directory: string
  rays: BeaconRay[]
  avgBeacon: number
  avgWarning: number
  avgGuidance: number
  masterpieceCount: number
  darkCount: number
  brightCount: number
  reliableCount: number
  coastlineType: 'major-lighthouse' | 'harbor-light' | 'coastal-beacon' | 'channel-marker' | 'buoy' | 'darkness'
  condition: 'illuminated-coast' | 'well-lit-harbor' | 'guided-channel' | 'dim-shoreline' | 'dark-coast' | 'void'
}

export interface AmberLighthouseResult {
  rays: BeaconRay[]
  coastlines: Coastline[]
  coast: {
    avgBeacon: number
    avgWarning: number
    avgGuidance: number
    isIlluminated: boolean
    overallIllumination: number
  }
  stats: {
    totalFiles: number
    totalCoastlines: number
    avgBeaconStrength: number
    avgFogPenetration: number
    avgWarningSystem: number
    avgFoundationStability: number
    avgRotatingCoverage: number
    avgGuidanceQuality: number
    coastalMasterpieceCount: number
    reliableBeaconCount: number
    functionalLightCount: number
    flickeringCandleCount: number
    brokenLensCount: number
    darkTowerCount: number
    hasHighStrengthCount: number
    hasHighPenetrationCount: number
    hasHighSystemCount: number
    hasHighStabilityCount: number
    hasHighLevelCount: number
    hasHighQualityCount: number
    overallIllumination: number
    keeperGrade: 'master-keeper' | 'lighthouse-keeper' | 'watchman' | 'tender' | 'observer' | 'absentee'
    bestRay: string
    brightest: string
    clearestInFog: string
    bestWarnings: string
    mostStable: string
    mostComplete: string
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
const NESTED_TERNARY_RE = /\?.*:.*\?.*:/
const CONSOLE_RE = /\bconsole\.\w+/g
const ANY_RE = /:\s*any\b/g
const EVAL_RE = /\beval\s*\(/g
const HACK_RE = /\bHACK\b/gi
const FIXME_RE = /\bFIXME\b/gi
const DOC_COMMENT_RE = /\/\*\*[\s\S]*?\*\//g
const EMPTY_CATCH_RE = /catch\s*\(\w*\)\s*\{\s*\}/g

// ─── measureBeacon ───────────────────────────────────────

/** @example measureBeacon(content) returns BeaconMeasure */
export function measureBeacon(content: string): BeaconMeasure {
  let score = 0

  const hasVisibleEntry = INTERFACE_RE.test(content) && EXPORT_RE.test(content)
  const darkZoneCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDarkZones = darkZoneCount === 0
  const hasProperSignaling = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const flickeringCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoFlickering = flickeringCount === 0
  const hasConsistent = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasClearPurpose = CLASS_RE.test(content) && INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoObscurity = !NESTED_TERNARY_RE.test(content)
  const hasReachable = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoHidden = (content.match(EMPTY_CATCH_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasVisibleEntry) score += 12
  if (hasNoDarkZones) score += 12
  if (hasProperSignaling) score += 10
  if (hasNoFlickering) score += 10
  if (hasConsistent) score += 10
  if (hasClearPurpose) score += 11
  if (hasNoObscurity) score += 10
  if (hasReachable) score += 10
  if (hasNoHidden) score += 10

  const strength = Math.min(100, Math.max(0, score))
  const hasHighStrength = strength >= 70

  let intensity: BeaconMeasure['intensity'] = 'dark'
  if (hasHighStrength && hasNoDarkZones && hasClearPurpose && (content.match(DOC_COMMENT_RE) || []).length > 0) intensity = 'million-candlepower'
  else if (hasHighStrength && hasNoDarkZones) intensity = 'powerful-beacon'
  else if (hasHighStrength) intensity = 'bright-light'
  else if (hasVisibleEntry && hasProperSignaling) intensity = 'standard'
  else if (strength > 30) intensity = 'dim-bulb'

  return {
    strength, intensity, hasHighStrength, hasVisibleEntry, hasProperSignaling,
    hasNoDarkZones, hasConsistent, hasNoFlickering, hasClearPurpose, hasNoObscurity,
    hasReachable, hasNoHidden, darkZoneCount, flickeringCount,
  }
}

// ─── measureFog ──────────────────────────────────────────

/** @example measureFog(content) returns FogMeasure */
export function measureFog(content: string): FogMeasure {
  let score = 0

  const hasClearInComplexity = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const confusionCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoConfusion = confusionCount === 0
  const hasProperAbstraction = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const obfuscationCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoObfuscation = obfuscationCount === 0
  const hasVisibleLogic = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasTransparent = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoMuddying = (content.match(CONSOLE_RE) || []).length === 0
  const hasNavigable = CLASS_RE.test(content) && INTERFACE_RE.test(content)
  const hasNoImpenetrable = !NESTED_TERNARY_RE.test(content)

  if (content.length > 0) score += 5
  if (hasClearInComplexity) score += 12
  if (hasNoConfusion) score += 12
  if (hasProperAbstraction) score += 10
  if (hasNoObfuscation) score += 10
  if (hasVisibleLogic) score += 10
  if (hasTransparent) score += 10
  if (hasNoMuddying) score += 11
  if (hasNavigable) score += 10
  if (hasNoImpenetrable) score += 10

  const penetration = Math.min(100, Math.max(0, score))
  const hasHighPenetration = penetration >= 70

  let clarity: FogMeasure['clarity'] = 'opaque'
  if (hasHighPenetration && hasNoConfusion && hasClearInComplexity && (content.match(DOC_COMMENT_RE) || []).length > 0) clarity = 'crystal-piercing'
  else if (hasHighPenetration && hasNoConfusion) clarity = 'fog-cutting'
  else if (hasHighPenetration) clarity = 'penetrating'
  else if (hasClearInComplexity && hasProperAbstraction) clarity = 'moderate'
  else if (penetration > 30) clarity = 'dim'

  return {
    penetration, clarity, hasHighPenetration, hasClearInComplexity, hasProperAbstraction,
    hasNoConfusion, hasVisibleLogic, hasNoObfuscation, hasTransparent, hasNoMuddying,
    hasNavigable, hasNoImpenetrable, confusionCount, obfuscationCount,
  }
}

// ─── measureWarning ──────────────────────────────────────

/** @example measureWarning(content) returns WarningMeasure */
export function measureWarning(content: string): WarningMeasure {
  let score = 0

  const hasProperErrorHandling = TRY_RE.test(content) && CATCH_RE.test(content)
  const silentFailureCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoSilentFailure = silentFailureCount === 0
  const hasEarlyWarning = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const swallowedCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoSwallowedErrors = swallowedCount === 0
  const hasClearMessages = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasProperValidation = CLASS_RE.test(content) && INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoMissedErrors = (content.match(HACK_RE) || []).length === 0 && (content.match(FIXME_RE) || []).length === 0
  const hasGracefulDegradation = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoCascadeFailure = !NESTED_TERNARY_RE.test(content)
  const hasDocGuidance = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasProperErrorHandling) score += 12
  if (hasNoSilentFailure) score += 12
  if (hasEarlyWarning) score += 10
  if (hasNoSwallowedErrors) score += 10
  if (hasClearMessages) score += 10
  if (hasProperValidation) score += 11
  if (hasNoMissedErrors) score += 10
  if (hasGracefulDegradation) score += 10
  if (hasNoCascadeFailure) score += 10

  const system = Math.min(100, Math.max(0, score))
  const hasHighSystem = system >= 70

  let effectiveness: WarningMeasure['effectiveness'] = 'silent'
  if (hasHighSystem && hasNoSilentFailure && hasProperErrorHandling && hasDocGuidance) effectiveness = 'fail-safe-system'
  else if (hasHighSystem && hasNoSilentFailure) effectiveness = 'excellent-warning'
  else if (hasHighSystem) effectiveness = 'proper-alert'
  else if (hasProperErrorHandling && hasClearMessages) effectiveness = 'basic-signal'
  else if (system > 30) effectiveness = 'faint-horn'

  return {
    system, effectiveness, hasHighSystem, hasProperErrorHandling, hasEarlyWarning,
    hasNoSilentFailure, hasClearMessages, hasNoSwallowedErrors, hasProperValidation,
    hasNoMissedErrors, hasGracefulDegradation, hasNoCascadeFailure,
    silentFailureCount, swallowedCount,
  }
}

// ─── measureFoundation ───────────────────────────────────

/** @example measureFoundation(content) returns FoundationMeasure */
export function measureFoundation(content: string): FoundationMeasure {
  let score = 0

  const hasSolidBase = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const erosionCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoErosion = erosionCount === 0
  const hasProperStructure = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const crackingCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoCracking = crackingCount === 0
  const hasReinforced = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasProperAnchoring = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoSettling = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasWeathered = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoDegradation = !NESTED_TERNARY_RE.test(content)

  if (content.length > 0) score += 5
  if (hasSolidBase) score += 12
  if (hasNoErosion) score += 12
  if (hasProperStructure) score += 10
  if (hasNoCracking) score += 10
  if (hasReinforced) score += 10
  if (hasProperAnchoring) score += 10
  if (hasNoSettling) score += 10
  if (hasWeathered) score += 11
  if (hasNoDegradation) score += 10

  const stability = Math.min(100, Math.max(0, score))
  const hasHighStability = stability >= 70

  let bedrock: FoundationMeasure['bedrock'] = 'quicksand'
  if (hasHighStability && hasNoErosion && hasSolidBase && hasWeathered) bedrock = 'granite-bedrock'
  else if (hasHighStability && hasNoErosion) bedrock = 'solid-foundation'
  else if (hasHighStability) bedrock = 'concrete-base'
  else if (hasSolidBase && hasProperStructure) bedrock = 'wooden-pier'
  else if (stability > 30) bedrock = 'sandbar'

  return {
    stability, bedrock, hasHighStability, hasSolidBase, hasProperStructure,
    hasNoErosion, hasReinforced, hasNoCracking, hasProperAnchoring, hasNoSettling,
    hasWeathered, hasNoDegradation, erosionCount, crackingCount,
  }
}

// ─── measureCoverage ─────────────────────────────────────

/** @example measureCoverage(content) returns CoverageMeasure */
export function measureCoverage(content: string): CoverageMeasure {
  let score = 0

  const hasCompletePaths = INTERFACE_RE.test(content) && EXPORT_RE.test(content) && TYPE_RE.test(content)
  const deadAngleCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDeadAngles = deadAngleCount === 0
  const hasProperScope = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const blindSpotCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoBlindSpots = blindSpotCount === 0
  const hasThorough = CLASS_RE.test(content) && INTERFACE_RE.test(content)
  const hasNoGaps = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasProperExtent = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasComprehensive = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoMissingPaths = !NESTED_TERNARY_RE.test(content)

  if (content.length > 0) score += 5
  if (hasCompletePaths) score += 12
  if (hasNoDeadAngles) score += 12
  if (hasProperScope) score += 10
  if (hasNoBlindSpots) score += 10
  if (hasThorough) score += 10
  if (hasNoGaps) score += 10
  if (hasProperExtent) score += 10
  if (hasComprehensive) score += 11
  if (hasNoMissingPaths) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let sweep: CoverageMeasure['sweep'] = 'no-rotation'
  if (hasHighLevel && hasNoDeadAngles && hasCompletePaths && hasComprehensive) sweep = '360-degree'
  else if (hasHighLevel && hasNoDeadAngles) sweep = 'wide-sweep'
  else if (hasHighLevel) sweep = 'good-coverage'
  else if (hasCompletePaths && hasProperScope) sweep = 'partial-sweep'
  else if (level > 30) sweep = 'narrow-beam'

  return {
    level, sweep, hasHighLevel, hasCompletePaths, hasNoDeadAngles,
    hasProperScope, hasNoBlindSpots, hasThorough, hasNoGaps, hasProperExtent,
    hasComprehensive, hasNoMissingPaths, deadAngleCount, blindSpotCount,
  }
}

// ─── measureGuidance ─────────────────────────────────────

/** @example measureGuidance(content) returns GuidanceMeasure */
export function measureGuidance(content: string): GuidanceMeasure {
  let score = 0

  const hasClearDirections = INTERFACE_RE.test(content) && EXPORT_RE.test(content)
  const ambiguityCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoAmbiguity = ambiguityCount === 0
  const hasProperFlow = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const contradictionCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoConfusion = contradictionCount === 0
  const hasProgressive = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoContradiction = !NESTED_TERNARY_RE.test(content)
  const hasReliable = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoMisdirection = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasConsistent = CLASS_RE.test(content) && INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasDocGuidance = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasClearDirections) score += 12
  if (hasNoAmbiguity) score += 12
  if (hasProperFlow) score += 10
  if (hasNoConfusion) score += 10
  if (hasProgressive) score += 10
  if (hasNoContradiction) score += 10
  if (hasReliable) score += 11
  if (hasNoMisdirection) score += 10
  if (hasConsistent) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let rating: GuidanceMeasure['rating'] = 'misleading'
  if (hasHighQuality && hasNoAmbiguity && hasConsistent && hasDocGuidance) rating = 'master-pilot'
  else if (hasHighQuality && hasNoAmbiguity) rating = 'skilled-navigator'
  else if (hasHighQuality) rating = 'reliable-guide'
  else if (hasClearDirections && hasProperFlow) rating = 'basic-aid'
  else if (quality > 30) rating = 'unreliable'

  return {
    quality, rating, hasHighQuality, hasClearDirections, hasNoAmbiguity,
    hasProperFlow, hasNoConfusion, hasProgressive, hasNoContradiction,
    hasReliable, hasNoMisdirection, hasConsistent, ambiguityCount, contradictionCount,
  }
}

// ─── classifyCondition ───────────────────────────────────

/** @example classifyCondition(ray) returns condition */
export function classifyCondition(ray: BeaconRay): BeaconRay['condition'] {
  const { qualityScore } = ray
  if (qualityScore >= 80) return 'coastal-masterpiece'
  if (qualityScore >= 65) return 'reliable-beacon'
  if (qualityScore >= 50) return 'functional-light'
  if (qualityScore >= 35) return 'flickering-candle'
  if (qualityScore >= 20) return 'broken-lens'
  return 'dark-tower'
}

// ─── analyzeBeaconRay ────────────────────────────────────

/** @example analyzeBeaconRay(content, filePath) returns BeaconRay */
export function analyzeBeaconRay(content: string, filePath: string): BeaconRay {
  const beacon = measureBeacon(content)
  const fog = measureFog(content)
  const warning = measureWarning(content)
  const foundation = measureFoundation(content)
  const coverage = measureCoverage(content)
  const guidance = measureGuidance(content)

  const beaconStrength = beacon.strength
  const fogPenetration = fog.penetration
  const warningSystem = warning.system
  const foundationStability = foundation.stability
  const rotatingCoverage = coverage.level
  const guidanceQuality = guidance.quality

  const qualityScore = Math.round(
    beaconStrength * 0.15 +
    fogPenetration * 0.15 +
    warningSystem * 0.2 +
    foundationStability * 0.2 +
    rotatingCoverage * 0.15 +
    guidanceQuality * 0.15,
  )

  const result: BeaconRay = {
    file: filePath,
    beaconStrength, fogPenetration, warningSystem,
    foundationStability, rotatingCoverage, guidanceQuality,
    beacon, fog, warning, foundation, coverage, guidance,
    qualityScore,
    condition: 'dark-tower',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── classifyCoastlineType ───────────────────────────────

/** @example classifyCoastlineType(rays) returns coastline type */
export function classifyCoastlineType(rays: BeaconRay[]): Coastline['coastlineType'] {
  if (rays.length === 0) return 'darkness'
  const avgScore = rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length
  const masterCnt = rays.filter((r) => r.condition === 'coastal-masterpiece').length
  if (avgScore >= 75 && masterCnt >= Math.ceil(rays.length * 0.3)) return 'major-lighthouse'
  if (avgScore >= 60) return 'harbor-light'
  if (avgScore >= 45) return 'coastal-beacon'
  if (avgScore >= 30) return 'channel-marker'
  if (avgScore >= 15) return 'buoy'
  return 'darkness'
}

// ─── analyzeCoastline ────────────────────────────────────

/** @example analyzeCoastline(rays, dirPath) returns Coastline */
export function analyzeCoastline(rays: BeaconRay[], dirPath: string): Coastline {
  if (rays.length === 0) {
    return {
      directory: dirPath, rays: [], avgBeacon: 0, avgWarning: 0, avgGuidance: 0,
      masterpieceCount: 0, darkCount: 0, brightCount: 0, reliableCount: 0,
      coastlineType: 'darkness', condition: 'void',
    }
  }

  const avgBeacon = Math.round(rays.reduce((s, r) => s + r.beaconStrength, 0) / rays.length)
  const avgWarning = Math.round(rays.reduce((s, r) => s + r.warningSystem, 0) / rays.length)
  const avgGuidance = Math.round(rays.reduce((s, r) => s + r.guidanceQuality, 0) / rays.length)
  const masterpieceCount = rays.filter((r) => r.condition === 'coastal-masterpiece').length
  const darkCount = rays.filter((r) => r.condition === 'dark-tower').length
  const brightCount = rays.filter((r) => r.beacon.hasHighStrength).length
  const reliableCount = rays.filter((r) => r.warning.hasHighSystem).length

  const coastlineType = classifyCoastlineType(rays)
  const avgScore = rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length
  let condition: Coastline['condition'] = 'void'
  if (avgScore >= 75) condition = 'illuminated-coast'
  else if (avgScore >= 60) condition = 'well-lit-harbor'
  else if (avgScore >= 45) condition = 'guided-channel'
  else if (avgScore >= 30) condition = 'dim-shoreline'
  else if (avgScore >= 15) condition = 'dark-coast'

  return {
    directory: dirPath, rays, avgBeacon, avgWarning, avgGuidance,
    masterpieceCount, darkCount, brightCount, reliableCount, coastlineType, condition,
  }
}

// ─── classifyKeeperGrade ─────────────────────────────────

/** @example classifyKeeperGrade(avgIllumination) returns grade */
export function classifyKeeperGrade(avgIllumination: number): AmberLighthouseResult['stats']['keeperGrade'] {
  if (avgIllumination >= 80) return 'master-keeper'
  if (avgIllumination >= 65) return 'lighthouse-keeper'
  if (avgIllumination >= 50) return 'watchman'
  if (avgIllumination >= 35) return 'tender'
  if (avgIllumination >= 20) return 'observer'
  return 'absentee'
}

// ─── generateRecommendations ─────────────────────────────

/** @example generateRecommendations(rays, coastlines, coast, stats) returns string[] */
export function generateRecommendations(
  rays: BeaconRay[],
  coastlines: Coastline[],
  coast: AmberLighthouseResult['coast'],
  stats: AmberLighthouseResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgBeaconStrength < 50) recs.push('Strengthen beacon — improve code visibility with clear exports and reduce any/eval')
  if (stats.avgFogPenetration < 50) recs.push('Improve fog penetration — add abstractions and reduce obfuscation for code clarity')
  if (stats.avgWarningSystem < 50) recs.push('Enhance warning system — add proper error handling and reduce silent failures')
  if (stats.avgFoundationStability < 50) recs.push('Reinforce foundation — improve code structure and reduce erosion patterns')
  if (stats.avgRotatingCoverage < 50) recs.push('Expand coverage — add complete paths and reduce dead angles in code')
  if (stats.avgGuidanceQuality < 50) recs.push('Improve guidance quality — add clear directions and reduce ambiguity in code')
  if (stats.darkTowerCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of files are dark towers — consider major codebase illumination')
  if (stats.brokenLensCount > 0) recs.push('Warning: broken-lens files detected — these need immediate repair')
  if (coast.overallIllumination < 40) recs.push('Overall illumination is critically low — establish a lighthouse keeping regimen')
  if (coastlines.length > 0 && coastlines.every((c) => c.condition === 'void')) recs.push('All coastlines are void — your codebase needs fundamental beacon restoration')

  if (rays.length > 0) {
    const highDarkZones = rays.filter((r) => r.beacon.darkZoneCount > 2)
    if (highDarkZones.length > rays.length * 0.5) recs.push('Over 50% of files have high dark zones — reduce any/eval usage')
  }

  return recs
}

// ─── buildAmberLighthouseResult ──────────────────────────

/** @example buildAmberLighthouseResult(files, contents, options) returns full result */
export function buildAmberLighthouseResult(files: string[], contents: string[], _options?: Record<string, unknown>): AmberLighthouseResult {
  const rays = files.map((file, i) => analyzeBeaconRay(contents[i] ?? '', file))

  const coastlineMap = new Map<string, BeaconRay[]>()
  rays.forEach((ray) => {
    const parts = ray.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = coastlineMap.get(dir)
    if (existing) existing.push(ray)
    else coastlineMap.set(dir, [ray])
  })

  const coastlines = Array.from(coastlineMap.entries()).map(([dir, r]) => analyzeCoastline(r, dir))

  const avgBeaconStrength = rays.length > 0 ? Math.round(rays.reduce((s, r) => s + r.beaconStrength, 0) / rays.length) : 0
  const avgFogPenetration = rays.length > 0 ? Math.round(rays.reduce((s, r) => s + r.fogPenetration, 0) / rays.length) : 0
  const avgWarningSystem = rays.length > 0 ? Math.round(rays.reduce((s, r) => s + r.warningSystem, 0) / rays.length) : 0
  const avgFoundationStability = rays.length > 0 ? Math.round(rays.reduce((s, r) => s + r.foundationStability, 0) / rays.length) : 0
  const avgRotatingCoverage = rays.length > 0 ? Math.round(rays.reduce((s, r) => s + r.rotatingCoverage, 0) / rays.length) : 0
  const avgGuidanceQuality = rays.length > 0 ? Math.round(rays.reduce((s, r) => s + r.guidanceQuality, 0) / rays.length) : 0

  const overallIllumination = Math.round(
    avgBeaconStrength * 0.15 +
    avgFogPenetration * 0.15 +
    avgWarningSystem * 0.2 +
    avgFoundationStability * 0.2 +
    avgRotatingCoverage * 0.15 +
    avgGuidanceQuality * 0.15,
  )

  const coast = {
    avgBeacon: avgBeaconStrength,
    avgWarning: avgWarningSystem,
    avgGuidance: avgGuidanceQuality,
    isIlluminated: overallIllumination >= 60,
    overallIllumination,
  }

  const stats = {
    totalFiles: files.length,
    totalCoastlines: coastlines.length,
    avgBeaconStrength,
    avgFogPenetration,
    avgWarningSystem,
    avgFoundationStability,
    avgRotatingCoverage,
    avgGuidanceQuality,
    coastalMasterpieceCount: rays.filter((r) => r.condition === 'coastal-masterpiece').length,
    reliableBeaconCount: rays.filter((r) => r.condition === 'reliable-beacon').length,
    functionalLightCount: rays.filter((r) => r.condition === 'functional-light').length,
    flickeringCandleCount: rays.filter((r) => r.condition === 'flickering-candle').length,
    brokenLensCount: rays.filter((r) => r.condition === 'broken-lens').length,
    darkTowerCount: rays.filter((r) => r.condition === 'dark-tower').length,
    hasHighStrengthCount: rays.filter((r) => r.beacon.hasHighStrength).length,
    hasHighPenetrationCount: rays.filter((r) => r.fog.hasHighPenetration).length,
    hasHighSystemCount: rays.filter((r) => r.warning.hasHighSystem).length,
    hasHighStabilityCount: rays.filter((r) => r.foundation.hasHighStability).length,
    hasHighLevelCount: rays.filter((r) => r.coverage.hasHighLevel).length,
    hasHighQualityCount: rays.filter((r) => r.guidance.hasHighQuality).length,
    overallIllumination,
    keeperGrade: classifyKeeperGrade(overallIllumination),
    bestRay: '',
    brightest: '',
    clearestInFog: '',
    bestWarnings: '',
    mostStable: '',
    mostComplete: '',
  }

  if (rays.length > 0) {
    stats.bestRay = rays.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.brightest = rays.reduce((a, b) => a.beaconStrength >= b.beaconStrength ? a : b).file
    stats.clearestInFog = rays.reduce((a, b) => a.fogPenetration >= b.fogPenetration ? a : b).file
    stats.bestWarnings = rays.reduce((a, b) => a.warningSystem >= b.warningSystem ? a : b).file
    stats.mostStable = rays.reduce((a, b) => a.foundationStability >= b.foundationStability ? a : b).file
    stats.mostComplete = rays.reduce((a, b) => a.rotatingCoverage >= b.rotatingCoverage ? a : b).file
  }

  const recommendations = generateRecommendations(rays, coastlines, coast, stats)

  return { rays, coastlines, coast, stats, recommendations }
}
