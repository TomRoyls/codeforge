// ─── Interfaces ──────────────────────────────────────────────

export interface DepthMeasure {
  complexity: number
  zone: 'hadal-zone' | 'abyssal-zone' | 'bathyal-zone' | 'mesopelagic' | 'epipelagic' | 'surface'
  hasModerateComplexity: boolean
  hasProperStratification: boolean
  hasNoExcessiveDepth: boolean
  hasClearZones: boolean
  hasNoDarkness: boolean
  hasThermocline: boolean
  hasNoSuffocation: boolean
  hasProperPressure: boolean
  hasNoCrushing: boolean
  hasLightPenetration: boolean
  darknessCount: number
  crushingCount: number
}

export interface CurrentMeasure {
  quality: number
  flow: 'thermohaline' | 'gulf-stream' | 'steady-current' | 'tidal' | 'stagnant' | 'whirlpool'
  hasHighQuality: boolean
  hasSmoothFlow: boolean
  hasProperCirculation: boolean
  hasNoEddies: boolean
  hasConveyor: boolean
  hasNoBackflow: boolean
  hasProperDirection: boolean
  hasNoStagnation: boolean
  hasCleanWater: boolean
  hasNoPollution: boolean
  eddyCount: number
  pollutionCount: number
}

export interface BioMeasure {
  luminescence: number
  glow: 'dazzling' | 'bright-glow' | 'steady-glow' | 'dim-light' | 'flickering' | 'dark'
  hasHighLuminescence: boolean
  hasDocumentation: boolean
  hasClearSignals: boolean
  hasNoDarkSpots: boolean
  hasIlluminated: boolean
  hasNoShadowZones: boolean
  hasProperAngler: boolean
  hasNoBlinding: boolean
  hasVisible: boolean
  hasNoCamouflage: boolean
  darkSpotCount: number
  shadowZoneCount: number
}

export interface PressureMeasure {
  handling: number
  resistance: 'titanium-hull' | 'deep-adapted' | 'pressure-resistant' | 'moderate' | 'fragile' | 'crushed'
  hasHighHandling: boolean
  hasProperReinforcement: boolean
  hasNoBuckling: boolean
  hasPressureValve: boolean
  hasNoImplosion: boolean
  hasStructural: boolean
  hasNoLeaks: boolean
  hasEqualization: boolean
  hasNoRapidDecompression: boolean
  hasTestedDepth: boolean
  bucklingCount: number
  leakCount: number
}

export interface TrenchMeasure {
  quality: number
  formation: 'mariana-grade' | 'deep-trench' | 'mid-ocean-ridge' | 'continental-shelf' | 'shallow-basin' | 'puddle'
  hasHighQuality: boolean
  hasSolidStructure: boolean
  hasProperPlates: boolean
  hasNoSubduction: boolean
  hasStableFoundation: boolean
  hasNoFaultLine: boolean
  hasProperSpreading: boolean
  hasNoCollapse: boolean
  hasDeepRoots: boolean
  hasNoErosion: boolean
  subductionCount: number
  faultLineCount: number
}

export interface NavigationMeasure {
  quality: number
  equipment: 'sonar-perfect' | 'well-equipped' | 'basic-instruments' | 'compass-only' | 'lost' | 'hopeless'
  hasHighQuality: boolean
  hasProperCharts: boolean
  hasNoBlindNavigation: boolean
  hasWaypoints: boolean
  hasNoDeadReckoning: boolean
  hasSonar: boolean
  hasNoDarkWater: boolean
  hasClearDepth: boolean
  hasNoUncharted: boolean
  hasSafeHarbor: boolean
  blindCount: number
  unchartedCount: number
}

export interface AbyssalSpecimen {
  file: string
  depthComplexity: number
  currentQuality: number
  bioluminescence: number
  pressureHandling: number
  trenchQuality: number
  abyssalNavigation: number
  depth: DepthMeasure
  current: CurrentMeasure
  bio: BioMeasure
  pressure: PressureMeasure
  trench: TrenchMeasure
  navigation: NavigationMeasure
  condition: 'hydrothermal-vent' | 'coral-garden' | 'open-water' | 'murky-depths' | 'dead-zone' | 'void'
  qualityScore: number
}

