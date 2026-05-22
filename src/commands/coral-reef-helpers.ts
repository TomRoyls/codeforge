// ─── Interfaces ──────────────────────────────────────────────

export interface ReefMeasure {
  structure: number
  formation: 'barrier-reef' | 'atoll' | 'fringing-reef' | 'patch-reef' | 'rubble' | 'sand'
  hasHighStructure: boolean
  hasSolidFoundation: boolean
  hasProperZonation: boolean
  hasNoErosion: boolean
  hasLayered: boolean
  hasNoCollapse: boolean
  hasComplexity: boolean
  hasNoFragmentation: boolean
  hasGrowth: boolean
  hasNoSubsidence: boolean
  erosionCount: number
  fragmentationCount: number
}

export interface PolypMeasure {
  health: number
  vitality: 'thriving' | 'healthy' | 'stressed' | 'declining' | 'dying' | 'dead'
  hasHighHealth: boolean
  hasCleanTentacles: boolean
  hasProperFeeding: boolean
  hasNoParasites: boolean
  hasCalcification: boolean
  hasNoDisease: boolean
  hasReproduction: boolean
  hasNoStunting: boolean
  hasZooxanthellae: boolean
  hasNoNecrosis: boolean
  parasiteCount: number
  diseaseCount: number
}

export interface SymbiosisMeasure {
  index: number
  harmony: 'perfect-symbiosis' | 'mutualism' | 'commensalism' | 'neutral' | 'parasitism' | 'toxic'
  hasHighHarmony: boolean
  hasCleanPartnership: boolean
  hasMutualBenefit: boolean
  hasNoExploitation: boolean
  hasProperExchange: boolean
  hasNoCompetition: boolean
  hasBalancedLoad: boolean
  hasNoOverdependence: boolean
  hasSharedResources: boolean
  hasNoConflict: boolean
  exploitationCount: number
  conflictCount: number
}

export interface TideMeasure {
  resilience: number
  strength: 'tide-proof' | 'storm-resistant' | 'weathered' | 'vulnerable' | 'fragile' | 'washed-away'
  hasHighResilience: boolean
  hasAdaptation: boolean
  hasProperAnchor: boolean
  hasNoDisplacement: boolean
  hasRegeneration: boolean
  hasNoScouring: boolean
  hasFlexibility: boolean
  hasNoBrittle: boolean
  hasWaveDissipation: boolean
  hasNoCrushing: boolean
  displacementCount: number
  scouringCount: number
}

export interface BioMeasure {
  diversity: number
  richness: 'mega-diverse' | 'high-diversity' | 'moderate' | 'low-diversity' | 'monoculture' | 'barren'
  hasHighDiversity: boolean
  hasVariety: boolean
  hasMultipleSpecies: boolean
  hasNoMonoculture: boolean
  hasEndemic: boolean
  hasNoInvasive: boolean
  hasKeystone: boolean
  hasNoExtinction: boolean
  hasNursery: boolean
  hasNoOvergrowth: boolean
  invasiveCount: number
  extinctionCount: number
}

export interface BleachingMeasure {
  risk: number
  status: 'pristine' | 'healthy' | 'warning' | 'stressed' | 'bleaching' | 'dead-zone'
  hasLowRisk: boolean
  hasNoThermalStress: boolean
  hasProtection: boolean
  hasNoPollution: boolean
  hasRecoveryPath: boolean
  hasNoAcidification: boolean
  hasMonitoring: boolean
  hasNoOverfishing: boolean
  hasCoralNursery: boolean
  hasNoAlgalBloom: boolean
  pollutionCount: number
  overfishingCount: number
}

export interface CoralColony {
  file: string
  reefStructure: number
  polypHealth: number
  symbiosisIndex: number
  tideResilience: number
  biodiversity: number
  bleachingRisk: number
  reef: ReefMeasure
  polyp: PolypMeasure
  symbiosis: SymbiosisMeasure
  tide: TideMeasure
  bio: BioMeasure
  bleaching: BleachingMeasure
  condition: 'pristine-reef' | 'healthy-reef' | 'recovering-reef' | 'stressed-reef' | 'degraded' | 'dead-zone'
  qualityScore: number
}

