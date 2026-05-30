// ─── Interfaces ──────────────────────────────────────────

export interface HardnessMeasure {
  level: number
  grade: 'diamond-class' | 'granite-hard' | 'basalt-firm' | 'sandstone-soft' | 'shale-weak' | 'clay-crumble'
  hasHighLevel: boolean
  hasImpactResistant: boolean
  hasNoCracks: boolean
  hasDenseStructure: boolean
  hasNoFractures: boolean
  hasAbrasionResistant: boolean
  hasNoChipping: boolean
  hasSolid: boolean
  hasNoWeathering: boolean
  hasCompressive: boolean
  crackCount: number
  fractureCount: number
}

export interface CrystalMeasure {
  structure: number
  system: 'perfect-hexagonal' | 'well-crystallized' | 'granular' | 'porphyritic' | 'massive' | 'amorphous'
  hasHighStructure: boolean
  hasProperGrain: boolean
  hasInterlocking: boolean
  hasNoVoids: boolean
  hasUniformTexture: boolean
  hasNoInclusions: boolean
  hasProperOrientation: boolean
  hasNoMisalignment: boolean
  hasEquigranular: boolean
  hasNoXenoliths: boolean
  voidCount: number
  inclusionCount: number
}

export interface WeatherMeasure {
  resistance: number
  grade: 'weatherproof' | 'weather-resistant' | 'moderate-weathering' | 'susceptible' | 'crumbling' | 'dissolving'
  hasHighResistance: boolean
  hasFreezeThawResistant: boolean
  hasNoErosion: boolean
  hasChemicalResistant: boolean
  hasNoExfoliation: boolean
  hasUVDegradationResistant: boolean
  hasNoSpalling: boolean
  hasAcidResistant: boolean
  hasNoPitting: boolean
  hasBiologicalResistant: boolean
  erosionCount: number
  spallingCount: number
}

export interface FoundationMeasure {
  depth: number
  type: 'bedrock' | 'deep-regolith' | 'stable-substrate' | 'shallow-soil' | 'loose-gravel' | 'quicksand'
  hasHighDepth: boolean
  hasSolidBase: boolean
  hasProperSettling: boolean
  hasNoShifting: boolean
  hasDeepRoots: boolean
  hasNoErosion: boolean
  hasProperDrainage: boolean
  hasNoWaterDamage: boolean
  hasLoadDistribution: boolean
  hasNoSubsidence: boolean
  shiftingCount: number
  subsidenceCount: number
}

export interface SummitMeasure {
  quality: number
  elevation: 'everest-class' | 'high-summit' | 'alpine-peak' | 'foothill' | 'hummock' | 'depression'
  hasHighQuality: boolean
  hasClearView: boolean
  hasNoBlindSpots: boolean
  hasProperExposure: boolean
  hasNoAvalanche: boolean
  hasStable: boolean
  hasNoOverhanging: boolean
  hasCleanLines: boolean
  hasNoClutter: boolean
  hasMajestic: boolean
  avalancheCount: number
  overhangingCount: number
}

export interface ExposureMeasure {
  handling: number
  quality: 'master-climber' | 'experienced' | 'properly-equipped' | 'underprepared' | 'exposed' | 'fatal-fall'
  hasHighHandling: boolean
  hasProperAnchoring: boolean
  hasNoFallRisk: boolean
  hasRopeProtection: boolean
  hasNoSlipHazards: boolean
  hasProperRoute: boolean
  hasNoDeadEnds: boolean
  hasSafetyEquipment: boolean
  hasNoExposure: boolean
  hasEmergencyPlan: boolean
  fallRiskCount: number
  slipHazardCount: number
}

export interface RockFormation {
  file: string
  rockHardness: number
  crystallineStructure: number
  weatherResistance: number
  foundationDepth: number
  summitQuality: number
  exposureHandling: number
  hardness: HardnessMeasure
  crystal: CrystalMeasure
  weather: WeatherMeasure
  foundation: FoundationMeasure
  summit: SummitMeasure
  exposure: ExposureMeasure
  condition: 'matterhorn' | 'half-dome' | 'granite-tor' | 'weathered-crag' | 'gravel-pile' | 'dust'
  qualityScore: number
}