export interface OceanZone {
  directory: string
  specimens: AbyssalSpecimen[]
  avgDepth: number
  avgCurrent: number
  avgNavigation: number
  ventCount: number
  voidCount: number
  deepCount: number
  adaptedCount: number
  zoneType: 'deep-trench-system' | 'abyssal-plain' | 'mid-ocean-ridge' | 'continental-shelf' | 'tidal-pool' | 'dry-land'
  condition: 'thriving-ecosystem' | 'living-ocean' | 'stable-waters' | 'stressed' | 'dead-waters' | 'evaporated'
}

export interface DeepOceanResult {
  specimens: AbyssalSpecimen[]
  zones: OceanZone[]
  ocean: {
    avgDepth: number
    avgCurrent: number
    avgNavigation: number
    isHealthy: boolean
    overallHealth: number
  }
  stats: {
    totalFiles: number
    totalZones: number
    avgDepthComplexity: number
    avgCurrentQuality: number
    avgBioluminescence: number
    avgPressureHandling: number
    avgTrenchQuality: number
    avgAbyssalNavigation: number
    hydrothermalVentCount: number
    coralGardenCount: number
    openWaterCount: number
    murkyDepthsCount: number
    deadZoneCount: number
    voidCount: number
    hasModerateComplexityCount: number
    hasHighQualityCount: number
    hasHighLuminescenceCount: number
    hasHighHandlingCount: number
    hasHighTrenchCount: number
    hasHighNavigationCount: number
    overallHealth: number
    captainGrade: 'deep-sea-commander' | 'oceanographer' | 'navigator' | 'diver' | 'swimmer' | 'landlubber'
    bestSpecimen: string
    bestDepth: string
    bestFlow: string
    mostIlluminated: string
    mostResilient: string
    bestArchitected: string
  }
  recommendations: string[]
}

// ─── Regex Patterns (no g flag on .test()-only regexes) ──────

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
const THROW_RE = /\bthrow\b/
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

// ─── measureDepth ────────────────────────────────────────────

/** @example measureDepth(content) returns DepthMeasure */
export function measureDepth(content: string): DepthMeasure {
  let score = 0

  const hasProperStratification = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoExcessiveDepth = !NESTED_TERNARY_RE.test(content)
  const hasClearZones = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const darknessCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDarkness = darknessCount === 0
  const hasThermocline = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const crushingCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoSuffocation = crushingCount === 0
  const hasProperPressure = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoCrushing = (content.match(HACK_RE) || []).length === 0
  const hasLightPenetration = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasProperStratification) score += 12
  if (hasNoExcessiveDepth) score += 12
  if (hasClearZones) score += 10
  if (hasNoDarkness) score += 10
  if (hasThermocline) score += 10
  if (hasNoSuffocation) score += 10
  if (hasProperPressure) score += 10
  if (hasNoCrushing) score += 11
  if (hasLightPenetration) score += 10

  const complexity = Math.min(100, Math.max(0, score))
  const hasModerateComplexity = complexity >= 70

  let zone: DepthMeasure['zone'] = 'surface'
  if (hasModerateComplexity && hasNoDarkness && hasProperStratification && hasLightPenetration) zone = 'hadal-zone'
  else if (hasModerateComplexity && hasNoDarkness) zone = 'abyssal-zone'
  else if (hasModerateComplexity) zone = 'bathyal-zone'
  else if (hasClearZones && hasProperPressure) zone = 'mesopelagic'
  else if (complexity > 30) zone = 'epipelagic'

  return {
    complexity, zone, hasModerateComplexity, hasProperStratification,
    hasNoExcessiveDepth, hasClearZones, hasNoDarkness, hasThermocline,
    hasNoSuffocation, hasProperPressure, hasNoCrushing, hasLightPenetration,
    darknessCount, crushingCount,
  }
}

// ─── measureCurrent ──────────────────────────────────────────

