// ─── Interfaces ──────────────────────────────────────────

export interface StrengthMeasure {
  level: number
  grade: 'tungsten-grade' | 'steel-thread' | 'silver-cord' | 'cotton-thread' | 'spider-silk' | 'broken-filament'
  hasHighLevel: boolean
  hasStrongBond: boolean
  hasNoWeakLinks: boolean
  hasProperTension: boolean
  hasNoFraying: boolean
  hasResilient: boolean
  hasNoSnapping: boolean
  hasProperTwist: boolean
  hasElasticity: boolean
  hasNoBrittleness: boolean
  weakLinkCount: number
  frayingCount: number
}

export interface WeaveMeasure {
  quality: number
  pattern: 'tapestry' | 'brocade' | 'damask' | 'plain-weave' | 'burlap' | 'unraveling'
  hasHighQuality: boolean
  hasTightWeave: boolean
  hasProperInterlacing: boolean
  hasNoGaps: boolean
  hasEvenTension: boolean
  hasNoLooseEnds: boolean
  hasProperGrid: boolean
  hasNoUnraveling: boolean
  hasConsistent: boolean
  hasNoSnags: boolean
  gapCount: number
  snagCount: number
}

export interface IntegrityMeasure {
  level: number
  state: 'pristine' | 'intact' | 'mostly-intact' | 'worn' | 'tattered' | 'dissolved'
  hasHighLevel: boolean
  hasConsistentPatterns: boolean
  hasNoContradictions: boolean
  hasProperAlignment: boolean
  hasNoDrift: boolean
  hasUniform: boolean
  hasNoInconsistencies: boolean
  hasProperThread: boolean
  hasHarmonious: boolean
  hasNoConflicts: boolean
  contradictionCount: number
  inconsistencyCount: number
}

export interface LusterMeasure {
  level: number
  shine: 'mirror-finish' | 'high-polish' | 'silver-shine' | 'matte' | 'tarnished' | 'corroded'
  hasHighLevel: boolean
  hasCleanSurface: boolean
  hasProperFinish: boolean
  hasNoTarnish: boolean
  hasReflective: boolean
  hasNoOxidation: boolean
  hasPolished: boolean
  hasNoScratches: boolean
  hasBrilliant: boolean
  hasNoDulling: boolean
  tarnishCount: number
  scratchCount: number
}

export interface FlowMeasure {
  level: number
  state: 'unbroken-thread' | 'continuous' | 'mostly-continuous' | 'intermittent' | 'fragmented' | 'broken'
  hasHighLevel: boolean
  hasSmoothFlow: boolean
  hasNoInterruptions: boolean
  hasProperTransitions: boolean
  hasUnbroken: boolean
  hasNoKnots: boolean
  hasEvenPace: boolean
  hasNoTangling: boolean
  hasProgressive: boolean
  hasNoDeadEnds: boolean
  interruptionCount: number
  knotCount: number
}

export interface TensileMeasure {
  quality: number
  grade: 'carbon-fiber' | 'kevlar' | 'steel-cable' | 'nylon' | 'cotton' | 'spun-sugar'
  hasHighQuality: boolean
  hasHighBreakingPoint: boolean
  hasProperElongation: boolean
  hasNoFatigue: boolean
  hasWeatherResistant: boolean
  hasNoCorrosion: boolean
  hasLoadBearing: boolean
  hasNoFailingUnderLoad: boolean
  hasImpactResistant: boolean
  hasNoDeterioration: boolean
  fatigueCount: number
  corrosionCount: number
}

export interface ThreadSample {
  file: string
  threadStrength: number
  weaveQuality: number
  patternIntegrity: number
  metallicLuster: number
  continuity: number
  tensileQuality: number
  strength: StrengthMeasure
  weave: WeaveMeasure
  integrity: IntegrityMeasure
  luster: LusterMeasure
  flow: FlowMeasure
  tensile: TensileMeasure
  condition: 'masterpiece-thread' | 'noble-cord' | 'reliable-yarn' | 'worn-thread' | 'frayed-end' | 'dust'
  qualityScore: number
}