export interface MountainRange {
  directory: string
  formations: RockFormation[]
  avgHardness: number
  avgCrystal: number
  avgSummit: number
  matterhornCount: number
  dustCount: number
  hardCount: number
  stableCount: number
  rangeType: 'himalayan-range' | 'alpine-chain' | 'rocky-ridge' | 'hill-country' | 'moraine' | 'flatland'
  condition: 'majestic-range' | 'solid-mountains' | 'rolling-hills' | 'eroding-peaks' | 'rubble' | 'plains'
}

export interface GranitePeakResult {
  formations: RockFormation[]
  ranges: MountainRange[]
  mountain: {
    avgHardness: number
    avgCrystal: number
    avgSummit: number
    isSolid: boolean
    overallSolidity: number
  }
  stats: {
    totalFiles: number
    totalRanges: number
    avgRockHardness: number
    avgCrystallineStructure: number
    avgWeatherResistance: number
    avgFoundationDepth: number
    avgSummitQuality: number
    avgExposureHandling: number
    matterhornCount: number
    halfDomeCount: number
    graniteTorCount: number
    weatheredCragCount: number
    gravelPileCount: number
    dustCount: number
    hasHighHardnessCount: number
    hasHighStructureCount: number
    hasHighResistanceCount: number
    hasHighDepthCount: number
    hasHighQualityCount: number
    hasHighHandlingCount: number
    overallSolidity: number
    climberGrade: 'master-alpinist' | 'mountaineer' | 'climber' | 'hiker' | 'walker' | 'armchair'
    bestFormation: string
    hardest: string
    bestStructured: string
    mostResilient: string
    deepestFoundation: string
    highestQuality: string
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

// ─── measureHardness ──────────────────────────────────

/** @example measureHardness(content) returns HardnessMeasure */
export function measureHardness(content: string): HardnessMeasure {
  let score = 0

  const hasImpactResistant = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const crackCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoCracks = crackCount === 0
  const hasDenseStructure = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const fractureCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoFractures = fractureCount === 0
  const hasAbrasionResistant = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoChipping = (content.match(HACK_RE) || []).length === 0
  const hasSolid = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoWeathering = !NESTED_TERNARY_RE.test(content)
  const hasCompressive = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)

  if (content.length > 0) score += 5
  if (hasImpactResistant) score += 12
  if (hasNoCracks) score += 12
  if (hasDenseStructure) score += 10
  if (hasNoFractures) score += 10
  if (hasAbrasionResistant) score += 10
  if (hasNoChipping) score += 10
  if (hasSolid) score += 10
  if (hasNoWeathering) score += 11
  if (hasCompressive) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let grade: HardnessMeasure['grade'] = 'clay-crumble'
  if (hasHighLevel && hasNoCracks && hasImpactResistant && hasSolid) grade = 'diamond-class'
  else if (hasHighLevel && hasNoCracks) grade = 'granite-hard'
  else if (hasHighLevel) grade = 'basalt-firm'
  else if (hasImpactResistant && hasAbrasionResistant) grade = 'sandstone-soft'
  else if (level > 30) grade = 'shale-weak'

  return {
    level, grade, hasHighLevel, hasImpactResistant, hasNoCracks,
    hasDenseStructure, hasNoFractures, hasAbrasionResistant, hasNoChipping,
    hasSolid, hasNoWeathering, hasCompressive, crackCount, fractureCount,
  }
}

// ─── measureCrystal ───────────────────────────────────

/** @example measureCrystal(content) returns CrystalMeasure */
export function measureCrystal(content: string): CrystalMeasure {
  let score = 0

  const hasProperGrain = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const hasInterlocking = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const voidCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoVoids = voidCount === 0
  const hasUniformTexture = (content.match(DOC_COMMENT_RE) || []).length > 0
  const inclusionCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoInclusions = inclusionCount === 0
  const hasProperOrientation = FUNCTION_RE.test(content) || ARROW_RE.test(content)
  const hasNoMisalignment = !NESTED_TERNARY_RE.test(content)
  const hasEquigranular = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoXenoliths = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasProperGrain) score += 12
  if (hasInterlocking) score += 12
  if (hasNoVoids) score += 10
  if (hasUniformTexture) score += 10
  if (hasNoInclusions) score += 10
  if (hasProperOrientation) score += 10
  if (hasNoMisalignment) score += 10
  if (hasEquigranular) score += 11
  if (hasNoXenoliths) score += 10