/** @example measureCurrent(content) returns CurrentMeasure */
export function measureCurrent(content: string): CurrentMeasure {
  let score = 0

  const hasSmoothFlow = FUNCTION_RE.test(content) || ARROW_RE.test(content)
  const hasProperCirculation = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const eddyCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoEddies = eddyCount === 0
  const hasConveyor = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const pollutionCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoBackflow = pollutionCount === 0
  const hasProperDirection = content.length > 0 && (RETURN_RE.test(content) || THROW_RE.test(content))
  const hasNoStagnation = !NESTED_TERNARY_RE.test(content)
  const hasCleanWater = (content.match(TODO_RE) || []).length === 0
  const hasNoPollution = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasSmoothFlow) score += 12
  if (hasProperCirculation) score += 12
  if (hasNoEddies) score += 10
  if (hasConveyor) score += 10
  if (hasNoBackflow) score += 10
  if (hasProperDirection) score += 10
  if (hasNoStagnation) score += 10
  if (hasCleanWater) score += 11
  if (hasNoPollution) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let flow: CurrentMeasure['flow'] = 'whirlpool'
  if (hasHighQuality && hasNoEddies && hasConveyor && hasProperCirculation) flow = 'thermohaline'
  else if (hasHighQuality && hasNoEddies) flow = 'gulf-stream'
  else if (hasHighQuality) flow = 'steady-current'
  else if (hasSmoothFlow && hasProperDirection) flow = 'tidal'
  else if (quality > 30) flow = 'stagnant'

  return {
    quality, flow, hasHighQuality, hasSmoothFlow, hasProperCirculation,
    hasNoEddies, hasConveyor, hasNoBackflow, hasProperDirection,
    hasNoStagnation, hasCleanWater, hasNoPollution, eddyCount, pollutionCount,
  }
}

// ─── measureBio ──────────────────────────────────────────────

/** @example measureBio(content) returns BioMeasure */
export function measureBio(content: string): BioMeasure {
  let score = 0

  const hasDocumentation = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasClearSignals = INTERFACE_RE.test(content) || TYPE_RE.test(content)
  const darkSpotCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDarkSpots = darkSpotCount === 0
  const hasIlluminated = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const shadowZoneCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoShadowZones = shadowZoneCount === 0
  const hasProperAngler = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoBlinding = (content.match(CONSOLE_RE) || []).length === 0
  const hasVisible = content.length > 0 && (RETURN_RE.test(content) || THROW_RE.test(content))
  const hasNoCamouflage = !NESTED_TERNARY_RE.test(content)

  if (content.length > 0) score += 5
  if (hasDocumentation) score += 12
  if (hasClearSignals) score += 12
  if (hasNoDarkSpots) score += 10
  if (hasIlluminated) score += 10
  if (hasNoShadowZones) score += 10
  if (hasProperAngler) score += 10
  if (hasNoBlinding) score += 10
  if (hasVisible) score += 11
  if (hasNoCamouflage) score += 10

  const luminescence = Math.min(100, Math.max(0, score))
  const hasHighLuminescence = luminescence >= 70

  let glow: BioMeasure['glow'] = 'dark'
  if (hasHighLuminescence && hasNoDarkSpots && hasDocumentation && hasIlluminated) glow = 'dazzling'
  else if (hasHighLuminescence && hasNoDarkSpots) glow = 'bright-glow'
  else if (hasHighLuminescence) glow = 'steady-glow'
  else if (hasClearSignals && hasVisible) glow = 'dim-light'
  else if (luminescence > 30) glow = 'flickering'

  return {
    luminescence, glow, hasHighLuminescence, hasDocumentation, hasClearSignals,
    hasNoDarkSpots, hasIlluminated, hasNoShadowZones, hasProperAngler,
    hasNoBlinding, hasVisible, hasNoCamouflage, darkSpotCount, shadowZoneCount,
  }
}

// ─── measurePressure ─────────────────────────────────────────