export interface ReefZone {
  directory: string
  colonies: CoralColony[]
  avgStructure: number
  avgSymbiosis: number
  avgBleaching: number
  pristineCount: number
  deadCount: number
  diverseCount: number
  resilientCount: number
  zoneType: 'great-barrier' | 'major-reef' | 'atoll-system' | 'patch-system' | 'rocky-shore' | 'mud-flat'
  condition: 'world-heritage' | 'marine-reserve' | 'fishing-zone' | 'stressed-area' | 'dead-zone' | 'desert'
}

export interface CoralReefResult {
  colonies: CoralColony[]
  zones: ReefZone[]
  ocean: {
    avgStructure: number
    avgSymbiosis: number
    avgBleaching: number
    isHealthy: boolean
    overallHealth: number
  }
  stats: {
    totalFiles: number
    totalZones: number
    avgReefStructure: number
    avgPolypHealth: number
    avgSymbiosisIndex: number
    avgTideResilience: number
    avgBiodiversity: number
    avgBleachingRisk: number
    pristineReefCount: number
    healthyReefCount: number
    recoveringCount: number
    stressedCount: number
    degradedCount: number
    deadZoneCount: number
    hasHighStructureCount: number
    hasHighHealthCount: number
    hasHighHarmonyCount: number
    hasHighResilienceCount: number
    hasHighDiversityCount: number
    hasLowRiskCount: number
    overallHealth: number
    guardianGrade: 'reef-guardian' | 'marine-biologist' | 'conservationist' | 'observer' | 'tourist' | 'polluter'
    bestColony: string
    bestStructured: string
    healthiest: string
    mostHarmonious: string
    mostResilient: string
    mostDiverse: string
  }
  recommendations: string[]
}