  const structure = Math.min(100, Math.max(0, score))
  const hasHighStructure = structure >= 70

  let system: CrystalMeasure['system'] = 'amorphous'
  if (hasHighStructure && hasNoVoids && hasProperGrain && hasUniformTexture) system = 'perfect-hexagonal'
  else if (hasHighStructure && hasNoVoids) system = 'well-crystallized'
  else if (hasHighStructure) system = 'granular'
  else if (hasProperGrain && hasProperOrientation) system = 'porphyritic'
  else if (structure > 30) system = 'massive'

  return {
    structure, system, hasHighStructure, hasProperGrain, hasInterlocking,
    hasNoVoids, hasUniformTexture, hasNoInclusions, hasProperOrientation,
    hasNoMisalignment, hasEquigranular, hasNoXenoliths, voidCount, inclusionCount,
  }
}

// ─── measureWeather ───────────────────────────────────

/** @example measureWeather(content) returns WeatherMeasure */
export function measureWeather(content: string): WeatherMeasure {
  let score = 0

  const hasFreezeThawResistant = TRY_RE.test(content) && CATCH_RE.test(content)
  const erosionCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoErosion = erosionCount === 0
  const hasChemicalResistant = INTERFACE_RE.test(content) || TYPE_RE.test(content)
  const hasNoExfoliation = !NESTED_TERNARY_RE.test(content)
  const hasUVDegradationResistant = (content.match(DOC_COMMENT_RE) || []).length > 0
  const spallingCount = (content.match(HACK_RE) || []).length + (content.match(DEPRECATED_RE) || []).length
  const hasNoSpalling = spallingCount === 0
  const hasAcidResistant = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const hasNoPitting = (content.match(FIXME_RE) || []).length === 0
  const hasBiologicalResistant = ASYNC_RE.test(content) && AWAIT_RE.test(content)

  if (content.length > 0) score += 5
  if (hasFreezeThawResistant) score += 12
  if (hasNoErosion) score += 12
  if (hasChemicalResistant) score += 10
  if (hasNoExfoliation) score += 10
  if (hasUVDegradationResistant) score += 10
  if (hasNoSpalling) score += 10
  if (hasAcidResistant) score += 10
  if (hasNoPitting) score += 11
  if (hasBiologicalResistant) score += 10

  const resistance = Math.min(100, Math.max(0, score))
  const hasHighResistance = resistance >= 70

  let grade: WeatherMeasure['grade'] = 'dissolving'
  if (hasHighResistance && hasNoErosion && hasFreezeThawResistant && hasUVDegradationResistant) grade = 'weatherproof'
  else if (hasHighResistance && hasNoErosion) grade = 'weather-resistant'
  else if (hasHighResistance) grade = 'moderate-weathering'
  else if (hasChemicalResistant && hasAcidResistant) grade = 'susceptible'
  else if (resistance > 30) grade = 'crumbling'

  return {
    resistance, grade, hasHighResistance, hasFreezeThawResistant, hasNoErosion,
    hasChemicalResistant, hasNoExfoliation, hasUVDegradationResistant, hasNoSpalling,
    hasAcidResistant, hasNoPitting, hasBiologicalResistant, erosionCount, spallingCount,
  }
}

// ─── measureFoundation ────────────────────────────────