/** @example measurePressure(content) returns PressureMeasure */
export function measurePressure(content: string): PressureMeasure {
  let score = 0

  const hasProperReinforcement = INTERFACE_RE.test(content) || TYPE_RE.test(content) || CLASS_RE.test(content)
  const hasNoBuckling = !NESTED_TERNARY_RE.test(content)
  const hasPressureValve = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoImplosion = (content.match(HACK_RE) || []).length === 0
  const hasStructural = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const leakCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoLeaks = leakCount === 0
  const hasEqualization = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoRapidDecompression = (content.match(DEPRECATED_RE) || []).length === 0
  const hasTestedDepth = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const bucklingCount = (content.match(EMPTY_CATCH_RE) || []).length

  if (content.length > 0) score += 5
  if (hasProperReinforcement) score += 12
  if (hasNoBuckling) score += 12
  if (hasPressureValve) score += 10
  if (hasNoImplosion) score += 10
  if (hasStructural) score += 10
  if (hasNoLeaks) score += 10
  if (hasEqualization) score += 10
  if (hasNoRapidDecompression) score += 11
  if (hasTestedDepth) score += 10

  const handling = Math.min(100, Math.max(0, score))
  const hasHighHandling = handling >= 70

  let resistance: PressureMeasure['resistance'] = 'crushed'
  if (hasHighHandling && hasNoLeaks && hasPressureValve && hasProperReinforcement) resistance = 'titanium-hull'
  else if (hasHighHandling && hasNoLeaks) resistance = 'deep-adapted'
  else if (hasHighHandling) resistance = 'pressure-resistant'
  else if (hasProperReinforcement && hasPressureValve) resistance = 'moderate'
  else if (handling > 30) resistance = 'fragile'

  return {
    handling, resistance, hasHighHandling, hasProperReinforcement,
    hasNoBuckling, hasPressureValve, hasNoImplosion, hasStructural,
    hasNoLeaks, hasEqualization, hasNoRapidDecompression, hasTestedDepth,
    bucklingCount, leakCount,
  }
}

// ─── measureTrench ───────────────────────────────────────────

/** @example measureTrench(content) returns TrenchMeasure */
export function measureTrench(content: string): TrenchMeasure {
  let score = 0

  const hasSolidStructure = INTERFACE_RE.test(content) && TYPE_RE.test(content) && CLASS_RE.test(content)
  const hasProperPlates = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const subductionCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoSubduction = subductionCount === 0
  const hasStableFoundation = (content.match(DOC_COMMENT_RE) || []).length > 0
  const faultLineCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length + (content.match(HACK_RE) || []).length
  const hasNoFaultLine = faultLineCount === 0
  const hasProperSpreading = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const hasNoCollapse = !NESTED_TERNARY_RE.test(content)
  const hasDeepRoots = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoErosion = (content.match(DEPRECATED_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasSolidStructure) score += 12
  if (hasProperPlates) score += 12
  if (hasNoSubduction) score += 10
  if (hasStableFoundation) score += 10
  if (hasNoFaultLine) score += 10
  if (hasProperSpreading) score += 10
  if (hasNoCollapse) score += 10
  if (hasDeepRoots) score += 11
  if (hasNoErosion) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let formation: TrenchMeasure['formation'] = 'puddle'
  if (hasHighQuality && hasNoSubduction && hasSolidStructure && hasProperSpreading) formation = 'mariana-grade'
  else if (hasHighQuality && hasNoSubduction) formation = 'deep-trench'
  else if (hasHighQuality) formation = 'mid-ocean-ridge'
  else if (hasSolidStructure && hasDeepRoots) formation = 'continental-shelf'
  else if (quality > 30) formation = 'shallow-basin'

  return {
    quality, formation, hasHighQuality, hasSolidStructure, hasProperPlates,
    hasNoSubduction, hasStableFoundation, hasNoFaultLine, hasProperSpreading,
    hasNoCollapse, hasDeepRoots, hasNoErosion, subductionCount, faultLineCount,
  }
}

// ─── measureNavigation ───────────────────────────────────────

/** @example measureNavigation(content) returns NavigationMeasure */
export function measureNavigation(content: string): NavigationMeasure {
  let score = 0

  const hasProperCharts = (content.match(DOC_COMMENT_RE) || []).length > 0
  const blindCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoBlindNavigation = blindCount === 0
  const hasWaypoints = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoDeadReckoning = !NESTED_TERNARY_RE.test(content)
  const hasSonar = (content.match(CONSOLE_RE) || []).length === 0
  const hasNoDarkWater = (content.match(HACK_RE) || []).length === 0
  const hasClearDepth = INTERFACE_RE.test(content) || TYPE_RE.test(content) || CLASS_RE.test(content)
  const unchartedCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoUncharted = unchartedCount === 0
  const hasSafeHarbor = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))

  if (content.length > 0) score += 5
  if (hasProperCharts) score += 12
  if (hasNoBlindNavigation) score += 12
  if (hasWaypoints) score += 10
  if (hasNoDeadReckoning) score += 10
  if (hasSonar) score += 10
  if (hasNoDarkWater) score += 10
  if (hasClearDepth) score += 10
  if (hasNoUncharted) score += 11
  if (hasSafeHarbor) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let equipment: NavigationMeasure['equipment'] = 'hopeless'
  if (hasHighQuality && hasNoBlindNavigation && hasProperCharts && hasWaypoints) equipment = 'sonar-perfect'
  else if (hasHighQuality && hasNoBlindNavigation) equipment = 'well-equipped'
  else if (hasHighQuality) equipment = 'basic-instruments'
  else if (hasClearDepth && hasSafeHarbor) equipment = 'compass-only'
  else if (quality > 30) equipment = 'lost'

  return {
    quality, equipment, hasHighQuality, hasProperCharts, hasNoBlindNavigation,
    hasWaypoints, hasNoDeadReckoning, hasSonar, hasNoDarkWater,
    hasClearDepth, hasNoUncharted, hasSafeHarbor, blindCount, unchartedCount,
  }
}

