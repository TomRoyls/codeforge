// ─── Interfaces ───────────────────────────────────────────

export interface PetalMeasure {
  beauty: number
  radiance: 'thousand-petal' | 'full-bloom' | 'opening' | 'bud' | 'wilted' | 'fallen'
  hasHighBeauty: boolean
  hasElegantForm: boolean
  hasProperSymmetry: boolean
  hasNoBlemish: boolean
  hasGraceful: boolean
  hasNoAwkwardness: boolean
  hasRefined: boolean
  hasNoRoughness: boolean
  hasHarmonious: boolean
  hasNoDissonance: boolean
  blemishCount: number
  roughnessCount: number
}

export interface RootMeasure {
  depth: number
  strength: 'deep-taproot' | 'strong-root' | 'established' | 'shallow-root' | 'floating' | 'uprooted'
  hasHighDepth: boolean
  hasSolidAnchoring: boolean
  hasProperNourishment: boolean
  hasNoRot: boolean
  hasExtensive: boolean
  hasNoInstability: boolean
  hasProperUptake: boolean
  hasNoContamination: boolean
  hasResilient: boolean
  hasNoErosion: boolean
  rotCount: number
  erosionCount: number
}

export interface MudMeasure {
  transcendence: number
  purity: 'spotless' | 'clean' | 'mostly-pure' | 'some-residue' | 'muddy' | 'polluted'
  hasHighTranscendence: boolean
  hasNoContaminants: boolean
  hasCleanPatterns: boolean
  hasNoTechnicalDebt: boolean
  hasPureLogic: boolean
  hasNoHackery: boolean
  hasNoSideEffects: boolean
  hasNoLegacyCruft: boolean
  hasPristine: boolean
  hasNoBandAids: boolean
  contaminantCount: number
  hackeryCount: number
}

export interface GeometryMeasure {
  quality: number
  pattern: 'golden-ratio' | 'fibonacci-spiral' | 'sacred-pattern' | 'organized' | 'irregular' | 'chaotic'
  hasHighQuality: boolean
  hasProperProportions: boolean
  hasBalanced: boolean
  hasNoDistortion: boolean
  hasMathematical: boolean
  hasNoAsymmetry: boolean
  hasElegant: boolean
  hasNoOvercomplication: boolean
  hasProperRatios: boolean
  hasNoBloat: boolean
  distortionCount: number
  bloatCount: number
}

export interface FragranceMeasure {
  quality: number
  aroma: 'intoxicating' | 'fragrant' | 'pleasant' | 'faint' | 'odorless' | 'stale'
  hasHighQuality: boolean
  hasSweetDocumentation: boolean
  hasProperAroma: boolean
  hasNoStaleDocs: boolean
  hasInformative: boolean
  hasNoMisleading: boolean
  hasCaptivating: boolean
  hasNoMissing: boolean
  hasProperExamples: boolean
  hasNoOutdated: boolean
  staleCount: number
  misleadingCount: number
}

export interface VitalityMeasure {
  level: number
  health: 'eternal-bloom' | 'vibrant' | 'healthy' | 'fading' | 'wilting' | 'dead'
  hasHighLevel: boolean
  hasVitality: boolean
  hasNoDegeneration: boolean
  hasRenewable: boolean
  hasNoStagnation: boolean
  hasGrowthPotential: boolean
  hasNoDisease: boolean
  hasAdaptive: boolean
  hasNoFragility: boolean
  hasThriving: boolean
  degenerationCount: number
  diseaseCount: number
}

export interface LotusPetal {
  file: string
  petalBeauty: number
  rootDepth: number
  mudTranscendence: number
  sacredGeometry: number
  fragranceQuality: number
  bloomVitality: number
  petal: PetalMeasure
  root: RootMeasure
  mud: MudMeasure
  geometry: GeometryMeasure
  fragrance: FragranceMeasure
  vitality: VitalityMeasure
  condition: 'divine-lotus' | 'sacred-bloom' | 'garden-lotus' | 'pond-flower' | 'mud-sprout' | 'seed'
  qualityScore: number
}