// ─── Regex Patterns ─────────────────────────────────────────

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
const RETURN_TYPE_RE = /\)\s*:\s*[A-Z]\w*/
const ENUM_RE = /\benum\b/
const OPTIONAL_RE = /\?\s*:/
const DEFAULT_RE = /\bdefault\b/
const NESTED_TERNARY_RE = /\?.*:.*\?.*:/
const DESCRIBE_RE = /\bdescribe\s*\(/
const TEST_RE = /\b(it|test)\s*\(/
const CONSOLE_RE = /\bconsole\.\w+/g
const ANY_RE = /:\s*any\b/g
const EVAL_RE = /\beval\s*\(/g
const TODO_RE = /\bTODO\b/gi
const HACK_RE = /\bHACK\b/gi
const FIXME_RE = /\bFIXME\b/gi
const EMPTY_CATCH_RE = /catch\s*\(\w*\)\s*\{\s*\}/g
const DEPRECATED_RE = /@deprecated/g
const EXCESSIVE_COMMENT_RE = /\/\*[\s\S]*?\*\//g

// ─── measureReef ────────────────────────────────────────────

/** @example measureReef(content) returns ReefMeasure */
export function measureReef(content: string): ReefMeasure {
  let score = 0

  const hasSolidFoundation = INTERFACE_RE.test(content) || CLASS_RE.test(content) || TYPE_RE.test(content)
  const hasProperZonation = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const erosionCount = (content.match(TODO_RE) || []).length + (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoErosion = erosionCount === 0
  const hasLayered = CLASS_RE.test(content) && FUNCTION_RE.test(content)
  const emptyCatchCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoCollapse = emptyCatchCount === 0
  const hasComplexity = GENERIC_RE.test(content)
  const fragmentationCount = emptyCatchCount
  const hasNoFragmentation = fragmentationCount === 0
  const hasGrowth = FUNCTION_RE.test(content) || ARROW_RE.test(content) || CLASS_RE.test(content)
  const hasNoSubsidence = !NESTED_TERNARY_RE.test(content)

  if (content.length > 0) score += 5
  if (hasSolidFoundation) score += 12
  if (hasProperZonation) score += 12
  if (hasNoErosion) score += 10
  if (hasLayered) score += 10
  if (hasNoCollapse) score += 10
  if (hasComplexity) score += 10
  if (hasNoFragmentation) score += 10
  if (hasGrowth) score += 11
  if (hasNoSubsidence) score += 10

  const structure = Math.min(100, Math.max(0, score))
  const hasHighStructure = structure >= 70

  let formation: ReefMeasure['formation'] = 'sand'
  if (hasHighStructure && hasNoErosion && hasNoFragmentation && hasComplexity) formation = 'barrier-reef'
  else if (hasHighStructure && hasNoErosion) formation = 'atoll'
  else if (hasHighStructure) formation = 'fringing-reef'
  else if (hasSolidFoundation && hasProperZonation) formation = 'patch-reef'
  else if (structure > 30) formation = 'rubble'

  return {
    structure, formation, hasHighStructure, hasSolidFoundation, hasProperZonation,
    hasNoErosion, hasLayered, hasNoCollapse, hasComplexity, hasNoFragmentation,
    hasGrowth, hasNoSubsidence, erosionCount, fragmentationCount,
  }
}

// ─── measurePolyp ───────────────────────────────────────────

/** @example measurePolyp(content) returns PolypMeasure */
export function measurePolyp(content: string): PolypMeasure {
  let score = 0

  const excessiveCommentCount = (content.match(EXCESSIVE_COMMENT_RE) || []).length
  const hasCleanTentacles = excessiveCommentCount === 0 || excessiveCommentCount <= 3
  const hasProperFeeding = FUNCTION_RE.test(content) || ARROW_RE.test(content)
  const parasiteCount = (content.match(CONSOLE_RE) || []).length
  const hasNoParasites = parasiteCount === 0
  const hasCalcification = RETURN_TYPE_RE.test(content)
  const diseaseCount = (content.match(EVAL_RE) || []).length + (content.match(ANY_RE) || []).length
  const hasNoDisease = diseaseCount === 0
  const hasReproduction = EXPORT_RE.test(content)
  const hasNoStunting = content.split('\n').every((line) => line.length < 300)
  const hasZooxanthellae = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoNecrosis = content.length === 0 || content.split('\n').filter((l) => l.trim().length > 0).length > 2

  if (content.length > 0) score += 5
  if (hasCleanTentacles) score += 10
  if (hasProperFeeding) score += 12
  if (hasNoParasites) score += 10
  if (hasCalcification) score += 12
  if (hasNoDisease) score += 10
  if (hasReproduction) score += 11
  if (hasNoStunting) score += 10
  if (hasZooxanthellae) score += 10
  if (hasNoNecrosis) score += 10

  const health = Math.min(100, Math.max(0, score))
  const hasHighHealth = health >= 70

  let vitality: PolypMeasure['vitality'] = 'dead'
  if (hasHighHealth && hasNoParasites && hasNoDisease && hasCalcification) vitality = 'thriving'
  else if (hasHighHealth && hasNoDisease) vitality = 'healthy'
  else if (hasHighHealth) vitality = 'stressed'
  else if (hasProperFeeding && hasReproduction) vitality = 'declining'
  else if (health > 30) vitality = 'dying'

  return {
    health, vitality, hasHighHealth, hasCleanTentacles, hasProperFeeding,
    hasNoParasites, hasCalcification, hasNoDisease, hasReproduction,
    hasNoStunting, hasZooxanthellae, hasNoNecrosis, parasiteCount, diseaseCount,
  }
}

// ─── measureSymbiosis ───────────────────────────────────────

/** @example measureSymbiosis(content) returns SymbiosisMeasure */
export function measureSymbiosis(content: string): SymbiosisMeasure {
  let score = 0

  const importCount = (content.match(IMPORT_RE) || []).length
  const exportCount = (content.match(EXPORT_RE) || []).length
  const hasCleanPartnership = importCount > 0 && importCount <= 15
  const hasMutualBenefit = importCount > 0 && exportCount > 0
  const exploitationCount = (content.match(ANY_RE) || []).length
  const hasNoExploitation = exploitationCount === 0
  const hasProperExchange = exportCount > 0
  const hasNoCompetition = importCount <= 20
  const hasBalancedLoad = importCount > 0 && importCount <= 10
  const hasNoOverdependence = importCount <= 15
  const hasSharedResources = TYPE_RE.test(content) || INTERFACE_RE.test(content)
  const conflictCount = (content.match(DEPRECATED_RE) || []).length
  const hasNoConflict = conflictCount === 0

  if (content.length > 0) score += 5
  if (hasCleanPartnership) score += 12
  if (hasMutualBenefit) score += 12
  if (hasNoExploitation) score += 10
  if (hasProperExchange) score += 10
  if (hasNoCompetition) score += 10
  if (hasBalancedLoad) score += 10
  if (hasNoOverdependence) score += 10
  if (hasSharedResources) score += 11
  if (hasNoConflict) score += 10

  const index = Math.min(100, Math.max(0, score))
  const hasHighHarmony = index >= 70

  let harmony: SymbiosisMeasure['harmony'] = 'toxic'
  if (hasHighHarmony && hasNoExploitation && hasNoConflict && hasMutualBenefit) harmony = 'perfect-symbiosis'
  else if (hasHighHarmony && hasNoExploitation) harmony = 'mutualism'
  else if (hasHighHarmony) harmony = 'commensalism'
  else if (hasProperExchange && hasNoConflict) harmony = 'neutral'
  else if (index > 30) harmony = 'parasitism'

  return {
    index, harmony, hasHighHarmony, hasCleanPartnership, hasMutualBenefit,
    hasNoExploitation, hasProperExchange, hasNoCompetition, hasBalancedLoad,
    hasNoOverdependence, hasSharedResources, hasNoConflict,
    exploitationCount, conflictCount,
  }
}

// ─── measureTide ────────────────────────────────────────────

/** @example measureTide(content) returns TideMeasure */
export function measureTide(content: string): TideMeasure {
  let score = 0

  const hasAdaptation = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasProperAnchor = TYPE_RE.test(content) || INTERFACE_RE.test(content) || CLASS_RE.test(content)
  const displacementCount = (content.match(CONSOLE_RE) || []).length
  const hasNoDisplacement = displacementCount === 0
  const hasRegeneration = DEFAULT_RE.test(content)
  const scouringCount = (content.match(EVAL_RE) || []).length
  const hasNoScouring = scouringCount === 0
  const hasFlexibility = OPTIONAL_RE.test(content)
  const hasNoBrittle = !NESTED_TERNARY_RE.test(content)
  const hasWaveDissipation = TRY_RE.test(content)
  const hasNoCrushing = content.length === 0 || content.split('\n').filter((l) => l.length > 200).length <= 3

  if (content.length > 0) score += 5
  if (hasAdaptation) score += 12
  if (hasProperAnchor) score += 12
  if (hasNoDisplacement) score += 10
  if (hasRegeneration) score += 10
  if (hasNoScouring) score += 10
  if (hasFlexibility) score += 10
  if (hasNoBrittle) score += 10
  if (hasWaveDissipation) score += 11
  if (hasNoCrushing) score += 10

  const resilience = Math.min(100, Math.max(0, score))
  const hasHighResilience = resilience >= 70

  let strength: TideMeasure['strength'] = 'washed-away'
  if (hasHighResilience && hasNoDisplacement && hasNoScouring && hasAdaptation) strength = 'tide-proof'
  else if (hasHighResilience && hasNoDisplacement) strength = 'storm-resistant'
  else if (hasHighResilience) strength = 'weathered'
  else if (hasProperAnchor && hasAdaptation) strength = 'vulnerable'
  else if (resilience > 30) strength = 'fragile'

  return {
    resilience, strength, hasHighResilience, hasAdaptation, hasProperAnchor,
    hasNoDisplacement, hasRegeneration, hasNoScouring, hasFlexibility,
    hasNoBrittle, hasWaveDissipation, hasNoCrushing,
    displacementCount, scouringCount,
  }
}

// ─── measureBio ─────────────────────────────────────────────

/** @example measureBio(content) returns BioMeasure */
export function measureBio(content: string): BioMeasure {
  let score = 0

  const patterns: string[] = []
  if (INTERFACE_RE.test(content)) patterns.push('interface')
  if (CLASS_RE.test(content)) patterns.push('class')
  if (TYPE_RE.test(content)) patterns.push('type')
  if (FUNCTION_RE.test(content)) patterns.push('function')
  if (ARROW_RE.test(content)) patterns.push('arrow')
  if (ENUM_RE.test(content)) patterns.push('enum')
  if (ASYNC_RE.test(content)) patterns.push('async')
  if (GENERIC_RE.test(content)) patterns.push('generic')
  const uniquePatterns = Array.from(new Set(patterns))

  const hasVariety = uniquePatterns.length >= 3
  const hasMultipleSpecies = uniquePatterns.length >= 4
  const hasNoMonoculture = uniquePatterns.length >= 2
  const hasEndemic = GENERIC_RE.test(content) || ENUM_RE.test(content)
  const invasiveCount = (content.match(DEPRECATED_RE) || []).length
  const hasNoInvasive = invasiveCount === 0
  const hasKeystone = EXPORT_RE.test(content) && (INTERFACE_RE.test(content) || CLASS_RE.test(content))
  const extinctionCount = uniquePatterns.length === 0 ? 1 : 0
  const hasNoExtinction = uniquePatterns.length > 0
  const hasNursery = DESCRIBE_RE.test(content) || TEST_RE.test(content)
  const hasNoOvergrowth = content.length === 0 || content.split('\n').filter((l) => l.length > 150).length <= 5

  if (content.length > 0) score += 5
  if (hasVariety) score += 12
  if (hasMultipleSpecies) score += 12
  if (hasNoMonoculture) score += 10
  if (hasEndemic) score += 10
  if (hasNoInvasive) score += 10
  if (hasKeystone) score += 11
  if (hasNoExtinction) score += 10
  if (hasNursery) score += 10
  if (hasNoOvergrowth) score += 10

  const diversity = Math.min(100, Math.max(0, score))
  const hasHighDiversity = diversity >= 70

  let richness: BioMeasure['richness'] = 'barren'
  if (hasHighDiversity && uniquePatterns.length >= 5) richness = 'mega-diverse'
  else if (hasHighDiversity) richness = 'high-diversity'
  else if (diversity >= 50) richness = 'moderate'
  else if (diversity > 30) richness = 'low-diversity'
  else if (uniquePatterns.length >= 1) richness = 'monoculture'

  return {
    diversity, richness, hasHighDiversity, hasVariety, hasMultipleSpecies,
    hasNoMonoculture, hasEndemic, hasNoInvasive, hasKeystone, hasNoExtinction,
    hasNursery, hasNoOvergrowth, invasiveCount, extinctionCount,
  }
}

// ─── measureBleaching ───────────────────────────────────────

/** @example measureBleaching(content) returns BleachingMeasure */
export function measureBleaching(content: string): BleachingMeasure {
  let risk = 0

  const hasNoThermalStress = !NESTED_TERNARY_RE.test(content)
  const hasProtection = TYPE_RE.test(content) || INTERFACE_RE.test(content)
  const pollutionCount = (content.match(TODO_RE) || []).length + (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoPollution = pollutionCount === 0
  const hasRecoveryPath = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoAcidification = !EVAL_RE.test(content)
  const hasMonitoring = CONSOLE_RE.test(content) || TEST_RE.test(content)
  const overfishingCount = (content.match(ANY_RE) || []).length
  const hasNoOverfishing = overfishingCount === 0
  const hasCoralNursery = DESCRIBE_RE.test(content) || TEST_RE.test(content)
  const hasNoAlgalBloom = (content.match(EXCESSIVE_COMMENT_RE) || []).length <= 5

  if (!hasNoThermalStress) risk += 12
  if (!hasProtection) risk += 10
  if (!hasNoPollution) risk += 12
  if (!hasRecoveryPath) risk += 10
  if (!hasNoAcidification) risk += 12
  if (!hasNoOverfishing) risk += 10
  if (!hasNoAlgalBloom) risk += 8
  if (!hasMonitoring) risk += 8
  if (!hasCoralNursery) risk += 8
  if (content.length === 0) risk += 10

  const finalRisk = Math.min(100, Math.max(0, risk))
  const hasLowRisk = finalRisk < 30

  let status: BleachingMeasure['status'] = 'dead-zone'
  if (finalRisk < 15) status = 'pristine'
  else if (finalRisk < 30) status = 'healthy'
  else if (finalRisk < 45) status = 'warning'
  else if (finalRisk < 60) status = 'stressed'
  else if (finalRisk < 80) status = 'bleaching'

  return {
    risk: finalRisk, status, hasLowRisk, hasNoThermalStress, hasProtection,
    hasNoPollution, hasRecoveryPath, hasNoAcidification, hasMonitoring,
    hasNoOverfishing, hasCoralNursery, hasNoAlgalBloom,
    pollutionCount, overfishingCount,
  }
}

// ─── classifyCondition ──────────────────────────────────────

/** @example classifyCondition(colony) returns condition */
export function classifyCondition(colony: CoralColony): CoralColony['condition'] {
  const { qualityScore } = colony
  if (qualityScore >= 80) return 'pristine-reef'
  if (qualityScore >= 65) return 'healthy-reef'
  if (qualityScore >= 50) return 'recovering-reef'
  if (qualityScore >= 35) return 'stressed-reef'
  if (qualityScore >= 20) return 'degraded'
  return 'dead-zone'
}

// ─── Colony Analysis ────────────────────────────────────────

/** @example analyzeCoralColony(content, filePath) returns full colony */
export function analyzeCoralColony(content: string, filePath: string): CoralColony {
  const reef = measureReef(content)
  const polyp = measurePolyp(content)
  const symbiosis = measureSymbiosis(content)
  const tide = measureTide(content)
  const bio = measureBio(content)
  const bleaching = measureBleaching(content)

  const reefStructure = reef.structure
  const polypHealth = polyp.health
  const symbiosisIndex = symbiosis.index
  const tideResilience = tide.resilience
  const biodiversity = bio.diversity
  const bleachingRisk = bleaching.risk

  const qualityScore = Math.round(
    reefStructure * 0.15 +
    polypHealth * 0.15 +
    symbiosisIndex * 0.15 +
    tideResilience * 0.2 +
    biodiversity * 0.15 +
    (100 - bleachingRisk) * 0.2,
  )

  const colony: CoralColony = {
    file: filePath,
    reefStructure, polypHealth, symbiosisIndex, tideResilience,
    biodiversity, bleachingRisk,
    reef, polyp, symbiosis, tide, bio, bleaching,
    qualityScore,
    condition: 'dead-zone',
  }

  colony.condition = classifyCondition(colony)
  return colony
}

// ─── Zone Analysis ──────────────────────────────────────────

/** @example analyzeReefZone(colonies, dirPath) returns ReefZone */
export function analyzeReefZone(colonies: CoralColony[], dirPath: string): ReefZone {
  if (colonies.length === 0) {
    return {
      directory: dirPath, colonies: [], avgStructure: 0, avgSymbiosis: 0,
      avgBleaching: 0, pristineCount: 0, deadCount: 0, diverseCount: 0,
      resilientCount: 0, zoneType: 'mud-flat', condition: 'desert',
    }
  }

  const avgStructure = Math.round(colonies.reduce((s, c) => s + c.reefStructure, 0) / colonies.length)
  const avgSymbiosis = Math.round(colonies.reduce((s, c) => s + c.symbiosisIndex, 0) / colonies.length)
  const avgBleaching = Math.round(colonies.reduce((s, c) => s + c.bleachingRisk, 0) / colonies.length)
  const pristineCount = colonies.filter((c) => c.condition === 'pristine-reef').length
  const deadCount = colonies.filter((c) => c.condition === 'dead-zone').length
  const diverseCount = colonies.filter((c) => c.bio.hasHighDiversity).length
  const resilientCount = colonies.filter((c) => c.tide.hasHighResilience).length

  const zoneType = classifyZoneType(colonies)
  const avgScore = colonies.reduce((s, c) => s + c.qualityScore, 0) / colonies.length
  const condition = classifyZoneCondition(avgScore)

  return {
    directory: dirPath, colonies, avgStructure, avgSymbiosis, avgBleaching,
    pristineCount, deadCount, diverseCount, resilientCount,
    zoneType, condition,
  }
}

// ─── Zone Classification ────────────────────────────────────

/** @example classifyZoneType(colonies) returns zone type */
export function classifyZoneType(colonies: CoralColony[]): ReefZone['zoneType'] {
  if (colonies.length === 0) return 'mud-flat'
  const avgScore = colonies.reduce((s, c) => s + c.qualityScore, 0) / colonies.length
  const pristineCnt = colonies.filter((c) => c.condition === 'pristine-reef').length
  if (avgScore >= 75 && pristineCnt >= Math.ceil(colonies.length * 0.3)) return 'great-barrier'
  if (avgScore >= 60) return 'major-reef'
  if (avgScore >= 45) return 'atoll-system'
  if (avgScore >= 30) return 'patch-system'
  if (avgScore >= 15) return 'rocky-shore'
  return 'mud-flat'
}

/** @example classifyZoneCondition(avgScore) returns condition */
export function classifyZoneCondition(avgScore: number): ReefZone['condition'] {
  if (avgScore >= 80) return 'world-heritage'
  if (avgScore >= 65) return 'marine-reserve'
  if (avgScore >= 50) return 'fishing-zone'
  if (avgScore >= 35) return 'stressed-area'
  if (avgScore >= 20) return 'dead-zone'
  return 'desert'
}

/** @example classifyGuardianGrade(avgHealth) returns grade */
export function classifyGuardianGrade(avgHealth: number): CoralReefResult['stats']['guardianGrade'] {
  if (avgHealth >= 80) return 'reef-guardian'
  if (avgHealth >= 65) return 'marine-biologist'
  if (avgHealth >= 50) return 'conservationist'
  if (avgHealth >= 35) return 'observer'
  if (avgHealth >= 20) return 'tourist'
  return 'polluter'
}

// ─── Recommendations ────────────────────────────────────────

/** @example generateRecommendations(colonies, zones, ocean, stats) returns string[] */
export function generateRecommendations(
  colonies: CoralColony[],
  zones: ReefZone[],
  ocean: CoralReefResult['ocean'],
  stats: CoralReefResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgReefStructure < 50) recs.push('Rebuild reef structure — add interfaces and type definitions for a stronger foundation')
  if (stats.avgPolypHealth < 50) recs.push('Heal polyp colony — remove console.log statements and add return types')
  if (stats.avgSymbiosisIndex < 50) recs.push('Restore symbiosis — balance imports and exports for healthier dependencies')
  if (stats.avgTideResilience < 50) recs.push('Strengthen tide resilience — add try/catch blocks and optional parameters')
  if (stats.avgBiodiversity < 50) recs.push('Increase biodiversity — use more code patterns (interfaces, enums, generics, async)')
  if (stats.avgBleachingRisk > 60) recs.push('Reduce bleaching risk — remove TODOs, HACKs, and eval() calls')
  if (stats.degradedCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of colonies are degraded — consider refactoring')
  if (stats.deadZoneCount > 0) recs.push('Warning: dead-zone colonies detected — these files need immediate attention')
  if (ocean.overallHealth < 40) recs.push('Overall reef health is critical — establish a conservation plan')
  if (zones.length > 0 && zones.every((z) => z.condition === 'desert')) recs.push('All zones are deserts — your codebase needs nurturing')

  if (colonies.length > 0) {
    const highBleaching = colonies.filter((c) => c.bleaching.risk > 60)
    if (highBleaching.length > colonies.length * 0.5) recs.push('Over 50% of colonies have high bleaching risk — urgent intervention needed')
  }

  return recs
}

// ─── Build Result ───────────────────────────────────────────

/** @example buildCoralReefResult(files, contents) returns full result */
export function buildCoralReefResult(files: string[], contents: string[]): CoralReefResult {
  const colonies = files.map((file, i) => analyzeCoralColony(contents[i] ?? '', file))

  const zoneMap = new Map<string, CoralColony[]>()
  colonies.forEach((colony) => {
    const parts = colony.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = zoneMap.get(dir)
    if (existing) existing.push(colony)
    else zoneMap.set(dir, [colony])
  })

  const zones = Array.from(zoneMap.entries()).map(([dir, cols]) => analyzeReefZone(cols, dir))

  const avgReefStructure = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.reefStructure, 0) / colonies.length) : 0
  const avgPolypHealth = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.polypHealth, 0) / colonies.length) : 0
  const avgSymbiosisIndex = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.symbiosisIndex, 0) / colonies.length) : 0
  const avgTideResilience = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.tideResilience, 0) / colonies.length) : 0
  const avgBiodiversity = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.biodiversity, 0) / colonies.length) : 0
  const avgBleachingRisk = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.bleachingRisk, 0) / colonies.length) : 0

  const overallHealth = Math.round(
    avgReefStructure * 0.15 +
    avgPolypHealth * 0.15 +
    avgSymbiosisIndex * 0.15 +
    avgTideResilience * 0.2 +
    avgBiodiversity * 0.15 +
    (100 - avgBleachingRisk) * 0.2,
  )

  const ocean = {
    avgStructure: avgReefStructure,
    avgSymbiosis: avgSymbiosisIndex,
    avgBleaching: avgBleachingRisk,
    isHealthy: overallHealth >= 60,
    overallHealth,
  }

  const stats = {
    totalFiles: files.length,
    totalZones: zones.length,
    avgReefStructure,
    avgPolypHealth,
    avgSymbiosisIndex,
    avgTideResilience,
    avgBiodiversity,
    avgBleachingRisk,
    pristineReefCount: colonies.filter((c) => c.condition === 'pristine-reef').length,
    healthyReefCount: colonies.filter((c) => c.condition === 'healthy-reef').length,
    recoveringCount: colonies.filter((c) => c.condition === 'recovering-reef').length,
    stressedCount: colonies.filter((c) => c.condition === 'stressed-reef').length,
    degradedCount: colonies.filter((c) => c.condition === 'degraded').length,
    deadZoneCount: colonies.filter((c) => c.condition === 'dead-zone').length,
    hasHighStructureCount: colonies.filter((c) => c.reef.hasHighStructure).length,
    hasHighHealthCount: colonies.filter((c) => c.polyp.hasHighHealth).length,
    hasHighHarmonyCount: colonies.filter((c) => c.symbiosis.hasHighHarmony).length,
    hasHighResilienceCount: colonies.filter((c) => c.tide.hasHighResilience).length,
    hasHighDiversityCount: colonies.filter((c) => c.bio.hasHighDiversity).length,
    hasLowRiskCount: colonies.filter((c) => c.bleaching.hasLowRisk).length,
    overallHealth,
    guardianGrade: classifyGuardianGrade(overallHealth),
    bestColony: '',
    bestStructured: '',
    healthiest: '',
    mostHarmonious: '',
    mostResilient: '',
    mostDiverse: '',
  }

  if (colonies.length > 0) {
    stats.bestColony = colonies.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.bestStructured = colonies.reduce((a, b) => a.reefStructure >= b.reefStructure ? a : b).file
    stats.healthiest = colonies.reduce((a, b) => a.polypHealth >= b.polypHealth ? a : b).file
    stats.mostHarmonious = colonies.reduce((a, b) => a.symbiosisIndex >= b.symbiosisIndex ? a : b).file
    stats.mostResilient = colonies.reduce((a, b) => a.tideResilience >= b.tideResilience ? a : b).file
    stats.mostDiverse = colonies.reduce((a, b) => a.biodiversity >= b.biodiversity ? a : b).file
  }

  const recommendations = generateRecommendations(colonies, zones, ocean, stats)

  return { colonies, zones, ocean, stats, recommendations }
}
