// ─── Interfaces ───────────────────────────────────────────

export interface StormMeasure {
  resistance: number
  category: 'category-5-proof' | 'hurricane-rated' | 'storm-tested' | 'moderate' | 'light-duty' | 'collapses'
  hasHighResistance: boolean
  hasProperReinforcement: boolean
  hasNoWeakPoints: boolean
  hasStructural: boolean
  hasNoErosion: boolean
  hasImpactResistant: boolean
  hasNoCracking: boolean
  hasFlexible: boolean
  hasNoBrittleness: boolean
  hasDurable: boolean
  weakPointCount: number
  crackingCount: number
}

export interface ThunderMeasure {
  quality: number
  volume: 'thunderous' | 'powerful' | 'resonant' | 'moderate' | 'distant' | 'silent'
  hasHighQuality: boolean
  hasCommanding: boolean
  hasProperProjection: boolean
  hasNoDistortion: boolean
  hasClearSignal: boolean
  hasNoNoise: boolean
  hasResonant: boolean
  hasNoInterference: boolean
  hasPowerful: boolean
  hasNoMuffling: boolean
  distortionCount: number
  interferenceCount: number
}

export interface LightningMeasure {
  path: number
  speed: 'bolt-speed' | 'rapid-flash' | 'quick-strike' | 'moderate' | 'slow-arc' | 'no-flash'
  hasHighSpeed: boolean
  hasDirectPath: boolean
  hasNoResistance: boolean
  hasEfficient: boolean
  hasNoBottleneck: boolean
  hasOptimalRoute: boolean
  hasNoDetours: boolean
  hasCleanStrike: boolean
  hasNoWaste: boolean
  hasSwift: boolean
  bottleneckCount: number
  detourCount: number
}

export interface FloodMeasure {
  defense: number
  protection: 'levee-master' | 'flood-wall' | 'proper-drainage' | 'sandbags' | 'leaky-dike' | 'submerged'
  hasHighDefense: boolean
  hasProperChannels: boolean
  hasNoOverflow: boolean
  hasCatchment: boolean
  hasNoSpillage: boolean
  hasProperRouting: boolean
  hasNoFlooding: boolean
  hasRetention: boolean
  hasNoCascadeFailure: boolean
  hasRecovery: boolean
  overflowCount: number
  cascadeFailureCount: number
}

export interface WindMeasure {
  endurance: number
  rating: 'tornado-proof' | 'hurricane-rated' | 'gale-force' | 'moderate-breeze' | 'light-wind' | 'blown-away'
  hasHighEndurance: boolean
  hasAerodynamic: boolean
  hasNoParasiticDrag: boolean
  hasStreamlined: boolean
  hasNoTurbulence: boolean
  hasLoadBalanced: boolean
  hasNoVibration: boolean
  hasProperAnchoring: boolean
  hasNoUplift: boolean
  hasStable: boolean
  dragCount: number
  vibrationCount: number
}

export interface IntegrityMeasure {
  level: number
  state: 'impregnable' | 'fortress-grade' | 'solid-gate' | 'sturdy-door' | 'rusted-gate' | 'broken'
  hasHighLevel: boolean
  hasCompleteSeal: boolean
  hasNoVulnerability: boolean
  hasTestedIntegrity: boolean
  hasNoDegradation: boolean
  hasReliable: boolean
  hasNoSinglePoint: boolean
  hasProvenResilience: boolean
  hasNoFatigue: boolean
  hasEnduring: boolean
  vulnerabilityCount: number
  fatigueCount: number
}

export interface GateSection {
  file: string
  stormResistance: number
  thunderQuality: number
  lightningPath: number
  floodDefense: number
  windEndurance: number
  gateIntegrity: number
  storm: StormMeasure
  thunder: ThunderMeasure
  lightning: LightningMeasure
  flood: FloodMeasure
  wind: WindMeasure
  integrity: IntegrityMeasure
  condition: 'impregnable-fortress' | 'storm-castle' | 'solid-gatehouse' | 'weathered-gate' | 'crumbling-wall' | 'ruins'
  qualityScore: number
}