export interface LotusPond {
  directory: string
  petals: LotusPetal[]
  avgBeauty: number
  avgPurity: number
  avgVitality: number
  divineCount: number
  seedCount: number
  pureCount: number
  vitalCount: number
  pondType: 'sacred-pond' | 'temple-garden' | 'meditation-pool' | 'garden-pond' | 'muddy-puddle' | 'dry-bed'
  condition: 'divine-garden' | 'sacred-pond' | 'blooming-garden' | 'greenhouse' | 'dying-pond' | 'barren'
}

export interface LotusBloomResult {
  petals: LotusPetal[]
  ponds: LotusPond[]
  garden: {
    avgBeauty: number
    avgPurity: number
    avgVitality: number
    isPristine: boolean
    overallPurity: number
  }
  stats: {
    totalFiles: number
    totalPonds: number
    avgPetalBeauty: number
    avgRootDepth: number
    avgMudTranscendence: number
    avgSacredGeometry: number
    avgFragranceQuality: number
    avgBloomVitality: number
    divineLotusCount: number
    sacredBloomCount: number
    gardenLotusCount: number
    pondFlowerCount: number
    mudSproutCount: number
    seedCount: number
    hasHighBeautyCount: number
    hasHighDepthCount: number
    hasHighTranscendenceCount: number
    hasHighQualityCount: number
    hasHighFragranceCount: number
    hasHighLevelCount: number
    overallPurity: number
    gardenerGrade: 'enlightened-master' | 'zen-gardener' | 'lotus-tender' | 'gardener' | 'apprentice' | 'trampler'
    bestPetal: string
    mostBeautiful: string
    deepestRoots: string
    purest: string
    bestStructured: string
    bestDocumented: string
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

// ─── measurePetal ────────────────────────────────────────

/** @example measurePetal(content) returns PetalMeasure */
export function measurePetal(content: string): PetalMeasure {
  let score = 0

  const hasElegantForm = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const hasProperSymmetry = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const blemishCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoBlemish = blemishCount === 0
  const hasGraceful = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoAwkwardness = !NESTED_TERNARY_RE.test(content)
  const hasRefined = TRY_RE.test(content) && CATCH_RE.test(content)
  const roughnessCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoRoughness = roughnessCount === 0
  const hasHarmonious = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoDissonance = (content.match(EMPTY_CATCH_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasElegantForm) score += 12
  if (hasProperSymmetry) score += 10
  if (hasNoBlemish) score += 12
  if (hasGraceful) score += 10
  if (hasNoAwkwardness) score += 10
  if (hasRefined) score += 10
  if (hasNoRoughness) score += 10
  if (hasHarmonious) score += 11
  if (hasNoDissonance) score += 10

  const beauty = Math.min(100, Math.max(0, score))
  const hasHighBeauty = beauty >= 70

  let radiance: PetalMeasure['radiance'] = 'fallen'
  if (hasHighBeauty && hasNoBlemish && hasElegantForm && hasHarmonious) radiance = 'thousand-petal'
  else if (hasHighBeauty && hasNoBlemish) radiance = 'full-bloom'
  else if (hasHighBeauty) radiance = 'opening'
  else if (hasElegantForm && hasProperSymmetry) radiance = 'bud'
  else if (beauty > 30) radiance = 'wilted'

  return {
    beauty, radiance, hasHighBeauty, hasElegantForm, hasProperSymmetry,
    hasNoBlemish, hasGraceful, hasNoAwkwardness, hasRefined, hasNoRoughness,
    hasHarmonious, hasNoDissonance, blemishCount, roughnessCount,
  }
}

// ─── measureRoot ─────────────────────────────────────────

/** @example measureRoot(content) returns RootMeasure */
export function measureRoot(content: string): RootMeasure {
  let score = 0

  const hasSolidAnchoring = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const hasProperNourishment = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const rotCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoRot = rotCount === 0
  const hasExtensive = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const hasNoInstability = !NESTED_TERNARY_RE.test(content)
  const hasProperUptake = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoContamination = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasResilient = TRY_RE.test(content) && CATCH_RE.test(content)
  const erosionCount = (content.match(HACK_RE) || []).length + (content.match(DEPRECATED_RE) || []).length
  const hasNoErosion = erosionCount === 0

  if (content.length > 0) score += 5
  if (hasSolidAnchoring) score += 12
  if (hasProperNourishment) score += 10
  if (hasNoRot) score += 12
  if (hasExtensive) score += 10
  if (hasNoInstability) score += 10
  if (hasProperUptake) score += 10
  if (hasNoContamination) score += 10
  if (hasResilient) score += 11
  if (hasNoErosion) score += 10

  const depth = Math.min(100, Math.max(0, score))
  const hasHighDepth = depth >= 70

  let strength: RootMeasure['strength'] = 'uprooted'
  if (hasHighDepth && hasNoRot && hasSolidAnchoring && hasResilient) strength = 'deep-taproot'
  else if (hasHighDepth && hasNoRot) strength = 'strong-root'
  else if (hasHighDepth) strength = 'established'
  else if (hasSolidAnchoring && hasProperNourishment) strength = 'shallow-root'
  else if (depth > 30) strength = 'floating'

  return {
    depth, strength, hasHighDepth, hasSolidAnchoring, hasProperNourishment,
    hasNoRot, hasExtensive, hasNoInstability, hasProperUptake, hasNoContamination,
    hasResilient, hasNoErosion, rotCount, erosionCount,
  }
}

// ─── measureMud ──────────────────────────────────────────

/** @example measureMud(content) returns MudMeasure */
export function measureMud(content: string): MudMeasure {
  let score = 0

  const hasNoContaminants = (content.match(ANY_RE) || []).length === 0 && (content.match(EVAL_RE) || []).length === 0
  const contaminantCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasCleanPatterns = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoTechnicalDebt = (content.match(TODO_RE) || []).length === 0 && (content.match(FIXME_RE) || []).length === 0
  const hasPureLogic = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const hackeryCount = (content.match(HACK_RE) || []).length + (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoHackery = hackeryCount === 0
  const hasNoSideEffects = (content.match(CONSOLE_RE) || []).length === 0
  const hasNoLegacyCruft = (content.match(DEPRECATED_RE) || []).length === 0
  const hasPristine = !NESTED_TERNARY_RE.test(content)
  const hasNoBandAids = ASYNC_RE.test(content) && AWAIT_RE.test(content)

  if (content.length > 0) score += 5
  if (hasNoContaminants) score += 12
  if (hasCleanPatterns) score += 10
  if (hasNoTechnicalDebt) score += 12
  if (hasPureLogic) score += 10
  if (hasNoHackery) score += 10
  if (hasNoSideEffects) score += 10
  if (hasNoLegacyCruft) score += 10
  if (hasPristine) score += 11
  if (hasNoBandAids) score += 10

  const transcendence = Math.min(100, Math.max(0, score))
  const hasHighTranscendence = transcendence >= 70

  let purity: MudMeasure['purity'] = 'polluted'
  if (hasHighTranscendence && hasNoContaminants && hasCleanPatterns && hasPristine) purity = 'spotless'
  else if (hasHighTranscendence && hasNoContaminants) purity = 'clean'
  else if (hasHighTranscendence) purity = 'mostly-pure'
  else if (hasCleanPatterns && hasPureLogic) purity = 'some-residue'
  else if (transcendence > 30) purity = 'muddy'

  return {
    transcendence, purity, hasHighTranscendence, hasNoContaminants, hasCleanPatterns,
    hasNoTechnicalDebt, hasPureLogic, hasNoHackery, hasNoSideEffects, hasNoLegacyCruft,
    hasPristine, hasNoBandAids, contaminantCount, hackeryCount,
  }
}

// ─── measureGeometry ─────────────────────────────────────

/** @example measureGeometry(content) returns GeometryMeasure */
export function measureGeometry(content: string): GeometryMeasure {
  let score = 0

  const hasProperProportions = INTERFACE_RE.test(content) && EXPORT_RE.test(content)
  const hasBalanced = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const distortionCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDistortion = distortionCount === 0
  const hasMathematical = CLASS_RE.test(content) && TYPE_RE.test(content) && INTERFACE_RE.test(content)
  const hasNoAsymmetry = !NESTED_TERNARY_RE.test(content)
  const hasElegant = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoOvercomplication = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasProperRatios = TRY_RE.test(content) && CATCH_RE.test(content)
  const bloatCount = (content.match(CONSOLE_RE) || []).length + (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoBloat = bloatCount === 0

  if (content.length > 0) score += 5
  if (hasProperProportions) score += 12
  if (hasBalanced) score += 10
  if (hasNoDistortion) score += 12
  if (hasMathematical) score += 10
  if (hasNoAsymmetry) score += 10
  if (hasElegant) score += 10
  if (hasNoOvercomplication) score += 10
  if (hasProperRatios) score += 11
  if (hasNoBloat) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let pattern: GeometryMeasure['pattern'] = 'chaotic'
  if (hasHighQuality && hasNoDistortion && hasMathematical && hasElegant) pattern = 'golden-ratio'
  else if (hasHighQuality && hasNoDistortion) pattern = 'fibonacci-spiral'
  else if (hasHighQuality) pattern = 'sacred-pattern'
  else if (hasMathematical && hasBalanced) pattern = 'organized'
  else if (quality > 30) pattern = 'irregular'

  return {
    quality, pattern, hasHighQuality, hasProperProportions, hasBalanced,
    hasNoDistortion, hasMathematical, hasNoAsymmetry, hasElegant,
    hasNoOvercomplication, hasProperRatios, hasNoBloat, distortionCount, bloatCount,
  }
}

// ─── measureFragrance ────────────────────────────────────

/** @example measureFragrance(content) returns FragranceMeasure */
export function measureFragrance(content: string): FragranceMeasure {
  let score = 0

  const hasSweetDocumentation = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasProperAroma = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const staleCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoStaleDocs = staleCount === 0
  const hasInformative = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const misleadingCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoMisleading = misleadingCount === 0
  const hasCaptivating = CLASS_RE.test(content) && INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoMissing = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasProperExamples = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoOutdated = (content.match(DEPRECATED_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasSweetDocumentation) score += 12
  if (hasProperAroma) score += 10
  if (hasNoStaleDocs) score += 12
  if (hasInformative) score += 10
  if (hasNoMisleading) score += 10
  if (hasCaptivating) score += 10
  if (hasNoMissing) score += 10
  if (hasProperExamples) score += 11
  if (hasNoOutdated) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let aroma: FragranceMeasure['aroma'] = 'stale'
  if (hasHighQuality && hasNoMisleading && hasSweetDocumentation && hasCaptivating) aroma = 'intoxicating'
  else if (hasHighQuality && hasNoMisleading) aroma = 'fragrant'
  else if (hasHighQuality) aroma = 'pleasant'
  else if (hasProperAroma && hasInformative) aroma = 'faint'
  else if (quality > 30) aroma = 'odorless'

  return {
    quality, aroma, hasHighQuality, hasSweetDocumentation, hasProperAroma,
    hasNoStaleDocs, hasInformative, hasNoMisleading, hasCaptivating, hasNoMissing,
    hasProperExamples, hasNoOutdated, staleCount, misleadingCount,
  }
}

// ─── measureVitality ─────────────────────────────────────

/** @example measureVitality(content) returns VitalityMeasure */
export function measureVitality(content: string): VitalityMeasure {
  let score = 0

  const hasVitality = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const degenerationCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDegeneration = degenerationCount === 0
  const hasRenewable = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoStagnation = !NESTED_TERNARY_RE.test(content)
  const hasGrowthPotential = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const diseaseCount = (content.match(HACK_RE) || []).length + (content.match(DEPRECATED_RE) || []).length
  const hasNoDisease = diseaseCount === 0
  const hasAdaptive = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoFragility = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasThriving = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasVitality) score += 12
  if (hasNoDegeneration) score += 12
  if (hasRenewable) score += 10
  if (hasNoStagnation) score += 10
  if (hasGrowthPotential) score += 10
  if (hasNoDisease) score += 10
  if (hasAdaptive) score += 11
  if (hasNoFragility) score += 10
  if (hasThriving) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let health: VitalityMeasure['health'] = 'dead'
  if (hasHighLevel && hasNoDegeneration && hasVitality && hasThriving) health = 'eternal-bloom'
  else if (hasHighLevel && hasNoDegeneration) health = 'vibrant'
  else if (hasHighLevel) health = 'healthy'
  else if (hasVitality && hasGrowthPotential) health = 'fading'
  else if (level > 30) health = 'wilting'

  return {
    level, health, hasHighLevel, hasVitality, hasNoDegeneration, hasRenewable,
    hasNoStagnation, hasGrowthPotential, hasNoDisease, hasAdaptive, hasNoFragility,
    hasThriving, degenerationCount, diseaseCount,
  }
}

// ─── classifyCondition ───────────────────────────────────

/** @example classifyCondition(petal) returns condition */
export function classifyCondition(petal: LotusPetal): LotusPetal['condition'] {
  const { qualityScore } = petal
  if (qualityScore >= 80) return 'divine-lotus'
  if (qualityScore >= 65) return 'sacred-bloom'
  if (qualityScore >= 50) return 'garden-lotus'
  if (qualityScore >= 35) return 'pond-flower'
  if (qualityScore >= 20) return 'mud-sprout'
  return 'seed'
}

// ─── analyzeLotusPetal ───────────────────────────────────

/** @example analyzeLotusPetal(content, filePath) returns LotusPetal */
export function analyzeLotusPetal(content: string, filePath: string): LotusPetal {
  const petal = measurePetal(content)
  const root = measureRoot(content)
  const mud = measureMud(content)
  const geometry = measureGeometry(content)
  const fragrance = measureFragrance(content)
  const vitality = measureVitality(content)

  const petalBeauty = petal.beauty
  const rootDepth = root.depth
  const mudTranscendence = mud.transcendence
  const sacredGeometry = geometry.quality
  const fragranceQuality = fragrance.quality
  const bloomVitality = vitality.level

  const qualityScore = Math.round(
    petalBeauty * 0.15 +
    rootDepth * 0.15 +
    mudTranscendence * 0.15 +
    sacredGeometry * 0.2 +
    fragranceQuality * 0.15 +
    bloomVitality * 0.2,
  )

  const result: LotusPetal = {
    file: filePath,
    petalBeauty, rootDepth, mudTranscendence, sacredGeometry,
    fragranceQuality, bloomVitality,
    petal, root, mud, geometry, fragrance, vitality,
    qualityScore,
    condition: 'seed',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── classifyPondType ────────────────────────────────────

/** @example classifyPondType(petals) returns pond type */
export function classifyPondType(petals: LotusPetal[]): LotusPond['pondType'] {
  if (petals.length === 0) return 'dry-bed'
  const avgScore = petals.reduce((s, p) => s + p.qualityScore, 0) / petals.length
  const divineCnt = petals.filter((p) => p.condition === 'divine-lotus').length
  if (avgScore >= 75 && divineCnt >= Math.ceil(petals.length * 0.3)) return 'sacred-pond'
  if (avgScore >= 60) return 'temple-garden'
  if (avgScore >= 45) return 'meditation-pool'
  if (avgScore >= 30) return 'garden-pond'
  if (avgScore >= 15) return 'muddy-puddle'
  return 'dry-bed'
}

// ─── analyzeLotusPond ────────────────────────────────────

/** @example analyzeLotusPond(petals, dirPath) returns LotusPond */
export function analyzeLotusPond(petals: LotusPetal[], dirPath: string): LotusPond {
  if (petals.length === 0) {
    return {
      directory: dirPath, petals: [], avgBeauty: 0, avgPurity: 0, avgVitality: 0,
      divineCount: 0, seedCount: 0, pureCount: 0, vitalCount: 0,
      pondType: 'dry-bed', condition: 'barren',
    }
  }

  const avgBeauty = Math.round(petals.reduce((s, p) => s + p.petalBeauty, 0) / petals.length)
  const avgPurity = Math.round(petals.reduce((s, p) => s + p.mudTranscendence, 0) / petals.length)
  const avgVitality = Math.round(petals.reduce((s, p) => s + p.bloomVitality, 0) / petals.length)
  const divineCount = petals.filter((p) => p.condition === 'divine-lotus').length
  const seedCount = petals.filter((p) => p.condition === 'seed').length
  const pureCount = petals.filter((p) => p.mud.hasHighTranscendence).length
  const vitalCount = petals.filter((p) => p.vitality.hasHighLevel).length

  const pondType = classifyPondType(petals)
  const avgScore = petals.reduce((s, p) => s + p.qualityScore, 0) / petals.length
  let condition: LotusPond['condition'] = 'barren'
  if (avgScore >= 75) condition = 'divine-garden'
  else if (avgScore >= 60) condition = 'sacred-pond'
  else if (avgScore >= 45) condition = 'blooming-garden'
  else if (avgScore >= 30) condition = 'greenhouse'
  else if (avgScore >= 15) condition = 'dying-pond'

  return {
    directory: dirPath, petals, avgBeauty, avgPurity, avgVitality,
    divineCount, seedCount, pureCount, vitalCount, pondType, condition,
  }
}

// ─── classifyGardenerGrade ───────────────────────────────

/** @example classifyGardenerGrade(avgPurity) returns grade */
export function classifyGardenerGrade(avgPurity: number): LotusBloomResult['stats']['gardenerGrade'] {
  if (avgPurity >= 80) return 'enlightened-master'
  if (avgPurity >= 65) return 'zen-gardener'
  if (avgPurity >= 50) return 'lotus-tender'
  if (avgPurity >= 35) return 'gardener'
  if (avgPurity >= 20) return 'apprentice'
  return 'trampler'
}

// ─── generateRecommendations ─────────────────────────────

/** @example generateRecommendations(petals, ponds, garden, stats) returns string[] */
export function generateRecommendations(
  petals: LotusPetal[],
  ponds: LotusPond[],
  garden: LotusBloomResult['garden'],
  stats: LotusBloomResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgPetalBeauty < 50) recs.push('Enhance petal beauty — add interfaces, types, and elegant patterns for code aesthetics')
  if (stats.avgRootDepth < 50) recs.push('Deepen root foundations — add abstractions and reduce any/eval for code stability')
  if (stats.avgMudTranscendence < 50) recs.push('Improve mud transcendence — reduce contaminants and technical debt for code purity')
  if (stats.avgSacredGeometry < 50) recs.push('Refine sacred geometry — improve structure and reduce bloat for code elegance')
  if (stats.avgFragranceQuality < 50) recs.push('Sweeten fragrance quality — add documentation and reduce misleading patterns')
  if (stats.avgBloomVitality < 50) recs.push('Boost bloom vitality — add error handling and reduce degeneration for code health')
  if (stats.seedCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of petals are seeds — consider major code cultivation')
  if (stats.mudSproutCount > 0) recs.push('Warning: mud-sprout petals detected — these files need nurturing')
  if (garden.overallPurity < 40) recs.push('Overall purity is critically low — establish a zen gardening regimen')
  if (ponds.length > 0 && ponds.every((p) => p.condition === 'barren')) recs.push('All ponds are barren — your codebase needs fundamental lotus awakening')

  if (petals.length > 0) {
    const highBlemish = petals.filter((p) => p.petal.blemishCount > 2)
    if (highBlemish.length > petals.length * 0.5) recs.push('Over 50% of petals have high blemishes — reduce any/eval usage')
  }

  return recs
}

// ─── buildLotusBloomResult ───────────────────────────────

/** @example buildLotusBloomResult(files, contents, options) returns full result */
export function buildLotusBloomResult(files: string[], contents: string[], _options?: Record<string, unknown>): LotusBloomResult {
  const petals = files.map((file, i) => analyzeLotusPetal(contents[i] ?? '', file))

  const pondMap = new Map<string, LotusPetal[]>()
  petals.forEach((petal) => {
    const parts = petal.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = pondMap.get(dir)
    if (existing) existing.push(petal)
    else pondMap.set(dir, [petal])
  })

  const ponds = Array.from(pondMap.entries()).map(([dir, ps]) => analyzeLotusPond(ps, dir))

  const avgPetalBeauty = petals.length > 0 ? Math.round(petals.reduce((s, p) => s + p.petalBeauty, 0) / petals.length) : 0
  const avgRootDepth = petals.length > 0 ? Math.round(petals.reduce((s, p) => s + p.rootDepth, 0) / petals.length) : 0
  const avgMudTranscendence = petals.length > 0 ? Math.round(petals.reduce((s, p) => s + p.mudTranscendence, 0) / petals.length) : 0
  const avgSacredGeometry = petals.length > 0 ? Math.round(petals.reduce((s, p) => s + p.sacredGeometry, 0) / petals.length) : 0
  const avgFragranceQuality = petals.length > 0 ? Math.round(petals.reduce((s, p) => s + p.fragranceQuality, 0) / petals.length) : 0
  const avgBloomVitality = petals.length > 0 ? Math.round(petals.reduce((s, p) => s + p.bloomVitality, 0) / petals.length) : 0

  const overallPurity = Math.round(
    avgPetalBeauty * 0.15 +
    avgRootDepth * 0.15 +
    avgMudTranscendence * 0.15 +
    avgSacredGeometry * 0.2 +
    avgFragranceQuality * 0.15 +
    avgBloomVitality * 0.2,
  )

  const garden = {
    avgBeauty: avgPetalBeauty,
    avgPurity: avgMudTranscendence,
    avgVitality: avgBloomVitality,
    isPristine: overallPurity >= 60,
    overallPurity,
  }

  const stats = {
    totalFiles: files.length,
    totalPonds: ponds.length,
    avgPetalBeauty,
    avgRootDepth,
    avgMudTranscendence,
    avgSacredGeometry,
    avgFragranceQuality,
    avgBloomVitality,
    divineLotusCount: petals.filter((p) => p.condition === 'divine-lotus').length,
    sacredBloomCount: petals.filter((p) => p.condition === 'sacred-bloom').length,
    gardenLotusCount: petals.filter((p) => p.condition === 'garden-lotus').length,
    pondFlowerCount: petals.filter((p) => p.condition === 'pond-flower').length,
    mudSproutCount: petals.filter((p) => p.condition === 'mud-sprout').length,
    seedCount: petals.filter((p) => p.condition === 'seed').length,
    hasHighBeautyCount: petals.filter((p) => p.petal.hasHighBeauty).length,
    hasHighDepthCount: petals.filter((p) => p.root.hasHighDepth).length,
    hasHighTranscendenceCount: petals.filter((p) => p.mud.hasHighTranscendence).length,
    hasHighQualityCount: petals.filter((p) => p.geometry.hasHighQuality).length,
    hasHighFragranceCount: petals.filter((p) => p.fragrance.hasHighQuality).length,
    hasHighLevelCount: petals.filter((p) => p.vitality.hasHighLevel).length,
    overallPurity,
    gardenerGrade: classifyGardenerGrade(overallPurity),
    bestPetal: '',
    mostBeautiful: '',
    deepestRoots: '',
    purest: '',
    bestStructured: '',
    bestDocumented: '',
  }

  if (petals.length > 0) {
    stats.bestPetal = petals.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.mostBeautiful = petals.reduce((a, b) => a.petalBeauty >= b.petalBeauty ? a : b).file
    stats.deepestRoots = petals.reduce((a, b) => a.rootDepth >= b.rootDepth ? a : b).file
    stats.purest = petals.reduce((a, b) => a.mudTranscendence >= b.mudTranscendence ? a : b).file
    stats.bestStructured = petals.reduce((a, b) => a.sacredGeometry >= b.sacredGeometry ? a : b).file
    stats.bestDocumented = petals.reduce((a, b) => a.fragranceQuality >= b.fragranceQuality ? a : b).file
  }

  const recommendations = generateRecommendations(petals, ponds, garden, stats)

  return { petals, ponds, garden, stats, recommendations }
}