/** @example measureFoundation(content) returns FoundationMeasure */
export function measureFoundation(content: string): FoundationMeasure {
  let score = 0

  const hasSolidBase = INTERFACE_RE.test(content) && TYPE_RE.test(content) && CLASS_RE.test(content)
  const hasProperSettling = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const shiftingCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoShifting = shiftingCount === 0
  const hasDeepRoots = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoErosion = (content.match(HACK_RE) || []).length === 0
  const hasProperDrainage = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoWaterDamage = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasLoadDistribution = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const subsidenceCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoSubsidence = subsidenceCount === 0

  if (content.length > 0) score += 5
  if (hasSolidBase) score += 12
  if (hasProperSettling) score += 12
  if (hasNoShifting) score += 10
  if (hasDeepRoots) score += 10
  if (hasNoErosion) score += 10
  if (hasProperDrainage) score += 10
  if (hasNoWaterDamage) score += 10
  if (hasLoadDistribution) score += 11
  if (hasNoSubsidence) score += 10

  const depth = Math.min(100, Math.max(0, score))
  const hasHighDepth = depth >= 70

  let type: FoundationMeasure['type'] = 'quicksand'
  if (hasHighDepth && hasNoShifting && hasSolidBase && hasDeepRoots) type = 'bedrock'
  else if (hasHighDepth && hasNoShifting) type = 'deep-regolith'
  else if (hasHighDepth) type = 'stable-substrate'
  else if (hasSolidBase && hasProperDrainage) type = 'shallow-soil'
  else if (depth > 30) type = 'loose-gravel'

  return {
    depth, type, hasHighDepth, hasSolidBase, hasProperSettling,
    hasNoShifting, hasDeepRoots, hasNoErosion, hasProperDrainage,
    hasNoWaterDamage, hasLoadDistribution, hasNoSubsidence, shiftingCount, subsidenceCount,
  }
}

// ─── measureSummit ────────────────────────────────────

/** @example measureSummit(content) returns SummitMeasure */
export function measureSummit(content: string): SummitMeasure {
  let score = 0

  const hasClearView = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoBlindSpots = (content.match(CONSOLE_RE) || []).length === 0
  const hasProperExposure = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const avalancheCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoAvalanche = avalancheCount === 0
  const hasStable = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const overhangingCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoOverhanging = overhangingCount === 0
  const hasCleanLines = !NESTED_TERNARY_RE.test(content)
  const hasNoClutter = (content.match(HACK_RE) || []).length === 0
  const hasMajestic = ASYNC_RE.test(content) && AWAIT_RE.test(content)

  if (content.length > 0) score += 5
  if (hasClearView) score += 12
  if (hasNoBlindSpots) score += 12
  if (hasProperExposure) score += 10
  if (hasNoAvalanche) score += 10
  if (hasStable) score += 10
  if (hasNoOverhanging) score += 10
  if (hasCleanLines) score += 10
  if (hasNoClutter) score += 11
  if (hasMajestic) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let elevation: SummitMeasure['elevation'] = 'depression'
  if (hasHighQuality && hasNoAvalanche && hasClearView && hasNoBlindSpots) elevation = 'everest-class'
  else if (hasHighQuality && hasNoAvalanche) elevation = 'high-summit'
  else if (hasHighQuality) elevation = 'alpine-peak'
  else if (hasStable && hasProperExposure) elevation = 'foothill'
  else if (quality > 30) elevation = 'hummock'

  return {
    quality, elevation, hasHighQuality, hasClearView, hasNoBlindSpots,
    hasProperExposure, hasNoAvalanche, hasStable, hasNoOverhanging,
    hasCleanLines, hasNoClutter, hasMajestic, avalancheCount, overhangingCount,
  }
}

// ─── measureExposure ──────────────────────────────────