export interface StormWall {
  directory: string
  sections: GateSection[]
  avgStorm: number
  avgFlood: number
  avgIntegrity: number
  fortressCount: number
  ruinsCount: number
  resistantCount: number
  defendedCount: number
  wallType: 'great-wall' | 'castle-wall' | 'city-wall' | 'garden-wall' | 'fence' | 'no-barrier'
  condition: 'impregnable' | 'stronghold' | 'defensible' | 'breached' | 'crumbling' | 'fallen'
}

export interface TempestGateResult {
  sections: GateSection[]
  walls: StormWall[]
  fortress: {
    avgStorm: number
    avgFlood: number
    avgIntegrity: number
    isImpregnable: boolean
    overallFortification: number
  }
  stats: {
    totalFiles: number
    totalWalls: number
    avgStormResistance: number
    avgThunderQuality: number
    avgLightningPath: number
    avgFloodDefense: number
    avgWindEndurance: number
    avgGateIntegrity: number
    impregnableFortressCount: number
    stormCastleCount: number
    solidGatehouseCount: number
    weatheredGateCount: number
    crumblingWallCount: number
    ruinsCount: number
    hasHighResistanceCount: number
    hasHighQualityCount: number
    hasHighSpeedCount: number
    hasHighDefenseCount: number
    hasHighEnduranceCount: number
    hasHighLevelCount: number
    overallFortification: number
    commanderGrade: 'fortress-commander' | 'castle-warden' | 'gatekeeper' | 'guard' | 'watchman' | 'deserter'
    bestSection: string
    mostResilient: string
    mostImpactful: string
    fastest: string
    bestDefended: string
    mostReliable: string
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

// ─── measureStorm ────────────────────────────────────────

/** @example measureStorm(content) returns StormMeasure */
export function measureStorm(content: string): StormMeasure {
  let score = 0

  const hasProperReinforcement = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const weakPointCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoWeakPoints = weakPointCount === 0
  const hasStructural = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const crackingCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoCracking = crackingCount === 0
  const hasImpactResistant = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoErosion = !NESTED_TERNARY_RE.test(content)
  const hasFlexible = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoBrittleness = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasDurable = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasProperReinforcement) score += 12
  if (hasNoWeakPoints) score += 12
  if (hasStructural) score += 10
  if (hasNoCracking) score += 10
  if (hasImpactResistant) score += 10
  if (hasNoErosion) score += 10
  if (hasFlexible) score += 10
  if (hasNoBrittleness) score += 11
  if (hasDurable) score += 10

  const resistance = Math.min(100, Math.max(0, score))
  const hasHighResistance = resistance >= 70

  let category: StormMeasure['category'] = 'collapses'
  if (hasHighResistance && hasNoWeakPoints && hasProperReinforcement && hasDurable) category = 'category-5-proof'
  else if (hasHighResistance && hasNoWeakPoints) category = 'hurricane-rated'
  else if (hasHighResistance) category = 'storm-tested'
  else if (hasProperReinforcement && hasStructural) category = 'moderate'
  else if (resistance > 30) category = 'light-duty'

  return {
    resistance, category, hasHighResistance, hasProperReinforcement, hasNoWeakPoints,
    hasStructural, hasNoErosion, hasImpactResistant, hasNoCracking, hasFlexible,
    hasNoBrittleness, hasDurable, weakPointCount, crackingCount,
  }
}

// ─── measureThunder ──────────────────────────────────────

/** @example measureThunder(content) returns ThunderMeasure */
export function measureThunder(content: string): ThunderMeasure {
  let score = 0

  const hasCommanding = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasProperProjection = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const distortionCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDistortion = distortionCount === 0
  const hasClearSignal = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoNoise = (content.match(CONSOLE_RE) || []).length === 0
  const hasResonant = CLASS_RE.test(content) && INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const interferenceCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoInterference = interferenceCount === 0
  const hasPowerful = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoMuffling = !NESTED_TERNARY_RE.test(content)
  const hasClearDocs = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasCommanding) score += 12
  if (hasProperProjection) score += 10
  if (hasNoDistortion) score += 12
  if (hasClearSignal) score += 10
  if (hasNoNoise) score += 10
  if (hasResonant) score += 10
  if (hasNoInterference) score += 10
  if (hasPowerful) score += 11
  if (hasNoMuffling) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let volume: ThunderMeasure['volume'] = 'silent'
  if (hasHighQuality && hasNoDistortion && hasCommanding && hasResonant) volume = 'thunderous'
  else if (hasHighQuality && hasNoDistortion) volume = 'powerful'
  else if (hasHighQuality) volume = 'resonant'
  else if (hasCommanding && hasProperProjection) volume = 'moderate'
  else if (quality > 30) volume = 'distant'

