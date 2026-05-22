// ─── Interfaces ──────────────────────────────────────────────

export interface ReflectionMeasure {
  quality: number
  clarity: 'perfect-mirror' | 'clear' | 'slight-haze' | 'clouded' | 'cracked' | 'shattered'
  hasHighQuality: boolean
  hasSelfAware: boolean
  hasClearIdentity: boolean
  hasNoDistortion: boolean
  hasProperNaming: boolean
  hasNoAlias: boolean
  hasHonestAPI: boolean
  hasNoDisguise: boolean
  hasTransparent: boolean
  hasNoIllusion: boolean
  distortionCount: number
  illusionCount: number
}

export interface TruthMeasure {
  revelation: number
  level: 'absolute-truth' | 'honest' | 'mostly-true' | 'half-truth' | 'deceptive' | 'illusion'
  hasHighTruth: boolean
  hasNoHiddenAgenda: boolean
  hasExplicitBehavior: boolean
  hasNoSideEffects: boolean
  hasPromisesKept: boolean
  hasNoLies: boolean
  hasConsistentState: boolean
  hasNoDeception: boolean
  hasFactual: boolean
  hasNoMisdirection: boolean
  hiddenAgendaCount: number
  lieCount: number
}

export interface ShadowMeasure {
  integration: number
  depth: 'shadow-master' | 'comfortable' | 'aware' | 'nervous' | 'fearful' | 'overwhelmed'
  hasHighIntegration: boolean
  hasAcknowledged: boolean
  hasProperBoundaries: boolean
  hasNoDenial: boolean
  hasGracefulHandling: boolean
  hasNoRepression: boolean
  hasIntegration: boolean
  hasNoProjection: boolean
  hasManaged: boolean
  hasNoCollapse: boolean
  denialCount: number
  repressionCount: number
}

export interface SurfaceMeasure {
  smoothness: number
  polish: 'museum-quality' | 'well-polished' | 'smooth' | 'rough' | 'jagged' | 'raw-stone'
  hasHighSmoothness: boolean
  hasCleanFormatting: boolean
  hasConsistentStyle: boolean
  hasNoBlemishes: boolean
  hasProperFlow: boolean
  hasNoScratches: boolean
  hasEvenTone: boolean
  hasNoInterruption: boolean
  hasReadable: boolean
  hasNoObfuscation: boolean
  blemishCount: number
  scratchCount: number
}

export interface PropheticMeasure {
  insight: number
  vision: 'oracle' | 'seer' | 'clairvoyant' | 'short-sighted' | 'blind' | 'catastrophic'
  hasHighInsight: boolean
  hasForesight: boolean
  hasFutureProof: boolean
  hasNoTechnicalDebt: boolean
  hasAdaptiveDesign: boolean
  hasNoRigidity: boolean
  hasExtensible: boolean
  hasNoDeadEnd: boolean
  hasSustainable: boolean
  hasNoFragility: boolean
  techDebtCount: number
  deadEndCount: number
}

export interface VolcanicMeasure {
  origin: number
  strength: 'diamond-hard' | 'obsidian-strong' | 'basalt-firm' | 'pumice-light' | 'ash-weak' | 'dust'
  hasHighOrigin: boolean
  hasSolidFoundation: boolean
  hasProperCooling: boolean
  hasNoCracks: boolean
  hasTempered: boolean
  hasNoBrittleness: boolean
  hasPressure: boolean
  hasNoEruption: boolean
  hasDense: boolean
  hasNoPorosity: boolean
  crackCount: number
  porosityCount: number
}

export interface ReflectionShard {
  file: string
  reflectionQuality: number
  truthRevelation: number
  shadowIntegration: number
  surfaceSmoothness: number
  propheticInsight: number
  volcanicOrigin: number
  reflection: ReflectionMeasure
  truth: TruthMeasure
  shadow: ShadowMeasure
  surface: SurfaceMeasure
  prophetic: PropheticMeasure
  volcanic: VolcanicMeasure
  condition: 'divine-mirror' | 'noble-artifact' | 'working-tool' | 'cracked-mirror' | 'shard' | 'dust'
  qualityScore: number
}