/** @example measureExposure(content) returns ExposureMeasure */
export function measureExposure(content: string): ExposureMeasure {
  let score = 0

  const hasProperAnchoring = TRY_RE.test(content) && CATCH_RE.test(content)
  const fallRiskCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoFallRisk = fallRiskCount === 0
  const hasRopeProtection = (content.match(DOC_COMMENT_RE) || []).length > 0
  const slipHazardCount = (content.match(HACK_RE) || []).length + (content.match(DEPRECATED_RE) || []).length
  const hasNoSlipHazards = slipHazardCount === 0
  const hasProperRoute = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasNoDeadEnds = (content.match(TODO_RE) || []).length === 0
  const hasSafetyEquipment = INTERFACE_RE.test(content) || TYPE_RE.test(content) || CLASS_RE.test(content)
  const hasNoExposure = !NESTED_TERNARY_RE.test(content)
  const hasEmergencyPlan = (content.match(EMPTY_CATCH_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasProperAnchoring) score += 12
  if (hasNoFallRisk) score += 12
  if (hasRopeProtection) score += 10
  if (hasNoSlipHazards) score += 10
  if (hasProperRoute) score += 10
  if (hasNoDeadEnds) score += 10
  if (hasSafetyEquipment) score += 10
  if (hasNoExposure) score += 10
  if (hasEmergencyPlan) score += 11

  const handling = Math.min(100, Math.max(0, score))
  const hasHighHandling = handling >= 70

  let quality: ExposureMeasure['quality'] = 'fatal-fall'
  if (hasHighHandling && hasNoFallRisk && hasProperAnchoring && hasRopeProtection) quality = 'master-climber'
  else if (hasHighHandling && hasNoFallRisk) quality = 'experienced'
  else if (hasHighHandling) quality = 'properly-equipped'
  else if (hasSafetyEquipment && hasProperAnchoring) quality = 'underprepared'
  else if (handling > 30) quality = 'exposed'

  return {
    handling, quality, hasHighHandling, hasProperAnchoring, hasNoFallRisk,
    hasRopeProtection, hasNoSlipHazards, hasProperRoute, hasNoDeadEnds,
    hasSafetyEquipment, hasNoExposure, hasEmergencyPlan, fallRiskCount, slipHazardCount,
  }
}

// ─── classifyCondition ────────────────────────────────

/** @example classifyCondition(formation) returns condition */
export function classifyCondition(formation: RockFormation): RockFormation['condition'] {
  const { qualityScore } = formation
  if (qualityScore >= 80) return 'matterhorn'
  if (qualityScore >= 65) return 'half-dome'
  if (qualityScore >= 50) return 'granite-tor'
  if (qualityScore >= 35) return 'weathered-crag'
  if (qualityScore >= 20) return 'gravel-pile'
  return 'dust'
}

// ─── analyzeRockFormation ─────────────────────────────

/** @example analyzeRockFormation(content, filePath) returns full formation */
export function analyzeRockFormation(content: string, filePath: string): RockFormation {
  const hardness = measureHardness(content)
  const crystal = measureCrystal(content)
  const weather = measureWeather(content)
  const foundation = measureFoundation(content)
  const summit = measureSummit(content)
  const exposure = measureExposure(content)

  const rockHardness = hardness.level
  const crystallineStructure = crystal.structure
  const weatherResistance = weather.resistance
  const foundationDepth = foundation.depth
  const summitQuality = summit.quality
  const exposureHandling = exposure.handling

  const qualityScore = Math.round(
    rockHardness * 0.15 +
    crystallineStructure * 0.15 +
    weatherResistance * 0.2 +
    foundationDepth * 0.15 +
    summitQuality * 0.2 +
    exposureHandling * 0.15,
  )

  const result: RockFormation = {
    file: filePath,
    rockHardness, crystallineStructure, weatherResistance,
    foundationDepth, summitQuality, exposureHandling,
    hardness, crystal, weather, foundation, summit, exposure,
    qualityScore,
    condition: 'dust',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── analyzeMountainRange ─────────────────────────────

/** @example analyzeMountainRange(formations, dirPath) returns MountainRange */
export function analyzeMountainRange(formations: RockFormation[], dirPath: string): MountainRange {
  if (formations.length === 0) {
    return {
      directory: dirPath, formations: [], avgHardness: 0, avgCrystal: 0, avgSummit: 0,
      matterhornCount: 0, dustCount: 0, hardCount: 0, stableCount: 0,
      rangeType: 'flatland', condition: 'plains',
    }
  }

  const avgHardness = Math.round(formations.reduce((s, f) => s + f.rockHardness, 0) / formations.length)
  const avgCrystal = Math.round(formations.reduce((s, f) => s + f.crystallineStructure, 0) / formations.length)
  const avgSummit = Math.round(formations.reduce((s, f) => s + f.summitQuality, 0) / formations.length)
  const matterhornCount = formations.filter((f) => f.condition === 'matterhorn').length
  const dustCount = formations.filter((f) => f.condition === 'dust').length
  const hardCount = formations.filter((f) => f.hardness.hasHighLevel).length
  const stableCount = formations.filter((f) => f.foundation.hasHighDepth).length

  const rangeType = classifyRangeType(formations)
  const avgScore = formations.reduce((s, f) => s + f.qualityScore, 0) / formations.length
  let condition: MountainRange['condition'] = 'plains'
  if (avgScore >= 75) condition = 'majestic-range'
  else if (avgScore >= 60) condition = 'solid-mountains'
  else if (avgScore >= 45) condition = 'rolling-hills'
  else if (avgScore >= 30) condition = 'eroding-peaks'
  else if (avgScore >= 15) condition = 'rubble'

  return {
    directory: dirPath, formations, avgHardness, avgCrystal, avgSummit,
    matterhornCount, dustCount, hardCount, stableCount, rangeType, condition,
  }
}

// ─── classifyRangeType ────────────────────────────────

/** @example classifyRangeType(formations) returns range type */
export function classifyRangeType(formations: RockFormation[]): MountainRange['rangeType'] {
  if (formations.length === 0) return 'flatland'
  const avgScore = formations.reduce((s, f) => s + f.qualityScore, 0) / formations.length
  const matterCnt = formations.filter((f) => f.condition === 'matterhorn').length
  if (avgScore >= 75 && matterCnt >= Math.ceil(formations.length * 0.3)) return 'himalayan-range'
  if (avgScore >= 60) return 'alpine-chain'
  if (avgScore >= 45) return 'rocky-ridge'
  if (avgScore >= 30) return 'hill-country'
  if (avgScore >= 15) return 'moraine'
  return 'flatland'
}

// ─── classifyClimberGrade ─────────────────────────────

/** @example classifyClimberGrade(avgSolidity) returns grade */
export function classifyClimberGrade(avgSolidity: number): GranitePeakResult['stats']['climberGrade'] {
  if (avgSolidity >= 80) return 'master-alpinist'
  if (avgSolidity >= 65) return 'mountaineer'
  if (avgSolidity >= 50) return 'climber'
  if (avgSolidity >= 35) return 'hiker'
  if (avgSolidity >= 20) return 'walker'
  return 'armchair'
}

// ─── generateRecommendations ──────────────────────────

/** @example generateRecommendations(formations, ranges, mountain, stats) returns string[] */
export function generateRecommendations(
  formations: RockFormation[],
  ranges: MountainRange[],
  mountain: GranitePeakResult['mountain'],
  stats: GranitePeakResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgRockHardness < 50) recs.push('Increase rock hardness — add interfaces and types for proper code robustness')
  if (stats.avgCrystallineStructure < 50) recs.push('Improve crystalline structure — organize code with proper interlocking patterns')
  if (stats.avgWeatherResistance < 50) recs.push('Boost weather resistance — add error handling to protect against code erosion')
  if (stats.avgFoundationDepth < 50) recs.push('Deepen foundations — stabilize dependencies with proper exports and imports')
  if (stats.avgSummitQuality < 50) recs.push('Improve summit quality — add documentation and remove code blind spots')
  if (stats.avgExposureHandling < 50) recs.push('Strengthen exposure handling — anchor code with proper error boundaries')
  if (stats.dustCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of formations are dust — consider major refactoring')
  if (stats.gravelPileCount > 0) recs.push('Warning: gravel piles detected — these files need solidification')
  if (mountain.overallSolidity < 40) recs.push('Overall mountain solidity is critical — establish a geological recovery plan')
  if (ranges.length > 0 && ranges.every((r) => r.condition === 'plains')) recs.push('All ranges are flatlands — your codebase needs fundamental geological uplift')

  if (formations.length > 0) {
    const cracked = formations.filter((f) => f.hardness.crackCount > 2)
    if (cracked.length > formations.length * 0.5) recs.push('Over 50% of formations have cracks — reduce any/eval usage')
  }

  return recs
}

// ─── buildGranitePeakResult ───────────────────────────

/** @example buildGranitePeakResult(files, contents) returns full result */
export function buildGranitePeakResult(files: string[], contents: string[]): GranitePeakResult {
  const formations = files.map((file, i) => analyzeRockFormation(contents[i] ?? '', file))

  const rangeMap = new Map<string, RockFormation[]>()
  formations.forEach((formation) => {
    const parts = formation.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = rangeMap.get(dir)
    if (existing) existing.push(formation)
    else rangeMap.set(dir, [formation])
  })

  const ranges = Array.from(rangeMap.entries()).map(([dir, fs]) => analyzeMountainRange(fs, dir))

  const avgRockHardness = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.rockHardness, 0) / formations.length) : 0
  const avgCrystallineStructure = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.crystallineStructure, 0) / formations.length) : 0
  const avgWeatherResistance = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.weatherResistance, 0) / formations.length) : 0
  const avgFoundationDepth = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.foundationDepth, 0) / formations.length) : 0
  const avgSummitQuality = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.summitQuality, 0) / formations.length) : 0
  const avgExposureHandling = formations.length > 0 ? Math.round(formations.reduce((s, f) => s + f.exposureHandling, 0) / formations.length) : 0

  const overallSolidity = Math.round(
    avgRockHardness * 0.15 +
    avgCrystallineStructure * 0.15 +
    avgWeatherResistance * 0.2 +
    avgFoundationDepth * 0.15 +
    avgSummitQuality * 0.2 +
    avgExposureHandling * 0.15,
  )

  const mountain = {
    avgHardness: avgRockHardness,
    avgCrystal: avgCrystallineStructure,
    avgSummit: avgSummitQuality,
    isSolid: overallSolidity >= 60,
    overallSolidity,
  }

  const stats = {
    totalFiles: files.length,
    totalRanges: ranges.length,
    avgRockHardness,
    avgCrystallineStructure,
    avgWeatherResistance,
    avgFoundationDepth,
    avgSummitQuality,
    avgExposureHandling,
    matterhornCount: formations.filter((f) => f.condition === 'matterhorn').length,
    halfDomeCount: formations.filter((f) => f.condition === 'half-dome').length,
    graniteTorCount: formations.filter((f) => f.condition === 'granite-tor').length,
    weatheredCragCount: formations.filter((f) => f.condition === 'weathered-crag').length,
    gravelPileCount: formations.filter((f) => f.condition === 'gravel-pile').length,
    dustCount: formations.filter((f) => f.condition === 'dust').length,
    hasHighHardnessCount: formations.filter((f) => f.hardness.hasHighLevel).length,
    hasHighStructureCount: formations.filter((f) => f.crystal.hasHighStructure).length,
    hasHighResistanceCount: formations.filter((f) => f.weather.hasHighResistance).length,
    hasHighDepthCount: formations.filter((f) => f.foundation.hasHighDepth).length,
    hasHighQualityCount: formations.filter((f) => f.summit.hasHighQuality).length,
    hasHighHandlingCount: formations.filter((f) => f.exposure.hasHighHandling).length,
    overallSolidity,
    climberGrade: classifyClimberGrade(overallSolidity),
    bestFormation: '',
    hardest: '',
    bestStructured: '',
    mostResilient: '',
    deepestFoundation: '',
    highestQuality: '',
  }

  if (formations.length > 0) {
    stats.bestFormation = formations.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.hardest = formations.reduce((a, b) => a.rockHardness >= b.rockHardness ? a : b).file
    stats.bestStructured = formations.reduce((a, b) => a.crystallineStructure >= b.crystallineStructure ? a : b).file
    stats.mostResilient = formations.reduce((a, b) => a.weatherResistance >= b.weatherResistance ? a : b).file
    stats.deepestFoundation = formations.reduce((a, b) => a.foundationDepth >= b.foundationDepth ? a : b).file
    stats.highestQuality = formations.reduce((a, b) => a.summitQuality >= b.summitQuality ? a : b).file
  }

  const recommendations = generateRecommendations(formations, ranges, mountain, stats)

  return { formations, ranges, mountain, stats, recommendations }
}