  return {
    quality, volume, hasHighQuality, hasCommanding, hasProperProjection,
    hasNoDistortion, hasClearSignal, hasNoNoise, hasResonant, hasNoInterference,
    hasPowerful, hasNoMuffling, distortionCount, interferenceCount,
  }
}

// ─── measureLightning ────────────────────────────────────

/** @example measureLightning(content) returns LightningMeasure */
export function measureLightning(content: string): LightningMeasure {
  let score = 0

  const hasDirectPath = INTERFACE_RE.test(content) && EXPORT_RE.test(content)
  const bottleneckCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoBottleneck = bottleneckCount === 0
  const hasEfficient = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const detourCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoDetours = detourCount === 0
  const hasOptimalRoute = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoResistance = !NESTED_TERNARY_RE.test(content)
  const hasCleanStrike = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoWaste = (content.match(CONSOLE_RE) || []).length === 0
  const hasSwift = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasStreamlined = CLASS_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))

  if (content.length > 0) score += 5
  if (hasDirectPath) score += 12
  if (hasNoBottleneck) score += 12
  if (hasEfficient) score += 10
  if (hasNoDetours) score += 10
  if (hasOptimalRoute) score += 10
  if (hasNoResistance) score += 10
  if (hasCleanStrike) score += 10
  if (hasNoWaste) score += 11
  if (hasSwift) score += 10

  const path = Math.min(100, Math.max(0, score))
  const hasHighSpeed = path >= 70

  let speed: LightningMeasure['speed'] = 'no-flash'
  if (hasHighSpeed && hasNoBottleneck && hasDirectPath && hasOptimalRoute) speed = 'bolt-speed'
  else if (hasHighSpeed && hasNoBottleneck) speed = 'rapid-flash'
  else if (hasHighSpeed) speed = 'quick-strike'
  else if (hasDirectPath && hasEfficient) speed = 'moderate'
  else if (path > 30) speed = 'slow-arc'

  return {
    path, speed, hasHighSpeed, hasDirectPath, hasNoResistance, hasEfficient,
    hasNoBottleneck, hasOptimalRoute, hasNoDetours, hasCleanStrike, hasNoWaste,
    hasSwift, bottleneckCount, detourCount,
  }
}

// ─── measureFlood ────────────────────────────────────────

