// ─── Interfaces ──────────────────────────────────────────────

export interface EmberMeasure {
  potential: number
  heat: 'white-hot' | 'red-hot' | 'glowing' | 'warm' | 'cooling' | 'cold'
  hasHighPotential: boolean
  hasViableCore: boolean
  hasProperKindling: boolean
  hasNoBurnout: boolean
  hasSmoldering: boolean
  hasNoAshes: boolean
  hasIgnitionPoint: boolean
  hasNoExtinguished: boolean
  hasThermalMass: boolean
  hasNoEvaporated: boolean
  burnoutCount: number
  extinguishedCount: number
}

export interface AshMeasure {
  richness: number
  composition: 'phoenix-ash' | 'fertile-ash' | 'mineral-ash' | 'carbon-ash' | 'dust' | 'void'
  hasHighRichness: boolean
  hasNutrients: boolean
  hasProperDeposit: boolean
  hasNoContamination: boolean
  hasTrace: boolean
  hasNoToxicity: boolean
  hasConcentrated: boolean
  hasNoErosion: boolean
  hasHistorical: boolean
  hasNoWaste: boolean
  contaminationCount: number
  toxicityCount: number
}

export interface RebirthMeasure {
  capability: number
  stage: 'rising-phoenix' | 'reforming' | 'nests-building' | 'gathering' | 'scattered' | 'impossible'
  hasHighCapability: boolean
  hasBlueprint: boolean
  hasProperFramework: boolean
  hasNoCollapse: boolean
  hasRegeneration: boolean
  hasNoDisintegration: boolean
  hasCatalyst: boolean
  hasNoEntropy: boolean
  hasReconstruction: boolean
  hasNoLoss: boolean
  collapseCount: number
  disintegrationCount: number
}

export interface FlameMeasure {
  memory: number
  clarity: 'brilliant-flame' | 'steady-fire' | 'flickering' | 'ember-glow' | 'smoke-signal' | 'darkness'
  hasHighMemory: boolean
  hasDocumentation: boolean
  hasProperArchive: boolean
  hasNoLostKnowledge: boolean
  hasTransferable: boolean
  hasNoDegradation: boolean
  hasOralTradition: boolean
  hasNoCorruption: boolean
  hasLivingMemory: boolean
  hasNoAmnesia: boolean
  lostKnowledgeCount: number
  amnesiaCount: number
}

export interface ImmortalMeasure {
  patterns: number
  quality: 'eternal-flame' | 'immortal' | 'ageless' | 'enduring' | 'mortal' | 'ephemeral'
  hasHighPatterns: boolean
  hasClassicPatterns: boolean
  hasProvenPrinciples: boolean
  hasNoFad: boolean
  hasFoundational: boolean
  hasNoObsolescence: boolean
  hasUniversal: boolean
  hasNoFragility: boolean
  hasTimeless: boolean
  hasNoDecay: boolean
  fadCount: number
  obsolescenceCount: number
}

export interface RisingMeasure {
  quality: number
  trajectory: 'soaring' | 'ascending' | 'lifting' | 'grounded' | 'falling' | 'crashed'
  hasHighQuality: boolean
  hasMomentum: boolean
  hasProperTrajectory: boolean
  hasNoRegression: boolean
  hasGrowth: boolean
  hasNoStagnation: boolean
  hasEvolution: boolean
  hasNoDevolution: boolean
  hasRenewal: boolean
  hasNoDeath: boolean
  regressionCount: number
  devolutionCount: number
}

export interface EmberFragment {
  file: string
  emberPotential: number
  ashRichness: number
  rebirthCapability: number
  flameMemory: number
  immortalPatterns: number
  risingQuality: number
  ember: EmberMeasure
  ash: AshMeasure
  rebirth: RebirthMeasure
  flame: FlameMeasure
  immortal: ImmortalMeasure
  rising: RisingMeasure
  condition: 'phoenix-rising' | 'ember-gathering' | 'ash-nesting' | 'scattered-embers' | 'cold-ash' | 'void'
  qualityScore: number
}

export interface AshCircle {
  directory: string
  fragments: EmberFragment[]
  avgEmber: number
  avgRebirth: number
  avgRising: number
  phoenixCount: number
  voidCount: number
  hotCount: number
  capableCount: number
  circleType: 'phoenix-nest' | 'fire-temple' | 'hearth-circle' | 'ash-pile' | 'scattered-dust' | 'void'
  condition: 'reborn-glory' | 'renewing' | 'gathering' | 'smoldering' | 'cold' | 'extinguished'
}