export interface WeavePattern {
  directory: string
  samples: ThreadSample[]
  avgStrength: number
  avgWeave: number
  avgTensile: number
  masterpieceCount: number
  dustCount: number
  strongCount: number
  wovenCount: number
  patternType: 'masterwork-tapestry' | 'fine-fabric' | 'sturdy-cloth' | 'patchwork' | 'rags' | 'threads'
  condition: 'golden-weave' | 'silver-fabric' | 'cotton-cloth' | 'burlap-sack' | 'tattered-rag' | 'dust'
}

export interface SilverThreadResult {
  samples: ThreadSample[]
  patterns: WeavePattern[]
  loom: {
    avgStrength: number
    avgWeave: number
    avgTensile: number
    isStrong: boolean
    overallStrength: number
  }
  stats: {
    totalFiles: number
    totalPatterns: number
    avgThreadStrength: number
    avgWeaveQuality: number
    avgPatternIntegrity: number
    avgMetallicLuster: number
    avgContinuity: number
    avgTensileQuality: number
    masterpieceThreadCount: number
    nobleCordCount: number
    reliableYarnCount: number
    wornThreadCount: number
    frayedEndCount: number
    dustCount: number
    hasHighStrengthCount: number
    hasHighWeaveCount: number
    hasHighIntegrityCount: number
    hasHighLusterCount: number
    hasHighContinuityCount: number
    hasHighTensileCount: number
    overallStrength: number
    weaverGrade: 'master-weaver' | 'artisan' | 'journeyman' | 'apprentice' | 'novice' | 'clumsy'
    bestSample: string
    strongest: string
    bestWoven: string
    mostConsistent: string
    mostPolished: string
    mostDurable: string
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

// ─── measureStrength ───────────────────────────────────

/** @example measureStrength(content) returns StrengthMeasure */
export function measureStrength(content: string): StrengthMeasure {
  let score = 0

  const hasStrongBond = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoWeakLinks = !NESTED_TERNARY_RE.test(content)
  const weakLinkCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasProperTension = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const frayingCount = (content.match(HACK_RE) || []).length
  const hasNoFraying = frayingCount === 0
  const hasResilient = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoSnapping = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasProperTwist = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasElasticity = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const hasNoBrittleness = weakLinkCount === 0

  if (content.length > 0) score += 5
  if (hasStrongBond) score += 12
  if (hasNoWeakLinks) score += 12
  if (hasProperTension) score += 10
  if (hasNoFraying) score += 10
  if (hasResilient) score += 10
  if (hasNoSnapping) score += 10
  if (hasProperTwist) score += 10
  if (hasElasticity) score += 11
  if (hasNoBrittleness) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let grade: StrengthMeasure['grade'] = 'broken-filament'
  if (hasHighLevel && hasNoBrittleness && hasStrongBond && hasProperTwist) grade = 'tungsten-grade'
  else if (hasHighLevel && hasNoBrittleness) grade = 'steel-thread'
  else if (hasHighLevel) grade = 'silver-cord'
  else if (hasStrongBond && hasResilient) grade = 'cotton-thread'
  else if (level > 30) grade = 'spider-silk'

  return {
    level, grade, hasHighLevel, hasStrongBond, hasNoWeakLinks,
    hasProperTension, hasNoFraying, hasResilient, hasNoSnapping,
    hasProperTwist, hasElasticity, hasNoBrittleness, weakLinkCount, frayingCount,
  }
}

// ─── measureWeave ──────────────────────────────────────

/** @example measureWeave(content) returns WeaveMeasure */
export function measureWeave(content: string): WeaveMeasure {
  let score = 0

  const hasTightWeave = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasProperInterlacing = INTERFACE_RE.test(content) && CLASS_RE.test(content)
  const gapCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoGaps = gapCount === 0
  const hasEvenTension = !NESTED_TERNARY_RE.test(content)
  const snagCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoLooseEnds = snagCount === 0
  const hasProperGrid = FUNCTION_RE.test(content) || ARROW_RE.test(content)
  const hasNoUnraveling = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasConsistent = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoSnags = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasTightWeave) score += 12
  if (hasProperInterlacing) score += 12
  if (hasNoGaps) score += 10
  if (hasEvenTension) score += 10
  if (hasNoLooseEnds) score += 10
  if (hasProperGrid) score += 10
  if (hasNoUnraveling) score += 10
  if (hasConsistent) score += 11
  if (hasNoSnags) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let pattern: WeaveMeasure['pattern'] = 'unraveling'
  if (hasHighQuality && hasNoGaps && hasTightWeave && hasConsistent) pattern = 'tapestry'
  else if (hasHighQuality && hasNoGaps) pattern = 'brocade'
  else if (hasHighQuality) pattern = 'damask'
  else if (hasProperInterlacing && hasProperGrid) pattern = 'plain-weave'
  else if (quality > 30) pattern = 'burlap'

  return {
    quality, pattern, hasHighQuality, hasTightWeave, hasProperInterlacing,
    hasNoGaps, hasEvenTension, hasNoLooseEnds, hasProperGrid, hasNoUnraveling,
    hasConsistent, hasNoSnags, gapCount, snagCount,
  }
}

// ─── measureIntegrity ──────────────────────────────────

/** @example measureIntegrity(content) returns IntegrityMeasure */
export function measureIntegrity(content: string): IntegrityMeasure {
  let score = 0

  const hasConsistentPatterns = INTERFACE_RE.test(content) && TYPE_RE.test(content) && CLASS_RE.test(content)
  const contradictionCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoContradictions = contradictionCount === 0
  const hasProperAlignment = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const hasNoDrift = !NESTED_TERNARY_RE.test(content)
  const inconsistencyCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasUniform = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoInconsistencies = inconsistencyCount === 0
  const hasProperThread = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasHarmonious = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoConflicts = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasConsistentPatterns) score += 12
  if (hasNoContradictions) score += 12
  if (hasProperAlignment) score += 10
  if (hasNoDrift) score += 10
  if (hasUniform) score += 10
  if (hasNoInconsistencies) score += 10
  if (hasProperThread) score += 10
  if (hasHarmonious) score += 11
  if (hasNoConflicts) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let state: IntegrityMeasure['state'] = 'dissolved'
  if (hasHighLevel && hasNoContradictions && hasConsistentPatterns && hasUniform) state = 'pristine'
  else if (hasHighLevel && hasNoContradictions) state = 'intact'
  else if (hasHighLevel) state = 'mostly-intact'
  else if (hasConsistentPatterns && hasProperThread) state = 'worn'
  else if (level > 30) state = 'tattered'