/** @example measureFlood(content) returns FloodMeasure */
export function measureFlood(content: string): FloodMeasure {
  let score = 0

  const hasCatchment = TRY_RE.test(content) && CATCH_RE.test(content)
  const overflowCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoOverflow = overflowCount === 0
  const hasProperChannels = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoSpillage = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasProperRouting = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const cascadeFailureCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoCascadeFailure = cascadeFailureCount === 0
  const hasRecovery = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoFlooding = !NESTED_TERNARY_RE.test(content)
  const hasRetention = CLASS_RE.test(content) && INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoPollution = (content.match(CONSOLE_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasCatchment) score += 12
  if (hasNoOverflow) score += 12
  if (hasProperChannels) score += 10
  if (hasNoSpillage) score += 10
  if (hasProperRouting) score += 10
  if (hasNoCascadeFailure) score += 10
  if (hasRecovery) score += 10
  if (hasNoFlooding) score += 11
  if (hasRetention) score += 10

  const defense = Math.min(100, Math.max(0, score))
  const hasHighDefense = defense >= 70

  let protection: FloodMeasure['protection'] = 'submerged'
  if (hasHighDefense && hasNoOverflow && hasCatchment && hasRetention) protection = 'levee-master'
  else if (hasHighDefense && hasNoOverflow) protection = 'flood-wall'
  else if (hasHighDefense) protection = 'proper-drainage'
  else if (hasCatchment && hasProperChannels) protection = 'sandbags'
  else if (defense > 30) protection = 'leaky-dike'

  return {
    defense, protection, hasHighDefense, hasProperChannels, hasNoOverflow, hasCatchment,
    hasNoSpillage, hasProperRouting, hasNoFlooding, hasRetention, hasNoCascadeFailure,
    hasRecovery, overflowCount, cascadeFailureCount,
  }
}

// ─── measureWind ─────────────────────────────────────────

/** @example measureWind(content) returns WindMeasure */
export function measureWind(content: string): WindMeasure {
  let score = 0

  const hasAerodynamic = INTERFACE_RE.test(content) && EXPORT_RE.test(content)
  const dragCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoParasiticDrag = dragCount === 0
  const hasStreamlined = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const vibrationCount = (content.match(HACK_RE) || []).length + (content.match(DEPRECATED_RE) || []).length
  const hasNoVibration = vibrationCount === 0
  const hasLoadBalanced = CLASS_RE.test(content) && TYPE_RE.test(content) && INTERFACE_RE.test(content)
  const hasNoTurbulence = !NESTED_TERNARY_RE.test(content)
  const hasProperAnchoring = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoUplift = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasStable = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoDrag = (content.match(CONSOLE_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasAerodynamic) score += 12
  if (hasNoParasiticDrag) score += 12
  if (hasStreamlined) score += 10
  if (hasNoVibration) score += 10
  if (hasLoadBalanced) score += 10
  if (hasNoTurbulence) score += 10
  if (hasProperAnchoring) score += 10
  if (hasNoUplift) score += 11
  if (hasStable) score += 10

  const endurance = Math.min(100, Math.max(0, score))
  const hasHighEndurance = endurance >= 70

  let rating: WindMeasure['rating'] = 'blown-away'
  if (hasHighEndurance && hasNoParasiticDrag && hasLoadBalanced && hasNoUplift) rating = 'tornado-proof'
  else if (hasHighEndurance && hasNoParasiticDrag) rating = 'hurricane-rated'
  else if (hasHighEndurance) rating = 'gale-force'
  else if (hasLoadBalanced && hasStreamlined) rating = 'moderate-breeze'
  else if (endurance > 30) rating = 'light-wind'

  return {
    endurance, rating, hasHighEndurance, hasAerodynamic, hasNoParasiticDrag,
    hasStreamlined, hasNoTurbulence, hasLoadBalanced, hasNoVibration, hasProperAnchoring,
    hasNoUplift, hasStable, dragCount, vibrationCount,
  }
}

// ─── measureIntegrity ────────────────────────────────────

/** @example measureIntegrity(content) returns IntegrityMeasure */
export function measureIntegrity(content: string): IntegrityMeasure {
  let score = 0

  const hasCompleteSeal = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const vulnerabilityCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoVulnerability = vulnerabilityCount === 0
  const hasTestedIntegrity = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoDegradation = !NESTED_TERNARY_RE.test(content)
  const hasReliable = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const fatigueCount = (content.match(HACK_RE) || []).length + (content.match(DEPRECATED_RE) || []).length
  const hasNoFatigue = fatigueCount === 0
  const hasNoSinglePoint = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasProvenResilience = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasEnduring = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasCompleteSeal) score += 12
  if (hasNoVulnerability) score += 12
  if (hasTestedIntegrity) score += 10
  if (hasNoDegradation) score += 10
  if (hasReliable) score += 10
  if (hasNoFatigue) score += 10
  if (hasNoSinglePoint) score += 10
  if (hasProvenResilience) score += 11
  if (hasEnduring) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let state: IntegrityMeasure['state'] = 'broken'
  if (hasHighLevel && hasNoVulnerability && hasCompleteSeal && hasEnduring) state = 'impregnable'
  else if (hasHighLevel && hasNoVulnerability) state = 'fortress-grade'
  else if (hasHighLevel) state = 'solid-gate'
  else if (hasCompleteSeal && hasReliable) state = 'sturdy-door'
  else if (level > 30) state = 'rusted-gate'

  return {
    level, state, hasHighLevel, hasCompleteSeal, hasNoVulnerability, hasTestedIntegrity,
    hasNoDegradation, hasReliable, hasNoSinglePoint, hasProvenResilience, hasNoFatigue,
    hasEnduring, vulnerabilityCount, fatigueCount,
  }
}

// ─── classifyCondition ───────────────────────────────────

/** @example classifyCondition(section) returns condition */
export function classifyCondition(section: GateSection): GateSection['condition'] {
  const { qualityScore } = section
  if (qualityScore >= 80) return 'impregnable-fortress'
  if (qualityScore >= 65) return 'storm-castle'
  if (qualityScore >= 50) return 'solid-gatehouse'
  if (qualityScore >= 35) return 'weathered-gate'
  if (qualityScore >= 20) return 'crumbling-wall'
  return 'ruins'
}

// ─── analyzeGateSection ──────────────────────────────────

/** @example analyzeGateSection(content, filePath) returns GateSection */
export function analyzeGateSection(content: string, filePath: string): GateSection {
  const storm = measureStorm(content)
  const thunder = measureThunder(content)
  const lightning = measureLightning(content)
  const flood = measureFlood(content)
  const wind = measureWind(content)
  const integrity = measureIntegrity(content)

  const stormResistance = storm.resistance
  const thunderQuality = thunder.quality
  const lightningPath = lightning.path
  const floodDefense = flood.defense
  const windEndurance = wind.endurance
  const gateIntegrity = integrity.level

  const qualityScore = Math.round(
    stormResistance * 0.15 +
    thunderQuality * 0.15 +
    lightningPath * 0.15 +
    floodDefense * 0.2 +
    windEndurance * 0.15 +
    gateIntegrity * 0.2,
  )

  const result: GateSection = {
    file: filePath,
    stormResistance, thunderQuality, lightningPath, floodDefense,
    windEndurance, gateIntegrity,
    storm, thunder, lightning, flood, wind, integrity,
    qualityScore,
    condition: 'ruins',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── classifyWallType ────────────────────────────────────

/** @example classifyWallType(sections) returns wall type */
export function classifyWallType(sections: GateSection[]): StormWall['wallType'] {
  if (sections.length === 0) return 'no-barrier'
  const avgScore = sections.reduce((s, sec) => s + sec.qualityScore, 0) / sections.length
  const fortressCnt = sections.filter((sec) => sec.condition === 'impregnable-fortress').length
  if (avgScore >= 75 && fortressCnt >= Math.ceil(sections.length * 0.3)) return 'great-wall'
  if (avgScore >= 60) return 'castle-wall'
  if (avgScore >= 45) return 'city-wall'
  if (avgScore >= 30) return 'garden-wall'
  if (avgScore >= 15) return 'fence'
  return 'no-barrier'
}

// ─── analyzeStormWall ────────────────────────────────────

/** @example analyzeStormWall(sections, dirPath) returns StormWall */
export function analyzeStormWall(sections: GateSection[], dirPath: string): StormWall {
  if (sections.length === 0) {
    return {
      directory: dirPath, sections: [], avgStorm: 0, avgFlood: 0, avgIntegrity: 0,
      fortressCount: 0, ruinsCount: 0, resistantCount: 0, defendedCount: 0,
      wallType: 'no-barrier', condition: 'fallen',
    }
  }

  const avgStorm = Math.round(sections.reduce((s, sec) => s + sec.stormResistance, 0) / sections.length)
  const avgFlood = Math.round(sections.reduce((s, sec) => s + sec.floodDefense, 0) / sections.length)
  const avgIntegrity = Math.round(sections.reduce((s, sec) => s + sec.gateIntegrity, 0) / sections.length)
  const fortressCount = sections.filter((sec) => sec.condition === 'impregnable-fortress').length
  const ruinsCount = sections.filter((sec) => sec.condition === 'ruins').length
  const resistantCount = sections.filter((sec) => sec.storm.hasHighResistance).length
  const defendedCount = sections.filter((sec) => sec.flood.hasHighDefense).length

  const wallType = classifyWallType(sections)
  const avgScore = sections.reduce((s, sec) => s + sec.qualityScore, 0) / sections.length
  let condition: StormWall['condition'] = 'fallen'
  if (avgScore >= 75) condition = 'impregnable'
  else if (avgScore >= 60) condition = 'stronghold'
  else if (avgScore >= 45) condition = 'defensible'
  else if (avgScore >= 30) condition = 'breached'
  else if (avgScore >= 15) condition = 'crumbling'

  return {
    directory: dirPath, sections, avgStorm, avgFlood, avgIntegrity,
    fortressCount, ruinsCount, resistantCount, defendedCount, wallType, condition,
  }
}

// ─── classifyCommanderGrade ──────────────────────────────

/** @example classifyCommanderGrade(avgFortification) returns grade */
export function classifyCommanderGrade(avgFortification: number): TempestGateResult['stats']['commanderGrade'] {
  if (avgFortification >= 80) return 'fortress-commander'
  if (avgFortification >= 65) return 'castle-warden'
  if (avgFortification >= 50) return 'gatekeeper'
  if (avgFortification >= 35) return 'guard'
  if (avgFortification >= 20) return 'watchman'
  return 'deserter'
}

// ─── generateRecommendations ─────────────────────────────

/** @example generateRecommendations(sections, walls, fortress, stats) returns string[] */
export function generateRecommendations(
  sections: GateSection[],
  walls: StormWall[],
  fortress: TempestGateResult['fortress'],
  stats: TempestGateResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgStormResistance < 50) recs.push('Reinforce storm resistance — add interfaces, types, and error handling for code resilience')
  if (stats.avgThunderQuality < 50) recs.push('Amplify thunder quality — reduce any/eval and add documentation for code impact')
  if (stats.avgLightningPath < 50) recs.push('Optimize lightning path — improve exports and imports for code execution speed')
  if (stats.avgFloodDefense < 50) recs.push('Strengthen flood defense — add try/catch and reduce overflow for error handling')
  if (stats.avgWindEndurance < 50) recs.push('Improve wind endurance — reduce parasitic drag and add structural patterns')
  if (stats.avgGateIntegrity < 50) recs.push('Bolster gate integrity — add abstractions and reduce vulnerabilities for code reliability')
  if (stats.ruinsCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of sections are ruins — consider major code fortification')
  if (stats.crumblingWallCount > 0) recs.push('Warning: crumbling-wall sections detected — these files need reinforcement')
  if (fortress.overallFortification < 40) recs.push('Overall fortification is critically low — establish a storm defense regimen')
  if (walls.length > 0 && walls.every((w) => w.condition === 'fallen')) recs.push('All walls have fallen — your codebase needs fundamental tempest fortification')

  if (sections.length > 0) {
    const highWeakPoints = sections.filter((sec) => sec.storm.weakPointCount > 2)
    if (highWeakPoints.length > sections.length * 0.5) recs.push('Over 50% of sections have high weak points — reduce any/eval usage')
  }

  return recs
}

// ─── buildTempestGateResult ──────────────────────────────

/** @example buildTempestGateResult(files, contents, options) returns full result */
export function buildTempestGateResult(files: string[], contents: string[], _options?: Record<string, unknown>): TempestGateResult {
  const sections = files.map((file, i) => analyzeGateSection(contents[i] ?? '', file))

  const wallMap = new Map<string, GateSection[]>()
  sections.forEach((section) => {
    const parts = section.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = wallMap.get(dir)
    if (existing) existing.push(section)
    else wallMap.set(dir, [section])
  })

  const walls = Array.from(wallMap.entries()).map(([dir, secs]) => analyzeStormWall(secs, dir))

  const avgStormResistance = sections.length > 0 ? Math.round(sections.reduce((s, sec) => s + sec.stormResistance, 0) / sections.length) : 0
  const avgThunderQuality = sections.length > 0 ? Math.round(sections.reduce((s, sec) => s + sec.thunderQuality, 0) / sections.length) : 0
  const avgLightningPath = sections.length > 0 ? Math.round(sections.reduce((s, sec) => s + sec.lightningPath, 0) / sections.length) : 0
  const avgFloodDefense = sections.length > 0 ? Math.round(sections.reduce((s, sec) => s + sec.floodDefense, 0) / sections.length) : 0
  const avgWindEndurance = sections.length > 0 ? Math.round(sections.reduce((s, sec) => s + sec.windEndurance, 0) / sections.length) : 0
  const avgGateIntegrity = sections.length > 0 ? Math.round(sections.reduce((s, sec) => s + sec.gateIntegrity, 0) / sections.length) : 0

  const overallFortification = Math.round(
    avgStormResistance * 0.15 +
    avgThunderQuality * 0.15 +
    avgLightningPath * 0.15 +
    avgFloodDefense * 0.2 +
    avgWindEndurance * 0.15 +
    avgGateIntegrity * 0.2,
  )

  const fortress = {
    avgStorm: avgStormResistance,
    avgFlood: avgFloodDefense,
    avgIntegrity: avgGateIntegrity,
    isImpregnable: overallFortification >= 60,
    overallFortification,
  }

  const stats = {
    totalFiles: files.length,
    totalWalls: walls.length,
    avgStormResistance,
    avgThunderQuality,
    avgLightningPath,
    avgFloodDefense,
    avgWindEndurance,
    avgGateIntegrity,
    impregnableFortressCount: sections.filter((sec) => sec.condition === 'impregnable-fortress').length,
    stormCastleCount: sections.filter((sec) => sec.condition === 'storm-castle').length,
    solidGatehouseCount: sections.filter((sec) => sec.condition === 'solid-gatehouse').length,
    weatheredGateCount: sections.filter((sec) => sec.condition === 'weathered-gate').length,
    crumblingWallCount: sections.filter((sec) => sec.condition === 'crumbling-wall').length,
    ruinsCount: sections.filter((sec) => sec.condition === 'ruins').length,
    hasHighResistanceCount: sections.filter((sec) => sec.storm.hasHighResistance).length,
    hasHighQualityCount: sections.filter((sec) => sec.thunder.hasHighQuality).length,
    hasHighSpeedCount: sections.filter((sec) => sec.lightning.hasHighSpeed).length,
    hasHighDefenseCount: sections.filter((sec) => sec.flood.hasHighDefense).length,
    hasHighEnduranceCount: sections.filter((sec) => sec.wind.hasHighEndurance).length,
    hasHighLevelCount: sections.filter((sec) => sec.integrity.hasHighLevel).length,
    overallFortification,
    commanderGrade: classifyCommanderGrade(overallFortification),
    bestSection: '',
    mostResilient: '',
    mostImpactful: '',
    fastest: '',
    bestDefended: '',
    mostReliable: '',
  }

  if (sections.length > 0) {
    stats.bestSection = sections.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.mostResilient = sections.reduce((a, b) => a.stormResistance >= b.stormResistance ? a : b).file
    stats.mostImpactful = sections.reduce((a, b) => a.thunderQuality >= b.thunderQuality ? a : b).file
    stats.fastest = sections.reduce((a, b) => a.lightningPath >= b.lightningPath ? a : b).file
    stats.bestDefended = sections.reduce((a, b) => a.floodDefense >= b.floodDefense ? a : b).file
    stats.mostReliable = sections.reduce((a, b) => a.gateIntegrity >= b.gateIntegrity ? a : b).file
  }

  const recommendations = generateRecommendations(sections, walls, fortress, stats)

  return { sections, walls, fortress, stats, recommendations }
}