export interface PhoenixAshResult {
  fragments: EmberFragment[]
  circles: AshCircle[]
  flame: {
    avgEmber: number
    avgRebirth: number
    avgRising: number
    isRising: boolean
    overallRenewal: number
  }
  stats: {
    totalFiles: number
    totalCircles: number
    avgEmberPotential: number
    avgAshRichness: number
    avgRebirthCapability: number
    avgFlameMemory: number
    avgImmortalPatterns: number
    avgRisingQuality: number
    phoenixRisingCount: number
    emberGatheringCount: number
    ashNestingCount: number
    scatteredEmbersCount: number
    coldAshCount: number
    voidCount: number
    hasHighPotentialCount: number
    hasHighRichnessCount: number
    hasHighCapabilityCount: number
    hasHighMemoryCount: number
    hasHighPatternsCount: number
    hasHighQualityCount: number
    overallRenewal: number
    guardianGrade: 'phoenix-lord' | 'fire-guardian' | 'ash-keeper' | 'ember-tender' | 'smoke-watcher' | 'ice-walker'
    bestFragment: string
    bestPotential: string
    richestAsh: string
    bestRebirth: string
    bestMemory: string
    mostImmortal: string
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
const EMPTY_CATCH_RE = /catch\s*\(\w*\)\s*\{\s*\}/g
const DOC_COMMENT_RE = /\/\*\*[\s\S]*?\*\//g

// ─── measureEmber ────────────────────────────────────────────

/** @example measureEmber(content) returns EmberMeasure */
export function measureEmber(content: string): EmberMeasure {
  let score = 0

  const hasViableCore = INTERFACE_RE.test(content) || CLASS_RE.test(content) || TYPE_RE.test(content)
  const hasProperKindling = TRY_RE.test(content) && CATCH_RE.test(content)
  const burnoutCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoBurnout = burnoutCount === 0
  const hasSmoldering = content.length > 0 && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const hasNoAshes = content.length > 0 && (EXPORT_RE.test(content) || RETURN_RE.test(content))
  const hasIgnitionPoint = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const extinguishedCount = (content.match(CONSOLE_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoExtinguished = extinguishedCount === 0
  const hasThermalMass = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const hasNoEvaporated = !NESTED_TERNARY_RE.test(content)

  if (content.length > 0) score += 5
  if (hasViableCore) score += 12
  if (hasProperKindling) score += 10
  if (hasNoBurnout) score += 12
  if (hasSmoldering) score += 10
  if (hasNoAshes) score += 10
  if (hasIgnitionPoint) score += 10
  if (hasNoExtinguished) score += 10
  if (hasThermalMass) score += 11
  if (hasNoEvaporated) score += 10

  const potential = Math.min(100, Math.max(0, score))
  const hasHighPotential = potential >= 70

  let heat: EmberMeasure['heat'] = 'cold'
  if (hasHighPotential && hasNoBurnout && hasNoExtinguished && hasViableCore) heat = 'white-hot'
  else if (hasHighPotential && hasNoBurnout) heat = 'red-hot'
  else if (hasHighPotential) heat = 'glowing'
  else if (hasViableCore && hasProperKindling) heat = 'warm'
  else if (potential > 30) heat = 'cooling'

  return {
    potential, heat, hasHighPotential, hasViableCore, hasProperKindling,
    hasNoBurnout, hasSmoldering, hasNoAshes, hasIgnitionPoint,
    hasNoExtinguished, hasThermalMass, hasNoEvaporated, burnoutCount, extinguishedCount,
  }
}

// ─── measureAsh ──────────────────────────────────────────────

/** @example measureAsh(content) returns AshMeasure */
export function measureAsh(content: string): AshMeasure {
  let score = 0

  const hasNutrients = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasProperDeposit = CLASS_RE.test(content) && (INTERFACE_RE.test(content) || TYPE_RE.test(content))
  const contaminationCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoContamination = contaminationCount === 0
  const hasTrace = (content.match(DOC_COMMENT_RE) || []).length > 0
  const toxicityCount = (content.match(HACK_RE) || []).length + (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoToxicity = toxicityCount === 0
  const hasConcentrated = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasNoErosion = (content.match(DEPRECATED_RE) || []).length === 0
  const hasHistorical = content.length > 0 && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const hasNoWaste = (content.match(CONSOLE_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasNutrients) score += 12
  if (hasProperDeposit) score += 12
  if (hasNoContamination) score += 10
  if (hasTrace) score += 10
  if (hasNoToxicity) score += 10
  if (hasConcentrated) score += 10
  if (hasNoErosion) score += 10
  if (hasHistorical) score += 11
  if (hasNoWaste) score += 10

  const richness = Math.min(100, Math.max(0, score))
  const hasHighRichness = richness >= 70

  let composition: AshMeasure['composition'] = 'void'
  if (hasHighRichness && hasNoContamination && hasNoToxicity && hasNutrients) composition = 'phoenix-ash'
  else if (hasHighRichness && hasNoContamination) composition = 'fertile-ash'
  else if (hasHighRichness) composition = 'mineral-ash'
  else if (hasProperDeposit && hasTrace) composition = 'carbon-ash'
  else if (richness > 30) composition = 'dust'

  return {
    richness, composition, hasHighRichness, hasNutrients, hasProperDeposit,
    hasNoContamination, hasTrace, hasNoToxicity, hasConcentrated,
    hasNoErosion, hasHistorical, hasNoWaste, contaminationCount, toxicityCount,
  }
}

// ─── measureRebirth ──────────────────────────────────────────

/** @example measureRebirth(content) returns RebirthMeasure */
export function measureRebirth(content: string): RebirthMeasure {
  let score = 0

  const hasBlueprint = INTERFACE_RE.test(content) || TYPE_RE.test(content)
  const hasProperFramework = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const collapseCount = (content.match(NESTED_TERNARY_RE) || []).length
  const hasNoCollapse = collapseCount === 0
  const hasRegeneration = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const disintegrationCount = linesOverThreshold(content, 3)
  const hasNoDisintegration = disintegrationCount === 0
  const hasCatalyst = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoEntropy = (content.match(ANY_RE) || []).length === 0
  const hasReconstruction = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const hasNoLoss = (content.match(EVAL_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasBlueprint) score += 12
  if (hasProperFramework) score += 12
  if (hasNoCollapse) score += 10
  if (hasRegeneration) score += 10
  if (hasNoDisintegration) score += 10
  if (hasCatalyst) score += 10
  if (hasNoEntropy) score += 10
  if (hasReconstruction) score += 11
  if (hasNoLoss) score += 10

  const capability = Math.min(100, Math.max(0, score))
  const hasHighCapability = capability >= 70

  let stage: RebirthMeasure['stage'] = 'impossible'
  if (hasHighCapability && hasNoCollapse && hasNoDisintegration && hasRegeneration) stage = 'rising-phoenix'
  else if (hasHighCapability && hasNoCollapse) stage = 'reforming'
  else if (hasHighCapability) stage = 'nests-building'
  else if (hasBlueprint && hasCatalyst) stage = 'gathering'
  else if (capability > 30) stage = 'scattered'

  return {
    capability, stage, hasHighCapability, hasBlueprint, hasProperFramework,
    hasNoCollapse, hasRegeneration, hasNoDisintegration, hasCatalyst,
    hasNoEntropy, hasReconstruction, hasNoLoss, collapseCount, disintegrationCount,
  }
}

// ─── measureFlame ────────────────────────────────────────────

/** @example measureFlame(content) returns FlameMeasure */
export function measureFlame(content: string): FlameMeasure {
  let score = 0

  const hasDocumentation = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasProperArchive = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const lostKnowledgeCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoLostKnowledge = lostKnowledgeCount === 0
  const hasTransferable = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoDegradation = (content.match(DEPRECATED_RE) || []).length === 0
  const hasOralTradition = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoCorruption = (content.match(EVAL_RE) || []).length === 0
  const hasLivingMemory = TRY_RE.test(content) && CATCH_RE.test(content)
  const amnesiaCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoAmnesia = amnesiaCount === 0

  if (content.length > 0) score += 5
  if (hasDocumentation) score += 12
  if (hasProperArchive) score += 10
  if (hasNoLostKnowledge) score += 12
  if (hasTransferable) score += 10
  if (hasNoDegradation) score += 10
  if (hasOralTradition) score += 10
  if (hasNoCorruption) score += 10
  if (hasLivingMemory) score += 11
  if (hasNoAmnesia) score += 10

  const memory = Math.min(100, Math.max(0, score))
  const hasHighMemory = memory >= 70

  let clarity: FlameMeasure['clarity'] = 'darkness'
  if (hasHighMemory && hasNoLostKnowledge && hasDocumentation && hasTransferable) clarity = 'brilliant-flame'
  else if (hasHighMemory && hasNoLostKnowledge) clarity = 'steady-fire'
  else if (hasHighMemory) clarity = 'flickering'
  else if (hasDocumentation && hasLivingMemory) clarity = 'ember-glow'
  else if (memory > 30) clarity = 'smoke-signal'

  return {
    memory, clarity, hasHighMemory, hasDocumentation, hasProperArchive,
    hasNoLostKnowledge, hasTransferable, hasNoDegradation, hasOralTradition,
    hasNoCorruption, hasLivingMemory, hasNoAmnesia, lostKnowledgeCount, amnesiaCount,
  }
}

// ─── measureImmortal ─────────────────────────────────────────

/** @example measureImmortal(content) returns ImmortalMeasure */
export function measureImmortal(content: string): ImmortalMeasure {
  let score = 0

  const hasClassicPatterns = INTERFACE_RE.test(content) && TYPE_RE.test(content) && CLASS_RE.test(content)
  const hasProvenPrinciples = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const fadCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoFad = fadCount === 0
  const hasFoundational = INTERFACE_RE.test(content) || TYPE_RE.test(content) || CLASS_RE.test(content)
  const obsolescenceCount = (content.match(DEPRECATED_RE) || []).length + (content.match(HACK_RE) || []).length
  const hasNoObsolescence = obsolescenceCount === 0
  const hasUniversal = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoFragility = !NESTED_TERNARY_RE.test(content)
  const hasTimeless = (content.match(DOC_COMMENT_RE) || []).length > 0 && GENERIC_RE.test(content)
  const hasNoDecay = (content.match(FIXME_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasClassicPatterns) score += 12
  if (hasProvenPrinciples) score += 12
  if (hasNoFad) score += 10
  if (hasFoundational) score += 10
  if (hasNoObsolescence) score += 10
  if (hasUniversal) score += 10
  if (hasNoFragility) score += 10
  if (hasTimeless) score += 11
  if (hasNoDecay) score += 10

  const patterns = Math.min(100, Math.max(0, score))
  const hasHighPatterns = patterns >= 70

  let quality: ImmortalMeasure['quality'] = 'ephemeral'
  if (hasHighPatterns && hasNoFad && hasNoObsolescence && hasClassicPatterns) quality = 'eternal-flame'
  else if (hasHighPatterns && hasNoFad) quality = 'immortal'
  else if (hasHighPatterns) quality = 'ageless'
  else if (hasFoundational && hasProvenPrinciples) quality = 'enduring'
  else if (patterns > 30) quality = 'mortal'

  return {
    patterns, quality, hasHighPatterns, hasClassicPatterns, hasProvenPrinciples,
    hasNoFad, hasFoundational, hasNoObsolescence, hasUniversal,
    hasNoFragility, hasTimeless, hasNoDecay, fadCount, obsolescenceCount,
  }
}

// ─── measureRising ───────────────────────────────────────────

/** @example measureRising(content) returns RisingMeasure */
export function measureRising(content: string): RisingMeasure {
  let score = 0

  const hasMomentum = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasProperTrajectory = INTERFACE_RE.test(content) || TYPE_RE.test(content) || CLASS_RE.test(content)
  const regressionCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoRegression = regressionCount === 0
  const hasGrowth = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoStagnation = content.length > 0 && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const hasEvolution = TRY_RE.test(content) && CATCH_RE.test(content)
  const devolutionCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDevolution = devolutionCount === 0
  const hasRenewal = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoDeath = !NESTED_TERNARY_RE.test(content)

  if (content.length > 0) score += 5
  if (hasMomentum) score += 12
  if (hasProperTrajectory) score += 12
  if (hasNoRegression) score += 10
  if (hasGrowth) score += 10
  if (hasNoStagnation) score += 10
  if (hasEvolution) score += 10
  if (hasNoDevolution) score += 10
  if (hasRenewal) score += 11
  if (hasNoDeath) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let trajectory: RisingMeasure['trajectory'] = 'crashed'
  if (hasHighQuality && hasNoRegression && hasNoDevolution && hasGrowth) trajectory = 'soaring'
  else if (hasHighQuality && hasNoRegression) trajectory = 'ascending'
  else if (hasHighQuality) trajectory = 'lifting'
  else if (hasProperTrajectory && hasEvolution) trajectory = 'grounded'
  else if (quality > 30) trajectory = 'falling'

  return {
    quality, trajectory, hasHighQuality, hasMomentum, hasProperTrajectory,
    hasNoRegression, hasGrowth, hasNoStagnation, hasEvolution,
    hasNoDevolution, hasRenewal, hasNoDeath, regressionCount, devolutionCount,
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function linesOverThreshold(content: string, minDuplicateLen: number): number {
  const lines = content.split('\n').map((l) => l.trim()).filter((l) => l.length > minDuplicateLen)
  const seen = new Map<string, number>()
  for (const line of lines) {
    seen.set(line, (seen.get(line) ?? 0) + 1)
  }
  let count = 0
  for (const v of seen.values()) {
    if (v > 1) count += v - 1
  }
  return count
}

// ─── classifyCondition ───────────────────────────────────────

/** @example classifyCondition(fragment) returns condition */
export function classifyCondition(fragment: EmberFragment): EmberFragment['condition'] {
  const { qualityScore } = fragment
  if (qualityScore >= 80) return 'phoenix-rising'
  if (qualityScore >= 65) return 'ember-gathering'
  if (qualityScore >= 50) return 'ash-nesting'
  if (qualityScore >= 35) return 'scattered-embers'
  if (qualityScore >= 20) return 'cold-ash'
  return 'void'
}

// ─── analyzeEmberFragment ────────────────────────────────────

/** @example analyzeEmberFragment(content, filePath) returns full fragment */
export function analyzeEmberFragment(content: string, filePath: string): EmberFragment {
  const ember = measureEmber(content)
  const ash = measureAsh(content)
  const rebirth = measureRebirth(content)
  const flame = measureFlame(content)
  const immortal = measureImmortal(content)
  const rising = measureRising(content)

  const emberPotential = ember.potential
  const ashRichness = ash.richness
  const rebirthCapability = rebirth.capability
  const flameMemory = flame.memory
  const immortalPatterns = immortal.patterns
  const risingQuality = rising.quality

  const qualityScore = Math.round(
    emberPotential * 0.15 +
    ashRichness * 0.15 +
    rebirthCapability * 0.2 +
    flameMemory * 0.2 +
    immortalPatterns * 0.15 +
    risingQuality * 0.15,
  )

  const result: EmberFragment = {
    file: filePath,
    emberPotential, ashRichness, rebirthCapability,
    flameMemory, immortalPatterns, risingQuality,
    ember, ash, rebirth, flame, immortal, rising,
    qualityScore,
    condition: 'void',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── Ash Circle Analysis ─────────────────────────────────────

/** @example analyzeAshCircle(fragments, dirPath) returns AshCircle */
export function analyzeAshCircle(fragments: EmberFragment[], dirPath: string): AshCircle {
  if (fragments.length === 0) {
    return {
      directory: dirPath, fragments: [], avgEmber: 0, avgRebirth: 0, avgRising: 0,
      phoenixCount: 0, voidCount: 0, hotCount: 0, capableCount: 0,
      circleType: 'void', condition: 'extinguished',
    }
  }

  const avgEmber = Math.round(fragments.reduce((s, f) => s + f.emberPotential, 0) / fragments.length)
  const avgRebirth = Math.round(fragments.reduce((s, f) => s + f.rebirthCapability, 0) / fragments.length)
  const avgRising = Math.round(fragments.reduce((s, f) => s + f.risingQuality, 0) / fragments.length)
  const phoenixCount = fragments.filter((f) => f.condition === 'phoenix-rising').length
  const voidCount = fragments.filter((f) => f.condition === 'void').length
  const hotCount = fragments.filter((f) => f.ember.hasHighPotential).length
  const capableCount = fragments.filter((f) => f.rebirth.hasHighCapability).length

  const circleType = classifyCircleType(fragments)
  const avgScore = fragments.reduce((s, f) => s + f.qualityScore, 0) / fragments.length
  let condition: AshCircle['condition'] = 'extinguished'
  if (avgScore >= 75) condition = 'reborn-glory'
  else if (avgScore >= 60) condition = 'renewing'
  else if (avgScore >= 45) condition = 'gathering'
  else if (avgScore >= 30) condition = 'smoldering'
  else if (avgScore >= 15) condition = 'cold'

  return {
    directory: dirPath, fragments, avgEmber, avgRebirth, avgRising,
    phoenixCount, voidCount, hotCount, capableCount, circleType, condition,
  }
}

// ─── classifyCircleType ──────────────────────────────────────

/** @example classifyCircleType(fragments) returns circle type */
export function classifyCircleType(fragments: EmberFragment[]): AshCircle['circleType'] {
  if (fragments.length === 0) return 'void'
  const avgScore = fragments.reduce((s, f) => s + f.qualityScore, 0) / fragments.length
  const phoenixCnt = fragments.filter((f) => f.condition === 'phoenix-rising').length
  if (avgScore >= 75 && phoenixCnt >= Math.ceil(fragments.length * 0.3)) return 'phoenix-nest'
  if (avgScore >= 60) return 'fire-temple'
  if (avgScore >= 45) return 'hearth-circle'
  if (avgScore >= 30) return 'ash-pile'
  if (avgScore >= 15) return 'scattered-dust'
  return 'void'
}

// ─── classifyGuardianGrade ───────────────────────────────────

/** @example classifyGuardianGrade(avgRenewal) returns grade */
export function classifyGuardianGrade(avgRenewal: number): PhoenixAshResult['stats']['guardianGrade'] {
  if (avgRenewal >= 80) return 'phoenix-lord'
  if (avgRenewal >= 65) return 'fire-guardian'
  if (avgRenewal >= 50) return 'ash-keeper'
  if (avgRenewal >= 35) return 'ember-tender'
  if (avgRenewal >= 20) return 'smoke-watcher'
  return 'ice-walker'
}

// ─── generateRecommendations ─────────────────────────────────

/** @example generateRecommendations(fragments, circles, flame, stats) returns string[] */
export function generateRecommendations(
  fragments: EmberFragment[],
  circles: AshCircle[],
  flame: PhoenixAshResult['flame'],
  stats: PhoenixAshResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgEmberPotential < 50) recs.push('Ignite ember potential — add structured types and error handling')
  if (stats.avgAshRichness < 50) recs.push('Enrich ash content — extract reusable interfaces and type definitions')
  if (stats.avgRebirthCapability < 50) recs.push('Enhance rebirth capability — reduce code duplication and add async patterns')
  if (stats.avgFlameMemory < 50) recs.push('Preserve flame memory — add documentation and remove TODOs/FIXMEs')
  if (stats.avgImmortalPatterns < 50) recs.push('Strengthen immortal patterns — remove eval/any and adopt timeless patterns')
  if (stats.avgRisingQuality < 50) recs.push('Boost rising quality — add exports, imports, and proper code trajectory')
  if (stats.voidCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of fragments are void — consider major refactoring')
  if (stats.coldAshCount > 0) recs.push('Warning: cold ash detected — these files need immediate renewal')
  if (flame.overallRenewal < 40) recs.push('Overall renewal is critical — establish a code rebirth plan')
  if (circles.length > 0 && circles.every((c) => c.condition === 'extinguished')) recs.push('All circles are extinguished — your codebase needs fundamental renewal')

  if (fragments.length > 0) {
    const burnedOut = fragments.filter((f) => f.ember.burnoutCount > 2)
    if (burnedOut.length > fragments.length * 0.5) recs.push('Over 50% of fragments are burned out — reduce TODOs and FIXMEs')
  }

  return recs
}

// ─── buildPhoenixAshResult ───────────────────────────────────

/** @example buildPhoenixAshResult(files, contents) returns full result */
export function buildPhoenixAshResult(files: string[], contents: string[]): PhoenixAshResult {
  const fragments = files.map((file, i) => analyzeEmberFragment(contents[i] ?? '', file))

  const circleMap = new Map<string, EmberFragment[]>()
  fragments.forEach((fragment) => {
    const parts = fragment.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = circleMap.get(dir)
    if (existing) existing.push(fragment)
    else circleMap.set(dir, [fragment])
  })

  const circles = Array.from(circleMap.entries()).map(([dir, fs]) => analyzeAshCircle(fs, dir))

  const avgEmberPotential = fragments.length > 0 ? Math.round(fragments.reduce((s, f) => s + f.emberPotential, 0) / fragments.length) : 0
  const avgAshRichness = fragments.length > 0 ? Math.round(fragments.reduce((s, f) => s + f.ashRichness, 0) / fragments.length) : 0
  const avgRebirthCapability = fragments.length > 0 ? Math.round(fragments.reduce((s, f) => s + f.rebirthCapability, 0) / fragments.length) : 0
  const avgFlameMemory = fragments.length > 0 ? Math.round(fragments.reduce((s, f) => s + f.flameMemory, 0) / fragments.length) : 0
  const avgImmortalPatterns = fragments.length > 0 ? Math.round(fragments.reduce((s, f) => s + f.immortalPatterns, 0) / fragments.length) : 0
  const avgRisingQuality = fragments.length > 0 ? Math.round(fragments.reduce((s, f) => s + f.risingQuality, 0) / fragments.length) : 0

  const overallRenewal = Math.round(
    avgEmberPotential * 0.15 +
    avgAshRichness * 0.15 +
    avgRebirthCapability * 0.2 +
    avgFlameMemory * 0.2 +
    avgImmortalPatterns * 0.15 +
    avgRisingQuality * 0.15,
  )

  const flame = {
    avgEmber: avgEmberPotential,
    avgRebirth: avgRebirthCapability,
    avgRising: avgRisingQuality,
    isRising: overallRenewal >= 60,
    overallRenewal,
  }

  const stats = {
    totalFiles: files.length,
    totalCircles: circles.length,
    avgEmberPotential,
    avgAshRichness,
    avgRebirthCapability,
    avgFlameMemory,
    avgImmortalPatterns,
    avgRisingQuality,
    phoenixRisingCount: fragments.filter((f) => f.condition === 'phoenix-rising').length,
    emberGatheringCount: fragments.filter((f) => f.condition === 'ember-gathering').length,
    ashNestingCount: fragments.filter((f) => f.condition === 'ash-nesting').length,
    scatteredEmbersCount: fragments.filter((f) => f.condition === 'scattered-embers').length,
    coldAshCount: fragments.filter((f) => f.condition === 'cold-ash').length,
    voidCount: fragments.filter((f) => f.condition === 'void').length,
    hasHighPotentialCount: fragments.filter((f) => f.ember.hasHighPotential).length,
    hasHighRichnessCount: fragments.filter((f) => f.ash.hasHighRichness).length,
    hasHighCapabilityCount: fragments.filter((f) => f.rebirth.hasHighCapability).length,
    hasHighMemoryCount: fragments.filter((f) => f.flame.hasHighMemory).length,
    hasHighPatternsCount: fragments.filter((f) => f.immortal.hasHighPatterns).length,
    hasHighQualityCount: fragments.filter((f) => f.rising.hasHighQuality).length,
    overallRenewal,
    guardianGrade: classifyGuardianGrade(overallRenewal),
    bestFragment: '',
    bestPotential: '',
    richestAsh: '',
    bestRebirth: '',
    bestMemory: '',
    mostImmortal: '',
  }

  if (fragments.length > 0) {
    stats.bestFragment = fragments.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.bestPotential = fragments.reduce((a, b) => a.emberPotential >= b.emberPotential ? a : b).file
    stats.richestAsh = fragments.reduce((a, b) => a.ashRichness >= b.ashRichness ? a : b).file
    stats.bestRebirth = fragments.reduce((a, b) => a.rebirthCapability >= b.rebirthCapability ? a : b).file
    stats.bestMemory = fragments.reduce((a, b) => a.flameMemory >= b.flameMemory ? a : b).file
    stats.mostImmortal = fragments.reduce((a, b) => a.immortalPatterns >= b.immortalPatterns ? a : b).file
  }

  const recommendations = generateRecommendations(fragments, circles, flame, stats)

  return { fragments, circles, flame, stats, recommendations }
}