  return {
    level, state, hasHighLevel, hasConsistentPatterns, hasNoContradictions,
    hasProperAlignment, hasNoDrift, hasUniform, hasNoInconsistencies,
    hasProperThread, hasHarmonious, hasNoConflicts, contradictionCount, inconsistencyCount,
  }
}

// ─── measureLuster ─────────────────────────────────────

/** @example measureLuster(content) returns LusterMeasure */
export function measureLuster(content: string): LusterMeasure {
  let score = 0

  const hasCleanSurface = (content.match(CONSOLE_RE) || []).length === 0
  const hasProperFinish = (content.match(DOC_COMMENT_RE) || []).length > 0
  const tarnishCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoTarnish = tarnishCount === 0
  const hasReflective = INTERFACE_RE.test(content) || TYPE_RE.test(content)
  const hasNoOxidation = (content.match(DEPRECATED_RE) || []).length === 0
  const scratchCount = (content.match(TODO_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasPolished = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const hasNoScratches = scratchCount === 0
  const hasBrilliant = !NESTED_TERNARY_RE.test(content)
  const hasNoDulling = (content.match(HACK_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasCleanSurface) score += 12
  if (hasProperFinish) score += 12
  if (hasNoTarnish) score += 10
  if (hasReflective) score += 10
  if (hasNoOxidation) score += 10
  if (hasPolished) score += 10
  if (hasNoScratches) score += 10
  if (hasBrilliant) score += 11
  if (hasNoDulling) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let shine: LusterMeasure['shine'] = 'corroded'
  if (hasHighLevel && hasNoTarnish && hasProperFinish && hasCleanSurface) shine = 'mirror-finish'
  else if (hasHighLevel && hasNoTarnish) shine = 'high-polish'
  else if (hasHighLevel) shine = 'silver-shine'
  else if (hasReflective && hasPolished) shine = 'matte'
  else if (level > 30) shine = 'tarnished'

  return {
    level, shine, hasHighLevel, hasCleanSurface, hasProperFinish,
    hasNoTarnish, hasReflective, hasNoOxidation, hasPolished,
    hasNoScratches, hasBrilliant, hasNoDulling, tarnishCount, scratchCount,
  }
}

// ─── measureFlow ───────────────────────────────────────

/** @example measureFlow(content) returns FlowMeasure */
export function measureFlow(content: string): FlowMeasure {
  let score = 0

  const hasSmoothFlow = FUNCTION_RE.test(content) || ARROW_RE.test(content)
  const interruptionCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoInterruptions = interruptionCount === 0
  const hasProperTransitions = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasUnbroken = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || CLASS_RE.test(content))
  const knotCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoKnots = knotCount === 0
  const hasEvenPace = !NESTED_TERNARY_RE.test(content)
  const hasNoTangling = (content.match(HACK_RE) || []).length === 0
  const hasProgressive = content.length > 0 && (RETURN_RE.test(content) || THROW_RE.test(content))
  const hasNoDeadEnds = (content.match(TODO_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasSmoothFlow) score += 12
  if (hasNoInterruptions) score += 12
  if (hasProperTransitions) score += 10
  if (hasUnbroken) score += 10
  if (hasNoKnots) score += 10
  if (hasEvenPace) score += 10
  if (hasNoTangling) score += 10
  if (hasProgressive) score += 11
  if (hasNoDeadEnds) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let state: FlowMeasure['state'] = 'broken'
  if (hasHighLevel && hasNoInterruptions && hasProperTransitions && hasUnbroken) state = 'unbroken-thread'
  else if (hasHighLevel && hasNoInterruptions) state = 'continuous'
  else if (hasHighLevel) state = 'mostly-continuous'
  else if (hasSmoothFlow && hasProgressive) state = 'intermittent'
  else if (level > 30) state = 'fragmented'

  return {
    level, state, hasHighLevel, hasSmoothFlow, hasNoInterruptions,
    hasProperTransitions, hasUnbroken, hasNoKnots, hasEvenPace,
    hasNoTangling, hasProgressive, hasNoDeadEnds, interruptionCount, knotCount,
  }
}

// ─── measureTensile ────────────────────────────────────

/** @example measureTensile(content) returns TensileMeasure */
export function measureTensile(content: string): TensileMeasure {
  let score = 0

  const hasHighBreakingPoint = INTERFACE_RE.test(content) && TYPE_RE.test(content) && CLASS_RE.test(content)
  const hasProperElongation = GENERIC_RE.test(content) && OPTIONAL_RE.test(content)
  const fatigueCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoFatigue = fatigueCount === 0
  const hasWeatherResistant = (content.match(DOC_COMMENT_RE) || []).length > 0
  const corrosionCount = (content.match(HACK_RE) || []).length + (content.match(DEPRECATED_RE) || []).length
  const hasNoCorrosion = corrosionCount === 0
  const hasLoadBearing = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const hasNoFailingUnderLoad = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasImpactResistant = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoDeterioration = (content.match(FIXME_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasHighBreakingPoint) score += 12
  if (hasProperElongation) score += 12
  if (hasNoFatigue) score += 10
  if (hasWeatherResistant) score += 10
  if (hasNoCorrosion) score += 10
  if (hasLoadBearing) score += 10
  if (hasNoFailingUnderLoad) score += 10
  if (hasImpactResistant) score += 11
  if (hasNoDeterioration) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let grade: TensileMeasure['grade'] = 'spun-sugar'
  if (hasHighQuality && hasNoFatigue && hasHighBreakingPoint && hasProperElongation) grade = 'carbon-fiber'
  else if (hasHighQuality && hasNoFatigue) grade = 'kevlar'
  else if (hasHighQuality) grade = 'steel-cable'
  else if (hasHighBreakingPoint && hasImpactResistant) grade = 'nylon'
  else if (quality > 30) grade = 'cotton'

  return {
    quality, grade, hasHighQuality, hasHighBreakingPoint, hasProperElongation,
    hasNoFatigue, hasWeatherResistant, hasNoCorrosion, hasLoadBearing,
    hasNoFailingUnderLoad, hasImpactResistant, hasNoDeterioration, fatigueCount, corrosionCount,
  }
}

// ─── classifyCondition ─────────────────────────────────

/** @example classifyCondition(sample) returns condition */
export function classifyCondition(sample: ThreadSample): ThreadSample['condition'] {
  const { qualityScore } = sample
  if (qualityScore >= 80) return 'masterpiece-thread'
  if (qualityScore >= 65) return 'noble-cord'
  if (qualityScore >= 50) return 'reliable-yarn'
  if (qualityScore >= 35) return 'worn-thread'
  if (qualityScore >= 20) return 'frayed-end'
  return 'dust'
}

// ─── analyzeThreadSample ──────────────────────────────

/** @example analyzeThreadSample(content, filePath) returns full sample */
export function analyzeThreadSample(content: string, filePath: string): ThreadSample {
  const strength = measureStrength(content)
  const weave = measureWeave(content)
  const integrity = measureIntegrity(content)
  const luster = measureLuster(content)
  const flow = measureFlow(content)
  const tensile = measureTensile(content)

  const threadStrength = strength.level
  const weaveQuality = weave.quality
  const patternIntegrity = integrity.level
  const metallicLuster = luster.level
  const continuity = flow.level
  const tensileQuality = tensile.quality

  const qualityScore = Math.round(
    threadStrength * 0.15 +
    weaveQuality * 0.15 +
    patternIntegrity * 0.2 +
    metallicLuster * 0.15 +
    continuity * 0.2 +
    tensileQuality * 0.15,
  )

  const result: ThreadSample = {
    file: filePath,
    threadStrength, weaveQuality, patternIntegrity,
    metallicLuster, continuity, tensileQuality,
    strength, weave, integrity, luster, flow, tensile,
    qualityScore,
    condition: 'dust',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── analyzeWeavePattern ──────────────────────────────

/** @example analyzeWeavePattern(samples, dirPath) returns WeavePattern */
export function analyzeWeavePattern(samples: ThreadSample[], dirPath: string): WeavePattern {
  if (samples.length === 0) {
    return {
      directory: dirPath, samples: [], avgStrength: 0, avgWeave: 0, avgTensile: 0,
      masterpieceCount: 0, dustCount: 0, strongCount: 0, wovenCount: 0,
      patternType: 'threads', condition: 'dust',
    }
  }

  const avgStrength = Math.round(samples.reduce((s, sp) => s + sp.threadStrength, 0) / samples.length)
  const avgWeave = Math.round(samples.reduce((s, sp) => s + sp.weaveQuality, 0) / samples.length)
  const avgTensile = Math.round(samples.reduce((s, sp) => s + sp.tensileQuality, 0) / samples.length)
  const masterpieceCount = samples.filter((sp) => sp.condition === 'masterpiece-thread').length
  const dustCount = samples.filter((sp) => sp.condition === 'dust').length
  const strongCount = samples.filter((sp) => sp.strength.hasHighLevel).length
  const wovenCount = samples.filter((sp) => sp.weave.hasHighQuality).length

  const patternType = classifyPatternType(samples)
  const avgScore = samples.reduce((s, sp) => s + sp.qualityScore, 0) / samples.length
  let condition: WeavePattern['condition'] = 'dust'
  if (avgScore >= 75) condition = 'golden-weave'
  else if (avgScore >= 60) condition = 'silver-fabric'
  else if (avgScore >= 45) condition = 'cotton-cloth'
  else if (avgScore >= 30) condition = 'burlap-sack'
  else if (avgScore >= 15) condition = 'tattered-rag'

  return {
    directory: dirPath, samples, avgStrength, avgWeave, avgTensile,
    masterpieceCount, dustCount, strongCount, wovenCount, patternType, condition,
  }
}

// ─── classifyPatternType ──────────────────────────────

/** @example classifyPatternType(samples) returns pattern type */
export function classifyPatternType(samples: ThreadSample[]): WeavePattern['patternType'] {
  if (samples.length === 0) return 'threads'
  const avgScore = samples.reduce((s, sp) => s + sp.qualityScore, 0) / samples.length
  const masterCnt = samples.filter((sp) => sp.condition === 'masterpiece-thread').length
  if (avgScore >= 75 && masterCnt >= Math.ceil(samples.length * 0.3)) return 'masterwork-tapestry'
  if (avgScore >= 60) return 'fine-fabric'
  if (avgScore >= 45) return 'sturdy-cloth'
  if (avgScore >= 30) return 'patchwork'
  if (avgScore >= 15) return 'rags'
  return 'threads'
}

// ─── classifyWeaverGrade ──────────────────────────────

/** @example classifyWeaverGrade(avgStrength) returns grade */
export function classifyWeaverGrade(avgStrength: number): SilverThreadResult['stats']['weaverGrade'] {
  if (avgStrength >= 80) return 'master-weaver'
  if (avgStrength >= 65) return 'artisan'
  if (avgStrength >= 50) return 'journeyman'
  if (avgStrength >= 35) return 'apprentice'
  if (avgStrength >= 20) return 'novice'
  return 'clumsy'
}

// ─── generateRecommendations ──────────────────────────

/** @example generateRecommendations(samples, patterns, loom, stats) returns string[] */
export function generateRecommendations(
  samples: ThreadSample[],
  patterns: WeavePattern[],
  loom: SilverThreadResult['loom'],
  stats: SilverThreadResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgThreadStrength < 50) recs.push('Strengthen thread bonds — add interfaces and types for proper code coherence')
  if (stats.avgWeaveQuality < 50) recs.push('Tighten weave — improve code integration with proper exports and imports')
  if (stats.avgPatternIntegrity < 50) recs.push('Restore pattern integrity — maintain consistent coding patterns throughout')
  if (stats.avgMetallicLuster < 50) recs.push('Polish the surface — add documentation and remove code tarnish')
  if (stats.avgContinuity < 50) recs.push('Restore continuity — ensure smooth code flow without interruptions')
  if (stats.avgTensileQuality < 50) recs.push('Improve tensile quality — build durable code with proper error handling')
  if (stats.dustCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of samples are dust — consider major refactoring')
  if (stats.frayedEndCount > 0) recs.push('Warning: frayed ends detected — these files need thread restoration')
  if (loom.overallStrength < 40) recs.push('Overall thread strength is critical — establish a weaving recovery plan')
  if (patterns.length > 0 && patterns.every((p) => p.condition === 'dust')) recs.push('All patterns are dust — your codebase needs fundamental revitalization')

  if (samples.length > 0) {
    const brittle = samples.filter((sp) => sp.strength.weakLinkCount > 2)
    if (brittle.length > samples.length * 0.5) recs.push('Over 50% of samples have weak links — reduce any/eval usage')
  }

  return recs
}

// ─── buildSilverThreadResult ──────────────────────────

/** @example buildSilverThreadResult(files, contents) returns full result */
export function buildSilverThreadResult(files: string[], contents: string[]): SilverThreadResult {
  const samples = files.map((file, i) => analyzeThreadSample(contents[i] ?? '', file))

  const patternMap = new Map<string, ThreadSample[]>()
  samples.forEach((sample) => {
    const parts = sample.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = patternMap.get(dir)
    if (existing) existing.push(sample)
    else patternMap.set(dir, [sample])
  })

  const patterns = Array.from(patternMap.entries()).map(([dir, ss]) => analyzeWeavePattern(ss, dir))

  const avgThreadStrength = samples.length > 0 ? Math.round(samples.reduce((s, sp) => s + sp.threadStrength, 0) / samples.length) : 0
  const avgWeaveQuality = samples.length > 0 ? Math.round(samples.reduce((s, sp) => s + sp.weaveQuality, 0) / samples.length) : 0
  const avgPatternIntegrity = samples.length > 0 ? Math.round(samples.reduce((s, sp) => s + sp.patternIntegrity, 0) / samples.length) : 0
  const avgMetallicLuster = samples.length > 0 ? Math.round(samples.reduce((s, sp) => s + sp.metallicLuster, 0) / samples.length) : 0
  const avgContinuity = samples.length > 0 ? Math.round(samples.reduce((s, sp) => s + sp.continuity, 0) / samples.length) : 0
  const avgTensileQuality = samples.length > 0 ? Math.round(samples.reduce((s, sp) => s + sp.tensileQuality, 0) / samples.length) : 0

  const overallStrength = Math.round(
    avgThreadStrength * 0.15 +
    avgWeaveQuality * 0.15 +
    avgPatternIntegrity * 0.2 +
    avgMetallicLuster * 0.15 +
    avgContinuity * 0.2 +
    avgTensileQuality * 0.15,
  )

  const loom = {
    avgStrength: avgThreadStrength,
    avgWeave: avgWeaveQuality,
    avgTensile: avgTensileQuality,
    isStrong: overallStrength >= 60,
    overallStrength,
  }

  const stats = {
    totalFiles: files.length,
    totalPatterns: patterns.length,
    avgThreadStrength,
    avgWeaveQuality,
    avgPatternIntegrity,
    avgMetallicLuster,
    avgContinuity,
    avgTensileQuality,
    masterpieceThreadCount: samples.filter((sp) => sp.condition === 'masterpiece-thread').length,
    nobleCordCount: samples.filter((sp) => sp.condition === 'noble-cord').length,
    reliableYarnCount: samples.filter((sp) => sp.condition === 'reliable-yarn').length,
    wornThreadCount: samples.filter((sp) => sp.condition === 'worn-thread').length,
    frayedEndCount: samples.filter((sp) => sp.condition === 'frayed-end').length,
    dustCount: samples.filter((sp) => sp.condition === 'dust').length,
    hasHighStrengthCount: samples.filter((sp) => sp.strength.hasHighLevel).length,
    hasHighWeaveCount: samples.filter((sp) => sp.weave.hasHighQuality).length,
    hasHighIntegrityCount: samples.filter((sp) => sp.integrity.hasHighLevel).length,
    hasHighLusterCount: samples.filter((sp) => sp.luster.hasHighLevel).length,
    hasHighContinuityCount: samples.filter((sp) => sp.flow.hasHighLevel).length,
    hasHighTensileCount: samples.filter((sp) => sp.tensile.hasHighQuality).length,
    overallStrength,
    weaverGrade: classifyWeaverGrade(overallStrength),
    bestSample: '',
    strongest: '',
    bestWoven: '',
    mostConsistent: '',
    mostPolished: '',
    mostDurable: '',
  }

  if (samples.length > 0) {
    stats.bestSample = samples.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.strongest = samples.reduce((a, b) => a.threadStrength >= b.threadStrength ? a : b).file
    stats.bestWoven = samples.reduce((a, b) => a.weaveQuality >= b.weaveQuality ? a : b).file
    stats.mostConsistent = samples.reduce((a, b) => a.patternIntegrity >= b.patternIntegrity ? a : b).file
    stats.mostPolished = samples.reduce((a, b) => a.metallicLuster >= b.metallicLuster ? a : b).file
    stats.mostDurable = samples.reduce((a, b) => a.tensileQuality >= b.tensileQuality ? a : b).file
  }

  const recommendations = generateRecommendations(samples, patterns, loom, stats)

  return { samples, patterns, loom, stats, recommendations }
}