export interface MirrorChamber {
  directory: string
  shards: ReflectionShard[]
  avgReflection: number
  avgTruth: number
  avgProphetic: number
  divineCount: number
  dustCount: number
  clearCount: number
  honestCount: number
  chamberType: 'temple-vault' | 'scrying-room' | 'meditation-hall' | 'mirror-gallery' | 'storage' | 'rubble'
  condition: 'oracle-chamber' | 'hall-of-truth' | 'reflection-room' | 'clouded-hall' | 'shattered-room' | 'void'
}

export interface ObsidianMirrorResult {
  shards: ReflectionShard[]
  chambers: MirrorChamber[]
  temple: {
    avgReflection: number
    avgTruth: number
    avgProphetic: number
    isClear: boolean
    overallClarity: number
  }
  stats: {
    totalFiles: number
    totalChambers: number
    avgReflectionQuality: number
    avgTruthRevelation: number
    avgShadowIntegration: number
    avgSurfaceSmoothness: number
    avgPropheticInsight: number
    avgVolcanicOrigin: number
    divineMirrorCount: number
    nobleArtifactCount: number
    workingToolCount: number
    crackedMirrorCount: number
    shardCount: number
    dustCount: number
    hasHighQualityCount: number
    hasHighTruthCount: number
    hasHighIntegrationCount: number
    hasHighSmoothnessCount: number
    hasHighInsightCount: number
    hasHighOriginCount: number
    overallClarity: number
    priestGrade: 'high-priest' | 'oracle' | 'seer' | 'apprentice' | 'novice' | 'blind'
    bestShard: string
    clearest: string
    mostHonest: string
    bestShadow: string
    smoothest: string
    mostInsightful: string
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

// ─── measureReflection ───────────────────────────────────────

/** @example measureReflection(content) returns ReflectionMeasure */
export function measureReflection(content: string): ReflectionMeasure {
  let score = 0

  const hasSelfAware = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasClearIdentity = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const distortionCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDistortion = distortionCount === 0
  const hasProperNaming = content.length > 0 && (RETURN_RE.test(content) || THROW_RE.test(content))
  const hasNoAlias = !NESTED_TERNARY_RE.test(content)
  const hasHonestAPI = INTERFACE_RE.test(content) || TYPE_RE.test(content) || CLASS_RE.test(content)
  const hasNoDisguise = (content.match(HACK_RE) || []).length === 0
  const hasTransparent = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const illusionCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoIllusion = illusionCount === 0

  if (content.length > 0) score += 5
  if (hasSelfAware) score += 12
  if (hasClearIdentity) score += 12
  if (hasNoDistortion) score += 10
  if (hasProperNaming) score += 10
  if (hasNoAlias) score += 10
  if (hasHonestAPI) score += 10
  if (hasNoDisguise) score += 10
  if (hasTransparent) score += 11
  if (hasNoIllusion) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let clarity: ReflectionMeasure['clarity'] = 'shattered'
  if (hasHighQuality && hasNoDistortion && hasNoIllusion && hasSelfAware) clarity = 'perfect-mirror'
  else if (hasHighQuality && hasNoDistortion) clarity = 'clear'
  else if (hasHighQuality) clarity = 'slight-haze'
  else if (hasHonestAPI && hasNoAlias) clarity = 'clouded'
  else if (quality > 30) clarity = 'cracked'

  return {
    quality, clarity, hasHighQuality, hasSelfAware, hasClearIdentity,
    hasNoDistortion, hasProperNaming, hasNoAlias, hasHonestAPI,
    hasNoDisguise, hasTransparent, hasNoIllusion, distortionCount, illusionCount,
  }
}

// ─── measureTruth ────────────────────────────────────────────

/** @example measureTruth(content) returns TruthMeasure */
export function measureTruth(content: string): TruthMeasure {
  let score = 0

  const hasNoHiddenAgenda = (content.match(ANY_RE) || []).length === 0
  const hasExplicitBehavior = INTERFACE_RE.test(content) || TYPE_RE.test(content)
  const hasNoSideEffects = (content.match(EVAL_RE) || []).length === 0
  const hasPromisesKept = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const lieCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoLies = lieCount === 0
  const hasConsistentState = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoDeception = (content.match(HACK_RE) || []).length === 0
  const hasFactual = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hiddenAgendaCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoMisdirection = hiddenAgendaCount === 0

  if (content.length > 0) score += 5
  if (hasNoHiddenAgenda) score += 12
  if (hasExplicitBehavior) score += 12
  if (hasNoSideEffects) score += 10
  if (hasPromisesKept) score += 10
  if (hasNoLies) score += 10
  if (hasConsistentState) score += 10
  if (hasNoDeception) score += 10
  if (hasFactual) score += 11
  if (hasNoMisdirection) score += 10

  const revelation = Math.min(100, Math.max(0, score))
  const hasHighTruth = revelation >= 70

  let level: TruthMeasure['level'] = 'illusion'
  if (hasHighTruth && hasNoHiddenAgenda && hasNoLies && hasExplicitBehavior) level = 'absolute-truth'
  else if (hasHighTruth && hasNoHiddenAgenda) level = 'honest'
  else if (hasHighTruth) level = 'mostly-true'
  else if (hasExplicitBehavior && hasConsistentState) level = 'half-truth'
  else if (revelation > 30) level = 'deceptive'

  return {
    revelation, level, hasHighTruth, hasNoHiddenAgenda, hasExplicitBehavior,
    hasNoSideEffects, hasPromisesKept, hasNoLies, hasConsistentState,
    hasNoDeception, hasFactual, hasNoMisdirection, hiddenAgendaCount, lieCount,
  }
}

// ─── measureShadow ───────────────────────────────────────────

/** @example measureShadow(content) returns ShadowMeasure */
export function measureShadow(content: string): ShadowMeasure {
  let score = 0

  const hasAcknowledged = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasProperBoundaries = INTERFACE_RE.test(content) || TYPE_RE.test(content)
  const denialCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDenial = denialCount === 0
  const hasGracefulHandling = TRY_RE.test(content) && CATCH_RE.test(content)
  const repressionCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoRepression = repressionCount === 0
  const hasIntegration = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasNoProjection = (content.match(HACK_RE) || []).length === 0
  const hasManaged = content.length > 0 && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const hasNoCollapse = !NESTED_TERNARY_RE.test(content)

  if (content.length > 0) score += 5
  if (hasAcknowledged) score += 12
  if (hasProperBoundaries) score += 12
  if (hasNoDenial) score += 10
  if (hasGracefulHandling) score += 10
  if (hasNoRepression) score += 10
  if (hasIntegration) score += 10
  if (hasNoProjection) score += 10
  if (hasManaged) score += 11
  if (hasNoCollapse) score += 10

  const integration = Math.min(100, Math.max(0, score))
  const hasHighIntegration = integration >= 70

  let depth: ShadowMeasure['depth'] = 'overwhelmed'
  if (hasHighIntegration && hasNoDenial && hasNoRepression && hasGracefulHandling) depth = 'shadow-master'
  else if (hasHighIntegration && hasNoDenial) depth = 'comfortable'
  else if (hasHighIntegration) depth = 'aware'
  else if (hasProperBoundaries && hasAcknowledged) depth = 'nervous'
  else if (integration > 30) depth = 'fearful'

  return {
    integration, depth, hasHighIntegration, hasAcknowledged, hasProperBoundaries,
    hasNoDenial, hasGracefulHandling, hasNoRepression, hasIntegration,
    hasNoProjection, hasManaged, hasNoCollapse, denialCount, repressionCount,
  }
}

// ─── measureSurface ──────────────────────────────────────────

/** @example measureSurface(content) returns SurfaceMeasure */
export function measureSurface(content: string): SurfaceMeasure {
  let score = 0

  const lines = content.split('\n')
  const avgLineLen = lines.length > 0 ? lines.reduce((s, l) => s + l.length, 0) / lines.length : 0
  const hasCleanFormatting = avgLineLen < 80
  const hasConsistentStyle = lines.every((l) => l.length < 120)
  const blemishCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoBlemishes = blemishCount === 0
  const hasProperFlow = content.length > 0 && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const scratchCount = (content.match(CONSOLE_RE) || []).length
  const hasNoScratches = scratchCount === 0
  const hasEvenTone = lines.every((l) => l.length < 300)
  const hasNoInterruption = !NESTED_TERNARY_RE.test(content)
  const hasReadable = EXPORT_RE.test(content) || RETURN_RE.test(content)
  const hasNoObfuscation = (content.match(EVAL_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasCleanFormatting) score += 12
  if (hasConsistentStyle) score += 12
  if (hasNoBlemishes) score += 10
  if (hasProperFlow) score += 10
  if (hasNoScratches) score += 10
  if (hasEvenTone) score += 10
  if (hasNoInterruption) score += 10
  if (hasReadable) score += 11
  if (hasNoObfuscation) score += 10

  const smoothness = Math.min(100, Math.max(0, score))
  const hasHighSmoothness = smoothness >= 70

  let polish: SurfaceMeasure['polish'] = 'raw-stone'
  if (hasHighSmoothness && hasNoBlemishes && hasNoScratches && hasCleanFormatting) polish = 'museum-quality'
  else if (hasHighSmoothness && hasNoBlemishes) polish = 'well-polished'
  else if (hasHighSmoothness) polish = 'smooth'
  else if (hasConsistentStyle && hasReadable) polish = 'rough'
  else if (smoothness > 30) polish = 'jagged'

  return {
    smoothness, polish, hasHighSmoothness, hasCleanFormatting, hasConsistentStyle,
    hasNoBlemishes, hasProperFlow, hasNoScratches, hasEvenTone,
    hasNoInterruption, hasReadable, hasNoObfuscation, blemishCount, scratchCount,
  }
}

// ─── measureProphetic ────────────────────────────────────────

/** @example measureProphetic(content) returns PropheticMeasure */
export function measureProphetic(content: string): PropheticMeasure {
  let score = 0

  const hasForesight = INTERFACE_RE.test(content) && TYPE_RE.test(content) && CLASS_RE.test(content)
  const hasFutureProof = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const techDebtCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length + (content.match(HACK_RE) || []).length
  const hasNoTechnicalDebt = techDebtCount === 0
  const hasAdaptiveDesign = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasNoRigidity = !NESTED_TERNARY_RE.test(content)
  const hasExtensible = INTERFACE_RE.test(content) || TYPE_RE.test(content) || CLASS_RE.test(content)
  const deadEndCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDeadEnd = deadEndCount === 0
  const hasSustainable = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoFragility = (content.match(DEPRECATED_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasForesight) score += 12
  if (hasFutureProof) score += 10
  if (hasNoTechnicalDebt) score += 12
  if (hasAdaptiveDesign) score += 10
  if (hasNoRigidity) score += 10
  if (hasExtensible) score += 10
  if (hasNoDeadEnd) score += 10
  if (hasSustainable) score += 11
  if (hasNoFragility) score += 10

  const insight = Math.min(100, Math.max(0, score))
  const hasHighInsight = insight >= 70

  let vision: PropheticMeasure['vision'] = 'catastrophic'
  if (hasHighInsight && hasNoTechnicalDebt && hasForesight && hasFutureProof) vision = 'oracle'
  else if (hasHighInsight && hasNoTechnicalDebt) vision = 'seer'
  else if (hasHighInsight) vision = 'clairvoyant'
  else if (hasExtensible && hasSustainable) vision = 'short-sighted'
  else if (insight > 30) vision = 'blind'

  return {
    insight, vision, hasHighInsight, hasForesight, hasFutureProof,
    hasNoTechnicalDebt, hasAdaptiveDesign, hasNoRigidity, hasExtensible,
    hasNoDeadEnd, hasSustainable, hasNoFragility, techDebtCount, deadEndCount,
  }
}

// ─── measureVolcanic ─────────────────────────────────────────

/** @example measureVolcanic(content) returns VolcanicMeasure */
export function measureVolcanic(content: string): VolcanicMeasure {
  let score = 0

  const hasSolidFoundation = INTERFACE_RE.test(content) || TYPE_RE.test(content) || CLASS_RE.test(content)
  const hasProperCooling = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const crackCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoCracks = crackCount === 0
  const hasTempered = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoBrittleness = !NESTED_TERNARY_RE.test(content)
  const hasPressure = THROW_RE.test(content) || (TRY_RE.test(content) && CATCH_RE.test(content))
  const hasNoEruption = (content.match(DEPRECATED_RE) || []).length === 0
  const hasDense = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const porosityCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoPorosity = porosityCount === 0

  if (content.length > 0) score += 5
  if (hasSolidFoundation) score += 12
  if (hasProperCooling) score += 10
  if (hasNoCracks) score += 12
  if (hasTempered) score += 10
  if (hasNoBrittleness) score += 10
  if (hasPressure) score += 10
  if (hasNoEruption) score += 10
  if (hasDense) score += 11
  if (hasNoPorosity) score += 10

  const origin = Math.min(100, Math.max(0, score))
  const hasHighOrigin = origin >= 70

  let strength: VolcanicMeasure['strength'] = 'dust'
  if (hasHighOrigin && hasNoCracks && hasNoPorosity && hasSolidFoundation) strength = 'diamond-hard'
  else if (hasHighOrigin && hasNoCracks) strength = 'obsidian-strong'
  else if (hasHighOrigin) strength = 'basalt-firm'
  else if (hasSolidFoundation && hasTempered) strength = 'pumice-light'
  else if (origin > 30) strength = 'ash-weak'

  return {
    origin, strength, hasHighOrigin, hasSolidFoundation, hasProperCooling,
    hasNoCracks, hasTempered, hasNoBrittleness, hasPressure,
    hasNoEruption, hasDense, hasNoPorosity, crackCount, porosityCount,
  }
}

// ─── classifyCondition ───────────────────────────────────────

/** @example classifyCondition(shard) returns condition */
export function classifyCondition(shard: ReflectionShard): ReflectionShard['condition'] {
  const { qualityScore } = shard
  if (qualityScore >= 80) return 'divine-mirror'
  if (qualityScore >= 65) return 'noble-artifact'
  if (qualityScore >= 50) return 'working-tool'
  if (qualityScore >= 35) return 'cracked-mirror'
  if (qualityScore >= 20) return 'shard'
  return 'dust'
}

// ─── analyzeReflectionShard ──────────────────────────────────

/** @example analyzeReflectionShard(content, filePath) returns full shard */
export function analyzeReflectionShard(content: string, filePath: string): ReflectionShard {
  const reflection = measureReflection(content)
  const truth = measureTruth(content)
  const shadow = measureShadow(content)
  const surface = measureSurface(content)
  const prophetic = measureProphetic(content)
  const volcanic = measureVolcanic(content)

  const reflectionQuality = reflection.quality
  const truthRevelation = truth.revelation
  const shadowIntegration = shadow.integration
  const surfaceSmoothness = surface.smoothness
  const propheticInsight = prophetic.insight
  const volcanicOrigin = volcanic.origin

  const qualityScore = Math.round(
    reflectionQuality * 0.2 +
    truthRevelation * 0.15 +
    shadowIntegration * 0.15 +
    surfaceSmoothness * 0.15 +
    propheticInsight * 0.2 +
    volcanicOrigin * 0.15,
  )

  const result: ReflectionShard = {
    file: filePath,
    reflectionQuality, truthRevelation, shadowIntegration,
    surfaceSmoothness, propheticInsight, volcanicOrigin,
    reflection, truth, shadow, surface, prophetic, volcanic,
    qualityScore,
    condition: 'dust',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── Mirror Chamber Analysis ─────────────────────────────────

/** @example analyzeMirrorChamber(shards, dirPath) returns MirrorChamber */
export function analyzeMirrorChamber(shards: ReflectionShard[], dirPath: string): MirrorChamber {
  if (shards.length === 0) {
    return {
      directory: dirPath, shards: [], avgReflection: 0, avgTruth: 0, avgProphetic: 0,
      divineCount: 0, dustCount: 0, clearCount: 0, honestCount: 0,
      chamberType: 'rubble', condition: 'void',
    }
  }

  const avgReflection = Math.round(shards.reduce((s, sh) => s + sh.reflectionQuality, 0) / shards.length)
  const avgTruth = Math.round(shards.reduce((s, sh) => s + sh.truthRevelation, 0) / shards.length)
  const avgProphetic = Math.round(shards.reduce((s, sh) => s + sh.propheticInsight, 0) / shards.length)
  const divineCount = shards.filter((sh) => sh.condition === 'divine-mirror').length
  const dustCount = shards.filter((sh) => sh.condition === 'dust').length
  const clearCount = shards.filter((sh) => sh.reflection.hasHighQuality).length
  const honestCount = shards.filter((sh) => sh.truth.hasHighTruth).length

  const chamberType = classifyChamberType(shards)
  const avgScore = shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length
  let condition: MirrorChamber['condition'] = 'void'
  if (avgScore >= 75) condition = 'oracle-chamber'
  else if (avgScore >= 60) condition = 'hall-of-truth'
  else if (avgScore >= 45) condition = 'reflection-room'
  else if (avgScore >= 30) condition = 'clouded-hall'
  else if (avgScore >= 15) condition = 'shattered-room'

  return {
    directory: dirPath, shards, avgReflection, avgTruth, avgProphetic,
    divineCount, dustCount, clearCount, honestCount, chamberType, condition,
  }
}

// ─── classifyChamberType ─────────────────────────────────────

/** @example classifyChamberType(shards) returns chamber type */
export function classifyChamberType(shards: ReflectionShard[]): MirrorChamber['chamberType'] {
  if (shards.length === 0) return 'rubble'
  const avgScore = shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length
  const divineCnt = shards.filter((sh) => sh.condition === 'divine-mirror').length
  if (avgScore >= 75 && divineCnt >= Math.ceil(shards.length * 0.3)) return 'temple-vault'
  if (avgScore >= 60) return 'scrying-room'
  if (avgScore >= 45) return 'meditation-hall'
  if (avgScore >= 30) return 'mirror-gallery'
  if (avgScore >= 15) return 'storage'
  return 'rubble'
}

// ─── classifyPriestGrade ─────────────────────────────────────

/** @example classifyPriestGrade(avgClarity) returns grade */
export function classifyPriestGrade(avgClarity: number): ObsidianMirrorResult['stats']['priestGrade'] {
  if (avgClarity >= 80) return 'high-priest'
  if (avgClarity >= 65) return 'oracle'
  if (avgClarity >= 50) return 'seer'
  if (avgClarity >= 35) return 'apprentice'
  if (avgClarity >= 20) return 'novice'
  return 'blind'
}

// ─── generateRecommendations ─────────────────────────────────

/** @example generateRecommendations(shards, chambers, temple, stats) returns string[] */
export function generateRecommendations(
  shards: ReflectionShard[],
  chambers: MirrorChamber[],
  temple: ObsidianMirrorResult['temple'],
  stats: ObsidianMirrorResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgReflectionQuality < 50) recs.push('Improve reflection quality — add interfaces and types for code clarity')
  if (stats.avgTruthRevelation < 50) recs.push('Enhance truth revelation — remove eval/any and keep documentation honest')
  if (stats.avgShadowIntegration < 50) recs.push('Strengthen shadow integration — handle hidden complexity with proper error handling')
  if (stats.avgSurfaceSmoothness < 50) recs.push('Polish surface smoothness — reduce line length and remove TODOs/FIXMEs')
  if (stats.avgPropheticInsight < 50) recs.push('Boost prophetic insight — reduce technical debt and add extensible patterns')
  if (stats.avgVolcanicOrigin < 50) recs.push('Harden volcanic origin — add solid type foundations and remove code porosity')
  if (stats.dustCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of shards are dust — consider major refactoring')
  if (stats.shardCount > 0) recs.push('Warning: cracked mirrors detected — these files need reflection renewal')
  if (temple.overallClarity < 40) recs.push('Overall clarity is critical — establish a code truth-telling plan')
  if (chambers.length > 0 && chambers.every((c) => c.condition === 'void')) recs.push('All chambers are void — your codebase needs fundamental reflection')

  if (shards.length > 0) {
    const distorted = shards.filter((sh) => sh.reflection.distortionCount > 2)
    if (distorted.length > shards.length * 0.5) recs.push('Over 50% of shards have distortion — reduce any/eval usage')
  }

  return recs
}

// ─── buildObsidianMirrorResult ───────────────────────────────

/** @example buildObsidianMirrorResult(files, contents) returns full result */
export function buildObsidianMirrorResult(files: string[], contents: string[]): ObsidianMirrorResult {
  const shards = files.map((file, i) => analyzeReflectionShard(contents[i] ?? '', file))

  const chamberMap = new Map<string, ReflectionShard[]>()
  shards.forEach((shard) => {
    const parts = shard.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = chamberMap.get(dir)
    if (existing) existing.push(shard)
    else chamberMap.set(dir, [shard])
  })

  const chambers = Array.from(chamberMap.entries()).map(([dir, ss]) => analyzeMirrorChamber(ss, dir))

  const avgReflectionQuality = shards.length > 0 ? Math.round(shards.reduce((s, sh) => s + sh.reflectionQuality, 0) / shards.length) : 0
  const avgTruthRevelation = shards.length > 0 ? Math.round(shards.reduce((s, sh) => s + sh.truthRevelation, 0) / shards.length) : 0
  const avgShadowIntegration = shards.length > 0 ? Math.round(shards.reduce((s, sh) => s + sh.shadowIntegration, 0) / shards.length) : 0
  const avgSurfaceSmoothness = shards.length > 0 ? Math.round(shards.reduce((s, sh) => s + sh.surfaceSmoothness, 0) / shards.length) : 0
  const avgPropheticInsight = shards.length > 0 ? Math.round(shards.reduce((s, sh) => s + sh.propheticInsight, 0) / shards.length) : 0
  const avgVolcanicOrigin = shards.length > 0 ? Math.round(shards.reduce((s, sh) => s + sh.volcanicOrigin, 0) / shards.length) : 0

  const overallClarity = Math.round(
    avgReflectionQuality * 0.2 +
    avgTruthRevelation * 0.15 +
    avgShadowIntegration * 0.15 +
    avgSurfaceSmoothness * 0.15 +
    avgPropheticInsight * 0.2 +
    avgVolcanicOrigin * 0.15,
  )

  const temple = {
    avgReflection: avgReflectionQuality,
    avgTruth: avgTruthRevelation,
    avgProphetic: avgPropheticInsight,
    isClear: overallClarity >= 60,
    overallClarity,
  }

  const stats = {
    totalFiles: files.length,
    totalChambers: chambers.length,
    avgReflectionQuality,
    avgTruthRevelation,
    avgShadowIntegration,
    avgSurfaceSmoothness,
    avgPropheticInsight,
    avgVolcanicOrigin,
    divineMirrorCount: shards.filter((sh) => sh.condition === 'divine-mirror').length,
    nobleArtifactCount: shards.filter((sh) => sh.condition === 'noble-artifact').length,
    workingToolCount: shards.filter((sh) => sh.condition === 'working-tool').length,
    crackedMirrorCount: shards.filter((sh) => sh.condition === 'cracked-mirror').length,
    shardCount: shards.filter((sh) => sh.condition === 'shard').length,
    dustCount: shards.filter((sh) => sh.condition === 'dust').length,
    hasHighQualityCount: shards.filter((sh) => sh.reflection.hasHighQuality).length,
    hasHighTruthCount: shards.filter((sh) => sh.truth.hasHighTruth).length,
    hasHighIntegrationCount: shards.filter((sh) => sh.shadow.hasHighIntegration).length,
    hasHighSmoothnessCount: shards.filter((sh) => sh.surface.hasHighSmoothness).length,
    hasHighInsightCount: shards.filter((sh) => sh.prophetic.hasHighInsight).length,
    hasHighOriginCount: shards.filter((sh) => sh.volcanic.hasHighOrigin).length,
    overallClarity,
    priestGrade: classifyPriestGrade(overallClarity),
    bestShard: '',
    clearest: '',
    mostHonest: '',
    bestShadow: '',
    smoothest: '',
    mostInsightful: '',
  }

  if (shards.length > 0) {
    stats.bestShard = shards.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.clearest = shards.reduce((a, b) => a.reflectionQuality >= b.reflectionQuality ? a : b).file
    stats.mostHonest = shards.reduce((a, b) => a.truthRevelation >= b.truthRevelation ? a : b).file
    stats.bestShadow = shards.reduce((a, b) => a.shadowIntegration >= b.shadowIntegration ? a : b).file
    stats.smoothest = shards.reduce((a, b) => a.surfaceSmoothness >= b.surfaceSmoothness ? a : b).file
    stats.mostInsightful = shards.reduce((a, b) => a.propheticInsight >= b.propheticInsight ? a : b).file
  }

  const recommendations = generateRecommendations(shards, chambers, temple, stats)

  return { shards, chambers, temple, stats, recommendations }
}