// ─── classifyCondition ───────────────────────────────────────

/** @example classifyCondition(specimen) returns condition */
export function classifyCondition(specimen: AbyssalSpecimen): AbyssalSpecimen['condition'] {
  const { qualityScore } = specimen
  if (qualityScore >= 80) return 'hydrothermal-vent'
  if (qualityScore >= 65) return 'coral-garden'
  if (qualityScore >= 50) return 'open-water'
  if (qualityScore >= 35) return 'murky-depths'
  if (qualityScore >= 20) return 'dead-zone'
  return 'void'
}

// ─── analyzeAbyssalSpecimen ──────────────────────────────────

/** @example analyzeAbyssalSpecimen(content, filePath) returns full specimen */
export function analyzeAbyssalSpecimen(content: string, filePath: string): AbyssalSpecimen {
  const depth = measureDepth(content)
  const current = measureCurrent(content)
  const bio = measureBio(content)
  const pressure = measurePressure(content)
  const trench = measureTrench(content)
  const navigation = measureNavigation(content)

  const depthComplexity = depth.complexity
  const currentQuality = current.quality
  const bioluminescence = bio.luminescence
  const pressureHandling = pressure.handling
  const trenchQuality = trench.quality
  const abyssalNavigation = navigation.quality

  const qualityScore = Math.round(
    depthComplexity * 0.15 +
    currentQuality * 0.15 +
    bioluminescence * 0.2 +
    pressureHandling * 0.15 +
    trenchQuality * 0.2 +
    abyssalNavigation * 0.15,
  )

  const result: AbyssalSpecimen = {
    file: filePath,
    depthComplexity, currentQuality, bioluminescence,
    pressureHandling, trenchQuality, abyssalNavigation,
    depth, current, bio, pressure, trench, navigation,
    qualityScore,
    condition: 'void',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── Ocean Zone Analysis ─────────────────────────────────────

/** @example analyzeOceanZone(specimens, dirPath) returns OceanZone */
export function analyzeOceanZone(specimens: AbyssalSpecimen[], dirPath: string): OceanZone {
  if (specimens.length === 0) {
    return {
      directory: dirPath, specimens: [], avgDepth: 0, avgCurrent: 0, avgNavigation: 0,
      ventCount: 0, voidCount: 0, deepCount: 0, adaptedCount: 0,
      zoneType: 'dry-land', condition: 'evaporated',
    }
  }

  const avgDepth = Math.round(specimens.reduce((s, sp) => s + sp.depthComplexity, 0) / specimens.length)
  const avgCurrent = Math.round(specimens.reduce((s, sp) => s + sp.currentQuality, 0) / specimens.length)
  const avgNavigation = Math.round(specimens.reduce((s, sp) => s + sp.abyssalNavigation, 0) / specimens.length)
  const ventCount = specimens.filter((sp) => sp.condition === 'hydrothermal-vent').length
  const voidCount = specimens.filter((sp) => sp.condition === 'void').length
  const deepCount = specimens.filter((sp) => sp.depth.hasModerateComplexity).length
  const adaptedCount = specimens.filter((sp) => sp.pressure.hasHighHandling).length

  const zoneType = classifyZoneType(specimens)
  const avgScore = specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length
  let condition: OceanZone['condition'] = 'evaporated'
  if (avgScore >= 75) condition = 'thriving-ecosystem'
  else if (avgScore >= 60) condition = 'living-ocean'
  else if (avgScore >= 45) condition = 'stable-waters'
  else if (avgScore >= 30) condition = 'stressed'
  else if (avgScore >= 15) condition = 'dead-waters'

  return {
    directory: dirPath, specimens, avgDepth, avgCurrent, avgNavigation,
    ventCount, voidCount, deepCount, adaptedCount, zoneType, condition,
  }
}

// ─── classifyZoneType ────────────────────────────────────────

/** @example classifyZoneType(specimens) returns zone type */
export function classifyZoneType(specimens: AbyssalSpecimen[]): OceanZone['zoneType'] {
  if (specimens.length === 0) return 'dry-land'
  const avgScore = specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length
  const ventCnt = specimens.filter((sp) => sp.condition === 'hydrothermal-vent').length
  if (avgScore >= 75 && ventCnt >= Math.ceil(specimens.length * 0.3)) return 'deep-trench-system'
  if (avgScore >= 60) return 'abyssal-plain'
  if (avgScore >= 45) return 'mid-ocean-ridge'
  if (avgScore >= 30) return 'continental-shelf'
  if (avgScore >= 15) return 'tidal-pool'
  return 'dry-land'
}

// ─── classifyCaptainGrade ────────────────────────────────────

/** @example classifyCaptainGrade(avgHealth) returns grade */
export function classifyCaptainGrade(avgHealth: number): DeepOceanResult['stats']['captainGrade'] {
  if (avgHealth >= 80) return 'deep-sea-commander'
  if (avgHealth >= 65) return 'oceanographer'
  if (avgHealth >= 50) return 'navigator'
  if (avgHealth >= 35) return 'diver'
  if (avgHealth >= 20) return 'swimmer'
  return 'landlubber'
}

// ─── generateRecommendations ─────────────────────────────────

/** @example generateRecommendations(specimens, zones, ocean, stats) returns string[] */
export function generateRecommendations(
  specimens: AbyssalSpecimen[],
  zones: OceanZone[],
  ocean: DeepOceanResult['ocean'],
  stats: DeepOceanResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgDepthComplexity < 50) recs.push('Increase depth complexity — add interfaces and types for proper code stratification')
  if (stats.avgCurrentQuality < 50) recs.push('Improve current quality — reduce any/eval and establish smooth data flow')
  if (stats.avgBioluminescence < 50) recs.push('Boost bioluminescence — add documentation and illuminate code paths')
  if (stats.avgPressureHandling < 50) recs.push('Strengthen pressure handling — add error handling and remove code leaks')
  if (stats.avgTrenchQuality < 50) recs.push('Improve trench quality — build solid architecture with interfaces, types, and classes')
  if (stats.avgAbyssalNavigation < 50) recs.push('Enhance navigation — add documentation and reduce uncharted code areas')
  if (stats.voidCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of specimens are void — consider major refactoring')
  if (stats.deadZoneCount > 0) recs.push('Warning: dead zones detected — these files need ecosystem restoration')
  if (ocean.overallHealth < 40) recs.push('Overall ocean health is critical — establish a deep-sea recovery plan')
  if (zones.length > 0 && zones.every((z) => z.condition === 'evaporated')) recs.push('All zones are evaporated — your codebase needs fundamental revitalization')

  if (specimens.length > 0) {
    const dark = specimens.filter((sp) => sp.depth.darknessCount > 2)
    if (dark.length > specimens.length * 0.5) recs.push('Over 50% of specimens have excessive darkness — reduce any/eval usage')
  }

  return recs
}

// ─── buildDeepOceanResult ────────────────────────────────────

/** @example buildDeepOceanResult(files, contents) returns full result */
export function buildDeepOceanResult(files: string[], contents: string[]): DeepOceanResult {
  const specimens = files.map((file, i) => analyzeAbyssalSpecimen(contents[i] ?? '', file))

  const zoneMap = new Map<string, AbyssalSpecimen[]>()
  specimens.forEach((specimen) => {
    const parts = specimen.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = zoneMap.get(dir)
    if (existing) existing.push(specimen)
    else zoneMap.set(dir, [specimen])
  })

  const zones = Array.from(zoneMap.entries()).map(([dir, ss]) => analyzeOceanZone(ss, dir))

  const avgDepthComplexity = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.depthComplexity, 0) / specimens.length) : 0
  const avgCurrentQuality = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.currentQuality, 0) / specimens.length) : 0
  const avgBioluminescence = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.bioluminescence, 0) / specimens.length) : 0
  const avgPressureHandling = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.pressureHandling, 0) / specimens.length) : 0
  const avgTrenchQuality = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.trenchQuality, 0) / specimens.length) : 0
  const avgAbyssalNavigation = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.abyssalNavigation, 0) / specimens.length) : 0

  const overallHealth = Math.round(
    avgDepthComplexity * 0.15 +
    avgCurrentQuality * 0.15 +
    avgBioluminescence * 0.2 +
    avgPressureHandling * 0.15 +
    avgTrenchQuality * 0.2 +
    avgAbyssalNavigation * 0.15,
  )

  const ocean = {
    avgDepth: avgDepthComplexity,
    avgCurrent: avgCurrentQuality,
    avgNavigation: avgAbyssalNavigation,
    isHealthy: overallHealth >= 60,
    overallHealth,
  }

  const stats = {
    totalFiles: files.length,
    totalZones: zones.length,
    avgDepthComplexity,
    avgCurrentQuality,
    avgBioluminescence,
    avgPressureHandling,
    avgTrenchQuality,
    avgAbyssalNavigation,
    hydrothermalVentCount: specimens.filter((sp) => sp.condition === 'hydrothermal-vent').length,
    coralGardenCount: specimens.filter((sp) => sp.condition === 'coral-garden').length,
    openWaterCount: specimens.filter((sp) => sp.condition === 'open-water').length,
    murkyDepthsCount: specimens.filter((sp) => sp.condition === 'murky-depths').length,
    deadZoneCount: specimens.filter((sp) => sp.condition === 'dead-zone').length,
    voidCount: specimens.filter((sp) => sp.condition === 'void').length,
    hasModerateComplexityCount: specimens.filter((sp) => sp.depth.hasModerateComplexity).length,
    hasHighQualityCount: specimens.filter((sp) => sp.current.hasHighQuality).length,
    hasHighLuminescenceCount: specimens.filter((sp) => sp.bio.hasHighLuminescence).length,
    hasHighHandlingCount: specimens.filter((sp) => sp.pressure.hasHighHandling).length,
    hasHighTrenchCount: specimens.filter((sp) => sp.trench.hasHighQuality).length,
    hasHighNavigationCount: specimens.filter((sp) => sp.navigation.hasHighQuality).length,
    overallHealth,
    captainGrade: classifyCaptainGrade(overallHealth),
    bestSpecimen: '',
    bestDepth: '',
    bestFlow: '',
    mostIlluminated: '',
    mostResilient: '',
    bestArchitected: '',
  }

  if (specimens.length > 0) {
    stats.bestSpecimen = specimens.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.bestDepth = specimens.reduce((a, b) => a.depthComplexity >= b.depthComplexity ? a : b).file
    stats.bestFlow = specimens.reduce((a, b) => a.currentQuality >= b.currentQuality ? a : b).file
    stats.mostIlluminated = specimens.reduce((a, b) => a.bioluminescence >= b.bioluminescence ? a : b).file
    stats.mostResilient = specimens.reduce((a, b) => a.pressureHandling >= b.pressureHandling ? a : b).file
    stats.bestArchitected = specimens.reduce((a, b) => a.trenchQuality >= b.trenchQuality ? a : b).file
  }

  const recommendations = generateRecommendations(specimens, zones, ocean, stats)

  return { specimens, zones, ocean, stats, recommendations }
}
